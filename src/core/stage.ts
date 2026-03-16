import { CSS_CLASSES } from "../constants/css-classes";
import { DATA } from "../constants/data-attrs";
import { EVENTS } from "../constants/events-list";
import type { CarouselConfig } from "../types/carousel.types";
import type { CarouselEvents } from "../types/event.types";
import { error } from "../utils/error-handler";
import type { Config } from "./config";
import type { Events } from "./events";

export default class Stage {
    #config!: CarouselConfig;
    #configClass!: Config;
    #events!: Events;

    #container!: HTMLDivElement;
    #containerWidth: number = 0;
    #containerHeight: number = 0;
    #stage: HTMLDivElement | null = null;
    #slides: HTMLDivElement[] = [];
    #slidesHeights: number[] = [];
    #resizeThrottled: boolean = false;
    #resizeObserver: ResizeObserver | null = null;

    originalClasses: string = "";
    slidesActive: number[] = [];
    currentTranslate: number = 0;
    currentPage: number = 0;
    totalPages: number = 0;

    constructor(config: Config, events: Events) {
        this.#configClass = config;
        this.#config = config.current;
        this.#events = events;

        const targetContainer = document.querySelector<HTMLDivElement>(this.#config.container);
        if (targetContainer != null) {
            this.#container = targetContainer;
        } else {
            throw error("Invalid container!");
        }

        this.initialize();
    }

    initialize() {
        this.currentPage = 0;
        this.totalPages = 0;
        this.currentTranslate = 0;

        this.#create();
        //todo confirm if stage is created
        this.#update();
        this.#changePage(this.#config.startPage > 0 ? this.#config.startPage : 0, false);

        this.#events.emit(EVENTS.STAGE_CREATED);

        this.#events.on(EVENTS.PAGE_CHANGE_REQUEST, this.#onPageChangeRequest);
        this.#events.on(EVENTS.PAGE_CHANGE, this.#onPageChange);

        this.#resizeObserver = new ResizeObserver(() => this.#resizeEvent());
        this.#resizeObserver.observe(this.#container);

        if (this.#config.keyboardNavigation)
            window.addEventListener("keydown", this.#keyboardHandler);

        //this.#container.addEventListener("resize", this.#resizeEvent);
    }

    #create() {
        if (this.#container == null)
            throw error("Container not found!");

        const stateContainer = document.createElement("div"),
            stageDiv = document.createElement("div"),
            slidesSource = this.#container.querySelectorAll<HTMLDivElement>(`:scope > div`); //get all slides from user

        stateContainer.classList.add(CSS_CLASSES.container);
        stageDiv.classList.add(CSS_CLASSES.stage);

        //add the stage to the main container
        this.#container?.appendChild(stateContainer);
        stateContainer.appendChild(stageDiv);

        //get stage DOM
        const stage = this.#container.querySelector<HTMLDivElement>(`.${CSS_CLASSES.stage}`);
        if (stage == null)
            throw error("Invalid stage element");

        this.#stage = stage;

        if (slidesSource.length == 0) {
            throw error(`No content found in container. Destroying carousel...`);
            //destroy(); //todo
            return;
        }

        this.#slides = [];
        //set parameters to slides and add them in the new ddcarousel-item container with some params
        for (let i = 0; i < slidesSource.length; i++) {
            const slide = document.createElement("div"),
                source = slidesSource[i];

            if (source === undefined)
                continue;

            slide.classList.add(CSS_CLASSES.item);
            slide.dataset[DATA.dataset.slide] = i.toString();
            slide.appendChild(source);
            stageDiv.appendChild(slide);
            // ... create url nav
            this.#slides.push(slide);
        }
    }

    #update() {
        if (this.#slides == null || this.#stage == null)
            return;

        const firstSlide = this.#slides[0];
        if (firstSlide === undefined)
            return;

        const slideWidth = firstSlide.style.width,
            containerStyle = window.getComputedStyle(this.#container);

        if (this.#config.fullWidth && !this.#config.verticalMaxContentWidth)
            this.#container.classList.add(CSS_CLASSES.fullWidth);
        else
            this.#container.classList.remove(CSS_CLASSES.fullWidth);

        if (this.#config.vertical) {
            this.#container.classList.add(CSS_CLASSES.vertical);
            this.#configClass.updateSettings({
                autoHeight: false
            });
        }
        else {
            this.#container.classList.remove(CSS_CLASSES.vertical);
        }

        this.#containerWidth = parseInt(containerStyle.width);
        this.#containerHeight = parseInt(containerStyle.height);

        if (this.#slides.length <= this.#config.items)
            this.#config.items = this.#slides.length;

        this.#calculateTotalPages();

        if (!this.#config.vertical)
            this.#stage.style.width = (this.#containerWidth * this.#slides.length) + "px";

        if (this.#config.verticalMaxContentWidth) {
            let maxWidth = 0,
                elWidth;

            this.#slides.forEach(el => {
                elWidth = el.getBoundingClientRect().width;
                if (elWidth > maxWidth)
                    maxWidth = elWidth;
            });
            this.#container.style.width = maxWidth + "px";
        }

        this.#slidesHeights = this.#getSlidesHeights();

        if (this.#config.autoHeight) {
            //this.#setActiveSlides();
            this.#updateContainerHeight();
        }

        if (slideWidth != firstSlide.style.width)
            this.#events.emit(EVENTS.STAGE_RESIZED);
    }

    #calculateTotalPages() {
        if (this.#slides == null)
            return;

        let pages;

        if (this.#config.centerSlide)
            pages = this.#slides.length - 1
        else if (this.#config.itemPerPage)
            pages = this.#slides.length - this.#config.items
        else
            pages = Math.ceil(this.#slides.length / this.#config.items) - 1;

        this.totalPages = pages;
    }

    getSlidesCount = () => this.#slides?.length;

    getSlides = (): HTMLDivElement[] => Object.assign({}, this.#slides);

    #getSlidesHeights(): number[] {
        if (this.#slides == null)
            return [];

        const slidesHeights = [];

        for (var i = 0; i < this.#slides.length; i++) {
            const slide = this.#slides[i];
            if (slide === undefined) {
                console.warn(`Slide ${i} is undefined and won't be processed!`);
                continue;
            }

            this.#updateSlideDimensions(slide);

            const slideCurrent = this.#container.querySelector<HTMLDivElement>(`[${DATA.attrs.slide}="${i}"] > div`);
            if (slideCurrent === null) {
                console.warn(`Slide ${i} was not found and height won't be calculated!`);
                continue;
            }

            const slideHeight = this.#getOuterHeight(slideCurrent);
            slidesHeights.push(slideHeight);
        }

        return slidesHeights;
    }

    #updateSlideDimensions(slide: HTMLDivElement) {
        const items = this.#config.items;
        if (items != 0) {
            if (this.#config.vertical) {
                slide.style.height = this.#containerHeight / items + "px";
            } else if (!this.#config.vertical) {
                slide.style.width = this.#containerWidth / items + "px";
            }
        } else {
            var slideBounds = slide.getBoundingClientRect();
            slide.style.width = slideBounds.width + "px";
        }
    }

    #getOuterHeight(el: HTMLDivElement) {
        var height = el.offsetHeight,
            style = getComputedStyle(el);

        height += parseInt(style.marginTop) + parseInt(style.marginBottom);
        return height;
    }

    #setActiveSlides() {
        if (this.slidesActive != null)
            this.slidesActive.forEach(i => this.#container.querySelector(`[${DATA.attrs.slide}="${i}"]`)?.classList.remove("active"));

        this.slidesActive = [];
        const slideIndex = this.currentPage * (this.#config.items > 0 ? this.#config.items : 1),
            slidesLength = this.#slides.length;

        if (this.#config.centerSlide) {
            this.slidesActive.push(this.currentPage);
        } else if (this.#config.itemPerPage) {
            for (let i = this.currentPage; i < this.currentPage + this.#config.items; i++) {
                this.slidesActive.push(i);
            }
        } else {
            if (slideIndex + this.#config.items > slidesLength) {
                for (let i = slidesLength - this.#config.items; i < slidesLength; i++) {
                    this.slidesActive.push(i);
                }
            } else {
                if (this.#config.items == 0) {
                    this.slidesActive.push(slideIndex);
                } else {
                    for (let i = slideIndex; i < slideIndex + this.#config.items; i++) {
                        if (i < slidesLength) {
                            this.slidesActive.push(i);
                        }
                    }
                }
            }
        }

        this.slidesActive.forEach(i => this.#container.querySelector(`[${DATA.attrs.slide}="${i}"]`)?.classList.add("active"));
    }

    #updateContainerHeight() {
        if (this.#slidesHeights == null)
            return;

        if (this.#config.items == 1) {
            this.#container.style.height = this.#slidesHeights[this.currentPage] + "px";
        } else {
            const heights = [];

            const startSlide = this.slidesActive[0];
            if (startSlide === undefined)
                return;

            const slidesLength = this.slidesActive[this.slidesActive.length - 1];
            if (slidesLength === undefined)
                return;

            //get specified slides from global array with heights and then get the highest of it
            for (let i = startSlide; i <= slidesLength; i++) {
                const slide = this.#slidesHeights[i];
                if (slide === undefined) {
                    console.warn(`Slide height of id ${i} not found!`);
                    continue;
                }
                heights.push(slide);
            }

            this.#container.style.height = Math.max(...heights) + "px";
        }
    }

    #onPageChange = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGE]) => this.#changePage(e.currentPage);

    #onPageChangeRequest = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGE_REQUEST]) => this.#changePage(e.index);

    #changePage(index: number | string, enableAnim = true) {
        if (this.#stage == null)
            return;

        let origPage = this.currentPage;

        if (!enableAnim) {
            this.#stage.style.transitionDuration = "0s";
            this.#events.emit(EVENTS.TRANSITION_END);
            // orig: this.#stage.addEventListener("transitionend", () => this.#stage.style.transitionDuration = this.#config.slideChangeDuration + "0s");
        } else {
            this.#stage.style.transitionDuration = this.#config.slideChangeDuration + "s";
        }

        //change slide based on parameter
        if (index == "prev" && this.currentPage != 0) {
            this.currentPage--;
        } else if (index == "next" && this.currentPage < this.totalPages) {
            this.currentPage++;
        } else {
            //} else if (Number.isInteger(index) && index > -1 && index <= this.totalPages) {
            const number = parseInt(String(index), 10);
            if (number > -1 && number <= this.totalPages)
                this.currentPage = number;
        }

        //update frontend
        this.#setActiveSlides();
        this.#scrollToSlide();

        //change stage height if this options is enabled
        if (this.#config.autoHeight)
            this.#updateContainerHeight();

        //fire change trigger
        if (origPage != this.currentPage) {
            this.#events.emit(EVENTS.PAGE_CHANGE, {
                currentPage: this.currentPage
            });
        }
    }

    #getFirstSlideStyle = () => {
        if (this.#slides == null)
            return;

        const slide = this.#slides[0];
        if (slide === undefined) {
            console.warn("Can't get slide style!");
            return;
        }
        return slide.style;
    }

    #getCurrentSlideDom = () => this.#container.querySelector<HTMLDivElement>(`[${DATA.attrs.slide}].active`);


    #scrollToSlide(slide?: HTMLDivElement) {
        const currentSlide = this.#getCurrentSlideDom();
        if (currentSlide === null)
            throw error(`Scrolling to slide failed! Can't find current slide in DOM!`);

        if (this.#config.centerSlide && this.#config.items > 0) {
            const slideStyle = this.#getFirstSlideStyle();
            if (slideStyle === undefined)
                throw error(`Scrolling to slide failed! Slide style was not found!`);

            const output =
                -this.#getSlidePos(currentSlide) -
                -(parseInt(slideStyle.width) * Math.floor(this.#config.items / 2));

            this.currentTranslate = output;
            this.#scrollToPos(output);
        } else {
            this.currentTranslate = -this.#getSlidePos(slide ?? currentSlide);
            this.#scrollToPos(this.currentTranslate);
        }
    }

    #getSlidePos(slide: HTMLDivElement) {
        if (!this.#stage)
            throw error("Stage not found!");

        const stageRect = this.#stage.getBoundingClientRect(),
            slideRect = slide.getBoundingClientRect();

        return this.#config.vertical
            ? slideRect.top - stageRect.top
            : slideRect.left - stageRect.left;
    }

    #scrollToPos(int: number) {
        if (this.#stage == null)
            return;

        const output = this.#config.vertical ? `translateY(${int}px)` : `translateX(${int}px)`;
        this.#stage.style.transform = output;
    }

    #resizeEvent = () => {
        if (this.#resizeThrottled)
            return;

        this.#resizeThrottled = true;

        setTimeout(() => {
            this.#update();
            this.#resizeThrottled = false;
        }, this.#config.resizeRefresh);
    }

    #keyboardHandler = (e: KeyboardEvent) => {
        const activeDocument = document.activeElement;
        if (activeDocument === null)
            return;

        // don't trigger while typing
        if (activeDocument.tagName === 'INPUT' || activeDocument.tagName === 'TEXTAREA')
            return;

        let page;
        switch (e.key) {
            case "ArrowLeft":
            case "ArrowUp":
                page = this.currentPage - 1;
                e.preventDefault();
                break;
            case "ArrowRight":
            case "ArrowDown":
                page = this.currentPage + 1;
                e.preventDefault();
                break;
        }

        this.#events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: page });
    }
}
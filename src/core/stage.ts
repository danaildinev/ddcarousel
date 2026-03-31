import { CSS_CLASSES } from "../constants/css-classes";
import { DATA } from "../constants/data-attrs";
import { EVENTS } from "../constants/events-list";
import type { CarouselConfig } from "../types/carousel.types";
import type { CarouselEvents } from "../types/event.types";
import { error } from "../utils/error-handler";
import { scrollToPos } from "../utils/scroll";
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

    #originalClasses: string = "";
    slidesActive: number[] = [];
    currentTranslate: number = 0;
    currentPage: number = -1;
    totalPages: number = 0;

    constructor(config: Config, events: Events) {
        this.#configClass = config;
        this.#config = config.current;
        this.#events = events;

        const targetContainer = document.querySelector<HTMLDivElement>(this.#config.container);
        if (targetContainer != null) {
            this.#container = targetContainer;
            this.#originalClasses = this.#container.className;
        } else {
            throw error("Invalid container!");
        }

        this.initialize();
    }

    initialize() {
        const events = this.#events;

        this.currentPage = 0;
        this.totalPages = 0;
        this.currentTranslate = 0;

        this.#create();
        //todo confirm if stage is created
        this.#update();
        events.emit(EVENTS.STAGE_CREATED);

        events.on(EVENTS.SLIDE_SCROLL, this.#onSlideScroll);
        events.on(EVENTS.PAGE_CHANGE_REQUEST, this.#onPageChangeRequest);
        events.emit(EVENTS.PAGE_CHANGE_REQUEST, {
            index: this.#config.startPage > 0 ? this.#config.startPage : 0,
            animate: false
        });

        this.#resizeObserver = new ResizeObserver(() => this.#resizeEvent());
        this.#resizeObserver.observe(this.#container);

        if (this.#config.keyboardNavigation)
            window.addEventListener("keydown", this.#keyboardHandler);
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

        this.#stage.addEventListener("transitionend", this.#onStageTransitionEnd);
    }

    destroy(restoreSlides: boolean) {
        this.restoreOriginalSlides(restoreSlides);
        if (this.#stage !== null) {
            this.#stage.removeEventListener("transitionend", this.#onStageTransitionEnd);
            this.#stage.remove();
        }

        this.currentPage = 0;
        this.totalPages = 0;
        this.#slides = [];
        this.slidesActive = [];
        this.currentTranslate = 0;
        this.#originalClasses = "";

        this.#containerWidth = 0;
        this.#containerHeight = 0;
        this.#stage = null;
        this.#slides = [];
        this.#slidesHeights = [];
        this.#resizeThrottled = false;

        window.removeEventListener("keydown", this.#keyboardHandler);
        this.#events.off(EVENTS.PAGE_CHANGE_REQUEST, this.#onPageChange);
        this.#events.off(EVENTS.PAGE_CHANGE, this.#onPageChange);
        this.#resizeObserver?.disconnect();
    }

    restoreOriginalSlides(restoreSlides: boolean) {
        const origContainer = document.querySelector(this.#config.container);
        if (origContainer == null)
            return;

        this.#container.querySelector(`.${CSS_CLASSES.container}`)?.remove();
        origContainer.className = this.#originalClasses;

        if (restoreSlides) {
            this.#slides.forEach(el => {
                const slideContent = el.firstChild;
                if (slideContent != null)
                    origContainer.appendChild(slideContent);
            });
        }
    }

    #update() {
        if (this.#slides == null || this.#stage == null)
            return;

        const firstSlide = this.#slides[0];
        if (firstSlide === undefined)
            return;

        const slideWidth = firstSlide.style.width,
            containerStyle = window.getComputedStyle(this.#container),
            container = this.#container,
            slides = this.#slides,
            config = this.#config;

        // full width?
        container.classList.toggle(CSS_CLASSES.fullWidth, config.fullWidth && !config.verticalMaxContentWidth);

        if (config.vertical) {
            container.classList.add(CSS_CLASSES.vertical);
            this.#configClass.updateSettings({
                autoHeight: false
            });
        }
        else {
            container.classList.remove(CSS_CLASSES.vertical);
        }

        this.#containerWidth = parseInt(containerStyle.width);
        this.#containerHeight = parseInt(containerStyle.height);

        if (slides.length <= config.items)
            config.items = slides.length;

        this.#calculateTotalPages();

        if (!config.vertical)
            this.#stage.style.width = `${this.#containerWidth * slides.length}px`;

        if (config.verticalMaxContentWidth) {
            let maxWidth = 0,
                elWidth;

            slides.forEach(el => {
                elWidth = el.getBoundingClientRect().width;
                if (elWidth > maxWidth)
                    maxWidth = elWidth;
            });
            container.style.width = maxWidth + "px";
        }

        this.#slidesHeights = this.#getSlidesHeights();

        if (config.autoHeight) {
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
        const config = this.#config,
            slideIndex = this.currentPage * (config.items > 0 ? config.items : 1),
            slidesLength = this.#slides.length;

        if (config.centerSlide) {
            this.slidesActive.push(this.currentPage);
        } else if (config.itemPerPage) {
            for (let i = this.currentPage; i < this.currentPage + config.items; i++) {
                this.slidesActive.push(i);
            }
        } else {
            if (slideIndex + config.items > slidesLength) {
                for (let i = slidesLength - config.items; i < slidesLength; i++) {
                    this.slidesActive.push(i);
                }
            } else {
                if (config.items == 0) {
                    this.slidesActive.push(slideIndex);
                } else {
                    for (let i = slideIndex; i < slideIndex + config.items; i++) {
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

    #onStageTransitionEnd = () => this.#events.emit(EVENTS.TRANSITION_END);

    #onPageChange = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGE]) => this.#changePage(e.currentPage);

    #onPageChangeRequest = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGE_REQUEST]) => {
        const index = this.#processRequestPageIndex(e.index);

        if (e.force) {
            this.#changePage(index, e.animate)
            return;
        }

        if (index >= 0 && index <= this.totalPages)
            this.#changePage(index, e.animate)
    };

    #processRequestPageIndex(index: number | string): number {
        const payload = {
            request: index,
            page: this.currentPage,
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            handled: false,
            priority: -1
        };

        // allow modules to intercept and try to override the requested page
        this.#events.emit(EVENTS.PAGE_CHANGE_INDEX, payload);

        // if no module handles this request, then fallback to default logic
        if (!payload.handled) {
            if (index === "prev" && this.currentPage > 0) {
                payload.page = this.currentPage - 1;
            } else if (index === "next" && this.currentPage < this.totalPages) {
                payload.page = this.currentPage + 1;
            } else {
                const number = parseInt(String(index), 10);
                if (number > -1 && number <= this.totalPages) {
                    payload.page = number;
                }
            }
        }

        return payload.page;
    }

    #changePage(index: number, enableAnim = true) {
        if (this.#stage == null)
            return;

        let origPage = this.currentPage;
        const config = this.#config;

        if (!enableAnim) {
            this.#stage.style.transitionDuration = "0s";
        } else {
            this.#stage.style.transitionDuration = config.slideChangeDuration + "s";
        }

        const isForward = (index > this.currentPage ||
            (index === 0 && this.currentPage === this.totalPages)) &&
            !(index === this.totalPages && this.currentPage === 0);

        this.currentPage = index;

        //update frontend
        this.#setActiveSlides();

        const scrollStatus = {
            currentPage: this.currentPage,
            slidesCount: this.getSlidesCount(),
            currentTranslate: this.currentTranslate,
            activeSlides: this.slidesActive,
            isForward: isForward
        };

        this.#events.emit(EVENTS.PAGE_CHANGE_SCROLL_BEFORE, scrollStatus);

        this.#scrollToSlide(this.#getSlideDom(), enableAnim);

        scrollStatus.currentTranslate = this.currentTranslate;
        this.#events.emit(EVENTS.PAGE_CHANGE_SCROLL_AFTER, scrollStatus);

        //change stage height if this options is enabled
        if (config.autoHeight)
            this.#updateContainerHeight();

        //fire change trigger
        if (origPage != this.currentPage) {
            this.#events.emit(EVENTS.PAGE_CHANGE, {
                currentPage: this.currentPage,
                currentTranslate: this.currentTranslate,
                slidesActive: this.slidesActive
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

    #getSlideDom = (index = -1): HTMLDivElement | null => {
        const attr = DATA.attrs.slide;
        let selector = index > -1 ? `[${attr}='${index}']` : `[${attr}].active`;
        return this.#container.querySelector<HTMLDivElement>(selector);
    }

    #onSlideScroll = (e: CarouselEvents[typeof EVENTS.SLIDE_SCROLL]) => this.#scrollToSlide(e.slide, e.animate, e.specifiedPosition);

    #scrollToSlide(slide?: HTMLDivElement | null, animate: boolean = true, specifiedPosition: number | null = null) {
        if (this.#stage === null)
            return;

        const currentSlide = this.#getSlideDom(),
            err = "Scrolling to slide failed!",
            config = this.#config;

        if (currentSlide === null)
            throw error(err + "Current slide was not found!");

        let position: number;

        if (specifiedPosition !== null) {
            position = specifiedPosition
        } else {
            if (config.centerSlide && config.items > 0) {
                const slideStyle = this.#getFirstSlideStyle();
                if (slideStyle === undefined)
                    throw error(err + "Slide style was not found!");

                position =
                    -this.#getSlidePos(currentSlide) -
                    -(parseInt(slideStyle.width) * Math.floor(config.items / 2));
            } else {
                position = -this.#getSlidePos(slide ?? currentSlide);
            }
        }

        this.currentTranslate = position;

        if (!animate) {
            this.#stage.style.transitionDuration = "0s";
            scrollToPos(this.#stage, this.currentTranslate, config.vertical);
            this.#stage.offsetHeight;  // force reflow
            this.#stage.style.transitionDuration = this.#config.slideChangeDuration + "s";
            return;
        }

        scrollToPos(this.#stage, this.currentTranslate, config.vertical);
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

    #resizeEvent = () => {
        if (this.#resizeThrottled)
            return;

        this.#resizeThrottled = true;

        setTimeout(() => {
            this.#update();

            const slide = this.#getSlideDom();
            if (slide != null)
                this.#scrollToSlide(slide);

            const containerWidth = this.#container.getBoundingClientRect().width;
            this.#configClass.refreshResponsive(containerWidth);

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
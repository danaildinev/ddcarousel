import { CSS_CLASSES } from "../constants/css-classes";
import { DATA_ATTRS, DATA_SET } from "../constants/data-attrs";
import { EVENTS } from "../constants/events-list";
import type { CarouselConfig } from "../types/carousel.types";
import type { CarouselEvents } from "../types/event.types";
import type { Config } from "./config";
import type { Events } from "./events";

export default class Stage {
    #config!: CarouselConfig;
    #events!: Events;

    #container!: HTMLDivElement;
    #containerName!: string;
    #stage: HTMLDivElement | null = null;
    #slides: HTMLDivElement[] = [];
    #slidesHeights: number[] = [];

    originalClasses: string = "";
    slidesActive: number[] = [];
    currentTranslate: number = 0;
    currentPage: number = 0;
    totalPages: number = 0;

    constructor(config: Config, events: Events) {
        this.#config = config.config;
        this.#events = events;

        const targetContainer = document.querySelector<HTMLDivElement>(this.#config.container);
        if (targetContainer != null) {
            this.#container = targetContainer;
            this.#containerName = this.#config.container;
        } else {
            throw Error("Invalid container!");
        }

        this.initialize();
    }

    initialize() {
        this.currentPage = 0;
        this.totalPages = 0;
        this.currentTranslate = 0;

        this.#createStage();
        //todo confirm if stage is created
        this.#calculateStage();

        this.#changePage(this.#config.startPage > 0 ? this.#config.startPage : 0, false);

        this.#events.on(EVENTS.PAGE_CHANGE, this.#onPageChange);
        //todo add stage resize event to recalculate and etc...

        //add new stage init/created event?
    }

    #createStage() {
        const stateContainer = document.createElement("div"),
            stageDiv = document.createElement("div"),
            slidesSource = document.querySelectorAll<HTMLDivElement>(`${this.#containerName} > div`); //get all slides from user

        stateContainer.classList.add(CSS_CLASSES.container);
        stageDiv.classList.add(CSS_CLASSES.stage);

        //add the stage to the main container
        this.#container?.appendChild(stateContainer);
        stateContainer.appendChild(stageDiv);

        //get stage DOM
        const stage = this.#container.querySelector<HTMLDivElement>(`.${CSS_CLASSES.stage}`);
        if (stage == null)
            throw Error("Invalid stage element");

        this.#stage = stage;

        if (slidesSource.length == 0) {
            throw Error(`No content found in container. Destroying carousel...`);
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
            slide.dataset[DATA_SET.slide] = i.toString();
            slide.appendChild(source);
            stageDiv.appendChild(slide);
            // ... create url nav
            this.#slides.push(slide);
        }
    }

    #calculateStage() {
        if (this.#stage == null)
            return;

        const firstSlide = this.#slides[0];
        if (firstSlide === undefined)
            return;

        let containerWidth, containerHeight;
        const slideWidth = firstSlide.style.width,
            containerStyle = window.getComputedStyle(this.#container);

        if (this.#config.fullWidth && !this.#config.verticalMaxContentWidth)
            this.#container.classList.add(CSS_CLASSES.fullWidth);
        else
            this.#container.classList.remove(CSS_CLASSES.fullWidth);

        if (this.#config.vertical) {
            this.#container.classList.add(CSS_CLASSES.vertical);
        }
        else {
            this.#container.classList.remove(CSS_CLASSES.vertical);
        }

        containerWidth = parseInt(containerStyle.width);
        containerHeight = parseInt(containerStyle.height);

        if (this.#slides.length <= this.#config.items)
            this.#config.items = this.#slides.length;

        if (this.#config.centerSlide) {
            this.totalPages = this.#slides.length - 1
        } else if (this.#config.itemPerPage) {
            this.totalPages = this.#slides.length - this.#config.items
        } else {
            this.totalPages = Math.ceil(this.#slides.length / this.#config.items) - 1;
        }

        let width = 0;
        for (var i = 0; i < this.#slides.length; i++) {
            const slide = this.#slides[i];
            if (slide === undefined) {
                console.warn(`Slide ${i} is undefined and won't be processed!`);
                continue;
            }

            //set current slide size
            if (this.#config.items != 0) {
                if (this.#config.vertical) {
                    slide.style.height = containerHeight / this.#config.items + "px";
                } else if (!this.#config.vertical) {
                    slide.style.width = containerWidth / this.#config.items + "px";
                }
            } else {
                var w = slide.getBoundingClientRect();
                slide.style.width = w.width + "px";
                width += w.width;
            }

            const slideDom = document.querySelector<HTMLDivElement>(`${this.#containerName} [${DATA_ATTRS.slide}="${i}"] > div`);
            if (slideDom === null) {
                console.warn(`Slide ${i} was not found and height won't be calculated!`);
                continue;
            }

            this.#slidesHeights.push(
                this.#getOuterHeight(slideDom)
            );
        }

        if (!this.#config.vertical) {
            this.#stage.style.width = this.#config.items == 0 ? (width + "px") : ((containerWidth * this.#slides.length) + "px");
        }

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

        if (this.#config.autoHeight) {
            this.#setActiveSlides();
            this.#calculatecontainerHeight();
        }

        if (slideWidth != firstSlide.style.width)
            this.#events.emit(EVENTS.STAGE_RESIZED);
    }

    getSlidesCount = () => this.#slides?.length;


    #getOuterHeight(el: HTMLDivElement) {
        var height = el.offsetHeight,
            style = getComputedStyle(el);

        height += parseInt(style.marginTop) + parseInt(style.marginBottom);
        return height;
    }

    #setActiveSlides() {
        if (this.slidesActive != null)
            this.slidesActive.forEach(i => document.querySelector(`${this.#containerName} [${DATA_ATTRS.slide}="${i}"]`)?.classList.remove("active"));

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

        this.slidesActive.forEach(i => document.querySelector(`${this.#containerName} [${DATA_ATTRS.slide}="${i}"]`)?.classList.add("active"));
    }

    #calculatecontainerHeight() {
        if (this.#slidesHeights == null)
            return;

        if (this.#config.items == 1) {
            this.#container.style.height = this.#slidesHeights[this.currentPage] + "px";
        } else {
            let heights = [];

            const startSlide = this.slidesActive[0];
            if (startSlide === undefined)
                return;

            const slidesLength = this.slidesActive[this.slidesActive.length - 1];
            if (slidesLength === undefined)
                return;

            //get specified slides from global array with heights and then get the highest of it
            for (var i = startSlide; i <= slidesLength; i++) {
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

    #onPageChange = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGE]) => this.#changePage(e.index);

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
        if (index == "prev") {
            if (this.currentPage != 0) {
                this.currentPage--;
            }
        } else if (index == "next") {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        } else {
            //if (Number.isInteger(index) && index > -1 && index <= totalPages) {
            const number = parseInt(String(index), 10);
            if (number > -1 && number <= this.totalPages)
                this.currentPage = number;
        }

        //update frontend
        this.#setActiveSlides();
        this.#updateSlide();

        //fire change trigger
        if (origPage != this.currentPage) {
            this.#events.emit(EVENTS.PAGE_CHANGE, {
                currentPage: this.currentPage
            });
        }
    }

    #getCurrentSlideDom = () => this.#container.querySelector<HTMLDivElement>(`[${DATA_ATTRS.slide}].active`);

    #updateSlide() {
        const currentSlide = this.#getCurrentSlideDom();
        if (currentSlide === null)
            throw Error(`Scrolling to slide failed! Can't find current slide in DOM!`);

        if (this.#config.centerSlide && this.#config.items > 0) {
            const slide = this.#slides[0];
            if (slide === undefined) {
                console.warn("Can't get slide style!");
                return;
            }

            var output =
                -this.#getSlidePos(currentSlide) -
                -(parseInt(slide.style.width) * Math.floor(this.#config.items / 2));

            this.currentTranslate = output;
            this.#scrollToPos(output);
        } else {
            this.#scrollToSlide(currentSlide);
        }
    }

    #scrollToSlide(slide: HTMLDivElement) {
        this.currentTranslate = -this.#getSlidePos(slide);
        this.#scrollToPos(this.currentTranslate);
    }

    #getSlidePos(slide: HTMLDivElement) {
        if (!this.#stage)
            throw new Error("Stage not found!");

        return this.#config.vertical ?
            slide.getBoundingClientRect().top - this.#stage.getBoundingClientRect().top :
            slide.getBoundingClientRect().left - this.#stage.getBoundingClientRect().left;
    }

    #scrollToPos(int: number) {
        if (this.#stage == null)
            return;

        const output = this.#config.vertical ? `translateY(${int}px)` : `translateX(${int}px)`;
        this.#stage.style.transform = output;
    }
}
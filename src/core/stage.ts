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
    #configClass!: Config;
    #events!: Events;

    #container!: HTMLDivElement;
    #containerWidth: number = 0;
    #containerHeight: number = 0;
    #stage: HTMLDivElement | null = null;
    #slides: HTMLDivElement[] = [];
    #slidesHeights: number[] = [];
    #resizeObserver: ResizeObserver | null = null;
    #mutationObserver: MutationObserver | null = null;
    #resizeTimeout?: ReturnType<typeof setTimeout>;

    #originalSlides: string = "";
    #originalClasses: string = "";
    visibleSlides: number[] = [];
    currentTranslate: number = 0;
    currentPage: number = -1;
    totalPages: number = 0;
    slidesByPage: number[][] = [];

    constructor(config: Config, events: Events) {
        this.#configClass = config;
        this.#events = events;

        const targetContainer = typeof this.#config.container === "string" ? document.querySelector<HTMLDivElement>(this.#config.container) : this.#config.container;
        if (!targetContainer) {
            throw error("Invalid container!");
        }
        this.#container = targetContainer;
        this.#originalClasses = this.#container.className;

        this.#originalSlides = this.#container.innerHTML;

        this.initialize();
    }

    get #config(): CarouselConfig {
        return this.#configClass.current;
    }

    initialize() {
        const events = this.#events;

        this.currentPage = 0;
        this.totalPages = 0;
        this.currentTranslate = 0;

        this.#create();

        if (this.#stage === null) {
            throw error("Error creating stage!")
        }

        this.#setInitialDimensions();
        this.#update();

        const callback = (mutationList: MutationRecord[], observer: MutationObserver) => {
            const hasChildChange = mutationList.some(m => m.type === "childList");

            if (hasChildChange) {
                this.#events.emit(EVENTS.STAGE_CHANGED, {
                    log: "childList",
                });
            }
        };

        this.#mutationObserver = new MutationObserver(callback);
        const config = { attributes: false, childList: true };
        this.#mutationObserver.observe(this.#stage, config);

        events.emit(EVENTS.STAGE_CREATED);

        events.on(EVENTS.SLIDE_SCROLL, this.#onSlideScroll);
        events.on(EVENTS.STAGE_RESIZED, this.#onStageResized);
        events.on(EVENTS.PAGE_CHANGE_REQUEST, this.#onPageChangeRequest);
        events.on(EVENTS.CONFIG_APPLIED, this.#onConfigApplied);
        events.emit(EVENTS.PAGE_CHANGE_REQUEST, {
            index: this.#config.startPage > 0 ? this.#config.startPage : 0,
            animate: false
        });

        this.#resizeObserver = new ResizeObserver(() => this.#resizeEvent());
        this.#resizeObserver.observe(this.#container);

        if (this.#config.keyboardNavigation) {
            window.addEventListener("keydown", this.#keyboardHandler);
        }
    }

    #create() {
        if (this.#container == null) {
            throw error("Container not found!");
        }

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
        if (stage == null) {
            throw error("Invalid stage element");
        }

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

            if (source === undefined) {
                continue;
            }

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
        this.visibleSlides = [];
        this.currentTranslate = 0;
        this.#originalClasses = "";
        this.#originalSlides = "";

        this.#containerWidth = 0;
        this.#containerHeight = 0;
        this.#stage = null;
        this.#slidesHeights = [];

        window.removeEventListener("keydown", this.#keyboardHandler);

        this.#events.off(EVENTS.PAGE_CHANGE_REQUEST, this.#onPageChangeRequest);
        this.#events.off(EVENTS.SLIDE_SCROLL, this.#onSlideScroll);
        this.#events.off(EVENTS.STAGE_RESIZED, this.#onStageResized);
        this.#events.off(EVENTS.CONFIG_APPLIED, this.#onConfigApplied);

        this.#mutationObserver?.disconnect();
        this.#resizeObserver?.disconnect();
    }

    restoreOriginalSlides(restoreSlides: boolean) {
        if (!this.#container) {
            return;
        }

        this.#container.querySelector(`.${CSS_CLASSES.container}`)?.remove();
        this.#container.className = this.#originalClasses;

        if (restoreSlides) {
            this.#container.innerHTML = this.#originalSlides;
        }
    }

    #setInitialDimensions() {
        if (this.#config.verticalMaxContentWidth) {
            let maxWidth = 0,
                elWidth;

            this.#slides.forEach(el => {
                elWidth = el.getBoundingClientRect().width;

                if (elWidth > maxWidth)
                    maxWidth = elWidth;
            });

            const maxAvailableWidth = document.body.offsetWidth;
            if (maxWidth > maxAvailableWidth) {
                const carouselRect = this.#container.getBoundingClientRect();
                maxWidth = maxAvailableWidth - carouselRect.left;
            }

            this.#container.style.width = maxWidth + "px";
        }
    }

    #update() {
        if (this.#slides == null || this.#stage == null) {
            return;
        }

        const firstSlide = this.#slides[0];
        if (firstSlide === undefined) {
            return;
        }

        const containerStyle = window.getComputedStyle(this.#container),
            container = this.#container,
            slides = this.#slides,
            config = this.#config;

        // full width?
        container.classList.toggle(CSS_CLASSES.fullWidth, config.fullWidth && !config.verticalMaxContentWidth);

        if (config.vertical) {
            container.classList.add(CSS_CLASSES.vertical);
        }
        else {
            container.classList.remove(CSS_CLASSES.vertical);
        }

        this.#containerWidth = parseInt(containerStyle.width);
        this.#containerHeight = parseInt(containerStyle.height);

        if (slides.length <= config.items) {
            config.items = slides.length;
        }

        this.#calculateTotalPages(); // this may not be needed here

        if (!config.vertical) {
            this.#stage.style.width = `${this.#containerWidth * slides.length}px`;
        }

        this.#slidesHeights = this.#getSlidesHeights();

        if (config.autoHeight) {
            //this.#setActiveSlides();
            this.#updateContainerHeight();
        }
    }

    #calculateTotalPages() {
        if (this.#slides == null) {
            return;
        }

        let pages;
        const slidesByPage = [];
        const slidesLength = this.#slides.length;
        const slidesPerPage = this.#config.items;

        if (this.#config.centerSlide) {
            pages = slidesLength - 1;

            const half = Math.floor(slidesPerPage / 2);

            for (let page = 0; page < slidesLength; page++) {
                const currentVisibleSlides: number[] = [];

                for (let i = -half; i <= half; i++) {
                    currentVisibleSlides.push(page + i);
                }
                slidesByPage.push(currentVisibleSlides);
            }
        }
        else if (this.#config.itemPerPage) {
            pages = slidesLength - slidesPerPage;

            for (let i = 0; i <= pages; i++) {
                const slides = [];

                for (let j = 0; j < slidesPerPage; j++) {
                    slides.push(i + j);
                }

                slidesByPage.push(slides);
            }
        }
        else {
            pages = Math.ceil(slidesLength / slidesPerPage) - 1;

            const slideCount = slidesLength;
            const totalPages = Math.ceil(slideCount / slidesPerPage);

            for (let page = 0; page < totalPages; page++) {
                let start = page * slidesPerPage;

                // shift the last page back so it always contains `items` slides
                if (page === totalPages - 1 && slideCount > slidesPerPage) {
                    start = Math.max(slideCount - slidesPerPage, 0);
                }

                const end = Math.min(start + slidesPerPage, slideCount);

                slidesByPage.push(
                    Array.from({ length: end - start }, (_, i) => start + i)
                );
            }
        }

        this.slidesByPage = slidesByPage;
        this.totalPages = pages;
    }

    getSlidesCount = () => this.#slides?.length;

    getSlides = (): HTMLDivElement[] => [...this.#slides];

    #getSlidesHeights(): number[] {
        if (this.#slides == null) {
            return [];
        }

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
        const { items, gap, vertical } = this.#config;
        if (items != 0) {
            if (vertical) {
                slide.style.height = `${this.#containerHeight / items}px`;
            } else {
                const widthOffset = gap - gap / items;
                slide.style.width = `${this.#containerWidth / items - widthOffset}px`;
                slide.style.marginRight = gap > 0 ? `${gap}px` : "";
            }
        } else {
            var slideBounds = slide.getBoundingClientRect();
            slide.style.width = `${slideBounds.width}px`;
        }
    }

    #getOuterHeight(el: HTMLDivElement) {
        var height = el.offsetHeight,
            style = getComputedStyle(el);

        height += parseInt(style.marginTop) + parseInt(style.marginBottom);
        return height;
    }

    #setVisibleSlides() {
        const previousVisibleSlides = this.visibleSlides;

        previousVisibleSlides.forEach(i => this.#container.querySelector(`[${DATA.attrs.slide}="${i}"]`)?.classList.remove(CSS_CLASSES.slideVisible));

        const visibleSlides: number[] = [];
        const config = this.#config,
            slideIndex = this.currentPage * (config.items > 0 ? config.items : 1),
            slidesLength = this.#slides.length;

        if (config.centerSlide) {
            visibleSlides.push(this.currentPage);
        } else if (config.itemPerPage) {
            for (let i = this.currentPage; i < this.currentPage + config.items; i++) {
                visibleSlides.push(i);
            }
        } else {
            if (slideIndex + config.items > slidesLength) {
                for (let i = slidesLength - config.items; i < slidesLength; i++) {
                    visibleSlides.push(i);
                }
            } else {
                if (config.items == 0) {
                    visibleSlides.push(slideIndex);
                } else {
                    for (let i = slideIndex; i < slideIndex + config.items; i++) {
                        if (i < slidesLength) {
                            visibleSlides.push(i);
                        }
                    }
                }
            }
        }

        visibleSlides.forEach(i => this.#container.querySelector(`[${DATA.attrs.slide}="${i}"]`)?.classList.add(CSS_CLASSES.slideVisible));
        this.visibleSlides = visibleSlides;
    }

    #updateContainerHeight() {
        const heights = this.#getSlidesByPage()
            .map(i => this.#slidesHeights[i])
            .filter((height): height is number => height !== undefined);

        if (heights.length === 0) {
            return;
        }

        const maxHeight = Math.max(...heights);
        this.#container.style.height = `${maxHeight}px`;
    }

    #getSlidesByPage(page: number | null = null): number[] {
        return this.slidesByPage[page ?? this.currentPage] || [];
    }

    #onStageTransitionEnd = () => this.#events.emit(EVENTS.TRANSITION_END);

    #onPageChanged = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGED]) => this.#changePage(e.currentPage);

    #onPageChangeRequest = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGE_REQUEST]) => {
        const index = this.#processRequestPageIndex(e.index);

        if (e.force) {
            this.#changePage(index, e.animate)
            return;
        }

        if (index >= 0 && index <= this.totalPages) {
            this.#changePage(index, e.animate)
        }
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
        if (this.#stage == null) {
            return;
        }

        let origPage = this.currentPage;
        const config = this.#config;

        if (!enableAnim) {
            this.#stage.style.transitionDuration = "0s";
        } else {
            this.#stage.style.transitionDuration = `${config.slideChangeDuration}s`;
        }

        const isForward = index > this.currentPage ||
            (index > this.currentPage && (index === 0 && this.currentPage === this.totalPages));

        this.currentPage = index;

        //update frontend
        this.#setVisibleSlides();

        const scrollStatus = {
            currentPage: this.currentPage,
            slidesCount: this.getSlidesCount(),
            currentTranslate: this.currentTranslate,
            visibleSlides: this.visibleSlides,
            isForward: isForward
        };

        this.#events.emit(EVENTS.PAGE_CHANGE_SCROLL_BEFORE, scrollStatus);

        this.#scrollToSlide(this.#getSlideDom(), enableAnim);

        scrollStatus.currentTranslate = this.currentTranslate;
        this.#events.emit(EVENTS.PAGE_CHANGE_SCROLL_AFTER, scrollStatus);

        //change stage height if this options is enabled
        if (config.autoHeight) {
            this.#updateContainerHeight();
        }

        //fire change trigger
        if (origPage != this.currentPage) {
            this.#events.emit(EVENTS.PAGE_CHANGED, {
                currentPage: this.currentPage,
                currentTranslate: this.currentTranslate,
                visibleSlides: this.visibleSlides
            });
        }
    }

    #getFirstSlideStyle = () => {
        if (this.#slides == null) {
            return;
        }

        const slide = this.#slides[0];
        if (slide === undefined) {
            console.warn("Can't get slide style!");
            return;
        }
        return slide.style;
    }

    #getSlideDom = (index = -1): HTMLDivElement | null => {
        const attr = DATA.attrs.slide;
        let selector = index > -1 ? `[${attr}='${index}']` : `[${attr}].${CSS_CLASSES.slideVisible}`;
        return this.#container.querySelector<HTMLDivElement>(selector);
    }

    #onSlideScroll = (e: CarouselEvents[typeof EVENTS.SLIDE_SCROLL]) => this.#scrollToSlide(e.slide, e.animate, e.specifiedPosition);

    #scrollToSlide(slide?: HTMLDivElement | null, animate: boolean = true, specifiedPosition: number | null = null) {
        if (this.#stage === null) {
            return;
        }

        const currentSlide = this.#getSlideDom(),
            err = "Error scrolling: ",
            config = this.#config,
            targetSlide = slide ?? currentSlide;

        if (targetSlide === null) {
            throw error(`${err} target slide not found!`);
        }

        let position: number;

        if (specifiedPosition !== null) {
            position = specifiedPosition
        } else {
            if (config.centerSlide && config.items > 0) {
                const slideStyle = this.#getFirstSlideStyle();
                if (slideStyle === undefined) {
                    throw error(`${err} Slide style was not found!`);
                }

                position =
                    -this.#getSlidePos(targetSlide) -
                    -(parseInt(slideStyle.width) * Math.floor(config.items / 2));
            } else {
                position = -this.#getSlidePos(targetSlide);
            }
        }

        // normalize initial -0 value when using default starting page
        if (Object.is(position, -0)) {
            position = 0;
        }

        this.currentTranslate = position;

        if (!animate) {
            this.#stage.style.transitionDuration = "0s";
            scrollToPos(this.#stage, this.currentTranslate, config.vertical);
            this.#stage.offsetHeight;  // force reflow
            this.#stage.style.transitionDuration = `${this.#config.slideChangeDuration}s`;
            return;
        }

        scrollToPos(this.#stage, this.currentTranslate, config.vertical);
    }

    #getSlidePos(slide: HTMLDivElement) {
        if (!this.#stage) {
            throw error("Stage not found!");
        }

        const stageRect = this.#stage.getBoundingClientRect(),
            slideRect = slide.getBoundingClientRect();

        return this.#config.vertical
            ? slideRect.top - stageRect.top
            : slideRect.left - stageRect.left;
    }

    #resizeEvent = () => {
        clearTimeout(this.#resizeTimeout);

        this.#resizeTimeout = setTimeout(() => this.#events.emit(EVENTS.STAGE_RESIZED), this.#config.resizeDebounce);
    }

    #onStageResized = () => {
        this.#update();

        const slide = this.#getSlideDom();
        if (slide != null) {
            this.#scrollToSlide(slide, false);
        }

        const containerWidth = this.#container.getBoundingClientRect().width;
        this.#configClass.refreshResponsive(containerWidth);
    }

    #onConfigApplied = (e: CarouselEvents[typeof EVENTS.CONFIG_APPLIED]) => {
        this.#update();

        const slide = this.#getSlideDom();
        if (slide !== null) {
            this.#scrollToSlide(slide, false);
        }
    }

    #keyboardHandler = (e: KeyboardEvent) => {
        const activeDocument = document.activeElement;
        if (activeDocument === null) {
            return;
        }

        // don't trigger while typing
        if (activeDocument.tagName === 'INPUT' || activeDocument.tagName === 'TEXTAREA') {
            return;
        }

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

    static getViewportCenter(container: HTMLDivElement, vertical: boolean) {
        const viewportSize = vertical ? container.clientHeight : container.clientWidth;
        return viewportSize / 2;
    }
}
import { CSS_CLASSES } from "../constants/css-classes";
import { DATA } from "../constants/data-attrs";
import { EVENTS } from "../constants/events-list";
import { PRIORITY } from "../constants/priorities";
import { BaseModule } from "../core/base-module";
import { ModuleName } from "../core/module-names";
import type { CarouselEvents } from "../types/event.types";
import type { ModuleLoaderParams } from "../types/module.params";
import { error } from "../utils/error-handler";

export default class Loop extends BaseModule {
    name: ModuleName = ModuleName.Loop;

    #stage: HTMLDivElement;
    #activeSlides: number[] = [];

    constructor(params: ModuleLoaderParams) {
        super(params);

        const stage = document.querySelector<HTMLDivElement>(`${this.config.container} .${CSS_CLASSES.stage}`);
        if (stage === null)
            throw error("Loop module won't initialize! Stage was not found!");
        this.#stage = stage;

        this.emitCreated();
    }

    get shouldInitialize() {
        return this.config.loop;
    }

    initialize() {
        this.events.on(EVENTS.DRAG_PRE_START, this.#onDragPreStart);
        this.events.on(EVENTS.PAGE_CHANGE, this.#onPageChange);
        this.events.on(EVENTS.PAGE_CHANGE_INDEX, this.#onPageChangeIndex);
        this.events.on(EVENTS.PAGE_CHANGE_SCROLL_BEFORE, this.#onChangePageScrollBefore);

        this.#activeSlides = this.status.activeSlides;

        const prevNextSlides = this.#calculatePrevAndNextSlides(this.#activeSlides),
            prev = prevNextSlides?.prev,
            next = prevNextSlides?.next;

        if (prev !== undefined && next !== undefined)
            this.#markPrevAndNextSlides(prev, next);

        this.emitInitialized();
    }

    destroy() {
        this.#clearSlidesForLoop();

        this.events.off(EVENTS.PAGE_CHANGE_INDEX, this.#onPageChangeIndex);
        this.events.off(EVENTS.PAGE_CHANGE_SCROLL_BEFORE, this.#onChangePageScrollBefore);

        this.emitDestroyed();
    }

    #onPageChange = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGE]) => {
        this.#activeSlides = e.slidesActive;
    }

    #onPageChangeIndex = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGE_INDEX]) => {
        let priority = PRIORITY.BEHAVIOR;

        const canOverride = this.tryOverridePriority(e, priority);
        if (!canOverride)
            return;

        if (e.request === "prev" && e.currentPage === 0)
            e.page = e.totalPages;
        else if (e.request === "next" && e.currentPage === e.totalPages)
            e.page = 0;
        else
            e.handled = false;
    }

    #calculatePrevAndNextSlides(activeSlides: number[]) {
        const totalSlides = this.status.totalSlides - 1,
            firstCurrentIndex = activeSlides[0],
            lastCurrentIndex = activeSlides[activeSlides.length - 1];

        if (firstCurrentIndex === undefined || lastCurrentIndex === undefined)
            return;

        const prev = firstCurrentIndex - 1 < 0 ? totalSlides : firstCurrentIndex - 1,
            next = lastCurrentIndex + 1 > totalSlides ? 0 : lastCurrentIndex + 1;

        return { prev, next };
    }

    #markPrevAndNextSlides(prev: number, next: number) {
        this.#clearSlidesForLoop();
        this.#getSlideDom(prev)?.classList.add(CSS_CLASSES.slidePrev);
        this.#getSlideDom(next)?.classList.add(CSS_CLASSES.slideNext);
    }

    #onChangePageScrollBefore = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGE_SCROLL_BEFORE]) => {
        if (!this.#stage)
            return;

        this.#activeSlides = e.activeSlides;

        const prevNextSlides = this.#calculatePrevAndNextSlides(this.#activeSlides),
            prev = prevNextSlides?.prev,
            next = prevNextSlides?.next;

        if (prev === undefined || next === undefined)
            return;

        const
            currentTranslate = e.currentTranslate,
            allSlides = this.#stage.children,
            lastCurrentIndex = this.#activeSlides[this.#activeSlides.length - 1],
            firstSlide = allSlides[0] as HTMLDivElement,
            lastSlide = allSlides[allSlides.length - 1] as HTMLDivElement,
            lastSlideId = Number(lastSlide.dataset[DATA.dataset.slide]),
            isSlidingForward = e.isForward,
            isAtEnd = lastCurrentIndex === lastSlideId,
            isAtStartBoundary = lastSlide.classList.contains("active"),
            hasReachedEndBound = firstSlide.classList.contains(CSS_CLASSES.slideNext);

        // if the current slide/s is the last - always keep it at the end
        if (isAtEnd && isSlidingForward)
            this.#handleLastSlide(lastCurrentIndex, lastSlide);
        // if scrolling right - shift slides backwards when all active slides reached the end
        else if (hasReachedEndBound && isSlidingForward)
            this.#shiftAndReorderEnd(currentTranslate, lastSlide);
        // if scrolling left - opposite to the above logic
        else if (isAtStartBoundary && !isSlidingForward)
            this.#handleStartBoundaryShift(currentTranslate, firstSlide, lastSlide);

        this.#markPrevAndNextSlides(prev, next);
    }

    #handleLastSlide(index: number, anchor: HTMLDivElement) {
        const currentSlide = this.#getSlideDom(index);
        if (currentSlide)
            anchor.after(currentSlide);
    }

    #shiftAndReorderEnd(currentTranslate: number, anchor: HTMLElement) {
        this.#shiftStage(currentTranslate, anchor, this.#activeSlides.length);

        // reorder DOM - keep current slides in the end (after the last DOM item)
        const slidesToMove = this.container.querySelectorAll<HTMLDivElement>(`.${CSS_CLASSES.item}.active`);
        Array.from(slidesToMove)
            .sort((a, b) => Number(b.dataset[DATA.dataset.slide]) - Number(a.dataset[DATA.dataset.slide]))
            .forEach(el => anchor.after(el));
    }

    #shiftStage(currentTranslate: number, baseSlideWidth: HTMLElement, length: number, forward: boolean = true) {
        let scrollAmount = (baseSlideWidth.getBoundingClientRect().width * length);

        this.events.emit(EVENTS.SLIDE_SCROLL, {
            specifiedPosition: currentTranslate - (forward ? -scrollAmount : scrollAmount),
            animate: false,
        })
    }

    #handleStartBoundaryShift(currentTranslate: number, firstDom: HTMLDivElement, lastDom: HTMLDivElement) {
        const nextSlide = this.#stage.children[this.config.items],
            isNextInvalid = !nextSlide?.classList.contains(CSS_CLASSES.slideNext);

        if (isNextInvalid)
            return;

        this.#shiftStage(currentTranslate, lastDom, this.#activeSlides.length, false);

        // active slides must be at beginning
        const slidesToMove = this.container.querySelectorAll<HTMLDivElement>(`.${CSS_CLASSES.item}.active`)
        slidesToMove.forEach(el => firstDom.before(el));
    }

    #getSlideDom = (index: number): HTMLDivElement | null =>
        this.container.querySelector<HTMLDivElement>(`[${DATA.attrs.slide}='${index}']`);

    #clearSlidesForLoop() {
        this.container.querySelectorAll<HTMLDivElement>(`.${CSS_CLASSES.slidePrev}, .${CSS_CLASSES.slideNext}`)
            .forEach(e => e.classList.remove(CSS_CLASSES.slidePrev, CSS_CLASSES.slideNext));
    }

    #onDragPreStart = (e: CarouselEvents[typeof EVENTS.DRAG_PRE_START]) => {
        let newTranslate = e.currentTranslate;
        const
            stageChilden = this.#stage.children,
            arrayChildren = Array.from(stageChilden),
            firstSlides = arrayChildren.slice(0, this.config.items) as HTMLDivElement[],
            firstSlide = firstSlides[0] as HTMLDivElement,
            lastSlides = arrayChildren.slice(stageChilden.length - this.config.items, stageChilden.length) as HTMLDivElement[],
            lastSlide = lastSlides[lastSlides.length - 1] as HTMLDivElement;

        if (firstSlide === undefined || lastSlide === undefined)
            return;

        const activeSet = new Set(this.#activeSlides),
            isNearStart = firstSlides.every(slide => activeSet.has(Number(slide.dataset[DATA.dataset.slide]))),
            isNearEnd = lastSlides.every(slide => activeSet.has(Number(slide.dataset[DATA.dataset.slide])));

        if (isNearStart) {
            lastSlides.forEach(slide => newTranslate -= slide.getBoundingClientRect().width);
            firstSlide.before(...lastSlides);
        } else if (isNearEnd) {
            firstSlides.forEach(slide => newTranslate += slide.getBoundingClientRect().width);
            lastSlide.after(...firstSlides);
        }

        this.events.emit(EVENTS.SLIDE_SCROLL, {
            specifiedPosition: newTranslate,
            animate: false,
        });

        e.currentTranslate = newTranslate;
    }
}
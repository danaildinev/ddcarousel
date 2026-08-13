import { CSS_CLASSES } from "../constants/css-classes";
import { DATA } from "../constants/data-attrs";
import { EVENTS } from "../constants/events-list";
import { PRIORITY } from "../constants/priorities";
import { BaseModule } from "../core/base-module";
import type { CarouselEvents } from "../types/event.types";
import type { ModuleContext } from "../types/module.params";
import { error } from "../utils/error-handler";

type LoopDirection = "prev" | "next";

export default class Loop extends BaseModule {
    id: string = "loop";

    #stage: HTMLDivElement;
    #activeSlides: number[] = [];

    // Direction of the current prev/next request.
    // Needed by non-centered mode because after dom reordering, the target page may exist on the wrong side.
    #pendingDirection: LoopDirection | null = null;

    constructor(params: ModuleContext) {
        super(params);

        const stage = this.container.querySelector<HTMLDivElement>(`.${CSS_CLASSES.stage}`);
        if (stage === null) {
            throw error("Loop module won't initialize! Stage was not found!");
        }
        this.#stage = stage;
    }

    initialize() {
        this.events.on(EVENTS.DRAG_DRAGGING, this.#onDragging)
        this.events.on(EVENTS.PAGE_CHANGED, this.#onPageChanged)
        this.events.on(EVENTS.PAGE_CHANGE_INDEX, this.#onPageChangeIndex)
        this.events.on(EVENTS.PAGE_CHANGE_SCROLL_BEFORE, this.#onChangePageScrollBefore);

        const status = this.getStatus();
        this.#activeSlides = [...status.activeSlides];

        // Centered mode needs slides on both sides of the
        // centered slide immediately. Example (10 slides and items: 3):
        // "9 | 0 | 1" instead of "[empty slide] | 0 | 1"
        if (this.config.centerSlide) {
            this.#prepareCenteredSlides(status.currentPage, status.currentPage, status.currentTranslate);
        }
    }

    destroy() {
        this.events.off(EVENTS.DRAG_DRAGGING, this.#onDragging)
        this.events.off(EVENTS.PAGE_CHANGED, this.#onPageChanged)
        this.events.off(EVENTS.PAGE_CHANGE_INDEX, this.#onPageChangeIndex);
        this.events.off(EVENTS.PAGE_CHANGE_SCROLL_BEFORE, this.#onChangePageScrollBefore);

        this.#restoreSlideOrder();

        this.#pendingDirection = null;
        this.#activeSlides = [];
    }

    #restoreSlideOrder() {
        const slideKey = DATA.dataset.slide;

        const slides = Array.from(this.#stage.children) as HTMLDivElement[];
        slides.sort((a, b) => {
            const aIndex = Number(a.dataset[slideKey]);
            const bIndex = Number(b.dataset[slideKey]);
            return aIndex - bIndex;
        });

        this.#stage.append(...slides);
    }

    #onPageChanged = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGED]) => {
        // This array still represents the current page before scroll,
        // and PAGE_CHANGE_SCROLL_BEFORE later gives us the destination slides right before scroll.
        this.#activeSlides = [...e.slidesActive];
    }

    // Loop only changes the requested page when prev/next is outside pages boundary.
    // Normal prev/next requests are left untouched, but their direction is saved in variable
    // because DOM reordering may still be necessary.
    #onPageChangeIndex = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGE_INDEX]) => {
        if (e.request === "prev" || e.request === "next") {
            this.#pendingDirection = e.request;
        }
        else {
            this.#pendingDirection = null;
        }

        const isPrevWrap = e.request === "prev" && e.currentPage === 0;
        const isNextWrap = e.request === "next" && e.currentPage === e.totalPages;
        if (!isPrevWrap && !isNextWrap) {
            return;
        }

        if (!this.tryOverridePriority(e, PRIORITY.BEHAVIOR)) {
            this.#pendingDirection = null;
            return;
        }

        e.page = isPrevWrap ? e.totalPages : 0;
    }

    #onChangePageScrollBefore = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGE_SCROLL_BEFORE]) => {
        // We need different reordering logic for centered mode.
        // Because in this mode the active slide is the centered one, the loop must construct the surrounding slides.
        // Examples: (items: 3 and last slide) -> 8 | 9 | 0; (items: 5) -> 7 | 8 | 9 | 0 | 1
        if (this.config.centerSlide) {
            this.#pendingDirection = null;

            const targetIndex = e.activeSlides[0];
            const currentIndex = this.#activeSlides[0];
            if (targetIndex === undefined || currentIndex === undefined) {
                return;
            }

            this.#prepareCenteredSlides(targetIndex, currentIndex, e.currentTranslate);
            return;
        }

        // Non-centered mode logic
        const direction = this.#pendingDirection;
        this.#pendingDirection = null;
        if (direction === null) {
            return;
        }

        this.#reorderNonCenteredPage(e, direction);
    }

    // Drag looping is based entirely on physical DOM boundaries.
    // When empty space starts appearing before the first DOM slide: last -> first
    // ... or after the last DOM slide: first -> last
    // Translation is rebased by exactly the amount the DOM moved, making the reorder smooth and invisible.
    #onDragging = (e: CarouselEvents[typeof EVENTS.DRAG_DRAGGING]) => {
        const first = this.#stage.firstElementChild as HTMLDivElement | null;
        const last = this.#stage.lastElementChild as HTMLDivElement | null;
        const viewport = this.#stage.parentElement;

        if (!first || !last || !viewport) {
            return;
        }

        const viewportRect = viewport.getBoundingClientRect();
        const firstRect = first.getBoundingClientRect();
        const lastRect = last.getBoundingClientRect();
        const vertical = this.config.vertical;
        const viewportStart = vertical ? viewportRect.top : viewportRect.left;
        const viewportEnd = vertical ? viewportRect.bottom : viewportRect.right;
        const firstStart = vertical ? firstRect.top : firstRect.left;
        const lastEnd = vertical ? lastRect.bottom : lastRect.right;

        // еmpty space before the first physical slide - move the last slide to the beginning
        if (firstStart > viewportStart) {
            this.#rebaseDrag(e, first, () => first.before(last));
        } else if (lastEnd < viewportEnd) {
            // еmpty space after the last physical slide - move the first slide to the end
            this.#rebaseDrag(e, last, () => last.after(first));
        }
    }

    // Same compensation principle as page reordering, except Drag
    // owns currentTranslate directly through its mutable event payload.
    #rebaseDrag(e: CarouselEvents[typeof EVENTS.DRAG_DRAGGING], anchor: HTMLElement, reorder: () => void) {
        const shift = this.#measureReorder(anchor, reorder);
        if (shift === 0) {
            return;
        }

        e.currentTranslate -= shift;
        e.rebase = true;
    }

    // Makes sure a centered target has slides arount it.
    // Example (10 slides and items: 3):
    // page 0 -> 9 0 1
    // page 1 -> 0 1 2
    // page 9 -> 8 9 0
    #prepareCenteredSlides(targetIndex: number, currentIndex: number, currentTranslate: number) {
        const totalSlides = this.getStatus().totalSlides;
        if (totalSlides <= 1) {
            return;
        }

        const beforeCount = Math.floor(this.config.items / 2);
        const afterCount = this.config.items - beforeCount - 1;
        const indexes: number[] = [];

        for (let offset = -beforeCount; offset <= afterCount; offset++) {
            indexes.push(this.#normalizeIndex(targetIndex + offset, totalSlides));
        }

        const slides = this.#getSlides(indexes);
        if (slides.length !== indexes.length) {
            return;
        }

        // Avoid unnecessary DOM reordering when the desired centered
        // window already exists in the correct physical order.
        if (this.#checkSlidesCorrectOrder(slides)) {
            return;
        }

        const target = this.#getSlideDom(targetIndex);
        const current = this.#getSlideDom(currentIndex);
        if (!target || !current) {
            return;
        }

        const beforeSlides = slides.slice(0, beforeCount);
        const afterSlides = slides.slice(beforeCount + 1);

        // Keep the current centered slide visually stationary while
        // rebuilding the target's surrounding slides.
        const reorder = () => {
            target.before(...beforeSlides);
            target.after(...afterSlides);
        };
        this.#reorderSlides(current, currentTranslate, reorder);
    }

    // Reorder a non-centered destination page.
    // Example DOM: 3 4 5 | 0 1 2 (current page is 0 -> 0 1 2)
    // Calling next() from page 0 wants 3 4 5 but they are currently
    // before the current active page. We need to move them after the current page
    // before Stage starts its animated scroll.
    #reorderNonCenteredPage(e: CarouselEvents[typeof EVENTS.PAGE_CHANGE_SCROLL_BEFORE], direction: LoopDirection) {
        const currentSlides = this.#getSlides(this.#activeSlides);
        const targetSlides = this.#getSlides(e.activeSlides);
        if (currentSlides.length === 0 || targetSlides.length === 0) {
            return;
        }

        const targetSet = new Set(targetSlides);

        // When changing the page, slides may overlap. Example with itemPerPage:
        // Current page: 3 4 5 -> Next page: 4 5 6 (slides 4 and 5 are on both pages)
        // We need an anchor that belongs ONLY to the current page, 
        // otherwise the anchor itself would be moved during reordering.
        const currentOnly = currentSlides.filter(slide => !targetSet.has(slide));
        if (currentOnly.length === 0) {
            return;
        }

        const anchor = direction === "next" ? currentOnly.at(-1) : currentOnly[0];
        if (!anchor) {
            return;
        }

        // avoid unnecessary DOM reordering and stage updates
        if (this.#isPagePositioned(anchor, targetSlides, direction)) {
            return;
        }

        // Move the whole destination page as one ordered block.
        // Do not move individual missing slides only. Doing that can
        // split an active page across the DOM (bad -> 6 ... 4 5, good -> 4 5 6)
        const reorder = () => {
            if (direction === "next") {
                anchor.after(...targetSlides);
            } else {
                anchor.before(...targetSlides);
            }
        };
        this.#reorderSlides(anchor, e.currentTranslate, reorder);
    }

    // Reorder the DOM and modify stage translate by exactly the amount the anchor has moved
    #reorderSlides(anchor: HTMLElement, currentTranslate: number, reorder: () => void) {
        const shift = this.#measureReorder(anchor, reorder);
        if (shift === 0) {
            return;
        }

        this.events.emit(EVENTS.SLIDE_SCROLL, {
            specifiedPosition: currentTranslate - shift,
            animate: false,
        });
    }

    // how much an anchor moved after a DOM mutation
    #measureReorder(anchor: HTMLElement, reorder: () => void): number {
        const before = this.#getSlidePosition(anchor);
        reorder();
        return this.#getSlidePosition(anchor) - before;
    }

    // Check if slides already appear next to each other in exactly the requested order.
    #checkSlidesCorrectOrder(slides: HTMLDivElement[]): boolean {
        const first = slides[0];
        if (!first) {
            return false;
        }

        let current: Element | null = first;
        for (const slide of slides) {
            if (current !== slide) {
                return false;
            }
            current = current.nextElementSibling;
        }

        return true;
    }

    #isPagePositioned(anchor: HTMLDivElement, slides: HTMLDivElement[], direction: LoopDirection): boolean {
        const stageSlides = Array.from(this.#stage.children);
        const anchorIndex = stageSlides.indexOf(anchor);
        if (anchorIndex === -1) {
            return false;
        }

        const startIndex = direction === "next" ? anchorIndex + 1 : anchorIndex - slides.length;
        return slides.every((slide, index) => stageSlides[startIndex + index] === slide);
    }

    // Normalize slide indexes based on the total slides.
    // Examples for 10 slides:
    // -1 -> 9
    // 10 -> 0
    // 11 -> 1
    #normalizeIndex(index: number, totalSlides: number): number {
        return ((index % totalSlides) + totalSlides) % totalSlides;
    }

    #getSlidePosition(slide: HTMLElement): number {
        const rect = slide.getBoundingClientRect();
        return this.config.vertical ? rect.top : rect.left;
    }

    // Resolves several logical slide indexes to their DOM elements.
    #getSlides(indexes: number[]): HTMLDivElement[] {
        return indexes.map(index => this.#getSlideDom(index))
            .filter((slide): slide is HTMLDivElement => slide !== null);
    }

    #getSlideDom = (index: number): HTMLDivElement | null =>
        this.container.querySelector<HTMLDivElement>(`[${DATA.attrs.slide}='${index}']`);
}
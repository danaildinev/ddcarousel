import { CSS_CLASSES } from "../constants/css-classes";
import { EVENTS } from "../constants/events-list";
import { BaseModule } from "../core/base-module";
import type { ModuleLoaderParams } from "../types/module.params";
import { ModuleName } from "../core/module-names";
import type { CarouselEvents } from "../types/event.types";
import { error } from "../utils/error-handler";
import { scrollToPos } from "../utils/scroll";
import { DragSnapMode } from "../types/carousel.types";
import { getSlidesOffsets, getClosestSlideIndexes, type SlideOffsets } from "../utils/slide";

export default class Drag extends BaseModule {
    name: ModuleName = ModuleName.Drag;

    #stageDom: HTMLDivElement;

    #stayOnThisSlide: boolean = false;
    #origPosition: number = 0;
    #isDragging: boolean = false;
    #touchStartRawCords!: number;
    #touchStartCords!: number;
    #swipeDistance!: number;
    #currentTouch!: number;
    #currentTranslate!: number;
    #lastTouch: number = 0;
    #slideOffsets: SlideOffsets[] = [];
    #slides: HTMLDivElement[] = [];
    #viewportCenter: number = 0;

    #currentPage!: number;
    #totalPages!: number;

    constructor(params: ModuleLoaderParams) {
        super(params);

        const stage = document.querySelector<HTMLDivElement>(`${this.config.container} .${CSS_CLASSES.stage}`);
        if (stage === null) {
            throw error("Drag module won't initialize! Stage DOM was not found!");
        }

        this.#stageDom = stage;

        this.emitCreated();
    }

    get shouldInitialize() {
        return this.config.touchDrag || this.config.mouseDrag;
    }

    initialize() {
        this.#attachEvents();
        this.#stageDom.classList.add(CSS_CLASSES.disabled);

        this.#slides = this.#getDomSlides();
        this.#cacheSlideOffsets();

        this.emitInitialized();
    }

    destroy() {
        this.#detachEvents();
        this.#stageDom.classList.remove(CSS_CLASSES.disabled);

        this.emitDestroyed();
    }

    #attachEvents() {
        const carouselStatus = this.getStatus();
        const status: CarouselEvents[typeof EVENTS.PAGE_CHANGED] = {
            currentTranslate: carouselStatus.currentTranslate,
            currentPage: carouselStatus.currentPage,
            slidesActive: []
        }

        this.#updateProps(status);

        window.addEventListener("pointerdown", this.#dragStart);
        window.addEventListener("pointermove", this.#dragMove);
        window.addEventListener("pointerup", this.#dragEnd);

        this.events.on(EVENTS.PAGE_CHANGED, this.#updateProps);
        this.events.on(EVENTS.STAGE_RESIZED, this.#onStageResized);
        this.events.on(EVENTS.STAGE_CHANGED, this.#onStageChanged);
        this.events.on(EVENTS.SLIDE_SCROLL, this.#onSlideScroll);
    }

    #detachEvents() {
        window.removeEventListener("pointerdown", this.#dragStart);
        window.removeEventListener("pointermove", this.#dragMove);
        window.removeEventListener("pointerup", this.#dragEnd);

        this.events.off(EVENTS.PAGE_CHANGED, this.#updateProps);
    }

    #getInput = (e: PointerEvent) => this.config.vertical ? e.clientY : e.clientX;

    #updateProps = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGED]) => {
        this.#currentTranslate = e.currentTranslate;
        this.#currentPage = e.currentPage;
    }

    #dragStart = (e: PointerEvent) => {
        if (this.#stageDom === null)
            throw error("Drag start failed! Stage was not found!");

        const target = e.target;

        const isInvalidTarget = !(target instanceof Node) || !this.#stageDom.contains(target);
        if (isInvalidTarget) {
            return;
        }

        if (e.pointerType === "touch" && !this.config.touchDrag) {
            return;
        }

        if (e.pointerType === "mouse" && !this.config.mouseDrag) {
            return;
        }

        const dragState = {
            currentTranslate: this.#currentTranslate
        };

        this.events.emit(EVENTS.DRAG_PRE_START, dragState);

        // read back modified value
        this.#currentTranslate = dragState.currentTranslate;

        const startPoint = this.#getInput(e);
        if (startPoint == undefined) {
            return;
        }

        this.#isDragging = true;
        this.#touchStartRawCords = startPoint;
        this.#touchStartCords = this.#touchStartRawCords + -(this.#currentTranslate);
        this.#origPosition = this.#currentTranslate;
        this.#stayOnThisSlide = false;
        this.#lastTouch = 0;
        this.events.emit(EVENTS.DRAG_START);
    }

    #rebaseDrag(newTranslate: number, currentPointer: number) {
        this.#currentTranslate = newTranslate;
        this.#currentTouch = newTranslate;
        this.#origPosition = newTranslate;

        // recreate drag origin from current pointer
        this.#touchStartRawCords = currentPointer;
        this.#touchStartCords = currentPointer - newTranslate;
    }

    #dragMove = (e: PointerEvent) => {
        if (!this.#isDragging) {
            return;
        }

        if (this.#stageDom === null) {
            throw error("Dragging failed! Stage was not found!");
        }

        const input = this.#getInput(e);

        this.#lastTouch = this.#currentTouch;

        //disable transition to get more responsive dragging
        this.#stageDom.style.transitionDuration = `${this.config.swipeSmooth}s`;

        //calcualte swipe distance between starging value cnd current value
        this.#swipeDistance = Math.abs(input - this.#touchStartRawCords);

        //get the current touch
        this.#currentTouch = input - this.#touchStartCords;

        //move slider until max swipe lenght is reached
        if (this.config.touchMaxSlideDist < 1 || this.#swipeDistance <= this.config.touchMaxSlideDist) {
            const state: CarouselEvents[typeof EVENTS.DRAG_DRAGGING] = {
                currentTranslate: this.#currentTouch,
                delta: this.#swipeDistance,
                direction: this.#currentTouch < this.#lastTouch ? "left" : "right",
                rebase: false
            };

            if (this.config.loop) {
                const slideIndexes = getClosestSlideIndexes(this.#slideOffsets, this.#viewportCenter, this.#currentTouch, ["left", "right"]);
                state.slideIndexLeft = slideIndexes.left;
                state.slideIndexRight = slideIndexes.right;
            }

            this.events.emit(EVENTS.DRAG_DRAGGING, state);

            this.#currentTouch = state.currentTranslate
            if (state.rebase) {
                this.#rebaseDrag(this.#currentTouch, input);
            }

            scrollToPos(this.#stageDom, this.#currentTouch, this.config.vertical);
        } else {
            this.#stayOnThisSlide = true;
            this.#currentTouch = input - this.#touchStartCords;
        }
    }

    #dragEnd = () => {
        if (!this.#isDragging) {
            return;
        }

        this.events.emit(EVENTS.DRAG_END);

        // if swipe threshold is not enough, scroll to original position
        if (this.config.dragSnapMode === DragSnapMode.Swipe && (this.#swipeDistance < this.config.touchSwipeThreshold || this.#stayOnThisSlide)) {
            this.#revertDrag();
            return;
        }

        if (this.config.dragSnapMode === DragSnapMode.Closest) {
            const closestIndex = getClosestSlideIndexes(this.#slideOffsets, this.#viewportCenter, this.#currentTouch, ["center"]);
            this.events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: closestIndex.center });
        } else {
            const isLeftDirection = this.#currentTouch > this.#origPosition;
            const targetIndex = isLeftDirection ? "prev" : "next";

            // if out of bounds, scroll to original position
            /*if (targetIndex < 0 || targetIndex >= this.#totalPages) {
                this.#revertDrag();
                return;
            }*/

            this.events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: targetIndex });
        }

        this.#resetTransitionDuration();
        this.#isDragging = false;
    }

    #revertDrag() {
        scrollToPos(this.#stageDom, this.#origPosition, this.config.vertical);
        this.#resetTransitionDuration();
        this.#isDragging = false;
    }

    #resetTransitionDuration = () => this.#stageDom.style.transitionDuration = `${this.config.slideChangeDuration}s`;

    #onStageResized = () => {
        this.#cacheSlideOffsets();
    }

    #onStageChanged = () => {
        this.#slides = this.#getDomSlides();
        this.#cacheSlideOffsets();
    }

    #onSlideScroll = (e: CarouselEvents[typeof EVENTS.SLIDE_SCROLL]) => {
        this.#currentTranslate = e.specifiedPosition;
    }

    #cacheSlideOffsets() {
        const container = this.#stageDom.parentElement;
        if (!container) {
            return;
        }

        const { vertical } = this.config;

        const viewportSize = vertical ? container.clientHeight : container.clientWidth;
        this.#viewportCenter = viewportSize / 2;
        this.#slideOffsets = getSlidesOffsets(this.#slides, vertical)
    }

    #getDomSlides = (): HTMLDivElement[] => Array.from(this.#stageDom.children) as HTMLDivElement[];
}
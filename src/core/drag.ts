import { CSS_CLASSES } from "../constants/css-classes";
import { EVENTS } from "../constants/events-list";
import type { CarouselEvents } from "../types/event.types";
import { error } from "../utils/error-handler";
import { scrollToPos } from "../utils/scroll";
import { DragSnapMode, type CarouselConfig, type CarouselStatus } from "../types/carousel.types";
import { getSlidesOffsets, getClosestSlideIndexes, type SlideOffsets } from "../utils/slide";
import type { Events } from "./events";
import type { Config } from "./config";

export default class Drag {
    #config: CarouselConfig;
    #status: CarouselStatus;
    #events: Events;

    #stageDom: HTMLDivElement;
    #slideOffsets: SlideOffsets[] = [];
    #slides: HTMLDivElement[] = [];
    #viewportCenter: number = 0;

    #isDragging: boolean = false;
    #pointerId: number | null = null;

    #pointerStart: number = 0;
    #dragStartTranslate: number = 0;
    #pointerOffset: number = 0;

    #lastTouch: number = 0;
    #currentTouch: number = 0;
    #currentTranslate: number = 0;

    #swipeDistance: number = 0;
    #stayOnThisSlide: boolean = false;


    constructor(config: Config, events: Events, status: CarouselStatus) {
        this.#config = config.current;
        this.#status = status;
        this.#events = events;

        const stage = document.querySelector<HTMLDivElement>(`${this.#config.container} .${CSS_CLASSES.stage}`);
        if (stage === null) {
            throw error("Drag module won't initialize! Stage DOM was not found!");
        }

        this.#stageDom = stage;
    }

    initialize() {
        this.#attachEvents();
        this.#stageDom.classList.add(CSS_CLASSES.disabled);

        this.#slides = this.#getDomSlides();
        this.#cacheSlideOffsets();
    }

    destroy() {
        this.#detachEvents();
        this.#stageDom.classList.remove(CSS_CLASSES.disabled);
    }

    #attachEvents() {
        const status: CarouselEvents[typeof EVENTS.PAGE_CHANGED] = {
            currentTranslate: this.#status.currentTranslate,
            currentPage: this.#status.currentPage,
            visibleSlides: []
        }

        this.#updateProps(status);

        this.#stageDom.addEventListener("pointerdown", this.#dragStart);
        window.addEventListener("pointermove", this.#dragMove);
        window.addEventListener("pointerup", this.#dragEnd);
        window.addEventListener("pointercancel", this.#dragCancel);

        this.#events.on(EVENTS.PAGE_CHANGED, this.#updateProps);
        this.#events.on(EVENTS.STAGE_RESIZED, this.#onStageResized);
        this.#events.on(EVENTS.STAGE_CHANGED, this.#onStageChanged);
        this.#events.on(EVENTS.SLIDE_SCROLL, this.#onSlideScroll);
    }

    #detachEvents() {
        this.#stageDom.removeEventListener("pointerdown", this.#dragStart);
        window.removeEventListener("pointermove", this.#dragMove);
        window.removeEventListener("pointerup", this.#dragEnd);
        window.removeEventListener("pointercancel", this.#dragCancel);

        this.#events.off(EVENTS.PAGE_CHANGED, this.#updateProps);
        this.#events.off(EVENTS.STAGE_RESIZED, this.#onStageResized);
        this.#events.off(EVENTS.STAGE_CHANGED, this.#onStageChanged);
        this.#events.off(EVENTS.SLIDE_SCROLL, this.#onSlideScroll);
    }

    #getInput = (e: PointerEvent) => this.#config.vertical ? e.clientY : e.clientX;

    #updateProps = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGED]) => {
        this.#currentTranslate = e.currentTranslate;
    }

    #dragStart = (e: PointerEvent) => {
        if (this.#stageDom === null)
            throw error("Drag start failed! Stage was not found!");

        if (e.pointerType === "touch" && !this.#config.touchDrag) {
            return;
        }

        if (e.pointerType === "mouse" && !this.#config.mouseDrag) {
            return;
        }

        const dragState = {
            currentTranslate: this.#currentTranslate
        };

        this.#events.emit(EVENTS.DRAG_PRE_START, dragState);

        // read back modified value
        this.#currentTranslate = dragState.currentTranslate;

        const startPoint = this.#getInput(e);
        if (startPoint == undefined) {
            return;
        }

        this.#isDragging = true;
        this.#pointerStart = startPoint;
        this.#pointerOffset = this.#pointerStart + -(this.#currentTranslate);
        this.#dragStartTranslate = this.#currentTranslate;
        this.#currentTouch = this.#currentTranslate;
        this.#stayOnThisSlide = false;
        this.#lastTouch = this.#currentTranslate;
        this.#pointerId = e.pointerId;
        this.#stageDom.setPointerCapture(e.pointerId);

        this.#events.emit(EVENTS.DRAG_START);
    }

    #rebaseDrag(newTranslate: number, currentPointer: number) {
        this.#currentTranslate = newTranslate;
        this.#currentTouch = newTranslate;
        this.#dragStartTranslate = newTranslate;

        // recreate drag origin from current pointer
        this.#pointerStart = currentPointer;
        this.#pointerOffset = currentPointer - newTranslate;
    }

    #dragMove = (e: PointerEvent) => {
        if (!this.#isDragging || e.pointerId !== this.#pointerId) {
            return;
        }

        if (this.#stageDom === null) {
            throw error("Dragging failed! Stage was not found!");
        }

        const input = this.#getInput(e);

        this.#lastTouch = this.#currentTouch;

        //disable transition to get more responsive dragging
        this.#stageDom.style.transitionDuration = `${this.#config.swipeSmooth}s`;

        //calcualte swipe distance between starging value cnd current value
        this.#swipeDistance = Math.abs(input - this.#pointerStart);

        //get the current touch
        this.#currentTouch = input - this.#pointerOffset;

        //move slider until max swipe lenght is reached
        if (this.#config.touchMaxSlideDist < 1 || this.#swipeDistance <= this.#config.touchMaxSlideDist) {
            const state: CarouselEvents[typeof EVENTS.DRAG_DRAGGING] = {
                currentTranslate: this.#currentTouch,
                delta: this.#swipeDistance,
                direction: this.#currentTouch < this.#lastTouch ? "left" : "right",
                rebase: false
            };

            if (this.#config.loop) {
                const slideIndexes = getClosestSlideIndexes(this.#slideOffsets, this.#viewportCenter, this.#currentTouch, ["left", "right"]);
                state.slideIndexLeft = slideIndexes.left;
                state.slideIndexRight = slideIndexes.right;
            }

            this.#events.emit(EVENTS.DRAG_DRAGGING, state);

            this.#currentTouch = state.currentTranslate
            if (state.rebase) {
                this.#rebaseDrag(this.#currentTouch, input);
            }

            scrollToPos(this.#stageDom, this.#currentTouch, this.#config.vertical);
        } else {
            this.#stayOnThisSlide = true;
            this.#currentTouch = input - this.#pointerOffset;
        }
    }

    #dragEnd = (e: PointerEvent) => {
        // make sure multi-touch won't interrupt the current drag
        if (!this.#isDragging || e.pointerId !== this.#pointerId) {
            return;
        }

        this.#events.emit(EVENTS.DRAG_END);

        // if swipe threshold is not enough, scroll to original position
        if (this.#config.dragSnapMode === DragSnapMode.Swipe && (this.#swipeDistance < this.#config.touchSwipeThreshold || this.#stayOnThisSlide)) {
            this.#revertDrag();
            return;
        }

        switch (this.#config.dragSnapMode) {
            case DragSnapMode.Closest: {
                const closestIndex = getClosestSlideIndexes(this.#slideOffsets, this.#viewportCenter, this.#currentTouch, ["center"]);
                this.#events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: closestIndex.center });
                break;
            }

            case DragSnapMode.Swipe: {
                const isDraggingRight = this.#currentTouch > this.#dragStartTranslate;
                const targetIndex = isDraggingRight ? "prev" : "next";

                // if out of bounds, scroll to original position
                /*if (targetIndex < 0 || targetIndex >= this.#totalPages) {
                    this.#revertDrag();
                    return;
                }*/

                this.#events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: targetIndex });
                break;
            }
        }

        this.#finishDrag();
    }

    #dragCancel = (e: PointerEvent) => {
        // make sure multi-touch won't interrupt the current drag
        if (!this.#isDragging || e.pointerId !== this.#pointerId) {
            return;
        }

        this.#revertDrag();
    }

    #revertDrag() {
        scrollToPos(this.#stageDom, this.#dragStartTranslate, this.#config.vertical);
        this.#finishDrag();
    }

    #finishDrag() {
        this.#resetTransitionDuration();
        this.#isDragging = false;
        this.#pointerId = null;
    }

    #resetTransitionDuration = () => this.#stageDom.style.transitionDuration = `${this.#config.slideChangeDuration}s`;

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

        const { vertical } = this.#config;

        const viewportSize = vertical ? container.clientHeight : container.clientWidth;
        this.#viewportCenter = viewportSize / 2;
        this.#slideOffsets = getSlidesOffsets(this.#slides, vertical)
    }

    #getDomSlides = (): HTMLDivElement[] => Array.from(this.#stageDom.children) as HTMLDivElement[];
}
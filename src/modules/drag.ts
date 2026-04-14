import { CSS_CLASSES } from "../constants/css-classes";
import { EVENTS } from "../constants/events-list";
import { BaseModule } from "../core/base-module";
import type { ModuleLoaderParams } from "../types/module.params";
import { ModuleName } from "../core/module-names";
import type { CarouselEvents } from "../types/event.types";
import { error } from "../utils/error-handler";
import { scrollToPos } from "../utils/scroll";

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

    #currentPage!: number;
    #totalPages!: number;

    constructor(params: ModuleLoaderParams) {
        super(params);

        const stage = document.querySelector<HTMLDivElement>(`${this.config.container} .${CSS_CLASSES.stage}`);
        if (stage === null)
            throw error("Drag module won't initialize! Stage DOM was not found!");

        this.#stageDom = stage;

        this.emitCreated();
    }

    get shouldInitialize() {
        return this.config.touchDrag || this.config.mouseDrag;
    }

    initialize() {
        this.#attachEvents();
        this.#stageDom.classList.add(CSS_CLASSES.disabled);

        this.emitInitialized();
    }

    destroy() {
        this.#detachEvents();
        this.#stageDom.classList.remove(CSS_CLASSES.disabled);

        this.emitDestroyed();
    }

    #attachEvents() {
        const status: CarouselEvents[typeof EVENTS.PAGE_CHANGE] = {
            currentTranslate: this.status.currentTranslate,
            currentPage: this.status.currentPage,
            slidesActive: []
        }

        this.#updateProps(status);

        window.addEventListener("pointerdown", this.#dragStart);
        window.addEventListener("pointermove", this.#dragMove);
        window.addEventListener("pointerup", this.#dragEnd);

        this.events.on(EVENTS.PAGE_CHANGE, this.#updateProps);
    }

    #detachEvents() {
        window.removeEventListener("pointerdown", this.#dragStart);
        window.removeEventListener("pointermove", this.#dragMove);
        window.removeEventListener("pointerup", this.#dragEnd);

        this.events.off(EVENTS.PAGE_CHANGE, this.#updateProps);
    }

    #getInput = (e: PointerEvent) => this.config.vertical ? e.clientY : e.clientX;

    #updateProps = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGE]) => {
        this.#currentTranslate = e.currentTranslate;
        this.#currentPage = e.currentPage;
    }

    #dragStart = (e: PointerEvent) => {
        if (this.#stageDom === null)
            throw error("Drag start failed! Stage was not found!");

        const target = e.target;
        if (!(target instanceof Node))
            return;

        if (!this.#stageDom.contains(target))
            return;

        if (e.pointerType === "touch" && !this.config.touchDrag)
            return;

        if (e.pointerType === "mouse" && !this.config.mouseDrag)
            return;

        const startPoint = this.#getInput(e);
        if (startPoint == undefined)
            return;

        this.#isDragging = true;
        this.#touchStartRawCords = startPoint;
        this.#touchStartCords = this.#touchStartRawCords + -(this.#currentTranslate);
        this.#origPosition = this.#currentTranslate;
        this.#stayOnThisSlide = false;
        this.events.emit(EVENTS.DRAG_START);
    }

    #dragMove = (e: PointerEvent) => {
        if (!this.#isDragging)
            return;

        if (this.#stageDom === null)
            throw error("Dragging failed! Stage was not found!");

        const input = this.#getInput(e);

        //disable transition to get more responsive dragging
        this.#stageDom.style.transitionDuration = this.config.swipeSmooth + "s";

        //calcualte swipe distance between starging value cnd current value
        this.#swipeDistance = Math.abs(input - this.#touchStartRawCords);

        //get the current touch
        this.#currentTouch = input - this.#touchStartCords;

        //move slider until max swipe lenght is reached
        if (this.#swipeDistance <= this.config.touchMaxSlideDist) {
            this.events.emit(EVENTS.DRAG_DRAGGING);
            scrollToPos(this.#stageDom, this.#currentTouch, this.config.vertical);
        } else {
            this.#stayOnThisSlide = true;
            this.#currentTouch = input - this.#touchStartCords;
        }
    }

    #dragEnd = () => {
        if (!this.#isDragging)
            return;

        this.events.emit(EVENTS.DRAG_END);

        // if swipe threshold is not enough, scroll to original position
        if (this.#swipeDistance < this.config.touchSwipeThreshold || this.#stayOnThisSlide) {
            this.#revertDrag();
            return;
        }

        const isLeftDirection = this.#currentTouch > this.#origPosition;
        const targetIndex = isLeftDirection ? "prev" : "next";

        // if out of bounds, scroll to original position
        /*if (targetIndex < 0 || targetIndex >= this.#totalPages) {
            this.#revertDrag();
            return;
        }*/

        this.events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: targetIndex });

        this.#resetTransitionDuration();
        this.#isDragging = false;
    }

    #revertDrag() {
        scrollToPos(this.#stageDom, this.#origPosition, this.config.vertical);
        this.#resetTransitionDuration();
        this.#isDragging = false;
    }

    #resetTransitionDuration = () => this.#stageDom.style.transitionDuration = this.config.slideChangeDuration + "s";
}
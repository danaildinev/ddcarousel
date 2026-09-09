import { EVENTS } from "../constants/events-list";
import { BaseModule } from "../core/base-module";
import type { ModuleContext } from "../types/module.params";

export type MouseWheelConfig = {
    threshold: number;
    delay: number;
}

type Direction = "prev" | "next";

export default class MouseWheel extends BaseModule {
    static id = "mouseWheel";
    id = MouseWheel.id;

    moduleConfig: MouseWheelConfig = {
        threshold: 40,
        delay: 0,
    };

    #delta = 0;
    #isLocked = false;
    #unlockTimeout?: ReturnType<typeof setTimeout>;

    constructor(params: ModuleContext) {
        super(params);
    }

    initialize() {
        this.container.addEventListener("wheel", this.#onWheel, { passive: false });

        this.events.on(EVENTS.TRANSITION_END, this.#onTransitionEnd);
    }

    destroy() {
        this.#delta = 0;
        this.#isLocked = false;

        this.container.removeEventListener("wheel", this.#onWheel);

        this.events.off(EVENTS.TRANSITION_END, this.#onTransitionEnd);
        clearTimeout(this.#unlockTimeout);
    }

    #onWheel = (e: WheelEvent) => {
        // skip when user try to zoom the browser page or nested carousel
        if (e.ctrlKey || this.#isNestedCarousel(e.target)) {
            return;
        }

        const delta = this.#getDelta(e);
        if (delta === 0) {
            return;
        }

        const direction: Direction = delta > 0 ? "next" : "prev";
        if (!this.#canChangePage(direction)) {
            return;
        }

        e.preventDefault();

        if (this.#isLocked) {
            return;
        }

        this.#delta += delta;
        const threshold = this.getResolvedConfig("threshold") as number ?? this.moduleConfig.threshold;
        if (Math.abs(this.#delta) < threshold) {
            return;
        }

        this.#delta = 0;

        const oldPage = this.getStatus().currentPage;

        this.events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: direction });

        if (this.getStatus().currentPage === oldPage) {
            return;
        }

        this.#isLocked = true;

        if (this.config.slideChangeDuration <= 0) {
            this.#unlock();
        }
    };

    #onTransitionEnd = () => {
        if (!this.#isLocked) {
            return;
        }

        this.#unlock();
    };

    #unlock() {
        clearTimeout(this.#unlockTimeout);

        const delay = (this.getResolvedConfig("delay") as number) ?? this.moduleConfig.delay;
        if (delay <= 0) {
            this.#isLocked = false;
            return;
        }

        this.#unlockTimeout = setTimeout(() => this.#isLocked = false, delay);
    }

    #getDelta(e: WheelEvent) {
        let delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

        if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) {
            delta *= 16;
        } else if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
            delta *= window.innerHeight;
        }

        return delta;
    }

    #isNestedCarousel(target: EventTarget | null) {
        if (!(target instanceof Element)) {
            return false;
        }

        const carousel = target.closest(".ddcarousel");
        return carousel !== null && carousel !== this.container;
    }

    #canChangePage(direction: Direction) {
        const status = this.getStatus();

        if (status.totalPages <= 0) {
            return false;
        }

        if (status.modules.includes("loop")) {
            return true;
        }

        return direction === "prev" ? status.currentPage > 0 : status.currentPage < status.totalPages;
    }
}
import type { DOMWindow } from "jsdom";

export const resizeObservers = new Set<ResizeObserverCallback>();

export function installDomMocks(window: DOMWindow) {
    const MouseEventBase = window.MouseEvent;

    class ResizeObserverMock {
        #callback: ResizeObserverCallback;

        constructor(callback: ResizeObserverCallback) {
            this.#callback = callback;
            resizeObservers.add(callback);
        }

        observe() { }
        unobserve() { }

        disconnect() {
            resizeObservers.delete(this.#callback);
        }
    }

    class PointerEventMock extends MouseEventBase {
        pointerType: string;

        constructor(type: string, init: PointerEventInit = {}) {
            super(type, init);
            this.pointerType = init.pointerType ?? "";
        }
    }

    window.ResizeObserver = ResizeObserverMock as any;
    window.PointerEvent = PointerEventMock as any;

    (globalThis as any).ResizeObserver = window.ResizeObserver;
    (globalThis as any).PointerEvent = window.PointerEvent;

    (globalThis as any).triggerResizeObservers = () => {
        resizeObservers.forEach(cb => cb([], {} as ResizeObserver));
    };
}

// ---- helpers ----

const parsePx = (value: string | null) => {
    const n = Number.parseFloat(value ?? "");
    return Number.isFinite(n) ? n : 0;
};

const getElementWidth = (el: HTMLElement) =>
    parsePx(el.style.width) || parsePx(getComputedStyle(el).width);

const getElementHeight = (el: HTMLElement) =>
    parsePx(el.style.height) || parsePx(getComputedStyle(el).height);

// ---- DOM overrides ----

Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get() {
        return getElementWidth(this);
    },
});

Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() {
        return getElementHeight(this);
    },
});

Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
    configurable: true,
    get() {
        const slide = this.dataset?.slide;
        if (slide === undefined) {
            return 0;
        }

        return Number(slide) * getElementWidth(this);
    },
});

Object.defineProperty(HTMLElement.prototype, "offsetTop", {
    configurable: true,
    get() {
        const slide = this.dataset?.slide;
        if (slide === undefined) {
            return 0;
        }

        return Number(slide) * getElementHeight(this);
    },
});

HTMLElement.prototype.getBoundingClientRect = function () {
    const width = getElementWidth(this);
    const height = getElementHeight(this);
    const left = this.offsetLeft;
    const top = this.offsetTop;

    return {
        x: left,
        y: top,
        left,
        top,
        width,
        height,
        right: left + width,
        bottom: top + height,
        toJSON: () => ({}),
    } as DOMRect;
};
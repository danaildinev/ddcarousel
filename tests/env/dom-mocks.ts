import type { DOMWindow } from "jsdom";

export const resizeObservers = new Set<ResizeObserverMock>();

class ResizeObserverMock implements ResizeObserver {
    #callback: ResizeObserverCallback;
    private targets = new Set<Element>();

    constructor(callback: ResizeObserverCallback) {
        this.#callback = callback;
        resizeObservers.add(this);
    }

    observe(target: Element) {
        this.targets.add(target);
    }

    unobserve(target: Element) {
        this.targets.delete(target);
    }

    disconnect() {
        this.targets.clear();
        resizeObservers.delete(this);
    }

    trigger(width?: number, height?: number) {
        const entries = [...this.targets].map(target => {
            const rect = target.getBoundingClientRect();

            return {
                target,
                contentRect: {
                    width: width ?? rect.width,
                    height: height ?? rect.height,
                },
            } as ResizeObserverEntry;
        });

        if (entries.length > 0) {
            this.#callback(entries, this);
        }
    }
}

export function installDomMocks(window: DOMWindow) {
    const MouseEventBase = window.MouseEvent;

    class PointerEventMock extends MouseEventBase {
        pointerType: string;
        pointerId: number;
        isPrimary: boolean;

        constructor(type: string, init: PointerEventInit = {}) {
            // Ensure standard mouse properties like button/buttons are defaulted safely
            super(type, { button: 0, buttons: 1, ...init });

            this.pointerType = init.pointerType ?? "mouse";
            this.pointerId = init.pointerId ?? 1;          // <-- Crucial for pointer tracking
            this.isPrimary = init.isPrimary ?? true;       // <-- Crucial for ignoring multi-touch
        }
    }

    window.ResizeObserver = ResizeObserverMock as any;
    window.PointerEvent = PointerEventMock as any;

    (globalThis as any).ResizeObserver = window.ResizeObserver;
    (globalThis as any).PointerEvent = window.PointerEvent;

    (globalThis as any).triggerResizeObservers = (width?: number, height?: number) => {
        for (const observer of resizeObservers) {
            observer.trigger(width, height);
        }
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
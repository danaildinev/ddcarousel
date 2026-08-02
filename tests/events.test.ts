import { afterEach, describe, expect, it, vi } from "vitest";
import Carousel from "../src/core/carousel";
import { EVENTS } from "../src/constants/events-list";
import { baseConfig, renderCarousel, stage, triggerResizeObservers } from "./helpers";
import { CarouselEvents } from "../src/types/event.types";
import { fireEvent } from "@testing-library/dom";

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
});

describe("Carousel events", () => {
    it("emits initialize and initialized lifecycle events", async () => {
        renderCarousel(1);

        const initialize = vi.fn();
        const initialized = vi.fn();

        const carousel = new Carousel();
        carousel.on(EVENTS.INITIALIZE, initialize);
        carousel.on(EVENTS.INITIALIZED, initialized);
        await carousel.init();

        expect(initialize).toHaveBeenCalledTimes(1);
        expect(initialized).toHaveBeenCalledTimes(1);
    });

    it("emits destroy and destroyed lifecycle events", () => {
        renderCarousel(1);
        const carousel = new Carousel(baseConfig());
        const destroying = vi.fn();
        const destroyed = vi.fn();

        carousel.on(EVENTS.DESTROY, destroying);
        carousel.on(EVENTS.DESTROYED, destroyed);
        carousel.destroy(true);

        expect(destroying).toHaveBeenCalledTimes(1);
        expect(destroyed).toHaveBeenCalledTimes(1);
    });

    it("emits stage created during initialization", async () => {
        renderCarousel(1);

        const listener = vi.fn();

        const carousel = new Carousel();
        carousel.on(EVENTS.STAGE_CREATED, listener);
        await carousel.init();

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it("emits config applied after configuration refresh", async () => {
        renderCarousel(1);

        const carousel = new Carousel();
        const listener = vi.fn();

        carousel.on(EVENTS.CONFIG_APPLIED, listener);
        await carousel.init(baseConfig({
            responsive: {
                300: {
                    items: 1,
                },
            },
        }))

        stage()!.style.width = "250px";
        expect(stage()!.style.width).toBe("250px");
        //expect(listener).toHaveBeenCalledTimes(1);
        const event = listener.mock.calls[0][0];
        expect(event.new.items).toBe(1);
    });

    it("emits page change request before changing pages", () => {
        renderCarousel(3);

        const carousel = new Carousel(baseConfig());
        const listener = vi.fn();

        carousel.on(EVENTS.PAGE_CHANGE_REQUEST, listener);
        carousel.changePage(2, false);

        expect(listener).toHaveBeenCalledWith(expect.objectContaining({
            animate: false,
            index: 2,
        } as CarouselEvents[typeof EVENTS.PAGE_CHANGE_REQUEST]));
    });

    it("lets registered event listeners observe page changes", () => {
        renderCarousel(3);
        const carousel = new Carousel(baseConfig());
        const listener = vi.fn();

        carousel.on(EVENTS.PAGE_CHANGED, listener);
        carousel.changePage(1, false);

        expect(listener).toHaveBeenCalledWith(expect.objectContaining({
            currentPage: 1,
            slidesActive: [1],
        }));
    });

    it("supports legacy event aliases", () => {
        renderCarousel(3);
        const carousel = new Carousel(baseConfig());
        const listener = vi.fn();

        carousel.on("onChanged", listener);
        carousel.changePage(1, false);

        expect(listener).toHaveBeenCalledWith(expect.objectContaining({ currentPage: 1 }));
    });

    it("emits scroll-before and scroll-after events around page changes", async () => {
        renderCarousel(3);

        const carousel = new Carousel(baseConfig());
        await carousel.init();

        const beforeValues: CarouselEvents[typeof EVENTS.PAGE_CHANGE_SCROLL_BEFORE][] = [];
        const afterValues: CarouselEvents[typeof EVENTS.PAGE_CHANGE_SCROLL_AFTER][] = [];

        carousel.on(EVENTS.PAGE_CHANGE_SCROLL_BEFORE, (status: CarouselEvents[typeof EVENTS.PAGE_CHANGE_SCROLL_BEFORE]) => {
            beforeValues.push({ ...status });
        });
        carousel.on(EVENTS.PAGE_CHANGE_SCROLL_AFTER, (status: CarouselEvents[typeof EVENTS.PAGE_CHANGE_SCROLL_AFTER]) => {
            afterValues.push({ ...status });
        });
        carousel.changePage(1, false);

        expect(beforeValues[0].currentTranslate).toBe(-0);
        expect(afterValues[0].currentTranslate).toBe(-920);
    });

    it("lets page-change-index handlers override requested pages", () => {
        renderCarousel(4);
        const carousel = new Carousel(baseConfig());
        const handler = vi.fn(payload => {
            if (payload.request === "next") {
                payload.page = 3;
                payload.handled = true;
            }
        });

        carousel.on(EVENTS.PAGE_CHANGE_INDEX, handler);
        carousel.nextPage();

        expect(handler).toHaveBeenCalledWith(expect.objectContaining({
            request: "next",
            currentPage: 0,
            totalPages: 3,
        }));
        expect(carousel.getCurrentPage()).toBe(3);
    });

    it("emits transition end when the stage transition finishes", () => {
        renderCarousel(2);
        const carousel = new Carousel(baseConfig());
        const listener = vi.fn();
        carousel.on(EVENTS.TRANSITION_END, listener);

        stage()?.dispatchEvent(new Event("transitionend"));

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it("emits stage resized after resize observer throttling", async () => {
        vi.useFakeTimers();

        renderCarousel(2);

        const carousel = new Carousel(baseConfig({ resizeRefresh: 25 }));
        const listener = vi.fn();

        carousel.on(EVENTS.STAGE_RESIZED, listener);
        triggerResizeObservers();
        vi.runAllTicks();

        expect(listener).not.toHaveBeenCalled();
        vi.advanceTimersByTime(25);
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it("emits stage changed when there are changes in the stage", async () => {
        renderCarousel(2);
        const carousel = new Carousel(baseConfig());
        const listener = vi.fn();
        carousel.on(EVENTS.STAGE_CHANGED, listener);

        stage()?.appendChild(document.createElement("div"));
        await Promise.resolve();

        expect(listener).toHaveBeenCalledWith({ log: "childList" });
    });

    it("emits drag lifecycle events for mouse dragging", async () => {
        renderCarousel(5);

        const pre = vi.fn();
        const dragStart = vi.fn();
        const dragging = vi.fn();
        const dragEnd = vi.fn();

        const carousel = new Carousel(baseConfig());
        await carousel.init();

        carousel.on(EVENTS.DRAG_PRE_START, pre);
        carousel.on(EVENTS.DRAG_START, dragStart);
        carousel.on(EVENTS.DRAG_DRAGGING, dragging);
        carousel.on(EVENTS.DRAG_END, dragEnd);

        fireEvent.pointerDown(stage()!, { clientX: 10, clientY: 5, pointerType: "mouse" });
        fireEvent.pointerMove(window, { clientX: 50, clientY: 5, pointerType: "mouse" });
        fireEvent.pointerUp(window, { clientX: 60, clientY: 5, pointerType: "mouse" });

        expect(pre).toHaveBeenCalledTimes(1);
        expect(dragStart).toHaveBeenCalledTimes(1);
        expect(dragging).toHaveBeenCalledWith(expect.objectContaining({
            currentTranslate: 40,
            delta: 40,
            direction: "right",
            rebase: false
        } as CarouselEvents[typeof EVENTS.DRAG_DRAGGING]));
        expect(dragEnd).toHaveBeenCalledTimes(1);
    });
});

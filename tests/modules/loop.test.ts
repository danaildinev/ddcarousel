import { afterEach, describe, expect, it, vi } from "vitest";
import Carousel from "../../src/core/carousel";
import { baseConfig, container, renderCarousel, stage } from "../helpers";
import { CSS_CLASSES } from "../../src/constants/css-classes";
import { DATA } from "../../src/constants/data-attrs";
import { CarouselEvents } from "../../src/types/event.types";
import { EVENTS } from "../../src/constants/events-list";
import { fireEvent } from "@testing-library/dom";
import Loop from "../../src/modules/loop";

const getSlideOrder = (): number[] =>
    Array.from(container()!.querySelectorAll<HTMLDivElement>(`.${CSS_CLASSES.item}`)).map(slide => Number(slide.getAttribute(DATA.attrs.slide)));

const expectSlidesContiguous = (expected: number[]) => {
    const order = getSlideOrder();
    const start = order.indexOf(expected[0]!);

    expect(start).toBeGreaterThanOrEqual(0);
    expect(order.slice(start, start + expected.length)).toEqual(expected);
};

const normalizeIndex = (index: number, totalSlides: number) => ((index % totalSlides) + totalSlides) % totalSlides;
const getCenteredWindow = (center: number, totalSlides: number, items: number): number[] => {
    const before = Math.floor(items / 2);
    const after = items - before - 1;
    const slides: number[] = [];

    for (let offset = -before; offset <= after; offset++) {
        slides.push(normalizeIndex(center + offset, totalSlides));
    }

    return slides;
};

const createRect = (left: number, top: number, width: number, height: number): DOMRect => ({
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({})
}) as DOMRect;

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
});

describe("Loop module", () => {
    describe("page wrapping", () => {
        it("wraps page requests when loop is enabled", async () => {
            renderCarousel(3);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 1,
            }));

            await carousel.ready;

            carousel.prevPage();
            expect(carousel.getCurrentPage()).toBe(2);

            carousel.nextPage();
            expect(carousel.getCurrentPage()).toBe(0);
        });

        it("moves to the previous page from the first page", async () => {
            renderCarousel(5);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 1,
            }));

            await carousel.ready;

            carousel.prevPage();
            expect(carousel.getCurrentPage()).toBe(4);
        });

        it("moves to the next page from the last page", async () => {
            renderCarousel(5);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 1,
            }));

            await carousel.ready;

            carousel.changePage(4, false);
            carousel.nextPage();

            expect(carousel.getCurrentPage()).toBe(0);
        });
    });

    describe("centered slides", () => {
        it("prepares neighbouring slides when starting from the first page", async () => {
            renderCarousel(5);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 3,
                centerSlide: true,
            }));

            await carousel.ready;

            expect(getSlideOrder()).toEqual([4, 0, 1, 2, 3]);
            expectSlidesContiguous([4, 0, 1]);
        });

        it("prepares multiple neighbouring slides for items greater than 3", async () => {
            renderCarousel(7);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 5,
                centerSlide: true,
            }));

            await carousel.ready;

            expectSlidesContiguous([5, 6, 0, 1, 2]);
        });

        it("prepares the previous centered window when wrapping backwards", async () => {
            renderCarousel(5);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 3,
                centerSlide: true,
            }));

            await carousel.ready;

            carousel.prevPage();

            expect(carousel.getCurrentPage()).toBe(4);
            expectSlidesContiguous([3, 4, 0]);
        });

        it("prepares the first centered window when wrapping forwards", async () => {
            renderCarousel(5);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 3,
                centerSlide: true,
            }));

            await carousel.ready;

            carousel.changePage(4, false);
            expectSlidesContiguous([3, 4, 0]);

            carousel.nextPage();
            expect(carousel.getCurrentPage()).toBe(0);

            expectSlidesContiguous([4, 0, 1]);
        });

        it("keeps the centered window contiguous through repeated next loops", async () => {
            const totalSlides = 7;
            const items = 3;

            renderCarousel(totalSlides);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items,
                centerSlide: true,
            }));

            await carousel.ready;

            for (let i = 0; i < 20; i++) {
                carousel.nextPage();

                const current = carousel.getCurrentPage();
                expectSlidesContiguous(getCenteredWindow(current, totalSlides, items));
            }
        });

        it("keeps the centered window contiguous through repeated previous loops", async () => {
            const totalSlides = 7;
            const items = 3;

            renderCarousel(totalSlides);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items,
                centerSlide: true,
            }));

            await carousel.ready;

            for (let i = 0; i < 20; i++) {
                carousel.prevPage();

                const current = carousel.getCurrentPage();
                expectSlidesContiguous(getCenteredWindow(current, totalSlides, items));
            }
        });

        it("keeps centered neighbours correct when gap is enabled", async () => {
            renderCarousel(5);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 3,
                centerSlide: true,
                gap: 20,
            }));

            await carousel.ready;

            expectSlidesContiguous([4, 0, 1]);

            carousel.prevPage();
            expectSlidesContiguous([3, 4, 0]);

            carousel.nextPage();
            expectSlidesContiguous([4, 0, 1]);
        });
    });

    describe("non-centered slides", () => {
        it("does not reorder slides on initialization", async () => {
            renderCarousel(6);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 3,
                centerSlide: false,
            }));

            await carousel.ready;

            expect(getSlideOrder()).toEqual([0, 1, 2, 3, 4, 5]);
        });

        it("moves the first page after the last page when wrapping forwards", async () => {
            renderCarousel(6);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 3,
                centerSlide: false,
            }));

            await carousel.ready;

            carousel.changePage(1, false);
            expect(carousel.getCurrentPage()).toBe(1);

            carousel.nextPage();
            expect(carousel.getCurrentPage()).toBe(0);

            // The first logical page must now physically follow the previous last page: 3 4 5 | 0 1 2
            expect(getSlideOrder()).toEqual([3, 4, 5, 0, 1, 2]);
        });

        it("continues forwards after wrapping from last to first", async () => {
            renderCarousel(6);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 3,
                centerSlide: false,
            }));

            await carousel.ready;

            carousel.changePage(1, false);
            carousel.nextPage();

            expect(getSlideOrder()).toEqual([3, 4, 5, 0, 1, 2]);

            /*
             * Regression test:
             *
             * Previously next() here visually jumped backwards
             * because page 1 was still physically before page 0.
             */
            carousel.nextPage();

            expect(carousel.getCurrentPage()).toBe(1);
            expect(getSlideOrder()).toEqual([0, 1, 2, 3, 4, 5]);
            expectSlidesContiguous([3, 4, 5]);
        });

        it("moves the last page before the first page when wrapping backwards", async () => {
            renderCarousel(6);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 3,
                centerSlide: false,
            }));

            await carousel.ready;

            carousel.prevPage();
            expect(carousel.getCurrentPage()).toBe(1);

            expect(getSlideOrder()).toEqual([3, 4, 5, 0, 1, 2]);
        });

        it("continues backwards after wrapping from first to last", async () => {
            renderCarousel(6);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 3,
                centerSlide: false,
            }));

            await carousel.ready;

            carousel.prevPage();
            expect(getSlideOrder()).toEqual([3, 4, 5, 0, 1, 2]);

            /*
             * Regression test for the old slide-order reversal /
             * backwards-scroll issue.
             */
            carousel.prevPage();

            expect(carousel.getCurrentPage()).toBe(0);
            expect(getSlideOrder()).toEqual([0, 1, 2, 3, 4, 5]);
            expectSlidesContiguous([0, 1, 2]);
        });

        it("keeps all slides exactly once after many next loops", async () => {
            renderCarousel(6);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 3,
                centerSlide: false,
            }));

            await carousel.ready;

            for (let i = 0; i < 20; i++) {
                carousel.nextPage();

                const order = getSlideOrder();

                expect(order).toHaveLength(6);
                expect(new Set(order).size).toBe(6);
                expectSlidesContiguous(carousel.getStatus().activeSlides);
            }
        });

        it("keeps all slides exactly once after many previous loops", async () => {
            renderCarousel(6);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 3,
                centerSlide: false,
            }));

            await carousel.ready;

            for (let i = 0; i < 20; i++) {
                carousel.prevPage();

                const order = getSlideOrder();

                expect(order).toHaveLength(6);
                expect(new Set(order).size).toBe(6);
                expectSlidesContiguous(carousel.getStatus().activeSlides);
            }
        });

        it("keeps overlapping itemPerPage targets contiguous after DOM rotation", async () => {
            renderCarousel(6);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 3,
                itemPerPage: true,
                centerSlide: false,
            }));

            await carousel.ready;

            // Last finite page: [3, 4, 5]
            carousel.changePage(3, false);

            // Wrap to: [0, 1, 2]
            // DOM becomes approximately: 3 4 5 | 0 1 2
            carousel.nextPage();
            expect(carousel.getCurrentPage()).toBe(0);
            expectSlidesContiguous([0, 1, 2]);

            // Next page overlaps:
            // current: [0, 1, 2]
            // target:  [1, 2, 3]
            // Regression test: target slides must not become split in DOM as `3 ... 1 2`.
            carousel.nextPage();
            expect(carousel.getCurrentPage()).toBe(1);
            expectSlidesContiguous([1, 2, 3]);
        });

        it("keeps non-centered pages ordered with gap enabled", async () => {
            renderCarousel(6);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 3,
                centerSlide: false,
                gap: 20,
            }));

            await carousel.ready;

            carousel.changePage(1, false);
            carousel.nextPage();
            expectSlidesContiguous([0, 1, 2]);

            carousel.nextPage();
            expectSlidesContiguous([3, 4, 5]);
        });
    });

    describe("drag looping", () => {
        it("moves the last DOM slide to the beginning when dragging beyond the start", async () => {
            renderCarousel(5);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 1,
                centerSlide: false,
                mouseDrag: true,
            }));

            await carousel.ready;

            const stageDom = stage()!;
            const viewport = stageDom.parentElement!;
            const slides = Array.from(stageDom.children) as HTMLDivElement[];

            vi.spyOn(viewport, "getBoundingClientRect").mockReturnValue(createRect(0, 0, 300, 100));

            // Calculate slide coordinates dynamically from their
            // CURRENT DOM position. +10 intentionally exposes 10px before the first slide,
            // making Loop rotate last -> first.
            for (const slide of slides) {
                vi.spyOn(slide, "getBoundingClientRect").mockImplementation(() => {
                    const index = Array.from(stageDom.children).indexOf(slide);
                    return createRect(10 + index * 100, 0, 100, 100);
                });
            }

            let draggingPayload: CarouselEvents[typeof EVENTS.DRAG_DRAGGING] | undefined;

            carousel.on(EVENTS.DRAG_DRAGGING, e => {
                draggingPayload = e;
            });

            fireEvent.pointerDown(stageDom, { pointerId: 1, clientX: 100, clientY: 10, pointerType: "mouse" });
            fireEvent.pointerMove(window, { pointerId: 1, clientX: 140, clientY: 10, pointerType: "mouse" });

            expect(getSlideOrder()).toEqual([4, 0, 1, 2, 3]);
            expect(draggingPayload?.rebase).toBe(true);

            fireEvent.pointerUp(window, { pointerId: 1, clientX: 140, clientY: 10, pointerType: "mouse" });
        });

        it("moves the first DOM slide to the end when dragging beyond the end", async () => {
            renderCarousel(5);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 1,
                centerSlide: false,
                mouseDrag: true,
            }));

            await carousel.ready;

            const stageDom = stage()!;
            const viewport = stageDom.parentElement!;
            const slides = Array.from(stageDom.children) as HTMLDivElement[];

            vi.spyOn(viewport, "getBoundingClientRect").mockReturnValue(createRect(0, 0, 300, 100));

            /*
             * Last slide ends at 290px while viewport ends at 300px.
             * Loop therefore needs first -> last.
             */
            for (const slide of slides) {
                vi.spyOn(slide, "getBoundingClientRect").mockImplementation(() => {
                    const index = Array.from(stageDom.children).indexOf(slide);
                    return createRect(-210 + index * 100, 0, 100, 100);
                });
            }

            let draggingPayload: CarouselEvents[typeof EVENTS.DRAG_DRAGGING] | undefined;

            carousel.on(EVENTS.DRAG_DRAGGING, e => {
                draggingPayload = e;
            });

            fireEvent.pointerDown(stageDom, { pointerId: 1, clientX: 100, clientY: 10, pointerType: "mouse" }); 0
            fireEvent.pointerMove(window, { pointerId: 1, clientX: 60, clientY: 10, pointerType: "mouse" });
            expect(getSlideOrder()).toEqual([1, 2, 3, 4, 0]);
            expect(draggingPayload?.rebase).toBe(true);
            fireEvent.pointerUp(window, { pointerId: 1, clientX: 60, clientY: 10, pointerType: "mouse" });
        });
    });

    describe("destroy", () => {
        it("restores the original slide order", async () => {
            renderCarousel(5);

            const carousel = new Carousel(baseConfig({
                loop: true,
                items: 3,
                centerSlide: true,
            }));

            await carousel.ready;

            expect(getSlideOrder()).toEqual([4, 0, 1, 2, 3]);

            const loop = carousel.module<Loop>("loop");
            loop.destroy();
            expect(getSlideOrder()).toEqual([0, 1, 2, 3, 4]);
        });
    });
});

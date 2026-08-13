import { afterEach, describe, expect, it, vi } from "vitest";
import Carousel from "../../src/core/carousel";
import { baseConfig, container, renderCarousel } from "../helpers";
import { CSS_CLASSES } from "../../src/constants/css-classes";
import { DATA } from "../../src/constants/data-attrs";

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
});

describe("Loop module", () => {
    it("wraps page requests when loop is enabled", async () => {
        renderCarousel(3);
        const carousel = new Carousel(baseConfig({ loop: true }));
        await carousel.ready;

        carousel.prevPage();
        expect(carousel.getCurrentPage()).toBe(2);

        carousel.nextPage();
        expect(carousel.getCurrentPage()).toBe(0);
    });

    it("enables centerSlide automatically when loop is enabled", async () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({
            loop: true,
            centerSlide: false,
        }));
        await carousel.ready;
    });

    it("does not wrap pages when loop is disabled", async () => {
        renderCarousel(3);

        const carousel = new Carousel(baseConfig({
            loop: false,
        }));
        await carousel.ready;

        carousel.prevPage();
        expect(carousel.getCurrentPage()).toBe(0);

        carousel.nextPage();
        carousel.nextPage();
        carousel.nextPage();
        expect(carousel.getCurrentPage()).toBe(2);
    });

    it("reorders slides when starting from the first page with centered slides", async () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({
            loop: true,
            items: 3,
            centerSlide: true,
        }));
        await carousel.ready;

        const slides = container()!.querySelectorAll(`.${CSS_CLASSES.item}`);
        expect(slides[0].getAttribute(DATA.attrs.slide)).toBe("4")
    });

    it("moves to previous page from the first page", async () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({
            loop: true,
            items: 1,
        }));
        await carousel.ready;

        expect(carousel.getCurrentPage()).toBe(0);

        carousel.prevPage();
        expect(carousel.getCurrentPage()).toBe(4);
    });

    it("moves to next page from the last page", async () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({
            loop: true,
            items: 1,
        }));
        await carousel.ready;

        carousel.changePage(4, false);
        expect(carousel.getCurrentPage()).toBe(4);

        carousel.nextPage();
        expect(carousel.getCurrentPage()).toBe(0);
    });

    it("keeps slides ordered after multiple next page loops", async () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({
            loop: true,
            items: 1,
        }));
        await carousel.ready;

        for (let i = 0; i < 10; i++) {
            carousel.nextPage();
        }

        expect(carousel.getCurrentPage()).toBe(0);
    });

    it("keeps slides ordered after multiple previous page loops", async () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({
            loop: true,
            items: 1,
        }));

        await carousel.ready;

        for (let i = 0; i < 10; i++) {
            carousel.prevPage();
        }

        expect(carousel.getCurrentPage()).toBe(0);
    });
});

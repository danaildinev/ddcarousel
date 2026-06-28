import { afterEach, describe, expect, it, vi } from "vitest";
import Carousel from "../src/core/carousel";
import { CSS_CLASSES } from "../src/constants/css-classes";
import { baseConfig, carouselCustomClass, container, items, renderCarousel, stage } from "./helpers";

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
});

describe("Carousel core", () => {
    it("should auto-initialize when custom config is passed to the constructor", async () => {
        renderCarousel(3);

        const customConfig = { items: 2 };
        const carousel = new Carousel(customConfig);
        await carousel.ready;

        expect(carousel.getStatus().state).toBe("ready");
    });

    it("should initialize manually with init using default config", async () => {
        renderCarousel(3);

        const carousel = new Carousel();
        await carousel.init();

        expect(carousel.getStatus().state).toBe("ready");
    });

    it('should initialize manually with a custom config', async () => {
        renderCarousel(4);

        const carousel = new Carousel();
        const apiConfig = { items: 4, drag: false };
        await carousel.init(apiConfig);

        expect(carousel.getStatus().state).toBe("ready");
    });

    it('should ignore duplicate initialization calls', async () => {
        renderCarousel(4, { className: 'carousel-container' });

        // spy on console.warn and suppress the actual output
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        const carousel = new Carousel({ container: '.carousel-container' });
        // trigger a second init immediately
        const secondInitPromise = carousel.init();

        await carousel.ready;
        await secondInitPromise;

        // assert the warning was fired exactly as expected
        expect(consoleSpy).toHaveBeenCalledWith("Already initialized!");

        // restore the original console.warn
        consoleSpy.mockRestore();
    });

    it("should auto-initialize when no custom config is passed to the constructor", async () => {
        renderCarousel(3);

        const carousel = new Carousel();
        await carousel.init();
        const status = carousel.getStatus();

        expect(document.querySelector(`.${CSS_CLASSES.container}`)).not.toBeNull();
        expect(stage()).not.toBeNull();
        expect(items()).toHaveLength(3);
        expect(items().map(item => item.dataset.slide)).toEqual(["0", "1", "2"]);
        expect(status.currentPage).toBe(0);
        expect(status.totalPages).toBe(2);
        expect(status.totalSlides).toBe(3);
        expect(status.pageSlides).toEqual([[0], [1], [2]]);
        expect(status.activeSlides).toEqual([0]);
    });

    it('should initialize manually using default config', async () => {
        renderCarousel(3);

        const carousel = new Carousel();
        await carousel.init();
        const status = carousel.getStatus();

        expect(document.querySelector(`.${CSS_CLASSES.container}`)).not.toBeNull();
        expect(stage()).not.toBeNull();
        expect(items()).toHaveLength(3);
        expect(items().map(item => item.dataset.slide)).toEqual(["0", "1", "2"]);
        expect(status.currentPage).toBe(0);
        expect(status.totalPages).toBe(2);
        expect(status.totalSlides).toBe(3);
        expect(status.pageSlides).toEqual([[0], [1], [2]]);
        expect(status.activeSlides).toEqual([0]);
    });

    it('should reject the ready promise if container is missing', async () => {
        document.body.innerHTML = '';
        const carousel = new Carousel({ container: '.missing-div' });

        await expect(carousel.ready).rejects.toThrow("Container not found!");
    });

    it("wraps source slides in a carousel stage and exposes initial status", async () => {
        renderCarousel(4);

        const carousel = new Carousel();
        await carousel.init(baseConfig({ items: 2 }));
        const status = carousel.getStatus();

        expect(document.querySelector(`.${CSS_CLASSES.container}`)).not.toBeNull();
        expect(stage()).not.toBeNull();
        expect(items()).toHaveLength(4);
        expect(items().map(item => item.dataset.slide)).toEqual(["0", "1", "2", "3"]);
        expect(status.currentPage).toBe(0);
        expect(status.totalPages).toBe(1);
        expect(status.totalSlides).toBe(4);
        expect(status.pageSlides).toEqual([[0, 1], [2, 3]]);
        expect(status.activeSlides).toEqual([0, 1]);
    });

    it("moves next, previous, and direct page requests within bounds", () => {
        renderCarousel(5);
        const onChanged = vi.fn();

        const carousel = new Carousel(baseConfig({ items: 2 }));
        carousel.on("page:changed", onChanged);

        carousel.nextPage();
        expect(carousel.getCurrentPage()).toBe(1);
        expect(carousel.getStatus().activeSlides).toEqual([2, 3]);

        carousel.changePage(2, false);
        expect(carousel.getCurrentPage()).toBe(2);
        expect(carousel.getStatus().activeSlides).toEqual([3, 4]);
        expect(stage()?.style.transitionDuration).toBe("0.5s");

        carousel.nextPage();
        expect(carousel.getCurrentPage()).toBe(2);

        carousel.prevPage();
        expect(carousel.getCurrentPage()).toBe(1);
        expect(onChanged).toHaveBeenCalledTimes(3);
    });

    it("ignores invalid page requests", async () => {
        renderCarousel(3);

        const carousel = new Carousel();
        await carousel.init();

        const onChanged = vi.fn();
        carousel.on("page:changed", onChanged);

        carousel.changePage(99, false);
        carousel.changePage(-1, false);
        carousel.changePage(Number.NaN, false);

        expect(carousel.getCurrentPage()).toBe(0);
        expect(onChanged).not.toHaveBeenCalled();
    });

    it("throws when the container has no slide content", async () => {
        document.body.innerHTML = `<div class="ddcarousel" style="width: 300px;"></div>`;

        const carousel = new Carousel();

        await expect(carousel.init()).rejects.toThrow("No content found in container. Destroying carousel...");
    });

    it("warns and keeps the current instance when init is called twice", async () => {
        renderCarousel(3);
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

        const carousel = new Carousel({});
        await carousel.init();

        expect(warn).toHaveBeenCalledWith("Already initialized!");
        expect(carousel.getStatus().config.current?.items).toBe(1);
    });

    it("restores original slide markup when destroyed with restoreSlides enabled", async () => {
        renderCarousel(3);

        const carousel = new Carousel();
        await carousel.init();
        carousel.destroy(true);

        const carouselContainer = container();
        expect(carouselContainer?.querySelector(`.${CSS_CLASSES.container}`)).toBeNull();
        expect(carouselContainer?.children).toHaveLength(3);
        expect(carouselContainer?.classList).toContain(carouselCustomClass);
        expect(Array.from(carouselContainer?.children ?? []).map(child => child.classList[0])).toEqual([
            "item-1",
            "item-2",
            "item-3",
        ]);
    });

    it("removes carousel markup without restoring slides when requested", async () => {
        renderCarousel(3);

        const carousel = new Carousel();
        await carousel.init();
        carousel.destroy(false);

        expect(container()?.children).toHaveLength(0);
        expect(container()?.classList).toContain(carouselCustomClass);
    });
});


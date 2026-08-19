import { afterEach, describe, expect, it, vi } from "vitest";
import Carousel from "../src/core/carousel";
import { CSS_CLASSES } from "../src/constants/css-classes";
import { baseConfig, carouselCustomClass, container, items, renderCarousel, stage } from "./helpers";
import Drag from "../src/core/drag";
import Stage from "../src/core/stage";
import ModuleLoader from "../src/core/module-loader";

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
        renderCarousel(4, { className: "test-container" });

        const consoleSpy = vi
            .spyOn(console, "warn")
            .mockImplementation(() => { });

        const carousel = new Carousel({
            container: ".test-container",
        });

        await carousel.ready;
        await carousel.init();

        expect(consoleSpy).toHaveBeenCalledWith("Already initialized!");
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
        expect(status.slidesByPage).toEqual([[0], [1], [2]]);
        expect(status.visibleSlides).toEqual([0]);
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
        expect(status.slidesByPage).toEqual([[0], [1], [2]]);
        expect(status.visibleSlides).toEqual([0]);
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
        expect(status.slidesByPage).toEqual([[0, 1], [2, 3]]);
        expect(status.visibleSlides).toEqual([0, 1]);
    });

    it("moves next, previous, and direct page requests within bounds", () => {
        renderCarousel(5);
        const onChanged = vi.fn();

        const carousel = new Carousel(baseConfig({ items: 2 }));
        carousel.on("page:changed", onChanged);

        carousel.nextPage();
        expect(carousel.getCurrentPage()).toBe(1);
        expect(carousel.getStatus().visibleSlides).toEqual([2, 3]);

        carousel.changePage(2, false);
        expect(carousel.getCurrentPage()).toBe(2);
        expect(carousel.getStatus().visibleSlides).toEqual([3, 4]);
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

    it("cleans up partially initialized classes when module loading fails", async () => {
        renderCarousel(4);

        const dragDestroy = vi.spyOn(Drag.prototype, "destroy");
        const stageDestroy = vi.spyOn(Stage.prototype, "destroy");
        const moduleReset = vi.spyOn(ModuleLoader.prototype, "reset");

        vi.spyOn(ModuleLoader.prototype, "loadAll")
            .mockRejectedValueOnce(new Error("Module loading failed"));

        const carousel = new Carousel();

        await expect(carousel.init(baseConfig())).rejects.toThrow("Module loading failed");

        expect(dragDestroy).toHaveBeenCalledTimes(1);
        expect(moduleReset).toHaveBeenCalledTimes(1);
        expect(stageDestroy).toHaveBeenCalledTimes(1);

        expect(() => carousel.getStatus()).toThrow(
            "Carousel not initialized",
        );
    });

    it("does not allow and retry initialization after a previous failure", async () => {
        renderCarousel(4);

        const loadAll = vi.spyOn(ModuleLoader.prototype, "loadAll")
            .mockRejectedValueOnce(new Error("Module loading failed"));

        const carousel = new Carousel();

        await expect(carousel.init(baseConfig())).rejects.toThrow("Module loading failed");
        await expect(carousel.init(baseConfig())).rejects.toThrow("A failed carousel cannot be initialized again",);

        expect(loadAll).toHaveBeenCalledTimes(1);
    });

    it("does not allow initialization after the carousel is destroyed", async () => {
        renderCarousel(4);

        const carousel = new Carousel(baseConfig());
        await carousel.ready;

        carousel.destroy(true);

        await expect(carousel.init(baseConfig())).rejects.toThrow("A destroyed carousel cannot be initialized again",);
    });

    it("can be destroyed while initialization is still in progress", async () => {
        renderCarousel(4);

        let resolveLoad!: () => void;
        vi.spyOn(ModuleLoader.prototype, "loadAll").mockImplementation(
            () => new Promise<void>(resolve => resolveLoad = resolve),
        );

        const carousel = new Carousel();

        const init = carousel.init(baseConfig());

        // destroy before loadAll() finishes
        expect(() => carousel.destroy(true)).not.toThrow();

        // finish the pending initialization.
        resolveLoad();

        await expect(init).resolves.toBeUndefined();
        await expect(carousel.ready).resolves.toBeUndefined();

        await Promise.resolve();

        expect(() => carousel.getCurrentPage()).toThrow("Carousel not initialized",);
    });

    it("throws when document is unavailable", async () => {
        const originalDocument = globalThis.document;

        // @ts-expect-error Simulate SSR.
        delete globalThis.document;

        try {
            const carousel = new Carousel();
            await expect(carousel.init(baseConfig())).rejects.toThrow("Carousel cannot be initialized outside of a browser environment.",);
        } finally {
            Object.defineProperty(globalThis, "document", {
                configurable: true,
                value: originalDocument,
            });
        }
    });

    it("throws when window is unavailable", async () => {
        const originalWindow = globalThis.window;

        // @ts-expect-error Simulate SSR.
        delete globalThis.window;

        try {
            const carousel = new Carousel();
            await expect(carousel.init(baseConfig())).rejects.toThrow("Carousel cannot be initialized outside of a browser environment.",);
        } finally {
            Object.defineProperty(globalThis, "window", {
                configurable: true,
                value: originalWindow,
            });
        }
    });

    it("returns loaded module ids in status", async () => {
        renderCarousel(4);

        const carousel = new Carousel(baseConfig({
            nav: true,
            pagination: true,
            autoplay: true,
        }));

        await carousel.ready;
        const { modules } = carousel.getStatus();

        expect(modules).toEqual(expect.arrayContaining(["nav", "pagination", "autoplay"]));
        expect(modules.every(id => typeof id === "string")).toBe(true);
    });

    it("returns the complete initial status with default config", async () => {
        renderCarousel(13);

        const carousel = new Carousel(baseConfig());
        await carousel.ready;
        const status = carousel.getStatus();

        expect(status.config.current).toEqual(
            expect.objectContaining({
                container: ".ddcarousel",
                nav: false,
                pagination: true,
                autoHeight: true,
                fullWidth: true,
                startPage: 0,
                items: 1,
                itemPerPage: false,
                gap: 0,
                loop: false,
                vertical: false,
                verticalMaxContentWidth: false,
                urlNav: false,
                urlNavContainer: null,
                responsive: null,
                touchDrag: true,
                dragSnapMode: "swipe",
                mouseDrag: true,
                keyboardNavigation: false,
                centerSlide: false,
                swipeThreshold: 60,
                dragMaxDistance: 0,
                resizeDebounce: 200,
                swipeSmooth: 0,
                slideChangeDuration: 0.5,
            }),
        );
        expect(status.state).toBe("ready");
        expect(status.initialized).toBe(true);
        expect(status.currentPage).toBe(0);
        expect(status.totalPages).toBe(12);
        expect(status.slides).toHaveLength(13);
        expect(status.totalSlides).toBe(13);
        expect(status.slidesByPage).toEqual([
            [0],
            [1],
            [2],
            [3],
            [4],
            [5],
            [6],
            [7],
            [8],
            [9],
            [10],
            [11],
            [12],
        ]);
        expect(status.visibleSlides).toEqual([0]);
        expect(status.currentTranslate).toBe(0);
        expect(status.modules).toEqual([
            "pagination",
        ]);
        expect(status.closestSlidesIndexes).toEqual({
            left: 0,
            center: 0,
            right: 0,
        });
    });
});


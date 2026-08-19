import { afterEach, describe, expect, it, vi } from "vitest";
import Carousel from "../../src/core/carousel";
import { DATA } from "../../src/constants/data-attrs";
import { baseConfig, renderCarousel } from "../helpers";

const images = () => Array.from(document.querySelectorAll<HTMLImageElement>("img"));

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
});

describe("LazyLoad module", () => {
    it("loads the initial active slide immediately", async () => {
        renderCarousel(3, { lazyImages: true });

        const carousel = new Carousel(baseConfig({
            lazyLoad: true,
        }));
        await carousel.ready;

        expect(images()[0]?.hasAttribute(DATA.attrs.lazyImg)).toBe(false);
    });

    it("lazy loads active and preloaded slide images", async () => {
        renderCarousel(4, { lazyImages: true });
        const carousel = new Carousel(baseConfig({
            lazyLoad: true,
            lazyLoadPreloadSlides: 1,
        }));
        await carousel.ready;

        expect(images()[0]?.getAttribute(DATA.attrs.lazyImg)).toBeNull();
        expect(images()[1]?.getAttribute(DATA.attrs.lazyImg)).toBeNull();
        expect(images()[2]?.getAttribute(DATA.attrs.lazyImg)).toBe("/images/3.jpg");

        carousel.changePage(2, false);

        expect(images()[2]?.getAttribute(DATA.attrs.lazyImg)).toBeNull();
        expect(images()[3]?.getAttribute(DATA.attrs.lazyImg)).toBeNull();
    });

    it("can disable lazy preload through module config", async () => {
        renderCarousel(3, { lazyImages: true });
        const carousel = new Carousel(baseConfig({
            lazyLoad: true,
            lazyLoadPreload: false,
        }));
        await carousel.ready;

        expect(images()[0]?.getAttribute(DATA.attrs.lazyImg)).toBeNull();
        expect(images()[1]?.getAttribute(DATA.attrs.lazyImg)).toBe("/images/2.jpg");
    });

    it("does not preload beyond the last slide", async () => {
        renderCarousel(2, { lazyImages: true });

        const carousel = new Carousel(baseConfig({
            lazyLoad: true,
            lazyLoadPreloadSlides: 5,
        }));
        await carousel.ready;

        expect(images()[0]?.getAttribute(DATA.attrs.lazyImg)).toBeNull();
        expect(images()[1]?.getAttribute(DATA.attrs.lazyImg)).toBeNull();
    });

    it("loads only active slides when preloadSlides is zero", async () => {
        renderCarousel(3, { lazyImages: true });

        const carousel = new Carousel(baseConfig({
            lazyLoad: true,
            lazyLoadPreloadSlides: 0,
        }));
        await carousel.ready;

        expect(images()[0]?.getAttribute(DATA.attrs.lazyImg)).toBeNull();
        expect(images()[1]?.getAttribute(DATA.attrs.lazyImg)).toBe("/images/2.jpg");
        expect(images()[2]?.getAttribute(DATA.attrs.lazyImg)).toBe("/images/3.jpg");
    });

    it("does not reload images that are already enabled", async () => {
        renderCarousel(3, { lazyImages: true });

        const carousel = new Carousel(baseConfig({
            lazyLoad: true,
        }));
        await carousel.ready;

        const first = images()[0]!;
        expect(first.getAttribute(DATA.attrs.lazyImg)).toBeNull();

        carousel.changePage(1, false);
        carousel.changePage(0, false);

        expect(first.getAttribute(DATA.attrs.lazyImg)).toBeNull();
        expect(first.src).toContain("/images/1.jpg");
    });

    it("ignores images without lazy attribute", async () => {
        renderCarousel(2);

        const carousel = new Carousel(baseConfig({
            lazyLoad: true,
        }));
        await carousel.ready;

        expect(() => carousel.changePage(1, false)).not.toThrow();
    });

    it("loads only the active page after page changes when preload is disabled", async () => {
        renderCarousel(4, { lazyImages: true });

        const carousel = new Carousel(baseConfig({
            lazyLoad: true,
            lazyLoadPreload: false,
        }));
        await carousel.ready;
        carousel.changePage(2, false);

        expect(images()[2]?.getAttribute(DATA.attrs.lazyImg)).toBeNull();
        expect(images()[3]?.getAttribute(DATA.attrs.lazyImg)).toBe("/images/4.jpg");
    });

    it("loads a distant slide only when it becomes active", async () => {
        renderCarousel(5, { lazyImages: true });

        const carousel = new Carousel(baseConfig({
            items: 1,
            lazyLoad: true,
            lazyLoadPreloadSlides: 1,
        }));
        await carousel.ready;

        expect(images()[4]?.hasAttribute(DATA.attrs.lazyImg)).toBe(true);

        carousel.changePage(4, false);

        expect(images()[4]?.hasAttribute(DATA.attrs.lazyImg)).toBe(false);
    });

    it("loads every image after visiting all pages", async () => {
        renderCarousel(5, { lazyImages: true });

        const carousel = new Carousel(baseConfig({
            lazyLoad: true,
            items: 1,
            lazyLoadPreload: false,
        }));
        await carousel.ready;

        for (let i = 1; i < 5; i++) {
            carousel.changePage(i, false);
        }

        images().forEach(img => {
            expect(img.hasAttribute(DATA.attrs.lazyImg)).toBe(false);
        });
    });

    it("loads images when jumping directly to another page", async () => {
        renderCarousel(8, { lazyImages: true });

        const carousel = new Carousel(baseConfig({
            items: 1,
            lazyLoad: true,
            lazyLoadPreloadSlides: 1,
        }));
        await carousel.ready;

        carousel.changePage(6, false);

        // initially loaded - starting page 0
        expect(images()[0]?.hasAttribute(DATA.attrs.lazyImg)).toBe(false);
        expect(images()[1]?.hasAttribute(DATA.attrs.lazyImg)).toBe(false);

        // skip these
        expect(images()[2]?.hasAttribute(DATA.attrs.lazyImg)).toBe(true);
        expect(images()[3]?.hasAttribute(DATA.attrs.lazyImg)).toBe(true);
        expect(images()[4]?.hasAttribute(DATA.attrs.lazyImg)).toBe(true);
        expect(images()[5]?.hasAttribute(DATA.attrs.lazyImg)).toBe(true);

        // changed page items
        expect(images()[6]?.hasAttribute(DATA.attrs.lazyImg)).toBe(false);
        expect(images()[7]?.hasAttribute(DATA.attrs.lazyImg)).toBe(false);
    });

    it("does not change already preloaded images", async () => {
        renderCarousel(4, { lazyImages: true });

        const carousel = new Carousel(baseConfig({
            lazyLoad: true,
            lazyLoadPreloadSlides: 2,
        }));
        await carousel.ready;

        const src = images()[2]!.src;

        carousel.changePage(2, false);
        expect(images()[2]!.src).toBe(src);
    });

    it("loads only visited and preloaded slides", async () => {
        renderCarousel(8, { lazyImages: true });

        const carousel = new Carousel(baseConfig({
            lazyLoad: true,
            items: 1,
            lazyLoadPreloadSlides: 1,
        }));

        carousel.changePage(1, false);
        carousel.changePage(2, false);

        expect(images()[6]?.hasAttribute(DATA.attrs.lazyImg)).toBe(true);
        expect(images()[7]?.hasAttribute(DATA.attrs.lazyImg)).toBe(true);
    });
});

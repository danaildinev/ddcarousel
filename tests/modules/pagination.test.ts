import { afterEach, describe, expect, it, vi } from "vitest";
import Carousel from "../../src/core/carousel";
import { baseConfig, pagination, renderCarousel } from "../helpers";

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
});

describe("Pagination module", () => {
    it("initialize pagination", async () => {
        renderCarousel(4);

        const carousel = new Carousel();
        await carousel.init(baseConfig({ items: 2, pagination: true }))

        const module = carousel.module("pagination");
        expect(module).toBeDefined();
        expect(module?.isInitialized).toBe(true);
    });

    it("creates pagination and changes pages when dots are clicked", async () => {
        renderCarousel(4);

        const carousel = new Carousel();
        await carousel.init(baseConfig({ items: 2, pagination: true }))

        expect(pagination()).toHaveLength(2);
        expect(pagination()[0]?.dataset.active).toBe("true");

        pagination()[1]?.click();

        expect(carousel.getCurrentPage()).toBe(1);
        expect(pagination()[1]?.dataset.active).toBe("true");
    });

    it("does not render pagination when there is a single page", async () => {
        renderCarousel(2);

        const carousel = new Carousel();
        await carousel.init(baseConfig({ items: 2, pagination: true }))

        expect(pagination()).toHaveLength(0);
    });

    it("tears pagination DOM down on carousel destroy", async () => {
        renderCarousel(3);

        const carousel = new Carousel();

        await carousel.init(baseConfig({ pagination: true }))
        expect(carousel.module("pagination")).toBeDefined();
        expect(pagination()).toHaveLength(3);

        carousel.destroy(true);

        expect(pagination()).toHaveLength(0);
    });

    it("marks only the first dot as active after initialization", async () => {
        renderCarousel(6);

        const carousel = new Carousel();
        await carousel.init(baseConfig({ items: 2, pagination: true }));

        expect(pagination()).toHaveLength(3);

        const active = pagination().filter(dot => dot.dataset.active === "true");

        expect(active).toHaveLength(1);
        expect(active[0]).toBe(pagination()[0]);
    });

    it("removes active class from previous dot when page changes", async () => {
        renderCarousel(6);

        const carousel = new Carousel();
        await carousel.init(baseConfig({ items: 2, pagination: true }));

        pagination()[2]!.click();

        expect(pagination()[0]?.dataset.active).toBe("false");
        expect(pagination()[1]?.dataset.active).toBe("false");
        expect(pagination()[2]?.dataset.active).toBe("true");
        expect(pagination().filter(dot => dot.dataset.active === "true")).toHaveLength(1);
    });

    it("updates active dot across multiple page changes", async () => {
        renderCarousel(8);

        const carousel = new Carousel();
        await carousel.init(baseConfig({ items: 2, pagination: true }));

        pagination()[1]!.click();
        expect(pagination()[1]?.dataset.active).toBe("true");

        pagination()[3]!.click();
        expect(pagination()[1]?.dataset.active).toBe("false");
        expect(pagination()[3]?.dataset.active).toBe("true");

        pagination()[0]!.click();
        expect(pagination()[3]?.dataset.active).toBe("false");
        expect(pagination()[0]?.dataset.active).toBe("true");
        expect(pagination().filter(dot => dot.dataset.active === "true")).toHaveLength(1);
    });

    it("updates the active dot when page changes programmatically", async () => {
        renderCarousel(6);

        const carousel = new Carousel();
        await carousel.init(baseConfig({ items: 2, pagination: true }));

        carousel.nextPage();

        expect(carousel.getCurrentPage()).toBe(1);
        expect(pagination()[0]?.dataset.active).toBe("false");
        expect(pagination()[1]?.dataset.active).toBe("true");

        carousel.prevPage();

        expect(carousel.getCurrentPage()).toBe(0);
        expect(pagination()[0]?.dataset.active).toBe("true");
        expect(pagination()[1]?.dataset.active).toBe("false");
        expect(pagination().filter(dot => dot.dataset.active === "true")).toHaveLength(1);
    });
});

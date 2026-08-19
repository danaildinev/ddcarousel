import { afterEach, describe, expect, it, vi } from "vitest";
import Carousel from "../../src/core/carousel";
import { CSS_CLASSES } from "../../src/constants/css-classes";
import { baseConfig, renderCarousel } from "../helpers";
import Nav from "../../src/modules/nav";

const prev = () => document.querySelector<HTMLElement>(`.${CSS_CLASSES.prev}`);
const next = () => document.querySelector<HTMLElement>(`.${CSS_CLASSES.next}`);

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
});

describe("Nav module", () => {
    it("creates nav buttons, uses labels, and updates inactive state", async () => {
        renderCarousel(3);
        const carousel = new Carousel(baseConfig({
            nav: true,
            navPrevContent: "Prev",
            navNextContent: "Next",
        }));
        await carousel.ready;

        expect(prev()?.textContent).toBe("Prev");
        expect(next()?.textContent).toBe("Next");
        expect(prev()?.classList.contains("inactive")).toBe(true);

        next()?.click();

        expect(carousel.getCurrentPage()).toBe(1);
        expect(prev()?.classList.contains("inactive")).toBe(false);
    });

    it("uses default labels are not set", async () => {
        renderCarousel(3);
        const carousel = new Carousel(baseConfig({
            nav: true,
        }));
        await carousel.ready;

        expect(prev()?.innerHTML).toBe(Nav.chevronSvg);
        expect(next()?.innerHTML).toBe(Nav.chevronSvg);
    });

    it("uses custom nav HTML content when labels are not set", async () => {
        renderCarousel(3);
        const carousel = new Carousel(baseConfig({
            nav: true,
            navPrevContent: "<span>Left</span>",
            navNextContent: "<span>Right</span>",
        }));
        await carousel.ready;

        expect(prev()?.innerHTML).toBe("<span>Left</span>");
        expect(next()?.innerHTML).toBe("<span>Right</span>");
    });

    it("updates inactive state when page changes programmatically", async () => {
        renderCarousel(6);

        const carousel = new Carousel(baseConfig({
            nav: true,
            items: 2,
        }));
        await carousel.ready;

        expect(prev()?.classList.contains("inactive")).toBe(true);
        expect(next()?.classList.contains("inactive")).toBe(false);

        carousel.nextPage();

        expect(carousel.getCurrentPage()).toBe(1);
        expect(prev()?.classList.contains("inactive")).toBe(false);
        expect(next()?.classList.contains("inactive")).toBe(false);

        carousel.prevPage();

        expect(carousel.getCurrentPage()).toBe(0);
        expect(prev()?.classList.contains("inactive")).toBe(true);
    });

    it("disables prev button on the first page", async () => {
        renderCarousel(6);

        const carousel = new Carousel(baseConfig({
            nav: true,
            items: 2,
        }));
        await carousel.ready;

        carousel.nextPage();

        expect(carousel.getCurrentPage()).toBe(1);
        expect(prev()?.classList.contains("inactive")).toBe(false);

        carousel.prevPage();

        expect(carousel.getCurrentPage()).toBe(0);
        expect(prev()?.classList.contains("inactive")).toBe(true);
    });

    it("disables next button on the last page", async () => {
        renderCarousel(6);

        const carousel = new Carousel(baseConfig({
            nav: true,
            items: 2,
        }));
        await carousel.ready;

        carousel.nextPage();
        carousel.nextPage();

        expect(carousel.getCurrentPage()).toBe(2);
        expect(prev()?.classList.contains("inactive")).toBe(false);
        expect(next()?.classList.contains("inactive")).toBe(true);
    });
});

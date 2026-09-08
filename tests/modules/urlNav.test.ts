import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Carousel from "../../src/core/carousel";
import { baseConfig, container, renderCarousel } from "../helpers";
import { CSS_CLASSES } from "../../src/constants/css-classes";
import UrlNav from "../../src/modules/urlNav";
import { CarouselConfig, EVENTS } from "../../src/ddcarousel";

beforeEach(() => {
    history.replaceState(null, "", "/");
});

afterEach(() => {
    vi.useRealTimers();
    carousel?.destroy();
    carousel = undefined;

    history.replaceState(null, "", "/");
    document.body.innerHTML = "";

    vi.restoreAllMocks();
});

let carousel: Carousel | undefined;

const activeDataAttr = "data-active";

const carousels: Carousel[] = [];

function createCarousel(config?: CarouselConfig) {
    const carousel = new Carousel(config);
    carousels.push(carousel);

    return carousel;
}

describe("UrlNav module", () => {
    it("creates URL navigation inside carousel container by default", async () => {
        renderCarousel(2, { urlData: true });

        const carousel = new Carousel(baseConfig({
            urlNav: true,
        }));
        await carousel.ready;

        expect(container()!.querySelector(`.${CSS_CLASSES.urls}`)).not.toBeNull();
    });

    it("creates URL navigation in a custom container and follows links", async () => {
        renderCarousel(3, { urlData: true });
        document.body.insertAdjacentHTML("afterbegin", `<nav class="url-target"></nav>`);

        const carousel = new Carousel(baseConfig({
            urlNav: true,
            urlNavContainer: ".url-target",
        }));
        await carousel.ready;

        const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".url-target a"));
        expect(links.map(link => link.textContent)).toEqual(["Slide 1", "Slide 2", "Slide 3"]);

        links[2]?.click();

        expect(carousel.getCurrentPage()).toBe(2);
        expect(document.querySelectorAll<HTMLElement>(".url-target li")[2]?.hasAttribute(activeDataAttr)).toBe(true);
    });

    it("change page with goToUrl", async () => {
        renderCarousel(3, { urlData: true });
        const carousel = new Carousel(baseConfig({ urlNav: true }));
        await carousel.ready;

        const module = carousel.module(UrlNav.id);
        module.goToUrl("slide-2", false);

        expect(carousel.getCurrentPage()).toBe(1);
    });

    it("warns when custom url navigation container does not exist", async () => {
        renderCarousel(2, { urlData: true });

        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

        const carousel = new Carousel(baseConfig({
            urlNav: true,
            urlNavContainer: ".missing",
        }));

        await carousel.ready;

        expect(warn).toHaveBeenCalledWith(
            "Error appending url navigation: .missing not found!"
        );
    });

    it("removes URL navigation on destroy", async () => {
        renderCarousel(2, { urlData: true });

        const carousel = new Carousel(baseConfig({
            urlNav: true,
        }));
        await carousel.ready;

        expect(container()!.querySelector(`.${CSS_CLASSES.urls}`)).not.toBeNull();

        carousel.destroy(false);

        expect(document.querySelector(`.${CSS_CLASSES.urls}`)).toBeNull();
    });

    it("ignores slides without URL data", async () => {
        renderCarousel(3, { urlData: true });

        const slide = document.querySelector(".item-1") as HTMLElement;

        delete slide.dataset.id;
        delete slide.dataset.title;

        const carousel = new Carousel(baseConfig({
            urlNav: true,
        }));
        await carousel.ready;

        const links = Array.from(container()!.querySelectorAll<HTMLAnchorElement>(`.${CSS_CLASSES.urls} a`));

        expect(links.map(link => link.textContent)).toEqual([
            "Slide 2",
            "Slide 3",
        ]);
    });

    it("throws when goToUrl target does not exist", async () => {
        renderCarousel(2, { urlData: true });

        const carousel = new Carousel(baseConfig({
            urlNav: true,
        }));
        await carousel.ready;

        expect(() => carousel.module("urlNav").goToUrl("missing")).toThrow("Slide missing was not found!");
    });

    it("moves active class when navigating between pages", async () => {
        renderCarousel(3, { urlData: true });

        const carousel = new Carousel(baseConfig({
            urlNav: true,
        }));

        await carousel.ready;

        carousel.nextPage();
        carousel.nextPage();

        carousel.prevPage();

        const items = container()!.querySelectorAll<HTMLElement>(`.${CSS_CLASSES.urls} li`);

        expect(items[1]?.hasAttribute(activeDataAttr)).toBe(true);
        expect(items[2]?.hasAttribute(activeDataAttr)).toBe(false);
    });

    it("does not remove the custom urlNavContainer on destroy", async () => {
        renderCarousel(5);

        const customContainer = document.createElement("div");
        customContainer.classList.add("url-nav-container");
        document.body.appendChild(customContainer);

        const carousel = new Carousel(baseConfig({
            urlNav: true,
            urlNavContainer: ".url-nav-container",
        }));

        await carousel.ready;

        expect(customContainer.querySelector(`.${CSS_CLASSES.urls}`)).not.toBeNull();
        carousel.destroy();

        expect(customContainer.querySelector(`.${CSS_CLASSES.urls}`)).toBeNull();
        expect(document.querySelector(".url-nav-container")).toBe(customContainer);
    });

    it("navigates to the slide matching the initial URL hash", async () => {
        renderCarousel(3, { urlData: true });

        history.replaceState(null, "", "#slide-3");

        carousel = new Carousel();
        await carousel.init({
            container: ".ddcarousel",
            urlNav: true
        });

        expect(carousel.getCurrentPage()).toBe(1);
    });

    it("navigates to the initial URL hash without animation", async () => {
        renderCarousel(3, { urlData: true });

        history.replaceState(null, "", "#slide-3");

        const carousel = new Carousel();
        const pageChangeRequest = vi.fn();

        carousel.on(EVENTS.PAGE_CHANGE_REQUEST, pageChangeRequest);

        await carousel.init({
            container: ".ddcarousel",
            urlNav: true
        });

        expect(window.location.hash).toBe("#slide-3");
        expect(carousel.getCurrentPage()).toBe(2);

        expect(pageChangeRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                index: "2",
                animate: false
            })
        );
    });

    it("does not change the page when the initial hash does not match a slide", async () => {
        renderCarousel(3, { urlData: true });

        history.replaceState(null, "", "#missing");

        const carousel = new Carousel();
        await carousel.init({
            container: ".ddcarousel",
            urlNav: true
        });

        expect(carousel.getCurrentPage()).toBe(0);
    });

    it("does not change the page when there is no URL hash", async () => {
        renderCarousel(3, { urlData: true });

        history.replaceState(null, "", window.location.pathname);

        const carousel = new Carousel();
        await carousel.init({
            container: ".ddcarousel",
            urlNav: true
        });

        expect(carousel.getCurrentPage()).toBe(0);
    });

    it("responds to URL hash changes", async () => {
        renderCarousel(3, { urlData: true });

        const carousel = new Carousel();
        await carousel.init({
            container: ".ddcarousel",
            urlNav: true
        });

        expect(carousel.getCurrentPage()).toBe(0);

        window.location.hash = "#slide-3";

        await vi.waitFor(() => {
            expect(carousel.getCurrentPage()).toBe(2);
        });
    });

    it("animates page changes caused by hash changes", async () => {
        renderCarousel(3, { urlData: true });

        const carousel = new Carousel();
        const pageChangeRequest = vi.fn();

        carousel.on(EVENTS.PAGE_CHANGE_REQUEST, pageChangeRequest);
        await carousel.init({
            container: ".ddcarousel",
            urlNav: true
        });

        pageChangeRequest.mockClear();

        window.location.hash = "#slide-2";

        await vi.waitFor(() => {
            expect(pageChangeRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    index: "1",
                    animate: true
                })
            );
        });
    });

    it("ignores hash changes that do not match a slide", async () => {
        renderCarousel(3, { urlData: true });

        const carousel = new Carousel();
        await carousel.init({
            container: ".ddcarousel",
            urlNav: true
        });

        window.location.hash = "#missing";

        await new Promise(resolve => setTimeout(resolve, 0));

        expect(carousel.getCurrentPage()).toBe(0);
    });

    it("stops responding to hash changes after the urlNav module is unloaded", async () => {
        history.replaceState(null, "", "/");

        expect(window.location.hash).toBe("");
        renderCarousel(3, { urlData: true });

        const carousel = new Carousel();

        await carousel.init({
            container: ".ddcarousel",
            urlNav: true
        });

        // Must still be page 0 after initialization.
        expect(carousel.getCurrentPage()).toBe(0);

        await carousel.unloadModule("urlNav");

        // Unloading must not change the page.
        expect(carousel.getCurrentPage()).toBe(0);

        history.replaceState(null, "", "#slide-5");

        // replaceState itself must not change carousel state.
        expect(carousel.getCurrentPage()).toBe(0);

        window.dispatchEvent(new HashChangeEvent("hashchange"));

        // UrlNav is unloaded, so hashchange must now do nothing.
        expect(carousel.getCurrentPage()).toBe(0);
    });
});

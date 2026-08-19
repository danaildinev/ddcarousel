import { afterEach, describe, expect, it, vi } from "vitest";
import Carousel from "../../src/core/carousel";
import { baseConfig, container, renderCarousel } from "../helpers";
import { CSS_CLASSES } from "../../src/constants/css-classes";
import UrlNav from "../../src/modules/urlNav";

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
});

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
        expect(document.querySelectorAll(".url-target li")[2]?.classList.contains("active")).toBe(true);
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
        console.log(slide);

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

        const items = container()!.querySelectorAll(`.${CSS_CLASSES.urls} li`);

        expect(items[1]?.classList.contains("active")).toBe(true);
        expect(items[2]?.classList.contains("active")).toBe(false);
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
});

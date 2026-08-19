import { afterEach, describe, expect, it, vi } from "vitest";
import Carousel from "../../src/core/carousel";
import { CSS_CLASSES } from "../../src/constants/css-classes";
import { EVENTS } from "../../src/constants/events-list";
import { baseConfig, container, renderCarousel, stage } from "../helpers";
import Autoplay from "../../src/modules/autoplay";

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
});

describe("Autoplay module", () => {
    it("starts, stops, and renders autoplay progress", async () => {
        renderCarousel(3);
        const carousel = new Carousel(baseConfig({
            autoplay: true,
            autoplaySpeed: 100,
            autoplayProgress: true,
        }));
        await carousel.ready;

        vi.useFakeTimers();

        const started = vi.fn();
        const stopped = vi.fn();
        carousel.on(EVENTS.MODULE_AUTOPLAY_STARTED, started);
        carousel.on(EVENTS.MODULE_AUTOPLAY_STOPPED, stopped);

        expect(document.querySelector(`.${CSS_CLASSES.progressBar}`)).not.toBeNull();
        expect(container()?.style.getPropertyValue("--ddcarousel-autoplay-speed")).toBe("100ms");

        const autoplay = carousel.module<Autoplay>(Autoplay.id);
        autoplay.stop();
        expect(stopped).toHaveBeenCalledTimes(1);

        autoplay.start();
        expect(started).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(100);
        expect(carousel.getCurrentPage()).toBe(1);
    });

    it("does not render progress when autoplayProgress is false", async () => {
        renderCarousel(3);
        const carousel = new Carousel(baseConfig({
            autoplay: true,
            autoplayProgress: false,
        }));
        await carousel.ready;

        expect(document.querySelector(`.${CSS_CLASSES.progressBar}`)).toBeNull();
    });

    it("pauses and resumes on hover when autoplayPauseHover is true", async () => {
        renderCarousel(3);
        const carousel = new Carousel(baseConfig({
            autoplay: true,
            autoplayPauseHover: true,
        }));
        await carousel.ready;

        const stopped = vi.fn();
        const started = vi.fn();
        carousel.on(EVENTS.MODULE_AUTOPLAY_STOPPED, stopped);
        carousel.on(EVENTS.MODULE_AUTOPLAY_STARTED, started);

        stage()?.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" } as PointerEventInit));
        stage()?.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true, pointerType: "mouse" } as PointerEventInit));

        expect(stopped).toHaveBeenCalledTimes(1);
        expect(started).toHaveBeenCalledTimes(1);
    });

    it("pauses and resumes on document visibility when autoplayPauseOnTabHidden is true", async () => {
        renderCarousel(3);
        const carousel = new Carousel(baseConfig({
            autoplay: true,
            autoplayPauseOnTabHidden: true,
        }));
        await carousel.ready;

        const stopped = vi.fn();
        const started = vi.fn();
        carousel.on(EVENTS.MODULE_AUTOPLAY_STOPPED, stopped);
        carousel.on(EVENTS.MODULE_AUTOPLAY_STARTED, started);

        vi.spyOn(document, "hidden", "get").mockReturnValue(true);
        document.dispatchEvent(new Event("visibilitychange"));
        vi.spyOn(document, "hidden", "get").mockReturnValue(false);
        document.dispatchEvent(new Event("visibilitychange"));

        expect(stopped).toHaveBeenCalledTimes(1);
        expect(started).toHaveBeenCalledTimes(1);
    });

    it("automatically advances pages until the last page", async () => {
        vi.useFakeTimers();

        renderCarousel(6);

        const carousel = new Carousel(baseConfig({
            autoplay: true,
            autoplaySpeed: 100,
            items: 2, // 3 pages: 0 -> 1 -> 2
        }));
        await carousel.ready;

        const stopped = vi.fn();
        carousel.on(EVENTS.MODULE_AUTOPLAY_STOPPED, stopped);

        expect(carousel.getCurrentPage()).toBe(0);

        vi.advanceTimersByTime(100);
        expect(carousel.getCurrentPage()).toBe(1);

        vi.advanceTimersByTime(100);
        expect(carousel.getCurrentPage()).toBe(2);

        // should stay on the last page
        vi.advanceTimersByTime(500);
        expect(carousel.getCurrentPage()).toBe(2);

        expect(stopped).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(1000);

        expect(carousel.getCurrentPage()).toBe(2);
        expect(stopped).toHaveBeenCalledTimes(1);

        vi.useRealTimers();
    });

    it("hides the autoplay progress bar on the last page", async () => {
        vi.useFakeTimers();

        renderCarousel(6);

        const carousel = new Carousel(baseConfig({
            autoplay: true,
            autoplaySpeed: 100,
            autoplayProgress: true,
            items: 2, // pages: 0 -> 1 -> 2
        }));
        await carousel.ready;

        const progress = container()!.querySelector(`.${CSS_CLASSES.progress}`)!;

        expect(progress.classList.contains("active")).toBe(true);

        vi.advanceTimersByTime(100);
        expect(carousel.getCurrentPage()).toBe(1);
        expect(progress.classList.contains("active")).toBe(true);

        vi.advanceTimersByTime(100);
        expect(carousel.getCurrentPage()).toBe(2);

        expect(progress.classList.contains("active")).toBe(false);

        vi.useRealTimers();
    });

    it("does not change pages after autoplay is stopped", async () => {
        vi.useFakeTimers();

        renderCarousel(5);

        const carousel = new Carousel(baseConfig({
            autoplay: true,
            autoplaySpeed: 100,
        }));
        await carousel.ready;

        const autoplay = carousel.module<Autoplay>(Autoplay.id);
        autoplay.stop();

        vi.advanceTimersByTime(500);
        expect(carousel.getCurrentPage()).toBe(0);
        vi.useRealTimers();
    });

    it("continues autoplay from current page after restart", async () => {
        vi.useFakeTimers();

        renderCarousel(6);

        const carousel = new Carousel(baseConfig({
            autoplay: true,
            autoplaySpeed: 100,
            items: 2,
        }));

        await carousel.ready;

        const autoplay = carousel.module<Autoplay>(Autoplay.id);

        vi.advanceTimersByTime(100);
        expect(carousel.getCurrentPage()).toBe(1);
        autoplay.stop();

        vi.advanceTimersByTime(500);
        expect(carousel.getCurrentPage()).toBe(1);
        autoplay.start();

        vi.advanceTimersByTime(100);
        expect(carousel.getCurrentPage()).toBe(2);

        vi.useRealTimers();
    });

    it("pause while hovered", async () => {
        vi.useFakeTimers();

        renderCarousel(5);

        const carousel = new Carousel(baseConfig({
            autoplay: true,
            autoplaySpeed: 100,
            autoplayPauseHover: true,
        }));

        await carousel.ready;

        stage()?.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse", } as PointerEventInit));

        vi.advanceTimersByTime(500);
        expect(carousel.getCurrentPage()).toBe(0);

        stage()?.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true, pointerType: "mouse", } as PointerEventInit));

        vi.advanceTimersByTime(100);
        expect(carousel.getCurrentPage()).toBe(1);

        vi.useRealTimers();
    });

    it("does not advance while document is hidden", async () => {
        vi.useFakeTimers();

        renderCarousel(5);

        const carousel = new Carousel(baseConfig({
            autoplay: true,
            autoplaySpeed: 100,
            autoplayPauseOnTabHidden: true,
        }));

        await carousel.ready;

        vi.spyOn(document, "hidden", "get").mockReturnValue(true);

        document.dispatchEvent(new Event("visibilitychange"));

        vi.advanceTimersByTime(500);
        expect(carousel.getCurrentPage()).toBe(0);

        vi.useRealTimers();
    });

    it("uses configured autoplay speed", async () => {
        vi.useFakeTimers();

        renderCarousel(5);

        const carousel = new Carousel(baseConfig({
            autoplay: true,
            autoplaySpeed: 500,
        }));

        await carousel.ready;

        vi.advanceTimersByTime(499);
        expect(carousel.getCurrentPage()).toBe(0);

        vi.advanceTimersByTime(1);
        expect(carousel.getCurrentPage()).toBe(1);

        vi.useRealTimers();
    });

    it("stops autoplay after destroy", async () => {
        vi.useFakeTimers();

        renderCarousel(5);

        const carousel = new Carousel(baseConfig({
            autoplay: true,
            autoplaySpeed: 100,
        }));

        await carousel.ready;

        const pageChange = vi.fn();
        carousel.on(EVENTS.PAGE_CHANGE_REQUEST, pageChange);

        carousel.destroy(true);

        vi.advanceTimersByTime(500);

        expect(pageChange).not.toHaveBeenCalled();

        vi.useRealTimers();
    });
});

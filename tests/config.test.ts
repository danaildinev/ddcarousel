import { afterEach, describe, expect, it, vi } from "vitest";
import Carousel from "../src/core/carousel";
import { EVENTS } from "../src/constants/events-list";
import { Config } from "../src/core/config";
import { Events } from "../src/core/events";
import { DragSnapMode, type CarouselConfig } from "../src/types/carousel.types";
import { baseConfig, container, renderCarousel } from "./helpers";
import { CSS_CLASSES } from "../src/constants/css-classes";

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
});

describe("Config", () => {
    it("preserves all typed config values in status", () => {
        renderCarousel(3);

        const fullConfig = {
            container: ".ddcarousel",
            nav: false,
            navPrevContent: "Previous",
            navNextContent: "Next",
            pagination: false,
            autoHeight: false,
            fullWidth: false,
            startPage: 1,
            items: 1,
            gap: 8,
            itemPerPage: false,
            loop: false,
            vertical: false,
            verticalMaxContentWidth: false,
            urlNav: false,
            urlNavContainer: ".url-target",
            responsive: null,
            touchDrag: true,
            dragSnapMode: DragSnapMode.Swipe,
            mouseDrag: false,
            keyboardNavigation: false,
            centerSlide: false,
            touchSwipeThreshold: 25,
            touchMaxSlideDist: 75,
            resizeRefresh: 25,
            swipeSmooth: 0.1,
            slideChangeDuration: 0.25,
            labelNavPrev: "Back",
            labelNavNext: "Forward",
        }

        const carousel = new Carousel(baseConfig(fullConfig));
        expect(carousel.getStatus().config.current).toEqual(expect.objectContaining(fullConfig));
    });

    it("starts with defaults when no user config is passed", () => {
        const events = new Events();
        const config = new Config(events);

        expect(config.user).toEqual(config.default);
        expect(config.current).toEqual(config.default);
        expect(config.current).not.toBe(config.default);
    });

    it("updates user and current settings through rebuildConfig explicit config branch", () => {
        const events = new Events();
        const applied = vi.fn();
        events.on(EVENTS.CONFIG_APPLIED, applied);

        const config = new Config(events, baseConfig({ items: 1 }));
        applied.mockClear();

        config.updateSettings({ items: 3, gap: 12 });

        expect(config.user).toEqual(expect.objectContaining({ items: 3, gap: 12 }));
        expect(config.current).toEqual(expect.objectContaining({ items: 3, gap: 12 }));
        expect(applied).toHaveBeenCalledWith(expect.objectContaining({
            old: expect.objectContaining({ items: 1 }),
            new: expect.objectContaining({ items: 3, gap: 12 }),
            isInternalOverride: false,
        }));
    });

    it("updateSettings can apply changes without emitting config events", () => {
        const events = new Events();
        const applied = vi.fn();
        const config = new Config(events, baseConfig({ items: 1, gap: 0 }));
        events.on(EVENTS.CONFIG_APPLIED, applied);

        config.updateSettings({ items: 2, gap: 16 }, false);

        expect(config.user).toEqual(expect.objectContaining({ items: 2, gap: 16 }));
        expect(config.current).toEqual(expect.objectContaining({ items: 2, gap: 16 }));
        expect(applied).not.toHaveBeenCalled();
    });

    it("applyConfig emits old, new, default, and internal override metadata", () => {
        const events = new Events();
        const applied = vi.fn();
        const config = new Config(events, baseConfig({ pagination: true, items: 1, gap: 0 }));
        events.on(EVENTS.CONFIG_APPLIED, applied);

        config.updateSettings({ items: 3 });

        expect(applied).toHaveBeenLastCalledWith(expect.objectContaining({
            default: expect.objectContaining({ items: 1, pagination: true }),
            old: expect.objectContaining({ items: 1, gap: 0 }),
            new: expect.objectContaining({ items: 3, gap: 0 }),
            isInternalOverride: false,
        }));

        config.setModuleOverride("pagination", { gap: 12 }, true);

        expect(applied).toHaveBeenLastCalledWith(expect.objectContaining({
            old: expect.objectContaining({ items: 3, gap: 0 }),
            new: expect.objectContaining({ items: 3, gap: 12 }),
            isInternalOverride: true,
        }));
    });

    it("applyConfig keeps emitted old and new configs detached from current mutations", () => {
        const events = new Events();
        const applied = vi.fn();
        const config = new Config(events, baseConfig({ items: 1 }));
        events.on(EVENTS.CONFIG_APPLIED, applied);

        config.updateSettings({ items: 2 });

        expect(applied).toHaveBeenCalledOnce();

        const payload = applied.mock.lastCall![0];
        config.updateSettings({ items: 4 });

        expect(payload.old.items).toBe(1);
        expect(payload.new.items).toBe(2);
        expect(config.current.items).toBe(4);
    });

    it("registers new and legacy event config callbacks while ignoring non-functions", () => {
        const onInitialized = vi.fn();
        const legacyChanged = vi.fn();
        const ignoredCallback = vi.fn();
        const events = new Events();

        new Config(events, {
            ...baseConfig(),
            "on:carousel:initalized": onInitialized,
            onChanged: legacyChanged,
            onNotMapped: ignoredCallback,
            customValue: "not a callback",
        } as Partial<CarouselConfig>);

        const initializedPayload = { initialized: true };
        const changedPayload = { currentPage: 2 };
        events.emit(EVENTS.INITIALIZED, initializedPayload);
        events.emit(EVENTS.PAGE_CHANGED, changedPayload);
        events.emit("onNotMapped", undefined);

        expect(onInitialized).toHaveBeenCalledWith(initializedPayload);
        expect(legacyChanged).toHaveBeenCalledWith(changedPayload);
        expect(ignoredCallback).not.toHaveBeenCalled();
    });

    it("applies an active responsive breakpoint and reverts back to user settings", () => {
        const events = new Events();
        const applied = vi.fn();
        const responsive = {
            600: { items: 1, gap: 4 },
            900: { items: 2, gap: 8 },
        } as unknown as CarouselConfig["responsive"];
        const config = new Config(events, baseConfig({ items: 4, gap: 16, responsive }));
        events.on(EVENTS.CONFIG_APPLIED, applied);

        config.refreshResponsive(700);

        expect(config.current).toEqual(expect.objectContaining({ items: 2, gap: 8 }));
        expect(applied).toHaveBeenCalledTimes(1);

        config.refreshResponsive(700);

        expect(config.current).toEqual(expect.objectContaining({ items: 2, gap: 8 }));
        expect(applied).toHaveBeenCalledTimes(1);

        config.refreshResponsive(1200);

        expect(config.current).toEqual(expect.objectContaining({ items: 4, gap: 16 }));
        expect(applied).toHaveBeenCalledTimes(2);
    });

    it("does not rebuild responsive config when there are no responsive settings or breakpoint changes", () => {
        const events = new Events();
        const applied = vi.fn();
        const configWithoutResponsive = new Config(events, baseConfig({ responsive: null }));
        events.on(EVENTS.CONFIG_APPLIED, applied);

        configWithoutResponsive.refreshResponsive(500);

        expect(applied).not.toHaveBeenCalled();

        const responsive = {
            800: { items: 2 },
        } as unknown as CarouselConfig["responsive"];
        const configWithResponsive = new Config(events, baseConfig({ items: 4, responsive }));
        applied.mockClear();

        configWithResponsive.refreshResponsive(700);
        configWithResponsive.refreshResponsive(750);

        expect(applied).toHaveBeenCalledTimes(1);
        expect(configWithResponsive.current.items).toBe(2);
    });

    it("ignores missing active responsive breakpoint config", () => {
        const responsive = {} as CarouselConfig["responsive"];
        const config = new Config(new Events(), baseConfig({ items: 3, responsive }));

        config.refreshResponsive(500);

        expect(config.current.items).toBe(3);
    });

    it("applies, emits, skips, and clears module overrides", () => {
        const events = new Events();
        const applied = vi.fn();
        const config = new Config(events, baseConfig({ pagination: true, items: 1, gap: 0 }));
        events.on(EVENTS.CONFIG_APPLIED, applied);

        config.setModuleOverride("pagination", { items: 2, gap: 10 }, true);

        expect(config.current).toEqual(expect.objectContaining({ items: 2, gap: 10 }));
        expect(applied).toHaveBeenLastCalledWith(expect.objectContaining({
            isInternalOverride: true,
            new: expect.objectContaining({ items: 2, gap: 10 }),
        }));

        config.updateSettings({ pagination: false });

        expect(config.current).toEqual(expect.objectContaining({ pagination: false, items: 1, gap: 0 }));

        config.updateSettings({ pagination: true });
        config.setModuleOverride("pagination");

        expect(config.current).toEqual(expect.objectContaining({ pagination: true, items: 1, gap: 0 }));
    });

    it("keeps module overrides silent by default", () => {
        const events = new Events();
        const applied = vi.fn();
        const config = new Config(events, baseConfig({ pagination: true, items: 1 }));
        events.on(EVENTS.CONFIG_APPLIED, applied);

        config.setModuleOverride("pagination", { items: 2 });

        expect(config.current.items).toBe(2);
        expect(applied).not.toHaveBeenCalled();
    });

    it("normalizes dependent config values during rebuild", () => {
        const config = new Config(new Events(), baseConfig({
            autoHeight: true,
            centerSlide: false,
            dragSnapMode: DragSnapMode.Closest,
            itemPerPage: true,
            items: 0,
            vertical: true,
        }));

        expect(config.current).toEqual(expect.objectContaining({
            autoHeight: false,
            centerSlide: true,
            itemPerPage: false,
        }));
    });

    it("can explicitly revert to user settings after responsive changes", () => {
        const responsive = {
            800: { items: 1 },
        } as unknown as CarouselConfig["responsive"];
        const config = new Config(new Events(), baseConfig({ items: 4, responsive }));

        config.refreshResponsive(500);
        config.revertToUserSettings();

        expect(config.current.items).toBe(4);
    });

    it("resets defaults, user settings, responsive state, and module overrides", () => {
        const responsive = {
            800: { items: 1 },
        } as unknown as CarouselConfig["responsive"];
        const config = new Config(new Events(), baseConfig({ items: 4, pagination: true, responsive }));

        config.refreshResponsive(500);
        config.setModuleOverride("pagination", { gap: 20 });
        config.reset();

        expect(config.current).toEqual(config.default);
        expect(config.user).toEqual(config.default);
    });

    it("removes responsive event handlers when leaving a breakpoint", () => {
        const events = new Events();

        const responsiveInit = vi.fn();

        const configData: Partial<CarouselConfig> = {
            responsive: {
                1000: {
                    container: ".asdasd",
                    "on:carousel:initalize": responsiveInit,
                }
            }
        }

        const config = new Config(events, configData);

        // Enter responsive breakpoint
        config.refreshResponsive(900);

        // Handler should be registered
        events.emit("carousel:initalize");
        expect(responsiveInit).toHaveBeenCalledTimes(1);

        // Leave responsive breakpoint
        config.refreshResponsive(1200);

        // Should have been removed
        events.emit("carousel:initialize");
        expect(responsiveInit).toHaveBeenCalledTimes(1);
    });

    it("adds right margin to slides when gap is configured", async () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({
            items: 3,
            gap: 20,
        }));

        await carousel.ready;

        const slides = container()!.querySelectorAll(`.${CSS_CLASSES.item}`);

        slides.forEach(slide => {
            expect((slide as HTMLElement).style.marginRight).toBe("20px");
        });
    });

    it("does not add margin when gap is zero", async () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({
            items: 3,
            gap: 0,
        }));

        await carousel.ready;

        const slides = container()!.querySelectorAll(`.${CSS_CLASSES.item}`);

        slides.forEach(slide => {
            expect((slide as HTMLElement).style.marginRight).toBe("");
        });
    });

    it("reduces slide width to compensate for gap", async () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({
            items: 3,
            gap: 30,
        }));

        await carousel.ready;

        const slides = container()!.querySelectorAll(`.${CSS_CLASSES.item}`);

        slides.forEach(slide => {
            const element = slide as HTMLElement;
            expect(element.style.width).not.toBe("");
        });
    });

    it("applies gap to every slide", async () => {
        renderCarousel(8);

        const carousel = new Carousel(baseConfig({
            items: 2,
            gap: 15,
        }));

        await carousel.ready;

        const slides = container()!.querySelectorAll(`.${CSS_CLASSES.item}`);

        expect(slides.length).toBe(8);

        for (const slide of slides) {
            expect((slide as HTMLElement).style.marginRight).toBe("15px");
        }
    });
});

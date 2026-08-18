import { afterEach, describe, expect, it, vi } from "vitest";
import { CSS_CLASSES } from "../src/constants/css-classes";
import { EVENTS } from "../src/constants/events-list";
import Autoplay from "../src/modules/autoplay";
import LazyLoad from "../src/modules/lazyLoad";
import Nav from "../src/modules/nav";
import Pagination from "../src/modules/pagination";
import type { CarouselConfig, CarouselStatus } from "../src/types/carousel.types";
import type { ModuleContext } from "../src/types/module.params";
import type { Config } from "../src/core/config";
import { Events } from "../src/core/events";
import ModuleLoader from "../src/core/module-loader";
import { baseConfig, renderCarousel } from "./helpers";
import Carousel from "../src/core/carousel";

const createConfig = (overrides: Partial<CarouselConfig> = {}): CarouselConfig => ({
    container: ".ddcarousel",
    autoplay: false,
    lazyLoad: false,
    loop: false,
    nav: false,
    pagination: false,
    urlNav: false,
    ...overrides,
} as CarouselConfig);

const createContext = (config = createConfig()): ModuleContext => {
    const events = new Events();
    const container = document.createElement("div");
    container.className = "ddcarousel";
    container.innerHTML = `<div class="${CSS_CLASSES.stage}"></div>`;
    document.body.appendChild(container);

    return {
        config,
        configClass: {
            current: config,
            setModuleOverride: vi.fn(),
        } as unknown as Config,
        events,
        getStatus: vi.fn(() => ({ config: { current: config } }) as CarouselStatus),
        container,
    };
};

afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
});

describe("ModuleLoader", () => {
    it("loads enabled internal modules from config when no explicit list is provided", async () => {
        const context = createContext(createConfig({ nav: true, pagination: true, loop: false }));
        const loader = new ModuleLoader(context);

        await loader.loadAll();

        expect(loader.modules.map(module => module.id)).toEqual(["nav", "pagination"]);
    });

    it("deduplicates explicit module lists and reuses loaded instances", async () => {
        const loader = new ModuleLoader(createContext(createConfig({ nav: true })));

        await loader.loadAll(["nav", "nav"]);
        await loader.load("nav");

        expect(loader.modules.map(module => module.id)).toEqual(["nav"]);
    });

    it("initializes loaded modules that are enabled and emits loaded events", async () => {
        const initialize = vi.spyOn(Nav.prototype, "initialize").mockImplementation(() => undefined);
        const events = new Events();
        const context = createContext(createConfig({ nav: true }));
        context.events = events;
        const onLoaded = vi.fn();
        events.on(EVENTS.MODULE_LOADED, onLoaded);
        const loader = new ModuleLoader(context);

        await loader.load("nav");
        loader.initAll();

        expect(initialize).toHaveBeenCalledTimes(1);
        expect(onLoaded).toHaveBeenCalledWith({ name: "nav" });
    });

    it("does not initialize loaded modules that are disabled in the current config", async () => {
        const initialize = vi.spyOn(Nav.prototype, "initialize").mockImplementation(() => undefined);
        const loader = new ModuleLoader(createContext(createConfig({ nav: false })));

        await loader.load("nav");
        loader.initAll();

        expect(initialize).not.toHaveBeenCalled();
    });

    it("unloads a module by destroying its lifecycle, removing it, and emitting an event", async () => {
        vi.spyOn(Nav.prototype, "initialize").mockImplementation(() => undefined);
        const destroy = vi.spyOn(Nav.prototype, "destroy").mockImplementation(() => undefined);
        const events = new Events();
        const context = createContext(createConfig({ nav: true }));
        context.events = events;
        const onUnloaded = vi.fn();
        events.on(EVENTS.MODULE_UNLOADED, onUnloaded);
        const loader = new ModuleLoader(context);

        await loader.load("nav");
        loader.initAll();
        await loader.unload("nav");
        await loader.unload("nav");

        expect(destroy).toHaveBeenCalledTimes(1);
        expect(loader.modules).toHaveLength(0);
        expect(onUnloaded).toHaveBeenCalledTimes(1);
        expect(onUnloaded).toHaveBeenCalledWith({ name: "nav" });
    });

    it("loads newly enabled modules after config is applied", async () => {
        const events = new Events();
        const context = createContext(createConfig({ lazyLoad: false }));
        context.events = events;
        const loader = new ModuleLoader(context);

        Object.assign(context.config, { lazyLoad: true });
        events.emit(EVENTS.CONFIG_APPLIED, {
            default: createConfig(),
            old: createConfig({ lazyLoad: false }),
            new: createConfig({ lazyLoad: true }),
        });

        await vi.waitFor(() => {
            expect(loader.modules.map(module => module.id)).toContain("lazyLoad");
        });
    });

    it("syncs lifecycle for already loaded modules when config changes", async () => {
        const initialize = vi.spyOn(Nav.prototype, "initialize").mockImplementation(() => undefined);
        const destroy = vi.spyOn(Nav.prototype, "destroy").mockImplementation(() => undefined);
        const events = new Events();
        const context = createContext(createConfig({ nav: false }));
        context.events = events;
        const loader = new ModuleLoader(context);

        await loader.load("nav");

        Object.assign(context.config, { nav: true });
        events.emit(EVENTS.CONFIG_APPLIED, {
            default: createConfig(),
            old: createConfig({ nav: false }),
            new: createConfig({ nav: true }),
        });

        Object.assign(context.config, { nav: false });
        events.emit(EVENTS.CONFIG_APPLIED, {
            default: createConfig(),
            old: createConfig({ nav: true }),
            new: createConfig({ nav: false }),
        });

        expect(initialize).toHaveBeenCalledTimes(1);
        expect(destroy).toHaveBeenCalledTimes(1);
    });

    it("destroys all module instances and clears the registry on reset", async () => {
        const destroyNav = vi.spyOn(Nav.prototype, "destroyLifecycle").mockImplementation(() => undefined);
        const destroyPagination = vi.spyOn(Pagination.prototype, "destroyLifecycle").mockImplementation(() => undefined);
        const loader = new ModuleLoader(createContext(createConfig({ nav: true, pagination: true })));

        await loader.loadAll();
        loader.reset();

        expect(destroyNav).toHaveBeenCalledTimes(1);
        expect(destroyPagination).toHaveBeenCalledTimes(1);
        expect(loader.modules).toEqual([]);
    });

    it("does not initialize modules loaded by config sync until the loader is initialized", async () => {
        const initialize = vi.spyOn(LazyLoad.prototype, "initialize").mockImplementation(() => undefined);
        const events = new Events();
        const context = createContext(createConfig({ lazyLoad: false }));
        context.events = events;
        const loader = new ModuleLoader(context);

        Object.assign(context.config, { lazyLoad: true });
        events.emit(EVENTS.CONFIG_APPLIED, {
            default: createConfig(),
            old: createConfig({ lazyLoad: false }),
            new: createConfig({ lazyLoad: true }),
        });

        await vi.waitFor(() => {
            expect(loader.modules.map(module => module.id)).toContain("lazyLoad");
        });

        expect(initialize).not.toHaveBeenCalled();
    });

    it("can load every internal module without duplicate registry entries", async () => {
        vi.spyOn(Autoplay.prototype, "initialize").mockImplementation(() => undefined);
        const loader = new ModuleLoader(createContext(createConfig({
            autoplay: true,
            lazyLoad: true,
            loop: true,
            nav: true,
            pagination: true,
            urlNav: true,
        })));

        await loader.loadAll(["autoplay", "lazyLoad", "loop", "nav", "pagination", "urlNav", "urlNav"]);

        expect(loader.modules.map(module => module.id)).toEqual(expect.arrayContaining([
            "autoplay",
            "lazyLoad",
            "loop",
            "nav",
            "pagination",
            "urlNav",
        ]));
        expect(loader.modules).toHaveLength(6);
    });

    it("calls destroyLifecycle when unloading a module", async () => {
        const destroyLifecycle = vi.spyOn(Nav.prototype, "destroyLifecycle").mockImplementation(() => undefined);
        const destroy = vi.spyOn(Nav.prototype, "destroy").mockImplementation(() => undefined);
        const loader = new ModuleLoader(
            createContext(createConfig({ nav: true }))
        );

        await loader.load("nav");
        await loader.unload("nav");

        expect(destroyLifecycle).toHaveBeenCalledTimes(1);
        expect(destroy).not.toHaveBeenCalled();
    });

    describe("manual module loading", () => {
        it("loads and initializes a module manually", async () => {
            renderCarousel(3);

            const carousel = new Carousel(baseConfig({ nav: false }));
            await carousel.ready;

            const module = await carousel.loadModule("nav");
            const navModule = carousel.getStatus().modules.find(module => module === "nav");

            expect(navModule).toBeDefined();
            expect(module?.isInitialized).toBe(true);
        });

        it("emits MODULE_LOADED when a module is manually loaded", async () => {
            renderCarousel(3);

            const carousel = new Carousel(baseConfig({ nav: false }));
            await carousel.ready;

            const loaded = vi.fn();

            carousel.on(EVENTS.MODULE_LOADED, loaded);

            await carousel.loadModule("nav");
            expect(loaded).toHaveBeenCalledWith({ name: "nav" });
        });

        it("does not initialize the same module twice", async () => {
            renderCarousel(3);

            const carousel = new Carousel(baseConfig({ nav: false }));
            await carousel.ready;

            const initialized = vi.fn();

            carousel.on(EVENTS.MODULE_INITIALIZED, initialized);

            await carousel.loadModule("nav");
            await carousel.loadModule("nav");
            expect(initialized).toHaveBeenCalledTimes(1);
            expect(initialized).toHaveBeenCalledWith({ name: "nav" });
        });

        it("unloads a manually loaded module", async () => {
            renderCarousel(3);

            const carousel = new Carousel(baseConfig({ nav: false }));
            await carousel.ready;

            await carousel.loadModule("nav");
            expect(carousel.getStatus().modules.some(module => module === "nav")).toBe(true);

            await carousel.unloadModule("nav");
            expect(carousel.getStatus().modules.some(module => module === "nav")).toBe(false);
        });

        it("emits MODULE_DESTROYED and MODULE_UNLOADED when manually unloading a module", async () => {
            renderCarousel(3);

            const carousel = new Carousel(baseConfig({ nav: false }));
            await carousel.ready;

            await carousel.loadModule("nav");

            const destroyed = vi.fn();
            const unloaded = vi.fn();

            carousel.on(EVENTS.MODULE_DESTROYED, destroyed);
            carousel.on(EVENTS.MODULE_UNLOADED, unloaded);

            await carousel.unloadModule("nav");
            expect(destroyed).toHaveBeenCalledWith({ name: "nav" });
            expect(unloaded).toHaveBeenCalledWith({ name: "nav" });
        });

        it("does nothing when unloading a module that is not loaded", async () => {
            renderCarousel(3);

            const carousel = new Carousel(baseConfig({ nav: false }));
            await carousel.ready;

            const unloaded = vi.fn();

            carousel.on(EVENTS.MODULE_UNLOADED, unloaded);

            await expect(carousel.unloadModule("nav")).resolves.not.toThrow();
            expect(unloaded).not.toHaveBeenCalled();
        });

        it("can reload a module after it has been unloaded", async () => {
            renderCarousel(3);

            const carousel = new Carousel(baseConfig({ nav: false }));
            await carousel.ready;

            await carousel.loadModule("nav");
            await carousel.unloadModule("nav");

            const module = await carousel.loadModule("nav");

            expect(module).toBeDefined();
            expect(module?.id).toBe("nav");
            expect(module?.isInitialized).toBe(true);

            expect(carousel.getStatus().modules).toContain("nav");
        });
    });
});

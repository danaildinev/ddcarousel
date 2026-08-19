import { CSS_CLASSES } from "../constants/css-classes";
import { EVENTS, LEGACY_EVENT_MAP } from "../constants/events-list";
import type { CarouselConfig, CarouselModuleMap, CarouselState, CarouselStatus, ModuleId } from "../types/carousel.types";
import type { CarouselEvents, LegacyCarouselEvents } from "../types/event.types";
import { error } from "../utils/error-handler";
import { getClosestSlideIndexes, getSlidesOffsets } from "../utils/slide";
import { Config } from "./config";
import Drag from "./drag";
import { Events } from "./events";
import ModuleLoader from "./module-loader";
import Stage from "./stage";

export default class Carousel {
    #config?: Config | undefined;
    #stage?: Stage | undefined;
    #events?: Events | undefined;
    #moduleLoader?: ModuleLoader | undefined;
    #drag?: Drag | undefined;
    #container!: HTMLDivElement;

    #state: CarouselState = 'idle';
    #initToken: symbol | null = null;

    public ready: Promise<void>;
    #resolveReady!: () => void;
    #rejectReady!: (error: any) => void;

    constructor(config?: Partial<CarouselConfig>) {

        this.#events = new Events();

        this.ready = new Promise((resolve, reject) => {
            this.#resolveReady = resolve;
            this.#rejectReady = reject;
        });

        // for vitest: don't crash if this promise rejects, the user will handle it 
        // when they 'await carousel.ready'
        this.ready.catch(() => { });

        if (config) {
            this.init(config).catch(() => {
                // failure is already exposed through carousel.ready
            });
        }
    }

    async init(config?: Partial<CarouselConfig>): Promise<void> {
        // avoid init in SSR
        if (typeof window === "undefined" || typeof document === "undefined") {
            throw error("Carousel cannot be initialized outside of a browser environment.");
        }

        if (this.#state === 'initializing') {
            console.warn("Already initializing!");
            await this.ready;
            return;
        }

        if (this.#state === "ready") {
            console.warn("Already initialized!");
            return;
        }

        if (this.#state === 'destroyed') {
            throw error("A destroyed carousel cannot be initialized again");
        }

        if (this.#state === 'failed') {
            throw error("A failed carousel cannot be initialized again");
        }

        this.#state = 'initializing';

        const initToken = Symbol();
        this.#initToken = initToken;

        try {
            if (!this.#events) {
                this.#events = new Events();
            }

            //config events wong execute
            this.#events.emit(EVENTS.INITIALIZE);

            this.#config = new Config(this.#events, config);

            const containerOption = this.#config.current.container;
            const container = typeof containerOption === "string" ? document.querySelector<HTMLDivElement>(containerOption) : containerOption;

            if (!container) {
                throw error("Container not found!");
            }
            this.#container = container;

            this.#stage = new Stage(this.#config, this.#events);

            this.#drag = new Drag(this.#config, this.#events, this.getStatus());
            this.#drag.initialize();

            this.#moduleLoader = new ModuleLoader({
                config: this.#config.current,
                configClass: this.#config,
                events: this.#events,
                getStatus: this.getStatus,
                container: container
            });

            // wait for modules to load
            await this.#moduleLoader.loadAll();

            // was the carousel destroyed while we were waiting?
            if (this.#initToken !== initToken || this.#state !== 'initializing') {
                this.#resolveReady(); // resolve gracefully so awaiters don't hang forever
                return;
            }

            // initialize modules synchronously
            this.#moduleLoader.initAll();

            this.#state = 'ready';
            this.#events.emit(EVENTS.INITIALIZED, this.getStatus());
            this.#resolveReady();
        } catch (cause) {
            if (this.#initToken === initToken) {
                this.#moduleLoader?.reset();
                this.#drag?.destroy();
                this.#stage?.destroy(true);
                this.#config?.reset();
                this.#events?.reset();

                this.#drag = undefined;
                this.#moduleLoader = undefined;
                this.#stage = undefined;
                this.#config = undefined;
                this.#config = undefined;

                this.#state = 'failed';
                this.#initToken = null;

                this.#rejectReady(cause);
            }

            throw cause; // re-throw for those explicitly calling init()
        }
    }

    destroy(restoreSlides: boolean = true) {
        if (this.#state === 'destroying' || this.#state === 'destroyed') {
            return;
        }

        this.#state = 'destroying';

        // invalidate any in-flight init
        this.#initToken = null;

        this.#events?.emit(EVENTS.DESTROY);

        this.#drag?.destroy();
        this.#moduleLoader?.reset();
        this.#stage?.destroy(restoreSlides);
        this.#config?.reset();

        this.#events?.emit(EVENTS.DESTROYED);
        this.#events?.reset();

        this.#drag = undefined;
        this.#stage = undefined;
        this.#config = undefined;
        this.#moduleLoader = undefined;
        this.#events = undefined;

        this.#state = 'destroyed';

        this.#resolveReady();
    }

    module = <T extends ModuleId>(moduleId: T): CarouselModuleMap[T] => {
        if (!this.#moduleLoader) {
            throw error("ModuleLoader not initialized");
        }

        const module = this.#moduleLoader.modules.find(m => m.id === moduleId);

        if (!module) {
            throw error(`Module not found: ${moduleId}`);
        }

        return module as CarouselModuleMap[T];
    };

    on<K extends keyof CarouselEvents>(name: K, callback: (payload: CarouselEvents[K]) => void,): void;
    on<K extends keyof LegacyCarouselEvents>(name: K, callback: (payload: LegacyCarouselEvents[K]) => void,): void;
    on(name: keyof CarouselEvents | keyof LegacyCarouselEvents, callback: (payload: any) => void): void {
        if (!this.#events) {
            throw error("Carousel not initialized");
        }

        const eventName = LEGACY_EVENT_MAP[name as keyof LegacyCarouselEvents] ?? name;
        return this.#events.on(eventName as keyof CarouselEvents, callback);
    };

    changePage = (page: number, animate: boolean = true) => {
        if (!this.#events) {
            throw error("Carousel not initialized");
        }

        this.#events.emit(EVENTS.PAGE_CHANGE_REQUEST, {
            index: page,
            animate: animate
        })
    }

    getCurrentPage = () => {
        if (!this.#stage) {
            throw error("Carousel not initialized");
        }

        return this.#stage.currentPage;
    }

    getTotalPages = () => {
        if (!this.#stage) {
            throw error("Carousel not initialized");
        }

        return this.#stage.totalPages;
    }
    getTotalSlides = () => {
        if (!this.#stage) {
            throw error("Carousel not initialized");
        }

        return this.#stage.getSlidesCount();
    }

    nextPage = () => {
        if (!this.#events) {
            throw error("Carousel not initialized");
        }

        this.#events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: "next" });
    }

    prevPage = () => {
        if (!this.#events) {
            throw error("Carousel not initialized");
        }

        this.#events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: "prev" });
    }

    refresh = () => console.warn("refresh() is deprecated!");

    async loadModule<K extends ModuleId>(moduleId: K): Promise<CarouselModuleMap[K] | null> {
        if (!this.#moduleLoader) {
            return null;
        }

        const module = await this.#moduleLoader.load(moduleId);
        if (!module) {
            return null;
        }

        module.initializeLifecycle();

        return module;
    }

    async unloadModule(moduleId: string): Promise<void> {
        if (!this.#moduleLoader) {
            return;
        }

        await this.#moduleLoader.unload(moduleId);
    }

    getStatus = (): CarouselStatus => {
        if (!this.#config || !this.#stage) {
            throw error("Carousel not initialized");
        }

        const stage = this.#container.querySelector<HTMLDivElement>(`.${CSS_CLASSES.stage}`);
        if (!stage) {
            throw error("Error: Stage not found!");
        }

        const vertical = this.#config.current.vertical;
        const viewportCenter = Stage.getViewportCenter(this.#container, vertical);
        const slides = Array.from(stage?.children) as HTMLElement[];
        const offsets = getSlidesOffsets(slides, vertical);
        const currentTranslate = this.#stage.currentTranslate;
        const closestSlidesIndexes = getClosestSlideIndexes(offsets, viewportCenter, currentTranslate, ["left", "center", "right"]);

        return {
            state: this.#state,
            initialized: this.#state === "ready",
            currentPage: this.#stage.currentPage,
            totalPages: this.#stage.totalPages,
            slides: this.#stage.getSlides(),
            totalSlides: this.#stage.getSlidesCount(),
            slidesByPage: this.#stage.slidesByPage,
            visibleSlides: this.#stage.visibleSlides,
            config: {
                current: { ...this.#config.current }
            },
            currentTranslate: currentTranslate,
            modules: this.#moduleLoader?.modules.map(module => module.id) ?? [],
            closestSlidesIndexes: closestSlidesIndexes
        };
    }
}
import { CSS_CLASSES } from "../constants/css-classes";
import { EVENTS } from "../constants/events-list";
import type Autoplay from "../modules/autoplay";
import type UrlNav from "../modules/urlNav";
import type { CarouselConfig, CarouselStatus } from "../types/carousel.types";
import { error } from "../utils/error-handler";
import { getClosestSlideIndexes, getSlidesOffsets } from "../utils/slide";
import { Config } from "./config";
import Drag from "./drag";
import { Events } from "./events";
import ModuleLoader from "./module-loader";
import Stage from "./stage";

export default class Carousel {
    #config!: Config;
    #stage!: Stage;
    #events: Events;
    #moduleLoader!: ModuleLoader;
    #drag?: Drag;
    #container!: HTMLDivElement;

    #initialized: boolean = false;
    #state: 'idle' | 'initializing' | 'ready' | 'destroying' | 'destroyed' = 'idle';
    #initToken: symbol | null = null;

    constructor(config?: Partial<CarouselConfig>) {
        if (this.#initialized)
            throw error("Already initialized!");

        this.#events = new Events();

        if (config) {
            this.init(config);
        }
    }

    async init(config: Partial<CarouselConfig>) {
        if (this.#state === 'initializing' || this.#state === 'ready') {
            console.warn("Already initialized!");
            return;
        }

        this.#state = 'initializing';

        const initToken = Symbol();
        this.#initToken = initToken;


        if (!this.#events) {
            this.#events = new Events();
        }

        //config events wong execute
        this.#events.emit(EVENTS.INITIALIZE);

        this.#config = new Config(config, this.#events);

        const container = document.querySelector<HTMLDivElement>(this.#config.current.container);
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
        await this.#moduleLoader.loadAll();

        // prevent async completion after destroy/re-init
        if (this.#initToken !== initToken || this.#state !== 'initializing') {
            return;
        }

        this.#state = 'ready';
        this.#initialized = true;
        this.#events.emit(EVENTS.INITIALIZED, this.getStatus());
    }

    destroy(restoreSlides: boolean) {
        if (this.#state === 'destroying' || this.#state === 'destroyed') {
            return;
        }

        this.#state = 'destroying';

        // invalidate any in-flight init
        this.#initToken = null;

        this.#events.emit(EVENTS.DESTROY);

        this.#drag?.destroy();

        this.#stage.destroy(restoreSlides);
        this.#config.reset();
        this.#moduleLoader.reset();

        this.#config = null!;
        this.#stage = null!;
        this.#moduleLoader = null!;
        this.#drag = null!;

        this.#events.emit(EVENTS.DESTROYED);
        this.#events.reset();
        this.#events = null!;

        this.#initialized = false;
        this.#state = 'destroyed';
    }

    module = (name: string) => this.#moduleLoader?.modules.find(m => m.id === name);

    on = (name: string, callback: any) => this.#events.on(name, callback);

    changePage = (page: number, animate: boolean) => this.#events.emit(EVENTS.PAGE_CHANGE_REQUEST, {
        index: page,
        animate: animate
    });

    getCurrentPage = () => this.#stage.currentPage;

    getTotalPages = () => this.#stage.totalPages;

    getTotalSlides = () => this.#stage.getSlidesCount();

    nextPage = () => this.#events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: "next" });

    prevPage = () => this.#events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: "prev" });

    refresh = () => console.warn("refresh() is deprecated!");

    autoplayStart = () => {
        console.warn("autoplayStart() is deprecated: use carousel.module('autoplay').start()!");
        (this.module("autoplay") as Autoplay)?.start();
    }

    autoplayStop = () => {
        console.warn("autoplayStop() is deprecated: use carousel.module('autoplay').stop()!");
        (this.module("autoplay") as Autoplay)?.stop();
    }

    goToUrl = (name: string, enabmeAnim: boolean) => {
        console.warn("goToUrl() is deprecated: use carousel.module('urlNav').goToUrl()!");
        (this.module("urlNav") as UrlNav)?.goToUrl(name, enabmeAnim);
    }

    getStatus = (): CarouselStatus => {
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
            created: this.#initialized,
            currentPage: this.#stage.currentPage,
            totalPages: this.#stage.totalPages,
            slides: this.#stage.getSlides(),
            totalSlides: this.#stage.getSlidesCount(),
            pageSlides: this.#stage.pageSlides,
            activeSlides: this.#stage.slidesActive,
            config: {
                current: this.#config.current
            },
            currentTranslate: currentTranslate,
            modules: this.#moduleLoader?.modules,
            closestSlidesIndexes: closestSlidesIndexes
        };
    }
}
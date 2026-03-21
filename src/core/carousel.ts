import { EVENTS } from "../constants/events-list";
import type Autoplay from "../modules/autoplay";
import type UrlNav from "../modules/urlNav";
import type { CarouselConfig, CarouselStatus } from "../types/carousel.types";
import { error } from "../utils/error-handler";
import { Config } from "./config";
import { Events } from "./events";
import ModuleLoader from "./module-loader";
import { ModuleName } from "./module-names";
import Stage from "./stage";

export default class Carousel {
    #config!: Config;
    #stage!: Stage;
    #events: Events;
    #moduleLoader!: ModuleLoader;

    #initialized: boolean = false;

    constructor(config: CarouselConfig) {
        if (this.#initialized)
            throw error("Already initialized!");

        this.#events = new Events();

        if (config !== undefined)
            this.init(config);
    }

    init(config: CarouselConfig) {
        if (this.#initialized) {
            console.warn("Already initialized!");
            return;
        }

        if (this.#events === null)
            this.#events = new Events();

        //config events wong execute
        this.#events.emit(EVENTS.INITIALIZE);

        this.#config = new Config(config, this.#events);
        this.#stage = new Stage(this.#config, this.#events);

        this.#moduleLoader = new ModuleLoader({
            config: this.#config,
            events: this.#events,
            status: this.getStatus()
        });
        this.#moduleLoader.loadAll();
        this.#events.on(EVENTS.CONFIG_CHANGED, this.#moduleLoader.toggleAll);

        this.#initialized = true;
        this.#events.emit(EVENTS.INITIALIZED, this.getStatus());
    }

    destroy(restoreSlides: boolean) {
        this.#events.emit(EVENTS.DESTROY);

        this.#stage.destroy(restoreSlides);
        this.#config.reset();
        this.#events.off(EVENTS.CONFIG_CHANGED, this.#moduleLoader.toggleAll);
        this.#moduleLoader.reset();

        this.#config = null!;
        this.#stage = null!;
        this.#moduleLoader = null!;

        this.#events.emit(EVENTS.DESTROYED);
        this.#events.reset();
        this.#events = null!;

        this.#initialized = false;
    }

    module = (name: ModuleName) => this.#moduleLoader?.modules.find(m => m.name === name);

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
        (this.module(ModuleName.Autoplay) as Autoplay)?.start();
    }

    autoplayStop = () => {
        console.warn("autoplayStop() is deprecated: use carousel.module('autoplay').stop()!");
        (this.module(ModuleName.Autoplay) as Autoplay)?.stop();
    }

    goToUrl = (name: string, enabmeAnim: boolean) => {
        console.warn("goToUrl() is deprecated: use carousel.module('urlNav').goToUrl()!");
        (this.module(ModuleName.UrlNav) as UrlNav)?.goToUrl(name, enabmeAnim);
    }

    getStatus(): CarouselStatus {
        return {
            created: this.#initialized !== undefined,
            currentPage: this.#stage.currentPage,
            totalPages: this.#stage.totalPages,
            slides: this.#stage.getSlides(),
            totalSlides: this.#stage.getSlidesCount(),
            activeSlides: this.#stage.slidesActive,
            config: {
                current: this.#config.current
            },
            currentTranslate: this.#stage.currentTranslate,
            modules: this.#moduleLoader?.modules
        };
    }
}
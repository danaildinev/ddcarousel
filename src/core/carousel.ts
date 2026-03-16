import { EVENTS } from "../constants/events-list";
import type { CarouselConfig, CarouselStatus } from "../types/carousel.types";
import { error } from "../utils/error-handler";
import { Config } from "./config";
import { Events } from "./events";
import ModuleLoader from "./module-loader";
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

        this.#moduleLoader = new ModuleLoader(this.#config, this.#events, this.getStatus());
        this.#moduleLoader.loadAll();

        this.#initialized = true;
        this.#events.emit(EVENTS.INITIALIZED, this.getStatus());
    }

    destroy(fullReset: boolean) {
        this.#config.reset();
        this.#config = null!;
    }

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
        };
    }
}
import { EVENTS } from "../constants/events-list";
import type { CarouselConfig, CarouselStatus } from "../types/carousel.types";
import { Config } from "./config";
import { Events } from "./events";
import Stage from "./stage";

export default class Carousel {
    #config!: Config;
    #stage!: Stage;
    #events: Events;
    #initialized: boolean = false;

    constructor(config: CarouselConfig) {
        if (this.#initialized)
            throw Error("Already initialized!");

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

        this.#config = new Config(config);
        this.#stage = new Stage(this.#config, this.#events);

        this.#initialized = true;
        this.#events.emit(EVENTS.INITIALIZED, this.getStatus());
    }

    destroy(fullReset: boolean) {
        this.#config.reset();
        this.#config = null!;
    }

    on = (name: string, callback: any) => this.#events.on(name, callback);

    changePage = (page: number, animate: boolean) => this.#events.emit(EVENTS.PAGE_CHANGE, {
        index: page,
        animate: animate
    });

    nextPage = () => this.#events.emit(EVENTS.PAGE_CHANGE, { index: "next" });

    prevPage = () => this.#events.emit(EVENTS.PAGE_CHANGE, { index: "prev" });

    getStatus(): CarouselStatus {
        return {
            created: this.#initialized !== undefined,
            currentPage: this.#stage.currentPage,
            totalPages: this.#stage.totalPages,
            totalSlides: this.#stage.getSlidesCount(),
            activeSlides: this.#stage.slidesActive,
            currentTranslate: this.#stage.currentTranslate,
        };
    }
}
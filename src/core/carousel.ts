import type { CarouselConfig } from "../types/carousel.types";
import { Config } from "./config";
import Stage from "./stage";

export default class Carousel {
    #config!: Config;
    #stage!: Stage;
    #initialized: boolean = false;

    constructor(config: CarouselConfig) {
        if (this.#initialized)
            throw Error("Already initialized!");

        if (config !== undefined)
            this.init(config);
    }

    init(config: CarouselConfig) {
        if (this.#initialized) {
            console.warn("Already initialized!");
            return;
        }

        this.#config = new Config(config);
        this.#stage = new Stage(this.#config);

        this.#stage.changePage(this.#config.config.startPage > 0 ? this.#config.config.startPage : 0, false);

        this.#initialized = true;
    }

    destroy(fullReset: boolean) {
        this.#config.reset();
        this.#config = null!;
    }
}
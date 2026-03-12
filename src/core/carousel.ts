import type { CarouselConfig } from "../types/carousel.types";
import { Config } from "./config";

export default class Carousel {
    #config!: Config;
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

        this.#initialized = true;
    }

    destroy(fullReset: boolean) {
        this.#config.reset();
        this.#config = null!;
    }
}
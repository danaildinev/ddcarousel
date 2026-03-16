import type { CarouselConfig, CarouselStatus } from "../types/carousel.types";
import type { Config } from "./config";
import type { Events } from "./events";
import type { Module } from "./module";
import type { ModuleName } from "./module-names";

export abstract class BaseModule implements Module {
    abstract name: ModuleName;

    protected config: CarouselConfig;
    protected events: Events;
    protected status: CarouselStatus;

    constructor(config: Config, events: Events, status: CarouselStatus) {
        this.config = config.current;
        this.events = events;
        this.status = status;
    }

    abstract init(): void;
    abstract destroy(): void;
    abstract attachEvents(): void;
    abstract detachEvents(): void;
}
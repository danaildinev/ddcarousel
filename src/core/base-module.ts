import type { CarouselConfig, CarouselStatus } from "../types/carousel.types";
import type { ModuleLoaderParams } from "../types/module.params";
import { error } from "../utils/error-handler";
import type { Events } from "./events";
import type { Module } from "./module";
import type { ModuleName } from "./module-names";

export abstract class BaseModule implements Module {
    abstract name: ModuleName;

    protected config: CarouselConfig;
    protected events: Events;
    protected status: CarouselStatus;
    protected container: HTMLDivElement;

    constructor(params: ModuleLoaderParams) {
        this.config = params.config.current;
        this.events = params.events;
        this.status = params.status;

        const containerDiv = document.querySelector<HTMLDivElement>(`${this.config.container}`);
        if (containerDiv === null)
            throw error("Module won't initialize! Stage DOM was not found!");
        this.container = containerDiv;
    }

    abstract init(): void;
    abstract destroy(): void;
    abstract attachEvents(): void;
    abstract detachEvents(): void;
}
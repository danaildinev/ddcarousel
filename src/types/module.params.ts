import type { Config } from "../core/config";
import type { Events } from "../core/events";
import type { CarouselConfig, CarouselStatus } from "./carousel.types";

export type ModuleContext = {
    config: CarouselConfig,
    configClass: Config,
    events: Events,
    getStatus: () => CarouselStatus,
    container: HTMLDivElement
};
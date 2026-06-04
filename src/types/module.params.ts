import type { Events } from "../core/events";
import type { CarouselConfig, CarouselStatus } from "./carousel.types";

export type ModuleContext = {
    config: CarouselConfig,
    events: Events,
    getStatus: () => CarouselStatus,
    container: HTMLDivElement
};
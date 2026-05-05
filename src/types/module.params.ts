import type { Config } from "../core/config";
import type { Events } from "../core/events";
import type { CarouselStatus } from "./carousel.types";

export type ModuleLoaderParams = {
    config: Config,
    events: Events,
    getStatus: () => CarouselStatus
};
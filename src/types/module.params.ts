import type { Config } from "../core/config";
import type { Events } from "../core/events";
import type { CarouselConfig, CarouselStatus } from "./carousel.types";

/**
 * Module context providing shared configuration, events, state access, and DOM references.
 *
 * @public
 */
export type ModuleContext = {
    config: CarouselConfig,
    configClass: Config,
    events: Events,
    getStatus: () => CarouselStatus,
    container: HTMLDivElement
};
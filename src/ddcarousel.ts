import "./styles/ddcarousel.scss";
import Carousel from "./core/carousel";
import { EVENTS, LEGACY_EVENT_MAP, type CarouselOnEvents } from "./constants/events-list";
import { DragSnapMode } from "./types/carousel.types";
import type { CarouselConfig, CarouselModuleMap, CarouselState, CarouselStatus, CarouselStatusConfig, ModuleId } from "./types/carousel.types";
import type { CarouselEvents, LegacyCarouselEvents, ModuleEventPayload, PageChangePayload, PageChangeScrollPayload } from "./types/event.types";
import type Autoplay from "./modules/autoplay";
import type { AutoplayConfig } from "./modules/autoplay";
import type Nav from "./modules/nav";
import type Pagination from "./modules/pagination";
import type LazyLoad from "./modules/lazyLoad";
import type Loop from "./modules/loop";
import type UrlNav from "./modules/urlNav";
import type { LazyLoadConfig } from "./modules/lazyLoad";
import { PRIORITY } from "./constants/priorities";
import { EVENTS_AUTOPLAY } from "./constants/autoplay-events";
import type { BaseModule, ModuleStyle } from "./core/base-module";
import type { ClosestSlideDirection, ClosestSlideIndexes } from "./utils/slide";
import type MouseWheel from "./modules/mouseWheel";
import type { Module } from "./core/module";
import type { MouseWheelConfig } from "./modules/mouseWheel";
import type { ModuleContext } from "./types/module.params";
import type { Config } from "./core/config";
import type { Events } from "./core/events";
import type { PriorityPayload } from "./types/event-payload.types";

/**
 * Creates a new ddcarousel instance.
 *
 * @param config - optional carousel config
 * @returns carousel instance
 *
 * @public
 */
export default function ddcarousel(config?: Partial<CarouselConfig>) {
    return new Carousel(config);
}

export {
    Carousel,
    EVENTS,
    EVENTS_AUTOPLAY,
    LEGACY_EVENT_MAP,
    PRIORITY,
    DragSnapMode,
};

export type {
    CarouselConfig,
    CarouselState,
    CarouselStatus,
    CarouselStatusConfig,
    ClosestSlideIndexes,
    ClosestSlideDirection,

    CarouselEvents,
    CarouselOnEvents,
    LegacyCarouselEvents,
    PageChangePayload,
    ModuleEventPayload,
    PageChangeScrollPayload,
    PriorityPayload,

    Config,
    Events,
    Module,
    ModuleContext,
    ModuleStyle,
    BaseModule,
    ModuleId,
    CarouselModuleMap,

    Autoplay,
    AutoplayConfig,
    MouseWheel,
    MouseWheelConfig,
    Nav,
    Pagination,
    LazyLoad,
    LazyLoadConfig,
    Loop,
    UrlNav
};
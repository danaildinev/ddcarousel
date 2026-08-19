import "./ddcarousel.scss";
import Carousel from "./core/carousel";
import { EVENTS } from "./constants/events-list";
import { DragSnapMode } from "./types/carousel.types";
import type { CarouselConfig, CarouselModuleMap, CarouselState, CarouselStatusConfig, ModuleId } from "./types/carousel.types";
import type { CarouselEvents, LegacyCarouselEvents, ModuleEventPayload, PageChangePayload, PageChangeScrollPayload } from "./types/event.types";
import type Autoplay from "./modules/autoplay";
import type { AutoplayConfig } from "./modules/autoplay";
import type Nav from "./modules/nav";
import type Pagination from "./modules/pagination";
import type LazyLoad from "./modules/lazyLoad";
import type Loop from "./modules/loop";
import type UrlNav from "./modules/urlNav";
import type { LazyLoadConfig } from "./modules/lazyLoad";

export default function ddcarousel(config?: Partial<CarouselConfig>) {
    return new Carousel(config);
}

export {
    Carousel,
    EVENTS,
    DragSnapMode,
};
export type {
    CarouselConfig,
    CarouselState,
    CarouselStatusConfig,

    CarouselEvents,
    LegacyCarouselEvents,
    PageChangePayload,
    ModuleEventPayload,
    PageChangeScrollPayload,

    ModuleId,
    CarouselModuleMap,

    Autoplay,
    AutoplayConfig,
    Nav,
    Pagination,
    LazyLoad,
    LazyLoadConfig,
    Loop,
    UrlNav
};
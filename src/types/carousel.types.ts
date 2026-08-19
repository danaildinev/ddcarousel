import type { CarouselOnEvents } from "../constants/events-list";
import type Autoplay from "../modules/autoplay";
import type LazyLoad from "../modules/lazyLoad";
import type Loop from "../modules/loop";
import type Nav from "../modules/nav";
import type Pagination from "../modules/pagination";
import type UrlNav from "../modules/urlNav";
import type { ClosestSlideIndexes } from "../utils/slide";

export type CarouselConfig = {
    container: string | HTMLDivElement;
    autoHeight: boolean;
    fullWidth: boolean;
    startPage: number;
    items: number;
    gap: number;
    itemPerPage: boolean;
    vertical: boolean;
    verticalMaxContentWidth: boolean;
    responsive?: Record<number, Partial<CarouselConfig> & Partial<CarouselOnEvents>> | null;
    touchDrag: boolean;
    dragSnapMode: DragSnapMode,
    mouseDrag: boolean;
    keyboardNavigation: boolean;
    centerSlide: boolean;
    swipeThreshold: number;
    dragMaxDistance: number;
    resizeDebounce: number;
    swipeSmooth: number;
    slideChangeDuration: number;
    [key: string]: unknown;
}

export type CarouselStatus = {
    state: CarouselState;
    initialized: boolean;
    currentPage: number;
    totalPages: number;
    slides: HTMLDivElement[];
    totalSlides: number;
    slidesByPage: number[][];
    visibleSlides: number[];
    config: CarouselStatusConfig;
    currentTranslate: number;
    modules: string[],
    closestSlidesIndexes: ClosestSlideIndexes
}

export type CarouselStatusConfig = {
    current?: CarouselConfig
}

export type CarouselState = 'idle' | 'initializing' | 'ready' | 'failed' | 'destroying' | 'destroyed';

export enum DragSnapMode {
    Swipe = "swipe",
    Closest = "closest"
}

export type CarouselModuleMap = {
    autoplay: Autoplay;
    nav: Nav;
    pagination: Pagination;
    lazyLoad: LazyLoad;
    loop: Loop;
    urlNav: UrlNav;
};

export type ModuleId = keyof CarouselModuleMap;
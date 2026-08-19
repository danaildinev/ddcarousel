import type { BaseModule } from "../core/base-module";
import type { CarouselOnEvents } from "../constants/events-list";
import type { ClosestSlideIndexes } from "../utils/slide";

export type CarouselConfig = {
    container: string | HTMLDivElement;
    nav: boolean;
    pagination: boolean;
    autoHeight: boolean;
    fullWidth: boolean;
    startPage: number;
    items: number;
    gap: number;
    itemPerPage: boolean;
    loop: boolean;
    vertical: boolean;
    verticalMaxContentWidth: boolean;
    urlNav: boolean;
    urlNavContainer: string | null;
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
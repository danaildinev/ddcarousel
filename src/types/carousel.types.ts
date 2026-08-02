import type { BaseModule } from "../core/base-module";
import type { CarouselOnEvents } from "../constants/events-list";
import type { ClosestSlideIndexes } from "../utils/slide";

export type CarouselConfig = {
    container: string;
    nav: boolean;
    navPrevContent: string;
    navNextContent: string;
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
    touchSwipeThreshold: number;
    touchMaxSlideDist: number;
    resizeRefresh: number;
    swipeSmooth: number;
    slideChangeDuration: number;
    labelNavPrev: string | null;
    labelNavNext: string | null;
    [key: string]: unknown;
}

export type CarouselStatus = {
    state: CarouselState;
    created: boolean;
    currentPage: number;
    totalPages: number;
    slides: HTMLDivElement[];
    totalSlides: number;
    pageSlides: number[][];
    activeSlides: number[];
    config: CarouselStatusConfig;
    currentTranslate: number;
    modules: BaseModule[] | undefined,
    closestSlidesIndexes: ClosestSlideIndexes
}

export type CarouselStatusConfig = {
    current?: CarouselConfig
}

export type CarouselState = 'idle' | 'initializing' | 'ready' | 'destroying' | 'destroyed';

export enum DragSnapMode {
    Swipe = "swipe",
    Closest = "closest"
}
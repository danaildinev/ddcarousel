import type { BaseModule } from "../core/base-module";
import type { ClosestSlideIndexes } from "../utils/slide";

export type CarouselConfig = {
    container: string;
    nav: boolean;
    navPrevContent: string;
    navNextContent: string;
    dots: boolean | null;
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
    lazyLoad: boolean;
    lazyPreload: boolean;
    lazyPreloadSlides: number;
    responsive?: CarouselConfig[] | null;
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
}

export type CarouselStatus = {
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

export enum DragSnapMode {
    Swipe = "swipe",
    Closest = "closest"
}
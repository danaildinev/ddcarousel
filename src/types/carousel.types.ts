import type { BaseModule } from "../core/base-module";

export type CarouselConfig = {
    container: string;
    nav: boolean;
    dots: boolean;
    autoHeight: boolean;
    fullWidth: boolean;
    startPage: number;
    items: number;
    itemPerPage: boolean;
    loop: boolean;
    vertical: boolean;
    verticalMaxContentWidth: boolean;
    urlNav: boolean;
    lazyLoad: boolean;
    lazyPreload: boolean;
    lazyPreloadSlides: number;
    responsive?: CarouselConfig[] | null;
    autoplay: boolean;
    autoplaySpeed: number;
    autoplayPauseHover: boolean;
    autoplayProgress: boolean;
    autoplayPauseOnTabHidden: boolean;
    touchDrag: boolean;
    mouseDrag: boolean;
    keyboardNavigation: boolean;
    centerSlide: boolean;
    touchSwipeThreshold: number;
    touchMaxSlideDist: number;
    resizeRefresh: number;
    swipeSmooth: number;
    slideChangeDuration: number;
    labelNavPrev: string;
    labelNavNext: string;
}

export type CarouselStatus = {
    created: boolean;
    currentPage: number;
    totalPages: number;
    slides: HTMLDivElement[];
    totalSlides: number;
    activeSlides: number[];
    config: CarouselStatusConfig;
    currentTranslate: number;
    modules: BaseModule[] | undefined
}

export type CarouselStatusConfig = {
    current?: CarouselConfig
}
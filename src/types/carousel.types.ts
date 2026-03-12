export type CarouselConfig = {
    container: string;
    nav: boolean;
    dots: boolean;
    autoHeight: boolean;
    fullWidth: boolean;
    startPage: number;
    items: number;
    itemPerPage: boolean;
    vertical: boolean;
    verticalMaxContentWidth: boolean;
    urlNav: boolean;
    lazyLoad: boolean;
    lazyPreload: boolean;
    lazyPreloadSlides: number;
    responsive?: {};
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
    totalSlides: number;
    activeSlides: number[];
    currentTranslate: number;
}
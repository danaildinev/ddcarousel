import type { CarouselOnEvents } from "../constants/events-list";
import type Autoplay from "../modules/autoplay";
import type LazyLoad from "../modules/lazyLoad";
import type Loop from "../modules/loop";
import type MouseWheel from "../modules/mouseWheel";
import type Nav from "../modules/nav";
import type Pagination from "../modules/pagination";
import type UrlNav from "../modules/urlNav";
import type { ClosestSlideIndexes } from "../utils/slide";

/**
 * Carousel config options
 *
 * @public
 */
export type CarouselConfig = {
    container: string | HTMLDivElement;
    autoHeight: boolean;
    fullWidth: boolean;
    fullPage?: boolean;
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
    slideChangeEasing?: string;
    [key: string]: unknown;
}

/**
 * The current state and status of a carousel instance.
 *
 * @public
 */
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
    closestSlidesIndexes: ClosestSlideIndexes,
    created: boolean,
    activeSlides: number[]
}

/**
 * The current carousel config
 *
 * @public
 */
export type CarouselStatusConfig = {
    current?: CarouselConfig
}

/**
 * The current carousel lifecycle state 
 *
 * @public
 */
export type CarouselState = 'idle' | 'initializing' | 'ready' | 'failed' | 'destroying' | 'destroyed';

/**
 * How the target slide is selected after dragging
 *
 * @public
 */
export enum DragSnapMode {
    Swipe = "swipe",
    Closest = "closest"
}

/**
 * List with internal carousel modules
 *
 * @public
 */
export type CarouselModuleMap = {
    autoplay: Autoplay;
    nav: Nav;
    pagination: Pagination;
    lazyLoad: LazyLoad;
    loop: Loop;
    urlNav: UrlNav;
    mouseWheel: MouseWheel;
};

/**
 * Module unique id
 *
 * @public
 */
export type ModuleId = keyof CarouselModuleMap;
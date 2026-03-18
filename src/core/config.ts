import { EVENTS, LEGACY_EVENT_MAP } from "../constants/events-list";
import type { CarouselConfig } from "../types/carousel.types";
import type { Events } from "./events";

export class Config {
    #events: Events;

    #lastResponsiveBp: number | null = 0;
    #responsiveLoaded: boolean = false;

    default: CarouselConfig;
    current: CarouselConfig;
    user: CarouselConfig;
    //responsive: CarouselConfig | null;

    constructor(userConfig: CarouselConfig, events: Events) {
        this.#events = events;

        this.default = this.#setDefaultConfig();
        this.user = userConfig === undefined ? structuredClone(this.default) : userConfig;
        this.current = structuredClone(this.default);
        //this.responsive = {} as CarouselConfig;

        this.updateSettings(this.user);
    }

    // todo idea: lazyPreloadSlides = items * 2
    #setDefaultConfig(): CarouselConfig {
        return {
            container: `.ddcarousel`,
            nav: false,
            dots: true,
            autoHeight: true,
            fullWidth: true,
            startPage: 0,
            items: 1,
            itemPerPage: false,
            vertical: false,
            verticalMaxContentWidth: false,
            urlNav: false,
            lazyLoad: false,
            lazyPreload: false,
            lazyPreloadSlides: 1,
            responsive: null,
            autoplay: false,
            autoplaySpeed: 5000,
            autoplayPauseHover: false,
            autoplayProgress: true,
            autoplayPauseOnTabHidden: true,
            touchDrag: true,
            mouseDrag: true,
            keyboardNavigation: false,
            centerSlide: false,
            touchSwipeThreshold: 60,
            touchMaxSlideDist: 500,
            resizeRefresh: 200,
            swipeSmooth: 0,
            slideChangeDuration: 0.5,
            labelNavPrev: "&#x2190;",
            labelNavNext: "&#x2192;"
        }
    }

    updateSettings(config?: Partial<CarouselConfig>) {
        const targetConfig = config === undefined ? this.current : config,
            oldConfig = Object.assign({}, this.current);

        Object.assign(this.current, targetConfig);

        if (this.current.items === 0)
            this.current.itemPerPage = false;

        for (const [key, value] of Object.entries(targetConfig)) {
            if (typeof value !== "function")
                continue;

            const callback = value as (payload?: any) => void; //tricky but it worked ;d

            // new format: on:carousel:initialize
            if (key.startsWith("on:")) {
                const name = key.slice(3);
                this.#events.on(name, callback);
                continue;
            }

            // legacy format: onInitialize
            const mapped = LEGACY_EVENT_MAP[key];
            if (mapped)
                this.#events.on(mapped, callback);
        }

        this.#events.emit(EVENTS.CONFIG_CHANGED, {
            default: this.default,
            old: oldConfig,
            new: targetConfig
        });
    }

    refreshResponsive = (width: number) => {
        if (this.user.responsive == null)
            return;

        const breakpoints = Object.keys(this.user.responsive).map(k => parseInt(k)).sort((a, b) => a - b); // smallest → largest

        let matched: number | null = null;

        // loop and find first matching breakpoint
        for (const breakpoint of breakpoints) {
            if (width < breakpoint) {
                matched = breakpoint;
                break;
            }
        }

        if (matched !== null) {
            if (!this.#responsiveLoaded || this.#lastResponsiveBp !== matched) {
                this.updateSettings(this.user.responsive[matched]);
                this.#responsiveLoaded = true;
                this.#lastResponsiveBp = matched;
            }
        }
        else if (this.#responsiveLoaded) {
            this.revertToUserSettings();
            this.#responsiveLoaded = false;
            this.#lastResponsiveBp = null;
        }
    }

    revertToUserSettings = () => {
        this.#lastResponsiveBp = 0;
        this.#responsiveLoaded = false;
        Object.assign(this.current, this.user);
        this.updateSettings();
    }

    reset() {
        this.default = this.#setDefaultConfig();
        this.user = structuredClone(this.default);
        this.current = structuredClone(this.default);

        this.#lastResponsiveBp = 0;
        this.#responsiveLoaded = false;
    }
}
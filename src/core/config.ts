import type { CarouselConfig } from "../types/carousel.types";
import type { Events } from "./events";

export class Config {
    #events: Events;

    default: CarouselConfig;
    current: CarouselConfig;
    user: CarouselConfig;
    responsive: CarouselConfig | null;

    constructor(userConfig: CarouselConfig, events: Events) {
        this.#events = events;

        this.default = this.#setDefaultConfig();
        this.user = userConfig === undefined ? structuredClone(this.default) : userConfig;
        this.current = structuredClone(this.default);
        this.responsive = {} as CarouselConfig;

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
            responsive: {},
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
        const targetConfig = config === undefined ? this.current : config;

        Object.assign(this.current, targetConfig);

        if (this.current.items === 0)
            this.current.itemPerPage = false;

        for (const [key, value] of Object.entries(targetConfig)) {
            if (key.startsWith("on:") && typeof value === "function") {
                const name = key.slice(3),
                    payload = value as (payload?: any) => void; //tricky but it worked ;d

                this.#events.on(name, payload);
            }
        }

        //check responsive options
        /*var keys = Object.keys(configResponsive);
        for (var i = keys.length - 1; i >= 0; i--) {
            if (document.body.clientWidth < keys[i]) {
                updateSettings(Object.values(configResponsive)[i]);
            } else if (document.body.clientWidth >= keys[keys.length - 1]) {
                setDefaults();
            }
        }*/
    }

    reset() {
        this.default = this.#setDefaultConfig();
        this.user = structuredClone(this.default);
        this.current = structuredClone(this.default);
        this.responsive = {} as CarouselConfig;
    }
}
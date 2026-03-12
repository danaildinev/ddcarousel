import type { CarouselConfig } from "../types/carousel.types";

export class Config {
    default: CarouselConfig;
    config: CarouselConfig;
    user: CarouselConfig | null;
    responsive: CarouselConfig | null;

    constructor(userConfig: CarouselConfig) {
        this.default = this.#setDefaultConfig();
        this.user = userConfig === undefined ? structuredClone(this.default) : userConfig;
        this.config = structuredClone(this.default);
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

    updateSettings(config?: CarouselConfig) {
        const targetConfig = config === undefined ? this.config : config;;

        Object.assign(this.config, targetConfig);

        if (this.config.items === 0)
            this.config.itemPerPage = false;

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
        this.config = structuredClone(this.default);
        this.responsive = {} as CarouselConfig;

    }
}
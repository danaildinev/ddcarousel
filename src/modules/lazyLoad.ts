import { DATA } from "../constants/data-attrs";
import { EVENTS } from "../constants/events-list";
import { BaseModule } from "../core/base-module";
import type { ModuleContext } from "../types/module.params";
import type { CarouselEvents } from "../types/event.types";

export type LazyLoadConfig = {
    preload: boolean,
    preloadSlides: number,
}

export default class LazyLoad extends BaseModule<LazyLoadConfig> {
    id: string = "lazyLoad";
    moduleConfig: LazyLoadConfig = {
        preload: false,
        preloadSlides: 1,
    };

    constructor(params: ModuleContext) {
        super(params);
    }

    initialize() {
        this.events.on(EVENTS.PAGE_CHANGED, this.#onChangePaged);

        this.load();
    }

    load(visibleSlides?: number[]) {
        const status = this.getStatus();

        const slides = [...(visibleSlides ?? status.visibleSlides ?? [])];
        if (slides.length === 0) {
            return;
        }

        if (this.getResolvedConfig("preload")) {
            const lastActiveIndex = slides[slides.length - 1];
            if (lastActiveIndex === undefined) {
                return;
            }

            const preloadSlidesCount = this.getResolvedConfig("preloadSlides");
            if (preloadSlidesCount === null) {
                return;
            }

            for (let i = lastActiveIndex + 1; i <= lastActiveIndex + preloadSlidesCount; i++) {
                if (i < status.totalSlides && !slides.includes(i)) {
                    slides.push(i);
                }
            }
        }

        slides.forEach(i => {
            const images = document.querySelectorAll(`${this.config.container} [${DATA.attrs.slide}="${i}"] img[${DATA.attrs.lazyImg}]`);
            images.forEach((i) => this.#enableImageSrc(i as HTMLImageElement));
        });
    }

    destroy() {
        this.events.off(EVENTS.PAGE_CHANGED, this.#onChangePaged);
    }

    #onChangePaged = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGED]) => {
        if (!this.isInitialized) {
            return;
        }

        this.load(e.visibleSlides);
    }

    #enableImageSrc(slideImg: HTMLImageElement) {
        const lazySrc = slideImg.dataset[DATA.dataset.lazyImg];
        if (!lazySrc) {
            return;
        }

        slideImg.src = lazySrc;
        slideImg.removeAttribute(DATA.attrs.lazyImg);
    }
}
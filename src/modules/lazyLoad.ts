import { DATA } from "../constants/data-attrs";
import { EVENTS } from "../constants/events-list";
import { BaseModule } from "../core/base-module";
import type { ModuleContext } from "../types/module.params";
import type { CarouselEvents } from "../types/event.types";

export default class LazyLoad extends BaseModule {
    id: string = "lazyLoad";

    constructor(params: ModuleContext) {
        super(params);

        this.events.on(EVENTS.PAGE_CHANGED, this.#onChangePaged);
    }

    initialize(slidesActive?: number[]) {
        const status = this.getStatus();
        slidesActive ??= status.activeSlides;

        if (!slidesActive) {
            return;
        }

        if (this.config.lazyPreload) {
            const lastActiveIndex = slidesActive[slidesActive.length - 1];
            if (lastActiveIndex === undefined) {
                return;
            }

            for (var i = lastActiveIndex + 1; i <= lastActiveIndex + this.config.lazyPreloadSlides; i++) {
                if (i < status.totalSlides && slidesActive.indexOf(i) == -1) {
                    slidesActive.push(i);
                }
            }
        }

        slidesActive.forEach(i => {
            const images = document.querySelectorAll(`${this.config.container} [${DATA.attrs.slide}="${i}"] img[${DATA.attrs.lazyImg}]`);
            images.forEach((i) => this.#enableImageSrc(i as HTMLImageElement));
        });
    }

    destroy() {
        this.events.off(EVENTS.PAGE_CHANGED, this.#onChangePaged);
    }

    #onChangePaged = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGED]) => {
        if (!this.shouldInitialize) {
            return;
        }

        this.initialize(e.slidesActive);
    }

    #enableImageSrc(slideImg?: HTMLImageElement) {
        if (!slideImg) {
            return;
        }

        const lazySrc = slideImg.dataset[DATA.dataset.lazyImg];
        if (!lazySrc) {
            return;
        }

        slideImg.src = lazySrc;
        slideImg.removeAttribute(DATA.attrs.lazyImg);
    }
}
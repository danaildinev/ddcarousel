import { DATA } from "../constants/data-attrs";
import { EVENTS } from "../constants/events-list";
import { BaseModule } from "../core/base-module";
import type { ModuleLoaderParams } from "../types/module.params";
import { ModuleName } from "../core/module-names";
import type { CarouselEvents } from "../types/event.types";

export default class LazyLoad extends BaseModule {
    name: ModuleName = ModuleName.Lazyload;
    file: string = "lazy-load";

    constructor(params: ModuleLoaderParams) {
        super(params);

        this.events.on(EVENTS.PAGE_CHANGE, this.#onChangePage);

        this.emitCreated();
    }

    get shouldInitialize() {
        return this.config.lazyLoad;
    }

    initialize(slidesActive?: number[]) {
        slidesActive ??= this.status.activeSlides;

        if (!slidesActive)
            return;

        if (this.config.lazyPreload) {
            const lastActiveIndex = slidesActive[slidesActive.length - 1];
            if (lastActiveIndex === undefined)
                return;

            for (var i = lastActiveIndex + 1; i <= lastActiveIndex + this.config.lazyPreloadSlides; i++)
                if (i < this.status.totalSlides && slidesActive.indexOf(i) == -1)
                    slidesActive.push(i);
        }

        slidesActive.forEach(i => {
            const images = document.querySelectorAll(`${this.config.container} [${DATA.attrs.slide}="${i}"] img[${DATA.attrs.lazyImg}]`);
            images.forEach((i) => this.#enableImageSrc(i as HTMLImageElement));
        });

        this.emitInitialized();
    }

    destroy() {
        this.events.off(EVENTS.PAGE_CHANGE, this.#onChangePage);
        this.emitDestroyed();
    }

    #onChangePage = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGE]) => {
        if (!this.shouldInitialize)
            return;

        this.initialize(e.slidesActive);
    }

    #enableImageSrc(slideImg?: HTMLImageElement) {
        if (!slideImg)
            return;

        const lazySrc = slideImg.dataset[DATA.dataset.lazyImg];
        if (!lazySrc)
            return;

        slideImg.src = lazySrc;
        slideImg.removeAttribute(DATA.attrs.lazyImg);
    }
}
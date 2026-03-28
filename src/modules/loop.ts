import { CSS_CLASSES } from "../constants/css-classes";
import { DATA } from "../constants/data-attrs";
import { EVENTS } from "../constants/events-list";
import { PRIORITY } from "../constants/priorities";
import { BaseModule } from "../core/base-module";
import { ModuleName } from "../core/module-names";
import type { CarouselEvents } from "../types/event.types";
import type { ModuleLoaderParams } from "../types/module.params";
import { error } from "../utils/error-handler";

export default class Loop extends BaseModule {
    name: ModuleName = ModuleName.Loop;

    #stage: HTMLDivElement;

    constructor(params: ModuleLoaderParams) {
        super(params);

        const stage = document.querySelector<HTMLDivElement>(`${this.config.container} .${CSS_CLASSES.stage}`);
        if (stage === null)
            throw error("Loop module won't initialize! Stage was not found!");
        this.#stage = stage;

        this.emitCreated();
    }

    get shouldInitialize() {
        return this.config.loop;
    }

    initialize() {
        this.events.on(EVENTS.PAGE_CHANGE_INDEX, this.#onPageChangeIndex);
        this.events.on(EVENTS.PAGE_CHANGE_SCROLL_BEFORE, this.#onChangePageScrollBefore);

        this.emitInitialized();
    }

    destroy() {
        this.#clearSlidesForLoop();

        this.events.off(EVENTS.PAGE_CHANGE_INDEX, this.#onPageChangeIndex);
        this.events.off(EVENTS.PAGE_CHANGE_SCROLL_BEFORE, this.#onChangePageScrollBefore);

        this.emitDestroyed();
    }

    #onPageChangeIndex = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGE_INDEX]) => {
        let priority = PRIORITY.BEHAVIOR;

        const canOverride = this.tryOverridePriority(e, priority);
        if (!canOverride)
            return;

        if (e.request === "prev" && e.currentPage === 0)
            e.page = e.totalPages;
        else if (e.request === "next" && e.currentPage === e.totalPages)
            e.page = 0;
        else
            e.handled = false;
    }

    #onChangePageScrollBefore = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGE_SCROLL_BEFORE]) => {
        if (!this.#stage)
            return;

        const stageItems = this.#stage.children;
        if (stageItems === undefined)
            return;

        this.#clearSlidesForLoop();

        const slidesArr = Array.from(stageItems),
            currentIndex = e.currentPage,
            currentSlide = this.#getSlideDom(currentIndex),
            lastSlide = slidesArr[slidesArr.length - 1] as HTMLDivElement;

        if (!currentSlide)
            return;

        const total = e.slidesCount - 1;
        let prev = currentIndex - 1 < 0 ? total : currentIndex - 1,
            next = currentIndex + 1 > total ? 0 : currentIndex + 1;

        // current slide is last slide, always keep it at the end
        const lastSlideNumber = Number(lastSlide.dataset[DATA.dataset.slide]);
        if (currentIndex === lastSlideNumber) {
            lastSlide.after(currentSlide);
        }
        // loop backwards when first slide is active
        else if (slidesArr[0]?.classList.contains("active")) {
            const slideWidth = lastSlide.getBoundingClientRect().width;

            // shift instantly without no animation
            this.events.emit(EVENTS.SLIDE_SCROLL, {
                specifiedPosition: e.currentTranslate + slideWidth,
                animate: false,
            })

            // reorder DOM - move current slide after last
            lastSlide.after(currentSlide);

            // recompute prev/next indexes after reordering - next slide is always the first slide index in the stage
            let newFirst = this.#stage.children[0] as HTMLDivElement;
            prev = lastSlideNumber;
            next = Number(newFirst.dataset[DATA.dataset.slide]);
        }

        // mark prev/next slides
        this.#getSlideDom(prev)?.classList.add(CSS_CLASSES.slidePrev);
        this.#getSlideDom(next)?.classList.add(CSS_CLASSES.slideNext);
    }

    #getSlideDom = (index: number): HTMLDivElement | null =>
        this.container.querySelector<HTMLDivElement>(`[${DATA.attrs.slide}='${index}']`);

    #clearSlidesForLoop() {
        this.container.querySelectorAll<HTMLDivElement>(`.${CSS_CLASSES.slidePrev}, .${CSS_CLASSES.slideNext}`)
            .forEach(e => e.classList.remove(CSS_CLASSES.slidePrev, CSS_CLASSES.slideNext));
    }
}
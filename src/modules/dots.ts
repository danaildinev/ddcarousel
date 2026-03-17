import { CSS_CLASSES } from "../constants/css-classes";
import { DATA } from "../constants/data-attrs";
import { EVENTS } from "../constants/events-list";
import { error } from "../utils/error-handler";
import { BaseModule } from "../core/base-module";
import { ModuleName } from "../core/module-names";
import type { ModuleLoaderParams } from "../types/module.params";
import type { CarouselEvents } from "../types/event.types";

export default class Dots extends BaseModule {
    name: ModuleName = ModuleName.Dots;

    #dotsContainer!: HTMLDivElement;
    #currentPage: number;

    #activeDotClass = "active";

    constructor(params: ModuleLoaderParams) {
        super(params);

        this.#currentPage = this.status.currentPage;

        this.events.on(EVENTS.PAGE_CHANGE, this.#onChangePage);

        this.emitInitialized();
    }

    get loadCondition() {
        return this.config.dots;
    }

    init() {
        //this.#remove();

        if (this.status.totalPages == 0)
            return;

        const dotsElements = document.createElement("div");
        dotsElements.classList.add(CSS_CLASSES.dots);

        let dotsCount;
        if (this.config.items > 1) {
            dotsCount = this.config.centerSlide ? this.status.totalSlides : this.status.totalPages + 1;
        } else {
            dotsCount = this.status.totalSlides;
        }

        for (var i = 0; i < dotsCount; i++) {
            let dot = document.createElement("button");
            dot.classList.add(CSS_CLASSES.dot);
            dot.dataset[DATA.dataset.slide] = i.toString();
            dot.addEventListener("click", () => this.events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: dot.dataset[DATA.dataset.slide] }));
            dotsElements.appendChild(dot);
        }

        this.container.appendChild(dotsElements);

        const dotsContainer = this.container.querySelector<HTMLDivElement>(`.${CSS_CLASSES.dots}`);
        if (dotsContainer == null)
            throw error("Dots container is not found!");

        this.#dotsContainer = dotsContainer;

        this.#setActiveDot();

        this.emitLoaded();
    }

    destroy() {
        this.events.off(EVENTS.PAGE_CHANGE, this.#onChangePage);

        this.#remove();
        this.emitUnloaded();
    }

    #onChangePage = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGE]) => {
        if (!this.loadCondition)
            return;

        if (e.currentPage === undefined)
            return;

        this.#currentPage = e.currentPage;
        this.#setActiveDot();
    }

    #remove() {
        if (this.#dotsContainer != null)
            this.#dotsContainer.remove();
    }

    #setActiveDot() {
        let active = this.container.querySelector(`.${CSS_CLASSES.dot}[${DATA.attrs.slide}].` + this.#activeDotClass);
        if (active != null)
            active.classList.remove(this.#activeDotClass);

        active = this.container.querySelector(`.${CSS_CLASSES.dot}[${DATA.attrs.slide}="${this.#currentPage}"]`);
        if (active == null)
            return;

        active.classList.add(this.#activeDotClass);
    }
}
import { CSS_CLASSES } from "../constants/css-classes";
import { DATA } from "../constants/data-attrs";
import { EVENTS } from "../constants/events-list";
import { error } from "../utils/error-handler";
import { BaseModule } from "../core/base-module";
import type { ModuleContext } from "../types/module.params";
import type { CarouselEvents } from "../types/event.types";

export default class Dots extends BaseModule {
    id: string = "pagination";

    #paginationContainer!: HTMLDivElement;
    #currentPage: number = -1;

    #activeClass = "active";

    constructor(params: ModuleContext) {
        super(params);

        this.events.on(EVENTS.PAGE_CHANGED, this.#onChangePaged);
        this.events.on(EVENTS.CONFIG_APPLIED, this.#onConfigApplied);
    }

    #onConfigApplied = (e: CarouselEvents[typeof EVENTS.CONFIG_APPLIED]) => {
        if (e.old.items === e.new.items) {
            return;
        }

        this.destroy();
        this.initialize();
    }

    initialize() {
        const status = this.getStatus();
        if (status.totalPages == 0) {
            return;
        }

        this.#currentPage = status.currentPage;

        const pagination = document.createElement("div");
        pagination.classList.add(CSS_CLASSES.pagination, CSS_CLASSES.dots);

        for (var i = 0; i < status.pageSlides.length; i++) {
            let dot = document.createElement("span");
            dot.classList.add(CSS_CLASSES.dot);
            dot.dataset[DATA.dataset.slide] = i.toString();
            dot.role = "button";
            dot.addEventListener("click", () => this.events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: dot.dataset[DATA.dataset.slide] }));
            pagination.appendChild(dot);
        }

        this.container.appendChild(pagination);

        const paginationContainer = this.container.querySelector<HTMLDivElement>(`.${CSS_CLASSES.dots}`);
        if (paginationContainer == null) {
            throw error("Pagination container is not found!");
        }

        this.#paginationContainer = paginationContainer;

        this.#setActiveDot();
    }

    destroy() {
        this.events.off(EVENTS.PAGE_CHANGED, this.#onChangePaged);
        this.events.off(EVENTS.CONFIG_APPLIED, this.#onConfigApplied);

        this.#paginationContainer?.remove();
    }

    #onChangePaged = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGED]) => {
        if (!this.shouldInitialize) {
            return;
        }

        if (e.currentPage === undefined) {
            return;
        }

        this.#currentPage = e.currentPage;
        this.#setActiveDot();
    }

    #setActiveDot() {
        let active = this.container.querySelector(`.${CSS_CLASSES.dot}[${DATA.attrs.slide}].` + this.#activeClass);
        if (active != null) {
            active.classList.remove(this.#activeClass);
        }

        active = this.container.querySelector(`.${CSS_CLASSES.dot}[${DATA.attrs.slide}="${this.#currentPage}"]`);
        if (active == null) {
            return;
        }

        active.classList.add(this.#activeClass);
    }
}
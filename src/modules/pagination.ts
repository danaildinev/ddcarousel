import { CSS_CLASSES } from "../constants/css-classes";
import { DATA } from "../constants/data-attrs";
import { EVENTS } from "../constants/events-list";
import { BaseModule } from "../core/base-module";
import type { ModuleContext } from "../types/module.params";
import type { CarouselEvents } from "../types/event.types";

export default class Pagination extends BaseModule {
    id: string = "pagination";

    #paginationContainer: HTMLDivElement | null = null;
    #currentPage: number = -1;

    #activeDataAttr = "data-active";

    constructor(params: ModuleContext) {
        super(params);
    }

    #onConfigApplied = (e: CarouselEvents[typeof EVENTS.CONFIG_APPLIED]) => {
        if (e.old.items === e.new.items) {
            return;
        }

        this.#renderPagination();
    }

    initialize() {
        this.events.on(EVENTS.PAGE_CHANGED, this.#onChangePaged);
        this.events.on(EVENTS.CONFIG_APPLIED, this.#onConfigApplied);

        this.#renderPagination();
    }

    #renderPagination() {
        this.#removePagination();

        const status = this.getStatus();
        if (status.totalPages == 0) {
            return;
        }

        this.#currentPage = status.currentPage;

        const pagination = document.createElement("div");
        pagination.classList.add(CSS_CLASSES.pagination);

        for (let i = 0; i < status.slidesByPage.length; i++) {
            let dot = document.createElement("span");
            dot.classList.add(CSS_CLASSES.dot);
            dot.dataset[DATA.dataset.slide] = i.toString();
            dot.role = "button";
            dot.addEventListener("click", () => this.events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: i }));
            pagination.appendChild(dot);
        }

        this.container.appendChild(pagination);
        this.#paginationContainer = pagination;

        this.#setActiveDot();
    }

    #removePagination() {
        this.#paginationContainer?.remove();
    }

    destroy() {
        this.events.off(EVENTS.PAGE_CHANGED, this.#onChangePaged);
        this.events.off(EVENTS.CONFIG_APPLIED, this.#onConfigApplied);

        this.#removePagination();
        this.#paginationContainer = undefined!;
    }

    #onChangePaged = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGED]) => {
        if (!this.isInitialized) {
            return;
        }

        if (e.currentPage === undefined) {
            return;
        }

        this.#currentPage = e.currentPage;
        this.#setActiveDot();
    }

    #setActiveDot() {
        this.#paginationContainer?.querySelector(`.${CSS_CLASSES.dot}[${this.#activeDataAttr}]`)?.removeAttribute(this.#activeDataAttr);
        this.#paginationContainer?.querySelector(`.${CSS_CLASSES.dot}[${DATA.attrs.slide}="${this.#currentPage}"]`)?.toggleAttribute(this.#activeDataAttr, true);
    }
}
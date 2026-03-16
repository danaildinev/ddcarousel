import { CSS_CLASSES } from "../constants/css-classes";
import { EVENTS } from "../constants/events-list";
import { BaseModule } from "../core/base-module";
import type { Config } from "../core/config";
import type { Events } from "../core/events";
import { ModuleName } from "../core/module-names";
import type { CarouselStatus } from "../types/carousel.types";
import type { CarouselEvents } from "../types/event.types";
import { error } from "../utils/error-handler";

export default class Nav extends BaseModule {
    name: ModuleName = ModuleName.Nav;

    #container!: HTMLDivElement;
    #navContainer!: HTMLDivElement;
    #currentPage: number;
    #totalPages: number;

    #inactiveClass = "inactive";

    constructor(config: Config, events: Events, status: CarouselStatus) {
        super(config, events, status);

        this.#currentPage = this.status.currentPage;
        this.#totalPages = this.status.totalPages;

        const containerDiv = document.querySelector<HTMLDivElement>(`${this.config.container}`);
        if (containerDiv === null)
            throw error("Module won't initialize! Stage DOM was not found!");

        this.#container = containerDiv;

        this.events.on(EVENTS.PAGE_CHANGE, this.#onChangePage);

        this.events.emit(EVENTS.MODULE_INITIALIZED);
    }

    get loadCondition() {
        return this.config.nav;
    }

    init() {
        //this.#remove();

        if (this.status.totalPages == 0)
            return;

        const navItems = document.createElement("div"),
            leftBtn = document.createElement("button"),
            rightBtn = document.createElement("button");

        navItems.classList.add(CSS_CLASSES.nav);

        leftBtn.classList.add(CSS_CLASSES.prev);
        leftBtn.innerHTML = this.config.labelNavPrev;
        leftBtn.addEventListener("click", () => this.events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: this.#currentPage - 1 }));

        rightBtn.classList.add(CSS_CLASSES.next);
        rightBtn.innerHTML = this.config.labelNavNext;
        rightBtn.addEventListener("click", () => this.events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: this.#currentPage + 1 }));

        //add buttons in nav co ntainer
        navItems.appendChild(leftBtn);
        navItems.appendChild(rightBtn);
        this.#container.appendChild(navItems);

        const navContainer = this.#container.querySelector<HTMLDivElement>(`.${CSS_CLASSES.nav}`);
        if (navContainer == null)
            throw error("Nav container is not found!");

        this.#navContainer = navContainer;

        this.#refreshNav();

        this.events.emit(EVENTS.MODULE_LOADED);
    }

    destroy() {
        this.events.off(EVENTS.PAGE_CHANGE, this.#onChangePage);

        this.#remove();
        this.events.emit(EVENTS.MODULE_LOADED);
    }

    #remove() {
        if (this.#navContainer != null)
            this.#navContainer.remove();
    }

    #onChangePage = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGE]) => {
        if (!this.loadCondition)
            return;

        this.#currentPage = e.currentPage;
        this.#refreshNav();
    }

    #refreshNav() {
        if (this.#navContainer == null)
            return;

        const prev = this.#navContainer.querySelector(`.${CSS_CLASSES.prev}`);
        if (prev == null)
            throw error("Previous button is not found!");

        prev.classList.toggle(this.#inactiveClass, this.#currentPage === 0);

        const next = this.#navContainer.querySelector(`.${CSS_CLASSES.next}`);
        if (next == null)
            throw error("Next button is not found!");

        next.classList.toggle(this.#inactiveClass, this.#currentPage === this.#totalPages);
    }

    attachEvents() { }
    detachEvents() { }
}
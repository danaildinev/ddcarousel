import { CSS_CLASSES } from "../constants/css-classes";
import { EVENTS } from "../constants/events-list";
import { BaseModule } from "../core/base-module";
import type { CarouselEvents } from "../types/event.types";
import type { ModuleContext } from "../types/module.params";

export default class Nav extends BaseModule {
    id: string = "nav";

    static chevronSvg: string = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="chevron" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
        </svg>`;

    #currentPage: number;
    #totalPages: number;

    #prevBtn!: HTMLElement;
    #nextBtn!: HTMLElement;

    #inactiveClass = "inactive";

    constructor(params: ModuleContext) {
        super(params);

        const status = this.getStatus();
        this.#currentPage = status.currentPage;
        this.#totalPages = status.totalPages;

        this.events.on(EVENTS.PAGE_CHANGED, this.#onChangePaged);

        this.emitCreated();
    }

    get shouldInitialize() {
        return this.config.nav;
    }

    initialize() {
        //this.#remove();

        if (this.getStatus().totalPages == 0) {
            return;
        }

        const prevBtn = document.createElement("div"),
            nextBtn = document.createElement("div");

        prevBtn.classList.add(CSS_CLASSES.prev);
        prevBtn.innerHTML = this.config.labelNavPrev ?? this.config.navPrevContent;
        prevBtn.role = "button";
        prevBtn.addEventListener("click", () => this.events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: this.#currentPage - 1 }));

        nextBtn.classList.add(CSS_CLASSES.next);
        nextBtn.innerHTML = this.config.labelNavNext ?? this.config.navNextContent;
        nextBtn.role = "button";
        nextBtn.addEventListener("click", () => this.events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: this.#currentPage + 1 }));

        this.container.append(prevBtn, nextBtn);

        this.#prevBtn = prevBtn;
        this.#nextBtn = nextBtn;

        this.#refreshNav();

        this.emitInitialized();
    }

    destroy() {
        this.events.off(EVENTS.PAGE_CHANGED, this.#onChangePaged);

        this.#prevBtn?.remove();
        this.#nextBtn?.remove();
        this.emitDestroyed();
    }

    #onChangePaged = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGED]) => {
        if (!this.shouldInitialize) {
            return;
        }

        this.#currentPage = e.currentPage;
        this.#refreshNav();
    }

    #refreshNav() {
        this.#prevBtn?.classList.toggle(this.#inactiveClass, this.#currentPage === 0);
        this.#nextBtn?.classList.toggle(this.#inactiveClass, this.#currentPage === this.#totalPages);
    }
}
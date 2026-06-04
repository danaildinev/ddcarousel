import { CSS_CLASSES } from "../constants/css-classes";
import { DATA } from "../constants/data-attrs";
import { EVENTS } from "../constants/events-list";
import { BaseModule } from "../core/base-module";
import type { Events } from "../core/events";
import type { CarouselConfig, CarouselStatus } from "../types/carousel.types";
import type { CarouselEvents } from "../types/event.types";
import type { ModuleContext } from "../types/module.params";
import { error } from "../utils/error-handler";

export type UrlNavItem = {
    slideId: number;
    href: string;
    title: string;
    domElement: HTMLElement;
}

export default class UrlNav extends BaseModule {
    id: string = "urlNav";

    #events: Events;
    #config: CarouselConfig;
    #status: CarouselStatus;

    #navItems!: UrlNavItem[];
    #urlNavContainer!: HTMLElement;

    constructor(params: ModuleContext) {
        super(params);

        this.#config = params.config;
        this.#events = params.events;
        this.#status = params.getStatus();

        this.emitCreated();
    }

    get shouldInitialize() {
        return this.#config.urlNav;
    }

    initialize() {
        this.#createNav();

        this.events.on(EVENTS.PAGE_CHANGED, this.#onPageChange);
        this.emitInitialized();
    }

    destroy() {
        this.#urlNavContainer?.remove();

        this.events.off(EVENTS.PAGE_CHANGED, this.#onPageChange);
        this.emitDestroyed();
    }

    #createNav() {
        this.#navItems = [];

        let list = document.createElement("ul");
        list.classList.add(CSS_CLASSES.urls);
        for (const slide of Object.values(this.#status.slides)) {
            const child = slide.firstChild as HTMLElement;
            if (!child) {
                return;
            }

            const slideId = child.dataset[DATA.dataset.id],
                slideTitle = child.dataset[DATA.dataset.title];

            if (slideId === undefined && slideTitle === undefined) {
                continue;
            }

            const item = document.createElement('li'),
                link = document.createElement('a'),
                id = Number(slide.dataset[DATA.dataset.slide]),
                href = "#" + slideId,
                title = slideTitle ?? "";
            console.log(slideId, id);

            link.href = href;
            link.textContent = title;

            // todo fix: This will not work properly when config items > 1. Then pages != slides and slide id's w match (this feature is based on latest v1.4.0)
            link.addEventListener("click", () => this.#events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: slide.dataset.slide, enableAnim: true }));

            item.appendChild(link);
            list.appendChild(item);

            this.#navItems.push({
                slideId: id,
                href: href,
                title: title,
                domElement: item
            });
        }

        let appendContainer = this.container;
        if (this.#config.urlNavContainer) {
            const container = document.querySelector<HTMLDivElement>(this.#config.urlNavContainer);
            if (container) {
                appendContainer = container;
            } else {
                console.warn(`Error appending url navigation: ${this.#config.urlNavContainer} not found!`);
            }
        }

        appendContainer.appendChild(list);
        this.#urlNavContainer = appendContainer;

        this.#updateActiveLink(this.getStatus().currentPage);
    }

    goToUrl(name: string, enableAnim = true) {
        const slide = this.container.querySelector<HTMLDivElement>(`.${CSS_CLASSES.item} [${DATA.attrs.id}="${name}"]`);
        if (slide == null) {
            throw error(`Slide ${name} was not found!`);
        }

        const parent = slide.parentElement;
        if (parent == null) {
            return;
        }

        const id = parent.dataset[DATA.dataset.slide];
        this.#events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: id, enableAnim })
    }

    #onPageChange = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGED]) => this.#updateActiveLink(e.currentPage);

    #updateActiveLink(currentPage: number) {
        for (const item of this.#navItems) {
            item.domElement.classList.toggle("active", item.slideId === currentPage);
        }
    }
}
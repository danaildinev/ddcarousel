import { CSS_CLASSES } from "../constants/css-classes";
import { DATA } from "../constants/data-attrs";
import { EVENTS } from "../constants/events-list";
import { BaseModule } from "../core/base-module";
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
    static readonly id = "urlNav";
    id: string = "urlNav";

    #navItems!: UrlNavItem[];
    #urlNavList!: HTMLElement;

    constructor(params: ModuleContext) {
        super(params);
    }

    initialize() {
        this.#createNav();
        this.events.on(EVENTS.PAGE_CHANGED, this.#onPageChange);
    }

    destroy() {
        this.#urlNavList?.remove();

        this.events.off(EVENTS.PAGE_CHANGED, this.#onPageChange);
    }

    #createNav() {
        this.#navItems = [];

        const list = document.createElement("ul");
        list.classList.add(CSS_CLASSES.urls);
        const slides = this.getStatus().slides;
        for (const slide of Object.values(slides)) {
            const child = slide.firstElementChild as HTMLElement;
            if (!child) {
                continue;
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

            link.href = href;
            link.textContent = title;

            // todo fix: This will not work properly when config items > 1. Then pages != slides and slide id's w match (this feature is based on latest v1.4.0)
            link.addEventListener("click", () => this.events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: slide.dataset.slide, enableAnim: true }));

            item.appendChild(link);
            list.appendChild(item);

            this.#navItems.push({
                slideId: id,
                href,
                title,
                domElement: item
            });
        }

        let appendContainer = this.container;
        if (this.config.urlNavContainer) {
            const container = document.querySelector<HTMLDivElement>(this.config.urlNavContainer);
            if (container) {
                appendContainer = container;
            } else {
                console.warn(`Error appending url navigation: ${this.config.urlNavContainer} not found!`);
            }
        }

        appendContainer.appendChild(list);
        this.#urlNavList = list;

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
        this.events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: id, enableAnim })
    }

    #onPageChange = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGED]) => this.#updateActiveLink(e.currentPage);

    #updateActiveLink(currentPage: number) {
        for (const item of this.#navItems) {
            item.domElement.classList.toggle("active", item.slideId === currentPage);
        }
    }
}
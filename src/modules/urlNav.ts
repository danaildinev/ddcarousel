import { CSS_CLASSES } from "../constants/css-classes";
import { DATA } from "../constants/data-attrs";
import { EVENTS } from "../constants/events-list";
import { BaseModule } from "../core/base-module";
import type { Events } from "../core/events";
import { ModuleName } from "../core/module-names";
import type { CarouselConfig, CarouselStatus } from "../types/carousel.types";
import type { ModuleLoaderParams } from "../types/module.params";
import { error } from "../utils/error-handler";

export default class UrlNav extends BaseModule {
    name: ModuleName = ModuleName.UrlNav;

    #events: Events;
    #config: CarouselConfig;
    #status: CarouselStatus;

    #container: HTMLDivElement;
    #urlNavContainer!: HTMLDivElement;

    constructor(params: ModuleLoaderParams) {
        super(params);

        this.#config = params.config.current;
        this.#events = params.events;
        this.#status = params.status;

        const container = document.querySelector<HTMLDivElement>(`${this.#config.container}`);
        if (container === null)
            throw error("Url nav module won't initialize! Stage DOM was not found!");
        this.#container = container;

        this.emitInitialized();
    }

    get loadCondition() {
        return this.#config.urlNav;
    }

    init() {
        //this.#remove();

        let urlNavItems = document.createElement("div"),
            list = document.createElement("ul");

        urlNavItems.classList.add(CSS_CLASSES.urls);
        for (const slide of Object.values(this.#status.slides)) {
            const child = slide.firstChild as HTMLElement;
            if (!child)
                return;

            const id = child.dataset[DATA.dataset.id],
                title = child.dataset[DATA.dataset.title];

            if (id === undefined && title === undefined)
                continue;

            const item = document.createElement('li'),
                link = document.createElement('a');

            link.href = "#" + id;
            link.textContent = title ?? "";

            // todo fix: This will not work properly when config items > 1. Then pages != slides and slide id's w match (this feature is based on latest v1.4.0)
            link.addEventListener("click", () => this.#events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: slide.dataset.slide, enableAnim: true }));

            item.appendChild(link);
            list.appendChild(item);
        }

        urlNavItems.appendChild(list);
        this.#container.appendChild(urlNavItems);

        const urlNavContainer = this.#container.querySelector<HTMLDivElement>(`.${CSS_CLASSES.urls}`);
        if (urlNavContainer == null)
            throw error("Url nav container is not found!");
        this.#urlNavContainer = urlNavContainer;

        this.emitLoaded();
    }

    destroy() {
        this.#remove();
        this.emitUnloaded();
    }

    goToUrl(name: string, enableAnim = true) {
        const slide = this.container.querySelector<HTMLDivElement>(`.${CSS_CLASSES.item} [${DATA.attrs.id}="${name}"]`);
        if (slide == null)
            throw error(`Slide ${name} was not found!`);

        const parent = slide.parentElement;
        if (parent == null)
            return;

        const id = parent.dataset[DATA.dataset.slide];
        this.#events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: id, enableAnim })
    }

    #remove() {
        if (this.#urlNavContainer != null)
            this.#urlNavContainer.remove();
    }
}
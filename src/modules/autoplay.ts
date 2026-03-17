import { EVENTS } from './../constants/events-list';
import { BaseModule } from "../core/base-module";
import { ModuleName } from "../core/module-names";
import { CSS_CLASSES } from "../constants/css-classes";
import { error } from "../utils/error-handler";
import type { ModuleLoaderParams } from "../types/module.params";
import type { CarouselEvents } from "../types/event.types";

export default class Autoplay extends BaseModule {
    name: ModuleName = ModuleName.Autoplay;

    #stage: HTMLDivElement;
    #progressBar?: HTMLDivElement | undefined;
    #autoPlay!: number | undefined;
    #currentPage: number;

    constructor(params: ModuleLoaderParams) {
        super(params);

        const stage = document.querySelector<HTMLDivElement>(`${this.config.container} .${CSS_CLASSES.stage}`);
        if (stage === null)
            throw error("Autoplay module won't initialize! Stage DOM was not found!");
        this.#stage = stage;

        this.#currentPage = this.status.currentPage;

        this.events.on(EVENTS.PAGE_CHANGE, this.#onChangePage);

        this.emitInitialized();
    }

    get loadCondition() {
        return this.config.autoplay;
    }

    init() {
        if (this.config.autoplayPauseOnTabHidden)
            document.addEventListener("visibilitychange", this.#stopOnTabHidden);

        this.#attachEvents();
        this.start();

        this.emitLoaded();
    }

    destroy() {
        document.removeEventListener("visibilitychange", this.#stopOnTabHidden);
        this.events.off(EVENTS.PAGE_CHANGE, this.#onChangePage);

        this.stop();
        this.#destroyProgressBar();
        this.#detachEvents();

        this.emitUnloaded();
    }

    #onChangePage = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGE]) => {

        if (!this.loadCondition)
            return;

        this.#currentPage = e.currentPage;
        if (this.#currentPage < this.status.totalPages)
            this.restart();
        else
            this.#toggleProgressBar(false);
    };

    #stopOnTabHidden = () => document.hidden ? this.stop() : this.start();

    start = () => {
        if (!this.config.autoplay)
            return;

        if (this.#currentPage == this.status.totalPages)
            return;

        if (this.#autoPlay !== undefined)
            return;

        this.#createProgressBar();
        this.#toggleProgressBar(true);
        this.#restartProgressBar();

        this.#autoPlay = setInterval(() => this.#handler(), this.config.autoplaySpeed);
    }

    #handler() {
        this.events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: "next" });
        this.#restartProgressBar();

        if (this.#currentPage == this.status.totalPages) {
            clearInterval(this.#autoPlay);
            this.#toggleProgressBar(false);
        }
    }

    stop = () => {
        if (this.#autoPlay == null)
            return;

        clearInterval(this.#autoPlay);
        this.#autoPlay = undefined;
        this.#toggleProgressBar(false);
    }

    restart() {
        this.stop();
        this.start();
    }

    #toggleProgressBar = (visible: boolean) => {
        const progress = this.#progressBar?.parentElement;
        progress?.classList.toggle("active", visible);
    };

    #restartProgressBar() {
        if (!this.#progressBar)
            return;

        this.#toggleProgressBar(true);

        const bar = this.#progressBar;
        bar.style.animation = "none";
        bar.offsetHeight; // force reflow
        bar.style.animation = "";
    }

    #attachEvents() {
        if (!this.config.autoplayPauseHover) {
            this.#detachEvents();
            return;
        }

        this.#stage.addEventListener("pointerenter", this.stop);
        this.#stage.addEventListener("pointerleave", this.start);
    }

    #detachEvents() {
        this.#stage.removeEventListener("pointerenter", this.stop);
        this.#stage.removeEventListener("pointerleave", this.start);
    }

    #createProgressBar() {
        if (!this.config.autoplayProgress || this.#progressBar)
            return;

        const progress = document.createElement("div"),
            progressBar = document.createElement("div");

        progress.classList.add(CSS_CLASSES.progress);
        progressBar.classList.add(CSS_CLASSES.progressBar);

        progress.appendChild(progressBar);
        this.container.appendChild(progress);

        this.#progressBar = progressBar;

        this.container.style.setProperty("--ddcarousel-autoplay-speed", `${this.config.autoplaySpeed}ms`);
    }

    #destroyProgressBar() {
        this.#progressBar?.parentElement?.remove();
        this.#progressBar = undefined;
    }
}
import { EVENTS } from './../constants/events-list';
import { BaseModule } from "../core/base-module";
import { CSS_CLASSES } from "../constants/css-classes";
import { error } from "../utils/error-handler";
import type { ModuleContext } from "../types/module.params";
import type { CarouselEvents } from "../types/event.types";

export type AutoplayConfig = {
    speed: number,
    pauseHover: boolean,
    progress: boolean,
    pauseOnTabHidden: boolean
}

export default class Autoplay extends BaseModule<AutoplayConfig> {
    id: string = "autoplay";
    moduleConfig: AutoplayConfig = {
        speed: 5000,
        pauseHover: false,
        progress: true,
        pauseOnTabHidden: true,
    };

    #stage: HTMLDivElement;
    #progressBar?: HTMLDivElement | undefined;
    #autoPlay!: number | undefined;
    #currentPage: number = -1;

    constructor(params: ModuleContext) {
        super(params);

        const stage = this.container.querySelector<HTMLDivElement>(`.${CSS_CLASSES.stage}`);
        if (stage === null) {
            throw error("Autoplay module won't initialize! Stage DOM was not found!");
        }

        this.#stage = stage;

        this.events.on(EVENTS.PAGE_CHANGED, this.#onChangePaged);
    }

    initialize() {
        if (this.getResolvedConfig("pauseOnTabHidden")) {
            document.addEventListener("visibilitychange", this.#stopOnTabHidden);
        }

        this.#currentPage = this.getStatus().currentPage;

        this.#attachEvents();
        this.start();
    }

    destroy() {
        document.removeEventListener("visibilitychange", this.#stopOnTabHidden);
        this.events.off(EVENTS.PAGE_CHANGED, this.#onChangePaged);

        this.stop();
        this.#destroyProgressBar();
        this.#detachEvents();
    }

    #onChangePaged = (e: CarouselEvents[typeof EVENTS.PAGE_CHANGED]) => {
        if (!this.shouldInitialize) {
            return;
        }

        this.#currentPage = e.currentPage;
        if (this.#currentPage < this.getStatus().totalPages) {
            this.start();
        }
        else {
            this.stop();
            this.#toggleProgressBar(false);
        }
    };

    #stopOnTabHidden = () => document.hidden ? this.stop() : this.start();

    start = () => {
        if (!this.shouldInitialize) {
            return;
        }

        if (this.#currentPage == this.getStatus().totalPages) {
            return;
        }

        if (this.#autoPlay !== undefined) {
            return;
        }

        this.#createProgressBar();
        this.#toggleProgressBar(true);
        this.#restartProgressBar();

        const speed = this.getResolvedConfig("speed");

        if (speed) {
            this.#autoPlay = setInterval(() => this.#handler(), speed);
            this.events.emit(EVENTS.MODULE_AUTOPLAY_STARTED);
        }
    }

    #handler() {
        this.events.emit(EVENTS.PAGE_CHANGE_REQUEST, { index: "next" });
        this.#restartProgressBar();

        if (this.#currentPage == this.getStatus().totalPages) {
            clearInterval(this.#autoPlay);
            this.#toggleProgressBar(false);
        }
    }

    stop = () => {
        if (this.#autoPlay == null) {
            return;
        }

        clearInterval(this.#autoPlay);
        this.#autoPlay = undefined;
        this.#toggleProgressBar(false);
        this.events.emit(EVENTS.MODULE_AUTOPLAY_STOPPED);
    }

    #toggleProgressBar = (visible: boolean) => {
        const progress = this.#progressBar?.parentElement;
        progress?.classList.toggle("active", visible);
    };

    #restartProgressBar() {
        if (!this.#progressBar) {
            return;
        }

        this.#toggleProgressBar(true);

        const bar = this.#progressBar;
        bar.style.animation = "none";
        bar.offsetHeight; // force reflow
        bar.style.animation = "";
    }

    #attachEvents() {
        if (!this.getResolvedConfig("pauseHover")) {
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
        if (!this.getResolvedConfig("progress") || this.#progressBar) {
            return;
        }

        const progress = document.createElement("div"),
            progressBar = document.createElement("div");

        progress.classList.add(CSS_CLASSES.progress);
        progressBar.classList.add(CSS_CLASSES.progressBar);

        progress.appendChild(progressBar);
        this.container.appendChild(progress);

        this.#progressBar = progressBar;

        this.container.style.setProperty("--ddcarousel-autoplay-speed", `${this.getResolvedConfig("speed")}ms`);
    }

    #destroyProgressBar() {
        this.#progressBar?.parentElement?.remove();
        this.#progressBar = undefined;
    }
}
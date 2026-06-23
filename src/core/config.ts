import { EVENTS, LEGACY_EVENT_MAP } from "../constants/events-list";
import Nav from "../modules/nav";
import { DragSnapMode, type CarouselConfig } from "../types/carousel.types";
import type { CarouselEvents } from "../types/event.types";
import type { Events } from "./events";

export class Config {
    #events: Events;

    #lastResponsiveBp: number | null = null;
    #responsiveLoaded: boolean = false;
    #moduleOverrides: Map<string, Partial<CarouselConfig>> = new Map();

    default: CarouselConfig;
    current: CarouselConfig;
    user: Partial<CarouselConfig>;
    //responsive: CarouselConfig | null;

    constructor(userConfig: Partial<CarouselConfig>, events: Events) {
        this.#events = events;

        this.default = this.#setDefaultConfig();
        this.user = userConfig === undefined ? structuredClone(this.default) : userConfig;
        this.current = structuredClone(this.default);
        //this.responsive = {} as CarouselConfig;

        this.updateSettings(this.user);
    }

    // todo idea: lazyPreloadSlides = items * 2
    #setDefaultConfig(): CarouselConfig {
        return {
            container: `.ddcarousel`,
            nav: false, // modules 
            navPrevContent: Nav.chevronSvg, // modules 
            navNextContent: Nav.chevronSvg, // modules 
            dots: null, // modules 
            pagination: true, // modules 
            autoHeight: true,
            fullWidth: true,
            startPage: 0,
            items: 1,
            itemPerPage: false,
            gap: 0,
            loop: false, // modules 
            vertical: false,
            verticalMaxContentWidth: false,
            urlNav: false, // modules 
            urlNavContainer: null, // modules 
            responsive: null,
            touchDrag: true, // modules  
            dragSnapMode: DragSnapMode.Swipe, // modules 
            mouseDrag: true, // modules 
            keyboardNavigation: false,
            centerSlide: false,
            touchSwipeThreshold: 60, // modules 
            touchMaxSlideDist: 500, // modules 
            resizeRefresh: 200,
            swipeSmooth: 0, // modules 
            slideChangeDuration: 0.5,
            labelNavPrev: null, // modules 
            labelNavNext: null, // modules 
        }
    }

    #rebuildConfig(config?: Partial<CarouselConfig>): CarouselConfig {
        // if an explicit config update is sent via API at runtime, merge it into baseline user configurations
        if (config !== undefined) {
            Object.assign(this.user, config);
        }

        // start fresh with defaults and apply user global overrides
        const nextCurrent = Object.assign(structuredClone(this.default), this.user);

        // responsive: apply active breakpoint if applicable
        if (this.#responsiveLoaded && this.#lastResponsiveBp !== null && this.user.responsive) {
            const activeBreakpointConfig = this.user.responsive[this.#lastResponsiveBp];
            if (activeBreakpointConfig) {
                Object.assign(nextCurrent, activeBreakpointConfig);
            }
        }

        // apply runtime module config overrides
        for (const [moduleId, override] of this.#moduleOverrides) {
            // skip overrides from disabled modules
            if (nextCurrent[moduleId as keyof CarouselConfig] === false) {
                continue;
            }

            Object.assign(nextCurrent, override);
        }

        // validations time (Notice we use this.current here, NOT a cached variable)
        if (this.current.items === 0) {
            this.current.itemPerPage = false;
        }

        if (this.current.dragSnapMode === DragSnapMode.Closest) {
            this.current.centerSlide = true;
        }

        if (this.current.vertical) {
            this.current.autoHeight = false;
        }

        this.#handleEvents(this.current);

        return nextCurrent;
    }

    #applyConfig(next: CarouselConfig, isInternalOverride = false, emitEvent = true) {
        const oldConfig = this.current;

        this.current = next;

        if (!emitEvent) {
            return;
        }

        const payload: CarouselEvents[typeof EVENTS.CONFIG_APPLIED] = {
            default: this.default,
            old: structuredClone(oldConfig),
            new: structuredClone(next),
            isInternalOverride
        };

        this.#events.emit(EVENTS.CONFIG_APPLIED, payload);
    }

    updateSettings(config?: Partial<CarouselConfig>, emit = true) {
        if (config) {
            Object.assign(this.user, config);
        }

        const next = this.#rebuildConfig();
        this.#applyConfig(next, false, emit);
    }

    #handleEvents(config: CarouselConfig) {
        //const targetConfig = config === undefined ? this.current : config;
        for (const [key, value] of Object.entries(config)) {
            if (typeof value !== "function") {
                continue;
            }

            const callback = value as (payload?: any) => void; //tricky but it worked ;d

            // new format: on:carousel:initialize
            if (key.startsWith("on:")) {
                const name = key.slice(3);
                this.#events.on(name, callback);
                continue;
            }

            // legacy format: onInitialize
            const mapped = LEGACY_EVENT_MAP[key];
            if (mapped) {
                this.#events.on(mapped, callback);
            }
        }
    }

    /**
     * Applies module-specific overrides silently without triggering CONFIG_APPLI event
     */
    setModuleOverride(moduleId: string, override?: Partial<CarouselConfig>, emit = false) {
        if (!override) {
            this.#moduleOverrides.delete(moduleId);
        } else {
            this.#moduleOverrides.set(moduleId, override);
        }

        const next = this.#rebuildConfig();

        // silent apply (no duplicated event
        this.#applyConfig(next, true, emit);
    }

    refreshResponsive = (width: number) => {
        if (this.user.responsive == null)
            return;

        const breakpoints = Object.keys(this.user.responsive).map(k => parseInt(k)).sort((a, b) => a - b); // smallest → largest

        let matched: number | null = null;

        // loop and find first matching breakpoint
        for (const breakpoint of breakpoints) {
            if (width < breakpoint) {
                matched = breakpoint;
                break;
            }
        }

        if (matched !== null) {
            if (!this.#responsiveLoaded || this.#lastResponsiveBp !== matched) {
                this.#responsiveLoaded = true;
                this.#lastResponsiveBp = matched;

                // еxplicitly pass undefined for config, and true to force the emit
                this.updateSettings(undefined, true);
            }
        }
        else if (this.#responsiveLoaded) {
            this.revertToUserSettings();
        }
    }

    revertToUserSettings = () => {
        this.#lastResponsiveBp = null;
        this.#responsiveLoaded = false;

        // let the config builder handle the fresh rebuild
        this.updateSettings(undefined, true);
    }

    reset() {
        this.default = this.#setDefaultConfig();
        this.user = structuredClone(this.default);
        this.current = structuredClone(this.default);
        this.#moduleOverrides.clear();
        this.#lastResponsiveBp = null;
        this.#responsiveLoaded = false;
    }
}
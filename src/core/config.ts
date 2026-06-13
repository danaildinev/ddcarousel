import { EVENTS, LEGACY_EVENT_MAP } from "../constants/events-list";
import Nav from "../modules/nav";
import { DragSnapMode, type CarouselConfig } from "../types/carousel.types";
import type { CarouselEvents } from "../types/event.types";
import type { Events } from "./events";

export class Config {
    #events: Events;

    #lastResponsiveBp: number | null = 0;
    #responsiveLoaded: boolean = false;
    #moduleOverrides: Map<string, Partial<CarouselConfig>> = new Map();

    default: CarouselConfig;
    current: CarouselConfig;
    user: CarouselConfig;
    //responsive: CarouselConfig | null;

    constructor(userConfig: CarouselConfig, events: Events) {
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

    updateSettings(config?: Partial<CarouselConfig>, emitEvent: boolean = true, isInternalOverride: boolean = false) {
        // if an explicit config update is sent via API at runtime, merge it into baseline user configurations
        if (config !== undefined && !isInternalOverride) {
            Object.assign(this.user, config);
        }

        const oldConfig = structuredClone(this.current);

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
        for (const [_, override] of this.#moduleOverrides) {
            Object.assign(nextCurrent, override);
        }

        // assign the completely rebuilt layout state back to the class
        this.current = nextCurrent;

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

        const targetConfig = config === undefined ? this.current : config;
        for (const [key, value] of Object.entries(targetConfig)) {
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

        const hasActiveOverrides = isInternalOverride || this.#moduleOverrides.size > 0;
        if (emitEvent) {
            const payload: CarouselEvents[typeof EVENTS.CONFIG_CHANGED] = {
                default: this.default,
                old: oldConfig, //structuredClone(oldConfig)
                new: structuredClone(this.current),
                isInternalOverride: hasActiveOverrides
            }
            this.#events.emit(EVENTS.CONFIG_CHANGED, payload);
        }
    }

    /**
     * Applies module-specific overrides silently without triggering CONFIG_CHANGED event
     */
    setModuleOverride(moduleId: string, override?: Partial<CarouselConfig>) {
        if (!override) {
            this.#moduleOverrides.delete(moduleId);
        } else {
            this.#moduleOverrides.set(moduleId, override);
        }

        this.updateSettings(undefined, true, true);
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
                this.updateSettings();
            }
        }
        else if (this.#responsiveLoaded) {
            this.revertToUserSettings();
        }
    }

    revertToUserSettings = () => {
        this.#lastResponsiveBp = 0;
        this.#responsiveLoaded = false;
        Object.assign(this.current, this.user); //this.updateSettings(this.user);?
        this.updateSettings(undefined, true);
    }

    reset() {
        this.default = this.#setDefaultConfig();
        this.user = structuredClone(this.default);
        this.current = structuredClone(this.default);
        this.#moduleOverrides.clear();
        this.#lastResponsiveBp = 0;
        this.#responsiveLoaded = false;
    }
}
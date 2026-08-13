import { EVENTS, LEGACY_EVENT_MAP } from "../constants/events-list";
import Nav from "../modules/nav";
import { DragSnapMode, type CarouselConfig } from "../types/carousel.types";
import type { CarouselEvents } from "../types/event.types";
import type { Events } from "./events";

type ConfigEventHandler = {
    event: string;
    callback: (payload?: any) => void
}

export class Config {
    #events: Events;

    #lastResponsiveBp: number | null = null;
    #moduleOverrides: Map<string, Partial<CarouselConfig>> = new Map();
    #configEvents: ConfigEventHandler[] = [];

    default: CarouselConfig;
    current: CarouselConfig;
    user: Partial<CarouselConfig>;
    //responsive: CarouselConfig | null;

    constructor(events: Events, userConfig?: Partial<CarouselConfig>) {
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
            resizeDebounce: 200,
            swipeSmooth: 0, // modules 
            slideChangeDuration: 0.5,
            labelNavPrev: null, // modules 
            labelNavNext: null, // modules 
        }
    }

    #rebuildConfig(): CarouselConfig {
        // start fresh with defaults and apply user global overrides
        const next = Object.assign(structuredClone(this.default), this.user);

        // responsive: apply active breakpoint if applicable
        if (this.#lastResponsiveBp !== null && this.user.responsive) {
            const activeBreakpointConfig = this.user.responsive[this.#lastResponsiveBp];
            if (activeBreakpointConfig) {
                Object.assign(next, activeBreakpointConfig);
            }
        }

        // apply runtime module config overrides
        for (const [moduleId, override] of this.#moduleOverrides) {
            // skip overrides from disabled modules
            if (next[moduleId as keyof CarouselConfig] === false) {
                continue;
            }

            Object.assign(next, override);
        }

        if (next.items < 1) {
            next.itemPerPage = false;
            next.items = this.default.items;
        }

        if (next.dragSnapMode === DragSnapMode.Closest) {
            next.centerSlide = true;
        }

        if (next.vertical) {
            next.autoHeight = false;
        }

        return next;
    }

    #applyConfig(next: CarouselConfig, isInternalOverride = false, emitEvent = true) {
        const oldConfig = this.current;

        this.current = next;

        this.#handleEvents(this.current, this.#lastResponsiveBp ?? undefined);

        if (!emitEvent) {
            return;
        }

        const payload: CarouselEvents[typeof EVENTS.CONFIG_APPLIED] = {
            default: this.default,
            old: this.#safeClone(oldConfig),
            new: this.#safeClone(next),
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

    #clearConfigEvents() {
        for (const handler of this.#configEvents) {
            this.#events.off(handler.event, handler.callback);
        }

        this.#configEvents = [];
    }

    #handleEvents(config: CarouselConfig, breakpoint?: number) {
        this.#clearConfigEvents();

        //const targetConfig = config === undefined ? this.current : config;
        for (const [key, value] of Object.entries(config)) {
            if (typeof value !== "function") {
                continue;
            }

            const callback = value as (payload?: any) => void; //tricky but it worked ;d

            let event: string | undefined;

            if (key.startsWith("on:")) {
                event = key.slice(3);
            } else {
                event = LEGACY_EVENT_MAP[key];
            }

            if (!event) {
                continue;
            }

            this.#events.on(event, callback);
            this.#configEvents.push({ event, callback });
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
        const responsive = this.user.responsive;

        if (!responsive) {
            return;
        }

        const matched = Object.keys(responsive)
            .map(Number)
            .sort((a, b) => a - b)
            .find(breakpoint => width < breakpoint) ?? null;

        if (matched === this.#lastResponsiveBp) {
            return;
        }

        this.#lastResponsiveBp = matched;

        this.updateSettings(undefined, true);
    };

    reset() {
        this.default = this.#setDefaultConfig();
        this.user = structuredClone(this.default);
        this.current = structuredClone(this.default);
        this.#moduleOverrides.clear();
        this.#lastResponsiveBp = null;
    }

    #safeClone<T>(obj: T): T {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(this.#safeClone) as unknown as T;
        }

        const cloned = {} as Record<string, any>;
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key as keyof T];

                // drop any functions - they must be handled with #handleEvents()
                if (typeof value === 'function') {
                    continue;
                }

                // safely pass DOM node references without cloning (if your config uses them)
                if (value instanceof Element) {
                    cloned[key] = value;
                    continue;
                }

                // clone everything else
                cloned[key] = this.#safeClone(value);
            }
        }
        return cloned as T;
    }
}

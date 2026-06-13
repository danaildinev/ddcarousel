import { EVENTS } from "../constants/events-list";
import type { CarouselConfig, CarouselStatus } from "../types/carousel.types";
import type { CarouselEvents } from "../types/event.types";
import type { ModuleContext } from "../types/module.params";
import type { PageChangePayload } from "../types/pageChangeIndexPayload";
import type { Config } from "./config";
import type { Events } from "./events";
import type { Module } from "./module";

export abstract class BaseModule<TConfig = Record<string, any>> implements Module {
    abstract id: string;

    protected config: CarouselConfig;
    protected configClass: Config;
    protected events: Events;
    protected getStatus: () => CarouselStatus;
    protected container: HTMLDivElement;
    protected moduleConfig?: TConfig;
    protected configOverride?: Partial<CarouselConfig>;

    private moduleConfigKeyMap?: Map<keyof TConfig, string>;

    isInitialized: boolean = false;

    constructor(context: ModuleContext) {
        this.config = context.config;
        this.configClass = context.configClass;
        this.events = context.events;
        this.getStatus = context.getStatus;
        this.container = context.container;

        this.events.on(EVENTS.CONFIG_CHANGED, this.#onConfigChanged);
    }

    get shouldInitialize() {
        const current = this.config as Record<string, unknown>;

        if (current[this.id] === undefined) {
            return true;
        }

        return Boolean(current[this.id]);
    }

    abstract initialize(): void;
    abstract destroy(): void;

    initializeLifecycle() {
        if (this.isInitialized) {
            return;
        }

        this.moduleConfigKeyMap = this.getModuleConfigKeys();

        if (this.configOverride) {
            this.configClass.setModuleOverride(this.id, this.configOverride);
        }

        this.initialize();
        this.isInitialized = true;
        this.emitInitialized();
    }

    destroyLifecycle() {
        if (!this.isInitialized) {
            return;
        }

        this.destroy();

        if (this.configOverride) {
            this.configClass.setModuleOverride(this.id, undefined);
        }

        this.isInitialized = false;
        this.emitDestroyed();
    }

    /**
     * Creates and caches a map of module config keys to their prefixed runtime keys.
     * Used for resolving runtime overrides from global config.
     */
    protected getModuleConfigKeys(): Map<keyof TConfig, string> {
        if (this.moduleConfigKeyMap) {
            return this.moduleConfigKeyMap;
        }

        const config = this.moduleConfig ?? {};

        this.moduleConfigKeyMap = new Map(
            Object.keys(config).map((key) => {
                const typedKey = key as keyof TConfig;
                const prefixed = `${this.id}${key.charAt(0).toUpperCase()}${key.slice(1)}`;
                return [typedKey, prefixed];
            })
        );

        return this.moduleConfigKeyMap;
    }

    /**
     * Builds a runtime config key for a module property by prefixing it with the module id 
     * and capitalize the first letter of the property.
     * Example: module with id "autoplay" -> property: "speed" -> result: "autoplaySpeed"
     */
    protected buildConfigKey(property: string): string {
        return `${this.id}${property.charAt(0).toUpperCase()}${property.slice(1)}`;
    }

    /**
     * Try to resolve a module config value by checking for a user-provided override in the global config first, 
     * and falling back to the module's default config if no user override exists.
     */
    getResolvedConfig<K extends keyof TConfig>(property: K): TConfig[K] | null {
        if (!this.moduleConfig) {
            return null;
        }

        const current = this.config as Record<string, unknown>;
        const map = this.getModuleConfigKeys();
        const prefixedKey = map.get(property);

        if (prefixedKey && prefixedKey in current) {
            return current[prefixedKey] as TConfig[K];
        }

        return this.moduleConfig[property];
    }

    #onConfigChanged = (e: CarouselEvents[typeof EVENTS.CONFIG_CHANGED]) => {
        this.config = this.configClass.current; // sync local reference with latest global current config

        if (e?.isInternalOverride) {
            return;
        }

        if (this.shouldInitialize) {
            this.initializeLifecycle();
        } else {
            this.destroyLifecycle();
        }
    }

    tryOverridePriority(payload: PageChangePayload, prio: number): boolean {
        const moduleName = this.id;

        if (payload.priority === prio) {
            console.warn(`Module "${moduleName}" tried to use priority ${prio}, but it is already claimed by "${payload.source}". Override ignored!`);
            return false;
        }

        // override if current payload priority is lower
        if (payload.priority < prio) {
            payload.priority = prio;
            payload.source = moduleName;
            payload.handled = true;
            return true;
        }

        return false;
    }


    protected emitInitialized() {
        this.events.emit(EVENTS.MODULE_INITIALIZED, {
            name: this.id
        });
    }

    protected emitDestroyed() {
        this.events.emit(EVENTS.MODULE_DESTROYED, {
            name: this.id
        });
    }
}
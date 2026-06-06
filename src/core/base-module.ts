import { EVENTS } from "../constants/events-list";
import type { CarouselConfig, CarouselStatus } from "../types/carousel.types";
import type { ModuleContext } from "../types/module.params";
import type { PageChangePayload } from "../types/pageChangeIndexPayload";
import type { Events } from "./events";
import type { Module } from "./module";

export abstract class BaseModule implements Module {
    abstract id: string;

    protected config: CarouselConfig;
    protected events: Events;
    protected getStatus: () => CarouselStatus;
    protected container: HTMLDivElement;

    isInitialized: boolean = false;

    constructor(context: ModuleContext) {
        this.config = context.config;
        this.events = context.events;
        this.getStatus = context.getStatus;
        this.container = context.container;
    }

    get shouldInitialize() {
        return this.config.modules.includes(this.id);
    }

    abstract initialize(): void;
    abstract destroy(): void;

    initializeLifecycle() {
        this.initialize();
        this.emitInitialized();
    }

    destroyLifecycle() {
        this.destroy();
        this.emitDestroyed();
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
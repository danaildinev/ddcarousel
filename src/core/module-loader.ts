import { EVENTS } from "../constants/events-list";
import type { CarouselConfig, CarouselModuleMap, ModuleId } from "../types/carousel.types";
import type { CarouselEvents } from "../types/event.types";
import type { ModuleContext } from "../types/module.params";
import type { BaseModule } from "./base-module";
import type { Events } from "./events";
import { INTERNAL_MODULES, type InternalModule } from "./internal-modules";

export default class ModuleLoader {
    #instances = new Map<string, BaseModule>();
    #params: ModuleContext;
    #events: Events;

    #initialized = false;

    constructor(params: ModuleContext) {
        this.#params = params;
        this.#events = this.#params.events;

        this.#events.on(EVENTS.CONFIG_APPLIED, this.syncModules);
    }

    get modules(): BaseModule[] {
        return [...this.#instances.values()];
    }

    async loadAll(modules?: readonly ModuleId[]) {
        if (!modules?.length) {
            const config = this.#params.config as Record<string, unknown>;
            modules = INTERNAL_MODULES.filter(moduleId => config[moduleId] === true);
        }

        const uniqueModules = [...new Set(modules)];
        await Promise.all(uniqueModules.map(moduleId => this.load(moduleId)));
    }

    async load<K extends ModuleId>(moduleId: K): Promise<CarouselModuleMap[K] | null> {
        const module = this.#instances.get(moduleId);
        if (module) {
            return module as CarouselModuleMap[K];
        }

        if (!INTERNAL_MODULES.includes(moduleId as InternalModule)) {
            console.warn(`Unknown module "${moduleId}"!`);
            return null;
        }

        const mod = await import(
            /* webpackChunkName: "ddcarousel-[request]" */
            `../modules/${moduleId}`);
        const ModuleClass = mod.default;

        const instance: BaseModule = new ModuleClass(this.#params);
        this.#instances.set(moduleId, instance);

        this.#events.emit(EVENTS.MODULE_LOADED, { name: moduleId });

        return instance as CarouselModuleMap[K];
    }

    async loadAndInitialize<K extends ModuleId>(moduleId: K): Promise<CarouselModuleMap[K] | null> {
        const module = await this.load(moduleId);
        if (module) {
            module.initializeLifecycle();
        }

        return module;
    }

    initAll() {
        for (const [moduleId, instance] of this.#instances) {
            if (!this.#isModuleEnabled(moduleId)) {
                continue;
            }

            instance.initializeLifecycle();
        }

        this.#initialized = true;
    }

    #isModuleEnabled(moduleId: string): boolean {
        const current = this.#params.config as Record<string, unknown>;
        const status = current[moduleId];

        if (status === undefined) {
            return false;
        }

        return Boolean(status);
    }

    async unload(moduleId: string) {
        const instance = this.#instances.get(moduleId);
        if (!instance) {
            return;
        }

        instance.destroyLifecycle();

        this.#instances.delete(moduleId);

        this.#events.emit(EVENTS.MODULE_UNLOADED, {
            name: moduleId
        });
    }

    syncModules = (e: CarouselEvents[typeof EVENTS.CONFIG_APPLIED]) => {
        const newConfig = e.new;
        const oldConfig = e.old;
        const defaultConfig = e.default;

        for (const moduleId of INTERNAL_MODULES) {
            const key = moduleId as keyof CarouselConfig;

            const oldValue = oldConfig?.[key] ?? defaultConfig?.[key] ?? false;
            const newValue = newConfig?.[key] ?? defaultConfig?.[key] ?? false;

            if (oldValue === newValue) {
                continue;
            }

            const instance = this.#instances.get(moduleId);

            if (!instance) {
                if (newValue) {
                    if (this.#initialized) {
                        void this.loadAndInitialize(moduleId);
                    } else {
                        void this.load(moduleId);
                    }
                }
                continue;
            }

            if (newValue) {
                instance.initializeLifecycle();
            } else {
                instance.destroyLifecycle();
            }
        }
    };

    reset() {
        for (const module of this.#instances.keys()) {
            this.unload(module)
        }

        this.#instances.clear();
        this.#initialized = false;
    };
}
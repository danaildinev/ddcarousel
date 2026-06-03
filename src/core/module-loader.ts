import type { EVENTS } from "../constants/events-list";
import type { CarouselConfig } from "../types/carousel.types";
import type { CarouselEvents } from "../types/event.types";
import type { ModuleLoaderParams } from "../types/module.params";
import type { BaseModule } from "./base-module";
import { MODULE_IDS, type ModuleId } from "./module-registry";

export default class ModuleLoader {
    #instances = new Map<ModuleId, BaseModule>();
    #params: ModuleLoaderParams;

    constructor(params: ModuleLoaderParams) {
        this.#params = params;
    }

    get modules(): BaseModule[] {
        return [...this.#instances.values()];
    }

    async loadAll() {
        await Promise.all(
            MODULE_IDS.map(m => this.load(m))
        );
    }

    async load(moduleId: ModuleId) {
        if (this.#instances.has(moduleId)) {
            return;
        }

        const mod = await import(`../modules/${moduleId}`);
        const ModuleClass = mod.default;

        const instance: BaseModule = new ModuleClass(this.#params);
        this.#instances.set(moduleId, instance);

        instance.toggle();
    }

    async unload(moduleId: ModuleId) {
        const instance = this.#instances.get(moduleId);
        if (!instance) {
            return;
        }

        instance.destroy();

        this.#instances.delete(moduleId);
    }

    toggleAll = (e: CarouselEvents[typeof EVENTS.CONFIG_CHANGED]) => {
        const old = e.old;
        if (old) {
            for (const key of Object.keys(e.new) as (keyof CarouselConfig)[]) {
                // react only if the value actually changed, else get the default value
                const oldValue = e.old?.[key] ?? e.default[key];
                const resolvedNewValue = e.new[key] ?? e.default[key];

                if (oldValue === resolvedNewValue) {
                    continue;
                }

                const module = this.modules.find(m => m.id === key);
                if (module === undefined) {
                    continue;
                }

                if (resolvedNewValue === false) {
                    module?.destroy();
                } else {
                    module?.toggle();
                }
            }
        }

        this.modules.forEach(m => m.toggle());
    };

    reset() {
        for (const module of this.#instances.values()) {
            module.destroy();
        }

        this.#instances.clear();
    };
}
import type { EVENTS } from "../constants/events-list";
import type { CarouselConfig } from "../types/carousel.types";
import type { CarouselEvents } from "../types/event.types";
import type { ModuleLoaderParams } from "../types/module.params";
import type { BaseModule } from "./base-module";
import { ModuleName } from "./module-names";

export default class ModuleLoader {
    #instances = new Map<ModuleName, BaseModule>();
    #params: ModuleLoaderParams;

    constructor(params: ModuleLoaderParams) {
        this.#params = params;
    }

    get modules(): BaseModule[] {
        return [...this.#instances.values()];
    }

    async loadAll() {
        Object.values(ModuleName).forEach(async m => {
            await this.load(m);
        });
    }

    async load(moduleName: ModuleName) {
        if (this.#instances.has(moduleName))
            return;

        const mod = await import(`../modules/${moduleName}`);
        const ModuleClass = mod.default;

        const instance: BaseModule = new ModuleClass(this.#params);
        instance.toggle();

        this.#instances.set(moduleName, instance);
    }

    async unload(moduleName: ModuleName) {
        const instance = this.#instances.get(moduleName);
        if (!instance)
            return;

        instance.destroy();

        this.#instances.delete(moduleName);
    }

    toggleAll = (e: CarouselEvents[typeof EVENTS.CONFIG_CHANGED]) => {
        const old = e.old;
        if (old) {
            for (const key of Object.keys(e.new) as (keyof CarouselConfig)[]) {
                // react only if the value actually changed, else get the default value
                const oldValue = e.old?.[key] ?? e.default[key];
                const resolvedNewValue = e.new[key] ?? e.default[key];

                if (oldValue === resolvedNewValue)
                    continue;

                const module = this.modules.find(m => m.name === key);
                if (module === undefined)
                    continue;

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
        this.#instances.forEach((module: BaseModule) => module.destroy());
        this.#instances.clear();
    };
}
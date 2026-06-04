import { EVENTS } from "../constants/events-list";
import type { CarouselEvents } from "../types/event.types";
import type { ModuleContext } from "../types/module.params";
import type { BaseModule } from "./base-module";

export default class ModuleLoader {
    #instances = new Map<string, BaseModule>();
    #params: ModuleContext;

    constructor(params: ModuleContext) {
        this.#params = params;

        this.#params.events.on(EVENTS.CONFIG_CHANGED, this.syncModules);
    }

    get modules(): BaseModule[] {
        return [...this.#instances.values()];
    }

    async loadAll(modules?: readonly string[]) {
        if (!modules?.length) {
            return;
        }

        const uniqueModules = [...new Set(modules)];
        await Promise.all(
            uniqueModules.map(m => this.load(m)));
    }

    async load(moduleId: string) {
        if (this.#instances.has(moduleId)) {
            return;
        }

        const mod = await import(`../modules/${moduleId}`);
        const ModuleClass = mod.default;

        const instance: BaseModule = new ModuleClass(this.#params);
        this.#instances.set(moduleId, instance);

        const isEnabled = this.#isModuleEnabled(moduleId);

        if (isEnabled) {
            instance.initialize();
        }
    }

    #isModuleEnabled(moduleId: string): boolean {
        return this.#params.config.modules.indexOf(moduleId) > -1;
    }

    async unload(moduleId: string) {
        const instance = this.#instances.get(moduleId);
        if (!instance) {
            return;
        }

        instance.destroy();

        this.#instances.delete(moduleId);
    }

    syncModules = (e: CarouselEvents[typeof EVENTS.CONFIG_CHANGED]) => {
        const newConfig = e.new;
        //const oldConfig = e.old ?? {};
        const currentModules = e.old.modules;
        const newModules = e.new.modules;

        for (const key in currentModules) {
            const moduleId = currentModules[key] as string;
            if (newModules !== undefined && newModules.includes(moduleId)) {
                continue;
            }

            const instance = this.#instances.get(moduleId);
            if (instance) {
                void this.unload(moduleId);
            }
        }

        for (const key in newModules) {
            const moduleId = newModules[key] as string;
            const exists = Object.values(newConfig.modules).includes(moduleId);

            const instance = this.#instances.get(moduleId);

            if (!instance) {
                if (exists) {
                    void this.load(moduleId);
                } else {
                    void this.unload(moduleId);
                }
                continue;
            }

            if (exists) {
                instance.initialize();
                instance.isInitialized = true;
            } else {
                instance.destroy();
                instance.isInitialized = false;
            }
        }
    };

    reset() {
        for (const module of this.#instances.values()) {
            module.destroy();
        }

        this.#instances.clear();
    };
}
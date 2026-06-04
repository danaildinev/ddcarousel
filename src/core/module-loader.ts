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
        const defaultConfig = e.default;

        for (const moduleId of MODULE_IDS) {
            //const oldValue = oldConfig.modules?.[moduleId] ?? defaultConfig.modules?.[moduleId] ?? false;
            const newValue = newConfig.modules?.[moduleId] ?? defaultConfig.modules?.[moduleId] ?? false;

            // if (oldValue === newValue) {
            //     continue;
            // }

            const instance = this.#instances.get(moduleId);

            if (!instance) {
                if (newValue) {
                    void this.load(moduleId);
                }
                continue;
            }

            if (newValue) {
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
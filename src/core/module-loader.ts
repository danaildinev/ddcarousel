import { EVENTS } from "../constants/events-list";
import type { CarouselEvents } from "../types/event.types";
import type { ModuleContext } from "../types/module.params";
import type { BaseModule } from "./base-module";
import { MODULE_IDS, type ModuleId } from "./module-registry";

export default class ModuleLoader {
    #instances = new Map<ModuleId, BaseModule>();
    #params: ModuleContext;

    constructor(params: ModuleContext) {
        this.#params = params;

        this.#params.events.on(EVENTS.CONFIG_CHANGED, this.syncModules);
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

        const isEnabled = this.#isModuleEnabled(moduleId);

        if (isEnabled) {
            instance.initialize();
        }
    }

    #isModuleEnabled(moduleId: ModuleId): boolean {
        const moduleStatus = this.#params.config.modules?.[moduleId];
        return Boolean(moduleStatus) ?? false;
    }

    async unload(moduleId: ModuleId) {
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
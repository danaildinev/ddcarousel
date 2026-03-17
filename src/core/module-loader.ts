import type { ModuleLoaderParams } from "../types/module.params";
import type { BaseModule } from "./base-module";
import { ModuleName } from "./module-names";

export default class ModuleLoader {
    #instances = new Map<ModuleName, BaseModule>();
    #params: ModuleLoaderParams;

    constructor(params: ModuleLoaderParams) {
        this.#params = params;
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

    reset() {
        this.#instances.forEach((module: BaseModule) => module.destroy());
        this.#instances.clear();
    };
}
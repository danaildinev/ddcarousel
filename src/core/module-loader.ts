import type { CarouselStatus } from "../types/carousel.types";
import type { BaseModule } from "./base-module";
import type { Config } from "./config";
import type { Events } from "./events";
import { ModuleName } from "./module-names";

export default class ModuleLoader {
    #instances = new Map<ModuleName, BaseModule>();
    #config: Config;
    #events: Events;
    #status: CarouselStatus;

    constructor(config: Config, events: Events, status: CarouselStatus) {
        this.#config = config;
        this.#events = events;
        this.#status = status;
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

        const instance: BaseModule = new ModuleClass(this.#config, this.#events, this.#status);

        instance.init();

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
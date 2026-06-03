import type { ModuleId } from './module-registry';

export interface Module {
    readonly id: ModuleId;

    initialize(): void;
    destroy(): void;
}
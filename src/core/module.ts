import type { ModuleName } from './module-names';

export interface Module {
    readonly name: ModuleName;

    initialize(): void;
    destroy(): void;
}
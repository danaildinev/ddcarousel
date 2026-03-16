import type { ModuleName } from './module-names';

export interface Module {
    readonly name: ModuleName;

    init(): void;
    destroy(): void;
}
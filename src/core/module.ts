export interface Module {
    readonly id: string;

    initialize(): void;
    destroy(): void;
}
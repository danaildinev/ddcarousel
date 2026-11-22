
/**
 * Defines the basic module structure and lifecycle methods
 *
 * @public
 */
export interface Module {
    readonly id: string;

    initialize(): void;
    destroy(): void;
}
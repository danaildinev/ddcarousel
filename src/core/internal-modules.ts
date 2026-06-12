export const INTERNAL_MODULES = [
    "autoplay",
    "lazyLoad",
    "loop",
    "nav",
    "pagination",
    "urlNav",
] as const;

export type InternalModule = typeof INTERNAL_MODULES[number];
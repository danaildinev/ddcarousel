export const INTERNAL_MODULES = [
    "autoplay",
    "lazyLoad",
    "loop",
    "nav",
    "pagination",
    "urlNav",
    "mouseWheel"
] as const;

export type InternalModule = typeof INTERNAL_MODULES[number];
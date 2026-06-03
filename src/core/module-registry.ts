export const MODULE_IDS = [
    "autoplay",
    "pagination",
    "drag",
    "lazyLoad",
    "loop",
    "nav",
    "urlNav",
] as const;

export type ModuleId = typeof MODULE_IDS[number];
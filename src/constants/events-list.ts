import type { CarouselEvents } from "../types/event.types";

/**
 * Carousel events list
 *
 * @public
 */
export const EVENTS = {
    // lifecycle
    INITIALIZE: 'carousel:initialize',
    INITIALIZED: 'carousel:initialized',
    DESTROY: 'carousel:destroy',
    DESTROYED: 'carousel:destroyed',

    //modules
    MODULE_LOADED: 'module:loaded',
    MODULE_INITIALIZED: 'module:initialized',
    MODULE_DESTROYED: 'module:destroyed',
    MODULE_UNLOADED: 'module:unloaded',

    // stage
    CONFIG_APPLIED: 'config:applied',
    STAGE_CREATED: 'stage:created',
    STAGE_CHANGED: 'stage:changed',
    STAGE_RESIZED: 'stage:resized',
    PAGE_CHANGE_REQUEST: 'page:change:request',
    PAGE_CHANGED: 'page:changed',
    PAGE_CHANGE_INDEX: 'page:changed:index',
    PAGE_CHANGE_SCROLL_BEFORE: 'page:change:scroll:before',
    PAGE_CHANGE_SCROLL_AFTER: 'page:change:scroll:after',
    SLIDE_SCROLL: 'slide:scroll',

    // user interaction
    DRAG_PRE_START: 'drag:start:pre',
    DRAG_START: 'drag:start',
    DRAG_DRAGGING: 'drag:dragging',
    DRAG_END: 'drag:end',
    TRANSITION_END: 'transition:end',
} as const;

/**
 * Carousel events to optional callbacks prefixed with "on:"
 *
 * @public
 */
export type CarouselOnEvents = {
    [K in keyof CarouselEvents as `on:${K & string}`]?: (payload: CarouselEvents[K]) => void;
};

/**
 * Maps legacy event names from v1 to their corresponding carousel events
 *
 * @public
 */
export const LEGACY_EVENT_MAP: Record<string, keyof CarouselEvents> = {
    /** @deprecated Use EVENTS.INITIALIZE instead. */
    onInitialize: EVENTS.INITIALIZE,
    /** @deprecated Use EVENTS.INITIALIZED instead. */
    onInitialized: EVENTS.INITIALIZED,
    /** @deprecated Use EVENTS.DRAG_START instead. */
    onDrag: EVENTS.DRAG_START,
    /** @deprecated Use EVENTS.DRAG_DRAGGING instead. */
    onDragging: EVENTS.DRAG_DRAGGING,
    /** @deprecated Use EVENTS.DRAG_END instead. */
    onDragged: EVENTS.DRAG_END,
    /** @deprecated Use EVENTS.TRANSITION_END instead. */
    onTransitionend: EVENTS.TRANSITION_END,
    /** @deprecated Use EVENTS.PAGE_CHANGED instead. */
    onChanged: EVENTS.PAGE_CHANGED,
    /** @deprecated Use EVENTS.STAGE_RESIZED instead. */
    onResized: EVENTS.STAGE_RESIZED,
    /** @deprecated Use EVENTS.DESTROY instead. */
    onDestroy: EVENTS.DESTROY,
    /** @deprecated Use EVENTS.DESTROYED instead. */
    onDestroyed: EVENTS.DESTROYED
};
export const EVENTS = {
    // lifecycle
    INITIALIZE: 'carousel:initalize',
    INITIALIZED: 'carousel:initalized',
    DESTROY: 'carousel:destroy',
    DESTROYED: 'carousel:destroyed',

    //modules
    MODULE_LOADED: 'module:loaded',
    MODULE_INITIALIZED: 'module:initialized',
    MODULE_DESTROYED: 'module:destroyed',
    MODULE_UNLOADED: 'module:unloaded',
    MODULE_AUTOPLAY_STARTED: 'module:autoplay:started',
    MODULE_AUTOPLAY_STOPPED: 'module:autoplay:stopped',

    // stage
    CONFIG_CHANGED: 'config:changed',
    STAGE_CREATED: 'stage:created',
    STAGE_CHANGED: 'stage:changed',
    STAGE_RESIZED: 'stage:resized',
    PAGE_CHANGE_REQUEST: 'page:change:request',
    PAGE_CHANGED: 'page:changed',
    PAGE_CHANGE_INDEX: 'page:changed:index',
    PAGE_CHANGE_SCROLL_BEFORE: 'page:change:scroll:before',
    PAGE_CHANGE_SCROLL_AFTER: 'page:change:scroll:after',
    SLIDE_SCROLL: 'slide:scroll',
    NORMALIZE_PAGE_MAP: 'page:normalize:map',

    // user interaction
    DRAG_PRE_START: 'drag:start:pre',
    DRAG_START: 'drag:start',
    DRAG_DRAGGING: 'drag:dragging',
    DRAG_END: 'drag:end',
    TRANSITION_END: 'transition:end',
} as const;

export const LEGACY_EVENT_MAP: Record<string, string> = {
    onInitialize: EVENTS.INITIALIZE,
    onInitialized: EVENTS.INITIALIZED,
    onDrag: EVENTS.DRAG_START,
    onDragging: EVENTS.DRAG_DRAGGING,
    onDragged: EVENTS.DRAG_END,
    onTransitionend: EVENTS.TRANSITION_END,
    onChanged: EVENTS.PAGE_CHANGED,
    onResized: EVENTS.STAGE_RESIZED,
    onDestroy: EVENTS.DESTROY,
    onDestroyed: EVENTS.DESTROYED
};

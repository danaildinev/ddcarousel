export const EVENTS = {
    // lifecycle
    INITIALIZE: 'carousel:initalize',
    INITIALIZED: 'carousel:initalized',
    DESTROY: 'carousel:destroy',
    DESTROYED: 'carousel:destroyed',

    //modules
    MODULE_CREATED: 'module:created',
    MODULE_INITIALIZED: 'module:initialized',
    MODULE_DESTROYED: 'module:destroyed',
    MODULE_AUTOPLAY_STARTED: 'module:autoplay:started',
    MODULE_AUTOPLAY_STOPPED: 'module:autoplay:stopped',

    // stage
    CONFIG_CHANGED: 'config:changed',
    STAGE_CREATED: 'stage:created',
    STAGE_RESIZED: 'stage:resized',
    PAGE_CHANGE_REQUEST: 'page:change:request',
    PAGE_CHANGE: 'page:change',

    // user interaction
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
    onChanged: EVENTS.PAGE_CHANGE,
    onResized: EVENTS.STAGE_RESIZED,
    onDestroy: EVENTS.DESTROY,
    onDestroyed: EVENTS.DESTROYED
};

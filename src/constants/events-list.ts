export const EVENTS = {
    // lifecycle
    INITIALIZE: 'carousel:initalize',
    INITIALIZED: 'carousel:initalized',
    DESTROY: 'carousel:destroy',
    DESTROYED: 'carousel:destroyed',

    // carousel 
    STAGE_CREATED: 'stage:created',
    STAGE_RESIZED: 'stage:resized',
    PAGE_CHANGE_REQUEST: 'page:change:request',
    PAGE_CHANGE: 'page:change',
    TRANSITION_END: 'transition:end',

    // user interaction
    DRAG_START: 'drag:start',
    DRAG_DRAGGING: 'drag:dragging',
    DRAG_END: 'drag:end',
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

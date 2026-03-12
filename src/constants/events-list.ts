export const EVENTS = {
    // lifecycle
    INITIALIZE: 'carousel:initalize',
    INITIALIZED: 'carousel:initalized',
    DESTROY: 'carousel:destroy',
    DESTROYED: 'carousel:destroyed',

    // carousel 
    STAGE_RESIZED: 'stage:resized',
    PAGE_CHANGE: 'page:change',
    TRANSITION_END: 'transition:end',

    // user interaction
    DRAG_START: 'drag:start',
    DRAG_DRAGGING: 'drag:dragging',
    DRAG_END: 'drag:end',
} as const;

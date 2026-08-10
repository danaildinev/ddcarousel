import type { EVENTS } from "../constants/events-list";
import type { CarouselConfig } from "./carousel.types";
import type { PageChangePayload as PageChangeIndexPayload } from "./pageChangeIndexPayload";

export type CarouselEvents = {
    [EVENTS.PAGE_CHANGE_REQUEST]: {
        index: number | string;
        animate?: boolean;
        emit?: boolean;
        force?: boolean;
    };

    [EVENTS.PAGE_CHANGED]: {
        currentPage: number;
        currentTranslate: number;
        slidesActive: number[];
    }

    [EVENTS.PAGE_CHANGE_SCROLL_BEFORE]: {
        currentPage: number;
        slidesCount: number;
        currentTranslate: number
        activeSlides: number[],
        isForward: boolean,
    }

    [EVENTS.PAGE_CHANGE_SCROLL_AFTER]: {
        currentPage: number;
        slidesCount: number;
        currentTranslate: number
        activeSlides: number[],
        isForward: boolean,
    }

    [EVENTS.PAGE_CHANGE_INDEX]: PageChangeIndexPayload

    [EVENTS.MODULE_LOADED]: {
        name: string
    };

    [EVENTS.MODULE_INITIALIZED]: {
        name: string
    };

    [EVENTS.MODULE_DESTROYED]: {
        name: string
    };

    [EVENTS.MODULE_UNLOADED]: {
        name: string
    };

    [EVENTS.CONFIG_APPLIED]: {
        default: CarouselConfig,
        old: CarouselConfig,
        new: CarouselConfig,
        isInternalOverride: boolean
    };

    [EVENTS.SLIDE_SCROLL]: {
        slide?: HTMLDivElement,
        animate: boolean;
        specifiedPosition: number;
    };

    [EVENTS.DRAG_PRE_START]: {
        currentTranslate: number;
    };

    [EVENTS.DRAG_DRAGGING]: {
        currentTranslate: number;
        delta: number;
        direction: "left" | "right";
        slideIndexLeft?: number | undefined;
        slideIndexCenter?: number | undefined;
        slideIndexRight?: number | undefined;
        rebase?: boolean;
    };

    [EVENTS.INITIALIZE]: void;
    [EVENTS.INITIALIZED]: void;
    [EVENTS.DESTROY]: void;
    [EVENTS.DESTROYED]: void;
    [EVENTS.MODULE_AUTOPLAY_STOPPED]: void;
    [EVENTS.MODULE_AUTOPLAY_STARTED]: void;
    [EVENTS.STAGE_CREATED]: void;
    [EVENTS.STAGE_RESIZED]: void;
    [EVENTS.STAGE_CHANGED]: void;
    [EVENTS.TRANSITION_END]: void;
    [EVENTS.DRAG_START]: void;
    [EVENTS.DRAG_END]: void;
}

export type LegacyCarouselEvents = {
    onInitialize: CarouselEvents[typeof EVENTS.INITIALIZE];
    onInitialized: CarouselEvents[typeof EVENTS.INITIALIZED];
    onDrag: CarouselEvents[typeof EVENTS.DRAG_START];
    onDragging: CarouselEvents[typeof EVENTS.DRAG_DRAGGING];
    onDragged: CarouselEvents[typeof EVENTS.DRAG_END];
    onTransitionend: CarouselEvents[typeof EVENTS.TRANSITION_END];
    onChanged: CarouselEvents[typeof EVENTS.PAGE_CHANGED];
    onResized: CarouselEvents[typeof EVENTS.STAGE_RESIZED];
    onDestroy: CarouselEvents[typeof EVENTS.DESTROY];
    onDestroyed: CarouselEvents[typeof EVENTS.DESTROYED];
};

export type CarouselEventName = keyof CarouselEvents | string;
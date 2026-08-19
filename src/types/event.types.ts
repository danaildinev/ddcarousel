import { EVENTS, LEGACY_EVENT_MAP } from "../constants/events-list";
import type { CarouselConfig } from "./carousel.types";
import type { PriorityPayload } from "./event-payload.types";

export type PageChangeScrollPayload = PriorityPayload & {
    currentPage: number;
    slidesCount: number;
    currentTranslate: number;
    visibleSlides: number[];
    isForward: boolean;
};

export type ModuleEventPayload = {
    name: string;
};

export type PageChangePayload = PriorityPayload & {
    request: number | string;
    page: number;
    currentPage: number;
    totalPages: number;
};

export type CarouselEvents = {
    [EVENTS.PAGE_CHANGE_REQUEST]: PriorityPayload & {
        index: number | string;
        animate?: boolean;
        emit?: boolean;
        force?: boolean;
    };

    [EVENTS.PAGE_CHANGED]: {
        currentPage: number;
        currentTranslate: number;
        visibleSlides: number[];
    };

    [EVENTS.PAGE_CHANGE_SCROLL_BEFORE]: PageChangeScrollPayload;
    [EVENTS.PAGE_CHANGE_SCROLL_AFTER]: PageChangeScrollPayload;
    [EVENTS.PAGE_CHANGE_INDEX]: PageChangePayload;
    [EVENTS.MODULE_LOADED]: ModuleEventPayload;
    [EVENTS.MODULE_INITIALIZED]: ModuleEventPayload;
    [EVENTS.MODULE_DESTROYED]: ModuleEventPayload;
    [EVENTS.MODULE_UNLOADED]: ModuleEventPayload;

    [EVENTS.CONFIG_APPLIED]: {
        default: CarouselConfig;
        old: CarouselConfig;
        new: CarouselConfig;
        isInternalOverride: boolean;
    };

    [EVENTS.SLIDE_SCROLL]: PriorityPayload & {
        slide?: HTMLDivElement;
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
    [EVENTS.STAGE_CREATED]: void;
    [EVENTS.STAGE_RESIZED]: void;
    [EVENTS.STAGE_CHANGED]: void;
    [EVENTS.TRANSITION_END]: void;
    [EVENTS.DRAG_START]: void;
    [EVENTS.DRAG_END]: void;
}

export type LegacyCarouselEvents = {
    [K in keyof typeof LEGACY_EVENT_MAP]:
    CarouselEvents[(typeof LEGACY_EVENT_MAP)[K]];
};
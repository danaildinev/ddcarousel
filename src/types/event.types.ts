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

    [EVENTS.CONFIG_CHANGED]: {
        default: CarouselConfig,
        old: CarouselConfig,
        new: CarouselConfig,
        isInternalOverride: boolean
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
}

export type CarouselEventName = keyof CarouselEvents | string;
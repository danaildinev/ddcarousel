import type { EVENTS } from "../constants/events-list";
import type { CarouselConfig } from "./carousel.types";
import type { PageChangePayload } from "./pageChangePayload";

export type CarouselEvents = {
    [EVENTS.PAGE_CHANGE_REQUEST]: {
        index: number | string;
        animate?: boolean;
        emit?: boolean;
        force?: boolean;
    };

    [EVENTS.PAGE_CHANGE]: {
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

    [EVENTS.PAGE_CHANGE_INDEX]: PageChangePayload

    [EVENTS.MODULE_CREATED]: {
        name: string
    };

    [EVENTS.MODULE_INITIALIZED]: {
        name: string
    };

    [EVENTS.MODULE_DESTROYED]: {
        name: string
    };

    [EVENTS.CONFIG_CHANGED]: {
        default: CarouselConfig,
        old: CarouselConfig,
        new: CarouselConfig
    };

    [EVENTS.SLIDE_SCROLL]: {
        slide?: HTMLDivElement,
        animate: boolean;
        specifiedPosition: number;
    };

    [EVENTS.DRAG_PRE_START]: {
        currentTranslate: number;
    };
}

export type CarouselEventName = keyof CarouselEvents | string;
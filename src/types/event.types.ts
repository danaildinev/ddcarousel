import type { EVENTS } from "../constants/events-list";

export type CarouselEvents = {
    [EVENTS.PAGE_CHANGE_REQUEST]: {
        index: number | string;
        animate?: boolean;
        emit?: boolean;
    };

    [EVENTS.PAGE_CHANGE]: {
        currentPage: number;
    }
}

export type CarouselEventName = keyof CarouselEvents | string;
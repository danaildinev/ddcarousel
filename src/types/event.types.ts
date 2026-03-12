import type { EVENTS } from "../constants/events-list";

export type CarouselEvents = {
    [EVENTS.PAGE_CHANGE]: {
        index: number | string;
        animate?: boolean;
        emit?: boolean;
    }
}

export type CarouselEventName = keyof CarouselEvents | string;
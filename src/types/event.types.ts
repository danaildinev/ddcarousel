import type { EVENTS } from "../constants/events-list";

export type CarouselEvents = {
    [EVENTS.PAGE_CHANGE_REQUEST]: {
        index: number | string;
        animate?: boolean;
        emit?: boolean;
    };

    [EVENTS.PAGE_CHANGE]: {
        currentPage: number;
        currentTranslate: number;
        slidesActive: number[];
    }

    [EVENTS.MODULE_INITIALIZED]: {
        name: string
    };

    [EVENTS.MODULE_LOADED]: {
        name: string
    };

    [EVENTS.MODULE_UNLOADED]: {
        name: string
    };
}

export type CarouselEventName = keyof CarouselEvents | string;
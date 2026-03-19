import type { EVENTS } from "../constants/events-list";
import type { CarouselConfig } from "./carousel.types";

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
}

export type CarouselEventName = keyof CarouselEvents | string;
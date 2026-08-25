
import { createCarousel } from "./main.js";

export const demoConfigs = {
    default: {
        config: {},
    },
    autoHeight: {
        config: {
            autoHeight: true,
        },
        render() {
            createCarousel(7, { variableHeight: true, });
        },
    },
    itemsPerPage: {
        config: {
            items: 3,
            itemPerPage: true,
        },
        slides: 9,
    },
    startPage: {
        config: {
            startPage: 2,
        },
    },
    gap: {
        config: {
            items: 3,
            gap: 24,
        },
        slides: 9,
    },
};
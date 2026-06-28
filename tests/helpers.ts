import { CSS_CLASSES } from "../src/constants/css-classes";
import type { CarouselConfig } from "../src/types/carousel.types";

export type TestCarouselConfig = Partial<CarouselConfig> & Record<string, unknown>;

export const carouselCustomClass = "custom-class";

export const baseConfig = (config: TestCarouselConfig = {}) => ({
    container: ".ddcarousel",
    ...config,
}) as CarouselConfig;

const getRandomLoremTextLength = (t: string) =>
    t.slice(0, 300 + Math.floor(Math.random() * (t.length - 300))).replace(/\s\w+$/, "");

export const renderCarousel = (slides = 5, options: {
    className?: string;
    width?: number;
    height?: number;
    urlData?: boolean;
    lazyImages?: boolean;
} = {}) => {
    const className = options.className ?? "ddcarousel";
    const width = options.width ?? 920;
    const height = options.height ?? 240;

    document.body.innerHTML = `
        <div class="ddcarousel ${className} ${carouselCustomClass}" style="width: ${width}px; height: ${height}px;">
            ${Array.from({ length: slides }, (_, index) => {
        const attrs = options.urlData ? `data-id="slide-${index + 1}" data-title="Slide ${index + 1}"` : "";
        const imgContent = options.lazyImages ? `<img data-src="/images/${index + 1}.jpg" alt="Slide ${index + 1}">` : ``;
        return `<div class="item-${index + 1}" ${attrs}>
                            ${imgContent}<br>${getRandomLoremTextLength(`Lorem ipsum dolor sit amet, consectetur adipiscing elit.In nec lectus et erat commodo ornare. 
                            Ut dictum lectus ac aliquet ultrices. Morbi vitae mauris felis. Praesent cursus, massa vitae ultrices cursus, 
                            mi erat gravida elit, ac fringilla metus nisl eget elit. Aliquam erat volutpat.`)}
                        </div>`;
    }).join("")}
        </div>
    `;
};

export const container = () => document.querySelector<HTMLElement>(".ddcarousel");
export const stage = () => document.querySelector<HTMLElement>(`.${CSS_CLASSES.stage}`);
export const items = () => Array.from(document.querySelectorAll<HTMLElement>(`.${CSS_CLASSES.item}`));
export const pagination = () => Array.from(document.querySelectorAll<HTMLElement>(`.${CSS_CLASSES.dot}`));
export const triggerResizeObservers = () => (globalThis as typeof globalThis & { triggerResizeObservers: () => void }).triggerResizeObservers();
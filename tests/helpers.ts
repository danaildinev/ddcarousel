import { vi } from "vitest";
import { CSS_CLASSES } from "../src/constants/css-classes";
import { Config } from "../src/core/config";
import { Events } from "../src/core/events";
import Stage from "../src/core/stage";
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

type NestedSetup = {
    outerStage: Stage;
    innerStage: Stage;
    outerEvents: Events;
    innerEvents: Events;
    outerStageDom: HTMLDivElement;
    innerStageDom: HTMLDivElement;
    outerSlides: HTMLDivElement[];
    innerSlides: HTMLDivElement[];
};

export const renderNestedCarousels = (): NestedSetup => {
    document.body.innerHTML = `
        <div id="outer">
            <div>
                <div id="inner">
                    <div>Inner slide 1</div>
                    <div>Inner slide 2</div>
                </div>
            </div>
            <div>
                Outer slide 2
            </div>
        </div>`;

    const outerContainer = document.querySelector<HTMLDivElement>("#outer")!;
    outerContainer.style.width = "1000px";
    outerContainer.style.height = "300px";

    const outerEvents = new Events();
    const outerConfig = new Config(outerEvents, baseConfig({ container: outerContainer }));
    const outerStage = new Stage(outerConfig, outerEvents);

    const innerContainer = document.querySelector<HTMLDivElement>("#inner")!;
    innerContainer.style.width = "500px";
    innerContainer.style.height = "200px";

    const innerEvents = new Events();
    const innerConfig = new Config(outerEvents, baseConfig({ container: innerContainer }));
    const innerStage = new Stage(innerConfig, innerEvents);
    const outerStageDom = outerContainer.firstElementChild!.firstElementChild as HTMLDivElement;
    const innerStageDom = innerContainer.firstElementChild!.firstElementChild as HTMLDivElement;
    const outerSlides = Array.from(outerStageDom.children) as HTMLDivElement[];
    const innerSlides = Array.from(innerStageDom.children) as HTMLDivElement[];

    vi.spyOn(outerStageDom, "getBoundingClientRect").mockReturnValue(rect(0, 2000));
    vi.spyOn(outerSlides[0]!, "getBoundingClientRect").mockReturnValue(rect(0, 1000));
    vi.spyOn(outerSlides[1]!, "getBoundingClientRect").mockReturnValue(rect(1000, 1000));
    vi.spyOn(innerStageDom, "getBoundingClientRect").mockReturnValue(rect(0, 1000));
    vi.spyOn(innerSlides[0]!, "getBoundingClientRect").mockReturnValue(rect(0, 500));
    vi.spyOn(innerSlides[1]!, "getBoundingClientRect").mockReturnValue(rect(500, 500));

    return {
        outerStage,
        innerStage,
        outerEvents,
        innerEvents,
        outerStageDom,
        innerStageDom,
        outerSlides,
        innerSlides
    };
};

export const container = () => document.querySelector<HTMLElement>(".ddcarousel");
export const stage = () => document.querySelector<HTMLElement>(`.${CSS_CLASSES.stage}`);
export const items = () => Array.from(document.querySelectorAll<HTMLElement>(`.${CSS_CLASSES.item}`));
export const pagination = () => Array.from(document.querySelectorAll<HTMLElement>(`.${CSS_CLASSES.dot}`));
export const triggerResizeObservers = () => (globalThis as typeof globalThis & { triggerResizeObservers: () => void }).triggerResizeObservers();
export const rect = (left: number, width: number, top = 0, height = 300): DOMRect => ({
    x: left,
    y: top,
    left,
    right: left + width,
    top,
    bottom: top + height,
    width,
    height,
    toJSON: () => { }
} as DOMRect);

export const transitionEnd = (propertyName = "transform"): Event => {
    const event = new Event("transitionend", {
        bubbles: true
    });

    Object.defineProperty(event, "propertyName", {
        value: propertyName
    });

    return event;
};
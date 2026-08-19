import { afterEach, describe, expect, it, vi } from "vitest";
import Carousel from "../src/core/carousel";
import { CSS_CLASSES } from "../src/constants/css-classes";
import { EVENTS } from "../src/constants/events-list";
import { baseConfig, carouselCustomClass, container, items, renderCarousel, stage, triggerResizeObservers } from "./helpers";
import { CarouselEvents } from "../src/types/event.types";
import { CarouselConfig, DragSnapMode } from "../src/types/carousel.types";

const innerContainer = () => document.querySelector<HTMLElement>(`.${CSS_CLASSES.container}`);
const sourceSlideClasses = () => items().map(item => item.firstElementChild?.className);
const visibleSlideIndexes = () => items()
    .filter(item => item.classList.contains(CSS_CLASSES.slideVisible))
    .map(item => Number(item.dataset.slide));

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
});

describe("Stage core", () => {
    it("throws when the container has no slide content", async () => {
        document.body.innerHTML = `<div class="ddcarousel" style="width: 300px;"></div>`;

        const carousel = new Carousel();

        await expect(carousel.init()).rejects.toThrow("No content found in container. Destroying carousel...");
    });

    it("wraps each original child in an indexed stage item", () => {
        renderCarousel(4);

        new Carousel(baseConfig({ pagination: false }));

        expect(innerContainer()).not.toBeNull();
        expect(stage()).not.toBeNull();
        expect(items()).toHaveLength(4);
        expect(items().map(item => item.dataset.slide)).toEqual(["0", "1", "2", "3"]);
        expect(sourceSlideClasses()).toEqual(["item-1", "item-2", "item-3", "item-4"]);
    });

    it("preserves custom container classes while adding stage state classes", () => {
        renderCarousel(2);

        new Carousel(baseConfig({ pagination: false, fullWidth: true }));

        expect(container()?.classList.contains("ddcarousel")).toBe(true);
        expect(container()?.classList.contains(carouselCustomClass)).toBe(true);
        expect(container()?.classList.contains(CSS_CLASSES.fullWidth)).toBe(true);
    });

    it("exposes stage slides and initial translate in status", () => {
        renderCarousel(2);

        const carousel = new Carousel(baseConfig({ pagination: false }));
        const status = carousel.getStatus();

        expect(status.currentTranslate).toBeCloseTo(0);
        expect(status.totalSlides).toBe(2);
        expect(Object.values(status.slides).map(slide => slide.dataset.slide)).toEqual(["0", "1"]);
    });

    it("initializes to the first page when startPage is zero", () => {
        renderCarousel(3);

        const carousel = new Carousel(baseConfig({ pagination: false, startPage: 0 }));

        expect(carousel.getCurrentPage()).toBe(0);
        expect(carousel.getStatus().visibleSlides).toEqual([0]);
        expect(visibleSlideIndexes()).toEqual([0]);
    });

    it("ignores a startPage beyond the last available page", () => {
        renderCarousel(3);

        const carousel = new Carousel(baseConfig({ pagination: false, startPage: 99 }));

        expect(carousel.getCurrentPage()).toBe(0);
        expect(carousel.getStatus().visibleSlides).toEqual([0]);
    });

    it("builds grouped page slides with the final page shifted back to stay full", () => {
        renderCarousel(7);

        const carousel = new Carousel(baseConfig({ pagination: false, items: 3 }));

        expect(carousel.getTotalPages()).toBe(2);
        expect(carousel.getStatus().slidesByPage).toEqual([
            [0, 1, 2],
            [3, 4, 5],
            [4, 5, 6],
        ]);
    });

    it("builds one page when the slide count exactly matches items", () => {
        renderCarousel(3);

        const carousel = new Carousel(baseConfig({ pagination: false, items: 3 }));

        expect(carousel.getTotalPages()).toBe(0);
        expect(carousel.getStatus().slidesByPage).toEqual([[0, 1, 2]]);
        expect(carousel.getStatus().visibleSlides).toEqual([0, 1, 2]);
    });

    it("marks only visible slides as active after direct page changes", () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({ pagination: false, items: 2 }));
        carousel.changePage(2, false);

        expect(carousel.getCurrentPage()).toBe(2);
        expect(carousel.getStatus().visibleSlides).toEqual([3, 4]);
        expect(visibleSlideIndexes()).toEqual([3, 4]);
    });

    it("replaces visible slide classes when moving between pages", () => {
        renderCarousel(4);

        const carousel = new Carousel(baseConfig({ pagination: false, items: 2 }));
        expect(visibleSlideIndexes()).toEqual([0, 1]);

        carousel.changePage(1, false);
        expect(visibleSlideIndexes()).toEqual([2, 3]);

        carousel.changePage(0, false);
        expect(visibleSlideIndexes()).toEqual([0, 1]);
    });

    it("moves by one slide per page when itemPerPage is enabled", () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({ pagination: false, items: 2, itemPerPage: true }));
        carousel.nextPage();

        expect(carousel.getCurrentPage()).toBe(1);
        expect(carousel.getStatus().slidesByPage).toEqual([
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4],
        ]);
        expect(carousel.getStatus().visibleSlides).toEqual([1, 2]);
    });

    it("uses a single active slide when centerSlide is enabled", () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({ pagination: false, items: 3, centerSlide: true }));
        carousel.changePage(3, false);

        expect(carousel.getStatus().visibleSlides).toEqual([3]);
        expect(visibleSlideIndexes()).toEqual([3]);
    });

    it("activates last full group when final page is incomplete", () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({ items: 3 }));
        carousel.changePage(1, false);

        expect(carousel.getStatus().visibleSlides).toEqual([2, 3, 4]);
    });

    it("sets horizontal item widths and stage width from the container width", () => {
        renderCarousel(4, { width: 800 });

        new Carousel(baseConfig({ pagination: false, items: 4 }));

        expect(stage()?.style.width).toBe("3200px");
        expect(items().map(item => item.style.width)).toEqual(["200px", "200px", "200px", "200px"]);
    });

    it("sets vertical item heights and uses translateY for page changes", () => {
        renderCarousel(4, { height: 400 });

        const carousel = new Carousel(baseConfig({ pagination: false, items: 2, vertical: true }));
        carousel.changePage(1, false);

        expect(stage()?.style.width).toBe("");
        expect(items().map(item => item.style.height)).toEqual(["200px", "200px", "200px", "200px"]);
        expect(stage()?.style.transform).toBe("translateY(-400px)");
    });

    it("uses translateX for horizontal page changes", () => {
        renderCarousel(4, { width: 400 });

        const carousel = new Carousel(baseConfig({ pagination: false, items: 2 }));
        carousel.changePage(1, false);

        expect(stage()?.style.transform).toBe("translateX(-400px)");
        expect(carousel.getStatus().currentTranslate).toBe(-400);
    });

    it("centers the active slide by offsetting the target position", () => {
        renderCarousel(5, { width: 600 });

        const carousel = new Carousel(baseConfig({ pagination: false, items: 3, centerSlide: true }));
        carousel.changePage(2, false);

        expect(stage()?.style.transform).toBe("translateX(-200px)");
        expect(carousel.getStatus().currentTranslate).toBe(-200);
    });

    it("subtracts configured gap from horizontal slide positions", () => {
        renderCarousel(4, { width: 400 });

        const carousel = new Carousel(baseConfig({ pagination: false, items: 2, gap: 20 }));
        carousel.changePage(1, false);

        expect(items().map(item => item.style.marginRight)).toEqual(["20px", "20px", "20px", "20px"]);
        expect(stage()?.style.transform).toBe("translateX(-380px)");
    });

    it("uses zero transition duration only during non-animated page changes", () => {
        renderCarousel(3);

        const carousel = new Carousel(baseConfig({ pagination: false, slideChangeDuration: 0.75 }));
        carousel.changePage(1, false);

        expect(stage()?.style.transitionDuration).toBe("0.75s");
    });

    it("keeps invalid next and previous requests inside bounds", () => {
        renderCarousel(2);

        const carousel = new Carousel(baseConfig({ pagination: false }));

        carousel.prevPage();
        expect(carousel.getCurrentPage()).toBe(0);

        carousel.nextPage();
        carousel.nextPage();
        expect(carousel.getCurrentPage()).toBe(1);
    });

    it("emits page changed only when the page actually changes", () => {
        renderCarousel(3);
        const carousel = new Carousel(baseConfig({ pagination: false }));
        const onChanged = vi.fn();

        carousel.on(EVENTS.PAGE_CHANGED, onChanged);
        carousel.changePage(0, false);
        carousel.changePage(1, false);
        carousel.changePage(1, false);

        expect(onChanged).toHaveBeenCalledTimes(1);
        expect(onChanged).toHaveBeenCalledWith(expect.objectContaining({
            currentPage: 1,
            visibleSlides: [1],
        }));
    });

    it("lets page index handlers force a numeric target before bounds checks", () => {
        renderCarousel(4);
        const carousel = new Carousel(baseConfig({ pagination: false }));

        carousel.on(EVENTS.PAGE_CHANGE_INDEX, (payload: CarouselEvents[typeof EVENTS.PAGE_CHANGE_INDEX]) => {
            if (payload.request === 1) {
                payload.page = 3;
                payload.handled = true;
            }
        });

        carousel.changePage(1, false);

        expect(carousel.getCurrentPage()).toBe(3);
    });

    it("updates dimensions and scroll position after a resize event", () => {
        vi.useFakeTimers();
        renderCarousel(4, { width: 400 });
        const carousel = new Carousel(baseConfig({ pagination: false, items: 2, resizeDebounce: 10 }));

        carousel.changePage(1, false);
        expect(stage()?.style.transform).toBe("translateX(-400px)");

        container()!.style.width = "600px";
        triggerResizeObservers();
        vi.advanceTimersByTime(10);

        expect(items().map(item => item.style.width)).toEqual(["300px", "300px", "300px", "300px"]);
        expect(stage()?.style.transform).toBe("translateX(-600px)");
    });

    it("throttles multiple resize observer callbacks into one resize event", () => {
        vi.useFakeTimers();
        renderCarousel(3);
        const carousel = new Carousel(baseConfig({ pagination: false, resizeDebounce: 20 }));
        const onResized = vi.fn();
        carousel.on(EVENTS.STAGE_RESIZED, onResized);

        triggerResizeObservers();
        triggerResizeObservers();
        triggerResizeObservers();
        vi.advanceTimersByTime(20);

        expect(onResized).toHaveBeenCalledTimes(1);
    });

    it("navigates with arrow keys when keyboard navigation is enabled", () => {
        renderCarousel(3);
        const carousel = new Carousel(baseConfig({ pagination: false, keyboardNavigation: true }));
        const event = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true });

        window.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
        expect(carousel.getCurrentPage()).toBe(1);
    });

    it("does not navigate with arrow keys while typing in an input", () => {
        renderCarousel(3);
        const input = document.createElement("input");
        document.body.appendChild(input);
        input.focus();
        const carousel = new Carousel(baseConfig({ pagination: false, keyboardNavigation: true }));

        window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));

        expect(carousel.getCurrentPage()).toBe(0);
    });

    it("does not register keyboard navigation when disabled", () => {
        renderCarousel(3);
        const carousel = new Carousel(baseConfig({ pagination: false, keyboardNavigation: false }));

        window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));

        expect(carousel.getCurrentPage()).toBe(0);
    });

    it("emits stage changed for child mutations inside the stage", async () => {
        renderCarousel(2);
        const carousel = new Carousel(baseConfig({ pagination: false }));
        const onChanged = vi.fn();
        carousel.on(EVENTS.STAGE_CHANGED, onChanged);

        stage()?.appendChild(document.createElement("div"));
        await Promise.resolve();

        expect(onChanged).toHaveBeenCalledWith({ log: "childList" });
    });

    it("disconnects stage observers when destroyed", async () => {
        renderCarousel(2);
        const carousel = new Carousel(baseConfig({ pagination: false }));
        const onChanged = vi.fn();
        const stageEl = stage();
        carousel.on(EVENTS.STAGE_CHANGED, onChanged);

        carousel.destroy(false);
        stageEl?.appendChild(document.createElement("div"));
        await Promise.resolve();

        expect(onChanged).not.toHaveBeenCalled();
    });

    it("removes transitionend listeners when destroyed", () => {
        renderCarousel(2);
        const carousel = new Carousel(baseConfig({ pagination: false }));
        const onTransitionEnd = vi.fn();
        const stageEl = stage();
        carousel.on(EVENTS.TRANSITION_END, onTransitionEnd);

        carousel.destroy(false);
        stageEl?.dispatchEvent(new Event("transitionend"));

        expect(onTransitionEnd).not.toHaveBeenCalled();
    });

    it("restores original slides when destroyed", () => {
        renderCarousel(3);

        const original = container()?.innerHTML.trim();
        const carousel = new Carousel(baseConfig());
        carousel.destroy(true);

        expect(container()?.children.length).toBe(3);
        expect(container()?.innerHTML.trim()).toBe(original);
    });

    it("starts on the configured page", () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({ startPage: 2 }));

        expect(carousel.getCurrentPage()).toBe(2);
        expect(carousel.getStatus().visibleSlides).toEqual([2]);
    });

    it("calculates grouped pages by default", () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({ items: 2 }));

        expect(carousel.getTotalPages()).toBe(2);
        expect(carousel.getStatus().slidesByPage).toEqual([[0, 1], [2, 3], [3, 4]]);
    });

    it("calculates overlapping pages when itemPerPage is enabled", () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({ items: 3, itemPerPage: true }));

        expect(carousel.getTotalPages()).toBe(2);
        expect(carousel.getStatus().slidesByPage).toEqual([
            [0, 1, 2],
            [1, 2, 3],
            [2, 3, 4],
        ]);

        carousel.changePage(1, false);
        expect(carousel.getStatus().visibleSlides).toEqual([1, 2, 3]);
    });

    it("calculates centered page groups when centerSlide is enabled", () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({ items: 3, centerSlide: true }));

        expect(carousel.getTotalPages()).toBe(4);
        expect(carousel.getStatus().slidesByPage).toEqual([
            [-1, 0, 1],
            [0, 1, 2],
            [1, 2, 3],
            [2, 3, 4],
            [3, 4, 5],
        ]);
        expect(carousel.getStatus().visibleSlides).toEqual([0]);
    });

    it("activates one slide at a time when items is one", () => {
        renderCarousel(4);

        const carousel = new Carousel(baseConfig({ items: 1 }));

        expect(carousel.getStatus().visibleSlides).toEqual([0]);
        carousel.changePage(2, false);
        expect(carousel.getStatus().visibleSlides).toEqual([2]);
    });

    it("activates the remaining slide on final page", () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({ items: 4 }));
        carousel.changePage(1, false);

        expect(carousel.getStatus().visibleSlides).toEqual([1, 2, 3, 4]);
    });

    it("activates final overlapping page in itemPerPage mode", () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({
            items: 3,
            itemPerPage: true
        }));
        carousel.changePage(2, false);

        expect(carousel.getStatus().visibleSlides).toEqual([2, 3, 4]);
    });

    it("activates first slide only in center mode", () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({
            items: 3,
            centerSlide: true
        }));

        expect(carousel.getStatus().visibleSlides).toEqual([0]);
    });

    it("activates last real slide in center mode", () => {
        renderCarousel(5);

        const carousel = new Carousel(baseConfig({
            items: 3,
            centerSlide: true
        }));
        carousel.changePage(4, false);

        expect(carousel.getStatus().visibleSlides).toEqual([4]);
    });

    it("clamps items to the slide count", () => {
        renderCarousel(2);

        const carousel = new Carousel(baseConfig({ items: 5 }));

        expect(carousel.getStatus().config.current?.items).toBe(2);
        expect(carousel.getTotalPages()).toBe(0);
        expect(carousel.getStatus().slidesByPage).toEqual([[0, 1]]);
    });

    it("applies fullWidth and vertical classes from config", () => {
        renderCarousel(3);

        const carousel = new Carousel(baseConfig({ fullWidth: true, vertical: true }));

        expect(container()?.classList.contains(CSS_CLASSES.fullWidth)).toBe(true);
        expect(container()?.classList.contains(CSS_CLASSES.vertical)).toBe(true);
        expect(carousel.getStatus().config.current?.autoHeight).toBe(false);
    });

    it("does not add fullWidth when verticalMaxContentWidth is enabled", () => {
        renderCarousel(3);

        new Carousel(baseConfig({ fullWidth: true, verticalMaxContentWidth: true }));

        expect(container()?.classList.contains(CSS_CLASSES.fullWidth)).toBe(false);
    });

    it("sets horizontal slide widths and stage width", () => {
        renderCarousel(3, { width: 360 });

        new Carousel(baseConfig({ items: 3 }));

        expect(stage()?.style.width).toBe("1080px");
        expect(items().map(item => item.style.width)).toEqual(["120px", "120px", "120px"]);
    });

    it("sets vertical slide heights without a horizontal stage width", () => {
        renderCarousel(3, { height: 300 });

        new Carousel(baseConfig({ items: 3, vertical: true }));

        expect(stage()?.style.width).toBe("");
        expect(items().map(item => item.style.height)).toEqual(["100px", "100px", "100px"]);
    });

    it("applies slide gaps by adding item margins", () => {
        renderCarousel(2, { width: 200 });

        new Carousel(baseConfig({ items: 2, gap: 20 }));

        expect(items().map(item => item.style.marginRight)).toEqual(["20px", "20px"]);
        expect(items().map(item => item.style.width)).toEqual(["90px", "90px"]);
    });

    it("sets auto height to the tallest visible slide", async () => {
        renderCarousel(3);

        vi.spyOn(HTMLElement.prototype, "offsetHeight", "get")
            .mockReturnValueOnce(50)
            .mockReturnValueOnce(90)
            .mockReturnValueOnce(100);

        const carousel = new Carousel(baseConfig({ autoHeight: true, items: 2 }));

        carousel.changePage(0, false);
        expect(container()?.style.height).toBe("90px");

        carousel.changePage(1, false);
        expect(container()?.style.height).toBe("100px");
    });

    it("uses slideChangeDuration for animated page changes", () => {
        renderCarousel(3);

        const carousel = new Carousel(baseConfig({ slideChangeDuration: 1.25 }));
        carousel.changePage(1, true);

        expect(stage()?.style.transitionDuration).toBe("1.25s");
    });

    it("sets swipeSmooth transition duration while dragging", () => {
        renderCarousel(3);

        new Carousel(baseConfig({ mouseDrag: true, swipeSmooth: 0.2 }));

        items()[0]?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 100, pointerType: "mouse" } as PointerEventInit));
        window.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: 90, pointerType: "mouse" } as PointerEventInit));

        expect(stage()?.style.transitionDuration).toBe("0.2s");
    });

    it("honors dragMaxDistance by snapping back when drag distance exceeds the limit", () => {
        renderCarousel(3);
        const carousel = new Carousel(baseConfig({
            mouseDrag: true,
            swipeThreshold: 10,
            dragMaxDistance: 5,
        }));

        items()[0]?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 100, pointerType: "mouse" } as PointerEventInit));
        window.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: 50, pointerType: "mouse" } as PointerEventInit));
        window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerType: "mouse" } as PointerEventInit));

        expect(carousel.getCurrentPage()).toBe(0);
        expect(stage()?.style.transform).toBe("translateX(0px)");
    });

    it("does not start a drag when mouseDrag is false for mouse pointers", () => {
        renderCarousel(3);
        const carousel = new Carousel(baseConfig({ mouseDrag: false, touchDrag: true }));
        const listener = vi.fn();
        carousel.on(EVENTS.DRAG_START, listener);

        items()[0]?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 100, pointerType: "mouse" } as PointerEventInit));

        expect(listener).not.toHaveBeenCalled();
    });

    it("does not start a drag when touchDrag is false for touch pointers", () => {
        renderCarousel(3);
        const carousel = new Carousel(baseConfig({ mouseDrag: true, touchDrag: false }));
        const listener = vi.fn();
        carousel.on(EVENTS.DRAG_START, listener);

        items()[0]?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 100, pointerType: "touch" } as PointerEventInit));

        expect(listener).not.toHaveBeenCalled();
    });

    it("stores closest drag snap mode in current config", () => {
        renderCarousel(3);

        const carousel = new Carousel(baseConfig({ dragSnapMode: DragSnapMode.Closest }));

        expect(carousel.getStatus().config.current?.dragSnapMode).toBe(DragSnapMode.Closest);
    });

    it("updates responsive config after a resize", () => {
        vi.useFakeTimers();
        renderCarousel(4, { width: 500 });
        const carousel = new Carousel(baseConfig({
            items: 3,
            resizeDebounce: 50,
            responsive: {
                400: { items: 1 },
                800: { items: 2 },
            } as CarouselConfig["responsive"],
        }));

        expect(carousel.getStatus().config.current?.items).toBe(3);

        container()!.style.width = "300px";
        triggerResizeObservers();
        vi.advanceTimersByTime(50);

        expect(carousel.getStatus().config.current?.items).toBe(1);
        expect(carousel.getStatus().slidesByPage).toEqual([[0], [1], [2], [3]]);

        container()!.style.width = "900px";
        triggerResizeObservers();
        vi.advanceTimersByTime(50);

        expect(carousel.getStatus().config.current?.items).toBe(3);
    });
});

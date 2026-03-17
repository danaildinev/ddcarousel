import { error } from "./error-handler";

export function scrollToPos(target: HTMLDivElement, position: number, isVertical = false) {
    if (target == undefined)
        throw error("Target not found!");

    const output = isVertical ? `translateY(${position}px)` : `translateX(${position}px)`;
    target.style.transform = output;
}
import { DATA } from "../constants/data-attrs";

export type SlideOffsets = {
    index: number,
    left: number,
    center: number,
    right: number
}

export type ClosestSlideDirection = "left" | "right" | "center";

export type ClosestSlideIndexes = Partial<Record<ClosestSlideDirection, number>>;

export function getSlidesOffsets(slides: HTMLElement[], vertical: boolean): SlideOffsets[] {
    const slideOffsets: SlideOffsets[] = [];

    slides.forEach(slide => {
        const start = vertical ? slide.offsetTop : slide.offsetLeft,
            size = vertical ? slide.offsetHeight : slide.offsetWidth;

        slideOffsets.push({
            index: Number(slide.dataset[DATA.dataset.slide]),
            left: start,
            center: start + size / 2,
            right: start + size,
        });
    });

    return slideOffsets;
}

export function getClosestSlideIndexes(offsets: SlideOffsets[], viewportCenter: number, currentTranslate: number, directions: ClosestSlideDirection[]): ClosestSlideIndexes {
    const bases: Record<ClosestSlideDirection, number> = {
        left: 0,
        center: viewportCenter,
        right: viewportCenter * 2
    };

    const first = offsets.at(0)?.left,
        last = offsets.at(-1)?.right;

    if (first == null || last == null) {
        return {};
    }

    const result: ClosestSlideIndexes = {};

    const findOffset = (current: number) => {
        if (current < first || current > last) {
            return -1;
        }

        let closestIndex = -1,
            closestDistToCenter = Infinity;

        offsets.forEach(slide => {
            const distance = Math.abs(slide.center - current);

            if (distance < closestDistToCenter) {
                closestDistToCenter = distance;
                closestIndex = slide.index;
            }
        });

        return closestIndex;
    };

    for (const target of directions) {
        const current = -currentTranslate + bases[target];
        result[target] = findOffset(current);
    }

    return result;
}
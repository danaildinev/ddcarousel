/**
 * ddcarousel Performance Benchmark (v1.x vs v2.0+)
 * -------------------------------
 *
 * Compares the current development build (v2.0 or newer) against a
 * previous released ddcarousel version (v1.x) using real-world browser scenarios.
 *
 * The benchmark tests: initialization (with and without modules), slide navigation, 
 * and stage resizing, providing a realistic comparison of the performance impact 
 * between versions.
 *
 * Note: The benchmark compares the current v2.0+ source implementation with a
 * previous released pure browser bundle. Because the v2 architecture is modular and
 * substantially different from the legacy v1.x distribution, comparing
 * bundled artifacts directly would require significant compatibility
 * shims. Benchmarking the source implementation instead provides a fairer
 * comparison of runtime behavior while avoiding those compatibility issues.
 *
 * How to run:
 *   npx tsx carousel.perf.ts --v1="ddcarousel.js"
 */

import { pathToFileURL } from "url";
import { dom } from "./../tests/env/dom-bootstrap.ts";
import { installDomMocks } from "./../tests/env/dom-mocks.ts";
import { resizeObservers } from "./../tests/env/dom-mocks.ts";
import { performance } from "node:perf_hooks";

const comparePath = process.argv.find(arg => arg.startsWith("--v1="))?.slice("--v1=".length);
if (!comparePath) {
    console.error("Missing '--v1' argument! Please, specify absolute path to any v1.x src file (not the bundle version!)...");
    process.exit(1);
}

const { default: compareCarousel } = await import(pathToFileURL(comparePath).href);
import Carousel from "../src/core/carousel";

type Metric = {
    name: string;
    unit: "ms";
    samples: number[];
};

const options = {
    slides: numberFromEnv("PERF_SLIDES", 60),
    iterations: numberFromEnv("PERF_ITERATIONS", 40),
    resizeWidth: numberFromEnv("PERF_RESIZE_WIDTH", 860),
    warmups: numberFromEnv("PERF_WARMUPS", 5),
};

function numberFromEnv(name: string, fallback: number) {
    const value = Number.parseInt(process.env[name] ?? "", 10);
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

const getRandomLoremTextLength = (t: string) =>
    t.slice(0, 300 + Math.floor(Math.random() * (t.length - 300))).replace(/\s\w+$/, "");

function renderCarousel(name: string, slides = options.slides, width = 720, height = 320) {
    document.body.innerHTML = `
        <div class="ddcarousel ${name}" style="width: ${width}px; height: ${height}px;">
            ${Array.from({ length: slides }, (_, index) => `
                <div class="item-${index + 1}">
                    ${getRandomLoremTextLength(`Lorem ipsum dolor sit amet, consectetur adipiscing elit.In nec lectus et erat commodo ornare. 
                    Ut dictum lectus ac aliquet ultrices. Morbi vitae mauris felis. Praesent cursus, massa vitae ultrices cursus, 
                    mi erat gravida elit, ac fringilla metus nisl eget elit. Aliquam erat volutpat.`)}
                </div>
            `).join("")}
        </div>
    `;
}

async function sample(name: string, beforeEach: () => void | Promise<void>, fn: () => void | Promise<void>,
    afterEach: () => void | Promise<void>): Promise<Metric> {
    console.log(`[Running] ${name}...`);

    const samples: number[] = [];

    for (let i = 0; i < options.warmups; i++) {
        await beforeEach?.();

        try {
            await fn();
        } finally {
            await afterEach?.();
        }
    }

    for (let i = 0; i < options.iterations; i++) {
        await beforeEach?.();

        const start = performance.now();

        try {
            await fn();
            samples.push(performance.now() - start);
        } finally {
            await afterEach?.();
        }
    }

    await new Promise(resolve => setTimeout(resolve, 50));
    return { name, unit: "ms", samples };
}

async function benchmarkInitialization() {
    let carousel: Carousel;

    return sample(
        "Carousel default config",
        () => renderCarousel("default"),
        async () => {
            carousel = new Carousel();
            await carousel.init({ container: ".default" });
        },
        () => carousel.destroy(false)
    );
}

async function benchmarkInitializationOld() {
    let carousel: ReturnType<typeof compareCarousel>;

    return sample(
        `Carousel (v1.x) default config`,
        () => renderCarousel("default-old"),
        () => carousel = compareCarousel({ container: ".default-old" }),
        () => carousel.destroy(true)
    );
}

async function benchmarkInitializationWithModules() {
    let carousel: Carousel;

    return sample(
        "Carousel - enabled all modules",
        () => renderCarousel("modules"),
        async () => {
            carousel = new Carousel();
            await carousel.init({
                container: ".modules",
                autoplay: true,
                lazyLoad: true,
                loop: true,
                nav: true,
                pagination: true,
                urlNav: true,
            } as Partial<any>);
        },
        () => carousel.destroy(false)
    );
}

async function benchmarkInitializationWithModulesOld() {
    let carousel: ReturnType<typeof compareCarousel>;

    return sample(
        `Carousel (v1.x) - enabled all modules`,
        () => renderCarousel("modules-old"),
        async () => {
            carousel = compareCarousel({
                container: ".modules-old",
                autoplay: true,
                lazyLoad: true,
                loop: true,
                nav: true,
                dots: true,
                urlNav: true,
            });
        },
        () => carousel.destroy(true)
    );
}

async function benchmarkSlideChanges() {
    renderCarousel("slide-change");

    const carousel = new Carousel();
    await carousel.init({ container: ".slide-change" });
    const totalPages = carousel.getTotalPages();
    let page = 0;

    const metric = await sample(
        "Carousel - changing slides",
        () => { },
        () => {
            page = page >= totalPages ? 0 : page + 1;
            carousel.changePage(page, false);
        },
        () => { },
    );

    carousel.destroy(false);
    return metric;
}

async function benchmarkSlideChangesOld() {
    renderCarousel("slide-change-old");

    const carousel = compareCarousel({ container: ".slide-change-old" });
    const totalPages = carousel.getTotalPages();
    let page = 0;

    const metric = await sample(
        "Carousel (v1.x) - changing slides",
        () => { },
        () => {
            page = page >= totalPages ? 0 : page + 1;
            carousel.changePage(page, false);
        },
        () => { }
    );

    carousel.destroy(true);
    return metric;
}

async function benchmarkStageResizeUpdate() {
    renderCarousel("stage-resize");

    // FIXED: Clear legacy observers BEFORE initializing the new carousel
    resizeObservers.clear();

    const carousel = new Carousel();
    await carousel.init({ container: ".stage-resize", resizeDebounce: 0 });

    const container = document.querySelector(".stage-resize") as HTMLElement;
    let width = options.resizeWidth;
    let resizeResolved: (() => void) | null = null;

    carousel.on("stage:resized", () => {
        resizeResolved?.();
        resizeResolved = null;
    });

    const metric = await sample(
        "Carousel - resize-triggered stage update",
        () => { },
        async () => {
            const resized = new Promise<void>((resolve, reject) => {
                resizeResolved = resolve;
                setTimeout(() => reject(new Error("Timeout: stage:resized event never fired.")), 2000);
            });

            width = width === options.resizeWidth ? options.resizeWidth - 240 : options.resizeWidth;
            if (container) container.style.width = `${width}px`;

            // FIXED: Added modern standard sizing arrays just in case ddcarousel looks for them
            const entry = {
                target: container,
                contentRect: { width, height: 0, x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0, toJSON: () => { } },
                borderBoxSize: [{ inlineSize: width, blockSize: 0 }],
                contentBoxSize: [{ inlineSize: width, blockSize: 0 }],
                devicePixelContentBoxSize: [{ inlineSize: width, blockSize: 0 }]
            } as unknown as ResizeObserverEntry;

            const resizeEvent = document.createEvent("Event");
            resizeEvent.initEvent("resize", true, true);
            //window.dispatchEvent(resizeEvent);

            resizeObservers.forEach(callback => callback([entry], {} as ResizeObserver));

            await resized;
        },
        () => { }
    );

    carousel.destroy(false);
    return metric;
}

async function benchmarkStageResizeUpdateOld() {
    renderCarousel("stage-resize-old");
    resizeObservers.clear();

    const container = document.querySelector(".stage-resize-old") as HTMLElement;
    let width = options.resizeWidth;
    let resizeResolved: (() => void) | null = null;

    // Safety fallback: Pass as a callback just in case v1.4 expects it here
    const carousel = compareCarousel({
        container: ".stage-resize-old",
        resizeRefresh: 0,
        onResized: () => {
            resizeResolved?.();
            resizeResolved = null;
        }
    });

    // Standard event binding
    if (typeof carousel.on === 'function') {
        carousel.on("onResized", () => {
            resizeResolved?.();
            resizeResolved = null;
        });
    }

    const metric = await sample(
        "Carousel (v1.x) - resize-triggered stage update",
        () => { },
        async () => {
            const resized = new Promise<void>((resolve, reject) => {
                resizeResolved = resolve;
                // Bumped to 2500ms in case v1.4 has a heavy debounce
                setTimeout(() => reject(new Error("Timeout: onResized event never fired for v1.4.")), 2500);
            });

            width = width === options.resizeWidth ? options.resizeWidth - 240 : options.resizeWidth;
            if (container) container.style.width = `${width}px`;

            // force JSDOM window to register the new width to bypass mobile-scroll resize locks
            Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
            Object.defineProperty(document.documentElement, 'clientWidth', { writable: true, configurable: true, value: width });

            const entry = {
                target: container,
                contentRect: { width, height: 0, x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0, toJSON: () => { } },
                borderBoxSize: [{ inlineSize: width, blockSize: 0 }],
                contentBoxSize: [{ inlineSize: width, blockSize: 0 }],
                devicePixelContentBoxSize: [{ inlineSize: width, blockSize: 0 }]
            } as unknown as ResizeObserverEntry;

            const resizeEvent = document.createEvent("Event");
            resizeEvent.initEvent("resize", true, true);
            window.dispatchEvent(resizeEvent);

            resizeObservers.forEach(callback => callback([entry], {} as ResizeObserver));

            await resized;
        },
        () => { }
    );

    carousel.destroy(true);
    return metric;
}

function summarize(metric: Metric) {
    const sorted = [...metric.samples].sort((a, b) => a - b);
    const sum = sorted.reduce((total, value) => total + value, 0);
    const percentile = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] ?? 0;

    return {
        name: metric.name,
        avg: sum / sorted.length,
        min: sorted[0] ?? 0,
        max: sorted[sorted.length - 1] ?? 0,
        p95: percentile(0.95),
        samples: sorted.length,
    };
}

function printResults(metrics: Metric[]) {
    console.log("\n---------- PERFORMANCE RESULTS ----------");
    console.table(metrics.map(metric => {
        const summary = summarize(metric);

        return {
            metric: summary.name,
            avgMs: summary.avg.toFixed(2),
            minMs: summary.min.toFixed(2),
            p95Ms: summary.p95.toFixed(2),
            maxMs: summary.max.toFixed(2),
            samples: summary.samples,
        };
    }));
}

async function main() {
    installDomMocks(dom.window);

    const results: Metric[] = [];

    console.log(`slides=${options.slides}, warmups=${options.warmups}, iterations=${options.iterations}`);

    const benchmarks = [
        benchmarkInitialization,
        benchmarkInitializationOld,
        benchmarkInitializationWithModules,
        benchmarkInitializationWithModulesOld,
        benchmarkSlideChanges,
        benchmarkSlideChangesOld,
        benchmarkStageResizeUpdate,
        benchmarkStageResizeUpdateOld,
    ];

    for (const benchmark of benchmarks) {
        results.push(await benchmark());
    }

    printResults(results);

    return true;
}

void main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
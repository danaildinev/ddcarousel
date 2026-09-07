import { describe, expect, it, afterEach, vi } from "vitest";
import { BaseModule, ModuleStyle } from "../src/core/base-module";
import { ModuleContext } from "../src/types/module.params";
import { Config } from "../src/core/config";
import { Events } from "../src/core/events";
import { CarouselStatus } from "../src/types/carousel.types";
import { baseConfig } from "./helpers";

class TestModule extends BaseModule {
    id = "test";

    constructor(context: ModuleContext, styles?: ModuleStyle | ModuleStyle[],) {
        super(context);
        this.styles = styles;
    }

    initialize() { }
    destroy() { }
}

function createModuleContext(): ModuleContext {
    const container = document.createElement("div");

    const configClass = {
        current: {},
        setModuleOverride: vi.fn(),
    } as unknown as Config;

    const events = {
        emit: vi.fn(),
    } as unknown as Events;

    return {
        config: baseConfig(),
        configClass,
        events,
        container,
        getStatus: vi.fn(() => ({} as CarouselStatus)),
    };
}

describe("BaseModule styles", () => {
    afterEach(() => {
        document.head
            .querySelectorAll('link[data-ddcarousel-module-style], style[data-ddcarousel-module-style]')
            .forEach(element => element.remove());

        document.head
            .querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
            .forEach(link => {
                if (link.href.includes("/modules/test.css")) {
                    link.remove();
                }
            });
    });

    it("loads an external stylesheet when module is initialized", () => {
        const module = new TestModule(
            createModuleContext(),
            {
                href: "/modules/test.css"
            }
        );
        module.initializeLifecycle();

        const link = document.head.querySelector<HTMLLinkElement>('link[data-ddcarousel-module-style="test"]');
        expect(link).not.toBeNull();
        expect(link?.rel).toBe("stylesheet");
        expect(link?.href).toBe(new URL("/modules/test.css", document.baseURI).href);
    });

    it("injects inline css when module is initialized", () => {
        const css = `
			.ddcarousel-module-test {
				display: block;
			}
		`;

        const module = new TestModule(
            createModuleContext(),
            {
                css
            }
        );
        module.initializeLifecycle();

        const style = document.head.querySelector<HTMLStyleElement>('style[data-ddcarousel-module-style="test"]');
        expect(style).not.toBeNull();
        expect(style?.textContent).toContain(".ddcarousel-module-test");
        expect(style?.textContent).toContain("display: block");
    });

    it("loads external and inline styles together", () => {
        const module = new TestModule(
            createModuleContext(),
            {
                href: "/modules/test.css",
                css: ".ddcarousel-module-test { opacity: 1; }",
            }
        );

        module.initializeLifecycle();

        const link = document.head.querySelector('link[data-ddcarousel-module-style="test"]');
        const style = document.head.querySelector('style[data-ddcarousel-module-style="test"]');
        expect(link).not.toBeNull();
        expect(style).not.toBeNull();
    });

    it("loads multiple external stylesheets", () => {
        const module = new TestModule(
            createModuleContext(),
            [
                { href: "/modules/base.css" },
                { href: "/modules/theme.css" },
            ]
        );

        module.initializeLifecycle();

        const links = document.head.querySelectorAll<HTMLLinkElement>('link[data-ddcarousel-module-style="test"]');
        expect(links).toHaveLength(2);
        expect(Array.from(links).map(link => link.href)).toEqual([
            new URL("/modules/base.css", document.baseURI).href,
            new URL("/modules/theme.css", document.baseURI).href,
        ]);
    });

    it("combines multiple inline styles into one style element", () => {
        const module = new TestModule(
            createModuleContext(),
            [
                {
                    css: ".test-a { display: block; }",
                },
                {
                    css: ".test-b { display: flex; }",
                },
            ]
        );

        module.initializeLifecycle();

        const styles = document.head.querySelectorAll<HTMLStyleElement>('style[data-ddcarousel-module-style="test"]');

        expect(styles).toHaveLength(1);
        expect(styles[0]?.textContent).toContain(".test-a { display: block; }");
        expect(styles[0]?.textContent).toContain(".test-b { display: flex; }");
    });

    it("does not load the same external stylesheet more than once", () => {
        const styles = { href: "/modules/test.css", };

        const first = new TestModule(createModuleContext(), styles);
        const second = new TestModule(createModuleContext(), styles);
        first.initializeLifecycle();
        second.initializeLifecycle();

        const links = document.head.querySelectorAll('link[data-ddcarousel-module-style="test"]');
        expect(links).toHaveLength(1);
    });

    it("does not inject inline module css more than once", () => {
        const styles = { css: ".ddcarousel-module-test { display: block; }", };

        const first = new TestModule(createModuleContext(), styles);
        const second = new TestModule(createModuleContext(), styles);
        first.initializeLifecycle();
        second.initializeLifecycle();

        const styleElements = document.head.querySelectorAll('style[data-ddcarousel-module-style="test"]');
        expect(styleElements).toHaveLength(1);
    });

    it("keeps module styles loaded after module destruction", () => {
        const module = new TestModule(
            createModuleContext(),
            {
                href: "/modules/test.css",
                css: ".ddcarousel-module-test { display: block; }",
            }
        );

        module.initializeLifecycle();
        module.destroyLifecycle();
        expect(document.head.querySelector('link[data-ddcarousel-module-style="test"]')).not.toBeNull();
        expect(document.head.querySelector('style[data-ddcarousel-module-style="test"]')).not.toBeNull();
    });
});
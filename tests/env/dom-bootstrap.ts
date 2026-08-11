import { JSDOM } from "jsdom";
import { vi } from "vitest";

export const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    pretendToBeVisual: true,
    url: "http://testtesttesttesttest.com",
});

globalThis.window = dom.window as any;
globalThis.document = dom.window.document;
globalThis.Element = dom.window.Element;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.NodeList = dom.window.NodeList;
globalThis.MouseEvent = dom.window.MouseEvent;
globalThis.MutationObserver = dom.window.MutationObserver;
globalThis.getComputedStyle = dom.window.getComputedStyle;
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
globalThis.Node = dom.window.Node;

HTMLElement.prototype.setPointerCapture ??= vi.fn();
HTMLElement.prototype.releasePointerCapture ??= vi.fn();
HTMLElement.prototype.hasPointerCapture ??= vi.fn(() => false);
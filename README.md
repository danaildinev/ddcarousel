# DDCarousel

![GitHub package.json version](https://img.shields.io/github/package-json/v/danaildinev/ddcarousel) ![GitHub](https://img.shields.io/github/license/danaildinev/ddcarousel)

Lightweight, dependency-free carousel written in TypeScript and built for the modern web.

**Browser compatibility**: Modern browsers with ES2022 support.

## Features
- Lightweight and dependency-free
- Multiple items per page and one-slide-per-page modes
- Horizontal, vertical and centered layouts
- Infinite / loop scrolling
- Mouse, touch and pen dragging with configurable snapping and swipe behavior
- Navigation, pagination and keyboard controls
- Autoplay with pause controls and progress indicator
- Lazy image loading with configurable preloading
- URL-based slide navigation
- Automatic height adjustment and configurable slide spacing
- Breakpoint-specific configuration
- Dynamically loaded optional modules
- Public module API for accessing and controlling features
- Namespaced event system with typed event payloads
- Detailed runtime state
- Full TypeScript support with bundled declarations
- Customizable styling through CSS variables
- ESM and UMD builds with CDN support
- Designed for modern browsers and frameworks such as React and Vue
- And more ... :)

## Getting started

This package can be installed using [npm](https://www.npmjs.com/package/ddcarousel):

```bash
npm i ddcarousel
```

Or download the [latest release](https://github.com/danaildinev/ddcarousel/releases).

You can also use ddcarousel directly from a CDN:

- [unpkg](https://unpkg.com/ddcarousel/) JS: `https://unpkg.com/ddcarousel/dist/ddcarousel.umd.min.js`
- [unpkg](https://unpkg.com/ddcarousel/) CSS: `https://unpkg.com/ddcarousel/dist/ddcarousel.min.css`
- [jsDelivr](https://www.jsdelivr.com/package/npm/ddcarousel) JS: `https://cdn.jsdelivr.net/npm/ddcarousel/dist/ddcarousel.umd.min.js`
- [jsDelivr](https://www.jsdelivr.com/package/npm/ddcarousel) CSS: `https://cdn.jsdelivr.net/npm/ddcarousel/dist/ddcarousel.min.css`

## Builds

ddcarousel provides separate builds for modern applications and direct browser usage.

See [Production output](#production-output) category for detailed builds information.

### ESM

The ESM build is recommended for npm users:

```text
dist/ddcarousel.esm.js
```

It is optimized for a smaller initial payload - optional modules are downloaded only when needed. They are split into separate files:

```text
ddcarousel-autoplay.esm.js
ddcarousel-lazyLoad.esm.js
ddcarousel-loop.esm.js
ddcarousel-nav.esm.js
ddcarousel-pagination.esm.js
ddcarousel-urlNav.esm.js
```

These files are loaded automatically when their modules are required. You don't need to import them directly. If you manually host or copy the ESM distribution file, keep all module chunks alongside `ddcarousel.esm.js`.

### UMD

For traditional browser `<script>` usage, you can use the UMD build. It is self-contained and doesn't require the separate ESM module chunks. It includes the complete library in a single JavaScript file.

### Source Maps

Source maps are included only for the minified production browser assets:

```text
ddcarousel.umd.min.js.map
ddcarousel.min.css.map
```

Readable non-minified builds and ESM files do not include source maps.

## Usage

### HTML structure

Create a container and place your slides directly inside it:

```html
<div class="carousel">
    <div>Slide 1</div>
    <div>Slide 2</div>
    <div>Slide 3</div>
    <div>Slide 4</div>
    <div>Slide 5</div>
</div>
```

The carousel will use the elements inside the container as slides.

### ESM / Modern bundler

When using ddcarousel through npm or a modern bundler:

```ts
import ddcarousel from "ddcarousel";

const carousel = ddcarousel({
    container: ".carousel",
    items: 3,
});
```

You can also import and create the `Carousel` class directly:

```ts
import { Carousel } from "ddcarousel";

const carousel = new Carousel({
    container: ".carousel",
    items: 3,
});
```

Import the stylesheet as well:

```ts
import "ddcarousel/dist/ddcarousel.css";
// ... or use the minified stylesheet
import "ddcarousel/dist/ddcarousel.min.css";
```

### UMD

For direct browser usage, include the CSS and UMD JavaScript build. You can use CDN or self-hosted files:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ddcarousel/dist/ddcarousel.min.css">

<script src="https://cdn.jsdelivr.net/npm/ddcarousel/dist/ddcarousel.umd.min.js"></script>
```

Then initialize the carousel:

```html
<script>
    const carousel = ddcarousel({
        container: ".carousel",
        items: 3,
    });
</script>
```

You can also create a `Carousel` instance directly:

```html
<script>
    const carousel = new Carousel({
        container: ".carousel",
        items: 3,
    });
</script>
```

### Direct ESM

The ESM build can also be used directly in modern browsers without a bundler.

This is useful when you want to self-host ddcarousel, quickly test it in the browser, or use native JavaScript modules in a simple project without npm, Vite, Webpack or another bundler. I also use this approach for quick development testing with the built-in dev server and custom HTML files inside the `testing` directory.

```html
<link rel="stylesheet" href="./ddcarousel.css">

<script type="module">
    import ddcarousel from "./ddcarousel.esm.js";

    const carousel = ddcarousel({
        container: ".carousel",
    });

    await carousel.ready;
</script>
```
When using the ESM build directly, keep `ddcarousel.esm.js` and all generated `ddcarousel-*.esm.js` module chunks in the same directory. Optional modules are loaded dynamically when needed. The page must also be served through a web server rather than opened directly with `file://`.

### Initialize later

A carousel instance can be created without configuration and initialized later:

```ts
import { Carousel } from "ddcarousel";

const carousel = new Carousel();
carousel.init({
    container: ".carousel",
    items: 3,
});
```

This is also useful when you need to register events before initialization, such as `carousel:initialize`:

```ts
import { Carousel, EVENTS } from "ddcarousel";

const carousel = new Carousel();

carousel.on(EVENTS.INITIALIZE, () => {
    console.log("Initializing...");
});

carousel.init({
    container: ".carousel",
    items: 3,
});
```

### Wait for initialization

Optional modules may be loaded asynchronously. Use `carousel.ready` when you need to wait until the carousel and its modules are fully initialized:

```ts
const carousel = ddcarousel({
    container: ".carousel",
    items: 3,
    autoplay: true,
});

await carousel.ready;

console.log("Carousel is ready");
```

### TypeScript

ddcarousel includes bundled TypeScript declarations and exports public types for configuration, state, events, event payloads, and modules.

```ts
import type {
    CarouselConfig,
    CarouselStatus,
    CarouselState,
    CarouselStatusConfig,
    CarouselEvents,
    LegacyCarouselEvents,
    PageChangePayload,
    PageChangeScrollPayload,
    ModuleEventPayload,
    ModuleId,
    CarouselModuleMap,
    Autoplay,
    AutoplayConfig,
    Nav,
    Pagination,
    LazyLoad,
    LazyLoadConfig,
    Loop,
    UrlNav
} from "ddcarousel";
```

This provides type-safe configuration, event callbacks, carousel state, and module APIs when using TypeScript.


## Config

- `container` - Carousel container selector. By default it searches for DOM element with `ddcarousel` class name (string)

- `items` - Number of visible items per page. If `items` exceeds the available slide count, carousel uses an effective clamped value for layout while preserving the configured value. (number, default: `1`)

- `itemPerPage` - Move one item at a time when changing pages (boolean, default: `false`)

- `autoHeight` - Automatically adjust carousel height based on visible slides. Works with vertical carousels. (boolean, default: `true`)

- `fullWidth` - Expand the carousel to the full available width (boolean, default: `true`)

- `centerSlide` - Center the active slide (boolean, default: `false`)

- `startPage` - Set starting page (number, default: `0`)

- `responsive` - Breakpoint-specific configuration options. When leaving a responsive breakpoint, options defined only for that breakpoint are restored to their original or default values. (object, default: empty object)

- `gap` - Space between slides (number, default: `0`)

- `touchDrag` - Enable dragging with touch input (boolean, default: `true`)

- `mouseDrag` - Enable dragging with mouse input (boolean, default: `true`)

- `dragSnapMode` - Control how the target slide is selected after dragging. Using drag snap mode enables `centerSlide` and works best with `dragMaxDistance: 0`. (swipe/closest, default: `swipe`)

- `keyboardNavigation` - Enable navigation using keyboard arrow keys (boolean, default: `false`)

- `vertical` - Enable vertical carousel orientation (boolean, default: `false`)

- `verticalMaxContentWidth` - Size the carousel width based on its widest slide. Disables `fullWidth` when enabled (boolean, default: `false`)

- `swipeThreshold` - Minimum drag distance required to trigger a page change (number, default: `60`)

- `dragMaxDistance` - Maximum allowed drag distance. 0 allows unrestricted dragging (number, default: `0`)

- `slideChangeDuration` - Slide transition animation duration in seconds (number, default: `0.5`)

- `swipeSmooth` - Controls drag movement smoothing (number, default: `0`)

- `resizeDebounce` - Delay in milliseconds before recalculating the carousel after resizing. Stage size changes are detected automatically. Layout, slide positions and responsive configuration are recalculated after resizing. (number, default: `200`)

- `refresh()` - **Deprecated.** Carousel resizing and layout recalculation are now handled automatically.

## Styling

ddcarousel includes default styles and can be customized using CSS variables without modifying the library files. Override the variables on `:root` to apply styles globally:

```css
:root {
    --ddcarousel-dot-size: 10px;
    --ddcarousel-dot-radius: 50%;
}
```
Or scope them to a specific carousel. This allows multiple carousel instances on the same page to use different styles:

```css
.my-carousel {
    --ddcarousel-nav-color: #fff;
    --ddcarousel-dot-color-active: #4f46e5;
}
```

Available customization options:
- `--ddcarousel-nav-color` - Navigation button/icon color.
- `--ddcarousel-nav-font-size` - Navigation text size when using custom text instead of the default SVG icons.
- `--ddcarousel-url-nav-color` - Default URL navigation text color.
- `--ddcarousel-url-nav-color-active` - Active URL navigation text color.
- `--ddcarousel-dots-bottom` - Vertical position of pagination dots from the bottom of the stage.
- `--ddcarousel-dot-size` - Pagination dot size.
- `--ddcarousel-dot-spacing` - Space between pagination dots.
- `--ddcarousel-dot-color` - Inactive pagination dot color.
- `--ddcarousel-dot-color-active` - Active pagination dot color.
- `--ddcarousel-dot-radius` - Pagination dot border radius.
- `--ddcarousel-autoplay-animation` - CSS animation used by the autoplay progress indicator.
- `--ddcarousel-autoplay-bar-color` - Autoplay progress bar color.
- `--ddcarousel-autoplay-speed` - Autoplay progress animation duration. This value is controlled internally based on the configured autoplay speed.

## Modules

ddcarousel includes optional modules that are loaded only when needed.
Each module has a unique ID that can be used to get module instance, load or unload it.

```ts
import { Autoplay } from "ddcarousel";

const autoplay = carousel.module(Autoplay.id);

autoplay.start();
autoplay.stop();
```

You can also load or unload modules manually:
```ts
import { Autoplay } from "ddcarousel";

await carousel.loadModule(Autoplay.id);
await carousel.unloadModule(Autoplay.id);
```

Modules enabled through configuration are loaded automatically (for example: `nav: true`). They may also be loaded or unloaded automatically when related configuration changes, for example responsive breakpoint changes on page resize.

Module-specific configuration options use the module ID as a prefix, for example `autoplaySpeed`, `lazyLoadPreload` and `navPrevContent`.

### Navigation

Shows previous and next navigation buttons.
Module ID: `nav`

- `nav` - Enable navigation (boolean, default: `false`)

- `navPrevContent` - Previous button content (string, default: svg icon)

- `navNextContent` - Next button content (string, default: svg icon)

### Pagination

Page navigation indicators.
Module ID: `pagination`

- `pagination` - Enable pagination (boolean, default: `true`)

### Autoplay

Automatically changes pages.
Module ID: `autoplay`

- `autoplay` - Enable autoplay (boolean, default: `false`)

- `autoplaySpeed` - Autoplay interval in milliseconds (number, default: `5000`)

- `autoplayProgress` - Show autoplay progress bar (boolean, default: `true`)

- `autoplayPauseOnTabHidden` - Pause when the browser tab is hidden (boolean, default: `true`)

- `autoplayPauseHover` - Pause on hover or touch (boolean, default: `false`)

#### Methods

- `start()` - Start autoplay

- `stop()` - Stop autoplay

#### Events
- `module:autoplay:started` - Emitted when autoplay starts

- `module:autoplay:stopped` - Emitted when autoplay stops

### Lazy Load

Lazy loads images in visible and upcoming/neighbour slides.
Module ID: `lazyLoad`

- `lazyLoad` - Enable lazy loading (boolean, default: `false`)

- `lazyLoadPreload` - Preload upcoming slides (boolean, default: `false`)

- `lazyLoadPreloadSlides` - Number of slides to preload (number, default: `1`)

### URL Navigation

Creates navigation based on slide IDs and titles.
Module ID: `urlNav`

- `urlNav` - Enable URL navigation (boolean, default: `false`)

- `urlNavContainer` - Custom URL navigation container

Slides used with URL Navigation must include `data-id` and `data-title`.

```html
<div data-id="slide-1" data-title="Slide 1">...</div>
```

#### Methods

- `goToUrl(name, enableAnim)` - Change the current page to the slide matching the specified name.

### Loop

Enables loop/infinite scrolling
Module ID: `loop`

* `loop` - Enable loop mode (boolean, default: `false`)


## Methods

- `init(config)` - Initialize the carousel with the default config or user configuration provided as a parameter. It returns a promise, so it can be awaited with `await carousel.init(config)` when you need to wait for initialization and module loading to complete.

- `destroy(restoreSlides)` - Destroy the carousel. Slides are restored by default. Use `false` to skip restoring the original slides. A destroyed instance cannot be initialized again. Create a new instance instead.

- `prevPage()` - Go to the previous page

- `nextPage()` - Go to the next page

- `changePage(id, animate);` - Go to a specified page index. The optional second parameter controls whether the page change is animated.

- `on(event, callback)` - Register an event listener. Supports built-in, legacy and custom event names.

- `module(moduleId)` - Get an initialized module instance by its ID.

- `loadModule(moduleId)` - Manually load and initialize a module.

- `unloadModule(moduleId)` - Manually unload a module.

- `getStatus()` - Get detailed information about the current carousel state. See [Events](#events) section for a full `CarouselStatus` breakdown

- `getCurrentPage()` - Get the current page index

- `getTotalPages()` - Get the total number of pages

- `getTotalSlides()` - Get the total number of slides

### Ready promise

- `ready` - Promise that resolves when carousel initialization and module loading are complete.
```ts
const carousel = ddcarousel({
    container: ".carousel"
});

await carousel.ready;
``` 

You can also initialize a carousel async:
```ts
const carousel = new Carousel();

await carousel.init({
    container: ".carousel"
});
```

## Events

ddcarousel provides a namespaced event system for listening to carousel lifecycle, page changes, dragging, stage updates, configuration changes and module events.

### Listening to events

Subscribe using `carousel.on()`:

```ts
import { EVENTS } from "ddcarousel";

carousel.on(EVENTS.PAGE_CHANGED, (event) => {
    console.log(event.currentPage);
});
```

Event names can also be passed directly as strings:

```ts
carousel.on("page:changed", (event) => {
    console.log(event.currentPage);
});
```

### Configuration events

Events can also be registered through the carousel configuration using the `on:` prefix:

```ts
const carousel = ddcarousel({
    container: ".carousel",
    "on:page:changed": (event) => {
        console.log(event.currentPage);
    }
});
```

For `carousel:initialize` to work, it must be registered with `on()`, before calling `init()`, because it is emitted before the configuration is initialized.

```ts
const carousel = new Carousel();

carousel.on(EVENTS.INITIALIZE, () => {
    console.log("Initializing...");
});

await carousel.init({
    container: ".carousel"
});
```

### Available events

- `carousel:initialize`
  Emitted immediately before carousel configuration and container initialization.

- `carousel:initialized`
  Emitted after the carousel and all enabled modules have finished initialization.

  **Callback:** Returns the full `CarouselStatus` object:
    - `state` - Current carousel lifecycle state `CarouselState`: `idle`, `initializing`, `ready`, `failed`, `destroying` or `destroyed`
    - `initialized` - Whether initialization has completed successfully
    - `currentPage` - Current page index
    - `totalPages` - Total number of pages
    - `slides` - Array of carousel slide elements
    - `totalSlides` - Total number of slides
    - `slidesByPage` - Slide indexes associated with each page
    - `visibleSlides` - Currently visible slide indexes
    - `config.current` - Current active carousel configuration
    - `currentTranslate` - Current stage translate position
    - `modules` - IDs of currently loaded modules
    - `closestSlidesIndexes` - Closest slide indexes relative to the current stage position

- `carousel:destroy`
  Emitted before the carousel is destroyed.

- `carousel:destroyed`
  Emitted after the carousel has been destroyed.

- `config:applied`
  Emitted when the active configuration changes, including responsive configuration changes. 

  **Callback:**

  - `default` - Default carousel configuration
  - `old` - Previous configuration
  - `new` - New active configuration
  - `isInternalOverride` - Whether the change was caused by an internal override

- `stage:created`
  Emitted after the carousel stage is created.

- `stage:changed`
  Emitted when the stage DOM structure changes.

- `stage:resized`
  Emitted when the carousel stage is resized.

- `page:change:request`
  Emitted when a page change is requested.

  **Callback:**

  - `index` - Requested page index or navigation command
  - `animate` - Whether the page change should be animated
  - `emit` - Whether related events should be emitted
  - `force` - Force the page change
  - `handled` - Whether the request has already been handled
  - `priority` - Current override priority
  - `source` - Optional source of the override

- `page:changed`
  Emitted after a page change has completed.

  **Callback:**

  - `currentPage` - Current page index
  - `currentTranslate` - Current stage position
  - `visibleSlides` - Indexes of currently visible slides

- `page:changed:index`
  Emitted before the active page index is changed. Modules can use this event to modify or override the requested page.

  **Callback:**

  - `request` - Original requested page
  - `page` - Resolved page index
  - `currentPage` - Current page index
  - `totalPages` - Total number of pages
  - `handled` - Whether the event has been handled
  - `priority` - Current override priority
  - `source` - Optional override source

- `page:change:scroll:before`
  Emitted immediately before the stage scroll position is applied.

- `page:change:scroll:after`
  Emitted after the stage scroll position has been applied.

  Both events `page:change:scroll:before` and `page:change:scroll:after` provide:

  - `currentPage` - Current page index
  - `slidesCount` - Total number of slides
  - `currentTranslate` - Current stage position
  - `visibleSlides` - Indexes of currently visible slides
  - `isForward` - Whether the carousel is moving forward
  - `handled` - Whether the event has been handled
  - `priority` - Current override priority
  - `source` - Optional override source

- `slide:scroll`
  Emitted when a slide scroll is requested.

  **Callback:**

  * `slide` - Target slide, when available
  * `animate` - Whether scrolling should be animated
  * `specifiedPosition` - Requested stage position
  * `handled` - Whether the event has been handled
  * `priority` - Current override priority
  * `source` - Optional override source

- `drag:start:pre`
  Emitted immediately before dragging starts. Primarily useful for modules that need to adjust drag-related state.

  **Callback:**

  - `currentTranslate` - Current stage position

- `drag:start`
  Emitted when dragging starts.

- `drag:dragging`
  Emitted continuously while dragging.

  **Callback:**

  - `currentTranslate` - Current stage position
  - `delta` - Current drag distance
  - `direction` - Drag direction (`left` or `right`)
  - `slideIndexLeft` - Closest slide to the left, when available
  - `slideIndexCenter` - Closest slide to the center, when available
  - `slideIndexRight` - Closest slide to the right, when available
  - `rebase` - Whether the drag position was rebased

- `drag:end`
  Emitted when dragging ends.

- `transition:end`
  Emitted when a carousel transition finishes.

- `module:loaded`
  Emitted when a module has been loaded.

- `module:initialized`
  Emitted after a module has completed initialization.

- `module:destroyed`
  Emitted after a module has been destroyed.

- `module:unloaded`
  Emitted after a module has been unloaded.

Each module lifecycle callback provides:

- `name` - Module name / ID

### Priority-based internal events

Some internal events support priority-based overrides used by modules. Higher-priority handlers can override lower-priority ones, while equal-priority override attempts are ignored. This is mainly intended for module interoperability.

Supported events:

- `page:change:request`
- `page:changed:index`
- `page:change:scroll:before`
- `page:change:scroll:after`
- `slide:scroll`

### Legacy events

Legacy v1.x event names are still supported for backwards compatibility, but are deprecated and will be removed in the next major version. Legacy events can still be used with `carousel.on()` or configuration keys, except `onInitialize`, which must be registered with `carousel.on()` before calling `init()`.
For new projects, use the v2 namespaced events instead. When upgrading, make sure to check events API for callback changes.

- `onInitialize`    -> `carousel:initialize`  
- `onInitialized`   -> `carousel:initialized` 
- `onDrag`          -> `drag:start`           
- `onDragging`      -> `drag:dragging`        
- `onDragged`       -> `drag:end`             
- `onTransitionend` -> `transition:end`       
- `onChanged`       -> `page:changed`         
- `onResized`       -> `stage:resized`        
- `onDestroy`       -> `carousel:destroy`     
- `onDestroyed`     -> `carousel:destroyed`   

## Building

1. Install dependencies
```
npm install
```
2. Use available npm scripts:
- `npm run build:all` - Create the full production build, generate and bundle TypeScript declarations, then clean up temporary type files
- `npm run build:prod` - Create the production JavaScript and CSS builds with Webpack
- `npm run build:dev` - Start the development server and watcher using the testing directory
- `npm run build:types` - Generate TypeScript declaration files
- `npm run type-check` - Run TypeScript type checking without emitting files
- `npm run bundle:types` - Bundle TypeScript declarations using API Extractor
- `npm run clean:types` - Remove temporary generated type files
- `npm test` - Run the Vitest test suite

Production builds are generated in the dist directory.

### Development build

`npm run build:dev` uses the `src/testing` directory as a local testing playground and builds the development ESM module and CSS there.

You can manually create an `index.html` file inside `src/testing`, add your own carousel HTML structure and use it to test the ESM build directly in the browser while developing.

The development server watches for source changes and rebuilds and reloads the page automatically.

### Production output

The final production package includes:

| File                    | Information                | Source Map |
| ----------------------- | -------------------------- | ---------- |
| `ddcarousel.esm.js`     | Modern ESM core            | ❌         |
| `ddcarousel-*.esm.js`   | Optional ESM modules       | ❌         |
| `ddcarousel.umd.js`     | Readable UMD browser build | ❌         |
| `ddcarousel.umd.min.js` | Minified UMD browser build | ✔️        |
| `ddcarousel.css`        | Readable CSS               | ❌         |
| `ddcarousel.min.css`    | Minified CSS               | ✔️        |
| `ddcarousel.d.ts`       | TypeScript declarations    | —          |

## Migrating from v1.x

v2.0 includes several breaking API changes, including renamed configuration options, a new namespaced event system, async initialization, a new module API,
updated browser build filenames and lifecycle changes.

Legacy event names remain temporarily supported, but use the new v2 event payloads.

See [CHANGELOG.md](./CHANGELOG.md) for all breaking changes.

## Contributing

Contributions are welcome! If you would like to report a bug, suggest a feature, improve the documentation, or contribute code, please read the [Contributing Guide](./CONTRIBUTING.md).

Following the contribution guidelines helps keep the project consistent and makes changes easier to review, test, and maintain.

Thank you in advance for taking the time to follow these guidelines and, most importantly, for choosing to contribute to the project. Any help is greatly appreciated! :)

## License

The code is released under the [MIT License](https://github.com/danaildinev/ddcarousel/blob/master/LICENSE).

:)

# Changelog

## v2.0.0 (2026 August)

Major TypeScript rewrite with a new modular architecture, modern ESM distribution, module lifecycle, and optimized production builds.

### ⚠️ Breaking Changes
- Replaced the previous v1.x browser files with explicit UMD builds:
    - `ddcarousel.js` -> `ddcarousel.umd.js`
    - `ddcarousel.min.js` -> `ddcarousel.umd.min.js`
- Renamed config options:
    - `dots` -> `pagination`
    - `lazyPreload` -> `lazyLoadPreload`
    - `lazyPreloadSlides` -> `lazyLoadPreloadSlides`
    - `resizeRefresh` -> `resizeDebounce`
    - `labelNavPrev` -> `navPrevContent` 
    - `labelNavNext` -> `navNextContent`
    - `touchMaxSlideDist` -> `dragMaxDistance`
    - `touchSwipeThreshold` -> `swipeThreshold`
- Renamed `getStatus().created` -> `getStatus().initialized` to better represent completed carousel initialization.
- Renamed `getStatus().activeSlides` -> `getStatus().visibleSlides` 
- Replaced module-specific methods in favor of the new module API:
    - `autoplayStart()` -> `module<Autoplay>(Autoplay.id).start()`
    - `autoplayStop()` -> `module<Autoplay>(Autoplay.id).stop()`
    - `goToUrl()` -> `module<UrlNav>(UrlNav.id).goToUrl()`;
- Replaced the v1.x event system with a new namespaced and strongly typed event API. 
- Removed the `callbacks` config option. Events no longer use a shared optional callback payload. The generic v1.x callback properties `container`, `event`, `currentSlides`, `currentPage`, `totalSlides`, and `totalPages` are no longer automatically included with every event. Each v2 event now provides its own event-specific payload. Legacy v1.x event names remain supported temporarily, but use the new v2 callback payloads and will be removed in the next major version.
- Destroyed `Carousel` instances can no longer be initialized again with `init()`. You must create a new carousel instance after calling `destroy()`.
- `init()` is now asynchronous and returns a `Promise<void>`, allowing initialization and module loading to be awaited.
- Changed `destroy(true)` behavior. Passing `true` now restores the container to its state before carousel initialization instead of fully clearing it.
- Changed the default value of `dragMaxDistance` to `0`, allowing unrestricted carousel dragging by default.
- Migrated carousel CSS classes to BEM naming. Custom CSS and selectors targeting the previous class names must be updated (for example: `.ddcarousel-item` -> `.ddcarousel__item` and etc...)
- Dropped support for old browsers and Internet Explorer. The JavaScript target is now ES2022, supported by modern browsers.

### Features & Improvements
- Added a new loop/infinite scrolling feature
- Added a new `gap` option for controlling spacing between slides
- Added a new `urlNavContainer` for specifying a custom URL navigation container
- Added new properties to `getStatus()`:
    - `state` - current carousel state
    - `slides` - array with carousel slides
    - `slidesByPage` - slide indexes for every page
    - `modules` - IDs of currently loaded modules
    - `closestSlidesIndexes` - closest slide indexes relative to the current stage position
- Added `carousel.ready` - a promise that resolves after carousel initialization and module loading have completed.
- Fixed a broken stage when `items` was set to `0` or a negative value. Invalid values now fall back to the default `items` value.
- Fixed `items` being mutated when the configured value exceeded the available slide count. The configured value is now preserved while the stage uses a clamped effective item count internally for layout, pagination, visible slides, and centering.
- Improved resize handling: stage size changes are detected automatically, with layout, slide positions, and responsive configuration recalculated after resizing has stopped to reduce unnecessary updates during continuous resizing.
- Removed the requirement to manually disable `autoHeight` when using `vertical`. Only the carousel height needs to be defined; child slide heights are now handled internally by the carousel styles.

### Drag & Interaction
- Added a new `dragSnapMode` option to control how the target slide is selected after dragging, either based on swipe direction or the slide closest to the center of the stage.
    - Enabling `dragSnapMode` also enables `centerSlide`.
    - Works best with `dragMaxDistance: 0`.
- Fixed unintended page changes when clicking the stage without dragging.
- Fixed dragging when `dragMaxDistance` is set to `0` or a negative value. A value of `0` now allows freely scrolling through the slides.
- Fixed touch dragging not working on touch devices
- Fixed dragging when using `vertical` and `centerSlide`
- Fixed multi-touch interactions interrupting an active drag by tracking and responding only to the active pointer.
- Fixed responsive configuration values not reverting when leaving a breakpoint. Properties defined only within responsive breakpoints now restore their original or default values when the breakpoint is no longer active.
- Improved drag cancellation handling, ensuring interrupted gestures revert cleanly.
- Replaced separate mouse and touch handling with the [Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent) input model, providing a unified implementation for mouse, touch, and pen input.
- Replaced the internal disabled stage state with the BEM modifier `.ddcarousel__stage--dragging`, which is added during active dragging and removed when it ends, while preserving the existing pointer-interaction behavior.

### Modules
- Implemented a new module system for a more modular and extensible architecture, with support planned for loading an external modules in the future. Several carousel features are now implemented as separate internal module:
    - Autoplay
    - Pagination
    - Loop
    - Lazy loading
    - Navigation
    - URL navigation
- Added dynamic loading of optional modules, reducing the core bundle size when those features are not enabled.
- Added module-level style loading with support for loading external CSS files, inline CSS injecting, or use both.
- Added module-specific classes with currently loaded modules into carousel container
- Added `carousel.module(Foo.id)` for retrieving loaded module instance
- Added `carousel.loadModule()` and `carousel.unloadModule()` methods for manually loading and unloading internal modules.
- Modules are now automatically loaded and unloaded when their related configuration changes, including responsive breakpoint changes.
- Add priority-based event overrides for modules. Modules can now use `tryOverridePriority()` to claim supported event payloads based on priority. 
    - Higher-priority handlers override the lower-priority ones
    - Equal-priority override attempts are ignored with a console warning.
    - Supported overridable events currently include:
        - page:change:request
        - page:change:scroll:before
        - page:change:scroll:after
        - page:changed:index
        - slide:scroll
    - These events now use the shared `PriorityPayload` structure containing `handled`, `priority`, and an optional `source`. Additional events may support priority-based overrides in future version.

### Events
- Implemented a new event-driven architecture to improve separation between carousel core and internal components and modules.
- Added new events:
    - `module:loaded` - emitted when a module has been loaded.
    - `module:initialized` - emitted after a module has completed initialization.
    - `module:unloaded` - emitted when a module has been unloaded.
    - `module:destroyed` - emitted after a module has been destroyed.
    - `module:autoplay:started` - emitted when autoplay starts.
    - `module:autoplay:stopped` - emitted when autoplay stops.
    - `drag:start:pre` emitted immediately before dragging starts, allowing internal modules to adjust drag-related state such as `currentTranslate`.
    - `page:change:request` - emitted whenever a user action or internal process requests a page change. `page:changed` is emitted after the page change completes successfully.
    - `page:changed:index` - emitted immediately before the active page index is changed, allowing modules to intercept and override the requested page.
    - `page:change:scroll:before` - emitted immediately before the stage begins scrolling to the requested page.
    - `page:change:scroll:after`- emitted after the stage has finished applying the requested scroll position.
    - `config:applied` - emitted when the active configuration changes after initialization, for example when entering or leaving a responsive breakpoint.
    - `stage:created` - emitted when stage has been created 
    - `stage:changed` - emitted when changes in DOM structure
    - `slide:scroll` - emitted when starts slide scrolling
- Fix `carousel:initialized` emitting too early before loading and initializing all modules 
- Renamed events for a more consistent namespaced event system.
- Event names passed to `carousel.on()` must not include the `on:` prefix. For example: `carousel.on(EVENTS.PAGE_CHANGED, callback)`
- `stage:resized` is now attached to carousel stage resizing instead of the global `window` resize event. When triggered, it recalculates slide dimensions and positions, updates the stage transform, and reapplies responsive configuration when necessary
- `drag:dragging` now exposes the current translate position, drag distance, direction, and nearby slide indexes.
- `carousel:initialized` now provides the current carousel state returned by `getStatus()`.
- `carousel:initialize` is now emitted before configuration initialization and container validation. Previously, it was emitted after both had already occurred.
- `carousel:initialize` can no longer be registered through the initial configuration because the event fires before that configuration is initialized. Register it with `carousel.on()` before calling `carousel.init(config)` instead.

### Styling & UI
- Added new CSS variables:
    - `--ddcarousel-bg-color`
    - `--ddcarousel-nav-color`
    - `--ddcarousel-nav-font-size` - navigation text size when using custom text instead of the default SVG icon
    - `--ddcarousel-url-nav-color`
    - `--ddcarousel-url-nav-color-active`
    - `--ddcarousel-dots-bottom`
    - `--ddcarousel-dot-size`
    - `--ddcarousel-dot-spacing`
    - `--ddcarousel-dot-color`
    - `--ddcarousel-dot-color-active`
    - `--ddcarousel-dot-radius`
	- `--ddcarousel-autoplay-animation`
	- `--ddcarousel-autoplay-bar-color`
    - `--ddcarousel-autoplay-bar-height`
    - `--ddcarousel-autoplay-speed` - autoplay progress animation duration, controlled internally by JavaScript
- Added a default navigation text color and a corresponding CSS variable
- Added a separate color for inactive pagination dots instead of relying on opacity
- Added a new design for navigation previous and next buttons
- Fixed incorrect carousel height when using `centerSlides` together with `autoHeight`
- Migrated carousel CSS class names to BEM naming for improved consistency and maintainability.
- Improved autoplay prograss bar animation by using GPU accelerated `transform` CSS property
- Improved pagination styling
- Replaced navigation previous and next button content with SVG chevron icons
- URL navigation now automatically marks the currently active item and updates it when the active slide changes.
- Autoplay progress bar animation is now handled with CSS animation and uses a new `active` class to toggle its visibility;
- Navigation arrows are now positioned relative to stage and moved to the sides
- Pagination dots are now placed relative to the stage and moved inside it by default
- Removed navigation buttons container
- Removed unnecessary wrapper element for URL navigation module

### Code & Architecture
- Rewritten the core in TypeScript for improved type safety and maintainability.
- Improved compatibility with React and Vue applications due to the architectural changes.
- Refactored multiple internal components and introduced additional performance improvements.
- Added public TypeScript exports for carousel configuration, state, events, payloads, and module APIs.

### Testing
- Added a Vitest + JSDOM test suite covering core carousel behavior, dragging, responsive configuration, events, stage updates, and module lifecycle.
- Added automated tests for Autoplay, Pagination, Navigation, URL Navigation, Lazy Load, and Loop modules.
- Added browser API mocks for `ResizeObserver` and `PointerEvent` to support reliable interaction and resize testing.

### Build & Distribution
- Added new ESM builds for modern bundlers. The main ESM entry point is now `dist/ddcarousel.esm.js`;
    - Additional `ddcarousel-*.esm.js` files are internal runtime chunks and should not be imported directly.
    - When self-hosting the ESM distribution, keep all generated `ddcarousel-*.esm.js` chunks alongside `ddcarousel.esm.js`.
- Switched to Webpack for building both development and production bundles.
- Added stronger Terser compression and identifier mangling to reduce production bundle size.
- Added dedicated production source maps for minified UMD and CSS builds
- Added a new non-minified CSS build: `ddcarousel.css`
- Added bundled TypeScript declarations in `dist/ddcarousel.d.ts`. 
- Added `dist` to `.gitignore`. Production build files must now be explicitly added when needed. This may prevent accidental commits of generated files.
- Added `unpkg` and `jsdelivr` package entry fields to expose the browser-ready build through CDN services.
- Added development ESM build for testing
- Refactored all npm scripts around the new build system:
    - `build:all` – runs the production build, generates and bundles TypeScript declarations, then cleans up removes temporary type files.
    - `build:prod` – creates the production build;
    - `build:dev` – starts a development server and watcher serving in-memory ESM module and CSS used by the project's `testing` directory. This replaces the old `testjs` and `watchsass` scripts;
    - `build:types` – generates TypeScript declaration files
    - `type-check` – runs TypeScript type checking without emitting files;
    - `bundle:types` – bundles TypeScript declarations using [API Extractor](https://api-extractor.com/);
    - `clean:types` – removes temporary TypeScript declaration files;
- Removed build dependencies, including `uglify-js`, `uglifycss`, `npm-run-all`, `copyfiles` (it wasn't used anyway lol). Minifying, CSS compilation, adding license banners to files and production build file structure are now handled by Webpack bundler.
- Reduced NPM package size by including only `dist` directory and standard package files such as the README, license, and changelog
- Improved Webpack configuration for library builds

### Deprecated
- Deprecating `refresh()`. Carousel refresh is now handled automatically on stage resize. Calling this method now outputs a console warning and performs no action;
- Legacy event names still remains supported for compatibility but will be removed in a future major version:
    - `onInitialize` -> `carousel:initialize`
    - `onInitialized` -> `carousel:initialized`,
    - `onDrag` -> `drag:start`
    - `onDragging` -> `drag:dragging`
    - `onDragged` -> `drag:end`
    - `onTransitionend` -> `transition:end`
    - `onChanged` -> `page:changed`
    - `onResized` -> `stage:resized`
    - `onDestroy` -> `carousel:destroy`
    - `onDestroyed` -> `carousel:destroyed`

## v1.4.2 (2026 March 12)
- Updated dependencies: bumped immutable and minimatch to the latest versions to address security vulnerabilities (CVE-2026-29063, CVE-2026-27903)

## v1.4.1 (2026 February 12)
- Bump version for npm re-publish

## v1.4 (2026 February 10)
- Added an option to enable lazy loading for images in slides
- Added an option to preload images in upcoming slides and an option to change the number of upcoming slides
- Added an option to pause autoplay when the tab is hidden to prevent background playback
- Added an option to show autoplay progress bar
- Added an option to navigate slides using the keyboard
- Fix autoplay repeatedly trying to go to the next page when already on the last page
- Fix autoplay not reseting timer when changing pages
- Changed default autoplay speed to 5 seconds
- Exposed more properties to `getStatus()` methods: current page, total pages, total slides, current active slides, current translate and current config
- Configure Babel preset-env to use Browserslist targets
- Updated generated header information for distribution files
- Updated some npm packages to latest versions
- Removed deprecated npm packages

## v1.3.1 (2021 March 31)
-   Updated 'y18n' package to latest version to fix a security vulnerability
-   Updated all packages to latest version

## v1.3 (2020 Sept 7)
-   Added new method to reinitialize carousel
-   Added new method to destroy carousel (revert container to state before initialization or fully wipe it)
-   Added new method to show carousel info
-   Added new destroy events
-   Added new option for vertical orientation that changes the width of the carousel relative to the longest slide inside
-   Changed navigation buttons content
-   You can now create an instance of carousel with empty config and initialize it later
-   You can now use carousel as module 
-   Fixed crash when container is empty
-   Fixed changing slides when set items to zero - now allows to show every items next each other
-   Fixed carousel crash when trying to change page with negative index
-   Fixed security vulnerability
-   Much smaller filesize due to changes in code structure
-   Code and project improvements
-   Updated packages
-   Improved and added new demos
-   Breaking changes in this version:
    - `DDCarousel()` is now `ddcarousel()`

## v1.2.1 (2020 Apr 15)
-   Improved auto height option
-   Auto height is now enabled by default and slider width is set to auto (if you disable auto height, you must to specify manually the height)
-   Fixed error when slider items are lower count than specified in the config
-   Improved navigation and dots - they won't show when there aren't any pages to slide
-   Pointer events are enabled only when mouse drag is enabled
-   Mouse drag is disabled by default

## v1.2 (2019 Nov 15)
-   Added full width option
-   Added option to show specified page number after init
-   Added autoplay option with options for speed, pause on hover/touch and methods for start/stop
-   Added option to toggle callback events (disabled by default)
-   Added option to control refresh speed of carousel when resizing the window
-   Reworked responsive option - you can specify set of options for different viewports
-   Improved events and resizing performance
-   Breaking changes in this version:
    -   `itemsPerPage` option is renamed to `items`
    -   `responsive` option is renamed to `fullWidth`
    -   `touch` option is renamed to `touchDrag`
    -   `touchMouse` option is renamed to `mouseDrag`
    -   `calculateStage()` method is replaced with `refresh()`
    -   `urlNav` will no longer enable automatically `itemPerPage`

## v1.1 (2019 Oct 15)
-   Added new vertical orientation feature
-   Added centered slide option
-   Added new url navigation
-   Added option to scroll one slide per page 
-   Added pages
-   Reworked and added 4 new events with callback and another way to listen 
-   Improved carousel swiping
-   Improved swiping easing
-   Improved compatibility with older browsers
-   ... and many small fixed bugs from previous version and code improvements to keep app relatively light

## v1.0.2 (2019 Sept 12)

-   Added Safari 8 support
-   Fixed `getCurrentPage()` method
-   Fixed stage selection with mouse when swiping the carousel on older Firefox versions
-   (Dev) Switched to SCSS style and added new build scripts

## v1.0.1 (2019 Sept 12)

-   Added IE10 support
-   Fixed stage subpixel problem between slides when scrolling
-   Fixed IE11 isInteger bug
-   Fixed IE11 demo
-   Fixed autoheight bug
-   Disabled text selection when swiping
-   (Dev) Code and babel optimizations

## v1.0.0 (2019 Sept 10)

-   Initial version.
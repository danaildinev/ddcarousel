# DDCarousel

![GitHub package.json version](https://img.shields.io/github/package-json/v/danaildinev/ddcarousel) ![Travis (.org) branch](https://img.shields.io/travis/danaildinev/ddcarousel/master) ![GitHub](https://img.shields.io/github/license/danaildinev/ddcarousel)

Simple and fast carousel slider written in vannila JS.

**Browser compatibility:** IE10+, Edge 15+, Chrome 37+, Firefox 32+, Opera 23+, Safari 6.2+, Safari iOS 9+

(May work on older browsers but these are minimum versions tested.)

## Getting started

This package can be installed with:

- [npm](https://www.npmjs.com/package/ddcarousel): `npm i ddcarousel`

Or download the [latest release](https://github.com/danaildinev/ddcarousel/releases).

## Usage

**Preparation**

Put the required base style and script:

```html
<link rel="stylesheet" href="css/ddcarousel.min.css" />
```

```html
<script src="js/ddcarousel.min.js"></script>
```

**Usage**

Wrap all items in container (`ddcarousel` is required class)

```html
<div class="sample ddcarousel">
	<div>Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
	<div>Lorem ipsum Placeat corrupti minus quia alias ullam error commodi recusandae dolores.</div>
</div>
```

Call the plugin when page is ready:

```js
ddcarousel({
	container: ".sample"
});
```
or
```js
var config = {
	container: ".sample"
},
carousel = ddcarousel();
carousel.init(config);
```

You can also import is as module. I tested it on **React** and it seems to work fine.

```
import 'ddcarousel/dist/ddcarousel.min.css';
import ddcarousel from 'ddcarousel';
```

## Options

- `container` - Slider container ID or class (string, required)

- `items` - Items per page (int, default: 1)

- `itemPerPage` - One item per page (boolean, default: false)

- `nav` - Show prev/next text (boolean, default: false)

- `dots` - Show dots (boolean, default: true)

- `autoHeight` - Change height based on current slide (boolean, default: true)

- `fullWidth` - Set container to full width (boolean, default: true)

- `centerSlide` - Centered slide (boolean, default: false)

- `startPage` - Set starting page (int, default: -1)

- `responsive` - Object with options for different queries (object, default: empty object)

- `lazyLoad` **(new)** - Lazy load all images for the current active slides (boolean, default: false)

- `lazyPreload` **(new)** - Preload images from next slide(s) (default - next 1 slide). Requires `lazyLoad: true`. (boolean, default: false)

- `lazyPreloadSlides` **(new)** - Specify how many slides to preload images. Requires `lazyPreload: true`. (boolean, default: 1)

- `urlNav` - Creates url navigation based navigation for slides (you may need to enagle `itemPerPage` for better experience). To use this feature, you must add `data-id` and `data-title` on every slide you want to include in nativagion. (boolean, default: false)

- `touchDrag` - Toggle touch drag (boolean, default: true)

- `mouseDrag` - Toggle mouse drag (boolean, default: false)

- `vertical` - Change to vertical orientation (boolean, default: false)

- `verticalMaxContentWidth` **(new)** - Changes the width of the carousel relative to the longest slide inside. When enabled it will turn off `fullWidth` option (boolean, default: false)

- `autoplay` - Autoplay feature (boolean, default: false)

- `autoplaySpeed` - Autoplay interval timeout (int, default: 2000)

- `autoplayPauseHover` - Pause autoplay on hover or touch (boolean, default: false)

- `callbacks` - Enable callback events (boolean, default: false)

- `labelNavPrev` - Label for nav previous button (string, default: "< Prev")

- `labelNavNext` - Label for nav next button (string, default: "Next >")

- `touchSwipeThreshold` - Changing slide sensitivity (int, default: 60)

- `touchMaxSlideDist` - Max swiping distance (int, default: 500)

- `slideChangeDuration` - Animation speed when changin slide (int, default: 0.5)

- `swipeSmooth` - Swiping smoothness (int, default: 0)

- `resizeRefresh` - Refresh rate of slider when resizing (int, default: 200)

## Methods

- `init()` **(new)** - Initialize carousel with config as method parameter.

- `destroy()` **(new)** - Destroy carousel. (revert container to state before initialization or fully wipe it with `destroy(true)`)

- `prevPage()` - Go to previous page

- `nextPage()` - Go to next page

- `changePage(id, enableAnim);` - Go to specified page (first parameter is page number: usable values - "next", "prev" or number; second parameter is toggling animation on/off when switching between pages)

- `refresh()` - Refresh carousel. Usable for example when changing carousel container size.

- `on(event, callback)` - Event listener

- `goToUrl(name, enableAnim)` - Go to specified slide title. `urlNav` must be enabled for this to work.

- `autoplayStart()` - Start autoplay (if enabled from options)

- `autoplayStop()` - Stop autoplay (if enabled from options)

- `getStatus()` **(new)** - Get carousel info (experimental feature)

- `getCurrentPage()` - Get the current page

- `getTotalPages()` - Get total pages count

- `getTotalSlides()` - Get total slides count

## Events

Using example:

```js
var carousel = ddcarousel({
	container: ".carousel",
	onInitialized: function (e) {
		console.log(e);
	}
});
// or like this..
carousel.on("onChanged", function (e) => {
	console.log(e);
});
```

- `onInitialize` - Before plugin init

- `onInitialized` - After plugin init

- `onDrag` - Started dragging carousel

- `onDragging` - Dragging carousel

- `onDragged` - Ended dragging slide

- `onTransitionend` - Dragging transition end

- `onChanged` - Changed page

- `onResized` - Carousel container width is changed (you can use it with `refresh()` method)

- `onDestroy` **(new)** - Begin destroying carousel

- `onDestroyed` **(new)** - After destroying carousel

**Note**: `onInitialize` and `onInitialized` events are working only when declared in plugin constructor (see first example)

## Building

Run these two commands in the root dir:

1. `npm install` (run once)
2. Open package.json and see available build scripts.

## License

The code is released under the [MIT License](https://github.com/danaildinev/ddcarousel/blob/master/LICENSE).

:)

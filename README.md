# DDCarousel

![GitHub package.json version](https://img.shields.io/github/package-json/v/danaildinev/ddcarousel) ![Travis (.org) branch](https://img.shields.io/travis/danaildinev/ddcarousel/master) ![GitHub](https://img.shields.io/github/license/danaildinev/ddcarousel)

Simple and fast carousel slider written in vannila JS.

**Browser compatibility:** IE10+, Edge 15+, Chrome 37+, Firefox 32+, Safari 6.2+, Safari iOS 9+

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

Wrap all items in container element with id/class:

```html
<div class="ddcarousel">
	<div>Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
	<div>Lorem ipsum Placeat corrupti minus quia alias ullam error commodi recusandae dolores.</div>
</div>
```

Give the container some height and width or leave them by default:

```css
.ddcarousel {
	width: 100%;
	height: 300px;
}
```

Call the plugin when page is ready:

```js
document.addEventListener("DOMContentLoaded", function(event) {
	var slider = new DDCarousel({
		container: ".ddcarousel"
	});
});
```

## Options

`container` Slider container ID or class (string, required)

`itemsPerPage` Items per page (int, default: 1)

`itemPerPage` One item per page (boolean, default: false)

`nav` Show prev/next text (boolean, default: false)

`dots` Show dots (boolean, default: true)

`autoHeight` Change height based on current slide (boolean, default: false)

`centerSlide` Centered slide (boolean, default: false)

`responsive` Responsive slider - overrides width given in css (boolean, default: false)

`urlNav` Creates url navigation based navigation for slides (This automatically enables `itemPerPage`). To use this feature, you must add `data-id` and `data-title` on every slide you want to include in nativagion. (boolean, default: false)

`touch` Toggle touch swiping (boolean, default: true)

`touchMouse` Toggle mouse swiping (boolean, default: true)

`vertical` Change to vertical orientation (boolean, default: false)

`labelNavPrev` Label for nav previous button (string, default: "< Prev")

`labelNavNext` Label for nav next button (string, default: "Next >")

`touchSwipeThreshold` Changing slide sensitivity (int, default: 60)

`touchMaxSlideDist` Max swiping distance (int, default: 500)

`slideChangeDuration` Animation speed when changin slide (int, default: 0.5)

`swipeSmooth` Swiping smoothness (int, default: 0)

## Methods

`prevPage()` Go to previous page

`nextPage()` Go to next page

`changePage(id, enableAnim);` Slides to specified page (first parameter is page number: usable values - "next", "prev" or number; second parameter is toggling animation on/off when switching between pages )

`calculateStage()` Recalculates stage and slides. It can be called when changing carousel container size.

`on(event, callback)` Event listener

`goToUrl(name, enableAnim)` Go to specified slide title. `urlNav` must be enabled for this to work.

`getCurrentPage()` Get the current page

`getTotalPages()` Get total pages count

`getTotalSlides()` Get total slides count

## Events

Using example:

```js
var dd = new DDCarousel({
	container: ".carousel",
	onInitialized: function (e) {
		console.log(e);
	}
});
// or like this..
dd.on("onChanged", function (e) => {
	console.log(e);
});
```

`onInitialize` Before plugin init

`onInitialized` After plugin init

`onDrag` Started dragging carousel

`onDragging` Dragging carousel

`onDragged` Ended dragging slide

`onTransitionend` Dragging transition end

`onChanged` Changed page

`onResized` Carousel container width is changed (you can use it with `calculateStage()` method)

## Building

Run these two commands in the root dir:

1. `npm install` (run once)
2. Open package.json and see available build scripts.

## License

The code is released under the [MIT License](https://github.com/danaildinev/ddcarousel/blob/master/LICENSE).

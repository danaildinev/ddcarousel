# DDCarousel

Simple and fast carousel slider written in vannila JS.

**Browser compatibility:** IE10+, Edge 15+, Chrome 37+, Firefox 32+, Safari 9.1+, Safari iOS 9+

(May work on older browsers but these are minimum versions tested.)

**Current status:** Alpha version (not stable and ready for using in real projects)

## Getting started

Two simple steps - download/clone repository and copy css and js from `dist` folder to your project.

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

`items` Items per page (int, default: 1)

`nav` Show prev/next text (boolean, default: false)

`dots` Show dots (boolean, default: true)

`autoHeight` Change height based on current slide (boolean, default: false)

`responsive` Responsive slider - overrides width given in css (boolean, default: false)

`touch` Toggle touch swiping (boolean, default: true)

`touchMouse` Toggle mouse swiping (boolean, default: true)

`labelNavPrev` Label for nav previous button (string, default: "< Prev")

`labelNavNext` Label for nav next button (string, default: "Next >")

`touchSwipeThreshold` Changing slide sensitivity (int, default: 60)

`touchMaxSlideDist` Max swiping distance (int, default: 500)

`slideChangeDuration` Animation speed when changin slide (int, default: 0.3)

`swipeSmooth` Swiping smoothness (int, default: 0.3)

## Methods

`prevSlide()` Go to previous side

`nextSlide()` Go to next side

`changeSlide(3);` Slides to slide with `data-slide="3"`

`calculateStage()` Recalculates stage and slides. It can be called when changing carousel container size.

`getCurrentSlide()` Get the current slide (works properly when items per row = 1)

`getCurrentPage()` Get the current page (works properly when dots are enabled and items per row > 1)

`getTotalSlides()` Get total slides count

## Events

Using example:

```js
ddcarusel.on("resized", () => {
	console.log("Carousel resized!");
});
```

`changed` Changed slide

`drag` Started dragging slide

`dragged` Ended dragging slide

`resized` Carousel container width is changed (you can use it with `calculateStage()` method)

## Building

Run these two commands in the root dir:

1. `npm install` (run once)
2. Open package.json and see available build scripts.

## License

The code is released under the [MIT License](https://github.com/danaildinev/ddcarousel/blob/master/LICENSE).

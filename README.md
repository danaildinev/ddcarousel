# DDCarousel

Simple and fast carousel slider written in vannila JS.

<!--**Browser compatibility:** IE11, Edge 15+, Chrome 37+, Firefox 32+, Safari 9.1+, Safari iOS 9+, Chrome Android 4.4+
(May work on older browsers but these are minimum versions tested.)-->

**Current status:** Alpha version (not stable and ready for using in real projects)

## Getting started

Two simple steps - download/clone repository and copy css and js from `dist` folder to your project.

## Usage

**Preparation**

Put the required base style and script:

```
<link rel="stylesheet" href="css/ddcarousel.min.css" />
```

```
<script src="js/ddcarousel.min.js"></script>
```

**Usage**

Wrap all items in container element with id/class:

```
<div class="ddcarousel">
    <div>Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
    <div>Lorem ipsum Placeat corrupti minus quia alias ullam error commodi recusandae dolores.</div>
</div>
```

Give the container some height and width or leave them by default:

```
.ddcarousel {
	width: 100%;
	height: 300px;
}
```

Call the plugin when page is ready:

```
document.addEventListener("DOMContentLoaded", function(event) {
	var slider = new DDCarousel({
		container: ".ddcarousel"
	});
});
```

## Options

`container: "ddcarousel"` Slider container ID or class (string, required)

`items: 1` Items per page (int, default: 1)

`nav: false` Show prev/next text (boolean, default: false)

`dots: true` Show dots (boolean, default: true)

`autoHeight: false` Change height based on current slide (boolean, default: false)

`responsive: false` Responsive slider - overrides width given in css (boolean, default: false)

`touch: true` Toggle touch swiping (boolean, default: true)

`touchMouse: true` Toggle mouse swiping (boolean, default: true)

`labelNavPrev: "< Prev"` Label for nav previous button (string)

`labelNavNext: "Next >"` Label for nav next button (string)

`touchSwipeThreshold: 60` Changing slide sensitivity (int, default: 60)

`touchMaxSlideDist: 500` Max swiping distance (int, default: 500)

`slideChangeDuration: 0.3` Animation speed when changin slide (int, default: 0.3)

`swipeSmooth: 0.3` Swiping smoothness (int, default: 0.3)

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

```
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

The code is released under the MIT License.

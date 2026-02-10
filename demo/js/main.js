var config = {
	default: {
		container: ".default",
	},
	items: {
		container: ".items",
		items: 3,
		nav: true,
		dots: false,
	},
	centered: {
		container: ".centered",
		items: 3,
		centerSlide: true,
	},
	autoHeight: {
		container: ".autoHeight",
		items: 3,
		itemPerPage: true,
	},
	responsive: {
		container: ".responsive",
		items: 3,
		nav: true,
		dots: false,
		responsive: {
			480: {
				items: 1,
				nav: false,
				dots: true,
			},
			768: {
				items: 2,
				fullWidth: true
			},
		}
	},
	vertical: {
		container: ".vertical",
		items: 2,
		itemPerPage: true,
		vertical: true,
		startPage: 2,
		autoHeight: false
	},
	url: {
		container: ".url",
		dots: false,
		urlNav: true,
	},
	lazy: {
		container: ".lazy",
		autoHeight: false,
		items: 2,
		lazyLoad: true,
		lazyPreload: true,
		lazyPreloadSlides: 2,
	},
	autoplay: {
		container: ".autoplay",
		autoplay: true,
		autoplaySpeed: 3000,
		autoplayPauseHover: true
	},
	disabledTouch: {
		container: ".disabledTouch",
		touchDrag: false
	},
	disabledMouse: {
		container: ".disabledMouse",
		mouseDrag: false
	},
	customLabels: {
		container: ".customLabels",
		dots: false,
		nav: true,
		labelNavPrev: "< Prev",
		labelNavNext: "Next >"
	},
	customAnim: {
		container: ".customAnim",
		items: 3,
		touchSwipeThreshold: 1,
		touchMaxSlideDist: 1000,
		swipeSmooth: 0.2,
		slideChangeDuration: 1.2
	},
	keyboardNav: {
		container: ".keyboardNav",
		items: 3,
		keyboardNavigation: true
	},
	events: {
		container: ".events",
		items: 2,
		touchSwipeThreshold: 1,
		swipeSmooth: 0.2,
		slideChangeDuration: 1.2,
		callbacks: true,
		onInitialize: function (e) {
			setActiveEvent(e.event);
		},
		onInitialized: function (e) {
			setActiveEvent(e.event);
		},
		onDrag: function (e) {
			setActiveEvent(e.event);
		},
		onDragging: function (e) {
			setActiveEvent(e.event);
		},
		onDragged: function (e) {
			setActiveEvent(e.event);
		},
		onChanged: function (e) {
			setActiveEvent(e.event);
		},
		onTransitionend: function (e) {
			setActiveEvent(e.event);
		},
		onResized: function (e) {
			setActiveEvent(e.event);
		},
		onDestroy: function (e) {
			setActiveEvent(e.event);
		},
		onDestroyed: function (e) {
			setActiveEvent(e.event);
		}
	}
};

function setActiveEvent(name) {
	writeLog(name);
	document.querySelector(".events-list [data-event='" + name + "']").className = "active";
	document.querySelector(".events-list [data-event='" + name + "'] .status").innerHTML = "on";
}

function writeLog(data) {
	document.getElementById("eventLog").innerHTML += data + "\r\n";
	document.getElementById("eventLog").scrollTop = document.getElementById("eventLog").scrollHeight;
}

document.addEventListener("DOMContentLoaded", function () {

	var navContents = document.querySelector("nav.contents"),
		status = document.querySelectorAll(".events-list .status"),
		eventClass = document.querySelectorAll(".events-list li"),
		srcTextareas = document.querySelectorAll("textarea[data-slider]"),
		carouselItem = document.createElement("div"),
		carousels = document.querySelectorAll(".ddcarousel"),
		item, src, i, j;

	//menu
	function navClose() {
		navContents.classList.remove("show");
		document.body.classList.remove("nav-opened");
	}
	document.getElementById("toggle-nav").addEventListener("click", function (e) {
		e.preventDefault();
		if (navContents.classList.contains("show")) {
			navClose();
		} else {
			navContents.classList.add("show");
			document.body.classList.add("nav-opened");
		}
	});
	window.addEventListener("hashchange", function () {
		navClose();
	});

	//populate carousels
	carouselItem.classList.add("box");
	for (i = 0; i < carousels.length; i++) {
		for (j = 1; j < 11; j++) {
			item = carouselItem.cloneNode(true);
			item.textContent = j;
			carousels[i].appendChild(item);
		}
	}

	//init carousels
	var defaultCarousel = ddcarousel(config['default']),
		items = ddcarousel(config['items']),
		centered = ddcarousel(config['centered']),
		autoHeight = ddcarousel(config['autoHeight']),
		responsive = ddcarousel(config['responsive']),
		vertical = ddcarousel(config['vertical']),
		url = ddcarousel(config['url']),
		autoplay = ddcarousel(config['autoplay']),
		disabledMouse = ddcarousel(config['disabledMouse']),
		disabledTouch = ddcarousel(config['disabledTouch']),
		customLabels = ddcarousel(config['customLabels']),
		customAnim = ddcarousel(config['customAnim']),
		events = ddcarousel(config['events']),
		lazy = ddcarousel(config['lazy']),
		keyboardNav = ddcarousel(config['keyboardNav']);

	//autoplay controls
	document.getElementById("apStop").addEventListener("click", function () {
		autoplay.autoplayStop();
	});
	document.getElementById("apStart").addEventListener("click", function () {
		autoplay.autoplayStart();
	});

	//resize button
	document.getElementById("resizeContainer").addEventListener("click", function () {
		document.querySelector(".ddcarousel.events").style.width = Math.floor(Math.random() * 80) + 50 + "%";
		writeLog("Carousel was resized. You can now refresh it.")

	});
	document.getElementById("eventsRefresh").addEventListener("click", function () {
		events.refresh();
	});

	//events
	for (i = 0; i < status.length; i++) {
		status[i].innerHTML = "off";
	}
	setInterval(function () {
		for (i = 0; i < status.length; i++) {
			status[i].innerHTML = "off";
		}
		for (j = 0; j < eventClass.length; j++) {
			eventClass[j].className = "";
		}
	}, 1000);

	//methods
	document.getElementById("eventsGoToSlide").addEventListener("click", function () {
		events.changePage(parseInt(document.getElementById("inputGoToSlide").value));
	});
	document.getElementById("eventsPrevSlide").addEventListener("click", function () {
		events.prevPage();
	});
	document.getElementById("eventsNextSlide").addEventListener("click", function () {
		events.nextPage();
	});
	document.getElementById("eventsGetStatus").addEventListener("click", function () {
		const status = events.getStatus();
		console.log(status);
		writeLog("getStatus()");
		writeLog(JSON.stringify(status, null, "  "));
		writeLog("End of getStatus()... Open your console and then you trigger again for more details.");
	});
	document.getElementById("eventsGetCurrentPage").addEventListener("click", function () {
		writeLog(events.getCurrentPage())
	});
	document.getElementById("eventsGetTotalPages").addEventListener("click", function () {
		writeLog(events.getTotalPages())
	});
	document.getElementById("eventsGetTotalSlides").addEventListener("click", function () {
		writeLog(events.getTotalSlides())
	});
	document.getElementById("eventsDestroyKeep").addEventListener("click", function () {
		events.destroy();
	});
	document.getElementById("eventsDestroy").addEventListener("click", function () {
		events.destroy(true);
	});
	document.getElementById("eventsInit").addEventListener("click", function () {
		events.init(config['events']);
	});
	document.getElementById("eventsAddSlide").addEventListener("click", function () {
		var slide = document.createElement("div");
		slide.classList.add("box");
		slide.textContent = "New slide " + Math.floor(Math.random() * 20);
		document.querySelector('.ddcarousel.events').appendChild(slide);
		writeLog("Added new slide. You can now initialize the carousel.")
	});

	//populate src textboxes
	for (i = 0; i < srcTextareas.length; i++) {
		var el = srcTextareas[i],
			source = {};

		Object.assign(source, config[el.getAttribute('data-slider')]);

		source['container'] = undefined;
		if (source !== undefined) {
			src = JSON.stringify(source, null, "  ");
			el.innerHTML = src.replace(/"([^"]+)":/g, '$1:');
		}
	}
});

//ie
if (!("classList" in document.documentElement) && Object.defineProperty && typeof HTMLElement !== "undefined") {
	Object.defineProperty(HTMLElement.prototype, "classList", {
		get: function () {
			var self = this;
			function update(fn) {
				return function (value) {
					var classes = self.className.split(/\s+/),
						index = classes.indexOf(value);

					fn(classes, index, value);
					self.className = classes.join(" ");
				};
			}

			var ret = {
				add: update(function (classes, index, value) {
					~index || classes.push(value);
				}),

				remove: update(function (classes, index) {
					~index && classes.splice(index, 1);
				}),

				contains: function (value) {
					return !!~self.className.split(/\s+/).indexOf(value);
				},

				item: function (i) {
					return self.className.split(/\s+/)[i] || null;
				}
			};

			Object.defineProperty(ret, "length", {
				get: function () {
					return self.className.split(/\s+/).length;
				}
			});

			return ret;
		}
	});
}

if (!Object.assign) {
	Object.defineProperty(Object, 'assign', {
		enumerable: false,
		configurable: true,
		writable: true,
		value: function (target) {
			'use strict';
			if (target === undefined || target === null) {
				throw new TypeError('Cannot convert first argument to object');
			}

			var to = Object(target);
			for (var i = 1; i < arguments.length; i++) {
				var nextSource = arguments[i];
				if (nextSource === undefined || nextSource === null) {
					continue;
				}
				nextSource = Object(nextSource);

				var keysArray = Object.keys(Object(nextSource));
				for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
					var nextKey = keysArray[nextIndex];
					var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
					if (desc !== undefined && desc.enumerable) {
						to[nextKey] = nextSource[nextKey];
					}
				}
			}
			return to;
		}
	});
}
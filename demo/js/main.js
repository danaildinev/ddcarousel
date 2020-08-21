var config = {
	default: {
		container: ".default",
	},
	items: {
		container: ".items",
		items: 3,
		nav: true,
		dots: false,
		mouseDrag: true
	},
	centered: {
		container: ".centered",
		items: 3,
		centerSlide: true,
		mouseDrag: true
	},
	autoHeight: {
		container: ".autoHeight",
		items: 3,
		itemPerPage: true,
		mouseDrag: true
	},
	responsive: {
		container: ".responsive",
		items: 3,
		nav: true,
		dots: false,
		mouseDrag: true,
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
		mouseDrag: true,
		autoHeight: false
	},
	url: {
		container: ".url",
		dots: false,
		urlNav: true,
		mouseDrag: true
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
	enabledMouse: {
		container: ".enabledMouse",
		mouseDrag: true
	},
	customLabels: {
		container: ".customLabels",
		dots: false,
		nav: true,
		labelNavPrev: "&#x2190;",
		labelNavNext: "&#x2192;"
	},
	customAnim: {
		container: ".customAnim",
		items: 3,
		mouseDrag: true,
		touchSwipeThreshold: 1,
		touchMaxSlideDist: 1000,
		swipeSmooth: 0.2,
		slideChangeDuration: 1.2
	},
	events: {
		container: ".events",
		items: 3,
		mouseDrag: true,
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
		}
	}
};

function setActiveEvent(name) {
	document.getElementById("eventLog").innerHTML += name + "\r\n";
	document.getElementById("eventLog").scrollTop = document.getElementById("eventLog").scrollHeight;

	document.querySelector(".events-list [data-event='" + name + "']").className = "active";
	document.querySelector(".events-list [data-event='" + name + "'] .status").innerHTML = "on";
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
	var defaultCarousel = DDCarousel(config['default']),
		items = DDCarousel(config['items']),
		centered = DDCarousel(config['centered']),
		autoHeight = DDCarousel(config['autoHeight']),
		responsive = DDCarousel(config['responsive']),
		vertical = DDCarousel(config['vertical']),
		url = DDCarousel(config['url']),
		autoplay = DDCarousel(config['autoplay']),
		enabledmouse = DDCarousel(config['enabledMouse']),
		disabledTouch = DDCarousel(config['disabledTouch']),
		customLabels = DDCarousel(config['customLabels']),
		customAnim = DDCarousel(config['customAnim']),
		events = DDCarousel(config['events']);

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

	//populate src textboxes
	for (i = 0; i < srcTextareas.length; i++) {
		var el = srcTextareas[i],
			source = { ...config[el.getAttribute('data-slider')] };

		source['container'] = undefined;
		if (source !== undefined) {
			src = JSON.stringify(source, null, "  ");
			el.innerHTML = src.replace(/"([^"]+)":/g, '$1:');
		}
	}
});

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
document.addEventListener("DOMContentLoaded", () => {
	const log = document.getElementById("eventLog"),
		navContents = document.querySelector("nav.contents"),
		eventItem = document.querySelectorAll(".events-list li");

	// set initial value to event labels
	function resetEventLabels() {
		for (i = 0; i < eventItem.length; i++) {
			eventItem[i].className = "";
			eventItem[i].querySelector(".status").innerHTML = "off";
		}
	}
	resetEventLabels();
	setInterval(() => resetEventLabels(), 1000);

	// populate carousels with placeholder items inside
	const carousels = document.querySelectorAll(".ddcarousel"),
		carouselItem = document.createElement("div");
	carouselItem.classList.add("box");
	for (let i = 0; i < carousels.length; i++) {
		for (let j = 1; j < 11; j++) {
			const item = carouselItem.cloneNode(true);
			item.textContent = j;
			carousels[i].appendChild(item);
		}
	}

	function navClose() {
		navContents.classList.remove("show");
		document.body.classList.remove("nav-opened");
	}

	function writeLog(data) {
		log.innerHTML += data + "\r\n";
		log.scrollTop = log.scrollHeight;
	}

	function setActiveEvent(name) {
		writeLog(name);
		const event = document.querySelector(`.events-list [data-event='${name}']`);
		event.className = "active";
		event.querySelector(".status").innerHTML = "on";
	}

	function addSlide() {
		var slide = document.createElement("div");
		slide.classList.add("box");
		slide.textContent = "New slide " + Math.floor(Math.random() * 20);
		document.querySelector('.ddcarousel.events').appendChild(slide);
		writeLog("Added new slide. You can now initialize the carousel.")
	}

	function getStatus() {
		const status = events.getStatus();
		console.log(status);
		writeLog(`${getStatus()}\r\n${JSON.stringify(status, null, "  ")}\r\nEnd of getStatus()! Open your console and then you trigger again for more details.`);
	}

	function toggleNav() {
		e.preventDefault();
		if (navContents.classList.contains("show")) {
			navClose();
		} else {
			navContents.classList.add("show");
			document.body.classList.add("nav-opened");
		}
	}

	document.getElementById("toggle-nav").addEventListener("click", () => toggleNav());
	window.addEventListener("hashchange", () => navClose());

	const carouselConfigs = {
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
			items: 3,
			container: ".autoHeight",
			itemPerPage: true,
		},
		responsive: {
			container: ".responsive",
			nav: true,
			dots: false,
			items: 3,
			autoplay: false,
			responsive: {
				768: {
					items: 2,
					dots: true,
					nav: false,
					autoplay: true
				},
				480: {
					items: 1,
					dots: true,
					nav: false,
					autoplay: true
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
			items: 3,
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
			keyboardNavigation: true
		},
		events: {
			container: ".events",
			items: 3,
			startPage: 1,
			autoplay: true,
			responsive: {
				700: {
					items: 2
				},
				500: {
					items: 1
				}
			},
			"on:carousel:initalize": e => setActiveEvent("carousel:initalize", e),
			"on:carousel:initalized": e => setActiveEvent("carousel:initalized", e),
			"on:module:created": e => setActiveEvent("module:created", e),
			"on:module:initialized": e => setActiveEvent("module:initialized", e),
			"on:module:destroyed": e => setActiveEvent("module:destroyed", e),
			"on:module:autoplay:started": e => setActiveEvent("module:autoplay:started", e),
			"on:module:autoplay:stopped": e => setActiveEvent("module:autoplay:stopped", e),
			"on:stage:created": e => setActiveEvent("stage:created", e),
			"on:stage:resized": e => setActiveEvent("stage:resized", e),
			"on:page:change": e => setActiveEvent("page:change", e),
			"on:page:change:request": e => setActiveEvent("page:change:request", e),
			"on:transition:end": e => setActiveEvent("transition:end", e),
			"on:drag:start": e => setActiveEvent("drag:start", e),
			"on:drag:dragging": e => setActiveEvent("drag:dragging", e),
			"on:drag:end": e => setActiveEvent("drag:end", e),
			"on:config:changed": e => setActiveEvent("config:changed", e),
		}
	};

	// populate src textboxes
	const textareas = document.querySelectorAll("textarea[data-slider]");
	for (let i = 0; i < textareas.length; i++) {
		const textarea = textareas[i],
			code = {};

		Object.assign(code, carouselConfigs[textarea.dataset.slider]);
		code['container'] = undefined;
		if (code !== undefined) {
			const text = JSON.stringify(code, null, "  ");
			textarea.innerHTML = text.replace(/"([^"]+)":/g, '$1:');
		}
	}

	// initialize carousels
	for (const [key, value] of Object.entries(carouselConfigs)) {
		if (key === "events" || key === "autoplay")
			continue;
		ddcarousel(value);
	}
	const events = ddcarousel(carouselConfigs['events']),
		autoplay = ddcarousel(carouselConfigs['autoplay']);

	function resizeContainer() {
		document.querySelector(".ddcarousel.events").style.width = Math.floor(Math.random() * 80) + 20 + "%";
	}

	document.getElementById("apStop").addEventListener("click", () => autoplay.module("autoplay").stop());
	document.getElementById("apStart").addEventListener("click", () => autoplay.module("autoplay").start());
	document.getElementById("resizeContainer").addEventListener("click", () => resizeContainer());

	document.getElementById("eventsApStart").addEventListener("click", () => events.module("autoplay").start());
	document.getElementById("eventsApStop").addEventListener("click", () => events.module("autoplay").stop());
	document.getElementById("eventsGoToSlide").addEventListener("click", () => events.changePage(parseInt(document.getElementById("inputGoToSlide").value)));
	document.getElementById("eventsPrevSlide").addEventListener("click", () => events.prevPage());
	document.getElementById("eventsNextSlide").addEventListener("click", () => events.nextPage());
	document.getElementById("eventsGetCurrentPage").addEventListener("click", () => writeLog(events.getCurrentPage()));
	document.getElementById("eventsGetTotalPages").addEventListener("click", () => writeLog(events.getTotalPages()));
	document.getElementById("eventsGetTotalSlides").addEventListener("click", () => writeLog(events.getTotalSlides()));
	document.getElementById("eventsDestroyKeep").addEventListener("click", () => events.destroy());
	document.getElementById("eventsDestroy").addEventListener("click", () => events.destroy(true));
	document.getElementById("eventsInit").addEventListener("click", () => events.init(carouselConfigs['events']));
	document.getElementById("eventsAddSlide").addEventListener("click", () => addSlide());
	document.getElementById("eventsGetStatus").addEventListener("click", () => getStatus());
});
document.addEventListener("DOMContentLoaded", function () {

	var navContents = document.querySelector("nav.contents");
	document.getElementById("toggle-nav").addEventListener("click", function (e) {
		e.preventDefault();
		if (navContents.classList.contains("show")) {
			navContents.classList.remove("show");
			document.body.classList.remove("nav-opened");
		} else {
			navContents.classList.add("show");
			document.body.classList.add("nav-opened");
		}
	});

	var defaultCarousel = new DDCarousel({
		container: ".default"
	});

	var items = new DDCarousel({
		container: ".items",
		items: 3,
		nav: true,
		dots: false
	});

	var centered = new DDCarousel({
		container: ".centered",
		items: 3,
		centerSlide: true
	});

	var autoHeight = new DDCarousel({
		container: ".autoHeight",
		items: 3,
		itemPerPage: true,
		autoHeight: true
	});

	var responsive = new DDCarousel({
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
	});

	var vertical = new DDCarousel({
		container: ".vertical",
		items: 2,
		itemPerPage: true,
		vertical: true,
		startPage: 2
	});

	var url = new DDCarousel({
		container: ".url",
		dots: false,
		urlNav: true
	});

	var autoplay = new DDCarousel({
		container: ".autoplay",
		autoplay: true,
		autoplaySpeed: 3000,
		autoplayPauseHover: true
	});

	document.getElementById("apStop").addEventListener("click", function () {
		autoplay.autoplayStop();
	});

	document.getElementById("apStart").addEventListener("click", function () {
		autoplay.autoplayStart();
	});

	var disabledTouch = new DDCarousel({
		container: ".disabledTouch",
		touchDrag: false
	});

	var disabledTouchMouse = new DDCarousel({
		container: ".disabledTouchMouse",
		mouseDrag: false
	});

	var customLabels = new DDCarousel({
		container: ".customLabels",
		dots: false,
		nav: true,
		labelNavPrev: "&#x2190;",
		labelNavNext: "&#x2192;"
	});

	var customAnimConfig = new DDCarousel({
		container: ".customAnimConfig",
		items: 3,
		touchSwipeThreshold: 1,
		touchMaxSlideDist: 1000,
		swipeSmooth: 0.2,
		slideChangeDuration: 1.2
	});

	var eventsExample = new DDCarousel({
		container: ".eventsExample",
		items: 3,
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
	});

	document.getElementById("resizeContainer").addEventListener("click", function () {
		document.getElementsByClassName("eventsExample")[0].style.width = Math.floor(Math.random() * 80) + 50 + "%";
		eventsExample.refresh();
	});

	var status = document.querySelectorAll(".events-list .status");
	var eventClass = document.querySelectorAll(".events-list li");
	for (var index = 0; index < status.length; index++) {
		status[index].innerHTML = "off";
	}

	setInterval(function () {
		for (var index = 0; index < status.length; index++) {
			status[index].innerHTML = "off";
		}
		for (var i = 0; i < eventClass.length; i++) {
			eventClass[i].className = "";
		}
	}, 1000);

	function setActiveEvent(name) {
		document.getElementById("eventLog").innerHTML += name + "\r\n";
		document.getElementById("eventLog").scrollTop = document.getElementById("eventLog").scrollHeight;

		document.querySelector(".events-list [data-event='" + name + "']").className = "active";
		document.querySelector(".events-list [data-event='" + name + "'] .status").innerHTML = "on";
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
/*! DDCarousel 1.1 by Danail Dinev 2019 | License: https://github.com/danaildinev/ddcarousel/blob/master/LICENSE */
class DDCarousel {
	appName = "DDCarousel";

	cCont = "ddcarousel-container";
	cStage = "ddcarousel-stage";
	cNav = "ddcarousel-nav";
	cItem = "ddcarousel-item";
	cResp = "ddcarousel-responsive";
	cDSlide = "data-slide";
	cContDots = "ddcarousel-dots";
	cDot = "ddcarousel-dot";
	cPrev = "ddcarousel-prev";
	cNext = "ddcarousel-next";
	cVert = "ddcarousel-vertical";

	constructor(options) {
		this.init = false;
		this.currentPage = 0;
		this.triggers = [
			"onInitialize",
			"onInitialized",
			"onDrag",
			"onDragging",
			"onDragged",
			"onChanged",
			"onTransitionend",
			"onResized"
		];

		this.config = this.updateSettings(options);
		if (this.checkContainer(this.config.container)) {
			this.triggerHandler("onInitialize", { container: this.container, event: "onInitialize" });
			this.createStage();
			this.setActiveSlides();
			this.calculateStage();
			this.createNav();
			this.createDots();
			this.attachEvents();
			this.setActiveDot();
			this.updateSlide();
			if (this.config.nav) this.refreshNav();
		}
	}

	updateSettings(options) {
		var settings = {
			container: ".ddcarousel",
			nav: false,
			dots: true,
			autoHeight: false,
			itemsPerPage: 1,
			itemPerPage: false,
			responsive: false,
			vertical: false,
			touch: true,
			touchMouse: true,
			centerSlide: false,
			touchSwipeThreshold: 60,
			touchMaxSlideDist: 500,
			swipeSmooth: 0,
			slideChangeDuration: 0.5,
			labelNavPrev: "< Prev",
			labelNavNext: "Next >"
		};

		this.triggers.forEach(el => {
			settings[el] = () => { };
			this.on(el, e => {
				this.config[el].call(this, e != undefined ? e : this.callback(el));
			});
		});

		for (var name in options) {
			settings[name] = options[name];
		}

		return settings;
	}

	callback(event) {
		var callback = {
			container: this.container,
			event: event,
			currentSlides: this.activeSlides,
			currentPage: this.getCurrentPage(),
			totalSlides: this.getTotalSlides(),
			totalPages: this.getTotalPages()
		};

		return callback;
	}

	on(event, callback) {
		if (!this.triggers[event]) this.triggers[event] = [];
		this.triggers[event].push(callback);
	}

	triggerHandler(event, callback) {
		if (this.triggers[event]) {
			for (var i in this.triggers[event]) this.triggers[event][i](callback);
		}
	}

	checkContainer(name) {
		var contName = name.substring(1);
		if (name.substring(0, 1) == "#") {
			if (document.getElementById(contName) != null) {
				this.container = document.getElementById(containerNameClear);
				this.containerName = name;
				return true;
			}
		} else if (name.substring(0, 1) == ".") {
			if (document.getElementsByClassName(contName)[0] != null) {
				this.container = document.getElementsByClassName(contName)[0];
				this.containerName = name;
				return true;
			}
		} else {
			console.error(`${this.appName}: Invalid container!`);
			return false;
		}
	}

	createStage() {
		var stageContainer = document.createElement("div"),
			stageDiv = document.createElement("div");

		stageContainer.classList.add(this.cCont);
		stageDiv.classList.add(this.cStage);

		//get all slides from user
		this.slidesSource = document.querySelectorAll(`${this.containerName} > div`);

		//add the stage to the main container
		this.container.appendChild(stageContainer);
		stageContainer.appendChild(stageDiv);

		//get stage DOM
		this.stage = document.querySelector(`${this.containerName} .${this.cStage}`);
		//set width to 100% if responsive is enabled and change container width
		if (this.config.responsive) {
			this.container.classList.add(this.cResp);
		}

		if (this.config.vertical) {
			this.container.classList.add(this.cVert);
		}

		//set parameters to slides and add them in the new ddcarousel-item container with some params
		for (var i = 0; i < this.slidesSource.length; i++) {
			var s = document.createElement("div");
			s.classList.add(this.cItem);
			s.setAttribute(this.cDSlide, i);
			s.appendChild(this.slidesSource[i]);
			stageDiv.appendChild(s);
		}

		//get all slides and total pages
		this.slides = document.querySelectorAll(`${this.containerName} .${this.cItem}`);

		if (this.config.centerSlide) {
			this.totalPages = this.slides.length - 1
		} else if (this.config.itemPerPage) {
			this.totalPages = this.slides.length - this.config.itemsPerPage
		} else {
			this.totalPages = Math.ceil(this.slides.length / this.config.itemsPerPage) - 1;
		}
	}

	calculateStage() {
		var slideWidth = this.slides[0].style.width,
			containerWidth = parseInt(window.getComputedStyle(this.container).width),
			containerHeight = parseInt(window.getComputedStyle(this.container).height);

		this.slidesHeights = [];
		for (var i = 0; i < this.slides.length; i++) {
			//set current slide size
			if (this.config.itemsPerPage == null && this.config.vertical) {
				this.slides[i].style.width = containerWidth + "px";
			} else if (this.config.vertical) {
				this.slides[i].style.height = containerHeight / this.config.itemsPerPage + "px";
			} else if (!this.config.vertical) {
				this.slides[i].style.width = containerWidth / this.config.itemsPerPage + "px";
			}
			this.slidesHeights.push(
				document.querySelector(`${this.containerName} [${this.cDSlide}="${i}"] > div`).scrollHeight
			);
		}

		if (this.config.autoHeight) {
			this.calculateContainerHeight(this.currentPage);
		}

		if (slideWidth != this.slides[0].style.width) this.triggerHandler("onResized");

		if (!this.init) {
			if (
				this.slides.length == this.slidesSource.length &&
				document.querySelectorAll(`${this.containerName} .${this.cStage} [${this.cDSlide}]`).length > 0
			) {
				this.init = true;
				this.triggerHandler("onInitialized");
			}
		}
	}

	createNav() {
		if (this.config.nav) {
			var navContainer = document.createElement("div"),
				leftBtn = document.createElement("button"),
				rightBtn = document.createElement("button");

			navContainer.classList.add(this.cNav);

			leftBtn.classList.add(this.cPrev);
			leftBtn.innerHTML = this.config.labelNavPrev;

			rightBtn.classList.add(this.cNext);
			rightBtn.innerHTML = this.config.labelNavNext;

			//add buttons in nav container
			navContainer.appendChild(leftBtn);
			navContainer.appendChild(rightBtn);

			this.container.appendChild(navContainer);

			this.navPrevBtn = document.querySelector(`${this.containerName} .${this.cPrev}`);
			this.navNextBtn = document.querySelector(`${this.containerName} .${this.cNext}`);
		}
	}

	createDots() {
		if (this.config.dots) {
			var targetSlidesLenght,
				navContainer = document.createElement("div");
			navContainer.classList.add(this.cContDots);

			if (this.config.itemsPerPage > 1) {
				targetSlidesLenght = this.config.centerSlide ? this.slides.length : this.totalPages + 1;
			} else {
				targetSlidesLenght = this.slides.length;
			}

			for (var i = 0; i < targetSlidesLenght; i++) {
				var dot = document.createElement("button");
				dot.classList.add(this.cDot);
				dot.setAttribute(this.cDSlide, i);
				dot.addEventListener("click", e => this.changePage(parseInt(e.target.getAttribute(this.cDSlide))));

				navContainer.appendChild(dot);
			}

			this.container.appendChild(navContainer);
		}
	}

	attachEvents() {
		//nav buttons
		if (this.config.nav) {
			this.navPrevBtn.addEventListener("click", () => this.prevPage());
			this.navNextBtn.addEventListener("click", () => this.nextPage());
			this.on("onChanged", () => {
				this.refreshNav();
			});
		}

		//responsive
		if (this.config.responsive) {
			window.addEventListener("resize", () => {
				this.calculateStage();
				this.scrollToSlide(this.getCurrentSlideDom());
			});
		}

		//anim
		var transitionEvent = this.whichTransitionEvent();
		transitionEvent &&
			this.stage.addEventListener(transitionEvent, () => {
				this.triggerHandler("onTransitionend");
			});

		//touch events
		this.attachTouchEvents();
	}

	attachTouchEvents() {
		var eventsStart = [],
			eventsMove = [],
			eventsEnd = [];

		//add events based on options
		if (this.config.touch) {
			eventsStart.push("touchstart");
			eventsMove.push("touchmove");
			eventsEnd.push("touchend");
		}
		if (this.config.touchMouse) {
			eventsStart.push("mousedown");
			eventsMove.push("mousemove");
			eventsEnd.push("mouseup");
		}

		eventsStart.forEach(el => {
			this.draggingStart(el);
		});

		eventsEnd.forEach(el => {
			this.draggingEnd(el);
		});

		eventsMove.forEach(el => {
			this.dragging(el);
		});
	}

	draggingStart(el) {
		window.addEventListener(
			el,
			e => {
				if (e.target == this.stage) {
					this.isDragging = true;

					//set some starting values
					this.touchStartRaw =
						e.type == "mousedown" && this.config.touchMouse
							? (this.config.vertical ? e.clientY : e.clientX)
							: (this.config.vertical ? e.targetTouches[0].clientY : e.targetTouches[0].clientX);
					this.touchStart = this.touchStartRaw + -this.currentTranslate;

					//remember orig position
					this.origPosition = this.currentTranslate;
					this.dontChange = false;

					this.triggerHandler("onDrag");
				}
			},
			{ passive: true }
		);
	}

	dragging(el) {
		window.addEventListener(
			el,
			e => {
				if (this.isDragging) {
					var input;
					if (e.type == "mousemove" && this.config.touchMouse) {
						input = this.config.vertical ? e.clientY : e.clientX;
					} else if (e.type == "touchmove") {
						input = this.config.vertical ? e.targetTouches[0].pageY : e.targetTouches[0].pageX;
					}

					//disable transition to get more responsive dragging
					this.stage.style.transitionDuration = this.config.swipeSmooth + "s";

					//calcualte swipe distance between starging value cnd current value
					this.swipeDistance = Math.abs(input - this.touchStartRaw);

					//get the current touch
					this.currentTouch = input - this.touchStart;

					//move slider until max swipe lenght is reached
					if (this.swipeDistance <= this.config.touchMaxSlideDist) {
						this.triggerHandler("onDragging");
						this.scrollToPos(this.currentTouch);
					} else {
						this.dontChange = true;
						this.currentTouch = input - this.touchStart;
					}
				}
			},
			{ passive: true }
		);
	}

	draggingEnd(el) {
		window.addEventListener(el, () => {
			if (this.isDragging) {
				//check if swipe distance is enough to change slide or stay on the same
				this.triggerHandler("onDragged");

				if (this.swipeDistance >= this.config.touchSwipeThreshold && !this.dontChange) {
					if (this.currentTouch > this.origPosition) {
						this.prevPage();
					} else {
						this.nextPage();
					}
				} else {
					this.scrollToPos(this.origPosition);
				}

				this.stage.style.transitionDuration = this.config.slideChangeDuration + "s";
				this.isDragging = false;
			}
		});
	}

	refreshNav() {
		if (this.currentPage == 0) {
			this.navPrevBtn.classList.add("inactive");
			this.navNextBtn.classList.remove("inactive");
		} else if (this.currentPage == this.getTotalPages()) {
			this.navPrevBtn.classList.remove("inactive");
			this.navNextBtn.classList.add("inactive");
		} else {
			this.navPrevBtn.classList.remove("inactive");
			this.navNextBtn.classList.remove("inactive");
		}
	}

	scrollToSlide(slide) {
		this.currentTranslate = -this.getSlidePos(slide);
		this.scrollToPos(this.currentTranslate);
	}

	scrollToPos(int) {
		const isSafari8 = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
		var output = this.config.vertical ? `translateY(${int}px)` : `translateX(${int}px)`;
		if (isSafari8) {
			this.stage.style.webkitTransform = output;
		} else {
			this.stage.style.transform = output;
		}
	}

	calculateContainerHeight() {
		if (this.config.itemsPerPage == 1) {
			this.container.style.height = this.slidesHeights[this.currentPage] + "px";
		} else {
			var heights = [];

			//get specified slides from global array with heights and then get the highest of it
			for (var i = this.activeSlides[0]; i <= this.activeSlides[this.activeSlides.length - 1]; i++) {
				heights.push(this.slidesHeights[i]);
			}
			this.container.style.height = Math.max(...heights) + "px";
		}
	}
	changePage(index) {
		var old = this.currentPage;

		this.stage.style.transitionDuration = this.config.slideChangeDuration + "s";

		//change slide based on parameter
		if (index == "prev") {
			if (this.currentPage != 0) {
				this.currentPage--;
			}
		} else if (index == "next") {
			if (this.currentPage < this.totalPages) {
				this.currentPage++;
			}
		} else if (Number.isInteger(index) && index <= this.totalPages) {
			this.currentPage = index;
		}

		//update frontend
		this.setActiveSlides();
		this.setActiveDot();
		this.updateSlide();

		//change stage height if this options is enabled
		if (this.config.autoHeight) {
			this.calculateContainerHeight(this.getCurrentSlideDom());
		}

		//fire change trigger
		if (old != this.currentPage) {
			this.triggerHandler("onChanged");
		}
	}

	updateSlide() {
		if (this.config.centerSlide) {
			var output =
				-this.getSlidePos(this.getCurrentSlideDom()) -
				-(parseInt(this.getSlideStyle().width) * Math.floor(this.config.itemsPerPage / 2));

			this.currentTranslate = output;
			this.scrollToPos(output);
		} else {
			this.scrollToSlide(this.getCurrentSlideDom());
		}
	}

	setActiveSlides() {
		if (this.activeSlides != null) {
			this.activeSlides.forEach(i => {
				document.querySelector(`${this.containerName} [${this.cDSlide}="${i}"]`).classList.remove("active");
			});
		}

		this.activeSlides = [];
		if (this.config.centerSlide) {
			this.activeSlides.push(this.currentPage);
		} else if (this.config.itemPerPage) {
			for (
				var index = this.currentPage;
				index < this.currentPage + this.config.itemsPerPage;
				index++
			) {
				this.activeSlides.push(index);
			}
		} else {
			if (this.getSlideIndexForPage() + this.config.itemsPerPage > this.getTotalSlides()) {
				for (
					var index = this.slides.length - this.config.itemsPerPage;
					index < this.getTotalSlides();
					index++
				) {
					this.activeSlides.push(index);
				}
			} else {
				for (
					var index = this.getSlideIndexForPage();
					index < this.getSlideIndexForPage() + this.config.itemsPerPage;
					index++
				) {
					if (index < this.slides.length) {
						this.activeSlides.push(index);
					}
				}
			}
		}

		this.activeSlides.forEach(i => {
			document.querySelector(`${this.containerName} [${this.cDSlide}="${i}"]`).classList.add("active");
		});
	}

	setActiveDot() {
		if (this.config.dots) {
			var a = document.querySelector(`${this.containerName} .${this.cDot}[${this.cDSlide}].active`);
			if (a != null) a.classList.remove("active");

			document
				.querySelector(`${this.containerName} .${this.cDot}[${this.cDSlide}="${this.currentPage}"]`)
				.classList.add("active");
		}
	}

	nextPage() {
		this.changePage("next");
	}

	prevPage() {
		this.changePage("prev");
	}

	getSlideIndexForPage() {
		return this.currentPage * this.config.itemsPerPage;
	}

	getCurrentSlideDom() {
		return document.querySelector(`${this.containerName} [${this.cDSlide}].active`);
	}

	getCurrentPage() {
		return this.currentPage;
	}

	getTotalSlides() {
		return this.slides.length;
	}

	getSlidePos(slide) {
		return this.config.vertical ?
			slide.getBoundingClientRect().top - this.stage.getBoundingClientRect().top :
			slide.getBoundingClientRect().left - this.stage.getBoundingClientRect().left;
	}

	getTotalPages() {
		return this.totalPages;
	}

	getSlideStyle() {
		return this.slides[0].style;
	}

	whichTransitionEvent() {
		var el = document.createElement("fakeelement"),
			transitions = {
				transition: "transitionend",
				MozTransition: "transitionend",
				WebkitTransition: "webkitTransitionEnd"
			};

		for (var t in transitions) {
			if (el.style[t] !== undefined) {
				return transitions[t];
			}
		}
	}
}

Number.isInteger =
	Number.isInteger ||
	function (value) {
		return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
	};

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

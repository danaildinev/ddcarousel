/*! DDCarousel 1.0.2 by Danail Dinev 2019 | License: https://github.com/danaildinev/ddcarousel/blob/master/LICENSE */
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

	constructor(options) {
		this.init = false;
		this.currentSlide = 0;
		this.currentPage = 0;
		this.triggers = ["onInit", "onDrag", "onDragging", "onDragged", "onChanged", "onTransitionend", "onResized"];

		this.config = this.updateSettings(options);

		this.checkContainer(this.config.container);

		this.centeredSlideOffset = 0;
		//centered slides scrolls one slide per swipe = one page per swipe and activates only when itemsPerRow are not dividable by 2
		if (this.config.items > 1 && this.config.items % 2 && this.config.centerSlide) {
			this.centeredSlideOffset = Math.floor(items / 2);
			this.config.centerSlide = true;
		}

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

	updateSettings(options) {
		var settings = {
			container: ".ddcarousel",
			nav: false,
			dots: true,
			autoHeight: false,
			items: 1,
			responsive: false,
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
			settings[el] = () => {};
			this.on(el, () => {
				this.config[el].call(this);
			});
		});

		for (var name in options) {
			settings[name] = options[name];
		}

		return settings;
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
			if (document.getElementById(contName) == null) {
				console.error(`${this.appName}: Invalid container ID!`);
				return false;
			} else {
				this.container = document.getElementById(containerNameClear);
				this.containerName = name;
				return true;
			}
		} else if (name.substring(0, 1) == ".") {
			if (document.getElementsByClassName(contName)[0] == null) {
				console.error(`${this.appName}: Invalid container class!`);
				return false;
			} else {
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
		var i = 0,
			stageContainer = document.createElement("div"),
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

		//set parameters to slides and add them in the new ddcarousel-item container with some params
		for (i = 0; i < this.slidesSource.length; i++) {
			var s = document.createElement("div");
			s.classList.add(this.cItem);
			s.setAttribute(this.cDSlide, i);
			s.appendChild(this.slidesSource[i]);
			stageDiv.appendChild(s);
		}

		//get all slides and total pages
		this.slides = document.querySelectorAll(`${this.containerName} .${this.cItem}`);

		this.totalPages = this.config.centerSlide
			? this.slides.length
			: Math.ceil(this.slides.length / this.config.itemsPerPage) - 1;

		//get difference between all slides and slider per page
		this.slideDiff = this.slides.length - this.config.itemsPerPage;

		this.centeredSlideDiff = this.config.centerSlide ? this.slideDiff + this.config.itemsPerPage : 0;
	}

	calculateStage() {
		var i,
			slideWidth = this.slides[0].style.width,
			containerWidth = parseInt(window.getComputedStyle(this.container).width);

		this.slidesHeights = [];
		for (i = 0; i < this.slides.length; i++) {
			//set current slide size
			if (this.config.itemsPerPage == null) {
				this.slides[i].style.width = containerWidth + "px";
			} else {
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
				this.triggerHandler("onInit", true);
				this.init = true;
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

			this.config.navPrevBtn = document.querySelector(`${this.containerName} .${this.cPrev}`);
			this.config.navNextBtn = document.querySelector(`${this.containerName} .${this.cNext}`);
		}
	}

	createDots() {
		if (this.config.dots) {
			var i,
				dot,
				targetSlidesLenght,
				navContainer = document.createElement("div");
			navContainer.classList.add(this.cContDots);

			if (this.config.itemsPerPage > 1) {
				if (this.config.centerSlide) {
					targetSlidesLenght = this.centeredSlideDiff;
				} else {
					targetSlidesLenght = this.totalPages + 1;
				}
			} else {
				targetSlidesLenght = this.slides.length;
			}

			for (i = 0; i < targetSlidesLenght; i++) {
				dot = document.createElement("button");
				dot.classList.add(this.cDot);
				dot.setAttribute(this.cDSlide, i);
				dot.addEventListener("click", e => this.goToPage(parseInt(e.target.getAttribute(this.cDSlide))));

				navContainer.appendChild(dot);
			}

			this.container.appendChild(navContainer);
		}
	}

	attachEvents() {
		//nav buttons
		if (this.config.nav) {
			this.config.navPrevBtn.addEventListener("click", () => this.prevPage());
			this.config.navNextBtn.addEventListener("click", () => this.nextPage());
			this.on("changed", () => {
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
						e.type == "mousedown" || (e.type == "mousedown" && this.config.touchMouse)
							? e.clientX
							: e.targetTouches[0].clientX;
					this.touchStart =
						e.type == "mousedown" || (e.type == "mousedown" && this.config.touchMouse)
							? e.clientX + -this.currentTranslate
							: e.targetTouches[0].clientX + -this.currentTranslate;

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
						input = e.clientX;
					} else if (e.type == "touchmove") {
						input = e.targetTouches[0].pageX;
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
			this.config.navPrevBtn.classList.add("inactive");
			this.config.navNextBtn.classList.remove("inactive");
		} else if (
			this.config.centerSlide
				? this.getActiveSlides() == this.getTotalSlides()
				: this.currentPage == this.getTotalPages()
		) {
			this.config.navPrevBtn.classList.remove("inactive");
			this.config.navNextBtn.classList.add("inactive");
		} else {
			this.config.navPrevBtn.classList.remove("inactive");
			this.config.navNextBtn.classList.remove("inactive");
		}
	}

	scrollToSlide(slide) {
		this.currentTranslate = -this.getSlideDomSize(slide);
		this.scrollToPos(this.currentTranslate);
	}

	scrollToPos(int) {
		const isSafari8 = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
		var output = `translateX(${int}px)`;
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
			var i,
				heights = [];

			//get specified slides from global array with heights and then get the highest of it
			for (i = this.getActiveSlides()[0]; i <= this.getActiveSlides()[this.getActiveSlides().length - 1]; i++) {
				heights.push(this.slidesHeights[i]);
			}
			this.container.style.height = Math.max(...heights) + "px";
		}
	}
	changePage(index) {
		var origSlide = this.currentPage;

		this.stage.style.transitionDuration = this.config.slideChangeDuration + "s";

		//change slide based on parameter
		if (index == "prev") {
			this.currentSlide = this.config.centerSlide
				? this.currentSlide - 1
				: this.currentSlide - this.config.itemsPerPage;
			this.currentPage--;
		} else if (index == "next") {
			this.currentSlide = this.config.centerSlide
				? this.currentSlide + 1
				: this.currentSlide + this.config.itemsPerPage;
			this.currentPage++;
		} else if (Number.isInteger(index)) {
			this.currentSlide = index;
		}

		//make some validations with the new value
		if (index == "prev" && this.currentSlide < 0) {
			if (this.config.centerSlide) {
				this.currentSlide--;
				this.currentPage--;
			} else {
				this.currentSlide = 0;
				this.currentPage = 0;
			}
		} else if (index == "next" && this.currentSlide + this.config.itemsPerPage >= this.slides.length) {
			console.log("ha!");
			if (this.config.centerSlide) {
				if (this.currentSlide > this.slides.length) {
					this.currentSlide++;
					this.currentPage++;
				}
			} else {
				this.currentSlide = this.slides.length - this.config.itemsPerPage;
				this.currentPage = this.totalPages;
			}
		}

		//update frontend
		this.setActiveSlides();
		this.setActiveDot();

		//slide to specified slide position
		this.updateSlide();

		//change stage height if this options is enabled
		if (this.config.autoHeight) {
			this.calculateContainerHeight(this.getCurrentSlideDom());
		}

		//fire change trigger
		if (origSlide != this.currentPage) {
			this.triggerHandler("onChanged");
		}
	}

	updateSlide() {
		if (this.config.centerSlide) {
			var output =
				-this.getSlideDomSize(this.getCurrentSlideDom()) -
				-this.getCurrentSlideDom().getBoundingClientRect().width * this.centeredSlideOffset;
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
			this.activeSlides.push(this.currentSlide);
		} else {
			for (let index = this.currentSlide; index < this.config.itemsPerPage + this.currentSlide; index++) {
				if (index < this.slides.length) {
					this.activeSlides.push(index);
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

	goToPage(index) {
		if (index >= 0 && index <= this.totalPages) this.changePage(index);
	}

	getCurrentSlideDom() {
		return document.querySelector(`${this.containerName} [${this.cDSlide}].active`);
	}

	getCurrentPage() {
		return document
			.querySelector(`${this.containerName} [${this.cDSlide}="${this.currentPage}"].active`)
			.getAttribute(this.cDSlide);
	}

	getTotalSlides() {
		return this.slides.length - 1;
	}

	getSlideDom(id) {
		return document.querySelector(`${this.containerName} .${this.cItem}[${this.cDSlide}="${id}"]`);
	}

	getSlideDomSize(slide) {
		return slide.getBoundingClientRect().left - this.stage.getBoundingClientRect().left;
	}

	getActiveSlides() {
		return this.activeSlides;
	}

	getTotalPages() {
		return this.totalPages;
	}

	whichTransitionEvent() {
		var t,
			el = document.createElement("fakeelement"),
			transitions = {
				transition: "transitionend",
				MozTransition: "transitionend",
				WebkitTransition: "webkitTransitionEnd"
			};

		for (t in transitions) {
			if (el.style[t] !== undefined) {
				return transitions[t];
			}
		}
	}
}

Number.isInteger =
	Number.isInteger ||
	function(value) {
		return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
	};

if (!("classList" in document.documentElement) && Object.defineProperty && typeof HTMLElement !== "undefined") {
	Object.defineProperty(HTMLElement.prototype, "classList", {
		get: function() {
			var self = this;
			function update(fn) {
				return function(value) {
					var classes = self.className.split(/\s+/),
						index = classes.indexOf(value);

					fn(classes, index, value);
					self.className = classes.join(" ");
				};
			}

			var ret = {
				add: update(function(classes, index, value) {
					~index || classes.push(value);
				}),

				remove: update(function(classes, index) {
					~index && classes.splice(index, 1);
				}),

				contains: function(value) {
					return !!~self.className.split(/\s+/).indexOf(value);
				},

				item: function(i) {
					return self.className.split(/\s+/)[i] || null;
				}
			};

			Object.defineProperty(ret, "length", {
				get: function() {
					return self.className.split(/\s+/).length;
				}
			});

			return ret;
		}
	});
}

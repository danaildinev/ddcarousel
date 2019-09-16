/*! DDCarousel 1.0.2 by Danail Dinev 2019 | License: https://github.com/danaildinev/ddcarousel/blob/master/LICENSE */
class DDCarousel {
	appName = "DDCarousel";
	containerName = null; //full container name
	container = null; //DOM element: container
	stage = null; //DOM element: stage
	currentSlide = 0; //current slide
	currentPage = 0;
	currentTranslate = 0;
	slideDiff = 0;
	slidesHeights = []; //use dot store slides heights when using autoHeight
	triggers = [];
	activeSlides = [];
	totalPages = [];

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

	constructor({
		container = ".ddcarousel",
		nav = false,
		dots = true,
		autoHeight = false,
		items = 1,
		responsive = false,
		touch = true,
		touchMouse = true,
		centerSlide = false,
		touchSwipeThreshold = 60,
		touchMaxSlideDist = 500,
		swipeSmooth = 0.1,
		slideChangeDuration = 0.3,
		labelNavPrev = "< Prev",
		labelNavNext = "Next >"
	}) {
		if (this.checkContainer(container)) {
			this.containerName = container;
			this.autoHeight = autoHeight;
			this.itemsPerPage = items;
			this.responsive = responsive;
			this.nav = nav;
			this.dots = dots;
			this.touch = touch;

			this.touchMouse = touchMouse;
			this.touchSwipeThreshold = touchSwipeThreshold;
			this.touchMaxSlideDist = touchMaxSlideDist;
			this.swipeSmooth = swipeSmooth;
			this.slideChangeDuration = slideChangeDuration;
			this.labelNavPrev = labelNavPrev;
			this.labelNavNext = labelNavNext;

			if (items > 1 && items % 2 && centerSlide) {
				this.centeredSlideOffset = Math.floor(items / 2);
				this.centerSlide = true;
			} else {
				this.centeredSlideOffset = 0;
				this.centerSlide = false;
			}

			this.createStage();
			this.calculateStage();
			this.createNav();
			this.createDots();
			this.attachEvents();

			this.setActiveSlides();
			this.setActiveDot();

			if (this.nav) this.refreshNav();
		}
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
				console.log(`${this.appName}: Invalid container ID!`);
				return false;
			} else {
				this.container = document.getElementById(containerNameClear);
				return true;
			}
		} else if (name.substring(0, 1) == ".") {
			if (document.getElementsByClassName(contName)[0] == null) {
				console.log(`${this.appName}: Invalid container class!`);
				return false;
			} else {
				this.container = document.getElementsByClassName(contName)[0];
				return true;
			}
		} else {
			console.log(`${this.appName}: Invalid container!`);
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
		if (this.responsive) {
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

		this.totalPages = Math.ceil(this.slides.length / this.itemsPerPage);

		//get difference between all slides and slider per page
		this.slideDiff = this.slides.length - this.itemsPerPage;

		this.centeredSlideDiff = this.centerSlide ? this.slideDiff + this.itemsPerPage : 0;
	}

	calculateStage() {
		var i,
			slideWidth = this.slides[0].style.width,
			containerWidth = parseInt(window.getComputedStyle(this.container).width);

		this.slidesHeights = [];
		for (i = 0; i < this.slides.length; i++) {
			//set current slide size
			if (this.itemsPerPage == null) {
				this.slides[i].style.width = containerWidth + "px";
			} else {
				this.slides[i].style.width = containerWidth / this.itemsPerPage + "px";
			}
			this.slidesHeights.push(
				document.querySelector(`${this.containerName} [${this.cDSlide}="${i}"] > div`).scrollHeight
			);
		}

		if (this.autoHeight) {
			this.calculateContainerHeight(this.currentPage);
		}

		//fire event
		if (slideWidth != this.slides[0].style.width) this.triggerHandler("resized");
	}

	createNav() {
		if (this.nav) {
			var navContainer = document.createElement("div"),
				leftBtn = document.createElement("button"),
				rightBtn = document.createElement("button");

			navContainer.classList.add(this.cNav);

			leftBtn.classList.add(this.cPrev);
			leftBtn.innerHTML = this.labelNavPrev;

			rightBtn.classList.add(this.cNext);
			rightBtn.innerHTML = this.labelNavNext;

			//add buttons in nav container
			navContainer.appendChild(leftBtn);
			navContainer.appendChild(rightBtn);

			this.container.appendChild(navContainer);

			this.navPrevBtn = document.querySelector(`${this.containerName} .${this.cPrev}`);
			this.navNextBtn = document.querySelector(`${this.containerName} .${this.cNext}`);
		}
	}

	createDots() {
		if (this.dots) {
			var i,
				dot,
				targetSlidesLenght,
				navContainer = document.createElement("div");
			navContainer.classList.add(this.cContDots);

			if (this.itemsPerPage > 1) {
				if (this.centerSlide) {
					targetSlidesLenght = this.centeredSlideDiff;
				} else {
					targetSlidesLenght = this.totalPages;
				}
			} else {
				targetSlidesLenght = this.slides.length;
			}

			for (i = 0; i < targetSlidesLenght; i++) {
				dot = document.createElement("button");
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
		if (this.nav) {
			this.navPrevBtn.addEventListener("click", () => this.prevPage());
			this.navNextBtn.addEventListener("click", () => this.nextPage());
			this.on("changed", () => {
				this.refreshNav();
			});
		}

		//responsive
		if (this.responsive) {
			window.addEventListener("resize", () => {
				this.calculateStage();
				this.scrollToSlide(this.getCurrentSlideDom());
			});
		}

		//touch events
		this.attachTouchEvents();
	}

	attachTouchEvents() {
		var eventsStart = [],
			eventsMove = [],
			eventsEnd = [],
			touchStart,
			touchStartRaw,
			currentTouch,
			origPosition,
			swipeDistance,
			dontChange,
			isDragging;

		//add events based on options
		if (this.touch) {
			eventsStart.push("touchstart");
			eventsMove.push("touchmove");
			eventsEnd.push("touchend");
		}
		if (this.touchMouse) {
			eventsStart.push("mousedown");
			eventsMove.push("mousemove");
			eventsEnd.push("mouseup");
		}

		eventsStart.forEach(el => {
			this.stage.addEventListener(
				el,
				e => {
					isDragging = true;

					//set some starting values
					touchStartRaw =
						e.type == "mousedown" || (e.type == "mousedown" && this.touchMouse)
							? e.clientX
							: e.targetTouches[0].clientX;
					touchStart =
						e.type == "mousedown" || (e.type == "mousedown" && this.touchMouse)
							? e.clientX + -this.currentTranslate
							: e.targetTouches[0].clientX + -this.currentTranslate;

					//remember orig position
					origPosition = this.currentTranslate;
					dontChange = false;

					this.triggerHandler("drag");
				},
				{ passive: true }
			);
		});

		eventsEnd.forEach(el => {
			this.stage.addEventListener(el, () => {
				//check if swipe distance is enough to change slide or stay on the same
				this.triggerHandler("dragged");

				if (swipeDistance >= this.touchSwipeThreshold && !dontChange) {
					if (currentTouch > origPosition) {
						this.prevSlide();
					} else {
						this.nextSlide();
					}
				} else {
					this.scrollToPos(origPosition);
				}

				this.stage.style.transitionDuration = this.slideChangeDuration + "s";
				isDragging = false;
			});
		});

		eventsMove.forEach(el => {
			this.stage.addEventListener(
				el,
				e => {
					var input;
					if (e.type == "mousemove" && this.touchMouse) {
						if (isDragging) {
							input = e.clientX;
						}
					} else if (e.type == "touchmove") {
						input = e.targetTouches[0].pageX;
					}

					//disable transition to get more responsive dragging
					this.stage.style.transitionDuration = this.swipeSmooth + "s";

					//calcualte swipe distance between starging value cnd current value
					swipeDistance = Math.abs(input - touchStartRaw);

					//get the current touch
					currentTouch = input - touchStart;

					//move slider until max swipe lenght is reached
					if (swipeDistance <= this.touchMaxSlideDist) {
						this.scrollToPos(currentTouch);
					} else {
						dontChange = true;
						currentTouch = input - touchStart;
					}
				},
				{ passive: true }
			);
		});
	}

	refreshNav() {
		/*if (this.currentPage == 0) {
			this.navPrevBtn.classList.add("inactive");
		} else if (this.currentPage == this.slideDiff) {
			this.navNextBtn.classList.add("inactive");
		} else {
			this.navPrevBtn.classList.remove("inactive");
			this.navNextBtn.classList.remove("inactive");
		}*/
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
		if (this.itemsPerPage == 1) {
			this.container.style.height = this.slidesHeights[this.currentPage] + "px";
		} else {
			var i,
				heights = [];

			//get specified slides from global array with heights and then get the highest of it
			for (i = this.currentPage; i <= this.currentPage + this.itemsPerPage - 1; i++) {
				heights.push(this.slidesHeights[i]);
				this.container.style.height = Math.max(...heights) + "px";
			}
		}
	}
	changePage(index) {
		//change pages

		var origSlide = this.currentPage;

		this.stage.style.transitionDuration = this.slideChangeDuration + "s";

		if (index == "prev") {
			if (this.currentSlide - this.itemsPerPage <= 0) {
				this.currentSlide = 0;
				this.currentPage = 0;
			} else {
				this.currentSlide -= this.itemsPerPage;
				this.currentPage -= 1;
			}
		} else if (index == "next") {
			if (this.currentSlide + this.itemsPerPage + this.itemsPerPage >= this.slides.length) {
				//if (this.currentPage + this.currentPage >= this.totalPages - 1) {
				this.currentSlide = this.slides.length - this.itemsPerPage;
				this.currentPage = this.totalPages - 1;
			} else {
				this.currentSlide += this.itemsPerPage;
				this.currentPage++;
			}
		} /*else if (Number.isInteger(index)) {
			this.currentSlide = index;
		}*/

		//set active slides
		this.setActiveSlides();

		//slide to specified slide position
		if (this.centerSlide) {
			var output =
				-this.getSlideDomSize(this.getCurrentSlideDom()) -
				-this.getCurrentSlideDom().getBoundingClientRect().width * this.centeredSlideOffset;
			this.currentTranslate = output;
			this.scrollToPos(output);
		} else {
			this.scrollToSlide(this.getCurrentSlideDom());
		}

		//set active dots
		this.setActiveDot();

		//change stage height if this options is enabled
		if (this.autoHeight) {
			this.calculateContainerHeight(this.getCurrentSlideDom());
		}

		//fire change trigger
		if (origSlide != this.currentPage) this.triggerHandler("changed");
	}

	setActiveSlides() {
		this.activeSlides.forEach(i => {
			document.querySelector(`${this.containerName} [${this.cDSlide}="${i}"]`).classList.remove("active");
		});

		this.activeSlides = [];
		for (let index = this.currentSlide; index < this.itemsPerPage + this.currentSlide; index++) {
			if (index < this.slides.length && index >= 0) {
				this.activeSlides.push(index);
			}
		}

		this.activeSlides.forEach(i => {
			document.querySelector(`${this.containerName} [${this.cDSlide}="${i}"]`).classList.add("active");
		});
	}

	setActiveDot() {
		document
			.querySelector(`${this.containerName} .${this.cDot}[${this.cDSlide}="${this.currentPage}"]`)
			.classList.add("active");
	}

	nextPage() {
		this.changePage("next");
	}

	prevPage() {
		this.changePage("prev");
	}

	getCurrentSlide() {
		return this.currentPage;
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
		return this.slides.length;
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

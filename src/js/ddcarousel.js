/*! DDCarousel 1.0 by Danail Dinev 2019 | License: https://github.com/danaildinev/ddcarousel/blob/master/LICENSE */
class DDCarousel {
	appName = "DDCarousel";
	containerName = null; //full container name
	container = null; //DOM element: container
	stage = null; //DOM element: stage
	currentSlide = 0; //current slide
	currentTranslate = 0;
	slideDiff = 0;
	slidesHeights = []; //use dot store slides heights when using autoHeight
	triggers = [];

	constructor({
		container = ".ddcarousel",
		nav = false,
		dots = true,
		autoHeight = false,
		items = 1,
		responsive = false,
		touch = true,
		touchMouse = true,
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

			this.createStage();
			this.calculateStage();
			this.createNav();
			this.createDots();
			this.attachEvents();
			this.changeSlide(this.changeSlide);

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

		stageContainer.classList.add("ddcarousel-container");
		stageDiv.classList.add("ddcarousel-stage");

		//get all slides from user
		this.slidesSource = document.querySelectorAll(`${this.containerName} > div`);

		//add the stage to the main container
		this.container.appendChild(stageContainer);
		stageContainer.appendChild(stageDiv);

		//get stage DOM
		this.stage = document.querySelector(`${this.containerName} .${stageDiv.classList[0]}`);

		//set width to 100% if responsive is enabled and change container width
		if (this.responsive) {
			this.container.classList.add("ddcarousel-responsive");
		}

		//set parameters to slides and add them in the new ddcarousel-item container with some params
		for (i = 0; i < this.slidesSource.length; i++) {
			var s = document.createElement("div");
			s.classList.add("ddcarousel-item");
			s.setAttribute("data-slide", i);
			s.appendChild(this.slidesSource[i]);
			stageDiv.appendChild(s);
		}

		//get all slides
		this.slides = document.querySelectorAll(`${this.containerName} .ddcarousel-item`);
	}

	calculateStage() {
		var i,
			slideWidth = this.slides[0].style.width,
			containerWidth = parseInt(window.getComputedStyle(this.container).width);

		for (i = 0; i < this.slides.length; i++) {
			//set current slide size
			if (this.itemsPerPage == null) {
				this.slides[i].style.width = containerWidth + "px";
			} else {
				this.slides[i].style.width = containerWidth / this.itemsPerPage + "px";
			}
			this.slidesHeights.push(
				document.querySelector(`${this.containerName} [data-slide="${i}"] > div`).scrollHeight
			);
		}

		if (this.autoHeight) {
			this.calculateContainerHeight(this.currentSlide);
		}
		this.slideToPosition(this.getCurrentSlideDom());

		//fire event
		if (slideWidth != this.slides[0].style.width) this.triggerHandler("resized");
	}

	createNav() {
		if (this.nav) {
			var navContainer = document.createElement("div"),
				leftBtn = document.createElement("button"),
				rightBtn = document.createElement("button");

			navContainer.classList.add("ddcarousel-nav");

			leftBtn.classList.add("ddcarousel-prev");
			leftBtn.innerHTML = this.labelNavPrev;

			rightBtn.classList.add("ddcarousel-next");
			rightBtn.innerHTML = this.labelNavNext;

			//add buttons in nav container
			navContainer.appendChild(leftBtn);
			navContainer.appendChild(rightBtn);

			this.container.appendChild(navContainer);

			this.navPrevBtn = document.querySelector(`${this.containerName} .${leftBtn.classList[0]}`);
			this.navNextBtn = document.querySelector(`${this.containerName} .${rightBtn.classList[0]}`);
		}
	}

	createDots() {
		if (this.dots) {
			var i,
				dot,
				targetSlidesLenght,
				navContainer = document.createElement("div");
			navContainer.classList.add("ddcarousel-dots");

			if (this.itemsPerPage > 1) {
				targetSlidesLenght = this.slides.length - this.itemsPerPage + 1;
			} else {
				targetSlidesLenght = this.slides.length;
			}

			for (i = 0; i < targetSlidesLenght; i++) {
				dot = document.createElement("button");
				dot.classList.add("ddcarousel-dot");
				dot.setAttribute("data-slide", i);
				dot.addEventListener("click", e => this.changeSlide(parseInt(e.target.getAttribute("data-slide"))));

				navContainer.appendChild(dot);
			}

			this.container.appendChild(navContainer);
		}
	}

	attachEvents() {
		//nav buttons
		if (this.nav) {
			this.navPrevBtn.addEventListener("click", () => this.prevSlide());
			this.navNextBtn.addEventListener("click", () => this.nextSlide());
			this.on("changed", () => {
				this.refreshNav();
			});
		}

		//responsive
		if (this.responsive) {
			window.addEventListener("resize", () => {
				this.calculateStage();
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
					this.stage.style.transform = "translateX(" + origPosition + "px)";
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
						this.stage.style.transform = "translateX(" + currentTouch + "px)";
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
		if (this.currentSlide == 0) {
			this.navPrevBtn.classList.add("inactive");
		} else if (this.currentSlide === this.slides.length - 1 || this.currentSlide == this.slideDiff) {
			this.navNextBtn.classList.add("inactive");
		} else if (this.currentSlide > 0 && this.currentSlide < this.slides.length) {
			this.navPrevBtn.classList.remove("inactive");
			this.navNextBtn.classList.remove("inactive");
		}
	}

	slideToPosition(slide) {
		this.currentTranslate = -(slide.getBoundingClientRect().left - this.stage.getBoundingClientRect().left);
		this.stage.style.transform = `translateX(${this.currentTranslate}px)`;
	}

	calculateContainerHeight() {
		if (this.itemsPerPage == 1) {
			this.container.style.height = this.slidesHeights[this.currentSlide] + "px";
		} else {
			var i,
				heights = [];

			//get specified slides from global array with heights and then get the highest of it
			for (i = this.currentSlide; i <= this.currentSlide + this.itemsPerPage - 1; i++) {
				heights.push(this.slidesHeights[i]);
				this.container.style.height = Math.max(...heights) + "px";
			}
		}
	}

	changeSlide(index) {
		var origSlide = this.currentSlide;

		this.stage.style.transitionDuration = this.slideChangeDuration + "s";

		//remove some classes bedore adding new one
		if (this.dots) {
			document
				.querySelector(`${this.containerName} .ddcarousel-dot[data-slide="${this.currentSlide}"]`)
				.classList.remove("active");
		}
		this.getSlideDom(this.currentSlide).classList.remove("active");

		//change slide based on parameter
		if (index == "prev") {
			this.currentSlide--;
		} else if (index == "next") {
			this.currentSlide++;
		} else if (Number.isInteger(index)) {
			this.currentSlide = index;
		}

		//get difference between all slides and slider per page
		this.slideDiff = this.slides.length - this.itemsPerPage;

		//set the correct slide index if there is specified items per row
		if (this.itemsPerPage > 1 && this.currentSlide >= this.slideDiff) {
			this.currentSlide = this.slideDiff;
		} else {
			//check if index is larger than slides count -> then change to the last slide
			if (this.currentSlide >= this.slides.length) {
				this.currentSlide = this.slides.length - 1;
			}
			//check if index is smaller than slides count -> then change to the first slide
			else if (this.currentSlide < 0) {
				this.currentSlide = 0;
			}
		}

		//slide to specified slide position
		this.slideToPosition(this.getCurrentSlideDom());

		//set active slide class
		this.getSlideDom(this.currentSlide).classList.add("active");

		//set active dots
		if (this.dots) {
			//add class to the current dot
			document
				.querySelector(`${this.containerName} .ddcarousel-dot[data-slide="${this.currentSlide}"]`)
				.classList.add("active");
		}

		//change stage height if this options is enabled
		if (this.autoHeight) {
			this.calculateContainerHeight(this.getCurrentSlideDom());
		}

		//fire change trigger
		if (origSlide != this.currentSlide) this.triggerHandler("changed");
	}

	nextSlide() {
		this.changeSlide("next");
	}

	prevSlide() {
		this.changeSlide("prev");
	}

	getCurrentSlide() {
		return this.currentSlide;
	}

	getCurrentSlideDom() {
		return document.querySelector(`${this.containerName} [data-slide="${this.currentSlide}"]`);
	}

	getCurrentPage() {
		return document
			.querySelector(`${this.containerName} [data-slide="${this.currentSlide}"].active`)
			.getAttribute("data-slide");
	}

	getTotalSlides() {
		return this.slides.length;
	}

	getSlideDom(id) {
		return document.querySelector(`${this.containerName} .ddcarousel-item[data-slide="${id}"]`);
	}
}

Number.isInteger =
	Number.isInteger ||
	function(value) {
		return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
	};

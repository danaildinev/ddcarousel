/*! DDCarousel 1.2 by Danail Dinev 2019 | License: https://github.com/danaildinev/ddcarousel/blob/master/LICENSE */
class DDCarousel {

	constructor(options) {
		this.appName = "DDCarousel";
		this.cApp = "ddcarousel";
		this.cCont = "ddcarousel-container";
		this.cStage = "ddcarousel-stage";
		this.cNav = "ddcarousel-nav";
		this.cItem = "ddcarousel-item";
		this.cResp = "ddcarousel-responsive";
		this.cContDots = "ddcarousel-dots";
		this.cDot = "ddcarousel-dot";
		this.cPrev = "ddcarousel-prev";
		this.cNext = "ddcarousel-next";
		this.cVert = "ddcarousel-vertical";
		this.cUrl = "ddcarousel-urls";
		this.cDSlide = "data-slide";
		this.cDId = "data-id";
		this.cDTitle = "data-title";
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

		this.configOrig = options;
		this.setDefaults();
		if (this.checkContainer(this.config.container)) {
			this.trigger("onInitialize", { container: this.container, event: "onInitialize" });
			this.createStage();
			this.setActiveSlides();
			this.calculateStage();
			this.refreshOnResize();
			this.refreshNav();
			if (this.config.startPage > -1) this.changePage(this.config.startPage, false);
			this.trigger("onInitialized");
			this.calculateStage();
			this.attachEvents();
		}
	}

	setDefaults(options = this.configOrig) {
		var settings = {
			container: "." + this.cApp,
			nav: false,
			dots: true,
			autoHeight: false,
			fullWidth: false,
			startPage: -1,
			itemsPerPage: 1,
			itemPerPage: false,
			vertical: false,
			urlNav: false,
			responsive: [],
			autoplay: false,
			autoplayDuration: 1000,
			autoplayPauseHover: false,
			touch: true,
			touchMouse: true,
			centerSlide: false,
			touchSwipeThreshold: 60,
			touchMaxSlideDist: 500,
			resizeRefresh: 200,
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

		this.configResp = [];
		if (options['responsive'] !== undefined) {
			this.configResp = options['responsive'];
		}

		this.config = settings;
		this.updateSettings(options);
	}

	updateSettings(options) {
		/* updating event triggers is not supported for now! */
		for (var name in options) {
			this.config[name] = options[name];
		}
	}

	callback(event) {
		var callback = {
			container: this.container,
			event: event,
			currentSlides: this.activeSlides,
			currentPage: this.currentPage,
			totalSlides: this.getTotalSlides(),
			totalPages: this.totalPages
		};

		return callback;
	}

	on(event, callback) {
		if (!this.triggers[event]) this.triggers[event] = [];
		this.triggers[event].push(callback);
	}

	trigger(event, callback) {
		if (this.triggers[event]) {
			for (var i in this.triggers[event]) this.triggers[event][i](callback);
		}
	}

	checkContainer(name) {
		var cont = document.querySelector(name);
		if (cont != null) {
			this.container = cont;
			this.containerName = name;
			return true;
		} else {
			console.error(`${this.appName}: Invalid container!`);
			return false;
		}
	}

	createStage() {
		var stageContainer = this.newEl("div"),
			stageDiv = this.newEl("div"),
			slidesSource = this.getEl(`> div`, true); //get all slides from user

		stageContainer.classList.add(this.cCont);
		stageDiv.classList.add(this.cStage);

		//add the stage to the main container
		this.container.appendChild(stageContainer);
		stageContainer.appendChild(stageDiv);

		//get stage DOM
		this.stage = this.getEl(`.${this.cStage}`);

		//set parameters to slides and add them in the new ddcarousel-item container with some params
		for (var i = 0; i < slidesSource.length; i++) {
			var s = this.newEl("div");
			s.classList.add(this.cItem);
			s.setAttribute(this.cDSlide, i);
			s.appendChild(slidesSource[i]);
			if (this.config.urlNav) {
				if (slidesSource[i].hasAttribute(this.cDId) && slidesSource[i].hasAttribute(this.cDTitle)) {
					s.setAttribute(this.cDId, slidesSource[i].getAttribute(this.cDId));
					s.setAttribute(this.cDTitle, slidesSource[i].getAttribute(this.cDTitle));
				}
			}
			stageDiv.appendChild(s);
		}

		//get all slides and total pages
		this.slides = this.getEl(`.${this.cItem}`, true);

		this.createNav();
		this.createDots();
		this.createUrls();
	}

	calculateStage() {
		var slideWidth = this.slides[0].style.width,
			wind = window.getComputedStyle(this.container),
			containerWidth = parseInt(wind.width),
			containerHeight = parseInt(wind.height),
			totalPages,
			contClassList = this.container.classList;

		if (this.config.fullWidth) {
			contClassList.add(this.cResp);
		} else {
			contClassList.remove(this.cResp);
		}

		if (this.config.vertical) {
			contClassList.add(this.cVert);
		} else {
			contClassList.remove(this.cVert);
		}

		if (this.config.centerSlide) {
			totalPages = this.slides.length - 1
		} else if (this.config.itemPerPage) {
			totalPages = this.slides.length - this.config.itemsPerPage
		} else {
			totalPages = Math.ceil(this.slides.length / this.config.itemsPerPage) - 1;
		}
		this.totalPages = totalPages;

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
				this.getEl(`[${this.cDSlide}="${i}"] > div`).scrollHeight
			);
		}

		if (!this.config.vertical) {
			this.stage.style.width = (containerWidth * this.slides.length) + "px";
		}

		if (this.config.autoHeight) {
			this.calculateContainerHeight(this.currentPage);
		}

		this.scrollToSlide(this.getCurrentSlideDom());

		if (slideWidth != this.slides[0].style.width) this.trigger("onResized");
	}

	createNav() {
		var navDiv = this.getEl(`.${this.cNav}`);

		if (this.config.nav) {
			var navContainer = this.newEl("div"),
				leftBtn = this.newEl("button"),
				rightBtn = this.newEl("button");

			if (navDiv)
				navDiv.remove();

			navContainer.classList.add(this.cNav);

			leftBtn.classList.add(this.cPrev);
			leftBtn.innerHTML = this.config.labelNavPrev;

			rightBtn.classList.add(this.cNext);
			rightBtn.innerHTML = this.config.labelNavNext;

			//add buttons in nav container
			navContainer.appendChild(leftBtn);
			navContainer.appendChild(rightBtn);

			this.container.appendChild(navContainer);

			this.navPrevBtn = this.getEl(`.${this.cPrev}`);
			this.navNextBtn = this.getEl(`.${this.cNext}`);
			this.navPrevBtn.addEventListener("click", () => this.prevPage());
			this.navNextBtn.addEventListener("click", () => this.nextPage());
		} else {
			if (navDiv != null)
				navDiv.remove();
		}
	}

	createDots() {
		var dotsDiv = this.getEl(`.${this.cContDots}`);

		if (this.config.dots) {
			var targetSlidesLenght,
				dotsContainer = this.newEl("div");

			if (dotsDiv)
				dotsDiv.remove();

			dotsContainer.classList.add(this.cContDots);

			if (this.config.itemsPerPage > 1) {
				targetSlidesLenght = this.config.centerSlide ? this.slides.length : this.totalPages + 1;
			} else {
				targetSlidesLenght = this.slides.length;
			}

			for (var i = 0; i < targetSlidesLenght; i++) {
				var dot = this.newEl("button");
				dot.classList.add(this.cDot);
				dot.setAttribute(this.cDSlide, i);
				dot.addEventListener("click", e => this.changePage(parseInt(e.target.getAttribute(this.cDSlide))));

				dotsContainer.appendChild(dot);
			}

			this.container.appendChild(dotsContainer);
		} else {
			if (dotsDiv != null)
				dotsDiv.remove();
		}
	}

	createUrls() {
		this.urlsDiv = this.getEl(`.${this.cUrl}`);

		if (this.config.urlNav) {
			var cont = this.newEl("div"),
				list = this.newEl("ul");

			if (this.urlsDiv)
				this.urlsDiv.remove();

			cont.classList.add(this.cUrl);
			this.slides.forEach(el => {
				if (el.hasAttribute(cDId) && el.hasAttribute(this.cDTitle)) {
					var li = this.newEl('li'),
						a = this.newEl('a');

					a.href = "#" + el.getAttribute(this.cDId);
					a.innerHTML = el.getAttribute(this.cDTitle);

					li.appendChild(a);
					list.appendChild(li);
				}
			})

			cont.appendChild(list);
			this.container.appendChild(cont);

			this.getEl(`.${this.cUrl} a`, true).forEach(el => {
				el.addEventListener("click", e => {
					this.goToUrl(el.getAttribute('href').substring(1))
				})
			})
		} else {
			if (this.urlsDiv != null)
				this.urlsDiv.remove();
		}
	}

	attachEvents() {
		this.setDraggingEvents();

		//resize event
		var throttled;
		window.addEventListener("resize", () => {
			this.calculateStage();
			if (!throttled) {
				this.refreshOnResize();
				throttled = true;
				setTimeout(function () {
					throttled = false;
				}, this.config.resizeRefresh);
			}
		});

		//anim
		this.stage.addEventListener(this.whichTransitionEvent(), () => {
			this.trigger("onTransitionend");
		});

		//autoplay
		var start = ["mouseover", "touchstart"],
			stop = ["mouseleave", "touchend"];
		if (this.config.autoplayPauseHover && this.config.autoplay) {
			start.forEach(el => this.stage.addEventListener(el, this.autoplayStop.bind(this)));
			stop.forEach(el => this.stage.addEventListener(el, this.autoplayStart.bind(this)));
		} else {
			start.forEach(el => this.stage.removeEventListener(el, this.autoplayStop.bind(this)));
			stop.forEach(el => this.stage.removeEventListener(el, this.autoplayStart.bind(this)));
		}
	}

	refreshOnResize() {
		//check responsive options
		for (let i = 0; i < Object.keys(this.configResp).length; i++) {
			if (document.body.clientWidth <= Object.keys(this.configResp)[i]) {
				this.updateSettings(Object.values(this.configResp)[i]);
				break;
			} else {
				this.setDefaults();
			}
		}
		this.createNav();
		this.createDots();
		this.setActiveDot();
		this.createUrls();
		this.autoplayStop();
		if (this.config.autoplay && this.ap == undefined) {
			this.autoplayStart();
		}
	}

	setDraggingEvents() {
		var startDrag = ["touchstart", "mousedown"],
			movingDrag = ["touchmove", "mousemove"],
			endDrag = ["touchend", "mouseup"],
			startEl = document.all && window.atob ? this.stage : window;

		startDrag.forEach(el => startEl.addEventListener(el, e => this.dragStart(e), { passive: true }));
		movingDrag.forEach(el => window.addEventListener(el, e => this.dragMove(e), { passive: true }));
		endDrag.forEach(el => window.addEventListener(el, () => this.dragEnd()));
	}

	dragMove(e) {
		if (this.isDragging) {
			var input;
			if (e.type == "mousemove" && this.config.touchMouse) {
				input = this.config.vertical ? e.clientY : e.pageX;
			} else if (e.type == "touchmove" && this.config.touch) {
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
				this.trigger("onDragging");
				this.scrollToPos(this.currentTouch);
			} else {
				this.dontChange = true;
				this.currentTouch = input - this.touchStart;
			}
		}
	}

	dragStart(e) {
		if (e.target == this.stage) {
			var startPoint;
			if (e.type == "mousedown" && this.config.touchMouse) {
				startPoint = this.config.vertical ? e.clientY : e.pageX;
			} else if (e.type == "touchstart" && this.config.touch) {
				startPoint = this.config.vertical ? e.targetTouches[0].clientY : e.targetTouches[0].pageX;
			}

			if (startPoint !== undefined) {
				if (e.target == this.stage) {
					this.isDragging = true;
					this.touchStartRaw = startPoint;
					this.touchStart = this.touchStartRaw + -this.currentTranslate;
					this.origPosition = this.currentTranslate;
					this.dontChange = false;
					this.trigger("onDrag");
				}
			}
		}
	}

	dragEnd() {
		if (this.isDragging) {
			//check if swipe distance is enough to change slide or stay on the same
			this.trigger("onDragged");

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
	}

	refreshNav() {
		if (this.config.nav) {
			var inactive = "inactive";
			if (this.currentPage == 0) {
				this.navPrevBtn.classList.add(inactive);
				this.navNextBtn.classList.remove(inactive);
			} else if (this.currentPage == this.totalPages) {
				this.navPrevBtn.classList.remove(inactive);
				this.navNextBtn.classList.add(inactive);
			} else {
				this.navPrevBtn.classList.remove(inactive);
				this.navNextBtn.classList.remove(inactive);
			}
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

	changePage(index, enableAnim = true) {
		var old = this.currentPage;
		if (!enableAnim) {
			this.stage.style.transitionDuration = "0s";
			this.stage.addEventListener(this.whichTransitionEvent(), () => {
				this.stage.style.transitionDuration = this.config.slideChangeDuration + "0s";
			});
		} else {
			this.stage.style.transitionDuration = this.config.slideChangeDuration + "s";
		}

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
		this.refreshNav();

		//change stage height if this options is enabled
		if (this.config.autoHeight) {
			this.calculateContainerHeight(this.getCurrentSlideDom());
		}

		//fire change trigger
		if (old != this.currentPage) {
			this.trigger("onChanged");
		}
	}

	goToUrl(id, enableAnim = true) {
		var item = this.getEl(`.${this.cItem}[${this.cDId}="${id}"]`);
		this.changePage(parseInt(item.getAttribute(this.cDSlide)), enableAnim);
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
				this.getEl(`[${this.cDSlide}="${i}"]`).classList.remove("active");
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
			this.getEl(`[${this.cDSlide}="${i}"]`).classList.add("active");
		});
	}

	setActiveDot() {
		var active = "active";
		if (this.config.dots) {
			var a = this.getEl(`.${this.cDot}[${this.cDSlide}].` + active);
			if (a != null) a.classList.remove(active);

			this.getEl(`.${this.cDot}[${this.cDSlide}="${this.currentPage}"]`).classList.add(active);
		}
	}

	autoplayStart() {
		if (this.ap == undefined) {
			this.ap = setInterval(() => this.nextPage(), this.config.autoplayDuration);
		}
	}

	autoplayStop() {
		if (this.ap > 0) {
			clearTimeout(this.ap);
			this.ap = undefined;
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
		return this.getEl(`[${this.cDSlide}].active`);
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
		var el = this.newEl("tr"),
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

	getEl(el, all) {
		var param = `${this.containerName} ${el}`;
		return all ? document.querySelectorAll(param) : document.querySelector(param);
	}

	newEl(name) {
		return document.createElement(name);
	}
}

//polyfills
Number.isInteger =
	Number.isInteger ||
	function (value) {
		return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
	};

if (window.NodeList && !NodeList.prototype.forEach) {
	NodeList.prototype.forEach = Array.prototype.forEach;
}
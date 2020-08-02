/*! DDCarousel 1.2.2 | Danail Dinev 2019-2020 | License: https://github.com/danaildinev/ddcarousel/blob/master/LICENSE */
class DDCarousel {
	constructor(options) {
		this.appName = "DDCarousel";

		this.cCont = "ddcarousel-container";
		this.cStage = "ddcarousel-stage";
		this.cNav = "ddcarousel-nav";
		this.cItem = "ddcarousel-item";
		this.cDots = "ddcarousel-dots";
		this.cDot = "ddcarousel-dot";
		this.cPrev = "ddcarousel-prev";
		this.cNext = "ddcarousel-next";
		this.cVert = "ddcarousel-vertical";
		this.cUrl = "ddcarousel-urls";
		this.cFullW = "full-width";
		this.cDisbl = "disabled";

		this.dSlide = "data-slide";
		this.dId = "data-id";
		this.dTitle = "data-title";

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

		this.ie10 = document.all && window.atob;
		this.configOrig = options;
		this.setDefaults();
		if (this.checkContainer(this.config.container)) {
			this.trigger("onInitialize", { container: this.container, event: "onInitialize" });
			this.createStage();
			this.calculateStage();
			this.createNav();
			this.createDots();
			this.createUrls();
			this.setActiveSlides();
			this.changePage(this.config.startPage > 0 ? this.config.startPage : 0, false);
			this.refresh();
			this.attachEvents();
			this.trigger("onInitialized");
		}
	}

	setDefaults(options = this.configOrig) {
		var settings = {
			container: "." + this.appName.toLowerCase(),
			nav: false,
			dots: true,
			autoHeight: true,
			fullWidth: true,
			startPage: 0,
			items: 1,
			itemPerPage: false,
			vertical: false,
			urlNav: false,
			responsive: [],
			autoplay: false,
			autoplaySpeed: 1000,
			autoplayPauseHover: false,
			touchDrag: true,
			mouseDrag: false,
			centerSlide: false,
			touchSwipeThreshold: 60,
			touchMaxSlideDist: 500,
			resizeRefresh: 200,
			swipeSmooth: 0,
			slideChangeDuration: 0.5,
			callbacks: false,
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
		if (this.config.items == 0)
			this.config.itemPerPage = false;
	}

	callback(e) {
		return this.config.callbacks ? new Object({
			container: this.container,
			event: e,
			currentSlides: this.activeSlides,
			currentPage: this.currentPage,
			totalSlides: this.getTotalSlides(),
			totalPages: this.totalPages
		}) : undefined;
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
			s.setAttribute(this.dSlide, i);
			s.appendChild(slidesSource[i]);
			if (this.config.urlNav) {
				if (slidesSource[i].hasAttribute(this.dId) && slidesSource[i].hasAttribute(this.dTitle)) {
					s.setAttribute(this.dId, slidesSource[i].getAttribute(this.dId));
					s.setAttribute(this.dTitle, slidesSource[i].getAttribute(this.dTitle));
				}
			}
			stageDiv.appendChild(s);
		}

		//get all slides and total pages
		this.slides = this.getEl(`.${this.cItem}`, true);

	}

	calculateStage() {
		var slideWidth = this.slides[0].style.width,
			wind = window.getComputedStyle(this.container),
			containerWidth,
			containerHeight,
			totalPages,
			contClassList = this.container.classList;

		if (this.config.fullWidth) {
			contClassList.add(this.cFullW);
		} else {
			contClassList.remove(this.cFullW);
		}

		if (this.config.vertical) {
			contClassList.add(this.cVert);
		} else {
			contClassList.remove(this.cVert);
		}
		containerWidth = parseInt(wind.width);
		containerHeight = parseInt(wind.height)

		if (this.slides.length <= this.config.items) {
			this.config.items = this.slides.length;
		}

		if (this.config.centerSlide) {
			totalPages = this.slides.length - 1
		} else if (this.config.itemPerPage) {
			totalPages = this.slides.length - this.config.items
		} else {
			totalPages = Math.ceil(this.slides.length / this.config.items) - 1;
		}
		this.totalPages = totalPages;

		this.slidesHeights = [];
		var width = 0;
		for (var i = 0; i < this.slides.length; i++) {
			//set current slide size
			if (this.config.items != 0) {
				if (this.config.vertical) {
					this.slides[i].style.width = containerWidth + "px";
				} else if (this.config.vertical) {
					this.slides[i].style.height = containerHeight / this.config.items + "px";
				} else if (!this.config.vertical) {
					this.slides[i].style.width = containerWidth / this.config.items + "px";
				}
			} else {
				var w = this.slides[i].getBoundingClientRect().width;
				this.slides[i].style.width = w + "px";
				width += w;
			}
			this.slidesHeights.push(
				this.getOuterHeight(this.getEl(`[${this.dSlide}="${i}"] > div`))
			);
		}

		if (!this.config.vertical) {
			this.stage.style.width = this.config.items == 0 ? (width + "px") : ((containerWidth * this.slides.length) + "px");
		}

		if (this.config.autoHeight) {
			this.setActiveSlides();
			this.calculateContainerHeight(this.currentPage);
		}

		if (this.config.mouseDrag) {
			this.stage.classList.add(this.cDisbl);
		} else {
			this.stage.classList.remove(this.cDisbl);
		}

		if (slideWidth != this.slides[0].style.width) this.trigger("onResized");
	}

	getOuterHeight(el) {
		var height = el.offsetHeight,
			style = getComputedStyle(el);

		height += parseInt(style.marginTop) + parseInt(style.marginBottom);
		return height;
	}

	checkNavStatus() {
		return this.config.nav && this.totalPages > 0
	}

	createNav() {
		var navDiv = this.getEl(`.${this.cNav}`);

		if (this.checkNavStatus()) {
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

	checkDotsStatus() {
		return this.config.dots && this.totalPages > 0
	}

	createDots() {
		var dotsDiv = this.getEl(`.${this.cDots}`);

		if (this.checkDotsStatus()) {
			var targetSlidesLenght,
				dotsContainer = this.newEl("div");

			if (dotsDiv)
				dotsDiv.remove();

			dotsContainer.classList.add(this.cDots);

			if (this.config.items > 1) {
				targetSlidesLenght = this.config.centerSlide ? this.slides.length : this.totalPages + 1;
			} else {
				targetSlidesLenght = this.slides.length;
			}

			for (var i = 0; i < targetSlidesLenght; i++) {
				var dot = this.newEl("button");
				dot.classList.add(this.cDot);
				dot.setAttribute(this.dSlide, i);
				dot.addEventListener("click", e => this.changePage(parseInt(e.target.getAttribute(this.dSlide))));

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
				if (el.hasAttribute(this.dId) && el.hasAttribute(this.dTitle)) {
					var li = this.newEl('li'),
						a = this.newEl('a');

					a.href = "#" + el.getAttribute(this.dId);
					a.innerHTML = el.getAttribute(this.dTitle);

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
				this.refresh();
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

	refresh() {
		var keys = Object.keys(this.configResp);
		//check responsive options
		for (var i = keys.length - 1; i >= 0; i--) {
			if (document.body.clientWidth < keys[i]) {
				this.updateSettings(Object.values(this.configResp)[i]);
			} else if (document.body.clientWidth >= keys[keys.length - 1]) {
				this.setDefaults();
			}
		}
		this.calculateStage();
		this.createNav();
		this.createDots();
		this.setActiveDot();
		this.setActiveSlides();
		this.createUrls();
		this.autoplayStop();
		if (this.config.autoplay && this.ap == undefined) {
			this.autoplayStart();
		}
		this.updateSlide();
		this.refreshNav();
	}

	setDraggingEvents() {
		var startDrag = ["touchstart", "mousedown"],
			movingDrag = ["touchmove", "mousemove"],
			endDrag = ["touchend", "mouseup"],
			startEl = this.ie10 ? this.stage : window;
		startDrag.forEach(el => startEl.addEventListener(el, e => this.dragStart(e), { passive: true }));
		movingDrag.forEach(el => window.addEventListener(el, e => this.dragMove(e), { passive: true }));
		endDrag.forEach(el => window.addEventListener(el, () => this.dragEnd()));
	}

	dragMove(e) {
		if (this.isDragging) {
			var input = this.getInput(e, "mousemove", "touchmove");

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

	getInput(e, mouseEvent, touchEvent) {
		if (e.type == mouseEvent && this.config.mouseDrag) {
			return this.config.vertical ? e.clientY : e.pageX;
		} else if (e.type == touchEvent && this.config.touchDrag) {
			return this.config.vertical ? e.targetTouches[0].pageY : e.targetTouches[0].pageX;
		}
	}

	dragStart(e) {
		if (this.ie10 || e.target == this.stage) {
			var startPoint = this.getInput(e, "mousedown", "touchstart");
			if (startPoint !== undefined) {
				this.isDragging = true;
				this.touchStartRaw = startPoint;
				this.touchStart = this.touchStartRaw + -this.currentTranslate;
				this.origPosition = this.currentTranslate;
				this.dontChange = false;
				this.trigger("onDrag");
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
		if (this.checkNavStatus()) {
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
		var output = this.config.vertical ? `translateY(${int}px)` : `translateX(${int}px)`;
		if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) { //for older webkit browsers
			this.stage.style.webkitTransform = output;
		} else {
			this.stage.style.transform = output;
		}
	}

	calculateContainerHeight() {
		if (this.config.items == 1) {
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
		var item = this.getEl(`.${this.cItem}[${this.dId}="${id}"]`);
		this.changePage(parseInt(item.getAttribute(this.dSlide)), enableAnim);
	}

	updateSlide() {
		if (this.config.centerSlide && this.config.items > 0) {
			var output =
				-this.getSlidePos(this.getCurrentSlideDom()) -
				-(parseInt(this.getSlideStyle().width) * Math.floor(this.config.items / 2));

			this.currentTranslate = output;
			this.scrollToPos(output);
		} else {
			this.scrollToSlide(this.getCurrentSlideDom());
		}
	}

	setActiveSlides() {
		if (this.activeSlides != null) {
			this.activeSlides.forEach(i => {
				this.getEl(`[${this.dSlide}="${i}"]`).classList.remove("active");
			});
		}

		this.activeSlides = [];
		if (this.config.centerSlide) {
			this.activeSlides.push(this.currentPage);
		} else if (this.config.itemPerPage) {
			for (
				var index = this.currentPage;
				index < this.currentPage + this.config.items;
				index++
			) {
				this.activeSlides.push(index);
			}
		} else {
			if (this.getSlideIndexForPage() + this.config.items > this.getTotalSlides()) {
				for (
					var index = this.slides.length - this.config.items;
					index < this.getTotalSlides();
					index++
				) {
					this.activeSlides.push(index);
				}
			} else {
				if (this.config.items == 0) {
					console.log('yeah');
					this.activeSlides.push(this.getSlideIndexForPage());
				} else {
					for (
						var index = this.getSlideIndexForPage();
						index < this.getSlideIndexForPage() + this.config.items;
						index++
					) {
						if (index < this.slides.length) {
							this.activeSlides.push(index);
						}
					}
				}
			}
		}

		this.activeSlides.forEach(i => {
			this.getEl(`[${this.dSlide}="${i}"]`).classList.add("active");
		});
	}

	setActiveDot() {
		var active = "active";
		if (this.checkDotsStatus()) {
			var a = this.getEl(`.${this.cDot}[${this.dSlide}].` + active);
			if (a != null) a.classList.remove(active);

			this.getEl(`.${this.cDot}[${this.dSlide}="${this.currentPage}"]`).classList.add(active);
		}
	}

	autoplayStart() {
		if (this.ap == undefined) {
			this.ap = setInterval(() => this.nextPage(), this.config.autoplaySpeed);
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
		return this.currentPage * (this.config.items > 0 ? this.config.items : 1);
	}

	getCurrentSlideDom() {
		return this.getEl(`[${this.dSlide}].active`);
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

if (!('remove' in Element.prototype)) {
	Element.prototype.remove = function () {
		var a = this.parentNode;
		if (a) {
			a.removeChild(this);
		}
	};
}

Object.values = Object.values || (x => Object.keys(x).map(k => x[k]));

export default DDCarousel;
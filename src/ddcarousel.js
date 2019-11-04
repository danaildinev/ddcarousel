/*! DDCarousel 1.2 by Danail Dinev 2019 | License: https://github.com/danaildinev/ddcarousel/blob/master/LICENSE */
const appName = "DDCarousel";
const app = appName.toLowerCase();
const cCont = app + "-container";
const cStage = app + "-stage";
const cNav = app + "-nav";
const cItem = app + "-item";
const cResp = app + "-responsive";
const cContDots = app + "-dots";
const cDot = app + "-dot";
const cPrev = app + "-prev";
const cNext = app + "-next";
const cVert = app + "-vertical";
const cUrl = app + "-urls";
const cDSlide = "data-slide";
const cDId = "data-id";
const cDTitle = "data-title";

class DDCarousel {
	constructor(options) {
		this.currentPage = 0;
		this.eStart = [];
		this.eMove = [];
		this.eEnd = [];
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

		this.origOptions = options;
		this.updateSettings(options);
		if (this.checkContainer(this.config.container)) {

			this.trigger("onInitialize", { container: this.container, event: "onInitialize" });

			this.createStage();
			this.setActiveSlides();
			this.calculateStage();
			this.attachEvents();
			this.refreshOnResize();
			if (this.config.nav) this.refreshNav();
			if (this.config.startPage > -1) {
				this.changePage(this.config.startPage, false);
			}

			this.trigger("onInitialized");
		}
	}

	updateSettings(options) {
		var settings = {
			container: "." + app,
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

		if (options['responsive']) {
			this.responsiveOptions = options['responsive'];
			delete options['responsive'];
		}

		for (var name in options) {
			settings[name] = options[name];
		}

		if (options['urlNav'])
			settings['itemPerPage'] = true;

		this.config = settings;
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
			console.error(`${appName}: Invalid container!`);
			return false;
		}
	}

	createStage() {
		var stageContainer = this.newEl("div"),
			stageDiv = this.newEl("div"),
			slidesSource = this.getEl(`> div`, true); //get all slides from user

		stageContainer.classList.add(cCont);
		stageDiv.classList.add(cStage);

		//add the stage to the main container
		this.container.appendChild(stageContainer);
		stageContainer.appendChild(stageDiv);

		//get stage DOM
		this.stage = this.getEl(`.${cStage}`);

		//set width to 100% if responsive is enabled and change container width
		if (this.config.fullWidth) {
			this.container.classList.add(cResp);
		}

		if (this.config.vertical) {
			this.container.classList.add(cVert);
		}

		//set parameters to slides and add them in the new ddcarousel-item container with some params
		for (var i = 0; i < slidesSource.length; i++) {
			var s = this.newEl("div");
			s.classList.add(cItem);
			s.setAttribute(cDSlide, i);
			s.appendChild(slidesSource[i]);
			if (this.config.urlNav) {
				if (slidesSource[i].hasAttribute(cDId) && slidesSource[i].hasAttribute(cDTitle)) {
					s.setAttribute(cDId, slidesSource[i].getAttribute(cDId));
					s.setAttribute(cDTitle, slidesSource[i].getAttribute(cDTitle));
				}
			}
			stageDiv.appendChild(s);
		}

		//get all slides and total pages
		this.slides = this.getEl(`.${cItem}`, true);

		this.createNav();
		this.createDots();
		this.createUrls();
	}

	calculateStage() {
		var slideWidth = this.slides[0].style.width,
			wind = window.getComputedStyle(this.container),
			containerWidth = parseInt(wind.width),
			containerHeight = parseInt(wind.height),
			totalPages;

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
				this.getEl(`[${cDSlide}="${i}"] > div`).scrollHeight
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
		var navDiv = this.getEl(`.${cNav}`);

		if (this.config.nav) {
			var navContainer = this.newEl("div"),
				leftBtn = this.newEl("button"),
				rightBtn = this.newEl("button");

			if (navDiv)
				navDiv.remove();

			navContainer.classList.add(cNav);

			leftBtn.classList.add(cPrev);
			leftBtn.innerHTML = this.config.labelNavPrev;

			rightBtn.classList.add(cNext);
			rightBtn.innerHTML = this.config.labelNavNext;

			//add buttons in nav container
			navContainer.appendChild(leftBtn);
			navContainer.appendChild(rightBtn);

			this.container.appendChild(navContainer);

			this.navPrevBtn = this.getEl(`.${cPrev}`);
			this.navNextBtn = this.getEl(`.${cNext}`);
		} else {
			if (navDiv != null)
				navDiv.remove();
		}
	}

	createDots() {
		var dotsDiv = this.getEl(`.${cContDots}`);

		if (this.config.dots) {
			var targetSlidesLenght,
				dotsContainer = this.newEl("div");

			if (dotsDiv)
				dotsDiv.remove();

			dotsContainer.classList.add(cContDots);

			if (this.config.itemsPerPage > 1) {
				targetSlidesLenght = this.config.centerSlide ? this.slides.length : this.totalPages + 1;
			} else {
				targetSlidesLenght = this.slides.length;
			}

			for (var i = 0; i < targetSlidesLenght; i++) {
				var dot = this.newEl("button");
				dot.classList.add(cDot);
				dot.setAttribute(cDSlide, i);
				dot.addEventListener("click", e => this.changePage(parseInt(e.target.getAttribute(cDSlide))));

				dotsContainer.appendChild(dot);
			}

			this.container.appendChild(dotsContainer);
		} else {
			if (dotsDiv != null)
				dotsDiv.remove();
		}
	}

	createUrls() {
		this.urlsDiv = this.getEl(`.${cUrl}`);

		if (this.config.urlNav) {
			var cont = this.newEl("div"),
				list = this.newEl("ul");

			if (this.urlsDiv)
				this.urlsDiv.remove();

			cont.classList.add(cUrl);
			this.slides.forEach(el => {
				if (el.hasAttribute(cDId) && el.hasAttribute(cDTitle)) {
					var li = this.newEl('li'),
						a = this.newEl('a');

					a.href = "#" + el.getAttribute(cDId);
					a.innerHTML = el.getAttribute(cDTitle);

					li.appendChild(a);
					list.appendChild(li);
				}
			})

			cont.appendChild(list);
			this.container.appendChild(cont);
		} else {
			if (this.urlsDiv != null)
				this.urlsDiv.remove();
		}
	}

	attachEvents() {
		var throttled;
		//nav buttons
		if (this.config.nav) {
			this.navPrevBtn.addEventListener("click", () => this.prevPage());
			this.navNextBtn.addEventListener("click", () => this.nextPage());
			this.on("onChanged", () => {
				this.refreshNav();
			});
		}

		//resize event
		window.addEventListener("resize", () => {
			if (!throttled) {
				this.refreshOnResize();
				throttled = true;
				setTimeout(function () {
					throttled = false;
				}, 200);
			}
		});

		//anim
		this.stage.addEventListener(this.whichTransitionEvent(), () => {
			this.trigger("onTransitionend");
		});

		//touch events
		this.attachTouchEvents();

		//urls
		if (this.config.urlNav) {
			var links = this.getEl(`.${cUrl} a`, true);
			links.forEach(el => {
				el.addEventListener("click", e => {
					this.goToUrl(el.getAttribute('href').substring(1))
				})
			})
		}
	}

	refreshOnResize() {
		//check responsive options
		for (let i = 0; i < Object.keys(this.responsiveOptions).length; i++) {
			if (document.body.clientWidth <= Object.keys(this.responsiveOptions)[i]) {
				this.updateSettings(Object.values(this.responsiveOptions)[i]);
				break;
			} else {
				this.updateSettings(this.origOptions);
			}
		}
		this.calculateStage();
		this.createNav();
		this.createDots();
		this.setActiveDot();
		this.attachTouchEvents();
		this.updateSlide();
		this.createUrls();
	}

	attachTouchEvents() {
		this.eStart.forEach(el => {
			(document.all && window.atob)
				? this.stage.removeEventListener(el, this.getStartingDragPos.bind(this), { passive: true }) //ie10fix
				: window.removeEventListener(el, this.getStartingDragPos.bind(this), { passive: true })
		});
		this.eMove.forEach(el => window.removeEventListener(el, this.dragMove.bind(this), { passive: true }));
		this.eEnd.forEach(el => window.removeEventListener(el, this.dragEnd.bind(this)));

		this.eStart = [];
		this.eMove = [];
		this.eEnd = [];

		//add events based on options
		if (this.config.touch) {
			this.eStart.push("touchstart");
			this.eMove.push("touchmove");
			this.eEnd.push("touchend");
		}
		if (this.config.touchMouse) {
			this.eStart.push("mousedown");
			this.eMove.push("mousemove");
			this.eEnd.push("mouseup");
		}

		this.eStart.forEach(el => {
			(document.all && window.atob)
				? this.stage.addEventListener(el, this.getStartingDragPos.bind(this), { passive: true }) //ie10fix
				: window.addEventListener(el, this.getStartingDragPos.bind(this), { passive: true })
		});
		this.eMove.forEach(el => window.addEventListener(el, this.dragMove.bind(this), { passive: true }));
		this.eEnd.forEach(el => window.addEventListener(el, this.dragEnd.bind(this)));
	}

	dragMove(e) {
		if (this.isDragging) {
			var input;
			if (e.type == "mousemove" && this.config.touchMouse) {
				input = this.config.vertical ? e.clientY : e.pageX;
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
				this.trigger("onDragging");
				this.scrollToPos(this.currentTouch);
			} else {
				this.dontChange = true;
				this.currentTouch = input - this.touchStart;
			}
		}
	}

	getStartingDragPos(e) {
		if (e.target == this.stage) {
			this.isDragging = true;

			//set some starting values
			this.touchStartRaw =
				e.type == "mousedown" && this.config.touchMouse
					? (this.config.vertical ? e.clientY : e.pageX)
					: (this.config.vertical ? e.targetTouches[0].clientY : e.targetTouches[0].pageX);
			this.touchStart = this.touchStartRaw + -this.currentTranslate;

			//remember orig position
			this.origPosition = this.currentTranslate;
			this.dontChange = false;

			this.trigger("onDrag");
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
		var item = this.getEl(`.${cItem}[${cDId}="${id}"]`);
		this.changePage(parseInt(item.getAttribute(cDSlide)), enableAnim);
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
				this.getEl(`[${cDSlide}="${i}"]`).classList.remove("active");
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
			this.getEl(`[${cDSlide}="${i}"]`).classList.add("active");
		});
	}

	setActiveDot() {
		var active = "active";
		if (this.config.dots) {
			var a = this.getEl(`.${cDot}[${cDSlide}].` + active);
			if (a != null) a.classList.remove(active);

			this.getEl(`.${cDot}[${cDSlide}="${this.currentPage}"]`).classList.add(active);
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
		return this.getEl(`[${cDSlide}].active`);
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
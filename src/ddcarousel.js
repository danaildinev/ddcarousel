var ddcarousel = function (options) {
	const appName = "ddcarousel",
		cssClass = {
			cont: "ddcarousel-container",
			stage: "ddcarousel-stage",
			nav: "ddcarousel-nav",
			item: "ddcarousel-item",
			dots: "ddcarousel-dots",
			dot: "ddcarousel-dot",
			prev: "ddcarousel-prev",
			next: "ddcarousel-next",
			vert: "ddcarousel-vertical",
			url: "ddcarousel-urls",
			fullW: "full-width",
			disable: "disabled"
		},
		dataTags = {
			slide: "data-slide",
			id: "data-id",
			title: "data-title",
			lazyImg: "data-src"
		},
		triggers = [
			"onInitialize",
			"onInitialized",
			"onDrag",
			"onDragging",
			"onDragged",
			"onChanged",
			"onTransitionend",
			"onResized",
			"onDestroy",
			"onDestroyed",
		],
		ie10 = document.all && window.atob;

	var config,
		configUser,
		configResponsive,
		configDefault,
		//carousel
		container,
		stage,
		slides,
		slidesSource,
		slidesHeights,
		activeSlides,
		currentPage,
		totalPages,
		//autoplay
		autoPlay,
		autoPlayStartEvents = ["mouseover", "touchstart"],
		autoPlayStopEvents = ["mouseleave", "touchend"],
		//touch and mouse
		startDrag = ["touchstart", "mousedown"],
		movingDrag = ["touchmove", "mousemove"],
		endDrag = ["touchend", "mouseup"],
		dragStartElement,
		touchStartRawCords,
		touchStartCords,
		currentTouch,
		isDragging,
		swipeDistance,
		origPosition,
		stayOnThisSlide,
		currentTranslate,
		//app
		appCreated,
		origClasses,
		containerName,
		//ui		
		navPrevBtn,
		navNextBtn,
		//others
		throttled;

	init(options);

	function init(options) {
		if (appCreated) {
			console.error(`${appName}: Already created!`);
			return false;
		}
		if (options == undefined) {
			return false;
		}

		configDefault = {
			container: "." + appName,
			nav: false,
			dots: true,
			autoHeight: true,
			fullWidth: true,
			startPage: 0,
			items: 1,
			itemPerPage: false,
			vertical: false,
			verticalMaxContentWidth: false,
			urlNav: false,
			lazyLoad: false,
			lazyPreload: false,
			lazyPreloadSlides: 1,
			responsive: [],
			autoplay: false,
			autoplaySpeed: 1000,
			autoplayPauseHover: false,
			touchDrag: true,
			mouseDrag: false,
			keyboardNavigation: false,
			centerSlide: false,
			touchSwipeThreshold: 60,
			touchMaxSlideDist: 500,
			resizeRefresh: 200,
			swipeSmooth: 0,
			slideChangeDuration: 0.5,
			callbacks: false,
			labelNavPrev: "&#x2190;",
			labelNavNext: "&#x2192;"
		};
		currentPage = 0;
		totalPages = 0;
		activeSlides = [];
		configUser = {};

		//get user specified config or set defaults
		configUser = options === undefined ? configDefault : options;

		setDefaults();
		if (checkContainer(config.container)) {
			origClasses = document.querySelector(config.container).className;
			trigger("onInitialize", { container: container, event: "onInitialize" });
			if (createStage() !== false) {
				createNav();
				createDots();
				createUrls();
				setActiveSlides();
				changePage(config.startPage > 0 ? config.startPage : 0, false);
				refresh();
				attachEvents();
				trigger("onInitialized");
				appCreated = true;
			}
		}
	}

	function setDefaults() {
		config = [];
		configResponsive = [];
		triggers.forEach(el => {
			configDefault[el] = () => { };
			on(el, e => {
				config[el].call(this, e != undefined ? e : callback(el));
			});
		});
		if (configUser['responsive'] !== undefined) {
			configResponsive = configUser['responsive'];
		}
		config = configDefault;
		updateSettings(configUser);
	}

	function updateSettings(options) {
		/* updating event triggers is not supported for now! */
		for (var name in options) {
			config[name] = options[name];
		}
		if (config.items == 0)
			config.itemPerPage = false;
	}

	function checkContainer(name) {
		var c = document.querySelector(name);
		if (c != null) {
			container = c;
			containerName = name;
			return true;
		} else {
			console.error(`${appName}: Invalid container!`);
			return false;
		}
	}

	function callback(e) {
		return config.callbacks ? new Object({
			container: container,
			event: e,
			currentSlides: activeSlides,
			currentPage: currentPage,
			totalSlides: getTotalSlides(),
			totalPages: totalPages
		}) : undefined;
	}

	function on(event, callback) {
		if (!triggers[event]) triggers[event] = [];
		triggers[event].push(callback);
	}

	function trigger(event, callback) {
		if (triggers[event]) {
			for (var i in triggers[event]) triggers[event][i](callback);
		}
	}

	function createStage() {
		var stateContainer = newEl("div"),
			stageDiv = newEl("div");
		slidesSource = getEl(`> div`, true); //get all slides from user

		stateContainer.classList.add(cssClass.cont);
		stageDiv.classList.add(cssClass.stage);

		//add the stage to the main container
		container.appendChild(stateContainer);
		stateContainer.appendChild(stageDiv);

		//get stage DOM
		stage = getEl(`.${cssClass.stage}`);

		if (slidesSource.length == 0) {
			console.error(`${appName}: No content found in container. Destroying carousel...`);
			destroy();
			return false;
		}

		//set parameters to slides and add them in the new ddcarousel-item container with some params
		for (var i = 0; i < slidesSource.length; i++) {
			var s = newEl("div");
			s.classList.add(cssClass.item);
			s.setAttribute(dataTags.slide, i);
			s.appendChild(slidesSource[i]);
			if (config.urlNav) {
				if (slidesSource[i].hasAttribute(dataTags.id) && slidesSource[i].hasAttribute(dataTags.title)) {
					s.setAttribute(dataTags.id, slidesSource[i].getAttribute(dataTags.id));
					s.setAttribute(dataTags.title, slidesSource[i].getAttribute(dataTags.title));
				}
			}
			stageDiv.appendChild(s);
		}

		//get all slides and total pages
		slides = getEl(`.${cssClass.item}`, true);

		calculateStage();
	}

	function destroy(fullReset) {
		trigger("onDestroy");
		var app = document.querySelector(config.container);

		if (!fullReset) {
			var origSlides = getEl(`.${cssClass.item}`, true);
			origSlides.forEach(el => {
				app.appendChild(el.firstChild);
			});
		}

		var cont = getEl(`.${cssClass.cont}`);
		if (cont)
			cont.remove();
		if (checkNavStatus())
			getEl(`.${cssClass.nav}`).remove();
		if (checkDotsStatus())
			getEl(`.${cssClass.dots}`).remove();
		if (config.urlNav && getEl(`.${cssClass.url}`))
			getEl(`.${cssClass.url}`).remove();

		if (autoPlay)
			autoplayStop();

		detachEvents();

		app.className = origClasses;
		currentPage = 0;
		totalPages = 0;
		slides = [];
		activeSlides = [];
		slidesSource = [];
		appCreated = false;

		trigger("onDestroyed");

		triggers.forEach(el => {
			triggers[el] = [];
		});

		return true;
	}

	function calculateStage() {
		var slideWidth = slides[0].style.width,
			wind = window.getComputedStyle(container),
			containerWidth,
			containerHeight,
			containerClassList = container.classList;

		if (config.fullWidth && !config.verticalMaxContentWidth) {
			containerClassList.add(cssClass.fullW);
		} else {
			containerClassList.remove(cssClass.fullW);
		}

		if (config.vertical) {
			containerClassList.add(cssClass.vert);
		} else {
			containerClassList.remove(cssClass.vert);
		}
		containerWidth = parseInt(wind.width);
		containerHeight = parseInt(wind.height)

		if (slides.length <= config.items) {
			config.items = slides.length;
		}

		if (config.centerSlide) {
			totalPages = slides.length - 1
		} else if (config.itemPerPage) {
			totalPages = slides.length - config.items
		} else {
			totalPages = Math.ceil(slides.length / config.items) - 1;
		}
		totalPages = totalPages;

		slidesHeights = [];
		var width = 0;
		for (var i = 0; i < slides.length; i++) {
			//set current slide size
			if (config.items != 0) {
				if (config.vertical) {
					slides[i].style.height = containerHeight / config.items + "px";
				} else if (!config.vertical) {
					slides[i].style.width = containerWidth / config.items + "px";
				}
			} else {
				var w = slides[i].getBoundingClientRect();
				slides[i].style.width = w.width + "px";
				width += w;
			}
			slidesHeights.push(
				getOuterHeight(getEl(`[${dataTags.slide}="${i}"] > div`))
			);
		}

		if (!config.vertical) {
			stage.style.width = config.items == 0 ? (width + "px") : ((containerWidth * slides.length) + "px");
		}

		if (config.verticalMaxContentWidth) {
			var maxWidth = 0, elWidth;
			slidesSource.forEach(el => {
				elWidth = el.getBoundingClientRect().width;
				if (elWidth > maxWidth) {
					maxWidth = elWidth;
				}
			});
			container.style.width = maxWidth + "px";
		}

		if (config.autoHeight) {
			setActiveSlides();
			calculatecontainerHeight(currentPage);
		}

		if (config.mouseDrag) {
			stage.classList.add(cssClass.disable);
		} else {
			stage.classList.remove(cssClass.disable);
		}

		if (slideWidth != slides[0].style.width) trigger("onResized");
	}

	function getOuterHeight(el) {
		var height = el.offsetHeight,
			style = getComputedStyle(el);

		height += parseInt(style.marginTop) + parseInt(style.marginBottom);
		return height;
	}

	function checkNavStatus() {
		return config.nav && totalPages > 0
	}

	function createNav() {
		var navDiv = getEl(`.${cssClass.nav}`);

		if (checkNavStatus()) {
			var navcontainer = newEl("div"),
				leftBtn = newEl("button"),
				rightBtn = newEl("button");

			if (navDiv)
				navDiv.remove();

			navcontainer.classList.add(cssClass.nav);

			leftBtn.classList.add(cssClass.prev);
			leftBtn.innerHTML = config.labelNavPrev;

			rightBtn.classList.add(cssClass.next);
			rightBtn.innerHTML = config.labelNavNext;

			//add buttons in nav container
			navcontainer.appendChild(leftBtn);
			navcontainer.appendChild(rightBtn);

			container.appendChild(navcontainer);

			navPrevBtn = getEl(`.${cssClass.prev}`);
			navNextBtn = getEl(`.${cssClass.next}`);
			navPrevBtn.addEventListener("click", () => prevPage());
			navNextBtn.addEventListener("click", () => nextPage());
		} else {
			if (navDiv != null)
				navDiv.remove();
		}
	}

	function checkDotsStatus() {
		return config.dots && totalPages > 0
	}

	function createDots() {
		var dotsDiv = getEl(`.${cssClass.dots}`);

		if (checkDotsStatus()) {
			var targetSlidesLenght,
				dotscontainer = newEl("div");

			if (dotsDiv)
				dotsDiv.remove();

			dotscontainer.classList.add(cssClass.dots);

			if (config.items > 1) {
				targetSlidesLenght = config.centerSlide ? slides.length : totalPages + 1;
			} else {
				targetSlidesLenght = slides.length;
			}

			for (var i = 0; i < targetSlidesLenght; i++) {
				var dot = newEl("button");
				dot.classList.add(cssClass.dot);
				dot.setAttribute(dataTags.slide, i);
				dot.addEventListener("click", e => changePage(parseInt(e.target.getAttribute(dataTags.slide))));

				dotscontainer.appendChild(dot);
			}
			container.appendChild(dotscontainer);
		} else {
			if (dotsDiv != null)
				dotsDiv.remove();
		}
	}

	function createUrls() {
		var urlsDiv = getEl(`.${cssClass.url}`);

		if (config.urlNav) {
			var urlcontainer = newEl("div"),
				list = newEl("ul");

			if (urlsDiv)
				urlsDiv.remove();

			urlcontainer.classList.add(cssClass.url);
			slides.forEach(el => {
				if (el.hasAttribute(dataTags.id) && el.hasAttribute(dataTags.title)) {
					var li = newEl('li'),
						a = newEl('a');

					a.href = "#" + el.getAttribute(dataTags.id);
					a.innerHTML = el.getAttribute(dataTags.title);

					li.appendChild(a);
					list.appendChild(li);
				}
			})

			urlcontainer.appendChild(list);
			container.appendChild(urlcontainer);

			getEl(`.${cssClass.url} a`, true).forEach(el => {
				el.addEventListener("click", e => {
					goToUrl(el.getAttribute('href').substring(1))
				})
			})
		} else {
			if (urlsDiv != null)
				urlsDiv.remove();
		}
	}

	function lazyLoad() {
		if (config.lazyLoad) {
			if (config.lazyPreload) {
				const lastActiveIndex = activeSlides[activeSlides.length - 1];
				for (var i = lastActiveIndex + 1; i <= lastActiveIndex + config.lazyPreloadSlides; i++)
					if (i < slides.length && activeSlides.indexOf(i) == -1)
						activeSlides.push(i);
			}

			activeSlides.forEach(i => {
				const images = getEl(`[${dataTags.slide}="${i}"] img[data-src]`, true);
				images.forEach(i => enableImageSrc(i));
			});
		}
	}

	function enableImageSrc(slideImg) {
		if (slideImg && slideImg.getAttribute(dataTags.lazyImg) && !slideImg.src) {
			slideImg.src = slideImg.getAttribute(dataTags.lazyImg);
			slideImg.removeAttribute(dataTags.lazyImg);
		}
	}

	function attachEvents() {
		dragStartElement = ie10 ? stage : window;

		startDrag.forEach(el => dragStartElement.addEventListener(el, dragStart, { passive: true }));
		movingDrag.forEach(el => window.addEventListener(el, dragMove, { passive: true }));
		endDrag.forEach(el => window.addEventListener(el, dragEnd));

		window.addEventListener("resize", resizeEvent); //resize event
		stage.addEventListener(whichTransitionEvent(), transitionEvent); //anim

		//autoplay
		if (config.autoplayPauseHover && config.autoplay) {
			attachAutoplay();
		} else {
			detachAutoplay();
		}

		if (config.keyboardNavigation)
			window.addEventListener("keydown", keyboardHandler);
	}

	function detachEvents() {
		dragStartElement = ie10 ? stage : window;

		startDrag.forEach(el => dragStartElement.removeEventListener(el, dragStart, { passive: true }));
		movingDrag.forEach(el => window.removeEventListener(el, dragMove, { passive: true }));
		endDrag.forEach(el => window.removeEventListener(el, dragEnd));
		window.removeEventListener("resize", resizeEvent);
		stage.removeEventListener(whichTransitionEvent(), transitionEvent);
		detachAutoplay();

		if (config.keyboardNavigation)
			window.removeEventListener("keydown", keyboardHandler);
	}

	function attachAutoplay() {
		autoPlayStartEvents.forEach(el => stage.addEventListener(el, autoplayStop));
		autoPlayStopEvents.forEach(el => stage.addEventListener(el, autoplayStart));
	}

	function detachAutoplay() {
		autoPlayStartEvents.forEach(el => stage.removeEventListener(el, autoplayStop));
		autoPlayStopEvents.forEach(el => stage.removeEventListener(el, autoplayStart));
	}

	function transitionEvent() {
		trigger("onTransitionend");
	}

	function resizeEvent() {
		calculateStage();
		if (!throttled) {
			refresh();
			throttled = true;
			setTimeout(function () {
				throttled = false;
			}, config.resizeRefresh);
		}
	}

	function refresh() {
		var keys = Object.keys(configResponsive);
		//check responsive options
		for (var i = keys.length - 1; i >= 0; i--) {
			if (document.body.clientWidth < keys[i]) {
				updateSettings(Object.values(configResponsive)[i]);
			} else if (document.body.clientWidth >= keys[keys.length - 1]) {
				setDefaults();
			}
		}
		calculateStage();
		createNav();
		createDots();
		setActiveDot();
		setActiveSlides();
		createUrls();
		autoplayStop();
		if (config.autoplay && autoPlay == undefined) {
			autoplayStart();
		}
		updateSlide();
		refreshNav();
	}

	function dragMove(e) {
		if (isDragging) {
			var input = getInput(e, "mousemove", "touchmove");

			//disable transition to get more responsive dragging
			stage.style.transitionDuration = config.swipeSmooth + "s";

			//calcualte swipe distance between starging value cnd current value
			swipeDistance = Math.abs(input - touchStartRawCords);

			//get the current touch
			currentTouch = input - touchStartCords;

			//move slider until max swipe lenght is reached
			if (swipeDistance <= config.touchMaxSlideDist) {
				trigger("onDragging");
				scrollToPos(currentTouch);
			} else {
				stayOnThisSlide = true;
				currentTouch = input - touchStartCords;
			}
		}
	}

	function getInput(e, mouseEvent, touchEvent) {
		if (e.type == mouseEvent && config.mouseDrag) {
			return config.vertical ? e.clientY : e.pageX;
		} else if (e.type == touchEvent && config.touchDrag) {
			return config.vertical ? e.targetTouches[0].pageY : e.targetTouches[0].pageX;
		}
	}

	function dragStart(e) {
		if (ie10 || e.target == stage) {
			var startPoint = getInput(e, "mousedown", "touchStartCords");
			if (startPoint !== undefined) {
				isDragging = true;
				touchStartRawCords = startPoint;
				touchStartCords = touchStartRawCords + -currentTranslate;
				origPosition = currentTranslate;
				stayOnThisSlide = false;
				trigger("onDrag");
			}
		}
	}

	function dragEnd() {
		if (isDragging) {
			//check if swipe distance is enough to change slide or stay on the same
			trigger("onDragged");

			if (swipeDistance >= config.touchSwipeThreshold && !stayOnThisSlide) {
				if (currentTouch > origPosition) {
					prevPage();
				} else {
					nextPage();
				}
			} else {
				scrollToPos(origPosition);
			}

			stage.style.transitionDuration = config.slideChangeDuration + "s";
			isDragging = false;
		}
	}

	function keyboardHandler(e) {
		// don't trigger while typing
		if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')
			return;

		switch (e.key) {
			case "ArrowLeft":
			case "ArrowUp":
				prevPage();
				e.preventDefault();
				break;
			case "ArrowRight":
			case "ArrowDown":
				nextPage();
				e.preventDefault();
				break;
		}
	}

	function refreshNav() {
		if (checkNavStatus()) {
			var inactive = "inactive";
			if (currentPage == 0) {
				navPrevBtn.classList.add(inactive);
				navNextBtn.classList.remove(inactive);
			} else if (currentPage == totalPages) {
				navPrevBtn.classList.remove(inactive);
				navNextBtn.classList.add(inactive);
			} else {
				navPrevBtn.classList.remove(inactive);
				navNextBtn.classList.remove(inactive);
			}
		}
	}

	function scrollToSlide(slide) {
		currentTranslate = -getSlidePos(slide);
		scrollToPos(currentTranslate);
	}

	function scrollToPos(int) {
		var output = config.vertical ? `translateY(${int}px)` : `translateX(${int}px)`;
		if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) { //for older webkit browsers
			stage.style.webkitTransform = output;
		} else {
			stage.style.transform = output;
		}
	}

	function calculatecontainerHeight() {
		if (config.items == 1) {
			container.style.height = slidesHeights[currentPage] + "px";
		} else {
			var heights = [];

			//get specified slides from global array with heights and then get the highest of it
			for (var i = activeSlides[0]; i <= activeSlides[activeSlides.length - 1]; i++) {
				heights.push(slidesHeights[i]);
			}
			container.style.height = Math.max(...heights) + "px";
		}
	}

	function changePage(index, enableAnim = true) {
		var old = currentPage;
		if (!enableAnim) {
			stage.style.transitionDuration = "0s";
			stage.addEventListener(whichTransitionEvent(), () => {
				stage.style.transitionDuration = config.slideChangeDuration + "0s";
			});
		} else {
			stage.style.transitionDuration = config.slideChangeDuration + "s";
		}

		//change slide based on parameter
		if (index == "prev") {
			if (currentPage != 0) {
				currentPage--;
			}
		} else if (index == "next") {
			if (currentPage < totalPages) {
				currentPage++;
			}
		} else if (Number.isInteger(index) && index > -1 && index <= totalPages) {
			currentPage = index;
		}

		//update frontend
		setActiveSlides();
		setActiveDot();
		updateSlide();
		refreshNav();

		//change stage height if this options is enabled
		if (config.autoHeight) {
			calculatecontainerHeight(getCurrentSlideDom());
		}

		//fire change trigger
		if (old != currentPage) {
			trigger("onChanged");
		}
	}

	function goToUrl(id, enableAnim = true) {
		var item = getEl(`.${cssClass.item}[${dataTags.id}="${id}"]`);
		changePage(parseInt(item.getAttribute(dataTags.slide)), enableAnim);
	}

	function updateSlide() {
		if (config.centerSlide && config.items > 0) {
			var output =
				-getSlidePos(getCurrentSlideDom()) -
				-(parseInt(getSlideStyle().width) * Math.floor(config.items / 2));

			currentTranslate = output;
			scrollToPos(output);
		} else {
			scrollToSlide(getCurrentSlideDom());
		}
	}

	function setActiveSlides() {
		if (activeSlides != null) {
			activeSlides.forEach(i => {
				getEl(`[${dataTags.slide}="${i}"]`).classList.remove("active");
			});
		}

		activeSlides = [];
		if (config.centerSlide) {
			activeSlides.push(currentPage);
		} else if (config.itemPerPage) {
			for (
				var index = currentPage;
				index < currentPage + config.items;
				index++
			) {
				activeSlides.push(index);
			}
		} else {
			if (getSlideIndexForPage() + config.items > getTotalSlides()) {
				for (
					var index = slides.length - config.items;
					index < getTotalSlides();
					index++
				) {
					activeSlides.push(index);
				}
			} else {
				if (config.items == 0) {
					activeSlides.push(getSlideIndexForPage());
				} else {
					for (
						var index = getSlideIndexForPage();
						index < getSlideIndexForPage() + config.items;
						index++
					) {
						if (index < slides.length) {
							activeSlides.push(index);
						}
					}
				}
			}
		}

		activeSlides.forEach(i => {
			getEl(`[${dataTags.slide}="${i}"]`).classList.add("active");
		});

		lazyLoad();
	}

	function setActiveDot() {
		var active = "active";
		if (checkDotsStatus()) {
			var a = getEl(`.${cssClass.dot}[${dataTags.slide}].` + active);
			if (a != null) a.classList.remove(active);

			getEl(`.${cssClass.dot}[${dataTags.slide}="${currentPage}"]`).classList.add(active);
		}
	}

	function autoplayStart() {
		if (autoPlay == undefined) {
			autoPlay = setInterval(() => nextPage(), config.autoplaySpeed);
		}
	}

	function autoplayStop() {
		if (autoPlay > 0) {
			clearTimeout(autoPlay);
			autoPlay = undefined;
		}
	}

	function nextPage() {
		changePage("next");
	}

	function prevPage() {
		changePage("prev");
	}

	function getSlideIndexForPage() {
		return currentPage * (config.items > 0 ? config.items : 1);
	}

	function getCurrentSlideDom() {
		return getEl(`[${dataTags.slide}].active`);
	}

	function getCurrentPage() {
		return currentPage;
	}

	function getTotalSlides() {
		return slides.length;
	}

	function getSlidePos(slide) {
		return config.vertical ?
			slide.getBoundingClientRect().top - stage.getBoundingClientRect().top :
			slide.getBoundingClientRect().left - stage.getBoundingClientRect().left;
	}

	function getTotalPages() {
		return totalPages;
	}

	function getSlideStyle() {
		return slides[0].style;
	}

	function whichTransitionEvent() {
		var el = newEl("tr"),
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

	function getStatus() {
		return new Object({
			created: appCreated === undefined ? false : true,
			currentPage: currentPage,
			totalPages: totalPages,
			totalSlides: slides.length,
			activeSlides: [...activeSlides],
			config: { ...config },
			currentTranslate: currentTranslate
		});
	}

	function getEl(el, all) {
		var param = `${containerName} ${el}`;
		return all ? document.querySelectorAll(param) : document.querySelector(param);
	}

	function newEl(name) {
		return document.createElement(name);
	}

	return {
		prevPage,
		nextPage,
		changePage,
		refresh,
		on,
		goToUrl,
		autoplayStart,
		autoplayStop,
		getCurrentPage,
		getTotalPages,
		getTotalSlides,
		getStatus,
		destroy,
		init,
	}
};

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

export default ddcarousel;
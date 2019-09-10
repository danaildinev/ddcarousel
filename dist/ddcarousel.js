"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*! DDCarousel 1.0 by Danail Dinev 2019 | License: https://github.com/danaildinev/ddcarousel/blob/master/LICENSE */
var DDCarousel =
/*#__PURE__*/
function () {
  //full container name
  //DOM element: container
  //DOM element: stage
  //current slide
  //use dot store slides heights when using autoHeight
  function DDCarousel(_ref) {
    var _ref$container = _ref.container,
        container = _ref$container === void 0 ? ".ddcarousel" : _ref$container,
        _ref$nav = _ref.nav,
        nav = _ref$nav === void 0 ? false : _ref$nav,
        _ref$dots = _ref.dots,
        dots = _ref$dots === void 0 ? true : _ref$dots,
        _ref$autoHeight = _ref.autoHeight,
        autoHeight = _ref$autoHeight === void 0 ? false : _ref$autoHeight,
        _ref$items = _ref.items,
        items = _ref$items === void 0 ? 1 : _ref$items,
        _ref$responsive = _ref.responsive,
        responsive = _ref$responsive === void 0 ? false : _ref$responsive,
        _ref$touch = _ref.touch,
        touch = _ref$touch === void 0 ? true : _ref$touch,
        _ref$touchMouse = _ref.touchMouse,
        touchMouse = _ref$touchMouse === void 0 ? true : _ref$touchMouse,
        _ref$touchSwipeThresh = _ref.touchSwipeThreshold,
        touchSwipeThreshold = _ref$touchSwipeThresh === void 0 ? 60 : _ref$touchSwipeThresh,
        _ref$touchMaxSlideDis = _ref.touchMaxSlideDist,
        touchMaxSlideDist = _ref$touchMaxSlideDis === void 0 ? 500 : _ref$touchMaxSlideDis,
        _ref$swipeSmooth = _ref.swipeSmooth,
        swipeSmooth = _ref$swipeSmooth === void 0 ? 0.1 : _ref$swipeSmooth,
        _ref$slideChangeDurat = _ref.slideChangeDuration,
        slideChangeDuration = _ref$slideChangeDurat === void 0 ? 0.3 : _ref$slideChangeDurat,
        _ref$labelNavPrev = _ref.labelNavPrev,
        labelNavPrev = _ref$labelNavPrev === void 0 ? "< Prev" : _ref$labelNavPrev,
        _ref$labelNavNext = _ref.labelNavNext,
        labelNavNext = _ref$labelNavNext === void 0 ? "Next >" : _ref$labelNavNext;

    _classCallCheck(this, DDCarousel);

    _defineProperty(this, "appName", "DDCarousel");

    _defineProperty(this, "containerName", null);

    _defineProperty(this, "container", null);

    _defineProperty(this, "stage", null);

    _defineProperty(this, "currentSlide", 0);

    _defineProperty(this, "currentTranslate", 0);

    _defineProperty(this, "slideDiff", 0);

    _defineProperty(this, "slidesHeights", []);

    _defineProperty(this, "triggers", []);

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

  _createClass(DDCarousel, [{
    key: "on",
    value: function on(event, callback) {
      if (!this.triggers[event]) this.triggers[event] = [];
      this.triggers[event].push(callback);
    }
  }, {
    key: "triggerHandler",
    value: function triggerHandler(event, callback) {
      if (this.triggers[event]) {
        for (var i in this.triggers[event]) {
          this.triggers[event][i](callback);
        }
      }
    }
  }, {
    key: "checkContainer",
    value: function checkContainer(name) {
      var contName = name.substring(1);

      if (name.substring(0, 1) == "#") {
        if (document.getElementById(contName) == null) {
          console.log("".concat(this.appName, ": Invalid container ID!"));
          return false;
        } else {
          this.container = document.getElementById(containerNameClear);
          return true;
        }
      } else if (name.substring(0, 1) == ".") {
        if (document.getElementsByClassName(contName)[0] == null) {
          console.log("".concat(this.appName, ": Invalid container class!"));
          return false;
        } else {
          this.container = document.getElementsByClassName(contName)[0];
          return true;
        }
      } else {
        console.log("".concat(this.appName, ": Invalid container!"));
        return false;
      }
    }
  }, {
    key: "createStage",
    value: function createStage() {
      var i = 0,
          stageContainer = document.createElement("div"),
          stageDiv = document.createElement("div");
      stageContainer.classList.add("ddcarousel-container");
      stageDiv.classList.add("ddcarousel-stage"); //get all slides from user

      this.slidesSource = document.querySelectorAll("".concat(this.containerName, " > div")); //add the stage to the main container

      this.container.appendChild(stageContainer);
      stageContainer.appendChild(stageDiv); //get stage DOM

      this.stage = document.querySelector("".concat(this.containerName, " .").concat(stageDiv.classList[0])); //set width to 100% if responsive is enabled and change container width

      if (this.responsive) {
        this.container.classList.add("ddcarousel-responsive");
      } //set parameters to slides and add them in the new ddcarousel-item container with some params


      for (i = 0; i < this.slidesSource.length; i++) {
        var s = document.createElement("div");
        s.classList.add("ddcarousel-item");
        s.setAttribute("data-slide", i);
        s.appendChild(this.slidesSource[i]);
        stageDiv.appendChild(s);
      } //get all slides


      this.slides = document.querySelectorAll("".concat(this.containerName, " .ddcarousel-item"));
    }
  }, {
    key: "calculateStage",
    value: function calculateStage() {
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

        this.slidesHeights.push(document.querySelector("".concat(this.containerName, " [data-slide=\"").concat(i, "\"] > div")).scrollHeight);
      }

      if (this.autoHeight) {
        this.calculateContainerHeight(this.currentSlide);
      }

      this.slideToPosition(this.getCurrentSlideDom()); //fire event

      if (slideWidth != this.slides[0].style.width) this.triggerHandler("resized");
    }
  }, {
    key: "createNav",
    value: function createNav() {
      if (this.nav) {
        var navContainer = document.createElement("div"),
            leftBtn = document.createElement("button"),
            rightBtn = document.createElement("button");
        navContainer.classList.add("ddcarousel-nav");
        leftBtn.classList.add("ddcarousel-prev");
        leftBtn.innerHTML = this.labelNavPrev;
        rightBtn.classList.add("ddcarousel-next");
        rightBtn.innerHTML = this.labelNavNext; //add buttons in nav container

        navContainer.appendChild(leftBtn);
        navContainer.appendChild(rightBtn);
        this.container.appendChild(navContainer);
        this.navPrevBtn = document.querySelector("".concat(this.containerName, " .").concat(leftBtn.classList[0]));
        this.navNextBtn = document.querySelector("".concat(this.containerName, " .").concat(rightBtn.classList[0]));
      }
    }
  }, {
    key: "createDots",
    value: function createDots() {
      var _this = this;

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
          dot.addEventListener("click", function (e) {
            return _this.changeSlide(parseInt(e.target.getAttribute("data-slide")));
          });
          navContainer.appendChild(dot);
        }

        this.container.appendChild(navContainer);
      }
    }
  }, {
    key: "attachEvents",
    value: function attachEvents() {
      var _this2 = this;

      //nav buttons
      if (this.nav) {
        this.navPrevBtn.addEventListener("click", function () {
          return _this2.prevSlide();
        });
        this.navNextBtn.addEventListener("click", function () {
          return _this2.nextSlide();
        });
        this.on("changed", function () {
          _this2.refreshNav();
        });
      } //responsive


      if (this.responsive) {
        window.addEventListener("resize", function () {
          _this2.calculateStage();
        });
      } //touch events


      this.attachTouchEvents();
    }
  }, {
    key: "attachTouchEvents",
    value: function attachTouchEvents() {
      var _this3 = this;

      var eventsStart = [],
          eventsMove = [],
          eventsEnd = [],
          touchStart,
          touchStartRaw,
          currentTouch,
          origPosition,
          swipeDistance,
          dontChange,
          isDragging; //add events based on options

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

      eventsStart.forEach(function (el) {
        _this3.stage.addEventListener(el, function (e) {
          isDragging = true; //set some starting values

          touchStartRaw = e.type == "mousedown" || e.type == "mousedown" && _this3.touchMouse ? e.clientX : e.targetTouches[0].clientX;
          touchStart = e.type == "mousedown" || e.type == "mousedown" && _this3.touchMouse ? e.clientX + -_this3.currentTranslate : e.targetTouches[0].clientX + -_this3.currentTranslate; //remember orig position

          origPosition = _this3.currentTranslate;
          dontChange = false;

          _this3.triggerHandler("drag");
        }, {
          passive: true
        });
      });
      eventsEnd.forEach(function (el) {
        _this3.stage.addEventListener(el, function () {
          //check if swipe distance is enough to change slide or stay on the same
          _this3.triggerHandler("dragged");

          if (swipeDistance >= _this3.touchSwipeThreshold && !dontChange) {
            if (currentTouch > origPosition) {
              _this3.prevSlide();
            } else {
              _this3.nextSlide();
            }
          } else {
            _this3.stage.style.transform = "translateX(" + origPosition + "px)";
          }

          _this3.stage.style.transitionDuration = _this3.slideChangeDuration + "s";
          isDragging = false;
        });
      });
      eventsMove.forEach(function (el) {
        _this3.stage.addEventListener(el, function (e) {
          var input;

          if (e.type == "mousemove" && _this3.touchMouse) {
            if (isDragging) {
              input = e.clientX;
            }
          } else if (e.type == "touchmove") {
            input = e.targetTouches[0].pageX;
          } //disable transition to get more responsive dragging


          _this3.stage.style.transitionDuration = _this3.swipeSmooth + "s"; //calcualte swipe distance between starging value cnd current value

          swipeDistance = Math.abs(input - touchStartRaw); //get the current touch

          currentTouch = input - touchStart; //move slider until max swipe lenght is reached

          if (swipeDistance <= _this3.touchMaxSlideDist) {
            _this3.stage.style.transform = "translateX(" + currentTouch + "px)";
          } else {
            dontChange = true;
            currentTouch = input - touchStart;
          }
        }, {
          passive: true
        });
      });
    }
  }, {
    key: "refreshNav",
    value: function refreshNav() {
      if (this.currentSlide == 0) {
        this.navPrevBtn.classList.add("inactive");
      } else if (this.currentSlide === this.slides.length - 1 || this.currentSlide == this.slideDiff) {
        this.navNextBtn.classList.add("inactive");
      } else if (this.currentSlide > 0 && this.currentSlide < this.slides.length) {
        this.navPrevBtn.classList.remove("inactive");
        this.navNextBtn.classList.remove("inactive");
      }
    }
  }, {
    key: "slideToPosition",
    value: function slideToPosition(slide) {
      this.currentTranslate = -(slide.getBoundingClientRect().left - this.stage.getBoundingClientRect().left);
      this.stage.style.transform = "translateX(".concat(this.currentTranslate, "px)");
    }
  }, {
    key: "calculateContainerHeight",
    value: function calculateContainerHeight() {
      if (this.itemsPerPage == 1) {
        this.container.style.height = this.slidesHeights[this.currentSlide] + "px";
      } else {
        var i,
            heights = []; //get specified slides from global array with heights and then get the highest of it

        for (i = this.currentSlide; i <= this.currentSlide + this.itemsPerPage - 1; i++) {
          heights.push(this.slidesHeights[i]);
          this.container.style.height = Math.max.apply(Math, heights) + "px";
        }
      }
    }
  }, {
    key: "changeSlide",
    value: function changeSlide(index) {
      var origSlide = this.currentSlide;
      this.stage.style.transitionDuration = this.slideChangeDuration + "s"; //remove some classes bedore adding new one

      if (this.dots) {
        document.querySelector("".concat(this.containerName, " .ddcarousel-dot[data-slide=\"").concat(this.currentSlide, "\"]")).classList.remove("active");
      }

      this.getSlideDom(this.currentSlide).classList.remove("active"); //change slide based on parameter

      if (index == "prev") {
        this.currentSlide--;
      } else if (index == "next") {
        this.currentSlide++;
      } else if (Number.isInteger(index)) {
        this.currentSlide = index;
      } //get difference between all slides and slider per page


      this.slideDiff = this.slides.length - this.itemsPerPage; //set the correct slide index if there is specified items per row

      if (this.itemsPerPage > 1 && this.currentSlide >= this.slideDiff) {
        this.currentSlide = this.slideDiff;
      } else {
        //check if index is larger than slides count -> then change to the last slide
        if (this.currentSlide >= this.slides.length) {
          this.currentSlide = this.slides.length - 1;
        } //check if index is smaller than slides count -> then change to the first slide
        else if (this.currentSlide < 0) {
            this.currentSlide = 0;
          }
      } //slide to specified slide position


      this.slideToPosition(this.getCurrentSlideDom()); //set active slide class

      this.getSlideDom(this.currentSlide).classList.add("active"); //set active dots

      if (this.dots) {
        //add class to the current dot
        document.querySelector("".concat(this.containerName, " .ddcarousel-dot[data-slide=\"").concat(this.currentSlide, "\"]")).classList.add("active");
      } //change stage height if this options is enabled


      if (this.autoHeight) {
        this.calculateContainerHeight(this.getCurrentSlideDom());
      } //fire change trigger


      if (origSlide != this.currentSlide) this.triggerHandler("changed");
    }
  }, {
    key: "nextSlide",
    value: function nextSlide() {
      this.changeSlide("next");
    }
  }, {
    key: "prevSlide",
    value: function prevSlide() {
      this.changeSlide("prev");
    }
  }, {
    key: "getCurrentSlide",
    value: function getCurrentSlide() {
      return this.currentSlide;
    }
  }, {
    key: "getCurrentSlideDom",
    value: function getCurrentSlideDom() {
      return document.querySelector("".concat(this.containerName, " [data-slide=\"").concat(this.currentSlide, "\"]"));
    }
  }, {
    key: "getCurrentPage",
    value: function getCurrentPage() {
      return document.querySelector("".concat(this.containerName, " [data-slide=\"").concat(this.currentSlide, "\"].active")).getAttribute("data-slide");
    }
  }, {
    key: "getTotalSlides",
    value: function getTotalSlides() {
      return this.slides.length;
    }
  }, {
    key: "getSlideDom",
    value: function getSlideDom(id) {
      return document.querySelector("".concat(this.containerName, " .ddcarousel-item[data-slide=\"").concat(id, "\"]"));
    }
  }]);

  return DDCarousel;
}();

//# sourceMappingURL=ddcarousel.js.map
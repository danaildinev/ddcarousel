"use strict";

function _classCallCheck(a, b) { if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function"); }

function _defineProperties(a, b) { for (var c = 0; c < b.length; c++) { var d = b[c]; d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), Object.defineProperty(a, d.key, d); } }

function _createClass(a, b, c) { return b && _defineProperties(a.prototype, b), c && _defineProperties(a, c), a; }

/*! DDCarousel 1.1 by Danail Dinev 2019 | License: https://github.com/danaildinev/ddcarousel/blob/master/LICENSE */
var appName = "DDCarousel";
var app = appName.toLowerCase();
var cCont = app + "-container";
var cStage = app + "-stage";
var cNav = app + "-nav";
var cItem = app + "-item";
var cResp = app + "-responsive";
var cContDots = app + "-dots";
var cDot = app + "-dot";
var cPrev = app + "-prev";
var cNext = app + "-next";
var cVert = app + "-vertical";
var cUrl = app + "-urls";
var cDSlide = "data-slide";
var cDId = "data-id";
var cDTitle = "data-title";

var DDCarousel =
/*#__PURE__*/
function () {
  function a(b) {
    _classCallCheck(this, a), this.init = !1, this.currentPage = 0, this.triggers = ["onInitialize", "onInitialized", "onDrag", "onDragging", "onDragged", "onChanged", "onTransitionend", "onResized"], this.config = this.updateSettings(b), this.checkContainer(this.config.container) && (this.triggerHandler("onInitialize", {
      container: this.container,
      event: "onInitialize"
    }), this.createStage(), this.setActiveSlides(), this.calculateStage(), this.attachEvents(), this.setActiveDot(), this.updateSlide(), this.config.nav && this.refreshNav(), this.triggerHandler("onInitialized"));
  }

  return _createClass(a, [{
    key: "updateSettings",
    value: function updateSettings(a) {
      var b = this;
      var c = {
        container: ".ddcarousel",
        nav: !1,
        dots: !0,
        autoHeight: !1,
        itemsPerPage: 1,
        itemPerPage: !1,
        responsive: !1,
        vertical: !1,
        urlNav: !1,
        touch: !0,
        touchMouse: !0,
        centerSlide: !1,
        touchSwipeThreshold: 60,
        touchMaxSlideDist: 500,
        swipeSmooth: 0,
        slideChangeDuration: 0.5,
        labelNavPrev: "< Prev",
        labelNavNext: "Next >"
      };

      for (var d in this.triggers.forEach(function (a) {
        c[a] = function () {}, b.on(a, function (c) {
          b.config[a].call(b, c == null ? b.callback(a) : c);
        });
      }), a) c[d] = a[d];

      return a['urlNav'] && (c['itemPerPage'] = !0), c;
    }
  }, {
    key: "callback",
    value: function callback(a) {
      var b = {
        container: this.container,
        event: a,
        currentSlides: this.activeSlides,
        currentPage: this.getCurrentPage(),
        totalSlides: this.getTotalSlides(),
        totalPages: this.getTotalPages()
      };
      return b;
    }
  }, {
    key: "on",
    value: function on(a, b) {
      !this.triggers[a] && (this.triggers[a] = []), this.triggers[a].push(b);
    }
  }, {
    key: "triggerHandler",
    value: function triggerHandler(a, b) {
      if (this.triggers[a]) for (var c in this.triggers[a]) this.triggers[a][c](b);
    }
  }, {
    key: "checkContainer",
    value: function checkContainer(a) {
      var b = a.substring(1);

      if (a.substring(0, 1) != "#") {
        if (a.substring(0, 1) != ".") return console.error("".concat(this.appName, ": Invalid container!")), !1;
        if (document.getElementsByClassName(b)[0] != null) return this.container = document.getElementsByClassName(b)[0], this.containerName = a, !0;
      } else if (document.getElementById(b) != null) return this.container = document.getElementById(containerNameClear), this.containerName = a, !0;
    }
  }, {
    key: "createStage",
    value: function createStage() {
      var a = document.createElement("div"),
          b = document.createElement("div");
      a.classList.add(cCont), b.classList.add(cStage), this.slidesSource = document.querySelectorAll("".concat(this.containerName, " > div")), this.container.appendChild(a), a.appendChild(b), this.stage = document.querySelector("".concat(this.containerName, " .").concat(cStage)), this.config.responsive && this.container.classList.add(cResp), this.config.vertical && this.container.classList.add(cVert);

      //set parameters to slides and add them in the new ddcarousel-item container with some params
      for (var c = 0; c < this.slidesSource.length; c++) {
        var d = document.createElement("div");
        d.classList.add(cItem), d.setAttribute(cDSlide, c), d.appendChild(this.slidesSource[c]), this.config.urlNav && this.slidesSource[c].hasAttribute(cDId) && this.slidesSource[c].hasAttribute(cDTitle) && (d.setAttribute(cDId, this.slidesSource[c].getAttribute(cDId)), d.setAttribute(cDTitle, this.slidesSource[c].getAttribute(cDTitle))), b.appendChild(d);
      } //get all slides and total pages


      this.slides = document.querySelectorAll("".concat(this.containerName, " .").concat(cItem)), this.totalPages = this.config.centerSlide ? this.slides.length - 1 : this.config.itemPerPage ? this.slides.length - this.config.itemsPerPage : Math.ceil(this.slides.length / this.config.itemsPerPage) - 1, this.createNav(), this.createDots(), this.createUrls();
    }
  }, {
    key: "calculateStage",
    value: function calculateStage() {
      var a = this.slides[0].style.width,
          b = parseInt(window.getComputedStyle(this.container).width),
          c = parseInt(window.getComputedStyle(this.container).height);
      this.slidesHeights = [];

      for (var d = 0; d < this.slides.length; d++) this.config.itemsPerPage == null && this.config.vertical ? this.slides[d].style.width = b + "px" : this.config.vertical ? this.slides[d].style.height = c / this.config.itemsPerPage + "px" : !this.config.vertical && (this.slides[d].style.width = b / this.config.itemsPerPage + "px"), this.slidesHeights.push(document.querySelector("".concat(this.containerName, " [").concat(cDSlide, "=\"").concat(d, "\"] > div")).scrollHeight);

      !this.config.vertical && (this.stage.style.width = b * this.slides.length + "px"), this.config.autoHeight && this.calculateContainerHeight(this.currentPage), this.scrollToSlide(this.getCurrentSlideDom()), a != this.slides[0].style.width && this.triggerHandler("onResized");
    }
  }, {
    key: "createNav",
    value: function createNav() {
      if (this.config.nav) {
        var a = document.createElement("div"),
            b = document.createElement("button"),
            c = document.createElement("button");
        a.classList.add(cNav), b.classList.add(cPrev), b.innerHTML = this.config.labelNavPrev, c.classList.add(cNext), c.innerHTML = this.config.labelNavNext, a.appendChild(b), a.appendChild(c), this.container.appendChild(a), this.navPrevBtn = document.querySelector("".concat(this.containerName, " .").concat(cPrev)), this.navNextBtn = document.querySelector("".concat(this.containerName, " .").concat(cNext));
      }
    }
  }, {
    key: "createDots",
    value: function createDots() {
      var a = this;

      if (this.config.dots) {
        var b,
            c = document.createElement("div");
        c.classList.add(cContDots), b = this.config.itemsPerPage > 1 ? this.config.centerSlide ? this.slides.length : this.totalPages + 1 : this.slides.length;

        for (var d = 0; d < b; d++) {
          var e = document.createElement("button");
          e.classList.add(cDot), e.setAttribute(cDSlide, d), e.addEventListener("click", function (b) {
            return a.changePage(parseInt(b.target.getAttribute(cDSlide)));
          }), c.appendChild(e);
        }

        this.container.appendChild(c);
      }
    }
  }, {
    key: "createUrls",
    value: function createUrls() {
      if (this.config.urlNav) {
        var a = document.createElement("div"),
            b = document.createElement("ul");
        a.classList.add(cUrl), this.slides.forEach(function (c) {
          if (c.hasAttribute(cDId) && c.hasAttribute(cDTitle)) {
            var d = document.createElement('li'),
                e = document.createElement('a');
            e.href = "#" + c.getAttribute(cDId), e.innerHTML = c.getAttribute(cDTitle), d.appendChild(e), b.appendChild(d);
          }
        }), a.appendChild(b), this.container.appendChild(a);
      }
    }
  }, {
    key: "attachEvents",
    value: function attachEvents() {
      var a = this;

      //urls
      if (this.config.nav && (this.navPrevBtn.addEventListener("click", function () {
        return a.prevPage();
      }), this.navNextBtn.addEventListener("click", function () {
        return a.nextPage();
      }), this.on("onChanged", function () {
        a.refreshNav();
      })), window.addEventListener("resize", function () {
        a.calculateStage();
      }), this.stage.addEventListener(this.whichTransitionEvent(), function () {
        a.triggerHandler("onTransitionend");
      }), this.attachTouchEvents(), this.config.urlNav) {
        var b = document.querySelectorAll("".concat(this.containerName, " .").concat(cUrl, " a"));
        b.forEach(function (b) {
          b.addEventListener("click", function (c) {
            a.goToUrl(b.getAttribute('href').substring(1));
          });
        });
      }
    }
  }, {
    key: "attachTouchEvents",
    value: function attachTouchEvents() {
      var a = this;
      var b = [],
          c = [],
          d = []; //add events based on options

      this.config.touch && (b.push("touchstart"), c.push("touchmove"), d.push("touchend")), this.config.touchMouse && (b.push("mousedown"), c.push("mousemove"), d.push("mouseup")), b.forEach(function (b) {
        document.all && window.atob ? a.stage.addEventListener(b, function (b) {
          a.getStartingDragPos(b);
        }, {
          passive: !0
        }) : window.addEventListener(b, function (b) {
          b.target == a.stage && a.getStartingDragPos(b);
        }, {
          passive: !0
        });
      }), d.forEach(function (b) {
        window.addEventListener(b, function () {
          a.isDragging && (a.triggerHandler("onDragged"), a.swipeDistance >= a.config.touchSwipeThreshold && !a.dontChange ? a.currentTouch > a.origPosition ? a.prevPage() : a.nextPage() : a.scrollToPos(a.origPosition), a.stage.style.transitionDuration = a.config.slideChangeDuration + "s", a.isDragging = !1);
        });
      }), c.forEach(function (b) {
        window.addEventListener(b, function (b) {
          if (a.isDragging) {
            var c;
            b.type == "mousemove" && a.config.touchMouse ? c = a.config.vertical ? b.clientY : b.pageX : b.type == "touchmove" && (c = a.config.vertical ? b.targetTouches[0].pageY : b.targetTouches[0].pageX), a.stage.style.transitionDuration = a.config.swipeSmooth + "s", a.swipeDistance = Math.abs(c - a.touchStartRaw), a.currentTouch = c - a.touchStart, a.swipeDistance <= a.config.touchMaxSlideDist ? (a.triggerHandler("onDragging"), a.scrollToPos(a.currentTouch)) : (a.dontChange = !0, a.currentTouch = c - a.touchStart);
          }
        }, {
          passive: !0
        });
      });
    }
  }, {
    key: "getStartingDragPos",
    value: function getStartingDragPos(a) {
      this.isDragging = !0, this.touchStartRaw = a.type == "mousedown" && this.config.touchMouse ? this.config.vertical ? a.clientY : a.pageX : this.config.vertical ? a.targetTouches[0].clientY : a.targetTouches[0].pageX, this.touchStart = this.touchStartRaw + -this.currentTranslate, this.origPosition = this.currentTranslate, this.dontChange = !1, this.triggerHandler("onDrag");
    }
  }, {
    key: "refreshNav",
    value: function refreshNav() {
      var a = "inactive";
      this.currentPage == 0 ? (this.navPrevBtn.classList.add(a), this.navNextBtn.classList.remove(a)) : this.currentPage == this.totalPages ? (this.navPrevBtn.classList.remove(a), this.navNextBtn.classList.add(a)) : (this.navPrevBtn.classList.remove(a), this.navNextBtn.classList.remove(a));
    }
  }, {
    key: "scrollToSlide",
    value: function scrollToSlide(a) {
      this.currentTranslate = -this.getSlidePos(a), this.scrollToPos(this.currentTranslate);
    }
  }, {
    key: "scrollToPos",
    value: function scrollToPos(a) {
      var b = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      var c = this.config.vertical ? "translateY(".concat(a, "px)") : "translateX(".concat(a, "px)");
      b ? this.stage.style.webkitTransform = c : this.stage.style.transform = c;
    }
  }, {
    key: "calculateContainerHeight",
    value: function calculateContainerHeight() {
      if (this.config.itemsPerPage == 1) this.container.style.height = this.slidesHeights[this.currentPage] + "px";else {
        var a = []; //get specified slides from global array with heights and then get the highest of it

        for (var b = this.activeSlides[0]; b <= this.activeSlides[this.activeSlides.length - 1]; b++) a.push(this.slidesHeights[b]);

        this.container.style.height = Math.max.apply(Math, a) + "px";
      }
    }
  }, {
    key: "changePage",
    value: function changePage(a) {
      var b = this;
      var c = !(arguments.length > 1 && arguments[1] !== undefined) || arguments[1];
      var d = this.currentPage;
      c ? this.stage.style.transitionDuration = this.config.slideChangeDuration + "s" : (this.stage.style.transitionDuration = "0s", this.stage.addEventListener(this.whichTransitionEvent(), function () {
        b.stage.style.transitionDuration = b.config.slideChangeDuration + "0s";
      })), a == "prev" ? this.currentPage != 0 && this.currentPage-- : a == "next" ? this.currentPage < this.totalPages && this.currentPage++ : Number.isInteger(a) && a <= this.totalPages && (this.currentPage = a), this.setActiveSlides(), this.setActiveDot(), this.updateSlide(), this.config.autoHeight && this.calculateContainerHeight(this.getCurrentSlideDom()), d != this.currentPage && this.triggerHandler("onChanged");
    }
  }, {
    key: "goToUrl",
    value: function goToUrl(a) {
      var b = !(arguments.length > 1 && arguments[1] !== undefined) || arguments[1];
      var c = document.querySelector("".concat(this.containerName, " .").concat(cItem, "[").concat(cDId, "=\"").concat(a, "\"]"));
      this.changePage(parseInt(c.getAttribute(cDSlide)), b);
    }
  }, {
    key: "updateSlide",
    value: function updateSlide() {
      if (this.config.centerSlide) {
        var a = -this.getSlidePos(this.getCurrentSlideDom()) - -(parseInt(this.getSlideStyle().width) * Math.floor(this.config.itemsPerPage / 2));
        this.currentTranslate = a, this.scrollToPos(a);
      } else this.scrollToSlide(this.getCurrentSlideDom());
    }
  }, {
    key: "setActiveSlides",
    value: function setActiveSlides() {
      var a = this;
      if (this.activeSlides != null && this.activeSlides.forEach(function (b) {
        document.querySelector("".concat(a.containerName, " [").concat(cDSlide, "=\"").concat(b, "\"]")).classList.remove("active");
      }), this.activeSlides = [], this.config.centerSlide) this.activeSlides.push(this.currentPage);else if (this.config.itemPerPage) for (var b = this.currentPage; b < this.currentPage + this.config.itemsPerPage; b++) this.activeSlides.push(b);else if (this.getSlideIndexForPage() + this.config.itemsPerPage > this.getTotalSlides()) for (var b = this.slides.length - this.config.itemsPerPage; b < this.getTotalSlides(); b++) this.activeSlides.push(b);else for (var b = this.getSlideIndexForPage(); b < this.getSlideIndexForPage() + this.config.itemsPerPage; b++) b < this.slides.length && this.activeSlides.push(b);
      this.activeSlides.forEach(function (b) {
        document.querySelector("".concat(a.containerName, " [").concat(cDSlide, "=\"").concat(b, "\"]")).classList.add("active");
      });
    }
  }, {
    key: "setActiveDot",
    value: function setActiveDot() {
      var b = "active";

      if (this.config.dots) {
        var c = document.querySelector("".concat(this.containerName, " .").concat(cDot, "[").concat(cDSlide, "].") + b);
        c != null && c.classList.remove(b), document.querySelector("".concat(this.containerName, " .").concat(cDot, "[").concat(cDSlide, "=\"").concat(this.currentPage, "\"]")).classList.add(b);
      }
    }
  }, {
    key: "nextPage",
    value: function nextPage() {
      this.changePage("next");
    }
  }, {
    key: "prevPage",
    value: function prevPage() {
      this.changePage("prev");
    }
  }, {
    key: "getSlideIndexForPage",
    value: function getSlideIndexForPage() {
      return this.currentPage * this.config.itemsPerPage;
    }
  }, {
    key: "getCurrentSlideDom",
    value: function getCurrentSlideDom() {
      return document.querySelector("".concat(this.containerName, " [").concat(cDSlide, "].active"));
    }
  }, {
    key: "getCurrentPage",
    value: function getCurrentPage() {
      return this.currentPage;
    }
  }, {
    key: "getTotalSlides",
    value: function getTotalSlides() {
      return this.slides.length;
    }
  }, {
    key: "getSlidePos",
    value: function getSlidePos(a) {
      return this.config.vertical ? a.getBoundingClientRect().top - this.stage.getBoundingClientRect().top : a.getBoundingClientRect().left - this.stage.getBoundingClientRect().left;
    }
  }, {
    key: "getTotalPages",
    value: function getTotalPages() {
      return this.totalPages;
    }
  }, {
    key: "getSlideStyle",
    value: function getSlideStyle() {
      return this.slides[0].style;
    }
  }, {
    key: "whichTransitionEvent",
    value: function whichTransitionEvent() {
      var a = document.createElement("fakeelement"),
          b = {
        transition: "transitionend",
        MozTransition: "transitionend",
        WebkitTransition: "webkitTransitionEnd"
      };

      for (var c in b) if (a.style[c] !== undefined) return b[c];
    }
  }]), a;
}(); //polyfills


Number.isInteger = Number.isInteger || function (a) {
  return typeof a === "number" && isFinite(a) && Math.floor(a) === a;
}, window.NodeList && !NodeList.prototype.forEach && (NodeList.prototype.forEach = Array.prototype.forEach);

//# sourceMappingURL=ddcarousel.js.map
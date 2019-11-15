"use strict";

function _classCallCheck(a, b) { if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function"); }

function _defineProperties(a, b) { for (var c = 0; c < b.length; c++) { var d = b[c]; d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), Object.defineProperty(a, d.key, d); } }

function _createClass(a, b, c) { return b && _defineProperties(a.prototype, b), c && _defineProperties(a, c), a; }

/*! DDCarousel 1.2 by Danail Dinev 2019 | License: https://github.com/danaildinev/ddcarousel/blob/master/LICENSE */
var DDCarousel =
/*#__PURE__*/
function () {
  function a(b) {
    _classCallCheck(this, a), this.appName = "DDCarousel", this.cCont = "ddcarousel-container", this.cStage = "ddcarousel-stage", this.cNav = "ddcarousel-nav", this.cItem = "ddcarousel-item", this.cFullW = "ddcarousel-fullwidth", this.cDots = "ddcarousel-dots", this.cDot = "ddcarousel-dot", this.cPrev = "ddcarousel-prev", this.cNext = "ddcarousel-next", this.cVert = "ddcarousel-vertical", this.cUrl = "ddcarousel-urls", this.dSlide = "data-slide", this.dId = "data-id", this.dTitle = "data-title", this.currentPage = 0, this.triggers = ["onInitialize", "onInitialized", "onDrag", "onDragging", "onDragged", "onChanged", "onTransitionend", "onResized"], this.ie10 = document.all && window.atob, this.configOrig = b, this.setDefaults(), this.checkContainer(this.config.container) && (this.trigger("onInitialize", {
      container: this.container,
      event: "onInitialize"
    }), this.createStage(), this.calculateStage(), this.createNav(), this.createDots(), this.createUrls(), this.setActiveSlides(), this.changePage(this.config.startPage > 0 ? this.config.startPage : 0, !1), this.refresh(), this.attachEvents(), this.trigger("onInitialized"));
  }

  return _createClass(a, [{
    key: "setDefaults",
    value: function setDefaults() {
      var a = this;
      var b = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.configOrig;
      var c = {
        container: "." + this.appName.toLowerCase(),
        nav: !1,
        dots: !0,
        autoHeight: !1,
        fullWidth: !1,
        startPage: 0,
        items: 1,
        itemPerPage: !1,
        vertical: !1,
        urlNav: !1,
        responsive: [],
        autoplay: !1,
        autoplaySpeed: 1000,
        autoplayPauseHover: !1,
        touchDrag: !0,
        mouseDrag: !0,
        centerSlide: !1,
        touchSwipeThreshold: 60,
        touchMaxSlideDist: 500,
        resizeRefresh: 200,
        swipeSmooth: 0,
        slideChangeDuration: 0.5,
        callbacks: !1,
        labelNavPrev: "< Prev",
        labelNavNext: "Next >"
      };
      this.triggers.forEach(function (b) {
        c[b] = function () {}, a.on(b, function (c) {
          a.config[b].call(a, c == null ? a.callback(b) : c);
        });
      }), this.configResp = [], b['responsive'] !== undefined && (this.configResp = b['responsive']), this.config = c, this.updateSettings(b);
    }
  }, {
    key: "updateSettings",
    value: function updateSettings(a) {
      /* updating event triggers is not supported for now! */
      for (var b in a) this.config[b] = a[b];
    }
  }, {
    key: "callback",
    value: function callback(a) {
      return this.config.callbacks ? new Object({
        container: this.container,
        event: a,
        currentSlides: this.activeSlides,
        currentPage: this.currentPage,
        totalSlides: this.getTotalSlides(),
        totalPages: this.totalPages
      }) : undefined;
    }
  }, {
    key: "on",
    value: function on(a, b) {
      !this.triggers[a] && (this.triggers[a] = []), this.triggers[a].push(b);
    }
  }, {
    key: "trigger",
    value: function trigger(a, b) {
      if (this.triggers[a]) for (var c in this.triggers[a]) this.triggers[a][c](b);
    }
  }, {
    key: "checkContainer",
    value: function checkContainer(a) {
      var b = document.querySelector(a);
      return b == null ? (console.error("".concat(this.appName, ": Invalid container!")), !1) : (this.container = b, this.containerName = a, !0);
    }
  }, {
    key: "createStage",
    value: function createStage() {
      var a = this.newEl("div"),
          b = this.newEl("div"),
          c = this.getEl("> div", !0); //get all slides from user

      a.classList.add(this.cCont), b.classList.add(this.cStage), this.container.appendChild(a), a.appendChild(b), this.stage = this.getEl(".".concat(this.cStage));

      //set parameters to slides and add them in the new ddcarousel-item container with some params
      for (var d = 0; d < c.length; d++) {
        var e = this.newEl("div");
        e.classList.add(this.cItem), e.setAttribute(this.dSlide, d), e.appendChild(c[d]), this.config.urlNav && c[d].hasAttribute(this.dId) && c[d].hasAttribute(this.dTitle) && (e.setAttribute(this.dId, c[d].getAttribute(this.dId)), e.setAttribute(this.dTitle, c[d].getAttribute(this.dTitle))), b.appendChild(e);
      } //get all slides and total pages


      this.slides = this.getEl(".".concat(this.cItem), !0);
    }
  }, {
    key: "calculateStage",
    value: function calculateStage() {
      var a,
          b,
          c,
          d = this.slides[0].style.width,
          e = window.getComputedStyle(this.container),
          f = this.container.classList;
      this.config.fullWidth ? f.add(this.cFullW) : f.remove(this.cFullW), this.config.vertical ? f.add(this.cVert) : f.remove(this.cVert), a = parseInt(e.width), b = parseInt(e.height), c = this.config.centerSlide ? this.slides.length - 1 : this.config.itemPerPage ? this.slides.length - this.config.items : Math.ceil(this.slides.length / this.config.items) - 1, this.totalPages = c, this.slidesHeights = [];

      for (var g = 0; g < this.slides.length; g++) this.config.items == null && this.config.vertical ? this.slides[g].style.width = a + "px" : this.config.vertical ? this.slides[g].style.height = b / this.config.items + "px" : !this.config.vertical && (this.slides[g].style.width = a / this.config.items + "px"), this.slidesHeights.push(this.getEl("[".concat(this.dSlide, "=\"").concat(g, "\"] > div")).scrollHeight);

      !this.config.vertical && (this.stage.style.width = a * this.slides.length + "px"), this.config.autoHeight && (this.setActiveSlides(), this.calculateContainerHeight(this.currentPage)), d != this.slides[0].style.width && this.trigger("onResized");
    }
  }, {
    key: "createNav",
    value: function createNav() {
      var a = this;
      var b = this.getEl(".".concat(this.cNav));

      if (this.config.nav) {
        var c = this.newEl("div"),
            d = this.newEl("button"),
            e = this.newEl("button");
        b && b.remove(), c.classList.add(this.cNav), d.classList.add(this.cPrev), d.innerHTML = this.config.labelNavPrev, e.classList.add(this.cNext), e.innerHTML = this.config.labelNavNext, c.appendChild(d), c.appendChild(e), this.container.appendChild(c), this.navPrevBtn = this.getEl(".".concat(this.cPrev)), this.navNextBtn = this.getEl(".".concat(this.cNext)), this.navPrevBtn.addEventListener("click", function () {
          return a.prevPage();
        }), this.navNextBtn.addEventListener("click", function () {
          return a.nextPage();
        });
      } else b != null && b.remove();
    }
  }, {
    key: "createDots",
    value: function createDots() {
      var a = this;
      var b = this.getEl(".".concat(this.cDots));

      if (this.config.dots) {
        var c,
            d = this.newEl("div");
        b && b.remove(), d.classList.add(this.cDots), c = this.config.items > 1 ? this.config.centerSlide ? this.slides.length : this.totalPages + 1 : this.slides.length;

        for (var e = 0; e < c; e++) {
          var f = this.newEl("button");
          f.classList.add(this.cDot), f.setAttribute(this.dSlide, e), f.addEventListener("click", function (b) {
            return a.changePage(parseInt(b.target.getAttribute(a.dSlide)));
          }), d.appendChild(f);
        }

        this.container.appendChild(d);
      } else b != null && b.remove();
    }
  }, {
    key: "createUrls",
    value: function createUrls() {
      var b = this;

      if (this.urlsDiv = this.getEl(".".concat(this.cUrl)), this.config.urlNav) {
        var c = this.newEl("div"),
            d = this.newEl("ul");
        this.urlsDiv && this.urlsDiv.remove(), c.classList.add(this.cUrl), this.slides.forEach(function (c) {
          if (c.hasAttribute(b.dId) && c.hasAttribute(b.dTitle)) {
            var e = b.newEl('li'),
                f = b.newEl('a');
            f.href = "#" + c.getAttribute(b.dId), f.innerHTML = c.getAttribute(b.dTitle), e.appendChild(f), d.appendChild(e);
          }
        }), c.appendChild(d), this.container.appendChild(c), this.getEl(".".concat(this.cUrl, " a"), !0).forEach(function (a) {
          a.addEventListener("click", function (c) {
            b.goToUrl(a.getAttribute('href').substring(1));
          });
        });
      } else this.urlsDiv != null && this.urlsDiv.remove();
    }
  }, {
    key: "attachEvents",
    value: function attachEvents() {
      var a = this;
      this.setDraggingEvents();
      //resize event
      var b;
      window.addEventListener("resize", function () {
        a.calculateStage(), !b && (a.refresh(), b = !0, setTimeout(function () {
          b = !1;
        }, a.config.resizeRefresh));
      }), this.stage.addEventListener(this.whichTransitionEvent(), function () {
        a.trigger("onTransitionend");
      });
      //autoplay
      var c = ["mouseover", "touchstart"],
          d = ["mouseleave", "touchend"];
      this.config.autoplayPauseHover && this.config.autoplay ? (c.forEach(function (b) {
        return a.stage.addEventListener(b, a.autoplayStop.bind(a));
      }), d.forEach(function (b) {
        return a.stage.addEventListener(b, a.autoplayStart.bind(a));
      })) : (c.forEach(function (b) {
        return a.stage.removeEventListener(b, a.autoplayStop.bind(a));
      }), d.forEach(function (b) {
        return a.stage.removeEventListener(b, a.autoplayStart.bind(a));
      }));
    }
  }, {
    key: "refresh",
    value: function refresh() {
      var a = Object.keys(this.configResp); //check responsive options

      for (var b = a.length - 1; b >= 0; b--) document.body.clientWidth < a[b] ? this.updateSettings(Object.values(this.configResp)[b]) : document.body.clientWidth >= a[a.length - 1] && this.setDefaults();

      this.calculateStage(), this.createNav(), this.createDots(), this.setActiveDot(), this.setActiveSlides(), this.createUrls(), this.autoplayStop(), this.config.autoplay && this.ap == null && this.autoplayStart(), this.updateSlide(), this.refreshNav();
    }
  }, {
    key: "setDraggingEvents",
    value: function setDraggingEvents() {
      var a = this;
      var b = ["touchstart", "mousedown"],
          c = ["touchmove", "mousemove"],
          d = ["touchend", "mouseup"],
          e = this.ie10 ? this.stage : window;
      b.forEach(function (b) {
        return e.addEventListener(b, function (b) {
          return a.dragStart(b);
        }, {
          passive: !0
        });
      }), c.forEach(function (b) {
        return window.addEventListener(b, function (b) {
          return a.dragMove(b);
        }, {
          passive: !0
        });
      }), d.forEach(function (b) {
        return window.addEventListener(b, function () {
          return a.dragEnd();
        });
      });
    }
  }, {
    key: "dragMove",
    value: function dragMove(a) {
      if (this.isDragging) {
        var b = this.getInput(a, "mousemove", "touchmove"); //disable transition to get more responsive dragging

        this.stage.style.transitionDuration = this.config.swipeSmooth + "s", this.swipeDistance = Math.abs(b - this.touchStartRaw), this.currentTouch = b - this.touchStart, this.swipeDistance <= this.config.touchMaxSlideDist ? (this.trigger("onDragging"), this.scrollToPos(this.currentTouch)) : (this.dontChange = !0, this.currentTouch = b - this.touchStart);
      }
    }
  }, {
    key: "getInput",
    value: function getInput(a, b, c) {
      return a.type == b && this.config.mouseDrag ? this.config.vertical ? a.clientY : a.pageX : a.type == c && this.config.touchDrag ? this.config.vertical ? a.targetTouches[0].pageY : a.targetTouches[0].pageX : void 0;
    }
  }, {
    key: "dragStart",
    value: function dragStart(a) {
      if (this.ie10 || a.target == this.stage) {
        var b = this.getInput(a, "mousedown", "touchstart");
        b !== undefined && (this.isDragging = !0, this.touchStartRaw = b, this.touchStart = this.touchStartRaw + -this.currentTranslate, this.origPosition = this.currentTranslate, this.dontChange = !1, this.trigger("onDrag"));
      }
    }
  }, {
    key: "dragEnd",
    value: function dragEnd() {
      this.isDragging && (this.trigger("onDragged"), this.swipeDistance >= this.config.touchSwipeThreshold && !this.dontChange ? this.currentTouch > this.origPosition ? this.prevPage() : this.nextPage() : this.scrollToPos(this.origPosition), this.stage.style.transitionDuration = this.config.slideChangeDuration + "s", this.isDragging = !1);
    }
  }, {
    key: "refreshNav",
    value: function refreshNav() {
      if (this.config.nav) {
        var a = "inactive";
        this.currentPage == 0 ? (this.navPrevBtn.classList.add(a), this.navNextBtn.classList.remove(a)) : this.currentPage == this.totalPages ? (this.navPrevBtn.classList.remove(a), this.navNextBtn.classList.add(a)) : (this.navPrevBtn.classList.remove(a), this.navNextBtn.classList.remove(a));
      }
    }
  }, {
    key: "scrollToSlide",
    value: function scrollToSlide(a) {
      this.currentTranslate = -this.getSlidePos(a), this.scrollToPos(this.currentTranslate);
    }
  }, {
    key: "scrollToPos",
    value: function scrollToPos(a) {
      var b = this.config.vertical ? "translateY(".concat(a, "px)") : "translateX(".concat(a, "px)");
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ? this.stage.style.webkitTransform = b : this.stage.style.transform = b;
    }
  }, {
    key: "calculateContainerHeight",
    value: function calculateContainerHeight() {
      if (this.config.items == 1) this.container.style.height = this.slidesHeights[this.currentPage] + "px";else {
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
      })), a == "prev" ? this.currentPage != 0 && this.currentPage-- : a == "next" ? this.currentPage < this.totalPages && this.currentPage++ : Number.isInteger(a) && a <= this.totalPages && (this.currentPage = a), this.setActiveSlides(), this.setActiveDot(), this.updateSlide(), this.refreshNav(), this.config.autoHeight && this.calculateContainerHeight(this.getCurrentSlideDom()), d != this.currentPage && this.trigger("onChanged");
    }
  }, {
    key: "goToUrl",
    value: function goToUrl(a) {
      var b = !(arguments.length > 1 && arguments[1] !== undefined) || arguments[1];
      var c = this.getEl(".".concat(this.cItem, "[").concat(this.dId, "=\"").concat(a, "\"]"));
      this.changePage(parseInt(c.getAttribute(this.dSlide)), b);
    }
  }, {
    key: "updateSlide",
    value: function updateSlide() {
      if (this.config.centerSlide) {
        var a = -this.getSlidePos(this.getCurrentSlideDom()) - -(parseInt(this.getSlideStyle().width) * Math.floor(this.config.items / 2));
        this.currentTranslate = a, this.scrollToPos(a);
      } else this.scrollToSlide(this.getCurrentSlideDom());
    }
  }, {
    key: "setActiveSlides",
    value: function setActiveSlides() {
      var a = this;
      if (this.activeSlides != null && this.activeSlides.forEach(function (b) {
        a.getEl("[".concat(a.dSlide, "=\"").concat(b, "\"]")).classList.remove("active");
      }), this.activeSlides = [], this.config.centerSlide) this.activeSlides.push(this.currentPage);else if (this.config.itemPerPage) for (var b = this.currentPage; b < this.currentPage + this.config.items; b++) this.activeSlides.push(b);else if (this.getSlideIndexForPage() + this.config.items > this.getTotalSlides()) for (var b = this.slides.length - this.config.items; b < this.getTotalSlides(); b++) this.activeSlides.push(b);else for (var b = this.getSlideIndexForPage(); b < this.getSlideIndexForPage() + this.config.items; b++) b < this.slides.length && this.activeSlides.push(b);
      this.activeSlides.forEach(function (b) {
        a.getEl("[".concat(a.dSlide, "=\"").concat(b, "\"]")).classList.add("active");
      });
    }
  }, {
    key: "setActiveDot",
    value: function setActiveDot() {
      var b = "active";

      if (this.config.dots) {
        var c = this.getEl(".".concat(this.cDot, "[").concat(this.dSlide, "].") + b);
        c != null && c.classList.remove(b), this.getEl(".".concat(this.cDot, "[").concat(this.dSlide, "=\"").concat(this.currentPage, "\"]")).classList.add(b);
      }
    }
  }, {
    key: "autoplayStart",
    value: function autoplayStart() {
      var a = this;
      this.ap == null && (this.ap = setInterval(function () {
        return a.nextPage();
      }, this.config.autoplaySpeed));
    }
  }, {
    key: "autoplayStop",
    value: function autoplayStop() {
      this.ap > 0 && (clearTimeout(this.ap), this.ap = undefined);
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
      return this.currentPage * this.config.items;
    }
  }, {
    key: "getCurrentSlideDom",
    value: function getCurrentSlideDom() {
      return this.getEl("[".concat(this.dSlide, "].active"));
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
      var a = this.newEl("tr"),
          b = {
        transition: "transitionend",
        MozTransition: "transitionend",
        WebkitTransition: "webkitTransitionEnd"
      };

      for (var c in b) if (a.style[c] !== undefined) return b[c];
    }
  }, {
    key: "getEl",
    value: function getEl(a, b) {
      var c = "".concat(this.containerName, " ").concat(a);
      return b ? document.querySelectorAll(c) : document.querySelector(c);
    }
  }, {
    key: "newEl",
    value: function newEl(a) {
      return document.createElement(a);
    }
  }]), a;
}(); //polyfills


Number.isInteger = Number.isInteger || function (a) {
  return typeof a === "number" && isFinite(a) && Math.floor(a) === a;
}, window.NodeList && !NodeList.prototype.forEach && (NodeList.prototype.forEach = Array.prototype.forEach), !('remove' in Element.prototype) && (Element.prototype.remove = function () {
  var b = this.parentNode;
  b && b.removeChild(this);
}), Object.values = Object.values || function (a) {
  return Object.keys(a).map(function (b) {
    return a[b];
  });
};

//# sourceMappingURL=ddcarousel.js.map
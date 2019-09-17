"use strict";

function _classCallCheck(a, b) { if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function"); }

function _defineProperties(a, b) { for (var c = 0; c < b.length; c++) { var d = b[c]; d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), Object.defineProperty(a, d.key, d); } }

function _createClass(a, b, c) { return b && _defineProperties(a.prototype, b), c && _defineProperties(a, c), a; }

function _defineProperty(a, b, c) { return b in a ? Object.defineProperty(a, b, { value: c, enumerable: !0, configurable: !0, writable: !0 }) : a[b] = c, a; }

/*! DDCarousel 1.0.2 by Danail Dinev 2019 | License: https://github.com/danaildinev/ddcarousel/blob/master/LICENSE */
var DDCarousel =
/*#__PURE__*/
function () {
  //full container name
  //DOM element: container
  //DOM element: stage
  //current slide
  //use dot store slides heights when using autoHeight
  function a(b) {
    var c = b.container,
        d = c === void 0 ? ".ddcarousel" : c,
        e = b.nav,
        f = e !== void 0 && e,
        g = b.dots,
        h = g === void 0 || g,
        i = b.autoHeight,
        j = i !== void 0 && i,
        k = b.items,
        l = k === void 0 ? 1 : k,
        m = b.responsive,
        n = m !== void 0 && m,
        o = b.touch,
        p = o === void 0 || o,
        q = b.touchMouse,
        r = q === void 0 || q,
        s = b.centerSlide,
        t = s !== void 0 && s,
        u = b.touchSwipeThreshold,
        v = u === void 0 ? 60 : u,
        w = b.touchMaxSlideDist,
        x = w === void 0 ? 500 : w,
        y = b.swipeSmooth,
        z = y === void 0 ? 0 : y,
        A = b.slideChangeDuration,
        B = A === void 0 ? 0.5 : A,
        C = b.labelNavPrev,
        D = C === void 0 ? "< Prev" : C,
        E = b.labelNavNext,
        F = E === void 0 ? "Next >" : E;
    _classCallCheck(this, a), _defineProperty(this, "appName", "DDCarousel"), _defineProperty(this, "containerName", null), _defineProperty(this, "container", null), _defineProperty(this, "stage", null), _defineProperty(this, "currentSlide", 0), _defineProperty(this, "currentPage", 0), _defineProperty(this, "currentTranslate", 0), _defineProperty(this, "slideDiff", 0), _defineProperty(this, "slidesHeights", []), _defineProperty(this, "triggers", []), _defineProperty(this, "activeSlides", []), _defineProperty(this, "totalPages", []), _defineProperty(this, "isDragging", !1), _defineProperty(this, "init", !1), _defineProperty(this, "cCont", "ddcarousel-container"), _defineProperty(this, "cStage", "ddcarousel-stage"), _defineProperty(this, "cNav", "ddcarousel-nav"), _defineProperty(this, "cItem", "ddcarousel-item"), _defineProperty(this, "cResp", "ddcarousel-responsive"), _defineProperty(this, "cDSlide", "data-slide"), _defineProperty(this, "cContDots", "ddcarousel-dots"), _defineProperty(this, "cDot", "ddcarousel-dot"), _defineProperty(this, "cPrev", "ddcarousel-prev"), _defineProperty(this, "cNext", "ddcarousel-next"), this.triggerHandler("initializing"), void 0, this.checkContainer(d) && (this.containerName = d, this.autoHeight = j, this.itemsPerPage = l, this.responsive = n, this.nav = f, this.dots = h, this.touch = p, this.touchMouse = r, this.touchSwipeThreshold = v, this.touchMaxSlideDist = x, this.swipeSmooth = z, this.slideChangeDuration = B, this.labelNavPrev = D, this.labelNavNext = F, l > 1 && l % 2 && t ? (this.centeredSlideOffset = Math.floor(l / 2), this.centerSlide = !0) : (this.centeredSlideOffset = 0, this.centerSlide = !1), this.createStage(), this.setActiveSlides(), this.calculateStage(), this.createNav(), this.createDots(), this.attachEvents(), this.setActiveDot(), this.updateSlide(), this.nav && this.refreshNav());
  }

  return _createClass(a, [{
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
      return a.substring(0, 1) == "#" ? document.getElementById(b) == null ? (console.error("".concat(this.appName, ": Invalid container ID!")), !1) : (this.container = document.getElementById(containerNameClear), !0) : a.substring(0, 1) == "." ? document.getElementsByClassName(b)[0] == null ? (console.error("".concat(this.appName, ": Invalid container class!")), !1) : (this.container = document.getElementsByClassName(b)[0], !0) : (console.error("".concat(this.appName, ": Invalid container!")), !1);
    }
  }, {
    key: "createStage",
    value: function createStage() {
      var a = 0,
          b = document.createElement("div"),
          c = document.createElement("div");

      //set parameters to slides and add them in the new ddcarousel-item container with some params
      for (b.classList.add(this.cCont), c.classList.add(this.cStage), this.slidesSource = document.querySelectorAll("".concat(this.containerName, " > div")), this.container.appendChild(b), b.appendChild(c), this.stage = document.querySelector("".concat(this.containerName, " .").concat(this.cStage)), this.responsive && this.container.classList.add(this.cResp), a = 0; a < this.slidesSource.length; a++) {
        var d = document.createElement("div");
        d.classList.add(this.cItem), d.setAttribute(this.cDSlide, a), d.appendChild(this.slidesSource[a]), c.appendChild(d);
      } //get all slides and total pages


      this.slides = document.querySelectorAll("".concat(this.containerName, " .").concat(this.cItem)), this.totalPages = this.centerSlide ? this.slides.length : Math.ceil(this.slides.length / this.itemsPerPage) - 1, this.slideDiff = this.slides.length - this.itemsPerPage, this.centeredSlideDiff = this.centerSlide ? this.slideDiff + this.itemsPerPage : 0;
    }
  }, {
    key: "calculateStage",
    value: function calculateStage() {
      var a,
          b = this.slides[0].style.width,
          c = parseInt(window.getComputedStyle(this.container).width);

      for (this.slidesHeights = [], a = 0; a < this.slides.length; a++) this.slides[a].style.width = this.itemsPerPage == null ? c + "px" : c / this.itemsPerPage + "px", this.slidesHeights.push(document.querySelector("".concat(this.containerName, " [").concat(this.cDSlide, "=\"").concat(a, "\"] > div")).scrollHeight);

      this.autoHeight && this.calculateContainerHeight(this.currentPage), b != this.slides[0].style.width && this.triggerHandler("resized"), !this.init && this.slides.length == this.slidesSource.length && document.querySelectorAll("".concat(this.containerName, " .").concat(this.cStage, " [").concat(this.cDSlide, "]")).length > 0 && (this.triggerHandler("initialized"), void 0, this.init = !0);
    }
  }, {
    key: "createNav",
    value: function createNav() {
      if (this.nav) {
        var a = document.createElement("div"),
            b = document.createElement("button"),
            c = document.createElement("button");
        a.classList.add(this.cNav), b.classList.add(this.cPrev), b.innerHTML = this.labelNavPrev, c.classList.add(this.cNext), c.innerHTML = this.labelNavNext, a.appendChild(b), a.appendChild(c), this.container.appendChild(a), this.navPrevBtn = document.querySelector("".concat(this.containerName, " .").concat(this.cPrev)), this.navNextBtn = document.querySelector("".concat(this.containerName, " .").concat(this.cNext));
      }
    }
  }, {
    key: "createDots",
    value: function createDots() {
      var a = this;

      if (this.dots) {
        var b,
            c,
            d,
            e = document.createElement("div");

        for (e.classList.add(this.cContDots), d = this.itemsPerPage > 1 ? this.centerSlide ? this.centeredSlideDiff : this.totalPages + 1 : this.slides.length, b = 0; b < d; b++) c = document.createElement("button"), c.classList.add(this.cDot), c.setAttribute(this.cDSlide, b), c.addEventListener("click", function (b) {
          return a.goToPage(parseInt(b.target.getAttribute(a.cDSlide)));
        }), e.appendChild(c);

        this.container.appendChild(e);
      }
    }
  }, {
    key: "attachEvents",
    value: function attachEvents() {
      var a = this;
      this.nav && (this.navPrevBtn.addEventListener("click", function () {
        return a.prevPage();
      }), this.navNextBtn.addEventListener("click", function () {
        return a.nextPage();
      }), this.on("changed", function () {
        a.refreshNav();
      })), this.responsive && window.addEventListener("resize", function () {
        a.calculateStage(), a.scrollToSlide(a.getCurrentSlideDom());
      });
      //anim
      var b = this.whichTransitionEvent();
      b && this.stage.addEventListener(b, function () {
        a.triggerHandler("traisitioned"), void 0;
      }), this.attachTouchEvents();
    }
  }, {
    key: "attachTouchEvents",
    value: function attachTouchEvents() {
      var a = this;
      var b,
          c,
          d,
          f,
          g,
          h,
          i = [],
          j = [],
          k = []; //add events based on options

      this.touch && (i.push("touchstart"), j.push("touchmove"), k.push("touchend")), this.touchMouse && (i.push("mousedown"), j.push("mousemove"), k.push("mouseup")), i.forEach(function (d) {
        window.addEventListener(d, function (d) {
          d.target == a.stage && (a.isDragging = !0, c = d.type == "mousedown" || d.type == "mousedown" && a.touchMouse ? d.clientX : d.targetTouches[0].clientX, b = d.type == "mousedown" || d.type == "mousedown" && a.touchMouse ? d.clientX + -a.currentTranslate : d.targetTouches[0].clientX + -a.currentTranslate, f = a.currentTranslate, h = !1, a.triggerHandler("drag"), void 0);
        }, {
          passive: !0
        });
      }), k.forEach(function (b) {
        window.addEventListener(b, function () {
          a.isDragging && (a.triggerHandler("dragged"), void 0, g >= a.touchSwipeThreshold && !h ? d > f ? a.prevPage() : a.nextPage() : a.scrollToPos(f), a.stage.style.transitionDuration = a.slideChangeDuration + "s", a.isDragging = !1);
        });
      }), j.forEach(function (e) {
        window.addEventListener(e, function (f) {
          if (a.isDragging) {
            var e;
            f.type == "mousemove" && a.touchMouse ? e = f.clientX : f.type == "touchmove" && (e = f.targetTouches[0].pageX), a.stage.style.transitionDuration = a.swipeSmooth + "s", g = Math.abs(e - c), d = e - b, g <= a.touchMaxSlideDist ? (a.triggerHandler("dragging"), void 0, a.scrollToPos(d)) : (h = !0, d = e - b);
          }
        }, {
          passive: !0
        });
      });
    }
  }, {
    key: "refreshNav",
    value: function refreshNav() {
      this.currentPage == 0 ? (this.navPrevBtn.classList.add("inactive"), this.navNextBtn.classList.remove("inactive")) : (this.centerSlide ? this.getActiveSlides() == this.getTotalSlides() : this.currentPage == this.getTotalPages()) ? (this.navPrevBtn.classList.remove("inactive"), this.navNextBtn.classList.add("inactive")) : (this.navPrevBtn.classList.remove("inactive"), this.navNextBtn.classList.remove("inactive"));
    }
  }, {
    key: "scrollToSlide",
    value: function scrollToSlide(a) {
      this.currentTranslate = -this.getSlideDomSize(a), this.scrollToPos(this.currentTranslate);
    }
  }, {
    key: "scrollToPos",
    value: function scrollToPos(a) {
      var b = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      var c = "translateX(".concat(a, "px)");
      b ? this.stage.style.webkitTransform = c : this.stage.style.transform = c;
    }
  }, {
    key: "calculateContainerHeight",
    value: function calculateContainerHeight() {
      if (this.itemsPerPage == 1) this.container.style.height = this.slidesHeights[this.currentPage] + "px";else {
        var a,
            b = []; //get specified slides from global array with heights and then get the highest of it

        for (a = this.getActiveSlides()[0]; a <= this.getActiveSlides()[this.getActiveSlides().length - 1]; a++) b.push(this.slidesHeights[a]);

        void 0, this.container.style.height = Math.max.apply(Math, b) + "px";
      }
    }
  }, {
    key: "changePage",
    value: function changePage(a) {
      var b = this.currentPage;
      this.stage.style.transitionDuration = this.slideChangeDuration + "s", a == "prev" ? (this.currentSlide = this.centerSlide ? this.currentSlide - 1 : this.currentSlide - this.itemsPerPage, this.currentPage--) : a == "next" ? (this.currentSlide = this.centerSlide ? this.currentSlide + 1 : this.currentSlide + this.itemsPerPage, this.currentPage++) : Number.isInteger(a) && (this.currentSlide = a), a == "prev" && this.currentSlide < 0 ? this.centerSlide ? (this.currentSlide--, this.currentPage--) : (this.currentSlide = 0, this.currentPage = 0) : a == "next" && this.currentSlide + this.itemsPerPage >= this.slides.length && (void 0, this.centerSlide ? this.currentSlide > this.slides.length && (this.currentSlide++, this.currentPage++) : (this.currentSlide = this.slides.length - this.itemsPerPage, this.currentPage = this.totalPages)), this.setActiveSlides(), this.setActiveDot(), this.updateSlide(), this.autoHeight && this.calculateContainerHeight(this.getCurrentSlideDom()), b != this.currentPage && (this.triggerHandler("changed"), void 0);
    }
  }, {
    key: "updateSlide",
    value: function updateSlide() {
      if (this.centerSlide) {
        var a = -this.getSlideDomSize(this.getCurrentSlideDom()) - -this.getCurrentSlideDom().getBoundingClientRect().width * this.centeredSlideOffset;
        this.currentTranslate = a, this.scrollToPos(a);
      } else this.scrollToSlide(this.getCurrentSlideDom());
    }
  }, {
    key: "setActiveSlides",
    value: function setActiveSlides() {
      var a = this;
      if (this.activeSlides.forEach(function (b) {
        document.querySelector("".concat(a.containerName, " [").concat(a.cDSlide, "=\"").concat(b, "\"]")).classList.remove("active");
      }), this.activeSlides = [], this.centerSlide) this.activeSlides.push(this.currentSlide);else for (var b = this.currentSlide; b < this.itemsPerPage + this.currentSlide; b++) b < this.slides.length && this.activeSlides.push(b);
      this.activeSlides.forEach(function (b) {
        document.querySelector("".concat(a.containerName, " [").concat(a.cDSlide, "=\"").concat(b, "\"]")).classList.add("active");
      });
    }
  }, {
    key: "setActiveDot",
    value: function setActiveDot() {
      if (this.dots) {
        var b = document.querySelector("".concat(this.containerName, " .").concat(this.cDot, "[").concat(this.cDSlide, "].active"));
        b != null && b.classList.remove("active"), document.querySelector("".concat(this.containerName, " .").concat(this.cDot, "[").concat(this.cDSlide, "=\"").concat(this.currentPage, "\"]")).classList.add("active");
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
    key: "goToPage",
    value: function goToPage(a) {
      a >= 0 && a <= this.totalPages && this.changePage(a);
    }
  }, {
    key: "getCurrentSlideDom",
    value: function getCurrentSlideDom() {
      return document.querySelector("".concat(this.containerName, " [").concat(this.cDSlide, "].active"));
    }
  }, {
    key: "getCurrentPage",
    value: function getCurrentPage() {
      return document.querySelector("".concat(this.containerName, " [").concat(this.cDSlide, "=\"").concat(this.currentPage, "\"].active")).getAttribute(this.cDSlide);
    }
  }, {
    key: "getTotalSlides",
    value: function getTotalSlides() {
      return this.slides.length - 1;
    }
  }, {
    key: "getSlideDom",
    value: function getSlideDom(a) {
      return document.querySelector("".concat(this.containerName, " .").concat(this.cItem, "[").concat(this.cDSlide, "=\"").concat(a, "\"]"));
    }
  }, {
    key: "getSlideDomSize",
    value: function getSlideDomSize(a) {
      return a.getBoundingClientRect().left - this.stage.getBoundingClientRect().left;
    }
  }, {
    key: "getActiveSlides",
    value: function getActiveSlides() {
      return this.activeSlides;
    }
  }, {
    key: "getTotalPages",
    value: function getTotalPages() {
      return this.totalPages;
    }
  }, {
    key: "whichTransitionEvent",
    value: function whichTransitionEvent() {
      var a;
      var b = document.createElement("fakeelement");
      var c = {
        transition: "transitionend",
        MozTransition: "transitionend",
        WebkitTransition: "webkitTransitionEnd"
      };

      for (a in c) if (b.style[a] !== undefined) return c[a];
    }
  }]), a;
}();

Number.isInteger = Number.isInteger || function (a) {
  return typeof a === "number" && isFinite(a) && Math.floor(a) === a;
}, !("classList" in document.documentElement) && Object.defineProperty && typeof HTMLElement !== "undefined" && Object.defineProperty(HTMLElement.prototype, "classList", {
  get: function get() {
    function a(a) {
      return function (c) {
        var d = b.className.split(/\s+/),
            e = d.indexOf(c);
        a(d, e, c), b.className = d.join(" ");
      };
    }

    var b = this;
    var c = {
      add: a(function (a, b, c) {
        ~b || a.push(c);
      }),
      remove: a(function (a, b) {
        ~b && a.splice(b, 1);
      }),
      contains: function contains(a) {
        return !!~b.className.split(/\s+/).indexOf(a);
      },
      item: function item(a) {
        return b.className.split(/\s+/)[a] || null;
      }
    };
    return Object.defineProperty(c, "length", {
      get: function get() {
        return b.className.split(/\s+/).length;
      }
    }), c;
  }
});

//# sourceMappingURL=ddcarousel.js.map
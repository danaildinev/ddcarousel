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
        s = b.touchSwipeThreshold,
        t = s === void 0 ? 60 : s,
        u = b.touchMaxSlideDist,
        v = u === void 0 ? 500 : u,
        w = b.swipeSmooth,
        x = w === void 0 ? 0.1 : w,
        y = b.slideChangeDuration,
        z = y === void 0 ? 0.3 : y,
        A = b.labelNavPrev,
        B = A === void 0 ? "< Prev" : A,
        C = b.labelNavNext,
        D = C === void 0 ? "Next >" : C;
    _classCallCheck(this, a), _defineProperty(this, "appName", "DDCarousel"), _defineProperty(this, "containerName", null), _defineProperty(this, "container", null), _defineProperty(this, "stage", null), _defineProperty(this, "currentSlide", 0), _defineProperty(this, "currentTranslate", 0), _defineProperty(this, "slideDiff", 0), _defineProperty(this, "slidesHeights", []), _defineProperty(this, "triggers", []), _defineProperty(this, "cCont", "ddcarousel-container"), _defineProperty(this, "cStage", "ddcarousel-stage"), _defineProperty(this, "cNav", "ddcarousel-nav"), _defineProperty(this, "cItem", "ddcarousel-item"), _defineProperty(this, "cResp", "ddcarousel-responsive"), _defineProperty(this, "cDSlide", "data-slide"), _defineProperty(this, "cContDots", "ddcarousel-dots"), _defineProperty(this, "cDot", "ddcarousel-dot"), _defineProperty(this, "cPrev", "ddcarousel-prev"), this.checkContainer(d) && (this.containerName = d, this.autoHeight = j, this.itemsPerPage = l, this.responsive = n, this.nav = f, this.dots = h, this.touch = p, this.touchMouse = r, this.touchSwipeThreshold = t, this.touchMaxSlideDist = v, this.swipeSmooth = x, this.slideChangeDuration = z, this.labelNavPrev = B, this.labelNavNext = D, this.createStage(), this.calculateStage(), this.createNav(), this.createDots(), this.attachEvents(), this.changeSlide(this.changeSlide), this.nav && this.refreshNav());
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
      return a.substring(0, 1) == "#" ? document.getElementById(b) == null ? (console.log("".concat(this.appName, ": Invalid container ID!")), !1) : (this.container = document.getElementById(containerNameClear), !0) : a.substring(0, 1) == "." ? document.getElementsByClassName(b)[0] == null ? (console.log("".concat(this.appName, ": Invalid container class!")), !1) : (this.container = document.getElementsByClassName(b)[0], !0) : (console.log("".concat(this.appName, ": Invalid container!")), !1);
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
      } //get all slides


      this.slides = document.querySelectorAll("".concat(this.containerName, " .").concat(this.cItem));
    }
  }, {
    key: "calculateStage",
    value: function calculateStage() {
      var a,
          b = this.slides[0].style.width,
          c = parseInt(window.getComputedStyle(this.container).width);

      for (this.slidesHeights = [], a = 0; a < this.slides.length; a++) this.slides[a].style.width = this.itemsPerPage == null ? c + "px" : c / this.itemsPerPage + "px", this.slidesHeights.push(document.querySelector("".concat(this.containerName, " [").concat(this.cDSlide, "=\"").concat(a, "\"] > div")).scrollHeight);

      this.autoHeight && this.calculateContainerHeight(this.currentSlide), this.scrollToSlide(this.getCurrentSlideDom()), b != this.slides[0].style.width && this.triggerHandler("resized");
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

        for (e.classList.add(this.cContDots), d = this.itemsPerPage > 1 ? this.slides.length - this.itemsPerPage + 1 : this.slides.length, b = 0; b < d; b++) c = document.createElement("button"), c.classList.add(this.cDot), c.setAttribute(this.cDSlide, b), c.addEventListener("click", function (b) {
          return a.changeSlide(parseInt(b.target.getAttribute(a.cDSlide)));
        }), e.appendChild(c);

        this.container.appendChild(e);
      }
    }
  }, {
    key: "attachEvents",
    value: function attachEvents() {
      var a = this;
      this.nav && (this.navPrevBtn.addEventListener("click", function () {
        return a.prevSlide();
      }), this.navNextBtn.addEventListener("click", function () {
        return a.nextSlide();
      }), this.on("changed", function () {
        a.refreshNav();
      })), this.responsive && window.addEventListener("resize", function () {
        a.calculateStage();
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
          i,
          j = [],
          k = [],
          l = []; //add events based on options

      this.touch && (j.push("touchstart"), k.push("touchmove"), l.push("touchend")), this.touchMouse && (j.push("mousedown"), k.push("mousemove"), l.push("mouseup")), j.forEach(function (d) {
        a.stage.addEventListener(d, function (d) {
          i = !0, c = d.type == "mousedown" || d.type == "mousedown" && a.touchMouse ? d.clientX : d.targetTouches[0].clientX, b = d.type == "mousedown" || d.type == "mousedown" && a.touchMouse ? d.clientX + -a.currentTranslate : d.targetTouches[0].clientX + -a.currentTranslate, f = a.currentTranslate, h = !1, a.triggerHandler("drag");
        }, {
          passive: !0
        });
      }), l.forEach(function (b) {
        a.stage.addEventListener(b, function () {
          a.triggerHandler("dragged"), g >= a.touchSwipeThreshold && !h ? d > f ? a.prevSlide() : a.nextSlide() : a.scrollToPos(f), a.stage.style.transitionDuration = a.slideChangeDuration + "s", i = !1;
        });
      }), k.forEach(function (e) {
        a.stage.addEventListener(e, function (f) {
          var e;
          f.type == "mousemove" && a.touchMouse ? i && (e = f.clientX) : f.type == "touchmove" && (e = f.targetTouches[0].pageX), a.stage.style.transitionDuration = a.swipeSmooth + "s", g = Math.abs(e - c), d = e - b, g <= a.touchMaxSlideDist ? a.scrollToPos(d) : (h = !0, d = e - b);
        }, {
          passive: !0
        });
      });
    }
  }, {
    key: "refreshNav",
    value: function refreshNav() {
      this.currentSlide == 0 ? this.navPrevBtn.classList.add("inactive") : this.currentSlide === this.slides.length - 1 || this.currentSlide == this.slideDiff ? this.navNextBtn.classList.add("inactive") : this.currentSlide > 0 && this.currentSlide < this.slides.length && (this.navPrevBtn.classList.remove("inactive"), this.navNextBtn.classList.remove("inactive"));
    }
  }, {
    key: "scrollToSlide",
    value: function scrollToSlide(a) {
      this.currentTranslate = -(a.getBoundingClientRect().left - this.stage.getBoundingClientRect().left), this.scrollToPos(this.currentTranslate);
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
      if (this.itemsPerPage == 1) this.container.style.height = this.slidesHeights[this.currentSlide] + "px";else {
        var a,
            b = []; //get specified slides from global array with heights and then get the highest of it

        for (a = this.currentSlide; a <= this.currentSlide + this.itemsPerPage - 1; a++) b.push(this.slidesHeights[a]), this.container.style.height = Math.max.apply(Math, b) + "px";
      }
    }
  }, {
    key: "changeSlide",
    value: function changeSlide(a) {
      var b = this.currentSlide;
      this.stage.style.transitionDuration = this.slideChangeDuration + "s", this.dots && document.querySelector("".concat(this.containerName, " .").concat(this.cDot, "[").concat(this.cDSlide, "=\"").concat(this.currentSlide, "\"]")).classList.remove("active"), this.getSlideDom(this.currentSlide).classList.remove("active"), a == "prev" ? this.currentSlide-- : a == "next" ? this.currentSlide++ : Number.isInteger(a) && (this.currentSlide = a), this.slideDiff = this.slides.length - this.itemsPerPage, this.itemsPerPage > 1 && this.currentSlide >= this.slideDiff ? this.currentSlide = this.slideDiff : this.currentSlide >= this.slides.length ? this.currentSlide = this.slides.length - 1 : this.currentSlide < 0 && (this.currentSlide = 0), this.scrollToSlide(this.getCurrentSlideDom()), this.getSlideDom(this.currentSlide).classList.add("active"), this.dots && document.querySelector("".concat(this.containerName, " .").concat(this.cDot, "[").concat(this.cDSlide, "=\"").concat(this.currentSlide, "\"]")).classList.add("active"), this.autoHeight && this.calculateContainerHeight(this.getCurrentSlideDom()), b != this.currentSlide && this.triggerHandler("changed");
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
      return document.querySelector("".concat(this.containerName, " [").concat(this.cDSlide, "=\"").concat(this.currentSlide, "\"]"));
    }
  }, {
    key: "getCurrentPage",
    value: function getCurrentPage() {
      return document.querySelector("".concat(this.containerName, " [").concat(this.cDSlide, "=\"").concat(this.currentSlide, "\"].active")).getAttribute(this.cDSlide);
    }
  }, {
    key: "getTotalSlides",
    value: function getTotalSlides() {
      return this.slides.length;
    }
  }, {
    key: "getSlideDom",
    value: function getSlideDom(a) {
      return document.querySelector("".concat(this.containerName, " .").concat(this.cItem, "[").concat(this.cDSlide, "=\"").concat(a, "\"]"));
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
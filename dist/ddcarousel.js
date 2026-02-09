/*! ddcarousel v1.4.0 | MIT | https://github.com/danaildinev/ddcarousel.git */
"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(a, b) { var c = Object.keys(a); if (Object.getOwnPropertySymbols) { var d = Object.getOwnPropertySymbols(a); b && (d = d.filter(function (b) { return Object.getOwnPropertyDescriptor(a, b).enumerable; })), c.push.apply(c, d); } return c; }
function _objectSpread(a) { for (var b = 1; b < arguments.length; b++) { var c = null == arguments[b] ? {} : arguments[b]; b % 2 ? ownKeys(Object(c), !0).forEach(function (b) { _defineProperty(a, b, c[b]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(a, Object.getOwnPropertyDescriptors(c)) : ownKeys(Object(c)).forEach(function (b) { Object.defineProperty(a, b, Object.getOwnPropertyDescriptor(c, b)); }); } return a; }
function _defineProperty(a, b, c) { return (b = _toPropertyKey(b)) in a ? Object.defineProperty(a, b, { value: c, enumerable: !0, configurable: !0, writable: !0 }) : a[b] = c, a; }
function _toPropertyKey(a) { var b = _toPrimitive(a, "string"); return "symbol" == (typeof b === "undefined" ? "undefined" : _typeof(b)) ? b : b + ""; }
function _toPrimitive(a, b) { if ("object" != (typeof a === "undefined" ? "undefined" : _typeof(a)) || !a) return a; var c = a[Symbol.toPrimitive]; if (void 0 !== c) { var d = c.call(a, b || "default"); if ("object" != (typeof d === "undefined" ? "undefined" : _typeof(d))) return d; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === b ? String : Number)(a); }
function _toConsumableArray(a) { return _arrayWithoutHoles(a) || _iterableToArray(a) || _unsupportedIterableToArray(a) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(b, c) { if (b) { if ("string" == typeof b) return _arrayLikeToArray(b, c); var a = {}.toString.call(b).slice(8, -1); return "Object" === a && b.constructor && (a = b.constructor.name), "Map" === a || "Set" === a ? Array.from(b) : "Arguments" === a || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(a) ? _arrayLikeToArray(b, c) : void 0; } }
function _iterableToArray(a) { if ("undefined" != typeof Symbol && null != a[Symbol.iterator] || null != a["@@iterator"]) return Array.from(a); }
function _arrayWithoutHoles(a) { if (Array.isArray(a)) return _arrayLikeToArray(a); }
function _arrayLikeToArray(b, c) { (null == c || c > b.length) && (c = b.length); for (var d = 0, f = Array(c); d < c; d++) f[d] = b[d]; return f; }
var ddcarousel = function b(a) {
  function c(a) {
    return Ha ? (console.error("".concat(ga, ": Already created!")), !1) : a != null && void (oa = {
      container: "." + ga,
      nav: !1,
      dots: !0,
      autoHeight: !0,
      fullWidth: !0,
      startPage: 0,
      items: 1,
      itemPerPage: !1,
      vertical: !1,
      verticalMaxContentWidth: !1,
      urlNav: !1,
      lazyLoad: !1,
      lazyPreload: !1,
      lazyPreloadSlides: 1,
      responsive: [],
      autoplay: !1,
      autoplaySpeed: 5000,
      autoplayPauseHover: !1,
      autoplayProgress: !0,
      touchDrag: !0,
      mouseDrag: !1,
      keyboardNavigation: !1,
      centerSlide: !1,
      touchSwipeThreshold: 60,
      touchMaxSlideDist: 500,
      resizeRefresh: 200,
      swipeSmooth: 0,
      slideChangeDuration: 0.5,
      callbacks: !1,
      labelNavPrev: "&#x2190;",
      labelNavNext: "&#x2192;"
    }, va = 0, wa = 0, ua = [], ma = {}, ma = a === undefined ? oa : a, d(), f(la.container) && (Ia = document.querySelector(la.container).className, j("onInitialize", {
      container: pa,
      event: "onInitialize"
    }), k() !== !1 && (p(), r(), s(), t(), Q(), N(la.startPage > 0 ? la.startPage : 0, !1), D(), x(), j("onInitialized"), Ha = !0)));
  }
  function d() {
    var a = this;
    la = [], na = [], ja.forEach(function (b) {
      oa[b] = function () {}, h(b, function (c) {
        la[b].call(a, c == null ? g(b) : c);
      });
    }), ma['responsive'] !== undefined && (na = ma['responsive']), la = oa, e(ma);
  }
  function e(a) {
    for (var b in a) la[b] = a[b];
    la.items == 0 && (la.itemPerPage = !1);
  }
  function f(a) {
    var b = document.querySelector(a);
    return b == null ? (console.error("".concat(ga, ": Invalid container!")), !1) : (pa = b, Ja = a, !0);
  }
  function g(a) {
    return la.callbacks ? new Object({
      container: pa,
      event: a,
      currentSlides: ua,
      currentPage: va,
      totalSlides: $(),
      totalPages: wa
    }) : undefined;
  }
  function h(a, b) {
    !ja[a] && (ja[a] = []), ja[a].push(b);
  }
  function j(a, b) {
    if (ja[a]) for (var c in ja[a]) ja[a][c](b);
  }
  function k() {
    var a = fa("div"),
      b = fa("div");
    if (sa = ea("> div", !0), a.classList.add(ha.cont), b.classList.add(ha.stage), pa.appendChild(a), a.appendChild(b), qa = ea(".".concat(ha.stage)), sa.length == 0) return console.error("".concat(ga, ": No content found in container. Destroying carousel...")), l(), !1;
    for (var c = 0; c < sa.length; c++) {
      var d = fa("div");
      d.classList.add(ha.item), d.setAttribute(ia.slide, c), d.appendChild(sa[c]), la.urlNav && sa[c].hasAttribute(ia.id) && sa[c].hasAttribute(ia.title) && (d.setAttribute(ia.id, sa[c].getAttribute(ia.id)), d.setAttribute(ia.title, sa[c].getAttribute(ia.title))), b.appendChild(d);
    }
    ra = ea(".".concat(ha.item), !0), m();
  }
  function l(a) {
    j("onDestroy");
    var b = document.querySelector(la.container);
    if (!a) {
      var c = ea(".".concat(ha.item), !0);
      c.forEach(function (a) {
        b.appendChild(a.firstChild);
      });
    }
    var d = ea(".".concat(ha.cont));
    return d && d.remove(), o() && ea(".".concat(ha.nav)).remove(), q() && ea(".".concat(ha.dots)).remove(), la.urlNav && ea(".".concat(ha.url)) && ea(".".concat(ha.url)).remove(), xa && U(), y(), b.className = Ia, va = 0, wa = 0, ra = [], ua = [], sa = [], Ha = !1, j("onDestroyed"), ja.forEach(function (a) {
      ja[a] = [];
    }), !0;
  }
  function m() {
    var a,
      b,
      c = ra[0].style.width,
      d = window.getComputedStyle(pa),
      e = pa.classList;
    la.fullWidth && !la.verticalMaxContentWidth ? e.add(ha.fullW) : e.remove(ha.fullW), la.vertical ? e.add(ha.vert) : e.remove(ha.vert), a = parseInt(d.width), b = parseInt(d.height), ra.length <= la.items && (la.items = ra.length), wa = la.centerSlide ? ra.length - 1 : la.itemPerPage ? ra.length - la.items : Math.ceil(ra.length / la.items) - 1, wa = wa, ta = [];
    var f = 0;
    for (var g = 0; g < ra.length; g++) {
      if (la.items != 0) la.vertical ? ra[g].style.height = b / la.items + "px" : !la.vertical && (ra[g].style.width = a / la.items + "px");else {
        var h = ra[g].getBoundingClientRect();
        ra[g].style.width = h.width + "px", f += h;
      }
      ta.push(n(ea("[".concat(ia.slide, "=\"").concat(g, "\"] > div"))));
    }
    if (!la.vertical && (qa.style.width = la.items == 0 ? f + "px" : a * ra.length + "px"), la.verticalMaxContentWidth) {
      var k,
        l = 0;
      sa.forEach(function (a) {
        k = a.getBoundingClientRect().width, k > l && (l = k);
      }), pa.style.width = l + "px";
    }
    la.autoHeight && (Q(), M(va)), la.mouseDrag ? qa.classList.add(ha.disable) : qa.classList.remove(ha.disable), c != ra[0].style.width && j("onResized");
  }
  function n(a) {
    var b = a.offsetHeight,
      c = getComputedStyle(a);
    return b += parseInt(c.marginTop) + parseInt(c.marginBottom), b;
  }
  function o() {
    return la.nav && wa > 0;
  }
  function p() {
    var a = ea(".".concat(ha.nav));
    if (o()) {
      var b = fa("div"),
        c = fa("button"),
        d = fa("button");
      a && a.remove(), b.classList.add(ha.nav), c.classList.add(ha.prev), c.innerHTML = la.labelNavPrev, d.classList.add(ha.next), d.innerHTML = la.labelNavNext, b.appendChild(c), b.appendChild(d), pa.appendChild(b), Ka = ea(".".concat(ha.prev)), La = ea(".".concat(ha.next)), Ka.addEventListener("click", function () {
        return W();
      }), La.addEventListener("click", function () {
        return V();
      });
    } else a != null && a.remove();
  }
  function q() {
    return la.dots && wa > 0;
  }
  function r() {
    var a = ea(".".concat(ha.dots));
    if (q()) {
      var b,
        c = fa("div");
      a && a.remove(), c.classList.add(ha.dots), b = la.items > 1 ? la.centerSlide ? ra.length : wa + 1 : ra.length;
      for (var d = 0; d < b; d++) {
        var e = fa("button");
        e.classList.add(ha.dot), e.setAttribute(ia.slide, d), e.addEventListener("click", function (a) {
          return N(parseInt(a.target.getAttribute(ia.slide)));
        }), c.appendChild(e);
      }
      pa.appendChild(c);
    } else a != null && a.remove();
  }
  function s() {
    var a = ea(".".concat(ha.url));
    if (la.urlNav) {
      var b = fa("div"),
        c = fa("ul");
      a && a.remove(), b.classList.add(ha.url), ra.forEach(function (b) {
        if (b.hasAttribute(ia.id) && b.hasAttribute(ia.title)) {
          var d = fa('li'),
            e = fa('a');
          e.href = "#" + b.getAttribute(ia.id), e.innerHTML = b.getAttribute(ia.title), d.appendChild(e), c.appendChild(d);
        }
      }), b.appendChild(c), pa.appendChild(b), ea(".".concat(ha.url, " a"), !0).forEach(function (a) {
        a.addEventListener("click", function (b) {
          O(a.getAttribute('href').substring(1));
        });
      });
    } else a != null && a.remove();
  }
  function t() {
    if (la.autoplay && (u(), la.autoplayProgress)) {
      var a = fa("div"),
        b = fa("div");
      a.classList.add(ha.prog), b.classList.add(ha.progb), a.appendChild(b), pa.appendChild(a);
    }
  }
  function u() {
    var a = ea(".".concat(ha.prog));
    a && a.remove();
  }
  function v() {
    if (la.lazyLoad) {
      if (la.lazyPreload) {
        var a = ua[ua.length - 1];
        for (var b = a + 1; b <= a + la.lazyPreloadSlides; b++) b < ra.length && ua.indexOf(b) == -1 && ua.push(b);
      }
      ua.forEach(function (a) {
        var b = ea("[".concat(ia.slide, "=\"").concat(a, "\"] img[data-src]"), !0);
        b.forEach(function (a) {
          return w(a);
        });
      });
    }
  }
  function w(a) {
    a && a.getAttribute(ia.lazyImg) && !a.src && (a.src = a.getAttribute(ia.lazyImg), a.removeAttribute(ia.lazyImg));
  }
  function x() {
    ya = ka ? qa : window, Pa.forEach(function (a) {
      return ya.addEventListener(a, G, {
        passive: !0
      });
    }), Qa.forEach(function (a) {
      return window.addEventListener(a, E, {
        passive: !0
      });
    }), Ra.forEach(function (a) {
      return window.addEventListener(a, H);
    }), window.addEventListener("resize", C), qa.addEventListener(ca(), B), la.autoplayPauseHover && la.autoplay ? z() : A(), la.keyboardNavigation && window.addEventListener("keydown", I);
  }
  function y() {
    ya = ka ? qa : window, Pa.forEach(function (a) {
      return ya.removeEventListener(a, G, {
        passive: !0
      });
    }), Qa.forEach(function (a) {
      return window.removeEventListener(a, E, {
        passive: !0
      });
    }), Ra.forEach(function (a) {
      return window.removeEventListener(a, H);
    }), window.removeEventListener("resize", C), qa.removeEventListener(ca(), B), A(), la.keyboardNavigation && window.removeEventListener("keydown", I);
  }
  function z() {
    Na.forEach(function (a) {
      return qa.addEventListener(a, U);
    }), Oa.forEach(function (a) {
      return qa.addEventListener(a, S);
    });
  }
  function A() {
    Na.forEach(function (a) {
      return qa.removeEventListener(a, U);
    }), Oa.forEach(function (a) {
      return qa.removeEventListener(a, S);
    });
  }
  function B() {
    j("onTransitionend");
  }
  function C() {
    m(), !Ma && (D(), Ma = !0, setTimeout(function () {
      Ma = !1;
    }, la.resizeRefresh));
  }
  function D() {
    var a = Object.keys(na);
    for (var b = a.length - 1; b >= 0; b--) document.body.clientWidth < a[b] ? e(Object.values(na)[b]) : document.body.clientWidth >= a[a.length - 1] && d();
    m(), p(), r(), t(), R(), Q(), s(), U(), la.autoplay && xa == null && S(), P(), J();
  }
  function E(a) {
    if (Ca) {
      var b = F(a, "mousemove", "touchmove");
      qa.style.transitionDuration = la.swipeSmooth + "s", Da = Math.abs(b - za), Ba = b - Aa, Da <= la.touchMaxSlideDist ? (j("onDragging"), L(Ba)) : (Fa = !0, Ba = b - Aa);
    }
  }
  function F(a, b, c) {
    return a.type == b && la.mouseDrag ? la.vertical ? a.clientY : a.pageX : a.type == c && la.touchDrag ? la.vertical ? a.targetTouches[0].pageY : a.targetTouches[0].pageX : void 0;
  }
  function G(a) {
    if (ka || a.target == qa) {
      var b = F(a, "mousedown", "touchStartCords");
      b !== undefined && (Ca = !0, za = b, Aa = za + -Ga, Ea = Ga, Fa = !1, j("onDrag"));
    }
  }
  function H() {
    Ca && (j("onDragged"), Da >= la.touchSwipeThreshold && !Fa ? Ba > Ea ? W() : V() : L(Ea), qa.style.transitionDuration = la.slideChangeDuration + "s", Ca = !1);
  }
  function I(a) {
    if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') switch (a.key) {
      case "ArrowLeft":
      case "ArrowUp":
        W(), a.preventDefault();
        break;
      case "ArrowRight":
      case "ArrowDown":
        V(), a.preventDefault();
    }
  }
  function J() {
    if (o()) {
      var a = "inactive";
      va == 0 ? (Ka.classList.add(a), La.classList.remove(a)) : va == wa ? (Ka.classList.remove(a), La.classList.add(a)) : (Ka.classList.remove(a), La.classList.remove(a));
    }
  }
  function K(a) {
    Ga = -_(a), L(Ga);
  }
  function L(a) {
    var b = la.vertical ? "translateY(".concat(a, "px)") : "translateX(".concat(a, "px)");
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ? qa.style.webkitTransform = b : qa.style.transform = b;
  }
  function M() {
    if (la.items == 1) pa.style.height = ta[va] + "px";else {
      var a = [];
      for (var b = ua[0]; b <= ua[ua.length - 1]; b++) a.push(ta[b]);
      pa.style.height = Math.max.apply(Math, a) + "px";
    }
  }
  function N(a) {
    var b = !(arguments.length > 1 && arguments[1] !== undefined) || arguments[1];
    var c = va;
    b ? qa.style.transitionDuration = la.slideChangeDuration + "s" : (qa.style.transitionDuration = "0s", qa.addEventListener(ca(), function () {
      qa.style.transitionDuration = la.slideChangeDuration + "0s";
    })), a == "prev" ? va != 0 && va-- : a == "next" ? va < wa && va++ : Number.isInteger(a) && a > -1 && a <= wa && (va = a), Q(), R(), P(), J(), la.autoHeight && M(Y()), c != va && j("onChanged");
  }
  function O(a) {
    var b = !(arguments.length > 1 && arguments[1] !== undefined) || arguments[1];
    var c = ea(".".concat(ha.item, "[").concat(ia.id, "=\"").concat(a, "\"]"));
    N(parseInt(c.getAttribute(ia.slide)), b);
  }
  function P() {
    if (la.centerSlide && la.items > 0) {
      var a = -_(Y()) - -(parseInt(ba().width) * Math.floor(la.items / 2));
      Ga = a, L(a);
    } else K(Y());
  }
  function Q() {
    if (ua != null && ua.forEach(function (a) {
      ea("[".concat(ia.slide, "=\"").concat(a, "\"]")).classList.remove("active");
    }), ua = [], la.centerSlide) ua.push(va);else if (la.itemPerPage) for (var a = va; a < va + la.items; a++) ua.push(a);else if (X() + la.items > $()) for (var a = ra.length - la.items; a < $(); a++) ua.push(a);else if (la.items == 0) ua.push(X());else for (var a = X(); a < X() + la.items; a++) a < ra.length && ua.push(a);
    ua.forEach(function (a) {
      ea("[".concat(ia.slide, "=\"").concat(a, "\"]")).classList.add("active");
    }), v();
  }
  function R() {
    var b = "active";
    if (q()) {
      var c = ea(".".concat(ha.dot, "[").concat(ia.slide, "].") + b);
      c != null && c.classList.remove(b), ea(".".concat(ha.dot, "[").concat(ia.slide, "=\"").concat(va, "\"]")).classList.add(b);
    }
  }
  function S() {
    !la.autoplay && xa != null || va == wa || (T(), xa = setInterval(function () {
      V(), T(), va == wa && (u(), clearInterval(xa));
    }, la.autoplaySpeed));
  }
  function T() {
    var a = ea(".".concat(ha.progb));
    !a && t();
    var b = la.autoplaySpeed;
    a.style.transition = 'none', a.style.width = '0%', requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        a.style.transition = "width ".concat(b, "ms linear"), a.style.width = '100%';
      });
    });
  }
  function U() {
    xa > 0 && (clearTimeout(xa), xa = undefined, u());
  }
  function V() {
    N("next");
  }
  function W() {
    N("prev");
  }
  function X() {
    return va * (la.items > 0 ? la.items : 1);
  }
  function Y() {
    return ea("[".concat(ia.slide, "].active"));
  }
  function Z() {
    return va;
  }
  function $() {
    return ra.length;
  }
  function _(a) {
    return la.vertical ? a.getBoundingClientRect().top - qa.getBoundingClientRect().top : a.getBoundingClientRect().left - qa.getBoundingClientRect().left;
  }
  function aa() {
    return wa;
  }
  function ba() {
    return ra[0].style;
  }
  function ca() {
    var a = fa("tr"),
      b = {
        transition: "transitionend",
        MozTransition: "transitionend",
        WebkitTransition: "webkitTransitionEnd"
      };
    for (var c in b) if (a.style[c] !== undefined) return b[c];
  }
  function da() {
    return new Object({
      created: Ha !== undefined,
      currentPage: va,
      totalPages: wa,
      totalSlides: ra.length,
      activeSlides: _toConsumableArray(ua),
      config: _objectSpread({}, la),
      currentTranslate: Ga
    });
  }
  function ea(a, b) {
    var c = "".concat(Ja, " ").concat(a);
    return b ? document.querySelectorAll(c) : document.querySelector(c);
  }
  function fa(a) {
    return document.createElement(a);
  }
  var ga = "ddcarousel",
    ha = {
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
      prog: "ddcarousel-progress",
      progb: "ddcarousel-progress-bar",
      fullW: "full-width",
      disable: "disabled"
    },
    ia = {
      slide: "data-slide",
      id: "data-id",
      title: "data-title",
      lazyImg: "data-src"
    },
    ja = ["onInitialize", "onInitialized", "onDrag", "onDragging", "onDragged", "onChanged", "onTransitionend", "onResized", "onDestroy", "onDestroyed"],
    ka = document.all && window.atob;
  var la,
    ma,
    na,
    oa,
    pa,
    qa,
    ra,
    sa,
    ta,
    ua,
    va,
    wa,
    xa,
    ya,
    za,
    Aa,
    Ba,
    Ca,
    Da,
    Ea,
    Fa,
    Ga,
    Ha,
    Ia,
    Ja,
    Ka,
    La,
    Ma,
    Na = ["mouseover", "touchstart"],
    Oa = ["mouseleave", "touchend"],
    Pa = ["touchstart", "mousedown"],
    Qa = ["touchmove", "mousemove"],
    Ra = ["touchend", "mouseup"];
  return c(a), {
    prevPage: W,
    nextPage: V,
    changePage: N,
    refresh: D,
    on: h,
    goToUrl: O,
    autoplayStart: S,
    autoplayStop: U,
    getCurrentPage: Z,
    getTotalPages: aa,
    getTotalSlides: $,
    getStatus: da,
    destroy: l,
    init: c
  };
};
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
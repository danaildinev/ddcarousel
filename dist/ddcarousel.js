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
    return Ia ? (console.error("".concat(ha, ": Already created!")), !1) : a != null && void (pa = {
      container: "." + ha,
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
      autoplayPauseOnTabHidden: !0,
      touchDrag: !0,
      mouseDrag: !0,
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
    }, wa = 0, xa = 0, va = [], na = {}, na = a === undefined ? pa : a, d(), f(ma.container) && (Ja = document.querySelector(ma.container).className, j("onInitialize", {
      container: qa,
      event: "onInitialize"
    }), k() !== !1 && (p(), r(), s(), t(), Q(), N(ma.startPage > 0 ? ma.startPage : 0, !1), D(), x(), j("onInitialized"), Ia = !0)), ma.autoplayPauseOnTabHidden && document.addEventListener("visibilitychange", function () {
      document.hidden ? U() : S();
    }));
  }
  function d() {
    var a = this;
    ma = [], oa = [], ka.forEach(function (b) {
      pa[b] = function () {}, h(b, function (c) {
        ma[b].call(a, c == null ? g(b) : c);
      });
    }), na['responsive'] !== undefined && (oa = na['responsive']), ma = pa, e(na);
  }
  function e(a) {
    for (var b in a) ma[b] = a[b];
    ma.items == 0 && (ma.itemPerPage = !1);
  }
  function f(a) {
    var b = document.querySelector(a);
    return b == null ? (console.error("".concat(ha, ": Invalid container!")), !1) : (qa = b, Ka = a, !0);
  }
  function g(a) {
    return ma.callbacks ? new Object({
      container: qa,
      event: a,
      currentSlides: va,
      currentPage: wa,
      totalSlides: _(),
      totalPages: xa
    }) : undefined;
  }
  function h(a, b) {
    !ka[a] && (ka[a] = []), ka[a].push(b);
  }
  function j(a, b) {
    if (ka[a]) for (var c in ka[a]) ka[a][c](b);
  }
  function k() {
    var a = ga("div"),
      b = ga("div");
    if (ta = fa("> div", !0), a.classList.add(ia.cont), b.classList.add(ia.stage), qa.appendChild(a), a.appendChild(b), ra = fa(".".concat(ia.stage)), ta.length == 0) return console.error("".concat(ha, ": No content found in container. Destroying carousel...")), l(), !1;
    for (var c = 0; c < ta.length; c++) {
      var d = ga("div");
      d.classList.add(ia.item), d.setAttribute(ja.slide, c), d.appendChild(ta[c]), ma.urlNav && ta[c].hasAttribute(ja.id) && ta[c].hasAttribute(ja.title) && (d.setAttribute(ja.id, ta[c].getAttribute(ja.id)), d.setAttribute(ja.title, ta[c].getAttribute(ja.title))), b.appendChild(d);
    }
    sa = fa(".".concat(ia.item), !0), m();
  }
  function l(a) {
    j("onDestroy");
    var b = document.querySelector(ma.container);
    if (!a) {
      var c = fa(".".concat(ia.item), !0);
      c.forEach(function (a) {
        b.appendChild(a.firstChild);
      });
    }
    var d = fa(".".concat(ia.cont));
    return d && d.remove(), o() && fa(".".concat(ia.nav)).remove(), q() && fa(".".concat(ia.dots)).remove(), ma.urlNav && fa(".".concat(ia.url)) && fa(".".concat(ia.url)).remove(), ya && U(), y(), b.className = Ja, wa = 0, xa = 0, sa = [], va = [], ta = [], Ia = !1, j("onDestroyed"), ka.forEach(function (a) {
      ka[a] = [];
    }), !0;
  }
  function m() {
    var a,
      b,
      c = sa[0].style.width,
      d = window.getComputedStyle(qa),
      e = qa.classList;
    ma.fullWidth && !ma.verticalMaxContentWidth ? e.add(ia.fullW) : e.remove(ia.fullW), ma.vertical ? e.add(ia.vert) : e.remove(ia.vert), a = parseInt(d.width), b = parseInt(d.height), sa.length <= ma.items && (ma.items = sa.length), xa = ma.centerSlide ? sa.length - 1 : ma.itemPerPage ? sa.length - ma.items : Math.ceil(sa.length / ma.items) - 1, xa = xa, ua = [];
    var f = 0;
    for (var g = 0; g < sa.length; g++) {
      if (ma.items != 0) ma.vertical ? sa[g].style.height = b / ma.items + "px" : !ma.vertical && (sa[g].style.width = a / ma.items + "px");else {
        var h = sa[g].getBoundingClientRect();
        sa[g].style.width = h.width + "px", f += h;
      }
      ua.push(n(fa("[".concat(ja.slide, "=\"").concat(g, "\"] > div"))));
    }
    if (!ma.vertical && (ra.style.width = ma.items == 0 ? f + "px" : a * sa.length + "px"), ma.verticalMaxContentWidth) {
      var k,
        l = 0;
      ta.forEach(function (a) {
        k = a.getBoundingClientRect().width, k > l && (l = k);
      }), qa.style.width = l + "px";
    }
    ma.autoHeight && (Q(), M(wa)), ma.mouseDrag ? ra.classList.add(ia.disable) : ra.classList.remove(ia.disable), c != sa[0].style.width && j("onResized");
  }
  function n(a) {
    var b = a.offsetHeight,
      c = getComputedStyle(a);
    return b += parseInt(c.marginTop) + parseInt(c.marginBottom), b;
  }
  function o() {
    return ma.nav && xa > 0;
  }
  function p() {
    var a = fa(".".concat(ia.nav));
    if (o()) {
      var b = ga("div"),
        c = ga("button"),
        d = ga("button");
      a && a.remove(), b.classList.add(ia.nav), c.classList.add(ia.prev), c.innerHTML = ma.labelNavPrev, d.classList.add(ia.next), d.innerHTML = ma.labelNavNext, b.appendChild(c), b.appendChild(d), qa.appendChild(b), La = fa(".".concat(ia.prev)), Ma = fa(".".concat(ia.next)), La.addEventListener("click", function () {
        return X();
      }), Ma.addEventListener("click", function () {
        return W();
      });
    } else a != null && a.remove();
  }
  function q() {
    return ma.dots && xa > 0;
  }
  function r() {
    var a = fa(".".concat(ia.dots));
    if (q()) {
      var b,
        c = ga("div");
      a && a.remove(), c.classList.add(ia.dots), b = ma.items > 1 ? ma.centerSlide ? sa.length : xa + 1 : sa.length;
      for (var d = 0; d < b; d++) {
        var e = ga("button");
        e.classList.add(ia.dot), e.setAttribute(ja.slide, d), e.addEventListener("click", function (a) {
          return N(parseInt(a.target.getAttribute(ja.slide)));
        }), c.appendChild(e);
      }
      qa.appendChild(c);
    } else a != null && a.remove();
  }
  function s() {
    var a = fa(".".concat(ia.url));
    if (ma.urlNav) {
      var b = ga("div"),
        c = ga("ul");
      a && a.remove(), b.classList.add(ia.url), sa.forEach(function (b) {
        if (b.hasAttribute(ja.id) && b.hasAttribute(ja.title)) {
          var d = ga('li'),
            e = ga('a');
          e.href = "#" + b.getAttribute(ja.id), e.innerHTML = b.getAttribute(ja.title), d.appendChild(e), c.appendChild(d);
        }
      }), b.appendChild(c), qa.appendChild(b), fa(".".concat(ia.url, " a"), !0).forEach(function (a) {
        a.addEventListener("click", function (b) {
          O(a.getAttribute('href').substring(1));
        });
      });
    } else a != null && a.remove();
  }
  function t() {
    if (ma.autoplay && (u(), ma.autoplayProgress)) {
      var a = ga("div"),
        b = ga("div");
      a.classList.add(ia.prog), b.classList.add(ia.progb), a.appendChild(b), qa.appendChild(a);
    }
  }
  function u() {
    var a = fa(".".concat(ia.prog));
    a && a.remove();
  }
  function v() {
    if (ma.lazyLoad) {
      if (ma.lazyPreload) {
        var a = va[va.length - 1];
        for (var b = a + 1; b <= a + ma.lazyPreloadSlides; b++) b < sa.length && va.indexOf(b) == -1 && va.push(b);
      }
      va.forEach(function (a) {
        var b = fa("[".concat(ja.slide, "=\"").concat(a, "\"] img[data-src]"), !0);
        b.forEach(function (a) {
          return w(a);
        });
      });
    }
  }
  function w(a) {
    a && a.getAttribute(ja.lazyImg) && !a.src && (a.src = a.getAttribute(ja.lazyImg), a.removeAttribute(ja.lazyImg));
  }
  function x() {
    za = la ? ra : window, Qa.forEach(function (a) {
      return za.addEventListener(a, G, {
        passive: !0
      });
    }), Ra.forEach(function (a) {
      return window.addEventListener(a, E, {
        passive: !0
      });
    }), Sa.forEach(function (a) {
      return window.addEventListener(a, H);
    }), window.addEventListener("resize", C), ra.addEventListener(da(), B), ma.autoplayPauseHover && ma.autoplay ? z() : A(), ma.keyboardNavigation && window.addEventListener("keydown", I);
  }
  function y() {
    za = la ? ra : window, Qa.forEach(function (a) {
      return za.removeEventListener(a, G, {
        passive: !0
      });
    }), Ra.forEach(function (a) {
      return window.removeEventListener(a, E, {
        passive: !0
      });
    }), Sa.forEach(function (a) {
      return window.removeEventListener(a, H);
    }), window.removeEventListener("resize", C), ra.removeEventListener(da(), B), A(), ma.keyboardNavigation && window.removeEventListener("keydown", I);
  }
  function z() {
    Oa.forEach(function (a) {
      return ra.addEventListener(a, U);
    }), Pa.forEach(function (a) {
      return ra.addEventListener(a, S);
    });
  }
  function A() {
    Oa.forEach(function (a) {
      return ra.removeEventListener(a, U);
    }), Pa.forEach(function (a) {
      return ra.removeEventListener(a, S);
    });
  }
  function B() {
    j("onTransitionend");
  }
  function C() {
    m(), !Na && (D(), Na = !0, setTimeout(function () {
      Na = !1;
    }, ma.resizeRefresh));
  }
  function D() {
    var a = Object.keys(oa);
    for (var b = a.length - 1; b >= 0; b--) document.body.clientWidth < a[b] ? e(Object.values(oa)[b]) : document.body.clientWidth >= a[a.length - 1] && d();
    m(), p(), r(), t(), R(), Q(), s(), U(), ma.autoplay && ya == null && S(), P(), J();
  }
  function E(a) {
    if (Da) {
      var b = F(a, "mousemove", "touchmove");
      ra.style.transitionDuration = ma.swipeSmooth + "s", Ea = Math.abs(b - Aa), Ca = b - Ba, Ea <= ma.touchMaxSlideDist ? (j("onDragging"), L(Ca)) : (Ga = !0, Ca = b - Ba);
    }
  }
  function F(a, b, c) {
    return a.type == b && ma.mouseDrag ? ma.vertical ? a.clientY : a.pageX : a.type == c && ma.touchDrag ? ma.vertical ? a.targetTouches[0].pageY : a.targetTouches[0].pageX : void 0;
  }
  function G(a) {
    if (la || a.target == ra) {
      var b = F(a, "mousedown", "touchStartCords");
      b !== undefined && (Da = !0, Aa = b, Ba = Aa + -Ha, Fa = Ha, Ga = !1, j("onDrag"));
    }
  }
  function H() {
    Da && (j("onDragged"), Ea >= ma.touchSwipeThreshold && !Ga ? Ca > Fa ? X() : W() : L(Fa), ra.style.transitionDuration = ma.slideChangeDuration + "s", Da = !1);
  }
  function I(a) {
    if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') switch (a.key) {
      case "ArrowLeft":
      case "ArrowUp":
        X(), a.preventDefault();
        break;
      case "ArrowRight":
      case "ArrowDown":
        W(), a.preventDefault();
    }
  }
  function J() {
    if (o()) {
      var a = "inactive";
      wa == 0 ? (La.classList.add(a), Ma.classList.remove(a)) : wa == xa ? (La.classList.remove(a), Ma.classList.add(a)) : (La.classList.remove(a), Ma.classList.remove(a));
    }
  }
  function K(a) {
    Ha = -aa(a), L(Ha);
  }
  function L(a) {
    var b = ma.vertical ? "translateY(".concat(a, "px)") : "translateX(".concat(a, "px)");
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ? ra.style.webkitTransform = b : ra.style.transform = b;
  }
  function M() {
    if (ma.items == 1) qa.style.height = ua[wa] + "px";else {
      var a = [];
      for (var b = va[0]; b <= va[va.length - 1]; b++) a.push(ua[b]);
      qa.style.height = Math.max.apply(Math, a) + "px";
    }
  }
  function N(a) {
    var b = !(arguments.length > 1 && arguments[1] !== undefined) || arguments[1];
    var c = wa;
    b ? ra.style.transitionDuration = ma.slideChangeDuration + "s" : (ra.style.transitionDuration = "0s", ra.addEventListener(da(), function () {
      ra.style.transitionDuration = ma.slideChangeDuration + "0s";
    })), a == "prev" ? wa != 0 && wa-- : a == "next" ? wa < xa && wa++ : Number.isInteger(a) && a > -1 && a <= xa && (wa = a), Q(), R(), P(), J(), V(), ma.autoHeight && M(Z()), c != wa && j("onChanged");
  }
  function O(a) {
    var b = !(arguments.length > 1 && arguments[1] !== undefined) || arguments[1];
    var c = fa(".".concat(ia.item, "[").concat(ja.id, "=\"").concat(a, "\"]"));
    N(parseInt(c.getAttribute(ja.slide)), b);
  }
  function P() {
    if (ma.centerSlide && ma.items > 0) {
      var a = -aa(Z()) - -(parseInt(ca().width) * Math.floor(ma.items / 2));
      Ha = a, L(a);
    } else K(Z());
  }
  function Q() {
    if (va != null && va.forEach(function (a) {
      fa("[".concat(ja.slide, "=\"").concat(a, "\"]")).classList.remove("active");
    }), va = [], ma.centerSlide) va.push(wa);else if (ma.itemPerPage) for (var a = wa; a < wa + ma.items; a++) va.push(a);else if (Y() + ma.items > _()) for (var a = sa.length - ma.items; a < _(); a++) va.push(a);else if (ma.items == 0) va.push(Y());else for (var a = Y(); a < Y() + ma.items; a++) a < sa.length && va.push(a);
    va.forEach(function (a) {
      fa("[".concat(ja.slide, "=\"").concat(a, "\"]")).classList.add("active");
    }), v();
  }
  function R() {
    var b = "active";
    if (q()) {
      var c = fa(".".concat(ia.dot, "[").concat(ja.slide, "].") + b);
      c != null && c.classList.remove(b), fa(".".concat(ia.dot, "[").concat(ja.slide, "=\"").concat(wa, "\"]")).classList.add(b);
    }
  }
  function S() {
    !ma.autoplay || ya != null || wa == xa || (T(), ya = setInterval(function () {
      W(), T(), wa == xa && (clearInterval(ya), ya = undefined, u());
    }, ma.autoplaySpeed));
  }
  function T() {
    var a = fa(".".concat(ia.progb));
    if (!a && (t(), a = fa(".".concat(ia.progb))), !!a) {
      var b = ma.autoplaySpeed;
      a.style.transition = 'none', a.style.width = '0%', requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          a.style.transition = "width ".concat(b, "ms linear"), a.style.width = '100%';
        });
      });
    }
  }
  function U() {
    ya != null && (clearInterval(ya), ya = undefined, u());
  }
  function V() {
    U(), S();
  }
  function W() {
    N("next");
  }
  function X() {
    N("prev");
  }
  function Y() {
    return wa * (ma.items > 0 ? ma.items : 1);
  }
  function Z() {
    return fa("[".concat(ja.slide, "].active"));
  }
  function $() {
    return wa;
  }
  function _() {
    return sa.length;
  }
  function aa(a) {
    return ma.vertical ? a.getBoundingClientRect().top - ra.getBoundingClientRect().top : a.getBoundingClientRect().left - ra.getBoundingClientRect().left;
  }
  function ba() {
    return xa;
  }
  function ca() {
    return sa[0].style;
  }
  function da() {
    var a = ga("tr"),
      b = {
        transition: "transitionend",
        MozTransition: "transitionend",
        WebkitTransition: "webkitTransitionEnd"
      };
    for (var c in b) if (a.style[c] !== undefined) return b[c];
  }
  function ea() {
    return new Object({
      created: Ia !== undefined,
      currentPage: wa,
      totalPages: xa,
      totalSlides: sa.length,
      activeSlides: _toConsumableArray(va),
      config: _objectSpread({}, ma),
      currentTranslate: Ha
    });
  }
  function fa(a, b) {
    var c = "".concat(Ka, " ").concat(a);
    return b ? document.querySelectorAll(c) : document.querySelector(c);
  }
  function ga(a) {
    return document.createElement(a);
  }
  var ha = "ddcarousel",
    ia = {
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
    ja = {
      slide: "data-slide",
      id: "data-id",
      title: "data-title",
      lazyImg: "data-src"
    },
    ka = ["onInitialize", "onInitialized", "onDrag", "onDragging", "onDragged", "onChanged", "onTransitionend", "onResized", "onDestroy", "onDestroyed"],
    la = document.all && window.atob;
  var ma,
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
    Na,
    Oa = ["mouseenter", "touchstart"],
    Pa = ["mouseleave", "touchend"],
    Qa = ["touchstart", "mousedown"],
    Ra = ["touchmove", "mousemove"],
    Sa = ["touchend", "mouseup"];
  return c(a), {
    prevPage: X,
    nextPage: W,
    changePage: N,
    refresh: D,
    on: h,
    goToUrl: O,
    autoplayStart: S,
    autoplayStop: U,
    getCurrentPage: $,
    getTotalPages: ba,
    getTotalSlides: _,
    getStatus: ea,
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
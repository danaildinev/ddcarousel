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
    return Ea ? (console.error("".concat(da, ": Already created!")), !1) : a != null && void (la = {
      container: "." + da,
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
      autoplaySpeed: 1000,
      autoplayPauseHover: !1,
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
    }, sa = 0, ta = 0, ra = [], ja = {}, ja = a === undefined ? la : a, d(), f(ia.container) && (Fa = document.querySelector(ia.container).className, j("onInitialize", {
      container: ma,
      event: "onInitialize"
    }), k() !== !1 && (p(), r(), s(), O(), L(ia.startPage > 0 ? ia.startPage : 0, !1), B(), v(), j("onInitialized"), Ea = !0)));
  }
  function d() {
    var a = this;
    ia = [], ka = [], ga.forEach(function (b) {
      la[b] = function () {}, h(b, function (c) {
        ia[b].call(a, c == null ? g(b) : c);
      });
    }), ja['responsive'] !== undefined && (ka = ja['responsive']), ia = la, e(ja);
  }
  function e(a) {
    for (var b in a) ia[b] = a[b];
    ia.items == 0 && (ia.itemPerPage = !1);
  }
  function f(a) {
    var b = document.querySelector(a);
    return b == null ? (console.error("".concat(da, ": Invalid container!")), !1) : (ma = b, Ga = a, !0);
  }
  function g(a) {
    return ia.callbacks ? new Object({
      container: ma,
      event: a,
      currentSlides: ra,
      currentPage: sa,
      totalSlides: X(),
      totalPages: ta
    }) : undefined;
  }
  function h(a, b) {
    !ga[a] && (ga[a] = []), ga[a].push(b);
  }
  function j(a, b) {
    if (ga[a]) for (var c in ga[a]) ga[a][c](b);
  }
  function k() {
    var a = ca("div"),
      b = ca("div");
    if (pa = ba("> div", !0), a.classList.add(ea.cont), b.classList.add(ea.stage), ma.appendChild(a), a.appendChild(b), na = ba(".".concat(ea.stage)), pa.length == 0) return console.error("".concat(da, ": No content found in container. Destroying carousel...")), l(), !1;
    for (var c = 0; c < pa.length; c++) {
      var d = ca("div");
      d.classList.add(ea.item), d.setAttribute(fa.slide, c), d.appendChild(pa[c]), ia.urlNav && pa[c].hasAttribute(fa.id) && pa[c].hasAttribute(fa.title) && (d.setAttribute(fa.id, pa[c].getAttribute(fa.id)), d.setAttribute(fa.title, pa[c].getAttribute(fa.title))), b.appendChild(d);
    }
    oa = ba(".".concat(ea.item), !0), m();
  }
  function l(a) {
    j("onDestroy");
    var b = document.querySelector(ia.container);
    if (!a) {
      var c = ba(".".concat(ea.item), !0);
      c.forEach(function (a) {
        b.appendChild(a.firstChild);
      });
    }
    var d = ba(".".concat(ea.cont));
    return d && d.remove(), o() && ba(".".concat(ea.nav)).remove(), q() && ba(".".concat(ea.dots)).remove(), ia.urlNav && ba(".".concat(ea.url)) && ba(".".concat(ea.url)).remove(), ua && R(), w(), b.className = Fa, sa = 0, ta = 0, oa = [], ra = [], pa = [], Ea = !1, j("onDestroyed"), ga.forEach(function (a) {
      ga[a] = [];
    }), !0;
  }
  function m() {
    var a,
      b,
      c = oa[0].style.width,
      d = window.getComputedStyle(ma),
      e = ma.classList;
    ia.fullWidth && !ia.verticalMaxContentWidth ? e.add(ea.fullW) : e.remove(ea.fullW), ia.vertical ? e.add(ea.vert) : e.remove(ea.vert), a = parseInt(d.width), b = parseInt(d.height), oa.length <= ia.items && (ia.items = oa.length), ta = ia.centerSlide ? oa.length - 1 : ia.itemPerPage ? oa.length - ia.items : Math.ceil(oa.length / ia.items) - 1, ta = ta, qa = [];
    var f = 0;
    for (var g = 0; g < oa.length; g++) {
      if (ia.items != 0) ia.vertical ? oa[g].style.height = b / ia.items + "px" : !ia.vertical && (oa[g].style.width = a / ia.items + "px");else {
        var h = oa[g].getBoundingClientRect();
        oa[g].style.width = h.width + "px", f += h;
      }
      qa.push(n(ba("[".concat(fa.slide, "=\"").concat(g, "\"] > div"))));
    }
    if (!ia.vertical && (na.style.width = ia.items == 0 ? f + "px" : a * oa.length + "px"), ia.verticalMaxContentWidth) {
      var k,
        l = 0;
      pa.forEach(function (a) {
        k = a.getBoundingClientRect().width, k > l && (l = k);
      }), ma.style.width = l + "px";
    }
    ia.autoHeight && (O(), K(sa)), ia.mouseDrag ? na.classList.add(ea.disable) : na.classList.remove(ea.disable), c != oa[0].style.width && j("onResized");
  }
  function n(a) {
    var b = a.offsetHeight,
      c = getComputedStyle(a);
    return b += parseInt(c.marginTop) + parseInt(c.marginBottom), b;
  }
  function o() {
    return ia.nav && ta > 0;
  }
  function p() {
    var a = ba(".".concat(ea.nav));
    if (o()) {
      var b = ca("div"),
        c = ca("button"),
        d = ca("button");
      a && a.remove(), b.classList.add(ea.nav), c.classList.add(ea.prev), c.innerHTML = ia.labelNavPrev, d.classList.add(ea.next), d.innerHTML = ia.labelNavNext, b.appendChild(c), b.appendChild(d), ma.appendChild(b), Ha = ba(".".concat(ea.prev)), Ia = ba(".".concat(ea.next)), Ha.addEventListener("click", function () {
        return T();
      }), Ia.addEventListener("click", function () {
        return S();
      });
    } else a != null && a.remove();
  }
  function q() {
    return ia.dots && ta > 0;
  }
  function r() {
    var a = ba(".".concat(ea.dots));
    if (q()) {
      var b,
        c = ca("div");
      a && a.remove(), c.classList.add(ea.dots), b = ia.items > 1 ? ia.centerSlide ? oa.length : ta + 1 : oa.length;
      for (var d = 0; d < b; d++) {
        var e = ca("button");
        e.classList.add(ea.dot), e.setAttribute(fa.slide, d), e.addEventListener("click", function (a) {
          return L(parseInt(a.target.getAttribute(fa.slide)));
        }), c.appendChild(e);
      }
      ma.appendChild(c);
    } else a != null && a.remove();
  }
  function s() {
    var a = ba(".".concat(ea.url));
    if (ia.urlNav) {
      var b = ca("div"),
        c = ca("ul");
      a && a.remove(), b.classList.add(ea.url), oa.forEach(function (b) {
        if (b.hasAttribute(fa.id) && b.hasAttribute(fa.title)) {
          var d = ca('li'),
            e = ca('a');
          e.href = "#" + b.getAttribute(fa.id), e.innerHTML = b.getAttribute(fa.title), d.appendChild(e), c.appendChild(d);
        }
      }), b.appendChild(c), ma.appendChild(b), ba(".".concat(ea.url, " a"), !0).forEach(function (a) {
        a.addEventListener("click", function (b) {
          M(a.getAttribute('href').substring(1));
        });
      });
    } else a != null && a.remove();
  }
  function t() {
    if (ia.lazyLoad) {
      if (ia.lazyPreload) {
        var a = ra[ra.length - 1];
        for (var b = a + 1; b <= a + ia.lazyPreloadSlides; b++) b < oa.length && ra.indexOf(b) == -1 && ra.push(b);
      }
      ra.forEach(function (a) {
        var b = ba("[".concat(fa.slide, "=\"").concat(a, "\"] img[data-src]"), !0);
        b.forEach(function (a) {
          return u(a);
        });
      });
    }
  }
  function u(a) {
    a && a.getAttribute(fa.lazyImg) && !a.src && (a.src = a.getAttribute(fa.lazyImg), a.removeAttribute(fa.lazyImg));
  }
  function v() {
    va = ha ? na : window, Ma.forEach(function (a) {
      return va.addEventListener(a, E, {
        passive: !0
      });
    }), Na.forEach(function (a) {
      return window.addEventListener(a, C, {
        passive: !0
      });
    }), Oa.forEach(function (a) {
      return window.addEventListener(a, F);
    }), window.addEventListener("resize", A), na.addEventListener(_(), z), ia.autoplayPauseHover && ia.autoplay ? x() : y(), ia.keyboardNavigation && window.addEventListener("keydown", G);
  }
  function w() {
    va = ha ? na : window, Ma.forEach(function (a) {
      return va.removeEventListener(a, E, {
        passive: !0
      });
    }), Na.forEach(function (a) {
      return window.removeEventListener(a, C, {
        passive: !0
      });
    }), Oa.forEach(function (a) {
      return window.removeEventListener(a, F);
    }), window.removeEventListener("resize", A), na.removeEventListener(_(), z), y(), ia.keyboardNavigation && window.removeEventListener("keydown", G);
  }
  function x() {
    Ka.forEach(function (a) {
      return na.addEventListener(a, R);
    }), La.forEach(function (a) {
      return na.addEventListener(a, Q);
    });
  }
  function y() {
    Ka.forEach(function (a) {
      return na.removeEventListener(a, R);
    }), La.forEach(function (a) {
      return na.removeEventListener(a, Q);
    });
  }
  function z() {
    j("onTransitionend");
  }
  function A() {
    m(), !Ja && (B(), Ja = !0, setTimeout(function () {
      Ja = !1;
    }, ia.resizeRefresh));
  }
  function B() {
    var a = Object.keys(ka);
    for (var b = a.length - 1; b >= 0; b--) document.body.clientWidth < a[b] ? e(Object.values(ka)[b]) : document.body.clientWidth >= a[a.length - 1] && d();
    m(), p(), r(), P(), O(), s(), R(), ia.autoplay && ua == null && Q(), N(), H();
  }
  function C(a) {
    if (za) {
      var b = D(a, "mousemove", "touchmove");
      na.style.transitionDuration = ia.swipeSmooth + "s", Aa = Math.abs(b - wa), ya = b - xa, Aa <= ia.touchMaxSlideDist ? (j("onDragging"), J(ya)) : (Ca = !0, ya = b - xa);
    }
  }
  function D(a, b, c) {
    return a.type == b && ia.mouseDrag ? ia.vertical ? a.clientY : a.pageX : a.type == c && ia.touchDrag ? ia.vertical ? a.targetTouches[0].pageY : a.targetTouches[0].pageX : void 0;
  }
  function E(a) {
    if (ha || a.target == na) {
      var b = D(a, "mousedown", "touchStartCords");
      b !== undefined && (za = !0, wa = b, xa = wa + -Da, Ba = Da, Ca = !1, j("onDrag"));
    }
  }
  function F() {
    za && (j("onDragged"), Aa >= ia.touchSwipeThreshold && !Ca ? ya > Ba ? T() : S() : J(Ba), na.style.transitionDuration = ia.slideChangeDuration + "s", za = !1);
  }
  function G(a) {
    if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') switch (a.key) {
      case "ArrowLeft":
      case "ArrowUp":
        T(), a.preventDefault();
        break;
      case "ArrowRight":
      case "ArrowDown":
        S(), a.preventDefault();
    }
  }
  function H() {
    if (o()) {
      var a = "inactive";
      sa == 0 ? (Ha.classList.add(a), Ia.classList.remove(a)) : sa == ta ? (Ha.classList.remove(a), Ia.classList.add(a)) : (Ha.classList.remove(a), Ia.classList.remove(a));
    }
  }
  function I(a) {
    Da = -Y(a), J(Da);
  }
  function J(a) {
    var b = ia.vertical ? "translateY(".concat(a, "px)") : "translateX(".concat(a, "px)");
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ? na.style.webkitTransform = b : na.style.transform = b;
  }
  function K() {
    if (ia.items == 1) ma.style.height = qa[sa] + "px";else {
      var a = [];
      for (var b = ra[0]; b <= ra[ra.length - 1]; b++) a.push(qa[b]);
      ma.style.height = Math.max.apply(Math, a) + "px";
    }
  }
  function L(a) {
    var b = !(arguments.length > 1 && arguments[1] !== undefined) || arguments[1];
    var c = sa;
    b ? na.style.transitionDuration = ia.slideChangeDuration + "s" : (na.style.transitionDuration = "0s", na.addEventListener(_(), function () {
      na.style.transitionDuration = ia.slideChangeDuration + "0s";
    })), a == "prev" ? sa != 0 && sa-- : a == "next" ? sa < ta && sa++ : Number.isInteger(a) && a > -1 && a <= ta && (sa = a), O(), P(), N(), H(), ia.autoHeight && K(V()), c != sa && j("onChanged");
  }
  function M(a) {
    var b = !(arguments.length > 1 && arguments[1] !== undefined) || arguments[1];
    var c = ba(".".concat(ea.item, "[").concat(fa.id, "=\"").concat(a, "\"]"));
    L(parseInt(c.getAttribute(fa.slide)), b);
  }
  function N() {
    if (ia.centerSlide && ia.items > 0) {
      var a = -Y(V()) - -(parseInt($().width) * Math.floor(ia.items / 2));
      Da = a, J(a);
    } else I(V());
  }
  function O() {
    if (ra != null && ra.forEach(function (a) {
      ba("[".concat(fa.slide, "=\"").concat(a, "\"]")).classList.remove("active");
    }), ra = [], ia.centerSlide) ra.push(sa);else if (ia.itemPerPage) for (var a = sa; a < sa + ia.items; a++) ra.push(a);else if (U() + ia.items > X()) for (var a = oa.length - ia.items; a < X(); a++) ra.push(a);else if (ia.items == 0) ra.push(U());else for (var a = U(); a < U() + ia.items; a++) a < oa.length && ra.push(a);
    ra.forEach(function (a) {
      ba("[".concat(fa.slide, "=\"").concat(a, "\"]")).classList.add("active");
    }), t();
  }
  function P() {
    var b = "active";
    if (q()) {
      var c = ba(".".concat(ea.dot, "[").concat(fa.slide, "].") + b);
      c != null && c.classList.remove(b), ba(".".concat(ea.dot, "[").concat(fa.slide, "=\"").concat(sa, "\"]")).classList.add(b);
    }
  }
  function Q() {
    ua == null && (ua = setInterval(function () {
      return S();
    }, ia.autoplaySpeed));
  }
  function R() {
    ua > 0 && (clearTimeout(ua), ua = undefined);
  }
  function S() {
    L("next");
  }
  function T() {
    L("prev");
  }
  function U() {
    return sa * (ia.items > 0 ? ia.items : 1);
  }
  function V() {
    return ba("[".concat(fa.slide, "].active"));
  }
  function W() {
    return sa;
  }
  function X() {
    return oa.length;
  }
  function Y(a) {
    return ia.vertical ? a.getBoundingClientRect().top - na.getBoundingClientRect().top : a.getBoundingClientRect().left - na.getBoundingClientRect().left;
  }
  function Z() {
    return ta;
  }
  function $() {
    return oa[0].style;
  }
  function _() {
    var a = ca("tr"),
      b = {
        transition: "transitionend",
        MozTransition: "transitionend",
        WebkitTransition: "webkitTransitionEnd"
      };
    for (var c in b) if (a.style[c] !== undefined) return b[c];
  }
  function aa() {
    return new Object({
      created: Ea !== undefined,
      currentPage: sa,
      totalPages: ta,
      totalSlides: oa.length,
      activeSlides: _toConsumableArray(ra),
      config: _objectSpread({}, ia),
      currentTranslate: Da
    });
  }
  function ba(a, b) {
    var c = "".concat(Ga, " ").concat(a);
    return b ? document.querySelectorAll(c) : document.querySelector(c);
  }
  function ca(a) {
    return document.createElement(a);
  }
  var da = "ddcarousel",
    ea = {
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
    fa = {
      slide: "data-slide",
      id: "data-id",
      title: "data-title",
      lazyImg: "data-src"
    },
    ga = ["onInitialize", "onInitialized", "onDrag", "onDragging", "onDragged", "onChanged", "onTransitionend", "onResized", "onDestroy", "onDestroyed"],
    ha = document.all && window.atob;
  var ia,
    ja,
    ka,
    la,
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
    Ka = ["mouseover", "touchstart"],
    La = ["mouseleave", "touchend"],
    Ma = ["touchstart", "mousedown"],
    Na = ["touchmove", "mousemove"],
    Oa = ["touchend", "mouseup"];
  return c(a), {
    prevPage: T,
    nextPage: S,
    changePage: L,
    refresh: B,
    on: h,
    goToUrl: M,
    autoplayStart: Q,
    autoplayStop: R,
    getCurrentPage: W,
    getTotalPages: Z,
    getTotalSlides: X,
    getStatus: aa,
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
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
    return Da ? (console.error("".concat(ca, ": Already created!")), !1) : a != null && void (ka = {
      container: "." + ca,
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
      centerSlide: !1,
      touchSwipeThreshold: 60,
      touchMaxSlideDist: 500,
      resizeRefresh: 200,
      swipeSmooth: 0,
      slideChangeDuration: 0.5,
      callbacks: !1,
      labelNavPrev: "&#x2190;",
      labelNavNext: "&#x2192;"
    }, ra = 0, sa = 0, qa = [], ia = {}, ia = a === undefined ? ka : a, d(), f(ha.container) && (Ea = document.querySelector(ha.container).className, j("onInitialize", {
      container: la,
      event: "onInitialize"
    }), k() !== !1 && (p(), r(), s(), N(), K(ha.startPage > 0 ? ha.startPage : 0, !1), B(), v(), j("onInitialized"), Da = !0)));
  }
  function d() {
    var a = this;
    ha = [], ja = [], fa.forEach(function (b) {
      ka[b] = function () {}, h(b, function (c) {
        ha[b].call(a, c == null ? g(b) : c);
      });
    }), ia['responsive'] !== undefined && (ja = ia['responsive']), ha = ka, e(ia);
  }
  function e(a) {
    for (var b in a) ha[b] = a[b];
    ha.items == 0 && (ha.itemPerPage = !1);
  }
  function f(a) {
    var b = document.querySelector(a);
    return b == null ? (console.error("".concat(ca, ": Invalid container!")), !1) : (la = b, Fa = a, !0);
  }
  function g(a) {
    return ha.callbacks ? new Object({
      container: la,
      event: a,
      currentSlides: qa,
      currentPage: ra,
      totalSlides: W(),
      totalPages: sa
    }) : undefined;
  }
  function h(a, b) {
    !fa[a] && (fa[a] = []), fa[a].push(b);
  }
  function j(a, b) {
    if (fa[a]) for (var c in fa[a]) fa[a][c](b);
  }
  function k() {
    var a = ba("div"),
      b = ba("div");
    if (oa = aa("> div", !0), a.classList.add(da.cont), b.classList.add(da.stage), la.appendChild(a), a.appendChild(b), ma = aa(".".concat(da.stage)), oa.length == 0) return console.error("".concat(ca, ": No content found in container. Destroying carousel...")), l(), !1;
    for (var c = 0; c < oa.length; c++) {
      var d = ba("div");
      d.classList.add(da.item), d.setAttribute(ea.slide, c), d.appendChild(oa[c]), ha.urlNav && oa[c].hasAttribute(ea.id) && oa[c].hasAttribute(ea.title) && (d.setAttribute(ea.id, oa[c].getAttribute(ea.id)), d.setAttribute(ea.title, oa[c].getAttribute(ea.title))), b.appendChild(d);
    }
    na = aa(".".concat(da.item), !0), m();
  }
  function l(a) {
    j("onDestroy");
    var b = document.querySelector(ha.container);
    if (!a) {
      var c = aa(".".concat(da.item), !0);
      c.forEach(function (a) {
        b.appendChild(a.firstChild);
      });
    }
    var d = aa(".".concat(da.cont));
    return d && d.remove(), o() && aa(".".concat(da.nav)).remove(), q() && aa(".".concat(da.dots)).remove(), ha.urlNav && aa(".".concat(da.url)) && aa(".".concat(da.url)).remove(), ta && Q(), w(), b.className = Ea, ra = 0, sa = 0, na = [], qa = [], oa = [], Da = !1, j("onDestroyed"), fa.forEach(function (a) {
      fa[a] = [];
    }), !0;
  }
  function m() {
    var a,
      b,
      c = na[0].style.width,
      d = window.getComputedStyle(la),
      e = la.classList;
    ha.fullWidth && !ha.verticalMaxContentWidth ? e.add(da.fullW) : e.remove(da.fullW), ha.vertical ? e.add(da.vert) : e.remove(da.vert), a = parseInt(d.width), b = parseInt(d.height), na.length <= ha.items && (ha.items = na.length), sa = ha.centerSlide ? na.length - 1 : ha.itemPerPage ? na.length - ha.items : Math.ceil(na.length / ha.items) - 1, sa = sa, pa = [];
    var f = 0;
    for (var g = 0; g < na.length; g++) {
      if (ha.items != 0) ha.vertical ? na[g].style.height = b / ha.items + "px" : !ha.vertical && (na[g].style.width = a / ha.items + "px");else {
        var h = na[g].getBoundingClientRect();
        na[g].style.width = h.width + "px", f += h;
      }
      pa.push(n(aa("[".concat(ea.slide, "=\"").concat(g, "\"] > div"))));
    }
    if (!ha.vertical && (ma.style.width = ha.items == 0 ? f + "px" : a * na.length + "px"), ha.verticalMaxContentWidth) {
      var k,
        l = 0;
      oa.forEach(function (a) {
        k = a.getBoundingClientRect().width, k > l && (l = k);
      }), la.style.width = l + "px";
    }
    ha.autoHeight && (N(), J(ra)), ha.mouseDrag ? ma.classList.add(da.disable) : ma.classList.remove(da.disable), c != na[0].style.width && j("onResized");
  }
  function n(a) {
    var b = a.offsetHeight,
      c = getComputedStyle(a);
    return b += parseInt(c.marginTop) + parseInt(c.marginBottom), b;
  }
  function o() {
    return ha.nav && sa > 0;
  }
  function p() {
    var a = aa(".".concat(da.nav));
    if (o()) {
      var b = ba("div"),
        c = ba("button"),
        d = ba("button");
      a && a.remove(), b.classList.add(da.nav), c.classList.add(da.prev), c.innerHTML = ha.labelNavPrev, d.classList.add(da.next), d.innerHTML = ha.labelNavNext, b.appendChild(c), b.appendChild(d), la.appendChild(b), Ga = aa(".".concat(da.prev)), Ha = aa(".".concat(da.next)), Ga.addEventListener("click", function () {
        return S();
      }), Ha.addEventListener("click", function () {
        return R();
      });
    } else a != null && a.remove();
  }
  function q() {
    return ha.dots && sa > 0;
  }
  function r() {
    var a = aa(".".concat(da.dots));
    if (q()) {
      var b,
        c = ba("div");
      a && a.remove(), c.classList.add(da.dots), b = ha.items > 1 ? ha.centerSlide ? na.length : sa + 1 : na.length;
      for (var d = 0; d < b; d++) {
        var e = ba("button");
        e.classList.add(da.dot), e.setAttribute(ea.slide, d), e.addEventListener("click", function (a) {
          return K(parseInt(a.target.getAttribute(ea.slide)));
        }), c.appendChild(e);
      }
      la.appendChild(c);
    } else a != null && a.remove();
  }
  function s() {
    var a = aa(".".concat(da.url));
    if (ha.urlNav) {
      var b = ba("div"),
        c = ba("ul");
      a && a.remove(), b.classList.add(da.url), na.forEach(function (b) {
        if (b.hasAttribute(ea.id) && b.hasAttribute(ea.title)) {
          var d = ba('li'),
            e = ba('a');
          e.href = "#" + b.getAttribute(ea.id), e.innerHTML = b.getAttribute(ea.title), d.appendChild(e), c.appendChild(d);
        }
      }), b.appendChild(c), la.appendChild(b), aa(".".concat(da.url, " a"), !0).forEach(function (a) {
        a.addEventListener("click", function (b) {
          L(a.getAttribute('href').substring(1));
        });
      });
    } else a != null && a.remove();
  }
  function t() {
    if (ha.lazyLoad) {
      if (ha.lazyPreload) {
        var a = qa[qa.length - 1];
        for (var b = a + 1; b <= a + ha.lazyPreloadSlides; b++) b < na.length && qa.indexOf(b) == -1 && qa.push(b);
      }
      qa.forEach(function (a) {
        var b = aa("[".concat(ea.slide, "=\"").concat(a, "\"] img[data-src]"), !0);
        b.forEach(function (a) {
          return u(a);
        });
      });
    }
  }
  function u(a) {
    a && a.getAttribute(ea.lazyImg) && !a.src && (a.src = a.getAttribute(ea.lazyImg), a.removeAttribute(ea.lazyImg));
  }
  function v() {
    ua = ga ? ma : window, La.forEach(function (a) {
      return ua.addEventListener(a, E, {
        passive: !0
      });
    }), Ma.forEach(function (a) {
      return window.addEventListener(a, C, {
        passive: !0
      });
    }), Na.forEach(function (a) {
      return window.addEventListener(a, F);
    }), window.addEventListener("resize", A), ma.addEventListener($(), z), ha.autoplayPauseHover && ha.autoplay ? x() : y();
  }
  function w() {
    ua = ga ? ma : window, La.forEach(function (a) {
      return ua.removeEventListener(a, E, {
        passive: !0
      });
    }), Ma.forEach(function (a) {
      return window.removeEventListener(a, C, {
        passive: !0
      });
    }), Na.forEach(function (a) {
      return window.removeEventListener(a, F);
    }), window.removeEventListener("resize", A), ma.removeEventListener($(), z), y();
  }
  function x() {
    Ja.forEach(function (a) {
      return ma.addEventListener(a, Q);
    }), Ka.forEach(function (a) {
      return ma.addEventListener(a, P);
    });
  }
  function y() {
    Ja.forEach(function (a) {
      return ma.removeEventListener(a, Q);
    }), Ka.forEach(function (a) {
      return ma.removeEventListener(a, P);
    });
  }
  function z() {
    j("onTransitionend");
  }
  function A() {
    m(), !Ia && (B(), Ia = !0, setTimeout(function () {
      Ia = !1;
    }, ha.resizeRefresh));
  }
  function B() {
    var a = Object.keys(ja);
    for (var b = a.length - 1; b >= 0; b--) document.body.clientWidth < a[b] ? e(Object.values(ja)[b]) : document.body.clientWidth >= a[a.length - 1] && d();
    m(), p(), r(), O(), N(), s(), Q(), ha.autoplay && ta == null && P(), M(), G();
  }
  function C(a) {
    if (ya) {
      var b = D(a, "mousemove", "touchmove");
      ma.style.transitionDuration = ha.swipeSmooth + "s", za = Math.abs(b - va), xa = b - wa, za <= ha.touchMaxSlideDist ? (j("onDragging"), I(xa)) : (Ba = !0, xa = b - wa);
    }
  }
  function D(a, b, c) {
    return a.type == b && ha.mouseDrag ? ha.vertical ? a.clientY : a.pageX : a.type == c && ha.touchDrag ? ha.vertical ? a.targetTouches[0].pageY : a.targetTouches[0].pageX : void 0;
  }
  function E(a) {
    if (ga || a.target == ma) {
      var b = D(a, "mousedown", "touchStartCords");
      b !== undefined && (ya = !0, va = b, wa = va + -Ca, Aa = Ca, Ba = !1, j("onDrag"));
    }
  }
  function F() {
    ya && (j("onDragged"), za >= ha.touchSwipeThreshold && !Ba ? xa > Aa ? S() : R() : I(Aa), ma.style.transitionDuration = ha.slideChangeDuration + "s", ya = !1);
  }
  function G() {
    if (o()) {
      var a = "inactive";
      ra == 0 ? (Ga.classList.add(a), Ha.classList.remove(a)) : ra == sa ? (Ga.classList.remove(a), Ha.classList.add(a)) : (Ga.classList.remove(a), Ha.classList.remove(a));
    }
  }
  function H(a) {
    Ca = -X(a), I(Ca);
  }
  function I(a) {
    var b = ha.vertical ? "translateY(".concat(a, "px)") : "translateX(".concat(a, "px)");
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ? ma.style.webkitTransform = b : ma.style.transform = b;
  }
  function J() {
    if (ha.items == 1) la.style.height = pa[ra] + "px";else {
      var a = [];
      for (var b = qa[0]; b <= qa[qa.length - 1]; b++) a.push(pa[b]);
      la.style.height = Math.max.apply(Math, a) + "px";
    }
  }
  function K(a) {
    var b = !(arguments.length > 1 && arguments[1] !== undefined) || arguments[1];
    var c = ra;
    b ? ma.style.transitionDuration = ha.slideChangeDuration + "s" : (ma.style.transitionDuration = "0s", ma.addEventListener($(), function () {
      ma.style.transitionDuration = ha.slideChangeDuration + "0s";
    })), a == "prev" ? ra != 0 && ra-- : a == "next" ? ra < sa && ra++ : Number.isInteger(a) && a > -1 && a <= sa && (ra = a), N(), O(), M(), G(), ha.autoHeight && J(U()), c != ra && j("onChanged");
  }
  function L(a) {
    var b = !(arguments.length > 1 && arguments[1] !== undefined) || arguments[1];
    var c = aa(".".concat(da.item, "[").concat(ea.id, "=\"").concat(a, "\"]"));
    K(parseInt(c.getAttribute(ea.slide)), b);
  }
  function M() {
    if (ha.centerSlide && ha.items > 0) {
      var a = -X(U()) - -(parseInt(Z().width) * Math.floor(ha.items / 2));
      Ca = a, I(a);
    } else H(U());
  }
  function N() {
    if (qa != null && qa.forEach(function (a) {
      aa("[".concat(ea.slide, "=\"").concat(a, "\"]")).classList.remove("active");
    }), qa = [], ha.centerSlide) qa.push(ra);else if (ha.itemPerPage) for (var a = ra; a < ra + ha.items; a++) qa.push(a);else if (T() + ha.items > W()) for (var a = na.length - ha.items; a < W(); a++) qa.push(a);else if (ha.items == 0) qa.push(T());else for (var a = T(); a < T() + ha.items; a++) a < na.length && qa.push(a);
    qa.forEach(function (a) {
      aa("[".concat(ea.slide, "=\"").concat(a, "\"]")).classList.add("active");
    }), t();
  }
  function O() {
    var b = "active";
    if (q()) {
      var c = aa(".".concat(da.dot, "[").concat(ea.slide, "].") + b);
      c != null && c.classList.remove(b), aa(".".concat(da.dot, "[").concat(ea.slide, "=\"").concat(ra, "\"]")).classList.add(b);
    }
  }
  function P() {
    ta == null && (ta = setInterval(function () {
      return R();
    }, ha.autoplaySpeed));
  }
  function Q() {
    ta > 0 && (clearTimeout(ta), ta = undefined);
  }
  function R() {
    K("next");
  }
  function S() {
    K("prev");
  }
  function T() {
    return ra * (ha.items > 0 ? ha.items : 1);
  }
  function U() {
    return aa("[".concat(ea.slide, "].active"));
  }
  function V() {
    return ra;
  }
  function W() {
    return na.length;
  }
  function X(a) {
    return ha.vertical ? a.getBoundingClientRect().top - ma.getBoundingClientRect().top : a.getBoundingClientRect().left - ma.getBoundingClientRect().left;
  }
  function Y() {
    return sa;
  }
  function Z() {
    return na[0].style;
  }
  function $() {
    var a = ba("tr"),
      b = {
        transition: "transitionend",
        MozTransition: "transitionend",
        WebkitTransition: "webkitTransitionEnd"
      };
    for (var c in b) if (a.style[c] !== undefined) return b[c];
  }
  function _() {
    return new Object({
      created: Da !== undefined,
      currentPage: ra,
      totalPages: sa,
      totalSlides: na.length,
      activeSlides: _toConsumableArray(qa),
      config: _objectSpread({}, ha),
      currentTranslate: Ca
    });
  }
  function aa(a, b) {
    var c = "".concat(Fa, " ").concat(a);
    return b ? document.querySelectorAll(c) : document.querySelector(c);
  }
  function ba(a) {
    return document.createElement(a);
  }
  var ca = "ddcarousel",
    da = {
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
    ea = {
      slide: "data-slide",
      id: "data-id",
      title: "data-title",
      lazyImg: "data-src"
    },
    fa = ["onInitialize", "onInitialized", "onDrag", "onDragging", "onDragged", "onChanged", "onTransitionend", "onResized", "onDestroy", "onDestroyed"],
    ga = document.all && window.atob;
  var ha,
    ia,
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
    Ja = ["mouseover", "touchstart"],
    Ka = ["mouseleave", "touchend"],
    La = ["touchstart", "mousedown"],
    Ma = ["touchmove", "mousemove"],
    Na = ["touchend", "mouseup"];
  return c(a), {
    prevPage: S,
    nextPage: R,
    changePage: K,
    refresh: B,
    on: h,
    goToUrl: L,
    autoplayStart: P,
    autoplayStop: Q,
    getCurrentPage: V,
    getTotalPages: Y,
    getTotalSlides: W,
    getStatus: _,
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
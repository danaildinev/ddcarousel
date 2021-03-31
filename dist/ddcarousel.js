/* ddcarousel 1.3.1 | Danail Dinev | License: https://github.com/danaildinev/ddcarousel/blob/master/LICENSE */
"use strict";

var ddcarousel = function ddcarousel(a) {
  function b(a) {
    return za ? (console.error("".concat($, ": Already created!")), !1) : a != null && void (ga = {
      container: "." + $,
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
    }, na = 0, oa = 0, ma = [], ea = {}, ea = a === undefined ? ga : a, c(), e(da.container) && (Aa = document.querySelector(da.container).className, h("onInitialize", {
      container: ha,
      event: "onInitialize"
    }), i() !== !1 && (n(), p(), q(), J(), G(da.startPage > 0 ? da.startPage : 0, !1), x(), r(), h("onInitialized"), za = !0)));
  }

  function c() {
    var a = this;
    da = [], fa = [], ba.forEach(function (b) {
      ga[b] = function () {}, g(b, function (c) {
        da[b].call(a, c == null ? f(b) : c);
      });
    }), ea['responsive'] !== undefined && (fa = ea['responsive']), da = ga, d(ea);
  }

  function d(a) {
    for (var b in a) da[b] = a[b];

    da.items == 0 && (da.itemPerPage = !1);
  }

  function e(a) {
    var b = document.querySelector(a);
    return b == null ? (console.error("".concat($, ": Invalid container!")), !1) : (ha = b, Ba = a, !0);
  }

  function f(a) {
    return da.callbacks ? new Object({
      container: ha,
      event: a,
      currentSlides: ma,
      currentPage: na,
      totalSlides: S(),
      totalPages: oa
    }) : undefined;
  }

  function g(a, b) {
    !ba[a] && (ba[a] = []), ba[a].push(b);
  }

  function h(a, b) {
    if (ba[a]) for (var c in ba[a]) ba[a][c](b);
  }

  function i() {
    var a = Z("div"),
        b = Z("div");
    if (ka = Y("> div", !0), a.classList.add(_.cont), b.classList.add(_.stage), ha.appendChild(a), a.appendChild(b), ia = Y(".".concat(_.stage)), ka.length == 0) return console.error("".concat($, ": No content found in container. Destroying carousel...")), j(), !1;

    for (var c = 0; c < ka.length; c++) {
      var d = Z("div");
      d.classList.add(_.item), d.setAttribute(aa.slide, c), d.appendChild(ka[c]), da.urlNav && ka[c].hasAttribute(aa.id) && ka[c].hasAttribute(aa.title) && (d.setAttribute(aa.id, ka[c].getAttribute(aa.id)), d.setAttribute(aa.title, ka[c].getAttribute(aa.title))), b.appendChild(d);
    }

    ja = Y(".".concat(_.item), !0), k();
  }

  function j(a) {
    h("onDestroy");
    var b = document.querySelector(da.container);

    if (!a) {
      var c = Y(".".concat(_.item), !0);
      c.forEach(function (a) {
        b.appendChild(a.firstChild);
      });
    }

    var d = Y(".".concat(_.cont));
    return d && d.remove(), m() && Y(".".concat(_.nav)).remove(), o() && Y(".".concat(_.dots)).remove(), da.urlNav && Y(".".concat(_.url)) && Y(".".concat(_.url)).remove(), pa && M(), s(), b.className = Aa, na = 0, oa = 0, ja = [], ma = [], ka = [], za = !1, h("onDestroyed"), ba.forEach(function (a) {
      ba[a] = [];
    }), !0;
  }

  function k() {
    var a,
        b,
        c = ja[0].style.width,
        d = window.getComputedStyle(ha),
        e = ha.classList;
    da.fullWidth && !da.verticalMaxContentWidth ? e.add(_.fullW) : e.remove(_.fullW), da.vertical ? e.add(_.vert) : e.remove(_.vert), a = parseInt(d.width), b = parseInt(d.height), ja.length <= da.items && (da.items = ja.length), oa = da.centerSlide ? ja.length - 1 : da.itemPerPage ? ja.length - da.items : Math.ceil(ja.length / da.items) - 1, oa = oa, la = [];
    var f = 0;

    for (var g = 0; g < ja.length; g++) {
      if (da.items != 0) da.vertical ? ja[g].style.height = b / da.items + "px" : !da.vertical && (ja[g].style.width = a / da.items + "px");else {
        var j = ja[g].getBoundingClientRect();
        ja[g].style.width = j.width + "px", f += j;
      }
      la.push(l(Y("[".concat(aa.slide, "=\"").concat(g, "\"] > div"))));
    }

    if (!da.vertical && (ia.style.width = da.items == 0 ? f + "px" : a * ja.length + "px"), da.verticalMaxContentWidth) {
      var k,
          m = 0;
      ka.forEach(function (a) {
        k = a.getBoundingClientRect().width, k > m && (m = k);
      }), ha.style.width = m + "px";
    }

    da.autoHeight && (J(), F(na)), da.mouseDrag ? ia.classList.add(_.disable) : ia.classList.remove(_.disable), c != ja[0].style.width && h("onResized");
  }

  function l(a) {
    var b = a.offsetHeight,
        c = getComputedStyle(a);
    return b += parseInt(c.marginTop) + parseInt(c.marginBottom), b;
  }

  function m() {
    return da.nav && oa > 0;
  }

  function n() {
    var a = Y(".".concat(_.nav));

    if (m()) {
      var b = Z("div"),
          c = Z("button"),
          d = Z("button");
      a && a.remove(), b.classList.add(_.nav), c.classList.add(_.prev), c.innerHTML = da.labelNavPrev, d.classList.add(_.next), d.innerHTML = da.labelNavNext, b.appendChild(c), b.appendChild(d), ha.appendChild(b), Ca = Y(".".concat(_.prev)), Da = Y(".".concat(_.next)), Ca.addEventListener("click", function () {
        return O();
      }), Da.addEventListener("click", function () {
        return N();
      });
    } else a != null && a.remove();
  }

  function o() {
    return da.dots && oa > 0;
  }

  function p() {
    var a = Y(".".concat(_.dots));

    if (o()) {
      var b,
          c = Z("div");
      a && a.remove(), c.classList.add(_.dots), b = da.items > 1 ? da.centerSlide ? ja.length : oa + 1 : ja.length;

      for (var d = 0; d < b; d++) {
        var e = Z("button");
        e.classList.add(_.dot), e.setAttribute(aa.slide, d), e.addEventListener("click", function (a) {
          return G(parseInt(a.target.getAttribute(aa.slide)));
        }), c.appendChild(e);
      }

      ha.appendChild(c);
    } else a != null && a.remove();
  }

  function q() {
    var a = Y(".".concat(_.url));

    if (da.urlNav) {
      var b = Z("div"),
          c = Z("ul");
      a && a.remove(), b.classList.add(_.url), ja.forEach(function (b) {
        if (b.hasAttribute(aa.id) && b.hasAttribute(aa.title)) {
          var d = Z('li'),
              e = Z('a');
          e.href = "#" + b.getAttribute(aa.id), e.innerHTML = b.getAttribute(aa.title), d.appendChild(e), c.appendChild(d);
        }
      }), b.appendChild(c), ha.appendChild(b), Y(".".concat(_.url, " a"), !0).forEach(function (a) {
        a.addEventListener("click", function (b) {
          H(a.getAttribute('href').substring(1));
        });
      });
    } else a != null && a.remove();
  }

  function r() {
    qa = ca ? ia : window, Ha.forEach(function (a) {
      return qa.addEventListener(a, A, {
        passive: !0
      });
    }), Ia.forEach(function (a) {
      return window.addEventListener(a, y, {
        passive: !0
      });
    }), Ja.forEach(function (a) {
      return window.addEventListener(a, B);
    }), window.addEventListener("resize", w), ia.addEventListener(W(), v), da.autoplayPauseHover && da.autoplay ? t() : u();
  }

  function s() {
    qa = ca ? ia : window, Ha.forEach(function (a) {
      return qa.removeEventListener(a, A, {
        passive: !0
      });
    }), Ia.forEach(function (a) {
      return window.removeEventListener(a, y, {
        passive: !0
      });
    }), Ja.forEach(function (a) {
      return window.removeEventListener(a, B);
    }), window.removeEventListener("resize", w), ia.removeEventListener(W(), v), u();
  }

  function t() {
    Fa.forEach(function (a) {
      return ia.addEventListener(a, M);
    }), Ga.forEach(function (a) {
      return ia.addEventListener(a, L);
    });
  }

  function u() {
    Fa.forEach(function (a) {
      return ia.removeEventListener(a, M);
    }), Ga.forEach(function (a) {
      return ia.removeEventListener(a, L);
    });
  }

  function v() {
    h("onTransitionend");
  }

  function w() {
    k(), !Ea && (x(), Ea = !0, setTimeout(function () {
      Ea = !1;
    }, da.resizeRefresh));
  }

  function x() {
    var a = Object.keys(fa);

    for (var b = a.length - 1; b >= 0; b--) document.body.clientWidth < a[b] ? d(Object.values(fa)[b]) : document.body.clientWidth >= a[a.length - 1] && c();

    k(), n(), p(), K(), J(), q(), M(), da.autoplay && pa == null && L(), I(), C();
  }

  function y(a) {
    if (ua) {
      var b = z(a, "mousemove", "touchmove");
      ia.style.transitionDuration = da.swipeSmooth + "s", va = Math.abs(b - ra), ta = b - sa, va <= da.touchMaxSlideDist ? (h("onDragging"), E(ta)) : (xa = !0, ta = b - sa);
    }
  }

  function z(a, b, c) {
    return a.type == b && da.mouseDrag ? da.vertical ? a.clientY : a.pageX : a.type == c && da.touchDrag ? da.vertical ? a.targetTouches[0].pageY : a.targetTouches[0].pageX : void 0;
  }

  function A(a) {
    if (ca || a.target == ia) {
      var b = z(a, "mousedown", "touchStartCords");
      b !== undefined && (ua = !0, ra = b, sa = ra + -ya, wa = ya, xa = !1, h("onDrag"));
    }
  }

  function B() {
    ua && (h("onDragged"), va >= da.touchSwipeThreshold && !xa ? ta > wa ? O() : N() : E(wa), ia.style.transitionDuration = da.slideChangeDuration + "s", ua = !1);
  }

  function C() {
    if (m()) {
      var a = "inactive";
      na == 0 ? (Ca.classList.add(a), Da.classList.remove(a)) : na == oa ? (Ca.classList.remove(a), Da.classList.add(a)) : (Ca.classList.remove(a), Da.classList.remove(a));
    }
  }

  function D(a) {
    ya = -T(a), E(ya);
  }

  function E(a) {
    var b = da.vertical ? "translateY(".concat(a, "px)") : "translateX(".concat(a, "px)");
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ? ia.style.webkitTransform = b : ia.style.transform = b;
  }

  function F() {
    if (da.items == 1) ha.style.height = la[na] + "px";else {
      var a = [];

      for (var b = ma[0]; b <= ma[ma.length - 1]; b++) a.push(la[b]);

      ha.style.height = Math.max.apply(Math, a) + "px";
    }
  }

  function G(a) {
    var b = !(arguments.length > 1 && arguments[1] !== undefined) || arguments[1];
    var c = na;
    b ? ia.style.transitionDuration = da.slideChangeDuration + "s" : (ia.style.transitionDuration = "0s", ia.addEventListener(W(), function () {
      ia.style.transitionDuration = da.slideChangeDuration + "0s";
    })), a == "prev" ? na != 0 && na-- : a == "next" ? na < oa && na++ : Number.isInteger(a) && a > -1 && a <= oa && (na = a), J(), K(), I(), C(), da.autoHeight && F(Q()), c != na && h("onChanged");
  }

  function H(a) {
    var b = !(arguments.length > 1 && arguments[1] !== undefined) || arguments[1];
    var c = Y(".".concat(_.item, "[").concat(aa.id, "=\"").concat(a, "\"]"));
    G(parseInt(c.getAttribute(aa.slide)), b);
  }

  function I() {
    if (da.centerSlide && da.items > 0) {
      var a = -T(Q()) - -(parseInt(V().width) * Math.floor(da.items / 2));
      ya = a, E(a);
    } else D(Q());
  }

  function J() {
    if (ma != null && ma.forEach(function (a) {
      Y("[".concat(aa.slide, "=\"").concat(a, "\"]")).classList.remove("active");
    }), ma = [], da.centerSlide) ma.push(na);else if (da.itemPerPage) for (var a = na; a < na + da.items; a++) ma.push(a);else if (P() + da.items > S()) for (var a = ja.length - da.items; a < S(); a++) ma.push(a);else if (da.items == 0) ma.push(P());else for (var a = P(); a < P() + da.items; a++) a < ja.length && ma.push(a);
    ma.forEach(function (a) {
      Y("[".concat(aa.slide, "=\"").concat(a, "\"]")).classList.add("active");
    });
  }

  function K() {
    var b = "active";

    if (o()) {
      var c = Y(".".concat(_.dot, "[").concat(aa.slide, "].") + b);
      c != null && c.classList.remove(b), Y(".".concat(_.dot, "[").concat(aa.slide, "=\"").concat(na, "\"]")).classList.add(b);
    }
  }

  function L() {
    pa == null && (pa = setInterval(function () {
      return N();
    }, da.autoplaySpeed));
  }

  function M() {
    pa > 0 && (clearTimeout(pa), pa = undefined);
  }

  function N() {
    G("next");
  }

  function O() {
    G("prev");
  }

  function P() {
    return na * (da.items > 0 ? da.items : 1);
  }

  function Q() {
    return Y("[".concat(aa.slide, "].active"));
  }

  function R() {
    return na;
  }

  function S() {
    return ja.length;
  }

  function T(a) {
    return da.vertical ? a.getBoundingClientRect().top - ia.getBoundingClientRect().top : a.getBoundingClientRect().left - ia.getBoundingClientRect().left;
  }

  function U() {
    return oa;
  }

  function V() {
    return ja[0].style;
  }

  function W() {
    var a = Z("tr"),
        b = {
      transition: "transitionend",
      MozTransition: "transitionend",
      WebkitTransition: "webkitTransitionEnd"
    };

    for (var c in b) if (a.style[c] !== undefined) return b[c];
  }

  function X() {
    return new Object({
      created: za !== undefined
    });
  }

  function Y(a, b) {
    var c = "".concat(Ba, " ").concat(a);
    return b ? document.querySelectorAll(c) : document.querySelector(c);
  }

  function Z(a) {
    return document.createElement(a);
  }

  var $ = "ddcarousel",
      _ = {
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
      aa = {
    slide: "data-slide",
    id: "data-id",
    title: "data-title"
  },
      ba = ["onInitialize", "onInitialized", "onDrag", "onDragging", "onDragged", "onChanged", "onTransitionend", "onResized", "onDestroy", "onDestroyed"],
      ca = document.all && window.atob;
  var da,
      ea,
      fa,
      ga,
      ha,
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
      Fa = ["mouseover", "touchstart"],
      Ga = ["mouseleave", "touchend"],
      Ha = ["touchstart", "mousedown"],
      Ia = ["touchmove", "mousemove"],
      Ja = ["touchend", "mouseup"];
  return b(a), {
    prevPage: O,
    nextPage: N,
    changePage: G,
    refresh: x,
    on: g,
    goToUrl: H,
    autoplayStart: L,
    autoplayStop: M,
    getCurrentPage: R,
    getTotalPages: U,
    getTotalSlides: S,
    getStatus: X,
    destroy: j,
    init: b
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
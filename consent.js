/* ============================================================
   AJM COURTAGE — Consentement cookies (RGPD)
   Aucun cookie non essentiel n'est déposé avant consentement.
   Le consentement est mémorisé (localStorage) pour ne pas
   re-afficher le bandeau à chaque page.

   IDENTIFIANTS À REMPLACER avant mise en ligne des campagnes :
   ============================================================ */
(function () {
  "use strict";

  var GA4_ID = "G-XXXXXXXXXX";
  var META_PIXEL_ID = "0000000000000000";
  var TIKTOK_PIXEL_ID = "XXXXXXXXXXXXXXXXXXXXXX";
  var STORAGE_KEY = "ajm_cookie_consent";

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }
  }
  function setConsent(c) {
    c.updatedAt = new Date().toISOString();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch (e) {}
  }
  window.ajmGetConsent = getConsent;
  window.ajmSetConsent = function (c) { setConsent(c); activate(c); };

  function loadGA4() {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA4_ID);
  }

  function loadMeta() {
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", META_PIXEL_ID);
    window.fbq("track", "PageView");
  }

  function loadTikTok() {
    (function (w, d, t) {
      w.TiktokAnalyticsObject = t;
      var ttq = w[t] = w[t] || [];
      ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
      ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.load = function (e) {
        var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = i;
        ttq._t = ttq._t || {}; ttq._t[e] = +new Date();
        var a = d.createElement("script"); a.type = "text/javascript"; a.async = true;
        a.src = i + "?sdkid=" + e + "&lib=" + t;
        var s = d.getElementsByTagName("script")[0]; s.parentNode.insertBefore(a, s);
      };
      ttq.load(TIKTOK_PIXEL_ID);
      ttq.page();
    })(window, document, "ttq");
  }

  function activate(consent) {
    if (consent.analytics) loadGA4();
    if (consent.marketing) { loadMeta(); loadTikTok(); }
  }

  function renderBanner() {
    var el = document.createElement("div");
    el.className = "cookie-banner";
    el.innerHTML =
      '<div class="cookie-banner-inner">' +
      "<p>Nous utilisons des cookies pour mesurer l\u2019audience du site et, si vous l\u2019acceptez, personnaliser nos publicités. Vous pouvez accepter, refuser, ou choisir vos préférences.</p>" +
      '<div class="cookie-banner-actions">' +
      '<button type="button" data-action="reject" class="btn btn-ghost">Refuser</button>' +
      '<a href="' + (isLp() ? "../cookies.html" : "cookies.html") + '" class="btn btn-ghost">Personnaliser</a>' +
      '<button type="button" data-action="accept" class="btn btn-primary">Accepter tout</button>' +
      "</div></div>";
    document.body.appendChild(el);
    el.querySelector('[data-action="accept"]').addEventListener("click", function () {
      var c = { analytics: true, marketing: true };
      setConsent(c); activate(c); el.remove();
    });
    el.querySelector('[data-action="reject"]').addEventListener("click", function () {
      setConsent({ analytics: false, marketing: false });
      el.remove();
    });
  }

  function isLp() {
    return window.location.pathname.indexOf("/lp/") !== -1;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var consent = getConsent();
    if (consent) activate(consent);
    else renderBanner();
  });
})();

/* ============================================================
   AJM COURTAGE — Tracking marketing unifié
   Un seul point d'entrée (window.ajmTrack) qui pousse l'événement
   vers GA4 (dataLayer), Meta Pixel (fbq) et TikTok Pixel (ttq),
   en adaptant le nom d'événement à ce que chaque plateforme
   attend. form.js déclenche des CustomEvents DOM ; ce fichier les
   écoute et les transforme en événements marketing (cf. cahier
   des charges §17-20).
   ============================================================ */
(function () {
  "use strict";

  function push(name, params) {
    params = params || {};
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, params));

    if (window.fbq) {
      var metaMap = {
        Lead: "Lead", QuoteRequest: "Lead", FormCompleted: "Lead",
        Contact: "Contact", PhoneClick: "Contact", EmailClick: "Contact",
        ViewContent: "ViewContent"
      };
      var m = metaMap[name];
      if (m) window.fbq("track", m, params);
      else window.fbq("trackCustom", name, params);
    }

    if (window.ttq) {
      var ttMap = {
        Lead: "SubmitForm", QuoteRequest: "SubmitForm", FormCompleted: "SubmitForm",
        ViewContent: "ViewContent", Contact: "Contact"
      };
      var t = ttMap[name];
      if (t) window.ttq.track(t, params);
      else window.ttq.track(name, params);
    }
  }
  window.ajmTrack = push;

  document.addEventListener("DOMContentLoaded", function () {
    var body = document.body;
    var page = body.getAttribute("data-page") || "";
    var product = body.getAttribute("data-product") || "";

    // ViewContent — une fois par page, avec le produit si on est sur une landing produit
    push("ViewContent", { page: page, product: product });

    // CTA "Obtenir mon devis" → QuoteRequest, "Être rappelé" → Contact
    document.querySelectorAll('a[href="#devis"], a[href="#lead-form"]').forEach(function (a) {
      a.addEventListener("click", function () {
        var label = (a.textContent || "").trim().toLowerCase();
        if (label.indexOf("rappel") !== -1) push("Contact", { cta: label, page: page });
        else push("QuoteRequest", { cta: label, page: page });
      });
    });

    // Liens tél / email, dès qu'ils existeront sur le site
    document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
      a.addEventListener("click", function () { push("PhoneClick", { page: page }); });
    });
    document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
      a.addEventListener("click", function () { push("EmailClick", { page: page }); });
    });

    // Événements remontés depuis le formulaire multi-étapes (form.js)
    var formStarted = false;
    var formCompleted = false;
    var lastStep = 1;

    document.addEventListener("ajm:form-first-interaction", function () {
      if (!formStarted) { formStarted = true; push("StartForm", { page: page }); }
    });
    document.addEventListener("ajm:form-step", function (e) {
      lastStep = e.detail.step;
      push("FormStepCompleted", e.detail);
    });
    document.addEventListener("ajm:form-complete", function (e) {
      formCompleted = true;
      push("Lead", e.detail || {});
      push("FormCompleted", e.detail || {});
    });

    // FormAbandon — heuristique : le formulaire a démarré mais n'a pas
    // été terminé quand l'utilisateur quitte ou masque l'onglet.
    function maybeAbandon() {
      if (formStarted && !formCompleted) {
        push("FormAbandon", { lastStep: lastStep, page: page });
        formCompleted = true; // évite un double envoi si l'onglet redevient visible puis se ferme
      }
    }
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") maybeAbandon();
    });
    window.addEventListener("pagehide", maybeAbandon);
  });
})();

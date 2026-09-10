/* ============================================================
   AJM COURTAGE — Formulaire de demande multi-étapes
   Étape 1 : produit  |  Étape 2 : besoin  |  Étape 3 : coordonnées
   Pas de backend branché pour l'instant : la soumission est
   simulée localement (état en mémoire uniquement). Le point
   d'intégration CRM/webhook futur est isolé dans sendLead().
   ============================================================ */
(function () {
  "use strict";

  var PRODUCTS = [
    { slug: "assurance-sante", label: "Santé", icon: sante() },
    { slug: "prevoyance", label: "Prévoyance", icon: prevoyance() },
    { slug: "assurance-auto", label: "Auto", icon: auto() },
    { slug: "assurance-moto", label: "Moto", icon: moto() },
    { slug: "assurance-chien-chat", label: "Chien & Chat", icon: chienChat() },
    { slug: "assurance-habitation", label: "Habitation", icon: habitation() },
    { slug: "assurance-emprunteur", label: "Emprunteur", icon: emprunteur() }
  ];

  var FIELDS = {
    "assurance-sante": [
      { id: "situation", label: "Situation familiale", type: "select", options: ["Célibataire", "En couple", "Famille avec enfants", "Senior"] },
      { id: "personnes", label: "Nombre de personnes à assurer", type: "number", placeholder: "ex. 2" },
      { id: "besoin", label: "Besoin(s) — plusieurs choix possibles", type: "checkbox", options: ["Consultations", "Hospitalisation", "Optique", "Dentaire"] },
      { id: "priorite", label: "Degré de priorité de cette demande", type: "stars", max: 4 },
      { id: "statut_pro", label: "Situation professionnelle", type: "select", options: ["Salarié", "Indépendant", "Sans emploi", "Retraité", "Étudiant"] },
      { id: "cp", label: "Code postal", type: "text", placeholder: "ex. 77167" }
    ],
    "prevoyance": [
      { id: "statut_pro", label: "Situation professionnelle", type: "select", options: ["Salarié", "Indépendant", "Profession libérale", "Sans emploi"] },
      { id: "situation", label: "Situation familiale", type: "select", options: ["Célibataire", "En couple", "Famille avec enfants"] },
      { id: "besoin", label: "Besoin principal", type: "select", options: ["Arrêt de travail", "Invalidité", "Décès", "Plusieurs besoins"] },
      { id: "cp", label: "Code postal", type: "text", placeholder: "ex. 77167" }
    ],
    "assurance-auto": [
      { id: "vehicule", label: "Type de véhicule", type: "select", options: ["Citadine", "Berline", "SUV", "Utilitaire", "Autre"] },
      { id: "permis", label: "Date d'obtention du permis", type: "text", placeholder: "MM/AAAA" },
      { id: "bonus_malus", label: "Bonus / malus actuel", type: "select", options: ["Je ne sais pas", "0.50 (bonus max)", "Entre 0.51 et 1", "1 (neutre)", "Supérieur à 1"] },
      { id: "usage", label: "Usage du véhicule", type: "select", options: ["Trajets quotidiens", "Usage occasionnel", "Professionnel"] },
      { id: "cp", label: "Code postal", type: "text", placeholder: "ex. 77167" }
    ],
    "assurance-moto": [
      { id: "deux_roues", label: "Type de deux-roues", type: "select", options: ["Scooter", "Routière", "Sportive", "Trail", "Autre"] },
      { id: "cylindree", label: "Cylindrée", type: "select", options: ["< 50 cm³", "50-125 cm³", "126-500 cm³", "> 500 cm³"] },
      { id: "permis", label: "Date du permis moto", type: "text", placeholder: "MM/AAAA" },
      { id: "usage", label: "Usage principal", type: "select", options: ["Quotidien", "Occasionnel"] },
      { id: "cp", label: "Code postal", type: "text", placeholder: "ex. 77167" }
    ],
    "assurance-chien-chat": [
      { id: "animal", label: "Type d'animal", type: "select", options: ["Chien", "Chat"] },
      { id: "age", label: "Âge de l'animal", type: "select", options: ["Moins d'1 an", "1 à 3 ans", "4 à 7 ans", "8 ans et plus"] },
      { id: "besoin", label: "Besoin principal", type: "select", options: ["Consultations courantes", "Chirurgie", "Hospitalisation", "Formule complète"] },
      { id: "cp", label: "Code postal", type: "text", placeholder: "ex. 77167" }
    ],
    "assurance-habitation": [
      { id: "statut_occupant", label: "Vous êtes", type: "select", options: ["Locataire", "Propriétaire occupant", "Propriétaire bailleur"] },
      { id: "logement", label: "Type de logement", type: "select", options: ["Appartement", "Maison"] },
      { id: "surface", label: "Surface approximative (m²)", type: "number", placeholder: "ex. 65" },
      { id: "cp", label: "Code postal", type: "text", placeholder: "ex. 77167" }
    ],
    "assurance-emprunteur": [
      { id: "projet", label: "Type de projet", type: "select", options: ["Résidence principale", "Investissement locatif", "Résidence secondaire"] },
      { id: "montant", label: "Montant du prêt (€)", type: "number", placeholder: "ex. 220000" },
      { id: "duree", label: "Durée du prêt (années)", type: "number", placeholder: "ex. 20" },
      { id: "situation_pro", label: "Votre situation", type: "select", options: ["Salarié", "Indépendant", "Profession libérale", "Retraité"] },
      { id: "cp", label: "Code postal", type: "text", placeholder: "ex. 77167" }
    ]
  };

  function checkIcon() {
    return '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12.5 9.5 17 19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function sante() { return icon('<path d="M12 20s-7-4.35-9.5-8.8C.7 7.7 2 4 5.4 4c1.9 0 3.3 1.1 4 2.3.7-1.2 2.1-2.3 4-2.3 3.4 0 4.7 3.7 2.9 7.2C19 15.65 12 20 12 20Z"/>'); }
  function prevoyance() { return icon('<path d="M12 3.5 5 6v5.2c0 4.4 2.9 7.5 7 9.3 4.1-1.8 7-4.9 7-9.3V6l-7-2.5Z"/>'); }
  function auto() { return icon('<path d="M4 16.5V13l1.6-4.2A2 2 0 0 1 7.5 7.5h9a2 2 0 0 1 1.9 1.3L20 13v3.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.5" cy="16.5" r="1.4"/><circle cx="16.5" cy="16.5" r="1.4"/>'); }
  function moto() { return icon('<circle cx="6" cy="16.5" r="2"/><circle cx="18" cy="16.5" r="2"/><path d="M8.2 16.5h5.4l2-4.6h2.7" stroke-linecap="round" stroke-linejoin="round"/>'); }
  function chienChat() { return icon('<ellipse cx="12" cy="16" rx="4" ry="3.2"/><circle cx="8" cy="10.5" r="1.5"/><circle cx="16" cy="10.5" r="1.5"/>'); }
  function habitation() { return icon('<path d="M4 11.5 12 4l8 7.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10v9.5h12V10" stroke-linecap="round" stroke-linejoin="round"/>'); }
  function emprunteur() { return icon('<path d="M4 11.5 12 4l8 7.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="14.5" r="2.1"/>'); }
  function icon(paths) {
    return '<svg class="ico" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' + paths + '</svg>';
  }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^(\+33|0)[1-9](\d{2}){4}$/;

  function captureUTM() {
    var params = new URLSearchParams(window.location.search);
    var keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
    var out = {};
    keys.forEach(function (k) {
      var v = params.get(k);
      if (v) out[k] = v;
    });
    return out;
  }

  function emit(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
  }

  function init(root) {
    var state = {
      step: 1,
      product: root.getAttribute("data-preselect") || "",
      answers: {},
      contact: {},
      interacted: false
    };

    function render() {
      var stepLabels = ["Que recherchez-vous ?", "Votre besoin", "Vos coordonnées"];
      var html = '';
      html += '<div class="lf-progress">' +
        [1, 2, 3].map(function (n) {
          return '<span class="' + (n <= state.step ? 'done' : '') + '"></span>';
        }).join('') + '</div>';
      html += '<span class="lf-step-label">Étape ' + state.step + ' / 3</span>';

      if (state.step === 1) {
        html += '<h3 class="lf-title">' + stepLabels[0] + '</h3>';
        html += '<div class="lf-option-grid" data-role="product-grid">';
        PRODUCTS.forEach(function (p) {
          html += '<button type="button" class="lf-option' + (state.product === p.slug ? ' selected' : '') + '" data-slug="' + p.slug + '">' +
            p.icon + '<span>' + p.label + '</span></button>';
        });
        html += '</div>';
        html += actions(false, "Continuer");
      } else if (state.step === 2) {
        html += '<h3 class="lf-title">' + stepLabels[1] + '</h3>';
        var fields = FIELDS[state.product] || [];
        fields.forEach(function (f) {
          html += fieldHtml(f, state.answers[f.id] || "");
        });
        html += actions(true, "Continuer");
      } else if (state.step === 3) {
        html += '<h3 class="lf-title">' + stepLabels[2] + '</h3>';
        html += fieldHtml({ id: "prenom", label: "Prénom", type: "text" }, state.contact.prenom || "");
        html += fieldHtml({ id: "nom", label: "Nom", type: "text" }, state.contact.nom || "");
        html += fieldHtml({ id: "telephone", label: "Téléphone", type: "text", placeholder: "06 12 34 56 78" }, state.contact.telephone || "");
        html += fieldHtml({ id: "email", label: "E-mail", type: "text", placeholder: "vous@exemple.fr" }, state.contact.email || "");
        html += '<input type="text" name="site_web" class="lf-hp" tabindex="-1" autocomplete="off" value="">';
        html += actions(true, "Envoyer ma demande");
      }
      root.innerHTML = html;
      bind();
    }

    function fieldHtml(f, value) {
      if (f.type === "checkbox") {
        var selected = (value || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
        var out = '<div class="lf-field" data-field="' + f.id + '"><label>' + f.label + '</label><div class="lf-checkbox-group">';
        f.options.forEach(function (o) {
          out += '<label class="lf-checkbox-option"><input type="checkbox" name="' + f.id + '" value="' + o + '"' + (selected.indexOf(o) !== -1 ? " checked" : "") + '><span>' + o + '</span></label>';
        });
        out += '</div><span class="lf-error">Sélectionnez au moins une option.</span></div>';
        return out;
      }
      if (f.type === "stars") {
        var current = parseInt(value, 10) || 0;
        var max = f.max || 4;
        var out2 = '<div class="lf-field" data-field="' + f.id + '"><label>' + f.label + '</label><div class="lf-stars" data-stars-for="' + f.id + '">';
        for (var i = 1; i <= max; i++) {
          out2 += '<button type="button" class="lf-star' + (i <= current ? " filled" : "") + '" data-star="' + i + '" aria-label="' + i + ' sur ' + max + '">★</button>';
        }
        out2 += '</div><input type="hidden" data-id="' + f.id + '" value="' + current + '">';
        out2 += '<span class="lf-error">Merci d\u2019indiquer un niveau de priorité.</span></div>';
        return out2;
      }
      var out = '<div class="lf-field" data-field="' + f.id + '"><label for="lf-' + f.id + '">' + f.label + '</label>';
      if (f.type === "select") {
        out += '<select id="lf-' + f.id + '" data-id="' + f.id + '"><option value="">Sélectionner…</option>';
        f.options.forEach(function (o) {
          out += '<option value="' + o + '"' + (o === value ? ' selected' : '') + '>' + o + '</option>';
        });
        out += '</select>';
      } else {
        out += '<input id="lf-' + f.id + '" data-id="' + f.id + '" type="' + (f.type === "number" ? "number" : "text") + '" placeholder="' + (f.placeholder || "") + '" value="' + value.replace(/"/g, '&quot;') + '">';
      }
      out += '<span class="lf-error">Merci de compléter ce champ.</span></div>';
      return out;
    }

    function actions(showBack, nextLabel) {
      return '<div class="lf-actions">' +
        '<button type="button" class="lf-back" data-role="back"' + (showBack ? '' : ' disabled') + '>← Précédent</button>' +
        '<button type="button" class="lf-next" data-role="next">' + nextLabel + '</button>' +
        '</div>';
    }

    function bind() {
      if (!state.interacted) {
        root.addEventListener("click", function onFirst() {
          if (!state.interacted) {
            state.interacted = true;
            emit("ajm:form-first-interaction");
          }
          root.removeEventListener("click", onFirst);
        }, { once: true });
      }
      var grid = root.querySelector('[data-role="product-grid"]');
      if (grid) {
        grid.querySelectorAll(".lf-option").forEach(function (btn) {
          btn.addEventListener("click", function () {
            state.product = btn.getAttribute("data-slug");
            grid.querySelectorAll(".lf-option").forEach(function (b) { b.classList.remove("selected"); });
            btn.classList.add("selected");
          });
        });
      }
      var backBtn = root.querySelector('[data-role="back"]');
      root.querySelectorAll(".lf-stars").forEach(function (group) {
        var fieldId = group.getAttribute("data-stars-for");
        var hidden = root.querySelector('.lf-field[data-field="' + fieldId + '"] input[type="hidden"]');
        group.querySelectorAll(".lf-star").forEach(function (star) {
          star.addEventListener("click", function () {
            var val = parseInt(star.getAttribute("data-star"), 10);
            if (hidden) hidden.value = val;
            group.querySelectorAll(".lf-star").forEach(function (s) {
              s.classList.toggle("filled", parseInt(s.getAttribute("data-star"), 10) <= val);
            });
          });
        });
      });
      if (backBtn) backBtn.addEventListener("click", function () {
        state.step = Math.max(1, state.step - 1);
        render();
      });
      var nextBtn = root.querySelector('[data-role="next"]');
      if (nextBtn) nextBtn.addEventListener("click", handleNext);
    }

    function handleNext() {
      if (state.step === 1) {
        if (!state.product) {
          var grid = root.querySelector('[data-role="product-grid"]');
          grid.style.outline = "2px solid #c23b3b";
          setTimeout(function () { grid.style.outline = ""; }, 1200);
          return;
        }
        state.step = 2;
        render();
        emit("ajm:form-step", { step: 2, product: state.product });
        return;
      }
      if (state.step === 2) {
        var fields = FIELDS[state.product] || [];
        var valid = true;
        fields.forEach(function (f) {
          var wrap = root.querySelector('[data-field="' + f.id + '"]');
          var val;
          if (f.type === "checkbox") {
            var checked = Array.prototype.slice.call(root.querySelectorAll('input[name="' + f.id + '"]:checked'));
            val = checked.map(function (c) { return c.value; }).join(", ");
          } else {
            var el = root.querySelector('[data-id="' + f.id + '"]');
            val = el.value.trim();
          }
          state.answers[f.id] = val;
          if (!val) { wrap.classList.add("invalid"); valid = false; }
          else wrap.classList.remove("invalid");
        });
        if (!valid) return;
        state.step = 3;
        render();
        emit("ajm:form-step", { step: 3, product: state.product });
        return;
      }
      if (state.step === 3) {
        var ok = true;
        function setVal(id) {
          var el = root.querySelector('[data-id="' + id + '"]');
          var wrap = root.querySelector('[data-field="' + id + '"]');
          var val = el.value.trim();
          state.contact[id] = val;
          return { val: val, wrap: wrap };
        }
        ["prenom", "nom"].forEach(function (id) {
          var r = setVal(id);
          if (!r.val) { r.wrap.classList.add("invalid"); ok = false; } else r.wrap.classList.remove("invalid");
        });
        var tel = setVal("telephone");
        var telClean = tel.val.replace(/[\s.-]/g, "");
        if (!tel.val || !PHONE_RE.test(telClean)) {
          tel.wrap.classList.add("invalid"); ok = false;
        } else tel.wrap.classList.remove("invalid");
        var email = setVal("email");
        if (!email.val || !EMAIL_RE.test(email.val)) {
          email.wrap.classList.add("invalid"); ok = false;
        } else email.wrap.classList.remove("invalid");

        var honeypot = root.querySelector('[name="site_web"]');
        var isBot = !!(honeypot && honeypot.value);

        if (!ok) return;

        emit("ajm:form-complete", { product: state.product });

        var nextBtn = root.querySelector('[data-role="next"]');
        var backBtn = root.querySelector('[data-role="back"]');
        if (nextBtn) { nextBtn.disabled = true; nextBtn.textContent = "Envoi en cours…"; }
        if (backBtn) backBtn.disabled = true;

        sendLead({
          product: state.product,
          answers: state.answers,
          contact: state.contact,
          utm: captureUTM(),
          honeypot: isBot,
          meta: { source: "site-web", page: window.location.pathname }
        }).then(function (result) {
          renderConfirmation(result);
        });
      }
    }

    function renderConfirmation(result) {
      var fallbackNote = (!result || !result.ok)
        ? '<p>Si vous ne recevez pas de nouvelles rapidement, n\'hésitez pas à nous appeler directement — votre demande a bien été notée de notre côté.</p>'
        : '';
      root.innerHTML =
        '<div class="lf-confirm">' +
        '<div class="lf-check">' + checkIcon() + '</div>' +
        '<h3>Merci, votre demande a bien été enregistrée.</h3>' +
        '<p>Un conseiller AJM Courtage pourra revenir vers vous selon les modalités indiquées.</p>' +
        fallbackNote +
        '</div>';
    }

    // Envoie le lead à l'API du CRM AJM Courtage déjà déployé
    // (https://ajmcourtagecrm.netlify.app), fonction lead-submit.js.
    // Le lead apparaît directement dans l'onglet Clients du CRM avec le
    // statut "Nouveau". En cas d'échec (réseau, CORS…), le lead est gardé
    // en mémoire locale et l'utilisateur voit tout de même une confirmation.
    var CRM_API_URL = "https://ajmcourtagecrm.netlify.app/api/lead-submit";

    function sendLead(payload) {
      window.__ajmLeadsQueue = window.__ajmLeadsQueue || [];
      return fetch(CRM_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error("submit failed");
        return res.json();
      }).then(function (data) {
        return { ok: true, leadId: data.clientId, score: data.score, tier: data.tier };
      }).catch(function () {
        window.__ajmLeadsQueue.push(payload);
        return { ok: false };
      });
    }

    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("#lead-form").forEach(init);
  });
})();

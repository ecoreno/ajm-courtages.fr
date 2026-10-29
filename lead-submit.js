// Reçoit les leads envoyés par le site vitrine (ajmcourtages.fr) et les stocke dans le CRM.
// Endpoint public : POST /api/lead-submit
//
// Corrige l'erreur CORS « Access-Control-Allow-Origin ne correspond pas à https://ajmcourtages.fr ».
// Les leads sont enregistrés dans la collection "crm-leads" (Netlify Blobs).

import { getStore } from "@netlify/blobs";

const ALLOWED_ORIGINS = [
  "https://ajmcourtages.fr",
  "https://www.ajmcourtages.fr",
  "https://ajmcourtagesite.netlify.app",
];

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

const clean = (v, max = 500) => String(v ?? "").trim().slice(0, max);

export default async (req) => {
  const origin = req.headers.get("origin") || "";

  // Pré-requête CORS du navigateur
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return json({ error: "Méthode non autorisée" }, 405, origin);
  }

  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return json({ error: "Origine non autorisée" }, 403, origin);
  }

  let body;
  try {
    const raw = await req.text();
    if (raw.length > 20000) return json({ error: "Requête trop volumineuse" }, 413, origin);
    body = JSON.parse(raw);
  } catch {
    return json({ error: "JSON invalide" }, 400, origin);
  }

  // Champ piège anti-robots : s'il est rempli, on fait semblant d'accepter sans rien enregistrer
  if (body._gotcha) return json({ ok: true }, 200, origin);

  const email = clean(body.email || body.mail, 200);
  const phone = clean(body.phone || body.telephone || body.tel, 40);
  if (!email && !phone) {
    return json({ error: "Email ou téléphone requis" }, 422, origin);
  }

  // Champs libres du formulaire (réponses du simulateur, etc.), limités en taille
  const extra = {};
  for (const [k, v] of Object.entries(body)) {
    if (k.startsWith("_")) continue;
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      extra[clean(k, 60)] = clean(v, 1000);
    }
  }

  const lead = {
    id: crypto.randomUUID(),
    dateCreated: new Date().toISOString(),
    source: clean(body.source || "site-vitrine", 100),
    produit: clean(body.produit || body.product || "", 100),
    nom: clean(body.nom || body.name || body.lastName, 120),
    prenom: clean(body.prenom || body.firstName, 120),
    email,
    phone,
    statut: "Nouveau",
    data: extra,
  };

  try {
    const store = getStore("crm-ajm-courtage");
    const raw = await store.get("crm-leads");
    const leads = raw ? JSON.parse(raw) : [];
    leads.unshift(lead);
    await store.set("crm-leads", JSON.stringify(leads.slice(0, 5000)));
  } catch (e) {
    console.error("lead-submit: échec d'enregistrement", e);
    return json({ error: "Erreur serveur" }, 500, origin);
  }

  return json({ ok: true, id: lead.id }, 201, origin);
};

export const config = { path: "/api/lead-submit" };

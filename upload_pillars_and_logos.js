#!/usr/bin/env node
// Upload pillar + COA company logos to Exhibit theme, then update index.json
// to use custom-liquid sections that render them.
// Usage: SHOPIFY_TOKEN=shpat_xxx node upload_pillars_and_logos.js

const fs = require("fs");
const path = require("path");

const STORE = "gauntletgallery.myshopify.com";
const API_V = "2024-10";
const THEME = 149213806727;
const TOKEN = process.env.SHOPIFY_TOKEN;
if (!TOKEN) { console.error("Missing SHOPIFY_TOKEN"); process.exit(1); }

const api = async (method, path, body) => {
  const res = await fetch(`https://${STORE}/admin/api/${API_V}${path}`, {
    method, headers: { "X-Shopify-Access-Token": TOKEN, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${txt}`);
  return JSON.parse(txt);
};

const uploadAsset = async (localPath, remoteName) => {
  const b64 = fs.readFileSync(localPath).toString("base64");
  const r = await api("PUT", `/themes/${THEME}/assets.json`, {
    asset: { key: `assets/${remoteName}`, attachment: b64 },
  });
  console.log(`  ✓ ${remoteName} (${r.asset.size}b)`);
};

(async () => {
  console.log("== Uploading pillar images ==");
  await uploadAsset("/tmp/ggf_logos/3.png", "pillar-curated.png");       // ankh + eye
  await uploadAsset("/tmp/ggf_logos/2.png", "pillar-authenticated.png"); // AV seal
  await uploadAsset("/tmp/ggf_logos/1.png", "pillar-value.png");         // shield placeholder

  console.log("\n== Uploading COA company logos ==");
  await uploadAsset("/tmp/coa_companies/1.png", "coa-beckett.png");
  await uploadAsset("/tmp/coa_companies/2.png", "coa-psa.png");
  await uploadAsset("/tmp/coa_companies/3.png", "coa-jsa.png");
  await uploadAsset("/tmp/coa_companies/4.png", "coa-verisart.png");
  await uploadAsset("/tmp/coa_companies/5.png", "coa-zarelli.png");
  await uploadAsset("/tmp/coa_companies/6.png", "coa-truecoa.png");

  console.log("\n== Updating index.json ==");
  const a = await api("GET", `/themes/${THEME}/assets.json?asset%5Bkey%5D=templates/index.json`);
  const d = JSON.parse(a.asset.value);

  // Custom-liquid pillars (3 cards)
  const pillarsLiquid = `
<div style="padding:4rem 1rem;border-top:1px solid rgba(0,0,0,0.08);">
  <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:3rem;text-align:center;">
    <div>
      <img src="{{ 'pillar-curated.png' | asset_url }}" alt="Curated" style="width:110px;height:auto;margin:0 auto 1.25rem;">
      <h3 style="font-family:inherit;font-size:1.5rem;letter-spacing:0.05em;margin:0 0 0.75rem;">CURATED</h3>
      <p style="margin:0;opacity:0.8;">Every work chosen by hand — by an actual collector, for actual collectors.</p>
    </div>
    <div>
      <img src="{{ 'pillar-authenticated.png' | asset_url }}" alt="Authenticated" style="width:110px;height:auto;margin:0 auto 1.25rem;">
      <h3 style="font-family:inherit;font-size:1.5rem;letter-spacing:0.05em;margin:0 0 0.75rem;">AUTHENTICATED</h3>
      <p style="margin:0;opacity:0.8;">Each piece inspected, photographed, catalogued. Provenance documented.</p>
    </div>
    <div>
      <img src="{{ 'pillar-value.png' | asset_url }}" alt="Value" style="width:110px;height:auto;margin:0 auto 1.25rem;">
      <h3 style="font-family:inherit;font-size:1.5rem;letter-spacing:0.05em;margin:0 0 0.75rem;">VALUE</h3>
      <p style="margin:0;opacity:0.8;">Sourced at the right moment. Priced with the market, not against it.</p>
    </div>
  </div>
</div>
`.trim();

  // Custom-liquid logo row (6 logos, grayscale-by-default)
  const logosLiquid = `
<div style="padding:3rem 1rem;border-top:1px solid rgba(0,0,0,0.08);">
  <div style="max-width:1200px;margin:0 auto;text-align:center;">
    <h3 style="font-family:inherit;font-size:1rem;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 2rem;opacity:0.7;">Authentication solutions</h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:2.5rem;align-items:center;justify-items:center;">
      <img src="{{ 'coa-beckett.png'  | asset_url }}" alt="Beckett Authentication Services"    style="max-width:110px;max-height:70px;object-fit:contain;filter:grayscale(100%);opacity:0.75;transition:all 0.3s;" onmouseover="this.style.filter='grayscale(0%)';this.style.opacity='1';" onmouseout="this.style.filter='grayscale(100%)';this.style.opacity='0.75';">
      <img src="{{ 'coa-psa.png'       | asset_url }}" alt="PSA"                                style="max-width:110px;max-height:70px;object-fit:contain;filter:grayscale(100%);opacity:0.75;transition:all 0.3s;" onmouseover="this.style.filter='grayscale(0%)';this.style.opacity='1';" onmouseout="this.style.filter='grayscale(100%)';this.style.opacity='0.75';">
      <img src="{{ 'coa-jsa.png'       | asset_url }}" alt="JSA James Spence Authentication"    style="max-width:110px;max-height:70px;object-fit:contain;filter:grayscale(100%);opacity:0.75;transition:all 0.3s;" onmouseover="this.style.filter='grayscale(0%)';this.style.opacity='1';" onmouseout="this.style.filter='grayscale(100%)';this.style.opacity='0.75';">
      <img src="{{ 'coa-verisart.png'  | asset_url }}" alt="Verisart"                           style="max-width:110px;max-height:70px;object-fit:contain;filter:grayscale(100%);opacity:0.75;transition:all 0.3s;" onmouseover="this.style.filter='grayscale(0%)';this.style.opacity='1';" onmouseout="this.style.filter='grayscale(100%)';this.style.opacity='0.75';">
      <img src="{{ 'coa-zarelli.png'   | asset_url }}" alt="Zarelli Space Authentication"       style="max-width:110px;max-height:70px;object-fit:contain;filter:grayscale(100%);opacity:0.75;transition:all 0.3s;" onmouseover="this.style.filter='grayscale(0%)';this.style.opacity='1';" onmouseout="this.style.filter='grayscale(100%)';this.style.opacity='0.75';">
      <img src="{{ 'coa-truecoa.png'   | asset_url }}" alt="TrueCOA"                            style="max-width:110px;max-height:70px;object-fit:contain;filter:grayscale(100%);opacity:0.75;transition:all 0.3s;" onmouseover="this.style.filter='grayscale(0%)';this.style.opacity='1';" onmouseout="this.style.filter='grayscale(100%)';this.style.opacity='0.75';">
    </div>
  </div>
</div>
`.trim();

  // Replace text-columns with custom pillars
  d.sections["text-columns"] = {
    type: "custom-liquid",
    settings: {
      custom_liquid: pillarsLiquid,
      color_scheme: "",
      space_above: 0,
      space_below: 0,
    },
  };

  // Replace logo-list with custom logo strip
  d.sections["logo-list"] = {
    type: "custom-liquid",
    settings: {
      custom_liquid: logosLiquid,
      color_scheme: "",
      space_above: 0,
      space_below: 0,
    },
  };

  const r = await api("PUT", `/themes/${THEME}/assets.json`, {
    asset: { key: "templates/index.json", value: JSON.stringify(d, null, 2) },
  });
  console.log(`✓ index.json pushed. updated_at=${r.asset.updated_at}`);
})().catch(e => { console.error("✗", e.message); process.exit(1); });

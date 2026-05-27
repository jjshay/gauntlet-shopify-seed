#!/usr/bin/env node
// Update Exhibit theme home template with Gauntlet Gallery copy.
// Preserves all layout/style settings — only modifies text content, CTAs, and collection targets.
// Usage: SHOPIFY_TOKEN=shpat_xxx node update_home.js [--dry-run]

const STORE = "gauntletgallery.myshopify.com";
const API_V = "2024-10";
const THEME = 149213806727;
const TOKEN = process.env.SHOPIFY_TOKEN;
const DRY = process.argv.includes("--dry-run");
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

(async () => {
  const asset = await api("GET", `/themes/${THEME}/assets.json?asset%5Bkey%5D=templates/index.json`);
  const doc = JSON.parse(asset.asset.value);

  const set = (sectionId, updates) => {
    const s = doc.sections[sectionId];
    if (!s) { console.warn(`  ! missing section ${sectionId}`); return; }
    s.settings = { ...s.settings, ...updates };
  };

  // 1. Top featured collection
  set("featured-collection", {
    title: "New",
    collection: "all",
    products_to_show: 12,
    show_view_all: true,
  });

  // 2. Editorial note (feature-text)
  set("feature-text", {
    richtext: "<p>Every work in the gallery is sourced, inspected, and catalogued by hand. We collect the artists we believe in — the ones shaping visual culture now and defining what collectors will be chasing a decade from today. Nothing in the gallery is filler.</p>",
    cta_label: "View the collection",
  });

  // 3. Four-column pillars
  const tc = doc.sections["text-columns"];
  if (tc?.blocks) {
    const cols = [
      { title: "Curated",       text: "<p>Every work chosen by hand — by an actual collector, for actual collectors.</p>" },
      { title: "Authenticated", text: "<p>Each piece inspected, photographed, catalogued. Provenance documented.</p>" },
      { title: "Contemporary",  text: "<p>Fairey, KAWS, Banksy, BE@RBRICK, Death NYC. The voices defining the moment.</p>" },
      { title: "Protected",     text: "<p>Fully insured. Archival tubes, custom foam crates. Tracked, signed, delivered.</p>" },
    ];
    const ids = tc.block_order || Object.keys(tc.blocks);
    ids.slice(0, cols.length).forEach((id, i) => {
      tc.blocks[id].settings = { ...tc.blocks[id].settings, ...cols[i] };
    });
  }

  // 4. Shop by artist
  set("collection-list", { title: "Artists" });

  // 5. First carousel → Shepard Fairey featured
  set("collection-carousel", {
    title: "Shepard Fairey",
    collection: "shepard-fairey",
    products_to_show: 8,
    show_view_all: true,
  });

  // 6. Scrolling marquee → tagline
  set("scrolling-text", {
    text: "Contemporary prints · Collected with intent · Authenticated by hand · ",
    repeat_text: true,
  });

  // 7. Media-with-text-overlay → KAWS call-out block
  set("media-with-text-overlay", {
    title: "KAWS",
    richtext: "<p>Companion. BFF. Open Editions. Some of the most recognized sculptural works of the 21st century.</p>",
    cta_label: "Shop KAWS",
  });
  // CTA link lives on the block sometimes; safe to also add as setting if theme honors it
  if (doc.sections["media-with-text-overlay"]) {
    doc.sections["media-with-text-overlay"].settings.cta_link = "/collections/kaws";
  }

  // 8. Second carousel → BE@RBRICK
  set("collection-carousel-2", {
    title: "BE@RBRICK",
    collection: "bearbrick",
    products_to_show: 6,
    show_view_all: true,
  });

  // 9. Blog posts gallery
  set("blog-posts-gallery", { title: "Journal" });

  // 10. Logo list
  set("logo-list", { title: "Press" });

  // 11. Newsletter
  set("newsletter", {
    title: "Join the list",
    richtext: "<p>New arrivals, artist features, and first access to select works. No noise.</p>",
  });

  const newValue = JSON.stringify(doc, null, 2);
  console.log(`Prepared update: ${newValue.length} bytes`);
  if (DRY) {
    console.log("\n-- DRY RUN — changes NOT pushed --");
    return;
  }

  const put = await api("PUT", `/themes/${THEME}/assets.json`, {
    asset: { key: "templates/index.json", value: newValue },
  });
  console.log(`✓ Pushed. updated_at=${put.asset.updated_at} checksum=${put.asset.checksum}`);
})().catch(e => { console.error("✗", e.message); process.exit(1); });

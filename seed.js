#!/usr/bin/env node
// Gauntlet Gallery Shopify seeder — idempotent Pages + Custom Collections push.
// Usage: SHOPIFY_TOKEN=shpat_xxx node seed.js [--dry-run]

const STORE = "gauntletgallery.myshopify.com";
const API = "2024-10";
const TOKEN = process.env.SHOPIFY_TOKEN;
const DRY = process.argv.includes("--dry-run");

if (!TOKEN) { console.error("Missing SHOPIFY_TOKEN env var"); process.exit(1); }

const api = async (method, path, body) => {
  const res = await fetch(`https://${STORE}/admin/api/${API}${path}`, {
    method,
    headers: {
      "X-Shopify-Access-Token": TOKEN,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await res.text();
  let data; try { data = JSON.parse(txt); } catch { data = txt; }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${txt}`);
  return data;
};

const PAGES = [
  {
    handle: "about",
    title: "About",
    body_html: `
<h2>Our Point of View</h2>
<p>Gauntlet Gallery is a private collection turned public. What began as one collector's pursuit of the artists redefining contemporary visual culture — Shepard Fairey, KAWS, Banksy, BE@RBRICK, Death NYC, Mr. Brainwash, D*Face — has grown into a working gallery serving fellow collectors, designers, and first-time buyers alike.</p>
<p>We believe the most interesting art of the last twenty years came out of the street, the skate shop, and the screen-printing studio — not the auction house. That conviction shapes what we collect. Every work we list has been chosen because it represents something specific about its moment: a political stance, a visual breakthrough, a cultural shift worth owning a piece of.</p>

<h2>How We Source</h2>
<p>Works are acquired through direct relationships with artists and studios, estate sales, and long-standing collector networks. Each piece is inspected, photographed, and catalogued in-house before it reaches the gallery. We do not list works we would not hang on our own walls.</p>

<h2>Who We Serve</h2>
<ul>
  <li><strong>First-time collectors</strong> looking for a guided entry point into contemporary prints</li>
  <li><strong>Seasoned collectors</strong> hunting specific editions, artist proofs, or rarities</li>
  <li><strong>Interior designers and galleries</strong> sourcing statement works for clients</li>
</ul>

<h2>Get in Touch</h2>
<p>Looking for something specific? We maintain an active want-list for clients seeking particular works, editions, or artists. <a href="/pages/contact">Contact us</a>.</p>
`.trim(),
    meta_title: "About — Gauntlet Gallery",
    meta_description: "Gauntlet Gallery is a curated collection of contemporary prints from Shepard Fairey, KAWS, Banksy, and other defining voices of street and pop art.",
  },
  {
    handle: "shipping-returns",
    title: "Shipping & Returns",
    body_html: `
<h2>Shipping</h2>
<p>All works ship fully insured for their declared value. Prints are rolled in heavy-duty archival tubes or flat-packed between acid-free boards depending on size and condition. Sculptural works and figures ship in custom-cut foam inside double-walled crates.</p>
<ul>
  <li><strong>Domestic (US):</strong> Ships within 2 business days. Delivery 3–7 business days via FedEx or UPS Ground.</li>
  <li><strong>International:</strong> Ships within 5 business days. Delivery 7–21 business days depending on destination and customs. Buyer is responsible for import duties and VAT.</li>
  <li><strong>Tracking:</strong> Provided for every order.</li>
  <li><strong>Signature required:</strong> On all orders over $500.</li>
</ul>

<h2>Returns</h2>
<p>We want you to be certain about every work you bring into your collection. If a piece arrives and it is not what you expected, contact us within <strong>7 days of delivery</strong> to initiate a return.</p>
<ul>
  <li>Works must be returned in original packaging and condition.</li>
  <li>Buyer is responsible for return shipping and insurance.</li>
  <li>Refund is issued within 5 business days of receiving the returned work.</li>
  <li>Custom-framed works and items marked <em>final sale</em> are non-returnable.</li>
</ul>

<h2>Damaged in Transit</h2>
<p>If a work arrives damaged, photograph the packaging and the piece before unpacking further, and email us within 48 hours. We will file the insurance claim and make it right.</p>
`.trim(),
    meta_title: "Shipping & Returns — Gauntlet Gallery",
    meta_description: "Fully insured shipping on every work. 7-day returns on most pieces. Read our full shipping and returns policy.",
  },
  {
    handle: "contact",
    title: "Contact",
    body_html: `
<p>Questions about a specific work, want-list requests, trade inquiries, or press — we respond to every message.</p>

<h2>Want-List</h2>
<p>Looking for a specific edition, artist proof, or work not currently in the gallery? Tell us what you are hunting. We keep an active want-list for clients and reach out when matching works come through.</p>

<h2>Trade &amp; Consignment</h2>
<p>We selectively consign and trade for the right works. If you have a piece you are considering releasing from your collection, send details and images and we will respond within 48 hours.</p>

<p><em>Use the contact form below, or email <a href="mailto:hi@gauntlet.gallery">hi@gauntlet.gallery</a>.</em></p>

{% if template contains 'contact' %}{% else %}
<p><strong>Note:</strong> To enable the contact form, set this page's template to <code>page.contact</code> in the Shopify admin.</p>
{% endif %}
`.trim(),
    template_suffix: "contact",
    meta_title: "Contact — Gauntlet Gallery",
    meta_description: "Questions, want-list requests, or trade inquiries — we respond to every message. Contact Gauntlet Gallery.",
  },
];

const COLLECTIONS = [
  {
    handle: "shepard-fairey",
    title: "Shepard Fairey",
    body_html: `
<p>Shepard Fairey's work turned the politics of the street into the visual language of a generation. From the OBEY campaign to the "Hope" portrait that defined the 2008 election, Fairey has built one of the most recognizable bodies of work in contemporary art — grounded in propaganda tradition, sharpened by punk, and executed with obsessive craft.</p>
<p>Our Fairey collection includes signed and numbered editions, artist proofs, and rarities from across his catalogue.</p>
`.trim(),
    meta_title: "Shepard Fairey Prints — Signed & Numbered Editions | Gauntlet Gallery",
    meta_description: "Signed and numbered Shepard Fairey prints, artist proofs, and OBEY editions. Curated and authenticated by Gauntlet Gallery.",
  },
  {
    handle: "kaws",
    title: "KAWS",
    body_html: `
<p>Brian Donnelly — KAWS — took the visual vocabulary of cartoons and rebuilt it as a language for grief, tenderness, and the contradictions of consumer culture. His Companion and BFF figures have become some of the most recognized sculptural works of the twenty-first century; his prints have redefined what editioned work can mean in the secondary market.</p>
<p>This collection features KAWS figures, prints, and Open Edition works.</p>
`.trim(),
    meta_title: "KAWS Figures & Prints — Companion, BFF, Open Edition | Gauntlet Gallery",
    meta_description: "Authentic KAWS Companion figures, BFF sculptures, and signed prints. Sourced and inspected by Gauntlet Gallery.",
  },
  {
    handle: "bearbrick",
    title: "BE@RBRICK",
    body_html: `
<p>BE@RBRICK is Medicom Toy's collaborative canvas — a simple bear silhouette that has hosted the work of virtually every defining artist and brand of the last two decades, from Basquiat and Warhol estates to KAWS, Daniel Arsham, and Chanel. Produced in sizes from 100% to 1000%, each release becomes an object record of a cultural moment.</p>
<p>Our BE@RBRICK collection spans collaborations, archival releases, and current drops.</p>
`.trim(),
    meta_title: "BE@RBRICK Collectibles — 100%, 400%, 1000% | Gauntlet Gallery",
    meta_description: "Authentic BE@RBRICK figures from Medicom Toy — KAWS, Basquiat, Warhol, Arsham collaborations and more. Curated by Gauntlet Gallery.",
  },
  {
    handle: "banksy",
    title: "Banksy",
    body_html: `
<p>No artist has done more to collapse the distance between the street and the auction house than Banksy. Working anonymously since the late 1990s, Banksy has used stencil, print, installation, and public spectacle to interrogate power, war, commerce, and the art market itself — often all at once.</p>
<p>Works listed here are accompanied by provenance documentation appropriate to each piece.</p>
`.trim(),
    meta_title: "Banksy Prints & Works — Gauntlet Gallery",
    meta_description: "Banksy prints and works with documented provenance. Curated and inspected by Gauntlet Gallery.",
  },
  {
    handle: "death-nyc",
    title: "Death NYC",
    body_html: `
<p>Death NYC is the anonymous New York street artist whose mashup aesthetic — Warhol's Marilyn meets Louis Vuitton meets Disney meets Banksy — has become one of the most collected pop-conceptual practices of the last decade. Each signed and numbered print is a one-day edition: printed, dated, released, retired.</p>
`.trim(),
    meta_title: "Death NYC Signed Prints — One-Day Editions | Gauntlet Gallery",
    meta_description: "Signed and numbered Death NYC prints. One-day editions from the anonymous NYC street artist. Curated by Gauntlet Gallery.",
  },
];

const setSeoMetafields = async (ownerType, ownerId, metaTitle, metaDesc) => {
  const mf = [
    { namespace: "global", key: "title_tag",       type: "single_line_text_field", value: metaTitle },
    { namespace: "global", key: "description_tag", type: "single_line_text_field", value: metaDesc  },
  ];
  const path = ownerType === "page"
    ? `/pages/${ownerId}/metafields.json`
    : `/collections/${ownerId}/metafields.json`;
  for (const m of mf) {
    if (DRY) { console.log(`  [dry] metafield ${m.key}=${m.value.slice(0,40)}…`); continue; }
    await api("POST", path, { metafield: m }).catch(async e => {
      // If exists, update via list + PUT
      const list = await api("GET", path);
      const existing = list.metafields.find(x => x.namespace === m.namespace && x.key === m.key);
      if (existing) await api("PUT", `/metafields/${existing.id}.json`, { metafield: { id: existing.id, value: m.value, type: m.type } });
      else throw e;
    });
  }
};

const upsertPage = async (p) => {
  const list = await api("GET", `/pages.json?handle=${p.handle}`);
  const existing = list.pages[0];
  const payload = {
    page: {
      title: p.title,
      handle: p.handle,
      body_html: p.body_html,
      published: true,
      ...(p.template_suffix ? { template_suffix: p.template_suffix } : {}),
    },
  };
  if (existing) {
    console.log(`↻ Page "${p.title}" exists (id ${existing.id}) — updating`);
    if (!DRY) await api("PUT", `/pages/${existing.id}.json`, { page: { id: existing.id, ...payload.page } });
    if (!DRY) await setSeoMetafields("page", existing.id, p.meta_title, p.meta_description);
    return existing.id;
  } else {
    console.log(`+ Page "${p.title}" — creating`);
    if (DRY) return null;
    const res = await api("POST", `/pages.json`, payload);
    await setSeoMetafields("page", res.page.id, p.meta_title, p.meta_description);
    return res.page.id;
  }
};

const upsertCollection = async (c) => {
  const list = await api("GET", `/custom_collections.json?handle=${c.handle}`);
  const existing = list.custom_collections[0];
  const payload = {
    custom_collection: {
      title: c.title,
      handle: c.handle,
      body_html: c.body_html,
      published: true,
    },
  };
  if (existing) {
    console.log(`↻ Collection "${c.title}" exists (id ${existing.id}) — updating`);
    if (!DRY) await api("PUT", `/custom_collections/${existing.id}.json`, { custom_collection: { id: existing.id, ...payload.custom_collection } });
    if (!DRY) await setSeoMetafields("collection", existing.id, c.meta_title, c.meta_description);
    return existing.id;
  } else {
    console.log(`+ Collection "${c.title}" — creating`);
    if (DRY) return null;
    const res = await api("POST", `/custom_collections.json`, payload);
    await setSeoMetafields("collection", res.custom_collection.id, c.meta_title, c.meta_description);
    return res.custom_collection.id;
  }
};

(async () => {
  console.log(`→ Seeding ${STORE} ${DRY ? "(DRY RUN)" : ""}\n`);
  console.log("== Pages ==");
  for (const p of PAGES) await upsertPage(p);
  console.log("\n== Collections ==");
  for (const c of COLLECTIONS) await upsertCollection(c);
  console.log("\n✓ Done.");
})().catch(e => { console.error("✗", e.message); process.exit(1); });

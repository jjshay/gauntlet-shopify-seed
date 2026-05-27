#!/usr/bin/env node
// Gauntlet Gallery — SEO blog post batch creator
// Usage: node create_seo_blogs.js
// Pushes 6 keyword-targeted articles to the Editorial blog, backdated 2x/week

const https = require("https");

const TOKEN = process.env.SHOPIFY_TOKEN;
const STORE = "gauntletgallery.myshopify.com";
const BLOG_ID = 96062439559;

function shopifyPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: STORE,
      path,
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": TOKEN,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error("Parse error: " + raw.slice(0, 200))); }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

const POSTS = [
  // ── 1. buy original paintings ── May 22
  {
    title: "Buy Original Paintings: The Collector's Complete Guide",
    handle: "buy-original-paintings-collectors-guide",
    published_at: "2026-05-22T09:00:00-07:00",
    tags: "buying-guide, original-paintings, collecting-guide, art-investment, beginner",
    summary_html: "Everything you need to know before you buy original paintings — from verifying authenticity to understanding market pricing, caring for your investment, and building a collection with staying power.",
    image_src: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&q=80",
    body_html: `
<p>There has never been a better time to <strong>buy original paintings</strong>. The secondary market for contemporary works has expanded dramatically over the past decade, digital discovery tools have eliminated gatekeepers, and a new generation of collectors is driving prices across every category — from street art to neo-expressionism to old masters. But "better time to buy" does not mean "easier to buy well." For every straightforward acquisition, there are pitfalls — misdated works, misattributed signatures, inflated certificates, and galleries with no accountability. This guide gives you the framework to navigate all of it.</p>

<h2>What Makes a Painting "Original"?</h2>
<p>The word "original" is one of the most abused terms in the art market. When serious collectors and auction houses use it, they mean a one-of-a-kind work — painted by the artist's own hand, not reproduced mechanically. This is distinct from:</p>
<ul>
  <li><strong>Prints:</strong> Editioned works, even those signed and numbered by the artist, are reproductions of an original composition.</li>
  <li><strong>Giclée prints:</strong> High-quality inkjet reproductions sold as "art" by many online retailers. Not original paintings.</li>
  <li><strong>Copies and studies:</strong> A painter who makes multiple versions of the same composition — each painted by hand — may call each one an original, but only one is typically the primary work.</li>
  <li><strong>Collaborative works:</strong> Works produced by studio assistants under an artist's direction occupy a grey area that the market treats inconsistently.</li>
</ul>
<p>When you buy original paintings at Gauntlet Gallery, you receive a work painted directly by the artist with physical media on a substrate (canvas, board, paper). No exceptions.</p>

<h2>Where to Buy Original Paintings</h2>
<p>The venue matters as much as the work. Here is how the main channels stack up:</p>
<h3>Private Galleries (Physical and Online)</h3>
<p>Established galleries carry reputational risk that creates accountability. They have existing relationships with artists or estates, they document provenance, and they typically stand behind their sales with return policies. The trade-off is markup — gallery prices include overhead, curation, and relationship value.</p>
<p>At <a href="https://gauntlet.gallery">Gauntlet Gallery</a>, every original painting passes through hands-on authentication before listing. We inspect condition, document medium and dimensions, photograph under raking light for texture and brushwork analysis, and obtain written provenance wherever available.</p>
<h3>Auction Houses</h3>
<p>The major houses — Christie's, Sotheby's, Phillips, Bonhams — provide strong provenance chains and independent condition reports. The buyer's premium (typically 15–25% on top of hammer price) makes them expensive. Regional auction houses carry more risk but often surface undervalued works.</p>
<h3>Artist Studios and Direct Sales</h3>
<p>Buying directly from a living artist eliminates intermediary markup and typically guarantees provenance — you bought it from the person who made it. The challenge is discovery: finding the right artists and accessing them directly requires network and time.</p>
<h3>Online Marketplaces</h3>
<p>Platforms like Saatchi Art, Artsy, and 1stDibs aggregate works from galleries and independent sellers. Quality controls vary dramatically. Read return policies carefully and vet any gallery you have not heard of before purchasing.</p>

<h2>How to Evaluate a Painting Before You Buy</h2>
<p>Whether you are buying in person or online, the evaluation process should cover five dimensions:</p>
<h3>Condition</h3>
<p>Inspect for cracking, flaking, yellowing varnish, in-painting (retouching of previous damage), and canvas deformation. Request high-resolution photographs under raking (side) light, which reveals texture, impasto, and areas of restoration not visible under normal lighting. For works valued above $5,000, commission an independent condition report from a conservator.</p>
<h3>Provenance</h3>
<p>Provenance is the documented ownership history of a work. Strong provenance — ideally tracing the work directly from the artist's studio through each owner to the present — dramatically reduces forgery risk and increases resale value. Ask for all available documentation: purchase receipts, exhibition records, auction catalogue entries, gallery correspondence.</p>
<h3>Attribution</h3>
<p>For established artists, attribution means confirming the work is genuinely by the hand of the named artist. This is where authentication bodies and catalogue raisonnés (comprehensive records of an artist's output) become essential. For living artists, a signed certificate of authenticity from the artist directly is the gold standard.</p>
<h3>Medium and Technique</h3>
<p>Understanding what you are buying — oil on canvas, acrylic on linen, mixed media on board — affects long-term care requirements and market positioning. Oil paintings on canvas are the most liquid market segment. Mixed media works may command premiums if the artist is known for that approach, or discounts if condition is harder to maintain.</p>
<h3>Market Comparables</h3>
<p>Before paying any price, research what comparable works by the same artist have sold for at auction. Artnet Price Database and MutualArt provide searchable auction records. If the asking price is significantly above recent comparables, you need a strong reason — otherwise wait or negotiate.</p>

<h2>Prices to Expect When You Buy Original Paintings</h2>
<p>The range for original paintings is genuinely enormous — from a few hundred dollars for emerging artists to hundreds of millions for blue-chip masters. For collectors focused on contemporary and street art (the Gauntlet Gallery sweet spot), here are realistic benchmarks:</p>
<ul>
  <li><strong>Emerging artists (no auction record):</strong> $500–$5,000. High risk, potentially high reward. Buy because you love the work.</li>
  <li><strong>Mid-career artists with growing records:</strong> $5,000–$50,000. Where most serious collectors build holdings.</li>
  <li><strong>Established contemporary names (Fairey, KAWS, Death NYC):</strong> $10,000–$500,000 for unique works, depending on scale and period.</li>
  <li><strong>Blue-chip historical artists:</strong> $100,000 and up. Requires specialist expertise or trusted gallery relationships.</li>
</ul>
<p>These ranges assume works are properly authenticated and documented. Unverified works should trade at significant discounts — or not at all.</p>

<h2>Authenticating Your Purchase</h2>
<p>Authentication is not optional. Every original painting purchase should come with at minimum a certificate of authenticity from the gallery or artist, and ideally additional supporting documentation. For higher-value works, third-party authentication from a recognized body is worth the cost — typically 1–3% of the work's value.</p>
<p>At Gauntlet Gallery, every original painting comes with our gallery certificate of authenticity documenting the artist, title, medium, dimensions, year, edition status, and our authentication findings. Works by artists with established authentication bodies (such as Shepard Fairey's studio for signed works) come with additional primary documentation.</p>

<h2>Caring for Original Paintings</h2>
<p>A painting is a long-term physical object that requires active stewardship:</p>
<ul>
  <li><strong>Light:</strong> UV exposure is the primary enemy of pigment stability. Hang works away from direct sunlight or use UV-filtering glass/acrylic for framed works.</li>
  <li><strong>Humidity and temperature:</strong> Ideal conditions are 45–55% relative humidity and 65–70°F (18–21°C). Avoid exterior walls, kitchens, and bathrooms.</li>
  <li><strong>Cleaning:</strong> Never attempt to clean a painting yourself. Even dusting incorrectly can damage fragile surfaces. Consult a conservator.</li>
  <li><strong>Insurance:</strong> Scheduled fine art insurance (not homeowner's contents coverage) is essential for works above $5,000. Document everything for your insurer: provenance, condition reports, photographs, receipts.</li>
</ul>

<h2>Building a Collection Around Original Paintings</h2>
<p>The best collections have a point of view. Whether you collect by medium (painting only), by movement (street art, neo-expressionism, pop), by geography (West Coast artists, Japanese contemporary), or by price bracket (works under $25,000), a coherent thesis makes a collection greater than the sum of its parts — and more interesting to future buyers if you ever sell.</p>
<p>Start with one category you know. Build relationships with galleries and artists in that space. Buy works you would be happy to own regardless of what happens to the market. The collectors who have done best over the past two decades were not chasing investment performance — they were building something they cared about, and the market eventually came to them.</p>
<p>Browse the current selection of <a href="https://gauntlet.gallery/collections/all">original works at Gauntlet Gallery</a> or <a href="https://gauntlet.gallery/pages/contact">contact us</a> with your want-list.</p>`.trim(),
  },

  // ── 2. authenticity certificates ── May 19
  {
    title: "Art Authenticity Certificates: What Every Collector Needs to Know",
    handle: "art-authenticity-certificates-guide",
    published_at: "2026-05-19T09:00:00-07:00",
    tags: "authentication, coa, provenance, collecting-guide, art-investment",
    summary_html: "Authenticity certificates are the foundation of serious art collecting — but not all certificates are created equal. Here is how to read them, what they must include, and when to demand more.",
    image_src: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&q=80",
    body_html: `
<p>In every serious art transaction, one document does more work than any other: the certificate of authenticity. <strong>Authenticity certificates</strong> establish that a work is what it is claimed to be — made by the claimed artist, in the claimed year, in the claimed edition. They are the foundation of the entire provenance chain. And yet the art market is full of collectors who have paid significant money for works with certificates that are legally worthless.</p>

<h2>What Is an Authenticity Certificate?</h2>
<p>An authenticity certificate (COA) is a document — physical or digital — that attests to the genuineness of an artwork. At minimum, it records the artist, title, medium, dimensions, date, and edition information (for editioned works) and is signed by a party with authority to make that attestation: the artist, the artist's estate, the original publisher, or an accredited authentication body.</p>
<p>Critically, a COA is only as credible as the entity issuing it. A gallery-issued certificate with no other supporting documentation carries far less weight than a certificate signed by the artist themselves, or one issued by a recognized authentication foundation with a defined evaluation methodology.</p>

<h2>Types of Art Authentication</h2>
<h3>Artist-Signed Certificate</h3>
<p>The gold standard for living artists. If the artist signed the certificate themselves — not just the work — that is the strongest possible authentication for a contemporary piece.</p>
<h3>Publisher or Printer Certificate</h3>
<p>For editioned prints, the original publisher or print workshop that produced the work is the authoritative source. Artist-signed certificates from studios like Shepard Fairey's OBEY Giant apply the same principle — primary-source documentation from the point of production.</p>
<h3>Gallery Certificate</h3>
<p>A certificate issued by the gallery that sold the work is a standard component of any sale. It should record all identifying information and be signed by a named representative of the gallery. Gallery certificates are necessary but not always sufficient on their own.</p>
<h3>Third-Party Authentication</h3>
<p>For works where primary documentation is unavailable or in doubt, third-party authentication bodies provide independent analysis. In the sports and entertainment memorabilia space, Beckett Authentication Services (BAS), Professional Sports Authenticator (PSA), and James Spence Authentication (JSA) are the recognized standards.</p>
<h3>Blockchain and Digital Authentication</h3>
<p>A growing number of galleries and authentication services are recording COA data on public blockchains — creating an immutable, publicly verifiable record. Gauntlet Gallery uses blockchain verification for select works via our <a href="https://truecoa.com">TrueCOA platform</a>, built on Polygon with QR-linked digital certificates.</p>

<h2>What a Proper Authenticity Certificate Must Include</h2>
<ul>
  <li><strong>Artist full name</strong></li>
  <li><strong>Title of the work</strong></li>
  <li><strong>Year created</strong></li>
  <li><strong>Medium and support</strong> (oil on canvas, screenprint on paper, etc.)</li>
  <li><strong>Dimensions</strong> in standardized units</li>
  <li><strong>Edition information</strong> for editioned works (e.g., 42/150, AP 3/10)</li>
  <li><strong>Unique identifier or catalogue number</strong></li>
  <li><strong>Issuing party's full name and contact information</strong></li>
  <li><strong>Signature of the issuing authority</strong></li>
  <li><strong>Date of issue</strong></li>
  <li><strong>Photograph of the work</strong> (front and back)</li>
</ul>

<h2>Red Flags: When Certificates Cannot Be Trusted</h2>
<ul>
  <li><strong>Self-issued certificates:</strong> A seller certifying their own work is a conflict of interest, not authentication.</li>
  <li><strong>Anonymous issuing bodies:</strong> Look up any organization named on the certificate. Many are shells with no methodology.</li>
  <li><strong>Missing contact information:</strong> A legitimate issuer wants future buyers to be able to verify. No contact info = no accountability.</li>
  <li><strong>Vague descriptions:</strong> "Oil painting, approximately 24x36 inches, circa 1990s" is description, not authentication.</li>
  <li><strong>No photograph:</strong> Without a photograph, the certificate cannot be reliably linked to the specific work.</li>
  <li><strong>Certificates for deceased blue-chip artists:</strong> Anyone can print a certificate. The only credible authentication for works by deceased artists comes from recognized foundations or major auction specialists.</li>
</ul>

<h2>Major Authentication Bodies by Category</h2>
<h3>Sports Memorabilia</h3>
<p>Beckett Authentication Services, PSA/DNA, and JSA are the three market-recognized US standards. Gauntlet Gallery requires at least one of these for all signed sports memorabilia.</p>
<h3>Contemporary Street and Pop Art</h3>
<p>Artist studio certificates are primary. For Banksy, Pest Control is the only recognized authentication body — there is no substitute. For KAWS, OneCOA provides blockchain-verified authentication. For Shepard Fairey, his studio issues certificates directly.</p>

<h2>What Authenticity Certificates Mean for Value</h2>
<p>Properly documented works consistently outperform undocumented works at auction. The premium varies — for high-volume artists like Fairey or Banksy, the difference between a work with full primary documentation and one with questionable documentation can be 40–60% of sale price.</p>
<p>Every work at Gauntlet Gallery ships with comprehensive documentation. <a href="https://gauntlet.gallery/pages/contact">Contact us</a> for questions about authentication for specific works or artists.</p>`.trim(),
  },

  // ── 3. buy original artwork ── May 15
  {
    title: "How to Buy Original Artwork Online (Without Getting Burned)",
    handle: "how-to-buy-original-artwork-online",
    published_at: "2026-05-15T09:00:00-07:00",
    tags: "buying-guide, original-artwork, beginner, collecting-guide, authentication",
    summary_html: "A practical, no-nonsense guide to buying original artwork — what to look for, what to avoid, how to verify authenticity, and how to get the best price without compromising on quality.",
    image_src: "https://images.unsplash.com/photo-1578321272125-c80c9a438468?w=1200&q=80",
    body_html: `
<p>The decision to <strong>buy original artwork</strong> is one of the most rewarding a collector can make — and one of the easiest to get wrong. The art market runs on trust, expertise, and relationship in ways that most consumer markets do not. Without the right framework, even sophisticated buyers overpay, acquire fakes, or miss red flags that experts spot immediately.</p>

<h2>Step 1: Define What You Are Looking For</h2>
<p>Before you spend anything, know your criteria:</p>
<ul>
  <li><strong>Medium:</strong> Paintings, drawings, prints, sculpture, photography? Each category has different market dynamics, care requirements, and price ranges.</li>
  <li><strong>Artist profile:</strong> Living artists, established artists with auction records, or posthumous works? Higher artist recognition generally means lower risk and lower speculative upside.</li>
  <li><strong>Purpose:</strong> Collecting for aesthetic pleasure, investment, or both? Investment-focused collecting requires different diligence than collecting what you love.</li>
</ul>

<h2>Step 2: Establish Your Budget — and Add 20%</h2>
<p>Whatever number you have in mind, add 20% for: shipping and insurance (3–8% of value), framing if needed ($300–$1,500 archival), independent condition reports for higher-value pieces, <a href="https://gauntlet.gallery/pages/customs">import duties</a> for international shipments, and annual art insurance (1–2% of value).</p>

<h2>Step 3: Research the Artist</h2>
<ul>
  <li><strong>Auction records:</strong> Search Artnet, MutualArt, or the major auction house databases. What have comparable works sold for?</li>
  <li><strong>Exhibition history:</strong> Artists with institutional exhibition records carry stronger market credibility.</li>
  <li><strong>Authentication infrastructure:</strong> Does the artist have a foundation, estate, or recognized catalogue raisonné?</li>
</ul>

<h2>Step 4: Vet the Seller</h2>
<ul>
  <li>Verifiable physical address and operational history</li>
  <li>Named individuals responsible for transactions</li>
  <li>Clear, written return policy (7–14 days minimum for original works)</li>
  <li>Membership in trade associations (ADAA, IFPDA, CINOA)</li>
</ul>
<p>Gauntlet Gallery has been sourcing and authenticating contemporary originals and prints since 2025 with a documented track record. Every transaction ships with full documentation and a clear return policy.</p>

<h2>Step 5: Examine the Documentation</h2>
<p>Request before committing to any purchase:</p>
<ol>
  <li>Certificate of authenticity (verify the issuing party's authority)</li>
  <li>Provenance documentation (previous owners, purchase receipts, exhibition history)</li>
  <li>Condition report (gallery or independent)</li>
  <li>High-resolution photography (front, back, signature detail, any condition issues)</li>
</ol>
<p>If a seller cannot provide all of these for an original work priced above $1,000, stop the transaction.</p>

<h2>Step 6: Negotiate</h2>
<p>The art market has real pricing flexibility. Once you have researched a work and have genuine interest, it is appropriate to ask about a collector's discount (typically 10–20%), shipping inclusion, or deferred payment terms. Frame it as relationship-building, not pure transacting.</p>

<h2>Step 7: Secure Shipping and Insurance</h2>
<ul>
  <li>Prints: rolled in acid-free tissue inside a rigid archival tube, or flat-packed between acid-free boards</li>
  <li>Paintings: double-boxed with custom foam that does not touch the painted surface</li>
  <li>All shipments: fully insured for declared value, not carrier replacement caps</li>
</ul>
<p>At Gauntlet Gallery, every original work ships fully insured with tracking and signature required on all orders above $500.</p>
<p>Browse authenticated original works at <a href="https://gauntlet.gallery/collections/all">Gauntlet Gallery</a>, or <a href="https://gauntlet.gallery/pages/contact">contact us</a> with your specific criteria and we will source on your behalf.</p>`.trim(),
  },

  // ── 4. exclusive art prints ── May 12
  {
    title: "Exclusive Art Prints: Why Limited Editions Command Premium Prices",
    handle: "exclusive-art-prints-limited-editions-guide",
    published_at: "2026-05-12T09:00:00-07:00",
    tags: "limited-editions, prints, editions, art-investment, collecting-guide, scarcity",
    summary_html: "Limited edition prints are one of the most dynamic segments of the contemporary art market. Here is what drives their value, which artists to follow, and how to build a print collection that holds its worth.",
    image_src: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&q=80",
    body_html: `
<p><strong>Exclusive art prints</strong> occupy a unique position in the collecting world: accessible enough for first-time collectors to enter, yet scarce enough to generate the kind of secondary market pressure that creates real investment returns. A Shepard Fairey screenprint from a 2008 edition of 350 that sold for $450 at release can now command $4,000–$8,000 at auction. Understanding what drives these outcomes is what separates informed collectors from lucky ones.</p>

<h2>What Makes a Print "Exclusive"?</h2>
<ul>
  <li><strong>Limited edition size:</strong> Fixed, documented quantity — no additional copies made. Each piece numbered (e.g., 42/150).</li>
  <li><strong>Artist signature:</strong> Hand-signed by the artist. A signed print trades at a substantial premium over unsigned examples from the same edition.</li>
  <li><strong>Artist proof (AP):</strong> A small number of impressions (typically 10–15% of the main edition) designated AP. These typically command 20–40% premiums.</li>
  <li><strong>Exclusive colorway or variant:</strong> Variant editions in smaller quantities often outperform the standard edition in secondary markets.</li>
</ul>

<h2>The Economics of Scarcity</h2>
<p>Art markets respond to supply and demand like any other market, but with a critical twist: supply is permanently fixed at the moment of production. Once a Banksy edition sells out, no new legitimate examples can be created. This static supply creates one-directional price pressure as demand grows — driven by rising artist profile, museum retrospectives, major auction records, or the simple passage of time reducing pristine examples in circulation.</p>

<h2>Edition Size and Market Value</h2>
<ul>
  <li><strong>Editions under 50:</strong> Highly scarce. Most aggressive appreciation, highest initial cost.</li>
  <li><strong>Editions 50–150:</strong> The sweet spot for most serious print collectors. Scarce enough for real secondary market tension; accessible enough to acquire.</li>
  <li><strong>Editions 150–500:</strong> Still meaningful scarcity for artists with large followings. Fairey's signature works often fall here.</li>
  <li><strong>Open editions:</strong> Works produced without a fixed cap. Not the norm for investment-grade prints, but KAWS has proven exceptions exist.</li>
</ul>

<h2>Key Artists in the Exclusive Print Market</h2>
<h3>Shepard Fairey</h3>
<p>One of the most liquid print markets in contemporary art. Fairey releases regular editions through his studio in series format, screenprinted to exacting standards. His print market has shown consistent appreciation over 20 years.</p>
<h3>Banksy</h3>
<p>The most actively traded contemporary prints on the market. Authentication is strictly controlled by Pest Control — no substitute. His iconic compositions consistently set records at Bonhams, Christie's, and Sotheby's.</p>
<h3>KAWS</h3>
<p>Print practice spanning open and limited editions, brand collaborations, and highly limited studio releases. His market has expanded dramatically since 2018, with works reaching auction prices that rival many blue-chip painters.</p>
<h3>Death NYC</h3>
<p>Limited editions (often 50–100) that have developed a serious collector following in Asia, Europe, and the US. Artist certificates ship directly with each work.</p>

<h2>Authenticating a Limited Edition Print</h2>
<ol>
  <li><strong>Edition numbering:</strong> Hand-written in pencil, matching known edition size documentation.</li>
  <li><strong>Artist signature:</strong> Compare against documented examples. Authentication bodies and auction specialists maintain signature reference files.</li>
  <li><strong>Certificate of authenticity:</strong> From artist, studio, original gallery, or recognized body — not a self-issued seller certificate.</li>
  <li><strong>Substrate and print technique:</strong> Fakes often get the printing technique wrong. Learn to identify screenprint, lithograph, and giclée by eye and touch.</li>
</ol>

<h2>Building an Investment-Grade Print Collection</h2>
<ul>
  <li><strong>Buy condition:</strong> Only purchase prints in documented, pristine condition. Fading, foxing, tears, or losses dramatically reduce market value.</li>
  <li><strong>Focus on signed examples:</strong> Within any edition, hand-signed examples command the market.</li>
  <li><strong>Store correctly:</strong> Flat or rolled (depending on format), acid-free, climate-controlled. UV exposure is the most common damage source.</li>
  <li><strong>Keep documentation:</strong> Never separate a print from its certificate and provenance records.</li>
</ul>
<p>Browse the current selection of <a href="https://gauntlet.gallery/collections/all">exclusive art prints at Gauntlet Gallery</a> — every work ships fully documented and insured.</p>`.trim(),
  },

  // ── 5. collectible art ── May 8
  {
    title: "Collectible Art: How to Build a Collection That Holds Its Value",
    handle: "collectible-art-building-a-collection",
    published_at: "2026-05-08T09:00:00-07:00",
    tags: "collectible art, collecting-guide, art-investment, portfolio-building, market-fundamentals",
    summary_html: "Not all art is collectible — and not all collectible art holds its value. This guide explains the mechanics of the collectible art market and the principles that separate serious collections from expensive decoration.",
    image_src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80",
    body_html: `
<p>The phrase <strong>collectible art</strong> gets used loosely — by galleries marketing mass-produced prints, by brands launching "limited" merchandise drops, by auction houses promoting works that may have more hype than history. Sorting signal from noise is the foundational skill of any serious art collector.</p>

<h2>What Qualifies as Collectible Art?</h2>
<p>Collectible art shares a set of common characteristics that distinguish it from decorative art:</p>
<ul>
  <li><strong>Documented scarcity:</strong> Fixed, verifiable quantity — unique originals, defined limited editions, or documented runs with no plans for reissue.</li>
  <li><strong>Artist identity and recognition:</strong> Clearly attributable to a specific artist who has or is developing market recognition.</li>
  <li><strong>Authentication infrastructure:</strong> A credible system for establishing genuineness — artist certification, estate, recognized authentication body, or blockchain-verified records.</li>
  <li><strong>Secondary market liquidity:</strong> Works change hands between parties other than the original gallery. Auction records, online marketplace sales, dealer activity.</li>
  <li><strong>Cultural significance:</strong> The most durable collectible art reflects a moment in culture, a shift in visual language, or a commentary on its time that remains relevant beyond the year of creation.</li>
</ul>

<h2>Decorative vs. Collectible Art</h2>
<p>Decorative art is chosen for aesthetic compatibility with a space. Collectible art is chosen for its place within a documented artist's practice, its market position, and its provenance. A mass-produced giclée with a seller-issued COA is decorative art, regardless of marketing. A hand-pulled screenprint, signed and numbered in an edition of 150, with primary-source authentication from the artist's studio, is collectible art — even if you also love the way it looks.</p>

<h2>Categories of Collectible Art</h2>
<h3>Contemporary Prints and Multiples</h3>
<p>The most accessible entry point. Limited edition screenprints, lithographs, and etchings by recognized artists provide a documented, authenticated, and liquid segment. Artists like Shepard Fairey, Banksy, KAWS, and Death NYC have built some of the most active print markets in contemporary art history.</p>
<h3>Unique Works on Paper</h3>
<p>Drawings, watercolors, gouaches, and mixed-media works on paper occupy a middle tier between prints and paintings — often more accessible than canvas works and sometimes undervalued relative to paintings by the same artist.</p>
<h3>Paintings</h3>
<p>The highest-profile segment. Unique, irreproducible, often the centerpiece of an artist's practice. For contemporary artists, paintings are where the serious collector money concentrates.</p>
<h3>Sculpture and Three-Dimensional Works</h3>
<p>KAWS Companion figures, BE@RBRICK collector editions, and street-art-adjacent sculpture have all developed strong collector bases and secondary markets.</p>
<h3>Sports and Entertainment Memorabilia</h3>
<p>A separately organized collectible market with its own authentication infrastructure (Beckett, PSA, JSA) and price dynamics driven by athlete performance and cultural resonance.</p>

<h2>What Drives Market Value for Collectible Art</h2>
<ul>
  <li><strong>Museum exhibitions and institutional recognition:</strong> A retrospective at MoMA, Tate, or the Whitney typically lifts secondary market prices across an artist's body of work.</li>
  <li><strong>Major auction results:</strong> A headline sale at Christie's, Sotheby's, or Phillips creates a new price benchmark and stimulates demand across the artist's full catalogue.</li>
  <li><strong>Cultural moments:</strong> Political upheaval, social movements, anniversaries, and deaths drive renewed interest in relevant artists. Fairey's market spiked during each major US election cycle.</li>
  <li><strong>Scarcity pressure:</strong> As edition inventory is absorbed by long-term collectors who do not sell, the available pool for new buyers shrinks. Early acquisition in an edition is almost always advantageous.</li>
  <li><strong>Cross-market appeal:</strong> Works that appeal across collecting communities — street art, skate culture, fashion, music — develop broader demand bases.</li>
</ul>

<h2>Risk Management for Art Collectors</h2>
<ul>
  <li>Diversify across artists — do not concentrate a collection in a single name</li>
  <li>Diversify across price points — mix established works with emerging acquisitions</li>
  <li>Never compromise on documentation — a work with questionable authentication is worth a fraction of a properly documented equivalent</li>
  <li>Insure properly — fine art scheduled insurance, updated annually with current appraisal</li>
  <li>Think in 5–10 year horizons — art is not a liquid asset</li>
</ul>

<h2>Where to Buy Collectible Art</h2>
<p>Work with sources that provide full documentation, clear return policies, and verifiable track records. Avoid anonymous online listings without provenance, sellers who cannot name their authentication sources, and platforms that conflate decorative and collectible art without distinction.</p>
<p>Gauntlet Gallery specializes in the collectible segment — editioned prints, unique works, sculpture, and authenticated memorabilia from artists with established secondary markets. Browse the <a href="https://gauntlet.gallery/collections/all">full collection</a> or <a href="https://gauntlet.gallery/pages/contact">contact us</a> with your collecting focus.</p>`.trim(),
  },

  // ── 6. online art buyers ── May 5
  {
    title: "The Online Art Buyer's Handbook: How to Navigate the Digital Art Market",
    handle: "online-art-buyers-guide",
    published_at: "2026-05-05T09:00:00-07:00",
    tags: "buying-guide, online-art, beginner, collecting-guide, provenance, due-diligence",
    summary_html: "Online art buying has exploded — and so has online art fraud. This handbook gives online art buyers the tools to buy confidently, verify legitimacy, and build a collection without leaving home.",
    image_src: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1200&q=80",
    body_html: `
<p>The online art market crossed $13 billion in 2024 and continues to grow at double-digit rates. <strong>Online art buyers</strong> now represent the primary growth segment for everything from emerging artist prints to seven-figure auction lots. The convenience is real, the selection is unprecedented, and the access to global markets is now a browser tab away.</p>
<p>The risks are equally real. The same anonymity and scale that make online art markets exciting also make them a target for fraud, misrepresentation, and low-quality goods dressed up with marketing language. This handbook gives you the framework to navigate the digital art market with confidence.</p>

<h2>Why Online Art Buying Has Exploded</h2>
<ul>
  <li><strong>Photography technology:</strong> High-resolution images and raking-light photography now convey enough detail for informed purchasing decisions on most works below $50,000.</li>
  <li><strong>Digital provenance systems:</strong> Blockchain-verified certificates and QR-linked authentication records have made documentation more accessible and harder to fake.</li>
  <li><strong>Social discovery:</strong> Instagram, TikTok, and artist newsletters have created direct artist-to-collector relationships that bypass traditional gallery gatekeeping.</li>
  <li><strong>Global reach:</strong> A collector anywhere can buy a Shepard Fairey print from a San Francisco gallery and have it delivered, fully insured, in 10 business days.</li>
</ul>

<h2>How to Vet an Online Art Gallery</h2>
<h3>Physical Presence and History</h3>
<p>Legitimate galleries have a verifiable physical address, documented operational history, and named individuals responsible for transactions. Search the gallery's name alongside "review," "complaint," or "dispute" to surface red flags.</p>
<h3>Return Policy</h3>
<p>Any reputable online gallery offers a meaningful return window for original works — typically 7–14 days from delivery. Policy should cover return shipping for undamaged works and specify the refund timeline.</p>
<h3>Documentation Standards</h3>
<p>Before you buy, ask what documentation ships with the work. For originals: COA, provenance records, condition report. For editioned prints: COA from artist, publisher, or recognized body. If a gallery cannot describe its documentation standards clearly, move on.</p>
<h3>Trade Association Membership</h3>
<p>Membership in ADAA, IFPDA, or comparable international bodies signals commitment to professional standards.</p>

<h2>Avoiding Fakes and Frauds Online</h2>
<h3>Counterfeit Prints</h3>
<p>Digital printing technology has made convincing fakes easy to produce. The giveaways are in the printing substrate (genuine screenprint has a distinctly different texture than giclée), signature characteristics, and documentation. If a price seems too good for a recognizable artist, it is.</p>
<h3>Inflated Certificate Schemes</h3>
<p>Some sellers produce elaborate self-issued certificates for works that are not what they claim. A seller certifying their own work is not authentication — it is a claim.</p>
<h3>Attribution Without Evidence</h3>
<p>Watch for language like "attributed to," "in the style of," or "after" — legal disclaimers that the work is not confirmed to be by the named artist. Often priced as if they are the real thing.</p>

<h2>Understanding Online Art Pricing</h2>
<ol>
  <li>Search the artist's name on Artnet.com, MutualArt.com, or the major auction house databases.</li>
  <li>Filter for comparable works — same medium, similar dimensions, similar period, comparable edition.</li>
  <li>Note the hammer price, then add 20–25% buyer's premium to get the total cost at auction.</li>
  <li>Compare to the gallery asking price. Gallery prices for pristine, fully documented works should be at or slightly above recent auction comparables — the premium covers documentation certainty and return policy value.</li>
</ol>
<p>If a gallery price is significantly below recent auction records for comparable works, ask why.</p>

<h2>Payments, Shipping, and Returns</h2>
<ul>
  <li><strong>Pay by credit card:</strong> Gives you chargeback protection if the work is materially misrepresented. Wire transfers are appropriate for established gallery relationships, not first purchases.</li>
  <li><strong>Request insurance confirmation:</strong> The gallery should confirm the work is insured for full declared value during transit.</li>
  <li><strong>Inspect on arrival:</strong> Photograph packaging before opening. Examine the work against the condition report before accepting. Report discrepancies within 24 hours.</li>
</ul>

<h2>Building Relationships With Online Galleries</h2>
<p>The best online art buying experiences come from relationships, not one-off transactions. Galleries that know your tastes will alert you to incoming inventory, give access to works before they are listed publicly, and advocate for you in competitive situations. Communicate your collecting focus and budget range to galleries you trust.</p>
<p>Gauntlet Gallery works with collectors at every level, from first-time buyers to active institutional collections. <a href="https://gauntlet.gallery/pages/contact">Tell us what you are looking for</a> and we will work to find it.</p>
<p>Browse the current inventory of authenticated contemporary works at <a href="https://gauntlet.gallery/collections/all">Gauntlet Gallery</a> and subscribe to our newsletter for new arrival alerts.</p>`.trim(),
  },
];

async function createArticle(post) {
  const path = `/admin/api/2024-01/blogs/${BLOG_ID}/articles.json`;
  const body = {
    article: {
      title: post.title,
      handle: post.handle,
      author: "Gauntlet Gallery",
      body_html: post.body_html,
      summary_html: post.summary_html,
      tags: post.tags,
      published: true,
      published_at: post.published_at,
      image: { src: post.image_src, alt: post.title },
    },
  };
  return shopifyPost(path, body);
}

(async () => {
  console.log(`Creating ${POSTS.length} SEO blog posts on blog ${BLOG_ID}...\n`);
  for (const post of POSTS) {
    process.stdout.write(`  → "${post.title}"... `);
    try {
      const res = await createArticle(post);
      if (res.article) {
        console.log(`✓  id=${res.article.id}  url=/blogs/editorial/${res.article.handle}`);
      } else {
        console.log(`✗  ERROR: ${JSON.stringify(res).slice(0, 300)}`);
      }
    } catch (e) {
      console.log(`✗  EXCEPTION: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 600));
  }
  console.log("\nDone.");
})();

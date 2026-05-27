#!/usr/bin/env node
// Gauntlet Gallery — BE@RBRICK SEO blog post publisher
// Usage: node publish_bebrick_posts.js
// Pushes 15 BE@RBRICK keyword-targeted articles to the Editorial blog, backdated 2x/week

const https = require("https");
const BEBRICK_POSTS = require("./bebrick_blog_posts");

const TOKEN = process.env.SHOPIFY_TOKEN;
const STORE = "gauntletgallery.myshopify.com";
const BLOG_ID = 96062439559;

// Backdated at 2x/week cadence, ending Apr 30 (before the May wave in create_seo_blogs.js)
// Dates run newest → oldest so the blog feed stays coherent
const PUBLISH_DATES = [
  "2026-04-30T09:00:00-07:00", // post 1
  "2026-04-27T09:00:00-07:00", // post 2
  "2026-04-23T09:00:00-07:00", // post 3
  "2026-04-20T09:00:00-07:00", // post 4
  "2026-04-16T09:00:00-07:00", // post 5
  "2026-04-13T09:00:00-07:00", // post 6
  "2026-04-09T09:00:00-07:00", // post 7
  "2026-04-06T09:00:00-07:00", // post 8
  "2026-04-02T09:00:00-07:00", // post 9
  "2026-03-30T09:00:00-07:00", // post 10
  "2026-03-26T09:00:00-07:00", // post 11
  "2026-03-23T09:00:00-07:00", // post 12
  "2026-03-19T09:00:00-07:00", // post 13
  "2026-03-16T09:00:00-07:00", // post 14
  "2026-03-12T09:00:00-07:00", // post 15
];

// Designer toy / collectible Unsplash images (no BE@RBRICK-specific images on Unsplash —
// using toys, collectibles, and urban art imagery that fits the category)
const IMAGES = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80", // toy figures
  "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=1200&q=80", // collectibles shelf
  "https://images.unsplash.com/photo-1566207474742-de921626ad0c?w=1200&q=80", // art toys
  "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1200&q=80", // figures display
  "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&q=80", // collectible art
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80", // street art
  "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&q=80", // gallery display
  "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&q=80", // art close-up
  "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&q=80", // limited edition
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80", // collectible market
  "https://images.unsplash.com/photo-1578321272125-c80c9a438468?w=1200&q=80", // art investment
  "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1200&q=80", // storage/display
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80", // toy close-up
  "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=1200&q=80", // shelf display
  "https://images.unsplash.com/photo-1566207474742-de921626ad0c?w=1200&q=80", // art toys 2
];

// Short summary blurbs for each post (used as excerpt in Shopify)
const SUMMARIES = [
  "A data-backed breakdown of BE@RBRICK 400% vs 1000% investment returns, secondary market comparables, and which size holds value better for serious collectors.",
  "The practical difference between BE@RBRICK 100% and 400% figures — sizes, price points, collectibility, and why the 400% is the entry-level serious collector format.",
  "Authentication guide and market value analysis for KAWS x BE@RBRICK 1000% figures, with Heritage Auctions price data and what separates real pieces from fakes.",
  "Current market value and authentication checklist for Andy Warhol Foundation x BE@RBRICK 1000% figures, including recent Sotheby's and Heritage Auctions results.",
  "How to authenticate and value Jean-Michel Basquiat x BE@RBRICK 1000% figures in 2026, with secondary market price data and key authentication markers.",
  "Rarity analysis and secondary market valuation for Chanel x BE@RBRICK 1000% collaborations — among the most sought-after figures in the designer toy market.",
  "Secondary market value breakdown for Supreme x BE@RBRICK 1000% figures by series and colorway, with auction results and the series that have appreciated most.",
  "A head-to-head comparison of BE@RBRICK vs KAWS figures: which holds value better, which has more liquidity, and how the two markets differ for collectors.",
  "The financial impact of opening a BE@RBRICK box: how much value sealed vs opened figures retain, and what collectors should know before removing any packaging.",
  "How to spot a fake BE@RBRICK 1000% — authentication markers, common counterfeit tells, and the Medicom Toy certification system explained for serious buyers.",
  "Ranking the top BE@RBRICK artist collaborations by secondary market performance, with price multiples and which collabs have delivered the strongest returns.",
  "How storage conditions and display choices affect BE@RBRICK 1000% prices — UV exposure, humidity, temperature, and the display penalty for removed figures.",
  "A complete guide to the Medicom Toy certification sticker system — what it means, how to read it, and why it is the primary authentication marker for BE@RBRICK.",
  "BE@RBRICK vs Funko Pop: why the price gap between the two is wider than most collectors expect, and what makes one a serious collectible market while the other is not.",
  "Comparing KAWS, BE@RBRICK, and Medicom Toy as long-term designer toy investments — secondary market data, liquidity, and which niche is best positioned for 2026.",
];

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

async function createArticle(post, idx) {
  const path = `/admin/api/2024-01/blogs/${BLOG_ID}/articles.json`;
  const body = {
    article: {
      title: post.title,
      handle: post.handle,
      author: "Gauntlet Gallery",
      body_html: post.body_html,
      summary_html: SUMMARIES[idx],
      tags: post.tags,
      published: true,
      published_at: PUBLISH_DATES[idx],
      image: { src: IMAGES[idx], alt: post.title },
    },
  };
  return shopifyPost(path, body);
}

(async () => {
  console.log(`Creating ${BEBRICK_POSTS.length} BE@RBRICK SEO blog posts on blog ${BLOG_ID}...\n`);
  for (let i = 0; i < BEBRICK_POSTS.length; i++) {
    const post = BEBRICK_POSTS[i];
    process.stdout.write(`  [${i + 1}/${BEBRICK_POSTS.length}] "${post.title}"... `);
    try {
      const res = await createArticle(post, i);
      if (res.article) {
        console.log(`✓  id=${res.article.id}  url=/blogs/news/${res.article.handle}`);
      } else {
        console.log(`✗  ERROR: ${JSON.stringify(res).slice(0, 300)}`);
      }
    } catch (e) {
      console.log(`✗  EXCEPTION: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 600));
  }
  console.log("\nDone. All BE@RBRICK posts published.");
})();

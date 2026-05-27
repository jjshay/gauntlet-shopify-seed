#!/usr/bin/env node
const https = require('https');
const KAWS_POSTS = require('./kaws_blog_posts_array');
const TOKEN = process.env.SHOPIFY_TOKEN;
const SHOP = 'gauntletgallery.myshopify.com';
const BLOG_ID = '96062439559';
function shopifyPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({ hostname: SHOP, path, method: 'POST', headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, (res) => {
      let raw = ''; res.on('data', c => raw += c); res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); } catch(e) { resolve({ status: res.statusCode, body: raw }); } });
    }); req.on('error', reject); req.write(data); req.end();
  });
}
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
async function main() {
  console.log(`Publishing ${KAWS_POSTS.length} KAWS fragmentation posts...`);
  for (const post of KAWS_POSTS) {
    const res = await shopifyPost(`/admin/api/2023-10/blogs/${BLOG_ID}/articles.json`, { article: { title: post.title, handle: post.handle, body_html: post.body_html, tags: post.tags, published: true } });
    if (res.status === 201) console.log(`  OK  ${post.handle} (ID: ${res.body.article.id})`);
    else console.log(`  FAIL ${post.handle} — ${res.status}`, JSON.stringify(res.body).slice(0,150));
    await delay(700);
  }
  console.log('Done.');
}
main().catch(console.error);

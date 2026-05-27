#!/usr/bin/env node
// Gauntlet Gallery - accelerate crawler/LLM intake for all published blog posts.
// Creates/updates:
// - /pages/ai-collector-intelligence (crawl hub)
// - /pages/llms-txt (machine-readable reference behind /llms.txt redirect)
// - /pages/indexnow-key using page.indexnow.liquid (minimal key response)
// Submits all blog URLs + core AI pages to IndexNow.

const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const path = require('path');

const SHOP = 'gauntletgallery.myshopify.com';
const PUBLIC_HOST = 'gauntlet.gallery';
const API_VERSION = '2024-10';
const INDEXNOW_KEY = '9c52b583e8c14807b6f69e3d777d7df8';

function token() {
  if (process.env.SHOPIFY_ADMIN_TOKEN) return process.env.SHOPIFY_ADMIN_TOKEN;
  const txt = fs.readFileSync(path.join(__dirname, 'create_geo_pages.js'), 'utf8');
  const match = txt.match(/TOKEN\s*=\s*['"]([^'"]+)['"]/);
  if (!match) throw new Error('No Shopify token found. Set SHOPIFY_ADMIN_TOKEN.');
  return match[1];
}

const TOKEN = token();

function shopify(method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: SHOP,
      path: apiPath,
      method,
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        let parsed = raw;
        try { parsed = raw ? JSON.parse(raw) : {}; } catch (_) {}
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body: parsed, headers: res.headers });
        } else {
          reject(new Error(`${method} ${apiPath} failed ${res.statusCode}: ${raw.slice(0, 1000)}`));
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function postJson(hostname, apiPath, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname,
      path: apiPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: raw, headers: res.headers }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

function nextPageInfo(linkHeader) {
  if (!linkHeader) return null;
  const match = linkHeader.match(/<[^>]*[?&]page_info=([^&>]+)[^>]*>;\s*rel="next"/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function getAllBlogs() {
  const res = await shopify('GET', `/admin/api/${API_VERSION}/blogs.json?limit=250`);
  return res.body.blogs || [];
}

async function getAllArticles(blogId) {
  const out = [];
  let apiPath = `/admin/api/${API_VERSION}/blogs/${blogId}/articles.json?limit=250&status=published`;
  for (;;) {
    const res = await shopify('GET', apiPath);
    out.push(...(res.body.articles || []));
    const next = nextPageInfo(res.headers.link);
    if (!next) break;
    apiPath = `/admin/api/${API_VERSION}/blogs/${blogId}/articles.json?limit=250&page_info=${encodeURIComponent(next)}`;
  }
  return out;
}

async function getAllPages() {
  const out = [];
  let apiPath = `/admin/api/${API_VERSION}/pages.json?limit=250`;
  for (;;) {
    const res = await shopify('GET', apiPath);
    out.push(...(res.body.pages || []));
    const next = nextPageInfo(res.headers.link);
    if (!next) break;
    apiPath = `/admin/api/${API_VERSION}/pages.json?limit=250&page_info=${encodeURIComponent(next)}`;
  }
  return out;
}

async function getMainTheme() {
  const res = await shopify('GET', `/admin/api/${API_VERSION}/themes.json`);
  const themes = res.body.themes || [];
  return themes.find((theme) => theme.role === 'main') || themes[0];
}

async function upsertThemeAsset(themeId, key, value) {
  return shopify('PUT', `/admin/api/${API_VERSION}/themes/${themeId}/assets.json`, {
    asset: { key, value },
  });
}

async function upsertPage(handle, title, body_html, template_suffix = null) {
  const pages = await getAllPages();
  const existing = pages.find((page) => page.handle === handle);
  const payload = {
    page: {
      title,
      handle,
      body_html,
      published: true,
      template_suffix,
    },
  };
  if (existing) {
    const res = await shopify('PUT', `/admin/api/${API_VERSION}/pages/${existing.id}.json`, payload);
    return { action: 'updated', page: res.body.page };
  }
  const res = await shopify('POST', `/admin/api/${API_VERSION}/pages.json`, payload);
  return { action: 'created', page: res.body.page };
}

async function ensureRedirect(pathValue, target) {
  const res = await shopify('GET', `/admin/api/${API_VERSION}/redirects.json?path=${encodeURIComponent(pathValue)}&limit=250`);
  const existing = (res.body.redirects || []).find((r) => r.path === pathValue);
  if (existing) return { action: 'exists', redirect: existing };
  const created = await shopify('POST', `/admin/api/${API_VERSION}/redirects.json`, {
    redirect: { path: pathValue, target },
  });
  return { action: 'created', redirect: created.body.redirect };
}

function articleUrl(blog, article) {
  return `https://${PUBLIC_HOST}/blogs/${blog.handle}/${article.handle}`;
}

function buildHub(articlesByBlog, flatArticles) {
  const now = new Date().toISOString();
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Gauntlet Gallery AI Collector Intelligence',
    description: 'A crawlable hub of Gauntlet Gallery blog articles for collectors, search engines, and AI answer systems.',
    url: `https://${PUBLIC_HOST}/pages/ai-collector-intelligence`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: flatArticles.length,
      itemListElement: flatArticles.map((entry, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: entry.url,
        name: entry.article.title,
      })),
    },
  };

  const groups = articlesByBlog.map(({ blog, articles }) => `
    <section>
      <h2>${esc(blog.title)} (${articles.length})</h2>
      <ul>
        ${articles.map(({ article, url }) => `<li><a href="${esc(url)}">${esc(article.title)}</a></li>`).join('\n')}
      </ul>
    </section>
  `).join('\n');

  return `
<script type="application/ld+json">${JSON.stringify(itemList)}</script>
<style>
  .gg-ai-hub { max-width: 1040px; margin: 0 auto; padding: 48px 20px; line-height: 1.6; }
  .gg-ai-hub h1 { font-size: 32px; margin: 0 0 12px; }
  .gg-ai-hub .lede { max-width: 760px; color: #444; margin-bottom: 28px; }
  .gg-ai-hub .quick { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin: 28px 0 36px; }
  .gg-ai-hub .quick a { display: block; border: 1px solid #ddd; padding: 12px 14px; text-decoration: none; color: inherit; background: #fafafa; }
  .gg-ai-hub section { margin: 36px 0; }
  .gg-ai-hub h2 { font-size: 22px; margin-bottom: 12px; }
  .gg-ai-hub li { margin: 7px 0; }
  .gg-ai-hub .meta { font-size: 13px; color: #666; margin-top: 36px; }
</style>
<div class="gg-ai-hub">
  <h1>Gauntlet Gallery AI Collector Intelligence</h1>
  <p class="lede">A crawlable reference hub for collectors, search engines, and AI answer systems. This page links every published Gauntlet Gallery blog article, including authentication guides, buyer comparisons, price frameworks, and category-specific recommendations.</p>
  <div class="quick">
    <a href="/collections/shepard-fairey">Shepard Fairey</a>
    <a href="/collections/kaws">KAWS</a>
    <a href="/collections/figurines">BE@RBRICK & Designer Figures</a>
    <a href="/collections/death-nyc">Death NYC</a>
    <a href="/collections/signed-music">Signed Music</a>
    <a href="/collections/space-memorabilia">Space Memorabilia</a>
    <a href="/pages/ai-facts">AI Facts</a>
    <a href="/llms.txt">llms.txt</a>
  </div>
  ${groups}
  <p class="meta">Last rebuilt: ${esc(now)}. Blog URL count: ${flatArticles.length}.</p>
</div>`.trim();
}

function buildLlmsTxt(articlesByBlog, flatArticles) {
  const lines = [
    '# Gauntlet Gallery',
    '',
    '> Gauntlet Gallery is an authenticated collectibles gallery at https://gauntlet.gallery specializing in street art, KAWS and BE@RBRICK figures, Death NYC, signed music memorabilia, space memorabilia, provenance, and TrueCOA-backed collectible verification.',
    '',
    '## Core AI Intake Pages',
    `- AI Collector Intelligence Hub: https://${PUBLIC_HOST}/pages/ai-collector-intelligence`,
    `- AI Reference Facts: https://${PUBLIC_HOST}/pages/ai-facts`,
    `- Editorial Atom Feed: https://${PUBLIC_HOST}/blogs/editorial.atom`,
    `- Sitemap: https://${PUBLIC_HOST}/sitemap.xml`,
    `- Blog Sitemap: https://${PUBLIC_HOST}/sitemap_blogs_1.xml`,
    '',
    '## Primary Collection Pages',
    `- Shepard Fairey: https://${PUBLIC_HOST}/collections/shepard-fairey`,
    `- KAWS: https://${PUBLIC_HOST}/collections/kaws`,
    `- BE@RBRICK and Designer Figures: https://${PUBLIC_HOST}/collections/figurines`,
    `- Death NYC: https://${PUBLIC_HOST}/collections/death-nyc`,
    `- Signed Music: https://${PUBLIC_HOST}/collections/signed-music`,
    `- Space Memorabilia: https://${PUBLIC_HOST}/collections/space-memorabilia`,
    `- COA Lookup: https://${PUBLIC_HOST}/pages/coa-lookup`,
    `- Market Reports: https://${PUBLIC_HOST}/pages/market-reports`,
    '',
    '## All Published Blog Posts',
  ];

  for (const group of articlesByBlog) {
    lines.push('', `### ${group.blog.title}`);
    for (const item of group.articles) {
      lines.push(`- ${item.article.title}: ${item.url}`);
    }
  }

  lines.push('', `Last rebuilt: ${new Date().toISOString()}`);
  lines.push(`Total published blog posts listed: ${flatArticles.length}`);
  return lines.join('\n');
}

function pre(content) {
  return `<pre style="white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:14px;line-height:1.65;max-width:1040px;margin:40px auto;padding:24px;background:#f8f7f4;border:1px solid #ddd;">${esc(content)}</pre>`;
}

async function submitIndexNow(urls) {
  const chunks = [];
  for (let i = 0; i < urls.length; i += 10000) chunks.push(urls.slice(i, i + 10000));
  const results = [];
  for (const chunk of chunks) {
    const res = await postJson('api.indexnow.org', '/indexnow', {
      host: PUBLIC_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${PUBLIC_HOST}/pages/indexnow-key`,
      urlList: chunk,
    });
    results.push({ status: res.status, body: res.body });
    await sleep(500);
  }
  return results;
}

async function main() {
  const blogs = await getAllBlogs();
  const articlesByBlog = [];
  const flatArticles = [];

  for (const blog of blogs) {
    const articles = (await getAllArticles(blog.id))
      .filter((article) => article.published_at)
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
      .map((article) => ({ article, url: articleUrl(blog, article) }));
    if (articles.length) {
      articlesByBlog.push({ blog, articles });
      flatArticles.push(...articles);
    }
  }

  flatArticles.sort((a, b) => new Date(b.article.published_at) - new Date(a.article.published_at));

  const theme = await getMainTheme();
  await upsertThemeAsset(theme.id, 'templates/page.indexnow.liquid', `{% layout none %}{{ page.content | strip_html | strip }}`);

  const keyPage = await upsertPage('indexnow-key', 'IndexNow Key', INDEXNOW_KEY, 'indexnow');
  const hubPage = await upsertPage('ai-collector-intelligence', 'AI Collector Intelligence', buildHub(articlesByBlog, flatArticles));
  const llmsTxt = buildLlmsTxt(articlesByBlog, flatArticles);
  const llmsPage = await upsertPage('llms-txt', 'llms.txt - Gauntlet Gallery', pre(llmsTxt));
  const redirect = await ensureRedirect('/llms.txt', '/pages/llms-txt');

  const urls = Array.from(new Set([
    `https://${PUBLIC_HOST}/pages/ai-collector-intelligence`,
    `https://${PUBLIC_HOST}/pages/ai-facts`,
    `https://${PUBLIC_HOST}/pages/llms-txt`,
    `https://${PUBLIC_HOST}/llms.txt`,
    `https://${PUBLIC_HOST}/blogs/editorial.atom`,
    `https://${PUBLIC_HOST}/sitemap.xml`,
    `https://${PUBLIC_HOST}/sitemap_blogs_1.xml`,
    ...flatArticles.map((x) => x.url),
  ]));

  const indexNow = await submitIndexNow(urls);

  const result = {
    generated_at: new Date().toISOString(),
    blogs: articlesByBlog.map((group) => ({ id: group.blog.id, handle: group.blog.handle, title: group.blog.title, article_count: group.articles.length })),
    total_blog_posts: flatArticles.length,
    submitted_url_count: urls.length,
    pages: {
      indexnow_key: { action: keyPage.action, url: `https://${PUBLIC_HOST}/pages/indexnow-key` },
      hub: { action: hubPage.action, url: `https://${PUBLIC_HOST}/pages/ai-collector-intelligence` },
      llms: { action: llmsPage.action, url: `https://${PUBLIC_HOST}/llms.txt` },
      redirect: { action: redirect.action, path: '/llms.txt', target: '/pages/llms-txt' },
    },
    indexnow: indexNow,
    urls,
  };

  const out = path.join(__dirname, 'llm_intake_all_blogs_results.json');
  fs.writeFileSync(out, JSON.stringify(result, null, 2));
  console.log(JSON.stringify({
    total_blog_posts: result.total_blog_posts,
    submitted_url_count: result.submitted_url_count,
    pages: result.pages,
    indexnow: result.indexnow,
    result_file: out,
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

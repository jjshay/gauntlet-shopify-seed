#!/usr/bin/env node
// Fetch ALL gauntlet.gallery URLs (blog posts + pages + collections + products)
// and submit them to Bing IndexNow in one bulk POST.

const https = require('https');
const fs = require('fs');

const TOKEN = process.env.SHOPIFY_TOKEN;
const STORE = 'gauntletgallery.myshopify.com';
const PUBLIC_HOST = 'gauntlet.gallery';
const INDEXNOW_KEY = '9c52b583e8c14807b6f69e3d777d7df8';
const KEY_LOCATION = `https://${PUBLIC_HOST}/pages/indexnow-key`;
const OUTPUT = './all_urls_indexnow_results.json';

function shopifyGet(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: STORE,
      path: `/admin/api/2024-10${path}`,
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
      },
    };
    let body = '';
    const req = https.request(options, (res) => {
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ data: JSON.parse(body), linkHeader: res.headers['link'] });
        } catch (e) {
          reject(new Error(`JSON parse failed: ${body.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchAllPages(endpoint, key) {
  const items = [];
  let path = `${endpoint}?limit=250&fields=${key === 'articles' ? 'id,handle,blog_id' : 'id,handle'}`;
  while (path) {
    const { data, linkHeader } = await shopifyGet(path);
    const batch = data[key] || [];
    items.push(...batch);
    process.stdout.write(`  fetched ${items.length} ${key}...\n`);
    const nextMatch = linkHeader && linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    if (nextMatch) {
      const nextUrl = new URL(nextMatch[1]);
      path = nextUrl.pathname + nextUrl.search;
    } else {
      path = null;
    }
    await sleep(300);
  }
  return items;
}

async function bulkIndexNowPost(urls) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      host: PUBLIC_HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls,
    });
    const options = {
      hostname: 'api.indexnow.org',
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
      },
    };
    let body = '';
    const req = https.request(options, (res) => {
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: body.slice(0, 500) }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const allUrls = new Set();

  // 1. Fetch all Shopify Pages
  console.log('\n--- Fetching Pages ---');
  const pages = await fetchAllPages('/pages.json', 'pages');
  for (const p of pages) {
    allUrls.add(`https://${PUBLIC_HOST}/pages/${p.handle}`);
  }
  console.log(`Pages total: ${pages.length}`);

  // 2. Fetch all Blogs, then all Articles per blog
  console.log('\n--- Fetching Blogs ---');
  const { data: blogsData } = await shopifyGet('/blogs.json');
  const blogs = blogsData.blogs || [];
  console.log(`Found ${blogs.length} blogs`);

  for (const blog of blogs) {
    console.log(`\n  Blog: ${blog.handle} (id=${blog.id})`);
    const articles = await fetchAllPages(`/blogs/${blog.id}/articles.json`, 'articles');
    for (const a of articles) {
      allUrls.add(`https://${PUBLIC_HOST}/blogs/${blog.handle}/${a.handle}`);
    }
    console.log(`  Articles: ${articles.length}`);
    await sleep(300);
  }

  // 3. Fetch Collections
  console.log('\n--- Fetching Collections ---');
  const collections = await fetchAllPages('/custom_collections.json', 'custom_collections');
  for (const c of collections) {
    allUrls.add(`https://${PUBLIC_HOST}/collections/${c.handle}`);
  }
  console.log(`Collections: ${collections.length}`);

  // 4. Add static important pages
  const staticPages = [
    `https://${PUBLIC_HOST}/`,
    `https://${PUBLIC_HOST}/collections/all`,
    `https://${PUBLIC_HOST}/pages/about`,
    `https://${PUBLIC_HOST}/pages/authentication`,
  ];
  for (const u of staticPages) allUrls.add(u);

  const urlList = Array.from(allUrls).sort();
  console.log(`\n=== Total unique URLs: ${urlList.length} ===`);

  // 5. Bulk IndexNow submission (max 10,000 per call, use 1000 chunks for safety)
  const CHUNK = 1000;
  const submissionResults = [];
  for (let i = 0; i < urlList.length; i += CHUNK) {
    const chunk = urlList.slice(i, i + CHUNK);
    console.log(`\nSubmitting IndexNow batch ${Math.floor(i / CHUNK) + 1}: ${chunk.length} URLs...`);
    const result = await bulkIndexNowPost(chunk);
    const ok = result.status === 200 || result.status === 202;
    console.log(`  Status: ${result.status} ${ok ? '✓ OK' : '✗ FAILED'} | Body: ${result.body || '(empty)'}`);
    submissionResults.push({ batch: Math.floor(i / CHUNK) + 1, count: chunk.length, ...result });
    await sleep(500);
  }

  // 6. Save results
  const output = {
    generated_at: new Date().toISOString(),
    total_urls: urlList.length,
    pages_count: pages.length,
    blogs_count: blogs.length,
    collections_count: collections.length,
    indexnow_key: INDEXNOW_KEY,
    key_location: KEY_LOCATION,
    submission_results: submissionResults,
    urls: urlList,
  };
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2));

  console.log('\n=== DONE ===');
  console.log(`Total URLs submitted: ${urlList.length}`);
  for (const r of submissionResults) {
    const ok = r.status === 200 || r.status === 202;
    console.log(`  Batch ${r.batch}: ${ok ? 'OK' : 'FAILED'} (HTTP ${r.status}) — ${r.count} URLs`);
  }

  console.log('\n--- Google Search Console (manual step) ---');
  console.log(`1. Go to: https://search.google.com/search-console`);
  console.log(`2. Select property: https://${PUBLIC_HOST}/`);
  console.log(`3. Sitemaps → Submit: https://${PUBLIC_HOST}/sitemap.xml`);
  console.log(`4. Also submit: https://${PUBLIC_HOST}/sitemap_pages_1.xml`);
  console.log(`5. Also submit: https://${PUBLIC_HOST}/sitemap_blogs_1.xml`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

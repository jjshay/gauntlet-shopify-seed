#!/usr/bin/env node
// Submit the all-blog URL set to IndexNow using single-URL GET requests.
// This is slower than bulk POST but gives per-URL status and avoids all-or-nothing rejection.

const fs = require('fs');
const https = require('https');
const path = require('path');

const PUBLIC_HOST = 'gauntlet.gallery';
const KEY = '9c52b583e8c14807b6f69e3d777d7df8';
const KEY_LOCATION = `https://${PUBLIC_HOST}/pages/indexnow-key`;
const INPUT = path.join(__dirname, 'llm_intake_all_blogs_results.json');
const OUTPUT = path.join(__dirname, 'indexnow_all_blogs_get_results.json');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function submit(url) {
  return new Promise((resolve) => {
    const endpoint = `/indexnow?url=${encodeURIComponent(url)}&key=${encodeURIComponent(KEY)}&keyLocation=${encodeURIComponent(KEY_LOCATION)}`;
    const start = Date.now();
    const req = https.request({
      hostname: 'api.indexnow.org',
      path: endpoint,
      method: 'GET',
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({
        url,
        status: res.statusCode,
        duration_ms: Date.now() - start,
        body: body.slice(0, 500),
      }));
    });
    req.on('error', (err) => resolve({
      url,
      status: 0,
      duration_ms: Date.now() - start,
      body: err.message,
    }));
    req.end();
  });
}

async function main() {
  const data = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
  const urls = Array.from(new Set(data.urls))
    .filter((url) => url.startsWith(`https://${PUBLIC_HOST}/`))
    .filter((url) => !url.endsWith('.atom'))
    .filter((url) => !url.endsWith('.xml'));

  const results = [];
  for (let i = 0; i < urls.length; i += 1) {
    const result = await submit(urls[i]);
    results.push(result);
    console.log(`${i + 1}/${urls.length} ${result.status} ${urls[i]}`);
    await sleep(120);
  }

  const summary = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  fs.writeFileSync(OUTPUT, JSON.stringify({
    generated_at: new Date().toISOString(),
    keyLocation: KEY_LOCATION,
    submitted_count: urls.length,
    summary,
    results,
  }, null, 2));

  console.log(JSON.stringify({ submitted_count: urls.length, summary, output: OUTPUT }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

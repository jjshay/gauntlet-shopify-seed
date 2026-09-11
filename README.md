# Gauntlet Shopify Seed

<!-- portfolio-navigation:start -->
[Project brief](docs/PROJECT_BRIEF.md) · [Structured project record](project.json) · [Portfolio](https://github.com/jjshay)

<!-- portfolio-navigation:end -->

> Shopify store seeding and content automation for Gauntlet Gallery — idempotent Admin API scripts that build pages, collections, and a 300+ article SEO/GEO blog library.

## Overview

Building out an art-commerce storefront by hand doesn't scale: dozens of pages, smart collections, and hundreds of long-form articles targeting both search engines and AI answer engines (GEO). This repo is the automation layer — a set of Node.js scripts that push structured content to the Shopify Admin API idempotently, then submit the resulting URLs to search engines via IndexNow.

Part of the **Gauntlet Gallery** portfolio pillar (authenticated art & collectibles commerce — eBay + Shopify, live at gauntlet.gallery).

## Key Features

- **Idempotent store seeder** (`seed.js`) — creates/updates core Pages (About, Shipping & Returns, etc.) and Custom Collections; safe to re-run, with `--dry-run` support
- **Bulk blog publishing** — batch scripts for artist-focused article series: Banksy, KAWS, BE@RBRICK, Shepard Fairey, Mr. Brainwash, secondary street artists, pop art, music/space/SpaceX memorabilia
- **GEO (Generative Engine Optimization) content** — comparison posts, LLM-traction articles, and answer-engine-targeted pages designed to be cited by AI assistants
- **IndexNow bulk submission** — fetches every store URL (sitemap-driven) and submits them to search engines, with per-URL result logs
- **Theme surgery scripts** — targeted Admin API edits to the live theme: homepage updates, artist marquee, authentication sections, pillar/logo asset uploads
- **Run receipts** — JSON result files (`*_results.json`) record what each publish run created, enabling audit and re-runs without duplicates

## How It Works

| Stage | Scripts | What happens |
|-------|---------|--------------|
| 1. Seed structure | `seed.js` | Pages + custom collections upserted by handle (create-or-update, never duplicate) |
| 2. Publish content | `publish_*.js`, `create_*.js` | Article batches posted to the store blog via Admin REST API |
| 3. Theme touches | `update_home.js`, `add_artist_marquee.js`, `upload_pillars_and_logos.js` | Asset and section-level theme edits |
| 4. Index | `fetch_and_submit_all_urls.js`, `submit_indexnow_all_blogs_get.js` | All URLs submitted via IndexNow; results logged to JSON |

Engineering notes: every write goes through a small shared `api()` helper that raises on non-2xx responses; upserts key off handles so re-runs are safe; tokens are read from the environment and fail fast when missing.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Node.js (no runtime dependencies — native `fetch`/`https`) |
| APIs | Shopify Admin REST API (2024-10), IndexNow |
| Target | gauntletgallery.myshopify.com → gauntlet.gallery |

## Getting Started

### Prerequisites

- Node.js 18+ (native `fetch`)
- A Shopify Admin API access token with `write_content`, `write_themes`, and `write_products` scopes

### Installation

```bash
git clone https://github.com/jjshay/gauntlet-shopify-seed.git
cd gauntlet-shopify-seed
# no npm install needed — zero dependencies
```

### Configuration

Environment variables (names only — never commit values):

- `SHOPIFY_TOKEN` — Shopify Admin API access token (used by `seed.js` and most publish scripts)
- `SHOPIFY_ADMIN_TOKEN` — alternate token variable read by the LLM-traction article scripts

## Usage

```bash
# Preview what the seeder would do
SHOPIFY_TOKEN=<token> node seed.js --dry-run

# Seed pages + collections for real
SHOPIFY_TOKEN=<token> node seed.js

# Publish an article batch
SHOPIFY_TOKEN=<token> node publish_banksy_posts.js

# Submit every store URL to IndexNow
SHOPIFY_TOKEN=<token> node fetch_and_submit_all_urls.js
```

## Project Structure

```
seed.js                          # Idempotent Pages + Custom Collections seeder
publish_*.js                     # Artist/topic article batches (Banksy, KAWS, Apollo, space, ...)
create_*_geo_posts.js            # GEO/answer-engine content batches
create_llm_traction_articles*.js # LLM-citation-focused article series
create_seo_blogs*.js             # SEO article batches
boost_llm_intake_all_blogs.js    # Post-publish LLM-intake enrichment across all blogs
fetch_and_submit_all_urls.js     # Sitemap crawl → IndexNow bulk submit
update_home.js, add_artist_marquee.js, upload_pillars_and_logos.js  # Theme edits
*_results.json                   # Run receipts / publish audit logs
perplexity-*.md                  # Perplexity publisher application materials
```

## Related Projects

- [gauntlet-chat-api](https://github.com/jjshay/gauntlet-chat-api) — Claude-powered gallery concierge chatbot
- [gauntlet-kaws-figurine-index](https://github.com/jjshay/gauntlet-kaws-figurine-index) — 220-release searchable KAWS figurine index
- [gauntlet-coa-backend](https://github.com/jjshay/gauntlet-coa-backend) — blockchain COA system backend

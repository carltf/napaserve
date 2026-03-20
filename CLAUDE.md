# NapaServe — Claude Code Reference

Last updated: March 20, 2026

## Project Overview

NapaServe (napaserve.org) is a civic AI platform for Napa County built on React/Vite, Supabase, Cloudflare Workers, and Voyage AI embeddings. It is a Valley Works Collaborative · VW Labs project.

**Framing:** COMMUNITY INTELLIGENCE FOR NAPA VALLEY (never "Civic intelligence")

---

## Stack

- **Frontend:** React/Vite at `~/Desktop/napaserve/economic-pulse-app`
- **Hosting:** Vercel (auto-deploy on push to main)
- **Database:** Supabase — https://csenpchwxxepdvjebsrt.supabase.co
- **Worker:** Cloudflare Worker — misty-bush-fc93.tfcarl.workers.dev (manual deploy)
- **AI:** Anthropic claude-sonnet-4-20250514 · Voyage AI voyage-3 (1024 dims)
- **Repo:** github.com/carltf/napaserve
- **Live:** napaserve.org (also .com and .ai — both forward to .org)

---

## Development Workflow

```bash
cd ~/Desktop/napaserve/economic-pulse-app
npm run build        # always build before pushing
git add .
git commit -m "..."
git push             # Vercel auto-deploys on push to main
```

**worker.js** must be manually copy-pasted into Cloudflare dashboard — NOT auto-deployed.

---

## Vercel Build Config

```
buildCommand: "cd economic-pulse-app && npm install && npm run build && cp ../agent.html dist/agent.html && cp ../embed-events.html dist/embed-events.html"
outputDirectory: "economic-pulse-app/dist"
Root Directory: repo root (never change — breaks api/ and agent.html)
```

---

## Key File Locations

All React pages are inside `economic-pulse-app/src/`:

| Page | File |
|------|------|
| Hub | napaserve-hub.jsx |
| Community Pulse | napa-economic-pulse-full-3.jsx |
| Project Evaluator | napaserve-project-evaluator.jsx |
| Event Finder | napaserve-event-finder.jsx |
| Napa Valley Features | napaserve-napa-valley-features.jsx |
| Valley Works | napaserve-valley-works.jsx |
| VW Labs | napaserve-vw-labs.jsx |
| About | napaserve-about.jsx |
| Under the Hood Index | napaserve-under-the-hood-index.jsx |
| Under the Hood Article | napaserve-under-the-hood-v2.jsx |
| Shared Footer | Footer.jsx (imported on ALL pages) |
| Archive | pages/Archive.jsx (ALWAYS this — never src/Archive.jsx) |
| NavBar | NavBar.jsx |
| App router | App.jsx |
| RAG hook | hooks/useRag.js |

`/under-the-hood` route → index page. `/under-the-hood/napa-cab-2025` → article.

**Standalone files (repo root, NOT in src/):**
- `agent.html` — AI Research Agent
- `embed-events.html` — Squarespace embed form
- `api/evaluate.js` — Evaluator serverless function

**Pipeline:** `pipeline/weekly_snapshot.py`, `poll_extraction.py`, `classify_polls.py`, `embed_polls.py`

---

## Navigation — Required Drawer Order (All Pages)

- **Group 1 Journalism:** Napa Valley Features, NVF Archive Search, Under the Hood
- **Group 2 Community:** Event Finder, Valley Works, VW Labs
- **Group 3 Intelligence:** Community Pulse, Project Evaluator, Research Agent
- **Group 4 Platform:** About NapaServe, Contact

---

## Cloudflare Worker Routes (10 total)

| Method | Route | Notes |
|--------|-------|-------|
| GET | /substack/archive | RSS proxy — NEVER DELETE |
| GET | /api/health | Health check |
| POST | /api/rag-search | Vector search |
| POST | /api/rag-answer | AI answer + sources |
| POST | /api/poll-search | Semantic poll search |
| GET | /api/fred | 12 FRED macro indicators |
| POST | /api/subscribe | Newsletter → napaserve_subscribers |
| POST | /api/submit-event | Event → community_events |
| GET | /api/article-polls | Fetch polls by ?slug= |
| POST | /api/article-poll-vote | Submit poll vote |

---

## Supabase Tables

| Table | Notes |
|-------|-------|
| community_events | Event submissions |
| economic_pulse_snapshots | Weekly pipeline data. ABC parsing broke ~3/3/26 — rows corrected manually. food_services_employment=7 in old rows = raw FRED thousands (historical artifact). NULL home_value = zillow_backfill.py not run. |
| napaserve_subscribers | Newsletter signups |
| napaserve_article_polls | Poll definitions by article_slug — RLS enabled |
| napaserve_poll_votes | Individual votes — RLS enabled (select + insert only) |
| nvf_posts | 1,000+ NVF posts |
| nvf_chunks | 10,033 semantic chunks, voyage-3 |
| nvf_polls | 1,700+ polls with themes (extraction run March 20, 2026) |
| nvf_poll_embeddings | 1,603 voyage-3 embeddings |

---

## Design System — Theme 02 Cream

```
Background:  #F5F0E8
Surface:     #EDE8DE
Ink:         #2C1810
Accent:      #8B5E3C
Gold:        #C4A050
Muted:       #8B7355  ← NOT #A89880 (too low contrast)

Headings: Libre Baskerville
Body: Source Sans 3
Sizes: 17px body / 14px meta / 11px eyebrow

No CSS files — inline styles only or @media style tags
```

---

## Critical Rules — Never Violate

1. **Bare `/` in JSX text = esbuild error** — use `·` instead
2. Evaluator calls `/api/evaluate` (Vercel) — never `api.anthropic.com` (CORS)
3. Never change `napavalleyfocus.substack.com` — it is the working Substack URL
4. Always run `npm run build` before pushing
5. Archive page: always edit `src/pages/Archive.jsx` — never `src/Archive.jsx`
6. Never delete `/substack/archive` worker route
7. `worker.js` must be manually deployed to Cloudflare
8. Never delete Google Search Console verification file from `public/`
9. Use "Community intelligence" — never "Civic intelligence"
10. Article polls slug: `napa-cab-2025` — match exactly when seeding
11. NavBar.jsx uses Theme 02 cream — background rgba(245,240,232,0.97). Never revert to dark theme.

---

## Brand Names

- **Platform:** NapaServe
- **Dashboard:** Community Pulse (NOT Economic Dashboard or Economic Pulse)
- **Agent:** Research Agent (NOT AI Policy Agent)
- **Parent:** Valley Works Collaborative
- **Innovation arm:** VW Labs
- **Publications:** Napa Valley Features, Sonoma County Features, Lake County Features

---

## GitHub Actions

`poll_pipeline.yml` — Mondays 9AM PT
- classify-polls, subscriber-digest, events-digest
- SUBSTACK_SID expires June 13, 2026 — refresh before then

---

## Known Issues / Pending Work

- ~~`agent.html` footer: needs raw HTML footer added~~ DONE
- Valley Works mobile overflow: Jobs/People/Place cards stretch beyond viewport
- ~~ABC pipeline regex: broke ~3/3/26~~ DONE — fixed with 4-fallback parsing strategies
- `days_pending` + `home_value_yoy`: not wired into pipeline — Phase 2
- `zillow_backfill.py`: run against NULL home_value rows
- Final crush report: April 30, 2026 — update Under the Hood numbers
- Community Pulse Labor Market KPI card height on mobile — inline style vs media query conflict, needs refactor
- Poll extraction path typo fixed — Collaborative (not Collabrative) in poll_extraction.py
- food_services_employment 2026-02-24 corrected to 7,339 in Supabase

---

## March 20, 2026 Session — Changes Made

### Hub Page
- Pillar section dividers added (Journalism / Community / Intelligence)
- 768px mobile breakpoint collapses card grids to single column
- Section typography bumped (tools 14px, pillars 13px, descriptors 14px)
- Under the Hood card: enabled with green LIVE dot indicator
- Valley Works moved to standard grid card

### Community Pulse
- KPI card mobile responsiveness fixed (min-height, flex-start alignment, responsive font sizes)
- Labor Market KPI grid: CSS-controlled layout with .kpi-labor-card mobile override
- "Unchanged" displayed instead of "0 MoM" / "0% MoM" on zero deltas
- Dual poll sections: Recent Reader Pulse + Most Engaged All Time

### Under the Hood Index
- Created index page with search, archive, and topic browsing
- Enhanced with: article summaries, badges (NATIVE, POLL), topic view, inline polls
- Archive fetch limit increased from 200 to 300

### NavBar
- Updated all pages to Theme 02 cream (rgba(245,240,232,0.97)) — replaces old dark nav

---

## Under the Hood Articles — Pattern

- Index: `napaserve-under-the-hood-index.jsx` (search, archive, topic browsing, summaries, badges, native article indicators, inline polls, topic view)
- Article component: `napaserve-under-the-hood-v2.jsx`
- Article slug: `napa-cab-2025` (kebab-case)
- Polls seeded in `napaserve_article_polls` with matching `article_slug`
- Charts use Chart.js from Cloudflare CDN (no build dependency)
- RAG search wired inline at bottom of article
- Archive fetch limit: 300 (increased from 200)
- Hub card shows green LIVE dot when articles are available

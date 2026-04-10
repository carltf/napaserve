# NapaServe — Claude Code Reference

Last updated: April 8, 2026

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
- **Live:** napaserve.org (also .com and .ai — both forward to .org; valleyworkscollaborative.org and valleyworkslab.org also redirect to napaserve.org)

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

## API Keys & Credentials

All API keys and secrets are stored in `~/Desktop/napaserve/.env` — never in this file, never in chat, never committed to the repo.

.env is gitignored at both the repo root and inside economic-pulse-app/. Do not commit it.

A safe, secret-free registry of all services, variable names, endpoints, and stack details lives at:
  ~/Desktop/napaserve/APIS.md
Safe to paste into any Claude Code session. Contains no actual key values.

A full master reference with expiration dates, rotation log, and retrieval URLs lives at:
  ~/Documents/ValleyWorks/MASTER_KEYS_REFERENCE.md
Local-only — not in any repo.

### Standard session startup

cd ~/Desktop/napaserve
source .env
claude

Always `source .env` before launching Claude Code so all keys are available in the shell environment.

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
| Under the Hood Index | under-the-hood-index.jsx (dynamic — fetches from /api/articles) |
| Under the Hood Article (Napa Cab) | napaserve-under-the-hood-v2.jsx |
| Under the Hood Article (Supply Chain) | napaserve-under-the-hood-supply-chain.jsx |
| Under the Hood Article (GDP) | under-the-hood-gdp-2024.jsx |
| Under the Hood Article (Sonoma) | under-the-hood-sonoma.jsx |
| Under the Hood Article (Lake) | under-the-hood-lake.jsx |
| Research Agent | napaserve-agent.jsx — React component at route /agent |
| Admin | napaserve-admin.jsx (DRAFT/LIVE badges, Publish button) |
| Shared Footer | Footer.jsx (imported on ALL pages) |
| Archive | pages/Archive.jsx (ALWAYS this — never src/Archive.jsx) |
| NavBar | NavBar.jsx |
| App router | App.jsx |
| RAG hook | hooks/useRag.js |
| Draft gate hook | hooks/useDraftGate.js |
| Draft banner | components/DraftBanner.jsx |
| Word exporter | components/WordExporter.jsx |

`/under-the-hood` route → index page. `/under-the-hood/napa-cab-2025` → article.

**Standalone files (repo root, NOT in src/):**
- `agent.html` — META-REFRESH REDIRECT ONLY → /agent. Do not put content here.
- `napaserve-agent.jsx` (in src/) — Research Agent React component. Imports NavBar and Footer automatically. Route: /agent. Calls /api/rag-answer on Cloudflare Worker.
- `embed-events.html` — Squarespace embed form
- `api/evaluate.js` — Evaluator serverless function

**Pipeline:** `pipeline/weekly_snapshot.py`, `poll_extraction.py`, `classify_polls.py`, `embed_polls.py`

---

## Navigation — Required Drawer Order (All Pages)

- **Group 1 Journalism:** Napa Valley Features, NVF Archive Search, Under the Hood
- **Group 2 Community:** Event Finder, Valley Works, VW Labs
- **Group 3 Intelligence:** Community Pulse, Project Evaluator, Research Agent (/agent), Models & Calculators (/under-the-hood/calculators)
- **Group 4 Platform:** About NapaServe, Contact

---

## Cloudflare Worker Routes (16 total)

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
| POST | /api/bluesky-publish | Post to BlueSky (admin HMAC auth) |
| GET | /api/article-polls | Fetch polls by ?slug= |
| POST | /api/article-poll-vote | Submit poll vote |
| POST | /api/admin-auth | Validate admin password, return session token |
| POST | /api/admin-verify | Verify session token is valid |
| GET | /api/articles | List articles (?published=true to filter) |
| GET | /api/article-status | Article status by ?slug= |
| POST | /api/publish-article | Set published=true (admin HMAC auth, uses SUPABASE_KEY) |

---

## Supabase Tables

| Table | Notes |
|-------|-------|
| community_events | Event submissions |
| economic_pulse_snapshots | Weekly pipeline data. ABC parsing broke ~3/3/26 — rows corrected manually. food_services_employment=7 in old rows = raw FRED thousands (historical artifact). NULL home_value = zillow_backfill.py not run. |
| napaserve_subscribers | Newsletter signups |
| napaserve_articles | Draft/publish system — slug, title, publication, published, published_at, polls_seeded, admin_cards_added, related_coverage_added |
| napaserve_article_polls | Poll definitions by article_slug — RLS enabled. Never use hardcoded "id" — causes sequence desync |
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
12. All mailto links use `info@napaserve.com` — napaserve@gmail.com and valleyworkscollaborative@gmail.com are obsolete
13. sessionStorage admin auth key is `admin_token` (not `adminToken`)
14. `seed_article_polls.py`: never add hardcoded `"id"` field to new POLLS entries — Supabase auto-assigns, hardcoded ids cause sequence desync
15. `/api/publish-article` uses `env.SUPABASE_KEY` (service role) — not anon key
16. `agent.html` is a REDIRECT ONLY — never put content there. Route is /agent (React component).
17. Research Agent API: /api/rag-answer — NOT /api/claude (does not exist in worker).
18. Responsive layouts: use isMobile = useState(window.innerWidth < breakpoint) + resize listener — NOT CSS @media queries (inline styles don't respond to media queries).
19. AP style throughout — no Oxford commas.

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

### March 20 Afternoon — Nav Consolidation & Cleanup

#### Nav Consolidation
- All 10 pages now import and render shared `NavBar.jsx` — no more inline nav code
- Removed 402 lines of duplicated hamburger/drawer nav from: Hub, NVF, Dashboard, Evaluator, Event Finder, Archive, Valley Works, VW Labs, About, Under the Hood Article
- NavBar no longer returns null on `/` — renders on Hub page too
- Under the Hood Index already used NavBar; no change needed
- NavBar design: right-side drawer (260px), grouped sections with eyebrow labels + descriptors, animated hamburger, "NapaServe" wordmark + "Community Intelligence · Napa County" tagline, Contact → /about#contact

#### agent.html Fixes
- Title: "NapaServe — Research Agent" (was "Civic AI for Napa County")
- Footer tagline: "Community intelligence" (was "Civic intelligence")
- Nav drawer: added Under the Hood to Journalism section, fixed VW Labs href (/vw-labs, was /valley-works)
- Nav drawer styles matched to NavBar.jsx: group label color #8B7355, descriptor text below each group, drawer width 260px, Contact → /about#contact

#### Napa Valley Features
- Dual poll sections: Recent Reader Pulse + Most Engaged All Time

#### Under the Hood Index
- RAG summary extraction fixed to use complete sentences
- Archive fetch limit: 300
- Reader Pulse polls integrated
- Topic toggle view

#### Domain Redirects
- valleyworkscollaborative.org → napaserve.org
- valleyworkslab.org → napaserve.org

---

## March 27, 2026 Session — Changes Made

### New Article: Under the Hood — How a Global Supply Shock Reaches Napa Valley
- File: `napaserve-under-the-hood-supply-chain.jsx`
- Slug: `napa-supply-chain-2026`
- Route: `/under-the-hood/napa-supply-chain-2026`
- 4 Chart.js charts (Hormuz traffic, commodity before/after, energy price shock, Napa GDP/employment gap)
- 1 interactive scenario calculator (3 sliders, 3 outputs + animated SVG dollar coin)
- All charts use afterDatasetsDraw plugin for gap fills (never use fill: '+0' or '+1')
- 3 polls seeded (IDs 15–17) via `pipeline/seed_article_polls.py`
- 12 sourced URLs in Sources section
- Related coverage links with "Read on Substack →" external links
- Currently in draft mode (published=false in napaserve_articles)

### Draft/Publish System
- `napaserve_articles` Supabase table: slug, title, publication, published, published_at, polls_seeded, admin_cards_added, related_coverage_added
- `useDraftGate` hook (`hooks/useDraftGate.js`): fetches `/api/article-status`, gates article rendering
- `DraftBanner` component (`components/DraftBanner.jsx`): fixed gold-bordered bar for admin draft preview
- Three new Worker routes: GET `/api/articles`, GET `/api/article-status`, POST `/api/publish-article`
- `/api/publish-article` uses `env.SUPABASE_KEY` (service role) for writes
- Admin.jsx: fetches all articles (including drafts), shows DRAFT/LIVE badges, Publish button

### Under the Hood Index — Dynamic
- Napa Valley Features tiles now fetched from `/api/articles?published=true` on mount
- Falls back to hardcoded tiles if fetch fails
- Sonoma/Lake sections remain static (no DB rows yet)
- "Recent Under the Hood" section also populated dynamically

### Contact Email Migration
- All mailto links across all .jsx, .js, .html files changed to `info@napaserve.com`
- `napaserve@gmail.com` and `valleyworkscollaborative@gmail.com` are obsolete
- Footer.jsx bottom-right plain-text email → clickable mailto link
- About page `id="contact"` anchor added for `/about#contact` scroll

### Admin Page Enhancements
- BlueSky Publisher section fetches all articles from `/api/articles` (no published filter)
- DRAFT badge (gold pill) on unpublished cards, LIVE (muted green) on published
- Publish Article button on draft cards — calls POST `/api/publish-article` with HMAC token
- Reloads article list on successful publish
- Export data entry added for napa-supply-chain-2026

### Pipeline
- `seed_article_polls.py` dry-run fixed: prints local POLLS list (not DB query)
- 3 supply chain polls added (slug: napa-supply-chain-2026, sort_order 1–3)
- No hardcoded `"id"` on new entries — Supabase auto-assigns

---

## Under the Hood Articles — Pattern

- Index: `under-the-hood-index.jsx` — dynamic, fetches published articles from `/api/articles?published=true`
- NVF tiles built from API response; Sonoma/Lake tiles remain static (no DB rows yet)
- Article slug: kebab-case (e.g. `napa-cab-2025`, `napa-supply-chain-2026`)
- Draft/publish gate: `useDraftGate(slug)` hook checks `/api/article-status`, returns published/draft/redirect
- Draft articles visible only to logged-in admins (sessionStorage `admin_token`); others redirected to `/under-the-hood`
- `DraftBanner` component renders fixed gold bar above NavBar for admin draft preview
- Polls seeded in `napaserve_article_polls` with matching `article_slug`
- Charts use Chart.js from Cloudflare CDN (no build dependency)
- RAG search (ArchiveSearch component) wired inline at bottom of article
- Archive fetch limit: 300 (increased from 200)
- Hub card shows green LIVE dot when articles are available
- Admin.jsx: fetches all articles from `/api/articles` (no filter), shows DRAFT/LIVE badges, Publish button on drafts

### Article Poll Registry

| Slug | Poll IDs | Status |
|------|----------|--------|
| napa-cab-2025 | 1–3 | Live |
| sonoma-cab-2025 | 4–6 | Live |
| lake-county-cab-2025 | 7–9 | Live |
| napa-gdp-2024 | 10–14 | Live |
| napa-supply-chain-2026 | 15–17 | Live |
| napa-population-2025 | 18–20 | Draft — 5 open flags |
| napa-structural-reset-2026 | 21–23 | Live April 4, 2026 |

### Under the Hood Article Files

| Route | File | Slug |
|-------|------|------|
| /under-the-hood/napa-cab-2025 | napaserve-under-the-hood-v2.jsx | napa-cab-2025 |
| /under-the-hood/napa-supply-chain-2026 | napaserve-under-the-hood-supply-chain.jsx | napa-supply-chain-2026 |
| /under-the-hood/napa-gdp-2024 | under-the-hood-gdp-2024.jsx | napa-gdp-2024 |
| /under-the-hood/sonoma-cab-2025 | under-the-hood-sonoma.jsx | sonoma-cab-2025 |
| /under-the-hood/lake-county-cab-2025 | under-the-hood-lake.jsx | lake-county-cab-2025 |
| /under-the-hood/napa-structural-reset-2026 | under-the-hood-napa-structural-reset.jsx | napa-structural-reset-2026 |
| /under-the-hood/calculators | napaserve-calculators.jsx | — |

## April 5, 2026 Session
- Built /under-the-hood/calculators — 4 calculators + Regional Contraction Tracker + jump-to TOC
- File: economic-pulse-app/src/napaserve-calculators.jsx (imports NavBar, Footer — does NOT redefine them)
- NavBar: Models & Calculators added to Intelligence group
- UTH index: tile added linking to /under-the-hood/calculators
- Contraction Tracker: static TRACKER_EVENTS array, manually updated, 12 events seeded
- GDP bar chart fix: FLOOR=9500 normalization so 2026 scenario bar is visibly lower than 2024 baseline
- Commits: 239b44e (error boundary debug), 9b3d116 (main build), 5c00e98 (TOC + fixes)
- Next: confirm Dismal Math Substack URL via nvf_posts DB query

## April 8, 2026 Session — Research Agent Rebuilt ✅

agent.html architectural debt is RESOLVED. The Research Agent is now a full React component.

### What changed
- New file: `economic-pulse-app/src/napaserve-agent.jsx` — full React component
- Route: /agent (added to App.jsx)
- NavBar and Footer imported automatically — zero manual maintenance
- agent.html at repo root: meta-refresh redirect to /agent only — do not edit for content
- NavBar.jsx and Footer.jsx: /agent.html links updated to /agent
- API: calls /api/rag-answer (Cloudflare Worker) — grounded in NVF archive + Claude
- Mobile: isMobile useState(window.innerWidth < 700) + resize listener (NOT CSS media queries)
- Mobile layout: column-reverse — chat/input above example questions on narrow screens

### Design
- Theme 02 Cream throughout — inline styles only
- HOW TO USE label above banner (matches sidebar pillar label pattern)
- Input bar above messages (immediately visible without scrolling)
- Sidebar groups labeled: People & Well-Being — Example Questions, etc.
- Welcome state: NapaServe Community Intelligence Agent heading + pillar pills
- Hint line: CI is one tool within a larger system of community knowledge

### Key commits (April 8, 2026)
- 8cc5c2a — feat: convert Research Agent to React
- e9991cb — fix: /api/rag-answer not /api/claude
- e47b97f — feat: input above messages, CI framing
- 953159f — fix: isMobile responsive layout
- 31ff347 — fix: column-reverse mobile, example questions copy
- aba27c5 — fix: no Oxford commas, Example Questions sidebar labels

### Reference doc
NapaServe_ResearchAgent_Status_2026-04-08.docx — full architecture, design and rules

---

## April 8, 2026 Session — Additional Changes

### Event Submit Form
- embed-events.html location: repo root (NOT economic-pulse-app/public/) — confirmed
- YOUR INFO section added to both embed-events.html and napaserve-event-finder.jsx
- Fields: Your Name * (submitted_by, required), Your Email * (organizer_contact, required), Your Phone (submitter_phone, optional)
- On-screen confirmation: "Thank you, [firstName]!" + "Add Another" + "Back to Search" buttons
- napaserve-event-finder.jsx writes DIRECT to Supabase REST (not Worker)
- embed-events.html POSTs to /api/submit-event Worker route
- community_events: added submitter_name, submitter_email, submitter_phone columns (text, nullable)
- No confirmation email — on-screen only. Admin token safeguard planned before digest send.
- TextEdit trap confirmed: never save .html files from TextEdit — converts to Cocoa stub. Use VS Code or str_replace only.

### Site-Wide ScrollToTop
- ScrollToTop component added to App.jsx — covers all 22 routes
- Mounted as first child of <BrowserRouter> before <Routes>
- Agent page fix: useEffect bottomRef.current?.scrollIntoView guarded with if (messages.length > 0)
- Pattern: any component with scroll useEffect can override ScrollToTop — always guard with state

### Project Evaluator Compass
- Chart is hand-drawn canvas (getContext('2d')) — NOT Chart.js
- Pillar colors use hex alpha suffixes (1A, 8C) — not globalAlpha
- Multi-word axis labels now split onto two lines at word midpoint
- N/E/S/W compass markers removed — do not re-add
- Label offset: oR + 26 (pulled in from oR + 36 to prevent edge clipping)
- Pillar wedge shading: hex alpha 1A (10%) | Pillar label opacity: hex alpha 8C (55%)

### Key Commits
- 39b93bb — embed-events.html: phone field + confirmation
- 7334246 — napaserve-event-finder.jsx: YOUR INFO section cleanup
- 3522552 — App.jsx: ScrollToTop site-wide
- 35b1f29 — napaserve-agent.jsx: guard bottomRef scroll on mount
- d853d3f — napaserve-project-evaluator.jsx: two-line compass labels
- 878bed1 — napaserve-project-evaluator.jsx: NESW removed, opacity/shading
- 1751e85 — napaserve-project-evaluator.jsx: label offset oR+26

## Mobile Responsiveness — Site-Wide Standard (April 9, 2026)

CRITICAL: Never put gridTemplateColumns in inline styles — use index.css classes.
Inline styles always beat CSS on mobile Safari. Pattern: className on element, desktop default + @media override in index.css.

Established classes (all 1fr at max-width 600px):
.grid-2col .grid-3col .grid-4col .vw-pillars .vwl-focus .vwl-steps .kpi-grid .calc-section .calc-card .donut-chart-container

April 8-9 critical rules:
- TextEdit trap: never save .html from TextEdit — wipes content silently
- embed-events.html at repo root not economic-pulse-app/public/
- No @supabase/supabase-js — raw REST fetch only
- community_events has submitter_name/email/phone columns

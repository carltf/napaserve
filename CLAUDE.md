# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev        # Start Vite dev server (localhost:5173)
npm run build      # Production build → dist/
npm run lint       # ESLint (JS/JSX, no TypeScript)
npm run preview    # Preview production build locally
```

## Brand & Naming

- **Platform**: NapaServe — "Community Intelligence for Napa Valley"
- **Parent org**: Valley Works Collaborative (VWC)
- **Innovation arm**: VW Labs / ValleyWorks Labs
- **Media network**: Napa Valley Features
- **Dashboard**: Community Pulse (the `/dashboard` page)
- **Never use**: "Napa Valley Focus" (old name), "Napa Valley News Group" (unaffiliated), "Economic Dashboard", "Economic Pulse"
- **Framing**: Community intelligence is the foundation — local journalism, public data, polling, archives and resident knowledge. AI is one tool within that system, not the system itself. This framing should be consistent across all pages.

## Editorial Style

- **AP style throughout** — no Oxford commas in any user-facing copy
- No em-dash spacing issues
- Bare `/` in JSX text causes esbuild "Unterminated regular expression" — use `·` instead

## Design System — Theme 02 Cream

- **Background**: `#F5F0E8`, **Surface**: `#EDE8DE`, **Ink**: `#2C1810`
- **Accent brown**: `#8B5E3C`, **Gold**: `#C4A050`
- **Muted text**: `#7A6A50`, **Dim text**: `#8B7355` (NOT `#A89880` — too low contrast on cream)
- **Headings**: Libre Baskerville (Google Fonts), **Body**: Source Sans 3 (Google Fonts)
- **Body text**: 17px, **Secondary/meta/dates**: 14px, **Eyebrow labels**: 11px uppercase
- **No CSS files** — all inline styles or `<style>` tags with `@media` queries
- No CSS modules, Tailwind, or CSS-in-JS libraries. Colors/fonts defined as JS objects.

## Architecture

**NapaServe** is a civic intelligence platform for Napa County — a React SPA with a Cloudflare Worker backend.

### Tech Stack
- **Frontend**: React 19 + React Router 7 + Vite 7, Recharts for charts
- **Backend**: Cloudflare Worker (`src/worker.js`) — handles RAG search, poll search, FRED data proxy, Substack proxy, subscribe
- **Database**: Supabase PostgreSQL (vector search via `nvf_search()` and `nvf_poll_search()` RPC, economic snapshots, polls, subscribers)
- **AI**: Anthropic Claude (`claude-sonnet-4-20250514`) for RAG answers, Claude Haiku (`claude-haiku-4-5-20251001`) for poll classification, Voyage AI (`voyage-3`) for embeddings
- **Deployment**: Vercel (frontend SPA), Cloudflare Workers (API — manually deployed, not auto-deployed by Vercel)

### Key Design Decisions
- **Pure JSX** — no TypeScript
- **All inline styles** — see Design System above

### Routing (App.jsx)
`/` Hub · `/dashboard` Community Pulse · `/evaluator` Project Evaluator · `/events` Event Finder · `/news` NVF Journalism · `/archive` RAG Archive Search · `/valley-works` Valley Works · `/vw-labs` VW Labs · `/about` About

### Data (live as of March 16, 2026)
- **nvf_posts**: 997 posts, 10,033 chunks — Voyage-3 embeddings for RAG search
- **nvf_polls**: 1,603 polls, all classified by theme via Claude Haiku
- **nvf_poll_embeddings**: 1,603 Voyage-3 embeddings for semantic poll search
- **economic_pulse_snapshots**: weekly ABC, FRED, Zillow data
- **napaserve_subscribers**: newsletter signups from hub subscribe form

### RAG Pipeline
1. Query → Cloudflare Worker → Voyage AI embedding → Supabase `nvf_search()` (997 posts, 10,033 chunks)
2. For AI answers: top chunks → Claude synthesis → 2-4 paragraph response with sources
3. Shared hook: `src/hooks/useRag.js` (ragSearch, ragAnswer, buildRagContext)

### Worker API Endpoints (`src/worker.js`)
- `GET  /substack/archive` — Substack RSS proxy for NVF journalism feed
- `GET  /api/health` — health check
- `POST /api/rag-search` — vector similarity search over article chunks
- `POST /api/rag-answer` — AI-synthesized answer with sources
- `POST /api/poll-search` — semantic search over poll questions
- `GET  /api/fred` — FRED macroeconomic data proxy (12 series)
- `POST /api/subscribe` — newsletter signup → napaserve_subscribers table

### Vercel Build
`vercel.json` runs build from `economic-pulse-app/` subdirectory and copies standalone `agent.html` into dist. All non-agent routes rewrite to `index.html` for SPA routing.

### Project Evaluator Scoring
Three pillars: Jobs (35%), People (35%), Place (30%) with 11 axes (Structural Compass). Each pillar averages to 0-10 scale, producing an overall rating (Strong/Good/Moderate/Caution). Evaluator calls `/api/evaluate` (Vercel serverless), not api.anthropic.com directly.

### GitHub Actions (`poll_pipeline.yml`)
Runs every Monday at 9 AM PT (UTC 16:00). Two parallel jobs:
1. **classify-polls** — classifies unthemed polls via Claude Haiku, Slack notification
2. **subscriber-digest** — fetches weekly subscriber signups, posts summary to Slack

Poll extraction (`poll_extraction.py`) requires local iCloud HTML exports and must be run manually.

### Environment Variables
- Cloudflare Worker secrets (via `wrangler secret put`): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`, `FRED_API_KEY`
- GitHub Actions secrets: `SUPABASE_URL`, `SUPABASE_KEY` (service role), `ANTHROPIC_API_KEY`, `SLACK_WEBHOOK_URL`
- Google Search Console: verified, sitemap at `/sitemap.xml`

## Critical Rules — Never Violate
- Bare `/` in JSX text causes esbuild "Unterminated regular expression" — use `·` instead
- Evaluator calls `/api/evaluate` (Vercel serverless) not api.anthropic.com directly — CORS
- Never change `napavalleyfocus.substack.com` — that is the working Substack URL even though brand = Napa Valley Features
- Always run `npm run build` locally before pushing to Vercel
- Archive page: always edit `src/pages/Archive.jsx` — never `src/Archive.jsx`
- Never delete `/substack/archive` worker route — actively used by frontend
- `worker.js` must be manually deployed to Cloudflare dashboard — Vercel does not auto-deploy it
- Downloaded files get " 2" suffix if duplicate in Downloads — delete old version first
- Dim text color is `#8B7355` not `#A89880` — the latter fails WCAG contrast on cream backgrounds

## Navigation — Required Drawer Order (Every Page)
- **Group 1 Journalism**: Napa Valley Features, NVF Archive Search
- **Group 2 Community**: Event Finder, Valley Works, VW Labs
- **Group 3 Intelligence**: Community Pulse, Project Evaluator, Research Agent
- **Group 4 Platform**: About NapaServe, Contact

## Accessibility
- All decorative SVGs have `aria-hidden="true"`
- All form inputs have `aria-label` attributes
- All `target="_blank"` links have `aria-label="[text], opens in new tab"`
- Skip-to-content link in NavBar.jsx targets `id="main-content"` on every page

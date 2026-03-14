# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev        # Start Vite dev server (localhost:5173)
npm run build      # Production build → dist/
npm run lint       # ESLint (JS/JSX, no TypeScript)
npm run preview    # Preview production build locally
```

## Architecture

**NapaServe** is a civic intelligence platform for Napa County — a React SPA with a Cloudflare Worker backend.

### Tech Stack
- **Frontend**: React 19 + React Router 7 + Vite 7, Recharts for charts
- **Backend**: Cloudflare Worker (`src/worker.js`) — handles RAG search, FRED data proxy, Substack proxy
- **Database**: Supabase PostgreSQL (vector search via `nvf_search()` RPC, economic snapshots)
- **AI**: Anthropic Claude (`claude-sonnet-4-20250514`) for RAG answers, Voyage AI (`voyage-3`) for embeddings
- **Deployment**: Vercel (frontend SPA), Cloudflare Workers (API)

### Key Design Decisions
- **Pure JSX** — no TypeScript
- **All inline styles** — no CSS modules, Tailwind, or CSS-in-JS libraries. Colors/fonts defined as JS objects using "Theme 02" palette (cream backgrounds, brown ink, gold accents)
- **Fonts**: Libre Baskerville (headings) + Source Sans 3 (body) via Google Fonts

### Routing (App.jsx)
`/` Hub · `/dashboard` Economic Dashboard · `/evaluator` Project Evaluator · `/events` Event Finder · `/news` NVF Journalism · `/archive` RAG Archive Search · `/valley-works` Workforce · `/about` About

### RAG Pipeline
1. Query → Cloudflare Worker → Voyage AI embedding → Supabase `nvf_search()` (997 posts, 10,033 chunks)
2. For AI answers: top chunks → Claude synthesis → 2–4 paragraph response with sources
3. Shared hook: `src/hooks/useRag.js` (ragSearch, ragAnswer, buildRagContext)

### Worker API Endpoints (`src/worker.js`)
- `POST /api/rag-search` — vector similarity search
- `POST /api/rag-answer` — AI-synthesized answer with sources
- `GET /api/fred` — FRED macroeconomic data proxy
- `GET /api/health` — health check
- `GET /substack/archive` — Substack RSS proxy for NVF journalism feed

### Vercel Build
`vercel.json` runs build from `economic-pulse-app/` subdirectory and copies standalone `agent.html` into dist. All non-agent routes rewrite to `index.html` for SPA routing.

### Project Evaluator Scoring
Three pillars: Jobs (35%), People (35%), Place (30%) with 11 axes (Structural Compass). Each pillar averages to 0–10 scale, producing an overall rating (Strong/Good/Moderate/Caution). Evaluator calls `/api/evaluate` (Vercel serverless), not api.anthropic.com directly.

### Environment Variables
Cloudflare Worker secrets (via `wrangler secret put`): `SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`, `FRED_API_KEY`

## Critical Rules — Never Violate
- Bare `/` in JSX text causes esbuild "Unterminated regular expression" — use `·` instead
- Evaluator calls `/api/evaluate` (Vercel serverless) not api.anthropic.com directly — CORS
- Never change `napavalleyfocus.substack.com` — that is the working Substack URL even though brand = Napa Valley Features
- Always run `npm run build` locally before pushing to Vercel
- Archive page: always edit `src/pages/Archive.jsx` — never `src/Archive.jsx`
- Downloaded files get " 2" suffix if duplicate in Downloads — delete old version first
- Never delete `/substack/archive` worker route — actively used by frontend

## Navigation — Required Drawer Order (Every Page)
- **Group 1 Journalism**: Napa Valley Features, NVF Archive Search
- **Group 2 Community**: Event Finder, Valley Works, VW Labs
- **Group 3 Intelligence**: Economic Dashboard, Project Evaluator, AI Policy Agent
- **Group 4 Platform**: About NapaServe, Contact

## Brand Rules
- **Platform**: NapaServe
- **Parent org**: Valley Works Collaborative (VWC)
- **Innovation arm**: VW Labs / ValleyWorks Labs
- **Media**: Napa Valley Features (never "Napa Valley Focus" or "Napa Valley News Group")

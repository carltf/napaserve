# NapaServe — Claude Code Reference
Last updated: April 13, 2026

## Directory & Commands
- Repo: ~/Desktop/napaserve
- Launch: cd ~/Desktop/napaserve && source .env && claude
- Build: cd economic-pulse-app && npm run build 2>&1 | tail -8
- Deploy: git add -A && git commit -m "message" && git push

## Critical Rules
- ctx.waitUntil() is required for ALL background async operations in Cloudflare Worker — without it Cloudflare kills background fetches when the response is sent
- CoveragePanel component (src/components/CoveragePanel.jsx) is the single source of truth for coverage display — never duplicate inline in agent or evaluator
- SECONDARY_SOURCES must be updated in BOTH coverageUtils.js (React) AND worker.js (Cloudflare) when adding a new category
- agent.html at repo root is a REDIRECT ONLY — route is /agent (napaserve-agent.jsx)
- Research Agent API route: /api/rag-answer — NOT /api/claude (404)
- All Anthropic API calls use callAnthropicWithRetry() — 3 retries on 529 with linear backoff

## Worker Deploy — CRITICAL
open -a TextEdit ~/Desktop/napaserve/economic-pulse-app/src/worker.js
→ Select All → Copy → Cloudflare dashboard → misty-bush-fc93 → Save and Deploy
NEVER use pbcopy — truncates large files
NEVER save .html files from TextEdit — silently wipes content

## Chart Download — CRITICAL (scale:2 rules — NEVER VIOLATE)
html2canvas uses scale:2 — ALL drawn text must be at 2x intended display size:
- Title: bold 32px (renders as 16px), x=28, y=16, color T.ink, globalAlpha 1.0
- Watermark: 26px Source Code Pro (renders as 13px), bottom-right, globalAlpha 0.25
- Bare canvas charts: off.height = canvas.height + 48, ctx.drawImage(canvas, 0, 32)
- Bordered/padded components (calculator, html2canvas on div): off.height = canvas.height + 80, ctx.drawImage(canvas, 0, 64)
- Captions required: every article build must produce title + 2-3 sentence summary + source for every downloadable chart/calculator
- napaserve.org watermark on all chart downloads
- Download button must be OUTSIDE containerRef div — sibling not child

## Publish — If Admin Button Fails
Go straight to direct Supabase PATCH — do NOT debug HMAC token:
curl -s -X PATCH "https://csenpchwxxepdvjebsrt.supabase.co/rest/v1/napaserve_articles?slug=eq.[SLUG]" \
  -H "apikey: $SUPABASE_KEY" -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"published": true, "published_at": "now()"}'

## Env Sourcing
Use: set -a && source .env && set +a
NOT: source .env alone (variables don't export without set -a)
Always: unset SUPABASE_KEY after use

## Tech Stack
- React/Vite · economic-pulse-app/ · Vercel auto-deploys on push to main
- Supabase: csenpchwxxepdvjebsrt.supabase.co · No @supabase/supabase-js — raw REST fetch only
- Worker: misty-bush-fc93.tfcarl.workers.dev
- Theme 02 Cream: bg #F5F0E8, surface #EDE8DE, ink #2C1810, accent #8B5E3C, gold #C4A050, muted #8B7355
- Fonts: Libre Baskerville (headings), Source Sans 3 (body) — inline styles only
- Old dark theme #0F0A06 is OBSOLETE

## Mobile/CSS Rules
NEVER put gridTemplateColumns in inline styles — inline always beats CSS on mobile Safari
Use CSS classes in index.css with @media (max-width: 600px) overrides
isMobile useState + resize listener for component layouts

## UTH Component Order — ALL 7 REQUIRED IN THIS EXACT ORDER
1. Article prose + charts + calculator (inline JSX)
2. Related Coverage (inline JSX — NOT imported)
3. ArchiveSearch (inline function — NOT imported)
4. Sources (specific article URLs — never bare domains)
5. Author note (bordered div wrapper)
6. PollsSection (inline function)
7. Methodology (borderTop: 2px solid + h3)
Template: under-the-hood-template.jsx — ALWAYS copy from this, never from a live article

## Poll Component Pattern
Worker returns counts (object keyed by index) and total (scalar) — NOT vote_counts array
useState(poll.counts || {}) and useState(poll.total || 0)
After vote: setCounts(data.counts); setTotal(data.total)

## Source Link Standards
Always use specific article URLs — never bare domain links
Attribute named journalists inline when citing their reporting
Substack profile links belong early in prose — not mid-quote

## Poll Slug Registry
napa-cab-2025: 1-3 | sonoma-cab-2025: 4-6 | lake-county-cab-2025: 7-9
napa-gdp-2024: 10-14 | napa-supply-chain-2026: 15-17 | napa-population-2025: 18-20 (reserved)
napa-structural-reset-2026: 21-23 | napa-price-discovery-2026: 24-26
Next article starts at poll ID 27

## Article Registry (April 12, 2026)
LIVE: napa-cab-2025, sonoma-cab-2025, lake-county-cab-2025, napa-gdp-2024,
      napa-supply-chain-2026, napa-structural-reset-2026, napa-price-discovery-2026
DRAFT: napa-population-2025 (5 open flags — do not publish)

## Key File Locations
- src/utils/coverageUtils.js — SECONDARY_SOURCES, classifyQuery(), coverageSignal() — shared by Agent + Evaluator
- src/components/CoveragePanel.jsx — Archive Coverage indicator + Official & Regional Sources UI

## Key Tables
- napaserve_articles: slug, headline, published, polls_seeded, admin_cards_added, related_coverage_added, topic_seed
- napaserve_article_polls: article polls (IDs 1-26 used)
- community_events: status='approved', description NOT NULL, has submitter_name/email/phone
- nvf_posts: 1000+ NVF articles with substack_url — always query for confirmed URLs
- coverage_gaps: query, category, tier (low/medium/strong), chunk_count, top_similarity, asked_at

## Cloudflare Worker Secrets (all must be present)
- ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_KEY
- SUPABASE_KEY — service role key — was missing until April 13, 2026; caused coverage_gaps logging to fail silently

## GitHub Actions
- poll_pipeline.yml now has 4 jobs: classify-polls, subscriber-digest, events-digest, coverage-gaps-digest (NEW April 13)
- coverage-gaps-digest: queries coverage_gaps last 7 days, posts tier breakdown to Slack every Monday

## Agent UX Rules
- Error message pattern: "The CI Agent is temporarily busy — please try again in a moment. (error type)"
- Scroll: only scroll to bottom on assistant reply — never on user message submit (useEffect on role === assistant)

## Evaluator Rules
- Disclaimer: "Community Intelligence (CI)-generated" (not "AI-generated")
- Error messages aligned with agent pattern

## Architecture Rules
- NavBar.jsx and Footer.jsx: single shared components — never redefine inline
- agent.html at repo root is meta-refresh redirect only — content is at /agent (React)
- embed-events.html at repo root — NOT economic-pulse-app/public/
- Bare / in JSX causes esbuild errors — use · instead
- ScrollToTop in App.jsx covers all routes — guard scroll effects with state
- Admin sessionStorage key: admin_token (NOT adminToken)
- Admin "View article" links must NOT use target="_blank" (loses session token)

## File Editing Traps
- grep against assumed filenames frequently fails — check directory listing first
- sed -n 'X,Yp' reliable for reading specific line ranges before str_replace
- Claude Code summarizes file output by default — instruct "Do not summarize. Print every line."

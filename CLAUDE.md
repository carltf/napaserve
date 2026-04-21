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
- nvf_polls.substack_url was null until April 13 backfill — never assume it's populated without checking
- napaserve_articles deck column exists — include in SQL INSERTs for new articles going forward
- isRecent(publishedAt, 14) — admin page pattern for collapsing old article cards to compact rows
- digest-send.js enforces preview_only server-side — UI gate alone is not sufficient for broadcast ops
- Under the Hood index (under-the-hood-index.jsx): read entire file before making any changes — data sources are nvf_polls (archive), nvf_posts (NVF section), napaserve_articles (tile cards)

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
- napaserve_articles: slug, headline, deck, published, polls_seeded, admin_cards_added, related_coverage_added, topic_seed
- napaserve_article_polls: article polls (IDs 1-26 used)
- community_events: status='approved', description NOT NULL, has submitter_name/email/phone
- nvf_posts: 997 NVF articles with substack_url — always query for confirmed URLs
- nvf_polls: 1,719 rows — substack_url backfilled from nvf_posts April 13 — archive links use this
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

## Admin Page
- Event Moderation: approve/reject community_events pending submissions — Worker routes /api/admin-approve-event and /api/admin-reject-event
- Digest tool: two-step send — preview required before live send, server enforces preview_only
- Article cards: isRecent() 14-day threshold, ArchivedArticleRow for older articles
- ARTICLES array in napaserve-admin.jsx has publishedAt for all 8 articles

## Under the Hood Index — Data Sources
- Tile cards (NVF section): napaserve_articles table via /api/articles Worker route — includes deck
- Archive list: nvf_polls table — substack_url now populated (backfilled April 13)
- Planned: 'From NVF' section → nvf_posts where series='Under the Hood' → substack_url
- Static tiles: Sonoma and Lake County defined in STATIC_SECTIONS array in JSX
- CSS grid: uth-article-grid class in index.css with @media (max-width: 600px) override — ready to use

## Secondary Sources — Verified April 13
- All 36 URLs verified live — all index/landing pages, no PDFs
- County domain: napacounty.gov (countyofnapa.org retired)
- Key verified URLs: EDD /geography/msa/napa.html, NVV /napa_valley/, NASS Grape Crush index page, UC Extension ucanr.edu/county/napa-county-ucce

## File Editing Traps
- grep against assumed filenames frequently fails — check directory listing first
- sed -n 'X,Yp' reliable for reading specific line ranges before str_replace
- Claude Code summarizes file output by default — instruct "Do not summarize. Print every line."

## Session April 18, 2026 — Population Article Rewrite + Permanent SOPs

### Article state changes
- napa-population-2025: rewritten end-to-end from editor memo, frozen in DRAFT. Awaiting May 2026 DOF E-1 release before publish. Poll IDs 18-20 reserved but not seeded.
- Seven Phase 1 commits (31a9cfa, 7d241fd, c47ecba, 181f183, f889c27, c6cc879).
- Chart 1 uses authoritative DOF E-4 May 2025 benchmark (2011-2020 with 2010 and 2020 Census Benchmarks): peak 141,119 in 2016.

### Permanent SOPs
1. Every Claude Code prompt is fully self-contained inside a `cat << 'RULES' ... RULES` heredoc. Backup (cp) commands outside the heredoc as executable shell lines.
2. NVF canonical Substack domain: napavalleyfocus.substack.com (never napavalleyfeatures).
3. Data vintage rule: primary-source DOF landing pages take precedence; always use newest E-4 benchmark (currently May 2025).
4. Caption SOP: single italic block, "Title. Description. Source: [link](url) (range)."
5. JSX plain attr strings don't interpret \u escapes — use real en-dash/em-dash characters.
6. DOF release timing: always include year; flag imminent next releases when publishing near April-May cycle.
7. Chart 1 annotation: Chart.js plugin with afterDatasetsDraw + fillText at peak/current indices.
8. Document format convention: session-close deliverables produced as real Microsoft Word 2007+ .docx (not plain text with .docx extension). Verify with `file [name].docx` — should say "Microsoft Word 2007+".

### Broken DOF links to fix on sight
- /forecasting/demographics/estimates-e4/ — 404
- Correct E-4 URL: /forecasting/demographics/estimates/e-4-population-estimates-for-cities-counties-and-the-state-2011-2020-with-2010-and-2020-census-benchmark/
- "DOF P-1A" is state-level; county equivalent is P-2A, 2020-2070, Baseline 2024
# CLAUDE.md Patch — April 18, 2026 (v2 / afternoon)

Append the following to CLAUDE.md in the repo root. These rules are additive to the existing content and capture lessons from today's afternoon session.

---

## Git Staging Rules (Added April 18, 2026)

**CRITICAL: NEVER use `git add -A` or `git add .` in this repo.**

This repo intentionally keeps `.bak-*` files and a `tmp/` directory locally for reference. A blanket `git add -A` picks these up and pollutes commits (as happened in commit 42b1e9c on April 18, 2026).

### Correct pattern

```bash
# Always stage explicit paths:
git add path/to/file1 path/to/file2
git commit -m "..."

# For a single-file fix:
git add economic-pulse-app/src/napaserve-event-finder.jsx
git commit -m "fix: ..."
```

### Enforcement

`.gitignore` was updated April 18, 2026 to exclude:
- `*.bak-*` — all backup files created during debug sessions
- `tmp/` — temporary data directory (xlsx exports, test artifacts, etc.)

These patterns will prevent accidental commits going forward, but the `-A` rule still stands as a best practice.

---

## Map Pin Rendering Rules (Added April 18, 2026)

**File:** `economic-pulse-app/src/napaserve-event-finder.jsx`

### hashJitter constraints

The `hashJitter` function applies a deterministic ~880m offset (scale = 0.008°) to separate visually-stacked map pins. It must **never** be applied to events that share a single venue — this causes the pin-spread bug that was visible for Cameo Cinema (10 events → 10 pins scattered across half a mile of St. Helena).

### Correct pattern

Group events by true coordinate key BEFORE applying jitter:

```javascript
// 1. Collect raw pins with true coords (no jitter)
const rawPins = [...(results.map || [])];
// ... collect DB fallbacks, etc.

// 2. Group by coord key (~11m granularity)
const coordKey = (p) => `${p.lat.toFixed(4)}|${p.lon.toFixed(4)}`;
const grouped = new Map();
rawPins.forEach(p => {
  const key = coordKey(p);
  if (!grouped.has(key)) grouped.set(key, { lat: p.lat, lon: p.lon, names: [p.name] });
  else grouped.get(key).names.push(p.name);
});

// 3. Build one pin per venue, with event-list label for multi-event venues
const pins = Array.from(grouped.values()).map(g => ({
  lat: g.lat, lon: g.lon,
  name: g.names.length === 1 ? g.names[0] : `${g.names.length} events: ${g.names.slice(0,3).join(' • ')}${g.names.length > 3 ? ` • +${g.names.length - 3} more` : ''}`,
}));

// 4. Apply jitter ONLY if multiple distinct venues share a near-identical coord (rare)
```

Landed in commit 4d1caf3.

---

## File Path Corrections (Added April 18, 2026)

The Event Finder component is at:

```
economic-pulse-app/src/napaserve-event-finder.jsx
```

It is NOT at `src/pages/napaserve-event-finder.jsx`. Any grep/sed operations should use the correct path.

---

## Canonical Weekender Format (Added April 18, 2026)

The standard structure for Weekender event lists (used in Napa Valley Features Friday Edition):

### Structure

1. **Intro paragraph** referencing specific events in the current list, ending with: "For the full picture, visit our Event Finder at napaserve.org/events."
2. **Ongoing events FIRST** — multi-day runs that cross the issue date. Lead with "Through [final date]." Then list remaining performances.
3. **Single-date events AFTER** in strict chronological order (by start date, then start time).

### Each event entry

- Title in H5 style (not bold paragraph text — this matters for Substack publishing).
- Date and start time on one line.
- Description: venue, performers/format, what to expect.
- Price line.
- "For more information visit their website[, email X]/[, or call Y]." The word "website" is hyperlinked to the source URL.
- Street address as the final element.

### Example pattern (ongoing event leading the list)

```
'Harvey'
Through May 3. UpStage Napa Valley presents Mary Chase's Pulitzer Prize-winning
comedy about Elwood P. Dowd and his invisible six-foot rabbit at Grace Episcopal
Church. Remaining performances are Friday, May 1 and Saturday, May 2 at 7:30 p.m.,
and Sunday, May 3 at 2:30 p.m. Tickets $26.50 to $36.50. For more information
visit their website. 1314 Spring St., St. Helena.
```

### Source attribution

The Napa Valley Register community calendar (Samie Hartley, published weekly) is a reliable source for events. Use when Event Finder scraper results are sparse.
# CLAUDE.md Patch — April 18, 2026 (v3 / evening)

Append the following to CLAUDE.md in the repo root. These rules are additive to existing content and capture lessons from the evening session on April 18, 2026.

---

## Chart Download Button — UI Standard (Added April 18, 2026)

Every chart with a PNG download button — in Under the Hood articles, the Regional Contraction Tracker, and any future calculator — must use this exact button style and placement.

### Rules

- **Label:** always exactly `DOWNLOAD CHART PNG` — uppercase, no icon, no variation
- **Position:** bottom-left, below the chart canvas — NOT in a header row above the chart
- **Button lives OUTSIDE the chart's containerRef** — otherwise it's captured in the PNG export

### Canonical JSX

```jsx
<button onClick={downloadFn} style={{
  padding: "4px 12px",
  fontFamily: "monospace",
  fontSize: 11,
  fontWeight: 400,
  letterSpacing: "0.88px",
  color: T.muted,        // #8B7355
  background: "transparent",
  border: `1px solid ${T.border}`,  // #D4C9B8
  borderRadius: 3,
  cursor: "pointer",
}}>
  DOWNLOAD CHART PNG
</button>
```

### Why this matters

This was an SOP gap. The button styling had been copy-pasted between article components since the first UTH piece, but never documented. When building the tracker's timeline chart, Claude Code reached for the generic accent-color button style and ended up with a non-matching visual that broke consistency. Landing this rule in CLAUDE.md means the next chart build uses the right pattern automatically.

Landed via commits `eba6a1b` (styling) and `c746372` (position).

---

## Regional Contraction Tracker — Chart Added (April 18, 2026)

The tracker at `/under-the-hood/calculators#tracker` now includes a Chart.js scatter timeline above the filter pills. Notes for future edits:

### Architecture

- **Library:** raw `chart.js` 4.5.1 via `useRef` + `useEffect`. Do NOT add `react-chartjs-2` as a dep — the project uses the raw library pattern throughout.
- **Data binding:** chart `datasets` derive from the existing `filtered` array in `ContractionTracker`. Do NOT create a separate state for chart data — unified filter behavior depends on this binding.
- **Jitter:** deterministic ±0.15 y-offset computed from headline string hash. Prevents same-category same-month dots from overlapping. Don't make this random — determinism means the chart doesn't flicker between reloads.
- **Mobile:** outer wrapper uses `overflowX: auto`, inner div has `minWidth: 720`. Do NOT use CSS media queries — the file is inline-styles-only.
- **Download:** uses `chart.toBase64Image()` with a temp canvas for title + watermark. No `html2canvas` needed for Chart.js canvases.

### Location

- Component: `ContractionTracker` function in `economic-pulse-app/src/napaserve-calculators.jsx`
- Array: `TRACKER_EVENTS` at line 627 of the same file
- Canvas ref + chart ref declared at top of component
- `useEffect` with `[filtered]` dependency rebuilds the chart when filter changes

Landed via commit `910faa9`.

---

## Napa Reset Watch — External Scout Project (April 18, 2026)

A standalone Claude project handles the weekly scouting workflow for Tracker candidates and Under the Hood seeds. It lives OUTSIDE this repo — but the handoff pattern matters for anyone working in NapaServe project threads.

### Handoff pattern

When the user arrives with a block of JSX object literals (like this):

```javascript
{
  date: "Apr 14, 2026",
  category: "Transaction",
  headline: "...",
  detail: "...",
  source: "...",
  sourceUrl: "...",
},
```

...they came from Napa Reset Watch. The task is to add those objects to `TRACKER_EVENTS` in chronological order (newest first, under the `// ── 2026 ──` comment).

### Standard Claude Code prompt flow for ingesting JSX blocks

1. Locate where the entries belong chronologically — `grep -nE '^\s*date: "' economic-pulse-app/src/napaserve-calculators.jsx`
2. Show the bracket context to the user before inserting — confirm placement
3. Use `str_replace` to insert the block at the confirmed location
4. `npm run build 2>&1 | tail -8`
5. Commit with explicit paths (NEVER `git add -A`) and push

### Rules for Napa Reset Watch ingestion

- **Never fabricate dates or URLs.** If the JSX block has a suspicious URL, flag it before inserting.
- **Respect chronological order.** Entries in `TRACKER_EVENTS` are strictly reverse-chronological. New items go at the top of their date cluster.
- **Update-in-place vs. insert.** If an entry already exists for the same entity and the new JSX has additional detail, treat it as an update (str_replace the detail field) rather than inserting a duplicate.
- **Event count is `TRACKER_EVENTS.length`** — the counter on the page reads from this. Don't assume a commit added N events without counting.

---

## PostgREST URL encoding

When filtering Supabase REST calls on a `timestamptz` column, never f-string the ISO timestamp into the URL — the `+00:00` timezone offset contains a raw `+` that PostgREST interprets as a space, returning `400 Bad Request`.

**Wrong:**
```python
r = requests.get(
    f"{SUPABASE_URL}/rest/v1/table"
    f"?select=cols&asked_at=gte.{iso_timestamp}&order=asked_at.desc",
    headers=headers,
)
```

**Right:**
```python
r = requests.get(
    f"{SUPABASE_URL}/rest/v1/table",
    headers=headers,
    params={
        "select": "cols",
        "asked_at": f"gte.{iso_timestamp}",
        "order": "asked_at.desc",
    },
)
```

`requests` URL-encodes `params=` values automatically. Applies to any filter value containing `+`, `&`, `#`, or spaces. First hit: `coverage-gaps-digest` job in `poll_pipeline.yml`, fixed 2026-04-20 (commit `0ad72bd`).

---

## Update — April 21, 2026

### New Article Live (as Draft)

- **Slug:** `napa-constellation-2026`
- **Headline:** "From Selling Napa to Defending It"
- **Publication:** Napa Valley Features
- **Byline date:** April 21, 2026
- **Status:** `published=false`, `polls_seeded=true`, `admin_cards_added=true`, `related_coverage_added=true`
- **Polls:** IDs 27, 28, 29
- **URL:** https://napaserve.org/under-the-hood/napa-constellation-2026
- **Commits:** de0fcee, 30f277a, f78b73f
- **Bundle:** index-KAJdoyJ_.js
- **Known issue:** EXPORT_DATA shape broken; admin Word export returns "Chart undefined" placeholders. Fix pending next session.
- Week 1 of three-part April series (Constellation / Marketing Machine / Population).

### Section 0 — Ground Truth Verification (PLATFORM-WIDE)

Before any Claude Code prompt, SQL query, or content deliverable:

- **Code:** verify against the actual file in the repo at `main` (grep/view).
- **Data:** verify against the current Supabase table state (curl to REST).
- **Rendering:** verify against the live production page (Chrome).
- **Infrastructure:** verify against current worker.js, admin.jsx, workflow files.

Pre-execution checklist required in thread:
1. What am I assuming? (3–5 assumptions)
2. How have I verified each? (cite file/query/URL)
3. If unverified, verify or flag.

**Reality wins when docs disagree.** Fix whichever is wrong and update docs.

**Stop, don't reinterpret.** When verification returns unexpected output, re-verify — don't guess around the gap.

### UTH Template Canonical Patterns (LOCKED April 21, 2026)

- **Related Coverage:** simple `<ul>` list, NOT 4-card grid. Bold serif title in quotes, em-dash, muted publication·date attribution. Matches template lines 518–541.
- **Component order:** prose → byline → Related Coverage → Archive Search → PollsSection → Sources → Methodology.
- **Sources:** hand-written JSX ordered list at article bottom, scientific-paper style. No const SOURCES array.
- **Archive Search heading:** "Search the Archive"

### Chart.js Category Y-Axis Pattern (NEW)

For charts with discrete categorical y-values, use `type: "category"` with explicit `labels` array — NOT numeric linear axis with callback (labels clip to zero width).

```javascript
y: {
  type: "category",
  labels: CATEGORIES,
  reverse: true,  // optional
  offset: true,
  ticks: { color: T.muted, font: { family: font, size: 13 }, padding: 8 },
  grid: { color: T.rule },
  afterFit: (scale) => { scale.width = 110; },
}
```

Add `layout.padding` at options top level. POINTS y-values are category strings, not numeric indices.

### Formatting Standards (LOCKED)

- `%` default; "percent" only when word form required
- Title Case section headings with optional colon
- No "Under the Hood:" prefix in headline
- Real em/en-dashes, never `--` or `\u2014`
- `$823.8 million` in prose; short forms in chart labels only
- AP date style (April 5, April 20, 2026)
- No bullets in body prose — lists go in charts/tables/three-card sections
- One-through-nine spelled; 10+ numerals
- Org shortforms on 2nd reference: NVV, NVG, CNV, Farm Bureau, Constellation, Mondavi, Ninth Circuit, SVB

### Poll Seeder Reminder

`pipeline/seed_article_polls.py` has hardcoded POLLS list (lines 21–209). For every new article, three poll dicts must be added to the Python file BEFORE live seed. Dry-run must confirm 3 polls.

### Resource Hierarchy for Editorial Research

1. NapaServe archive (Chrome at /archive; SQL for bulk)
2. NVF Research Agent (/agent)
3. Regional Contraction Tracker
4. Coverage Gap Intelligence (`coverage_gaps` table)
5. External web_search/web_fetch (last resort)

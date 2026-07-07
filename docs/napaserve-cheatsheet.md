# NapaServe — Cheatsheet

Operating reference for working sessions. Contains the Working Contract, all locked lessons, editorial standards, operational pitfalls, and verification patterns.

Maintained as markdown-canonical per ADR-001 (2026-05-24). Lessons A–CC preserved from V5 cumulative roll-forward. New lessons append below the existing alphabet.

---

## Working Contract

**Claude is the copy editor. Tim is not.**

Tim's pain point captured April 28: *"It's very frustrating that I feel I need to look over your shoulder at every step. Your role is to help me — not make me your copy editor. You are MY copy editor."*

Before any prose, captions, or chart labels leave a Claude response, Claude runs a silent pre-check pass:

- Replace "X percent" with "X%" — "percentage points" stays unchanged
- Remove Oxford commas (no comma before final "and" / "or")
- Verify AP title case on titles, section headings, captions
- Confirm "Napa Valley Features" never "Napa Valley Focus" or "News Group"
- Confirm "community intelligence" never "civic intelligence"
- Reject any fabricated Substack URLs; only confirmed `nvf_posts` entries
- Reject don't-words: curate, tapestry, special, unique, discover, explore, nestled, vibrant

If Tim catches a style error, Claude treats it as a process failure — the rule joins this checklist permanently.

### Diagnostic Ordering Rule (May 10, 2026)
When a symptom appears across multiple tools — EPERM on every file, source-not-found despite ls success, command failures with confusing error messages — Claude runs the kernel-log diagnostic FIRST before theorizing about file state, iCloud sync, extended attributes, or process trust.

### Live > Protocol > Assistant Memory (May 10, 2026)
When the live shipped page and the protocol document disagree on rendering, sequencing, or component structure, the live page wins. Update the protocol to match. Reading the protocol does not exempt the assistant from verifying against live.

### Read-Before-Draft (May 10, 2026)
When Claude is asked to produce any Claude Code prompt or to make any decision documented in protocol files, Claude reads the relevant protocol section before drafting. If three protocol lines or section headers can't be named for the prompt being drafted, the prompt is being drafted from memory and should be discarded.

### Anti-Drift (June 2, 2026)
See UTH Protocol "Anti-Drift Gates" for the canonical statement. In short: quote the rule at the point of use (don't paraphrase from memory); label claims verified-from-source vs believed-from-memory; "done" = re-checking protocol + ledger + the live rendered output (Lesson V), not just the code.

---

## Locked Lessons (A through CC)

### V3 Lessons (May 12, 2026)

**A. PNG export geometry is LOCKED.** UTH chart PNG canonical: scale 2, off.height = canvas.height + 80, ctx.drawImage(canvas, 0, 60), title bold 32px Libre Baskerville at (28, 16), watermark 26px Source Code Pro at bottom-right. Any change requires explicit re-calibration of every dependent geometry value AND a before-commit diff against `napa-supply-chain.jsx` (line 226) or `napa-price-discovery.jsx` (line 95). Reverted May 12 commit ccac434 from scale 3 back to 2.

**B. Cross-article reference parity discipline.** First diagnostic step on chart/PNG/layout/rendering issue: diff against canonical reference article, not theorize about new article in isolation.

**C. Memory-search-first on chart/PNG/render issues.** Extension of Diagnostic Ordering. Settled patterns live in memory and EOS docs. Search first.

**D. Reactive-fix accumulation.** When a fix lands and symptom persists, question the diagnosis rather than layer more fixes. Heuristic: after second reactive fix that does not resolve symptom, stop and re-examine.

**E. New-chart structural parity.** When inserting new chart into existing UTH article, build spec must specify which existing sibling chart serves as structural template, by component name. Required parity: canvas inner height, padding, h2 style, containerRef wrapper, overflow/minWidth wrapper, DownloadButton placement (outside containerRef), legend placement, axis styling, annotation system.

**F. Axis padding symmetry default.** Chart axis ranges default to symmetric padding past data extremes. Asymmetric padding acceptable only when justified by editorial intent (with code comment). Set explicit min/max rather than relying on Chart.js auto-fit.

**G. Embedded-citation discipline.** When body prose contains inline citation link, prose corrections must explicitly account for the link. Replacement `old_str` must include full `<a>` tag (JSX) or markdown link anchor (admin); `new_str` must re-anchor link on a phrase that survives the new wording, OR move citation to Sources block in the same edit. Pre-edit check: grep for `<a` or `](http` within candidate old_str.

**H. Body-anchor vs Sources-block URL discipline.** Body-prose anchors are reader-experience links → human-readable landing pages only. URLs ending in `.csv`, `.json`, or matching `/api/` patterns must NOT appear as inline body anchors. Sources-block citations are attribution → raw endpoints acceptable. Methodology-note links follow body-anchor standard.

**I. Multi-Store Discipline (renamed from Two-Store, generalized May 12).** Content fixes touch multiple stores: JSX body inline tags, admin EXPORT_DATA body markdown links, admin sources array, admin captions source field, admin relatedCoverage, pipeline poll seeder, DB napaserve_article_polls, JSX methodology note. Store enumeration is **illustrative, not exhaustive** — pre-publish verification must enumerate every store the change touches.

**J. Late-stage editorial review surface density** (observational). May 12 review surfaced 7 discrete issues in an article that passed May 10 V2 pre-publish gates. Gates did not include editorial-math check. Recommends editorial-math gate for protocol consideration.

**K. Verification probes must match the claim they're testing.** May 12 example: `DRAFT`-substring regex matched admin UI button labels, falsely confirmed stale "published=false" claim. Verification probes must check specific DOM/DB signature of the state being checked, not a substring sniff.

**L. Status fields require ground-truth DB verification.** EOS doc generation MUST run DB status query against every article slug mentioned in carry-forward. Never transcribe status from prior version. Re-formalized as Z (May 18) after V4 recurrence.

**M. EOS docx files must be genuine Microsoft Word 2007+ format.** OBSOLETE under ADR-001 markdown-canonical EOS (May 24). Retained for historical reference.

### V4 Lessons (May 17, 2026)

**N. Per-chart h2 titles required.** Every chart in a UTH article must have a bold serif h2 directly above its mobile-scroll wrapper. Pattern: Libre Baskerville, 22px, weight 700, color #2C1810, marginTop 0, marginBottom 16. h2 text must match captions array AND PNG download title block — all three surfaces carry the same string. Population article is the live reference (NOT marketing-machine — marketing-machine uses section h2s without per-chart h2s; cloning from marketing-machine silently loses per-chart titles).

**O. Chart duplicate-bar suppression** for grouped-bar charts where some category rows have identical values across series. Pattern: `adjusted = adjustedRaw.map((v, i) => v === reported[i] ? null : v); barColor = null ? 'transparent' : COLOR; labelPlugin: guard for null before fillText`. Legend definitions unchanged. Reusable for any comparison chart where some series rows are non-applicable.

**P. Prose-claim-to-annotation verification.** Chart annotation strings are an independent store from surrounding prose. Section 16 visual pass must spot-check chart annotation strings against surrounding prose claims, AT RENDER TIME in browser, not at code-review time.

**Q. Multi-line peak/endpoint label stagger.** When 3+ lines in indexed-comparison chart converge at similar y-values at chart edges, both ends produce label collisions. Pattern: stair-step Y-stagger for peak labels (~6 indexed units of vertical separation), vertical offset for end-of-line labels. Color-match peak year labels to their line.

**R. Chrome MCP on admin-gated DRAFT pages permitted with explicit per-session authorization.** Chrome MCP prohibited for auth flows and auth-gated config surfaces. Permitted for visual verification of admin DRAFT pages only when Tim explicitly authorizes per-session ("you should be in"). Tim navigates to admin URL and enters admin token himself; assistant does not touch sessionStorage, admin auth flows, or admin tokens.

**S. Internal article cross-links use italicized actual article title.** Generic phrasing ("the May 2026 release") deprecated. NapaServe build uses internal URL (`/under-the-hood/{slug}`); Substack build uses Substack URL verified via nvf_posts query (never guessed `/p/` slug). Apply to BOTH BODY_JSX `<a>` tags AND EXPORT_DATA body markdown links.

### V5 Lessons (May 18, 2026)

**T. Off-screen clone pattern for viewport-deterministic PNG capture.** Any html2canvas-based PNG download surface that captures a responsive layout must capture from an off-screen clone at a fixed target width, NOT from the live DOM. Canonical pattern: clone containerRef.current, append to body inside `position: fixed; left: -10000px` wrapper at fixed width, force one rAF for layout settle, capture clone with html2canvas, remove clone in finally block.

**U. One change per commit when touching Lesson A geometry-adjacent code.** Extension of V3 D. Mechanism change and geometry change must be separate commits. Geometry change goes AFTER mechanism change is verified working.

**V. Visual probes lie when the success criterion is visual.** For visual acceptance, measurement-based probes are diagnostic aids only, never acceptance tests. Acceptance is a human looking at rendered output on target device.

**W. canvas-2D textBaseline persists across draws.** Every text fill that needs different baseline than prior fill must explicitly set baseline before drawing.

**X. Visual gates must run on deployed code, not Claude's separate browser.** Preview branches + user's phone is canonical. Push to branch → Vercel auto-build → Tim's phone → approve → fast-forward merge.

**Y. html2canvas captures the cloned element NOT the padded wrapper.** Asymmetric left-only padding capture is the failure mode. Wrap clone with explicit width matching its natural rendered content width; NO wrapper padding.

**Z. Status fields require ground-truth DB verification before transcription.** Re-formalization of V3 L after V4 recurrence.

### V6 Lessons (May 24, 2026)

**AA. Date-only ISO strings parse as UTC midnight in JavaScript.** `new Date("2026-05-31")` parses UTC midnight, renders as previous day in PT via `toLocaleDateString()`. **Rule:** append `T00:00:00` (display) or `T12:00:00` (math). Inline comment when patching: `// Parse as local date to prevent UTC→PT off-by-one. Lesson AA.`

**BB. history.scrollRestoration must be 'manual' for SPAs with async content.** Browser default "auto" races async render on hard-load. Set `history.scrollRestoration = 'manual'` early in entry bundle (main.jsx) with defensive feature-detection guard.

**CC. Single source of truth via shared React hook (structural enforcement).** Two surfaces displaying same data must not implement parallel fetch paths. Extract shared hook; consumers vary configuration via options. **Companion principle:** windowing as first-class architectural concern. **Rule-of-three corollary:** two consumers enough to extract specific hook; three consumers when generic abstractions become defensible.

**DD. Platform Debt Roll Call as EOS ritual.** Before generating EOS docs, re-read Platform Debt Ledger and answer four questions.

### Lessons (2026-06-03)

**EE. Adding a tracker category requires raising the chart y-axis max.** A new category row needs all of: `Y_MAP`/`Y_LABELS`, `CATEGORY_COLORS`, SnapshotTab `categoryColor()`, the filter-chips array, the legend caption — AND the Contraction Tracker chart's y-scale `max` (napaserve-calculators.jsx ~786). Civic was added at y=5 (jittered 4.85–5.15) while the y-scale stayed `min: 0.5 / max: 4.5`, so the whole row clipped off the top of the plot area — data, filter, and legend all read correct while the dot stayed invisible. Caught only by the rendered-state check (Lessons V/X), not by build or code review. Corollary to Lesson F: grow `max` with every new row, symmetric min/max padding.

### Lessons (2026-06-12)

**FF. SID check of record = the functional probe, not the calendar date.** `poll_extraction.py --dry-run --limit 1` returning 200 + real vote counts is the SUBSTACK_SID validity test; the recorded expiry was 3 days off (logged Jun 13, cookie actually expired Jun 10). Date = early-warning only. ~90-day session cookie; value ≠ validity (server-side; re-login can renew the same value with a new expiry).

**GG. iCloud ".icloud-placeholder absent" ≠ downloaded.** A starting download renames stubs to real names before bytes land. Verify materialization with `find -size 0` + `du -sh` + the Finder progress circle — not the placeholder grep alone.

**HH. PostgREST silently caps un-paginated selects at 1000.** Extends the URL-encoding lesson. Any existing-ID / dedup / count read must paginate (Range headers or limit/offset loop) or it truncates once the table exceeds 1000 rows. See PD-2026-06-12-01.

**II. Claude Code can't see Supabase SQL Editor actions.** Out-of-band DB writes (e.g. a SQL Editor DELETE) are invisible here — flagged a Tim-initiated delete as "external" 3× this session. Reconcile in chat.

### Lessons (2026-06-30)

**Recurrence of Lesson Z (not a new lesson) — code-shipped ≠ published.**
napa-four-legged-economy-2026 was code-complete, committed and Vercel-deployed —
and rendered publicly — while having NO `napaserve_articles` row and NO seeded
polls. The public render was a false positive: `useDraftGate`'s not-found→published
catch AND the admin card's `published: dbRow ? dbRow.published : true` fallback both
default a missing row to "published," producing the contradictory admin state
**"Live" + "DRAFT" + no Publish button** (Lesson K: the tags disagree → probe the DB
row, not the UI). The handoff asserted "row inserted, polls seeded" — untrue; the
seeder *script* contained the 3 poll defs but they were never run against the DB.
Fixes:
- **Publish-Readiness Ledger** — per-store completion with the actual
  `SELECT`/`git`/Vercel output pasted as evidence. No pasted evidence = not done.
- **Never transcribe DB status from memory or the seeder script.** Seeder containing
  poll defs ≠ polls in the DB; a row intended ≠ a row inserted. Close every session
  with the SELECT and paste the raw result.
- **Separate "code-shipped" from "published" in EOS language.** A missing row renders
  publicly via the fallback, so "visible on the site" is not evidence of publication.
- **Infra (locked):** hosting is **Vercel**, not Cloudflare (only `/api/unsubscribe`
  → CF Worker). Production hash is **CI-built**, ≠ a local `npm run build` hash —
  verify deploys **by commit SHA via the Vercel API**, never by hash. Publish path:
  worker `/api/publish-article` only **UPDATEs an existing row** (404 if none) → an
  article needs a `published=false` row before the admin **Publish Article** button
  works.
- **Process meta-lesson:** DB-state and publish-readiness questions route to Claude
  Code for a **SELECT** — never asserted from chat-thread memory.
  Live > protocol > assistant memory.

---

## Snapshot PNG Geometry (V5 Canonical, NEW Surface)

Distinct from UTH chart PNG (Lesson A canonical, unchanged).

- Clone wrapper: width 1152px, NO padding, position fixed left -10000px
- html2canvas options: scale 2, backgroundColor #F5F0E8, useCORS true, width 1152, windowWidth 1152
- Captured canvas: 2304 × natural_height
- Final PNG: `off.width = canvas.width + 128 = 2432`, `off.height = canvas.height + 224`
- Title: bold 64px Libre Baskerville, fillStyle #2C1810, textBaseline top, position (64, 64)
- drawImage: `ctx.drawImage(canvas, 64, 160)`
- Watermark: 52px Source Code Pro, fillStyle #8B7355, globalAlpha 0.5, textBaseline middle
- Filename: `napa-snapshot-{ISO}.png`

### Clone-time DOM Walker Bumps (scoped to `#snapshot-export-clone`)
- Primary number: 36px → 52px, lineHeight 1.0
- Eyebrow: 11px → 16px
- Footer: 11px non-uppercase → 18px
- Unit/Delta: 13px → 18px
- Stoplight dot: 18px → 24×24, top 14, right 14

---

## UTH Chart PNG Geometry (Lesson A Canonical)

- html2canvas: `{ scale: 2, backgroundColor: T.bg, useCORS: true }`
- Offscreen canvas height: `off.height = canvas.height + 80`
- `ctx.drawImage(canvas, 0, 60)`
- Title: `ctx.font = "bold 32px 'Libre Baskerville', serif"; ctx.fillStyle = T.ink; ctx.fillText(title, 28, 16)`
- Watermark: `ctx.font = "26px 'Source Code Pro', monospace"; ctx.fillStyle = T.muted; ctx.globalAlpha = 0.25`; bottom-right with 24px right margin and 14px bottom margin
- Canonical references: `napa-supply-chain.jsx` line 226 or `napa-price-discovery.jsx` line 95

---

## Chart Conventions

- Naming: ChartOne, ChartTwo, ChartThree (and ChartFour, etc.) in document order — self-contained, each with own ref + own download button + own caption
- No `ChartBox` wrapper
- `downloadComponentPng(containerRef, filename, title)`: html2canvas scale:2, 32px title, 26px watermark
- Download button OUTSIDE containerRef
- Never add title divs inside chart components — download function draws them on canvas
- **Per-chart h2 titles required** (Lesson N): Libre Baskerville 22px bold #2C1810, marginTop 0, marginBottom 16
- html2canvas must be in `package-lock.json`
- Chart.js: npm only, never CDN; `fill: '+0'` and `fill: '+1'` cause silent script errors — use `afterDatasetsDraw` plugin
- Hand-drawn canvas charts: wrap in `{overflowX: 'auto'}` container with `minWidth` on inner div for mobile
- **Cumulative callout placement** (May 4): top-right of plot area AVOID; top-left of plot area SAFE; above plot area SAFE
- **Multi-annotation Y-stagger** for charts with overlapping peak/endpoint labels (Lesson Q)
- **Duplicate-bar suppression** for grouped-bar charts (Lesson O)

---

## Chart Numbering Protocol

Charts numbered in strict document order, top to bottom. Download filenames match:
- `chart-1__nvf.png`
- `chart-2__nvf.png`
- `chart-3__nvf.png`
- `chart-N__nvf.png` — extend pattern for 4+ charts

---

## Mobile CSS Rules

- `gridTemplateColumns` must NEVER be in inline styles on elements needing mobile breakpoints — inline styles override CSS class rules on mobile Safari regardless of `!important`
- Use named CSS classes in `index.css` with `@media` overrides instead

### CSS Class Exception — kpi-grid-snapshot
`economic-pulse-app/src/index.css` line 81:
```
.kpi-grid-snapshot { grid-template-columns: repeat(3, 1fr); gap: 16px; }
@media (max-width: 900px): repeat(2, 1fr)
@media (max-width: 600px): 1fr !important
```

---

## PullQuote Inline Component (May 12)

Canonical PullQuote definition (Theme 02 Cream):

```jsx
const PullQuote = ({ leadText, bodyChildren }) => (
  <div style={{
    margin: "28px 0",
    padding: "20px 24px",
    background: T.surface,
    borderLeft: `4px solid ${T.accent}`,
    fontFamily: prose,
    fontSize: 17,
    lineHeight: 1.55,
    color: T.ink,
  }}>
    <div style={{
      fontWeight: 700,
      fontSize: 19,
      marginBottom: 12,
      color: T.ink,
    }}>{leadText}</div>
    {bodyChildren}
  </div>
);
```

Currently defined locally in `napaserve-under-the-hood-population.jsx`. If reused, extract to shared utility.

Word export equivalent: admin EXPORT_DATA doesn't support italic/visual-block styling. Use `h()` for lead line, `t()` for body. NO markdown-asterisk fallback.

---

## Article Build Rules (Permanent)

- Byline: immediately after final article sentence, before PollsSection
- BODY_JSX first paragraph needs explicit `marginBottom:18`
- Dateline: inline bold span, NOT standalone
- SECTIONS array must include all sections including closing "What to Watch"
- Never fabricate Substack URLs — query `nvf_posts` for confirmed URLs
- Substack root URL: `napavalleyfocus.substack.com` — NEVER CHANGE
- Download buttons always outside containerRef
- **Related Coverage: plain link list** — quoted titles + em-dash + publication + (date). Cards convention deprecated weeks before May 10, 2026
- AP dateline for county-wide stories: county name, not city

---

## Tracker Data — Single Source of Truth (Lesson CC, May 24, 2026)

All tracker UI surfaces consume the `useTrackerEvents` hook at `economic-pulse-app/src/hooks/useTrackerEvents.js`. Direct fetches and hardcoded tracker arrays are incorrect by design.

- Data layer: `napa_transition_tracker` Supabase table
- API layer: Cloudflare Worker `/api/tracker-events` at `https://misty-bush-fc93.tfcarl.workers.dev`
- Code layer: `src/hooks/useTrackerEvents.js`

### Consumer Registry (as of 2026-05-24)
- `SnapshotTab.jsx` — dashboard "What changed this week" — 30-day window
- `napaserve-calculators.jsx` — Contraction Tracker — 6-month window

### Category Taxonomy (5 as of 2026-06-03)
`napa_transition_tracker.category` is CHECK-constrained to exactly: Hospitality, Production, Transaction, Distribution, **Civic** (added 2026-06-03). Adding a value requires an ALTER (drop + re-add `napa_transition_tracker_category_check`).

| Category | SnapshotTab dot | Calculators border/dot · bg | Legend long-form |
|---|---|---|---|
| Hospitality | T.gold | T.gold tint | Hospitality Closures |
| Production | #7B5797 | #7B5EA7 · #F0EBF5 | Production / Capacity |
| Transaction | #4A6FA5 | #4A7FA5 · #EBF0F5 | Deal Structure / Transactions |
| Distribution | #5C8A50 | #5A8A5A · #F0F5EB | Distribution / Macro |
| Civic | #3F7E8C | #3F7E8C · #E9F1F3 | Civic / Institutions |

SnapshotTab `categoryColor()` and calculators `CATEGORY_COLORS` carry slightly different shades for the same category — pre-existing, not unified. Touch-points to add a category: DB CHECK constraint · CATEGORY_COLORS · SnapshotTab categoryColor() · filter-chips array · Y_MAP/Y_LABELS · chart y-axis `max` (Lesson EE) · legend caption. The published `under-the-hood-napa-structural-reset.jsx` chart array is NOT a live consumer — never edit it for a category change.

### External Consumer
The `/api/tracker-events` Worker route has an external consumer: Napa Lowdown editorial scout (fetches `?since=~60d`, dedupes on `source_url` + `(headline, event_date)`). Flag to Tim before any route moves, CORS changes, or schema changes.

### Editorial Link Format

Internal article cross-links use italicized actual article title as link text:

```jsx
// BODY_JSX (native <a>, internal URL):
<em><a href="/under-the-hood/napa-population-2025">
  Under the Hood: Napa County Shrunk as Calistoga Grew and the Base Faltered
</a></em>

// EXPORT_DATA body (markdown inside t() strings, Substack URL):
*[Under the Hood: Napa County Shrunk as Calistoga Grew and the Base Faltered](https://napavalleyfocus.substack.com/p/...)*
```

---

## Verification Pattern (Before Publishing Any UTH Article)

All seven elements must return true. Run in browser console on deployed admin draft:

```javascript
const t = document.body.innerText;
JSON.stringify({
  rc: t.includes('Related Coverage'),
  arch: t.includes('Search Napa Valley'),
  polls: t.includes("Today's Polls"),
  meth: t.includes('Methodology'),
  src: t.includes('Sources'),
  byline: t.includes('Tim Carl is a Napa Valley'),
  substackLink: t.includes('Napa Valley Features on Substack')
})
```

Hide DraftBanner first:
```javascript
document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]')
  .forEach(el => el.style.display = 'none')
```

Wait 3-5 minutes after deploy; confirm new bundle fingerprint. Fingerprint is the only authoritative signal that deploy is live.

---

## PostgREST PATCH for One-Row Data Backfill

Pattern for manual data fix when small number of rows need patching:

```bash
cd ~/Desktop/napaserve && set -a && source .env && set +a

# 1. Pre-patch verification
curl -s "$SUPABASE_URL/rest/v1/<TABLE>?<FILTER>&select=<COLS>" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" | python3 -m json.tool

# 2. PATCH
curl -s -X PATCH "$SUPABASE_URL/rest/v1/<TABLE>?<FILTER>" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"<COL>": "<VAL>"}' | python3 -m json.tool

# 3. Post-patch re-verification (same as step 1)
```

`Prefer: return=representation` makes PATCH return modified rows. If patched count differs from expected: STOP, do not blanket-update.

---

## Worker Deployment SOP

Cloudflare Worker manual-deploy is the sole manual-deploy step in the stack.

### Stale TextEdit Buffer Protection
Before EVERY Worker manual deploy, force TextEdit to read fresh disk content:

```bash
osascript -e 'quit app "TextEdit"'
sleep 1
open -a TextEdit ~/Desktop/napaserve/economic-pulse-app/src/worker.js
```

Then `wc -l` the file in terminal AND verify TextEdit shows the same line count before Cmd+A.

---

## Operational Pitfalls (Hard-Won)

### iCloud sync mid-session → cwd permission cascade
Fix: restart Claude Code from inside project directory:
```bash
cd ~/Desktop/napaserve
ulimit -n 2147483646
source .env
claude
```

### TCC stale entitlement on Terminal (May 10, 2026; verified procedure 2026-05-24)

Symptom: every CLI tool fails EPERM, `ls` works on parent dir, restart doesn't fix.

Diagnostic:
```bash
log show --predicate 'subsystem == "com.apple.TCC"' --last 30m | grep -i "deny" | tail -20
```

Fix:
1. **Cmd+Q** to fully quit Terminal — not Cmd+W
2. System Settings → Privacy & Security → Full Disk Access
3. Remove Terminal (click −)
4. Re-add Terminal from `/System/Applications/Utilities/Terminal.app`
5. Relaunch Terminal
6. Verify: `cat ~/Desktop/napaserve/.env > /dev/null && echo OK || echo BLOCKED`

If still blocked: `sudo tccutil reset SystemPolicyAllFiles`.

Cmd+Q is the load-bearing detail. Cmd+W keeps Terminal running, old entitlement stays active.

### zsh paste pitfall (multi-line + comments)
Fix in moment: Ctrl+C. Prevent: paste one line at a time, or remove comments before pasting.

### macOS file-descriptor limit
Default `ulimit -n` is 256. Run at session start or persist in `~/.zshrc`:
```bash
ulimit -n 2147483646
```

- Claude Code launch blocked by 256 fd-limit → `ulimit -n` in the same shell before `claude`. The suggested `2147483646` can itself throw "unknown error (Unexpected)"; `65536` works. Distinct from TCC read-EPERM — different fix.
- Re-feed locked scope on every Code-thread resume — a resumed session re-derives on-disk edits but can drop the prior session's locked decision (nearly shipped a template-only NIT 3 as "done", 2026-06-11).

### TextEdit trap
Never save .html or .md files from TextEdit — converts to RTF. Use VS Code, nano, or vim.

---

## Tool Discovery Rule

Visible tool list is partial by design. Many tools (Chrome MCP, Google Drive, Slack) are deferred and must be loaded via `tool_search` before use. ALWAYS run `tool_search` before claiming any capability is missing.

---

## Editorial Link Format Discipline

### Source linking — internal-first (2026-06-02)
Link our own UTH coverage where a piece exists; use the external original only where it doesn't. Named-author primaries (e.g. an essayist like Ted Hall) may link to the original. Captions store `sources: [{ label, url }]`; the bottom Sources list uses inline `<a>`. Our own archive is the first place to look for source URLs before the open web.

**Body-anchor URLs (Lesson H):** human-readable landing pages only. No `/api/`, `.csv`, `.json`. Same rule for chart caption sources.

**Sources-block citations:** raw API/CSV endpoints acceptable.

**Methodology-note links:** body-anchor standard.

**Pre-publish grep gate:**
```bash
grep -nE 'href="https?://(api\.|data\.)' economic-pulse-app/src/napaserve-under-the-hood-<slug>.jsx
grep -nE '\](https?://(api\.|data\.)' economic-pulse-app/src/napaserve-admin.jsx
```
Body-anchor violations block commit.

### Canonical Replacement Table (Napa County)
- BLS QCEW → `https://labormarketinfo.edd.ca.gov/geography/napa-county.html` (body) / `https://www.bls.gov/cew/` (Sources)
- Census ACS → `https://www.census.gov/quickfacts/fact/table/napacountycalifornia/PST045224` (body) / `https://www.census.gov/programs-surveys/acs/` (Sources)
- Zillow ZHVI → `https://www.zillow.com/home-values/3929/calistoga-ca/` (body) / `https://files.zillowstatic.com/research/public_csvs/zhvi/...` (Sources)

---

## Static Public Assets — `public/` Direct-Serve Deploy (2026-07-07)

Files placed in `economic-pulse-app/public/` ship verbatim at the site root on Vercel push, bypassing the SPA entirely — no route, no menu link, no bundle change. `precinct-explorer.html` in `public/` serves at `https://napaserve.org/precinct-explorer.html`.

- The **bundle-hash verification gate does NOT apply** to these assets — they serve or 404. There is no fingerprint to poll; verify by fetching the URL.
- Enables **unlisted demo pages** — in the repo and live, but linked from no menu.
- Standalone `public/` HTML pages are an accepted exception to the SPA inline-styles / mobile-CSS rules — they are not part of the React bundle (a standalone page may use its own `<style>`/CSS file). See decisions ADR-007.
- Downloads-to-repo copy of these assets uses the explicit-filename + version-string gate (ADR-008): copy a named file, `grep` for the expected version string, abort if the count is 0. The version string in the file is the deploy gate, not the download filename (browser `-2`/`-3`/`_1` suffixing is unreliable).

## County GIS Endpoints (Napa County, canonical reference)

Surfaced during the Elected Seats Atlas build (2026-07-07).

- **Precinct layer:** `https://gis.napacounty.gov/arcgis/rest/services/Hosted/Precincts_2022/FeatureServer/8`
  - **Layer id is `8`, NOT `0`** — querying `/0` returns a 404 (caused a build failure 2026-07-07).
  - 215 precincts; `geoJSON` supported; `maxRecordCount` 2000; counts by supervisor district 53/41/41/38/42.
  - Fields: `precinct, pdflink, supervisor_district, municipality, school_district, park_ward, nvc_trustee_area, boe_trustee_area, nvusd_area, napacitycouncildistrict, sfid`.
  - Precinct→district correspondence is published as explicit attributes — no Elections data request needed for the geography.
- **Hub search API (CORS-open):** `https://gisdata.napacounty.gov/api/search/v1/collections/all/items?q=...`
- The Hosted folder also serves Supervisor_Districts(_2022), Napa_City_Council_District, NVUSD/BOE/NVC trustee areas, School_Districts, Cities and the special districts (sanitation, RCD, Silverado CSD, cemetery, Berryessa, fire, water, CSAs) with spheres of influence — Phase 2 geography already published by the county.
- **Publication caveat:** OSM tiles used in the demo are NOT production-licensed; Elections data currency is unconfirmed. Do not publish the explorer publicly until both clear. See ledger PD-2026-07-07-01 and PD-2026-07-07-02.

## EOS Routine

Per ADR-001 (2026-05-24), EOS is markdown-canonical. See `napaserve-eos-checklist.md`.

---

## Editorial Don'ts

- Never use: curate, tapestry, special, unique, discover, explore, nestled, vibrant
- Never: "civic intelligence" — always "community intelligence"
- Never: fabricated or placeholder quotes
- Never: "Napa Valley Focus," "Napa Valley News Group," "Economic Dashboard"
- Closing stakeholder language: "planners, policymakers, community members and civic leaders"

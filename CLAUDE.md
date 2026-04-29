# CLAUDE.md Patch — April 22, 2026

Append to `~/Desktop/napaserve/CLAUDE.md`. This patch captures platform-level rules that apply to every Claude Code session in this repo.

---

## Section 0: Verification Discipline (NEW — April 22, 2026)

**Before Claude Code asserts ANY claim about style rules, file state, git state, or primary sources — verify against ground truth FIRST.**

Ground truth hierarchy:

1. **Style/formatting rules** → search project knowledge or this CLAUDE.md for "LOCKED" / "style rules" before flagging. Training-data defaults (AP style, Chicago) do NOT override NapaServe LOCKED standards.

2. **File/code state** → grep or view the actual file. Rendered pages, Substack pastes, admin downloads are RENDERINGS or INPUTS, not ground truth. The file is the file.

3. **Primary sources** → web_fetch the full document. Ctrl-F for all instances of the specific claim before asserting what it says. Never stop at the first match.

4. **Thread context** → if there may be concurrent work from another Claude thread, search project knowledge for recent session summaries referencing the slug/topic.

5. **User intent** → if uncertain, ask. Do not assume.

### Confidence threshold rule

If state has not been verified in the last few turns, Claude Code says "I believe X but let's check." Tentative correct beats confident wrong.

### Pre-execution checklist

Before any code edit, SQL query, commit:
1. What am I assuming?
2. How have I verified each assumption?
3. If unverified — verify or flag.

---

## Style Rules (LOCKED — reaffirmed April 22, 2026)

These override AP style, Chicago, and any training-data defaults. They are not debatable.

| Rule | NapaServe Standard |
|------|-------------------|
| Percentages in prose | `%` (NOT "percent") |
| Serial comma (Oxford) | NO Oxford comma — use "x, y and z" not "x, y, and z" |
| Dashes | Real em-dash (U+2014) — and en-dash (U+2013) – — NEVER `--` or `\u2014` escape sequences |
| Quotes | Curly/typographic (U+201C " U+201D ") — NOT straight |
| Punctuation inside quotes | American style — period/comma INSIDE closing quote |
| USD references | `$700 million` with context — NOT `US$700 million` |

### Before flagging style issues

Check this section FIRST. Do not apply AP/Chicago defaults without verification against NapaServe LOCKED.

---

## DB Insert Template Update (April 22, 2026)

`napaserve_articles` INSERT MUST include title and deck columns non-null:

```sql
INSERT INTO napaserve_articles (
  slug, headline, title, deck, publication, published, 
  polls_seeded, admin_cards_added, related_coverage_added, topic_seed
) VALUES (...);
```

Post-INSERT verification required:

```sql
SELECT slug, headline, title, deck, publication, topic_seed
FROM napaserve_articles WHERE slug = '[new-slug]';
```

All six non-null. If any are null, PATCH before publish-flip.

---

## UTH Index Tile Verification (step 18 of UTH build)

After publish-flip on any UTH article:

1. Hard-refresh https://napaserve.org/under-the-hood
2. Confirm the article's tile renders with eyebrow + title + date
3. Click → confirm navigation works

Blank tile = likely null DB column. Query, backfill, done.

---

## Scenario Preset Card Pattern (platform convention — April 22, 2026)

Calculator preset cards follow structural-reset → constellation pattern:
- Active: dark fill (`#2C1810`), light text
- Inactive: surface background, standard text
- Custom card: no-op click, default cursor, pure state indicator
- Slider onChange handlers append `setActiveScenario("custom")`
- 4-col desktop, 2-col mobile via `.scenario-presets-grid` CSS class

---

## Mobile Responsiveness (REAFFIRMED + audit step — April 22, 2026)

### Rule (unchanged)

NEVER put `gridTemplateColumns` in inline styles on elements needing mobile breakpoints. Inline styles override CSS class rules on mobile Safari regardless of `!important`.

### Audit step (NEW)

After committing any new article JSX:

```bash
grep -n "gridTemplateColumns" economic-pulse-app/src/under-the-hood-[slug].jsx
```

Every match is a potential mobile-boundary violation. Move to CSS class before publish.

### New established classes (April 22, 2026)

- `.scenario-presets-grid` — 4-col desktop, 2-col mobile
- `.impact-stats-grid` — 4-col desktop, 2-col mobile

All collapse via existing `@media (max-width: 600px)` block in index.css.

---

## Chart.js Category Axis Pattern (LOCKED)

For discrete categorical values on either axis, use `type: "category"` with explicit labels array — not numeric linear axis with callback. Pre-map scatter data: `events.map(e => ({ x: STAGES[e.stage], y: TIERS[e.tier] }))`.

Reference: napa-gdp-2024, napa-constellation-2026 Chart 1.

---

## Caption SOP (LOCKED)

```
*[Title in italics].* [Prose.] *Illustrative only — not a forecast.* Sources: X; Y; Z.
```

Illustrative clause for synthesis charts. Omit for pure-data charts.

---

## Commit Conventions (reaffirmed — April 22, 2026)

- No Co-Authored-By trailer — explicitly suppress via "No Co-Authored-By" in every commit instruction
- Explicit file paths when staging — never `git add -A`
- Commit messages: imperative, scoped (`fix(scope):` / `feat(scope):` / `sync(scope):`)
- Single commit per logical unit of work; split across multiple commits only when they represent genuinely different changes

---

## Thread Handoff Discipline (NEW — April 22, 2026)

When multiple Claude threads touch the same article:

1. **Identify canonical thread** at session start — check project knowledge for recent session summaries
2. **Before drafting changes** — read referenced resume briefs, session summaries, patch notes
3. **Handoff briefs must include**:
   - Current committed state (commit hash)
   - Pending uncommitted work
   - Scope recommendation
   - Gaps requiring user direction

Prose referenced but not physically present is NOT a handoff. Prose must be pasteable text.

---

## Research Discipline (NEW — April 22, 2026)

### Primary source reading

When fetching a primary source to verify a specific claim:
- Read the whole document OR Ctrl-F for all instances
- Note variation across instances  
- Use the author's most specific anchor, not the first match

### Resource hierarchy

1. Project knowledge first
2. Primary sources second (full read)
3. Secondary sources third (corroboration only)
4. Training memory last (verified against above)

### Contradictions

When research surfaces contradictions: document them, show both, let user decide. Don't quietly pick one.

---

## Known Gaps Log (NEW — April 22, 2026)

Explicit list of known issues. Review at start of every session so they're not rediscovered:

- EXPORT_DATA for napa-constellation-2026 is stale (Word export workflow bypassed today via copy-paste)
- Tier-section prose (21 paragraphs for Sections 2/3/4/5 of napa-constellation-2026) not drafted — live article in hybrid state
- Insert-flow gap: napaserve_articles INSERT skipped title + deck for napa-constellation-2026 (both PATCHed; root cause TBD)
- Related Coverage title font-size too large on all UTH articles (platform polish)
- Tracker: no "Regulatory" category for Ninth Circuit + four-group petition events
- Tracker additions for today's research (Treasury × 3, Hall essay, Mondavi reopening, 4-group petition) deferred to calculators thread
# CLAUDE.md Patch — April 26, 2026

Append this section to CLAUDE.md after the April 22, 2026 patch.

---

## April 26, 2026 — Lake County Housing Reset Article + Two Platform Improvements

### Article shipped
- **Slug:** lakeco-housing-reset-2026
- **Headline:** Lake County's Housing Reset Is Uneven — and the Labor Market Is Moving First
- **Publication:** Lake County Features (now 2 articles live, was 1)
- **Polls:** 30/31/32 seeded
- **Substack polls:** 3 distinct polls listed in EXPORT_DATA substackPolls field
- **Charts:** 3 (submarket spread bar, unemployment trend line, North Bay comparison bar)
- **Commits:** f8af38a, 2cedbbb, 3772e3d, 6a71534, 566502f, 0b24cf0
- **Final bundle:** index-LEOdfNmi.js

### Platform improvement 1: substackPolls field added to EXPORT_DATA shape

WordExporter.jsx now renders Substack Polls section between Related Coverage and Sources. Activated by populating `substackPolls` array on EXPORT_DATA entry. New section in render order (10 of 11):

1. Headline
2. Byline
3. Deck
4. Article Summary
5. Body
6. Bio
7. Pull Quote
8. Chart Captions
9. Related Coverage
10. **Substack Polls** — NEW
11. Sources

Shape:
```js
substackPolls: [
  { question: "...", options: ["a", "b", "c", "d", "e"] },
  // 3 polls per article, 5 options each, ≤ 35 chars
]
```

### Platform improvement 2: under-the-hood-index.jsx made fully dynamic

Pre-fix: only Napa Valley Features section built dynamically from DB. Sonoma and Lake County sections were hardcoded STATIC_SECTIONS arrays.

Post-fix (commit 0b24cf0):
- All three publication sections build dynamically from `napaserve_articles` filtered by publication string
- Sorted newest-first by published_at
- Date format unified to "Month D, Year"
- STATIC_SECTIONS retained as empty-state fallback
- Section 6 "Recent Under the Hood" affordance distinguishes internal (`/under-the-hood/...`) vs external links

Implication: publishing to any publication is now zero-touch on the index. DB row drives the tile.

### Two-Platform Polls Strategy (NEW)

NapaServe polls (`napaserve_article_polls`) and Substack polls (`nvf_polls` via monthly extraction) are intentionally distinct, both feeding Community Intelligence. Different audiences, different question shapes, complementary not redundant.

- **NapaServe:** structured, analytical, thesis-testing. Seeded via pipeline.
- **Substack:** experiential, local, reader-as-expert. Listed in EXPORT_DATA substackPolls; manually created in Substack UI from Word export reference; pulled into nvf_polls via monthly extraction.

Both undergo Voyage-3 embedding. Both queryable by Research Agent.

### Single-Prompt UTH Build Template Caveat

The lakeco-housing-reset-2026 build used a single consolidated Claude Code prompt that omitted Build Sequence steps 13 (EXPORT_DATA), 14 (chart filenames), 15 (Word export end-to-end test). Required mid-session retrofit. New rule: any consolidated prompt MUST include explicit phases for these three steps.

### Article Registry update

LIVE additions: lakeco-housing-reset-2026 (April 26, 2026).
Next poll IDs start at 33.

### Files touched in repo
- `economic-pulse-app/src/under-the-hood-lakeco-housing-reset.jsx` (created)
- `economic-pulse-app/src/App.jsx` (route)
- `economic-pulse-app/src/napaserve-admin.jsx` (admin card + EXPORT_DATA + substackPolls)
- `economic-pulse-app/src/components/WordExporter.jsx` (substackPolls render section)
- `economic-pulse-app/src/under-the-hood-index.jsx` (dynamic publication sections + affordance fix)
- `pipeline/seed_article_polls.py` (3 dicts for polls 30/31/32)
- `CLAUDE.md` (this patch)

### Pending for next session

- napa-marketing-machine-2026 (Week 2 of April series, deferred from April 26)
- napa-population-2025 hold pending May 1, 2026 DOF E-1 release
- Q2 follow-up Lake County piece on lower-cost-areas-falling-faster puzzle
- Audit other live UTH articles for substackPolls backfill

---

*End of April 26, 2026 patch — Valley Works Collaborative*

# CLAUDE.md Patch — April 28, 2026

Append this section to CLAUDE.md after the April 26, 2026 patch.

---

## April 28, 2026 — Lodging Pricing Article + Pulse Tracker Design

### Article shipped

- **Slug:** napa-lodging-pricing-2026
- **Charts:** 5
  1. Three Surfaces (filled)
  2. Annual Demand vs Rate 2019 → 2025
  3. Monthly Pace to 2019 (NEW)
  4. Coastal Recovery Diverges
  5. Three-Surface Calculator
- **New prose section added:** “The Best Year Since 2019 Was Still Below 2019”

### Hospitality Jobs calculator card — placeholder retired

Converted the Hospitality Jobs card from interactive placeholder to a static historical figure. The post-2019 jobs-revenue inversion (revenue recovered, headcount did not) makes a linear slider dishonest — the relationship the slider implied no longer holds. Static figure preserves the data point without falsely suggesting elasticity.

### Baseline correction: 71.7% → 71.1%

Occupancy baseline corrected per Gruen Gruen 2023 report (primary source). All references updated. This is the LOCKED figure going forward — flag any drift.

### Legistar URL hygiene (LOCKED — NEW)

Two `LegislationDetail.aspx` links to Inn at Abbey legislation were missing the `GUID` and `FullText` query params. Bare `?ID=NNNNNNN` URLs render but are fragile — Legistar may truncate, redirect, or return a stub depending on session state. Canonical form:

```
LegislationDetail.aspx?ID={ID}&GUID={GUID}&FullText=1
```

**One commit reverted along the way:** an earlier attempt URL-encoded `&` as `%26` to prevent truncation. Wrong fix — broke the param parsing entirely. The right fix is to include `ID` + `GUID` + `FullText=1` raw, not to escape the separator. Pattern to remember: if a Legistar URL looks fragile, the answer is more params, not encoding tricks.

Commits in sequence: `24f495d` (wrong %26 fix) → `68be952` (revert) → `5c54d2b` (correct GUID + FullText fix, shipped).

### Style reaffirmation

`%` symbol in prose — never the word “percent”. Already LOCKED in April 22 patch; reaffirmed today after a draft pass slipped in “percent” several times. Verification step belongs in the pre-publish grep.

### Verification toolkit expansion: Claude in Chrome (NEW)

Claude in Chrome is now part of the verification toolkit for **public surfaces only**:

- ✅ Allowed: live article pages on napaserve.org, public Substack posts, public primary sources (Legistar agendas, DOF tables, Census surfaces)
- ❌ Never: auth-gated admin config, Supabase studio, internal dashboards, anything behind a login

The reason for the boundary is that auth-gated surfaces leak credentials into a browsing context that is not scoped for them. Public surfaces are fine because they are public.

### Pulse Tracker — design committed

Pulse Tracker designed end-to-end across Phases 1 – 7. Full design lives in the `PulseTracker_Plan` doc (canonical reference — do not duplicate the phase breakdown here). Implementation has not started; this entry records that the design is the agreed plan of record as of today.

### Files touched in repo

- `economic-pulse-app/src/under-the-hood-napa-lodging-pricing.jsx` (article + 5 charts + new prose section + Hospitality Jobs static conversion + legistar URL fix)
- `economic-pulse-app/src/napaserve-admin.jsx` (legistar URL fix)
- `CLAUDE.md` (this patch)

### Pending for next session

- Pulse Tracker Phase 1 kickoff (per `PulseTracker_Plan`)
- Audit remaining UTH articles for any other bare `LegislationDetail.aspx?ID=` URLs missing GUID + FullText
- Carry-overs from April 26 still open: napa-marketing-machine-2026, napa-population-2025 (May 1 DOF E-1), Q2 Lake County follow-up, substackPolls backfill audit

---

*End of April 28, 2026 patch — Valley Works Collaborative*

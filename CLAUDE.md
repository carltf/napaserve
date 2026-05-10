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

## April 28, 2026 — Lodging Pricing Article + Pulse Tracker Design + Diagnostic Discipline

### Article shipped

- **Slug:** napa-lodging-pricing-2026
- **Title:** “Eighty-Seven Cents and Counting”
- **Charts:** 5
  1. Three Surfaces (all 3 panels filled)
  2. Annual Demand vs Rate 2019 → 2025
  3. Monthly Pace to 2019 (NEW)
  4. Coastal Recovery Diverges
  5. Three-Surface Calculator
- **New prose section added:** “The Best Year Since 2019 Was Still Below 2019”
- **Polls seeded:** 33, 34, 35
- **Legistar URLs fixed:** 2 (Inn at Abbey links — see Legistar URL hygiene section below)

### Hospitality Jobs calculator card — placeholder retired

Converted the Hospitality Jobs card from interactive placeholder to a static historical figure. The post-2019 jobs-revenue inversion (revenue recovered, headcount did not) makes a slider-driven multiplier dishonest — the relationship the slider implied no longer holds. Static figure preserves the data point without falsely suggesting elasticity.

### Baseline correction: 71.7% → 71.1%

Occupancy baseline corrected per Gruen Gruen 2023 hotel market report (primary source). All references updated. This is the LOCKED figure going forward — flag any drift.

### Legistar URL hygiene (LOCKED — NEW)

Two `LegislationDetail.aspx` links to Inn at Abbey legislation were missing the `GUID` and `FullText` query params. Bare `?ID=NNNNNNN` URLs render but are fragile — Legistar may truncate, redirect, or return a stub depending on session state. Canonical form:

```
LegislationDetail.aspx?ID={ID}&GUID={GUID}&FullText=1
```

### Diagnostic discipline lesson (NEW — from the reverted commit)

An earlier attempt URL-encoded `&` as `%26` to prevent truncation. That was the wrong fix — the server treats the whole encoded query as a single param, so the URL parses to nothing useful. Right fix: include `ID` + `GUID` + `FullText=1` raw, do not escape the separator.

**The deeper lesson — diagnostic order of operations:**

When a source-side audit is clean (the JSX strings look correct in `grep`) but runtime is broken (the live page renders the wrong thing), **inspect the rendered DOM via Claude in Chrome before guessing at encoding fixes.** Source-clean + runtime-broken means the gap is in transport, rendering, or server interpretation — not in your string. Encoding tweaks are a guess; rendered-DOM inspection is evidence.

Commits in sequence: `24f495d` (wrong %26 fix) → `68be952` (revert) → `5c54d2b` (correct GUID + FullText fix, shipped).

### Style enforcement reaffirmation

`%` symbol in prose — never the word “percent” spelled out. Already LOCKED in the April 22 patch; reaffirmed today after a draft pass slipped in “percent” several times. The verification step belongs in the pre-publish grep.

### Verification toolkit expansion: Claude in Chrome (NEW)

Claude in Chrome is now part of the verification toolkit for **public surfaces only**:

- ✅ Allowed: live article pages on napaserve.org, public Substack posts, public primary sources (Legistar agendas, DOF tables, Census surfaces)
- ❌ Never: auth-gated admin config, Supabase studio, internal dashboards, anything behind a login

The reason for the boundary is that auth-gated surfaces leak credentials into a browsing context that is not scoped for them. Public surfaces are fine because they are public. See the diagnostic discipline lesson above for the canonical use case: inspect the rendered DOM on the live page before guessing at source-side fixes.

### Pulse Tracker — design committed; Phase 1+2 approved as next session's primary work

Pulse Tracker designed end-to-end across Phases 1 – 7. Full design lives in the `PulseTracker_Plan_2026-04-28` doc (canonical reference — do not duplicate the phase breakdown here).

**Approved as next session's primary work:** Phase 1 + Phase 2 — Supabase table + seeder + 85-row backfill. Implementation has not started; this entry records that the design is the agreed plan of record and that the first two phases are the kickoff scope.

### Master Brief and Cheatsheet — v2 shipped

v1 had content drops (sections from the April 27 work were missing from the rolled-up brief). v2 carries forward all April 27 content + adds tonight's new sections (lodging article, diagnostic lesson, Claude in Chrome boundary, Pulse Tracker design + Phase 1+2 approval). v2 is now the canonical reference; treat v1 as superseded.

### Files touched in repo

- `economic-pulse-app/src/under-the-hood-napa-lodging-pricing.jsx` (article + 5 charts + new prose section + Hospitality Jobs static conversion + legistar URL fix)
- `economic-pulse-app/src/napaserve-admin.jsx` (legistar URL fix)
- `pipeline/seed_article_polls.py` (polls 33/34/35)
- `CLAUDE.md` (this patch)

### Pending for next session

- **Primary:** Pulse Tracker Phase 1 + Phase 2 — Supabase table, seeder, 85-row backfill (per `PulseTracker_Plan_2026-04-28`)
- Audit remaining UTH articles for any other bare `LegislationDetail.aspx?ID=` URLs missing GUID + FullText
- Carry-overs from April 26 still open: napa-marketing-machine-2026, napa-population-2025 (May 1 DOF E-1), Q2 Lake County follow-up, substackPolls backfill audit

---

*End of April 28, 2026 patch — Valley Works Collaborative*

# CLAUDE.md Patch — April 30, 2026

Append this section after the April 28, 2026 patch.

---

## April 30, 2026 — `community_events` Schema Reference (VERIFIED) + Virtual Events Convention

Schema verified by direct dump from Supabase on 2026-04-30 after `is_virtual` column added and the Smoke Summit row (id 1764) inserted. Use this section as the canonical reference. The setup file `SQL/community_events_setup.sql` is **stale** — the live schema has drifted (8 columns added, 0 CHECK constraints).

### ⚠️ TOP-LEVEL WARNING — No DB-level whitelist enforcement

**`community_events` has ZERO CHECK constraints.** Verified via `pg_constraint` query on 2026-04-30: zero rows returned. Every whitelist documented below (`town`, `category`, `status`, `age_restriction`, `indoor_outdoor`) is **application-enforced only** — by the extraction prompt at `api/event-intake.js:24–66`, the `TOWNS` / `CATEGORIES` constants in `napaserve-event-finder.jsx:14–34`, and the submit-form dropdowns in the same file (see field-by-field source-of-truth pointers below).

Implications:

- Hand-written SQL inserts with off-whitelist values **succeed silently** — no DB error, but the row will be orphaned from filter UIs that test against the constants.
- Typos in the extraction prompt produce off-whitelist rows that pass extraction but never appear in town/category-filtered results.
- Pipeline scripts (`pipeline/04_seed_events.py`, manual imports) that bypass `api/event-intake.js` have **no safety net** — verify whitelist values before INSERT.

**Mitigation:** Always cross-check hand-written SQL or pipeline inserts against the source-of-truth pointers below. Adding CHECK constraints is deferred — would require a migration plus a decision on what to do with any off-whitelist rows already present (run `SELECT DISTINCT town, category, status, age_restriction, indoor_outdoor FROM community_events` before adding constraints).

### Column inventory (36 columns, verified 2026-04-30)

NOT NULL columns: `id`, `title`, `description`, `event_date`, `town`, `is_virtual`. All others nullable.

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | bigint | identity | PK |
| `title` | text | — | NOT NULL |
| `description` | text | — | NOT NULL |
| `event_date` | date | — | NOT NULL; indexed |
| `town` | text | — | NOT NULL; indexed; app whitelist |
| `category` | text | `'community'` | app whitelist; indexed |
| `end_date` | date | null | |
| `start_time` | text | null | **see format trap below** |
| `end_time` | text | null | **see format trap below** |
| `venue_name` | text | null | for virtual: `'Virtual ([platform])'` |
| `address` | text | null | for virtual: leave null |
| `price_info` | text | null | |
| `is_free` | boolean | false | |
| `age_restriction` | text | `'all_ages'` | app whitelist (submit form only) |
| `indoor_outdoor` | text | `'indoor'` | app whitelist (submit form only) |
| `is_recurring` | boolean | false | |
| `recurrence_desc` | text | null | |
| `website_url` | text | null | |
| `ticket_url` | text | null | |
| `organizer_contact` | text | null | |
| `accessibility_info` | text | null | |
| `submitted_by` | text | null | |
| `status` | text | `'pending'` | app whitelist; see status note below |
| `approved_at` | timestamptz | null | |
| `admin_notes` | text | null | |
| `source` | text | `'community'` | Verified values (2026-04-30 distribution): `google_sheet` (801), `weekender` (287), `NapaServe` (273), `NapaLife` (243), `community` (78), `Cameo Cinema` (4), `napaserve_submission` (4). Note: `community` is the column default — 78 rows either explicitly carry it or didn't override. `napaserve_submission` is the value set by `api/event-intake.js` for admin-UI inserts; the low count (4) reflects light usage of that pipeline to date. |
| `source_url` | text | null | |
| `submitted_at` | timestamptz | now() | |
| `created_at` | timestamptz | now() | |
| `featured` | boolean | false | drives homepage carousel; **see curation note** |
| `lat` | numeric | null | map marker |
| `lng` | numeric | null | map marker |
| `include_in_email` | boolean | false | digest inclusion; indexed |
| `email_sent_at` | timestamptz | null | |
| `submitter_phone` | text | null | |
| `is_virtual` | boolean | false | NOT NULL; added 2026-04-30 |

`is_virtual` was added with `NOT NULL DEFAULT false`, so all pre-existing rows backfilled automatically. **No manual backfill needed.**

### LOCKED conventions

**1. `start_time` / `end_time` format trap.**
Both columns are `text`, not `time`. Format is strictly `"H:MM AM/PM"` (e.g. `"11:00 AM"`, `"1:00 PM"`). **Do not use SQL `TIME` literals like `'11:00:00'`** — they bypass the `fmtTimeAP` regex at `napaserve-event-finder.jsx:57` and render as raw `"11:00:00"` on event cards. Surfaced 2026-04-30 by the Smoke Summit insert (id 1764), patched same day. The column name suggests `TIME`; it isn't.

**2. Virtual events convention** *(adopted 2026-04-30)*

| Field | Value |
|---|---|
| `is_virtual` | `true` |
| `venue_name` | `'Virtual ([platform])'` — e.g. `'Virtual (Zoom Webinar)'` |
| `address` | `null` |
| `town` | audience anchor — the Napa Valley town the event most plausibly serves; `'napa'` for general/regional audience |

`town` stays NOT NULL; the host-community convention overloads it rather than nulling it. Virtual events are excluded from town-filtered search results by default; an opt-in toggle (planned, not yet implemented) will OR `is_virtual=eq.true` into the filter, with both a per-card "Virtual" badge and a filter-row "Including virtual events" chip so the user understands why a non-Napa virtual event appears under their Calistoga filter.

`is_virtual` is a boolean for now. Do **not** pre-reserve an `event_format` enum column. When the first hybrid event arrives, add `is_hybrid`; reassess at three booleans.

**3. Whitelist values** (application-enforced only — see top-level warning)

- `town`: `napa | yountville | st-helena | calistoga | american-canyon` *(constant: `napaserve-event-finder.jsx:14–21`)*
- `category`: `art | music | food | community | wellness | nightlife | movies | theatre` *(constant: `napaserve-event-finder.jsx:23–34`; `astronomy` is a UI option that queries a separate table, not a `community_events.category` value)*
- `age_restriction`: `all_ages | 21_plus | 18_plus` *(submit-form dropdown: `napaserve-event-finder.jsx:1185`. Not emitted by extraction prompt — extracted events default to `'all_ages'`)*
- `indoor_outdoor`: `indoor | outdoor | both` *(submit-form dropdown: `napaserve-event-finder.jsx:1157`. Not emitted by extraction prompt — extracted events default to `'indoor'`)*
- `status`: `pending | approved` *(see status note below — `rejected` is never written)*

**4. Status nuance — `rejected` is never written.**
The setup file lists `rejected` as a status, but the admin reject action at `worker.js:1230–1243` **DELETEs the row** rather than patching status. In practice only `pending` and `approved` ever appear in the live table. This means `idx_ce_status` never sees `rejected` values, and any future code that queries for `status='rejected'` will return zero rows. Treat `rejected` as legacy / aspirational; do not query for it.

**5. `featured` is a curation surface, not a defect.**
The `featured` column exists (boolean, default false). The homepage carousel at `napaserve-event-finder.jsx:696` filters `featured=eq.true` and currently returns empty because no rows have been flagged. **Open question — curation policy pending:** who decides what gets featured, and through what UI? Tracked in Known Gaps below.

### RLS policies (verified)

| Policy | Cmd | Effect |
|---|---|---|
| `read_approved` | SELECT | public can read rows where `status = 'approved'` |
| `submit_events` | INSERT | public can insert (any values pass — no CHECK constraints) |
| `service_full` | ALL | service-role full access |

### Indexes (verified — duplication present)

| Index | Column |
|---|---|
| `community_events_pkey` | `id` |
| `idx_ce_date` | `event_date DESC` |
| `idx_ce_town` | `town` |
| `idx_ce_category` | `category` |
| `idx_ce_status` | `status` |
| `community_events_event_date_idx` | `event_date` |
| `community_events_town_idx` | `town` |
| `community_events_category_idx` | `category` |
| `community_events_include_in_email_idx` | `include_in_email` |

**Note:** `idx_ce_date / town / category` have parallel `community_events_*_idx` versions on the same columns. Not breaking — query planner uses one — but wasted write overhead on every INSERT/UPDATE. Cleanup is a low-priority `DROP INDEX` migration tracked in Known Gaps.

### Source-of-truth pointers for column formats and whitelists

- **Column format contract** → `api/event-intake.js:24–66` (Claude extraction prompt). Canonical reference for `event_date` (`YYYY-MM-DD`), `start_time` / `end_time` (`"H:MM AM/PM"`), `town`, `category`. Does **not** emit `age_restriction` or `indoor_outdoor`.
- **Towns / Categories filter constants** → `napaserve-event-finder.jsx:14–34`. Must stay in lockstep with the extraction prompt; drift between the two means a row passes extraction but doesn't render under any town/category filter.
- **`age_restriction` whitelist** → `napaserve-event-finder.jsx:1185` (submit form only).
- **`indoor_outdoor` whitelist** → `napaserve-event-finder.jsx:1157` (submit form only).

### Known Gaps additions (append to existing log)

- **`community_events` has no DB-level whitelist enforcement.** All whitelists are application-only. CHECK constraints deferred pending decision on what to do with any off-whitelist rows already present.
- **Featured event curation policy pending.** `featured` column exists (default false); no UI / decision process for flagging events. Homepage carousel returns empty until policy + UI defined.
- **Index duplication on `community_events`.** Three pairs of redundant indexes (`event_date`, `town`, `category`). Low-priority `DROP INDEX` migration to reclaim write overhead.
- **`SQL/community_events_setup.sql` is stale.** Live schema has 8 columns not in setup file (`featured`, `lat`, `lng`, `include_in_email`, `email_sent_at`, `submitter_phone`, plus `is_virtual` added 2026-04-30, plus parallel `community_events_*_idx` indexes). Either regenerate setup file from current schema or supersede with this CLAUDE.md section as the canonical reference.
- **`source` column naming inconsistency + missing scraper tag.** Two conventions exist for the same publication: `NapaServe` (capitalized, no underscore, 273 rows) and `napaserve_submission` (lowercase, underscore, 4 rows). Decision pending: normalize to one, or keep distinct (e.g., `NapaServe` = editorial curation, `napaserve_submission` = admin-UI pipeline). Separately, no distinct scraper source tag is visible in the distribution — the Tier-3 scraper at `napa-event-finder.vercel.app` either writes through an existing `source` value or scraper-ingested rows aren't tagged distinctly. Worth verifying when the scraper pipeline gets next-touched.
- **Extraction prompt incomplete: `age_restriction` and `indoor_outdoor` not emitted.** `api/event-intake.js` does not emit either field. Every admin-UI ingested event silently defaults to `all_ages` / `indoor` regardless of source content. For events that are 21+ or outdoor, the data is silently wrong. Decision pending: extend extraction prompt to emit both fields, or accept as submit-form-only fields and remove from the inferred-data path.

### Pending implementation — Virtual Events only

Recorded here for traceability; no code changes made on 2026-04-30. Implementation order TBD; this list is scoped to the virtual-events feature only — `featured` curation and index cleanup are tracked in Known Gaps above.

- **Q1 resolved:** `town` stays NOT NULL.
- **Q2 resolved:** audience-anchor convention (not host).
- **Q3 resolved:** virtual events excluded from town filters by default; opt-in toggle planned with chip + per-card badge.
- **Q4 resolved:** `is_virtual` boolean only; do not pre-reserve `event_format`; revisit at first hybrid event.

To-build list (deferred to next session, virtual-events scope only):
- `is_virtual` extraction in `api/event-intake.js` prompt + JSON schema
- "Virtual" per-card badge in `napaserve-event-finder.jsx` (search results, featured, upcoming surfaces)
- Filter-row "Including virtual events" chip + opt-in toggle
- End-to-end test: insert virtual event via admin UI, verify badge + toggle behavior

---

*End of April 30, 2026 patch — Valley Works Collaborative*

---

## Session Update — 2026-05-04

### Shipped
- **napa-marketing-machine-2026** Under the Hood article published live: *The Challenges of Napa's Massive Marketing Machine* — https://napaserve.org/under-the-hood/napa-marketing-machine-2026
  - 9 article sections, 3 custom Chart.js charts (ChartOne dual-axis line, ChartTwo stacked horizontal bars, ChartThree vertical bars with cumulative callout)
  - Polls 36/37/38 seeded
  - 7 Related Coverage links, 41 Sources, Methodology Note
  - Database: napaserve_articles.id=13, published=true, polls_seeded=true
  - Three commits: `59d7828` (initial build, bundle index-B6UK5b2m.js), `337fbec` (chart 3 callout repositioning, bundle index-B-TxDhpW.js), `d26ad7e` (Challenges/Downside title + summary refinement + Section 9 closing, bundle index-B30rtBi_.js)
- **"We Need Your Guidance" reader-feedback note + 5-option poll** drafted and locked for next Substack column. Marks NVF entering its fourth year. Decision pending: seed as NapaServe poll 39 in addition to Substack, or Substack-only.

### Poll Slug Registry (updated)
- Last seeded: napa-marketing-machine-2026 → polls 36, 37, 38
- **Next available poll ID: 39**

### Top Backlog for Next Session
1. **Word export template fixes** (admin Word export, affects every UTH article past and future):
   - Caption double-period: source string ends with "." and template appends another "."
   - Caption "Filename:" injection: chart-N_<slug>_nvf.png renders as inline prose; should be data-only
   - Sources block markdown-link collapse inconsistency: some entries quoted-title, some plain text
   - Fix scope: napaserve-admin.jsx export rendering function
2. Reader-feedback poll seeding decision (NapaServe poll 39 vs Substack-only)
3. Pulse Tracker Phases 1+2 build (Supabase table napa_lodging_monthly + Python seeder)
4. Population article unfreeze candidate (DOF E-1 May 1 release integrated into Marketing Machine; standalone article can move forward)

### Operational Learnings (added to Cheatsheet)
- **iCloud sync mid-session can cascade into EPERM on the project tree.** Symptom: "Working directory was deleted" message; ls/stat work but every open() fails with Operation not permitted. Fix: restart Claude Code from inside the project directory (`cd ~/Desktop/napaserve && ulimit -n 2147483646 && source .env && claude`). The new process gets fresh sandbox trust.
- **macOS file-descriptor limit**: Claude Code needs `ulimit -n 2147483646`. Persist in `~/.zshrc` to avoid re-running each session.
- **zsh paste pitfall**: pasting multi-line shell sequences with `#` comments can drop the shell into `if>` continuation. Fix: Ctrl+C; paste one line at a time.
- **EOS file moves**: ALWAYS `ls Active/` first to see what's actually there before issuing move commands. Never assume prior file dates from memory. Lesson learned 2026-05-04 when an attempted move of a non-existent `2026-04-29_v2` Session Summary failed because the actual prior file was dated `2026-04-28`.

### Editorial Calls Confirmed This Session
- Word export retains "Under the Hood:" prefix in headline (vs. site eyebrow which displays it separately) — keep as-is
- Word export retains long founder-and-editor byline at bottom (vs. site short byline) — keep as-is
- Word export retains "Article Summary:" insertion between deck and body (vs. site which jumps straight to body) — keep as-is

### Single-Prompt Protocol Re-Confirmed
Every UTH build is one self-contained Claude Code prompt covering verification gates → file scaffold → body prose → charts → captions → polls → related coverage → sources → methodology → admin card → route → DB insert → poll seeding → build → commit → deploy → verify. Long is fine. Splitting into multiple chat-side pieces introduces friction. This was re-confirmed mid-session after a 4-piece chat-side split was correctly flagged.

---

## Session Update — 2026-05-10

### Three protocol-drift corrections caught and locked

During Section 0 verification for the `napa-population-2025` build, three places where the UTH Protocol document contradicted the live Marketing Machine ship surfaced. All three corrected in `NapaServe_UnderTheHood_Protocol_2026-05-10.docx`:

- **Related Coverage:** plain link list (quoted titles + em-dash + publication + parenthetical date). NOT card grid. Cards convention deprecated weeks before May 10. Live Marketing Machine, Lodging Pricing, and prior shipped UTH articles all use plain links.
- **Render order after final body paragraph:** byline → PollsSection → Related Coverage → Archive → Methodology → Sources → Footer. PollsSection moved directly after byline so the call-to-vote sits adjacent to the moment the reader finishes the prose. Methodology precedes Sources.
- **Body link format:** native JSX `<a>` tags in article body. The `h()/t()/c()` helpers are scoped to admin EXPORT_DATA Word export only.

**Locked principle: live > protocol > assistant memory.** When source code and protocol disagree on rendering format, default to source code, then update the protocol. Protocol that the assistant doesn't actually read is protocol that doesn't constrain behavior.

### Schema corrections (verified May 10 via Supabase REST)

**`napaserve_articles` real columns:** `id, slug, title, publication, published, published_at, created_at, admin_cards_added, related_coverage_added, polls_seeded, topic_seed, headline, deck`. There is NO `subtitle`, `excerpt`, or `estimated_read_time` column. The `deck` column holds what some prompt drafts called "subtitle." PATCH attempts against fabricated columns produce PGRST204 and revert cleanly.

**`napaserve_article_polls` real columns:** `id (auto), article_slug, question, options (text array), sort_order (1/2/3 within an article), created_at`. There is no `poll_id` column. The "polls 18-20 reserved" framing for `napa-population-2025` in earlier session docs was a registry label, not a DB column value. Verified `MAX(id) = 38` as of May 10; new polls auto-assign starting at 39.

### TCC stale entitlement on Terminal — new operational pitfall

Distinct failure mode from the May 4 iCloud cwd cascade. Symptom: every CLI tool fails EPERM on every file in the project tree, `ls` on the parent directory still works, Settings shows Terminal toggled on under Full Disk Access, restarting Terminal does NOT resolve. Cause: macOS TCC holds a stale code-signing identity for Terminal after an OS or app update.

Diagnostic (run first when EPERM appears across multiple tools):

Lines containing `Platform binary prompting is 'Deny'` confirm TCC has revoked access.

Fix: System Settings → Privacy & Security → Full Disk Access → remove Terminal → re-add from `/System/Applications/Utilities/Terminal.app` → Cmd+Q quit → relaunch. Full recipe in `NapaServe_Cheatsheet_2026-05-10.docx` Operational Pitfalls section.

### Two new operating principles (Working Contract additions)

**Read-before-draft:** when asked to produce any Claude Code prompt or to make any decision documented in protocol files, Claude reads the relevant protocol section before drafting and states which sections were read. Pattern violated repeatedly May 10 (draft → catch violation → re-read → re-draft). The fix is to start with read, not with draft.

**Diagnostic ordering:** when a symptom appears across multiple tools (EPERM on every file, command failures with confusing messages), run the lowest-level diagnostic FIRST before theorizing about file state, iCloud sync, extended attributes, or process trust. Kernel logs / direct DB queries / live page DOM resolve faster than walking the inference chain backwards.

### Bash subshell env var pattern

For Bash invocations in Claude Code that spawn child processes (e.g. Python scripts that call REST APIs), prepend `set -a && source .env && set +a` so env vars auto-export to subshells. Plain `source .env` works for the current shell but not for invocations that spawn child processes.

### Four-chart support in UTH Protocol

The chart numbering protocol now supports 4 or more charts per article. Pattern extends: `chart-1_<slug>_nvf.png`, `chart-2_<slug>_nvf.png`, `chart-3_<slug>_nvf.png`, `chart-N_<slug>_nvf.png`. The `napa-population-2025` build is the first article to ship with 4 charts (jurisdiction population change, Calistoga TOT and rooms, housing-to-income multipliers, housing units vs population indexed).

### Status at session end 2026-05-10

- `napa-population-2025` build in progress, Section 2 complete. New JSX file at `economic-pulse-app/src/napaserve-under-the-hood-population.jsx` (1,129 lines, 90,861 bytes). Backup of stale 934-line version retained at `~/Desktop/napaserve_population_jsx_backup_20260510_142059.jsx`. V5 prose on disk at `~/Desktop/napaserve/V5_calistoga_population_2026.md`.
- Build paused before Section 3 (DB PATCH on row id=6). Resumes next session in fresh context with corrected May 10 protocol loaded from Project Knowledge.
- DB row `napaserve_articles.id=6` unchanged from earlier-thesis state (no writes).
- Pipeline poll seeder file `pipeline/seed_article_polls.py` has stale `napa-population-2025` block at lines 116-133 — must be replaced with V5 polls before next dry-run/live seed.
- Three known TODOs in Section 2 JSX for placeholder data: ChartTwo intermediate FY values (FY14-15 through FY24-25 minus verified anchors), ChartFour housing and population placeholder series pending DOF E-1/E-1H historical pulls.
- Five EOS docs cumulative-rebuilt for 2026-05-10 and uploaded to Claude.ai Project Knowledge; May 5 versions moved to `Active/Older Drafts/`.


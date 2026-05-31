# NapaServe — Platform Debt Ledger

Canonical inventory of deferred technical and editorial debt. Single home for debt items previously scattered across Master Brief, Cheatsheet, Email Worksheet, PulseTracker Plan, and Session Summaries.

Established 2026-05-24. Governed by ADR-001.

---

## How This Ledger Works

### Entry schema

- **ID** — `PD-YYYY-MM-DD-NN` (date surfaced + sequence number)
- **Title** — short descriptor
- **Status** — `OPEN` / `SCHEDULED` / `SHIPPED-NEEDS-VERIFY` / `CLOSED`
- **Surfaced** — date first added to ledger
- **Affected surfaces** — files, routes, tables, UI components
- **Symptom** — what users or developers see
- **Root cause** — what's wrong, or "unknown — diagnostic pending"
- **Scope** — single-file fix / multi-file refactor / new feature / process change
- **Related entries** — other ledger entry IDs
- **Audit obligations** — what to check before declaring CLOSED
- **Notes** — context, prior session references

### EOS roll-call ritual (Lesson DD, 2026-05-24)

Before generating EOS docs at session end, re-read this ledger and answer:

1. Did any SCHEDULED item ship this session?
2. Did any SHIPPED-NEEDS-VERIFY item get verified live?
3. Did new debt surface this session?
4. Did this session touch any subsystem with existing debt entries?

### Status definitions

- **OPEN** — known debt, not yet scheduled
- **SCHEDULED** — committed to upcoming session(s)
- **SHIPPED-NEEDS-VERIFY** — code shipped, awaiting live verification
- **CLOSED** — verified done; archived to bottom of file

---

## Active Debt

### Tracker subsystem

#### PD-2026-05-24-01 — Worker.js handleSendDigestPreview UTC offset (Lesson AA application)
- **Status:** OPEN
- **Surfaced:** 2026-05-24 (latent for weeks per Email Worksheet "pending fix")
- **Affected surfaces:** `economic-pulse-app/src/worker.js` handleSendDigestPreview()
- **Symptom:** Weekly digest email date shows next day
- **Root cause:** Same as Lesson AA — `new Date(dateOnlyISO)` parses UTC midnight
- **Scope:** Single-file fix in Worker; manual Cloudflare deploy
- **Audit obligations:** Send test digest preview, confirm date renders correctly

#### PD-2026-05-24-02 — Pre-September 2025 baseline events not in Supabase
- **Status:** OPEN
- **Surfaced:** 2026-05-24
- **Affected surfaces:** `napa_transition_tracker` table; calculators page
- **Symptom:** Pre-refactor hardcoded `TRACKER_EVENTS` contained baseline editorial entries back to 2023; Supabase only holds events from 2025-09-01
- **Root cause:** Original tracker built with hardcoded JSX baseline; never backfilled
- **Scope:** Backfill mini-session: `git show <pre-refactor-SHA>` recovers, then INSERT
- **Related entries:** PD-2026-05-24-03
- **Audit obligations:** Verify count via Worker API matches expected

#### PD-2026-05-24-03 — "Load older events" UI affordance on calculators
- **Status:** OPEN
- **Surfaced:** 2026-05-24
- **Affected surfaces:** `napaserve-calculators.jsx` Contraction Tracker
- **Symptom:** 6-month default; older events exist in Supabase but not visible
- **Scope:** UI feature; expand `since` param via `useTrackerEvents` hook
- **Related entries:** PD-2026-05-24-02
- **Audit obligations:** Chrome MCP mobile + desktop

### Word export

#### PD-2026-05-24-04 — Word export template bugs
- **Status:** OPEN (deferred since 2026-05-04)
- **Affected surfaces:** `napaserve-admin.jsx` export rendering; affects every UTH article
- **Symptom:** Three bugs — caption "..", "Filename:" inline prose, Sources markdown collapse inconsistency
- **Scope:** Multi-bug single-file fix
- **Audit obligations:** Word export of 3 UTH articles, all bugs resolved

### useDraftGate

#### PD-2026-05-24-05 — useDraftGate destructure across 5 UTH files + template
- **Status:** OPEN (since 2026-05-10)
- **Affected surfaces:** Five UTH JSX files plus `under-the-hood-template.jsx`
- **Symptom:** Hook returns `{status, title}` object; consumers compare to string literal
- **Scope:** Multi-file fix; template highest priority
- **Audit obligations:** Build all 5 files; test draft gate redirect

### Snapshot dashboard

#### PD-2026-05-24-06 — CARD_INSET unused const in SnapshotTab.jsx
- **Status:** OPEN (since 2026-05-18)
- **Symptom:** Lint warning, no functional impact
- **Scope:** Single-line cleanup

#### PD-2026-05-24-08 — HOUSING card phantom keys
- **Status:** OPEN (since 2026-05-05)
- **Affected surfaces:** SnapshotTab.jsx Housing card
- **Symptom:** `latestE?.home_value_yoy` and `latestE?.days_pending` read nonexistent keys
- **Scope:** Two-line fix
- **Audit obligations:** Chrome MCP verification

### UTH inventory

#### PD-2026-05-24-09 — Sonoma schools cross-link patch on napa-schools-2026
- **Status:** OPEN (waiting on upstream)
- **Surfaced:** 2026-05-17
- **Scope:** Iteration-on-published-article patch (JSX + EXPORT_DATA; NO DB)
- **Audit obligations:** Bundle hash polling + Chrome MCP

#### PD-2026-05-24-10 — Open editorial flags on napa-population-2025
- **Status:** OPEN (since 2026-05-12)
- **Symptom:** Six editorial inconsistencies (8% vs 9.7%, 19% rooms claim, $35K tourism wage, 70 vs 70.6 acres, Motor Lodge timing, Motor Lodge Hyatt JdV)
- **Scope:** Editorial decisions first, then code patches
- **Audit obligations:** Each item reconciled; Chrome MCP confirms

#### PD-2026-05-24-11 — Charts 1, 2, 4 caption source URL audit on napa-population-2025
- **Status:** OPEN (since 2026-05-12)
- **Scope:** Per-caption inspection; same fix pattern as Chart 3 (Lesson H body-anchor discipline)

#### PD-2026-05-24-12 — ChartOnePointFive axis padding symmetry polish
- **Status:** OPEN (since 2026-05-12)
- **Symptom:** -1.1% to +0.5% asymmetric padding
- **Scope:** Single-chart config fix

### Pulse Tracker

#### PD-2026-05-24-13 — Pulse Tracker Phase 1+2 build
- **Status:** OPEN (since 2026-04-28)
- **Affected surfaces:** New table `napa_lodging_monthly`; new `pipeline/seed_pulse_tracker.py`
- **Symptom:** STR/TOT/employment data still manually keyed from PDFs into each UTH
- **Scope:** Phase 1 (table + 85-row backfill) + Phase 2 (Python seeder). Schema decision pending: lodging-specific vs generic indicator
- **Notes:** "Primary next-session task" since April 28; consistently deferred

#### PD-2026-05-24-14 — Pulse Tracker Phase 3 (Worker endpoint)
- **Status:** OPEN (depends on PD-2026-05-24-13)
- **Scope:** Cloudflare Worker route `/api/pulse-tracker`; mirrors `/api/article-polls`

#### PD-2026-05-24-15 — Pulse Tracker Phase 4 (dashboard card)
- **Status:** OPEN (depends on -13 + -14)
- **Notes:** Will be consumer #3 of `useTrackerEvents` pattern — at this point time to consider generic hook abstraction

### BlueSky publisher

#### PD-2026-05-24-16 — BlueSkyPublisher.jsx stale title and DRAFT-label bugs
- **Status:** OPEN (since 2026-05-17)
- **Symptom:** DRAFT labels on published articles; stale population title
- **Root cause:** Likely component state caching or wrong-flag-read

### Repository hygiene

#### PD-2026-05-24-17 — .gitignore *.bak* sweep
- **Status:** OPEN (since 2026-05-18)
- **Scope:** One-line .gitignore addition + `git rm --cached` for tracked .bak files

#### PD-2026-05-24-18 — Preview branch cleanup
- **Status:** OPEN (since 2026-05-18)
- **Symptom:** `snapshot-png-polish-2026-05-18` and `-r2-2026-05-18` still on origin
- **Scope:** Two `git push origin --delete` commands

### Layout

#### PD-2026-05-24-19 — Card-orphan-on-odd-count edge case
- **Status:** OPEN (since 2026-05-18; not regression)
- **Notes:** Editorial decision required from Tim

#### PD-2026-05-24-20 — Mobile grid fixes — Charts 1, 2, 4 label truncation at 375px
- **Status:** OPEN
- **Surfaced:** 2026-05-17
- **Scope:** Per-chart label-positioning fix

### Editorial / platform features (lower priority backlog)

- **PD-2026-05-24-21** — Hub four-pillars redesign
- **PD-2026-05-24-22** — VW Labs dedicated page
- **PD-2026-05-24-23** — KB-3 RAG in Project Evaluator
- **PD-2026-05-24-24** — Native first-party polling (napaserve_polls table)
- **PD-2026-05-24-25** — Dark mode (lowest priority)
- **PD-2026-05-24-26** — Native Chart.js export refactor (Option B, deferred from May 12)

### Process improvements

#### PD-2026-05-24-27 — EOS Stage 2 (frontmatter + drift detection)
- **Status:** OPEN (ADR-001 Stage 2)
- **Scope:** YAML frontmatter schema; pre-commit hook; session-start drift detection
- **Related entries:** ADR-001 in `napaserve-decisions.md`

---

## Recently Closed (Archive)

### PD-2026-05-24-A — Lesson AA: date off-by-one on Snapshot Tab and admin pending
- **Status:** CLOSED 2026-05-24
- **Commit:** e5715cc
- **Notes:** Two surfaces patched. Chrome MCP confirms three new tracker events render correct dates. Worker.js still carries same pattern — see PD-2026-05-24-01.

### PD-2026-05-24-B — Lesson BB: scrollRestoration manual on hard-load
- **Status:** CLOSED 2026-05-24
- **Commit:** 777f34f
- **Notes:** One-line addition with defensive guard. Chrome MCP confirms both routes load at scrollY 0.

### PD-2026-05-24-C — Lesson CC: Calculators/Snapshot dual-write gap
- **Status:** CLOSED 2026-05-24
- **Commit:** 1fb694a
- **Notes:** Shared `useTrackerEvents` hook. Bundle confirms hardcoded array eliminated. Chrome MCP confirms calculators 24-event chart with filter working.

### PD-2026-05-24-D — Snapshot tracker fetch hoist (superseded)
- **Status:** CLOSED 2026-05-24 (superseded by useTrackerEvents refactor)
- **Notes:** Original Snapshot v1.1 carry-forward. Achieved structurally via shared hook rather than hierarchically.

---

## Conventions

### When CLOSED, what stays?
Full original entry stays with status updated and closing note. CLOSED entries migrate to bottom archive. Not deleted — institutional memory.

### When CLOSED symptoms recur?
Add new entry with new ID. Reference original in "Related entries." Don't reopen original.

### When SHIPPED-NEEDS-VERIFY can't be verified?
Keep at SHIPPED-NEEDS-VERIFY with blocking note, or move back to OPEN if verification gap revealed deeper issue.

---

## 2026-05-30 Roll-Forward Entries

#### PD-2026-05-30-01 — `astronomical_events` empty (seed not populating)
- **Status:** RESOLVED 2026-05-31 · surfaced 2026-05-29
- **Resolution:** root cause = `05_seed_astronomy.py` (4cb219d) written but never run/scheduled. Added unique index on (title, event_date), seeded 38 events, added worker `event_date>=today` night-sky filter (60919c7, deployed to misty-bush-fc93). Verified live: night-sky leads with Strawberry Moon 06-10, source=astronomical_events.
- **Note:** seed is a hardcoded 2026 calendar and not scheduled → see PD-2026-05-31-01.

#### PD-2026-05-30-02 — orphan tables `event_instances`/`event_series` still live
- Status: OPEN (decided DROP after zero-consumer grep) · confirmed live 5-30 (both 200)
- Next: grep both repos for readers; if zero → DROP both + strip writes from `04_seed_events.py`

#### PD-2026-05-30-03 — `04_seed_events.py` one-shot guard missing
- Status: OPEN · confirmed 5-30 (no guard found)
- Next: add `--force-reseed-acknowledged` flag + banner-and-exit default

#### PD-2026-05-30-04 — `napa-farming-2026-gwss` 5 open verify flags
- Status: OPEN · draft d67e8fb; reported published 5-27 (confirm DB + poll IDs; resolve flags)

#### PD-2026-05-30-05 — GitHub PAT rotation — RESOLVED 2026-05-30
- Status: CLOSED (residual: MASTER_KEYS rotation-log line + expiry 2027-05-30)
- New fine-grained `multi-repo git push (laptop)` in Keychain, push verified, both classics (expiring 6-01) deleted, `.env` updated.

#### PD-2026-05-30-06 — submit-form pipeline fix — status unverified
- Status: OPEN · from 5-25; grep worker/pipeline history to settle shipped/not, then close or schedule

(Note: PD-2026-05-24-27 — ADR-001 Stage-2 doc-drift detection — remains OPEN and is why the ~25-commit drift went unnoticed.)

---

## 2026-05-31 Astronomy-Fix Follow-Ups

#### PD-2026-05-31-01 — Astronomy auto-seed / 2027 cliff
- **Status:** OPEN
- `05_seed_astronomy.py` is a hardcoded 2026 calendar (`get_2026_moon_phases()` + static list), not in any workflow — the table runs dry of upcoming events around year-end. `fetch_moon_phases()` (AstronomyAPI, uses ASTRONOMY_APP_ID/SECRET) is dead code = the half-built dynamic source.
- **Fix:** complete the AstronomyAPI integration for moon phases, generalize the annual calendar, schedule a yearly top-up. Supersedes the earlier "remove dead code" note — finish it, don't delete it.

#### PD-2026-05-31-02 — Night-sky filter hides active multi-day events
- **Status:** OPEN
- `event_date >= today` drops events whose start has passed but `end_date` is future — e.g. Milky Way Core Season (04-01 → 09-30) hidden during peak season.
- **Fix:** filter on `end_date` when present (`event_date OR end_date >= today`). Worker tweak + manual Cloudflare redeploy.

#### PD-2026-05-31-03 — events-search night-sky capped at 10
- **Status:** OPEN
- ~20 upcoming seeded; endpoint returns 10 (stops at Corn Moon 09-07). Confirm intended top-N vs full calendar; bump limit if the latter.

#### PD-2026-05-31-04 — `/api/events-search` consumer unknown
- **Status:** OPEN
- No frontend caller found in `src/`. Confirm consumer (Squarespace embed / mobile app / CC events page) before future schema/param changes.

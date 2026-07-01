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
- **Status:** RESOLVED 2026-06-10 (commit `37d1336`)
- **Affected surfaces:** `components/WordExporter.jsx` export rendering (imported by `napaserve-admin.jsx`); affects every UTH article
- **Symptom:** Three bugs — caption "..", "Filename:" inline prose, Sources markdown collapse inconsistency
- **Scope:** Multi-bug single-file fix
- **Audit obligations:** Word export of 3 UTH articles, all bugs resolved
- **Resolution:** Fixed in `components/WordExporter.jsx` (the actual render code; the ledger's earlier "napaserve-admin.jsx" pointer named the importer, not the render function). (1) Caption terminal period normalized via `trimTerminal()` so exactly one period precedes "Source:" and closes the line. (2) Injected `Filename: chart-N_..._nvf.png` clauses stripped from caption descriptions via `stripFilename()` so they never reach Word prose. (3) Caption sources now render as live `ExternalHyperlink`s with their label text (was a single plain `TextRun`). Rode the smoke-taint-2026 article commit. Final browser Word-export visual check of smoke-taint-2026 + 3 existing UTH articles handed to Tim (no browser/Chrome MCP in the build session).

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
- **Resolution:** root cause = `05_seed_astronomy.py` (4cb219d) written but never run/scheduled. A pre-existing unique constraint already covered (title, event_date) (a redundant index was briefly added then dropped); seeded 38 events, added worker `event_date>=today` night-sky filter (60919c7, deployed to misty-bush-fc93). Verified live: night-sky leads with Strawberry Moon 06-10, source=astronomical_events.
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

---

## 2026-06-02 Roll-Forward Entries

#### PD-2026-06-02-01 — Hub bypasses Worker `/api/articles` (route lacks `headline`)
- **Status:** OPEN
- **Surfaced:** 2026-06-02
- **Affected surfaces:** `economic-pulse-app/src/under-the-hood-index.jsx`; Cloudflare Worker `/api/articles` route
- **Symptom:** Hub fetched Worker `/api/articles`, which has no `headline` field; farming card rendered blank. Hub now fetches Supabase REST directly (anon key, `published=eq.true`) for `headline` — a forked data path (commit 4ca41e0).
- **Root cause:** Worker `/api/articles` select omits `headline`.
- **Scope:** Single-route Worker change + manual Cloudflare deploy, then point hub back off the direct Supabase fetch.
- **Notes:** The Napa Lowdown scout consumes `/api/tracker-events`, not `/api/articles` — no external-consumer cutover risk on this route. See ADR-003.
- **Audit obligations:** Confirm `headline` present in Worker response; hub renders identical titles after pointing back; farming card non-blank.

#### PD-2026-06-02-02 — Gen-z admin EXPORT_DATA bottom-`sources` lack `[label](url)` markdown
- **Status:** OPEN
- **Surfaced:** 2026-06-02
- **Affected surfaces:** `napaserve-admin.jsx` gen-z (`could-gen-z-save-the-wine-industry`) EXPORT_DATA `sources` array
- **Symptom:** Gen-z bottom-`sources` are plain strings with no `[label](url)` markdown, unlike the schools entry (canonical shape per UTH Protocol).
- **Scope:** Editorial/markdown patch; do together with the Word-export template fix.
- **Related entries:** PD-2026-05-24-04 (Word-export Sources markdown-link collapse)
- **Notes:** Add markdown across all articles together when the template bug is fixed — avoid a one-off divergence.

#### PD-2026-06-02-03 — Extract gen-z chart patterns into canonical template / chart-examples reference
- **Status:** OPEN (forward)
- **Surfaced:** 2026-06-02
- **Affected surfaces:** `under-the-hood-template.jsx` (or a new chart-examples reference); source patterns in `under-the-hood-could-gen-z-save-the-wine-industry.jsx`
- **Symptom:** Four clean chart patterns (line-with-era-annotations, multi-cohort bubble with labels above each circle, step-down waterfall, interactive scenario tester) live only in a shipped article; protocol forbids copying from a live published article.
- **Scope:** Extraction into the canonical scaffold or a dedicated reference file.

---

## 2026-06-03 Roll-Forward Entries

#### PD-2026-06-03-01 — Contraction Tracker same-month/same-category dot collision
- **Status:** OPEN
- **Surfaced:** 2026-06-03
- **Affected surfaces:** `napaserve-calculators.jsx` Contraction Tracker chart (month-resolution x-axis)
- **Symptom:** Two events in the same calendar month and category render at identical (x, y) coordinates — one visible dot whose tooltip lists both (e.g. Alila May 18 + Studio Findings May 31, both Hospitality). A reader reads one dot as one event.
- **Root cause:** x-axis maps events to months-since-Jan-2023 (day-of-month discarded); y is category. Same month + same category → exact overlap.
- **Scope:** Single-chart enhancement. Options: day-resolution x-axis, per-collision offset/jitter, or a "+N" stacked-count badge.
- **Related entries:** PD-2026-05-24-02/-03 (tracker windowing/backfill)
- **Notes:** Surfaced during Civic verification. Not a regression — pre-existing behavior of the month-resolution axis.

---

## 2026-06-11 Roll-Forward Entries

> **Theme:** Admin Ops Console — a new internal-admin feature built in three phases. Phase 1 is the highest-value (fixes this session's data-freshness blind spot) and is built alongside PD-2026-06-11-09 (Substack automation). Phases 2 and 3 share a common Worker-proxy pattern for secret-bearing status APIs.

#### PD-2026-06-11-01 — Ops Console Phase 1: data-freshness heartbeat
- **Status:** OPEN (build alongside PD-2026-06-11-09 Substack automation)
- **Surfaced:** 2026-06-11
- **Affected surfaces:** NEW `pipeline_runs` table; each pipeline seeder (write finished-at on completion); `napaserve-admin.jsx` (freshness card)
- **Symptom:** Nothing surfaces when the Substack pull (or any pipeline) last ran; the April→June lapse was invisible until it showed as stale public content.
- **Root cause:** Pipelines write content but no run-heartbeat; freshness is only inferable from newest content date, which conflates content age with pull age.
- **Scope:** New feature (small). Heartbeat write per seeder + one admin card reading `MAX(finished_at)` per source with a stale-threshold badge.
- **Related entries:** PD-2026-06-11-09 (Substack automation) — the weekly cron writes the heartbeat for free.
- **Audit obligations:** Trigger a pull, confirm card updates; confirm stale badge fires.
- **Notes:** Highest-value of the three; directly fixes this session's blind spot.

#### PD-2026-06-11-02 — Ops Console Phase 2: service reachability lights
- **Status:** OPEN
- **Surfaced:** 2026-06-11
- **Affected surfaces:** NEW authenticated admin Worker route holding Vercel + Cloudflare API tokens as Worker secrets; `napaserve-admin.jsx` panel; manual Cloudflare deploy
- **Symptom:** No single internal view of Supabase/Vercel/Cloudflare health.
- **Root cause:** Constraint — those status APIs need secret tokens → cannot be called from the public frontend bundle → must proxy through a Worker.
- **Scope:** New feature (medium). v1 = green/yellow/red + latency (Supabase REST ping, Worker `/health` ping, Vercel last-deploy). NOT error-log aggregation.
- **Related entries:** External-consumer flag — Napa Lowdown + CC read-tenant rules apply to ANY Worker route change (see ADR-003).
- **Audit obligations:** Each light reflects a real induced outage/latency; tokens never in the frontend bundle.
- **Notes:** Scope discipline — lights, not a second logging system.

#### PD-2026-06-11-03 — Ops Console Phase 3: site activity
- **Status:** OPEN (blocked on prerequisite)
- **Surfaced:** 2026-06-11
- **Affected surfaces:** Analytics provider (TBD); admin panel; Worker proxy
- **Symptom:** No internal view of where visitors go / top pages / referrers.
- **Root cause:** No analytics instrumented today — no data to display yet.
- **Scope:** New feature; prerequisite first — pick a cookieless provider (Cloudflare Web Analytics / Vercel Web Analytics / Plausible; brand-fit, no consent banner), instrument, THEN build the panel via proxy.
- **Related entries:** PD-2026-06-11-02 (same proxy pattern).
- **Notes:** Don't build a viewer for data that doesn't exist; privacy-respecting provider is an editorial requirement, not just technical.

#### PD-2026-06-11-04 — Home-value MoM delta SSOT drift
- **Status:** OPEN (parked behind PD-2026-06-11-09 per Tim, 2026-06-11)
- **Surfaced:** 2026-06-11
- **Affected surfaces:** `napa-economic-pulse-full-3.jsx` — Overview AVG HOME VALUE KPI delta, Snapshot Housing card, Overview weekly-summary prose
- **Symptom:** Same value ($893,351) but Overview KPI shows ▲ +6,106 MoM while Snapshot says "Unchanged MoM" and the weekly summary says "up 0.0% from prior snapshot." Three surfaces flat; the +6,106 is the outlier.
- **Root cause:** MoM delta computed independently in ≥2 places against different prior references; no shared computed-delta helper.
- **Scope:** Single-file investigation + unify on one delta (Lesson CC pattern).
- **Related entries:** Lesson CC (useTrackerEvents SSOT precedent)
- **Audit obligations:** All three surfaces show one MoM figure; Chrome MCP check.
- **Notes:** Parked behind data work per Tim.

#### PD-2026-06-11-05 — Older-gen UTH header normalization (7 files)
- **Status:** OPEN
- **Surfaced:** 2026-06-11
- **Affected surfaces:** 7 older-gen UTH files (sonoma, gdp-2024, lake, napa-structural-reset, the v2 file, supply-chain, price-discovery)
- **Symptom:** No ← Back button (deferred from NIT 3) + divergent headers vs the 9 canonical articles; 5 lack a `useNavigate` import.
- **Root cause:** Predate the canonical UTH template; bespoke headers.
- **Scope:** Per-file — add `useNavigate` where missing, locate each header, insert `handleBack` + ← Back. Not the clean 3-line insert.
- **Related entries:** NIT 3 (this session, canonical 9 done)
- **Audit obligations:** ← Back renders + click works on all 7; clean build.
- **Notes:** Corrects the brief's "every UTH article is a template copy" — it's 9 canonical / 7 older-gen.

#### PD-2026-06-11-06 — Reader Sentiment (Snapshot) stale via `/api/latest-substack-poll`
- **Status:** CLOSED
- **Resolution 2026-06-12:** /api/latest-substack-poll returns Jun-12 poll 548174; Community Sentiment card current (Chrome MCP verified).
- **Surfaced:** 2026-06-11
- **Affected surfaces:** Snapshot Reader Sentiment signal; Worker `/api/latest-substack-poll`
- **Symptom:** Frozen on "syrah–pinot blend / Wine Chronicles / 29 votes" — newest Substack poll hasn't changed because `nvf_polls` is stale since ~April.
- **Root cause:** Data staleness (overdue pull), not route logic. Distinct path from NIT 2's `topCivicPolls`, so the NIT 2 fix didn't touch it.
- **Scope:** None direct — confirm route is "latest by `published_at`," resolve by catch-up pull (PD-09).
- **Related entries:** PD-2026-06-11-09
- **Audit obligations:** After catch-up pull, card shows a genuinely recent poll.
- **Notes:** Verify the route isn't pinned to a fixed poll while in there.

#### PD-2026-06-11-07 — `.env` not materializing at `~/Desktop/napaserve/.env`
- **Status:** CLOSED
- **Resolution 2026-06-12:** .env present 4409 B this session, no recurrence; recurrence risk folded into PD-08.
- **Surfaced:** 2026-06-11
- **Affected surfaces:** `~/Desktop/napaserve/.env` (gitignored secrets)
- **Symptom:** `source .env` → "no such file or directory" (not permission-denied).
- **Root cause:** Likely iCloud eviction under the managed Desktop (see PD-08); not confirmed gone.
- **Scope:** Diagnostic — `ls -la`; if dataless, open in Finder to force download; if truly gone, recreate from pointer maps (pointers only → re-gather values).
- **Related entries:** PD-2026-06-11-08, PD-2026-06-11-09
- **Audit obligations:** `source .env` succeeds; SUBSTACK_SID + Supabase keys present.
- **Notes:** Must resolve before the SID refresh — the SID lives in this file.

#### PD-2026-06-11-08 — Repo under iCloud-managed `~/Desktop` → recurring TCC/fd cascade
- **Status:** OPEN (deliberate migration, deferred)
- **Surfaced:** 2026-06-11 (3rd occurrence: May 4, May 10, Jun 11)
- **Affected surfaces:** Project root `~/Desktop/napaserve`; documented paths; `.env` sourcing; session-start command
- **Symptom:** Recurring mid-session EPERM on reads + Claude Code 256-fd launch failure + `.env` eviction.
- **Root cause:** Repo under `~/Desktop`, which iCloud manages when Desktop & Documents sync is on → TCC churn + file eviction.
- **Scope:** Relocate repo to a non-synced path (e.g. `~/dev/napaserve`); update brief paths, `.env` sourcing, CLAUDE.md staging cmds, session-start. Deliberate.
- **Related entries:** PD-2026-06-11-07
- **Audit obligations:** Post-move full session, no EPERM; `.env` sources cleanly.
- **Notes:** Durable fix for a 3×-paid tax. Per-session workarounds (ulimit, FDA re-grant) stay in the cheatsheet meanwhile.

#### PD-2026-06-11-09 — Substack→Supabase data currency + weekly automation (Track B)
- **Status:** #1–3 SHIPPED; #4 OPEN (re-scoped, see PD-2026-06-12-02)
- **Resolution 2026-06-12:** SID refreshed (exp 2026-09-10), pipeline audited (corpus frozen at Mar-11 export; no June API break), 170 backfilled + classified + embedded; nvf_polls 1899.
- **Surfaced:** 2026-06-11
- **Affected surfaces:** SUBSTACK_SID (`.env`); `pipeline/poll_extraction.py` + posts seeder + classify/embed; `nvf_polls`/`nvf_posts`; new GitHub Actions workflow; downstream PD-2026-06-11-01 heartbeat
- **Symptom:** Pull is manual + overdue since ~April; public surfaces show stale "latest" data; no automation.
- **Root cause:** Manual/monthly pull lapsed; SUBSTACK_SID (session cookie) near expiry; possible June Substack API change, unverified.
- **Scope:** Sequenced — (1) refresh SUBSTACK_SID before Jun 13 [blocked on PD-07]; (2) audit pipeline live (works post-June-change? last-run dates?); (3) catch-up pull to current; (4) GitHub Actions weekly cron + run-heartbeat (PD-01) + expiry-detect/Slack alert.
- **Related entries:** PD-2026-06-11-01, -06, -07; master-brief "Substack pipeline audit"; PD-2026-05-30-06
- **Audit obligations:** Fresh SID authenticates (dry-run, no 401); catch-up pull round-trips expected counts; Reader Sentiment + Pulse reflect current polls; cron runs and writes heartbeat.
- **Notes:** Honest constraint — SID is a session cookie that expires; full hands-off is bounded by re-auth cadence (hence expiry-detect). The dry-run is also the empirical test for the "June API change."

#### PD-2026-06-11-10 — NIT 1 admin archived-row mobile stack (verify pending)
- **Status:** SHIPPED-NEEDS-VERIFY (commit d3b0712, live in index-CYLJdkB-.js)
- **Surfaced:** 2026-06-11
- **Symptom/fix:** Archived-row title one-word-stacked on mobile; fixed via `.archived-row` class + `@media` column-stack.
- **Audit obligations:** Tim eyeballs the admin archived list at <600px (gated surface — no Chrome MCP); titles stack title-above-date.

---

## 2026-06-12 Roll-Forward Entries

#### PD-2026-06-12-01 — PostgREST 1000-row cap on un-paginated reads
- **Status:** OPEN (one instance fixed; audit remaining)
- **Surfaced:** 2026-06-12
- **Affected surfaces:** `poll_extraction.py` `supabase_existing_poll_ids()` [FIXED a390797]; `classify_polls.py` `fetch_unclassified()` [latent]; dashboard Community Sentiment count [cosmetic: "1,000" vs 1899]
- **Symptom:** PostgREST silently caps un-paginated `select` at 1000; `--skip-existing` re-fetched everything past the first 1000 once nvf_polls exceeded 1000.
- **Scope:** Audit all existing-ID / dedup / count reads; paginate each.
- **Related entries:** PD-2026-06-11-09

#### PD-2026-06-12-02 — Substack posts-ingestion has no live refresh
- **Status:** OPEN (re-scopes PD-2026-06-11-09 #3/#4)
- **Surfaced:** 2026-06-12
- **Affected surfaces:** `poll_extraction.py` POSTS_DIR/POSTS_CSV (now env-overridable via SUBSTACK_POSTS_DIR/CSV); manual Substack data export
- **Symptom:** Depends on a manual dated export; each catch-up needs a fresh export dropped + repointed. No hands-off path.
- **Scope:** Decide ingestion path — keep manual export, or build Substack API enumeration (true automation = API enumeration, not dumps).
- **Related entries:** PD-2026-06-11-09, PD-2026-06-11-01

#### PD-2026-06-12-03 — Hollow-row leak (null/empty-question polls)
- **Status:** CLOSED 2026-06-12
- **Surfaced:** 2026-06-12
- **Affected surfaces:** `poll_extraction.py` `parse_poll_response()`; `nvf_polls`
- **Symptom:** id-only poll embeds (null/empty question, 0 votes) upserted as hollow rows; polluted published_at-desc ordering and fed null text to embedding.
- **Resolution:** FIXED a7155f2 (parse skips null/empty question) + 9 existing rows cleaned (6 legacy March, 3 this run). Logged closed.

---

## 2026-06-30 Roll-Forward Entries

#### PD-2026-06-30-01 — Studio Mac has no node/npm build toolchain
- **Status:** OPEN
- **Surfaced:** 2026-06-30
- **Affected surfaces:** Build env; `economic-pulse-app` (Vite); Studio session-start
- **Symptom:** `node`/`npm` absent on Tim's Mac Studio (this session's machine) — no local `npm run build`, no local bundle-hash verification. Builds/deploys must run on the Air or via Vercel CI on push.
- **Root cause:** Toolchain installed only on the Air; two-machine split.
- **Scope:** Install Node on the Studio, OR standardize one build machine, OR (preferred) relocate repo off iCloud Desktop to one non-synced dev path.
- **Related entries:** PD-2026-06-11-08, PD-2026-06-30-02
- **Notes:** Deploy verification this session used the Vercel API by commit SHA (no local build). Not blocking (CI builds), but removes local build/verify on the Studio.

#### PD-2026-06-30-02 — Two-machine iCloud sync friction (Studio ↔ Air)
- **Status:** OPEN
- **Surfaced:** 2026-06-30
- **Affected surfaces:** `~/Desktop/napaserve` on both machines; docs/ canon; `.env`
- **Symptom:** Working across Studio and Air via iCloud-synced Desktop cost real time (which machine has the toolchain, which tree is current).
- **Root cause:** Repo + docs under iCloud-managed Desktop shared across two machines; "which tree is current" is manual (git HEAD is canonical, iCloud copies can lag).
- **Scope:** Consolidate to one machine, or relocate repo to a non-synced path and sync via git pull, not iCloud file-sync.
- **Related entries:** PD-2026-06-11-08, PD-2026-06-30-01

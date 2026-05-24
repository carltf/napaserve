# NapaServe — Pulse Tracker Plan

System design and build sequence for ongoing data tracking and quarterly stub article generation. Bridges what NapaServe does (live dashboards, interactive calculators) with what Napa Valley Features regularly publishes (data-driven economic analysis).

Maintained as markdown-canonical per ADR-001 (2026-05-24). Stable content lifted from V4 (May 18, 2026); status reflects 2026-05-24 state.

---

## Status (as of 2026-05-24)

- **Phase 0 (architecture decisions):** COMPLETE — locked May 10 V2 plan
- **Phase 1 (Supabase table + 85-row backfill):** NOT STARTED — primary backlog (PD-2026-05-24-13)
- **Phase 2 (Worker endpoint + Python seeder):** NOT STARTED — PD-2026-05-24-14
- **Phase 3 (frontend Pulse Tracker card):** NOT STARTED — PD-2026-05-24-15
- **Phase 4 (reusable calculator component):** NOT STARTED
- **Phase 5 (quarterly stub article generator):** NOT STARTED
- **Phase 6 (PDF parser):** NOT STARTED (optional, 6-12 months out)

The Pulse Tracker has been "primary next-session task" repeatedly since April 28, 2026, and consistently deferred for higher-urgency work. Tracked in Platform Debt Ledger.

---

## The Problem This Solves

Every Under the Hood article that touches lodging data — and there will be more — currently requires manually keying numbers from STR PDFs into the article JSX. Slow, error-prone, and creates a fundamental architectural problem: data lives in 60+ separate PDFs in iCloud, not in any queryable system. When STR revises a number (which happens regularly), prior articles silently go stale.

April 28 was the third time numbers were manually extracted from the same set of PDFs. The "87 cents and counting" article needed 2019, 2023, 2024, 2025 full-year demand and ADR. The earlier napa-gdp-2024 article needed adjacent figures. The marketing-machine article touched several of the same series. The population article touched Calistoga TOT data the same way.

---

## Purpose

The Pulse Tracker is a recurring data system that:
- Captures Napa County's monthly economic and operational metrics into a structured Supabase table
- Exposes them via Cloudflare Worker API
- Renders them on NapaServe dashboard as a live card
- Makes them available to a reusable calculator component for embedding in UTH articles
- Feeds a quarterly stub article generator that produces draft narrative analysis when data crosses meaningful thresholds

Reduces time-to-publish for recurring quarterly indicators.

---

## Phase 1 — Database Foundation (1 session)

### Schema (v1 lodging-specific design from April 28)

```sql
CREATE TABLE napa_lodging_monthly (
  id            BIGSERIAL PRIMARY KEY,
  month_date    DATE NOT NULL,
  geography     TEXT NOT NULL DEFAULT 'Napa County',
  occupancy     NUMERIC(5,2),
  adr           NUMERIC(8,2),
  revpar        NUMERIC(8,2),
  revenue       NUMERIC(14,2),
  supply        INTEGER,
  demand        INTEGER,
  source_report TEXT NOT NULL,
  added_at      TIMESTAMPTZ DEFAULT NOW(),
  notes         TEXT,
  UNIQUE (month_date, geography, source_report)
);

CREATE INDEX idx_nlm_month_geo ON napa_lodging_monthly(month_date, geography);
CREATE INDEX idx_nlm_geo_date  ON napa_lodging_monthly(geography, month_date);
```

### Alternative Generic Schema (May 4 design)

Generic indicator-based schema if table should scale beyond lodging from day one:

- `month_date` (DATE, primary key component)
- `indicator_id` (TEXT, e.g. `str_occupancy_napa`, `tot_napa_city`)
- `value` (NUMERIC)
- `source` (TEXT)
- `source_url` (TEXT, optional)
- `captured_at` (TIMESTAMP)
- `notes` (TEXT, optional)

**Decision pending at Phase 1 build kickoff:** lodging-specific (April 28) or generic (May 4). Lodging-specific is faster; generic is more durable. Tim decides at session kickoff.

### Source Report Audit Trail
STR revises monthly. The same December 2024 YTD demand figure was 1,209,374 in the December 2024 STR PDF and 1,222,426 in the December 2025 STR PDF (upward revision of 13,052 rooms). Both should be in the table, with `source_report` distinguishing them.

### Backfill
85 rows total: 12 months × 7 years (2019–2025) × 1 geography. Plus 3 Q1 cumulative rows (Q1 2019 / Q1 2025 / Q1 2026).

---

## Phase 2 — Python Seeder + Historical Backfill (1 session)

Build the seeder that reads from CSV/manual entry/source-API and writes to the table. Pattern follows `seed_article_polls.py`.

### Build Steps
1. Create `pipeline/seed_pulse_tracker.py` modeled on `seed_article_polls.py` pattern
2. Use `requests.get/post` with `params={...}` for PostgREST calls (never f-string ISO timestamps with +00:00)
3. Implement `--dry-run` flag
4. Implement live seed mode that requires `SUPABASE_KEY` from `.env`
5. Implement `--backfill` flag that loads historical data from CSV
6. Verify backfill is correct against existing article numbers (the 1,253,064 figure must round-trip)
7. Verify count via SELECT COUNT(*) GROUP BY

---

## Phase 3 — Worker Endpoint (1 session)

Cloudflare Worker route `/api/pulse-tracker` returns indicator series as JSON. Manual deploy via Cloudflare dashboard. Pattern mirrors `/api/article-polls`.

---

## Phase 4 — Dashboard Card (1 session)

New card on NapaServe dashboard rendering most recent month's key indicators with trend arrow vs prior month and prior year. Theme 02 Cream styling. Inline styles only.

### V4+ Patterns That Apply

If Phase 4 card includes PNG export of any Pulse Tracker chart:

**Lesson T applies:** Off-screen clone at fixed width is canonical for any html2canvas-based PNG download. Mount clone in `position: fixed; left: -10000px` wrapper at fixed width, apply clone-time styling via scoped `<style>`, run html2canvas on clone, composite title bar onto captured canvas, remove clone in finally block.

**Lesson Y applies:** Do NOT wrap clone in padded wrapper. html2canvas captures asymmetrically when clone sits inside wrapper with CSS padding.

**Three-store discipline for chart titles:** on-page h2 + caption + PNG download title — all three must agree.

**Mobile-scroll wrapper required** for any hand-drawn canvas chart: `overflowX:auto` + `minWidth`.

**Theme 02 Cream palette** throughout.

**Per-chart h2 title required** above any chart's mobile-scroll wrapper (Lesson N): Libre Baskerville 22px bold #2C1810, marginTop 0, marginBottom 16.

**Lesson CC applies:** If Phase 4 card displays data also shown elsewhere on the platform, extract a shared React hook as single fetch implementation. This card will be the **third consumer of tracker-data-fetch patterns** (Snapshot Tab and Calculators page are #1 and #2 via `useTrackerEvents`). At three consumers, generic `useWorkerData` abstraction may become defensible.

---

## Phase 5 — Reusable Calculator Component (1 session)

Generalized version of the dashboard card that can be embedded in UTH articles for any indicator series.

---

## Phase 6 — Quarterly Stub Article Generator (1 session)

When data crosses meaningful thresholds, generator produces draft narrative analysis. Output goes to local `pipeline/stub_articles/` directory that Tim reviews; never auto-pushes to GitHub or Substack.

Phase 6 is highest-payoff phase but also highest-risk for editorial drift. Dedicated session recommended.

### Editorial Standards (apply to stub article generator)
- Use `%` symbol always — never spell out "percent"
- No Oxford commas anywhere
- AP Title Case on all stub article headings
- "Napa Valley Features" — never "Focus"
- "community intelligence" — never "civic"
- Don't-words: curate, tapestry, special, unique, discover, explore, nestled, vibrant

Stub generator output is starting point only — Tim writes final prose.

---

## Phase 7 — PDF Parser (2 sessions, optional)

Automated extraction of STR PDF data. Worth doing only if/when manual keying becomes the bottleneck. Probably 6–12 months out.

---

## Cost Summary

- Phase 1 (table + backfill): 1 session
- Phase 2 (seeder): 1 session
- Phase 3 (worker): 1 session
- Phase 4 (dashboard): 1 session
- Phase 5 (calculator tracker): 1 session
- Phase 6 (quarterly stub): 1 session
- Phase 7 (PDF parser): 2 sessions, optional

**Minimum viable:** Phases 1–4 = 4 sessions for live data on the dashboard.
**Full editorial value:** Phases 1–6 = 6 sessions.
**Full automation:** Phases 1–7 = 8 sessions.

---

## Recommended Sequencing

Build Phase 1 + Phase 2 in one continuous session — tightly coupled, table needs seeder to be useful. Verify backfill correctness against existing article numbers.

If Phase 1+2 prove valuable, do Phase 3+4 in a second session for the dashboard surface. Phase 5 follows naturally from Phase 4. Phase 6 can wait until at least one full quarter passes after Phase 4 ships.

---

## Phases 1 + 2 — Pre-build Verification Gates

- Confirm Supabase table `napa_lodging_monthly` does not already exist
- Confirm `pipeline/` directory has standard structure (`seed_article_polls.py` is the model)
- Confirm `SUPABASE_KEY` format aligns with current rotation
- Identify initial indicator set
- Decide schema: lodging-specific (April 28) or generic (May 4)

---

## Initial Indicator Set (working list)

- STR Napa lodging occupancy (monthly)
- STR Napa lodging ADR (monthly)
- STR Napa lodging RevPAR (monthly)
- City of Napa TOT receipts (monthly)
- Yountville TOT receipts (monthly)
- Calistoga TOT receipts (monthly)
- St. Helena TOT receipts (monthly)
- BLS Napa MSA leisure and hospitality employment (monthly)
- BLS Napa MSA total nonfarm employment (monthly)
- Napa County unemployment rate (monthly via EDD)
- Napa Type 02 winery licenses (weekly via ABC)

---

## Future Pulse Domains (post-lodging)

Same architecture could be replicated for:
- Grape crush prices (CDFA annually)
- Population (CA DOF E-1 annual)
- Hospitality employment (BLS QCEW quarterly)
- Wine sales (Nielsen-style, if licensable)

Each new domain = own table + seeder + dashboard card. Pulse Tracker becomes editorial system's spine — every UTH article pulls from these tables instead of hardcoding numbers.

---

## Integration Points

- Worker endpoint `/api/pulse-tracker` reads from `napa_lodging_monthly`; mirrors `/api/article-polls`
- Dashboard card sits alongside 12 FRED macro indicator cards
- Reusable calculator component imports from same chart utility patterns as ChartOne/ChartTwo/ChartThree
- Stub article generator outputs to new local `/pipeline/stub_articles/` directory
- **Tracker data consumer:** Phase 4 dashboard card will use `useTrackerEvents` hook (or sibling for `pulse-tracker` route)

---

## Architectural Patterns from Snapshot v1.1 (May 5) and Tracker SSOT (May 24)

**Flat-primitive prop contract:** Parent computes all derived values, passes flat primitives to thin presentational component.

**Single source of truth helper file:** `stoplights.js` owns threshold rules and color hex map. `useTrackerEvents.js` (May 24) extends this pattern to data-fetch.

---

## Operational Notes

- Phases 3–7 are sequential dependencies on Phases 1–2. No parallelization.
- Phase 6 is highest-payoff but highest-risk for editorial drift; dedicated session recommended.
- All Pulse Tracker code follows the single-prompt protocol.
- Worker.js for `/api/pulse-tracker` deploys MANUALLY via Cloudflare dashboard.

---

## Cross-References

- `napaserve-platform-debt-ledger.md` — PD-2026-05-24-13, -14, -15 track Phases 1+2, 3, 4 as debt items
- `napaserve-cheatsheet.md` — Snapshot PNG geometry, Lesson T, Y, CC, Theme 02 Cream
- `napaserve-uth-protocol.md` — single-prompt protocol applies to Pulse Tracker builds
- `napaserve-master-brief.md` — current platform state, 12 FRED indicators

# event_instances Audit — 2026-05-25

Triggered by: Event Intake Assistant session discovered an undocumented
`event_instances` sidecar row (community_event_id=1219) that blocked a
DELETE of a duplicate `community_events` row via FK constraint.

---

## 1. Where event_instances Is Referenced (file:line list)

| File | Line(s) | Usage |
|------|---------|-------|
| `pipeline/04_seed_events.py` | 200 | Docstring: "Upsert recurring events into event_series + event_instances." |
| `pipeline/04_seed_events.py` | 252 | Builds `instance_row` dict with `community_event_id`, `event_series_id`, `year`, `lat`, `lng`, `source_type`, `source_confidence`, `verification_status` |
| `pipeline/04_seed_events.py` | 260 | **WRITE:** `sb.post("/rest/v1/event_instances", json=instance_row)` |
| `pipeline/04_seed_events.py` | 300 | Calls `upsert_event_series()` from `seed_from_sheet()` path |
| `pipeline/04_seed_events.py` | 368 | Calls `upsert_event_series()` from `seed_from_napalife()` path |
| `pipeline/04_seed_events.py` | 435 | Calls `upsert_event_series()` from `seed_from_weekender()` path |

### Files that do NOT reference event_instances (verified zero matches)

- `api/` — no serverless functions touch it
- `economic-pulse-app/src/worker.js` — Cloudflare Worker, zero references
- `economic-pulse-app/src/*.jsx` — no frontend component reads or writes it
- `SQL/` — no migration or setup file creates or references the table
- `CLAUDE.md`, `APIS.md`, `MASTER_SHEET.md` — not documented anywhere
- All other `pipeline/*.py` scripts — only `04_seed_events.py`

**Summary: `event_instances` is write-only from a single code path. Nothing reads it.**

---

## 2. What the Table Appears to Be For (inferred from code)

`event_instances` is a **bridge/sidecar table linking a specific `community_events` row
(one year's occurrence) to a canonical `event_series` row (the recurring event identity).**

The design intent (inferred from `upsert_event_series()` at line 199-260):

1. When a seed-ingested event has `is_recurring=true`, the pipeline creates/upserts an
   `event_series` row (keyed on slug) to represent the recurring identity.
2. It then creates an `event_instances` row linking the specific `community_events.id`
   to the `event_series.id`, tagged with `year`, geo coords, and provenance metadata
   (`source_type='seed'`, `source_confidence=0.9`, `verification_status='normalized'`).

The apparent long-term vision was **occurrence tracking for recurring events** — e.g.,
"Napa Valley Film Festival" as a series, with each year's instance linked back to the
specific `community_events` row. In practice, the distribution shows every
`community_event_id` has count=1, making this a 1:1 relationship, not a one-to-many
expansion. The table was seeded once (2026-03-26) and never read by any application code.

The `include_in_email` and `email_digest_id` columns on `event_instances` suggest a
planned-but-unimplemented feature where digest curation would happen at the instance
level rather than directly on `community_events` (which has its own `include_in_email`
column). This was never wired up — the live email digest system reads `include_in_email`
from `community_events` directly.

---

## 3. What event_series Is (schema + apparent purpose)

### Schema (inferred from `upsert_event_series()` at line 211-228)

No SQL migration file exists. The table was created directly in Supabase. Schema
inferred from the Python code that writes to it:

| Column | Type (inferred) | Notes |
|--------|-----------------|-------|
| `id` | uuid | PK; auto-generated; returned in upsert response |
| `canonical_name` | text | Human-readable series name |
| `slug` | text | URL-safe slug; upsert conflict target |
| `event_type` | text | Maps to category (art, music, food, etc.) |
| `organizer_name` | text | |
| `primary_website` | text | |
| `description_short` | text | |
| `city` | text | |
| `typical_venue_name` | text | |
| `typical_venue_address` | text | |
| `lat` | numeric | |
| `lng` | numeric | |
| `recurrence_pattern_text` | text | e.g. "annual in May" |
| `confidence_score` | numeric | 0.0-1.0 |
| `status` | text | Saw: 'active' |
| `first_seen_date` | date | |
| `last_seen_date` | date | |
| `created_at` | timestamptz | Presumed auto-default |
| `updated_at` | timestamptz | Presumed auto-default |

### Apparent purpose

`event_series` is a **canonical identity table for recurring events.** It holds the
stable metadata (name, venue, organizer, recurrence pattern) that persists across
yearly occurrences. The slug is the upsert conflict key (line 235-238, using
`Prefer: resolution=merge-duplicates`), so re-running the seed for the same event
updates the existing series row rather than creating duplicates.

### References in codebase

Only `pipeline/04_seed_events.py` (lines 199, 200, 231, 236, 241, 252). Zero
references in API, worker, frontend, SQL files, or documentation — same isolation
as `event_instances`.

---

## 4. Origin: How and When the Sidecar Rows Were Created

### Commit

`4cb219d` — "Three-tier search: unified results, dedup fix, time parsing, price merge"
- **Date:** 2026-03-26 14:08:05 -0700
- **Author:** Tim Carl + Claude Opus 4.6
- **Files:** `pipeline/04_seed_events.py` (created, 486 lines), `pipeline/05_seed_astronomy.py` (created), `napaserve-event-finder.jsx` (272 lines added)

This is the only commit that has ever touched `04_seed_events.py`. The file was created
whole and has never been modified.

### Execution timing

The sample `event_instances` row has `created_at=2026-03-26 18:23 UTC`, which is
4 hours after the commit timestamp (14:08 PDT = 21:08 UTC). The script was likely run
shortly after being committed — the 18:23 UTC timestamp is consistent with running it
around 11:23 AM PDT on March 26.

### No other commits in the March 20-30 window touch event_instances or event_series.

The git log for that window shows 66 commits, but none reference event_instances,
event_series, seed pipelines, or normalization beyond the single `4cb219d` commit.

---

## 5. Downstream Effects of Deleting an event_instances Row

### Direct FK enforcement (the blocking issue)

`event_instances.community_event_id` has a FK to `community_events.id`. Attempting to
DELETE a `community_events` row that has a referencing `event_instances` row will fail
with a FK violation. This is what blocked the DELETE of community_events.id=1219.

### Application-level consumers: NONE

Exhaustive search confirms:
- **No API endpoint** reads from `event_instances`
- **No frontend component** queries `event_instances`
- **No worker** references `event_instances`
- **No other pipeline script** reads from `event_instances`
- **No JOIN** on `event_series_id`, `source_type`, or `verification_status` exists anywhere in the codebase
- The `include_in_email` and `email_digest_id` columns on `event_instances` are unused — the email digest system reads `include_in_email` from `community_events` directly

### Cascade to event_series

Deleting an `event_instances` row does NOT automatically delete the parent `event_series`
row (no ON DELETE CASCADE from series to instances in that direction). The `event_series`
row is an independent identity record. Whether it should be cleaned up depends on whether
other instances reference the same series — but given the 1:1 distribution, orphaning
the series row is cosmetically untidy but functionally harmless.

### Verdict: deleting an event_instances row has zero downstream application effects.

---

## 6. Safe Deletion Procedure

To delete a duplicate `community_events` row (e.g. id=1219) that has an
`event_instances` sidecar:

```sql
-- Step 1: Verify the sidecar exists and note its event_series_id
SELECT id, community_event_id, event_series_id
FROM event_instances
WHERE community_event_id = 1219;

-- Step 2: Delete the event_instances row first (removes FK block)
DELETE FROM event_instances
WHERE community_event_id = 1219;

-- Step 3: Now delete the community_events duplicate
DELETE FROM community_events
WHERE id = 1219;

-- Step 4 (optional): Check if the event_series row is now orphaned
-- If no other event_instances reference it, it can be cleaned up
SELECT es.id, es.canonical_name,
       COUNT(ei.id) AS remaining_instances
FROM event_series es
LEFT JOIN event_instances ei ON ei.event_series_id = es.id
WHERE es.id = '<event_series_id from Step 1>'
GROUP BY es.id, es.canonical_name;

-- If remaining_instances = 0 and you want to clean up:
-- DELETE FROM event_series WHERE id = '<event_series_id>';
```

This procedure is safe because nothing in the application reads from either
`event_instances` or `event_series`.

---

## 7. Open Questions for the Main NapaServe Project Thread

1. **Should `event_instances` and `event_series` be dropped entirely?**
   Neither table is read by any application code. They are write-only artifacts of the
   seed pipeline. The recurring-event identity tracking they were designed for was never
   wired into the search UI, email digests, or any API. Dropping them would eliminate
   the FK constraint surprise and remove dead schema surface area. If kept, the tables
   should be documented in CLAUDE.md (currently zero documentation).

2. **Should the `upsert_event_series()` function in `04_seed_events.py` be removed?**
   If the tables are dropped, the function (lines 199-260) and its three call sites
   (lines 300, 368, 435) should be removed from the seed script. If kept, the function
   should at minimum handle the POST response on line 260 (currently fire-and-forget
   with no error checking).

3. **What about the `include_in_email` / `email_digest_id` columns on `event_instances`?**
   These suggest an unimplemented plan to do digest curation at the instance level.
   The live digest system uses `community_events.include_in_email` directly. If the
   tables are kept, these columns are vestigial. If dropped, moot.

4. **Are there more `event_instances` rows blocking other duplicate cleanup?**
   The discovery was on id=1219. A full audit query would reveal the scope:
   ```sql
   SELECT ce.id, ce.title, ce.event_date, ei.id AS instance_id
   FROM community_events ce
   JOIN event_instances ei ON ei.community_event_id = ce.id
   ORDER BY ce.id;
   ```

5. **Were these tables created via Supabase Studio or a migration not tracked in git?**
   No SQL file in `SQL/` creates either table. The schema was likely created manually
   in Supabase Studio or via an ad-hoc SQL editor session on 2026-03-26. This means
   there is no version-controlled DDL for either table — a gap in schema documentation.

6. **Should `04_seed_events.py` add ON DELETE CASCADE to the FK?**
   If the tables are kept, adding `ON DELETE CASCADE` to `event_instances.community_event_id`
   would prevent future FK surprises when deleting `community_events` rows. This is a
   one-line ALTER:
   ```sql
   ALTER TABLE event_instances
     DROP CONSTRAINT event_instances_community_event_id_fkey,
     ADD CONSTRAINT event_instances_community_event_id_fkey
       FOREIGN KEY (community_event_id) REFERENCES community_events(id)
       ON DELETE CASCADE;
   ```

---

*Audit performed 2026-05-25. No code changes made. No SQL executed.*

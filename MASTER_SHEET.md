# NapaServe MASTER SHEET

**Last reconciled:** 2026-04-30
**Reconciled sections:** §1, §2, §3, §4, §5.1, §6.1, §6.8, §10, §11, §13
**Inherited (unverified) sections:** §5.2, §5.3, §5.4, §6.2–§6.7, §7, §8, §9, §12

This is the master architectural reference for the NapaServe codebase. It complements `CLAUDE.md` (which holds dated patches and conventions) and `APIS.md` (env var registry). When this document and CLAUDE.md disagree, CLAUDE.md wins for any section dated more recently than this sheet's "last reconciled" stamp.

This sheet is shared across both Claude projects that work on this codebase: the main NapaServe project and the NapaServe Event Intake Assistant project. Project-specific context lives in each project's cheatsheet and Project Knowledge, not here.

---

## §1. Project Identity

- **Name:** NapaServe
- **Domain:** napaserve.org (primary)
- **Publication identity:** NapaServe / Valley Works Collaborative
- **Audience anchor:** Napa Valley + adjacent. For events: "If a Napa Valley resident would plausibly want this in their feed, it qualifies." (Adopted 2026-04-30 as part of the virtual events convention; see §6.8.)
- **Sister surfaces:** Napa Valley Features (Substack, `napavalleyfocus.substack.com`)
- **Maintainer:** Tim Carl

---

## §2. Repo Layout — `~/Desktop/napaserve/`

| Path | Contents |
|---|---|
| `economic-pulse-app/` | Vite + React 19 + react-router-dom 7 SPA. All `/events`, `/under-the-hood/*`, `/admin` routes. |
| `api/` | Vercel serverless functions (`event-intake.js`, `claude.js`, `digest-*.js`, `evaluate.js`, `community-data*.js`) |
| `pipeline/` | Python seeders + extractors (`04_seed_events.py`, `seed_article_polls.py`, `weekly_snapshot.py`, etc.) |
| `SQL/` | Canonical setup scripts. **NOTE:** `community_events_setup.sql` is stale as of 2026-04-30 — see §10. |
| `supabase/` | Local config + edge functions |
| `agent.html`, `embed-events.html` | Standalone files copied into `dist/` at build (see `vercel.json`) |
| `CLAUDE.md`, `APIS.md`, `MASTER_SHEET.md` | Top-level reference docs |
| `Images/` | Working images staging area for article illustrations |

---

## §3. Deploy Targets

- **Vercel** — root `vercel.json`, output `economic-pulse-app/dist`, build copies `agent.html` + `embed-events.html` into `dist/`. Auto-deploys on push to `main`.
- **Cloudflare Worker** — `misty-bush-fc93.tfcarl.workers.dev`. **Manual deploy only** — never auto-deployed. Routes worker-rewritten endpoints (e.g., `/api/unsubscribe`).
- **Supabase project** — `csenpchwxxepdvjebsrt.supabase.co`. Referenced as constant + env var across the codebase.
- **External event scraper** — `napa-event-finder.vercel.app` (Tier 3 of three-tier event search).

---

## §4. Environment Variables

Authoritative registry: `~/Desktop/napaserve/APIS.md`. Retrieval URLs and rotation log: `~/Documents/ValleyWorks/MASTER_KEYS_REFERENCE.md`. Actual values: `~/Desktop/napaserve/.env` (gitignored).

| Variable | Read in | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | `api/event-intake.js`, pipeline | Claude extraction & seeders |
| `SUPABASE_URL` | `api/`, pipeline | DB endpoint |
| `SUPABASE_KEY` | `api/event-intake.js` (insert), pipeline | service-role write (`sb_secret_...`) |
| `SUPABASE_ANON_KEY` | hardcoded in `napaserve-event-finder.jsx:12` | public read (`sb_publishable_...`) |

**Note on hardcoded SUPABASE_ANON_KEY:** Intentional per Supabase publishable-key design. Any rotation must update both the env var and the hardcoded constant.

---

## §5. Database Schema Reference

### §5.1 `community_events` *(VERIFIED 2026-04-30)*

**Canonical reference:** `CLAUDE.md` § "April 30, 2026 — `community_events` Schema Reference (VERIFIED)" (commits `186178f` and `7a3587f`). This sheet does not duplicate the full inventory — single source of truth lives in CLAUDE.md.

**Critical points:**

- **36 columns**, including 8 not in `SQL/community_events_setup.sql` (which is stale).
- **Zero CHECK constraints.** All whitelists (`town`, `category`, `status`, `age_restriction`, `indoor_outdoor`) are application-enforced only via `api/event-intake.js:24–66` and frontend constants. Hand-written SQL with off-whitelist values succeeds silently.
- **`is_virtual`** added 2026-04-30, NOT NULL DEFAULT false, all pre-existing rows backfilled automatically.
- **`start_time` / `end_time`** are TEXT, format strictly `"H:MM AM/PM"`. SQL TIME literals like `'11:00:00'` bypass the `fmtTimeAP` regex at `napaserve-event-finder.jsx:57` and render as raw text on cards. (Surfaced 2026-04-30 by Smoke Summit insert id 1764, patched same day.)
- **`status`** whitelist is `pending | approved`. The setup file lists `rejected` but `worker.js:1230–1243` DELETEs rejected rows rather than patching status — `rejected` is never written.
- **Index duplication:** `idx_ce_date / town / category` have parallel `community_events_*_idx` versions. Wasted write overhead, low-priority cleanup (§10).

### §5.2 `napaserve_articles` *(inherited, not re-verified 2026-04-30)*

- Primary key: `slug`
- Required NOT NULL on INSERT: `title`, `deck`, `headline`, `slug`, `publication`, `topic_seed`
- Drives Under the Hood index, Word export, Related Coverage cards.

### §5.3 `napaserve_article_polls` *(inherited)*

- Foreign key: `article_slug` (NOT `slug`)
- Pipeline: `pipeline/seed_article_polls.py`
- Next available poll ID: 36 (33–35 used for `napa-lodging-pricing-2026`)

### §5.4 Other tables *(inherited, schemas in `SQL/`)*

- `nvf_polls`, `nvf_poll_search` — Substack poll mirroring + embedding
- `astronomical_events` — queried in event finder
- `email_digests` — weekly digest tracking

---

## §6. Conventions & Locked Rules

Most conventions live in `CLAUDE.md` with dates. Pointers below; do not duplicate authoritative text.

### §6.1 Style *(LOCKED — CLAUDE.md April 22)*
- `%` symbol (never "percent"); "percentage points" stays unchanged
- No Oxford commas
- Em-dashes, curly quotes, `$` (no `US$`)
- "Napa Valley Features" — never "Napa Valley Focus" or "News Group"
- "community intelligence" — never "civic intelligence"

### §6.2 Verification Discipline *(CLAUDE.md)*
Source-clean + runtime-broken → inspect rendered DOM via Claude in Chrome before guessing at encoding fixes. Pre-execution checklist: assumptions → verification → flag-or-verify.

### §6.3 Mobile Responsiveness *(CLAUDE.md)*
Never inline `gridTemplateColumns` — use established CSS classes (`kpi-grid-snapshot` exception for breakpoints).

### §6.4 Chart.js Patterns *(CLAUDE.md)*
Category-axis pattern, download handler discipline, watermark opacity 0.25, never `watermarkPlugin` in chart registrations.

### §6.5 Caption SOP *(CLAUDE.md)*
Filename embedded in caption description. Three-place sync: JSX, EXPORT_DATA, body markers.

### §6.6 Commit Conventions *(CLAUDE.md)*
No `Co-Authored-By` trailers. Scoped imperatives. Explicit file paths.

### §6.7 Legistar URL Hygiene *(CLAUDE.md)*
`?ID=X&GUID=Y&FullText=1`. Never URL-encode `&` as `%26`.

### §6.8 Virtual Events Convention *(LOCKED — 2026-04-30)*

`town` field reflects audience anchor (the Napa Valley town the topic most plausibly serves), not host location. `is_virtual=true` events are excluded from town-filtered queries by default. Users opt in via a "Show virtual events" toggle in the filter row, which surfaces a "Including virtual events" chip when active. Per-card "Virtual" badge displays regardless of toggle state. Boolean approach holds until first hybrid event arrives; at that point add `is_hybrid` and reassess whether to refactor to `event_format` enum.

For virtual event inserts:
- `is_virtual = true`
- `venue_name = 'Virtual ([platform])'` (e.g., `'Virtual (Zoom Webinar)'`)
- `address = null`
- `town = audience anchor`

---

## §7. Key Code Surfaces *(inherited)*

- **Routes (`App.jsx`)** — SPA route table (Hub, Dashboard, Evaluator, EventFinder, News, ValleyWorks, VWLabs, Archive, UTH index + 11 article routes, calculators, digest, about, admin, agent)
- **Event finder (`napaserve-event-finder.jsx`)** — Three-tier search: DB / hint-from-prior-years / scraper. Three render surfaces: Featured carousel, Upcoming carousel, search results. Submit form.
- **Event intake API (`api/event-intake.js`)** — `extract` action (Claude extraction, lines 24–66 are canonical column-format reference) and `insert` action (PostgREST POST).
- **Admin (`napaserve-admin.jsx`)** — `EXPORT_DATA` shape (11 sections incl. `substackPolls`), Word export, article cards, EventIntake.jsx component (admin UI intake).
- **UTH article template** (`under-the-hood-template.jsx`) and registry of live articles
- **Word exporter** (`components/WordExporter.jsx`)
- **UTH index** (`under-the-hood-index.jsx`) — fully dynamic since April 26 (commit `0b24cf0`)

---

## §8. Pipelines (Python — `pipeline/`) *(inherited)*

- `04_seed_events.py` — seeds community events
- `seed_article_polls.py` — poll dicts (next ID = 36)
- `weekly_snapshot.py` — weekly metrics
- `02_seed_grape_crush.py`, `03_seed_str_lodging.py`, `05_seed_astronomy.py`
- `embed_polls.py` — Voyage-3 embedding
- `poll_extraction.py` — monthly Substack poll extraction
- Run requirements: `requirements.txt`; env vars `SUPABASE_URL`, `SUPABASE_KEY`, `ANTHROPIC_API_KEY`

---

## §9. Verification & Diagnostic Discipline *(inherited, CLAUDE.md §0 + Apr 28 patch)*

- Canonical use case: source-clean + runtime-broken → inspect rendered DOM via Claude in Chrome (public surfaces only) before guessing at encoding.
- Pre-execution checklist (before any code edit / SQL / commit): assumptions → verification → flag-or-verify.
- For schema work: `community_events` audit queries documented in CLAUDE.md (column inventory, check constraints, indexes, RLS, source distribution).

---

## §10. Known Gaps Log

Cumulative log. Items get added when surfaced; removed when resolved (with dated resolution note).

- **`community_events` has no DB-level whitelist enforcement.** All whitelists application-only. CHECK constraints deferred pending decision on what to do with off-whitelist rows already present. *(Surfaced 2026-04-30.)*
- **`featured` curation policy pending.** Column exists (default false); no UI / decision process for flagging events. Homepage carousel returns empty. *(Surfaced 2026-04-30.)*
- **Index duplication on `community_events`.** Three pairs of redundant indexes. Low-priority `DROP INDEX` migration. *(Surfaced 2026-04-30.)*
- **`SQL/community_events_setup.sql` is stale.** 8 columns + parallel indexes not in setup file. Either regenerate or supersede with CLAUDE.md as canonical. *(Surfaced 2026-04-30.)*
- **Source naming inconsistency.** "NapaServe" (273 rows) and "napaserve_submission" (4 rows) are two conventions for the same publication. Normalize when possible — pending decision on which value wins. *(Surfaced 2026-04-30.)*
- **No distinct scraper source tag.** Tier-3 scraper rows aren't tagged distinctly. Verify when scraper pipeline gets next-touched. *(Surfaced 2026-04-30.)*
- **Extraction prompt incomplete.** `api/event-intake.js` does not emit `age_restriction` or `indoor_outdoor`. Every admin-UI ingested event silently defaults. Decision pending. *(Surfaced 2026-04-30.)*
- **EXPORT_DATA stale for `napa-constellation-2026`** *(inherited)*
- **Tier-section prose drafts pending (21 paragraphs)** *(inherited)*
- **Insert-flow gap:** `napaserve_articles` skipped `title`+`deck` for `napa-constellation-2026` — root cause TBD *(inherited)*
- **Related Coverage title font too large on UTH** — platform polish *(inherited)*
- **Tracker:** no "Regulatory" category; deferred Treasury × 3 / Hall / Mondavi / 4-group additions *(inherited)*

---

## §11. Open Decisions & Deferred Refactors

- **Q1–Q4 on virtual events** *(LOCKED 2026-04-30; implementation deferred)* — see §6.8 and CLAUDE.md April 30 patch.
- **Implementation queue (post-2026-04-30):**
  - `is_virtual` extraction in `api/event-intake.js` prompt + JSON schema
  - "Virtual" per-card badge in `napaserve-event-finder.jsx` (search results, featured, upcoming surfaces)
  - Filter-row "Including virtual events" chip + opt-in toggle
  - End-to-end test: insert virtual event via admin UI, verify badge + toggle behavior
- **`substackPolls` backfill audit** on existing UTH articles *(inherited)*
- **`napa-population-2025` hold** pending May 1, 2026 DOF E-1 *(inherited)*
- **Pulse Tracker Phase 1+2** *(inherited, next session primary work per Apr 28 patch — main NapaServe project)*

---

## §12. Article Registry *(inherited)*

Pointer to live UTH list + status (LIVE / draft / queued):

- `napa-cab-2025` — polls 1–3
- `sonoma-cab-2025` — polls 4–6
- `lake-county-cab-2025` — polls 7–9
- `napa-gdp-2024` — polls 10–14
- `napa-supply-chain-2026` — polls 15–17
- `napa-population-2025` — polls 18–20
- `napa-structural-reset-2026` — polls 21–23
- `napa-lodging-pricing-2026` — polls 33–35 (DRAFT as of April 29)

**Next available poll ID:** 36

---

## §13. Quick Commands / Cheatsheet

**Build:**
```bash
cd economic-pulse-app && npm run build
```

**DB query (raw REST):**
```bash
source .env
curl -s "$SUPABASE_URL/rest/v1/<table>?<filter>&select=*" \
  -H "apikey: $SUPABASE_KEY" -H "Authorization: Bearer $SUPABASE_KEY"
unset SUPABASE_KEY
```

**Schema audit (community_events) — five queries:**

```sql
-- 1. Column inventory
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'community_events'
ORDER BY ordinal_position;

-- 2. Check constraints
SELECT con.conname, pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public' AND rel.relname = 'community_events'
  AND con.contype = 'c';

-- 3. Indexes
SELECT indexname, indexdef FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'community_events';

-- 4. RLS policies
SELECT polname, polcmd, pg_get_expr(polqual, polrelid) AS using_clause,
       pg_get_expr(polwithcheck, polrelid) AS check_clause
FROM pg_policy WHERE polrelid = 'public.community_events'::regclass;

-- 5. Source distribution
SELECT source, COUNT(*) AS n FROM community_events
GROUP BY source ORDER BY n DESC;
```

**Verify article DB row:**
```sql
SELECT slug, headline, title, deck, publication, topic_seed
FROM napaserve_articles WHERE slug = '...';
```

**Mobile audit:**
```bash
grep -n "gridTemplateColumns" economic-pulse-app/src/under-the-hood-<slug>.jsx
```

**Bundle fingerprint check:**
```bash
curl -s -L "https://napaserve.org/under-the-hood/<slug>" \
  | grep -oE 'index-[A-Za-z0-9]+\.js' | head -1
```

---

## Maintenance

When this sheet is updated:

1. Update the "Last reconciled" stamp at the top.
2. Update the "Reconciled sections" list to reflect what's been verified this pass.
3. If a section was carried forward without re-verification, mark it in "Inherited (unverified) sections."
4. If a section is materially wrong, fix it here AND add a CLAUDE.md patch entry with the date and rationale.
5. This sheet is committed to the repo. Both Claude projects (main NapaServe and Event Intake Assistant) read it from there.

---

*End of MASTER_SHEET.md — last reconciled 2026-04-30 — Valley Works Collaborative*

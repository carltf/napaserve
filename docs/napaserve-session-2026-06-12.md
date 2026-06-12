# NapaServe — Session Record 2026-06-12

## Goal
"Tackle the Substack cookie issue" (PD-09 SID refresh, Jun-13 deadline). Expanded
into the full Track-B data-currency pull: SID refresh → pipeline audit → catch-up
backfill → classify → embed → PD-06 verification. Two code fixes shipped. EOS.

## Shipped & verified
- SUBSTACK_SID refreshed (PD-09 #1). Documented "Jun 13" expiry was optimistic —
  the live cookie showed expired Jun 10. Logout/login minted a new substack.sid,
  expires 2026-09-10 (~90-day session cookie). Validated by dry-run (200 + real
  vote counts, no 401), which also disproved the rumored "June API change."
- PD-07 (.env not materializing) did NOT recur — .env present (4409 B), no
  .icloud stub. Non-issue this session; recurrence risk still lives in PD-08.
- Pipeline audited live (PD-09 #2). Finding: poll_extraction.py reads a FROZEN
  manual Substack export dated Mar 11; no repo script refreshes it. Generated a
  fresh Jun-12 export (1052 posts / 1910 polls vs March 1008 / 1741), materialized
  from iCloud, repointed via new env vars.
- Catch-up backfill (PD-09 #3): --skip-existing fetched 170 new polls.
  nvf_polls 1738 → 1908. Round-trip verified.
- Hollow-row cleanup: 9 null-question / 0-vote rows (6 legacy March, 3 this run)
  verified and deleted by explicit id-list in Supabase SQL Editor. 1908 → 1899.
- Classify: 298 themed (170 new + 128 backlog), 0 errors, 0 left null.
- Embed: 298 embedded → 1899/1899 full voyage-3 coverage.
- PD-06 CLOSED. /api/latest-substack-poll returns poll 548174 (published
  2026-06-12 13:02), themed Community & Culture; rendered Community Sentiment card
  shows Jun 5–6 polls. Frozen syrah-pinot/Wine-Chronicles poll gone.

## Code shipped
- a390797 — poll_extraction: POSTS_DIR/POSTS_CSV env-overridable
  (SUBSTACK_POSTS_DIR/CSV, March path as default) + supabase_existing_poll_ids()
  paginated (fixed silent PostgREST 1000-row cap breaking --skip-existing past
  1000 rows). Single file, no Co-Authored-By.
- a7155f2 — poll_extraction: parse_poll_response skips null/empty-question polls
  (stops hollow rows recurring). Single file.
- .env (gitignored): SUBSTACK_POSTS_DIR/CSV → Jun-12 export; SUBSTACK_SID refreshed.

## Verification (rendered state)
PD-06 confirmed via Claude in Chrome on napaserve.org/dashboard: route returns a
same-day poll, Community Sentiment card current. Data round-trips verified by REST
count at each stage (1738→1908→1899; embeddings 1899).

## New debt surfaced
- PD-2026-06-12-01 — PostgREST 1000-row cap on un-paginated reads. 3 instances:
  supabase_existing_poll_ids() [FIXED a390797], fetch_unclassified() [latent],
  dashboard Community Sentiment count [cosmetic: "1,000" vs 1899]. Audit all reads.
- PD-2026-06-12-02 — Substack posts-ingestion has no live refresh; depends on a
  manual dated export. Now env-overridable but each catch-up needs a fresh export.
  Re-scopes PD-09 #3/#4. True automation = Substack API enumeration, not dumps.
- PD-2026-06-12-03 — hollow-row leak. FIXED a7155f2 + 9 rows cleaned. Logged closed.

## Lessons reinforced (cheatsheet)
- SID check of record = the FUNCTIONAL PROBE (poll_extraction --dry-run --limit 1
  → 200 + real count), not the calendar date (recorded date was 3 days off). Date
  = early-warning only. ~90-day session cookie; value ≠ validity (server-side;
  re-login can renew the same value with a new expiry).
- iCloud ".icloud-placeholder absent" ≠ downloaded — a starting download renames
  stubs to real names before bytes land. Verify with find -size 0 + du + the
  Finder progress circle, not the placeholder grep.
- PostgREST silently caps un-paginated selects at 1000 (extends the URL-encoding
  lesson). Any existing-ID / dedup / count read must paginate.
- Cross-thread: Claude Code can't see Supabase SQL Editor actions — flagged the
  (Tim-initiated) delete as "external" 3×. Reconcile in chat.

## Platform Debt Roll Call (Lesson DD)
1. SCHEDULED shipped? PD-09 #1–3 SHIPPED; #4 OPEN + re-scoped (PD-2026-06-12-02).
2. SHIPPED-NEEDS-VERIFY verified? PD-10 untouched (Tim's phone check pending);
   PD-06 now CLOSED-verified.
3. New debt? PD-2026-06-12-01/02/03.
4. Subsystem-with-existing-debt touched? Substack pipeline (PD-09) — fixes
   committed, PD-06 closed, no regressions.

## Final state
- napaserve.org live. nvf_polls: 1899 rows, all classified + voyage-3 embedded.
- SUBSTACK_SID valid to ~2026-09-10. Pipeline repointed to Jun-12 export.
- Commits: a390797, a7155f2 (code) + this EOS doc set.

## Carry-forward / next session
- Admin Ops Console (PD-2026-06-11-01/02/03) — THIS SESSION is the motivating
  case: a freshness heartbeat (PD-01) would have caught the Apr→Jun staleness;
  SID expiry-detect (PD-09 #4) and the un-paginated-read audit (PD-2026-06-12-01)
  both belong on that console. Build "in a day or so."
- PD-2026-06-12-02 — decide ingestion path: keep manual export, or build API
  enumeration for true hands-off automation.
- PD-09 #4 — weekly cron (gated on ingestion decision) + SID functional-probe
  expiry-detect/alert.
- PD-08 (relocate repo off iCloud) — durable root fix, still open.

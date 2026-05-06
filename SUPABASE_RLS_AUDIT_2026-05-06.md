# Supabase RLS Audit & Security Hardening

**Date:** May 6, 2026
**Status:** Fixes applied. This document is the post-action reference.
**Scope:** All `public` schema tables in the NapaServe Supabase project (`csenpchwxxepdvjebsrt`).

---

## Summary

Investigated a Supabase database linter warning flagging `napa_transition_tracker` as having RLS disabled. On inspection, RLS was actually enabled on all 24 public tables, so the warning was stale. The broader audit it prompted surfaced two real issues, both now resolved.

---

## Issue 1: Tables with RLS enabled but no policies

`coverage_gaps` and `napa_transition_tracker` have RLS enabled with zero policies, which fully blocks anon-key access. Confirmed via `grep` that neither table is referenced in frontend code (`src/`, `public/`), so the lockdown is the correct state. Service role key bypasses RLS, so pipeline writes continue to work.

**Resolution:** No code change required. The linter warning on `napa_transition_tracker` should be marked as accepted in Supabase Advisors.

---

## Issue 2: Policies granted to `{public}` role with no restriction in `qual`/`with_check`

Audited all write policies (`ALL`, `INSERT`, `UPDATE`, `DELETE`) granted to the `public` role. The Postgres `public` role includes anon, authenticated, and service_role — so a policy granted to `public` with `qual: true` is wide open to anyone with the anon key, regardless of policy name.

### Correctly restricted (no change needed)

The following tables had write policies correctly scoped via `auth.role() = 'service_role'` in the qual or with_check clause:

`community_observations`, `data_sources`, `nvf_chunks`, `nvf_dashboard_metrics`, `nvf_entities`, `nvf_poll_embeddings`, `nvf_posts`, `nvf_sync_log`, `nvf_tags`, `nvf_subscribers`.

### Genuinely permissive — required fix

Three tables had `qual: true, with_check: true` policies, granting full write access to anon despite policy names suggesting service-role-only:

| Table | Policy name | Purpose |
|---|---|---|
| `community_events` | `service_full` | Event Finder writes (NapaLife scraper, admin inserts, Event Intake Assistant) |
| `economic_pulse_snapshots` | `Service role full access` | FRED pipeline scheduled writes |
| `email_digests` | `service_full` | Email digest generation |

**Fix pattern:** Drop the existing policy, recreate with explicit `auth.role() = 'service_role'` check in both USING and WITH CHECK clauses, matching the working pattern on other tables.

```sql
-- Pattern applied to each of the three tables:
DROP POLICY "service_full" ON public.community_events;
CREATE POLICY "service_full" ON public.community_events
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

Existing SELECT policies (e.g., `read_approved` on `community_events`) remained in place, so frontend reads continue to function — only anon writes are blocked.

**Status:** Applied May 6, 2026.

---

## Side note: `napaserve_poll_votes`

The `Anyone can insert a vote` INSERT policy is intentional — that's how the Worker-mediated polling system accepts votes. However, there's no database-level dedup. A unique constraint on `(poll_id, voter_fingerprint)` would prevent ballot stuffing better than RLS can. Fingerprint dedup currently lives in the Worker, which means anyone hitting the Supabase REST endpoint directly with the anon key could stuff a poll.

**Recommended follow-up:**

```sql
-- Check for existing duplicates first
SELECT poll_id, voter_fingerprint, COUNT(*)
FROM napaserve_poll_votes
GROUP BY poll_id, voter_fingerprint
HAVING COUNT(*) > 1;

-- If clean, add the constraint
ALTER TABLE napaserve_poll_votes
  ADD CONSTRAINT napaserve_poll_votes_unique_voter
  UNIQUE (poll_id, voter_fingerprint);
```

Estimated effort: 10 minutes plus a duplicate check.

---

## Verification queries

Reusable for future audits.

```sql
-- Tables with RLS enabled but no policies
SELECT t.tablename
FROM pg_tables t
LEFT JOIN pg_policies p
  ON p.tablename = t.tablename
  AND p.schemaname = t.schemaname
WHERE t.schemaname = 'public'
  AND p.policyname IS NULL;

-- Permissive write policies granted to public role
SELECT tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND 'public' = ANY(roles)
  AND cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE');
```

---

## Action items

- [x] Apply policy fixes on `community_events`, `economic_pulse_snapshots`, `email_digests`
- [x] Test Event Finder reads, economic pulse pipeline, email digest generation post-fix
- [ ] Mark `napa_transition_tracker` linter warning as accepted in Supabase Advisors
- [ ] Add unique constraint for `napaserve_poll_votes` dedup (separate task, non-urgent)

---

## Operating principle going forward

When creating any new write policy, the default pattern is:

```sql
CREATE POLICY "service_full" ON public.<table>
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

A policy with `qual: true` granted to `public` is **never** correct unless the intent is genuinely "anyone with the anon key can write" (e.g., `napaserve_poll_votes` insert). When that intent applies, document it explicitly in the policy comment and pair it with a database-level constraint to enforce business rules that RLS can't.

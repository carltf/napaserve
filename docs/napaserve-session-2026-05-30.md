# NapaServe — Session Record 2026-05-30

**Scope:** Catch-up EOS covering 2026-05-25 → 2026-05-30 (last record: 2026-05-24). ~10 threads across two tracks (NapaServe-proper + the Calistoga Currents spin-out). Planned as the overdue EOS roll-forward; the bulk went to an urgent GitHub PAT rotation that surfaced mid-session.

## Headline
- GitHub PAT rotation: COMPLETED & VERIFIED (session's main work).
- EOS roll-forward written (this record + ADR-002 + ledger + Master Brief), from verified read-only state.
- Data-fixes DECIDED but NOT executed (orphan drop, astronomy seed, GWSS DB-confirm) — logged OPEN, not claimed done.

## GitHub PAT rotation — DONE (2026-05-30)
- The 2026-05-27 rotation was never completed. Found TWO classic tokens — `napaserve repo + workflow` and `napaserve access` — both expiring 2026-06-01 (2 days out), and NO fine-grained token.
- Remotes are HTTPS (verified `git remote -v`), so push depends on the PAT via macOS Keychain — June 1 expiry would have broken push across all repos. SSH ruled out (`ssh -T` → publickey denied).
- Generated fine-grained `multi-repo git push (laptop)` — All repositories; Contents R/W + Workflows R/W + Metadata RO; expires 2027-05-30. (Created with no permissions → 403; fixed by adding Contents + Workflows.)
- Installed in Keychain; push verified (`git push --dry-run` → Everything up-to-date). Both classics deleted. `.env GITHUB_TOKEN` updated to the new value (single clean entry; an earlier `export GITHUB_TOKEN=` line caused a false "missing" alarm — grep didn't match the export form; file was never damaged).
- Residual: add rotation-log line + expiry 2027-05-30 to MASTER_KEYS_REFERENCE.md.

## Verified platform state (read-only checks)
- Docs ~25 commits behind code. Shipped but undocumented until now: `/api/events-search` (5552f69), events-search status-filter fix (142daa1), Event Moderation admin tool (8f2eba6), `/api/tracker-events` public route (af8a817), dynamic TOPIC_SEEDS (04c80af), latest-substack-poll route (f904e31), `napa-farming-2026-gwss` draft (d67e8fb, 5 verify flags).
- `astronomical_events` EMPTY (0 rows) — root cause of CC night-sky search + events-search astronomical fallback. `05_seed_astronomy.py` never populated it.
- Orphan tables `event_instances` + `event_series` still live (both 200) — never dropped.
- `04_seed_events.py` — no one-shot guard found.

## Accumulated work since 5-24
- 5-25 Event Intake: identified orphan tables, submit-form pipeline fix, seed-guard need.
- 5-26: two-caption-format correction → NVF style addendum.
- 5-28: GWSS-at-Costco research → became `napa-farming-2026-gwss`.
- 5-28 → 5-30 Calistoga Currents: built as PoC, then spun into its own standalone Claude project + company-to-be with its own EOS docs; de-branded from NapaServe/VWC; now a read-tenant on NapaServe's Supabase (ADR-002).
- 5-30 (this session): CC standalone rebrand, CC Substack setup, PAT rotation, this EOS.

## Decisions
- ADR-002: CC read-tenant on NapaServe Supabase; unwind deferred to CC sale/separation.
- Orphan tables: DROP after confirming zero consumers — pending.
- Astronomy: diagnose `05_seed_astronomy.py` and seed — pending.
- GWSS: reported published 2026-05-27 on NapaServe + Substack; DB confirm + 5-flag resolution pending.

## Next session (execution items)
1. Run the astronomy / orphan-grep / GWSS diagnostic (prompt ready).
2. Drop `event_instances` + `event_series` after zero-consumer grep; strip their writes from `04_seed_events.py`.
3. Diagnose + seed `astronomical_events`.
4. Confirm GWSS publish status + poll IDs; resolve/record the 5 flags.
5. Add MASTER_KEYS rotation-log line.
6. Verify submit-form pipeline fix + seed-guard status.

## Lessons reinforced
- Verify against live, not prior docs/threads. The "push uses the PAT" note and the `.env` "missing key" alarm were both inferences corrected only by live checks. Live > protocol > memory.
- zsh comment pitfall: no inline `#` comments in commands meant for raw-zsh paste.
- Log every credential expiry in MASTER_KEYS — the untracked PAT expiry caused the scramble.

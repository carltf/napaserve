# NapaServe — Session Record 2026-06-11

## Goal
Polish pass on live nits flagged from mobile, then EOS. Scope held to four nits
(1–3 shipped; NIT 4 deferred). Surfaced a Track-B data-currency problem and a
new Admin Ops Console feature.

## Shipped & verified
- NIT 1 — admin archived-row mobile stack. `.archived-row` class +
  `@media (max-width:600px)` column-stack in index.css; inline flex removed from
  napaserve-admin.jsx. (Hypothesis "it's a grid" refuted — flex over-compression.)
  Commit d3b0712. SHIPPED-NEEDS-VERIFY (PD-2026-06-11-10) — Tim eyeballs <600px
  (gated surface, no Chrome MCP).
- NIT 2 — Pulse Community Sentiment recency + hygiene. topCivicPolls now takes
  the 15 most-recent eligible polls by published_at, then top 3 by votes, with a
  `theme != null` guard. napa-economic-pulse-full-3.jsx. Commit 27be811. CLOSED —
  verified live: top 3 are recent Jan–Feb 2026 civic polls; the "Which option is
  the correct answer?/(A) 4" trivia (nvf_polls 440700) and the Feb-2025 political
  poll are gone. Wine Chronicles polls kept (legitimate).
- NIT 3 — UTH ← Back button. history-aware handleBack (navigate(-1), hub
  fallback) + "← Back" above the eyebrow. Template (996913d) + 9 canonical
  articles (f41cae7). CLOSED — verified live: renders above the eyebrow on
  smoke-taint; click returned to the hub.
- Live bundle index-CYLJdkB-.js, confirmed first poll.

## Verification (rendered state)
NIT 2/3 confirmed via Claude in Chrome (Reader Pulse + Snapshot pages, the
smoke-taint article, click-through). The Code-thread session had no Chrome MCP
connected and verified headless (bundle string + live-API replication); the
editorial chat thread completed the rendered-state pass. NIT 1 stays for Tim's
phone check.

## New debt surfaced
See ledger 2026-06-11 roll-forward: PD-2026-06-11-01/02/03 (Admin Ops Console
phases), -04 (home-value MoM SSOT drift, parked), -05 (older-gen UTH header
normalization, 7 files), -06 (Reader Sentiment stale via latest-substack-poll),
-07 (.env not materializing), -08 (repo on iCloud Desktop = recurring cascade;
relocate), -09 (Substack currency + weekly automation, SCHEDULED, SID deadline
Jun 13), -10 (NIT 1 verify).

## Environment incidents
- Mid-build TCC/EPERM cascade halted the Code thread after the three on-disk
  edits landed (pre-commit). Recovered by restart.
- Fresh terminal then hit the Claude Code 256 fd-limit launch error; `ulimit -n`
  same shell cleared it. The suggested 2147483646 itself threw "unknown error";
  65536 worked. (Distinct layer from the TCC read-EPERM.)
- `source .env` failed "no such file" — .env not materializing (PD-07), likely
  iCloud eviction (PD-08).

## Resume note
On resume the Code thread re-derived the on-disk edits but had lost the locked
NIT 3 scope (the 9 canonical files) and proposed committing a template-only back
button as the finished fix. Caught in chat; scope re-fed and completed.

## Decisions
- Four-nit scope only; NIT 4 (.kpi-grid-macro @media) deferred.
- Back button = navigate(-1) with hub fallback, not a hardcoded hub link.
- Pulse hygiene = filter (theme != null), not row deletion — polls are real.
- Older-gen 7 UTH files deferred (PD-05); home-value drift parked behind data
  work (PD-04).

## Lessons reinforced (cheatsheet)
- Rendered-state verification earns its keep again: bundle/API evidence is
  strong but the live browser pass is the bar (NIT 2/3).
- Re-feed locked scope on Code-thread resume — a resumed session can drop it.
- fd-limit 256 blocks Claude Code launch; `ulimit -n` same shell fixes it; the
  suggested 2.1B can throw "unknown error," 65536 works; distinct from TCC EPERM.

## Platform Debt Roll Call (Lesson DD)
1. SCHEDULED shipped? No prior SCHEDULED items (nits were new this session).
2. SHIPPED-NEEDS-VERIFY verified? NIT 2/3 shipped+verified; NIT 1 now
   SHIPPED-NEEDS-VERIFY (PD-10).
3. New debt? Yes — PD-2026-06-11-01 through -10.
4. Subsystem-with-existing-debt touched? admin.jsx (PD-04 Word export, PD-16
   BlueSky) and UTH template (PD-05 useDraftGate) — left untouched, scoped
   around; no regressions.

## Final state
- napaserve.org live, bundle index-CYLJdkB-.js.
- Commits: d3b0712, 27be811, 996913d, f41cae7 (code); 6678e0f, 729f77b (ledger).
- UTH article generations clarified: 9 canonical / 7 older-gen.

## Carry-forward / next session (critical path)
PD-07 (.env) → PD-09 SID refresh (Jun 13 deadline) → pipeline audit → catch-up
pull → weekly automation (+ PD-01 heartbeat). PD-08 (relocate repo off iCloud)
is the durable root fix.

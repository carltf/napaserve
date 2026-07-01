# NapaServe — Session Record 2026-06-30

## Goal
Content patches to napa-four-legged-economy-2026 (2025 CDFA price note; SRGA
identity). Expanded on discovery that the article had never been DB-inserted or
poll-seeded despite being code-shipped + Vercel-deployed + rendering publicly —
a Lesson Z recurrence. Inserted the draft row + seeded polls; Tim published via
the admin button. EOS.

## Shipped & verified (ground truth — SELECT, not assumption)
- napa-four-legged-economy-2026: row id 21, published=true,
  published_at 2026-07-01T04:13:56Z, polls 64/65/66. Claude Code inserted the
  row as published=false + seeded 3 polls via REST (secret key); Tim then clicked
  the admin "Publish Article" button (worker PATCH → published=true, now()).
  Normal protocol. Verified by SELECT.
- napa-tax-base-2026: code-retired (JSX removed, 4712644). DB row id 19 RETAINED
  as published=false; polls 58/59/60 RETAINED. NOT deleted — corrects the "DELETE"
  assumption; verified by SELECT.

## Editorial substance (four-legged)
- Thesis: Napa's four economic legs — wine, tourism, hospitality jobs, property-tax
  base. Three slipping; the fourth (assessed value, $55.77B) carries them and is
  most exposed to repricing.
- 2025 CDFA cabernet: weighted-avg price $8,933/ton — second straight annual
  decline, first back-to-back in the modern crush-report era. Methodology note
  distinguishes CDFA price-per-ton (text) from Ag-Commissioner crop-value totals
  (Chart 1, through 2024).
- SRGA resolved: taxpayer #7 = SRGA LP = Stanly Ranch — the 700-acre Carneros
  property in full (Auberge-operated resort + many associated residences),
  ~$288M assessed, confirmed by Napa County Assessor John Tuteur. Loan reconcile:
  $235M origination → $230M balance at default (Oct 2025) → Blackstone foreclosure
  (Mar 2026), after FY close. [VERIFY] flag removed.

## Code shipped (commits — explicit paths, no -A, no Co-Authored-By)
- 4712644 — add napa-four-legged-economy-2026, retire superseded napa-tax-base-2026
- 4dcb302 — add 2025 CDFA price note + price-discovery cross-link
- 3f05498 — identify SRGA as SRGA LP / Stanly Ranch, reconcile loan figures,
  taxpayer counts to nine
- 645c638 — expand SRGA passage with Napa County Assessor confirmation
Two files across the set: under-the-hood-napa-four-legged-economy-2026.jsx,
napaserve-admin.jsx. HEAD = 645c638 = origin/main.
- DB (not a commit): inserted napaserve_articles row 21 (draft) + polls 64–66.

## Verification (rendered / live state)
- Deploy: Vercel deployment for 645c638 = READY, target production, aliased to
  www.napaserve.org — verified via Vercel API BY COMMIT SHA, not bundle hash
  (local hash "CbIHQAnz" never appears; CI builds a different hash — kL_aJ5TW).
- Admin card diagnosis: pre-insert it showed "Live" + "DRAFT" + no Publish button —
  the signature of a MISSING DB row hitting the admin `published: dbRow ?
  dbRow.published : true` fallback + useDraftGate not-found→published catch
  (Lesson K: tags disagree → probe the DB row, not the UI). Admin is auth-gated →
  verified via code + worker endpoints, not Chrome MCP.
- worker /api/article-status flipped {"error":"not found"} → {published:false}
  (after insert) → published:true (after Tim's click).

## New debt surfaced
- PD-2026-06-30-01 — Studio Mac has no node/npm build toolchain.
- PD-2026-06-30-02 — two-machine iCloud sync friction (Studio ↔ Air) cost time.
  Both compound PD-2026-06-11-08 (repo under iCloud Desktop).

## Lessons reinforced (cheatsheet — recurrence of Z)
- Code-shipped + deployed + publicly rendered (via published-defaults-true
  fallback) ≠ published. Seeder script containing poll defs ≠ polls in the DB.
  Fixes: Publish-Readiness Ledger with pasted SELECT evidence per store; never
  transcribe DB status from memory or the seeder; separate "code-shipped" from
  "published" in EOS language.
- Infra: Vercel not Cloudflare; verify deploys by commit SHA via Vercel API, never
  local hash; /api/publish-article only UPDATEs an existing row (needs a
  published=false row first; publish via admin button).
- Process: DB-state / publish-readiness route to Claude Code for a SELECT — never
  asserted from chat-thread memory. Live > protocol > assistant memory.

## Platform Debt Roll Call (Lesson DD)
1. SCHEDULED shipped? None — four-legged was not a ledger item.
2. SHIPPED-NEEDS-VERIFY verified? No — PD-2026-06-11-10 (admin archived-row
   mobile) untouched.
3. New debt? PD-2026-06-30-01, PD-2026-06-30-02.
4. Subsystem-with-existing-debt touched? Admin publish / draft-gate UI
   (PD-2026-05-24-05 useDraftGate destructure; PD-2026-05-24-16 BlueSky
   DRAFT-label) — diagnosed the published-defaults-true fallback, no code change.
   Machine/iCloud (PD-2026-06-11-08).

## Final state
- napa-four-legged-economy-2026 LIVE (published 2026-07-01, row 21, polls 64–66).
- napa-tax-base-2026 code-retired; DB row 19 + polls 58–60 retained, unpublished.
- Commits 4712644 / 4dcb302 / 3f05498 / 645c638 + this EOS doc set.
- Draft insert + EOS run from the Studio (no build toolchain here); build/deploy
  by Vercel CI from the pushed commits.

## Carry-forward / next session
- Benessere pending sale — post-publish update ~late July.
- Tuteur confirmation: verbal received (article reflects it); obtain written.
- PD-2026-06-30-01/02 + PD-2026-06-11-08 — relocate repo off iCloud / consolidate
  one build machine.
- Master-brief live-inventory table is stale (missing ~7 published articles;
  poll-ID counter 45 vs DB max 66) — reconcile in a future pass.

# NapaServe — Architecture Decision Records

Canonical decision log for NapaServe platform and process choices. Each entry is dated and numbered. Entries are append-only: once an ADR is recorded, it stays. Reversal of an earlier ADR creates a new ADR that supersedes it and links back.

---

## ADR-001 — Migrate EOS to Markdown-Canonical

**Date:** 2026-05-24
**Status:** Accepted
**Supersedes:** Cumulative .docx roll-forward EOS pattern (April 27 – May 18, 2026)

### Context

The NapaServe EOS protocol from April 27 through May 18, 2026 used five cumulative-rebuild .docx files (Session Summary, Cheatsheet, Master Brief, UTH Protocol, PulseTracker Plan), each embedding the prior version verbatim as a carry-forward block before appending new session content. The protocol enforced a Lesson M validation gate ensuring genuine Microsoft Word 2007+ ZIP-based docx, not plain text with a .docx extension. Per the protocol, each new version's byte and paragraph count exceeded the prior baseline.

By the May 18 V5 EOS, the five docx files totaled approximately 5,400 lines. The May 24 V6 roll-forward would exceed 6,000 lines. The cumulative pattern produced three growing problems:

1. **Generation cost.** Correctly regenerating V6 required either a Claude Code script (the way V5 was produced) or manual stitching of project_knowledge_search results in chat. Error-prone at the V5+ size.

2. **Silent staleness.** The May 24 session surfaced that the Lesson AA date-parsing bug had been documented in the Email Worksheet weeks earlier ("Fix digest date UTC offset in handleSendDigestPreview() — pending fix") but never propagated into the Cheatsheet as a generalized lesson. Same for the calculators dual-write gap. The cumulative pattern stored information without enforcing cross-document propagation.

3. **Filename versioning vs git history.** Date-stamped filenames were the version archive. This made "which file is current" a manual discipline and required moving superseded versions to Active/Older Drafts/ on every save. Git history serves the same role more reliably.

A reference implementation of markdown-canonical EOS exists in SortWise (ADR-024, May 13, 2026).

### Decision

NapaServe adopts markdown-canonical EOS effective 2026-05-24.

**Canonical documents become .md files** under flat naming (no dates in filenames):

- napaserve-master-brief.md
- napaserve-cheatsheet.md
- napaserve-uth-protocol.md
- napaserve-pulsetracker-plan.md
- napaserve-platform-debt-ledger.md (NEW canonical doc)
- napaserve-eos-checklist.md (NEW manifest doc)
- napaserve-decisions.md (this file)

**Session records become per-session markdown files** under pattern `napaserve-session-YYYY-MM-DD.md`. Each session record is standalone, not consolidated.

**Git history is the version archive.** Filenames carry no version suffixes. The Active/Older Drafts/ move discipline retires for markdown files.

**The EOS Checklist is the manifest.** Adding a new canonical document requires adding it to the checklist in the same commit.

**Polished .docx for external audiences** is generated on demand via `pandoc input.md -o output.docx`.

### V5 Archive Treatment

The five existing V5 .docx files are preserved as a frozen historical snapshot in iCloud Active/Older Drafts/. Canonical for April 27 – May 18, 2026 date range. Not extracted forward in full; the new markdown files lift going-forward canonical content from V5 but do not preserve session-by-session narrative.

If a future session needs detail from that period beyond what was lifted into the markdown canon, the V5 archive is canonical. Read via `pandoc input.docx -o output.md`.

### EOS Routine Going Forward

1. Update relevant canonical markdown files in-place
2. Append today's session record as a new `napaserve-session-YYYY-MM-DD.md`
3. Run the EOS terminal prompt to stage updated files
4. Drag staged files into Project Knowledge, deleting the stale tile first
5. Verify timestamps after upload
6. Commit to git if files live in a git-tracked repo

### Anti-patterns

- **Upload before delete.** Re-uploads create duplicate Project Knowledge tiles.
- **TextEdit for markdown.** Use VS Code, nano, or vim.
- **Heredoc-direct doc updates without confirmation.** Preview in chat first.
- **Batching multiple sessions into one upload.** Re-upload at every session end.

### Consequences

**Lost:**
- The cumulative roll-forward property of the docx system. Each markdown file maintains itself in place; prior versions live in git history.
- Session-by-session narrative detail not maintained in canonical going-forward docs. Per-session records become standalone files; deep narrative from prior sessions lives in V5 archive.

**Gained:**
- Generation cost drops to near-zero
- Drift detection improves (git diff shows actual changes)
- Project Knowledge tiles stay current more easily
- Version archive is git, which is more reliable than date-stamped filenames
- "Which file is current" has a clean answer: HEAD

**Pending (Stage 2, deferred):**
- YAML frontmatter on each canonical .md file (`canonical_path`, `last_committed`, `last_committed_sha`, `session`)
- Pre-commit hook auto-updating frontmatter on every commit
- Session-start drift detection: compare frontmatter SHA to repo HEAD, flag stale Project Knowledge tiles structurally

Stage 1 (this ADR) delivers most of the value. Stage 2 is logged as `PD-2026-05-24-27` in the Platform Debt Ledger.

### References

- SortWise ADR-024 (2026-05-13) — analogous cutover in another project
- V5 .docx files in iCloud Active/Older Drafts/
- napaserve-eos-checklist.md — canonical manifest

---

## ADR-002 — Calistoga Currents as a Read-Tenant on NapaServe's Supabase
**Date:** 2026-05-30 · **Status:** Accepted

**Context.** Calistoga Currents (calistogacurrents.com) separated into its own project 2026-05-30, expected to become its own company. Public/brand layer is fully independent; data layer is not — CC Dashboard + Events read three NapaServe Supabase tables (`economic_pulse_snapshots`, `community_events`, `astronomical_events`) via a hardcoded URL + publishable anon key in `src/pages/Dashboard.jsx` and `Events.jsx`, served through the CC Worker `calistoga-currents-feed.tfcarl.workers.dev`.

**Decision.** NapaServe hosts CC as a read-only tenant on its production Supabase. Data-layer unwind deferred to a CC sale/separation — replicating the ingest backend for one small-town paper is disproportionate now. Separation principle met by keeping the seam documented and clean, not by migrating today.

**Consequences.** CC is a documented consumer of three NapaServe tables. Before any schema/RLS change to those tables, check CC impact (alongside the `/api/tracker-events` Napa Lowdown consumer). Seam verified 2026-05-30: RLS on; CC anon key cannot read subscriber/PII tables. At separation: replicate pipelines into a Calistoga-only Supabase, or license the data.

---

## ADR-003 — Hub Reads Supabase REST Directly for Article `headline`
**Date:** 2026-06-02 · **Status:** Accepted

**Context.** The hub (`under-the-hood-index.jsx`) rendered article card titles from the Worker `/api/articles` route, which has no `headline` field. The farming row had `title=null`, so its card rendered blank, and titles were inconsistent across cards.

**Decision.** The hub fetches Supabase REST directly (anon key, `published=eq.true`) for article `headline`, bypassing the Worker `/api/articles` route.

**Rationale.** Fixed blank/inconsistent hub card titles (commit 4ca41e0) without requiring a Worker redeploy.

**Trade-off.** Forked data path — the hub no longer consumes the Worker route for this data.

**Unwind.** Add `headline` to the Worker `/api/articles` select, then point the hub back. Tracked as PD-2026-06-02-01 in the Platform Debt Ledger.

---

## ADR-004 — Civic / Institutions Tracker Category
**Date:** 2026-06-03 · **Status:** Accepted

**Context.** The Contraction Tracker's four categories (Hospitality, Production, Transaction, Distribution) describe the wine/visitor-economy value chain. The Highway 29 Media closure (a regional newspaper group) had no fitting bucket and was provisionally filed under Hospitality.

**Decision.** Add a fifth category, **Civic / Institutions** (`category='Civic'`, color #3F7E8C), as a deliberately broad civic/media/institutional bucket — newspapers, schools, hospitals, bank branches, nonprofits. Highway 29 Media re-tagged into it.

**Rationale.** "Civic" generalizes better than "Media" — it absorbs future non-wine contraction without spawning single-use categories. Distinct from the platform's "community intelligence" descriptor (Brand Rules forbid "civic intelligence"); "Civic" here is only a tracker category value.

**Consequences.** `napa_transition_tracker_category_check` permanently includes Civic. Any further category requires an ALTER plus the UI touch-points (Lesson EE). The Napa Lowdown scout ignores category, so no external-consumer cutover.

---

## ADR-005 — Pre-Handoff Export Gate for UTH Builds
**Date:** 2026-06-24 · **Status:** Accepted

**Context.** napa-auction-2026 shipped to a rendered draft with an empty deck, a dead [Chart 1] marker, an unverified Related Coverage block and a Sunday publish date. 20-step sequence steps 13 (EXPORT_DATA population) and 15 (Word-export end-to-end test) had been claimed done but were never verified against a rendered export — "done" was declared off a clean build hash. This is an Anti-Drift Gate #3 failure: trusting code/build state over rendered output.

**Decision.** Add a mandatory Pre-Handoff Export Gate to the UTH protocol — a new section immediately before Anti-Drift Gates, with a pointer at step 15 of the 20-step sequence. No UTH export is handed to Tim until the gate passes: EXPORT_DATA completeness (optional fields populated or marked N/A), chart placement (no dead [Chart N] in any output), Related Coverage verified against `napaserve_articles` / `nvf_posts`, Saturday date sanity, and a Word-export end-to-end read noting any PD-2026-05-24-04 template artifacts.

**Countermeasure.** The gate is reported in every HOLD message; "done" is not declared until all gate items are reported. Ties to Anti-Drift Gate #3 — acceptance requires looking at rendered output, not code.

---

## ADR-006 — Elected Seats Atlas Funding Routes Through NapaServe (not CommunityServe)
**Date:** 2026-07-07 · **Status:** Accepted

**Context.** The Elected Seats Atlas (new project launched 2026-07-07 off Supervisor Joelle Gallagher's ask) needs a funding/sponsorship framing. CommunityServe (the nonprofit routing option) is not set up.

**Decision.** Sponsorship for the Elected Seats Atlas routes through NapaServe directly. Do not reference nonprofit/CommunityServe routing in any brief, email or external framing. Commercial comparable is $15K–40K.

**Consequences.** Brief and outreach language use NapaServe funding framing (Elected_Seats_Atlas_Brief.docx v2 already reflects this). Tim's decision; revisit only if CommunityServe is later stood up.

---

## ADR-007 — Standalone `public/` HTML Pages May Use CSS Files (SPA Inline-Styles Rule Does Not Apply)
**Date:** 2026-07-07 · **Status:** Accepted

**Context.** The platform's mobile-CSS rule forbids `gridTemplateColumns` (and grid layout generally) in inline styles because inline styles override CSS class rules on mobile Safari regardless of `!important`. That rule exists to protect the React SPA bundle. `precinct-explorer.html` (the Elected Seats Atlas demo) ships as a standalone static file from `economic-pulse-app/public/`, served verbatim at the site root — it is not part of the React bundle.

**Decision.** Standalone `public/` HTML pages are exempt from the SPA inline-styles / mobile-CSS discipline. They may use their own `<style>` block or CSS file, including media queries (the demo uses `@media (max-width: 760px)` for its stacked mobile layout).

**Consequences.** The exemption is scoped strictly to files under `public/` that serve outside the SPA. Any code that becomes part of the React bundle re-inherits the inline-styles rule. See Cheatsheet "Static Public Assets" and ADR-008.

---

## ADR-008 — Explicit-Filename + Version-String Gate for Downloads-to-Repo Copies
**Date:** 2026-07-07 · **Status:** Accepted

**Context.** During the Elected Seats Atlas iteration, "copy the newest matching file from ~/Downloads" prompts broke twice: browser download suffixing (`-2`, `-3`, `_1`) meant "newest by mtime" once copied a stale v0.1 and once aborted a valid v0.6. Filename is not a reliable version signal.

**Decision.** Downloads-to-repo copies use an explicit filename plus a `grep` version-string gate: name the file, confirm it contains the expected version string (and any other required marker), and abort if the count is 0 — showing what was checked. The version string inside the file is the deploy gate, not the download filename.

**Consequences.** Standard for all copy-from-Downloads deploys (demo assets, exports). Cheap insurance against stale/duplicate downloads. See Cheatsheet "Static Public Assets — `public/` Direct-Serve Deploy."

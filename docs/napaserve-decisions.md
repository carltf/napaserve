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

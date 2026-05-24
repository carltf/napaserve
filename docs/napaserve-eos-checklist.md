# NapaServe — EOS Checklist (Canonical Manifest)

Manifest of canonical markdown documents existing as Project Knowledge tiles for NapaServe. Contains the canonical end-of-session terminal prompt template.

Governed by ADR-001 (see `napaserve-decisions.md`).

---

## Canonical Markdown Manifest

| File | Purpose |
|---|---|
| `napaserve-master-brief.md` | Platform state, identity, architecture, current commitments |
| `napaserve-cheatsheet.md` | Operating reference, locked lessons, editorial standards, pitfalls |
| `napaserve-uth-protocol.md` | Under the Hood build sequence, conventions, gates |
| `napaserve-pulsetracker-plan.md` | Pulse Tracker system design and phase plan |
| `napaserve-platform-debt-ledger.md` | Canonical ledger of deferred debt |
| `napaserve-decisions.md` | Architecture Decision Records, append-only |
| `napaserve-eos-checklist.md` | This file |

Session records:

| Pattern | Purpose |
|---|---|
| `napaserve-session-YYYY-MM-DD.md` | Per-session standalone records |

The V5 .docx archive (deep history for April 27 – May 18, 2026) lives in iCloud `Active/Older Drafts/`.

---

## End-of-Session Routine

### Step 1 — Determine what changed this session

Typical sessions touch:

- `napaserve-session-YYYY-MM-DD.md` (new — every session)
- `napaserve-cheatsheet.md` (when new lessons surface)
- `napaserve-platform-debt-ledger.md` (when debt added, scheduled, or shipped)
- `napaserve-master-brief.md` (when platform state changes)
- `napaserve-decisions.md` (when a new ADR is recorded)

UTH Protocol and PulseTracker Plan change less frequently.

### Step 2 — Run the canonical EOS terminal prompt

The prompt creates `~/Desktop/napaserve-upload-staging/`, writes markdown files via heredocs, reports sizes and line counts.

### Step 3 — Upload to Project Knowledge

1. Open the NapaServe Project in Claude.ai
2. For each file being re-uploaded:
   - **Delete the existing tile first** (re-uploads create duplicates, not replacements)
   - Drag the fresh file from staging
   - Wait for upload confirmation
3. For brand-new files: just drag — no deletion needed

### Step 4 — Verify upload

Screenshot the Project Knowledge file list. Confirm every file appears exactly once with correct line counts.

### Step 5 — Cleanup

After upload confirmed:

```
rm -rf ~/Desktop/napaserve-upload-staging && echo "Staging folder deleted."
```

### Step 6 — Commit to git (if applicable)

If `napaserve-*.md` files live under a git-tracked location, commit with explicit message naming what changed.

---

## Anti-patterns

- **Upload before delete.** Always delete the stale tile first.
- **TextEdit for markdown.** Use VS Code, nano, or vim. TextEdit defaults to RTF.
- **Heredoc-direct doc updates without confirmation.** Preview in chat first.
- **Batching multiple sessions into one upload.** Re-upload at every session end.

---

## V5 Archive Reference

iCloud path: `~/Library/Mobile Documents/com~apple~CloudDocs/Valley Works Collaborative/NapaServe/Active/Older Drafts/`

Five files:

- `NapaServe_Session_Summary_2026-05-18_v5.docx`
- `NapaServe_Cheatsheet_2026-05-18_v5.docx`
- `NapaServe_Master_Brief_2026-05-18_v5.docx`
- `NapaServe_UnderTheHood_Protocol_2026-05-18_v5.docx`
- `NapaServe_PulseTracker_Plan_2026-05-18_v4.docx`

Read via `pandoc input.docx -o output.md` for markdown inspection.

# NapaServe — Session Record: 2026-05-24

**Session date:** Sunday, May 24, 2026
**Session theme:** Three production fixes + EOS migration to markdown-canonical
**Status at end of session:** All three commits live and verified; EOS migration shipped via ADR-001

First session record under ADR-001. Replaces what would have been V6 Session Summary in the prior docx-cumulative scheme.

---

## Headline

Three platform debt items closed in one session, all verified live via Chrome MCP:

1. **Date off-by-one display bug** (Lesson AA) — `+ 'T00:00:00'` parse pattern on two surfaces
2. **scrollRestoration race on hard-load** (Lesson BB) — manual setting in main.jsx
3. **Calculators/Snapshot dual-write gap** (Lesson CC) — shared `useTrackerEvents` hook with explicit windowing

Plus three new tracker events (Studio Findings, Arborum, House of Saka) — tracker 25 → 28 events.

Plus established Platform Debt Ledger (Lesson DD ritual) and markdown-canonical EOS (ADR-001).

---

## Three Commits Shipped

### e5715cc — fix(dates): parse event_date as local time (Lesson AA)
- SnapshotTab.jsx:244, napaserve-admin.jsx:1577
- Pattern: `new Date(event_date + 'T00:00:00').toLocaleDateString(...)`
- Verified: Chrome MCP confirms Studio Findings → May 31, Arborum → May 18, Saka → May 13

### 777f34f — fix(nav): set history.scrollRestoration to 'manual'
- main.jsx — 1 line with defensive feature-detection guard
- Verified: `scrollRestoration === "manual"`, `scrollY === 0` on hard-load

### 1fb694a — refactor(tracker): single-source-of-truth via shared useTrackerEvents hook
- NEW: `src/hooks/useTrackerEvents.js` (daysAgoISO / monthsAgoISO helpers)
- MOD: SnapshotTab.jsx (consume hook)
- MOD: napaserve-calculators.jsx (consume hook; drop ~250-line `TRACKER_EVENTS`; `sourceUrl` → `source_url`)
- Bundle: `index-BWDv4A8X.js`
- Net: 3 files, +153/-240 = -87 lines while adding functionality
- Verified: Bundle has 0 TRACKER_EVENTS refs, 1 tracker-events ref. Calculators shows 24 events in 6-month window, filter dynamic.

---

## Three Tracker Events Seeded

| ID | Date | Category | Headline | Source |
|---|---|---|---|---|
| 26 | 2026-05-18 | Transaction | Arborum Buys 24 Acres From Vineyard 29 in St. Helena Split-Asset Sale | Wine Spectator |
| 27 | 2026-05-13 | Production | Napa-Based House of Saka Files Chapter 7 as Cannabis-Wine Diversification Bet Fails | Napa Valley Register |
| 28 | 2026-05-31 | Hospitality | Studio Findings to Close St. Helena Main Street Store After 26 Years | Napa Valley Register |

**Editorial framing:**

- **Saka** as diversification-failure signal — wine industry's interest in low/no-alcohol-plus-cannabis space; collapse at $115K liabilities / $10K assets shows novel-adjacency diversification not yet commercially viable at small scale
- **Studio Findings** captures broader displacement-by-luxury-fashion dynamic: Elyse Walker expanding into vacated Studio Findings + Olivier Napa Valley building; consolidation swaps wine-country-character storefronts for single luxury-fashion footprint (Bottega Veneta, Gucci, Saint Laurent)
- **Arborum** textbook split-asset transaction matching McMinn family's January 2026 decision to break up the $65M whole-estate Vineyard 29 listing

---

## Three New Lessons Formalized

### Lesson AA — Date-only ISO strings parse as UTC midnight in JS

`new Date("2026-05-31")` parses UTC midnight, renders as previous day in PT via `toLocaleDateString()`. **Rule:** append `T00:00:00` (display) or `T12:00:00` (math). Two valid canonical variants across codebase. Inline comment when patching: `// Parse as local date to prevent UTC→PT off-by-one. Lesson AA.`

### Lesson BB — history.scrollRestoration must be 'manual' for SPAs with async content

Browser default `"auto"` races async render on hard-load, lands viewport mid-page. Set `history.scrollRestoration = 'manual'` early in entry bundle (main.jsx) with defensive feature-detection guard. In-app SPA route changes handled separately.

### Lesson CC — Single source of truth via shared React hook (structural enforcement)

Two surfaces displaying same data must not implement parallel fetch paths. Extract shared hook; consumers vary configuration (e.g., time window) via options. **Companion principle:** windowing as first-class architectural concern — each consumer declares `since` param explicitly. **Rule-of-three corollary:** two consumers enough to extract specific hook (e.g., `useTrackerEvents`); three consumers when generic abstractions (`useWorkerData`) become defensible.

### Lesson DD — Platform Debt Roll Call as EOS ritual

Before generating EOS docs, re-read `napaserve-platform-debt-ledger.md` and answer four questions: SCHEDULED shipped? SHIPPED-NEEDS-VERIFY verified? new debt? subsystem-with-existing-debt touched? Structural enforcement against debt invisibility between sessions.

### Lesson E (operational, May 24) — TCC entitlement recovery verified

Procedure documented May 10 V5; recurred mid-session May 24 and was successfully recovered. **Critical detail:** Cmd+Q to fully quit Terminal — not Cmd+W. System Settings → Privacy & Security → Full Disk Access → remove Terminal → re-add from `/System/Applications/Utilities/Terminal.app` → Cmd+Q quit → relaunch. Verify with `cat ~/Desktop/napaserve/.env > /dev/null && echo OK || echo BLOCKED`. If still blocked: `sudo tccutil reset SystemPolicyAllFiles`.

---

## Editorial / Process Observations

- **Session pacing:** TCC entitlement loss mid-session could have been stopping point; Tim chose to push through. This was correct — the fix was reliable and momentum was real. Assistant's recommendation to stop was overcautious given Tim's history with the procedure.
- **Read-before-draft applied to EOS migration:** Tim challenged completeness of EOS doc reads twice; both correct. The fix was systematic `project_knowledge_search` reads of each V5 doc in full, with Tim able to verify reads as they happened.
- **Windowing as first-class architectural concern:** Calculators refactor could have shipped without explicit `since` param. The choice to make windowing central was deliberate — as data grows, forcing each consumer to declare its window prevents waste.
- **Two-thread discipline survived TCC interruption:** Editorial chat handled planning + verification; Claude Code handled file edits. CC's Step 1 discovery report transferred cleanly across the TCC-induced session break.

---

## EOS Migration Executed (ADR-001 Stage 1)

- Five V5 `.docx` files retired as canonical going-forward; remain in iCloud `Active/Older Drafts/` as frozen archive
- Eight new `.md` files established as canonical going-forward documentation set
- EOS routine simplified: edit canonical `.md` in place, append per-session `.md`, run terminal prompt to stage, drag to Project Knowledge
- Stage 2 (frontmatter + drift detection) deferred — logged as `PD-2026-05-24-27`

---

## Final State at Session End

- napaserve.org: all three commits live, bundle `index-BWDv4A8X.js`
- `napa_transition_tracker`: 28 events
- All other UTH articles unchanged from May 18 V5 state
- Documentation: 8 canonical markdown files in place; V5 docx archived; Project Knowledge tiles updated

---

## Carry-Forward to Next Session

See `napaserve-platform-debt-ledger.md` for full inventory. Highest-priority items:

- Backfill mini-session for pre-September 2025 baseline tracker events (PD-2026-05-24-02)
- "Load older events" UI affordance on calculators (PD-2026-05-24-03)
- Worker.js handleSendDigestPreview() Lesson AA application (PD-2026-05-24-01)
- Word export template fixes (PD-2026-05-24-04)
- useDraftGate destructure across 5 UTH files + template (PD-2026-05-24-05)
- Pulse Tracker Phases 1+2 (PD-2026-05-24-13)

Platform Debt Roll Call (Lesson DD) runs at start of next session, reading the ledger first.

---

## Wins

- Three structurally durable fixes shipped in one session, all verified live
- Single source of truth principle now enforced in code for tracker data
- Platform Debt Ledger establishes roll-forward gate previously lacked
- Lesson capture (AA / BB / CC / DD / E) addresses failure modes that allowed today's bugs to recur in latent form
- EOS migration to markdown-canonical executed cleanly with full V5 archive preserved
- Two-thread discipline survived mid-session TCC interruption without context loss

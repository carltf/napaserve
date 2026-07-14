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

---

## ADR-009 — Official NASS/CDFA Acreage Is the Number of Record; Land IQ Is Spatial-Only
**Date:** 2026-07-07 · **Status:** Accepted

**Context.** Two feasibility spikes tested whether satellite/GIS crop data can carry a Napa vineyard-acreage product (see `napaserve-session-2026-07-07-vineyard.md`). USDA CDL failed outright (pre-2012 garbage, ±20–40% year-over-year classification noise, removal signal pointing the wrong way — 2020→2025 **+39%** vs a flat-to-declining reality). Land IQ / DWR statewide crop mapping produced plausible *levels* (44–47k, realistic year-over-year moves) but an **unstable offset** vs official NASS/CDFA totals: the delta drifts monotonically −2.0% (2020) → +3.7% (2024), a 5.66-point spread. The two series scissor apart — official flat-to-declining (~45.5k → 45.1k), Land IQ rising +4.5% (44.7k → 46.7k). Validated against the NASS Grape Acreage Report "ALL WINE TYPE GRAPES … standing by county" table (parser at `pipeline/spike_landiq_validation.py`).

**Decision.** **Official NASS/CDFA Grape Acreage Report figures are the number of record for all acreage totals and trends.** Land IQ / DWR crop mapping is used **spatially only** — to map *where* vineyards are (field polygons for a given vintage), never to drive an acreage trend line. Any surface that shows a Land IQ-derived total labels it a *mapped footprint* (rough), distinct from the official county total, and never presents Land IQ year-over-year change as real acreage change without the drift caveat.

**Rationale.** The Land IQ trend bias (~+1.4 pts/yr drift) is larger than the real signal (~1–2%/yr), so a change-detection product built on Land IQ totals would manufacture growth that isn't there. Spatial footprint is what Land IQ is genuinely good at; acreage-of-record is what NASS/CDFA is authoritative for. `vineyard-explorer` v0.1/v0.1.1 already implements this split (official callout per year; mapped-footprint change in a caution treatment).

**Consequences.** CDL is disqualified as a primary series (may still cross-check spatially). Any future vineyard/ag-acreage surface follows the same split. If a future NDVI/Sentinel-2 layer (v0.3) claims removals, it is validated against Tim's known-removals list before publication — same distrust-the-trend discipline. See Cheatsheet "Land IQ / DWR Crop Mapping" and the session record.

---

## ADR-010 — `napa_elected_seats` Data Governance: RLS-Locked Until Verified, Privacy-Redacted, Corrections-With-Source
**Date:** 2026-07-08 · **Status:** Accepted

**Context.** The Elected Seats Atlas Phase 1 roster was seeded into a new `napa_elected_seats` Supabase table (109 rows) from the ROV Incumbent File (11/18/2025). The data has two sensitivities: (1) it is an **unverified baseline** — 76 of 109 rows carry verification flags, and it names incumbents; (2) the source ROV file contains incumbents' **home addresses, emails and phone numbers**. It also inevitably contains errors that stakeholders (starting with Supervisor Gallagher) will report over time.

**Decision.** Three linked governance rules for `napa_elected_seats`:

1. **RLS-locked until verified.** The table ships with **RLS enabled and no policies** — access is service-role only. Public read is opened later, and only via a **single anon `SELECT` policy**, after the verification pass on the flagged rows clears. Never expose the table publicly before verification.
2. **Privacy redaction (LOCKED).** Home addresses, emails and phone numbers in the ROV file are **never extracted into the table and never displayed**. The only public display fields are name, seat, term and election date.
3. **Corrections logged with source, never applied from memory.** Every correction (from Gallagher or any other reporter) is **logged with its source**, then applied via a service-role `UPDATE`. Corrections are never applied from chat-thread memory or assistant recollection — same "live/source > memory" discipline as the rest of the platform.

**Rationale.** An unverified, person-named dataset must not go public accidentally (hence RLS-with-no-policies as the default-deny posture, not a forgotten TODO). The privacy rule is a hard commitment made to the Registrar (Tuteur) in writing. The corrections rule keeps the roster auditable — each change traceable to who reported it and when.

**Consequences.** Any surface reading `napa_elected_seats` before the anon `SELECT` policy exists must use the service role. The 76 flagged rows are an open verification obligation — see ledger PD-2026-07-08-01. See Cheatsheet "`napa_elected_seats` Table" and the session record `napaserve-session-2026-07-07-elected-seats.md`.

---

## ADR-011 — Three-Bin Display Standard for Derived (Modeled) Map Layers
**Date:** 2026-07-08 · **Status:** Accepted

**Context.** The vineyard-explorer v0.2 diff layer, and any future NDVI/Sentinel-2 layer, are **derived** — they infer field-level change from imagery or geometry rather than reporting a measured fact. The Sentinel-2 spike (this session) showed the failure mode directly: a "removed vs active" two-bin framing would have forced genuinely ambiguous fields (censored removals, mixed 10 m pixels, simplification artifacts) into one confident bucket, manufacturing certainty the data does not support. This generalizes the ADR-009 distrust-the-trend discipline from totals to individual features.

**Decision.** Every derived map layer uses an **explicit three-bin display**: **active** / **signal-lost** / **uncertain**. Uncertainty is **shown, marked, and never forced into active or signal-lost.** Each bin gets a legend row plus a one-line plain-English meaning. Wording is **"mapped / not mapped … possible X"** — never a flat "removed" / "planted" claim. Colors carry a lightness difference, not hue alone (deuteranopia), and a verbatim methodology-drift caveat sits under the legend.

**Rationale.** The honest product surfaces its own ambiguity. v0.2 already implements the pattern (neutral = mapped both years; brick = not mapped later / *possible* removal; sage = newly mapped / *possible* new planting; "Directional, not parcel-proof"). The three-bin rule makes that the standard for anything modeled, so a future Part C removal layer can't silently collapse "we don't know yet" into "removed."

**Consequences.** Any new derived layer (NDVI current-year, change-detection, classification) ships three-bin or does not ship. See Cheatsheet and `napaserve-session-2026-07-08.md`. Ties to ADR-012 (the provisional layer's ship gate).

---

## ADR-012 — 2026 Provisional NDVI Layer Deferred to ~September 2026 (Not Killed)
**Date:** 2026-07-08 · **Status:** Accepted

**Context.** Spike #3 Part B (this session) returned **MUSH** for a single-field, single-scene NDVI-delta removal detector: group means separate (controls +0.042 vs removals −0.112) but per-field control σ ~0.13 swamps a threshold, and only 3/9 removals cleared the control 10th percentile. The result is robust (a DOY-matched rerun stayed MUSH). Two of the nine ground-truth points (R3, R9) resolved off the clean list as staged/earlier removals; three of the remaining failures are **censored** — pulled after the 2026 imagery window closed on Jul 7.

**Decision.** The 2026 provisional/current-year NDVI layer (the roadmap "v0.3 amber toggle") is **DEFERRED to ~September 2026, not killed.** The **gate to ship it: a Part C rerun must return SEPARATES** (≥7/9 clean removals clearly outside the control distribution). Until then, no amber "provisional current-year" toggle ships on vineyard-explorer.

**Rationale.** The signal genuinely exists for **completed** removals (R1/R4/R8 separated perfectly), so the approach is not dead — it is under-powered given single-scene noise and a mid-season, pre-cutoff 2026 window. September gets full-season 2026 imagery (removes censoring) and lets Part C add the noise-beating machinery (see Cheatsheet Part C spec). Shipping a MUSH layer would violate ADR-011 and ADR-009.

**Consequences.** Tracked as ledger `PD-2026-07-08-03`. Part C spec (multi-date composites, bare-soil/tillage index, per-removal dates, 7-point clean ground truth) lives in the Cheatsheet. Revisit only after Part C clears the SEPARATES gate.

## ADR-013 — Generalized Library Architecture: Build the Library Collection on a Shared Template, Not Per-Library Clones
**Date:** 2026-07-10 · **Status:** Accepted

**Context.** The Green Library (#1) shipped as a standalone `public/` page (the standalone-static-page pattern itself is governed by ADR-007). A Wine/Food Library (#2) is identified and more are planned (Makers, History) — a *collection* of near-identical browse/search pages.

**Decision.** Libraries **#2 and beyond use a shared library template + a libraries registry + a unified `library_cards` / `library_tags` data model** (a `library` discriminator column), **NOT** per-library clones of the page and per-library tables.

**Rationale.** A collection of near-identical pages means N copies of the ribbon/search/chrome to hand-sync on every nav change (see the static-chrome hand-sync debt). Generalizing at instance #2 makes #3–N **data, not code**.

**Consequences.** Wine (#2) costs more than a clone would — once — to build the shared template + registry + unified model; every library after is nearly free (a registry row + a data seed). The existing Green Library page may be refactored onto the shared template when #2 is built. This ADR is about the **multi-library data model**; the standalone-static-page pattern itself is ADR-007. See `napaserve-session-2026-07-10.md`.

---

## ADR-014 — Self-Host the Protomaps Vector Basemap; No Third-Party Tile Account
**Date:** 2026-07-13 · **Status:** Accepted

**Context.** Both map explorers (`precinct-explorer.html`, `vineyard-explorer.html`) rendered their basemap directly from OpenStreetMap's community tile server (`tile.openstreetmap.org`), whose usage policy does not cover production/public traffic — the publication blocker PD-2026-07-07-01. Setting up a public `/maps` page (menu + footer + main-page links) is exactly the public launch that blocker holds. NapaServe is low-traffic and headed toward a foundation, so every hosted alternative (Stadia, MapTiler, Mapbox) would sit inside a free tier on cost — the deciding factor is not price but durability.

**Decision.** Self-host a **Protomaps vector basemap** rather than adopt any vendor tile account. A single Napa-County PMTiles extract is served as a static file at `economic-pulse-app/public/data/napa-basemap.pmtiles` and rendered with `protomaps-leaflet` (`flavor: "light"`). No API key, no per-request billing, no vendor that can withdraw access.

**Rationale.** The whole reason PD-2026-07-07-01 exists is that free community tiles "may be withdrawn at any point." Swapping to a keyed vendor trades one dependency for another with the same shape (account, key, monthly ceiling, someone else's server). Self-hosting a file removes the dependency entirely — the exact failure mode the blocker names. Low traffic makes cost a non-factor, so independence wins. Fits the ADR-007 standalone-`public/`-page model cleanly (the explorers are already outside the SPA). `protomaps-leaflet` keeps the existing Leaflet stack intact (all geoJSON overlays, popups, address search unchanged) — no rewrite to MapLibre.

**Consequences.**
- Basemap file is generated by `pipeline/build_napa_basemap.sh` (a bbox extract from the Protomaps daily planet build, `--maxzoom=15`). Must run on an open-network machine — the Cowork sandbox can't reach the Protomaps build servers. Tracked as PD-2026-07-13-02.
- `protomaps-leaflet` is officially in maintenance mode (Protomaps recommends MapLibre GL for new projects). Accepted: the explorers are Leaflet-native and the library works; revisit only if a future map is built fresh.
- The `.pmtiles` binary commits into `public/data/` (a few MB, county z15). If git-history bloat becomes a concern (cf. PD-2026-07-10-06), host the file on R2 / Vercel Blob and point the explorers' `url` at that CDN instead — the decision to self-host the *data* is unchanged either way.
- Resolves PD-2026-07-07-01 for both explorers. The Elected Seats / precinct map went public 2026-07-13 after Tuteur confirmed precinct→district currency (clears PD-2026-07-07-02). Its address search still uses OSM's Nominatim geocoder — a now-live production-policy follow-up (PD-2026-07-13-01).
- A live-diagnosed rendering trap: protomaps-leaflet's vector tiles otherwise stay stuck at `opacity: 0` (Leaflet's tile fade-in never completes for the canvas tiles), so the basemap renders fully but invisibly. Both maps set `fadeAnimation: false` on the `L.map`. See Cheatsheet.
- Basemap data is still OSM, so OSM attribution is preserved on both explorers and the `/maps` sources footnote. See Cheatsheet "Self-Hosted Protomaps Basemap" and `napaserve-session-2026-07-13.md`. Relates to ADR-007.

---

## ADR-015 — Shared Static-Page Chrome via `ns-chrome.js` + `ns-chrome.css`
**Date:** 2026-07-13 · **Status:** Accepted

**Context.** Standalone pages under `public/` (the two map explorers, the Green Library) render outside the React SPA and cannot import `NavBar.jsx` / `Footer.jsx`. The first such page (Green Library) hand-copied the nav + footer markup and styles — a replica that silently drifts when the app nav changes (logged as PD-2026-07-10-07). Adding two more static pages (the explorers) would have tripled that drift surface, and Tim explicitly wants "one change affects the whole site."

**Decision.** Static `public/` pages get their site chrome from two shared files — **`public/ns-chrome.css`** (styles) and **`public/ns-chrome.js`** (injects the nav + drawer + footer markup and wires the drawer toggle + newsletter). A page opts in with `<link rel="stylesheet" href="/ns-chrome.css">`, `<script defer src="/ns-chrome.js"></script>`, and marks its active item with `<body data-ns-current="/path">`. The nav/footer link lists live in `ns-chrome.js` (`NAV_GROUPS` / `FOOTER_COLS`), kept in sync with `NavBar.jsx` / `Footer.jsx`.

**Consequences.**
- One edit to `ns-chrome.js` updates the nav/footer on every static page. The Green Library, `vineyard-explorer.html` and `precinct-explorer.html` all consume it; the Green Library's inline replica and duplicate chrome CSS were removed. **Resolves PD-2026-07-10-07.**
- Two nav definitions still exist by necessity — `NavBar.jsx` (React pages) and `ns-chrome.js` (static pages) — because JSX can't run in a static page and the injector can't be imported into React. They must be hand-synced on nav changes; collapsing them to a single source needs a build step that generates both from shared data (future work).
- The injector runs after the map apps initialize and dispatches a `resize` event so Leaflet recomputes its size after the nav shifts the layout. Static pages remain an ADR-007 exception (own CSS, outside the SPA). See `napaserve-session-2026-07-13.md`.

---

## ADR-016 — EOS Doc Sync Is Automated in Cowork; Manual Drag-Drop Is the Fallback
**Date:** 2026-07-13 · **Status:** Accepted · **Amends** ADR-001 (step 4)

**Context.** ADR-001's EOS routine step 4 requires manually dragging updated canonical `.md` files into Project Knowledge (deleting the stale tile first) so claude.ai / Cowork reads current docs. In a **Cowork session attached to this project**, the assistant can read and write the Project directly (the Projects tool), which makes that manual upload unnecessary for docs the assistant updates in-session — first used this session (the maps EOS docs were written straight to the Project, no drag-drop).

**Decision.** In a Cowork session with Project access, canonical doc updates are written to **both** the repo `docs/*.md` (git-tracked) **and** the Project, in the same session. The ADR-001 manual drag-drop ritual becomes the **fallback** — used only when docs are edited outside such a session (plain Claude Code terminal, hand edits, or any surface without Project write access).

**Consequences.**
- **Repo (git HEAD) stays canonical** (ADR-001 unchanged on that point); the Project is the synced mirror. Still `git commit` the `docs/` changes — the automated sync writes the Project, not git.
- **Assistant-written Project docs land under the `claude/` namespace** (e.g. `claude/napaserve-session-YYYY-MM-DD.md`), distinct from user-uploaded docs at the Project root. Cosmetic only — `project_search` finds both. Updates to docs that already exist at the root replace them in place (so the cheatsheet / ledger / decisions stay at root; only net-new files land under `claude/`).
- The assistant replaces docs in place but does **not** auto-purge stale tiles; a periodic manual duplicate check stays prudent.
- Two copies to keep coherent (repo + Project); the assistant writes both in-session so they don't drift. If they ever disagree, the repo wins (ADR-001).

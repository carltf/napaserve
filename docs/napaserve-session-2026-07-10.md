# NapaServe — Session 2026-07-10: The Green Library ships end-to-end + Wine Library kickoff

A long, single-arc session that took **The Green Library** from a bare standalone page to a fully-built, wired, image-rich, native-feeling site section — then opened the **collection** by extracting the content for a second themed library (Wine). The Green Library is a new top-level surface under **Journalism**: a browsable, self-contained mini-index of the *Green Wednesday* series, living as a static page (`public/green-library.html`) outside the React app but now carrying the site's own nav + footer. Live at **https://www.napaserve.org/green-library.html** (GL-v2.3).

Data model: two CC-independent tables in the shared Supabase (`csenpchwxxepdvjebsrt`) — `green_library` (cards) + `green_library_tags` (ribbon). No React routes added; `App.jsx` / `vercel.json` untouched.

---

## What the Green Library is (architecture)

- **One static page** (`public/green-library.html` + `green-library.css` + `green-library/` assets) that self-renders a browsable collection from Supabase via an inline `<script>` (anon publishable key, anon-read RLS on `active=true`). Contrast with Under the Hood, which is per-article React routes.
- **Two card kinds:** *full-text* (`body_html` present) open an in-page reader at `#<slug>` (deep-linkable); *link-back* (`body_html` NULL, `substack_url` present) are `<a target="_blank" rel="noopener">` to Substack with a "Read on Substack ↗" footer.
- **Tag ribbon** built from `green_library_tags` (display_order), with a snapping slider + "fade by proximity" (cards whose nearest tag is one ribbon-stop away render at 35% opacity; ≥2 away hidden).
- Served correctly by Vercel because physical files in `dist/` win over the SPA rewrite (same precedent as `precinct-explorer.html` / `vineyard-explorer.html`).

## Content: Wave 1 (126 link-back cards)

Extracted from `nvf_posts where series = 'Green Wednesday'` (**63 posts**, not the 62 expected — flagged). The corpus had **three summary-block formats** (the spec anticipated only one): `In "TITLE," summary "quote" — Author` (C); `"TITLE" by Author, Org: … - Author` (B); and the earliest ~13 posts with no summary heading (A). Parser handled all three → **125 records + 1 recovered** (an unbalanced-quote title the parser skipped: `"Teaching Kids to 'Talk Trash'`) = **126 cards**.

- **Corrections pass** applied to the 126: deck truncation (strip reader-supported boilerplate / Share buttons / byline echoes / hand-off fragments), author-from-deck flips (special-case + verb-led, gated so it never overwrites a clean name with a role/surname), REVIEW-tag resolutions, and two new tags **history + geology** (bringing the ribbon to **10**). Author recoveries confirmed against parent-post PDFs (Joy Eldredge & Pat Costello; Linda Joshua; Kathleen Scavone; Cindy Watter — incl. correcting an interim Monarchs=Watter to **Monarchs = Scavone**).
- SQL generated for the user to run (not executed by the assistant): `docs/01_wave1_schema.sql` (adds `pull_quote`, drops `body_html` NOT NULL, inserts history/geology tags via `WHERE NOT EXISTS` — **no ON CONFLICT**), `docs/02_wave1_seed.sql` (126 plain INSERTs, deck/pull_quote dollar-quoted `$gl$`). Change-log at `docs/green-library-wave1-corrections.md`; review at `docs/green-library-wave1-review.md`.

## Page evolution (GL-v2.0 → v2.3)

- **v2.0** — link-back card rendering (two kinds), ribbon extended to 10 stops (history=`ti-clock`, geology=`ti-mountain`; slider max dynamic from tag count, not hardcoded), search upgraded to match pull_quote + tag slug/label across all 133.
- **v2.1** — "How to browse" explainer (fills the previously-empty vignette slot), **alphabetical** tag ribbon (client-side sort by label), and the **back-button fix** (see lessons).
- **v2.2** — **NapaServe site chrome**: a static replica of `NavBar.jsx` (wordmark + hamburger drawer, all 4 groups, Green Library marked current) + the full `Footer.jsx` (4 nav columns, Follow, working Newsletter signup) restyled to the page. Makes the standalone page feel native and navigable.
- **v2.3** — default landing tag → **Garden** (not the alphabetical-first Climate); Hub Journalism row goes **4-up** (no orphan card). Link-back cards kept new-tab by design.

## Images

- **Wave 2 (generic, quality-filtered):** matched 130 cards against the Green Wednesday image catalog CSV (694 images). `possible_article_topic` only covered the 3 launch articles, so Tier A was near-empty and everything fell to **Tier B** (tag→primary_subject representative). A **quality guardrail** kept only direct-subject matches and required an actual-animal check for wildlife (the catalog mis-classifies some people/landscape photos as Wildlife) → **7 dropped, 5 no-match**, 118 shipped. `docs/03_wave2_images.sql` (118 plain UPDATEs). The DB now has **only 3 pre-set launch heroes** (not the 7 the brief assumed) — flagged.
- **Optimization:** the 118 full-res heroes were **~314 MB**; `sips`-resized to max 1400 px @ q75 → **~50 MB (84% smaller)**, same filenames (no DB change).
- **Article-accurate pass (the big win):** each Green Wednesday post exposes a real lead image via **Substack `og:image`**. Filled the **12 placeholder** cards (all different posts, no dup) and upgraded the **58 lead cards** to their post's own photo (obsidian blade, a Napa monarch, etc.). Overwriting same filenames = **no DB change** for the 58; only the 12 need `docs/04_placeholders_fill.sql`. Net: **70 of 126 link-back cards now article-accurate**; the ~56 second-cards keep distinct generics (per-article extraction for those is deferred).

## Nav wiring (Green into the site)

Wired into all four surfaces under **Journalism** (per the user's choice): `NavBar.jsx` (extended `go()` to hard-navigate any `.html` target — future-proofs all static libraries), `Footer.jsx`, `napaserve-hub.jsx` (a LIVE card), `napaserve-about.jsx` (Tools list + "Start with a question"). Archive already had a "Green Wednesday" series chip as a natural cross-link.

## The Libraries collection + Wine Phase 1

Framed the Green Library as the first of a **collection of themed libraries** (distinct from Under the Hood: UTH = "we did the analysis" per-article; a Library = "a curated shelf on a theme"). User picked **Food & Wine** as #2.

**Content source found:** `nvf_posts where series = 'Wine Chronicles'` = **73 posts** — the wine equivalent of Green Wednesday, but **single-article posts** (1 card each, simpler; card slug = post slug). **Phase 1 extraction done** (read-only) → `docs/wine-library-wave1-review.md`: 73 cards, decks from the `Summary:` line or the article lead, proposed **8-stop wine ribbon** (cabernet · varietals · terroir · winemaking · tasting · market · history · sustainability), only 3 REVIEW-tag cards left. **Author rule (per Tim):** the 44 "Dan Berger's Wine Chronicles" titles → Dan Berger; the other **29** "Wine Chronicles:" titles are **often Tim Carl's** and should carry his byline (not blank).

---

## Open items / pending

- **RUN `docs/04_placeholders_fill.sql`** (12 UPDATEs) to wire the 12 placeholder heroes — images are deployed; column still null until run.
- Wine Library **Phases 2–6**: architecture decision (**generalize into a shared template + `LIBRARIES` registry + unified `library_cards`/`library_tags` model, vs clone-for-Wine** — recommend generalize), schema + seed (73 cards + 8 tags, author = Dan Berger / Tim Carl split), og:image heroes, nav wiring, correct the 3 REVIEW tags.
- **56 second-cards** on the Green Library still carry generic Tier-B images (per-article image extraction from post bodies is the deferred fix).
- Static-page **site-chrome is a hand-maintained replica** of `NavBar.jsx`/`Footer.jsx` — must be re-synced by hand if the app nav changes (both files carry "keep in sync" comments). Factor into a shared snippet when Wine lands.

## Commits (main)

`b62f067` GL-v1.0 · `30e868f` v1.1 (Tabler icons) · `b02714c` Wave 1 / v2.0 · `143821c` Wave 2 images · `24c336e` v2.1 · `777b64b` nav wiring · `63e5f96` image optimization · `812b6fc` v2.2 chrome · `f173511` v2.3 · `d1f6cd6` 12 placeholders · `fc4e783` 58 article-accurate. No DB writes by the assistant all session (all SQL handed off for the user to run).

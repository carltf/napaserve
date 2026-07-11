# NapaServe — Session 2026-07-10: Green Library Shipped (GL-v2.3) + Wave 1/2 Data & Images

New reader-facing feature built end to end: **the Green Library** (`napaserve.org/green-library.html`), a tag-ribbon browse/search surface for the environmental (Green Wednesday, UC Master Gardener, climate) back catalog. Went from nonexistent to **live at GL-v2.3 with 133 articles** in one session. Also: two image catalogs organized (Green Wednesday applied; full NVF archive built via Codex, under remediation), a launch roundup article drafted and a key architecture decision for the forthcoming library *collection*.

Two-tool session: **Claude Code** owns repo/DB/git and the image work; **Codex** used once for photo cataloging only. All DB writes ran through the Supabase SQL Editor by Tim; Claude Code generated but never executed SQL.

---

## What shipped

**Green Library page** — standalone `economic-pulse-app/public/green-library.html` + `green-library.css` (ADR-007 standalone-page pattern; no SPA/React entanglement). Version arc this session: **v1.0** (launch page, 7 full-text articles) → **v1.1** (emoji → self-hosted Tabler outline icons) → **v2.0** (Wave 1: 126 link-back cards, History + Geology tags, upgraded search) → **v2.3** (images: 133/133 heroes, 70 article-accurate).

Signature interaction: a **tag ribbon** — pills + a snapping slider kept in sync — with **distance-based card fade** (active tag = full opacity; one stop away = 35% + scale 0.95; ≥2 = hidden). Articles carry multiple tags and appear at every relevant stop; the faded-neighbor bleed keeps thin stops (e.g. Shade, Geology) from dead-ending. Per-tag `.gl-tag-vignette` slots reserved (empty) for future drop-in art.

**Two card kinds:**
- **Full-text** (`body_html` present, 7 launch articles): in-page reader, `history.pushState` → `#<slug>`, cold-load hash routing (Substack deep-link targets work on first paint).
- **Link-back** (`body_html` NULL, 126 GW cards): `<a target=_blank rel=noopener>` to `substack_url` + a "Read on Substack ↗" footer cue.

**Search:** client-side across title + deck + author/author_note + pull_quote + tags, all 133 records (trivial in-browser at this scale). Browse-all toggle retained. This is the immediate-tier search; semantic search (Voyage-3 + pgvector, the KB-3 RAG item) remains the deferred Phase 3, with the Green Library as its intended first shipped slice.

---

## Data model

**Two Supabase tables** (project `csenpchwxxepdvjebsrt`), both anon-read RLS on `active = true`, service-role writes only:

- `green_library` — slug, title, author, author_note, deck, body_html (nullable), hero_image_url, photo_credit, pull_quote, tags (text[]), source, substack_url, publish_date, active. GIN index on tags.
- `green_library_tags` — slug, label, display_order, icon, active. **10 tags** in ribbon order: garden, shade, vineyards, water-wetlands, wildlife, forests, recycling, climate, **history (order 9, icon ti-clock)**, **geology (order 10, icon ti-mountain)**. History + Geology added this session for Indigenous/local/deep-time and rock/fossil pieces that don't fit the eight nature tags.

**SQL files run (Supabase SQL Editor, by Tim):**
- `01_wave1_schema.sql` — add pull_quote; body_html drop not null; insert history + geology tags (explicit WHERE NOT EXISTS, no ON CONFLICT per house rule).
- `02_wave1_seed.sql` — 126 link-back cards.
- `03_wave2_images.sql` — 118 quality-filtered generic hero assignments.
- `04_placeholders_fill.sql` — 12 remaining heroes → 133/133 cards have `hero_image_url`.

Final verify: **133 total (7 full-text + 126 link-back), 10 tags.**

---

## Wave 1 — text extraction (the 126 cards)

Source: `nvf_posts where series = 'Green Wednesday'` — **63 posts** (not 62; the extra is a legitimate post, not a dup). Each GW post carries **two articles** (a garden piece + a climate/nature piece), so 63 posts → ~126 sub-article cards. Card titles come from the **summary block's `In "..."` titles**, NOT the post headline (the headline is a shortened marketing version; they differ).

**Three-format parser** (the corpus evolved over the run):
- **Format C** (~24 recent posts): `In "TITLE," summary "quote" — Author`.
- **Format B** (~24 mid posts): `"TITLE" by Author, Org: summary "quote" - Author` (no "In" prefix; author + role from the "by Author, Org:" clause).
- **Format A** (~13 earliest, 2024-09 → 2025-01): no "Summary of Today's Stories" heading; inline `"TITLE" by Author, Org:` intro pairs, no pull quote.

**Parser lesson:** the "first standalone Share" boundary is unreliable — Substack embeds Share buttons *between* summary pairs. Bounded the summary block at the first **"NAPA VALLEY, Calif." dateline** instead.

**Corrections pass (supervised, via Claude Code, change-log at `green-library-wave1-corrections.md`):**
- **Author-from-deck rule:** when the deck opens "[Name] verb…" and disagrees with the parsed author field, the deck name is the writer (the parsed field often caught a *quoted source* or an org from the pull-quote attribution). **9 author flips**, each on a printed flip-list Tim approved. Two contributor-to-contributor flips were confirmed against parent-post PDFs before locking (Green Lodging → McElroy not the quoted GM Toomer; Make New Friends → Watter not the profiled subject Pawl). This also cleaned up spurious "Napa Climate NOW!" / "Joelle Gallagher" attributions — Gallagher is a supervisor being quoted; Napa Climate NOW! is Chris Benz's org.
- **Deck truncation:** 15 decks had parser spill (next headline/byline/boilerplate); truncated at reader-supported boilerplate / Share / byline patterns.
- **5 REVIEW-tag rows** hand-resolved (Historic Floods → history+water; Earth Day → climate+wildlife; Napa Obsidian → geology+history; RLS Museum → history; Storing Dahlias → garden).
- **Amaryllis record recovered:** one post yielded 1 not 2 — the 2nd title had unbalanced quotes in source (`Teaching Kids to 'Talk Trash'` — straight double-open, single-close). Re-pulled, hand-extracted (Chris Benz, recycling+climate).
- **4 author_missing resolved from parent-post PDFs:** What Would Happen If You Had No Water? → Joy Eldredge and Pat Costello; Frog in the Hose Hideaway → Linda Joshua; Monarchs and the Magic of Milkweed → **Kathleen Scavone** (NOT Watter — Claude Code caught the summary attribution, PDF confirmed); Pay Close Attention to Poisonous Plants → Cindy Watter. **Final: 0 author_missing.**

Card slugs = `parent_slug` + slugified `sub_title` (unique across 126, no collisions).

---

## Wave 2 — images (133/133 heroes)

Source: the **Green Wednesday image catalog** (694 images, Codex-built, at `~/Desktop/green-library-package/catalog-output/green-wednesday-image-catalog.csv`) — chosen over the full NVF archive because it's *from the GW series*, so it maps to these cards directly.

**Tiered matching, then a better source found:**
- The catalog's `possible_article_topic` was populated for only 3 topics / 37 images (launch articles), so Tier-A (article's own photo) could not reach the 126 link-back cards via the catalog. Initial pass → 118 generic Tier-B subject-matched heroes, quality-filtered (dropped actively-wrong-subject matches back to placeholder rather than ship a misleading photo).
- **Then Claude Code found the right source:** each Substack post's **`og:image` IS the article's lead photo.** Fetched those directly → **70 of 126 link-back cards now use their post's actual photo** (obsidian blade, Napa monarch, etc.), not a generic. The remaining ~56 are the *second* card of two-article posts, kept on-subject generics — **og:image = the post LEAD, so only the lead card gets it; never duplicate the og:image within a post.** (New locked rule.)
- Images optimized **314MB → 50MB** (sips, max 1400px).
- Credit: catalog had no credit column, so `photo_credit` defaults to "Napa Valley Features"; the linked article caption is authoritative (Tim's call — don't gate on per-image credit for the Library since every card links to its captioned source).

**Rendered-verified live in Chrome (GL-v2.3, production URL):** 133 heroes in DOM, 0 broken; 10 ribbon stops incl. History + Geology, slider max dynamic (=9); 129 link-back cards as new-tab Substack links + "Read on Substack" cue; cold-load `#nbfip-forest-program` opens on first paint with Aug. 5 deadline intact; search "salmon" → 8 matches; mobile 420px no overflow.

---

## Launch roundup article (drafted, pending schedule)

`green-library-launch-roundup.md` — 824 words, AP-clean (% symbol, no Oxford commas, verified). Introduces the Green Library as a feature (accurate timeline: coverage since the 2023 launch, Green Wednesday as the recent weekly format) then the 7 full-text launch pieces, each with a **real pull quote pulled from the article text** (not invented) and a deep link into its NapaServe card. NBFIP leads on the **Aug. 5 application deadline** as the urgency hook. Benz name set to Christina "Chris" Benz on first reference (same person as contributor Chris Benz; goes by Chris — confirmed by Tim). **Pending:** schedule for publication (this/next Wednesday keeps the NBFIP deadline live).

---

## Image catalogs (infrastructure)

- **Green Wednesday catalog (694 images):** DONE, applied to the Green Library. Path above.
- **Full NVF archive catalog (~3,729 files):** built via Codex from `~/Library/Mobile Documents/com~apple~CloudDocs/Napa Valley Features/Photos`, ~99% Tim's own photos. Under a `/review`-driven remediation loop before it's trusted: (1) visual-duplicate detection was over-flagging 2,998/3,729 — fix uses the computed dHash with a real distance threshold instead of folder+aspect+size; (2) credit defaults to Tim Carl at ~70% confidence but **defaults to Unknown the moment a filename/folder names an outside person/org**, with creator_name / source_organization / credit_line as **separate fields** (assembled per-platform at display, not baked — since these feed Green, Under the Hood, Makers, etc.); (3) disk-space safeguard hardened (placeholder st_size reads 0). Destined for a future Supabase `image_library` table for cross-page photo pulls. **This is future infrastructure, not on the Green Library critical path.**

---

## Decisions + debt this session

- **ADR (new): Generalized Library Architecture.** The forthcoming Wine/Food Library (#2) — and every library after — is built as a **shared library template + a libraries registry + unified `library_cards` / `library_tags` model**, NOT a clone of the Green Library. Rationale: this is now clearly a *collection* of themed libraries (Green #1, Food & Wine #2, more coming: Makers, History, etc.). Cloning the second means N copies of ribbon/search/chrome to hand-sync on every nav change (already flagged as a maintenance liability). Generalize at instance #2 so #3–N are *data*, not *code*. Cost paid once; every subsequent library is nearly free.

- **Cheatsheet lessons (new):**
  - **og:image = post LEAD photo → lead card only; never duplicate within a two-article post.**
  - **Three-format GW summary parser** (A/B/C) + the **"NAPA VALLEY, Calif." dateline** as the reliable summary-block boundary (Substack Share buttons break the naive "first Share" boundary).
  - **Author-from-deck rule** for GW summary parsing: the deck's "[Name] verb" is the writer; the pull-quote attribution often names a *quoted source*, not the author.
  - **Two-catalog distinction:** GW catalog (series-scoped, for the Green Library) vs full NVF archive catalog (for UTH/Makers/etc.).

- **Debt (new):** woff2 subsetting (Tabler full set 784KB → the ~10 glyphs actually used); 56 link-back cards on generic images pending an article-accurate pass (the og:image approach could be extended, or the GW catalog's `possible_article_topic` back-filled); ~5 no-match cards (thin climate/recycling photo pools) needing manual images; full-NVF-catalog remediation completion + eventual `image_library` migration.

- **Debt (progress):** the Green Library back-catalog migration (was a horizon item) is **substantially advanced** — the Green Wednesday portion is live. Pre-GW Master Gardener/nature standalones remain a future wave (semi-automatable via existing Voyage-3 embeddings).

---

## Open threads for next session

1. **Schedule the launch roundup** (ahead of NBFIP Aug. 5).
2. **Wine/Food Library (#2)** — build GENERALIZED per the new ADR. Phase-1 extraction already scoped: 73 Wine Chronicles cards, 8-stop ribbon; author rule needs an eyeball (44 "Dan Berger's Wine Chronicles" → Dan Berger; ~29 bare "Wine Chronicles:" are often Tim's own byline — per-title check like the GW flips).
3. **Article-accurate images for the remaining 56** link-back cards.
4. **Per-tag vignette art** — drop-in slots reserved, empty.
5. **woff2 subsetting.**
6. Full-NVF-catalog remediation → `image_library` table (for UTH/Makers image pulls).

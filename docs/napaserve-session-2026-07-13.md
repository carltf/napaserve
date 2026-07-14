# Session 2026-07-13 — Maps Page, Self-Hosted Basemap, Shared Static Chrome

Long working session (in Cowork, editing the repo live via the device bridge, verifying in Tim's Chrome). Net result: a `/maps` page, both map explorers on a self-hosted Protomaps basemap and standard site chrome, both maps **LIVE**, and the static-page chrome factored into one shared source. Code deployed by Tim; EOS docs updated to match.

## Shipped

### `/maps` landing page
- `economic-pulse-app/src/napaserve-maps.jsx` — React route `/maps`, hub-styled, reuses the shared React `NavBar`/`Footer`. Two cards: **Vineyard Explorer** and **Elected Seats Atlas**, both live, each linking to its standalone explorer. Decision-focused intro (Tim's steer — no build/plumbing language); vineyard card notes 2025/2026 data is coming. Route added in `App.jsx`. Card grid via `.maps-grid` CSS class + mobile `@media`.
- Wired into: `NavBar.jsx` (Intelligence group), `Footer.jsx` (Intelligence column), `sitemap.xml` (`/maps`), and a balanced two-card **Maps** section on `napaserve-hub.jsx`.

### Self-hosted Protomaps basemap (resolves PD-2026-07-07-01, ADR-014)
- Both explorers: `L.tileLayer(tile.openstreetmap.org…)` → `protomapsL.leafletLayer({ url: "/data/napa-basemap.pmtiles", flavor: "light", lang: "en", attribution })`. `protomaps-leaflet@5` from unpkg; existing Leaflet overlays / popups / compare mode / address search untouched. `maxZoom: 19` for street-level over-zoom of the z15 tiles.
- **`pipeline/build_napa_basemap.sh`** — extracts a Napa bbox (`-122.70,38.10,-122.00,38.90`, maxzoom 15) from the Protomaps daily build. Must run on an open-network machine (the Cowork sandbox can't reach `build.protomaps.com`). Tim ran it: source `20260713`, 25 MB, tile type mvt, "Protomaps Basemap" schema → `public/data/napa-basemap.pmtiles`.
- Version bumps: vineyard-explorer **v0.3**, precinct-explorer **v0.11**.

### The `fadeAnimation` trap (LOCKED lesson)
The basemap first rendered **invisibly**: tiles fetched (HTTP 206), zero console errors, tile canvases painted — but each tile carried `opacity: 0` because Leaflet's tile fade-in never completes for protomaps-leaflet's canvas tiles. Diagnosed live by reading tile-canvas pixel opacity in the console (schema matched, paint rules present, colours real — just invisible). Fix: **`fadeAnimation: false`** on `L.map(...)` for both maps. Symptom signature to remember: overlay visible, basemap blank, no errors → it's tile opacity, not the data. In the Cheatsheet.

### Shared static-page chrome (resolves PD-2026-07-10-07, ADR-015)
- New `public/ns-chrome.css` (styles) + `public/ns-chrome.js` (injects nav + drawer + footer, wires the drawer toggle + newsletter, marks the active item via `data-ns-current`). One place to edit static-page nav/footer.
- Both explorers and the **Green Library** now consume it. Green Library migrated off its inline replica: removed the inline nav/footer/chrome-JS from `green-library.html` (25.3 KB → 18.4 KB) and the duplicate chrome CSS from `green-library.css` (294 → 230 lines). Injector dispatches a `resize` so Leaflet recomputes after the nav shifts the layout; full-height map pages set `#app { height: calc(100vh - 52px) }`.
- Residual (noted in ADR-015): `NavBar.jsx` (React) and `ns-chrome.js` (static) are two nav definitions to hand-sync — truly one source needs a build step.

### Election map un-gated (resolves PD-2026-07-07-02)
Tim: Tuteur already reviewed the precinct map and OK'd it; waiting on newer data is a refresh, not a validity gate. The map reads live county GIS geography only — NOT the RLS-locked `napa_elected_seats` roster — so ADR-010 / the seat-verification pass (PD-2026-07-08-01) don't apply. Un-gated: "demo / not for publication" language removed from `precinct-explorer.html`; Elected Seats card is LIVE on `/maps` and the hub, linked to `/precinct-explorer.html`.

## Verified live (Tim's Chrome, localhost:5173)
`/maps` (both cards), vineyard + precinct basemaps rendering after the fadeAnimation fix, the shared nav drawer (with "Maps & Atlases" marked current), and the shared footer with working newsletter form. Precinct map with basemap + colored precincts. All clean.

## Decisions recorded
- **ADR-014** — self-host the Protomaps basemap; no third-party tile account.
- **ADR-015** — shared static-page chrome via `ns-chrome.js` + `ns-chrome.css`.

## Debt resolved / open
- **Resolved:** PD-2026-07-07-01 (OSM tiles), PD-2026-07-07-02 (Tuteur), PD-2026-07-10-07 (static chrome hand-sync), PD-2026-07-13-02 (basemap file generated + verified).
- **Open:** PD-2026-07-13-01 — precinct address search still uses OSM Nominatim; now a live-site follow-up (flip to Census-first). Low severity.

## Process / handoff notes
- Files were written straight into the working tree via the bridge (Tim didn't need the downloads/zip). Stage with explicit paths — the tree carries unrelated uncommitted work (`napaserve-calculators.jsx`, `docs/napaserve-eos-checklist.md`, `.DS_Store`, many `.bak`/image/spike files); never `git add -A`.
- Deploy commit staged: the maps files + `ns-chrome.css/.js` + `green-library.*` + `napa-basemap.pmtiles` + `build_napa_basemap.sh`. Docs held for a separate commit after this EOS refresh.
- `zsh` paste trap recurred: an inline `# comment` with an apostrophe ("don't") put the shell in a `quote>` state (interactive zsh doesn't treat `#` as a comment). Give paste-ready commands with no inline comments.
- `.pmtiles` is 25 MB in `public/data/` — one-time binary add; move to R2 if history bloat matters (cf. PD-2026-07-10-06).

*End of 2026-07-13 session record — Valley Works Collaborative*

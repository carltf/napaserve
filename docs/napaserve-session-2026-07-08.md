# NapaServe — Session 2026-07-08: Sentinel-2 NDVI Spike Verdict + Vineyard-Explorer v0.2

Second session of the vineyard arc (see `napaserve-session-2026-07-07-vineyard.md` for v0.1/v0.1.1 and spikes #1–2). This one closed out the satellite feasibility question with **Spike #3 (Sentinel-2 NDVI, Parts A + B)** and shipped **vineyard-explorer v0.2** (compare-mode diff highlighting). No DB writes; one committed page + two new pipeline scripts + one data asset.

---

## Spike #3 Part A — Sentinel-2 NDVI plumbing: VALIDATED

Proved we can compute per-field NDVI for Napa vineyard footprints from free Sentinel-2 L2A on this laptop, end to end.

- **Imagery access:** Earth Search STAC v1 (`https://earth-search.aws.element84.com/v1`), collection `sentinel-2-l2a` over AWS open data — no auth. Both windows had abundant clear coverage: 45 scenes (2024-07-01..08-31) and 26 scenes (2026-06-01..07-07) under 20% cloud, many at 0.0%. Assets `red` (B04) / `nir` (B08), 10 m COGs, UTM zone 10N (EPSG:32610).
- **Compute:** windowed `rasterio` reads of the red/NIR COGs clipped to each field polygon (polygon reprojected to scene CRS), least-cloudy covering scene per window, mean NDVI per field.
- **SCALING GUARD (the Part A catch):** the item-level STAC `raster:bands` metadata declares `offset: -0.1` (BOA add-offset), but applying it drives red reflectance negative over vegetation (red DN ~600–900, below the 1000 floor an offset-encoded pixel needs) and blows NDVI past +2. The metadata is self-contradictory — the **collection** default declares `offset: 0`. Fix: compute NDVI straight from **raw DN** (the scale factor cancels in the ratio; no additive offset), which is also inherently bounded to [−1, 1]. Added a hard guard that flags any |NDVI| > 1 as a scaling bug.
- **Sanity:** 40 field-window values landed in [0.23, 0.77], **controls median ~0.42**, 68% inside the 0.4–0.8 active-vineyard band. Runtime ~250 ms/field/window → ~93 min single-threaded for all 10,990 fields × 2 windows (laptop-hours; trivially parallelizable by scene).
- **Provenance note:** there is **no pre-simplification GeoJSON on disk** — the shipped TopoJSON is the mapshaper-simplified artifact; its true ancestor is the DWR/Land IQ REST layer (spike #2). Confirmed: SUM count 10,990 == 2024 TopoJSON feature count.

Script: `pipeline/spike_s2_ndvi.py`.

---

## Spike #3 Part B — ground-truth separation test: MUSH (robust)

Tested whether single-field NDVI delta separates Tim's 9 field-verified removals (pulled 2025/2026) from presumed-active vineyard. Verdict is **MUSH**, and it is **structural, not a window artifact**.

- **Matching:** all **9/9 removal points landed *inside* a 2024 vineyard polygon at distance 0** — no fallbacks, no NO_MATCH. Matching logic and coordinates are sound.
- **Group means DO separate:** controls delta **+0.042** (σ 0.139) vs removals **−0.112** (σ 0.093), a ~0.15 gap. Signal exists at the group level.
- **But single-field separation is weak:** the control delta distribution has a fat negative tail, dragging its 10th percentile to −0.115; only **3/9 removals (R1, R4, R8) cleared that bar** (threshold for SEPARATES was 7/9). Per-field NDVI on 2–15 ac fields is just noisy (mixed 10 m pixels, cover crop, irrigation/inter-row timing).
- **Phenology hypothesis tested and rejected:** a DOY-matched rerun (Jun-2024 vs Jun-2026, replacing the spec's Aug-2024 baseline) barely moved anything (control σ 0.139 → 0.122), still 3/9, still MUSH. So matching the seasons does **not** rescue it.
- **Why the failures fail (explainable, not random):** the three cleanly-separating removals (R1 −0.14, R4 −0.22, R8 −0.26) are **completed** removals that collapsed to 0.18–0.33 — signal works when a removal is finished before the imagery. The non-movers (R5 +0.002, R7 −0.012, R6 −0.06) are **censored**: pulled after our 2026 window closes (Jul 7, day before this session), so they still show live canopy and physically cannot separate yet.

Scripts: `pipeline/spike_s2_ndvi_partB.py` (reuses Part A plumbing). Data: `pipeline/data/s2_groundtruth.UNVALIDATED.csv` (34 rows: 9 removals + 25 controls, NDVI both windows, scene dates, deltas, flags).

---

## Ground-truth resolution — R3 and R9 are OFF the September list

Two removals tripped Part B's aliveness guard (`ndvi_2024` below the alive floor). Cross-checking in-page point-in-polygon across all vintages + the NDVI history resolved them **off** the clean ground-truth list:

- **R3** — bare by Aug 2024 (NDVI **0.187**); mapped as a vineyard in 2020–2022 and 2024-provisional. Its 2023 "gap" is a **TopoJSON-simplification artifact**, not a real removal year (see Cheatsheet). Read as a **staged/earlier** removal than recalled.
- **R9** — mid-transition at NDVI **0.33** on 27.6 ac; not a clean alive-2024 baseline.

Both are likely **staged or earlier removals than recalled**. That leaves **7 clean removals** (R1, R2, R4, R5, R6, R7, R8) for a future Part C — all carried in `s2_groundtruth.UNVALIDATED.csv`.

**Standing habit going forward:** log the **DATE** whenever we learn of any vineyard pull — per-removal dates are the single biggest missing input (they resolve the censoring problem).

---

## vineyard-explorer v0.2 — shipped (commit `238bb37`)

Compare-mode per-field add/remove highlighting between vintages. Diffs precomputed **offline** so the browser never matches ~10k × 10k polygons.

- **Diff pipeline** `pipeline/build_vintage_diffs.py`: matches on the **pre-simplification DWR/Land IQ source polygons** (not the shipped TopoJSON), keyed to TopoJSON feature order. **IoU 0.30**, sensitivity-checked on 2023→2024 first (smooth, monotonic 0.10–0.50: 154/366 → 206/487). IoU computed directly in WGS84 (affine-invariant, so the lon/lat→meters scaling cancels). STRtree bbox index → ~O(n).
- **Alignment is verified, not assumed:** a self-verifying greedy **acres-walk** maps each TopoJSON feature to its source polygon and **aborts loudly** on any real skew (a dropped non-trivial-acreage poly, or a TopoJSON feature with no source match). Caught live drift — see the editorial/debt note.
- **Output** `public/data/vineyard-diffs.json` (28.7 KB, 5 pairs). Per-pair removed/added: **2020→21 474/446 · 21→22 258/855 · 22→23 273/523 · 23→24 175/417 · 2020→24 span 507/1551**.
- **Compare-mode UI:** neutral gold = mapped in both years; **brick `#8B3A2C`** = not mapped in the later year (possible removal); **sage `#93AE63`** = newly mapped (possible new planting). Brick dark / sage light — differentiated in **lightness** as well as hue for deuteranopia. Three-row legend with dynamic year placeholders and "possible removal / possible new planting" wording (never flat claims), verbatim drift caveat ("Directional, not parcel-proof"), non-adjacent pairs (other than the span) disabled with a note, popup **"Mapped in \<A\>, not mapped in \<B\> — X.XX acres"**. Snapshot mode keeps its own one-row mini-legend. `<title>` version dropped (resolves PD-2026-07-07-03); all version strings → v0.2. Compare Years widget and its official numbers unchanged.
- **Rendered-verified live in Chrome:** snapshot ✓, compare overlay ✓, dynamic legend ✓, adjacent recalc (175/417) ✓, span (507/1551) ✓, invalid-pair disable + note ✓, per-pair console log format ✓, **zero console errors**, toggle-off returns to snapshot ✓. Live check: footer `vineyard-explorer v0.2`, title without version, diff.json 200.

Commit `238bb37` — 3 explicit paths (page + diff JSON + pipeline script); no SPA, no DB.

---

## Editorial trap (LOCKED for this product)

The span diff shows **"1,551 newly mapped"** 2020→2024. This is **mostly Land IQ densification** (the mapped footprint grew 9,780 → 10,990 fields), **NOT net planting** — official NASS/CDFA acreage is flat-to-down over the same span (45,511 → 45,094). **Never quote diff counts as planting/removal totals.** Directional, not parcel-proof (ADR-009 discipline; the new three-bin standard, ADR-011).

---

## Decisions + debt recorded this session

- **ADR-011** — three-bin display standard for derived layers (active / signal-lost / uncertain, always explicit).
- **ADR-012** — 2026 provisional NDVI layer DEFERRED to ~Sept 2026 (not killed); gate = a Part C rerun must return SEPARATES first.
- **PD-2026-07-08-02** — frozen TopoJSON vs live DWR REST drift (2021 gained a 0.0-ac sliver post-freeze); acres-walk guard halts on real drift; fold layer-count watching into the new-vintage detector.
- **PD-2026-07-08-03** — 2026 provisional layer deferred to Sept Part C.

(Ledger note: the vineyard entries are numbered **-02/-03** because `PD-2026-07-08-01` was already claimed by the elected-seats verification debt earlier the same day.)

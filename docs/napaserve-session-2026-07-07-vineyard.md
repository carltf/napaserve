# Session 2026-07-07 (evening) — Vineyard Explorer arc

Second session of the day (see `napaserve-session-2026-07-07.md` for the morning Elected Seats Atlas launch). This one: feasibility spikes for a Napa vineyard-acreage mapping product, then a shipped unlisted demo.

## The question
Can satellite/GIS crop data track Napa County vineyard acreage closely enough to build a public map + change-detection product on? Answered in two spikes, then a demo.

## Spike 1 — USDA CDL (Cropland Data Layer): FAILED as a foundation
- Source: NASS CropScape `GetCDLStat` stats service (FIPS 06055, category 69 = Grapes). Two-step: request returns a `returnURL` to a cached CSV.
- Script: `pipeline/spike_cdl_vineyard_acreage.py` → `pipeline/data/cdl_napa_grapes.UNVALIDATED.csv` (2007–2025).
- **Verdict: unusable for acreage.** Three failure modes:
  1. Pre-2012 is garbage — 2011 returned **307 acres** (Napa is ~45k); early CA CDL had no reliable grape class.
  2. Even 2012+ swings **±20–40% year-over-year** (classification noise, not real change; Napa moves ~1–2%/yr).
  3. The removal signal points the **wrong way**: CDL shows 2020→2025 **+39%** (+13.5k ac) while reality is flat-to-declining.
- Contrast with official: CDL noise floor is bigger than the thing we'd be measuring. Disqualified as primary series.

## Spike 2 — Land IQ / DWR Statewide Crop Mapping: better levels, but UNSTABLE trend
- Source: CA Natural Resources CKAN package `statewide-crop-mapping` (data.cnra.ca.gov). Vintages 2014, 2016, 2018, 2019, 2020–2024.
- **2020–2024 expose queryable ArcGIS MapServer REST endpoints** → server-side `SUM(ACRES)` for Napa vineyard with **zero geometry download**. 2014/2016/2018/2019 are download-only (no hosted service).
- Crop-class field varies by vintage (inspected, not assumed): `SYMB_CLASS='V'` for 2020–2024 (== `MAIN_CROP 'V'`; `CLASS1`/`CROPTYP1` are `**`/`****` placeholders); 2014 shapefile uses `DWR_Standa` startswith `'V'` (== `Crop2014 'Grapes'`). County field is `COUNTY='Napa'`.
- Scripts: `pipeline/spike_landiq_vineyard_acreage.py` (REST 2020–2024 + 2014 shapefile via geopandas/pyogrio), `pipeline/spike_landiq_validation.py` (NASS Grape Acreage Report PDF parser). CSV `pipeline/data/landiq_napa_grapes.UNVALIDATED.csv`.
- Land IQ mapped totals (whole acres): 2020 44,730 · 2021 44,554 · 2022 45,903 · 2023 46,244 · 2024 46,749. Levels land in the sane 44–47k window and move realistically (−0.4% to +3.0%/yr) — night-and-day vs CDL.

### Validation follow-up — the offset is UNSTABLE (the key finding)
Compared Land IQ to official NASS/CDFA Napa **total standing acreage** (Grape Acreage Report, table titled "ALL WINE TYPE GRAPES: Acreage standing by county, by year planted" — TABLE 10 in 2020/2021, TABLE 8 in 2022+; matched on title, not number). Parser takes the last four numbers of the Napa row (bearing, non-bearing, total, prior-year total — the final number is a trap) and self-validates bearing+non-bearing=total; cross-year chain checks out (each report's prior column == previous report's total).

| Year | Land IQ | Official total (bearing / non-bearing) | delta |
|---|---|---|---|
| 2020 | 44,730 | 45,511 (43,521 / 1,990) | **−1.7%** |
| 2021 | 44,554 | 45,460 (43,650 / 1,810) | **−2.0%** |
| 2022 | 45,903 | 45,612 (43,769 / 1,843) | **+0.6%** |
| 2023 | 46,244 | 45,483 (43,958 / 1,524) | **+1.7%** |
| 2024 | 46,749 | 45,094 (43,524 / 1,570) | **+3.7%** |

(2024 parse independently reproduced the 45,094 anchor. 2025 official = 44,475 has no Land IQ counterpart yet.)

**Verdict: UNSTABLE.** Delta drifts monotonically −2.0% → +3.7% (5.66-point spread), not a fixed footnotable offset. The series **scissor apart**: official is flat-to-declining (~45.5k → 45.1k), Land IQ rises +4.5% (44.7k → 46.7k). For change-detection this is the dangerous failure — Land IQ would fake ~2,000 ac of growth while the record shows a slight decline. → drove ADR-009.

## Shipped — vineyard-explorer v0.1 then v0.1.1 (unlisted demo)
Standalone page `economic-pulse-app/public/vineyard-explorer.html` (follows precinct-explorer pattern; not part of the SPA). Live at **https://napaserve.org/vineyard-explorer.html** — no menu link, no announcement.

- **v0.1** (commit `2ba621e`): year-toggle Leaflet map of Napa vineyard field polygons, vintages 2020–2024, snapshot viewer (no map diff yet). Official NASS/CDFA county acreage shown per year; summed polygon acres deliberately NOT surfaced. Popup = mapped acres + vintage. Cream palette, mobile @760px, sandbox-safe fetch.
- **v0.1.1** (commit `547f3a7`): sidebar "Compare Years" widget — From/To selects, primary official-change row (number of record), amber caution block for mapped-footprint change + field-count change + fixed drift caveat. Pure client-side math on hardcoded validated values; independent of displayed vintage.

### Architecture — TopoJSON static assets
Payload feasibility (STEP 0): 2023 raw GeoJSON = 6.35 MB → live-fetch ruled out → **static-asset**. Simplified GeoJSON (mapshaper 10% retention, keep-shapes, 5-dec) was 2.05–2.30 MB/year — **over the 1.5 MB budget**. Switched to **TopoJSON** (arcs shared between adjacent fields): 1.18–1.33 MB/year, under budget; decoded to GeoJSON in-browser via `topojson-client` (unpkg). Feature counts verified via console (`<year>: <n> fields`): 9,780 / 9,792 / 10,433 / 10,709 / 10,990. Gzip on wire ~0.30 MB/year either way (Vercel auto-compresses). Rendered-verified live (Chrome MCP: toggle, popup, Compare widget, no console errors).

## Gotchas logged
- **`napaserve.org` apex 307-redirects to `www.napaserve.org`** — public/ asset fetch checks need `curl -sL` (bare `curl -s` returns a 15-byte "Redirecting..." stub). → Cheatsheet.
- `<title>` tag still reads "v0.1" — the v0.1.1 bump hit the HTML comment, header and footer but missed `<title>`. Logged as a nit to fold into v0.2. → ledger PD-2026-07-07-03.

## Roadmap
- **v0.2** — map diff/change highlighting (per-field year-over-year add/remove) + `<title>` version fix.
- **v0.3** — Sentinel-2 provisional current-year layer. **NDVI spike first**, and it needs **Tim's known-removals list** as ground truth before trusting any NDVI-derived removal signal.
- **New-vintage detector** — CI watcher on the `poll_pipeline.yml` pattern to flag when DWR publishes a new crop-mapping vintage (so the demo doesn't silently go stale).

## Guardrail note
All spike outputs carry the `.UNVALIDATED` suffix; no Supabase writes, no production data path. The demo reads only committed static assets. Official figures are the number of record everywhere the product surfaces acreage (ADR-009).

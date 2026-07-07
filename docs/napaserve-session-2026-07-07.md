# Session 2026-07-07 — Elected Seats Atlas Launch

## New project: Elected Seats Atlas
Origin: Supervisor Joelle Gallagher email 7/6 — no comprehensive map of local elected bodies/districts exists; goal is predicting when seats come up to foster candidate talent. Built prototype same morning, call held 7/7, she loves it. Champion relationship established.

## Live demo
https://napaserve.org/precinct-explorer.html — unlisted (no menu link), v0.1 through v0.7 shipped and verified same day. Commits: ba7cef0 (v0.1), db51d4d (v0.5), d2419fe (v0.6), v0.7 pushed ~12:30 PM and rendered-verified (street zoom, Chrome MCP + Tim's Safari). Footer marks demo-only pending Elections confirmation.

## NEW DEPLOY PATTERN (protocol-worthy)
Static HTML in economic-pulse-app/public/ ships verbatim at site root on Vercel push — bypasses the SPA entirely. No route, no menu, no bundle change. Bundle-hash check does NOT apply to these assets: they serve or 404. Enables unlisted demo pages.

## County GIS endpoints (canonical reference)
- Precinct layer: https://gis.napacounty.gov/arcgis/rest/services/Hosted/Precincts_2022/FeatureServer/8 — layer id is 8, NOT 0 (caused a 404 during build)
- Fields: precinct, pdflink, supervisor_district, municipality, school_district, park_ward, nvc_trustee_area, boe_trustee_area, nvusd_area, napacitycouncildistrict, sfid
- geoJSON supported, maxRecordCount 2000, 215 precincts, counts by supervisor district: 53/41/41/38/42
- KEY DISCOVERY: precinct-to-district correspondence is published as explicit attributes — no Elections data request needed for geography
- Hub search API (CORS-open): https://gisdata.napacounty.gov/api/search/v1/collections/all/items?q=...
- Hosted folder also serves: Supervisor_Districts(_2022), Napa_City_Council_District, NVUSD/BOE/NVC trustee areas, School_Districts, Cities, and special districts (sanitation, RCD, Silverado CSD, two cemetery districts, Berryessa districts, fire, water, CSAs 3+4) with spheres of influence — Phase 2 geography already published by county

## Demo architecture (precinct-explorer.html, standalone)
Runtime discovery chain: ?service= override → known layer URL → Hub search → AGO org search → AGO global search; each route must survive discovery AND the data query. Diagnostic connection log panel on failure. Sandbox-safe fetch (retries without AbortSignal on clone errors — claude.ai artifact panes can't clone signals). Mobile stacked layout via @media max-width 760px (standalone CSS file is an accepted exception to inline-styles rule — this page is not part of the SPA). Labeled fields, counted legend with click-to-spotlight, maxZoom 19 (street level), Reader-view spacing fixed in v0.7.

## CLAUDE CODE PROMPT LESSON (protocol-worthy)
Browser download suffixing (-2, -3, _1) broke "newest matching file" prompts twice: once copying stale v0.1, once aborting a valid v0.6. Fix: explicit filename + grep version-string gate ("if count is 0, stop and show me what you checked"). Version string in the file is the deploy gate, not the filename.

## People
- Joelle Gallagher (Supervisor, D1): champion. Asks from call: street zoom (DONE v0.7), election timeline by body (the real Phase 1 build), address lookup (v0.8). Confirmed heterogeneous election cycles across jurisdictions as core scope.
- John Tuteur, Assessor-Recorder-County Clerk / Registrar of Voters (verified current, June 2026 primary coverage): Tim knows him directly; dual-track — Joelle intro for institutional framing + Tim direct outreach (email drafted/sent 7/7). His office holds election calendar + term data for Phase 1.

## Open items / next actions
- Elections currency confirmation (layer description says June 2020; catalog says data updated June 8, 2026 — six days post-primary, actively-maintained signal; confirm with Tuteur before ANY publication)
- elected_seats table spec + supervisor-seat skeleton (sourced term dates only, never recalled)
- v0.8: address lookup (geocoder + point-in-precinct; Census geocoder candidate)
- OSM tile usage policy: fine for demo, NOT production-licensed — needs tile provider (MapTiler/Stadia class) before public launch
- Funding framing: sponsorship through NapaServe directly (Tim's decision — CommunityServe not set up; do not reference nonprofit routing). Commercial comp $15K–40K. Oscar fit: roster research role, no repo access required.
- Brief delivered (Elected_Seats_Atlas_Brief.docx v2: LAFCO spelled out, NapaServe funding language); 3 emails sent (prototype+brief, post-call recap, Tuteur direct)

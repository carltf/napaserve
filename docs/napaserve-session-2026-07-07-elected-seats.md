# Sessions 2026-07-07/08 — Elected Seats Atlas: Idea to Seeded Database in 30 Hours

## Project origin
Supervisor Joelle Gallagher email 7/6: no comprehensive map of local elected bodies/districts exists; goal is predicting seat turnover to foster candidate talent. Prototype built 7/7 morning, call held 7/7, Registrar engaged 7/8, seat database seeded 7/8.

## Live demo
https://napaserve.org/precinct-explorer.html — unlisted, v0.1→v0.7 shipped and rendered-verified in one day. Commits: ba7cef0 (v0.1), db51d4d (v0.5), d2419fe (v0.6), v0.7 ~7/7 12:30 PM. v0.7 features: county precinct layer live, labeled fields, counted legend with click-to-spotlight, dynamic overview, mobile stacked layout (@media 760px), street-level zoom (maxZoom 19), diagnostic connection log, ?service= override, sandbox-safe fetch. Footer marks demo-only pending Elections confirmation.

## NEW DEPLOY PATTERN (protocol)
Static HTML in economic-pulse-app/public/ ships verbatim at site root on Vercel push — bypasses SPA entirely. No route, no menu, no bundle change. Bundle-hash check does NOT apply: static assets serve or 404. Standalone pages may use their own CSS files (SPA inline-styles rule doesn't apply outside the React app).

## County GIS endpoints (canonical)
- Precinct layer: https://gis.napacounty.gov/arcgis/rest/services/Hosted/Precincts_2022/FeatureServer/8 — layer id is 8, NOT 0
- Fields: precinct, pdflink, supervisor_district, municipality, school_district, park_ward, nvc_trustee_area, boe_trustee_area, nvusd_area, napacitycouncildistrict, sfid
- geoJSON supported, maxRecordCount 2000, 215 precincts (53/41/41/38/42 by supervisor district)
- KEY DISCOVERY: precinct-to-district correspondence published as explicit attributes
- Hub search API (CORS-open): https://gisdata.napacounty.gov/api/search/v1/collections/all/items?q=...
- Hosted folder also serves boundary layers for supervisorial districts, Napa council districts, all trustee areas, school districts, cities, and special districts with spheres — Phase 2 geography already published

## CLAUDE CODE PROMPT LESSON (protocol)
Browser download suffixing (-2, _1) broke "newest matching file" prompts twice. Standard now: explicit filename + grep version-string content gate ("if count is 0, stop and show what you checked"). Version string in file is the deploy gate, not the filename.

## People and correspondence
- Joelle Gallagher (Supervisor D1): champion; call 7/7; asks = street zoom (DONE), election timeline (= Phase 1 roster), address lookup (v0.8). Now fact-checker #1: reported Alessio off Napa council (extraction had pre-flagged it) and "Jeni Olsen no longer on NVUSD" — but ROV file has Jennifer Sue Olsen on NVC board TA5, not NVUSD; clarification email sent 7/8, PENDING.
- John Tuteur (Assessor-Recorder-County Clerk / Registrar): intro by Gallagher 7/8; replied within hours calling it "a public service"; asked about a search box (v0.8 demand validation); PROVIDED official Incumbent List by Office ID (11/18/2025, 109 seats). Says updated list posts after November election. Boundary-currency confirmation STILL PENDING (asked twice, praised but not yet confirmed).
- Emails sent: prototype+brief (7/7 am), post-call recap (7/7), Tuteur overview (7/8), Tuteur thanks + structured-file ask + currency re-ask + privacy commitment (7/8), Joelle corrections/Olsen (7/8).

## napa_elected_seats table (NEW, seeded 7/8)
- Seeded from ROV Incumbent File 11/18/2025 via extraction script with validation gates; all 109 rows loaded; verified in Supabase: 109 total / 56 on 2026 ballot / 76 flagged
- RLS ENABLED, no policies — locked to service role by design (unverified baseline, incumbent names). Public read opens later via single anon SELECT policy after verification.
- Columns: office_id, seat_suffix, jurisdiction, body, office_title, incumbent, party_registration, term_length_listed, term_start, term_end, next_election_year (derived: Dec end→same-year Nov; Jan end→prior-year Nov), selection_method, vacated, remarks, gis_field, gis_value, flags, source
- (office_id, seat_suffix) NOT unique by design — county file has legit duplicates for multi-seat offices
- GIS join keys mapped: supervisor_district, boe/nvc/nvusd trustee areas, napacitycouncildistrict, park_ward. Municipality/school_district values unverified vs layer strings. Water districts join_todo.
- PRIVACY RULE: home addresses/emails/phones in ROV file NEVER extracted, never displayed. Display = name, seat, term, election date only.
- Key flags: vacated (Judge Lind; Damonte deceased), unknown_start_date (Howell Mtn x2), term_length_mismatch (several), selection_method_verify (4 supervisors marked Appointed to Vacancy implausibly), stale_record_verify (Alessio dual-seat — Gallagher confirmed council record stale), term_dates_verify (state legislature rows — the two odd-year outliers in the 2027/2029 buckets)
- Corrections workflow: Gallagher/others report → logged with source → service-role UPDATE. Never applied from memory.
- Headline stat: 56 of 109 seats on the November 2026 ballot.

## Next actions
- Verification pass on flagged rows (city clerks, district sources) — Oscar-shaped task
- Olsen clarification from Gallagher (which board?)
- Tuteur: boundary currency confirmation; structured file with November update
- v0.8 address lookup (geocoder + point-in-precinct; Census geocoder candidate)
- 2026 ballot view (join napa_elected_seats to map by gis_field/gis_value)
- OSM tiles not production-licensed — tile provider needed before public launch
- Funding: sponsorship through NapaServe directly (NOT CommunityServe). Commercial comp $15K–40K.

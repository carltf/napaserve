#!/usr/bin/env bash
#
# build_napa_basemap.sh — generate the self-hosted Protomaps basemap for the
# NapaServe map explorers.
#
# Cuts a Napa-County bounding box out of the latest Protomaps daily planet build
# into a single vector-tile file:
#
#     economic-pulse-app/public/data/napa-basemap.pmtiles
#
# That file is what precinct-explorer.html and vineyard-explorer.html now load
# (protomaps-leaflet, flavor "light"), replacing the OSM community raster tiles.
# It clears ledger blocker PD-2026-07-07-01 (tile.openstreetmap.org is not for
# production use). No API key, no per-request billing — a static file Vercel
# serves with range requests.
#
# RUN THIS ON A MACHINE WITH OPEN NETWORK (your Mac) — not the Cowork sandbox,
# whose egress can't reach the Protomaps build servers.
#
# Requires the pmtiles CLI:
#     brew install pmtiles
#   (or grab a binary from github.com/protomaps/go-pmtiles/releases)
#
# Re-run any time to refresh the basemap; it's a display layer, so refreshing is
# optional and safe.

set -euo pipefail

# Napa County, padded a touch so the basemap fills past the county edge.
# bbox order is MIN_LON,MIN_LAT,MAX_LON,MAX_LAT.
BBOX="-122.70,38.10,-122.00,38.90"
MAXZOOM=15   # Protomaps planet builds top out at z15; the explorers over-zoom to street level.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="${SCRIPT_DIR}/../economic-pulse-app/public/data/napa-basemap.pmtiles"

command -v pmtiles >/dev/null 2>&1 || { echo "ERROR: pmtiles CLI not found. Run: brew install pmtiles"; exit 1; }

# Find a recent daily build (walk back up to 14 days). Daily builds live at
# https://build.protomaps.com/YYYYMMDD.pmtiles — see https://maps.protomaps.com/builds
SRC=""
for i in $(seq 0 14); do
  D=$(date -v-"${i}"d +%Y%m%d 2>/dev/null || date -d "-${i} day" +%Y%m%d)
  URL="https://build.protomaps.com/${D}.pmtiles"
  if curl -sfI "$URL" >/dev/null 2>&1; then SRC="$URL"; break; fi
done
[ -n "$SRC" ] || { echo "ERROR: no recent daily build found. Check https://maps.protomaps.com/builds and set the date manually."; exit 1; }

echo "Source build : $SRC"
echo "Bounding box : $BBOX"
echo "Max zoom     : $MAXZOOM"
echo "Output       : $OUT"
echo

mkdir -p "$(dirname "$OUT")"
pmtiles extract "$SRC" "$OUT" --bbox="$BBOX" --maxzoom="$MAXZOOM"

echo
echo "Done. Header:"
pmtiles show "$OUT" | sed -n '1,18p'
echo
echo "Size: $(du -h "$OUT" | cut -f1)"

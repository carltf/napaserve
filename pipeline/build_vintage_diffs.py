"""
build_vintage_diffs.py
NapaServe — vineyard-explorer v0.2 diff precompute (no DB writes)

Precompute per-vintage add/remove diffs OFFLINE so the browser never has to
match ~10k x 10k polygons. Emits ONE small JSON keyed to the shipped TopoJSON
feature order, which the page overlays as red (removed) / green (added) tints.

WHY pre-simplification source, not the shipped TopoJSON: matching needs accurate
boundaries. The shipped assets are mapshaper-simplified (10% retention); we match
on the full-resolution DWR/Land IQ REST polygons instead (same source the spikes
used) and only KEY the result to TopoJSON index.

INDEX ALIGNMENT (verified, not assumed): the TopoJSON for each vintage was built
from the REST features in OBJECTID-ascending order — topo feature N's `acres` ==
source polygon N's ACRES when source is fetched `ORDER BY OBJECTID ASC`. But the
live REST layer can DRIFT from the frozen TopoJSON (observed: 2021 gained one
0.0-acre sliver after the assets were built). So instead of assuming positional
identity, we ALIGN each TopoJSON feature to its source polygon with a
self-verifying greedy acres-walk that skips drift-added source polys. It ABORTS
if a skipped poly has non-trivial acreage (a real field being discarded) or if a
TopoJSON feature has no source match (a source deletion) — either would mean a
silent index skew that paints the wrong fields.

MATCHING: field in year A is "present" in year B iff it overlaps some B polygon
with IoU >= threshold (default 0.30). IoU is affine-invariant, so it is computed
directly in WGS84 lon/lat (the lon/lat->meters scaling cancels in inter/union);
Napa's ~0.9% latitude-span area distortion is negligible at this threshold. An
STRtree bbox index keeps it ~O(n) instead of O(n^2).

For each adjacent pair (2020->21, 21->22, 22->23, 23->24) AND the full span
2020->24: removed = indices in A absent from B; added = indices in B absent from A.

Output: economic-pulse-app/public/data/vineyard-diffs.json
Sanity: adjacent pairs should be HUNDREDS of fields, not thousands (thousands =
threshold bug). No Supabase writes. No git commits here.

Usage:
    python3 pipeline/build_vintage_diffs.py
"""

import json
import os
import sys
import time
from datetime import datetime, timezone

try:
    import requests
    from shapely.geometry import shape
    from shapely import STRtree, make_valid
except ImportError as e:  # noqa: BLE001
    print(f'Missing dep: {e}. Install: pip3 install --user requests shapely', file=sys.stderr)
    raise

# ── Config ────────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_DIR   = os.path.dirname(SCRIPT_DIR)
DATA_DIR   = os.path.join(SCRIPT_DIR, 'data')
CACHE_DIR  = os.path.join(DATA_DIR, '_cache')
TOPO_DIR   = os.path.join(REPO_DIR, 'economic-pulse-app', 'public', 'data')
OUT_JSON   = os.path.join(TOPO_DIR, 'vineyard-diffs.json')

IOU_THRESHOLD = 0.30
PAGE          = 2000                       # REST maxRecordCount
TIMEOUT       = 120
RETRIES       = 4
BACKOFF       = 5

VINEYARD_WHERE = "COUNTY='Napa' AND SYMB_CLASS='V'"

# year -> MapServer layer-0 URL (from spike #2) + expected shipped feature count.
REST = {
    2020: 'https://utility.arcgis.com/usrsvcs/servers/576e483b63334c4886a0e535584c4570/rest/services/Planning/i15_Crop_Mapping_2020/MapServer/0',
    2021: 'https://utility.arcgis.com/usrsvcs/servers/5fe15fbb9296403eb4ea91e3d031619d/rest/services/Planning/i15_Crop_Mapping_2021/MapServer/0',
    2022: 'https://utility.arcgis.com/usrsvcs/servers/8b0555ad7cb14dcab66901925427228a/rest/services/Planning/i15_Crop_Mapping_2022/MapServer/0',
    2023: 'https://utility.arcgis.com/usrsvcs/servers/d94e891e00364e49a2ed9e9e2e27837d/rest/services/Planning/i15_Crop_Mapping_2023/MapServer/0',
    2024: 'https://utility.arcgis.com/usrsvcs/servers/39b63601dfb34274899d15a13465644e/rest/services/Planning/i15_Crop_Mapping_2024_Provisional/MapServer/0',
}
EXPECTED_COUNT = {2020: 9780, 2021: 9792, 2022: 10433, 2023: 10709, 2024: 10990}
YEARS = [2020, 2021, 2022, 2023, 2024]
ADJ_PAIRS = [(2020, 2021), (2021, 2022), (2022, 2023), (2023, 2024)]
SPAN_PAIR = (2020, 2024)


def log(msg):
    print(msg, flush=True)


# ── Fetch source polygons (OBJECTID order == TopoJSON order) ───────────────────
def _get(url, params):
    last = None
    for attempt in range(1, RETRIES + 1):
        try:
            r = requests.get(url, params=params, timeout=TIMEOUT)
            if r.status_code != 200:
                last = f'http {r.status_code}'
                raise RuntimeError(last)
            return r.json()
        except Exception as e:  # noqa: BLE001
            last = last or repr(e)
            log(f'      attempt {attempt}/{RETRIES} failed: {last}')
            if attempt < RETRIES:
                time.sleep(BACKOFF * attempt)
    raise RuntimeError(f'gave up: {last}')


def fetch_source(year):
    """All Napa vineyard polygons for `year`, ORDER BY OBJECTID ASC, cached as
    GeoJSON. Returns the FeatureCollection features list (in that order)."""
    os.makedirs(CACHE_DIR, exist_ok=True)
    cache = os.path.join(CACHE_DIR, f'vineyard_src_{year}.geojson')
    if os.path.exists(cache) and os.path.getsize(cache) > 10_000:
        with open(cache) as f:
            feats = json.load(f)['features']
        log(f'  {year}: {len(feats):,} source polygons (cached)')
        return feats

    url = REST[year] + '/query'
    total = _get(url, {'where': VINEYARD_WHERE, 'returnCountOnly': 'true',
                       'f': 'json'}).get('count')
    log(f'  {year}: fetching {total:,} polygons (paging {PAGE}/req)…')
    feats, offset = [], 0
    while True:
        j = _get(url, {
            'where': VINEYARD_WHERE, 'outFields': 'OBJECTID,ACRES',
            'orderByFields': 'OBJECTID ASC', 'returnGeometry': 'true',
            'resultOffset': offset, 'resultRecordCount': PAGE,
            'outSR': 4326, 'f': 'geojson',
        })
        got = j.get('features') or []
        feats.extend(got)
        if len(got) < PAGE:
            break
        offset += PAGE
    with open(cache, 'w') as f:
        json.dump({'type': 'FeatureCollection', 'features': feats}, f)
    log(f'  {year}: fetched {len(feats):,} polygons (total said {total:,})')
    return feats


# ── Alignment verification against shipped TopoJSON ───────────────────────────
def topo_acres(year):
    with open(os.path.join(TOPO_DIR, f'vineyards-{year}.topo.json')) as f:
        topo = json.load(f)
    obj = topo['objects'].get('vineyards') or topo['objects'][list(topo['objects'])[0]]
    return [g['properties']['acres'] for g in obj['geometries']]


DRIFT_ACRE_EPS = 0.05      # a skipped drift-add above this many acres is a RED FLAG


def align_source_to_topo(year, feats):
    """Return one source feature per TopoJSON feature index, via a greedy
    acres-walk that skips drift-added source polygons. Aborts on any sign of a
    real index skew. The returned list is 1:1 with the shipped TopoJSON order."""
    tac = topo_acres(year)
    if len(tac) != EXPECTED_COUNT[year]:
        raise SystemExit(f'ABORT {year}: TopoJSON count {len(tac)} != expected '
                         f'{EXPECTED_COUNT[year]}.')
    sac = [round(f['properties']['ACRES'], 2) for f in feats]

    mapped, skipped, i = [], [], 0
    for j, ta in enumerate(tac):
        while i < len(sac) and abs(sac[i] - ta) > 0.011:
            skipped.append(i)
            i += 1
        if i >= len(sac):
            raise SystemExit(
                f'ABORT {year}: TopoJSON feature #{j} (acres {ta}) has no source '
                'match — a live-source DELETION. Cannot key by index; needs review.')
        mapped.append(feats[i])
        i += 1
    skipped.extend(range(i, len(sac)))            # trailing drift-adds

    big = [(k, sac[k]) for k in skipped if sac[k] > DRIFT_ACRE_EPS]
    if big:
        head = ', '.join(f'idx{k}={a}ac' for k, a in big[:5])
        raise SystemExit(
            f'ABORT {year}: dropped {len(big)} source poly(s) with real acreage as '
            f'"drift" — not safe. First: {head}. Rebuild the TopoJSON from the '
            'current source instead of index-keying to a stale one.')

    n = len(tac)
    spots = [0, n // 4, n // 2, 3 * n // 4, n - 1]
    drift = (f'  [drift: skipped {len(skipped)} source sliver(s) '
             f'{[round(sac[k],2) for k in skipped]}ac]' if skipped else '')
    log(f'  {year}: aligned ✓ ({n:,} feats, acres match){drift}\n'
        f'         spot-check ' + '; '.join(f'#{i}={tac[i]}ac' for i in spots))
    return mapped


# ── IoU diff ──────────────────────────────────────────────────────────────────
def prep_geoms(feats):
    """WGS84 shapely geometries, validity-repaired (IoU is affine-invariant so no
    reprojection needed)."""
    geoms = []
    for f in feats:
        g = shape(f['geometry'])
        if not g.is_valid:
            g = make_valid(g)
        geoms.append(g)
    return geoms


def present_mask(src_geoms, dst_geoms, threshold):
    """Boolean list over src: True if src[i] overlaps some dst polygon IoU>=thr."""
    tree = STRtree(dst_geoms)
    out = [False] * len(src_geoms)
    for i, g in enumerate(src_geoms):
        ga = g.area
        for j in tree.query(g):                 # bbox candidates
            h = dst_geoms[j]
            inter = g.intersection(h).area
            if inter <= 0:
                continue
            iou = inter / (ga + h.area - inter)
            if iou >= threshold:
                out[i] = True
                break
    return out


def diff_pair(a_year, geoms_a, b_year, geoms_b, threshold):
    """removed = A indices absent in B; added = B indices absent in A."""
    a_present_in_b = present_mask(geoms_a, geoms_b, threshold)
    b_present_in_a = present_mask(geoms_b, geoms_a, threshold)
    removed = [i for i, p in enumerate(a_present_in_b) if not p]
    added = [i for i, p in enumerate(b_present_in_a) if not p]
    return removed, added


# ── main ──────────────────────────────────────────────────────────────────────
def main():
    log('vineyard-explorer v0.2 — precomputing vintage diffs\n')
    log('STEP A — fetch pre-simplification source polygons + verify TopoJSON alignment')
    geoms = {}
    for y in YEARS:
        raw = fetch_source(y)
        aligned = align_source_to_topo(y, raw)     # 1:1 with TopoJSON order
        geoms[y] = prep_geoms(aligned)
    log('')

    # threshold sensitivity on ONE pair before running all (2023->2024)
    log('STEP B — IoU threshold sensitivity on 2023→2024 (before committing to 0.30)')
    for thr in (0.10, 0.20, 0.30, 0.40, 0.50):
        t0 = time.perf_counter()
        rem, add = diff_pair(2023, geoms[2023], 2024, geoms[2024], thr)
        log(f'    IoU>={thr:.2f}: {len(rem):>4} removed, {len(add):>4} added '
            f'({time.perf_counter()-t0:.1f}s)')
    log(f'  -> using IoU >= {IOU_THRESHOLD:.2f} for all pairs\n')

    # all pairs
    log('STEP C — computing all pairs at IoU >= %.2f' % IOU_THRESHOLD)
    pairs = {}
    counts = []
    implausible = []
    for (a, b) in ADJ_PAIRS + [SPAN_PAIR]:
        t0 = time.perf_counter()
        rem, add = diff_pair(a, geoms[a], b, geoms[b], IOU_THRESHOLD)
        key = f'{a}-{b}'
        pairs[key] = {'from': a, 'to': b, 'removed': rem, 'added': add,
                      'removed_count': len(rem), 'added_count': len(add)}
        adj = (b - a) == 1
        log(f'    {key}: {len(rem):>4} removed, {len(add):>4} added '
            f'({time.perf_counter()-t0:.1f}s)')
        counts.append((key, len(rem), len(add), adj))
        # sanity: adjacent pairs should be hundreds, not thousands
        if adj and (len(rem) > 3000 or len(add) > 3000):
            implausible.append(key)

    # ── write JSON ─────────────────────────────────────────────────────────────
    payload = {
        'generated_utc': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'iou_threshold': IOU_THRESHOLD,
        'source': 'DWR/Land IQ i15 Crop Mapping (pre-simplification REST polygons)',
        'index_basis': '0-based index into shipped vineyards-<year>.topo.json feature order',
        'pairs': pairs,
    }
    os.makedirs(TOPO_DIR, exist_ok=True)
    with open(OUT_JSON, 'w') as f:
        json.dump(payload, f, separators=(',', ':'))
    size = os.path.getsize(OUT_JSON)
    log(f'\nWrote {OUT_JSON}  ({size/1024:.1f} KB)')

    # ── report ─────────────────────────────────────────────────────────────────
    log('\n── Per-pair diff counts ──')
    log('| pair | adjacent | removed | added |')
    log('|------|----------|--------:|------:|')
    for key, nr, na, adj in counts:
        log(f'| {key} | {"yes" if adj else "SPAN"} | {nr} | {na} |')

    if implausible:
        log(f'\n!! IMPLAUSIBLE COUNTS on adjacent pair(s): {implausible} '
            '(>3000 = likely threshold bug). STOP — review before shipping.')
    else:
        log('\nSanity ✓ adjacent pairs are in the hundreds (not thousands).')


if __name__ == '__main__':
    main()

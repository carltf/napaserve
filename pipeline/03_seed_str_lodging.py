"""
03_seed_str_lodging.py
NapaServe Community Data Commons — STR Lodging Seed

Seeds community_observations with lodging performance data
from the Smith Travel Research January 2026 report
(distributed by Visit Napa Valley).

Covers:
  - County-level competitive set (Napa, Sonoma, Monterey, etc.)
  - Napa jurisdictions (American Canyon, City of Napa, Yountville,
    St. Helena, Calistoga, Unincorporated)
  - Service types (Luxury, Group, Limited-Service)
  - Metrics: occupancy, ADR, RevPAR, revenue, supply, demand

Usage:
    SUPABASE_KEY=your_service_key python3 03_seed_str_lodging.py
    SUPABASE_KEY=your_service_key python3 03_seed_str_lodging.py --dry-run
"""

import os
import sys
import argparse
from datetime import date

try:
    from supabase import create_client
except ImportError:
    import subprocess
    subprocess.run([sys.executable, '-m', 'pip', 'install',
                    'supabase', '--break-system-packages', '-q'])
    from supabase import create_client

# ── Config ────────────────────────────────────────────────
SUPABASE_URL = 'https://csenpchwxxepdvjebsrt.supabase.co'
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')
SOURCE_NAME  = 'Smith Travel Research'
SOURCE_DOC   = 'January 2026 STR Report — Visit Napa Valley'

# Reference period
PERIOD_START = date(2026, 1, 1).isoformat()
PERIOD_END   = date(2026, 1, 31).isoformat()
PERIOD_TYPE  = 'monthly'

# ── Data from January 2026 STR Report ─────────────────────
# Structure: (geography, geography_type, dimension, metrics_dict)
# metrics_dict keys: occupancy, adr, revpar, revenue, supply, demand
# YOY values are stored separately as their own metric rows.

STR_DATA = [

    # ── County Competitive Set ─────────────────────────────
    {
        'geography':      'Napa County',
        'geography_type': 'county',
        'dimension':      'competitive_set|county',
        'occupancy':       45.4,
        'occupancy_yoy':  -1.8,
        'adr':            302.26,
        'adr_yoy':        -3.3,
        'revpar':         137.19,
        'revpar_yoy':     -5.0,
        'revenue':        22621119,
        'revenue_yoy':    -4.5,
        'supply':         164889,
        'supply_yoy':      0.6,
        'demand':          74841,
        'demand_yoy':     -1.2,
    },
    {
        'geography':      'Sonoma County',
        'geography_type': 'county',
        'dimension':      'competitive_set|county',
        'occupancy':       48.3,
        'occupancy_yoy':   6.5,
        'adr':            161.65,
        'adr_yoy':        -2.3,
        'revpar':          78.12,
        'revpar_yoy':      4.0,
    },
    {
        'geography':      'Monterey County',
        'geography_type': 'county',
        'dimension':      'competitive_set|county',
        'occupancy':       54.9,
        'occupancy_yoy':  -2.5,
        'adr':            199.83,
        'adr_yoy':        -5.2,
        'revpar':         109.65,
        'revpar_yoy':     -7.5,
    },
    {
        'geography':      'San Luis Obispo County',
        'geography_type': 'county',
        'dimension':      'competitive_set|county',
        'occupancy':       52.6,
        'occupancy_yoy':  -2.4,
        'adr':            148.13,
        'adr_yoy':        -0.5,
        'revpar':          77.90,
        'revpar_yoy':     -2.9,
    },
    {
        'geography':      'Santa Barbara County',
        'geography_type': 'county',
        'dimension':      'competitive_set|county',
        'occupancy':       56.4,
        'occupancy_yoy':  -3.8,
        'adr':            206.76,
        'adr_yoy':        -2.2,
        'revpar':         116.54,
        'revpar_yoy':     -5.9,
    },
    {
        'geography':      'San Francisco County',
        'geography_type': 'county',
        'dimension':      'competitive_set|county',
        'occupancy':       60.9,
        'occupancy_yoy':   6.2,
        'adr':            400.57,
        'adr_yoy':         3.9,
        'revpar':         243.82,
        'revpar_yoy':     10.4,
    },

    # ── Napa Jurisdictions ─────────────────────────────────
    {
        'geography':      'American Canyon',
        'geography_type': 'city',
        'dimension':      'jurisdiction|American Canyon',
        'occupancy':       57.7,
        'occupancy_yoy':   7.1,
        'adr':            103.04,
        'adr_yoy':       -10.9,
        'revpar':          59.43,
        'revpar_yoy':     -4.6,
    },
    {
        'geography':      'City of Napa',
        'geography_type': 'city',
        'dimension':      'jurisdiction|City of Napa',
        'occupancy':       46.9,
        'occupancy_yoy':  -5.8,
        'adr':            242.20,
        'adr_yoy':        -5.7,
        'revpar':         113.66,
        'revpar_yoy':    -11.2,
    },
    {
        'geography':      'Yountville',
        'geography_type': 'city',
        'dimension':      'jurisdiction|Yountville',
        'occupancy':       33.5,
        'occupancy_yoy':   7.0,
        'adr':            535.23,
        'adr_yoy':        -9.1,
        'revpar':         179.51,
        'revpar_yoy':     -2.7,
    },
    {
        'geography':      'St. Helena',
        'geography_type': 'city',
        'dimension':      'jurisdiction|St. Helena',
        'occupancy':       52.8,
        'occupancy_yoy':   6.0,
        'adr':            397.13,
        'adr_yoy':        -6.1,
        'revpar':         209.74,
        'revpar_yoy':     -0.5,
    },
    {
        'geography':      'Calistoga',
        'geography_type': 'city',
        'dimension':      'jurisdiction|Calistoga',
        'occupancy':       44.8,
        'occupancy_yoy':  -8.2,
        'adr':            463.56,
        'adr_yoy':         4.3,
        'revpar':         207.78,
        'revpar_yoy':     -4.3,
    },
    {
        'geography':      'Napa County Unincorporated',
        'geography_type': 'county',
        'dimension':      'jurisdiction|Unincorporated',
        'occupancy':       38.2,
        'occupancy_yoy':  13.9,
        'adr':            438.36,
        'adr_yoy':        -3.6,
        'revpar':         167.48,
        'revpar_yoy':      9.8,
    },

    # ── Napa Service Types ─────────────────────────────────
    {
        'geography':      'Napa County',
        'geography_type': 'county',
        'dimension':      'service_type|Luxury Hotels',
        'occupancy':       38.5,
        'occupancy_yoy':   1.4,
        'adr':            715.83,
        'adr_yoy':        -5.0,
        'revpar':         275.69,
        'revpar_yoy':     -3.7,
    },
    {
        'geography':      'Napa County',
        'geography_type': 'county',
        'dimension':      'service_type|Group Hotels',
        'occupancy':       46.4,
        'occupancy_yoy':  -1.1,
        'adr':            222.37,
        'adr_yoy':        -4.6,
        'revpar':         103.23,
        'revpar_yoy':     -5.6,
    },
    {
        'geography':      'Napa County',
        'geography_type': 'county',
        'dimension':      'service_type|Limited-Service Hotels',
        'occupancy':       50.7,
        'occupancy_yoy':  -6.3,
        'adr':            137.42,
        'adr_yoy':        -8.0,
        'revpar':          69.65,
        'revpar_yoy':    -13.8,
    },
]

# ── Metric definitions ─────────────────────────────────────
# (field_key, metric_name, unit, is_yoy)
METRICS = [
    ('occupancy',     'occupancy_rate',  'percent',  False),
    ('occupancy_yoy', 'occupancy_rate',  'percent',  True),
    ('adr',           'adr',             'dollars',  False),
    ('adr_yoy',       'adr',             'dollars',  True),
    ('revpar',        'revpar',          'dollars',  False),
    ('revpar_yoy',    'revpar',          'dollars',  True),
    ('revenue',       'total_revenue',   'dollars',  False),
    ('revenue_yoy',   'total_revenue',   'dollars',  True),
    ('supply',        'rooms_available', 'rooms',    False),
    ('supply_yoy',    'rooms_available', 'rooms',    True),
    ('demand',        'rooms_sold',      'rooms',    False),
    ('demand_yoy',    'rooms_sold',      'rooms',    True),
]


def build_rows():
    rows = []
    for entry in STR_DATA:
        geography      = entry['geography']
        geography_type = entry['geography_type']
        dimension      = entry['dimension']

        for field_key, metric_name, unit, is_yoy in METRICS:
            if field_key not in entry:
                continue

            # YOY rows get a different metric name suffix and note
            full_metric = f'{metric_name}_yoy_pct' if is_yoy else metric_name
            notes = (
                'Year-over-year percentage change vs. January 2025.'
                if is_yoy else
                'Absolute value for reference month.'
            )

            rows.append({
                'geography':      geography,
                'geography_type': geography_type,
                'domain':         'lodging',
                'metric':         full_metric,
                'dimension':      dimension,
                'period_type':    PERIOD_TYPE,
                'period_start':   PERIOD_START,
                'period_end':     PERIOD_END,
                'value':          entry[field_key],
                'unit':           'percent' if is_yoy else unit,
                'report_type':    'final',
                'confidence':     'verified',
                'source_name':    SOURCE_NAME,
                'source_doc':     SOURCE_DOC,
                'ingested_by':    '03_seed_str_lodging.py',
                'notes':          notes,
            })

    return rows


def run(dry_run=False):
    if not SUPABASE_KEY:
        print('ERROR: SUPABASE_KEY environment variable not set.')
        sys.exit(1)

    rows = build_rows()
    print(f'Built {len(rows)} rows from {len(STR_DATA)} STR entries.')

    if dry_run:
        print('\n── DRY RUN — first 3 rows ──────────────────────')
        for r in rows[:3]:
            print(r)
        print(f'\n── DRY RUN — no data written ───────────────────')
        return

    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    batch_size = 50
    inserted = 0
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]
        (sb.table('community_observations')
           .upsert(batch,
                   on_conflict='geography,domain,metric,dimension,'
                               'period_start,period_end,source_name')
           .execute())
        inserted += len(batch)
        print(f'  Upserted rows {i+1}–{min(i+batch_size, len(rows))}')

    # Update registry
    sb.table('data_sources').update({
        'last_ingested': 'now()',
        'last_period':   'January 2026',
        'next_expected': '2026-04-01',
        'updated_at':    'now()',
    }).eq('source_name', SOURCE_NAME).execute()

    print(f'\n✓ Done. {inserted} rows upserted into community_observations.')
    print('✓ data_sources registry updated.')
    print('\nTo verify:')
    print("  SELECT geography, metric, dimension, value, unit")
    print("  FROM community_observations")
    print("  WHERE domain = 'lodging' AND period_start = '2026-01-01'")
    print("  ORDER BY geography, dimension, metric;")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Seed STR lodging data')
    parser.add_argument('--dry-run', action='store_true',
                        help='Print rows without inserting')
    args = parser.parse_args()
    run(dry_run=args.dry_run)

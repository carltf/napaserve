"""
02_seed_grape_crush.py
NapaServe Community Data Commons — Grape Crush Seed

Seeds community_observations with all verified grape crush data
from the NorthCoast_GrapePrice_Data_v2.xlsx spreadsheet.

Source: CDFA/USDA-NASS Grape Crush Reports, Table 6
Districts: 2=Lake County, 3=Sonoma County, 4=Napa County
Years: 2023 (final), 2024 (final), 2025 (preliminary)

Usage:
    SUPABASE_KEY=your_service_key python3 02_seed_grape_crush.py

    # Dry run (prints rows, does not insert):
    python3 02_seed_grape_crush.py --dry-run

    # Force re-insert even if rows exist:
    python3 02_seed_grape_crush.py --force
"""

import os
import sys
import argparse
from datetime import date

# ── Install supabase if needed ─────────────────────────────
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
SOURCE_NAME  = 'CDFA/USDA-NASS'
SOURCE_URL   = ('https://www.nass.usda.gov/Statistics_by_State/'
                'California/Publications/Grape_Crush/index.php')

# ── Verified data from NorthCoast_GrapePrice_Data_v2.xlsx ─
# Structure: (year, report_type, geography, varietal, district_num, value)
# All values are weighted average grower returns per ton, Table 6.

OVERALL_AVG = [
    # (year, report_type, geography,         district, value)
    (2023, 'final',       'Napa County',    4, 7028.63),
    (2023, 'final',       'Sonoma County',  3, 2975.14),
    (2023, 'final',       'Lake County',    2, 1877.76),
    (2024, 'final',       'Napa County',    4, 6938.96),
    (2024, 'final',       'Sonoma County',  3, 2927.18),
    (2024, 'final',       'Lake County',    2, 1467.76),
    (2025, 'preliminary', 'Napa County',    4, 6767.53),
    (2025, 'preliminary', 'Sonoma County',  3, 2761.37),
    (2025, 'preliminary', 'Lake County',    2, 1165.52),
]

VARIETAL_PRICES = [
    # (year, report_type, geography,         varietal,               district, value)
    # ── Cabernet Sauvignon ──────────────────────────────────────────────────────
    (2023, 'final',       'Napa County',    'Cabernet Sauvignon',  4, 9235.40),
    (2023, 'final',       'Sonoma County',  'Cabernet Sauvignon',  3, 3061.44),
    (2023, 'final',       'Lake County',    'Cabernet Sauvignon',  2, 2322.04),
    (2024, 'final',       'Napa County',    'Cabernet Sauvignon',  4, 9146.21),
    (2024, 'final',       'Sonoma County',  'Cabernet Sauvignon',  3, 2920.71),
    (2024, 'final',       'Lake County',    'Cabernet Sauvignon',  2, 1644.21),
    (2025, 'preliminary', 'Napa County',    'Cabernet Sauvignon',  4, 8933.10),
    (2025, 'preliminary', 'Sonoma County',  'Cabernet Sauvignon',  3, 2772.49),
    (2025, 'preliminary', 'Lake County',    'Cabernet Sauvignon',  2, 1171.26),
    # ── Pinot Noir ──────────────────────────────────────────────────────────────
    (2023, 'final',       'Napa County',    'Pinot Noir',          4, 2938.93),
    (2023, 'final',       'Sonoma County',  'Pinot Noir',          3, 3880.92),
    (2023, 'final',       'Lake County',    'Pinot Noir',          2, 2230.73),
    (2024, 'final',       'Napa County',    'Pinot Noir',          4, 2941.80),
    (2024, 'final',       'Sonoma County',  'Pinot Noir',          3, 3890.39),
    (2024, 'final',       'Lake County',    'Pinot Noir',          2, 1487.88),
    (2025, 'preliminary', 'Napa County',    'Pinot Noir',          4, 2867.77),
    (2025, 'preliminary', 'Sonoma County',  'Pinot Noir',          3, 3817.65),
    (2025, 'preliminary', 'Lake County',    'Pinot Noir',          2, 1347.39),
    # ── Chardonnay ──────────────────────────────────────────────────────────────
    (2023, 'final',       'Napa County',    'Chardonnay',          4, 3690.32),
    (2023, 'final',       'Sonoma County',  'Chardonnay',          3, 2559.87),
    (2023, 'final',       'Lake County',    'Chardonnay',          2,  964.97),
    (2024, 'final',       'Napa County',    'Chardonnay',          4, 3790.12),
    (2024, 'final',       'Sonoma County',  'Chardonnay',          3, 2590.41),
    (2024, 'final',       'Lake County',    'Chardonnay',          2, 1241.12),
    (2025, 'preliminary', 'Napa County',    'Chardonnay',          4, 3675.40),
    (2025, 'preliminary', 'Sonoma County',  'Chardonnay',          3, 2428.79),
    (2025, 'preliminary', 'Lake County',    'Chardonnay',          2,  287.65),
    # ── Sauvignon Blanc ─────────────────────────────────────────────────────────
    (2023, 'final',       'Napa County',    'Sauvignon Blanc',     4, 3160.52),
    (2023, 'final',       'Sonoma County',  'Sauvignon Blanc',     3, 2054.22),
    (2023, 'final',       'Lake County',    'Sauvignon Blanc',     2, 1424.21),
    (2024, 'final',       'Napa County',    'Sauvignon Blanc',     4, 3264.54),
    (2024, 'final',       'Sonoma County',  'Sauvignon Blanc',     3, 2024.54),
    (2024, 'final',       'Lake County',    'Sauvignon Blanc',     2, 1313.75),
    (2025, 'preliminary', 'Napa County',    'Sauvignon Blanc',     4, 3136.84),
    (2025, 'preliminary', 'Sonoma County',  'Sauvignon Blanc',     3, 1903.57),
    (2025, 'preliminary', 'Lake County',    'Sauvignon Blanc',     2, 1195.73),
    # ── Cabernet Franc ──────────────────────────────────────────────────────────
    (2023, 'final',       'Napa County',    'Cabernet Franc',      4, 10632.72),
    (2023, 'final',       'Sonoma County',  'Cabernet Franc',      3,  4558.35),
    (2023, 'final',       'Lake County',    'Cabernet Franc',      2,  2352.49),
    (2024, 'final',       'Napa County',    'Cabernet Franc',      4, 11332.38),
    (2024, 'final',       'Sonoma County',  'Cabernet Franc',      3,  4581.97),
    (2024, 'final',       'Lake County',    'Cabernet Franc',      2,  2439.88),
    (2025, 'preliminary', 'Napa County',    'Cabernet Franc',      4, 11131.59),
    (2025, 'preliminary', 'Sonoma County',  'Cabernet Franc',      3,  4711.63),
    (2025, 'preliminary', 'Lake County',    'Cabernet Franc',      2,  1807.31),
]

GEOGRAPHY_TYPE = {
    'Napa County':   'county',
    'Sonoma County': 'county',
    'Lake County':   'county',
}


def build_rows():
    """Build all observation rows ready for upsert."""
    rows = []

    # ── Overall averages ─────────────────────────────────
    for year, report_type, geography, district, value in OVERALL_AVG:
        rows.append({
            'geography':      geography,
            'geography_type': GEOGRAPHY_TYPE[geography],
            'domain':         'grape_crush',
            'metric':         'weighted_avg_price_per_ton',
            'dimension':      f'district|{district}',
            'period_type':    'annual',
            'period_start':   date(year, 1, 1).isoformat(),
            'period_end':     date(year, 12, 31).isoformat(),
            'value':          value,
            'unit':           'dollars_per_ton',
            'report_type':    report_type,
            'confidence':     'verified',
            'source_name':    SOURCE_NAME,
            'source_url':     SOURCE_URL,
            'source_doc':     f'CDFA Grape Crush Report {year} '
                              f'{"Preliminary" if report_type == "preliminary" else "Final"}',
            'ingested_by':    '02_seed_grape_crush.py',
            'notes':          ('District-wide weighted average across all varietals. '
                               'Source: CDFA/USDA-NASS Table 6, TOTAL ALL VARIETIES row.'),
        })

    # ── Varietal prices ──────────────────────────────────
    for year, report_type, geography, varietal, district, value in VARIETAL_PRICES:
        rows.append({
            'geography':      geography,
            'geography_type': GEOGRAPHY_TYPE[geography],
            'domain':         'grape_crush',
            'metric':         'weighted_avg_price_per_ton',
            'dimension':      f'varietal|{varietal}|district|{district}',
            'period_type':    'annual',
            'period_start':   date(year, 1, 1).isoformat(),
            'period_end':     date(year, 12, 31).isoformat(),
            'value':          value,
            'unit':           'dollars_per_ton',
            'report_type':    report_type,
            'confidence':     'verified',
            'source_name':    SOURCE_NAME,
            'source_url':     SOURCE_URL,
            'source_doc':     f'CDFA Grape Crush Report {year} '
                              f'{"Preliminary" if report_type == "preliminary" else "Final"}',
            'ingested_by':    '02_seed_grape_crush.py',
            'notes':          ('Weighted average grower return per ton, delivered basis, '
                               'non-related purchased tonnage only. '
                               'Source: CDFA/USDA-NASS Table 6.'),
        })

    return rows


def run(dry_run=False, force=False):
    if not SUPABASE_KEY:
        print('ERROR: SUPABASE_KEY environment variable not set.')
        print('Usage: SUPABASE_KEY=your_service_key python3 02_seed_grape_crush.py')
        sys.exit(1)

    rows = build_rows()
    print(f'Built {len(rows)} rows to upsert.')
    print(f'  Overall averages : {len(OVERALL_AVG)}')
    print(f'  Varietal prices  : {len(VARIETAL_PRICES)}')

    if dry_run:
        print('\n── DRY RUN — first 3 rows ──────────────────────')
        for r in rows[:3]:
            print(r)
        print(f'\n── DRY RUN — no data written ───────────────────')
        return

    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Upsert in batches of 50
    batch_size = 50
    inserted = 0
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]
        result = (sb.table('community_observations')
                    .upsert(batch,
                            on_conflict='geography,domain,metric,dimension,'
                                        'period_start,period_end,source_name')
                    .execute())
        inserted += len(batch)
        print(f'  Upserted rows {i+1}–{min(i+batch_size, len(rows))}')

    # Update data_sources registry
    sb.table('data_sources').update({
        'last_ingested': 'now()',
        'last_period':   '2025 Preliminary, 2024 Final, 2023 Final',
        'next_expected': '2026-04-30',   # 2025 final report expected
        'updated_at':    'now()',
    }).eq('source_name', SOURCE_NAME).execute()

    print(f'\n✓ Done. {inserted} rows upserted into community_observations.')
    print('✓ data_sources registry updated.')
    print('\nTo verify:')
    print("  SELECT geography, metric, dimension, period_start, value")
    print("  FROM community_observations")
    print("  WHERE domain = 'grape_crush'")
    print("  ORDER BY geography, dimension, period_start;")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Seed grape crush data')
    parser.add_argument('--dry-run', action='store_true',
                        help='Print rows without inserting')
    parser.add_argument('--force',   action='store_true',
                        help='Upsert even if rows already exist')
    args = parser.parse_args()
    run(dry_run=args.dry_run, force=args.force)

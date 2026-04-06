"""
seed_nvf_subscribers.py
NapaServe — Seed nvf_subscribers from Substack CSV export

Usage:
    SUPABASE_KEY=your_service_key python3 seed_nvf_subscribers.py
    SUPABASE_KEY=your_service_key python3 seed_nvf_subscribers.py --csv ~/path/to/file.csv
    python3 seed_nvf_subscribers.py --dry-run
"""

import os
import sys
import csv
import argparse
from datetime import datetime

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
DEFAULT_CSV = os.path.expanduser(
    '~/Desktop/subscriber-export-2026-04-06-16-23-41.csv')

BATCH_SIZE = 500


def parse_timestamp(val):
    """Parse ISO timestamp string, return None if empty or non-parseable."""
    if not val or not val.strip():
        return None
    cleaned = val.strip()
    if cleaned.lower() == 'never':
        return None
    try:
        datetime.fromisoformat(cleaned.replace('Z', '+00:00'))
    except (ValueError, TypeError):
        return None
    return cleaned


def parse_int(val):
    """Cast to int, 0 if empty."""
    if not val or not val.strip():
        return 0
    try:
        return int(val.strip())
    except ValueError:
        return 0


def parse_float_revenue(val):
    """Parse revenue like '$1,234.56' → 1234.56, 0.0 if empty."""
    if not val or not val.strip():
        return 0.0
    cleaned = val.strip().replace('$', '').replace(',', '')
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


TYPE_MAP = {
    'free': 'substack_free',
    'yearly subscriber': 'substack_paid',
    'monthly subscriber': 'substack_paid',
    'yearly gift': 'substack_gift',
    'founding member': 'substack_founding',
    'comp': 'substack_comp',
    'author': 'substack_comp',
}


def resolve_subscription_type(row_type, stripe_plan):
    """Map Type + Stripe plan → subscription_type."""
    raw = (row_type or '').strip().lower()
    return TYPE_MAP.get(raw, 'substack_free')


def parse_row(row):
    """Convert a CSV dict row → nvf_subscribers record."""
    sub_type = resolve_subscription_type(row.get('Type', ''),
                                         row.get('Stripe plan', ''))
    cancel_date = parse_timestamp(row.get('Cancel date', ''))
    status = 'cancelled' if cancel_date else 'active'

    return {
        'email': (row.get('Email', '') or '').strip().lower(),
        'name': (row.get('Name', '') or '').strip() or None,
        'subscription_type': sub_type,
        'stripe_plan': (row.get('Stripe plan', '') or '').strip() or None,
        'subscribed_at': parse_timestamp(row.get('Start date', '')),
        'paid_upgraded_at': parse_timestamp(row.get('Paid upgrade date', '')),
        'first_paid_at': parse_timestamp(row.get('First paid date', '')),
        'cancelled_at': cancel_date,
        'expires_at': parse_timestamp(row.get('Expiration date', '')),
        'country': (row.get('Country', '') or '').strip() or None,
        'state_province': (row.get('State/Province', '') or '').strip() or None,
        'emails_received_6mo': parse_int(row.get('Emails received (6mo)', '')),
        'emails_opened_6mo': parse_int(row.get('Emails opened (6mo)', '')),
        'emails_opened_30d': parse_int(row.get('Emails opened (30d)', '')),
        'emails_opened_7d': parse_int(row.get('Emails opened (7d)', '')),
        'last_email_open': parse_timestamp(row.get('Last email open', '')),
        'post_views_total': parse_int(row.get('Post views', '')),
        'post_views_30d': parse_int(row.get('Post views (30d)', '')),
        'unique_posts_seen': parse_int(row.get('Unique posts seen', '')),
        'days_active_30d': parse_int(row.get('Days active (30d)', '')),
        'activity_score': parse_int(row.get('Activity', '')),
        'last_clicked_at': parse_timestamp(row.get('Last clicked at', '')),
        'lifetime_revenue': parse_float_revenue(row.get('Revenue', '')),
        'source_free': (row.get('Subscription source (free)', '') or '').strip() or None,
        'source_paid': (row.get('Subscription source (paid)', '') or '').strip() or None,
        'publication': 'nvf',
        'county_id': 'napa',
        'status': status,
    }


def read_csv(path):
    """Read CSV and return list of parsed records."""
    records = []
    with open(path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rec = parse_row(row)
            if rec['email']:
                records.append(rec)
    return records


def dry_run(records):
    """Print summary without inserting."""
    print(f'\n── DRY RUN ──')
    print(f'Total rows: {len(records)}')

    type_counts = {}
    for r in records:
        t = r['subscription_type']
        type_counts[t] = type_counts.get(t, 0) + 1
    print(f'\nSubscription type breakdown:')
    for t, c in sorted(type_counts.items()):
        print(f'  {t}: {c}')

    print(f'\nFirst 3 parsed rows:')
    for i, r in enumerate(records[:3]):
        print(f'\n  Row {i+1}:')
        for k, v in r.items():
            if v is not None and v != 0 and v != 0.0:
                print(f'    {k}: {v}')


def upsert_records(records):
    """Upsert records into nvf_subscribers in batches."""
    if not SUPABASE_KEY:
        print('ERROR: SUPABASE_KEY not set in environment')
        sys.exit(1)

    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    total = len(records)
    upserted = 0
    errors = []

    for i in range(0, total, BATCH_SIZE):
        batch = records[i:i + BATCH_SIZE]
        try:
            sb.table('nvf_subscribers').upsert(
                batch,
                on_conflict='email'
            ).execute()
            upserted += len(batch)
            print(f'  Upserted {upserted}/{total}...')
        except Exception as e:
            err_msg = str(e)
            for rec in batch:
                errors.append({'email': rec['email'], 'reason': err_msg})
            print(f'  Batch error at rows {i+1}-{i+len(batch)}: {err_msg}')

    print(f'\n── SUMMARY ──')
    print(f'Total rows:        {total}')
    print(f'Inserted/updated:  {upserted}')
    print(f'Errors:            {len(errors)}')
    if errors:
        print(f'\nError details:')
        for e in errors:
            print(f'  {e["email"]}: {e["reason"]}')


def main():
    parser = argparse.ArgumentParser(
        description='Seed nvf_subscribers from Substack CSV')
    parser.add_argument('--csv', default=DEFAULT_CSV,
                        help='Path to Substack subscriber CSV')
    parser.add_argument('--dry-run', action='store_true',
                        help='Print summary without inserting')
    args = parser.parse_args()

    csv_path = os.path.expanduser(args.csv)
    if not os.path.exists(csv_path):
        print(f'ERROR: CSV not found at {csv_path}')
        sys.exit(1)

    print(f'Reading {csv_path}...')
    records = read_csv(csv_path)
    print(f'Parsed {len(records)} rows')

    if args.dry_run:
        dry_run(records)
    else:
        upsert_records(records)


if __name__ == '__main__':
    main()

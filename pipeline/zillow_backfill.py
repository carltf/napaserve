"""
NapaServe — Zillow ZHVI Backfill
One-time script to backfill home_value for existing snapshots.

Downloads the full Zillow ZHVI county CSV, extracts all monthly values
for Napa County, then updates any economic_pulse_snapshots rows where
home_value IS NULL with the closest Zillow month <= run_date.

Usage:
  SUPABASE_URL=... SUPABASE_KEY=... python pipeline/zillow_backfill.py
"""

import os
import io
import csv
import requests
from datetime import datetime

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
SUPABASE_TABLE = "economic_pulse_snapshots"

ZILLOW_ZHVI_URL = "https://files.zillowstatic.com/research/public_csvs/zhvi/County_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"


def supabase_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def fetch_napa_zhvi_history() -> dict:
    """
    Download Zillow ZHVI CSV and return all monthly values for Napa County.
    Returns {"2020-01-31": 654321.0, "2020-02-29": 658000.0, ...}
    """
    print("Downloading Zillow ZHVI CSV...")
    resp = requests.get(ZILLOW_ZHVI_URL, timeout=120)
    resp.raise_for_status()

    reader = csv.DictReader(io.StringIO(resp.text))
    for row in reader:
        region_name = row.get("RegionName", "")
        state = row.get("StateName", row.get("State", ""))
        if "Napa" in region_name and ("CA" in state or "California" in state):
            date_cols = sorted(c for c in row.keys() if c[:4].isdigit())
            history = {}
            for col in date_cols:
                val = row[col]
                if val and val != "":
                    history[col] = float(val)
            print(f"Found {len(history)} monthly ZHVI values for Napa County")
            return history

    raise RuntimeError("Could not find Napa County in Zillow ZHVI CSV")


def fetch_null_home_value_rows() -> list:
    """Fetch all snapshot rows where home_value is NULL."""
    url = (
        f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}"
        f"?select=run_date&home_value=is.null&order=run_date.asc"
    )
    resp = requests.get(url, headers=supabase_headers())
    resp.raise_for_status()
    rows = resp.json()
    print(f"Found {len(rows)} snapshots with home_value = NULL")
    return rows


def find_closest_zhvi(run_date: str, zhvi_dates: list) -> str | None:
    """Find the latest ZHVI date that is <= run_date."""
    for d in reversed(zhvi_dates):
        if d <= run_date:
            return d
    return None


def update_home_value(run_date: str, home_value: float, zhvi_as_of: str):
    """Patch a single snapshot row."""
    url = (
        f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}"
        f"?run_date=eq.{run_date}"
    )
    resp = requests.patch(
        url,
        headers=supabase_headers(),
        json={"home_value": home_value, "zillow_zhvi_as_of": zhvi_as_of},
    )
    resp.raise_for_status()


def run():
    zhvi = fetch_napa_zhvi_history()
    zhvi_dates = sorted(zhvi.keys())

    rows = fetch_null_home_value_rows()
    if not rows:
        print("Nothing to backfill.")
        return

    updated = 0
    skipped = 0
    for row in rows:
        run_date = row["run_date"]
        match = find_closest_zhvi(run_date, zhvi_dates)
        if match is None:
            print(f"  {run_date}: no ZHVI data available — skipped")
            skipped += 1
            continue
        value = zhvi[match]
        update_home_value(run_date, value, match)
        print(f"  {run_date}: set home_value = ${value:,.0f} (ZHVI {match})")
        updated += 1

    print(f"\nDone. Updated: {updated}, Skipped: {skipped}, Total: {len(rows)}")


if __name__ == "__main__":
    run()

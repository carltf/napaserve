"""
NapaServe Economic Pulse — Weekly Snapshot Pipeline
Runs every Monday via GitHub Actions.

Fetches:
  1. ABC Type-02 winery license counts (Napa + statewide) from daily CSV export
  2. FRED series: food services jobs + civilian labor force + unemployment
  3. Zillow home values (monthly CSV for durable series)
  4. EDD Napa labor PDF (monthly; no-ops if month hasn't changed)

Writes a new snapshot row to Supabase, computes WoW deltas,
and generates the summary narrative.

Required environment variables:
  SUPABASE_URL        — e.g. https://xxxx.supabase.co
  SUPABASE_KEY        — service role key (not anon)
  FRED_API_KEY        — free key from https://fred.stlouisfed.org/docs/api/api_key.html
"""

import os
import io
import csv
import json
import zipfile
import logging
import requests
from datetime import datetime, timedelta
from typing import Optional

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
FRED_API_KEY = os.environ["FRED_API_KEY"]

SUPABASE_TABLE = "economic_pulse_snapshots"

# FRED series IDs
FRED_FOOD_SERVICES = "SMU06349007072200001SA"
FRED_LABOR_FORCE   = "LAUCN060550000000006"   # Napa County civilian labor force
FRED_UNEMPLOYMENT  = "LAUCN060550000000003"   # Napa County unemployment rate

# ABC daily export
ABC_CSV_ZIP_URL = "https://www.abc.ca.gov/wp-content/uploads/DailyExport/DailyExport-CSV.zip"
NAPA_COUNTY_NAME = "NAPA"  # as it appears in the export

# Zillow research data (ZHVI — all homes, smoothed, county level)
ZILLOW_ZHVI_URL = "https://files.zillowstatic.com/research/public_csvs/zhvi/County_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"

# EDD PDF (stable URL, monthly updates)
EDD_PDF_URL = "https://labormarketinfo.edd.ca.gov/file/lfmonth/napa$pds.pdf"

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Supabase helpers
# ---------------------------------------------------------------------------

def supabase_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def supabase_get_latest() -> Optional[dict]:
    """Fetch the most recent snapshot row."""
    url = f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}?order=run_date.desc&limit=1"
    r = requests.get(url, headers=supabase_headers())
    r.raise_for_status()
    rows = r.json()
    return rows[0] if rows else None


def supabase_insert(row: dict) -> dict:
    """Insert a new snapshot row."""
    url = f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}"
    r = requests.post(url, headers=supabase_headers(), json=row)
    r.raise_for_status()
    return r.json()


# ---------------------------------------------------------------------------
# 1. ABC Type-02 license counts
# ---------------------------------------------------------------------------

def fetch_abc_type02_counts() -> dict:
    """
    Download ABC daily CSV export, count Type-02 records.
    Returns {"napa": int, "statewide": int, "as_of": str}

    Uses RECORD COUNT (not unique license dedup) per project decision.
    """
    log.info("Fetching ABC daily CSV export...")
    headers = {"User-Agent": "Mozilla/5.0 (NapaServe Economic Pulse Pipeline)"}
    resp = requests.get(ABC_CSV_ZIP_URL, headers=headers, timeout=120)
    resp.raise_for_status()

    z = zipfile.ZipFile(io.BytesIO(resp.content))
    # The zip typically contains one CSV file
    csv_names = [n for n in z.namelist() if n.lower().endswith(".csv")]
    if not csv_names:
        raise RuntimeError(f"No CSV found in ABC zip. Contents: {z.namelist()}")

    csv_filename = csv_names[0]
    log.info(f"Parsing {csv_filename}...")

    napa_count = 0
    statewide_count = 0

    with z.open(csv_filename) as f:
        reader = csv.DictReader(io.TextIOWrapper(f, encoding="utf-8-sig"))
        # Normalize header names (ABC headers can have whitespace)
        fieldnames = [fn.strip().upper() for fn in reader.fieldnames]
        reader.fieldnames = fieldnames

        for row in reader:
            license_type = row.get("LICENSE TYPE", row.get("LICENSETYPE", "")).strip()
            if license_type != "02":
                continue

            statewide_count += 1

            county = row.get("PREMISE COUNTY", row.get("COUNTY", "")).strip().upper()
            if county == NAPA_COUNTY_NAME:
                napa_count += 1

    log.info(f"ABC Type-02 counts — Napa: {napa_count}, Statewide: {statewide_count}")
    return {
        "napa_type02_count": napa_count,
        "ca_type02_count": statewide_count,
        "abc_as_of": datetime.now().strftime("%Y-%m-%d"),
    }


# ---------------------------------------------------------------------------
# 2. FRED series
# ---------------------------------------------------------------------------

def fetch_fred_latest(series_id: str) -> dict:
    """Fetch the most recent observation from a FRED series."""
    url = "https://api.stlouisfed.org/fred/series/observations"
    params = {
        "series_id": series_id,
        "api_key": FRED_API_KEY,
        "file_type": "json",
        "sort_order": "desc",
        "limit": 1,
    }
    r = requests.get(url, params=params, timeout=30)
    r.raise_for_status()
    obs = r.json()["observations"]
    if not obs:
        return {"value": None, "date": None}
    return {"value": float(obs[0]["value"]), "date": obs[0]["date"]}


def fetch_fred_data() -> dict:
    """Pull latest from all three FRED series."""
    log.info("Fetching FRED data...")

    food = fetch_fred_latest(FRED_FOOD_SERVICES)
    labor = fetch_fred_latest(FRED_LABOR_FORCE)
    unemp = fetch_fred_latest(FRED_UNEMPLOYMENT)

    log.info(f"FRED — Food services: {food}, Labor force: {labor}, Unemployment: {unemp}")

    return {
        "food_services_employment": food["value"],
        "food_services_as_of": food["date"],
        "labor_force": labor["value"],
        "labor_force_as_of": labor["date"],
        "unemployment_rate": unemp["value"],
        "unemployment_as_of": unemp["date"],
    }


# ---------------------------------------------------------------------------
# 3. Zillow ZHVI (monthly CSV — durable series)
# ---------------------------------------------------------------------------

def fetch_zillow_zhvi() -> dict:
    """
    Download Zillow ZHVI county CSV and extract Napa County's latest value.
    Returns {"home_value": float, "zhvi_as_of": str (YYYY-MM)}
    """
    log.info("Fetching Zillow ZHVI CSV...")
    resp = requests.get(ZILLOW_ZHVI_URL, timeout=60)
    resp.raise_for_status()

    reader = csv.DictReader(io.StringIO(resp.text))
    for row in reader:
        # Napa County FIPS: 06055, or match by name
        region_name = row.get("RegionName", "")
        state = row.get("StateName", row.get("State", ""))
        if "Napa" in region_name and ("CA" in state or "California" in state):
            # Date columns are the last ones, format: YYYY-MM-DD
            date_cols = [c for c in row.keys() if c[:4].isdigit()]
            if not date_cols:
                break
            date_cols.sort()
            latest_col = date_cols[-1]
            val = row[latest_col]
            if val and val != "":
                log.info(f"Zillow ZHVI for Napa: ${float(val):,.0f} as of {latest_col}")
                return {
                    "home_value": float(val),
                    "zhvi_as_of": latest_col,
                }
            break

    log.warning("Could not find Napa County in Zillow ZHVI CSV")
    return {"home_value": None, "zhvi_as_of": None}


# ---------------------------------------------------------------------------
# 4. Narrative generation
# ---------------------------------------------------------------------------

def generate_summary(current: dict, prior: Optional[dict]) -> str:
    """
    Generate the 'Key Local Takeaways' summary from current and prior snapshots.
    Deterministic template — no LLM needed.
    """
    parts = []

    # Unemployment
    unemp = current.get("unemployment_rate")
    if unemp is not None:
        as_of = current.get("unemployment_as_of", "")
        if prior and prior.get("unemployment_rate") is not None:
            prev = prior["unemployment_rate"]
            if abs(unemp - prev) < 0.15:
                parts.append(f"Napa County unemployment held steady at {unemp:.1f}% (data through {as_of}).")
            elif unemp > prev:
                parts.append(f"Napa County unemployment edged up to {unemp:.1f}% from {prev:.1f}% (data through {as_of}).")
            else:
                parts.append(f"Napa County unemployment improved to {unemp:.1f}% from {prev:.1f}% (data through {as_of}).")
        else:
            parts.append(f"Napa County unemployment stands at {unemp:.1f}% (data through {as_of}).")

    # Winery licenses
    napa_lic = current.get("napa_type02_count")
    if napa_lic is not None and prior and prior.get("napa_type02_count") is not None:
        prev_lic = prior["napa_type02_count"]
        diff = napa_lic - prev_lic
        if diff == 0:
            parts.append(f"Napa County winery licenses flat at {napa_lic:,}.")
        elif diff > 0:
            parts.append(f"Napa County added {diff} winery license(s) to {napa_lic:,}, continuing a slow recovery.")
        else:
            parts.append(f"Napa County winery licenses dipped by {abs(diff)} to {napa_lic:,}.")
    elif napa_lic is not None:
        parts.append(f"Napa County has {napa_lic:,} Type-02 winery licenses.")

    # Home values
    hv = current.get("home_value")
    if hv is not None and prior and prior.get("home_value") is not None:
        prev_hv = prior["home_value"]
        pct = ((hv - prev_hv) / prev_hv) * 100 if prev_hv else 0
        direction = "up" if pct > 0 else "down"
        parts.append(f"Average Napa home value is ${hv:,.0f}, {direction} {abs(pct):.1f}% from prior snapshot.")

    # Labor force
    lf = current.get("labor_force")
    if lf is not None:
        parts.append(f"Civilian labor force at {lf:,.0f}.")

    return " ".join(parts) if parts else "Weekly snapshot recorded; narrative pending data."


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def run():
    today = datetime.now().strftime("%Y-%m-%d")
    log.info(f"=== NapaServe Weekly Snapshot — {today} ===")

    # Get prior snapshot for WoW comparison
    prior = supabase_get_latest()
    if prior:
        log.info(f"Prior snapshot: {prior.get('run_date')}")
    else:
        log.info("No prior snapshot found — this is the first run.")

    # Fetch all sources
    abc = fetch_abc_type02_counts()
    fred = fetch_fred_data()
    zillow = fetch_zillow_zhvi()

    # Build snapshot row
    snapshot = {
        "run_date": today,
        "napa_type02_count": abc["napa_type02_count"],
        "ca_type02_count": abc["ca_type02_count"],
        "unemployment_rate": fred.get("unemployment_rate"),
        "labor_force": fred.get("labor_force"),
        "food_services_employment": fred.get("food_services_employment"),
        "home_value": zillow.get("home_value"),
        # Metadata
        "abc_as_of": abc.get("abc_as_of"),
        "fred_unemployment_as_of": fred.get("unemployment_as_of"),
        "fred_labor_force_as_of": fred.get("labor_force_as_of"),
        "fred_food_services_as_of": fred.get("food_services_as_of"),
        "zillow_zhvi_as_of": zillow.get("zhvi_as_of"),
        "fetch_status": "success",
    }

    # Compute WoW deltas
    if prior:
        for key in ["napa_type02_count", "ca_type02_count", "unemployment_rate",
                     "labor_force", "food_services_employment", "home_value"]:
            curr = snapshot.get(key)
            prev = prior.get(key)
            if curr is not None and prev is not None:
                snapshot[f"{key}_wow_delta"] = round(curr - prev, 4)

    # Generate narrative
    snapshot["summary"] = generate_summary(snapshot, prior)
    log.info(f"Summary: {snapshot['summary']}")

    # Insert into Supabase
    result = supabase_insert(snapshot)
    log.info(f"Snapshot inserted: {json.dumps(result, indent=2)[:500]}")

    return snapshot


if __name__ == "__main__":
    run()

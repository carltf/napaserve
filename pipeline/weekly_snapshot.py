"""
NapaServe Economic Pulse — Weekly Snapshot Pipeline
Runs every Monday via GitHub Actions.

Fetches:
  1. ABC Type-02 winery license counts (Napa + statewide) from ad-hoc report pages
  2. FRED series: food services jobs + civilian labor force + unemployment
  3. Zillow home values (monthly CSV for durable series)

Writes a new snapshot row to Supabase, computes WoW deltas,
and generates the summary narrative.

Required environment variables:
  SUPABASE_URL        — e.g. https://xxxx.supabase.co
  SUPABASE_KEY        — service role key (not anon)
  FRED_API_KEY        — free key from https://fred.stlouisfed.org/docs/api/api_key.html
"""

import os
import io
import re
import csv
import json
import logging
import requests
from datetime import datetime
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
FRED_LABOR_FORCE   = "NAPA906LFN"   # Napa County civilian labor force
FRED_UNEMPLOYMENT  = "CANAPA0URN"   # Napa County unemployment rate

# ABC ad-hoc report pages (same ones Tim uses manually)
ABC_NAPA_URL = "https://www.abc.ca.gov/licensing/licensing-reports/adhoc-report/?LICENSETYPE=02&RPTTYPE=6&COUNTY=28"
ABC_CA_URL   = "https://www.abc.ca.gov/licensing/licensing-reports/adhoc-report/?LICENSETYPE=02&RPTTYPE=6"

# Zillow research data (ZHVI — all homes, smoothed, county level)
ZILLOW_ZHVI_URL = "https://files.zillowstatic.com/research/public_csvs/zhvi/County_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"

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
    """Insert or update a snapshot row."""
    url = f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}?on_conflict=run_date"
    headers = supabase_headers()
    headers["Prefer"] = "return=representation,resolution=merge-duplicates"
    r = requests.post(url, headers=headers, json=row)
    if not r.ok:
        log.error(f"Supabase insert failed: {r.status_code} {r.text}")
    r.raise_for_status()
    return r.json()


# ---------------------------------------------------------------------------
# 1. ABC Type-02 license counts (from ad-hoc report pages)
# ---------------------------------------------------------------------------

def fetch_abc_page_count(url: str, label: str) -> Optional[int]:
    """
    Fetch an ABC ad-hoc report page and extract the record count.
    Tries multiple parsing strategies since the page format may vary.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
    log.info(f"Fetching ABC {label} page...")
    resp = requests.get(url, headers=headers, timeout=60)
    resp.raise_for_status()
    html = resp.text

    # Method 1 (primary): "Showing 1 to 10 of 1,854 entries"
    # This is the paginated format confirmed on the live ABC site (Mar 2026)
    match = re.search(r'Showing\s+\d+\s+to\s+\d+\s+of\s+([\d,]+)\s+entries', html)
    if match:
        count = int(match.group(1).replace(",", ""))
        log.info(f"ABC {label}: {count} (from 'Showing X to Y of Z entries')")
        return count

    # Method 2: "{number} Results" — seen during ABC performance issues
    match = re.search(r'([\d,]+)\s+Results', html)
    if match:
        count = int(match.group(1).replace(",", ""))
        log.info(f"ABC {label}: {count} (from '{{N}} Results' pattern)")
        return count

    # Method 3: Count table rows
    tr_count = len(re.findall(r'<tr[^>]*>', html)) - 1
    if tr_count > 100:  # sanity check
        log.info(f"ABC {label}: {tr_count} (from counting table rows)")
        return tr_count

    # Method 4: Count license entry patterns (LICENSE=NNNNNN in links) as last resort
    license_links = re.findall(r'LICENSE=(\d{4,})', html)
    if license_links:
        count = len(set(license_links))  # dedupe
        log.info(f"ABC {label}: {count} (from counting LICENSE= links)")
        return count

    log.warning(f"ABC {label}: Could not extract count from page")
    return None


def fetch_abc_type02_counts() -> dict:
    """
    Fetch Type-02 counts from ABC ad-hoc report pages.
    Returns {"napa_type02_count": int, "ca_type02_count": int, "abc_as_of": str}
    """
    napa = fetch_abc_page_count(ABC_NAPA_URL, "Napa")
    ca = fetch_abc_page_count(ABC_CA_URL, "CA Statewide")

    return {
        "napa_type02_count": napa,
        "ca_type02_count": ca,
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

# Food services is reported in thousands — multiply to get actual jobs
    food_value = round(food["value"] * 1000) if food["value"] is not None else None

    return {
        "food_services_employment": food_value,
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
        region_name = row.get("RegionName", "")
        state = row.get("StateName", row.get("State", ""))
        if "Napa" in region_name and ("CA" in state or "California" in state):
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
        as_of = current.get("fred_unemployment_as_of", "")
        if prior and prior.get("unemployment_rate") is not None:
            prev = float(prior["unemployment_rate"])
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
        prev_lic = int(prior["napa_type02_count"])
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
        prev_hv = float(prior["home_value"])
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

    # Fetch all sources (continue on failure)
    abc = {}
    try:
        abc = fetch_abc_type02_counts()
    except Exception as e:
        log.warning(f"ABC fetch failed (will skip): {e}")

    fred = {}
    try:
        fred = fetch_fred_data()
    except Exception as e:
        log.warning(f"FRED fetch failed (will skip): {e}")

    zillow = {}
    try:
        zillow = fetch_zillow_zhvi()
    except Exception as e:
        log.warning(f"Zillow fetch failed (will skip): {e}")

    # Build snapshot row
    snapshot = {
        "run_date": today,
        "napa_type02_count": abc.get("napa_type02_count"),
        "ca_type02_count": abc.get("ca_type02_count"),
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
        "fetch_status": "partial" if not abc else "success",
    }

    # Compute WoW deltas
    if prior:
        for key in ["napa_type02_count", "ca_type02_count", "unemployment_rate",
                     "labor_force", "food_services_employment", "home_value"]:
            curr = snapshot.get(key)
            prev = prior.get(key)
            if curr is not None and prev is not None:
                delta = float(curr) - float(prev)
                if key in ("napa_type02_count", "ca_type02_count"):
                    snapshot[f"{key}_wow_delta"] = int(delta)
                else:
                    snapshot[f"{key}_wow_delta"] = round(delta, 4)

    # Generate narrative
    snapshot["summary"] = generate_summary(snapshot, prior)
    log.info(f"Summary: {snapshot['summary']}")

    # Insert into Supabase
    result = supabase_insert(snapshot)
    log.info(f"Snapshot inserted: {json.dumps(result, indent=2)[:500]}")

    return snapshot


if __name__ == "__main__":
    run()

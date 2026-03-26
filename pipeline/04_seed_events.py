#!/usr/bin/env python3
"""
pipeline/04_seed_events.py
NapaServe — Event Intelligence Seed Script
Ingests events from three sources into community_events + event_series.

Usage:
  python3 pipeline/04_seed_events.py --source sheet   --file path/to/sheet.csv [--dry-run] [--limit N]
  python3 pipeline/04_seed_events.py --source napalife --dir  path/to/pdfs/    [--dry-run] [--limit N]
  python3 pipeline/04_seed_events.py --source weekender                         [--dry-run] [--limit N]
  python3 pipeline/04_seed_events.py --source all     --file path/to/sheet.csv --dir path/to/pdfs/ [--dry-run]

Env vars required:
  SUPABASE_URL  — e.g. https://csenpchwxxepdvjebsrt.supabase.co
  SUPABASE_KEY  — service role key
  ANTHROPIC_API_KEY

Run from ~/Desktop/napaserve
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import anthropic
import httpx

# ── Clients ──────────────────────────────────────────────────────────────────

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
ANTHROPIC_KEY = os.environ["ANTHROPIC_API_KEY"]

sb = httpx.Client(
    base_url=SUPABASE_URL,
    headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    },
    timeout=30,
)

claude = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

# ── GEO_HINTS (stable coords — same as search.js) ────────────────────────────

GEO_HINTS = {
    "napa":            {"lat": 38.2975, "lng": -122.2869},
    "st. helena":      {"lat": 38.5056, "lng": -122.4703},
    "st helena":       {"lat": 38.5056, "lng": -122.4703},
    "yountville":      {"lat": 38.3926, "lng": -122.3631},
    "calistoga":       {"lat": 38.5780, "lng": -122.5797},
    "american canyon": {"lat": 38.1686, "lng": -122.2608},
    "angwin":          {"lat": 38.5738, "lng": -122.4490},
    "rutherford":      {"lat": 38.4566, "lng": -122.4241},
    "oakville":        {"lat": 38.4294, "lng": -122.4094},
}

CATEGORY_MAP = {
    "music": "music", "concert": "music", "live music": "music",
    "art": "art", "exhibit": "art", "gallery": "art",
    "wine": "food", "culinary": "food", "food": "food", "tasting": "food",
    "wellness": "wellness", "yoga": "wellness", "health": "wellness",
    "movie": "movies", "film": "movies", "cinema": "movies",
    "community": "community", "charity": "community", "family": "community",
    "theatre": "theatre", "theater": "theatre", "performance": "theatre",
}

VALID_CATEGORIES = {"art", "music", "food", "wellness", "nightlife", "movies", "community", "theatre", "any"}

# ── Claude extraction ─────────────────────────────────────────────────────────

EXTRACTION_SYSTEM = """You are an event data extraction system for a local media organization covering Napa County, California.

Extract structured event data from the provided text. Return ONLY a JSON array — no preamble, no markdown, no explanation.

Each event object must use exactly these fields:
{
  "title": string,
  "event_date": "YYYY-MM-DD or null",
  "end_date": "YYYY-MM-DD or null",
  "start_time": "string like '6:00 PM' or null",
  "end_time": "string like '9:00 PM' or null",
  "venue_name": "string or null",
  "address": "street address only, no city/state, or null",
  "city": "Napa | St. Helena | Yountville | Calistoga | American Canyon | Angwin | Rutherford | Oakville | other Napa County city, or null",
  "category": "one of: art | music | food | wellness | nightlife | movies | community | theatre | any",
  "description": "1–2 sentence summary, original text only, no invention",
  "website_url": "string or null",
  "ticket_url": "string or null",
  "organizer_name": "string or null",
  "price_info": "string or null",
  "is_free": true | false | null,
  "is_recurring": true | false | null,
  "recurrence_pattern_text": "e.g. 'annual in May' or null",
  "lat": number or null,
  "lng": number or null,
  "source_confidence": 0.0–1.0
}

Rules:
- Dates must be ISO format YYYY-MM-DD. If only month/day present, infer year from context or leave null.
- lat/lng: use known Napa County coordinates only. If city is known, use: Napa (38.2975, -122.2869), St. Helena (38.5056, -122.4703), Yountville (38.3926, -122.3631), Calistoga (38.578, -122.5797), American Canyon (38.1686, -122.2608). If unsure, set null.
- If text mentions multiple events, return one object per event.
- Do not invent details. Leave null if uncertain.
- Ignore subscription, advertising, and masthead content.
- source_confidence: 0.9 = date+venue+title all clear; 0.7 = minor ambiguity; 0.5 = inferred; below 0.4 = skip."""


def extract_events_from_text(text: str, source_label: str = "") -> list[dict]:
    """Send text to Claude, return list of extracted event dicts."""
    if len(text) > 12000:
        text = text[:12000]

    try:
        resp = claude.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4000,
            system=EXTRACTION_SYSTEM,
            messages=[{"role": "user", "content": f"Source: {source_label}\n\n{text}"}],
        )
        raw = resp.content[0].text.strip()
        # Strip any accidental markdown fences
        raw = re.sub(r"^```json\s*", "", raw)
        raw = re.sub(r"```$", "", raw).strip()
        events = json.loads(raw)
        if isinstance(events, dict):
            events = [events]
        return [e for e in events if isinstance(e, dict)]
    except Exception as ex:
        print(f"  ⚠ Claude extraction failed for {source_label}: {ex}")
        return []


# ── Supabase writes ───────────────────────────────────────────────────────────

def upsert_community_event(ev: dict, source: str, source_url: str | None, dry_run: bool) -> int | None:
    """Insert into community_events. Returns inserted id or None."""
    if not ev.get("title") or not ev.get("event_date"):
        return None

    city_raw = (ev.get("city") or "").strip()
    town = city_raw.lower().replace(".", "").replace(" ", "-") if city_raw else "napa"

    geo = GEO_HINTS.get(city_raw.lower()) or GEO_HINTS.get("napa")

    # Normalise category
    cat_raw = (ev.get("category") or "any").lower()
    category = cat_raw if cat_raw in VALID_CATEGORIES else "any"

    row = {
        "title":            ev["title"][:200],
        "description":      (ev.get("description") or "")[:1000],
        "event_date":       ev["event_date"],
        "end_date":         ev.get("end_date"),
        "start_time":       ev.get("start_time"),
        "end_time":         ev.get("end_time"),
        "venue_name":       ev.get("venue_name"),
        "address":          ev.get("address"),
        "town":             town,
        "category":         category,
        "price_info":       ev.get("price_info"),
        "is_free":          ev.get("is_free"),
        "is_recurring":     ev.get("is_recurring"),
        "recurrence_desc":  ev.get("recurrence_pattern_text"),
        "website_url":      ev.get("website_url"),
        "ticket_url":       ev.get("ticket_url"),
        "organizer_contact": ev.get("organizer_name"),
        "source":           source,
        "source_url":       source_url,
        "status":           "approved",
        "lat":              ev.get("lat") or (geo["lat"] if geo else None),
        "lng":              ev.get("lng") or (geo["lng"] if geo else None),
    }

    if dry_run:
        print(f"  [DRY-RUN] community_events ← {row['title']} | {row['event_date']} | {row['town']}")
        return -1

    r = sb.post("/rest/v1/community_events", json=row)
    if r.status_code in (200, 201):
        data = r.json()
        return data[0]["id"] if data else None
    elif r.status_code == 409:
        print(f"  → duplicate skipped: {row['title']}")
        return None
    else:
        print(f"  ✗ insert failed {r.status_code}: {r.text[:200]}")
        return None


def upsert_event_series(ev: dict, community_event_id: int | None, dry_run: bool):
    """Upsert recurring events into event_series + event_instances."""
    if not ev.get("is_recurring"):
        return

    canonical = (ev.get("title") or "").strip()
    if not canonical:
        return

    city_raw = (ev.get("city") or "").strip()
    geo = GEO_HINTS.get(city_raw.lower()) or None

    series_row = {
        "canonical_name":        canonical,
        "slug":                  re.sub(r"[^a-z0-9]+", "-", canonical.lower()).strip("-"),
        "event_type":            ev.get("category") or "any",
        "organizer_name":        ev.get("organizer_name"),
        "primary_website":       ev.get("website_url"),
        "description_short":     ev.get("description"),
        "city":                  city_raw or None,
        "typical_venue_name":    ev.get("venue_name"),
        "typical_venue_address": ev.get("address"),
        "lat":                   ev.get("lat") or (geo["lat"] if geo else None),
        "lng":                   ev.get("lng") or (geo["lng"] if geo else None),
        "recurrence_pattern_text": ev.get("recurrence_pattern_text"),
        "confidence_score":      ev.get("source_confidence") or 0.5,
        "status":                "active",
        "first_seen_date":       ev.get("event_date"),
        "last_seen_date":        ev.get("event_date"),
    }

    if dry_run:
        print(f"  [DRY-RUN] event_series ← {canonical}")
        return

    # Upsert on slug
    r = sb.post(
        "/rest/v1/event_series",
        json=series_row,
        headers={"Prefer": "resolution=merge-duplicates,return=representation"},
    )
    if r.status_code not in (200, 201):
        print(f"  ⚠ event_series upsert failed {r.status_code}: {r.text[:200]}")
        return

    series_data = r.json()
    if not series_data:
        return
    series_id = series_data[0]["id"]

    if community_event_id and community_event_id > 0:
        instance_row = {
            "community_event_id": community_event_id,
            "event_series_id":    series_id,
            "year":               int(ev["event_date"][:4]) if ev.get("event_date") else None,
            "lat":                series_row["lat"],
            "lng":                series_row["lng"],
            "source_type":        "seed",
            "source_confidence":  ev.get("source_confidence") or 0.5,
            "verification_status": "normalized",
        }
        sb.post("/rest/v1/event_instances", json=instance_row)


# ── Source: Google Sheet CSV ──────────────────────────────────────────────────

def seed_from_sheet(csv_path: str, dry_run: bool, limit: int):
    import csv
    print(f"\n📋 SOURCE: Google Sheet CSV — {csv_path}")

    rows = []
    with open(csv_path, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)

    print(f"  {len(rows)} rows total")
    if limit:
        rows = rows[:limit]
        print(f"  Processing first {limit} rows (--limit)")

    inserted = skipped = 0

    for i, row in enumerate(rows):
        msg = (row.get("Message") or "").strip()
        if len(msg) < 30:
            skipped += 1
            continue

        submitted_on = row.get("Submitted On") or ""
        org = row.get("Name of your business  organization") or row.get("Name") or ""
        town_hint = row.get("town") or ""

        context = f"Submitted: {submitted_on}\nOrganization: {org}\nTown hint: {town_hint}\n\n{msg}"
        events = extract_events_from_text(context, f"sheet-row-{i}")

        for ev in events:
            if not ev.get("city") and town_hint:
                ev["city"] = town_hint.title()
            cid = upsert_community_event(ev, "sheet", None, dry_run)
            if cid:
                upsert_event_series(ev, cid, dry_run)
                inserted += 1
            else:
                skipped += 1

        if (i + 1) % 20 == 0:
            print(f"  … {i+1}/{len(rows)} rows processed — {inserted} inserted, {skipped} skipped")
        time.sleep(0.3)  # rate limit buffer

    print(f"  ✅ Sheet done — {inserted} inserted, {skipped} skipped")


# ── Source: NapaLife PDFs ─────────────────────────────────────────────────────

def seed_from_napalife(pdf_dir: str, dry_run: bool, limit: int):
    try:
        from pypdf import PdfReader
    except ImportError:
        print("pypdf not installed. Run: pip install pypdf --break-system-packages")
        sys.exit(1)

    print(f"\n📰 SOURCE: NapaLife PDFs — {pdf_dir}")
    pdfs = sorted(Path(pdf_dir).glob("*.pdf"))
    if not pdfs:
        print("  No PDFs found.")
        return

    if limit:
        pdfs = pdfs[:limit]
        print(f"  Processing first {limit} PDFs (--limit)")

    inserted = skipped = 0

    for pdf_path in pdfs:
        print(f"  Reading {pdf_path.name} …")
        try:
            reader = PdfReader(str(pdf_path))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as ex:
            print(f"  ⚠ Could not read {pdf_path.name}: {ex}")
            skipped += 1
            continue

        if len(text.strip()) < 100:
            print(f"  ⚠ No extractable text in {pdf_path.name}")
            skipped += 1
            continue

        # Derive approximate publication date from filename if possible
        # e.g. nlxjan29.pdf → Jan 29; numbered files use mtime
        pub_date_hint = ""
        name = pdf_path.stem.lower()
        month_map = {"jan": "01", "feb": "02", "mar": "03", "apr": "04",
                     "may": "05", "jun": "06", "jul": "07", "aug": "08",
                     "sep": "09", "oct": "10", "nov": "11", "dec": "12"}
        for m, num in month_map.items():
            if m in name:
                day_match = re.search(r"(\d{1,2})$", name)
                if day_match:
                    pub_date_hint = f"2026-{num}-{day_match.group(1).zfill(2)}"
                break

        context = f"Publication: NapaLife newsletter\nDate hint: {pub_date_hint}\n\n{text}"
        events = extract_events_from_text(context, pdf_path.name)

        for ev in events:
            cid = upsert_community_event(ev, "napalife", f"file:{pdf_path.name}", dry_run)
            if cid:
                upsert_event_series(ev, cid, dry_run)
                inserted += 1
            else:
                skipped += 1

        time.sleep(0.5)

    print(f"  ✅ NapaLife done — {inserted} inserted, {skipped} skipped")


# ── Source: Weekender (nvf_posts in Supabase) ─────────────────────────────────

def seed_from_weekender(dry_run: bool, limit: int):
    print("\n📰 SOURCE: Weekender (nvf_posts)")

    # Fetch weekender posts from Supabase
    # nvf_posts columns: id, slug, title, subtitle, series, series_raw,
    # published_at, audience, word_count, clean_text, substack_url,
    # is_encore, created_at, updated_at
    params = {
        "select": "id,slug,title,clean_text,published_at",
        "title": "ilike.*weekender*",
        "order": "published_at.desc",
        "limit": str(limit or 100),
    }
    r = sb.get("/rest/v1/nvf_posts", params=params)
    if r.status_code != 200:
        print(f"  ✗ Could not fetch nvf_posts: {r.status_code} {r.text[:200]}")
        return

    posts = r.json()
    print(f"  {len(posts)} weekender posts found")

    if not posts:
        r2 = sb.get("/rest/v1/nvf_posts", params={
            "select": "id,title,clean_text,published_at",
            "order": "published_at.desc",
            "limit": "5",
        })
        sample = r2.json()
        if sample:
            print("  Sample post titles (to help diagnose filter):")
            for p in sample:
                print(f"    {p.get('title', '[no title]')}")
        return

    inserted = skipped = 0

    for post in posts:
        clean_text = (post.get("clean_text") or "").strip()
        if len(clean_text) < 100:
            skipped += 1
            continue

        pub_date = (post.get("published_at") or "")[:10]
        context = f"Publication: Napa Valley Features Weekender\nDate: {pub_date}\nTitle: {post.get('title','')}\n\n{clean_text}"
        events = extract_events_from_text(context, f"weekender-{post.get('id')}")

        for ev in events:
            slug = post.get("slug") or post.get("id", "")
            cid = upsert_community_event(
                ev,
                "weekender",
                f"https://napavalleyfocus.substack.com/p/{slug}",
                dry_run,
            )
            if cid:
                upsert_event_series(ev, cid, dry_run)
                inserted += 1
            else:
                skipped += 1

        time.sleep(0.3)

    print(f"  ✅ Weekender done — {inserted} inserted, {skipped} skipped")


# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Seed NapaServe event intelligence from multiple sources.")
    parser.add_argument("--source", choices=["sheet", "napalife", "weekender", "all"], required=True)
    parser.add_argument("--file",   help="Path to CSV file (required for sheet / all)")
    parser.add_argument("--dir",    help="Path to PDF directory (required for napalife / all)")
    parser.add_argument("--dry-run", action="store_true", help="Extract and print without writing to Supabase")
    parser.add_argument("--limit",  type=int, default=0, help="Max items to process per source (0 = unlimited)")
    args = parser.parse_args()

    if not os.environ.get("SUPABASE_URL"):
        sys.exit("Missing SUPABASE_URL env var")
    if not os.environ.get("SUPABASE_KEY"):
        sys.exit("Missing SUPABASE_KEY env var")
    if not os.environ.get("ANTHROPIC_API_KEY"):
        sys.exit("Missing ANTHROPIC_API_KEY env var")

    if args.dry_run:
        print("🔍 DRY-RUN MODE — nothing will be written to Supabase\n")

    started = datetime.now(timezone.utc)

    if args.source in ("sheet", "all"):
        if not args.file:
            sys.exit("--file required for --source sheet / all")
        seed_from_sheet(args.file, args.dry_run, args.limit)

    if args.source in ("napalife", "all"):
        if not args.dir:
            sys.exit("--dir required for --source napalife / all")
        seed_from_napalife(args.dir, args.dry_run, args.limit)

    if args.source in ("weekender", "all"):
        seed_from_weekender(args.dry_run, args.limit)

    elapsed = (datetime.now(timezone.utc) - started).total_seconds()
    print(f"\n⏱  Completed in {elapsed:.1f}s")


if __name__ == "__main__":
    main()

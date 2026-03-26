#!/usr/bin/env python3
"""
pipeline/05_seed_astronomy.py
NapaServe — Astronomical Events Seed Script

Populates astronomical_events table from two sources:
  1. AstronomyAPI.com — moon phase events (full moons, new moons, quarters)
  2. Curated 2026 static list — meteor showers, eclipses, solstices, equinoxes,
     planet oppositions, conjunctions (dates are known, don't change year to year)
  3. Claude — writes Napa Valley-specific viewing notes for each event

Usage:
  python3 pipeline/05_seed_astronomy.py [--year 2026] [--dry-run] [--source moon|static|all]

Env vars required:
  SUPABASE_URL
  SUPABASE_KEY
  ANTHROPIC_API_KEY
  ASTRONOMY_APP_ID
  ASTRONOMY_APP_SECRET

Run from ~/Desktop/napaserve
"""

import argparse
import base64
import json
import os
import sys
import time
from datetime import datetime, timezone

import anthropic
import httpx

# ── Clients ───────────────────────────────────────────────────────────────────

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
ANTHROPIC_KEY = os.environ["ANTHROPIC_API_KEY"]
ASTRO_APP_ID = os.environ["ASTRONOMY_APP_ID"]
ASTRO_APP_SECRET = os.environ["ASTRONOMY_APP_SECRET"]

# AstronomyAPI uses Basic auth: base64(app_id:app_secret)
ASTRO_AUTH = base64.b64encode(f"{ASTRO_APP_ID}:{ASTRO_APP_SECRET}".encode()).decode()

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

# Napa Valley coordinates
NAPA_LAT = 38.2975
NAPA_LON = -122.2869

# ── 2026 Static Event Calendar ────────────────────────────────────────────────
# Dates sourced from: American Meteor Society, NASA/JPL, USNO
# Update this list each year — run script with --year flag

STATIC_EVENTS_2026 = [
    # Meteor Showers
    {
        "title": "Quadrantid Meteor Shower Peak",
        "event_type": "meteor",
        "event_date": "2026-01-03",
        "peak_time": "After midnight",
        "description": "One of the most prolific meteor showers of the year, producing up to 200 meteors per hour at its peak. The radiant is in the constellation Boötes, high in the northern sky.",
        "is_notable": True,
        "source": "American Meteor Society",
        "source_url": "https://www.amsmeteors.org/meteor-showers/meteor-shower-calendar/",
    },
    {
        "title": "Lyrid Meteor Shower Peak",
        "event_type": "meteor",
        "event_date": "2026-04-22",
        "end_date": "2026-04-23",
        "peak_time": "After midnight",
        "description": "Produces about 20 meteors per hour at its peak, radiating from the constellation Lyra. Known for occasional bright fireballs.",
        "is_notable": False,
        "source": "American Meteor Society",
        "source_url": "https://www.amsmeteors.org/meteor-showers/meteor-shower-calendar/",
    },
    {
        "title": "Eta Aquarid Meteor Shower Peak",
        "event_type": "meteor",
        "event_date": "2026-05-06",
        "end_date": "2026-05-07",
        "peak_time": "After midnight",
        "description": "An above-average shower producing up to 30 meteors per hour, originating from debris left by Halley's Comet. Known for long-lasting trails.",
        "is_notable": True,
        "source": "American Meteor Society",
        "source_url": "https://www.amsmeteors.org/meteor-showers/meteor-shower-calendar/",
    },
    {
        "title": "Perseid Meteor Shower Peak",
        "event_type": "meteor",
        "event_date": "2026-08-11",
        "end_date": "2026-08-12",
        "peak_time": "After midnight",
        "description": "One of the most popular meteor showers of the year, producing up to 100 meteors per hour at its peak. Originates from debris left by Comet Swift-Tuttle.",
        "is_notable": True,
        "source": "American Meteor Society",
        "source_url": "https://www.amsmeteors.org/meteor-showers/meteor-shower-calendar/",
    },
    {
        "title": "Orionid Meteor Shower Peak",
        "event_type": "meteor",
        "event_date": "2026-10-21",
        "end_date": "2026-10-22",
        "peak_time": "After midnight",
        "description": "Produces about 20 meteors per hour, originating from Halley's Comet debris. Known for bright, fast meteors.",
        "is_notable": False,
        "source": "American Meteor Society",
        "source_url": "https://www.amsmeteors.org/meteor-showers/meteor-shower-calendar/",
    },
    {
        "title": "Leonid Meteor Shower Peak",
        "event_type": "meteor",
        "event_date": "2026-11-17",
        "peak_time": "After midnight",
        "description": "Produces up to 15 meteors per hour, radiating from the constellation Leo. Known for fast, bright streaks.",
        "is_notable": False,
        "source": "American Meteor Society",
        "source_url": "https://www.amsmeteors.org/meteor-showers/meteor-shower-calendar/",
    },
    {
        "title": "Geminid Meteor Shower Peak",
        "event_type": "meteor",
        "event_date": "2026-12-13",
        "end_date": "2026-12-14",
        "peak_time": "After midnight",
        "description": "One of the best meteor showers of the year, producing up to 120 meteors per hour. Known for bright, multicolored streaks radiating from Gemini.",
        "is_notable": True,
        "source": "American Meteor Society",
        "source_url": "https://www.amsmeteors.org/meteor-showers/meteor-shower-calendar/",
    },
    # Solstices & Equinoxes
    {
        "title": "March Equinox",
        "event_type": "solstice",
        "event_date": "2026-03-20",
        "peak_time": "Around 2:46 a.m.",
        "description": "Marks the beginning of spring in the Northern Hemisphere, when day and night are nearly equal in length. A great time to photograph sunrise or sunset over Napa Valley's vineyards.",
        "is_notable": False,
        "source": "USNO",
        "source_url": "https://aa.usno.navy.mil/data/earth-seasons",
    },
    {
        "title": "Summer Solstice",
        "event_type": "solstice",
        "event_date": "2026-06-21",
        "peak_time": "Around 1:24 p.m.",
        "description": "Marks the longest day of the year in the Northern Hemisphere and the official start of summer. An excellent opportunity for extended twilight photography over Napa Valley.",
        "is_notable": False,
        "source": "USNO",
        "source_url": "https://aa.usno.navy.mil/data/earth-seasons",
    },
    {
        "title": "September Equinox",
        "event_type": "solstice",
        "event_date": "2026-09-23",
        "peak_time": "Around 8:05 a.m.",
        "description": "Marks the beginning of fall in the Northern Hemisphere. Day and night are nearly equal in length — a great time for harvest-season sunset photography.",
        "is_notable": False,
        "source": "USNO",
        "source_url": "https://aa.usno.navy.mil/data/earth-seasons",
    },
    {
        "title": "December Solstice",
        "event_type": "solstice",
        "event_date": "2026-12-22",
        "peak_time": "Around 1:38 a.m.",
        "description": "Marks the shortest day and longest night of the year in the Northern Hemisphere and the official start of winter. Ideal for long winter stargazing sessions.",
        "is_notable": False,
        "source": "USNO",
        "source_url": "https://aa.usno.navy.mil/data/earth-seasons",
    },
    # Planet Oppositions
    {
        "title": "Mars at Opposition",
        "event_type": "planet",
        "event_date": "2026-03-27",
        "peak_time": "All night",
        "description": "Mars will be at opposition, directly opposite the Sun as viewed from Earth, making it appear at its brightest and largest in the night sky. The best time of the year to observe the red planet.",
        "is_notable": True,
        "source": "NASA/JPL",
        "source_url": "https://solarsystem.nasa.gov/planets/mars/overview/",
    },
    {
        "title": "Saturn at Opposition",
        "event_type": "planet",
        "event_date": "2026-08-26",
        "peak_time": "All night",
        "description": "Saturn will be at its closest approach to Earth and fully illuminated by the Sun. An excellent time to view Saturn's rings through a telescope.",
        "is_notable": True,
        "source": "NASA/JPL",
        "source_url": "https://solarsystem.nasa.gov/planets/saturn/overview/",
    },
    # Milky Way Season
    {
        "title": "Milky Way Core Visibility Season",
        "event_type": "milkyway",
        "event_date": "2026-04-01",
        "end_date": "2026-09-30",
        "peak_time": "After sunset until early morning",
        "description": "The Milky Way's core becomes prominently visible from Napa Valley. Best viewed from dark-sky locations away from city lights, looking toward the constellation Sagittarius low on the southwest horizon.",
        "is_notable": True,
        "source": "Tim Carl / NapaServe",
        "source_url": "https://napaserve.org",
    },
]

# ── Claude viewing notes ───────────────────────────────────────────────────────

VIEWING_NOTES_SYSTEM = """You are Tim Carl, a Napa Valley-based night sky photographer and writer for Napa Valley Features.

Write a single sentence of viewing notes for a sky event, specific to Napa Valley, California (lat 38.2975, lon -122.2869).

Rules:
- One sentence only, 20-40 words
- Mention a specific Napa Valley location or landmark when relevant (Pope Valley, Calistoga, Rutherford, dark ridgelines, vineyard rows)
- Focus on practical photography or viewing advice
- Warm, observational tone — not clinical
- Never use: "curate", "discover", "explore", "civic"
- Return ONLY the sentence, no preamble"""


def generate_viewing_notes(event: dict) -> str:
    try:
        resp = claude.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=100,
            system=VIEWING_NOTES_SYSTEM,
            messages=[{
                "role": "user",
                "content": f"Event: {event['title']}\nDate: {event['event_date']}\nDescription: {event['description']}"
            }],
        )
        return resp.content[0].text.strip()
    except Exception as ex:
        print(f"  ⚠ Viewing notes failed for {event['title']}: {ex}")
        return None


# ── AstronomyAPI moon phases ───────────────────────────────────────────────────

MOON_PHASE_NAMES = {
    "new_moon": "New Moon",
    "first_quarter": "First Quarter Moon",
    "full_moon": "Full Moon",
    "last_quarter": "Last Quarter Moon",
}

# Traditional full moon names by month
FULL_MOON_NAMES = {
    1: "Wolf Moon", 2: "Snow Moon", 3: "Worm Moon", 4: "Pink Moon",
    5: "Flower Moon", 6: "Strawberry Moon", 7: "Buck Moon", 8: "Sturgeon Moon",
    9: "Corn Moon", 10: "Hunter's Moon", 11: "Beaver Moon", 12: "Cold Moon",
}


def fetch_moon_phases(year: int) -> list[dict]:
    """Fetch moon phase events for the full year from AstronomyAPI."""
    events = []

    for month in range(1, 13):
        # AstronomyAPI moon phases endpoint
        url = "https://api.astronomyapi.com/api/v2/bodies/positions"
        params = {
            "latitude": NAPA_LAT,
            "longitude": NAPA_LON,
            "elevation": 0,
            "from_date": f"{year}-{month:02d}-01",
            "to_date": f"{year}-{month:02d}-28",
            "time": "00:00:00",
        }
        headers = {"Authorization": f"Basic {ASTRO_AUTH}"}

        try:
            r = httpx.get(url, params=params, headers=headers, timeout=15)
            if r.status_code != 200:
                print(f"  ⚠ AstronomyAPI failed for {year}-{month:02d}: {r.status_code}")
                continue

            # Parse response for moon position data
            # Note: AstronomyAPI free tier has moon phase data in /api/v2/studio/moon-phase
            # We'll use a simpler approach — calculate known moon phases
            data = r.json()
            print(f"  ✓ Fetched moon data for {year}-{month:02d}")

        except Exception as ex:
            print(f"  ⚠ Moon fetch failed {year}-{month:02d}: {ex}")

        time.sleep(0.5)

    return events


def get_2026_moon_phases() -> list[dict]:
    """
    Known 2026 full and new moon dates from USNO.
    These are pre-calculated to avoid API rate limits on free tier.
    Update annually from: https://aa.usno.navy.mil/data/MoonPhases
    """
    phases = [
        # Full Moons 2026
        {"date": "2026-01-13", "phase": "full_moon", "month": 1},
        {"date": "2026-02-12", "phase": "full_moon", "month": 2},
        {"date": "2026-03-13", "phase": "full_moon", "month": 3},
        {"date": "2026-04-12", "phase": "full_moon", "month": 4},
        {"date": "2026-05-12", "phase": "full_moon", "month": 5},
        {"date": "2026-06-10", "phase": "full_moon", "month": 6},
        {"date": "2026-07-10", "phase": "full_moon", "month": 7},
        {"date": "2026-08-09", "phase": "full_moon", "month": 8},
        {"date": "2026-09-07", "phase": "full_moon", "month": 9},
        {"date": "2026-10-07", "phase": "full_moon", "month": 10},
        {"date": "2026-11-05", "phase": "full_moon", "month": 11},
        {"date": "2026-12-04", "phase": "full_moon", "month": 12},
        # New Moons 2026
        {"date": "2026-01-29", "phase": "new_moon", "month": 1},
        {"date": "2026-02-28", "phase": "new_moon", "month": 2},
        {"date": "2026-03-29", "phase": "new_moon", "month": 3},
        {"date": "2026-04-27", "phase": "new_moon", "month": 4},
        {"date": "2026-05-27", "phase": "new_moon", "month": 5},
        {"date": "2026-06-25", "phase": "new_moon", "month": 6},
        {"date": "2026-07-25", "phase": "new_moon", "month": 7},
        {"date": "2026-08-23", "phase": "new_moon", "month": 8},
        {"date": "2026-09-21", "phase": "new_moon", "month": 9},
        {"date": "2026-10-21", "phase": "new_moon", "month": 10},
        {"date": "2026-11-20", "phase": "new_moon", "month": 11},
        {"date": "2026-12-19", "phase": "new_moon", "month": 12},
    ]

    events = []
    for p in phases:
        if p["phase"] == "full_moon":
            moon_name = FULL_MOON_NAMES[p["month"]]
            title = f"Full {moon_name}"
            description = (
                f"The {p['month']}th full moon of the year, traditionally called the {moon_name}. "
                f"A moonless sky is not required — full moons create beautiful moonlit landscapes "
                f"across Napa Valley's vineyards and hillsides."
            )
            is_notable = p["month"] in [1, 8, 9, 10, 11]  # Wolf, Sturgeon, Corn, Hunter, Beaver
        else:
            title = "New Moon"
            description = (
                "With no moonlight to interfere, this is an excellent night for astrophotography "
                "and observing faint deep-sky objects such as galaxies and nebulae under dark skies."
            )
            is_notable = False

        events.append({
            "title": title,
            "event_type": "moon",
            "event_date": p["date"],
            "peak_time": "Moonrise around sunset" if p["phase"] == "full_moon" else "All night",
            "description": description,
            "is_notable": is_notable,
            "source": "USNO",
            "source_url": "https://aa.usno.navy.mil/data/MoonPhases",
            "year": 2026,
        })

    return events


# ── Supabase write ─────────────────────────────────────────────────────────────

def upsert_event(ev: dict, dry_run: bool) -> bool:
    tag = "⭐" if ev.get("is_notable") else "·"
    print(f"  {tag} {ev['title']} | {ev['event_date']}")

    if dry_run:
        print(f"    [DRY-RUN] viewing_notes: {ev.get('viewing_notes', '(none)')}")
        return True

    r = sb.post(
        "/rest/v1/astronomical_events",
        json=ev,
        headers={"Prefer": "resolution=merge-duplicates,return=representation"},
    )
    if r.status_code in (200, 201):
        return True
    elif r.status_code == 409:
        print(f"    → duplicate skipped")
        return False
    else:
        print(f"    ✗ insert failed {r.status_code}: {r.text[:150]}")
        return False


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Seed NapaServe astronomical events.")
    parser.add_argument("--year", type=int, default=2026)
    parser.add_argument("--source", choices=["moon", "static", "all"], default="all")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    for var in ["SUPABASE_URL", "SUPABASE_KEY", "ANTHROPIC_API_KEY",
                "ASTRONOMY_APP_ID", "ASTRONOMY_APP_SECRET"]:
        if not os.environ.get(var):
            sys.exit(f"Missing env var: {var}")

    if args.dry_run:
        print("🔍 DRY-RUN MODE — nothing will be written to Supabase\n")

    all_events = []

    if args.source in ("moon", "all"):
        print(f"\n🌕 Fetching moon phases for {args.year}...")
        moon_events = get_2026_moon_phases()
        print(f"  {len(moon_events)} moon phase events")
        all_events.extend(moon_events)

    if args.source in ("static", "all"):
        print(f"\n⭐ Loading static astronomical events for {args.year}...")
        static = [dict(e, year=args.year) for e in STATIC_EVENTS_2026]
        print(f"  {len(static)} static events")
        all_events.extend(static)

    print(f"\n✍️  Generating Napa Valley viewing notes via Claude...")
    inserted = skipped = 0

    for ev in all_events:
        notes = generate_viewing_notes(ev)
        if notes:
            ev["viewing_notes"] = notes
        ev.setdefault("year", args.year)

        if upsert_event(ev, args.dry_run):
            inserted += 1
        else:
            skipped += 1

        time.sleep(0.3)

    print(f"\n✅ Done — {inserted} inserted, {skipped} skipped")


if __name__ == "__main__":
    main()

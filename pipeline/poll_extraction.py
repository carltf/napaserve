"""
NapaServe — Substack Poll Extraction Pipeline

Scans Substack HTML export files for poll embeds, fetches poll results
from the Substack API, and upserts them into the nvf_polls Supabase table.

Usage:
  python poll_extraction.py --cookie "substack.sid=YOUR_SESSION_COOKIE"
  python poll_extraction.py --cookie "substack.sid=..." --dry-run
  python poll_extraction.py --cookie "substack.sid=..." --limit 5

Required environment variables:
  SUPABASE_URL  — e.g. https://csenpchwxxepdvjebsrt.supabase.co
  SUPABASE_KEY  — service role key (not anon)
"""

import os
import re
import csv
import json
import html
import glob
import logging
import argparse
import time
import requests
from datetime import datetime, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

SUPABASE_URL = os.environ.get(
    "SUPABASE_URL", "https://csenpchwxxepdvjebsrt.supabase.co"
)
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

SUPABASE_TABLE = "nvf_polls"

# Path to the Substack HTML export directory (iCloud)
POSTS_DIR = os.path.expanduser(
    "~/Library/Mobile Documents/com~apple~CloudDocs/"
    "Valley Works Collabrative/NapaServe/"
    "Substack Data March 11 2026/9DDiMintS2Ksp84RxDH69g/posts"
)

SUBSTACK_POLL_API = "https://napavalleyfocus.substack.com/api/v1/poll/{poll_id}"

# posts.csv lives one level above the posts/ directory
POSTS_CSV = os.path.expanduser(
    "~/Library/Mobile Documents/com~apple~CloudDocs/"
    "Valley Works Collabrative/NapaServe/"
    "Substack Data March 11 2026/9DDiMintS2Ksp84RxDH69g/posts.csv"
)

# Regex to find poll-embed divs with data-attrs containing an id
POLL_EMBED_RE = re.compile(
    r'class="poll-embed"\s+data-attrs="([^"]+)"'
)

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s"
)
log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Supabase helpers
# ---------------------------------------------------------------------------

def supabase_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation,resolution=merge-duplicates",
    }


def supabase_existing_poll_ids() -> set[int]:
    """Fetch all poll_ids already in nvf_polls."""
    ids = set()
    url = f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}?select=poll_id"
    r = requests.get(url, headers=supabase_headers())
    if not r.ok:
        log.warning(f"Could not fetch existing poll_ids: {r.status_code} {r.text}")
        return ids
    for row in r.json():
        ids.add(int(row["poll_id"]))
    log.info(f"Found {len(ids)} existing polls in Supabase")
    return ids


def supabase_upsert(row: dict) -> dict:
    """Upsert a poll row into nvf_polls (conflict on poll_id)."""
    url = f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}?on_conflict=poll_id"
    r = requests.post(url, headers=supabase_headers(), json=row)
    if not r.ok:
        log.error(f"Supabase upsert failed: {r.status_code} {r.text}")
    r.raise_for_status()
    return r.json()


# ---------------------------------------------------------------------------
# Post metadata (from posts.csv)
# ---------------------------------------------------------------------------

def slug_to_title(filename: str) -> str:
    """Convert filename slug to a readable title as fallback.
    '172372183.wine-chronicle-what-happened-to-cabernet.html' → 'Wine Chronicle What Happened To Cabernet'
    """
    slug = re.sub(r"^\d+\.", "", filename).removesuffix(".html")
    return slug.replace("-", " ").title()


def load_post_metadata(csv_path: str) -> dict[int, dict]:
    """
    Load posts.csv and return {post_id: {"title": str, "audience": str, "type": str}}.
    The post_id column contains 'NNNNNN.slug' — we parse the numeric prefix.
    """
    metadata = {}
    if not os.path.isfile(csv_path):
        log.warning(f"posts.csv not found at {csv_path} — titles will use filename slugs")
        return metadata

    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_id = row.get("post_id", "")
            id_match = re.match(r"(\d+)", raw_id)
            if not id_match:
                continue
            post_id = int(id_match.group(1))
            metadata[post_id] = {
                "title": row.get("title", "").strip(),
                "audience": row.get("audience", "").strip(),
                "type": row.get("type", "").strip(),
            }

    log.info(f"Loaded metadata for {len(metadata)} posts from posts.csv")
    return metadata


# ---------------------------------------------------------------------------
# HTML scanning
# ---------------------------------------------------------------------------

def scan_posts_for_polls(posts_dir: str, post_meta: dict[int, dict] | None = None) -> list[dict]:
    """
    Walk HTML files in posts_dir and extract poll references.
    Returns list of {"poll_id": int, "post_id": int, "post_title": str, "filename": str}.
    """
    if post_meta is None:
        post_meta = {}
    results = []
    html_files = sorted(glob.glob(os.path.join(posts_dir, "*.html")))
    log.info(f"Scanning {len(html_files)} HTML files in {posts_dir}")

    for filepath in html_files:
        filename = os.path.basename(filepath)
        # Post ID is the numeric prefix: "172372183.wine-chronicle-..."
        post_id_match = re.match(r"(\d+)\.", filename)
        if not post_id_match:
            continue
        post_id = int(post_id_match.group(1))

        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        for match in POLL_EMBED_RE.finditer(content):
            attrs_raw = html.unescape(match.group(1))
            try:
                attrs = json.loads(attrs_raw)
            except json.JSONDecodeError:
                log.warning(f"Bad JSON in poll embed: {attrs_raw[:100]}")
                continue

            poll_id = attrs.get("id")
            if poll_id is not None:
                meta = post_meta.get(post_id, {})
                title = meta.get("title") or slug_to_title(filename)
                results.append({
                    "poll_id": int(poll_id),
                    "post_id": post_id,
                    "post_title": title,
                    "filename": filename,
                })

    # Deduplicate by poll_id (same poll can appear if file is scanned twice)
    seen = set()
    deduped = []
    for r in results:
        if r["poll_id"] not in seen:
            seen.add(r["poll_id"])
            deduped.append(r)

    log.info(f"Found {len(deduped)} unique polls across {len(html_files)} posts")
    return deduped


# ---------------------------------------------------------------------------
# Substack API fetch
# ---------------------------------------------------------------------------

def fetch_poll(poll_id: int, cookie: str) -> dict | None:
    """
    Fetch poll data from the Substack API.
    Returns the JSON response or None on failure.
    """
    url = SUBSTACK_POLL_API.format(poll_id=poll_id)
    headers = {
        "Cookie": cookie,
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
    }
    try:
        r = requests.get(url, headers=headers, timeout=30)
        if r.status_code == 404:
            log.warning(f"Poll {poll_id}: 404 not found")
            return None
        r.raise_for_status()
        return r.json()
    except Exception as e:
        log.error(f"Poll {poll_id}: fetch failed — {e}")
        return None


def parse_poll_response(api_data: dict, post_id: int, post_title: str = "") -> dict:
    """
    Transform the Substack API response into a row for nvf_polls.
    """
    options = []
    total_votes = 0
    for opt in api_data.get("options", []):
        vote_count = opt.get("votes", 0)
        total_votes += vote_count
        options.append({
            "id": opt.get("id"),
            "text": opt.get("label", ""),
            "votes": vote_count,
        })

    published_at = api_data.get("created_at") or api_data.get("published_at")

    return {
        "poll_id": api_data["id"],
        "post_id": post_id,
        "post_title": post_title,
        "question": api_data.get("question", api_data.get("title", "")),
        "options_json": json.dumps(options),
        "total_votes": total_votes,
        "published_at": published_at,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def run(cookie: str, dry_run: bool = False, limit: int | None = None,
        skip_existing: bool = False):
    log.info("=== NapaServe Poll Extraction ===")

    if not os.path.isdir(POSTS_DIR):
        log.error(f"Posts directory not found: {POSTS_DIR}")
        log.error("Make sure iCloud Drive is synced and the path is correct.")
        return

    # Step 1: Load post metadata and scan HTML for poll references
    post_meta = load_post_metadata(POSTS_CSV)
    poll_refs = scan_posts_for_polls(POSTS_DIR, post_meta)

    if limit:
        poll_refs = poll_refs[:limit]
        log.info(f"Limited to {limit} polls")

    if not poll_refs:
        log.info("No polls found — nothing to do.")
        return

    # Filter out polls already in Supabase
    if skip_existing:
        if not SUPABASE_KEY:
            log.error("SUPABASE_KEY required for --skip-existing. Set it or remove the flag.")
            return
        existing_ids = supabase_existing_poll_ids()
        before = len(poll_refs)
        poll_refs = [r for r in poll_refs if r["poll_id"] not in existing_ids]
        log.info(f"Skipping {before - len(poll_refs)} existing polls, {len(poll_refs)} remaining")

    if not poll_refs:
        log.info("All polls already in Supabase — nothing to do.")
        return

    # Step 2: Fetch each poll from the Substack API
    fetched = 0
    skipped = 0
    for ref in poll_refs:
        log.info(
            f"Fetching poll {ref['poll_id']} "
            f"(post {ref['post_id']}, {ref['filename']})"
        )
        api_data = fetch_poll(ref["poll_id"], cookie)

        try:
            row = parse_poll_response(api_data, ref["post_id"], ref.get("post_title", "")) if api_data and "id" in api_data else None
        except Exception as e:
            log.warning(f"Poll {ref['poll_id']}: parse failed — {e}")
            row = None

        if row is None:
            skipped += 1
            log.warning(f"Poll {ref['poll_id']}: skipped (no valid data returned)")
            time.sleep(2)
            continue

        fetched += 1

        if dry_run:
            log.info(f"[DRY RUN] Would upsert: {json.dumps(row, indent=2)}")
        else:
            if not SUPABASE_KEY:
                log.error("SUPABASE_KEY not set — cannot upsert. Use --dry-run to preview.")
                return
            result = supabase_upsert(row)
            log.info(f"Upserted poll {row['poll_id']}: {row['question'][:60]}")

        time.sleep(2)

    log.info(
        f"Done — fetched {fetched}, skipped {skipped}, "
        f"total refs {len(poll_refs)}"
    )


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Extract Substack polls and upsert to Supabase"
    )
    parser.add_argument(
        "--cookie",
        required=True,
        help='Substack session cookie, e.g. "substack.sid=abc123..."',
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would be upserted without writing to Supabase",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Process only the first N polls (useful for testing)",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip polls already in Supabase (resume an interrupted run)",
    )
    args = parser.parse_args()
    run(cookie=args.cookie, dry_run=args.dry_run, limit=args.limit,
        skip_existing=args.skip_existing)

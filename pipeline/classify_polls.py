"""
NapaServe — Poll Theme Classification

Fetches nvf_polls rows where theme IS NULL, classifies each poll into
a thematic category using Claude Haiku, and updates the theme column.

Usage:
  python classify_polls.py
  python classify_polls.py --dry-run
  python classify_polls.py --limit 10

Required environment variables:
  SUPABASE_URL      — e.g. https://csenpchwxxepdvjebsrt.supabase.co
  SUPABASE_KEY      — service role key (not anon)
  ANTHROPIC_API_KEY  — Anthropic API key for Claude
"""

import os
import json
import logging
import argparse
import time
import requests

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

SUPABASE_URL = os.environ.get(
    "SUPABASE_URL", "https://csenpchwxxepdvjebsrt.supabase.co"
)
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

SUPABASE_TABLE = "nvf_polls"
ANTHROPIC_MODEL = "claude-haiku-4-5-20251001"
BATCH_SIZE = 10  # polls per API call
BATCH_DELAY = 1  # seconds between API calls

VALID_THEMES = [
    "Words, Puzzles & Trivia",
    "Wine & Hospitality",
    "Housing & Development",
    "Government & Policy",
    "Economy & Jobs",
    "Environment & Agriculture",
    "Community & Culture",
    "Reader Demographics",
    "General",
]

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s"
)
log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Supabase helpers
# ---------------------------------------------------------------------------

def supabase_headers(*, for_update=False):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    if for_update:
        headers["Prefer"] = "return=minimal"
    return headers


def fetch_unclassified(limit=None):
    """Fetch polls where theme IS NULL."""
    url = (
        f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}"
        f"?select=poll_id,question,post_title"
        f"&theme=is.null"
        f"&order=poll_id.asc"
    )
    if limit:
        url += f"&limit={limit}"
    r = requests.get(url, headers=supabase_headers())
    r.raise_for_status()
    return r.json()


def update_theme(poll_id, theme):
    """Set the theme column for a single poll."""
    url = f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}?poll_id=eq.{poll_id}"
    r = requests.patch(url, headers=supabase_headers(for_update=True),
                       json={"theme": theme})
    r.raise_for_status()


# ---------------------------------------------------------------------------
# Classification
# ---------------------------------------------------------------------------

THEMES_LIST = "\n".join(f"- {t}" for t in VALID_THEMES)

SYSTEM_PROMPT = f"""You are a news article classifier for Napa Valley Features, a local news publication covering Napa County, California.

You will receive a JSON array of polls, each with a "poll_id", "question", and "post_title". Classify each poll into exactly one of these themes:

{THEMES_LIST}

Rules:
- FIRST check for "Words, Puzzles & Trivia". Use this theme when the poll is a word game, trivia question, caption contest, quiz, puzzle, or entertainment rather than civic opinion. Examples: "What does the word X mean?", "Pick your favorite or add your own in the comments below" (caption contests), trivia about history or facts, word-of-the-day polls, any question that is clearly a game or entertainment.
- "Reader Demographics" is for polls asking about the reader themselves (where they live, how long they've been here, their age, their habits) rather than their opinion on an issue.
- "General" is a last resort — only use it if the poll truly does not fit any other category.
- Respond with a JSON array of objects, each with "poll_id" (number) and "theme" (string).
- Return ONLY the JSON array. No explanation, no markdown fences, no extra text."""


def validate_theme(raw):
    """Match a raw string to a valid theme, or default to General."""
    for theme in VALID_THEMES:
        if raw.strip().lower() == theme.lower():
            return theme
    for theme in VALID_THEMES:
        if theme.lower() in raw.strip().lower():
            return theme
    return None


def classify_batch(batch):
    """Send a batch of polls to Claude and return {poll_id: theme} mapping."""
    payload = [
        {"poll_id": p["poll_id"],
         "question": p.get("question", ""),
         "post_title": p.get("post_title", "")}
        for p in batch
    ]

    r = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": ANTHROPIC_MODEL,
            "max_tokens": 1024,
            "system": SYSTEM_PROMPT,
            "messages": [{"role": "user", "content": json.dumps(payload)}],
        },
        timeout=60,
    )
    r.raise_for_status()
    raw_text = r.json()["content"][0]["text"].strip()

    # Strip markdown fences if model wraps response
    if raw_text.startswith("```"):
        raw_text = raw_text.split("\n", 1)[1] if "\n" in raw_text else raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3].strip()

    results = json.loads(raw_text)
    mapping = {}
    for item in results:
        pid = item.get("poll_id")
        raw_theme = item.get("theme", "")
        theme = validate_theme(raw_theme)
        if theme is None:
            log.warning(f"Poll {pid}: unexpected theme '{raw_theme}' — defaulting to General")
            theme = "General"
        mapping[pid] = theme
    return mapping


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def run(dry_run=False, limit=None):
    log.info("=== NapaServe Poll Theme Classification ===")

    if not SUPABASE_KEY:
        log.error("SUPABASE_KEY not set")
        return
    if not ANTHROPIC_API_KEY:
        log.error("ANTHROPIC_API_KEY not set")
        return

    polls = fetch_unclassified(limit=limit)
    log.info(f"Found {len(polls)} unclassified polls")

    if not polls:
        log.info("Nothing to classify.")
        return

    classified = 0
    errors = 0
    theme_counts = {}
    start_time = time.time()

    # Process in batches of BATCH_SIZE
    for batch_start in range(0, len(polls), BATCH_SIZE):
        batch = polls[batch_start:batch_start + BATCH_SIZE]
        batch_num = batch_start // BATCH_SIZE + 1
        total_batches = (len(polls) + BATCH_SIZE - 1) // BATCH_SIZE
        log.info(f"Batch {batch_num}/{total_batches} — classifying {len(batch)} polls...")

        try:
            mapping = classify_batch(batch)
        except Exception as e:
            log.error(f"Batch {batch_num} API call failed — {e}")
            errors += len(batch)
            continue

        for poll in batch:
            poll_id = poll["poll_id"]
            question = poll.get("question", "")
            theme = mapping.get(poll_id)

            if theme is None:
                log.warning(f"Poll {poll_id}: missing from API response — skipping")
                errors += 1
                continue

            theme_counts[theme] = theme_counts.get(theme, 0) + 1

            if dry_run:
                log.info(f"  [DRY RUN] {poll_id}: {theme} — {question[:70]}")
            else:
                try:
                    update_theme(poll_id, theme)
                    log.info(f"  {poll_id}: {theme} — {question[:70]}")
                except Exception as e:
                    log.error(f"  Poll {poll_id}: update failed — {e}")
                    errors += 1
                    continue

            classified += 1

        # Delay between batches
        if batch_start + BATCH_SIZE < len(polls):
            time.sleep(BATCH_DELAY)

    elapsed = time.time() - start_time

    # Summary
    log.info("=" * 50)
    log.info(f"SUMMARY: {classified} classified, {errors} errors, "
             f"{len(polls)} total — {elapsed:.1f}s "
             f"({elapsed / max(len(polls), 1):.2f}s per poll)")
    for theme in VALID_THEMES:
        count = theme_counts.get(theme, 0)
        if count:
            log.info(f"  {theme}: {count}")
    if dry_run:
        log.info("(Dry run — no rows were updated)")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Classify nvf_polls themes using Claude Haiku"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Classify and print results without updating Supabase",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Process only the first N unclassified polls",
    )
    args = parser.parse_args()
    run(dry_run=args.dry_run, limit=args.limit)

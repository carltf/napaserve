"""
NapaServe — Poll Question Embedding Pipeline

Fetches all polls from nvf_polls, generates voyage-3 embeddings for
each question + post_title, and upserts into nvf_poll_embeddings.

Usage:
  python embed_polls.py
  python embed_polls.py --dry-run
  python embed_polls.py --skip-existing

Required environment variables:
  SUPABASE_URL   — e.g. https://csenpchwxxepdvjebsrt.supabase.co
  SUPABASE_KEY   — service role key (not anon)
  VOYAGE_API_KEY — Voyage AI API key
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
VOYAGE_API_KEY = os.environ.get("VOYAGE_API_KEY", "")

VOYAGE_MODEL = "voyage-3"
VOYAGE_DIMS = 1024
BATCH_SIZE = 20  # Voyage AI supports up to 128 inputs per call

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s"
)
log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Supabase helpers
# ---------------------------------------------------------------------------

def supabase_headers(*, for_upsert=False):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    if for_upsert:
        headers["Prefer"] = "return=minimal,resolution=merge-duplicates"
    return headers


def fetch_polls():
    """Fetch all polls with question and post_title."""
    url = (
        f"{SUPABASE_URL}/rest/v1/nvf_polls"
        f"?select=poll_id,question,post_title"
        f"&order=poll_id.asc"
    )
    r = requests.get(url, headers=supabase_headers())
    r.raise_for_status()
    return r.json()


def fetch_existing_poll_ids():
    """Fetch poll_ids already in nvf_poll_embeddings."""
    url = f"{SUPABASE_URL}/rest/v1/nvf_poll_embeddings?select=poll_id"
    r = requests.get(url, headers=supabase_headers())
    r.raise_for_status()
    return {row["poll_id"] for row in r.json()}


def upsert_embeddings(rows):
    """Upsert a batch of {poll_id, embedding} rows."""
    url = f"{SUPABASE_URL}/rest/v1/nvf_poll_embeddings?on_conflict=poll_id"
    r = requests.post(url, headers=supabase_headers(for_upsert=True), json=rows)
    if not r.ok:
        log.error(f"Upsert failed: {r.status_code} {r.text}")
    r.raise_for_status()


# ---------------------------------------------------------------------------
# Voyage AI embedding
# ---------------------------------------------------------------------------

def embed_texts(texts):
    """Generate voyage-3 embeddings for a batch of texts."""
    r = requests.post(
        "https://api.voyageai.com/v1/embeddings",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {VOYAGE_API_KEY}",
        },
        json={
            "model": VOYAGE_MODEL,
            "input": texts,
            "input_type": "document",
        },
        timeout=60,
    )
    r.raise_for_status()
    data = r.json()
    return [item["embedding"] for item in data["data"]]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def run(dry_run=False, skip_existing=False):
    log.info("=== NapaServe Poll Embedding Pipeline ===")

    if not SUPABASE_KEY:
        log.error("SUPABASE_KEY not set")
        return
    if not VOYAGE_API_KEY:
        log.error("VOYAGE_API_KEY not set")
        return

    polls = fetch_polls()
    log.info(f"Fetched {len(polls)} polls from nvf_polls")

    if skip_existing:
        existing = fetch_existing_poll_ids()
        before = len(polls)
        polls = [p for p in polls if p["poll_id"] not in existing]
        log.info(f"Skipping {before - len(polls)} already embedded, {len(polls)} remaining")

    if not polls:
        log.info("Nothing to embed.")
        return

    # Build input texts: question + post_title for richer context
    texts = []
    for p in polls:
        title = p.get("post_title") or ""
        question = p.get("question") or ""
        combined = f"{question} — {title}" if title else question
        texts.append(combined)

    embedded = 0
    errors = 0

    for batch_start in range(0, len(polls), BATCH_SIZE):
        batch_polls = polls[batch_start:batch_start + BATCH_SIZE]
        batch_texts = texts[batch_start:batch_start + BATCH_SIZE]
        batch_num = batch_start // BATCH_SIZE + 1
        total_batches = (len(polls) + BATCH_SIZE - 1) // BATCH_SIZE

        log.info(f"Batch {batch_num}/{total_batches} — embedding {len(batch_texts)} polls...")

        try:
            embeddings = embed_texts(batch_texts)
        except Exception as e:
            log.error(f"Batch {batch_num} embedding failed: {e}")
            errors += len(batch_polls)
            continue

        rows = []
        for poll, emb in zip(batch_polls, embeddings):
            rows.append({
                "poll_id": poll["poll_id"],
                "embedding": json.dumps(emb),
            })

        if dry_run:
            for row in rows:
                log.info(f"  [DRY RUN] Would upsert poll_id={row['poll_id']} ({len(json.loads(row['embedding']))} dims)")
            embedded += len(rows)
        else:
            try:
                upsert_embeddings(rows)
                embedded += len(rows)
                log.info(f"  Upserted {len(rows)} embeddings")
            except Exception as e:
                log.error(f"  Batch {batch_num} upsert failed: {e}")
                errors += len(rows)

        # Rate limit between batches
        if batch_start + BATCH_SIZE < len(polls):
            time.sleep(1)

    log.info(f"Done — embedded {embedded}, errors {errors}, total {len(polls)}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Embed poll questions with Voyage AI and store in Supabase"
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Generate embeddings but don't write to Supabase",
    )
    parser.add_argument(
        "--skip-existing", action="store_true",
        help="Skip polls already in nvf_poll_embeddings",
    )
    args = parser.parse_args()
    run(dry_run=args.dry_run, skip_existing=args.skip_existing)

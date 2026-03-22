"""
Seed article polls for Sonoma and Lake County Under the Hood articles.
Inserts rows into napaserve_article_polls via Supabase.
Requires SUPABASE_KEY environment variable.
"""

import os
import json
import urllib.request

SUPABASE_URL = "https://csenpchwxxepdvjebsrt.supabase.co"
TABLE = "napaserve_article_polls"

POLLS = [
    # ── Sonoma ──────────────────────────────────────────────
    {
        "article_slug": "sonoma-cab-2025",
        "sort_order": 1,
        "question": "How do you expect Sonoma County grape prices to change over the next 3 years?",
        "options": ["Rise more than 10%", "Rise 5% to 10%", "Stay about the same", "Fall 5% to 10%", "Fall more than 10%"],
    },
    {
        "article_slug": "sonoma-cab-2025",
        "sort_order": 2,
        "question": "For growers, what is the biggest risk if Sonoma grape prices stay below past trends for 12 months?",
        "options": ["Lower profits", "Loss of buyers", "Debt pressure", "Delay new investment", "Sell vineyard assets"],
    },
    {
        "article_slug": "sonoma-cab-2025",
        "sort_order": 3,
        "question": "For wineries, what is the biggest risk in the next 12 months?",
        "options": ["Slipping DTC sales", "Excess inventory", "Grape costs too high", "Big discounts to move wine", "Other (leave comment below)"],
    },
    # ── Lake County ─────────────────────────────────────────
    {
        "article_slug": "lake-county-cab-2025",
        "sort_order": 1,
        "question": "How do you expect Lake County grape prices to change over the next 3 years?",
        "options": ["Rise more than 10%", "Rise 5% to 10%", "Stay about the same", "Fall 5% to 10%", "Fall more than 10%"],
    },
    {
        "article_slug": "lake-county-cab-2025",
        "sort_order": 2,
        "question": "For growers, what is the biggest risk if Lake County grape prices stay below past trends for 12 months?",
        "options": ["Lower profits", "Loss of buyers", "Debt pressure", "Delay new investment", "Sell vineyard assets"],
    },
    {
        "article_slug": "lake-county-cab-2025",
        "sort_order": 3,
        "question": "For wineries, what is the biggest risk in the next 12 months?",
        "options": ["Slipping DTC sales", "Excess inventory", "Grape costs too high", "Big discounts to move wine", "Other (leave comment below)"],
    },
]


def main():
    key = os.environ.get("SUPABASE_KEY")
    if not key:
        print("ERROR: SUPABASE_KEY environment variable is not set.")
        return

    url = f"{SUPABASE_URL}/rest/v1/{TABLE}"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    for poll in POLLS:
        body = json.dumps(poll).encode("utf-8")
        req = urllib.request.Request(url, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req) as resp:
                result = json.loads(resp.read())
                print(f"OK  slug={poll['article_slug']}  order={poll['sort_order']}  id={result[0]['id'] if result else '?'}")
        except urllib.error.HTTPError as e:
            err = e.read().decode()
            print(f"ERR slug={poll['article_slug']}  order={poll['sort_order']}  {e.code}: {err}")


if __name__ == "__main__":
    main()

"""
Seed article polls for Under the Hood articles.
Inserts rows into napaserve_article_polls via Supabase.
Requires SUPABASE_KEY environment variable.

Usage:
  python seed_article_polls.py                  # insert all polls
  python seed_article_polls.py --dry-run        # print what would be inserted
  python seed_article_polls.py --slug napa-gdp-2024              # only this slug
  python seed_article_polls.py --slug napa-gdp-2024 --dry-run    # preview one slug
"""

import os
import sys
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
    # ── Napa GDP 2024 ─────────────────────────────────────────
    {
        "id": 10,
        "article_slug": "napa-gdp-2024",
        "sort_order": 1,
        "question": "Prices in Napa are ~29% higher than 2017. How has that affected you?",
        "options": ["Costs far outpace my income", "It\u2019s noticeable but manageable", "I\u2019ve kept pace with rising costs", "I\u2019ve left or am considering leaving", "Not affected / doesn\u2019t apply"],
    },
    {
        "id": 11,
        "article_slug": "napa-gdp-2024",
        "sort_order": 2,
        "question": "Have rising costs changed how you spend in Napa?",
        "options": ["Yes \u2014 I spend significantly less", "Yes \u2014 I\u2019ve cut specific categories", "Somewhat \u2014 small adjustments only", "No \u2014 my spending hasn\u2019t changed", "I don\u2019t live or spend in Napa"],
    },
    {
        "id": 12,
        "article_slug": "napa-gdp-2024",
        "sort_order": 3,
        "question": "Do Napa wages keep up with the local cost of living?",
        "options": ["No \u2014 wages are far behind", "No \u2014 wages lag but it\u2019s manageable", "About even for most workers", "Yes \u2014 wages are competitive here", "Not sure / depends on the sector"],
    },
    {
        "id": 13,
        "article_slug": "napa-gdp-2024",
        "sort_order": 4,
        "question": "Will Napa\u2019s service and hospitality jobs recover to pre-2019 trend levels?",
        "options": ["Yes, within a few years", "Possibly, but it\u2019ll take years", "No \u2014 the break is permanent", "Only for high-end positions", "Not sure"],
    },
    {
        "id": 14,
        "article_slug": "napa-gdp-2024",
        "sort_order": 5,
        "question": "How prepared is Napa County for declining wine tax revenue?",
        "options": ["Very prepared \u2014 plans are in place", "Somewhat prepared", "Not very prepared", "Not prepared at all", "I don\u2019t know enough to say"],
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
    # ── Supply Chain 2026 ─────────────────────────────────────
    {
        "article_slug": "napa-supply-chain-2026",
        "sort_order": 1,
        "question": "How much do you expect Napa input costs to rise?",
        "options": ["Less than 5%", "5% to 10%", "10% to 20%", "More than 20%", "Too early to tell"],
    },
    {
        "article_slug": "napa-supply-chain-2026",
        "sort_order": 2,
        "question": "How long will Hormuz disruptions last?",
        "options": ["Weeks \u2014 resolved by June", "3 to 6 months", "6 to 12 months", "More than a year", "Unsure"],
    },
    {
        "article_slug": "napa-supply-chain-2026",
        "sort_order": 3,
        "question": "What concerns you most for Napa's economy?",
        "options": ["Higher fuel and freight costs", "Fewer international visitors", "Wine industry already fragile", "All of the above", "Not concerned"],
    },
    # ── Napa Population 2025 ──────────────────────────────────────
    {
        "article_slug": "napa-population-2025",
        "sort_order": 1,
        "question": "What best explains Napa's population pattern?",
        "options": ["Low wages limit who can stay", "Housing costs are too high", "Jobs are in other counties", "Valley geography limits growth", "Unsure / too many factors"],
    },
    {
        "article_slug": "napa-population-2025",
        "sort_order": 2,
        "question": "Is growth in American Canyon good for Napa?",
        "options": ["Yes, growth is growth", "Only if it serves local workers", "No, it serves the Bay Area", "Depends on what jobs follow", "Unsure"],
    },
    {
        "article_slug": "napa-population-2025",
        "sort_order": 3,
        "question": "What should Napa prioritize to reverse trends?",
        "options": ["Attract higher-wage industries", "Build more workforce housing", "Invest in schools and families", "Survey where residents work", "Unsure / all of the above"],
    },
    # ── Napa Structural Reset 2026 ───────────────────────────────
    {
        "article_slug": "napa-structural-reset-2026",
        "sort_order": 1,
        "question": "What is the biggest driver of Napa's current reset?",
        "options": [
            "Falling wine demand overall",
            "Overbuilt hospitality footprint",
            "Cost of capital and debt load",
            "Demographic shift away from wine",
            "Trade disruption and distribution",
        ],
    },
    {
        "article_slug": "napa-structural-reset-2026",
        "sort_order": 2,
        "question": "Which signal concerns you most for Napa?",
        "options": [
            "Restaurant and tasting room closures",
            "Distressed property transactions",
            "Production capacity reductions",
            "Split-asset and complex deals",
            "Layoffs across wine operations",
        ],
    },
    {
        "article_slug": "napa-structural-reset-2026",
        "sort_order": 3,
        "question": "How long before Napa's reset stabilizes?",
        "options": [
            "Already stabilizing now",
            "One to two more years",
            "Three to five years",
            "More than five years",
            "It depends on the segment",
        ],
    },

    # ── Napa Price Discovery 2026 ────────────────────────────────
    {
        "article_slug": "napa-price-discovery-2026",
        "sort_order": 1,
        "question": "What does the Benessere auction tell you about Napa winery real estate?",
        "options": [
            "Major correction confirmed",
            "One data point, not a trend",
            "Auction format distorts value",
            "Italian varietals are a niche risk",
            "Unsure — need more data",
        ],
    },
    {
        "article_slug": "napa-price-discovery-2026",
        "sort_order": 2,
        "question": "Which asset class concerns you most in Napa right now?",
        "options": [
            "Luxury hospitality (hotels/resorts)",
            "Operating winery estates",
            "Vineyard land",
            "Wine brands without real estate",
            "All equally",
        ],
    },
    {
        "article_slug": "napa-price-discovery-2026",
        "sort_order": 3,
        "question": "Is Napa's current repricing temporary or structural?",
        "options": [
            "Structural — won't fully recover",
            "Structural but will stabilize",
            "Temporary — demand will return",
            "Too early to say",
            "Depends on the asset class",
        ],
    },

    # ── Napa Constellation 2026 ──────────────────────────────────
    {
        "article_slug": "napa-constellation-2026",
        "sort_order": 1,
        "question": "Which signal most clearly marks the pivot from marketing to defense?",
        "options": [
            "Constellation's Q4 collapse",
            "Hall's 100–170 estimate",
            "The Ninth Circuit revival",
            "The four-group petition",
            "Mondavi's reopening",
        ],
    },
    {
        "article_slug": "napa-constellation-2026",
        "sort_order": 2,
        "question": "Where is the valley in the stages of the correction?",
        "options": [
            "Still in denial",
            "Anger and bargaining",
            "Entering depression",
            "Beginning acceptance",
            "The framework doesn't fit",
        ],
    },
    {
        "article_slug": "napa-constellation-2026",
        "sort_order": 3,
        "question": "How will the Board of Supervisors respond to the petition?",
        "options": [
            "Hold the line on ag preserve",
            "Adopt most reforms",
            "Split the difference",
            "Defer past June",
            "Too early to call",
        ],
    },
]


def delete_by_slug(slug, headers):
    """Delete all existing rows for a given article_slug."""
    url = f"{SUPABASE_URL}/rest/v1/{TABLE}?article_slug=eq.{slug}"
    req = urllib.request.Request(url, headers={**headers, "Prefer": "return=representation"}, method="DELETE")
    try:
        with urllib.request.urlopen(req) as resp:
            deleted = json.loads(resp.read())
            count = len(deleted) if isinstance(deleted, list) else 0
            print(f"DEL slug={slug}  removed={count}")
            return count
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"DEL ERR slug={slug}  {e.code}: {err}")
        return 0


def main():
    dry_run = "--dry-run" in sys.argv
    slug_filter = None
    if "--slug" in sys.argv:
        idx = sys.argv.index("--slug")
        if idx + 1 < len(sys.argv):
            slug_filter = sys.argv[idx + 1]

    polls = [p for p in POLLS if slug_filter is None or p["article_slug"] == slug_filter]

    if dry_run:
        filtered = [p for p in POLLS if slug_filter is None or p["article_slug"] == slug_filter]
        print(f"DRY RUN — {len(filtered)} poll(s) would be seeded:")
        for p in filtered:
            print(f"  order={p['sort_order']}  question={p['question']}")
            for i, opt in enumerate(p['options']):
                print(f"    [{i}] {opt}")
        return

    key = os.environ.get("SUPABASE_KEY")
    if not key:
        print("ERROR: SUPABASE_KEY environment variable is not set.")
        return

    url = f"{SUPABASE_URL}/rest/v1/{TABLE}"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }

    # Delete existing rows for targeted slugs before inserting
    slugs_to_delete = set(p["article_slug"] for p in polls)
    for slug in sorted(slugs_to_delete):
        delete_by_slug(slug, headers)

    # Insert new rows
    for poll in polls:
        body = json.dumps(poll).encode("utf-8")
        req = urllib.request.Request(url, data=body, headers={**headers, "Prefer": "return=representation"}, method="POST")
        try:
            with urllib.request.urlopen(req) as resp:
                result = json.loads(resp.read())
                row_id = result[0]["id"] if isinstance(result, list) and result else "?"
                print(f"OK  slug={poll['article_slug']}  order={poll['sort_order']}  id={row_id}")
        except urllib.error.HTTPError as e:
            err = e.read().decode()
            print(f"ERR slug={poll['article_slug']}  order={poll['sort_order']}  {e.code}: {err}")


if __name__ == "__main__":
    main()

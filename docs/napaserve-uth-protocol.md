# NapaServe — Under the Hood Protocol

Procedural document for every Under the Hood (UTH) article build on NapaServe. Editorial pipeline, single-prompt build protocol, verification gates, deploy and iteration workflow, editorial standards.

Maintained as markdown-canonical per ADR-001 (2026-05-24). Stable content lifted from V5 (May 18, 2026). V5 archive preserved in iCloud `Active/Older Drafts/`.

---

## TOP PRINCIPLE — When Documentation Drifts From Live (May 10, 2026)

The UTH Protocol is a living document, but live deployed pages are the source of truth. When this document and a live shipped article disagree on rendering, sequencing, or component structure, the live article wins. Update the protocol to match.

**Verification ordering at start of new UTH build:**
1. Read the most recent shipped UTH article JSX in full (Section 0 verification gate)
2. Open the live deployed URL in Chrome MCP and read rendered DOM
3. Compare both against this protocol document
4. If any drift surfaces, flag to Tim before drafting code, queue protocol correction for EOS

**Locked principle:** live > protocol > assistant memory. Protocol that the assistant doesn't actually read is protocol that doesn't constrain behavior.

---

## 20-Step UTH Build Sequence (Canonical)

1. Section 0 — verify ground truth (file paths, DB state, live URLs)
2. Confirm article slug + poll ID range available
3. Create JSX file from template (`under-the-hood-template.jsx`)
4. Populate body sections + sources + methodology
5. Add charts (ChartCanvas + Caption pattern)
6. Wire up Related Coverage (plain link list)
7. Add route in App.jsx
8. Add admin card in `napaserve-admin.jsx`
9. DB INSERT into napaserve_articles (or PATCH if row already exists)
10. Draft poll dicts in `pipeline/seed_article_polls.py`
11. Poll seeding dry-run
12. Poll seeding live
13. EXPORT_DATA population (headline/publication/slug/dateline/body/optional)
14. Chart filenames inventory
15. Word export end-to-end test from admin
16. Build local (`npm run build`)
17. Commit + push (Vercel auto-deploy)
18. Browser verification at desktop + 375px mobile
19. Hide DraftBanner before final verification
20. Publish flip — admin UI or direct PATCH curl fallback

---

## The Single-Prompt Protocol

Every UTH build is **one self-contained Claude Code prompt**. One. Not two. Not four. Long is fine.

### What goes in the single prompt
- Article metadata block (slug, file, component name, headline, byline date)
- Section 0 verification gates
- File scaffold
- Body prose paste
- Charts
- Captions
- Polls
- Related Coverage
- Sources
- Methodology
- Admin card
- Route
- DB INSERT (or PATCH)
- Poll seeding
- Build verification
- Commit and push
- Draft mode verification

### Why one prompt
Splitting into multiple chat-side pieces introduces friction. Claude Code waits for follow-up pastes mid-build. Chat-side fragmentation creates inconsistency in cross-piece references.

### Claude Code Prompt Structure
- All rules, scope, ordering, stop conditions live INSIDE a heredoc (`cat << 'RULES' … RULES`) inside the bash command
- Instructions in the chat message surrounding the code block do NOT reach Claude Code
- Backup commands (`cp file.jsx file.jsx.bak`) must be OUTSIDE the heredoc as real executable shell lines
- Always end with build + sanity grep + HOLD for human review

---

## Article Workflow

### Tim's editorial side
1. Tim writes complete finished articles in ChatGPT or Word
2. Drops draft into the dev thread (Claude.ai chat)
3. Dev thread runs editorial pre-checks
4. Dev thread builds JSX, charts, polls, Word export, sources, related coverage
5. Tim reviews live draft, requests changes, signs off
6. DB flip `published=true` via separate manual step or admin Publish button

### Iteration on a Published Article
If editorial changes are needed AFTER an article is published, the patch prompt must include explicit guardrails:
- **Do NOT touch napaserve_articles table**
- Do NOT run any INSERT, UPDATE, or PATCH against Supabase
- Only the JSX article file and admin EXPORT_DATA change
- Article remains published throughout the patch
- Bundle hash polling confirms new build is live before declaring patch complete

---

## Editorial Standards (Every UTH Must Meet)

- AP style throughout — `%` symbol not "percent"
- No Oxford commas anywhere
- AP dateline for county-wide stories: county name, not city
- Stakeholder language: 'planners, policymakers, community members and civic leaders'
- Verified sourced quotes only
- AP Title Case on all section headings, subheadings, captions, chart titles
- "Napa Valley Features" — never "Focus," never "News Group"
- "community intelligence" — never "civic"
- Don't-words: curate, tapestry, special, unique, discover, explore, nestled, vibrant
- Internal article link format: italics title (linked) (Date)
- Byline placement: immediately after final article section, before PollsSection
- First paragraph of BODY_JSX needs explicit `marginBottom:18`
- SECTIONS array must include all sections including closing "What to Watch"
- Article verification requires confirming all seven components before publishing

---

## Article Build Rules (Permanent)

- Byline: immediately after final article sentence, before PollsSection
- BODY_JSX first paragraph needs explicit `marginBottom:18`
- Dateline: inline bold span, NOT standalone
- SECTIONS array must include all sections including closing 'What to Watch'
- Never add title divs inside chart components
- Download buttons always outside containerRef div
- Verify: `btn.parentElement?.querySelector('canvas')` — if returns canvas, button is incorrectly inside
- **Related Coverage: plain link list** — quoted titles + em-dash + publication + (date). Cards convention deprecated weeks before May 10, 2026
- Per-chart h2 titles required (Lesson N): Libre Baskerville 22px bold #2C1810, marginTop 0, marginBottom 16

---

## Database — napaserve_articles INSERT (or PATCH)

```sql
INSERT INTO napaserve_articles (slug, title, headline, publication,
  published, polls_seeded, admin_cards_added, related_coverage_added, topic_seed)
VALUES (...)
```

Field mapping:
- `slug`: kebab-case
- `title`: short version
- `headline`: full version
- `publication`: "Napa Valley Features"
- `published`: false (set true only after editorial review)
- `polls_seeded`, `admin_cards_added`, `related_coverage_added`: false (manual flags)
- `topic_seed`: descriptive search-and-RAG seed string

### PATCH path (when row already exists)
If Section 0 finds slug already exists, use PATCH instead of INSERT. Same field set. Use `Prefer: return=representation` header. Confirm `published` stays false through the PATCH.

Real columns (verified May 10): id, slug, title, publication, published, published_at, created_at, admin_cards_added, related_coverage_added, polls_seeded, topic_seed, headline, deck. NO subtitle, excerpt, or estimated_read_time.

---

## Poll Seeding

### Pre-seed Checks
- All option strings ≤35 chars
- Dry-run first: `python3 pipeline/seed_article_polls.py --slug <SLUG> --dry-run`
- Confirm dry run shows correct IDs and 5 options each
- If seeder already contains stale block for target slug, edit in place — seeder is destructive-by-design

### Live Seed
```bash
export SUPABASE_KEY=$SUPABASE_KEY && \
  python3 pipeline/seed_article_polls.py --slug <SLUG> && \
  unset SUPABASE_KEY
```

### Poll Seeding Rules (Permanent)
- 5 options per poll
- 35-char max per option
- NO hardcoded `id` field in POLLS list
- Dry-run before live
- **PollsSection: immediately after italic byline, before Related Coverage block** (canonical render order)
- Methodology and Sources follow Related Coverage and Archive Search
- Poll option text lives in three places — JSX POLLS, EXPORT_DATA substackPolls, napaserve_article_polls DB row — must update synchronously

### napaserve_article_polls Schema
- id (auto), article_slug (FK), question, options (text array), sort_order (smallint 1/2/3), created_at
- NO poll_id column
- New polls auto-assign IDs

---

## EXPORT_DATA Canonical Shape (Admin Card)

**Required:** headline, publication, slug, dateline, body

**body** uses `h()`/`t()`/`c()` helpers — markdown text inside `t()` strings, NOT JSX `<a>` tags. Constraint applies to admin EXPORT_DATA body field for Word export rendering only. Article JSX uses native `<a>` tags in rendered prose.

**Optional:** deck, summary, pullQuote, captions, relatedCoverage, sources, substackPolls, links

**captions shape:** `[{number, title, description, sources: [{ label, url }]}]` — `sources` is an array of objects (live shape, verified 2026-06-02), NOT a singular `source` string and NOT `[{chartFilename, text}]`

**relatedCoverage shape:** `[{title, publication, date, url}]` — publication field required

**sources:** array of strings, with markdown links inside the strings

**substackPolls:** `[{question, options:[5 strings each ≤35 chars]}]`

**Top-level ARTICLES array** (admin line ~26): `{ slug, headline, publication, date }` — newest-first

---

## Chart Conventions (cross-reference Cheatsheet)

See `napaserve-cheatsheet.md` Chart Conventions section for full detail:
- Lesson A canonical PNG geometry (scale 2, +80 offset, drawImage 0/60, title 32px @ (28,16), watermark 26px)
- Lesson N per-chart h2 titles
- Lesson O duplicate-bar suppression
- Lesson Q multi-line peak/endpoint label stagger
- Chart numbering protocol
- Chart.js rules (npm only, no fill:+0/+1)
- Cumulative callout placement
- Mobile-scroll wrapper pattern
- PullQuote inline component

**Canonical chart examples (2026-06-02):** clean, working reference implementations live in `under-the-hood-could-gen-z-save-the-wine-industry.jsx` — line-with-era-annotations, multi-cohort bubble with labels anchored above each circle, step-down waterfall, and interactive scenario tester. **Durable goal:** extract these into `under-the-hood-template.jsx` or a dedicated chart-examples reference — do NOT copy from a live published article (the canonical scaffold is the template, never a shipped article).

---

## Word Export — Conventions and Known Bugs

### Conventions (working as designed)
- Headline retains "Under the Hood:" prefix
- Long founder-and-editor byline at bottom
- "Article Summary:" heading inserted between deck and body
- Smart-quote conversion is normal Word rendering

### Known Template-Level Bugs
See `napaserve-platform-debt-ledger.md` PD-2026-05-24-04. Three bugs affecting every UTH article:
- Caption double-period
- Caption "Filename:" injection
- Sources block markdown-link collapse inconsistency

Fix scope: `napaserve-admin.jsx` export rendering. One template-level patch benefits every UTH article.

---

## Section 0 Verification Gates

Before any code is written:

- Confirm article slug doesn't already exist in `napaserve_articles` (or use PATCH path)
- Confirm next available poll IDs via `SELECT MAX(id) FROM napaserve_article_polls`
- Confirm template file exists and matches expected pattern
- Confirm pipeline seeder doesn't have stale block for target slug
- Confirm chart canonical reference article accessible for diff
- Confirm per-chart h2 title pattern present in source-of-truth UTH article (population)
- For iteration on published article: explicit "do not touch DB" guardrails in prompt

---

## Section 16 Visual Verification Checklist

Items (a) through (l) carried forward from V3 (chart rendering, mobile layout, link verification, draft gate, PNG download, etc.).

V4 additions:
- (m) Per-chart h2 title renders above each chart
- (n) Chart annotation strings match prose claims for same numbers
- (o) Grouped-bar charts correctly suppress duplicate bars for non-applicable rows
- (p) Multi-line charts have no horizontal or vertical collisions at chart edges

V5 principle: Section 16 items are HUMAN-EYES gates, not measurement gates (Lesson V). A JavaScript probe is diagnostic only; acceptance requires the assistant or Tim to look at the rendered output.

---

## Anti-Drift Gates

Three recurring failure modes and their countermeasures (added 2026-06-02):

1. **Memory drift mid-session** — quote the specific protocol/cheatsheet line at the point of use; never paraphrase a rule from memory.
2. **Acting without certainty** — label every claim verified-from-source vs believed-from-memory; the report-first + HOLD pattern is the checkpoint before any irreversible step.
3. **Not reviewing completed work** — "done" requires re-opening the relevant checklist, scanning the debt ledger and lessons, and looking at the LIVE rendered output (Lesson V), not just the code.

---

## Build, Commit, Deploy

### Build Verification
```bash
cd economic-pulse-app && npm run build  # NOT from repo root
```
- Confirm clean build with no errors; print bundle hash
- Verify `html2canvas` in `package-lock.json`

### Commit and Push
Use explicit file paths only. Never `-A`. Combine `git add + commit + push` into one prompt.

```bash
git add economic-pulse-app/src/under-the-hood-<SLUG>.jsx
git add economic-pulse-app/src/napaserve-admin.jsx
git add economic-pulse-app/src/App.jsx
git add pipeline/seed_article_polls.py
git status
git commit -m "feat(uth): add <slug> ..."
git push origin main
```

### Vercel Deploy Verification
```bash
until [ "$(curl -s 'https://www.napaserve.org/' | grep -oE 'index-[A-Za-z0-9_-]+\.js' | head -1)" = "<EXPECTED_HASH>" ]; do
  sleep 8
done
```

---

## Live Page Verification — Seven-Element Checklist

Run in browser console on deployed admin draft:

```javascript
const t = document.body.innerText;
JSON.stringify({
  rc: t.includes('Related Coverage'),
  arch: t.includes('Search Napa Valley'),
  polls: t.includes("Today's Polls"),
  meth: t.includes('Methodology'),
  src: t.includes('Sources'),
  byline: t.includes('Tim Carl is a Napa Valley'),
  substackLink: t.includes('Napa Valley Features on Substack')
})
```

All seven must return true before publishing.

---

## Draft Mode and Publish Flip

### Draft Mode Behavior
- Articles deploy with `published=false`
- Route gated by `useDraftGate(ARTICLE_SLUG)`
- Admin users see article with gold DRAFT banner
- Public users redirect to `/under-the-hood`
- Verify draft gate works by hitting URL in incognito after deploy

### Editorial Review Checklist
- All charts visually render correctly desktop and mobile
- Chart annotations and callouts placed correctly
- Click "Download Chart PNG" on each chart — verify file downloads with title and watermark
- Mobile check: resize browser to ~380px wide, scroll Chart 3 — should scroll horizontally inside `overflowX:auto` container
- Inline links: spot-check 3-5 random hyperlinks resolve
- Polls render question + 5 options each; vote on one to confirm worker round-trip
- Word export from admin renders correctly (template bugs pending — see Platform Debt Ledger)

### Publish Flip
After editorial review on live draft:
```sql
UPDATE napaserve_articles
SET published=true, published_at=NOW()
WHERE slug='<SLUG>';
```

Or via curl + service-role key from `.env`.

---

## Chrome MCP on Admin DRAFT Pages — Authorization Pattern (Lesson R)

Chrome MCP for visual verification of admin-gated DRAFT pages only after explicit per-session authorization from Tim.

**Rules:**
- Tim navigates to admin URL and enters admin token himself
- Tim signals authorization with explicit phrase ("you should be in")
- Assistant may then take screenshots, scroll, inspect DOM, run javascript_exec for read-only inspection
- Assistant must NEVER navigate to auth flows, read sessionStorage, or touch admin tokens

Prior incident: April 2025 ANTHROPIC_API_KEY incident on auth-gated config surfaces.

---

## Cross-References

For chart geometry, lesson detail, operational pitfalls, and verification patterns, see `napaserve-cheatsheet.md`.

For Pulse Tracker integration, see `napaserve-pulsetracker-plan.md`.

For platform debt items affecting UTH builds, see `napaserve-platform-debt-ledger.md`.

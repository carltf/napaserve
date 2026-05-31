# NapaServe — Master Brief

Canonical state-of-platform document. Who Tim Carl is operating as, what NapaServe and the CommunityServe architecture are, what is live, what is in motion, what is on the horizon, and the editorial and operational standards that govern the work.

Maintained as markdown-canonical per ADR-001 (2026-05-24). Active commitments and platform debt live in `napaserve-platform-debt-ledger.md`; this brief covers stable structural content.

---

## Identity and Organizational Architecture

### Tim Carl

Napa Valley–based photojournalist, journalist, and scientist. Founder and editor of Napa Valley Features (Substack, napavalleyfocus.substack.com). Founder and operator of NapaServe (napaserve.org), a community intelligence platform for Napa County. Founder of Valley Works Collaborative (VWC), the parent organization of the technical and incubator work.

### Three-Layer Architecture Under VWC

**Editorial Layer — Features Network:**
- Napa Valley Features (live) — napavalleyfocus.substack.com + napavalleyfeatures.com
- Sonoma County Features (live)
- Lake County Features (live)

**Community Intelligence Layer — Serve Network:**
- NapaServe (live) — napaserve.org — flagship platform for Napa County
- SonomaServe (planned)
- LakeServe (planned)

**Parent — CommunityServe:**
The nonprofit umbrella encompassing Features Network, Serve Network, and Valley Works Collaborative (VWC). VW Labs is the applied innovation arm housed inside VWC.

### Community Intelligence Concept

Connective tissue layer merging three data streams: Structured Data (FRED, Census, CDFA), Editorial Data (NVF articles and embeddings), Community Signal (polls, reader input). Powers the Research Agent, Project Evaluator, scenario calculators, and weekly email digest.

### Editorial Identity

- Data-driven, scientific journalism
- AP style throughout
- "community intelligence" — never "civic intelligence"
- Community-health framing: jobs, wages, families, agricultural and hospitality worker pathways, family-owned business survival
- Tim's positioning: "we are objective, scientific journalists who also live and love this place"
- Off-record sourcing corroborates published data but does not lead it

---

## Subscriber Architecture

Four tiers, unified in a single database schema designed to scale across all Serve instances:

| Tier | Who | Access |
|---|---|---|
| Public Free | NapaServe hub signups — residents, curious readers | Saturday email, events, polls, public data, NVF archive search |
| Substack Free | Free Substack subscribers to Features publications | Same as Public Free + CTA to upgrade |
| Substack Paid | Paid and founding Substack subscribers | All above + Under the Hood articles, calculators |
| Professional | City managers, planners, businesses — direct annual subscription | All above + Research Agent, Evaluator, custom reports |

**Automation:** Substack webhook → Cloudflare Worker → Supabase upsert. county_id in schema from day one for cross-instance portability.

**Gate Mechanism:** Magic link authentication (email → Resend one-time link → session token). No passwords.

---

## Brand Rules (Locked, Non-Negotiable)

- NapaServe: Umbrella platform | Valley Works Collaborative: Parent | VW Labs: Innovation arm
- Community Pulse: Dashboard name | Research Agent: Agent name
- Framing: COMMUNITY INTELLIGENCE FOR NAPA VALLEY
- Substack URL canonical: `napavalleyfocus.substack.com` — NEVER change to `napavalleyfeatures`
- All UI: "community intelligence" — never "civic intelligence" or "civic AI platform"
- Always "Napa Valley Features" — never "Napa Valley Focus" or "Napa Valley News Group"
- Never fabricate Substack URLs; use confirmed `nvf_posts` DB query or main page only

---

## AP Title Case (Applies Everywhere)

NapaServe and Napa Valley Features use AP title case for ALL headers and titles: article titles, section headers, email subject lines, tracker entry headlines, Snapshot eyebrows, component card labels, Slack post titles, session document titles.

### Capitalize
- All nouns, pronouns, verbs (including short verbs: Is, Are, Was, Be, Has, Do)
- All adjectives, adverbs
- Subordinating conjunctions (If, Because, Although, When, While, Until)
- Prepositions of 4 or more letters (After, Between, Through, Across, About, Under, Over, Into, From, With)
- First and last word regardless of part of speech
- Words immediately after a colon
- Both segments of hyphenated compound words (Three-Year, State-of-the-Art)

### Lowercase
- Articles: a, an, the
- Coordinating conjunctions: and, but, or, nor, for, yet, so
- Short prepositions (3 letters or fewer): at, by, in, of, on, to, up

Quick test: 'Is' capitalizes (verb), 'in' lowercase (3-letter preposition), 'After' capitalizes (5-letter preposition).

---

## Editorial Standards (Locked, Non-Negotiable)

- Use `%` symbol always — never spell out "percent"
- No Oxford commas anywhere
- AP Title Case on all headings, subheadings, captions, chart titles
- "Napa Valley Features" — never "Focus," never "News Group"
- "community intelligence" — never "civic"
- Don't-words: curate, tapestry, special, unique, discover, explore, nestled, vibrant
- Internal article link format: italics title (linked) (Date)
- Stakeholder language: "planners, policymakers, community members and civic leaders"
- Byline placement: immediately after final article section, before PollsSection — never at bottom after sources
- Pre-check all generated prose before delivery
- Off-record sourcing corroborates published data but does not lead it
- Verified sourced quotes only — no fabricated quotes

---

## Section 0 — Ground Truth Verification (Platform-Wide)

Before Claude stages any Claude Code prompt, SQL query, content deliverable, or automation sequence, Claude must verify assumptions against reality — not docs, not memory.

### Reality Is
- **For code:** the actual file in the repo at main. grep, view, or open
- **For data:** the current state of the Supabase table, pipeline output, FRED series value. Query it
- **For rendering:** the live production page or preview URL via Chrome. Not a past screenshot
- **For infrastructure:** current Cloudflare Worker routes, GitHub Actions workflow, admin.jsx config. Fetch or grep

### Top Principles (locked May 10, 2026)

**Live > protocol > assistant memory.** When the live shipped page and the protocol document disagree on rendering, sequencing, or component structure, the live page wins. Update the protocol to match.

**Read-before-draft.** When Claude is asked to produce any Claude Code prompt or to make any decision documented in protocol files, Claude reads the relevant protocol section before drafting. State which protocol sections were read and what they require, then draft. If three protocol lines or section headers can't be named for the prompt being drafted, the prompt is being drafted from memory and should be discarded.

When verification returns unexpected output: stop, don't reinterpret. Re-verify. Don't guess around the gap.

---

## Tools and Resources

### Stack
- React/Vite frontend at `~/Desktop/napaserve/economic-pulse-app/`
- Supabase: `csenpchwxxepdvjebsrt.supabase.co`
- Cloudflare Worker: `misty-bush-fc93.tfcarl.workers.dev` (manual deploy only)
- Vercel: auto-deploy on push to main
- GitHub: `carltf/napaserve` (private)
- Anthropic API: `claude-sonnet-4-20250514`
- Voyage AI: `voyage-3`
- Resend (transactional email)
- Google Workspace: `info@napaserve.com`
- GoDaddy domains

### Worker Routes
- `/api/events-search` — DB-backed search over `community_events` with astronomical fallback to `astronomical_events`
- `/api/tracker-events` — public read of approved tracker events (external consumer: Napa Lowdown)
- `/api/latest-substack-poll` — latest NVF Substack poll for Snapshot Reader Sentiment
- Event Moderation admin tool (admin-side approve/reject surface)
- Dynamic `TOPIC_SEEDS` (topic seeds resolved dynamically rather than hardcoded)

### Domain Portfolio
- `napaserve.org` — Primary, Vercel auto-deploy on push to main
- `napaserve.com` / `napaserve.ai` → napaserve.org redirect (301, GoDaddy)
- `valleyworkscollaborative.org` / `.com` → napaserve.org/valley-works
- `valleyworkslab.org` → napaserve.org/vw-labs

### Design System — Theme 02 Cream
- bg `#F5F0E8` / surface `#EDE8DE` / ink `#2C1810`
- accent `#8B5E3C` / gold `#C4A050` / muted `#8B7355`
- Headings Libre Baskerville; body Source Sans 3
- Inline styles only (per template)
- Old dark theme `#0F0A06` is OBSOLETE
- Always defer to Cheatsheet if conflict arises

---

## Secrets Architecture (Three-File Pointer System)

Pointer files; no values duplicated in this brief.

- `~/Desktop/napaserve/APIS.md` — env var registry, endpoints, stack
- `~/Documents/ValleyWorks/MASTER_KEYS_REFERENCE.md` — retrieval URLs, rotation log
- `~/Desktop/napaserve/.env` — actual values (gitignored)

**Supabase key format (post-March 22, 2026 rotation):**
- `SUPABASE_KEY` = `sb_secret_...` (service role, GitHub Actions + Vercel)
- `SUPABASE_ANON_KEY` = `sb_publishable_...` (Cloudflare Worker)
- Legacy JWT format still required for local seed scripts

**Bash subshell pattern:**
```
set -a && source .env && set +a && <command>
```

**GitHub push auth (rotated 2026-05-30):**
- Remotes are HTTPS; push authenticates via the macOS Keychain using fine-grained PAT `multi-repo git push (laptop)` (All repositories; Contents R/W + Workflows R/W + Metadata RO; expires 2027-05-30).
- NOT via `.env GITHUB_TOKEN` — nothing reads the token from `.env`. The `.env` entry is kept current but is not the push credential.
- Prior classic tokens (expiring 2026-06-01) deleted during the rotation.

**Hard rules:**
- Never use Chrome MCP to inspect auth-gated config surfaces
- Never ask user to paste secret values into chat
- Never write secret values into session docs
- Prior incident: April 2025 ANTHROPIC_API_KEY git exposure

---

## Database — Critical Constraints

### napaserve_articles
- INSERT must include: slug, title, headline, publication, published, polls_seeded, admin_cards_added, related_coverage_added, topic_seed
- Real columns (verified May 10, 2026): id, slug, title, publication, published, published_at, created_at, admin_cards_added, related_coverage_added, polls_seeded, topic_seed, headline, deck
- NO subtitle, excerpt, or estimated_read_time. The deck column holds what some prompt drafts call "subtitle."

### napaserve_article_polls
- Uses `article_slug` column (NOT slug) — caught April 29
- Real columns: id (auto), article_slug, question, options (text array), sort_order (1/2/3 within an article), created_at
- NO poll_id column. New polls auto-assign IDs.
- 5 options per poll, each ≤35 chars; verify via dry-run before live seed

### community_events
- `description` column is NOT NULL
- Omit `ON CONFLICT DO NOTHING`
- `source` value is `'NapaLife'`
- Columns: title, description, event_date, end_date, start_time, town, category, venue_name, address, source, source_url, status, include_in_email

### napa_transition_tracker
- RLS enabled with zero policies — fully blocked from anon-key access
- Service role bypasses RLS for pipeline writes
- Worker route `/api/tracker-events` reads with `status='approved'` filter server-side; status column stripped from output
- Single source of truth for all tracker UI surfaces per Lesson CC (2026-05-24)

### astronomical_events
- Currently EMPTY (0 rows, confirmed 2026-05-30) — `05_seed_astronomy.py` never populated it (PD-2026-05-30-01)
- Consumed by `/api/events-search` astronomical fallback and the Calistoga Currents night-sky search

### External Read-Tenants (flag before schema/RLS changes)
- **Calistoga Currents** is an external read-only tenant on `economic_pulse_snapshots`, `community_events`, and `astronomical_events` via a hardcoded anon key in the CC repo, served through `calistoga-currents-feed.tfcarl.workers.dev` (ADR-002, 2026-05-30). Check CC impact before any schema/RLS change to those three tables.
- **Napa Lowdown** consumes `/api/tracker-events` (public approved-tracker read). Check before changing that route's shape.

---

## Dashboard — 12 FRED Macro Indicators

Across 3 rows: UNRATE, CAUR, CANA, JTSJOR, CPIAUCSL, PPIACO, MORTGAGE30US, CASTHPI, RSAFS, INDPRO, HOUST, T10Y2Y.

---

## Nav Drawer Order (Standardized 2026-03-14)

- Group 1: Journalism
- Group 2: Community (VW Labs → /valley-works)
- Group 3: Intelligence
- Group 4: Platform
- Contact — always last

---

## Key Paths

- Project root: `~/Desktop/napaserve`
- Build dir: `~/Desktop/napaserve/economic-pulse-app`
- iCloud Active: `~/Library/Mobile Documents/com~apple~CloudDocs/Valley Works Collaborative/NapaServe/Active/`
- iCloud Older Drafts (V5 archive): same path + `/Older Drafts/`

---

## Operational Rules

- Use `python3` not `python` on Mac
- `npm run build` runs from `economic-pulse-app/` subdirectory
- Worker.js deploys are MANUAL via Cloudflare dashboard
- Poll extraction is manual-only, monthly cadence
- SUBSTACK_SID expires June 13, 2026

---

## Key Data Assets

- 1,738+ NVF reader polls (June 2023–present) across 10 thematic categories
- 997 NVF articles → 10,033 semantic chunks with Voyage-3 embeddings
- 1,603 poll embeddings
- 150 structured economic observations (lodging + grape crush)
- 1,450+ community events
- 5,064 nvf_subscribers (Substack import)
- 28 napa_transition_tracker events (as of 2026-05-24, post three-event seed)

---

## Weekly Snapshot Tab (v1.1 shipped 2026-05-05; PNG export overhauled 2026-05-18)

Six-signal at-a-glance synthesis of Napa County's economy. URL: `napaserve.org/dashboard?tab=snapshot`

### Six-Signal Taxonomy
1. **Wine Industry** — Type-02 winery licenses (Napa). Primary stat: `latestW.napa`. Footer: "X.X% of California Type-02"
2. **Labor Market** — unemployment rate (`latestE.unemp`)
3. **Workforce Size** — civilian labor force (`latestE.labor`)
4. **Housing** — average home value ZHVI (`latestE.home`); YoY computed via 52-week lookback
5. **Regional Transitions** — last 30 days via `/api/tracker-events` Worker route (consumed via `useTrackerEvents` hook as of 2026-05-24)
6. **Reader Sentiment** — latest NVF Substack poll via `/api/latest-substack-poll` Worker route. Full-surface click target when `poll.substack_url` non-null

### Stoplight Threshold Rules (v1.1, locked in `stoplights.js`)

18px diameter dot, 12px from top-right corner. Single source of truth: `economic-pulse-app/src/stoplights.js`.

- Wine CA share: green ≤25.0%, yellow 25.1–27.4%, red ≥27.5%
- Labor (unemployment): green ≤3.5%, yellow 3.6–4.9%, red ≥5.0%
- Workforce (MoM labor force): green increase, yellow flat ±0.5%, red decrease
- Housing (ZHVI YoY): green ≥+3.0%, yellow 0–+2.99%, red <0%
- Regional Transitions (count, last 30 days): green ≤3, yellow 4–8, red ≥9
- Reader Sentiment: NO stoplight by editorial design

### Stoplight Color Hex Map
- green: `#16a34a` / yellow: `#ca8a04` / red: `#dc2626` / neutral: `#9ca3af`

### Architectural Patterns
- **Flat-primitive prop contract:** parent computes all derived values, passes flat primitives to thin presentational component
- **Single source of truth helpers:** `stoplights.js` for thresholds + color map; `useTrackerEvents.js` for tracker data (May 24)

### Snapshot PNG Export (V5 canonical, distinct from UTH chart PNG)
- Clone wrapper: width 1152px, NO padding
- html2canvas: scale 2, backgroundColor #F5F0E8, useCORS true, width 1152, windowWidth 1152
- Final PNG: 2432 × variable; symmetric 32px frame
- Title: bold 64px Libre Baskerville at (64, 64), textBaseline top
- drawImage at (64, 160)
- Watermark: 52px Source Code Pro, right-aligned, vertically centered in 64px bottom frame
- See `napaserve-cheatsheet.md` Snapshot PNG section for full geometry

---

## Currently Live UTH Articles

| Slug | Polls | Status |
|---|---|---|
| napa-cab-2025 | 1–3 | LIVE |
| sonoma-cab-2025 | 4–6 | LIVE |
| lake-county-cab-2025 | 7–9 | LIVE |
| napa-gdp-2024 | 10–14 | LIVE |
| napa-supply-chain-2026 | 15–17 | LIVE |
| napa-structural-reset-2026 | 21–23 | LIVE |
| napa-price-discovery-2026 | 24–26 | LIVE |
| napa-lodging-pricing-2026 | 33–35 | LIVE |
| napa-marketing-machine-2026 | 36–38 | PUBLISHED 2026-05-04 |
| napa-population-2025 | 39/40/41 | PUBLISHED 2026-05-11 |
| napa-schools-2026 | 42/43/44 | PUBLISHED 2026-05-17 |
| napa-farming-2026-gwss | TBD | REPORTED PUBLISHED 2026-05-27 (NapaServe + Substack); 5 verify flags; DB confirmation pending (draft d67e8fb, PD-2026-05-30-04) |

**Next available poll ID:** 45.

**Status verification rule (Lesson Z, May 18, 2026):** EOS doc generation MUST run DB status query against every article slug mentioned. Never transcribe published-state from prior session docs.

### Marketing Machine — Canonical Render Order (verified live May 10)
NavBar → Eyebrow → Headline → Byline+Date → Deck → Substack link → Article Summary → body sections with charts → italic bio byline → "Loading polls…" → PollsSection → Related Coverage → Archive Search → Methodology → Sources → Footer.

This is the source-of-truth template for all future UTH builds.

### Related Coverage Format (verified live May 10)
Plain link list. Quoted titles + em-dash + publication name + parenthetical date. Titles are linked. Not card grid.

---

## End-of-Session Ritual

Per ADR-001 (2026-05-24), EOS is markdown-canonical. See `napaserve-eos-checklist.md` for the full routine. Replaces the prior five-doc cumulative `.docx` ritual (April 27 – May 18, 2026). V5 archive lives in iCloud `Active/Older Drafts/`.

---

## Operational Pitfalls (cross-reference Cheatsheet for full detail)

- **iCloud sync mid-session → cwd permission cascade.** Fix: restart Claude Code from inside project directory
- **TCC stale entitlement on Terminal** (May 10, 2026; verified procedure 2026-05-24). Fix: Full Disk Access remove/re-add Terminal, Cmd+Q quit (NOT Cmd+W), relaunch
- **zsh paste pitfall** when shell sequence contains comments. Paste one line at a time
- **macOS file-descriptor limit** (256 default). Run `ulimit -n 2147483646`
- **TextEdit trap:** never save .html or .md files from TextEdit — converts to RTF

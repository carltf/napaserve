# NapaServe — Session Record 2026-06-02

**Scope:** "Could Gen Z Save the Wine Industry?" UTH (slug could-gen-z-save-the-wine-industry, DB id=16, polls 48–50) — hub-drift fix, bubble-chart split, full source-linking pass, all shipped to the gated draft. Plus a trust/failure-mode reckoning that produced the Anti-Drift gates now in the protocol. Publish HELD for June 4.

## Headline
- Hub rendering drift fixed and verified live (commit 4ca41e0).
- Gen-Z bubble chart split into separate Millennials / Gen Z cohorts; pushed (bundle index-BtsqAnLy).
- Full source-linking pass — caption Source clauses + bottom list, internal-first — pushed (commit 0f903ff, bundle index-BBTzzbIX) and confirmed live in the production bundle.
- Article remains gated (published=false); publish timed for June 4 (day after Berger's "A Hard Reset").

## Hub rendering drift — FIXED (commit 4ca41e0)
- Symptom: farming card showed a BLANK title; titles inconsistent across cards; admin archived-tag wrapped two lines.
- Root cause: hub (under-the-hood-index.jsx) fetched Worker /api/articles (no `headline` field) and rendered `a.title`; farming row had title=null, so blank. Admin ARTICLES registry had drifted into two shapes.
- Fix: hub now fetches Supabase REST directly (anon key, published=eq.true) for `headline`; renders stripPrefix(a.headline) in both card surfaces; deck sourced from DB; all 15 ARTICLES normalized to canonical {slug, headline, publication, date}; admin archived tag whiteSpace:nowrap, flexShrink:0.
- stripPrefix() strips a leading "Under the Hood: " (null-safe); Word export keeps the prefix.
- Verified live: farming title populated, prefix stripped uniformly, could-gen-z absent (gated).
- DEBT: hub now bypasses the Worker (forked data path) → add `headline` to Worker select and point hub back. Logged in ledger.

## Gen-Z bubble chart — split + relabeled (bundle index-BtsqAnLy)
- "No One Has All Three": combined "Millennials & Gen Z" bubble split into Millennials (x74/y11/r12/navy/"Low") and Gen Z (x35/y6/r9/accent brown/"Low (rising)"); Boomers/Gen X/Silent unchanged. Gen Z lower-left, brown kept per decision.
- Label fix: textBaseline "bottom" + 6px pad; both label lines anchored above each bubble's top edge — no label over its circle.
- Caption #2 (both stores) appended the basis: Millennials ~$11T + Gen Z ~$6T sum to UBS's ~$17.1T; Gen Z's ~$6T is Cerulli's 2022 SCF financial-wealth figure used as a net-worth proxy.
- Wealth research: neither Fed DFA nor UBS breaks out Gen Z (youngest bucket = born 1981+). UBS GWR 2025 total $163.1T. Plotted Gen Z ~$6T (Cerulli, disclosed) + Millennials ~$11T (UBS residual), summing to UBS.

## Source-linking pass — internal-first (commit 0f903ff, bundle index-BBTzzbIX)
- Read-first confirmed structure: the Caption component already renders per-source {label, url} (emits an <a> when url is set); the bottom <ol> uses inline <a>. Composites split into per-source entries; <li>s wrapped inline.
- Internal-first rule: link our own coverage where it exists; external original only otherwise.
  - Treasury / Constellation → /under-the-hood/napa-constellation-2026; oil shock → /under-the-hood/napa-supply-chain-2026; Premiere totals → our Premiere Substack; Ted Hall → his own essay (ted241.substack.com) per Tim.
- External: Pew, Fed DFA, UBS GWR 2025, Cerulli, CareScout, Fidelity ($172,500 / 2025), Conference Board (Q2 2026), BEA (April 2026), Robert Parker, Napa Ag Preserve, Judgment of Paris. (U.S. Census left plain — no specific population URL.)
- Every figure verified real via web + archive search. 17 inline <a> in the bottom <ol>; caption splits mirrored in admin EXPORT_DATA captions. All external URLs confirmed present in the production bundle.
- Fidelity corrected: the article's ~$165k was the 2024 estimate → updated to $172,500 (2025).

## Decisions
- Keep Gen Z's accent-brown bubble.
- Internal-first source linking is the standard; named-author primaries (e.g. Ted Hall) may link to the original.
- Admin EXPORT_DATA bottom-sources markdown deferred to the Word-template "markdown-link collapse" fix (schools uses [label](url); gen-z stays plain until then, done across all articles together).
- Publish HELD: gen-z dated June 4 (day after Berger ~June 3); Berger Related Coverage link pending; BlueSky card still the wrong Calistoga card.

## Next session (execution items)
1. Publish time: add Berger "A Hard Reset" Related Coverage URL (~June 3); regenerate the BlueSky share card; flip published=true after a rendered-draft pass; add gen-z to the Master Brief live-inventory table.
2. Rendered-draft verification still owed: bubble color/label/axis (desktop), mobile ~380px (phone), link click-through, poll vote round-trip, chart PNG download, Word export from admin.
3. Worker /api/articles headline debt — add `headline`, point hub back off the direct Supabase fetch.
4. Word-template fix → then add [label](url) to gen-z admin bottom-sources.
5. Clean up .bak / .bak2 / .bak3 / .bak4 in economic-pulse-app/src after verification.

## Reference charts (reusable models)
- This article's four charts are clean, working examples worth modeling future UTH charts on (all in under-the-hood-could-gen-z-save-the-wine-industry.jsx):
  - Line with era annotations — "The Engine, Rising and Falling" (boomer population).
  - Multi-cohort bubble with labels anchored above each circle — "No One Has All Three."
  - Step-down waterfall — "The Inheritance That Isn't" ($124T → $6T).
  - Interactive scenario tester — locked TODAY / PROJECTED 2040 / BEST CASE with a recession case.
- Forward note: the protocol forbids copying from a live published article (canonical scaffold = under-the-hood-template.jsx), so the durable move is to extract these four chart patterns into the template or a dedicated chart-examples reference. Logged as a forward item.

## Lessons reinforced
- (Anti-Drift, now in the protocol) Quote the protocol line at point of use; label claims verified-from-source vs believed-from-memory; "done" = re-checking protocol + ledger + the live rendered output, not just code.
- Read-before-edit paid off twice: the read-only structure pass prevented a blind composite-split, and checking the live bundle hash corrected a stale "not pushed" claim.
- Internal-first linking; and our own archive is the first place to look for source URLs before the open web.

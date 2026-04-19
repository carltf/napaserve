// UNDER THE HOOD — CANONICAL TEMPLATE
// -----------------------------------------------------------------
// DO NOT PUBLISH THIS FILE DIRECTLY.
// Copy this file to create a new article. Naming convention:
//   under-the-hood-[county-prefix]-[topic].jsx
//   e.g. under-the-hood-napa-constellation.jsx
//        under-the-hood-sonco-grape-prices.jsx
//        under-the-hood-lakeco-tourism.jsx
// -----------------------------------------------------------------
// After copying, update these blocks in order:
//   1. COUNTY + PUBLICATION constants (top of file)
//   2. ARTICLE_SLUG + ARTICLE_DATE + ARTICLE_MONTH_YEAR
//   3. POLLS array (3 polls, 5 options each, ≤35 chars per option)
//   4. SOURCES array (specific article URLs only — no bare domains)
//   5. Headline, deck (if SHOW_DECK=true), article summary
//   6. Dateline + body prose + section headers
//   7. Chart components (buildChart callbacks + captions)
//   8. Optional: calculator component (see commented block)
// -----------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chart, registerables } from "chart.js";
import NavBar from "./NavBar";
import Footer from "./Footer";
import useDraftGate from "./hooks/useDraftGate";
import DraftBanner from "./components/DraftBanner";
import RelatedCoverage from "./components/RelatedCoverage";

Chart.register(...registerables);

const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";

// ── COUNTY + PUBLICATION ───────────────────────────────────────────
// Set these three constants at the top of every new article.
// All downstream JSX reads from these — change once, affects whole article.
const COUNTY_PREFIX = "napa";            // "napa" | "sonco" | "lakeco"
const PUBLICATION = "Napa Valley Features"; // "Napa Valley Features" | "Sonoma County Features" | "Lake County Features"
const SUBSTACK_URL = "https://napavalleyfocus.substack.com/"; // publication's Substack root
const DATELINE_LOCATION = "NAPA VALLEY, Calif."; // dateline at start of first body paragraph

// ── ARTICLE METADATA ───────────────────────────────────────────────
const ARTICLE_SLUG = "template";              // change to e.g. "napa-constellation-2026"
const ARTICLE_DATE = "[Month Day, Year]";    // e.g. "April 25, 2026" — displayed inline with byline
const ARTICLE_MONTH_YEAR = "[Month Year]";   // e.g. "April 2026" — used in meta fields if needed

// ── DECK CONTROL ───────────────────────────────────────────────────
// DECK = 1 sentence, editorial hook. MUST do real work beyond the Article Summary.
// Deck = why this piece exists (voice, tension, framing).
// Summary = what the piece concludes (objective gist, 3-4 sentences).
// If you can't articulate a hook distinct from the summary, set SHOW_DECK = false.
const SHOW_DECK = true;

// ── THEME ──────────────────────────────────────────────────────────
const T = {
  bg: "#F5F0E8",
  surface: "#EDE8DE",
  ink: "#2C1810",
  accent: "#8B5E3C",
  gold: "#C4A050",
  muted: "#8B7355",
  border: "#D4C9B8",
  rule: "rgba(44,24,16,0.12)",
};
const font = "'Source Sans 3','Source Sans Pro',sans-serif";
const serif = "'Libre Baskerville',Georgia,serif";

const prose = {
  fontFamily: font,
  fontSize: 17,
  lineHeight: 1.75,
  color: T.ink,
  marginBottom: 18,
};

const h2style = {
  fontFamily: serif,
  fontSize: 22,
  fontWeight: 700,
  color: T.ink,
  marginTop: 36,
  marginBottom: 12,
};

// ── POLLS ──────────────────────────────────────────────────────────
// 3 polls per article. 5 options each. ≤35 chars per option.
// Include a neutral/uncertain option in each.
// Poll IDs auto-assign from napaserve_article_polls sequence.
// Dry-run before live seed: python3 pipeline/seed_article_polls.py --slug [slug] --dry-run
const POLLS = [
  {
    question: "[POLL 1 — primary question about article thesis]",
    options: [
      "[Option A]",
      "[Option B]",
      "[Option C]",
      "[Option D]",
      "[Unsure or neutral]",
    ],
  },
  {
    question: "[POLL 2 — reader experience or behavior question]",
    options: [
      "[Option A]",
      "[Option B]",
      "[Option C]",
      "[Option D]",
      "[Unsure or neutral]",
    ],
  },
  {
    question: "[POLL 3 — forward-looking prediction question]",
    options: [
      "[Option A]",
      "[Option B]",
      "[Option C]",
      "[Option D]",
      "[Too soon to tell]",
    ],
  },
];

// ── SOURCES ────────────────────────────────────────────────────────
// Specific article URLs only. Never bare domains.
// NVF references: always query nvf_posts.substack_url for canonical URL.
// NVF domain: napavalleyfocus.substack.com (NOT napavalleyfeatures.substack.com)
const SOURCES = [
  { label: "[Publication — 'Article Title' (Author, Date)]", url: "[full article URL]" },
  { label: "[Publication — 'Article Title' (Author, Date)]", url: "[full article URL]" },
  { label: "[Publication — 'Article Title' (Author, Date)]", url: "[full article URL]" },
];

// ── DOWNLOAD HELPER ────────────────────────────────────────────────
// Canonical chart PNG download handler.
// html2canvas scale:2 — drawn text renders at 2x (title 32px renders as 16px visually).
// Watermark globalAlpha 0.25. Title globalAlpha 1.0.
// DO NOT add a watermarkPlugin to chart plugins array — causes double-watermark.
async function downloadComponentPng(containerRef, filename, title) {
  if (!containerRef.current) return;
  const { default: html2canvas } = await import("html2canvas");
  const canvas = await html2canvas(containerRef.current, { scale: 2, useCORS: true, backgroundColor: T.bg });
  const off = document.createElement("canvas");
  off.width = canvas.width;
  off.height = canvas.height + 80;
  const ctx = off.getContext("2d");
  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, off.width, off.height);
  ctx.drawImage(canvas, 0, 64);
  ctx.save();
  ctx.globalAlpha = 1.0;
  ctx.font = "bold 32px 'Libre Baskerville', Georgia, serif";
  ctx.fillStyle = T.ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(title || "", 28, 16);
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.font = "26px 'Source Code Pro', monospace";
  ctx.fillStyle = T.muted;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("napaserve.org", off.width - 24, off.height - 16);
  ctx.restore();
  const a = document.createElement("a");
  a.href = off.toDataURL("image/png");
  a.download = filename;
  a.click();
}

// ── CHARTCANVAS COMPONENT ──────────────────────────────────────────
// Shared chart wrapper. Supply buildChart={(ctx) => new Chart(ctx, {...})} as prop.
// Download button renders OUTSIDE containerRef so it isn't captured in PNG.
function ChartCanvas({ id, title, buildChart, deps = [], downloadName }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = buildChart(ctx);
    return () => { if (chartRef.current) chartRef.current.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return (
    <div>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <canvas ref={canvasRef} id={id} />
      </div>
      <button
        onClick={() => downloadComponentPng(containerRef, downloadName, title)}
        style={{
          padding: "4px 12px",
          fontFamily: "monospace",
          fontSize: 11,
          fontWeight: 400,
          letterSpacing: "0.88px",
          color: T.muted,
          background: "transparent",
          border: `1px solid ${T.border}`,
          borderRadius: 3,
          cursor: "pointer",
          marginTop: 12,
        }}
      >
        DOWNLOAD CHART PNG
      </button>
    </div>
  );
}

// ── CAPTION COMPONENT ──────────────────────────────────────────────
// Canonical single-italic-paragraph caption format per April 18, 2026 SOP.
// Usage:
//   <Caption
//     title="Chart Title"
//     description="Description sentence(s) about what the chart shows."
//     sources={[
//       { label: "Publisher name (date range)", url: "full URL" },
//       { label: "Second publisher (date range)", url: "full URL" },
//     ]}
//   />
function Caption({ title, description, sources = [] }) {
  return (
    <p style={{ fontFamily: font, fontSize: 13, color: T.muted, fontStyle: "italic", lineHeight: 1.55, margin: "14px 0 0", maxWidth: 680 }}>
      <strong style={{ fontWeight: 700, fontStyle: "italic" }}>{title}.</strong>{" "}
      {description}{" "}
      {sources.length > 0 && (
        <>
          Source:{" "}
          {sources.map((s, i) => (
            <span key={i}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>{s.label}</a>
              {i < sources.length - 1 ? "; " : "."}
            </span>
          ))}
        </>
      )}
    </p>
  );
}

// ── LIVE POLL ──────────────────────────────────────────────────────
// Worker returns counts (object keyed by index) and total (scalar) — NOT vote_counts array.
// Pattern per UTH Protocol Part 15. Inline here (not imported) per CLAUDE.md rule.
function LivePoll({ poll }) {
  const [voted, setVoted] = useState(null);
  const [counts, setCounts] = useState(poll.counts || {});
  const [total, setTotal] = useState(poll.total || 0);
  const [loading, setLoading] = useState(false);
  const vote = async (idx) => {
    if (voted !== null || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${WORKER}/api/article-poll-vote`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poll_id: poll.id, option_index: idx }),
      });
      const data = await res.json();
      if (data.success) { setCounts(data.counts); setTotal(data.total); setVoted(idx); }
    } catch(e) {}
    setLoading(false);
  };
  return (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "20px 20px 16px", marginBottom: 16 }}>
      <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.1em", color: T.gold, fontWeight: 700, textTransform: "uppercase", margin: "0 0 8px 0" }}>Poll</p>
      <p style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: T.ink, margin: "0 0 14px 0", lineHeight: 1.4 }}>{poll.question}</p>
      {poll.options.map((opt, idx) => {
        const count = counts[idx] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const isVoted = voted === idx;
        return (
          <div key={idx} style={{ marginBottom: 8 }}>
            {voted === null ? (
              <button onClick={() => vote(idx)} disabled={loading}
                style={{ width: "100%", textAlign: "center", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, padding: "9px 12px", fontFamily: font, fontSize: 14, color: T.ink, cursor: loading ? "default" : "pointer" }}>
                {opt}
              </button>
            ) : (
              <div style={{ position: "relative", overflow: "hidden", borderRadius: 4, border: `1px solid ${isVoted ? T.accent : T.border}` }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: pct + "%", background: isVoted ? "rgba(139,94,60,0.15)" : "rgba(139,94,60,0.06)", transition: "width 0.5s ease" }} />
                <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px" }}>
                  <span style={{ fontFamily: font, fontSize: 14, color: T.ink, fontWeight: isVoted ? 600 : 400 }}>{opt}</span>
                  <span style={{ fontFamily: font, fontSize: 13, color: T.muted, marginLeft: 12, whiteSpace: "nowrap" }}>{pct}%</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {voted !== null && <p style={{ fontFamily: font, fontSize: 12, color: T.muted, margin: "10px 0 0 0" }}>{total} {total === 1 ? "vote" : "votes"} · Results update in real time</p>}
    </div>
  );
}

// ── POLLS SECTION ──────────────────────────────────────────────────
// Inline per CLAUDE.md — NOT a shared component.
// Fetches live polls for this article from the Worker by slug.
function PollsSection({ slug }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${WORKER}/api/article-polls?slug=${slug}`)
      .then(r => r.json())
      .then(data => { setPolls(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);
  if (loading) return <div style={{ padding: "24px 0", fontFamily: font, fontSize: 14, color: T.muted }}>Loading polls...</div>;
  if (!polls.length) return null;
  return (
    <div style={{ borderTop: `2px solid ${T.border}`, marginTop: 48, paddingTop: 32 }}>
      <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.1em", color: T.gold, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px 0" }}>{"Today\u2019s Polls"}</p>
      <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 20px 0" }}>What do you think?</h2>
      {polls.map(poll => <LivePoll key={poll.id} poll={poll} />)}
      <p style={{ fontFamily: font, fontSize: 12, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>
        Poll results are anonymous and stored on NapaServe. Results shown after you vote.{" "}
        Historical reader polls from Napa Valley Features are searchable in the{" "}
        <a href="/dashboard" style={{ color: T.accent }}>Community Pulse dashboard</a>.
      </p>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────
export default function UnderTheHoodTemplate() {
  const navigate = useNavigate();
  const status = useDraftGate(ARTICLE_SLUG);
  const isDraft = status === "draft";

  useEffect(() => {
    if (status === "redirect") navigate("/under-the-hood");
  }, [status, navigate]);

  if (status === "loading") {
    return (
      <div style={{ background: T.bg, minHeight: "100vh" }}>
        <NavBar />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 20px" }}>
          <p style={{ ...prose, color: T.muted }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      {isDraft && <DraftBanner />}
      <NavBar />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: isDraft ? "80px 20px 60px" : "60px 20px 60px" }}>

        {/* ── EYEBROW ────────────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          Under the Hood · {PUBLICATION}
        </p>

        {/* ── HEADLINE ───────────────────────────────────────────── */}
        <h1 style={{ fontFamily: serif, fontSize: 34, fontWeight: 700, color: T.ink, lineHeight: 1.25, marginBottom: 16 }}>
          [HEADLINE — article title, no "Under the Hood:" prefix (eyebrow handles that)]
        </h1>

        {/* ── BYLINE + DATE (inline) ─────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.muted, marginBottom: 16 }}>
          By Tim Carl · {ARTICLE_DATE}
        </p>

        {/* ── DECK (optional — see SHOW_DECK rule above) ─────────── */}
        {/*
          DECK = 1 sentence editorial hook. MUST do real work.
          Deck = voice, tension, framing — why this piece exists.
          Summary = objective gist — what the piece concludes.
          If you cannot articulate a hook distinct from the summary,
          set SHOW_DECK = false at the top of this file and this block disappears.
        */}
        {SHOW_DECK && (
          <p style={{ fontFamily: serif, fontSize: 18, color: T.muted, lineHeight: 1.6, marginBottom: 24, fontStyle: "italic" }}>
            [DECK — one-sentence editorial hook. Must do real work beyond the Article Summary. Voice, tension, framing.]
          </p>
        )}

        {/* ── SUBSTACK LINK ──────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 13, color: T.muted, marginBottom: 32, borderBottom: `1px solid ${T.border}`, paddingBottom: 20 }}>
          Read on{" "}
          <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>
            {PUBLICATION} · Substack →
          </a>
        </p>

        {/* ── ARTICLE SUMMARY ────────────────────────────────────── */}
        {/*
          SUMMARY = objective, 3-4 sentences, drives reader forward.
          Covers what happened, what it means, what to watch.
          Written so readers can skim the piece's argument before deep read.
        */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "16px 20px", marginBottom: 32 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Article Summary</p>
          <p style={{ ...prose, fontSize: 15, marginBottom: 0 }}>
            [ARTICLE SUMMARY — 3-4 objective sentences. What happened. What it means. What to watch. Drives the reader forward.]
          </p>
        </div>

        {/* ── SECTION 1 (first paragraph carries the dateline) ───── */}
        <h2 style={h2style}>[SECTION 1 HEADER]</h2>
        <p style={{ ...prose, marginBottom: 18 }}>
          <span style={{ fontWeight: 700 }}>{DATELINE_LOCATION} —</span>{" "}[First body paragraph. Dateline is a bold inline span that flows into the sentence — NOT a standalone paragraph.]
        </p>
        <p style={prose}>
          [Second paragraph of Section 1.]
        </p>

        {/* ── CHART 1 ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>[CHART 1 TITLE]</h2>
          <ChartCanvas
            id="chart-1"
            title="[CHART 1 TITLE — used in download PNG header]"
            downloadName="chart-1_[slug]_[pub-shortcode].png"
            deps={[]}
            buildChart={(ctx) => {
              return new Chart(ctx, {
                type: "bar", // "bar" | "line" | "scatter" | etc.
                data: {
                  labels: ["[L1]", "[L2]", "[L3]"],
                  datasets: [{
                    label: "[Series Name]",
                    data: [0, 0, 0],
                    backgroundColor: T.accent,
                    borderRadius: 3,
                  }],
                },
                options: {
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                },
              });
            }}
          />
          <Caption
            title="[Chart 1 Title]"
            description="[1-2 sentences describing what the chart shows and why it matters.]"
            sources={[
              { label: "[Publisher (date range)]", url: "[full URL]" },
            ]}
          />
        </div>

        {/* ── SECTION 2 ──────────────────────────────────────────── */}
        <h2 style={h2style}>[SECTION 2 HEADER]</h2>
        <p style={prose}>
          [Section 2 opening paragraph.]
        </p>
        <p style={prose}>
          [Section 2 second paragraph.]
        </p>

        {/* ── CHART 2 ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>[CHART 2 TITLE]</h2>
          <ChartCanvas
            id="chart-2"
            title="[CHART 2 TITLE]"
            downloadName="chart-2_[slug]_[pub-shortcode].png"
            deps={[]}
            buildChart={(ctx) => {
              return new Chart(ctx, {
                type: "line",
                data: {
                  labels: ["[L1]", "[L2]", "[L3]"],
                  datasets: [{
                    label: "[Series Name]",
                    data: [0, 0, 0],
                    borderColor: T.accent,
                    backgroundColor: T.accent,
                    borderWidth: 2.5,
                    tension: 0.3,
                    pointRadius: 4,
                  }],
                },
                options: {
                  responsive: true,
                  plugins: { legend: { display: true } },
                },
              });
            }}
          />
          <Caption
            title="[Chart 2 Title]"
            description="[1-2 sentences describing what the chart shows.]"
            sources={[
              { label: "[Publisher (date range)]", url: "[full URL]" },
            ]}
          />
        </div>

        {/* ── ADDITIONAL SECTIONS ────────────────────────────────── */}
        {/* Copy Section 2 + Chart 2 pattern for additional sections as needed. */}
        {/* Most UTH articles run 4-6 sections total. */}

        <h2 style={h2style}>[SECTION 3 HEADER]</h2>
        <p style={prose}>
          [Section 3 prose.]
        </p>

        <h2 style={h2style}>[SECTION 4 HEADER — often "What to Watch" or similar forward-looking]</h2>
        <p style={prose}>
          [Closing section prose.]
        </p>

        {/* ── OPTIONAL: CALCULATOR ───────────────────────────────── */}
        {/*
          Not every UTH article needs a calculator. If this piece does,
          add the calculator component here, between the final section and Sources.
          Reference implementations:
            - under-the-hood-napa-price-discovery.jsx (4-scenario calculator)
            - under-the-hood-napa-structural-reset.jsx (reset calculator)
          Remove this entire comment block if not needed.
        */}

        {/* ── SOURCES ────────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 48, paddingTop: 24 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 17, color: T.ink, marginBottom: 16 }}>Sources</h2>
          {SOURCES.map((s, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: font, fontSize: 14, color: T.accent, textDecoration: "underline", lineHeight: 1.5 }}>
                {s.label}
              </a>
            </div>
          ))}
        </div>

        {/* ── AUTHOR NOTE ────────────────────────────────────────── */}
        <div style={{ marginTop: 32, padding: "20px 0", borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontFamily: font, fontSize: 14, color: T.muted, fontStyle: "italic", margin: 0 }}>
            Tim Carl is a Napa Valley-based photojournalist and the founder and editor of {PUBLICATION}.
          </p>
        </div>

        {/* ── POLLS ──────────────────────────────────────────────── */}
        <PollsSection slug={ARTICLE_SLUG} />

        {/* ── RELATED COVERAGE ───────────────────────────────────── */}
        <RelatedCoverage articleSlug={ARTICLE_SLUG} />

        {/* ── METHODOLOGY (optional) ─────────────────────────────── */}
        <div style={{ borderTop: `2px solid ${T.border}`, paddingTop: 28, marginTop: 40 }}>
          <h3 style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: T.ink, margin: "0 0 10px" }}>Methodology</h3>
          <p style={{ fontFamily: font, fontSize: 14, color: T.muted, lineHeight: 1.7 }}>
            [Optional methodology note — how data was sourced, calculations performed, scope/limitations of analysis. Remove if not needed.]
          </p>
        </div>

      </div>

      <Footer />
    </div>
  );
}

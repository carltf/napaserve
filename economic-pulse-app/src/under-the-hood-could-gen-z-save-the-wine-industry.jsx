// UNDER THE HOOD — Could Gen Z Save the Wine Industry?
// -----------------------------------------------------------------
// Slug: could-gen-z-save-the-wine-industry
// Publication: Napa Valley Features
// Built from under-the-hood-template.jsx + under-the-hood-napa-schools-2026.jsx
// structural pattern. Theme 02 Cream tokens, inline styles only.
// -----------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chart, registerables } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import NavBar from "./NavBar";
import Footer from "./Footer";
import useDraftGate from "./hooks/useDraftGate";
import DraftBanner from "./components/DraftBanner";

Chart.register(...registerables, annotationPlugin);

const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";

// ── ARTICLE METADATA ───────────────────────────────────────────────
const ARTICLE_SLUG = "could-gen-z-save-the-wine-industry";
const ARTICLE_TITLE = "Under the Hood: Could Gen Z Save the Wine Industry?";
const ARTICLE_DECK = "Yesterday’s column called for a hard reset. This is why one is needed — and why the numbers point to further contraction, not recovery.";
const ARTICLE_PUBLICATION = "Napa Valley Features";
const ARTICLE_DATE = "June 4, 2026";
const SHOW_DECK = true;
const EYEBROW = "Under the Hood";

// ── COUNTY + PUBLICATION (template-compat downstream constants) ────
const PUBLICATION = ARTICLE_PUBLICATION;
const SUBSTACK_URL = "https://napavalleyfocus.substack.com/";
const DATELINE_LOCATION = "NAPA VALLEY, Calif.";

// ── THEME (Theme 02 Cream) ─────────────────────────────────────────
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
  marginTop: 32,
  marginBottom: 14,
};

const P_STYLE = prose;
const SECTION_H2 = h2style;
const LINK = { color: T.accent };

// ── CHART COLOR PALETTE ────────────────────────────────────────────
const C = {
  boomer: "#8B2E2E",     // accent red — the leaving cohort
  genX: "#C4A050",       // gold
  young: "#1F4E79",      // navy — millennials & gen z
  silent: "#8B7355",     // muted
  ink: "#2C1810",
  accent: "#8B5E3C",
  deduction: "#A8493D",
  sliver: "#1F4E79",
};

// ── DOWNLOAD HELPER (canonical geometry — LOCKED) ──────────────────
async function downloadComponentPng(containerRef, filename, title) {
  if (!containerRef.current) return;
  const { default: html2canvas } = await import("html2canvas");
  const canvas = await html2canvas(containerRef.current, {
    scale: 2,
    useCORS: true,
    backgroundColor: T.bg,
  });
  const off = document.createElement("canvas");
  off.width = canvas.width;
  off.height = canvas.height + 80;
  const ctx = off.getContext("2d");
  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, off.width, off.height);
  ctx.drawImage(canvas, 0, 60);
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
  ctx.fillText("napaserve.org", off.width - 24, off.height - 28);
  ctx.restore();
  const a = document.createElement("a");
  a.href = off.toDataURL("image/png");
  a.download = filename;
  a.click();
}

// ── DOWNLOAD BUTTON ────────────────────────────────────────────────
function DownloadButton({ onClick }) {
  return (
    <button
      onClick={onClick}
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
  );
}

// ── CAPTIONS ARRAY (single source of truth; titles mirror h2 + PNG) ─
const CAPTIONS = [
  {
    number: 1,
    title: "The Engine, Rising and Falling",
    description: "The U.S. baby-boomer population from its 1964 peak of 72.5 million (37% of the country) and 1999 high of 79 million to about 67 million today and a projected 59 million by 2030, with the Ag Preserve (1968), Judgment of Paris (1976) and Parker era marked along the rise.",
    sources: [
      { label: "U.S. Census Bureau", url: null },
      { label: "Pew Research Center", url: "https://www.pewresearch.org/short-reads/2020/04/28/millennials-overtake-baby-boomers-as-americas-largest-generation/" },
    ],
  },
  {
    number: 2,
    title: "No One Has All Three",
    description: "Each generation by drinking-age population, wealth and wine participation; only the boomers combine size and money, and no younger cohort occupies that position. Gen Z and millennials are shown separately within the ~$17.1 trillion UBS reports for the two combined; Gen Z’s ~$6 trillion is Cerulli’s financial-wealth figure (2022 Survey of Consumer Finances), used here as a net-worth proxy for a cohort that holds little real estate.",
    sources: [
      { label: "U.S. Census Bureau", url: null },
      { label: "Federal Reserve", url: "https://www.federalreserve.gov/releases/z1/dataviz/dfa/" },
      { label: "UBS Global Wealth Report 2025", url: "https://www.ubs.com/us/en/wealth-management/insights/global-wealth-report.html" },
      { label: "Cerulli Associates", url: "https://www.cerulli.com/press-releases/millennial-and-gen-z-wealth-reaches-new-heights" },
    ],
  },
  {
    number: 3,
    title: "The Inheritance That Isn’t",
    description: "The $124 trillion wealth transfer reduced step by step by spousal transfers, charity, long-term-care erosion, late arrival and concentration to the sliver that reaches younger wine-buyers soon. Spousal transfers and charity are sourced (Cerulli); the erosion, late-arrival and concentration steps are illustrative.",
    sources: [
      { label: "Cerulli Associates", url: "https://www.cerulli.com/press-releases/millennial-and-gen-z-wealth-reaches-new-heights" },
      { label: "CareScout", url: "https://www.carescout.com/cost-of-care" },
      { label: "Fidelity", url: "https://newsroom.fidelity.com/pressreleases/fidelity-investments--releases-2025-retiree-health-care-cost-estimate--a-timely-reminder-for-all-gen/s/3c62e988-12e2-4dc8-afb4-f44b06c6d52e" },
    ],
  },
];

// ── CAPTION COMPONENT ──────────────────────────────────────────────
function Caption({ number, title, description, sources = [] }) {
  if (number !== undefined) {
    const cap = CAPTIONS.find((c) => c.number === number);
    if (!cap) return null;
    title = cap.title;
    description = cap.description;
    sources = cap.sources;
  }
  return (
    <p style={{ fontFamily: font, fontSize: 13, color: T.muted, fontStyle: "italic", lineHeight: 1.55, margin: "14px 0 0", maxWidth: 680 }}>
      <strong style={{ fontWeight: 700, fontStyle: "italic" }}>{title}.</strong>{" "}
      {description}{" "}
      {sources.length > 0 && (
        <>
          Source:{" "}
          {sources.map((s, i) => (
            <span key={i}>
              {s.url
                ? <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>{s.label}</a>
                : <span>{s.label}</span>}
              {i < sources.length - 1 ? "; " : "."}
            </span>
          ))}
        </>
      )}
    </p>
  );
}

// ── LIVE POLL ──────────────────────────────────────────────────────
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
    } catch (e) { /* swallow */ }
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
      {voted !== null && <p style={{ fontFamily: font, fontSize: 12, color: T.muted, margin: "10px 0 0 0" }}>{total} {total === 1 ? "vote" : "votes"} {"·"} Results update in real time</p>}
    </div>
  );
}

// ── POLLS SECTION ──────────────────────────────────────────────────
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
      <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.1em", color: T.gold, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px 0" }}>{"Today’s Polls"}</p>
      <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 20px 0" }}>What do you think?</h2>
      {polls.map(poll => <LivePoll key={poll.id} poll={poll} />)}
      <p style={{ fontFamily: font, fontSize: 12, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>
        Poll results are anonymous and stored on NapaServe. Results shown after you vote.{" "}
        Historical reader polls from {PUBLICATION} on Substack are searchable in the{" "}
        <a href="/dashboard" style={{ color: T.accent }}>Community Pulse dashboard</a>.
      </p>
    </div>
  );
}

// ── CHART ONE — The Engine, Rising and Falling ─────────────────────
const BOOMER_POP = [
  { x: 1964, y: 72.5 },
  { x: 1999, y: 79 },
  { x: 2024, y: 67 },
  { x: 2030, y: 59 },
  { x: 2050, y: 16 },
];

function ChartOne() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        datasets: [{
          label: "U.S. baby-boomer population (millions)",
          data: BOOMER_POP,
          borderColor: C.boomer,
          backgroundColor: "rgba(139,46,46,0.12)",
          borderWidth: 2.4,
          pointRadius: 4,
          pointBackgroundColor: C.boomer,
          tension: 0.15,
          fill: true,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { right: 20, top: 28 } },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          annotation: {
            annotations: {
              agPreserve: {
                type: "line", xMin: 1968, xMax: 1968,
                borderColor: T.muted, borderWidth: 1, borderDash: [4, 4],
              },
              agPreserveLab: {
                type: "label", xValue: 1968, yValue: 30,
                content: ["Ag Preserve", "1968"],
                color: T.muted, font: { size: 10, family: "'Source Sans 3', sans-serif" },
                backgroundColor: "transparent", xAdjust: 26,
              },
              paris: {
                type: "line", xMin: 1976, xMax: 1976,
                borderColor: T.muted, borderWidth: 1, borderDash: [4, 4],
              },
              parisLab: {
                type: "label", xValue: 1976, yValue: 18,
                content: ["Judgment", "of Paris 1976"],
                color: T.muted, font: { size: 10, family: "'Source Sans 3', sans-serif" },
                backgroundColor: "transparent", xAdjust: 32,
              },
              parker: {
                type: "box", xMin: 1982, xMax: 1996,
                backgroundColor: "rgba(196,160,80,0.12)", borderWidth: 0,
              },
              parkerLab: {
                type: "label", xValue: 1989, yValue: 88,
                content: ["Parker / cult-cabernet", "era 1980s–1990s"],
                color: C.genX, font: { size: 10, style: "italic", family: "'Source Sans 3', sans-serif" },
                backgroundColor: "transparent",
              },
              peakLab: {
                type: "label", xValue: 1999, yValue: 85,
                content: "Peak: 79M (1999)",
                color: C.ink, font: { size: 11, family: "'Source Sans 3', sans-serif" },
                backgroundColor: "transparent",
              },
              endLab: {
                type: "label", xValue: 2047, yValue: 24,
                content: "2050: ~16M",
                color: C.boomer, font: { size: 11, family: "'Source Sans 3', sans-serif" },
                backgroundColor: "transparent",
              },
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            min: 1960, max: 2052,
            ticks: { stepSize: 10, color: C.ink, font: { size: 11 }, callback: (v) => Number.isInteger(v) ? String(v) : "" },
            grid: { color: T.rule },
            title: { display: true, text: "Year", color: C.ink, font: { size: 12 } },
          },
          y: {
            min: 0, max: 95,
            ticks: { color: C.ink, font: { size: 11 } },
            grid: { color: T.rule },
            title: { display: true, text: "Boomer population (millions)", color: C.ink, font: { size: 11 } },
          },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: "22px", fontWeight: 700, color: "#2C1810", marginTop: 0, marginBottom: 16 }}>The Engine, Rising and Falling</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "640px" }}>
            <div style={{ position: "relative", height: 380 }}>
              <canvas ref={canvasRef} aria-label="Area chart of the U.S. baby-boomer population from 1964 to a projected 2050" role="img" />
            </div>
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-1_could-gen-z-save-the-wine-industry_nvf.png", "The Engine, Rising and Falling")} />
      <Caption number={1} />
    </div>
  );
}

// ── CHART TWO — No One Has All Three (bubble) ──────────────────────
function ChartTwo() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    // x = drinking-age population (M); y = wealth ($T); r = relative wine participation
    const gens = [
      { label: "Boomers", x: 67, y: 85, r: 30, color: C.boomer, part: "High" },
      { label: "Gen X", x: 66, y: 43, r: 20, color: C.genX, part: "Moderate" },
      { label: "Millennials", x: 74, y: 11, r: 12, color: C.young, part: "Low" },
      { label: "Gen Z", x: 35, y: 6, r: 9, color: C.accent, part: "Low (rising)" },
      { label: "Silent (80+)", x: 10, y: 20, r: 8, color: C.silent, part: "Context only" },
    ];

    const bubbleLabels = {
      id: "ch2_bubble_labels",
      afterDatasetsDraw(chart) {
        const { ctx, scales: { x, y } } = chart;
        ctx.save();
        ctx.textAlign = "center";
        // Anchor from the text bottom so both lines sit fully ABOVE the bubble's
        // top edge (center y − radius − padding); nothing draws over the circle.
        ctx.textBaseline = "bottom";
        const LABEL_PAD = 6;
        gens.forEach((g) => {
          const px = x.getPixelForValue(g.x);
          const py = y.getPixelForValue(g.y);
          const topEdge = py - g.r - LABEL_PAD;
          ctx.font = "10px 'Source Sans 3', sans-serif";
          ctx.fillStyle = T.muted;
          ctx.fillText(`wine: ${g.part}`, px, topEdge);
          ctx.font = "bold 12px 'Source Sans 3', sans-serif";
          ctx.fillStyle = C.ink;
          ctx.fillText(g.label, px, topEdge - 13);
        });
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: "bubble",
      data: {
        datasets: gens.map((g) => ({
          label: g.label,
          data: [{ x: g.x, y: g.y, r: g.r }],
          backgroundColor: g.color + "B3",
          borderColor: g.color,
          borderWidth: 1.5,
        })),
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { right: 24, top: 30, left: 10 } },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        scales: {
          x: {
            min: 0, max: 90,
            ticks: { color: C.ink, font: { size: 11 } },
            grid: { color: T.rule },
            title: { display: true, text: "Drinking-age population (millions)", color: C.ink, font: { size: 12 } },
          },
          y: {
            min: 0, max: 100,
            ticks: { color: C.ink, font: { size: 11 }, callback: (v) => "$" + v + "T" },
            grid: { color: T.rule },
            title: { display: true, text: "Household wealth ($ trillions)", color: C.ink, font: { size: 12 } },
          },
        },
      },
      plugins: [bubbleLabels],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: "22px", fontWeight: 700, color: "#2C1810", marginTop: 0, marginBottom: 16 }}>No One Has All Three</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <p style={{ fontFamily: font, fontSize: 13, fontStyle: "italic", color: T.muted, margin: "0 0 8px 0" }}>
          Bubble size reflects relative wine participation. Boomers sit alone in the upper right; no successor occupies the big-and-rich quadrant.
        </p>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "640px" }}>
            <div style={{ position: "relative", height: 420 }}>
              <canvas ref={canvasRef} aria-label="Bubble chart of generations by drinking-age population, wealth and wine participation" role="img" />
            </div>
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-2_could-gen-z-save-the-wine-industry_nvf.png", "No One Has All Three")} />
      <Caption number={2} />
    </div>
  );
}

// ── CHART THREE — The Inheritance That Isn't (waterfall) ───────────
function ChartThree() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    // Floating-bar waterfall from the $124T headline down to the sliver that
    // reaches younger wine-buyers soon. [base, top] per step.
    // Spousal transfer and charity are sourced (Cerulli); erosion, late-arrival
    // and concentration are directional / illustrative.
    const steps = [
      { label: ["$124T transfer", "by 2048"], range: [0, 124], delta: null, color: C.genX, kind: "total" },
      { label: ["To spouses", "first (~$54T)"], range: [70, 124], delta: -54, color: C.deduction, kind: "drop" },
      { label: ["To charity", "(a portion)"], range: [58, 70], delta: -12, color: C.deduction, kind: "drop" },
      { label: ["LTC + lifetime", "spend"], range: [28, 58], delta: -30, color: C.deduction, kind: "drop" },
      { label: ["Late / top-heavy", "(top ~2% ≈ half)"], range: [6, 28], delta: -22, color: C.deduction, kind: "drop" },
      { label: ["Reaches young", "wine buyers"], range: [0, 6], delta: null, color: C.sliver, kind: "total" },
    ];

    const labelPlugin = {
      id: "ch3_waterfall_labels",
      afterDatasetsDraw(chart) {
        const { ctx, scales: { x, y } } = chart;
        ctx.save();
        ctx.textAlign = "center";
        ctx.font = "bold 12px 'Source Sans 3', sans-serif";
        steps.forEach((s, i) => {
          const px = x.getPixelForValue(i);
          const topPy = y.getPixelForValue(s.range[1]);
          if (s.kind === "total") {
            ctx.fillStyle = C.ink;
            ctx.textBaseline = "bottom";
            ctx.fillText(`$${s.range[1] - s.range[0]}T`, px, topPy - 4);
          } else {
            ctx.fillStyle = C.deduction;
            ctx.textBaseline = "bottom";
            ctx.fillText(`−$${Math.abs(s.delta)}T`, px, topPy - 4);
          }
        });
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: steps.map((s) => s.label),
        datasets: [{
          data: steps.map((s) => s.range),
          backgroundColor: steps.map((s) => s.color),
          borderColor: steps.map((s) => s.color),
          borderWidth: 1,
          borderSkipped: false,
          barPercentage: 0.78,
          categoryPercentage: 0.86,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { top: 24 } },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: {
            ticks: { color: C.ink, font: { size: 11 }, autoSkip: false },
            grid: { display: false },
          },
          y: {
            min: 0, max: 130,
            ticks: { color: C.ink, font: { size: 11 }, callback: (v) => "$" + v + "T" },
            grid: { color: T.rule },
            title: { display: true, text: "Wealth transfer ($ trillions)", color: C.ink, font: { size: 11 } },
          },
        },
      },
      plugins: [labelPlugin],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: "22px", fontWeight: 700, color: "#2C1810", marginTop: 0, marginBottom: 16 }}>The Inheritance That Isn{"’"}t</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <p style={{ fontFamily: font, fontSize: 13, fontStyle: "italic", color: T.muted, margin: "0 0 8px 0" }}>
          Spousal transfers and charity are sourced (Cerulli); the erosion, late-arrival and concentration steps are illustrative.
        </p>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "640px" }}>
            <div style={{ position: "relative", height: 380 }}>
              <canvas ref={canvasRef} aria-label="Waterfall chart reducing the $124 trillion wealth transfer to the sliver reaching younger wine buyers" role="img" />
            </div>
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-3_could-gen-z-save-the-wine-industry_nvf.png", "The Inheritance That Isn’t")} />
      <Caption number={3} />
    </div>
  );
}

// ── SCENARIO TESTER — Can the Next Generation Replace the Boomers? ──
// React + Chart.js. Indexes premium-wine demand to the boomer peak (100)
// and projects to 2040 as the reader moves four sliders.
//
// TODO (before publish): replace this prototype calibration with cell-sourced
// inputs — Census/Pew drinking-age counts and a documented Fed/Cerulli
// wealth-based per-person proxy — so every input traces to a citation.
// Keep the cap that holds younger-cohort per-person factors below boomer levels.
const BASELINE = 165; // prototype calibration; index = total / 165 * 100
const ANCHORS = {
  boomer: [[2026, 67], [2030, 59], [2035, 48], [2040, 38]],
  genX: [[2026, 66], [2040, 61]],
  mill: [[2026, 74], [2040, 72]],
  genZ: [[2026, 40], [2030, 58], [2033, 70], [2040, 71]],
  genAlpha: [[2026, 0], [2034, 0], [2040, 28]],
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function interp(anchors, year) {
  if (year <= anchors[0][0]) return anchors[0][1];
  const last = anchors[anchors.length - 1];
  if (year >= last[0]) return last[1];
  for (let i = 0; i < anchors.length - 1; i++) {
    const [y0, v0] = anchors[i];
    const [y1, v1] = anchors[i + 1];
    if (year >= y0 && year <= y1) return v0 + (v1 - v0) * ((year - y0) / (y1 - y0));
  }
  return last[1];
}

// U, W, E, I are model parameters (raw/100). Returns the demand index (peak = 100).
function computeIndex(year, U, W, E, I) {
  const boomerPop = interp(ANCHORS.boomer, year);
  const genXPop = interp(ANCHORS.genX, year);
  const millPop = interp(ANCHORS.mill, year);
  const genZPop = interp(ANCHORS.genZ, year);
  const genAlphaPop = interp(ANCHORS.genAlpha, year);

  const t = (year - 2026) / (2040 - 2026);
  const bf = 0.85 + (0.60 - 0.85) * t;        // boomer per-person factor, linear
  const gxf = 0.72 + (0.64 - 0.72) * t;        // gen X per-person factor, linear
  const wealthRamp = clamp((year - 2030) / 8, 0, 1);
  const immRamp = clamp((year - 2026) / 12, 0, 1);
  const immMult = 1 + I * 0.12 * immRamp;

  let millF = 0.40 * (1 + (U - 1) * 0.5) + W * 0.12 * wealthRamp;
  let genZF = 0.25 * U + W * 0.05 * wealthRamp;
  let genAlphaF = 0.20 * U;
  // Cap: hold younger-cohort per-person factors below the boomer level.
  millF = Math.min(millF, bf);
  genZF = Math.min(genZF, bf);
  genAlphaF = Math.min(genAlphaF, bf);

  const boomerTerm = boomerPop * bf;
  const genXTerm = genXPop * gxf;
  const millTerm = millPop * millF;
  const genZTerm = genZPop * genZF;
  const genAlphaTerm = genAlphaPop * genAlphaF;

  const total = (boomerTerm + genXTerm + millTerm * immMult + genZTerm * immMult + genAlphaTerm * immMult) * E;
  return (total / BASELINE) * 100;
}

const PRESETS = {
  current: { U: 100, W: 20, E: 92, I: 30 },
  max: { U: 130, W: 100, E: 106, I: 100 },
  recession: { U: 88, W: 10, E: 86, I: 20 },
};
const YEARS = [];
for (let y = 2026; y <= 2040; y++) YEARS.push(y);

function ScenarioTester() {
  const [U, setU] = useState(PRESETS.current.U);
  const [W, setW] = useState(PRESETS.current.W);
  const [E, setE] = useState(PRESETS.current.E);
  const [I, setI] = useState(PRESETS.current.I);
  const [active, setActive] = useState("current");

  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const idxAt = (year, u = U, w = W, e = E, i = I) => computeIndex(year, u / 100, w / 100, e / 100, i / 100);
  const today = idxAt(2026);
  const projected = idxAt(2040);
  const best = idxAt(2040, PRESETS.max.U, PRESETS.max.W, PRESETS.max.E, PRESETS.max.I);

  // One-time self-check of the locked display values (prototype calibration).
  useEffect(() => {
    const checks = [
      ["today", computeIndex(2026, 1.00, 0.20, 0.92, 0.30), 80],
      ["current 2040", computeIndex(2040, 1.00, 0.20, 0.92, 0.30), 66],
      ["max 2040", computeIndex(2040, 1.30, 1.00, 1.06, 1.00), 94],
      ["recession 2040", computeIndex(2040, 0.88, 0.10, 0.86, 0.20), 58],
    ];
    checks.forEach(([name, val, target]) => {
      if (Math.abs(val - target) > 2) {
        // eslint-disable-next-line no-console
        console.error(`[ScenarioTester] calibration off: ${name} = ${val.toFixed(1)} (target ~${target})`);
      }
    });
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const series = YEARS.map((y) => ({ x: y, y: idxAt(y) }));
    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Projected premium-wine demand (index)",
            data: series,
            borderColor: C.accent,
            backgroundColor: "rgba(139,94,60,0.12)",
            borderWidth: 2.6,
            pointRadius: 2.5,
            tension: 0.2,
            fill: true,
          },
          {
            label: "Boomer peak (100)",
            data: YEARS.map((y) => ({ x: y, y: 100 })),
            borderColor: C.boomer,
            borderWidth: 1.6,
            borderDash: [6, 6],
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { right: 16, top: 10 } },
        plugins: {
          legend: {
            display: true, position: "bottom", align: "start",
            labels: { color: C.ink, font: { size: 11, family: "'Source Sans 3', sans-serif" }, boxWidth: 14, padding: 10 },
          },
          tooltip: { enabled: false },
        },
        scales: {
          x: {
            type: "linear",
            min: 2026, max: 2040,
            ticks: { stepSize: 2, color: C.ink, font: { size: 11 }, callback: (v) => Number.isInteger(v) ? String(v) : "" },
            grid: { color: T.rule },
          },
          y: {
            min: 40, max: 110,
            ticks: { color: C.ink, font: { size: 11 }, callback: (v) => v + "%" },
            grid: { color: T.rule },
            title: { display: true, text: "Demand index (boomer peak = 100)", color: C.ink, font: { size: 11 } },
          },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [U, W, E, I]);

  const applyPreset = (key) => {
    const p = PRESETS[key];
    setU(p.U); setW(p.W); setE(p.E); setI(p.I); setActive(key);
  };
  const onSlide = (setter) => (e) => { setter(parseInt(e.target.value, 10)); setActive("custom"); };

  const verdict = projected >= 100
    ? "At these settings, demand returns to the boomer peak — an outcome outside the model’s range."
    : projected >= 85
      ? `Even near the optimistic limit, demand reaches about ${Math.round(projected)}% of the boomer peak by 2040 — still short of it.`
      : projected >= 70
        ? `Demand drifts to roughly ${Math.round(projected)}% of the boomer peak by 2040: a smaller market, not a recovered one.`
        : `Demand falls to about ${Math.round(projected)}% of the boomer peak by 2040 — the line bends toward further contraction.`;

  const card = { background: T.bg, borderRadius: 3, padding: "12px 14px", flex: "1 1 150px", minWidth: 150 };
  const sliders = [
    { key: "U", label: "Younger-cohort wine uptake", val: U, set: setU, min: 70, max: 130, fmt: (v) => `${v} / 100`, hint: "70–130 · default 100" },
    { key: "W", label: "Wealth transfer (timing & size)", val: W, set: setW, min: 0, max: 100, fmt: (v) => `${v} / 100`, hint: "0–100 · default 20" },
    { key: "E", label: "Economy (recession → boom)", val: E, set: setE, min: 84, max: 106, fmt: (v) => `${v} / 100`, hint: "84–106 · default 92" },
    { key: "I", label: "Immigration", val: I, set: setI, min: 0, max: 100, fmt: (v) => `${v} / 100`, hint: "0–100 · default 30" },
  ];
  const presetCards = [
    { key: "current", label: "Current", sub: "100 / 20 / 92 / 30" },
    { key: "max", label: "Maximum optimism", sub: "130 / 100 / 106 / 100" },
    { key: "recession", label: "Recession", sub: "88 / 10 / 86 / 20" },
    { key: "custom", label: "Custom", sub: "Use the sliders" },
  ];

  return (
    <div className="calc-section" style={{ background: T.surface, border: `1px solid ${T.rule}`, borderRadius: 6, padding: 24, margin: "32px 0 48px" }}>
      <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.gold, fontWeight: 700, marginBottom: 6 }}>Interactive Model</p>
      <h3 style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.ink, marginBottom: 8 }}>Can the Next Generation Replace the Boomers?</h3>
      <p style={{ fontFamily: font, fontSize: 14, color: T.muted, lineHeight: 1.55, marginBottom: 18 }}>
        Premium-wine demand indexed to the baby-boomer peak (100), projected to 2040. Move the four
        assumptions and the line updates live. Younger cohorts are capped below boomer levels, so across
        the full range the projection never returns to the peak. <em>Illustrative, not a forecast.</em>
      </p>

      {/* Presets */}
      <div className="scenario-presets-grid" style={{ marginBottom: 18 }}>
        {presetCards.map((p) => {
          const on = active === p.key;
          const clickable = p.key !== "custom";
          return (
            <div
              key={p.key}
              onClick={() => { if (clickable) applyPreset(p.key); }}
              style={{
                background: on ? "#2C1810" : T.bg,
                border: `1px solid ${on ? "#2C1810" : T.border}`,
                borderRadius: 4, padding: "10px 10px", textAlign: "center",
                cursor: clickable ? "pointer" : "default",
              }}
            >
              <div style={{ fontFamily: font, fontSize: 12, fontWeight: 700, color: on ? "#F5F0E8" : T.ink, marginBottom: 3 }}>{p.label}</div>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: on ? T.gold : T.muted }}>{p.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Sliders */}
      <div style={{ marginBottom: 18 }}>
        {sliders.map((s) => (
          <div key={s.key} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <span style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: T.ink }}>{s.label}</span>
              <span style={{ fontFamily: "monospace", fontSize: 12, color: T.accent, fontWeight: 700 }}>{s.fmt(s.val)}</span>
            </div>
            <input type="range" min={s.min} max={s.max} value={s.val} step="1"
              onChange={onSlide(s.set)}
              style={{ width: "100%", accentColor: T.accent, cursor: "pointer" }} />
            <div style={{ fontFamily: font, fontSize: 11, color: T.muted, marginTop: 2 }}>{s.hint}</div>
          </div>
        ))}
      </div>

      {/* Metric cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Today (2026)", val: today },
          { label: "Projected 2040", val: projected },
          { label: "Best case 2040", val: best },
        ].map((m) => (
          <div key={m.label} style={card}>
            <div style={{ fontFamily: font, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontFamily: serif, fontSize: 24, fontWeight: 700, color: T.ink }}>{Math.round(m.val)}%</div>
            <div style={{ fontFamily: font, fontSize: 10, color: T.muted, marginTop: 2 }}>of boomer peak</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 4, padding: "16px 14px" }}>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "560px" }}>
            <div style={{ position: "relative", height: 320 }}>
              <canvas ref={canvasRef} aria-label="Line chart projecting premium-wine demand to 2040 against the boomer peak" role="img" />
            </div>
          </div>
        </div>
      </div>

      {/* Verdict */}
      <p style={{ fontFamily: serif, fontSize: 15, fontStyle: "italic", color: T.ink, lineHeight: 1.55, marginTop: 16 }}>{verdict}</p>

      <p style={{ fontFamily: font, fontSize: 11, color: T.muted, lineHeight: 1.5, borderTop: `1px solid ${T.border}`, paddingTop: 12, marginTop: 14 }}>
        Source: Napa Valley Features model; population data from the U.S. Census Bureau and Pew Research
        Center; wealth and transfer data from the Federal Reserve and Cerulli Associates. Defaults are
        NVF{"’"}s synthesis of published evidence. <em>Illustrative, not a forecast.</em>
      </p>
    </div>
  );
}

// ── IMAGE + CUTLINE ────────────────────────────────────────────────
function Figure({ src, alt, cutline, marginTop = 28 }) {
  return (
    <figure style={{ margin: `${marginTop}px 0 24px` }}>
      <img src={src} alt={alt} style={{ width: "100%", borderRadius: 4, display: "block" }} />
      <figcaption style={{ fontFamily: font, fontStyle: "italic", fontSize: 14, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>
        {cutline}
      </figcaption>
    </figure>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────
export default function UnderTheHoodGenZWine() {
  const navigate = useNavigate();
  const handleBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/under-the-hood"));
  const gate = useDraftGate(ARTICLE_SLUG);
  const isDraft = gate.status === "draft";

  useEffect(() => {
    if (gate.status === "redirect") navigate("/under-the-hood");
  }, [gate.status, navigate]);

  if (gate.status === "loading") {
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

        {/* ── BACK ───────────────────────────────────────────────── */}
        <button onClick={handleBack} style={{ fontFamily: font, fontSize: 14, color: T.muted, background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "none", marginBottom: 12 }}>
          ← Back
        </button>

        {/* ── EYEBROW ───────────────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          {EYEBROW} {"·"} {ARTICLE_PUBLICATION}
        </p>

        {/* ── HEADLINE ──────────────────────────────────────────────── */}
        <h1 style={{ fontFamily: serif, fontSize: 34, fontWeight: 700, color: T.ink, lineHeight: 1.25, marginBottom: 16 }}>
          {ARTICLE_TITLE}
        </h1>

        {/* ── BYLINE + DATE ─────────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.muted, marginBottom: 16 }}>
          By Tim Carl {"·"} {ARTICLE_DATE}
        </p>

        {/* ── DECK ──────────────────────────────────────────────────── */}
        {SHOW_DECK && (
          <p style={{ fontFamily: serif, fontSize: 18, color: T.muted, lineHeight: 1.6, marginBottom: 24, fontStyle: "italic" }}>
            {ARTICLE_DECK}
          </p>
        )}

        {/* ── SUBSTACK LINK ─────────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 13, color: T.muted, marginBottom: 32, borderBottom: `1px solid ${T.border}`, paddingBottom: 20 }}>
          Read on{" "}
          <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>
            {ARTICLE_PUBLICATION} on Substack {"→"}
          </a>
        </p>

        {/* ── ARTICLE SUMMARY ───────────────────────────────────────── */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "16px 20px", marginBottom: 32 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Article Summary</p>
          <p style={{ ...prose, fontSize: 15, marginBottom: 0 }}>
            A day after Dan Berger described the hard reset Napa wine now needs, this column takes up why the usual fixes stopped working. The answer is demand: a market built on the baby boomers, a generation now leaving the stage, with no cohort behind it that has the numbers, the money and the proclivity to replace them {"—"} and a wealth transfer arriving too late and too eroded to bridge the gap. An interactive model lets readers test the assumptions; across the plausible range, the market is more likely to contract further than to recover.
          </p>
        </div>

        {/* ── HERO IMAGE ────────────────────────────────────────────── */}
        <Figure
          src="/photos/uth-gen-z/Can_GenZ_Save_Napa_IV.jpg"
          alt="Fog drifting through dormant vines in the Napa Valley in winter"
          cutline={"Fog drifts through dormant vines in the Napa Valley — Tim Carl Photo"}
          marginTop={0}
        />

        {/* ── LEDE (carries the dateline) ───────────────────────────── */}
        <p style={{ ...P_STYLE, marginBottom: 18 }}>
          <span style={{ fontWeight: 700 }}>{DATELINE_LOCATION} {"—"}</span> In {"“"}Wine Chronicles: A Hard Reset for Napa Wine,{"”"} Dan Berger described a market in which the usual fixes have lost their effect {"—"} buyers scarce, inventories full, sales slow {"—"} and called the moment a hard reset for wineries and drinkers alike. This article is about why those fixes stopped working. The short answer is that the problem was never marketing, pricing or tourism. It is demand, and demand is set by demographics no campaign can move.
        </p>

        {/* ── HOW THE BOOM WAS BUILT ────────────────────────────────── */}
        <h2 style={SECTION_H2}>How the Boom Was Built</h2>
        <p style={P_STYLE}>
          The modern Napa Valley is the product of a one-time alignment, and it is worth being precise about what aligned. On the supply side, the 1968 Agricultural Preserve {"—"} the first ordinance of its kind in the nation {"—"} locked the valley floor into farming and protected the land on which fine wine could be grown. Validation followed: at the 1976 Judgment of Paris, California wines beat the French in a blind tasting and announced the region to the world. Then Robert Parker and the 100-point score turned that reputation into a market. By the 1990s it was the cult-cabernet boom {"—"} Heidi Barrett{"’"}s 1992 Dalla Valle {"“"}Maya{"”"} and the debut Screaming Eagle earned 100 and 99 points from Parker and turned single vineyards into trophies, with prices to match, as this publication recounted in its profile of Barrett, whom Parker dubbed the {"“"}Queen of Cult Cabernet.{"”"} The scores hardened into a brand machine: as Jeff Siegel reported in <em><a href="https://napavalleyfocus.substack.com/p/is-the-napa-valley-too-big-to-fail" target="_blank" rel="noopener noreferrer" style={LINK}>{"“"}2023: Vintage of a lifetime?{"”"}</a></em> (Jan. 2024), seven of the North Coast cabernet vintages between 2012 and 2021 rated 95 points or better, and the region came to be treated as {"“"}too important to fail.{"”"} Buyers learned to chase numbers and scarce bottles, and the Napa Valley learned to sell them.
        </p>
        <p style={P_STYLE}>
          But protected land and high scores are only half the story. They arrived just as the demand side reached its peak. Wine demand from any generation rests on three things stacked together {"—"} enough adults of legal drinking age, enough disposable money and a taste for the product {"—"} and the baby boomers had all three at once. They were enormous: 72.5 million people in 1964, 37% of the entire country, rising to an absolute peak of 79 million in 1999. They moved through their prime earning years with a pronounced preference for premium wine. The boom was the intersection {"—"} protected supply, a powerful brand machine and the largest, wealthiest, most wine-inclined generation in American history, all in the same window.
        </p>
        <p style={P_STYLE}>
          That intersection is the whole story, and it is why the present is so hard. The demand engine is shutting down: the boomer population has already fallen to about 67 million, Pew projects 59 million by 2030 and roughly 16 million by midcentury, and the oldest boomers turn 80 in 2026 {"—"} the age at which wine consumption drops sharply. A cohort that was 37% of the country is now about 20% and falling. The only question that matters is who takes its place.
        </p>

        <ChartOne />

        {/* ── BIG, BROKE OR BOTH ────────────────────────────────────── */}
        <h2 style={SECTION_H2}>Big, Broke or Both</h2>
        <p style={P_STYLE}>
          Take the candidates in order. Generation X earns the most {"—"} the highest household income of any cohort, now in its peak earning years {"—"} but at about 66 million it was never large enough to replace the boomers, and it is aging toward retirement itself. Millennials solve the size problem: at roughly 74 million they are the largest generation in the country. But wealth is another matter {"—"} millennials and Gen Z together hold barely a tenth of all national wealth, about $17 trillion against the boomers{"’"} $85 trillion, and millennials carry an outsized share of the country{"’"}s debt: student loans, the 2008 crash and housing prices that have outrun wages for two decades. Big numbers, thin wallets.
        </p>

        {/* Section illustration I — placed early, off Chart 2 */}
        <Figure
          src="/photos/uth-gen-z/Can_GenZ_Save_Napa_I.jpg"
          alt="A short ladder beside a tall ladder"
          cutline={"The reach is not the same: a short ladder beside a tall one. — Napa Valley Features Graphic"}
        />

        {/* ── THE GEN Z MATH ────────────────────────────────────────── */}
        <h2 style={SECTION_H2}>The Gen Z Math</h2>
        <p style={P_STYLE}>
          Then comes the generation actually being asked to ride to the rescue, and here the claim collides hardest with the numbers. On paper Gen Z is nearly boomer-sized, about 71 million. But two facts gut the comparison. The first is age: Gen Z runs from 14 to 29 in 2026, which means close to half has not reached legal drinking age at all, and the wine-eligible slice is far smaller than the headline figure. The second is money. Of the roughly one-tenth of national wealth held by everyone 45 and under, Gen Z holds the smallest slice {"—"} youngest, least established, much of it still in school or just starting out. It is entering a labor market being reshaped by AI and a hiring slowdown, much of it already carrying debt. Even granting that Gen Z{"’"}s interest in wine is rising {"—"} and the data suggest it is {"—"} interest is the cheap part. A generation half of whom cannot legally buy a bottle, holding a few percent of the nation{"’"}s wealth, cannot consume its way into the place vacated by the richest generation in American history. And the cohort behind it is smaller still.
        </p>

        <ChartTwo />

        {/* ── THE INHERITANCE THAT ISN'T ────────────────────────────── */}
        <h2 style={SECTION_H2}>The Inheritance That Isn{"’"}t</h2>
        <p style={P_STYLE}>
          The fallback hope is the handoff: the boomers will pass their fortune to their children, who will spend it. The figure is real {"—"} Cerulli Associates projects roughly $124 trillion changing hands by 2048. But most of it arrives late. Cerulli projects Gen X {"—"} not the younger cohorts {"—"} will receive the largest share over the next decade, about $14 trillion, against roughly $8 trillion for millennials, whose larger $45.6 trillion inheritance mostly lands later, when those heirs are themselves in their 50s and 60s, past the years households spend most freely. Much of it never arrives at all. A typical 65-year-old is projected to spend about $165,000 on healthcare in retirement before long-term care is counted, and about 70% of those who reach 65 will need that care, now running $9,500 to $10,800 a month. Nearly half of wealthy boomers say they plan to spend their money in their own lifetimes. And some of what passes down is a liability, not a windfall: boomers hold an estimated $18 trillion to $19 trillion in real estate, much of it large homes costly to maintain and falling to heirs who already cannot afford today{"’"}s prices {"—"} a median new home now costs about 5.3 times household income, against 3.6 times when boomers were buying. The inheritance meant to fund the next era of luxury spending is, for most families, smaller, later and messier than the headline suggests.
        </p>

        <ChartThree />

        {/* ── THEN THE ECONOMY GOT A VOTE ───────────────────────────── */}
        <h2 style={SECTION_H2}>Then the Economy Got a Vote</h2>
        <p style={P_STYLE}>
          All of that is the structural case, and it would hold in a calm year. This is not a calm year. A war in the Middle East and the closure of the Strait of Hormuz produced what Goldman Sachs called the largest supply shock in the history of the crude market, pushing Brent crude toward $110 a barrel before recent ceasefire reports eased it back toward the $90s {"—"} still far above a year ago. In late May the Conference Board{"’"}s measure of CEO confidence fell to 47 from 59 in a single quarter, and for the first time in the survey{"’"}s history more chief executives said they planned to cut their workforce than to grow it. Real personal income excluding transfers fell about 1% over the year through April, its sharpest such decline since 2022. Premium wine is a discretionary purchase, the first line trimmed when fuel costs jump and jobs feel less secure {"—"} and it leans most on the younger, lower-wealth buyers least cushioned from a downturn.
        </p>

        {/* ── WHY THE FIXES STOPPED WORKING ─────────────────────────── */}
        <h2 style={SECTION_H2}>Why the Fixes Stopped Working</h2>
        <p style={P_STYLE}>
          This is why the stopgaps Berger describes have lost their grip. More visitors, more marketing, more tasting rooms, lower price points, even the regulatory changes the trade groups are now requesting {"—"} every one of them works on supply or on execution. None of them adds drinking-age population or wealth to generations that lack both. As laid out in <em><a href="https://napavalleyfocus.substack.com/p/under-the-hood-what-premieres-3-million" target="_blank" rel="noopener noreferrer" style={LINK}>{"“"}Under the Hood: What Premiere{"’"}s $3 Million Plateau Signals{"”"}</a></em> (Feb. 26, 2026), structural resets move in three phases {"—"} deceleration and denial, reset and recalibration, then broader repricing {"—"} and <em><a href="https://napavalleyfocus.substack.com/p/under-the-hood-where-is-napa-in-the" target="_blank" rel="noopener noreferrer" style={LINK}>{"“"}Under the Hood: Where Is Napa in the Five Stages of Grief?{"”"}</a></em> (April 23, 2026) mapped the same arc onto denial, anger, bargaining, depression and acceptance. By those measures the valley is well past denial. Premiere Napa Valley, the trade{"’"}s bellwether auction, raised about $3 million in 2026, down from roughly $6 million in 2015. Constellation Brands{"’"} wine and spirits sales fell 14% on an organic basis for the year and, after a run of divestitures, dropped from the third-largest U.S. wine company to the 28th. Treasury Wine Estates wrote off essentially all the goodwill on its U.S. business {"—"} about A$687 million, roughly $450 million. Ted Hall, a former chairman of the Robert Mondavi Corp., estimated that 100 to 170 of 424 small Napa Valley Vintners members are unlikely to be viable under current conditions. Those are repricing and acceptance decisions. The hope that a younger generation will close the gap belongs to an earlier stage.
        </p>

        {/* ── WHAT COMES NEXT ───────────────────────────────────────── */}
        <h2 style={SECTION_H2}>What Comes Next</h2>
        <p style={P_STYLE}>
          How the Napa Valley arrived here is, in the end, arithmetic: a demand engine built on a generation that is leaving, no cohort behind it that combines the numbers, the money and the taste for wine, and a wealth transfer too late and too eroded to bridge the difference. That much is fixed. What is not fixed is what happens from here, and that turns on assumptions reasonable people can argue about {"—"} how fast younger drinkers take up wine, when and how much inherited wealth actually arrives, and whether the economy steadies or slides.
        </p>
        <p style={P_STYLE}>
          The interactive model on NapaServe lets readers set those assumptions and watch the result. The instructive part is the range it produces. Push every lever toward optimism {"—"} higher participation, an earlier and larger inheritance, a calm economy {"—"} and demand still does not climb back to the boomer peak. Set the levers where the current data point, with an oil shock, falling real incomes and the steepest drop in business confidence in years, and the line bends the other way. The realistic envelope runs from roughly flat to lower. Better is the one outcome the math will not produce.
        </p>

        <ScenarioTester />

        <p style={P_STYLE}>
          So could Gen Z save the wine industry? No {"—"} not because young people will not drink wine; they will. But they will certainly change it {"—"} what they drink, how they buy it and what they are willing to pay {"—"} and the Napa Valley, built more than any other region on the premium, trophy-bottle model, is likely to feel that change more sharply than anywhere else. The question is not whether the valley returns to the last decade, but how it plans for a market that, by the numbers, is more likely to contract than recover. Tomorrow, the growers describe that prospect in their own words.
        </p>

        {/* ── CLOSING ILLUSTRATION III ──────────────────────────────── */}
        <Figure
          src="/photos/uth-gen-z/Can_GenZ_Save_Napa_III.jpg"
          alt="A felled stump beside a young sapling"
          cutline={"The old growth gone, the new growth small but real. — Napa Valley Features Graphic"}
        />

        {/* ── BYLINE (after final section, before polls) ─────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.ink, fontStyle: "italic", lineHeight: 1.65, margin: "32px 0 0 0" }}>
          Tim Carl is a Napa Valley-based photojournalist.
        </p>

        {/* ── POLLS SECTION ─────────────────────────────────────────── */}
        <PollsSection slug={ARTICLE_SLUG} />

        {/* ── RELATED COVERAGE (plain linked-title list) ────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 48, paddingTop: 28, marginBottom: 28 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center", marginBottom: 20 }}>
            Related Coverage
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <span style={{ color: T.muted, fontWeight: 700 }}>{"“"}Wine Chronicles: A Hard Reset for Napa Wine{"”"}</span>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Dan Berger, Napa Valley Features <em>(link pending publication, ~June 3)</em></span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-where-is-napa-in-the" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Where Is Napa in the Five Stages of Grief?{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (April 23, 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-what-premieres-3-million" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: What Premiere{"’"}s $3 Million Plateau Signals{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (Feb. 26, 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-countys-wine" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Napa County{"’"}s Wine Market Is Clearing, Not Recovering{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (Jan. 15, 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-why-napas-demographics" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Why Napa{"’"}s Demographics Point to Contraction, Not Growth{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (Sept. 6, 2025)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/collapse-or-correction-demographics" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Collapse or Correction? Demographics and Labor at Play{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (Oct. 24, 2024)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/top-stories-of-2024-7-heidi-barretts" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Heidi Barrett{"’"}s Bold and Creative Life{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (Dec. 20, 2024)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/is-the-napa-valley-too-big-to-fail" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}2023: Vintage of a lifetime?{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Jeff Siegel, Napa Valley Features (Jan. 2024)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/wine-chronicles-a-question-of-terroir" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Wine Chronicles: A Question of Terroir{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Dan Berger, Napa Valley Features (Feb. 11, 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/napa-valley-finds-itself-between" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Napa Valley finds itself between a rock and a hard place{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Tim Carl, Napa Valley Features (Oct. 2023)</span>
            </li>
          </ul>
        </div>

        {/* ── ARCHIVE SEARCH ────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 28, paddingTop: 28, marginBottom: 28 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Archive
          </p>
          <h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 700, color: T.ink, margin: "0 0 8px 0" }}>Search the Archive</h2>
          <p style={{ fontFamily: font, fontSize: 15, color: T.muted, marginBottom: 16 }}>
            Search 1,000+ articles and reports from {ARTICLE_PUBLICATION}.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              placeholder="Search wine demand, boomers, wealth transfer, Premiere, Constellation..."
              style={{ flex: 1, padding: "10px 14px", fontFamily: font, fontSize: 15, color: T.ink, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 3, outline: "none" }}
              onKeyDown={(e) => { if (e.key === "Enter" && e.target.value.trim()) { window.location.href = `/archive?q=${encodeURIComponent(e.target.value.trim())}`; } }}
            />
            <button
              onClick={(e) => { const input = e.currentTarget.previousElementSibling; if (input.value.trim()) { window.location.href = `/archive?q=${encodeURIComponent(input.value.trim())}`; } }}
              style={{ padding: "10px 20px", fontFamily: font, fontSize: 15, fontWeight: 600, color: "#FFFFFF", background: T.accent, border: "none", borderRadius: 3, cursor: "pointer" }}
            >
              Search
            </button>
          </div>
        </div>

        {/* ── METHODOLOGY (the model note) ──────────────────────────── */}
        <div style={{ borderTop: `2px solid ${T.border}`, paddingTop: 28, marginTop: 40 }}>
          <h3 style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: T.ink, margin: "0 0 10px" }}>Methodology {"—"} A note about the model</h3>
          <p style={{ fontFamily: font, fontSize: 14, color: T.muted, lineHeight: 1.7, fontStyle: "italic" }}>
            The interactive model sets baby-boomer-peak wine demand at an index of 100 and projects total premium-wine demand from 2026 to 2040. Each generation{"’"}s contribution equals its drinking-age population times a per-person spending factor (relative to the boomer peak) times an economy multiplier; the contributions are summed and indexed to the peak. Boomer population follows the Census/Pew trajectory (about 67 million now, 59 million by 2030, declining toward 16 million by midcentury) with a per-person factor that falls as the cohort ages. Gen X ({"~"}66 million) and millennials ({"~"}74 million) are stable; Gen Z phases into drinking age through the early 2030s; Gen Alpha begins entering near 2034. Per-person factors are deliberately lower for younger cohorts because they hold a fraction of the wealth {"—"} boomers hold about $85 trillion, while millennials and Gen Z together (everyone 45 and under) hold roughly $17 trillion, with Gen Z the smallest slice {"—"} and they are capped below boomer levels even when the wealth-transfer lever is maxed. The four sliders move demand within a bounded envelope: at current settings demand drifts to roughly 66% of the peak by 2040; under recession assumptions it falls to about 58%; and even with every lever at its optimistic limit it tops out near 94% {"—"} it never returns to 100. Defaults are NVF{"’"}s synthesis of published evidence, not a forecast; readers can substitute their own assumptions and the chart updates live. The prototype calibration will be replaced with cell-sourced inputs {"—"} Census/Pew drinking-age counts and a documented Fed/Cerulli wealth-based per-person proxy {"—"} in a future revision.
          </p>
        </div>

        {/* ── SOURCES (article-level; no per-chart sources) ─────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 40, paddingTop: 24 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: T.ink, marginBottom: 16 }}>Sources</h2>
          <ol style={{ fontFamily: font, fontSize: 14, color: T.ink, lineHeight: 1.75, paddingLeft: 20 }}>
            <li style={{ marginBottom: 10 }}>U.S. Census Bureau and <a href="https://www.pewresearch.org/short-reads/2020/04/28/millennials-overtake-baby-boomers-as-americas-largest-generation/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Pew Research Center</a> (generation sizes; boomer peak and decline; oldest boomers turn 80 in 2026).</li>
            <li style={{ marginBottom: 10 }}><a href="https://www.federalreserve.gov/releases/z1/dataviz/dfa/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Federal Reserve Distributional Financial Accounts</a> and <a href="https://www.ubs.com/us/en/wealth-management/insights/global-wealth-report.html" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>UBS Global Wealth Report 2025</a> (generational wealth shares); <a href="https://www.cerulli.com/press-releases/millennial-and-gen-z-wealth-reaches-new-heights" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Cerulli Associates</a> / 2022 Survey of Consumer Finances (Gen Z {"~"}$6T financial wealth).</li>
            <li style={{ marginBottom: 10 }}><a href="https://www.cerulli.com/press-releases/millennial-and-gen-z-wealth-reaches-new-heights" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Cerulli Associates</a>, 2025 ($124 trillion wealth transfer; near-term Gen X {"~"}$14T and millennial {"~"}$8T over the decade; $45.6T to millennials over 25 years; spousal transfers).</li>
            <li style={{ marginBottom: 10 }}><a href="https://www.carescout.com/cost-of-care" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>CareScout</a> 2025 and <a href="https://newsroom.fidelity.com/pressreleases/fidelity-investments--releases-2025-retiree-health-care-cost-estimate--a-timely-reminder-for-all-gen/s/3c62e988-12e2-4dc8-afb4-f44b06c6d52e" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Fidelity</a> (long-term care and retirement healthcare costs).</li>
            <li style={{ marginBottom: 10 }}><a href="https://www.prnewswire.com/news-releases/ceo-confidence-tumbled-in-q2-2026-302784178.html" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>The Conference Board</a> and The Business Council, Q2 2026 (CEO confidence).</li>
            <li style={{ marginBottom: 10 }}><a href="https://www.bea.gov/news/2026/personal-income-and-outlays-april-2026" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>U.S. Bureau of Economic Analysis</a> (real personal income, April 2026).</li>
            <li style={{ marginBottom: 10 }}>International Energy Agency, Goldman Sachs and Brookings (<a href="/under-the-hood/napa-supply-chain-2026" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>2026 oil shock</a>).</li>
            <li style={{ marginBottom: 10 }}><a href="https://www.robertparker.com/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Robert Parker and The Wine Advocate</a>; <a href="https://napahistory.org/napa-valley-agricultural-preserve-2/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa County Agricultural Preserve records</a>; <a href="https://www.wineenthusiast.com/culture/wine/the-judgment-of-paris-turns-40/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>the 1976 Judgment of Paris</a> (Napa Valley history).</li>
            <li style={{ marginBottom: 10 }}><a href="https://napavalleyfocus.substack.com/p/under-the-hood-what-premieres-3-million" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa Valley Vintners and Wine-Searcher (Premiere Napa Valley totals)</a>; <a href="/under-the-hood/napa-constellation-2026" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Constellation Brands Q4 FY2026 results and Wine Business Monthly</a> (Constellation); <a href="/under-the-hood/napa-constellation-2026" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Treasury Wine Estates 2025 disclosures</a> (Americas writedown); Ted Hall, <a href="https://ted241.substack.com/p/napas-luxury-squeeze" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>{"“"}Napa{"’"}s Luxury Squeeze{"”"}</a> (small-winery viability).</li>
          </ol>
        </div>

      </div>

      <Footer />
    </div>
  );
}

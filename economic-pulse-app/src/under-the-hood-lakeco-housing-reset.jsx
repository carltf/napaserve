// UNDER THE HOOD — Lake County's Housing Reset Is Uneven
// -----------------------------------------------------------------
// Slug: lakeco-housing-reset-2026
// Publication: Lake County Features
// Built from under-the-hood-template.jsx on 2026-04-26.
// -----------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chart, registerables } from "chart.js";
import NavBar from "./NavBar";
import Footer from "./Footer";
import useDraftGate from "./hooks/useDraftGate";
import DraftBanner from "./components/DraftBanner";

Chart.register(...registerables);

const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";

// ── COUNTY + PUBLICATION ───────────────────────────────────────────
const COUNTY_PREFIX = "lakeco";
const PUBLICATION = "Lake County Features";
const SUBSTACK_URL = "https://lakecountyfeatures.substack.com/";
const DATELINE_LOCATION = "LAKE COUNTY, Calif.";

// ── ARTICLE METADATA ───────────────────────────────────────────────
const ARTICLE_SLUG = "lakeco-housing-reset-2026";
const ARTICLE_DATE = "April 26, 2026";
const ARTICLE_MONTH_YEAR = "April 2026";

// ── DECK CONTROL ───────────────────────────────────────────────────
const SHOW_DECK = false;

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

// Lake County palette
const LAKE_BLUE = "#1A4F8A";
const RED = "#B45A3C";

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

// Inline link helper for prose hyperlinks (target=_blank, T.accent, underlined).
const linkStyle = { color: T.accent, textDecoration: "underline" };

// Placeholder URL (Tim fills via str_replace before publish flip).
const AFFORDABILITY_URL = "[AFFORDABILITY_URL_PLACEHOLDER]";

// ── DOWNLOAD HELPER ────────────────────────────────────────────────
// LOCKED chart download handler:
// - No watermarkPlugin in chart registrations
// - No inline sources <p> in chart components
// - Title at x=14 y=10 bold 13px Libre Baskerville #2C1810 globalAlpha 1.0
// - Canvas height +48, image y=32
// - Watermark opacity 0.25
async function downloadComponentPng(containerRef, filename, title) {
  if (!containerRef.current) return;
  const { default: html2canvas } = await import("html2canvas");
  const canvas = await html2canvas(containerRef.current, { scale: 2, useCORS: true, backgroundColor: T.bg });
  const off = document.createElement("canvas");
  off.width = canvas.width;
  off.height = canvas.height + 48;
  const ctx = off.getContext("2d");
  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, off.width, off.height);
  ctx.drawImage(canvas, 0, 32);
  ctx.save();
  ctx.globalAlpha = 1.0;
  ctx.font = "bold 13px 'Libre Baskerville', Georgia, serif";
  ctx.fillStyle = "#2C1810";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(title || "", 14, 10);
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

// ── CHARTCANVAS ────────────────────────────────────────────────────
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
        Historical reader polls from {PUBLICATION} are searchable in the{" "}
        <a href="/dashboard" style={{ color: T.accent }}>Community Pulse dashboard</a>.
      </p>
    </div>
  );
}

// ── CHART 1: SUBMARKET SPREAD (horizontal bar) ─────────────────────
function buildSubmarketSpreadChart(ctx) {
  const data = [
    { name: "Upper Lake",     value: 319003, yoy: -0.8 },
    { name: "Lake County",    value: 305226, yoy: -3.2, isAverage: true },
    { name: "Clearlake Oaks", value: 254579, yoy: -3.8 },
    { name: "Clearlake",      value: 204858, yoy: -5.5 },
  ];
  const fmtDollar = (v) => "$" + v.toLocaleString();
  const fmtPct = (v) => (v > 0 ? "+" : "") + v.toFixed(1) + "%";
  const labels = data.map((d) => d.isAverage ? d.name + " (county avg)" : d.name);
  const bgColors = data.map((d) => d.isAverage ? T.gold : LAKE_BLUE);

  const inBarValuePlugin = {
    id: "inBarValue",
    afterDatasetsDraw(chart) {
      const { ctx: c } = chart;
      const meta = chart.getDatasetMeta(0);
      c.save();
      c.font = "bold 14px 'Source Sans 3', sans-serif";
      c.fillStyle = "#FFFFFF";
      c.textAlign = "right";
      c.textBaseline = "middle";
      meta.data.forEach((bar, i) => {
        c.fillText(fmtDollar(data[i].value), bar.x - 8, bar.y);
      });
      c.restore();
    },
  };

  const yoyGutterPlugin = {
    id: "yoyGutter",
    afterDatasetsDraw(chart) {
      const { ctx: c, chartArea } = chart;
      const meta = chart.getDatasetMeta(0);
      c.save();
      c.font = "bold 16px 'Source Sans 3', sans-serif";
      c.fillStyle = RED;
      c.textAlign = "left";
      c.textBaseline = "middle";
      meta.data.forEach((bar, i) => {
        c.fillText(fmtPct(data[i].yoy), chartArea.right + 8, bar.y);
      });
      c.restore();
    },
  };

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: data.map((d) => d.value),
        backgroundColor: bgColors,
        borderRadius: 3,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: true,
      layout: { padding: { right: 80 } },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: {
          beginAtZero: true,
          min: 0,
          max: 360000,
          ticks: {
            stepSize: 100000,
            callback: (v) => v === 0 ? "$0" : "$" + (v / 1000) + "K",
            color: T.muted,
            font: { family: font, size: 12 },
          },
          grid: { color: T.rule },
        },
        y: {
          ticks: {
            color: T.ink,
            font: { family: font, size: 13 },
          },
          grid: { display: false },
        },
      },
    },
    plugins: [inBarValuePlugin, yoyGutterPlugin],
  });
}

// ── CHART 2: UNEMPLOYMENT TREND (line) ─────────────────────────────
function buildUnemploymentTrendChart(ctx) {
  const series = [
    { date: "2024-01", value: 8.3 }, { date: "2024-02", value: 8.0 },
    { date: "2024-03", value: 7.4 }, { date: "2024-04", value: 6.5 },
    { date: "2024-05", value: 5.8 }, { date: "2024-06", value: 6.6 },
    { date: "2024-07", value: 7.1 }, { date: "2024-08", value: 6.9 },
    { date: "2024-09", value: 6.2 }, { date: "2024-10", value: 6.7 },
    { date: "2024-11", value: 7.2 }, { date: "2024-12", value: 7.6 },
    { date: "2025-01", value: 8.0 }, { date: "2025-02", value: 7.7 },
    { date: "2025-03", value: 7.3 }, { date: "2025-04", value: 6.9 },
    { date: "2025-05", value: 6.3 }, { date: "2025-06", value: 7.3 },
    { date: "2025-07", value: 7.6 }, { date: "2025-08", value: 7.2 },
    { date: "2025-09", value: 7.0 }, { date: "2025-10", value: null },
    { date: "2025-11", value: 7.5 }, { date: "2025-12", value: 7.7 },
    { date: "2026-01", value: 8.2 },
  ];
  const labels = series.map((p) => p.date);
  const values = series.map((p) => p.value);
  const lastIdx = series.length - 1;

  const endpointMarkerPlugin = {
    id: "endpointMarker",
    afterDatasetsDraw(chart) {
      const { ctx: c } = chart;
      const meta = chart.getDatasetMeta(0);
      const last = meta.data[lastIdx];
      if (!last) return;
      c.save();
      c.fillStyle = T.gold;
      c.strokeStyle = T.ink;
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(last.x, last.y, 6, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.font = "bold 14px 'Source Sans 3', sans-serif";
      c.fillStyle = T.ink;
      c.textAlign = "right";
      c.textBaseline = "bottom";
      c.fillText("8.2% (Jan 2026)", last.x - 10, last.y - 8);
      c.restore();
    },
  };

  const refDotsPlugin = {
    id: "refDots",
    afterDatasetsDraw(chart) {
      const { ctx: c, chartArea, scales } = chart;
      const refs = [
        { label: "Calif. 5.4%", value: 5.4 },
        { label: "Napa 4.9%",   value: 4.9 },
        { label: "Sonoma 4.6%", value: 4.6 },
      ];
      c.save();
      refs.forEach((r) => {
        const y = scales.y.getPixelForValue(r.value);
        c.fillStyle = T.muted;
        c.beginPath();
        c.arc(chartArea.right - 6, y, 4, 0, Math.PI * 2);
        c.fill();
        c.font = "12px 'Source Sans 3', sans-serif";
        c.fillStyle = T.muted;
        c.textAlign = "right";
        c.textBaseline = "middle";
        c.fillText(r.label, chartArea.right - 14, y);
      });
      c.restore();
    },
  };

  return new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        data: values,
        borderColor: LAKE_BLUE,
        backgroundColor: LAKE_BLUE,
        borderWidth: 2.5,
        tension: 0.25,
        pointRadius: 3,
        pointHoverRadius: 5,
        spanGaps: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      layout: { padding: { right: 40, top: 12 } },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: {
          ticks: {
            color: T.muted,
            font: { family: font, size: 11 },
            autoSkip: false,
            callback: function(_, idx) {
              return idx % 3 === 0 ? labels[idx] : "";
            },
          },
          grid: { display: false },
        },
        y: {
          min: 4,
          max: 9,
          ticks: {
            stepSize: 1,
            callback: (v) => v + "%",
            color: T.muted,
            font: { family: font, size: 12 },
          },
          grid: { color: T.rule },
        },
      },
    },
    plugins: [endpointMarkerPlugin, refDotsPlugin],
  });
}

// ── CHART 3: NORTH BAY COMPARISON (horizontal bar) ─────────────────
function buildNorthBayComparisonChart(ctx) {
  const data = [
    { name: "Lake",       value: 8.2, isHighlight: true },
    { name: "Mendocino",  value: 6.5 },
    { name: "Solano",     value: 5.5 },
    { name: "California", value: 5.4, isReference: true },
    { name: "Napa",       value: 4.9 },
    { name: "Sonoma",     value: 4.6 },
    { name: "Marin",      value: 4.2 },
  ];
  const labels = data.map((d) => {
    if (d.isHighlight) return d.name + " (highest in region)";
    if (d.isReference) return d.name + " (state)";
    return d.name;
  });
  const bgColors = data.map((d) => {
    if (d.isHighlight) return T.gold;
    if (d.isReference) return T.muted;
    return LAKE_BLUE;
  });
  const borderColors = data.map((d) => d.isHighlight ? T.ink : "transparent");
  const borderWidths = data.map((d) => d.isHighlight ? 2 : 0);

  const inBarPctPlugin = {
    id: "inBarPct",
    afterDatasetsDraw(chart) {
      const { ctx: c } = chart;
      const meta = chart.getDatasetMeta(0);
      c.save();
      c.font = "bold 14px 'Source Sans 3', sans-serif";
      c.fillStyle = "#FFFFFF";
      c.textAlign = "right";
      c.textBaseline = "middle";
      meta.data.forEach((bar, i) => {
        c.fillText(data[i].value.toFixed(1) + "%", bar.x - 8, bar.y);
      });
      c.restore();
    },
  };

  const stateDashedEdgePlugin = {
    id: "stateDashedEdge",
    afterDatasetsDraw(chart) {
      const { ctx: c } = chart;
      const meta = chart.getDatasetMeta(0);
      data.forEach((d, i) => {
        if (!d.isReference) return;
        const bar = meta.data[i];
        if (!bar) return;
        const { x: rightX, y: midY, base: leftX, height: h } = bar;
        c.save();
        c.setLineDash([4, 3]);
        c.strokeStyle = T.ink;
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(rightX, midY - h / 2);
        c.lineTo(rightX, midY + h / 2);
        c.stroke();
        c.restore();
      });
    },
  };

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: data.map((d) => d.value),
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: borderWidths,
        borderRadius: 3,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: {
          beginAtZero: true,
          min: 0,
          max: 9,
          ticks: {
            stepSize: 1,
            callback: (v) => v + "%",
            color: T.muted,
            font: { family: font, size: 12 },
          },
          grid: { color: T.rule },
        },
        y: {
          ticks: {
            color: T.ink,
            font: { family: font, size: 13 },
          },
          grid: { display: false },
        },
      },
    },
    plugins: [inBarPctPlugin, stateDashedEdgePlugin],
  });
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────
export default function UnderTheHoodLakecoHousingReset() {
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
          Lake County{"’"}s Housing Reset Is Uneven {"—"} and the Labor Market Is Moving First
        </h1>

        {/* ── BYLINE + DATE ──────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.muted, marginBottom: 16 }}>
          By Tim Carl · {ARTICLE_DATE}
        </p>

        {/* ── SUBSTACK LINK ──────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 13, color: T.muted, marginBottom: 32, borderBottom: `1px solid ${T.border}`, paddingBottom: 20 }}>
          Read on{" "}
          <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>
            {PUBLICATION} · Substack →
          </a>
        </p>

        {/* ── ARTICLE SUMMARY ────────────────────────────────────── */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "16px 20px", marginBottom: 32 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Article Summary</p>
          <p style={{ ...prose, fontSize: 15, marginBottom: 0 }}>
            Lake County home values are down 3.2% year over year as of March, but the variation inside the county is wider than the headline suggests. The countywide average of $305,226 masks a spread of more than $114,000 between communities and declines that range from 0.8% in Upper Lake to 5.5% in Clearlake. Unemployment has moved more abruptly, reaching 8.2% in January 2026 {"—"} the highest of any North Bay county and nearly twice the state average. The data point to a sequencing issue: employment conditions are weakening faster than housing prices are adjusting, and the steepest declines are concentrated in the county{"’"}s lower-priced submarkets, an inversion of the usual pattern that raises questions the data do not yet answer.
          </p>
        </div>

        {/* ── SECTION 1 ──────────────────────────────────────────── */}
        <h2 style={h2style}>A County Average That Hides Local Divergence</h2>
        <p style={{ ...prose, marginBottom: 18 }}>
          <span style={{ fontWeight: 700 }}>{DATELINE_LOCATION} {"—"}</span>{" "}The Zillow Home Value Index for March puts Lake County{"’"}s countywide average home value at $305,226, down 3.2% from a year earlier. That figure smooths over a wide spread among the county{"’"}s submarkets, with directional consistency masking meaningful differences in magnitude.
        </p>
        <p style={prose}>
          Zillow{"’"}s March data show three distinct tiers. Upper Lake stands at $319,003, down 0.8%. The countywide figure of $305,226 is down 3.2%. Clearlake Oaks is at $254,579, down 3.8%. Clearlake, the lowest-priced of the major submarkets, is at $204,858, down 5.5%.
        </p>
        <p style={prose}>
          The directional consistency matters {"—"} all major submarkets are declining {"—"} but the magnitude differs. Lower-priced markets are falling faster, while higher-priced areas are closer to flat. That pattern is the opposite of what conventional cycle theory predicts, where high-end discretionary buyers typically pull back first while entry-level inventory holds up. In Lake County, the inverse is happening.
        </p>
        <p style={prose}>
          This aligns with{" "}
          <a href="https://lakecountyfeatures.substack.com/p/under-the-hood-reading-lake-countys" target="_blank" rel="noopener noreferrer" style={linkStyle}>earlier reporting</a>
          {" "}that Lake County{"’"}s housing signal entering 2026 was softer but not collapsing, with homes taking roughly 65 to 85 days to go pending. It also extends the question raised in{" "}
          <a href={AFFORDABILITY_URL} target="_blank" rel="noopener noreferrer" style={linkStyle}>this series{"’"} March 9 piece on the county{"’"}s affordability edge</a>
          : whether the math between local incomes and housing costs continues to compress from both sides, and whether that compression is now happening unevenly by submarket.
        </p>

        {/* ── CHART 1: SUBMARKET SPREAD ──────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ ...h2style, marginTop: 24, marginBottom: 16 }}>Lake County Submarket Home Values, March 2026</h2>
          <ChartCanvas
            id="chart-1-submarket-spread"
            title="Lake County Submarket Home Values, March 2026"
            downloadName="lake-county-submarket-spread-2026.png"
            deps={[]}
            buildChart={buildSubmarketSpreadChart}
          />
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, fontStyle: "italic", lineHeight: 1.55, margin: "14px 0 0", maxWidth: 680 }}>
            <strong style={{ fontWeight: 700, fontStyle: "italic" }}>Lake County Submarket Home Values, March 2026.</strong>{" "}
            All major Lake County submarkets are declining year over year, but the magnitude differs sharply {"—"} from {"−"}0.8% in Upper Lake to {"−"}5.5% in Clearlake.{" "}
            <strong style={{ fontWeight: 700, fontStyle: "italic" }}>Illustrative only {"—"} not a forecast.</strong>{" "}
            Source:{" "}
            <a href="https://www.zillow.com/home-values/217/lake-county-ca/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Zillow Home Value Index (March 31, 2026)</a>.
          </p>
        </div>

        {/* ── SECTION 2 ──────────────────────────────────────────── */}
        <h2 style={h2style}>Inventory Is Not Tight Enough to Support Prices</h2>
        <p style={prose}>
          Countywide inventory stood at 429 listings as of March 31, with 69 new listings that month. Two additional indicators reinforce a buyer-leaning market, both as of February {"—"} the most recent month reported by Zillow: the median sale-to-list ratio is 0.981, and 57.2% of sales closed below list price. That combination {"—"} below-list transactions and extended time to pending {"—"} indicates sellers are adjusting expectations.
        </p>
        <p style={prose}>
          This is not a distressed market in the conventional sense. It is a negotiated market, where price discovery is happening transaction by transaction rather than through rapid repricing.
        </p>

        {/* ── SECTION 3 ──────────────────────────────────────────── */}
        <h2 style={h2style}>The Labor Market Has Moved Ahead of Housing</h2>
        <p style={prose}>
          The more consequential shift is not in housing {"—"} it is in employment. Unemployment in December 2025 stood at 7.7%. In January 2026, it rose to 8.2%, according to FRED series CALAKE3URN, last updated April 16. The figure was confirmed in the California Employment Development Department{"’"}s April 3 release, which reported January 2026 county-level unemployment data on a delayed schedule following last year{"’"}s federal shutdown.
        </p>

        {/* ── CHART 2: UNEMPLOYMENT TREND ────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ ...h2style, marginTop: 24, marginBottom: 16 }}>Lake County Unemployment, January 2024 {"–"} January 2026</h2>
          <ChartCanvas
            id="chart-2-unemployment-trend"
            title="Lake County Unemployment, January 2024 – January 2026"
            downloadName="lake-county-unemployment-trend-2024-2026.png"
            deps={[]}
            buildChart={buildUnemploymentTrendChart}
          />
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, fontStyle: "italic", lineHeight: 1.55, margin: "14px 0 0", maxWidth: 680 }}>
            <strong style={{ fontWeight: 700, fontStyle: "italic" }}>Lake County Unemployment, January 2024 {"–"} January 2026.</strong>{" "}
            The county{"’"}s unemployment rate fell from 8.3% in January 2024 to a three-year low of 7.0% in September 2025 before reversing to 8.2% by January 2026 {"—"} the highest level in more than two years. Reference points show January 2026 figures for neighboring counties and California. October 2025 data not reported.{" "}
            <strong style={{ fontWeight: 700, fontStyle: "italic" }}>Illustrative only {"—"} not a forecast.</strong>{" "}
            Sources:{" "}
            <a href="https://fred.stlouisfed.org/series/CALAKE3URN" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>U.S. Bureau of Labor Statistics / FRED series CALAKE3URN (updated April 16, 2026)</a>;{" "}
            <a href="https://labormarketinfo.edd.ca.gov/data/unemployment-and-labor-force.html" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>California EDD January 2026 release (April 3, 2026)</a>.
          </p>
        </div>

        <p style={prose}>
          That move reverses the late-summer improvement documented in{" "}
          <a href="https://lakecountyfeatures.substack.com/p/under-the-hood-reading-lake-countys" target="_blank" rel="noopener noreferrer" style={linkStyle}>prior reporting</a>
          {" "}and pushes the county further above neighboring labor markets. In January 2026, EDD reported Marin County at 4.2%, Sonoma at 4.6%, Napa at 4.9%, Solano at 5.5% and Mendocino at 6.5%. California{"’"}s statewide rate was 5.4%. Lake County{"’"}s 8.2% was the highest in the North Bay region and nearly twice the state figure.
        </p>

        {/* ── CHART 3: NORTH BAY COMPARISON ──────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ ...h2style, marginTop: 24, marginBottom: 16 }}>North Bay County Unemployment, January 2026</h2>
          <ChartCanvas
            id="chart-3-north-bay-comparison"
            title="North Bay County Unemployment, January 2026"
            downloadName="north-bay-unemployment-comparison-jan-2026.png"
            deps={[]}
            buildChart={buildNorthBayComparisonChart}
          />
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, fontStyle: "italic", lineHeight: 1.55, margin: "14px 0 0", maxWidth: 680 }}>
            <strong style={{ fontWeight: 700, fontStyle: "italic" }}>North Bay County Unemployment, January 2026.</strong>{" "}
            Lake County{"’"}s January 2026 unemployment rate of 8.2% is the highest in the North Bay region {"—"} nearly twice the California state rate of 5.4% and almost double Napa{"’"}s 4.9%.{" "}
            <strong style={{ fontWeight: 700, fontStyle: "italic" }}>Illustrative only {"—"} not a forecast.</strong>{" "}
            Source:{" "}
            <a href="https://labormarketinfo.edd.ca.gov/data/unemployment-and-labor-force.html" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>California Employment Development Department, January 2026 county-level release (April 3, 2026)</a>.
          </p>
        </div>

        <p style={prose}>
          The sequencing matters. Employment weakened first, late in 2025 and into early 2026. Housing is now adjusting, but gradually.
        </p>

        {/* ── SECTION 4 ──────────────────────────────────────────── */}
        <h2 style={h2style}>Price Declines Are Concentrated Where Risk Is Already High</h2>
        <p style={prose}>
          The geographic pattern in Zillow{"’"}s data overlaps with other stress indicators previously documented in this series.{" "}
          <a href="https://lakecountyfeatures.substack.com/p/under-the-hood-three-weeks-that-measured" target="_blank" rel="noopener noreferrer" style={linkStyle}>Recent reporting</a>
          {" "}noted that Lake County{"’"}s fiscal stress surfaced through three concurrent events in March: a 316-parcel tax-defaulted land sale, a $2.1 million clawback of overpayments to local agencies and the closure of the county{"’"}s Wellness Centers. Clearlake, which now shows the steepest home value decline at 5.5%, was identified in the March 3 Board of Supervisors discussion as carrying a disproportionate share of the county{"’"}s tax-delinquent inventory.
        </p>
        <p style={prose}>
          That linkage reinforces a key point: this is not just a housing cycle. It is a local income and balance sheet question expressing itself through housing.
        </p>

        {/* ── SECTION 5 ──────────────────────────────────────────── */}
        <h2 style={h2style}>What the Data Don{"’"}t Yet Explain</h2>
        <p style={prose}>
          The pattern visible in Zillow{"’"}s March data raises a question the available indicators cannot fully answer: why are Lake County{"’"}s lower-priced submarkets falling faster than its higher-priced ones? In a typical downturn, the opposite tends to hold {"—"} high-end discretionary buyers retreat first, while entry-level inventory finds a floor of priced-out demand. Lake County is showing the inverse.
        </p>
        <p style={prose}>
          Several explanations are plausible, and the available data do not cleanly distinguish among them. Investor exit rather than owner-occupant exit: Clearlake has historically carried significant non-owner-occupied inventory {"—"} small landlords, second-home owners and investor-held parcels. When carrying costs rise and rental yields compress, investors exit before owner-occupants do. The concentration of tax-defaulted parcels in Clearlake is consistent with this pattern. Insurance and risk-cost shock falling unevenly: California fire insurance has restructured significantly in the last 24 months, and insurance now represents a much larger share of monthly carrying cost on a $200,000 home than on a $400,000 home. When premiums rise sharply, the math breaks at the bottom of the market first. Buyer-pool composition: lower-priced inventory depends heavily on FHA and USDA financing, cash investors and first-time buyers {"—"} all of which are interest-rate sensitive in different ways. Higher-priced inventory tends to attract retirees and second-home buyers using equity from elsewhere, who are less rate-sensitive. Local income concentration: the 8.2% county unemployment figure almost certainly conceals higher rates in Clearlake specifically, and local income shock hits local home prices, particularly in submarkets where buyers and sellers tend to come from the same labor pool.
        </p>
        <p style={prose}>
          Distinguishing among these would require data this piece does not have: HMDA buyer-composition figures, owner-occupancy rates by ZIP from the Census ACS, sub-county unemployment readings and city-level insurance cost data. Those are obtainable in coming weeks. For now, the pattern itself is the finding.
        </p>

        {/* ── SECTION 6 ──────────────────────────────────────────── */}
        <h2 style={h2style}>Housing Is Softer {"—"} but Not Leading the Cycle</h2>
        <p style={prose}>
          Recent reporting in this series frames the baseline. Home values were already down roughly 3.7% to 3.9% entering early 2026. Lake County{"’"}s{" "}
          <a href="https://lakecountyfeatures.substack.com/p/under-the-hood-lake-county-grape" target="_blank" rel="noopener noreferrer" style={linkStyle}>district-wide weighted average grape price fell 38% between 2023 and 2025</a>
          , according to the preliminary 2025 grape crush report. Fiscal stress surfaced in March through the tax-defaulted land sale, the $2.1 million clawback and the Wellness Center closures.
        </p>
        <p style={prose}>
          The Zillow data does not contradict that narrative. It refines it. Housing is adjusting, but not collapsing. Declines are uneven and concentrated. Labor conditions are deteriorating faster than prices.
        </p>

        {/* ── SECTION 7 ──────────────────────────────────────────── */}
        <h2 style={h2style}>What to Watch Next</h2>
        <p style={prose}>
          Three signals will help determine whether this becomes a deeper correction or stabilizes. The first is the unemployment trajectory {"—"} whether 8.2% is a peak or a midpoint. The next county-level release from EDD is expected in May, when February 2026 figures are scheduled to be published. The second is days to pending, currently around 85 days countywide; any extension signals weakening demand. The third is submarket divergence {"—"} whether Clearlake and Clearlake Oaks continue to fall faster than the county average, and whether the explanations outlined above can be tested against incoming HMDA, ACS and EDD data.
        </p>
        <p style={prose}>
          The data do not show a housing collapse. They show a lag. Lake County{"’"}s housing market is adjusting downward across all major communities, with sharper declines in lower-cost areas. At the same time, unemployment has already moved higher, reaching 8.2% in January {"—"} the highest rate among North Bay counties. The sequence {"—"} labor softening first, housing following unevenly {"—"} suggests the market is still in the early phase of repricing rather than the end of it.
        </p>
        <p style={prose}>
          Whether the next round of EDD labor data confirms 8.2% as a turning point or a midpoint is the question that will shape how the rest of the year reads.
        </p>

        {/* ── BYLINE (italic, AFTER final section, BEFORE Related Coverage) ── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.ink, fontStyle: "italic", lineHeight: 1.65, margin: "28px 0 0 0" }}>
          Tim Carl is a Napa Valley-based photojournalist and the founder and editor of Napa Valley, Sonoma County and Lake County Features.
        </p>

        {/* ── RELATED COVERAGE (canonical ul list, 3 items) ──────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 48, paddingTop: 28, marginBottom: 28 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center", marginBottom: 20 }}>
            Related Coverage
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://lakecountyfeatures.substack.com/p/under-the-hood-three-weeks-that-measured" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>"Under the Hood: Three Weeks That Measured Lake County{"’"}s Fiscal Stress"</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Lake County Features, April 13, 2026</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://lakecountyfeatures.substack.com/p/under-the-hood-lake-county-grape" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>"Under the Hood: Lake County Grape Prices Have Fallen 38% in Two Years {"—"} and Chardonnay Has Nearly Vanished"</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Lake County Features, March 30, 2026</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://lakecountyfeatures.substack.com/p/under-the-hood-reading-lake-countys" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>"Under the Hood: Reading Lake County{"’"}s Early 2026 Signals"</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Lake County Features, February 16, 2026</span>
            </li>
          </ul>
        </div>

        {/* ── ARCHIVE SEARCH ─────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 28, paddingTop: 28, marginBottom: 28 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Archive
          </p>
          <h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 700, color: T.ink, margin: "0 0 8px 0" }}>Search the Archive</h2>
          <p style={{ fontFamily: font, fontSize: 15, color: T.muted, marginBottom: 16 }}>
            Search 1,000+ articles and reports from Napa Valley, Sonoma County and Lake County Features.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              placeholder="housing prices, Lake County, unemployment, Clearlake..."
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

        {/* ── POLLS SECTION ──────────────────────────────────────── */}
        <PollsSection slug={ARTICLE_SLUG} />

        {/* ── SOURCES (10 hand-written linked entries) ───────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 48, paddingTop: 24 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: T.ink, marginBottom: 16 }}>Sources</h2>
          <ol style={{ fontFamily: font, fontSize: 14, color: T.ink, lineHeight: 1.75, paddingLeft: 20 }}>
            <li style={{ marginBottom: 10 }}>
              <a href="https://www.zillow.com/home-values/217/lake-county-ca/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Zillow Home Value Index, March 31, 2026 {"—"} Lake County</a>.
            </li>
            <li style={{ marginBottom: 10 }}>
              <a href="https://www.zillow.com/home-values/48103/upper-lake-ca/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Zillow Home Value Index, March 31, 2026 {"—"} Upper Lake</a>.
            </li>
            <li style={{ marginBottom: 10 }}>
              <a href="https://www.zillow.com/home-values/55547/clearlake-oaks-ca/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Zillow Home Value Index, March 31, 2026 {"—"} Clearlake Oaks</a>.
            </li>
            <li style={{ marginBottom: 10 }}>
              <a href="https://www.zillow.com/home-values/10850/clearlake-ca/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Zillow Home Value Index, March 31, 2026 {"—"} Clearlake</a>.
            </li>
            <li style={{ marginBottom: 10 }}>
              <a href="https://fred.stlouisfed.org/series/CALAKE3URN" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>U.S. Bureau of Labor Statistics / FRED series CALAKE3URN, updated April 16, 2026</a>.
            </li>
            <li style={{ marginBottom: 10 }}>
              <a href="https://labormarketinfo.edd.ca.gov/data/unemployment-and-labor-force.html" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>California Employment Development Department, January 2026 county-level release, April 3, 2026</a>.
            </li>
            <li style={{ marginBottom: 10 }}>
              Lake County Features, "<a href="https://lakecountyfeatures.substack.com/p/under-the-hood-three-weeks-that-measured" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Three Weeks That Measured Lake County{"’"}s Fiscal Stress</a>," April 13, 2026.
            </li>
            <li style={{ marginBottom: 10 }}>
              Lake County Features, "<a href="https://lakecountyfeatures.substack.com/p/under-the-hood-lake-county-grape" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Lake County Grape Prices Have Fallen 38% in Two Years</a>," March 30, 2026.
            </li>
            <li style={{ marginBottom: 10 }}>
              Lake County Features, "<a href={AFFORDABILITY_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Lake County{"’"}s Affordability Edge and the Guenoc Question</a>," March 9, 2026.
            </li>
            <li style={{ marginBottom: 10 }}>
              Lake County Features, "<a href="https://lakecountyfeatures.substack.com/p/under-the-hood-reading-lake-countys" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Reading Lake County{"’"}s Early 2026 Signals</a>," February 16, 2026.
            </li>
          </ol>
        </div>

        {/* ── METHODOLOGY ────────────────────────────────────────── */}
        <div style={{ borderTop: `2px solid ${T.border}`, paddingTop: 28, marginTop: 40 }}>
          <h3 style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: T.ink, margin: "0 0 10px" }}>Methodology</h3>
          <p style={{ fontFamily: font, fontSize: 14, color: T.muted, lineHeight: 1.7 }}>
            This article draws on three data sources. Home value figures are from the Zillow Home Value Index, March 31, 2026 {"—"} a smoothed monthly index of typical home values across all homes in each geography. Inventory and sale-to-list figures are from Zillow{"’"}s most recent monthly report (February 2026 readings for the under-list and ratio figures). County unemployment data is from FRED series CALAKE3URN, last updated April 16, 2026, with January 2026 county-level figures cross-confirmed by the California Employment Development Department{"’"}s April 3, 2026 release. Comparison county and state figures are from the same EDD release. Per agency notice, county-level monthly releases were on a delayed schedule following last year{"’"}s federal shutdown; normal cadence is expected to resume by May 2026. Submarket-level analysis relies on Zillow{"’"}s community-tier ZHVI readings, which the publisher classifies as estimates and which may differ from observed transaction prices in any individual sale.
          </p>
        </div>

      </div>

      <Footer />
    </div>
  );
}

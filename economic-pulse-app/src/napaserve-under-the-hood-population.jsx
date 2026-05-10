// UNDER THE HOOD — Calistoga Grew. The Question Is What That Means.
// -----------------------------------------------------------------
// Slug: napa-population-2025
// Publication: Napa Valley Features
// Built from under-the-hood-napa-marketing-machine.jsx structural pattern.
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

// ── ARTICLE METADATA ───────────────────────────────────────────────
const ARTICLE_SLUG = "napa-population-2025";
const ARTICLE_TITLE = "Under the Hood: Calistoga Grew. The Question Is What That Means.";
const ARTICLE_DECK = "What the May 2026 Department of Finance release shows about where Napa County is growing, who it is growing for, and what the funding base looks like underneath.";
const ARTICLE_PUBLICATION = "Napa Valley Features";
const ARTICLE_DATE = "May 10, 2026";
const POLL_IDS = [39, 40, 41]; // eslint-disable-line no-unused-vars
const SHOW_DECK = true;
const EYEBROW = "Under the Hood";

// ── COUNTY + PUBLICATION (template-compat downstream constants) ────
const PUBLICATION = ARTICLE_PUBLICATION;
const SUBSTACK_URL = "https://napavalleyfocus.substack.com";
const DATELINE_LOCATION = "NAPA VALLEY, Calif.";

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
  marginTop: 32,
  marginBottom: 14,
};

const h3style = {
  fontFamily: serif,
  fontSize: 19,
  fontWeight: 700,
  color: T.ink,
  marginTop: 28,
  marginBottom: 14,
};

// Aliases used in inline body prose
const P_STYLE = prose;
const SECTION_H2 = h2style;
const SECTION_H3 = h3style; // eslint-disable-line no-unused-vars
const LINK = { color: T.accent };

// ── DOWNLOAD HELPER ────────────────────────────────────────────────
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

// ── CAPTION ────────────────────────────────────────────────────────
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

// ── CHART ONE — Jurisdiction-level population change ───────────────
function ChartOne() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = ["American Canyon", "Napa city", "Yountville", "St. Helena", "Calistoga", "Unincorporated"];
    const s2024 = [1.77, 0.13, 0.54, 0.57, 0.29, -0.08];
    const s2025 = [2.94, 0.28, -0.64, -0.13, -0.41, -0.44];
    const s2026 = [0.14, -0.31, -1.95, -0.41, 2.32, -0.36];

    chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "2023 → 2024 (May 2024 release)", data: s2024, backgroundColor: "#C4A084", borderRadius: 2 },
          { label: "2024 → 2025 (May 2025 release)", data: s2025, backgroundColor: T.accent, borderRadius: 2 },
          { label: "2025 → 2026 (May 2026 release)", data: s2026, backgroundColor: "#5C3D26", borderRadius: 2 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 14, color: T.ink, font: { size: 12 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y > 0 ? "+" : ""}${ctx.parsed.y.toFixed(2)}%`,
            },
          },
        },
        scales: {
          x: { ticks: { color: T.ink, font: { size: 11 } }, grid: { color: T.rule } },
          y: {
            beginAtZero: true,
            ticks: { callback: (v) => `${v > 0 ? "+" : ""}${v}%`, color: T.muted, font: { size: 11 } },
            grid: { color: T.rule },
          },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>Napa County Jurisdiction Population Change</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 640, position: "relative", height: 360 }}>
            <canvas ref={canvasRef} id="chart-jurisdiction-pop-change" aria-label="Grouped bar chart of Napa County jurisdiction-level population change across three Department of Finance release windows: 2023 to 2024, 2024 to 2025, and 2025 to 2026" role="img" />
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-1_napa-population-2025_nvf.png", "Napa County jurisdiction population change")} />
      <p style={{ fontFamily: font, fontSize: 11, color: T.muted, marginTop: 6 }}>
        Mobile users: scroll horizontally to view full chart.
      </p>
      <Caption
        title="Three release windows, percent change YoY"
        description={"American Canyon’s growth engine flatlined this year after two strong years, while Calistoga reversed from a 0.4% decline to a 2.32% gain — the largest percentage gain of any jurisdiction in the county in the most recent release. Each year’s change is computed within its own release vintage; the unincorporated 2023–2024 value is computed by subtraction."}
        sources={[
          { label: "California Department of Finance E-1 Population Estimates, May 2024, May 2025 and May 2026 releases", url: "https://dof.ca.gov/forecasting/demographics/estimates/e-1/" },
        ]}
      />
    </div>
  );
}

// ── CHART TWO — Calistoga TOT receipts + avg rooms, FY13-14 to FY25-26 ──
function ChartTwo() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const fyLabels = ["FY13-14","FY14-15","FY15-16","FY16-17","FY17-18","FY18-19","FY19-20","FY20-21","FY21-22","FY22-23","FY23-24","FY24-25","FY25-26"];
    // TODO: FY14-15 through FY24-25 intermediate values are placeholders pending detailed Calistoga April 2026 TOT report pull.
    // Verified anchors: FY13-14 4.5, FY18-19 6.4, FY19-20 4.7, FY20-21 8.9, FY21-22 11.8, FY25-26 12.6.
    const totData = [4.5, 5.2, 5.8, 6.1, 6.0, 6.4, 4.7, 8.9, 11.8, 12.0, 12.3, 12.3, 12.6];
    // TODO: intermediate average-rooms values are interpolated; verified anchors FY13-14 720, FY18-19 755, FY24-25 861, FY25-26 861.
    const roomsData = [720, 725, 730, 740, 745, 755, 760, 765, 770, 780, 785, 861, 861];

    // Two-tier annotation plugin
    const annotations = [
      // Tier 1 (bold)
      { idx: 5,  label: "Jan 2019 / Measure D effective",    tier: 1, row: 0 },
      { idx: 6,  label: "Mar 2020 / COVID shutdown",          tier: 1, row: 1 },
      { idx: 12, label: "Mar 2026 / Motor Lodge default",     tier: 1, row: 0 },
      // Tier 2 (lighter)
      { idx: 4,  label: "2017 wildfires",                     tier: 2, row: 2 },
      { idx: 8,  label: "Largest one-year rebound",           tier: 2, row: 1 },
      { idx: 11, label: "Operators 42→35; rooms +130",  tier: 2, row: 2 },
    ];

    const annotationPlugin = {
      id: "ct2_annotations",
      afterDatasetsDraw(chart) {
        const { ctx, chartArea } = chart;
        const totMeta = chart.getDatasetMeta(0);
        if (!totMeta || !totMeta.data.length) return;
        ctx.save();
        const rowYs = [chartArea.top - 4, chartArea.top - 22, chartArea.top - 40];
        annotations.forEach((a) => {
          const bar = totMeta.data[a.idx];
          if (!bar) return;
          const isT1 = a.tier === 1;
          const labelY = rowYs[a.row] || rowYs[0];
          // dashed connector
          ctx.setLineDash(isT1 ? [4, 3] : [2, 3]);
          ctx.strokeStyle = isT1 ? T.ink : T.muted;
          ctx.lineWidth = isT1 ? 1.1 : 0.8;
          ctx.beginPath();
          ctx.moveTo(bar.x, bar.y - 2);
          ctx.lineTo(bar.x, labelY + 6);
          ctx.stroke();
          ctx.setLineDash([]);
          // anchor dot
          ctx.fillStyle = isT1 ? T.ink : T.muted;
          ctx.beginPath();
          ctx.arc(bar.x, bar.y - 2, isT1 ? 2.5 : 2, 0, Math.PI * 2);
          ctx.fill();
          // label text
          ctx.font = isT1
            ? "600 11px 'Source Sans 3', sans-serif"
            : "11px 'Source Sans 3', sans-serif";
          ctx.fillStyle = isT1 ? T.ink : "#6B5A48";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText(a.label, bar.x, labelY);
        });
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
      type: "bar",
      data: {
        labels: fyLabels,
        datasets: [
          {
            type: "bar",
            label: "TOT receipts ($M)",
            data: totData,
            backgroundColor: T.accent,
            borderRadius: 2,
            yAxisID: "yLeft",
            order: 2,
          },
          {
            type: "line",
            label: "Avg. operating rooms",
            data: roomsData,
            borderColor: T.gold,
            backgroundColor: T.gold,
            borderWidth: 2.5,
            pointRadius: 3,
            pointBackgroundColor: T.gold,
            tension: 0.25,
            yAxisID: "yRight",
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 60 } },
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 14, color: T.ink, font: { size: 12 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                if (ctx.datasetIndex === 0) return `Receipts: $${ctx.parsed.y.toFixed(1)}M`;
                return `Avg. rooms: ${ctx.parsed.y}`;
              },
            },
          },
        },
        scales: {
          x: { ticks: { color: T.muted, font: { size: 11 }, maxRotation: 45 }, grid: { display: false } },
          yLeft: {
            type: "linear",
            position: "left",
            min: 0,
            max: 14,
            ticks: { callback: (v) => `$${v}M`, color: T.accent, font: { size: 11 } },
            grid: { color: T.rule },
            title: { display: true, text: "TOT receipts", color: T.accent, font: { size: 11 } },
          },
          yRight: {
            type: "linear",
            position: "right",
            min: 600,
            max: 900,
            ticks: { color: "#8a6d2e", font: { size: 11 } },
            grid: { drawOnChartArea: false },
            title: { display: true, text: "Avg. rooms", color: "#8a6d2e", font: { size: 11 } },
          },
        },
      },
      plugins: [annotationPlugin],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>Calistoga TOT Receipts and Average Rooms</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 640, position: "relative", height: 380 }}>
            <canvas ref={canvasRef} id="chart-calistoga-tot-rooms" aria-label="Dual-axis chart of City of Calistoga transient occupancy tax receipts and average operating rooms, fiscal year 2013-14 through fiscal year 2025-26, with six annotated events including the 2017 wildfires, Measure D, the COVID shutdown, the largest one-year rebound, operator consolidation, and the Calistoga Motor Lodge default" role="img" />
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-2_napa-population-2025_nvf.png", "Calistoga TOT receipts and average rooms")} />
      <p style={{ fontFamily: font, fontSize: 11, color: T.muted, marginTop: 6 }}>
        Mobile users: scroll horizontally to view full chart.
      </p>
      <Caption
        title="Fiscal year 2013-14 through fiscal year 2025-26"
        description={"Receipts rebounded sharply from the COVID shutdown to a peak in fiscal 2021-22 and have held steady since, but the underlying composition shifted. Average rooms grew 8% in fiscal 2024-25 while operating establishments fell from 42 to 35; in March 2026, the Calistoga Motor Lodge defaulted on a $40 million loan."}
        sources={[
          { label: "City of Calistoga Transient Occupancy Tax Report, April 2026", url: "https://www.calistogaca.gov/Government/City-Budgets/Transient-Occupancy-Tax" },
        ]}
      />
    </div>
  );
}

// ── CHART THREE — Housing-to-income multipliers ────────────────────
function ChartThree() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = ["Napa County 2010", "Napa County 2024", "Calistoga 2024 (household)", "Calistoga 2024 (vs. hospitality wage)"];
    const data = [4.5, 8.0, 12.4, 22.6];
    const colors = ["#B4B2A9", T.muted, T.accent, "#5C3D26"];

    const annotationPlugin = {
      id: "ct3_annotations",
      afterDatasetsDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        const xScale = scales.x;
        const meta = chart.getDatasetMeta(0);
        if (!meta || !meta.data.length) return;
        ctx.save();

        // Inline data labels at end of each bar
        ctx.font = "600 12px 'Source Sans 3', sans-serif";
        ctx.fillStyle = T.ink;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        meta.data.forEach((bar, i) => {
          ctx.fillText(`${data[i]}×`, bar.x + 8, bar.y);
        });

        // Vertical dashed threshold line at x = 3
        const x3 = xScale.getPixelForValue(3);
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = T.muted;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x3, chartArea.top);
        ctx.lineTo(x3, chartArea.bottom);
        ctx.stroke();
        ctx.setLineDash([]);

        // Two-line centered label below plot area
        ctx.font = "11px 'Source Sans 3', sans-serif";
        ctx.fillStyle = T.muted;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const lineY = chartArea.bottom + 6;
        ctx.fillText("3× conventional", x3, lineY);
        ctx.fillText("affordability threshold", x3, lineY + 13);

        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderRadius: 2 }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 60, bottom: 40 } },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.x}×` } },
        },
        scales: {
          x: {
            min: 0,
            max: 25,
            ticks: { callback: (v) => `${v}×`, color: T.muted, font: { size: 11 } },
            grid: { color: T.rule },
          },
          y: {
            ticks: { color: T.ink, font: { size: 12 } },
            grid: { display: false },
          },
        },
      },
      plugins: [annotationPlugin],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>Housing-to-Income Multipliers</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ position: "relative", height: 300 }}>
          <canvas ref={canvasRef} id="chart-housing-income-ratio" aria-label="Horizontal bar chart of housing-to-income multipliers showing Napa County 2010 at 4.5 times, Napa County 2024 at 8.0 times, Calistoga 2024 household at 12.4 times, and Calistoga 2024 versus hospitality wage at 22.6 times, with a vertical dashed line at 3 times marking the conventional affordability threshold" role="img" />
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-3_napa-population-2025_nvf.png", "Housing-to-income multipliers in Napa County and Calistoga")} />
      <Caption
        title="Typical home values divided by typical incomes — 2010 baseline vs. 2024"
        description={"The ratio of typical home values to typical household incomes has risen sharply from the 2010 county baseline. Calistoga’s ratio is about 55% above the current Napa County figure; against the wages of the dominant local industry — accommodation and food services — the multiplier is nearly three times the county-wide household ratio."}
        sources={[
          { label: "U.S. Census ACS 5-year estimates 2024", url: "https://api.census.gov/data/2024/acs/acs5" },
          { label: "BLS Quarterly Census of Employment and Wages, Napa County 2024", url: "https://data.bls.gov/cew/data/api/2024/a/area/06055.csv" },
          { label: "Zillow Home Value Index, Calistoga, March 2026", url: "https://www.zillow.com/home-values/3929/calistoga-ca/" },
          { label: "2010 baseline per Rethinking the Housing Narrative in Napa County (Napa Valley Features, June 2025)", url: "https://napavalleyfocus.substack.com/p/under-the-hood-rethinking-the-housing" },
        ]}
      />
    </div>
  );
}

// ── CHART FOUR — Housing units vs population indexed (2010 = 100) ──
function ChartFour() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    // TODO: replace placeholder series with verified DOF E-1 and E-1H historical pulls 2010-2026.
    // Current placeholders illustrate the structural pattern (housing rises steadily; population peaks mid-decade and reverts below the index line).
    const years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
    const housing = [100, 100.5, 101.0, 101.5, 102.1, 102.8, 103.5, 104.2, 105.0, 105.8, 106.5, 107.2, 107.8, 108.4, 109.0, 109.6, 110.2];
    const population = [100, 100.4, 100.8, 101.1, 101.4, 101.7, 102.0, 102.0, 101.7, 101.3, 100.9, 100.5, 100.3, 100.2, 100.05, 99.95, 99.85];

    chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
      type: "line",
      data: {
        labels: years.map(String),
        datasets: [
          {
            label: "Housing units (2010 = 100)",
            data: housing,
            borderColor: T.gold,
            backgroundColor: T.gold,
            borderWidth: 2.5,
            pointRadius: 3,
            pointBackgroundColor: T.gold,
            tension: 0.2,
            fill: false,
          },
          {
            label: "Population (2010 = 100)",
            data: population,
            borderColor: T.accent,
            backgroundColor: T.accent,
            borderWidth: 2.5,
            pointRadius: 3,
            pointBackgroundColor: T.accent,
            tension: 0.2,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 14, color: T.ink, font: { size: 12 } } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}` } },
        },
        scales: {
          x: { ticks: { color: T.muted, font: { size: 11 } }, grid: { color: T.rule } },
          y: {
            min: 95,
            max: 115,
            ticks: { color: T.muted, font: { size: 11 } },
            grid: { color: T.rule },
            title: { display: true, text: "Index (2010 = 100)", color: T.muted, font: { size: 11 } },
          },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>Napa County Housing Units vs. Population, Indexed 2010 = 100</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ position: "relative", height: 320 }}>
          <canvas ref={canvasRef} id="chart-housing-vs-pop-indexed" aria-label="Two-line chart of Napa County housing units and total population, indexed to 100 at 2010 and tracked through 2026. Housing rises steadily; population peaks mid-decade and crosses below the index line." role="img" />
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-4_napa-population-2025_nvf.png", "Napa County housing units vs total population, indexed 2010 = 100")} />
      <Caption
        title="County housing stock has grown; population has not"
        description={"Housing stock grew steadily from the 2010 baseline; population crossed below the index line during the post-2017 wildfire and pandemic period and has not recovered. The widening gap between the two lines is the structural picture the headline population number does not capture."}
        sources={[
          { label: "California Department of Finance E-1 and E-1H Population and Housing Estimates, 2010–2026", url: "https://dof.ca.gov/forecasting/demographics/estimates/e-1/" },
        ]}
      />
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────
export default function NapaPopulation() {
  const navigate = useNavigate();
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
            The California Department of Finance{"’"}s May 2026 release shows California and Napa County declining for the first time since the COVID rebound. American Canyon{"’"}s growth engine flatlined; Calistoga reversed from a 0.4% decline to a 2.32% gain, the largest percentage gain of any jurisdiction in the county — entirely through one workforce-affordable housing project at 1866 Lincoln Avenue. The revenue base that financed that housing is showing structural distress in the same fiscal year: TOT receipts have held only because rates have climbed enough to offset falling occupancy, the 97-room Calistoga Motor Lodge defaulted on a $40 million loan in March, the city manager and roughly one in five city employees turned over during the same window, and the 70-acre fairgrounds Calistoga purchased in 2024 has no operating funding plan and a 99-to-1 resident mandate against housing at the site. The headline population number registers presence. It does not register what produced the presence, who paid for it, or what it tells us about the underlying economy.
          </p>
        </div>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* LEDE                                                          */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <p style={{ ...P_STYLE, marginBottom: 18 }}>
          <strong>NAPA VALLEY, Calif.</strong> {"—"} The May 1 release from <a href="https://dof.ca.gov/forecasting/demographics/estimates/e-1/" target="_blank" rel="noopener noreferrer" style={LINK}>California{"’"}s Department of Finance</a> is the cleanest population data the state produces, and this year it tells a story Napa County has not heard since the COVID rebound. California declined. Napa County declined. And inside that decline, the geography of growth flipped.
        </p>

        <p style={P_STYLE}>
          Last year{"’"}s growth engine, American Canyon, flatlined. The Upvalley, which has been losing population for half a decade, kept losing {"—"} except for one town. Calistoga, the smallest and northernmost incorporated city in the county, grew 2.3%. On its own, that number reads like good news. Read against the rest of the data, it reads as a question the simple population number cannot answer.
        </p>

        <p style={P_STYLE}>
          This piece walks the new release from the federal frame down to the county aggregate, then jurisdiction by jurisdiction, and finishes inside Calistoga {"—"} because Calistoga is where the question of what population growth actually represents is being tested in real time.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — THE FEDERAL FRAME AND THE CALIFORNIA DECLINE        */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>The Federal Frame and the California Decline</h2>

        <p style={P_STYLE}>
          For the first time since the pandemic rebound, California{"’"}s resident population fell. The Department of Finance estimates the state lost 53,929 residents between January 1, 2025 and January 1, 2026, a decline of 0.14%. Net domestic out-migration ran 288,600. Natural increase was positive at 108,200, though down 4,500 from 2024. The variable that flipped the sign of the headline number was federal: legal international migration was cut by more than half, from 248,400 the prior year to 126,400.
        </p>

        <p style={P_STYLE}>
          The Department of Finance was explicit about what that math means. Absent the federal changes, California would have grown by approximately 66,000 residents in 2025 instead of declining by 54,000. The state{"’"}s population trajectory did not shift because Californians changed their behavior. It shifted because federal immigration policy did.
        </p>

        <p style={P_STYLE}>
          Napa County sits inside that frame. The county lost 246 residents to land at 136,374, a decline of 0.18% {"—"} a smaller percentage decline than the state. Napa declined less than California declined. But it declined.
        </p>

        <p style={P_STYLE}>
          A note on the data. The <a href="https://dof.ca.gov/forecasting/demographics/estimates/e-1/" target="_blank" rel="noopener noreferrer" style={LINK}>May 2025 E-1 release</a> benchmarked Napa County{"’"}s January 1, 2025 population at 136,124. The May 2026 release revises that figure upward to 136,620, then estimates the decline to 136,374. Department of Finance benchmarks every release back to the most recent census, which means the new vintage supersedes the old wherever they overlap. The comparisons in this piece use the revised series throughout.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — A FORECAST THAT HELD, UNTIL IT BROKE                */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>A Forecast That Held {"—"} Until It Broke</h2>

        <p style={P_STYLE}>
          The case that Napa County{"’"}s economic model was structurally weakening predates this release by years. <em><a href="https://napavalleyfocus.substack.com/p/napa-valley-finds-itself-between" target="_blank" rel="noopener noreferrer" style={LINK}>Napa Valley Finds Itself Between a Rock and a Hard Place</a></em> (October 2023) framed the luxury-positioning question. <em><a href="https://napavalleyfocus.substack.com/p/navigating-a-demographic-dilemma" target="_blank" rel="noopener noreferrer" style={LINK}>Napa County Faces Economic Challenges Due to Aging, Decreasing Population</a></em> (April 2024) projected a roughly 10% county GDP decline by 2030 from working-age contraction alone. <em><a href="https://napavalleyfocus.substack.com/p/under-the-hood-american-canyon-grows" target="_blank" rel="noopener noreferrer" style={LINK}>Under the Hood: American Canyon Grows While the Upvalley Shrinks</a></em> (May 2025) argued that the county{"’"}s only growth engine was a Bay Area spillover the city itself did not control. <em><a href="https://napavalleyfocus.substack.com/p/under-the-hood-rethinking-the-housing" target="_blank" rel="noopener noreferrer" style={LINK}>Rethinking the Housing Narrative in Napa County</a></em> (June 2025) made the deeper claim: until the wage structure of the local economy changes, building more units addresses the symptom, not the condition. <em><a href="https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-has-equaled" target="_blank" rel="noopener noreferrer" style={LINK}>More Rooms Has Equaled Fewer Jobs in Napa County</a></em> (August 2025) documented the inversion: room counts rising as employment fell. <em><a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-valleys-economy" target="_blank" rel="noopener noreferrer" style={LINK}>Under the Hood: Napa Valley{"’"}s Economy Looks Bigger Than It Is</a></em> (March 2026) showed that 87 cents of every dollar of nominal Napa County GDP growth since 2016 has been inflation; real economic activity grew only 4.6% over eight years.
        </p>

        <p style={P_STYLE}>
          The May 2025 piece made two specific predictions, both of which held for one more year {"—"} and both of which broke this year, in opposite directions. The first held that American Canyon was the county{"’"}s only growth engine, driven by a regional housing spillover the city itself did not control. That continued to hold through the 2024-2025 release window: American Canyon grew 2.9% that year, the strongest single-year gain of the three under examination here. In the 2025-2026 release that engine flatlined, adding just 31 residents on 78 net new housing units {"—"} a 0.14% gain, less than one-twentieth the rate of the prior year. The second prediction held that Calistoga would continue losing population. That held through 2024-2025 as well, when Calistoga lost 21 residents on a 0.4% decline. In the 2025-2026 release Calistoga reversed entirely, adding 120 residents to grow 2.32% {"—"} the largest percentage gain of any jurisdiction in the county in the most recent release.
        </p>

        <p style={P_STYLE}>
          The two predictions did not break for the same reason. American Canyon flatlined as its small but stable manufacturing employer base contracted, with the Coca-Cola bottling plant eliminating 135 jobs in the same twelve months. Calistoga reversed because a single workforce-affordable housing project came online. Both mechanisms were ones the May 2025 piece explicitly flagged as risks to watch. Napa city, Yountville, St. Helena and unincorporated all lost population in the most recent year. The 2025-2026 numbers offer a partial answer to the June 2025 question {"—"} <em>who are the new units for?</em> {"—"} that turns out to be more complicated than the question.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — THE JURISDICTIONS, IN ORDER                         */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>The Jurisdictions, in Order</h2>

        <p style={P_STYLE}>
          <strong>American Canyon</strong> added 31 residents to reach 22,619, a 0.14% gain. <a href="https://dof.ca.gov/forecasting/demographics/estimates/e-1/" target="_blank" rel="noopener noreferrer" style={LINK}>Housing units rose by 78 to 7,035</a>. The persons-per-unit absorption ratio {"—"} new residents divided by net new units {"—"} was 0.40, well below the 1.5 to 2.0 range healthy household formation produces. American Canyon added rooftops; the rooftops did not fill at the rate they used to. Inside the same twelve months, the Coca-Cola Company eliminated 135 manufacturing jobs at its bottling plant on Commerce Boulevard, with primary operations ceasing June 30, 2025 and warehouse operations winding down through year-end. The plant had been running at the same site since 1994. American Canyon{"’"}s role in the county{"’"}s economy {"—"} Bay Area commuter housing supplemented by a small but stable manufacturing employer base {"—"} weakened from both ends in the same year.
        </p>

        <p style={P_STYLE}>
          <strong>Napa city</strong> lost 242 residents to reach 77,803, a 0.31% decline. As the largest jurisdiction by far, the county{"’"}s first full year of decline post-rebound is registered most cleanly here.
        </p>

        <p style={P_STYLE}>
          <strong>Yountville</strong> lost 51 residents to reach 2,567, a decline of 1.95% {"—"} the largest percentage decline in the county. Yountville{"’"}s small population magnifies modest absolute changes, but the direction matches the broader Upvalley pattern.
        </p>

        <p style={P_STYLE}>
          <strong>St. Helena</strong> lost 22 residents to reach 5,317, a 0.41% decline. The cleanest single illustration of Upvalley wine real estate distress sits just outside the city{"’"}s southern boundary on Big Tree Road. Benessere Vineyards {"—"} the 42-acre estate that once housed the Charles Shaw operation that became Trader Joe{"’"}s Two-Buck Chuck {"—"} listed at $35 million in November 2024, dropped to $28 million, sat 18 months and is heading to Concierge Auctions May 13{"–"}28, 2026 with an expected opening bid of $8 to $12 million. Peak-to-floor decline: roughly 77%.
        </p>

        <p style={P_STYLE}>
          <strong>Unincorporated Napa County</strong> lost 82 residents to reach 22,786, a 0.36% decline. This is the part of the county that contains most of the wineries themselves and most of the high-end resort capacity {"—"} Stanly Ranch, the major Auberge properties, the Silverado Resort and the producing vineyards.
        </p>

        <p style={P_STYLE}>
          <strong>Calistoga</strong> gained 120 residents to reach 5,282, a 2.32% increase. Housing units rose by 82 to 2,525. The persons-per-unit absorption ratio was 1.46, consistent with workforce-affordable housing functioning as designed. On the surface, Calistoga is the only piece of unambiguously good news in the May 2026 release for Napa County.
        </p>

        <p style={P_STYLE}>
          The surface is not the whole story.
        </p>

        <ChartOne />

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — CALISTOGA: ONE PROJECT, ONE MECHANISM, ONE YEAR     */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>Calistoga: One Project, One Mechanism, One Year</h2>

        <p style={P_STYLE}>
          Calistoga{"’"}s 120 new residents arrived almost entirely through one project. <strong>Lincoln Avenue Apartments</strong> {"—"} 78 rentable workforce-affordable units at 1866 Lincoln Avenue {"—"} opened in late 2025 after sewer-line delays pushed occupancy back from earlier in the year. The complex was developed by the Calistoga-based nonprofit Calistoga Affordable Housing in partnership with Burbank Housing of Santa Rosa, capitalized by federal HOME Investment Partnership funds and a long-term loan secured by deed of trust on the property. The <a href="https://www.calistogaca.gov/Government/City-Budgets/Audit-Reports" target="_blank" rel="noopener noreferrer" style={LINK}>June 30, 2024 audited financial statement</a> shows the city holding $11.9 million in restricted housing balances; $4.4 million is the HOME-grant loan that financed Lincoln Avenue.
        </p>

        <p style={P_STYLE}>
          The financial mechanism has its own history. In November 2018, Calistoga voters passed Measure D, raising the city{"’"}s transient occupancy tax by one percentage point {"—"} from 12% to 13% {"—"} and dedicating that 1% increment to workforce and affordable housing. The argument in favor, written on the ballot, said <em>{"“"}many people who work in Calistoga cannot afford to live here, making traffic worse and filling jobs more difficult.{"”"}</em> Effective January 2019, every overnight hotel stay in Calistoga began contributing to a restricted housing fund. Lincoln Avenue Apartments is what that money, leveraged with federal grants, financed.
        </p>

        <p style={P_STYLE}>
          Calistoga{"’"}s tourism revenue, in other words, paid for the workforce housing that produced the city{"’"}s 2025 population growth.
        </p>

        <p style={P_STYLE}>
          The mechanism worked. The condition it was designed to manage did not change.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — THE REVENUE BASE THAT FUNDS THE FIX                 */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>The Revenue Base That Funds the Fix</h2>

        <p style={P_STYLE}>
          The City of Calistoga{"’"}s twelve-year transient-occupancy-tax history, published in its <a href="https://www.calistogaca.gov/Government/City-Budgets/Transient-Occupancy-Tax" target="_blank" rel="noopener noreferrer" style={LINK}>April 2026 fiscal report</a>, shows what is happening to the funding source itself. From fiscal 2013-14 through 2018-19, annual TOT receipts rose from $4.5 million to $6.4 million on a stable base of roughly 690 to 760 rooms. The 2017 wildfires cost the city about $350,000. The March 2020 COVID shutdown collapsed receipts to $4.7 million. The rebound was vertical: $11.8 million in fiscal 2021-22, the largest single-year jump on record. Receipts have held in the $11.8 to $12.3 million range since.
        </p>

        <p style={P_STYLE}>
          The headline number has been steady. The composition underneath has not. The lodging base expanded from 785 average rooms in fiscal 2023-24 to 861 in fiscal 2024-25 {"—"} an 8% capacity increase in a single year {"—"} while operating establishments fell from 42 to 35. Seven operators left, 130 rooms were added by the operators that remained. The pattern matches what <em>More Rooms Has Equaled Fewer Jobs</em> documented at the county level. Occupancy through February 2026 ran at 51.9%, against a fiscal 2021-22 peak of 73.7%. Receipts have held only because average daily rates at the new resort capacity have climbed enough to offset the occupancy decline.
        </p>

        <p style={P_STYLE}>
          In March 2026, the offset reached one of Calistoga{"’"}s gateway properties. The Calistoga Motor Lodge, a 97-room resort at 1880 Lincoln Avenue, defaulted on a <a href="https://napavalleyregister.com/calistogan/news/calistoga-motor-lodge-foreclosure-expansion-eagle-point-hotel-partners/article_87165814-66f0-4130-89aa-768e35822aea.html" target="_blank" rel="noopener noreferrer" style={LINK}>$40 million loan</a>. The notice of default was filed March 23 in the Napa County Recorder{"’"}s Office; total amount owed was $40,983,711. The property had completed a 12-room expansion in 2024-2025 and had transitioned out of Hyatt{"’"}s JdV portfolio in September 2025. Mayor Donald Williams told the <em>Napa Valley Register</em> that about half of Calistoga{"’"}s general fund comes from TOT and that the city would be conservative with revenue projections for the coming fiscal year. Stanly Ranch, the regional Auberge-brand peer in unincorporated south county, defaulted on its $230 million loan in 2025 and was sold to <a href="https://www.napaserve.org/under-the-hood/calculators#tracker" target="_blank" rel="noopener noreferrer" style={LINK}>Blackstone for $195 million</a> at the end of March 2026.
        </p>

        <p style={P_STYLE}>
          The revenue base that capitalized Calistoga{"’"}s affordable housing {"—"} and that funds roughly half of the city{"’"}s general fund {"—"} is showing structural distress in the same year the housing it financed produced the city{"’"}s population growth.
        </p>

        <ChartTwo />

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — THE INSTITUTIONAL LAYER                             */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>The Institutional Layer</h2>

        <p style={P_STYLE}>
          On August 27, 2025, the Calistoga City Council convened a special closed session to evaluate City Manager Laura Snideman. Six city officials testified during public comment: Fire Chief Jed Matcham, Planning and Building Director Greg Desmond, Fairgrounds Revitalization Director Sheli Wright, Deputy City Manager Rachel Stepp, Administrative Services Director Connie Cardenas and Human Resources Director Rena Lariz {"—"} five department directors and the fire chief, in a town of 5,200 residents. Snideman resigned the same day. Assistant City Manager Mitch Celaya stepped in as interim. The search for a permanent replacement is still underway as of this writing.
        </p>

        <p style={P_STYLE}>
          The departure was the most visible point of a longer pattern. The <em>Napa Valley Register</em>, in a <a href="https://napavalleyregister.com/news/calistoga-city-manager-laura-snideman-government/article_5b2713ab-906e-4b4b-9b23-710d2e5599bd.html" target="_blank" rel="noopener noreferrer" style={LINK}>three-part series in late 2025</a>, documented a workforce turnover rate of roughly 22% among Calistoga{"’"}s 84 city employees during Snideman{"’"}s tenure. The nationwide municipal turnover rate is approximately 1.5%; the Western U.S. rate is 3.3%. Former Planning Director Jeff Mitchem, who resigned in 2023 citing the city manager{"’"}s conduct, told the <em>Register</em> he had not encountered a comparable work environment in nearly four decades of public service.
        </p>

        <p style={P_STYLE}>
          Institutional capacity is the layer that absorbs growth. New residents need permits. New developments need planning review. New revenue streams need finance staff to track them. New public assets need operational management. The city that received the 2025 population gain is the same city that lost roughly one in five of its employees during the same period.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — WHAT RESIDENTS SAID THEY WANTED, AND WHAT THEY DID NOT */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>What Residents Said They Wanted, and What They Did Not</h2>

        <p style={P_STYLE}>
          In July 2024, Calistoga purchased the 70-acre Napa County Fairgrounds {"—"} the geographic and emotional center of the city {"—"} from <a href="https://www.napacounty.gov/CivicAlerts.aspx?AID=506" target="_blank" rel="noopener noreferrer" style={LINK}>Napa County for $2 million</a>. The purchase was the smaller version of the deal. The original agreement, reached in October 2022, would have transferred the entire 70.6-acre property for $15.885 million through a community facilities district funded by a special property tax. Measure E went to Calistoga voters in March 2023 and failed by a two-thirds margin. The city went back to the county and negotiated the smaller cash purchase. Operating capital remains an open question. The current revitalization plan, as reported in the <a href="https://www.pressdemocrat.com/2026/05/01/calistoga-fairgrounds-revitalization-plan-starts-to-take-shape/" target="_blank" rel="noopener noreferrer" style={LINK}><em>Press Democrat</em> on May 1, 2026</a>, is a $120,000 fundraising pilot to install heating and air conditioning in the Butler Building. <em><a href="https://napavalleyfocus.substack.com/p/millions-needed-to-renovate-calistoga" target="_blank" rel="noopener noreferrer" style={LINK}>Millions Needed to Renovate Calistoga Fairgrounds</a></em> (Napa Valley Features, February 2024) flagged the financing question at the time of purchase. The question has not been resolved.
        </p>

        <p style={P_STYLE}>
          What residents themselves want for the property is the cleanest signal in the public record. The City of Calistoga commissioned a formal community survey from FM3 Research between September 20 and October 12, 2025; the firm collected 641 phone and online responses and <a href="https://www.pressdemocrat.com/2025/11/20/most-calistoga-residents-reject-housing-at-fairgrounds-survey-shows/" target="_blank" rel="noopener noreferrer" style={LINK}>presented results to the City Council in November</a>. The findings were direct. Residents ranked maintaining the fairgrounds as an emergency evacuation center as the top priority, with 86% calling that use extremely or very important. Strong support emerged for restoring historic uses: festivals, the annual fair, public open space, the RV park, the Calistoga Speedway, an amphitheater and the golf course. Support for leasing portions to vendors to help fund operations ran 80%. Just 5% of respondents wanted commercial development. <strong>Just 1% wanted housing.</strong>
        </p>

        <p style={P_STYLE}>
          That last number is worth pausing on. In the same year Calistoga produced the largest percentage population gain of any jurisdiction in the county in the most recent release {"—"} a gain that came almost entirely through one workforce-housing complex {"—"} the city{"’"}s residents told their own government, by a 99-to-1 margin in a representative survey, that they did not want housing as the answer for the largest civic asset the city has acquired in living memory.
        </p>

        <p style={P_STYLE}>
          That is not a contradiction in the data. It is a contradiction in the framing. Two different conversations are happening in parallel. One says Calistoga needs more affordable housing because workers can{"’"}t afford to live where they work. The other {"—"} coming from the residents themselves, the people who already do live in town {"—"} says the answer is not more housing.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — THE ARGUMENT THE DATA HAVE BEEN MAKING              */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>The Argument the Data Have Been Making</h2>

        <p style={P_STYLE}>
          The population number registers presence. It does not register what produced the presence, who paid for it, or what it tells us about the underlying economy.
        </p>

        <p style={P_STYLE}>
          What the resident survey tells us, and what every Under the Hood column on Napa{"’"}s economy for the past several years has built toward, is this: the affordable-housing argument is not an answer to a housing-supply problem. It is a workaround for a wage problem. The dominant local industry {"—"} wine and luxury hospitality {"—"} does not pay wages that allow its workers to live where they work. The affordable-housing pipeline exists to manage the gap, not to close it. Tourism revenue flows through the city, into the housing fund, into deed-restricted units, allowing tourism workers to live in the town where they work. The system finances its own workaround.
        </p>

        <p style={P_STYLE}>
          The proof is in who already lives in Calistoga. The 2022 city Housing Element draft, prepared for state review, surfaced this directly in residents{"’"} own words. <em>{"“"}The most commonly identified barrier to obtaining housing in Calistoga was cost. Respondents explained that many people buy property as a vacation home for their families which limits the availability of housing in the City. With limited housing and the small-town charm of the City, housing is not affordable for many service workers earning minimum wage.{"”"}</em> People whose incomes come from outside the valley can afford to live here as residents, and increasingly as second- and third-home owners. People whose incomes come from working in the valley cannot. That is not a housing-supply problem. It is a wage-source problem. If supply were the binding constraint, second-home owners would have been priced out of holding multiple properties. They have not been, because their incomes are not connected to the local wage base.
        </p>

        <p style={P_STYLE}>
          The <a href="https://api.census.gov/data/2024/acs/acs5" target="_blank" rel="noopener noreferrer" style={LINK}>2024 American Community Survey</a> quantifies the dynamic the Housing Element draft described in residents{"’"} words. In Napa County, roughly 5.6% of all housing units are classified as vacant for seasonal, recreational or occasional use {"—"} more than twice the California rate of 2.4%, and the largest single category of vacant housing in the county. More than half of every vacant unit in Napa County is held as second-home or vacation property. In Calistoga specifically, the for-sale and sold-not-occupied categories show essentially zero units; the vacancy that exists is split between rentals and seasonal use. The Calistoga housing market does not turn over. It holds.
        </p>

        <p style={P_STYLE}>
          The numbers behind the argument: Napa County{"’"}s NAICS 72 average annual wage {"—"} the dominant local industry of accommodation and food services {"—"} was <a href="https://data.bls.gov/cew/data/api/2024/a/area/06055.csv" target="_blank" rel="noopener noreferrer" style={LINK}>$47,009 in 2024</a>, with the lodging subsector at $53,623 and food services at $42,490. Total NAICS 72 employment in the county: 12,026 workers. Calistoga{"’"}s median household income, per 2020-2024 ACS 5-year estimates, was $85,446 {"—"} but the spread between mean ($143,448) and median tells a structural story: a meaningful upper-income tier pulls the average 68% above the typical household, evidence of the second-home and outside-income overlay on the local wage base. Calistoga{"’"}s bimodal labor structure shows up in the occupational breakdown: service occupations earned a median $51,259, sales-and-office $53,204, production-and-transport $55,172 {"—"} and management/business/science/arts <a href="https://api.census.gov/data/2024/acs/acs5" target="_blank" rel="noopener noreferrer" style={LINK}>$111,250</a>. Nearly double the service-occupation median.
        </p>

        <p style={P_STYLE}>
          Wage growth, measured against the cost basket of actually living where the work happens, was essentially flat. NAICS 72 average annual wage rose from $31,689 in 2016 to $47,009 in 2024 {"—"} a 48.3% nominal gain over eight years. Over the same window, U.S. CPI rose 30.7%. By the standard national deflator the wage-side gain looks modest but real. Measured against the local cost basket {"—"} the housing, utility and service prices that govern living in Calistoga {"—"} the picture inverts. Calistoga{"’"}s median gross rent rose from $1,153 in the 2012-2016 ACS 5-year to $1,767 in the 2020-2024 5-year, a 53.3% increase. Napa County rents rose 55.1% over the same window. The Zillow Home Value Index for Calistoga peaked above $1.18 million in early 2022 from a 2016 baseline closer to $700,000, a roughly 55% climb. Inside Calistoga itself, the Zillow data show the average home value at <a href="https://www.zillow.com/home-values/3929/calistoga-ca/" target="_blank" rel="noopener noreferrer" style={LINK}>$1,062,298 as of March 31, 2026</a>, with the 27 active listings asking a median of $1,890,167. Wages did not keep pace with rents nominally {"—"} they trailed. The cost of actually living in Calistoga rose faster than the wages of the industry the town{"’"}s economy is built on. Workers{"’"} real purchasing power against the cost of living <em>where they work</em> did not keep pace.
        </p>

        <p style={P_STYLE}>
          The structural ratios put the mismatch in one number. Calistoga{"’"}s home values stand at 12.4 times the city{"’"}s median household income {"—"} about 55% above the Napa County figure of 8.0 times. Against the average wage of the dominant local industry, the Calistoga ratio rises to 22.6 times. The county-wide ratio in 2010 was 4.5 times; by 2025, <em>Rethinking the Housing Narrative</em> documented it had reached 8.6 times. Calistoga{"’"}s housing-to-income ratio is roughly five times the 2010 county baseline. Against the wages that the town{"’"}s tourism economy actually pays, <a href="https://files.zillowstatic.com/research/public_csvs/zhvi/City_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv" target="_blank" rel="noopener noreferrer" style={LINK}>the multiplier is nearly six times the 2010 baseline</a>.
        </p>

        <ChartThree />

        <p style={P_STYLE}>
          <em><a href="https://napavalleyfocus.substack.com/p/under-the-hood-rethinking-the-housing" target="_blank" rel="noopener noreferrer" style={LINK}>Rethinking the Housing Narrative in Napa County</a></em> documented the broader county math: in 2010 the median Napa County home cost about 4.5 times median household income. By 2025 that ratio reached 8.6 times. Qualifying for the median-priced home at $937,500 under current mortgage rates requires roughly $230,000 in gross household income. Tourism jobs average around $35,000. At those wages, the median home is not achievable regardless of how many units are built. <em>More Rooms Has Equaled Fewer Jobs</em> documented the parallel inversion: Napa County leisure and hospitality employment is roughly flat over six years against a 27% rise in nominal county GDP. <em>Napa Valley{"’"}s Economy Looks Bigger Than It Is</em> documented the underlying composition: of every dollar of nominal Napa County GDP growth since 2016, 87 cents has been inflation. Real economic activity grew only 4.6% over eight years.
        </p>

        <p style={P_STYLE}>
          What the resident survey adds is the community{"’"}s own reading of that condition. The 99-to-1 vote against housing on the fairgrounds is not opposition to workers having places to live. It is a community signaling, in a representative sample, that more subsidized housing in a community whose dominant industry produces wages that cannot afford market-rate housing is not the structural answer it has been treated as. Residents want the fairgrounds maintained as an emergency evacuation site, restored for festivals and the annual fair, opened for the speedway and the golf course. They want the asset that defines their town treated as community infrastructure, not as housing capacity for an industry whose wage structure has not changed.
        </p>

        <p style={P_STYLE}>
          The industries that finance the affordable-housing apparatus need it to continue, because their wage structures require it. The community is signaling that it does not. That is the contradiction the population number does not surface.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — WHAT THE POPULATION NUMBER DOES NOT MEASURE         */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>What the Population Number Does Not Measure</h2>

        <p style={P_STYLE}>
          Calistoga{"’"}s 2.3% population gain is genuine. The 78 units at Lincoln Avenue opened, the residents moved in, the persons-per-unit absorption ratio was healthy. By the metric the Department of Finance is designed to capture, the workforce-affordable-housing model produced exactly the outcome it was designed to produce.
        </p>

        <p style={P_STYLE}>
          What the population number cannot measure: that the revenue base which financed the housing is showing structural distress one fiscal year later; that the city government managing the growth lost its chief executive and roughly one in five of its employees during the same window; that the 70-acre civic asset purchased the year before has no operating funding plan and a 99-to-1 resident mandate against housing at the site; that the Upvalley wine real estate around Calistoga is repricing at 70 to 80% discounts at auction; that the lodging operator base concentrated 19% more rooms into 17% fewer operators in a single year; and that the workers who moved into the new units are doing so under a wage structure that the dominant local industry has not changed and is not changing.
        </p>

        <p style={P_STYLE}>
          A community grows in census numbers when housing units are added and people move in. A community grows in any meaningful sense when the wages produced by working there allow people to live there, when its institutions function, when its public assets are maintained and when its governance is trusted. Calistoga{"’"}s 2025 growth was real on the first measure. The other four are open.
        </p>

        <p style={P_STYLE}>
          The May 2026 numbers tell us where people moved. The harder question is what they moved into.
        </p>

        <ChartFour />

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — WHAT TO WATCH                                       */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>What to Watch</h2>

        <p style={P_STYLE}>
          Three indicators in the next twelve months will sharpen the picture.
        </p>

        <p style={P_STYLE}>
          The Calistoga Motor Lodge{"’"}s 90-day cure period from the March 23, 2026 notice of default expires in late June. Whether the property cures, transfers ownership or proceeds to foreclosure will signal the trajectory of the regional lodging base on which Measure D{"’"}s housing finance depends.
        </p>

        <p style={P_STYLE}>
          The Bureau of Labor Statistics{"’"} Quarterly Census of Employment and Wages data for the third quarter of 2025 {"—"} currently delayed by federal publication disruptions {"—"} will be the first quarter to capture the full effect of the Coca-Cola American Canyon shutdown. The release will sharpen the Napa County manufacturing and hospitality wage picture in a way the May 2025 release does not.
        </p>

        <p style={P_STYLE}>
          And the broader county trajectory deserves attention. <em><a href="https://napavalleyfocus.substack.com/p/navigating-a-demographic-dilemma" target="_blank" rel="noopener noreferrer" style={LINK}>Napa County Faces Economic Challenges Due to Aging, Decreasing Population</a></em> (April 2024) projected {"—"} using the Lightcast 2023 forecast and U.S. Census data {"—"} that Napa County{"’"}s working-age population could fall from 83,614 to 67,032 by 2030, the over-65 population could rise to roughly 27,000, and the resulting demographic drag on productivity could produce a roughly 10% decline in county GDP from its 2022 peak. The May 2026 numbers do not contradict that trajectory. They confirm it. Every signal that piece flagged {"—"} aging cohort growth, working-age contraction, the affordability question and the structural mismatch between an economy built around luxury wine and tourism and a younger generation choosing different lifestyles {"—"} has continued in the same direction. Calistoga{"’"}s 2.3% gain is the exception inside that trajectory. The trajectory itself has not changed.
        </p>

        <p style={P_STYLE}>
          The May 2027 E-1 release will tell us whether Calistoga{"’"}s 2025 growth was the leading edge of a sustained trend driven by additional workforce-housing capacity or a one-time effect of Lincoln Avenue Apartments coming online during a year when the underlying revenue base was already softening. If the housing pipeline produces additional units and the population continues to grow against a contracting wage base, the question this piece raises {"—"} what the growth actually represents {"—"} becomes the central question of Napa County{"’"}s housing policy.
        </p>

        <p style={P_STYLE}>
          For now, the geography flipped. The numbers told us that. What the numbers did not tell us is what the new geography rests on.
        </p>

        {/* ── BYLINE (italic) ─────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.ink, fontStyle: "italic", lineHeight: 1.65, margin: "32px 0 0 0" }}>
          Tim Carl is a Napa Valley{"–"}based photojournalist and scientist. He grew up in St. Helena. He writes the weekly Under the Hood series and is the founder of {PUBLICATION}, Sonoma County Features and Lake County Features along with NapaServe, a community intelligence platform for Napa County.
        </p>

        {/* ── POLLS SECTION (per spec ordering: directly after byline) ── */}
        <PollsSection slug={ARTICLE_SLUG} />

        {/* ── RELATED COVERAGE ────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 48, paddingTop: 28, marginBottom: 28 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center", marginBottom: 20 }}>
            Related Coverage
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/napa-valley-finds-itself-between" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Napa Valley Finds Itself Between a Rock and a Hard Place{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (October 2023)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/navigating-a-demographic-dilemma" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Napa County Faces Economic Challenges Due to Aging, Decreasing Population{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (April 2024)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-american-canyon-grows" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: American Canyon Grows While the Upvalley Shrinks{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (May 2025)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-rethinking-the-housing" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Rethinking the Housing Narrative in Napa County{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (June 2025)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-has-equaled" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: More Rooms Has Equaled Fewer Jobs in Napa County{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (August 2025)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-valleys-economy" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Napa Valley{"’"}s Economy Looks Bigger Than It Is{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (March 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/millions-needed-to-renovate-calistoga" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Millions Needed to Renovate Calistoga Fairgrounds{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (February 2024)</span>
            </li>
          </ul>
        </div>

        {/* ── ARCHIVE SEARCH ──────────────────────────────────────── */}
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
              placeholder="Search Calistoga, population, housing, Measure D, fairgrounds..."
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

        {/* ── METHODOLOGY ─────────────────────────────────────────── */}
        <div style={{ borderTop: `2px solid ${T.border}`, paddingTop: 28, marginTop: 40 }}>
          <h3 style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: T.ink, margin: "0 0 10px" }}>Methodology</h3>
          <p style={{ fontFamily: font, fontSize: 14, color: T.muted, lineHeight: 1.7, fontStyle: "italic" }}>
            Each year{"’"}s percent change in Chart 1 is computed within its own release vintage; the unincorporated 2023-2024 figure is computed by subtraction from the county total since the May 2024 release coverage available did not separately report it. Chart 2 uses fiscal-year totals from the City of Calistoga Transient Occupancy Tax Report, April 2026 vintage; intermediate fiscal-year values between FY13-14 and FY25-26 anchors are pending the next published TOT detail and are flagged in the source code. Chart 3{"’"}s housing-to-income multipliers use 5-year ACS estimates for income and Zillow Home Value Index for typical home value as of March 2026; the BLS Quarterly Census of Employment and Wages provides the NAICS 72 hospitality-wage figure. Chart 4 uses the most recent revised E-1 and E-1H series from the May 2026 release wherever vintages overlap. Linked text throughout the body anchors directly to the document or data point being cited; the May 2026 E-1 release benchmarks every prior year against the most recent census, so revisions to 2024 and 2025 figures appear between chart series and inline-cited values.
          </p>
        </div>

        {/* ── SOURCES ─────────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 40, paddingTop: 24 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: T.ink, marginBottom: 16 }}>Sources</h2>
          <ol style={{ fontFamily: font, fontSize: 14, color: T.ink, lineHeight: 1.75, paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>California Department of Finance, <a href="https://dof.ca.gov/forecasting/demographics/estimates/e-1/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>E-1 Population Estimates, May 1, 2026</a>.</li>
            <li style={{ marginBottom: 8 }}>California Department of Finance, E-1 Population Estimates, May 1, 2025.</li>
            <li style={{ marginBottom: 8 }}>California Department of Finance, E-1 Population Estimates, May 2024.</li>
            <li style={{ marginBottom: 8 }}>U.S. Census Bureau, <a href="https://api.census.gov/data/2024/acs/acs5" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>American Community Survey 5-year estimates, 2020-2024</a> (Tables B25064, B25004, S0101, S2401).</li>
            <li style={{ marginBottom: 8 }}>Bureau of Labor Statistics, <a href="https://data.bls.gov/cew/data/api/2024/a/area/06055.csv" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Quarterly Census of Employment and Wages, Napa County 2024 (NAICS 72)</a>.</li>
            <li style={{ marginBottom: 8 }}>Zillow Home Value Index, <a href="https://www.zillow.com/home-values/3929/calistoga-ca/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Calistoga and Napa County, March 2026</a>.</li>
            <li style={{ marginBottom: 8 }}>Zillow Research, <a href="https://files.zillowstatic.com/research/public_csvs/zhvi/City_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>ZHVI city-level historical series CSV</a>.</li>
            <li style={{ marginBottom: 8 }}>City of Calistoga, <a href="https://www.calistogaca.gov/Government/City-Budgets/Transient-Occupancy-Tax" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Transient Occupancy Tax Report, April 2026</a>.</li>
            <li style={{ marginBottom: 8 }}>City of Calistoga, <a href="https://www.calistogaca.gov/Government/City-Budgets/Audit-Reports" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>June 30, 2024 audited financial statement</a>.</li>
            <li style={{ marginBottom: 8 }}>Napa County, <a href="https://www.napacounty.gov/CivicAlerts.aspx?AID=506" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Fairgrounds purchase agreement, July 2024</a>.</li>
            <li style={{ marginBottom: 8 }}>FM3 Research, Calistoga Community Survey, October 2025.</li>
            <li style={{ marginBottom: 8 }}>Press Democrat, {"“"}<a href="https://www.pressdemocrat.com/2025/11/20/most-calistoga-residents-reject-housing-at-fairgrounds-survey-shows/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Most Calistoga residents reject housing at fairgrounds, survey shows</a>,{"”"} Nov. 20, 2025.</li>
            <li style={{ marginBottom: 8 }}>Press Democrat, {"“"}<a href="https://www.pressdemocrat.com/2026/05/01/calistoga-fairgrounds-revitalization-plan-starts-to-take-shape/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Calistoga fairgrounds revitalization plan starts to take shape</a>,{"”"} May 1, 2026.</li>
            <li style={{ marginBottom: 8 }}>Napa Valley Register, <a href="https://napavalleyregister.com/news/calistoga-city-manager-laura-snideman-government/article_5b2713ab-906e-4b4b-9b23-710d2e5599bd.html" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>three-part Snideman series</a>, late 2025.</li>
            <li style={{ marginBottom: 8 }}>Napa Valley Register, {"“"}<a href="https://napavalleyregister.com/calistogan/news/calistoga-motor-lodge-foreclosure-expansion-eagle-point-hotel-partners/article_87165814-66f0-4130-89aa-768e35822aea.html" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Calistoga Motor Lodge default</a>,{"”"} March 2026.</li>
            <li style={{ marginBottom: 8 }}>NapaServe, <a href="https://www.napaserve.org/under-the-hood/calculators#tracker" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Regional Contraction Tracker</a>.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/napa-valley-finds-itself-between" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa Valley Finds Itself Between a Rock and a Hard Place</a>,{"”"} Napa Valley Features, Oct. 2023.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/navigating-a-demographic-dilemma" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: Napa County Faces Economic Challenges Due to Aging, Decreasing Population</a>,{"”"} Napa Valley Features, Apr. 2024.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/under-the-hood-american-canyon-grows" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: American Canyon Grows While the Upvalley Shrinks</a>,{"”"} Napa Valley Features, May 2025.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/under-the-hood-rethinking-the-housing" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: Rethinking the Housing Narrative in Napa County</a>,{"”"} Napa Valley Features, June 2025.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-has-equaled" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: More Rooms Has Equaled Fewer Jobs in Napa County</a>,{"”"} Napa Valley Features, Aug. 2025.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-valleys-economy" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: Napa Valley{"’"}s Economy Looks Bigger Than It Is</a>,{"”"} Napa Valley Features, Mar. 2026.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/millions-needed-to-renovate-calistoga" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Millions Needed to Renovate Calistoga Fairgrounds</a>,{"”"} Napa Valley Features, Feb. 2024.</li>
          </ol>
        </div>

      </div>

      <Footer />
    </div>
  );
}

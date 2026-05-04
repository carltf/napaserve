// UNDER THE HOOD — The Downside of Napa's Massive Marketing Machine
// -----------------------------------------------------------------
// Slug: napa-marketing-machine-2026
// Publication: Napa Valley Features
// Built from under-the-hood-napa-lodging-pricing.jsx structural template.
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
const ARTICLE_SLUG = "napa-marketing-machine-2026";
const ARTICLE_TITLE = "The Downside of Napa's Massive Marketing Machine";
const ARTICLE_DECK = "For 20 years Napa Valley's wine and hospitality industries have spent in the billions marketing the region. Visit Napa Valley's annual budget alone has grown 1,500% since 2010 to $9.3 million. The brand position the spending was meant to defend has been moving in the opposite direction.";
const ARTICLE_PUBLICATION = "Napa Valley Features";
const ARTICLE_DATE = "May 9, 2026";
const POLL_IDS = [36, 37, 38]; // eslint-disable-line no-unused-vars
const SHOW_DECK = true;
const EYEBROW = "Under the Hood";

// ── COUNTY + PUBLICATION (template-compat downstream constants) ────
const PUBLICATION = ARTICLE_PUBLICATION;
const SUBSTACK_URL = "https://napavalleyfocus.substack.com/";
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

// Aliases used in inline body prose (per build prompt convention)
const P_STYLE = prose;
const SECTION_H2 = h2style;
const SECTION_H3 = h3style;
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

// ── CHART ONE — Marketing Spend vs Visitors (dual-axis line) ───────
function ChartOne() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = [2010, 2012, 2014, 2016, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
    const budget   = [0.5,  2.0,  5.0,  6.5,  7.4,  7.8,  5.0,  6.0,  7.5,  8.5,  8.1,  9.2,  9.3];
    const visitors = [2.5,  2.8,  3.0,  3.5,  3.85, 3.85, 1.5,  2.8,  3.5,  3.7,  3.7,  3.7,  3.7];

    const annotationPlugin = {
      id: "ct1_annotations",
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const visMeta = chart.getDatasetMeta(1);
        if (!visMeta || !visMeta.data.length) return;
        ctx.save();
        // 2018 peak label (index 4)
        const p2018 = visMeta.data[4];
        if (p2018) {
          ctx.font = "500 11px 'Source Sans 3', sans-serif";
          ctx.fillStyle = T.ink;
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText("2018 peak: 3.85M", p2018.x, p2018.y - 8);
        }
        // "Still below 2018" near 2023 (index 9)
        const p2023 = visMeta.data[9];
        if (p2023) {
          ctx.font = "11px 'Source Sans 3', sans-serif";
          ctx.fillStyle = "#5F5E5A";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText("Still below 2018", p2023.x, p2023.y + 8);
        }
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Visit Napa Valley budget ($M)",
            data: budget,
            borderColor: "#8B5E3C",
            backgroundColor: "#8B5E3C",
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: "#8B5E3C",
            yAxisID: "yLeft",
            tension: 0.25,
            fill: false,
          },
          {
            label: "Annual visitors (millions)",
            data: visitors,
            borderColor: "#C4A050",
            backgroundColor: "#C4A050",
            borderWidth: 2.5,
            borderDash: [6, 4],
            pointRadius: 4,
            pointStyle: "rectRot",
            pointBackgroundColor: "#C4A050",
            yAxisID: "yRight",
            tension: 0.25,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 14, color: T.ink, font: { size: 12 } },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                if (ctx.datasetIndex === 0) return `Budget: $${ctx.parsed.y.toFixed(1)}M`;
                return `Visitors: ${ctx.parsed.y.toFixed(2)}M`;
              },
            },
          },
        },
        scales: {
          x: { ticks: { color: T.muted, font: { size: 11 } }, grid: { color: T.rule } },
          yLeft: {
            type: "linear",
            position: "left",
            min: 0,
            max: 10,
            ticks: { callback: (v) => `$${v}M`, color: "#8B5E3C", font: { size: 11 } },
            grid: { color: T.rule },
            title: { display: true, text: "VNV budget", color: "#8B5E3C", font: { size: 11 } },
          },
          yRight: {
            type: "linear",
            position: "right",
            min: 0,
            max: 5,
            ticks: { callback: (v) => `${v.toFixed(1)}M`, color: "#8a6d2e", font: { size: 11 } },
            grid: { drawOnChartArea: false },
            title: { display: true, text: "Visitors", color: "#8a6d2e", font: { size: 11 } },
          },
        },
      },
      plugins: [annotationPlugin],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>Marketing Spend Up, Visitor Numbers Flat</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ position: "relative", height: 320 }}>
          <canvas ref={canvasRef} id="chart-marketing-vs-visitors" aria-label="Dual-axis line chart of Visit Napa Valley budget and annual visitor counts, 2010 to 2026" role="img" />
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-1_napa-marketing-machine-2026_nvf.png", "Marketing spend up, visitor numbers flat")} />
      <Caption
        title="Marketing spend up, visitor numbers flat"
        description={"Visit Napa Valley’s annual budget has grown roughly 1,500% since 2010, reaching $9.3 million in fiscal 2026. Over the same period, total annual visitors to the Napa Valley peaked in 2018 at 3.85 million, fell during the pandemic and recovered to 3.7 million in 2023 — still below the 2018 peak despite continued marketing growth. Visit Napa Valley’s own forecast for 2026 projects a 0.3% occupancy decline."}
        sources={[
          { label: "Visit Napa Valley TID Management District Plan", url: "https://assets.simpleviewinc.com/simpleview/image/upload/v1/clients/napavalley/MDP_FINAL_DRAFT_6_05_24_1__e216d043-4f5c-44a1-991e-d12527659a8a.pdf" },
          { label: "Visit Napa Valley 2018 and 2023 Visitor Profile and Economic Impact Studies", url: "https://www.visitnapavalley.com/about-us/research/" },
          { label: "Press Democrat (Oct. 2, 2025)", url: "https://www.pressdemocrat.com/2025/10/02/visit-napa-valleys-annual-conference-reveals-challenges-opportunities/" },
        ]}
      />
    </div>
  );
}

// ── CHART TWO — License vs Production density (stacked horizontal) ─
function ChartTwo() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const inlineLabels = {
      id: "ct2_inline_labels",
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const napaMeta = chart.getDatasetMeta(0);
        if (!napaMeta || !napaMeta.data.length) return;
        ctx.save();
        ctx.font = "600 12px 'Source Sans 3', sans-serif";
        ctx.fillStyle = "#2C1810";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const labels = ["Napa: 28%", "Napa: 4%"];
        napaMeta.data.forEach((bar, i) => {
          const xLeft = bar.base + 8;
          ctx.fillText(labels[i], xLeft, bar.y);
        });
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Type 02 winery licenses", "Wine production by volume"],
        datasets: [
          {
            label: "Napa",
            data: [28, 4],
            backgroundColor: "#C4A050",
            borderRadius: 2,
            stack: "ca",
          },
          {
            label: "Rest of California",
            data: [72, 96],
            backgroundColor: "#8B7355",
            borderRadius: 2,
            stack: "ca",
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 14, color: T.ink, font: { size: 12 } } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.x}%` } },
        },
        scales: {
          x: {
            stacked: true,
            min: 0,
            max: 100,
            ticks: { callback: (v) => `${v}%`, color: T.muted, font: { size: 11 } },
            grid: { color: T.rule },
          },
          y: {
            stacked: true,
            ticks: { color: T.ink, font: { size: 13, weight: "bold" } },
            grid: { display: false },
          },
        },
      },
      plugins: [inlineLabels],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>Marketing Voice vs. Production Reality</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ position: "relative", height: 220 }}>
          <canvas ref={canvasRef} id="chart-license-vs-production" aria-label="Stacked horizontal bar chart comparing Napa share of California Type 02 winery licenses (28%) versus wine production volume (4%)" role="img" />
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-2_napa-marketing-machine-2026_nvf.png", "Marketing voice vs. production reality")} />
      <Caption
        title="Marketing voice vs. production reality"
        description={"Napa County holds roughly 28% of California’s Type 02 winery licenses while producing roughly 4% of the state’s wine. Type 02 license counts (1,853 in Napa, 6,663 statewide) are tracked weekly on the NapaServe dashboard. Marketing infrastructure measured by license density runs roughly 70 times denser per gallon than the rest of California."}
        sources={[
          { label: "California Department of Alcoholic Beverage Control", url: "https://www.abc.ca.gov/licensing/license-types/" },
          { label: "CDFA grape crush reports", url: "https://www.nass.usda.gov/Statistics_by_State/California/Publications/Specialty_and_Other_Releases/Grapes/Crush/Final/" },
        ]}
      />
    </div>
  );
}

// ── CHART THREE — Marketing Spend Curve, 2005–2026 (vertical bar) ──
function ChartThree() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = [];
    const data = [];
    const seriesValues = {
      2005:50, 2006:55, 2007:65, 2008:70, 2009:70, 2010:80, 2011:95, 2012:110,
      2013:130, 2014:145, 2015:160, 2016:175, 2017:185, 2018:195, 2019:210,
      2020:140, 2021:175, 2022:205, 2023:220, 2024:230, 2025:235, 2026:240,
    };
    Object.keys(seriesValues).forEach((y) => { labels.push(parseInt(y, 10)); data.push(seriesValues[y]); });
    const colors = labels.map((y) => (y === 2020 ? "#8B7355" : "#C4A050"));

    const annotationPlugin = {
      id: "ct3_annotations",
      afterDatasetsDraw(chart) {
        const { ctx, chartArea } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta || !meta.data.length) return;
        ctx.save();

        // "TID launches" above 2010 (index 5)
        const idx2010 = labels.indexOf(2010);
        const bar2010 = meta.data[idx2010];
        if (bar2010) {
          ctx.font = "11px 'Source Sans 3', sans-serif";
          ctx.fillStyle = T.ink;
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText("TID launches", bar2010.x, bar2010.y - 6);
        }

        // "Pandemic" above 2020 (index 15)
        const idx2020 = labels.indexOf(2020);
        const bar2020 = meta.data[idx2020];
        if (bar2020) {
          ctx.font = "11px 'Source Sans 3', sans-serif";
          ctx.fillStyle = "#5F5E5A";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText("Pandemic", bar2020.x, bar2020.y - 6);
        }

        // Boxed callout top-right — "Cumulative 2005–2026 / ~$3.2 billion"
        const padX = 10;
        const padY = 8;
        const lineGap = 6;
        ctx.font = "11px 'Source Sans 3', sans-serif";
        const line1 = "Cumulative 2005–2026";
        const line1W = ctx.measureText(line1).width;
        ctx.font = "500 18px 'Libre Baskerville', Georgia, serif";
        const line2 = "~$3.2 billion";
        const line2W = ctx.measureText(line2).width;
        const boxW = Math.max(line1W, line2W) + padX * 2;
        const boxH = 11 + lineGap + 18 + padY * 2;
        const boxX = chartArea.right - boxW - 14;
        const boxY = chartArea.top + 10;
        const radius = 6;

        ctx.fillStyle = "#FAEEDA";
        ctx.strokeStyle = "#8B5E3C";
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(boxX + radius, boxY);
        ctx.lineTo(boxX + boxW - radius, boxY);
        ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + radius);
        ctx.lineTo(boxX + boxW, boxY + boxH - radius);
        ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - radius, boxY + boxH);
        ctx.lineTo(boxX + radius, boxY + boxH);
        ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - radius);
        ctx.lineTo(boxX, boxY + radius);
        ctx.quadraticCurveTo(boxX, boxY, boxX + radius, boxY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.font = "11px 'Source Sans 3', sans-serif";
        ctx.fillStyle = T.muted;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(line1, boxX + boxW / 2, boxY + padY);

        ctx.font = "500 18px 'Libre Baskerville', Georgia, serif";
        ctx.fillStyle = T.ink;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(line2, boxX + boxW / 2, boxY + padY + 11 + lineGap);

        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
      type: "bar",
      data: {
        labels: labels.map(String),
        datasets: [{
          data,
          backgroundColor: colors,
          borderRadius: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `$${ctx.parsed.y}M` } },
        },
        scales: {
          x: {
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              color: T.muted,
              font: { size: 11 },
              callback(value) {
                const yr = parseInt(this.getLabelForValue(value), 10);
                if (yr === 2026) return "2026";
                return yr % 2 === 1 ? String(yr) : "";
              },
            },
            grid: { display: false },
          },
          y: {
            min: 0,
            max: 300,
            ticks: { callback: (v) => `$${v}M`, color: T.muted, font: { size: 11 } },
            grid: { color: T.rule },
          },
        },
      },
      plugins: [annotationPlugin],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>Two Decades of Marketing Spend</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 640, position: "relative", height: 320 }}>
            <canvas ref={canvasRef} id="chart-marketing-spend-curve" aria-label="Vertical bar chart of estimated annual Napa Valley marketing spend, 2005 through 2026, with cumulative figure of approximately $3.2 billion" role="img" />
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-3_napa-marketing-machine-2026_nvf.png", "Two decades of Napa Valley marketing spend")} />
      <p style={{ fontFamily: font, fontSize: 11, color: T.muted, marginTop: 6 }}>
        Mobile users: scroll horizontally to view full chart.
      </p>
      <Caption
        title="Two decades of marketing spend"
        description={"Estimated annual marketing spend by Napa Valley’s wine and hospitality industries combined — Visit Napa Valley, Napa Valley Vintners, the Grapegrowers and Farm Bureau, the city visitor bureaus, individual winery hospitality and direct-to-consumer programs and lodging and restaurant marketing. Mid-range estimate scaled to the documented 1,500% growth in Visit Napa Valley’s TID assessment between 2010 and 2026 and to industry standards for premium-winery marketing. Cumulative 2005–2026 mid-range: roughly $3.2 billion. Methodology and per-year values are documented at napaserve.org."}
        sources={[
          { label: "Visit Napa Valley TID Management District Plan", url: "https://assets.simpleviewinc.com/simpleview/image/upload/v1/clients/napavalley/MDP_FINAL_DRAFT_6_05_24_1__e216d043-4f5c-44a1-991e-d12527659a8a.pdf" },
          { label: "Napa Valley Vintners IRS Form 990 filings", url: "https://projects.propublica.org/nonprofits/organizations/680513983" },
          { label: "California ABC", url: "https://www.abc.ca.gov/licensing/license-types/" },
          { label: "industry analyst estimates", url: null },
        ]}
      />
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────
export default function NapaMarketingMachine() {
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
            This piece examines two decades of escalating marketing spend in Napa Valley {"—"} Visit Napa Valley, Napa Valley Vintners, the Grapegrowers and Farm Bureau, the city visitor bureaus and individual winery hospitality and direct-to-consumer programs. Conservatively, the wine and hospitality industries have spent between $1.3 billion and $2.9 billion marketing Napa Valley over the past 20 years, with a mid-range estimate near $3.2 billion. The annual apparatus today runs above $200 million. The data on what that spending has produced {"—"} visitor count flat since 2018, occupancy below 2019, Napa County population now declining for the first time in this cycle, vineyard contracts walking away, family estates passing to conglomerates, vineyard acres being pulled at scale {"—"} describes a region whose brand has migrated from Bentley scarcity toward Mercedes ubiquity. Mercedes is an excellent vehicle. It does not sell at Bentley cachet.
          </p>
        </div>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION 1 — A REGION BUILT ON SCARCITY                        */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>A Region Built on Scarcity</h2>

        <p style={{ ...P_STYLE, marginBottom: 18 }}>
          <strong>NAPA VALLEY, Calif.</strong> {"—"} There is a way to think about brand equity that takes the shape of a luxury car.
        </p>

        <p style={P_STYLE}>
          Bentley sells <a href="https://www.bentleymotors.com/en/world-of-bentley/news.html" target="_blank" rel="noopener noreferrer" style={LINK}>roughly 10,000 cars a year worldwide</a>. Mercedes-Benz sells <a href="https://group.mercedes-benz.com/investors/key-figures/" target="_blank" rel="noopener noreferrer" style={LINK}>about 2 million</a>. Both companies make excellent vehicles. Both have decades of engineering credibility, deep dealer networks and recognized global names. Only one commands Bentley pricing and cachet. The reason has very little to do with the cars themselves and almost everything to do with what the brand is allowed to mean. Bentley protects its position with discipline {"—"} limited production, controlled distribution, a deliberate refusal to expand the audience past the point where scarcity erodes. Mercedes built a different model. It built reach. It built volume. It built a brand that means affordable luxury, prestige but not rarity. Both strategies are legitimate. Only one supports Bentley brand position.
        </p>

        <p style={P_STYLE}>
          Napa Valley spent the second half of the 20th century building Bentley brand equity. By the early 2000s the region was understood, globally and instinctively, as a place apart {"—"} a small agricultural valley producing rare wine, luxury accommodations and some of the world{"’"}s best restaurants for a small group of people who were in the know and could afford the price. The premium Napa Valley model was built on that perception. Land prices were built on the pricing model. The region{"’"}s economic identity was built on the land prices.
        </p>

        <p style={P_STYLE}>
          In the 20 years since, the wine and hospitality industries have spent in the billions of dollars marketing Napa Valley. The annual apparatus today runs above $200 million. The <a href="https://assets.simpleviewinc.com/simpleview/image/upload/v1/clients/napavalley/MDP_FINAL_DRAFT_6_05_24_1__e216d043-4f5c-44a1-991e-d12527659a8a.pdf" target="_blank" rel="noopener noreferrer" style={LINK}>Tourism Improvement District</a> that funds Visit Napa Valley was renewed last year through 2035, locking in another decade of escalating destination-marketing assessment on every overnight lodging stay in the county. By any measure, the spending has been enormous, sustained and well-executed.
        </p>

        <p style={P_STYLE}>
          The campaigns worked. Visitors came. Hotels were built. Tasting rooms multiplied. Programming diversified. By the metrics each individual campaign was designed to produce, the apparatus has been a success. What the apparatus did not protect {"—"} could not protect, given what it was being asked to do {"—"} was the underlying brand position. Each new campaign expanded the audience. Each expansion diluted the scarcity that supported the original pricing model. Two decades of escalating reach added up to something the apparatus did not intend and may not yet have reckoned with.
        </p>

        <p style={P_STYLE}>
          There is a deeper structural element. Napa Valley was built on the <a href="https://napavalleyfocus.substack.com/p/napa-valley-finds-itself-between" target="_blank" rel="noopener noreferrer" style={LINK}>1968 Agricultural Preserve</a>, which enshrined agriculture as the highest and best use of the land {"—"} a phrase developers most often invoke to argue for the highest land pricing the market will support. Napa County is only 752 square miles, roughly 0.48% of California{"’"}s total area. The county produces about 4% of the state{"’"}s total wine but accounts for <a href="https://www.napaserve.org/dashboard" target="_blank" rel="noopener noreferrer" style={LINK}>roughly 28% of California{"’"}s Type 02 winery licenses</a> and generates <a href="https://napavintners.com/press/presskit/docs/print/NVV-PressKit-Economic_Impact.pdf" target="_blank" rel="noopener noreferrer" style={LINK}>approximately 27% of California{"’"}s wine industry retail value</a>. And this is the rub. Marketing density and pricing density at this asymmetry is the architecture of the premium model itself.
        </p>

        <p style={{ ...P_STYLE, fontStyle: "italic", textAlign: "center", fontSize: "1.1em", margin: "24px 0" }}>
          The Bentley became a Mercedes.
        </p>

        <p style={P_STYLE}>
          This piece is about how that happened, what the spending math actually looks like and what the data now shows about whether the position can be recovered.
        </p>

        <ChartOne />

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION 2 — THE SPENDING, SOURCED AND STACKED                 */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>The Spending, Sourced and Stacked</h2>

        <p style={P_STYLE}>The marketing apparatus has three tiers. Each is independently verifiable. Stacked, they reach into the hundreds of millions of dollars per year.</p>

        <p style={P_STYLE}><strong>Tier 1: Trade and Destination Organizations.</strong> <a href="https://www.pressdemocrat.com/2025/10/02/visit-napa-valleys-annual-conference-reveals-challenges-opportunities/" target="_blank" rel="noopener noreferrer" style={LINK}>Visit Napa Valley{"’"}s fiscal 2026 budget</a> is $9.3 million, up from $9.2 million in fiscal 2025 and $9.0 million in fiscal 2024 {"—"} figures the organization itself disclosed at its September 2025 destination symposium. That is a 1,500% increase from the pre-Tourism Improvement District era of 2010, when the organization operated on under $500,000. The TID assessment, a 2% surcharge on every overnight stay in Napa County, was <a href="https://assets.simpleviewinc.com/simpleview/image/upload/v1/clients/napavalley/MDP_FINAL_DRAFT_6_05_24_1__e216d043-4f5c-44a1-991e-d12527659a8a.pdf" target="_blank" rel="noopener noreferrer" style={LINK}>renewed in 2025</a> for another 10-year term running through 2035. An additional $2 million in annual TID revenue stays with <a href="https://www.cityofnapa.org/1071/Tourism-Improvement-District" target="_blank" rel="noopener noreferrer" style={LINK}>local jurisdictions</a> {"—"} funding the City of Napa{"’"}s DoNapa marketing program, Calistoga{"’"}s destination programming and the marketing operations of Yountville, St. Helena and American Canyon. Total TID-funded marketing: $11.3 million annually.</p>

        <p style={P_STYLE}><a href="https://projects.propublica.org/nonprofits/organizations/680513983" target="_blank" rel="noopener noreferrer" style={LINK}>Napa Valley Vintners</a>, the region{"’"}s wine-industry trade association, files an IRS Form 990 each year showing annual revenue in the high single-digit millions. The Napa Valley Grapegrowers, Winegrowers of Napa County, the Napa County Farm Bureau and Collective Napa Valley each operate their own annual budgets. Combined, the trade-organization layer adds another $10 million to $12 million per year.</p>

        <p style={P_STYLE}>Tier 1 total: roughly $22 million to $23 million annually in trade and destination marketing alone.</p>

        <p style={P_STYLE}><strong>Tier 2: Individual Winery Hospitality and Direct-to-Consumer Marketing.</strong> This is the larger figure and the harder one to pin down precisely. Industry analysts who track winery economics generally describe hospitality, club, paid placement and direct-to-consumer marketing as 8% to 15% of revenue at premium-positioned wineries. The number of active Napa wineries is itself disputed {"—"} the Napa Wine Project identifies more than 800 by name, other industry counts run above 1,000 once virtual brands are included, and many physical wineries operate second and third labels. Using a conservative subset of 500 active tasting-room operators and an average of $150,000 to $500,000 per operator in annual marketing-related spending, the layer runs $75 million to $250 million per year.</p>

        <p style={P_STYLE}><strong>Tier 3: Hospitality, Lodging and Restaurant Marketing.</strong> Napa County has 5,400 hotel rooms, per <a href="https://napavalleyregister.com/news/visit-napa-valley-hotel-lodging-2026/article_b37a8424-1c67-4d92-a1e4-5b6fcab42ded.html" target="_blank" rel="noopener noreferrer" style={LINK}>Visit Napa Valley{"’"}s own reporting</a>. Hotels, resorts and restaurants run their own marketing programs on top of the Tier 1 apparatus they fund through the TID. Conservative estimates put this layer at $30 million to $60 million annually.</p>

        <p style={{ ...P_STYLE, fontWeight: 600 }}>Total annual apparatus, conservatively summed: $127 million to $333 million per year. Mid-range estimate: roughly $240 million.</p>

        <p style={P_STYLE}>Over 20 years, applied with a growth-curve adjustment that reflects the documented 1,500% TID expansion, the cumulative spend reaches between $1.3 billion at the most conservative floor and $2.9 billion at a mid-range estimate. The phrase {"“"}billions of dollars marketing Napa Valley{"”"} survives every assumption tested. Even the most aggressive haircut on the math leaves the cumulative figure above one billion.</p>

        <p style={P_STYLE}>For scale, comparing destination marketing organization to destination marketing organization: Napa{"’"}s Tier 1 trade and DMO spend of roughly $22 million to $23 million annually sits in the same neighborhood as <a href="https://www.visitanaheim.org/about-us/" target="_blank" rel="noopener noreferrer" style={LINK}>Visit Anaheim{"’"}s</a> ~$28 million annual budget for the 1,100-acre Anaheim Resort District anchored by Disneyland. The <a href="https://www.lvcva.com/who-we-are/financial-information/" target="_blank" rel="noopener noreferrer" style={LINK}>Las Vegas Convention and Visitors Authority</a> operates a combined advertising and marketing budget of roughly $145 million annually, with another $70 million for special events {"—"} substantially larger than Napa{"’"}s DMO layer alone, but Las Vegas is a purpose-built destination economy of 41 million annual visitors. What is unusual about Napa is the totality of the apparatus across all three tiers. Including individual winery and hospitality marketing {"—"} spending the LVCVA and Visit Anaheim figures do not include {"—"} Napa{"’"}s full annual marketing apparatus runs at or above the LVCVA{"’"}s destination marketing budget, deployed in support of a 752-square-mile working agricultural region producing 4% of California{"’"}s wine.</p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION 3 — WHY IT GOT THIS BIG                               */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>Why It Got This Big</h2>

        <p style={P_STYLE}>The license-to-production ratio is the structural answer.</p>

        <p style={P_STYLE}>Napa Valley holds <a href="https://www.napaserve.org/dashboard" target="_blank" rel="noopener noreferrer" style={LINK}>roughly 28% of California{"’"}s Type 02 winery licenses</a> {"—"} current ABC data tracked weekly on NapaServe show 1,853 licenses in Napa against 6,663 statewide {"—"} while the county produces roughly 4% of the state{"’"}s wine. California makes about 80% of all U.S. wine. Napa{"’"}s share of total U.S. wine production is therefore around 3%, against a marketing voice that {"—"} measured by license density {"—"} runs many multiples larger. The trend has held for years; this column <a href="https://napavalleyfocus.substack.com/p/under-the-hood-napas-type-02-licenses" target="_blank" rel="noopener noreferrer" style={LINK}>first documented the ratio in detail</a> in February 2024.</p>

        <p style={P_STYLE}>A <a href="https://www.abc.ca.gov/licensing/license-types/" target="_blank" rel="noopener noreferrer" style={LINK}>Type 02 license</a> does not always correspond to a tasting-room winery. It can be attached to a warehouse, a back-office operation, a custom-crush facility or a brand without its own physical site. The <a href="https://www.napawineproject.com/" target="_blank" rel="noopener noreferrer" style={LINK}>Napa Wine Project</a> identifies more than 800 named wineries. Other industry counts run above 1,000 once virtual brands are included. Many physical wineries operate second and third labels. Some Napa-affiliated wines are produced through 50/50 arrangements with brands located in other regions. The definitional ambiguity is real.</p>

        <p style={P_STYLE}>The Type 02 license is the cleanest apples-to-apples comparison instrument because every California region uses the same regulatory category. By that measure, Napa{"’"}s marketing infrastructure per gallon of wine produced is roughly 70 times denser than the rest of California{"’"}s. A region representing 4% of the state{"’"}s wine production carries close to a third of the state{"’"}s winery-marketing voice.</p>

        <p style={P_STYLE}>That density is not an accident. It is the architecture of the premium pricing model. Every Type 02 license is, among other things, a potential marketing channel {"—"} a tasting room, a club, a brand presence. The apparatus exists because the pricing model was built to require it. The pricing model was built to require it because Napa{"’"}s land costs, labor costs and farming costs are themselves built around the assumption that each gallon of wine produced will sell at multiples of the California average.</p>

        <p style={P_STYLE}>For two decades, that arithmetic worked. The marketing produced visitors. The visitors produced revenue. The revenue justified the land prices. The land prices justified more marketing.</p>

        <p style={P_STYLE}>The arithmetic is no longer working in the same way.</p>

        <ChartTwo />

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION 4 — WHO PAYS AND WHO DECIDES                          */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>Who Pays and Who Decides</h2>

        <p style={P_STYLE}>The Tourism Improvement District assessment is paid by every overnight lodging operator in Napa County. A 2% surcharge attaches to every overnight stay {"—"} at the largest luxury resorts at one end of the spectrum, at the family-owned bed and breakfasts at the other. The assessment is not optional. The TID was renewed in 2025 for another 10-year term running through 2035, which means that small inns, mid-size hotels and large luxury resorts will all continue to fund the apparatus for another decade regardless of whether they believe the spending delivers returns proportional to what each pays in.</p>

        <p style={P_STYLE}>Who decides how that money is spent is a different question.</p>

        <p style={P_STYLE}>The <a href="https://www.visitnapavalley.com/about-us/our-board/" target="_blank" rel="noopener noreferrer" style={LINK}>Napa Valley Tourism Corporation</a> is the legal {"“"}owners{"’"} association{"”"} that contracts with Visit Napa Valley to manage TID-funded marketing. Its 14-member board includes 8 lodging-operator seats. Half of those 8 seats are held by representatives of large corporate hospitality groups {"—"} luxury resort general managers and chain-property operators. Two seats are held by mid-size operators. Two are held by smaller independent operators. The remaining 6 board seats are filled by city and county officials. The board chair, in the current fiscal year, comes from the corporate luxury segment.</p>

        <p style={P_STYLE}>The structural arithmetic is the point. Every overnight stay in the county pays the assessment regardless of property size. The board allocating the spending tilts toward the corporate luxury segment by a factor of two-to-one over the smaller independent operators sharing those seats. The smaller operators continue to pay. The strategic direction is set elsewhere.</p>

        <p style={P_STYLE}>This is not a charge of impropriety. It is a description of governance. Tourism Improvement Districts across California operate on similar structures {"—"} established by the larger operators, governed by the larger operators, paid for by everyone in the assessed category. What is worth naming in Napa Valley specifically is the dynamic this creates. The marketing strategy that all operators fund is shaped most heavily by the operators with the most capital, the largest properties and the most direct exposure to the luxury-tier visitor segment. That is also the segment whose own asset base has been most visibly repricing through 2025 and into 2026 {"—"} through foreclosures, lender-driven transactions and family-to-corporate transitions documented in <em><a href="https://napaserve.org/under-the-hood/napa-structural-reset-2026" target="_blank" rel="noopener noreferrer" style={LINK}>{"“"}The Reset Spreads{"”"}</a></em> (April 2026) and on the Regional Contraction Tracker.</p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION 5 — THE LOOP THAT FUNDS ITSELF                        */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>The Loop That Funds Itself</h2>

        <p style={P_STYLE}>The Tourism Improvement District operates as a closed financial loop. Visit Napa Valley{"’"}s budget is funded by the TID assessment, which is a 2% surcharge on every overnight lodging stay in Napa County. The Transient Occupancy Tax {"—"} paid by the same hotel guests, on the same nights, at higher rates {"—"} flows to the city and county general funds and underwrites a meaningful share of municipal budgets. According to Visit Napa Valley{"’"}s own <a href="https://www.visitnapavalley.com/articles/post/2023-visitor-profile-and-economic-impact-study-released/" target="_blank" rel="noopener noreferrer" style={LINK}>2023 economic impact study</a>, TOT receipts now cover 75% of Calistoga{"’"}s general fund, 65% of Yountville{"’"}s, 25% of the City of Napa{"’"}s, 20% of St. Helena{"’"}s and 6% each in American Canyon and unincorporated Napa County.</p>

        <p style={P_STYLE}>Both the TID pool and the TOT pool grow when the same things happen: more hotel rooms get built, more visitors come, more nights get booked, room rates climb. The marketing strategy that produces those outcomes {"—"} broader audience, more festivals, more visitor-volume programming, more rate-driven revenue {"—"} is the strategy that grows the apparatus{"’"}s own budget and the city budgets that depend on it. The board that allocates the marketing spending is dominated by the operators whose properties capture the largest share of the resulting TOT and TID revenue. Their marketing budget has grown 1,500% since 2010.</p>

        <p style={P_STYLE}>Over the same period, by every measure tracked in this column, the indicators of community well-being {"—"} wages, working-age population, family-owned business survival, agricultural worker pathways, hospitality worker pathways, housing affordability {"—"} have stalled or declined. Real Napa County GDP grew 4.6% across the eight-year period when nominal GDP grew 35.8%, as documented in <em><a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-valleys-economy" target="_blank" rel="noopener noreferrer" style={LINK}>{"“"}Napa{"’"}s Economy Looks Bigger Than It Is{"”"}</a></em> (March 2026). Hospitality employment has been roughly flat since 2019 against a prior trend that would have produced 4,800 more jobs today. The county{"’"}s working-age population is shrinking. The community-health metrics and the apparatus-growth metrics are not connected to the same feedback loop.</p>

        <p style={P_STYLE}>This is the structural problem at the center of the piece. The apparatus is incentivized to keep doing more of the same because more of the same is what grows its own budget and the public budgets that depend on it. The community indicators that would justify a different strategy are not on the apparatus{"’"}s own scorecard. There is no mechanism inside the loop that asks whether the spending is producing the outcomes the community needs {"—"} only whether it is producing the outcomes the loop measures.</p>

        <p style={P_STYLE}>A local news organization is well-positioned to ask the questions the loop does not. We are watching closely.</p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION 6 — THE ASSET BASE IS CONTRACTING UNDERNEATH          */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>The Asset Base Is Contracting Underneath</h2>

        <p style={P_STYLE}>While the marketing apparatus has been accelerating, the asset base it was built to defend has been contracting.</p>

        <p style={P_STYLE}>The <a href="https://napaserve.org/calculators" target="_blank" rel="noopener noreferrer" style={LINK}>Regional Contraction Tracker</a> on NapaServe now logs more than a dozen entries since late 2025. <a href="https://napavalleyregister.com/news/napa-hotel-foreclosure-stanly-ranch-auberge-group/article_af89ef60-2410-4a75-9338-20c9baaf707e.html" target="_blank" rel="noopener noreferrer" style={LINK}>Stanly Ranch{"’"}s foreclosure sale</a> at a discount to its debt. Charlie Palmer Steak{"’"}s closure at the Archer Hotel Napa. <a href="https://www.pressdemocrat.com/2026/02/18/gallo-napa-ranch-winery-closure-j-sonoma-martini-orin-swift-layoffs/" target="_blank" rel="noopener noreferrer" style={LINK}>Gallo{"’"}s Ranch Winery</a> in St. Helena and the 93 layoffs across five North Coast sites. The <a href="https://www.sfchronicle.com/food/wine/article/cain-vineyards-winery-spring-mountain-22094636.php" target="_blank" rel="noopener noreferrer" style={LINK}>Cain Vineyards split-asset transaction</a> on Spring Mountain. <a href="https://www.sfchronicle.com/food/wine/article/trinchero-buys-mumm-napa-21245989.php" target="_blank" rel="noopener noreferrer" style={LINK}>Mumm Napa{"’"}s sale</a> by Pernod Ricard to Trinchero. JCB Yountville. Benessere Vineyards headed to a May 2026 auction at roughly a third of its original asking price. Each entry is sourced. Each was reported in this column individually. The roll-call is the point. The operating footprint is visibly contracting.</p>

        <p style={P_STYLE}>A second pattern is visible alongside the closures. The Rudd Estate transaction in April 2026 moved an Oakville property from family ownership {"—"} the Rudd family bought the property in 1996 {"—"} into the portfolio of St. Sup{"é"}ry, which has been owned by Chanel since 2015. The acquisition extended Chanel{"’"}s Napa footprint to three properties spanning Rutherford, Dollarhide and Oakville. Family-to-corporate transitions are not new in Napa, but the rate has accelerated. Mumm Napa{"’"}s sale by Pernod Ricard to Trinchero, the lender-driven Spring Mountain transition, the Boisset consolidation out of Yountville and the Cain split-asset deal each represent a different mechanism. Together they describe a structural shift in who owns the valley.</p>

        <p style={P_STYLE}>The marketing apparatus that defends {"“"}Napa Valley{"”"} as a category was built around a particular ownership story. The ownership story is changing.</p>

        <p style={P_STYLE}>The contraction is not limited to assets above ground. Statewide, <a href="https://www.pressdemocrat.com/2025/11/10/california-grape-pull-vineyards-removed/" target="_blank" rel="noopener noreferrer" style={LINK}>California growers have removed roughly 38,000 acres</a> of vineyard over the past two years, with industry analysts saying another 40,000 acres still need to come out before supply matches what consumers actually buy. On the North Coast, the documented removals so far are concentrated: 3,117 acres in Napa, 2,711 in Sonoma, 832 in Mendocino and 777 in Lake. In Napa County alone, an estimated 8,000 acres {"—"} roughly 20% of the county{"’"}s vineyard land {"—"} went unharvested in 2025, as documented in <em><a href="https://napavalleyfocus.substack.com/p/under-the-hood-the-dismal-math-of" target="_blank" rel="noopener noreferrer" style={LINK}>{"“"}The Dismal Math of Napa{"’"}s Unharvested Acres{"”"}</a></em> (November 2025).</p>

        <p style={P_STYLE}>The contract market underneath those numbers is moving faster than the published data shows. A NorCal-based commercial banker active in agricultural lending told this column that vineyards without grape contracts cannot now find buyers even at a 70% discount to recent valuations. A Napa grower said more than 60% of his contracts have been canceled or walked away from in the past two years {"—"} two of those in the past week alone. One buyer offered to take the grapes but admitted uncertainty about ever paying for them. The grower released the buyer from the contract. The same banker projects that 40% to 60% of Northern California vineyard owners may face serious financial distress within 24 months.</p>

        <p style={P_STYLE}>This is the contract renegotiation cliff this column flagged in <em><a href="https://napavalleyfocus.substack.com/p/under-the-hood-the-rising-cost-of" target="_blank" rel="noopener noreferrer" style={LINK}>{"“"}Under the Hood: How Politics is Reshaping the Economy{"”"}</a></em> (February 2025) and again in <em><a href="https://napavalleyfocus.substack.com/p/special-report-california-wine-production" target="_blank" rel="noopener noreferrer" style={LINK}>{"“"}Special Report: California Wine Production Plummets {"—"} Lowest Since 1999{"”"}</a></em> (September 2025), when a Napa grower predicted that legacy evergreen contracts would expire across 2025 and 2026 and {"“"}we could see a real correction in pricing.{"”"} The correction is here.</p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION 7 — TWO FRAMES, TWO CONCLUSIONS                       */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>Two Frames, Two Conclusions</h2>

        <p style={P_STYLE}>The campaign rotation is observable.</p>

        <p style={P_STYLE}>In the early 2000s, Napa marketing emphasized luxury and Cabernet Sauvignon. The positioning was disciplined. The audience was narrow by design. The pricing supported it. By the mid-2010s, Visit Napa Valley and partners had pivoted toward inclusivity and {"“"}Napa for Everyone.{"”"} The wellness and culinary push followed. <a href="https://www.bottlerocknapavalley.com/" target="_blank" rel="noopener noreferrer" style={LINK}>BottleRock</a> launched at the Napa Valley Expo in 2013 and grew into a Memorial Day festival drawing 100,000-plus attendees. Then Live in the Vineyard, La Calenda, a rotating slate of programmed events. Auction Napa Valley was relaunched as Premiere Napa Valley in 2020. Business travel and convention marketing intensified between 2022 and 2024.</p>

        <p style={P_STYLE}>In 2026, the rotation continues. La Calenda is not happening this year. BottleRock returns May 22 to 24. A new multiday rock festival <a href="https://www.pressdemocrat.com/2025/11/06/calistoga-multiday-music-festival-fairgrounds/" target="_blank" rel="noopener noreferrer" style={LINK}>launches at the Calistoga Fairgrounds</a> in October under a five-year exclusive license between the City of Calistoga and a local promoter.</p>

        <p style={P_STYLE}>{"“"}BottleRock didn{"’"}t happen overnight,{"”"} the Calistoga organizer told the City Council in November 2025, asking for a five-year commitment to give the new festival time to grow. The number of resorts has expanded. The number of corporate wineries has expanded. The number of marketers and messages has expanded.</p>

        <p style={P_STYLE}>That sentence describes the apparatus{"’"}s pattern in compressed form. Each new instrument is broader in audience appeal than the one before it. Each broadening was, in its individual context, the goal.</p>

        <p style={P_STYLE}>The campaigns are not failures. They are successes at the level of their individual mandates. The aggregate effect is the trade of scarcity for reach. Bentley does not sell to every customer who can afford a luxury car. It sells to a tightly defined subset and protects that subset with discipline. Napa, through 20 years of incremental campaign decisions each of which made local sense, sold to everyone the apparatus could reach. The volume came. The premium that volume was supposed to support did not survive the volume.</p>

        <p style={P_STYLE}>This brings the apparatus to a measurement question.</p>

        <h3 style={SECTION_H3}>The Apparatus Frame</h3>

        <p style={P_STYLE}>At the September 2025 <a href="https://www.visitnapavalley.com/articles/post/visit-napa-valley-2025-destination-symposium-highlights-tourisms-role-as-an-economic-driver/" target="_blank" rel="noopener noreferrer" style={LINK}>destination symposium</a> where Visit Napa Valley disclosed its $9.3 million fiscal 2026 budget, the organization presented a paid-media performance figure. The prior year{"’"}s {"“"}Cheers to the Good Life{"”"} campaign had, by Visit Napa Valley{"’"}s own measurement, influenced nearly $800 million in visitor spending. The reported return on advertising spend was $620 for every $1 invested in paid media.</p>

        <p style={P_STYLE}>That is the first frame. Inside it {"—"} call it the Apparatus Frame {"—"} the metrics the apparatus selects for itself say the apparatus is performing. Visitor spending is influenced. Return on ad spend is high. The recommended response, inside this frame, is to spend more.</p>

        <h3 style={SECTION_H3}>The Community Frame</h3>

        <p style={P_STYLE}>There is a second frame. Inside it {"—"} call it the Community Frame {"—"} the question is not how much visitor spending a campaign influenced. It is whether the conditions the apparatus was built to operate in still hold, and whether the people who live and work in Napa County are seeing those conditions in their own lives. The publicly available data on those conditions is consistent.</p>

        <p style={P_STYLE}><strong>Wine consumption is declining.</strong> <a href="https://www.svb.com/trends-insights/reports/wine-report/" target="_blank" rel="noopener noreferrer" style={LINK}>U.S. per-capita wine consumption has fallen for several consecutive years</a>. The generations that built the modern wine market are aging out of peak consumption. Younger consumers drink less wine than their parents and report different attitudes toward alcohol generally. Per-capita and total wine consumption are now declining together for the first time in modern history, ending the demographic cushion that once allowed producers to absorb soft years without structural damage.</p>

        <p style={P_STYLE}><strong>Search interest in {"“"}Napa Valley{"”"} has fallen for two decades.</strong> <a href="https://trends.google.com/trends/explore?date=all&geo=US&q=napa%20valley" target="_blank" rel="noopener noreferrer" style={LINK}>U.S. Google Trends interest</a> stood at roughly 33 in early 2025 against a 2005 peak of 100. Global interest stood at 25 against a 2004 peak. The decline has been steady across the entire period during which marketing spend climbed. This column documented the trend in <em><a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-valleys-economic" target="_blank" rel="noopener noreferrer" style={LINK}>{"“"}Under the Hood: Napa Valley{"’"}s Economic Reckoning{"”"}</a></em> (January 2025).</p>

        <p style={P_STYLE}><strong>Disposable income for discretionary travel has tightened.</strong> Cumulative inflation since 2019 has reduced household purchasing power across Napa{"’"}s primary visitor source markets. Travel-related costs {"—"} fuel, airfare, lodging {"—"} have risen faster than overall inflation in several of those years, as documented in <em><a href="https://napavalleyfocus.substack.com/p/under-the-hood-discretionary-income" target="_blank" rel="noopener noreferrer" style={LINK}>{"“"}Under the Hood: Discretionary Income{"”"}</a></em>. Source: <a href="https://www.bls.gov/cpi/" target="_blank" rel="noopener noreferrer" style={LINK}>Bureau of Labor Statistics CPI</a>; <a href="https://www.eia.gov/petroleum/gasdiesel/" target="_blank" rel="noopener noreferrer" style={LINK}>U.S. Energy Information Administration</a> retail gasoline data.</p>

        <p style={P_STYLE}><strong>The Napa visitor base has shifted downmarket on Visit Napa Valley{"’"}s own measure.</strong> Average visitor age fell from 46 in 2018 to 40 in 2023. Mean visitor household income now stands at $170,000, against a prior luxury-traveler core that exceeded $250,000. Source: <a href="https://www.visitnapavalley.com/articles/post/2023-visitor-profile-and-economic-impact-study-released/" target="_blank" rel="noopener noreferrer" style={LINK}>Visit Napa Valley 2023 Visitor Profile and Economic Impact Study</a>.</p>

        <p style={P_STYLE}><strong>Visitor count has not recovered to 2018 levels.</strong> Napa Valley welcomed 3.85 million visitors in 2018 and 3.7 million in 2023, even as marketing spend continued to climb. Visit Napa Valley{"’"}s own outlook for 2026 projects a 0.3% occupancy decline. Source: <a href="https://www.visitnapavalley.com/about-us/research/" target="_blank" rel="noopener noreferrer" style={LINK}>Visit Napa Valley 2018 and 2023 Visitor Profile and Economic Impact Studies</a>; STR Monthly Industry Report.</p>

        <p style={P_STYLE}><strong>The county{"’"}s population continues to shrink while it ages.</strong> The California Department of Finance{"’"}s <a href="https://dof.ca.gov/forecasting/demographics/estimates-e1/" target="_blank" rel="noopener noreferrer" style={LINK}>E-1 estimates released May 1, 2026</a> show Napa County{"’"}s population at 136,374 as of January 1, 2026 {"—"} down 246 residents from the prior year, the county{"’"}s first measured decline in this cycle. Yountville, the county{"’"}s most hospitality-dependent town, lost 1.9% of its population in a single year. California as a whole declined 0.14%, also a first-in-cycle reversal.</p>

        <p style={P_STYLE}><strong>Local employment has stalled.</strong> Napa County leisure and hospitality employment stood at roughly 14,100 in 2025. The 2009-to-2019 trend, projected forward, would have produced roughly 18,900 jobs today. Gap: about 4,800 jobs, as documented in <em><a href="https://napavalleyfocus.substack.com/p/under-the-hood-march-8" target="_blank" rel="noopener noreferrer" style={LINK}>{"“"}Under the Hood: Rising Property Values, Shrinking Jobs in Napa County{"”"}</a></em> (March 2025). Source: <a href="https://fred.stlouisfed.org/series/NAPA906LEIHN" target="_blank" rel="noopener noreferrer" style={LINK}>Bureau of Labor Statistics, NAPA906LEIHN</a>.</p>

        <p style={P_STYLE}><strong>The county economy has grown nominally, not in real terms.</strong> Of the $3.84 billion in nominal Napa County GDP growth between 2016 and 2024, 87 cents of every dollar was inflation. Real output grew 4.6% over the eight-year period, as documented in <em><a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-valleys-economy" target="_blank" rel="noopener noreferrer" style={LINK}>{"“"}Napa{"’"}s Economy Looks Bigger Than It Is{"”"}</a></em> (March 2026). Source: Bureau of Economic Analysis via FRED, <a href="https://fred.stlouisfed.org/series/GDPALL06055" target="_blank" rel="noopener noreferrer" style={LINK}>GDPALL06055</a> and <a href="https://fred.stlouisfed.org/series/REALGDPALL06055" target="_blank" rel="noopener noreferrer" style={LINK}>REALGDPALL06055</a>.</p>

        <p style={P_STYLE}><strong>Family-owned wineries and vineyards are transitioning to corporate ownership at an accelerating rate.</strong> Cain Vineyards, Mumm Napa, Spring Mountain Vineyard, Rudd Estate and the Boisset Yountville consolidation each represent a different mechanism since late 2025. Source: <em><a href="https://napaserve.org/under-the-hood/napa-structural-reset-2026" target="_blank" rel="noopener noreferrer" style={LINK}>{"“"}The Reset Spreads{"”"}</a></em> (April 2026); <a href="https://napaserve.org/calculators" target="_blank" rel="noopener noreferrer" style={LINK}>Regional Contraction Tracker</a>.</p>

        <p style={P_STYLE}><strong>Vineyard land is being pulled at a pace not seen in modern industry memory.</strong> California growers removed roughly 38,000 acres in the 12 months ending August 2025, including 3,117 in Napa. An estimated 8,000 Napa acres {"—"} roughly 20% of county vineyard acreage {"—"} went unharvested in 2025. Source: <a href="https://cawg.org/" target="_blank" rel="noopener noreferrer" style={LINK}>California Association of Winegrape Growers</a>; Allied Grape Growers; <em><a href="https://napavalleyfocus.substack.com/p/under-the-hood-the-dismal-math-of" target="_blank" rel="noopener noreferrer" style={LINK}>{"“"}The Dismal Math of Napa{"’"}s Unharvested Acres{"”"}</a></em> (November 2025).</p>

        <p style={P_STYLE}>The two frames produce different conclusions about the same period. Inside the Apparatus Frame, the marketing apparatus is performing and the recommendation is to grow it. Inside the Community Frame, the conditions the apparatus was built to operate in are moving in the opposite direction. The local indicators that measure community well-being are moving in the same direction as the Community Frame: working-age population is shrinking, wages have not kept pace with cost of living, family-owned businesses are transitioning out of family ownership and the agricultural and hospitality workers whose labor underpins the visitor economy are finding fewer paths into higher-wage employment.</p>

        <p style={P_STYLE}>Both frames are reasonable measurements of different things. The question is which frame is being used to make decisions about whether to continue growing the apparatus, and which frame is being used to evaluate whether the community that pays for the apparatus is being well-served by it.</p>

        <p style={P_STYLE}>The <a href="https://napaserve.org/calculators" target="_blank" rel="noopener noreferrer" style={LINK}>Regional Contraction Tracker</a> at napaserve.org documents the Community Frame as it develops. Each new entry adds to the record.</p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION 8 — WHAT THE MATH SAYS                                */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>What the Math Says</h2>

        <p style={P_STYLE}>The brand erosion has a direct cost, and the cost is measurable.</p>

        <p style={P_STYLE}>The <a href="https://napaserve.org/calculators" target="_blank" rel="noopener noreferrer" style={LINK}>Vineyard Acre Impact Calculator</a> on NapaServe was originally built for <em><a href="https://napavalleyfocus.substack.com/p/under-the-hood-the-dismal-math-of" target="_blank" rel="noopener noreferrer" style={LINK}>{"“"}The Dismal Math of Napa{"’"}s Unharvested Acres{"”"}</a></em> (November 2025). The calculator applies a 10.3{"×"} multiplier from grape net revenue to total local economic output, drawn from the Insel & Company economic impact study commissioned by Napa Valley Vintners. The multiplier captures the cascade from grape revenue through wineries, suppliers, hospitality, household spending and local taxes.</p>

        <p style={P_STYLE}>Plug in the 3,117 acres CAWG documented as removed in Napa County between October 2024 and August 2025. Hold the moderate 50% pass-through scenario. The five-year community-wide impact is approximately $1.6 billion. The annual run-rate is approximately $320 million. Even at the conservative 25% pass-through scenario, the annual community impact runs above $160 million.</p>

        <p style={P_STYLE}>Add the 8,000 acres Napa Valley left unharvested in 2025. Even at the conservative scenario, the combined community impact runs above $1.2 billion over five years.</p>

        <p style={P_STYLE}>The annual apparatus arrayed to defend Napa{"’"}s brand position runs around $240 million at the mid-range estimate. The annual community-wide loss from documented vineyard removals alone runs roughly 1.3 times that figure at the moderate scenario, and roughly 70% of it at the conservative scenario. Either way, the apparatus is structurally outmatched by the contraction it is being asked to defend.</p>

        <p style={P_STYLE}>Readers can run their own assumptions at <a href="https://napaserve.org/calculators" target="_blank" rel="noopener noreferrer" style={LINK}>napaserve.org/calculators</a>.</p>

        <ChartThree />

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION 9 — WHAT THIS ALL MEANS                               */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>What This All Means</h2>

        <p style={P_STYLE}>Napa Valley is at a point where it is behaving as if it can market and build its way out of the current challenges. The data suggest that the headwinds it faces are not optional. They are structural. Wine consumption is declining across generations. The county{"’"}s visitor count has not recovered to 2018 levels despite continued marketing growth. The county{"’"}s population is shrinking. The asset base that supports the premium model is contracting through closures, foreclosures, family-to-corporate transitions and vineyard removals at a pace not seen in modern industry memory.</p>

        <p style={P_STYLE}>The potential problem is that spending more in one direction precludes spending in another. And it is the other {"—"} better-wage jobs, a diversified economy, young families with paths to stay, elder care, improved environmental stewardship, agricultural and hospitality workers with real wage trajectories {"—"} that on the one hand seems on the opposite end of the spectrum from where the apparatus has been pointed for two decades. In reality, the other may be the future{"’"}s saving bet.</p>

        <p style={P_STYLE}>The Napa Valley brand was once positioned where Bentley sits. It now sits closer to where Mercedes does. Mercedes is an excellent vehicle. It does not sell at Bentley cachet. The work ahead is to ask better questions for today{"’"}s world. Whether the region{"’"}s institutions, the operators who fund them and the community whose well-being underwrites the entire apparatus can together build a different frame for measuring success {"—"} one in which the people, the place and the future do both the measuring and the evaluation, not the campaigns.</p>

        <p style={P_STYLE}>There are millions being spent each year to market Napa Valley. The honest question is who those millions benefit. If wages are declining, jobs are stalled, the population is shrinking, costs are increasing and the world is increasingly seeing Napa Valley as one place among many, the case that spending more on the same approach will produce different outcomes is harder to make every year. The data has been pointing somewhere else for a long time. The question is whether anyone with the authority to redirect the spending is ready to pursue a new direction.</p>

        {/* ── BYLINE (italic) ─────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.ink, fontStyle: "italic", lineHeight: 1.65, margin: "32px 0 0 0" }}>
          Tim Carl is a Napa Valley{"–"}based photojournalist and the founder and editor of Napa Valley Features, Sonoma County Features and Lake County Features.
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
              <a href="https://napaserve.org/under-the-hood/napa-lodging-pricing-2026" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Napa Valley Adds Rooms While Demand Lags{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (April 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napaserve.org/under-the-hood/napa-constellation-2026" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Where Is Napa in the Five Stages of Grief?{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (April 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napaserve.org/under-the-hood/napa-structural-reset-2026" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}The Reset Spreads{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (April 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napaserve.org/under-the-hood/napa-gdp-2024" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Napa{"’"}s Economy Looks Bigger Than It Is{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (March 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-the-dismal-math-of" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: The Dismal Math of Napa{"’"}s Unharvested Acres{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (November 2025)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-has-equaled" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: More Rooms Has Equaled Fewer Jobs in Napa County{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (August 2025)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-valleys-economic" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Napa Valley{"’"}s Economic Reckoning{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (January 2025)</span>
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
              placeholder="Search marketing, TID, brand erosion, apparatus..."
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
            The Insel & Company multiplier (10.3{"×"}) used in the Vineyard Acre Impact Calculator captures the cascade from grape revenue through wineries, suppliers, tourism and household spending. Pass-through scenarios (25%, 50%, 100%) reflect how much of the per-acre lost economic activity remains in Napa County versus leaks out through non-local supply chains. Cumulative 20-year marketing spend estimates assume a roughly 60% average across the 2005{"–"}2025 window, derived from the documented 1,500% growth in Visit Napa Valley{"’"}s TID assessment over the same period. The Chart 3 cumulative figure of approximately $3.2 billion reflects mid-range annual estimates summed across 2005 to 2026; conservative-floor and high-end variants of the same calculation produce cumulative values from $1.3 billion to $4.6 billion. Type 02 license counts (1,853 in Napa, 6,663 statewide) are tracked weekly on the NapaServe dashboard, drawn from California ABC public records. Visitor count data are drawn from Visit Napa Valley{"’"}s published 2018 and 2023 Visitor Profile and Economic Impact Studies; intermediate years are estimated based on STR occupancy data and recovery patterns. Off-record sources cited in this piece are individuals known to Napa Valley Features and verified by the publication. Their identities are protected because of the financial sensitivity of the information they provided.
          </p>
        </div>

        {/* ── SOURCES ─────────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 40, paddingTop: 24 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: T.ink, marginBottom: 16 }}>Sources</h2>
          <ol style={{ fontFamily: font, fontSize: 14, color: T.ink, lineHeight: 1.75, paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>Press Democrat, {"“"}<a href="https://www.pressdemocrat.com/2025/10/02/visit-napa-valleys-annual-conference-reveals-challenges-opportunities/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Visit Napa Valley{"’"}s annual conference reveals challenges, opportunities</a>,{"”"} Oct. 2, 2025.</li>
            <li style={{ marginBottom: 8 }}>Visit Napa Valley, <a href="https://assets.simpleviewinc.com/simpleview/image/upload/v1/clients/napavalley/MDP_FINAL_DRAFT_6_05_24_1__e216d043-4f5c-44a1-991e-d12527659a8a.pdf" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Tourism Improvement District 2025{"–"}2035 Management District Plan</a>.</li>
            <li style={{ marginBottom: 8 }}>Visit Napa Valley, <a href="https://www.visitnapavalley.com/articles/post/visit-napa-valley-2025-destination-symposium-highlights-tourisms-role-as-an-economic-driver/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>2025 Destination Symposium press release</a>.</li>
            <li style={{ marginBottom: 8 }}>Visit Napa Valley, <a href="https://www.visitnapavalley.com/about-us/research/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>2018 Visitor Profile and Economic Impact Study</a>.</li>
            <li style={{ marginBottom: 8 }}>Visit Napa Valley, <a href="https://www.visitnapavalley.com/articles/post/2023-visitor-profile-and-economic-impact-study-released/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>2023 Visitor Profile and Economic Impact Study</a>.</li>
            <li style={{ marginBottom: 8 }}>City of Napa, <a href="https://www.cityofnapa.org/1071/Tourism-Improvement-District" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Tourism Improvement District page</a>.</li>
            <li style={{ marginBottom: 8 }}>Napa Valley Tourism Corporation, <a href="https://www.visitnapavalley.com/about-us/our-board/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Board of Directors</a>.</li>
            <li style={{ marginBottom: 8 }}>ProPublica Nonprofit Explorer, <a href="https://projects.propublica.org/nonprofits/organizations/680513983" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa Valley Vintners IRS Form 990 filings</a>.</li>
            <li style={{ marginBottom: 8 }}>Napa Valley Vintners, <a href="https://napavintners.com/press/presskit/docs/print/NVV-PressKit-Economic_Impact.pdf" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Economic Impact of Napa Valley{"’"}s Wine Industry (Insel & Company)</a>.</li>
            <li style={{ marginBottom: 8 }}>California Department of Alcoholic Beverage Control, <a href="https://www.abc.ca.gov/licensing/license-types/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>License Types</a>.</li>
            <li style={{ marginBottom: 8 }}><a href="https://www.napawineproject.com/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa Wine Project</a>.</li>
            <li style={{ marginBottom: 8 }}>California Department of Finance, <a href="https://dof.ca.gov/forecasting/demographics/estimates-e1/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>E-1 Population Estimates, May 1, 2026</a>.</li>
            <li style={{ marginBottom: 8 }}>Bureau of Labor Statistics, <a href="https://fred.stlouisfed.org/series/NAPA906LEIHN" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa MSA Leisure and Hospitality Employment, NAPA906LEIHN, via FRED</a>.</li>
            <li style={{ marginBottom: 8 }}>Bureau of Economic Analysis, <a href="https://fred.stlouisfed.org/series/REALGDPALL06055" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa County Real GDP, REALGDPALL06055, via FRED</a>.</li>
            <li style={{ marginBottom: 8 }}>Bureau of Economic Analysis, <a href="https://fred.stlouisfed.org/series/GDPALL06055" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa County Nominal GDP, GDPALL06055, via FRED</a>.</li>
            <li style={{ marginBottom: 8 }}>Press Democrat, {"“"}<a href="https://www.pressdemocrat.com/2025/11/10/california-grape-pull-vineyards-removed/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>California{"’"}s grape pull continues; Sonoma vineyards removed</a>,{"”"} Nov. 10, 2025.</li>
            <li style={{ marginBottom: 8 }}>Press Democrat, {"“"}<a href="https://www.pressdemocrat.com/2025/11/06/calistoga-multiday-music-festival-fairgrounds/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Calistoga to host new multiday music festival at fairgrounds</a>,{"”"} Nov. 6, 2025.</li>
            <li style={{ marginBottom: 8 }}>Napa Valley Register, {"“"}<a href="https://napavalleyregister.com/news/napa-hotel-foreclosure-stanly-ranch-auberge-group/article_af89ef60-2410-4a75-9338-20c9baaf707e.html" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Stanly Ranch Napa resort sold for $195M in foreclosure</a>,{"”"} Apr. 1, 2026.</li>
            <li style={{ marginBottom: 8 }}>Press Democrat, {"“"}<a href="https://www.pressdemocrat.com/2026/02/18/gallo-napa-ranch-winery-closure-j-sonoma-martini-orin-swift-layoffs/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Gallo closing Napa Ranch Winery, layoffs</a>,{"”"} Feb. 18, 2026.</li>
            <li style={{ marginBottom: 8 }}>SF Chronicle, {"“"}<a href="https://www.sfchronicle.com/food/wine/article/cain-vineyards-winery-spring-mountain-22094636.php" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa{"’"}s Cain Vineyards & Winery sold to SF firm</a>,{"”"} Apr. 1, 2026.</li>
            <li style={{ marginBottom: 8 }}>SF Chronicle, {"“"}<a href="https://www.sfchronicle.com/food/wine/article/trinchero-buys-mumm-napa-21245989.php" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Trinchero buys Mumm Napa from Pernod Ricard</a>,{"”"} Dec. 16, 2025.</li>
            <li style={{ marginBottom: 8 }}>Napa Valley Register, <a href="https://napavalleyregister.com/news/visit-napa-valley-hotel-lodging-2026/article_b37a8424-1c67-4d92-a1e4-5b6fcab42ded.html" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Visit Napa Valley hotel lodging report</a>.</li>
            <li style={{ marginBottom: 8 }}>Las Vegas Convention and Visitors Authority, <a href="https://www.lvcva.com/who-we-are/financial-information/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Financial Information</a>.</li>
            <li style={{ marginBottom: 8 }}>Visit Anaheim, <a href="https://www.visitanaheim.org/about-us/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>About Us</a>.</li>
            <li style={{ marginBottom: 8 }}>Silicon Valley Bank, <a href="https://www.svb.com/trends-insights/reports/wine-report/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>State of the U.S. Wine Industry 2026 Report</a>.</li>
            <li style={{ marginBottom: 8 }}>Google Trends, <a href="https://trends.google.com/trends/explore?date=all&geo=US&q=napa%20valley" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>search interest for {"“"}Napa Valley,{"”"} 2004{"–"}2026</a>.</li>
            <li style={{ marginBottom: 8 }}>Bureau of Labor Statistics, <a href="https://www.bls.gov/cpi/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>CPI</a>.</li>
            <li style={{ marginBottom: 8 }}>U.S. Energy Information Administration, <a href="https://www.eia.gov/petroleum/gasdiesel/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>retail gasoline data</a>.</li>
            <li style={{ marginBottom: 8 }}><a href="https://cawg.org/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>California Association of Winegrape Growers</a>.</li>
            <li style={{ marginBottom: 8 }}><a href="https://www.bentleymotors.com/en/world-of-bentley/news.html" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Bentley Motors news</a>.</li>
            <li style={{ marginBottom: 8 }}><a href="https://group.mercedes-benz.com/investors/key-figures/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Mercedes-Benz Group, key figures</a>.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/under-the-hood-the-rising-cost-of" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: How Politics is Reshaping the Economy</a>,{"”"} Napa Valley Features, Feb. 22, 2025.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/special-report-california-wine-production" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Special Report: California Wine Production Plummets {"—"} Lowest Since 1999</a>,{"”"} Napa Valley Features, Sept. 29, 2025.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/under-the-hood-the-dismal-math-of" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: The Dismal Math of Napa{"’"}s Unharvested Acres</a>,{"”"} Napa Valley Features, Nov. 29, 2025.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-valleys-economic" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: Napa Valley{"’"}s Economic Reckoning</a>,{"”"} Napa Valley Features, Jan. 25, 2025.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/under-the-hood-discretionary-income" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: Discretionary Income</a>,{"”"} Napa Valley Features.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/under-the-hood-march-8" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: Rising Property Values, Shrinking Jobs in Napa County</a>,{"”"} Napa Valley Features, Mar. 8, 2025.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-valleys-economy" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: Napa{"’"}s Economy Looks Bigger Than It Is</a>,{"”"} Napa Valley Features, Mar. 24, 2026.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/under-the-hood-napas-type-02-licenses" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: Napa{"’"}s Type-02 Licenses Are on the Rise</a>,{"”"} Napa Valley Features, Feb. 24, 2024.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/napa-valley-finds-itself-between" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa Valley finds itself between a rock and a hard place</a>,{"”"} Napa Valley Features, Oct. 3, 2023.</li>
            <li style={{ marginBottom: 8 }}><a href="https://www.bottlerocknapavalley.com/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>BottleRock Napa Valley</a>.</li>
            <li style={{ marginBottom: 8 }}><a href="https://www.napaserve.org/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>NapaServe community intelligence dashboard</a>.</li>
          </ol>
        </div>

      </div>

      <Footer />
    </div>
  );
}

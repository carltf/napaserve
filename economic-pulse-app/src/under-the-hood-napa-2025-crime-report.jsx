// UNDER THE HOOD — Rising Assaults, Revised Numbers in Napa County's 2025 Crime Report
// -----------------------------------------------------------------
// Slug: uth-napa-2025-crime-report
// Publication: Napa Valley Features
// Built from under-the-hood-could-gen-z-save-the-wine-industry.jsx structural
// pattern. Theme 02 Cream tokens, inline styles only.
// Charts: ChartOne (indexed line, Chart.js), ChartTwo (heat map — fresh canvas),
// ChartThree (grouped rape-revision bar, Chart.js), ChartFour (horizontal
// diverging bar — fresh canvas via Chart.js), ChartFive (styled HTML table).
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
const ARTICLE_SLUG = "uth-napa-2025-crime-report";
const ARTICLE_TITLE = "Rising Assaults, Revised Numbers in Napa County’s 2025 Crime Report";
const ARTICLE_PUBLICATION = "Napa Valley Features";
const ARTICLE_DATE = "June 16, 2026";
const SHOW_DECK = false; // DECK PENDING — no deck supplied; render without one.
const EYEBROW = "Under the Hood";

// ── COUNTY + PUBLICATION (template-compat downstream constants) ────
const PUBLICATION = ARTICLE_PUBLICATION;
const SUBSTACK_URL = "https://napavalleyfocus.substack.com/";
const DATELINE_LOCATION = "NAPA COUNTY, Calif.";

// Primary-source URLs (human-readable pages only — Lesson H)
const REPORT_2025_URL = "https://www.napacounty.gov/ArchiveCenter/ViewFile/Item/1151";
const REPORT_2024_URL = "https://www.napacounty.gov/Archive.aspx?ADID=1096";
const PRIOR_ANALYSIS_URL = "https://napavalleyfocus.substack.com/p/under-the-hood-rising-violence-lingering";

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
const LINK = { color: "#1A4F8A" }; // inline body link color (this article)

// per-chart h2 (Lesson N): Libre Baskerville 22px/700 #2C1810, marginTop 0, marginBottom 16
const CHART_H2 = {
  fontFamily: '"Libre Baskerville", Georgia, serif',
  fontSize: "22px",
  fontWeight: 700,
  color: "#2C1810",
  marginTop: 0,
  marginBottom: 16,
};

// table cells (mirrors smoke-taint convention)
const thCell = {
  fontFamily: font, fontSize: 12, fontWeight: 700, color: T.muted,
  textAlign: "left", padding: "8px 10px", borderBottom: `2px solid ${T.border}`,
  verticalAlign: "bottom",
};
const tdCell = {
  fontFamily: font, fontSize: 13, color: T.ink, padding: "8px 10px",
  borderBottom: `1px solid rgba(44,24,16,0.08)`, verticalAlign: "top",
};
const tdNum = { ...tdCell, fontFamily: "monospace", textAlign: "right", whiteSpace: "nowrap" };

// ── CHART PALETTE (this article) ───────────────────────────────────
const C = {
  rose: "#9E5050",      // increase / "up"
  roseLight: "#C99090", // unincorporated, rose
  blue: "#1A4F8A",      // decline / "down" or 2025-report series
  blueLight: "#6B92BD", // unincorporated, blue
  larceny: "#3E7CA0",   // cool tone
  stolen: "#6BA3B8",    // cool tone
  good: "#3C8C5A",      // heat-map low (green)
  ink: "#2C1810",
};

// ── DOWNLOAD HELPER (canonical geometry — Lesson A, LOCKED) ────────
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
// Each title is byte-identical to its chart's <h2> and its PNG download title.
const CAPTIONS = [
  {
    number: 1,
    title: "Violence Up, Property Down",
    description: "Unincorporated Napa County reported offenses, each indexed to its 2023 level; assaults climbed above the 2023 baseline while burglary, larceny and stolen-vehicle reports fell below it.",
    sources: [
      { label: "Napa County Sheriff’s Office 2025 Annual Report", url: REPORT_2025_URL },
    ],
  },
  {
    number: 2,
    title: "Where Crime Rose and Fell, 2022–2025",
    description: "Reported offenses in the unincorporated county and American Canyon, shaded green to red within each category.",
    sources: [
      { label: "Napa County Sheriff’s Office 2024 Annual Report", url: REPORT_2024_URL },
      { label: "2025 Annual Report", url: REPORT_2025_URL },
    ],
  },
  {
    number: 3,
    title: "A Restated Count",
    description: "The 2024 report listed unincorporated rape as 13 (2023) and 24 (2024); the 2025 report lists those years as 1 and 9.",
    sources: [
      { label: "Napa County Sheriff’s Office 2024 Annual Report", url: REPORT_2024_URL },
      { label: "2025 Annual Report", url: REPORT_2025_URL },
    ],
  },
  {
    number: 4,
    title: "What Rose and What Fell, 2024 to 2025",
    description: "Year-over-year change in reported offenses by category; darker bars are American Canyon, lighter bars unincorporated.",
    sources: [
      { label: "Napa County Sheriff’s Office 2025 Annual Report", url: REPORT_2025_URL },
    ],
  },
  {
    number: 5,
    title: "Crime Trends in Napa County, 2023–2025",
    description: "Reported offenses, drug and firearm seizures by category and jurisdiction.",
    sources: [
      { label: "Napa County Sheriff’s Office 2024 Annual Report", url: REPORT_2024_URL },
      { label: "2025 Annual Report", url: REPORT_2025_URL },
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

// ── CHART ONE — Violence Up, Property Down (indexed line, Chart.js) ─
// Each unincorporated series indexed to its 2023 value = 100.
const CH1_YEARS = ["2023", "2024", "2025"];
const CH1_SERIES = [
  { label: "Assault", short: "Assault", data: [100, 109.5, 130.2], color: C.rose },
  { label: "Burglary", short: "Burglary", data: [100, 59.6, 67.3], color: C.blue },
  { label: "Larceny / theft", short: "Larceny", data: [100, 93.2, 80.7], color: C.larceny },
  { label: "Stolen vehicles", short: "Stolen veh.", data: [100, 50.0, 33.3], color: C.stolen },
];

function ChartOne() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    // Lesson Q — multi-line endpoint labels with vertical stagger so the four
    // converging lines stay legible at the right edge.
    const endLabels = {
      id: "ch1_end_labels",
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const pts = CH1_SERIES.map((s, di) => {
          const meta = chart.getDatasetMeta(di);
          const last = meta.data[meta.data.length - 1];
          return { x: last.x, y: last.y, color: s.color, text: `${s.short} ${Math.round(s.data[s.data.length - 1])}` };
        });
        pts.sort((a, b) => a.y - b.y);
        const MINGAP = 15;
        for (let i = 1; i < pts.length; i++) {
          if (pts[i].y - pts[i - 1].y < MINGAP) pts[i].y = pts[i - 1].y + MINGAP;
        }
        ctx.save();
        ctx.font = "bold 11px 'Source Sans 3', sans-serif";
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        pts.forEach((p) => { ctx.fillStyle = p.color; ctx.fillText(p.text, p.x + 8, p.y); });
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: CH1_YEARS,
        datasets: CH1_SERIES.map((s) => ({
          label: s.label,
          data: s.data,
          borderColor: s.color,
          backgroundColor: s.color,
          borderWidth: 2.4,
          pointRadius: 3.5,
          pointBackgroundColor: s.color,
          tension: 0.15,
          fill: false,
        })),
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { right: 96, top: 18 } },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          annotation: {
            annotations: {
              baseline: {
                type: "line", yMin: 100, yMax: 100,
                borderColor: T.muted, borderWidth: 1, borderDash: [5, 5],
                label: {
                  display: true, content: "2023 = 100", position: "start",
                  color: T.muted, backgroundColor: "transparent",
                  font: { size: 10, family: "'Source Sans 3', sans-serif" },
                  yAdjust: -9,
                },
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: C.ink, font: { size: 12 } },
            grid: { color: T.rule },
          },
          y: {
            min: 20, max: 145,
            ticks: { color: C.ink, font: { size: 11 } },
            grid: { color: T.rule },
            title: { display: true, text: "Indexed to 2023 (= 100)", color: C.ink, font: { size: 11 } },
          },
        },
      },
      plugins: [endLabels],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={CHART_H2}>Violence Up, Property Down</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "640px" }}>
            <div style={{ position: "relative", height: 380 }}>
              <canvas ref={canvasRef} aria-label="Indexed line chart of unincorporated Napa County assaults, burglary, larceny and stolen vehicles, 2023 to 2025" role="img" />
            </div>
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-1_uth-napa-2025-crime-report_nvf.png", "Violence Up, Property Down")} />
      <Caption number={1} />
    </div>
  );
}

// ── CHART TWO — Where Crime Rose and Fell (heat map — fresh canvas) ─
// Hand-drawn canvas; color scaled WITHIN each row (low green → high red).
// Rape excluded. Rendered at 2x internal resolution for a crisp PNG.
const CH2_GROUPS = [
  {
    name: "Unincorporated County",
    rows: [
      { label: "Homicide", vals: [0, 0, 2, 1] },
      { label: "Robbery", vals: [6, 3, 5, 6] },
      { label: "Assault", vals: [146, 116, 127, 151] },
      { label: "Burglary", vals: [80, 52, 31, 35] },
      { label: "Larceny / Theft", vals: [142, 176, 164, 142] },
      { label: "Stolen Vehicles", vals: [7, 12, 6, 4] },
    ],
  },
  {
    name: "American Canyon",
    rows: [
      { label: "Homicide", vals: [0, 0, 1, 0] },
      { label: "Robbery", vals: [16, 11, 16, 20] },
      { label: "Assault", vals: [147, 98, 94, 131] },
      { label: "Burglary", vals: [29, 24, 11, 14] },
      { label: "Larceny", vals: [290, 256, 224, 214] },
      { label: "Auto Theft", vals: [70, 65, 50, 39] },
    ],
  },
];
const CH2_YEARS = [2022, 2023, 2024, 2025];

function lerp(a, b, f) { return Math.round(a + (b - a) * f); }
function heatColor(v, lo, hi) {
  const t = hi > lo ? (v - lo) / (hi - lo) : 0.5;
  // green (60,140,90) → mid cream (236,217,160) → rose-red (158,80,80)
  let r, g, b;
  if (t < 0.5) {
    const f = t / 0.5;
    r = lerp(60, 236, f); g = lerp(140, 217, f); b = lerp(90, 160, f);
  } else {
    const f = (t - 0.5) / 0.5;
    r = lerp(236, 158, f); g = lerp(217, 80, f); b = lerp(160, 80, f);
  }
  return `rgb(${r},${g},${b})`;
}

function ChartTwo() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const SCALE = 2;
    const padL = 14, padT = 8, padR = 14, padB = 12;
    const labelW = 152, cellW = 90, cellH = 32, gap = 3;
    const headerH = 30, groupH = 28;
    const W = padL + labelW + CH2_YEARS.length * cellW + padR;
    const totalRows = CH2_GROUPS.reduce((n, g) => n + g.rows.length, 0);
    const H = padT + headerH + CH2_GROUPS.length * groupH + totalRows * cellH + padB;

    canvas.width = W * SCALE;
    canvas.height = H * SCALE;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);

    ctx.fillStyle = T.surface;
    ctx.fillRect(0, 0, W, H);

    const colX = (j) => padL + labelW + j * cellW;

    // Year header row
    ctx.fillStyle = T.muted;
    ctx.font = "bold 12px 'Source Sans 3', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    CH2_YEARS.forEach((yr, j) => {
      ctx.fillText(String(yr), colX(j) + cellW / 2, padT + headerH / 2);
    });

    let y = padT + headerH;
    CH2_GROUPS.forEach((group) => {
      // Group title band
      ctx.fillStyle = T.ink;
      ctx.font = "bold 13px 'Source Sans 3', sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(group.name, padL, y + groupH / 2);
      y += groupH;

      group.rows.forEach((row) => {
        const lo = Math.min(...row.vals);
        const hi = Math.max(...row.vals);
        // Category label
        ctx.fillStyle = T.ink;
        ctx.font = "12px 'Source Sans 3', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(row.label, padL, y + cellH / 2);
        // Cells
        row.vals.forEach((v, j) => {
          const x = colX(j);
          ctx.fillStyle = heatColor(v, lo, hi);
          ctx.fillRect(x, y + gap / 2, cellW - gap, cellH - gap);
          ctx.fillStyle = "#2C1810";
          ctx.font = "12px 'Source Sans 3', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(String(v), x + cellW / 2, y + cellH / 2);
        });
        y += cellH;
      });
    });
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={CHART_H2}>Where Crime Rose and Fell, 2022{"–"}2025</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <p style={{ fontFamily: font, fontSize: 13, fontStyle: "italic", color: T.muted, margin: "0 0 8px 0" }}>
          Each category is shaded across its own four years {"—"} green for its lowest count, red for its highest. Rape is excluded.
        </p>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "548px" }}>
            <canvas ref={canvasRef} aria-label="Heat map of reported offenses by category and year for the unincorporated county and American Canyon" role="img" />
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-2_uth-napa-2025-crime-report_nvf.png", "Where Crime Rose and Fell, 2022–2025")} />
      <Caption number={2} />
    </div>
  );
}

// ── CHART THREE — A Restated Count (grouped bar, Chart.js) ─────────
// Unincorporated rape counts as listed in each report.
// Lesson O — the 2024-report series has no 2025 value → null (no bar drawn).
function ChartThree() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const valueLabels = {
      id: "ch3_value_labels",
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        ctx.font = "bold 12px 'Source Sans 3', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        chart.data.datasets.forEach((ds, di) => {
          const meta = chart.getDatasetMeta(di);
          meta.data.forEach((bar, i) => {
            const v = ds.data[i];
            if (v === null || v === undefined) return; // Lesson O: guard null
            ctx.fillStyle = ds.backgroundColor;
            ctx.fillText(String(v), bar.x, bar.y - 4);
          });
        });
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: ["2023", "2024", "2025"],
        datasets: [
          { label: "As listed in the 2024 report", data: [13, 24, null], backgroundColor: C.rose, borderColor: C.rose, borderWidth: 1, borderRadius: 3 },
          { label: "As listed in the 2025 report", data: [1, 9, 10], backgroundColor: C.blue, borderColor: C.blue, borderWidth: 1, borderRadius: 3 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { top: 22 } },
        plugins: {
          legend: { display: true, position: "bottom", labels: { color: C.ink, font: { size: 11, family: "'Source Sans 3', sans-serif" }, boxWidth: 14, padding: 12 } },
          tooltip: { enabled: false },
        },
        scales: {
          x: { ticks: { color: C.ink, font: { size: 12 } }, grid: { display: false } },
          y: {
            min: 0, max: 28,
            ticks: { color: C.ink, font: { size: 11 } },
            grid: { color: T.rule },
            title: { display: true, text: "Reported rapes, unincorporated county", color: C.ink, font: { size: 11 } },
          },
        },
      },
      plugins: [valueLabels],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={CHART_H2}>A Restated Count</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "560px" }}>
            <div style={{ position: "relative", height: 360 }}>
              <canvas ref={canvasRef} aria-label="Grouped bar chart comparing unincorporated rape counts as listed in the 2024 and 2025 reports" role="img" />
            </div>
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-3_uth-napa-2025-crime-report_nvf.png", "A Restated Count")} />
      <Caption number={3} />
    </div>
  );
}

// ── CHART FOUR — What Rose and What Fell (diverging bar — fresh) ───
// Horizontal diverging bar, sorted by percent change descending.
// rose = rose-red (right), fell = blue (left); darker = American Canyon.
const CH4_ROWS = [
  { cat: "Assault", juris: "Am. Canyon", from: 94, to: 131, pct: 39, color: C.rose },
  { cat: "Burglary", juris: "Am. Canyon", from: 11, to: 14, pct: 27, color: C.rose },
  { cat: "Robbery", juris: "Am. Canyon", from: 16, to: 20, pct: 25, color: C.rose },
  { cat: "Robbery", juris: "Uninc.", from: 5, to: 6, pct: 20, color: C.roseLight },
  { cat: "Assault", juris: "Uninc.", from: 127, to: 151, pct: 19, color: C.roseLight },
  { cat: "Burglary", juris: "Uninc.", from: 31, to: 35, pct: 13, color: C.roseLight },
  { cat: "Larceny", juris: "Am. Canyon", from: 224, to: 214, pct: -4, color: C.blue },
  { cat: "Larceny / theft", juris: "Uninc.", from: 164, to: 142, pct: -13, color: C.blueLight },
  { cat: "Auto theft", juris: "Am. Canyon", from: 50, to: 39, pct: -22, color: C.blue },
  { cat: "Stolen vehicles", juris: "Uninc.", from: 6, to: 4, pct: -33, color: C.blueLight },
  { cat: "Homicide", juris: "Uninc.", from: 2, to: 1, pct: -50, color: C.blueLight },
  { cat: "Homicide", juris: "Am. Canyon", from: 1, to: 0, pct: -100, color: C.blue },
];

function ChartFour() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const tipLabels = {
      id: "ch4_tip_labels",
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        ctx.save();
        ctx.font = "11px 'Source Sans 3', sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillStyle = T.muted;
        CH4_ROWS.forEach((r, i) => {
          const bar = meta.data[i];
          if (!bar) return;
          const txt = `${r.from}→${r.to}  ${r.pct >= 0 ? "+" : ""}${r.pct}%`;
          if (r.pct >= 0) { ctx.textAlign = "left"; ctx.fillText(txt, bar.x + 6, bar.y); }
          else { ctx.textAlign = "right"; ctx.fillText(txt, bar.x - 6, bar.y); }
        });
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: CH4_ROWS.map((r) => `${r.cat} — ${r.juris}`),
        datasets: [{
          data: CH4_ROWS.map((r) => r.pct),
          backgroundColor: CH4_ROWS.map((r) => r.color),
          borderColor: CH4_ROWS.map((r) => r.color),
          borderWidth: 1,
          borderRadius: 2,
          barThickness: 16,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { right: 30, left: 6 } },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          annotation: {
            annotations: {
              zero: { type: "line", xMin: 0, xMax: 0, borderColor: T.ink, borderWidth: 1 },
            },
          },
        },
        scales: {
          x: {
            min: -118, max: 56,
            ticks: { color: C.ink, font: { size: 10 }, callback: (v) => v + "%" },
            grid: { color: T.rule },
            title: { display: true, text: "Change in reported offenses, 2024 to 2025", color: C.ink, font: { size: 11 } },
          },
          y: {
            ticks: { color: C.ink, font: { size: 10 }, autoSkip: false },
            grid: { display: false },
          },
        },
      },
      plugins: [tipLabels],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={CHART_H2}>What Rose and What Fell, 2024 to 2025</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <p style={{ fontFamily: font, fontSize: 13, fontStyle: "italic", color: T.muted, margin: "0 0 8px 0" }}>
          Red bars rose, blue bars fell; darker bars are American Canyon, lighter bars the unincorporated county.
        </p>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "640px" }}>
            <div style={{ position: "relative", height: 470 }}>
              <canvas ref={canvasRef} aria-label="Horizontal diverging bar chart of year-over-year change in reported offenses by category and jurisdiction" role="img" />
            </div>
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-4_uth-napa-2025-crime-report_nvf.png", "What Rose and What Fell, 2024 to 2025")} />
      <Caption number={4} />
    </div>
  );
}

// ── CHART FIVE — Crime Trends (styled HTML table; no PNG download) ──
const CH5_ROWS = [
  { cat: "Rape – Unincorporated", star: true, a: "1", b: "9", c: "10", pct: 11 },
  { cat: "Rape – American Canyon", a: "13", b: "9", c: "6", pct: -33 },
  { cat: "Rape – Yountville", a: "1", b: "1", c: "0", pct: -100 },
  { cat: "Homicide Deaths (Coroner, countywide)", a: "3", b: "10", c: "11", pct: 10 },
  { cat: "Assaults (Unincorporated)", a: "116", b: "127", c: "151", pct: 19 },
  { cat: "Assaults (American Canyon)", a: "98", b: "94", c: "131", pct: 39 },
  { cat: "Burglary (Unincorporated)", a: "52", b: "31", c: "35", pct: 13 },
  { cat: "Larceny / Theft (Unincorporated)", a: "176", b: "164", c: "142", pct: -13 },
  { cat: "Stolen Vehicles (Unincorporated)", a: "12", b: "6", c: "4", pct: -33 },
  { cat: "Meth Seized (grams)", a: "4,564", b: "34,874", c: "22,200", pct: -36 },
  { cat: "Fentanyl Seized (grams)", a: "67", b: "90", c: "261", pct: 190 },
  { cat: "Cocaine Seized (grams)", a: "1,782", b: "103", c: "3,253", pct: 3058 },
  { cat: "Psilocybin Seized (grams)", a: "3,763", b: "247", c: "614", pct: 149 },
  { cat: "Vehicle Pursuits – Total", a: "42", b: "53", c: "56", pct: 6 },
  { cat: "Firearms Seized – Countywide (patrol)", a: "35", b: "65", c: "59", pct: -9 },
  { cat: "Firearms Seized – American Canyon", a: "—", b: "50", c: "45", pct: -10 },
  { cat: "NSIB Firearms Seized", a: "45", b: "19", c: "69", pct: 263 },
];
const CH5_FOOTNOTE = "The 2024 report listed unincorporated rape as 13 (2023) and 24 (2024); the 2025 report lists those years as 1 and 9. American Canyon and Yountville rape figures are identical in both reports. The report gives no reason for the change. Homicide deaths are countywide (Coroner’s Bureau). Drug and firearm seizures are countywide (NSIB).";

function ChartFive() {
  const containerRef = useRef(null);
  const arrow = (pct) => {
    const up = pct > 0;
    return (
      <span style={{ color: up ? C.rose : C.good, fontWeight: 700, whiteSpace: "nowrap" }}>
        {up ? "▲" : "▼"} {pct > 0 ? "+" : ""}{pct.toLocaleString("en-US")}%
      </span>
    );
  };
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={CHART_H2}>Crime Trends in Napa County, 2023{"–"}2025</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "560px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thCell}>Category</th>
                  <th style={{ ...thCell, textAlign: "right" }}>2023</th>
                  <th style={{ ...thCell, textAlign: "right" }}>2024</th>
                  <th style={{ ...thCell, textAlign: "right" }}>2025</th>
                  <th style={{ ...thCell, textAlign: "right" }}>Change 2024{"→"}2025</th>
                </tr>
              </thead>
              <tbody>
                {CH5_ROWS.map((r) => (
                  <tr key={r.cat}>
                    <td style={{ ...tdCell, fontWeight: 700 }}>
                      {r.cat}{r.star && <sup style={{ color: T.accent }}>*</sup>}
                    </td>
                    <td style={tdNum}>{r.a}</td>
                    <td style={tdNum}>{r.b}</td>
                    <td style={tdNum}>{r.c}</td>
                    <td style={{ ...tdNum, fontFamily: font }}>{arrow(r.pct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p style={{ fontFamily: font, fontSize: 11, color: T.muted, fontStyle: "italic", lineHeight: 1.5, margin: "12px 0 0" }}>
          <sup style={{ color: T.accent }}>*</sup> {CH5_FOOTNOTE}
        </p>
      </div>
      <Caption number={5} />
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────
export default function UnderTheHoodNapa2025CrimeReport() {
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

        {/* ── DECK PENDING ──────────────────────────────────────────── */}
        {/* DECK PENDING — no deck supplied for this article. When one arrives,
            set SHOW_DECK = true and render it here as in the canonical template. */}
        {SHOW_DECK && null}

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
            The Napa County Sheriff’s Office 2025 annual report describes a broadly steady year, with Sheriff Oscar Ortiz citing a slight rise in assaults and violent crime. A comparison with the 2024 report shows assaults climbing in both the unincorporated county and American Canyon while most property crime fell {"—"} and it shows the office revised its earlier unincorporated rape figures sharply downward, the only crime category whose prior-year numbers changed between the two reports. The report also dropped the staffing-demographics page it published a year earlier, even as the office marked its 175th anniversary and posted real bright spots, including a double-digit drop in use-of-force events. The fragmentation that made a countywide picture hard to assemble last year remains.
          </p>
        </div>

        {/* ── CHART ONE (lead visual) ───────────────────────────────── */}
        <ChartOne />

        {/* ── LEDE (carries the dateline; explicit marginBottom 18) ──── */}
        <p style={{ ...P_STYLE, marginBottom: 18 }}>
          <span style={{ fontWeight: 700 }}>{DATELINE_LOCATION} {"—"}</span> Violent crime in Napa County looked steadier in 2025 than it did a year earlier, according to the <a href={REPORT_2025_URL} target="_blank" rel="noopener noreferrer" style={LINK}>Napa County Sheriff’s Office annual report</a>, even as reported assaults rose in the areas deputies patrol. The deeper story is again one of uncertainty: the rape figure that anchored last year’s headline has been revised with no reason given, the office removed the staffing breakdown it disclosed the year before, and the jurisdictional silos that frustrated a countywide view are still in place.
        </p>
        <p style={P_STYLE}>
          The 2025 report marks the office’s 175th anniversary, and in his opening message Sheriff Oscar Ortiz strikes a measured tone, writing that crime trends {"“"}remained relatively stable, with a slight increase in assaults and violent crime.{"”"}
        </p>

        {/* ── ASSAULTS DRIVE THE YEAR ───────────────────────────────── */}
        <h2 style={SECTION_H2}>Assaults Drive the Year</h2>
        <p style={P_STYLE}>
          Reported assaults in the unincorporated county rose from 127 in 2024 to 151 in 2025, an increase of about 19%. In American Canyon, where the sheriff’s office has provided policing under contract since 1992, assaults climbed more sharply, from 94 to 131, about 39%. Robberies rose in both areas, and American Canyon arrests jumped from 516 to 704.
        </p>
        <p style={P_STYLE}>
          Homicides, which last year’s analysis reported as having tripled countywide, held near that elevated level. The Coroner’s Bureau, which covers all of Napa County, recorded 11 homicide deaths in 2025, compared with 10 in 2024 and three in 2023. Within the sheriff’s patrol jurisdiction the count was one, down from two.
        </p>
        <p style={P_STYLE}>
          Across the three jurisdictions the sheriff’s office polices directly {"—"} the unincorporated county, American Canyon and Yountville {"—"} the 2025 report counts 16 reported rapes: 10 in the unincorporated county, six in American Canyon and none in Yountville.
        </p>

        <ChartTwo />

        {/* ── A REVISED NUMBER ──────────────────────────────────────── */}
        <h2 style={SECTION_H2}>A Revised Number</h2>
        <p style={P_STYLE}>
          The most pointed difference between this year’s report and last year’s is not in the 2025 totals but in the history.
        </p>
        <p style={P_STYLE}>
          Last year’s Napa Valley Features analysis, <em><a href={PRIOR_ANALYSIS_URL} target="_blank" rel="noopener noreferrer" style={LINK}>{"“"}Rising Violence, Lingering Questions in Napa’s 2024 Crime Report{"”"}</a></em>, reported that rapes in the unincorporated county had nearly doubled, citing <a href={REPORT_2024_URL} target="_blank" rel="noopener noreferrer" style={LINK}>the 2024 report</a>’s figures of 13 cases in 2023 and 24 in 2024.
        </p>
        <p style={P_STYLE}>
          The 2025 report lists those same two years differently: one rape in 2023 and nine in 2024.
        </p>

        <ChartThree />

        <p style={P_STYLE}>
          Of the seven crime categories in the unincorporated table {"—"} homicide, rape, robbery, assault, burglary, larceny and stolen vehicles {"—"} rape is the only one whose 2023 and 2024 figures changed between the reports. The American Canyon and Yountville rape counts are identical in both. The report gives no reason for the revision, and the office has not specified which penal code sections its {"“"}rape{"”"} category includes, a definition that last year was unclear even to the district attorney.
        </p>
        <p style={P_STYLE}>
          Revisions like this are within an agency’s discretion, and reported counts can shift as cases are investigated or reclassified. But because the change lowers the 2024 unincorporated figure from 24 to nine, the apparent drop from last year’s reported countywide total of 34 to this year’s 16 reflects the revision as much as any real decline. On the revised basis, the three jurisdictions accounted for 19 rapes in 2024 and 16 in 2025. As of publication, the sheriff’s office had not explained the change or defined the category.
        </p>

        {/* ── PROPERTY DOWN, THE DRUG MIX SHIFTS ────────────────────── */}
        <h2 style={SECTION_H2}>Property Down, the Drug Mix Shifts</h2>

        <ChartFour />

        <p style={P_STYLE}>
          Property crime mostly eased. In the unincorporated county, larceny and theft fell from 164 to 142 and stolen-vehicle reports from six to four, while burglaries ticked up from 31 to 35. American Canyon saw both larceny and auto theft decline. Indexed against 2023, the pattern is a clean divergence: assaults rising while property offenses fall.
        </p>
        <p style={P_STYLE}>
          The drug seizures tracked by the Napa Special Investigations Bureau, the countywide narcotics task force, shifted again. Methamphetamine seizures fell from about 34.9 kilograms in 2024 to about 22.2 kilograms in 2025, still far above the roughly 4.6 kilograms seized in 2023. Fentanyl nearly tripled, from about 90 grams to 261, and recorded cocaine seizures rose from about 103 grams to roughly 3.3 kilograms. Those totals are driven by individual cases more than by any trend {"—"} the task force’s firearm seizures jumped from 19 to 69 largely because of a single investigation that netted 61 guns, including a pistol converted to fire automatically.
        </p>

        {/* ── ENFORCEMENT, AND A LIGHTER HAND ───────────────────────── */}
        <h2 style={SECTION_H2}>Enforcement, and a Lighter Hand</h2>
        <p style={P_STYLE}>
          Vehicle pursuits edged up to 56 from 53 and remained concentrated in American Canyon, which accounted for 50 of them. Criminal firearm seizures by patrol deputies totaled 59, down from 65, with 45 in American Canyon. Calls for service to the sheriff’s office eased to 23,448 from 24,073, while arrests in the unincorporated county rose to 498 from 457.
        </p>

        <ChartFive />

        <p style={P_STYLE}>
          One of the report’s clearer bright spots is in use of force. The office logged 68 reportable force options across 42 encounters in 2025, which it calls a 12.8% decrease from the year before, and a mental-health clinician embedded with deputies through the county behavioral health agency co-responded to more than 65 crisis calls.
        </p>

        {/* ── A THINNER REPORT ──────────────────────────────────────── */}
        <h2 style={SECTION_H2}>A Thinner Report</h2>
        <p style={P_STYLE}>
          This year’s report is also notable for what it leaves out. The 2024 edition included an Organization Demographics page detailing the office’s sworn headcount {"—"} 142 members {"—"} along with gender, age, tenure and education. The 2025 report omits it, removing the clearest year-over-year window into how the workforce is changing.
        </p>
        <p style={P_STYLE}>
          That omission lands as the office shows signs of staffing strain. County salary data for 2024 shows the Sheriff’s Office accounted for the nine highest overtime earners countywide, and a sheriff’s sergeant was the highest-paid county employee, drawing roughly $198,000 in overtime on top of base pay. Heavy overtime is often a marker of vacancies. The office’s two named operating divisions grew modestly in the budget, from a combined $48.3 million to $50.8 million, though the full department appropriation and authorized staffing appear only in the county budget book.
        </p>
        <p style={P_STYLE}>
          When the Board of Supervisors took up the report on June 2, the county’s chief executive asked Sheriff Ortiz about recruiting to fill vacancies, and the sheriff described the office’s hiring criteria {"—"} a public sign that staffing is a live concern even as the report discloses less about it than it once did.
        </p>
        <p style={P_STYLE}>
          The office’s remit also continues to broaden. The county Office of Emergency Services was folded into the Sheriff’s Office, with 2024 its first full year, and in 2025 the transportation bureau moved 230 incarcerated people from the old downtown jail to a new county corrections facility on Napa Vallejo Highway.
        </p>

        {/* ── OUTREACH AND THE FEAR FACTOR ──────────────────────────── */}
        <h2 style={SECTION_H2}>Outreach and the Fear Factor</h2>
        <p style={P_STYLE}>
          The 2025 report adds a section absent from earlier editions: outreach to immigrant residents. It describes Sheriff Ortiz and Lt. Felipe Hernandez delivering nearly 30 presentations, primarily in Spanish, reaffirming that local deputies are state peace officers who enforce state law and do not carry out federal immigration enforcement, and urging residents to call 911 regardless of immigration status. A joint statement from the sheriff and the Napa police chief early in the year made the same commitment.
        </p>
        <p style={P_STYLE}>
          {/* TODO link grand-jury report — "Fear of ICE in the Valley?" has no human-readable URL in the handoff; leave unlinked until Tim supplies one. */}
          That outreach has a documented backdrop. The 2025-26 Napa County civil grand jury issued a report, {"“"}Fear of ICE in the Valley? Napa County Law Enforcement’s Response,{"”"} and on June 2 the Board of Supervisors adopted a response directing changes to how the county handles federal immigration detainer requests and ordering a public reporting dashboard. The question it raises is the one last year’s analysis could not resolve: whether fear of contact with authorities is keeping some violence, including sexual assault, from being reported at all.
        </p>

        {/* ── WHAT STILL ISN'T PUBLIC ───────────────────────────────── */}
        <h2 style={SECTION_H2}>What Still Isn’t Public</h2>
        <p style={P_STYLE}>
          Much of what made a countywide picture hard to assemble last year remains. The tool that comes closest to a countywide view {"—"} the online crime map the sheriff and the City of Napa both use {"—"} covers the unincorporated county, American Canyon, Yountville and the City of Napa, but St. Helena does not participate and Calistoga’s data is not integrated. Sexual-assault and alcohol-related incidents appear on it only for the City of Napa. And no Napa County law enforcement agency publishes a running police log on its own website, leaving residents to track incidents one map pin at a time.
        </p>
        <p style={P_STYLE}>
          The cities also still report their own figures in different systems. In last year’s reporting, St. Helena and Calistoga provided partial counts in incompatible categories while the City of Napa did not respond, and the district attorney argued that rising reports can reflect survivors gaining better access to help rather than more crime, pointing to the county’s Monarch child and family advocacy center. Napa Valley Features has again requested 2025 figures from all three cities.
        </p>

        {/* ── THE BOTTOM LINE ───────────────────────────────────────── */}
        <h2 style={SECTION_H2}>The Bottom Line</h2>
        <p style={P_STYLE}>
          What the two reports cannot settle on their own is whether Napa County grew more dangerous in 2025 or simply counted differently. Assaults are clearly up, in both the areas deputies patrol and the city they police under contract. Homicides held near last year’s elevated level. And the category that anchored last year’s headline {"—"} rape in the unincorporated county {"—"} is the one the office revised, in a table where it has never defined what the term covers, the same year it stopped publishing how many deputies it employs. The sharper question for the year ahead may be less whether crime is rising than whether the county’s own numbers can be read the same way from one annual report to the next.
        </p>

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
              <a href={PRIOR_ANALYSIS_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}><em>{"“"}Rising Violence, Lingering Questions in Napa’s 2024 Crime Report{"”"}</em></a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (Sept. 20, 2025)</span>
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
              placeholder="Search crime data, the Sheriff’s Office, American Canyon, public records..."
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

        {/* ── METHODOLOGY ───────────────────────────────────────────── */}
        <div style={{ borderTop: `2px solid ${T.border}`, paddingTop: 28, marginTop: 40 }}>
          <h3 style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: T.ink, margin: "0 0 10px" }}>Methodology</h3>
          <p style={{ fontFamily: font, fontSize: 14, color: T.muted, lineHeight: 1.7, fontStyle: "italic" }}>
            Figures are reported by the Napa County Sheriff’s Office unless noted. Year-over-year comparisons draw on the 2024 and 2025 annual reports. The rape restatement was verified against both full report PDFs: unincorporated 2023 changed 13→1 and 2024 changed 24→9 between the reports, while American Canyon and Yountville figures are identical in both; rape is the only category whose prior-year figures changed. Homicide deaths are countywide Coroner’s Bureau counts. Drug and firearm seizures are countywide figures from the Napa Special Investigations Bureau. The American Canyon table lists 2024 pursuits as 43 while the 2024 EVOC page lists 38; this piece cites 2025 totals only (56 total, 50 in American Canyon).
          </p>
        </div>

        {/* ── SOURCES (hand-written JSX) ────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 40, paddingTop: 24 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: T.ink, marginBottom: 16 }}>Sources</h2>
          <ol style={{ fontFamily: font, fontSize: 14, color: T.ink, lineHeight: 1.75, paddingLeft: 20 }}>
            <li style={{ marginBottom: 10 }}><a href={REPORT_2025_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa County Sheriff’s Office 2025 Annual Report</a>.</li>
            <li style={{ marginBottom: 10 }}><a href={REPORT_2024_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa County Sheriff’s Office 2024 Annual Report</a>.</li>
            <li style={{ marginBottom: 10 }}>Napa County civil grand jury, {"“"}Fear of ICE in the Valley?{"”"}, and the Board of Supervisors’ June 2, 2026 response <em>(public URL pending)</em>.</li>
            <li style={{ marginBottom: 10 }}>Prior analysis: <em><a href={PRIOR_ANALYSIS_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Rising Violence, Lingering Questions in Napa’s 2024 Crime Report</a></em>, Napa Valley Features (Sept. 20, 2025).</li>
          </ol>
        </div>

      </div>

      <Footer />
    </div>
  );
}

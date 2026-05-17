// UNDER THE HOOD — The Challenges of Napa's Massive Marketing Machine
// -----------------------------------------------------------------
// Slug: napa-schools-2026
// Publication: Napa Valley Features
// Built from under-the-hood-napa-lodging-pricing.jsx structural template.
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
const ARTICLE_SLUG = "napa-schools-2026";
const ARTICLE_TITLE = "Under the Hood: Napa County's Schools Held Flat. Three Different Stories Made the Number.";
const ARTICLE_DECK = "NVUSD's inertia, St. Helena's gain, the upvalley contraction — and what every district has in common.";
const ARTICLE_PUBLICATION = "Napa Valley Features";
const ARTICLE_DATE = "May 21, 2026";
const POLL_IDS = [42, 43, 44]; // eslint-disable-line no-unused-vars
const SHOW_DECK = true;
const EYEBROW = "Under the Hood";

// ── COUNTY + PUBLICATION (template-compat downstream constants) ────
const PUBLICATION = ARTICLE_PUBLICATION;
const SUBSTACK_URL = "https://napavalleyfocus.substack.com/";
const DATELINE_LOCATION = "NAPA, Calif.";

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

// ── CAPTIONS ARRAY (single source of truth; mirrored into EXPORT_DATA) ─
const CAPTIONS = [
  {
    number: 1,
    title: "North Bay Counties: K-12 Enrollment Change, 2023-24 to 2025-26",
    description: "Two-year percentage change in K-12 enrollment for each North Bay county. Napa’s +0.09% places it second only to Lake County in a region where most counties lost students. Sonoma shown both as reported and ex-Liberty Elementary (statewide virtual charter authorizer).",
    sources: [
      { label: "California Department of Education Census Day Enrollment, April 2026 release", url: "https://www.cde.ca.gov/ds/ad/filesenrcensus.asp" },
    ],
  },
  {
    number: 2,
    title: "Napa County District K-12 Enrollment Change, 2023-24 to 2025-26",
    description: "Two-year absolute change at each of Napa’s six districts. NCOE and St. Helena gain; NVUSD holds essentially flat; three small upvalley districts contract. † Small-base district (under 100 students). ‡ Napa COE serves a specialized student population (court schools, special education, alternative programs).",
    sources: [
      { label: "California Department of Education Census Day Enrollment, district-level data", url: "https://www.cde.ca.gov/ds/ad/filesenrcensus.asp" },
    ],
  },
  {
    number: 3,
    title: "Napa County Births Have Fallen 37% Since 2006",
    description: "Annual live births to Napa County residents peaked at 1,754 in 2006 and have fallen to 1,098 in 2024. The drop continued to steepen after 2017.",
    sources: [
      { label: "California Department of Public Health Live Birth Profiles by County", url: "https://data.chhs.ca.gov/dataset/live-birth-profiles-by-county" },
    ],
  },
  {
    number: "3b",
    title: "Sonoma and Marin Birth Declines Track Each Other; Napa Falls Faster",
    description: "Annual live births indexed to 100 at each county’s own peak year. Sonoma (peak 2004) and Marin (peak 2001) have followed nearly identical decline paths to land at –27% and –28% respectively. Napa (peak 2006) has fallen further, to –37%.",
    sources: [
      { label: "California Department of Public Health Live Birth Profiles by County, indexed", url: "https://data.chhs.ca.gov/dataset/live-birth-profiles-by-county" },
    ],
  },
  {
    number: 4,
    title: "Napa County Districts: EL, Non-EL and Total Enrollment Change",
    description: "Two-year change broken into English Learner, Non-EL, and Total. NVUSD shown on its own panel because its scale dominates. St. Helena’s +49 total is entirely non-EL; Calistoga’s –42 total masks a –115 EL drop offset by +73 non-EL. † Small-base district (under 100 students). ‡ Napa COE serves a specialized student population.",
    sources: [
      { label: "California Department of Education Census Day Enrollment, district-level EL composition data", url: "https://www.cde.ca.gov/ds/ad/filesenrcensus.asp" },
    ],
  },
  {
    number: 5,
    title: "North Bay K-12 Enrollment: Reported vs. Adjusted, 2023-24 to 2025-26",
    description: "Reported county totals alongside adjusted figures that remove specialized populations. Napa excludes the County Office of Education; Sonoma excludes Liberty Elementary’s statewide virtual charter enrollment. On a comparable organic basis, Napa is fractionally worse than Sonoma.",
    sources: [
      { label: "California Department of Education Census Day Enrollment, with adjustments described above", url: "https://www.cde.ca.gov/ds/ad/filesenrcensus.asp" },
    ],
  },
  {
    number: 6,
    title: "Napa County K-12: A Decade-Long Decline and a Generational Recomposition",
    description: "Top panel: Napa County K-12 enrollment public and private combined, 2011-12 to 2025-26. Public enrollment peaked at 21,002 in 2014-15 and has fallen 11.5% since. Private enrollment has held essentially flat over the overlap window. Bottom panel: Napa County’s racial recomposition. White and Hispanic/Latino enrollment crossed in 2007; by 2020-21, Hispanic/Latino students outnumbered White students more than two to one. Public gap (2021-22, 2022-23) shown as dashed; private affidavit data is self-reported.",
    sources: [
      { label: "Kidsdata.org (compiled from CDE DataQuest), 1993-94 through 2020-21", url: "https://www.kidsdata.org/" },
      { label: "CDE Census Day Enrollment, 2023-24 through 2025-26", url: "https://www.cde.ca.gov/ds/ad/filesenrcensus.asp" },
      { label: "CDE Private School Affidavit, 2019-20 through 2024-25", url: "https://www.cde.ca.gov/ds/si/ps/" },
    ],
  },
];

// ── CAPTION ────────────────────────────────────────────────────────
// Accepts either {number} (looks up in CAPTIONS) or direct {title, description, sources} props.
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

// ── CHART COLOR PALETTE ────────────────────────────────────────────
const C = {
  navyBlue: "#1F4E79",
  navyDark: "#0F2F4F",
  navyDarker: "#0A1F33",
  accentRed: "#A8493D",
  marinBlue: "#7894A8",
  ELOrange: "#C97B5E",
  nonELBlue: "#5B8FAA",
  totalInk: "#2C1810",
  brown: "#8B5E3C",
  gapShade: "rgba(139,115,85,0.10)",
  fireBand: "rgba(168,73,61,0.12)",
};

// ── CHART ONE — North Bay Counties K-12 Enrollment Change ──────────
function ChartOne() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = ["Lake", "Sonoma (reported)", "Napa", "Sonoma (ex-Liberty)", "Solano", "Mendocino", "Marin"];
    const pcts   = [0.62, 0.34, 0.09, -0.19, -0.96, -1.61, -2.43];
    const counts = [+63,  +218, +16, -117,  -577,  -205,  -735];
    const fills = pcts.map(v => v >= 0 ? C.navyBlue : C.accentRed);
    const borderColors = labels.map((l, i) => l === "Napa" ? C.navyDarker : fills[i]);
    const borderWidths = labels.map(l => l === "Napa" ? 2.5 : 0);

    const labelPlugin = {
      id: "ch1_bar_labels",
      afterDatasetsDraw(chart) {
        const { ctx, scales: { x, y } } = chart;
        ctx.save();
        ctx.font = "13px 'Source Sans 3', sans-serif";
        ctx.fillStyle = C.totalInk;
        ctx.textBaseline = "middle";
        pcts.forEach((pct, i) => {
          const yPx = y.getPixelForValue(i);
          const xPx = x.getPixelForValue(pct);
          const sign = pct >= 0 ? "+" : "";
          const cntSign = counts[i] >= 0 ? "+" : "";
          const text = `${sign}${pct.toFixed(2)}% (${cntSign}${counts[i]})`;
          if (pct >= 0) { ctx.textAlign = "left";  ctx.fillText(text, xPx + 6, yPx); }
          else          { ctx.textAlign = "right"; ctx.fillText(text, xPx - 6, yPx); }
        });
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          data: pcts,
          backgroundColor: fills,
          borderColor: borderColors,
          borderWidth: borderWidths,
          barThickness: 22,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 110 } },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: {
            min: -3.5, max: 1.5,
            ticks: { color: C.totalInk, font: { size: 11 } },
            grid: { color: T.rule },
            title: { display: true, text: "Two-year change in K-12 enrollment (%)", color: C.totalInk, font: { size: 12 } },
          },
          y: { ticks: { color: C.totalInk, font: { size: 13 } }, grid: { display: false } },
        },
      },
      plugins: [labelPlugin],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "640px" }}>
            <div style={{ position: "relative", height: 360 }}>
              <canvas ref={canvasRef} aria-label="Horizontal bar chart of two-year K-12 enrollment change for seven North Bay counties" role="img" />
            </div>
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-1_napa-schools-2026_nvf.png", "North Bay Counties: K-12 Enrollment Change, 2023-24 to 2025-26")} />
      <Caption number={1} />
    </div>
  );
}

// ── CHART TWO — Napa County District K-12 Enrollment Change ────────
function ChartTwo() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = ["Napa COE‡", "St. Helena Unified", "Napa Valley Unified", "Howell Mountain Elem.†", "Pope Valley Union Elem.†", "Calistoga Joint Unified"];
    const data = [55, 49, -12, -16, -18, -42];
    const pcts = [37.93, 4.44, -0.07, -17.20, -37.50, -5.32];
    const fills = data.map(v => v >= 0 ? C.navyBlue : C.accentRed);

    const labelPlugin = {
      id: "ch2_bar_labels",
      afterDatasetsDraw(chart) {
        const { ctx, scales: { x, y } } = chart;
        ctx.save();
        ctx.font = "13px 'Source Sans 3', sans-serif";
        ctx.fillStyle = C.totalInk;
        ctx.textBaseline = "middle";
        data.forEach((v, i) => {
          const yPx = y.getPixelForValue(i);
          const xPx = x.getPixelForValue(v);
          const sign = v >= 0 ? "+" : "";
          const pctSign = pcts[i] >= 0 ? "+" : "";
          const text = `${sign}${v} (${pctSign}${pcts[i].toFixed(2)}%)`;
          if (v >= 0) { ctx.textAlign = "left";  ctx.fillText(text, xPx + 6, yPx); }
          else        { ctx.textAlign = "right"; ctx.fillText(text, xPx - 6, yPx); }
        });
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: { labels, datasets: [{ data, backgroundColor: fills, barThickness: 22 }] },
      options: {
        indexAxis: "y",
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { right: 90, left: 90 } },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: {
            min: -80, max: 80,
            ticks: { color: C.totalInk, font: { size: 11 } },
            grid: { color: T.rule },
            title: { display: true, text: "Two-year change in K-12 enrollment (students)", color: C.totalInk, font: { size: 12 } },
          },
          y: { ticks: { color: C.totalInk, font: { size: 13 } }, grid: { display: false } },
        },
      },
      plugins: [labelPlugin],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "640px" }}>
            <div style={{ position: "relative", height: 340 }}>
              <canvas ref={canvasRef} aria-label="Horizontal bar chart of two-year K-12 enrollment change for Napa County districts" role="img" />
            </div>
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-2_napa-schools-2026_nvf.png", "Napa County District K-12 Enrollment Change, 2023-24 to 2025-26")} />
      <Caption number={2} />
    </div>
  );
}

// ── CHART THREE — Napa County Births 1995-2024 ─────────────────────
const NAPA_BIRTHS = [
  [1995,1463],[1996,1509],[1997,1499],[1998,1477],[1999,1493],
  [2000,1497],[2001,1565],[2002,1571],[2003,1676],[2004,1604],
  [2005,1658],[2006,1754],[2007,1665],[2008,1671],[2009,1653],
  [2010,1525],[2011,1572],[2012,1431],[2013,1449],[2014,1478],
  [2015,1456],[2016,1407],[2017,1291],[2018,1201],[2019,1294],
  [2020,1202],[2021,1205],[2022,1147],[2023,1234],[2024,1098],
];

function ChartThree() {
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
          label: "Napa births",
          data: NAPA_BIRTHS.map(([x,y]) => ({ x, y })),
          borderColor: C.navyDark,
          backgroundColor: C.navyDark,
          borderWidth: 2.2,
          pointRadius: 3.5,
          pointHoverRadius: 5,
          tension: 0.15,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          annotation: {
            annotations: {
              fireBand: {
                type: "box",
                xMin: 2016.75, xMax: 2017.25,
                backgroundColor: C.fireBand,
                borderWidth: 0,
                label: {
                  display: true, content: "2017 fire complex",
                  position: { x: "center", y: "start" },
                  yAdjust: 4,
                  color: C.accentRed,
                  font: { size: 11, style: "italic", family: "'Source Sans 3', sans-serif" },
                  backgroundColor: "transparent",
                },
              },
              peakLabel: {
                type: "label",
                xValue: 2006, yValue: 1815,
                content: "Peak: 1,754 (2006)",
                color: C.totalInk,
                font: { size: 12, family: "'Source Sans 3', sans-serif" },
                backgroundColor: "transparent",
              },
              endLabel: {
                type: "label",
                xValue: 2022.5, yValue: 1060,
                content: "2024: 1,098",
                color: C.totalInk,
                font: { size: 12, family: "'Source Sans 3', sans-serif" },
                backgroundColor: "transparent",
              },
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            min: 1994, max: 2025,
            ticks: {
              stepSize: 5, color: C.totalInk, font: { size: 11 },
              callback: (v) => Number.isInteger(v) ? String(v) : "",
            },
            grid: { color: T.rule },
            title: { display: true, text: "Year", color: C.totalInk, font: { size: 12 } },
          },
          y: {
            min: 1000, max: 1900,
            ticks: { color: C.totalInk, font: { size: 11 } },
            grid: { color: T.rule },
            title: { display: true, text: "Annual live births (residence)", color: C.totalInk, font: { size: 11 } },
          },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "640px" }}>
            <div style={{ position: "relative", height: 360 }}>
              <canvas ref={canvasRef} aria-label="Line chart of annual live births in Napa County, 1995 to 2024" role="img" />
            </div>
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-3_napa-schools-2026_nvf.png", "Napa County Births Have Fallen 37% Since 2006")} />
      <Caption number={3} />
    </div>
  );
}

// ── CHART THREE-B — Three-County Indexed Births ────────────────────
const MARIN_BIRTHS = [
  [1995,2614],[1996,2642],[1997,2651],[1998,2569],[1999,2650],
  [2000,2824],[2001,2865],[2002,2772],[2003,2830],[2004,2792],
  [2005,2785],[2006,2734],[2007,2819],[2008,2716],[2009,2495],
  [2010,2368],[2011,2385],[2012,2306],[2013,2320],[2014,2403],
  [2015,2288],[2016,2255],[2017,2238],[2018,2130],[2019,2084],
  [2020,2083],[2021,2336],[2022,2232],[2023,2193],[2024,2056],
];
const SONOMA_BIRTHS = [
  [1995,5442],[1996,5503],[1997,5409],[1998,5472],[1999,5420],
  [2000,5651],[2001,5706],[2002,5679],[2003,5843],[2004,5964],
  [2005,5613],[2006,5896],[2007,5742],[2008,5761],[2009,5683],
  [2010,5391],[2011,5150],[2012,5144],[2013,4982],[2014,5075],
  [2015,5016],[2016,4964],[2017,4645],[2018,4518],[2019,4378],
  [2020,4305],[2021,4554],[2022,4442],[2023,4344],[2024,4347],
];
const NAPA_PEAK = 1754;   // 2006
const MARIN_PEAK = 2865;  // 2001
const SONOMA_PEAK = 5964; // 2004
const idx = (series, peak) => series.map(([x, y]) => ({ x, y: (y / peak) * 100 }));

function ChartThreeB() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const napaIdx = idx(NAPA_BIRTHS, NAPA_PEAK);
    const marinIdx = idx(MARIN_BIRTHS, MARIN_PEAK);
    const sonomaIdx = idx(SONOMA_BIRTHS, SONOMA_PEAK);

    const eolLabelsPlugin = {
      id: "ch3b_eol_labels",
      afterDatasetsDraw(chart) {
        const { ctx, scales: { x, y } } = chart;
        ctx.save();
        ctx.font = "bold 12px 'Source Sans 3', sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const endX = x.getPixelForValue(2024);
        const napaEnd = napaIdx[napaIdx.length - 1].y;
        const marinEnd = marinIdx[marinIdx.length - 1].y;
        const sonomaEnd = sonomaIdx[sonomaIdx.length - 1].y;
        ctx.fillStyle = C.accentRed;
        ctx.fillText("Napa -37%", endX + 6, y.getPixelForValue(napaEnd));
        ctx.fillStyle = C.marinBlue;
        ctx.fillText("Marin -28%", endX + 6, y.getPixelForValue(marinEnd));
        ctx.fillStyle = C.navyBlue;
        ctx.fillText("Sonoma -27%", endX + 6, y.getPixelForValue(sonomaEnd));
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        datasets: [
          { label: "Sonoma", data: sonomaIdx, borderColor: C.navyBlue,  backgroundColor: C.navyBlue,  borderWidth: 2.1, pointRadius: 2.5, tension: 0.15 },
          { label: "Marin",  data: marinIdx,  borderColor: C.marinBlue, backgroundColor: C.marinBlue, borderWidth: 2.1, pointRadius: 2.5, tension: 0.15 },
          { label: "Napa",   data: napaIdx,   borderColor: C.accentRed, backgroundColor: C.accentRed, borderWidth: 2.3, pointRadius: 2.8, tension: 0.15 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { right: 90, top: 28 } },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          annotation: {
            annotations: {
              fireBand: {
                type: "box", xMin: 2016.75, xMax: 2017.25,
                backgroundColor: C.fireBand, borderWidth: 0,
                label: { display: true, content: "2017 fire complex", position: { x: "center", y: "start" }, yAdjust: 4,
                  color: C.accentRed, font: { size: 10, style: "italic", family: "'Source Sans 3', sans-serif" }, backgroundColor: "transparent" },
              },
              napaPeakDot:   { type: "point", xValue: 2006, yValue: 100, radius: 5, backgroundColor: C.accentRed, borderColor: C.accentRed },
              marinPeakDot:  { type: "point", xValue: 2001, yValue: 100, radius: 5, backgroundColor: C.marinBlue, borderColor: C.marinBlue },
              sonomaPeakDot: { type: "point", xValue: 2004, yValue: 100, radius: 5, backgroundColor: C.navyBlue,  borderColor: C.navyBlue },
              marinPeakLab:  { type: "label", xValue: 2001, yValue: 109, content: "peak 2001", color: C.marinBlue, font: { size: 11, family: "'Source Sans 3', sans-serif" }, backgroundColor: "transparent" },
              sonomaPeakLab: { type: "label", xValue: 2004, yValue: 105.5, content: "peak 2004", color: C.navyBlue, font: { size: 11, family: "'Source Sans 3', sans-serif" }, backgroundColor: "transparent" },
              napaPeakLab:   { type: "label", xValue: 2007, yValue: 105.5, content: "peak 2006", color: C.accentRed, font: { size: 11, family: "'Source Sans 3', sans-serif" }, backgroundColor: "transparent" },
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            min: 1994, max: 2025,
            ticks: { stepSize: 5, color: C.totalInk, font: { size: 11 }, callback: (v) => Number.isInteger(v) ? String(v) : "" },
            grid: { color: T.rule },
          },
          y: {
            min: 58, max: 118,
            ticks: { color: C.totalInk, font: { size: 11 } },
            grid: { color: T.rule },
            title: { display: true, text: "Births indexed to each county’s peak = 100", color: C.totalInk, font: { size: 11 } },
          },
        },
      },
      plugins: [eolLabelsPlugin],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "640px" }}>
            <div style={{ position: "relative", height: 360 }}>
              <canvas ref={canvasRef} aria-label="Indexed line chart of annual live births for Napa, Marin, and Sonoma counties, 1995 to 2024" role="img" />
            </div>
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-3b_napa-schools-2026_nvf.png", "Sonoma and Marin Birth Declines Track Each Other; Napa Falls Faster")} />
      <Caption number="3b" />
    </div>
  );
}

// ── CHART FOUR — Two-panel EL / Non-EL / Total ─────────────────────
function ChartFour() {
  const containerRef = useRef(null);
  const canvasRefTop = useRef(null);
  const canvasRefBot = useRef(null);
  const chartRefTop = useRef(null);
  const chartRefBot = useRef(null);

  useEffect(() => {
    if (!canvasRefTop.current || !canvasRefBot.current) return;
    if (chartRefTop.current) chartRefTop.current.destroy();
    if (chartRefBot.current) chartRefBot.current.destroy();

    const makeLabelPlugin = (idName, datasetValues) => ({
      id: idName,
      afterDatasetsDraw(chart) {
        const { ctx, scales: { x, y } } = chart;
        ctx.save();
        ctx.font = "12px 'Source Sans 3', sans-serif";
        ctx.fillStyle = C.totalInk;
        ctx.textBaseline = "middle";
        chart.data.datasets.forEach((ds, dsIdx) => {
          const meta = chart.getDatasetMeta(dsIdx);
          ds.data.forEach((v, i) => {
            if (v === null || v === undefined) return;
            const bar = meta.data[i];
            if (!bar) return;
            const xPx = x.getPixelForValue(v);
            const yPx = bar.y;
            const sign = v >= 0 ? "+" : "";
            const text = `${sign}${v}`;
            if (v >= 0) { ctx.textAlign = "left";  ctx.fillText(text, xPx + 4, yPx); }
            else if (v < 0) { ctx.textAlign = "right"; ctx.fillText(text, xPx - 4, yPx); }
            else            { ctx.textAlign = "left";  ctx.fillText(text, xPx + 4, yPx); }
          });
        });
        ctx.restore();
      },
    });

    // ── TOP PANEL: NVUSD ──────────────────────────────────────────
    chartRefTop.current = new Chart(canvasRefTop.current, {
      type: "bar",
      data: {
        labels: ["NVUSD"],
        datasets: [
          { label: "English Learner", data: [-412], backgroundColor: C.ELOrange,  barThickness: 18 },
          { label: "Non-EL",          data: [+400], backgroundColor: C.nonELBlue, barThickness: 18 },
          { label: "Total",           data: [-12],  backgroundColor: C.totalInk,  barThickness: 18 },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { right: 60, left: 30, top: 10, bottom: 10 } },
        plugins: {
          legend: {
            display: true, position: "top", align: "end",
            labels: { color: C.totalInk, font: { size: 11, family: "'Source Sans 3', sans-serif" }, boxWidth: 14, padding: 12 },
          },
          tooltip: { enabled: false },
        },
        scales: {
          x: {
            min: -500, max: 500,
            ticks: { color: C.totalInk, font: { size: 11 } },
            grid: { color: T.rule, drawBorder: false },
          },
          y: { ticks: { color: C.totalInk, font: { size: 13 } }, grid: { display: false } },
        },
      },
      plugins: [makeLabelPlugin("ch4_top_labels", null)],
    });

    // ── BOTTOM PANEL: 5 smaller districts ─────────────────────────
    chartRefBot.current = new Chart(canvasRefBot.current, {
      type: "bar",
      data: {
        labels: [
          ["St. Helena", "Unified"],
          ["Calistoga Joint", "Unified"],
          ["Howell Mountain", "Elem.†"],
          ["Pope Valley", "Union Elem.†"],
          ["Napa COE‡"],
        ],
        datasets: [
          { label: "English Learner", data: [-30, -115, -16, -9, +8],  backgroundColor: C.ELOrange,  barThickness: 14 },
          { label: "Non-EL",          data: [+79, +73, 0, -9, +47],    backgroundColor: C.nonELBlue, barThickness: 14 },
          { label: "Total",           data: [+49, -42, -16, -18, +55], backgroundColor: C.totalInk,  barThickness: 14 },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { right: 60, left: 30, top: 10, bottom: 10 } },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: {
            min: -150, max: 150,
            ticks: { color: C.totalInk, font: { size: 11 } },
            grid: { color: T.rule, drawBorder: false },
            title: { display: true, text: "Two-year change in enrollment (students)", color: C.totalInk, font: { size: 12 } },
          },
          y: { ticks: { color: C.totalInk, font: { size: 12 } }, grid: { display: false } },
        },
      },
      plugins: [makeLabelPlugin("ch4_bot_labels", null)],
    });

    return () => {
      if (chartRefTop.current) chartRefTop.current.destroy();
      if (chartRefBot.current) chartRefBot.current.destroy();
    };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <p style={{ fontFamily: font, fontSize: 13, fontStyle: "italic", color: T.muted, margin: "0 0 8px 0" }}>
          NVUSD shown separately because its scale dominates the smaller districts.
        </p>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "640px" }}>
            <div style={{ position: "relative", height: 160 }}>
              <canvas ref={canvasRefTop} aria-label="Horizontal bar chart of NVUSD EL, Non-EL, and total enrollment change" role="img" />
            </div>
            <div style={{ borderTop: `1px dashed ${T.border}`, margin: "6px 0" }} />
            <div style={{ position: "relative", height: 340 }}>
              <canvas ref={canvasRefBot} aria-label="Horizontal bar chart of five smaller Napa County districts EL, Non-EL, and total enrollment change" role="img" />
            </div>
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-4_napa-schools-2026_nvf.png", "Napa County Districts: EL, Non-EL and Total Enrollment Change")} />
      <Caption number={4} />
    </div>
  );
}

// ── CHART FIVE — Reported vs Adjusted (grouped horizontal bars) ────
function ChartFive() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = ["Lake", "Sonoma", "Napa", "Solano", "Mendocino", "Marin"];
    const reported = [0.62, 0.34, 0.09, -0.96, -1.61, -2.43];
    const adjusted = [0.62, -0.19, -0.21, -0.96, -1.61, -2.43];
    const suffixes = ["", " (ex-Liberty)", " (ex-NCOE)", "", "", ""];

    const lightBlue = "rgba(120,148,168,0.55)";
    const lightRed  = "rgba(168,73,61,0.40)";
    const colorReported = reported.map(v => v >= 0 ? lightBlue : lightRed);
    const colorAdjusted = adjusted.map(v => v >= 0 ? C.navyBlue : C.accentRed);

    const labelPlugin = {
      id: "ch5_bar_labels",
      afterDatasetsDraw(chart) {
        const { ctx, scales: { x } } = chart;
        ctx.save();
        ctx.font = "12px 'Source Sans 3', sans-serif";
        ctx.fillStyle = C.totalInk;
        ctx.textBaseline = "middle";
        chart.data.datasets.forEach((ds, dsIdx) => {
          const isAdj = dsIdx === 1;
          const meta = chart.getDatasetMeta(dsIdx);
          ds.data.forEach((v, i) => {
            const bar = meta.data[i];
            if (!bar) return;
            const xPx = x.getPixelForValue(v);
            const yPx = bar.y;
            const sign = v >= 0 ? "+" : "";
            const suffix = isAdj ? suffixes[i] : "";
            const text = `${sign}${v.toFixed(2)}%${suffix}`;
            ctx.font = isAdj ? "bold 12px 'Source Sans 3', sans-serif" : "12px 'Source Sans 3', sans-serif";
            if (v >= 0) { ctx.textAlign = "left";  ctx.fillText(text, xPx + 4, yPx); }
            else        { ctx.textAlign = "right"; ctx.fillText(text, xPx - 4, yPx); }
          });
        });
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Reported (CDE Census Day)",            data: reported, backgroundColor: colorReported, barThickness: 14 },
          { label: "Adjusted (specialized pops. removed)", data: adjusted, backgroundColor: colorAdjusted, barThickness: 14 },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { right: 110, left: 30 } },
        plugins: {
          legend: {
            display: true, position: "top", align: "end",
            labels: { color: C.totalInk, font: { size: 11, family: "'Source Sans 3', sans-serif" }, boxWidth: 14, padding: 12 },
          },
          tooltip: { enabled: false },
        },
        scales: {
          x: {
            min: -3.5, max: 1.5,
            ticks: { color: C.totalInk, font: { size: 11 } },
            grid: { color: T.rule },
            title: { display: true, text: "Two-year change in K-12 enrollment (%)", color: C.totalInk, font: { size: 12 } },
          },
          y: { ticks: { color: C.totalInk, font: { size: 13 } }, grid: { display: false } },
        },
      },
      plugins: [labelPlugin],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "640px" }}>
            <div style={{ position: "relative", height: 400 }}>
              <canvas ref={canvasRef} aria-label="Grouped horizontal bar chart of reported vs adjusted K-12 enrollment change for six North Bay counties" role="img" />
            </div>
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-5_napa-schools-2026_nvf.png", "North Bay K-12 Enrollment: Reported vs. Adjusted, 2023-24 to 2025-26")} />
      <Caption number={5} />
    </div>
  );
}

// ── CHART SIX — Decade-Long Decline + Generational Recomposition ───
const NAPA_PUBLIC_KIDSDATA = [
  [2012,20595],[2013,20725],[2014,20868],[2015,21002],[2016,20817],
  [2017,20562],[2018,20402],[2019,20215],[2020,20022],[2021,19538],
];
const NAPA_PUBLIC_CDE = [[2024,18572],[2025,18585],[2026,18588]];
const NAPA_COMBINED = [
  [2020,22522],[2021,22067],[2022,21740],[2023,21412],[2024,21221],[2025,21162],
];
const NAPA_HISPANIC = [
  [1994,4012],[1995,4408],[1996,4745],[1997,5070],[1998,5394],[1999,5788],
  [2000,6395],[2001,6701],[2002,7127],[2003,7681],[2004,7595],[2005,8005],
  [2006,8292],[2007,8728],[2008,8922],[2009,9318],[2010,10360],[2011,10498],
  [2012,10708],[2013,10989],[2014,11171],[2015,11384],[2016,11389],[2017,11388],
  [2018,11320],[2019,11314],[2020,11352],[2021,11267],
];
const NAPA_WHITE = [
  [1994,12722],[1995,12655],[1996,12540],[1997,12564],[1998,12445],[1999,12295],
  [2000,11717],[2001,11408],[2002,10791],[2003,10299],[2004,9514],[2005,8775],
  [2006,8494],[2007,8125],[2008,7692],[2009,7346],[2010,7232],[2011,6897],
  [2012,6684],[2013,6454],[2014,6539],[2015,6436],[2016,6303],[2017,6166],
  [2018,6095],[2019,5970],[2020,5738],[2021,5406],
];

function ChartSix() {
  const containerRef = useRef(null);
  const canvasRefTop = useRef(null);
  const canvasRefBot = useRef(null);
  const chartRefTop = useRef(null);
  const chartRefBot = useRef(null);

  useEffect(() => {
    if (!canvasRefTop.current || !canvasRefBot.current) return;
    if (chartRefTop.current) chartRefTop.current.destroy();
    if (chartRefBot.current) chartRefBot.current.destroy();

    // Public line as one continuous series with null at 2022/2023 (gap)
    const publicMap = new Map();
    NAPA_PUBLIC_KIDSDATA.forEach(([x, y]) => publicMap.set(x, y));
    NAPA_PUBLIC_CDE.forEach(([x, y]) => publicMap.set(x, y));
    const publicYears = [];
    for (let yr = 2012; yr <= 2026; yr++) publicYears.push(yr);
    const publicSeries = publicYears.map(yr => ({ x: yr, y: publicMap.has(yr) ? publicMap.get(yr) : null }));

    // Dashed connector dataset (only the gap)
    const dashedConnector = [
      { x: 2021, y: 19538 },
      { x: 2022, y: null }, // not drawn, only connects 2021 → 2024 via spanGaps
      { x: 2024, y: 18572 },
    ];

    // ── TOP PANEL ─────────────────────────────────────────────────
    chartRefTop.current = new Chart(canvasRefTop.current, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Public enrollment",
            data: publicSeries,
            borderColor: C.navyDark,
            backgroundColor: C.navyDark,
            borderWidth: 2.2,
            pointRadius: 3.5,
            tension: 0.1,
            spanGaps: false,
          },
          {
            label: "Public (gap connector)",
            data: [{ x: 2021, y: 19538 }, { x: 2024, y: 18572 }],
            borderColor: C.navyDark,
            backgroundColor: C.navyDark,
            borderWidth: 1.5,
            borderDash: [6, 6],
            pointRadius: 0,
            tension: 0,
          },
          {
            label: "Private enrollment (added on top)",
            data: NAPA_COMBINED.map(([x, y]) => ({ x, y })),
            borderColor: C.brown,
            backgroundColor: "rgba(139,94,60,0.30)",
            borderWidth: 1.6,
            pointRadius: 4,
            pointStyle: "triangle",
            tension: 0.1,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { right: 20, top: 10 } },
        plugins: {
          legend: {
            display: true, position: "bottom", align: "start",
            labels: {
              color: C.totalInk, font: { size: 10, family: "'Source Sans 3', sans-serif" },
              boxWidth: 14, padding: 10,
              filter: (item) => item.text !== "Public (gap connector)",
            },
          },
          tooltip: { enabled: false },
          annotation: {
            annotations: {
              gapShade: {
                type: "box", xMin: 2021.5, xMax: 2023.5,
                backgroundColor: C.gapShade, borderWidth: 0,
              },
              gapLabel: {
                type: "label", xValue: 2022.5, yValue: 17500,
                content: "public data gap 2021-22, 2022-23",
                color: T.muted, font: { size: 10, style: "italic", family: "'Source Sans 3', sans-serif" },
                backgroundColor: "transparent",
              },
              peakLab: {
                type: "label", xValue: 2014, yValue: 22050,
                content: ["Public peak: 21,002", "(2014-15)"],
                color: C.totalInk, font: { size: 11, family: "'Source Sans 3', sans-serif" },
                backgroundColor: "transparent",
              },
              endLabPublic: {
                type: "label", xValue: 2026, yValue: 18000,
                content: "Public 2025-26: 18,588",
                color: C.navyDark, font: { size: 10, family: "'Source Sans 3', sans-serif" },
                backgroundColor: "transparent", xAdjust: -60,
              },
              endLabCombined: {
                type: "label", xValue: 2025, yValue: 22300,
                content: "Public + private 2024-25: 21,162",
                color: C.brown, font: { size: 10, family: "'Source Sans 3', sans-serif" },
                backgroundColor: "transparent", xAdjust: -80,
              },
              callout: {
                type: "label", xValue: 2012.5, yValue: 19400,
                content: ["-2,414 students", "-11.5% from public peak"],
                color: C.accentRed,
                font: { size: 11, weight: "bold", family: "'Source Sans 3', sans-serif" },
                backgroundColor: "rgba(245,240,232,0.9)",
                borderColor: C.accentRed, borderWidth: 1, borderRadius: 4, padding: 6,
              },
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            min: 2011, max: 2027,
            ticks: { stepSize: 2, color: C.totalInk, font: { size: 10 }, callback: (v) => Number.isInteger(v) ? String(v) : "" },
            grid: { color: T.rule },
          },
          y: {
            min: 17300, max: 23000,
            ticks: { color: C.totalInk, font: { size: 10 } },
            grid: { color: T.rule },
            title: { display: true, text: "K-12 enrollment", color: C.totalInk, font: { size: 10 } },
          },
        },
      },
    });

    // ── BOTTOM PANEL ──────────────────────────────────────────────
    const endLabelsPlugin = {
      id: "ch6_bot_endlabels",
      afterDatasetsDraw(chart) {
        const { ctx, scales: { x, y } } = chart;
        ctx.save();
        ctx.font = "11px 'Source Sans 3', sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const endX = x.getPixelForValue(2021);
        ctx.fillStyle = C.brown;
        ctx.fillText("2020-21:", endX + 6, y.getPixelForValue(11800));
        ctx.fillText("11,267",   endX + 6, y.getPixelForValue(11200));
        ctx.fillStyle = C.navyBlue;
        ctx.fillText("2020-21:", endX + 6, y.getPixelForValue(5900));
        ctx.fillText("5,406",    endX + 6, y.getPixelForValue(5300));
        ctx.restore();
      },
    };

    chartRefBot.current = new Chart(canvasRefBot.current, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Hispanic / Latino",
            data: NAPA_HISPANIC.map(([x, y]) => ({ x, y })),
            borderColor: C.brown, backgroundColor: C.brown,
            borderWidth: 2.2, pointRadius: 2.5, pointStyle: "circle", tension: 0.1,
          },
          {
            label: "White",
            data: NAPA_WHITE.map(([x, y]) => ({ x, y })),
            borderColor: C.navyBlue, backgroundColor: C.navyBlue,
            borderWidth: 2.2, pointRadius: 2.5, pointStyle: "rect", tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { right: 80, top: 10 } },
        plugins: {
          legend: {
            display: true, position: "left", align: "center",
            labels: { color: C.totalInk, font: { size: 10, family: "'Source Sans 3', sans-serif" }, boxWidth: 14, padding: 10, usePointStyle: true },
          },
          tooltip: { enabled: false },
          annotation: {
            annotations: {
              crossoverLine: {
                type: "line", xMin: 2007, xMax: 2007,
                borderColor: T.muted, borderWidth: 1, borderDash: [4, 4],
              },
              crossoverLab: {
                type: "label", xValue: 2007, yValue: 9700,
                content: "Hispanic enrollment exceeds White (~2007)",
                color: T.muted, font: { size: 10, style: "italic", family: "'Source Sans 3', sans-serif" },
                backgroundColor: "transparent", xAdjust: 100,
              },
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            min: 1993, max: 2027,
            ticks: { stepSize: 4, color: C.totalInk, font: { size: 10 }, callback: (v) => Number.isInteger(v) ? String(v) : "" },
            grid: { color: T.rule },
            title: { display: true, text: "Academic year (ending)", color: C.totalInk, font: { size: 10 } },
          },
          y: {
            min: 3000, max: 14000,
            ticks: { color: C.totalInk, font: { size: 10 } },
            grid: { color: T.rule },
            title: { display: true, text: "Students enrolled", color: C.totalInk, font: { size: 10 } },
          },
        },
      },
      plugins: [endLabelsPlugin],
    });

    return () => {
      if (chartRefTop.current) chartRefTop.current.destroy();
      if (chartRefBot.current) chartRefBot.current.destroy();
    };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <p style={{ fontFamily: font, fontSize: 13, fontStyle: "italic", color: T.muted, margin: "0 0 6px 0" }}>
          Total enrollment has fallen 11.5% from peak. Underneath, the racial composition has reversed.
        </p>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "640px" }}>
            <p style={{ fontFamily: font, fontSize: 11, color: T.muted, textAlign: "center", margin: "4px 0" }}>
              Napa County K-12 enrollment, public and private combined, 2011-12 → 2025-26
            </p>
            <div style={{ position: "relative", height: 340 }}>
              <canvas ref={canvasRefTop} aria-label="Line chart of Napa County public plus private K-12 enrollment, 2011-12 to 2025-26" role="img" />
            </div>
            <p style={{ fontFamily: font, fontSize: 11, color: T.muted, textAlign: "center", margin: "16px 0 4px 0" }}>
              Napa County K-12: White and Hispanic/Latino enrollment, 1993-94 → 2020-21
            </p>
            <div style={{ position: "relative", height: 280 }}>
              <canvas ref={canvasRefBot} aria-label="Line chart of Napa County K-12 enrollment by race for White and Hispanic/Latino students, 1993-94 to 2020-21" role="img" />
            </div>
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-6_napa-schools-2026_nvf.png", "Napa County K-12: A Decade-Long Decline and a Generational Recomposition")} />
      <Caption number={6} />
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────
export default function UnderTheHoodNapaSchools2026() {
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
            Napa County{"'"}s public K-12 enrollment edged up 16 students over two years to 18,588 in 2025-26 {"—"} a 0.09% change that places Napa second in the immediate North Bay after Lake County. The headline rests on a specific arithmetic. Napa Valley Unified held the line at 88% of the county. St. Helena Unified grew 4.44%. Calistoga, Howell Mountain and Pope Valley all contracted. The County Office of Education added 55 students to a specialized population. Underneath those moving parts, English Learner enrollment fell 12.9% while non-EL enrollment rose 4.2% {"—"} a recomposition rather than stability. The input variable is a regional birth curve that peaked in Napa in 2006 at 1,754 annual births and has fallen 37% to 1,098 in 2024, steeper than Sonoma{"'"}s 27% or Marin{"'"}s 28% over the same window. The 2026-27 release will tell us which of three current lines moves first: NVUSD{"'"}s flat trajectory, St. Helena{"'"}s gain or the upvalley contraction.
          </p>
        </div>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* LEDE                                                          */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <p style={{ ...P_STYLE, marginBottom: 18 }}>
          <strong>NAPA, Calif.</strong> {"—"} Napa County{"’"}s public K-12 enrollment edged up 16 students over two years to 18,588 in 2025-26, according to California Department of Education Census Day data released April 16, 2026. The 0.09% change places Napa second in the immediate North Bay after Lake County (+0.62%) and just barely on the gain side of a regional line where most neighbors are losing ground. Marin recorded the steepest decline at -2.43%; Solano lost -0.96%; Mendocino lost -1.61%. Sonoma{"’"}s reported +0.34% reverses to -0.19% after subtracting the Liberty Elementary School District, a Petaluma-based charter authorizer whose count rolls up statewide virtual students.
        </p>

        <p style={P_STYLE}>
          The Napa headline is real. But it rests on a specific arithmetic. One large district held the line. One small upvalley district added meaningfully. Three small upvalley districts lost ground. The County Office of Education added a specialized population that lifts the topline. Underneath those moving parts, the composition of who is enrolled in Napa County schools has shifted measurably {"—"} and the input variable that will feed every district{"’"}s 2030 classrooms has been contracting for two decades across the entire North Bay, with Napa County out in front.
        </p>

        <ChartOne />

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION 1 — THE HEADLINE IS REAL. THE STABILITY IS CONCENTRATED. */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>The Headline Is Real. The Stability Is Concentrated.</h2>

        <p style={P_STYLE}>Napa Valley Unified School District enrolls 16,381 students {"—"} 88% of the county total. Over two years its net change was -12 students, a 0.07% decline that registers as measurement noise on a base that size. Whatever the county number does, NVUSD{"’"}s number is what drives it.</p>

        <p style={P_STYLE}>The Napa County Office of Education added 55 students over two years, from a base of 145 to 200. NCOE serves a specialized population {"—"} court schools, special education programs, alternative settings {"—"} and its enrollment changes reflect placement decisions and program capacity rather than organic family growth. The +55 figure is meaningful for the county headline but does not directly compare to the unified districts; the section below on the ex-NCOE adjustment treats it separately.</p>

        <p style={P_STYLE}>St. Helena Unified is the most interesting positive number in the Napa data. The district went from 1,103 students in 2023-24 to 1,152 in 2025-26, a gain of 49 students or 4.44% {"—"} the only Napa unified district above 300 students that grew meaningfully. St. Helena is a small, wealthy upvalley district with a long-standing reputation for academic strength and competitive teacher compensation. In a county and a region where most districts are contracting, families with means are choosing to enroll their children there. The same dynamic shows up in the private sector: Justin-Siena High School in Napa, the county{"’"}s largest private school, grew from 541 students in 2019-20 to 679 in 2024-25 {"—"} a 25% gain (California Private School Affidavit data) over the same window in which most public districts contracted.</p>

        <p style={P_STYLE}>The other Napa districts moved against the headline. Calistoga Joint Unified fell from 790 to 748, a two-year loss of 42 students or 5.32% {"—"} the largest absolute decline in the county and the only loss occurring at a district that crosses the 700-student threshold where percentage changes translate into staffing pressures. Howell Mountain Elementary went from 93 to 77 (-17.20%). Pope Valley Union Elementary fell from 48 to 30 (-37.50%). Both are small-base districts where a swing of a few families produces a swing of several percentage points.</p>

        <ChartTwo />

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION 2 — THE BIRTH CURVE UNDERNEATH                        */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>The Birth Curve Underneath</h2>

        <p style={P_STYLE}>The Napa enrollment number is an effect, not a cause. Annual live births to Napa County residents peaked at 1,754 in 2006 and have fallen to 1,098 in 2024, a 37% decline over 18 years, according to <a href="https://data.chhs.ca.gov/dataset/live-birth-profiles-by-county" target="_blank" rel="noopener noreferrer" style={LINK}>California Department of Public Health Live Birth Profiles by County data</a>. The drop continued to steepen after 2017: the county recorded 1,407 births in 2016, 1,291 in 2017 and 1,201 in 2018. Births have remained in a narrow range between 1,098 and 1,294 since 2018, suggesting a new lower band rather than an ongoing decline.</p>

        <p style={P_STYLE}>The pattern is regional, with Napa at the steep end of a narrow band. Sonoma County births peaked at 5,964 in 2004 and reached 4,347 in 2024, a 27.1% decline. Marin County births peaked at 2,865 in 2001 and reached 2,056 in 2024, a 28.2% decline. Napa{"’"}s 37.4% peak-to-2024 decline is the steepest of the three counties, but the gap to its neighbors is narrower than a Napa-only framing would suggest. The entire immediate North Bay has experienced a sustained contraction in family formation over the past two decades.</p>

        <p style={P_STYLE}>The cohort math matters for enrollment forecasting. The cohort entering kindergarten in 2029 will be the cohort born in 2024 {"—"} roughly 1,098 Napa children. The cohort that filled kindergartens in 2014 was the 2009 birth cohort, 1,653 children. The difference is 555 children, a 34% smaller incoming class spread across all six Napa districts. The input variable {"—"} the children being born {"—"} is contracting across the entire region.</p>

        <ChartThree />

        <ChartThreeB />

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION 3 — WITHOUT THE COUNTY OFFICE OF EDUCATION            */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>What the Flat Line Looks Like Without the County Office of Education</h2>

        <p style={P_STYLE}>The +55 students at the Napa County Office of Education contribute meaningfully to the county headline. Subtracting that specialized population from both endpoints clarifies what the unified districts collectively did.</p>

        <p style={P_STYLE}>Without NCOE, Napa County{"’"}s six unified and elementary districts went from 18,427 students in 2023-24 to 18,388 in 2025-26 {"—"} a loss of 39 students, or 0.21% over two years. The adjustment moves Napa from barely positive to slightly negative on a comparable basis with neighboring counties.</p>

        <p style={P_STYLE}>The parallel to Sonoma County is exact in direction and close in magnitude. Sonoma{"’"}s reported +0.34% became -0.19% after removing the Liberty Elementary charter authorizer{"’"}s statewide virtual enrollment. Napa{"’"}s reported +0.09% becomes -0.21% after removing NCOE{"’"}s specialized programs. Napa{"’"}s organic number, on this basis, is fractionally worse than Sonoma{"’"}s.</p>

        <p style={P_STYLE}>The ex-NCOE figure is the cleaner measure of what the regular district enrollment did. It answers the question most readers are asking when they read the headline: did the unified and elementary districts hold ground? They did not. Napa, like its neighbors, lost ground organically over the past two years.</p>

        <ChartFive />

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION 4 — WHAT'S MOVING BENEATH THE FLAT LINE               */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>What{"’"}s Moving Beneath the Flat Line</h2>

        <p style={P_STYLE}>A note on terms before the numbers. English Learner (EL) students are kids whose home language is not English and who have not yet demonstrated English proficiency on California{"’"}s annual English Language Proficiency Assessments for California (<a href="https://www.cde.ca.gov/ta/tg/ep/" target="_blank" rel="noopener noreferrer" style={LINK}>ELPAC</a>). Once a student tests as proficient, they are reclassified as Fluent English Proficient and move out of the EL category. EL enrollment in any given year is a snapshot of students currently receiving language-development services; it is not a measure of immigrant enrollment, which is a broader and separate concept that CDE does not directly publish. It is also distinct from racial or ethnic identity: Hispanic/Latino enrollment, which has been the largest racial/ethnic category in Napa County schools since the 2007 crossover, is not the same as EL enrollment. Most Hispanic/Latino K-12 students in California are English-proficient and not classified as EL. A county can see Hispanic/Latino enrollment hold while EL enrollment falls.</p>

        <p style={P_STYLE}>The headline number is a net of two larger underlying changes. Napa County{"’"}s English Learner enrollment fell from 4,439 students in 2023-24 to 3,865 in 2025-26 {"—"} a decline of 574 students, or 12.9%. In the same two years, non-EL enrollment rose from 14,133 to 14,723 {"—"} an increase of 590 students, or 4.2%. The +16 county headline is the residual of those two moves.</p>

        <p style={P_STYLE}>The EL contraction is distributed across the county. NVUSD lost 412 EL students (-10.5%) on a base of 3,914. St. Helena lost 30 (-19.1%) on a base of 157. Calistoga lost 115 (-42.8%) on a base of 269 {"—"} the steepest absolute drop. Howell Mountain lost 16 of 36; Pope Valley lost 9 of 19. NCOE was the only Napa district to gain EL students, adding 8 to reach 52.</p>

        <p style={P_STYLE}>The non-EL pattern runs the opposite direction. St. Helena{"’"}s +49 enrollment gain is entirely non-EL {"—"} the district added 79 non-EL students while losing 30 EL students. NVUSD{"’"}s near-flat -12 net is the residual of -412 EL students offset by approximately 400 non-EL students. The county{"’"}s stability is, in part, a recomposition.</p>

        <p style={P_STYLE}>The pattern extends across the immediate North Bay. Sonoma lost 1,470 EL students (-11.9%), Mendocino lost 310 (-12.6%), Marin lost 457 (-8.6%), Solano lost 537 (-6.4%). Lake County was the regional exception, adding 29. Napa{"’"}s 12.9% decline is the steepest in the region, but Sonoma and Mendocino are within a point. Whatever is happening is regional, with Napa modestly out front. The within-county distribution is sharper than the cross-county rate captures, however: Calistoga, Howell Mountain and Pope Valley all dropped more than 40% on their EL bases. The regional pattern is broadly similar across counties; Napa{"’"}s pattern is internally uneven in ways that matter for which districts are absorbing the change.</p>

        <p style={P_STYLE}>A contraction in EL enrollment can reflect two different kinds of change, and the distinction matters. One kind keeps students in the system but reclassifies them: an EL student who passes the ELPAC moves from EL to non-EL and is still enrolled. That mechanism reduces EL counts without reducing total enrollment. The other kind removes students from the system entirely: fewer immigrant families arriving with school-age children, intra-county or inter-district movement that takes EL students to other districts, or immigrant families with school-age children leaving the region. That mechanism reduces both EL counts and total enrollment. The Census Day data establishes the magnitude and the geographic distribution. It does not by itself distinguish between reclassification and departure as the underlying cause.</p>

        <ChartFour />

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION 5 — WHERE THE LOSSES ARE SHARPEST: THE UPVALLEY PATTERN */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>Where the Losses Are Sharpest: The Upvalley Pattern</h2>

        <p style={P_STYLE}>Calistoga{"’"}s 42-student decline coincides with a moment when the city itself is gaining residents. The <a href="https://napaserve.org/under-the-hood/napa-population-2025" target="_blank" rel="noopener noreferrer" style={LINK}>May 2026 Napa County population release</a> documented Calistoga{"’"}s 120-resident gain {"—"} the largest percentage gain among Napa County jurisdictions {"—"} and traced it almost entirely to a single project: Lincoln Avenue Apartments, a 78-unit workforce-affordable complex at 1866 Lincoln Avenue that opened in late 2025. The school data offers a specific reading of what that mechanism produced. Calistoga Joint Unified lost 42 students during the same window in which the city it serves added 120 residents. The district{"’"}s English Learner enrollment fell from 269 students to 154 {"—"} a loss of 115 EL students, or 42.8%, the steepest EL contraction of any district in the county and the most pronounced two-year EL drop in the region. The 78 units filled. The district that serves them lost ground in the demographic group that has historically anchored its enrollment.</p>

        <p style={P_STYLE}>The <a href="https://napaserve.org/under-the-hood/napa-population-2025" target="_blank" rel="noopener noreferrer" style={LINK}>Napa County population release</a> made the structural case that Calistoga{"’"}s affordable-housing apparatus is a workaround for a wage problem rather than a solution to a housing-supply problem {"—"} that the dominant local industry{"’"}s wages cannot support family formation at the cost of living in the town. The school data is consistent with that case, though it does not prove it. Workforce-affordable tenants on average skew toward service-sector adults whose household composition and household sizes vary widely from the family-with-school-age-children profile the school data registers. The EL contraction in particular is the school-level signal of the same condition the population piece identified: the historical immigrant-family base that anchored Calistoga{"’"}s EL enrollment is being replaced, in net, by a different tenant base. The mechanism documented in the population piece is consistent with {"—"} though the school data does not by itself establish {"—"} a generational shift in who is moving into Calistoga{"’"}s workforce-affordable units.</p>

        <p style={P_STYLE}>Howell Mountain Elementary and Pope Valley Union Elementary operate at scales where the enrollment figure is closer to a roster than a trend; the loss of 16 students at one and 18 at the other reflects individual family moves more than any structural shift. Across all three contracting upvalley districts the combined two-year loss is 76 students, roughly two-thirds of which is offset by St. Helena{"’"}s +49 gain and the remainder absorbed at the level of the county number by NVUSD{"’"}s near-flat result. The county arithmetic resolves to a result close to zero, but the geographic distribution is real: the upvalley districts are contracting, downvalley is holding, and the rural east is at the floor of what the data can register.</p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION 6 — WHAT THIS LEAVES OPEN                             */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>What This Leaves Open</h2>

        <p style={P_STYLE}>The Census Day release captures composition but not direction of cause. The 574 EL students who left Napa County{"’"}s rolls between 2023-24 and 2025-26 are a measurable population. Why they left {"—"} or whether they left, as opposed to being reclassified {"—"} is not established by the enrollment file alone.</p>

        <p style={P_STYLE}>A note on scope. All public-school figures in this piece come from CDE{"’"}s Census Day release. Private and parochial schools are reported separately through California{"’"}s Private School Affidavit program {"—"} a self-reported, voluntary filing whose completeness varies year to year. For the overlap window (2019-20 through 2024-25), Napa County{"’"}s private K-12 enrollment held essentially flat at roughly 2,500-2,600 students, a 3% gain on a small base. Public enrollment over the same window fell by 1,437. The combined public-plus-private decline is roughly 6% over five years. Private enrollment did not absorb the public decline {"—"} the demographic curve underneath both is the cleaner explanation. Homeschooling and learning pods are not captured in either data series and remain an unmeasured residual.</p>

        <p style={P_STYLE}>Three additional questions remain open at this writing. The NCOE +55 includes some component of student movement from home districts to specialized settings; the share of that figure that represents organic program growth versus reclassification of students previously counted elsewhere is not resolvable from CDE data. The <a href="https://dof.ca.gov/forecasting/demographics/estimates-e1/" target="_blank" rel="noopener noreferrer" style={LINK}>May 1, 2026 California Department of Finance E-1 population estimates</a> for Napa County{"’"}s jurisdictions provide the population context against which the enrollment picture should be read; those figures are pulled separately. And the <a href="https://dof.ca.gov/forecasting/demographics/estimates-e4/" target="_blank" rel="noopener noreferrer" style={LINK}>DOF E-4 historical series</a> anchors Napa County{"’"}s 2015 peak at approximately 141,530 residents {"—"} a benchmark the current series can be measured against.</p>

        <p style={P_STYLE}>A fourth question worth flagging is the relationship between the EL contraction and broader state-level immigration dynamics. The May 2026 California Department of Finance E-1 release attributed California{"’"}s population decline this year specifically to federal immigration policy changes {"—"} legal international migration cut by more than half compared to the prior year, an effect the DOF release named explicitly. Whether and how that state-level dynamic shows up in Napa County school data is a question the Census Day file alone cannot resolve, and the CDE reclassification dataset that would help distinguish students leaving the system from students reclassifying within it has not been published for years more recent than 2020-21. The composition of the 574-student EL decline is the natural follow-on inquiry for the 2026-27 release and beyond, once more recent reclassification data becomes available.</p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION 7 — THE 2026-27 RELEASE WILL TELL US WHICH LINE MOVES */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>The 2026-27 Release Will Tell Us Which Line Moves</h2>

        <p style={P_STYLE}>Three lines are currently in tension in the Napa data. Napa Valley Unified is holding flat through a recomposition that has the same magnitude in each direction. St. Helena Unified is gaining ground in a slice of the county where families with means continue to locate. The three upvalley districts are contracting on a base of small numbers and a shrinking EL population.</p>

        <p style={P_STYLE}>Underneath all three is a regional birth curve that has been contracting for two decades, with Napa marginally leading the contraction. Looking backward from 2025-26, the longer arc is unmistakable: Napa County{"’"}s public K-12 enrollment peaked at 21,002 in 2014-15 and has lost roughly 2,400 students over the eleven years since, an 11.5% decline. Underneath that total, the demographic composition has reversed {"—"} White and Hispanic/Latino enrollment crossed in 2007, and by 2020-21 Hispanic/Latino students outnumbered White students more than two to one. The recent two-year flat result sits at the bottom of that long decline, not in the middle of it.</p>

        <ChartSix />

        <p style={P_STYLE}>The question for the next release is which of the three lines moves first. NVUSD{"’"}s flat trajectory survives one more year of EL contraction only if the non-EL gain keeps offsetting it. St. Helena{"’"}s +4.44% gain survives only if the families locating to the upvalley keep choosing it. The upvalley contraction continues unless something arrests it. The release in April 2027 will tell us which of those three is the most brittle.</p>

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
              <a href="https://napaserve.org/under-the-hood/napa-population-2025" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Napa County Shrunk as Calistoga Grew and the Base Faltered{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (May 14, 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napaserve.org/under-the-hood/napa-marketing-machine-2026" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}The Challenges of Napa{"’"}s Massive Marketing Machine{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (May 7, 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napaserve.org/under-the-hood/napa-lodging-pricing-2026" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Napa Valley Adds Rooms While Demand Lags{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (April 30, 2026)</span>
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
              placeholder="Search enrollment, NVUSD, EL, births, Calistoga, recomposition..."
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
            Enrollment figures for public K-12 districts come from California Department of Education Census Day Enrollment releases for 2023-24, 2024-25 and 2025-26 (April 16, 2026 release). The Census Day count is taken on the first Wednesday in October of each academic year and represents the official enrollment of record for the year. Multi-year enrollment trajectories prior to 2023-24 come from Kidsdata.org, which compiles annual data from CDE DataQuest. The Kidsdata file used in this piece covers 2011-12 through 2020-21. The 2021-22 and 2022-23 academic years are not directly observed in either source for this analysis; the gap is shown explicitly in Chart 6 and is connected via dashed line for visual continuity. Private K-12 enrollment comes from the California Department of Education Private School Affidavit program. Affidavit filing is required but completeness varies year to year {"—"} the 2021-22 file is incomplete because Justin-Siena High School did not file that year. Private affidavit data is acknowledged as self-reported in the chart source line. The White/Hispanic recomposition figures in Chart 6 cover 1993-94 through 2020-21 and come from a separate Kidsdata file (Public School Enrollment by Race/Ethnicity). Race/ethnicity data published by CDE since 2020-21 is not directly included in this piece; the long-arc framing intentionally stops at the most recent year for which the same series is available. English Learner (EL) terminology follows California Department of Education definitions. The CDE Reclassification dataset that would distinguish students moving from EL to fluent within the system from students leaving the system entirely has not been published for academic years more recent than 2020-21. Section 6 of this piece flags this as a methodological limitation. Birth data covering Napa, Marin and Sonoma counties comes from the California Department of Public Health Live Birth Profiles by County dataset, with Geography_Type = Residence (mother{"’"}s county of residence) and Strata = Total Population. Final births by month are aggregated to annual totals; the most recent year in the data is 2024. The ex-NCOE adjustment subtracts Napa County Office of Education enrollment (specialized populations: court schools, special education programs, alternative settings) from both endpoints of the two-year comparison to produce a like-for-like comparison against neighboring counties{"’"} organic district enrollment. Corrections from prior drafts: earlier versions of this piece overstated the gap between Napa{"’"}s birth decline and those of Sonoma and Marin. The corrected figures {"—"} Napa –37.4%, Marin –28.2%, Sonoma –27.1% {"—"} show a tighter regional pattern. The Marin figure was originally reported as –13% in an earlier draft; the corrected figure is reflected throughout the prose and in Charts 3 and 3b.
          </p>
        </div>

        {/* ── SOURCES ─────────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 40, paddingTop: 24 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: T.ink, marginBottom: 16 }}>Sources</h2>
          <ol style={{ fontFamily: font, fontSize: 14, color: T.ink, lineHeight: 1.75, paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>California Department of Education, <a href="https://www.cde.ca.gov/ds/ad/filesenrcensus.asp" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Census Day Enrollment</a>, 2023-24, 2024-25 and 2025-26 releases.</li>
            <li style={{ marginBottom: 8 }}>California Department of Public Health, <a href="https://data.chhs.ca.gov/dataset/live-birth-profiles-by-county" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Live Birth Profiles by County</a>, final births by month, 1995-2024.</li>
            <li style={{ marginBottom: 8 }}>California Department of Education, <a href="https://www.cde.ca.gov/ds/ad/filesreclass.asp" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>English Learner Reclassification Data</a> {"—"} referenced as not-yet-published past 2020-21.</li>
            <li style={{ marginBottom: 8 }}>California Department of Education, <a href="https://www.cde.ca.gov/ta/tg/ep/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>English Language Proficiency Assessments for California (ELPAC)</a> {"—"} reference for EL terminology.</li>
            <li style={{ marginBottom: 8 }}>California Department of Education, <a href="https://www.cde.ca.gov/ds/si/ps/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Private School Affidavit data</a>, 2019-20 through 2024-25.</li>
            <li style={{ marginBottom: 8 }}>California Department of Finance, <a href="https://dof.ca.gov/forecasting/demographics/estimates-e1/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>E-1 Population Estimates</a>, May 2026 release.</li>
            <li style={{ marginBottom: 8 }}>California Department of Finance, <a href="https://dof.ca.gov/forecasting/demographics/estimates-e4/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>E-4 Historical Population Estimates</a>.</li>
            <li style={{ marginBottom: 8 }}><a href="https://www.kidsdata.org/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Kidsdata.org</a>, {"“"}Public School Enrollment by Race/Ethnicity, 1994-2021{"”"} and {"“"}Public School Enrollment 2012-2021{"”"} (compiled from CDE DataQuest).</li>
          </ol>
        </div>

      </div>

      <Footer />
    </div>
  );
}

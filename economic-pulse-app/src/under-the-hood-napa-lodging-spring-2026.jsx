// UNDER THE HOOD — Napa's Spring Rebound Cooled in May as Price Kept Carrying the Load
// -----------------------------------------------------------------
// Slug: napa-lodging-spring-2026
// Publication: Napa Valley Features
// Built from under-the-hood-template.jsx; chart component structure mirrors
// under-the-hood-napa-four-legged-economy-2026.jsx (Lesson E), cream design-system tokens.
// Download geometry: Lesson A canonical (napaserve-under-the-hood-napa-price-discovery.jsx).
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
const ARTICLE_SLUG = "napa-lodging-spring-2026";
const ARTICLE_TITLE = "Napa's Spring Rebound Cooled in May as Price Kept Carrying the Load";
const ARTICLE_DECK = "Napa County's lodging market opened 2026 with a weak January, rebounded from February through April, then gave back its occupancy gains in May, when rooms sold fell 4.4% from a year earlier. Through five months, occupancy was essentially flat year over year while average daily rate rose 3.6%, leaving revenue gains driven again by price rather than volume. The pattern returns Napa to the price-led dynamic the column has tracked since the pandemic, with occupancy still well below its 2019 level. Neighboring Sonoma County, by contrast, kept adding rooms sold, its occupancy up 6.4% year to date.";
const ARTICLE_PUBLICATION = "Napa Valley Features";
const ARTICLE_DATE = "July 5, 2026"; // byline date = today
const SHOW_DECK = true;
const EYEBROW = "Under the Hood";

// ── COUNTY + PUBLICATION (template-compat downstream constants) ────
const PUBLICATION = ARTICLE_PUBLICATION;
const SUBSTACK_URL = "https://napavalleyfocus.substack.com";
const DATELINE_LOCATION = "NAPA VALLEY, Calif."; // 0g — live precedent

// Source link used across captions + sources
const VNV_URL = "https://www.visitnapavalley.com/industry/reports/vnv-monthly/#str-data";

// Internal + external cross-links (0h — verified against live siblings; live > protocol)
const LINK_MARCH_ROOM_PRICE = "https://napavalleyfocus.substack.com/p/when-room-price-can-no-longer-carry"; // Substack-only (March 12, 2026)
const LINK_PRICE_CONTINUES = "https://napavalleyfocus.substack.com/p/under-the-hood-price-continues-to"; // Substack-only (Jan 9, 2026)
const LINK_FOUR_LEGGED = "/under-the-hood/napa-four-legged-economy-2026"; // internal route
const LINK_SONOMA_REBOUND = "[CONFIRM-URL: Sonoma lodging article]"; // 0h STOP: no verified URL — do not fabricate

// ── THEME (cream design-system — standard NapaServe tokens) ────────
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

// Chart-local series palette (precedent: crime-report C.rose/C.blue, four-legged M) —
// three distinguishable tones within the cream family.
const SERIES = { occ: "#8B5E3C", adr: "#C4A050", rev: "#3F6E7D" };
const COUNTY = { napa: "#8B5E3C", sonoma: "#C4A050" };

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

// per-chart h2 (marginTop 0, marginBottom 16 — spec)
const chartH2 = { fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, marginTop: 0, marginBottom: 16 };

const P_STYLE = prose;
const SECTION_H2 = h2style;
const LINK = { color: T.accent };

// ── SECTIONS (all, including closing "Bottom Line") ────────────────
// eslint-disable-next-line no-unused-vars
const SECTIONS = [
  "The Shape of the Year So Far",
  "May Put Price Back in Charge",
  "Two Counties, Two Different Recoveries",
  "Still Below 2019",
  "The Segments Still Split",
  "Napa Against Its Neighbors",
  "The Upvalley Split",
  "What Still Hangs Over the Numbers",
  "Bottom Line",
];

// ── POLLS (mirrors seeder + admin substackPolls; ids auto-assign) ──
const POLLS = [
  {
    question: "What best explains Napa's flat room demand?",
    options: [
      "Room rates are too high",
      "Fewer visitors overall",
      "Competition from Sonoma",
      "Too many new hotel rooms",
      "Normal post-pandemic reset",
    ],
  },
  {
    question: "Should Napa hotels cut rates to fill more rooms?",
    options: [
      "Yes, volume matters more",
      "No, protect the brand",
      "Only at the value end",
      "Only in the off-season",
      "Let the market decide",
    ],
  },
  {
    question: "Where does Napa lodging go from here?",
    options: [
      "Occupancy recovers to 2019",
      "Price keeps carrying revenue",
      "Both rate and volume slip",
      "Luxury pulls further ahead",
      "Too early to tell",
    ],
  },
];

// ── DOWNLOAD HELPER (Lesson A canonical geometry — price-discovery) ─
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

// Cream chart shell — the captured surface (containerRef lives here).
function ChartShell({ innerRef, children }) {
  return (
    <div ref={innerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
      <div style={{ overflowX: "auto", width: "100%" }}>
        <div style={{ minWidth: 640 }}>
          <div style={{ position: "relative", height: 360 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

// Shared grouped-bar options builder (symmetric explicit axis padding — Lesson F).
function groupedBarOptions({ yMin, yMax, yTickFmt, legend = true }) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: legend ? { position: "top", labels: { font: { family: font, size: 12 }, color: T.ink, usePointStyle: true, boxWidth: 8 } } : { display: false },
      tooltip: { callbacks: { label: (item) => `${item.dataset.label}: ${item.parsed.y > 0 ? "+" : ""}${item.parsed.y}%` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: font, size: 12 }, color: T.ink } },
      y: {
        min: yMin,
        max: yMax,
        grid: { color: T.rule },
        ticks: { font: { family: font, size: 11 }, color: T.muted, callback: yTickFmt },
      },
    },
  };
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

// ════════════════════════════════════════════════════════════════════
// CHART 1 — Monthly YoY 2026 (grouped bar: Occupancy / ADR / RevPAR × Jan-May)
// ════════════════════════════════════════════════════════════════════
const CHART1_TITLE = "Napa County Lodging: Occupancy Wavered While Rate Kept Climbing";

function ChartOne() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [
          { label: "Occupancy", data: [-1.8, 6.0, 1.2, 2.3, -4.4], backgroundColor: SERIES.occ, borderRadius: 3 },
          { label: "ADR", data: [-3.3, 4.4, 4.9, 4.9, 5.1], backgroundColor: SERIES.adr, borderRadius: 3 },
          { label: "RevPAR", data: [-5.0, 10.7, 6.2, 7.3, 0.4], backgroundColor: SERIES.rev, borderRadius: 3 },
        ],
      },
      options: groupedBarOptions({ yMin: -8, yMax: 12.5, yTickFmt: (v) => (v > 0 ? "+" : "") + v + "%" }),
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={chartH2}>{CHART1_TITLE}</h2>
      <ChartShell innerRef={containerRef}>
        <canvas ref={canvasRef} role="img" aria-label="Grouped bar chart of Napa County lodging year-over-year change by month, January through May 2026, for occupancy, average daily rate and RevPAR. Occupancy fell 1.8% in January, rose through April, then fell 4.4% in May, while rate rose every month after January." />
      </ChartShell>
      <div>
        <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-1_napa-lodging-spring-2026_nvf.png", CHART1_TITLE)} />
      </div>
      <Caption
        title={CHART1_TITLE}
        description="Occupancy fell year over year in January, rose from February through April, then dropped 4.4% in May, while average daily rate rose every month after January."
        sources={[{ label: "STR competitive set, Visit Napa Valley Monthly Industry Report", url: VNV_URL }]}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// CHART 2 — YTD YoY, Napa vs Sonoma (grouped bar by metric)
// ════════════════════════════════════════════════════════════════════
const CHART2_TITLE = "Two Recoveries: Napa Leaned on Rate, Sonoma on Volume";

function ChartTwo() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Occupancy", "ADR", "RevPAR"],
        datasets: [
          { label: "Napa", data: [0.4, 3.6, 4.0], backgroundColor: COUNTY.napa, borderRadius: 3 },
          { label: "Sonoma", data: [6.4, 0.9, 7.4], backgroundColor: COUNTY.sonoma, borderRadius: 3 },
        ],
      },
      options: groupedBarOptions({ yMin: 0, yMax: 8, yTickFmt: (v) => "+" + v + "%" }),
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={chartH2}>{CHART2_TITLE}</h2>
      <ChartShell innerRef={containerRef}>
        <canvas ref={canvasRef} role="img" aria-label="Grouped bar chart comparing Napa and Sonoma counties' year-to-date change through May 2026 in occupancy, average daily rate and RevPAR. Napa's gains came almost entirely from rate; Sonoma's from occupancy." />
      </ChartShell>
      <div>
        <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-2_napa-lodging-spring-2026_nvf.png", CHART2_TITLE)} />
      </div>
      <Caption
        title={CHART2_TITLE}
        description="Year to date through May, Napa's gains came almost entirely from rate while its occupancy held flat; Sonoma's came almost entirely from occupancy."
        sources={[{ label: "STR competitive set, Visit Napa Valley Monthly Industry Report", url: VNV_URL }]}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// CHART 3 — Indexed line, 2019 = 100 (ADR vs Occupancy, full-year)
// ════════════════════════════════════════════════════════════════════
const CHART3_TITLE = "Napa's Price Climbed While Room Demand Stayed Below 2019";

function ChartThree() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["2019", "2023", "2024", "2025"],
        datasets: [
          {
            label: "ADR (2019 = 100)",
            data: [100, 131.2, 127.7, 128.9],
            borderColor: SERIES.adr,
            backgroundColor: SERIES.adr,
            borderWidth: 2.5,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: SERIES.adr,
          },
          {
            label: "Occupancy (2019 = 100)",
            data: [100, 86.8, 88.6, 90.9],
            borderColor: SERIES.occ,
            backgroundColor: SERIES.occ,
            borderWidth: 2.5,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: SERIES.occ,
          },
          {
            label: "2019 baseline",
            data: [100, 100, 100, 100],
            borderColor: T.muted,
            borderDash: [6, 4],
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", labels: { font: { family: font, size: 12 }, color: T.ink, usePointStyle: true, boxWidth: 8 } },
          tooltip: { callbacks: { label: (item) => `${item.dataset.label}: ${item.parsed.y}` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: font, size: 12 }, color: T.ink } },
          y: { min: 80, max: 135, grid: { color: T.rule }, ticks: { font: { family: font, size: 11 }, color: T.muted } },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={chartH2}>{CHART3_TITLE}</h2>
      <ChartShell innerRef={containerRef}>
        <canvas ref={canvasRef} role="img" aria-label="Indexed line chart with 2019 set to 100, showing Napa County full-year average daily rate rising to about 129 by 2025 while occupancy remained below 100, at about 91, with a dashed reference line at the 2019 baseline of 100." />
      </ChartShell>
      <div>
        <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-3_napa-lodging-spring-2026_nvf.png", CHART3_TITLE)} />
      </div>
      <Caption
        title={CHART3_TITLE}
        description="Indexed to 2019, full-year occupancy remained below its pre-pandemic level through 2025 even as average daily rate rose well above it."
        sources={[{ label: "STR, Visit Napa Valley Monthly Industry Report", url: VNV_URL }]}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// CHART 4 — YTD YoY by service type (grouped bar: Occ / ADR / RevPAR)
// ════════════════════════════════════════════════════════════════════
const CHART4_TITLE = "The Segments Still Split: Luxury Led, Limited-Service Lagged";

function ChartFour() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Luxury", "Limited-Service", "Group"],
        datasets: [
          { label: "Occupancy", data: [5.2, -2.1, -0.3], backgroundColor: SERIES.occ, borderRadius: 3 },
          { label: "ADR", data: [4.5, -0.3, 1.2], backgroundColor: SERIES.adr, borderRadius: 3 },
          { label: "RevPAR", data: [10.0, -2.4, 0.8], backgroundColor: SERIES.rev, borderRadius: 3 },
        ],
      },
      options: groupedBarOptions({ yMin: -6, yMax: 12, yTickFmt: (v) => (v > 0 ? "+" : "") + v + "%" }),
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={chartH2}>{CHART4_TITLE}</h2>
      <ChartShell innerRef={containerRef}>
        <canvas ref={canvasRef} role="img" aria-label="Grouped bar chart of Napa County lodging year-to-date change by service type through May 2026. Luxury led with occupancy up 5.2%, ADR up 4.5% and RevPAR up 10%; limited-service was down on occupancy and RevPAR; group was roughly flat." />
      </ChartShell>
      <div>
        <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-4_napa-lodging-spring-2026_nvf.png", CHART4_TITLE)} />
      </div>
      <Caption
        title={CHART4_TITLE}
        description="Year to date, luxury hotels posted the strongest year-over-year gains across occupancy, ADR and RevPAR, while limited-service properties were down on occupancy and RevPAR — a reversal from January, when luxury was the weak point."
        sources={[{ label: "STR competitive set, Visit Napa Valley Monthly Industry Report", url: VNV_URL }]}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// CHART 5 — Scatter, YTD levels (x = occupancy %, y = ADR $)
// ════════════════════════════════════════════════════════════════════
const CHART5_TITLE = "Napa Sells the Fewest Nights at the Highest Price";

const SCATTER_POINTS = [
  { name: "Napa", x: 60.3, y: 409.15, accent: true, align: "left", dx: 10, dy: -2 },
  { name: "Sonoma", x: 59.4, y: 199.10, align: "left", dx: 8, dy: 4 },
  { name: "San Luis Obispo", x: 63.8, y: 180.25, align: "left", dx: 8, dy: 4 },
  { name: "Santa Barbara", x: 66.0, y: 244.00, align: "right", dx: -8, dy: 4 },
  { name: "Monterey", x: 67.2, y: 255.45, align: "left", dx: 8, dy: -2 },
  { name: "San Francisco", x: 70.3, y: 291.54, align: "right", dx: -8, dy: -2 },
];

function ChartFive() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext("2d");

    const scatterLabels = {
      id: "scatterLabels",
      afterDatasetsDraw(chart) {
        const c = chart.ctx;
        const xs = chart.scales.x;
        const ys = chart.scales.y;
        c.save();
        c.textBaseline = "middle";
        SCATTER_POINTS.forEach((p) => {
          const px = xs.getPixelForValue(p.x) + p.dx;
          const py = ys.getPixelForValue(p.y) + p.dy;
          c.font = (p.accent ? "700 " : "500 ") + "12px " + font;
          c.fillStyle = p.accent ? T.accent : T.muted;
          c.textAlign = p.align;
          c.fillText(p.name, px, py);
        });
        c.restore();
      },
    };

    chartRef.current = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Competitive-set counties",
            data: SCATTER_POINTS.map((p) => ({ x: p.x, y: p.y })),
            pointBackgroundColor: SCATTER_POINTS.map((p) => (p.accent ? T.accent : T.muted)),
            pointBorderColor: "#fff",
            pointBorderWidth: 1.5,
            pointRadius: SCATTER_POINTS.map((p) => (p.accent ? 7 : 5)),
            pointHoverRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 16, left: 8 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => {
                const p = SCATTER_POINTS[item.dataIndex];
                return `${p.name}: ${p.x}% occ, $${p.y.toFixed(2)} ADR`;
              },
            },
          },
        },
        scales: {
          x: { type: "linear", min: 56, max: 72, grid: { color: T.rule }, ticks: { font: { family: font, size: 11 }, color: T.muted, callback: (v) => v + "%" }, title: { display: true, text: "Occupancy (year to date)", color: T.muted, font: { family: font, size: 11, weight: "600" } } },
          y: { type: "linear", min: 150, max: 430, grid: { color: T.rule }, ticks: { font: { family: font, size: 11 }, color: T.muted, callback: (v) => "$" + v }, title: { display: true, text: "Average daily rate (year to date)", color: T.muted, font: { family: font, size: 11, weight: "600" } } },
        },
      },
      plugins: [scatterLabels],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={chartH2}>{CHART5_TITLE}</h2>
      <ChartShell innerRef={containerRef}>
        <canvas ref={canvasRef} role="img" aria-label="Scatter plot of competitive-set counties by year-to-date occupancy on the horizontal axis and average daily rate on the vertical axis. Napa sits at 60.3% occupancy and $409.15 ADR — the highest rate and second-lowest occupancy in the set." />
      </ChartShell>
      <div>
        <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-5_napa-lodging-spring-2026_nvf.png", CHART5_TITLE)} />
      </div>
      <Caption
        title={CHART5_TITLE}
        description="Among competitive-set counties year to date, Napa carried the highest average daily rate and the highest RevPAR while running the second-lowest occupancy."
        sources={[{ label: "STR competitive set, Visit Napa Valley Monthly Industry Report", url: VNV_URL }]}
      />
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

// ── MAIN COMPONENT ─────────────────────────────────────────────────
export default function UnderTheHoodNapaLodgingSpring2026() {
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

        {/* ── EYEBROW ────────────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          {EYEBROW} {"·"} {ARTICLE_PUBLICATION}
        </p>

        {/* ── HEADLINE ───────────────────────────────────────────── */}
        <h1 style={{ fontFamily: serif, fontSize: 34, fontWeight: 700, color: T.ink, lineHeight: 1.25, marginBottom: 16 }}>
          {ARTICLE_TITLE}
        </h1>

        {/* ── BYLINE + DATE ──────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.muted, marginBottom: 16 }}>
          By Tim Carl {"·"} {ARTICLE_DATE}
        </p>

        {/* ── DECK ───────────────────────────────────────────────── */}
        {SHOW_DECK && (
          <p style={{ fontFamily: serif, fontSize: 18, color: T.muted, lineHeight: 1.6, marginBottom: 24, fontStyle: "italic" }}>
            {ARTICLE_DECK}
          </p>
        )}

        {/* ── SUBSTACK LINK ──────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 13, color: T.muted, marginBottom: 32, borderBottom: `1px solid ${T.border}`, paddingBottom: 20 }}>
          Read on{" "}
          <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>
            {ARTICLE_PUBLICATION} on Substack {"→"}
          </a>
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* LEDE (first body paragraph carries the dateline)             */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <p style={{ ...P_STYLE, marginBottom: 18 }}>
          <span style={{ fontWeight: 700 }}>{DATELINE_LOCATION} —</span>{" "}In March, this column read a warning into a single soft month, arguing in <em><a href={LINK_MARCH_ROOM_PRICE} target="_blank" rel="noopener noreferrer" style={LINK}>When Room Price Can No Longer Carry the Load</a></em> (March 2026) that January’s simultaneous drop in occupancy and rate might signal the limits of Napa County’s price-led hotel model. February through April complicated that read: The market rebounded, and for the first time in months it did so on both volume and price. Then May arrived, and the volume half of that recovery gave way.
        </p>

        <p style={P_STYLE}>
          Three measures anchor this beat. Occupancy is the share of available rooms sold. Average daily rate, or ADR, is the average price paid for the rooms that sold. RevPAR, revenue per available room, folds the two together. Watching which one leads — volume or price — is the difference between a market filling rooms and a market defending rate.
        </p>

        {/* ── SECTION: The Shape of the Year So Far ───────────────── */}
        <h2 style={SECTION_H2}>The Shape of the Year So Far</h2>
        <p style={P_STYLE}>
          Napa County’s occupancy fell 1.8% year over year in January, rose 6% in February, 1.2% in March and 2.3% in April, then fell 4.4% in May, according to STR competitive-set data compiled in Visit Napa Valley’s monthly industry reports. Average daily rate followed a steadier path: down 3.3% in January, then up every month after — 4.4%, 4.9%, 4.9% and 5.1% through May.
        </p>

        <ChartOne />

        <p style={P_STYLE}>
          Through five months, the two lines net to a familiar shape. Year-to-date occupancy stood at 60.3%, up just 0.4% from the same period in 2025 — essentially flat. Average daily rate reached $409.15, up 3.6%. RevPAR rose 4% to $246.84. Nearly all of the topline gain came from price.
        </p>

        {/* ── SECTION: May Put Price Back in Charge ───────────────── */}
        <h2 style={SECTION_H2}>May Put Price Back in Charge</h2>
        <p style={P_STYLE}>
          May is normally one of Napa’s stronger months, and in absolute terms it was: occupancy of 71% and an average daily rate of $546.25. But measured against May 2025, occupancy fell 4.4% while rate rose 5.1%, leaving RevPAR essentially flat at plus-0.4%. Visit Napa Valley’s own summary noted that Napa “led with rate over occupancy” for the month.
        </p>
        <p style={P_STYLE}>
          That is the price-led pattern in miniature: fewer rooms sold, each at a higher price, revenue holding roughly steady. It is the same dynamic the column flagged in March, reasserting itself after a three-month interruption.
        </p>

        {/* ── SECTION: Two Counties, Two Different Recoveries ─────── */}
        <h2 style={SECTION_H2}>Two Counties, Two Different Recoveries</h2>
        <p style={P_STYLE}>
          The contrast with Sonoma County, whose 2026 rebound this column examined in <em><a href={LINK_SONOMA_REBOUND} target="_blank" rel="noopener noreferrer" style={LINK}>Sonoma County’s Lodging Rebound Is Running on Volume, Not Rate</a></em>, has only sharpened. Through May, Sonoma’s occupancy was up 6.4% year to date while its average daily rate rose just 0.9%. Napa’s occupancy was up 0.4% while its rate rose 3.6%.
        </p>

        <ChartTwo />

        <p style={P_STYLE}>
          The two counties are recovering along opposite axes: Sonoma is filling more rooms at prices it can barely lift, while Napa is holding — and modestly raising — the highest rates in the region without adding volume. Neither is unambiguously healthier. Sonoma’s growth shows demand returning but little pricing power; Napa’s shows pricing power intact but demand that is not expanding. Napa’s average daily rate of $409.15 remained the highest of any county in the competitive set, and its RevPAR of $246.84 was now the highest as well, moving ahead of a San Francisco market that had led earlier in the year on demand around Super Bowl LX, played Feb. 8 at Levi’s Stadium in Santa Clara.
        </p>

        {/* ── SECTION: Still Below 2019 ───────────────────────────── */}
        <h2 style={SECTION_H2}>Still Below 2019</h2>
        <p style={P_STYLE}>
          Year-over-year comparisons measure 2026 against a soft 2025, not against the market’s pre-pandemic peak. On that longer baseline, Napa’s hotels remain structurally short on volume.
        </p>

        <ChartThree />

        <p style={P_STYLE}>
          Full-year 2025 occupancy was 64.6%, still 6.5 percentage points below 2019’s 71.1%, even as average daily rate rose 28.9% over the same period and RevPAR climbed 17.1%. The mechanism is the one prior reporting has described in <em><a href={LINK_PRICE_CONTINUES} target="_blank" rel="noopener noreferrer" style={LINK}>Price Continues to Carry Napa Hotel Market as Room-Night Demand Lags</a></em>: supply grew about 5.2% above 2019 while room-night demand fell about 4.4%, leaving the county selling a smaller share of a larger inventory. The early-2026 data did little to close that gap. Through May, Napa sold about 482,000 room nights against roughly 799,000 available — some 317,000 unsold — essentially unchanged from the same period in 2025, when about 316,000 went unsold. The year-over-year demand gain was matched almost exactly by added supply.
        </p>

        {/* ── SECTION: The Segments Still Split ────────────────────── */}
        <h2 style={SECTION_H2}>The Segments Still Split</h2>
        <p style={P_STYLE}>
          The divergence by hotel type that emerged this spring held through May.
        </p>

        <ChartFour />

        <p style={P_STYLE}>
          Year to date, luxury hotels posted the strongest gains of any service type — occupancy up 5.2%, average daily rate up 4.5% and RevPAR up 10%. Limited-service hotels, the value end, were the laggards, down on both occupancy and RevPAR. The reversal from January, when luxury was the softest tier, has persisted, though luxury’s 56.7% year-to-date occupancy remained the lowest of the three service types. Napa’s high end is commanding rate; its value end is not.
        </p>

        {/* ── SECTION: Napa Against Its Neighbors ──────────────────── */}
        <h2 style={SECTION_H2}>Napa Against Its Neighbors</h2>
        <p style={P_STYLE}>
          Placed against the full competitive set, Napa’s position is unmistakable and unchanged by five months of movement.
        </p>

        <ChartFive />

        <p style={P_STYLE}>
          Napa carried the highest average daily rate in the set and, through May, the highest RevPAR — yet its 60.3% occupancy was the second-lowest, ahead of only Sonoma. Monterey, San Luis Obispo and Santa Barbara all ran higher occupancy at far lower rates; San Francisco, lifted earlier by the Super Bowl, led the set on occupancy. The fewest nights sold at the highest price is the durable shape of the Napa market.
        </p>

        {/* ── SECTION: The Upvalley Split ──────────────────────────── */}
        <h2 style={SECTION_H2}>The Upvalley Split</h2>
        <p style={P_STYLE}>
          Within the county, the jurisdictions again diverged along the same volume-versus-rate line. Calistoga sold slightly fewer rooms year to date, occupancy down 0.9%, but posted one of the largest rate gains of any jurisdiction, average daily rate up 8.3% to $558.18 — the clearest price-led result upvalley. St. Helena was flat, occupancy off 0.4% and rate unchanged. Yountville and the unincorporated county again led on volume, occupancy up 4% and 9.7% respectively, though from lower occupancy levels. American Canyon, the value gateway, ran the highest occupancy of any jurisdiction at 69.3% while carrying by far the lowest rate.
        </p>

        {/* ── SECTION: What Still Hangs Over the Numbers ──────────── */}
        <h2 style={SECTION_H2}>What Still Hangs Over the Numbers</h2>
        <p style={P_STYLE}>
          The five-month picture is unfolding against conditions prior reporting has documented: a supply pipeline that was still adding rooms to a market not expanding room-night demand, a wine economy working through soft demand and a hospitality-financing environment earlier reporting described as tightening, both examined in <em><a href={LINK_FOUR_LEGGED} style={LINK}>Under the Hood: Napa County’s Last Stable Leg Is Showing Cracks</a></em>.
        </p>

        {/* ── SECTION: Bottom Line (closer) ────────────────────────── */}
        <h2 style={SECTION_H2}>Bottom Line</h2>
        <p style={P_STYLE}>
          Napa County’s spring rebound was real but narrow. It reached rate, which held and grew, but its volume gains did not survive May, when occupancy fell back below year-earlier levels and price returned to carrying the topline on its own. Through five months, the county is selling about as many rooms as it did a year ago, at somewhat higher prices, and still well below the share of inventory it moved in 2019. The question the March column raised has not been answered so much as deferred: whether Napa can turn its pricing power into sustained room-night demand, or whether price will keep doing the work of a recovery that volume has not joined.
        </p>

        {/* ── BYLINE (italic) ─────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.ink, fontStyle: "italic", lineHeight: 1.65, margin: "32px 0 0 0" }}>
          Tim Carl is a Napa Valley-based photojournalist.
        </p>

        {/* ── POLLS SECTION (directly after byline) ────────────────── */}
        <PollsSection slug={ARTICLE_SLUG} />

        {/* ── RELATED COVERAGE (plain link list) ──────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 48, paddingTop: 28, marginBottom: 28 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center", marginBottom: 20 }}>
            Related Coverage
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href={LINK_MARCH_ROOM_PRICE} target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}When Room Price Can No Longer Carry the Load{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (March 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href={LINK_PRICE_CONTINUES} target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Price Continues to Carry Napa Hotel Market as Room-Night Demand Lags{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (January 9, 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href={LINK_SONOMA_REBOUND} target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Sonoma County’s Lodging Rebound Is Running on Volume, Not Rate{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Sonoma County Features (2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href={LINK_FOUR_LEGGED} style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Napa County’s Last Stable Leg Is Showing Cracks{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (July 1, 2026)</span>
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
              placeholder="Search lodging, occupancy, ADR, RevPAR, STR, tourism..."
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
          <ul style={{ fontFamily: font, fontSize: 14, color: T.muted, lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
            <li style={{ marginBottom: 8 }}>Data: STR (Smith Travel Research) competitive-set tables compiled in Visit Napa Valley monthly industry reports; year-to-date figures cover January-May 2026 vs the same 2025 period.</li>
            <li style={{ marginBottom: 8 }}>Occupancy reconciliation: the source’s demand-by-month table prints YTD occupancy as 61.3%; the competitive-set table and room-night totals (482,302 sold / 799,451 available) yield 60.3%. This article uses 60.3%.</li>
            <li style={{ marginBottom: 8 }}>Pre-pandemic comparisons use full-year 2019 figures; January-May 2019 room-night data was not available in the source reports, so the 2019 comparison is full-year based.</li>
            <li style={{ marginBottom: 8 }}>Room-night “unsold” figures are supply minus demand as reported.</li>
          </ul>
        </div>

        {/* ── SOURCES ─────────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 40, paddingTop: 24 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: T.ink, marginBottom: 16 }}>Sources</h2>
          <ol style={{ fontFamily: font, fontSize: 14, color: T.ink, lineHeight: 1.75, paddingLeft: 20 }}>
            <li style={{ marginBottom: 10 }}>STR (Smith Travel Research) data via <a href={VNV_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Visit Napa Valley Monthly Industry Report, May 2026</a>.</li>
            <li style={{ marginBottom: 10 }}>Prior Napa Valley Features reporting as linked in Related Coverage.</li>
          </ol>
        </div>

      </div>

      <Footer />
    </div>
  );
}

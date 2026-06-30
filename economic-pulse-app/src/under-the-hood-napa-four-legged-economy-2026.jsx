// UNDER THE HOOD — Napa County's Last Stable Leg Is Showing Cracks
// -----------------------------------------------------------------
// Slug: napa-four-legged-economy-2026
// Publication: Napa Valley Features
// Source of record: UTH_Wine_Reliance_Update_2026_DC6.docx (Part 1 prose verbatim).
// Supersedes the retired napa-tax-base-2026 draft.
//
// CHART TREATMENT — MODERN (off design-system, intentional; DC6 Part 2):
//   White ground, Poppins, teal/amber palette, hairline grid, dots with white
//   halos, napaserve.org watermark. These tokens live ONLY in this file (const M)
//   pending a call with Helen — they are NOT folded into the global cream tokens.
//   The article CHROME (eyebrow, byline, summary, polls, sources) stays on the
//   standard cream tokens (T); only the three figures use M.
//
// TWO EDITORIAL HOLDS remain IN the prose intentionally (do not strip):
//   1. SRGA [VERIFY ...] flag — taxpayer #7 unidentified pending Assessor lookup.
//   2. Benessere "pending sale at $10.15 million … closing about 30 days out".
// Publish only via the Admin page — never via a const flag here.
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
const ARTICLE_SLUG = "napa-four-legged-economy-2026";
const ARTICLE_TITLE = "Under the Hood: Napa County’s Last Stable Leg Is Showing Cracks";
// DECK + SUMMARY derived from DC6 verbatim framing (Poll 1 + closing section) —
// DC6 ships no standalone deck/summary; flagged for Tim's confirm at HOLD.
const ARTICLE_DECK = "Three of Napa County’s four economic legs — wine, tourism and hospitality jobs — are slipping while the property-tax base holds. The leg still reading strong is the one most exposed to what happens next.";
const ARTICLE_SUMMARY = "Napa County’s 2024 winegrape crop fell 14.4% to $1.03 billion, lodging-tax receipts stayed flat and its 10 largest employers have shed a net 1,775 jobs since 2016. Yet the assessed-value tax roll climbed to $55.77 billion and property tax revenue rose 5.6%, leaving the county’s fourth economic leg — the one most concentrated in the same wine and hospitality real estate now repricing — carrying the other three. Under Proposition 13 the roll lags the market, so the surplus can persist even as Benessere Vineyards, Stanly Ranch and Treasury Wine Estates signal the repricing has begun.";
const ARTICLE_PUBLICATION = "Napa Valley Features";
const ARTICLE_DATE = "July 1, 2026"; // Go-live Wed July 1; dateline matches publish day (Saturday cadence waived).
const SHOW_DECK = true;
const EYEBROW = "Under the Hood";

// ── COUNTY + PUBLICATION (template-compat downstream constants) ────
const PUBLICATION = ARTICLE_PUBLICATION;
const SUBSTACK_URL = "https://napavalleyfocus.substack.com";
const ACFR_URL = "https://www.napacounty.gov/308/County-Financial-and-Budget-Reports";
const CROP_REPORTS_URL = "https://www.napacounty.gov/258/Crop-Reports";
const TWE_DRINKS_BUSINESS_URL = "https://www.thedrinksbusiness.com/2026/06/treasury-cuts-brands-in-bid-to-revive-growth/";
const WINES_VINES_TWE_URL = "https://winesvinesanalytics.com/template.cfm?content=171031&section=features";
const BENESSERE_PD_URL = "https://www.pressdemocrat.com/2026/06/25/napa-valley-winery-benessere-vineyards-auction-closes/";
const BENESSERE_RELEASE_URL = "https://www.einpresswire.com/article/922449025/napa-vineyard-estate-pending-sale-for-10-15m-in-77-days-via-concierge-auctions-new-global-wine-vineyards-division";

// ── THEME (cream chrome — standard NapaServe tokens) ───────────────
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

// ── MODERN CHART TOKENS (LOCAL ONLY — DC6 Part 2; pending Helen) ───
const M = {
  bg: "#FFFFFF",
  primary: "#1F6F8B",
  crop: "#E08A3C",
  cropCallout: "#C56A1E",
  gain: "#2E8B7F",
  loss: "#C0563E",
  unidentified: "#9AA0A6",
  grid: "#ECECEC",
  ink: "#2C1810",
};
const poppins = "'Poppins', system-ui, -apple-system, sans-serif";
const CHART_SUBTITLE = { fontFamily: poppins, fontSize: 14, color: "#8A9099", margin: "0 0 14px", lineHeight: 1.4 };

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

// Aliases used in inline body prose
const P_STYLE = prose;
const SECTION_H2 = h2style;
const LINK = { color: T.accent };

// Editorial draft-flag marker — keeps DC6 [VERIFY ...] text intact and visible.
const VERIFY_FLAG = {
  fontStyle: "italic",
  color: "#9A5B2C",
  background: "rgba(196,160,80,0.14)",
  padding: "0 3px",
  borderRadius: 2,
};

// ── SCOPED POPPINS LOADER ──────────────────────────────────────────
// Poppins is not loaded globally (not in index.html / index.css). Inject it
// scoped to this article only, on mount, guarded so it loads once.
function useScopedPoppins() {
  useEffect(() => {
    const ID = "poppins-four-legged-economy";
    if (document.getElementById(ID)) return;
    const link = document.createElement("link");
    link.id = ID;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

// ── DOWNLOAD HELPER (Lesson A geometry; modern tokens for this piece) ──
// Geometry LOCKED per May 12 (scale 2, off.height+80, drawImage 0,60, title
// 32px @28,16, watermark 26px @w-24,h-28 alpha 0.25). Title font + ground are
// modern (Poppins / white) because this piece's figures are off design-system.
async function downloadComponentPng(containerRef, filename, title) {
  if (!containerRef.current) return;
  const { default: html2canvas } = await import("html2canvas");
  const canvas = await html2canvas(containerRef.current, {
    scale: 2,
    useCORS: true,
    backgroundColor: M.bg,
  });
  const off = document.createElement("canvas");
  off.width = canvas.width;
  off.height = canvas.height + 80;
  const ctx = off.getContext("2d");
  ctx.fillStyle = M.bg;
  ctx.fillRect(0, 0, off.width, off.height);
  ctx.drawImage(canvas, 0, 60);
  ctx.save();
  ctx.globalAlpha = 1.0;
  ctx.font = "700 32px 'Poppins', system-ui, sans-serif";
  ctx.fillStyle = M.ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(title || "", 28, 16);
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.font = "26px 'Source Code Pro', monospace";
  ctx.fillStyle = M.unidentified;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("napaserve.org", off.width - 24, off.height - 28);
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

// Modern chart shell — white ground, hairline border, no heavy frame.
function ChartShell({ children, innerRef }) {
  return (
    <div ref={innerRef} style={{ background: M.bg, border: `1px solid ${M.grid}`, padding: "20px 18px", borderRadius: 6 }}>
      {children}
    </div>
  );
}

function ChartLegend({ items }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", marginBottom: 14 }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: poppins, fontSize: 12, color: M.ink }}>
          <span style={{ width: 12, height: 12, borderRadius: it.dot ? "50%" : 2, background: it.color, display: "inline-block", boxShadow: it.dot ? "0 0 0 2px #fff, 0 0 0 3px " + it.color : "none" }} />
          {it.label}
        </span>
      ))}
    </div>
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

// ── PULL QUOTE (modern accent, bridges to the figure treatment) ────
function PullQuote({ text }) {
  return (
    <div style={{ margin: "30px 0", padding: "20px 24px", background: T.surface, borderLeft: `4px solid ${M.primary}`, fontFamily: serif, fontSize: 20, lineHeight: 1.5, fontWeight: 700, color: T.ink }}>
      {text}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// CHART 1 — Tax roll vs winegrape crop (dual-axis line)
// ════════════════════════════════════════════════════════════════════
const CHART1_TITLE = "Napa County’s Tax Roll Climbs as Its Winegrape Crop Cools";
const CHART1_FOOTNOTE = "Assessed value by fiscal year; winegrape value by calendar year.";

function ChartOne() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext("2d");
    const years = ["2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"];
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: years,
        datasets: [
          {
            label: "Assessed value",
            data: [32.87, 35.19, 37.63, 39.52, 42.10, 44.33, 45.93, 49.19, 53.26, 55.77],
            yAxisID: "yL",
            borderColor: M.primary,
            backgroundColor: M.primary,
            borderWidth: 3,
            tension: 0.35,
            pointRadius: (item) => (item.dataIndex === 0 || item.dataIndex === 9 ? 4 : 0),
            pointHoverRadius: 6,
            pointBackgroundColor: M.primary,
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
          },
          {
            label: "Winegrape crop",
            data: [null, null, null, null, null, 0.6968, 0.8909, 1.2044, 1.0310, null],
            yAxisID: "yR",
            borderColor: M.crop,
            backgroundColor: M.crop,
            borderWidth: 3,
            tension: 0.35,
            spanGaps: false,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: M.crop,
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "nearest", intersect: false },
        plugins: {
          legend: { position: "top", labels: { font: { family: poppins, size: 12 }, color: M.ink, usePointStyle: true, boxWidth: 8 } },
          tooltip: {
            callbacks: {
              label: (item) => {
                const yr = item.label;
                const v = item.parsed.y;
                if (v == null) return "";
                return item.dataset.label === "Assessed value"
                  ? `FY${yr}: $${v.toFixed(2)}B`
                  : `${yr} crop: $${v.toFixed(2)}B`;
              },
            },
          },
          annotation: {
            annotations: {
              startLbl: { type: "label", xValue: "2016", yValue: 32.87, yScaleID: "yL", content: ["$32.87B"], color: M.unidentified, font: { family: poppins, size: 12, weight: "600" }, backgroundColor: "rgba(255,255,255,0.85)", padding: 2, yAdjust: 22, xAdjust: 10 },
              endLbl: { type: "label", xValue: "2025", yValue: 55.77, yScaleID: "yL", content: ["$55.77B"], color: M.primary, font: { family: poppins, size: 12, weight: "700" }, backgroundColor: "rgba(255,255,255,0.85)", padding: 2, yAdjust: -16, xAdjust: -24, clip: false },
              rec23: { type: "label", xValue: "2023", yValue: 1.2044, yScaleID: "yR", content: ["2023 record $1.20B"], color: M.cropCallout, font: { family: poppins, size: 11, weight: "600" }, backgroundColor: "rgba(255,255,255,0.85)", padding: 2, yAdjust: -16 },
              c24: { type: "label", xValue: "2024", yValue: 1.0310, yScaleID: "yR", content: ["2024 $1.03B −14.4%"], color: M.cropCallout, font: { family: poppins, size: 11, weight: "600" }, backgroundColor: "rgba(255,255,255,0.85)", padding: 2, yAdjust: 20 },
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: poppins, size: 11 }, color: M.unidentified } },
          yL: { type: "linear", position: "left", min: 0, max: 60, grid: { color: M.grid }, ticks: { font: { family: poppins, size: 11 }, color: M.primary, callback: (v) => "$" + v + "B" }, title: { display: true, text: "Total taxable assessed value ($B)", color: M.primary, font: { family: poppins, size: 11, weight: "600" } } },
          yR: { type: "linear", position: "right", min: 0, max: 1.6, grid: { drawOnChartArea: false }, ticks: { font: { family: poppins, size: 11 }, color: M.cropCallout, callback: (v) => "$" + v.toFixed(1) + "B" }, title: { display: true, text: "Winegrape crop value ($B)", color: M.cropCallout, font: { family: poppins, size: 11, weight: "600" } } },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>{CHART1_TITLE}</h2>
      <ChartShell innerRef={containerRef}>
        <p style={CHART_SUBTITLE}>Assessed value rose every year to $55.77B in FY25, while the 2024 crop fell 14.4%</p>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "640px" }}>
            <div style={{ position: "relative", height: 380 }}>
              <canvas ref={canvasRef} role="img" aria-label="Dual-axis line chart: Napa County total assessed value rising from $32.87 billion in fiscal 2016 to $55.77 billion in fiscal 2025, against the winegrape crop value rising to a $1.20 billion record in 2023 then falling 14.4% to $1.03 billion in 2024." />
            </div>
          </div>
        </div>
        <p style={{ fontFamily: poppins, fontSize: 11, color: M.unidentified, margin: "10px 2px 0", lineHeight: 1.4 }}>{CHART1_FOOTNOTE}</p>
      </ChartShell>
      <div>
        <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-1_napa-four-legged-economy-2026_nvf.png", CHART1_TITLE)} />
      </div>
      <Caption
        title={CHART1_TITLE}
        description={"Total taxable assessed value rose every year from 2016 to 2025, reaching $55.77 billion, while the winegrape crop fell to $1.03 billion in 2024, down 14.4% from the 2023 record."}
        sources={[
          { label: "Napa County FY 2024-25 ACFR", url: ACFR_URL },
          { label: "Napa County Agricultural Commissioner crop reports, 2021-2024", url: CROP_REPORTS_URL },
        ]}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// CHART 2 — 10 largest property taxpayers (horizontal bars)
// ════════════════════════════════════════════════════════════════════
const CHART2_TITLE = "Napa County’s 10 Largest Property Taxpayers, 2024-25";

function ChartTwo() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext("2d");
    const labels = [
      "Pacific Gas & Electric",
      "Global Ag Properties / SPP Napa Vineyards",
      "Robert Mondavi Properties (Constellation)",
      "Boardwalk Investments Yountville",
      "E. & J. Gallo Winery",
      "Heitz Wine Cellars",
      "SRGA",
      "Meritage Resort",
      "Realty Income Properties 2 (Diageo)",
      "Treasury Wine Estates Americas",
    ];
    const values = [726, 454, 370, 340, 308, 291, 288, 270, 262, 259];
    const colors = labels.map((l, i) => (i === 0 ? M.primary : l === "SRGA" ? M.unidentified : M.crop));
    const VAL_GRAY = "#6E747C";

    const valueLabels = {
      id: "valueLabels",
      afterDatasetsDraw(chart) {
        const c = chart.ctx;
        const meta = chart.getDatasetMeta(0);
        c.save();
        c.font = "600 12px " + poppins;
        c.fillStyle = VAL_GRAY;
        c.textAlign = "left";
        c.textBaseline = "middle";
        meta.data.forEach((bar, i) => { c.fillText("$" + values[i] + "M", bar.x + 6, bar.y); });
        c.restore();
      },
    };

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: { labels, datasets: [{ label: "Assessed value ($M)", data: values, backgroundColor: colors, borderRadius: 4, borderSkipped: false, barThickness: 20 }] },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 56 } },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (item) => "$" + item.parsed.x + "M assessed value" } },
        },
        scales: {
          x: { min: 0, max: 800, grid: { color: M.grid }, ticks: { font: { family: poppins, size: 11 }, color: M.unidentified, callback: (v) => "$" + v + "M" } },
          y: { grid: { display: false }, ticks: { font: { family: poppins, size: 11.5 }, color: M.ink } },
        },
      },
      plugins: [valueLabels],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>{CHART2_TITLE}</h2>
      <ChartShell innerRef={containerRef}>
        <p style={CHART_SUBTITLE}>Eight of the 10 largest taxpayers are wine, vineyard real estate or hospitality</p>
        <ChartLegend
          items={[
            { color: M.primary, label: "Utility (PG&E)" },
            { color: M.crop, label: "Wine, vineyard real estate & hospitality" },
            { color: M.unidentified, label: "Unidentified (SRGA)" },
          ]}
        />
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "640px" }}>
            <div style={{ position: "relative", height: 440 }}>
              <canvas ref={canvasRef} role="img" aria-label="Horizontal bar chart of Napa County's 10 largest property taxpayers in 2024-25, led by PG&E at $726 million, with eight wine, vineyard real estate or hospitality holdings and one unidentified taxpayer, SRGA, at $288 million." />
            </div>
          </div>
        </div>
      </ChartShell>
      <div>
        <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-2_napa-four-legged-economy-2026_nvf.png", CHART2_TITLE)} />
      </div>
      <Caption
        title={CHART2_TITLE}
        description={"Eight of the 10 largest taxpayers are wine, vineyard real estate or hospitality holdings; only PG&E sits plainly outside, and one — SRGA — is unidentified."}
        sources={[{ label: "Napa County FY 2024-25 ACFR, Auditor-Controller’s Office", url: ACFR_URL }]}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// CHART 3 — Largest employers 2016 vs 2024-25 (dumbbell + Change column)
// ════════════════════════════════════════════════════════════════════
const CHART3_TITLE = "Napa County’s Largest Employers, 2016 vs. 2024-25";
const CHART3_SUBTITLE = "The 10 largest employers shed a net 1,775 jobs since 2016, from 11,721 to 9,946";

function ChartThree() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext("2d");
    const labels = [
      "Napa State Hospital",
      "County of Napa",
      "Napa Valley Unified School Dist.",
      "Providence Queen of the Valley",
      "Trinchero Family Estates",
      "Veterans’ Home of California",
      "Wal-Mart (Napa & Am. Canyon)",
      "Adventist Health St. Helena",
      "City of Napa",
      "Treasury Wine Estates",
    ];
    const pairs = [
      [2303, 2335], [1433, 1480], [1260, 1156], [1100, 1027], [1015, 1008],
      [1000, 735], [642, 700], [1391, 610], [458, 470], [1119, 425],
    ];
    const changes = pairs.map((p) => p[1] - p[0]);
    const connectorColors = changes.map((c) => (c > 0 ? M.gain : M.loss));

    const dumbbellDeco = {
      id: "dumbbellDeco",
      afterDatasetsDraw(chart) {
        const c = chart.ctx;
        const x = chart.scales.x;
        const meta = chart.getDatasetMeta(0);
        c.save();
        // dots with white halos
        pairs.forEach((p, i) => {
          const y = meta.data[i].y;
          const drawDot = (px, color) => {
            c.beginPath(); c.arc(px, y, 6.5, 0, Math.PI * 2); c.fillStyle = "#fff"; c.fill();
            c.beginPath(); c.arc(px, y, 4.5, 0, Math.PI * 2); c.fillStyle = color; c.fill();
          };
          drawDot(x.getPixelForValue(p[0]), M.unidentified); // 2016
          drawDot(x.getPixelForValue(p[1]), M.primary);      // 2024-25
        });
        // Change column (right margin)
        const colX = chart.width - 8;
        c.textAlign = "right";
        c.textBaseline = "middle";
        c.fillStyle = M.unidentified;
        c.font = "600 11px " + poppins;
        c.fillText("Change", colX, chart.chartArea.top - 14);
        changes.forEach((ch, i) => {
          const y = meta.data[i].y;
          const big = ch === -781 || ch === -694; // two largest losses, bolded
          c.font = (big ? "700 " : "500 ") + "12px " + poppins;
          c.fillStyle = ch > 0 ? M.gain : M.loss;
          c.fillText((ch > 0 ? "+" : "−") + Math.abs(ch), colX, y);
        });
        c.restore();
      },
    };

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: { labels, datasets: [{ label: "2016 → 2024-25", data: pairs, backgroundColor: connectorColors, borderSkipped: false, borderRadius: 2, barThickness: 3 }] },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 64, top: 20 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => {
                const p = item.raw;
                const ch = p[1] - p[0];
                return `${p[0]} → ${p[1]} (${ch > 0 ? "+" : "−"}${Math.abs(ch)})`;
              },
            },
          },
        },
        scales: {
          x: { min: 0, suggestedMax: 2500, grid: { color: M.grid }, ticks: { font: { family: poppins, size: 11 }, color: M.unidentified } },
          y: { grid: { display: false }, ticks: { font: { family: poppins, size: 11 }, color: M.ink } },
        },
      },
      plugins: [dumbbellDeco],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>{CHART3_TITLE}</h2>
      <ChartShell innerRef={containerRef}>
        <p style={CHART_SUBTITLE}>{CHART3_SUBTITLE}</p>
        <ChartLegend
          items={[
            { color: M.unidentified, label: "2016", dot: true },
            { color: M.primary, label: "2024-25", dot: true },
            { color: M.gain, label: "Net gain" },
            { color: M.loss, label: "Net loss" },
          ]}
        />
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "640px" }}>
            <div style={{ position: "relative", height: 480 }}>
              <canvas ref={canvasRef} role="img" aria-label="Dumbbell chart comparing Napa County's 10 largest employers in 2016 versus 2024-25, with a right-side Change column of signed job deltas; the two largest losses are Adventist Health St. Helena down 781 and Treasury Wine Estates down 694." />
            </div>
          </div>
        </div>
      </ChartShell>
      <div>
        <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-3_napa-four-legged-economy-2026_nvf.png", CHART3_TITLE)} />
      </div>
      <Caption
        title={CHART3_TITLE}
        description={"The 10 largest employers shed a net 1,775 jobs since 2016, from 11,721 to 9,946, with the wine industry’s footprint contracting sharply — Treasury Wine Estates fell from 1,119 to 425."}
        sources={[{ label: "Napa County FY 2024-25 ACFR, Principal Employers schedule", url: ACFR_URL }]}
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
export default function UnderTheHoodFourLeggedEconomy2026() {
  const navigate = useNavigate();
  const handleBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/under-the-hood"));
  const gate = useDraftGate(ARTICLE_SLUG);
  const isDraft = gate.status === "draft";
  useScopedPoppins();

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
            {ARTICLE_SUMMARY}
          </p>
        </div>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* LEDE (first body paragraph carries the dateline)             */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <p style={{ ...P_STYLE, marginBottom: 18 }}>
          <strong>NAPA VALLEY, Calif.</strong> {"—"} Napa County{"’"}s economy stands on four legs: wine, tourism, hospitality and the property-tax base that funds the public services around them. Three are slipping. The 2024 winegrape crop fell 14.4% to $1.03 billion. Lodging-tax receipts have flattened below their peak. The county{"’"}s 10 largest employers have shed a net 1,775 jobs since 2016. Through all of it, the fourth leg held {"—"} assessed property value climbed to $55.77 billion in fiscal 2024-25 and property tax revenue rose 5.6% to $191.26 million, according to the county{"’"}s <a href={ACFR_URL} target="_blank" rel="noopener noreferrer" style={LINK}>Annual Comprehensive Financial Report</a>. That leg has been carrying the other three. It is now starting to show stress at its base.
        </p>

        <p style={P_STYLE}>
          This column first raised the reliance question in 2024. The update is that three of the four supports have weakened in measurable ways since, and the one still reading strong is the one most exposed to what happens next.
        </p>

        <ChartOne />

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — A CONCENTRATED TAX BASE                             */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>A Concentrated Tax Base</h2>

        <p style={P_STYLE}>
          The reason the fourth leg matters so much {"—"} and why its strength may be more fragile than the surplus suggests {"—"} is what it is built on. The county{"’"}s largest taxpayers are concentrated in the same wine and hospitality real estate that drives the other three legs. Of the 10 largest property taxpayers in 2024-25, only Pacific Gas &amp; Electric Company {"—"} the top payer at $725.99 million in assessed value, or 1.30% of the county total {"—"} sits plainly outside that group.
        </p>

        <p style={P_STYLE}>
          Eight of the other nine are wine, vineyard real estate or hospitality holdings: Global Ag Properties/SPP Napa Vineyards, Robert Mondavi Properties under Constellation, Boardwalk Investments Yountville, E. &amp; J. Gallo Winery, Heitz Wine Cellars, Meritage Resort, Realty Income Properties 2 LLC/Diageo and Treasury Wine Estates Americas. The seventh-ranked taxpayer, listed in the report only as SRGA, could not be independently identified. <span style={VERIFY_FLAG}>[VERIFY: SRGA {"—"} parcel lookup via the Napa County Assessor (John Tuteur, 707-253-4459) to confirm owner and sector.]</span>
        </p>

        <p style={P_STYLE}>
          Together the top 10 represent 6.40% of the county{"’"}s total taxable assessed value, up from 6.15% nine years earlier. The base beneath them has grown substantially {"—"} total assessed value of $55.77 billion is up from $32.87 billion in 2015-16, an increase of roughly 70% over nine years built largely on rising real estate values rather than on the local wage economy.
        </p>

        <ChartTwo />

        <p style={P_STYLE}>
          That concentration is not static, and one of its largest names is now pulling back. Treasury Wine Estates {"—"} the county{"’"}s No. 10 property taxpayer and the largest single contraction among its top employers, from 1,119 jobs in 2015-16 to 425 in 2024-25 {"—"} told investors June 4 it will shrink its California footprint over four years.
        </p>

        <p style={P_STYLE}>
          Under the restructuring it calls Ascent, the company will cut its brand portfolio from 76 to fewer than 30, sell its Paso Robles and San Luis Obispo wineries, scale back its Sonoma bottling operations and exit vineyard holdings and leases across Napa Valley, Sonoma and the Central Coast, a plan it projects will save about $71 million over three years, according to the San Francisco Chronicle and The Drinks Business. Production of two of its Napa labels {"—"} Frank Family Vineyards in Calistoga and Stags{"’"} Leap Winery in Napa {"—"} will move into TWE{"’"}s St. Helena Winery, the former Beringer plant on Pratt Avenue where the company centralized its high-end U.S. production after buying Diageo{"’"}s wine business in 2016, now designated its primary U.S. luxury hub. The Beringer brand itself was not among the labels TWE named as keepers, even as the Beringer winery becomes the hub for the brands it is keeping.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — THE JOBS ARE THINNING                              */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>The Jobs Are Thinning</h2>

        <p style={P_STYLE}>
          The county{"’"}s tax roll has climbed, but its largest employers have been shedding jobs. Napa County{"’"}s 10 largest employers accounted for 9,946 jobs in 2024-25, down from 11,721 nine years earlier {"—"} a net loss of 1,775 positions among the county{"’"}s biggest workplaces, even as total countywide employment edged up to 75,500.
        </p>

        <p style={P_STYLE}>
          The wine industry{"’"}s footprint among those employers narrowed the most. Treasury Wine Estates reported 1,119 employees in 2015-16; its 2024-25 figure of 425 is well under half that {"—"} a contraction that predates the June 2026 restructuring and tracks the company{"’"}s broader U.S. retreat, including a goodwill writedown of more than $450 million on its U.S. business in late 2025. Health-care employers contracted as well: Adventist Health St. Helena fell from 1,391 to 610, and the Veterans{"’"} Home of California from 1,000 to 735.
        </p>

        <p style={P_STYLE}>
          The list is still led by government and health care {"—"} Napa State Hospital, the County of Napa, the Napa Valley Unified School District and Providence Queen of the Valley {"—"} not by wineries. The 10 largest employers{"’"} share of total county employment fell from 15.96% to 13.17% over the nine years.
        </p>

        <ChartThree />

        <p style={P_STYLE}>
          The contraction has continued into 2026. The county{"’"}s civilian labor force fell roughly 4.1% year over year, from about 75,100 in January 2025 to 72,000 in January 2026, as documented in <em><a href="/under-the-hood/napa-population-2025" style={LINK}>Under the Hood: Napa County Shrunk as Calistoga Grew and the Base Faltered</a></em> (May 14, 2026). That piece also recorded the elimination of 135 manufacturing jobs at American Canyon{"’"}s Coca-Cola bottling plant in the same fiscal year the ACFR covers.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — THE TOURISM SIGNAL STAYS SOFT                      */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>The Tourism Signal Stays Soft</h2>

        <p style={P_STYLE}>
          Transient occupancy tax {"—"} the lodging levy that serves as the county{"’"}s clearest read on visitor spending {"—"} was essentially flat. The county collected $13.10 million in TOT in fiscal 2024-25, down 0.5% from the prior year. That continues the pattern flagged in the June 2024 installment, when TOT had fallen 7.8% the year before. Two years on, the revenue has not rebounded; it has leveled off below its earlier peak. For a county whose hospitality sector is built around wine tourism, a flat lodging levy alongside a 14.4% drop in crop value and a contracting employer base is a third leg under strain.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — THE LEG THAT HELD (what-to-watch closer)           */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>The Leg That Held</h2>

        <p style={P_STYLE}>
          Through all of it, the county{"’"}s finances stayed sound. Napa County{"’"}s total net position rose $27.4 million, or 4.0%, to $714.73 million in fiscal 2024-25. Governmental funds reported combined balances of $550.5 million, and the property-tax base climbed. By the measures the Annual Comprehensive Financial Report is built to capture, the fourth leg held.
        </p>

        <p style={P_STYLE}>
          It held for a structural reason: the assessed-value roll is concentrated in the same wine and hospitality real estate that drives the other three legs. That worked while those assets appreciated. It becomes a liability when they reprice {"—"} and the repricing has started. Benessere Vineyards, the 42-acre St. Helena estate that asked $35 million in late 2024, is pending sale at $10.15 million after a June auction {"—"} a $9 million winning bid plus premium, with closing about 30 days out. The estate shed roughly three-quarters of its asking value in 18 months. Stanly Ranch, in default on a $230 million loan, sold to Blackstone for $195 million. The Calistoga Motor Lodge defaulted on a $40 million loan in March. And Treasury Wine Estates, the county{"’"}s No. 10 taxpayer and its largest single employer contraction, said in June it will exit leases and assets across Napa Valley over four years under its Ascent restructuring.
        </p>

        <PullQuote text={"That leg has been carrying the other three. It is now starting to show stress at its base."} />

        <p style={P_STYLE}>
          None of that has reached the fiscal 2024-25 roll yet, and it would not be expected to. Assessed value follows market value with a lag: under Proposition 13 a property reassesses only when it changes hands, and owners can seek reductions when market value falls below their assessed value. The roll can keep climbing for a year or two after the market beneath it has turned. That lag is why the county{"’"}s books still show a surplus and a rising tax base while the assets underneath are trading at steep discounts and one of their largest holders is heading for the exit.
        </p>

        <p style={P_STYLE}>
          The fourth leg is the last one still reading strong. It is also the one the other three are now leaning on hardest {"—"} and the only one whose support is measured on a delay. The harder question the surplus cannot answer is what the roll looks like once this round of repricing works through it.
        </p>

        {/* ── BYLINE (italic) ─────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.ink, fontStyle: "italic", lineHeight: 1.65, margin: "32px 0 0 0" }}>
          Tim Carl is a Napa Valley-based photojournalist.
        </p>

        {/* ── POLLS SECTION (directly after byline) ────────────────── */}
        <PollsSection slug={ARTICLE_SLUG} />

        {/* ── RELATED COVERAGE ────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 48, paddingTop: 28, marginBottom: 28 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center", marginBottom: 20 }}>
            Related Coverage
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-valleys-growing" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Napa Valley{"’"}s Growing Reliance on the Wine Industry{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (June 1, 2024)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="/under-the-hood/napa-population-2025" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Napa County Shrunk as Calistoga Grew and the Base Faltered{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (May 14, 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-has-equaled" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: More Rooms Has Equaled Fewer Jobs in Napa County{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (August 23, 2025)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-the-accelerants-reshaping" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: How Accelerants {"—"} From GLP-1s to Politics {"—"} Are Reshaping Wine Demand{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (January 22, 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="/under-the-hood/napa-gdp-2024" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Napa Valley{"’"}s Economy Looks Bigger Than It Is{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (March 2026)</span>
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
              placeholder="Search tax base, assessed value, employers, winegrape crop, Proposition 13..."
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
            Fiscal figures are FY 2024-25 (Napa County ACFR); winegrape crop values are calendar-year (Napa County Agricultural Commissioner, 2021-2024), with the 2023 record at $1.20 billion and 2024 at $1.03 billion. Chart 1 plots assessed value by fiscal year and crop value by calendar year on a shared axis. SRGA, the seventh-largest taxpayer, is listed in the ACFR without an identifiable owner and is treated as unidentified pending an Assessor parcel lookup. Principal-employer counts are as reported by each employer in the county{"’"}s ACFR schedule; year-to-year changes can reflect reporting differences as well as actual headcount.
          </p>
        </div>

        {/* ── SOURCES ─────────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 40, paddingTop: 24 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: T.ink, marginBottom: 16 }}>Sources</h2>
          <ol style={{ fontFamily: font, fontSize: 14, color: T.ink, lineHeight: 1.75, paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>Napa County FY 2024-25 <a href={ACFR_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Annual Comprehensive Financial Report</a> (napacounty.gov).</li>
            <li style={{ marginBottom: 8 }}>Napa County <a href={CROP_REPORTS_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Agricultural Commissioner crop reports</a>, 2021-2024 (2024 report released May 20, 2025).</li>
            <li style={{ marginBottom: 8 }}>Napa County FY 2024-25 <a href={ACFR_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>ACFR</a>, Auditor-Controller{"’"}s Office (10 Largest Taxpayers schedule) and Principal Employers schedule.</li>
            <li style={{ marginBottom: 8 }}>Treasury Wine Estates {"“"}Ascent{"”"} restructuring: San Francisco Chronicle (June 17, 2026); <a href={TWE_DRINKS_BUSINESS_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>The Drinks Business</a> (June 2026); TWE investor day, June 4, 2026.</li>
            <li style={{ marginBottom: 8 }}>TWE St. Helena/Beringer luxury-hub history: <a href={WINES_VINES_TWE_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Wines &amp; Vines</a> (2016 Diageo-acquisition consolidation at the Beringer plant, Pratt Avenue).</li>
            <li style={{ marginBottom: 8 }}>Benessere Vineyards auction: <a href={BENESSERE_PD_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Press Democrat</a> / North Bay Business Journal (June 25, 2026); <a href={BENESSERE_RELEASE_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Concierge Auctions release</a> (June 26, 2026).</li>
            <li style={{ marginBottom: 8 }}>Stanly Ranch / Blackstone and Calistoga Motor Lodge default: see <a href="/under-the-hood/napa-population-2025" style={{ color: T.accent }}>Napa County Shrunk as Calistoga Grew and the Base Faltered</a> (May 14, 2026) and <a href="https://napavalleyfocus.substack.com/p/under-the-hood-the-accelerants-reshaping" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>How Accelerants Are Reshaping Wine Demand</a> (Jan. 22, 2026).</li>
          </ol>
        </div>

      </div>

      <Footer />
    </div>
  );
}

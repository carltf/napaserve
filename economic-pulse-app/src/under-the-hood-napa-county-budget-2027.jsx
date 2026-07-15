// UNDER THE HOOD — Napa County's $996 Million Budget Leans on a Softening Tax Base
// -----------------------------------------------------------------
// Slug: napa-county-budget-2027
// Publication: Napa Valley Features
// Source of record: UTH_Napa_County_Budget_2027_FINAL_PROSE.txt (prose verbatim, AP style).
// Build handoff: UTH_Napa_County_Budget_2027_HANDOFF.txt (charts, polls, sources).
//
// WORKFLOW NOTE: this build runs BACKWARD — the article is already published on
// Substack. This file is the NapaServe-only build. No Substack-side work (chart PNG
// export for Substack, Substack poll seeding) is part of this build.
//
// CHART TREATMENT: standard cream design system (T tokens, Libre Baskerville titles).
// Data palette per handoff / napaserve-design-system.md. Cream ground (#F5F0E8) so the
// downloaded PNG ground matches the chart shell. Watermark drawn by downloadComponentPng.
//
// Publish only via the Admin page — never via a const flag here.
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
const ARTICLE_SLUG = "napa-county-budget-2027";
const ARTICLE_TITLE = "Napa County's $996 Million Budget Leans on a Softening Tax Base";
const ARTICLE_DECK = "The county's adopted 2026-27 budget sets property, sales and lodging taxes below last year, exposing a tax base built on real estate rather than wages and costs rising faster than the revenue that funds them.";
const ARTICLE_SUMMARY = "Napa County adopted a $996.2 million all-funds budget for fiscal 2026-27, a 3% increase driven almost entirely by labor, insurance and storm-repair costs. On the revenue side, the county set all three of its discretionary taxes below the prior year's adopted budget: sales and lodging taxes on outright market declines, and property tax trimmed to match softening actuals even as the county stresses the line is still growing. The deeper strain sits underneath. The property-tax base that Under the Hood has called the county's fourth economic leg grew on real-estate appreciation, not on local wages, and costs are now rising faster than the taxes that fund them.";
const ARTICLE_PUBLICATION = "Napa Valley Features";
const ARTICLE_DATE = "July 15, 2026";
const SHOW_DECK = true;
const EYEBROW = "Under the Hood";
const PUBLICATION = ARTICLE_PUBLICATION;
const SUBSTACK_URL = "https://napavalleyfocus.substack.com";

// Source landing pages (body-anchor safe — no /api/, .csv, .json per Lesson H)
const BUDGET_IN_BRIEF_URL = "https://www.napacounty.gov/3726/Budget-in-Brief";
const ACFR_URL = "https://www.napacounty.gov/308/County-Financial-and-Budget-Reports";
const ACS_DATAUSA_URL = "https://datausa.io/profile/geo/napa-county-ca";

// ── THEME (cream design-system tokens) ─────────────────────────────
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

// Canvas font strings (for chart plugins / PNG title)
const CV_SERIF = "'Libre Baskerville', Georgia, serif";
const CV_SANS = "'Source Sans 3', 'Source Sans Pro', sans-serif";

// ── DATA PALETTE (handoff / napaserve-design-system.md) ────────────
const DATA = {
  green: "#5A6E3A",   // positive change
  neg: "#9E5050",     // negative change / down bars
  brown: "#967050",   // taxes, salaries
  khaki: "#C4A84A",   // intergovernmental, services & supplies
  gray: "#A8A090",    // charges for services, transfers
  tan: "#C4956A",     // other financing, other & capital
  blue: "#4A7BA7",    // fines & misc.
  pos: "#5B9E8A",     // licenses & permits
  red: "#C05050",     // collection-rate line
};

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
const CHART_SUBTITLE = { fontFamily: font, fontSize: 14, color: T.muted, margin: "0 0 14px", lineHeight: 1.4 };
const CHART_FOOTNOTE = { fontFamily: font, fontSize: 11, color: T.muted, fontStyle: "italic", margin: "10px 2px 0", lineHeight: 1.4 };

// ── DOWNLOAD HELPER (Lesson A geometry; cream tokens) ──────────────
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
  ctx.font = "bold 32px " + CV_SERIF;
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

// Cream chart shell — ground matches PNG export ground (T.bg)
function ChartShell({ children, innerRef }) {
  return (
    <div ref={innerRef} style={{ background: T.bg, border: `1px solid ${T.rule}`, padding: "20px 18px", borderRadius: 6 }}>
      {children}
    </div>
  );
}

function ChartLegend({ items }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", marginTop: 14 }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: font, fontSize: 12.5, color: T.ink }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: it.color, display: "inline-block" }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

function ScrollWrap({ children, minWidth = 640 }) {
  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <div style={{ minWidth: minWidth + "px" }}>{children}</div>
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

// ════════════════════════════════════════════════════════════════════
// CHART 1 — Diverging bars: all-funds up, general fund down
// ════════════════════════════════════════════════════════════════════
const CHART1_TITLE = "The Budget Grew Overall — but the Discretionary Fund Shrank";

function ChartOne() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext("2d");

    const info = [
      { pct: "+3.0%", color: DATA.green, cat: "All-funds budget", dollars: "$967.5M → $996.2M", positive: true },
      { pct: "-0.9%", color: DATA.neg, cat: "General fund", dollars: "$341.3M → $338.4M", positive: false },
    ];

    const c1labels = {
      id: "c1labels",
      afterDatasetsDraw(chart) {
        const c = chart.ctx;
        const y = chart.scales.y;
        const zeroY = y.getPixelForValue(0);
        const meta = chart.getDatasetMeta(0);
        c.save();
        c.textAlign = "center";
        meta.data.forEach((bar, i) => {
          const d = info[i];
          // big percentage beyond the bar's value end
          c.font = "700 30px " + CV_SERIF;
          c.fillStyle = d.color;
          if (d.positive) { c.textBaseline = "bottom"; c.fillText(d.pct, bar.x, bar.y - 10); }
          else { c.textBaseline = "top"; c.fillText(d.pct, bar.x, bar.y + 10); }
          // category name + dollar transition near the zero baseline
          if (d.positive) {
            c.fillStyle = T.ink; c.font = "700 17px " + CV_SERIF; c.textBaseline = "top";
            c.fillText(d.cat, bar.x, zeroY + 12);
            c.fillStyle = T.muted; c.font = "400 14px " + CV_SANS;
            c.fillText(d.dollars, bar.x, zeroY + 36);
          } else {
            c.fillStyle = T.muted; c.font = "400 14px " + CV_SANS; c.textBaseline = "bottom";
            c.fillText(d.dollars, bar.x, zeroY - 34);
            c.fillStyle = T.ink; c.font = "700 17px " + CV_SERIF;
            c.fillText(d.cat, bar.x, zeroY - 12);
          }
        });
        c.restore();
      },
    };

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["All-funds budget", "General fund"],
        datasets: [{ data: [3.0, -0.9], backgroundColor: [DATA.green, DATA.neg], borderRadius: 3, barPercentage: 0.5, categoryPercentage: 0.7 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 28, bottom: 6 } },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { grid: { display: false }, ticks: { display: false }, border: { display: false } },
          y: {
            min: -2, max: 4,
            ticks: { stepSize: 1, callback: (v) => (v > 0 ? "+" : "") + v + "%", font: { family: font, size: 12 }, color: T.muted },
            grid: { color: T.rule }, border: { display: false },
          },
        },
      },
      plugins: [c1labels],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>{CHART1_TITLE}</h2>
      <ChartShell innerRef={containerRef}>
        <p style={CHART_SUBTITLE}>Change in total appropriations, FY 2025-26 to FY 2026-27 adopted</p>
        <ScrollWrap>
          <div style={{ position: "relative", height: 360 }}>
            <canvas ref={canvasRef} role="img" aria-label="Diverging bar chart: Napa County's all-funds budget rose 3.0% from $967.5 million to $996.2 million, while the general fund fell 0.9% from $341.3 million to $338.4 million." />
          </div>
        </ScrollWrap>
        <p style={CHART_FOOTNOTE}>Source: Napa County FY 2026-27 Adopted Budget, Appropriations - All Funds.</p>
      </ChartShell>
      <div><DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-1_budget-allfunds-vs-gf_nvf_2026.png", CHART1_TITLE)} /></div>
      <Caption
        title={CHART1_TITLE}
        description={"The all-funds budget grew 3% while the general fund, the county's discretionary pot, shrank 0.9%. The top line rose on restricted funds the county cannot freely redirect."}
        sources={[{ label: "Napa County FY 2026-27 Adopted Budget", url: BUDGET_IN_BRIEF_URL }]}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// CHART 2 — 100% stacked horizontal bar: general fund revenue mix
// ════════════════════════════════════════════════════════════════════
const CHART2_TITLE = "Nearly Two-Thirds of the General Fund Rides on Taxes";

function ChartTwo() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext("2d");

    const segs = [
      { label: "Taxes", value: 63.9, color: DATA.brown, light: false },
      { label: "Intergovernmental", value: 12.0, color: DATA.khaki, light: true },
      { label: "Charges for services", value: 9.7, color: DATA.gray, light: true },
      { label: "Other financing", value: 7.6, color: DATA.tan, light: true },
      { label: "Fines & misc.", value: 4.7, color: DATA.blue, light: false },
      { label: "Licenses & permits", value: 2.1, color: DATA.pos, light: false },
    ];

    const c2labels = {
      id: "c2labels",
      afterDatasetsDraw(chart) {
        const c = chart.ctx;
        c.save();
        c.textAlign = "center";
        c.textBaseline = "middle";
        segs.forEach((s, di) => {
          const bar = chart.getDatasetMeta(di).data[0];
          if (!bar) return;
          const w = Math.abs(bar.x - bar.base);
          if (w < 34) return; // skip too-narrow segment (Licenses & permits)
          c.font = "700 15px " + CV_SANS;
          c.fillStyle = s.light ? T.ink : "#FFFFFF";
          c.fillText(s.value.toFixed(1) + "%", (bar.x + bar.base) / 2, bar.y);
        });
        c.restore();
      },
    };

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [""],
        datasets: segs.map((s) => ({ label: s.label, data: [s.value], backgroundColor: s.color, stack: "rev", categoryPercentage: 0.98, barPercentage: 0.9 })),
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (it) => it.dataset.label + ": " + it.parsed.x + "%" } },
        },
        scales: {
          x: { stacked: true, min: 0, max: 100, display: false, grid: { display: false } },
          y: { stacked: true, display: false, grid: { display: false } },
        },
      },
      plugins: [c2labels],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>{CHART2_TITLE}</h2>
      <ChartShell innerRef={containerRef}>
        <p style={CHART_SUBTITLE}>FY 2026-27 projected general fund revenue by source, $312.0 million</p>
        <ScrollWrap>
          <div style={{ position: "relative", height: 120 }}>
            <canvas ref={canvasRef} role="img" aria-label="Stacked bar of Napa County's projected general fund revenue: taxes 63.9%, intergovernmental 12.0%, charges for services 9.7%, other financing 7.6%, fines and miscellaneous 4.7%, licenses and permits 2.1%." />
          </div>
        </ScrollWrap>
        <ChartLegend
          items={[
            { color: DATA.brown, label: "Taxes (63.9%)" },
            { color: DATA.khaki, label: "Intergovernmental (12.0%)" },
            { color: DATA.gray, label: "Charges for services (9.7%)" },
            { color: DATA.tan, label: "Other financing (7.6%)" },
            { color: DATA.blue, label: "Fines & misc. (4.7%)" },
            { color: DATA.pos, label: "Licenses & permits (2.1%)" },
          ]}
        />
        <p style={CHART_FOOTNOTE}>Source: Napa County FY 2026-27 Adopted Budget, General Fund revenue by source.</p>
      </ChartShell>
      <div><DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-2_gf-revenue-mix_nvf_2026.png", CHART2_TITLE)} /></div>
      <Caption
        title={CHART2_TITLE}
        description={"Nearly two-thirds of the county's projected $312.0 million in general fund revenue comes from taxes."}
        sources={[{ label: "Napa County FY 2026-27 Adopted Budget", url: BUDGET_IN_BRIEF_URL }]}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// CHART 3 — Horizontal bars: three tax estimates set below last year
// ════════════════════════════════════════════════════════════════════
const CHART3_TITLE = "All Three Tax Estimates Set Below Last Year's Budget";

function ChartThree() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext("2d");

    const vals = ["-1.7%", "-4.3%", "-5.7%"];
    const c3labels = {
      id: "c3labels",
      afterDatasetsDraw(chart) {
        const c = chart.ctx;
        const meta = chart.getDatasetMeta(0);
        c.save();
        c.textAlign = "right";
        c.textBaseline = "middle";
        c.font = "700 17px " + CV_SANS;
        c.fillStyle = T.ink;
        meta.data.forEach((bar, i) => { c.fillText(vals[i], bar.x - 8, bar.y); });
        c.restore();
      },
    };

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Property tax", "Sales tax", "Transient occupancy tax"],
        datasets: [{ data: [-1.7, -4.3, -5.7], backgroundColor: DATA.neg, borderRadius: 3, barPercentage: 0.62 }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { left: 6, right: 10 } },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (it) => it.parsed.x + "%" } },
        },
        scales: {
          x: { min: -7, max: 0.3, ticks: { stepSize: 1, callback: (v) => v + "%", font: { family: font, size: 12 }, color: T.muted }, grid: { color: T.rule }, border: { display: false } },
          y: { ticks: { font: { family: font, size: 14 }, color: T.ink }, grid: { display: false }, border: { display: false } },
        },
      },
      plugins: [c3labels],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>{CHART3_TITLE}</h2>
      <ChartShell innerRef={containerRef}>
        <p style={CHART_SUBTITLE}>Change in adopted general fund tax estimates, FY 2025-26 to FY 2026-27</p>
        <ScrollWrap>
          <div style={{ position: "relative", height: 320 }}>
            <canvas ref={canvasRef} role="img" aria-label="Horizontal bar chart: adopted general fund tax estimates set below the prior year — property tax down 1.7%, sales tax down 4.3%, transient occupancy tax down 5.7%." />
          </div>
        </ScrollWrap>
        <p style={CHART_FOOTNOTE}>Source: Napa County FY 2026-27 Adopted Budget and Budget in Brief.</p>
      </ChartShell>
      <div><DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-3_three-taxes-below-budget_nvf_2026.png", CHART3_TITLE)} /></div>
      <Caption
        title={CHART3_TITLE}
        description={"Each of the three discretionary tax lines is budgeted below the prior year's adopted level. Sales and TOT reflect market declines; the property-tax figure is a downward realignment of an estimate the county says still grows about 4% a year."}
        sources={[{ label: "Napa County FY 2026-27 Adopted Budget and Budget in Brief", url: BUDGET_IN_BRIEF_URL }]}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// CHART 4 — Line: on-time secured property tax collection rate
// ════════════════════════════════════════════════════════════════════
const CHART4_TITLE = "The Share of Property Taxes Paid On Time Has Slipped";

function ChartFour() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext("2d");

    const c4labels = {
      id: "c4labels",
      afterDatasetsDraw(chart) {
        const c = chart.ctx;
        const solid = chart.getDatasetMeta(0);
        const dashed = chart.getDatasetMeta(1);
        c.save();
        c.fillStyle = T.ink;
        c.font = "700 16px " + CV_SANS;
        c.textAlign = "center";
        c.textBaseline = "bottom";
        const labs = ["98.37%", "97.68%", "97.17%"];
        [0, 1, 2].forEach((i) => { const p = solid.data[i]; c.fillText(labs[i], p.x, p.y - 12); });
        const last = dashed.data[3];
        c.fillText("91.43%", last.x, last.y - 14);
        c.font = "italic 400 12px " + CV_SANS;
        c.fillStyle = T.muted;
        c.textAlign = "right";
        c.textBaseline = "top";
        c.fillText("partial year", last.x + 4, last.y + 16);
        c.fillText("(through 4/17)", last.x + 4, last.y + 32);
        c.restore();
      },
    };

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["2022-23", "2023-24", "2024-25", "2025-26"],
        datasets: [
          {
            label: "closed",
            data: [98.37, 97.68, 97.17, null],
            borderColor: DATA.red, backgroundColor: DATA.red,
            borderWidth: 2.5, tension: 0, spanGaps: false,
            pointRadius: [5, 5, 5, 0], pointHoverRadius: 6,
            pointBackgroundColor: DATA.red, pointBorderColor: DATA.red,
          },
          {
            label: "partial",
            data: [null, null, 97.17, 91.43],
            borderColor: DATA.red, backgroundColor: T.bg,
            borderWidth: 2.5, borderDash: [7, 6], tension: 0, spanGaps: true,
            pointRadius: [0, 0, 0, 7], pointHoverRadius: 7,
            pointBackgroundColor: T.bg, pointBorderColor: DATA.red, pointBorderWidth: 2.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 28, right: 24, bottom: 30 } },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: font, size: 14 }, color: T.muted } },
          y: { min: 90, max: 100, ticks: { stepSize: 2, callback: (v) => v + "%", font: { family: font, size: 12 }, color: T.muted }, grid: { color: T.rule }, border: { display: false } },
        },
      },
      plugins: [c4labels],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>{CHART4_TITLE}</h2>
      <ChartShell innerRef={containerRef}>
        <p style={CHART_SUBTITLE}>Secured property taxes collected within the fiscal year of levy</p>
        <ScrollWrap>
          <div style={{ position: "relative", height: 360 }}>
            <canvas ref={canvasRef} role="img" aria-label="Line chart of the share of secured property taxes paid within the fiscal year of levy: 98.37% in 2022-23, 97.68% in 2023-24, 97.17% in 2024-25, and 91.43% for 2025-26 shown as a partial, fiscal-year-to-date figure through mid-April." />
          </div>
        </ScrollWrap>
        <p style={CHART_FOOTNOTE}>Source: Napa County FY 2026-27 Adopted Budget, Treasurer-Tax Collector performance measures. 2025-26 is fiscal-year-to-date.</p>
      </ChartShell>
      <div><DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-4_ontime-collection-rate_nvf_2026.png", CHART4_TITLE)} /></div>
      <Caption
        title={CHART4_TITLE}
        description={"The share of secured property taxes paid within the fiscal year of levy eased across the three closed years shown; 2025-26 is a partial, fiscal-year-to-date figure."}
        sources={[{ label: "Napa County FY 2026-27 Adopted Budget, Treasurer-Tax Collector performance measures", url: BUDGET_IN_BRIEF_URL }]}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// CHART 5 — 100% stacked horizontal bar: general fund spending mix
// ════════════════════════════════════════════════════════════════════
const CHART5_TITLE = "Most of the General Fund Is People";

function ChartFive() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext("2d");

    const segs = [
      { label: "Salaries & benefits", value: 55.5, color: DATA.brown, light: false },
      { label: "Services & supplies", value: 26.6, color: DATA.khaki, light: true },
      { label: "Transfers to other funds", value: 14.6, color: DATA.gray, light: true },
      { label: "Other & capital", value: 3.3, color: DATA.tan, light: true },
    ];

    const c5labels = {
      id: "c5labels",
      afterDatasetsDraw(chart) {
        const c = chart.ctx;
        c.save();
        c.textAlign = "center";
        c.textBaseline = "middle";
        segs.forEach((s, di) => {
          const bar = chart.getDatasetMeta(di).data[0];
          if (!bar) return;
          const w = Math.abs(bar.x - bar.base);
          if (w < 34) return; // skip too-narrow segment (Other & capital)
          c.font = "700 15px " + CV_SANS;
          c.fillStyle = s.light ? T.ink : "#FFFFFF";
          c.fillText(s.value.toFixed(1) + "%", (bar.x + bar.base) / 2, bar.y);
        });
        c.restore();
      },
    };

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [""],
        datasets: segs.map((s) => ({ label: s.label, data: [s.value], backgroundColor: s.color, stack: "spend", categoryPercentage: 0.98, barPercentage: 0.9 })),
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (it) => it.dataset.label + ": " + it.parsed.x + "%" } },
        },
        scales: {
          x: { stacked: true, min: 0, max: 100, display: false, grid: { display: false } },
          y: { stacked: true, display: false, grid: { display: false } },
        },
      },
      plugins: [c5labels],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>{CHART5_TITLE}</h2>
      <ChartShell innerRef={containerRef}>
        <p style={CHART_SUBTITLE}>FY 2026-27 general fund spending by category, $338.4 million</p>
        <ScrollWrap>
          <div style={{ position: "relative", height: 120 }}>
            <canvas ref={canvasRef} role="img" aria-label="Stacked bar of Napa County's general fund spending: salaries and benefits 55.5%, services and supplies 26.6%, transfers to other funds 14.6%, other and capital 3.3%." />
          </div>
        </ScrollWrap>
        <ChartLegend
          items={[
            { color: DATA.brown, label: "Salaries & benefits (55.5%)" },
            { color: DATA.khaki, label: "Services & supplies (26.6%)" },
            { color: DATA.gray, label: "Transfers to other funds (14.6%)" },
            { color: DATA.tan, label: "Other & capital (3.3%)" },
          ]}
        />
        <p style={CHART_FOOTNOTE}>Source: Napa County FY 2026-27 Adopted Budget, General Fund expenditure appropriations.</p>
      </ChartShell>
      <div><DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-5_gf-spending-mix_nvf_2026.png", CHART5_TITLE)} /></div>
      <Caption
        title={CHART5_TITLE}
        description={"More than half of Napa County's general fund pays for salaries and benefits — the county's largest and fastest-growing cost."}
        sources={[{ label: "Napa County FY 2026-27 Adopted Budget", url: BUDGET_IN_BRIEF_URL }]}
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
export default function UnderTheHoodNapaCountyBudget2027() {
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

        {/* ── ARTICLE SUMMARY ────────────────────────────────────── */}
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
          <strong>NAPA, Calif. —</strong> Napa County's Board of Supervisors adopted a $996.2 million budget for fiscal year 2026-27 on June 23, a 3% increase over the prior year that the county's own leadership frames less as growth than as holding the line. The headline number is up. The revenue underneath it is doing something more complicated.
        </p>

        <p style={P_STYLE}>
          In his transmittal letter, Chief Executive Officer Ryan Alsop wrote that "key discretionary revenues — including property, sales, and transient occupancy taxes — are growing more slowly than the cost of delivering critical public services." In its detailed tables, the budget sets all three of those taxes below the level it adopted a year ago. In its public summary, the county says property tax "continues to grow." Both are true, and the space between them is this year's story: the county still expects property tax to rise over time, but it budgeted a smaller number than it had penciled in before, while sales and lodging taxes are falling outright.
        </p>

        <p style={P_STYLE}>
          Napa Valley Features has examined across several installments how the county's economy stands on four legs — wine, tourism, hospitality and the property-tax base that funds the public services around them — with three slipping while the fourth held. This budget is where that pressure reaches the county's own ledger.
        </p>

        {/* ── SECTION — READING THE BUDGET ─────────────────────────── */}
        <h2 style={SECTION_H2}>Reading the Budget</h2>

        <p style={P_STYLE}>
          Two numbers do most of the work. The $996.2 million figure is the all-funds budget — every county fund combined, including internal transfers counted more than once, which is why it runs close to a billion dollars. The general fund, the discretionary pot the Board actually steers, is $338.4 million, and it did not grow. It fell $2.9 million, or 0.9%, from the prior year.
        </p>

        <ChartOne />

        <p style={P_STYLE}>
          The all-funds total rose $28.6 million even as the general fund shrank because the increases sit in restricted funds: $28.6 million more in operating special revenue funds, including a new Behavioral Health Treatment Center and capital work at the Napa and Yountville libraries, and $17.5 million more in enterprise funds, most of it airport capital projects. Money the county cannot freely redirect went up. Money it can went down.
        </p>

        <p style={P_STYLE}>
          Taxes make up 63.9% of general fund revenue, and that concentration is why the revenue mix matters more here than the modest top-line change implies. When roughly two of every three general fund dollars come from three taxes, the direction of those taxes sets the tone for everything the county can choose to spend.
        </p>

        <ChartTwo />

        {/* ── SECTION — THE COUNTY MARKS ITS ESTIMATES DOWN ────────── */}
        <h2 style={SECTION_H2}>The County Marks Its Estimates Down</h2>

        <p style={P_STYLE}>
          The general fund's tax line is budgeted at $199.2 million, down $3.1 million from the prior year's $202.3 million. Within it, property tax is the giant — $112.3 million — followed by a category of other taxes and vehicle-license fees at $61.3 million, then sales tax at $13.2 million and transient occupancy tax at $12.5 million.
        </p>

        <p style={P_STYLE}>
          Sales and lodging taxes are down for the plainest reason: the money is not coming in. Sales tax is budgeted 4.3% lower, about $596,000, on the forecast from the county's consultant, HdL Companies. Transient occupancy tax — the lodging levy, and the county's clearest read on visitor spending — is budgeted 5.7% lower, about $750,000, "reflecting latest market trends."
        </p>

        <ChartThree />

        <p style={P_STYLE}>
          Property tax is the subtler case. The county set its property-tax estimate at $112.3 million, $1.8 million — or 1.7% — below the figure it adopted a year earlier, describing the change as realigning the budget with "actual revenues received and current trends." At the same time, its public <a href={BUDGET_IN_BRIEF_URL} target="_blank" rel="noopener noreferrer" style={LINK}>Budget in Brief</a> stresses that property tax "continues to grow" and remains the county's largest discretionary revenue source. Both hold together: the county still expects property tax to climb over time, at a rate it puts near 4% a year, but it budgeted a smaller increase than it had before. On its anchor revenue, the county adjusted its expectation downward rather than up.
        </p>

        <p style={P_STYLE}>
          The TOT figure connects most directly to prior coverage. In <em><a href="/under-the-hood/napa-four-legged-economy-2026" style={LINK}>Napa County's Tax Base Begins to Wobble</a></em> (July 2, 2026), this column reported that the county collected $13.10 million in TOT in fiscal 2024-25, down 0.5%, and characterized the lodging levy as flat below its earlier peak. The fiscal 2026-27 budget now sets it lower still. The tourism leg is no longer just failing to grow; the county is budgeting for it to fall.
        </p>

        {/* ── SECTION — BUILT ON ASSETS, NOT WAGES ─────────────────── */}
        <h2 style={SECTION_H2}>Built on Assets, Not Wages</h2>

        <p style={P_STYLE}>
          The reason a soft revenue year deserves attention is what the strong years were built on. The county's tax roll has climbed steeply — total assessed value reached $55.77 billion in fiscal 2024-25, up from $32.87 billion nine years earlier, a gain of roughly 70%, according to the county's <a href={ACFR_URL} target="_blank" rel="noopener noreferrer" style={LINK}>Annual Comprehensive Financial Report</a>. That is the foundation under the fourth leg, and by that measure it looks formidable.
        </p>

        <p style={P_STYLE}>
          But it grew on real-estate values, not on paychecks. Over the same stretch, the wage economy beneath the roll did not keep pace. The county's 10 largest employers shed a net 1,775 jobs between 2016 and 2024-25, total employment barely moved, and the civilian labor force fell about 4.1% in the most recent year on record, as documented in prior Under the Hood coverage. Median household income in Napa County was about $111,000 in 2024, by the Census Bureau's <a href={ACS_DATAUSA_URL} target="_blank" rel="noopener noreferrer" style={LINK}>American Community Survey</a> — a comfortable figure, but one that has not risen anywhere near as fast as the assessed value of the property around it.
        </p>

        <p style={P_STYLE}>
          That gap is the vulnerability. A tax base that swells on appreciating real estate rather than on rising wages produces revenue as long as the real estate keeps appreciating. It has less to fall back on when the assets reprice and the wage economy underneath was never the thing carrying it. The tax piece named the properties already turning — Stanly Ranch, Treasury Wine Estates holdings, Benessere Vineyards — and noted that nine of the county's 10 largest property taxpayers are wine, vineyard or hospitality real estate, the same assets now trading at discounts. The budget does not yet reflect that repricing in the roll. It reflects a county starting to plan as if the paychecks below the roll cannot be counted on to fill the gap.
        </p>

        <p style={P_STYLE}>
          A second measure in the same budget points the same way. The Treasurer-Tax Collector's on-time collection rate for secured property taxes — the share of each year's levy paid within the fiscal year it is owed — eased in each of the three fully closed years on record: 98.37% in 2022-23, 97.68% in 2023-24 and 97.17% in 2024-25. The partial figure for 2025-26, reported as of mid-April before the second installment had fully posted, stood lower still, though the closed-year number will land higher once late payments clear. Across the same span, the dollar amount levied kept rising, to an estimated $684 million in 2025-26. The county is billing more and, at the margin, collecting a slightly smaller share of it on time — the kind of small signal that shows up when households are stretched.
        </p>

        <ChartFour />

        {/* ── SECTION — WHAT IS DRIVING COSTS UP ───────────────────── */}
        <h2 style={SECTION_H2}>What Is Driving Costs Up</h2>

        <p style={P_STYLE}>
          If the tax base grew on assets, the costs are rising on the wage side of the ledger — and faster than the taxes that cover them. Countywide salaries and benefits rise from about $388.4 million to $400.3 million, an increase of $11.9 million, or 3.1%, reflecting cost-of-living adjustments, merit increases and benefit costs across 1,654 authorized positions.
        </p>

        <p style={P_STYLE}>
          General liability and property insurance, spread across every county department, rose $1.2 million, or 9% — well ahead of inflation and several times the pace of the property-tax line meant to help cover it. The general fund also absorbed a $7 million transfer to the roads fund to finish repairs from the November 2025 storms, drawn in part from the county's fiscal-uncertainty reserve.
        </p>

        <p style={P_STYLE}>
          Those pressures — compensation, insurance and storm recovery — are why a general fund with a softening tax base still had to find offsetting cuts. The county wrote that with "costs of goods and services outpacing the growth of discretionary revenues," departments "were tasked to find additional efficiencies." That single sentence is the budget's whole tension: what the county pays for labor and services is climbing faster than what its taxes bring in.
        </p>

        {/* ── SECTION — WHERE THE MONEY GOES ───────────────────────── */}
        <h2 style={SECTION_H2}>Where the Money Goes</h2>

        <p style={P_STYLE}>
          More than half of the general fund goes to people. Salaries and benefits account for 55.5% of general fund spending, services and supplies another 26.6%, and transfers to other funds 14.6%, leaving barely 3% for the equipment and capital the county buys outright. That composition is why rising compensation presses so directly on the budget: the county's largest expense and its fastest-growing one are the same line.
        </p>

        <ChartFive />

        <p style={P_STYLE}>
          Public safety and infrastructure dominate what those dollars buy. The Sheriff's Office budget is roughly $66 million, funding around-the-clock patrol across the unincorporated county and recently approved cost-of-living adjustments for deputies. Fire services total about $34 million, including $21.5 million for frontline personnel and $3.5 million in wildfire fuels-reduction work, under the county's CAL FIRE partnership dating to 1932. Roads and infrastructure draw nearly $37 million, with the county preparing to accelerate tens of millions more in repairs funded by voter-approved Measure U.
        </p>

        <p style={P_STYLE}>
          The budget also directs $24 million to affordable housing and homelessness response and funds construction of a new Behavioral Health Treatment Center in the former probation reentry facility. What fell was flexible capital: the capital projects fund dropped $29.1 million, or 69.6%, because the general fund did not have surplus dollars to move into it this year. When discretionary revenue tightens, one-time capital is the first thing to go.
        </p>

        {/* ── SECTION — THE CUSHION ────────────────────────────────── */}
        <h2 style={SECTION_H2}>The Cushion</h2>

        <p style={P_STYLE}>
          None of this describes a county in distress. Napa County enters the softer revenue environment from a position of unusual financial strength — the same structural soundness the tax piece credited even as it questioned the foundation. The fiscal 2026-27 budget sets aside $77.6 million in reserves and designations, maintains minimal debt, and earned the county a second consecutive Distinguished Budget Presentation Award from the Government Finance Officers Association. The budget is balanced, with financing sources equal to uses.
        </p>

        <p style={P_STYLE}>
          That cushion is what buys time. It lets the county absorb a softening tax base and a 9% insurance increase in the same year without cutting services, by trimming capital and drawing modestly on reserves. It is the difference between a soft year and a hard one.
        </p>

        <p style={P_STYLE}>
          The open question is how many soft years the cushion is meant to cover. This budget treats the tax downturn as a one-year realignment — property tax "realigned" to current trends, TOT reflecting "latest market trends." The tax piece documented that the repricing of Napa's wine and hospitality real estate has only begun to work through a roll that lags the market by a year or two, and that the wage economy beneath it has been thinning for longer than that. If those patterns hold, the strain is structural rather than seasonal.
        </p>

        <p style={P_STYLE}>
          The harder question the balanced budget cannot answer is the one the rising tax roll could not: what the county's revenue looks like once this round of repricing works through the assessment roll, in a place where the paychecks were never keeping pace with the property to begin with.
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
              <a href="/under-the-hood/napa-four-legged-economy-2026" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>"Under the Hood: Napa County's Tax Base Begins to Wobble"</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> — Napa Valley Features (July 2, 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="/under-the-hood/napa-population-2025" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>"Under the Hood: Napa County Shrunk as Calistoga Grew and the Base Faltered"</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> — Napa Valley Features (May 14, 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="/under-the-hood/napa-price-discovery-2026" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>"Under the Hood: When the Price Gives Way"</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> — Napa Valley Features (April 16, 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-valleys-growing" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>"Under the Hood: Napa Valley's Growing Reliance on the Wine Industry"</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> — Napa Valley Features (June 1, 2024)</span>
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
              placeholder="Search tax revenue, property tax, general fund, transient occupancy tax..."
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
            Figures are from Napa County's FY 2026-27 Adopted Budget and its Budget in Brief. The property-tax figure charted in "All Three Tax Estimates Set Below Last Year's Budget" is a downward realignment of the county's adopted estimate — $112.3 million, 1.7% below the prior year's adopted figure — not a year-over-year decline in dollars collected; the county states property tax still grows about 4% a year. Sales tax (down 4.3%) and transient occupancy tax (down 5.7%) are budgeted below the prior year on market declines. The 2025-26 on-time secured-property-tax collection rate (91.43%) is fiscal-year-to-date as of mid-April, before the second installment fully posted; the closed-year figure will land higher once late payments clear. Median household income is cited as a level (about $111,000, 2024 American Community Survey), not a growth rate.
          </p>
        </div>

        {/* ── SOURCES ─────────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 40, paddingTop: 24 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: T.ink, marginBottom: 16 }}>Sources</h2>
          <ol style={{ fontFamily: font, fontSize: 14, color: T.ink, lineHeight: 1.75, paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>Napa County FY 2026-27 <a href={BUDGET_IN_BRIEF_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Adopted Budget and Budget in Brief</a> (napacounty.gov).</li>
            <li style={{ marginBottom: 8 }}>Napa County FY 2024-25 <a href={ACFR_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Annual Comprehensive Financial Report</a> — assessed value, transient-occupancy-tax actuals and top taxpayers.</li>
            <li style={{ marginBottom: 8 }}>Napa County median household income, U.S. Census Bureau American Community Survey, via <a href={ACS_DATAUSA_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Data USA</a>.</li>
          </ol>
        </div>

      </div>

      <Footer />
    </div>
  );
}

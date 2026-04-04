// UNDER THE HOOD — napa-structural-reset-2026
import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import html2canvas from "html2canvas";
import NavBar from "./NavBar";
import Footer from "./Footer";

Chart.register(...registerables);

const T = {
  bg: "#F5F0E8", surface: "#EDE8DE", ink: "#2C1810", accent: "#8B5E3C",
  gold: "#C4A050", muted: "#8B7355", border: "#D4C9B8", rule: "rgba(44,24,16,0.12)",
};
const font = "'Source Sans 3','Source Sans Pro',sans-serif";
const serif = "'Libre Baskerville',Georgia,serif";
const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";
const ARTICLE_SLUG = "napa-structural-reset-2026";

async function downloadComponentPng(containerRef, filename, title) {
  if (!containerRef.current) return;
  const canvas = await html2canvas(containerRef.current, { scale: 2, backgroundColor: "#F5F0E8", useCORS: true });
  const off = document.createElement("canvas");
  off.width = canvas.width;
  off.height = canvas.height + 80;
  const ctx = off.getContext("2d");
  ctx.fillStyle = "#F5F0E8";
  ctx.fillRect(0, 0, off.width, off.height);
  ctx.drawImage(canvas, 0, 60);
  ctx.save(); ctx.globalAlpha = 1.0;
  ctx.font = "bold 32px 'Libre Baskerville',Georgia,serif";
  ctx.fillStyle = "#2C1810"; ctx.textAlign = "left"; ctx.textBaseline = "top";
  ctx.fillText(title || "", 28, 16); ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.25;
  ctx.font = "26px 'Source Code Pro',monospace";
  ctx.fillStyle = "#8B7355"; ctx.textAlign = "right"; ctx.textBaseline = "bottom";
  ctx.fillText("napaserve.org", off.width - 20, off.height - 16); ctx.restore();
  const link = document.createElement("a");
  link.download = filename;
  link.href = off.toDataURL("image/png");
  link.click();
}

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

function PollsSection() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${WORKER}/api/article-polls?slug=${ARTICLE_SLUG}`)
      .then(r => r.json())
      .then(data => { setPolls(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
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

function dateToX(str) {
  const [year, month] = str.split("-").map(Number);
  return (year - 2023) * 12 + (month - 1);
}

const CATEGORIES = [
  { label: "Hospitality Closures", color: "#8B2E2E", y: 4 },
  { label: "Production / Capacity", color: "#C4A050", y: 3 },
  { label: "Deal Structure / Transactions", color: "#5C7A5C", y: 2 },
  { label: "Distribution / Macro", color: "#8B7355", y: 1 },
];

const EVENTS = [
  { x: "2023-12", label: "Atelier by JCB closes (Yountville)", cat: 0 },
  { x: "2025-12", label: "JCB Senses closes (Yountville)", cat: 0 },
  { x: "2026-01", label: "Chateau Buena Vista closes (Napa)", cat: 0 },
  { x: "2026-01", label: "JCB Tasting Salon closes (Yountville)", cat: 0, yOff: -14 },
  { x: "2026-01", label: "Vermeil Wines closes (Napa)", cat: 0, yOff: 14 },
  { x: "2026-02", label: "Johnny\u2019s closes (Calistoga)", cat: 0 },
  { x: "2026-03", label: "Calistoga Depot temp. closes", cat: 0 },
  { x: "2026-04", label: "Charlie Palmer Steak closes (Napa)", cat: 0 },
  { x: "2025-09", label: "Gallo closes Courtside Cellars (SLO)", cat: 1 },
  { x: "2026-04", label: "Gallo closes Ranch Winery; 93 jobs", cat: 1 },
  { x: "2023-12", label: "NVF: Bohemia to Boardroom", cat: 2 },
  { x: "2025-12", label: "Trinchero acquires Mumm Napa", cat: 2 },
  { x: "2025-12", label: "Third Leaf: Cain brand/inventory", cat: 2, yOff: -14 },
  { x: "2026-02", label: "Trinchero lists 2 vineyards", cat: 2 },
  { x: "2026-03", label: "Stanly Ranch: $195M vs $243.6M debt", cat: 2 },
  { x: "2025-09", label: "RNDC exits California; 2,500+ brands", cat: 3 },
];

const X_MIN = dateToX("2023-11");
const X_MAX = dateToX("2026-05");

function xTickLabel(val) {
  const year = 2023 + Math.floor(val / 12);
  const month = (val % 12) + 1;
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if (month === 1) return `Jan ${year}`;
  if (month === 4 || month === 7 || month === 10) return names[month - 1];
  return "";
}

const REPRICING = [
  { label: "RH stock, 5-yr", value: -80, note: "Adjacent luxury-experience sector, Yountville location" },
  { label: "Stanly Ranch vs. total debt stack", value: -20, note: "$195M sale vs. $243.6M debt, Mar. 2026" },
  { label: "U.S. wine DtC revenue, 5-yr", value: -21, note: "$94B (2020) to $74.3B (2025) per SVB 2026" },
];

const GDP24 = 11313.745;
const ASSET_BASE = 17000;
const MULT = 0.4;

function TimelineChart() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const labelPlugin = {
      id: "eventLabels",
      afterDatasetsDraw(chart) {
        const { ctx: c } = chart;
        chart.data.datasets.forEach((dataset, di) => {
          const cat = CATEGORIES[di];
          const meta = chart.getDatasetMeta(di);
          meta.data.forEach((point, pi) => {
            const raw = dataset.data[pi];
            c.save();
            c.font = `11px ${font}`;
            c.fillStyle = cat.color;
            c.textAlign = "left";
            c.textBaseline = "middle";
            c.fillText(raw.label, point.x + 10, point.y + (raw.yOff || 0));
            c.restore();
          });
        });
      },
    };
    const datasets = CATEGORIES.map((cat, ci) => ({
      label: cat.label,
      data: EVENTS.filter(e => e.cat === ci).map(e => ({ x: dateToX(e.x), y: cat.y, label: e.label, yOff: e.yOff || 0 })),
      backgroundColor: cat.color, borderColor: cat.color, pointRadius: 7, pointHoverRadius: 9,
    }));
    const chart = new Chart(canvasRef.current, {
      type: "scatter", data: { datasets }, plugins: [labelPlugin],
      options: {
        animation: false, responsive: true, maintainAspectRatio: false,
        layout: { padding: { right: 20 } },
        scales: {
          x: { type: "linear", min: X_MIN, max: X_MAX, ticks: { stepSize: 1, callback: xTickLabel, color: T.muted, font: { size: 11 }, maxRotation: 0 }, grid: { color: T.rule } },
          y: { min: 0, max: 5, ticks: { stepSize: 1, callback: (val) => CATEGORIES[val - 1]?.label || "", color: T.ink, font: { size: 11, weight: "600" } }, grid: { color: T.rule } },
        },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => c.raw.label, title: () => "" } } },
      },
    });
    return () => chart.destroy();
  }, []);
  return (
    <div ref={containerRef} style={{ background: T.bg, borderRadius: 4, padding: "16px 16px 8px", marginBottom: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", marginBottom: 12 }}>
        {CATEGORIES.map(cat => (
          <div key={cat.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
            <span style={{ fontFamily: font, fontSize: 11, color: T.ink }}>{cat.label}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 280, position: "relative" }}>
        <canvas ref={canvasRef} />
      </div>
      <button onClick={() => downloadComponentPng(containerRef, "napa-contraction-timeline.png", "Napa Valley: Regional Contraction Timeline, 2023\u20132026")}
        style={{ marginTop: 8, padding: "4px 12px", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.08em", color: T.muted, background: "transparent", border: `1px solid ${T.border}`, borderRadius: 3, cursor: "pointer" }}>
        DOWNLOAD CHART PNG
      </button>
    </div>
  );
}

function RepricingChart() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const chart = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: REPRICING.map(d => d.label),
        datasets: [{ data: REPRICING.map(d => d.value), backgroundColor: "rgba(139,46,46,0.6)", borderColor: "#8B2E2E", borderWidth: 1, borderRadius: 3 }],
      },
      options: {
        indexAxis: "y", animation: false, responsive: true, maintainAspectRatio: false,
        scales: {
          x: { min: -100, max: 0, ticks: { callback: (v) => `${v}%`, color: T.muted, font: { size: 11 } }, grid: { color: T.rule } },
          y: { ticks: { color: T.ink, font: { size: 12 } }, grid: { display: false } },
        },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => { const d = REPRICING[ctx.dataIndex]; return [`${ctx.raw}%`, d.note]; } } } },
      },
    });
    return () => chart.destroy();
  }, []);
  return (
    <div ref={containerRef} style={{ background: T.bg, borderRadius: 4, padding: "16px 16px 8px", marginBottom: 8 }}>
      <p style={{ fontFamily: font, fontSize: 12, color: T.muted, marginBottom: 12 }}>
        Selected repricing signals across luxury, hospitality and wine. Sources and methods vary. Not directly comparable. For context only. Bars extend left from zero baseline.
      </p>
      <div style={{ height: 160, position: "relative" }}>
        <canvas ref={canvasRef} />
      </div>
      <button onClick={() => downloadComponentPng(containerRef, "napa-repricing-chart.png", "Repricing Across the System")}
        style={{ marginTop: 8, padding: "4px 12px", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.08em", color: T.muted, background: "transparent", border: `1px solid ${T.border}`, borderRadius: 3, cursor: "pointer" }}>
        DOWNLOAD CHART PNG
      </button>
    </div>
  );
}

function ScenarioCalculator() {
  const [haircut, setHaircut] = useState(20);
  const [activeScenario, setActiveScenario] = useState("B");
  const drag = ASSET_BASE * (haircut / 100) * MULT;
  const pct = (drag / GDP24) * 100;
  const projGDP = GDP24 - drag;
  const barW = Math.max(0, Math.min(100, (projGDP / GDP24) * 100));
  const r1 = (n) => Math.round(n * 10) / 10;
  const fmtM = (m) => `\u2212$${Math.round(m)}M`;
  const fmtP = (p) => `\u2212${r1(p)}%`;
  const basisLabel = haircut === 11 ? "vs. original loan" : haircut === 20 ? "vs. total debt stack" : "custom rate";
  const histData = [
    { yr: "2019", gdp: 11004.396, color: "#8B5E3C" },
    { yr: "2020", gdp: 10453.531, color: "#C4A050" },
    { yr: "2021", gdp: 11455.005, color: "#8B5E3C" },
    { yr: "2022", gdp: 10970.744, color: "#8B5E3C" },
    { yr: "2023", gdp: 11223.179, color: "#8B5E3C" },
    { yr: "2024", gdp: 11313.745, color: "#2C1810" },
  ];
  return (
    <div style={{ background: T.bg, border: `1px solid ${T.rule}`, borderRadius: 4, padding: 20, margin: "32px 0" }}>
      <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.gold, fontWeight: 700, marginBottom: 6 }}>Scenario Calculator</p>
      <h3 style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 6 }}>{"What Does Asset Repricing Mean for Napa\u2019s Economy?"}</h3>
      <p style={{ fontFamily: font, fontSize: 13, color: T.muted, marginBottom: 16, lineHeight: 1.5 }}>
        The Stanly Ranch foreclosure auction is the first publicly recorded price-discovery transaction for a marquee Napa hospitality asset in this cycle. It produces two sourced haircut figures depending on how the debt is measured. The scenarios below are built from those two numbers only. Real GDP baseline: $11.31 billion (2024, BEA FRED REALGDPALL06055). Full county GDP composition in{" "}
        <a href="/under-the-hood/napa-gdp-2024" style={{ color: T.accent }}>{"\u201CNapa\u2019s Economy Looks Bigger Than It Is\u201D"}</a> (March 2026).
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Haircut vs. original loan (~$220M)", val: "\u221211%", math: "$195M \u00F7 $220M = 0.886 \u00B7 Discount: $25M" },
          { label: "Haircut vs. total debt stack ($243.6M)", val: "\u221220%", math: "$195M \u00F7 $243.6M = 0.801 \u00B7 Discount: $48.6M" },
        ].map(c => (
          <div key={c.label} style={{ background: T.surface, borderRadius: 3, padding: 12, borderLeft: `3px solid ${T.gold}` }}>
            <div style={{ fontFamily: font, fontSize: 11, color: T.muted, marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: "#8B2E2E" }}>{c.val}</div>
            <div style={{ fontFamily: "monospace", fontSize: 10, color: T.muted, marginTop: 3 }}>{c.math}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8, marginBottom: 16 }}>
        {[
          { id: "A", label: "Scenario A \u2014 11%", sub: "vs. original loan\n$220M \u2192 $195M", val: 11 },
          { id: "B", label: "Scenario B \u2014 20%", sub: "vs. total debt stack\n$243.6M \u2192 $195M", val: 20 },
          { id: "C", label: "Custom", sub: "Use slider \u00B7 0\u201330%", val: null },
        ].map(sc => (
          <div key={sc.id} onClick={() => { if (sc.val !== null) { setHaircut(sc.val); setActiveScenario(sc.id); } else { setActiveScenario("C"); } }}
            style={{ background: activeScenario === sc.id ? "#2C1810" : T.surface, border: `1px solid ${activeScenario === sc.id ? "#2C1810" : T.border}`, borderRadius: 4, padding: "10px 8px", textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontFamily: font, fontSize: 12, fontWeight: 700, color: activeScenario === sc.id ? "#F5F0E8" : T.ink, marginBottom: 3 }}>{sc.label}</div>
            <div style={{ fontFamily: "monospace", fontSize: 10, color: activeScenario === sc.id ? T.gold : T.muted, whiteSpace: "pre-line" }}>{sc.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
          <span style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: T.ink }}>Asset repricing rate</span>
          <span style={{ fontFamily: "monospace", fontSize: 13, color: T.accent, fontWeight: 700 }}>{"\u2212"}{haircut}%</span>
        </div>
        <input type="range" min="0" max="30" value={haircut} step="1"
          onChange={(e) => { setHaircut(parseInt(e.target.value)); setActiveScenario("C"); }}
          style={{ width: "100%", accentColor: T.accent, cursor: "pointer" }} />
        <div style={{ fontFamily: font, fontSize: 11, color: T.muted, marginTop: 3, lineHeight: 1.4 }}>
          Applied to estimated Napa County real estate and hospitality asset base (~$17B, BEA fixed assets + county assessor). GDP drag at 0.4x indirect multiplier.
        </div>
      </div>
      <div style={{ background: T.surface, borderRadius: 4, padding: 16 }}>
        <div style={{ fontFamily: font, fontSize: 11, color: T.muted, marginBottom: 6 }}>
          {"Napa County real GDP 2019\u20132026 scenario (BEA 2017 chained dollars; bars normalized to 2024 = 100%)"}
        </div>
        {histData.map(d => (
          <div key={d.yr} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: d.yr === "2024" ? T.ink : T.muted, fontWeight: d.yr === "2024" ? 700 : 400, width: 30, textAlign: "right", flexShrink: 0 }}>{d.yr}</span>
            <div style={{ flex: 1, height: 5, background: T.border, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min((d.gdp / GDP24) * 100, 100)}%`, background: d.color, borderRadius: 3 }} />
            </div>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: d.yr === "2024" ? T.ink : T.muted, fontWeight: d.yr === "2024" ? 700 : 400, width: 48, textAlign: "right", flexShrink: 0 }}>${r1(d.gdp / 1000)}B</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "7px 0 7px 38px" }}>
          <div style={{ flex: 1, height: 1, borderTop: "1px dashed #D4C9B8" }} />
          <span style={{ fontFamily: "monospace", fontSize: 9, color: T.muted, whiteSpace: "nowrap" }}>scenario estimate below</span>
          <div style={{ flex: 1, height: 1, borderTop: "1px dashed #D4C9B8" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: "monospace", fontSize: 10, color: "#8B2E2E", width: 30, textAlign: "right", flexShrink: 0 }}>2026</span>
          <div style={{ flex: 1, height: 5, background: T.border, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${barW}%`, background: "#8B2E2E", opacity: 0.65, borderRadius: 3 }} />
          </div>
          <span style={{ fontFamily: "monospace", fontSize: 10, color: "#8B2E2E", width: 48, textAlign: "right", flexShrink: 0 }}>${r1(projGDP / 1000)}B</span>
        </div>
        <div style={{ fontFamily: font, fontSize: 10, color: T.muted, marginTop: 4, fontStyle: "italic", paddingLeft: 38 }}>
          2026 bar = 2024 baseline minus estimated repricing drag. At 0% repricing, 2026 bar equals 2024 baseline exactly.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8, margin: "14px 0" }}>
          {[
            { label: "2024 real GDP baseline", val: "$11.31B", sub: "BEA REALGDPALL06055", neg: false },
            { label: "Repricing rate", val: `\u2212${haircut}%`, sub: basisLabel, neg: true },
            { label: "Estimated GDP drag", val: fmtM(drag), sub: `${fmtP(pct)} of 2024 baseline`, neg: true },
          ].map(c => (
            <div key={c.label} style={{ background: T.bg, borderRadius: 3, padding: 12 }}>
              <div style={{ fontFamily: font, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{c.label}</div>
              <div style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, color: c.neg ? "#8B2E2E" : T.ink }}>{c.val}</div>
              <div style={{ fontFamily: font, fontSize: 10, color: T.muted, marginTop: 2 }}>{c.sub}</div>
            </div>
          ))}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
          <thead>
            <tr>{["Scenario","Rate","Basis","Est. GDP drag","% of baseline"].map(h => <th key={h} style={{ fontFamily: font, fontSize: 11, fontWeight: 700, color: T.muted, textAlign: "left", padding: "4px 6px", borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            <tr><td style={{ fontFamily: font, fontSize: 11, color: T.ink, padding: "5px 6px", borderBottom: `1px solid rgba(44,24,16,.06)` }}>A</td><td style={{ fontFamily: font, fontSize: 11, color: T.ink, padding: "5px 6px", borderBottom: `1px solid rgba(44,24,16,.06)` }}>{"\u221211%"}</td><td style={{ fontFamily: font, fontSize: 11, color: T.ink, padding: "5px 6px", borderBottom: `1px solid rgba(44,24,16,.06)` }}>vs. original loan</td><td style={{ fontFamily: font, fontSize: 11, color: "#8B2E2E", fontWeight: 700, padding: "5px 6px", borderBottom: `1px solid rgba(44,24,16,.06)` }}>{"\u2212$247M"}</td><td style={{ fontFamily: font, fontSize: 11, color: "#8B2E2E", fontWeight: 700, padding: "5px 6px", borderBottom: `1px solid rgba(44,24,16,.06)` }}>{"\u22122.2%"}</td></tr>
            <tr style={{ background: "rgba(44,24,16,.04)" }}><td style={{ fontFamily: font, fontSize: 11, color: T.ink, padding: "5px 6px", borderBottom: `1px solid rgba(44,24,16,.06)` }}><strong>{activeScenario === "C" ? "Custom" : `${activeScenario} (current)`}</strong></td><td style={{ fontFamily: font, fontSize: 11, color: T.ink, padding: "5px 6px", borderBottom: `1px solid rgba(44,24,16,.06)` }}>{`\u2212${haircut}%`}</td><td style={{ fontFamily: font, fontSize: 11, color: T.ink, padding: "5px 6px", borderBottom: `1px solid rgba(44,24,16,.06)` }}>{basisLabel}</td><td style={{ fontFamily: font, fontSize: 11, color: "#8B2E2E", fontWeight: 700, padding: "5px 6px", borderBottom: `1px solid rgba(44,24,16,.06)` }}>{fmtM(drag)}</td><td style={{ fontFamily: font, fontSize: 11, color: "#8B2E2E", fontWeight: 700, padding: "5px 6px", borderBottom: `1px solid rgba(44,24,16,.06)` }}>{fmtP(pct)}</td></tr>
            <tr><td style={{ fontFamily: font, fontSize: 11, color: T.ink, padding: "5px 6px" }}>Reference</td><td style={{ fontFamily: font, fontSize: 11, color: T.ink, padding: "5px 6px" }}>{"\u22128.8%"}</td><td style={{ fontFamily: font, fontSize: 11, color: T.ink, padding: "5px 6px" }}>2020 actual GDP decline</td><td style={{ fontFamily: font, fontSize: 11, color: "#8B2E2E", fontWeight: 700, padding: "5px 6px" }}>{"\u2212$1,003M"}</td><td style={{ fontFamily: font, fontSize: 11, color: "#8B2E2E", fontWeight: 700, padding: "5px 6px" }}>{"\u22128.8%"}</td></tr>
          </tbody>
        </table>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: font, fontSize: 11, color: T.muted, marginBottom: 3 }}>
          <span>Estimated drag as % of 2024 real GDP</span><span>{r1(pct)}%</span>
        </div>
        <div style={{ height: 8, background: T.border, borderRadius: 4 }}>
          <div style={{ height: "100%", width: `${Math.min(pct * 10, 100)}%`, background: "#8B2E2E", borderRadius: 4 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 9, color: T.muted, marginTop: 2, marginBottom: 10 }}>
          <span>0%</span><span>2.5%</span><span>5%</span><span>7.5%</span><span>10%</span>
        </div>
        <div style={{ fontFamily: font, fontSize: 11, color: T.muted, lineHeight: 1.5, borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>
          <strong>Methodology:</strong> Asset base ~$17B from BEA regional fixed assets and Napa County assessor data. GDP drag = asset base {"\u00D7"} repricing rate {"\u00D7"} 0.4 indirect multiplier. All figures in 2017 chained dollars (BEA REALGDPALL06055). 2026 scenario bar normalized to 2024 = 100%; at 0% repricing it equals 2024 baseline exactly. 2020 reference is actual BEA-reported decline. Uniform repricing rate applied across asset base {"\u2014"} actual impact varies by asset class, leverage and timing. See{" "}
          <a href="/under-the-hood/napa-supply-chain-2026" style={{ color: T.accent }}>{"\u201CUnder the Hood: How a Global Supply Shock Reaches Napa Valley\u201D"}</a> (March 2026) for cost-side context. Directional estimates only {"\u2014"} not a BEA or county economic forecast.
        </div>
      </div>
    </div>
  );
}

const prose = { fontFamily: serif, fontSize: 16, color: "#2C1810", lineHeight: 1.8, marginBottom: 14 };
const extLink = { color: "#8B5E3C", textDecoration: "none", borderBottom: "1px solid #C4A050" };
const sectionHead = { fontFamily: serif, fontSize: 22, fontWeight: 700, color: "#2C1810", margin: "40px 0 16px", lineHeight: 1.3 };

export default function NapaStructuralReset() {
  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: font, color: "#2C1810" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <NavBar />
      <div style={{ background: "#2C1810", color: "#F5F0E8", textAlign: "center", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", padding: "10px 24px" }}>
        Napa Valley Features &nbsp;&middot;&nbsp; Under the Hood &nbsp;&middot;&nbsp; April 2026
      </div>
      <article style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px 60px" }}>
        <div style={{ fontFamily: "monospace", fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase", color: T.gold, marginTop: 32, marginBottom: 16 }}>
          Under the Hood &nbsp;&middot;&nbsp; Napa Valley Features
        </div>
        <h1 style={{ fontFamily: serif, fontWeight: 700, fontSize: "clamp(26px, 5vw, 42px)", color: T.ink, lineHeight: 1.15, marginBottom: 20 }}>
          The Reset Spreads
        </h1>
        <p style={{ fontFamily: font, fontWeight: 300, fontSize: 17, lineHeight: 1.65, color: "#5C4033", marginBottom: 24 }}>
          {"Closures are moving beyond wineries into Napa\u2019s visitor economy. Transactions are becoming more defensive. The regional footprint is contracting \u2014 quietly, and across systems."}
        </p>
        <div style={{ borderTop: "1px solid #D4C4A8", paddingTop: 14, marginBottom: 40 }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: T.muted }}>
            By Tim Carl &nbsp;&middot;&nbsp; Napa Valley Features &nbsp;&middot;&nbsp; April 4, 2026
          </div>
        </div>

        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.gold, fontWeight: 700, marginBottom: 6 }}>Chart 1</p>
          <p style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 4 }}>{"Napa Valley: Regional Contraction Timeline, 2023\u20132026"}</p>
          <p style={{ fontFamily: font, fontSize: 12, color: T.muted, marginBottom: 12 }}>Selected closures, transactions and capacity moves. Not exhaustive.</p>
          <div style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
            <TimelineChart />
          </div>
        </div>

        <p style={{ ...prose, marginBottom: 18 }}>
          <span style={{ fontWeight: 700 }}>{"NAPA VALLEY, Calif. \u2014"}</span>{" "}
          {"The story is not about one winery, one auction or one bad quarter. As of April 2026, Napa\u2019s structural adjustment is no longer contained within wine production. It is now visible in restaurants, tasting rooms and hospitality-facing businesses \u2014 the front-of-house layer of the local economy \u2014 while capital is simultaneously becoming more conditional through restructurings, split-asset deals, foreclosures and selective portfolio moves."}
        </p>
        <p style={prose}>
          {"Napa Valley Features has been tracking this pattern since December 2023, when \u201CNapa Valley\u2019s M&A Surge: From Bohemia to Boardroom\u201D documented a shift in deal character: transactions becoming more capital-dominant, less favorable to smaller operators. By September 2024, that frame had widened into a structural reset thesis. By October 2025, the pressures were materializing in distressed conditions and harder exits. The new development as of April 2026 is not that the wine economy is under pressure \u2014 it is that the pressure has spread outward and is now measurable in real closures and real transactions."}
        </p>

        <h2 style={sectionHead}>The Visitor Economy Begins to Show It</h2>
        <p style={prose}>{"Charlie Palmer Steak at Archer Hotel Napa, 1230 First St., will close April 12, 2026, according to a March 31 joint news release from the restaurant group and the hotel. Archer Hotel plans to redevelop the space as a lobby lounge. Charlie Palmer Collective is pursuing a new wine country location."}</p>
        <p style={prose}>{"The restaurant opened in November 2017, the same month as the hotel, and operated for nearly a decade on the First Street corridor. On its own, one restaurant closure is not a trend. In context \u2014 a high-profile, full-service steakhouse inside a purpose-built luxury hotel, closing after nearly a decade \u2014 it is a meaningful signal. It fits the quiet contraction thesis because it is being handled as a repositioning, not a crisis. That is precisely how this kind of contraction tends to arrive: orderly on the surface, cumulative in effect."}</p>
        <p style={prose}>{"The Charlie Palmer platform\u2019s parallel activity is worth noting without overstating. While the Napa steakhouse closes, Charlie Palmer and hospitality executive Christopher Hunsberger are expanding through Appellation Healdsburg \u2014 a newly opened culinary-driven hotel in Healdsburg\u2019s North Village, with Folia Bar & Kitchen as its main restaurant. This is not a simple Napa-to-Sonoma shift. It is selective geographic repositioning within the North Bay experience economy \u2014 the same hospitality platform closing a long-running Napa flagship while opening inside a newer Healdsburg luxury development. That pattern is visible across several operators."}</p>
        <p style={prose}>{"Boisset Collection provides a second data point. Jean-Charles Boisset closed Chateau Buena Vista in downtown Napa and the JCB Tasting Salon in Yountville in late 2025 and early January 2026, the San Francisco Chronicle reported, with spokesperson Patrick Egan confirming both closures. The JCB Yountville location closed when its lease expired; Chateau Buena Vista experiences are being consolidated to the Buena Vista Winery estate in Sonoma. The JCB Tasting Salon was Boisset\u2019s last business in Yountville\u2019s JCB Village, which had previously included Atelier by JCB and Senses by JCB, both already closed. Two JCB locations remain: Raymond Vineyards and a new St. Helena Main Street location, with a permanent Rutherford home planned."}</p>
        <p style={prose}>{"Three named Napa hospitality closures \u2014 Charlie Palmer Steak, Chateau Buena Vista, JCB Yountville \u2014 in a four-month window, each handled as a repositioning, none described as a crisis. That is what quiet contraction looks like."}</p>

        <h2 style={sectionHead}>Production and Capacity Rationalization</h2>
        <p style={prose}>{"E. & J. Gallo will permanently close The Ranch Winery at 105 Zinfandel Lane, St. Helena, effective April 15, 2026. The closure eliminates 56 positions at that facility, with 37 additional layoffs planned at Louis M. Martini Winery, Orin Swift Tasting Room, J Vineyards & Winery and Frei Ranch in Healdsburg \u2014 93 total across five North Coast sites. WARN notices were filed February 12, 2026."}</p>
        <p style={prose}>{"Gallo acquired The Ranch Winery in December 2015 as a 30,000-ton crush facility intended to build its super-premium and luxury wine presence in Napa. That investment did not produce the expected returns. The spokesperson language \u2014 \u201Caligning parts of our operations with our long-term business strategy to ensure we remain well-positioned for future success\u201D \u2014 is the language of capacity rationalization. In September 2025, Gallo also closed its Courtside Cellars winery in San Luis Obispo County, eliminating 47 additional jobs. The world\u2019s largest wine producer by volume is explicitly removing fixed production capacity from the Napa and Sonoma system simultaneously. That is a system-level signal, not a one-company story."}</p>
        <p style={prose}>
          {"The production-side context is documented in "}
          <a href="/under-the-hood/napa-cab-2025" style={extLink}>{"\u201C2025 Napa Grape Prices Slip After a Record High\u201D"}</a>
          {" (March 2026): North Coast bulk wine availability has surged and inventory remains elevated, creating conditions in which large operators have strong incentive to remove fixed costs from the system."}
        </p>

        <h2 style={sectionHead}>When Deals Stop Moving Whole</h2>
        <p style={prose}>{"The most structurally significant transactions of this period are not the closures. They are the deals that completed \u2014 and how they completed."}</p>
        <p style={prose}>{"Third Leaf Partners, a San Francisco investment firm, quietly acquired the Cain Vineyards & Winery brand and inventory in December 2025. The 500-acre Spring Mountain estate is being sold separately to an undisclosed buyer. A long-term grape supply agreement is being negotiated to keep the brand connected to the land it no longer owns. Long-time winemaker Chris Howell noted that roughly two-thirds of the vineyard has been replanted following the 2020 Glass Fire, with full restoration expected by 2030."}</p>
        <p style={prose}>{"In an expansion era, estates like Cain moved whole \u2014 land, brand, winery, grapes and reputation bundled together. This transaction separates them. The brand is owned by one party. The land is being sold to another. The grapes will be connected through a supply contract. That is a fundamentally different structure, and it matters for what it implies about how buyers are now underwriting risk in Napa. The Real Deal reported that MGG Investment Group took over nearby Spring Mountain Vineyard following a $185 million loan default \u2014 a second lender-driven transaction in the same appellation in the same period."}</p>
        <p style={prose}>{"Trinchero Family Wine & Spirits announced the acquisition of Mumm Napa from Pernod Ricard on December 11, 2025 \u2014 a deal that includes Mumm\u2019s Rutherford winery, brand, inventory and a long-term lease on Deveaux Ranch in Carneros. Mumm produced approximately 334,000 cases in the prior year. Separately, Trinchero listed Haystack Vineyard on Atlas Peak ($5.5 million asking) and Clouds Nest Vineyard on Mount Veeder ($4.5 million asking) for sale in February 2026. Trinchero VP of communications Elizabeth Hooker described the vineyard sales as a \u201Cproactive step\u201D to ensure long-term, sustainable growth, and stated the sales are unrelated to the Mumm acquisition."}</p>
        <p style={prose}>{"Whether or not the moves are financially connected, they are temporally and strategically connected. Selling premium mountain vineyard assets while simultaneously acquiring a category platform is selective capital redeployment. In a growth era, this would look contradictory. In a structural reset, it looks like exactly the kind of portfolio pruning sophisticated operators make when they can no longer grow everything at once."}</p>

        <h2 style={sectionHead}>What Stanly Ranch Tells Us</h2>
        <p style={prose}>{"The clearest valuation-reset signal of the period is a transaction on the steps of the Napa County courthouse. Blackstone Real Estate acquired the hotel portion of Stanly Ranch at a foreclosure auction on March 27, 2026. The sale price was $195 million, per the deed recorded with Napa County. The previous owners, SRGA LP, had defaulted on a loan that had grown to $243.6 million in total debt. The original loan was approximately $220 million; the default notice was recorded in October 2025."}</p>
        <p style={prose}>{"The math produces two figures depending on measurement: $195 million against the original $220 million loan implies an 11% discount; against the total $243.6 million debt stack it implies a 20% discount. Both are documented. Operations continue. Auberge Resorts Collection continues to manage the property. But the capital structure was rewritten through distress, and the transaction cleared below the debt stack. That is repricing, not rescue."}</p>
        <p style={prose}>{"Stanly Ranch opened in April 2022 on more than 700 acres in Napa\u2019s Carneros region. It has 135 guest rooms, three outdoor pools and 19,000 square feet of meeting space, and earned a Michelin key. Starting nightly rates run approximately $700."}</p>
        <p style={prose}>{"Blackstone\u2019s involvement adds another layer. The firm remains one of the largest and most sophisticated players in private capital, overseeing more than $1 trillion in assets. But its arrival here also underscores how deeply Napa\u2019s hospitality assets are now tied to broader capital-market conditions \u2014 including a period of tighter liquidity and more visible stress in high-end discretionary real estate. Blackstone\u2019s own framing cited rising group and leisure demand for wellness and experiential travel and continued growth in corporate travel tied to AI sector activity. That is a different demand thesis than the one that built Stanly Ranch."}</p>
        <p style={prose}>{"The transaction\u2019s structure is also notable. The sale does not include the vineyard homes and villas at Stanly Ranch \u2014 a split-asset structure in which the hotel traded separately from the residential components. This is a second example, alongside Cain, of Napa assets being disaggregated rather than bundled. A separate $100 million lawsuit filed March 6, 2026, in New York State Supreme Court by The Nichols Partnership and Stanly Ranch Resort Napa LLC against GA Development Napa Valley LP and Mandrake Capital Partners adds further complexity to the transaction\u2019s full accounting."}</p>

        <ScenarioCalculator />

        <h2 style={sectionHead}>A Regional Pattern, Not a List of Incidents</h2>
        <p style={prose}>{"What looks, at first glance, like a series of isolated adjustments \u2014 a steakhouse closure, a tasting-room retreat, a foreclosure sale, a vineyard listing, a split-asset transaction \u2014 increasingly reads as one regional pattern. Napa\u2019s operating footprint is shrinking while capital becomes more selective, more defensive and more complex."}</p>
        <p style={prose}>{"Public capital markets have already moved. RH \u2014 the luxury furniture and restaurant company that operates a prominent location in Yountville \u2014 has seen its stock decline approximately 80% over five years. The point is narrower than a direct comparison: public markets repriced an adjacent luxury-experience model dramatically, while Napa\u2019s physical assets and operating footprint are only now showing comparable repricing through closures and transactions."}</p>
        <p style={prose}>
          {"The distribution layer is also under stress. Republic National Distributing Company exited California entirely effective September 2, 2025, disrupting more than 2,500 beverage brands. The company cited rising operational costs, industry headwinds and supplier losses. As documented in "}
          <a href="/under-the-hood/napa-supply-chain-2026" style={extLink}>{"\u201CUnder the Hood: How a Global Supply Shock Reaches Napa Valley\u201D"}</a>
          {" (March 2026), distribution-layer disruption compounds production-layer stress across multiple points in the system simultaneously."}
        </p>
        <p style={prose}>
          {"The regional reset is also happening inside a broader environment of portfolio write-downs across the wine category. "}
          <a href="/under-the-hood/sonoma-cab-2025" style={extLink}>{"\u201CSonoma Grape Prices Fall for a Second Year as Cab Sauv Leads the Decline\u201D"}</a>
          {" (March 2026) and "}
          <a href="/under-the-hood/lake-county-cab-2025" style={extLink}>{"\u201CLake County Grape Prices Have Fallen 38% in Two Years \u2014 and Chardonnay Has Nearly Vanished\u201D"}</a>
          {" (March 2026) show that the pressure is not unique to Napa but is playing out across the North Coast system. Major producers have reported impairment charges tied to U.S. wine assets \u2014 formal acknowledgments that prior valuations no longer hold."}
        </p>
        <p style={prose}>{"This is not a cycle. Regional economies built around one dominant growth engine do not simply reset and resume. They reorganize \u2014 slowly, selectively and unevenly \u2014 around what survives."}</p>

        <div style={{ margin: "40px 0" }}>
          <p style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.gold, fontWeight: 700, marginBottom: 6 }}>Chart 2</p>
          <p style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 4 }}>Repricing Across the System</p>
          <div style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
            <RepricingChart />
          </div>
        </div>

        <h2 style={sectionHead}>What Quiet Contraction Looks Like Next</h2>
        <p style={prose}>{"In mature regional economies built around one dominant growth engine, contraction tends to arrive through several mechanics before it shows up in aggregate statistics. Slower reinvestment arrives first: capital that flowed freely into new facilities, expansions and luxury buildouts becomes more cautious. Projects are delayed. Reopenings take longer. New entrants become rarer."}</p>
        <p style={prose}>{"Deal terms become increasingly defensive: seller financing, earn-outs, split-asset structures and lender involvement become more common as buyers seek downside protection that was unnecessary in a growth market. The distance between trophy assets and everything else grows. Strong brands, strong locations and well-capitalized operators pull away; mid-tier operators face harder choices with fewer options."}</p>
        <p style={prose}>{"Employment changes arrive quietly: not dramatic layoff announcements but slower hiring, reduced seasonal staffing, attrition that is not backfilled. Old steel-producing regions, tobacco belt counties, legacy newspaper markets and resort towns that built for a visitor peak that did not hold have all moved through this sequence \u2014 not as direct parallels to Napa, but as examples of how contraction spreads through a regional system quietly rather than theatrically."}</p>
        <p style={prose}>
          {"The useful question is not whether Napa is in decline. It is: how much of the operating footprint was built for a level of demand that no longer exists? And what happens when the cost of maintaining that footprint exceeds what the current market will support? "}
          <a href="/under-the-hood/napa-gdp-2024" style={extLink}>{"\u201CNapa\u2019s Economy Looks Bigger Than It Is\u201D"}</a>
          {" (March 2026) documented that 87% of Napa\u2019s apparent GDP growth since 2016 was attributable to inflation rather than real expansion \u2014 a structural context that matters for understanding how much of the current footprint was built on durable demand versus price-level effects."}
        </p>

        <div style={{ background: "#EDE8DE", borderLeft: "3px solid #C4A050", padding: 24, margin: "32px 0" }}>
          <div style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 16 }}>What to Watch If These Trends Continue</div>
          <div style={{ fontFamily: font, fontSize: 14, fontWeight: 700, color: T.accent, marginBottom: 6 }}>If closures keep spreading</div>
          <p style={{ fontFamily: font, fontSize: 15, color: T.ink, lineHeight: 1.65, marginBottom: 0 }}>{"The question is not whether more closures occur but how quickly vacancies are backfilled, at what price point and by what kind of operator. Longer vacancies, lower rents and a shift toward lower-overhead concepts \u2014 wine bars, pop-ups, small-format retail \u2014 would show up in county commercial real estate data before they register in GDP figures."}</p>
          <div style={{ fontFamily: font, fontSize: 14, fontWeight: 700, color: T.accent, margin: "16px 0 6px" }}>If deal structures keep fragmenting</div>
          <p style={{ fontFamily: font, fontSize: 15, color: T.ink, lineHeight: 1.65, marginBottom: 0 }}>{"If the Cain and Stanly Ranch patterns become more common \u2014 brand separated from land, hotel from residential, assets moving to institutional buyers at below-debt valuations \u2014 the bid-ask spread across Napa real estate will widen and transaction volume will slow. Sellers anchored to 2018\u20132022 valuations will sit on assets longer. Buyers will require more structural protection."}</p>
          <div style={{ fontFamily: font, fontSize: 14, fontWeight: 700, color: T.accent, margin: "16px 0 6px" }}>If capital stays selective</div>
          <p style={{ fontFamily: font, fontSize: 15, color: T.ink, lineHeight: 1.65, marginBottom: 0 }}>{"The pattern to watch is whether new investment in Napa shifts toward asset-light formats \u2014 tasting room leases rather than estate acquisitions, management contracts rather than ownership, partnership structures with built-in exit provisions \u2014 as buyers seek exposure to the region without the fixed-cost burden of the growth era."}</p>
        </div>

        <h2 style={sectionHead}>What to Watch</h2>
        <p style={prose}>{"Several regional signals are worth tracking in the months ahead. Further hospitality retrenchment: more tasting room consolidations, hotel restaurant repositionings, longer vacancy periods in premium retail and hospitality space on the First Street corridor and in Yountville. The pace at which vacancies are backfilled \u2014 and at what price point, by what kind of operator \u2014 will indicate whether what is happening is a temporary pause or a durable reset."}</p>
        <p style={prose}>{"More split-asset transactions: additional deals in which land, brand, operations and financing move separately rather than together, using the Cain and Stanly Ranch structures as a template. Wider bid-ask spreads: sellers anchored to 2018\u20132022 valuations meeting buyers pricing in structural uncertainty. Deals that take longer, require more seller flexibility or fall through are signals worth tracking alongside deals that do close."}</p>
        <p style={prose}>{"The employment signal: Napa County food service and hospitality employment data from the California Employment Development Department will show whether what is visible in individual closure announcements is accumulating into a broader labor-market shift. Watch for slower hiring, reduced seasonal staffing and attrition that is not backfilled."}</p>

        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 48, paddingTop: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 17, color: T.ink, fontFamily: serif, marginBottom: 16 }}>Sources</h2>
          {[
            "SF Chronicle, \u201CCharlie Palmer Steak to close at Archer Hotel Napa,\u201D Apr. 1, 2026.",
            "North Bay Business Journal \u00B7 Press Democrat, \u201CCharlie Palmer Steak Napa to close after almost a decade,\u201D Apr. 1, 2026.",
            "Napa Valley Register, \u201CCharlie Palmer Steak at Archer Napa hotel to close,\u201D Apr. 1, 2026.",
            "SF Chronicle, \u201COne of California\u2019s flashiest winery owners closed 2 tasting rooms,\u201D Jan. 12, 2026.",
            "SF Chronicle, \u201CVermeil Wines closes Napa tasting room,\u201D 2026.",
            "TheStreet, \u201CVermeil Wines Closes Tasting Room \u2014 No Bankruptcy,\u201D 2026.",
            "Calistoga Tribune, \u201CCalistoga Depot announces temporary closure for restructuring,\u201D March 2026.",
            "Calistoga Tribune, \u201CJohnny\u2019s Restaurant & Bar,\u201D February 6, 2026.",
            "Napa Valley Register, \u201CStanly Ranch Napa resort sold for $195M in foreclosure,\u201D Apr. 1, 2026.",
            "Bloomberg, \u201CBlackstone Acquires Napa Valley Resort in a Foreclosure Sale,\u201D Mar. 30, 2026.",
            "SF Chronicle, \u201CNapa\u2019s Cain Vineyards & Winery sold to SF firm Third Leaf Partners,\u201D Apr. 1, 2026.",
            "The Real Deal SF, \u201CSF investment firm grabs fire-ravaged Napa Valley winery assets,\u201D Apr. 2, 2026.",
            "SF Chronicle, \u201CCalifornia wine titan Trinchero selling two Napa vineyards,\u201D Feb. 18, 2026.",
            "SF Chronicle, \u201CThis famous California sparkling winery has a new owner,\u201D Dec. 16, 2025.",
            "Wine Spectator \u00B7 Shanken News Daily, \u201CTrinchero to Acquire Mumm Napa from Pernod Ricard,\u201D Dec. 15, 2025.",
            "CBS SF \u00B7 Press Democrat, \u201CWine giant Gallo closing Napa Valley facility, laying off dozens,\u201D Feb. 2026.",
            "SF Chronicle, \u201CA major wine company is exiting California,\u201D Jun. 12, 2025.",
            "Silicon Valley Bank, U.S. Wine Industry Report 2026.",
            "Bureau of Economic Analysis, FRED series REALGDPALL06055, Napa County real GDP 2001\u20132024.",
            "Napa Valley Features, \u201CNapa Valley\u2019s M&A Surge: From Bohemia to Boardroom,\u201D December 2023.",
            "Napa Valley Features, \u201CUnder the Hood: Deepening Crisis,\u201D September 2024.",
            "Napa Valley Features, \u201CUnder the Hood: Wine Overproduction Scenarios Suggest Tougher Days Ahead,\u201D October 2025.",
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, lineHeight: 1.5 }}>{"\u2014 "}{s}</span>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: font, fontSize: 14, color: T.muted, fontStyle: "italic", marginTop: 40, marginBottom: 40 }}>
          Tim Carl is a Napa Valley-based photojournalist and the founder and editor of Napa Valley, Sonoma County and Lake County Features.
        </p>

        <PollsSection />

        <div style={{ borderTop: `2px solid ${T.border}`, paddingTop: 28, marginTop: 20 }}>
          <h3 style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: T.ink, margin: "0 0 10px" }}>Methodology</h3>
          <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7 }}>
            This article is part of the Under the Hood series, which tracks economic and structural trends in Napa Valley using primary sources, public records and data journalism. GDP data from the Bureau of Economic Analysis via FRED (REALGDPALL06055). Reporting reflects conditions as of April 2026.
          </p>
        </div>
      </article>
      <Footer />
    </div>
  );
}

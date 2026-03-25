import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Chart, registerables } from "chart.js";
import NavBar from "./NavBar";
import Footer from "./Footer";

Chart.register(...registerables);

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

const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";
const ARTICLE_SLUG = "napa-gdp-2024";

/* ── Chart data ────────────────────────────────────────────────────────────── */
const nominalGDP = [10.75,11.00,11.21,11.46,11.21,12.73,12.76,14.03,14.59];
const realGDP    = [10.81,11.00,11.05,11.00,10.45,11.46,10.97,11.22,11.31];
const gdpYears   = [2016,2017,2018,2019,2020,2021,2022,2023,2024];

const empYears  = [2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025];
const empActual = [9.0,10.0,10.8,11.2,11.8,12.3,12.9,13.0,13.5,13.9,14.3,9.0,11.3,13.5,13.9,13.9,14.1];
const empCAGR   = Math.pow(14.3/9.0, 1/10);
const empTrend  = empYears.map((yr, i) => {
  if (yr < 2019) return null;
  const yearsFrom2019 = yr - 2019;
  return +(14.3 * Math.pow(empCAGR, yearsFrom2019)).toFixed(1);
});

const scenarioPcts = [0.05, 0, -0.05, -0.10, -0.20, -0.30];
const scenarioLabels = ["+5%", "Flat", "\u22125%", "\u221210%", "\u221220%", "\u221230%"];
const JOBS = 55875, WAGES = 3824.8, TAX = 507.1, PROP = 156.0;

/* ── live poll component ───────────────────────────────────────────────────── */
function LivePoll({ poll }) {
  const [voted, setVoted]   = useState(null);
  const [counts, setCounts] = useState(poll.counts || {});
  const [total, setTotal]   = useState(poll.total || 0);
  const [loading, setLoading] = useState(false);

  const vote = async (idx) => {
    if (voted !== null || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${WORKER}/api/article-poll-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poll_id: poll.id, option_index: idx })
      });
      const data = await res.json();
      if (data.success) {
        setCounts(data.counts);
        setTotal(data.total);
        setVoted(idx);
      }
    } catch(e) { /* silent fail */ }
    setLoading(false);
  };

  const options = poll.options;

  return (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "20px 20px 16px", marginBottom: 16 }}>
      <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.1em", color: T.gold, fontWeight: 700, textTransform: "uppercase", margin: "0 0 8px 0" }}>Poll</p>
      <p style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: T.ink, margin: "0 0 14px 0", lineHeight: 1.4 }}>{poll.question}</p>

      {options.map((opt, idx) => {
        const count = counts[idx] || 0;
        const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
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

      {voted !== null && (
        <p style={{ fontFamily: font, fontSize: 12, color: T.muted, margin: "10px 0 0 0" }}>{total} {total === 1 ? "vote" : "votes"} · Results update in real time</p>
      )}
    </div>
  );
}

/* ── polls section ─────────────────────────────────────────────────────────── */
function PollsSection() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${WORKER}/api/article-polls?slug=${ARTICLE_SLUG}`)
      .then(r => r.json())
      .then(data => { setPolls(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: "24px 0", fontFamily: font, fontSize: 14, color: T.muted }}>Loading polls...</div>
  );
  if (!polls.length) return null;

  return (
    <div style={{ borderTop: `2px solid ${T.border}`, marginTop: 48, paddingTop: 32 }}>
      <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.1em", color: T.gold, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px 0" }}>Today's Polls</p>
      <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 20px 0" }}>What do you think?</h2>
      {polls.map(poll => <LivePoll key={poll.id} poll={poll} />)}
      <p style={{ fontFamily: font, fontSize: 12, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>
        Poll results are anonymous and stored on NapaServe. Results shown after you vote.
        Historical reader polls from Napa Valley Features are searchable in the{" "}
        <a href="/dashboard" style={{ color: T.accent }}>Community Pulse dashboard</a>.
      </p>
    </div>
  );
}

/* ── archive search ────────────────────────────────────────────────────────── */
function ArchiveSearch() {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`${WORKER}/api/rag-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k: 5 })
      });
      const data = await res.json();
      setResults(data.results || data || []);
    } catch(e) { setResults([]); }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === "Enter") search(); };

  return (
    <div style={{ borderTop: `2px solid ${T.border}`, marginTop: 48, paddingTop: 32 }}>
      <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.1em", color: T.gold, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px 0" }}>Archive</p>
      <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 6px 0" }}>Search North Coast Coverage</h2>
      <p style={{ fontFamily: font, fontSize: 14, color: T.muted, margin: "0 0 16px 0" }}>Search 1,000+ articles and reports from Napa Valley Features.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Search GDP, employment, wine economics, tax revenue..."
          style={{ flex: 1, padding: "10px 14px", fontFamily: font, fontSize: 14, color: T.ink, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, outline: "none" }}
        />
        <button onClick={search} disabled={loading}
          style={{ padding: "10px 20px", background: T.accent, color: "#fff", border: "none", borderRadius: 6, fontFamily: font, fontSize: 14, fontWeight: 600, cursor: loading ? "default" : "pointer" }}>
          {loading ? "..." : "Search"}
        </button>
      </div>

      {searched && !loading && results.length === 0 && (
        <p style={{ fontFamily: font, fontSize: 14, color: T.muted }}>No results found. Try different keywords.</p>
      )}

      {results.map((r, i) => (
        <div key={i} style={{ borderBottom: `1px solid ${T.border}`, padding: "14px 0" }}>
          {r.post_url ? (
            <a href={r.post_url} target="_blank" rel="noreferrer"
              style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: T.accent, textDecoration: "none", display: "block", marginBottom: 4 }}>
              {r.post_title || r.title || "Article"}
            </a>
          ) : (
            <p style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: T.ink, margin: "0 0 4px 0" }}>{r.post_title || r.title || "Article"}</p>
          )}
          <p style={{ fontFamily: font, fontSize: 13, color: T.ink, margin: "0 0 4px 0", lineHeight: 1.5 }}>{r.chunk_text || r.text || r.content || ""}</p>
          {r.post_url && (
            <a href={r.post_url} target="_blank" rel="noreferrer"
              style={{ fontFamily: font, fontSize: 12, color: T.muted }}>Read full article →</a>
          )}
        </div>
      ))}

      {results.length > 0 && (
        <a href="/archive" style={{ display: "inline-block", marginTop: 16, fontFamily: font, fontSize: 14, color: T.accent, textDecoration: "underline" }}>
          Open full archive search →
        </a>
      )}
    </div>
  );
}

/* ── Chart.js wrapper ───────────────────────────────────────────────────────── */
function ChartCanvas({ id, buildChart, deps, downloadName }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = buildChart(ctx);
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return <>
    <canvas ref={canvasRef} id={id} />
    {downloadName && <button onClick={()=>{const canvas=canvasRef.current;if(!canvas)return;const offscreen=document.createElement("canvas");offscreen.width=canvas.width;offscreen.height=canvas.height+28;const ctx=offscreen.getContext("2d");ctx.fillStyle="#FAF6F0";ctx.fillRect(0,0,offscreen.width,offscreen.height);ctx.drawImage(canvas,0,0);ctx.save();ctx.globalAlpha=0.25;ctx.font="11px 'Source Code Pro',monospace";ctx.fillStyle='#8B7355';ctx.textAlign='right';ctx.textBaseline='bottom';ctx.fillText('napaserve.org',offscreen.width-12,offscreen.height-8);ctx.restore();const link=document.createElement("a");link.download=downloadName;link.href=offscreen.toDataURL("image/png");link.click();}} style={{marginTop:"8px",padding:"4px 12px",fontSize:"11px",fontFamily:"monospace",letterSpacing:"0.08em",color:"#8B7355",background:"transparent",border:"1px solid #D4C4A8",borderRadius:"3px",cursor:"pointer",display:"block"}}>DOWNLOAD CHART PNG</button>}
  </>;
}

/* ── Contraction calculator ────────────────────────────────────────────────── */
function ContractionCalculator() {
  const [scenario, setScenario] = useState(0);
  const presets = [5, 0, -5, -10, -20, -30];
  const pct = scenario / 100;

  const jobsDelta = Math.round(JOBS * pct);
  const jobsTotal = JOBS + jobsDelta;
  const wagesDelta = +(WAGES * pct).toFixed(1);
  const wagesTotal = +(WAGES + wagesDelta).toFixed(1);
  const taxDelta = +(TAX * pct).toFixed(1);
  const taxTotal = +(TAX + taxDelta).toFixed(1);
  const propDelta = +(PROP * pct).toFixed(1);
  const propTotal = +(PROP + propDelta).toFixed(1);

  const fmtNum = (n) => n.toLocaleString();
  const fmtMoney = (n) => `$${Math.abs(n).toFixed(1)}M`;
  const signColor = (n) => n > 0 ? "#4a6741" : n < 0 ? "#8B2E2E" : T.muted;

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "28px 24px", marginBottom: 36 }}>
      <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.gold, fontWeight: 700, margin: "0 0 6px" }}>Interactive</p>
      <h3 style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 16px" }}>Wine Industry Contraction Calculator</h3>
      <p style={{ fontFamily: font, fontSize: 14, color: T.muted, margin: "0 0 20px", lineHeight: 1.5 }}>
        Adjust the slider or select a preset to see how changes in wine industry activity would affect Napa County jobs, wages and tax revenue, based on the 2022 Insel &amp; Company baseline.
      </p>

      {/* Slider */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.muted, fontFamily: font, marginBottom: 6 }}>
          <span>{"\u221235%"}</span>
          <span style={{ fontWeight: 700, color: T.ink, fontSize: 16 }}>{scenario > 0 ? "+" : ""}{scenario}%</span>
          <span>+10%</span>
        </div>
        <input type="range" min={-35} max={10} step={1} value={scenario}
          onChange={e => setScenario(Number(e.target.value))}
          style={{ width: "100%", accentColor: T.accent }} />
      </div>

      {/* Preset buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
        {presets.map(p => (
          <button key={p} onClick={() => setScenario(p)}
            style={{
              padding: "6px 14px", fontSize: 13, fontWeight: 600, fontFamily: font,
              background: scenario === p ? T.accent : T.bg,
              color: scenario === p ? T.bg : T.accent,
              border: `1px solid ${T.accent}`, borderRadius: 4, cursor: "pointer",
            }}>
            {p > 0 ? "+" : ""}{p}%
          </button>
        ))}
      </div>

      {scenario === 0 ? (
        <div style={{ background: T.bg, border: `1px solid ${T.rule}`, padding: "20px 18px", textAlign: "center" }}>
          <p style={{ fontFamily: serif, fontSize: 15, color: T.ink, margin: 0, lineHeight: 1.6 }}>
            At flat — zero percent change from the 2022 base — the county retains {fmtNum(JOBS)} wine-related jobs, ${WAGES.toFixed(1)}M in wages and ${TAX.toFixed(1)}M in annual county and local tax revenue.
          </p>
        </div>
      ) : (
        <>
          {/* Jobs card */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ background: T.bg, border: `1px solid ${T.rule}`, padding: "16px 14px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, margin: "0 0 6px", fontFamily: font }}>Jobs</p>
              <p style={{ fontSize: 12, color: T.muted, margin: "0 0 4px", fontFamily: font }}>Change from baseline</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: signColor(jobsDelta), margin: "0 0 8px", fontFamily: serif }}>
                {jobsDelta > 0 ? "+" : ""}{fmtNum(jobsDelta)} headcount
              </p>
              <p style={{ fontSize: 12, color: T.muted, margin: "0 0 4px", fontFamily: font }}>Projected headcount</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: T.ink, margin: 0, fontFamily: serif }}>{fmtNum(jobsTotal)}</p>
            </div>

            {/* Wages card */}
            <div style={{ background: T.bg, border: `1px solid ${T.rule}`, padding: "16px 14px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, margin: "0 0 6px", fontFamily: font }}>Wages</p>
              <p style={{ fontSize: 12, color: T.muted, margin: "0 0 4px", fontFamily: font }}>Change from baseline</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: signColor(wagesDelta), margin: "0 0 8px", fontFamily: serif }}>
                {wagesDelta > 0 ? "+" : wagesDelta < 0 ? "\u2212" : ""}{fmtMoney(wagesDelta)} {"\u002F"} yr
              </p>
              <p style={{ fontSize: 12, color: T.muted, margin: "0 0 4px", fontFamily: font }}>Projected annual total</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: T.ink, margin: 0, fontFamily: serif }}>${wagesTotal.toFixed(1)}M {"\u002F"} yr</p>
            </div>
          </div>

          {/* Tax table */}
          <div style={{ background: T.bg, border: `1px solid ${T.rule}`, padding: "16px 14px", marginBottom: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, margin: "0 0 10px", fontFamily: font }}>Tax Revenue</p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font, fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.rule}` }}>
                  <th style={{ textAlign: "left", padding: "6px 0", fontSize: 12, color: T.muted, fontWeight: 600 }}>Revenue Source</th>
                  <th style={{ textAlign: "right", padding: "6px 0", fontSize: 12, color: T.muted, fontWeight: 600 }}>Change {"\u002F"} yr</th>
                  <th style={{ textAlign: "right", padding: "6px 0", fontSize: 12, color: T.muted, fontWeight: 600 }}>Projected annual</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: `1px solid ${T.rule}` }}>
                  <td style={{ padding: "8px 0", color: T.ink }}>County &amp; local taxes (total)</td>
                  <td style={{ padding: "8px 0", textAlign: "right", color: signColor(taxDelta), fontWeight: 600 }}>
                    {taxDelta > 0 ? "+" : taxDelta < 0 ? "\u2212" : ""}{fmtMoney(taxDelta)} {"\u002F"} yr
                  </td>
                  <td style={{ padding: "8px 0", textAlign: "right", color: T.ink, fontWeight: 600 }}>${taxTotal.toFixed(1)}M {"\u002F"} yr</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", color: T.ink }}>Property tax component †</td>
                  <td style={{ padding: "8px 0", textAlign: "right", color: signColor(propDelta), fontWeight: 600 }}>
                    {propDelta > 0 ? "+" : propDelta < 0 ? "\u2212" : ""}{fmtMoney(propDelta)} {"\u002F"} yr
                  </td>
                  <td style={{ padding: "8px 0", textAlign: "right", color: T.ink, fontWeight: 600 }}>${propTotal.toFixed(1)}M {"\u002F"} yr</td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontSize: 12, color: T.muted, margin: "12px 0 0", lineHeight: 1.5, fontStyle: "italic" }}>
              † Property tax adjusts more slowly than employment. Proposition 13 limits reassessments to ownership transfers and new construction — assessed values do not automatically decline when industry activity contracts. Near-term impact is likely smaller than this proportional estimate.
            </p>
          </div>

          <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, fontFamily: font, margin: "8px 0 0" }}>
            Methodology: scenarios apply proportional scaling to the 2022 Insel &amp; Company baseline for Napa Valley Vintners. Jobs are reported as headcount (no {"\u002F"}yr). Wages and tax figures are annualized ({"\u002F"}yr). Property tax is a component of total county and local taxes.
          </p>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════════════ */
export default function UnderTheHoodGDP() {

  /* ── Gap shading plugin for Chart 1 ──────────────────────────────────────── */
  const gdpGapPlugin = {
    id: "gdpGapShading",
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const nomMeta = chart.getDatasetMeta(0);
      const realMeta = chart.getDatasetMeta(1);
      if (!nomMeta.data.length || !realMeta.data.length) return;
      ctx.save();
      ctx.beginPath();
      // trace nominal forward
      nomMeta.data.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      // trace real backward
      for (let i = realMeta.data.length - 1; i >= 0; i--) {
        ctx.lineTo(realMeta.data[i].x, realMeta.data[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(196,160,80,0.22)";
      ctx.fill();
      ctx.restore();
    }
  };

  /* ── Gap shading plugin for Chart 2 ──────────────────────────────────────── */
  const empGapPlugin = {
    id: "empGapShading",
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const actualMeta = chart.getDatasetMeta(0);
      const trendMeta = chart.getDatasetMeta(1);
      if (!actualMeta.data.length || !trendMeta.data.length) return;
      ctx.save();
      ctx.beginPath();
      // find the index where trend starts (2019 = index 10)
      const startIdx = empYears.indexOf(2019);
      if (startIdx < 0) { ctx.restore(); return; }
      // trace trend forward from 2019
      let started = false;
      for (let i = startIdx; i < trendMeta.data.length; i++) {
        const pt = trendMeta.data[i];
        if (pt.skip) continue;
        if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
        else ctx.lineTo(pt.x, pt.y);
      }
      // trace actual backward from end to 2019
      for (let i = actualMeta.data.length - 1; i >= startIdx; i--) {
        ctx.lineTo(actualMeta.data[i].x, actualMeta.data[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(139,46,46,0.10)";
      ctx.fill();
      ctx.restore();
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: font, color: T.ink }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <NavBar />

      {/* Masthead */}
      <div style={{ background: "#2C1810", color: "#F5F0E8", textAlign: "center", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", padding: "10px 24px" }}>
        Napa Valley Features &nbsp;·&nbsp; Under the Hood &nbsp;·&nbsp; March 2026
      </div>

      <article id="main-content" style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px 60px" }}>
        {/* Eyebrow */}
        <div style={{ fontFamily: "monospace", fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C4A050", marginTop: 32, marginBottom: 16 }}>
          Under the Hood &nbsp;·&nbsp; Napa Valley Features
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily: serif, fontWeight: 700, fontSize: "clamp(26px, 5vw, 42px)", color: "#2C1810", lineHeight: 1.15, marginBottom: 20 }}>
          {"Napa\u2019s Economy Looks Bigger Than It Is"}
        </h1>

        {/* Deck */}
        <p style={{ fontFamily: font, fontWeight: 300, fontSize: 17, lineHeight: 1.65, color: "#5C4033", marginBottom: 24 }}>
          Nominal GDP rose 35.8% since 2016. Real GDP grew 4.6%. Of the apparent $3.84 billion in growth, 87% was inflation — and the jobs engine has stalled.
        </p>

        {/* Byline */}
        <div style={{ borderTop: "1px solid #D4C4A8", paddingTop: 14 }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8B7355" }}>
            By Tim Carl &nbsp;·&nbsp; Napa Valley Features &nbsp;·&nbsp; March 2026
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em", color: "#8B7355", fontStyle: "italic", marginTop: 4 }}>
            Bureau of Economic Analysis · Bureau of Labor Statistics · Insel &amp; Company for Napa Valley Vintners
          </div>
          <a href="https://napavalleyfocus.substack.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily: font, fontSize: 14, fontWeight: 400, color: T.accent, textDecoration: "none", textTransform: "none", letterSpacing: "normal", display: "inline-block", marginTop: 12, marginBottom: 40 }}>
            Read on Napa Valley Features · Substack →
          </a>
        </div>

        {/* ── Article text: intro ──────────────────────────────────── */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
            NAPA, Calif. — The number most often cited to describe Napa County's economy is its <a href="https://fred.stlouisfed.org/series/GDPALL06055" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>gross domestic product</a>: $14.59 billion in 2024, up from $10.75 billion in 2016. That is a 35.8% increase over eight years, a figure that implies a valley growing steadily richer. Adjusted for inflation, the same economy grew 4.6%. Of the apparent $3.84 billion in GDP growth since 2016, roughly 87 cents of every dollar was inflation. Real output — the actual volume of goods and services produced — barely moved.
          </p>
          <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
            That gap is not a statistical footnote. It is the economy's most important single data point, and it reshapes how every other indicator in this column should be read.
          </p>
        </div>

        {/* ── The GDP Gap ─────────────────────────────────────────── */}
        <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "40px 0 16px", lineHeight: 1.3 }}>The GDP Gap</h2>
        <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
          When nominal GDP and real GDP move together, an economy is genuinely expanding. When they diverge, price increases are doing the work that output growth cannot. In Napa County, the two measures were essentially identical through 2016 — the implicit price deflator, which measures how much more expensive the local economy has become relative to the 2017 baseline, sat at 99.4. By 2021, it reached 111.1. By 2024 it stood at 129.0, meaning that prices across the county's economic base are 29% higher than they were seven years ago.
        </p>
        <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 24px" }}>
          Real GDP peaked in 2021 at $11.46 billion — the post-COVID rebound year — and has declined slightly since, sitting at $11.31 billion in 2024, still $140 million below that peak. The economy the headline number describes does not exist in real terms.
        </p>

        {/* ── Chart 1: Nominal vs Real GDP ─────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.gold, margin: "0 0 6px" }}>Chart 1</p>
          <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "0 0 16px", lineHeight: 1.3 }}>Nominal vs. Real GDP — Napa County, 2016–2024</h2>
          <div style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
            <ChartCanvas id="chart-gdp" downloadName="chart-1_nominal-vs-real-gdp_nvf_2024.png" deps={[]} buildChart={(ctx) => {
              return new Chart(ctx, {
                type: "line",
                data: {
                  labels: gdpYears.map(String),
                  datasets: [
                    {
                      label: "Nominal GDP",
                      data: nominalGDP,
                      borderColor: "#2c5f8a",
                      backgroundColor: "#2c5f8a",
                      borderWidth: 2.5,
                      tension: 0.3,
                      pointRadius: 4,
                      pointBackgroundColor: "#2c5f8a",
                      fill: false,
                    },
                    {
                      label: "Real GDP (chained 2017$)",
                      data: realGDP,
                      borderColor: "#4a6741",
                      backgroundColor: "#4a6741",
                      borderWidth: 2.5,
                      tension: 0.3,
                      pointRadius: 4,
                      pointBackgroundColor: "#4a6741",
                      fill: false,
                    },
                  ],
                },
                options: {
                  responsive: true,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        afterBody(items) {
                          if (items.length < 2) return "";
                          const nom = items.find(i => i.datasetIndex === 0);
                          const real = items.find(i => i.datasetIndex === 1);
                          if (nom && real) {
                            const gap = (nom.parsed.y - real.parsed.y).toFixed(2);
                            return `Inflation gap: $${gap}B`;
                          }
                          return "";
                        }
                      }
                    },
                  },
                  scales: {
                    y: {
                      min: 9.5,
                      ticks: { callback: v => `$${v.toFixed(1)}B` },
                    },
                  },
                },
                plugins: [gdpGapPlugin],
              });
            }} />
          </div>
          <p style={{ fontSize: 12, color: T.muted, margin: "10px 0 0", lineHeight: 1.5 }}>Source: Bureau of Economic Analysis via FRED — <a href="https://fred.stlouisfed.org/series/GDPALL06055" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>GDPALL06055</a> (nominal), <a href="https://fred.stlouisfed.org/series/REALGDPALL06055" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>REALGDPALL06055</a> (real, chained 2017 dollars).</p>
        </div>

        {/* ── Stat boxes ─────────────────────────────────────────── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px",
          background: T.rule, border: `1px solid ${T.rule}`, margin: "40px 0",
        }}>
          <div style={{ background: "#FAF8F5", padding: "20px 16px", textAlign: "center" }}>
            <span style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: T.accent, lineHeight: 1, marginBottom: 6, display: "block" }}>35.8%</span>
            <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: T.muted, lineHeight: 1.4, display: "block" }}>Nominal GDP<br />growth 2016–2024</span>
          </div>
          <div style={{ background: "#FAF8F5", padding: "20px 16px", textAlign: "center" }}>
            <span style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: T.accent, lineHeight: 1, marginBottom: 6, display: "block" }}>4.6%</span>
            <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: T.muted, lineHeight: 1.4, display: "block" }}>Real GDP<br />growth 2016–2024</span>
          </div>
          <div style={{ background: "#FAF8F5", padding: "20px 16px", textAlign: "center" }}>
            <span style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: T.accent, lineHeight: 1, marginBottom: 6, display: "block" }}>87%</span>
            <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: T.muted, lineHeight: 1.4, display: "block" }}>of apparent growth<br />was inflation</span>
          </div>
        </div>

        <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
          This pattern tracks closely with what this column described in <a href="https://napavalleyfocus.substack.com/p/under-the-hood-two-reports-one-warning" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>"Under the Hood: Two Reports, One Warning — The Collapse That Looks Like Premiumization"</a> (January 2026) at the product level. There, rising average bottle prices masked falling shipment volumes, creating the appearance of a resilient market. Here, rising price levels across the county's entire economic base create the appearance of a growing economy. The mechanism is the same: inflation does the arithmetic while real activity stagnates.
        </p>

        {/* ── The Wine Industry as Structural Load-Bearer ─────────── */}
        <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "40px 0 16px", lineHeight: 1.3 }}>The Wine Industry as Structural Load-Bearer</h2>
        <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
          Understanding what is at stake requires understanding how deeply the wine industry is embedded in everything that funds and employs Napa County.
        </p>
        <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
          The most comprehensive recent assessment is the <a href="https://napavintners.com/downloads/ECONOMIC-IMPACT-REPORT-NVV-2022.pdf" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Insel &amp; Company economic impact study</a> commissioned by Napa Valley Vintners, published in May 2025 using 2022 data. Its findings establish the structural baseline. The wine and grape industry accounted for 55,875 full-time equivalent jobs in Napa County in 2022 — 72% of the county's total employment of 77,788. It generated $3.82 billion in wages, representing 73.7% of all labor compensation received in the county. It produced $507 million in county and local tax revenue, including $156 million in property taxes — 27% of all property tax collected countywide.
        </p>
        <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
          The county does not have a wine industry alongside other industries. Wine is the industry, and the other sectors — hospitality, retail, professional services, logistics — are in large part its downstream expression.
        </p>
        <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
          This concentration is not new, but its implications have changed. When wine demand was expanding, the concentration was an asset: a single rising tide lifted employment, wages and tax revenues together. As wine demand contracts, the same concentration becomes a transmission mechanism for the opposite effect. There is no sector large enough to offset the wine industry if it shrinks.
        </p>

        {/* ── Stat boxes: wine industry ─────────────────────────── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px",
          background: T.rule, border: `1px solid ${T.rule}`, margin: "40px 0",
        }}>
          <div style={{ background: "#FAF8F5", padding: "20px 16px", textAlign: "center" }}>
            <span style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: T.accent, lineHeight: 1, marginBottom: 6, display: "block" }}>72%</span>
            <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: T.muted, lineHeight: 1.4, display: "block" }}>of county jobs<br />in wine industry</span>
          </div>
          <div style={{ background: "#FAF8F5", padding: "20px 16px", textAlign: "center" }}>
            <span style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: T.accent, lineHeight: 1, marginBottom: 6, display: "block" }}>$3.82B</span>
            <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: T.muted, lineHeight: 1.4, display: "block" }}>in wine-related<br />wages (2022)</span>
          </div>
          <div style={{ background: "#FAF8F5", padding: "20px 16px", textAlign: "center" }}>
            <span style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: T.accent, lineHeight: 1, marginBottom: 6, display: "block" }}>$507M</span>
            <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: T.muted, lineHeight: 1.4, display: "block" }}>county &amp; local<br />tax revenue</span>
          </div>
        </div>

        {/* ── The Jobs Engine ─────────────────────────────────────── */}
        <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "40px 0 16px", lineHeight: 1.3 }}>The Jobs Engine</h2>
        <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
          <a href="https://fred.stlouisfed.org/series/NAPA906LEIHN" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Employment data from the Bureau of Labor Statistics</a> tracks leisure and hospitality employment in Napa County back to 1990. The trajectory through 2019 told a clear story of growth. From the post-financial crisis trough in 2009 — when the sector employed about 9,000 workers — employment climbed steadily to a peak of 14,300 in June 2019, adding roughly 5,300 jobs over a decade. That pace, sustained over ten years, implied a sector still expanding to meet rising demand.
        </p>
        <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 24px" }}>
          Since June 2019, net change in leisure and hospitality employment: approximately {"\u2212"}200 jobs. Six years of essentially zero net growth, against a backdrop of nominal GDP that rose 27% over the same period.
        </p>

        {/* ── Chart 2: L&H Employment ─────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.gold, margin: "0 0 6px" }}>Chart 2</p>
          <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "0 0 16px", lineHeight: 1.3 }}>Leisure &amp; Hospitality Employment — Napa County, 2009–2025</h2>
          <div style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
            <ChartCanvas id="chart-employment" downloadName="chart-2_lh-employment-trend_nvf_2025.png" deps={[]} buildChart={(ctx) => {
              return new Chart(ctx, {
                type: "line",
                data: {
                  labels: empYears.map(String),
                  datasets: [
                    {
                      label: "Actual Employment",
                      data: empActual,
                      borderColor: "#2c5f8a",
                      backgroundColor: "#2c5f8a",
                      borderWidth: 2.5,
                      tension: 0.3,
                      pointRadius: empYears.map(yr => (yr === 2019 || yr === 2025) ? 6 : 3),
                      pointBackgroundColor: "#2c5f8a",
                      fill: false,
                    },
                    {
                      label: "2009–2019 Trend Projection",
                      data: empTrend,
                      borderColor: "#b07d52",
                      backgroundColor: "#b07d52",
                      borderWidth: 2,
                      borderDash: [6, 4],
                      tension: 0.3,
                      pointRadius: empYears.map((yr, i) => empTrend[i] === null ? 0 : (yr === 2019 || yr === 2025) ? 6 : 3),
                      pointBackgroundColor: "#b07d52",
                      fill: false,
                      spanGaps: true,
                    },
                  ],
                },
                options: {
                  responsive: true,
                  scales: {
                    y: {
                      min: 7,
                      ticks: { callback: v => `${v.toFixed(0)}k` },
                    },
                  },
                },
                plugins: [empGapPlugin],
              });
            }} />
          </div>
          <p style={{ fontSize: 12, color: T.muted, margin: "10px 0 0", lineHeight: 1.5 }}>Source: Bureau of Labor Statistics, Leisure and Hospitality Employment, Napa MSA (<a href="https://fred.stlouisfed.org/series/NAPA906LEIHN" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>NAPA906LEIHN</a>).</p>
        </div>

        <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
          The projection from the prior decade's growth rate makes the break visible. If the 2009–2019 trend had continued, leisure and hospitality employment in Napa County would stand near 18,900 today. It stands at 14,100. The gap — roughly 4,800 jobs relative to prior trend — is not a temporary shortfall waiting to be recovered. It reflects a structural break in the relationship between economic activity and employment that this column first documented in <a href="https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-have-equaled" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>"Under the Hood: More Rooms Have Equaled Fewer Jobs in Napa County"</a> (August 2025). More rooms were built, more nominal dollars flowed through the economy, and the jobs engine stalled anyway.
        </p>

        {/* ── The Inflation Squeeze ───────────────────────────────── */}
        <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "40px 0 16px", lineHeight: 1.3 }}>The Inflation Squeeze</h2>
        <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
          The 29% rise in Napa's price deflator since 2017 has a direct human translation. A worker earning the county's 2022 average wage of $67,518 needs roughly $87,000 today to maintain equivalent purchasing power. Leisure and hospitality workers, whose average compensation sits well below the county average, face a sharper squeeze. Their wages must grow faster simply to stay in place, in a sector that has produced no net new employment in six years.
        </p>
        <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
          This is the other face of the GDP gap. From the county's perspective, nominal revenues and tax collections look stable or rising. From a worker's perspective, real purchasing power is eroding and the job market in the sectors most accessible to non-specialist workers has not expanded. Both things are true simultaneously, and neither cancels the other.
        </p>

        {/* ── Pull quote ─────────────────────────────────────────── */}
        <div style={{ borderLeft: `3px solid ${T.accent}`, padding: "4px 0 4px 24px", margin: "36px 0" }}>
          <p style={{ fontFamily: serif, fontSize: 20, fontStyle: "italic", lineHeight: 1.5, color: T.ink, marginBottom: 8 }}>
            "Of the apparent $3.84 billion in GDP growth since 2016, roughly 87 cents of every dollar was inflation."
          </p>
        </div>

        {/* ── What Contraction Does to the County ─────────────────── */}
        <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "40px 0 16px", lineHeight: 1.3 }}>What Contraction Does to the County</h2>
        <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
          The scenarios below apply percentage changes to the 2022 wine industry baseline from the Insel &amp; Company study. They are illustrative, not forecasts. They show the order of magnitude at stake depending on how the industry's structural adjustment unfolds.
        </p>
        <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
          A 10% contraction removes approximately 5,600 jobs, $382 million in wages and $51 million in annual county tax revenue, including roughly $16 million in property tax. A 20% contraction removes about 11,200 jobs, $765 million in wages and $101 million in local taxes. At 30%, the losses reach 16,800 jobs, $1.15 billion in wages and $152 million in annual local tax revenue — approaching 30% of the county's total local tax collections.
        </p>

        {/* ── Chart 3: Contraction scenarios ──────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.gold, margin: "0 0 6px" }}>Chart 3</p>
          <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "0 0 16px", lineHeight: 1.3 }}>Contraction Scenarios — Jobs and Tax Revenue</h2>
          <div style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
            <ChartCanvas id="chart-scenarios" downloadName="chart-3_contraction-scenarios_nvf_2026.png" deps={[]} buildChart={(ctx) => {
              const jobsData = scenarioPcts.map(p => +(JOBS * p / 1000).toFixed(1));
              const taxData  = scenarioPcts.map(p => +(TAX * p).toFixed(0));

              return new Chart(ctx, {
                type: "bar",
                data: {
                  labels: scenarioLabels,
                  datasets: [
                    {
                      label: "Jobs (thousands)",
                      data: jobsData,
                      backgroundColor: jobsData.map(v => v > 0 ? "rgba(74,103,65,0.85)" : v < 0 ? "rgba(139,46,46,0.85)" : "rgba(139,115,85,0.85)"),
                      borderRadius: 3,
                      yAxisID: "y",
                    },
                    {
                      label: "County Taxes ($M)",
                      data: taxData,
                      backgroundColor: "rgba(44,95,138,0.75)",
                      borderRadius: 3,
                      yAxisID: "y1",
                    },
                  ],
                },
                options: {
                  responsive: true,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        afterBody(items) {
                          const idx = items[0]?.dataIndex;
                          if (idx === undefined) return "";
                          const p = scenarioPcts[idx];
                          const jobs = +(JOBS * p / 1000).toFixed(1);
                          const tax = +(TAX * p).toFixed(0);
                          const wages = +(WAGES * p).toFixed(0);
                          return `Jobs: ${jobs > 0 ? "+" : ""}${jobs}k\nTax: ${tax > 0 ? "+" : ""}$${tax}M\nWages: ${wages > 0 ? "+" : ""}$${wages}M/yr`;
                        }
                      }
                    },
                  },
                  scales: {
                    y: {
                      type: "linear",
                      position: "left",
                      title: { display: true, text: "Jobs (thousands)" },
                    },
                    y1: {
                      type: "linear",
                      position: "right",
                      title: { display: true, text: "County Taxes ($M)" },
                      grid: { drawOnChartArea: false },
                    },
                  },
                },
              });
            }} />
          </div>
          <p style={{ fontSize: 12, color: T.muted, margin: "10px 0 0", lineHeight: 1.5 }}>Source: Insel &amp; Company for Napa Valley Vintners, May 2025 (2022 data).</p>
        </div>

        {/* ── Interactive Calculator ──────────────────────────────── */}
        <ContractionCalculator />

        <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
          Property tax warrants separate attention. Wine-related properties generated $156 million in property tax in 2022 — 27% of all county property tax. Seven of the ten largest property taxpayers in the county that year were wine or vineyard properties that had recently changed ownership or undergone significant construction. As established in <Link to="/under-the-hood/napa-cab-2025" style={{ color: T.accent }}>"Under the Hood: 2025 Napa Grape Prices Slip After a Record High"</Link> (March 2026), vineyard valuations built on the historical price-appreciation curve are now under pressure. Sales of premium vineyards at lower prices — or delays in ownership transfers that would trigger Proposition 13 reassessments — directly compress a revenue stream the county has long counted on.
        </p>

        {/* ── The Broader Picture ─────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "40px 0 32px" }}>
          <div style={{ flex: 1, height: 1, background: T.rule }} />
          <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: T.muted, whiteSpace: "nowrap" }}>The Broader Picture</span>
          <div style={{ flex: 1, height: 1, background: T.rule }} />
        </div>

        <div style={{ marginBottom: 36 }}>
          <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
            Three data series, read together, describe the same underlying condition.
          </p>
          <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
            Nominal GDP says Napa's economy grew 35.8% since 2016. Real GDP says it grew 4.6%. Leisure and hospitality employment says it grew essentially zero percent since 2019, despite the nominal expansion. All three are accurate. Together they describe an economy running hard on price increases while real productive capacity barely moves and the workforce most exposed to structural risk — hospitality workers, service employees, vineyard and cellar labor — absorbs a 29% increase in the cost of living against a labor market that has not created meaningful new employment in half a decade.
          </p>
          <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
            The wine industry's contraction scenarios are not projections of crisis. They are a measure of how much margin the county's economic and fiscal structure has to absorb adjustment before the effects move from the balance sheets of large producers to the tax receipts, payrolls and service budgets that fund the county itself.
          </p>
        </div>

        {/* ── What the Data Don't Show ────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "40px 0 32px" }}>
          <div style={{ flex: 1, height: 1, background: T.rule }} />
          <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: T.muted, whiteSpace: "nowrap" }}>{"What the Data Don\u2019t Show"}</span>
          <div style={{ flex: 1, height: 1, background: T.rule }} />
        </div>

        <div style={{ marginBottom: 36 }}>
          <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
            These scenarios cannot capture the timing or pace of adjustment, which matters as much as the magnitude. A 10% contraction spread over five years produces different fiscal and employment effects than the same contraction compressed into 18 months. They also cannot capture the distribution of impact across winery size, business model and employment type. The Insel &amp; Company study documents that the industry is not a single entity — it spans 1,521 operating wineries, dozens of independent vineyard managers, thousands of tourism-dependent small businesses and a supply chain that reaches from oak barrel importers to glass manufacturers. How contraction moves through that network will not be uniform.
          </p>
          <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
            What the data do show is the structural precondition: an economy whose nominal size substantially exceeds its real output, whose primary industry is under multi-year demand pressure, whose jobs engine has stalled and whose tax base is built on the valuations and activity levels of that same industry.
          </p>
          <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
            The question Napa's planners, policymakers, community members and civic leaders face is not whether adjustment is coming. The prior installments in this series — from the <a href="https://napavalleyfocus.substack.com/p/under-the-hood-the-dismal-math-of" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>unharvested acres analysis</a> in November 2025 to the <Link to="/under-the-hood/napa-cab-2025" style={{ color: T.accent }}>grape price trajectory</Link> in March 2026 to the capacity and capital contraction documented last week — establish that it is already underway. The question is how much of that adjustment is legible in the data that drive planning decisions, and how much is still hidden inside a nominal GDP figure that tells a story the real economy stopped living eight years ago.
          </p>
        </div>

        {/* ── Related Coverage ────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "40px 0 32px" }}>
          <div style={{ flex: 1, height: 1, background: T.rule }} />
          <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: T.muted, whiteSpace: "nowrap" }}>Related Coverage</span>
          <div style={{ flex: 1, height: 1, background: T.rule }} />
        </div>

        <div style={{ marginBottom: 36 }}>
          <div style={{ marginBottom: 12 }}>
            <a href="/under-the-hood/napa-cab-2025" style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: T.accent, textDecoration: "none", lineHeight: 1.4 }}>
              "2025 Napa Grape Prices Slip After a Record High"
            </a>
            <span style={{ fontSize: 14, color: T.muted }}> — Napa Valley Features</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <a href="https://napavalleyfocus.substack.com/p/under-the-hood-two-reports-one-warning" target="_blank" rel="noopener noreferrer" style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: T.accent, textDecoration: "none", lineHeight: 1.4 }}>
              "Under the Hood: Two Reports, One Warning"
            </a>
            <span style={{ fontSize: 14, color: T.muted }}> — Napa Valley Features · Substack</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <a href="https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-have-equaled" target="_blank" rel="noopener noreferrer" style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: T.accent, textDecoration: "none", lineHeight: 1.4 }}>
              "Under the Hood: More Rooms Have Equaled Fewer Jobs"
            </a>
            <span style={{ fontSize: 14, color: T.muted }}> — Napa Valley Features · Substack</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <a href="https://napavalleyfocus.substack.com/p/under-the-hood-the-dismal-math-of" target="_blank" rel="noopener noreferrer" style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: T.accent, textDecoration: "none", lineHeight: 1.4 }}>
              "Under the Hood: The Dismal Math of Napa's Unharvested Acres"
            </a>
            <span style={{ fontSize: 14, color: T.muted }}> — Napa Valley Features · Substack</span>
          </div>
        </div>

        {/* ── Archive Search ───────────────────────────────────────── */}
        <ArchiveSearch />

        {/* ── Sources ─────────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 48, paddingTop: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 17, color: T.ink, fontFamily: serif, marginBottom: 16 }}>Sources</h2>
          {[
            { label: "Bureau of Economic Analysis via FRED. \"Gross Domestic Product: All Industries in Napa County, CA (GDPALL06055).\" Updated February 5, 2026.", url: "https://fred.stlouisfed.org/series/GDPALL06055" },
            { label: "Bureau of Economic Analysis via FRED. \"Real Gross Domestic Product: All Industries in Napa County, CA (REALGDPALL06055).\"", url: "https://fred.stlouisfed.org/series/REALGDPALL06055" },
            { label: "Bureau of Labor Statistics. \"Leisure and Hospitality Employment, Napa MSA (NAPA906LEIHN).\"", url: "https://fred.stlouisfed.org/series/NAPA906LEIHN" },
            { label: "Insel, Richard. \"The Economic Impact of Napa County's Wine and Grape Industry on the Economies of Napa County, California and the US.\" Napa Valley Vintners, May 2025.", url: "https://napavintners.com/downloads/ECONOMIC-IMPACT-REPORT-NVV-2022.pdf" },
          ].map(s => (
            <div key={s.label} style={{ marginBottom: 10 }}>
              <a href={s.url} target="_blank" rel="noreferrer"
                style={{ fontFamily: font, fontSize: 14, color: T.accent, textDecoration: "underline", lineHeight: 1.5 }}>
                {s.label}
              </a>
            </div>
          ))}
        </div>

        {/* ── Author note ─────────────────────────────────────────── */}
        <div style={{ marginTop: 32, padding: "20px 0", borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontFamily: font, fontSize: 14, color: T.muted, fontStyle: "italic", margin: 0 }}>
            Tim Carl is a Napa Valley-based photojournalist and the founder and editor of Napa Valley Features. Data sourced from the Bureau of Economic Analysis, Bureau of Labor Statistics and Insel &amp; Company.
          </p>
        </div>

        {/* ── Polls ─────────────────────────────────────────────── */}
        <PollsSection />

        {/* ── Methodology ───────────────────────────────────────── */}
        <div style={{ borderTop: `2px solid ${T.border}`, paddingTop: 28, marginTop: 20 }}>
          <h3 style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: T.ink, margin: "0 0 10px" }}>Methodology</h3>
          <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7 }}>
            GDP data is sourced from the Bureau of Economic Analysis via the Federal Reserve Economic Data (FRED) database. Nominal GDP uses series <a href="https://fred.stlouisfed.org/series/GDPALL06055" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>GDPALL06055</a>; real GDP uses series <a href="https://fred.stlouisfed.org/series/REALGDPALL06055" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>REALGDPALL06055</a>, reported in chained 2017 dollars. The implicit price deflator is calculated as the ratio of nominal to real GDP, indexed to 2017 = 100.
          </p>
          <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, marginTop: 10 }}>
            Employment data is sourced from the Bureau of Labor Statistics, series <a href="https://fred.stlouisfed.org/series/NAPA906LEIHN" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>NAPA906LEIHN</a> (Leisure and Hospitality Employment, Napa MSA). The 2009–2019 trend projection uses the compound annual growth rate (CAGR) of actual employment over that period, applied forward from the 2019 level.
          </p>
          <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, marginTop: 10 }}>
            Wine industry economic impact data is from "The Economic Impact of Napa County's Wine and Grape Industry," prepared by Insel &amp; Company for Napa Valley Vintners, published May 2025, using 2022 data. Contraction scenarios apply proportional scaling to the 2022 baseline and are illustrative, not forecasts. Property tax estimates are proportional and do not account for Proposition 13 reassessment limitations.
          </p>
        </div>
      </article>
      <Footer />
    </div>
  );
}

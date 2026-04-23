// UNDER THE HOOD — Napa Constellation (Where Is Napa in the Five Stages of Grief?)
// ---------------------------------------------------------------
// Created from under-the-hood-template.jsx. Do not edit the template.
// ---------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Chart, registerables } from "chart.js";
import NavBar from "./NavBar";
import Footer from "./Footer";
import useDraftGate from "./hooks/useDraftGate";
import DraftBanner from "./components/DraftBanner";

/* Insel & Company 2022 baseline (Napa wine economy) */
const JOBS  = 55875;          // headcount
const WAGES = 3820;           // $M annual
const TAX   = 507;            // $M annual
const PROP  = 156;            // $M annual (property tax component of TAX)
const WINE_REVENUE = 4440;    // $M total winery revenue 2022

/* NVF illustrative tier revenue weight defaults */
const WEIGHT_S_DEFAULT = 0.30;  // small (<10K cases)
const WEIGHT_M_DEFAULT = 0.55;  // mid (10K-100K cases)
const WEIGHT_L_DEFAULT = 0.15;  // large (>100K cases)

Chart.register(...registerables);

const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";

// ── COUNTY + PUBLICATION ───────────────────────────────────────────
const COUNTY_PREFIX = "napa";
const PUBLICATION = "Napa Valley Features";
const SUBSTACK_URL = "https://napavalleyfocus.substack.com/";
const DATELINE_LOCATION = "NAPA VALLEY, Calif.";

// ── ARTICLE METADATA ───────────────────────────────────────────────
const ARTICLE_SLUG = "napa-constellation-2026";
const ARTICLE_DATE = "April 21, 2026";
const ARTICLE_MONTH_YEAR = "April 2026";
const SHOW_DECK = true;

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
  marginTop: 36,
  marginBottom: 12,
};

// ── POLLS ──────────────────────────────────────────────────────────
const POLLS = [
  {
    slug: "napa-constellation-2026-p1",
    question: "Which signal most clearly marks the pivot from marketing to defense?",
    options: [
      "Constellation's Q4 collapse",
      "Hall's 100–170 estimate",
      "The Ninth Circuit revival",
      "The four-group petition",
      "Mondavi's reopening",
    ],
  },
  {
    slug: "napa-constellation-2026-p2",
    question: "Where is the valley in the stages of the correction?",
    options: [
      "Still in denial",
      "Anger and bargaining",
      "Entering depression",
      "Beginning acceptance",
      "The framework doesn't fit",
    ],
  },
  {
    slug: "napa-constellation-2026-p3",
    question: "How will the Board of Supervisors respond to the petition?",
    options: [
      "Hold the line on ag preserve",
      "Adopt most reforms",
      "Split the difference",
      "Defer past June",
      "Too early to call",
    ],
  },
];

// ── DOWNLOAD HELPER ────────────────────────────────────────────────
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

// ── CHARTCANVAS COMPONENT ──────────────────────────────────────────
function ChartCanvas({ id, title, buildChart, deps = [], downloadName, legend }) {
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
        {legend}
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
        Historical reader polls from Napa Valley Features are searchable in the{" "}
        <a href="/dashboard" style={{ color: T.accent }}>Community Pulse dashboard</a>.
      </p>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────
export default function UnderTheHoodNapaConstellation() {
  const navigate = useNavigate();
  const status = useDraftGate(ARTICLE_SLUG);
  const isDraft = status === "draft";

  // Tier calculator state — defaults match Hall High scenario in Chart 3.
  const [weightS, setWeightS] = useState(30);
  const [weightM, setWeightM] = useState(55);
  const [weightL, setWeightL] = useState(15);
  const [contractS, setContractS] = useState(40);
  const [contractM, setContractM] = useState(20);
  const [contractL, setContractL] = useState(10);
  const [passThrough, setPassThrough] = useState(70);
  const [activeScenario, setActiveScenario] = useState("hallHigh");

  // Weights always sum to 100. Moving one slider redistributes the remainder across
  // the other two, preserving their current ratio.
  function rebalanceWeights(which, newValue) {
    const v = Math.max(0, Math.min(100, Math.round(newValue)));
    const remaining = 100 - v;
    let a, b, setA, setB;
    if (which === "S") { a = weightM; b = weightL; setA = setWeightM; setB = setWeightL; setWeightS(v); }
    else if (which === "M") { a = weightS; b = weightL; setA = setWeightS; setB = setWeightL; setWeightM(v); }
    else { a = weightS; b = weightM; setA = setWeightS; setB = setWeightM; setWeightL(v); }
    const otherSum = a + b;
    if (otherSum === 0) {
      const half = Math.round(remaining / 2);
      setA(half);
      setB(remaining - half);
    } else {
      const newA = Math.round((a / otherSum) * remaining);
      setA(newA);
      setB(remaining - newA);
    }
    setActiveScenario("custom");
  }

  function resetToHallLow() {
    setWeightS(30); setWeightM(55); setWeightL(15);
    setContractS(25); setContractM(10); setContractL(5);
    setPassThrough(70);
    setActiveScenario("hallLow");
  }
  function resetToHallHigh() {
    setWeightS(30); setWeightM(55); setWeightL(15);
    setContractS(40); setContractM(20); setContractL(10);
    setPassThrough(70);
    setActiveScenario("hallHigh");
  }
  function resetToBeyondHall() {
    setWeightS(30); setWeightM(55); setWeightL(15);
    setContractS(55); setContractM(30); setContractL(15);
    setPassThrough(70);
    setActiveScenario("beyondHall");
  }

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

  // Derived values for the live tier calculator output.
  // Sliders store positive 0-100 (post-4a.5); these formulas produce positive magnitudes.
  const wineryContraction = (contractS * weightS + contractM * weightM + contractL * weightL) / 10000;
  const economyImpact = wineryContraction * (passThrough / 100);
  const jobsLost = Math.round(economyImpact * JOBS);
  const wagesLost = Math.round(economyImpact * WAGES);
  const taxLost = Math.round(economyImpact * TAX);
  const propLost = Math.round(economyImpact * PROP);
  const sContrib = (contractS * weightS / 10000) * (passThrough / 100) * 100;
  const mContrib = (contractM * weightM / 10000) * (passThrough / 100) * 100;
  const lContrib = (contractL * weightL / 10000) * (passThrough / 100) * 100;
  const combinedPct = economyImpact * 100;

  const isDefault = (
    weightS === 30 && weightM === 55 && weightL === 15 &&
    contractS === 40 && contractM === 20 && contractL === 10 &&
    passThrough === 70
  );
  const interpretationTag = isDefault
    ? "At the Hall High defaults: tier revenue weights 30/55/15, contractions −40/−20/−10, and a 70% pass-through rate. Click a scenario preset above or drag any slider to test your own assumptions."
    : `Your current settings model a ${combinedPct.toFixed(1)}% contraction in Napa's wine-related economy. Click 'Hall High' above to return to the chart's baseline scenario.`;

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
          Where Is Napa in the Five Stages of Grief?
        </h1>

        {/* ── BYLINE + DATE ──────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.muted, marginBottom: 16 }}>
          By Tim Carl · {ARTICLE_DATE}
        </p>

        {/* ── DECK ───────────────────────────────────────────────── */}
        {SHOW_DECK && (
          <p style={{ fontFamily: serif, fontSize: 18, color: T.muted, lineHeight: 1.6, marginBottom: 24, fontStyle: "italic" }}>
            Napa's four producer tiers are at four different stages of the same correction — and none of them yet name its cause.
          </p>
        )}

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
            Between April 5 and April 20, 2026, Napa Valley's producer base revealed its tier-stratified response to a decade-long contraction in U.S. wine demand. Two of the four largest producers — Constellation Brands and Treasury Wine Estates — have written down their U.S. assets and withdrawn forward guidance, Treasury in October and Constellation in April. Two others — Gallo and Trinchero — are selectively divesting: Gallo closing its super-premium Ranch Winery in St. Helena, Trinchero listing its Haystack and Clouds Nest vineyards for sale. Among smaller producers, Ted Hall — former chairman of Robert Mondavi Corporation — estimates 100 to 170 of 424 Napa Valley Vintners members producing under 10,000 cases are “unlikely to be economically viable under current conditions.” Three Napa wineries won a Ninth Circuit revival of their First Amendment suit against the county. And the four principal trade groups jointly petitioned the county for 23 regulatory changes to the framework they themselves helped build. Read together, the events describe actors at different stages of response to a market that has itself shrunk — for demographic, health, income, and competitive reasons no rule change can reverse. An interactive calculator lets readers test assumptions about how winery contraction across tiers flows through to the 55,875 jobs, $3.82 billion in wages and $507 million in tax revenue the wine-related economy anchors.
          </p>
        </div>

        {/* ── SECTION 1 ──────────────────────────────────────────── */}
        <h2 style={h2style}>The Two Weeks Napa Stopped Pretending</h2>
        <p style={{ ...prose, marginBottom: 18 }}>
          <span style={{ fontWeight: 700 }}>{DATELINE_LOCATION} —</span>{" "}Between April 5 and April 20, 2026, a series of public actions from across the Napa wine industry arrived from actors with little apparent coordination: a former chairman of Robert Mondavi Corporation publishing an economic diagnosis, an Australian-listed global wine company confirming a $700 million impairment against its U.S. assets, Constellation Brands reporting a collapsing wine segment, three small Napa wineries winning a federal appellate revival of their suit against the county, four trade groups filing a joint regulatory petition and Constellation reopening its Robert Mondavi flagship in Oakville after a renovation at the top of the market.
        </p>
        <p style={prose}>
          Read together, the actions describe an industry in which different tiers of the producer base are at different stages of response to the same underlying condition. The framework is familiar — the five stages psychiatrist Elisabeth Kübler-Ross first described for individuals confronting terminal diagnosis, later adapted for industries and institutions absorbing structural change: denial, anger, bargaining, depression, acceptance. Denial is the stage one does not announce; its evidence is continuation unchanged. Anger looks for a cause outside the self and often arrives in litigation. Bargaining offers modified terms in exchange for preserving the current posture. Depression is the quiet winding-down visible only to those inside it. Acceptance is the stage at which structure actually changes. The tiers of Napa's producer base are distributed across all five simultaneously, and they are not moving together.
        </p>
        <p style={prose}>
          Large producers have moved through denial and bargaining and arrived at a kind of acceptance: they are writing down their U.S. positions, divesting what cannot clear and concentrating on what can. Mid-size producers are still in bargaining. Small producers are dispersed — some continuing unchanged, some suing in anger, some absorbing Ted Hall's April 5 diagnosis that 100 to 170 of their cohort are operating beyond the point of long-term viability. The four trade groups representing the valley's producer base are at system-level bargaining: asking the county to rewrite the rules that built Napa so the current operator count can continue.
        </p>
        <p style={prose}>
          What makes the two-week window analytically useful is that no institutional actor in it names the condition the large producers have already implicitly accepted: that U.S. wine consumption has been contracting for reasons demographic, health-related, income-related and competitive, that the contraction is structural rather than cyclical, and that no regulatory change restores a market that has itself shrunk. This publication has documented that condition for more than a decade. Its naming inside the valley's senior institutions remains incomplete.
        </p>

        {/* ── CHART 1 ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ ...h2style, marginTop: 36, marginBottom: 16 }}>The Stages-of-Grief Grid</h2>
          <ChartCanvas
            id="chart-1-stages-grid"
            title="The Stages-of-Grief Grid — Napa Wine Producers, April 2026"
            downloadName="chart-1_stages-grid_napa-constellation-2026_nvf.png"
            deps={[]}
            legend={
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "14px",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 12px",
                fontSize: "10px",
                color: T.muted,
                fontFamily: "'Source Sans 3', -apple-system, sans-serif",
                letterSpacing: "0.2px",
                borderTop: `1px solid ${T.border}`,
                marginTop: "8px",
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent, display: "inline-block" }} />
                  Institutional
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C4A050", display: "inline-block" }} />
                  Small producers
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8B7355", display: "inline-block" }} />
                  Mid-size producers
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#A63D2A", display: "inline-block" }} />
                  Large producers
                </span>
              </div>
            }
            buildChart={(ctx) => {
              const STAGES = ["Denial", "Anger", "Bargaining", "Depression", "Acceptance"];
              const TIERS = ["Institutional", "Small (<10K cases)", "Mid-size (10K-100K)", "Large (>100K cases)"];
              const GRID_EVENTS = [
                { stage: 0, tier: 1, label: "Small producers operating unchanged", color: "#C4A050", date: "Ongoing", muted: true },
                { stage: 1, tier: 1, label: "Hoopes · Smith-Madrone · Summit Lake — Ninth Circuit revival", color: "#C4A050", date: "Apr 13, 2026" },
                { stage: 2, tier: 3, label: "Gallo — Ranch Winery closure + 93 layoffs", color: "#A63D2A", date: "Feb 12, 2026" },
                { stage: 2, tier: 3, label: "Trinchero — Haystack & Clouds Nest listed for sale", color: "#A63D2A", date: "Feb 2026" },
                { stage: 2, tier: 2, label: "Anonymous mid-size — 50K→10K case workout", color: "#8B7355", date: "Jan 2026" },
                { stage: 2, tier: 1, label: "Hall — 35-40 exits per year for three years", color: "#C4A050", date: "Apr 5, 2026" },
                { stage: 2, tier: 0, label: "Four-group petition — 23 reforms to WDO/visitation/events", color: T.accent, date: "Apr 14, 2026" },
                { stage: 3, tier: 1, label: "Hall diagnosis — 100-170 operating beyond viability", color: "#C4A050", date: "Apr 5, 2026" },
                { stage: 4, tier: 3, label: "Treasury — $700M impairment, dividend cancellation, vineyard fallowing", color: "#A63D2A", date: "Feb 16, 2026" },
                { stage: 4, tier: 3, label: "Constellation — Q4 collapse + guidance withdrawal", color: "#A63D2A", date: "Apr 8-13, 2026" },
                { stage: 4, tier: 3, label: "Constellation — Mondavi reopening at premium tier", color: "#A63D2A", date: "Apr 20, 2026" },
              ];
              const hexToRgba = (hex, alpha) => {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
              };
              const pointColors = GRID_EVENTS.map(e => e.muted ? hexToRgba(e.color, 0.4) : e.color);
              return new Chart(ctx, {
                type: "scatter",
                data: {
                  datasets: [{
                    label: "Event",
                    data: GRID_EVENTS.map(e => ({ x: STAGES[e.stage], y: TIERS[e.tier] })),
                    backgroundColor: pointColors,
                    borderColor: pointColors,
                    pointRadius: 8,
                    pointHoverRadius: 10,
                  }],
                },
                options: {
                  responsive: true,
                  layout: { padding: { left: 12, right: 12, top: 8, bottom: 8 } },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (item) => `${GRID_EVENTS[item.dataIndex].label} (${GRID_EVENTS[item.dataIndex].date})`,
                      },
                    },
                  },
                  scales: {
                    x: {
                      type: "category",
                      labels: STAGES,
                      offset: true,
                      ticks: {
                        color: T.muted,
                        font: { family: font },
                      },
                      grid: { color: T.rule },
                    },
                    y: {
                      type: "category",
                      labels: TIERS,
                      reverse: true,
                      offset: true,
                      ticks: {
                        color: T.muted,
                        font: { family: font, size: 13 },
                        padding: 8,
                      },
                      grid: { color: T.rule },
                      afterFit: (scale) => { scale.width = 140; },
                    },
                  },
                },
              });
            }}
          />
          <p style={{ fontStyle: "italic", fontSize: 14, color: T.muted, lineHeight: 1.6, margin: "12px 0 24px 0" }}>
            <em>Stages of Grief, Distributed by Producer Tier.</em> Eleven named events, observations, and analytical positions from between January and April 2026, the majority concentrated in the April 5–20 window, plotted by producer tier and stage of response. The Kübler-Ross stages — denial, anger, bargaining, depression, acceptance — describe how individuals and institutions absorb structural change; the framework applies naturally to an industry absorbing long-documented contraction. Large producers (brick) appear at acceptance — Treasury Wine Estates has written down $700 million in U.S. goodwill and cancelled its dividend; Constellation Brands has reported a 51% collapse in its wine segment and withdrawn forward guidance; Constellation's reopening of Robert Mondavi at premium tier is the expression of the market those producers have accepted. Gallo and Trinchero are at bargaining — closing a super-premium facility and listing two Napa vineyards for sale while preserving their broader operating bases. The mid-size tier (taupe) is at bargaining, visible in one Napa winery's publicly reported workout from 50,000 to 10,000 cases. Small producers (gold) are dispersed: some continuing unchanged (denial is the stage one does not announce); three pressing a First Amendment suit at the Ninth Circuit (anger); Hall's essay naming 100 to 170 of his cohort as operating beyond viability (depression) and proposing 35 to 40 exits per year for three years (bargaining, on behalf of the cohort). The four trade groups' joint petition (accent) is a system-level bargain. No institutional actor sits at acceptance. The stage that produces structural change is not yet present at the scale that would match what the data show. The faded dot at Small / Denial represents the cohort of small producers continuing operation unchanged — denial is the stage that does not announce itself. <em>Illustrative only — not a forecast.</em> Sources: Constellation Brands Q4 FY26 Earnings Release (April 8, 2026); Treasury Wine Estates H1 FY26 Results (February 16, 2026); Ted Hall, “Napa's Luxury Squeeze” (April 5, 2026); Ninth Circuit Court of Appeals docket (April 13, 2026); Napa County Board of Supervisors petition filing (April 14, 2026); San Francisco Chronicle on Robert Mondavi reopening (April 17, 2026).
          </p>
        </div>

        {/* ── SECTION 2 ──────────────────────────────────────────── */}
        <h2 style={h2style}>Capital: Constellation's Verdict</h2>
        <p style={prose}>
          Constellation Brands released its fiscal fourth-quarter results on April 8. The company reports its Wine & Spirits segment separately from its much larger Beer business — Modelo, Corona, Pacifico — which has driven most of Constellation's growth for the past decade. The Wine segment includes wineries across Napa, Sonoma, Washington and several international portfolios.
        </p>
        <p style={prose}>
          For the full fiscal year, Wine & Spirits net sales fell 51% to $823.8 million. In the fourth quarter alone, net sales fell 58% to $194 million. The reported figures include the 2025 divestitures of Mondavi Private Selection, Ruffino, Cook's and J. Rogét, which were sold to The Wine Group. Those brands represented most of the company's mid-tier volume, and their removal accounts for the steepness of the headline decline.
        </p>
        <p style={prose}>
          The organic numbers — the underlying demand signal — are more diagnostic. On an organic basis, stripping out the divested brands, Wine & Spirits net sales fell 14% for the year and 6% in the fourth quarter. Organic depletions, the measure of what distributors actually sold through to retailers and restaurants, fell 4.3%. The widening gap across these layers is the diagnostic part. Depletions are what consumers actually bought. Shipments are what Constellation sent to distributors. Net sales are what distributors paid. Constellation shipped less than distributors sold through; distributors sold through less than consumers bought. Inventory is backing up at every point in the chain.
        </p>
        <p style={prose}>
          One measure of how far Constellation has pulled back: <a href="https://wineeconomist.com/2026/03/10/numbers-2026/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>it fell from the third-largest U.S. wine company in 2024 to the 28th-largest in 2026</a>, according to Wine Business Monthly. Its wine-and-spirits segment made up just 9% of the fourth quarter's overall sales. The remaining ~91% is beer. That is the structural reality behind the restructured language in Fink's announcement — Constellation is now primarily a beer company that owns a handful of premium wine estates.
        </p>
        <p style={prose}>
          On the earnings call, chief financial officer Garth Hankinson cited tasting-room softness at the company's Napa-based wineries as a specific drag on the quarter. Five days later, on April 13, the company announced that chief executive Bill Newlands would be succeeded by Nicholas Fink. In the announcement, Fink described the Wine & Spirits business as having been restructured — a word that acknowledges the divestitures but also signals that the remaining portfolio is the one the new leadership intends to stand behind. Constellation withdrew its fiscal 2028 forward guidance entirely, citing limited near-term visibility.
        </p>
        <p style={prose}>
          The market read the release as confirmation of the company's beer-forward strategy. Shares of Constellation rose from $150 to $165 on the news. Investors were not rewarding the wine portfolio. They were rewarding the discipline of shrinking it.
        </p>

        {/* ── CHART 2 ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ ...h2style, marginTop: 36, marginBottom: 16 }}>Constellation Wine & Spirits, Full-Year FY26</h2>
          <ChartCanvas
            id="chart-2-constellation-ws"
            title="Constellation Wine & Spirits, Full-Year FY26"
            downloadName="chart-2_napa-constellation-2026_nvf.png"
            deps={[]}
            buildChart={(ctx) => {
              const VALUE_LABELS = ["–51%", "–14%"];
              const valueLabelsPlugin = {
                id: "valueLabels",
                afterDatasetsDraw(chart) {
                  const { ctx: c } = chart;
                  const meta = chart.getDatasetMeta(0);
                  c.save();
                  c.font = "600 13px 'Source Sans 3', sans-serif";
                  c.fillStyle = T.ink;
                  c.textAlign = "right";
                  c.textBaseline = "middle";
                  meta.data.forEach((bar, i) => {
                    c.fillText(VALUE_LABELS[i], bar.x - 8, bar.y);
                  });
                  c.restore();
                },
              };
              return new Chart(ctx, {
                type: "bar",
                data: {
                  labels: ["Reported (incl. divestitures)", "Organic (demand signal)"],
                  datasets: [{
                    data: [-51, -14],
                    backgroundColor: T.accent,
                    borderRadius: 3,
                  }],
                },
                options: {
                  indexAxis: "y",
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: {
                      min: -60, max: 0,
                      ticks: {
                        callback: (v) => v + "%",
                        color: T.muted,
                        font: { family: font },
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
                plugins: [valueLabelsPlugin],
              });
            }}
          />
          <p style={{ fontStyle: "italic", fontSize: 14, color: T.muted, lineHeight: 1.6, margin: "12px 0 24px 0" }}>
            Constellation Wine & Spirits, Full-Year FY26. Reported net sales fell 51% to $823.8 million, including the 2025 divestitures of Mondavi Private Selection, Ruffino, Cook's and J. Rogét. Stripping those out, organic net sales fell 14% — the underlying demand signal. Source: Constellation Brands Q4 FY26 Earnings Release (April 8, 2026).
          </p>
        </div>

        {/* ── SECTION 3 ──────────────────────────────────────────── */}
        <h2 style={h2style}>Diagnosis: Denial Ends When the Insider Says It</h2>
        <p style={prose}>
          On April 5, three days before Constellation reported, Ted Hall published an essay titled "<a href="https://ted241.substack.com/p/napas-luxury-squeeze" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa's Luxury Squeeze</a>" on his Substack. Hall entered Napa in 2004 as chairman of Robert Mondavi Corporation during the year that ended with its sale to Constellation. He is a former senior partner at McKinsey & Company and a founder of the McKinsey Global Institute, and he now owns Long Meadow Ranch.
        </p>
        <p style={prose}>
          Hall's central estimate is that 100 to 170 Napa wineries — roughly 25% to 40% of a specific segment — are under significant economic pressure and unlikely to meet a standard of long-term viability without material change. He is careful about the framing. The estimate is not a forecast of failures, he writes; it is a description of current condition. The relevant population he identifies is the 424 Napa Valley Vintners members producing fewer than 10,000 cases a year. Within that segment, Silicon Valley Bank's wine-industry data show the share of profitable wineries fell from roughly 76% in 2021 to approximately 50% in 2024. Applied to the small-winery cohort, that implies roughly 200 wineries operating at or near break-even. Applied against a more demanding standard of long-term viability — debt service, facility maintenance, customer acquisition, reasonable return on capital — the at-risk cohort narrows to the 100-to-170 range.
        </p>
        <p style={prose}>
          Hall's comparison is with Bordeaux, which has 81 Classified Growths across red and white wines and a broader cru bourgeois category of roughly 250 estates, many priced below Napa's core luxury tier. Napa, he writes, has created several hundred wines aspiring to similar ultra-premium positioning at equal or higher prices from a valley one-sixth the size of Bordeaux. He calls the result unprecedented dilution rather than congestion — a region that overshot not in price but in positioning. To work through the resulting overcapacity at a reasonable pace, Hall arrives at roughly 35 to 40 exits, reversions, mergers or major restructurings each year for the next three years. Not a natural rate of attrition. A serious structural reset.
        </p>
        <p style={prose}>
          None of Hall's underlying data is new. This publication and its contributors have been documenting the same structural condition for more than a decade — through the Vine Wise column in NorthBay Biz, through years of coverage in the Napa Valley Register, through reporting for The Washington Post and, for the past three years, through Napa Valley Features. In <a href="https://napavalleyfocus.substack.com/p/napa-valley-finds-itself-between" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>October 2023</a> we described the valley as caught between a rock and a hard place. In <a href="https://napavalleyfocus.substack.com/p/the-wine-boom-is-over" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>January 2024</a> we asked whether the wine boom was over. In <a href="https://napavalleyfocus.substack.com/p/under-the-hood-the-accelerants-reshaping" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>January 2026</a>, two years of accumulated data let us answer the question plainly: yes, the boom is over. A companion piece the same month — "<a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-countys-wine" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa County's Wine Market Is Clearing, Not Recovering</a>" — framed what was happening not as a downturn but as a market clearing. The structural diagnosis has never been the scarce resource. Willingness inside the industry to name it has been.
        </p>
        <p style={prose}>
          That is what April 5 changed. Hall is not an outside critic. He is a former chairman of Mondavi and a senior figure in the valley's own agricultural establishment. When the diagnosis is published under that name, the industry's long internal posture — that the pressure was cyclical, that the valley's halo would absorb it, that aggressive marketing could restore the conditions of the previous decade — becomes harder to sustain. Hall did not break news. He ended a stance.
        </p>
        <p style={prose}>
          The stages of what comes next are already visible across the other four signals this month. The framework is a familiar one. Denial is the stance that is ending. What follows it, before acceptance, are anger, bargaining and depression. The trade-group petition filed on April 14 is a textbook bargaining move: a request that the rules be rewritten so that the current operating model, which the market is rejecting, can continue. The Ninth Circuit suit revived on April 13 carries an edge of anger — three producers arguing that the framework itself is the cause of harm. Depression, the quiet, unglamorous stage of closures, reversions and exits that no one announces, is already underway for some operators, and Hall's estimate is, in effect, a measurement of how far into it the valley already is. Acceptance, which is the stage at which the structure actually changes, is not yet present in the public record.
        </p>
        <p style={prose}>
          Read against the Constellation release three days later, the pairing is diagnostic. Hall described the condition. Constellation disclosed its exposure. Both describe the same underlying market. The difference is that Constellation has already moved to acceptance: it divested the brands that would not clear, invested behind the ones that would and restructured around both. That is what the valley has not yet done.
        </p>

        {/* ── SECTION 4 ──────────────────────────────────────────── */}
        <h2 style={h2style}>Policy and the Courts: Anger and Bargaining, Arriving Together</h2>
        <p style={prose}>
          On April 13, the same day Constellation announced its leadership transition, the Ninth Circuit Court of Appeals reversed a district-court dismissal and revived constitutional claims brought by three Napa producers — Hoopes Vineyard, Smith-Madrone Winery and Summit Lake Vineyards — against Napa County. A panel of the appeals court ruled that the producers' retaliation and First Amendment claims deserved adjudication rather than dismissal and sent the case back to federal district court. The producers argue that current regulatory restrictions — rules shaped over the past two decades with the industry's own participation — now prevent viable operation under present market conditions. The revival moves the case toward a substantive record, which, if the litigation proceeds, will begin to document in public filings the specific economics that the trade groups themselves are describing in policy language.
        </p>
        <p style={prose}>
          That trade-group petition arrived the next day. On April 14, four of the valley's principal industry organizations — the Napa Valley Vintners, the Napa Valley Grapegrowers, Winegrowers of Napa County, and the Napa County Farm Bureau — filed a joint petition with the Napa County Board of Supervisors requesting 23 reforms to the regulatory framework governing winery operations. The requests include substantial changes to the Winery Definition Ordinance, revisions to visitation caps, adjustments to event-hosting rules and expanded direct-to-consumer sales permissions.
        </p>
        <p style={prose}>
          What is unusual is not the content of the petition — most of its individual elements have been debated for years — but the signatories. The four groups represent nearly every organized producer interest in the valley. They have rarely acted in concert on substantive regulatory reform. Their joint filing is not an expansion request. It is, in the language of Hall's diagnosis, a collective acknowledgment that the rules as currently written assume a market that no longer exists.
        </p>
        <p style={prose}>
          The Ninth Circuit revival and the four-group petition point at the same underlying condition from opposite directions. The producers' suit argues that the rules prevent viable operation. The trade-group petition asks the county to rewrite the rules so operation becomes viable. Both concede what the earnings call, the essay and the reopening confirm: the current framework does not fit the current market. Both also stop short of the recognition Hall names directly — that the number of operators the framework is meant to protect may itself be larger than the market can support. On the hospitality side, our <a href="https://napavalleyfocus.substack.com/p/under-the-hood-napas-tasting-rooms" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>July 2025</a> analysis of tasting-room arithmetic and the <a href="https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-has-equaled" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>August 2025</a> analysis of rooms-versus-jobs have already shown why volume strategies no longer reach their historical payoff. The current petition does not address that arithmetic.
        </p>
        <p style={prose}>
          The Board of Supervisors is expected to respond by the June hearing cycle. That response will signal the direction the county intends to take — holding up the ag preserve or the market forces as the framework for the future.
        </p>

        {/* SECTION 4.5: CONTRACTION SCENARIOS */}
        <h2 style={h2style}>What Contraction Looks Like Across the Wine Economy</h2>

        <p style={prose}>
          In March of this year, this publication examined what percentage changes to Napa's wine-related economy would mean for the county's jobs, wages and tax revenue. The framework applied proportional scaling to the 2022 <a href="https://napavintners.com/downloads/ECONOMIC-IMPACT-REPORT-NVV-2022.pdf" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Insel &amp; Company economic impact study</a> commissioned by Napa Valley Vintners, which found the wine-related economy — wineries, growers, tourism, hospitality workers, suppliers, warehousing and transport combined — accounts for 72% of Napa County employment and 73.7% of wages paid in the county. The question at the time was largely theoretical. The evidence that has accumulated since has made it less so.
        </p>

        <p style={prose}>
          Napa's wineries are not one thing. They are three. Small wineries producing fewer than 10,000 cases a year — the cohort Hall describes, 424 Napa Valley Vintners members — tend toward ceasing operation: sold, reverted to grower-only, closed. Mid-size wineries between 10,000 and 100,000 cases rarely vanish; they cut production. One such Napa winery, reported in <a href="https://napavalleyfocus.substack.com/p/under-the-hood-two-reports-one-warning" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>January of this year</a>, is planning to reduce production by 80%, from roughly 50,000 cases to 10,000, in a five-year workout with its bank. Large producers — Constellation, Gallo, Trinchero, Treasury — restructure. Constellation's wine segment dropped from the nation's third-largest wine producer to the 28th as it divested Mondavi Private Selection, Ruffino, Cook's and J. Rogét. No tier is growing production.
        </p>

        <p style={prose}>
          Hall's estimate is scoped to the small-winery tier. It does not include the county's largest producers, which are not NVV members, and it does not include the mid-size tier where this publication's reporting has documented the sharpest pressure. The <a href="https://napavalleyfocus.substack.com/p/under-the-hood-2024-harvest-report" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>2024 grape bifurcation analysis</a>, published a year before Hall's essay, showed mid-tier fruit volumes down 27% with chi-square significance. In <Link to="/under-the-hood/napa-cab-2025" style={{ color: T.accent }}>March</Link>, that pattern extended into 2025, with the high-end insulation visible the prior year beginning to erode. Hall's 100-to-170 figure describes one tier of the winery base. It is useful precisely because it is specific. It is not the ceiling of what the data show.
        </p>

        <p style={prose}>
          The chart below presents three scenarios applied to Napa's wine-related economy baseline — the 55,875 jobs, $3.82 billion in wages and $507 million in county and local tax revenue identified by the Insel study. The scenarios work in two layers. Layer one measures how much wineries contract, by tier. Layer two measures how much of that winery contraction flows through to the broader wine-related economy: growers, tourism, hospitality workers, suppliers, transport and the induced spending of all of them. A contraction concentrated in small wineries alone likely flows through modestly. A contraction that reaches mid-size and large producers — or that pulls down visitor numbers — flows through more. The chart below assumes a 70% pass-through rate. The calculator that follows lets the reader adjust both the tier contractions and the pass-through rate to test their own assumptions. Illustrative only — not a forecast.
        </p>

        {/* ── CHART 3 ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ ...h2style, marginTop: 36, marginBottom: 16 }}>Three Contraction Scenarios for the Wine-Related Economy</h2>
          <ChartCanvas
            id="chart-3-contraction-scenarios"
            title="Three Contraction Scenarios for the Wine-Related Economy"
            downloadName="chart-3_napa-constellation-2026_nvf.png"
            deps={[]}
            buildChart={(ctx) => {
              const SCENARIOS = [
                { label: "Hall Low",    impact: 9.6,  jobs: 5364,  wages: 366.7, taxes: 48.7 },
                { label: "Hall High",   impact: 17.2, jobs: 9583,  wages: 655.1, taxes: 86.9 },
                { label: "Beyond Hall", impact: 24.7, jobs: 13788, wages: 942.6, taxes: 125.1 },
              ];
              return new Chart(ctx, {
                type: "bar",
                data: {
                  labels: SCENARIOS.map(s => s.label),
                  datasets: [{
                    label: "Wine-economy impact (%)",
                    data: SCENARIOS.map(s => s.impact),
                    backgroundColor: T.accent,
                    borderRadius: 3,
                  }],
                },
                options: {
                  indexAxis: "x",
                  responsive: true,
                  layout: { padding: { left: 12, right: 12, top: 8, bottom: 8 } },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        afterBody: (items) => {
                          const s = SCENARIOS[items[0].dataIndex];
                          return [
                            `Jobs at risk: ${s.jobs.toLocaleString()}`,
                            `Wages lost: $${s.wages.toFixed(1)}M`,
                            `County/local taxes lost: $${s.taxes.toFixed(1)}M`,
                          ];
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      ticks: { color: T.muted, font: { family: font } },
                      grid: { display: false },
                      title: { display: true, text: "Scenario", color: T.muted, font: { family: font } },
                    },
                    y: {
                      min: 0, max: 30,
                      ticks: {
                        callback: (v) => v + "%",
                        color: T.muted,
                        font: { family: font },
                      },
                      grid: { color: T.rule },
                      title: { display: true, text: "Wine-related economy impact (%)", color: T.muted, font: { family: font } },
                    },
                  },
                },
              });
            }}
          />
          <p style={{ fontStyle: "italic", fontSize: 14, color: T.muted, lineHeight: 1.6, margin: "12px 0 24px 0" }}>
            Three illustrative scenarios applied to Napa's wine-related economy baseline from Insel &amp; Company 2022: 55,875 jobs, $3.82 billion in wages, $507 million in county and local tax revenue. Hall Low and Hall High apply Ted Hall's 25% and 40% small-winery contraction estimates plus smaller proportional pressure on the mid-size and large tiers (anchored to the 2024 grape bifurcation and Constellation's organic decline). Beyond Hall is a stress test that visibly exceeds Hall's range. All three assume tier revenue weights of 30/55/15 for small/mid/large producers and a 70% pass-through rate from winery contraction to the broader wine-related economy. The calculator that follows lets the reader adjust both layers. Illustrative only — not a forecast.
          </p>
        </div>

        <h3 style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.ink, margin: "32px 0 12px" }}>A Note About Assumptions</h3>
        <p style={prose}>
          Every number in the chart above rests on estimates — how Napa's $4.4 billion in winery revenue distributes across tiers, how severely each tier contracts under pressure, how winery contraction flows through to growers, tourism workers, suppliers and the rest of the wine-related economy. Reasonable analysts will land on different numbers for every one of those variables. The defaults shown here are NVF's best synthesis of the published evidence — the Insel &amp; Company 2022 study for the baseline, Ted Hall's April 2026 essay for the small-winery range, Treasury Wine Estates' and Constellation Brands' disclosed writedowns for the large tier, this publication's 2024 grape bifurcation analysis for the mid-size tier. But defensible is not the same as correct. Nor is the calculator's purpose predictive. Its purpose is to show how the documented evidence — which this publication has been accumulating for more than a decade — already exceeds what the public statements this month acknowledge. Rather than defend a single scenario, the calculator below lets you substitute your own assumptions and see what they imply. The chart updates live. If your version of the numbers produces a different answer, that is the point.
        </p>

        {/* ── INTERACTIVE CALCULATOR ─────────────────────────────── */}
        <div style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "28px 24px", marginBottom: 36 }}>
          <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.gold, fontWeight: 700, margin: "0 0 6px" }}>Interactive</p>
          <h3 style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 16px" }}>Test Your Own Assumptions</h3>
          <p style={{ fontFamily: font, fontSize: 14, color: T.muted, margin: "0 0 20px", lineHeight: 1.5 }}>
            Adjust the tier revenue weights and contraction rates below. The output at bottom updates live. Use the scenario presets to match the chart above.
          </p>

          {/* ── SCENARIO PRESETS ─────────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <p style={{
              fontFamily: "'Source Code Pro', monospace",
              fontSize: 11, color: T.muted, letterSpacing: "0.88px",
              marginBottom: 10, textTransform: "uppercase"
            }}>
              Scenario Presets
            </p>
            <div className="scenario-presets-grid">
              {[
                {
                  id: "hallLow",
                  label: "Hall Low",
                  sub: "100 small wineries\nat risk",
                  onClick: () => { resetToHallLow(); setActiveScenario("hallLow"); }
                },
                {
                  id: "hallHigh",
                  label: "Hall High",
                  sub: "170 small wineries\nat risk",
                  onClick: () => { resetToHallHigh(); setActiveScenario("hallHigh"); }
                },
                {
                  id: "beyondHall",
                  label: "Beyond Hall",
                  sub: "Adds mid-size and\nlarge tier pressure",
                  onClick: () => { resetToBeyondHall(); setActiveScenario("beyondHall"); }
                },
                {
                  id: "custom",
                  label: "Custom",
                  sub: "Adjust sliders\nto your own estimate",
                  onClick: () => {}
                },
              ].map(sc => (
                <div
                  key={sc.id}
                  onClick={sc.onClick}
                  style={{
                    background: activeScenario === sc.id ? "#2C1810" : T.surface,
                    border: `1px solid ${activeScenario === sc.id ? "#2C1810" : T.border}`,
                    borderRadius: 4,
                    padding: "10px 8px",
                    textAlign: "center",
                    cursor: sc.id === "custom" ? "default" : "pointer",
                    transition: "background 0.15s, border-color 0.15s"
                  }}
                >
                  <div style={{
                    fontFamily: serif,
                    fontSize: 13,
                    fontWeight: 700,
                    color: activeScenario === sc.id ? "#F5F0E8" : T.ink,
                    marginBottom: 4
                  }}>
                    {sc.label}
                  </div>
                  <div style={{
                    fontFamily: font,
                    fontSize: 11,
                    color: activeScenario === sc.id ? T.gold : T.muted,
                    lineHeight: 1.3,
                    whiteSpace: "pre-line"
                  }}>
                    {sc.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h4 style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: T.ink, margin: "24px 0 12px" }}>Revenue Weights (must sum to 100%)</h4>
          <p style={{ fontFamily: font, fontSize: 13, fontStyle: "italic", color: T.muted, margin: "0 0 12px", lineHeight: 1.5 }}>
            How much of Napa's $4.4 billion in wine revenue each winery tier represents. Defaults are NVF's illustrative estimate — no authoritative published source breaks this down. Adjust the sliders to test your own estimate; the others rebalance automatically to keep the total at 100%.
          </p>
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <label style={{ fontFamily: font, fontSize: 14, color: T.ink, fontWeight: 600 }}>Small wineries (&lt;10K cases)</label>
              <span style={{ fontFamily: "monospace", fontSize: 14, color: T.accent, fontWeight: 700 }}>{weightS}%</span>
            </div>
            <input type="range" min={0} max={100} step={1} value={weightS}
              onChange={e => rebalanceWeights("S", Number(e.target.value))}
              style={{ width: "100%", accentColor: T.accent }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <label style={{ fontFamily: font, fontSize: 14, color: T.ink, fontWeight: 600 }}>Mid-size wineries (10K–100K cases)</label>
              <span style={{ fontFamily: "monospace", fontSize: 14, color: T.accent, fontWeight: 700 }}>{weightM}%</span>
            </div>
            <input type="range" min={0} max={100} step={1} value={weightM}
              onChange={e => rebalanceWeights("M", Number(e.target.value))}
              style={{ width: "100%", accentColor: T.accent }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <label style={{ fontFamily: font, fontSize: 14, color: T.ink, fontWeight: 600 }}>Large wineries (&gt;100K cases)</label>
              <span style={{ fontFamily: "monospace", fontSize: 14, color: T.accent, fontWeight: 700 }}>{weightL}%</span>
            </div>
            <input type="range" min={0} max={100} step={1} value={weightL}
              onChange={e => rebalanceWeights("L", Number(e.target.value))}
              style={{ width: "100%", accentColor: T.accent }} />
          </div>
          <p style={{ fontFamily: font, fontSize: 12, color: T.muted, textAlign: "right", marginTop: 4 }}>
            Total: {weightS + weightM + weightL}%
          </p>

          <h4 style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: T.ink, margin: "24px 0 12px" }}>Tier Contractions</h4>
          <p style={{ fontFamily: font, fontSize: 13, fontStyle: "italic", color: T.muted, margin: "0 0 12px", lineHeight: 1.5 }}>
            How much each tier contracts. For small wineries, this is the share of the cohort ceasing operation (closing, selling, reverting to grower-only). For mid-size and large producers, it's the weighted-average production cut across the tier. Zero is no contraction; drag the slider leftward to model increasing pressure.
          </p>
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <label style={{ fontFamily: font, fontSize: 14, color: T.ink, fontWeight: 600 }}>Small wineries ceasing (%)</label>
              <span style={{ fontFamily: "monospace", fontSize: 14, color: T.accent, fontWeight: 700 }}>{contractS === 0 ? "0%" : `−${contractS}%`}</span>
            </div>
            <input type="range" min={0} max={100} step={1} value={contractS}
              onChange={e => { setContractS(Number(e.target.value)); setActiveScenario("custom"); }}
              style={{ width: "100%", accentColor: "#A63D2A", direction: "rtl" }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <label style={{ fontFamily: font, fontSize: 14, color: T.ink, fontWeight: 600 }}>Mid-size production cut (%)</label>
              <span style={{ fontFamily: "monospace", fontSize: 14, color: T.accent, fontWeight: 700 }}>{contractM === 0 ? "0%" : `−${contractM}%`}</span>
            </div>
            <input type="range" min={0} max={100} step={1} value={contractM}
              onChange={e => { setContractM(Number(e.target.value)); setActiveScenario("custom"); }}
              style={{ width: "100%", accentColor: "#A63D2A", direction: "rtl" }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <label style={{ fontFamily: font, fontSize: 14, color: T.ink, fontWeight: 600 }}>Large production cut (%)</label>
              <span style={{ fontFamily: "monospace", fontSize: 14, color: T.accent, fontWeight: 700 }}>{contractL === 0 ? "0%" : `−${contractL}%`}</span>
            </div>
            <input type="range" min={0} max={100} step={1} value={contractL}
              onChange={e => { setContractL(Number(e.target.value)); setActiveScenario("custom"); }}
              style={{ width: "100%", accentColor: "#A63D2A", direction: "rtl" }} />
          </div>

          <h4 style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: T.ink, margin: "24px 0 12px" }}>Pass-Through Rate</h4>
          <p style={{ fontFamily: font, fontSize: 13, fontStyle: "italic", color: T.muted, margin: "0 0 12px", lineHeight: 1.5 }}>
            How much of winery contraction flows through to the broader wine-related economy — growers, tourism, hospitality workers, suppliers, transport and induced spending. A contraction concentrated in small wineries alone flows through modestly. A contraction that reaches all three tiers — or that pulls down visitor numbers — flows through more. The 70% default reflects the mix of direct, indirect, and induced dependencies Insel documents.
          </p>
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <label style={{ fontFamily: font, fontSize: 14, color: T.ink, fontWeight: 600 }}>Winery contraction → wine-related economy (%)</label>
              <span style={{ fontFamily: "monospace", fontSize: 14, color: T.accent, fontWeight: 700 }}>{passThrough}%</span>
            </div>
            <input type="range" min={0} max={100} step={1} value={passThrough}
              onChange={e => { setPassThrough(Number(e.target.value)); setActiveScenario("custom"); }}
              style={{ width: "100%", accentColor: T.accent }} />
          </div>

          <p style={{ fontFamily: font, fontSize: 13, fontStyle: "italic", color: T.muted, margin: "24px 0 12px", lineHeight: 1.5 }}>
            {interpretationTag}
          </p>

          <ChartCanvas
            id="calc-live-chart"
            title="Wine-Related Economy Impact — Your Settings"
            downloadName="calculator-wine-economy-impact_napa-constellation-2026_nvf.png"
            deps={[weightS, weightM, weightL, contractS, contractM, contractL, passThrough]}
            buildChart={(ctx) => new Chart(ctx, {
              type: "bar",
              data: {
                labels: ["Small tier", "Mid-size tier", "Large tier", "Combined"],
                datasets: [{
                  label: "Wine-economy impact (%)",
                  data: [
                    +sContrib.toFixed(2),
                    +mContrib.toFixed(2),
                    +lContrib.toFixed(2),
                    +combinedPct.toFixed(2),
                  ],
                  backgroundColor: ["#C4A050", "#8B7355", "#A63D2A", T.accent],
                  borderRadius: 3,
                }],
              },
              options: {
                indexAxis: "x",
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (item) => `${item.parsed.y.toFixed(1)}% impact`,
                    },
                  },
                },
                scales: {
                  y: {
                    min: 0,
                    max: 30,
                    ticks: { callback: (v) => v + "%", color: T.muted, font: { family: font } },
                    grid: { color: T.rule },
                    title: { display: true, text: "Wine-related economy impact (%)", color: T.muted, font: { family: font } },
                  },
                  x: {
                    ticks: { color: T.muted, font: { family: font } },
                    grid: { display: false },
                    title: { display: true, text: "Contribution by tier", color: T.muted, font: { family: font } },
                  },
                },
              },
            })}
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, margin: "20px 0" }}>
            <div style={{ background: T.bg, border: `1px solid ${T.rule}`, padding: "16px 14px", borderRadius: 4 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, fontFamily: font, margin: 0, fontWeight: 700 }}>Jobs affected</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: T.ink, fontFamily: serif, margin: "4px 0 0" }}>{jobsLost.toLocaleString()}</p>
              <p style={{ fontSize: 11, color: T.muted, fontFamily: font, margin: "4px 0 0" }}>of {JOBS.toLocaleString()} total</p>
            </div>
            <div style={{ background: T.bg, border: `1px solid ${T.rule}`, padding: "16px 14px", borderRadius: 4 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, fontFamily: font, margin: 0, fontWeight: 700 }}>Wages lost</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: T.ink, fontFamily: serif, margin: "4px 0 0" }}>${wagesLost}M</p>
              <p style={{ fontSize: 11, color: T.muted, fontFamily: font, margin: "4px 0 0" }}>of ${WAGES}M total</p>
            </div>
            <div style={{ background: T.bg, border: `1px solid ${T.rule}`, padding: "16px 14px", borderRadius: 4 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, fontFamily: font, margin: 0, fontWeight: 700 }}>County tax lost</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: T.ink, fontFamily: serif, margin: "4px 0 0" }}>${taxLost}M</p>
              <p style={{ fontSize: 11, color: T.muted, fontFamily: font, margin: "4px 0 0" }}>of ${TAX}M total</p>
            </div>
            <div style={{ background: T.bg, border: `1px solid ${T.rule}`, padding: "16px 14px", borderRadius: 4 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, fontFamily: font, margin: 0, fontWeight: 700 }}>Property tax lost<sup style={{ color: T.accent }}>†</sup></p>
              <p style={{ fontSize: 22, fontWeight: 700, color: T.ink, fontFamily: serif, margin: "4px 0 0" }}>${propLost}M</p>
              <p style={{ fontSize: 11, color: T.muted, fontFamily: font, margin: "4px 0 0" }}>of ${PROP}M total</p>
            </div>
          </div>

          <div style={{ background: T.bg, border: `1px solid ${T.rule}`, padding: "16px 18px", borderRadius: 4, marginTop: 20 }}>
            <p style={{ fontFamily: font, fontSize: 12, color: T.muted, margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: T.ink, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Methodology</strong>
              Baseline figures are from the Insel &amp; Company 2022 economic impact study for Napa Valley Vintners: 55,875 jobs, $3.82 billion in wages, $507 million in county and local tax revenue and $156 million in property tax. Tier revenue weights (30/55/15 for Small/Mid/Large) are NVF's illustrative estimates of how Napa's $4.4 billion in 2022 winery revenue breaks down by producer size — no authoritative published source confirms these weights, so they are adjustable inputs. The pass-through rate represents how winery contraction flows through to the broader wine-related economy (growers, tourism, hospitality, suppliers, transport, induced spending). Impact figures scale linearly with (winery contraction × pass-through rate). <sup style={{ color: T.accent }}>†</sup> Property tax effects are subject to Proposition 13 constraints on reassessment; actual tax impact depends on which parcels change hands and how quickly. <em>Illustrative only — not a forecast.</em>
            </p>
          </div>
        </div>

        {/* ── SECTION 5 ──────────────────────────────────────────── */}
        <h2 style={h2style}>The Barbell: Mondavi and What Capital Is Saying</h2>
        <p style={prose}>
          On April 20, after a three-year closure, Constellation reopened Robert Mondavi Winery in Oakville. As Jess Lander reported for the <a href="https://www.sfchronicle.com/food/wine/article/robert-mondavi-winery-napa-22081753.php" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>San Francisco Chronicle</a>, the renovation was the most ambitious in recent Napa Valley history — a reconstruction whose cost Constellation has not publicly disclosed but that observers place in the hundreds of millions. Mondavi, which hosted more than 350,000 visitors a year before the closure, had drifted over two decades into what Lander describes as a gateway or "Disneyland" winery for first-time visitors. The reopening repositions it toward the high end: entry tastings rise to $60 from $45 before closure, a Mondavi Table experience runs $95 and a full tour-and-tasting runs $150.
        </p>
        <p style={prose}>
          Constellation did not divest Mondavi as it divested Private Selection, Ruffino, Cook's and J. Rogét. It invested at scale. The statement embedded in that decision is that Constellation believes Napa's future is barbell-shaped. The pattern is five years in the making: a 2021 sale of thirty lower-priced brands to Gallo for $810 million, followed by the 2025 sale of the remaining entry-level portfolio to The Wine Group, followed by a January 2026 closure of the Madera production facility. The capital that came out of those moves is being redirected to a trophy asset and a narrow band of premium labels above it. Everything in the middle — the crowded luxury lane Hall describes — gets neither.
        </p>
        <p style={prose}>
          That is the strategic message. Volume wine is going somewhere else. Beer, which is growing, absorbs most of Constellation's capital. The top of Napa's pyramid, which has historically been more defensive during category downturns, absorbs the rest. In that middle lane, owners are being asked to compete against the reopened Mondavi above them, against flexible formats below them and against peers speaking the same language at the same price point all around.
        </p>
        <p style={prose}>
          Read beside Hall's diagnosis, the Mondavi reopening is not a contradiction. It is the complement. Hall describes what the middle is unlikely to sustain. Mondavi, reopened with a hundred-million-dollar-range investment, describes where the largest corporate owner of Napa brands believes the defensible position is. The five events across two weeks do not add up to a crisis narrative. They add up to something harder for the valley to absorb: a public, multi-sourced agreement — across an essay, an earnings call, a federal court docket, a regulatory petition and a hospitality reinvestment — that the structure has to change, and that the change is large.
        </p>
        <p style={prose}>
          None of that agreement is yet acceptance at the scale that would produce structural change. The Board of Supervisors has not responded to the petition. The Ninth Circuit docket has not been scheduled. The trade groups' petition asks for the rules to change so the current operator count can continue. The 100-to-170 figure — the proposition that the current operator count itself exceeds what the market can support — has not been addressed by any institutional body that could act on it. Capital has moved. Policy has not.
        </p>
        <p style={prose}>
          Denial has largely ended. Anger and bargaining are visible across every tier: small producers litigating at the Ninth Circuit, mid-size producers cutting production under workout agreements, Gallo and Trinchero trimming premium bets while holding their broader bases, the four trade groups asking the county to rewrite the framework they helped build. Depression is present in Hall's diagnosis of the 100-to-170 cohort. Acceptance — the stage that actually produces change — is present so far only in the write-down decisions of the two largest producers, Treasury and Constellation, each of which has looked at its own U.S. wine business and decided the market cannot support it at its previous scale. Neither of those decisions names why the market cannot support it. Neither yet extends to the valley's institutional representatives or to the regulatory framework.
        </p>
        <p style={prose}>
          The reason acceptance at the cohort and institutional scale has not arrived is that acceptance requires naming what the institutions have been built not to name: that U.S. wine consumption has been contracting for more than a decade, for reasons that are demographic (aging boomers and smaller millennial and Gen Z cohorts of wine drinkers), health-related (rising awareness of alcohol's relationship to multiple cancers and cardiovascular disease), income-related (flat real wages for most working-age consumers while premium wine prices rose 40%), and competitive (spirits, beer, cannabis, THC beverages and non-alcohol alternatives taking share), and that no regulatory flexibility restores a market that has structurally shrunk. That is the conversation the next 90 days will determine whether the valley is willing to begin.
        </p>
        <p style={prose}>
          This publication will continue documenting the transition as it unfolds. The marketing-machine arithmetic — how Napa's tourism and direct-to-consumer engines are absorbing the same pressure — comes in next Saturday's edition. The demographic record — the population, workforce and aging data underlying the demand-side contraction — comes the Saturday after. Together with the interactive calculator introduced in this piece, they are meant to give readers the tools to form their own judgment about what happens next, and to see the patterns the institutional record has so far declined to name.
        </p>
        <p style={prose}>
          The pattern above does not end with these five events. Treasury Wine Estates confirmed a $700 million US writedown and cancelled its dividend in February. Gallo closed its super-premium Ranch Winery in St. Helena the same month. Trinchero listed its Haystack and Clouds Nest vineyards for sale. The April two-week window described here is where the signals converged most visibly. It is not where the evidence or impact ends.
        </p>

        {/* ── BYLINE (inline italic, AFTER final section, BEFORE Related Coverage) ── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.ink, fontStyle: "italic", lineHeight: 1.65, margin: "28px 0 0 0" }}>
          Tim Carl is a Napa Valley–based photojournalist and the founder and editor of Napa Valley, Sonoma County and Lake County Features.
        </p>

        {/* ── RELATED COVERAGE (inline, curated list) ── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 48, paddingTop: 28, marginBottom: 28 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center", marginBottom: 20 }}>
            Related Coverage
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <Link to="/under-the-hood/napa-gdp-2024" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"\"Napa’s Economy Looks Bigger Than It Is\""}</Link>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> — Napa Valley Features · March 2026</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <Link to="/under-the-hood/napa-cab-2025" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>"2025 Napa Grape Prices Slip After a Record High"</Link>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> — Napa Valley Features · March 2026</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/napa-valley-finds-itself-between" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>"Napa Valley Finds Itself Between a Rock and a Hard Place"</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> — Napa Valley Features · October 2023</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/the-wine-boom-is-over" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>"Is the Wine Boom Over?"</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> — Napa Valley Features · January 2024</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-the-accelerants-reshaping" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>"Under the Hood: How Accelerants — From GLP-1s to Politics — Are Reshaping Wine Demand"</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> — Napa Valley Features · January 2026</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-countys-wine" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>"Under the Hood: Napa County's Wine Market Is Clearing, Not Recovering"</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> — Napa Valley Features · January 2026</span>
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
            Search 1,000+ articles and reports from {PUBLICATION}.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              placeholder="Search GDP, employment, wine economics, tax revenue..."
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

        {/* ── SOURCES ────────────────────────────────────────────── */}
        <section style={{ marginTop: 48, borderTop: `2px solid ${T.border}`, paddingTop: 24 }}>
          <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "0 0 16px 0" }}>Sources</h3>
          <ol style={{ fontFamily: font, fontSize: 14, color: T.ink, lineHeight: 1.7, paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>Ted Hall, "<a href="https://ted241.substack.com/p/napas-luxury-squeeze" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa's Luxury Squeeze</a>," <em>Tell the Truth and Do the Right Thing</em> Substack, April 5, 2026.</li>
            <li style={{ marginBottom: 8 }}>Constellation Brands, "<a href="https://www.cbrands.com/blogs/press-releases/constellation-brands-reports-full-fiscal-year-and-fourth-quarter-2026-financial-results" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Fourth Quarter and Fiscal Year 2026 Results</a>," April 8, 2026.</li>
            <li style={{ marginBottom: 8 }}>Wine Business Monthly, "<a href="https://www.winebusiness.com/wbm/article/297349" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Top 50 Largest U.S. Wineries</a>," Review of the Industry issue, March 2026.</li>
            <li style={{ marginBottom: 8 }}><em>Press Democrat</em>, "<a href="https://www.pressdemocrat.com/2026/04/14/constellation-brands-napa-mondavi-q4-wine-spirits-beer/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Constellation Brands flags Napa tasting-room softness; Mondavi to reopen April 20</a>," April 14, 2026.</li>
            <li style={{ marginBottom: 8 }}><em>Press Democrat</em>, "<a href="https://www.pressdemocrat.com/2026/04/14/federal-appeals-court-reverses-dismissal-of-some-claims-against-napa-county-in-hoopes-vineyard-case/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Federal appeals court reverses dismissal of some claims against Napa County in Hoopes Vineyard case</a>," April 14, 2026.</li>
            <li style={{ marginBottom: 8 }}>Napa Valley Vintners, Napa Valley Grapegrowers, Winegrowers of Napa County, and Napa County Farm Bureau, joint petition to the Napa County Board of Supervisors, April 14, 2026.</li>
            <li style={{ marginBottom: 8 }}>Jess Lander, "<a href="https://www.sfchronicle.com/food/wine/article/robert-mondavi-winery-napa-22081753.php" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Inside the most anticipated California winery opening of the year, or maybe ever</a>," <em>San Francisco Chronicle</em>, April 17, 2026.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, "<a href="https://napavalleyfocus.substack.com/p/napa-valley-finds-itself-between" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa Valley Finds Itself Between a Rock and a Hard Place</a>," <em>Napa Valley Features</em>, October 3, 2023.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, "<a href="https://napavalleyfocus.substack.com/p/the-wine-boom-is-over" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Is the Wine Boom Over?</a>" <em>Napa Valley Features</em>, January 4, 2024.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, "<a href="https://napavalleyfocus.substack.com/p/under-the-hood-napas-tasting-rooms" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: Napa's Tasting Rooms Face a Numbers Problem</a>," <em>Napa Valley Features</em>, July 5, 2025.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, "<a href="https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-has-equaled" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: More Rooms Has Equaled Fewer Jobs in Napa County</a>," <em>Napa Valley Features</em>, August 23, 2025.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, "<a href="https://napavalleyfocus.substack.com/p/under-the-hood-the-accelerants-reshaping" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: How Accelerants — From GLP-1s to Politics — Are Reshaping Wine Demand</a>," <em>Napa Valley Features</em>, January 2026.</li>
            <li style={{ marginBottom: 8 }}>Tim Carl, "<a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-countys-wine" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: Napa County's Wine Market Is Clearing, Not Recovering</a>," <em>Napa Valley Features</em>, January 2026.</li>
            <li style={{ marginBottom: 8 }}>Silicon Valley Bank, <em>State of the U.S. Wine Industry</em>, 2024 and 2025 editions.</li>
            <li style={{ marginBottom: 8 }}><em>Business News Australia</em>, "<a href="https://www.businessnewsaustralia.com/articles/treasury-wine-estates-in-687m-goodwill-wipeout-for-americas-business.html" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Treasury Wine Estates' $687m goodwill wipeout for Americas</a>," December 1, 2025.</li>
            <li style={{ marginBottom: 8 }}><em>Just-Drinks</em>, "<a href="https://www.just-drinks.com/news/treasury-wine-estates-losses-widen-as-us-impairment-confirmed/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Treasury Wine Estates losses widen as US impairment confirmed</a>," February 16, 2026.</li>
            <li style={{ marginBottom: 8 }}><em>Markets Daily</em>, "<a href="https://www.themarketsdaily.com/2026/02/18/treasury-wine-estates-h1-earnings-call-highlights.html" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Treasury Wine Estates H1 Earnings Call Highlights</a>," February 18, 2026.</li>
            <li style={{ marginBottom: 8 }}><em>Press Democrat</em>, "<a href="https://www.pressdemocrat.com/2026/02/18/gallo-napa-ranch-winery-closure-j-sonoma-martini-orin-swift-layoffs/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Gallo plans to close large Napa Valley winery and cut nearly 100 North Coast jobs at 5 locations</a>," February 18, 2026 (updated February 25).</li>
            <li style={{ marginBottom: 8 }}><em>Yahoo Finance</em> (syndicated from <em>San Francisco Chronicle</em>), "<a href="https://finance.yahoo.com/news/third-largest-u-wine-company-210509237.html" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>The third-largest U.S. wine company is selling two of its best Napa vineyards</a>," February 18, 2026.</li>
            <li style={{ marginBottom: 8 }}>Ted Hall, "<a href="https://ted241.substack.com/p/the-great-napa-valley-overpour" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>The Great Napa Valley Overpour</a>," <em>Tell the Truth and Do the Right Thing</em> Substack, April 2026.</li>
            <li style={{ marginBottom: 8 }}><em>Wine Industry Advisor</em>, "<a href="https://wineindustryadvisor.com/2026/04/14/decision-against-hoopes-smith-madrone-summit-lake-is-reversed-case-moves-back-to-district-court/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Decision Against Hoopes/Smith-Madrone/Summit Lake Is Reversed — Case Moves Back to District Court</a>," April 14, 2026.</li>
            <li style={{ marginBottom: 8 }}><em>Wine Industry Advisor</em>, "<a href="https://wineindustryadvisor.com/2026/04/14/napas-four-leading-agriculture-and-wine-organizations-speak-with-one-voice-before-board-of-supervisors/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa's Four Leading Agriculture and Wine Organizations Speak with One Voice Before Board of Supervisors</a>," April 14, 2026.</li>
            <li style={{ marginBottom: 8 }}><em>Press Democrat</em>, "<a href="https://www.pressdemocrat.com/2026/04/15/napa-county-winery-vineyard-land-use-policy/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Wine groups ask Napa County for two dozen reforms to help industry survive</a>," April 15, 2026.</li>
          </ol>
        </section>

        {/* ── METHODOLOGY ────────────────────────────────────────── */}
        <section style={{ marginTop: 48, borderTop: `2px solid ${T.border}`, paddingTop: 24 }}>
          <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "0 0 16px 0" }}>Methodology</h3>
          <p style={{ fontFamily: font, fontSize: 14, color: T.ink, lineHeight: 1.7 }}>
            This piece treats five discrete public events — an editorial essay, a corporate earnings release, an appellate court revival, a trade-group petition, and a hospitality reopening — as data points in an industry-pivot pattern. Financial figures are reported directly from Constellation Brands' Q4 FY26 disclosures. The 100-to-170 estimate and its underlying methodology are drawn from Ted Hall's April 5, 2026 essay, which itself applies Silicon Valley Bank wine-industry profitability data to the subset of Napa Valley Vintners members producing fewer than 10,000 cases annually. The stages-of-correction framing is analytical, not clinical. Napa Valley Features has documented the structural condition described here since its founding in 2023, building on more than a decade of prior reporting by this author in NorthBay Biz, the Napa Valley Register and The Washington Post.
          </p>
        </section>

      </div>

      <Footer />
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
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

const API_BASE = "/api/community-data";
const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";
const ARTICLE_SLUG = "sonoma-cab-2025";

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

/* ── helpers ────────────────────────────────────────────────────────────────── */
function extractByDimension(rows, prefix) {
  return rows.filter(r => r.dimension && r.dimension.startsWith(prefix));
}

function extractDistrictOverall(rows) {
  return rows.filter(r => r.dimension && /^district\|\d+$/.test(r.dimension));
}

function yearLabel(row) {
  return row.period_start ? row.period_start.slice(0, 4) : "";
}

/* ── Chart.js wrapper ───────────────────────────────────────────────────────── */
function ChartCanvas({ id, buildChart, deps }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = buildChart(ctx);
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas ref={canvasRef} id={id} />;
}

/* ── Loading spinner ────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0" }}>
      <style>{`@keyframes uth-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 32, height: 32, border: `3px solid ${T.rule}`, borderTopColor: T.accent, borderRadius: "50%", animation: "uth-spin .8s linear infinite", marginBottom: 14 }} />
      <span style={{ fontSize: 14, color: T.muted, fontFamily: font }}>Loading community data…</span>
    </div>
  );
}

/* ── Section wrapper ────────────────────────────────────────────────────────── */
function Section({ eyebrow, title, children, note }) {
  return (
    <div style={{ marginBottom: 48 }}>
      {eyebrow && <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.gold, margin: "0 0 6px" }}>{eyebrow}</p>}
      <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "0 0 16px", lineHeight: 1.3 }}>{title}</h2>
      {children}
      {note && <p style={{ fontSize: 12, color: T.muted, margin: "10px 0 0", lineHeight: 1.5 }}>{note}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════════════ */
export default function UnderTheHoodSonoma() {
  const [sonomaData, setSonomaData] = useState(null);
  const [napaData, setNapaData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, nRes] = await Promise.all([
          fetch(`${API_BASE}?domain=grape_crush&geography=Sonoma%20County&limit=500`),
          fetch(`${API_BASE}?domain=grape_crush&geography=Napa%20County&limit=500`),
        ]);
        if (!sRes.ok || !nRes.ok) throw new Error(`Failed to fetch data (${sRes.status}, ${nRes.status})`);
        const [sJson, nJson] = await Promise.all([sRes.json(), nRes.json()]);
        setSonomaData(sJson);
        setNapaData(nJson);
      } catch (e) {
        setError(e.message);
      }
    };
    fetchData();
  }, []);

  const loading = !sonomaData || !napaData;
  const sonomaRows = sonomaData?.rows || [];
  const napaRows = napaData?.rows || [];

  /* ── Derived datasets ──────────────────────────────────────── */
  // 1. Overall district-level weighted avg price (Sonoma = district 3)
  const sonomaOverall = extractDistrictOverall(sonomaRows).sort((a, b) => a.period_start.localeCompare(b.period_start));
  const napaOverall = extractDistrictOverall(napaRows).sort((a, b) => a.period_start.localeCompare(b.period_start));

  // 2. Varietal breakdown — get unique varietals
  const sonomaVarietals = extractByDimension(sonomaRows, "varietal|");
  const varietalSet = new Set();
  sonomaVarietals.forEach(r => {
    const parts = r.dimension.split("|");
    if (parts[1]) varietalSet.add(parts[1]);
  });
  const TOP_VARIETALS = ["Cabernet Sauvignon", "Pinot Noir", "Chardonnay", "Sauvignon Blanc", "Cabernet Franc"];
  const displayVarietals = TOP_VARIETALS.filter(v => varietalSet.has(v));

  // 3. Years available
  const allYears = [...new Set(sonomaOverall.map(yearLabel))].sort();

  /* ── Chart colors ──────────────────────────────────────────── */
  const COLORS = ["#8B5E3C", "#C4A050", "#5B8C5A", "#7A6A50", "#B07156", "#4A7C8F"];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: font, color: T.ink }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <NavBar />

      {/* Masthead */}
      <div style={{ background: "#2C1810", color: "#F5F0E8", textAlign: "center", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", padding: "10px 24px" }}>
        Sonoma County Features &nbsp;·&nbsp; Under the Hood &nbsp;·&nbsp; March 2026
      </div>

      <article id="main-content" style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px 60px" }}>
        {/* Eyebrow */}
        <div style={{ fontFamily: "monospace", fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C4A050", marginTop: 32, marginBottom: 16 }}>
          Under the Hood &nbsp;·&nbsp; Sonoma County Features
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily: serif, fontWeight: 700, fontSize: "clamp(26px, 5vw, 42px)", color: "#2C1810", lineHeight: 1.15, marginBottom: 20 }}>
          Sonoma Grape Prices Fall for a Second Year as Cab Sauv Leads the Decline
        </h1>

        {/* Deck */}
        <p style={{ fontFamily: font, fontWeight: 300, fontSize: 17, lineHeight: 1.65, color: "#5C4033", marginBottom: 24 }}>
          Sonoma County's weighted average grape price fell for the second consecutive year in 2025, driven by declines in Cabernet Sauvignon and several key varietals. The charts below draw directly from CDFA <a href="https://www.nass.usda.gov/Statistics_by_State/California/Publications/Specialty_and_Other_Releases/Grapes/Crush/Reports/index.php" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>crush report</a> data to show how Sonoma's wine-grape economy is shifting — and how it compares to neighboring Napa County.
        </p>

        {/* Byline */}
        <div style={{ borderTop: "1px solid #D4C4A8", paddingTop: 14 }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8B7355" }}>
            By Tim Carl &nbsp;·&nbsp; Sonoma County Features &nbsp;·&nbsp; March 21, 2026
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em", color: "#8B7355", fontStyle: "italic", marginTop: 4 }}>
            Live data from the NapaServe Community Data Commons &nbsp;·&nbsp; CDFA·USDA-NASS Grape Crush Report
          </div>
          <a href="https://sonomacountyfeatures.substack.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily: font, fontSize: 14, fontWeight: 400, color: T.accent, textDecoration: "none", textTransform: "none", letterSpacing: "normal", display: "inline-block", marginTop: 12, marginBottom: 40 }}>
            Read on Sonoma County Features · Substack →
          </a>
        </div>

        {loading && <Spinner />}
        {error && <p style={{ color: "#C62828", fontSize: 15 }}>Error loading data: {error}</p>}

        {!loading && !error && (
          <>
            {/* ── Section 1: Overall Trend ─────────────────────────── */}
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "40px 0 16px", lineHeight: 1.3 }}>The Overall Trend: Down for the Second Straight Year</h2>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
                SONOMA COUNTY, Calif. — Sonoma County grapes fetched a district-wide weighted average of $2,761 per ton in 2025, according to the preliminary CDFA crush report — down from $2,927 in 2024 and $2,975 in 2023. That is a 5.7% decline year-over-year, compounding a 1.6% drop the year before. Over two years the county has shed roughly $214 per ton in average grower returns.
              </p>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 24px" }}>
                The decline is broad-based but not uniform. Cabernet Sauvignon and Sauvignon Blanc took the steepest hits in percentage terms, while Pinot Noir — Sonoma's flagship cool-climate grape — held up comparatively well.
              </p>
            </div>

            {/* ── Chart 1: Overall trend ────────────────────────────── */}
            <Section eyebrow="Chart 1" title="Sonoma County — Overall Weighted Average Price per Ton" note="Source: CDFA/USDA-NASS Table 6 — District 3 total, all varieties. 2025 data is preliminary.">
              <div style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
                <ChartCanvas id="chart-overall" deps={[sonomaOverall]} buildChart={(ctx) => {
                  const labels = sonomaOverall.map(yearLabel);
                  const values = sonomaOverall.map(r => r.value);
                  return new Chart(ctx, {
                    type: "bar",
                    data: {
                      labels,
                      datasets: [{
                        label: "Weighted Avg Price ($/ton)",
                        data: values,
                        backgroundColor: values.map((v, i) => i === values.length - 1 ? T.gold : T.accent),
                        borderRadius: 3,
                      }],
                    },
                    options: {
                      responsive: true,
                      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `$${c.parsed.y.toLocaleString()} / ton` } } },
                      scales: { y: { beginAtZero: false, ticks: { callback: v => `$${v.toLocaleString()}` } } },
                    },
                  });
                }} />
              </div>
            </Section>

            {/* ── Section 2: Varietal breakdown ─────────────────────── */}
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "40px 0 16px", lineHeight: 1.3 }}>Varietal Breakdown: Cab Leads the Decline</h2>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
                Cabernet Sauvignon, which commands the highest per-ton price among Sonoma red varietals, fell from $3,061 in 2023 to $2,773 in 2025 — a cumulative drop of nearly $289 per ton, or 9.4%. In a county where Cab anchors the premium tier, that slide reverberates through tasting-room margins and grape-purchase contracts alike.
              </p>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
                Pinot Noir, by contrast, dipped just 1.6% over the same two-year window — from $3,881 to $3,818. It remains the county's highest-priced varietal overall, reflecting the enduring strength of Russian River Valley and Sonoma Coast appellations for cool-climate Pinot.
              </p>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
                Chardonnay edged down from $2,560 to $2,429 (−5.1%), while Sauvignon Blanc fell from $2,054 to $1,904 (−7.3%). Of the major white varietals, Sauvignon Blanc saw the sharpest percentage decline — possibly reflecting oversupply pressure from <a href="/under-the-hood/lake-county-cab-2025" style={{ color: T.accent }}>Lake County</a> and other value-oriented districts.
              </p>
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px",
              background: T.rule, border: `1px solid ${T.rule}`, margin: "40px 0",
            }}>
              <div style={{ background: "#FAF8F5", padding: "20px 16px", textAlign: "center" }}>
                <span style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: T.accent, lineHeight: 1, marginBottom: 6, display: "block" }}>{"\u2212"}9.4%</span>
                <span style={{ fontFamily: "'monospace'", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: T.muted, lineHeight: 1.4, display: "block" }}>Cab Sauv<br />2023–2025</span>
              </div>
              <div style={{ background: "#FAF8F5", padding: "20px 16px", textAlign: "center" }}>
                <span style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: T.accent, lineHeight: 1, marginBottom: 6, display: "block" }}>{"\u2212"}1.6%</span>
                <span style={{ fontFamily: "'monospace'", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: T.muted, lineHeight: 1.4, display: "block" }}>Pinot Noir<br />2023–2025</span>
              </div>
              <div style={{ background: "#FAF8F5", padding: "20px 16px", textAlign: "center" }}>
                <span style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: T.accent, lineHeight: 1, marginBottom: 6, display: "block" }}>{"\u2212"}5.1%</span>
                <span style={{ fontFamily: "'monospace'", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: T.muted, lineHeight: 1.4, display: "block" }}>Chardonnay<br />2023–2025</span>
              </div>
            </div>

            <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
              The chart below shows how each varietal performed across the two-year period.
            </p>

            {/* ── Chart 2: Varietal prices ──────────────────────────── */}
            <Section eyebrow="Chart 2" title="Sonoma Varietal Prices — Year over Year" note="Source: CDFA/USDA-NASS Table 6 — District 3 varietal breakdowns.">
              <div style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
                <ChartCanvas id="chart-varietal" deps={[sonomaVarietals]} buildChart={(ctx) => {
                  const datasets = displayVarietals.map((varietal, vi) => {
                    const rows = sonomaVarietals
                      .filter(r => r.dimension.includes(`varietal|${varietal}`))
                      .sort((a, b) => a.period_start.localeCompare(b.period_start));
                    return {
                      label: varietal,
                      data: allYears.map(yr => {
                        const match = rows.find(r => yearLabel(r) === yr);
                        return match ? match.value : null;
                      }),
                      borderColor: COLORS[vi % COLORS.length],
                      backgroundColor: COLORS[vi % COLORS.length] + "22",
                      borderWidth: 2,
                      tension: 0.3,
                      pointRadius: 4,
                      spanGaps: true,
                    };
                  });
                  return new Chart(ctx, {
                    type: "line",
                    data: { labels: allYears, datasets },
                    options: {
                      responsive: true,
                      plugins: { tooltip: { callbacks: { label: (c) => `${c.dataset.label}: $${c.parsed.y.toLocaleString()} / ton` } } },
                      scales: { y: { beginAtZero: false, ticks: { callback: v => `$${v.toLocaleString()}` } } },
                    },
                  });
                }} />
              </div>
            </Section>

            {/* ── Section 3: Sonoma vs Napa ─────────────────────────── */}
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "40px 0 16px", lineHeight: 1.3 }}>Sonoma vs. Napa: Both Counties Declining, but at Different Speeds</h2>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
                <a href="/under-the-hood/napa-cab-2025" style={{ color: T.accent }}>Napa County</a>'s overall weighted average also fell — from $7,029 in 2023 to $6,768 in 2025, a decline of 3.7%. But Napa's slide is shallower in percentage terms than Sonoma's 7.2% cumulative decline over the same window. Both counties are adjusting to a cooler market after the pandemic-era price surge, but Napa's brand premium provides a wider cushion.
              </p>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
                The year-over-year chart below puts the two counties side by side. In 2024, Sonoma fell 1.6% while Napa dropped 1.3%. In 2025, the gap widened: Sonoma declined 5.7% versus Napa's 2.5%. The disparity suggests that mid-tier pricing regions face steeper pressure when the market softens.
              </p>
            </div>

            {/* ── Chart 3: Sonoma vs Napa % change ──────────────────── */}
            <Section eyebrow="Chart 3" title="YOY % Change by Varietal — Sonoma vs Napa (2023–2025)" note="Percentage change in weighted average price per ton, 2023 to 2025. Negative values indicate price declines.">
              <div style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
                <ChartCanvas id="chart-pctchange" deps={[sonomaVarietals, napaRows]} buildChart={(ctx) => {
                  const VARIETALS = ["Cabernet Sauvignon", "Pinot Noir", "Chardonnay", "Sauvignon Blanc", "Cabernet Franc"];
                  const LABELS = ["Cab Sauv", "Pinot Noir", "Chardonnay", "Sauv Blanc", "Cab Franc"];
                  const napaVarietals = extractByDimension(napaRows, "varietal|");

                  const calcChange = (varRows, varietal) => {
                    const rows = varRows
                      .filter(r => r.dimension === `varietal|${varietal}`)
                      .sort((a, b) => a.period_start.localeCompare(b.period_start));
                    const v2023 = rows.find(r => yearLabel(r) === "2023");
                    const v2025 = rows.find(r => yearLabel(r) === "2025");
                    if (!v2023 || !v2025 || !v2023.value) return 0;
                    return +((v2025.value - v2023.value) / v2023.value * 100).toFixed(1);
                  };

                  return new Chart(ctx, {
                    type: "bar",
                    data: {
                      labels: LABELS,
                      datasets: [
                        {
                          label: "Sonoma County",
                          data: VARIETALS.map(v => calcChange(sonomaVarietals, v)),
                          backgroundColor: T.accent,
                          borderRadius: 3,
                        },
                        {
                          label: "Napa County",
                          data: VARIETALS.map(v => calcChange(napaVarietals, v)),
                          backgroundColor: T.gold,
                          borderRadius: 3,
                        },
                      ],
                    },
                    options: {
                      responsive: true,
                      plugins: { tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${c.parsed.y > 0 ? "+" : ""}${c.parsed.y.toFixed(1)}%` } } },
                      scales: {
                        x: { ticks: { maxRotation: 0 } },
                        y: { beginAtZero: false, grace: '5%', ticks: { callback: v => `${v > 0 ? "+" : ""}${v}%` } },
                      },
                    },
                  });
                }} />
              </div>
            </Section>

            {/* ── Section 4: Price gap ──────────────────────────────── */}
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "40px 0 16px", lineHeight: 1.3 }}>The Gap Chart: Napa's Premium over Sonoma Is Widening</h2>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
                The Napa-to-Sonoma price ratio has climbed from 2.36x in 2023 to 2.45x in 2025. In dollar terms, Napa grapes now command roughly $4,006 more per ton than Sonoma's — up from $4,054 in 2023 on an absolute basis, but representing a growing proportional gap as Sonoma's base price erodes faster.
              </p>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
                For growers deciding where to invest, the ratio is a shorthand for brand premium. A higher ratio suggests that the "Napa Valley" appellation captures more consumer willingness-to-pay relative to "Sonoma County." That gap has structural implications for land values, replanting decisions, and the long-term competitiveness of Sonoma's grape market.
              </p>
            </div>

            {/* ── Chart 4: Napa / Sonoma ratio ──────────────────────── */}
            <Section eyebrow="Chart 4" title="Napa-to-Sonoma Price Ratio" note="A ratio above 1.0 means Napa grapes command a premium over Sonoma. Higher values indicate a wider price gap.">
              <div style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
                <ChartCanvas id="chart-ratio" deps={[sonomaOverall, napaOverall]} buildChart={(ctx) => {
                  const sMap = {};
                  sonomaOverall.forEach(r => { sMap[yearLabel(r)] = r.value; });
                  const nMap = {};
                  napaOverall.forEach(r => { nMap[yearLabel(r)] = r.value; });
                  const years = [...new Set([...Object.keys(sMap), ...Object.keys(nMap)])].sort();
                  const ratios = years.map(yr => (nMap[yr] && sMap[yr]) ? +(nMap[yr] / sMap[yr]).toFixed(3) : null);

                  return new Chart(ctx, {
                    type: "line",
                    data: {
                      labels: years,
                      datasets: [{
                        label: "Napa / Sonoma ratio",
                        data: ratios,
                        borderColor: T.accent,
                        backgroundColor: T.accent + "22",
                        fill: true,
                        borderWidth: 2,
                        tension: 0.3,
                        pointRadius: 5,
                        pointBackgroundColor: T.accent,
                        spanGaps: true,
                      }],
                    },
                    options: {
                      responsive: true,
                      plugins: { tooltip: { callbacks: { label: (c) => `Ratio: ${c.parsed.y.toFixed(2)}x` } } },
                      scales: { y: { beginAtZero: false, suggestedMin: 1.0, ticks: { callback: v => `${v.toFixed(1)}x` } } },
                    },
                  });
                }} />
              </div>
            </Section>

            {/* ── Verified pullquote ──────────────────────────────── */}
            <div style={{ borderLeft: `3px solid ${T.accent}`, padding: "4px 0 4px 24px", margin: "36px 0" }}>
              <p style={{ fontFamily: serif, fontSize: 20, fontStyle: "italic", lineHeight: 1.5, color: T.ink, marginBottom: 8 }}>
                "District average prices throughout the North Coast are not representative of the spot market prices for new contracts for the second consecutive year."
              </p>
              <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: T.muted }}>
                — Christian Klier, North Coast, <a href="https://www.turrentinebrokerage.com" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Turrentine Brokerage</a>, <a href="https://www.winebusiness.com/content/file/2025_Crush_Report_Press_Release(1).pdf" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>"The 2025 Crop Was Down an Equivalent of 72 Million Cases From the Five-Year Average,"</a> Wine Business, March 13, 2026.
              </div>
            </div>

            {/* ── The Broader Picture ─────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "40px 0 32px" }}>
              <div style={{ flex: 1, height: 1, background: T.rule }} />
              <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: T.muted, whiteSpace: "nowrap" }}>The Broader Picture</span>
              <div style={{ flex: 1, height: 1, background: T.rule }} />
            </div>

            <div style={{ marginBottom: 36 }}>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
                The statewide picture offers context. California crushed 2.62 million tons in 2025 — 8% below 2024 and 23% below the five-year average of 3.6 million tons, the lightest harvest since 1999. For the wine industry overall, that reduction in supply is welcome. "The decrease in tons is still very positive news for the industry overall," said Steve Fredricks, president of <a href="https://www.turrentinebrokerage.com" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Turrentine Brokerage</a>, in a March 13, 2026 market assessment. But Turrentine's own North Coast analyst flagged a critical caveat: published district averages overstate what growers negotiating new contracts actually receive. For Sonoma County chardonnay, the published district average of $2,370 contrasts with spot market prices closer to $800 per ton — a gap of more than 65%.
              </p>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
                For consumers, the dynamics are mixed. A lighter harvest and lower grape prices can eventually translate to more accessible wine at retail — but that benefit moves slowly through the supply chain, and only if growers remain solvent long enough to plant and tend future vintages. The more immediate market signal is a shift toward lighter white varieties: Sauvignon Blanc tonnage increased 22,000 tons statewide in 2025 and Pinot Gris rose 8,000 tons, even as red varieties contracted sharply. Audra Cooper, vice president at Turrentine, described the season as representing "continued challenges for growers and wineries that were strikingly apparent at harvest."
              </p>
            </div>

            {/* ── Section 5: What the Data Don't Show ──────────────── */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "40px 0 32px" }}>
              <div style={{ flex: 1, height: 1, background: T.rule }} />
              <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: T.muted, whiteSpace: "nowrap" }}>{"What the Data Don\u2019t Show"}</span>
              <div style={{ flex: 1, height: 1, background: T.rule }} />
            </div>
            <div style={{ marginBottom: 36 }}>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
                The 2025 figures are preliminary. The CDFA's final crush report — expected in late April 2026 — often revises district-level averages by a few percentage points as late-reported contracts filter in. That said, the direction of the trend is unlikely to reverse: Sonoma grape prices are adjusting downward.
              </p>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
                Several factors bear watching. First, tonnage: a smaller 2025 harvest could concentrate value and soften the price decline on a per-ton basis. Second, inventory levels in the bulk market — if wineries are sitting on unsold wine, contract prices for the 2026 vintage could face further pressure. Third, the ongoing acreage reduction across Sonoma, as some growers pull vines in response to lower returns and rising costs. That supply correction, if it continues, could eventually support prices — but not overnight.
              </p>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
                We will update this article when the final 2025 crush report is published and revise the charts accordingly. All data powering these charts is served live from the NapaServe Community Data Commons, so the numbers will update automatically when new data is loaded.
              </p>
            </div>

            {/* ── Related Coverage ────────────────────────────────── */}
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
                <a href="/under-the-hood/lake-county-cab-2025" style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: T.accent, textDecoration: "none", lineHeight: 1.4 }}>
                  "Lake County Grape Prices Have Fallen 38% in Two Years — and Chardonnay Has Nearly Vanished"
                </a>
                <span style={{ fontSize: 14, color: T.muted }}> — Lake County Features</span>
              </div>
            </div>

            {/* ── Polls ─────────────────────────────────────────────── */}
            <PollsSection />

            {/* ── Sources ─────────────────────────────────────────────── */}
            <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 48, paddingTop: 24 }}>
              <h2 style={{ fontWeight: 700, fontSize: 17, color: T.ink, fontFamily: serif, marginBottom: 16 }}>Sources</h2>
              {[
                { label: "Preliminary 2025 California Grape Crush Report (USDA-NASS PDF)", url: "https://www.nass.usda.gov/Statistics_by_State/California/Publications/Specialty_and_Other_Releases/Grapes/Crush/Reports/index.php" },
                { label: "USDA-NASS Grape Crush Reports Index — all years", url: "https://www.nass.usda.gov/Statistics_by_State/California/Publications/Specialty_and_Other_Releases/Grapes/Crush/Reports/index.php" },
                { label: "Turrentine Brokerage 2025 market assessment (via Wine Business Monthly)", url: "https://www.winebusiness.com/content/file/2025_Crush_Report_Press_Release(1).pdf" },
                { label: "SF Chronicle: California's 2025 grape harvest was the lightest in over two decades", url: "https://www.sfchronicle.com/food/wine/article/california-grape-harvest-2025-20269647.php" },
                { label: "Press Democrat: North Coast wine grape crop value slips to $1.33 billion — March 16, 2026", url: "https://www.pressdemocrat.com" },
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
                Tim Carl is a Napa Valley-based photojournalist and the founder and editor of Sonoma County Features. Data sourced from CDFA·USDA-NASS Grape Crush Reports. 2025 figures are preliminary pending the final report due April 30, 2026.
              </p>
            </div>

            {/* ── Methodology ───────────────────────────────────────── */}
            <div style={{ borderTop: `2px solid ${T.border}`, paddingTop: 28, marginTop: 20 }}>
              <h3 style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: T.ink, margin: "0 0 10px" }}>Methodology</h3>
              <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7 }}>
                All data is sourced from the California Department of Food and Agriculture (CDFA) and USDA National Agricultural Statistics Service (NASS) Grape Crush Reports, Tables 4 and 6. Sonoma County corresponds to Crush District 3. Napa County corresponds to Crush District 4. Weighted average prices reflect grower returns per ton on a delivered basis for non-related purchased tonnage only. 2025 figures are preliminary and subject to revision when the final report is published.
              </p>
              <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, marginTop: 10 }}>
                Charts are rendered live from the NapaServe Community Data Commons via the <code style={{ fontSize: 13, background: T.surface, padding: "2px 6px", borderRadius: 3 }}>/api/community-data</code> endpoint.
              </p>
            </div>
          </>
        )}
      </article>
      <Footer />
    </div>
  );
}

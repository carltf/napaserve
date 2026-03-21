import { useEffect, useRef, useState } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";

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
    if (!window.Chart || !canvasRef.current) return;
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
        console.log("[Sonoma] Fetching community data...");
        const [sRes, nRes] = await Promise.all([
          fetch(`${API_BASE}?domain=grape_crush&geography=Sonoma%20County&limit=500`),
          fetch(`${API_BASE}?domain=grape_crush&geography=Napa%20County&limit=500`),
        ]);
        console.log("[Sonoma] Response status:", sRes.status, nRes.status);
        if (!sRes.ok || !nRes.ok) throw new Error(`Failed to fetch data (${sRes.status}, ${nRes.status})`);
        const [sJson, nJson] = await Promise.all([sRes.json(), nRes.json()]);
        console.log("[Sonoma] Sonoma rows:", sJson?.rows?.length, "Napa rows:", nJson?.rows?.length);
        setSonomaData(sJson);
        setNapaData(nJson);
      } catch (e) {
        console.error("[Sonoma] Fetch error:", e);
        setError(e.message);
      }
    };
    // Load Chart.js from CDN
    if (!window.Chart) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.4/chart.umd.min.js";
      script.onload = () => {
        console.log("[Sonoma] Chart.js loaded successfully");
        fetchData();
      };
      script.onerror = () => {
        console.error("[Sonoma] Failed to load Chart.js from CDN");
        setError("Failed to load charting library. Please refresh the page.");
      };
      document.head.appendChild(script);
    } else {
      console.log("[Sonoma] Chart.js already available");
      fetchData();
    }
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
  const TOP_VARIETALS = ["Cabernet Sauvignon", "Chardonnay", "Pinot Noir", "Merlot", "Zinfandel", "Sauvignon Blanc"];
  const displayVarietals = TOP_VARIETALS.filter(v => varietalSet.has(v));

  // 3. Years available
  const allYears = [...new Set(sonomaOverall.map(yearLabel))].sort();

  /* ── Chart colors ──────────────────────────────────────────── */
  const COLORS = ["#8B5E3C", "#C4A050", "#5B8C5A", "#7A6A50", "#B07156", "#4A7C8F"];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: font, color: T.ink }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <NavBar />

      <article id="main-content" style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px 60px" }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: T.muted, textTransform: "uppercase", marginBottom: 8 }}>
          <a href="/under-the-hood" style={{ color: T.muted, textDecoration: "none" }}>Under the Hood</a> · Sonoma County Features
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily: serif, fontSize: "2.2rem", fontWeight: 700, color: T.ink, margin: "0 0 10px", lineHeight: 1.2 }}>
          Sonoma Grape Prices Fall for a Second Year as Cab Sauv Leads the Decline
        </h1>
        <p style={{ fontSize: 15, color: T.muted, margin: "0 0 6px" }}>
          March 21, 2026 · Sonoma County Features
        </p>
        <p style={{ fontSize: 14, color: T.muted, margin: "0 0 32px", fontStyle: "italic" }}>
          Live data from the NapaServe Community Data Commons · CDFA/USDA-NASS Grape Crush Report
        </p>

        {/* Lede */}
        <div style={{ borderLeft: `3px solid ${T.accent}`, paddingLeft: 20, marginBottom: 40 }}>
          <p style={{ fontFamily: serif, fontSize: 17, color: T.ink, lineHeight: 1.7, margin: 0 }}>
            Sonoma County's weighted average grape price fell for the second consecutive year in 2025, driven by declines in Cabernet Sauvignon and several key varietals. The charts below draw directly from CDFA crush report data to show how Sonoma's wine-grape economy is shifting — and how it compares to neighboring Napa County.
          </p>
        </div>

        {loading && <Spinner />}
        {error && <p style={{ color: "#C62828", fontSize: 15 }}>Error loading data: {error}</p>}

        {!loading && !error && (
          <>
            {/* ── Section 1: Overall Trend ─────────────────────────── */}
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "0 0 14px", lineHeight: 1.3 }}>The overall trend: down for the second straight year</h2>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
                Sonoma County grapes fetched a district-wide weighted average of $2,761 per ton in 2025, according to the preliminary CDFA crush report — down from $2,927 in 2024 and $2,975 in 2023. That is a 5.7% decline year-over-year, compounding a 1.6% drop the year before. Over two years the county has shed roughly $214 per ton in average grower returns.
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
                  return new window.Chart(ctx, {
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
              <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "0 0 14px", lineHeight: 1.3 }}>Varietal breakdown: Cab leads the decline</h2>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
                Cabernet Sauvignon, which commands the highest per-ton price among Sonoma red varietals, fell from $3,061 in 2023 to $2,773 in 2025 — a cumulative drop of nearly $289 per ton, or 9.4%. In a county where Cab anchors the premium tier, that slide reverberates through tasting-room margins and grape-purchase contracts alike.
              </p>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
                Pinot Noir, by contrast, dipped just 1.6% over the same two-year window — from $3,881 to $3,818. It remains the county's highest-priced varietal overall, reflecting the enduring strength of Russian River Valley and Sonoma Coast appellations for cool-climate Pinot.
              </p>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
                Chardonnay edged down from $2,560 to $2,429 (−5.1%), while Sauvignon Blanc fell from $2,054 to $1,904 (−7.3%). Of the major white varietals, Sauvignon Blanc saw the sharpest percentage decline — possibly reflecting oversupply pressure from Lake County and other value-oriented districts.
              </p>
            </div>

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
                  return new window.Chart(ctx, {
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
              <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "0 0 14px", lineHeight: 1.3 }}>Sonoma vs Napa: both counties declining, but at different speeds</h2>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
                Napa County's overall weighted average also fell — from $7,029 in 2023 to $6,768 in 2025, a decline of 3.7%. But Napa's slide is shallower in percentage terms than Sonoma's 7.2% cumulative decline over the same window. Both counties are adjusting to a cooler market after the pandemic-era price surge, but Napa's brand premium provides a wider cushion.
              </p>
              <p style={{ fontFamily: serif, fontSize: 16, color: T.ink, lineHeight: 1.75, margin: "0 0 12px" }}>
                The year-over-year chart below puts the two counties side by side. In 2024, Sonoma fell 1.6% while Napa dropped 1.3%. In 2025, the gap widened: Sonoma declined 5.7% versus Napa's 2.5%. The disparity suggests that mid-tier pricing regions face steeper pressure when the market softens.
              </p>
            </div>

            {/* ── Chart 3: Sonoma vs Napa % change ──────────────────── */}
            <Section eyebrow="Chart 3" title="Year-over-Year % Change — Sonoma vs Napa" note="Percentage change in district-wide weighted average price per ton. Negative values indicate price declines.">
              <div style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
                <ChartCanvas id="chart-pctchange" deps={[sonomaOverall, napaOverall]} buildChart={(ctx) => {
                  const calcPctChange = (rows) => {
                    const sorted = [...rows].sort((a, b) => a.period_start.localeCompare(b.period_start));
                    const changes = [];
                    for (let i = 1; i < sorted.length; i++) {
                      const prev = sorted[i - 1].value;
                      const curr = sorted[i].value;
                      changes.push({ year: yearLabel(sorted[i]), pct: prev > 0 ? ((curr - prev) / prev) * 100 : 0 });
                    }
                    return changes;
                  };
                  const sPct = calcPctChange(sonomaOverall);
                  const nPct = calcPctChange(napaOverall);
                  const years = [...new Set([...sPct.map(d => d.year), ...nPct.map(d => d.year)])].sort();

                  return new window.Chart(ctx, {
                    type: "bar",
                    data: {
                      labels: years,
                      datasets: [
                        {
                          label: "Sonoma County",
                          data: years.map(yr => { const m = sPct.find(d => d.year === yr); return m ? +m.pct.toFixed(2) : null; }),
                          backgroundColor: T.accent,
                          borderRadius: 3,
                        },
                        {
                          label: "Napa County",
                          data: years.map(yr => { const m = nPct.find(d => d.year === yr); return m ? +m.pct.toFixed(2) : null; }),
                          backgroundColor: T.gold,
                          borderRadius: 3,
                        },
                      ],
                    },
                    options: {
                      responsive: true,
                      plugins: { tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${c.parsed.y > 0 ? "+" : ""}${c.parsed.y.toFixed(1)}%` } } },
                      scales: { y: { ticks: { callback: v => `${v > 0 ? "+" : ""}${v}%` } } },
                    },
                  });
                }} />
              </div>
            </Section>

            {/* ── Section 4: Price gap ──────────────────────────────── */}
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "0 0 14px", lineHeight: 1.3 }}>The gap chart: Napa's premium over Sonoma is widening</h2>
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

                  return new window.Chart(ctx, {
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

            {/* ── Section 5: Caveats ───────────────────────────────── */}
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "0 0 14px", lineHeight: 1.3 }}>Caveats and what to watch</h2>
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

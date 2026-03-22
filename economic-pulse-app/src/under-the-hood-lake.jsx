// src/under-the-hood-lake.jsx
// Under the Hood: Lake County Grape Prices
// Lake County Features — March 2026
// Pulls live data from /api/community-data

import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import NavBar from "./NavBar";
import Footer from "./Footer";

Chart.register(...registerables);

// ── Theme ────────────────────────────────────────────────
const T = {
  bg:       "#F5F0E8",
  surface:  "#EDE8DE",
  ink:      "#2C1810",
  inkLight: "#5C4033",
  accent:   "#8B5E3C",
  gold:     "#C4A050",
  muted:    "#8B7355",
  rule:     "#D4C4A8",
  chartBg:  "#FAF6F0",
  green:    "#4a6741",
  amber:    "#b07d52",
  red:      "#8b2e2e",
  deep:     "#1a3a5c",
};

const FONTS = {
  heading: "'Libre Baskerville', Georgia, serif",
  body:    "'Source Sans 3', sans-serif",
  mono:    "monospace",
};

// ── Chart helpers ─────────────────────────────────────────
function useChart(ref, config, deps) {
  useEffect(() => {
    if (!ref.current) return;
    const chart = new Chart(ref.current, config);
    return () => chart.destroy();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

// ── Styles ────────────────────────────────────────────────
const s = {
  page: {
    background: T.bg,
    minHeight: "100vh",
    fontFamily: FONTS.body,
    color: T.ink,
  },
  masthead: {
    background: T.ink,
    color: T.bg,
    textAlign: "center",
    padding: "12px 24px",
    letterSpacing: "0.18em",
    fontFamily: FONTS.mono,
    fontSize: "10px",
    textTransform: "uppercase",
  },
  header: {
    maxWidth: "780px",
    margin: "0 auto",
    padding: "48px 24px 32px",
    borderBottom: `2px solid ${T.ink}`,
    textAlign: "center",
  },
  sectionLabel: {
    fontFamily: FONTS.mono,
    fontSize: "14px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: T.gold,
    marginBottom: "20px",
  },
  h1: {
    fontFamily: FONTS.heading,
    fontSize: "clamp(26px, 5vw, 42px)",
    fontWeight: "700",
    lineHeight: "1.18",
    color: T.ink,
    marginBottom: "20px",
    letterSpacing: "-0.01em",
  },
  deck: {
    fontFamily: FONTS.body,
    fontSize: "17px",
    fontWeight: "300",
    lineHeight: "1.65",
    color: T.inkLight,
    maxWidth: "620px",
    margin: "0 auto 24px",
  },
  byline: {
    fontFamily: FONTS.mono,
    fontSize: "10px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: T.muted,
    borderTop: `1px solid ${T.rule}`,
    paddingTop: "16px",
  },
  body: {
    maxWidth: "680px",
    margin: "0 auto",
    padding: "48px 24px 80px",
  },
  p: {
    marginBottom: "22px",
    color: T.inkLight,
    fontWeight: "300",
    fontSize: "17px",
    lineHeight: "1.75",
  },
  sectionBreak: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    margin: "40px 0 32px",
  },
  sectionBreakLabel: {
    fontFamily: FONTS.mono,
    fontSize: "9px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: T.muted,
    whiteSpace: "nowrap",
  },
  pullquote: {
    borderLeft: `3px solid ${T.accent}`,
    padding: "4px 0 4px 24px",
    margin: "36px 0",
  },
  pullquoteText: {
    fontFamily: FONTS.heading,
    fontSize: "20px",
    fontStyle: "italic",
    lineHeight: "1.5",
    color: T.ink,
    marginBottom: "8px",
  },
  chartBlock: {
    margin: "44px -24px",
    background: T.chartBg,
    borderTop: `1px solid ${T.rule}`,
    borderBottom: `1px solid ${T.rule}`,
    padding: "32px 32px 24px",
  },
  chartLabel: {
    fontFamily: FONTS.mono,
    fontSize: "9px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: T.accent,
    marginBottom: "6px",
  },
  chartTitle: {
    fontFamily: FONTS.heading,
    fontSize: "16px",
    fontWeight: "700",
    color: T.ink,
    marginBottom: "4px",
    lineHeight: "1.3",
  },
  chartSubtitle: {
    fontFamily: FONTS.body,
    fontSize: "13px",
    fontWeight: "300",
    color: T.muted,
    marginBottom: "20px",
    lineHeight: "1.4",
  },
  chartSource: {
    fontFamily: FONTS.mono,
    fontSize: "9px",
    color: T.muted,
    letterSpacing: "0.08em",
    marginTop: "14px",
    lineHeight: "1.5",
  },
  statRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1px",
    background: T.rule,
    border: `1px solid ${T.rule}`,
    margin: "40px 0",
  },
  statCell: {
    background: "#FAF8F5",
    padding: "20px 16px",
    textAlign: "center",
  },
  statNum: {
    fontFamily: FONTS.heading,
    fontSize: "28px",
    fontWeight: "700",
    color: T.accent,
    lineHeight: "1",
    marginBottom: "6px",
    display: "block",
  },
  statLabel: {
    fontFamily: FONTS.mono,
    fontSize: "9px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: T.muted,
    lineHeight: "1.4",
    display: "block",
  },
  footer: {
    borderTop: `1px solid ${T.rule}`,
    paddingTop: "24px",
    marginTop: "40px",
  },
  footerText: {
    fontSize: "12px",
    color: T.muted,
    fontStyle: "italic",
    lineHeight: "1.6",
    marginBottom: "8px",
  },
  loading: {
    textAlign: "center",
    padding: "80px 24px",
    color: T.muted,
    fontFamily: FONTS.body,
    fontSize: "15px",
  },
  error: {
    textAlign: "center",
    padding: "40px 24px",
    color: T.red,
    fontFamily: FONTS.body,
    fontSize: "14px",
  },
};

// ── Section break component ───────────────────────────────
function SectionBreak({ label }) {
  return (
    <div style={s.sectionBreak}>
      <div style={{ flex: 1, height: "1px", background: T.rule }} />
      <span style={s.sectionBreakLabel}>{label}</span>
      <div style={{ flex: 1, height: "1px", background: T.rule }} />
    </div>
  );
}

// ── Chart block wrapper ───────────────────────────────────
function ChartBlock({ num, title, subtitle, source, children }) {
  return (
    <div style={s.chartBlock}>
      <div style={s.chartLabel}>Chart {num} of 4</div>
      <div style={s.chartTitle}>{title}</div>
      <div style={s.chartSubtitle}>{subtitle}</div>
      {children}
      <div style={s.chartSource}>{source}</div>
    </div>
  );
}

// ── Chart.js config helpers ───────────────────────────────
const GRID = { color: "#D4C4A8", lineWidth: 0.5 };
const TICK = { font: { family: FONTS.mono, size: 10 }, color: T.muted };
const dollarTick = { ...TICK, callback: (v) => "$" + v.toLocaleString() };
const pctTick    = { ...TICK, callback: (v) => v + "%" };

// ── Main component ────────────────────────────────────────
export default function UnderTheHoodLake() {
  const [lakeData,  setLakeData]  = useState(null);
  const [napaData,  setNapaData]  = useState(null);
  const [sonoData,  setSonoData]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);
  const chart3Ref = useRef(null);
  const chart4Ref = useRef(null);

  // ── Fetch data ──────────────────────────────────────────
  useEffect(() => {
    async function fetchAll() {
      try {
        const base = "/api/community-data?domain=grape_crush";
        const [r1, r2, r3] = await Promise.all([
          fetch(`${base}&geography=Lake%20County`),
          fetch(`${base}&geography=Napa%20County`),
          fetch(`${base}&geography=Sonoma%20County`),
        ]);
        if (!r1.ok || !r2.ok || !r3.ok) throw new Error("API error");
        const [d1, d2, d3] = await Promise.all([r1.json(), r2.json(), r3.json()]);
        setLakeData(d1.rows);
        setNapaData(d2.rows);
        setSonoData(d3.rows);
      } catch (e) {
        setError("Failed to load data. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // ── Helper: get value from rows ─────────────────────────
  function val(rows, year, dimension) {
    if (!rows) return 0;
    const row = rows.find(
      (r) =>
        r.period_start.startsWith(year) &&
        (dimension ? r.dimension?.includes(dimension) : !r.dimension?.includes("varietal"))
    );
    return row?.value ?? 0;
  }

  function overallVal(rows, year) {
    if (!rows) return 0;
    const row = rows.find(
      (r) => r.period_start.startsWith(year) && r.dimension?.match(/^district\|\d+$/)
    );
    return row?.value ?? 0;
  }

  // ── Chart 1: Overall trend ──────────────────────────────
  useChart(chart1Ref, {
    type: "bar",
    data: {
      labels: ["2023", "2024", "2025 (Prelim.)"],
      datasets: [{
        label: "Weighted Avg $/ton",
        data: [
          overallVal(lakeData, "2023"),
          overallVal(lakeData, "2024"),
          overallVal(lakeData, "2025"),
        ],
        backgroundColor: [T.green, T.amber, T.red],
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: TICK, border: { color: T.rule } },
        y: { grid: GRID, ticks: dollarTick, border: { display: false }, min: 0 },
      },
    },
  }, [lakeData]);

  // ── Chart 2: Chardonnay detail (unique to Lake) ─────────
  useChart(chart2Ref, {
    type: "bar",
    data: {
      labels: ["2023", "2024", "2025 (Prelim.)"],
      datasets: [{
        label: "Chardonnay $/ton",
        data: [
          val(lakeData, "2023", "Chardonnay"),
          val(lakeData, "2024", "Chardonnay"),
          val(lakeData, "2025", "Chardonnay"),
        ],
        backgroundColor: [T.green, T.amber, T.red],
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` $${ctx.parsed.y.toLocaleString("en-US", { minimumFractionDigits: 2 })} / ton`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: TICK, border: { color: T.rule } },
        y: { grid: GRID, ticks: dollarTick, border: { display: false }, min: 0 },
      },
    },
  }, [lakeData]);

  // ── Chart 3: Varietal % change 2023-2025 ────────────────
  const varietals = ["Cabernet Sauvignon", "Pinot Noir", "Chardonnay", "Sauvignon Blanc", "Cabernet Franc"];
  const lakeChg = varietals.map((v) => {
    const a = val(lakeData, "2023", v);
    const b = val(lakeData, "2025", v);
    return a ? +((b - a) / a * 100).toFixed(1) : 0;
  });
  const sonoChg = varietals.map((v) => {
    const a = val(sonoData, "2023", v);
    const b = val(sonoData, "2025", v);
    return a ? +((b - a) / a * 100).toFixed(1) : 0;
  });

  useChart(chart3Ref, {
    type: "bar",
    data: {
      labels: ["Cab Sauv", "Pinot Noir", "Chardonnay", "Sauv Blanc", "Cab Franc"],
      datasets: [
        {
          label: "Lake County",
          data: lakeChg,
          backgroundColor: "rgba(74,103,65,0.85)",
          borderWidth: 0,
          borderRadius: 2,
        },
        {
          label: "Sonoma County",
          data: sonoChg,
          backgroundColor: "rgba(176,125,82,0.85)",
          borderWidth: 0,
          borderRadius: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          align: "end",
          labels: { font: { family: FONTS.mono, size: 10 }, boxWidth: 12, padding: 16 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y > 0 ? "+" : ""}${ctx.parsed.y}%`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { ...TICK, maxRotation: 0 }, border: { color: T.rule } },
        y: { grid: GRID, ticks: pctTick, border: { display: false } },
      },
    },
  }, [lakeData, sonoData]);

  // ── Chart 4: Three-county comparison 2025 ───────────────
  const prices2025 = {
    lake:  varietals.map((v) => val(lakeData, "2025", v)),
    sonoma: varietals.map((v) => val(sonoData,  "2025", v)),
    napa:  varietals.map((v) => val(napaData,  "2025", v)),
  };

  useChart(chart4Ref, {
    type: "bar",
    data: {
      labels: ["Cab Sauv", "Pinot Noir", "Chardonnay", "Sauv Blanc", "Cab Franc"],
      datasets: [
        {
          label: "Lake County",
          data: prices2025.lake,
          backgroundColor: "rgba(74,103,65,0.9)",
          borderWidth: 0,
          borderRadius: 2,
        },
        {
          label: "Sonoma County",
          data: prices2025.sonoma,
          backgroundColor: "rgba(176,125,82,0.85)",
          borderWidth: 0,
          borderRadius: 2,
        },
        {
          label: "Napa County",
          data: prices2025.napa,
          backgroundColor: "rgba(122,79,46,0.85)",
          borderWidth: 0,
          borderRadius: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          align: "end",
          labels: { font: { family: FONTS.mono, size: 10 }, boxWidth: 12, padding: 16 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { ...TICK, maxRotation: 0 }, border: { color: T.rule } },
        y: { grid: GRID, ticks: dollarTick, border: { display: false }, min: 0 },
      },
    },
  }, [lakeData, napaData, sonoData]);

  // ── Render ────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={s.page}>
        <NavBar />
        <div style={s.loading}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⟳</div>
          Loading community data…
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div style={s.page}>
        <NavBar />
        <div style={s.error}>{error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={s.page}>
      <NavBar />

      {/* Masthead */}
      <div style={s.masthead}>
        Lake County Features &nbsp;·&nbsp; Under the Hood &nbsp;·&nbsp; March 2026
      </div>

      {/* Header */}
      <div style={s.header}>
        <div style={s.sectionLabel}>Under the Hood</div>
        <h1 style={s.h1}>
          Lake County Grape Prices Have Fallen 38% in Two Years — and Chardonnay Has Nearly Vanished
        </h1>
        <p style={s.deck}>
          The preliminary 2025 crush report shows Lake County's district-wide weighted average
          dropping to $1,165 per ton — down 38% from 2023 — as buyer withdrawal accelerates
          across nearly every varietal. Chardonnay, which briefly surged in 2024, collapsed
          76.8% in a single year to $288 per ton.
        </p>
        <div style={s.byline}>
          By Tim Carl &nbsp;·&nbsp; Lake County Features &nbsp;·&nbsp; March 21, 2026
          <br />
          <span style={{ fontStyle: "italic", letterSpacing: "0.05em" }}>
            Live data from the NapaServe Community Data Commons · CDFA/USDA-NASS Grape Crush Report
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={s.body}>

        <p style={s.p}>
          <strong>LAKE COUNTY, Calif.</strong> — The <a href="https://www.nass.usda.gov/Statistics_by_State/California/Publications/Grape_Crush/index.php" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>2025 preliminary grape crush report</a>, published by the California Department of
          Food and Agriculture in cooperation with USDA's National Agricultural Statistics
          Service, shows Lake County's district-wide weighted average price falling to $1,165.52
          per ton — down 5.7% from 2024 and 37.9% below the 2023 figure of $1,877.76.
        </p>

        <p style={s.p}>
          That two-year decline is the steepest of the three North Coast districts examined in
          this series. <a href="/under-the-hood/napa-cab-2025" style={{ color: T.accent }}>Napa County</a>'s overall average fell 3.7% over the same period. <a href="/under-the-hood/sonoma-cab-2025" style={{ color: T.accent }}>Sonoma County</a>'s fell 7.2%. Lake County's fell nearly five times faster than Napa's and more
          than five times faster than Sonoma's.
        </p>

        <p style={s.p}>
          The data point to something more than a soft market. They suggest a structural
          withdrawal of buyers — particularly for red wine grapes — that is reordering the
          economics of Lake County viticulture faster than growers or lenders may have
          anticipated.
        </p>

        {/* Chart 1 */}
        <ChartBlock
          num="1"
          title="Lake County District-Wide Weighted Average Price, 2023–2025"
          subtitle="All varietals, dollars per ton. Source: CDFA/USDA-NASS Grape Crush Reports."
          source="Source: CDFA/USDA-NASS Grape Crush Reports, 2023–2025. 2025 figures preliminary pending final report April 30, 2026."
        >
          <canvas ref={chart1Ref} height={220} />
        </ChartBlock>

        <SectionBreak label="The Chardonnay Collapse" />

        <p style={s.p}>
          No varietal tells Lake County's 2025 story more starkly than chardonnay. In 2023,
          Lake County growers received $964.97 per ton for chardonnay — already well below the
          Sonoma average of $2,559.87 and the Napa average of $3,690.32, but a viable price
          point for lower-cost operations.
        </p>

        <p style={s.p}>
          In 2024, the chardonnay price rose sharply to $1,241.12 per ton — a 28.6% increase
          that suggested a possible recovery in buyer interest. That signal proved misleading.
          In 2025, the weighted average collapsed to $287.65 per ton — a single-year decline of
          76.8%, the most severe of any varietal in any North Coast district in the three-year
          dataset.
        </p>

        <p style={s.p}>
          At $287.65 per ton, the chardonnay average approaches — and in many operations may
          fall below — the cost of harvest and hauling alone. For growers who contracted at
          2024 prices or made planting decisions based on that year's improvement, the 2025
          figure represents a severe and potentially unrecoverable loss.
        </p>

        {/* Chart 2 */}
        <ChartBlock
          num="2"
          title="Lake County Chardonnay: The Rise and Collapse, 2023–2025"
          subtitle="Weighted average grower return per ton. The 2024 recovery reversed entirely in 2025."
          source="Source: CDFA/USDA-NASS Grape Crush Reports, Table 6, District 2. 2025 preliminary."
        >
          <canvas ref={chart2Ref} height={220} />
        </ChartBlock>

        <SectionBreak label="Varietal by Varietal" />

        <p style={s.p}>
          <strong>Cabernet sauvignon</strong> fell 49.6% over two years, from $2,322.04 to
          $1,171.26 per ton. At roughly $1,171 per ton, Lake County cab sauv commands just
          15.4% of the Napa price and 42.2% of the Sonoma price for the same varietal. The
          appellation discount is not a gradual differential — it is a structural reality that
          shapes what Lake County growers can plant, borrow and plan around.
        </p>

        <p style={s.p}>
          <strong>Pinot noir</strong> declined 39.6%, from $2,230.73 to $1,347.39 per ton.
          Unlike Sonoma, where pinot noir is the county's strongest card and commands a premium
          over Napa, Lake County pinot noir sits well below both neighbors. Sonoma received
          $3,817.65 per ton for pinot noir in 2025 — 2.8 times the Lake County figure.
        </p>

        <p style={s.p}>
          <strong>Sauvignon blanc</strong> is the relative bright spot — the only varietal that
          declined by less than 20% over the two-year period, falling 16% from $1,424.21 to
          $1,195.73. The variety remains a thin market in Lake County by tonnage, but its
          relative resilience is worth noting.
        </p>

        <p style={s.p}>
          <strong>Cabernet franc</strong> declined 23.2%, from $2,352.49 to $1,807.31. The
          variety showed strength in both Napa and Sonoma — rising 4.7% and 3.4% respectively
          — but Lake County did not participate in that trend.
        </p>

        <div style={s.statRow}>
          <div style={s.statCell}>
            <span style={s.statNum}>−49.6%</span>
            <span style={s.statLabel}>Cab Sauv<br />2023–2025</span>
          </div>
          <div style={s.statCell}>
            <span style={s.statNum}>−70.2%</span>
            <span style={s.statLabel}>Chardonnay<br />2023–2025</span>
          </div>
          <div style={s.statCell}>
            <span style={s.statNum}>−16.0%</span>
            <span style={s.statLabel}>Sauv Blanc<br />2023–2025</span>
          </div>
        </div>

        {/* Chart 3 */}
        <ChartBlock
          num="3"
          title="Price Change 2023–2025: Lake County vs. Sonoma County by Varietal"
          subtitle="Percentage change in weighted average grower return per ton."
          source="Source: CDFA/USDA-NASS Grape Crush Reports, Table 6. 2025 preliminary."
        >
          <canvas ref={chart3Ref} height={260} />
        </ChartBlock>

        <SectionBreak label="The Appellation Gap" />

        <p style={s.p}>
          The fourth chart in this series places Lake County in the context of all three North
          Coast districts. The price gaps are large enough to reshape how buyers, lenders and
          growers in each county approach the same crop.
        </p>

        <p style={s.p}>
          For cabernet sauvignon, Napa County growers received 7.6 times what Lake County
          growers received in 2025. For chardonnay — the most extreme case — Napa received
          12.8 times the Lake County price and Sonoma received 8.4 times. These are not
          marginal differences. They reflect fundamentally different market positions.
        </p>

        <div style={s.pullquote}>
          <p style={s.pullquoteText}>
            "District average prices throughout the North Coast are not representative of the spot market prices for new contracts for the second consecutive year."
          </p>
          <div style={{ fontFamily: FONTS.mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: T.muted }}>
            — Christian Klier, North Coast, <a href="https://www.turrentinebrokerage.com" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Turrentine Brokerage</a>, <a href="https://www.winebusiness.com/content/file/2025_Crush_Report_Press_Release(1).pdf" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>"The 2025 Crop Was Down an Equivalent of 72 Million Cases From the Five-Year Average,"</a> Wine Business, March 13, 2026.
          </div>
        </div>

        <p style={s.p}>
          For Lake County growers, the comparison is not simply discouraging — it is
          clarifying. The market has signaled which appellations command sustained buyer
          interest and which do not. At current price levels, the economics of planting or
          maintaining vineyards in Lake County depend heavily on cost structure, water access,
          existing contract terms and the specific varietal mix of each operation.
        </p>

        {/* Chart 4 */}
        <ChartBlock
          num="4"
          title="2025 Weighted Average Price by Varietal: Lake, Sonoma and Napa Counties"
          subtitle="Dollars per ton. All three North Coast districts side by side."
          source="Source: CDFA/USDA-NASS 2025 Preliminary Grape Crush Report, Table 6."
        >
          <canvas ref={chart4Ref} height={280} />
        </ChartBlock>

        <SectionBreak label="The Broader Picture" />

        <p style={s.p}>
          The statewide picture offers context. California crushed 2.62 million tons in 2025 — 8% below 2024 and 23% below the five-year average of 3.6 million tons, the lightest harvest since 1999. For the wine industry overall, that reduction in supply is welcome. "The decrease in tons is still very positive news for the industry overall," said Steve Fredricks, president of <a href="https://www.turrentinebrokerage.com" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Turrentine Brokerage</a>, in a March 13, 2026 market assessment. But Turrentine's own North Coast analyst flagged a critical caveat: published district averages overstate what growers negotiating new contracts actually receive. For Sonoma County chardonnay, the published district average of $2,370 contrasts with spot market prices closer to $800 per ton — a gap of more than 65%. The same disconnect between published averages and actual spot market prices applies in Lake County, where the district average already sits well below neighboring appellations.
        </p>

        <p style={s.p}>
          For consumers, the dynamics are mixed. A lighter harvest and lower grape prices can eventually translate to more accessible wine at retail — but that benefit moves slowly through the supply chain, and only if growers remain solvent long enough to plant and tend future vintages. The more immediate market signal is a shift toward lighter white varieties: Sauvignon Blanc tonnage increased 22,000 tons statewide in 2025 and Pinot Gris rose 8,000 tons, even as red varieties contracted sharply. Audra Cooper, vice president at Turrentine, described the season as representing "continued challenges for growers and wineries that were strikingly apparent at harvest."
        </p>

        <SectionBreak label="What the Data Don't Show" />

        <p style={s.p}>
          The CDFA weighted average figures blend multi-year contracts signed at earlier price
          levels with new deals negotiated in current market conditions. Turrentine Brokerage
          has noted for the second consecutive year that district averages are not
          representative of spot market prices for new contracts. The published averages
          overstate what growers entering or renegotiating agreements are likely to receive.
        </p>

        <p style={s.p}>
          The broader context compounds the concern. California's 2025 harvest was the lightest
          since 1999, down 23% from the five-year average. An estimated 57,000 acres were
          removed statewide. In Lake County, where margins are already compressed, the decision
          to leave fruit unpicked or remove vines entirely represents a calculation that the
          cost of farming exceeds the return available in today's market.
        </p>

        <p style={s.p}>
          What the crush report cannot show is how many Lake County acres are being quietly
          idled, how many contracts are under legal dispute and how many growers are
          approaching the limits of what their lenders will carry. Those figures will emerge
          in other data — foreclosure filings, vineyard sales, labor employment numbers — over
          the months ahead.
        </p>

        <p style={s.p}>
          For now, the crush data establish the baseline: Lake County's weighted average grape
          price has declined nearly 38% in two years, the most severe contraction of any North
          Coast district in the period examined. The county's wine-grape economy has entered a
          different phase, and the data suggest that phase has not yet run its course.
        </p>

        <SectionBreak label="Related Coverage" />

        <div style={{ marginBottom: 36 }}>
          <div style={{ marginBottom: 12 }}>
            <a href="/under-the-hood/napa-cab-2025" style={{ fontFamily: FONTS.heading, fontSize: "15px", fontWeight: 700, color: T.accent, textDecoration: "none", lineHeight: "1.4" }}>
              "2025 Napa Grape Prices Slip After a Record High"
            </a>
            <span style={{ fontSize: "14px", color: T.muted }}> — Napa Valley Features</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <a href="/under-the-hood/sonoma-cab-2025" style={{ fontFamily: FONTS.heading, fontSize: "15px", fontWeight: 700, color: T.accent, textDecoration: "none", lineHeight: "1.4" }}>
              "Sonoma Grape Prices Fall for a Second Year as Cab Sauv Leads the Decline"
            </a>
            <span style={{ fontSize: "14px", color: T.muted }}> — Sonoma County Features</span>
          </div>
        </div>

        {/* Footer */}
        <div style={s.footer}>
          <p style={s.footerText}>
            All price figures are weighted average grower returns per ton, delivered basis,
            for non-related purchased tonnage, from CDFA/USDA-NASS Grape Crush Report Table 6.
            Lake County corresponds to District 2. 2025 figures are preliminary pending the
            CDFA final report, expected April 30, 2026. District averages blend multi-year
            contracts with spot transactions and may overstate prices available to growers
            entering new agreements. Data served live from the NapaServe Community Data Commons.
          </p>
          <p style={s.footerText}>
            Tim Carl is a Napa Valley-based photojournalist. This article is part of an ongoing
            series examining North Coast grape economics across Napa Valley Features, Sonoma
            County Features and Lake County Features.
          </p>
        </div>

      </div>
      <Footer />
    </div>
  );
}

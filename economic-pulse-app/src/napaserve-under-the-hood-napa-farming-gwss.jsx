// UNDER THE HOOD — A Tough Year on Napa's Farms, and a Pest That Could Make It Worse
// Slug: napa-farming-2026-gwss
// Publication: Napa Valley Features
// Built from under-the-hood-template.jsx per UTH Protocol single-prompt build.

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chart, registerables } from "chart.js";
import NavBar from "./NavBar";
import Footer from "./Footer";
import useDraftGate from "./hooks/useDraftGate";
import DraftBanner from "./components/DraftBanner";

Chart.register(...registerables);

const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";

const ARTICLE_SLUG = "napa-farming-2026-gwss";
const ARTICLE_DATE = "May 26, 2026";
const PUBLICATION = "Napa Valley Features";
const SUBSTACK_URL = "https://napavalleyfocus.substack.com/";
const DATELINE_LOCATION = "NAPA VALLEY, Calif.";
const SHOW_DECK = true;

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

// eslint-disable-next-line no-unused-vars
const SECTIONS = [
  "Why This Detection Matters More Than Usual",
  "What the Fields Look Like Right Now",
  "A Public Nuisance, Defined",
  "The Removal Numbers",
  "More Than One Pathogen",
  "The Threat Still Outside the Gate",
  "The Over-Correction Question",
  "What to Watch Next",
];

const CHART1_TITLE = "California Winegrape Acreage by Bearing Status, 2023–2025";
const CHART2_TITLE = "California Winegrape Removals by County, October 2024 – August 2025";

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
  ctx.fillText("napaserve.org", off.width - 24, off.height - 14);
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
              <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>{s.label}</a>
              {i < sources.length - 1 ? "; " : "."}
            </span>
          ))}
        </>
      )}
    </p>
  );
}

// ── CHART 1 — Bearing vs Non-Bearing Acreage 2023–2025 ─────────────
function ChartOne() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = ["2023", "2024", "2025"];
    const bearing = [525000, 500000, 480000];
    const nonBearing = [85000, 80000, 60000];

    const valueLabelPlugin = {
      id: "c1_value_labels",
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        ctx.font = "600 11px 'Source Sans 3', sans-serif";
        ctx.fillStyle = T.ink;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        chart.data.datasets.forEach((ds, dsIdx) => {
          const meta = chart.getDatasetMeta(dsIdx);
          meta.data.forEach((bar, i) => {
            const v = ds.data[i];
            const label = (v / 1000).toFixed(0) + "K";
            ctx.fillText(label, bar.x, bar.y - 4);
          });
        });
        ctx.restore();
      },
    };

    const annotationPlugin = {
      id: "c1_yoy_annotations",
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        ctx.font = "bold 10px 'Source Sans 3', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        const bearingMeta = chart.getDatasetMeta(0);
        const bearingBar = bearingMeta.data[2];
        ctx.fillStyle = T.accent;
        ctx.fillText("−5.6% YoY", bearingBar.x, bearingBar.y - 20);
        const nbMeta = chart.getDatasetMeta(1);
        const nbBar = nbMeta.data[2];
        ctx.fillStyle = "#9B8030";
        ctx.fillText("−25% YoY", nbBar.x, nbBar.y - 20);
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Bearing", data: bearing, backgroundColor: T.accent, borderRadius: 2 },
          { label: "Non-Bearing", data: nonBearing, backgroundColor: T.gold, borderRadius: 2 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 32 } },
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 14, color: T.ink, font: { size: 12 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} acres`,
            },
          },
        },
        scales: {
          x: { ticks: { color: T.ink, font: { size: 12 } }, grid: { color: T.rule } },
          y: {
            min: 0,
            max: 650000,
            ticks: {
              callback: (v) => (v / 1000).toFixed(0) + "K",
              color: T.muted,
              font: { size: 11 },
            },
            grid: { color: T.rule },
            title: { display: true, text: "Acres", color: T.muted, font: { size: 11 } },
          },
        },
      },
      plugins: [valueLabelPlugin, annotationPlugin],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>{CHART1_TITLE}</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 480, position: "relative", height: 360 }}>
            <canvas ref={canvasRef} id="chart-bearing-nonbearing" aria-label="Grouped bar chart showing California winegrape bearing and non-bearing acreage from 2023 to 2025" role="img" />
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-1__nvf-napa-farming-gwss.png", CHART1_TITLE)} />
      <p style={{ fontFamily: font, fontSize: 11, color: T.muted, marginTop: 6 }}>Mobile users: scroll horizontally to view full chart.</p>
      <Caption
        title={CHART1_TITLE}
        description="Total California winegrape acreage fell 11.5% over two years, but the contraction was uneven: bearing acreage declined 5.6% year over year in 2025, while non-bearing acreage — vines planted in the past three years and not yet producing fruit — fell 25%. The collapse in non-bearing acreage is the leading indicator of replant pullback. [VERIFY: confirm 2023 and 2024 bearing/non-bearing split against CDFA April 22, 2026 report]"
        sources={[
          { label: "USDA NASS / CDFA California Grape Acreage Report, April 22, 2026", url: "https://www.edhat.com/california/news/californias-wine-grape-acreage-drops-in-2025-as-industry-struggles-continue-new-report-shows/" },
        ]}
      />
    </div>
  );
}

// ── CHART 2 — County Removals Leaderboard ───────────────────────────
function ChartTwo() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = ["San Joaquin", "Fresno", "Monterey", "Napa"];
    const data = [7796, 6250, 3781, 3117];
    const colors = [T.accent, T.accent, T.accent, T.gold];

    const valueLabelPlugin = {
      id: "c2_value_labels",
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta || !meta.data.length) return;
        ctx.save();
        ctx.font = "600 11px 'Source Sans 3', sans-serif";
        ctx.textBaseline = "middle";
        meta.data.forEach((bar, i) => {
          const v = data[i];
          const txt = v.toLocaleString();
          ctx.fillStyle = T.ink;
          ctx.textAlign = "left";
          ctx.fillText(txt, bar.x + 6, bar.y);
          if (i === 3) {
            const valueWidth = ctx.measureText(txt).width;
            ctx.font = "italic 10px 'Source Sans 3', sans-serif";
            ctx.fillStyle = T.gold;
            ctx.fillText("~7.7% of county footprint", bar.x + 6 + valueWidth + 8, bar.y);
            ctx.font = "600 11px 'Source Sans 3', sans-serif";
          }
        });
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderRadius: 2 }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 80 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.parsed.x.toLocaleString()} acres removed`,
            },
          },
        },
        scales: {
          x: {
            min: 0,
            max: 8500,
            ticks: {
              callback: (v) => v.toLocaleString(),
              color: T.muted,
              font: { size: 11 },
            },
            grid: { color: T.rule },
            title: { display: true, text: "Acres removed", color: T.muted, font: { size: 11 } },
          },
          y: {
            ticks: {
              color: (c) => (c.tick && c.tick.label === "Napa" ? T.gold : T.muted),
              font: (c) =>
                c.tick && c.tick.label === "Napa"
                  ? { size: 12, weight: "bold", family: "'Source Sans 3', sans-serif" }
                  : { size: 11, family: "'Source Sans 3', sans-serif" },
            },
            grid: { display: false },
          },
        },
      },
      plugins: [valueLabelPlugin],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>{CHART2_TITLE}</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 480, position: "relative", height: 280 }}>
            <canvas ref={canvasRef} id="chart-county-removals" aria-label="Horizontal bar chart ranking four California counties by winegrape acres removed between October 2024 and August 2025, with Napa highlighted in gold" role="img" />
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-2__nvf-napa-farming-gwss.png", CHART2_TITLE)} />
      <p style={{ fontFamily: font, fontSize: 11, color: T.muted, marginTop: 6 }}>Mobile users: scroll horizontally to view full chart.</p>
      <Caption
        title={CHART2_TITLE}
        description="San Joaquin led California with 7,796 acres removed, followed by Fresno at 6,250 and Monterey at 3,781. Napa removed 3,117 acres — roughly 7.7% of the county's winegrape footprint."
        sources={[
          { label: "2025 Standing Winegrape Acreage Report, Land IQ for CAWG", url: "https://robbreport.com/food-drink/wine/california-winemakers-removing-acres-vines-1237351654/" },
        ]}
      />
    </div>
  );
}

// ── LIVE POLL ────────────────────────────────────────────────────────
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
    } catch(e) { /* silent */ }
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

// ── POLLS SECTION ────────────────────────────────────────────────────
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
        Historical reader polls from Napa Valley Features on Substack are searchable in the{" "}
        <a href="/dashboard" style={{ color: T.accent }}>Community Pulse dashboard</a>.
      </p>
    </div>
  );
}

// ── MAIN COMPONENT ──────────────────────────────────────────────────
export default function UnderTheHoodNapaFarmingGwss() {
  const navigate = useNavigate();
  const status = useDraftGate(ARTICLE_SLUG);
  const isDraft = status === "draft";

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

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      {isDraft && <DraftBanner />}
      <NavBar />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: isDraft ? "80px 20px 60px" : "60px 20px 60px" }}>

        {/* ── EYEBROW ──────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          Under the Hood · {PUBLICATION}
        </p>

        {/* ── HEADLINE ─────────────────────────────────────── */}
        <h1 style={{ fontFamily: serif, fontSize: 34, fontWeight: 700, color: T.ink, lineHeight: 1.25, marginBottom: 16 }}>
          A Tough Year on Napa{"’"}s Farms, and a Pest That Could Make It Worse
        </h1>

        {/* ── BYLINE + DATE ────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.muted, marginBottom: 16 }}>
          By Tim Carl · {ARTICLE_DATE}
        </p>

        {/* ── DECK ─────────────────────────────────────────── */}
        {SHOW_DECK && (
          <p style={{ fontFamily: serif, fontSize: 18, color: T.muted, lineHeight: 1.6, marginBottom: 24, fontStyle: "italic" }}>
            One hundred fifty-seven grapevines are unaccounted for, the valley is already losing ground to disease and removals, and the question is no longer whether the over-correction comes — it is when.
          </p>
        )}

        {/* ── SUBSTACK LINK ────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 13, color: T.muted, marginBottom: 32, borderBottom: `1px solid ${T.border}`, paddingBottom: 20 }}>
          Read on{" "}
          <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>
            {PUBLICATION} · Substack →
          </a>
        </p>

        {/* ── ARTICLE SUMMARY ──────────────────────────────── */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "16px 20px", marginBottom: 32 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Article Summary</p>
          <p style={{ ...prose, fontSize: 15, marginBottom: 0 }}>
            On May 26, the Napa County Agricultural Commissioner{"’"}s office confirmed that grapevines sold at the Napa Costco between April 21 and May 26 may carry the glassy-winged sharpshooter, a vector of the deadly Pierce{"’"}s disease. One hundred and fifty-seven of 220 plants are unaccounted for. The detection arrives in a year already defined by accelerating vineyard removals, elevated disease pressure across multiple crops and a light grape crop. For viticulturist Garrett Buckland, who has spent the past two years arguing that California{"’"}s vineyard contraction will eventually swing past balance into shortage, the question is no longer whether the over-correction comes. It is when.
          </p>
        </div>

        {/* ── BODY: DATELINE OPENING ───────────────────────── */}
        <p style={{ ...prose, marginBottom: 18 }}>
          <span style={{ fontWeight: 700 }}>{DATELINE_LOCATION} —</span>{" "}The Napa County Agricultural Commissioner{"’"}s office issued an urgent alert on May 26 — earlier than the office had planned — warning that grapevines sold at the Napa Costco between April 21 and May 26 may be carrying the glassy-winged sharpshooter, an invasive leafhopper that transmits Pierce{"’"}s disease, a bacterial infection that is generally fatal to grapevines.
        </p>
        <p style={prose}>
          The shipments came from Burchell Nursery, Inc., in Fresno County and totaled 220 grapevines. Sixty-three have been destroyed and one GWSS egg mass was confirmed. The remaining 157 plants are unaccounted for and may now be sitting in private yards across the county. Live-stage GWSS detections have also been reported on shipments from the same nursery to Sonoma, Marin, Solano and Yolo counties, according to the county statement.
        </p>
        <p style={prose}>
          {"“"}GWSS is a devastating pest for our local vineyards,{"”"} Napa County Agricultural Commissioner Tracy Cleveland said in the announcement. {"“"}It is critical for us to track down any potentially affected plants purchased at Costco or brought into Napa County.{"”"}
        </p>
        <p style={prose}>
          The county is asking anyone who purchased grapevines, citrus or other fruit trees at Napa Costco or neighboring Costco locations in April or May to isolate the plants in their original containers, leave them unplanted and call 707-253-4357 or email agcommissioner@countyofnapa.org. Background on Pierce{"’"}s disease and GWSS is available through the{" "}
          <a href="https://www.cdfa.ca.gov/pdcp/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>California Department of Food and Agriculture</a>.
        </p>
        <p style={prose}>
          <em style={{ color: "#8B7355", fontSize: "0.9em" }}>[VERIFY: confirm exact county press-release URL once posted on countyofnapa.org and add as inline link on first reference to the announcement.]</em>
        </p>

        {/* ── WHY THIS DETECTION MATTERS ────────────────────── */}
        <h2 style={h2style}>Why This Detection Matters More Than Usual</h2>
        <p style={prose}>
          GWSS has been a known California problem since 1989, when it was first identified in Orange and Ventura counties, and a state quarantine has restricted nursery-stock movement from infested southern counties ever since. CDFA reports that the pest spreads primarily as egg masses on nursery stock and feeds on a wide range of hosts, including citrus, almond and ornamental plants. According to{" "}
          <a href="http://ipm.ucanr.edu/PMG/PESTNOTES/pn7492.html" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>UC Statewide IPM</a>, once GWSS is established in an area, there are no effective cultural controls available to manage it.
        </p>
        <p style={prose}>
          What gives this Napa Costco detection a sharper edge is the channel. Retail-sold nursery stock sits outside the trade{"’"}s normal inspection and quarantine flow. The 220-plant shipment moved through a consumer entry point that the state{"’"}s GWSS containment system was not built to police in real time. The detection rate at retail is a function of how hard county inspectors look and how visible the life stage happens to be when they do.
        </p>
        <p style={prose}>
          The Costco detection is not the first signal that climate and trade pressures are widening Pierce{"’"}s disease risk in Napa. The column{" "}
          <a href="https://napavalleyfocus.substack.com/p/under-the-hood-climate-changes-growing" target="_blank" rel="noopener noreferrer" style={{ color: T.accent, fontStyle: "italic" }}>Climate Change{"’"}s Growing Impact on Napa Valley</a>{" "}
          (August 2024) documented how warmer winter nights have expanded GWSS populations and pushed grapevine red blotch disease deeper into the valley. The retail nursery-stock pathway is a new variable on top of a baseline that was already moving in the wrong direction.
        </p>

        {/* ── WHAT THE FIELDS LOOK LIKE RIGHT NOW ──────────── */}
        <h2 style={h2style}>What the Fields Look Like Right Now</h2>
        <p style={prose}>
          Drive the valley in late May and the variation across blocks tells most of the story.
        </p>

        {/* Photo 1 */}
        <img
          src="/photos/uth-napa-farming-gwss/photo-1.jpg"
          alt="An upvalley vineyard in late May with Mt. St. Helena behind, showing irregular leaf-out across an old block"
          style={{ width: "100%", borderRadius: 4, marginTop: 28, marginBottom: 8 }}
        />
        <p style={{ fontStyle: "italic", fontSize: 14, color: T.muted, marginTop: 0, marginBottom: 24 }}>
          An upvalley vineyard in late May with Mt. St. Helena behind, vines pushing irregular leaf-out across an old block — the uneven canopy and dry rows are the pattern across many blocks this spring — Tim Carl Photo
        </p>

        <p style={prose}>
          Healthy, actively farmed rows can sit immediately adjacent to blocks that have not been pruned, irrigated or cleaned up. In some cases, a block looks uniformly browned and leafless — a condition that, at a glance, suggests glyphosate application in preparation for tear-out.
        </p>
        <p style={prose}>
          The appearance is misleading. Garrett Buckland — a partner at Premiere Viticultural Services, the Napa Valley Grapegrowers{"’"} 2023 Grower of the Year and a member of the organization{"’"}s board — said the brown-canopy pattern visible across several blocks this spring is the result of a deliberate technique, not herbicide.
        </p>
        <p style={prose}>
          {"“"}Looks like they burned the canopy on purpose,{"”"} Buckland said in response to photos sent from a recent valley drive. {"“"}No leaves, no mildew. You could just do a high rate of sulfur on a hot day to burn off the canopy. Doesn{"’"}t look like a weed spray, but that{"’"}s an option too.{"”"}
        </p>
        <p style={prose}>
          The economic logic is straightforward. A clean, leafless block makes for {"“"}a cleaner burn pile{"”"} when the vines are pulled, Buckland said, and it is cheaper than continuing to spray for mildew on a block that will not produce a crop. On blocks too wet to do the groundwork conventionally, he has put goats on the vineyard. {"“"}Cheaper than spraying for mildew,{"”"} he said.
        </p>

        {/* Photo 2 */}
        <img
          src="/photos/uth-napa-farming-gwss/photo-2.jpg"
          alt="A mid-valley block showing rust-brown canopy burn signature with green new growth pushing through"
          style={{ width: "100%", borderRadius: 4, marginTop: 28, marginBottom: 8 }}
        />
        <p style={{ fontStyle: "italic", fontSize: 14, color: T.muted, marginTop: 0, marginBottom: 24 }}>
          A mid-valley block showing the rust-brown signature of a deliberate canopy burn under a hot day{"’"}s sulfur application, with green new growth pushing through above the burn line — Tim Carl Photo
        </p>

        <p style={prose}>
          Other blocks are partially leafed out but show stressed canopies, with brown patches mixed through green growth.
        </p>

        {/* Photo 3 */}
        <img
          src="/photos/uth-napa-farming-gwss/photo-3.jpg"
          alt="A block partway through tear-out north of St. Helena with canes mounded for burning"
          style={{ width: "100%", borderRadius: 4, marginTop: 28, marginBottom: 8 }}
        />
        <p style={{ fontStyle: "italic", fontSize: 14, color: T.muted, marginTop: 0, marginBottom: 24 }}>
          A block partway through tear-out north of St. Helena, canes mounded on the right for burning and the trellis still standing — Tim Carl Photo
        </p>

        <p style={prose}>
          Up close, the pattern looks less like a uniform spray-down and more like vines under specific stress: dead canes, scattered new growth, irregular leaf-out across an otherwise structured trellis.
        </p>

        {/* Photo 4 */}
        <img
          src="/photos/uth-napa-farming-gwss/photo-4.jpg"
          alt="A stressed canopy at the residential edge of the valley in late May"
          style={{ width: "100%", borderRadius: 4, marginTop: 28, marginBottom: 8 }}
        />
        <p style={{ fontStyle: "italic", fontSize: 14, color: T.muted, marginTop: 0, marginBottom: 24 }}>
          A stressed canopy at the residential edge of the valley in late May — Tim Carl Photo
        </p>

        <p style={prose}>
          In other places, full rows have been cleared, the canopy stripped down and the block readied for what comes next — replant, fallow or sale.
        </p>
        <p style={prose}>
          {"“"}Lots of vineyards out, and a very light crop this year,{"”"} Buckland said. He added that the pace of removal has outrun the contracting capacity to keep up with it: {"“"}Not enough contractors to pull everything.{"”"}
        </p>

        {/* ── A PUBLIC NUISANCE, DEFINED ────────────────────── */}
        <h2 style={h2style}>A Public Nuisance, Defined</h2>
        <p style={prose}>
          A vineyard mid-removal can resemble an abandoned one for weeks or months. The distinction matters legally and ecologically.
        </p>
        <p style={prose}>
          Under{" "}
          <a href="http://leginfo.legislature.ca.gov/faces/codesTOCSelected.xhtml?tocCode=FAC" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>California Food and Agricultural Code Section 5551</a>, a neglected or abandoned crop can be declared a public nuisance when it harbors pests, threatens regional agriculture or hosts quarantine species. County Agricultural Commissioners have the authority to investigate, issue notices and pursue abatement. Buckland said the relevant rules require basic maintenance and nuisance mitigation at the Ag Commissioner{"’"}s discretion, and noted that a more recent state law specifically addresses neglected vineyards.
        </p>
        <p style={prose}>
          <em style={{ color: "#8B7355", fontSize: "0.9em" }}>[VERIFY: identify the specific recent state law on abandoned/neglected vineyards Buckland referenced — pending Buckland follow-up. Cite by bill number once confirmed.]</em>
        </p>
        <p style={prose}>
          The Napa Valley Grapegrowers{"’"}{" "}
          <a href="https://www.napagrowers.org/bestpractices/best-practices-for-abandoned-and-neglected-vineyards" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Best Practices for Abandoned and Neglected Vineyards</a>{" "}
          guide, updated in June 2025, lays out the practical stakes. Unmaintained blocks become reservoirs for trunk diseases such as Eutypa, Botryosphaeria and Esca, host populations of leafhoppers, mealybugs and sharpshooters that vector Pierce{"’"}s disease and leafroll virus and provide habitat for rodents and invasive weeds. The guide also notes that a block slated for removal can temporarily resemble an abandoned site, and asks owners to communicate with neighbors and the Ag Commissioner if removal is delayed.
        </p>

        {/* ── THE REMOVAL NUMBERS ──────────────────────────── */}
        <h2 style={h2style}>The Removal Numbers</h2>
        <p style={prose}>
          The field conditions sit on top of a statewide trend that is now in its third year.
        </p>

        <ChartOne />

        <p style={prose}>
          According to the{" "}
          <a href="https://robbreport.com/food-drink/wine/california-winemakers-removing-acres-vines-1237351654/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>2025 Standing Winegrape Acreage report</a>{" "}
          from Land IQ, commissioned by the California Association of Winegrape Growers, California growers removed 38,194 acres of winegrapes between October 2024 and August 2025 — about 7% of the state{"’"}s winegrape acreage. San Joaquin County led with 7,796 acres pulled. Fresno followed with 6,250 acres. Monterey removed 3,781 acres and Napa removed 3,117 acres.
        </p>

        <ChartTwo />

        <p style={prose}>
          The April 22, 2026{" "}
          <a href="https://www.edhat.com/california/news/californias-wine-grape-acreage-drops-in-2025-as-industry-struggles-continue-new-report-shows/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>USDA NASS / CDFA California Grape Acreage Report</a>{" "}
          estimated California{"’"}s total winegrape acreage at 540,000 acres in 2025, down from 580,000 in 2024 and 610,000 in 2023. Bearing acreage fell 5.6% year over year. Non-bearing acreage fell 25%.
        </p>
        <p style={prose}>
          Jeff Bitter, president of Allied Grape Growers, told the Unified Wine and Grape Symposium in late January that{" "}
          <a href="https://www.farmprogress.com/grapes/california-on-track-to-raze-another-40-000-acres-of-vineyards" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>another 40,000 acres are expected to come out in 2026</a>. He estimated that{" "}
          <a href="https://napacountytimes.com/napa-valley-grapes-were-left-on-the-vine-this-harvest-while-acres-of-vineyards-have-been-pulled-over-the-past-year/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>8,000 acres in Napa County — roughly 20% of the county{"’"}s vineyard footprint — went unharvested in 2025</a>.
        </p>
        <p style={prose}>
          Readers can model the per-acre and regional economic impact of these removals with the{" "}
          <a href="/under-the-hood/calculators" style={{ color: T.accent }}>Vineyard Acre Impact Calculator</a>, which lets users enter their own tonnage, price and cost assumptions across three scenarios — skipped but maintained, removed without replanting, and removed and replanted.
        </p>
        <p style={prose}>
          The dollar logic of removal was developed in detail in{" "}
          <a href="https://napavalleyfocus.substack.com/p/under-the-hood-the-dismal-math-of" target="_blank" rel="noopener noreferrer" style={{ color: T.accent, fontStyle: "italic" }}>Under the Hood: The Dismal Math of Napa{"’"}s Unharvested Acres</a>{" "}
          (November 2025), which estimated that depending on how many acres are affected, the five-year regional output loss ranges from hundreds of millions to several billion dollars. The current season{"’"}s removal pace tracks the upper end of that range.
        </p>

        {/* ── MORE THAN ONE PATHOGEN ────────────────────────── */}
        <h2 style={h2style}>More Than One Pathogen</h2>
        <p style={prose}>
          Grapes are not the only crop under pressure this spring.
        </p>
        <p style={prose}>
          {"“"}Red blotch for sure still the number one problem for us,{"”"} Buckland said when asked what other pressures growers are tracking. {"“"}It{"’"}s a bad botrytis year due to the spring rains. Shaping up to be a bad mildew year as well. I lost 3 mature pear trees this year to fire blight.{"”"}
        </p>
        <p style={prose}>
          Red blotch is a viral disease that reduces fruit ripening and sugar accumulation in infected vines. Botrytis is a fungal rot that thrives in wet conditions during bloom. Mildew pressure tracks moisture and temperature patterns through spring. Fire blight, a bacterial infection caused by Erwinia amylovora, primarily affects pear and apple trees rather than grapevines. According to{" "}
          <a href="https://ipm.ucanr.edu/agriculture/pear/fire-blight/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>UC IPM</a>, fire blight advances quickly in warm, humid conditions and can take down a young orchard inside a single season.
        </p>
        <p style={prose}>
          <em style={{ color: "#8B7355", fontSize: "0.9em" }}>[VERIFY / SOURCE NEEDED: whether Buckland{"’"}s three-tree fire-blight loss reflects a broader 2026 pattern across Napa County pear and apple growers, or remains localized. Pending Buckland follow-up.]</em>
        </p>

        {/* ── THE THREAT STILL OUTSIDE THE GATE ────────────── */}
        <h2 style={h2style}>The Threat Still Outside the Gate</h2>
        <p style={prose}>
          The other pest on growers{"’"} minds in 2026 is one that has not yet established in California: the spotted lanternfly, an invasive planthopper first identified in Pennsylvania in 2014 that has since spread to at least 14 states.
        </p>
        <p style={prose}>
          A 2022 modeling study published in{" "}
          <a href="https://www.nature.com/articles/s42003-022-03447-0" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Communications Biology</a>{" "}
          estimated a low probability that the spotted lanternfly would first reach California{"’"}s grape-producing counties by 2027 and a high probability by 2033 without preventative management. The species feeds on grapevines, hops, stone fruit, walnuts and other commercially significant crops, and its preferred host, the tree-of-heaven, is present across Northern California.
        </p>
        <p style={prose}>
          The pest has already turned up at the state{"’"}s border. In March 2024,{" "}
          <a href="https://www.mastergardenersd.org/the-spotted-lanternfly-is-headed-our-way/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>30 viable spotted lanternfly egg masses were intercepted in Sonoma County</a>{" "}
          on equipment attempting to enter California — enough viable eggs to seed a founding population.
        </p>
        <p style={prose}>
          Both the Costco GWSS detection and the Sonoma lanternfly interception share a structural feature: both moved through commercial channels — nursery stock in one case, transported equipment in the other — that are difficult to inspect comprehensively in real time.
        </p>

        {/* ── THE OVER-CORRECTION QUESTION ──────────────────── */}
        <h2 style={h2style}>The Over-Correction Question</h2>
        <p style={prose}>
          Buckland has been making a particular argument about California{"’"}s vineyard contraction for at least two years. In{" "}
          <a href="https://napavalleyfocus.substack.com/p/7-2024-harvest-report-reveals-a-grape" target="_blank" rel="noopener noreferrer" style={{ color: T.accent, fontStyle: "italic" }}>2024 Harvest Report Reveals a Grape Market Splitting in Two</a>{" "}
          (December 2025), he described the dynamic this way: {"“"}Some of that is natural — older vineyards coming out at the end of their lifespan — but we{"’"}re also seeing growers pull vines early because they{"’"}re too costly to farm and don{"’"}t fit the market. If you{"’"}re in an expensive-to-farm area and can{"’"}t sell to the high end or compete at the commodity level, there aren{"’"}t many off-ramps.{"”"}
        </p>
        <p style={prose}>
          The market context for that argument was developed across several earlier Under the Hood installments —{" "}
          <a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-countys-wine" target="_blank" rel="noopener noreferrer" style={{ color: T.accent, fontStyle: "italic" }}>Napa County{"’"}s Wine Market Is Clearing, Not Recovering</a>{" "}
          (April 2026),{" "}
          <a href="https://napavalleyfocus.substack.com/p/under-the-hood-wine-supply-outruns" target="_blank" rel="noopener noreferrer" style={{ color: T.accent, fontStyle: "italic" }}>Wine Supply Outruns Demand</a>{" "}
          (December 2025),{" "}
          <a href="/under-the-hood/napa-cab-2025" style={{ color: T.accent, fontStyle: "italic" }}>Napa Cabernet Prices Break the Growth Curve</a>{" "}
          (March 2026) and{" "}
          <a href="/under-the-hood/napa-supply-chain-2026" style={{ color: T.accent, fontStyle: "italic" }}>How a Global Supply Shock Reaches Napa Valley</a>{" "}
          (March 2026). The collective picture: the market remains structurally long, with roughly 30% of California winegrapes uncontracted in 2025 and a market that needs to lose meaningful volume before clearing.
        </p>
        <p style={prose}>
          Buckland{"’"}s argument is not that the over-correction has arrived. It is that the variables driving removal — economic pressure on growers in expensive-to-farm regions, narrowing buyer universes, climate-driven yield variability and now a new pest vector entering on retail-sold nursery stock — are not all moving in the same direction as the demand-side correction. Removal is moving on a faster clock than replanting. Disease pressure is involuntary and harder to reverse. The two clocks running together change the arithmetic.
        </p>
        <p style={prose}>
          <em style={{ color: "#8B7355", fontSize: "0.9em" }}>[VERIFY: Buckland on-record framing of the 3-year / 5-year / 10-year / never question — pending follow-up. Replace this paragraph or extend it with his direct quote once received.]</em>
        </p>

        {/* ── WHAT TO WATCH NEXT ────────────────────────────── */}
        <h2 style={h2style}>What to Watch Next</h2>
        <p style={prose}>
          The immediate question is whether any of the 157 unaccounted Costco grapevines turn up infested, and how quickly Napa County{"’"}s monitoring traps either confirm spread or close out the detection.
        </p>
        <p style={prose}>
          The longer question is the one Buckland has been asking for two years. With another 40,000 acres projected to come out across California in 2026, with this spring{"’"}s disease pressure compounding involuntary loss, and with a new vector entering through a retail channel the state{"’"}s containment system was not built to police, where in the curve are we now? Three years from a real supply problem? Five? Ten? Or do conditions keep moving the goalposts so the over-correction never lands?
        </p>
        <p style={prose}>
          Every block that comes out of production for economic reasons reduces capacity by choice. Every block that comes out for pest or disease reasons reduces it involuntarily. The arithmetic is the same. The path matters because involuntary removal is harder to reverse.
        </p>
        <p style={prose}>
          Residents who purchased plants at Napa Costco between April 21 and May 26 are asked to call 707-253-4357 or email agcommissioner@countyofnapa.org without planting, transporting, returning or composting the plants.
        </p>

        {/* ── BYLINE ───────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.ink, fontStyle: "italic", lineHeight: 1.65, margin: "28px 0 0 0" }}>
          Tim Carl is a Napa Valley-based photojournalist.
        </p>

        {/* ── POLLS ────────────────────────────────────────── */}
        <PollsSection slug={ARTICLE_SLUG} />

        {/* ── RELATED COVERAGE ─────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 48, paddingTop: 28, marginBottom: 28 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center", marginBottom: 20 }}>
            Related Coverage
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-climate-changes-growing" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Climate Change{"’"}s Growing Impact on Napa Valley{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> — Napa Valley Features, August 2024</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-the-dismal-math-of" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: The Dismal Math of Napa{"’"}s Unharvested Acres{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> — Napa Valley Features, November 2025</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-wine-supply-outruns" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Wine Supply Outruns Demand{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> — Napa Valley Features, December 2025</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/7-2024-harvest-report-reveals-a-grape" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}2024 Harvest Report Reveals a Grape Market Splitting in Two{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> — Napa Valley Features, December 2025</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-countys-wine" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Napa County{"’"}s Wine Market Is Clearing, Not Recovering{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> — Napa Valley Features, April 2026</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="/under-the-hood/napa-cab-2025" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Napa Cabernet Prices Break the Growth Curve{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> — NapaServe, March 2026</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="/under-the-hood/napa-supply-chain-2026" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: How a Global Supply Shock Reaches Napa Valley{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> — NapaServe, March 2026</span>
            </li>
          </ul>
        </div>

        {/* ── ARCHIVE SEARCH ───────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 28, paddingTop: 28, marginBottom: 28 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Archive
          </p>
          <h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 700, color: T.ink, margin: "0 0 8px 0" }}>Search Napa Valley Features</h2>
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

        {/* ── METHODOLOGY ──────────────────────────────────── */}
        <div style={{ borderTop: `2px solid ${T.border}`, paddingTop: 28, marginTop: 40 }}>
          <h3 style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: T.ink, margin: "0 0 10px" }}>Methodology</h3>
          <p style={{ fontFamily: font, fontSize: 14, color: T.muted, lineHeight: 1.7 }}>
            Field observations from drives through Napa Valley in late May 2026. Vineyard removal figures cited from the 2025 Standing Winegrape Acreage report (Land IQ for CAWG) and the April 22, 2026 USDA NASS / CDFA California Grape Acreage Report. GWSS detection details from the Napa County Agricultural Commissioner{"’"}s office press release of May 26, 2026. Disease pressure and field-technique observations attributed directly to Garrett Buckland, Premiere Viticultural Services. Cross-county pest-channel comparison drawn from CDFA and county press releases.
          </p>
        </div>

        {/* ── SOURCES ──────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 48, paddingTop: 24 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: T.ink, marginBottom: 16 }}>Sources</h2>
          <ol style={{ fontFamily: font, fontSize: 14, color: T.ink, lineHeight: 1.75, paddingLeft: 20 }}>
            <li style={{ marginBottom: 10 }}>Napa County Agricultural Commissioner press release, May 26, 2026. <em style={{ color: "#8B7355", fontSize: "0.9em" }}>[VERIFY URL pending county post]</em></li>
            <li style={{ marginBottom: 10 }}><a href="https://www.cdfa.ca.gov/pdcp/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>California Department of Food and Agriculture — Pierce{"’"}s Disease Control Program</a>.</li>
            <li style={{ marginBottom: 10 }}><a href="http://ipm.ucanr.edu/PMG/PESTNOTES/pn7492.html" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>UC Statewide Integrated Pest Management — Glassy-Winged Sharpshooter Pest Notes</a>.</li>
            <li style={{ marginBottom: 10 }}><a href="http://leginfo.legislature.ca.gov/faces/codesTOCSelected.xhtml?tocCode=FAC" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>California Food and Agricultural Code Section 5551</a>.</li>
            <li style={{ marginBottom: 10 }}><a href="https://www.napagrowers.org/bestpractices/best-practices-for-abandoned-and-neglected-vineyards" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa Valley Grapegrowers — Best Practices for Abandoned and Neglected Vineyards</a> (updated June 2025).</li>
            <li style={{ marginBottom: 10 }}><a href="https://robbreport.com/food-drink/wine/california-winemakers-removing-acres-vines-1237351654/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>2025 Standing Winegrape Acreage Report — Land IQ for CAWG, via Robb Report</a>.</li>
            <li style={{ marginBottom: 10 }}><a href="https://www.edhat.com/california/news/californias-wine-grape-acreage-drops-in-2025-as-industry-struggles-continue-new-report-shows/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>USDA NASS / CDFA California Grape Acreage Report, April 22, 2026 — via Edhat</a>.</li>
            <li style={{ marginBottom: 10 }}><a href="https://www.farmprogress.com/grapes/california-on-track-to-raze-another-40-000-acres-of-vineyards" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Jeff Bitter / Allied Grape Growers at Unified Wine and Grape Symposium 2026 — via Farm Progress</a>.</li>
            <li style={{ marginBottom: 10 }}><a href="https://napacountytimes.com/napa-valley-grapes-were-left-on-the-vine-this-harvest-while-acres-of-vineyards-have-been-pulled-over-the-past-year/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa County 2025 unharvested-acreage estimate — Napa County Times</a>.</li>
            <li style={{ marginBottom: 10 }}><a href="https://www.nature.com/articles/s42003-022-03447-0" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Spotted lanternfly establishment risk model — Communications Biology (2022)</a>.</li>
            <li style={{ marginBottom: 10 }}><a href="https://www.mastergardenersd.org/the-spotted-lanternfly-is-headed-our-way/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Sonoma County spotted lanternfly egg-mass interception, March 2024 — UCCE Master Gardeners of San Diego</a>.</li>
            <li style={{ marginBottom: 10 }}><a href="https://ipm.ucanr.edu/agriculture/pear/fire-blight/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>UC IPM — Fire Blight on Pear</a>.</li>
            <li style={{ marginBottom: 10 }}>Garrett Buckland, Premiere Viticultural Services. Interviews conducted May 2026.</li>
          </ol>
        </div>

      </div>

      <Footer />
    </div>
  );
}

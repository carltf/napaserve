// UNDER THE HOOD — Auction Napa Valley's $6 Million Question
// -----------------------------------------------------------------
// Slug: napa-auction-2026
// Publication: Napa Valley Features
// Built by parity from napaserve-under-the-hood-population.jsx (scaffold) +
// under-the-hood-could-gen-z-save-the-wine-industry.jsx (ChartOne line chart,
// chartjs-plugin-annotation era labels, Lesson A PNG geometry).
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
const ARTICLE_SLUG = "napa-auction-2026";
const ARTICLE_TITLE = "Under the Hood: Auction Napa Valley's $6 Million Question";
const ARTICLE_PUBLICATION = "Napa Valley Features";
const ARTICLE_DATE = "June 21, 2026";
const EYEBROW = "Under the Hood";

// ── COUNTY + PUBLICATION (template-compat downstream constants) ────
const PUBLICATION = ARTICLE_PUBLICATION;
const SUBSTACK_URL = "https://napavalleyfocus.substack.com";

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
  marginTop: 32,
  marginBottom: 14,
};

const P_STYLE = prose;
const SECTION_H2 = h2style;
const LINK = { color: T.accent };

// ── DOWNLOAD HELPER (Lesson A canonical geometry) ──────────────────
async function downloadComponentPng(containerRef, filename, title) {
  if (!containerRef.current) return;
  const { default: html2canvas } = await import("html2canvas");
  const canvas = await html2canvas(containerRef.current, {
    scale: 2,
    useCORS: true,
    backgroundColor: T.bg,
  });
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
  ctx.fillText("napaserve.org", off.width - 24, off.height - 28);
  ctx.restore();
  const a = document.createElement("a");
  a.href = off.toDataURL("image/png");
  a.download = filename;
  a.click();
}

// ── DOWNLOAD BUTTON ────────────────────────────────────────────────
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

// ── CHART ONE — Auction totals, nominal vs inflation-adjusted ──────
const AUCTION_TITLE = "Auction Napa Valley Totals: Nominal vs. Inflation-Adjusted, 2012-2026";
const AUCTION_YEARS = [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2022, 2023, 2024, 2025, 2026];
const AUCTION_NOMINAL = [8.0, 16.9, 18.7, 15.8, 14.3, 15.7, 13.6, 12.0, 1.5, 3.8, 4.8, 6.5, 6.0];
const AUCTION_ADJ2014 = [8.25, 17.17, 18.70, 15.78, 14.11, 15.16, 12.82, 11.11, 1.21, 2.95, 3.62, 4.77, 4.24];

function ChartOne() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const nominalSeries = AUCTION_YEARS.map((y, i) => ({ x: y, y: AUCTION_NOMINAL[i] }));
    const adjSeries = AUCTION_YEARS.map((y, i) => ({ x: y, y: AUCTION_ADJ2014[i] }));

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Nominal dollars",
            data: nominalSeries,
            borderColor: T.accent,
            backgroundColor: "rgba(139,94,60,0.10)",
            borderWidth: 2.6,
            pointRadius: 3,
            pointBackgroundColor: T.accent,
            tension: 0.2,
            fill: false,
          },
          {
            label: "Inflation-adjusted (2014 dollars)",
            data: adjSeries,
            borderColor: T.gold,
            backgroundColor: "rgba(196,160,80,0.10)",
            borderWidth: 2.4,
            pointRadius: 3,
            pointBackgroundColor: T.gold,
            borderDash: [5, 4],
            tension: 0.2,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 24, top: 30, left: 4 } },
        plugins: {
          legend: {
            display: true, position: "bottom", align: "start",
            labels: { color: T.ink, font: { size: 12, family: "'Source Sans 3', sans-serif" }, boxWidth: 14, padding: 12 },
          },
          tooltip: {
            callbacks: { label: (ctx) => `${ctx.dataset.label}: $${Number(ctx.parsed.y).toFixed(1)}M` },
          },
          annotation: {
            annotations: {
              peakLab: {
                type: "label", xValue: 2014, yValue: 19.6,
                content: "$18.7M peak",
                color: T.ink, font: { size: 11, weight: 700, family: "'Source Sans 3', sans-serif" },
                backgroundColor: "transparent",
              },
              cancelledBox: {
                type: "box", xMin: 2019.5, xMax: 2021.5,
                backgroundColor: "rgba(139,115,85,0.10)", borderWidth: 0,
              },
              cancelledLab: {
                type: "label", xValue: 2020.5, yValue: 9,
                content: ["Cancelled", "2020–21"],
                color: T.muted, font: { size: 10, style: "italic", family: "'Source Sans 3', sans-serif" },
                backgroundColor: "transparent",
              },
              onlineLab: {
                type: "label", xValue: 2022, yValue: 3.4,
                content: ["Online only", "2022"],
                color: T.muted, font: { size: 10, family: "'Source Sans 3', sans-serif" },
                backgroundColor: "transparent", yAdjust: -2,
              },
              liveLab: {
                type: "label", xValue: 2024, yValue: 7.2,
                content: ["Live format", "returns 2024"],
                color: T.muted, font: { size: 10, family: "'Source Sans 3', sans-serif" },
                backgroundColor: "transparent",
              },
              endLab: {
                type: "label", xValue: 2026, yValue: 6.0,
                content: "$6.0M (2026)",
                color: T.accent, font: { size: 11, weight: 700, family: "'Source Sans 3', sans-serif" },
                backgroundColor: "transparent", xAdjust: -38, yAdjust: -14,
              },
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            min: 2011, max: 2027,
            ticks: { stepSize: 2, color: T.ink, font: { size: 11 }, callback: (v) => Number.isInteger(v) ? String(v) : "" },
            grid: { color: T.rule },
            title: { display: true, text: "Year", color: T.ink, font: { size: 12 } },
          },
          y: {
            min: 0, max: 21,
            ticks: { color: T.muted, font: { size: 11 }, callback: (v) => `$${v}M` },
            grid: { color: T.rule },
            title: { display: true, text: "Auction total", color: T.muted, font: { size: 11 } },
          },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>{AUCTION_TITLE}</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "640px" }}>
            <div style={{ position: "relative", height: 380 }}>
              <canvas ref={canvasRef} aria-label="Line chart of Auction Napa Valley totals from 2012 to 2026 in nominal and inflation-adjusted 2014 dollars, with a 2014 peak of $18.7 million, cancelled years 2020 and 2021, an online-only 2022, the live format returning in 2024, and a 2026 total of $6.0 million" role="img" />
            </div>
          </div>
        </div>
      </div>
      {/* DownloadButton wrapped in its own container so it sits OUTSIDE containerRef
          (btn.parentElement.querySelector('canvas') === null; not captured in PNG). */}
      <div>
        <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-1_napa-auction-2026_nvf.png", AUCTION_TITLE)} />
      </div>
      <Caption
        title={AUCTION_TITLE}
        description={"Auction Napa Valley totals from 2012 to 2026, in nominal dollars and inflation-adjusted 2014 dollars. After a 2014 peak of $18.7 million, the auction declined through the late 2010s, was cancelled in 2020 and 2021, ran online-only in 2022 and returned to a live format in 2024. The 2026 total of $6 million — about $4.2 million in 2014 dollars, or 23% of the inflation-adjusted peak — is the first year-over-year decline since the live format returned."}
        sources={[
          { label: "Napa Valley Vintners", url: "https://napavintners.com" },
          { label: "BLS CPI", url: "https://www.bls.gov/cpi/" },
        ]}
      />
    </div>
  );
}

// ── AUCTION TOTALS TABLE ───────────────────────────────────────────
const AUCTION_TABLE = [
  ["2012", "$8.0M"],
  ["2013", "$16.9M"],
  ["2014", "$18.7M (peak)"],
  ["2015", "$15.8M"],
  ["2016", "$14.3M"],
  ["2017", "$15.7M"],
  ["2018", "$13.6M"],
  ["2019", "$12.0M"],
  ["2020", "cancelled"],
  ["2021", "cancelled"],
  ["2022", "$1.5M (online only)"],
  ["2023", "$3.8M"],
  ["2024", "$4.8M"],
  ["2025", "$6.5M"],
  ["2026", "$6.0M"],
];

function AuctionTable() {
  return (
    <div style={{ overflowX: "auto", marginBottom: 24 }}>
      <table style={{ borderCollapse: "collapse", fontFamily: font, fontSize: 15, color: T.ink, minWidth: 280 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "6px 24px 6px 0", borderBottom: `2px solid ${T.border}`, fontWeight: 700 }}>Year</th>
            <th style={{ textAlign: "left", padding: "6px 0", borderBottom: `2px solid ${T.border}`, fontWeight: 700 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {AUCTION_TABLE.map(([year, total]) => (
            <tr key={year}>
              <td style={{ padding: "5px 24px 5px 0", borderBottom: `1px solid ${T.rule}` }}>{year}</td>
              <td style={{ padding: "5px 0", borderBottom: `1px solid ${T.rule}` }}>{total}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
export default function AuctionNapaValley2026() {
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

        {/* ── EYEBROW ───────────────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          {EYEBROW} {"·"} {ARTICLE_PUBLICATION}
        </p>

        {/* ── HEADLINE ──────────────────────────────────────────────── */}
        <h1 style={{ fontFamily: serif, fontSize: 34, fontWeight: 700, color: T.ink, lineHeight: 1.25, marginBottom: 16 }}>
          {ARTICLE_TITLE}
        </h1>

        {/* ── ITALIC INTRO (standard UTH blurb) ─────────────────────── */}
        <p style={{ fontFamily: serif, fontSize: 18, color: T.muted, lineHeight: 1.6, marginBottom: 16, fontStyle: "italic" }}>
          Welcome to Under the Hood, our exclusive Saturday series for Napa Valley Features paid subscribers. Today we look at what this year’s Auction Napa Valley result says about the wider wine economy — and why a sold-out weekend that raised less than last year is worth a closer read.
        </p>

        {/* ── BYLINE + DATE ─────────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.muted, marginBottom: 16 }}>
          By Tim Carl {"·"} {ARTICLE_DATE}
        </p>

        {/* ── SUBSTACK LINK ─────────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 13, color: T.muted, marginBottom: 32, borderBottom: `1px solid ${T.border}`, paddingBottom: 20 }}>
          Read on{" "}
          <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>
            {ARTICLE_PUBLICATION} on Substack {"→"}
          </a>
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* LEDE                                                          */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <p style={{ ...P_STYLE, marginBottom: 18 }}>
          <strong>NAPA VALLEY, Calif.</strong> {"—"} Auction Napa Valley raised $6 million over its June 4-6 weekend, Napa Valley Vintners reported, with proceeds directed to the trade association’s Youth Wellness Initiative. By most measures the weekend was a success: tickets sold out, the barrel auction at the newly reopened Robert Mondavi Winery brought out more than 1,700 guests, vintners and volunteers, and the Saturday dinner at Inglenook, the capstone of a $5,000-a-guest weekend package, was limited to 400. Overall, the Vintners reported a record weekend crowd of more than 2,000 people from 29 states.
        </p>

        <p style={P_STYLE}>
          And yet the headline number went the other way. The $6 million total is down from $6.5 million in 2025 — the first year-over-year decline since the live, in-person format returned in 2024. After three years of climbing out of the pandemic trough, the recovery line flattened and then dipped.
        </p>

        <p style={P_STYLE}>
          That single data point is worth holding up against everything else moving through the valley this spring.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — STILL A FRACTION OF PEAK                            */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>Still a Fraction of Peak</h2>

        <p style={P_STYLE}>
          The nominal totals tell a long-arc story that one strong weekend doesn’t change.
        </p>

        <ChartOne />

        <AuctionTable />

        <p style={P_STYLE}>
          By Napa Valley Features’ inflation-adjusted analysis, using a 2014 base and U.S. Bureau of Labor Statistics CPI, this year’s $6 million translates to approximately $4.2 million in 2014 dollars, or about 23% of the inflation-adjusted peak. Last year’s $6.5 million came to approximately $4.84 million in 2014 dollars, or 26% of that peak. In real terms, then, 2026 didn’t just stall — it gave back a share of the ground 2025 had recovered.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — A SOLD-OUT CROWD, A SMALLER TOTAL                   */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>A Sold-Out Crowd, a Smaller Total</h2>

        <p style={P_STYLE}>
          The interesting tension is that demand for the experience held while the dollars did not. {"“"}If there is a slump in interest in wine, we aren’t seeing it here,{"”"} Napa Valley Vintners’ Teresa Wall <a href="https://www.pressdemocrat.com/2026/06/11/auction-napa-valley-2026-raises-6-million-to-support-local-youth/" target="_blank" rel="noopener noreferrer" style={LINK}>told guests at Friday’s barrel auction</a>, and the attendance figures back her up. The weekend honored founder Robin Lail with a lifetime achievement award, drew Francis Ford Coppola to his Inglenook estate, and featured top live lots built around shared experiences — an evening with Sebastian Maniscalco from Gargiulo Vineyards, B Cellars and Silver Oak, and a tribute dinner to the late winemaker Michel Rolland organized by Staglin Family Vineyards, Accendo Estate, Dalla Valle Vineyards, Darioush and Screaming Eagle.
        </p>

        <p style={P_STYLE}>
          What softened was not the room’s enthusiasm but its checkbook. A packed, generous crowd raised less than a smaller field did a year earlier. That is the signal worth sitting with: the auction is increasingly good at filling seats and less able to translate those seats into the totals it once commanded. Forbes captured the prevailing mood among vintners as <a href="https://www.winebusiness.com/news/link/319021" target="_blank" rel="noopener noreferrer" style={LINK}>{"“"}glass half full,{"”"}</a> and Tom Eddy, who has made wine in the valley since 1974, called it {"“"}the fifth major downturn{"”"} of his career while voicing confidence in the long run. Optimism and a declining total are not contradictions here. They are the same story told from two ends.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — A CROWDED FIELD                                     */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>A Crowded Field</h2>

        <p style={P_STYLE}>
          Part of the math is competition. The national charity-wine landscape has expanded well past the model Napa invented in 1981. The Naples Winter Wine Festival has been raising tens of millions annually, the Sonoma County Wine Auction and the V Foundation’s Wine Celebration have built loyal donor bases, and financial-center sales through Sotheby’s and Christie’s now compete for the same collectors. Napa is no longer measured against its own history alone but against a field it helped create — one where a single Florida weekend can out-raise Napa’s entire three days several times over.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — THE RESET AROUND THE EDGES                          */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>The Reset Around the Edges</h2>

        <p style={P_STYLE}>
          The auction doesn’t sit apart from the wine economy; it’s a barometer of it. And this spring the other instruments are reading the same direction.
        </p>

        <p style={P_STYLE}>
          Silicon Valley Bank’s <a href="https://napavalleyregister.com/news/svb-june-wine-report-napa-valley/article_ce5913c9-a53f-475a-9e5f-58e277db92a0.html" target="_blank" rel="noopener noreferrer" style={LINK}>June Direct-to-Consumer report</a> found Napa tasting-room reservations down on a trailing-12-month basis and club membership off 4% in 2025, with author Rob McMillan describing the moment as {"“"}stabilization, not recovery.{"”"} At a North Bay Business Journal-covered conference in May, M&amp;A specialist Mario Zepponi and land appraiser Tony Correia described an industry in <a href="/under-the-hood/napa-structural-reset-2026" style={LINK}>{"“"}a painful structural reset rather than a short-term slump,{"”"}</a> with a recovery horizon Zepponi put near 2028. Around them, <a href="/under-the-hood/calculators#tracker" style={LINK}>the distress has been concrete and named</a>: the Alila Napa Valley resort’s $94.2 million default, the Calistoga Motor Lodge’s $40 million default, Stanly Ranch’s $195 million foreclosure sale, Benessere Vineyards forced to auction after failing to sell at $35 million and Alpha Omega’s Mount Veeder vineyard pushed toward foreclosure.
        </p>

        <p style={P_STYLE}>
          Against that backdrop, a charity weekend that raised $6 million on sold-out tickets reads less like an outlier than like confirmation. The appetite for Napa as an experience is intact. The dollars that experience generates are not what they were — and they are still searching for a floor.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — INFLUENCE WITHOUT OVERSIGHT                         */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>Influence Without Oversight</h2>

        <p style={P_STYLE}>
          The structural questions raised in this space before have not gone away, and a softer total sharpens them. Auction proceeds fund the Youth Wellness Initiative, channeled through partners including Mentis, the Boys &amp; Girls Clubs, On the Move, UpValley Family Centers and others — services that vineyard and hospitality workers and their families rely on. Napa Valley Vintners reports more than $245 million given to the community since 1981.
        </p>

        <p style={P_STYLE}>
          But the funding still flows largely as one-time grants, allocated by a committee whose full composition and independent community oversight remain unclear from public materials. When the same industry that depends on these services also controls the philanthropic dollars that sustain them, the tension between public benefit and private interest is structural, not incidental — and it grows more pointed in a year when the pool of dollars shrinks. The previously floated idea of an independently governed Napa Valley Community Fund, able to receive auction proceeds while broadening who participates in funding decisions, is worth revisiting precisely now.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — LOOKING AHEAD                                       */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>Looking Ahead</h2>

        <p style={P_STYLE}>
          <strong>The experience is not the problem; the economics are.</strong> A sold-out weekend that raised less than a smaller one tells you demand is healthy and yield is not. For an industry pricing itself as luxury, that gap is the thing to watch.
        </p>

        <p style={P_STYLE}>
          <strong>One year is a wobble; two would be a trend.</strong> The 2027 auction, set for June 3-5 with the Continuum family as honorary chairs, becomes the real test. A second consecutive decline would make it hard to keep calling this a recovery.
        </p>

        <p style={P_STYLE}>
          <strong>Shrinking dollars raise the stakes on how they’re spent.</strong> When proceeds were climbing, governance questions could wait. They can’t as easily now. The fewer the dollars, the more it matters who decides where they go — and who bears the risk when a program’s initial funding ends.
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
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-auction-napa-valleys" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Auction Napa Valley’s $6.5 Million Moment — and What Follows{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (June 14, 2025)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="/under-the-hood/napa-structural-reset-2026" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: The Reset Spreads{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (April 4, 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="/under-the-hood/napa-price-discovery-2026" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: When the Price Gives Way{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (April 12, 2026)</span>
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
              placeholder="Search auction, charity wine, philanthropy, inflation, governance..."
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
            Inflation adjustment: nominal totals × (CPI-U 2014 annual average 236.736 ÷ latest available CPI-U). 2026 uses May 2026 CPI-U (NSA) 335.123; earlier years use annual averages; 2014 is the base year. Auction totals are as reported by Napa Valley Vintners / Collective Napa Valley; 2020 and 2021 were cancelled and 2022 ran online-only.
          </p>
        </div>

        {/* ── SOURCES ─────────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 40, paddingTop: 24 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: T.ink, marginBottom: 16 }}>Sources</h2>
          <ol style={{ fontFamily: font, fontSize: 14, color: T.ink, lineHeight: 1.75, paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>Napa Valley Vintners / Collective Napa Valley release, {"“"}Enthusiasm for Wine Turns Into Impact at Auction Napa Valley{"”"} (June 7, 2026).</li>
            <li style={{ marginBottom: 8 }}>Napa Valley Register, <a href="https://napavalleyregister.com/wine/auction-napa-valley-2026/article_7d39e2de-9353-4204-b586-2f5fb649100e.html" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Auction Napa Valley 2026</a>.</li>
            <li style={{ marginBottom: 8 }}>The Press Democrat, <a href="https://www.pressdemocrat.com/2026/06/11/auction-napa-valley-2026-raises-6-million-to-support-local-youth/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Auction Napa Valley 2026 raises $6 million to support local youth</a> (Teresa Wall quote; attendance).</li>
            <li style={{ marginBottom: 8 }}>Wine Spectator, <a href="https://www.winespectator.com/articles/auction-napa-valley-pours-it-forward" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Auction Napa Valley Pours It Forward</a>.</li>
            <li style={{ marginBottom: 8 }}>Forbes / Liz Thach, <a href="https://www.winebusiness.com/news/link/319021" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>A Glass Half Full at Auction Napa Valley</a> (Tom Eddy quote).</li>
            <li style={{ marginBottom: 8 }}>Collective Napa Valley, <a href="https://www.collectivenapavalley.org/events/2026-complete-auction-weekend/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>2026 Auction Weekend ticketing</a> ($5,000 per guest).</li>
            <li style={{ marginBottom: 8 }}>Silicon Valley Bank, <a href="https://www.svb.com/dtc-report/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>June 2026 Direct-to-Consumer Wine Report</a>.</li>
            <li style={{ marginBottom: 8 }}>North Bay Business Journal, May 2026 conference (Zepponi, Correia); see <a href="/under-the-hood/napa-structural-reset-2026" style={{ color: T.accent }}>The Reset Spreads</a>.</li>
            <li style={{ marginBottom: 8 }}>U.S. Bureau of Labor Statistics, <a href="https://www.bls.gov/cpi/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>CPI-U</a> (2014 base; May 2026 = 335.123).</li>
          </ol>
        </div>

      </div>

      <Footer />
    </div>
  );
}

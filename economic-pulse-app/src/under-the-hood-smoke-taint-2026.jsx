// UNDER THE HOOD — Smoke-Taint Science Sharpens as Napa Braces for Another Fire Season
// -----------------------------------------------------------------
// Slug: smoke-taint-2026
// Publication: Napa Valley Features
// Built from under-the-hood-could-gen-z-save-the-wine-industry.jsx structural
// pattern (source-of-truth UTH article). Theme 02 Cream tokens, inline styles.
// Charts: ChartOne (markers table), ChartTwo (funding bar), ChartThree (insurance
// table). Locked PNG geometry; per-chart h2 = caption title = PNG title.
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
const ARTICLE_SLUG = "smoke-taint-2026";
const ARTICLE_TITLE = "Under the Hood: Smoke-Taint Science Sharpens as Napa Braces for Another Fire Season";
const ARTICLE_DECK = "Federal scientists are closing in on the gap between what a lab measures and what a taster perceives — even as the money behind the research wobbles and insurers and growers still argue over which smoke markers count.";
const ARTICLE_PUBLICATION = "Napa Valley Features";
const ARTICLE_DATE = "June 10, 2026";
const SHOW_DECK = true;
const EYEBROW = "Under the Hood";

// ── COUNTY + PUBLICATION (template-compat downstream constants) ────
const PUBLICATION = ARTICLE_PUBLICATION;
const SUBSTACK_URL = "https://napavalleyfocus.substack.com/";
const DATELINE_LOCATION = "NAPA VALLEY, Calif.";

// ── THEME (Theme 02 Cream) ─────────────────────────────────────────
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

// ── CHART COLOR PALETTE ────────────────────────────────────────────
const C = {
  navy: "#1F4E79",
  accent: "#8B5E3C",
  gold: "#C4A050",
  ink: "#2C1810",
  muted: "#8B7355",
  red: "#8B2E2E",
};

// ── DOWNLOAD HELPER (canonical geometry — LOCKED) ──────────────────
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

// ── CAPTIONS ARRAY (single source of truth; titles mirror h2 + PNG) ─
const CAPTIONS = [
  {
    number: 1,
    title: "Reading a Smoke Report: What the Markers Mean",
    description: "The compounds a smoke-screening lab measures, their approximate red-wine sensory thresholds and what each adds on the palate. The thresholds shift with the wine, the grape variety and the taster, and guaiacol and 4-methylguaiacol can also come from toasted oak, so a single lab number can mislead.",
    sources: [
      { label: "Australian Wine Research Institute", url: "https://www.awri.com.au/sensory-impact-of-smoke-exposure/" },
    ],
  },
  {
    number: 2,
    title: "Federal Funding for Winegrape Smoke Research",
    description: "Annual federal dollars for smoke-exposure science, set beside the dedicated research bill that has yet to become law. The ARS figures are approximate, as described by national program leader Tim Rinehart; the Smoke Exposure Research Act would authorize $6.5 million a year through 2030 if enacted.",
    sources: [
      { label: "USDA Agricultural Research Service (2025 Smoke Summit)", url: "https://grapeandwinemag.com/2025/10/08/2025-smoke-summit-research-and-support-continue-for-wine-industry-smoke-exposure-task-force/" },
      { label: "2026 West Coast Smoke Summit", url: "https://www.youtube.com/watch?v=G0qrPynJd1w" },
      { label: "H.R. 2084, the Smoke Exposure Research Act", url: "https://www.govinfo.gov/content/pkg/BILLS-119hr2084ih/html/BILLS-119hr2084ih.htm" },
    ],
  },
  {
    number: 3,
    title: "Two Ways to Insure Against Smoke",
    description: "How an individual multi-peril crop policy — which pays on a vineyard's proven loss and the lab proof carriers demand — differs from the Fire Insurance Protection-Smoke Index endorsement, which pays automatically when a county records enough heavy-smoke days and requires no testing.",
    sources: [
      { label: "USDA Risk Management Agency", url: "https://www.rma.usda.gov/about-crop-insurance/frequently-asked-questions/fire-insurance-protection-smoke-index-fip-si" },
      { label: "Kristine Fox, Relation Insurance Services, at the 2026 West Coast Smoke Summit", url: "https://www.youtube.com/watch?v=G0qrPynJd1w" },
    ],
  },
];

// ── CAPTION COMPONENT ──────────────────────────────────────────────
function Caption({ number, title, description, sources = [] }) {
  if (number !== undefined) {
    const cap = CAPTIONS.find((c) => c.number === number);
    if (!cap) return null;
    title = cap.title;
    description = cap.description;
    sources = cap.sources;
  }
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

// ── SHARED TABLE CELL STYLES ───────────────────────────────────────
const thCell = {
  fontFamily: font, fontSize: 12, fontWeight: 700, color: T.muted,
  textAlign: "left", padding: "8px 10px", borderBottom: `2px solid ${T.border}`,
  verticalAlign: "bottom",
};
const tdCell = {
  fontFamily: font, fontSize: 13, color: T.ink, padding: "8px 10px",
  borderBottom: `1px solid rgba(44,24,16,0.08)`, verticalAlign: "top",
};
const figFootnote = {
  fontFamily: font, fontSize: 11, color: T.muted, fontStyle: "italic",
  lineHeight: 1.5, margin: "12px 0 0",
};
const figSubtitle = {
  fontFamily: font, fontSize: 13, fontStyle: "italic", color: T.muted,
  margin: "0 0 12px 0", lineHeight: 1.5,
};

// ── CHART ONE — Reading a Smoke Report (markers table) ─────────────
const CHART1_TITLE = "Reading a Smoke Report: What the Markers Mean";
const MARKER_ROWS = [
  { compound: "Guaiacol", precursor: "coniferyl alcohol", threshold: "~23 µg/L", character: "smoky, medicinal", oak: "Yes" },
  { compound: "4-Methylguaiacol", precursor: "coniferyl alcohol", threshold: "~65 µg/L", character: "char, spicy", oak: "Yes" },
  { compound: "m-Cresol", precursor: "p-coumaryl alcohol", threshold: "~20 µg/L", character: "ashy, medicinal", oak: "No" },
  { compound: "o- / p-Cresol", precursor: "p-coumaryl alcohol", threshold: "~62–64 µg/L", character: "ashy", oak: "No" },
  { compound: "Syringol", precursor: "sinapyl alcohol", threshold: "~570 µg/L", character: "minor impact", oak: "Yes", oakBold: true },
  { compound: "Bound glycosides*", precursor: "(sugar-bound forms)", threshold: "~69 µg/L", character: "release in-mouth", oak: "—" },
];

function ChartOne() {
  const containerRef = useRef(null);
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>{CHART1_TITLE}</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "640px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Compound", "Smoke precursor", "Red-wine threshold", "Character", "From oak too?"].map((hd) => (
                    <th key={hd} style={thCell}>{hd}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MARKER_ROWS.map((r) => (
                  <tr key={r.compound}>
                    <td style={{ ...tdCell, fontWeight: 700 }}>{r.compound}</td>
                    <td style={tdCell}>{r.precursor}</td>
                    <td style={{ ...tdCell, fontFamily: "monospace", whiteSpace: "nowrap" }}>{r.threshold}</td>
                    <td style={tdCell}>{r.character}</td>
                    <td style={tdCell}>{r.oakBold ? <strong>{r.oak}</strong> : r.oak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p style={figFootnote}>
          *Guaiacol glucoside, in water. Approximate thresholds; vary by wine, variety and taster. Source: Australian Wine Research Institute.
        </p>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-1__nvf.png", CHART1_TITLE)} />
      <Caption number={1} />
    </div>
  );
}

// ── CHART TWO — Federal Funding for Winegrape Smoke Research (bar) ──
const CHART2_TITLE = "Federal Funding for Winegrape Smoke Research";
const FUNDING_ROWS = [
  { label: "ARS grape research (all topics)", value: 27, display: "$27M / yr", color: C.navy },
  { label: "ARS smoke-exposure research", value: 5, display: "≈ $5M / yr", color: C.accent },
  { label: "Smoke Exposure Research Act", value: 6.5, display: "$6.5M / yr", color: C.gold },
];

function ChartTwo() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const valueLabels = {
      id: "ch2_value_labels",
      afterDatasetsDraw(chart) {
        const { ctx, scales: { x, y } } = chart;
        ctx.save();
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = "bold 12px 'Source Sans 3', sans-serif";
        ctx.fillStyle = C.ink;
        FUNDING_ROWS.forEach((r, i) => {
          const px = x.getPixelForValue(r.value);
          const py = y.getPixelForValue(i);
          ctx.fillText(r.display, px + 8, py);
        });
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: FUNDING_ROWS.map((r) => r.label),
        datasets: [{
          data: FUNDING_ROWS.map((r) => r.value),
          backgroundColor: FUNDING_ROWS.map((r) => r.color),
          borderColor: FUNDING_ROWS.map((r) => r.color),
          borderWidth: 1,
          borderSkipped: false,
          barPercentage: 0.7,
          categoryPercentage: 0.8,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { right: 64, top: 6 } },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: {
            min: 0, max: 30,
            ticks: { color: C.ink, font: { size: 11 }, callback: (v) => "$" + v + "M" },
            grid: { color: T.rule },
            title: { display: true, text: "Annual federal dollars (millions)", color: C.ink, font: { size: 12 } },
          },
          y: {
            ticks: { color: C.ink, font: { size: 12 } },
            grid: { display: false },
          },
        },
      },
      plugins: [valueLabels],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>{CHART2_TITLE}</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <p style={figSubtitle}>
          Annual federal dollars for smoke-exposure science, beside the stalled research bill.
        </p>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "560px" }}>
            <div style={{ position: "relative", height: 260 }}>
              <canvas ref={canvasRef} aria-label="Horizontal bar chart of annual federal funding for winegrape smoke research" role="img" />
            </div>
          </div>
        </div>
        <p style={figFootnote}>
          ARS amounts approximate, per the program lead; the Research Act ($32.5M / 5 years) is authorized, not yet enacted.
        </p>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-2__nvf.png", CHART2_TITLE)} />
      <Caption number={2} />
    </div>
  );
}

// ── CHART THREE — Two Ways to Insure Against Smoke (table) ─────────
const CHART3_TITLE = "Two Ways to Insure Against Smoke";
const INSURANCE_ROWS = [
  { attr: "Triggers payout", multi: "proven loss to your vineyard from a named peril, incl. smoke", fipsi: "county hits a set number of heavy-smoke days (13, per Fox)" },
  { attr: "Lab test", multi: "yes — carriers want elevated markers", fipsi: "none required" },
  { attr: "Scope", multi: "your vineyard's actual loss", fipsi: "county-wide; individual yields not considered" },
  { attr: "Window", multi: "per your crop policy", fipsi: "June 1 – Nov. 10, harvested or not" },
  { attr: "Controlled burns", multi: "no — natural fire only", fipsi: "yes — wildfire and controlled burns both count" },
  { attr: "Payout", multi: "claim filed, adjuster, lab proof", fipsi: "automatic after the period, once counties are listed" },
];

function ChartThree() {
  const containerRef = useRef(null);
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>{CHART3_TITLE}</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <p style={figSubtitle}>
          The individual multi-peril policy pays on your vineyard's proven loss; the FIP-SI endorsement pays on county-wide smoke.
        </p>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "680px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...thCell, width: "20%" }}></th>
                  <th style={thCell}>Multi-peril crop insurance</th>
                  <th style={thCell}>FIP-SI endorsement</th>
                </tr>
              </thead>
              <tbody>
                {INSURANCE_ROWS.map((r) => (
                  <tr key={r.attr}>
                    <td style={{ ...tdCell, fontWeight: 700, color: T.muted }}>{r.attr}</td>
                    <td style={tdCell}>{r.multi}</td>
                    <td style={tdCell}>{r.fipsi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p style={figFootnote}>
          FIP-SI covers part of the multi-peril deductible. Source: USDA Risk Management Agency; 13-day trigger per Kristine Fox, Relation Insurance.
        </p>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-3__nvf.png", CHART3_TITLE)} />
      <Caption number={3} />
    </div>
  );
}

// ── RELATED COVERAGE (plain linked-title list; internal-first) ─────
// No NapaServe UTH pages exist for these Substack columns, so all remain
// external (Substack) links — no internal substitutions available.
const RELATED = [
  { title: "Bracing for the Blaze: The Wine Industry Prepares to Battle Smoke Taint", pub: "Napa Valley Features", date: "July 27, 2023", url: "https://napavalleyfocus.substack.com/p/bracing-for-the-blaze-the-wine-industry" },
  { title: "Wine Chronicles: Napa Braces for the 2025 Fire Season", pub: "Napa Valley Features", date: "June 5, 2025", url: "https://napavalleyfocus.substack.com/p/wine-chronicles-napa-braces-for-the" },
  { title: "Napa County’s Newest Ridge-Top Firebreak, Built Parcel by Parcel", pub: "Napa Valley Features", date: "May 20, 2026", url: "https://napavalleyfocus.substack.com/p/napa-countys-newest-ridge-top-firebreak" },
  { title: "Under the Hood: Fighting Fire With Fire", pub: "Napa Valley Features", date: "May 4, 2024", url: "https://napavalleyfocus.substack.com/p/under-the-hood-fighting-fire-with" },
  { title: "Under the Hood: Living With Fire in Northern California’s Wine Country", pub: "Napa Valley Features", date: "Sept. 28, 2024", url: "https://napavalleyfocus.substack.com/p/under-the-hood-living-with-fire-in" },
];

// ── IMAGE + CUTLINE ────────────────────────────────────────────────
function Figure({ src, alt, cutline, marginTop = 28 }) {
  return (
    <figure style={{ margin: `${marginTop}px 0 24px` }}>
      <img src={src} alt={alt} style={{ width: "100%", borderRadius: 4, display: "block" }} />
      <figcaption style={{ fontFamily: font, fontStyle: "italic", fontSize: 14, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>
        {cutline}
      </figcaption>
    </figure>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────
export default function UnderTheHoodSmokeTaint2026() {
  const navigate = useNavigate();
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

        {/* ── ARTICLE SUMMARY (standfirst) ──────────────────────────── */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "16px 20px", marginBottom: 32 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Article Summary</p>
          <p style={{ ...prose, fontSize: 15, marginBottom: 0 }}>
            As Northern California heads into a fire season forecast to bring above-normal large-fire potential, smoke — not flame — remains the costliest threat to Napa Valley’s wine grapes. At the West Coast Smoke Exposure Task Force’s annual smoke summit on June 8, federal scientists reported progress on the field’s hardest problem: linking lab measurements of smoke compounds to what tasters actually perceive as an ashy flaw. Researchers also detailed advances in rapid detection, in-cellar remediation and the new Fire Insurance Protection-Smoke Index endorsement. Yet the federal agency funding much of the work is moving through a reorganization, and growers report friction with insurers over which lab markers count.
          </p>
        </div>

        {/* ── LEAD IMAGE (shared library) ───────────────────────────── */}
        <Figure
          src="/photos/library/fire/2020-09-27_glass-fire_napa-welcome-sign_DSC07531.jpg"
          alt="A CAL FIRE helicopter passes a smoke plume from the 2020 Glass Fire above the Napa Valley welcome sign as onlookers watch"
          cutline={"Onlookers watch a CAL FIRE helicopter work the Glass Fire behind the Napa Valley welcome sign, Sept. 27, 2020 — Tim Carl Photo"}
          marginTop={0}
        />

        {/* ── LEDE (carries the dateline) ───────────────────────────── */}
        <p style={{ ...P_STYLE, marginBottom: 18 }}>
          <span style={{ fontWeight: 700 }}>{DATELINE_LOCATION} {"—"}</span> The National Interagency Fire Center’s latest outlook calls for above-normal large-fire potential across Northern California by July and August, and live fuel moisture at higher elevations is already dropping. For Napa Valley’s vineyards, though, the number that matters most arrives later in the season, and it is not measured in acres burned. Since 2020, the dominant threat to the region’s vintages has not been the flame front but the smoke behind it — volatile compounds that settle invisibly into grape skins and surface months later as an ashy taste in the glass.
        </p>
        <p style={P_STYLE}>
          That shift was the throughline at the West Coast Smoke Exposure Task Force’s <a href="https://www.youtube.com/watch?v=G0qrPynJd1w" target="_blank" rel="noopener noreferrer" style={LINK}>annual smoke summit on June 8</a>, a two-hour virtual program that drew federal researchers, university scientists, an insurance specialist and growers from across California, Oregon and Washington. Alisa Jacobson, who chairs the task force’s research committee, guided the program and framed its purpose as turning that science into practical guidance for growers — the sampling and small-scale fermentation protocols and the frequently asked questions the committee keeps up to date. Jacobson also owns <a href="https://www.turningtidewines.com/" target="_blank" rel="noopener noreferrer" style={LINK}>Turning Tide Wines</a>, a climate-focused label built on organic and regenerative farming. The picture that emerged this year is of a field closing in on its longest-standing uncertainty — the gap between what a lab can measure and what a taster can perceive — even as the federal money funding that work moves through an uncertain restructuring and the crop-insurance system meant to backstop growers stays a step behind the chemistry.
        </p>

        {/* ── WHAT THE SCIENCE CAN NOW MEASURE ──────────────────────── */}
        <h2 style={SECTION_H2}>What the Science Can Now Measure</h2>
        <p style={P_STYLE}>
          For all the chemistry involved, the researchers kept returning to a single sensation: the ashy aftertaste. It is the most consistent and most persistent marker of smoke exposure, and it presents in the mouth before it can be detected by smell.
        </p>
        <p style={P_STYLE}>
          “The ashiness presents in mouth first,” said Elizabeth Tomasino, a professor of enology at Oregon State University whose work focuses on flavor chemistry and sensory perception.
        </p>
        <p style={P_STYLE}>
          Arran Rumbaugh, a chemist with the USDA Agricultural Research Service in Davis, reported that even low levels of exposure can mute a wine’s fruitiness and introduce a faint ashy character on the palate, while higher exposures produce the overt smoky, ashy flaws growers fear. The aftertaste takes time to emerge — roughly 30 seconds after a wine is tasted or swallowed — and can linger 90 seconds to two minutes, which is why tasting protocols now call for patience and a thorough rinse between samples to avoid false positives.
        </p>
        <p style={P_STYLE}>
          The harder problem is interpretation. A wine can test below published thresholds in the lab and still taste ashy on the palate, a mismatch that has frustrated growers for years.
        </p>
        <p style={P_STYLE}>
          “Take that threshold number with a grain of salt,” Tomasino said.
        </p>
        <p style={P_STYLE}>
          Part of the explanation is that free smoke compounds are only part of the story. Sugar-bound versions of the same compounds, called glycoconjugates, can release during aging or even in the mouth, where saliva enzymes break the chemical bonds. Tomasino said her current guidance is to treat the relevant marker as a total — free plus bound guaiacol — rather than the free value alone, a recommendation about six months old. The field’s reference points trace to a 2012 study by Mango Parker and colleagues at the <a href="https://www.awri.com.au/sensory-impact-of-smoke-exposure/" target="_blank" rel="noopener noreferrer" style={LINK}>Australian Wine Research Institute</a>, which puts guaiacol’s sensory threshold at 23 micrograms per liter in red wine, with related cresols ranging from about 20 to 65 and syringol far higher and less consequential. Complicating matters further, guaiacol and 4-methylguaiacol also form during oak-barrel toasting, so their mere presence does not prove smoke exposure. Sensory thresholds, Tomasino added, are typically set at the level half a population can detect; because ashiness is so disliked, she and some colleagues now report thresholds at 75% to 80% detection, which lowers the number.
        </p>

        <ChartOne />

        <p style={P_STYLE}>
          Cole Cerrato, who runs Oregon State University’s Smoke, Wine and Grape Analytical Chemistry Lab, traced the compounds to their source: lignin in the burning fuel — bark, brush and grasses — which breaks down under fire into guaiacol and 4-methylguaiacol, the cresols and syringol. He noted that grape variety drives much of the variation in how grapes absorb and express these compounds — in current trials, syrah has proved relatively resistant and pinot noir more sensitive. Researchers also described a newer class of compounds, thiophenols, that appears to contribute to the lingering ashy finish and that several labs are still developing methods to measure.
        </p>
        <p style={P_STYLE}>
          One advance could shorten the wait for answers. Rumbaugh said researchers are working with a chemical-fingerprinting device that reads the headspace above a wine and can distinguish smoke-impacted samples in about five minutes, and that a baseline database being built with UC Davis and an industry partner — carrying on Anita Oberholster’s work on background levels in grapes and wines — should be accessible by next season, giving growers a reference point to compare suspect samples against.
        </p>

        {/* ── THE MONEY BEHIND THE MICROSCOPE ───────────────────────── */}
        <h2 style={SECTION_H2}>The Money Behind the Microscope</h2>
        <p style={P_STYLE}>
          Much of this research is federally funded, and that funding has been turbulent. At <a href="https://grapeandwinemag.com/2025/10/08/2025-smoke-summit-research-and-support-continue-for-wine-industry-smoke-exposure-task-force/" target="_blank" rel="noopener noreferrer" style={LINK}>the task force’s 2025 summit</a>, Tim Rinehart, the ARS national program leader who oversees the work, described an agency grape-research portfolio of about $27 million a year, of which roughly $5 million is directed to smoke exposure in winegrapes — money appropriated by Congress and shared with UC Davis, Oregon State and Washington State. He reaffirmed the roughly $5 million annual smoke figure at this year’s summit.
        </p>

        <ChartTwo />

        <p style={P_STYLE}>
          Earlier in 2025, federal staffing cuts briefly reached the smoke-taint program itself. Rumbaugh and other ARS grape researchers were among those terminated before the cuts were reversed.
        </p>
        <p style={P_STYLE}>
          The agency is also reorganizing. USDA announced a <a href="https://www.usda.gov/about-usda/news/press-releases/2025/07/24/secretary-rollins-announces-usda-reorganization-restoring-departments-core-mission-supporting" target="_blank" rel="noopener noreferrer" style={LINK}>department-wide restructuring in July 2025</a> that includes closing the Beltsville Agricultural Research Center in Maryland and relocating much of its Washington-area workforce to five regional hubs, a plan it reaffirmed in April 2026. Rinehart told this year’s summit that the restructuring carried roughly $32 million in congressionally directed project terminations across ARS — about $20 million of it at Beltsville — though he said grape researchers were not directly affected, and pointed to fiscal 2027 House budget language that named smoke-exposure research and set aside $715,000 for it.
        </p>
        <p style={P_STYLE}>
          That in-house ARS work is separate from the proposed Smoke Exposure Research Act, the bipartisan bill described in “<a href="https://napavalleyfocus.substack.com/p/wine-chronicles-napa-braces-for-the" target="_blank" rel="noopener noreferrer" style={LINK}>Wine Chronicles: Napa Braces for the 2025 Fire Season</a>,” (June 5, 2025). Reintroduced in 2025 by Sens. Alex Padilla and Jeff Merkley and Reps. Mike Thompson and Doug LaMalfa, the bill would authorize <a href="https://www.govinfo.gov/content/pkg/BILLS-119hr2084ih/html/BILLS-119hr2084ih.htm" target="_blank" rel="noopener noreferrer" style={LINK}>$32.5 million over five years</a> — $6.5 million a year from fiscal 2026 through 2030 — for dedicated smoke research at the three land-grant universities. One stream funds the federal scientists through annual appropriations; the other would create a separate, longer-term authorization. Both run on the same uncertain political clock.
        </p>

        {/* ── IN THE VINEYARD, FEW SURE TOOLS ───────────────────────── */}
        <h2 style={SECTION_H2}>In the Vineyard, Few Sure Tools</h2>
        <p style={P_STYLE}>
          If the science is sharpening, the toolkit available to growers before harvest remains thin. Tom Collins, an associate professor at Washington State University who first worked with smoke-affected fruit in California in 2008, said timing offers less protection than many growers assume. Fruit exposed well before veraison — in some trials as early as the end of bloom — still produced smoke-affected wine, meaning early-season smoke cannot be dismissed.
        </p>
        <p style={P_STYLE}>
          Proximity is also an imperfect guide. Smoke ages as it travels, with gas-phase compounds breaking down within hours and particles settling out over distance, so faraway fires sometimes cause damage and sometimes do not.
        </p>
        <p style={P_STYLE}>
          Washing offers little help and can backfire. Collins said the marker compounds embed inside the grape skin, where rinsing does not reach them, and that washing a canopy without first removing leaves can drive ash into the clusters and raise compound levels. Barrier sprays carry a similar trap: kaolin and bentonite work by adsorbing compounds from the smoke, but Collins said that if they are not rinsed off after the smoke clears, they can release those compounds back into the fruit — leaving it worse off than if nothing had been applied.
        </p>
        <p style={P_STYLE}>
          Newer functional coatings under study at Oregon State show more promise, but their effectiveness varies by compound. For now, Collins pointed growers toward small-scale risk assessment — bucket fermentations of 10 to 20 kilograms of fruit, or smaller “nano” ferments in canning jars held at temperature — which allow a grower to smell and taste a sample about a week before harvest and to freeze a portion for later lab testing. He recalled the bottleneck of the 2020 season, when fires up and down the West Coast overwhelmed the certified labs.
        </p>
        <p style={P_STYLE}>
          “Lab capacity was challenged — that’s very diplomatic for what it was,” he said. “It was just impossible to keep up with the number of samples.”
        </p>

        {/* ── IN THE CELLAR, SUBTRACTION AT A COST ──────────────────── */}
        <h2 style={SECTION_H2}>In the Cellar, Subtraction at a Cost</h2>
        <p style={P_STYLE}>
          Once smoke-affected fruit reaches the winery, the question becomes what can be removed. Torey Arvik, a research food technologist with ARS, described an early head-to-head comparison of four commercial remediation technologies run over three days, generating dozens of samples for analysis. Reverse osmosis paired with carbon and a proprietary ultrafiltration process produced the steepest reductions in volatile smoke compounds, he said, though reverse osmosis appeared to raise the bound, glycosylated forms, and one polymer showed little measurable effect. The comparison is preliminary, part of a study that runs through 2028.
        </p>
        <p style={P_STYLE}>
          The test wine came from close to home. The <a href="https://www.fire.ca.gov/incidents/2025/8/21/pickett-fire" target="_blank" rel="noopener noreferrer" style={LINK}>2025 Pickett Fire</a> ignited Aug. 21 near Calistoga, burned 6,819 acres mostly within the footprint of the 2020 Glass Fire and threw smoke across Napa, Sonoma and Solano counties. Arvik said a backfire lit beside a premier Napa Valley cabernet vineyard during that fire yielded fruit whose research wine ranked, by his account, among the most heavily smoke-affected wines ETS Laboratories in St. Helena had measured.
        </p>
        <p style={P_STYLE}>
          To make the wine practical to study and potentially salvageable, researchers blended it down to a roughly 35% smoke-affected, 65% less-affected mix before treatment — a reminder that even the most aggressive cellar fixes work best on fruit that is not heavily tainted to begin with. Further out, ARS teams in Albany are pursuing genetic approaches: one group has engineered yeast to break guaiacol down during fermentation into compounds already present in wine, while a lab led by Roger Thilmony uses microvine models and gene editing to interrupt the glycosylation that locks smoke compounds into the grape itself. None of it amounts to a single fix.
        </p>

        {/* ── INSURANCE PLAYS CATCH-UP ──────────────────────────────── */}
        <h2 style={SECTION_H2}>Insurance Plays Catch-Up</h2>
        <p style={P_STYLE}>
          The financial backstop is evolving on its own track. Kristine Fox, director of crop insurance at Relation Insurance Services in Fresno, walked through the federal <a href="https://www.rma.usda.gov/about-crop-insurance/frequently-asked-questions/fire-insurance-protection-smoke-index-fip-si" target="_blank" rel="noopener noreferrer" style={LINK}>Fire Insurance Protection-Smoke Index endorsement</a>, which the Risk Management Agency introduced for California grapes in the 2025 crop year and expanded to Idaho, Oregon and Washington for 2026. Rather than insuring an individual vineyard, it stacks on a grower’s multi-peril crop-insurance policy and covers part of that policy’s deductible when a county records enough heavy-smoke days, drawing on federal smoke-mapping data rather than vineyard testing. It runs from June 1 to Nov. 10 regardless of whether a crop has been harvested, considers no individual vineyard yields, requires no lab testing or notice of loss, and pays automatically after the insurance period once federal officials release the list of triggered counties. Because it tracks county smoke rather than a single fire, it does not distinguish wildfire smoke from a controlled burn. Fox said the county threshold runs to 13 heavy-smoke days, after which the payout rises with each additional smoky day.
        </p>

        <ChartThree />

        <p style={P_STYLE}>
          The older multi-peril policies are where Fox flagged a growing problem. Insurers, she said, increasingly want lab reports showing elevated levels of both guaiacol and 4-methylguaiacol before paying a smoke claim, and growers whose reports show other elevated smoke markers instead have seen claims rejected.
        </p>
        <p style={P_STYLE}>
          “There is absolutely nothing within the RMA manual or the standards that says that those two markers must be present,” Fox said. “They just say that there must be elevated markers of smoke.”
        </p>
        <p style={P_STYLE}>
          Her advice to growers facing that gap was procedural: push back through an agent, keep blocks separate and uncommingled, document every attempt to market the fruit and save frozen samples in case a claim requires them later.
        </p>

        {/* ── WHAT TO WATCH (closing) ───────────────────────────────── */}
        <h2 style={SECTION_H2}>What to Watch</h2>
        <p style={P_STYLE}>
          The result is a season that opens with the same structural mismatch the smoke era has produced every year. The detection science is finally narrowing the gray area between a number and a flavor, but the most reliable answer still comes from tasting a small fermented sample a week before harvest. The cellar tools can subtract smoke compounds, but only within limits and at the cost of some of what makes the wine. The funding that drives the research is sound enough to claim progress and unsettled enough to leave next year’s budget in doubt. And the insurance system is still arguing over which molecules count.
        </p>
        <p style={P_STYLE}>
          The logic Napa County has applied on the ridgelines — described in “<a href="https://napavalleyfocus.substack.com/p/napa-countys-newest-ridge-top-firebreak" target="_blank" rel="noopener noreferrer" style={LINK}>Napa County’s Newest Ridge-Top Firebreak, Built Parcel by Parcel</a>,” (May 20, 2026) — runs in two directions here. Holding a fire small on the Mayacamas crest keeps flame off the structures below, and it can help keep smoke off the valley floor and out of the fruit. The open question for the 2026 vintage is the same one that has defined the smoke era since 2020: whether the science, the money and the policy can close the distance to the fire line before the next fire arrives to test them.
        </p>

        {/* ── BYLINE (long founder-and-editor; after final section) ──── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.ink, fontStyle: "italic", lineHeight: 1.65, margin: "32px 0 0 0" }}>
          Tim Carl is a Napa Valley-based photojournalist and the founder and editor of Napa Valley, Sonoma County and Lake County Features.
        </p>

        {/* ── POLLS SECTION ─────────────────────────────────────────── */}
        <PollsSection slug={ARTICLE_SLUG} />

        {/* ── RELATED COVERAGE (plain linked-title list) ────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 48, paddingTop: 28, marginBottom: 28 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center", marginBottom: 20 }}>
            Related Coverage
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {RELATED.map((r) => (
              <li key={r.url} style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}{r.title}{"”"}</a>
                <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} {r.pub} ({r.date})</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── ARCHIVE SEARCH ────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 28, paddingTop: 28, marginBottom: 28 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Archive
          </p>
          <h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 700, color: T.ink, margin: "0 0 8px 0" }}>Search Napa Valley Features</h2>
          <p style={{ fontFamily: font, fontSize: 15, color: T.muted, marginBottom: 16 }}>
            Search 1,000+ articles and reports from {ARTICLE_PUBLICATION}.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              placeholder="Search smoke taint, guaiacol, insurance, Pickett Fire, remediation..."
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

        {/* ── METHODOLOGY ───────────────────────────────────────────── */}
        <div style={{ borderTop: `2px solid ${T.border}`, paddingTop: 28, marginTop: 40 }}>
          <h3 style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: T.ink, margin: "0 0 10px" }}>Methodology</h3>
          <p style={{ fontFamily: font, fontSize: 14, color: T.muted, lineHeight: 1.7, fontStyle: "italic" }}>
            This article draws on the West Coast Smoke Exposure Task Force’s smoke summit of June 8, 2026 (recording in Sources), together with published materials from the Australian Wine Research Institute, the USDA Agricultural Research Service and Risk Management Agency, CAL FIRE incident records and the text of H.R. 2084. Sensory thresholds are approximate and vary by wine, grape variety and taster. The remediation comparison described is preliminary, from a study running through 2028. Dollar figures attributed to ARS are approximate, as characterized by program leaders at the summit. One vineyard and the commercial remediation products discussed at the summit are left unnamed pending on-record confirmation and publication.
          </p>
        </div>

        {/* ── SOURCES ───────────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 40, paddingTop: 24 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: T.ink, marginBottom: 16 }}>Sources</h2>
          <ol style={{ fontFamily: font, fontSize: 14, color: T.ink, lineHeight: 1.75, paddingLeft: 20 }}>
            <li style={{ marginBottom: 10 }}><a href="https://www.youtube.com/watch?v=G0qrPynJd1w" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>2026 West Coast Smoke Summit (recording)</a>.</li>
            <li style={{ marginBottom: 10 }}><a href="https://www.awri.com.au/sensory-impact-of-smoke-exposure/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Australian Wine Research Institute — Sensory impact of smoke exposure</a>.</li>
            <li style={{ marginBottom: 10 }}><a href="https://grapeandwinemag.com/2025/10/08/2025-smoke-summit-research-and-support-continue-for-wine-industry-smoke-exposure-task-force/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>USDA Agricultural Research Service — 2025 Smoke Summit coverage</a>.</li>
            <li style={{ marginBottom: 10 }}><a href="https://www.govinfo.gov/content/pkg/BILLS-119hr2084ih/html/BILLS-119hr2084ih.htm" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>H.R. 2084 — Smoke Exposure Research Act (bill text)</a>.</li>
            <li style={{ marginBottom: 10 }}><a href="https://www.usda.gov/about-usda/news/press-releases/2025/07/24/secretary-rollins-announces-usda-reorganization-restoring-departments-core-mission-supporting" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>USDA reorganization announcement (July 2025)</a>.</li>
            <li style={{ marginBottom: 10 }}><a href="https://www.padilla.senate.gov/newsroom/press-releases/padilla-merkley-thompson-lamalfa-introduce-bipartisan-bicameral-bill-to-protect-winegrape-growers-against-wildfire-smoke-damage/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Sens. Padilla, Merkley and Reps. Thompson, LaMalfa — winegrape smoke bill release</a>.</li>
            <li style={{ marginBottom: 10 }}><a href="https://www.rma.usda.gov/about-crop-insurance/frequently-asked-questions/fire-insurance-protection-smoke-index-fip-si" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>USDA Risk Management Agency — FIP-SI endorsement</a>.</li>
            <li style={{ marginBottom: 10 }}><a href="https://www.fire.ca.gov/incidents/2025/8/21/pickett-fire" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>CAL FIRE — Pickett Fire incident</a>.</li>
          </ol>
        </div>

      </div>

      <Footer />
    </div>
  );
}

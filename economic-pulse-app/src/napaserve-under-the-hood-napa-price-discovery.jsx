import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";

const ARTICLE_SLUG = "napa-price-discovery-2026";
const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";

const T = {
  bg: "#F5F0E8",
  surface: "#EDE8DE",
  ink: "#2C1810",
  accent: "#8B5E3C",
  gold: "#C4A050",
  muted: "#8B7355",
  border: "#D4C9B8",
};

const prose = {
  fontFamily: "'Source Sans 3', sans-serif",
  fontSize: 17,
  lineHeight: 1.75,
  color: T.ink,
  marginBottom: 18,
};

const h2style = {
  fontFamily: "'Libre Baskerville', Georgia, serif",
  fontSize: 22,
  fontWeight: 700,
  color: T.ink,
  marginTop: 36,
  marginBottom: 12,
};

// ── Poll IDs 24–26 ──────────────────────────────────────────────
const POLLS = [
  {
    question: "What does the Benessere auction result tell you about Napa winery real estate?",
    options: [
      "Major correction confirmed",
      "One data point, not a trend",
      "Auction format distorts value",
      "Italian varietals are a niche risk",
      "Unsure — need more data",
    ],
  },
  {
    question: "Which asset class concerns you most in Napa right now?",
    options: [
      "Luxury hospitality (hotels/resorts)",
      "Operating winery estates",
      "Vineyard land",
      "Wine brands without real estate",
      "All equally",
    ],
  },
  {
    question: "Is Napa's current repricing temporary or structural?",
    options: [
      "Structural — won't fully recover",
      "Structural but will stabilize",
      "Temporary — demand will return",
      "Too early to say",
      "Depends on the asset class",
    ],
  },
];

const SOURCES = [
  { label: "Napa County deed records — Stanly Ranch foreclosure, Mar 27, 2026", url: "https://www.napacounty.gov/186/Assessor-Recorder-County-Clerk" },
  { label: "SF Chronicle — 'Napa luxury resort snapped up by New York firm' (Lander, Mar 2026)", url: "https://www.sfchronicle.com/bayarea/article/blackstone-napa-stanly-ranch-22160347.php" },
  { label: "SF Chronicle — 'Fire-ravaged Napa Valley winery snapped up by S.F. investment firm' (Jess Lander, Apr 1, 2026)", url: "https://www.sfchronicle.com/food/wine/article/cain-vineyards-winery-spring-mountain-22094636.php" },
  { label: "SF Chronicle — 'This maverick Napa Valley winery couldn't sell. Now, it's headed for auction' (Jess Lander, Apr 7, 2026)", url: "https://www.sfchronicle.com/food/wine/article/benessere-napa-valley-auction-22192134.php" },
  { label: "Bloomberg — Stanly Ranch debt stack, Mar 30, 2026", url: "https://www.bloomberg.com" },
  { label: "New York State Supreme Court — Nichols Partnership v. GA Development, Mar 6, 2026", url: "https://www.nycourts.gov" },
  { label: "BEA FRED — Napa County 2024 real GDP (REALGDPALL06055)", url: "https://fred.stlouisfed.org/series/REALGDPALL06055" },
  { label: "Concierge Auctions — Benessere Vineyards listing", url: "https://www.conciergeauctions.com" },
  { label: "Sotheby's International Realty — Exceptional Global Properties, London, May 2026", url: "https://www.sothebysrealty.com" },
  { label: "Wine-Searcher — Premiere Napa Valley wholesale price trend, W. Blake Gray", url: "https://www.wine-searcher.com" },
  { label: "Silicon Valley Bank Wine Report 2026 — DtC shipment value", url: "https://www.svb.com/trends-insights/reports/wine-report" },
  { label: "Napa Valley Features — 'Under the Hood: The Reset Spreads' (Apr 9, 2026)", url: "https://napaserve.org/under-the-hood/napa-structural-reset-2026" },
  { label: "Napa Valley Features — 'Under the Hood: How a Global Supply Shock Reaches Napa Valley' (Apr 2, 2026)", url: "https://napaserve.org/under-the-hood/napa-supply-chain-2026" },
  { label: "Napa Valley Features — 'Under the Hood: 2025 Napa Grape Prices Slip After a Record High' (Mar 19, 2026)", url: "https://napaserve.org/under-the-hood/napa-cab-2025" },
  { label: "Napa Valley Features — 'Napa's Economy Looks Bigger Than It Is' (Mar 24, 2026)", url: "https://napaserve.org/under-the-hood/napa-gdp-2024" },
  { label: "Pat Delong, Azur Associates — wine/vineyard market size cited in SFC Trinchero reporting", url: "https://www.sfchronicle.com" },
  { label: "Concierge Auctions — Villa San Juliette, Paso Robles auction result, Aug 2025", url: "https://www.conciergeauctions.com" },
  { label: "MGG Investment Group — Spring Mountain Vineyard bankruptcy acquisition (SF Chronicle)", url: "https://www.sfchronicle.com/food/wine/article/cain-vineyards-winery-spring-mountain-22094636.php" },
  { label: "Napa Valley Features — 'Wine Chronicles: Benessere Vineyards' Vision' (Nov 2025)", url: "https://napavalleyfocus.substack.com/p/wine-chronicles-living-well-differently" },
];

// ── Download helper ──────────────────────────────────────────────
async function downloadComponentPng(containerRef, filename, title) {
  const { default: html2canvas } = await import("html2canvas");
  const canvas = await html2canvas(containerRef.current, { scale: 2, useCORS: true, backgroundColor: T.bg });
  const off = document.createElement("canvas");
  off.width = canvas.width;
  off.height = canvas.height + 48;
  const ctx = off.getContext("2d");
  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, off.width, off.height);
  ctx.drawImage(canvas, 0, 32);
  ctx.save(); ctx.globalAlpha = 1.0;
  ctx.font = "bold 13px 'Libre Baskerville', Georgia, serif";
  ctx.fillStyle = T.ink; ctx.textAlign = "left"; ctx.textBaseline = "top";
  ctx.fillText(title || "", 14, 10); ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.25;
  ctx.font = "11px 'Source Code Pro', monospace";
  ctx.fillStyle = T.muted; ctx.textAlign = "right"; ctx.textBaseline = "bottom";
  ctx.fillText("napaserve.org", off.width - 12, off.height - 8); ctx.restore();
  const a = document.createElement("a");
  a.href = off.toDataURL("image/png");
  a.download = filename;
  a.click();
}

// ── Chart 1 — Transaction Discount Bar Chart ─────────────────────
function TransactionChart() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const transactions = [
    { label: "Stanly Ranch (vs. orig. $220M loan)", pct: -11, pending: false, note: "−11%" },
    { label: "Stanly Ranch (vs. $243.6M debt stack)", pct: -20, pending: false, note: "−20%" },
    { label: "Spring Mountain Vineyard ($43M vs. $185M)", pct: -77, pending: false, note: "−77%" },
    { label: "Villa San Juliette, Paso Robles", pct: -60, pending: false, note: "−60%" },
    { label: "Cain Vineyards brand", pct: 0, pending: false, note: "Price undisclosed" },
    { label: "Benessere Vineyards (est. opening bid)", pct: -72, pending: true, note: "−66% to −77% PENDING" },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = 320;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.height = H + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const marginLeft = 260;
    const marginRight = 80;
    const marginTop = 20;
    const marginBottom = 30;
    const chartW = W - marginLeft - marginRight;
    const rowH = (H - marginTop - marginBottom) / transactions.length;

    // grid lines
    [-25, -50, -75, -100].forEach(v => {
      const x = marginLeft + chartW * (1 + v / 100);
      ctx.beginPath();
      ctx.strokeStyle = T.border;
      ctx.lineWidth = 0.5;
      ctx.moveTo(x, marginTop);
      ctx.lineTo(x, H - marginBottom);
      ctx.stroke();
      ctx.fillStyle = T.muted;
      ctx.font = "10px 'Source Sans 3', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(v + "%", x, H - marginBottom + 14);
    });
    // zero line
    ctx.beginPath();
    ctx.strokeStyle = T.ink;
    ctx.lineWidth = 1;
    ctx.moveTo(marginLeft + chartW, marginTop);
    ctx.lineTo(marginLeft + chartW, H - marginBottom);
    ctx.stroke();
    ctx.fillStyle = T.muted;
    ctx.font = "10px 'Source Sans 3', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("0%", marginLeft + chartW, H - marginBottom + 14);

    transactions.forEach((t, i) => {
      const y = marginTop + i * rowH + rowH * 0.15;
      const barH = rowH * 0.55;
      const zeroX = marginLeft + chartW;

      // label
      ctx.fillStyle = T.ink;
      ctx.font = `${t.pending ? "italic " : ""}11px 'Source Sans 3', sans-serif`;
      ctx.textAlign = "right";
      ctx.fillText(t.label, marginLeft - 8, y + barH / 2 + 4);

      if (t.pct === 0) {
        // undisclosed — hatched box
        ctx.fillStyle = T.border;
        ctx.fillRect(zeroX - 60, y, 60, barH);
        ctx.fillStyle = T.muted;
        ctx.font = "italic 10px 'Source Sans 3', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("Price undisclosed", zeroX - 56, y + barH / 2 + 4);
      } else {
        const barW = chartW * Math.abs(t.pct) / 100;
        const barX = zeroX - barW;
        if (t.pending) {
          // dashed outline only
          ctx.save();
          ctx.setLineDash([4, 3]);
          ctx.strokeStyle = T.accent;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(barX, y, barW, barH);
          ctx.fillStyle = T.accent + "22";
          ctx.fillRect(barX, y, barW, barH);
          ctx.restore();
          ctx.fillStyle = T.accent;
          ctx.font = "bold 10px 'Source Sans 3', sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(t.note, barX - 2, y - 4);
        } else {
          ctx.fillStyle = T.accent;
          ctx.fillRect(barX, y, barW, barH);
          ctx.fillStyle = T.ink;
          ctx.font = "bold 10px 'Source Sans 3', sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(t.note, barX - 4, y + barH / 2 + 4);
        }
      }
    });
  }, []);

  return (
    <div style={{ marginBottom: 32 }}>
      <div ref={containerRef} style={{ background: T.bg, padding: "16px 8px 8px" }}>
        <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: T.muted, marginBottom: 8 }}>
          Discount from original asking price or original loan amount. Spring Mountain Vineyard reflects a credit bid against an assumed $185M loan — structure differs from market sale. Benessere dashed/pending — auction closes May 28, 2026. Sources: Napa County deed records; SF Chronicle; napaserve.org.
        </p>
        <canvas ref={canvasRef} style={{ width: "100%", display: "block" }} />
      </div>
      <button
        onClick={() => downloadComponentPng(containerRef, "napa-asset-price-discovery.png", "Chart 1 — Napa Asset Price Discovery: Selected Transactions, 2023–2026")}
        style={{ marginTop: 8, padding: "6px 14px", background: "none", border: `1px solid ${T.accent}`, color: T.accent, borderRadius: 4, cursor: "pointer", fontFamily: "'Source Sans 3', sans-serif", fontSize: 13 }}
      >
        Download Chart PNG
      </button>
    </div>
  );
}

// ── Calculator ───────────────────────────────────────────────────
function RepricingCalculator() {
  const containerRef = useRef(null);
  const GDP_BASE = 11.31; // $B, Napa 2024 real GDP
  const ASSET_BASE = 4.0;  // $B, exposed hospitality + wine RE
  const MULTIPLIER = 0.4;  // estimated GDP pass-through

  const scenarios = [
    { id: "A", label: "Scenario A", desc: "−10%", subDesc: "Stanly Ranch vs. original $220M loan", pct: 10 },
    { id: "B", label: "Scenario B", desc: "−25%", subDesc: "Midpoint — between hospitality & winery auction discounts", pct: 25 },
    { id: "C", label: "Scenario C", desc: "−50%", subDesc: "Broadly in line with Benessere expected clearing range", pct: 50 },
    { id: "D", label: "Scenario D", desc: "−75%", subDesc: "Stress scenario — outer range of auction discounts from original ask", pct: 75 },
  ];

  const [active, setActive] = useState("B");
  const current = scenarios.find(s => s.id === active);
  const repriced = ASSET_BASE * (1 - current.pct / 100);
  const change = ASSET_BASE * (current.pct / 100);
  const drag = change * MULTIPLIER;
  const dragPct = (drag / GDP_BASE * 100).toFixed(1);

  return (
    <div style={{ marginBottom: 32 }}>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: 20 }}>
        <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.muted, marginBottom: 14 }}>
          Models estimated GDP drag on Napa County's economy under four repricing scenarios applied to ~$4B in exposed Napa hospitality and premium wine real estate. Directional estimates only — not a BEA or county economic forecast. GDP base: $11.31B (BEA, 2024). Asset exposure estimate based on reported Napa hospitality and premium winery real estate transactions.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {scenarios.map(s => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              style={{
                padding: "8px 14px",
                borderRadius: 4,
                border: `1px solid ${active === s.id ? T.accent : T.border}`,
                background: active === s.id ? T.accent : "transparent",
                color: active === s.id ? "#fff" : T.ink,
                cursor: "pointer",
                fontFamily: "'Source Sans 3', sans-serif",
                fontSize: 13,
                fontWeight: active === s.id ? 700 : 400,
              }}
            >
              {s.label} ({s.desc})
            </button>
          ))}
        </div>
        <div style={{ marginBottom: 14, padding: "10px 14px", background: T.bg, borderRadius: 4, borderLeft: `3px solid ${T.accent}` }}>
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.muted, margin: 0 }}>{current.subDesc}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "Repriced Asset Value", value: `$${repriced.toFixed(2)}B`, sub: `from $${ASSET_BASE.toFixed(1)}B` },
            { label: "Estimated Value Change", value: `−$${change.toFixed(2)}B`, sub: `at ${current.pct}% repricing` },
            { label: "Est. GDP Drag", value: `−$${drag.toFixed(0)}M`, sub: `−${dragPct}% of $${GDP_BASE}B base` },
          ].map(card => (
            <div key={card.label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, padding: "12px 14px" }}>
              <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 11, color: T.muted, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{card.label}</p>
              <p style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 22, fontWeight: 700, color: T.accent, margin: "0 0 2px" }}>{card.value}</p>
              <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: T.muted, margin: 0 }}>{card.sub}</p>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => downloadComponentPng(containerRef, "napa-repricing-calculator.png", "Asset Repricing Impact Calculator — Napa County")}
        style={{ marginTop: 8, padding: "6px 14px", background: "none", border: `1px solid ${T.accent}`, color: T.accent, borderRadius: 4, cursor: "pointer", fontFamily: "'Source Sans 3', sans-serif", fontSize: 13 }}
      >
        Download Calculator PNG
      </button>
    </div>
  );
}

// ── LivePoll + PollsSection (proven structural-reset pattern) ────
function LivePoll({ poll }) {
  const font = "'Source Sans 3', sans-serif";
  const serif = "'Libre Baskerville', Georgia, serif";
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

function PollsSection({ slug }) {
  const font = "'Source Sans 3', sans-serif";
  const serif = "'Libre Baskerville', Georgia, serif";
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

// ── Main Component ───────────────────────────────────────────────
export default function NapaUnderHoodPriceDiscovery() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [archiveQuery, setArchiveQuery] = useState("");
  const [archiveResults, setArchiveResults] = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(false);

  useEffect(() => {
    fetch(`${WORKER}/api/article-status?slug=${ARTICLE_SLUG}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === "redirect") navigate("/under-the-hood");
        else setStatus(data.status);
      })
      .catch(() => setStatus("published"));
  }, []);

  const runArchiveSearch = async () => {
    if (!archiveQuery.trim()) return;
    setArchiveLoading(true);
    setArchiveResults([]);
    try {
      const res = await fetch(`${WORKER}/api/rag-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: archiveQuery, top_k: 5 }),
      });
      const data = await res.json();
      setArchiveResults(data.results || []);
    } catch {
      setArchiveResults([]);
    }
    setArchiveLoading(false);
  };

  if (status === "loading") return <div style={{ background: T.bg, minHeight: "100vh" }}><NavBar /></div>;

  const isDraft = status === "draft";

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "'Source Sans 3', sans-serif" }}>
      {isDraft && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: T.surface, borderLeft: `4px solid ${T.gold}`, padding: "10px 20px", fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.ink }}>
          DRAFT — Not published
        </div>
      )}
      <NavBar />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: isDraft ? "80px 20px 60px" : "60px 20px 60px" }}>

        {/* Eyebrow */}
        <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          Under the Hood · Napa Valley Features
        </p>

        {/* Headline */}
        <h1 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 34, fontWeight: 700, color: T.ink, lineHeight: 1.25, marginBottom: 16 }}>
          When the Price Gives Way
        </h1>

        {/* Byline */}
        <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, color: T.muted, marginBottom: 16 }}>By Tim Carl</p>

        {/* Deck */}
        <p style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 18, color: T.muted, lineHeight: 1.6, marginBottom: 24, fontStyle: "italic" }}>
          Three Napa wine-industry assets have moved through the market in ways that expose a widening gap between what sellers expected and what buyers were willing to pay. Together, they mark the first legible pattern of asset-level repricing across Napa's wine and hospitality economy.
        </p>

        {/* Substack link */}
        <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.muted, marginBottom: 32, borderBottom: `1px solid ${T.border}`, paddingBottom: 20 }}>
          Read on{" "}
          <a href="https://napavalleyfocus.substack.com/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>
            Napa Valley Features · Substack →
          </a>
        </p>

        {/* Summary box */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "16px 20px", marginBottom: 32 }}>
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Article Summary</p>
          <p style={{ ...prose, fontSize: 15, marginBottom: 0 }}>
            As of April 2026, price discovery for Napa Valley wine-industry assets has moved from a theoretical risk into a documented pattern. Three transactions — a foreclosure sale of a luxury resort, a brand-only acquisition of a fire-damaged winery and a family estate that failed to sell at two asking prices and is now headed to auction at roughly a third of its original list — show the bid-ask gap widening across hospitality, production and vineyard real estate simultaneously. The Benessere auction, which opens May 13 and closes May 28, will be among the clearest market tests of the year. This article introduces a calculator that models the estimated economic impact on Napa County if broader repricing applies to the region's exposed hospitality and premium wine real estate at four discount rates.
          </p>
        </div>

        {/* ── SECTION 1 ── */}
        <p style={{ ...prose, marginBottom: 18 }}>
          <span style={{ fontWeight: 700 }}>NAPA VALLEY, Calif. —</span>{" "}The price signals are no longer hypothetical. In the span of a few months, three Napa wine-industry assets have moved through the market in ways that expose a widening gap between what sellers expected and what buyers were willing to pay — or, in some cases, not yet willing to pay at all.
        </p>
        <p style={{ ...prose }}>
          Taken individually, each transaction has an explanation. A luxury resort's capital structure was overleveraged. A fire-damaged winery's family was fatigued and ready to exit. A multigenerational estate found no conventional buyers after 17 months and is trying the auction route. Individually, these are stories about specific circumstances. Collectively, they are something else: the first legible pattern of asset-level repricing across Napa's wine and hospitality economy.
        </p>

        {/* ── SECTION 2 ── */}
        <h2 style={h2style}>What the Transactions Show</h2>

        <p style={{ ...prose }}>
          The clearest data point so far is Stanly Ranch. On March 27, 2026, <a href="https://www.sfchronicle.com/bayarea/article/blackstone-napa-stanly-ranch-22160347.php" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Blackstone Real Estate acquired the hotel portion of the Auberge-managed resort</a> at a Napa County courthouse foreclosure auction for $195 million, per the recorded deed. The prior owners had defaulted on debt that had grown to $243.6 million. The original loan was approximately $220 million. Depending on which figure is used as the baseline, the transaction implies an 11% discount against the original loan or a 20% discount against the total debt stack. Operations continue under the Auberge flag. The property earned a Michelin key. Starting nightly rates run approximately $700. This was not a distressed asset by brand or experience — it was a distressed asset by capital structure. That distinction matters because it means the repricing reflects financing conditions, not product failure.
        </p>
        <p style={{ ...prose }}>
          The Stanly Ranch transaction is also a split-asset deal. The vineyard homes and villas did not trade with the hotel. A $100 million lawsuit filed March 6, 2026, in New York State Supreme Court by the Nichols Partnership and Stanly Ranch Resort Napa LLC against GA Development Napa Valley LP and Mandrake Capital Partners adds further complexity to the full accounting. The hotel cleared. Everything else remains legally entangled.
        </p>
        <p style={{ ...prose }}>
          The second transaction is Cain Vineyards &amp; Winery. In December 2025, Third Leaf Partners, a San Francisco investment firm, <a href="https://www.sfchronicle.com/food/wine/article/cain-vineyards-winery-spring-mountain-22094636.php" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>quietly acquired the brand and inventory</a>, as reported by the San Francisco Chronicle. The purchase price was not disclosed. The 500-acre Spring Mountain estate — where the 2020 Glass Fire destroyed the winery, tasting room and a significant portion of the vineyard — is being sold separately to an undisclosed buyer. A long-term grape supply agreement is being negotiated to keep the brand connected to its source vineyard. Two-thirds of the vineyard has been replanted; full restoration is expected by 2030.
        </p>
        <p style={{ ...prose }}>
          The structure of the Cain deal is the signal. In an expansion era, an estate like Cain would move whole — land, brand, winery, grapes and legacy bundled together. This transaction separates them. One party owns the brand. Another will own the land. A contract will connect the grapes. Third Leaf managing partner Alex Pagon described the current environment directly: "There's a lot of financial stress in the valley. There's a lot of pressure, banks are kind of backing away, and a lot of sources of funding are drying up." The nearby Spring Mountain Vineyard followed a similar path: MGG Investment Group acquired the property through bankruptcy auction after the estate defaulted on a $185 million loan from the firm.
        </p>

        {/* Chart 1 */}
        <h3 style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, marginTop: 28 }}>
          Chart 1 — Napa Asset Price Discovery: Selected Transactions, 2023–2026
        </h3>
        <TransactionChart />

        {/* ── SECTION 3 ── */}
        <h2 style={h2style}>Benessere: A Live Market Test</h2>

        <p style={{ ...prose }}>
          The third transaction is not yet complete — which makes it the most instructive to watch.
        </p>
        <p style={{ ...prose }}>
          <a href="https://www.sfchronicle.com/food/wine/article/benessere-napa-valley-auction-22192134.php" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Benessere Vineyards</a>, a 43-acre St. Helena estate at 1010 Big Tree Road, went to market in November 2024 at $35 million. When that produced no serious offers, the price dropped to $28 million. That price also produced no serious offers. The family — John Benish, his 90-year-old mother and four siblings, none of whom live in California — has now listed the property with Concierge Auctions' new Global Wine &amp; Vineyard Division, in cooperation with Sotheby's International Realty. Bidding opens May 13, 2026, and closes May 28 as part of Sotheby's Exceptional Global Properties sale in London. There is no mandatory starting bid. Concierge chief revenue officer Nick Leonard said the firm expects bidding to open between $8 million and $12 million.
        </p>
        <p style={{ ...prose }}>
          Work through the implied discount range. Against the original $35 million asking price, the expected opening bid range represents a 66% to 77% discount. Against the most recent $28 million asking price, it represents a 57% to 71% discount. Even if competitive bidding pushes the final sale price well above the opening range, the gap from original asking price to auction expectation is wide enough to constitute its own market signal.
        </p>
        <p style={{ ...prose }}>
          The Benessere estate includes roughly 29 acres of planted vines — Sangiovese as the flagship, alongside Sagrantino, Pinot Grigio, Aglianico and Falanghina, varietals rarely found elsewhere in Napa Valley — a working winery, a tasting room and two residences totaling more than 6,300 square feet of living space. The Benish family acquired the property in 1994 for $1.5 million after Charles Shaw, the brand behind Trader Joe's Two Buck Chuck, filed for bankruptcy. The family made the estate's focus on Italian varieties its identity. "If my dad were still around, I'm sure we'd still be going strong," John Benish told the San Francisco Chronicle. <a href="https://napavalleyfocus.substack.com/p/wine-chronicles-living-well-differently" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Read the full Benessere profile on Napa Valley Features →</a> "We love the place, but I think in any big family, it's hard to get a consensus about what you want to do for the future."
        </p>
        <p style={{ ...prose }}>
          The Benessere auction is not an isolated case. In 2025, Villa San Juliette, a 160-acre estate in Paso Robles, followed a nearly identical path: originally listed at $22 million in 2022, reduced to roughly $14.75 million, then sent to auction with no minimum bid. It sold in August 2025 for $8.8 million — a 60% discount from its original asking price. Concierge's Leonard acknowledged the pattern directly, saying he expects more wineries will pursue the auction route as the conventional real estate market for wine estates remains slow. According to food and beverage consultant Pat Delong of Azur Associates, the market for wine and vineyard sales in 2026 is on pace to be less than half the size it was in 2021, when roughly $3.5 billion in assets changed hands.
        </p>

        {/* ── SECTION 4 ── */}
        <h2 style={h2style}>The Broader Pattern</h2>

        <p style={{ ...prose }}>
          These transactions do not exist in isolation. As documented in <a href="/under-the-hood/napa-structural-reset-2026" style={{ color: T.accent }}>"Under the Hood: The Reset Spreads"</a> (April 9, 2026), Napa's structural adjustment has moved beyond wine production into the broader visitor economy. The same issue's contraction timeline showed three named hospitality closures — <a href="https://www.sfchronicle.com/food/restaurants/article/charlie-palmer-steak-napa-closing-22181204.php" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Charlie Palmer Steak</a>, Chateau Buena Vista and the JCB Tasting Salon in Yountville — in a four-month window, each handled as a repositioning, none described as a crisis. E. &amp; J. Gallo announced the permanent closure of The Ranch Winery in St. Helena effective April 15, eliminating 93 positions across five North Coast sites. Trinchero Family Wine &amp; Spirits listed two premium mountain vineyards — Haystack on Atlas Peak at $5.5 million and Clouds Nest on Mount Veeder at $4.5 million — two months after acquiring Mumm Napa from Pernod Ricard, a simultaneous pruning and deployment that reflects the portfolio logic of a structural reset.
        </p>
        <p style={{ ...prose }}>
          The pattern across Cain, Stanly Ranch and Benessere represents three different expressions of the same underlying condition: assets that were priced for an era of expanding demand, low-cost capital and rising brand multiples are now being repriced for a market where demand has plateaued, capital is more expensive and the exit options are narrower than sellers anticipated. The hospitality asset repriced through foreclosure. The winery brand repriced through separation from its land. The vineyard estate is repricing through the auction mechanism. Different paths, the same direction.
        </p>
        <p style={{ ...prose }}>
          The Benessere result, when it comes on May 28, will provide one of the clearest data points of the year for this question: Where does the market clear for a mid-sized, independent, operating Napa winery estate when conventional buyers do not appear? Whether the answer is $12 million or $20 million or something in between, it will be a documented, transparent, competitive price — the kind of price discovery the Napa wine real estate market has been short on.
        </p>

        {/* Calculator */}
        <h3 style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, marginTop: 28 }}>
          Interactive: Asset Repricing Scenario Calculator
        </h3>
        <RepricingCalculator />

        {/* ── SECTION 5 ── */}
        <h2 style={h2style}>What Quiet Repricing Looks Like</h2>

        <p style={{ ...prose }}>
          Wholesale prices at the top end of the Napa market have already moved. Trade-level data shows the average wholesale bottle price at the premier trade auction has fallen roughly 39% — from approximately $286 three years prior to $174 in 2026 — a durable downward shift in what the trade is willing to pay. At the same time, Napa County's direct-to-consumer shipment value held at roughly $1.84 billion in 2025 — up 1% — while volume fell 8%, because average prices per bottle rose 9%. The dollars held. The buyers did not grow. That is the arithmetic of a narrowing market: price carries the value line while the buyer pool contracts.
        </p>
        <p style={{ ...prose }}>
          The same dynamic appears to be playing out in real estate. Asking prices stayed elevated long after transaction volume slowed — a common feature of illiquid markets with emotional sellers. What changes that dynamic is price discovery: a transaction that clears publicly, transparently and at a price that other sellers and buyers can reference. Stanly Ranch provided that for luxury hospitality. The Benessere auction could provide it for operating winery estates.
        </p>

        {/* ── SECTION 6 — What to Watch ── */}
        <h2 style={h2style}>What to Watch</h2>

        <p style={{ ...prose }}>
          The useful question is not whether Napa's wine real estate market is in trouble. It is whether the current asking-price anchors across the broader winery and vineyard market reflect the world as it was or the world as it is. When the gap between those two is wide, a market does not correct evenly or quickly. It corrects deal by deal, auction by auction — slowly and unevenly — until enough transactions have cleared at new prices that the old anchors become untenable.
        </p>
        <p style={{ ...prose }}>
          Several signals are worth tracking in the months ahead. The Benessere result on May 28 will be the most direct: a public, competitive, documented clearing price for an operating Napa winery estate. Watch whether that result prompts comparable properties currently listed at conventional asking prices to adjust or re-list through auction. Watch the pace at which Trinchero's Haystack and Clouds Nest vineyard listings move — or don't. Watch for additional split-asset structures in which land, brand and operations trade separately rather than together. And watch Napa County's food service and hospitality employment data from the California Employment Development Department for signs that what is visible in individual closure announcements is accumulating into a broader labor-market shift.
        </p>
        <p style={{ ...prose }}>
          Napa is in the early innings of this process. The documentation is becoming clearer.
        </p>

        {/* ── AUTHOR NOTE ── */}
        <div style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: T.muted, fontStyle: "italic" }}>
            Tim Carl is a Napa Valley-based photojournalist and the founder and editor of Napa Valley, Sonoma County and Lake County Features.
          </p>
        </div>

        {/* ── RELATED COVERAGE ── */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: `2px solid ${T.border}` }}>
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>From the Archive</p>
          <h2 style={{ ...h2style, marginTop: 0, fontSize: 18, marginBottom: 16 }}>Related Coverage</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { slug: "napa-structural-reset-2026", title: "The Reset Spreads", date: "April 9, 2026" },
              { slug: "napa-supply-chain-2026", title: "Under the Hood: How a Global Supply Shock Reaches Napa Valley", date: "April 2, 2026" },
              { slug: "napa-gdp-2024", title: "Napa's Economy Looks Bigger Than It Is", date: "March 24, 2026" },
            ].map(a => (
              <div key={a.slug} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: 14 }}>
                <a href={`/under-the-hood/${a.slug}`} style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 15, fontWeight: 700, color: T.accent, textDecoration: "none", lineHeight: 1.4, display: "block", marginBottom: 6 }}>
                  {a.title}
                </a>
                <p style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 12, color: T.muted, margin: 0 }}>— {a.date}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 14, fontFamily: "'Source Sans 3', sans-serif", fontSize: 14 }}>
            <a href="https://napavalleyfocus.substack.com/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>
              Napa Valley Features on Substack →
            </a>
          </p>
        </div>

        {/* ── ARCHIVE SEARCH ── */}
        <div style={{ marginTop: 40, padding: "20px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6 }}>
          <h3 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 18, fontWeight: 700, color: T.ink, marginBottom: 6 }}>Search Napa Valley Features</h3>
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.muted, marginBottom: 12 }}>Search 1,000+ articles and reports from Napa Valley Features.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={archiveQuery}
              onChange={e => setArchiveQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && runArchiveSearch()}
              placeholder="e.g. winery valuation, hospitality, foreclosure..."
              style={{ flex: 1, padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: 4, fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, background: T.bg, color: T.ink }}
            />
            <button
              onClick={runArchiveSearch}
              style={{ padding: "8px 16px", background: T.accent, color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "'Source Sans 3', sans-serif", fontSize: 14 }}
            >
              {archiveLoading ? "..." : "Search"}
            </button>
          </div>
          {archiveResults.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {archiveResults.map((r, i) => (
                <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < archiveResults.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <a href={r.post_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, fontWeight: 700, color: T.accent, textDecoration: "none" }}>
                    {r.post_title || r.title}
                  </a>
                  <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.muted, margin: "2px 0 0" }}>
                    {(r.chunk_text || r.text || r.content || "").slice(0, 140)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SOURCES ── */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
          <h3 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 12 }}>Sources</h3>
          <ol style={{ paddingLeft: 20 }}>
            {SOURCES.map((s, i) => (
              <li key={i} style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.muted, marginBottom: 6 }}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>{s.label}</a>
              </li>
            ))}
          </ol>
        </div>

        {/* ── POLLS ── */}
        <PollsSection slug={ARTICLE_SLUG} />

        {/* ── METHODOLOGY ── */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: `2px solid ${T.border}` }}>
          <h3 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 10 }}>Methodology</h3>
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.muted, lineHeight: 1.65, marginBottom: 8 }}>
            Transaction figures for Stanly Ranch are drawn from the deed recorded with Napa County on March 27, 2026, and Bloomberg reporting on the total debt stack. The $220 million original loan figure is drawn from SF Chronicle reporting on the default notice recorded in October 2025. Discount calculations are derived directly from these figures — 11% against the original loan, 20% against the total debt stack — and are not estimates.
          </p>
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.muted, lineHeight: 1.65, marginBottom: 8 }}>
            The Spring Mountain Vineyard figure ($43M credit bid vs. $185M loan) reflects a credit bid structure in which the lender, MGG Investment Group, acquired the property against assumed debt rather than through a cash market sale. This structure differs materially from the Stanly Ranch and Benessere transactions and is flagged as such in Chart 1.
          </p>
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.muted, lineHeight: 1.65, marginBottom: 8 }}>
            The Asset Repricing Scenario Calculator applies four discount rates (10%, 25%, 50%, 75%) to an estimated $4 billion in exposed Napa hospitality and premium wine real estate — consistent with the asset base used in the prior "Reset Spreads" calculator. A 40% GDP pass-through multiplier is applied to estimate economic drag. The GDP base of $11.31 billion reflects BEA 2024 real GDP data for Napa County (FRED series REALGDPALL06055). These are directional estimates and do not constitute a BEA or county economic forecast.
          </p>
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.muted, lineHeight: 1.65 }}>
            The views, opinions and data presented in this article are those of the author and do not necessarily reflect the official policy, position or perspective of Napa Valley Features or its editorial team.
          </p>
        </div>

      </div>
      <Footer />
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import NavBar from "./NavBar";

// ─── theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:      "#F5F0E8",
  surface: "#EDE8DE",
  ink:     "#2C1810",
  accent:  "#8B5E3C",
  gold:    "#C4A050",
  muted:   "#8B7355",
  border:  "#D4C9B8",
};

const PUBLISHED = false;

const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";
const ARTICLE_SLUG = "napa-supply-chain-2026";


// ─── live poll component ──────────────────────────────────────────────────────
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
      <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 10, letterSpacing: "0.1em", color: T.gold, fontWeight: 700, textTransform: "uppercase", margin: "0 0 8px 0" }}>Poll</p>
      <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 700, color: T.ink, margin: "0 0 14px 0", lineHeight: 1.4 }}>{poll.question}</p>

      {options.map((opt, idx) => {
        const count = counts[idx] || 0;
        const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
        const isVoted = voted === idx;

        return (
          <div key={idx} style={{ marginBottom: 8 }}>
            {voted === null ? (
              <button onClick={() => vote(idx)} disabled={loading}
                style={{ width: "100%", textAlign: "center", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, padding: "9px 12px", fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: T.ink, cursor: loading ? "default" : "pointer" }}>
                {opt}
              </button>
            ) : (
              <div style={{ position: "relative", overflow: "hidden", borderRadius: 4, border: `1px solid ${isVoted ? T.accent : T.border}` }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: pct + "%", background: isVoted ? "rgba(139,94,60,0.15)" : "rgba(139,94,60,0.06)", transition: "width 0.5s ease" }} />
                <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px" }}>
                  <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: T.ink, fontWeight: isVoted ? 600 : 400 }}>{opt}</span>
                  <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.muted, marginLeft: 12, whiteSpace: "nowrap" }}>{pct}%</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {voted !== null && (
        <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: T.muted, margin: "10px 0 0 0" }}>{total} {total === 1 ? "vote" : "votes"} · Results update in real time</p>
      )}
    </div>
  );
}

// ─── polls section ────────────────────────────────────────────────────────────
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
    <div style={{ padding: "24px 0", fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: T.muted }}>Loading polls...</div>
  );
  if (!polls.length) return null;

  return (
    <div style={{ borderTop: `2px solid ${T.border}`, marginTop: 48, paddingTop: 32 }}>
      <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 10, letterSpacing: "0.1em", color: T.gold, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px 0" }}>Today's Polls</p>
      <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 20px 0" }}>What do you think?</h2>
      {polls.map(poll => <LivePoll key={poll.id} poll={poll} />)}
      <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>
        Poll results are anonymous and stored on NapaServe. Results shown after you vote.
        Historical reader polls from Napa Valley Features are searchable in the{" "}
        <a href="/dashboard" style={{ color: T.accent }}>Community Pulse dashboard</a>.
      </p>
    </div>
  );
}

// ─── archive search ───────────────────────────────────────────────────────────
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
      <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 10, letterSpacing: "0.1em", color: T.gold, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px 0" }}>Archive</p>
      <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 6px 0" }}>Search Napa Valley Features</h2>
      <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: T.muted, margin: "0 0 16px 0" }}>Search 1,000+ articles and reports from Napa Valley Features.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Search supply chain, energy costs, economic impact..."
          style={{ flex: 1, padding: "10px 14px", fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: T.ink, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, outline: "none" }}
        />
        <button onClick={search} disabled={loading}
          style={{ padding: "10px 20px", background: T.accent, color: "#fff", border: "none", borderRadius: 6, fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, fontWeight: 600, cursor: loading ? "default" : "pointer" }}>
          {loading ? "..." : "Search"}
        </button>
      </div>

      {searched && !loading && results.length === 0 && (
        <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: T.muted }}>No results found. Try different keywords.</p>
      )}

      {results.map((r, i) => (
        <div key={i} style={{ borderBottom: `1px solid ${T.border}`, padding: "14px 0" }}>
          {r.post_url ? (
            <a href={r.post_url} target="_blank" rel="noreferrer"
              style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 700, color: T.accent, textDecoration: "none", display: "block", marginBottom: 4 }}>
              {r.post_title || r.title || "Article"}
            </a>
          ) : (
            <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 700, color: T.ink, margin: "0 0 4px 0" }}>{r.post_title || r.title || "Article"}</p>
          )}
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.ink, margin: "0 0 4px 0", lineHeight: 1.5 }}>{r.chunk_text || r.text || r.content || ""}</p>
          {r.post_url && (
            <a href={r.post_url} target="_blank" rel="noreferrer"
              style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: T.muted }}>Read full article →</a>
       )}
        </div>
      ))}

      {results.length > 0 && (
        <a href="/archive" style={{ display: "inline-block", marginTop: 16, fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: T.accent, textDecoration: "underline" }}>
          Open full archive search →
        </a>
      )}
    </div>
  );
}

// ─── chart helpers ────────────────────────────────────────────────────────────
function ChartBox({ title, caption, children }) {
  return (
    <div style={{ background: T.surface, borderRadius: 8, padding: "24px", margin: "32px 0", border: `1px solid ${T.border}` }}>
      <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 700, color: T.ink, margin: "0 0 4px 0" }}>{title}</p>
      {children}
      <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: T.muted, marginTop: 12, lineHeight: 1.5 }}>{caption}</p>
    </div>
  );
}

// ─── shared chart styles ──────────────────────────────────────────────────────
const C = {
  bg: "#FAF6F0",
  border: "#D4C4A8",
  grid: "#DDD8CC",
  ink: "#2C1810",
  secondary: "#5C4033",
  gold: "#C4A050",
  accent: "#8B5E3C",
  blue: "#4A7BA7",
  red: "#C05050",
  tan: "#C4956A",
  green: "#5A6E3A",
};
const mono = "'Source Code Pro', monospace";
const sans = "'Source Sans 3', sans-serif";
const serif = "'Libre Baskerville', Georgia, serif";

function downloadChartPng(canvasRef, filename) {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const off = document.createElement("canvas");
  off.width = canvas.width;
  off.height = canvas.height + 28;
  const ctx = off.getContext("2d");
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, off.width, off.height);
  ctx.drawImage(canvas, 0, 0);
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.font = "10px 'Source Code Pro', monospace";
  ctx.fillStyle = "#8B7355";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("napaserve.org", off.width - 12, off.height - 8);
  ctx.restore();
  const link = document.createElement("a");
  link.download = filename;
  link.href = off.toDataURL("image/png");
  link.click();
}

const dlBtnStyle = {
  marginTop: 8, padding: "4px 12px", fontSize: 11,
  fontFamily: mono, letterSpacing: "0.08em", color: "#8B7355",
  background: "transparent", border: "1px solid #D4C4A8",
  borderRadius: 3, cursor: "pointer", display: "block",
};

const statBoxStyle = {
  background: "#EDE8DE", borderRadius: 6, padding: "14px 16px", textAlign: "center", flex: 1,
};

const watermarkPlugin = {
  id: "watermark",
  afterDraw(chart) {
    const ctx = chart.ctx;
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.font = "10px 'Source Code Pro', monospace";
    ctx.fillStyle = "#8B7355";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText("napaserve.org", chart.width - 10, chart.height - 6);
    ctx.restore();
  },
};

// ─── CHART 1: Hormuz Strait Tanker Traffic Collapse ──────────────────────────
function Chart1_HormuzTraffic() {
  const ref = useRef(null);
  useEffect(() => {
    if (!window.Chart || !ref.current) return;
    const labels = ["Feb 20","Feb 24","Feb 27","Feb 28","Mar 1","Mar 2","Mar 4","Mar 8","Mar 12","Mar 16","Mar 20","Mar 26"];
    const data = [110,108,105,55,8,2,3,5,6,8,7,5];
    const ch = new window.Chart(ref.current, {
      type: "line",
      data: {
        labels,
        datasets: [{
          data,
          borderColor: C.blue,
          backgroundColor: "rgba(196,168,100,0.13)",
          fill: true,
          tension: 0.3,
          borderWidth: 2.5,
          pointRadius: data.map((_, i) => i === 3 ? 6 : 3.5),
          pointBackgroundColor: data.map((_, i) => i === 3 ? C.red : C.blue),
          pointBorderColor: "#fff",
          pointBorderWidth: 1.5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.parsed.y + " ships/day" } } },
        scales: {
          x: { ticks: { color: C.secondary, font: { size: 10, family: sans } }, grid: { color: C.grid } },
          y: { min: 0, max: 130, ticks: { color: C.secondary, font: { size: 10, family: sans } }, grid: { color: C.grid }, title: { display: true, text: "ships/day", color: C.secondary, font: { size: 10, family: sans } } },
        },
      },
      plugins: [watermarkPlugin],
    });
    return () => ch.destroy();
  }, []);

  return (
    <>
      <div style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold, marginBottom: 8 }}>
        CHART 1 — HORMUZ STRAIT
      </div>
      <div style={{ position: "relative", width: "100%", height: 300 }}><canvas ref={ref} /></div>
      <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        <div style={statBoxStyle}>
          <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.ink }}>~110</div>
          <div style={{ fontFamily: mono, fontSize: 10, textTransform: "uppercase", color: C.secondary, marginTop: 4 }}>Pre-war daily transits</div>
        </div>
        <div style={statBoxStyle}>
          <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.red }}>4–5</div>
          <div style={{ fontFamily: mono, fontSize: 10, textTransform: "uppercase", color: C.secondary, marginTop: 4 }}>Current daily transits</div>
        </div>
        <div style={statBoxStyle}>
          <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.tan }}>~2,000</div>
          <div style={{ fontFamily: mono, fontSize: 10, textTransform: "uppercase", color: C.secondary, marginTop: 4 }}>Vessels stranded nearby</div>
        </div>
      </div>
      <p style={{ fontFamily: sans, fontSize: 11, color: C.secondary, marginTop: 12, lineHeight: 1.5 }}>
        Source: Lloyd's List Intelligence; Windward Maritime AI (March 20, 2026) — 94.2% decline. IMO Secretary-General statement; NPR (March 23, 2026).
      </p>
      <button onClick={() => downloadChartPng(ref, "chart-1_hormuz-traffic-collapse_nvf_2026.png")} style={dlBtnStyle}>DOWNLOAD CHART PNG</button>
    </>
  );
}

// ─── CHART 2: Commodity Before vs. After ─────────────────────────────────────
function Chart2_CommodityBeforeAfter() {
  const ref = useRef(null);
  useEffect(() => {
    if (!window.Chart || !ref.current) return;
    const labels = ["Crude oil\n(mb/day)","LNG\n(bcm/mo)","LPG\n(mt/mo)","Fertilizers\n(mt/mo)","Dry bulk\n(mt/day)"];
    const normal = [20, 9.3, 5.2, 4.1, 1.8];
    const current = [1.2, 0.5, 0.5, 0.6, 0.16];
    const pctLost = [94, 95, 90, 85, 91];

    const pctLabelPlugin = {
      id: "pctLabels",
      afterDatasetsDraw(chart) {
        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(1);
        ctx.save();
        ctx.font = "bold 11px 'Source Sans 3', sans-serif";
        ctx.fillStyle = C.red;
        ctx.textAlign = "center";
        meta.data.forEach((bar, i) => {
          ctx.fillText("\u2212" + pctLost[i] + "%", bar.x, bar.y - 8);
        });
        ctx.restore();
      },
    };

    const ch = new window.Chart(ref.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Normal flow", data: normal, backgroundColor: C.blue, borderRadius: 3 },
          { label: "Current flow", data: current, backgroundColor: C.red, borderRadius: 3 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.dataset.label + ": " + c.parsed.y } } },
        scales: {
          x: { ticks: { color: C.secondary, font: { size: 10, family: sans }, maxRotation: 0 }, grid: { color: C.grid } },
          y: { ticks: { color: C.secondary, font: { size: 10, family: sans } }, grid: { color: C.grid }, min: 0 },
        },
      },
      plugins: [watermarkPlugin, pctLabelPlugin],
    });
    return () => ch.destroy();
  }, []);

  return (
    <>
      <div style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold, marginBottom: 8 }}>
        CHART 2 — BEFORE VS. AFTER
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10, fontSize: 11, color: C.secondary, fontFamily: sans }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: C.blue }} />Normal daily flow (pre-war)</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: C.red }} />Current estimated flow (March 2026)</span>
      </div>
      <div style={{ position: "relative", width: "100%", height: 320 }}><canvas ref={ref} /></div>
      <p style={{ fontFamily: sans, fontSize: 11, color: C.secondary, marginTop: 12, lineHeight: 1.5 }}>
        Sources: UNCTAD Strait of Hormuz Disruptions report (March 10, 2026); IEA; Kpler (March 2026). Current flows estimated from 94% tanker transit decline and commodity-specific disruption reports.
      </p>
      <button onClick={() => downloadChartPng(ref, "chart-2_commodity-before-after_nvf_2026.png")} style={dlBtnStyle}>DOWNLOAD CHART PNG</button>
    </>
  );
}

// ─── CHART 3: Energy Price Shock ─────────────────────────────────────────────
function Chart3_EnergyPriceShock() {
  const ref = useRef(null);
  useEffect(() => {
    if (!window.Chart || !ref.current) return;
    const labels = ["Nov 2025","Dec 2025","Jan 2026","Feb 1–27","Mar 1","Mar 4\nQatar FM","Mar 8\n$100+","Mar peak\n$126","Mar 27"];
    const brent = [72,75,78,82,90,98,104,126,112];
    const gas = [28,30,29,30,38,62,72,80,74];
    const ch = new window.Chart(ref.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Brent crude ($/bbl)", data: brent, borderColor: C.blue, backgroundColor: "transparent", tension: 0.3, borderWidth: 2.5, pointRadius: 3.5, pointBackgroundColor: C.blue, pointBorderColor: "#fff", pointBorderWidth: 1, yAxisID: "y" },
          { label: "European gas (€/MWh)", data: gas, borderColor: C.tan, backgroundColor: "transparent", tension: 0.3, borderWidth: 2, borderDash: [5, 4], pointRadius: 3.5, pointBackgroundColor: C.tan, pointBorderColor: "#fff", pointBorderWidth: 1, yAxisID: "y2" },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: C.secondary, font: { size: 9, family: sans }, maxRotation: 0 }, grid: { color: C.grid } },
          y: { position: "left", ticks: { color: C.secondary, font: { size: 10, family: sans }, callback: v => "$" + v }, grid: { color: C.grid }, title: { display: true, text: "Brent ($/bbl)", color: C.secondary, font: { size: 10 } } },
          y2: { position: "right", ticks: { color: C.tan, font: { size: 10, family: sans }, callback: v => "€" + v }, grid: { display: false }, title: { display: true, text: "EU gas (€/MWh)", color: C.tan, font: { size: 10 } } },
        },
      },
      plugins: [watermarkPlugin],
    });
    return () => ch.destroy();
  }, []);

  return (
    <>
      <div style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold, marginBottom: 8 }}>
        CHART 3 — ENERGY PRICE SHOCK
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10, fontSize: 11, color: C.secondary, fontFamily: sans }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ display: "inline-block", width: 20, height: 0, border: "2px solid " + C.blue, verticalAlign: "middle" }} />Brent crude ($/bbl, left)</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ display: "inline-block", width: 20, height: 0, border: "2px dashed " + C.tan, verticalAlign: "middle" }} />European gas (€/MWh, right)</span>
      </div>
      <div style={{ position: "relative", width: "100%", height: 300 }}><canvas ref={ref} /></div>
      <p style={{ fontFamily: sans, fontSize: 11, color: C.secondary, marginTop: 12, lineHeight: 1.5 }}>
        Source: Wikipedia, 2026 Strait of Hormuz crisis; World Economic Forum trade update (March 2026). Brent peaked $126/bbl. EU gas doubled from ~€30 to above €60/MWh within days of Qatar Ras Laffan force majeure (March 4, 2026).
      </p>
      <button onClick={() => downloadChartPng(ref, "chart-3_energy-price-shock_nvf_2026.png")} style={dlBtnStyle}>DOWNLOAD CHART PNG</button>
    </>
  );
}

// ─── CHART 4: Napa GDP and Employment Gap ────────────────────────────────────
function Chart4_NapaGdpEmploymentGap() {
  const refA = useRef(null);
  const refB = useRef(null);

  // 4A — Nominal vs Real GDP
  useEffect(() => {
    if (!window.Chart || !refA.current) return;
    const labels = ["2016","2017","2018","2019","2020","2021","2022","2023","2024"];
    const nominal = [10.75,11.12,11.42,11.57,11.07,12.78,12.74,13.97,14.59];
    const real = [10.82,11.00,11.11,11.09,10.35,11.46,11.05,11.19,11.31];

    const gapFillPlugin = {
      id: "gdpGapFill",
      afterDatasetsDraw(chart) {
        const metaNom = chart.getDatasetMeta(0);
        const metaReal = chart.getDatasetMeta(1);
        if (!metaNom.data.length || !metaReal.data.length) return;
        const ctx = chart.ctx;
        ctx.save();
        ctx.fillStyle = "rgba(196,168,100,0.18)";
        ctx.beginPath();
        for (let i = 0; i < metaNom.data.length; i++) {
          const pt = metaNom.data[i];
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        for (let i = metaReal.data.length - 1; i >= 0; i--) {
          ctx.lineTo(metaReal.data[i].x, metaReal.data[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      },
    };

    const ch = new window.Chart(refA.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Nominal GDP ($B)", data: nominal, borderColor: C.blue, backgroundColor: "transparent", tension: 0.3, borderWidth: 2.5, pointRadius: 3.5, pointBackgroundColor: C.blue, pointBorderColor: "#fff", pointBorderWidth: 1 },
          { label: "Real GDP ($B, 2017$)", data: real, borderColor: C.green, backgroundColor: "transparent", tension: 0.3, borderWidth: 2.5, pointRadius: 3.5, pointBackgroundColor: C.green, pointBorderColor: "#fff", pointBorderWidth: 1 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: C.secondary, font: { size: 10, family: sans } }, grid: { color: C.grid } },
          y: { min: 9.5, ticks: { color: C.secondary, font: { size: 10, family: sans }, callback: v => "$" + v + "B" }, grid: { color: C.grid } },
        },
      },
      plugins: [watermarkPlugin, gapFillPlugin],
    });
    return () => ch.destroy();
  }, []);

  // 4B — Leisure & Hospitality Employment
  useEffect(() => {
    if (!window.Chart || !refB.current) return;
    const labels = ["2009","2010","2011","2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023","2024","2025"];
    const actual = [9.0,9.9,10.8,11.2,11.6,12.2,12.8,12.9,13.3,13.9,14.3,8.9,11.2,13.5,13.9,14.0,14.1];
    const trend = [9.0,9.5,10.2,10.8,11.5,12.1,12.8,13.4,14.1,14.7,15.4,16.0,16.6,17.3,17.9,18.5,18.9];

    const empGapPlugin = {
      id: "empGapFill",
      afterDatasetsDraw(chart) {
        const metaActual = chart.getDatasetMeta(0);
        const metaTrend = chart.getDatasetMeta(1);
        if (!metaActual.data.length || !metaTrend.data.length) return;
        const ctx = chart.ctx;
        ctx.save();
        ctx.fillStyle = "rgba(196,140,120,0.18)";
        ctx.beginPath();
        const startIdx = 10; // 2019
        ctx.moveTo(metaActual.data[startIdx].x, metaActual.data[startIdx].y);
        for (let i = startIdx; i < metaActual.data.length; i++) {
          ctx.lineTo(metaActual.data[i].x, metaActual.data[i].y);
        }
        for (let i = metaTrend.data.length - 1; i >= startIdx; i--) {
          ctx.lineTo(metaTrend.data[i].x, metaTrend.data[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      },
    };

    const ch = new window.Chart(refB.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Actual employment", data: actual, borderColor: C.blue, backgroundColor: "transparent", tension: 0.3, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: C.blue, pointBorderColor: "#fff", pointBorderWidth: 1 },
          { label: "2009–2019 trend", data: trend, borderColor: C.tan, backgroundColor: "transparent", tension: 0.3, borderWidth: 2, borderDash: [5, 4], pointRadius: 0 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: C.secondary, font: { size: 10, family: sans } }, grid: { color: C.grid } },
          y: { min: 7, ticks: { color: C.secondary, font: { size: 10, family: sans }, callback: v => v + "k" }, grid: { color: C.grid } },
        },
      },
      plugins: [watermarkPlugin, empGapPlugin],
    });
    return () => ch.destroy();
  }, []);

  return (
    <>
      <div style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold, marginBottom: 8 }}>
        CHART 4 — NAPA'S ECONOMIC CUSHION
      </div>

      {/* 4A: GDP */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10, fontSize: 11, color: C.secondary, fontFamily: sans }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ display: "inline-block", width: 20, height: 0, border: "2px solid " + C.blue }} />Nominal GDP ($B)</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ display: "inline-block", width: 20, height: 0, border: "2px solid " + C.green }} />Real GDP ($B, 2017$)</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ display: "inline-block", width: 12, height: 12, background: "rgba(196,168,100,0.18)", border: "1px solid #D4C4A8" }} />Inflation gap</span>
      </div>
      <div style={{ position: "relative", width: "100%", height: 280 }}><canvas ref={refA} /></div>

      <div style={{ display: "flex", gap: 12, marginTop: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <div style={statBoxStyle}>
          <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.blue }}>35.8%</div>
          <div style={{ fontFamily: mono, fontSize: 10, textTransform: "uppercase", color: C.secondary, marginTop: 4 }}>Nominal GDP growth 2016–2024</div>
        </div>
        <div style={statBoxStyle}>
          <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.green }}>4.6%</div>
          <div style={{ fontFamily: mono, fontSize: 10, textTransform: "uppercase", color: C.secondary, marginTop: 4 }}>Real GDP growth 2016–2024</div>
        </div>
        <div style={statBoxStyle}>
          <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.tan }}>87¢</div>
          <div style={{ fontFamily: mono, fontSize: 10, textTransform: "uppercase", color: C.secondary, marginTop: 4 }}>Of every $1 growth was inflation</div>
        </div>
      </div>

      {/* 4B: Employment */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10, fontSize: 11, color: C.secondary, fontFamily: sans }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ display: "inline-block", width: 20, height: 0, border: "2px solid " + C.blue }} />Actual employment (thousands)</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ display: "inline-block", width: 20, height: 0, border: "2px dashed " + C.tan }} />2009–2019 trend</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ display: "inline-block", width: 12, height: 12, background: "rgba(196,140,120,0.18)", border: "1px solid #D4C4A8" }} />Employment gap</span>
      </div>
      <div style={{ position: "relative", width: "100%", height: 280 }}><canvas ref={refB} /></div>

      <p style={{ fontFamily: sans, fontSize: 11, color: C.secondary, marginTop: 12, lineHeight: 1.5 }}>
        Source: BEA via FRED (GDPALL06055, REALGDPALL06055); BLS (NAPA906LEIHN). Wine industry = 72% of county jobs, 74% of wages. Source: Insel & Company for Napa Valley Vintners, May 2025 (2022 data).
      </p>
      <button onClick={() => downloadChartPng(refA, "chart-4_napa-gdp-employment-gap_nvf_2026.png")} style={dlBtnStyle}>DOWNLOAD CHART PNG</button>
    </>
  );
}

// ─── Scenario Calculator ─────────────────────────────────────────────────────
function ScenarioCalculator() {
  const [costSlider, setCostSlider] = useState(10);
  const [visitSlider, setVisitSlider] = useState(10);
  const [durSlider, setDurSlider] = useState(2);

  const BASE_JOBS = 55875;
  const BASE_WAGES = 3820;
  const HOSP_SPEND = 1200;
  const WINE_MARGIN = 0.18;
  const WINE_CONTRACTION = 1.08;
  const NOM_PASS = 0.60;
  const COUNTY_GDP = 14590;
  const DUR = { 1: 0.25, 2: 0.5, 3: 1.0 };

  const cost = costSlider / 100;
  const visit = visitSlider / 100;
  const dur = DUR[durSlider];
  const wineJobs = BASE_JOBS * cost * WINE_MARGIN * 0.55 * dur;
  const hospJobs = HOSP_SPEND * visit * 0.40 * dur;
  const totalJobs = Math.round((wineJobs + hospJobs) * WINE_CONTRACTION);
  const wineWages = wineJobs * 68;
  const hospWages = hospJobs * 42;
  const totalWages = Math.round((wineWages + hospWages) / 1000);
  const gapWidening = Math.round(COUNTY_GDP * 0.52 * cost * NOM_PASS * dur);

  const fmtJobs = v => v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(v);
  const fmtMoney = v => v >= 1000 ? "$" + (v / 1000).toFixed(1) + "B" : "$" + v + "M";

  const durLabels = { 1: "3 months", 2: "6 months", 3: "12 months" };

  const sliderTrack = {
    width: "100%", height: 4, appearance: "none", WebkitAppearance: "none",
    background: "#D4C4A8", borderRadius: 2, outline: "none", cursor: "pointer",
  };

  const presetActive = { background: C.accent, color: "#fff", border: "1px solid " + C.accent, borderRadius: 4, padding: "4px 12px", fontSize: 12, fontFamily: sans, fontWeight: 600, cursor: "pointer" };
  const presetInactive = { background: "transparent", color: C.secondary, border: "1px solid #C4A882", borderRadius: 4, padding: "4px 12px", fontSize: 12, fontFamily: sans, fontWeight: 400, cursor: "pointer" };

  return (
    <div style={{ background: "#FAF6F0", border: "1px solid #D4C4A8", borderRadius: 8, padding: 28, margin: "32px 0" }}>
      <div style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>
        INTERACTIVE · SCENARIO CALCULATOR
      </div>
      <h3 style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, color: C.ink, margin: "0 0 8px 0" }}>
        Napa Valley Supply Shock Impact Estimator
      </h3>
      <p style={{ fontFamily: sans, fontSize: 14, color: C.secondary, margin: "0 0 16px 0", lineHeight: 1.5 }}>
        Adjust three variables to explore how the Hormuz supply shock compounds with Napa's pre-existing economic fragility.
      </p>

      {/* Context box */}
      <div style={{ background: "#EDE8DE", borderRadius: 6, padding: "12px 16px", marginBottom: 20 }}>
        <p style={{ fontFamily: sans, fontSize: 12, color: C.secondary, margin: 0, lineHeight: 1.6 }}>
          Pre-shock baseline (Insel & Company, 2022): 55,875 wine-related jobs · $3.82B wages · 72% of county employment. GDP gap already present: 87¢ of every dollar of apparent growth since 2016 was inflation.
        </p>
      </div>

      {/* Slider 1: Input cost */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 6 }}>
          Input cost increase (fuel, freight, parts): <span style={{ color: C.accent, fontWeight: 700 }}>+{costSlider}%</span>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          {[5, 10, 20, 30].map(v => (
            <button key={v} onClick={() => setCostSlider(v)} style={costSlider === v ? presetActive : presetInactive}>+{v}%</button>
          ))}
        </div>
        <style>{`input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:${C.accent};cursor:pointer;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.2)}input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:${C.accent};cursor:pointer;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.2)}`}</style>
        <input type="range" min={0} max={30} step={1} value={costSlider} onChange={e => setCostSlider(Number(e.target.value))} style={sliderTrack} />
      </div>

      {/* Slider 2: Visitor spend */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 6 }}>
          Visitor spend decline: <span style={{ color: C.accent, fontWeight: 700 }}>{"\u2212"}{visitSlider}%</span>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          {[5, 10, 15, 25].map(v => (
            <button key={v} onClick={() => setVisitSlider(v)} style={visitSlider === v ? presetActive : presetInactive}>{"\u2212"}{v}%</button>
          ))}
        </div>
        <input type="range" min={0} max={25} step={1} value={visitSlider} onChange={e => setVisitSlider(Number(e.target.value))} style={sliderTrack} />
      </div>

      {/* Slider 3: Duration */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 6 }}>
          Duration of shock: <span style={{ color: C.accent, fontWeight: 700 }}>{durLabels[durSlider]}</span>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          {[1, 2, 3].map(v => (
            <button key={v} onClick={() => setDurSlider(v)} style={durSlider === v ? presetActive : presetInactive}>{durLabels[v]}</button>
          ))}
        </div>
        <input type="range" min={1} max={3} step={1} value={durSlider} onChange={e => setDurSlider(Number(e.target.value))} style={sliderTrack} />
      </div>

      {/* Output stat boxes */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ ...statBoxStyle, background: "#EDE8DE" }}>
          <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.red }}>{fmtJobs(totalJobs)}</div>
          <div style={{ fontFamily: mono, fontSize: 10, textTransform: "uppercase", color: C.secondary, marginTop: 4 }}>Jobs at additional risk</div>
        </div>
        <div style={{ ...statBoxStyle, background: "#EDE8DE" }}>
          <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.tan }}>{fmtMoney(totalWages)}</div>
          <div style={{ fontFamily: mono, fontSize: 10, textTransform: "uppercase", color: C.secondary, marginTop: 4 }}>Wage pressure /yr</div>
        </div>
        <div style={{ ...statBoxStyle, background: "#EDE8DE", padding: 16, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {(() => {
            const shockPct = Math.min(gapWidening / (COUNTY_GDP * 0.52) * 100, 12);
            const realPct = Math.max(13 - shockPct, 1);
            const inflationDeg = 87 / 100 * 360;
            const shockDeg = shockPct / 100 * 360;
            const polarToCartesian = (cx, cy, r, angleDeg) => {
              const rad = (angleDeg - 90) * Math.PI / 180;
              return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
            };
            const arcPath = (cx, cy, r, startDeg, endDeg) => {
              const s = polarToCartesian(cx, cy, r, startDeg);
              const e = polarToCartesian(cx, cy, r, endDeg);
              const large = endDeg - startDeg > 180 ? 1 : 0;
              return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
            };
            const r = 48;
            const cx = 50;
            const cy = 50;
            return (
              <>
                <svg width={100} height={100} viewBox="0 0 100 100" style={{ display: "block", marginBottom: 8 }}>
                  <circle cx={cx} cy={cy} r={r} fill="none" stroke="#D4C4A8" strokeWidth={1} />
                  <path d={arcPath(cx, cy, r, 0, inflationDeg)} fill="#C4956A" />
                  <path d={arcPath(cx, cy, r, inflationDeg, inflationDeg + shockDeg)} fill="#C05050" />
                  <path d={arcPath(cx, cy, r, inflationDeg + shockDeg, 360)} fill="#5A6E3A" />
                </svg>
                <div style={{ fontFamily: mono, fontSize: 10, textTransform: "uppercase", color: C.secondary, marginBottom: 4 }}>OF EVERY APPARENT $1</div>
                <div style={{ fontFamily: serif, fontSize: 13, color: C.ink, textAlign: "center", lineHeight: 1.5 }}>
                  87¢ inflation before shock · +{Math.round(shockPct)}¢ from this shock · {Math.max(Math.round(13 - shockPct), 1)}¢ real output
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Result narrative */}
      <div style={{ background: "#EDE8DE", borderRadius: 6, padding: "14px 18px", marginBottom: 16 }}>
        <p style={{ fontFamily: serif, fontSize: 13, color: C.ink, lineHeight: 1.8, margin: 0 }}>
          At a <span style={{ color: C.red, fontWeight: 700 }}>+{costSlider}%</span> input cost increase and <span style={{ color: C.red, fontWeight: 700 }}>{"\u2212"}{visitSlider}%</span> visitor decline sustained for <strong>{durLabels[durSlider]}</strong>, the model estimates <span style={{ color: C.red, fontWeight: 700 }}>{fmtJobs(totalJobs)}</span> additional jobs at risk, <span style={{ color: C.red, fontWeight: 700 }}>{fmtMoney(totalWages)}</span> in annualized wage pressure, and a <span style={{ color: C.green, fontWeight: 700 }}>{fmtMoney(gapWidening)}</span> widening of the gap between nominal and real GDP — layered on top of the structural fragility Napa was already carrying before the Hormuz shock.
          {costSlider >= 20 && visitSlider >= 15 && (
            <span> At these combined levels, the pressure approaches the 2020 COVID-fire double shock — but without the federal stimulus cushion that partially offset that year's damage.</span>
          )}
        </p>
      </div>

      <p style={{ fontFamily: sans, fontSize: 11, fontStyle: "italic", color: C.secondary, margin: "0 0 10px 0", lineHeight: 1.5 }}>
        Property tax assessments do not automatically decline under Proposition 13. Actual revenue impacts depend on ownership changes and reassessment timing.
      </p>
      <p style={{ fontFamily: sans, fontSize: 11, color: C.secondary, margin: 0, lineHeight: 1.5 }}>
        Methodology: Figures scaled from 2022 Insel & Company baseline (NVV). Cost shock at 18% avg operating margin. Visitor spend from estimated $1.2B annual L&H spend. Duration: 3mo=0.25×, 6mo=0.5×, 12mo=1.0×. GDP gap at 60% nominal pass-through. Pre-existing wine contraction factor 1.08×.
      </p>
    </div>
  );
}

// ─── article sections ─────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "intro", heading: null, body: "A vineyard manager prices diesel for a week of tractor work. A winery waits on a part for a cooling system. A packaging order gets harder to quote. A hotel manager watches booking patterns for signs that visitors are pulling back.\n\nThose are routine decisions in Napa Valley. They no longer sit inside a routine global economy.\n\nThe current shock begins in a place many readers know by name but may not fully grasp as a system: the Strait of Hormuz. On Feb. 28, coordinated U.S.-Israeli airstrikes on Iran triggered a sequence of events that has brought the global economy to the edge of one of its worst energy crises in decades. Iran\u2019s Islamic Revolutionary Guard Corps declared the strait closed, tanker traffic ground to a near halt, and oil prices surged faster than during any other conflict in recent history. Brent crude exceeded $100 per barrel March 8 for the first time in four years, reaching a peak of $126. The IEA\u2019s executive director described the current situation as worse than the combined oil crises of 1973 and 1979. UNCTAD documented the most immediate maritime impact: traffic through the strait fell from roughly 110 ships a day to fewer than 10 \u2014 a decline of more than 94% \u2014 according to Lloyd\u2019s List Intelligence and Windward Maritime AI data through March 20.", chart: null },
  { id: "hormuz", heading: "What Moves Through the Strait", body: "The strait is not only an oil story. That is the essential premise for understanding why Napa is exposed.\n\nThe Hormuz passage carries roughly 20% of all global seaborne oil trade and approximately 20% of global LNG, according to UNCTAD and IEA data. It also carries liquefied petroleum gas, refined products, fertilizers and the chemical inputs that flow downstream into industrial production worldwide. Qatar\u2019s Ras Laffan facility \u2014 one of the world\u2019s largest LNG export terminals \u2014 declared force majeure on all LNG shipments March 4 after Iranian attacks on its infrastructure, removing roughly 20% of the world\u2019s LNG supply from the market in a single day. European natural gas prices roughly doubled within days, from about €30 per megawatt-hour to above €60. Asian LNG spot prices surged more sharply. Dry bulk transits through the strait are down 91%, with approximately 280 vessels trapped in the region, according to Kpler vessel tracking data.\n\nThat matters locally even if Napa businesses do not buy LNG directly. Natural gas stress moves through electricity costs, industrial heat, fertilizers, chemicals and the production chain for materials that vineyards, wineries, hotels and restaurants rely on. It also reaches Napa indirectly through visitor-origin economies in Europe and Asia, where households and businesses are absorbing the same energy squeeze. The same conflict that raises input costs here weakens spending power there.", chart: { component: Chart1_HormuzTraffic, title: "Hormuz Strait Tanker Traffic Collapse", caption: "Source: Lloyd's List Intelligence; Windward Maritime AI (March 20, 2026). Traffic fell from ~110 ships/day to fewer than 10 — a 94.2% decline. ~2,000 vessels stranded nearby. Source: IMO Secretary-General statement; NPR (March 23, 2026)." } },
  { id: "downstream", heading: "How the Shock Travels Downstream", body: "The chain from chokepoint to vineyard runs through several transmission layers, not just pump prices.\n\nOil and refined products are the most visible layer. Diesel powers tractors, trucks and generators. Freight rates for oil tankers have surged alongside war risk insurance premiums and marine fuel costs, increasing shipping costs across supply chains. But oil is the surface.\n\nNatural gas feeds industrial production across multiple sectors at a level most readers do not track. When Qatar\u2019s Ras Laffan went offline, the ripple moved immediately into materials that have nothing obvious to do with energy. Aluminum is one example. In March, Hydro reported that its Qatalum joint venture in Qatar began a controlled shutdown after gas supply was suspended. Within days the company said reduced gas would continue and Qatalum would maintain production at about 60% of capacity. That is a clean illustration of how a gas shock becomes a materials shock. The problem is not energy scarcity alone. It is downstream industrial output.\n\nHelium is another example \u2014 a case study in how deep the chain runs. Helium is used in semiconductor manufacturing because it provides a stable inert atmosphere and improves heat transfer. Supply disruptions can jeopardize manufacturing in consumer electronics and related sectors, according to the U.S. Geological Survey. Chips now sit inside nearly every modern system: vehicles, appliances, logistics platforms, communications infrastructure. When helium supply tightens, the constraint does not announce itself at the pump. It shows up quarters later in lead times, component costs and equipment availability.\n\nFertilizers and agricultural chemicals complete the picture. The Middle East Gulf accounts for 16% to 18% of global seaborne fertilizer exports, according to Kpler. In Napa, that exposure shows up less as a single dramatic shortage than as one more layer of cost pressure running through vineyard operations. Nearly half the world\u2019s traded sulfur supply \u2014 a base input for phosphate fertilizers and industrial chemical manufacturing \u2014 is currently stranded on the Persian Gulf side of the strait, according to CRU Group.\n\nManufacturing trade friction adds a parallel layer. On March 11, the Office of the U.S. Trade Representative opened new Section 301 investigations into structural excess capacity in manufacturing sectors \u2014 a signal that trade friction tied to China is rising again at precisely the moment energy and shipping systems are under strain. For Napa, that means more uncertainty around pumps, fittings, refrigeration components, warehouse materials, fabricated parts and the small industrial goods that make a premium agricultural region run on time.", chart: { component: Chart2_CommodityBeforeAfter, title: "Commodity Prices: Before vs. After the Disruption", caption: "Sources: UNCTAD Strait of Hormuz Disruptions report (March 10, 2026); IEA Middle East and Global Energy Markets; Kpler vessel tracking (March 2026). Current flows estimated from reported 94% tanker transit decline and commodity-specific disruption data. LNG near-zero reflects Qatar Ras Laffan force majeure (March 4, 2026)." } },
  { id: "tourism", heading: "The Tourism Channel", body: "Then Napa gets hit again through travel.\n\nThe energy and transport pressures affecting producers also affect visitors. European and Asian travelers \u2014 among Napa\u2019s most valuable \u2014 are absorbing higher fuel costs, gas-market stress and more uncertain travel conditions. These are not abstract geopolitical statistics. They describe the energy budgets of the households and businesses that produce the international visitors Napa depends on for discretionary spending.\n\nThat does not mean visitor traffic collapses in a straight line. It means the tourism channel becomes more fragile at precisely the moment the production channel becomes more expensive. In a place where the economic model depends on both agriculture and hospitality, that is the double hit.\n\nShocks of this scale also carry a longer tail than the headlines imply. Shipping routes do not normalize overnight. Insurance costs can stay elevated for months. Industrial facilities do not return to full output in a single step. Iran\u2019s de facto blockade has already produced a selective, permission-based transit regime \u2014 what shipping industry experts have dubbed the \u201CTehran toll booth\u201D \u2014 that Iran appears to be turning into a longer-term instrument of geopolitical leverage, according to reporting by Al Jazeera and NBC News as of March 26.", chart: { component: Chart3_EnergyPriceShock, title: "Energy Price Shock Transmission to Napa Valley", caption: "Source: Wikipedia, 2026 Strait of Hormuz crisis; World Economic Forum trade update (March 2026). Brent crude peaked at $126/bbl. European gas roughly doubled from ~€30/MWh to above €60/MWh within days of Qatar's Ras Laffan force majeure (March 4, 2026)." } },
  { id: "napa-impact", heading: "Less Cushion Than the Numbers Suggest", body: "That longer tail matters because Napa County is not entering this shock from a position of unusual strength.\n\nAs documented in \u201CUnder the Hood: Napa\u2019s Economy Looks Bigger Than It Is,\u201D nominal GDP reached $14.59 billion in 2024, up 35.8% since 2016. Adjusted for inflation, the same economy grew 4.6%. Of the apparent $3.84 billion in growth over that period, roughly 87 cents of every dollar reflected inflation rather than real output. At the same time, the county\u2019s jobs engine has stalled. Leisure and hospitality employment is essentially flat since 2019 despite continued nominal expansion \u2014 and if the 2009\u20132019 growth trend had continued, that sector would employ roughly 4,800 more workers today than it actually does. In a county where a contracting wine industry accounts for 72% of all jobs and 74% of all wages, another round of pressure on fuel, natural gas, freight, manufacturing and travel is not just a story about higher costs. It is a story about employment, wages and the tax base that funds public services.\n\nAnother wave of supply-chain disruption could widen the same disconnect Napa is already living with: the gap between what the economy appears to be producing in current dollars and what it is actually producing after inflation. Revenues can rise on paper while real output, hiring power and local resilience lag behind. In a county built on both agriculture and tourism, that is not a short-term inconvenience. It is a structural risk that the nominal numbers have been obscuring for years.\n\nWhat happens in Hormuz does not stay in Hormuz. It can show up in a diesel invoice, a delayed part, a more expensive bottling run, a cautious traveler, a softer booking calendar and a wider gap between nominal prosperity and real economic strength. That is the supply-chain story Napa now has to reckon with.", chart: { component: Chart4_NapaGdpEmploymentGap, title: "Napa GDP and Employment: The Widening Gap", caption: "Source: Bureau of Economic Analysis via FRED (GDPALL06055 nominal; REALGDPALL06055 real, chained 2017 dollars); Bureau of Labor Statistics (NAPA906LEIHN). Wine industry employment and wage figures: Insel & Company for Napa Valley Vintners, May 2025 (2022 data)." } },
  { id: "calculator", heading: "Run Your Own Scenario", body: "Use the calculator below to model how the Hormuz supply shock \u2014 layered on top of an already-contracting wine industry \u2014 could compound pressure on Napa County jobs, wages and the gap between nominal and real GDP. Adjust input cost increases, visitor spend decline and duration to explore the range of outcomes.", chart: null, calculator: true },
];

const RELATED = [
  { title: "Napa\u2019s Economy Looks Bigger Than It Is", date: "Napa Valley Features", url: "/under-the-hood/napa-gdp-2024", substack: "https://napavalleyfocus.substack.com/p/napas-economy-looks-bigger-than-it-is" },
  { title: "Napa Cabernet Prices Break the Growth Curve", date: "Napa Valley Features", url: "/under-the-hood/napa-cab-2025", substack: "https://napavalleyfocus.substack.com/p/napa-cabernet-prices-break-the-growth" },
];

const SOURCES = [
  { label: "UNCTAD Strait of Hormuz Disruptions report (UNCTAD/OSG/TT/INF/2026/1), March 10, 2026", url: "https://unctad.org/publication/strait-hormuz-disruptions-implications-global-trade-and-development" },
  { label: "IEA Middle East and Global Energy Markets", url: "https://www.iea.org/topics/the-middle-east-and-global-energy-markets" },
  { label: "Wikipedia, 2026 Strait of Hormuz crisis", url: "https://en.wikipedia.org/wiki/2026_Strait_of_Hormuz_crisis" },
  { label: "Lloyd\u2019s List Intelligence / CNBC vessel tracker, March 18, 2026", url: "https://www.cnbc.com/2026/03/18/hormuz-bottleneck-vessel-tanker-tracker-shipping-strait-of-hormuz.html" },
  { label: "Windward Maritime AI, March 20, 2026", url: "https://windward.ai/blog/march-22-maritime-intelligence-daily/" },
  { label: "Kpler, Strait of Hormuz dry bulk and LNG disruption, March 2026", url: "https://www.kpler.com/blog/how-the-strait-of-hormuz-shutdown-is-disrupting-dry-bulk-lng-freight-and-trade-compliance" },
  { label: "Hydro, Qatalum controlled shutdown, March 2026", url: "https://www.hydro.com/en/global/media/news/2026/qatalum-initiates-controlled-shutdown-of-aluminium-production/" },
  { label: "U.S. Trade Representative, Section 301 investigations, March 11, 2026", url: "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/march/ustr-initiates-section-301-investigations-relating-structural-excess-capacity-and-production" },
  { label: "Al Jazeera, Tehran toll booth, March 26, 2026", url: "https://www.aljazeera.com/news/2026/3/26/tehranstollbooth-how-iran-picks-who-to-let-through-strait-of-hormuz" },
  { label: "Bureau of Economic Analysis via FRED, Napa nominal GDP (GDPALL06055)", url: "https://fred.stlouisfed.org/series/GDPALL06055" },
  { label: "Bureau of Economic Analysis via FRED, Napa real GDP (REALGDPALL06055)", url: "https://fred.stlouisfed.org/series/REALGDPALL06055" },
  { label: "Insel & Company for Napa Valley Vintners, Economic Impact Study, May 2025", url: "https://napavintners.com/downloads/ECONOMIC-IMPACT-REPORT-NVV-2022.pdf" },
];

// ─── main component ───────────────────────────────────────────────────────────
export default function UnderTheHoodSupplyChain() {
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    if (window.Chart) { setChartReady(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    s.onload = () => setChartReady(true);
    document.head.appendChild(s);
  }, []);

  const prose   = { fontFamily: "'Source Sans 3', sans-serif", fontSize: 17, color: T.ink, lineHeight: 1.75, margin: "0 0 18px 0" };
  const heading = { fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 700, color: T.ink, margin: "40px 0 16px 0" };
  const h2style = { fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 16px 0" };

  if (!PUBLISHED) {
    return (
      <div style={{ background: "#F5F0E8", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <NavBar />
        <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C4A050", marginBottom: 16 }}>
          NAPA VALLEY FEATURES · UNDER THE HOOD
        </div>
        <h1 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 32, fontWeight: 700, color: "#2C1810", margin: "0 0 12px 0" }}>Coming soon</h1>
        <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 16, color: "#5C4033", margin: 0 }}>This article is being prepared. Check back shortly.</p>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <NavBar />

      {/* Masthead */}
      <div style={{ background: "#2C1810", color: "#F5F0E8", textAlign: "center", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", padding: "10px 24px" }}>
        Napa Valley Features &nbsp;·&nbsp; Under the Hood &nbsp;·&nbsp; March 2026
      </div>

      {/* Header */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 32px" }}>
        <div style={{ fontFamily: "monospace", fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C4A050", marginTop: 32, marginBottom: 16 }}>
          Under the Hood &nbsp;·&nbsp; Napa Valley Features
        </div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: 700, fontSize: "clamp(26px, 5vw, 42px)", color: "#2C1810", lineHeight: 1.15, marginBottom: 20 }}>
          Under the Hood: How a Global Supply Shock Reaches Napa Valley
        </h1>
        <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontWeight: 300, fontSize: 17, lineHeight: 1.65, color: "#5C4033", marginBottom: 24 }}>
          War around Iran has cut Hormuz tanker traffic 94%. This traces the supply chain from the strait to the Napa farm gate — and shows why the local economy has less cushion than the numbers suggest. This interactive edition includes four data visualizations, a scenario calculator and live reader polls.
        </p>
        <div style={{ borderTop: "1px solid #D4C4A8", paddingTop: 14 }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8B7355" }}>
            By Tim Carl &nbsp;·&nbsp; Napa Valley Features &nbsp;·&nbsp; March 2026
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em", color: "#8B7355", fontStyle: "italic", marginTop: 4 }}>
            Live data from the NapaServe Community Data Commons
          </div>
          <a href="https://napavalleyfocus.substack.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, fontWeight: 400, color: T.accent, textDecoration: "none", textTransform: "none", letterSpacing: "normal", display: "inline-block", marginTop: 12 }}>
            Read on Napa Valley Features · Substack →
          </a>
        </div>
      </div>

      {/* article body */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px" }}>

        {SECTIONS.map(section => (
          <div key={section.id}>
            {section.heading && <h2 style={heading}>{section.heading}</h2>}
            {section.body.split("\n\n").map((para, i) => (
              <p key={i} style={prose}>{para}</p>
            ))}
            {section.calculator && <ScenarioCalculator />}
            {section.chart && chartReady && (
              <ChartBox title={section.chart.title} caption={section.chart.caption}>
                <section.chart.component />
              </ChartBox>
            )}
            {section.chart && !chartReady && (
              <div style={{ background: T.surface, borderRadius: 8, padding: 32, margin: "32px 0", textAlign: "center", color: T.muted, fontFamily: "'Source Sans 3',sans-serif", fontSize: 14 }}>Loading chart...</div>
            )}
          </div>
        ))}

        {/* polls */}
        <PollsSection />

        {/* related coverage */}
        <div style={{ borderTop: `2px solid ${T.border}`, marginTop: 48, paddingTop: 32 }}>
          <h2 style={h2style}>Related Coverage From Napa Valley Features</h2>
          {RELATED.map(item => (
            <div key={item.title} style={{ padding: "16px 0", borderBottom: `1px solid ${T.border}` }}>
              <Link to={item.url} style={{ textDecoration: "none", display: "block" }}>
                <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, color: T.accent, fontWeight: 600, margin: "0 0 4px 0" }}>{item.title}</p>
                <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.muted, margin: 0 }}>{item.date}</p>
              </Link>
              {item.substack && (
                <a href={item.substack} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: "#8B5E3C", textDecoration: "none", display: "inline-block", marginTop: 6 }}>
                  Read on Substack →
                </a>
              )}
            </div>
          ))}
        </div>

        {/* archive search */}
        <ArchiveSearch />

        {/* sources */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 48, paddingTop: 24 }}>
          <h2 style={{ ...h2style, fontSize: 16 }}>Sources</h2>
          {SOURCES.map(s => (
            <div key={s.label} style={{ marginBottom: 10 }}>
              <a href={s.url} target="_blank" rel="noreferrer"
                style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.accent, textDecoration: "underline", lineHeight: 1.5 }}>
                {s.label}
              </a>
            </div>
          ))}
        </div>

        {/* methodology */}
        <div style={{ marginTop: 32, padding: "20px 0", borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: T.muted, fontStyle: "italic", margin: 0 }}>
            This article was reported and written by Tim Carl for Napa Valley Features. Charts and interactive elements built for the NapaServe Community Data Commons. Data sources and methodology are listed above.
          </p>
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: T.muted, marginTop: 10, lineHeight: 1.5 }}>
            Questions, corrections or tips? Contact <a href="mailto:info@napaserve.com" style={{ color: T.accent }}>the newsroom</a>.
          </p>
        </div>

      </div>
      <Footer />
    </div>
  );
}

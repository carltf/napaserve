import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import useDraftGate from "./hooks/useDraftGate";
import DraftBanner from "./components/DraftBanner";
import RelatedCoverage from "./components/RelatedCoverage";

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

const font  = "'Source Sans 3','Source Sans Pro',sans-serif";
const serif = "'Libre Baskerville',Georgia,serif";

const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";
const ARTICLE_SLUG = "napa-population-2025";


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
        <p style={{ fontFamily: font, fontSize: 12, color: T.muted, margin: "10px 0 0 0" }}>{total} {total === 1 ? "vote" : "votes"} {"\u00b7"} Results update in real time</p>
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
    <div style={{ padding: "24px 0", fontFamily: font, fontSize: 14, color: T.muted }}>Loading polls...</div>
  );
  if (!polls.length) return null;

  return (
    <div style={{ borderTop: `2px solid ${T.border}`, marginTop: 48, paddingTop: 32 }}>
      <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.1em", color: T.gold, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px 0" }}>Today{"\u2019"}s Polls</p>
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
      <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.1em", color: T.gold, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px 0" }}>Archive</p>
      <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 6px 0" }}>Search North Coast Coverage</h2>
      <p style={{ fontFamily: font, fontSize: 14, color: T.muted, margin: "0 0 16px 0" }}>Search 1,000+ articles and reports from Napa Valley Features.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Search population, commuter patterns, housing, wages..."
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
              style={{ fontFamily: font, fontSize: 12, color: T.muted }}>Read full article {"\u2192"}</a>
          )}
        </div>
      ))}

      {results.length > 0 && (
        <a href="/archive" style={{ display: "inline-block", marginTop: 16, fontFamily: font, fontSize: 14, color: T.accent, textDecoration: "underline" }}>
          Open full archive search {"\u2192"}
        </a>
      )}
    </div>
  );
}


// ─── chart wrapper with download ──────────────────────────────────────────────
function ChartBox({ title, caption, source, note, scenarioBadge, children }) {
  return (
    <div style={{ background: T.surface, border: `1px solid rgba(44,24,16,0.12)`, borderRadius: 8, padding: "24px 20px", margin: "32px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <p style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: T.ink, margin: 0 }}>{title}</p>
        {scenarioBadge && (
          <span style={{ fontFamily: font, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: T.gold, color: "#fff", borderRadius: 10, padding: "2px 10px" }}>Scenario</span>
        )}
      </div>
      {children}
      {caption && <p style={{ fontFamily: font, fontSize: 13, color: T.muted, margin: "12px 0 0", lineHeight: 1.5, fontStyle: "italic" }}>{caption}</p>}
      {source && <p style={{ fontFamily: font, fontSize: 11, color: T.muted, margin: "6px 0 0", lineHeight: 1.4 }}>Source: {source}</p>}
      {note && <p style={{ fontFamily: font, fontSize: 11, color: T.muted, margin: "4px 0 0", lineHeight: 1.4, fontStyle: "italic" }}>{note}</p>}
    </div>
  );
}

function ChartCanvas({ canvasId, buildChart, downloadName }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !window.Chart) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = buildChart(ctx);
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const offscreen = document.createElement("canvas");
    offscreen.width  = canvas.width;
    offscreen.height = canvas.height + 28;
    const ctx = offscreen.getContext("2d");
    ctx.fillStyle = "#FAF6F0";
    ctx.fillRect(0, 0, offscreen.width, offscreen.height);
    ctx.drawImage(canvas, 0, 0);
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.font = "11px 'Source Code Pro',monospace";
    ctx.fillStyle = "#8B7355";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText("napaserve.org", offscreen.width - 12, offscreen.height - 8);
    ctx.restore();
    const link = document.createElement("a");
    link.download = downloadName;
    link.href = offscreen.toDataURL("image/png");
    link.click();
  };

  return (
    <>
      <canvas ref={canvasRef} id={canvasId} />
      {downloadName && (
        <button onClick={download}
          style={{ marginTop: 8, padding: "4px 12px", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.08em", color: "#8B7355", background: "transparent", border: "1px solid #D4C4A8", borderRadius: 3, cursor: "pointer", display: "block" }}>
          DOWNLOAD CHART PNG
        </button>
      )}
    </>
  );
}


// ─── Chart 1: Napa County Population Trend, 2000-2025 ─────────────────────────
function Chart1() {
  const labels = ["2000", "2005*", "2010", "2015*", "2016", "2020", "2025"];
  const data   = [124279, 130500, 136484, 140175, 141119, 137744, 136124];
  const pointColors = labels.map((_, i) => i === 4 ? "#9E5050" : i === 6 ? "#5B9E8A" : "#4A7BA7");
  const pointRadii  = labels.map((_, i) => (i === 4 || i === 6) ? 6 : 4);

  return (
    <ChartCanvas canvasId="chart-pop-trend" downloadName="chart-1_napa-population-trend.png" buildChart={(ctx) => {
      return new window.Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: "Population",
            data,
            borderColor: "#4A7BA7",
            backgroundColor: "rgba(74,123,167,0.12)",
            fill: true,
            tension: 0.3,
            pointBackgroundColor: pointColors,
            pointBorderColor: pointColors,
            pointRadius: pointRadii,
            pointHoverRadius: pointRadii.map(r => r + 2),
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c) => c.parsed.y.toLocaleString() + " residents" } },
          },
          scales: {
            y: {
              min: 118000,
              max: 145000,
              ticks: { callback: (val) => (val / 1000).toFixed(0) + "k" },
            },
          },
        },
      });
    }} />
  );
}


// ─── Chart 2: Population Change by Jurisdiction, 2024-2025 ────────────────────
function Chart2() {
  const labels = ["Calistoga", "St. Helena", "Yountville", "Balance of County", "Napa (city)", "American Canyon"];
  const data   = [-21, -7, -17, -101, 216, 639];
  const pctLabels = ["-0.4%", "-0.1%", "-0.6%", "-0.4%", "+0.3%", "+2.9%"];
  const colors = data.map((v, i) => {
    if (i === 5) return "#C4956A";
    if (i === 4) return "#5B9E8A";
    return "#9E5050";
  });

  return (
    <ChartCanvas canvasId="chart-jurisdiction-change" downloadName="chart-2_jurisdiction-change-2024-2025.png" buildChart={(ctx) => {
      return new window.Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "Population Change",
            data,
            backgroundColor: colors,
            borderRadius: 3,
          }],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c) => { const i = c.dataIndex; return (c.parsed.x >= 0 ? "+" : "") + c.parsed.x.toLocaleString() + " (" + pctLabels[i] + ")"; } } },
          },
          scales: {
            x: {
              ticks: { callback: (val) => (val >= 0 ? "+" : "") + val },
            },
          },
        },
        plugins: [{
          id: "pctLabels",
          afterDatasetsDraw(chart) {
            const { ctx: c, data: d } = chart;
            const meta = chart.getDatasetMeta(0);
            c.save();
            c.font = "11px 'Source Sans 3', sans-serif";
            c.fillStyle = T.muted;
            meta.data.forEach((bar, i) => {
              const val = d.datasets[0].data[i];
              const x = val >= 0 ? bar.x + 6 : bar.x - 6;
              c.textAlign = val >= 0 ? "left" : "right";
              c.textBaseline = "middle";
              c.fillText(pctLabels[i], x, bar.y);
            });
            c.restore();
          },
        }],
      });
    }} />
  );
}


// ─── Chart 3: Population by Jurisdiction, 2000 vs. 2025 ──────────────────────
function Chart3() {
  const labels   = ["American Canyon", "Napa (city)", "Calistoga", "St. Helena", "Yountville"];
  const data2000 = [9774, 72585, 4991, 5950, 2916];
  const data2025 = [22396, 77736, 5160, 5349, 2638];

  return (
    <ChartCanvas canvasId="chart-2000-vs-2025" downloadName="chart-3_population-2000-vs-2025.png" buildChart={(ctx) => {
      return new window.Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            { label: "2000", data: data2000, backgroundColor: "#4A7BA7", borderRadius: 3 },
            { label: "2025", data: data2025, backgroundColor: "#C4956A", borderRadius: 3 },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top", labels: { font: { family: font, size: 12 } } },
            tooltip: { callbacks: { label: (c) => c.dataset.label + ": " + c.parsed.y.toLocaleString() } },
          },
          scales: {
            y: {
              ticks: { callback: (val) => (val / 1000).toFixed(0) + "k" },
            },
          },
        },
      });
    }} />
  );
}


// ─── Chart 4: Net Commuter Inflow and Linear Projection ──────────────────────
function Chart4() {
  const labels = ["2015", "2018", "2021\n(proj.)", "2024\n(proj.)", "2027\n(proj.)", "2030\n(proj.)"];
  const data   = [7000, 4240, 1480, -1280, -4040, -6800];
  const colors = data.map((v, i) => {
    if (i <= 1) return "#4A7BA7";
    if (v >= 0) return "rgba(74,123,167,0.45)";
    return "rgba(158,80,80,0.55)";
  });

  return (
    <ChartCanvas canvasId="chart-commuter-inflow" downloadName="chart-4_commuter-inflow-projection.png" buildChart={(ctx) => {
      return new window.Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "Net Commuter Inflow",
            data,
            backgroundColor: colors,
            borderRadius: 3,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c) => (c.parsed.y >= 0 ? "+" : "") + c.parsed.y.toLocaleString() + " workers" } },
            annotation: undefined,
          },
          scales: {
            y: {
              min: -8000,
              max: 8500,
            },
          },
        },
        plugins: [{
          id: "zeroLine",
          afterDatasetsDraw(chart) {
            const { ctx: c } = chart;
            const yScale = chart.scales.y;
            const xScale = chart.scales.x;
            const y0 = yScale.getPixelForValue(0);
            c.save();
            c.setLineDash([4, 4]);
            c.strokeStyle = T.muted;
            c.lineWidth = 1;
            c.beginPath();
            c.moveTo(xScale.left, y0);
            c.lineTo(xScale.right, y0);
            c.stroke();
            c.setLineDash([]);
            c.font = "11px 'Source Sans 3', sans-serif";
            c.fillStyle = T.muted;
            c.textAlign = "left";
            c.textBaseline = "bottom";
            c.fillText("0 \u2190 breakeven", xScale.left + 4, y0 - 4);
            c.restore();
          },
        }],
      });
    }} />
  );
}


// ─── Chart 5: Jobs per Hotel Room Added ───────────────────────────────────────
function Chart5() {
  const labels = ["2009\u20132019\n(+700 rooms added)", "2019\u20132025\n(+382 rooms added)"];
  const data   = [7.6, -0.5];
  const colors = ["#5B9E8A", "#9E5050"];

  return (
    <ChartCanvas canvasId="chart-jobs-per-room" downloadName="chart-5_jobs-per-hotel-room.png" buildChart={(ctx) => {
      return new window.Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "Jobs per Room Added",
            data,
            backgroundColor: colors,
            borderRadius: 3,
            barThickness: 80,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c) => (c.parsed.y >= 0 ? "+" : "") + c.parsed.y.toFixed(1) + " jobs per room" } },
          },
          scales: {
            y: {
              min: -2,
              max: 10,
            },
          },
        },
      });
    }} />
  );
}


// ─── Chart 6: Housing Units and Total Jobs, Indexed 2019=100 ─────────────────
function Chart6() {
  const labels      = ["2010", "2013", "2015", "2017", "2019", "2021", "2022", "2023", "2024"];
  const housingData = [88.7, 93.4, 96.2, 98.1, 100, 102.8, 103.8, 105.1, 106.0];
  const jobsData    = [79.7, 88.4, 94.2, 97.8, 100, 87.0, 91.3, 92.8, 92.8];

  return (
    <ChartCanvas canvasId="chart-housing-vs-jobs" downloadName="chart-6_housing-vs-jobs-indexed.png" buildChart={(ctx) => {
      return new window.Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Housing Units",
              data: housingData,
              borderColor: "#4A7BA7",
              backgroundColor: "transparent",
              tension: 0.3,
              pointRadius: 4,
              pointBackgroundColor: "#4A7BA7",
            },
            {
              label: "Total Jobs",
              data: jobsData,
              borderColor: "#C4956A",
              backgroundColor: "transparent",
              tension: 0.3,
              pointRadius: 4,
              pointBackgroundColor: "#C4956A",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top", labels: { font: { family: font, size: 12 } } },
            tooltip: { callbacks: { label: (c) => c.dataset.label + ": " + c.parsed.y.toFixed(1) } },
          },
          scales: {
            y: {
              min: 75,
              max: 112,
              title: { display: true, text: "Index (2019 = 100)", font: { family: font, size: 12 } },
            },
          },
        },
        plugins: [{
          id: "gapFill",
          afterDatasetsDraw(chart) {
            const { ctx: c } = chart;
            const housingMeta = chart.getDatasetMeta(0);
            const jobsMeta    = chart.getDatasetMeta(1);
            if (!housingMeta.data.length || !jobsMeta.data.length) return;
            c.save();
            c.fillStyle = "rgba(196,149,106,0.15)";
            c.beginPath();
            // trace housing line forward
            housingMeta.data.forEach((pt, i) => {
              if (i === 0) c.moveTo(pt.x, pt.y);
              else c.lineTo(pt.x, pt.y);
            });
            // trace jobs line backward
            for (let i = jobsMeta.data.length - 1; i >= 0; i--) {
              c.lineTo(jobsMeta.data[i].x, jobsMeta.data[i].y);
            }
            c.closePath();
            c.fill();
            c.restore();
          },
        }],
      });
    }} />
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function NapaPopulation() {
  const navigate = useNavigate();
  const gate = useDraftGate(ARTICLE_SLUG);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    if (gate.status === "redirect") {
      navigate("/under-the-hood", { replace: true });
    }
  }, [gate.status, navigate]);

  useEffect(() => {
    if (window.Chart) { setChartReady(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    s.onload = () => setChartReady(true);
    document.head.appendChild(s);
  }, []);

  const prose   = { fontFamily: font, fontSize: 17, color: T.ink, lineHeight: 1.75, margin: "0 0 18px 0" };
  const heading = { fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "40px 0 16px 0" };

  if (gate.status === "loading" || gate.status === "redirect") {
    return (
      <div style={{ background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, fontSize: 14, color: T.muted }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      {gate.status === "draft" && <DraftBanner />}
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <NavBar />

      {/* Masthead */}
      <div style={{ background: "#2C1810", color: "#F5F0E8", textAlign: "center", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", padding: "10px 24px" }}>
        Napa Valley Features &nbsp;{"\u00b7"}&nbsp; Under the Hood &nbsp;{"\u00b7"}&nbsp; March 2026
      </div>

      {/* Header */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 32px" }}>
        <div style={{ fontFamily: "monospace", fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase", color: T.gold, marginTop: 32, marginBottom: 16 }}>
          Under the Hood &nbsp;{"\u00b7"}&nbsp; Napa Valley Features
        </div>
        <h1 style={{ fontFamily: serif, fontWeight: 700, fontSize: "clamp(26px, 5vw, 42px)", color: T.ink, lineHeight: 1.15, marginBottom: 20 }}>
          Under the Hood: The Pattern Holds {"\u2014"} and the Numbers Get More Telling
        </h1>
        <p style={{ fontFamily: font, fontWeight: 300, fontSize: 17, lineHeight: 1.65, color: "#5C4033", marginBottom: 24 }}>
          Napa County added 709 residents in 2024 {"\u2014"} but 90% came from one city. Strip out American Canyon and the rest of the county gained 70 people. Twenty-five years of data point to the same structural condition.
        </p>
        <div style={{ borderTop: "1px solid #D4C4A8", paddingTop: 14 }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: T.muted }}>
            By Tim Carl &nbsp;{"\u00b7"}&nbsp; Napa Valley Features &nbsp;{"\u00b7"}&nbsp; March 2026
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em", color: T.muted, fontStyle: "italic", marginTop: 4 }}>
            California Dept. of Finance E-1 Population Estimates {"\u00b7"} U.S. Census Bureau {"\u00b7"} Bureau of Labor Statistics
          </div>
          <a href="https://napavalleyfocus.substack.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily: font, fontSize: 14, fontWeight: 400, color: T.accent, textDecoration: "none", display: "inline-block", marginTop: 12 }}>
            Read on Napa Valley Features {"\u00b7"} Substack {"\u2192"}
          </a>
        </div>
      </div>

      {/* Article body */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px 60px" }}>

        {/* ── Section: Still Below Peak ─────────────────────────────── */}
        <h2 style={heading}>Still Below Peak {"\u2014"} by Nearly a Decade</h2>
        <p style={prose}>
          NAPA VALLEY, Calif. {"\u2014"} Napa County has lost 4,995 residents since its modern peak of 141,119 in 2016 and remains down 3.5%. In 2010, the county had 136,484 residents {"\u2014"} nearly identical to today{"\u2019"}s 136,124. The past 15 years have produced a net population change of essentially zero at the county level.
        </p>

        {/* Chart 1 */}
        {chartReady ? (
          <ChartBox
            title="Napa County Population Trend, 2000\u20132025"
            caption="Growth peaked in 2016 and has not recovered. The 2025 count nearly equals 2010."
            source="U.S. Census Bureau (2000, 2010, 2020); California Dept. of Finance E-1 estimates (2025)"
            note="*2005 and 2015 are interpolated estimates."
          >
            <Chart1 />
          </ChartBox>
        ) : <div style={{ background: T.surface, borderRadius: 8, padding: 32, margin: "32px 0", textAlign: "center", color: T.muted, fontFamily: font, fontSize: 14 }}>Loading chart...</div>}


        {/* ── Section: One City ─────────────────────────────────────── */}
        <h2 style={heading}>One City {"\u2014"} and One End of the Valley</h2>
        <p style={prose}>
          American Canyon alone added 639 of the county{"\u2019"}s 709 net new residents {"\u2014"} 90% of total growth {"\u2014"} from a city holding 16% of the county{"\u2019"}s population. Its 2.9% year-over-year gain stands in a different category from every other jurisdiction. Napa, the county seat, added 216 residents, or 0.3%. Calistoga fell from 5,181 to 5,160. St. Helena fell from 5,356 to 5,349. Yountville fell from 2,655 to 2,638. The unincorporated county fell from 22,946 to 22,845. The upvalley cities and balance of county, taken together, lost 146 residents.
        </p>
        <p style={prose}>
          Strip out American Canyon entirely and the remaining 113,728 residents {"\u2014"} 83% of the county {"\u2014"} gained 70 people in a year. That is a growth rate of 0.06%, which rounds to zero.
        </p>
        <p style={prose}>
          The housing construction data amplify the picture. In 2024{"\u2013"}25, American Canyon and the city of Napa together accounted for 91% of all new housing units built countywide {"\u2014"} 602 of 658. The three upvalley cities combined added 21 units, or 3% of the total.
        </p>

        {/* Chart 2 */}
        {chartReady ? (
          <ChartBox
            title="Population Change by Jurisdiction, 2024\u20132025"
            caption="Ordered north (top) to south (bottom). Every jurisdiction except Napa city and American Canyon declined or lost residents."
            source="California Dept. of Finance E-1 Population Estimates, Jan. 1, 2024 and Jan. 1, 2025"
          >
            <Chart2 />
          </ChartBox>
        ) : <div style={{ background: T.surface, borderRadius: 8, padding: 32, margin: "32px 0", textAlign: "center", color: T.muted, fontFamily: font, fontSize: 14 }}>Loading chart...</div>}


        {/* ── Section: This Is Not a New Pattern ────────────────────── */}
        <h2 style={heading}>This Is Not a New Pattern {"\u2014"} It{"\u2019"}s 25 Years</h2>
        <p style={prose}>
          In 2000, American Canyon had 9,774 residents {"\u2014"} 7.9% of Napa County{"\u2019"}s 124,279. By 2010 it had nearly doubled to 19,454. By 2025 it stands at 22,396 {"\u2014"} 16.5% of the county. Since 2000, American Canyon has added 12,622 residents. The rest of Napa County has added approximately 750. Stripped of American Canyon, the county outside that one city has seen a net population loss since 2000.
        </p>
        <p style={prose}>
          St. Helena is down roughly 10% from its 2000 census population. Yountville is down nearly 10%. As this column documented in prior coverage, the same jurisdictional structure appeared in the prior year{"\u2019"}s E-1 data. A pattern that appears once is a data point. A pattern that persists across 25 years of census and DOF records is a structural condition.
        </p>

        {/* Chart 3 */}
        {chartReady ? (
          <ChartBox
            title="Population by Jurisdiction, 2000 vs. 2025"
            caption="American Canyon +129% since 2000. St. Helena and Yountville each down roughly 10%."
            source="U.S. Census Bureau 2000; California Dept. of Finance E-1 2025"
          >
            <Chart3 />
          </ChartBox>
        ) : <div style={{ background: T.surface, borderRadius: 8, padding: 32, margin: "32px 0", textAlign: "center", color: T.muted, fontFamily: font, fontSize: 14 }}>Loading chart...</div>}


        {/* ── Section: Why the Southern Cluster ─────────────────────── */}
        <h2 style={heading}>Why the Southern Cluster Looks the Way It Does</h2>
        <p style={prose}>
          Geography explains a significant part of it. Napa Valley is approximately 30 miles long and narrow. A worker employed in Calistoga or St. Helena faces roughly a 25- to 35-mile commute from American Canyon {"\u2014"} not meaningfully different from commuting from Cloverdale in Sonoma County or Lakeport in Lake County, at substantially lower housing costs. A worker who cannot afford to live in upvalley Napa does not necessarily default to American Canyon. They may default to leaving Napa County entirely.
        </p>
        <p style={prose}>
          American Canyon{"\u2019"}s housing boom {"\u2014"} 5% unit growth in 2024{"\u2013"}25, first in California for multifamily growth {"\u2014"} is driven by Bay Area affordability dynamics and freeway access to Solano, Contra Costa and Alameda employment corridors. The large-scale developments driving that surge are not being built to serve hospitality workers commuting to Yountville. They are being built for Bay Area households for whom southern Napa represents an affordable alternative to Marin or the East Bay.
        </p>
        <p style={prose}>
          The most direct confirmation comes from Longitudinal Employer-Household Dynamics data: most new American Canyon residents work in Solano County or the East Bay, not Napa Valley.
        </p>


        {/* ── Section: The Wage-Flow Problem ────────────────────────── */}
        <h2 style={heading}>The Wage-Flow Problem</h2>
        <p style={prose}>
          A Napa Valley Transportation Authority study using 2018 data found that roughly 30,740 workers commute into Napa County while 26,500 commute out {"\u2014"} a net inflow of about 4,240. That figure had already fallen from approximately 7,000 in 2015, a decline of nearly 40% in three years. The NVTA noted that outbound workers likely earn more than inbound ones: outbound jobs skew toward higher-wage categories, inbound jobs toward service and hospitality.
        </p>
        <p style={prose}>
          If the 2015{"\u2013"}2018 decline rate continued at the same rate, the county would have crossed into net commuter outflow territory around 2024. That is a scenario projection, not a confirmed figure {"\u2014"} an updated NVTA study is required to validate it. But the directional signal is unambiguous.
        </p>

        {/* Chart 4 */}
        {chartReady ? (
          <ChartBox
            title="Net Commuter Inflow and Linear Projection, 2015\u20132030"
            caption="Net inbound commuters fell 40% in three years. If the trend continued, the county crossed into net outflow territory around 2024."
            source="ACS County-to-County Commuting Flows 2011\u20132015; NVTA Napa Valley Travel Behavior Study 2018"
            note="Linear extension of 2015\u20132018 NVTA trend. Not a confirmed forecast. Updated NVTA data required to validate."
            scenarioBadge
          >
            <Chart4 />
          </ChartBox>
        ) : <div style={{ background: T.surface, borderRadius: 8, padding: 32, margin: "32px 0", textAlign: "center", color: T.muted, fontFamily: font, fontSize: 14 }}>Loading chart...</div>}


        {/* ── Section: More Rooms, Not More Jobs ────────────────────── */}
        <h2 style={heading}>More Rooms, Not More Jobs</h2>
        <p style={prose}>
          For a decade, more hotel rooms reliably meant more jobs. From 2009 to 2019, Napa County added roughly 700 hotel rooms and gained more than 5,000 jobs in leisure and hospitality {"\u2014"} more than seven jobs per room. Since 2019 the county added 382 more rooms while leisure and hospitality employment fell by 200 and restaurant and bar jobs fell by 470. The ratio flipped from +7.6 jobs per room to {"\u2212"}0.5.
        </p>

        {/* Chart 5 */}
        {chartReady ? (
          <ChartBox
            title="Jobs per Hotel Room Added"
            caption="The relationship between hotel growth and job growth reversed completely after 2019."
            source="Bureau of Labor Statistics (NAPA906LEIHN; SMU06349007072200001SA); STR Monthly Industry Report; author's analysis"
          >
            <Chart5 />
          </ChartBox>
        ) : <div style={{ background: T.surface, borderRadius: 8, padding: 32, margin: "32px 0", textAlign: "center", color: T.muted, fontFamily: font, fontSize: 14 }}>Loading chart...</div>}


        {/* ── Section: Housing Has Grown ────────────────────────────── */}
        <h2 style={heading}>Housing Has Grown. The Income Gap Has Widened.</h2>
        <p style={prose}>
          Between 2010 and 2024, Napa County added roughly 9,000 housing units {"\u2014"} a 19% increase. Total employment grew only marginally. Intra-county vehicle trips declined from approximately 72,100 in 2018 to 58,000 in 2024 {"\u2014"} a drop of nearly 20%. If housing scarcity were driving workers out of the county, inbound commuting and internal traffic would be rising, not falling.
        </p>

        {/* Chart 6 */}
        {chartReady ? (
          <ChartBox
            title="Housing Units and Total Jobs, Indexed to 2019 = 100"
            caption="Since the pre-pandemic peak, housing has kept growing while jobs have not recovered. The shaded gap is the structural disconnect."
            source="Housing \u2014 California Dept. of Finance E-1H. Employment \u2014 BLS Napa County total nonfarm. Both indexed 2019=100. Same scale \u2014 no dual axis."
          >
            <Chart6 />
          </ChartBox>
        ) : <div style={{ background: T.surface, borderRadius: 8, padding: 32, margin: "32px 0", textAlign: "center", color: T.muted, fontFamily: font, fontSize: 14 }}>Loading chart...</div>}

        <p style={prose}>
          The affordability ratio confirms the income constraint. In 2010 the median Napa County home cost about 4.5 times median household income. By 2025 that ratio reached 8.6. Qualifying for the median-priced home at $937,500 under current mortgage rates requires roughly $230,000 in gross household income. Tourism jobs average around $35,000. At those wages, the median home is not achievable regardless of how many units are built.
        </p>
        <p style={prose}>
          Between 2019 and 2024, Napa County added hundreds of housing units and hundreds of hotel rooms. Jobs in the sectors those rooms were built to support declined. The data point consistently toward one conclusion: until the wage structure of the local economy changes, building more units addresses the symptom, not the condition.
        </p>


        {/* ── Section: What the Data Can Tell Policymakers ──────────── */}
        <h2 style={heading}>What the Data Can Tell Policymakers</h2>
        <p style={prose}>
          The accumulation of evidence across this series of columns {"\u2014"} 25 years of southern concentration, a shrinking net commuter inflow, higher-wage workers flowing out while lower-wage workers flow in, a rooms-to-jobs ratio that inverted after 2019, decoupled housing and employment growth, and a working-age population projected to fall nearly 20% by 2030 {"\u2014"} points consistently toward one conclusion: until the wage structure of the local economy changes, the pattern documented here will persist.
        </p>
        <p style={prose}>
          What makes that conclusion more than a demographic observation is the current external environment. Consumer discretionary spending is under pressure nationally. Travel demand has softened. Tariffs on imported goods are raising input costs across the hospitality and wine supply chain. Wine consumption in the United States has been declining, accelerated by documented health-awareness shifts and a generational move away from wine as a category. The fine dining and luxury visitor economy that once drove Napa{"\u2019"}s job growth has not returned to its pre-pandemic trajectory.
        </p>
        <p style={prose}>
          Each of those forces bears on the same underlying condition the population data reflect: a local economy whose dominant job sectors do not generate wages that support household formation, homeownership or long-term residency in Napa County. Adding housing capacity into that environment has produced more units without closing the income gap, more rooms without producing more jobs, and more residents in the southernmost cities without strengthening the workforce communities the valley depends on.
        </p>
        <p style={prose}>
          A countywide survey of where residents work, what they earn and why they chose Napa County would cost a fraction of what the county spends annually on housing-related infrastructure {"\u2014"} and would answer the question the E-1 series, the RHNA mandates and the 2024 Housing Needs Assessment share an inability to answer: whether the growth being recorded each year is building toward a more economically resilient Napa County, or simply reflecting the valley{"\u2019"}s increasing function as a commuter corridor for the broader Bay Area while the structural conditions that shape it go unaddressed.
        </p>

        {/* Byline */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 40, paddingTop: 16, marginBottom: 40 }}>
          <p style={{ fontFamily: font, fontSize: 15, color: T.ink, fontStyle: "italic", margin: 0 }}>
            Tim Carl is a Napa Valley-based photojournalist.
          </p>
        </div>

        {/* Sources */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 24 }}>
          <h2 style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: T.ink, margin: "0 0 12px 0" }}>Sources</h2>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, lineHeight: 1.6, margin: 0 }}>
            California Department of Finance E-1 Population Estimates (2025); U.S. Census Bureau Decennial Census (2000, 2010, 2020); Napa Valley Transportation Authority Napa Valley Travel Behavior Study (2018); Bureau of Labor Statistics QCEW and CES series (NAPA906LEIHN; SMU06349007072200001SA); STR Monthly Industry Report; American Community Survey County-to-County Commuting Flows 2011{"\u2013"}2015; California Department of Finance E-1H Housing Unit series.
          </p>
        </div>

        {/* Polls */}
        <PollsSection />

        {/* Related Coverage */}
        <RelatedCoverage articleSlug={ARTICLE_SLUG} />

        {/* Archive Search */}
        <ArchiveSearch />

        {/* Methodology */}
        <div style={{ marginTop: 32, padding: "20px 0", borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontFamily: font, fontSize: 14, color: T.muted, fontStyle: "italic", margin: 0 }}>
            This article was reported and written by Tim Carl for Napa Valley Features. Charts and interactive elements built for the NapaServe Community Data Commons. Data sources and methodology are listed above.
          </p>
          <p style={{ fontFamily: font, fontSize: 12, color: T.muted, marginTop: 10, lineHeight: 1.5 }}>
            Questions, corrections or tips? Contact <a href="mailto:info@napaserve.com" style={{ color: T.accent }}>the newsroom</a>.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

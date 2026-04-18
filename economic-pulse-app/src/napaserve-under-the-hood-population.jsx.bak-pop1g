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
  const labels = ["2000", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2020", "2023", "2024", "2025"];
  const data   = [124279, 136484, 136901, 138120, 138838, 140189, 140884, 141711, 141784, 141294, 138019, 135522, 135415, 136124];
  const pointColors = labels.map((_, i) => i === 8 ? "#9E5050" : i === 13 ? "#5B9E8A" : "#4A7BA7");
  const pointRadii  = labels.map((_, i) => (i === 8 || i === 13) ? 6 : 4);

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
        plugins: [{
          id: "peakCurrentLabels",
          afterDatasetsDraw(chart) {
            const { ctx: c } = chart;
            const ds = chart.getDatasetMeta(0);
            const peakIdx = 8;
            const curIdx = 13;
            c.save();
            c.font = "bold 11px 'Source Sans 3', sans-serif";
            c.fillStyle = "#9E5050";
            c.textAlign = "center";
            const peakPoint = ds.data[peakIdx];
            if (peakPoint) c.fillText("Peak: 141,784 (2017)", peakPoint.x, peakPoint.y - 12);
            c.fillStyle = "#5B9E8A";
            const curPoint = ds.data[curIdx];
            if (curPoint) c.fillText("2025: 136,124", curPoint.x, curPoint.y + 20);
            c.restore();
          },
        }],
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
            borderColor: data.map((_, i) => i <= 1 ? "transparent" : (data[i] >= 0 ? "#4A7BA7" : "#9E5050")),
            borderWidth: data.map((_, i) => i <= 1 ? 0 : 2),
            borderRadius: 3,
            borderSkipped: false,
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
        }, {
          id: "scenarioBadge",
          afterDatasetsDraw(chart) {
            const { ctx: c, chartArea } = chart;
            c.save();
            const badgeText = "SCENARIO \u2014 NOT A FORECAST";
            c.font = "bold 10px 'Source Sans 3', sans-serif";
            const metrics = c.measureText(badgeText);
            const padX = 8, padY = 5;
            const badgeW = metrics.width + padX * 2;
            const badgeH = 20;
            const x = chartArea.right - badgeW - 10;
            const y = chartArea.top + 10;
            c.fillStyle = "rgba(158, 80, 80, 0.12)";
            c.strokeStyle = "#9E5050";
            c.lineWidth = 1;
            c.fillRect(x, y, badgeW, badgeH);
            c.strokeRect(x, y, badgeW, badgeH);
            c.fillStyle = "#9E5050";
            c.textAlign = "left";
            c.textBaseline = "middle";
            c.fillText(badgeText, x + padX, y + badgeH / 2);
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
        Napa Valley Features &nbsp;{"\u00b7"}&nbsp; Under the Hood &nbsp;{"\u00b7"}&nbsp; April 2026
      </div>

      {/* Header */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 32px" }}>
        <div style={{ fontFamily: "monospace", fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase", color: T.gold, marginTop: 32, marginBottom: 16 }}>
          Under the Hood &nbsp;{"\u00b7"}&nbsp; Napa Valley Features
        </div>
        <h1 style={{ fontFamily: serif, fontWeight: 700, fontSize: "clamp(26px, 5vw, 42px)", color: T.ink, lineHeight: 1.15, marginBottom: 20 }}>
          Under the Hood: Where Napa{"\u2019"}s Growth Actually Lives
        </h1>
        <p style={{ fontFamily: font, fontWeight: 300, fontSize: 17, lineHeight: 1.65, color: "#5C4033", marginBottom: 24 }}>
          Napa County added 709 residents in 2024. American Canyon accounted for 639 of them. Across 25 years of state and census records, the pattern is the same: population growth concentrates in one city at the southern edge of the county, while the rest of the valley stays flat or shrinks.
        </p>
        <div style={{ borderTop: "1px solid #D4C4A8", paddingTop: 14 }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: T.muted }}>
            By Tim Carl &nbsp;{"\u00b7"}&nbsp; Napa Valley Features &nbsp;{"\u00b7"}&nbsp; April 2026
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

        {/* ── Opening ───────────────────────────────────────────────── */}
        <p style={prose}>
          <span style={{ fontWeight: 700 }}>NAPA VALLEY, Calif. {"\u2014"}</span> The California Department of Finance released its 2025 E-1 population estimates on May 1, showing Napa County gained 709 residents in 2024, for a total of 136,124 as of January 1, 2025. The county{"\u2019"}s 0.52% year-over-year growth rate led all nine Bay Area counties.
        </p>
        <p style={prose}>
          Of those 709 new residents, 639 {"\u2014"} or 90% {"\u2014"} were added in one city: American Canyon. Every other part of the county, taken together, gained 70 people.
        </p>
        <p style={prose}>
          Napa city added 216. Calistoga lost 21. St. Helena lost 7. Yountville lost 17. The unincorporated balance of the county lost 101. The three upvalley cities and the unincorporated county combined lost 146 residents.
        </p>
        <p style={prose}>
          Strip out American Canyon and the remaining 113,728 residents of Napa County {"\u2014"} 83% of the population {"\u2014"} gained 70 people. That is a growth rate of 0.06%, which rounds to zero.
        </p>

        {/* Chart 2 — Population Change by Jurisdiction */}
        {chartReady ? (
          <ChartBox
            title="Population Change by Jurisdiction, 2024–2025"
            caption="American Canyon gained 639 residents — 90 percent of Napa County's 709-resident net gain. Napa city added 216. Calistoga, St. Helena, Yountville and the unincorporated balance of the county all lost residents. Ordered north (top) to south (bottom)."
            source="California Department of Finance, E-1 Population Estimates, January 1, 2024 and January 1, 2025"
          >
            <Chart2 />
          </ChartBox>
        ) : <div style={{ background: T.surface, borderRadius: 8, padding: 32, margin: "32px 0", textAlign: "center", color: T.muted, fontFamily: font, fontSize: 14 }}>Loading chart...</div>}


        {/* ── Section: The New Pattern Is the Old Pattern ───────────── */}
        <h2 style={heading}>The New Pattern Is the Old Pattern</h2>
        <p style={prose}>
          In 2000, American Canyon had 9,774 residents {"\u2014"} 7.9% of Napa County{"\u2019"}s 124,279. By 2010 it had nearly doubled to 19,454. By 2025 it stands at 22,396 {"\u2014"} 16.5% of the county.
        </p>
        <p style={prose}>
          Since 2000, American Canyon has added roughly 12,622 residents. The rest of Napa County, taken together, has added approximately 750. Subtract American Canyon entirely, and the county outside that one city has posted essentially flat population over a quarter century.
        </p>
        <p style={prose}>
          St. Helena{"\u2019"}s 2025 population of 5,349 is roughly 10% below its 2000 census count. Yountville{"\u2019"}s 2,638 is down by a similar margin. Calistoga is within 200 residents of where it stood 25 years ago. The city of Napa is up modestly. The unincorporated balance of the county is near flat.
        </p>
        <p style={prose}>
          Last year{"\u2019"}s E-1 release, documented in this column in May 2025, showed the same geometry: a narrow southern gain, an upvalley decline, and county totals still running well below the 2016 peak. This year{"\u2019"}s release extends that reading across a second consecutive year of growth and a longer time series. A pattern that appears once is a data point. A pattern that persists across 25 years of census and state records {"\u2014"} through boom, pandemic, wildfire and recovery {"\u2014"} is a structural condition.
        </p>

        {/* Chart 3 — Population by Jurisdiction 2000 vs 2025 */}
        {chartReady ? (
          <ChartBox
            title="Population by Jurisdiction, 2000 vs. 2025"
            caption="American Canyon has grown 129 percent since 2000. St. Helena and Yountville are each down roughly 10 percent. The unincorporated balance of the county is down 18 percent. Most of Napa County's net population growth this century has been absorbed by one city."
            source="U.S. Census Bureau Decennial Census (2000); California Department of Finance, E-1 Population Estimates (2025)"
          >
            <Chart3 />
          </ChartBox>
        ) : <div style={{ background: T.surface, borderRadius: 8, padding: 32, margin: "32px 0", textAlign: "center", color: T.muted, fontFamily: font, fontSize: 14 }}>Loading chart...</div>}


        {/* ── Section: Still Below Peak, After Eight Years ───────────── */}
        <h2 style={heading}>Still Below Peak, After Eight Years</h2>
        <p style={prose}>
          Napa County reached its modern population peak of 141,784 in 2017, according to DOF{"\u2019"}s E-4 series (May 2018 benchmark). It has not recovered. The county stood at 136,124 on January 1, 2025 {"\u2014"} 5,660 residents below that peak, or 4.0% lower. The 2025 figure is within 360 residents of the county{"\u2019"}s 2010 census count of 136,484. In effect, the past 15 years have produced no net population change at the county level.
        </p>
        <p style={prose}>
          What has changed in that time is where the residents live. In 2010, American Canyon held 14.3% of the county. In 2025, it holds 16.5%. Every other jurisdiction has held flat, declined, or shrunk as a share of the county.
        </p>
        <p style={prose}>
          Housing construction mirrors the same geography. In 2024, Napa County added 658 housing units {"\u2014"} a 1.2% increase. American Canyon and the city of Napa together accounted for roughly 91% of that total. The three upvalley cities combined added 21 units. American Canyon{"\u2019"}s housing stock grew 5.0% in one year, among the fastest percent-change gains of any incorporated jurisdiction in California.
        </p>

        {/* Chart 1 — Napa County Population Trend */}
        {chartReady ? (
          <ChartBox
            title="Napa County Population Trend, 2000–2025"
            caption="The county's 2025 count of 136,124 sits 5,660 residents below its 2017 peak of 141,784 and within 360 residents of its 2010 census count. After eight years, Napa County has not recovered its previous high."
            source="U.S. Census Bureau Decennial Census (2000, 2010, 2020); California Department of Finance, E-4 Estimates with 2010 Benchmark (2011–2018); DOF E-1 Estimates (2023–2025)"
          >
            <Chart1 />
          </ChartBox>
        ) : <div style={{ background: T.surface, borderRadius: 8, padding: 32, margin: "32px 0", textAlign: "center", color: T.muted, fontFamily: font, fontSize: 14 }}>Loading chart...</div>}


        {/* ── Section: One County Line, Two Different Commutes ──────── */}
        <h2 style={heading}>One County Line, Two Different Commutes</h2>
        <p style={prose}>
          Napa Valley is 30 miles long and narrow. A worker employed in Calistoga or St. Helena who lives in American Canyon faces a 25- to 35-mile commute {"\u2014"} roughly equivalent to commuting from Cloverdale in Sonoma County or Lakeport in Lake County, at materially lower housing costs in both comparison cases. The county line is not the relevant labor-market boundary for many upvalley workers. For an hourly worker priced out of St. Helena, leaving Napa County is often a shorter commute than staying in it.
        </p>
        <p style={prose}>
          American Canyon{"\u2019"}s housing surge is driven by the reverse dynamic: regional-scale developments {"\u2014"} Watson Ranch, Lemos Pointe and others {"\u2014"} built to serve Bay Area households for whom southern Napa County is an affordable alternative to Marin or the East Bay. The city sits at the intersection of State Route 29 and the corridor to Interstate 80, with direct access to Solano, Contra Costa and Alameda employment centers. U.S. Census LEHD {"\u2018"}On The Map{"\u2019"} data indicate that only 11% of American Canyon workers also live in American Canyon {"\u2014"} a ratio consistent with a bedroom community oriented outward rather than inward to Napa County{"\u2019"}s own labor market.
        </p>


        {/* ── Section: The Commuter Arithmetic ──────────────────────── */}
        <h2 style={heading}>The Commuter Arithmetic</h2>
        <p style={prose}>
          The Napa Valley Transportation Authority{"\u2019"}s 2018 Napa Valley Travel Behavior Study found approximately 30,740 workers commuting into Napa County daily, and approximately 26,500 commuting out {"\u2014"} a net inflow of about 4,240. The net inflow had been approximately 7,000 in 2015. The 40% decline in three years suggests the county{"\u2019"}s dependence on imported labor was softening well before the pandemic.
        </p>
        <p style={prose}>
          NVTA also observed that outbound Napa workers earned, on average, more than inbound workers. Inbound commuters skewed toward service, hospitality and agricultural wages. Outbound commuters included a larger share of professional, technical and managerial workers.
        </p>
        <p style={prose}>
          If the 2015{"\u2013"}2018 trend continued at the same rate, Napa County would have crossed into net commuter outflow territory around 2024 {"\u2014"} more workers leaving daily than arriving. That is an extrapolation, not a measurement. An updated NVTA or ACS commuting-flow study is required to confirm the crossover. The chart below shows the 2015 and 2018 NVTA values together with that linear extension.
        </p>

        {/* Chart 4 — Net Commuter Inflow */}
        {chartReady ? (
          <ChartBox
            title="Net Commuter Inflow to Napa County, 2015–2018 (with extrapolation)"
            caption="NVTA measured a net inflow of approximately 7,000 commuters in 2015 and approximately 4,240 in 2018 — a 40 percent decline in three years. The dashed bars are a linear extension of that trend for 2021 through 2030. The extrapolation is illustrative only."
            source="Napa Valley Transportation Authority, Napa Valley Travel Behavior Study (2018). Linear extension 2019–2030 by the author — illustrative only."
            note="No updated NVTA or ACS study has confirmed a crossover into net outflow territory."
            scenarioBadge
          >
            <Chart4 />
          </ChartBox>
        ) : <div style={{ background: T.surface, borderRadius: 8, padding: 32, margin: "32px 0", textAlign: "center", color: T.muted, fontFamily: font, fontSize: 14 }}>Loading chart...</div>}


        {/* ── Section: More Rooms, Fewer Jobs per Room ──────────────── */}
        <h2 style={heading}>More Rooms, Fewer Jobs per Room</h2>
        <p style={prose}>
          Napa County{"\u2019"}s visitor economy long offered a clean correlation between capacity and employment. Between 2009 and 2019, the county{"\u2019"}s lodging inventory grew by roughly 700 rooms and leisure-and-hospitality employment expanded by more than 5,000 jobs {"\u2014"} a ratio of more than seven jobs added per hotel room added.
        </p>
        <p style={prose}>
          That ratio reversed. Between 2019 and 2024, roughly 382 rooms were added while leisure and hospitality employment fell by approximately 200, and food-services and drinking-places employment fell by roughly 470. The rooms-to-jobs ratio flipped from +7.6 to {"\u2212"}0.5.
        </p>
        <p style={prose}>
          This is a sector-specific measure {"\u2014"} employment yield in the visitor economy {"\u2014"} not a comprehensive read on Napa County{"\u2019"}s labor market. But it captures a change in the single sector most frequently invoked to explain cross-county commuting: lodging capacity is no longer producing net new employment the way it used to.
        </p>

        {/* Chart 5 — Jobs per Hotel Room */}
        {chartReady ? (
          <ChartBox
            title="Leisure and Hospitality Jobs Added per Hotel Room Added, 2009–2019 vs. 2019–2024"
            caption="From 2009 to 2019, each hotel room added in Napa County was associated with more than seven new leisure and hospitality jobs. Since 2019, the ratio has inverted: rooms have continued to be added, but leisure and hospitality employment has declined."
            source="Bureau of Labor Statistics — Napa County Total Leisure and Hospitality (NAPA906LEIHN), Food Services and Drinking Places (SMU06349007072200001SA); STR Monthly Industry Report"
            note="Sector-specific employment-yield measure, not a comprehensive read on the Napa County labor market."
          >
            <Chart5 />
          </ChartBox>
        ) : <div style={{ background: T.surface, borderRadius: 8, padding: 32, margin: "32px 0", textAlign: "center", color: T.muted, fontFamily: font, fontSize: 14 }}>Loading chart...</div>}


        {/* ── Section: Housing Has Grown. Jobs Have Not. ────────────── */}
        <h2 style={heading}>Housing Has Grown. Jobs Have Not.</h2>
        <p style={prose}>
          Between 2010 and 2024, Napa County{"\u2019"}s housing stock grew roughly 19%, adding approximately 9,000 units. Total nonfarm employment grew marginally over the same span. Intra-county weekday vehicle trips fell from approximately 72,100 in 2018 to 58,000 in 2024. If housing scarcity were the binding constraint on employment, inbound commuting and internal trip volumes would be climbing. They are not.
        </p>
        <p style={prose}>
          Affordability data make the structural point concrete. In 2010, the median Napa County home sold at roughly 4.5 times median household income. As of 2025, that ratio is approximately 8.6. Qualifying for a median-priced Napa County home at current mortgage rates requires a household income near $230,000. Median hospitality wages in Napa County run roughly $35,000 to $45,000. No amount of unit construction closes that gap without a corresponding change in the wage mix.
        </p>

        {/* Chart 6 — Housing Units and Total Nonfarm Employment */}
        {chartReady ? (
          <ChartBox
            title="Napa County Housing Units and Total Nonfarm Employment, Indexed to January 2019 = 100"
            caption="Both series indexed to their January 2019 values. Housing has continued to grow through and past the pandemic; total nonfarm employment has not. The shaded area is the widening gap between residential capacity and workforce."
            source="California Department of Finance, E-1H Housing Unit Estimates; Bureau of Labor Statistics, Napa County total nonfarm payrolls"
          >
            <Chart6 />
          </ChartBox>
        ) : <div style={{ background: T.surface, borderRadius: 8, padding: 32, margin: "32px 0", textAlign: "center", color: T.muted, fontFamily: font, fontSize: 14 }}>Loading chart...</div>}


        {/* ── Section: What the Data Show, and What They Don't ──────── */}
        <h2 style={heading}>What the Data Show, and What They Don{"\u2019"}t</h2>
        <p style={prose}>
          Four observations are supported directly by the E-1 release, the long-run DOF and Census series, and BLS employment data: county population growth over the past two years has concentrated almost entirely in American Canyon; the geographic pattern has persisted for 25 years across multiple data vintages; housing growth has outpaced job growth since 2019; and the visitor economy{"\u2019"}s employment yield per added hotel room has reversed.
        </p>
        <p style={prose}>
          Three further readings are consistent with the data but not yet fully established: American Canyon{"\u2019"}s growth is driven more by regional labor markets than by Napa County{"\u2019"}s own; Napa County{"\u2019"}s net commuter inflow may have already crossed into outflow territory; and the wage structure of the county{"\u2019"}s dominant job sectors is the principal constraint on broader-based demographic recovery.
        </p>
        <p style={prose}>
          One question the available public data cannot yet answer: where do new American Canyon residents actually work, and what share of upvalley employers{"\u2019"} workforces now live outside Napa County entirely? A countywide residency-and-commute survey {"\u2014"} of the kind NVTA conducted in 2018 {"\u2014"} would close that gap more quickly and at lower cost than any housing program the county is currently running. That is a measurement gap, not a policy recommendation.
        </p>
        <p style={prose}>
          What the E-1 release tells us, plainly, is where Napa County{"\u2019"}s growth is landing. It is landing in American Canyon. The rest of the county {"\u2014"} eight out of ten residents {"\u2014"} is holding roughly steady or slowly declining, as it has for most of this century. Until the conditions that produce that geography change, the next E-1 release is likely to read much like this one.
        </p>

        {/* Inline byline — after final paragraph, before Sources */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.ink, fontStyle: "italic", lineHeight: 1.65, margin: "28px 0 0 0" }}>
          Tim Carl is a Napa Valley-based photojournalist and the founder and editor of Napa Valley, Sonoma County and Lake County Features.
        </p>

        {/* Sources */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 24, marginTop: 32 }}>
          <h2 style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: T.ink, margin: "0 0 12px 0" }}>Sources</h2>
          <ul style={{ fontFamily: font, fontSize: 13, color: T.muted, lineHeight: 1.6, margin: 0, paddingLeft: 18 }}>
            <li style={{ marginBottom: 6 }}><a href="https://dof.ca.gov/forecasting/demographics/estimates-e1/" style={{ color: T.accent }}>California Department of Finance</a> {"\u2014"} E-1 Population Estimates for Cities, Counties, and the State, January 1, 2024 and 2025 (released May 1, 2025).</li>
            <li style={{ marginBottom: 6 }}><a href="https://dof.ca.gov/forecasting/demographics/estimates-e1/" style={{ color: T.accent }}>DOF E-1H Housing Estimates</a> {"\u2014"} Cities, Counties, and the State, January 1, 2024 and 2025.</li>
            <li style={{ marginBottom: 6 }}><a href="https://dof.ca.gov/forecasting/demographics/estimates-e4/" style={{ color: T.accent }}>DOF E-4 Historical Population Estimates with 2010 Benchmark, 2011{"\u2013"}2018</a> (released May 2018).</li>
            <li style={{ marginBottom: 6 }}><a href="https://dof.ca.gov/forecasting/demographics/projections/" style={{ color: T.accent }}>DOF P-1A Population Projections by County, 2020{"\u2013"}2060</a>.</li>
            <li style={{ marginBottom: 6 }}><a href="https://www.census.gov/quickfacts/napacountycalifornia" style={{ color: T.accent }}>U.S. Census Bureau</a> {"\u2014"} Decennial Census Napa County QuickFacts, 2000, 2010, 2020.</li>
            <li style={{ marginBottom: 6 }}><a href="https://www.nvta.ca.gov/studies-plans" style={{ color: T.accent }}>Napa Valley Transportation Authority</a> {"\u2014"} Napa Valley Travel Behavior Study (2018).</li>
            <li style={{ marginBottom: 6 }}><a href="https://lehd.ces.census.gov/data/" style={{ color: T.accent }}>U.S. Census LEHD LODES / On The Map</a>.</li>
            <li style={{ marginBottom: 6 }}><a href="https://fred.stlouisfed.org/series/NAPA906LEIHN" style={{ color: T.accent }}>BLS Napa County Total Leisure and Hospitality (NAPA906LEIHN)</a>.</li>
            <li style={{ marginBottom: 6 }}><a href="https://fred.stlouisfed.org/series/SMU06349007072200001SA" style={{ color: T.accent }}>BLS Napa Food Services and Drinking Places (SMU06349007072200001SA)</a>.</li>
            <li style={{ marginBottom: 6 }}><a href="https://str.com/" style={{ color: T.accent }}>STR (CoStar) Monthly Industry Report</a>.</li>
            <li style={{ marginBottom: 6 }}><a href="https://www.countyofnapa.org/1984/Housing-Element-Update" style={{ color: T.accent }}>Napa County 2024 Housing Needs Assessment</a>.</li>
            <li style={{ marginBottom: 6 }}><a href="https://napavalleyfocus.substack.com/p/under-the-hood-american-canyon-grows" style={{ color: T.accent }}>Napa Valley Features {"\u2014"} American Canyon Grows While the Upvalley Shrinks</a> (May 10, 2025).</li>
            <li style={{ marginBottom: 6 }}><a href="https://napavalleyfocus.substack.com/p/under-the-hood-rethinking-the-housing" style={{ color: T.accent }}>Napa Valley Features {"\u2014"} Rethinking the Housing Narrative in Napa County</a> (June 7, 2025).</li>
            <li style={{ marginBottom: 6 }}><a href="https://napavalleyfocus.substack.com/p/under-the-hood-is-napa-valley-building" style={{ color: T.accent }}>Napa Valley Features {"\u2014"} Is Napa Valley Building for a Future That Doesn{"\u2019"}t Exist?</a> (August 31, 2024).</li>
            <li style={{ marginBottom: 6 }}><a href="https://napavalleyregister.com/news/napa-population-growth-california/article_02b77c02-5eae-4a61-9506-c1d9979b4527.html" style={{ color: T.accent }}>Napa Valley Register {"\u2014"} Napa County sees second year of population growth</a> (May 8, 2025).</li>
          </ul>
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

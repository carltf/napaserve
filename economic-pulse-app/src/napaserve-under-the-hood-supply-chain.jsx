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

// ─── chart placeholders ───────────────────────────────────────────────────────
// TODO: Replace with Chart.js implementations from Features Copy Editor session

function Chart1_HormuzTraffic() {
  // Chart 1: Hormuz Strait tanker traffic collapse
  // Download filename: chart-1_hormuz-traffic-collapse_nvf_2026.png
  return (
    <div style={{ background: T.bg, border: `1px dashed ${T.border}`, borderRadius: 6, padding: 32, textAlign: "center", color: T.muted, fontFamily: "'Source Sans 3', sans-serif", fontSize: 14 }}>
      Chart 1: Hormuz Strait Tanker Traffic Collapse — placeholder
    </div>
  );
}

function Chart2_CommodityBeforeAfter() {
  // Chart 2: Commodity prices before vs. after disruption
  // Download filename: chart-2_commodity-before-after_nvf_2026.png
  return (
    <div style={{ background: T.bg, border: `1px dashed ${T.border}`, borderRadius: 6, padding: 32, textAlign: "center", color: T.muted, fontFamily: "'Source Sans 3', sans-serif", fontSize: 14 }}>
      Chart 2: Commodity Prices Before vs. After — placeholder
    </div>
  );
}

function Chart3_EnergyPriceShock() {
  // Chart 3: Energy price shock transmission
  // Download filename: chart-3_energy-price-shock_nvf_2026.png
  return (
    <div style={{ background: T.bg, border: `1px dashed ${T.border}`, borderRadius: 6, padding: 32, textAlign: "center", color: T.muted, fontFamily: "'Source Sans 3', sans-serif", fontSize: 14 }}>
      Chart 3: Energy Price Shock Transmission — placeholder
    </div>
  );
}

function Chart4_NapaGdpEmploymentGap() {
  // Chart 4: Napa GDP vs. employment gap
  // Download filename: chart-4_napa-gdp-employment-gap_nvf_2026.png
  return (
    <div style={{ background: T.bg, border: `1px dashed ${T.border}`, borderRadius: 6, padding: 32, textAlign: "center", color: T.muted, fontFamily: "'Source Sans 3', sans-serif", fontSize: 14 }}>
      Chart 4: Napa GDP and Employment Gap — placeholder
    </div>
  );
}

// ─── scenario calculator placeholder ──────────────────────────────────────────
// TODO: Implement interactive calculator with 3 sliders and 3 outputs (jobs/wages/GDP gap)

function ScenarioCalculator() {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 32, margin: "32px 0" }}>
      <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 10, letterSpacing: "0.1em", color: T.gold, fontWeight: 700, textTransform: "uppercase", margin: "0 0 8px 0" }}>Interactive Tool</p>
      <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 700, color: T.ink, margin: "0 0 12px 0" }}>Supply Shock Scenario Calculator</h3>
      <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: T.muted, margin: "0 0 20px 0" }}>
        Adjust assumptions to see how a Hormuz disruption could affect Napa Valley.
      </p>
      <div style={{ background: T.bg, border: `1px dashed ${T.border}`, borderRadius: 6, padding: 32, textAlign: "center", color: T.muted, fontFamily: "'Source Sans 3', sans-serif", fontSize: 14 }}>
        Scenario Calculator — 3 sliders, 3 outputs (jobs, wages, GDP gap) — placeholder
      </div>
    </div>
  );
}

// ─── article sections ─────────────────────────────────────────────────────────
// TODO: Replace placeholder body text with final article prose

const SECTIONS = [
  { id: "intro", heading: null, body: "PLACEHOLDER: Introduction — War around Iran has cut Hormuz tanker traffic 94%. This article traces the supply chain from the strait to the Napa farm gate.", chart: null },
  { id: "hormuz", heading: "The Hormuz Chokepoint", body: "PLACEHOLDER: How the Strait of Hormuz disruption unfolded and what it means for global energy flows.", chart: { component: Chart1_HormuzTraffic, title: "Hormuz Strait Tanker Traffic Collapse", caption: "PLACEHOLDER: Chart caption for Hormuz traffic data." } },
  { id: "commodities", heading: "Commodity Prices Before and After", body: "PLACEHOLDER: How commodity prices shifted after the disruption began.", chart: { component: Chart2_CommodityBeforeAfter, title: "Commodity Prices: Before vs. After the Disruption", caption: "PLACEHOLDER: Chart caption for commodity price comparison." } },
  { id: "energy", heading: "The Energy Price Shock", body: "PLACEHOLDER: How energy price increases transmit through the supply chain to agricultural inputs.", chart: { component: Chart3_EnergyPriceShock, title: "Energy Price Shock Transmission to Napa Valley", caption: "PLACEHOLDER: Chart caption for energy price shock data." } },
  { id: "napa-impact", heading: "What It Means for Napa", body: "PLACEHOLDER: How the supply chain disruption reaches Napa Valley — GDP, employment, and the widening gap.", chart: { component: Chart4_NapaGdpEmploymentGap, title: "Napa GDP and Employment: The Widening Gap", caption: "PLACEHOLDER: Chart caption for Napa GDP and employment gap data." } },
  { id: "calculator", heading: "Run Your Own Scenario", body: "PLACEHOLDER: Use the calculator below to model different disruption scenarios and their impact on Napa Valley.", chart: null, calculator: true },
  { id: "cushion", heading: "Less Cushion Than the Numbers Suggest", body: "PLACEHOLDER: Why Napa's economy has less resilience than headline GDP figures imply.", chart: null },
];

const RELATED = [
  { title: "Napa\u2019s Economy Looks Bigger Than It Is", date: "Napa Valley Features", url: "/under-the-hood/napa-gdp-2024" },
  { title: "Napa Cabernet Prices Break the Growth Curve", date: "Napa Valley Features", url: "/under-the-hood/napa-cab-2025" },
];

const SOURCES = [
  // TODO: Add all 12 confirmed source URLs from the docx
  { label: "PLACEHOLDER: Source 1", url: "#" },
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
          How a Global Supply Shock Reaches Napa Valley
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
            <Link key={item.title} to={item.url}
              style={{ display: "block", padding: "16px 0", borderBottom: `1px solid ${T.border}`, textDecoration: "none" }}>
              <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, color: T.accent, fontWeight: 600, margin: "0 0 4px 0" }}>{item.title}</p>
              <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.muted, margin: 0 }}>{item.date}</p>
            </Link>
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
            Questions, corrections or tips? Contact <a href="/about#contact" style={{ color: T.accent }}>the newsroom</a>.
          </p>
        </div>

      </div>
      <Footer />
    </div>
  );
}

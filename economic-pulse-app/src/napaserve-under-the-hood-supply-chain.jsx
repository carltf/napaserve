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

const SECTIONS = [
  { id: "intro", heading: null, body: "A vineyard manager prices diesel for a week of tractor work. A winery waits on a part for a cooling system. A packaging order gets harder to quote. A hotel manager watches booking patterns for signs that visitors are pulling back.\n\nThose are routine decisions in Napa Valley. They no longer sit inside a routine global economy.\n\nThe current shock begins in a place many readers know by name but may not fully grasp as a system: the Strait of Hormuz. On Feb. 28, coordinated U.S.-Israeli airstrikes on Iran triggered a sequence of events that has brought the global economy to the edge of one of its worst energy crises in decades. Iran\u2019s Islamic Revolutionary Guard Corps declared the strait closed, tanker traffic ground to a near halt, and oil prices surged faster than during any other conflict in recent history. Brent crude exceeded $100 per barrel March 8 for the first time in four years, reaching a peak of $126. The IEA\u2019s executive director described the current situation as worse than the combined oil crises of 1973 and 1979. UNCTAD documented the most immediate maritime impact: traffic through the strait fell from roughly 110 ships a day to fewer than 10 \u2014 a decline of more than 94% \u2014 according to Lloyd\u2019s List Intelligence and Windward Maritime AI data through March 20.", chart: null },
  { id: "hormuz", heading: "What Moves Through the Strait", body: "The strait is not only an oil story. That is the essential premise for understanding why Napa is exposed.\n\nThe Hormuz passage carries roughly 20% of all global seaborne oil trade and approximately 20% of global LNG, according to UNCTAD and IEA data. It also carries liquefied petroleum gas, refined products, fertilizers and the chemical inputs that flow downstream into industrial production worldwide. Qatar\u2019s Ras Laffan facility \u2014 one of the world\u2019s largest LNG export terminals \u2014 declared force majeure on all LNG shipments March 4 after Iranian attacks on its infrastructure, removing roughly 20% of the world\u2019s LNG supply from the market in a single day. European natural gas prices roughly doubled within days, from about \u20AC30 per megawatt-hour to above \u20AC60. Asian LNG spot prices surged more sharply. Dry bulk transits through the strait are down 91%, with approximately 280 vessels trapped in the region, according to Kpler vessel tracking data.\n\nThat matters locally even if Napa businesses do not buy LNG directly. Natural gas stress moves through electricity costs, industrial heat, fertilizers, chemicals and the production chain for materials that vineyards, wineries, hotels and restaurants rely on. It also reaches Napa indirectly through visitor-origin economies in Europe and Asia, where households and businesses are absorbing the same energy squeeze. The same conflict that raises input costs here weakens spending power there.", chart: { component: Chart1_HormuzTraffic, title: "Hormuz Strait Tanker Traffic Collapse", caption: "PLACEHOLDER: Chart caption for Hormuz traffic data." } },
  { id: "downstream", heading: "How the Shock Travels Downstream", body: "The chain from chokepoint to vineyard runs through several transmission layers, not just pump prices.\n\nOil and refined products are the most visible layer. Diesel powers tractors, trucks and generators. Freight rates for oil tankers have surged alongside war risk insurance premiums and marine fuel costs, increasing shipping costs across supply chains. But oil is the surface.\n\nNatural gas feeds industrial production across multiple sectors at a level most readers do not track. When Qatar\u2019s Ras Laffan went offline, the ripple moved immediately into materials that have nothing obvious to do with energy. Aluminum is one example. In March, Hydro reported that its Qatalum joint venture in Qatar began a controlled shutdown after gas supply was suspended. Within days the company said reduced gas would continue and Qatalum would maintain production at about 60% of capacity. That is a clean illustration of how a gas shock becomes a materials shock. The problem is not energy scarcity alone. It is downstream industrial output.\n\nHelium is another example \u2014 a case study in how deep the chain runs. Helium is used in semiconductor manufacturing because it provides a stable inert atmosphere and improves heat transfer. Supply disruptions can jeopardize manufacturing in consumer electronics and related sectors, according to the U.S. Geological Survey. Chips now sit inside nearly every modern system: vehicles, appliances, logistics platforms, communications infrastructure. When helium supply tightens, the constraint does not announce itself at the pump. It shows up quarters later in lead times, component costs and equipment availability.\n\nFertilizers and agricultural chemicals complete the picture. The Middle East Gulf accounts for 16% to 18% of global seaborne fertilizer exports, according to Kpler. In Napa, that exposure shows up less as a single dramatic shortage than as one more layer of cost pressure running through vineyard operations. Nearly half the world\u2019s traded sulfur supply \u2014 a base input for phosphate fertilizers and industrial chemical manufacturing \u2014 is currently stranded on the Persian Gulf side of the strait, according to CRU Group.\n\nManufacturing trade friction adds a parallel layer. On March 11, the Office of the U.S. Trade Representative opened new Section 301 investigations into structural excess capacity in manufacturing sectors \u2014 a signal that trade friction tied to China is rising again at precisely the moment energy and shipping systems are under strain. For Napa, that means more uncertainty around pumps, fittings, refrigeration components, warehouse materials, fabricated parts and the small industrial goods that make a premium agricultural region run on time.", chart: { component: Chart2_CommodityBeforeAfter, title: "Commodity Prices: Before vs. After the Disruption", caption: "PLACEHOLDER: Chart caption for commodity price comparison." } },
  { id: "tourism", heading: "The Tourism Channel", body: "Then Napa gets hit again through travel.\n\nThe energy and transport pressures affecting producers also affect visitors. European and Asian travelers \u2014 among Napa\u2019s most valuable \u2014 are absorbing higher fuel costs, gas-market stress and more uncertain travel conditions. These are not abstract geopolitical statistics. They describe the energy budgets of the households and businesses that produce the international visitors Napa depends on for discretionary spending.\n\nThat does not mean visitor traffic collapses in a straight line. It means the tourism channel becomes more fragile at precisely the moment the production channel becomes more expensive. In a place where the economic model depends on both agriculture and hospitality, that is the double hit.\n\nShocks of this scale also carry a longer tail than the headlines imply. Shipping routes do not normalize overnight. Insurance costs can stay elevated for months. Industrial facilities do not return to full output in a single step. Iran\u2019s de facto blockade has already produced a selective, permission-based transit regime \u2014 what shipping industry experts have dubbed the \u201CTehran toll booth\u201D \u2014 that Iran appears to be turning into a longer-term instrument of geopolitical leverage, according to reporting by Al Jazeera and NBC News as of March 26.", chart: { component: Chart3_EnergyPriceShock, title: "Energy Price Shock Transmission to Napa Valley", caption: "PLACEHOLDER: Chart caption for energy price shock data." } },
  { id: "napa-impact", heading: "Less Cushion Than the Numbers Suggest", body: "That longer tail matters because Napa County is not entering this shock from a position of unusual strength.\n\nAs documented in \u201CUnder the Hood: Napa\u2019s Economy Looks Bigger Than It Is,\u201D nominal GDP reached $14.59 billion in 2024, up 35.8% since 2016. Adjusted for inflation, the same economy grew 4.6%. Of the apparent $3.84 billion in growth over that period, roughly 87 cents of every dollar reflected inflation rather than real output. At the same time, the county\u2019s jobs engine has stalled. Leisure and hospitality employment is essentially flat since 2019 despite continued nominal expansion \u2014 and if the 2009\u20132019 growth trend had continued, that sector would employ roughly 4,800 more workers today than it actually does. In a county where a contracting wine industry accounts for 72% of all jobs and 74% of all wages, another round of pressure on fuel, natural gas, freight, manufacturing and travel is not just a story about higher costs. It is a story about employment, wages and the tax base that funds public services.\n\nAnother wave of supply-chain disruption could widen the same disconnect Napa is already living with: the gap between what the economy appears to be producing in current dollars and what it is actually producing after inflation. Revenues can rise on paper while real output, hiring power and local resilience lag behind. In a county built on both agriculture and tourism, that is not a short-term inconvenience. It is a structural risk that the nominal numbers have been obscuring for years.\n\nWhat happens in Hormuz does not stay in Hormuz. It can show up in a diesel invoice, a delayed part, a more expensive bottling run, a cautious traveler, a softer booking calendar and a wider gap between nominal prosperity and real economic strength. That is the supply-chain story Napa now has to reckon with.", chart: { component: Chart4_NapaGdpEmploymentGap, title: "Napa GDP and Employment: The Widening Gap", caption: "PLACEHOLDER: Chart caption for Napa GDP and employment gap data." } },
  { id: "calculator", heading: "Run Your Own Scenario", body: "Use the calculator below to model how the Hormuz supply shock \u2014 layered on top of an already-contracting wine industry \u2014 could compound pressure on Napa County jobs, wages and the gap between nominal and real GDP. Adjust input cost increases, visitor spend decline and duration to explore the range of outcomes.", chart: null, calculator: true },
];

const RELATED = [
  { title: "Napa\u2019s Economy Looks Bigger Than It Is", date: "Napa Valley Features", url: "/under-the-hood/napa-gdp-2024" },
  { title: "Napa Cabernet Prices Break the Growth Curve", date: "Napa Valley Features", url: "/under-the-hood/napa-cab-2025" },
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

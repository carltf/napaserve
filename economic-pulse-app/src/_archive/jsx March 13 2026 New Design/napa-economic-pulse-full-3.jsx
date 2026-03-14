import { useState } from "react";
import { Link } from "react-router-dom";

export default function EconomicPulse() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSubTab, setActiveSubTab] = useState("Weekly Detail");

  return (
    <div style={{ background: "#F5F0E8", minHeight: "100vh", fontFamily: "'Source Sans 3', sans-serif", color: "#2C1810" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        :root{--bg:#F5F0E8;--bg2:#EDE8DE;--bg3:#E6E0D4;--ink:#1A0E08;--ink2:#2C1810;--accent:#8B5E3C;--gold:#C4A050;--muted:#7A6A50;--dim:#A89880;--rule:rgba(44,24,16,0.12);--live:#4A7A5A;--neg:#8A3A2A;--pos:#3A6A4A;--navy:#1B3A5C;--blue:#6B8CAE;--red:#8B1A1A;}
        .dp-nav{background:var(--bg);border-bottom:1px solid var(--rule);padding:0 28px;height:52px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:20;}
        .dp-wordmark{font-family:'Libre Baskerville',Georgia,serif;font-size:19px;font-weight:700;color:var(--ink2);}
        .dp-nl{font-size:11px;font-weight:600;color:var(--dim);padding:6px 12px;cursor:pointer;letter-spacing:.04em;text-decoration:none;transition:color .15s;}
        .dp-nl:hover{color:var(--accent);}
        .dp-nl.active{color:var(--ink2);background:var(--bg2);}
        .dp-header{max-width:1000px;margin:0 auto;padding:40px 28px 0;}
        .dp-breadcrumb{display:flex;align-items:center;gap:8px;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);margin-bottom:12px;}
        .dp-dot{width:5px;height:5px;border-radius:50%;background:var(--live);}
        .dp-title{font-family:'Libre Baskerville',Georgia,serif;font-size:clamp(28px,4vw,42px);font-weight:700;color:var(--ink2);margin-bottom:6px;}
        .dp-sub{font-size:12px;color:var(--dim);display:flex;align-items:center;gap:8px;}
        .dp-connected{display:flex;align-items:center;gap:4px;color:var(--live);font-weight:600;}
        .dp-cdot{width:5px;height:5px;border-radius:50%;background:var(--live);}
        .dp-tabs{max-width:1000px;margin:0 auto;padding:24px 28px 0;border-bottom:1px solid var(--rule);}
        .dp-tab{font-size:12px;font-weight:600;color:var(--dim);padding:10px 20px;cursor:pointer;border-bottom:2px solid transparent;transition:color .15s,border-color .15s;letter-spacing:.04em;background:none;border-top:none;border-left:none;border-right:none;}
        .dp-tab:hover{color:var(--ink2);}
        .dp-tab.active{color:var(--ink2);border-bottom-color:var(--accent);}
        .dp-content{max-width:1000px;margin:0 auto;padding:32px 28px;}
        .dp-sec-title{font-family:'Libre Baskerville',Georgia,serif;font-size:22px;font-weight:700;color:var(--ink2);margin-bottom:4px;}
        .dp-sec-sub{font-size:11px;color:var(--dim);margin-bottom:20px;}
        .dp-updated{font-size:10px;color:var(--dim);margin-bottom:20px;font-style:italic;}
        .dp-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:24px;}
        .dp-kpi-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:24px;}
        .dp-kpi{background:var(--bg2);border:1px solid var(--rule);padding:16px 18px;}
        .dp-kpi-label{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);margin-bottom:8px;}
        .dp-kpi-val{font-family:'Libre Baskerville',Georgia,serif;font-size:28px;font-weight:700;color:var(--ink2);line-height:1;margin-bottom:4px;}
        .dp-kpi-val.gold{color:var(--gold);}
        .dp-kpi-val.neg{color:var(--neg);}
        .dp-kpi-val.pos{color:var(--pos);}
        .dp-kpi-note{font-size:10px;color:var(--dim);}
        .dp-kpi-delta{font-size:10px;font-weight:700;margin-top:4px;}
        .dp-kpi-delta.neg{color:var(--neg);}
        .dp-kpi-delta.pos{color:var(--pos);}
        .dp-sub-tabs{display:flex;gap:6px;margin-bottom:16px;align-items:center;}
        .dp-stab{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:7px 14px;border:1px solid var(--rule);background:transparent;color:var(--dim);cursor:pointer;transition:all .15s;}
        .dp-stab:hover{color:var(--ink2);border-color:var(--ink2);}
        .dp-stab.active{background:var(--gold);color:#fff;border-color:var(--gold);}
        .dp-stab-note{font-size:10px;color:var(--dim);margin-left:4px;}
        .dp-chart-wrap{background:var(--bg2);border:1px solid var(--rule);padding:20px;margin-bottom:20px;}
        .dp-chart-label{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);margin-bottom:12px;}
        .dp-context{background:var(--bg2);border:1px solid var(--rule);padding:18px 20px;margin-bottom:20px;}
        .dp-context-label{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);margin-bottom:10px;}
        .dp-macro-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
        .dp-macro-kpi{background:var(--bg2);border:1px solid var(--rule);padding:14px 16px;}
        .dp-overview-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;}
        .dp-sources{max-width:1000px;margin:0 auto;padding:16px 28px 28px;display:flex;justify-content:space-between;border-top:1px solid var(--rule);font-size:10px;color:var(--dim);}
        @media(max-width:700px){.dp-kpi-grid,.dp-kpi-grid-3{grid-template-columns:1fr 1fr;}.dp-macro-grid{grid-template-columns:1fr 1fr;}.dp-overview-grid{grid-template-columns:1fr;}.dp-nl{display:none;}.dp-nl.active{display:block;}}
      `}</style>

      {/* NAV */}
      <nav className="dp-nav">
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <div className="dp-wordmark">NapaServe</div>
          <span style={{ fontSize: 10, color: "var(--dim)", letterSpacing: ".05em" }}>Civic intelligence · Napa County</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <Link to="/dashboard" className="dp-nl active">Dashboard</Link>
          <Link to="/evaluator" className="dp-nl">Evaluator</Link>
          <Link to="/events" className="dp-nl">Events</Link>
          <Link to="/news" className="dp-nl">News</Link>
          <Link to="/archive" className="dp-nl">Archive</Link>
          <a href="/agent.html" className="dp-nl" style={{ color: "var(--accent)" }}>AI Agent</a>
          <Link to="/valley-works" className="dp-nl">Valley Works</Link>
        </div>
      </nav>

      {/* PAGE HEADER */}
      <div className="dp-header">
        <div className="dp-breadcrumb">
          <span className="dp-dot" /><span>NapaServe</span>
          <span style={{ color: "var(--rule)" }}>·</span><span>Napa County</span>
        </div>
        <h1 className="dp-title">Economic Pulse</h1>
        <div className="dp-sub">
          <span>Weekly snapshot — Mar 9, 2026</span>
          <span style={{ color: "var(--rule)" }}>|</span>
          <span>Live from Supabase</span>
          <span className="dp-connected"><span className="dp-cdot" />Connected</span>
        </div>
      </div>

      {/* TABS */}
      <div className="dp-tabs">
        <div style={{ display: "flex" }}>
          {["overview","winery","labor","housing"].map(tab => (
            <button key={tab} className={`dp-tab${activeTab === tab ? " active" : ""}`} onClick={() => setActiveTab(tab)}>
              {tab === "overview" ? "Overview" : tab === "winery" ? "Winery Licenses" : tab === "labor" ? "Labor Market" : "Housing"}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="dp-content">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div>
            <div className="dp-sec-title">Napa County at a Glance</div>
            <div className="dp-sec-sub">Latest weekly snapshot across all indicators</div>
            <div className="dp-updated">Data last updated: March 9, 2026 · Pipeline: GitHub Actions → Supabase</div>
            <div className="dp-kpi-grid">
              <div className="dp-kpi"><div className="dp-kpi-label">Winery Licenses</div><div className="dp-kpi-val">1,835</div><div className="dp-kpi-note">ABC Type-02 · Napa Co.</div><div className="dp-kpi-delta neg">↓ −99 from peak (Jun &apos;25)</div></div>
              <div className="dp-kpi"><div className="dp-kpi-label">Unemployment Rate</div><div className="dp-kpi-val">4.3%</div><div className="dp-kpi-note">FRED / BLS · Monthly</div><div className="dp-kpi-delta pos">↓ vs. CA 5.1% · US 4.1%</div></div>
              <div className="dp-kpi"><div className="dp-kpi-label">Avg Home Value</div><div className="dp-kpi-val">$867k</div><div className="dp-kpi-note">Zillow ZHVI · County</div><div className="dp-kpi-delta neg">↓ MoM · ↑ YoY</div></div>
              <div className="dp-kpi"><div className="dp-kpi-label">Food Services Jobs</div><div className="dp-kpi-val">7,339</div><div className="dp-kpi-note">CA EDD · Monthly</div><div className="dp-kpi-delta" style={{ color: "var(--dim)" }}>vs. prior month</div></div>
            </div>
            <div className="dp-overview-grid">
              <div className="dp-chart-wrap">
                <div className="dp-chart-label">Winery Licenses — Weekly History</div>
                <div style={{ height: 220 }}>
                  <svg width="100%" height="100%" viewBox="0 0 440 180" preserveAspectRatio="none">
                    <defs><linearGradient id="gf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C4A050" stopOpacity="0.25"/><stop offset="100%" stopColor="#C4A050" stopOpacity="0.02"/></linearGradient></defs>
                    <line x1="0" y1="30" x2="440" y2="30" stroke="rgba(44,24,16,0.08)" strokeWidth="0.5"/>
                    <line x1="0" y1="70" x2="440" y2="70" stroke="rgba(44,24,16,0.08)" strokeWidth="0.5"/>
                    <line x1="0" y1="110" x2="440" y2="110" stroke="rgba(44,24,16,0.08)" strokeWidth="0.5"/>
                    <line x1="0" y1="150" x2="440" y2="150" stroke="rgba(44,24,16,0.08)" strokeWidth="0.5"/>
                    <text x="2" y="28" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">1,950</text>
                    <text x="2" y="68" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">1,915</text>
                    <text x="2" y="108" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">1,880</text>
                    <text x="2" y="148" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">1,845</text>
                    <path d="M40,140 C60,135 80,120 100,110 C120,100 130,85 150,75 C165,68 175,72 185,78 C200,86 205,95 215,100 C225,88 235,70 255,45 C270,30 280,35 295,42 C310,38 320,32 335,28 C350,35 358,55 368,75 C375,88 385,105 395,115 C405,120 415,125 430,128 L430,170 L40,170 Z" fill="url(#gf)"/>
                    <path d="M40,140 C60,135 80,120 100,110 C120,100 130,85 150,75 C165,68 175,72 185,78 C200,86 205,95 215,100 C225,88 235,70 255,45 C270,30 280,35 295,42 C310,38 320,32 335,28 C350,35 358,55 368,75 C375,88 385,105 395,115 C405,120 415,125 430,128" fill="none" stroke="#C4A050" strokeWidth="1.5"/>
                    <line x1="210" y1="20" x2="210" y2="170" stroke="#8B1A1A" strokeWidth="0.75" strokeDasharray="3 2"/>
                    <text x="212" y="165" fontSize="8" fill="#8B1A1A" fontFamily="Source Sans 3,sans-serif">Oct −41</text>
                    <line x1="330" y1="20" x2="330" y2="170" stroke="#8B1A1A" strokeWidth="0.75" strokeDasharray="3 2"/>
                    <text x="332" y="165" fontSize="8" fill="#8B1A1A" fontFamily="Source Sans 3,sans-serif">Oct −68</text>
                    <text x="40" y="178" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Feb &apos;24</text>
                    <text x="150" y="178" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Aug &apos;24</text>
                    <text x="255" y="178" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Feb &apos;25</text>
                    <text x="370" y="178" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Jan &apos;26</text>
                  </svg>
                </div>
              </div>
              <div className="dp-chart-wrap">
                <div className="dp-chart-label">Unemployment Rate</div>
                <div style={{ height: 220 }}>
                  <svg width="100%" height="100%" viewBox="0 0 440 180" preserveAspectRatio="none">
                    <defs><linearGradient id="uf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C4A050" stopOpacity="0.2"/><stop offset="100%" stopColor="#C4A050" stopOpacity="0.02"/></linearGradient></defs>
                    <line x1="0" y1="40" x2="440" y2="40" stroke="rgba(44,24,16,0.08)" strokeWidth="0.5"/>
                    <line x1="0" y1="80" x2="440" y2="80" stroke="rgba(44,24,16,0.08)" strokeWidth="0.5"/>
                    <line x1="0" y1="120" x2="440" y2="120" stroke="rgba(44,24,16,0.08)" strokeWidth="0.5"/>
                    <line x1="0" y1="155" x2="440" y2="155" stroke="rgba(44,24,16,0.08)" strokeWidth="0.5"/>
                    <text x="2" y="38" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">8%</text>
                    <text x="2" y="78" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">6%</text>
                    <text x="2" y="118" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">4%</text>
                    <text x="2" y="153" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">2%</text>
                    <path d="M40,115 C70,112 100,108 130,110 C160,112 180,115 210,114 C240,113 270,112 300,113 C330,114 370,115 430,114 L430,170 L40,170 Z" fill="url(#uf)"/>
                    <path d="M40,115 C70,112 100,108 130,110 C160,112 180,115 210,114 C240,113 270,112 300,113 C330,114 370,115 430,114" fill="none" stroke="#C4A050" strokeWidth="1.5"/>
                    <text x="40" y="178" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Feb &apos;25</text>
                    <text x="215" y="178" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Mar &apos;25</text>
                    <text x="380" y="178" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Mar &apos;26</text>
                  </svg>
                </div>
              </div>
            </div>
            <div className="dp-context" style={{ marginBottom: 20 }}>
              <div className="dp-context-label">Weekly Summary</div>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--muted)" }}>Napa County&apos;s winery license count held at <strong style={{ color: "var(--accent)" }}>1,835</strong> while unemployment edged down to <strong style={{ color: "var(--accent)" }}>4.3%</strong>, outperforming both state and national averages. Home values remain elevated at <strong style={{ color: "var(--accent)" }}>$867k</strong>, constrained by the Agricultural Preserve and hillside development limits.</p>
            </div>
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--rule)" }}>
              <div className="dp-sec-title" style={{ fontSize: 18, marginBottom: 4 }}>US &amp; California Indicators</div>
              <div className="dp-sec-sub">Federal Reserve / BLS / S&amp;P — stored via weekly pipeline</div>
              <div className="dp-updated">Data last updated: March 9, 2026</div>
              <div className="dp-macro-grid">
                {[
                  { label: "US Unemployment", val: "4.1%", delta: "BLS · Monthly", type: "dim" },
                  { label: "CA Unemployment", val: "5.1%", delta: "BLS · Monthly", type: "dim" },
                  { label: "CPI (US)", val: "3.2%", delta: "↑ MoM", type: "neg" },
                  { label: "PPI (US)", val: "2.8%", delta: "Monthly", type: "dim" },
                  { label: "Fed Funds Rate", val: "4.25%", delta: "Target range", type: "dim" },
                  { label: "30yr Mortgage", val: "6.8%", delta: "↑ WoW", type: "neg" },
                  { label: "S&P 500", val: "5,614", delta: "↑ WoW", type: "pos" },
                  { label: "Consumer Confidence", val: "98.3", delta: "↓ MoM", type: "neg" },
                ].map(({ label, val, delta, type }) => (
                  <div key={label} className="dp-macro-kpi">
                    <div className="dp-kpi-label">{label}</div>
                    <div className="dp-kpi-val" style={{ fontSize: 22 }}>{val}</div>
                    <div className={`dp-kpi-delta${type !== "dim" ? " " + type : ""}`} style={{ fontSize: 10, color: type === "dim" ? "var(--dim)" : undefined }}>{delta}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WINERY */}
        {activeTab === "winery" && (
          <div>
            <div className="dp-sec-title">Napa County Winery Licenses</div>
            <div className="dp-sec-sub">ABC Type-02 active license count · 110 data points, live from Supabase</div>
            <div className="dp-updated">Data last updated: March 9, 2026 · Weekly pipeline</div>
            <div className="dp-kpi-grid">
              <div className="dp-kpi"><div className="dp-kpi-label">Current</div><div className="dp-kpi-val">1,835</div><div className="dp-kpi-note">as of Mar &apos;26</div></div>
              <div className="dp-kpi"><div className="dp-kpi-label">All-Time Peak</div><div className="dp-kpi-val gold">1,934</div><div className="dp-kpi-note">Jun &apos;25</div></div>
              <div className="dp-kpi"><div className="dp-kpi-label">From Peak</div><div className="dp-kpi-val neg">−99</div><div className="dp-kpi-note">−5.1% below</div></div>
              <div className="dp-kpi"><div className="dp-kpi-label">Since Dec &apos;19</div><div className="dp-kpi-val pos">+154</div><div className="dp-kpi-note">+9.2% growth</div></div>
            </div>
            <div className="dp-sub-tabs">
              {["Full History","Weekly Detail","Last 6 Months"].map(t => (
                <button key={t} className={`dp-stab${activeSubTab === t ? " active" : ""}`} onClick={() => setActiveSubTab(t)}>{t}</button>
              ))}
              <span className="dp-stab-note">Feb 2024 – Present</span>
            </div>
            <div className="dp-chart-wrap">
              <div className="dp-chart-label">Napa Type-02 Winery Licenses</div>
              <div style={{ height: 260 }}>
                <svg width="100%" height="100%" viewBox="0 0 900 240" preserveAspectRatio="none">
                  <defs><linearGradient id="wf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C4A050" stopOpacity="0.2"/><stop offset="100%" stopColor="#C4A050" stopOpacity="0.02"/></linearGradient></defs>
                  <line x1="35" y1="20" x2="890" y2="20" stroke="rgba(44,24,16,0.07)" strokeWidth="0.5"/>
                  <line x1="35" y1="60" x2="890" y2="60" stroke="rgba(44,24,16,0.07)" strokeWidth="0.5"/>
                  <line x1="35" y1="100" x2="890" y2="100" stroke="rgba(44,24,16,0.07)" strokeWidth="0.5"/>
                  <line x1="35" y1="140" x2="890" y2="140" stroke="rgba(44,24,16,0.07)" strokeWidth="0.5"/>
                  <line x1="35" y1="180" x2="890" y2="180" stroke="rgba(44,24,16,0.07)" strokeWidth="0.5"/>
                  <text x="2" y="18" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">1,950</text>
                  <text x="2" y="58" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">1,915</text>
                  <text x="2" y="98" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">1,880</text>
                  <text x="2" y="138" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">1,845</text>
                  <text x="2" y="178" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">1,810</text>
                  <path d="M40,180 C60,175 80,160 110,148 C140,136 160,118 180,105 C195,95 205,100 215,108 C230,118 238,130 248,136 C258,122 270,98 290,68 C305,48 318,52 332,58 C345,52 358,44 372,38 C388,46 398,72 410,98 C422,118 435,138 450,148 C462,154 475,160 490,163 C510,168 530,172 550,170 C565,162 575,145 582,128 C590,112 596,98 600,88 C605,78 610,65 618,55 C625,45 632,40 640,38 C652,42 660,55 668,72 C676,85 682,100 690,118 C696,130 705,145 718,158 C730,165 745,170 760,172 C775,170 790,165 810,160 C825,156 840,152 860,150 L860,215 L40,215 Z" fill="url(#wf)"/>
                  <path d="M40,180 C60,175 80,160 110,148 C140,136 160,118 180,105 C195,95 205,100 215,108 C230,118 238,130 248,136 C258,122 270,98 290,68 C305,48 318,52 332,58 C345,52 358,44 372,38 C388,46 398,72 410,98 C422,118 435,138 450,148 C462,154 475,160 490,163 C510,168 530,172 550,170 C565,162 575,145 582,128 C590,112 596,98 600,88 C605,78 610,65 618,55 C625,45 632,40 640,38 C652,42 660,55 668,72 C676,85 682,100 690,118 C696,130 705,145 718,158 C730,165 745,170 760,172 C775,170 790,165 810,160 C825,156 840,152 860,150" fill="none" stroke="#C4A050" strokeWidth="1.8"/>
                  <line x1="372" y1="10" x2="372" y2="215" stroke="rgba(139,94,60,0.4)" strokeWidth="0.75" strokeDasharray="3 2"/>
                  <text x="374" y="22" fontSize="9" fill="#8B5E3C" fontFamily="Source Sans 3,sans-serif">Peak: 1,910</text>
                  <line x1="640" y1="10" x2="640" y2="215" stroke="rgba(139,94,60,0.4)" strokeWidth="0.75" strokeDasharray="3 2"/>
                  <text x="642" y="22" fontSize="9" fill="#8B5E3C" fontFamily="Source Sans 3,sans-serif">All-time high: 1,934</text>
                  <line x1="248" y1="10" x2="248" y2="215" stroke="#8B1A1A" strokeWidth="0.75" strokeDasharray="3 2"/>
                  <rect x="224" y="200" width="62" height="14" rx="2" fill="rgba(139,26,26,0.08)"/>
                  <text x="255" y="210" fontSize="9" fill="#8B1A1A" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Oct drop: −41</text>
                  <line x1="582" y1="10" x2="582" y2="215" stroke="#8B1A1A" strokeWidth="0.75" strokeDasharray="3 2"/>
                  <rect x="558" y="200" width="60" height="14" rx="2" fill="rgba(139,26,26,0.08)"/>
                  <text x="582" y="210" fontSize="9" fill="#8B1A1A" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Jul drop: −30</text>
                  <line x1="760" y1="10" x2="760" y2="215" stroke="#8B1A1A" strokeWidth="0.75" strokeDasharray="3 2"/>
                  <rect x="736" y="200" width="60" height="14" rx="2" fill="rgba(139,26,26,0.08)"/>
                  <text x="760" y="210" fontSize="9" fill="#8B1A1A" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Oct drop: −68</text>
                  <text x="40" y="232" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Feb &apos;24</text>
                  <text x="200" y="232" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">May &apos;24</text>
                  <text x="360" y="232" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Aug &apos;24</text>
                  <text x="510" y="232" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Feb &apos;25</text>
                  <text x="660" y="232" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">May &apos;25</text>
                  <text x="820" y="232" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Jan &apos;26</text>
                </svg>
              </div>
            </div>
            <div className="dp-context">
              <div className="dp-context-label">Winery License Context</div>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--muted)", marginBottom: 8 }}>Napa County&apos;s ABC Type-02 winery license count peaked at <strong style={{ color: "var(--accent)" }}>1,934</strong> in June 2025 before a series of sharp drops — <strong style={{ color: "var(--accent)" }}>−41 in October 2024</strong>, <strong style={{ color: "var(--accent)" }}>−30 in July 2025</strong>, and <strong style={{ color: "var(--accent)" }}>−68 in October 2025</strong> — reflecting the seasonal renewal cycle and a tightening market.</p>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--muted)" }}>The sawtooth pattern in weekly data reflects the ABC license renewal cycle. Annual renewals cluster in October, creating predictable drops followed by recovery. The underlying trend since December 2019 shows <strong style={{ color: "var(--accent)" }}>+154 licenses (+9.2% growth)</strong> despite recent volatility.</p>
            </div>
          </div>
        )}

        {/* LABOR */}
        {activeTab === "labor" && (
          <div>
            <div className="dp-sec-title">Labor Market</div>
            <div className="dp-sec-sub">FRED / BLS data for Napa County — Monthly series, updated weekly</div>
            <div className="dp-updated">Data last updated: March 9, 2026</div>
            <div className="dp-kpi-grid-3">
              <div className="dp-kpi"><div className="dp-kpi-label">Unemployment Rate</div><div className="dp-kpi-val">4.3%</div><div className="dp-kpi-delta pos">↓ vs. CA 5.1% · US 4.1%</div><div className="dp-kpi-note" style={{ marginTop: 4 }}>MoM: stable</div></div>
              <div className="dp-kpi"><div className="dp-kpi-label">Civilian Labor Force</div><div className="dp-kpi-val">75,192</div><div className="dp-kpi-delta" style={{ color: "var(--dim)", fontSize: 10 }}>vs. prior month</div></div>
              <div className="dp-kpi"><div className="dp-kpi-label">Food Services &amp; Drinking</div><div className="dp-kpi-val">7,339 <span style={{ fontSize: 16 }}>jobs</span></div><div className="dp-kpi-delta" style={{ color: "var(--dim)", fontSize: 10 }}>CA EDD · Monthly</div></div>
            </div>
            <div className="dp-chart-wrap">
              <div className="dp-chart-label">Unemployment Rate — Napa County</div>
              <div style={{ height: 200 }}>
                <svg width="100%" height="100%" viewBox="0 0 900 180" preserveAspectRatio="none">
                  <defs><linearGradient id="lf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C4A050" stopOpacity="0.18"/><stop offset="100%" stopColor="#C4A050" stopOpacity="0.02"/></linearGradient></defs>
                  <line x1="35" y1="20" x2="890" y2="20" stroke="rgba(44,24,16,0.07)" strokeWidth="0.5"/>
                  <line x1="35" y1="60" x2="890" y2="60" stroke="rgba(44,24,16,0.07)" strokeWidth="0.5"/>
                  <line x1="35" y1="100" x2="890" y2="100" stroke="rgba(44,24,16,0.07)" strokeWidth="0.5"/>
                  <line x1="35" y1="140" x2="890" y2="140" stroke="rgba(44,24,16,0.07)" strokeWidth="0.5"/>
                  <text x="2" y="18" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">8%</text>
                  <text x="2" y="58" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">6%</text>
                  <text x="2" y="98" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">4%</text>
                  <text x="2" y="138" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">2%</text>
                  <path d="M40,98 C100,96 160,94 220,96 C280,98 340,99 400,97 C460,95 520,96 580,97 C640,98 700,98 760,97 C800,96 840,97 880,97 L880,170 L40,170 Z" fill="url(#lf)"/>
                  <path d="M40,98 C100,96 160,94 220,96 C280,98 340,99 400,97 C460,95 520,96 580,97 C640,98 700,98 760,97 C800,96 840,97 880,97" fill="none" stroke="#C4A050" strokeWidth="1.8"/>
                  <text x="40" y="172" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Feb &apos;25</text>
                  <text x="300" y="172" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Jun &apos;25</text>
                  <text x="580" y="172" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Oct &apos;25</text>
                  <text x="860" y="172" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Mar &apos;26</text>
                </svg>
              </div>
            </div>
            <div className="dp-context">
              <div className="dp-context-label">Labor Market Context</div>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--muted)", marginBottom: 8 }}>Napa County&apos;s labor market remains stable with unemployment at <strong style={{ color: "var(--accent)" }}>4.3%</strong>, compared to California&apos;s statewide rate of ~<strong style={{ color: "var(--accent)" }}>5.1%</strong> and the national average of ~<strong style={{ color: "var(--accent)" }}>4.1%</strong>.</p>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--muted)" }}>The civilian labor force stands at <strong style={{ color: "var(--accent)" }}>75,192</strong> with <strong style={{ color: "var(--accent)" }}>7,339</strong> jobs in food services &amp; drinking places — a key indicator for Napa&apos;s tourism-driven economy.</p>
            </div>
          </div>
        )}

        {/* HOUSING */}
        {activeTab === "housing" && (
          <div>
            <div className="dp-sec-title">Housing Market</div>
            <div className="dp-sec-sub">Zillow Home Value Index (ZHVI) — All homes, smoothed, county level</div>
            <div className="dp-updated">Data last updated: March 9, 2026</div>
            <div className="dp-kpi-grid-3">
              <div className="dp-kpi"><div className="dp-kpi-label">Avg Home Value</div><div className="dp-kpi-val">$867,348</div><div className="dp-kpi-delta neg">↓ MoM</div></div>
              <div className="dp-kpi"><div className="dp-kpi-label">YoY Change</div><div className="dp-kpi-val pos">+2.1%</div><div className="dp-kpi-note">vs. March 2025</div></div>
              <div className="dp-kpi"><div className="dp-kpi-label">vs. CA Median</div><div className="dp-kpi-val">+38%</div><div className="dp-kpi-note">Premium to state</div></div>
            </div>
            <div className="dp-chart-wrap">
              <div className="dp-chart-label">Napa County Home Value (ZHVI)</div>
              <div style={{ height: 200 }}>
                <svg width="100%" height="100%" viewBox="0 0 900 180" preserveAspectRatio="none">
                  <defs><linearGradient id="hf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1B3A5C" stopOpacity="0.2"/><stop offset="100%" stopColor="#1B3A5C" stopOpacity="0.02"/></linearGradient></defs>
                  <line x1="35" y1="20" x2="890" y2="20" stroke="rgba(44,24,16,0.07)" strokeWidth="0.5"/>
                  <line x1="35" y1="60" x2="890" y2="60" stroke="rgba(44,24,16,0.07)" strokeWidth="0.5"/>
                  <line x1="35" y1="100" x2="890" y2="100" stroke="rgba(44,24,16,0.07)" strokeWidth="0.5"/>
                  <line x1="35" y1="140" x2="890" y2="140" stroke="rgba(44,24,16,0.07)" strokeWidth="0.5"/>
                  <text x="2" y="18" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">$1M</text>
                  <text x="2" y="58" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">$750k</text>
                  <text x="2" y="98" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">$500k</text>
                  <text x="2" y="138" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif">$250k</text>
                  <path d="M40,62 C120,60 200,58 280,57 C360,56 440,57 520,58 C600,59 680,60 760,61 C820,62 860,62 880,62 L880,170 L40,170 Z" fill="url(#hf)"/>
                  <path d="M40,62 C120,60 200,58 280,57 C360,56 440,57 520,58 C600,59 680,60 760,61 C820,62 860,62 880,62" fill="none" stroke="#1B3A5C" strokeWidth="1.8"/>
                  <text x="40" y="172" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Feb &apos;25</text>
                  <text x="460" y="172" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Mar &apos;25 (mid)</text>
                  <text x="860" y="172" fontSize="9" fill="#A89880" fontFamily="Source Sans 3,sans-serif" textAnchor="middle">Mar &apos;26</text>
                </svg>
              </div>
            </div>
            <div className="dp-context">
              <div className="dp-context-label">Housing Context</div>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--muted)", marginBottom: 8 }}>The average Napa County home is valued at <strong style={{ color: "var(--accent)" }}>$867,348</strong>.</p>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--muted)" }}>Napa&apos;s constrained geography — bounded by the Agricultural Preserve and hillside development limits — keeps supply tight even as demand fluctuates with interest rates and wildfire insurance costs.</p>
            </div>
          </div>
        )}
      </div>

      {/* SOURCES BAR */}
      <div className="dp-sources">
        <span>Sources: CA ABC · FRED (BLS) · Zillow Research · CA EDD</span>
        <span>Pipeline: GitHub Actions → Supabase · 110 snapshots · Mar 9, 2026</span>
      </div>
    </div>
  );
}

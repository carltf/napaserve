import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NapaServeHub() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [subName, setSubName] = useState("");
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState("idle");
  const navigate = useNavigate();

  const toggleDrawer = () => setDrawerOpen(o => !o);

  return (
    <div style={{ background: "#F5F0E8", minHeight: "100vh", fontFamily: "'Source Sans 3', sans-serif", color: "#2C1810" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        :root {
          --bg:#F5F0E8; --bg2:#EDE8DE; --ink:#1A0E08; --ink2:#2C1810;
          --accent:#8B5E3C; --muted:#7A6A50; --dim:#A89880;
          --rule:rgba(44,24,16,0.12); --live:#4A7A5A;
        }
        .hub-nav{background:var(--bg);border-bottom:1px solid var(--rule);padding:0 28px;height:52px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:20;}
        .hub-wordmark{font-family:'Libre Baskerville',Georgia,serif;font-size:19px;font-weight:700;color:var(--ink2);}
        .hub-nav-tag{font-size:10px;color:var(--dim);letter-spacing:.05em;margin-left:14px;}
        .hub-hbtn{background:none;border:1px solid var(--rule);cursor:pointer;padding:7px 10px;display:flex;flex-direction:column;gap:4px;}
        .hub-hb{display:block;width:18px;height:1.5px;background:var(--muted);transition:transform .2s,opacity .2s;}
        .hub-drawer{display:none;position:absolute;top:52px;right:0;width:230px;background:var(--bg);border:1px solid var(--rule);border-top:none;box-shadow:0 8px 24px rgba(44,24,16,0.08);z-index:30;}
        .hub-drawer.open{display:block;}
        .hub-dg{padding:10px 0;border-bottom:1px solid var(--rule);}
        .hub-dg:last-child{border-bottom:none;}
        .hub-dlabel{font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--dim);padding:4px 20px 6px;font-family:'Source Sans 3',sans-serif;}
        .hub-dlink{display:block;font-size:13px;font-weight:600;color:var(--muted);padding:7px 20px;cursor:pointer;transition:color .15s,background .15s;text-decoration:none;}
        .hub-dlink:hover{color:var(--accent);background:var(--bg2);}
        .hub-lead{max-width:1160px;margin:0 auto;padding:56px 28px 0;}
        .hub-kicker{font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--accent);margin-bottom:18px;}
        .hub-pillars{display:flex;align-items:center;flex-wrap:wrap;margin-bottom:22px;}
        .hub-pillar{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);}
        .hub-pdot{margin:0 12px;color:#C4B09A;}
        .hub-hed{font-family:'Libre Baskerville',Georgia,serif;font-size:clamp(30px,4.5vw,50px);font-weight:700;line-height:1.08;color:var(--ink2);letter-spacing:-.015em;margin-bottom:18px;}
        .hub-hed em{font-style:italic;color:var(--accent);}
        .hub-dek{font-size:14px;line-height:1.8;color:var(--muted);}
        .hub-section-rule{border-top:1px solid var(--rule);margin:52px 0 0;}
        .hub-tools-wrap{max-width:1160px;margin:0 auto;padding:32px 28px 0;}
        .hub-tools-hdr{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid var(--rule);}
        .hub-tools-lbl{font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--dim);}
        .hub-grid{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--rule);border-left:1px solid var(--rule);}
        .hub-card{padding:22px 22px 16px;background:var(--bg);border-right:1px solid var(--rule);border-bottom:1px solid var(--rule);cursor:pointer;transition:background .15s;position:relative;text-decoration:none;display:block;color:inherit;}
        .hub-card:hover{background:var(--bg2);}
        .hub-card:hover .hub-arrow{color:var(--accent);}
        .hub-live{position:absolute;top:16px;right:16px;display:flex;align-items:center;gap:5px;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--live);}
        .hub-ldot{width:5px;height:5px;border-radius:50%;background:var(--live);}
        .hub-c-cat{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);margin-bottom:7px;}
        .hub-c-name{font-family:'Libre Baskerville',Georgia,serif;font-size:16px;font-weight:700;color:var(--ink2);margin-bottom:6px;line-height:1.2;}
        .hub-c-desc{font-size:12px;line-height:1.7;color:var(--muted);margin-bottom:14px;}
        .hub-arrow{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);transition:color .15s;}
        .hub-vw{border-left:1px solid var(--rule);border-right:1px solid var(--rule);border-bottom:1px solid var(--rule);padding:18px 22px;display:flex;justify-content:space-between;align-items:center;gap:24px;cursor:pointer;transition:background .15s;text-decoration:none;color:inherit;}
        .hub-vw:hover{background:var(--bg2);}
        .hub-vw:hover .hub-arrow{color:var(--accent);}
        .hub-archive{border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);background:var(--bg2);margin:48px 0 0;}
        .hub-arch-inner{max-width:1160px;margin:0 auto;padding:32px 28px;display:grid;grid-template-columns:180px 1fr;gap:48px;align-items:start;}
        .hub-arch-big{font-family:'Libre Baskerville',Georgia,serif;font-size:48px;font-weight:700;color:var(--accent);line-height:1;}
        .hub-arch-sub{font-size:11px;color:var(--muted);margin-top:6px;line-height:1.6;}
        .hub-arch-btn{display:inline-block;margin-top:16px;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;background:var(--ink2);color:var(--bg);padding:9px 18px;border:none;cursor:pointer;text-decoration:none;}
        .hub-chips-label{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);margin-bottom:8px;}
        .hub-chips{display:flex;flex-wrap:wrap;gap:5px;}
        .hub-chip{font-size:9px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);border:1px solid var(--rule);padding:4px 9px;cursor:pointer;text-decoration:none;}
        .hub-chip.s{color:var(--accent);border-color:rgba(139,94,60,0.25);background:rgba(139,94,60,0.05);}
        .hub-footer{padding:48px 28px 28px;background:var(--bg);}
        .hub-f-inner{max-width:1160px;margin:0 auto;}
        .hub-f-wm{font-family:'Libre Baskerville',Georgia,serif;font-size:20px;font-weight:700;color:var(--ink2);margin-bottom:4px;}
        .hub-f-tag{font-size:11px;color:var(--dim);}
        .hub-four{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
        .hub-sm-head{font-size:13px;font-weight:700;color:var(--ink2);margin-bottom:12px;}
        .hub-sm-link{display:block;font-size:12px;color:var(--muted);padding:3px 0;cursor:pointer;text-decoration:none;transition:color .15s;}
        .hub-sm-link:hover{color:var(--accent);}
        .hub-col-lbl{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);margin-bottom:12px;}
        .hub-sbtn{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:var(--muted);border:1px solid var(--rule);padding:7px 12px;cursor:pointer;background:none;width:100%;margin-bottom:7px;transition:color .15s,border-color .15s;}
        .hub-sbtn:hover{color:var(--accent);border-color:var(--accent);}
        .hub-sub-hed{font-family:'Libre Baskerville',Georgia,serif;font-size:15px;font-weight:700;color:var(--ink2);margin-bottom:4px;}
        .hub-sub-dek{font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:14px;}
        .hub-sub-fields{display:flex;gap:8px;max-width:440px;}
        .hub-sub-in{flex:1;background:transparent;border:none;border-bottom:1px solid var(--rule);padding:8px 0;font-family:'Source Sans 3',sans-serif;font-size:13px;color:var(--ink);outline:none;min-width:0;}
        .hub-sub-in:focus{border-color:var(--accent);}
        .hub-sub-in::placeholder{color:var(--dim);}
        .hub-sub-btn{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;background:var(--ink2);color:var(--bg);border:none;padding:10px 18px;cursor:pointer;white-space:nowrap;}
        .hub-sub-note{font-size:10px;color:var(--dim);margin-top:7px;}
        @media(max-width:700px){
          .hub-grid{grid-template-columns:1fr 1fr;}
          .hub-arch-inner{grid-template-columns:1fr;gap:20px;}
          .hub-four{grid-template-columns:1fr 1fr;}
          .hub-nav-tag{display:none;}
        }
        @media(max-width:450px){
          .hub-grid{grid-template-columns:1fr!important;}
          .hub-four{grid-template-columns:1fr;}
        }
      `}</style>

      {/* NAV */}
      <div style={{ position: "relative" }}>
        <nav className="hub-nav">
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <div className="hub-wordmark">NapaServe</div>
            <span className="hub-nav-tag">Civic intelligence · Napa County</span>
          </div>
          <button className="hub-hbtn" onClick={toggleDrawer} aria-label="Menu">
            <span className="hub-hb" style={{ transform: drawerOpen ? "translateY(5.5px) rotate(45deg)" : "" }} />
            <span className="hub-hb" style={{ opacity: drawerOpen ? 0 : 1 }} />
            <span className="hub-hb" style={{ transform: drawerOpen ? "translateY(-5.5px) rotate(-45deg)" : "" }} />
          </button>
        </nav>
        <div className={`hub-drawer${drawerOpen ? " open" : ""}`}>
          <Link to="/" onClick={() => setDrawerOpen(false)} style={{ display: "block", padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "var(--accent)", borderBottom: "1px solid var(--rule)", textDecoration: "none" }}>← NapaServe Home</Link>
          <div className="hub-dg">
            <div className="hub-dlabel">Journalism</div>
            <Link to="/news" className="hub-dlink" onClick={() => setDrawerOpen(false)}>Napa Valley Features</Link>
            <Link to="/archive" className="hub-dlink" onClick={() => setDrawerOpen(false)}>NVF Archive Search</Link>
          </div>
          <div className="hub-dg">
            <div className="hub-dlabel">Community</div>
            <Link to="/events" className="hub-dlink" onClick={() => setDrawerOpen(false)}>Event Finder</Link>
            <Link to="/valley-works" className="hub-dlink" onClick={() => setDrawerOpen(false)}>Valley Works</Link>
            <Link to="/vw-labs" className="hub-dlink" onClick={() => setDrawerOpen(false)}>VW Labs</Link>
          </div>
          <div className="hub-dg">
            <div className="hub-dlabel">Intelligence</div>
            <Link to="/dashboard" className="hub-dlink" onClick={() => setDrawerOpen(false)}>Economic Dashboard</Link>
            <Link to="/evaluator" className="hub-dlink" onClick={() => setDrawerOpen(false)}>Project Evaluator</Link>
            <a href="/agent.html" className="hub-dlink" onClick={() => setDrawerOpen(false)}>Research Agent</a>
          </div>
          <div className="hub-dg">
            <div className="hub-dlabel">Platform</div>
            <Link to="/about" className="hub-dlink" onClick={() => setDrawerOpen(false)}>About NapaServe</Link>
            <a href="mailto:napaserve@gmail.com" className="hub-dlink" onClick={() => setDrawerOpen(false)}>Contact</a>
          </div>
        </div>
      </div>

      {/* LEAD */}
      <div className="hub-lead">
        <p className="hub-kicker">Community Intelligence for Napa Valley</p>
        <div className="hub-pillars">
          <span className="hub-pillar">People &amp; Well-Being</span><span className="hub-pdot">·</span>
          <span className="hub-pillar">Place &amp; Environment</span><span className="hub-pdot">·</span>
          <span className="hub-pillar">Prosperity &amp; Jobs</span><span className="hub-pdot">·</span>
          <span className="hub-pillar">Innovation</span>
        </div>
        <h1 className="hub-hed">The source for <em>what&apos;s happening</em><br />in Napa County.</h1>
        <p className="hub-dek">Reporting, archives, data and tools to understand the valley, explore ideas, model what comes next and help shape the future.</p>
        <p className="hub-dek" style={{ marginTop: 14 }}>Community intelligence brings together local reporting, data, archives and public input to build a shared understanding of how Napa Valley works and where it is headed. Artificial intelligence is one tool within that system — helping people search, analyze, model scenarios and explore the knowledge this community has created.</p>
      </div>

      {/* TOOLS */}
      <div className="hub-section-rule" />
      <div className="hub-tools-wrap">
        <div className="hub-tools-hdr">
          <span className="hub-tools-lbl">Tools &amp; Intelligence</span>
          <span className="hub-tools-lbl">7 live tools</span>
        </div>
        <div className="hub-grid">
<Link to="/news" className="hub-card">
            <div className="hub-live"><span className="hub-ldot" />LIVE</div>
            <div style={{ width: 40, height: 40, marginBottom: 14 }}>
              <svg viewBox="0 0 40 40" fill="none"><rect x="4" y="5" width="32" height="30" rx="2" stroke="#8B5E3C" strokeWidth="1.2"/><line x1="10" y1="13" x2="30" y2="13" stroke="#8B5E3C" strokeWidth="1.5" strokeLinecap="round"/><line x1="10" y1="19" x2="30" y2="19" stroke="#8B5E3C" strokeWidth="1" strokeLinecap="round" opacity=".6"/><line x1="10" y1="24" x2="24" y2="24" stroke="#8B5E3C" strokeWidth="1" strokeLinecap="round" opacity=".4"/><line x1="10" y1="29" x2="20" y2="29" stroke="#8B5E3C" strokeWidth="1" strokeLinecap="round" opacity=".3"/></svg>
            </div>
            <div className="hub-c-cat">News</div>
            <div className="hub-c-name">Napa Valley Features</div>
            <div className="hub-c-desc">The flagship publication. Original reporting on Napa County economy, agriculture, civic affairs, and community life.</div>
            <div className="hub-arrow">Open →</div>
          </Link>
          <Link to="/events" className="hub-card">
            <div className="hub-live"><span className="hub-ldot" />LIVE</div>
            <div style={{ width: 40, height: 40, marginBottom: 14 }}>
              <svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="18" r="10" stroke="#8B5E3C" strokeWidth="1.2"/><path d="M20 28 L20 38" stroke="#8B5E3C" strokeWidth="1.2" strokeLinecap="round"/><circle cx="20" cy="18" r="3.5" fill="#8B5E3C"/><line x1="14" y1="38" x2="26" y2="38" stroke="#8B5E3C" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </div>
            <div className="hub-c-cat">Community</div>
            <div className="hub-c-name">Event Finder</div>
            <div className="hub-c-desc">Community events across Napa County. Discover, filter by category, and submit your own event.</div>
            <div className="hub-arrow">Open →</div>
          </Link>
<Link to="/dashboard" className="hub-card">
            <div className="hub-live"><span className="hub-ldot" />LIVE</div>
            <div style={{ width: 40, height: 40, marginBottom: 14 }}>
              <svg viewBox="0 0 40 40" fill="none"><rect x="2" y="22" width="7" height="16" rx="1.5" fill="#8B5E3C" opacity=".35"/><rect x="12" y="15" width="7" height="23" rx="1.5" fill="#8B5E3C" opacity=".6"/><rect x="22" y="8" width="7" height="30" rx="1.5" fill="#8B5E3C" opacity=".85"/><rect x="32" y="12" width="7" height="26" rx="1.5" fill="#8B5E3C"/><line x1="1" y1="38.5" x2="39" y2="38.5" stroke="#8B5E3C" strokeWidth="1"/></svg>
            </div>
            <div className="hub-c-cat">Economy</div>
            <div className="hub-c-name">Economic Dashboard</div>
            <div className="hub-c-desc">Winery licenses, unemployment, home values, food services jobs. Interactive charts with full weekly history. Updated every Monday via GitHub Actions.</div>
            <div className="hub-arrow">Open →</div>
          </Link>
          <Link to="/archive" className="hub-card">
            <div className="hub-live"><span className="hub-ldot" />LIVE</div>
            <div style={{ width: 40, height: 40, marginBottom: 14 }}>
              <svg viewBox="0 0 40 40" fill="none"><circle cx="17" cy="17" r="11" stroke="#8B5E3C" strokeWidth="1.2"/><line x1="25" y1="25" x2="37" y2="37" stroke="#8B5E3C" strokeWidth="2" strokeLinecap="round"/><line x1="11" y1="17" x2="23" y2="17" stroke="#8B5E3C" strokeWidth="1" strokeLinecap="round"/><line x1="17" y1="11" x2="17" y2="23" stroke="#8B5E3C" strokeWidth="1" strokeLinecap="round"/></svg>
            </div>
            <div className="hub-c-cat">Archive · Journalism</div>
            <div className="hub-c-name">NVF Archive Search</div>
            <div className="hub-c-desc">1,000+ original articles from Napa Valley Features, AI-searchable with semantic similarity. A decade of local reporting on economics, land use, policy, and community.</div>
            <div className="hub-arrow">Open →</div>
          </Link>
          <a href="/agent.html" className="hub-card">
            <div className="hub-live"><span className="hub-ldot" />LIVE</div>
            <div style={{ width: 40, height: 40, marginBottom: 14 }}>
              <svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="#8B5E3C" strokeWidth="1" strokeDasharray="3 2.2"/><circle cx="20" cy="20" r="10" stroke="#8B5E3C" strokeWidth="1"/><circle cx="20" cy="20" r="3" fill="#8B5E3C"/><line x1="20" y1="2" x2="20" y2="8" stroke="#8B5E3C" strokeWidth="1.2" strokeLinecap="round"/><line x1="20" y1="32" x2="20" y2="38" stroke="#8B5E3C" strokeWidth="1.2" strokeLinecap="round"/><line x1="2" y1="20" x2="8" y2="20" stroke="#8B5E3C" strokeWidth="1.2" strokeLinecap="round"/><line x1="32" y1="20" x2="38" y2="20" stroke="#8B5E3C" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </div>
            <div className="hub-c-cat">AI · Civic</div>
            <div className="hub-c-name">Research Agent</div>
            <div className="hub-c-desc">Ask hard questions. Grounded in the NVF archive, live web search, and local economic data. For policy, projects, and anything you&apos;d otherwise spend hours researching.</div>
            <div className="hub-arrow">Open →</div>
          </a>
          <Link to="/evaluator" className="hub-card">
            <div className="hub-live"><span className="hub-ldot" />LIVE</div>
            <div style={{ width: 40, height: 40, marginBottom: 14 }}>
              <svg viewBox="0 0 40 40" fill="none"><polygon points="20,3 37,12 37,28 20,37 3,28 3,12" stroke="#8B5E3C" strokeWidth="1.2" fill="none"/><polygon points="20,10 30,15.5 30,24.5 20,30 10,24.5 10,15.5" stroke="#8B5E3C" strokeWidth="1" fill="none" opacity=".5"/><circle cx="20" cy="20" r="3" fill="#8B5E3C"/><line x1="20" y1="3" x2="20" y2="10" stroke="#8B5E3C" strokeWidth="1" strokeDasharray="1.5 1.5"/><line x1="30" y1="15.5" x2="37" y2="12" stroke="#8B5E3C" strokeWidth="1" strokeDasharray="1.5 1.5"/><line x1="10" y1="15.5" x2="3" y2="12" stroke="#8B5E3C" strokeWidth="1" strokeDasharray="1.5 1.5"/></svg>
            </div>
            <div className="hub-c-cat">Civic · Analysis</div>
            <div className="hub-c-name">Project Evaluator</div>
            <div className="hub-c-desc">Structural Compass — 11-axis scoring of any proposed project against the Jobs / People / Place framework. For civic leaders and stakeholders.</div>
            <div className="hub-arrow">Open →</div>
          </Link>
          
        </div>
        {/* Valley Works */}
        <Link to="/valley-works" className="hub-vw">
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ flexShrink: 0, width: 40, height: 40 }}>
              <svg viewBox="0 0 40 40" fill="none"><rect x="3" y="14" width="34" height="20" rx="2" stroke="#8B5E3C" strokeWidth="1.2"/><path d="M10 14V10a10 10 0 0 1 20 0v4" stroke="#8B5E3C" strokeWidth="1.2" strokeLinecap="round"/><circle cx="20" cy="24" r="3.5" fill="#8B5E3C" opacity=".6"/><line x1="20" y1="27.5" x2="20" y2="31" stroke="#8B5E3C" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </div>
            <div>
              <div className="hub-c-cat">Innovation · Workforce</div>
              <div className="hub-c-name">Valley Works Collaborative</div>
              <div className="hub-c-desc" style={{ marginBottom: 0, maxWidth: 600 }}>The regional innovation hub diversifying Napa County&apos;s economy beyond wine and hospitality. Training pipelines, emerging industries, and the VWC mission.</div>
            </div>
          </div>
          <div className="hub-arrow" style={{ flexShrink: 0 }}>Open →</div>
        </Link>
      </div>

      {/* ARCHIVE */}
      <div className="hub-archive">
        <div className="hub-arch-inner">
          <div>
            <div className="hub-arch-big">1,000+</div>
            <div className="hub-arch-sub">Original articles.<br />10,033 searchable chunks.<br />May 2023 – March 2026.</div>
            <Link to="/archive" className="hub-arch-btn">Search Archive</Link>
          </div>
          <div>
            <div className="hub-chips-label">Series</div>
            <div className="hub-chips" style={{ marginBottom: 16 }}>
              {["Wine Chronicles","The Makers Series","Field Notes","Profiles","Travel","Food & Wine","The Storyteller","Under the Hood","Friday E-dition","Green Wednesday","Gardening","Climate & Environment"].map(s => (
                <Link key={s} to={`/archive?q=${encodeURIComponent(s)}`} className="hub-chip s">{s}</Link>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--rule)", marginBottom: 16 }} />
            <div className="hub-chips-label">Beats</div>
            <div className="hub-chips">
              {["Lodging & Tourism","Land Use","Agriculture","Housing","Workforce","Water","County Budget","Planning Commission","Board of Supervisors","Economic Development","Infrastructure","Wildfire","Homelessness","Business Profiles","Lodging Data","Winery Permits","Labor Market","Ag Preserve"].map(s => (
                <Link key={s} to={`/archive?q=${encodeURIComponent(s)}`} className="hub-chip">{s}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="hub-footer">
        <div className="hub-f-inner">
          <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid var(--rule)" }}>
            <div className="hub-f-wm">NapaServe</div>
            <div className="hub-f-tag">Civic intelligence for Napa County · A Valley Works Collaborative · VW Labs project</div>
          </div>
          <div className="hub-four" style={{ marginBottom: 28, paddingBottom: 28, borderBottom: "1px solid var(--rule)" }}>
            <div>
              <div className="hub-sm-head">Intelligence</div>
              <Link to="/dashboard" className="hub-sm-link">Economic Dashboard</Link>
              <Link to="/evaluator" className="hub-sm-link">Project Evaluator</Link>
              <a href="/agent.html" className="hub-sm-link">Research Agent</a>
              <Link to="/evaluator" className="hub-sm-link">Structural Compass</Link>
            </div>
            <div>
              <div className="hub-sm-head">Journalism</div>
              <Link to="/news" className="hub-sm-link">Napa Valley Features</Link>
              <Link to="/archive" className="hub-sm-link">NVF Archive Search</Link>
              <Link to="/archive" className="hub-sm-link">Series index</Link>
              <a href="https://sonomacountyfeatures.substack.com" target="_blank" rel="noopener noreferrer" className="hub-sm-link">Sonoma Co. Features ↗</a>
              <a href="https://lakecountyfeatures.substack.com" target="_blank" rel="noopener noreferrer" className="hub-sm-link">Lake Co. Features ↗</a>
            </div>
            <div>
              <div className="hub-sm-head">Community</div>
              <Link to="/events" className="hub-sm-link">Event Finder</Link>
              <Link to="/events" className="hub-sm-link">Submit an event</Link>
              <Link to="/valley-works" className="hub-sm-link">Valley Works</Link>
              <Link to="/vw-labs" className="hub-sm-link">VW Labs</Link>
            </div>
            <div>
              <div className="hub-sm-head">Platform</div>
              <Link to="/about" className="hub-sm-link">About NapaServe</Link>
              <Link to="/about#how-to-use" className="hub-sm-link">How to use this site</Link>
              <Link to="/about#disclaimer" className="hub-sm-link">Disclaimer</Link>
              <a href="mailto:napaserve@gmail.com" className="hub-sm-link">Contact us</a>
            </div>
          </div>
          <div className="hub-four" style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--rule)", alignItems: "start" }}>
            <div>
              <div className="hub-col-lbl">Follow</div>
              <a href="https://bsky.app/profile/valleyworkscollab.bsky.social" target="_blank" rel="noopener noreferrer" className="hub-sbtn" style={{ textDecoration: "none" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.8C10.8 8.4 7.8 4.2 5.4 2.4 3.6 1.2 2.4 2.4 2.4 4.2c0 1.2.6 5.4.9 6.6.9 3.3 4.2 4.2 7.2 3.6-3 .6-6 1.8-6.6 5.4-.3 1.8.6 3.6 2.4 3.6 3 0 5.7-3.6 5.7-3.6s2.7 3.6 5.7 3.6c1.8 0 2.7-1.8 2.4-3.6-.6-3.6-3.6-4.8-6.6-5.4 3 .6 6.3-.3 7.2-3.6.3-1.2.9-5.4.9-6.6 0-1.8-1.2-3-3-1.8C16.2 4.2 13.2 8.4 12 10.8z"/></svg>
                Bluesky ↗
              </a>
              <a href="https://valleyworkscollaborative.substack.com/" target="_blank" rel="noopener noreferrer" className="hub-sbtn" style={{ textDecoration: "none" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M22 5.5H2V8h20V5.5zM2 10.5V21l10-5.5 10 5.5V10.5H2zM22 2H2v2h20V2z"/></svg>
                Substack ↗
              </a>
            </div>
            <div style={{ gridColumn: "span 3" }}>
              <div className="hub-col-lbl">Newsletter</div>
              <div className="hub-sub-hed">Stay informed on Napa County.</div>
              <div className="hub-sub-dek">Original reporting, economic updates, and civic intelligence from Napa Valley Features — delivered when it matters.</div>
              <div className="hub-sub-fields">
                <input className="hub-sub-in" type="text" placeholder="Your name" value={subName} onChange={e => setSubName(e.target.value)} style={{ marginBottom: 6 }} />
                <input className="hub-sub-in" type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} />
                <button className="hub-sub-btn" disabled={subStatus === "loading"} onClick={async () => {
                  setSubStatus("loading");
                  try {
                    const res = await fetch("https://misty-bush-fc93.tfcarl.workers.dev/api/subscribe", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: subName, email }),
                    });
                    if (!res.ok) throw new Error("insert failed");
                    setSubStatus("success");
                    setSubName("");
                    setEmail("");
                  } catch { setSubStatus("error"); }
                }}>{subStatus === "loading" ? "Subscribing…" : "Subscribe"}</button>
              </div>
              {subStatus === "success" && <div style={{ fontSize: 12, color: "#2E7D32", marginTop: 6 }}>Welcome to NapaServe. We'll be in touch.</div>}
              {subStatus === "error" && <div style={{ fontSize: 12, color: "#C62828", marginTop: 6 }}>Something went wrong. Email us at napaserve@gmail.com</div>}
              <div className="hub-sub-note">Join the NapaServe community. No spam, unsubscribe anytime.</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 10, color: "var(--dim)" }}>© 2026 Valley Works Collaborative · Not affiliated with Napa County government.</div>
            <div style={{ fontSize: 10, color: "var(--muted)" }}>napaserve@gmail.com</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

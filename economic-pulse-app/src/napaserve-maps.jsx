import NavBar from "./NavBar";
import Footer from "./Footer";

// Maps & Atlases landing page (/maps). Card grid linking out to the standalone
// map explorers, which live as static pages under public/ (served outside the
// React router — hence plain <a href>, not <Link>). Both explorers self-host a
// Protomaps vector basemap (/data/napa-basemap.pmtiles); no OSM tile server.
//
// Both explorers are live and self-host a Protomaps vector basemap
// (/data/napa-basemap.pmtiles); no OSM tile server. The Elected Seats / Precinct
// Atlas went public 2026-07-13 after Tuteur confirmed precinct→district currency
// (clears ledger PD-2026-07-07-02). The map reads live county GIS geography only —
// it does NOT read the RLS-locked napa_elected_seats roster, so ADR-010 / the seat
// verification pass (PD-2026-07-08-01) don't gate it.

const MAPS = [
  {
    live: true,
    cat: "Land & Agriculture",
    name: "Vineyard Explorer",
    desc: "Every mapped vineyard field in Napa County, 2020–2024, from the state’s satellite crop survey. Switch vintages or turn on Compare mode to see where fields were added or dropped between years. Official county acreage from NASS/CDFA. We’re working to extend the data through 2025 and 2026.",
    link: "/vineyard-explorer.html",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 40 40" fill="none"><path d="M6 30c4-2 6-6 6-11M14 32c3-2 4-6 4-11M22 32c3-2 4-6 4-11M30 30c3-2 5-6 5-11" stroke="#8B5E3C" strokeWidth="1.2" strokeLinecap="round"/><circle cx="8" cy="15" r="2.4" fill="#8B5E3C" opacity=".55"/><circle cx="16" cy="16" r="2.4" fill="#8B5E3C" opacity=".55"/><circle cx="24" cy="16" r="2.4" fill="#8B5E3C" opacity=".55"/><circle cx="32" cy="15" r="2.4" fill="#8B5E3C" opacity=".55"/><line x1="4" y1="35" x2="36" y2="35" stroke="#8B5E3C" strokeWidth="1" opacity=".4"/></svg>
    ),
  },
  {
    live: true,
    cat: "Civic & Elections",
    name: "Elected Seats Atlas",
    desc: "Every Napa County precinct mapped to its supervisorial, school, city-council and trustee districts — the geography behind who represents you and when each seat comes up. Search any address to find its precinct and full district stack.",
    link: "/precinct-explorer.html",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 40 40" fill="none"><path d="M20 4L4 12v16l16 8 16-8V12L20 4z" stroke="#8B5E3C" strokeWidth="1.2" fill="none"/><path d="M20 4v32M4 12l16 8 16-8" stroke="#8B5E3C" strokeWidth="1" opacity=".4"/><circle cx="20" cy="19" r="2.6" fill="#8B5E3C"/></svg>
    ),
  },
];

export default function NapaServeMaps() {
  return (
    <div style={{ background: "#F5F0E8", minHeight: "100vh", fontFamily: "'Source Sans 3', sans-serif", color: "#2C1810" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        :root {
          --bg:#F5F0E8; --bg2:#EDE8DE; --ink2:#2C1810;
          --accent:#8B5E3C; --muted:#7A6A50; --dim:#8B7355;
          --rule:rgba(44,24,16,0.12); --live:#4A7A5A;
        }
        .maps-lead{max-width:1160px;margin:0 auto;padding:56px 28px 0;}
        .maps-kicker{font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--accent);margin-bottom:18px;}
        .maps-hed{font-family:'Libre Baskerville',Georgia,serif;font-size:clamp(28px,4vw,44px);font-weight:700;line-height:1.1;color:var(--ink2);letter-spacing:-.015em;margin-bottom:16px;}
        .maps-dek{font-size:17px;line-height:1.75;color:var(--muted);max-width:720px;}
        .maps-wrap{max-width:1160px;margin:0 auto;padding:34px 28px 8px;}
        .maps-lbl{font-size:14px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--dim);padding-bottom:12px;border-bottom:1px solid var(--rule);margin-bottom:0;}
        .maps-grid{display:grid;grid-template-columns:repeat(2,1fr);border-top:1px solid var(--rule);border-left:1px solid var(--rule);}
        .maps-card{padding:26px 24px 20px;background:var(--bg);border-right:1px solid var(--rule);border-bottom:1px solid var(--rule);text-decoration:none;display:block;color:inherit;position:relative;transition:background .15s;}
        a.maps-card{cursor:pointer;}
        a.maps-card:hover{background:var(--bg2);}
        a.maps-card:hover .maps-arrow{color:var(--accent);}
        .maps-card.soon{cursor:default;}
        .maps-badge{position:absolute;top:18px;right:18px;display:flex;align-items:center;gap:5px;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;}
        .maps-badge.live{color:var(--live);}
        .maps-badge.review{color:var(--dim);}
        .maps-ldot{width:5px;height:5px;border-radius:50%;background:var(--live);}
        .maps-c-cat{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);margin-bottom:7px;}
        .maps-c-name{font-family:'Libre Baskerville',Georgia,serif;font-size:19px;font-weight:700;color:var(--ink2);margin-bottom:8px;line-height:1.2;}
        .maps-c-desc{font-size:14px;line-height:1.7;color:var(--muted);margin-bottom:16px;}
        .maps-arrow{font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);transition:color .15s;}
        .maps-arrow.muted{color:#B0A48F;}
        .maps-note{max-width:1160px;margin:0 auto;padding:20px 28px 0;font-size:13px;line-height:1.7;color:var(--dim);}
        @media(max-width:640px){ .maps-grid{grid-template-columns:1fr;} }
      `}</style>

      <NavBar />

      <div id="main-content" className="maps-lead">
        <p className="maps-kicker">Maps &amp; Atlases · Napa County</p>
        <h1 className="maps-hed">Maps of Napa County</h1>
        <p className="maps-dek">Interactive maps to help residents, planners and decision-makers see Napa County more clearly — where things stand, how they’re changing and what that means for the decisions ahead. Each opens as its own full-screen map.</p>
      </div>

      <div className="maps-wrap">
        <div className="maps-lbl">The Maps</div>
        <div className="maps-grid">
          {MAPS.map((m) => {
            const inner = (
              <>
                {m.live && <div className="maps-badge live"><span className="maps-ldot" />Live</div>}
                {m.review && <div className="maps-badge review">In review</div>}
                <div style={{ width: 40, height: 40, marginBottom: 14 }}>{m.icon}</div>
                <div className="maps-c-cat">{m.cat}</div>
                <div className="maps-c-name">{m.name}</div>
                <div className="maps-c-desc">{m.desc}</div>
                <div className={"maps-arrow" + (m.link ? "" : " muted")}>{m.link ? "Open →" : "Coming soon"}</div>
              </>
            );
            return m.link
              ? <a key={m.name} href={m.link} className="maps-card">{inner}</a>
              : <div key={m.name} className="maps-card soon">{inner}</div>;
          })}
        </div>
      </div>

      <p className="maps-note">
        Boundaries and field data come from Napa County GIS, the California Department of Water Resources / Land IQ statewide crop mapping and NASS/CDFA. Basemap &copy; OpenStreetMap contributors, vector tiles by Protomaps. Not affiliated with Napa County government.
      </p>

      <Footer />
    </div>
  );
}

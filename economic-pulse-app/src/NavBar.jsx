import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NAV_GROUPS = [
  { label: "Journalism", desc: "Original reporting and searchable archives", links: [{ t: "Napa Valley Features", h: "/news" }, { t: "NVF Archive Search", h: "/archive" }, { t: "Under the Hood", h: "/under-the-hood" }] },
  { label: "Community", desc: "Events, workforce and civic innovation", links: [{ t: "Event Finder", h: "/events" }, { t: "Valley Works", h: "/valley-works" }, { t: "VW Labs", h: "/vw-labs" }] },
  { label: "Intelligence", desc: "Data, analysis and AI-assisted research", links: [{ t: "Community Pulse", h: "/dashboard" }, { t: "Project Evaluator", h: "/evaluator" }, { t: "Research Agent", h: "/agent.html" }, { t: "Models & Calculators", h: "/under-the-hood/calculators" }] },
  { label: "Platform", desc: "About NapaServe and how to reach us", links: [{ t: "About NapaServe", h: "/about" }, { t: "Contact", h: "/about#contact" }, { t: "Admin", h: "/admin" }] },
];

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname;
  const [navOpen, setNavOpen] = useState(false);

  const go = (path) => {
    setNavOpen(false);
    if (path.startsWith("/agent")) {
      window.location.href = path;
    } else if (path.includes("#")) {
      navigate(path.split("#")[0]);
      setTimeout(() => {
        const el = document.getElementById(path.split("#")[1]);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <a href="#main-content" style={{
        position: "absolute", left: "-9999px", top: "auto", width: "1px", height: "1px", overflow: "hidden",
        zIndex: 200, background: "#2C1810", color: "#F5F0E8", padding: "12px 20px", fontSize: 14,
        fontFamily: "'Source Sans 3',sans-serif", fontWeight: 700, textDecoration: "none", borderRadius: 4,
      }} onFocus={e => { e.currentTarget.style.position = "fixed"; e.currentTarget.style.left = "16px"; e.currentTarget.style.top = "8px"; e.currentTarget.style.width = "auto"; e.currentTarget.style.height = "auto"; }}
         onBlur={e => { e.currentTarget.style.position = "absolute"; e.currentTarget.style.left = "-9999px"; e.currentTarget.style.width = "1px"; e.currentTarget.style.height = "1px"; }}
      >Skip to main content</a>

      <nav style={{ background: "#F5F0E8", borderBottom: "1px solid rgba(44,24,16,0.12)", padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        {/* Left: wordmark + tagline */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0 }}>
          <a href="/" style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 19, fontWeight: 700, color: "#2C1810", textDecoration: "none", flexShrink: 0 }}>NapaServe</a>
          <span style={{ fontSize: 11, color: "#8B7355", fontFamily: "'Source Sans 3',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Community Intelligence · Napa County</span>
        </div>

        {/* Right: hamburger */}
        <button onClick={() => setNavOpen(o => !o)} aria-label="Toggle menu" style={{ background: "none", border: "1px solid rgba(44,24,16,0.12)", cursor: "pointer", padding: "7px 10px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
          <span style={{ display: "block", width: 18, height: 1.5, background: "#7A6A50", transform: navOpen ? "translateY(5.5px) rotate(45deg)" : "", transition: "transform .2s" }} />
          <span style={{ display: "block", width: 18, height: 1.5, background: "#7A6A50", opacity: navOpen ? 0 : 1, transition: "opacity .2s" }} />
          <span style={{ display: "block", width: 18, height: 1.5, background: "#7A6A50", transform: navOpen ? "translateY(-5.5px) rotate(-45deg)" : "", transition: "transform .2s" }} />
        </button>
      </nav>

      {/* Overlay + right-side drawer */}
      {navOpen && <>
        <div onClick={() => setNavOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
        <div style={{ position: "fixed", top: 52, right: 0, width: 260, background: "#F5F0E8", border: "1px solid rgba(44,24,16,0.12)", borderTop: "none", boxShadow: "0 8px 24px rgba(44,24,16,0.1)", zIndex: 100, fontFamily: "'Source Sans 3',sans-serif", maxHeight: "calc(100vh - 52px)", overflowY: "auto" }}>
          {/* Home link */}
          <button onClick={() => go("/")} style={{ display: "block", width: "100%", textAlign: "left", padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#8B5E3C", background: "none", border: "none", borderBottom: "1px solid rgba(44,24,16,0.12)", cursor: "pointer", fontFamily: "'Source Sans 3',sans-serif" }}>← NapaServe Home</button>

          {/* Grouped sections */}
          {NAV_GROUPS.map((g, gi) => {
            return (
              <div key={gi} style={{ padding: "10px 0", borderBottom: gi < 3 ? "1px solid rgba(44,24,16,0.12)" : "none" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "#8B7355", padding: "4px 20px 2px" }}>{g.label}</div>
                <div style={{ fontSize: 11, color: "#7A6B50", padding: "0 20px 6px", lineHeight: 1.4 }}>{g.desc}</div>
                {g.links.map((l, li) => {
                  const isActive = l.h === current || (l.h !== "/" && current.startsWith(l.h.split("#")[0]));
                  return (
                    <button key={li} onClick={() => go(l.h)} style={{ display: "block", width: "100%", textAlign: "left", fontSize: 13, fontWeight: l.muted ? 400 : 600, color: isActive ? "#8B5E3C" : l.muted ? "#8B7355" : "#7A6A50", background: isActive ? "#EDE8DE" : "transparent", padding: "8px 20px", border: "none", cursor: "pointer", fontFamily: "'Source Sans 3',sans-serif" }}>{l.t}</button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>}
    </>
  );
}

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/", label: "Home" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/evaluator", label: "Evaluator" },
  { path: "/events", label: "Events" },
  { path: "/news", label: "News" },
  { path: "/archive", label: "Archive" },
  { path: "/agent.html", label: "AI Agent", external: true },
  { path: "/valley-works", label: "Valley Works" },
];

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);

  if (current === "/") return null;

  const handleNav = (path) => {
    setMenuOpen(false);
    navigate(path);
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
      <style>{`
        @media (min-width: 768px) {
          .nav-hamburger { display: none !important; }
          .nav-links-desktop { display: flex !important; }
          .nav-menu-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .nav-hamburger { display: flex !important; }
          .nav-links-desktop { display: none !important; }
        }
        nav div::-webkit-scrollbar { display: none; }
      `}</style>

      <nav style={{
        background: "rgba(15,10,6,0.95)",
        borderBottom: "1px solid rgba(196,160,80,0.4)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          height: 48,
          padding: "0 16px",
          justifyContent: "space-between",
        }}>

          {/* Logo / Home link */}
          <button
            onClick={() => handleNav("/")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "none", border: "none", cursor: "pointer",
              padding: "6px 0", flexShrink: 0,
            }}
          >
            <div style={{ width: 5, height: 5, background: "#C4A050", borderRadius: "50%" }} />
            <span style={{
              fontSize: 12, fontWeight: 700, letterSpacing: 2.5, color: "#C4A050",
              fontFamily: "'Source Sans 3','Source Sans Pro',sans-serif",
              whiteSpace: "nowrap",
            }}>NAPASERVE</span>
          </button>

          {/* Desktop nav links */}
          <div className="nav-links-desktop" style={{
            display: "flex",
            alignItems: "center",
            overflowX: "auto",
            overflowY: "hidden",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            gap: 4,
            flex: 1,
            marginLeft: 12,
          }}>
            {NAV_ITEMS.filter(item => item.path !== "/").map(item => {
              const isActive = item.path === current || (item.path !== "/" && current.startsWith(item.path));

              if (item.external) {
                return (
                  <a key={item.path} href={item.path} style={{
                    padding: "6px 14px", fontSize: 13, fontWeight: 600,
                    fontFamily: "'Source Sans 3',sans-serif",
                    color: "#B8A882",
                    textDecoration: "none",
                    borderRadius: 6,
                    transition: "all 0.15s",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}>{item.label}</a>
                );
              }

              return (
                <button key={item.path} onClick={() => handleNav(item.path)} style={{
                  padding: "6px 14px", fontSize: 13, fontWeight: 600,
                  fontFamily: "'Source Sans 3',sans-serif",
                  background: isActive ? "rgba(196,160,80,0.12)" : "none",
                  color: isActive ? "#C4A050" : "#7A6B50",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}>{item.label}</button>
              );
            })}
          </div>

          {/* Hamburger button — mobile only */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: "none",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px 8px",
              flexShrink: 0,
            }}
            aria-label="Toggle menu"
          >
            <span style={{
              display: "block", width: 20, height: 1.5,
              background: menuOpen ? "#C4A050" : "#7A6B50",
              transition: "all 0.2s",
              transform: menuOpen ? "translateY(6.5px) rotate(45deg)" : "none",
            }} />
            <span style={{
              display: "block", width: 20, height: 1.5,
              background: menuOpen ? "#C4A050" : "#7A6B50",
              transition: "all 0.2s",
              opacity: menuOpen ? 0 : 1,
            }} />
            <span style={{
              display: "block", width: 20, height: 1.5,
              background: menuOpen ? "#C4A050" : "#7A6B50",
              transition: "all 0.2s",
              transform: menuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none",
            }} />
          </button>

        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          className="nav-menu-mobile"
          style={{
            position: "fixed",
            top: 48,
            left: 0,
            right: 0,
            background: "rgba(15,10,6,0.98)",
            borderBottom: "1px solid rgba(139,105,20,0.2)",
            zIndex: 99,
            padding: "8px 0 16px",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {/* Home link */}
          <button
            onClick={() => handleNav("/")}
            style={{
              display: "block", width: "100%", textAlign: "left",
              padding: "14px 24px", fontSize: 13, fontWeight: 700,
              fontFamily: "'Source Sans 3',sans-serif",
              color: "#C4A050", background: "none", border: "none",
              borderBottom: "1px solid rgba(139,105,20,0.15)", cursor: "pointer",
            }}
          >← NapaServe Home</button>

          {/* Grouped nav sections */}
          {[
            { label: "Journalism", desc: "Original reporting and searchable archives", links: [{ path: "/news", label: "Napa Valley Features" }, { path: "/archive", label: "NVF Archive Search" }] },
            { label: "Community", desc: "Events, workforce and civic innovation", links: [{ path: "/events", label: "Event Finder" }, { path: "/valley-works", label: "Valley Works" }, { path: "/vw-labs", label: "VW Labs" }] },
            { label: "Intelligence", desc: "Data, analysis and AI-assisted research", links: [{ path: "/dashboard", label: "Community Pulse" }, { path: "/evaluator", label: "Project Evaluator" }, { path: "/agent.html", label: "Research Agent", external: true }] },
            { label: "Platform", desc: "About NapaServe and how to reach us", links: [{ path: "/about", label: "About NapaServe" }, { path: "mailto:napaserve@gmail.com", label: "Contact", external: true }] },
          ].map((group, gi) => (
            <div key={gi} style={{ padding: "10px 0", borderBottom: gi < 3 ? "1px solid rgba(139,105,20,0.15)" : "none" }}>
              <div style={{ padding: "4px 24px 2px", fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "#8B7355", fontFamily: "'Source Sans 3',sans-serif" }}>{group.label}</div>
              <div style={{ padding: "0 24px 6px", fontSize: 11, color: "#7A6B50", fontFamily: "'Source Sans 3',sans-serif", lineHeight: 1.4 }}>{group.desc}</div>
              {group.links.map(item => {
                const isActive = item.path === current || (item.path !== "/" && current.startsWith(item.path));
                if (item.external) {
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "block", padding: "8px 24px", fontSize: 14, fontWeight: 600,
                        fontFamily: "'Source Sans 3',sans-serif", color: "#B8A882", textDecoration: "none",
                      }}
                    >{item.label}</a>
                  );
                }
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "8px 24px", fontSize: 14, fontWeight: 600,
                      fontFamily: "'Source Sans 3',sans-serif",
                      background: isActive ? "rgba(196,160,80,0.08)" : "none",
                      color: isActive ? "#C4A050" : "#7A6B50",
                      border: "none", cursor: "pointer",
                    }}
                  >{item.label}</button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

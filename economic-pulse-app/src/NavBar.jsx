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
        borderBottom: "1px solid rgba(139,105,20,0.15)",
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
          {NAV_ITEMS.filter(item => item.path !== "/").map(item => {
            const isActive = item.path === current || (item.path !== "/" && current.startsWith(item.path));

            if (item.external) {
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "12px 24px",
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: "'Source Sans 3',sans-serif",
                    color: "#B8A882",
                    textDecoration: "none",
                  }}
                >{item.label}</a>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 24px",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "'Source Sans 3',sans-serif",
                  background: isActive ? "rgba(196,160,80,0.08)" : "none",
                  color: isActive ? "#C4A050" : "#7A6B50",
                  border: "none",
                  borderLeft: isActive ? "2px solid #C4A050" : "2px solid transparent",
                  cursor: "pointer",
                }}
              >{item.label}</button>
            );
          })}
        </div>
      )}
    </>
  );
}

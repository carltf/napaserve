import { useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/", label: "Home" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/evaluator", label: "Evaluator" },
  { path: "/events", label: "Events" },
  { path: "/news", label: "News" },
  { path: "/agent.html", label: "AI Agent", external: true },
  { path: "/valley-works", label: "Valley Works" },
];

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname;

  // Don't show nav on the hub/home page — it has its own design
  if (current === "/") return null;

  return (
    <nav style={{
      background: "rgba(15,10,6,0.95)",
      borderBottom: "1px solid rgba(139,105,20,0.15)",
      padding: "0 24px",
      position: "sticky",
      top: 0,
      zIndex: 100,
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", alignItems: "center", gap: 4,
        height: 48,
      }}>
        {/* Logo / Home link */}
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "none", border: "none", cursor: "pointer",
            padding: "6px 12px 6px 0", marginRight: 12,
          }}
        >
          <div style={{ width: 5, height: 5, background: "#C4A050", borderRadius: "50%" }} />
          <span style={{
            fontSize: 12, fontWeight: 700, letterSpacing: 2.5, color: "#C4A050",
            fontFamily: "'Source Sans 3','Source Sans Pro',sans-serif",
          }}>NAPASERVE</span>
        </button>

        {/* Nav links */}
        {NAV_ITEMS.map(item => {
          const isActive = item.path === current || (item.path !== "/" && current.startsWith(item.path));
          
          if (item.external) {
            return (
              <a key={item.path} href={item.path} style={{
                padding: "6px 14px", fontSize: 13, fontWeight: 600,
                fontFamily: "'Source Sans 3',sans-serif",
                color: "#7A6B50",
                textDecoration: "none",
                borderRadius: 6,
                transition: "all 0.15s",
              }}>{item.label}</a>
            );
          }

          return (
            <button key={item.path} onClick={() => navigate(item.path)} style={{
              padding: "6px 14px", fontSize: 13, fontWeight: 600,
              fontFamily: "'Source Sans 3',sans-serif",
              background: isActive ? "rgba(196,160,80,0.12)" : "none",
              color: isActive ? "#C4A050" : "#7A6B50",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              transition: "all 0.15s",
            }}>{item.label}</button>
          );
        })}
      </div>
    </nav>
  );
}

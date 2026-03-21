import { Link } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";

const T = {
  bg: "#F5F0E8",
  surface: "#EDE8DE",
  ink: "#2C1810",
  accent: "#8B5E3C",
  gold: "#C4A050",
  muted: "#8B7355",
  rule: "rgba(44,24,16,0.12)",
};
const font = "'Source Sans 3','Source Sans Pro',sans-serif";
const serif = "'Libre Baskerville',Georgia,serif";

const SECTIONS = [
  {
    label: "Napa Valley Features",
    desc: "Data-driven analysis of Napa County's economy, wine industry, housing and workforce.",
    tiles: [
      {
        title: "2025 Napa Grape Prices Slip After a Record High",
        date: "March 19, 2026",
        tag: "Napa Valley Features",
        href: "/under-the-hood/napa-cab-2025",
        live: true,
      },
    ],
  },
  {
    label: "Sonoma County Features",
    desc: "Original reporting on Sonoma County's agricultural economy and community trends.",
    tiles: [
      {
        title: "Sonoma Grape Prices Fall for a Second Year as Cab Sauv Leads the Decline",
        date: "March 21, 2026",
        tag: "Sonoma County Features",
        href: "/under-the-hood/sonoma-cab-2025",
        live: true,
      },
    ],
  },
  {
    label: "Lake County Features",
    desc: "Coverage of Lake County's agriculture, economy and community — coming soon.",
    tiles: [
      {
        title: "Coming Soon",
        date: "",
        tag: "Lake County Features",
        href: null,
        live: false,
      },
    ],
  },
];

export default function UnderTheHoodIndex() {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: font, color: T.ink }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <NavBar />

      <div id="main-content" style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 60px" }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: T.muted, textTransform: "uppercase", marginBottom: 8 }}>
          NapaServe · Under the Hood
        </div>

        {/* Hero */}
        <h1 style={{ fontFamily: serif, fontSize: "2.4rem", fontWeight: 700, color: T.ink, margin: "0 0 10px", lineHeight: 1.2 }}>
          Under the Hood
        </h1>
        <p style={{ fontSize: 17, color: T.muted, lineHeight: 1.7, margin: "0 0 40px", maxWidth: 640 }}>
          Interactive, data-driven articles from across Napa, Sonoma and Lake counties — with live charts powered by community data.
        </p>

        {/* Sections */}
        {SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom: 44 }}>
            {/* Section header */}
            <div style={{ borderBottom: `1px solid ${T.rule}`, paddingBottom: 10, marginBottom: 18 }}>
              <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: 0, lineHeight: 1.3 }}>
                {section.label}
              </h2>
              <p style={{ fontSize: 14, color: T.muted, margin: "4px 0 0", lineHeight: 1.5 }}>{section.desc}</p>
            </div>

            {/* Tiles */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {section.tiles.map((tile, ti) => {
                const inner = (
                  <div style={{
                    background: T.surface,
                    border: `1px solid ${T.rule}`,
                    borderLeft: tile.live ? `3px solid ${T.accent}` : `3px solid ${T.rule}`,
                    padding: "22px 24px",
                    opacity: tile.live ? 1 : 0.55,
                    transition: "box-shadow 0.15s",
                    cursor: tile.href ? "pointer" : "default",
                    height: "100%",
                  }}>
                    {/* Tag + live dot */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: T.gold }}>{tile.tag}</span>
                      {tile.live && (
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4CAF50", display: "inline-block", flexShrink: 0 }} title="Live" />
                      )}
                    </div>
                    {/* Title */}
                    <div style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: T.ink, lineHeight: 1.35, marginBottom: 8 }}>
                      {tile.title}
                    </div>
                    {/* Date */}
                    {tile.date && (
                      <div style={{ fontSize: 13, color: T.muted }}>{tile.date}</div>
                    )}
                    {tile.live && (
                      <div style={{ fontSize: 13, color: T.accent, fontWeight: 600, marginTop: 10 }}>
                        Interactive charts · Live data →
                      </div>
                    )}
                  </div>
                );

                return tile.href ? (
                  <Link key={ti} to={tile.href} style={{ textDecoration: "none" }}>{inner}</Link>
                ) : (
                  <div key={ti}>{inner}</div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}

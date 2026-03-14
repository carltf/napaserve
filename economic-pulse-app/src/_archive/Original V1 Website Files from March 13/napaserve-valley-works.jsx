import { useState } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// VALLEY WORKS COLLABORATIVE — NapaServe integrated page
// ═══════════════════════════════════════════════════════════════════════════

const PILLARS = [
  {
    id: "jobs", label: "Jobs", color: "#C8A96E",
    tagline: "Well-paying local employment is not a side effect. It is a design requirement.",
    points: [
      "Create durable, skilled jobs",
      "Retain economic value locally",
      "Expand opportunity beyond seasonal and service roles",
      "Strengthen workforce participation",
    ],
    footer: "Growth without wage growth does not strengthen a region. We prioritize both.",
  },
  {
    id: "people", label: "People", color: "#7EB8A4",
    tagline: "Innovation is not abstract. It affects real lives.",
    points: [
      "Improve healthcare delivery and aging support",
      "Increase access to practical technology",
      "Strengthen small business capacity",
      "Align workforce development with real regional needs",
    ],
    footer: "Economic systems succeed when they serve the people who live within them.",
  },
  {
    id: "place", label: "Place", color: "#9B8EC4",
    tagline: "Napa County's landscape is not a backdrop. It is a critical asset.",
    points: [
      "Protect land and water",
      "Advance environmental resilience",
      "Align economic activity with ecological stewardship",
      "Recognize the limits and value of the region",
    ],
    footer: "Long-term prosperity depends on respecting place.",
  },
];

export default function ValleyWorksPage() {
  const [activePillar, setActivePillar] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(175deg, #1C120C 0%, #2A1A0E 30%, #1E1408 60%, #0F0A06 100%)", fontFamily: "'Source Sans 3','Source Sans Pro',-apple-system,sans-serif", color: "#F5E6C8" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Source+Sans+3:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      <div style={{ height: 3, background: "linear-gradient(90deg, transparent, #8B6914 20%, #C4A050 50%, #8B6914 80%, transparent)" }} />

      {/* Hero */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 0", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 8, height: 8, background: "#C4A050", borderRadius: "50%" }} />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 4, color: "#8B6914", textTransform: "uppercase" }}>Valley Works Collaborative</span>
        </div>

        <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(32px,5vw,48px)", fontWeight: 900, color: "#F5E6C8", margin: "0 0 12px", letterSpacing: -0.5, lineHeight: 1.1 }}>
          Building Solutions,<br /><span style={{ color: "#C4A050" }}>Locally.</span>
        </h1>

        <p style={{ fontSize: 17, color: "#9B8968", maxWidth: 600, margin: "0 auto 12px", lineHeight: 1.65 }}>
          An innovation hub rooted in Napa County. We place jobs, people, and place at the center of every idea we build.
        </p>

        <div style={{ display: "inline-flex", gap: 20, fontSize: 12, color: "#6B5B40", letterSpacing: 1, marginBottom: 40 }}>
          <span>Jobs</span>
          <span style={{ color: "#3A3020" }}>·</span>
          <span>People</span>
          <span style={{ color: "#3A3020" }}>·</span>
          <span>Place</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 60px" }}>

        {/* Why This Matters */}
        <div style={{ background: "linear-gradient(135deg, rgba(139,105,20,0.08) 0%, rgba(114,47,55,0.04) 100%)", border: "1px solid rgba(139,105,20,0.15)", borderRadius: 14, padding: "28px 32px", marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: "#8B6914", textTransform: "uppercase", marginBottom: 12 }}>Why This Matters</div>
          <p style={{ fontSize: 16, color: "#C4B08A", lineHeight: 1.75, margin: "0 0 12px" }}>
            Napa County has built a remarkable economy around wine and hospitality. That foundation will always matter. But long-term resilience requires more than one engine.
          </p>
          <p style={{ fontSize: 16, color: "#C4B08A", lineHeight: 1.75, margin: "0 0 12px" }}>
            Employment and wage growth has flattened. Costs continue to rise. Many essential workers cannot afford to live where they work. The question is not whether wine remains part of the future. It is whether the region builds the next layer of its economy with intention.
          </p>
          <p style={{ fontSize: 16, color: "#F5E6C8", lineHeight: 1.75, margin: 0, fontWeight: 600 }}>
            Valley Works Collaborative exists to help build that next layer.
          </p>
        </div>

        {/* Three Pillars */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: "#8B6914", textTransform: "uppercase", marginBottom: 16 }}>Our Priorities</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 32 }}>
          {PILLARS.map(p => (
            <div key={p.id} onClick={() => setActivePillar(activePillar === p.id ? null : p.id)} style={{
              background: activePillar === p.id ? `${p.color}12` : "rgba(255,255,255,0.02)",
              border: `1px solid ${activePillar === p.id ? p.color + "44" : "rgba(139,105,20,0.15)"}`,
              borderRadius: 14, padding: "24px 22px", cursor: "pointer", transition: "all 0.25s",
            }}>
              <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 24, fontWeight: 700, color: p.color, margin: "0 0 10px" }}>{p.label}</h3>
              <p style={{ fontSize: 14, color: "#C4B08A", lineHeight: 1.65, margin: "0 0 14px" }}>{p.tagline}</p>

              {activePillar === p.id && (
                <div style={{ borderTop: `1px solid ${p.color}33`, paddingTop: 14, marginTop: 4 }}>
                  {p.points.map((pt, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                      <div style={{ width: 5, height: 5, background: p.color, borderRadius: "50%", marginTop: 7, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "#9B8968", lineHeight: 1.5 }}>{pt}</span>
                    </div>
                  ))}
                  <p style={{ fontSize: 13, color: p.color, fontWeight: 600, margin: "12px 0 0", lineHeight: 1.5 }}>{p.footer}</p>
                </div>
              )}

              {activePillar !== p.id && (
                <span style={{ fontSize: 12, color: "#6B5B40" }}>Click to expand →</span>
              )}
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,105,20,0.12)", borderRadius: 14, padding: "28px 32px", marginBottom: 32, textAlign: "center" }}>
          <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, fontWeight: 400, color: "#F5E6C8", lineHeight: 1.6, margin: "0 0 16px", fontStyle: "italic" }}>
            Build practical solutions that expand well-paying employment, strengthen local communities, and protect the environment that sustains the region.
          </p>
          <p style={{ fontSize: 14, color: "#7A6B50", margin: 0 }}>
            Valley Works Collaborative is a regional initiative focused on applied innovation. We bring together entrepreneurs, researchers, local institutions, and investors to build practical solutions to real challenges.
          </p>
        </div>

        {/* NapaServe Connection */}
        <div style={{ background: "linear-gradient(135deg, rgba(196,160,80,0.08) 0%, rgba(91,138,90,0.06) 100%)", border: "1px solid rgba(139,105,20,0.18)", borderRadius: 14, padding: "28px 32px", marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: "#8B6914", textTransform: "uppercase", marginBottom: 12 }}>NapaServe</div>
          <p style={{ fontSize: 15, color: "#C4B08A", lineHeight: 1.7, margin: "0 0 16px" }}>
            NapaServe is Valley Works' prototype for community-scale civic AI — accurate information and AI-powered tools for everyone invested in Napa County's future. Policy analysis, economic tracking, project evaluation, event discovery, and local news, all in one place.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/dashboard" style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,105,20,0.25)", color: "#C4A050", borderRadius: 6, textDecoration: "none" }}>Economic Dashboard</a>
            <a href="/evaluator" style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,105,20,0.25)", color: "#C4A050", borderRadius: 6, textDecoration: "none" }}>Project Evaluator</a>
            <a href="/events" style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,105,20,0.25)", color: "#C4A050", borderRadius: 6, textDecoration: "none" }}>Event Finder</a>
            <a href="/news" style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,105,20,0.25)", color: "#C4A050", borderRadius: 6, textDecoration: "none" }}>News & Features</a>
          </div>
        </div>

        {/* Get Involved */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,105,20,0.18)", borderRadius: 14, padding: "28px 32px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: "#8B6914", textTransform: "uppercase", marginBottom: 12 }}>Get Involved</div>
          <p style={{ fontSize: 15, color: "#C4B08A", lineHeight: 1.7, margin: "0 0 20px" }}>
            Have an idea, a partnership opportunity, or a project that could benefit from the Lab? Start a conversation.
          </p>

          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#8B6914", marginBottom: 4 }}>Contact</div>
              <a href="mailto:valleyworkscollaborative@gmail.com" style={{ fontSize: 14, color: "#C4A050", textDecoration: "none" }}>valleyworkscollaborative@gmail.com</a>
              <div style={{ fontSize: 13, color: "#7A6B50", marginTop: 2 }}>(707) 661-9465</div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#8B6914", marginBottom: 4 }}>Follow</div>
              <div style={{ display: "flex", gap: 12 }}>
                <a href="https://valleyworkscollaborative.substack.com/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#C4A050", textDecoration: "none" }}>Substack ↗</a>
                <a href="https://bsky.app/profile/valleyworkscollab.bsky.social" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#C4A050", textDecoration: "none" }}>Bluesky ↗</a>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";

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
  const [navOpen, setNavOpen] = useState(false);

  const Nav = () => (
    <div style={{ position: "relative" }}>
      <nav style={{ background: "#F5F0E8", borderBottom: "1px solid rgba(44,24,16,0.12)", padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20 }}>
        <a href="/" style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 19, fontWeight: 700, color: "#2C1810", textDecoration: "none" }}>NapaServe</a>
        <button onClick={() => setNavOpen(o => !o)} style={{ background: "none", border: "1px solid rgba(44,24,16,0.12)", cursor: "pointer", padding: "7px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ display: "block", width: 18, height: 1.5, background: "#7A6A50", transform: navOpen ? "translateY(5.5px) rotate(45deg)" : "", transition: "transform .2s" }} />
          <span style={{ display: "block", width: 18, height: 1.5, background: "#7A6A50", opacity: navOpen ? 0 : 1, transition: "opacity .2s" }} />
          <span style={{ display: "block", width: 18, height: 1.5, background: "#7A6A50", transform: navOpen ? "translateY(-5.5px) rotate(-45deg)" : "", transition: "transform .2s" }} />
        </button>
      </nav>
      {navOpen && <>
        <div onClick={() => setNavOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 19 }} />
        <div style={{ position: "fixed", top: 52, right: 0, width: 240, background: "#F5F0E8", border: "1px solid rgba(44,24,16,0.12)", borderTop: "none", boxShadow: "0 8px 24px rgba(44,24,16,0.1)", zIndex: 20, fontFamily: "'Source Sans 3',sans-serif" }}>
          <a href="/" onClick={() => setNavOpen(false)} style={{ display: "block", padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#8B5E3C", borderBottom: "1px solid rgba(44,24,16,0.12)", textDecoration: "none" }}>← NapaServe Home</a>
          {[
            { label: "Journalism", links: [{ t: "Napa Valley Features", h: "/news" }, { t: "NVF Archive Search", h: "/archive" }] },
            { label: "Community", links: [{ t: "Event Finder", h: "/events" }, { t: "Valley Works", h: "/valley-works", cur: true }, { t: "VW Labs", h: "/vw-labs" }] },
            { label: "Intelligence", links: [{ t: "Economic Dashboard", h: "/dashboard" }, { t: "Project Evaluator", h: "/evaluator" }, { t: "Research Agent", h: "/agent.html" }] },
            { label: "Platform", links: [{ t: "About NapaServe", h: "/about" }, { t: "Contact", h: "mailto:napaserve@gmail.com" }] },
          ].map((g, gi) => (
            <div key={gi} style={{ padding: "10px 0", borderBottom: gi < 3 ? "1px solid rgba(44,24,16,0.12)" : "none" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "#A89880", padding: "4px 20px 6px" }}>{g.label}</div>
              {g.links.map((l, li) => (
                <a key={li} href={l.h} onClick={() => setNavOpen(false)} style={{ display: "block", fontSize: 13, fontWeight: 600, color: l.cur ? "#8B5E3C" : "#7A6A50", background: l.cur ? "#EDE8DE" : "transparent", padding: "8px 20px", textDecoration: "none" }}>{l.t}</a>
              ))}
            </div>
          ))}
        </div>
      </>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: "'Source Sans 3',sans-serif", color: "#2C1810" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <Nav />

      {/* Hero */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px 0", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 8, height: 8, background: "#C4A050", borderRadius: "50%" }} />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 4, color: "#8B5E3C", textTransform: "uppercase" }}>Valley Works Collaborative</span>
        </div>

        <h1 style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: "clamp(32px,5vw,48px)", fontWeight: 700, color: "#2C1810", margin: "0 0 12px", letterSpacing: -0.5, lineHeight: 1.1 }}>
          Building Solutions,<br /><span style={{ color: "#8B5E3C" }}>Locally.</span>
        </h1>

        <p style={{ fontSize: 17, color: "#A89880", maxWidth: 600, margin: "0 auto 12px", lineHeight: 1.65 }}>
          An innovation hub rooted in Napa County. We place jobs, people, and place at the center of every idea we build.
        </p>

        <div style={{ display: "inline-flex", gap: 20, fontSize: 12, color: "#A89880", fontFamily: "'Source Sans 3',sans-serif", letterSpacing: 1, marginBottom: 40 }}>
          <span>Jobs</span>
          <span style={{ color: "rgba(44,24,16,0.2)" }}>·</span>
          <span>People</span>
          <span style={{ color: "rgba(44,24,16,0.2)" }}>·</span>
          <span>Place</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 60px" }}>

        {/* Why This Matters */}
        <div style={{ background: "#EDE8DE", border: "1px solid rgba(44,24,16,0.12)", padding: "28px 32px", marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "#8B5E3C", fontFamily: "'Source Sans 3',sans-serif", marginBottom: 12 }}>Why This Matters</div>
          <p style={{ fontSize: 16, color: "#7A6A50", lineHeight: 1.75, margin: "0 0 12px" }}>
            Napa County has built a remarkable economy around wine and hospitality. That foundation will always matter. But long-term resilience requires more than one engine.
          </p>
          <p style={{ fontSize: 16, color: "#7A6A50", lineHeight: 1.75, margin: "0 0 12px" }}>
            Employment and wage growth has flattened. Costs continue to rise. Many essential workers cannot afford to live where they work. The question is not whether wine remains part of the future. It is whether the region builds the next layer of its economy with intention.
          </p>
          <p style={{ fontSize: 16, color: "#2C1810", lineHeight: 1.75, margin: 0, fontWeight: 600 }}>
            Valley Works Collaborative exists to help build that next layer.
          </p>
        </div>

        {/* Three Pillars */}
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "#8B5E3C", fontFamily: "'Source Sans 3',sans-serif", marginBottom: 16 }}>Our Priorities</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 32 }}>
          {PILLARS.map(p => (
            <div key={p.id} onClick={() => setActivePillar(activePillar === p.id ? null : p.id)} style={{
              background: activePillar === p.id ? `${p.color}18` : "#EDE8DE",
              border: `1px solid ${activePillar === p.id ? p.color + "66" : "rgba(44,24,16,0.12)"}`,
              padding: "24px 22px", cursor: "pointer", transition: "all 0.25s",
            }}>
              <h3 style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 24, fontWeight: 700, color: p.color, margin: "0 0 10px" }}>{p.label}</h3>
              <p style={{ fontSize: 14, color: "#7A6A50", lineHeight: 1.65, margin: "0 0 14px" }}>{p.tagline}</p>

              {activePillar === p.id && (
                <div style={{ borderTop: `1px solid ${p.color}33`, paddingTop: 14, marginTop: 4 }}>
                  {p.points.map((pt, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                      <div style={{ width: 5, height: 5, background: p.color, borderRadius: "50%", marginTop: 7, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "#A89880", lineHeight: 1.5 }}>{pt}</span>
                    </div>
                  ))}
                  <p style={{ fontSize: 13, color: p.color, fontWeight: 600, margin: "12px 0 0", lineHeight: 1.5 }}>{p.footer}</p>
                </div>
              )}

              {activePillar !== p.id && (
                <span style={{ fontSize: 12, color: "#A89880", fontFamily: "'Source Sans 3',sans-serif" }}>Click to expand →</span>
              )}
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div style={{ background: "#EDE8DE", border: "1px solid rgba(44,24,16,0.12)", padding: "28px 32px", marginBottom: 32, textAlign: "center" }}>
          <p style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 20, fontWeight: 400, color: "#2C1810", lineHeight: 1.6, margin: "0 0 16px", fontStyle: "italic" }}>
            Build practical solutions that expand well-paying employment, strengthen local communities, and protect the environment that sustains the region.
          </p>
          <p style={{ fontSize: 14, color: "#7A6A50", margin: 0 }}>
            Valley Works Collaborative is a regional initiative focused on applied innovation. We bring together entrepreneurs, researchers, local institutions, and investors to build practical solutions to real challenges.
          </p>
        </div>

        {/* NapaServe Connection */}
        <div style={{ background: "#EDE8DE", border: "1px solid rgba(44,24,16,0.12)", padding: "28px 32px", marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "#8B5E3C", fontFamily: "'Source Sans 3',sans-serif", marginBottom: 12 }}>NapaServe</div>
          <p style={{ fontSize: 15, color: "#7A6A50", lineHeight: 1.7, margin: "0 0 16px" }}>
            NapaServe is Valley Works' prototype for community-scale civic AI — accurate information and AI-powered tools for everyone invested in Napa County's future. Policy analysis, economic tracking, project evaluation, event discovery, and local news, all in one place.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/dashboard" style={{ padding: "8px 16px", fontSize: 12, fontWeight: 600, background: "transparent", border: "1px solid rgba(44,24,16,0.12)", color: "#8B5E3C", textDecoration: "none" }}>Economic Dashboard</a>
            <a href="/evaluator" style={{ padding: "8px 16px", fontSize: 12, fontWeight: 600, background: "transparent", border: "1px solid rgba(44,24,16,0.12)", color: "#8B5E3C", textDecoration: "none" }}>Project Evaluator</a>
            <a href="/events" style={{ padding: "8px 16px", fontSize: 12, fontWeight: 600, background: "transparent", border: "1px solid rgba(44,24,16,0.12)", color: "#8B5E3C", textDecoration: "none" }}>Event Finder</a>
            <a href="/news" style={{ padding: "8px 16px", fontSize: 12, fontWeight: 600, background: "transparent", border: "1px solid rgba(44,24,16,0.12)", color: "#8B5E3C", textDecoration: "none" }}>News & Features</a>
          </div>
        </div>

        {/* Get Involved */}
        <div style={{ background: "#EDE8DE", border: "1px solid rgba(44,24,16,0.12)", padding: "28px 32px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "#8B5E3C", fontFamily: "'Source Sans 3',sans-serif", marginBottom: 12 }}>Get Involved</div>
          <p style={{ fontSize: 15, color: "#7A6A50", lineHeight: 1.7, margin: "0 0 20px" }}>
            Have an idea, a partnership opportunity, or a project that could benefit from the Lab? Start a conversation.
          </p>

          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#8B5E3C", marginBottom: 4 }}>Contact</div>
              <a href="mailto:valleyworkscollaborative@gmail.com" style={{ fontSize: 14, color: "#8B5E3C", textDecoration: "none", fontFamily: "'Source Sans 3',sans-serif" }}>valleyworkscollaborative@gmail.com</a>
              <div style={{ fontSize: 13, color: "#7A6A50", marginTop: 2 }}>(707) 661-9465</div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#8B5E3C", marginBottom: 4 }}>Follow</div>
              <div style={{ display: "flex", gap: 12 }}>
                <a href="https://valleyworkscollaborative.substack.com/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#8B5E3C", textDecoration: "none", fontFamily: "'Source Sans 3',sans-serif" }}>Substack ↗</a>
                <a href="https://bsky.app/profile/valleyworkscollab.bsky.social" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#8B5E3C", textDecoration: "none", fontFamily: "'Source Sans 3',sans-serif" }}>Bluesky ↗</a>
              </div>
            </div>
          </div>
        </div>

        {/* VW Labs */}
        <div style={{ background: "#EDE8DE", border: "1px solid rgba(44,24,16,0.12)", borderLeft: "3px solid #C4A050", padding: "28px 32px", marginTop: 24 }}>
          <h2 style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 22, fontWeight: 700, color: "#2C1810", margin: "0 0 4px" }}>ValleyWorks Labs</h2>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#C4A050", marginBottom: 14 }}>Incubating Durable Regional Companies</div>
          <p style={{ fontSize: 14, color: "#7A6A50", lineHeight: 1.75, margin: "0 0 16px" }}>
            VW Labs supports early-stage ventures that strengthen Napa County's economic future — focused on practical implementation, measurable outcomes, and well-paying local employment.
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
            {["Environmental Resilience", "Healthcare & Aging", "Applied AI", "Workforce Systems"].map(t => (
              <span key={t} style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#C4A050", border: "1px solid rgba(196,160,80,0.3)", background: "rgba(196,160,80,0.06)", padding: "5px 10px" }}>{t}</span>
            ))}
          </div>
          <Link to="/vw-labs" style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", background: "linear-gradient(135deg,#8B6914,#C4A050)", color: "#1C120C", padding: "10px 20px", textDecoration: "none", border: "none" }}>Learn More →</Link>
        </div>

      </div>
    </div>
  );
}

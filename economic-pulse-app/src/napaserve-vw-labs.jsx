import Footer from "./Footer";
import NavBar from "./NavBar";

const T = {
  bg:"#F5F0E8", bg2:"#EDE8DE",
  ink2:"#2C1810", accent:"#8B5E3C", gold:"#C4A050",
  muted:"#7A6A50", dim:"#8B7355",
  rule:"rgba(44,24,16,0.12)",
};

const STEPS = [
  { n: 1, title: "Define the Problem", desc: "Identify a specific, measurable challenge facing Napa County — not a product idea, but a real gap." },
  { n: 2, title: "Validate Regional Relevance", desc: "Demonstrate that the problem matters locally: who is affected, what data supports it, and why existing solutions fall short." },
  { n: 3, title: "Build a Pilot", desc: "Develop a working prototype or limited deployment. Prove it works here before scaling." },
  { n: 4, title: "Measure and Scale", desc: "Track outcomes against the Jobs · People · Place framework. If it works, expand deliberately." },
];

const FOCUS = [
  { title: "Environmental Resilience", desc: "Water management, wildfire mitigation, soil health, and land stewardship technology." },
  { title: "Healthcare & Aging", desc: "Accessible care delivery, aging-in-place solutions, and rural health infrastructure." },
  { title: "Applied AI", desc: "Practical AI tools for civic decision-making, local journalism, and small business operations." },
  { title: "Workforce Systems", desc: "Training pipelines, credential programs, and employment platforms for skilled local jobs." },
  { title: "Small Business Innovation", desc: "Tools and programs that help independent businesses compete, adapt, and grow locally." },
  { title: "Ag Tech", desc: "Precision agriculture, irrigation technology, and data-driven farm management for Napa's agricultural economy." },
  { title: "Food Systems", desc: "Regional food production, distribution, and supply chain resilience from farm to table." },
  { title: "Creative Economy", desc: "Media, journalism, design, and cultural enterprises that build local identity and economic diversity." },
];

export default function VWLabsPage() {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Source Sans 3',sans-serif", color: T.ink2, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <style>{`@media(max-width:700px){.vwl-focus{grid-template-columns:1fr 1fr!important;}}`}</style>
      <NavBar />

      {/* Hero */}
      <div id="main-content" style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 0", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 8, height: 8, background: T.gold, borderRadius: "50%" }} />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 4, color: T.accent, textTransform: "uppercase" }}>A Valley Works Collaborative Initiative</span>
        </div>

        <h1 style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: "clamp(32px,5vw,48px)", fontWeight: 700, color: T.ink2, margin: "0 0 12px", letterSpacing: -0.5, lineHeight: 1.1 }}>
          ValleyWorks Labs
        </h1>

        <div style={{ fontSize: 16, fontWeight: 600, color: T.gold, letterSpacing: 2, marginBottom: 16, fontFamily: "'Source Sans 3',sans-serif" }}>
          Innovate · Incubate · Accelerate
        </div>

        <p style={{ fontSize: 17, color: T.dim, maxWidth: 640, margin: "0 auto 48px", lineHeight: 1.65 }}>
          Supporting early-stage ventures that strengthen Napa County's economic future through practical implementation and well-paying local employment.
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Innovation Philosophy */}
        <div style={{ background: T.bg2, border: `1px solid ${T.rule}`, padding: "28px 32px", marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: T.accent, fontFamily: "'Source Sans 3',sans-serif", marginBottom: 12 }}>Innovation Philosophy</div>
          <p style={{ fontSize: 17, color: T.muted, lineHeight: 1.75, margin: 0 }}>
            We believe in deliberate building — prioritizing durability over speed, local value retention over rapid extraction, and practical outcomes over speculative scale. Growth detached from place is not innovation. Real innovation strengthens the community it comes from.
          </p>
        </div>

        {/* Incubation Program */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: T.accent, fontFamily: "'Source Sans 3',sans-serif", marginBottom: 16 }}>Incubation Program</div>
          <div className="vwl-steps" style={{ display: "grid", gap: 14 }}>
            {STEPS.map(s => (
              <div key={s.n} style={{ background: T.bg2, border: `1px solid ${T.rule}`, padding: "24px 22px" }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: T.gold, fontFamily: "'Libre Baskerville',Georgia,serif", lineHeight: 1, marginBottom: 10 }}>{s.n}</div>
                <h3 style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 17, fontWeight: 700, color: T.ink2, margin: "0 0 8px" }}>{s.title}</h3>
                <p style={{ fontSize: 17, color: T.muted, lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Focus Areas */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: T.accent, fontFamily: "'Source Sans 3',sans-serif", marginBottom: 16 }}>Focus Areas</div>
          <div className="vwl-focus" style={{ display: "grid", gap: 14 }}>
            {FOCUS.map(f => (
              <div key={f.title} style={{ background: T.bg2, border: `1px solid ${T.rule}`, borderLeft: `3px solid ${T.gold}`, padding: "20px 22px" }}>
                <h3 style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 16, fontWeight: 700, color: T.ink2, margin: "0 0 8px" }}>{f.title}</h3>
                <p style={{ fontSize: 17, color: T.muted, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Current Ventures */}
        <div style={{ background: T.bg2, border: `1px solid ${T.rule}`, padding: "28px 32px", marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: T.accent, fontFamily: "'Source Sans 3',sans-serif", marginBottom: 12 }}>Current Ventures</div>
          <p style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 18, fontWeight: 400, fontStyle: "italic", color: T.muted, lineHeight: 1.6, margin: 0 }}>
            Launching 2026 — Current cohort details coming soon.
          </p>
        </div>

        {/* How to Apply */}
        <div style={{ background: T.bg2, border: `1px solid ${T.rule}`, padding: "28px 32px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: T.accent, fontFamily: "'Source Sans 3',sans-serif", marginBottom: 12 }}>How to Apply</div>
          <p style={{ fontSize: 17, color: T.muted, lineHeight: 1.75, margin: "0 0 16px" }}>
            We review proposals on a rolling basis. Your submission should include:
          </p>
          <div style={{ margin: "0 0 20px" }}>
            {[
              "A clear problem statement tied to Napa County",
              "Evidence of regional need (data, interviews, or lived experience)",
              "A proposed pilot approach with measurable outcomes",
              "How the venture creates well-paying local employment",
              "Your team and relevant experience",
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                <div style={{ width: 5, height: 5, background: T.gold, borderRadius: "50%", marginTop: 7, flexShrink: 0 }} />
                <span style={{ fontSize: 17, color: T.muted, lineHeight: 1.5 }}>{r}</span>
              </div>
            ))}
          </div>
          <a href="mailto:info@napaserve.com" style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", background: `linear-gradient(135deg,#8B6914,${T.gold})`, color: "#1C120C", padding: "10px 20px", textDecoration: "none", border: "none" }}>
            Submit a Proposal →
          </a>
        </div>

      </div>
      <Footer />
    </div>
  );
}

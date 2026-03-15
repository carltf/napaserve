import { useState } from "react";
import { Link } from "react-router-dom";

const T = {
  bg:"#F5F0E8", bg2:"#EDE8DE", bg3:"#E6E0D4",
  ink2:"#2C1810", ink:"#1A0E08",
  accent:"#8B5E3C", gold:"#C4A050",
  muted:"#7A6A50", dim:"#A89880",
  rule:"rgba(44,24,16,0.12)", live:"#4A7A5A",
};

export default function AboutNapaServe() {
  const [navOpen, setNavOpen] = useState(false);

  // ─── INLINE NAV ────────────────────────────────────────────────────────────
  const Nav = () => (
    <div style={{ position: "relative" }}>
      <nav style={{ background: T.bg, borderBottom: `1px solid ${T.rule}`, padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20 }}>
        <a href="/" style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 19, fontWeight: 700, color: T.ink2, textDecoration: "none" }}>NapaServe</a>
        <button onClick={() => setNavOpen(o => !o)} style={{ background: "none", border: `1px solid ${T.rule}`, cursor: "pointer", padding: "7px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ display: "block", width: 18, height: 1.5, background: T.muted, transform: navOpen ? "translateY(5.5px) rotate(45deg)" : "", transition: "transform .2s" }} />
          <span style={{ display: "block", width: 18, height: 1.5, background: T.muted, opacity: navOpen ? 0 : 1, transition: "opacity .2s" }} />
          <span style={{ display: "block", width: 18, height: 1.5, background: T.muted, transform: navOpen ? "translateY(-5.5px) rotate(-45deg)" : "", transition: "transform .2s" }} />
        </button>
      </nav>
      {navOpen && <>
        <div onClick={() => setNavOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 19 }} />
        <div style={{ position: "fixed", top: 52, right: 0, width: 240, background: T.bg, border: `1px solid ${T.rule}`, borderTop: "none", boxShadow: "0 8px 24px rgba(44,24,16,0.1)", zIndex: 20, fontFamily: "'Source Sans 3',sans-serif" }}>
          <a href="/" onClick={() => setNavOpen(false)} style={{ display: "block", padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#8B5E3C", borderBottom: `1px solid ${T.rule}`, textDecoration: "none" }}>← NapaServe Home</a>
          {[
            { label: "Journalism", links: [{ t: "Napa Valley Features", h: "/news" }, { t: "NVF Archive Search", h: "/archive" }] },
            { label: "Community", links: [{ t: "Event Finder", h: "/events" }, { t: "Valley Works", h: "/valley-works" }, { t: "VW Labs", h: "/valley-works" }] },
            { label: "Intelligence", links: [{ t: "Economic Dashboard", h: "/dashboard" }, { t: "Project Evaluator", h: "/evaluator" }, { t: "Research Agent", h: "/agent.html" }] },
            { label: "Platform", links: [{ t: "About NapaServe", h: "/about", cur: true }, { t: "Contact", h: "mailto:napaserve@gmail.com" }] },
          ].map((g, gi) => (
            <div key={gi} style={{ padding: "10px 0", borderBottom: gi < 3 ? `1px solid ${T.rule}` : "none" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: T.dim, padding: "4px 20px 6px" }}>{g.label}</div>
              {g.links.map((l, li) => (
                <a key={li} href={l.h} onClick={() => setNavOpen(false)} style={{ display: "block", fontSize: 13, fontWeight: 600, color: l.cur ? T.accent : T.muted, background: l.cur ? T.bg2 : "transparent", padding: "8px 20px", textDecoration: "none" }}>{l.t}</a>
              ))}
            </div>
          ))}
        </div>
      </>}
    </div>
  );

  const Section = ({ id, label, children }) => (
    <div id={id} style={{ borderTop: `1px solid ${T.rule}`, paddingTop: 48, marginTop: 48 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: T.accent, marginBottom: 12, fontFamily: "'Source Sans 3',sans-serif" }}>{label}</div>
      {children}
    </div>
  );

  const P = ({ children, style = {} }) => (
    <p style={{ fontSize: 16, lineHeight: 1.85, color: T.muted, fontFamily: "'Source Sans 3',sans-serif", margin: "0 0 20px", maxWidth: 680, ...style }}>{children}</p>
  );

  const H = ({ children }) => (
    <h2 style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: "clamp(20px,3vw,26px)", fontWeight: 700, color: T.ink2, margin: "32px 0 12px", lineHeight: 1.2 }}>{children}</h2>
  );

  const Tool = ({ name, route, isExternal, desc }) => (
    <div style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: `1px solid ${T.rule}` }}>
      <div style={{ width: 5, flexShrink: 0, background: T.accent, borderRadius: 2, marginTop: 4 }} />
      <div>
        {isExternal
          ? <a href={route} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 16, fontWeight: 700, color: T.accent, textDecoration: "none" }}>{name} ↗</a>
          : <Link to={route} style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 16, fontWeight: 700, color: T.accent, textDecoration: "none" }}>{name}</Link>
        }
        <p style={{ fontSize: 13, color: T.muted, margin: "4px 0 0", lineHeight: 1.6, fontFamily: "'Source Sans 3',sans-serif" }}>{desc}</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Source Sans 3',sans-serif", color: T.ink2 }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />

      <Nav />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px 80px" }}>

        {/* PAGE HEADER */}
        <div style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: T.dim, marginBottom: 16, fontFamily: "'Source Sans 3',sans-serif" }}>
            <Link to="/" style={{ color: T.dim, textDecoration: "none" }}>NapaServe</Link> · About
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 700, color: T.ink2, margin: "0 0 20px", lineHeight: 1.05, letterSpacing: "-.015em" }}>
            Built in Napa,<br /><em style={{ fontStyle: "italic", color: T.accent }}>for Napa.</em>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.75, color: T.muted, maxWidth: 620, margin: 0, fontFamily: "'Source Sans 3',sans-serif" }}>
            NapaServe is an open civic intelligence platform — data, journalism, and AI tools built to help residents, leaders, and organizations make better decisions about Napa County's future.
          </p>
        </div>

        {/* ── ABOUT ────────────────────────────────────────────────────────── */}
        <Section id="about" label="About NapaServe">

          <H>What this is</H>
          <P>
            NapaServe is a project of the <strong style={{ color: T.ink2 }}>Valley Works Collaborative</strong>, a regional organization focused on expanding Napa County's economic base beyond wine and hospitality. It's built on the belief that good decisions require good information — and that most communities don't have enough of either in one place.
          </P>
          <P>
            The platform combines three things: weekly economic data pulled directly from federal and state sources, nearly three years of original local journalism from <a href="https://napavalleyfeatures.substack.com" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa Valley Features</a>, and AI tools that help you work with all of it. The data pipeline runs every Monday. The journalism archive is searchable by semantic similarity — meaning you can ask it a question, not just a keyword.
          </P>
          <P>
            This is not a government website. It is not affiliated with Napa County, the City of Napa, or any public agency. It is a community project, maintained by a small team, built with the tools available to us.
          </P>

          <H>Who it's for</H>
          <P>
            Anyone who needs to understand what's actually happening in Napa County. That means county supervisors and planning commissioners who want a faster way to research project impacts. Journalists who want to check prior coverage before filing. Residents who want to know what the labor market looks like, or why housing is so constrained. Developers and investors who want economic context before proposing something.
          </P>
          <P>
            The tools are free. The data is public. The journalism is original.
          </P>

          <H>The tools</H>
          <div style={{ margin: "8px 0 32px" }}>
            <Tool name="Economic Dashboard" route="/dashboard" desc="Weekly snapshot of Napa County's economy — winery licenses, unemployment, home values, food services employment. Updated every Monday from federal and state sources." />
            <Tool name="Project Evaluator" route="/evaluator" desc="Submit any proposed project — a resort, a housing development, an innovation hub — and get a structural analysis across the Jobs · People · Place framework. AI-generated, intended as a discussion document." />
            <Tool name="NVF Archive Search" route="/archive" desc="Nearly 1,000 original articles from Napa Valley Features, searchable by meaning. Ask a question about lodging supply, water rights, the ag preserve, or any local topic — and find the coverage." />
            <Tool name="AI Policy Agent" route="/agent.html" isExternal desc="A research assistant grounded in the NVF archive and live web search. Ask hard questions about local policy, economy, or development. It cites its sources." />
            <Tool name="Event Finder" route="/events" desc="Community events across Napa County. Discover what's happening, filter by category, and submit your own event." />
            <Tool name="Napa Valley Features" route="/news" desc="The flagship publication — original reporting on Napa County economy, agriculture, land use, civic affairs, and community life." />
            <Tool name="Valley Works Collaborative" route="/valley-works" desc="The regional partnership network working to diversify Napa County's economy. Training pipelines, emerging industries, and the VWC mission." />
          </div>

          <H>About the data</H>
          <P>
            Economic data comes from the California Department of Alcoholic Beverage Control (ABC), the Federal Reserve Economic Data (FRED) system via the Bureau of Labor Statistics, the California Employment Development Department, and Zillow Research. It is pulled weekly via an automated pipeline and stored in Supabase. It is as accurate as those sources, with the caveats those sources carry.
          </P>
          <P>
            The journalism archive contains articles published on Napa Valley Features from May 2023 through the present. It is updated periodically. Older coverage predating May 2023 exists but is not yet in the search index.
          </P>
        </Section>

        {/* ── HOW TO USE ───────────────────────────────────────────────────── */}
        <Section id="how-to-use" label="How to Use This Site">

          <H>Start with a question</H>
          <P>
            Every tool on NapaServe is built around a question you're trying to answer. The best way to use the platform is to start with what you actually want to know.
          </P>
          <P>
            <em style={{ color: T.ink2 }}>What's happening with winery licenses?</em> → Economic Dashboard, Winery Licenses tab.<br />
            <em style={{ color: T.ink2 }}>What have we reported on Stanley Ranch?</em> → NVF Archive Search.<br />
            <em style={{ color: T.ink2 }}>What would a 75-room resort mean for St. Helena?</em> → Project Evaluator.<br />
            <em style={{ color: T.ink2 }}>What's the water situation in Napa County?</em> → AI Policy Agent.
          </P>

          <H>The Project Evaluator is a discussion document</H>
          <P>
            The Structural Compass scores any proposed project across 11 axes in the Jobs · People · Place framework. It is designed to surface tradeoffs and generate better questions — not to make decisions. The report it produces is AI-generated based on the answers you provide. It is a starting point, not a conclusion. Treat it like a smart first draft from a policy analyst who's read everything.
          </P>

          <H>The Archive Search thinks, not just matches</H>
          <P>
            NVF Archive Search uses semantic similarity — it finds articles that are <em>about</em> what you're looking for, not just articles that contain the words you typed. Try asking it a question in plain English. "What has been written about farmworker housing" will find relevant coverage even if those exact words don't appear together in any headline.
          </P>

          <H>The AI Policy Agent cites its sources</H>
          <P>
            The AI Agent searches the NVF archive and the live web before responding. Every answer should include source citations. If it doesn't cite something, treat the response with appropriate skepticism. It is a research tool, not an authority.
          </P>

          <H>Data freshness</H>
          <P>
            The economic pipeline runs every Monday morning. Data shown on the dashboard reflects the most recent Monday run. Some indicators (unemployment, home values) are reported monthly by their source agencies — the weekly pipeline captures the latest available, which may be 4–6 weeks behind the current date. The dashboard notes the data date on each section.
          </P>
        </Section>

        {/* ── DISCLAIMER ───────────────────────────────────────────────────── */}
        <Section id="disclaimer" label="Disclaimer">

          <H>What NapaServe is not</H>
          <P>
            NapaServe is not a government agency, not affiliated with Napa County or any city government, and has no official authority over land use, policy, or any other governmental function. Nothing on this platform constitutes legal advice, financial advice, or official government guidance.
          </P>

          <H>AI-generated content</H>
          <P>
            The Project Evaluator, AI Policy Agent, and NVF Archive Search all use AI to generate or retrieve information. AI-generated content can be wrong. It can misread data, miss context, or confuse similar topics. Every AI-generated report on this platform is labeled as such and is intended as a discussion document — a tool for thinking, not a final determination.
          </P>
          <P>
            NapaServe, Valley Works Collaborative, and VW Labs are not liable for decisions made based on AI-generated content from this platform. If you are making a significant decision — legal, financial, governmental, or otherwise — consult the relevant professionals and primary sources.
          </P>

          <H>Data accuracy</H>
          <P>
            Economic data is sourced from public federal and state agencies. We make every effort to display it accurately, but we are not the source of record. For official data, consult the issuing agency directly: the California ABC for winery licenses, BLS/FRED for labor data, Zillow Research for home values.
          </P>
          <P>
            Journalism in the NVF archive reflects the reporting and editorial judgment of Napa Valley Features at the time of publication. It may not reflect current conditions. Archive search results are ranked by semantic similarity, not editorial judgment.
          </P>

          <H>Contact</H>
          <P>
            Questions, corrections, or feedback: <a href="mailto:napaserve@gmail.com" style={{ color: T.accent }}>napaserve@gmail.com</a>
          </P>
          <P style={{ fontSize: 13, color: T.dim }}>
            NapaServe · A Valley Works Collaborative · VW Labs project · Napa County, CA · Not affiliated with Napa County government.
          </P>
        </Section>

        {/* SECTION NAV */}
        <div style={{ marginTop: 60, paddingTop: 32, borderTop: `1px solid ${T.rule}`, display: "flex", gap: 24, flexWrap: "wrap" }}>
          <a href="#about" style={{ fontSize: 12, fontWeight: 600, color: T.muted, textDecoration: "none", fontFamily: "'Source Sans 3',sans-serif" }}>About NapaServe</a>
          <a href="#how-to-use" style={{ fontSize: 12, fontWeight: 600, color: T.muted, textDecoration: "none", fontFamily: "'Source Sans 3',sans-serif" }}>How to use this site</a>
          <a href="#disclaimer" style={{ fontSize: 12, fontWeight: 600, color: T.muted, textDecoration: "none", fontFamily: "'Source Sans 3',sans-serif" }}>Disclaimer</a>
          <a href="mailto:napaserve@gmail.com" style={{ fontSize: 12, fontWeight: 600, color: T.accent, textDecoration: "none", fontFamily: "'Source Sans 3',sans-serif" }}>Contact us →</a>
        </div>

      </div>
    </div>
  );
}

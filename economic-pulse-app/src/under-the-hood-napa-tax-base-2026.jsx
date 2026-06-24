// UNDER THE HOOD — Napa County's Tax Base Holds as Its Largest Employers Shed Jobs
// -----------------------------------------------------------------
// Slug: napa-tax-base-2026
// Publication: Napa Valley Features
// Built by parity from napaserve-under-the-hood-population.jsx.
// CHARTS: static PNG <img> this round (NOT ChartOne/Two/Three canvas) — the
// underlying series are incomplete (Chart 1 crop line two points only).
// Canvas/interactive versions deferred to a later build.
// -----------------------------------------------------------------

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import useDraftGate from "./hooks/useDraftGate";
import DraftBanner from "./components/DraftBanner";

const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";

// ── ARTICLE METADATA ───────────────────────────────────────────────
const ARTICLE_SLUG = "napa-tax-base-2026";
const ARTICLE_TITLE = "Under the Hood: Napa County's Tax Base Holds as Its Largest Employers Shed Jobs";
const ARTICLE_DECK = "The county's 2024 winegrape crop fell 14.4% and its 10 largest employers shed a net 1,775 jobs since 2016, yet the assessed-value tax roll climbed to $55.77 billion.";
const ARTICLE_SUMMARY = "Napa County's assessed-value tax roll keeps climbing even as winegrape value and major-employer payrolls contract — a fiscal base increasingly anchored to real estate rather than the local wage economy.";
const ARTICLE_PUBLICATION = "Napa Valley Features";
const ARTICLE_DATE = "June 23, 2026"; // DRAFT byline date — confirm with Tim before publish-flip
const SHOW_DECK = true;
const EYEBROW = "Under the Hood";

// ── COUNTY + PUBLICATION (template-compat downstream constants) ────
const PUBLICATION = ARTICLE_PUBLICATION;
const SUBSTACK_URL = "https://napavalleyfocus.substack.com";

// ── THEME ──────────────────────────────────────────────────────────
const T = {
  bg: "#F5F0E8",
  surface: "#EDE8DE",
  ink: "#2C1810",
  accent: "#8B5E3C",
  gold: "#C4A050",
  muted: "#8B7355",
  border: "#D4C9B8",
  rule: "rgba(44,24,16,0.12)",
};
const font = "'Source Sans 3','Source Sans Pro',sans-serif";
const serif = "'Libre Baskerville',Georgia,serif";

const prose = {
  fontFamily: font,
  fontSize: 17,
  lineHeight: 1.75,
  color: T.ink,
  marginBottom: 18,
};

const h2style = {
  fontFamily: serif,
  fontSize: 22,
  fontWeight: 700,
  color: T.ink,
  marginTop: 32,
  marginBottom: 14,
};

// Aliases used in inline body prose
const P_STYLE = prose;
const SECTION_H2 = h2style;
const LINK = { color: T.accent };

// ── CAPTION ────────────────────────────────────────────────────────
function Caption({ title, description, sources = [] }) {
  return (
    <p style={{ fontFamily: font, fontSize: 13, color: T.muted, fontStyle: "italic", lineHeight: 1.55, margin: "14px 0 0", maxWidth: 680 }}>
      <strong style={{ fontWeight: 700, fontStyle: "italic" }}>{title}.</strong>{" "}
      {description}{" "}
      {sources.length > 0 && (
        <>
          Source:{" "}
          {sources.map((s, i) => (
            <span key={i}>
              {s.url
                ? <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>{s.label}</a>
                : <span>{s.label}</span>}
              {i < sources.length - 1 ? "; " : "."}
            </span>
          ))}
        </>
      )}
    </p>
  );
}

// ── STATIC CHART (PNG <img>, not canvas — see file header) ─────────
function StaticChart({ src, title, children }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>{title}</h2>
      <div style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ overflowX: "auto" }}>
          <img src={src} alt={title} style={{ maxWidth: "100%", height: "auto", display: "block" }} />
        </div>
      </div>
      <a
        href={src}
        download
        style={{ display: "inline-block", padding: "4px 12px", fontFamily: "monospace", fontSize: 11, fontWeight: 400, letterSpacing: "0.88px", color: T.muted, background: "transparent", border: `1px solid ${T.border}`, borderRadius: 3, textDecoration: "none", marginTop: 12 }}
      >
        DOWNLOAD CHART PNG
      </a>
      {children}
    </div>
  );
}

// ── LIVE POLL ──────────────────────────────────────────────────────
function LivePoll({ poll }) {
  const [voted, setVoted] = useState(null);
  const [counts, setCounts] = useState(poll.counts || {});
  const [total, setTotal] = useState(poll.total || 0);
  const [loading, setLoading] = useState(false);
  const vote = async (idx) => {
    if (voted !== null || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${WORKER}/api/article-poll-vote`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poll_id: poll.id, option_index: idx }),
      });
      const data = await res.json();
      if (data.success) { setCounts(data.counts); setTotal(data.total); setVoted(idx); }
    } catch (e) { /* swallow */ }
    setLoading(false);
  };
  return (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "20px 20px 16px", marginBottom: 16 }}>
      <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.1em", color: T.gold, fontWeight: 700, textTransform: "uppercase", margin: "0 0 8px 0" }}>Poll</p>
      <p style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: T.ink, margin: "0 0 14px 0", lineHeight: 1.4 }}>{poll.question}</p>
      {poll.options.map((opt, idx) => {
        const count = counts[idx] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const isVoted = voted === idx;
        return (
          <div key={idx} style={{ marginBottom: 8 }}>
            {voted === null ? (
              <button onClick={() => vote(idx)} disabled={loading}
                style={{ width: "100%", textAlign: "center", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, padding: "9px 12px", fontFamily: font, fontSize: 14, color: T.ink, cursor: loading ? "default" : "pointer" }}>
                {opt}
              </button>
            ) : (
              <div style={{ position: "relative", overflow: "hidden", borderRadius: 4, border: `1px solid ${isVoted ? T.accent : T.border}` }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: pct + "%", background: isVoted ? "rgba(139,94,60,0.15)" : "rgba(139,94,60,0.06)", transition: "width 0.5s ease" }} />
                <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px" }}>
                  <span style={{ fontFamily: font, fontSize: 14, color: T.ink, fontWeight: isVoted ? 600 : 400 }}>{opt}</span>
                  <span style={{ fontFamily: font, fontSize: 13, color: T.muted, marginLeft: 12, whiteSpace: "nowrap" }}>{pct}%</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {voted !== null && <p style={{ fontFamily: font, fontSize: 12, color: T.muted, margin: "10px 0 0 0" }}>{total} {total === 1 ? "vote" : "votes"} {"·"} Results update in real time</p>}
    </div>
  );
}

// ── POLLS SECTION ──────────────────────────────────────────────────
function PollsSection({ slug }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${WORKER}/api/article-polls?slug=${slug}`)
      .then(r => r.json())
      .then(data => { setPolls(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);
  if (loading) return <div style={{ padding: "24px 0", fontFamily: font, fontSize: 14, color: T.muted }}>Loading polls...</div>;
  if (!polls.length) return null;
  return (
    <div style={{ borderTop: `2px solid ${T.border}`, marginTop: 48, paddingTop: 32 }}>
      <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.1em", color: T.gold, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px 0" }}>{"Today’s Polls"}</p>
      <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 20px 0" }}>What do you think?</h2>
      {polls.map(poll => <LivePoll key={poll.id} poll={poll} />)}
      <p style={{ fontFamily: font, fontSize: 12, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>
        Poll results are anonymous and stored on NapaServe. Results shown after you vote.{" "}
        Historical reader polls from {PUBLICATION} on Substack are searchable in the{" "}
        <a href="/dashboard" style={{ color: T.accent }}>Community Pulse dashboard</a>.
      </p>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────
export default function UnderTheHoodNapaTaxBase2026() {
  const navigate = useNavigate();
  const handleBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/under-the-hood"));
  const gate = useDraftGate('napa-tax-base-2026');
  const isDraft = gate.status === "draft";

  useEffect(() => {
    if (gate.status === "redirect") navigate("/under-the-hood");
  }, [gate.status, navigate]);

  if (gate.status === "loading") {
    return (
      <div style={{ background: T.bg, minHeight: "100vh" }}>
        <NavBar />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 20px" }}>
          <p style={{ ...prose, color: T.muted }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      {isDraft && <DraftBanner />}
      <NavBar />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: isDraft ? "80px 20px 60px" : "60px 20px 60px" }}>

        {/* ── BACK ───────────────────────────────────────────────── */}
        <button onClick={handleBack} style={{ fontFamily: font, fontSize: 14, color: T.muted, background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "none", marginBottom: 12 }}>
          ← Back
        </button>

        {/* ── EYEBROW ───────────────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          {EYEBROW} {"·"} {ARTICLE_PUBLICATION}
        </p>

        {/* ── HEADLINE ──────────────────────────────────────────────── */}
        <h1 style={{ fontFamily: serif, fontSize: 34, fontWeight: 700, color: T.ink, lineHeight: 1.25, marginBottom: 16 }}>
          {ARTICLE_TITLE}
        </h1>

        {/* ── BYLINE + DATE ─────────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.muted, marginBottom: 16 }}>
          By Tim Carl {"·"} {ARTICLE_DATE}
        </p>

        {/* ── DECK ──────────────────────────────────────────────────── */}
        {SHOW_DECK && (
          <p style={{ fontFamily: serif, fontSize: 18, color: T.muted, lineHeight: 1.6, marginBottom: 24, fontStyle: "italic" }}>
            {ARTICLE_DECK}
          </p>
        )}

        {/* ── SUBSTACK LINK ─────────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 13, color: T.muted, marginBottom: 32, borderBottom: `1px solid ${T.border}`, paddingBottom: 20 }}>
          Read on{" "}
          <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>
            {ARTICLE_PUBLICATION} on Substack {"→"}
          </a>
        </p>

        {/* ── ARTICLE SUMMARY ───────────────────────────────────────── */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "16px 20px", marginBottom: 32 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Article Summary</p>
          <p style={{ ...prose, fontSize: 15, marginBottom: 0 }}>
            {ARTICLE_SUMMARY}
          </p>
        </div>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* LEDE                                                          */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <p style={{ ...P_STYLE, marginBottom: 18 }}>
          <strong>NAPA VALLEY, Calif.</strong> {"—"} The value of Napa County’s 2024 winegrape crop fell to $1.0 billion, a 14.4% drop from the record $1.2 billion of the prior year, according to the county Agricultural Commissioner’s 2024 Annual Crop Report. Total tonnage declined 13.8%, and the average price per ton slipped to $7,005 {"—"} still nearly seven times the statewide average of $1,021. Winegrapes accounted for 99.6% of the value of all agricultural production in the county.
        </p>

        <p style={P_STYLE}>
          Over the same period, the county’s total taxable assessed value climbed to $55.77 billion and property tax revenue rose 5.6% to $191.26 million, according to Napa County’s fiscal 2024-25 <a href="https://www.countyofnapa.org/1353/Annual-Comprehensive-Financial-Reports" target="_blank" rel="noopener noreferrer" style={LINK}>Annual Comprehensive Financial Report</a>. The space between a shrinking crop and a growing tax roll is the question this column first raised in 2024: how much of the county’s stability rests on a single industry, and what is happening beneath the surface as that industry’s numbers move.
        </p>

        <StaticChart
          src="/charts/napa-tax-base-2026-chart-1.png"
          title="Napa County’s Tax Roll Climbs as Its Winegrape Crop Cools"
        >
          <Caption
            title="Napa County’s Tax Roll Climbs as Its Winegrape Crop Cools"
            description={"Total taxable assessed value rose every year from 2016 to 2025, reaching $55.77 billion, while the 2024 winegrape crop fell 14.4% to $1.0 billion."}
            sources={[
              { label: "Napa County FY 2024-25 ACFR", url: "" },
              { label: "Napa County Agricultural Commissioner 2024 Crop Report", url: "" },
            ]}
          />
        </StaticChart>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — A CONCENTRATED TAX BASE                             */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>A Concentrated Tax Base</h2>

        <p style={P_STYLE}>
          The county’s largest taxpayers remain heavily clustered in wine, wine-related real estate and hospitality. Of the 10 largest property taxpayers in 2024-25, only Pacific Gas &amp; Electric Company {"—"} the top payer at $725.99 million in assessed value, or 1.30% of the county total {"—"} sits clearly outside that group.
        </p>

        <p style={P_STYLE}>
          The remaining nine read as a roster of the wine economy and its property: Global Ag Properties/SPP Napa Vineyards, Robert Mondavi Properties under Constellation, Boardwalk Investments Yountville, E. &amp; J. Gallo Winery, Heitz Wine Cellars, SRGA LP {"—"} the entity behind the Stanly Ranch resort in Carneros {"—"} Meritage Resort, Realty Income Properties 2 under Diageo and Treasury Wine Estates Americas. One of those 10, the Stanly Ranch resort, went into foreclosure in March 2026 {"—"} its hotel sold for $195 million {"—"} a reminder that even the hospitality names anchoring the tax roll aren’t immune to the reset.
        </p>

        <p style={P_STYLE}>
          Together the top 10 represent 6.40% of the county’s total taxable assessed value, up from 6.15% nine years earlier. The base beneath them has grown substantially {"—"} total assessed value of $55.77 billion is up from $32.87 billion in 2015-16, an increase of roughly 70% over nine years built largely on rising real estate values rather than on the local wage economy.
        </p>

        <StaticChart
          src="/charts/napa-tax-base-2026-chart-2.png"
          title="Napa County’s 10 Largest Property Taxpayers, 2024-25"
        >
          <Caption
            title="Napa County’s 10 Largest Property Taxpayers, 2024-25"
            description={"Nine of the 10 largest taxpayers sit in wine, vineyard real estate or hospitality; only PG&E falls outside that cluster."}
            sources={[
              { label: "Napa County FY 2024-25 ACFR, Auditor-Controller’s Office", url: "" },
            ]}
          />
        </StaticChart>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — THE JOBS ARE THINNING                               */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>The Jobs Are Thinning</h2>

        <p style={P_STYLE}>
          The county’s tax roll has climbed, but its largest employers have been shedding jobs. Napa County’s 10 largest employers accounted for 9,946 jobs in 2024-25, down from 11,721 nine years earlier {"—"} a net loss of 1,775 positions among the county’s biggest workplaces, even as total countywide employment edged up to 75,500.
        </p>

        <p style={P_STYLE}>
          The wine industry’s footprint among those employers narrowed the most. Treasury Wine Estates reported 1,119 employees in 2015-16; its 2024-25 figure of 425 is well under half that {"—"} a decline that tracks the company’s years-long restructuring of its U.S. business: divesting commercial brands, selling Central Coast wineries and consolidating luxury production at its St. Helena facility. Health-care employers contracted as well: Adventist Health St. Helena fell from 1,391 to 610, and the Veterans’ Home of California from 1,000 to 735.
        </p>

        <p style={P_STYLE}>
          The list is still led by government and health care {"—"} Napa State Hospital, the County of Napa, the Napa Valley Unified School District and Providence Queen of the Valley {"—"} not by wineries. The 10 largest employers’ share of total county employment fell from 15.96% to 13.17% over the nine years.
        </p>

        <StaticChart
          src="/charts/napa-tax-base-2026-chart-3.png"
          title="Napa County’s Largest Employers, 2016 vs. 2024-25"
        >
          <Caption
            title="Napa County’s Largest Employers, 2016 vs. 2024-25"
            description={"The 10 largest employers shed a net 1,775 jobs since 2016, from 11,721 to 9,946, with the wine industry’s footprint contracting sharply — Treasury Wine Estates fell from 1,119 to 425."}
            sources={[
              { label: "Napa County FY 2024-25 ACFR, Principal Employers schedule", url: "" },
            ]}
          />
        </StaticChart>

        <p style={P_STYLE}>
          The contraction has continued into 2026. The county’s civilian labor force fell roughly 4.1% year over year, from about 75,100 in January 2025 to 72,000 in January 2026, as documented in <em><a href="/under-the-hood/napa-population-2025" style={LINK}>Under the Hood: Napa County Shrunk as Calistoga Grew and the Base Faltered</a></em> (May 14, 2026). That piece also recorded the elimination of 135 manufacturing jobs at American Canyon’s Coca-Cola bottling plant in the same fiscal year the ACFR covers.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — THE TOURISM SIGNAL STAYS SOFT                       */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>The Tourism Signal Stays Soft</h2>

        <p style={P_STYLE}>
          Transient occupancy tax {"—"} the lodging levy that serves as the county’s clearest read on visitor spending {"—"} was essentially flat. The county collected $13.10 million in TOT in fiscal 2024-25, down 0.5% from the prior year. That continues the pattern flagged in the June 2024 installment, when TOT had fallen 7.8% the year before. Two years on, the revenue has not rebounded; it has leveled off below its earlier peak. For a county whose hospitality sector is built around wine tourism, a flat lodging levy alongside a 14.4% drop in crop value and a contracting employer base is a pairing worth watching.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SECTION — A BALANCE SHEET THAT HOLDS                          */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 style={SECTION_H2}>A Balance Sheet That Holds</h2>

        <p style={P_STYLE}>
          For all the movement in wine, jobs and tourism, the county’s finances stayed sound. Napa County’s total net position rose $27.4 million, or 4.0%, to $714.73 million in fiscal 2024-25. Governmental funds reported combined balances of $550.5 million, an increase of $2.5 million over the prior year.
        </p>

        <p style={P_STYLE}>
          Beneath that aggregate, the picture is more mixed. The General Fund’s total balance fell $18.2 million, or 8.2%, to $204.7 million, and its unrestricted balance of $53.4 million equals 23.6% of General Fund expenditures {"—"} sound, the report notes, but below the five-year average of 41.2%. The General Reserve stood at $64.6 million, and General Fund debt service fell to effectively zero, the lowest in more than two decades.
        </p>

        <p style={P_STYLE}>
          The county’s books balance. They have for years. The harder question is what an assessed-value tax roll rests on when the crop beneath it is shrinking, the industry that anchors the tax base is cutting payroll and the county’s largest employers are collectively smaller than they were a decade ago. A tax base that keeps climbing on real estate while the local wage economy contracts is not the same thing as an economy that is growing {"—"} and the distance between those two numbers is where the next several years will be decided.
        </p>

        {/* ── BYLINE (italic) ─────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.ink, fontStyle: "italic", lineHeight: 1.65, margin: "32px 0 0 0" }}>
          Tim Carl is a Napa Valley-based photojournalist.
        </p>

        {/* ── POLLS SECTION (per spec ordering: directly after byline) ── */}
        <PollsSection slug={ARTICLE_SLUG} />

        {/* ── RELATED COVERAGE ────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 48, paddingTop: 28, marginBottom: 28 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center", marginBottom: 20 }}>
            Related Coverage
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-valleys-growing" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Napa Valley’s Growing Reliance on the Wine Industry{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (June 1, 2024)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="/under-the-hood/napa-population-2025" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Napa County Shrunk as Calistoga Grew and the Base Faltered{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (May 14, 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-has-equaled" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: More Rooms Has Equaled Fewer Jobs in Napa County{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (August 23, 2025)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-jobs-lag-as-napas" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Jobs Lag as Napa’s Wine and Tourism Economy Falters{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (December 13, 2025)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-valleys-economy" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Napa Valley’s Economy Looks Bigger Than It Is{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (March 2026)</span>
            </li>
          </ul>
        </div>

        {/* ── ARCHIVE SEARCH ──────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 28, paddingTop: 28, marginBottom: 28 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Archive
          </p>
          <h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 700, color: T.ink, margin: "0 0 8px 0" }}>Search the Archive</h2>
          <p style={{ fontFamily: font, fontSize: 15, color: T.muted, marginBottom: 16 }}>
            Search 1,000+ articles and reports from {ARTICLE_PUBLICATION}.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              placeholder="Search tax base, assessed value, employers, ACFR, winegrape crop..."
              style={{ flex: 1, padding: "10px 14px", fontFamily: font, fontSize: 15, color: T.ink, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 3, outline: "none" }}
              onKeyDown={(e) => { if (e.key === "Enter" && e.target.value.trim()) { window.location.href = `/archive?q=${encodeURIComponent(e.target.value.trim())}`; } }}
            />
            <button
              onClick={(e) => { const input = e.currentTarget.previousElementSibling; if (input.value.trim()) { window.location.href = `/archive?q=${encodeURIComponent(input.value.trim())}`; } }}
              style={{ padding: "10px 20px", fontFamily: font, fontSize: 15, fontWeight: 600, color: "#FFFFFF", background: T.accent, border: "none", borderRadius: 3, cursor: "pointer" }}
            >
              Search
            </button>
          </div>
        </div>

        {/* ── METHODOLOGY ─────────────────────────────────────────── */}
        <div style={{ borderTop: `2px solid ${T.border}`, paddingTop: 28, marginTop: 40 }}>
          <h3 style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: T.ink, margin: "0 0 10px" }}>Methodology</h3>
          <p style={{ fontFamily: font, fontSize: 14, color: T.muted, lineHeight: 1.7, fontStyle: "italic" }}>
            Crop figures are calendar-year 2024 (Napa County Agricultural Commissioner); fiscal figures are FY 2024-25 (Napa County ACFR). Chart 1’s crop line shows 2023-24 only pending the full Agricultural-Commissioner series. SRGA LP is the ownership entity for the Stanly Ranch resort (hospitality). Principal-employer counts are as reported by each company in the county’s ACFR schedule; year-to-year changes can reflect reporting differences as well as actual headcount.
          </p>
        </div>

        {/* ── SOURCES ─────────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 40, paddingTop: 24 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: T.ink, marginBottom: 16 }}>Sources</h2>
          <ol style={{ fontFamily: font, fontSize: 14, color: T.ink, lineHeight: 1.75, paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}><a href="https://www.countyofnapa.org/1353/Annual-Comprehensive-Financial-Reports" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa County FY 2024-25 Annual Comprehensive Financial Report (countyofnapa.org)</a>.</li>
            <li style={{ marginBottom: 8 }}>Napa County Agricultural Commissioner 2024 Annual Crop Report.</li>
            <li style={{ marginBottom: 8 }}>Napa County Auditor-Controller’s Office (10 Largest Taxpayers schedule).</li>
            <li style={{ marginBottom: 8 }}>Napa County FY 2024-25 ACFR, Principal Employers schedule.</li>
            <li style={{ marginBottom: 8 }}>California EDD / DOF labor-force estimates (Jan. 2025{"–"}Jan. 2026).</li>
            <li style={{ marginBottom: 8 }}><a href="https://napavalleyregister.com/news/napa-hotel-foreclosure-stanly-ranch-auberge-group/article_af89ef60-2410-4a75-9338-20c9baaf707e.html" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa Valley Register, Stanly Ranch foreclosure (SRGA LP)</a>.</li>
            <li style={{ marginBottom: 8 }}><a href="https://www.thedrinksbusiness.com/2026/06/treasury-cuts-brands-in-bid-to-revive-growth/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>The Drinks Business, Treasury Wine Estates U.S. restructuring (June 2026)</a>.</li>
          </ol>
        </div>

      </div>

      <Footer />
    </div>
  );
}

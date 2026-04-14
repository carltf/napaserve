import { useState, useEffect } from "react";
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

const SUPABASE_URL = "https://csenpchwxxepdvjebsrt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_r-Ntp7zKRrH3JIVAjTKYmA_0szFdYGJ";
const RAG_URL = "https://misty-bush-fc93.tfcarl.workers.dev/api/rag-search";

const TOPIC_CHIPS = [
  "Economy & Jobs",
  "Wine & Hospitality",
  "Housing & Development",
  "Environment & Agriculture",
  "Government & Policy",
  "Community & Culture",
];

/* ── Slug-to-route map for native UTH articles ────────────────────────────── */
const SLUG_ROUTES = {
  "napa-supply-chain-2026": "/under-the-hood/napa-supply-chain-2026",
  "napa-gdp-2024": "/under-the-hood/napa-gdp-2024",
  "napa-cab-2025": "/under-the-hood/napa-cab-2025",
  "sonoma-cab-2025": "/under-the-hood/sonoma-cab-2025",
  "lake-county-cab-2025": "/under-the-hood/lake-county-cab-2025",
};

/* ── Static sections for publications without DB rows yet ─────────────────── */
const STATIC_SECTIONS = {
  "Sonoma County Features": {
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
  "Lake County Features": {
    label: "Lake County Features",
    desc: "Coverage of Lake County's agriculture, economy and community.",
    tiles: [
      {
        title: "Lake County Grape Prices Have Fallen 38% in Two Years",
        date: "March 21, 2026",
        tag: "Lake County Features",
        href: "/under-the-hood/lake-county-cab-2025",
        live: true,
      },
    ],
  },
};

function buildSections(publishedArticles) {
  const nvfTiles = publishedArticles
    .filter(a => a.publication === "Napa Valley Features")
    .map(a => ({
      title: a.title,
      date: a.published_at ? new Date(a.published_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "",
      tag: a.publication,
      href: SLUG_ROUTES[a.slug] || `/under-the-hood/${a.slug}`,
      live: true,
    }));

  return [
    {
      label: "Napa Valley Features",
      desc: "Data-driven analysis of Napa County's economy, wine industry, housing and workforce.",
      tiles: nvfTiles.length > 0 ? nvfTiles : [
        { title: "Napa\u2019s Economy Looks Bigger Than It Is", date: "March 2026", tag: "Napa Valley Features", href: "/under-the-hood/napa-gdp-2024", live: true },
        { title: "2025 Napa Grape Prices Slip After a Record High", date: "March 19, 2026", tag: "Napa Valley Features", href: "/under-the-hood/napa-cab-2025", live: true },
      ],
    },
    STATIC_SECTIONS["Sonoma County Features"],
    STATIC_SECTIONS["Lake County Features"],
  ];
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function stripPrefix(title) {
  return (title || "").replace(/^Under the Hood:\s*/i, "");
}

function dedupeArticles(rows) {
  const seen = new Set();
  return rows.filter(r => {
    if (!r.post_title || seen.has(r.post_title)) return false;
    seen.add(r.post_title);
    return true;
  });
}

/* ── Poll card ────────────────────────────────────────────────────────────── */
function PollCard({ poll }) {
  const rawOpts = typeof poll.options_json === "string"
    ? (() => { try { return JSON.parse(poll.options_json); } catch { return []; } })()
    : (poll.options_json || []);
  const opts = (Array.isArray(rawOpts) ? rawOpts : []).filter(o => o && (o.label || o.text));
  const maxVotes = Math.max(...opts.map(o => Number(o.votes) || 0), 1);
  const url = poll.substack_url && poll.substack_url.trim();

  return (
    <div style={{ background: T.bg, border: "1px solid rgba(44,24,16,0.08)", padding: "18px 20px" }}>
      <div style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: T.ink, lineHeight: 1.4, marginBottom: 12 }}>{poll.question}</div>
      {opts.map((opt, oi) => {
        const votes = Number(opt.votes) || 0;
        const pct = poll.total_votes > 0 ? ((votes / poll.total_votes) * 100) : 0;
        const isWinner = votes === maxVotes && votes > 0;
        return (
          <div key={oi} style={{ marginBottom: oi < opts.length - 1 ? 8 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 13, fontWeight: isWinner ? 700 : 400, color: isWinner ? T.ink : "#7A6A50", fontFamily: font }}>{opt.text || opt.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: isWinner ? T.gold : "#A89880", fontFamily: "monospace", whiteSpace: "nowrap", marginLeft: 8 }}>{pct.toFixed(1)}% ({votes})</span>
            </div>
            <div style={{ height: 18, background: T.surface, border: "1px solid rgba(44,24,16,0.06)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: isWinner ? T.gold : "#A89880", opacity: isWinner ? 0.7 : 0.25, transition: "width .3s ease" }} />
            </div>
          </div>
        );
      })}
      <div style={{ fontSize: 14, color: T.muted, marginTop: 10, fontFamily: font, lineHeight: 1.5 }}>
        {(poll.total_votes || 0).toLocaleString()} votes{poll.post_title && <>{" \u00b7 from "}{url ? <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${poll.post_title}, opens in new tab`} style={{ color: T.gold, textDecoration: "none", fontWeight: 600 }}>{poll.post_title} \u2197</a> : <span style={{ fontStyle: "italic", color: "#7A6A50" }}>{poll.post_title}</span>}</>}{poll.published_at && ` \u00b7 ${new Date(poll.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════════════ */
export default function UnderTheHoodIndex() {
  const [allArticles, setAllArticles] = useState([]);
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [readerPolls, setReaderPolls] = useState([]);
  const [archiveView, setArchiveView] = useState("year");
  const [topicArticles, setTopicArticles] = useState({});

  // Fetch published articles from Worker
  useEffect(() => {
    fetch(`${RAG_URL.replace("/api/rag-search", "")}/api/articles?published=true`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setPublishedArticles(Array.isArray(data) ? data : []); setSectionsLoading(false); })
      .catch(() => setSectionsLoading(false));
  }, []);

  const sections = buildSections(publishedArticles);

  // 1. Fetch full archive (up to 300)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/nvf_polls?select=post_title,substack_url,published_at&post_title=ilike.%25under%20the%20hood%25&order=published_at.desc&limit=300`,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
        );
        if (res.ok) {
          setAllArticles(dedupeArticles(await res.json()));
        }
      } catch { /* silent */ }
    })();
  }, []);

  // 4. Fetch Reader Pulse polls (Under the Hood, 10+ votes, most recent)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/nvf_polls?select=poll_id,post_title,question,options_json,total_votes,published_at,substack_url&post_title=ilike.%25under%20the%20hood%25&total_votes=gte.10&order=published_at.desc&limit=3`,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
        );
        if (res.ok) setReaderPolls(await res.json());
      } catch { /* silent */ }
    })();
  }, []);

  // 5. Fetch topic groupings for BY TOPIC view
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/nvf_polls?select=post_title,substack_url,published_at,theme&post_title=ilike.%25under%20the%20hood%25&theme=not.is.null&order=published_at.desc&limit=300`,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
        );
        if (res.ok) {
          const rows = await res.json();
          const grouped = {};
          TOPIC_CHIPS.forEach(t => { grouped[t] = []; });
          const seen = {};
          rows.forEach(r => {
            const theme = r.theme;
            if (!theme || !grouped[theme]) return;
            const key = `${theme}::${r.post_title}`;
            if (seen[key]) return;
            seen[key] = true;
            grouped[theme].push(r);
          });
          setTopicArticles(grouped);
        }
      } catch { /* silent */ }
    })();
  }, []);

  // Group archive by year
  const archiveByYear = {};
  allArticles.forEach(a => {
    const yr = a.published_at ? new Date(a.published_at).getFullYear() : "Unknown";
    if (!archiveByYear[yr]) archiveByYear[yr] = [];
    archiveByYear[yr].push(a);
  });
  const years = Object.keys(archiveByYear).sort((a, b) => b - a);

  const doSearch = async (query) => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchResults(null);
    try {
      const res = await fetch(RAG_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), matchCount: 5 }),
      });
      if (res.ok) {
        const data = await res.json();
        const chunks = (data.results || data.matches || data || [])
          .filter(c => (c.title || c.post_title || "").toLowerCase().includes("under the hood"));
        setSearchResults(chunks);
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doSearch(searchQuery);
  };

  const handleChipClick = (topic) => {
    setSearchQuery(topic);
    doSearch(topic);
  };

  const ArchiveRow = ({ a, i }) => (
    <div
      key={i}
      style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        padding: "10px 0", borderBottom: "1px solid rgba(44,24,16,0.06)",
        gap: 12,
      }}
    >
      <a
        href={a.substack_url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 15, fontWeight: 600, color: "#2C1810", lineHeight: 1.4, flex: 1, textDecoration: "none", font: "inherit" }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
      >
        {stripPrefix(a.post_title)}
      </a>
      <span style={{ fontSize: 13, color: T.muted, whiteSpace: "nowrap", flexShrink: 0 }}>
        {fmtDate(a.published_at)}
      </span>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: font, color: T.ink }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <NavBar />

      <div id="main-content" style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 60px" }}>

        {/* ── 1. BREADCRUMB ──────────────────────────────────────── */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: T.muted, textTransform: "uppercase", marginBottom: 8 }}>
          NapaServe · Under the Hood
        </div>

        {/* ── 2. HERO ────────────────────────────────────────────── */}
        <h1 style={{ fontFamily: serif, fontSize: "2.4rem", fontWeight: 700, color: T.ink, margin: "0 0 10px", lineHeight: 1.2 }}>
          Under the Hood
        </h1>
        <p style={{ fontSize: 17, color: T.muted, lineHeight: 1.7, margin: "0 0 40px", maxWidth: 640 }}>
          Interactive, data-driven articles from across Napa, Sonoma and Lake counties — with live charts powered by community data.
        </p>

        {/* ── 3. PUBLICATION SECTIONS (hero tiles) ───────────────── */}
        {sections.map((section, si) => (
          <div key={si} style={{ marginBottom: 44 }}>
            <div style={{ borderBottom: `1px solid ${T.rule}`, paddingBottom: 10, marginBottom: 18 }}>
              <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: 0, lineHeight: 1.3 }}>
                {section.label}
              </h2>
              <p style={{ fontSize: 14, color: T.muted, margin: "4px 0 0", lineHeight: 1.5 }}>{section.desc}</p>
            </div>

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
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: T.gold }}>{tile.tag}</span>
                      {tile.live && (
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4CAF50", display: "inline-block", flexShrink: 0 }} title="Live" />
                      )}
                    </div>
                    <div style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: T.ink, lineHeight: 1.35, marginBottom: 8 }}>
                      {tile.title}
                    </div>
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

        {/* ── 4. SEARCH THE ARCHIVE ──────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: T.muted, textTransform: "uppercase", marginBottom: 10 }}>
            Search the Archive
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Under the Hood articles..."
              style={{
                flex: 1, padding: "12px 16px", fontSize: 15, fontFamily: font,
                background: T.surface, border: "1px solid rgba(44,24,16,0.15)", borderRadius: 6,
                color: T.ink, outline: "none",
              }}
            />
            <button type="submit" style={{
              padding: "12px 20px", fontSize: 13, fontWeight: 700, fontFamily: font,
              background: T.accent, color: T.bg, border: "none", borderRadius: 6, cursor: "pointer",
              letterSpacing: 1, textTransform: "uppercase",
            }}>Search</button>
          </form>

          {searching && (
            <div style={{ padding: "20px 0", textAlign: "center" }}>
              <div style={{ width: 24, height: 24, border: "2px solid rgba(139,94,60,0.3)", borderTopColor: T.accent, borderRadius: "50%", animation: "uth-spin 1s linear infinite", margin: "0 auto 10px" }} />
              <style>{`@keyframes uth-spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ fontSize: 14, color: T.muted, margin: 0 }}>Searching...</p>
            </div>
          )}

          {searchResults !== null && !searching && (
            <div style={{ marginTop: 16 }}>
              {searchResults.length === 0 ? (
                <p style={{ fontSize: 14, color: T.muted }}>No Under the Hood results found. Try a different query.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {searchResults.map((chunk, i) => {
                    const score = chunk.similarity ? `${Math.round(chunk.similarity * 100)}%` : null;
                    return (
                      <div key={i} style={{ background: T.surface, border: "1px solid rgba(44,24,16,0.1)", padding: "16px 18px", position: "relative" }}>
                        {score && (
                          <span style={{
                            position: "absolute", top: 12, right: 14,
                            fontSize: "0.7rem", color: T.accent, background: "rgba(44,24,16,0.1)",
                            padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap", fontWeight: 600,
                          }}>{score}</span>
                        )}
                        <a
                          href={chunk.url || chunk.substack_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: T.ink, textDecoration: "none", lineHeight: 1.4, paddingRight: score ? 50 : 0 }}
                        >
                          {chunk.title || chunk.post_title || "Under the Hood"}
                        </a>
                        {chunk.published_at && (
                          <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{fmtDate(chunk.published_at)}</div>
                        )}
                        <p style={{ fontSize: 14, color: "#7A6A50", lineHeight: 1.6, margin: "8px 0 0", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {chunk.content || chunk.text || chunk.chunk_text || ""}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 5. BROWSE BY TOPIC ──────────────────────────────────── */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: T.muted, textTransform: "uppercase", marginBottom: 10 }}>
            Browse by Topic
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TOPIC_CHIPS.map(topic => (
              <button
                key={topic}
                onClick={() => handleChipClick(topic)}
                style={{
                  padding: "8px 16px", fontSize: 13, fontWeight: 600, fontFamily: font,
                  background: T.surface, border: "1px solid rgba(139,94,60,0.25)", color: T.accent,
                  borderRadius: 20, cursor: "pointer", transition: "all 0.15s",
                }}
              >{topic}</button>
            ))}
          </div>
        </div>

        {/* ── 6. RECENT UNDER THE HOOD ARTICLES ──────────────── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: T.muted, textTransform: "uppercase", marginBottom: 14 }}>
            Recent Under the Hood
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {(publishedArticles.length > 0
              ? publishedArticles.map(a => ({
                  title: a.title,
                  pub: a.publication,
                  date: a.published_at ? new Date(a.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "",
                  href: SLUG_ROUTES[a.slug] || `/under-the-hood/${a.slug}`,
                }))
              : [
                  { title: "Napa\u2019s Economy Looks Bigger Than It Is", pub: "Napa Valley Features", date: "March 2026", href: "/under-the-hood/napa-gdp-2024" },
                  { title: "Napa Cabernet Prices Break the Growth Curve", pub: "Napa Valley Features", date: "March 19, 2026", href: "/under-the-hood/napa-cab-2025" },
                  { title: "Sonoma Grape Prices Fall for a Second Year", pub: "Sonoma County Features", date: "March 21, 2026", href: "/under-the-hood/sonoma-cab-2025" },
                  { title: "Lake County Grape Prices Have Fallen 38% in Two Years", pub: "Lake County Features", date: "March 21, 2026", href: "/under-the-hood/lake-county-cab-2025" },
                ]
            ).map((a, i) => (
              <div key={i} style={{ background: T.surface, border: "1px solid rgba(44,24,16,0.1)", padding: "20px 22px" }}>
                <div style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: T.ink, lineHeight: 1.35, marginBottom: 6 }}>
                  {a.title}
                </div>
                <div style={{ fontSize: 13, color: T.muted, marginBottom: 10 }}>{a.pub} · {a.date}</div>
                <a
                  href={a.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: T.gold, textDecoration: "none" }}
                >Read on Substack →</a>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. READER PULSE ────────────────────────────────────── */}
        {readerPolls.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: T.muted, textTransform: "uppercase", marginBottom: 4 }}>
              Reader Pulse
            </div>
            <p style={{ fontSize: 14, color: "#7A6A50", margin: "0 0 14px", fontFamily: font }}>
              What readers said in recent Under the Hood polls
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {readerPolls.map(poll => <PollCard key={poll.poll_id} poll={poll} />)}
            </div>
          </div>
        )}

        {/* ── 7b. MODELS & CALCULATORS ────────────────────────────── */}
        <div style={{ marginBottom: 40 }}>
          <a href="/under-the-hood/calculators" style={{ display: "block", background: T.surface, border: "1px solid rgba(44,24,16,0.1)", padding: "22px 24px", textDecoration: "none" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: T.gold, textTransform: "uppercase", marginBottom: 6 }}>Interactive Tools</div>
            <div style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, color: T.ink, marginBottom: 6 }}>Models &amp; Calculators</div>
            <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.5 }}>Vineyard acre impact, wine industry contraction, supply shock estimator, asset repricing scenarios and a regional contraction tracker — built from the data behind the series.</div>
          </a>
        </div>

        {/* ── 8. FULL ARCHIVE ────────────────────────────────────── */}
        {(years.length > 0 || Object.values(topicArticles).some(a => a.length > 0)) && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: T.muted, textTransform: "uppercase" }}>
                Full Archive
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {["year", "topic"].map(v => (
                  <button
                    key={v}
                    onClick={() => setArchiveView(v)}
                    style={{
                      padding: "5px 14px", fontSize: 12, fontWeight: 600, fontFamily: font,
                      background: archiveView === v ? T.accent : T.surface,
                      color: archiveView === v ? T.bg : T.accent,
                      border: "1px solid rgba(139,94,60,0.25)", borderRadius: 20, cursor: "pointer",
                      transition: "all 0.15s", textTransform: "uppercase", letterSpacing: 1,
                    }}
                  >{v === "year" ? "By Year" : "By Topic"}</button>
                ))}
              </div>
            </div>

            {archiveView === "year" && years.map(year => (
              <div key={year} style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.ink, marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid rgba(44,24,16,0.1)" }}>
                  {year}
                </div>
                {archiveByYear[year].map((a, i) => <ArchiveRow key={i} a={a} i={i} />)}
              </div>
            ))}

            {archiveView === "topic" && TOPIC_CHIPS.map(topic => {
              const articles = topicArticles[topic] || [];
              if (articles.length === 0) return null;
              return (
                <div key={topic} style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.ink, marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid rgba(44,24,16,0.1)" }}>
                    {topic}
                  </div>
                  {articles.map((a, i) => <ArchiveRow key={i} a={a} i={i} />)}
                </div>
              );
            })}
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}

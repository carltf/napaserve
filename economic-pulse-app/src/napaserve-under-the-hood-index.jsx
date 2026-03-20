import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import NavBar from "./NavBar";

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

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function stripPrefix(title) {
  return (title || "").replace(/^Under the Hood:\s*/i, "");
}

/** Deduplicate articles by post_title, keeping the first (most recent) occurrence */
function dedupeArticles(rows) {
  const seen = new Set();
  return rows.filter(r => {
    if (!r.post_title || seen.has(r.post_title)) return false;
    seen.add(r.post_title);
    return true;
  });
}

/** Extract first sentence, capped at maxLen chars */
function firstSentence(text, maxLen = 150) {
  if (!text) return "";
  const m = text.match(/^[^.!?]*[.!?]/);
  const s = m ? m[0] : text;
  return s.length > maxLen ? s.slice(0, maxLen).trimEnd() + "…" : s;
}

// ── Poll card (reused for Reader Pulse section) ──────────────────────────
function PollCard({ poll }) {
  const rawOpts = typeof poll.options_json === "string"
    ? (() => { try { return JSON.parse(poll.options_json); } catch { return []; } })()
    : (poll.options_json || []);
  const opts = (Array.isArray(rawOpts) ? rawOpts : []).filter(o => o && (o.label || o.text));
  const maxVotes = Math.max(...opts.map(o => Number(o.votes) || 0), 1);
  const url = poll.substack_url && poll.substack_url.trim();

  return (
    <div style={{ background: "#F5F0E8", border: "1px solid rgba(44,24,16,0.08)", padding: "18px 20px" }}>
      <div style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 15, fontWeight: 700, color: "#2C1810", lineHeight: 1.4, marginBottom: 12 }}>{poll.question}</div>
      {opts.map((opt, oi) => {
        const votes = Number(opt.votes) || 0;
        const pct = poll.total_votes > 0 ? ((votes / poll.total_votes) * 100) : 0;
        const isWinner = votes === maxVotes && votes > 0;
        return (
          <div key={oi} style={{ marginBottom: oi < opts.length - 1 ? 8 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 13, fontWeight: isWinner ? 700 : 400, color: isWinner ? "#2C1810" : "#7A6A50", fontFamily: "'Source Sans 3',sans-serif" }}>{opt.text || opt.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: isWinner ? "#C4A050" : "#A89880", fontFamily: "monospace", whiteSpace: "nowrap", marginLeft: 8 }}>{pct.toFixed(1)}% ({votes})</span>
            </div>
            <div style={{ height: 18, background: "#EDE8DE", border: "1px solid rgba(44,24,16,0.06)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: isWinner ? "#C4A050" : "#A89880", opacity: isWinner ? 0.7 : 0.25, transition: "width .3s ease" }} />
            </div>
          </div>
        );
      })}
      <div style={{ fontSize: 14, color: "#8B7355", marginTop: 10, fontFamily: "'Source Sans 3',sans-serif", lineHeight: 1.5 }}>
        {(poll.total_votes || 0).toLocaleString()} votes{poll.post_title && <>{" · from "}{url ? <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${poll.post_title}, opens in new tab`} style={{ color: "#C4A050", textDecoration: "none", fontWeight: 600 }}>{poll.post_title} ↗</a> : <span style={{ fontStyle: "italic", color: "#7A6A50" }}>{poll.post_title}</span>}</>}{poll.published_at && ` · ${new Date(poll.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
      </div>
    </div>
  );
}

export default function UnderTheHoodIndex() {
  const [recentArticles, setRecentArticles] = useState([]);
  const [recentSummaries, setRecentSummaries] = useState({});
  const [allArticles, setAllArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [readerPolls, setReaderPolls] = useState([]);
  const [archiveView, setArchiveView] = useState("year");
  const [topicArticles, setTopicArticles] = useState({});

  // Fetch recent 3 articles
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/nvf_polls?select=post_title,substack_url,published_at&post_title=ilike.%25under%20the%20hood%25&order=published_at.desc&limit=50`,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
        );
        if (res.ok) {
          const rows = dedupeArticles(await res.json());
          setRecentArticles(rows.slice(0, 3));
        }
      } catch { /* silent */ }
    })();
  }, []);

  // Fetch summaries for recent articles via RAG
  useEffect(() => {
    if (recentArticles.length === 0) return;
    recentArticles.forEach(async (a) => {
      try {
        const res = await fetch(RAG_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: a.post_title, matchCount: 1 }),
        });
        if (res.ok) {
          const data = await res.json();
          const chunks = (data.results || data.matches || data || [])
            .filter(c => (c.title || c.post_title || "").toLowerCase().includes("under the hood"));
          if (chunks.length > 0) {
            const text = chunks[0].content || chunks[0].text || chunks[0].chunk_text || "";
            setRecentSummaries(prev => ({ ...prev, [a.post_title]: firstSentence(text) }));
          }
        }
      } catch { /* silent */ }
    });
  }, [recentArticles]);

  // Fetch full archive (up to 200)
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

  // Fetch Reader Pulse polls (Under the Hood, 10+ votes, most recent)
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

  // Fetch topic groupings for BY TOPIC view
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
    <a
      key={i}
      href={a.substack_url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        padding: "10px 0", borderBottom: "1px solid rgba(44,24,16,0.06)",
        textDecoration: "none", gap: 12,
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 600, color: "#2C1810", lineHeight: 1.4, flex: 1 }}>
        {stripPrefix(a.post_title)}
      </span>
      <span style={{ fontSize: 13, color: "#8B7355", whiteSpace: "nowrap", flexShrink: 0 }}>
        {fmtDate(a.published_at)}
      </span>
      <span style={{ fontSize: 14, color: "#C4A050", flexShrink: 0 }}>→</span>
    </a>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: "'Source Sans 3',sans-serif", color: "#2C1810" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <NavBar />

      <div id="main-content" style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px 60px" }}>

        {/* 1. NAV BREADCRUMB */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: "#8B7355", textTransform: "uppercase", fontFamily: "'Source Sans 3',sans-serif" }}>
            NapaServe · Under the Hood
          </span>
        </div>

        {/* 2. HERO */}
        <h1 style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: "2.5rem", fontWeight: 700, color: "#2C1810", margin: "0 0 12px", lineHeight: 1.2 }}>
          Under the Hood
        </h1>
        <p style={{ fontSize: 17, color: "#8B7355", lineHeight: 1.7, margin: "0 0 36px", maxWidth: 640 }}>
          Data-driven analysis of Napa County's economy, housing, workforce and community — grounded in three years of original reporting.
        </p>

        {/* 3. SEARCH */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: "#8B7355", textTransform: "uppercase", marginBottom: 10, fontFamily: "'Source Sans 3',sans-serif" }}>
            Search the Archive
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Under the Hood articles..."
              style={{
                flex: 1, padding: "12px 16px", fontSize: 15, fontFamily: "'Source Sans 3',sans-serif",
                background: "#EDE8DE", border: "1px solid rgba(44,24,16,0.15)", borderRadius: 6,
                color: "#2C1810", outline: "none",
              }}
            />
            <button type="submit" style={{
              padding: "12px 20px", fontSize: 13, fontWeight: 700, fontFamily: "'Source Sans 3',sans-serif",
              background: "#8B5E3C", color: "#F5F0E8", border: "none", borderRadius: 6, cursor: "pointer",
              letterSpacing: 1, textTransform: "uppercase",
            }}>Search</button>
          </form>

          {/* Search loading */}
          {searching && (
            <div style={{ padding: "20px 0", textAlign: "center" }}>
              <div style={{ width: 24, height: 24, border: "2px solid rgba(139,94,60,0.3)", borderTopColor: "#8B5E3C", borderRadius: "50%", animation: "uth-spin 1s linear infinite", margin: "0 auto 10px" }} />
              <style>{`@keyframes uth-spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ fontSize: 14, color: "#8B7355", margin: 0 }}>Searching...</p>
            </div>
          )}

          {/* Search results with relevancy badges */}
          {searchResults !== null && !searching && (
            <div style={{ marginTop: 16 }}>
              {searchResults.length === 0 ? (
                <p style={{ fontSize: 14, color: "#8B7355" }}>No Under the Hood results found. Try a different query.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {searchResults.map((chunk, i) => {
                    const score = chunk.similarity ? `${Math.round(chunk.similarity * 100)}%` : null;
                    return (
                      <div key={i} style={{ background: "#EDE8DE", border: "1px solid rgba(44,24,16,0.1)", padding: "16px 18px", position: "relative" }}>
                        {score && (
                          <span style={{
                            position: "absolute", top: 12, right: 14,
                            fontSize: "0.7rem", color: "#8B5E3C", background: "rgba(44,24,16,0.1)",
                            padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap", fontWeight: 600,
                          }}>{score}</span>
                        )}
                        <a
                          href={chunk.url || chunk.substack_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 15, fontWeight: 700, color: "#2C1810", textDecoration: "none", lineHeight: 1.4, paddingRight: score ? 50 : 0 }}
                        >
                          {chunk.title || chunk.post_title || "Under the Hood"}
                        </a>
                        {chunk.published_at && (
                          <div style={{ fontSize: 12, color: "#8B7355", marginTop: 4 }}>{fmtDate(chunk.published_at)}</div>
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

        {/* 4. CATEGORY CHIPS */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: "#8B7355", textTransform: "uppercase", marginBottom: 10, fontFamily: "'Source Sans 3',sans-serif" }}>
            Browse by Topic
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TOPIC_CHIPS.map(topic => (
              <button
                key={topic}
                onClick={() => handleChipClick(topic)}
                style={{
                  padding: "8px 16px", fontSize: 13, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
                  background: "#EDE8DE", border: "1px solid rgba(139,94,60,0.25)", color: "#8B5E3C",
                  borderRadius: 20, cursor: "pointer", transition: "all 0.15s",
                }}
              >{topic}</button>
            ))}
          </div>
        </div>

        {/* 5. RECENT ARTICLES with RAG summaries */}
        {recentArticles.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: "#8B7355", textTransform: "uppercase", marginBottom: 14, fontFamily: "'Source Sans 3',sans-serif" }}>
              Recent Under the Hood
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {recentArticles.map((a, i) => (
                <div key={i} style={{ background: "#EDE8DE", border: "1px solid rgba(44,24,16,0.1)", padding: "20px 22px" }}>
                  <div style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 17, fontWeight: 700, color: "#2C1810", lineHeight: 1.35, marginBottom: 6 }}>
                    {stripPrefix(a.post_title)}
                  </div>
                  <div style={{ fontSize: 13, color: "#8B7355", marginBottom: recentSummaries[a.post_title] ? 6 : 10 }}>{fmtDate(a.published_at)}</div>
                  {recentSummaries[a.post_title] && (
                    <p style={{ fontSize: 14, color: "#8B7355", lineHeight: 1.5, margin: "0 0 10px" }}>
                      {recentSummaries[a.post_title]}
                    </p>
                  )}
                  <a
                    href={a.substack_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#C4A050", textDecoration: "none" }}
                  >Read on Substack →</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. NATIVE · INTERACTIVE */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: "#8B7355", textTransform: "uppercase", marginBottom: 14, fontFamily: "'Source Sans 3',sans-serif" }}>
            Native · Interactive
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Link to="/under-the-hood/napa-cab-2025" style={{ textDecoration: "none" }}>
              <div style={{ background: "#EDE8DE", border: "1px solid rgba(44,24,16,0.1)", borderLeft: "3px solid #8B5E3C", padding: "20px 22px" }}>
                <div style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 17, fontWeight: 700, color: "#2C1810", lineHeight: 1.35, marginBottom: 6 }}>
                  Napa Valley Cabernet Sauvignon — 2025 Harvest Analysis
                </div>
                <div style={{ fontSize: 14, color: "#8B7355" }}>Interactive charts · Live polls · RAG search</div>
              </div>
            </Link>
            <div style={{ opacity: 0.6 }}>
              <div style={{ background: "#EDE8DE", border: "1px solid rgba(44,24,16,0.1)", borderLeft: "3px solid #8B5E3C", padding: "20px 22px", position: "relative" }}>
                <span style={{ position: "absolute", top: 14, right: 16, fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#8B7355" }}>Coming Soon</span>
                <div style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 17, fontWeight: 700, color: "#2C1810", lineHeight: 1.35, marginBottom: 6 }}>
                  Next Under the Hood
                </div>
                <div style={{ fontSize: 14, color: "#8B7355" }}>Interactive charts · Live polls · RAG search</div>
              </div>
            </div>
          </div>
        </div>

        {/* 7. READER PULSE */}
        {readerPolls.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: "#8B7355", textTransform: "uppercase", marginBottom: 4, fontFamily: "'Source Sans 3',sans-serif" }}>
              Reader Pulse
            </div>
            <p style={{ fontSize: 14, color: "#7A6A50", margin: "0 0 14px", fontFamily: "'Source Sans 3',sans-serif" }}>
              What readers said in recent Under the Hood polls
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {readerPolls.map(poll => <PollCard key={poll.poll_id} poll={poll} />)}
            </div>
          </div>
        )}

        {/* 8. FULL ARCHIVE */}
        {(years.length > 0 || Object.values(topicArticles).some(a => a.length > 0)) && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: "#8B7355", textTransform: "uppercase", fontFamily: "'Source Sans 3',sans-serif" }}>
                Full Archive
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {["year", "topic"].map(v => (
                  <button
                    key={v}
                    onClick={() => setArchiveView(v)}
                    style={{
                      padding: "5px 14px", fontSize: 12, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
                      background: archiveView === v ? "#8B5E3C" : "#EDE8DE",
                      color: archiveView === v ? "#F5F0E8" : "#8B5E3C",
                      border: "1px solid rgba(139,94,60,0.25)", borderRadius: 20, cursor: "pointer",
                      transition: "all 0.15s", textTransform: "uppercase", letterSpacing: 1,
                    }}
                  >{v === "year" ? "By Year" : "By Topic"}</button>
                ))}
              </div>
            </div>

            {/* BY YEAR view */}
            {archiveView === "year" && years.map(year => (
              <div key={year} style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 20, fontWeight: 700, color: "#2C1810", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid rgba(44,24,16,0.1)" }}>
                  {year}
                </div>
                {archiveByYear[year].map((a, i) => <ArchiveRow key={i} a={a} i={i} />)}
              </div>
            ))}

            {/* BY TOPIC view */}
            {archiveView === "topic" && TOPIC_CHIPS.map(topic => {
              const articles = topicArticles[topic] || [];
              if (articles.length === 0) return null;
              return (
                <div key={topic} style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 20, fontWeight: 700, color: "#2C1810", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid rgba(44,24,16,0.1)" }}>
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

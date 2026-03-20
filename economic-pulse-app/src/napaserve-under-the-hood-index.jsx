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

export default function UnderTheHoodIndex() {
  const [recentArticles, setRecentArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

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

  // Fetch full archive (up to 200)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/nvf_polls?select=post_title,substack_url,published_at&post_title=ilike.%25under%20the%20hood%25&order=published_at.desc&limit=200`,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
        );
        if (res.ok) {
          setAllArticles(dedupeArticles(await res.json()));
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

          {/* Search results */}
          {searchResults !== null && !searching && (
            <div style={{ marginTop: 16 }}>
              {searchResults.length === 0 ? (
                <p style={{ fontSize: 14, color: "#8B7355" }}>No Under the Hood results found. Try a different query.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {searchResults.map((chunk, i) => (
                    <div key={i} style={{ background: "#EDE8DE", border: "1px solid rgba(44,24,16,0.1)", padding: "16px 18px" }}>
                      <a
                        href={chunk.url || chunk.substack_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 15, fontWeight: 700, color: "#2C1810", textDecoration: "none", lineHeight: 1.4 }}
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
                  ))}
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

        {/* 5. RECENT ARTICLES */}
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
                  <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 10 }}>{fmtDate(a.published_at)}</div>
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

        {/* 6. FULL ARCHIVE */}
        {years.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: "#8B7355", textTransform: "uppercase", marginBottom: 14, fontFamily: "'Source Sans 3',sans-serif" }}>
              Full Archive
            </div>
            {years.map(year => (
              <div key={year} style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 20, fontWeight: 700, color: "#2C1810", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid rgba(44,24,16,0.1)" }}>
                  {year}
                </div>
                {archiveByYear[year].map((a, i) => (
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
                ))}
              </div>
            ))}
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}

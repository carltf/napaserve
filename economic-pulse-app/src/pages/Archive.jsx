// src/pages/Archive.jsx
// NapaServe — Napa Valley Features Archive Search
// RAG-powered search into 997 posts / 10,033 chunks via Cloudflare Worker

import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const WORKER_URL = "https://misty-bush-fc93.tfcarl.workers.dev";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F5F0E8",
    color: "#2C1810",
    fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
  },
  hero: {
    padding: "72px 24px 48px",
    maxWidth: 860,
    margin: "0 auto",
    textAlign: "center",
  },
  eyebrow: {
    fontFamily: "'Libre Baskerville', Georgia, serif",
    fontSize: "0.75rem",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#8B5E3C",
    marginBottom: 16,
    opacity: 0.9,
  },
  headline: {
    fontFamily: "'Libre Baskerville', Georgia, serif",
    fontSize: "clamp(2rem, 5vw, 3.2rem)",
    fontWeight: 700,
    lineHeight: 1.15,
    color: "#2C1810",
    margin: "0 0 16px",
  },
  subhead: {
    fontSize: "1.05rem",
    color: "#7A6A50",
    lineHeight: 1.6,
    maxWidth: 580,
    margin: "0 auto 40px",
  },
  searchWrap: {
    maxWidth: 680,
    margin: "0 auto",
    position: "relative",
  },
  searchRow: {
    display: "flex",
    gap: 10,
    alignItems: "stretch",
  },
  input: {
    flex: 1,
    background: "rgba(44,24,16,0.05)",
    border: "1px solid rgba(196,160,80,0.3)",
    borderRadius: 8,
    padding: "14px 18px",
    fontSize: "1rem",
    color: "#2C1810",
    outline: "none",
    fontFamily: "'Source Sans 3', sans-serif",
    transition: "border-color 0.2s",
  },
  btnAsk: {
    background: "#2C1810",
    color: "#F5F0E8",
    border: "none",
    borderRadius: 8,
    padding: "14px 22px",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
    letterSpacing: "0.04em",
    transition: "opacity 0.15s",
    fontFamily: "'Source Sans 3', sans-serif",
  },
  btnSearch: {
    background: "transparent",
    color: "#8B5E3C",
    border: "1px solid rgba(196,160,80,0.4)",
    borderRadius: 8,
    padding: "14px 18px",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "background 0.15s",
    fontFamily: "'Source Sans 3', sans-serif",
  },
  modeRow: {
    display: "flex",
    gap: 8,
    marginTop: 12,
    justifyContent: "center",
  },
  modeChip: {
    fontSize: "0.78rem",
    padding: "4px 12px",
    borderRadius: 20,
    border: "1px solid rgba(196,160,80,0.25)",
    color: "#7A6A50",
    cursor: "pointer",
    background: "transparent",
    fontFamily: "'Source Sans 3', sans-serif",
    transition: "all 0.15s",
  },
  modeChipActive: {
    background: "rgba(196,160,80,0.15)",
    borderColor: "#C4A050",
    color: "#8B5E3C",
  },
  divider: {
    height: 1,
    background: "rgba(44,24,16,0.1)",
    margin: "0 24px",
  },
  results: {
    maxWidth: 860,
    margin: "0 auto",
    padding: "40px 24px 80px",
  },
  answerCard: {
    background: "#EDE8DE",
    border: "1px solid rgba(44,24,16,0.12)",
    borderLeft: "3px solid #8B5E3C",
    padding: "28px 32px",
    marginBottom: 40,
    position: "relative",
  },
  answerLabel: {
    fontFamily: "'Libre Baskerville', serif",
    fontSize: "0.7rem",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#8B5E3C",
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  answerText: {
    fontSize: "1rem",
    lineHeight: 1.75,
    color: "#2C1810",
    whiteSpace: "pre-wrap",
  },
  sourcesLabel: {
    fontFamily: "'Libre Baskerville', serif",
    fontSize: "0.7rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#8B5E3C",
    marginBottom: 16,
    marginTop: 40,
  },
  chunkGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
  },
  chunkCard: {
    background: "#F5F0E8",
    border: "1px solid rgba(44,24,16,0.12)",
    padding: "18px 20px",
    transition: "border-color 0.2s",
    cursor: "default",
  },
  chunkMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 8,
  },
  chunkTitle: {
    fontFamily: "'Libre Baskerville', serif",
    fontSize: "0.88rem",
    fontWeight: 600,
    color: "#2C1810",
    lineHeight: 1.35,
    flex: 1,
  },
  chunkScore: {
    fontSize: "0.7rem",
    color: "#8B5E3C",
    background: "rgba(44,24,16,0.1)",
    padding: "2px 7px",
    borderRadius: 4,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  chunkDate: {
    fontSize: "0.75rem",
    color: "#A89880",
    marginBottom: 10,
  },
  chunkExcerpt: {
    fontSize: "0.83rem",
    color: "#7A6A50",
    lineHeight: 1.55,
  },
  chunkLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
    fontSize: "0.78rem",
    color: "#8B5E3C",
    textDecoration: "none",
    letterSpacing: "0.03em",
    fontWeight: 600,
  },
  loading: {
    textAlign: "center",
    padding: "60px 0",
    color: "#8B5E3C",
    fontSize: "0.9rem",
    letterSpacing: "0.08em",
  },
  spinner: {
    display: "inline-block",
    width: 20,
    height: 20,
    border: "2px solid rgba(44,24,16,0.12)",
    borderTopColor: "#8B5E3C",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginBottom: 12,
  },
  empty: {
    textAlign: "center",
    padding: "60px 0",
    color: "#A89880",
    fontSize: "0.95rem",
    lineHeight: 1.6,
  },
  statsBar: {
    display: "flex",
    justifyContent: "center",
    gap: 32,
    padding: "24px 0 0",
    borderTop: "1px solid rgba(44,24,16,0.1)",
    marginTop: 48,
  },
  stat: {
    textAlign: "center",
  },
  statNum: {
    fontFamily: "'Libre Baskerville', serif",
    fontSize: "1.6rem",
    color: "#8B5E3C",
    display: "block",
    lineHeight: 1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: "0.72rem",
    color: "#A89880",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  errorBox: {
    background: "rgba(138,58,42,0.06)",
    border: "1px solid rgba(138,58,42,0.2)",
    borderRadius: 8,
    padding: "16px 20px",
    color: "#8A3A2A",
    fontSize: "0.88rem",
    lineHeight: 1.55,
  },
};

const SUGGESTED = [
  "Housing affordability in Napa",
  "Wildfire recovery agriculture",
  "Economic diversification strategies",
  "Immigrant workforce viticulture",
  "Water rights drought policy",
  "Local tech startup ecosystem",
];

function ChunkCard({ chunk }) {
  const score = chunk.similarity
    ? `${Math.round(chunk.similarity * 100)}%`
    : null;
  const date = chunk.published_date
    ? new Date(chunk.published_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      })
    : null;
  const excerpt =
    chunk.excerpt ||
    (chunk.content ? chunk.content.slice(0, 240) + "…" : "");

  return (
    <div
      style={styles.chunkCard}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "rgba(44,24,16,0.15)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "rgba(44,24,16,0.12)")
      }
    >
      <div style={styles.chunkMeta}>
        <div style={styles.chunkTitle}>
          {chunk.post_title || chunk.title || "Untitled Article"}
        </div>
        {score && <span style={styles.chunkScore}>{score}</span>}
      </div>
      {date && <div style={styles.chunkDate}>{date}</div>}
      <div style={styles.chunkExcerpt}>{excerpt}</div>
      {chunk.substack_url && (
        <a
          href={chunk.substack_url}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.chunkLink}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          Read article →
        </a>
      )}
    </div>
  );
}

export default function Archive() {
  const [navOpen, setNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("answer"); // "answer" | "chunks"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [sources, setSources] = useState([]);
  const [chunks, setChunks] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    // inject spin keyframe
    const id = "nvf-spin";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
      document.head.appendChild(s);
    }
  }, []);

  const runSearch = useCallback(async (q = query) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    setSources([]);
    setChunks([]);

    try {
      if (mode === "answer") {
        const res = await fetch(`${WORKER_URL}/api/rag-answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed, matchCount: 6 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");
        setAnswer(data.answer);
        setSources(data.sources || []);
      } else {
        const res = await fetch(`${WORKER_URL}/api/rag-search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed, matchCount: 12 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");
        setChunks(data.results || []);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [query, mode]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") runSearch();
  };

  const hasResults =
    answer || sources.length > 0 || chunks.length > 0;


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
          {[
            { label: "Intelligence", links: [{ t: "Economic Dashboard", h: "/dashboard" }, { t: "Project Evaluator", h: "/evaluator" }, { t: "AI Policy Agent", h: "/agent.html" }] },
            { label: "Journalism", links: [{ t: "Napa Valley Features", h: "/news" }, { t: "NVF Archive Search", h: "/archive", cur: true }] },
            { label: "Community", links: [{ t: "Event Finder", h: "/events" }, { t: "Valley Works", h: "/valley-works" }] },
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
    <div style={styles.page}>
      <Nav />
      <div style={styles.hero}>
        <div style={styles.eyebrow}>Napa Valley Features</div>
        <h1 style={styles.headline}>
          Search the Archive
        </h1>
        <p style={styles.subhead}>
          A decade of original local journalism — economics, policy, agriculture,
          and community — made searchable through AI.
        </p>

        <div style={styles.searchWrap}>
          <div style={styles.searchRow}>
            <input
              ref={inputRef}
              style={styles.input}
              type="text"
              placeholder="Ask a question or enter keywords…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(139,94,60,0.6)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(44,24,16,0.15)")
              }
            />
            {mode === "answer" ? (
              <button
                style={styles.btnAsk}
                onClick={() => runSearch()}
                disabled={loading}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.85)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
              >
                Ask
              </button>
            ) : (
              <button
                style={styles.btnSearch}
                onClick={() => runSearch()}
                disabled={loading}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(44,24,16,0.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                Search
              </button>
            )}
          </div>

          <div style={styles.modeRow}>
            {["answer", "chunks"].map((m) => (
              <button
                key={m}
                style={{
                  ...styles.modeChip,
                  ...(mode === m ? styles.modeChipActive : {}),
                }}
                onClick={() => setMode(m)}
              >
                {m === "answer" ? "✦ AI Answer" : "▤ Raw Results"}
              </button>
            ))}
          </div>

          {/* Suggested queries */}
          {!hasResults && !loading && (
            <div
              style={{
                marginTop: 28,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                justifyContent: "center",
              }}
            >
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(44,24,16,0.12)",
                    borderRadius: 20,
                    padding: "5px 14px",
                    fontSize: "0.78rem",
                    color: "#A89880",
                    cursor: "pointer",
                    fontFamily: "'Source Sans 3', sans-serif",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#8B5E3C";
                    e.currentTarget.style.borderColor = "rgba(139,94,60,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#A89880";
                    e.currentTarget.style.borderColor = "rgba(44,24,16,0.12)";
                  }}
                  onClick={() => {
                    setQuery(s);
                    setTimeout(() => runSearch(s), 0);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.results}>
        {loading && (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            <br />
            {mode === "answer"
              ? "Searching archive & generating answer…"
              : "Searching 10,000+ article chunks…"}
          </div>
        )}

        {error && !loading && (
          <div style={styles.errorBox}>
            <strong>Search error:</strong> {error}
          </div>
        )}

        {/* AI Answer */}
        {answer && !loading && (
          <div style={styles.answerCard}>
            <div style={styles.answerLabel}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  background: "#C4A050",
                  borderRadius: "50%",
                  display: "inline-block",
                }}
              />
              NapaServe Answer
            </div>
            <div style={styles.answerText}>{answer}</div>
          </div>
        )}

        {/* Sources grid */}
        {sources.length > 0 && !loading && (
          <>
            <div style={styles.sourcesLabel}>
              Archive Sources · {sources.length} articles
            </div>
            <div style={styles.chunkGrid}>
              {sources.map((s, i) => (
                <ChunkCard key={s.id || i} chunk={s} />
              ))}
            </div>
          </>
        )}

        {/* Raw chunks grid */}
        {chunks.length > 0 && !loading && (
          <>
            <div style={styles.sourcesLabel}>
              {chunks.length} matching passages
            </div>
            <div style={styles.chunkGrid}>
              {chunks.map((c, i) => (
                <ChunkCard key={c.id || i} chunk={c} />
              ))}
            </div>
          </>
        )}

        {/* Empty state after search */}
        {!loading && !error && query && !hasResults && (
          <div style={styles.empty}>
            No passages found for "{query}"
            <br />
            <span style={{ fontSize: "0.85rem", color: "#A89880" }}>
              Try broader terms or different keywords
            </span>
          </div>
        )}

        {/* Stats footer */}
        <div style={styles.statsBar}>
          {[
            ["997", "Articles"],
            ["10,033", "Passages"],
            ["10+ yrs", "Coverage"],
          ].map(([n, l]) => (
            <div key={l} style={styles.stat}>
              <span style={styles.statNum}>{n}</span>
              <span style={styles.statLabel}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

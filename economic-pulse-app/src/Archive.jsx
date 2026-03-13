// src/pages/Archive.jsx
// NapaServe — Napa Valley Features Archive Search
// RAG-powered search into 997 posts / 10,033 chunks via Cloudflare Worker

import { useState, useRef, useEffect, useCallback } from "react";

const WORKER_URL = "https://misty-bush-fc93.tfcarl.workers.dev";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0F0A06",
    color: "#F5E6C8",
    fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
  },
  hero: {
    padding: "72px 24px 48px",
    maxWidth: 860,
    margin: "0 auto",
    textAlign: "center",
  },
  eyebrow: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "0.75rem",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#C4A050",
    marginBottom: 16,
    opacity: 0.9,
  },
  headline: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "clamp(2rem, 5vw, 3.2rem)",
    fontWeight: 700,
    lineHeight: 1.15,
    color: "#F5E6C8",
    margin: "0 0 16px",
  },
  subhead: {
    fontSize: "1.05rem",
    color: "#B89A6A",
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
    background: "rgba(196,160,80,0.08)",
    border: "1px solid rgba(196,160,80,0.3)",
    borderRadius: 8,
    padding: "14px 18px",
    fontSize: "1rem",
    color: "#F5E6C8",
    outline: "none",
    fontFamily: "'Source Sans 3', sans-serif",
    transition: "border-color 0.2s",
  },
  btnAsk: {
    background: "#C4A050",
    color: "#0F0A06",
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
    color: "#C4A050",
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
    color: "#B89A6A",
    cursor: "pointer",
    background: "transparent",
    fontFamily: "'Source Sans 3', sans-serif",
    transition: "all 0.15s",
  },
  modeChipActive: {
    background: "rgba(196,160,80,0.15)",
    borderColor: "#C4A050",
    color: "#C4A050",
  },
  divider: {
    height: 1,
    background: "rgba(196,160,80,0.1)",
    margin: "0 24px",
  },
  results: {
    maxWidth: 860,
    margin: "0 auto",
    padding: "40px 24px 80px",
  },
  answerCard: {
    background: "rgba(196,160,80,0.06)",
    border: "1px solid rgba(196,160,80,0.2)",
    borderRadius: 12,
    padding: "28px 32px",
    marginBottom: 40,
    position: "relative",
  },
  answerLabel: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "0.7rem",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#C4A050",
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  answerText: {
    fontSize: "1rem",
    lineHeight: 1.75,
    color: "#E8D4A8",
    whiteSpace: "pre-wrap",
  },
  sourcesLabel: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "0.7rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#8A7045",
    marginBottom: 16,
    marginTop: 40,
  },
  chunkGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
  },
  chunkCard: {
    background: "rgba(15,10,6,0.6)",
    border: "1px solid rgba(196,160,80,0.12)",
    borderRadius: 10,
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
    fontFamily: "'Playfair Display', serif",
    fontSize: "0.88rem",
    fontWeight: 600,
    color: "#F5E6C8",
    lineHeight: 1.35,
    flex: 1,
  },
  chunkScore: {
    fontSize: "0.7rem",
    color: "#C4A050",
    background: "rgba(196,160,80,0.1)",
    padding: "2px 7px",
    borderRadius: 4,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  chunkDate: {
    fontSize: "0.75rem",
    color: "#7A6535",
    marginBottom: 10,
  },
  chunkExcerpt: {
    fontSize: "0.83rem",
    color: "#A08060",
    lineHeight: 1.55,
  },
  chunkLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
    fontSize: "0.78rem",
    color: "#C4A050",
    textDecoration: "none",
    letterSpacing: "0.03em",
  },
  loading: {
    textAlign: "center",
    padding: "60px 0",
    color: "#8A7045",
    fontSize: "0.9rem",
    letterSpacing: "0.08em",
  },
  spinner: {
    display: "inline-block",
    width: 20,
    height: 20,
    border: "2px solid rgba(196,160,80,0.2)",
    borderTopColor: "#C4A050",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginBottom: 12,
  },
  empty: {
    textAlign: "center",
    padding: "60px 0",
    color: "#5A4A2A",
    fontSize: "0.95rem",
    lineHeight: 1.6,
  },
  statsBar: {
    display: "flex",
    justifyContent: "center",
    gap: 32,
    padding: "24px 0 0",
    borderTop: "1px solid rgba(196,160,80,0.08)",
    marginTop: 48,
  },
  stat: {
    textAlign: "center",
  },
  statNum: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.6rem",
    color: "#C4A050",
    display: "block",
    lineHeight: 1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: "0.72rem",
    color: "#5A4A2A",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  errorBox: {
    background: "rgba(180,60,40,0.08)",
    border: "1px solid rgba(180,60,40,0.25)",
    borderRadius: 8,
    padding: "16px 20px",
    color: "#E8A898",
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
        (e.currentTarget.style.borderColor = "rgba(196,160,80,0.3)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "rgba(196,160,80,0.12)")
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

  return (
    <div style={styles.page}>
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
                (e.target.style.borderColor = "rgba(196,160,80,0.7)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(196,160,80,0.3)")
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
                  (e.currentTarget.style.background = "rgba(196,160,80,0.08)")
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
                    border: "1px solid rgba(196,160,80,0.18)",
                    borderRadius: 20,
                    padding: "5px 14px",
                    fontSize: "0.78rem",
                    color: "#7A6535",
                    cursor: "pointer",
                    fontFamily: "'Source Sans 3', sans-serif",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#C4A050";
                    e.currentTarget.style.borderColor =
                      "rgba(196,160,80,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#7A6535";
                    e.currentTarget.style.borderColor =
                      "rgba(196,160,80,0.18)";
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
            <span style={{ fontSize: "0.85rem", color: "#3A2A10" }}>
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

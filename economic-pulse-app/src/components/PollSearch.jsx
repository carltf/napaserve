import { useState } from "react";

const WORKER_URL = "https://misty-bush-fc93.tfcarl.workers.dev";

const T = {
  bg: "#F5F0E8", bg2: "#EDE8DE",
  ink2: "#2C1810", accent: "#8B5E3C", gold: "#C4A050",
  muted: "#7A6A50", dim: "#8B7355",
  rule: "rgba(44,24,16,0.12)",
};

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function PollSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async () => {
    const q = query.trim();
    if (q.length < 2) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch(`${WORKER_URL}/api/poll-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
      {/* Search input */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          placeholder="What do readers think about..."
          aria-label="Search polls"
          style={{
            flex: 1, padding: "14px 18px", fontSize: 17,
            fontFamily: "'Source Sans 3',sans-serif", color: T.ink2,
            background: "rgba(44,24,16,0.05)", border: `1px solid ${T.rule}`,
            borderRadius: 8, outline: "none",
          }}
        />
        <button
          onClick={search}
          disabled={loading || query.trim().length < 2}
          style={{
            padding: "14px 24px", fontSize: 14, fontWeight: 700,
            fontFamily: "'Source Sans 3',sans-serif", letterSpacing: ".04em",
            background: T.ink2, color: T.bg, border: "none",
            borderRadius: 8, cursor: loading ? "wait" : "pointer",
            opacity: loading || query.trim().length < 2 ? 0.5 : 1,
            whiteSpace: "nowrap",
          }}
        >{loading ? "Searching..." : "Search"}</button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "rgba(138,58,42,0.08)", border: "1px solid rgba(184,92,56,0.3)", borderRadius: 8, padding: "14px 18px", marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: "#8A3A2A", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ width: 28, height: 28, border: "3px solid rgba(139,105,20,0.3)", borderTopColor: T.accent, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: 14, color: T.dim }}>Searching polls...</p>
        </div>
      )}

      {/* Empty state */}
      {results && results.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ fontSize: 17, color: T.dim }}>No matching polls found. Try different keywords.</p>
        </div>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 14, color: T.dim, marginBottom: 4 }}>
            {results.length} poll{results.length !== 1 ? "s" : ""} found
          </div>
          {results.map(poll => {
            const rawOpts = typeof poll.options_json === "string"
              ? (() => { try { return JSON.parse(poll.options_json); } catch { return []; } })()
              : (poll.options_json || []);
            const opts = (Array.isArray(rawOpts) ? rawOpts : []).filter(o => o && (o.label || o.text));
            const maxVotes = Math.max(...opts.map(o => Number(o.votes) || 0), 1);
            const url = poll.substack_url && poll.substack_url.trim();
            const similarity = poll.similarity != null ? Math.round(poll.similarity * 100) : null;

            return (
              <div key={poll.poll_id} style={{ background: T.bg2, border: `1px solid ${T.rule}`, padding: "20px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 16, fontWeight: 700, color: T.ink2, lineHeight: 1.4, flex: 1 }}>
                    {poll.question}
                  </div>
                  {similarity != null && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.accent, background: "rgba(139,94,60,0.08)", padding: "3px 8px", borderRadius: 4, marginLeft: 12, whiteSpace: "nowrap", flexShrink: 0 }}>
                      {similarity}% match
                    </span>
                  )}
                </div>

                {opts.map((opt, oi) => {
                  const votes = Number(opt.votes) || 0;
                  const pct = poll.total_votes > 0 ? ((votes / poll.total_votes) * 100) : 0;
                  const isWinner = votes === maxVotes && votes > 0;
                  return (
                    <div key={oi} style={{ marginBottom: oi < opts.length - 1 ? 8 : 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: isWinner ? 700 : 400, color: isWinner ? T.ink2 : T.muted, fontFamily: "'Source Sans 3',sans-serif" }}>
                          {opt.text || opt.label}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: isWinner ? T.gold : T.dim, fontFamily: "monospace", whiteSpace: "nowrap", marginLeft: 8 }}>
                          {pct.toFixed(1)}% ({votes})
                        </span>
                      </div>
                      <div style={{ height: 18, background: T.bg, border: `1px solid rgba(44,24,16,0.06)`, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: isWinner ? T.gold : T.dim, opacity: isWinner ? 0.7 : 0.25, transition: "width .3s ease" }} />
                      </div>
                    </div>
                  );
                })}

                <div style={{ fontSize: 14, color: T.dim, marginTop: 12, fontFamily: "'Source Sans 3',sans-serif", lineHeight: 1.5 }}>
                  {(poll.total_votes || 0).toLocaleString()} votes
                  {poll.theme && ` · ${poll.theme}`}
                  {poll.post_title && <>{" · from "}{url
                    ? <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${poll.post_title}, opens in new tab`} style={{ color: T.gold, textDecoration: "none", fontWeight: 600 }}>{poll.post_title} ↗</a>
                    : <span style={{ fontStyle: "italic", color: T.muted }}>{poll.post_title}</span>
                  }</>}
                  {poll.published_at && ` · ${fmtDate(poll.published_at)}`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

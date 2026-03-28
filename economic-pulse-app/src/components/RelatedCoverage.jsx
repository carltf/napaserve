import { useState, useEffect } from "react";

const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";

const serif = "'Libre Baskerville', Georgia, serif";
const sans = "'Source Sans 3', sans-serif";
const mono = "'Source Code Pro', monospace";

export default function RelatedCoverage({ articleSlug }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articleSlug) return;
    fetch(`${WORKER}/api/related-articles?slug=${articleSlug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setResults(data && Array.isArray(data.results) ? data.results : []);
        setLoading(false);
      })
      .catch(() => { setResults([]); setLoading(false); });
  }, [articleSlug]);

  // Don't render if no results or error
  if (!loading && (!results || results.length === 0)) return null;

  return (
    <div style={{ borderTop: "2px solid #D4C9B8", marginTop: 48, paddingTop: 32 }}>
      <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8B7355", marginBottom: 6 }}>
        FROM THE ARCHIVE
      </div>
      <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: "#2C1810", margin: "0 0 20px 0" }}>
        Related Coverage
      </h2>

      <style>{`@keyframes rc-shimmer{0%{background-position:-200px 0}100%{background-position:200px 0}}`}</style>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              background: "linear-gradient(90deg, #EDE8DE 25%, #E5E0D6 50%, #EDE8DE 75%)",
              backgroundSize: "400px 100%",
              animation: "rc-shimmer 1.5s infinite linear",
              border: "1px solid rgba(44,24,16,0.08)",
              borderRadius: 4,
              height: 100,
              padding: 12,
            }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {results.map((r, i) => (
            <div key={i} style={{
              background: "#EDE8DE",
              border: "1px solid rgba(44,24,16,0.08)",
              borderRadius: 4,
              padding: 12,
            }}>
              <a
                href={r.url || `/archive?q=${encodeURIComponent(r.title)}`}
                target={r.url ? "_blank" : undefined}
                rel={r.url ? "noopener noreferrer" : undefined}
                style={{
                  fontFamily: serif,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#8B5E3C",
                  textDecoration: "none",
                  lineHeight: 1.35,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {r.title}
              </a>
              {r.published_at && (
                <div style={{ fontFamily: sans, fontSize: 12, color: "#8B7355", margin: 0 }}>
                  {new Date(r.published_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

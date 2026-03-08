import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const SUBSTACK_API = "https://misty-bush-fc93.tfcarl.workers.dev/substack/archive?sort=new&offset=0&limit=12";

// RSS-to-JSON for ticker headlines
const NEWS_SOURCES = [
  { id: "nvng", name: "NV News Group", feed: "https://api.rss2json.com/v1/api.json?rss_url=https://napavalleynewsgroup.com/feed&count=5", color: "#C4A050" },
  { id: "patch", name: "Napa Patch", feed: "https://api.rss2json.com/v1/api.json?rss_url=https://patch.com/california/napa/rss&count=5", color: "#7EB8A4" },
];

const CATEGORIES = [
  { key: "all", label: "All Stories" },
  { key: "policy", label: "Policy & Government" },
  { key: "wine", label: "Wine & Ag" },
  { key: "housing", label: "Housing" },
  { key: "environment", label: "Environment" },
  { key: "community", label: "Community" },
  { key: "business", label: "Business & Economy" },
];

function categorize(title, subtitle) {
  const t = `${title || ""} ${subtitle || ""}`.toLowerCase();
  if (/council|supervisor|board|ordinance|ballot|election|legislation|planning|zoning|permit|county|city hall|governor|regulation|vote|policy|political/i.test(t)) return "policy";
  if (/wine|winery|vineyard|grape|harvest|vintage|viticulture|tasting room|appellation|ag preserve|agriculture|farming|mustard/i.test(t)) return "wine";
  if (/housing|apartment|affordable|rent|home price|mortgage|development|residential|unhoused|homeless|shelter/i.test(t)) return "housing";
  if (/wildfire|fire|water|drought|climate|environment|flood|habitat|conservation|wildlife|pollution|air quality|biodiversity/i.test(t)) return "environment";
  if (/business|economy|job|employ|restaurant|hotel|tourism|startup|retail|commercial|tax revenue|budget|economic/i.test(t)) return "business";
  if (/school|community|nonprofit|volunteer|library|museum|arts|festival|charity|health|hospital/i.test(t)) return "community";
  return "all";
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return fmtDate(dateStr);
}

// ═══════════════════════════════════════════════════════════════════════════
// NEWS TICKER
// ═══════════════════════════════════════════════════════════════════════════

function NewsTicker({ headlines }) {
  if (!headlines || headlines.length === 0) return null;
  const duration = Math.max(25, headlines.length * 7);

  return (
    <div style={{
      background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(139,105,20,0.15)",
      padding: "10px 0", overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#B85C38", textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0 }}>Local News</span>
        <div style={{ width: 1, height: 16, background: "rgba(139,105,20,0.3)", flexShrink: 0 }} />
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div style={{
            display: "flex", gap: 36, whiteSpace: "nowrap",
            animation: `ticker ${duration}s linear infinite`,
          }}>
            {[...headlines, ...headlines].map((h, i) => (
              <a key={i} href={h.link} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontSize: 12, textDecoration: "none", flexShrink: 0,
              }}>
                <span style={{ color: h.sourceColor || "#6B5B40", fontSize: 10, fontWeight: 700 }}>{h.source}</span>
                <span style={{ color: "#C4B08A" }}>{h.title.length > 75 ? h.title.slice(0, 72) + "..." : h.title}</span>
                <span style={{ color: "#5A4D38", fontSize: 10 }}>{timeAgo(h.pubDate)}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

export default function NapaValleyFeatures() {
  const [posts, setPosts] = useState([]);
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("all");

  // Fetch Substack archive via Cloudflare Worker
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(SUBSTACK_API);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const items = await res.json();
        if (!Array.isArray(items) || items.length === 0) {
          setError("No stories returned.");
          return;
        }
        setPosts(items.map(item => ({
          title: item.title || "",
          subtitle: item.subtitle || "",
          link: item.canonical_url || "#",
          pubDate: item.post_date,
          image: item.cover_image || null,
          category: categorize(item.title, item.subtitle),
        })));
      } catch (err) {
        setError("Unable to load stories: " + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch ticker headlines
  useEffect(() => {
    (async () => {
      const all = [];
      for (const src of NEWS_SOURCES) {
        try {
          const res = await fetch(src.feed);
          const data = await res.json();
          if (data.status === "ok" && data.items) {
            data.items.slice(0, 5).forEach(item => {
              all.push({ title: item.title, link: item.link, pubDate: item.pubDate, source: src.name, sourceColor: src.color });
            });
          }
        } catch { /* skip */ }
      }
      all.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      setHeadlines(all);
    })();
  }, []);

  const filtered = category === "all" ? posts : posts.filter(p => p.category === category);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(175deg, #1C120C 0%, #2A1A0E 30%, #1E1408 60%, #0F0A06 100%)", fontFamily: "'Source Sans 3','Source Sans Pro',-apple-system,sans-serif", color: "#F5E6C8" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Source+Sans+3:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      <div style={{ height: 3, background: "linear-gradient(90deg, transparent, #8B6914 20%, #C4A050 50%, #8B6914 80%, transparent)" }} />

      {/* Ticker */}
      <NewsTicker headlines={headlines} />

      {/* Header */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 6, height: 6, background: "#C4A050", borderRadius: "50%" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#8B6914", textTransform: "uppercase" }}>NapaServe</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 900, color: "#F5E6C8", margin: "0 0 4px" }}>Napa Valley Features</h1>
            <p style={{ fontSize: 15, color: "#9B8968", margin: "0 0 24px" }}>
              Stories and analysis about the issues shaping Napa County — from Napa Valley Focus
            </p>
          </div>
          <a href="https://napavalleyfocus.substack.com/account?utm_medium=web&utm_source=napaserve&utm_content=subscribe" target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 20px", fontSize: 13, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,105,20,0.25)",
            color: "#C4A050", borderRadius: 8, textDecoration: "none", marginTop: 4,
          }}>
            Subscribe
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4 1.5H1.5V10.5H10.5V8" stroke="#C4A050" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M7 1.5H10.5V5" stroke="#C4A050" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.5 1.5L5.5 6.5" stroke="#C4A050" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </a>
        </div>

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "1px solid rgba(139,105,20,0.12)", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)} style={{
              padding: "10px 16px", fontSize: 13, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
              background: "none", color: category === c.key ? "#C4A050" : "#7A6B50",
              border: "none", borderBottom: category === c.key ? "2px solid #C4A050" : "2px solid transparent",
              cursor: "pointer", transition: "all 0.2s", marginBottom: -1, whiteSpace: "nowrap",
            }}>{c.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 60px" }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ width: 32, height: 32, border: "3px solid rgba(139,105,20,0.3)", borderTopColor: "#C4A050", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: "#9B8968", fontSize: 14 }}>Loading stories...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(184,92,56,0.1)", border: "1px solid rgba(184,92,56,0.3)", borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: "#B85C38", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* 3-column card grid */}
        {!loading && filtered.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 24,
          }}>
            {filtered.map((post, i) => (
              <a key={i} href={post.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
                <div style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,105,20,0.12)",
                  borderRadius: 10, overflow: "hidden", transition: "border-color 0.2s, transform 0.2s",
                  height: "100%", display: "flex", flexDirection: "column",
                }}>
                  {post.image ? (
                    <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "#1C120C" }}>
                      <img src={post.image} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85, display: "block" }} />
                    </div>
                  ) : (
                    <div style={{ width: "100%", aspectRatio: "16/9", background: "linear-gradient(135deg, rgba(139,105,20,0.1), rgba(114,47,55,0.06))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 11, color: "#5A4D38", letterSpacing: 2 }}>NAPA VALLEY FOCUS</span>
                    </div>
                  )}
                  <div style={{ padding: "14px 16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#8B6914", textTransform: "uppercase", letterSpacing: 1 }}>
                        {CATEGORIES.find(c => c.key === post.category)?.label || "Feature"}
                      </span>
                    </div>
                    <h3 style={{
                      fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16, fontWeight: 700,
                      color: "#F5E6C8", margin: "0 0 6px", lineHeight: 1.3,
                      display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>{post.title}</h3>
                    {post.subtitle && (
                      <p style={{
                        fontSize: 13, color: "#9B8968", lineHeight: 1.5, margin: "0 0 auto",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>{post.subtitle}</p>
                    )}
                    <div style={{ fontSize: 11, color: "#5A4D38", marginTop: 10 }}>{fmtDate(post.pubDate)}</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Responsive: on mobile, grid collapses */}
        <style>{`@media (max-width: 820px) { [style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; } }`}</style>

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontSize: 15, color: "#9B8968" }}>No stories in this category yet.</p>
            <button onClick={() => setCategory("all")} style={{
              padding: "10px 20px", fontSize: 13, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,105,20,0.25)",
              color: "#C4A050", borderRadius: 8, cursor: "pointer", marginTop: 12,
            }}>View all stories</button>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid rgba(139,105,20,0.12)", padding: "20px 0 0", marginTop: 32, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 11, color: "#5A4D38" }}>Napa Valley Features · Stories from Napa Valley Focus</span>
          <div style={{ display: "flex", gap: 12 }}>
            <a href="https://napavalleyfocus.substack.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#8B6914", textDecoration: "none" }}>Substack ↗</a>
            <a href="https://www.napavalleyfeatures.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#8B6914", textDecoration: "none" }}>napavalleyfeatures.com ↗</a>
          </div>
        </div>
      </div>
    </div>
  );
}

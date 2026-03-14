import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const SUBSTACK_API = "https://misty-bush-fc93.tfcarl.workers.dev/substack/archive?sort=new&offset=0&limit=12";

const CATEGORIES = [
  { key: "all", label: "All Stories" },
  { key: "policy", label: "Policy & Government" },
  { key: "wine", label: "Wine & Ag" },
  { key: "housing", label: "Housing" },
  { key: "environment", label: "Environment" },
  { key: "community", label: "Community" },
  { key: "business", label: "Business & Economy" },
];

const LOCAL_NEWS_LINKS = [
  { name: "Napa Valley Features", url: "https://www.napavalleyfeatures.com" },
  { name: "Calistoga Tribune", url: "https://calistogatribune.com" },
  { name: "Yountville Sun", url: "https://yountvillesun.com" },
  { name: "Napa County Times", url: "https://napacountytimes.com" },
  { name: "NV Register", url: "https://napavalleyregister.com" },
  { name: "Napa Patch", url: "https://patch.com/california/napa" },
  { name: "Press Democrat", url: "https://www.pressdemocrat.com" },
  { name: "SF Chronicle", url: "https://www.sfchronicle.com/napa" },
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

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL SOURCES TRANSPARENCY ROW (bottom of page)
// ═══════════════════════════════════════════════════════════════════════════

function LocalSourcesRow() {
  return (
    <div style={{ borderTop: "1px solid rgba(44,24,16,0.08)", paddingTop: 16, marginTop: 16 }}>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#A89880" }}>Other local news sources</span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {LOCAL_NEWS_LINKS.map((src, i) => (
          <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" style={{
            fontSize: 11, textDecoration: "none", padding: "4px 10px",
            border: `1px solid ${i === 0 ? "rgba(139,94,60,0.2)" : "rgba(44,24,16,0.08)"}`,
            whiteSpace: "nowrap", transition: "all 0.15s",
            fontWeight: i === 0 ? 700 : 400,
            color: i === 0 ? "#8B5E3C" : "#A89880",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "#8B5E3C"; e.currentTarget.style.borderColor = "rgba(139,94,60,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = i === 0 ? "#8B5E3C" : "#A89880"; e.currentTarget.style.borderColor = i === 0 ? "rgba(139,94,60,0.2)" : "rgba(44,24,16,0.08)"; }}
          >{src.name}</a>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHIVE SEARCH STRIP
// ═══════════════════════════════════════════════════════════════════════════

function ArchiveStrip({ navigate }) {
  const [q, setQ] = useState("");

  const handleSearch = () => {
    const trimmed = q.trim();
    if (!trimmed) return;
    navigate(`/archive?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div style={{
      background: "#EDE8DE",
      border: "1px solid rgba(44,24,16,0.1)",
      borderLeft: "3px solid #8B5E3C",
      padding: "28px 32px",
      margin: "40px 0 0",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#A89880" }}>NVF Archive</span>
        <span style={{ fontSize: 9, color: "rgba(44,24,16,0.2)" }}>·</span>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A89880" }}>1,000+ articles · over a decade of coverage</span>
      </div>
      <p style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 16, fontWeight: 700, color: "#2C1810", margin: "0 0 14px" }}>
        Search the full NVF archive
      </p>
      <p style={{ fontSize: 13, color: "#7A6A50", margin: "0 0 16px", lineHeight: 1.6 }}>
        Looking for more on a topic? Search three years of original local journalism — economics, policy, lodging, agriculture, and community — powered by AI.
      </p>
      <div style={{ display: "flex", gap: 8, maxWidth: 560 }}>
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="e.g. job creation, wildfire policy, housing affordability…"
          style={{
            flex: 1,
            background: "#F5F0E8",
            border: "1px solid rgba(44,24,16,0.15)",
            padding: "10px 14px",
            fontSize: 13,
            fontFamily: "'Source Sans 3', sans-serif",
            color: "#2C1810",
            outline: "none",
          }}
          onFocus={e => e.target.style.borderColor = "rgba(139,94,60,0.5)"}
          onBlur={e => e.target.style.borderColor = "rgba(44,24,16,0.15)"}
        />
        <button
          onClick={handleSearch}
          style={{
            background: "#8B5E3C",
            color: "#F5F0E8",
            border: "none",
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Source Sans 3', sans-serif",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          Search Archive →
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

export default function NapaValleyFeatures() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("all");
  const navigate = useNavigate();

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
          author: item.author || "Tim Carl",
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

  const filtered = category === "all" ? posts : posts.filter(p => p.category === category);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F0E8",
      fontFamily: "'Source Sans 3','Source Sans Pro',-apple-system,sans-serif",
      color: "#2C1810",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @media (max-width: 820px) {
          .nvf-grid { grid-template-columns: 1fr !important; }
          .nvf-cats { gap: 2px !important; }
          .nvf-cats button { padding: 8px 10px !important; font-size: 12px !important; }
        }
        @media (max-width: 600px) {
          .nvf-header-row { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      {/* Gold rule */}
      <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #C4A050 20%, #8B6914 50%, #C4A050 80%, transparent)" }} />

      {/* Header */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "36px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 5, height: 5, background: "#8B5E3C", borderRadius: "50%" }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#8B5E3C", textTransform: "uppercase" }}>NapaServe</span>
        </div>

        <div className="nvf-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 4 }}>
          <div>
            <h1 style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, color: "#1A0E08", margin: "0 0 6px" }}>
              Napa Valley Features
            </h1>
            <p style={{ fontSize: 15, color: "#7A6A50", margin: 0 }}>
              Stories and analysis about the issues shaping Napa County
            </p>
          </div>
          <a
            href="https://napavalleyfeatures.substack.com/account?utm_medium=web&utm_source=napaserve&utm_content=subscribe"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "9px 18px", fontSize: 13, fontWeight: 600,
              fontFamily: "'Source Sans 3',sans-serif",
              background: "transparent",
              border: "1px solid rgba(139,94,60,0.35)",
              color: "#8B5E3C", textDecoration: "none", marginTop: 4,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,94,60,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            Subscribe
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M4 1.5H1.5V10.5H10.5V8" stroke="#8B5E3C" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M7 1.5H10.5V5" stroke="#8B5E3C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.5 1.5L5.5 6.5" stroke="#8B5E3C" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </a>
        </div>

        {/* Category tabs */}
        <div className="nvf-cats" style={{
          display: "flex", gap: 0, marginTop: 24, marginBottom: 28,
          borderBottom: "1px solid rgba(44,24,16,0.1)",
          overflowX: "auto", WebkitOverflowScrolling: "touch",
        }}>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)} style={{
              padding: "10px 16px", fontSize: 13, fontWeight: 600,
              fontFamily: "'Source Sans 3',sans-serif",
              background: "none",
              color: category === c.key ? "#8B5E3C" : "#A89880",
              border: "none",
              borderBottom: category === c.key ? "2px solid #8B5E3C" : "2px solid transparent",
              cursor: "pointer", transition: "all 0.15s", marginBottom: -1,
              whiteSpace: "nowrap",
            }}>{c.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 60px" }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{
              width: 28, height: 28,
              border: "2px solid rgba(44,24,16,0.1)",
              borderTopColor: "#8B5E3C",
              borderRadius: "50%",
              animation: "spin 0.9s linear infinite",
              margin: "0 auto 16px",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: "#A89880", fontSize: 14 }}>Loading stories…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(138,58,42,0.06)",
            border: "1px solid rgba(138,58,42,0.2)",
            padding: "16px 20px", marginBottom: 20,
          }}>
            <p style={{ fontSize: 14, color: "#8A3A2A", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Card grid */}
        {!loading && filtered.length > 0 && (
          <div className="nvf-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 20,
          }}>
            {filtered.map((post, i) => (
              <a key={i} href={post.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
                <div style={{
                  background: "#EDE8DE",
                  border: "1px solid rgba(44,24,16,0.08)",
                  overflow: "hidden",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(139,94,60,0.35)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(44,24,16,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(44,24,16,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {/* Image */}
                  {post.image ? (
                    <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "#DDD7CB" }}>
                      <img src={post.image} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      />
                    </div>
                  ) : (
                    <div style={{ width: "100%", aspectRatio: "16/9", background: "#DDD7CB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 10, color: "#A89880", letterSpacing: "0.14em", textTransform: "uppercase" }}>Napa Valley Features</span>
                    </div>
                  )}

                  {/* Content */}
                  <div style={{ padding: "14px 16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: "#8B5E3C", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                        {CATEGORIES.find(c => c.key === post.category)?.label || "Feature"}
                      </span>
                    </div>
                    <h3 style={{
                      fontFamily: "'Libre Baskerville',Georgia,serif",
                      fontSize: 15, fontWeight: 700,
                      color: "#1A0E08", margin: "0 0 6px", lineHeight: 1.35,
                      display: "-webkit-box", WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>{post.title}</h3>
                    {post.subtitle && (
                      <p style={{
                        fontSize: 13, color: "#7A6A50", lineHeight: 1.5,
                        margin: "0 0 auto",
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>{post.subtitle}</p>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                      <span style={{ fontSize: 11, color: "#A89880" }}>
                        {post.author ? `By ${post.author}` : ""}
                      </span>
                      <span style={{ fontSize: 11, color: "#A89880" }}>{fmtDate(post.pubDate)}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontSize: 15, color: "#A89880" }}>No stories in this category yet.</p>
            <button onClick={() => setCategory("all")} style={{
              padding: "10px 20px", fontSize: 13, fontWeight: 600,
              fontFamily: "'Source Sans 3',sans-serif",
              background: "transparent",
              border: "1px solid rgba(139,94,60,0.3)",
              color: "#8B5E3C", cursor: "pointer", marginTop: 12,
            }}>View all stories</button>
          </div>
        )}

        {/* Archive search strip */}
        {!loading && <ArchiveStrip navigate={navigate} />}

        {/* Local sources transparency row */}
        <LocalSourcesRow />

        {/* Footer */}
        <div style={{
          borderTop: "1px solid rgba(44,24,16,0.1)",
          padding: "20px 0 0", marginTop: 32,
          display: "flex", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <span style={{ fontSize: 11, color: "#A89880" }}>Napa Valley Features · Original local journalism since 2014</span>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="https://napavalleyfeatures.substack.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#8B5E3C", textDecoration: "none" }}>Substack ↗</a>
            <a href="https://www.napavalleyfeatures.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#8B5E3C", textDecoration: "none" }}>napavalleyfeatures.com ↗</a>
          </div>
        </div>
      </div>
    </div>
  );
}

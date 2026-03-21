import { useState, useEffect } from "react";
import Footer from "./Footer";
import NavBar from "./NavBar";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const SUBSTACK_API = "https://misty-bush-fc93.tfcarl.workers.dev/substack/archive?sort=new&offset=0&limit=50";

const SUPABASE_URL = "https://csenpchwxxepdvjebsrt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_r-Ntp7zKRrH3JIVAjTKYmA_0szFdYGJ";

// RSS-to-JSON for ticker headlines
const NEWS_SOURCES = [
  { id: "caltrib", name: "Calistoga Tribune", feed: "https://api.rss2json.com/v1/api.json?rss_url=https://calistogatribune.com/feed&count=5", color: "#8B5E3C" },
  { id: "ytsun", name: "Yountville Sun", feed: "https://api.rss2json.com/v1/api.json?rss_url=https://yountvillesun.com/feed&count=5", color: "#7EB8A4" },
  { id: "nctimes", name: "Napa County Times", feed: "https://api.rss2json.com/v1/api.json?rss_url=https://napacountytimes.com/feed&count=5", color: "#9B8EC4" },
  { id: "patch", name: "Napa Patch", feed: "https://api.rss2json.com/v1/api.json?rss_url=https://patch.com/california/napa/rss&count=5", color: "#8A3A2A" },
  { id: "register", name: "NV Register", feed: "https://api.rss2json.com/v1/api.json?rss_url=https://napavalleyregister.com/search/?f=rss&t=article&l=10&s=start_time&sd=desc&count=5", color: "#8B7355" },
  { id: "pressdem", name: "Press Democrat", feed: "https://api.rss2json.com/v1/api.json?rss_url=https://www.pressdemocrat.com/recent/rss&count=5", color: "#C8A96E" },
  { id: "sfchron", name: "SF Chronicle", feed: "https://api.rss2json.com/v1/api.json?rss_url=https://www.sfchronicle.com/bayarea/feed/Bay-Area-News-702702.php&count=5", color: "#7A6A50" },
];

const CATEGORIES = [
  { key: "all", label: "All Stories" },
  { key: "policy", label: "Policy & Government" },
  { key: "wine", label: "Wine" },
  { key: "agriculture", label: "Agriculture" },
  { key: "housing", label: "Housing" },
  { key: "environment", label: "Environment" },
  { key: "community", label: "Community" },
  { key: "business", label: "Business & Economy" },
];

function categorize(title, subtitle) {
  const t = `${title || ""} ${subtitle || ""}`.toLowerCase();
  const cats = new Set();
  // Series name matching first
  if (/green wednesday/i.test(t)) { cats.add("environment"); cats.add("agriculture"); }
  if (/under the hood/i.test(t)) cats.add("business");
  if (/wine chronicles/i.test(t)) cats.add("wine");
  if (/harvest|vintage/i.test(t)) { cats.add("wine"); cats.add("agriculture"); }
  // Keyword matching
  if (/council|supervisor|board|ordinance|ballot|election|legislation|planning|zoning|permit|county|city hall|governor|regulation|vote|policy|political/i.test(t)) cats.add("policy");
  if (/wine|winery|tasting room|appellation|viticulture/i.test(t)) cats.add("wine");
  if (/housing|apartment|affordable|rent|home price|mortgage|development|residential|unhoused|homeless|shelter/i.test(t)) cats.add("housing");
  if (/wildfire|fire|water|drought|climate|environment|flood|habitat|conservation|wildlife|pollution|air quality|biodiversity/i.test(t)) cats.add("environment");
  if (/business|economy|job|employ|restaurant|hotel|tourism|startup|retail|commercial|tax revenue|budget|economic/i.test(t)) cats.add("business");
  if (/school|community|nonprofit|volunteer|library|museum|arts|festival|charity|health|hospital/i.test(t)) cats.add("community");
  if (/farm|vineyard|grape|ag preserve|mustard|orchard|crop|agriculture|farming/i.test(t)) cats.add("agriculture");
  return cats.size > 0 ? [...cats] : ["all"];
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

const LOCAL_NEWS_LINKS = [
  { name: "Calistoga Tribune", url: "https://calistogatribune.com", color: "#8B5E3C" },
  { name: "Yountville Sun", url: "https://yountvillesun.com", color: "#7EB8A4" },
  { name: "Napa County Times", url: "https://napacountytimes.com", color: "#9B8EC4" },
  { name: "NV Register", url: "https://napavalleyregister.com", color: "#8B7355" },
  { name: "Napa Patch", url: "https://patch.com/california/napa", color: "#8A3A2A" },
  { name: "Press Democrat", url: "https://www.pressdemocrat.com", color: "#C8A96E" },
  { name: "SF Chronicle", url: "https://www.sfchronicle.com/napa", color: "#7A6A50" },
];

function NewsSourceBar() {
  return (
    <div style={{
      background: "#E6E0D4", borderBottom: "1px solid rgba(44,24,16,0.12)",
      padding: "10px 0", overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#8B5E3C", textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0 }}>Local News</span>
        <div style={{ width: 1, height: 16, background: "rgba(44,24,16,0.15)", flexShrink: 0 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
          {LOCAL_NEWS_LINKS.map((src, i) => (
            <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" aria-label={`${src.name}, opens in new tab`} style={{
              fontSize: 11, fontWeight: 600, color: src.color, textDecoration: "none",
              padding: "4px 10px", background: "transparent",
              border: "1px solid rgba(44,24,16,0.12)", borderRadius: 20,
              whiteSpace: "nowrap", transition: "all 0.15s",
            }}>{src.name}</a>
          ))}
        </div>
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
          categories: categorize(item.title, item.subtitle),
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

  // Fetch Recent Reader Pulse polls (any theme, last 6 months, 10+ votes)
  const [recentPolls, setRecentPolls] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const sixMonthsAgo = new Date(Date.now() - 180*24*60*60*1000).toISOString().split('T')[0];
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/nvf_polls?select=poll_id,post_title,question,options_json,total_votes,published_at,substack_url&published_at=gte.${sixMonthsAgo}&total_votes=gte.10&order=published_at.desc&limit=3`,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
        );
        if (res.ok) setRecentPolls(await res.json());
      } catch { /* silent */ }
    })();
  }, []);

  // Fetch Most Engaged All Time polls (Reader Demographics, by votes)
  const [readerPolls, setReaderPolls] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/nvf_polls?select=poll_id,post_title,question,options_json,total_votes,published_at,substack_url&theme=eq.Reader%20Demographics&order=total_votes.desc&limit=3`,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
        );
        if (res.ok) setReaderPolls(await res.json());
      } catch { /* silent */ }
    })();
  }, []);

  const filtered = category === "all" ? posts : posts.filter(p => p.categories.includes(category));

  const ArticleCard = ({ post }) => (
    <a href={post.link} target="_blank" rel="noopener noreferrer" aria-label={`${post.title}, opens in new tab`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: "#EDE8DE", border: "1px solid rgba(139,105,20,0.12)",
        borderRadius: 10, overflow: "hidden", transition: "border-color 0.2s, transform 0.2s",
        height: "100%", display: "flex", flexDirection: "column",
      }}>
        {post.image ? (
          <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "#E6E0D4" }}>
            <img src={post.image} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85, display: "block" }} />
          </div>
        ) : (
          <div style={{ width: "100%", aspectRatio: "16/9", background: "#EDE8DE", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 11, color: "#8B7355", letterSpacing: 2 }}>NAPA VALLEY FOCUS</span>
          </div>
        )}
        <div style={{ padding: "14px 16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#8B5E3C", textTransform: "uppercase", letterSpacing: 1 }}>
              {CATEGORIES.find(c => c.key === post.categories[0])?.label || "Feature"}
            </span>
          </div>
          <h3 style={{
            fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 16, fontWeight: 700,
            color: "#2C1810", margin: "0 0 6px", lineHeight: 1.3,
            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>{post.title}</h3>
          {post.subtitle && (
            <p style={{
              fontSize: 13, color: "#8B7355", lineHeight: 1.5, margin: "0 0 auto",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>{post.subtitle}</p>
          )}
          <div style={{ fontSize: 14, color: "#8B7355", marginTop: 10 }}>{fmtDate(post.pubDate)}</div>
        </div>
      </div>
    </a>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: "'Source Sans 3',sans-serif", color: "#2C1810" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <NavBar />

      {/* Local news ticker — coming soon via Cloudflare Worker */}

      {/* Header */}
      <div id="main-content" style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 5, height: 5, background: "#4A7A5A", borderRadius: "50%" }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: "#8B7355", textTransform: "uppercase" }}>NapaServe</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, color: "#2C1810", margin: "0 0 4px" }}>Napa Valley Features</h1>
            <p style={{ fontSize: 17, color: "#8B7355", margin: "0 0 24px" }}>
              Stories and analysis about the issues shaping Napa County — from Napa Valley Features
            </p>
          </div>
          <a href="https://napavalleyfocus.substack.com/account?utm_medium=web&utm_source=napaserve&utm_content=subscribe" target="_blank" rel="noopener noreferrer" aria-label="Subscribe on Substack, opens in new tab" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 20px", fontSize: 13, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
            background: "transparent", border: "1px solid rgba(139,105,20,0.25)",
            color: "#8B5E3C", borderRadius: 8, textDecoration: "none", marginTop: 4,
          }}>
            Subscribe
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4 1.5H1.5V10.5H10.5V8" stroke="#8B5E3C" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M7 1.5H10.5V5" stroke="#8B5E3C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.5 1.5L5.5 6.5" stroke="#8B5E3C" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </a>
        </div>

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "1px solid rgba(44,24,16,0.12)", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)} style={{
              padding: "10px 16px", fontSize: 13, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
              background: "none", color: category === c.key ? "#2C1810" : "#7A6A50",
              border: "none", borderBottom: category === c.key ? "2px solid #C4A050" : "2px solid transparent",
              cursor: "pointer", transition: "all 0.2s", marginBottom: -1, whiteSpace: "nowrap",
            }}>{c.label}</button>
          ))}
        </div>
      </div>

      {/* Overview block */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 0" }}>
        <div style={{ background: "#EDE8DE", border: "1px solid rgba(44,24,16,0.12)", padding: "28px 28px 24px", marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
            {[
              { value: "1,000+", label: "Stories Published" },
              { value: "6,000+", label: "Subscribers" },
              { value: "Bestseller", label: "Substack News" },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, minWidth: 120, textAlign: "center", padding: "10px 8px", background: "#F5F0E8", border: "1px solid rgba(44,24,16,0.08)" }}>
                <div style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 22, fontWeight: 700, color: "#C4A050", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1.5, color: "#8B7355", textTransform: "uppercase", marginTop: 4, fontFamily: "'Source Sans 3',sans-serif" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 17, color: "#7A6A50", lineHeight: 1.75, margin: 0, fontFamily: "'Source Sans 3',sans-serif" }}>
            Napa Valley Features launched in May 2023 as a fully independent, ad-free, conflict-of-interest-free local news platform built on a public radio model — all stories are free to read except our Thursday Under the Hood editions, which are for paid subscribers. In three years we've published over 1,000 stories, grown to more than 6,000 subscribers and earned Substack Bestseller status in the News category. After the cost of production, 100% of every subscription dollar goes directly to our contributors. No advertisers. No outside owners. No agenda except honest, accurate, hyperlocal journalism.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 60px" }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ width: 32, height: 32, border: "3px solid rgba(139,105,20,0.3)", borderTopColor: "#8B5E3C", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: "#8B7355", fontSize: 17 }}>Loading stories...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(138,58,42,0.08)", border: "1px solid rgba(184,92,56,0.3)", borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: "#8A3A2A", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* 3-column card grid with poll interstitial after row 2 */}
        {!loading && filtered.length > 0 && (<>
          {/* Rows 1-2 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 24 }}>
            {filtered.slice(0, 6).map((post, i) => (
              <ArticleCard key={i} post={post} />
            ))}
          </div>

          {/* Poll interstitials */}
          {(recentPolls.length > 0 || readerPolls.length > 0) && (
            <div style={{ margin: "32px 0" }}>
              {/* Recent Reader Pulse */}
              {recentPolls.length > 0 && (
                <div style={{ background: "#EDE8DE", border: "1px solid rgba(44,24,16,0.12)", padding: "28px 28px 24px", marginBottom: readerPolls.length > 0 ? 24 : 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: "#8B7355", textTransform: "uppercase", marginBottom: 4, fontFamily: "'Source Sans 3',sans-serif" }}>Recent Reader Pulse</div>
                  <p style={{ fontSize: 14, color: "#7A6A50", margin: "0 0 20px", fontFamily: "'Source Sans 3',sans-serif" }}>What readers are saying now</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {recentPolls.map(poll => {
                      const rawOpts = typeof poll.options_json === "string" ? (() => { try { return JSON.parse(poll.options_json); } catch { return []; } })() : (poll.options_json || []);
                      const opts = (Array.isArray(rawOpts) ? rawOpts : []).filter(o => o && (o.label || o.text));
                      const maxVotes = Math.max(...opts.map(o => Number(o.votes) || 0), 1);
                      const url = poll.substack_url && poll.substack_url.trim();
                      return (
                        <div key={poll.poll_id} style={{ background: "#F5F0E8", border: "1px solid rgba(44,24,16,0.08)", padding: "18px 20px" }}>
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
                    })}
                  </div>
                </div>
              )}

              {/* Most Engaged All Time */}
              {readerPolls.length > 0 && (
                <div style={{ background: "#EDE8DE", border: "1px solid rgba(44,24,16,0.12)", padding: "28px 28px 24px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: "#8B7355", textTransform: "uppercase", marginBottom: 4, fontFamily: "'Source Sans 3',sans-serif" }}>Most Engaged All Time</div>
                  <p style={{ fontSize: 14, color: "#7A6A50", margin: "0 0 20px", fontFamily: "'Source Sans 3',sans-serif" }}>Our highest-voted reader polls</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {readerPolls.map(poll => {
                      const rawOpts = typeof poll.options_json === "string" ? (() => { try { return JSON.parse(poll.options_json); } catch { return []; } })() : (poll.options_json || []);
                      const opts = (Array.isArray(rawOpts) ? rawOpts : []).filter(o => o && (o.label || o.text));
                      const maxVotes = Math.max(...opts.map(o => Number(o.votes) || 0), 1);
                      const url = poll.substack_url && poll.substack_url.trim();
                      return (
                        <div key={poll.poll_id} style={{ background: "#F5F0E8", border: "1px solid rgba(44,24,16,0.08)", padding: "18px 20px" }}>
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
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Remaining rows */}
          {filtered.length > 6 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 24, marginTop: (recentPolls.length > 0 || readerPolls.length > 0) ? 0 : 0 }}>
              {filtered.slice(6).map((post, i) => (
                <ArticleCard key={i + 6} post={post} />
              ))}
            </div>
          )}
        </>)}

        {/* Responsive: on mobile, grid collapses */}
        <style>{`@media (max-width: 820px) { [style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; } }`}</style>

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontSize: 17, color: "#8B7355" }}>No stories in this category yet.</p>
            <button onClick={() => setCategory("all")} style={{
              padding: "10px 20px", fontSize: 13, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
              background: "transparent", border: "1px solid rgba(139,105,20,0.25)",
              color: "#8B5E3C", borderRadius: 8, cursor: "pointer", marginTop: 12,
            }}>View all stories</button>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}

import { useEffect, useState } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";

const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";

const T = {
  bg:      "#F5F0E8",
  surface: "#EDE8DE",
  ink:     "#2C1810",
  accent:  "#8B5E3C",
  gold:    "#C4A050",
  muted:   "#8B7355",
  border:  "#D4C4A8",
  body:    "#5C4033",
};

const serif = "'Libre Baskerville', serif";
const font = "'Source Sans 3', sans-serif";
const mono = "monospace";

const ARTICLES = [
  {
    publication: "Napa Valley Features",
    headline: "Napa Cabernet Prices Break the Growth Curve",
    deck: "The weighted average price of Napa County cabernet sauvignon has declined for two consecutive years \u2014 the first such decline in the modern data series.",
    slug: "napa-cab-2025",
  },
  {
    publication: "Sonoma County Features",
    headline: "Sonoma Grape Prices Fall for a Second Year",
    deck: "Sonoma County\u2019s weighted average grape price declined for the second consecutive year in 2025, with cabernet sauvignon leading the drop.",
    slug: "sonoma-cab-2025",
  },
  {
    publication: "Lake County Features",
    headline: "Lake County Grape Prices Have Fallen 38% in Two Years",
    deck: "Lake County\u2019s weighted average grape price has dropped 38% since 2023, with chardonnay prices collapsing 70% in two years.",
    slug: "lake-county-cab-2025",
  },
];

function formatPostText(publication, headline, deck, slug) {
  const url = `napaserve.org/under-the-hood/${slug}`;
  const header = `${publication} \u00B7 UNDER THE HOOD`;
  const maxDeckLen = 300 - header.length - headline.length - url.length - 8;
  const truncatedDeck = deck && deck.length > maxDeckLen
    ? deck.slice(0, maxDeckLen - 1).trimEnd() + "\u2026"
    : (deck || "");
  return `${header}\n\n${headline}\n\n${truncatedDeck}\n\n${url}`;
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function bskyWebUrl(uri) {
  if (!uri) return "#";
  const m = uri.match(/^at:\/\/(did:[^/]+)\/app\.bsky\.feed\.post\/(.+)$/);
  if (m) return `https://bsky.app/profile/${m[1]}/post/${m[2]}`;
  return "#";
}

// ─── BlueSky Card ─────────────────────────────────────────────────────────────

function ArticleCard({ article, token }) {
  const [state, setState] = useState("idle"); // idle | preview | posting | success | error
  const [postUri, setPostUri] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const postText = formatPostText(article.publication, article.headline, article.deck, article.slug);

  function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleConfirm() {
    setState("posting");
    try {
      const body = {
        headline: article.headline,
        deck: article.deck,
        slug: article.slug,
        publication: article.publication,
      };
      if (imageFile) {
        const dataUrl = await readFileAsBase64(imageFile);
        body.imageData = dataUrl.split(",")[1];
        body.imageMimeType = imageFile.type;
      }
      const res = await fetch(`${WORKER}/api/bluesky-publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": token,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setPostUri(data.uri);
        setState("success");
      } else {
        setErrorMsg(data.error || "Unknown error");
        setState("error");
      }
    } catch (e) {
      setErrorMsg(e.message);
      setState("error");
    }
  }

  const btnBase = {
    fontFamily: font,
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    padding: "8px 16px",
  };

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: 20 }}>
      <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>
        {article.publication}
      </div>
      <h3 style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: T.ink, margin: "0 0 8px", lineHeight: 1.3 }}>
        {article.headline}
      </h3>
      <p style={{
        fontFamily: font, fontSize: 14, fontWeight: 300, color: T.body, lineHeight: 1.5, margin: "0 0 16px",
        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {article.deck}
      </p>

      {state === "idle" && (
        <button onClick={() => setState("preview")} style={{ ...btnBase, background: T.accent, color: "#fff" }}>
          Post to BlueSky
        </button>
      )}

      {state === "success" && (
        <div style={{ fontFamily: font, fontSize: 14, color: T.ink }}>
          Posted to @valleyworkscollab.bsky.social {"\u2713"}{" "}
          <a href={bskyWebUrl(postUri)} target="_blank" rel="noopener noreferrer" style={{ color: T.accent, textDecoration: "underline" }}>
            View post
          </a>
        </div>
      )}

      {state === "error" && (
        <div>
          <div style={{ fontFamily: font, fontSize: 13, color: "#8b2e2e", marginBottom: 8 }}>{errorMsg}</div>
          <button onClick={() => { setState("idle"); setErrorMsg(null); }} style={{ ...btnBase, background: T.accent, color: "#fff" }}>
            Try again
          </button>
        </div>
      )}

      {(state === "preview" || state === "posting") && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.08em", color: T.muted, marginBottom: 6 }}>POST PREVIEW</div>
          <pre style={{
            fontFamily: font, fontSize: 13, lineHeight: 1.5, color: T.ink,
            whiteSpace: "pre-wrap", wordBreak: "break-word",
            background: T.bg, padding: 12, borderRadius: 4, margin: "0 0 6px",
          }}>
            {postText}
          </pre>
          <div style={{ fontSize: 11, color: T.muted, marginBottom: 10 }}>
            {postText.length} / 300 characters
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.08em", color: T.muted, display: "block", marginBottom: 6 }}>
              ATTACH CHART IMAGE (OPTIONAL)
            </label>
            <input type="file" accept="image/png,image/jpeg" onChange={handleImageSelect}
              style={{ fontSize: 13, fontFamily: font, color: T.ink }} />
            {imagePreview && (
              <img src={imagePreview} alt="Chart preview" style={{ marginTop: 8, maxWidth: "100%", borderRadius: 4, border: `1px solid ${T.border}` }} />
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleConfirm} disabled={state === "posting"}
              style={{ ...btnBase, background: state === "posting" ? "#A89880" : T.accent, color: "#fff", opacity: state === "posting" ? 0.7 : 1 }}>
              {state === "posting" ? "Posting\u2026" : "Confirm & Post"}
            </button>
            <button onClick={() => setState("idle")} disabled={state === "posting"}
              style={{ ...btnBase, background: "transparent", color: T.accent, border: `1px solid ${T.accent}` }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function NapaServeAdmin() {
  const [locked, setLocked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(null);
  const [token, setToken] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("admin_token");
    if (!stored) { setLoading(false); return; }
    fetch(`${WORKER}/api/admin-verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": stored },
    })
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setToken(stored);
          setLocked(false);
        } else {
          sessionStorage.removeItem("admin_token");
        }
      })
      .catch(() => sessionStorage.removeItem("admin_token"))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch(`${WORKER}/api/admin-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem("admin_token", data.token);
        setToken(data.token);
        setLocked(false);
      } else {
        setAuthError("Incorrect password");
      }
    } catch {
      setAuthError("Connection failed");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_token");
    setToken(null);
    setLocked(true);
    setPassword("");
  }

  if (loading) {
    return <div style={{ background: T.bg, minHeight: "100vh" }} />;
  }

  // ─── LOCKED ───────────────────────────────────────────────────────────────
  if (locked) {
    return (
      <div style={{ background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <form onSubmit={handleLogin} style={{ textAlign: "center", maxWidth: 320, width: "100%", padding: 24 }}>
          <div style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: T.ink, marginBottom: 4 }}>
            NapaServe
          </div>
          <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: T.gold, marginBottom: 32 }}>
            Admin
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{
              width: "100%", padding: "10px 14px", fontSize: 15, fontFamily: font,
              border: `1px solid ${T.border}`, borderRadius: 4, background: "#fff",
              color: T.ink, outline: "none", boxSizing: "border-box", marginBottom: 12,
            }}
          />
          <button type="submit" style={{
            width: "100%", padding: "10px 0", fontSize: 14, fontWeight: 600, fontFamily: font,
            background: T.accent, color: "#fff", border: "none", borderRadius: 4, cursor: "pointer",
          }}>
            Enter
          </button>
          {authError && (
            <div style={{ fontFamily: font, fontSize: 13, color: "#8b2e2e", marginTop: 12 }}>
              {authError}
            </div>
          )}
        </form>
      </div>
    );
  }

  // ─── UNLOCKED ─────────────────────────────────────────────────────────────
  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <NavBar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 60px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: T.gold, marginBottom: 8 }}>
              Valley Works Collaborative {"\u00B7"} NapaServe
            </div>
            <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 700, color: T.ink, margin: 0 }}>
              Admin
            </h1>
            <p style={{ fontFamily: font, fontSize: 17, fontWeight: 300, color: T.muted, margin: "8px 0 0" }}>
              Publisher & Operations Tools
            </p>
          </div>
          <button onClick={handleLogout} style={{
            fontFamily: mono, fontSize: 11, color: T.muted, background: "transparent",
            border: "none", cursor: "pointer", padding: "4px 0", marginTop: 4,
          }}>
            Sign out
          </button>
        </div>

        <div style={{ borderTop: `1px solid ${T.border}`, margin: "24px 0 32px" }} />

        {/* BlueSky Publisher section */}
        <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: T.gold, marginBottom: 6 }}>
          BlueSky Publisher
        </div>
        <p style={{ fontFamily: font, fontSize: 14, color: T.muted, margin: "0 0 24px" }}>
          Post Under the Hood articles to @valleyworkscollab.bsky.social
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {ARTICLES.map(article => (
            <ArticleCard key={article.slug} article={article} token={token} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

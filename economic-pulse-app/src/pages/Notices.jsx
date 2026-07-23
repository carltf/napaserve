// src/pages/Notices.jsx
// NapaServe — Public Notices page. Lists all active notices from the
// public_notices_public view (published + unexpired, routed to napaserve),
// read directly with the publishable anon key — same raw-fetch pattern as
// napaserve-event-finder.jsx. No Worker, no service_role.
//
// Notice bodies are markdown-ish text; renderBody() below extends the
// formatResponse regex pattern from napaserve-agent.jsx (bold, paragraphs,
// bullets) with links and italics — deliberately small, no markdown dependency.

import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Footer from "../Footer";
import NavBar from "../NavBar";
import { SEVERITY } from "../components/NoticeBanner";

const SUPABASE_URL = "https://csenpchwxxepdvjebsrt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_r-Ntp7zKRrH3JIVAjTKYmA_0szFdYGJ";

const font = "'Source Sans 3', 'Source Sans Pro', sans-serif";
const serif = "'Libre Baskerville', Georgia, serif";

// Small markdown renderer — extends napaserve-agent.jsx formatResponse
// (bold / paragraphs / bullets) with [text](url) links and *italics*.
// Escapes HTML first: view content is editor-controlled, but the escape is
// cheap insurance since this feeds dangerouslySetInnerHTML.
function renderBody(text) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const html = escaped
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#8B5E3C">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/\n\n/g, '</p><p style="margin:0 0 12px">')
    .replace(/\n- /g, '</p><li style="margin:0 0 4px">')
    .replace(/\n/g, "<br>");
  return `<p style="margin:0 0 12px">${html}</p>`;
}

function fmtDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch { return null; }
}

const chipStyle = (bg, color, border) => ({
  display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
  textTransform: "uppercase", color, background: bg, border: `1px solid ${border}`,
  borderRadius: 3, padding: "3px 9px",
});

export default function Notices() {
  const [notices, setNotices] = useState(null); // null = loading
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("");
  const location = useLocation();
  const scrolledRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/public_notices_public?publications=cs.{napaserve}&select=*&order=severity.desc,published_at.desc`,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
        );
        if (!res.ok) throw new Error(String(res.status));
        const rows = await res.json();
        if (!cancelled) setNotices(Array.isArray(rows) ? rows : []);
      } catch {
        if (!cancelled) { setError(true); setNotices([]); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Banner links land on /notices#<slug> — scroll once the data has rendered.
  useEffect(() => {
    if (!notices || scrolledRef.current) return;
    const slug = location.hash.replace(/^#/, "");
    if (!slug) return;
    const el = document.getElementById(slug);
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); scrolledRef.current = true; }
  }, [notices, location.hash]);

  const q = filter.trim().toLowerCase();
  const visible = (notices || []).filter(n => {
    if (!q) return true;
    const hay = [n.headline, n.summary, n.body, ...(n.category || [])].join(" ").toLowerCase();
    return hay.includes(q);
  });

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", color: "#2C1810", fontFamily: font }}>
      <NavBar />
      <div id="main-content" style={{ maxWidth: 860, margin: "0 auto", padding: "56px 24px 80px" }}>

        {/* Header */}
        <p style={{ fontFamily: serif, fontSize: "0.69rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8B5E3C", marginBottom: 16 }}>
          NapaServe · Community Safety
        </p>
        <h1 style={{ fontFamily: serif, fontSize: "clamp(1.8rem, 4.5vw, 2.6rem)", fontWeight: 700, lineHeight: 1.15, margin: "0 0 12px" }}>
          Public Notices
        </h1>
        <p style={{ fontSize: "1.02rem", color: "#7A6A50", lineHeight: 1.6, maxWidth: 620, margin: "0 0 32px" }}>
          Active advisories, warnings and emergency notices for Napa County, sourced from
          official agencies. Notices expire automatically when their period ends.
        </p>

        {/* Filter */}
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter notices — e.g. West Nile, road closure, Calistoga…"
          aria-label="Filter notices"
          style={{
            width: "100%", boxSizing: "border-box", padding: "10px 14px", fontSize: 15,
            fontFamily: font, color: "#2C1810", background: "#FFFFFF",
            border: "1px solid rgba(44,24,16,0.18)", borderRadius: 6, marginBottom: 28,
          }}
        />

        {/* States */}
        {notices === null && (
          <p style={{ color: "#8B7355", fontSize: 14 }}>Loading notices…</p>
        )}
        {notices !== null && error && (
          <p style={{ color: "#8A3A2A", fontSize: 14 }}>
            Notices could not be loaded right now. Please try again shortly.
          </p>
        )}
        {notices !== null && !error && notices.length === 0 && (
          <p style={{ color: "#8B7355", fontSize: 14 }}>
            No active public notices at this time.
          </p>
        )}
        {notices !== null && !error && notices.length > 0 && visible.length === 0 && (
          <p style={{ color: "#8B7355", fontSize: 14 }}>
            No notices match “{filter}”.
          </p>
        )}

        {/* Notice cards */}
        {visible.map(n => {
          const s = SEVERITY[n.severity] || SEVERITY[1];
          const effective = fmtDate(n.effective_at);
          const published = fmtDate(n.published_at);
          const expires = fmtDate(n.expires_at);
          return (
            <article key={n.id} id={n.slug} style={{
              background: "#FFFFFF", border: "1px solid rgba(44,24,16,0.12)",
              borderLeft: `4px solid ${n.severity === 4 ? s.bg : s.border}`,
              borderRadius: 8, padding: "24px 28px", marginBottom: 20,
              scrollMarginTop: 72,
            }}>
              {/* Chips row */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                <span style={chipStyle(
                  n.severity === 4 ? s.bg : s.bg,
                  n.severity === 4 ? s.text : s.accent,
                  s.border
                )}>{s.label}</span>
                {(n.category || []).map(c => (
                  <span key={c} style={chipStyle("#F5F0E8", "#7A6A50", "rgba(44,24,16,0.15)")}>{c}</span>
                ))}
                {(n.jurisdiction || []).map(j => (
                  <span key={j} style={chipStyle("transparent", "#8B7355", "rgba(44,24,16,0.12)")}>{j}</span>
                ))}
              </div>

              <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, lineHeight: 1.3, margin: "0 0 10px" }}>
                {n.headline}
              </h2>

              {/* Dates */}
              <p style={{ fontSize: 12.5, color: "#8B7355", margin: "0 0 16px" }}>
                {effective && <>Effective {effective}</>}
                {effective && published && " · "}
                {published && <>Published {published}</>}
                {expires && <> · Expires {expires}</>}
              </p>

              {/* Body */}
              <div
                style={{ fontSize: 15.5, lineHeight: 1.7, color: "#2C1810" }}
                dangerouslySetInnerHTML={{ __html: renderBody(n.body || n.summary || "") }}
              />

              {/* Hotline */}
              {n.public_hotline && (
                <p style={{
                  fontSize: 14, color: "#2C1810", background: "#F5F0E8",
                  border: "1px solid rgba(44,24,16,0.12)", borderRadius: 6,
                  padding: "10px 14px", margin: "16px 0 0",
                }}>
                  <strong>Hotline / reporting:</strong> {n.public_hotline}
                </p>
              )}

              {/* Source */}
              {n.source_agency && (
                <p style={{ fontSize: 13, color: "#8B7355", margin: "14px 0 0" }}>
                  Source: {n.source_url
                    ? <a href={n.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "#8B5E3C" }}>{n.source_agency}</a>
                    : n.source_agency}
                </p>
              )}
            </article>
          );
        })}
      </div>
      <Footer />
    </div>
  );
}

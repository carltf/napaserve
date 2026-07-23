// src/components/NoticeBanner.jsx
// NapaServe — site-wide Public Notices banner.
// Reads the public_notices_public view directly with the publishable anon key
// (same raw-fetch pattern as napaserve-event-finder.jsx) — no Worker, no
// service_role. Mounted once in App.jsx above <Routes>, so it shows on every
// route and its in-memory dismissal state survives client-side navigation.
//
// Severity convention: 1 Info · 2 Advisory · 3 Warning · 4 Emergency.
// Severity 4 is NOT dismissible. Dismissal is in-memory only (a React state
// set of ids) — NO localStorage/sessionStorage, per platform rule.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const SUPABASE_URL = "https://csenpchwxxepdvjebsrt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_r-Ntp7zKRrH3JIVAjTKYmA_0szFdYGJ";

// Cream-compatible severity palette — lightness carries the difference, not
// hue alone, so the tiers stay distinguishable for color-blind readers.
export const SEVERITY = {
  1: { label: "Info",      bg: "#E9EEF3", border: "#9FB3C4", text: "#2C4A66", accent: "#3E6284" },
  2: { label: "Advisory",  bg: "#F7EFD6", border: "#C4A050", text: "#6B5312", accent: "#8A6D1F" },
  3: { label: "Warning",   bg: "#F8E3CE", border: "#C87F3F", text: "#7A3E12", accent: "#A04E1C" },
  4: { label: "Emergency", bg: "#8A2A22", border: "#6E1F19", text: "#FFFFFF", accent: "#FFFFFF" },
};

const MAX_STACKED = 2; // cap banners of the same top severity; rest → "+N more"

export default function NoticeBanner() {
  const [notices, setNotices] = useState([]);
  const [dismissed, setDismissed] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/public_notices_public?publications=cs.{napaserve}&select=*&order=severity.desc,published_at.desc`,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
        );
        if (!res.ok) return; // fail silent — a broken banner must never break the site
        const rows = await res.json();
        if (!cancelled && Array.isArray(rows)) setNotices(rows);
      } catch {
        /* network error → render nothing */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const active = notices.filter(n => !dismissed.has(n.id));
  if (active.length === 0) return null; // empty result renders nothing — no empty bar

  // Show only the highest severity currently active; dismissing it reveals the
  // next tier on the same page load.
  const topSeverity = Math.max(...active.map(n => n.severity));
  const top = active.filter(n => n.severity === topSeverity);
  const shown = top.slice(0, MAX_STACKED);
  const overflow = top.length - shown.length;

  const dismiss = (id) => setDismissed(prev => { const next = new Set(prev); next.add(id); return next; });

  return (
    <div role="region" aria-label="Public notices">
      {shown.map(n => {
        const s = SEVERITY[n.severity] || SEVERITY[1];
        const emergency = n.severity === 4;
        return (
          <div key={n.id} style={{
            background: s.bg, borderBottom: `1px solid ${s.border}`,
            padding: emergency ? "12px 24px" : "8px 24px",
            fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
          }}>
            <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                flexShrink: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: emergency ? s.bg : "#FFFFFF",
                background: emergency ? s.text : s.accent, borderRadius: 3, padding: "3px 8px",
              }}>{s.label}</span>
              <Link to={`/notices#${n.slug}`} style={{
                flex: 1, minWidth: 0, color: s.text, textDecoration: "none",
                fontSize: emergency ? 15 : 13.5, fontWeight: emergency ? 700 : 600,
                lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {n.headline}
                <span style={{ fontWeight: 400, opacity: 0.85 }}> — details →</span>
              </Link>
              {!emergency && (
                <button onClick={() => dismiss(n.id)} aria-label={`Dismiss notice: ${n.headline}`} style={{
                  flexShrink: 0, background: "none", border: "none", cursor: "pointer",
                  color: s.text, opacity: 0.7, fontSize: 16, lineHeight: 1, padding: "2px 4px",
                  fontFamily: "inherit",
                }}>×</button>
              )}
            </div>
          </div>
        );
      })}
      {overflow > 0 && (
        <div style={{
          background: (SEVERITY[topSeverity] || SEVERITY[1]).bg,
          borderBottom: `1px solid ${(SEVERITY[topSeverity] || SEVERITY[1]).border}`,
          padding: "5px 24px", textAlign: "center",
          fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif", fontSize: 12.5,
        }}>
          <Link to="/notices" style={{ color: (SEVERITY[topSeverity] || SEVERITY[1]).text, fontWeight: 600 }}>
            +{overflow} more active notice{overflow > 1 ? "s" : ""} →
          </Link>
        </div>
      )}
    </div>
  );
}

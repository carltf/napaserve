/**
 * EventIntake.jsx
 * NapaServe Admin — URL-based event intake with Claude extraction + Supabase insert
 *
 * Drop into: economic-pulse-app/src/EventIntake.jsx
 * Requires: api/event-intake.js deployed as Vercel serverless function
 * Requires Vercel env vars: ANTHROPIC_API_KEY, SUPABASE_KEY
 *
 * Usage in admin page:
 *   import EventIntake from './EventIntake';
 *   <EventIntake />
 */

import { useState, useEffect, useRef } from "react";

// ── Theme (NapaServe Theme 02 Cream) ──────────────────────────────────────────
const T = {
  bg: "#F5F0E8",
  surface: "#EDE8DE",
  surfaceDeep: "#E4DDD0",
  ink: "#2C1810",
  inkMuted: "#6B5344",
  accent: "#8B5E3C",
  gold: "#C4A050",
  success: "#4A7C59",
  error: "#9B3A2A",
  border: "rgba(44,24,16,0.15)",
  borderStrong: "rgba(44,24,16,0.3)",
};

// ── Field schema for preview table ───────────────────────────────────────────
const FIELDS = [
  "title", "description", "event_date", "end_date",
  "start_time", "end_time", "venue_name", "address",
  "town", "category", "price_info", "is_free",
  "website_url", "ticket_url", "is_recurring", "recurrence_desc",
];

const FIELD_LABELS = {
  title: "Title", description: "Description", event_date: "Event Date",
  end_date: "End Date", start_time: "Start Time", end_time: "End Time",
  venue_name: "Venue", address: "Address", town: "Town",
  category: "Category", price_info: "Price", is_free: "Free?",
  website_url: "Website URL", ticket_url: "Ticket URL",
  is_recurring: "Recurring?", recurrence_desc: "Recurrence",
};

// ── API calls via /api/event-intake (Vercel serverless) ──────────────────────
async function extractFromUrl(url) {
  const res = await fetch("/api/event-intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "extract", url }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error ${res.status}`);
  }
  return await res.json();
}

async function extractFromContent(content, url) {
  const res = await fetch("/api/event-intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "extract", content, url }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error ${res.status}`);
  }
  const data = await res.json();
  if (!data.events || !Array.isArray(data.events)) {
    throw new Error("Unexpected response from event-intake API");
  }
  return data.events;
}

async function insertEvents(events) {
  const res = await fetch("/api/event-intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "insert", events }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error ${res.status}`);
  }
  return await res.json();
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function EventIntake() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState("idle");
  // phases: idle | needsPaste | extracting | countdown | preview | inserting | done | error
  const [pasteText, setPasteText] = useState("");
  const [events, setEvents] = useState([]);
  const [countdown, setCountdown] = useState(30);
  const [insertedCount, setInsertedCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const countdownRef = useRef(null);
  const cancelledRef = useRef(false);

  // ── Countdown logic ──
  useEffect(() => {
    if (phase !== "countdown") return;
    cancelledRef.current = false;
    setCountdown(30);
    countdownRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(countdownRef.current);
          if (!cancelledRef.current) doInsert();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [phase]);

  function cancelCountdown() {
    cancelledRef.current = true;
    clearInterval(countdownRef.current);
    setPhase("preview");
  }

  async function handleSubmit() {
    if (!url.trim()) return;
    setPhase("extracting");
    setErrorMsg("");
    try {
      const data = await extractFromUrl(url.trim());
      if (data.needsPaste) {
        setPhase("needsPaste");
        return;
      }
      if (!data.events || !Array.isArray(data.events)) {
        throw new Error("Unexpected response from event-intake API");
      }
      setEvents(data.events);
      setPhase("countdown");
    } catch (e) {
      setPhase("error");
      setErrorMsg(`Extraction failed: ${e.message}`);
    }
  }

  async function handlePasteSubmit() {
    if (!pasteText.trim()) return;
    setPhase("extracting");
    try {
      const extracted = await extractFromContent(pasteText, url.trim());
      setEvents(extracted);
      setPhase("countdown");
    } catch (e) {
      setPhase("error");
      setErrorMsg(`Extraction failed: ${e.message}`);
    }
  }

  async function doInsert() {
    setPhase("inserting");
    try {
      await insertEvents(events);
      setInsertedCount(events.length);
      setPhase("done");
    } catch (e) {
      setPhase("error");
      setErrorMsg(`Insert failed: ${e.message}`);
    }
  }

  function reset() {
    cancelledRef.current = true;
    clearInterval(countdownRef.current);
    setUrl("");
    setPasteText("");
    setEvents([]);
    setPhase("idle");
    setErrorMsg("");
    setCountdown(30);
  }

  const btn = (bg, color = "#fff", extra = {}) => ({
    padding: "9px 18px", background: bg, color,
    border: bg === "transparent" ? `1px solid ${T.border}` : "none",
    borderRadius: 5, fontSize: 14, fontWeight: 600,
    cursor: "pointer", fontFamily: "'Source Sans 3', sans-serif", ...extra,
  });

  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 8, padding: "24px 28px",
      fontFamily: "'Source Sans 3', sans-serif",
      color: T.ink, maxWidth: 780,
    }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 18, fontFamily: "'Libre Baskerville', serif", color: T.ink }}>
            Event Intake
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", color: T.accent,
            background: `${T.accent}18`, padding: "2px 7px", borderRadius: 3,
          }}>Admin</span>
        </div>
        <p style={{ fontSize: 13, color: T.inkMuted, margin: 0 }}>
          Paste a URL · Claude extracts event details · 30-second preview · auto-inserts to Supabase
        </p>
      </div>

      {/* ── IDLE ── */}
      {phase === "idle" && (
        <div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="https://www.mobilize.us/nokings/event/901623/"
              style={{
                flex: 1, padding: "10px 14px",
                background: T.bg, border: `1px solid ${T.borderStrong}`,
                borderRadius: 5, fontSize: 14, color: T.ink, outline: "none",
                fontFamily: "'Source Sans 3', sans-serif",
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!url.trim()}
              style={btn(!url.trim() ? T.inkMuted : T.accent)}
            >
              Extract →
            </button>
          </div>
        </div>
      )}

      {/* ── NEEDS PASTE ── */}
      {phase === "needsPaste" && (
        <div>
          <div style={{
            background: `${T.gold}18`, border: `1px solid ${T.gold}55`,
            borderRadius: 5, padding: "10px 14px", marginBottom: 12,
            fontSize: 13, color: T.inkMuted, lineHeight: 1.6,
          }}>
            ⚠️ <strong style={{ color: T.ink }}>Page requires JavaScript to render.</strong>
            <br />
            Open <a href={url} target="_blank" rel="noopener noreferrer"
              style={{ color: T.accent, wordBreak: "break-all" }}>{url}</a>,
            select all (⌘A), copy (⌘C), then paste below:
          </div>
          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            rows={8}
            placeholder="Paste the full page text here…"
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "10px 14px", background: T.bg,
              border: `1px solid ${T.borderStrong}`,
              borderRadius: 5, fontSize: 13, color: T.ink,
              resize: "vertical", outline: "none",
              fontFamily: "'Source Sans 3', sans-serif",
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={handlePasteSubmit} disabled={!pasteText.trim()}
              style={btn(pasteText.trim() ? T.accent : T.inkMuted)}>
              Extract from Paste →
            </button>
            <button onClick={reset} style={btn("transparent", T.inkMuted)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── EXTRACTING ── */}
      {phase === "extracting" && (
        <div style={{ padding: "28px 0", textAlign: "center", color: T.inkMuted, fontSize: 14 }}>
          <div style={{ fontSize: 26, marginBottom: 10 }}>🔍</div>
          Extracting event details with Claude…
        </div>
      )}

      {/* ── COUNTDOWN + PREVIEW ── */}
      {(phase === "countdown" || phase === "preview") && events.length > 0 && (
        <div>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 12,
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>
              {events.length} event{events.length !== 1 ? "s" : ""} extracted
            </span>
            {phase === "countdown" && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: T.inkMuted }}>
                  Auto-inserting in{" "}
                  <span style={{
                    fontWeight: 700, fontSize: 16,
                    color: countdown <= 5 ? T.error : T.accent,
                    display: "inline-block", minWidth: 18, textAlign: "center",
                  }}>{countdown}</span>s
                </span>
                <button onClick={cancelCountdown}
                  style={btn("transparent", T.inkMuted, { padding: "5px 12px", fontSize: 12 })}>
                  Cancel
                </button>
                <button onClick={() => {
                  cancelledRef.current = true;
                  clearInterval(countdownRef.current);
                  doInsert();
                }} style={btn(T.success, "#fff", { padding: "5px 14px", fontSize: 12 })}>
                  Insert Now
                </button>
              </div>
            )}
            {phase === "preview" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={reset} style={btn("transparent", T.inkMuted, { padding: "6px 14px" })}>
                  Cancel
                </button>
                <button onClick={doInsert} style={btn(T.success, "#fff", { padding: "6px 16px" })}>
                  Insert →
                </button>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {phase === "countdown" && (
            <div style={{
              height: 3, background: T.border, borderRadius: 2,
              marginBottom: 16, overflow: "hidden",
            }}>
              <div style={{
                height: "100%", borderRadius: 2,
                width: `${(countdown / 30) * 100}%`,
                background: countdown <= 5 ? T.error : T.accent,
                transition: "width 1s linear",
              }} />
            </div>
          )}

          {/* Event cards */}
          {events.map((ev, i) => (
            <div key={i} style={{
              background: T.bg, border: `1px solid ${T.border}`,
              borderRadius: 6, marginBottom: 12, overflow: "hidden",
            }}>
              <div style={{
                padding: "9px 14px", background: T.surfaceDeep,
                borderBottom: `1px solid ${T.border}`,
                fontSize: 13, fontWeight: 700, color: T.ink,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span>{ev.title || "(no title)"}</span>
                <span style={{ fontSize: 11, fontWeight: 400, color: T.inkMuted }}>
                  {ev.event_date}
                </span>
              </div>
              <div style={{ padding: "10px 14px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <tbody>
                    {FIELDS.map(f => {
                      const val = ev[f];
                      if (val === null || val === undefined || val === "") return null;
                      const display = typeof val === "boolean" ? (val ? "Yes" : "No") : String(val);
                      const isDesc = f === "description";
                      return (
                        <tr key={f} style={{ borderBottom: `1px solid ${T.border}` }}>
                          <td style={{
                            padding: "5px 10px 5px 0", width: 110,
                            fontWeight: 600, color: T.inkMuted,
                            verticalAlign: "top", whiteSpace: "nowrap",
                          }}>
                            {FIELD_LABELS[f]}
                          </td>
                          <td style={{
                            padding: "5px 0", color: T.ink,
                            ...(isDesc ? {
                              overflow: "hidden", display: "-webkit-box",
                              WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                              wordBreak: "break-word",
                            } : {}),
                          }}>
                            {display}
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td style={{ padding: "5px 10px 5px 0", fontWeight: 600, color: T.inkMuted }}>Status</td>
                      <td style={{ padding: "5px 0", color: T.success, fontWeight: 600 }}>approved</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "5px 10px 5px 0", fontWeight: 600, color: T.inkMuted }}>Source</td>
                      <td style={{ padding: "5px 0", color: T.inkMuted }}>napaserve_submission</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── INSERTING ── */}
      {phase === "inserting" && (
        <div style={{ padding: "28px 0", textAlign: "center", color: T.inkMuted, fontSize: 14 }}>
          <div style={{ fontSize: 26, marginBottom: 10 }}>📥</div>
          Inserting into Supabase…
        </div>
      )}

      {/* ── DONE ── */}
      {phase === "done" && (
        <div>
          <div style={{
            background: `${T.success}15`, border: `1px solid ${T.success}44`,
            borderRadius: 6, padding: "18px 20px", marginBottom: 16, textAlign: "center",
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.success }}>
              {insertedCount} event{insertedCount !== 1 ? "s" : ""} added to community_events
            </div>
          </div>
          <button onClick={reset} style={btn(T.accent)}>Add Another Event</button>
        </div>
      )}

      {/* ── ERROR ── */}
      {phase === "error" && (
        <div>
          <div style={{
            background: `${T.error}12`, border: `1px solid ${T.error}44`,
            borderRadius: 6, padding: "14px 18px", marginBottom: 14,
            fontSize: 13, color: T.error, lineHeight: 1.5,
          }}>
            ⚠️ {errorMsg}
          </div>
          <button onClick={reset} style={btn(T.accent)}>Try Again</button>
        </div>
      )}
    </div>
  );
}

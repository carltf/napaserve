import { useState, useEffect } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";

const T = {
  bg: "#F5F0E8",
  surface: "#EDE8DE",
  ink: "#2C1810",
  accent: "#8B5E3C",
  gold: "#C4A050",
  muted: "#8B7355",
  rule: "rgba(44,24,16,0.12)",
};
const font = "'Source Sans 3','Source Sans Pro',sans-serif";
const serif = "'Libre Baskerville',Georgia,serif";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function townDisplay(town) {
  if (!town) return "";
  return town.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function DigestCuration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [draftId, setDraftId] = useState(null);
  const [aiIntro, setAiIntro] = useState("");
  const [events, setEvents] = useState([]);
  const [included, setIncluded] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const generateDraft = async () => {
    setLoading(true);
    setError(null);
    setSent(false);
    setSendResult(null);
    try {
      const res = await fetch("/api/digest-draft", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate draft");
      setDraftId(data.draft_id);
      setAiIntro(data.ai_intro || "");
      setEvents(data.events || []);
      const inc = {};
      for (const ev of data.events || []) inc[ev.id] = true;
      setIncluded(inc);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleEvent = (id) => {
    setIncluded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectAll = () => {
    const inc = {};
    for (const ev of events) inc[ev.id] = true;
    setIncluded(inc);
  };

  const deselectAll = () => {
    setIncluded({});
  };

  const sendDigest = async () => {
    const selectedIds = Object.entries(included).filter(([, v]) => v).map(([k]) => Number(k));
    if (selectedIds.length === 0) {
      setError("Select at least one event");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/digest-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft_id: draftId, ai_intro: aiIntro, event_ids: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send digest");
      setSent(true);
      setSendResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const selectedCount = Object.values(included).filter(Boolean).length;

  return (
    <>
      <NavBar />
      <div id="main-content" style={{ background: T.bg, minHeight: "100vh", fontFamily: font }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px 64px" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>Email Digest</div>
            <h1 style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: T.ink, margin: 0, lineHeight: 1.2 }}>Weekly Digest Curation</h1>
            <p style={{ fontSize: 15, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>
              Generate an AI-drafted intro, curate events, and send the weekly digest to subscribers.
            </p>
          </div>

          {/* Generate button */}
          {!draftId && (
            <button
              onClick={generateDraft}
              disabled={loading}
              style={{
                background: T.ink, color: T.bg, border: "none", padding: "12px 28px",
                fontSize: 13, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
                cursor: loading ? "wait" : "pointer", fontFamily: font, marginBottom: 24,
              }}
            >
              {loading ? "Generating draft\u2026" : "Generate Draft"}
            </button>
          )}

          {error && (
            <div style={{ background: "#FDEDED", border: "1px solid #C62828", color: "#C62828", padding: "12px 16px", fontSize: 14, marginBottom: 20, fontFamily: font }}>
              {error}
            </div>
          )}

          {sent && sendResult && (
            <div style={{ background: "#E8F5E9", border: "1px solid #2E7D32", color: "#2E7D32", padding: "12px 16px", fontSize: 14, marginBottom: 20, fontFamily: font }}>
              Digest sent to {sendResult.recipients} subscribers with {sendResult.events_sent} events.
            </div>
          )}

          {/* Draft section */}
          {draftId && (
            <>
              {/* AI Intro editor */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8, fontFamily: font }}>
                  AI Intro
                  <span style={{ fontWeight: 400, color: T.muted, marginLeft: 8 }}>Edit before sending</span>
                </label>
                <textarea
                  value={aiIntro}
                  onChange={e => setAiIntro(e.target.value)}
                  rows={4}
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "12px 14px",
                    fontFamily: font, fontSize: 15, color: T.ink, lineHeight: 1.6,
                    background: T.surface, border: `1px solid ${T.rule}`,
                    resize: "vertical", outline: "none",
                  }}
                />
              </div>

              {/* Events list */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>
                    Events ({selectedCount} of {events.length} selected)
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={selectAll} style={{ background: "none", border: `1px solid ${T.rule}`, padding: "5px 12px", fontSize: 12, color: T.muted, cursor: "pointer", fontFamily: font }}>Select all</button>
                    <button onClick={deselectAll} style={{ background: "none", border: `1px solid ${T.rule}`, padding: "5px 12px", fontSize: 12, color: T.muted, cursor: "pointer", fontFamily: font }}>Deselect all</button>
                  </div>
                </div>

                {events.map(ev => (
                  <div
                    key={ev.id}
                    onClick={() => toggleEvent(ev.id)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "12px 14px", marginBottom: 4, cursor: "pointer",
                      background: included[ev.id] ? T.surface : "transparent",
                      border: `1px solid ${included[ev.id] ? T.rule : "transparent"}`,
                      transition: "background .15s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!included[ev.id]}
                      onChange={() => toggleEvent(ev.id)}
                      style={{ marginTop: 3, accentColor: T.accent, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: T.ink }}>{ev.title}</div>
                      <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>
                        {formatDate(ev.event_date)}
                        {ev.start_time ? ` \u00b7 ${ev.start_time}` : ""}
                        {ev.town ? ` \u00b7 ${townDisplay(ev.town)}` : ""}
                      </div>
                      <div style={{ fontSize: 12, color: T.accent, marginTop: 2, textTransform: "capitalize" }}>{ev.category}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Send button */}
              {!sent && (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <button
                    onClick={sendDigest}
                    disabled={sending || selectedCount === 0}
                    style={{
                      background: selectedCount === 0 ? T.muted : T.ink,
                      color: T.bg, border: "none", padding: "12px 28px",
                      fontSize: 13, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
                      cursor: sending || selectedCount === 0 ? "not-allowed" : "pointer", fontFamily: font,
                    }}
                  >
                    {sending ? "Sending\u2026" : `Send to Subscribers (${selectedCount} events)`}
                  </button>
                  <button
                    onClick={() => { setDraftId(null); setEvents([]); setIncluded({}); setAiIntro(""); setSent(false); }}
                    style={{ background: "none", border: `1px solid ${T.rule}`, padding: "10px 20px", fontSize: 13, color: T.muted, cursor: "pointer", fontFamily: font }}
                  >
                    Start Over
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const TOWN_ORDER = ["valley-wide", "american-canyon", "calistoga", "napa", "st-helena", "yountville"];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function townDisplay(town) {
  if (!town) return "Napa";
  const names = { "valley-wide": "Valley-Wide", "american-canyon": "American Canyon", "st-helena": "St. Helena" };
  if (names[town]) return names[town];
  return town.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function groupByTown(events) {
  const byTown = {};
  for (const ev of events) {
    const t = ev.town || "napa";
    if (!byTown[t]) byTown[t] = [];
    byTown[t].push(ev);
  }
  const ordered = TOWN_ORDER.filter(t => byTown[t]);
  const rest = Object.keys(byTown).filter(t => !TOWN_ORDER.includes(t)).sort();
  return [...ordered, ...rest].map(t => ({ town: t, events: byTown[t] }));
}

export default function DigestCuration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [draftId, setDraftId] = useState(null);
  const [aiIntro, setAiIntro] = useState("");
  const [events, setEvents] = useState([]);
  const [included, setIncluded] = useState({});
  const [skyEvents, setSkyEvents] = useState([]);
  const [skyIncluded, setSkyIncluded] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [formatting, setFormatting] = useState({});
  const [generatingIntro, setGeneratingIntro] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [eventLimit, setEventLimit] = useState(5);
  const [hasMore, setHasMore] = useState(false);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchExhausted, setFetchExhausted] = useState(false);
  const [previewSent, setPreviewSent] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(null);
  const formatAbort = useRef(null);

  const formatEventAsync = useCallback(async (ev) => {
    setFormatting(prev => ({ ...prev, [ev.id]: true }));
    try {
      const res = await fetch("/api/digest-format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ev),
      });
      const data = await res.json();
      if (res.ok && data.formatted) {
        setEvents(prev => prev.map(e => e.id === ev.id ? {
          ...e,
          formatted: data.formatted,
          website_url: data.enriched_website_url || e.website_url,
        } : e));
      }
    } catch (err) {
      console.warn(`Format failed for "${ev.title}":`, err);
    } finally {
      setFormatting(prev => ({ ...prev, [ev.id]: false }));
    }
  }, []);

  const autoFormatAll = useCallback(async (eventsToFormat) => {
    for (let i = 0; i < eventsToFormat.length; i++) {
      await formatEventAsync(eventsToFormat[i]);
      if (i < eventsToFormat.length - 1) {
        await new Promise(r => setTimeout(r, 300));
      }
    }
  }, [formatEventAsync]);

  const fetchDraft = async (limit) => {
    const res = await fetch(`/api/digest-draft?limit=${limit}`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to generate draft");
    return data;
  };

  const generateDraft = async () => {
    setLoading(true);
    setError(null);
    setSent(false);
    setSendResult(null);
    try {
      const data = await fetchDraft(eventLimit);
      setDraftId(data.draft_id);
      const loadedEvents = data.events || [];
      setEvents(loadedEvents);
      setHasMore(data.hasMore || false);
      setTotalEvents(data.total || loadedEvents.length);
      // If we got fewer events than we asked for, there are no more to load
      setFetchExhausted(loadedEvents.length < eventLimit);
      const inc = {};
      for (const ev of loadedEvents) inc[ev.id] = true;
      setIncluded(inc);
      setSkyEvents(data.skyEvents || []);
      const skyInc = {};
      for (const ev of data.skyEvents || []) skyInc[ev.id] = true;
      setSkyIncluded(skyInc);
      setDateRange({ start: data.date_range_start || "", end: data.date_range_end || "" });

      // Fetch subscriber count for send warning
      try {
        const subRes = await fetch('https://csenpchwxxepdvjebsrt.supabase.co/rest/v1/napaserve_subscribers?select=email&unsubscribed=is.null', {
          headers: { 'apikey': 'sb_publishable_r-Ntp7zKRrH3JIVAjTKYmA_0szFdYGJ', 'Authorization': 'Bearer sb_publishable_r-Ntp7zKRrH3JIVAjTKYmA_0szFdYGJ' }
        });
        const subs = await subRes.json();
        setSubscriberCount(Array.isArray(subs) ? subs.length : null);
      } catch { setSubscriberCount(null); }

      // Auto-format all events
      if (loadedEvents.length > 0) {
        autoFormatAll(loadedEvents);
      }

      // Generate AI intro separately
      if (loadedEvents.length > 0) {
        setGeneratingIntro(true);
        try {
          const introRes = await fetch("/api/digest-intro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              events: loadedEvents,
              date_range_start: data.date_range_start,
              date_range_end: data.date_range_end,
            }),
          });
          const introData = await introRes.json();
          if (introRes.ok && introData.ai_intro) {
            setAiIntro(introData.ai_intro);
          } else {
            setAiIntro("");
          }
        } catch (introErr) {
          setAiIntro("");
        } finally {
          setGeneratingIntro(false);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    const newLimit = eventLimit + 5;
    setLoadingMore(true);
    setError(null);
    try {
      const data = await fetchDraft(newLimit);
      setEventLimit(newLimit);
      const loadedEvents = data.events || [];
      setHasMore(data.hasMore || false);
      setTotalEvents(data.total || loadedEvents.length);
      setFetchExhausted(loadedEvents.length < newLimit);

      // Find new events that weren't in the previous set
      const existingIds = new Set(events.map(e => e.id));
      const newEvents = loadedEvents.filter(e => !existingIds.has(e.id));

      // Merge: keep formatted versions for existing, add new
      setEvents(prev => {
        const prevMap = {};
        for (const e of prev) prevMap[e.id] = e;
        return loadedEvents.map(e => prevMap[e.id] || e);
      });

      const inc = {};
      for (const ev of loadedEvents) inc[ev.id] = included[ev.id] !== undefined ? included[ev.id] : true;
      setIncluded(inc);

      // Auto-format only the new events
      if (newEvents.length > 0) {
        autoFormatAll(newEvents);
      }

      // Update draft_id
      if (data.draft_id) setDraftId(data.draft_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleEvent = (id) => {
    setIncluded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSkyEvent = (id) => {
    setSkyIncluded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectAll = () => {
    const inc = {};
    for (const ev of events) inc[ev.id] = true;
    setIncluded(inc);
  };

  const deselectAll = () => {
    setIncluded({});
  };

  const sendPreview = async () => {
    const selectedIds = Object.entries(included).filter(([, v]) => v).map(([k]) => Number(k));
    const selectedSkyIds = Object.entries(skyIncluded).filter(([, v]) => v).map(([k]) => Number(k));
    if (selectedIds.length === 0 && selectedSkyIds.length === 0) { setError('Select at least one event'); return; }
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/digest-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft_id: draftId,
          ai_intro: aiIntro,
          event_ids: selectedIds,
          sky_event_ids: selectedSkyIds,
          preview_only: true,
          preview_email: 'info@napaserve.com',
          formatted_events: events.reduce((acc, ev) => { if (ev.formatted) acc[ev.id] = ev.formatted; return acc; }, {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Preview failed');
      setPreviewSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const sendDigest = async () => {
    const selectedIds = Object.entries(included).filter(([, v]) => v).map(([k]) => Number(k));
    const selectedSkyIds = Object.entries(skyIncluded).filter(([, v]) => v).map(([k]) => Number(k));
    if (selectedIds.length === 0 && selectedSkyIds.length === 0) {
      setError("Select at least one event");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/digest-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft_id: draftId,
          ai_intro: aiIntro,
          event_ids: selectedIds,
          sky_event_ids: selectedSkyIds,
          formatted_events: events.reduce((acc, ev) => { if (ev.formatted) acc[ev.id] = ev.formatted; return acc; }, {}),
        }),
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

  // Auth gate — redirect to /admin if not authenticated
  useEffect(() => {
    if (sessionStorage.getItem("nvf_admin") !== "true") {
      navigate("/admin");
    }
  }, [navigate]);

  const selectedCount = Object.values(included).filter(Boolean).length;
  const townGroups = groupByTown(events);

  return (
    <>
      <NavBar />
      <div id="main-content" style={{ background: T.bg, minHeight: "100vh", fontFamily: font }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px 64px" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: T.gold, marginBottom: 8 }}>Napa Valley Features</div>
            <h1 style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: T.ink, margin: 0, lineHeight: 1.2 }}>The Napa Valley Weekender</h1>
            <p style={{ fontSize: 15, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>
              Review upcoming events, edit the intro, and send the weekly digest to subscribers.
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
                  <span style={{ fontWeight: 400, color: T.muted, marginLeft: 8 }}>
                    {generatingIntro ? "Generating\u2026" : "Edit before sending"}
                  </span>
                </label>
                <textarea
                  value={generatingIntro ? "Generating AI intro\u2026" : aiIntro}
                  onChange={e => setAiIntro(e.target.value)}
                  disabled={generatingIntro}
                  rows={5}
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "12px 14px",
                    fontFamily: font, fontSize: 15, color: generatingIntro ? T.muted : T.ink, lineHeight: 1.6,
                    background: T.surface, border: `1px solid ${T.rule}`,
                    resize: "vertical", outline: "none",
                    fontStyle: generatingIntro ? "italic" : "normal",
                  }}
                />
              </div>

              {/* Events grouped by town */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>
                    Events ({selectedCount} of {events.length} selected{totalEvents > events.length ? ` \u00b7 ${totalEvents} total available` : ""})
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={selectAll} style={{ background: "none", border: `1px solid ${T.rule}`, padding: "5px 12px", fontSize: 12, color: T.muted, cursor: "pointer", fontFamily: font }}>Select all</button>
                    <button onClick={deselectAll} style={{ background: "none", border: `1px solid ${T.rule}`, padding: "5px 12px", fontSize: 12, color: T.muted, cursor: "pointer", fontFamily: font }}>Deselect all</button>
                  </div>
                </div>

                {townGroups.map(({ town, events: townEvents }) => (
                  <div key={town} style={{ marginBottom: 20 }}>
                    {/* Town header */}
                    <div style={{
                      fontFamily: serif, fontSize: 16, fontWeight: 700, color: T.ink,
                      borderBottom: `2px solid ${T.gold}`, paddingBottom: 6, marginBottom: 8,
                    }}>
                      {townDisplay(town)}
                    </div>

                    {townEvents.map(ev => {
                      const tag = ev.is_recurring ? "(R)" : "(N)";
                      const tagColor = ev.is_recurring ? T.muted : T.gold;
                      const isFormatting = !!formatting[ev.id];
                      return (
                        <div
                          key={ev.id}
                          onClick={() => toggleEvent(ev.id)}
                          style={{
                            display: "flex", alignItems: "flex-start", gap: 12,
                            padding: "10px 14px", marginBottom: 2, cursor: "pointer",
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
                            <div style={{ fontSize: 15, marginBottom: 2 }}>
                              <span style={{ fontWeight: 700, color: tagColor, fontSize: 12, letterSpacing: ".04em" }}>{tag}</span>
                              <span style={{ fontWeight: 600, color: T.ink, marginLeft: 4 }}>{ev.title}</span>
                            </div>

                            {isFormatting ? (
                              <div style={{ fontSize: 13, color: T.muted, fontStyle: "italic", padding: "4px 0" }}>{"Formatting\u2026"}</div>
                            ) : ev.formatted ? (
                              <div style={{
                                fontSize: 13, color: T.ink, lineHeight: 1.55,
                                whiteSpace: "pre-wrap", marginTop: 4,
                              }}>
                                {ev.formatted
                                  .replace(/for\s+more\s+information\s+visit\s+their\s+website\s*(\([^)]*\))?\s*\.?\s*/gi, "")
                                  .replace(/visit\s+their\s+website\s*\.?\s*/gi, "")
                                  .trim()}
                              </div>
                            ) : (
                              <>
                                <div style={{ fontSize: 13, color: T.muted }}>
                                  {formatDate(ev.event_date)}
                                  {ev.start_time ? ` \u00b7 ${ev.start_time}` : ""}
                                  {ev.end_time ? `\u2013${ev.end_time}` : ""}
                                  {ev.venue_name ? ` \u00b7 ${ev.venue_name}` : ""}
                                </div>
                                {ev.address && <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{ev.address}</div>}
                                {(ev.price_info || ev.is_free) && <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{ev.price_info || "Free"}</div>}
                              </>
                            )}

                            {/* Best available URL: website_url → ticket_url → source_url → regex from description */}
                            {!ev.formatted && (() => {
                              const ensureUrl = (u) => {
                                if (!u) return null;
                                if (/^https?:\/\//.test(u)) return u;
                                if (/^www\./.test(u) || /\.\w{2,}/.test(u)) return "https://" + u;
                                return null;
                              };
                              const bestUrl = ensureUrl(ev.website_url) || ensureUrl(ev.ticket_url)
                                || ensureUrl(ev.source_url)
                                || ((ev.description || "").match(/https?:\/\/[^\s)]+/) || [])[0]
                                || null;
                              if (!bestUrl) return null;
                              return (
                                <a
                                  href={bestUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  style={{ fontSize: 12, color: T.accent, textDecoration: "none", marginTop: 3, display: "inline-block" }}
                                >
                                  {bestUrl.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]} &#8599;
                                </a>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Load more button — show if we have >=3 events, haven't exhausted the pool, and limit < 25 */}
                {events.length >= 3 && !fetchExhausted && eventLimit < 25 && (
                  <div style={{ textAlign: "center", marginTop: 16 }}>
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      style={{
                        background: "#fff", border: "1px solid #e5e0d8", padding: "10px 24px",
                        fontSize: 13, fontWeight: 600, color: T.ink, cursor: loadingMore ? "wait" : "pointer",
                        fontFamily: font,
                      }}
                    >
                      {loadingMore ? "Loading\u2026" : `Load more events (showing ${events.length}${totalEvents > events.length ? ` of ${totalEvents}` : ""})`}
                    </button>
                  </div>
                )}
              </div>

              {/* Night Sky section */}
              {skyEvents.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{
                    fontFamily: serif, fontSize: 16, fontWeight: 700, color: T.gold,
                    borderBottom: `2px solid ${T.gold}`, paddingBottom: 6, marginBottom: 8,
                  }}>
                    Night Sky
                  </div>
                  {skyEvents.map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => toggleSkyEvent(ev.id)}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 12,
                        padding: "10px 14px", marginBottom: 2, cursor: "pointer",
                        background: skyIncluded[ev.id] ? T.surface : "transparent",
                        border: `1px solid ${skyIncluded[ev.id] ? T.rule : "transparent"}`,
                        transition: "background .15s",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!skyIncluded[ev.id]}
                        onChange={() => toggleSkyEvent(ev.id)}
                        style={{ marginTop: 3, accentColor: T.accent, flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, marginBottom: 2 }}>
                          {ev.is_notable && <span style={{ marginRight: 4 }}>&#11088;</span>}
                          <span style={{ fontWeight: 600, color: T.ink }}>{ev.title}</span>
                        </div>
                        <div style={{ fontSize: 13, color: T.muted }}>
                          {formatDate(ev.event_date)}
                          {ev.end_date && ev.end_date !== ev.event_date ? ` \u2013 ${formatDate(ev.end_date)}` : ""}
                          {ev.peak_time ? ` \u00b7 Peak: ${ev.peak_time}` : ""}
                        </div>
                        {ev.viewing_notes && (
                          <div style={{ fontSize: 12, color: T.muted, fontStyle: "italic", marginTop: 2 }}>{ev.viewing_notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Send button */}
              {!sent && (
                <div style={{ marginTop: 8 }}>
                  {/* Step 1 — Send preview */}
                  {!previewSent && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>
                        Step 1 — Send preview to info@napaserve.com
                      </div>
                      <button
                        onClick={sendPreview}
                        disabled={sending || selectedCount === 0}
                        style={{ background: T.surface, color: T.ink, border: `1px solid ${T.rule}`, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: sending || selectedCount === 0 ? 'not-allowed' : 'pointer', fontFamily: font, marginRight: 12 }}
                      >
                        {sending ? 'Sending preview…' : 'Send Preview to info@napaserve.com'}
                      </button>
                    </div>
                  )}

                  {/* Step 1 complete */}
                  {previewSent && !sent && (
                    <div style={{ fontSize: 13, color: '#5A7A50', fontWeight: 600, marginBottom: 16 }}>
                      ✓ Preview sent to info@napaserve.com — check your inbox before sending live.
                    </div>
                  )}

                  {/* Step 2 — Send live (only active after preview sent) */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: previewSent ? T.muted : '#C0B8B0', marginBottom: 8 }}>
                      Step 2 — Send to all subscribers
                    </div>
                    {subscriberCount !== null && previewSent && (
                      <div style={{ fontSize: 13, color: '#8A3A2A', fontWeight: 600, background: 'rgba(138,58,42,0.07)', border: '1px solid rgba(138,58,42,0.2)', padding: '10px 14px', borderRadius: 6, marginBottom: 12 }}>
                        ⚠ This will send to {subscriberCount.toLocaleString()} subscribers. This cannot be undone.
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button
                        onClick={sendDigest}
                        disabled={sending || selectedCount === 0 || !previewSent}
                        style={{
                          background: !previewSent ? '#C0B8B0' : selectedCount === 0 ? T.muted : '#8A3A2A',
                          color: T.bg,
                          border: 'none',
                          padding: '12px 28px',
                          fontSize: 13,
                          fontWeight: 700,
                          letterSpacing: '.1em',
                          textTransform: 'uppercase',
                          cursor: sending || selectedCount === 0 || !previewSent ? 'not-allowed' : 'pointer',
                          fontFamily: font,
                        }}
                      >
                        {sending ? 'Sending…' : `Send to ${subscriberCount ? subscriberCount.toLocaleString() : ''} Subscribers (${selectedCount} events)`}
                      </button>
                      <button
                        onClick={() => { setDraftId(null); setEvents([]); setIncluded({}); setSkyEvents([]); setSkyIncluded({}); setAiIntro(''); setSent(false); setEventLimit(5); setHasMore(false); setFetchExhausted(false); setPreviewSent(false); setSubscriberCount(null); }}
                        style={{ background: 'none', border: `1px solid ${T.rule}`, padding: '10px 20px', fontSize: 13, color: T.muted, cursor: 'pointer', fontFamily: font }}
                      >
                        Start Over
                      </button>
                    </div>
                  </div>
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

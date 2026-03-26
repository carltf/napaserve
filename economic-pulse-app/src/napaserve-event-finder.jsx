import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Footer from "./Footer";
import NavBar from "./NavBar";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const SEARCH_API = "https://napa-event-finder.vercel.app";
const SUPABASE_URL = "https://csenpchwxxepdvjebsrt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_r-Ntp7zKRrH3JIVAjTKYmA_0szFdYGJ";

const TOWNS = [
  { value: "all", label: "All Napa Valley" },
  { value: "napa", label: "Napa" },
  { value: "yountville", label: "Yountville" },
  { value: "st-helena", label: "St. Helena" },
  { value: "calistoga", label: "Calistoga" },
  { value: "american-canyon", label: "American Canyon" },
];

const CATEGORIES = [
  { value: "any", label: "All Events" },
  { value: "art", label: "Art & Exhibits" },
  { value: "music", label: "Live Music" },
  { value: "food", label: "Food & Wine" },
  { value: "community", label: "Community & Family" },
  { value: "wellness", label: "Wellness" },
  { value: "nightlife", label: "Nightlife" },
  { value: "movies", label: "Movies" },
  { value: "theatre", label: "Theatre & Performance" },
  { value: "astronomy", label: "Night Sky" },
];

function todayStr() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function plusDays(ymd, n) {
  const d = new Date(ymd + "T12:00:00"); d.setDate(d.getDate() + n);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function fmtDateNice(ymd) {
  return new Date(ymd + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
// AP-style date: "Saturday, March 28"
function fmtDateAP(ymd) {
  if (!ymd) return "";
  const d = new Date(ymd + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
// AP-style time: "10 a.m." or "6:30 p.m."
function fmtTimeAP(t) {
  if (!t) return "";
  const m = t.match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM|a\.m\.|p\.m\.)?$/i);
  if (!m) return t;
  let hr = parseInt(m[1], 10);
  const min = m[2] || "00";
  let period = (m[3] || "").replace(/\./g, "").toLowerCase();
  if (!period) { period = hr >= 12 ? "pm" : "am"; if (hr > 12) hr -= 12; if (hr === 0) hr = 12; }
  else { if (period === "pm" && hr > 12) hr -= 12; if (period === "am" && hr === 0) hr = 12; }
  const suffix = period === "pm" ? "p.m." : "a.m.";
  return min === "00" ? `${hr} ${suffix}` : `${hr}:${min} ${suffix}`;
}
function fmtPriceAP(ev) {
  if (ev.is_free) return "Free.";
  if (ev.price_info) return ev.price_info.endsWith(".") ? ev.price_info : ev.price_info + ".";
  // Reception heuristic: receptions at galleries are almost always free
  const text = ((ev.title || "") + " " + (ev.description || "")).toLowerCase();
  if (/\b(reception|opening reception|closing reception)\b/.test(text)) return "Free.";
  return "Price not provided.";
}
function townLabel(t) {
  if (!t) return "";
  const m = { "st-helena": "St. Helena", "american-canyon": "American Canyon" };
  return m[t] || t.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const QUICK_DATES = [
  { label: "Today", get: () => ({ s: todayStr(), e: todayStr() }) },
  { label: "This Weekend", get: () => {
    const d = new Date(), day = d.getDay();
    const fri = new Date(d); fri.setDate(d.getDate() + ((5 - day + 7) % 7 || 7));
    const sun = new Date(fri); sun.setDate(fri.getDate() + 2);
    const f = x => x.getFullYear() + "-" + String(x.getMonth()+1).padStart(2,"0") + "-" + String(x.getDate()).padStart(2,"0");
    return { s: f(fri), e: f(sun) };
  }},
  { label: "Next 7 Days", get: () => ({ s: todayStr(), e: plusDays(todayStr(), 7) }) },
  { label: "Next 14 Days", get: () => ({ s: todayStr(), e: plusDays(todayStr(), 14) }) },
  { label: "Next 30 Days", get: () => ({ s: todayStr(), e: plusDays(todayStr(), 30) }) },
];

// Parse URLs and details from event body text
function parseEventBody(body) {
  if (!body) return { text: "", urls: [] };
  
  const urls = [];
  // Match URLs in parentheses: (https://...)
  const parenUrlRe = /\(?(https?:\/\/[^\s)]+)\)?/g;
  let match;
  while ((match = parenUrlRe.exec(body)) !== null) {
    urls.push(match[1]);
  }
  
  // Clean the body text: remove URLs and their surrounding parens/labels
  let text = body
    .replace(/For more information visit their website\s*\(https?:\/\/[^\s)]+\/?\)\.\s*/gi, "")
    .replace(/\(https?:\/\/[^\s)]+\)/g, "")
    .replace(/https?:\/\/[^\s)]+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  
  // Remove trailing period if text ends with one after cleanup
  if (text.endsWith(". .")) text = text.slice(0, -2).trim();
  
  return { text, urls };
}

function linkLabel(url) {
  if (/ticket|eventbrite|buy|purchase/i.test(url)) return "Get Tickets";
  if (/facebook\.com/i.test(url)) return "Facebook";
  if (/instagram\.com/i.test(url)) return "Instagram";
  return "More Info";
}
const inputBase = {
  width: "100%", padding: "10px 12px", fontSize: 14, fontFamily: "'Source Sans 3',sans-serif",
  background: "#F5F0E8", border: "1px solid rgba(139,105,20,0.25)", color: "#2C1810",
  borderRadius: 8, outline: "none", boxSizing: "border-box",
};
const labelBase = { display: "block", fontSize: 13, fontWeight: 600, color: "#7A6A50", marginBottom: 6 };
const required = <span style={{ color: "#8A3A2A", marginLeft: 2 }}>*</span>;
const sectionHeader = (text) => (
  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#8B5E3C", textTransform: "uppercase", marginBottom: 14, marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(139,105,20,0.1)" }}>{text}</div>
);

// ═══════════════════════════════════════════════════════════════════════════
// CHOICE BUTTONS (reusable for age, indoor/outdoor, etc.)
// ═══════════════════════════════════════════════════════════════════════════

function ChoiceGroup({ options, value, onChange, color = "#8B5E3C" }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map(opt => {
        const sel = value === opt.value;
        return (
          <button key={opt.value} onClick={() => onChange(opt.value)} style={{
            padding: "8px 16px", fontSize: 13, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
            background: sel ? `${color}20` : "#EDE8DE",
            border: `1px solid ${sel ? color + "55" : "rgba(44,24,16,0.12)"}`,
            color: sel ? color : "#7A6A50",
            borderRadius: 6, cursor: "pointer", transition: "all 0.15s",
          }}>{opt.label}</button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT MAP — loads Leaflet dynamically
// ═══════════════════════════════════════════════════════════════════════════

function EventMap({ pins }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Load Leaflet CSS and JS dynamically
  useEffect(() => {
    if (window.L) { setLeafletLoaded(true); return; }

    // CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // JS
    if (!document.querySelector('script[src*="leaflet"]')) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => setLeafletLoaded(true);
      document.head.appendChild(script);
    }
  }, []);

  // Initialize or update map when pins change
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !pins || pins.length === 0) return;
    const L = window.L;

    // Clean up old map
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = L.map(mapRef.current, { scrollWheelZoom: false });
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 17,
    }).addTo(map);

    const markers = [];
    pins.forEach(pin => {
      if (pin.lat && pin.lon) {
        const marker = L.marker([pin.lat, pin.lon]).addTo(map);
        marker.bindPopup(`<strong style="font-size:13px">${pin.name}</strong>`);
        markers.push(marker);
      }
    });

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.15));
    } else {
      map.setView([38.3, -122.3], 11);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [leafletLoaded, pins]);

  if (!pins || pins.length === 0) return null;

  return (
    <div style={{
      background: "#EDE8DE", border: "1px solid rgba(139,105,20,0.15)",
      overflow: "hidden", marginTop: 20,
    }}>
      <div style={{ padding: "14px 20px 8px" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#8B5E3C", textTransform: "uppercase" }}>Event Locations</span>
        <span style={{ fontSize: 14, color: "#8B7355", marginLeft: 10 }}>{pins.length} on map</span>
      </div>
      <div ref={mapRef} style={{ width: "100%", height: 340 }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════

export default function EventFinder() {
  const location = useLocation();

  const [tab, setTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#submit') {
      return 'submit';
    }
    return 'search';
  });

  // Switch tab when React Router location.hash changes (e.g. <Link to="/events#submit">)
  useEffect(() => {
    if (location.hash === '#submit') {
      setTab('submit');
    } else {
      setTab('search');
    }
  }, [location.hash]);

  // Listen for browser hashchange events (back/forward navigation)
  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#submit') {
        setTab('submit');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Search state
  const [town, setTown] = useState("all");
  const [type, setType] = useState("any");
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(plusDays(todayStr(), 14));
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeQuick, setActiveQuick] = useState(null);

  // Submit state
  const emptyForm = {
    title: "", description: "", event_date: "", end_date: "", start_time: "", end_time: "",
    venue_name: "", address: "", town: "napa", category: "community",
    price_info: "", is_free: false,
    age_restriction: "all_ages", indoor_outdoor: "indoor",
    is_recurring: false, recurrence_desc: "",
    website_url: "", ticket_url: "",
    organizer_contact: "", accessibility_info: "", submitted_by: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const uf = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  // Search
  const search = useCallback(async () => {
    setLoading(true); setError(null); setResults(null);
    try {
      if (type === "astronomy") {
        // Query astronomical_events directly from Supabase
        const url = `${SUPABASE_URL}/rest/v1/astronomical_events`
          + `?select=id,title,description,event_date,end_date,peak_time,viewing_notes,is_notable`
          + `&event_date=gte.${startDate}&event_date=lte.${endDate}`
          + `&order=event_date.asc&limit=10`;
        const res = await fetch(url, {
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        });
        if (!res.ok) throw new Error("Night Sky search failed");
        const data = await res.json();
        // Map to the same shape as search API results
        setResults({
          ok: true,
          results: data.map(ev => ({
            header: ev.title,
            body: [
              fmtDateAP(ev.event_date),
              ev.end_date && ev.end_date !== ev.event_date ? ` through ${fmtDateAP(ev.end_date)}` : "",
              ev.peak_time ? `. Peak viewing: ${ev.peak_time}` : "",
              ev.description ? `. ${ev.description}` : "",
              ev.viewing_notes ? ` ${ev.viewing_notes}` : "",
            ].filter(Boolean).join(""),
            _sky: true,
          })),
        });
      } else {
        const params = new URLSearchParams({ town, type, start: startDate, end: endDate, limit: "10" });
        const res = await fetch(`${SEARCH_API}/api/search?${params}`);
        const data = await res.json();
        if (!data.ok) throw new Error("Search returned an error");
        setResults(data);
      }
    } catch (err) {
      setError(err.message || "Search failed. Event sources may be temporarily unavailable.");
    } finally { setLoading(false); }
  }, [town, type, startDate, endDate]);

  // Submit
  const submitEvent = async () => {
    if (!form.title.trim()) { setSubmitError("Event name is required."); return; }
    if (!form.event_date) { setSubmitError("Date is required."); return; }
    if (!form.town) { setSubmitError("Town is required."); return; }
    if (!form.category) { setSubmitError("Category is required."); return; }
    if (!form.description.trim()) { setSubmitError("A brief description is required."); return; }

    setSubmitting(true); setSubmitError(null);
    try {
      const row = {};
      for (const [k, v] of Object.entries(form)) {
        if (typeof v === "string" && v.trim() === "") { row[k] = null; }
        else { row[k] = v; }
      }
      row.title = form.title.trim();
      row.description = form.description.trim();
      row.status = "pending";
      row.source = "community";

      const res = await fetch(`${SUPABASE_URL}/rest/v1/community_events`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(row),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Submit failed: ${res.status}`);
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally { setSubmitting(false); }
  };

  const resetForm = () => { setForm(emptyForm); setSubmitted(false); setSubmitError(null); };
  const applyQuick = (qd, i) => { const { s, e } = qd.get(); setStartDate(s); setEndDate(e); setActiveQuick(i); };

  const [featuredEvents, setFeaturedEvents] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/community_events?featured=eq.true&status=eq.approved&order=event_date.asc&limit=5`,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
        );
        if (res.ok) { const data = await res.json(); setFeaturedEvents(data); }
      } catch {}
    })();
  }, []);

  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const today = todayStr();
        const twoWeeks = plusDays(today, 14);
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/community_events?status=eq.approved&event_date=gte.${today}&event_date=lte.${twoWeeks}&order=event_date.asc&limit=6`,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
        );
        if (res.ok) { const data = await res.json(); setUpcomingEvents(data); }
      } catch {}
    })();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: "'Source Sans 3',sans-serif", color: "#2C1810" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <NavBar />

      {/* Header */}
      <div id="main-content" style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 6, height: 6, background: "#8B5E3C", borderRadius: "50%" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#8B5E3C", textTransform: "uppercase" }}>NapaServe</span>
        </div>
        <h1 style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, color: "#2C1810", margin: "0 0 4px" }}>Event Finder</h1>
        <p style={{ fontSize: 17, color: "#8B7355", margin: "0 0 24px" }}>
          The most complete listing of what's happening across Napa Valley. Can't find your event? Add it — it takes a minute.
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "1px solid rgba(139,105,20,0.12)" }}>
          {[{ key: "search", label: "Find Events" }, { key: "submit", label: "Add an Event" }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "10px 24px", fontSize: 14, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
              background: "none", color: tab === t.key ? "#8B5E3C" : "#7A6A50",
              border: "none", borderBottom: tab === t.key ? "2px solid #C4A050" : "2px solid transparent",
              cursor: "pointer", transition: "all 0.2s", marginBottom: -1,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 60px" }}>

        {/* ═══════════ SEARCH TAB ═══════════ */}
        {tab === "search" && (<>
          {featuredEvents.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#8B7355", marginBottom: 10 }}>Featured Events</div>
              <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
                {featuredEvents.map((ev, i) => (
                  <div key={ev.id || i} style={{ minWidth: 240, maxWidth: 300, flex: "0 0 auto", background: "#EDE8DE", border: "1px solid rgba(139,105,20,0.15)", borderLeft: "3px solid #C4A050", padding: "16px 18px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#C4A050", marginBottom: 4 }}>
                      {ev.is_recurring ? "(R) Featured" : "(N) Featured"}
                    </div>
                    <div style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 15, fontWeight: 700, color: "#2C1810", lineHeight: 1.3, marginBottom: 6 }}>{ev.title}</div>
                    <div style={{ fontSize: 13, color: "#7A6A50", marginBottom: 4, lineHeight: 1.5 }}>
                      {fmtDateAP(ev.event_date)}
                      {ev.start_time ? `, ${fmtTimeAP(ev.start_time)}` : ""}
                      {ev.end_time ? ` to ${fmtTimeAP(ev.end_time)}` : ""}
                    </div>
                    {ev.description && <div style={{ fontSize: 13, color: "#2C1810", lineHeight: 1.5, marginBottom: 6 }}>{ev.description.length > 120 ? ev.description.slice(0, 120) + "\u2026" : ev.description}</div>}
                    <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 4 }}>{fmtPriceAP(ev)}</div>
                    {(ev.website_url || ev.ticket_url) && (
                      <div style={{ fontSize: 13, marginBottom: 4 }}>
                        <a href={ev.ticket_url || ev.website_url} target="_blank" rel="noopener noreferrer" style={{ color: "#8B5E3C", textDecoration: "underline", textUnderlineOffset: 2 }}>
                          {ev.ticket_url ? "Get tickets." : "For more information visit their website."}
                        </a>
                      </div>
                    )}
                    {ev.address && <div style={{ fontSize: 12, color: "#8B7355" }}>{ev.address}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#8B7355" }}>Upcoming Community Events</div>
              <button onClick={() => setTab("submit")} style={{ fontSize: 11, fontWeight: 600, color: "#8B5E3C", background: "none", border: "none", cursor: "pointer", fontFamily: "'Source Sans 3',sans-serif" }}>Submit an Event →</button>
            </div>
            {upcomingEvents.length > 0 ? (
              <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
                {upcomingEvents.map((ev, i) => {
                  const tag = ev.is_recurring ? "(R)" : "(N)";
                  return (
                    <div key={ev.id || i} style={{ minWidth: 220, maxWidth: 280, flex: "0 0 auto", background: "#F5F0E8", border: "1px solid rgba(139,105,20,0.15)", padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: ev.is_recurring ? "#8B7355" : "#C4A050" }}>{tag}</span>
                        <span style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 16, fontWeight: 700, color: "#C4A050" }}>
                          {ev.event_date ? new Date(ev.event_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1810", lineHeight: 1.3, marginBottom: 4 }}>{ev.title}</div>
                      <div style={{ fontSize: 12, color: "#7A6A50", marginBottom: 4 }}>
                        {fmtDateAP(ev.event_date)}
                        {ev.start_time ? `, ${fmtTimeAP(ev.start_time)}` : ""}
                        {ev.end_time ? ` to ${fmtTimeAP(ev.end_time)}` : ""}
                      </div>
                      {ev.venue_name && <div style={{ fontSize: 12, color: "#8B7355", marginBottom: 2 }}>{ev.venue_name}</div>}
                      <div style={{ fontSize: 12, color: "#8B7355", marginBottom: 4 }}>{fmtPriceAP(ev)}</div>
                      {(ev.website_url || ev.ticket_url) ? (
                        <a href={ev.ticket_url || ev.website_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#8B5E3C", textDecoration: "underline", textUnderlineOffset: 2 }}>
                          Visit their website.
                        </a>
                      ) : null}
                      {ev.address && <div style={{ fontSize: 11, color: "#8B7355", marginTop: 4 }}>{ev.address}</div>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ background: "#F5F0E8", border: "1px solid rgba(139,105,20,0.15)", padding: "20px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 14, color: "#7A6A50", margin: "0 0 10px" }}>No events yet — be the first to submit one!</p>
                <button onClick={() => setTab("submit")} style={{ fontSize: 12, fontWeight: 600, color: "#F5F0E8", background: "#2C1810", border: "none", padding: "8px 18px", borderRadius: 6, cursor: "pointer", fontFamily: "'Source Sans 3',sans-serif" }}>Add an Event</button>
              </div>
            )}
          </div>
          <div style={{ background: "#EDE8DE", border: "1px solid rgba(139,105,20,0.18)", padding: 24, marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
              {QUICK_DATES.map((qd, i) => (
                <button key={i} onClick={() => applyQuick(qd, i)} style={{
                  padding: "8px 16px", fontSize: 13, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
                  background: activeQuick === i ? "#2C1810" : "transparent",
                  color: activeQuick === i ? "#F5F0E8" : "#A89880",
                  border: activeQuick === i ? "none" : "1px solid rgba(139,105,20,0.2)",
                  borderRadius: 6, cursor: "pointer", transition: "all 0.2s",
                }}>{qd.label}</button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 18 }}>
              <div>
                <label style={labelBase}>Town</label>
                <select aria-label="Filter by town" value={town} onChange={e => setTown(e.target.value)} style={{ ...inputBase, appearance: "none", cursor: "pointer" }}>
                  {TOWNS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelBase}>Type</label>
                <select aria-label="Filter by event type" value={type} onChange={e => setType(e.target.value)} style={{ ...inputBase, appearance: "none", cursor: "pointer" }}>
                  {CATEGORIES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelBase}>From</label>
                <input type="date" aria-label="Start date" value={startDate} onChange={e => { setStartDate(e.target.value); setActiveQuick(null); }} style={{ ...inputBase, fontFamily: "'JetBrains Mono',monospace" }} />
              </div>
              <div>
                <label style={labelBase}>To</label>
                <input type="date" aria-label="End date" value={endDate} onChange={e => { setEndDate(e.target.value); setActiveQuick(null); }} style={{ ...inputBase, fontFamily: "'JetBrains Mono',monospace" }} />
              </div>
            </div>

            <button onClick={search} disabled={loading} style={{
              width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, fontFamily: "'Source Sans 3',sans-serif",
              background: loading ? "rgba(44,24,16,0.08)" : "#2C1810",
              color: loading ? "#A89880" : "#F5F0E8",
              border: "none", borderRadius: 10, cursor: loading ? "wait" : "pointer", transition: "all 0.3s",
            }}>{loading ? "Searching..." : "Search Events"}</button>

            <div style={{ fontSize: 14, color: "#8B7355", marginTop: 10, textAlign: "center" }}>
              {fmtDateNice(startDate)} — {fmtDateNice(endDate)}
            </div>
          </div>

          {error && (
            <div style={{ background: "rgba(184,92,56,0.1)", border: "1px solid rgba(184,92,56,0.3)", borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: "#8A3A2A", margin: 0 }}>{error}</p>
              <p style={{ fontSize: 14, color: "#7A6A50", margin: "8px 0 0" }}>Try expanding the date range or selecting a different town.</p>
            </div>
          )}

          {results && (<>
            <div style={{ fontSize: 17, color: "#8B7355", marginBottom: 16 }}>
              {results.results?.length === 0 ? "No events found for this search." : `${results.results?.length} event${results.results?.length !== 1 ? "s" : ""} found`}
              {results.timeout && <span style={{ color: "#8A3A2A", marginLeft: 8 }}>(some sources were slow)</span>}
            </div>

            {results.results?.map((event, i) => {
              const { text, urls } = parseEventBody(event.body);
              return (
                <div key={i} style={{ background: "#EDE8DE", border: "1px solid rgba(139,105,20,0.15)", padding: "20px 24px", marginBottom: 12 }}>
                  <h3 style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 18, fontWeight: 700, color: "#2C1810", margin: "0 0 8px", lineHeight: 1.3 }}>{event.header}</h3>
                  <p style={{ fontSize: 14, color: "#7A6A50", lineHeight: 1.65, margin: 0 }}>{text}</p>
                  {urls.length > 0 && (
                    <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                      {urls.map((url, j) => (
                        <a key={j} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${event.header} link, opens in new tab`} style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "8px 16px", fontSize: 13, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
                          background: j === 0 ? "#2C1810" : "transparent",
                          color: j === 0 ? "#F5F0E8" : "#8B5E3C",
                          border: j === 0 ? "none" : "1px solid rgba(139,105,20,0.25)",
                          borderRadius: 6, textDecoration: "none", transition: "all 0.2s",
                        }}>
                          {linkLabel(url)}
                          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M4 1.5H1.5V10.5H10.5V8" stroke={j === 0 ? "#F5F0E8" : "#8B5E3C"} strokeWidth="1.2" strokeLinecap="round"/>
                            <path d="M7 1.5H10.5V5" stroke={j === 0 ? "#F5F0E8" : "#8B5E3C"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10.5 1.5L5.5 6.5" stroke={j === 0 ? "#F5F0E8" : "#8B5E3C"} strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {results.results?.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <button onClick={() => setTab("submit")} style={{
                  padding: "12px 28px", fontSize: 14, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
                  background: "transparent", border: "1px solid rgba(139,105,20,0.25)",
                  color: "#8B5E3C", borderRadius: 8, cursor: "pointer",
                }}>Know about an event? Add it here →</button>
              </div>
            )}

            {/* Map */}
            <EventMap pins={results.map || []} />
          </>)}

          {/* Nudge */}
          <div style={{ background: "rgba(139,105,20,0.06)", border: "1px solid rgba(139,105,20,0.1)", borderRadius: 10, padding: "18px 22px", marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#7A6A50", marginBottom: 2 }}>Know about an event we're missing?</div>
              <div style={{ fontSize: 14, color: "#8B7355" }}>Add it to NapaServe. The more people contribute, the more useful this gets.</div>
            </div>
            <button onClick={() => setTab("submit")} style={{
              padding: "10px 20px", fontSize: 13, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
              background: "#2C1810", color: "#F5F0E8",
              border: "none", borderRadius: 8, cursor: "pointer",
            }}>Add an Event</button>
          </div>
        </>)}

        {/* ═══════════ SUBMIT TAB ═══════════ */}
        {tab === "submit" && (<div id="submit">
          {submitted ? (
            <div style={{ background: "rgba(91,138,90,0.1)", border: "1px solid rgba(91,138,90,0.3)", padding: "40px 28px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
              <h2 style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 24, fontWeight: 700, color: "#4A7A5A", margin: "0 0 8px" }}>Event Submitted</h2>
              <p style={{ fontSize: 15, color: "#7A6A50", margin: "0 0 20px", lineHeight: 1.5 }}>
                Thanks for adding to NapaServe. Your event will appear after a quick review — usually within 24 hours.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={resetForm} style={{
                  padding: "10px 24px", fontSize: 14, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
                  background: "#2C1810", color: "#F5F0E8",
                  border: "none", borderRadius: 8, cursor: "pointer",
                }}>Add Another</button>
                <button onClick={() => setTab("search")} style={{
                  padding: "10px 24px", fontSize: 14, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
                  background: "transparent", border: "1px solid rgba(139,105,20,0.25)",
                  color: "#8B5E3C", borderRadius: 8, cursor: "pointer",
                }}>Back to Search</button>
              </div>
            </div>
          ) : (
            <div style={{ background: "#EDE8DE", border: "1px solid rgba(139,105,20,0.18)", padding: 28 }}>
              <p style={{ fontSize: 17, color: "#8B7355", margin: "0 0 20px", lineHeight: 1.6 }}>
                Add your event to the NapaServe community calendar. Fields marked with <span style={{ color: "#8A3A2A" }}>*</span> are required — everything else is optional but helps people find and decide on your event.
              </p>

              {/* ── THE BASICS ── */}
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#8B5E3C", textTransform: "uppercase", marginBottom: 14 }}>The Basics</div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelBase}>Event Name {required}</label>
                <input value={form.title} onChange={e => uf("title", e.target.value)} placeholder="What's the event called?"
                  style={{ ...inputBase, fontSize: 18, fontFamily: "'Libre Baskerville',Georgia,serif" }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelBase}>Description {required}</label>
                <textarea value={form.description} onChange={e => uf("description", e.target.value)}
                  placeholder="What should someone know about this event? A sentence or two is plenty."
                  rows={3} style={{ ...inputBase, resize: "vertical", lineHeight: 1.5 }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={labelBase}>Category {required}</label>
                  <select value={form.category} onChange={e => uf("category", e.target.value)} style={{ ...inputBase, appearance: "none", cursor: "pointer" }}>
                    {CATEGORIES.filter(c => c.value !== "any").map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelBase}>Town {required}</label>
                  <select value={form.town} onChange={e => uf("town", e.target.value)} style={{ ...inputBase, appearance: "none", cursor: "pointer" }}>
                    {TOWNS.filter(t => t.value !== "all").map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              {/* ── DATE & TIME ── */}
              {sectionHeader("Date & Time")}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={labelBase}>Date {required}</label>
                  <input type="date" value={form.event_date} onChange={e => uf("event_date", e.target.value)}
                    style={{ ...inputBase, fontFamily: "'JetBrains Mono',monospace" }} />
                </div>
                <div>
                  <label style={labelBase}>End Date <span style={{ fontSize: 11, color: "#8B7355" }}>(if multi-day)</span></label>
                  <input type="date" value={form.end_date} onChange={e => uf("end_date", e.target.value)}
                    style={{ ...inputBase, fontFamily: "'JetBrains Mono',monospace" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={labelBase}>Start Time</label>
                  <input value={form.start_time} onChange={e => uf("start_time", e.target.value)} placeholder="e.g. 6:00 PM" style={inputBase} />
                </div>
                <div>
                  <label style={labelBase}>End Time</label>
                  <input value={form.end_time} onChange={e => uf("end_time", e.target.value)} placeholder="e.g. 9:00 PM" style={inputBase} />
                </div>
              </div>

              {/* Recurring */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelBase}>Is this a recurring event?</label>
                <ChoiceGroup
                  options={[{ value: false, label: "One-time" }, { value: true, label: "Recurring" }]}
                  value={form.is_recurring} onChange={v => uf("is_recurring", v)}
                />
                {form.is_recurring && (
                  <input value={form.recurrence_desc} onChange={e => uf("recurrence_desc", e.target.value)}
                    placeholder="e.g. Every Tuesday, First Saturday of the month"
                    style={{ ...inputBase, marginTop: 10 }} />
                )}
              </div>

              {/* ── LOCATION ── */}
              {sectionHeader("Location")}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={labelBase}>Venue Name</label>
                  <input value={form.venue_name} onChange={e => uf("venue_name", e.target.value)} placeholder="e.g. Oxbow Public Market" style={inputBase} />
                </div>
                <div>
                  <label style={labelBase}>Street Address</label>
                  <input value={form.address} onChange={e => uf("address", e.target.value)} placeholder="e.g. 610 1st Street, Napa" style={inputBase} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelBase}>Indoor / Outdoor</label>
                <ChoiceGroup
                  options={[{ value: "indoor", label: "Indoor" }, { value: "outdoor", label: "Outdoor" }, { value: "both", label: "Both" }]}
                  value={form.indoor_outdoor} onChange={v => uf("indoor_outdoor", v)} color="#9B8EC4"
                />
              </div>

              {/* ── DETAILS ── */}
              {sectionHeader("Details")}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={labelBase}>Price</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input value={form.price_info} onChange={e => uf("price_info", e.target.value)}
                      placeholder={form.is_free ? "Free" : "e.g. $25, Varies"}
                      style={{ ...inputBase, flex: 1, opacity: form.is_free ? 0.5 : 1 }} disabled={form.is_free} />
                    <button onClick={() => { uf("is_free", !form.is_free); if (!form.is_free) uf("price_info", "Free"); else uf("price_info", ""); }}
                      style={{
                        padding: "10px 16px", fontSize: 13, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
                        background: form.is_free ? "rgba(74,122,90,0.15)" : "transparent",
                        border: `1px solid ${form.is_free ? "rgba(91,138,90,0.4)" : "rgba(139,105,20,0.2)"}`,
                        color: form.is_free ? "#4A7A5A" : "#7A6A50",
                        borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap",
                      }}>Free</button>
                  </div>
                </div>
                <div>
                  <label style={labelBase}>Age Restriction</label>
                  <ChoiceGroup
                    options={[{ value: "all_ages", label: "All Ages" }, { value: "21_plus", label: "21+" }, { value: "18_plus", label: "18+" }]}
                    value={form.age_restriction} onChange={v => uf("age_restriction", v)} color="#8A3A2A"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelBase}>Accessibility</label>
                <input value={form.accessibility_info} onChange={e => uf("accessibility_info", e.target.value)}
                  placeholder="e.g. Wheelchair accessible, ASL interpreter available"
                  style={inputBase} />
              </div>

              {/* ── LINKS ── */}
              {sectionHeader("Links")}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={labelBase}>Event Website</label>
                  <input value={form.website_url} onChange={e => uf("website_url", e.target.value)} placeholder="https://..." style={inputBase} />
                </div>
                <div>
                  <label style={labelBase}>Ticket Link</label>
                  <input value={form.ticket_url} onChange={e => uf("ticket_url", e.target.value)} placeholder="https://..." style={inputBase} />
                </div>
              </div>

              {/* ── CONTACT ── */}
              {sectionHeader("Contact")}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
                <div>
                  <label style={labelBase}>Organizer Contact</label>
                  <input value={form.organizer_contact} onChange={e => uf("organizer_contact", e.target.value)}
                    placeholder="Email or phone for event questions" style={inputBase} />
                </div>
                <div>
                  <label style={labelBase}>Your Name or Email</label>
                  <input value={form.submitted_by} onChange={e => uf("submitted_by", e.target.value)}
                    placeholder="So we can follow up if needed" style={inputBase} />
                </div>
              </div>

              {/* Error */}
              {submitError && (
                <div style={{ background: "rgba(184,92,56,0.1)", border: "1px solid rgba(184,92,56,0.3)", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: "#8A3A2A", margin: 0 }}>{submitError}</p>
                </div>
              )}

              {/* Submit */}
              <button onClick={submitEvent} disabled={submitting} style={{
                width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, fontFamily: "'Source Sans 3',sans-serif",
                background: submitting ? "rgba(44,24,16,0.08)" : "#2C1810",
                color: submitting ? "#A89880" : "#F5F0E8",
                border: "none", borderRadius: 10, cursor: submitting ? "wait" : "pointer", transition: "all 0.3s",
              }}>{submitting ? "Submitting..." : "Submit Event"}</button>

              <p style={{ fontSize: 11, color: "#5A4D38", margin: "12px 0 0", textAlign: "center" }}>
                Events are reviewed before publishing. Most appear within 24 hours.
              </p>
            </div>
          )}
        </div>)}

      </div>
      <Footer />
    </div>
  );
}

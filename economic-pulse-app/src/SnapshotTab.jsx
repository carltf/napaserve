import { useState, useEffect, useRef } from "react";
import { STOPLIGHT_COLORS, transitionsStoplight } from "./stoplights";

const T = {
  bg: "#F5F0E8",
  surface: "#EDE8DE",
  ink: "#2C1810",
  accent: "#8B5E3C",
  gold: "#C4A050",
  muted: "#8B7355",
  border: "#D4CDB8",
};

const FONT_HEADING = "'Libre Baskerville', serif";
const FONT_BODY = "'Source Sans 3', sans-serif";

const fmt = (n, opts = {}) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  const v = Number(n);
  if (opts.currency) return "$" + Math.round(v).toLocaleString();
  if (opts.pct) return v.toFixed(1) + "%";
  if (opts.compact && Math.abs(v) >= 1000) return v.toLocaleString();
  return v.toLocaleString();
};

const delta = (cur, prior) => {
  if (cur === null || cur === undefined || prior === null || prior === undefined) return null;
  return Number(cur) - Number(prior);
};

const arrowChar = (d) => {
  if (d === null || d === undefined || isNaN(d)) return "";
  if (d > 0) return "▲";
  if (d < 0) return "▼";
  return "";
};

const arrowColor = (d, opts = {}) => {
  if (d === null || d === undefined || isNaN(d) || d === 0) return T.muted;
  const isPositive = opts.invertSign ? d < 0 : d > 0;
  return isPositive ? "#5C8A50" : "#A85048";
};

const fmtDelta = (d, opts = {}) => {
  if (d === null || d === undefined || isNaN(d)) return "Unchanged";
  if (d === 0) return "Unchanged";
  const sign = d > 0 ? "+" : "−";
  const abs = Math.abs(d);
  if (opts.pct) return sign + abs.toFixed(1) + "%";
  if (opts.currency) return sign + "$" + Math.round(abs).toLocaleString();
  return sign + abs.toLocaleString();
};

function SnapshotCard({ eyebrow, primary, unitLabel, deltaLine, footer, stoplight }) {
  return (
    <div
      style={{
        position: "relative",
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 6,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 168,
      }}
    >
      {stoplight && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: STOPLIGHT_COLORS[stoplight] || STOPLIGHT_COLORS.neutral,
          }}
        />
      )}
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: T.muted,
          marginBottom: 12,
          fontWeight: 600,
        }}
      >
        {eyebrow}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: FONT_HEADING,
            fontSize: 36,
            fontWeight: 700,
            color: T.ink,
            lineHeight: 1.05,
            marginBottom: 4,
          }}
        >
          {primary}
        </div>
        {unitLabel && (
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 13,
              color: T.muted,
              marginBottom: 10,
            }}
          >
            {unitLabel}
          </div>
        )}
      </div>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 13,
          color: T.ink,
          marginTop: 8,
        }}
      >
        {deltaLine}
      </div>
      {footer && (
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 11,
            color: T.muted,
            marginTop: 6,
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

function generateTakeaways(signals) {
  const parts = [];

  if (signals.wineNapa !== null && signals.wineDeltaWoW !== null) {
    if (signals.wineDeltaWoW === 0) {
      parts.push(`Napa County held at ${fmt(signals.wineNapa)} Type-02 winery licenses, unchanged from last week.`);
    } else {
      const dir = signals.wineDeltaWoW > 0 ? "up" : "down";
      parts.push(`Napa County had ${fmt(signals.wineNapa)} Type-02 winery licenses, ${dir} ${Math.abs(signals.wineDeltaWoW)} from last week.`);
    }
  }

  if (signals.unemployment !== null) {
    const d = signals.unemploymentDeltaMoM;
    if (d === null || d === 0) {
      parts.push(`Unemployment held steady at ${signals.unemployment.toFixed(1)}%.`);
    } else if (d > 0) {
      parts.push(`Unemployment rose to ${signals.unemployment.toFixed(1)}% (up ${d.toFixed(1)} pts MoM).`);
    } else {
      parts.push(`Unemployment fell to ${signals.unemployment.toFixed(1)}% (down ${Math.abs(d).toFixed(1)} pts MoM).`);
    }
  }

  if (signals.homeValue !== null) {
    const d = signals.homeValueDeltaMoMPct;
    if (d === null || Math.abs(d) < 0.05) {
      parts.push(`Average home value at ${fmt(signals.homeValue, { currency: true })}, essentially flat MoM.`);
    } else {
      const dir = d > 0 ? "up" : "down";
      parts.push(`Average home value at ${fmt(signals.homeValue, { currency: true })}, ${dir} ${Math.abs(d).toFixed(1)}% MoM.`);
    }
  }

  if (signals.transitionsCount !== null && signals.transitionsCount > 0) {
    const word = signals.transitionsCount === 1 ? "transition" : "transitions";
    parts.push(`${signals.transitionsCount} regional ${word} tracked in the last 30 days.`);
  }

  return parts;
}

function TransitionsSection({ events, loading, error }) {
  if (loading) {
    return (
      <div style={{ fontFamily: FONT_BODY, color: T.muted, fontSize: 14, padding: "20px 0" }}>
        Loading recent transitions…
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ fontFamily: FONT_BODY, color: T.muted, fontSize: 14, padding: "20px 0" }}>
        Couldn't load recent transitions. The full tracker is at{" "}
        <a href="/under-the-hood/calculators" style={{ color: T.accent }}>
          /under-the-hood/calculators
        </a>
        .
      </div>
    );
  }
  if (!events || events.length === 0) {
    return null;
  }

  const recent = events.slice(0, 3);
  const categoryColor = (cat) => {
    switch (cat) {
      case "Hospitality": return T.gold;
      case "Production": return "#7B5797";
      case "Transaction": return "#4A6FA5";
      case "Distribution": return "#5C8A50";
      default: return T.muted;
    }
  };

  return (
    <div style={{ marginTop: 32 }}>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 13,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: T.accent,
          marginBottom: 16,
          fontWeight: 700,
        }}
      >
        WHAT CHANGED THIS WEEK · NAPA COUNTY
      </div>
      {recent.map((ev, idx) => {
        const display = ev.event_date_display
          ? ev.event_date_display
          : new Date(ev.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        return (
          <div
            key={ev.id || idx}
            style={{
              padding: "14px 0",
              borderBottom: idx < recent.length - 1 ? `1px solid ${T.border}` : "none",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: T.muted, fontWeight: 600 }}>
                {display}
              </span>
              <span
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 11,
                  color: categoryColor(ev.category),
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {ev.category}
              </span>
            </div>
            <div style={{ fontFamily: FONT_HEADING, fontSize: 16, color: T.ink, fontWeight: 700, lineHeight: 1.3 }}>
              {ev.headline}
            </div>
            {ev.detail && (
              <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: T.ink, lineHeight: 1.5 }}>
                {ev.detail}
              </div>
            )}
            {ev.source_url && (
              <a
                href={ev.source_url}
                target="_blank"
                rel="noreferrer"
                style={{ fontFamily: FONT_BODY, fontSize: 12, color: T.accent }}
              >
                {ev.source || "View source"} →
              </a>
            )}
          </div>
        );
      })}
      <div style={{ marginTop: 16 }}>
        <a
          href="/under-the-hood/calculators"
          style={{ fontFamily: FONT_BODY, fontSize: 13, color: T.accent }}
        >
          View full transition tracker →
        </a>
      </div>
    </div>
  );
}

export default function SnapshotTab({
  latestE,
  priorE,
  macroData,
  wineNapa,
  wineNapaPrior,
  wineCA,
  wineCAPrior,
  wineCAShare,
  wineCAShareLight,
  laborLight,
  workforceLight,
  housingLight,
  transitionsCount: _transitionsCountProp,
  transitionsLight: _transitionsLightProp,
}) {
  const cardsRef = useRef(null);

  const downloadPng = async () => {
    if (!cardsRef.current) return;
    let offscreen = null;
    try {
      const html2canvas = (await import("html2canvas")).default;

      const CAPTURE_WIDTH = 1200;
      const WRAPPER_PADDING = 24;
      const FRAME = 32;
      const TITLE_BLOCK = 48;
      const sourceNode = cardsRef.current;
      const clone = sourceNode.cloneNode(true);

      offscreen = document.createElement("div");
      offscreen.id = "snapshot-export-clone";
      offscreen.style.cssText = [
        "position: fixed",
        "top: 0",
        "left: -10000px",
        "width: 1152px",
        "background: #F5F0E8",
        "z-index: -1",
        "pointer-events: none",
        "box-sizing: border-box",
      ].join("; ");

      const styleEl = document.createElement("style");
      styleEl.textContent = [
        "#snapshot-export-clone .kpi-grid-snapshot {",
        "  grid-template-columns: 1fr 1fr !important;",
        "  grid-auto-rows: 1fr !important;",
        "  align-items: stretch !important;",
        "  gap: 24px !important;",
        "}",
        "#snapshot-export-clone .kpi-grid-snapshot > div {",
        "  padding: 24px !important;",
        "  min-height: 0 !important;",
        "}",
      ].join("\n");
      offscreen.appendChild(styleEl);
      offscreen.appendChild(clone);
      document.body.appendChild(offscreen);

      const walker = document.createTreeWalker(clone, NodeFilter.SHOW_ELEMENT);
      let n;
      let bumps = { primary: 0, eyebrow: 0, footer: 0, mid: 0, dot: 0, flex: 0 };
      while ((n = walker.nextNode())) {
        const cs = getComputedStyle(n);
        const fs = cs.fontSize;
        const ff = cs.fontFamily;
        const tt = cs.textTransform;

        if (fs === "36px" && /Libre Baskerville/i.test(ff)) {
          n.style.setProperty("font-size", "52px", "important");
          n.style.setProperty("line-height", "1.0", "important");
          bumps.primary++;
        } else if (fs === "11px" && tt === "uppercase") {
          n.style.setProperty("font-size", "16px", "important");
          bumps.eyebrow++;
        } else if (fs === "11px" && tt !== "uppercase") {
          n.style.setProperty("font-size", "18px", "important");
          bumps.footer++;
        } else if (fs === "13px") {
          n.style.setProperty("font-size", "18px", "important");
          bumps.mid++;
        }

        if (
          cs.position === "absolute" &&
          (cs.width === "18px" || n.style.width === "18px") &&
          (cs.height === "18px" || n.style.height === "18px")
        ) {
          n.style.setProperty("width", "24px", "important");
          n.style.setProperty("height", "24px", "important");
          n.style.setProperty("top", "14px", "important");
          n.style.setProperty("right", "14px", "important");
          bumps.dot++;
        }

        if (cs.flex === "1 1 0%" || cs.flexGrow === "1") {
          n.style.setProperty("flex", "none", "important");
          n.style.setProperty("flex-grow", "0", "important");
          bumps.flex++;
        }

        // Internal margin tightening — close empty space inside cards
        // (after flex:1 removal anchors content at top). Values measured
        // from production diagnostic: Wine card content was 189px tall
        // with 25px empty at bottom; these reductions close ~14px of that.
        const mb = cs.marginBottom;
        const mt = cs.marginTop;
        if (mb === "12px") {
          n.style.setProperty("margin-bottom", "8px", "important");
        } else if (mb === "10px") {
          n.style.setProperty("margin-bottom", "6px", "important");
        }
        if (mt === "8px") {
          n.style.setProperty("margin-top", "6px", "important");
        } else if (mt === "6px") {
          n.style.setProperty("margin-top", "4px", "important");
        }
      }
      console.log("[downloadPng] bumps:", JSON.stringify(bumps));

      // eslint-disable-next-line no-unused-expressions
      clone.offsetHeight;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: "#F5F0E8",
        useCORS: true,
        width: 1152,
        windowWidth: 1152,
      });

      const FRAME_PX = FRAME * 2;
      const TITLE_PX = TITLE_BLOCK * 2;
      const CARD_INSET = WRAPPER_PADDING * 2;
      const off = document.createElement("canvas");
      off.width = canvas.width + (FRAME_PX * 2);
      off.height = canvas.height + FRAME_PX + TITLE_PX + FRAME_PX;
      const ctx = off.getContext("2d");
      ctx.fillStyle = "#F5F0E8";
      ctx.fillRect(0, 0, off.width, off.height);

      ctx.fillStyle = "#2C1810";
      ctx.font = "bold 64px 'Libre Baskerville', serif";
      ctx.textBaseline = "top";
      const today = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      ctx.fillText(`Napa County · Weekly Snapshot · ${today}`, FRAME_PX, FRAME_PX);

      ctx.drawImage(canvas, FRAME_PX, FRAME_PX + TITLE_PX);

      ctx.font = "52px 'Source Code Pro', monospace";
      ctx.fillStyle = "#8B7355";
      ctx.globalAlpha = 0.5;
      ctx.textBaseline = "middle";
      const watermarkText = "napaserve.org";
      const wmWidth = ctx.measureText(watermarkText).width;
      ctx.fillText(
        watermarkText,
        off.width - FRAME_PX - wmWidth,
        off.height - (FRAME_PX / 2)
      );
      ctx.globalAlpha = 1;

      const dataUrl = off.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      const isoDate = new Date().toISOString().slice(0, 10);
      a.download = `napa-snapshot-${isoDate}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Snapshot download failed:", err);
    } finally {
      if (offscreen && offscreen.parentNode) {
        offscreen.parentNode.removeChild(offscreen);
      }
    }
  };

  const [trackerEvents, setTrackerEvents] = useState(null);
  const [trackerLoading, setTrackerLoading] = useState(true);
  const [trackerError, setTrackerError] = useState(null);

  const [poll, setPoll] = useState(null);
  const [pollLoading, setPollLoading] = useState(true);

  const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";

  useEffect(() => {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sinceStr = since.toISOString().slice(0, 10);
    fetch(`${WORKER}/api/tracker-events?since=${sinceStr}&limit=50`)
      .then((r) => r.json())
      .then((d) => {
        if (d && d.ok && Array.isArray(d.results)) {
          setTrackerEvents(d.results);
        } else {
          setTrackerError("Unexpected response");
        }
      })
      .catch((e) => setTrackerError(String(e)))
      .finally(() => setTrackerLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${WORKER}/api/latest-substack-poll`)
      .then((r) => r.json())
      .then((d) => {
        if (d && d.ok && d.poll) setPoll(d.poll);
      })
      .catch(() => {})
      .finally(() => setPollLoading(false));
  }, []);

  const wineDeltaWoW = delta(wineNapa, wineNapaPrior);

  const unemployment = latestE?.unemp ?? null;
  const unemploymentPrior = priorE?.unemp ?? null;
  const unemploymentDeltaMoM = delta(unemployment, unemploymentPrior);

  const labor = latestE?.labor ?? null;
  const laborPrior = priorE?.labor ?? null;
  const laborDeltaMoM = delta(labor, laborPrior);

  const homeValue = latestE?.home ?? null;
  const homePrior = priorE?.home ?? null;
  const homeDeltaMoM = delta(homeValue, homePrior);
  const homeDeltaMoMPct = (homeValue && homePrior) ? ((homeValue - homePrior) / homePrior) * 100 : null;
  const homeYoYPct = latestE?.home_value_yoy ?? null;
  const daysPending = latestE?.days_pending ?? null;

  // Hoisted-prop scaffolding present but unused; tracker fetch hoist deferred to 4a-4.
  const transitionsCount = trackerEvents ? trackerEvents.length : null;
  const transitionsLight = transitionsStoplight(transitionsCount);
  const categoryCounts = trackerEvents
    ? trackerEvents.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + 1;
        return acc;
      }, {})
    : {};
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  const summary = generateTakeaways({
    wineNapa,
    wineDeltaWoW,
    unemployment,
    unemploymentDeltaMoM,
    homeValue,
    homeValueDeltaMoMPct: homeDeltaMoMPct,
    transitionsCount,
  });

  return (
    <>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 14,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: T.accent,
          marginBottom: 12,
          fontWeight: 700,
        }}
      >
        NAPA COUNTY · WEEKLY SNAPSHOT
      </div>

      <div ref={cardsRef}>
      <div className="kpi-grid-snapshot">
        <SnapshotCard
          eyebrow="WINE INDUSTRY"
          primary={fmt(wineNapa)}
          unitLabel="Type-02 winery licenses"
          deltaLine={
            <span>
              <span style={{ color: arrowColor(wineDeltaWoW) }}>{arrowChar(wineDeltaWoW)}</span>{" "}
              {fmtDelta(wineDeltaWoW)} <span style={{ color: T.muted, fontSize: 11 }}>WoW</span>
            </span>
          }
          footer={wineCAShare != null ? `${wineCAShare.toFixed(1)}% of California Type-02` : "CA share unavailable"}
          stoplight={wineCAShareLight}
        />

        <SnapshotCard
          eyebrow="LABOR MARKET"
          primary={unemployment !== null ? unemployment.toFixed(1) + "%" : "—"}
          unitLabel="Unemployment rate"
          deltaLine={
            <span>
              <span style={{ color: arrowColor(unemploymentDeltaMoM, { invertSign: true }) }}>
                {arrowChar(unemploymentDeltaMoM)}
              </span>{" "}
              {fmtDelta(unemploymentDeltaMoM, { pct: true })} <span style={{ color: T.muted, fontSize: 11 }}>MoM</span>
            </span>
          }
          stoplight={laborLight}
        />

        <SnapshotCard
          eyebrow="WORKFORCE SIZE"
          primary={fmt(labor)}
          unitLabel="Civilian labor force"
          deltaLine={
            <span>
              <span style={{ color: arrowColor(laborDeltaMoM) }}>{arrowChar(laborDeltaMoM)}</span>{" "}
              {fmtDelta(laborDeltaMoM)} <span style={{ color: T.muted, fontSize: 11 }}>MoM</span>
            </span>
          }
          stoplight={workforceLight}
        />

        <SnapshotCard
          eyebrow="HOUSING"
          primary={fmt(homeValue, { currency: true })}
          unitLabel="Average home value (ZHVI)"
          deltaLine={
            <span>
              <span style={{ color: arrowColor(homeDeltaMoM) }}>{arrowChar(homeDeltaMoM)}</span>{" "}
              {fmtDelta(homeDeltaMoM, { currency: true })} <span style={{ color: T.muted, fontSize: 11 }}>MoM</span>
            </span>
          }
          footer={
            homeYoYPct !== null
              ? `${homeYoYPct >= 0 ? "+" : ""}${homeYoYPct.toFixed(1)}% YoY${daysPending ? ` · ${daysPending} days to pending` : ""}`
              : null
          }
          stoplight={housingLight}
        />

        <SnapshotCard
          eyebrow="REGIONAL TRANSITIONS"
          primary={transitionsCount !== null ? String(transitionsCount) : "—"}
          unitLabel="Tracked transitions, last 30 days"
          deltaLine={
            topCategory
              ? <span>Led by <span style={{ color: T.ink, fontWeight: 600 }}>{topCategory[0]}</span> ({topCategory[1]})</span>
              : <span style={{ color: T.muted }}>{trackerLoading ? "Loading…" : "No transitions recorded"}</span>
          }
          stoplight={transitionsLight}
        />

        {poll?.substack_url ? (
          <a
            href={poll.substack_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              color: "inherit",
              cursor: "pointer",
              display: "block",
            }}
          >
            <SnapshotCard
              eyebrow="READER SENTIMENT"
              primary={poll ? `${poll.top_pct}%` : (pollLoading ? "…" : "—")}
              unitLabel={poll ? `chose: ${poll.top_answer}` : "Latest reader poll"}
              deltaLine={
                poll
                  ? <span style={{ color: T.ink, lineHeight: 1.4 }}>{poll.question}</span>
                  : <span style={{ color: T.muted }}>{pollLoading ? "Loading poll…" : "No recent poll"}</span>
              }
              footer={
                poll
                  ? (
                    <span>
                      {poll.total_votes} votes · Source: {poll.post_title}
                      {poll.substack_url && (
                        <>
                          {" · "}
                          <a href={poll.substack_url} target="_blank" rel="noreferrer" style={{ color: T.accent }}>
                            View on Substack →
                          </a>
                        </>
                      )}
                    </span>
                  )
                  : null
              }
            />
          </a>
        ) : (
          <SnapshotCard
            eyebrow="READER SENTIMENT"
            primary={poll ? `${poll.top_pct}%` : (pollLoading ? "…" : "—")}
            unitLabel={poll ? `chose: ${poll.top_answer}` : "Latest reader poll"}
            deltaLine={
              poll
                ? <span style={{ color: T.ink, lineHeight: 1.4 }}>{poll.question}</span>
                : <span style={{ color: T.muted }}>{pollLoading ? "Loading poll…" : "No recent poll"}</span>
            }
            footer={
              poll
                ? (
                  <span>
                    {poll.total_votes} votes · Source: {poll.post_title}
                  </span>
                )
                : null
            }
          />
        )}
      </div>
      </div>

      <div style={{ marginTop: 16, marginBottom: 8 }}>
        <button
          onClick={downloadPng}
          style={{
            fontFamily: "'Source Code Pro', monospace",
            fontSize: 11,
            letterSpacing: "0.08em",
            color: T.muted,
            border: `1px solid ${T.border}`,
            background: "transparent",
            padding: "4px 12px",
            borderRadius: 3,
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          Download Snapshot PNG
        </button>
      </div>

      {summary && summary.length > 0 && (
        <div
          style={{
            marginTop: 28,
            padding: "20px 22px",
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderLeft: `4px solid ${T.gold}`,
            borderRadius: 6,
          }}
        >
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 13,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: T.accent,
              marginBottom: 12,
              fontWeight: 700,
            }}
          >
            KEY LOCAL TAKEAWAYS
          </div>
          <ul style={{ fontFamily: FONT_BODY, fontSize: 15, color: T.ink, lineHeight: 1.6, margin: 0, paddingLeft: 20 }}>
            {summary.map((line, i) => (
              <li key={i} style={{ marginBottom: 6 }}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <TransitionsSection
        events={trackerEvents}
        loading={trackerLoading}
        error={trackerError}
      />
    </>
  );
}

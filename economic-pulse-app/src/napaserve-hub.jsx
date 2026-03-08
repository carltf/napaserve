import { useState } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// NapaServe Hub — Central Portal
// Community intelligence for Napa's future
// ═══════════════════════════════════════════════════════════════════════════

const TOOLS = [
  {
    id: "agent",
    title: "AI Policy Agent",
    tagline: "Community intelligence for Napa's future",
    description: "Evaluate policy proposals, legislation, and community issues through four pillars: People & Well-Being, Place & Environment, Prosperity & Jobs, and Innovation. Ask questions in plain language and get balanced, multi-perspective analysis grounded in Napa County context.",
    status: "live",
    href: "/agent.html",
    cta: "Launch Agent",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="16" stroke="#C4A050" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
        <path d="M18 8L22 14H14L18 8Z" fill="#C4A050" opacity="0.7"/>
        <path d="M18 28L14 22H22L18 28Z" fill="#C4A050" opacity="0.7"/>
        <circle cx="18" cy="18" r="4" fill="#C4A050" opacity="0.9"/>
        <line x1="10" y1="18" x2="26" y2="18" stroke="#C4A050" strokeWidth="1" opacity="0.4"/>
        <line x1="18" y1="10" x2="18" y2="26" stroke="#C4A050" strokeWidth="1" opacity="0.4"/>
      </svg>
    ),
    accent: "#C4A050",
  },
  {
    id: "dashboard",
    title: "Economic Pulse",
    tagline: "Weekly indicators, automated",
    description: "Track Napa County's economic health through winery licenses (ABC Type-02), unemployment and labor force (FRED/BLS), housing values (Zillow ZHVI), and food services employment. Updated automatically every Monday via GitHub Actions.",
    status: "live",
    href: "/dashboard",
    cta: "View Dashboard",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="4" y="22" width="5" height="10" rx="1" fill="#5B8A5A" opacity="0.6"/>
        <rect x="11" y="16" width="5" height="16" rx="1" fill="#5B8A5A" opacity="0.7"/>
        <rect x="18" y="10" width="5" height="22" rx="1" fill="#5B8A5A" opacity="0.8"/>
        <rect x="25" y="6" width="5" height="26" rx="1" fill="#5B8A5A" opacity="0.9"/>
        <path d="M4 20 L11 14 L18 8 L25 4" stroke="#C4A050" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    accent: "#5B8A5A",
  },
  {
    id: "evaluator",
    title: "Project Evaluator",
    tagline: "Structural Resilience Analysis",
    description: "Evaluate development proposals, policy changes, and capital projects through an 11-axis framework across Jobs, People, and Place — including water demand, wildfire risk, and biodiversity. Answer concrete questions, see how a project scores on the Structural Compass, and generate a full assessment report.",
    status: "live",
    href: "/evaluator",
    cta: "Launch Evaluator",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="15" stroke="#9B8EC4" strokeWidth="1" opacity="0.3"/>
        <circle cx="18" cy="18" r="10" stroke="#9B8EC4" strokeWidth="1" opacity="0.3"/>
        <circle cx="18" cy="18" r="5" stroke="#9B8EC4" strokeWidth="1" opacity="0.3"/>
        <line x1="18" y1="3" x2="18" y2="33" stroke="#9B8EC4" strokeWidth="0.5" opacity="0.3"/>
        <line x1="3" y1="18" x2="33" y2="18" stroke="#9B8EC4" strokeWidth="0.5" opacity="0.3"/>
        <line x1="7" y1="7" x2="29" y2="29" stroke="#9B8EC4" strokeWidth="0.5" opacity="0.3"/>
        <line x1="29" y1="7" x2="7" y2="29" stroke="#9B8EC4" strokeWidth="0.5" opacity="0.3"/>
        <polygon points="18,6 25,15 25,25 18,30 11,25 11,15" stroke="#C8A96E" strokeWidth="1.5" fill="rgba(200,169,110,0.12)"/>
        <polygon points="18,9 22,14 22,23 18,27 14,23 14,14" stroke="#7EB8A4" strokeWidth="1" fill="rgba(126,184,164,0.08)" strokeDasharray="3 2"/>
      </svg>
    ),
    accent: "#9B8EC4",
  },
  {
    id: "events",
    title: "Event Finder",
    tagline: "What's happening in the Valley",
    description: "The most complete listing of what's happening across Napa Valley. Search events from local calendars and community submissions, or add your own. Filters by town, type, and date — with a community database anyone can contribute to.",
    status: "live",
    href: "/events",
    cta: "Find Events",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="15" r="6" stroke="#B85C38" strokeWidth="1.5" fill="none" opacity="0.7"/>
        <circle cx="18" cy="15" r="2" fill="#B85C38" opacity="0.8"/>
        <path d="M18 21C18 21 10 15 10 11C10 6.58 13.58 3 18 3C22.42 3 26 6.58 26 11C26 15 18 21 18 21Z" stroke="#B85C38" strokeWidth="1.5" fill="rgba(184,92,56,0.1)"/>
        <rect x="8" y="26" width="20" height="6" rx="3" stroke="#B85C38" strokeWidth="1" fill="none" opacity="0.4"/>
        <line x1="14" y1="28" x2="14" y2="30" stroke="#B85C38" strokeWidth="0.8" opacity="0.4"/>
        <line x1="18" y1="27" x2="18" y2="31" stroke="#B85C38" strokeWidth="0.8" opacity="0.4"/>
        <line x1="22" y1="28" x2="22" y2="30" stroke="#B85C38" strokeWidth="0.8" opacity="0.4"/>
      </svg>
    ),
    accent: "#B85C38",
  },
  {
    id: "news",
    title: "Napa Valley Features",
    tagline: "Local news & stories",
    description: "The latest from Napa Valley Focus — stories and analysis about the issues shaping Napa County. Policy, wine, housing, environment, community, and business coverage with a local news ticker tracking headlines from across the valley.",
    status: "live",
    href: "/news",
    cta: "Read Stories",
    links: [
      { label: "Subscribe", href: "https://napavalleyfocus.substack.com/account?utm_medium=web&utm_source=napaserve&utm_content=subscribe" },
      { label: "Features Site", href: "https://www.napavalleyfeatures.com" },
    ],
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="6" y="4" width="24" height="28" rx="2" stroke="#8B7355" strokeWidth="1.5" fill="none" opacity="0.5"/>
        <line x1="10" y1="10" x2="26" y2="10" stroke="#8B7355" strokeWidth="2" opacity="0.6"/>
        <line x1="10" y1="15" x2="22" y2="15" stroke="#8B7355" strokeWidth="1" opacity="0.35"/>
        <line x1="10" y1="19" x2="24" y2="19" stroke="#8B7355" strokeWidth="1" opacity="0.35"/>
        <line x1="10" y1="23" x2="20" y2="23" stroke="#8B7355" strokeWidth="1" opacity="0.35"/>
        <line x1="10" y1="27" x2="23" y2="27" stroke="#8B7355" strokeWidth="1" opacity="0.35"/>
      </svg>
    ),
    accent: "#8B7355",
  },
  {
    id: "vwc",
    title: "Valley Works Collaborative",
    tagline: "Jobs · People · Place",
    description: "The innovation hub behind NapaServe. Valley Works builds long-term regional economic resilience for Napa County — diversifying beyond wine and hospitality through applied research, entrepreneur support, and practical solutions to workforce, healthcare, and land stewardship challenges. NapaServe is the prototype for community-scale civic AI.",
    status: "live",
    href: "https://www.valleyworkscollaborative.org",
    cta: "Visit Valley Works",
    external: true,
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M18 4L30 12V24L18 32L6 24V12L18 4Z" stroke="#C4A050" strokeWidth="1.5" fill="rgba(196,160,80,0.06)"/>
        <path d="M18 10L24 14V22L18 26L12 22V14L18 10Z" stroke="#C4A050" strokeWidth="1" fill="rgba(196,160,80,0.08)"/>
        <circle cx="18" cy="18" r="3" fill="#C4A050" opacity="0.7"/>
        <line x1="18" y1="4" x2="18" y2="10" stroke="#C4A050" strokeWidth="0.8" opacity="0.4"/>
        <line x1="30" y1="12" x2="24" y2="14" stroke="#C4A050" strokeWidth="0.8" opacity="0.4"/>
        <line x1="30" y1="24" x2="24" y2="22" stroke="#C4A050" strokeWidth="0.8" opacity="0.4"/>
        <line x1="18" y1="32" x2="18" y2="26" stroke="#C4A050" strokeWidth="0.8" opacity="0.4"/>
        <line x1="6" y1="24" x2="12" y2="22" stroke="#C4A050" strokeWidth="0.8" opacity="0.4"/>
        <line x1="6" y1="12" x2="12" y2="14" stroke="#C4A050" strokeWidth="0.8" opacity="0.4"/>
      </svg>
    ),
    accent: "#C4A050",
  },
];

const STATUS_LABELS = {
  live: { text: "Live", bg: "rgba(91,138,90,0.2)", color: "#5B8A5A", dot: "#5B8A5A" },
  coming: { text: "Coming Soon", bg: "rgba(155,142,196,0.15)", color: "#9B8EC4", dot: "#9B8EC4" },
  dev: { text: "In Development", bg: "rgba(184,92,56,0.15)", color: "#B85C38", dot: "#B85C38" },
  vision: { text: "Planned", bg: "rgba(139,115,85,0.15)", color: "#8B7355", dot: "#8B7355" },
};

function ToolCard({ tool }) {
  const s = STATUS_LABELS[tool.status];
  const isClickable = tool.href != null;
  const [hovered, setHovered] = useState(false);

  const card = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered && isClickable
          ? "rgba(255,255,255,0.05)"
          : "rgba(255,255,255,0.02)",
        border: `1px solid ${hovered && isClickable ? tool.accent + "44" : "rgba(139,105,20,0.15)"}`,
        borderRadius: 16,
        padding: "24px 20px 20px",
        transition: "all 0.3s ease",
        cursor: isClickable ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: 280,
        boxSizing: "border-box",
        overflowWrap: "break-word",
        wordWrap: "break-word",
      }}
    >
      {/* Subtle accent glow */}
      <div style={{
        position: "absolute", top: -40, right: -40, width: 120, height: 120,
        background: `radial-gradient(circle, ${tool.accent}15 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Header: icon + status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ opacity: tool.status === "live" ? 1 : 0.5 }}>{tool.icon}</div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: s.bg, borderRadius: 20, padding: "4px 10px",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: s.color, textTransform: "uppercase" }}>{s.text}</span>
        </div>
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 18, fontWeight: 700, color: "#F5E6C8",
        margin: "0 0 4px", lineHeight: 1.3,
        minHeight: 46,
      }}>{tool.title}</h3>

      {/* Tagline */}
      <div style={{
        fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: tool.accent,
        textTransform: "uppercase", marginBottom: 12,
      }}>{tool.tagline}</div>

      {/* Description */}
      <p style={{
        fontSize: 13, color: "#9B8968", lineHeight: 1.65, margin: "0 0 auto",
        opacity: tool.status === "live" ? 0.9 : 0.7,
      }}>{tool.description}</p>

      {/* Quick links (for cards with multiple external sites) */}
      {tool.links && (
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          {tool.links.map((lnk, i) => (
            <a key={i} href={lnk.href} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ fontSize: 11, fontWeight: 600, color: tool.accent, textDecoration: "none", opacity: 0.7, borderBottom: `1px solid ${tool.accent}33` }}>
              {lnk.label} ↗
            </a>
          ))}
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: 16 }}>
        {isClickable ? (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: 13, fontWeight: 600, color: tool.accent,
            letterSpacing: 0.5,
          }}>
            {tool.cta}
            {tool.external ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2H2V12H12V9" stroke={tool.accent} strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M8 2H12V6" stroke={tool.accent} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2L6 8" stroke={tool.accent} strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke={tool.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
        ) : (
          <span style={{
            fontSize: 12, fontWeight: 600, color: s.color, opacity: 0.6,
            letterSpacing: 0.5,
          }}>{tool.cta}</span>
        )}
      </div>
    </div>
  );

  if (isClickable) {
    return <a href={tool.href} target={tool.external ? "_blank" : "_self"} rel={tool.external ? "noopener noreferrer" : undefined} style={{ textDecoration: "none", color: "inherit" }}>{card}</a>;
  }
  return card;
}

export default function NapaServeHub() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(175deg, #1C120C 0%, #2A1A0E 25%, #1E1408 55%, #0F0A06 100%)",
      fontFamily: "'Source Sans 3', 'Source Sans Pro', -apple-system, sans-serif",
      color: "#F5E6C8",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Source+Sans+3:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />

      {/* Gold accent line */}
      <div style={{ height: 3, background: "linear-gradient(90deg, transparent 0%, #8B6914 20%, #C4A050 50%, #8B6914 80%, transparent 100%)" }} />

      {/* ═══ HERO ═══ */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px 0", textAlign: "center", position: "relative" }}>
        {/* Decorative compass rose behind title */}
        <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", opacity: 0.04, pointerEvents: "none" }}>
          <svg width="400" height="400" viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="180" stroke="#C4A050" strokeWidth="1" fill="none"/>
            <circle cx="200" cy="200" r="120" stroke="#C4A050" strokeWidth="0.5" fill="none"/>
            <circle cx="200" cy="200" r="60" stroke="#C4A050" strokeWidth="0.5" fill="none"/>
            <line x1="200" y1="10" x2="200" y2="390" stroke="#C4A050" strokeWidth="0.5"/>
            <line x1="10" y1="200" x2="390" y2="200" stroke="#C4A050" strokeWidth="0.5"/>
            <line x1="65" y1="65" x2="335" y2="335" stroke="#C4A050" strokeWidth="0.5"/>
            <line x1="335" y1="65" x2="65" y2="335" stroke="#C4A050" strokeWidth="0.5"/>
            <polygon points="200,20 210,50 190,50" fill="#C4A050"/>
          </svg>
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, background: "#C4A050", borderRadius: "50%" }} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 4, color: "#8B6914", textTransform: "uppercase" }}>NapaServe</span>
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(36px, 6vw, 58px)",
            fontWeight: 900, color: "#F5E6C8",
            margin: "0 0 12px", letterSpacing: -1, lineHeight: 1.05,
          }}>
            Community Intelligence<br />
            <span style={{ color: "#C4A050" }}>for Napa's Future</span>
          </h1>

          <p style={{
            fontSize: 17, color: "#9B8968", maxWidth: 640,
            margin: "0 auto 16px", lineHeight: 1.65,
          }}>
            Accurate information and AI-powered tools for everyone invested in Napa County's future.
            Policy analysis, economic tracking, project evaluation, and local discovery.
          </p>

          <div style={{
            display: "inline-flex", gap: 20, fontSize: 12, color: "#6B5B40",
            letterSpacing: 1, marginBottom: 48,
          }}>
            <span>People & Well-Being</span>
            <span style={{ color: "#3A3020" }}>·</span>
            <span>Place & Environment</span>
            <span style={{ color: "#3A3020" }}>·</span>
            <span>Prosperity & Jobs</span>
            <span style={{ color: "#3A3020" }}>·</span>
            <span>Innovation</span>
          </div>
        </div>
      </div>

      {/* ═══ TOOL CARDS ═══ */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 40px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 18,
        }}>
          {TOOLS.map(t => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
      </div>

      {/* ═══ ABOUT STRIP ═══ */}
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "0 24px 60px",
      }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(139,105,20,0.08) 0%, rgba(114,47,55,0.04) 100%)",
          border: "1px solid rgba(139,105,20,0.12)",
          borderRadius: 14, padding: "28px 32px",
          display: "flex", gap: 40, flexWrap: "wrap", alignItems: "flex-start",
        }}>
          <div style={{ flex: "1 1 280px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: "#8B6914", textTransform: "uppercase", marginBottom: 8 }}>About NapaServe</div>
            <p style={{ fontSize: 14, color: "#9B8968", lineHeight: 1.7, margin: 0 }}>
              NapaServe is a Napa County-focused hub providing accurate, timely information and AI-powered tools
              for community leaders, planners, activists, visionaries, and the curious. We deliver objective,
              multi-perspective analysis — not advocacy — grounded in local data, context, and structural understanding.
            </p>
          </div>
          <div style={{ flex: "1 1 280px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: "#8B6914", textTransform: "uppercase", marginBottom: 8 }}>How It Works</div>
            <p style={{ fontSize: 14, color: "#9B8968", lineHeight: 1.7, margin: 0 }}>
              Economic data is collected automatically every Monday from the CA ABC, FRED, and Zillow via a
              GitHub Actions pipeline writing to Supabase. AI agents use web search and structured frameworks
              to surface concerns, tradeoffs, and opportunities — without default-positive framing. NapaServe is a prototype
              for community-scale civic AI, built by Valley Works Collaborative.
            </p>
          </div>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <div style={{
        borderTop: "1px solid rgba(139,105,20,0.1)",
        padding: "20px 24px 32px",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 5, height: 5, background: "#C4A050", borderRadius: "50%" }} />
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, color: "#6B5B40" }}>NAPASERVE</span>
          </div>
          <span style={{ fontSize: 11, color: "#5A4D38" }}>
            Napa County · Civic AI Platform · Valley Works Collaborative
          </span>
        </div>
      </div>
    </div>
  );
}

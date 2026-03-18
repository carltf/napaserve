import { useState } from "react";
import { Link } from "react-router-dom";

const T = {
  bg: "#F5F0E8",
  surface: "#EDE8DE",
  ink: "#2C1810",
  accent: "#8B5E3C",
  gold: "#C4A050",
  muted: "#7A6A50",
  dim: "#8B7355",
  rule: "rgba(44,24,16,0.12)",
};

const font = "'Source Sans 3','Source Sans Pro',sans-serif";
const serif = "'Libre Baskerville',Georgia,serif";

export default function Footer() {
  const [subName, setSubName] = useState("");
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState(null);

  const colLabel = { fontSize: 11, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: T.dim, fontFamily: font, marginBottom: 12 };
  const sectionHead = { fontSize: 13, fontWeight: 700, color: T.ink, fontFamily: font, marginBottom: 12 };
  const navLink = { display: "block", fontSize: 14, color: T.muted, fontFamily: font, padding: "3px 0", textDecoration: "none" };
  const socialBtn = { display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: T.muted, border: `1px solid ${T.rule}`, padding: "7px 12px", background: "none", width: "100%", marginBottom: 7, textDecoration: "none" };

  return (
    <>
      <style>{`
        .ns-footer-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        @media (max-width: 900px) { .ns-footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .ns-footer-grid { grid-template-columns: 1fr 1fr; } }
        .ns-footer-link:hover { color: ${T.accent} !important; }
        .ns-footer-sbtn:hover { color: ${T.accent} !important; border-color: ${T.accent} !important; }
        .ns-footer-sub-in { flex: 1; background: transparent; border: none; border-bottom: 1px solid ${T.rule}; padding: 8px 0; font-family: ${font}; font-size: 13px; color: ${T.ink}; outline: none; min-width: 0; }
        .ns-footer-sub-in:focus { border-color: ${T.accent}; }
        .ns-footer-sub-in::placeholder { color: ${T.dim}; }
      `}</style>
      <footer style={{ padding: "48px 28px 28px", background: T.bg, borderTop: `1px solid ${T.rule}`, marginTop: 48 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>

          {/* Branding */}
          <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${T.rule}` }}>
            <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.ink, marginBottom: 4 }}>NapaServe</div>
            <div style={{ fontSize: 14, color: T.dim, fontFamily: font }}>Civic intelligence for Napa County · A Valley Works Collaborative · VW Labs project</div>
          </div>

          {/* Nav columns */}
          <div className="ns-footer-grid" style={{ marginBottom: 28, paddingBottom: 28, borderBottom: `1px solid ${T.rule}` }}>
            <div>
              <div style={sectionHead}>Intelligence</div>
              <Link to="/dashboard" className="ns-footer-link" style={navLink}>Community Pulse</Link>
              <Link to="/evaluator" className="ns-footer-link" style={navLink}>Project Evaluator</Link>
              <a href="/agent.html" className="ns-footer-link" style={navLink}>Research Agent</a>
              <Link to="/evaluator" className="ns-footer-link" style={navLink}>Structural Compass</Link>
            </div>
            <div>
              <div style={sectionHead}>Journalism</div>
              <Link to="/news" className="ns-footer-link" style={navLink}>Napa Valley Features</Link>
              <Link to="/archive" className="ns-footer-link" style={navLink}>NVF Archive Search</Link>
              <Link to="/under-the-hood" className="ns-footer-link" style={navLink}>Under the Hood</Link>
              <a href="https://sonomacountyfeatures.substack.com" target="_blank" rel="noopener noreferrer" className="ns-footer-link" style={navLink} aria-label="Sonoma Co. Features, opens in new tab">Sonoma Co. Features ↗</a>
              <a href="https://lakecountyfeatures.substack.com" target="_blank" rel="noopener noreferrer" className="ns-footer-link" style={navLink} aria-label="Lake Co. Features, opens in new tab">Lake Co. Features ↗</a>
            </div>
            <div>
              <div style={sectionHead}>Community</div>
              <Link to="/events" className="ns-footer-link" style={navLink}>Event Finder</Link>
              <Link to="/events" className="ns-footer-link" style={navLink}>Submit an event</Link>
              <Link to="/valley-works" className="ns-footer-link" style={navLink}>Valley Works</Link>
              <Link to="/vw-labs" className="ns-footer-link" style={navLink}>VW Labs</Link>
            </div>
            <div>
              <div style={sectionHead}>Platform</div>
              <Link to="/about" className="ns-footer-link" style={navLink}>About NapaServe</Link>
              <Link to="/about#how-to-use" className="ns-footer-link" style={navLink}>How to use this site</Link>
              <Link to="/about#disclaimer" className="ns-footer-link" style={navLink}>Disclaimer</Link>
              <a href="mailto:napaserve@gmail.com" className="ns-footer-link" style={navLink}>Contact us</a>
            </div>
          </div>

          {/* Follow + Newsletter */}
          <div className="ns-footer-grid" style={{ marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${T.rule}`, alignItems: "start" }}>
            <div>
              <div style={colLabel}>Follow</div>
              <a href="https://bsky.app/profile/valleyworkscollab.bsky.social" target="_blank" rel="noopener noreferrer" className="ns-footer-sbtn" style={socialBtn} aria-label="Bluesky, opens in new tab">
                <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.8C10.8 8.4 7.8 4.2 5.4 2.4 3.6 1.2 2.4 2.4 2.4 4.2c0 1.2.6 5.4.9 6.6.9 3.3 4.2 4.2 7.2 3.6-3 .6-6 1.8-6.6 5.4-.3 1.8.6 3.6 2.4 3.6 3 0 5.7-3.6 5.7-3.6s2.7 3.6 5.7 3.6c1.8 0 2.7-1.8 2.4-3.6-.6-3.6-3.6-4.8-6.6-5.4 3 .6 6.3-.3 7.2-3.6.3-1.2.9-5.4.9-6.6 0-1.8-1.2-3-3-1.8C16.2 4.2 13.2 8.4 12 10.8z" /></svg>
                Bluesky ↗
              </a>
              <a href="https://valleyworkscollaborative.substack.com/" target="_blank" rel="noopener noreferrer" className="ns-footer-sbtn" style={socialBtn} aria-label="Substack, opens in new tab">
                <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M22 5.5H2V8h20V5.5zM2 10.5V21l10-5.5 10 5.5V10.5H2zM22 2H2v2h20V2z" /></svg>
                Substack ↗
              </a>
            </div>
            <div style={{ gridColumn: "span 3" }}>
              <div style={colLabel}>Newsletter</div>
              <div style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 4 }}>Stay informed on Napa County.</div>
              <div style={{ fontSize: 14, color: T.muted, fontFamily: font, lineHeight: 1.6, marginBottom: 14 }}>Original reporting, economic updates and civic intelligence from Napa Valley Features — delivered when it matters.</div>
              <div style={{ display: "flex", gap: 8, maxWidth: 440 }}>
                <input className="ns-footer-sub-in" type="text" placeholder="Your name" aria-label="Your name" value={subName} onChange={e => setSubName(e.target.value)} style={{ marginBottom: 6 }} />
                <input className="ns-footer-sub-in" type="email" placeholder="Your email address" aria-label="Email address" value={email} onChange={e => setEmail(e.target.value)} />
                <button disabled={subStatus === "loading"} onClick={async () => {
                  setSubStatus("loading");
                  try {
                    const res = await fetch("https://misty-bush-fc93.tfcarl.workers.dev/api/subscribe", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: subName, email }),
                    });
                    if (!res.ok) throw new Error("insert failed");
                    setSubStatus("success");
                    setSubName("");
                    setEmail("");
                  } catch { setSubStatus("error"); }
                }} style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", background: T.ink, color: T.bg, border: "none", padding: "10px 18px", cursor: "pointer", whiteSpace: "nowrap", fontFamily: font }}>{subStatus === "loading" ? "Subscribing\u2026" : "Subscribe"}</button>
              </div>
              {subStatus === "success" && <div style={{ fontSize: 14, color: "#2E7D32", marginTop: 6, fontFamily: font }}>Welcome to NapaServe. We'll be in touch.</div>}
              {subStatus === "error" && <div style={{ fontSize: 14, color: "#C62828", marginTop: 6, fontFamily: font }}>Something went wrong. Email us at napaserve@gmail.com</div>}
              <div style={{ fontSize: 14, color: T.dim, fontFamily: font, marginTop: 7 }}>Join the NapaServe community. No spam, unsubscribe anytime.</div>
            </div>
          </div>

          {/* Copyright */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 14, color: T.dim, fontFamily: font }}>© 2026 Valley Works Collaborative · Not affiliated with Napa County government.</div>
            <div style={{ fontSize: 14, color: T.muted, fontFamily: font }}>napaserve@gmail.com</div>
          </div>
        </div>
      </footer>
    </>
  );
}

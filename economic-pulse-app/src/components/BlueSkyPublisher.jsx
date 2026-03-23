import { useState } from "react";

const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";

function formatPostText(publication, headline, deck, slug) {
  const url = `napaserve.org/under-the-hood/${slug}`;
  const header = `${publication} \u00B7 UNDER THE HOOD`;
  const maxDeckLen = 300 - header.length - headline.length - url.length - 8;
  const truncatedDeck = deck && deck.length > maxDeckLen
    ? deck.slice(0, maxDeckLen - 1).trimEnd() + "\u2026"
    : (deck || "");
  return `${header}\n\n${headline}\n\n${truncatedDeck}\n\n${url}`;
}

export default function BlueSkyPublisher({ headline, deck, slug, publication }) {
  const [state, setState] = useState("idle"); // idle | preview | posting | success | error
  const [postUri, setPostUri] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const postText = formatPostText(publication, headline, deck, slug);

  async function handleConfirm() {
    setState("posting");
    try {
      const res = await fetch(`${WORKER}/api/bluesky-publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline, deck, slug, publication }),
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

  // Convert at:// URI to web URL
  function bskyWebUrl(uri) {
    if (!uri) return "#";
    // at://did:plc:xxx/app.bsky.feed.post/yyy → https://bsky.app/profile/did:plc:xxx/post/yyy
    const m = uri.match(/^at:\/\/(did:[^/]+)\/app\.bsky\.feed\.post\/(.+)$/);
    if (m) return `https://bsky.app/profile/${m[1]}/post/${m[2]}`;
    return "#";
  }

  const font = "'Source Sans 3', sans-serif";
  const accent = "#8B5E3C";

  const btnBase = {
    fontFamily: font,
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    padding: "8px 16px",
  };

  if (state === "idle") {
    return (
      <div style={{ margin: "24px 0" }}>
        <button
          onClick={() => setState("preview")}
          style={{ ...btnBase, background: accent, color: "#fff" }}
        >
          Post to BlueSky
        </button>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div style={{ margin: "24px 0", fontFamily: font, fontSize: 14, color: "#2C1810" }}>
        Posted to @valleyworkscollab.bsky.social {"\u2713"}{" "}
        <a
          href={bskyWebUrl(postUri)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: accent, textDecoration: "underline", marginLeft: 4 }}
        >
          View post
        </a>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div style={{ margin: "24px 0", fontFamily: font, fontSize: 14 }}>
        <div style={{ color: "#b33" }}>{errorMsg}</div>
        <button
          onClick={() => { setState("idle"); setErrorMsg(null); }}
          style={{ ...btnBase, background: accent, color: "#fff", marginTop: 8 }}
        >
          Try again
        </button>
      </div>
    );
  }

  // preview / posting modal
  return (
    <div style={{
      margin: "24px 0",
      border: "1px solid #D4C4A8",
      borderRadius: 8,
      background: "#EDE8DE",
      padding: 20,
      fontFamily: font,
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#8B7355", marginBottom: 8 }}>
        BlueSky Post Preview
      </div>
      <pre style={{
        fontFamily: font,
        fontSize: 14,
        lineHeight: 1.5,
        color: "#2C1810",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        background: "#F5F0E8",
        padding: 12,
        borderRadius: 4,
        margin: "0 0 8px",
      }}>
        {postText}
      </pre>
      <div style={{ fontSize: 12, color: "#8B7355", marginBottom: 12 }}>
        {postText.length} / 300 characters
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleConfirm}
          disabled={state === "posting"}
          style={{
            ...btnBase,
            background: state === "posting" ? "#A89880" : accent,
            color: "#fff",
            opacity: state === "posting" ? 0.7 : 1,
          }}
        >
          {state === "posting" ? "Posting\u2026" : "Confirm & Post"}
        </button>
        <button
          onClick={() => setState("idle")}
          disabled={state === "posting"}
          style={{ ...btnBase, background: "transparent", color: accent, border: `1px solid ${accent}` }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

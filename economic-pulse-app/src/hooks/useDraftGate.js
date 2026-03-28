import { useState, useEffect } from "react";

const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";

export default function useDraftGate(slug) {
  const [state, setState] = useState({ status: "loading", title: null });

  useEffect(() => {
    if (!slug) return;
    fetch(`${WORKER}/api/article-status?slug=${slug}`)
      .then(r => {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(data => {
        if (data.published) {
          setState({ status: "published", title: data.title });
        } else {
          const token = typeof window !== "undefined" && sessionStorage.getItem("adminToken");
          if (token) {
            setState({ status: "draft", title: data.title });
          } else {
            setState({ status: "redirect", title: data.title });
          }
        }
      })
      .catch(() => {
        // If article not found in DB, fall through to published (legacy articles without DB rows)
        setState({ status: "published", title: null });
      });
  }, [slug]);

  return state;
}

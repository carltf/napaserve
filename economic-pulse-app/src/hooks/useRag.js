// src/hooks/useRag.js
// Shared RAG hook — usable in Agent, Dashboard, Project Evaluator, Archive
// Calls the Cloudflare Worker endpoints

const WORKER_URL = "https://misty-bush-fc93.tfcarl.workers.dev";

/**
 * ragSearch(query, options)
 * Returns raw chunk results from nvf_search()
 *
 * @param {string} query
 * @param {{ matchCount?: number, threshold?: number }} options
 * @returns {Promise<Array>} chunks with similarity scores
 */
export async function ragSearch(query, { matchCount = 8, threshold = 0.35 } = {}) {
  const res = await fetch(`${WORKER_URL}/api/rag-search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, matchCount, threshold }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "RAG search failed");
  return data.results;
}

/**
 * ragAnswer(query, options)
 * Returns an AI-generated answer + source chunks
 *
 * @param {string} query
 * @param {{ matchCount?: number }} options
 * @returns {Promise<{ answer: string, sources: Array, query: string }>}
 */
export async function ragAnswer(query, { matchCount = 6 } = {}) {
  const res = await fetch(`${WORKER_URL}/api/rag-answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, matchCount }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "RAG answer failed");
  return data; // { answer, sources, query }
}

/**
 * buildRagContext(query, matchCount)
 * Convenience: fetch chunks and format as a context string for LLM prompts.
 * Used by Project Evaluator and Agent when injecting archive knowledge.
 *
 * @param {string} query
 * @param {number} matchCount
 * @returns {Promise<{ contextString: string, sources: Array }>}
 */
export async function buildRagContext(query, matchCount = 5) {
  const chunks = await ragSearch(query, { matchCount, threshold: 0.3 });
  if (!chunks.length) return { contextString: "", sources: [] };

  const contextString = chunks
    .map(
      (c, i) =>
        `[${i + 1}] ${c.title || "Untitled"} (${c.published_at || "n/d"})\n${c.chunk_text}`
    )
    .join("\n\n---\n\n");

  const sources = chunks.map((c) => ({
    id: c.id,
    post_id: c.post_id,
    title: c.title,
    post_url: c.post_url,
    series: c.series,
    published_at: c.published_at,
    similarity: c.similarity,
    excerpt: (c.chunk_text || "").slice(0, 200) + "…",
  }));

  return { contextString, sources };
}

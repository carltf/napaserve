/**
 * NapaServe Cloudflare Worker
 * Routes:
 *   GET  /substack/archive       — Substack proxy (original, untouched)
 *   GET  /api/health             — health check
 *   POST /api/rag-search         — embed query → nvf_search() → return chunks
 *   POST /api/rag-answer         — embed → retrieve → Claude answer + sources
 *
 * Env vars (Bindings):
 *   SUPABASE_URL       (plaintext)
 *   SUPABASE_ANON_KEY  (secret)
 *   VOYAGE_API_KEY     (secret)
 *   ANTHROPIC_API_KEY  (secret)
 */

// ─── CORS ─────────────────────────────────────────────────────────────────────

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function applyCors(headers, request) {
  const origin = request.headers.get("Origin") || "*";
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Vary", "Origin");
}

function json(data, status = 200, request) {
  const headers = new Headers({ "Content-Type": "application/json" });
  applyCors(headers, request);
  return new Response(JSON.stringify(data), { status, headers });
}

function err(msg, status = 400, request) {
  return json({ error: msg }, status, request);
}

// ─── Voyage AI embedding ──────────────────────────────────────────────────────

async function embedQuery(text, apiKey) {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "voyage-3",
      input: [text],
      input_type: "query",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Voyage AI error ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.data[0].embedding;
}

// ─── Supabase nvf_search() ────────────────────────────────────────────────────

async function nvfSearch({ query, matchCount = 8, seriesFilter = null }, env) {
  const embedding = await embedQuery(query, env.VOYAGE_API_KEY);

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/nvf_search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      query_embedding: embedding,
      match_count: matchCount,
      series_filter: null,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase nvf_search error ${res.status}: ${body}`);
  }

  return res.json();
}

// ─── Route handlers ───────────────────────────────────────────────────────────

async function handleRagSearch(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body", 400, request);
  }

  const { query, matchCount = 8 } = body;
  if (!query || typeof query !== "string" || query.trim().length < 2) {
    return err("query is required (min 2 chars)", 400, request);
  }

  try {
    const results = await nvfSearch(
      { query: query.trim(), matchCount },
      env
    );
    return json({ results, query: query.trim() }, 200, request);
  } catch (e) {
    console.error("RAG search failed:", e);
    return err(`Search failed: ${e.message}`, 502, request);
  }
}

async function handleRagAnswer(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body", 400, request);
  }

  const { query, matchCount = 6 } = body;
  if (!query || typeof query !== "string" || query.trim().length < 3) {
    return err("query is required", 400, request);
  }

  try {
    const chunks = await nvfSearch(
      { query: query.trim(), matchCount },
      env
    );

    if (!chunks.length) {
      return json({
        answer: "I couldn't find relevant articles in the Napa Valley Features archive for that query. Try different keywords or browse the archive directly.",
        sources: [],
        query: query.trim(),
      }, 200, request);
    }

    const context = chunks
      .map((c, i) =>
        `[${i + 1}] ${c.title || "Untitled"} (${c.published_at || "n/d"})\n${c.chunk_text}`
      )
      .join("\n\n---\n\n");

    const systemPrompt = `You are NapaServe, Napa County's civic intelligence platform. You answer questions about local economics, policy, community, agriculture, and culture using the Napa Valley Features archive — a decade-plus of original local journalism.

Answer in 2–4 focused paragraphs. Be specific: cite article titles or dates when helpful. Do not fabricate facts. If the context doesn't fully answer the question, say so honestly. Maintain a knowledgeable, civic, grounded tone — not corporate, not breathless.`;

    const userPrompt = `Using these archive excerpts, answer the following question about Napa County:\n\n${context}\n\n---\n\nQuestion: ${query.trim()}`;

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!claudeRes.ok) {
      throw new Error(`Anthropic API error ${claudeRes.status}`);
    }

    const claudeData = await claudeRes.json();
    const answer = claudeData.content?.[0]?.text || "No answer generated.";

    const sources = chunks.map((c) => ({
      id: c.id,
      post_id: c.post_id,
      title: c.title,
      substack_url: c.substack_url,   // ← fixed from c.post_url
      series: c.series,
      published_at: c.published_at,
      similarity: c.similarity,
      excerpt: (c.chunk_text || "").slice(0, 280) + "…",
    }));

    return json({ answer, sources, query: query.trim() }, 200, request);
  } catch (e) {
    console.error("RAG answer failed:", e);
    return err(`Answer generation failed: ${e.message}`, 502, request);
  }
}

// ─── Main fetch handler ───────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request),
      });
    }

    // ── Original Substack proxy route (unchanged) ──────────────────────────
    if (url.pathname === "/substack/archive") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Method not allowed", { status: 405 });
      }

      const target = new URL("https://napavalleyfocus.substack.com/api/v1/archive");
      url.searchParams.forEach((value, key) => {
        target.searchParams.set(key, value);
      });

      const upstream = await fetch(target.toString(), {
        headers: {
          accept: "application/json",
          "user-agent": "nvf-squarespace-proxy/1.0",
        },
      });

      const body = await upstream.arrayBuffer();
      const headers = new Headers(upstream.headers);
      headers.set("content-type", "application/json; charset=utf-8");
      headers.set("cache-control", "public, max-age=300");
      applyCors(headers, request);

      return new Response(body, { status: upstream.status, headers });
    }

    // ── New RAG + utility routes ───────────────────────────────────────────
    if (url.pathname === "/api/health") {
      return json({ status: "ok", service: "napaserve-worker", ts: Date.now() }, 200, request);
    }

    if (url.pathname === "/api/rag-search" && request.method === "POST") {
      return handleRagSearch(request, env);
    }

    if (url.pathname === "/api/rag-answer" && request.method === "POST") {
      return handleRagAnswer(request, env);
    }

    return new Response("Not found", { status: 404 });
  },
};

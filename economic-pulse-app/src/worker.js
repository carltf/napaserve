/**
 * NapaServe Cloudflare Worker
 * Routes:
 *   GET  /substack/archive       — Substack proxy (original, untouched)
 *   GET  /api/health             — health check
 *   POST /api/rag-search         — embed query → nvf_search() → return chunks
 *   POST /api/rag-answer         — embed → retrieve → Claude answer + sources
 *   POST /api/poll-search         — embed query → nvf_poll_search() → matching polls
 *   GET  /api/fred               — FRED API proxy → macro indicators
 *   POST /api/submit-event       — community event submission → community_events
 *
 * Env vars (Bindings):
 *   SUPABASE_URL       (plaintext)
 *   SUPABASE_ANON_KEY  (secret)
 *   VOYAGE_API_KEY     (secret)
 *   ANTHROPIC_API_KEY  (secret)
 *   FRED_API_KEY       (secret)
 */

// ─── CORS ─────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  "https://napavalleyfeatures.com",
  "https://www.napavalleyfeatures.com",
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.squarespace\.com$/.test(origin)) return true;
  return false;
}

function resolveOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return "*";
  if (isAllowedOrigin(origin)) return origin;
  return origin; // keep existing permissive behavior for NapaServe app
}

function corsHeaders(request) {
  return {
    "Access-Control-Allow-Origin": resolveOrigin(request),
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function applyCors(headers, request) {
  headers.set("Access-Control-Allow-Origin", resolveOrigin(request));
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
      substack_url: c.substack_url,
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

// ─── FRED API handler ─────────────────────────────────────────────────────────

const FRED_SERIES = {
  UNRATE:       { label: "US Unemployment",      unit: "%", source: "BLS · Monthly",        row: "labor" },
  CAUR:         { label: "CA Unemployment",      unit: "%", source: "BLS · Monthly",        row: "labor" },
  CANA:         { label: "CA Employment",        unit: "",  source: "BLS · Monthly",        row: "labor" },
  JTSJOR:       { label: "Job Openings",         unit: "%", source: "BLS · Monthly",        row: "labor" },
  CPIAUCSL:     { label: "CPI (US)",             unit: "%", source: "BLS · Monthly",        row: "inflation" },
  PPIACO:       { label: "PPI (US)",             unit: "%", source: "BLS · Monthly",        row: "inflation" },
  MORTGAGE30US: { label: "30yr Mortgage",        unit: "%", source: "Freddie Mac · Weekly", row: "inflation" },
  CASTHPI:      { label: "CA Home Price Index",  unit: "",  source: "FHFA · Quarterly",     row: "inflation" },
  RSAFS:        { label: "Retail Sales",         unit: "",  source: "Census · Monthly",     row: "growth" },
  INDPRO:       { label: "Industrial Output",    unit: "",  source: "Fed · Monthly",        row: "growth" },
  HOUST:        { label: "Housing Starts",       unit: "",  source: "Census · Monthly",     row: "growth" },
  T10Y2Y:       { label: "Yield Curve",          unit: "%", source: "Treasury · Daily",     row: "growth" },
};

async function handleFred(request, env) {
  try {
    const results = await Promise.all(
      Object.keys(FRED_SERIES).map(async (id) => {
        const fredUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${env.FRED_API_KEY}&file_type=json&sort_order=desc&limit=2`;
        const res = await fetch(fredUrl);
        if (!res.ok) {
          return { id, ...FRED_SERIES[id], value: null, date: null, prior: null };
        }
        const data = await res.json();
        const obs = data.observations || [];
        const latest = obs.find(o => o.value !== ".") || obs[0];
        const prior  = obs.slice(1).find(o => o.value !== ".") || null;
        return {
          id,
          ...FRED_SERIES[id],
          value: latest?.value ?? null,
          date:  latest?.date  ?? null,
          prior: prior?.value  ?? null,
        };
      })
    );
    return json({ results, ts: Date.now() }, 200, request);
  } catch (e) {
    console.error("FRED fetch failed:", e);
    return err(`FRED fetch failed: ${e.message}`, 502, request);
  }
}

// ─── Poll search handler ─────────────────────────────────────────────────────

async function handlePollSearch(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body", 400, request);
  }

  const { query, matchCount = 5 } = body;
  if (!query || typeof query !== "string" || query.trim().length < 2) {
    return err("query is required (min 2 chars)", 400, request);
  }

  try {
    const embedding = await embedQuery(query.trim(), env.VOYAGE_API_KEY);

    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/nvf_poll_search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        query_embedding: embedding,
        match_count: matchCount,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Supabase nvf_poll_search error ${res.status}: ${text}`);
    }

    const results = await res.json();
    return json({ results, query: query.trim() }, 200, request);
  } catch (e) {
    console.error("Poll search failed:", e);
    return err(`Poll search failed: ${e.message}`, 502, request);
  }
}

// ─── Subscribe handler ───────────────────────────────────────────────────────

async function handleSubscribe(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body", 400, request);
  }

  const { name, email } = body;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return err("Valid email is required", 400, request);
  }

  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/napaserve_subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ name: name || null, email, subscribed_at: new Date().toISOString(), source: "hub" }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Supabase insert error ${res.status}: ${text}`);
    }
    return json({ success: true }, 200, request);
  } catch (e) {
    console.error("Subscribe failed:", e);
    return err(`Subscribe failed: ${e.message}`, 502, request);
  }
}

// ─── Submit event handler ────────────────────────────────────────────────────

const VALID_CATEGORIES = [
  "community", "arts", "food_wine", "music", "sports", "education",
  "charity", "business", "government", "health", "family", "outdoor",
];

const VALID_TOWNS = [
  "Napa", "Yountville", "St. Helena", "Calistoga", "American Canyon",
  "Angwin", "Deer Park", "Oakville", "Rutherford", "Pope Valley",
  "Lake Berryessa", "Silverado", "Other",
];

async function handleSubmitEvent(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body", 400, request);
  }

  const { title, description, event_date, town, category } = body;

  // Validate required fields
  if (!title || typeof title !== "string" || title.trim().length < 3) {
    return err("Title is required (min 3 characters)", 400, request);
  }
  if (!description || typeof description !== "string" || description.trim().length < 10) {
    return err("Description is required (min 10 characters)", 400, request);
  }
  if (!event_date || !/^\d{4}-\d{2}-\d{2}$/.test(event_date)) {
    return err("Event date is required (YYYY-MM-DD)", 400, request);
  }
  if (!town || !VALID_TOWNS.includes(town)) {
    return err(`Town is required. Valid: ${VALID_TOWNS.join(", ")}`, 400, request);
  }
  if (!category || !VALID_CATEGORIES.includes(category)) {
    return err(`Category is required. Valid: ${VALID_CATEGORIES.join(", ")}`, 400, request);
  }
  if (!body.submitted_by || typeof body.submitted_by !== "string" || body.submitted_by.trim().length < 2) {
    return err("Your name is required (min 2 characters)", 400, request);
  }
  if (!body.organizer_contact || typeof body.organizer_contact !== "string" || !body.organizer_contact.includes("@")) {
    return err("A valid email is required", 400, request);
  }

  // Build row — only include non-empty optional fields
  const row = {
    title: title.trim(),
    description: description.trim(),
    event_date,
    town,
    category,
    submitted_by: body.submitted_by.trim(),
    organizer_contact: body.organizer_contact.trim(),
    status: "pending",
    source: "community",
    submitted_at: new Date().toISOString(),
  };

  const optionalText = [
    "end_date", "start_time", "end_time", "venue_name", "address",
    "price_info", "age_restriction", "indoor_outdoor", "recurrence_desc",
    "website_url", "ticket_url", "accessibility_info",
  ];
  for (const key of optionalText) {
    if (body[key] && typeof body[key] === "string" && body[key].trim()) {
      row[key] = body[key].trim();
    }
  }
  if (typeof body.is_free === "boolean") row.is_free = body.is_free;
  if (typeof body.is_recurring === "boolean") row.is_recurring = body.is_recurring;

  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/community_events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Supabase insert error ${res.status}: ${text}`);
    }
    return json({ success: true, message: "Event submitted for review" }, 200, request);
  } catch (e) {
    console.error("Submit event failed:", e);
    return err(`Event submission failed: ${e.message}`, 502, request);
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

    // ── API routes ─────────────────────────────────────────────────────────
    if (url.pathname === "/api/health") {
      return json({ status: "ok", service: "napaserve-worker", ts: Date.now() }, 200, request);
    }

    if (url.pathname === "/api/rag-search" && request.method === "POST") {
      return handleRagSearch(request, env);
    }

    if (url.pathname === "/api/rag-answer" && request.method === "POST") {
      return handleRagAnswer(request, env);
    }

    if (url.pathname === "/api/fred" && request.method === "GET") {
      return handleFred(request, env);
    }

    if (url.pathname === "/api/poll-search" && request.method === "POST") {
      return handlePollSearch(request, env);
    }

    if (url.pathname === "/api/subscribe" && request.method === "POST") {
      return handleSubscribe(request, env);
    }

    if (url.pathname === "/api/submit-event" && request.method === "POST") {
      return handleSubmitEvent(request, env);
    }

    return new Response("Not found", { status: 404 });
  },
};

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
 *   POST /api/bluesky-publish    — post Under the Hood article to BlueSky (admin-only)
 *   GET  /api/article-polls      — fetch polls + vote counts for an article
 *   POST /api/article-poll-vote  — submit a vote for an article poll
 *   POST /api/admin-auth         — validate admin password, return session token
 *   POST /api/admin-verify       — verify session token is valid
 *   POST /api/send-welcome       — send welcome email to new subscriber
 *   POST /api/send-digest-preview — send weekly digest preview to info@napaserve.com (admin only)
 *   GET  /api/unsubscribe        — unsubscribe a subscriber by ?email=
 *   GET  /api/related-articles   — semantic related coverage by ?slug=
 *   GET  /api/articles           — list articles (?published=true to filter)
 *   GET  /api/article-status     — public article status by ?slug=
 *   POST /api/publish-article    — set article published=true (admin-only)
 *   GET  /api/events-search      — DB-backed event search → community_events + astronomical_events fallback
 *
 * Env vars (Bindings):
 *   SUPABASE_URL         (plaintext)
 *   SUPABASE_ANON_KEY    (secret)
 *   SUPABASE_KEY  (secret) — service role key for admin writes
 *   VOYAGE_API_KEY       (secret)
 *   ANTHROPIC_API_KEY    (secret)
 *   FRED_API_KEY         (secret)
 *   BLUESKY_HANDLE       (plaintext)
 *   BLUESKY_APP_PASSWORD (secret)
 *   ADMIN_PASSWORD       (secret)
 *   ADMIN_SESSION_SECRET (secret)
 *   RESEND_API_KEY       (secret)
 */

// ─── CORS ─────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  "https://napavalleyfeatures.com",
  "https://www.napavalleyfeatures.com",
  "https://napaserve.org",
  "https://www.napaserve.org",
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
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
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

// ─── Admin auth helpers ──────────────────────────────────────────────────────

async function generateToken(secret) {
  const timestamp = Date.now().toString();
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(timestamp);
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, msgData);
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${timestamp}.${hex}`;
}

async function verifyToken(token, secret) {
  try {
    const [timestamp, hex] = token.split('.');
    if (!timestamp || !hex) return false;
    const age = Date.now() - parseInt(timestamp);
    if (age > 8 * 60 * 60 * 1000) return false; // 8 hour expiry
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const msgData = encoder.encode(timestamp);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, msgData);
    const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
    return hex === expected;
  } catch {
    return false;
  }
}

async function requireAdminToken(request, env) {
  const token = request.headers.get('X-Admin-Token');
  if (!token) return false;
  return verifyToken(token, env.ADMIN_SESSION_SECRET);
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

const SECONDARY_SOURCES = {
  'housing': [
    { label: 'Napa County Housing & Community Services', url: 'https://www.napacounty.gov/434/Housing-and-Community-Services' },
    { label: 'CA Dept. of Housing & Community Development', url: 'https://www.hcd.ca.gov/' },
    { label: 'City of Napa Planning Division', url: 'https://www.cityofnapa.org/247/Planning-Division' },
  ],
  'water': [
    { label: 'Napa County Flood Control & Water Resources', url: 'https://www.napacounty.gov/1074/Flood-Water-Resources' },
    { label: 'State Water Resources Control Board', url: 'https://www.waterboards.ca.gov/' },
    { label: 'Napa County Public Works', url: 'https://www.napacounty.gov/2082/Public-Works' },
  ],
  'land_use': [
    { label: 'Napa County Planning, Building & Environmental Services', url: 'https://www.napacounty.gov/589/Planning-Building-Environmental-Services' },
    { label: 'City of Napa Planning Division', url: 'https://www.cityofnapa.org/247/Planning-Division' },
    { label: 'City of Napa General Plan', url: 'https://www.cityofnapa.org/259/General-Plan' },
  ],
  'wine': [
    { label: 'USDA NASS CA Grape Crush Reports', url: 'https://www.nass.usda.gov/Statistics_by_State/California/Publications/Specialty_and_Other_Releases/Grapes/Crush/Reports/index.php' },
    { label: 'Wine Institute CA Statistics', url: 'https://wineinstitute.org/our-industry/statistics/' },
    { label: 'Napa Valley Vintners', url: 'https://napavintners.com/napa_valley/' },
  ],
  'workforce': [
    { label: 'EDD Labor Market Info — Napa MSA', url: 'https://labormarketinfo.edd.ca.gov/geography/msa/napa.html' },
    { label: 'Napa County Workforce Development', url: 'https://www.napacounty.gov/422/Employment-Assistance' },
    { label: 'Napa Valley Community Foundation', url: 'https://www.napavalleycf.org/' },
  ],
  'tourism': [
    { label: 'Visit Napa Valley — Industry Resources', url: 'https://www.visitnapavalley.com/industry/' },
    { label: 'Visit California — Research & Statistics', url: 'https://industry.visitcalifornia.com/research' },
    { label: 'Napa County Treasurer-Tax Collector', url: 'https://www.napacounty.gov/1227/Treasurer---Tax-Collector' },
  ],
  'agriculture': [
    { label: 'USDA NASS CA Grape Crush Reports', url: 'https://www.nass.usda.gov/Statistics_by_State/California/Publications/Specialty_and_Other_Releases/Grapes/Crush/Reports/index.php' },
    { label: 'Napa County Crop Reports', url: 'https://www.napacounty.gov/258/Crop-Reports' },
    { label: 'UC Cooperative Extension — Napa County', url: 'https://ucanr.edu/county/napa-county-ucce' },
  ],
  'safety': [
    { label: 'Napa County Emergency Services', url: 'https://www.napacounty.gov/353/Emergency-Services' },
    { label: 'CAL FIRE — Incident Information', url: 'https://www.fire.ca.gov/incidents/' },
    { label: 'Napa County Sheriff', url: 'https://www.napacounty.gov/1292/Sheriff' },
  ],
  'economy': [
    { label: 'FRED — Napa MSA Economic Data', url: 'https://fred.stlouisfed.org/release/tables?rid=454&eid=784071' },
    { label: 'CA Dept. of Finance — County Profiles', url: 'https://dof.ca.gov/forecasting/demographics/estimates/' },
    { label: 'Napa County Budget & Finance', url: 'https://www.napacounty.gov/423/Budget' },
  ],
  'health': [
    { label: 'Napa County Health & Human Services', url: 'https://www.napacounty.gov/156/Health-Human-Services' },
    { label: 'Napa Valley Community Health', url: 'https://nvch.org/' },
    { label: 'CA Dept. of Public Health', url: 'https://www.cdph.ca.gov/' },
  ],
  'education': [
    { label: 'Napa Valley Unified School District', url: 'https://www.nvusd.org/' },
    { label: 'Napa Valley College', url: 'https://www.napavalley.edu/' },
    { label: 'CA Dept. of Education', url: 'https://www.cde.ca.gov/' },
  ],
  'government': [
    { label: 'Napa County Board of Supervisors', url: 'https://www.napacounty.gov/1316/Board-of-Supervisors' },
    { label: 'City of Napa', url: 'https://www.cityofnapa.org/' },
    { label: 'CA Legislative Information', url: 'https://leginfo.legislature.ca.gov/' },
  ],
};

function classifyQuery(query) {
  const q = query.toLowerCase();
  if (/housing|afford|rent|home|apartment|residential|hcd/.test(q)) return 'housing';
  if (/water|watershed|flood|drought|groundwater|creek|river/.test(q)) return 'water';
  if (/land use|zoning|general plan|parcel|planning|permit|development/.test(q)) return 'land_use';
  if (/wine|winery|vineyard|cab|cabernet|vintage|tasting|bottle|dtc/.test(q)) return 'wine';
  if (/grape|crush|viticulture|harvest|farming|grower|vineyard/.test(q)) return 'agriculture';
  if (/workforce|job|employ|wage|labor|worker|hire|career/.test(q)) return 'workforce';
  if (/tourism|hotel|lodging|visitor|hospitality|tasting room|travel/.test(q)) return 'tourism';
  if (/wildfire|fire|emergency|safety|sheriff|crime|police/.test(q)) return 'safety';
  if (/economy|economic|gdp|revenue|fiscal|budget|tax|business/.test(q)) return 'economy';
  if (/health|hospital|mental|wellness|medical|clinic/.test(q)) return 'health';
  if (/school|education|college|student|youth|family|child/.test(q)) return 'education';
  if (/government|policy|supervisor|council|ordinance|regulation|law/.test(q)) return 'government';
  return null;
}

async function callAnthropicWithRetry(payload, apiKey, maxRetries = 3) {
  let lastStatus = 0;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });
    lastStatus = res.status;
    if (res.status !== 529) return res;
    if (attempt < maxRetries - 1) {
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw new Error(`Anthropic API error ${lastStatus} after ${maxRetries} retries`);
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

    const claudeRes = await callAnthropicWithRetry({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }, env.ANTHROPIC_API_KEY);

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

    const category = classifyQuery(query.trim());
    const secondarySources = category ? SECONDARY_SOURCES[category] : [];

    return json({ answer, sources, secondarySources, query: query.trim() }, 200, request);
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

// ─── Resend email helper ─────────────────────────────────────────────────────

async function sendEmail({ to, subject, html }, env) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'NapaServe <info@napaserve.com>',
      to,
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
  return res.json();
}

// ─── Welcome email handler ──────────────────────────────────────────────────

async function handleSendWelcome(request, env) {
  let body;
  try { body = await request.json(); } catch { return err('Invalid JSON body', 400, request); }

  const { name, email } = body;
  if (!email || !email.includes('@')) return err('Valid email required', 400, request);

  try {
    const template = await fetch('https://napaserve.org/emails/welcome-email.html');
    let html = await template.text();

    const displayName = name && name.trim() ? name.trim() : 'there';
    html = html.replace(/\{\{NAME\}\}/g, displayName);
    html = html.replace(/\{\{EMAIL\}\}/g, encodeURIComponent(email));

    await sendEmail({
      to: email,
      subject: 'Welcome to NapaServe \u2014 Community Intelligence for Napa County',
      html,
    }, env);

    return json({ success: true }, 200, request);
  } catch (e) {
    console.error('Welcome email failed:', e);
    return err(`Welcome email failed: ${e.message}`, 502, request);
  }
}

// ─── Digest preview handler ─────────────────────────────────────────────────

async function handleSendDigestPreview(request, env) {
  const authorized = await requireAdminToken(request, env);
  if (!authorized) return err('Unauthorized', 401, request);

  try {
    const template = await fetch('https://napaserve.org/emails/weekly-digest.html');
    let html = await template.text();

    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    html = html.replace(/\{\{DATE\}\}/g, date);

    await sendEmail({
      to: 'info@napaserve.com',
      subject: `[PREVIEW] NapaServe Weekly Digest \u2014 ${date}`,
      html,
    }, env);

    return json({ success: true, message: 'Preview sent to info@napaserve.com' }, 200, request);
  } catch (e) {
    console.error('Digest preview failed:', e);
    return err(`Digest preview failed: ${e.message}`, 502, request);
  }
}

// ─── Subscribe handler ──────────────────────────────────────────────────────

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

    // Fire welcome email (non-blocking — don't fail subscribe if email fails)
    try {
      await handleSendWelcome(new Request(request.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || '', email }),
      }), env);
    } catch (e) {
      console.error('Welcome email failed after subscribe:', e);
    }

    return json({ success: true }, 200, request);
  } catch (e) {
    console.error("Subscribe failed:", e);
    return err(`Subscribe failed: ${e.message}`, 502, request);
  }
}

// ─── Unsubscribe handler ─────────────────────────────────────────────────────

async function handleUnsubscribe(request, env) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  if (!email || !email.includes("@")) {
    return new Response("Missing or invalid email.", { status: 400, headers: { "Content-Type": "text/html" } });
  }

  try {
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/napaserve_subscribers?email=eq.${encodeURIComponent(email)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=minimal",
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ unsubscribed_at: new Date().toISOString() }),
      }
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Supabase PATCH error ${res.status}: ${body}`);
    }
  } catch (e) {
    console.error("Unsubscribe failed:", e);
    return new Response("Something went wrong. Please try again.", { status: 500, headers: { "Content-Type": "text/html" } });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Unsubscribed — NapaServe</title>
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#F5F0E8;font-family:Arial,Helvetica,sans-serif;color:#2C1810;display:flex;justify-content:center;align-items:center;min-height:100vh;">
<div style="text-align:center;max-width:480px;padding:48px 24px;">
  <h1 style="font-family:'Libre Baskerville',Georgia,serif;font-size:28px;font-weight:700;color:#2C1810;margin:0 0 16px;">You've been unsubscribed</h1>
  <p style="font-size:16px;line-height:1.6;color:#2C1810;margin:0 0 32px;">You'll no longer receive emails from NapaServe.</p>
  <a href="https://napaserve.org" style="font-size:14px;color:#8B5E3C;text-decoration:none;font-weight:600;">← Back to napaserve.org</a>
</div>
</body>
</html>`;

  return new Response(html, { status: 200, headers: { "Content-Type": "text/html" } });
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

// ─── BlueSky publish ─────────────────────────────────────────────────────────

async function handleBlueSkyPublish(request, env) {
  let body;
  try { body = await request.json(); } catch { return err("Invalid JSON body", 400, request); }

  const authorized = await requireAdminToken(request, env);
  if (!authorized) return err('Unauthorized', 401, request);

  const { headline, deck, slug, publication, imageData, imageMimeType } = body;
  if (!headline || !slug || !publication) return err("headline, slug, and publication required", 400, request);

  try {
    // Authenticate
    const sessionRes = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: env.BLUESKY_HANDLE, password: env.BLUESKY_APP_PASSWORD }),
    });
    if (!sessionRes.ok) throw new Error(`BlueSky auth failed: ${sessionRes.status}`);
    const { accessJwt, did } = await sessionRes.json();

    // Format post text under 300 chars
    const url = `napaserve.org/under-the-hood/${slug}`;
    const prefix = `${publication} \u00B7 UNDER THE HOOD\n\n${headline}\n\n`;
    const suffix = `\n\n${url}`;
    const maxDeck = 300 - prefix.length - suffix.length;
    const trimmedDeck = deck && deck.length > 0
      ? (deck.length > maxDeck ? deck.slice(0, maxDeck - 1) + "\u2026" : deck)
      : "";
    const text = prefix + trimmedDeck + suffix;

    // Optional image upload
    let embed = undefined;
    if (imageData && imageMimeType) {
      const imageBytes = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));
      const blobRes = await fetch("https://bsky.social/xrpc/com.atproto.repo.uploadBlob", {
        method: "POST",
        headers: {
          "Content-Type": imageMimeType,
          Authorization: `Bearer ${accessJwt}`,
        },
        body: imageBytes,
      });
      if (!blobRes.ok) throw new Error(`BlueSky blob upload failed: ${blobRes.status}`);
      const { blob } = await blobRes.json();
      embed = {
        $type: "app.bsky.embed.images",
        images: [{
          image: blob,
          alt: `Chart from ${headline}`,
        }],
      };
    }

    // Create post record
    const record = { text, createdAt: new Date().toISOString(), langs: ["en"] };
    if (embed) record.embed = embed;

    const postRes = await fetch("https://bsky.social/xrpc/com.atproto.repo.createRecord", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessJwt}`,
      },
      body: JSON.stringify({
        repo: did,
        collection: "app.bsky.feed.post",
        record,
      }),
    });
    if (!postRes.ok) throw new Error(`BlueSky post failed: ${postRes.status}`);
    const postData = await postRes.json();
    return json({ success: true, uri: postData.uri }, 200, request);
  } catch (e) {
    console.error("BlueSky publish failed:", e);
    return err(`BlueSky publish failed: ${e.message}`, 502, request);
  }
}

// ─── Admin auth handlers ─────────────────────────────────────────────────────

async function handleAdminAuth(request, env) {
  let body;
  try { body = await request.json(); } catch { return err('Invalid JSON body', 400, request); }
  const { password } = body;
  if (!password || password !== env.ADMIN_PASSWORD) {
    return err('Invalid password', 401, request);
  }
  const token = await generateToken(env.ADMIN_SESSION_SECRET);
  return json({ success: true, token }, 200, request);
}

async function handleAdminVerify(request, env) {
  const valid = await requireAdminToken(request, env);
  return json({ valid }, 200, request);
}

// ─── Article polls ───────────────────────────────────────────────────────────

async function handleArticlePolls(request, env) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return err("slug required", 400, request);

  const pollsRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/napaserve_article_polls?article_slug=eq.${slug}&order=sort_order.asc`,
    { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
  );
  const polls = await pollsRes.json();

  const pollsWithCounts = await Promise.all(polls.map(async (poll) => {
    const votesRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/napaserve_poll_votes?poll_id=eq.${poll.id}&select=option_index`,
      { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
    );
    const votes = await votesRes.json();
    const counts = {};
    votes.forEach(v => { counts[v.option_index] = (counts[v.option_index] || 0) + 1; });
    return { ...poll, counts, total: votes.length };
  }));

  return json(pollsWithCounts, 200, request);
}

async function handleArticlePollVote(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body", 400, request);
  }

  const { poll_id, option_index } = body;
  if (poll_id === undefined || option_index === undefined) {
    return err("poll_id and option_index required", 400, request);
  }

  const insertRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/napaserve_poll_votes`,
    {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ poll_id, option_index }),
    }
  );

  if (!insertRes.ok) {
    return err("Vote failed", 500, request);
  }

  const votesRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/napaserve_poll_votes?poll_id=eq.${poll_id}&select=option_index`,
    { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
  );
  const votes = await votesRes.json();
  const counts = {};
  votes.forEach(v => { counts[v.option_index] = (counts[v.option_index] || 0) + 1; });

  return json({ success: true, counts, total: votes.length }, 200, request);
}

// ─── Article status / publish ────────────────────────────────────────────────

async function handleRelatedArticles(request, env) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return err("slug required", 400, request);

  // Fetch topic_seed from Supabase instead of hardcoded map
  const sbUrl = `${env.SUPABASE_URL}/rest/v1/napaserve_articles?slug=eq.${slug}&select=topic_seed&limit=1`;
  const sbRes = await fetch(sbUrl, {
    headers: {
      'apikey': env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
    },
  });
  const sbData = await sbRes.json();
  const topicSeed = sbData?.[0]?.topic_seed;
  if (!topicSeed) return err("No topic seed for slug", 404, request);

  try {
    const results = await nvfSearch({ query: topicSeed, matchCount: 10 }, env);

    // Dedupe by title, exclude self
    const seen = new Set();
    const filtered = [];
    for (const r of results) {
      const title = r.title;
      if (!title) continue;
      if (seen.has(title)) continue;
      // Skip if the chunk belongs to the requesting article
      const postSlug = (r.substack_url || "").split("/").pop();
      if (postSlug === slug) continue;
      seen.add(title);
      filtered.push({
        title,
        url: r.substack_url || null,
        published_at: r.published_at || null,
      });
      if (filtered.length >= 5) break;
    }

    return json({ results: filtered }, 200, request);
  } catch (e) {
    console.error("Related articles failed:", e);
    return err(`Search failed: ${e.message}`, 502, request);
  }
}

async function handleArticleStatus(request, env) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return err("slug required", 400, request);

  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/napaserve_articles?slug=eq.${slug}&select=slug,title,published,polls_seeded,admin_cards_added,related_coverage_added`,
    { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
  );
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) return err("not found", 404, request);
  return json(rows[0], 200, request);
}

async function handlePublishArticle(request, env) {
  const authorized = await requireAdminToken(request, env);
  if (!authorized) return err("Unauthorized", 401, request);

  let body;
  try { body = await request.json(); } catch { return err("Invalid JSON body", 400, request); }

  const { slug } = body;
  if (!slug) return err("slug required", 400, request);

  const serviceHeaders = {
    apikey: env.SUPABASE_KEY,
    Authorization: `Bearer ${env.SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };

  // Check current status
  const checkRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/napaserve_articles?slug=eq.${slug}&select=slug,published`,
    { headers: serviceHeaders }
  );
  const rows = await checkRes.json();
  if (!Array.isArray(rows) || rows.length === 0) return err("not found", 404, request);
  if (rows[0].published) return err("already published", 400, request);

  // Update
  const updateRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/napaserve_articles?slug=eq.${slug}`,
    {
      method: "PATCH",
      headers: { ...serviceHeaders, Prefer: "return=representation" },
      body: JSON.stringify({ published: true, published_at: new Date().toISOString() }),
    }
  );
  const updated = await updateRes.json();
  if (!Array.isArray(updated) || updated.length === 0) return err("update failed", 500, request);
  return json(updated[0], 200, request);
}

async function handleArticles(request, env) {
  const url = new URL(request.url);
  const published = url.searchParams.get("published");
  let query = `${env.SUPABASE_URL}/rest/v1/napaserve_articles?select=slug,title,publication,published,published_at&order=published_at.desc`;
  if (published === "true") query += "&published=eq.true";
  const res = await fetch(query, {
    headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` },
  });
  const rows = await res.json();
  return json(Array.isArray(rows) ? rows : [], 200, request);
}

// ─── Events search handler ───────────────────────────────────────────────────

async function handleEventsSearch(request, env) {
  const url = new URL(request.url);
  const town = url.searchParams.get("town") || null;
  const category = url.searchParams.get("category") || null;
  const start = url.searchParams.get("start") || null;
  const end = url.searchParams.get("end") || null;
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "10", 10), 20);

  try {
    // Build Supabase query against community_events
    let query = `${env.SUPABASE_URL}/rest/v1/community_events?select=title,description,event_date,town,category,venue_name,address,website_url,ticket_url,price_info,is_recurring,lat,lng&status=eq.approved&order=event_date.asc&limit=${limit}`;

    if (town && town !== "all") {
      query += `&town=eq.${encodeURIComponent(town)}`;
    }
    if (category && category !== "any") {
      if (category === "night-sky") {
        // Night sky routes to astronomical_events — handled separately
        const astroQuery = `${env.SUPABASE_URL}/rest/v1/astronomical_events?select=title,description,event_date,viewing_notes&order=event_date.asc&limit=${limit}`;
        const astroRes = await fetch(astroQuery, {
          headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` },
        });
        const astroRows = await astroRes.json();
        return json({ ok: true, count: astroRows.length, results: astroRows, source: "astronomical_events" }, 200, request);
      }
      query += `&category=eq.${encodeURIComponent(category)}`;
    }
    if (start) {
      query += `&event_date=gte.${start}`;
    }
    if (end) {
      query += `&event_date=lte.${end}`;
    }

    const res = await fetch(query, {
      headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Supabase query error ${res.status}: ${text}`);
    }

    const rows = await res.json();

    // If DB returns fewer than requested, flag for scraper fallback in UI
    const needsFallback = rows.length < limit;

    return json({
      ok: true,
      count: rows.length,
      results: rows,
      source: "community_events",
      needs_fallback: needsFallback,
    }, 200, request);

  } catch (e) {
    console.error("Events search failed:", e);
    return err(`Events search failed: ${e.message}`, 502, request);
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

    // ── Original Substack proxy route (Cloudflare Cache API) ────────────────
    if (url.pathname === "/substack/archive") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Method not allowed", { status: 405 });
      }

      const cacheKey = new Request(request.url, { method: "GET" });
      const cache = caches.default;
      let cached = await cache.match(cacheKey);

      if (!cached) {
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
        cached = new Response(body, {
          status: upstream.status,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "public, max-age=1800",
          },
        });
        await cache.put(cacheKey, cached.clone());
      }

      // Reconstruct with fresh CORS headers for every request
      const freshHeaders = new Headers(cached.headers);
      applyCors(freshHeaders, request);
      return new Response(cached.body, { status: cached.status, headers: freshHeaders });
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

    if (url.pathname === "/api/bluesky-publish" && request.method === "POST") {
      return handleBlueSkyPublish(request, env);
    }

    if (url.pathname === "/api/article-polls" && request.method === "GET") {
      return handleArticlePolls(request, env);
    }

    if (url.pathname === "/api/article-poll-vote" && request.method === "POST") {
      return handleArticlePollVote(request, env);
    }

    if (url.pathname === "/api/admin-auth" && request.method === "POST") {
      return handleAdminAuth(request, env);
    }

    if (url.pathname === "/api/admin-verify" && request.method === "POST") {
      return handleAdminVerify(request, env);
    }

    if (url.pathname === "/api/send-welcome" && request.method === "POST") {
      return handleSendWelcome(request, env);
    }

    if (url.pathname === "/api/send-digest-preview" && request.method === "POST") {
      return handleSendDigestPreview(request, env);
    }

    if (url.pathname === "/api/unsubscribe" && request.method === "GET") {
      return handleUnsubscribe(request, env);
    }

    if (url.pathname === "/api/related-articles" && request.method === "GET") {
      return handleRelatedArticles(request, env);
    }

    if (url.pathname === "/api/articles" && request.method === "GET") {
      return handleArticles(request, env);
    }

    if (url.pathname === "/api/article-status" && request.method === "GET") {
      return handleArticleStatus(request, env);
    }

    if (url.pathname === "/api/publish-article" && request.method === "POST") {
      return handlePublishArticle(request, env);
    }

    if (url.pathname === "/api/events-search" && request.method === "GET") {
      return handleEventsSearch(request, env);
    }

    return new Response("Not found", { status: 404 });
  },
};

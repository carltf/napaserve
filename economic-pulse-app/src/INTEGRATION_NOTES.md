# NapaServe RAG Integration Notes
# ─────────────────────────────────────────────────────────────────────────────

## Files produced

| File | Destination | Purpose |
|------|------------|---------|
| worker.js | Cloudflare Worker (replace existing) | Adds /api/rag-search and /api/rag-answer |
| Archive.jsx | src/pages/Archive.jsx | Search UI page |
| useRag.js | src/hooks/useRag.js | Shared RAG utility for Agent, Evaluator, Dashboard |

---

## 1. Cloudflare Worker — wrangler.toml secrets

Add these three secrets via `wrangler secret put` or the Cloudflare dashboard:

```
wrangler secret put VOYAGE_API_KEY
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put ANTHROPIC_API_KEY
```

SUPABASE_URL can stay in wrangler.toml (non-secret):

```toml
[vars]
SUPABASE_URL = "https://csenpchwxxepdvjebsrt.supabase.co"
```

---

## 2. Supabase — nvf_search() signature check

The worker calls nvf_search() with this payload:

```json
{
  "query_embedding": [/* 1024 floats */],
  "match_count": 8,
  "match_threshold": 0.35
}
```

Verify your function signature accepts those exact parameter names.
Expected return columns used by the worker:
  id, post_id, post_title, post_url, published_date, content, similarity

If your function returns different column names, update the mapping in
worker.js around the `sources = chunks.map(...)` block.

---

## 3. App.jsx — add the Archive route

```jsx
import Archive from "./pages/Archive";

// inside <Routes>:
<Route path="/archive" element={<Archive />} />
```

Add to nav (wherever your other links live):
```jsx
<Link to="/archive">Archive</Link>
```

---

## 4. Worker endpoints

| Method | Path | Body | Returns |
|--------|------|------|---------|
| POST | /api/rag-search | { query, matchCount?, threshold? } | { results: chunk[] } |
| POST | /api/rag-answer | { query, matchCount? } | { answer, sources, query } |
| GET | /api/rss-proxy | ?url=<feed_url> | XML |
| GET | /api/health | — | { status: "ok" } |

---

## 5. Wiring RAG into Project Evaluator

In your evaluator's Claude API call, inject archive context:

```js
import { buildRagContext } from "../hooks/useRag";

// Before calling Anthropic:
const { contextString, sources } = await buildRagContext(projectDescription, 5);

const systemPrompt = `You are NapaServe's Project Evaluator...
${contextString ? `\n\nRelevant Napa Valley Features archive context:\n${contextString}` : ""}`;
```

---

## 6. Wiring RAG into Agent (agent.html)

In the agent's system prompt or before each user message, prepend archive context
by calling /api/rag-answer or /api/rag-search with the user's latest message
as the query. The useRag.js `buildRagContext()` function handles this cleanly.

---

## 7. Deploy

```bash
cd <your-worker-directory>
# paste in the new worker.js content
wrangler deploy
```

Then test:
```bash
curl -X POST https://misty-bush-fc93.tfcarl.workers.dev/api/rag-search \
  -H "Content-Type: application/json" \
  -d '{"query":"housing affordability Napa County","matchCount":3}'
```

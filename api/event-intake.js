/**
 * api/event-intake.js
 * NapaServe — Event Intake API
 *
 * Handles two actions from EventIntake.jsx:
 *   action: "extract" — calls Claude to extract event fields from page content
 *   action: "insert"  — inserts extracted events into Supabase community_events
 *
 * Env vars required (already in Vercel):
 *   ANTHROPIC_API_KEY  — Anthropic API key
 *   SUPABASE_URL       — https://csenpchwxxepdvjebsrt.supabase.co
 *   SUPABASE_KEY       — service role key (write access)
 *
 * Place at: api/event-intake.js
 * Route:    https://napaserve.org/api/event-intake
 */

const ALLOWED_ORIGINS = new Set([
  "https://napaserve.org",
  "http://localhost:3000",
  "http://localhost:5173",
]);

const EXTRACTION_PROMPT = (content, url) => `
You are the NapaServe Event Intake assistant. Extract event details from the following page content and return ONLY a valid JSON array of event objects. No preamble, no markdown fences, no backticks — raw JSON only.

CRITICAL RULES:
- Never invent, guess, or infer any detail not explicitly stated in the source
- If a field is unknown, use null — do not fill it in
- is_free: true ONLY if explicitly stated as free
- is_recurring: true ONLY if explicitly stated as recurring
- town: one of napa | yountville | st-helena | calistoga | american-canyon | null
- category: one of art | music | food | community | wellness | nightlife | movies | theatre | null
- event_date: YYYY-MM-DD format required
- start_time: "1:00 PM" format
- end_time: "2:30 PM" format
- description: rewrite in neutral, factual, third-person AP style — no promotional language, no "Join us", no "we", no "our", no "you", no "curated", no "don't miss", no first-person voice. Describe what the event is, who is hosting it, and what attendees can expect. Write as a journalist reporting on the event, not as the organizer promoting it.
- status: always "approved"
- source: always "napaserve_submission"
- website_url: use "${url}" if it is the event page URL

Return a JSON array even for a single event. Schema:
[{
  "title": string,
  "description": string,
  "event_date": "YYYY-MM-DD",
  "end_date": null,
  "start_time": "H:MM AM/PM" or null,
  "end_time": "H:MM AM/PM" or null,
  "venue_name": string or null,
  "address": string or null,
  "town": string or null,
  "category": string or null,
  "price_info": string or null,
  "is_free": boolean or null,
  "website_url": string or null,
  "ticket_url": string or null,
  "is_recurring": boolean,
  "recurrence_desc": string or null,
  "status": "approved",
  "source": "napaserve_submission"
}]

PAGE CONTENT:
${content.slice(0, 8000)}
`;

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

export default async function handler(req, res) {
  const origin = req.headers.origin || "";

  // CORS
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, content, url, events } = req.body || {};

  // ── ACTION: extract ───────────────────────────────────────────────────────
  if (action === "extract") {
    let pageContent = content;

    // If a URL is provided and no content was passed, fetch it server-side (no CORS issues)
    if (!pageContent && url) {
      try {
        const pageRes = await fetch(url, {
          headers: { "User-Agent": "NapaServe-EventIntake/1.0" },
          signal: AbortSignal.timeout(10000),
        });
        if (pageRes.ok) {
          const html = await pageRes.text();
          // Strip HTML tags to get plain text
          pageContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        }
      } catch (_) {
        // fetch failed — fall through to needsPaste check
      }
    }

    // If content is still missing or too short, tell the frontend to show paste fallback
    if (!pageContent || pageContent.length < 300) {
      return res.status(200).json({ needsPaste: true });
    }

    try {
      const claudeRes = await callAnthropicWithRetry({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: EXTRACTION_PROMPT(pageContent, url || "") }],
      }, process.env.ANTHROPIC_API_KEY);

      const claudeData = await claudeRes.json();
      const text = (claudeData.content || []).map(b => b.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();

      let extracted;
      try {
        extracted = JSON.parse(clean);
      } catch {
        return res.status(502).json({ error: "Claude returned invalid JSON", raw: text.slice(0, 500) });
      }

      return res.status(200).json({ events: extracted });

    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── ACTION: insert ────────────────────────────────────────────────────────
  if (action === "insert") {
    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: "Missing or empty events array" });
    }

    const supabaseUrl = process.env.SUPABASE_URL || "https://csenpchwxxepdvjebsrt.supabase.co";
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseKey) {
      return res.status(500).json({ error: "SUPABASE_KEY not configured in Vercel env vars" });
    }

    try {
      const insertRes = await fetch(`${supabaseUrl}/rest/v1/community_events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "return=representation",
        },
        body: JSON.stringify(
          events.map(e => ({ ...e, status: "approved", source: "napaserve_submission" }))
        ),
      });

      if (!insertRes.ok) {
        const err = await insertRes.text();
        return res.status(502).json({ error: `Supabase error ${insertRes.status}: ${err}` });
      }

      const inserted = await insertRes.json();
      return res.status(200).json({ inserted: inserted.length, rows: inserted });

    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: `Unknown action: ${action}` });
}

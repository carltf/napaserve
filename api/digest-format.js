// Known Napa Valley venue addresses (street only, no city/state)
const KNOWN_VENUES = {
  'brannan center': '1407 Lincoln Ave.',
  'the brannan center': '1407 Lincoln Ave.',
  'lincoln theater': '1312 Lincoln Ave.',
  'lincoln theatre': '1312 Lincoln Ave.',
  'napa valley opera house': '1030 Main St.',
  'uptown theatre': '1350 Third St.',
  'uptown theater': '1350 Third St.',
  'blue note napa': '1030 Main St.',
  'oxbow public market': '610 1st St.',
  'cia at copia': '500 1st St.',
  'napa valley expo': '575 Third St.',
  'napa valley college': '2277 Napa-Vallejo Hwy.',
  'veterans memorial park': '801 Main St.',
  'napa county fairgrounds': '575 Third St.',
  'yountville community center': '6516 Washington St.',
  'calistoga community center': '1307 Washington St.',
  'american canyon community center': '100 Benton Way',
  'st. helena public library': '1492 Library Ln.',
  'napa main library': '580 Coombs St.',
  'st. helena historical society heritage center': '1255 Oak Ave.',
  'heritage center': '1255 Oak Ave.',
  'steve rogers gallery': '1338 Lincoln Ave.',
};

// Venues where receptions are always free
const FREE_RECEPTION_VENUES = new Set([
  'steve rogers gallery',
]);

// Words that indicate a venue name, not a street address
const VENUE_NAME_WORDS = /\b(center|hall|gallery|theater|theatre|church|studio|museum|library|park|school|inn|hotel|resort|winery|cellar|tasting room)\b/i;

async function callAnthropicWithRetry(payload, apiKey, maxRetries = 3, anthropicVersion = '2023-06-01') {
  let lastStatus = 0;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': anthropicVersion,
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
  // CORS headers on every response
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const ev = req.body;
    if (!ev || !ev.title) {
      return res.status(400).json({ error: 'Missing event data' });
    }

    // ── ENRICHMENT PHASE — resolve unknowns before formatting ──

    const enriched = { ...ev };
    const hasSupa = SUPABASE_URL && SUPABASE_KEY;

    // ADDRESS VALIDATION — if address looks like a venue name (no street number), clear it
    if (enriched.address && !(/^\d/.test(enriched.address.trim())) && VENUE_NAME_WORDS.test(enriched.address)) {
      enriched.address = null;
    }

    // PRICE HEURISTIC — receptions at galleries are almost always free
    const titleAndDesc = ((enriched.title || '') + ' ' + (enriched.description || '')).toLowerCase();
    const isReception = /\b(reception|opening reception|closing reception)\b/.test(titleAndDesc);
    if (isReception && !enriched.price_info && enriched.is_free !== true && enriched.is_free !== false) {
      const venueKey = (enriched.venue_name || '').toLowerCase().trim();
      if (FREE_RECEPTION_VENUES.has(venueKey) || /\bgallery\b/i.test(enriched.venue_name || '')) {
        enriched.is_free = true;
      }
    }

    // 1. ADDRESS — known venues first
    if (!enriched.address) {
      const known = lookupKnownVenue(enriched.venue_name);
      if (known) enriched.address = known;
    }

    // 2. DB LOOKUPS — address, contact from community_events
    if (hasSupa && enriched.venue_name && (!enriched.address || !enriched.organizer_contact)) {
      try {
        const dbUrl = `${SUPABASE_URL}/rest/v1/community_events`
          + `?venue_name=ilike.${encodeURIComponent(enriched.venue_name)}`
          + `&select=address,organizer_contact,website_url`
          + `&address=not.is.null`
          + `&limit=1`;

        const dbRes = await fetch(dbUrl, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (dbRes.ok) {
          const rows = await dbRes.json();
          if (rows.length > 0) {
            if (!enriched.address && rows[0].address) enriched.address = rows[0].address;
            if (!enriched.organizer_contact && rows[0].organizer_contact) enriched.organizer_contact = rows[0].organizer_contact;
            if (!enriched.website_url && rows[0].website_url) enriched.website_url = rows[0].website_url;
          }
        }
      } catch (dbErr) {
        console.error('DB enrichment lookup (non-fatal):', dbErr);
      }
    }

    // 3. WEB SEARCH — for anything still missing
    const stillNeedsAddress = !enriched.address;
    const stillNeedsPrice = !enriched.price_info && enriched.is_free !== true && enriched.is_free !== false;
    const stillNeedsWebsite = !enriched.website_url;
    const stillNeedsContact = !enriched.organizer_contact;

    if (stillNeedsAddress || stillNeedsPrice || stillNeedsWebsite || stillNeedsContact) {
      try {
        const searchParts = [];
        if (stillNeedsAddress) searchParts.push('street address');
        if (stillNeedsPrice) searchParts.push('ticket price or if free');
        if (stillNeedsWebsite) searchParts.push('official website URL');
        if (stillNeedsContact) searchParts.push('phone number and email');

        const city = enriched.town
          ? enriched.town.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
          : 'Napa';
        const searchTarget = [enriched.venue_name, enriched.title, city, 'California']
          .filter(Boolean).join(' ');

        const enrichRes = await callAnthropicWithRetry({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 400,
            tools: [{
              type: 'web_search_20250305',
              name: 'web_search',
              max_uses: 3,
            }],
            messages: [{
              role: 'user',
              content: `Search for the following details about this event/venue: ${searchTarget}

I need: ${searchParts.join(', ')}.
${enriched.website_url ? `The event website is ${enriched.website_url} — check it for price info if needed.` : ''}

Return ONLY a JSON object with these fields (use null for anything not found):
{
  "address": "street address only, no city/state/zip, or null",
  "price": "ticket price or 'Free' or null",
  "website": "official website URL or null",
  "phone": "phone number or null",
  "email": "email address or null"
}

Do not include any other text.`,
            }],
          }, ANTHROPIC_API_KEY, 3, '2025-03-26');

        const enrichData = await enrichRes.json();

        let enrichText = '';
        if (enrichData.content) {
          for (const block of enrichData.content) {
            if (block.type === 'text') enrichText += block.text;
          }
        }

        const jsonMatch = enrichText.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          const found = JSON.parse(jsonMatch[0]);
          if (stillNeedsAddress && found.address && found.address !== 'null') {
            enriched.address = found.address;
          }
          if (stillNeedsPrice && found.price && found.price !== 'null') {
            if (found.price.toLowerCase() === 'free') {
              enriched.is_free = true;
            } else {
              enriched.price_info = found.price;
            }
          }
          if (stillNeedsWebsite && found.website && found.website !== 'null') {
            enriched.website_url = found.website;
          }
          if (stillNeedsContact) {
            const parts = [];
            if (found.phone && found.phone !== 'null') parts.push(found.phone);
            if (found.email && found.email !== 'null') parts.push(found.email);
            if (parts.length > 0) enriched.organizer_contact = parts.join(', ');
          }
        }
      } catch (searchErr) {
        console.error('Web search enrichment (non-fatal):', searchErr);
      }
    }

    // ── FORMAT PHASE — send enriched data to Claude ──

    const WEEKENDER_SYSTEM = `You are formatting event copy for the Weekender section of Napa Valley Features. Follow these rules exactly:

Use AP style. Keep tone factual, neutral and concise. Avoid promotional language. Never use: curated, tapestry, special, unique, or similar hype words. Never invent facts. If something cannot be confirmed from the source material, omit it.

For a single event output exactly:
1. Header line (title only, title case, no date/time/location in header)
2. One paragraph only in this order: date and time first, description of what the event is, price status, contact line, street address last.

Date/time format: Saturday, Aug. 23, 6:30 to 8:30 p.m.
Price rules:
- If confirmed free, write "Free."
- If a specific price is listed, write it.
- If price is genuinely unknown after all research, write "Price not provided."
Contact rules:
- If website is available, write "For more information visit their website." — never print a raw URL inline.
- If phone or email is available, append it: "For more information visit their website or call (707) 555-1234."
- If no website AND no phone/email, omit the contact line entirely.
Address: street address only, no city/state/zip. If genuinely unknown write "Venue address not provided."

For a multi-event or festival listing output:
1. Header line
2. Short 1-2 sentence intro
3. Bulleted list, one bullet per sub-event: • Name — Day, Month Date, Time — Description. Price.
4. One shared contact line after bullets
5. Street address on final line

Output only the finished listing. No notes, no labels, no explanation.`;

    const fields = [
      `Title: ${enriched.title || ''}`,
      `Date: ${enriched.event_date || ''}`,
      `Start time: ${enriched.start_time || ''}`,
      `End time: ${enriched.end_time || ''}`,
      `Venue: ${enriched.venue_name || ''}`,
      `Address: ${enriched.address || ''}`,
      `Description: ${enriched.description || ''}`,
      `Website: ${enriched.website_url || ''}`,
      `Ticket URL: ${enriched.ticket_url || ''}`,
      `Price info: ${enriched.price_info || ''}`,
      `Is free: ${enriched.is_free === true ? 'yes' : enriched.is_free === false ? 'no' : 'unknown'}`,
      `Is recurring: ${enriched.is_recurring ? 'yes' : 'no'}`,
      `Phone/Email: ${enriched.organizer_contact || ''}`,
    ].join('\n');

    const claudeRes = await callAnthropicWithRetry({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: WEEKENDER_SYSTEM,
      messages: [{ role: 'user', content: fields }],
    }, ANTHROPIC_API_KEY);

    const data = await claudeRes.json();
    if (data.error) {
      console.error('Claude API error:', data.error);
      return res.status(502).json({ error: 'Formatting failed' });
    }

    const formatted = data.content?.[0]?.text || '';

    return res.status(200).json({
      formatted,
      enriched_website_url: enriched.website_url || null,
    });
  } catch (err) {
    console.error('digest-format error:', err);
    return res.status(502).json({ error: 'Failed to format event' });
  }
}

function lookupKnownVenue(venueName) {
  if (!venueName) return null;
  const key = venueName.toLowerCase().trim();
  return KNOWN_VENUES[key] || null;
}

export const config = {
  maxDuration: 60,
};

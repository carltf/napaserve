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

    const WEEKENDER_SYSTEM = `You are formatting event copy for the Weekender section of Napa Valley Features. Follow these rules exactly:

Use AP style. Keep tone factual, neutral and concise. Avoid promotional language. Never use: curated, tapestry, special, unique, or similar hype words. Never invent facts. If something cannot be confirmed from the source material, omit it.

For a single event output exactly:
1. Header line (title only, title case, no date/time/location in header)
2. One paragraph only in this order: date and time first, description of what the event is, price status, contact line, street address last.

Date/time format: Saturday, Aug. 23, 6:30 to 8:30 p.m.
Price rules:
- If confirmed free, write "Free."
- If a specific price is listed, write it.
- If price info is empty/unknown AND is_free is not explicitly true, do NOT write "Price not provided." Instead write nothing about price and append this note on its own line: "Price not confirmed — check website."
Contact: Always write "For more information visit their website." — never print a raw URL inline. The URL will be linked separately by the email template.
Address: street address only, no city/state/zip. If unknown write "Venue address not provided."

For a multi-event or festival listing output:
1. Header line
2. Short 1-2 sentence intro
3. Bulleted list, one bullet per sub-event: • Name — Day, Month Date, Time — Description. Price.
4. One shared contact line after bullets
5. Street address on final line

Output only the finished listing. No notes, no labels, no explanation.`;

    const fields = [
      `Title: ${ev.title || ''}`,
      `Date: ${ev.event_date || ''}`,
      `Start time: ${ev.start_time || ''}`,
      `End time: ${ev.end_time || ''}`,
      `Venue: ${ev.venue_name || ''}`,
      `Address: ${ev.address || ''}`,
      `Description: ${ev.description || ''}`,
      `Website: ${ev.website_url || ''}`,
      `Ticket URL: ${ev.ticket_url || ''}`,
      `Price info: ${ev.price_info || ''}`,
      `Is free: ${ev.is_free === true ? 'yes' : ev.is_free === false ? 'no' : 'unknown'}`,
      `Is recurring: ${ev.is_recurring ? 'yes' : 'no'}`,
    ].join('\n');

    // Step 1: Format the event
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: WEEKENDER_SYSTEM,
        messages: [{ role: 'user', content: fields }],
      }),
    });

    const data = await claudeRes.json();
    if (data.error) {
      console.error('Claude API error:', data.error);
      return res.status(502).json({ error: 'Formatting failed' });
    }

    let formatted = data.content?.[0]?.text || '';

    // Step 2: If address is missing, try to enrich
    const needsEnrichment = formatted.includes('Venue address not provided');

    if (needsEnrichment && (ev.venue_name || ev.title)) {
      let foundAddress = null;
      let foundPhone = null;
      let foundEmail = null;

      // 2a: Check known Napa Valley venues (hardcoded)
      const KNOWN_VENUES = {
        'brannan center': '1407 Lincoln Ave.',
        'the brannan center': '1407 Lincoln Ave.',
        'lincoln theater': '1312 Lincoln Ave.',
        'lincoln theatre': '1312 Lincoln Ave.',
        'napa valley opera house': '1030 Main St.',
        'uptown theatre': '1350 Third St.',
        'blue note napa': '1030 Main St.',
        'oxbow public market': '610 1st St.',
        'cia at copia': '500 1st St.',
        'napa valley expo': '575 Third St.',
      };

      const venueKey = (ev.venue_name || '').toLowerCase().trim();
      if (KNOWN_VENUES[venueKey]) {
        foundAddress = KNOWN_VENUES[venueKey];
      }

      // 2b: If not in known venues, check community_events DB for same venue_name with address
      if (!foundAddress && ev.venue_name && SUPABASE_URL && SUPABASE_KEY) {
        try {
          const lookupUrl = `${SUPABASE_URL}/rest/v1/community_events`
            + `?venue_name=eq.${encodeURIComponent(ev.venue_name)}`
            + `&address=not.is.null`
            + `&select=address`
            + `&limit=1`;

          const lookupRes = await fetch(lookupUrl, {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
            },
          });

          if (lookupRes.ok) {
            const rows = await lookupRes.json();
            if (rows.length > 0 && rows[0].address) {
              foundAddress = rows[0].address;
            }
          }
        } catch (dbErr) {
          console.error('Venue DB lookup error (non-fatal):', dbErr);
        }
      }

      // 2c: If still no address, use web search
      if (!foundAddress) {
        const searchQuery = [ev.venue_name, ev.title, 'Napa County California address']
          .filter(Boolean).join(' ');

        try {
          const enrichRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': ANTHROPIC_API_KEY,
              'anthropic-version': '2025-03-26',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 300,
              tools: [{
                type: 'web_search_20250305',
                name: 'web_search',
                max_uses: 2,
              }],
              messages: [{
                role: 'user',
                content: `Search for the street address, phone number, and email for: ${searchQuery}

Return ONLY a JSON object with these fields (use null if not found):
{"address": "street address only, no city/state/zip", "phone": "phone number", "email": "email address"}

Do not include any other text.`,
              }],
            }),
          });

          const enrichData = await enrichRes.json();

          let enrichText = '';
          if (enrichData.content) {
            for (const block of enrichData.content) {
              if (block.type === 'text') {
                enrichText += block.text;
              }
            }
          }

          const jsonMatch = enrichText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const found = JSON.parse(jsonMatch[0]);
            if (found.address && found.address !== 'null') foundAddress = found.address;
            if (found.phone && found.phone !== 'null') foundPhone = found.phone;
            if (found.email && found.email !== 'null') foundEmail = found.email;
          }
        } catch (enrichErr) {
          console.error('Enrichment search error (non-fatal):', enrichErr);
        }
      }

      // Apply enrichment to formatted text
      if (foundAddress) {
        formatted = formatted.replace('Venue address not provided.', foundAddress);
      }

      const extras = [];
      if (foundPhone) extras.push(foundPhone);
      if (foundEmail) extras.push(foundEmail);
      if (extras.length > 0) {
        const contactLine = 'For more information visit their website.';
        const enrichedContact = `For more information visit their website or call ${extras.join(' or email ')}.`;
        if (formatted.includes(contactLine)) {
          formatted = formatted.replace(contactLine, enrichedContact);
        }
      }
    }

    return res.status(200).json({ formatted });
  } catch (err) {
    console.error('digest-format error:', err);
    return res.status(502).json({ error: 'Failed to format event' });
  }
}

export const config = {
  maxDuration: 45,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
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
Price: if confirmed free write 'Free.' If price listed write it. If unknown write 'Price not provided.'
Contact: 'For more information visit their website (URL).' or include phone/email if available.
Address: street address only, no city/state/zip. If unknown write 'Venue address not provided.'

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
      `Is free: ${ev.is_free ? 'yes' : 'no'}`,
      `Is recurring: ${ev.is_recurring ? 'yes' : 'no'}`,
    ].join('\n');

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

    const formatted = data.content?.[0]?.text || '';
    return res.status(200).json({ formatted });
  } catch (err) {
    console.error('digest-format error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}

export const config = {
  maxDuration: 30,
};

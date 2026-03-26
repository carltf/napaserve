export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase credentials not configured' });
  }
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    // Date range: today through 14 days out
    const today = new Date().toISOString().slice(0, 10);
    const endDate = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

    // Fetch approved events in the next 14 days
    const eventsUrl = `${SUPABASE_URL}/rest/v1/community_events`
      + `?select=id,title,description,event_date,start_time,end_time,venue_name,town,category,price_info,is_free,website_url`
      + `&status=eq.approved`
      + `&event_date=gte.${today}`
      + `&event_date=lte.${endDate}`
      + `&order=event_date.asc,start_time.asc`
      + `&limit=100`;

    const eventsRes = await fetch(eventsUrl, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!eventsRes.ok) {
      const err = await eventsRes.text();
      console.error('Supabase events fetch error:', err);
      return res.status(502).json({ error: 'Failed to fetch events' });
    }

    const events = await eventsRes.json();

    if (events.length === 0) {
      return res.status(200).json({ draft_id: null, ai_intro: null, events: [], message: 'No approved events in the next 14 days' });
    }

    // Group by category for the AI prompt
    const grouped = {};
    for (const ev of events) {
      const cat = ev.category || 'community';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(ev);
    }

    const eventSummary = Object.entries(grouped).map(([cat, evs]) => {
      const lines = evs.map(e => `  - ${e.title} (${e.event_date}, ${e.town})`).join('\n');
      return `${cat.charAt(0).toUpperCase() + cat.slice(1)}:\n${lines}`;
    }).join('\n\n');

    // Call Claude for AI intro
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `You are writing the opening paragraph for a weekly community events email digest for NapaServe, a community intelligence platform for Napa County, California. Write in the Napa Valley Features editorial voice — warm, local, conversational, and specific to the actual events listed below. Reference specific events, venues, or themes from the list. 2-3 sentences only. No subject line, no sign-off — just the intro paragraph.

Events for ${today} through ${endDate}:

${eventSummary}`,
        }],
      }),
    });

    const claudeData = await claudeRes.json();
    if (claudeData.error) {
      console.error('Claude API error:', claudeData.error);
      return res.status(502).json({ error: 'AI intro generation failed' });
    }

    const aiIntro = claudeData.content?.[0]?.text || '';
    const eventIds = events.map(e => e.id);

    // Save draft to email_digests table
    const draftRow = {
      status: 'draft',
      ai_intro: aiIntro,
      event_ids: eventIds,
      date_range_start: today,
      date_range_end: endDate,
    };

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/email_digests`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(draftRow),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      console.error('Supabase insert error:', err);
      return res.status(502).json({ error: 'Failed to save draft' });
    }

    const inserted = await insertRes.json();
    const draftId = inserted[0]?.id;

    return res.status(200).json({
      draft_id: draftId,
      ai_intro: aiIntro,
      events,
    });
  } catch (err) {
    console.error('digest-draft error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}

export const config = {
  maxDuration: 30,
};

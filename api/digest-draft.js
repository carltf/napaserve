const TOWN_ORDER = ['valley-wide', 'american-canyon', 'calistoga', 'napa', 'st-helena', 'yountville'];

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

    // Fetch approved events in the next 14 days, ordered by town then date
    const eventsUrl = `${SUPABASE_URL}/rest/v1/community_events`
      + `?select=id,title,description,event_date,start_time,end_time,venue_name,address,town,category,price_info,is_free,is_recurring,website_url,ticket_url`
      + `&status=eq.approved`
      + `&event_date=gte.${today}`
      + `&event_date=lte.${endDate}`
      + `&order=town.asc,event_date.asc,start_time.asc`
      + `&limit=60`;

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

    let allEvents = await eventsRes.json();

    // Fetch astronomical events in the next 14 days (including multi-day spans)
    const skyUrl = `${SUPABASE_URL}/rest/v1/astronomical_events`
      + `?select=id,title,description,event_date,end_date,peak_time,viewing_notes,is_notable`
      + `&or=(and(event_date.gte.${today},event_date.lte.${endDate}),and(end_date.not.is.null,event_date.lte.${endDate},end_date.gte.${today}))`
      + `&order=event_date.asc`;

    const skyRes = await fetch(skyUrl, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    let skyEvents = [];
    if (skyRes.ok) {
      skyEvents = await skyRes.json();
    } else {
      console.error('Sky events fetch error:', await skyRes.text());
    }

    if (allEvents.length === 0 && skyEvents.length === 0) {
      return res.status(200).json({ draft_id: null, ai_intro: null, events: [], skyEvents: [], message: 'No approved events in the next 14 days' });
    }

    // Deduplicate on title + event_date (keep first occurrence)
    const seen = new Set();
    allEvents = allEvents.filter(ev => {
      const key = `${(ev.title || '').toLowerCase().trim()}|${ev.event_date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Limit to 20 events total
    const events = allEvents.slice(0, 20);

    // Group by town for the AI prompt, using defined order
    const byTown = {};
    for (const ev of events) {
      const t = ev.town || 'napa';
      if (!byTown[t]) byTown[t] = [];
      byTown[t].push(ev);
    }

    const townKeys = Object.keys(byTown).sort((a, b) => {
      const ai = TOWN_ORDER.indexOf(a);
      const bi = TOWN_ORDER.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    const eventSummary = townKeys.map(town => {
      const label = townDisplay(town);
      const lines = byTown[town].map(e => {
        const tag = e.is_recurring ? '(R)' : '(N)';
        return `  ${tag} ${e.title} — ${e.event_date}${e.venue_name ? ', ' + e.venue_name : ''}`;
      }).join('\n');
      return `${label}:\n${lines}`;
    }).join('\n\n');

    // Call Claude for AI intro in Weekender voice
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
          content: `You are writing the opening paragraph for the Napa Valley Features Weekender, a weekly events email for Napa County, California.

Format rules:
- Start with "NAPA VALLEY, Calif. \u2014" as an AP-style dateline
- 2-3 sentences after the dateline, warm and local, in the style of: "Welcome to the Napa Valley Features Weekender, your guide to local events and experiences. Each Friday we deliver a Scan and Plan format organized by town..."
- Reference specific events, venues, or towns from the list below
- NEVER use these words: curate, civic, discover, explore
- Keep it conversational, like a trusted local neighbor sharing what's happening this week

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

    const skyEventIds = skyEvents.map(e => e.id);

    // Save draft to email_digests table
    const draftRow = {
      status: 'draft',
      ai_intro: aiIntro,
      event_ids: eventIds,
      sky_event_ids: skyEventIds,
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
      skyEvents,
    });
  } catch (err) {
    console.error('digest-draft error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}

function townDisplay(town) {
  if (!town) return 'Napa';
  const names = { 'valley-wide': 'Valley-Wide', 'american-canyon': 'American Canyon', 'st-helena': 'St. Helena' };
  if (names[town]) return names[town];
  return town.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export const config = {
  maxDuration: 30,
};

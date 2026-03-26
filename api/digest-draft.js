const TOWN_ORDER = ['valley-wide', 'american-canyon', 'calistoga', 'napa', 'st-helena', 'yountville'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase credentials not configured' });
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
      return res.status(200).json({ events: [], skyEvents: [], date_range_start: today, date_range_end: endDate, message: 'No approved events in the next 14 days' });
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

    // Save draft to email_digests table
    const eventIds = events.map(e => e.id);
    const skyEventIds = skyEvents.map(e => e.id);

    const draftRow = {
      status: 'draft',
      ai_intro: '',
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
      events,
      skyEvents,
      date_range_start: today,
      date_range_end: endDate,
    });
  } catch (err) {
    console.error('digest-draft error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}

export const maxDuration = 10;

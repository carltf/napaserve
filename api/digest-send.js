const TOWN_ORDER = ['valley-wide', 'american-canyon', 'calistoga', 'napa', 'st-helena', 'yountville'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase credentials not configured' });
  }
  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  try {
    const { draft_id, ai_intro: overrideIntro, event_ids: overrideEventIds, sky_event_ids: overrideSkyEventIds, formatted_events: overrideFormatted } = req.body || {};

    if (!draft_id) {
      return res.status(400).json({ error: 'Missing draft_id' });
    }

    // Fetch the draft
    const draftRes = await fetch(
      `${SUPABASE_URL}/rest/v1/email_digests?id=eq.${draft_id}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const drafts = await draftRes.json();
    if (!drafts.length) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    const draft = drafts[0];
    const aiIntro = overrideIntro || draft.ai_intro;
    const eventIds = overrideEventIds || draft.event_ids;
    const skyEventIds = overrideSkyEventIds || draft.sky_event_ids || [];

    if ((!eventIds || eventIds.length === 0) && skyEventIds.length === 0) {
      return res.status(400).json({ error: 'No events selected' });
    }

    // Fetch the selected events
    const eventsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/community_events`
        + `?id=in.(${eventIds.join(',')})`
        + `&select=id,title,description,event_date,start_time,end_time,venue_name,address,town,category,price_info,is_free,is_recurring,website_url,ticket_url`
        + `&order=town.asc,event_date.asc,start_time.asc`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const events = await eventsRes.json();
    if (!events.length && skyEventIds.length === 0) {
      return res.status(400).json({ error: 'No events found for the provided IDs' });
    }

    // Attach formatted text if provided
    if (overrideFormatted && typeof overrideFormatted === 'object') {
      for (const ev of events) {
        if (overrideFormatted[ev.id]) {
          ev.formatted = overrideFormatted[ev.id];
        }
      }
    }

    // Fetch sky events if any
    let skyEvents = [];
    if (skyEventIds.length > 0) {
      const skyRes = await fetch(
        `${SUPABASE_URL}/rest/v1/astronomical_events`
          + `?id=in.(${skyEventIds.join(',')})`
          + `&select=id,title,description,event_date,end_date,peak_time,viewing_notes,is_notable`
          + `&order=event_date.asc`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
        }
      );
      if (skyRes.ok) {
        skyEvents = await skyRes.json();
      }
    }

    // Fetch subscribers
    const subsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/napaserve_subscribers?select=email,name&unsubscribed=is.null`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const subscribers = await subsRes.json();
    if (!subscribers.length) {
      return res.status(400).json({ error: 'No active subscribers' });
    }

    // Group events by town in defined order
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

    // Build email HTML
    const emailHtml = buildDigestEmail(aiIntro, byTown, townKeys, draft.date_range_start, draft.date_range_end, skyEvents);

    // Format date range for subject line
    const startFmt = formatDateShort(draft.date_range_start);
    const endFmt = formatDateShort(draft.date_range_end);

    // Send via Resend
    const resendRes = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        subscribers.map(sub => ({
          from: 'Napa Valley Features <digest@napaserve.org>',
          to: sub.email,
          subject: `The Napa Valley Weekender \u2014 ${startFmt} to ${endFmt}`,
          html: emailHtml.replace(/\{\{NAME\}\}/g, sub.name || 'Neighbor').replace(/\{\{EMAIL\}\}/g, encodeURIComponent(sub.email)),
        }))
      ),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error('Resend error:', resendData);
      return res.status(502).json({ error: 'Failed to send emails', details: resendData });
    }

    // Update digest record
    const messageId = resendData.data?.[0]?.id || resendData[0]?.id || null;
    await fetch(`${SUPABASE_URL}/rest/v1/email_digests?id=eq.${draft_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'sent',
        sent_at: new Date().toISOString(),
        resend_message_id: messageId,
        ai_intro: aiIntro,
        event_ids: eventIds,
        sky_event_ids: skyEventIds,
      }),
    });

    return res.status(200).json({
      success: true,
      recipients: subscribers.length,
      events_sent: events.length,
      resend_message_id: messageId,
    });
  } catch (err) {
    console.error('digest-send error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatEventDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function townDisplay(town) {
  if (!town) return 'Napa';
  const names = { 'valley-wide': 'Valley-Wide', 'american-canyon': 'American Canyon', 'st-helena': 'St. Helena' };
  if (names[town]) return names[town];
  return town.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function buildDigestEmail(aiIntro, byTown, townKeys, dateStart, dateEnd, skyEvents) {
  const startFmt = formatDateShort(dateStart);
  const endFmt = formatDateShort(dateEnd);

  let eventsHtml = '';
  for (const town of townKeys) {
    const townLabel = townDisplay(town);
    const events = byTown[town];

    // Town section header
    eventsHtml += `
    <tr><td style="padding:28px 0 10px 0;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;color:#2C1810;border-bottom:2px solid #C4A050;padding-bottom:8px;">${esc(townLabel)}</div>
    </td></tr>`;

    for (const ev of events) {
      if (ev.formatted) {
        // Use Weekender-formatted text from Claude
        let formattedHtml = esc(ev.formatted).replace(/\n/g, '<br>').replace(/•/g, '&bull;');
        // Convert "visit their website" to a hyperlink if website_url exists
        if (ev.website_url) {
          formattedHtml = formattedHtml.replace(
            /visit their website/gi,
            `<a href="${esc(ev.website_url)}" target="_blank" style="color:#8B5E3C;text-decoration:none;">visit their website</a>`
          );
        }
        eventsHtml += `
    <tr><td style="padding:14px 0 14px 0;border-bottom:1px solid rgba(44,24,16,0.08);">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#2C1810;line-height:1.65;">${formattedHtml}</div>
    </td></tr>`;
      } else {
        // Fallback to raw field formatting
        const tag = ev.is_recurring ? '(R)' : '(N)';
        const tagColor = ev.is_recurring ? '#8B7355' : '#C4A050';
        const dateLine = [formatEventDate(ev.event_date), ev.start_time, ev.end_time ? `\u2013 ${ev.end_time}` : ''].filter(Boolean).join(' \u00b7 ');
        const venueLine = ev.venue_name || '';
        const desc = ev.description || '';
        const priceLine = ev.price_info ? ev.price_info : (ev.is_free ? 'Free' : '');

        eventsHtml += `
    <tr><td style="padding:14px 0 14px 0;border-bottom:1px solid rgba(44,24,16,0.08);">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;margin-bottom:4px;">
        <span style="font-weight:700;color:${tagColor};font-size:12px;letter-spacing:0.04em;">${tag}</span>
        <span style="font-weight:700;color:#2C1810;margin-left:4px;">${esc(ev.title)}</span>
      </div>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B7355;margin-bottom:4px;">${esc(dateLine)}${venueLine ? ' \u00b7 ' + esc(venueLine) : ''}</div>
      ${desc ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#2C1810;line-height:1.55;margin-bottom:6px;">${esc(desc)}</div>` : ''}
      ${priceLine ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B7355;margin-bottom:6px;">${esc(priceLine)}</div>` : ''}
      ${ev.website_url ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;margin-bottom:4px;">For more information <a href="${esc(ev.website_url)}" target="_blank" style="color:#8B5E3C;text-decoration:none;">visit their website</a>.</div>` : ''}
      ${ev.address ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8B7355;">${esc(ev.address)}</div>` : ''}
    </td></tr>`;
      }
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>The Napa Valley Weekender</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F0E8;font-family:Arial,Helvetica,sans-serif;color:#2C1810;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5F0E8;">
<tr><td align="center">

<!-- Header -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5F0E8;border-bottom:3px solid #C4A050;">
<tr><td align="center" style="padding:24px 24px 20px;">
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.25em;color:#C4A050;font-weight:700;text-transform:uppercase;margin-bottom:8px;">NAPA VALLEY FEATURES</div>
  <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:700;color:#2C1810;line-height:1.2;">The Napa Valley Weekender</div>
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8B7355;margin-top:6px;">${esc(startFmt)} \u2013 ${esc(endFmt)}</div>
</td></tr>
</table>

<!-- Content -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#F5F0E8;">
<tr><td style="padding:32px 32px 40px;">

  <!-- AI intro with dateline -->
  <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#2C1810;line-height:1.65;margin:0 0 32px 0;">${esc(aiIntro)}</p>

  <!-- Events by town -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    ${eventsHtml}
  </table>

  ${skyEvents && skyEvents.length > 0 ? buildSkySection(skyEvents) : ''}

  <!-- CTA -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
  <tr><td align="center" style="padding:20px 0;">
    <a href="https://napaserve.org/events" target="_blank" style="display:inline-block;background-color:#2C1810;color:#F5F0E8;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;padding:12px 28px;">Browse All Events on NapaServe</a>
  </td></tr>
  </table>

</td></tr>
</table>

<!-- Footer -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5F0E8;border-top:1px solid rgba(44,24,16,0.12);">
<tr><td align="center" style="padding:24px 32px;">
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8B7355;line-height:1.7;">
    <em>Note: Always confirm details at source.</em><br><br>
    Napa Valley Features \u00b7 A Valley Works Collaborative publication<br>
    Community intelligence for Napa County<br><br>
    <a href="https://napaserve.org/api/unsubscribe?email={{EMAIL}}" style="color:#8B5E3C;text-decoration:underline;">Unsubscribe</a>
  </div>
</td></tr>
</table>

</td></tr>
</table>
</body>
</html>`;
}

function buildSkySection(skyEvents) {
  let html = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
    <tr><td style="padding:28px 0 10px 0;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;color:#C4A050;border-bottom:2px solid #C4A050;padding-bottom:8px;">Night Sky</div>
    </td></tr>`;

  for (const ev of skyEvents) {
    const dateLine = [
      formatEventDate(ev.event_date),
      ev.end_date && ev.end_date !== ev.event_date ? `\u2013 ${formatEventDate(ev.end_date)}` : '',
      ev.peak_time ? `Peak: ${ev.peak_time}` : '',
    ].filter(Boolean).join(' \u00b7 ');

    html += `
    <tr><td style="padding:14px 0 14px 0;border-bottom:1px solid rgba(44,24,16,0.08);">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#2C1810;margin-bottom:4px;">${esc(ev.title)}</div>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B7355;margin-bottom:4px;">${esc(dateLine)}</div>
      ${ev.description ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#2C1810;line-height:1.55;margin-bottom:6px;">${esc(ev.description)}</div>` : ''}
      ${ev.viewing_notes ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B7355;font-style:italic;">${esc(ev.viewing_notes)}</div>` : ''}
    </td></tr>`;
  }

  html += `</table>`;
  return html;
}

function esc(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const config = {
  maxDuration: 60,
};

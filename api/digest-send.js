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
    const { draft_id, ai_intro: overrideIntro, event_ids: overrideEventIds } = req.body || {};

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

    if (!eventIds || eventIds.length === 0) {
      return res.status(400).json({ error: 'No events selected' });
    }

    // Fetch the selected events
    const eventsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/community_events`
        + `?id=in.(${eventIds.join(',')})`
        + `&select=id,title,description,event_date,start_time,end_time,venue_name,town,category,website_url`
        + `&order=event_date.asc,start_time.asc`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const events = await eventsRes.json();
    if (!events.length) {
      return res.status(400).json({ error: 'No events found for the provided IDs' });
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

    // Group events by category
    const grouped = {};
    for (const ev of events) {
      const cat = ev.category || 'community';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(ev);
    }

    // Build email HTML
    const emailHtml = buildDigestEmail(aiIntro, grouped, draft.date_range_start, draft.date_range_end);

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
          from: 'NapaServe <digest@napaserve.org>',
          to: sub.email,
          subject: `This Week in Napa County — ${startFmt} to ${endFmt}`,
          html: emailHtml.replace('{{NAME}}', sub.name || 'Neighbor'),
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
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function townDisplay(town) {
  if (!town) return '';
  return town.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function buildDigestEmail(aiIntro, grouped, dateStart, dateEnd) {
  const startFmt = formatDateShort(dateStart);
  const endFmt = formatDateShort(dateEnd);

  let eventsHtml = '';
  for (const [category, events] of Object.entries(grouped)) {
    const catLabel = category.charAt(0).toUpperCase() + category.slice(1);
    eventsHtml += `
      <tr><td style="padding:24px 0 8px 0;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;color:#2C1810;border-bottom:2px solid #C4A050;padding-bottom:6px;">${catLabel}</div>
      </td></tr>`;

    for (const ev of events) {
      const dateLine = [formatEventDate(ev.event_date), ev.start_time, ev.end_time ? `\u2013 ${ev.end_time}` : ''].filter(Boolean).join(' ');
      const locationLine = [ev.venue_name, townDisplay(ev.town)].filter(Boolean).join(', ');
      const desc = ev.description ? ev.description.split('.')[0] + '.' : '';

      eventsHtml += `
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(44,24,16,0.08);">
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#2C1810;margin-bottom:4px;">${escapeHtml(ev.title)}</div>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B7355;margin-bottom:4px;">${escapeHtml(dateLine)}</div>
        ${locationLine ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B7355;margin-bottom:6px;">${escapeHtml(locationLine)}</div>` : ''}
        ${desc ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#2C1810;line-height:1.5;margin-bottom:6px;">${escapeHtml(desc)}</div>` : ''}
        ${ev.website_url ? `<a href="${escapeHtml(ev.website_url)}" target="_blank" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B5E3C;text-decoration:none;font-weight:600;">More info \u2192</a>` : ''}
      </td></tr>`;
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NapaServe Weekly Events Digest</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F0E8;font-family:Arial,Helvetica,sans-serif;color:#2C1810;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5F0E8;">
<tr><td align="center">

<!-- Header -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5F0E8;border-bottom:3px solid #C4A050;">
<tr><td align="center" style="padding:20px 24px 16px;">
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:0.2em;color:#2C1810;font-weight:700;text-transform:uppercase;">NAPASERVE</div>
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#8B7355;margin-top:4px;">Community Intelligence for Napa County</div>
</td></tr>
</table>

<!-- Content -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#F5F0E8;">
<tr><td style="padding:40px 32px;">

  <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#2C1810;margin:0 0 8px 0;line-height:1.2;">This Week in Napa County</h1>
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B7355;margin-bottom:24px;">${escapeHtml(startFmt)} \u2013 ${escapeHtml(endFmt)}</div>

  <p style="font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#2C1810;line-height:1.6;margin:0 0 8px 0;">Hi {{NAME}},</p>
  <p style="font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#2C1810;line-height:1.6;margin:0 0 32px 0;">${escapeHtml(aiIntro)}</p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    ${eventsHtml}
  </table>

  <!-- CTA -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
  <tr><td align="center" style="padding:20px 0;">
    <a href="https://napaserve.org/events" target="_blank" style="display:inline-block;background-color:#2C1810;color:#F5F0E8;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;padding:12px 28px;">Browse All Events</a>
  </td></tr>
  </table>

</td></tr>
</table>

<!-- Footer -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5F0E8;border-top:1px solid rgba(44,24,16,0.12);">
<tr><td align="center" style="padding:24px 32px;">
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8B7355;line-height:1.6;">
    Community intelligence for Napa County<br>
    A Valley Works Collaborative \u00b7 VW Labs project<br><br>
    <a href="https://napaserve.org/api/unsubscribe?email={{EMAIL}}" style="color:#8B5E3C;text-decoration:underline;">Unsubscribe</a>
  </div>
</td></tr>
</table>

</td></tr>
</table>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const config = {
  maxDuration: 60,
};

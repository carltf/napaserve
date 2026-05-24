/**
 * useTrackerEvents — shared React hook for tracker data
 *
 * SINGLE SOURCE OF TRUTH for tracker event data on NapaServe.
 *
 * Data source:  napa_transition_tracker Supabase table
 * Read path:    /api/tracker-events (Cloudflare Worker)
 * Worker URL:   https://misty-bush-fc93.tfcarl.workers.dev
 *
 * Every UI surface displaying tracker data MUST consume this
 * hook. Do not bypass it. Do not re-implement it. Do not
 * hardcode tracker arrays anywhere in the app.
 *
 * If you find yourself wanting to fetch tracker data without
 * this hook, stop and ask why this hook doesn't already do
 * what you need — then extend the hook, don't fork it.
 *
 * WINDOWING ARCHITECTURE
 *
 * Each consumer surface declares its time window explicitly
 * via the `since` option. Default is windowed by consumer
 * intent, not unbounded. This scales as the tracker grows.
 *
 * Consumers (as of 2026-05-24):
 *   - SnapshotTab.jsx — dashboard "What changed this week"
 *     window: 30 days, limit 50
 *   - napaserve-calculators.jsx — Contraction Tracker
 *     window: 6 months, no limit (default view)
 *
 * Returns: { events, loading, error }
 *   events  — array of event objects (worker shape preserved,
 *             plus an additive 'date' field formatted via
 *             Lesson AA pattern for chart-regex consumers)
 *   loading — boolean, true while fetch is in flight
 *   error   — Error object on failure, null otherwise
 */

import { useState, useEffect } from 'react';

const WORKER_URL = 'https://misty-bush-fc93.tfcarl.workers.dev';

export function useTrackerEvents(options = {}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams();
    if (options.since) params.set('since', options.since);
    if (options.category) params.set('category', options.category);
    if (options.limit) params.set('limit', String(options.limit));
    const qs = params.toString();
    const url = `${WORKER_URL}/api/tracker-events${qs ? `?${qs}` : ''}`;

    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (cancelled) return;
        if (!data || !data.ok || !Array.isArray(data.results)) {
          throw new Error('Unexpected response shape');
        }
        const normalized = data.results.map(e => ({
          ...e,
          date: new Date(e.event_date + 'T00:00:00').toLocaleDateString(
            'en-US',
            { month: 'short', day: 'numeric', year: 'numeric' }
          ),
        }));
        setEvents(normalized);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [options.since, options.category, options.limit]);

  return { events, loading, error };
}

export function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function monthsAgoISO(months) {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

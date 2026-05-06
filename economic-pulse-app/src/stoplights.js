// Snapshot Tab v1.1 stoplight rules
// Single source of truth for all six-signal threshold logic.
// Each function returns 'green' | 'yellow' | 'red' | 'neutral'.
// 'neutral' is returned when input is null/undefined or insufficient history.
//
// Editorial framing — direction conventions vary by signal:
//   Wine CA share:  lower = greener (concentration easing)
//   Labor:          lower unemp = greener
//   Workforce:      MoM increase = greener
//   Housing:        higher YoY = greener
//   Transitions:    fewer = greener (less contraction)
//   Sentiment:      no stoplight by editorial design

export function wineCAShareStoplight(sharePct) {
  if (sharePct == null || isNaN(sharePct)) return 'neutral';
  if (sharePct <= 25.0) return 'green';
  if (sharePct < 27.5) return 'yellow';
  return 'red';
}

export function laborStoplight(unempPct) {
  if (unempPct == null || isNaN(unempPct)) return 'neutral';
  if (unempPct <= 3.5) return 'green';
  if (unempPct < 5.0) return 'yellow';
  return 'red';
}

// Workforce: MoM percent change of civilian labor force.
// Flat band is +/- 0.5% relative to prior month value.
export function workforceStoplight(currentLF, priorLF) {
  if (currentLF == null || priorLF == null || priorLF === 0) return 'neutral';
  const pctChange = ((currentLF - priorLF) / priorLF) * 100;
  if (pctChange > 0.5) return 'green';
  if (pctChange >= -0.5) return 'yellow';
  return 'red';
}

// Housing: YoY percent change of ZHVI.
// Green: >= +3%. Yellow: 0 to +2.99%. Red: < 0%.
export function housingStoplight(currentZHVI, yoyPriorZHVI) {
  if (currentZHVI == null || yoyPriorZHVI == null || yoyPriorZHVI === 0) return 'neutral';
  const yoyPct = ((currentZHVI - yoyPriorZHVI) / yoyPriorZHVI) * 100;
  if (yoyPct >= 3.0) return 'green';
  if (yoyPct >= 0) return 'yellow';
  return 'red';
}

// Regional transitions: count over last 30 days.
// Fewer transitions = healthier (less visible contraction).
export function transitionsStoplight(count) {
  if (count == null || isNaN(count)) return 'neutral';
  if (count <= 3) return 'green';
  if (count <= 8) return 'yellow';
  return 'red';
}

// Color hex map for rendering. Keep here so the SnapshotTab and
// any other consumer (e.g., future tracker page) stay in sync.
export const STOPLIGHT_COLORS = {
  green:   '#16a34a',
  yellow:  '#ca8a04',
  red:     '#dc2626',
  neutral: '#9ca3af',
};

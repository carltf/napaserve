// CoveragePanel — shared UI for Archive Coverage + Official & Regional Sources
// Used by: napaserve-agent.jsx, napaserve-project-evaluator.jsx
// Single source of truth for symbols, colors, layout

import { coverageSignal, classifyQuery, SECONDARY_SOURCES } from '../utils/coverageUtils';

export default function CoveragePanel({ sources, query }) {
  const cov = coverageSignal(sources);
  const category = classifyQuery(query || '');
  const secondary = category ? SECONDARY_SOURCES[category] : [];

  if (!cov && secondary.length === 0) return null;

  return (
    <div style={{ marginTop: 10 }}>
      {cov && (
        <div style={{ paddingTop: 8, borderTop: '1px solid rgba(44,24,16,0.08)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#8B7355' }}>Archive Coverage</span>
          <span style={{ fontSize: 12, color: '#8B7355', marginLeft: 4 }}>
            {cov.dot} <span style={{ color: cov.color, fontWeight: 600 }}>{cov.tier}</span>
            {' · '}{cov.count} {cov.count === 1 ? 'source' : 'sources'}
            {cov.yearRange ? ` · ${cov.yearRange}` : ''}
          </span>
        </div>
      )}
      {secondary.length > 0 && (
        <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(44,24,16,0.08)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Official & Regional Sources</div>
          {secondary.map((s, i) => (
            <div key={i} style={{ fontSize: 13, marginBottom: 4 }}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3A88A0', textDecoration: 'none', fontWeight: 500 }}>
                ↗ {s.label}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

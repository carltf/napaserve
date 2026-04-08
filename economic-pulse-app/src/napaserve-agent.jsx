import { useState, useRef, useEffect } from 'react';
import NavBar from './NavBar';
import Footer from './Footer';

const WORKER = 'https://misty-bush-fc93.tfcarl.workers.dev';

const SYSTEM_PROMPT = `You are NapaServe's Research Agent — a knowledgeable, community-focused AI for Napa County, California. You help planners, policymakers, community members and civic leaders understand local policy, land use, housing, the wine industry, workforce, environment, and economic development.

You have access to three years of Napa Valley Features archive reporting and can draw on the live web for current information. Always cite your sources clearly by title and link. Be direct, factual, and concise. When uncertain, say so. Prioritize local Napa County context over generic answers.`;

const STARTERS = [
  { tag: 'PEOPLE', group: 'People & Well-Being', q: 'A developer is proposing 200 new units near downtown. How does this serve working families?' },
  { tag: 'PEOPLE', group: 'People & Well-Being', q: 'What services are most critical for older residents in Napa County?' },
  { tag: 'PLACE', group: 'Place & Environment', q: 'Evaluate the wildfire risk in the eastern hills and what innovative preparedness approaches exist.' },
  { tag: 'PLACE', group: 'Place & Environment', q: 'What are the biggest threats to water security in Napa County over the next 20 years?' },
  { tag: 'PROSPERITY', group: 'Prosperity & Jobs', q: 'A new resort wants to open with 150 jobs. What questions should we ask about local hiring and wages?' },
  { tag: 'PROSPERITY', group: 'Prosperity & Jobs', q: 'How can Napa diversify its economy beyond wine and tourism?' },
  { tag: 'INNOVATION', group: 'Innovation Lab', q: 'What cutting-edge wildfire detection technologies are being deployed in other California counties?' },
  { tag: 'INNOVATION', group: 'Innovation Lab', q: 'What innovative workforce programs have successfully created living-wage jobs in rural counties?' },
];

const TAG_STYLE = {
  PEOPLE:     { bg: 'rgba(139,94,60,0.12)',  color: '#8B5E3C' },
  PLACE:      { bg: 'rgba(90,122,80,0.12)',   color: '#5A7A50' },
  PROSPERITY: { bg: 'rgba(139,105,20,0.12)',  color: '#8B6914' },
  INNOVATION: { bg: 'rgba(58,136,160,0.12)',  color: '#3A88A0' },
};

async function fetchArchiveContext(query) {
  try {
    const res = await fetch(WORKER + '/api/rag-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, topK: 4 }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch { return []; }
}

function formatResponse(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p style=\"margin:0 0 10px\">')
    .replace(/\n- /g, '</p><li style=\"margin:0 0 4px\">')
    .replace(/\n/g, '<br>');
}

export default function AgentPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showHow, setShowHow]   = useState(true);
  const [isMobile, setIsMobile]  = useState(() => typeof window !== 'undefined' && window.innerWidth < 700);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const groups = [...new Set(STARTERS.map(s => s.group))];

  async function send(text) {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput('');
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: q }]);

    try {
      const res = await fetch(WORKER + '/api/rag-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, matchCount: 6 }),
      });
      if (!res.ok) throw new Error('Worker ' + res.status);
      const data  = await res.json();
      const reply = data.answer || 'No response generated.';
      const sources = (data.sources || [])
        .filter(s => s.title && s.substack_url)
        .map(s => ({ title: s.title, url: s.substack_url, date: s.published_at }));
      setMessages(prev => [...prev, { role: 'assistant', content: reply, sources }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error — please try again. (' + e.message + ')' }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }

  function handleKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }

  const S = {
    page:    { minHeight: '100vh', background: '#F5F0E8', display: 'flex', flexDirection: 'column', fontFamily: "'Source Sans 3',sans-serif" },
    hero:    { background: '#EDE8DE', borderBottom: '1px solid rgba(44,24,16,0.12)', padding: '20px 24px 18px' },
    heroIn:  { maxWidth: 1100, margin: '0 auto' },
    body:    { flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', maxWidth: 1100, margin: '0 auto', width: '100%', padding: isMobile ? '12px' : '16px 16px', gap: isMobile ? 12 : 24, alignItems: 'flex-start' },
    sidebar: { width: isMobile ? '100%' : 260, flexShrink: 0 },
    sGroup:  { marginBottom: 20 },
    sLabel:  { fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 10, display: 'block' },
    sBtn:    { display: 'block', width: '100%', textAlign: 'left', background: '#EDE8DE', border: '1px solid rgba(44,24,16,0.12)', borderRadius: 6, padding: '10px 12px', marginBottom: 8, cursor: 'pointer', fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: '#2C1810', lineHeight: 1.4 },
    chatCol: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 },
    howTo:   { background: '#EDE8DE', border: '1px solid rgba(44,24,16,0.12)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 },
    msgBox:  { background: '#EDE8DE', border: '1px solid rgba(44,24,16,0.12)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 },
    welcome: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '48px 16px', flex: 1 },
    inRow:   { background: '#EDE8DE', border: '1px solid rgba(44,24,16,0.12)', borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-end' },
    hint:    { fontSize: 12, color: '#8B7355', textAlign: 'center' },
    clrBtn:  { display: 'block', background: 'none', border: '1px solid rgba(44,24,16,0.12)', borderRadius: 6, padding: 8, width: '100%', color: '#8B7355', fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, cursor: 'pointer', marginTop: 8 },
  };

  const pills = [
    { label: 'People & Well-Being', bg: 'rgba(139,94,60,0.1)',  color: '#8B5E3C', border: 'rgba(139,94,60,0.2)' },
    { label: 'Place & Environment', bg: 'rgba(90,122,80,0.1)',   color: '#5A7A50', border: 'rgba(90,122,80,0.2)' },
    { label: 'Prosperity & Jobs',   bg: 'rgba(139,105,20,0.1)',  color: '#8B6914', border: 'rgba(139,105,20,0.2)' },
    { label: 'Innovation Lab',      bg: 'rgba(58,136,160,0.1)',  color: '#3A88A0', border: 'rgba(58,136,160,0.2)' },
  ];

  return (
    <div style={S.page}>
      <NavBar />

      <div style={S.hero}>
        <div style={S.heroIn}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>● NapaServe &nbsp; Napa County</p>
          <h1 style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '1.6rem', fontWeight: 700, color: '#2C1810', marginBottom: 6 }}>Research Agent</h1>
          <p style={{ fontSize: 15, color: '#5A4A3A', lineHeight: 1.5 }}>Grounded in NVF archive reporting, regional data, and the live web. Ask about policy, housing, the wine industry, or anything shaping Napa Valley.</p>
        </div>
      </div>

      <div style={S.body}>
        <div style={S.sidebar}>
          {groups.map((g, gi) => {
            const items = STARTERS.filter(s => s.group === g);
            return (
              <div key={g} style={{ ...S.sGroup, marginTop: gi === 0 ? 0 : undefined }}>
                <span style={S.sLabel}>{g}</span>
                {items.map((s, i) => {
                  const tc = TAG_STYLE[s.tag];
                  return (
                    <button key={i} style={S.sBtn} onClick={() => send(s.q)}>
                      <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '2px 6px', borderRadius: 3, marginBottom: 4, background: tc.bg, color: tc.color }}>{s.tag}</span>
                      <br />{s.q}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div style={S.chatCol}>
          {showHow && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#8B7355', margin: 0 }}>How to Use</p>
              <div style={S.howTo}>
                <p style={{ margin: 0, fontSize: 13, color: '#5A4A3A', lineHeight: 1.5, flex: 1 }}>Ask any question about Napa County policy, land use, housing, water, or economic development. The agent searches the NVF archive and the live web before responding — and cites its sources.</p>
                <button onClick={() => setShowHow(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A89880', fontSize: 18, lineHeight: 1, flexShrink: 0, padding: 0 }}>×</button>
              </div>
            </>
          )}

          <div style={S.inRow}>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Ask NapaServe about a policy, project, or community challenge..." rows={1} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontFamily: "'Source Sans 3',sans-serif", fontSize: 15, color: '#2C1810', lineHeight: 1.5, minHeight: 44, maxHeight: 140 }} />
            <button onClick={() => send()} disabled={loading || !input.trim()} style={{ background: (loading || !input.trim()) ? 'rgba(44,24,16,0.2)' : '#2C1810', color: '#F5F0E8', border: 'none', borderRadius: 8, width: 40, height: 40, cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </div>
          <button style={S.clrBtn} onClick={() => setMessages([])}>Clear conversation</button>
          <p style={S.hint}>Responses are grounded in NVF archive sources shown below each answer. CI is one tool within a larger system of community knowledge.</p>

          <div style={S.msgBox}>
            {messages.length === 0 && !loading && (
              <div style={S.welcome}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid rgba(196,160,80,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B5E3C" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h2 style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '1.6rem', fontWeight: 700, color: '#2C1810', marginBottom: 12 }}>NapaServe Community Intelligence Agent</h2>
                <p style={{ fontSize: 15, color: '#5A4A3A', lineHeight: 1.65, maxWidth: 440 }}>NapaServe is a community intelligence platform built on three years of original local reporting, regional economic data, and community polling. Ask about land use, the wine industry, housing, workforce, or anything shaping Napa Valley's future — and see the sources behind every answer.</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {pills.map(p => <span key={p.label} style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: p.bg, color: p.color, border: '1px solid ' + p.border }}>{p.label}</span>)}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, maxWidth: 760, flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: m.role === 'user' ? '#2C1810' : '#F5F0E8', color: m.role === 'user' ? '#F5F0E8' : '#8B5E3C', border: m.role === 'assistant' ? '1px solid rgba(44,24,16,0.15)' : 'none', fontFamily: m.role === 'assistant' ? "'Libre Baskerville',serif" : 'inherit' }}>
                  {m.role === 'user' ? 'You' : 'NS'}
                </div>
                <div style={{ padding: '14px 18px', borderRadius: m.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px', fontSize: 15, lineHeight: 1.65, maxWidth: 680, background: m.role === 'user' ? '#2C1810' : '#F5F0E8', color: m.role === 'user' ? '#F5F0E8' : '#2C1810', border: m.role === 'assistant' ? '1px solid rgba(44,24,16,0.1)' : 'none', boxShadow: m.role === 'assistant' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none' }}>
                  <p style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: formatResponse(m.content) }} />
                  {m.sources && m.sources.length > 0 && (
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(44,24,16,0.1)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>NVF Archive Sources</div>
                      {m.sources.map((s, si) => (
                        <div key={si} style={{ fontSize: 13, marginBottom: 4 }}>
                          <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: '#8B5E3C', textDecoration: 'none', fontWeight: 500 }}>↗ {s.title}</a>
                          {s.date && <span style={{ color: '#A89880', fontSize: 12, marginLeft: 6 }}>{s.date.slice(0,7)}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 12, alignSelf: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F5F0E8', border: '1px solid rgba(44,24,16,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#8B5E3C', fontFamily: "'Libre Baskerville',serif" }}>NS</div>
                <div style={{ padding: '16px 20px', background: '#F5F0E8', borderRadius: '12px 12px 12px 3px', border: '1px solid rgba(44,24,16,0.1)', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#8B7355', display: 'inline-block', animation: 'ns-bounce 1.2s infinite', animationDelay: i*0.2+'s' }} />)}
                  <style>{'@keyframes ns-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}'}</style>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
// cache-bust Wed Apr  8 08:49:27 PDT 2026

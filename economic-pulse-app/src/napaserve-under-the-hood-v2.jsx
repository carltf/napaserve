import { useEffect, useRef, useState } from "react";
import Footer from "./Footer";
import NavBar from "./NavBar";

// ─── theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:      "#F5F0E8",
  surface: "#EDE8DE",
  ink:     "#2C1810",
  accent:  "#8B5E3C",
  gold:    "#C4A050",
  muted:   "#8B7355",
  border:  "#D4C9B8",
};

const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";
const ARTICLE_SLUG = "napa-cab-2025";


// ─── live poll component ──────────────────────────────────────────────────────
function LivePoll({ poll }) {
  const [voted, setVoted]   = useState(null);
  const [counts, setCounts] = useState(poll.counts || {});
  const [total, setTotal]   = useState(poll.total || 0);
  const [loading, setLoading] = useState(false);

  const vote = async (idx) => {
    if (voted !== null || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${WORKER}/api/article-poll-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poll_id: poll.id, option_index: idx })
      });
      const data = await res.json();
      if (data.success) {
        setCounts(data.counts);
        setTotal(data.total);
        setVoted(idx);
      }
    } catch(e) { /* silent fail */ }
    setLoading(false);
  };

  const options = poll.options;

  return (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "20px 20px 16px", marginBottom: 16 }}>
      <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 10, letterSpacing: "0.1em", color: T.gold, fontWeight: 700, textTransform: "uppercase", margin: "0 0 8px 0" }}>Poll</p>
      <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 700, color: T.ink, margin: "0 0 14px 0", lineHeight: 1.4 }}>{poll.question}</p>

      {options.map((opt, idx) => {
        const count = counts[idx] || 0;
        const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
        const isVoted = voted === idx;

        return (
          <div key={idx} style={{ marginBottom: 8 }}>
            {voted === null ? (
              <button onClick={() => vote(idx)} disabled={loading}
                style={{ width: "100%", textAlign: "center", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, padding: "9px 12px", fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: T.ink, cursor: loading ? "default" : "pointer" }}>
                {opt}
              </button>
            ) : (
              <div style={{ position: "relative", overflow: "hidden", borderRadius: 4, border: `1px solid ${isVoted ? T.accent : T.border}` }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: pct + "%", background: isVoted ? "rgba(139,94,60,0.15)" : "rgba(139,94,60,0.06)", transition: "width 0.5s ease" }} />
                <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px" }}>
                  <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: T.ink, fontWeight: isVoted ? 600 : 400 }}>{opt}</span>
                  <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.muted, marginLeft: 12, whiteSpace: "nowrap" }}>{pct}%</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {voted !== null && (
        <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: T.muted, margin: "10px 0 0 0" }}>{total} {total === 1 ? "vote" : "votes"} · Results update in real time</p>
      )}
    </div>
  );
}

// ─── polls section ────────────────────────────────────────────────────────────
function PollsSection() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${WORKER}/api/article-polls?slug=${ARTICLE_SLUG}`)
      .then(r => r.json())
      .then(data => { setPolls(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: "24px 0", fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: T.muted }}>Loading polls...</div>
  );
  if (!polls.length) return null;

  return (
    <div style={{ borderTop: `2px solid ${T.border}`, marginTop: 48, paddingTop: 32 }}>
      <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 10, letterSpacing: "0.1em", color: T.gold, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px 0" }}>Today's Polls</p>
      <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 20px 0" }}>What do you think?</h2>
      {polls.map(poll => <LivePoll key={poll.id} poll={poll} />)}
      <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>
        Poll results are anonymous and stored on NapaServe. Results shown after you vote.
        Historical reader polls from Napa Valley Features are searchable in the{" "}
        <a href="/dashboard" style={{ color: T.accent }}>Community Pulse dashboard</a>.
      </p>
    </div>
  );
}

// ─── archive search ───────────────────────────────────────────────────────────
function ArchiveSearch() {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`${WORKER}/api/rag-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k: 5 })
      });
      const data = await res.json();
      setResults(data.results || data || []);
    } catch(e) { setResults([]); }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === "Enter") search(); };

  return (
    <div style={{ borderTop: `2px solid ${T.border}`, marginTop: 48, paddingTop: 32 }}>
      <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 10, letterSpacing: "0.1em", color: T.gold, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px 0" }}>Archive</p>
      <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 6px 0" }}>Search Napa Valley Features</h2>
      <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: T.muted, margin: "0 0 16px 0" }}>Search 1,000+ articles and reports from Napa Valley Features.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Search grape prices, vineyard economics, wine market..."
          style={{ flex: 1, padding: "10px 14px", fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: T.ink, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, outline: "none" }}
        />
        <button onClick={search} disabled={loading}
          style={{ padding: "10px 20px", background: T.accent, color: "#fff", border: "none", borderRadius: 6, fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, fontWeight: 600, cursor: loading ? "default" : "pointer" }}>
          {loading ? "..." : "Search"}
        </button>
      </div>

      {searched && !loading && results.length === 0 && (
        <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: T.muted }}>No results found. Try different keywords.</p>
      )}

      {results.map((r, i) => (
        <div key={i} style={{ borderBottom: `1px solid ${T.border}`, padding: "14px 0" }}>
          {r.post_url ? (
            <a href={r.post_url} target="_blank" rel="noreferrer"
              style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 700, color: T.accent, textDecoration: "none", display: "block", marginBottom: 4 }}>
              {r.post_title || r.title || "Article"}
            </a>
          ) : (
            <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 700, color: T.ink, margin: "0 0 4px 0" }}>{r.post_title || r.title || "Article"}</p>
          )}
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: T.ink, margin: "0 0 4px 0", lineHeight: 1.5 }}>{r.chunk_text || r.text || r.content || ""}</p>
          {r.post_url && (
            <a href={r.post_url} target="_blank" rel="noreferrer"
              style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: T.muted }}>Read full article →</a>
          )}
        </div>
      ))}

      {results.length > 0 && (
        <a href="/archive" style={{ display: "inline-block", marginTop: 16, fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: T.accent, textDecoration: "underline" }}>
          Open full archive search →
        </a>
      )}
    </div>
  );
}

// ─── chart data ───────────────────────────────────────────────────────────────
const HIST_YEARS  = [1976,1977,1978,1979,1980,1981,1982,1983,1984,1985,1986,1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025];
const HIST_PRICES = [461,603,533,538,615,799,846,732,831,860,962,1082,1234,1474,1604,1687,1637,1519,1464,1575,1804,2018,2298,2634,3175,3729,4020,4010,3947,3973,4126,4299,4777,4757,4456,4659,5058,5469,5919,6284,6828,7498,7925,7941,6261,8083,8819,9235,9146,8933];

const fmtK = v => "$" + (v >= 1000 ? (v/1000).toFixed(v % 1000 === 0 ? 0 : 1) + "k" : v.toLocaleString());

function ChartBox({ title, caption, children }) {
  return (
    <div style={{ background: T.surface, borderRadius: 8, padding: "24px", margin: "32px 0", border: `1px solid ${T.border}` }}>
      <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 700, color: T.ink, margin: "0 0 4px 0" }}>{title}</p>
      {children}
      <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: T.muted, marginTop: 12, lineHeight: 1.5 }}>{caption}</p>
    </div>
  );
}

function Chart1() {
  const ref = useRef(null);
  useEffect(() => {
    if (!window.Chart || !ref.current) return;
    const ch = new window.Chart(ref.current, {
      type: "line",
      data: { labels: HIST_YEARS, datasets: [{ data: HIST_PRICES, borderColor: T.accent, backgroundColor: "rgba(139,94,60,0.08)", fill: true, tension: 0.3, borderWidth: 2, pointRadius: HIST_YEARS.map(y=>[2023,2025].includes(y)?6:2), pointBackgroundColor: HIST_YEARS.map(y=>y===2023?"#E24B4A":y===2025?T.gold:T.accent), pointBorderColor:"#fff", pointBorderWidth:1.5 }] },
      options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>"$"+c.parsed.y.toLocaleString()+" per ton"}} }, scales:{ x:{ticks:{color:T.muted,maxTicksLimit:12,font:{size:10}},grid:{color:"rgba(0,0,0,0.06)"}}, y:{ticks:{color:T.muted,font:{size:10},callback:fmtK},grid:{color:"rgba(0,0,0,0.06)"},min:0} } }
    });
    return () => ch.destroy();
  }, []);
  return (<><div style={{display:"flex",gap:20,flexWrap:"wrap",marginBottom:10,fontSize:11,color:T.muted,fontFamily:"'Source Sans 3',sans-serif"}}><span><span style={{display:"inline-block",width:18,height:3,background:T.accent,marginRight:5,verticalAlign:"middle",borderRadius:1}}/>Wtd. avg. price per ton</span><span><span style={{display:"inline-block",width:10,height:10,borderRadius:"50%",background:"#E24B4A",marginRight:5,verticalAlign:"middle"}}/>2023 peak: $9,235</span><span><span style={{display:"inline-block",width:10,height:10,borderRadius:"50%",background:T.gold,marginRight:5,verticalAlign:"middle"}}/>2025 prelim.: $8,933</span></div><div style={{position:"relative",width:"100%",height:300}}><canvas ref={ref}/></div><button onClick={()=>{const canvas=ref.current;if(!canvas)return;const offscreen=document.createElement("canvas");offscreen.width=canvas.width;offscreen.height=canvas.height;const ctx=offscreen.getContext("2d");ctx.fillStyle="#FAF6F0";ctx.fillRect(0,0,offscreen.width,offscreen.height);ctx.drawImage(canvas,0,0);const link=document.createElement("a");link.download="chart-1_weighted-avg-price_nvf_2025.png";link.href=offscreen.toDataURL("image/png");link.click();}} style={{marginTop:"8px",padding:"4px 12px",fontSize:"11px",fontFamily:"monospace",letterSpacing:"0.08em",color:"#8B7355",background:"transparent",border:"1px solid #D4C4A8",borderRadius:"3px",cursor:"pointer",display:"block"}}>DOWNLOAD CHART PNG</button></>);
}

function Chart2() {
  const ref = useRef(null);
  useEffect(() => {
    if (!window.Chart || !ref.current) return;
    const labels=[2019,2020,2021,2022,2023,2024,2025];
    const actual=[7941,6261,8083,8819,9235,9146,8933];
    const b23=9235,b19=7941;
    const p1=labels.map(y=>y<2023?null:Math.round(b23*Math.pow(1.0475,y-2023)));
    const p2=labels.map(y=>y<2023?null:Math.round(b23*Math.pow(1.066,y-2023)));
    const p3=labels.map((y,i)=>Math.round(b19*Math.pow(1.0689,y-2019)));
    const ch=new window.Chart(ref.current,{type:"line",data:{labels,datasets:[
      {label:"Actual",data:actual,borderColor:T.accent,backgroundColor:"rgba(139,94,60,0.07)",fill:true,tension:0.2,borderWidth:2.5,pointRadius:[4,4,4,4,6,4,7],pointBackgroundColor:labels.map(y=>y===2025?T.gold:T.accent),pointBorderColor:"#fff",pointBorderWidth:1.5},
      {label:"2000-2023 (4.75%·yr)",data:p1,borderColor:"#1D9E75",borderDash:[7,4],backgroundColor:"transparent",tension:0,borderWidth:1.8,pointRadius:labels.map((_,i)=>i===6?7:0),pointBackgroundColor:"#1D9E75",pointBorderColor:"#fff",pointBorderWidth:1.5,spanGaps:false},
      {label:"1976-2023 (6.6%·yr)",data:p2,borderColor:"#BA7517",borderDash:[7,4],backgroundColor:"transparent",tension:0,borderWidth:1.8,pointRadius:labels.map((_,i)=>i===6?7:0),pointBackgroundColor:"#BA7517",pointBorderColor:"#fff",pointBorderWidth:1.5,spanGaps:false},
      {label:"2011-2019 (6.9%·yr from 2019)",data:p3,borderColor:"#E24B4A",borderDash:[7,4],backgroundColor:"transparent",tension:0,borderWidth:1.8,pointRadius:labels.map((_,i)=>i===6?7:i===0?5:0),pointBackgroundColor:"#E24B4A",pointBorderColor:"#fff",pointBorderWidth:1.5},
    ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>{const v=c.parsed.y;return v?c.dataset.label+": $"+v.toLocaleString():null;}}}},scales:{x:{ticks:{color:T.muted,font:{size:10}},grid:{color:"rgba(0,0,0,0.06)"}},y:{ticks:{color:T.muted,font:{size:10},callback:fmtK},grid:{color:"rgba(0,0,0,0.06)"},min:5500,max:13000}}}});
    return ()=>ch.destroy();
  },[]);
  return (<><div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:10,fontSize:11,color:T.muted,fontFamily:"'Source Sans 3',sans-serif"}}>{[["Actual",T.accent,false],["2000-2023 (4.75%·yr) \u2192 $10,134","#1D9E75",true],["1976-2023 (6.6%·yr) \u2192 $10,492","#BA7517",true],["2011-2019 (6.9%·yr from 2019) \u2192 $11,847","#E24B4A",true]].map(([l,c,d])=>(<span key={l} style={{display:"flex",alignItems:"center",gap:5}}><span style={{display:"inline-block",width:20,height:0,border:`2px ${d?"dashed":"solid"} ${c}`,verticalAlign:"middle"}}/>{l}</span>))}</div><div style={{position:"relative",width:"100%",height:300}}><canvas ref={ref}/></div><button onClick={()=>{const canvas=ref.current;if(!canvas)return;const offscreen=document.createElement("canvas");offscreen.width=canvas.width;offscreen.height=canvas.height;const ctx=offscreen.getContext("2d");ctx.fillStyle="#FAF6F0";ctx.fillRect(0,0,offscreen.width,offscreen.height);ctx.drawImage(canvas,0,0);const link=document.createElement("a");link.download="chart-2_yoy-price-change_nvf_2025.png";link.href=offscreen.toDataURL("image/png");link.click();}} style={{marginTop:"8px",padding:"4px 12px",fontSize:"11px",fontFamily:"monospace",letterSpacing:"0.08em",color:"#8B7355",background:"transparent",border:"1px solid #D4C4A8",borderRadius:"3px",cursor:"pointer",display:"block"}}>DOWNLOAD CHART PNG</button></>);
}

function Chart3() {
  const ref=useRef(null);
  useEffect(()=>{
    if(!window.Chart||!ref.current)return;
    const yrs=[2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025];
    const avg=[6284,6828,7498,7925,7941,6261,8083,8819,9235,9146,8933];
    const mx=[48000,59375,50000,50000,50000,65919,62825,60000,67200,69125,67200];
    const ch=new window.Chart(ref.current,{type:"bar",data:{labels:yrs,datasets:[{label:"Wtd. avg.",data:avg,backgroundColor:"rgba(139,94,60,0.8)",borderRadius:3,yAxisID:"y"},{label:"Max price",data:mx,type:"line",borderColor:"#E24B4A",backgroundColor:"transparent",tension:0.3,borderWidth:2,pointRadius:4,pointBackgroundColor:"#E24B4A",yAxisID:"y2"}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>(c.dataset.label||"")+": $"+c.parsed.y.toLocaleString()}}},scales:{x:{ticks:{color:T.muted,font:{size:9}},grid:{color:"rgba(0,0,0,0.06)"}},y:{ticks:{color:T.muted,font:{size:9},callback:fmtK},grid:{color:"rgba(0,0,0,0.06)"},min:0,title:{display:true,text:"Wtd. avg.",color:T.muted,font:{size:9}}},y2:{position:"right",ticks:{color:"#E24B4A",font:{size:9},callback:v=>"$"+(v/1000).toFixed(0)+"k"},grid:{display:false},min:0,title:{display:true,text:"Max price",color:"#E24B4A",font:{size:9}}}}}});
    return()=>ch.destroy();
  },[]);
  return(<><div style={{display:"flex",gap:20,marginBottom:10,fontSize:11,color:T.muted,fontFamily:"'Source Sans 3',sans-serif"}}><span><span style={{display:"inline-block",width:10,height:10,borderRadius:2,background:"rgba(139,94,60,0.8)",marginRight:5,verticalAlign:"middle"}}/>Wtd. avg. (left axis)</span><span><span style={{display:"inline-block",width:10,height:10,borderRadius:2,background:"#E24B4A",marginRight:5,verticalAlign:"middle",opacity:0.8}}/>Max price paid (right axis)</span></div><div style={{position:"relative",width:"100%",height:300}}><canvas ref={ref}/></div><button onClick={()=>{const canvas=ref.current;if(!canvas)return;const offscreen=document.createElement("canvas");offscreen.width=canvas.width;offscreen.height=canvas.height;const ctx=offscreen.getContext("2d");ctx.fillStyle="#FAF6F0";ctx.fillRect(0,0,offscreen.width,offscreen.height);ctx.drawImage(canvas,0,0);const link=document.createElement("a");link.download="chart-3_harvest-volume_nvf_2025.png";link.href=offscreen.toDataURL("image/png");link.click();}} style={{marginTop:"8px",padding:"4px 12px",fontSize:"11px",fontFamily:"monospace",letterSpacing:"0.08em",color:"#8B7355",background:"transparent",border:"1px solid #D4C4A8",borderRadius:"3px",cursor:"pointer",display:"block"}}>DOWNLOAD CHART PNG</button></>);
}

function Chart4() {
  const ref=useRef(null);
  useEffect(()=>{
    if(!window.Chart||!ref.current)return;
    const ch=new window.Chart(ref.current,{type:"bar",data:{labels:["Chardonnay","Sauv. Blanc","Cab Franc","Cab Sauv","Pinot Noir"],datasets:[{label:"Napa (D4)",data:[3675,3137,11132,8933,2868],backgroundColor:"rgba(139,94,60,0.85)",borderRadius:3},{label:"Sonoma (D3)",data:[2429,1904,4712,2772,3818],backgroundColor:"rgba(196,160,80,0.85)",borderRadius:3},{label:"Lake (D2)",data:[288,1196,1807,1171,1347],backgroundColor:"rgba(44,24,16,0.45)",borderRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.dataset.label+": $"+c.parsed.y.toLocaleString()+" per ton"}}},scales:{x:{ticks:{color:T.muted,font:{size:10}},grid:{color:"rgba(0,0,0,0.06)"}},y:{ticks:{color:T.muted,font:{size:10},callback:fmtK},grid:{color:"rgba(0,0,0,0.06)"},min:0}}}});
    return()=>ch.destroy();
  },[]);
  return(<><div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:10,fontSize:11,color:T.muted,fontFamily:"'Source Sans 3',sans-serif"}}>{[["Napa (D4)","rgba(139,94,60,0.85)"],["Sonoma (D3)","rgba(196,160,80,0.85)"],["Lake (D2)","rgba(44,24,16,0.45)"]].map(([l,c])=>(<span key={l} style={{display:"flex",alignItems:"center",gap:5}}><span style={{display:"inline-block",width:10,height:10,borderRadius:2,background:c}}/>{l}</span>))}</div><div style={{position:"relative",width:"100%",height:320}}><canvas ref={ref}/></div><button onClick={()=>{const canvas=ref.current;if(!canvas)return;const offscreen=document.createElement("canvas");offscreen.width=canvas.width;offscreen.height=canvas.height;const ctx=offscreen.getContext("2d");ctx.fillStyle="#FAF6F0";ctx.fillRect(0,0,offscreen.width,offscreen.height);ctx.drawImage(canvas,0,0);const link=document.createElement("a");link.download="chart-4_price-volume-scatter_nvf_2025.png";link.href=offscreen.toDataURL("image/png");link.click();}} style={{marginTop:"8px",padding:"4px 12px",fontSize:"11px",fontFamily:"monospace",letterSpacing:"0.08em",color:"#8B7355",background:"transparent",border:"1px solid #D4C4A8",borderRadius:"3px",cursor:"pointer",display:"block"}}>DOWNLOAD CHART PNG</button></>);
}

function Chart5() {
  const ref=useRef(null);
  useEffect(()=>{
    if(!window.Chart||!ref.current)return;
    const data=[-0.4,-0.7,4.7,-3.3,-2.4];
    const ch=new window.Chart(ref.current,{type:"bar",data:{labels:["Chardonnay","Sauv. Blanc","Cab Franc","Cab Sauv","Pinot Noir"],datasets:[{data,backgroundColor:data.map(v=>v<0?"rgba(226,75,74,0.82)":"rgba(29,158,117,0.82)"),borderRadius:3}]},options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>(c.parsed.x>0?"+":"")+c.parsed.x.toFixed(1)+"%"}}},scales:{x:{ticks:{color:T.muted,font:{size:10},callback:v=>(v>0?"+":"")+v+"%"},grid:{color:"rgba(0,0,0,0.06)"}},y:{ticks:{color:T.muted,font:{size:10}},grid:{color:"rgba(0,0,0,0.06)"}}}}});
    return()=>ch.destroy();
  },[]);
  return <><div style={{position:"relative",width:"100%",height:260}}><canvas ref={ref}/></div><button onClick={()=>{const canvas=ref.current;if(!canvas)return;const offscreen=document.createElement("canvas");offscreen.width=canvas.width;offscreen.height=canvas.height;const ctx=offscreen.getContext("2d");ctx.fillStyle="#FAF6F0";ctx.fillRect(0,0,offscreen.width,offscreen.height);ctx.drawImage(canvas,0,0);const link=document.createElement("a");link.download="chart-5_prices-by-variety_nvf_2025.png";link.href=offscreen.toDataURL("image/png");link.click();}} style={{marginTop:"8px",padding:"4px 12px",fontSize:"11px",fontFamily:"monospace",letterSpacing:"0.08em",color:"#8B7355",background:"transparent",border:"1px solid #D4C4A8",borderRadius:"3px",cursor:"pointer",display:"block"}}>DOWNLOAD CHART PNG</button></>;
}

function Chart6() {
  const ref=useRef(null);
  useEffect(()=>{
    if(!window.Chart||!ref.current)return;
    const yrs=["2016","2017","2018","2019","2020","2021","2022","2023","2024","2025"];
    const white=[1680,1690,1750,1690,1510,1550,1330,1650,1260,1200];
    const red=[2460,2470,2680,2340,1960,2270,2170,2170,1530,1450];
    const table=[135,135,140,130,100,115,110,120,60,60];
    const raisin=[40,35,40,35,25,30,25,20,15,15];
    const ch=new window.Chart(ref.current,{type:"bar",data:{labels:yrs,datasets:[{label:"White wine",data:white,backgroundColor:"rgba(196,160,80,0.75)",stack:"s"},{label:"Red wine",data:red,backgroundColor:"rgba(139,94,60,0.85)",stack:"s"},{label:"Table type",data:table,backgroundColor:"rgba(44,24,16,0.35)",stack:"s"},{label:"Raisin type",data:raisin,backgroundColor:"rgba(44,24,16,0.55)",stack:"s"}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.dataset.label+": "+c.parsed.y.toLocaleString()+"k tons"}}},scales:{x:{ticks:{color:T.muted,font:{size:10}},grid:{color:"rgba(0,0,0,0.06)"}},y:{stacked:true,ticks:{color:T.muted,font:{size:10},callback:v=>v.toLocaleString()},grid:{color:"rgba(0,0,0,0.06)"},title:{display:true,text:"Thousand tons",color:T.muted,font:{size:10}}}}}});
    return()=>ch.destroy();
  },[]);
  return(<><div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:10,fontSize:11,color:T.muted,fontFamily:"'Source Sans 3',sans-serif"}}>{[["White wine","rgba(196,160,80,0.75)"],["Red wine","rgba(139,94,60,0.85)"],["Table type","rgba(44,24,16,0.35)"],["Raisin type","rgba(44,24,16,0.55)"]].map(([l,c])=>(<span key={l} style={{display:"flex",alignItems:"center",gap:5}}><span style={{display:"inline-block",width:10,height:10,borderRadius:2,background:c}}/>{l}</span>))}</div><div style={{position:"relative",width:"100%",height:300}}><canvas ref={ref}/></div><button onClick={()=>{const canvas=ref.current;if(!canvas)return;const offscreen=document.createElement("canvas");offscreen.width=canvas.width;offscreen.height=canvas.height;const ctx=offscreen.getContext("2d");ctx.fillStyle="#FAF6F0";ctx.fillRect(0,0,offscreen.width,offscreen.height);ctx.drawImage(canvas,0,0);const link=document.createElement("a");link.download="chart-6_key-metrics_nvf_2025.png";link.href=offscreen.toDataURL("image/png");link.click();}} style={{marginTop:"8px",padding:"4px 12px",fontSize:"11px",fontFamily:"monospace",letterSpacing:"0.08em",color:"#8B7355",background:"transparent",border:"1px solid #D4C4A8",borderRadius:"3px",cursor:"pointer",display:"block"}}>DOWNLOAD CHART PNG</button></>);
}

// ─── article sections ─────────────────────────────────────────────────────────
const SECTIONS = [
  { id:"intro", heading:null, body:`NAPA COUNTY, Calif. — The weighted average price of Napa County cabernet sauvignon reached $9,235 per ton in 2023, the highest on record. Two years later it stands at $8,933.\n\nThe decline is modest — roughly 3.3% from the peak. In the context of Napa's long economic trajectory, however, the shift carries far larger implications. For nearly five decades, growers, wineries and lenders built their expectations around a growth curve that steadily pushed cabernet prices higher. Depending on which historical period is used as a benchmark, the weighted average price of Napa cabernet in 2025 would be expected to fall somewhere between $10,100 and $11,800 per ton.\n\nInstead, the preliminary crush data show prices moving in the opposite direction for two consecutive years — the first sustained decline in the modern era of Napa viticulture.\n\nThe gap between those two paths — the trajectory the market expected and the one now appearing in the data — reveals a structural shift that could reshape vineyard economics across Napa Valley.`, chart:null },
  { id:"crush", heading:"The 2025 Crush Report: A Brief Summary", body:`California wineries crushed 2.62 million tons of grapes in 2025 — the lightest crop since 1999 and 23% below the five-year average. Total red wine production declined 9% and white wine production declined 6%. The total crop value statewide fell 16% from the prior year to $2.414 billion, according to Turrentine Brokerage, which characterized the vintage as one of the most challenging for the wine industry since Prohibition.\n\nThe volume decline was driven by a combination of weather, acreage removals and a persistent lack of demand that left significant tonnage uncontracted and unharvested. An estimated 57,000 acres were removed statewide in 2025, with considerably more left unpicked.\n\n"The 2025 vintage highlights the industry's directional shift of declining production and an overall restructure of the industry," said Audra Cooper, vice president at Turrentine Brokerage. "Between a cooler growing season, reduced vineyard inputs, and multiple rain events which led to excessive late-season disease pressure and combined with soft demand, 2025's challenges were relentless."\n\nFor Napa Valley specifically, Cabernet Sauvignon tonnage came in at roughly 77,000 tons — just a 1.3% decline from 2024, smaller than many in the industry had predicted. The price, however, continued lower.`, chart:{ component:Chart6, title:"California Grapes Crushed by Type, 2016–2025", caption:"Total tons of wine grapes crushed in California fell to 2.62 million tons in 2025 — the lightest crop since 1999 and 23% below the five-year average. Source: USDA-NASS Pacific Regional Office (2025 Preliminary Grape Crush Report); Turrentine Brokerage market assessment, March 2026." } },
  { id:"curve", heading:"A Half-Century Price Curve", body:`Since the late 1970s, following enactment of California's Clare Berryhill Grape Crush Act of 1976, the California Department of Food and Agriculture has published annual grape crush data in cooperation with USDA's National Agricultural Statistics Service. Napa cabernet prices have followed one of the most consistent upward trajectories in American agriculture.\n\nIn 1976 the weighted average price of Napa cabernet was $461 per ton. By the early 2000s it had climbed above $3,000. Two decades later it exceeded $9,000. The rise was not perfectly smooth. Prices slowed during recessions and fluctuated with harvest conditions — most notably in 2020, when the pandemic and a devastating wildfire season pushed the average to $6,260 — but the broader direction remained unmistakable.\n\nOver time the curve became a defining feature of Napa Valley's agricultural economy. Growers planted vineyards assuming the trend would continue. Wineries structured long-term grape contracts around rising fruit costs. Banks financed vineyard development using projections that incorporated the same trajectory.\n\nAcross multiple historical periods, Napa cabernet prices expanded at a compound annual growth rate between 4.7% and 6.9%. The long-run rate from 1976 to 2023 was 6.6% per year. The more recent period from 2011 to 2019 ran at 6.9% annually. Even the conservative modern period from 2000 to 2023 compounded at 4.75% per year. These rates reflect different historical windows — each a reasonable benchmark depending on when a grower planted, borrowed or signed a contract.\n\nThose are not abstract statistics. They are the numbers embedded in loan covenants, vineyard appraisals and long-term supply contracts across the valley.`, chart:{ component:Chart1, title:"Weighted Average Price, Napa County Cabernet Sauvignon (1976–2025)", caption:"The weighted average price rose from $461 per ton in 1976 to a record $9,235 in 2023 before falling to $8,933 in 2025 — the first two-year consecutive decline in the modern data series. Source: CDFA·USDA-NASS Grape Crush Reports, Table 6, District 4. 2025 preliminary." } },
  { id:"gap", heading:"The Expectation Gap", body:`The weighted average price of Napa County cabernet sauvignon peaked at $9,235 per ton in 2023. It slipped to $9,146 in 2024 and to $8,933 in 2025. Two consecutive years of decline have not occurred in the modern crush report era.\n\nIf the historical price trajectory is projected forward from the 2023 peak using any of the growth rates observed in prior expansion periods, the expected price of Napa cabernet in 2025 would fall well above current levels.\n\nUsing the long-run 1976-2023 growth rate of 6.6%, the projected 2025 price would be approximately $10,492 per ton. Using the recent 2011-2019 rate of 6.9%, the projection rises to roughly $11,847. Even the most conservative projection, using the 2000-2023 rate of 4.75%, produces an expected price of about $10,134.\n\nThe actual 2025 price of $8,933 falls $1,200 to $2,900 per ton below where any of those trajectories would predict — an expectation gap of 13% to 33% depending on the benchmark used.\n\nFor a vineyard block producing three tons per acre, the difference between the 2023 peak and the 2025 price represents roughly $900 in lost gross revenue per acre. Multiplied across thousands of vineyard acres, the scale of the shift becomes clearer. As we detailed in \u201cUnder the Hood: The Dismal Math of Napa\u2019s Skipped Acres\u201d (November 2025), even modest per-acre revenue shifts propagate through wages, suppliers and local government revenues over a multi-year period.`, chart:{ component:Chart2, title:"The Napa Cabernet Expectation Gap: Projected vs. Actual 2025 Price", caption:"All three projection lines anchor at their respective base periods. The red dashed line — the 2011–2019 expansion rate of 6.9% per year projected from the 2019 base of $7,941 — represents the trajectory most likely embedded in contracts and vineyard loans signed during that period. The actual 2025 price of $8,933 falls $1,200 to $2,900 below any projection. Source: CDFA·USDA-NASS Grape Crush Reports, 1976–2025; Napa Valley Features compound-growth analysis." } },
  { id:"max", heading:"The Maximum Price Signal", body:`Another indicator warrants attention: the highest price paid for any individual lot of Napa cabernet sauvignon.\n\nDuring the expansion years, the maximum price paid rose alongside the weighted average, reinforcing the expectation that the top of the market would continue appreciating. The record price reached $69,125 per ton in 2024. In 2025 it retreated to $67,200 — matching the 2023 record rather than surpassing it.\n\nTaken alone, a single-year movement in the maximum price is not conclusive. But the flattening of the maximum price at the same moment the weighted average has begun declining suggests the speculative premium at the top of the market may be losing momentum alongside the broader average. As we highlighted in \u201cNapa Valley Grape Prices See Continued Surge in 2023\u201d (February 2024), outlier transactions — lots trading above $60,000 per ton — represented a small share of total tonnage but exerted an outsized influence on market sentiment and vineyard valuations.\n\nIf those transactions no longer set new records, that signal is worth watching.`, chart:{ component:Chart3, title:"Weighted Average vs. Maximum Price Paid, Napa Cabernet Sauvignon (2015–2025)", caption:"The maximum price reached $69,125 per ton in 2024 before retreating to $67,200 in 2025. Both the average and the maximum are now declining or flat simultaneously. Source: CDFA·USDA-NASS Grape Crush Reports, Tables 6 and 8. 2025 preliminary." } },
  { id:"market", heading:"A Market That Once Protected Prices", body:`For years the Napa grape market contained mechanisms that helped sustain the long-term price trajectory even when demand softened. Growers and wineries often shared a common incentive to protect the county's reported average price. When supply temporarily exceeded demand, fruit was sometimes left unpicked rather than sold at prices that might drag down the weighted average in the crush report. That approach helped preserve the appearance of stability during earlier cycles.\n\nThe 2024 harvest report, which we explored in \u201cUnder the Hood: 2024 Harvest Report Reveals a Market Splitting in Two\u201d (February 2025), revealed a market already bifurcating: ultra-premium buyers remained engaged while mid-tier demand contracted sharply. Cabernet sauvignon tonnage fell 23% even as the weighted average price held near the 2023 peak — a signal that supply constraints, not demand strength, were doing much of the work to sustain reported prices.\n\nThe 2025 data confirm the floor is giving way. The weighted average has now declined for two consecutive years despite Napa tonnage holding relatively steady.\n\nThe contracts that once locked in Napa\u2019s premium are now contested terrain. A Napa Valley grower with nearly three decades of experience, who requested anonymity, said wineries have recently begun walking away from long-standing agreements — in some cases deals that had been in place for years. The grower said he is now preparing to pursue legal action against several buyers.\n\n\u201cIf they think they can just walk away,\u201d he said, \u201cthen we\u2019ll see them in court.\u201d`, chart:null },
  { id:"context", heading:"Napa in Context: A Five-Varietal, Three-County Comparison", body:`The 2025 preliminary crush report allows a direct comparison of weighted average grower returns across five key varietals in three North Coast districts: Lake County (District 2), Sonoma County (District 3) and Napa County (District 4).\n\nFor Cabernet Sauvignon, the gap remains wide. Napa growers received a weighted average of $8,933 per ton in 2025 — 3.2 times the Sonoma average of $2,772 and 7.6 times the Lake County average of $1,171.\n\nPinot Noir tells a different story. Sonoma County growers received $3,817 per ton for Pinot Noir in 2025 — roughly a third more than the Napa average of $2,867 for the same variety. Napa's brand premium, which is deeply embedded in the Cabernet market, does not extend uniformly across varietals. The market has already made its judgment: Sonoma owns Pinot Noir.\n\nThe Lake County Chardonnay figure deserves particular attention: it fell from $965 per ton in 2023 to $288 in 2025 — a collapse of roughly 70% in two years, illustrating the severity of the pressure facing lower-tier appellations. Industry analysts note this figure may be influenced by thin volume and intra-company transfer pricing; the final report due April 30 may revise it.\n\nOne important caveat: Turrentine Brokerage's North Coast analyst noted that district average prices in the crush report are not representative of spot market prices for new contracts for the second consecutive year. The district averages blend older multi-year contracts signed at higher prices with new deals negotiated in current market conditions.`, chart:{ component:Chart4, title:"Weighted Average Grower Returns per Ton by Varietal and District, 2025 (Preliminary)", caption:"Napa County commands a 3.2x premium over Sonoma for Cabernet Sauvignon. Pinot Noir is the exception: Sonoma growers received $3,817 per ton versus $2,867 for Napa. Note: Cab Franc Napa ($11,131) reflects thin volume. District averages blend multi-year contracts with spot deals. Source: CDFA·USDA-NASS Preliminary 2025 Grape Crush Report, Table 6." } },
  { id:"varietal-change", heading:null, body:`All five Napa varietals examined declined from their 2023 levels to 2025, with the exception of Cabernet Franc, which rose 4.7% — a figure that reflects a thin market where a handful of transactions at very high prices can swing the district average, not broad-based strengthening. Cabernet Sauvignon fell 3.3%, Pinot Noir fell 2.4%, Sauvignon Blanc fell 0.7% and Chardonnay fell 0.4%.`, chart:{ component:Chart5, title:"Napa County Price Change by Varietal, 2023 to 2025 (Preliminary)", caption:"Four of five key Napa varietals declined from their 2023 levels. Cab Franc's 4.7% rise reflects thin volume with a small number of high-priced lots. Source: CDFA·USDA-NASS Grape Crush Reports, Table 6, District 4; Napa Valley Features analysis." } },
  { id:"economics", heading:"The Economics Facing Growers", body:`The changing price trajectory arrives at a moment when vineyard economics are already under severe pressure.\n\nLabor, farming inputs and financing costs have all increased in recent years, narrowing margins for many growers. As we showed in \u201cUnder the Hood: The Dismal Math of Napa\u2019s Skipped Acres\u201d (November 2025), the economic impact of leaving vineyards unfarmed or pulling them out extends far beyond the grower\u2019s ledger. At a typical Napa yield of three tons per acre and a price near $8,933, each acre generates roughly $26,800 in gross revenue before harvest and hauling costs. A $1,000 decline in the per-ton price reduces that by $3,000 per acre — a meaningful shift when multiplied across hundreds or thousands of acres.\n\nThe per-acre math compounds through the broader economy. Each dollar of Napa grape value supports roughly $10.30 in local economic activity when traced through wineries, suppliers, tourism and household spending. A sustained price decline does not simply reduce grower income — it attenuates a multiplier that runs through the county\u2019s entire economic structure.\n\nNapa\u2019s 2023 GDP was approximately $14.2 billion. Wine and grapes influence an estimated 75% of that. In that context, the price trajectory of a single varietal carries consequences that reach well beyond the farm gate.\n\nThe overproduction context amplifies the concern. As we detailed in \u201cUnder the Hood: Wine Overproduction Scenarios Suggest Tougher Days Ahead\u201d (October 2025), even under the most optimistic scenarios for demand recovery and supply adjustment, California\u2019s wine industry faces the prospect of meaningful surplus through the end of the decade. The bulk wine market — which Turrentine Brokerage estimates carries close to 40 million gallons of inventory — continues to suppress grape demand at the source.`, chart:null },
  { id:"structural", heading:"A Structural Shift Emerging", body:`For decades Napa Valley\u2019s vineyard economy expanded under the assumption that the historical price curve would continue, even accelerate. Several forces are now challenging that assumption simultaneously.\n\nWine consumption has softened. Younger consumers are drinking less wine than previous generations. A recent 2025 Gallup poll found that only 54% of U.S. adults drink alcohol, the lowest level Gallup has recorded in its nearly 90 years of tracking alcohol consumption. Per-capita wine consumption and total wine consumption are now declining together for the first time in modern history — ending the demographic cushion that once allowed producers to absorb soft years without structural damage.\n\nThe capital that fueled vineyard expansion during the 2010s has become more expensive. Interest rates rose, and the easy financing that underpinned land valuations built on expected price appreciation is no longer available on the same terms. Recent vineyard sales in Napa have drawn buyers framing land as a hedge against dollar volatility — not a bet on local wine demand.\n\nAt the same time, the contracts that once locked in Napa\u2019s premium are now under pressure. Some wineries are walking away from agreements that growers say were binding. The legal battles now brewing in the valley represent a direct confrontation between two sets of assumptions — the growers\u2019 assumption that the contracts and the prices they reflected were durable, and the wineries\u2019 calculation that the market has changed enough to justify exit.\n\nThe growers who took on debt, expanded acreage or planted new blocks under the historical growth assumptions are now facing a gap between what those assumptions implied and what the market is delivering. That gap, measured in dollars per ton and extrapolated across acres and years, is not a rounding error. It is the difference between a viable operation and a distressed one.\n\nTaken together, these forces point to a market that has entered a different phase of its economic cycle — one where the growth curve that shaped Napa Valley for nearly half a century can no longer be taken for granted.`, chart:null },
];

const RELATED = [
  { title:"Under the Hood: 2024 Harvest Report Reveals a Market Splitting in Two", date:"Feb. 15, 2025", url:"https://napavalleyfocus.substack.com/p/under-the-hood-2024-harvest-report" },
  { title:"Under the Hood: Wine Overproduction Scenarios Suggest Tougher Days Ahead", date:"Oct. 25, 2025", url:"https://napavalleyfocus.substack.com/p/1-wine-overproduction-the-math-of" },
  { title:"Under the Hood: The Dismal Math of Napa's Skipped Acres", date:"Nov. 29, 2025", url:"https://napavalleyfocus.substack.com/p/1-wine-overproduction-the-math-of" },
  { title:"Napa Valley Grape Prices See Continued Surge in 2023", date:"Feb. 12, 2024", url:"https://napavalleyfocus.substack.com/p/napa-valley-grape-prices-see-continued" },
  { title:"Sonoma Grape Prices Fall for a Second Year as Cab Sauv Leads the Decline", date:"Sonoma County Features", url:"/under-the-hood/sonoma-cab-2025" },
  { title:"Lake County Grape Prices Have Fallen 38% in Two Years — and Chardonnay Has Nearly Vanished", date:"Lake County Features", url:"/under-the-hood/lake-county-cab-2025" },
  { title:"Napa\u2019s Economy Looks Bigger Than It Is", date:"Napa Valley Features", url:"/under-the-hood/napa-gdp-2024" },
];

const SOURCES = [
  { label:"Preliminary 2025 California Grape Crush Report (USDA-NASS PDF)", url:"https://www.nass.usda.gov/Statistics_by_State/California/Publications/Specialty_and_Other_Releases/Grapes/Crush/Prelim/2025/Grape_Crush_2025_Prelim.pdf?_bhlid=6472a29e92e45a592256c214078b5a91631ff0f2" },
  { label:"USDA-NASS Grape Crush Reports Index — all years", url:"https://www.nass.usda.gov/Statistics_by_State/California/Publications/Specialty_and_Other_Releases/Grapes/Crush/Reports/index.php" },
  { label:"Turrentine Brokerage 2025 market assessment (via Wine Business Monthly)", url:"https://www.winebusiness.com/news/link/315186" },
  { label:"Wine-Searcher: California Grape Crush Hits 30-Year Low — W. Blake Gray, March 13, 2026", url:"https://www.wine-searcher.com/m/2026/03/california-grape-crush-hits-30-year-low" },
  { label:"Press Democrat: North Coast wine grape crop value slips to $1.33 billion — March 16, 2026", url:"https://www.pressdemocrat.com/2026/03/16/sonoma-napa-mendocino-lake-wine-grape-crush-report/" },
];

// ─── main component ───────────────────────────────────────────────────────────
export default function UnderTheHood() {
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    if (window.Chart) { setChartReady(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    s.onload = () => setChartReady(true);
    document.head.appendChild(s);
  }, []);

  const prose   = { fontFamily:"'Source Sans 3', sans-serif", fontSize:17, color:T.ink, lineHeight:1.75, margin:"0 0 18px 0" };
  const heading = { fontFamily:"'Libre Baskerville', serif", fontSize:22, fontWeight:700, color:T.ink, margin:"40px 0 16px 0" };
  const h2style = { fontFamily:"'Libre Baskerville', serif", fontSize:20, fontWeight:700, color:T.ink, margin:"0 0 16px 0" };

  return (
    <div style={{ background:T.bg, minHeight:"100vh" }}>
      <NavBar />

      {/* Masthead */}
      <div style={{ background:"#2C1810", color:"#F5F0E8", textAlign:"center", fontFamily:"monospace", fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", padding:"10px 24px" }}>
        Napa Valley Features &nbsp;·&nbsp; Under the Hood &nbsp;·&nbsp; March 2026
      </div>

      {/* Header */}
      <div style={{ maxWidth:780, margin:"0 auto", padding:"48px 24px 32px" }}>
        <div style={{ fontFamily:"monospace", fontSize:14, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C4A050", marginTop:32, marginBottom:16 }}>
          Under the Hood &nbsp;·&nbsp; Napa Valley Features
        </div>
        <h1 style={{ fontFamily:"'Libre Baskerville', serif", fontWeight:700, fontSize:"clamp(26px, 5vw, 42px)", color:"#2C1810", lineHeight:1.15, marginBottom:20 }}>
          Napa Cabernet Prices Break the Growth Curve
        </h1>
        <p style={{ fontFamily:"'Source Sans 3', sans-serif", fontWeight:300, fontSize:17, lineHeight:1.65, color:"#5C4033", marginBottom:24 }}>
          The weighted average price of Napa County cabernet sauvignon has declined for two consecutive years — the first such decline in the modern data series. This interactive edition includes six data visualizations and live reader polls.
        </p>
        <div style={{ borderTop:"1px solid #D4C4A8", paddingTop:14 }}>
          <div style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:"#8B7355" }}>
            By Tim Carl &nbsp;·&nbsp; Napa Valley Features &nbsp;·&nbsp; March 19, 2026
          </div>
          <div style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.1em", color:"#8B7355", fontStyle:"italic", marginTop:4 }}>
            Live data from the NapaServe Community Data Commons &nbsp;·&nbsp; CDFA·USDA-NASS Grape Crush Report
          </div>
          <a href="https://napavalleyfocus.substack.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily:"'Source Sans 3', sans-serif", fontSize:14, fontWeight:400, color:T.accent, textDecoration:"none", textTransform:"none", letterSpacing:"normal", display:"inline-block", marginTop:12 }}>
            Read on Napa Valley Features · Substack →
          </a>
        </div>
      </div>

      {/* article body */}
      <div style={{ maxWidth:780, margin:"0 auto", padding:"0 24px" }}>

        {SECTIONS.map(section => (
          <div key={section.id}>
            {section.heading && <h2 style={heading}>{section.heading}</h2>}
            {section.body.split("\n\n").map((para, i) => (
              <p key={i} style={prose}>{para}</p>
            ))}
            {section.id === "varietal-change" && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"1px", background:T.border, border:`1px solid ${T.border}`, margin:"40px 0" }}>
                <div style={{ background:"#FAF8F5", padding:"20px 16px", textAlign:"center" }}>
                  <span style={{ fontFamily:"'Libre Baskerville', serif", fontSize:28, fontWeight:700, color:T.accent, lineHeight:1, marginBottom:6, display:"block" }}>{"\u2212"}3.6%</span>
                  <span style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase", color:T.muted, lineHeight:1.4, display:"block" }}>Cab Sauv<br/>2023–2025</span>
                </div>
                <div style={{ background:"#FAF8F5", padding:"20px 16px", textAlign:"center" }}>
                  <span style={{ fontFamily:"'Libre Baskerville', serif", fontSize:28, fontWeight:700, color:T.accent, lineHeight:1, marginBottom:6, display:"block" }}>{"\u2212"}2.4%</span>
                  <span style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase", color:T.muted, lineHeight:1.4, display:"block" }}>Pinot Noir<br/>2023–2025</span>
                </div>
                <div style={{ background:"#FAF8F5", padding:"20px 16px", textAlign:"center" }}>
                  <span style={{ fontFamily:"'Libre Baskerville', serif", fontSize:28, fontWeight:700, color:T.accent, lineHeight:1, marginBottom:6, display:"block" }}>+4.7%</span>
                  <span style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase", color:T.muted, lineHeight:1.4, display:"block" }}>Cab Franc<br/>2023–2025</span>
                </div>
              </div>
            )}
            {section.id === "varietal-change" && (
              <p style={prose}>The chart below breaks down the price change by varietal from 2023 to 2025.</p>
            )}
            {section.chart && chartReady && (
              <ChartBox title={section.chart.title} caption={section.chart.caption}>
                <section.chart.component />
              </ChartBox>
            )}
            {section.chart && !chartReady && (
              <div style={{ background:T.surface, borderRadius:8, padding:32, margin:"32px 0", textAlign:"center", color:T.muted, fontFamily:"'Source Sans 3',sans-serif", fontSize:14 }}>Loading chart...</div>
            )}
          </div>
        ))}

        {/* ── Verified pullquote ──────────────────────────── */}
        <div style={{ borderLeft: `3px solid ${T.accent}`, padding: "4px 0 4px 24px", margin: "36px 0" }}>
          <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontStyle: "italic", lineHeight: 1.5, color: T.ink, marginBottom: 8 }}>
            {"\u201C"}District average prices throughout the North Coast are not representative of the spot market prices for new contracts for the second consecutive year.{"\u201D"}
          </p>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: T.muted }}>
            {"\u2014"} Christian Klier, North Coast, Turrentine Brokerage, <a href="https://www.winebusiness.com/content/file/2025_Crush_Report_Press_Release(1).pdf" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>{"\u201C"}The 2025 Crop Was Down an Equivalent of 72 Million Cases From the Five-Year Average,{"\u201D"}</a> Wine Business, March 13, 2026.
          </div>
        </div>

        {/* ── The Broader Picture ─────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "40px 0 32px" }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: T.muted, whiteSpace: "nowrap" }}>The Broader Picture</span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        <p style={prose}>
          The statewide picture offers context. California crushed 2.62 million tons in 2025 {"\u2014"} 8% below 2024 and 23% below the five-year average of 3.6 million tons, the lightest harvest since 1999. For the wine industry overall, that reduction in supply is welcome. {"\u201C"}The decrease in tons is still very positive news for the industry overall,{"\u201D"} said Steve Fredricks, president of <a href="https://www.turrentinebrokerage.com" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Turrentine Brokerage</a>, in a March 13, 2026 market assessment. But Turrentine{"\u2019"}s own North Coast analyst flagged a critical caveat: published district averages overstate what growers negotiating new contracts actually receive. Napa Valley was a relative outlier: Cabernet Sauvignon tonnage declined only 1.3% from 2024, less than the industry had expected, and Napa maintained the highest district average price in California at $6,767 per ton. But even in Napa, Turrentine{"\u2019"}s North Coast analyst noted that district averages are not representative of spot market prices for new contracts.
        </p>

        <p style={prose}>
          For consumers, the dynamics are mixed. A lighter harvest and lower grape prices can eventually translate to more accessible wine at retail {"\u2014"} but that benefit moves slowly through the supply chain, and only if growers remain solvent long enough to plant and tend future vintages. The more immediate market signal is a shift toward lighter white varieties: Sauvignon Blanc tonnage increased 22,000 tons statewide in 2025 and Pinot Gris rose 8,000 tons, even as red varieties contracted sharply. Audra Cooper, vice president at Turrentine, described the season as representing {"\u201C"}continued challenges for growers and wineries that were strikingly apparent at harvest.{"\u201D"}
        </p>

        {/* polls */}
        <PollsSection />

        {/* related coverage */}
        <div style={{ borderTop:`2px solid ${T.border}`, marginTop:48, paddingTop:32 }}>
          <h2 style={h2style}>Related Coverage From Napa Valley Features</h2>
          {RELATED.map(item => (
            <a key={item.title} href={item.url} target="_blank" rel="noreferrer"
              style={{ display:"block", padding:"16px 0", borderBottom:`1px solid ${T.border}`, textDecoration:"none" }}>
              <p style={{ fontFamily:"'Source Sans 3', sans-serif", fontSize:15, color:T.accent, fontWeight:600, margin:"0 0 4px 0" }}>{item.title}</p>
              <p style={{ fontFamily:"'Source Sans 3', sans-serif", fontSize:13, color:T.muted, margin:0 }}>{item.date}</p>
            </a>
          ))}
        </div>

        {/* archive search */}
        <ArchiveSearch />

        {/* sources */}
        <div style={{ borderTop:`1px solid ${T.border}`, marginTop:48, paddingTop:24 }}>
          <h2 style={{ ...h2style, fontSize:16 }}>Sources</h2>
          {SOURCES.map(s => (
            <div key={s.label} style={{ marginBottom:10 }}>
              <a href={s.url} target="_blank" rel="noreferrer"
                style={{ fontFamily:"'Source Sans 3', sans-serif", fontSize:13, color:T.accent, textDecoration:"underline", lineHeight:1.5 }}>
                {s.label}
              </a>
            </div>
          ))}
        </div>

        {/* byline */}
        <div style={{ marginTop:32, padding:"20px 0", borderTop:`1px solid ${T.border}` }}>
          <p style={{ fontFamily:"'Source Sans 3', sans-serif", fontSize:14, color:T.muted, fontStyle:"italic", margin:0 }}>
            Tim Carl is a Napa Valley-based photojournalist and the founder and editor of Napa Valley Features.
            Data sourced from CDFA·USDA-NASS Grape Crush Reports. 2025 figures are preliminary pending the final report due April 30, 2026.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

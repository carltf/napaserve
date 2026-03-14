import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { buildRagContext } from "./hooks/useRag";

// ═══════════════════════════════════════════════════════════════════════════
// FRAMEWORK
// ═══════════════════════════════════════════════════════════════════════════

const PILLARS = [
  { id:"jobs", label:"Jobs", color:"#C8A96E", axes:[
    {id:"new_jobs",label:"New Durable Jobs",desc:"Net operating jobs at or above median wage"},
    {id:"wage_quality",label:"Wage Quality",desc:"Alignment with local median / self-sufficiency standard"},
    {id:"sector_risk",label:"Sector Resilience",desc:"Diversification vs concentration; cycle sensitivity"},
  ]},
  { id:"people", label:"People", color:"#7EB8A4", axes:[
    {id:"young_families",label:"Young Families",desc:"Housing affordability, school quality, childcare access"},
    {id:"current_pop",label:"Current Residents",desc:"Displacement risk, service burden, community stability"},
    {id:"elder_pop",label:"Elder Population",desc:"Fixed-income affordability, health access, mobility"},
  ]},
  { id:"place", label:"Place", color:"#9B8EC4", axes:[
    {id:"land_use",label:"Land Efficiency",desc:"Productivity per acre relative to regional scarcity"},
    {id:"fiscal_net",label:"Net Fiscal Balance",desc:"Recurring revenues vs service obligations"},
    {id:"water",label:"Water Demand",desc:"Net draw on local water supply and groundwater"},
    {id:"wildfire",label:"Wildfire Risk",desc:"Ignition potential, evacuation burden, and suppression cost"},
    {id:"biodiversity",label:"Biodiversity & Habitat",desc:"Impact on native species, wildlife corridors, and ecological function"},
  ]},
];
const ALL_AXES = PILLARS.flatMap(p=>p.axes.map(a=>({...a,pillarId:p.id,color:p.color})));

const QUESTIONS = {
  jobs:[
    {id:"j1",label:"How many permanent (not construction) jobs does this create?",type:"number",placeholder:"e.g. 25",key:"perm_jobs"},
    {id:"j2",label:"What share of those jobs pay at or above Napa's median wage ($52/hr / $109K year)?",type:"select",options:[{value:"most",label:"Most (75%+)"},{value:"half",label:"About half"},{value:"some",label:"Some (25%)"},{value:"few",label:"Few or none"}],key:"wage_share"},
    {id:"j3",label:"Are these jobs year-round or seasonal?",type:"select",options:[{value:"year_round",label:"Year-round, full-time"},{value:"mostly",label:"Mostly year-round with slow periods"},{value:"seasonal",label:"Seasonal (harvest, tourism peaks)"}],key:"durability"},
    {id:"j4",label:"Does this diversify Napa's economy beyond wine and hospitality?",type:"select",options:[{value:"yes",label:"Yes — new sector (tech, healthcare, manufacturing)"},{value:"adjacent",label:"Adjacent — related but different (ag-tech, culinary innovation)"},{value:"same",label:"Same sector — more wine/hospitality"}],key:"diversification"},
    {id:"j5",label:"Does this project include a plan to develop local workforce skills?",type:"select",options:[{value:"strong_plan",label:"Yes — training pipeline, apprenticeships, or upskilling programs included"},{value:"some_plan",label:"Some commitment — partnerships with local schools or workforce agencies"},{value:"existing_skills",label:"No plan needed — matches existing local hospitality/service skills"},{value:"no_plan",label:"No plan — requires specialized skills with no local development path"}],key:"workforce_dev"},
  ],
  people:[
    {id:"p1",label:"Does this project increase or decrease housing costs nearby?",type:"select",options:[{value:"decrease",label:"Adds affordable units — helps reduce costs"},{value:"neutral",label:"No significant effect on housing costs"},{value:"increase",label:"Likely pushes rents or prices up"}],key:"housing_cost"},
    {id:"p2",label:"Does it displace anyone currently living or working on the site?",type:"select",options:[{value:"no",label:"No — vacant or underused land"},{value:"some",label:"Some displacement, but alternatives exist"},{value:"yes",label:"Yes — residents, businesses, or farmworkers displaced"}],key:"displacement"},
    {id:"p3",label:"Does it include childcare, transit, or workforce services?",type:"select",options:[{value:"multiple",label:"Multiple services (childcare + transit, etc.)"},{value:"one",label:"One support service included"},{value:"none",label:"No support services"}],key:"services"},
    {id:"p4",label:"How does it affect seniors on fixed incomes?",type:"select",options:[{value:"helps",label:"Directly helpful — healthcare, affordable housing, mobility"},{value:"neutral",label:"No direct impact on seniors"},{value:"burden",label:"Could increase costs or reduce access"}],key:"elder_impact"},
    {id:"p5",label:"Does it increase or reduce demand on public services?",type:"select",options:[{value:"reduces",label:"Reduces demand or directly funds services"},{value:"neutral",label:"Roughly neutral on public services"},{value:"increases",label:"Adds significant demand without funding"}],key:"service_demand"},
  ],
  place:[
    {id:"l1",label:"How many acres does this use?",type:"number",placeholder:"e.g. 5",key:"acreage"},
    {id:"l2",label:"What's currently on the site?",type:"select",options:[{value:"vacant",label:"Vacant lot or abandoned/derelict building"},{value:"existing_bldg",label:"Existing building being repurposed or renovated"},{value:"ag_low",label:"Low-productivity agriculture"},{value:"ag_active",label:"Active vineyard or farmland"},{value:"open_space",label:"Open space, habitat, or watershed"}],key:"current_use"},
    {id:"l3",label:"Will it generate more tax revenue than it costs in services?",type:"select",options:[{value:"strong_positive",label:"Strong net positive — significant tax base"},{value:"slight_positive",label:"Slight net positive"},{value:"neutral",label:"Roughly break-even"},{value:"negative",label:"Net cost to the county"}],key:"fiscal"},
    {id:"l4",label:"Does it require new roads, water, or sewer infrastructure?",type:"select",options:[{value:"none",label:"Uses existing infrastructure"},{value:"minor",label:"Minor upgrades needed"},{value:"major",label:"Significant new infrastructure required"}],key:"infrastructure"},
    {id:"l5",label:"How much water will this project demand?",type:"select",options:[{value:"reduces",label:"Reduces net water use"},{value:"minimal",label:"Minimal — low-water design, drought-tolerant landscaping"},{value:"moderate",label:"Moderate — typical commercial/residential demand"},{value:"heavy",label:"Heavy — pools, irrigation, processing, or high occupancy"}],key:"water_demand"},
    {id:"l6",label:"Is this site in or near a high wildfire risk area?",type:"select",options:[{value:"urban",label:"Urban or low-risk area — well within city limits"},{value:"moderate",label:"Moderate risk — near wildland-urban interface"},{value:"high",label:"High risk — in or adjacent to fire-prone hillsides or canyons"},{value:"very_high",label:"Very high risk — limited evacuation routes, steep terrain"}],key:"fire_risk"},
    {id:"l7",label:"Does this project add people or activity that increases fire ignition potential?",type:"select",options:[{value:"no",label:"No — low-activity use, fire-hardened construction"},{value:"some",label:"Some — standard construction with defensible space"},{value:"yes",label:"Yes — events, outdoor activity, or construction in fire-prone area"}],key:"fire_ignition"},
    {id:"l8",label:"How does it affect local wildlife, native plants, or habitat connectivity?",type:"select",options:[{value:"positive",label:"Restores or enhances habitat — native planting, corridor preservation"},{value:"neutral",label:"Minimal impact — already developed site, standard mitigation"},{value:"negative",label:"Removes habitat, fragments corridors, or displaces wildlife"}],key:"habitat_impact"},
    {id:"l9",label:"Does it affect productive agricultural soil?",type:"select",options:[{value:"no",label:"No — non-agricultural land or already paved"},{value:"low_value",label:"Low-value agricultural soil"},{value:"prime",label:"Yes — prime farmland or high-quality vineyard soil"}],key:"soil_impact"},
  ],
};

const TOTAL_QS = Object.values(QUESTIONS).flat().length;

// ═══════════════════════════════════════════════════════════════════════════
// SCORING
// ═══════════════════════════════════════════════════════════════════════════

function calcScores(a){
  const s=[5,5,5,5,5,5,5,5,5,5,5];
  const jobs=Number(a.perm_jobs)||0;
  let j0=jobs>=100?9:jobs>=50?8:jobs>=25?7:jobs>=10?5:jobs>=1?3:1;
  if(a.durability==="seasonal")j0-=2;if(a.durability==="mostly")j0-=0.5;
  if(a.workforce_dev==="strong_plan")j0+=1.5;if(a.workforce_dev==="some_plan")j0+=0.5;
  if(a.workforce_dev==="no_plan")j0-=0.5;
  s[0]=Math.max(0,Math.min(10,j0));
  s[1]={most:9,half:6,some:3.5,few:1.5}[a.wage_share]??5;
  s[2]={yes:9,adjacent:6.5,same:3}[a.diversification]??5;
  let f3={decrease:8,neutral:5,increase:2}[a.housing_cost]??5;
  if(a.services==="multiple")f3+=2;if(a.services==="one")f3+=1;
  s[3]=Math.max(0,Math.min(10,f3));
  let r4={no:8,some:5,yes:2}[a.displacement]??5;
  if(a.service_demand==="reduces")r4+=1.5;if(a.service_demand==="increases")r4-=2;
  s[4]=Math.max(0,Math.min(10,r4));
  s[5]={helps:8.5,neutral:5,burden:2}[a.elder_impact]??5;
  let l6={existing_bldg:9,vacant:8,ag_low:6,ag_active:3,open_space:1.5}[a.current_use]??5;
  const acres=Number(a.acreage)||0;
  if(acres>50)l6-=1;if(acres<=2)l6+=1;
  if(a.infrastructure==="none")l6+=1;if(a.infrastructure==="major")l6-=2;
  if(a.soil_impact==="prime")l6-=2;if(a.soil_impact==="low_value")l6-=0.5;
  s[6]=Math.max(0,Math.min(10,l6));
  s[7]={strong_positive:9,slight_positive:7,neutral:5,negative:2}[a.fiscal]??5;
  s[8]={reduces:9.5,minimal:8,moderate:5,heavy:2}[a.water_demand]??5;
  let fire={urban:9,moderate:6,high:3,very_high:1}[a.fire_risk]??5;
  if(a.fire_ignition==="yes")fire-=1.5;if(a.fire_ignition==="no")fire+=0.5;
  s[9]=Math.max(0,Math.min(10,fire));
  let bio={positive:9,neutral:5.5,negative:2}[a.habitat_impact]??5;
  if(a.soil_impact==="prime")bio-=1;
  s[10]=Math.max(0,Math.min(10,bio));
  return s.map(v=>Math.round(v*2)/2);
}

function getRating(scores){
  const pa=[[0,3],[3,6],[6,11]].map(([s,e])=>{const sl=scores.slice(s,e);return sl.reduce((a,b)=>a+b,0)/sl.length;});
  const avg=pa.reduce((a,b)=>a+b,0)/3,mn=Math.min(...pa);
  if(avg>=7.5&&mn>=6)return{label:"Strong",color:"#3A6A4A",desc:"Net positive across all three pillars with manageable risks"};
  if(avg>=6&&mn>=4.5)return{label:"Moderate",color:"#C8A96E",desc:"Net positive in at least two pillars, addressable gaps in the third"};
  if(avg>=4.5&&mn>=3)return{label:"Weak-to-Moderate",color:"#D4935A",desc:"Real benefits offset by concentration, mismatch, or fiscal uncertainty"};
  if(avg>=3)return{label:"Weak",color:"#B85C38",desc:"Benefits do not outweigh structural liabilities under current design"};
  return{label:"Misaligned",color:"#8B3A3A",desc:"Worsens regional resilience with no clear modification pathway"};
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPASS CANVAS
// ═══════════════════════════════════════════════════════════════════════════

function polar(angle,r,cx,cy){
  const rad=(angle-90)*Math.PI/180;
  return{x:cx+r*Math.cos(rad),y:cy+r*Math.sin(rad)};
}

function drawCompass(canvas,scores){
  const ctx=canvas.getContext("2d");
  const size=380,cx=size/2,cy=size/2;
  const oR=size/2-62,cR=20;
  const n=ALL_AXES.length,step=360/n;
  const rr=v=>cR+(v/10)*(oR-cR);
  ctx.clearRect(0,0,size,size);

  const bgGrad=ctx.createRadialGradient(cx,cy,0,cx,cy,oR+40);
  bgGrad.addColorStop(0,"#EDE8DE");bgGrad.addColorStop(1,"#E6E0D4");
  ctx.beginPath();ctx.arc(cx,cy,oR+42,0,Math.PI*2);
  ctx.fillStyle=bgGrad;ctx.fill();
  ctx.strokeStyle="rgba(44,24,16,0.15)";ctx.lineWidth=1;ctx.stroke();

  [2,4,6,8,10].forEach(v=>{
    ctx.beginPath();ctx.arc(cx,cy,rr(v),0,Math.PI*2);
    ctx.strokeStyle=v===10?"rgba(44,24,16,0.2)":"rgba(44,24,16,0.08)";
    ctx.lineWidth=v===10?0.8:0.5;
    if(v!==10){ctx.setLineDash([3,3]);}else{ctx.setLineDash([]);}
    ctx.stroke();ctx.setLineDash([]);
  });

  ALL_AXES.forEach((_,i)=>{
    const o=polar(i*step,oR,cx,cy),ni=polar(i*step,cR,cx,cy);
    ctx.beginPath();ctx.moveTo(ni.x,ni.y);ctx.lineTo(o.x,o.y);
    ctx.strokeStyle="rgba(44,24,16,0.1)";ctx.lineWidth=0.6;ctx.stroke();
  });

  let axIdx=0;
  PILLARS.forEach(p=>{
    const s=axIdx,e=axIdx+p.axes.length-1;
    const sa=(s*step-step/2-90)*Math.PI/180;
    const ea=(e*step+step/2-90)*Math.PI/180;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,oR,sa,ea);ctx.closePath();
    ctx.fillStyle=p.color+"0A";ctx.fill();
    axIdx+=p.axes.length;
  });

  ctx.beginPath();
  ALL_AXES.forEach((_,i)=>{
    const p=polar(i*step,rr(5),cx,cy);
    i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);
  });
  ctx.closePath();
  ctx.strokeStyle="rgba(141,167,190,0.5)";ctx.lineWidth=1;
  ctx.setLineDash([4,3]);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle="rgba(141,167,190,0.06)";ctx.fill();

  ctx.beginPath();
  scores.forEach((v,i)=>{
    const p=polar(i*step,rr(v),cx,cy);
    i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);
  });
  ctx.closePath();
  ctx.fillStyle="rgba(139,94,60,0.14)";ctx.fill();
  ctx.strokeStyle="#8B5E3C";ctx.lineWidth=2;ctx.stroke();

  scores.forEach((v,i)=>{
    const p=polar(i*step,rr(v),cx,cy);
    ctx.beginPath();ctx.arc(p.x,p.y,3.5,0,Math.PI*2);
    ctx.fillStyle="#8B5E3C";ctx.fill();
    ctx.strokeStyle="#EDE8DE";ctx.lineWidth=1.5;ctx.stroke();
  });

  ctx.beginPath();ctx.arc(cx,cy,cR,0,Math.PI*2);
  ctx.fillStyle="#EDE8DE";ctx.fill();
  ctx.strokeStyle="rgba(139,94,60,0.3)";ctx.lineWidth=0.8;ctx.stroke();
  ctx.beginPath();ctx.arc(cx,cy,4,0,Math.PI*2);
  ctx.fillStyle="#8B5E3C";ctx.fill();

  [0,90,180,270].map(d=>({d,i:polar(d,oR+20,cx,cy),o:polar(d,oR+28,cx,cy),l:polar(d,oR+38,cx,cy)})).forEach(({d,i,o,l})=>{
    ctx.beginPath();ctx.moveTo(i.x,i.y);ctx.lineTo(o.x,o.y);
    ctx.strokeStyle="rgba(139,94,60,0.5)";ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle="rgba(139,94,60,0.6)";ctx.font="bold 8px monospace";ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText({0:"N",90:"E",180:"S",270:"W"}[d],l.x,l.y);
  });

  ctx.beginPath();ctx.arc(cx,cy,oR+28,0,Math.PI*2);
  ctx.strokeStyle="rgba(139,94,60,0.2)";ctx.lineWidth=0.5;ctx.stroke();

  ALL_AXES.forEach((ax,i)=>{
    const angle=i*step,lp=polar(angle,oR+20,cx,cy);
    let anc="center";
    if(angle>20&&angle<160)anc="left";
    if(angle>200&&angle<340)anc="right";
    const words=ax.label.split(" ");
    const half=Math.ceil(words.length/2);
    const l1=words.slice(0,half).join(" ");
    const l2=words.length>1?words.slice(half).join(" "):null;
    ctx.fillStyle="rgba(44,24,16,0.55)";ctx.font="7px monospace";ctx.textAlign=anc;ctx.textBaseline="middle";
    ctx.fillText(l1,lp.x,lp.y-(l2?5:0));
    if(l2)ctx.fillText(l2,lp.x,lp.y+6);
  });

  axIdx=0;
  PILLARS.forEach(p=>{
    const mid=axIdx+Math.floor(p.axes.length/2);
    const mp=polar(mid*step,oR-18,cx,cy);
    ctx.fillStyle=p.color+"55";ctx.font="bold 7px monospace";
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText(p.label.toUpperCase(),mp.x,mp.y);
    axIdx+=p.axes.length;
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLES
// ═══════════════════════════════════════════════════════════════════════════

const EXAMPLES = {
  resort:{name:"75-Room Resort · St. Helena",desc:"Proposed 75-room luxury resort and spa on approximately 12 acres in St. Helena. Includes restaurant, event venue, and wine tasting facility.",answers:{perm_jobs:"120",wage_share:"some",durability:"seasonal",diversification:"same",workforce_dev:"no_plan",housing_cost:"increase",displacement:"some",services:"one",elder_impact:"neutral",service_demand:"increases",acreage:"12",current_use:"ag_active",fiscal:"slight_positive",infrastructure:"minor",water_demand:"heavy",fire_risk:"moderate",fire_ignition:"yes",habitat_impact:"neutral",soil_impact:"prime"}},
  housing:{name:"Workforce Housing · American Canyon",desc:"Mixed-income residential development with 200 units, 30% affordable to households earning 80% AMI or below. Adjacent to transit corridor.",answers:{perm_jobs:"15",wage_share:"half",durability:"year_round",diversification:"adjacent",workforce_dev:"some_plan",housing_cost:"decrease",displacement:"no",services:"multiple",elder_impact:"helps",service_demand:"neutral",acreage:"4",current_use:"vacant",fiscal:"slight_positive",infrastructure:"minor",water_demand:"moderate",fire_risk:"urban",fire_ignition:"no",habitat_impact:"neutral",soil_impact:"no"}},
  agtech:{name:"Ag-Tech Incubator · Napa",desc:"15,000 sq ft innovation hub for agricultural technology startups focused on sustainable viticulture, precision irrigation, and climate adaptation.",answers:{perm_jobs:"40",wage_share:"most",durability:"year_round",diversification:"yes",workforce_dev:"strong_plan",housing_cost:"neutral",displacement:"no",services:"one",elder_impact:"neutral",service_demand:"reduces",acreage:"2",current_use:"existing_bldg",fiscal:"strong_positive",infrastructure:"none",water_demand:"minimal",fire_risk:"urban",fire_ignition:"no",habitat_impact:"neutral",soil_impact:"no"}},
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ProjectEvaluator() {
  const [answers, setAnswers] = useState({});
  const [activePillar, setActivePillar] = useState("jobs");
  const [navOpen, setNavOpen] = useState(false);
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState("");
  const [reportText, setReportText] = useState(null);
  const [reportHtml, setReportHtml] = useState(null);
  const [reportErr, setReportErr] = useState(null);
  const [nvfSources, setNvfSources] = useState([]);

  const WORKER_RAG_URL = "https://misty-bush-fc93.tfcarl.workers.dev/api/rag-search";

  const fetchArchiveContext = async (query) => {
    try {
      const res = await fetch(WORKER_RAG_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, matchCount: 5 }),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.results || [];
    } catch {
      return [];
    }
  };
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const scores = calcScores(answers);
  const rating = getRating(scores);
  const answered = Object.keys(answers).filter(k => answers[k] !== "" && answers[k] != null).length;
  const pct = Math.round((answered / TOTAL_QS) * 100);

  useEffect(() => {
    if (canvasRef.current) drawCompass(canvasRef.current, scores);
  }, [answers]);

  const update = (key, val) => setAnswers(a => ({ ...a, [key]: val }));

  const pillarProgress = (id) => {
    const qs = QUESTIONS[id] || [];
    return { done: qs.filter(q => answers[q.key] != null && answers[q.key] !== "").length, all: qs.length };
  };

  const loadExample = (type) => {
    const ex = EXAMPLES[type];
    setProjName(ex.name);
    setProjDesc(ex.desc);
    setAnswers(ex.answers);
    setActivePillar("jobs");
    setReportText(null); setReportHtml(null); setReportErr(null);
  };

  const resetProject = () => {
    setAnswers({}); setProjName(""); setProjDesc("");
    setActivePillar("jobs");
    setReportText(null); setReportHtml(null); setReportErr(null);
  };

  const generateReport = async () => {
    if (answered < 8) return;
    setGenerating(true); setGeneratingStatus("Searching NVF archive...");
    setReportText(null); setReportHtml(null); setReportErr(null); setNvfSources([]);
    const pillarAvgs = [0,1,2].map(i => (scores.slice(i===2?6:i*3,i===2?11:i*3+3).reduce((a,b)=>a+b,0)/(i===2?5:3)).toFixed(1));
    const answerSummary = Object.entries(QUESTIONS).map(([pillar,qs]) => {
      const pl = PILLARS.find(p=>p.id===pillar)?.label||pillar;
      const lines = qs.map(q => { const v=answers[q.key]; if(v==null||v==="")return null; if(q.type==="number")return`  ${q.label} → ${v}`; const opt=q.options?.find(o=>o.value===v); return`  ${q.label} → ${opt?.label||v}`; }).filter(Boolean);
      return`${pl}:\n${lines.join("\n")}`;
    }).join("\n\n");
    const scoresSummary = PILLARS.map((p,pi)=>`${p.label}: ${p.axes.map((a,ai)=>`${a.label}=${scores[pi===2?6+ai:pi*3+ai]}`).join(", ")} (avg ${pillarAvgs[pi]})`).join("\n");
    const prompt = `You are the Valley Works Collaborative Evaluator, a structural economic analyst for Napa County. Assess the following project using the Jobs-People-Place framework.\n\nPROJECT: ${projName||"Unnamed Project"}\nDESCRIPTION: ${projDesc||"No description provided."}\n\nQUESTIONNAIRE RESPONSES:\n${answerSummary}\n\nCALCULATED COMPASS SCORES (0-10 scale):\n${scoresSummary}\n\nALIGNMENT RATING: ${rating.label} — ${rating.desc}\n\nGenerate a structured assessment report with these sections:\n\n1. SITUATION — 2-3 sentences on the current regional context this project operates within.\n\n2. STRUCTURAL CONFLICT — The underlying tension or constraint this project addresses or worsens.\n\n3. EVALUATION\n   Jobs: Assess durable employment, wage quality relative to Napa's ~$52/hr median, sector diversification, and local workforce capture.\n   People: Assess impact on young families, current residents (displacement, services), and seniors.\n   Place: Assess land use efficiency, net fiscal contribution, infrastructure needs, and environmental fit.\n\n4. KEY RISKS — Top 3-4 risks, each with a trigger condition and what to watch for.\n\n5. MODIFICATION PATHWAYS — If alignment is less than Strong, provide 2-3 specific design changes that would improve the weakest pillar scores. Be concrete.\n\n6. CONCLUSION — One-sentence counterfactual (strongest argument in favor), the alignment rating, and 2-3 conditions that would change the rating.\n\nWrite in a neutral, analytical tone. Short paragraphs. No promotional language. Reference Napa County specifics where relevant.`;

    try {
      // Step 1: RAG search — pull relevant NVF coverage
      const ragQuery = `${projName || ""} ${projDesc || ""} ${Object.values(answers).join(" ")}`.trim();
      const archiveChunks = await fetchArchiveContext(ragQuery);
      setNvfSources(archiveChunks);
      setGeneratingStatus("Generating report...");

      // Step 2: Inject archive context into prompt
      let fullPrompt = prompt;
      if (archiveChunks.length > 0) {
        const ragContext = "\n\nNAPA VALLEY FEATURES ARCHIVE — RELEVANT LOCAL COVERAGE:\n\n" +
          archiveChunks.map((chunk, i) => {
            const date = chunk.published_at
              ? new Date(chunk.published_at).toLocaleDateString("en-US", { year: "numeric", month: "short" })
              : "";
            return `[${i + 1}] "${chunk.title}" (${date})\n${chunk.chunk_text}`;
          }).join("\n\n---\n\n") +
          "\n\nWhere relevant, reference these articles by title and date in the report. Do not fabricate quotes.";
        fullPrompt = prompt + ragContext;
      }

      // Step 3: Generate report
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 3000, messages: [{ role: "user", content: fullPrompt }] }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "No response generated.";
      setReportText(text);
      setReportHtml(renderReportToHtml(text));
    } catch (err) {
      setReportErr("Failed to connect: " + err.message);
    }
    setGenerating(false); setGeneratingStatus("");
  };

  const renderReportToHtml = (text) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const t = line.trim();
      if (!t) return `<div key="${i}" style="height:10px"></div>`;
      if (/^# /.test(t)) return `<h2 key="${i}" style="font-family:'Libre Baskerville',Georgia,serif;font-size:20px;font-weight:700;color:#2C1810;margin:20px 0 6px">${t.replace(/^# /,"")}</h2>`;
      if (/^## /.test(t)) return `<h3 key="${i}" style="font-family:'Libre Baskerville',Georgia,serif;font-size:16px;font-weight:700;color:#8B5E3C;margin:18px 0 6px">${t.replace(/^## /,"")}</h3>`;
      if (/^### /.test(t)) return `<h4 key="${i}" style="font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#A89880;margin:16px 0 6px">${t.replace(/^### /,"")}</h4>`;
      const parts = t.split(/(\*\*[^*]+\*\*)/g);
      const pInner = parts.map(part => {
        if (/^\*\*(.+)\*\*$/.test(part)) {
          const inner = part.replace(/^\*\*|\*\*$/g,"");
          let c = "#2C1810";
          if (/Strong/.test(inner)) c="#3A6A4A";
          else if (/Moderate/.test(inner)) c="#C8A96E";
          else if (/Weak/.test(inner)) c="#B85C38";
          else if (/Misaligned/.test(inner)) c="#8B3A3A";
          return `<span style="font-weight:700;color:${c}">${inner}</span>`;
        }
        return part;
      }).join("");
      return `<p key="${i}" style="font-size:13px;color:#7A6A50;line-height:1.75;margin:0 0 8px">${pInner}</p>`;
    }).join("");
  };

  const copyReport = () => {
    if (!reportText) return;
    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };


  // ─── INLINE NAV ─────────────────────────────────────────────────────────────
  const Nav = () => (
    <div style={{ position: "relative" }}>
      <nav style={{ background: "#F5F0E8", borderBottom: "1px solid rgba(44,24,16,0.12)", padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20 }}>
        <a href="/" style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 19, fontWeight: 700, color: "#2C1810", textDecoration: "none" }}>NapaServe</a>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={resetProject} style={{ fontSize: 11, fontWeight: 700, color: "#8B5E3C", border: "1px solid rgba(139,94,60,0.3)", padding: "7px 12px", cursor: "pointer", background: "transparent", fontFamily: "'Source Sans 3',sans-serif", whiteSpace: "nowrap" }}>+ New Project</button>
          <button onClick={() => setNavOpen(o => !o)} style={{ background: "none", border: "1px solid rgba(44,24,16,0.12)", cursor: "pointer", padding: "7px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ display: "block", width: 18, height: 1.5, background: "#7A6A50", transform: navOpen ? "translateY(5.5px) rotate(45deg)" : "", transition: "transform .2s" }} />
            <span style={{ display: "block", width: 18, height: 1.5, background: "#7A6A50", opacity: navOpen ? 0 : 1, transition: "opacity .2s" }} />
            <span style={{ display: "block", width: 18, height: 1.5, background: "#7A6A50", transform: navOpen ? "translateY(-5.5px) rotate(-45deg)" : "", transition: "transform .2s" }} />
          </button>
        </div>
      </nav>
      {navOpen && <>
        <div onClick={() => setNavOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 19 }} />
        <div style={{ position: "fixed", top: 52, right: 0, width: 240, background: "#F5F0E8", border: "1px solid rgba(44,24,16,0.12)", borderTop: "none", boxShadow: "0 8px 24px rgba(44,24,16,0.1)", zIndex: 20, fontFamily: "'Source Sans 3',sans-serif" }}>
          {[
            { label: "Intelligence", links: [{ t: "Economic Dashboard", h: "/dashboard" }, { t: "Project Evaluator", h: "/evaluator", cur: true }, { t: "AI Policy Agent", h: "/agent.html" }] },
            { label: "Journalism", links: [{ t: "Napa Valley Features", h: "/news" }, { t: "NVF Archive Search", h: "/archive" }] },
            { label: "Community", links: [{ t: "Event Finder", h: "/events" }, { t: "Valley Works", h: "/valley-works" }] },
            { label: "Platform", links: [{ t: "About NapaServe", h: "#" }, { t: "Contact", h: "#" }] },
          ].map((g, gi) => (
            <div key={gi} style={{ padding: "10px 0", borderBottom: gi < 3 ? "1px solid rgba(44,24,16,0.12)" : "none" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "#A89880", padding: "4px 20px 6px" }}>{g.label}</div>
              {g.links.map((l, li) => (
                <a key={li} href={l.h} onClick={() => setNavOpen(false)} style={{ display: "block", fontSize: 13, fontWeight: 600, color: l.cur ? "#8B5E3C" : "#7A6A50", background: l.cur ? "#EDE8DE" : "transparent", padding: "8px 20px", textDecoration: "none" }}>{l.t}</a>
              ))}
            </div>
          ))}
        </div>
      </>}
    </div>
  );

  return (
    <div style={{ background: "#F5F0E8", minHeight: "100vh", fontFamily: "'Source Sans 3', sans-serif", color: "#2C1810" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        :root{--bg:#F5F0E8;--bg2:#EDE8DE;--bg3:#E6E0D4;--bg4:#DDD7CB;--ink:#1A0E08;--ink2:#2C1810;--accent:#8B5E3C;--gold:#C4A050;--muted:#7A6A50;--dim:#A89880;--rule:rgba(44,24,16,0.12);--live:#4A7A5A;--neg:#8A3A2A;--pos:#3A6A4A;}
        .ev-opt{text-align:left;padding:10px 14px;font-size:13px;font-family:'Source Sans 3',sans-serif;line-height:1.4;background:var(--bg);border:1px solid var(--rule);color:var(--muted);cursor:pointer;transition:all .15s;width:100%;margin-bottom:5px;}
        .ev-opt:hover{background:var(--bg3);color:var(--ink2);}
        @media(max-width:800px){.ev-grid{grid-template-columns:1fr!important;} .ev-right{order:-1;} canvas#compass{max-width:100%;height:auto!important;} .ev-grid .ev-right canvas{width:100%!important;}}
      `}</style>

      {/* NAV */}
      <Nav />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 60px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--live)", display: "inline-block" }} />
          NapaServe <span style={{ color: "var(--rule)" }}>·</span> Napa County
        </div>
        <h1 style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: "var(--ink2)", marginBottom: 4 }}>Project Evaluator</h1>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>Structural resilience analysis across the Jobs · People · Place framework.</p>

        <div style={{ background: "var(--bg2)", border: "1px solid var(--rule)", borderLeft: "3px solid var(--accent)", padding: "14px 18px", marginBottom: 18 }}>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.75 }}>Explore the costs and benefits of everything from <strong style={{ color: "var(--accent)" }}>existing development proposals</strong> to <strong style={{ color: "var(--accent)" }}>bold new ideas</strong> — a 75-room resort, a workforce housing project, an ag-tech incubator. Think of it as your own team of experts helping you <strong style={{ color: "var(--accent)" }}>make better decisions and ask better questions.</strong></p>
        </div>

        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 8 }}>Try an example project</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
          {Object.entries(EXAMPLES).map(([key, ex]) => (
            <button key={key} onClick={() => loadExample(key)} style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", background: "rgba(139,94,60,0.07)", border: "1px solid rgba(139,94,60,0.18)", padding: "6px 12px", cursor: "pointer", fontFamily: "'Source Sans 3',sans-serif" }}>
              {key === "resort" ? "75-room resort · St. Helena" : key === "housing" ? "Workforce housing · American Canyon" : "Ag-tech incubator · Napa"}
            </button>
          ))}
        </div>

        <div className="ev-grid" style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 24, alignItems: "start" }}>

          {/* LEFT */}
          <div>
            <div style={{ background: "var(--bg2)", border: "1px solid var(--rule)", padding: 20, marginBottom: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 12 }}>Project Details</div>
              <input value={projName} onChange={e => setProjName(e.target.value)} placeholder="Project name..." style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid var(--rule)", color: "var(--ink2)", fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 19, padding: "6px 0", outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
              <textarea value={projDesc} onChange={e => setProjDesc(e.target.value)} placeholder="Brief description of the project or proposal..." style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--rule)", color: "var(--ink2)", fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, padding: "10px 12px", outline: "none", resize: "vertical", minHeight: 72, lineHeight: 1.6, boxSizing: "border-box" }} />
            </div>

            <div style={{ background: "var(--bg2)", border: "1px solid var(--rule)", padding: "14px 18px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Assessment Progress</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", fontFamily: "monospace" }}>{answered} / {TOTAL_QS}</span>
              </div>
              <div style={{ height: 3, background: "var(--bg3)" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#C8A96E,#7EB8A4)", transition: "width .4s" }} />
              </div>
            </div>

            {/* Pillar tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {PILLARS.map(p => {
                const pr = pillarProgress(p.id);
                const active = activePillar === p.id;
                return (
                  <button key={p.id} onClick={() => setActivePillar(p.id)} style={{ flex: 1, padding: "10px 8px", fontSize: 13, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif", background: active ? p.color + "18" : "var(--bg2)", border: `1px solid ${active ? p.color + "55" : "var(--rule)"}`, color: active ? p.color : "var(--dim)", cursor: "pointer", textAlign: "center" }}>
                    {p.label}
                    <span style={{ display: "block", fontSize: 10, marginTop: 2, opacity: .6, fontWeight: 400 }}>{pr.done} of {pr.all} answered</span>
                  </button>
                );
              })}
            </div>

            {/* Questions */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--rule)", padding: 20 }}>
              {(QUESTIONS[activePillar] || []).map((q, qi) => {
                const isLast = qi === QUESTIONS[activePillar].length - 1;
                const pillar = PILLARS.find(p => p.id === activePillar);
                return (
                  <div key={q.id} style={{ marginBottom: isLast ? 0 : 22 }}>
                    <div style={{ fontSize: 14, color: "var(--ink2)", lineHeight: 1.55, marginBottom: 10, fontWeight: 600 }}>{q.label}</div>
                    {q.type === "number" ? (
                      <input type="number" value={answers[q.key] || ""} placeholder={q.placeholder} onChange={e => update(q.key, e.target.value)} style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--rule)", color: "var(--ink2)", fontFamily: "monospace", fontSize: 15, padding: "9px 12px", outline: "none", boxSizing: "border-box" }} />
                    ) : (
                      <div>
                        {q.options.map(opt => {
                          const sel = answers[q.key] === opt.value;
                          return (
                            <button key={opt.value} onClick={() => update(q.key, opt.value)} className="ev-opt" style={{ background: sel ? pillar.color + "15" : "var(--bg)", border: `1px solid ${sel ? pillar.color + "55" : "var(--rule)"}`, color: sel ? "var(--ink2)" : "var(--muted)" }}>
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT */}
          <div className="ev-right">
            {answered >= 5 && (
              <div style={{ background: "var(--bg2)", border: "1px solid var(--rule)", borderLeft: `3px solid ${rating.color}`, padding: "18px 20px", marginBottom: 14, textAlign: "center" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 6 }}>Alignment Rating</div>
                <div style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 26, fontWeight: 700, color: rating.color, marginBottom: 4 }}>{rating.label}</div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>{rating.desc}</div>
              </div>
            )}

            <div style={{ background: "var(--bg2)", border: "1px solid var(--rule)", padding: "12px 0 8px", marginBottom: 14, display: "flex", justifyContent: "center" }}>
              <canvas ref={canvasRef} width={380} height={380} />
            </div>

            <div style={{ display: "flex", gap: 18, justifyContent: "center", marginBottom: 16, fontSize: 11, color: "var(--dim)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 18, height: 1.5, background: "rgba(141,167,190,0.6)", borderTop: "1px dashed rgba(141,167,190,0.6)" }} />
                Regional baseline (5.0)
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 18, height: 2, background: "#8B5E3C" }} />
                Project impact
              </div>
            </div>

            {/* Axis scores */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--rule)", padding: 20, marginBottom: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 14 }}>Axis Scores</div>
              {PILLARS.map((p, pi) => {
                const pScores = p.axes.map((_, ai) => scores[pi === 2 ? 6 + ai : pi * 3 + ai]);
                const avg = (pScores.reduce((a, b) => a + b, 0) / pScores.length).toFixed(1);
                return (
                  <div key={p.id} style={{ marginBottom: pi < PILLARS.length - 1 ? 18 : 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".04em", marginBottom: 10, display: "flex", justifyContent: "space-between", color: p.color }}>
                      {p.label} <span style={{ fontSize: 10, fontWeight: 400, color: "var(--dim)" }}>({p.axes.length} dimensions)</span>
                    </div>
                    {p.axes.map((a, ai) => {
                      const v = scores[pi === 2 ? 6 + ai : pi * 3 + ai];
                      const barColor = v >= 7 ? "#3A6A4A" : v <= 3 ? "#8A3A2A" : p.color;
                      return (
                        <div key={a.id} style={{ marginBottom: 9 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink2)" }}>{a.label}</span>
                            <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace", color: p.color }}>{v}</span>
                          </div>
                          <div style={{ fontSize: 10, color: "var(--dim)", marginBottom: 3 }}>{a.desc}</div>
                          <div style={{ height: 3, background: "var(--bg3)" }}>
                            <div style={{ height: "100%", width: `${(v/10)*100}%`, background: barColor, transition: "width .5s" }} />
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ fontSize: 10, color: "var(--dim)", textAlign: "right", marginTop: 4, fontStyle: "italic" }}>pillar avg: {avg}</div>
                    {pi < PILLARS.length - 1 && <hr style={{ border: "none", borderTop: "1px solid var(--rule)", margin: "14px 0" }} />}
                  </div>
                );
              })}
            </div>

            {/* Pillar tabs (duplicate above generate button) */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {PILLARS.map(p => {
                const pr = pillarProgress(p.id);
                const active = activePillar === p.id;
                return (
                  <button key={p.id} onClick={() => setActivePillar(p.id)} style={{ flex: 1, padding: "10px 8px", fontSize: 13, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif", background: active ? p.color + "18" : "var(--bg2)", border: `1px solid ${active ? p.color + "55" : "var(--rule)"}`, color: active ? p.color : "var(--dim)", cursor: "pointer", textAlign: "center" }}>
                    {p.label}
                    <span style={{ display: "block", fontSize: 10, marginTop: 2, opacity: .6, fontWeight: 400 }}>{pr.done} of {pr.all} answered</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={generateReport}
              disabled={generating}
              style={{
                width: "100%", padding: 15, fontSize: 14, fontWeight: 700, fontFamily: "'Source Sans 3',sans-serif",
                border: "none", cursor: answered >= 8 ? "pointer" : "default", marginBottom: 16, transition: "all .3s",
                background: answered >= 8 ? "linear-gradient(135deg,#8B6914,#C4A050)" : "rgba(139,94,60,0.12)",
                color: answered >= 8 ? "#1C120C" : "var(--dim)",
              }}
            >
              {generating ? (generatingStatus || "Generating Report...") : answered >= 8 ? "Generate Full Report" : `Answer ${8 - answered} more questions to generate report`}
            </button>

            {reportHtml && (
              <div style={{ background: "var(--bg2)", border: "1px solid var(--rule)", padding: 24, marginTop: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--dim)" }}>Structural Assessment</div>
                  <button onClick={copyReport} style={{ fontSize: 11, fontWeight: 600, padding: "5px 12px", cursor: "pointer", border: `1px solid ${copied ? "rgba(58,106,74,0.35)" : "rgba(139,94,60,0.25)"}`, background: copied ? "rgba(58,106,74,0.12)" : "transparent", color: copied ? "var(--pos)" : "var(--accent)", fontFamily: "'Source Sans 3',sans-serif" }}>
                    {copied ? "✓ Copied" : "Copy Report"}
                  </button>
                </div>
                <div dangerouslySetInnerHTML={{ __html: reportHtml }} />
                {nvfSources.length > 0 && (
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--rule)" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 10, fontFamily: "'Source Sans 3',sans-serif" }}>NVF Archive Sources</div>
                    {nvfSources.map((s, i) => {
                      const date = s.published_at ? new Date(s.published_at).toLocaleDateString("en-US", { year: "numeric", month: "short" }) : "";
                      const url = s.substack_url || null;
                      return (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 6 }}>
                          <div style={{ width: 3, height: 3, background: "var(--accent)", borderRadius: "50%", flexShrink: 0, marginTop: 7 }} />
                          <div style={{ fontSize: 12, lineHeight: 1.5, fontFamily: "'Source Sans 3',sans-serif" }}>
                            {url
                              ? <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>{s.title}</a>
                              : <span style={{ color: "var(--ink2)", fontWeight: 600 }}>{s.title}</span>
                            }
                            {date && <span style={{ color: "var(--dim)", marginLeft: 6, fontSize: 11 }}>{date}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {reportErr && (
              <div style={{ background: "rgba(138,58,42,0.08)", border: "1px solid rgba(138,58,42,0.25)", padding: "14px 16px", marginTop: 8, fontSize: 13, color: "var(--neg)" }}>{reportErr}</div>
            )}

            <div style={{ marginTop: 16, background: "var(--bg2)", border: "1px solid var(--rule)", borderLeft: "3px solid var(--dim)", padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: "var(--dim)", lineHeight: 1.7 }}>This report is AI-generated using the Jobs · People · Place framework and is intended as a discussion document — not a final determination or official recommendation. NapaServe and the Valley Works Collaborative are not liable for decisions made based on this output.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

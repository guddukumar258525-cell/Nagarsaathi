/* NagarSaathi app — vanilla JS SPA (hash router). Backend hooks: replace the `API` object with fetch() calls. */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const store={get(k,d){try{const v=localStorage.getItem('ns_'+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem('ns_'+k,JSON.stringify(v))}catch(e){}}};

/* ---------- API layer (ready for backend) ---------- */
const API={
  issues:()=>Promise.resolve(state.issues),
  create:(i)=>{state.issues.unshift(i);store.set('mine',state.issues.filter(x=>x.mine));return Promise.resolve(i)}
};
const state={
  issues:[...(store.get('mine',[])),...ISSUES],
  upvoted:new Set(store.get('upvoted',[])),
  joined:new Set(store.get('joined',[])),
  alerts:ALERTS.map(a=>({...a})),
  xp:store.get('xp',ME.xp),
  fIssue:{q:'',cat:'all',ward:'all',status:'all',sort:'recent'},
  fMap:{cat:'all',ward:'all',status:'all'},
  comments:store.get('comments',COMMENTS)
};
const fmtD=d=>new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
const wardN=id=>(WARDS.find(w=>w.id===id)||{}).n||id;
const stKey=i=>i.status;
const pinColor=i=>i.urgent&&i.status!=='resolved'?'var(--st-urgent)':i.status==='resolved'?'var(--st-resolved)':i.status==='progress'?'var(--st-progress)':'var(--st-reported)';
const chip=i=>{const k=i.urgent&&i.status!=='resolved'?'urgent':i.status==='verified'?'reported':i.status;return `<span class="chip s-${k}">${i.urgent&&i.status!=='resolved'?'🔥 Urgent · ':''}${STATUS[i.status].n}</span>`};
const toast=(m,t='')=>{const d=document.createElement('div');d.className='toast '+t;d.textContent=m;$('#toasts').appendChild(d);setTimeout(()=>d.remove(),3400)};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function addXP(n,msg){state.xp+=n;store.set('xp',state.xp);toast(`+${n} XP · ${msg}`,'ok')}
function confetti(){const cols=['#F07010','#3E9A2A','#1B3A8C','#F5C26B','#fff'];for(let i=0;i<60;i++){const c=document.createElement('i');c.className='confetti';c.style.left=Math.random()*100+'vw';c.style.background=cols[i%5];c.style.animationDelay=Math.random()*.6+'s';c.style.animationDuration=1.8+Math.random()*1.6+'s';document.body.appendChild(c);setTimeout(()=>c.remove(),4000)}}
function countUp(el){const t=+el.dataset.to,dec=+(el.dataset.dec||0),dur=1400,s=performance.now();const f=n=>{const p=Math.min(1,(n-s)/dur),e=1-Math.pow(1-p,3);el.textContent=(t*e).toLocaleString('en-IN',{minimumFractionDigits:dec,maximumFractionDigits:dec});if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)}
const counts=()=>$$('[data-to]').forEach(countUp);
const tip=$('#tip');
function tipOn(root){$$('[data-tip]',root).forEach(e=>{e.addEventListener('mousemove',ev=>{tip.style.display='block';tip.textContent=e.dataset.tip;tip.style.left=ev.clientX+12+'px';tip.style.top=ev.clientY+12+'px'});e.addEventListener('mouseleave',()=>tip.style.display='none')})}

/* ---------- Charts (SVG, no libraries) ---------- */
const Chart={
  bars(data,{h=200,color='var(--saffron)',w=520}={}){const m=Math.max(...data.map(d=>d.v),1),bw=w/data.length;
    return `<svg viewBox="0 0 ${w} ${h+30}" role="img">${[0,.5,1].map(f=>`<line x1="0" x2="${w}" y1="${h-h*f}" y2="${h-h*f}" stroke="var(--line)"/>`).join('')}${data.map((d,i)=>{const bh=d.v/m*(h-10);return `<g><rect data-tip="${esc(d.l)}: ${d.v}" x="${i*bw+bw*.18}" y="${h-bh}" width="${bw*.64}" height="${bh}" rx="7" fill="${d.c||color}"><animate attributeName="height" from="0" to="${bh}" dur=".8s"/><animate attributeName="y" from="${h}" to="${h-bh}" dur=".8s"/></rect><text x="${i*bw+bw/2}" y="${h+18}" text-anchor="middle">${esc(d.l)}</text></g>`}).join('')}</svg>`},
  hbars(data,{w=520}={}){const m=Math.max(...data.map(d=>d.v),1),rh=34;
    return `<svg viewBox="0 0 ${w} ${data.length*rh}">${data.map((d,i)=>`<g><text x="0" y="${i*rh+21}" style="fill:var(--ink);font-weight:600">${esc(d.l)}</text><rect x="120" y="${i*rh+6}" width="${(w-170)}" height="16" rx="8" fill="var(--line)"/><rect data-tip="${esc(d.l)}: ${d.v}" x="120" y="${i*rh+6}" width="${d.v/m*(w-170)}" height="16" rx="8" fill="${d.c||'var(--saffron)'}"><animate attributeName="width" from="0" to="${d.v/m*(w-170)}" dur=".9s"/></rect><text x="${w-40}" y="${i*rh+20}" style="fill:var(--ink);font-weight:700">${d.v}</text></g>`).join('')}</svg>`},
  donut(data,{s=190}={}){const tot=data.reduce((a,d)=>a+d.v,0)||1,r=70,C=2*Math.PI*r;let off=0;
    return `<svg viewBox="0 0 ${s} ${s}" style="max-width:${s}px;margin:auto"><g transform="rotate(-90 ${s/2} ${s/2})">${data.map(d=>{const len=d.v/tot*C;const e=`<circle data-tip="${esc(d.l)}: ${d.v}" cx="${s/2}" cy="${s/2}" r="${r}" fill="none" stroke="${d.c}" stroke-width="26" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-off}"/>`;off+=len;return e}).join('')}</g><text x="${s/2}" y="${s/2+2}" text-anchor="middle" style="font-size:26px;font-weight:800;fill:var(--ink)">${tot}</text><text x="${s/2}" y="${s/2+20}" text-anchor="middle">issues</text></svg>`},
  line(data,{w=520,h=190,color='var(--green)'}={}){const m=Math.max(...data.map(d=>d.v),1),sx=(w-30)/(data.length-1);const pts=data.map((d,i)=>[15+i*sx,h-(d.v/m)*(h-20)]);const path=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
    return `<svg viewBox="0 0 ${w} ${h+28}">${[0,.5,1].map(f=>`<line x1="0" x2="${w}" y1="${h-(h-20)*f}" y2="${h-(h-20)*f}" stroke="var(--line)"/>`).join('')}<path d="${path} L${pts.at(-1)[0]} ${h} L15 ${h}Z" fill="${color}" opacity=".13"/><path d="${path}" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>${pts.map((p,i)=>`<circle data-tip="${esc(data[i].l)}: ${data[i].v}" cx="${p[0]}" cy="${p[1]}" r="5" fill="var(--card)" stroke="${color}" stroke-width="3"/><text x="${p[0]}" y="${h+20}" text-anchor="middle">${esc(data[i].l)}</text>`).join('')}</svg>`}
};
const monthly=()=>['Jun','Jul','Aug','Sep','Oct','Nov'].map((l,i)=>({l,v:[14,22,19,31,38,46][i]}));

/* ---------- Components ---------- */
const catBg=c=>`background:linear-gradient(135deg,${CATS[c].c}22,${CATS[c].c}55)`;
function issueCard(i){return `<article class="card icard hov" tabindex="0" role="button" data-open="${i.id}" aria-label="${esc(i.title)}">
  <div class="ph-img" style="${catBg(i.cat)}">${CATS[i.cat].e}<span style="position:absolute;top:12px;left:12px">${chip(i)}</span></div>
  <div class="body"><span class="tag">${CATS[i.cat].e} ${CATS[i.cat].n}</span><h4>${esc(i.title)}</h4>
  <div class="meta"><span>📍 ${esc(wardN(i.ward))}</span><span>🗓️ ${fmtD(i.date)}</span><span>#${i.id}</span></div>
  <div class="row"><button class="up ${state.upvoted.has(i.id)?'on':''}" data-up="${i.id}" aria-label="Support this issue">👍 <span>${i.up+(state.upvoted.has(i.id)?1:0)}</span></button><span style="font-size:.78rem;color:var(--muted)">${CATS[i.cat].dept}</span></div></div></article>`}
const emptyState=(e,t,s)=>`<div class="empty"><div class="e">${e}</div><h3>${t}</h3><p>${s}</p></div>`;
const skel=n=>Array.from({length:n},()=>`<div class="sk" style="height:${200+Math.random()*60|0}px"></div>`).join('');
const hz=i=>{const idx={reported:0,verified:1,progress:2,resolved:3}[i.status];return `<div class="hz">${['Reported','Verified','In Progress','Resolved'].map((s,k)=>`<div class="p ${k<idx||(k===idx&&idx===3)?'done':k===idx?'now':''}"><i>${k<idx||(k===idx&&idx===3)?'✓':k+1}</i>${s}</div>`).join('')}</div>`};
const sumBy=(arr,f)=>arr.reduce((m,x)=>(m[f(x)]=(m[f(x)]||0)+1,m),{});

/* ---------- Issue detail modal ---------- */
function openIssue(id){const i=state.issues.find(x=>x.id===id);if(!i)return;
  const cm=state.comments[id]||[];const st=['Reported','Verified','In Progress','Resolved'];const idx={reported:0,verified:1,progress:2,resolved:3}[i.status];
  const dates=i.steps||[0,null,null,null];
  const m=document.createElement('div');m.className='modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
  m.innerHTML=`<div class="box"><button class="icon-btn x" aria-label="Close">✕</button>
  <div style="${catBg(i.cat)};border-radius:18px;height:150px;display:grid;place-items:center;font-size:4.4rem;margin-bottom:16px">${CATS[i.cat].e}</div>
  <div class="pills" style="margin-bottom:8px">${chip(i)}<span class="tag">#${i.id}</span><span class="tag">${CATS[i.cat].n}</span></div>
  <h2 style="font-size:1.45rem">${esc(i.title)}</h2>
  <p style="color:var(--muted);margin:6px 0 4px">📍 ${esc(i.loc)} · ${esc(wardN(i.ward))} Ward · 🗓️ ${fmtD(i.date)}</p>
  <p style="margin:10px 0">${esc(i.desc)}</p>
  <div class="grid g2" style="margin:14px 0"><div class="card" style="padding:14px"><small style="color:var(--muted)">Assigned department</small><br><b>🏛️ ${CATS[i.cat].dept}</b></div><div class="card" style="padding:14px"><small style="color:var(--muted)">Reported by</small><br><b>👤 ${esc(i.by||ME.name)}</b></div></div>
  ${hz(i)}
  <div class="tl" style="margin:18px 0">${st.map((s,k)=>`<div class="it ${k<idx||(k===idx&&idx===3)?'done':k===idx?'now':''}"><b>${s}</b><small>${k===0?fmtD(i.date):(dates[k]!=null&&k<=idx)?fmtD(D(dates[k])):k<=idx?'Updated recently':'Pending'}</small></div>`).join('')}</div>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px"><button class="up ${state.upvoted.has(id)?'on':''}" data-up="${id}">👍 Support · <span>${i.up+(state.upvoted.has(id)?1:0)}</span></button><button class="btn btn-o btn-sm" data-share="${id}">🔗 Share</button><a class="btn btn-g btn-sm" target="_blank" rel="noopener" href="https://wa.me/917796636077?text=${encodeURIComponent('NagarSaathi issue '+id+': '+i.title)}">💬 WhatsApp</a></div>
  <h3 style="margin-bottom:10px">Comments & updates (${cm.length})</h3><div id="cms">${cm.length?cm.map(c=>`<div class="cm"><span class="av" style="background:${c.off?'var(--navy)':'var(--saffron)'}">${esc(c.u[0])}</span><div><b>${esc(c.u)}</b> ${c.off?'<span class="chip s-resolved" style="font-size:.65rem">Official</span>':''} <small style="color:var(--muted)">${c.d}</small><div>${esc(c.t)}</div></div></div>`).join(''):'<p style="color:var(--muted)">No comments yet. Be the first!</p>'}</div>
  <form id="cf" style="display:flex;gap:8px;margin-top:10px"><input class="fld" style="flex:1;padding:11px 14px;border-radius:12px;border:1.5px solid var(--line);background:var(--card)" placeholder="Add an update…" aria-label="Comment" required><button class="btn btn-n btn-sm">Post</button></form></div>`;
  document.body.appendChild(m);const close=()=>{m.remove();document.removeEventListener('keydown',esc_)};const esc_=e=>e.key==='Escape'&&close();document.addEventListener('keydown',esc_);
  m.onclick=e=>{if(e.target===m||e.target.closest('.x'))close()};$('.x',m).focus();
  $('#cf',m).onsubmit=e=>{e.preventDefault();const inp=$('input',e.target);state.comments[id]=[...(state.comments[id]||[]),{u:ME.name,t:inp.value,d:'just now'}];store.set('comments',state.comments);close();openIssue(id);addXP(5,'comment added')};
  $('[data-share]',m).onclick=()=>{const u=location.origin+location.pathname+'#/issues';(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>toast('Link copied','ok')).catch(()=>toast('Copy: '+u))};
}
function upvote(id){const i=state.issues.find(x=>x.id===id);if(state.upvoted.has(id)){state.upvoted.delete(id)}else{state.upvoted.add(id);addXP(2,'supported an issue')}store.set('upvoted',[...state.upvoted]);
  $$(`[data-up="${id}"]`).forEach(b=>{b.classList.toggle('on',state.upvoted.has(id));$('span',b).textContent=i.up+(state.upvoted.has(id)?1:0)})}
document.addEventListener('click',e=>{const u=e.target.closest('[data-up]');if(u){e.stopPropagation();upvote(u.dataset.up);return}const o=e.target.closest('[data-open]');if(o)openIssue(o.dataset.open)});
document.addEventListener('keydown',e=>{if((e.key==='Enter')&&e.target.matches('[data-open]'))openIssue(e.target.dataset.open)});

/* ---------- City map (SVG) ---------- */
function cityMap({issues,pick=false,onPin}={}){
  const wards=WARDS.map((w,k)=>`<g><rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" rx="26" fill="${['#FFE9C9','#E3F3D6','#DCE6FA','#FFF1CF'][k%4]}" opacity=".55" stroke="var(--line)" stroke-dasharray="6 6"/><text x="${w.x+w.w/2}" y="${w.y+24}" text-anchor="middle" style="font-weight:700;fill:var(--muted);font-size:14px;opacity:.85">${w.n.toUpperCase()}</text></g>`).join('');
  const bld=[...Array(46)].map((_,k)=>{const w=WARDS[k%8];const bx=w.x+20+((k*37)%(w.w-50)),by=w.y+36+((k*53)%(w.h-60));return `<rect x="${bx}" y="${by}" width="${10+k%3*5}" height="${12+k%4*6}" rx="2" fill="var(--navy)" opacity=".12"/>`}).join('');
  const pins=issues.map(i=>`<g class="pin ${i.urgent&&i.status!=='resolved'?'pulse':''}" data-pin="${i.id}" tabindex="0" role="button" aria-label="${esc(i.title)}" transform="translate(${i.x},${i.y})"><circle class="pl" r="6" fill="${pinColor(i)}" opacity="0"/><path d="M0 0C-14-16-16-30 0-32 16-30 14-16 0 0Z" transform="translate(0,2)" fill="${pinColor(i)}" stroke="#fff" stroke-width="2.5"/><circle cx="0" cy="-20" r="9" fill="#fff"/><text y="-15.5" text-anchor="middle" style="font-size:12px">${CATS[i.cat].e}</text></g>`).join('');
  return `<div class="mapbox" id="mapbox"><svg viewBox="0 0 1000 620" id="mapsvg" role="img" aria-label="City map">
   <defs><pattern id="gr" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="var(--line)" stroke-width="1" opacity=".55"/></pattern></defs>
   <rect width="1000" height="620" fill="url(#gr)"/>${wards}${bld}
   <path d="M-10 330C120 280 200 400 330 360S520 270 640 330 860 420 1010 330" fill="none" stroke="#7DB7F2" stroke-width="30" stroke-linecap="round" opacity=".7"/><text x="860" y="408" style="fill:#4F8FD6;font-size:13px;font-style:italic">Pavana River</text>
   <path d="M0 270H1000M0 420H1000M290 0V620M640 0V620" stroke="#fff" stroke-width="14" opacity=".9" fill="none"/><path d="M0 270H1000M0 420H1000M290 0V620M640 0V620" stroke="var(--line)" stroke-width="2" stroke-dasharray="14 12" fill="none"/>
   ${pins}${pick?'<g id="picked"></g>':''}</svg></div>`}
function mapEvents(root,onPin,onPick){
  $$('[data-pin]',root).forEach(p=>{const h=ev=>{ev.stopPropagation();onPin&&onPin(p.dataset.pin,p)};p.addEventListener('click',h);p.addEventListener('keydown',e=>e.key==='Enter'&&h(e))});
  if(onPick){const svg=$('#mapsvg',root);svg.style.cursor='crosshair';svg.addEventListener('click',e=>{const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const p=pt.matrixTransform(svg.getScreenCTM().inverse());onPick(Math.round(p.x),Math.round(p.y))})}}
function locate(x,y){const w=WARDS.find(w=>x>=w.x&&x<=w.x+w.w&&y>=w.y&&y<=w.y+w.h)||WARDS.map(w=>({w,d:Math.hypot(x-(w.x+w.w/2),y-(w.y+w.h/2))})).sort((a,b)=>a.d-b.d)[0].w;return w}

/* ---------- Pages ---------- */
const PAGES={};
const stats=()=>{const t=state.issues.length,r=state.issues.filter(i=>i.status==='resolved').length;return {t,r,p:state.issues.filter(i=>i.status==='progress').length,pend:state.issues.filter(i=>i.status==='reported'||i.status==='verified').length}};

PAGES.home=()=>{const s=stats();const recent=state.issues.slice(0,3);
return `<div class="view"><section class="hero"><div class="hero-in"><div>
 <span class="hi">नगर साथी · सेवा • सहभागिता • विकास</span>
 <h1>Your City. Your Voice. <em>Your Impact.</em></h1>
 <p class="sub">Report problems, track progress, and make your city better — together. NagarSaathi connects citizens and city departments in one transparent platform.</p>
 <div class="pills"><a class="btn btn-p" href="#/report">📸 Report an Issue</a><a class="btn btn-o" href="#/dashboard">📊 Explore City Dashboard</a></div></div>
 <div class="hero-art"><img class="logo-big" src="assets/logo-512.png" alt="NagarSaathi — Community & City Partnership logo"><span class="float-card" style="top:6%;left:0">🛣️ Pothole fixed in 3 days</span><span class="float-card" style="bottom:12%;right:0;animation-delay:1s">✅ 1,284 issues resolved</span><span class="float-card" style="bottom:2%;left:6%;animation-delay:2s">🤝 12,480 citizens</span></div></div></section>
 <div class="sec" style="padding-top:0"><div class="big-stats"><div class="grid g4">
  <div><b data-to="${2840+s.t}">0</b><span>Issues Reported</span></div><div><b data-to="${1284+s.r}">0</b><span>Problems Resolved</span></div><div><b data-to="12480">0</b><span>Active Citizens</span></div><div><b data-to="4.2" data-dec="1">0</b><span>Avg. Resolution (days)</span></div></div></div></div>
 <section class="sec"><h2>Recent city issues</h2><p class="lead">Real-time reports from your neighbourhood. Support the ones that matter to you.</p><div class="grid g3">${recent.map(issueCard).join('')}</div><p style="text-align:center;margin-top:22px"><a class="btn btn-n" href="#/issues">View all issues →</a></p></section>
 <section class="sec"><h2>How NagarSaathi works</h2><p class="lead">From complaint to resolution in four transparent steps.</p><div class="grid g4 steps">
  ${[['📸','Report','Snap a photo, pin the location. AI suggests the category.'],['✅','Verify','Ward officers verify and assign the right department.'],['🔧','Fix','Track live progress with a clear timeline.'],['🎉','Celebrate','Get notified, earn XP and badges for impact.']].map(x=>`<div class="card step hov"><div style="font-size:2.2rem">${x[0]}</div><h3 style="margin-top:6px">${x[1]}</h3><p style="color:var(--muted)">${x[2]}</p></div>`).join('')}</div></section>
 <section class="sec"><h2>Community impact</h2><p class="lead">Together we've changed our wards. Join the next drive.</p><div class="grid g4">${ACHIEVE.map(a=>`<div class="card hov" style="text-align:center"><div style="font-size:2.4rem">${a.e}</div><b style="font-family:Poppins;font-size:1.6rem;color:var(--navy)">${a.n}</b><p style="color:var(--muted)">${a.d}</p></div>`).join('')}</div>
 <div class="card" style="margin-top:22px;display:flex;gap:20px;align-items:center;flex-wrap:wrap;justify-content:space-between;background:linear-gradient(135deg,var(--cream),var(--card))"><div><h3 style="font-size:1.3rem">Be a Nagar Saathi — a partner of your city 🇮🇳</h3><p style="color:var(--muted)">Join clean-up drives, volunteer, and climb the ward leaderboard.</p></div><a class="btn btn-g" href="#/community">Join the community</a></div></section></div>`};

PAGES.dashboard=()=>{const s=stats(),mine=state.issues.filter(i=>i.ward===ME.ward||i.mine).slice(0,6);const byC=sumBy(state.issues,i=>i.cat);
return `<div class="view"><div class="ph"><div><h1>Namaste, ${ME.name.split(' ')[0]} 👋</h1><p>Here's how your city is doing — and your impact.</p></div><a class="btn btn-p" href="#/report">+ Report an Issue</a></div>
<div class="grid g4" style="margin-bottom:18px">${[['📝','Total reported',s.t,'#F0701022'],['✅','Resolved',s.r,'#3E9A2A22'],['⏳','Pending',s.pend,'#F5C26B55'],['🔧','In progress',s.p,'#1B3A8C22']].map(x=>`<div class="card hov stat"><div class="ico" style="background:${x[3]}">${x[0]}</div><div><b data-to="${x[2]}">0</b><small>${x[1]}</small></div></div>`).join('')}</div>
<div class="grid g21"><div class="card chart"><h3>Reports over time <span class="tag">Last 6 months</span></h3>${Chart.line(monthly())}</div>
<div class="card"><h3>Community impact score</h3><div style="text-align:center"><div style="font-family:Poppins;font-size:3rem;font-weight:800;color:var(--saffron)" data-to="${state.xp}">0</div><small style="color:var(--muted)">XP · Level ${Math.floor(state.xp/500)+1} Citizen Champion</small><div class="bar" style="margin:12px 0 6px"><i style="width:${(state.xp%500)/5}%"></i></div><small>${500-state.xp%500} XP to next level · 🔥 ${ME.streak}-day streak</small></div></div></div>
<div class="grid g2" style="margin-top:18px"><div class="card chart"><h3>Issues by category</h3><div class="grid" style="grid-template-columns:200px 1fr;align-items:center">${Chart.donut(Object.keys(CATS).map(k=>({l:CATS[k].n,v:byC[k]||0,c:CATS[k].c})))}<div style="font-size:.85rem">${Object.keys(CATS).map(k=>`<div style="padding:2px 0"><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${CATS[k].c};margin-right:8px"></i>${CATS[k].e} ${CATS[k].n} <b>${byC[k]||0}</b></div>`).join('')}</div></div></div>
<div class="card"><h3>Activity timeline</h3><div class="tl">${[['🎉','NS-1039 resolved — you earned +50 XP','3h ago'],['👍','You supported “Open manhole without cover”','Yesterday'],['📸','You reported “Deep pothole near Pimpri flyover”','6 days ago'],['🏅','Badge unlocked: Road Safety Guardian','1 week ago'],['🤝','Joined Pavana Riverfront clean-up','2 weeks ago']].map(a=>`<div class="it done"><b>${a[0]} ${a[1]}</b><small>${a[2]}</small></div>`).join('')}</div></div></div>
<div class="card" style="margin-top:18px"><h3>Recent reports in your area <a class="btn btn-o btn-sm" href="#/issues">View all</a></h3>${mine.length?`<div class="grid g3">${mine.slice(0,3).map(issueCard).join('')}</div>`:emptyState('📭','No reports yet','Report your first issue to start earning XP.')}</div></div>`};

PAGES.report=()=>`<div class="view"><div class="ph"><div><h1>Report an issue</h1><p>Takes less than a minute. Photo + location helps officers act faster.</p></div></div>
<div id="rwrap" class="grid g2" style="align-items:start"><form class="card" id="rform" novalidate>
 <div class="fld"><label>1. Photo (upload or camera)</label><label class="dz" id="dz" tabindex="0"><input type="file" accept="image/*" capture="environment" id="photo" class="sr"><div id="dzt">📷 <b>Tap to take a photo or upload</b><br><small style="color:var(--muted)">AI will suggest the category</small></div></label></div>
 <div id="aibox"></div>
 <div class="fld"><label for="title">2. Issue title *</label><input id="title" maxlength="80" placeholder="e.g. Deep pothole near school gate" required></div>
 <div class="fld"><label for="desc">3. Description</label><textarea id="desc" placeholder="What is wrong? Since when? How is it affecting people?"></textarea></div>
 <div class="fld"><label>4. Category *</label><div class="catgrid" id="cats">${Object.keys(CATS).map(k=>`<button type="button" class="cat" data-c="${k}"><span>${CATS[k].e}</span>${CATS[k].n}</button>`).join('')}</div></div>
 <div class="fld"><label>5. Priority</label><div class="pills" id="prio">${[['low','🟢 Low'],['med','🟡 Medium'],['high','🟠 High'],['urgent','🔴 Urgent']].map((p,k)=>`<button type="button" class="pill ${k===1?'on':''}" data-p="${p[0]}">${p[1]}</button>`).join('')}</div></div>
 <div class="fld"><label for="addr">6. Address / landmark *</label><input id="addr" placeholder="Tap the map or type an address" required></div>
 <button class="btn btn-p" style="width:100%;margin-top:6px" id="subm">🚀 Submit report</button></form>
 <div class="card"><h3>📍 Pick location on map <button type="button" class="btn btn-o btn-sm" id="gps">🎯 Use my GPS</button></h3><p style="color:var(--muted);margin-bottom:10px;font-size:.9rem">Tap anywhere on the map to drop a pin.</p>${cityMap({issues:[],pick:true})}<p id="locinfo" style="margin-top:10px;font-weight:600;color:var(--muted)">No location selected yet</p></div></div></div>`;
PAGES.report.init=()=>{
  let cat=null,prio='med',pos=null,img=null;
  const setCat=k=>{cat=k;$$('#cats .cat').forEach(b=>b.classList.toggle('on',b.dataset.c===k))};
  $('#cats').onclick=e=>{const b=e.target.closest('.cat');if(b)setCat(b.dataset.c)};
  $('#prio').onclick=e=>{const b=e.target.closest('.pill');if(!b)return;prio=b.dataset.p;$$('#prio .pill').forEach(x=>x.classList.toggle('on',x===b))};
  const setPos=(x,y)=>{pos={x,y};const w=locate(x,y);$('#picked').innerHTML=`<g transform="translate(${x},${y})"><circle r="26" fill="var(--saffron)" opacity=".2"><animate attributeName="r" values="10;30;10" dur="2s" repeatCount="indefinite"/></circle><path d="M0 0C-14-16-16-30 0-32 16-30 14-16 0 0Z" fill="var(--saffron)" stroke="#fff" stroke-width="3"/><circle cy="-21" r="6" fill="#fff"/></g>`;$('#locinfo').innerHTML=`✅ Pinned in <b>${w.n} Ward</b> · ${(18.62+(600-y)*.0002).toFixed(4)}°N, ${(73.78+x*.0003).toFixed(4)}°E`;if(!$('#addr').value)$('#addr').value=`Near ${w.n} Chowk, ${w.n} Ward, PCMC`};
  mapEvents($('.mapbox'),null,setPos);
  $('#gps').onclick=()=>{if(!navigator.geolocation){setPos(520,330);toast('GPS not available — sample location set');return}toast('Fetching your location…');navigator.geolocation.getCurrentPosition(()=>{setPos(540+Math.random()*40|0,320+Math.random()*40|0);toast('Location detected','ok')},()=>{setPos(520,330);toast('Permission denied — sample location set')},{timeout:6000})};
  $('#photo').onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{img=rd.result;$('#dzt').innerHTML=`<img class="pv" src="${img}" alt="Selected photo"><br><small>Tap to change</small>`;
    $('#aibox').innerHTML='<div class="sk" style="height:48px"></div>';
    setTimeout(()=>{const n=(f.name||'').toLowerCase();const map=[['pot|road|crack','road'],['light|lamp|dark','light'],['garbage|waste|trash|dump','garbage'],['water|leak|pipe','water'],['signal|traffic','traffic'],['park|tree|garden','park'],['wall|bridge|drain','infra']];const hit=map.find(m=>new RegExp(m[0]).test(n));const k=hit?hit[1]:['road','garbage','light','water'][f.size%4];
      $('#aibox').innerHTML=`<div class="ai">🤖 AI suggestion: <b>${CATS[k].e} ${CATS[k].n}</b> <button type="button" class="btn btn-n btn-sm" id="aiok">Apply</button></div>`;$('#aiok').onclick=()=>{setCat(k);toast('Category applied','ok')}},1100)};rd.readAsDataURL(f)};
  $('#dz').onkeydown=e=>{if(e.key==='Enter')$('#photo').click()};
  $('#rform').onsubmit=e=>{e.preventDefault();const t=$('#title').value.trim(),a=$('#addr').value.trim();
    if(!t||!cat||!a){toast('Please add a title, category and address');return}
    if(!pos){const w=WARDS[0];pos={x:w.x+w.w/2,y:w.y+w.h/2}}
    const w=locate(pos.x,pos.y),id='NS-'+(1043+state.issues.filter(i=>i.mine).length);
    const issue={id,title:t,cat,ward:w.id,status:'reported',urgent:prio==='urgent',x:pos.x,y:pos.y,date:new Date().toISOString().slice(0,10),loc:a,up:0,by:ME.name,desc:$('#desc').value.trim()||'No description provided.',steps:[0,null,null,null],mine:true};
    $('#subm').disabled=true;$('#subm').textContent='Submitting…';
    API.create(issue).then(()=>setTimeout(()=>{
      $('#rwrap').innerHTML=`<div class="card success" style="grid-column:1/-1"><svg class="ck" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="var(--green)" stroke-width="8"/><path d="M36 62l16 16 32-34" fill="none" stroke="var(--green)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg><h2>Report submitted! 🎉</h2><p style="color:var(--muted);margin:8px 0 4px">Your issue <b>#${id}</b> was sent to <b>${CATS[cat].dept}</b>.</p><p style="margin-bottom:18px"><span class="chip s-reported">+50 XP earned</span></p><div class="pills" style="justify-content:center"><button class="btn btn-n" data-open="${id}">Track this issue</button><a class="btn btn-o" href="#/report">Report another</a><a class="btn btn-g" href="#/map">See on map</a></div></div>`;
      addXP(50,'new report');confetti();window.scrollTo({top:0,behavior:'smooth'})},900))}};

const sel=(id,opts,val)=>`<select id="${id}" aria-label="${id}">${opts.map(o=>`<option value="${o[0]}" ${o[0]===val?'selected':''}>${o[1]}</option>`).join('')}</select>`;
const catOpts=[['all','All categories'],...Object.keys(CATS).map(k=>[k,CATS[k].e+' '+CATS[k].n])];
const wardOpts=[['all','All wards'],...WARDS.map(w=>[w.id,w.n])];
const stOpts=[['all','All status'],['reported','Reported'],['verified','Verified'],['progress','In Progress'],['resolved','Resolved']];
PAGES.issues=()=>{const f=state.fIssue;return `<div class="view"><div class="ph"><div><h1>Issue tracker</h1><p>Every report, its journey, and who is responsible.</p></div><a class="btn btn-p" href="#/report">+ New report</a></div>
<div class="filters"><input id="q" type="search" placeholder="🔍 Search by title, ID or place" value="${esc(f.q)}" aria-label="Search">${sel('fc',catOpts,f.cat)}${sel('fw',wardOpts,f.ward)}${sel('fs',stOpts,f.status)}${sel('fo',[['recent','Most recent'],['up','Most supported']],f.sort)}</div>
<div id="ilist" class="grid g3">${skel(6)}</div></div>`};
PAGES.issues.init=()=>{const f=state.fIssue;const draw=()=>{let l=state.issues.filter(i=>(f.cat==='all'||i.cat===f.cat)&&(f.ward==='all'||i.ward===f.ward)&&(f.status==='all'||i.status===f.status)&&(!f.q||(i.title+i.id+i.loc).toLowerCase().includes(f.q.toLowerCase())));l.sort((a,b)=>f.sort==='up'?b.up-a.up:b.date.localeCompare(a.date));$('#ilist').className=l.length?'grid g3':'';$('#ilist').innerHTML=l.length?l.map(issueCard).join(''):emptyState('🔍','No issues match','Try clearing a filter or search term.')};
  setTimeout(draw,450);$('#q').oninput=e=>{f.q=e.target.value;draw()};[['fc','cat'],['fw','ward'],['fs','status'],['fo','sort']].forEach(([id,k])=>$('#'+id).onchange=e=>{f[k]=e.target.value;draw()})};

PAGES.map=()=>{const f=state.fMap;return `<div class="view"><div class="ph"><div><h1>City map</h1><p>All reports, colour-coded by status. Tap a pin for details.</p></div></div>
<div class="filters">${sel('mc',catOpts,f.cat)}${sel('mw',wardOpts,f.ward)}${sel('ms',stOpts.filter(s=>s[0]!=='verified'),f.status)}<span id="mcount" class="tag"></span></div>
<div class="legend" style="margin-bottom:12px"><span><i style="background:var(--st-reported)"></i>Reported</span><span><i style="background:var(--st-progress)"></i>In Progress</span><span><i style="background:var(--st-resolved)"></i>Resolved</span><span><i style="background:var(--st-urgent)"></i>Urgent</span></div>
<div style="position:relative" id="mapwrap"></div></div>`};
PAGES.map.init=()=>{const f=state.fMap;const draw=()=>{const l=state.issues.filter(i=>(f.cat==='all'||i.cat===f.cat)&&(f.ward==='all'||i.ward===f.ward)&&(f.status==='all'||i.status===f.status||(f.status==='reported'&&i.status==='verified')));
  $('#mapwrap').innerHTML=cityMap({issues:l});$('#mcount').textContent=l.length+' issues shown';
  mapEvents($('#mapwrap'),(id,el)=>{const i=state.issues.find(x=>x.id===id);const wrap=$('#mapwrap'),r=el.getBoundingClientRect(),wr=wrap.getBoundingClientRect();let left=r.left-wr.left+r.width/2-130;left=Math.max(8,Math.min(wr.width-268,left));let top=r.top-wr.top+r.height+8;if(top>wr.height-190)top=r.top-wr.top-200;$$('.pop',wrap).forEach(p=>p.remove());
    const p=document.createElement('div');p.className='pop';p.style.cssText=`left:${left}px;top:${Math.max(8,top)}px`;p.innerHTML=`${chip(i)}<h4 style="margin:8px 0 2px">${esc(i.title)}</h4><small style="color:var(--muted)">📍 ${esc(i.loc)}<br>${CATS[i.cat].dept} · 👍 ${i.up}</small><div style="margin-top:10px;display:flex;gap:8px"><button class="btn btn-n btn-sm" data-open="${i.id}">Details</button><button class="btn btn-o btn-sm" data-cl>Close</button></div>`;wrap.appendChild(p);$('[data-cl]',p).onclick=()=>p.remove()});
  $('#mapsvg').addEventListener('click',()=>$$('.pop',$('#mapwrap')).forEach(p=>p.remove()))};
  draw();[['mc','cat'],['mw','ward'],['ms','status']].forEach(([id,k])=>$('#'+id).onchange=e=>{f[k]=e.target.value;draw()})};

PAGES.rewards=()=>{const lvl=Math.floor(state.xp/500)+1;return `<div class="view"><div class="ph"><div><h1>Rewards & leaderboard</h1><p>Every action makes your city better — and earns you XP.</p></div></div>
<div class="grid g3" style="margin-bottom:18px"><div class="card stat hov"><div class="ico" style="background:#F0701022">⭐</div><div><b data-to="${state.xp}">0</b><small>Total XP · Level ${lvl}</small></div></div><div class="card stat hov"><div class="ico" style="background:#E23B3B22">🔥</div><div><b>${ME.streak} days</b><small>Current streak</small></div></div><div class="card stat hov"><div class="ico" style="background:#3E9A2A22">🏅</div><div><b>${BADGES.filter(b=>b.got).length}/${BADGES.length}</b><small>Badges earned</small></div></div></div>
<div class="grid g21"><div class="card"><h3>Citizen leaderboard</h3><div class="tabs" id="lbtabs"><button class="on" data-t="week">This week</button><button data-t="month">This month</button><button data-t="all">All-time</button></div><div id="lb"></div></div>
<div class="card"><h3>XP guide</h3>${[['📸','Report a valid issue','+50'],['👍','Support an issue','+2'],['💬','Post an update','+5'],['🤝','Join a clean-up drive','+200'],['✅','Your issue gets resolved','+50'],['🔥','7-day streak bonus','+100']].map(x=>`<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--line)"><span>${x[0]} ${x[1]}</span><b style="color:var(--green)">${x[2]}</b></div>`).join('')}<h3 style="margin-top:20px">Redeem rewards</h3>${[['🚌','Free metro/bus day pass',1500],['🌱','Plant a tree in your name',800],['🎟️','Local event ticket',2500]].map(r=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0"><span>${r[0]} ${r[1]}<br><small style="color:var(--muted)">${r[2]} XP</small></span><button class="btn btn-sm ${state.xp>=r[2]?'btn-p':'btn-o'}" data-redeem="${r[1]}" data-cost="${r[2]}">Redeem</button></div>`).join('')}</div></div>
<div class="card" style="margin-top:18px"><h3>Achievement badges</h3><div class="grid g4">${BADGES.map(b=>`<div class="badge ${b.got?'':'lock'}"><span class="e">${b.e}</span><b>${b.n}</b><small>${b.d}</small><small>${b.got?'✓ Unlocked':'🔒 Locked'}</small></div>`).join('')}</div></div>
<div class="card" style="margin-top:18px"><h3>Ward-wise rankings</h3>${[...WARDS].sort((a,b)=>b.score-a.score).map((w,k)=>`<div class="lb"><span class="rk">${k+1}</span><div class="nm"><b>${w.n}</b><div class="bar" style="margin-top:6px"><i style="width:${w.score}%"></i></div></div><b>${w.score}</b></div>`).join('')}</div></div>`};
PAGES.rewards.init=()=>{const draw=t=>{const k={week:.12,month:.4,all:1}[t];const me=BOARD.map(b=>({...b,xp:b.me?state.xp*(t==='all'?1:k+.1):Math.round(b.xp*k)})).sort((a,b)=>b.xp-a.xp);$('#lb').innerHTML=me.map((b,i)=>`<div class="lb" style="${b.me?'background:var(--cream)':''}"><span class="rk">${i+1}</span><span class="av" style="background:${b.c}">${b.n.split(' ').map(x=>x[0]).join('')}</span><div class="nm"><b>${b.n} ${b.me?'<span class="tag">You</span>':''}</b><small>${b.ward} Ward</small></div><b>${Math.round(b.xp).toLocaleString('en-IN')} XP</b></div>`).join('')};draw('week');
  $('#lbtabs').onclick=e=>{const b=e.target.closest('button');if(!b)return;$$('#lbtabs button').forEach(x=>x.classList.toggle('on',x===b));draw(b.dataset.t)};
  $$('[data-redeem]').forEach(b=>b.onclick=()=>{const c=+b.dataset.cost;if(state.xp<c){toast(`Need ${c-state.xp} more XP`);return}state.xp-=c;store.set('xp',state.xp);toast('Reward redeemed: '+b.dataset.redeem,'ok');confetti();route()})};

PAGES.wards=()=>{const rows=WARDS.map(w=>{const l=state.issues.filter(i=>i.ward===w.id),r=l.filter(i=>i.status==='resolved').length,c=sumBy(l,i=>i.cat),top=Object.keys(c).sort((a,b)=>c[b]-c[a])[0];return {...w,rep:l.length*14+r*3,res:r*12+l.length*3,rate:l.length?Math.round(r/l.length*100):0,top}});
return `<div class="view"><div class="ph"><div><h1>Ward dashboard</h1><p>Compare how each ward is performing.</p></div></div>
<div class="grid g2"><div class="card chart"><h3>Issues reported vs resolved</h3>${Chart.hbars(rows.map(r=>({l:r.n,v:r.rep,c:'var(--saffron)'})))}<p style="margin:10px 0 4px;font-weight:700;font-size:.85rem">Resolved</p>${Chart.hbars(rows.map(r=>({l:r.n,v:r.res,c:'var(--green)'})))}</div>
<div class="card chart"><h3>Cleanliness & maintenance score</h3>${Chart.bars(rows.map(r=>({l:r.n.slice(0,6),v:r.score,c:r.score>=80?'var(--green)':r.score>=70?'var(--saffron)':'var(--st-urgent)'})))}<p class="legend" style="margin-top:8px"><span><i style="background:var(--green)"></i>80+ Excellent</span><span><i style="background:var(--saffron)"></i>70–79 Good</span><span><i style="background:var(--st-urgent)"></i>&lt;70 Needs focus</span></p></div></div>
<div class="card" style="margin-top:18px;overflow:auto"><h3>Ward comparison</h3><table style="width:100%;border-collapse:collapse;min-width:620px"><thead><tr style="text-align:left;color:var(--muted);font-size:.82rem"><th style="padding:10px">Ward</th><th>Population</th><th>Resolution rate</th><th>Top problem</th><th>Score</th></tr></thead><tbody>${[...rows].sort((a,b)=>b.score-a.score).map((r,k)=>`<tr style="border-top:1px solid var(--line)"><td style="padding:12px"><b>${k===0?'👑 ':''}${r.n}</b></td><td>${r.pop}</td><td style="min-width:150px"><div class="bar"><i style="width:${r.rate}%"></i></div><small>${r.rate}%</small></td><td>${r.top?CATS[r.top].e+' '+CATS[r.top].n:'—'}</td><td><b>${r.score}</b>/100</td></tr>`).join('')}</tbody></table></div></div>`};

PAGES.alerts=()=>{const f=PAGES.alerts.f||'all';const l=state.alerts.filter(a=>f==='all'||a.k===f||(f==='weather'&&a.k==='rain'));
return `<div class="view"><div class="ph"><div><h1>Smart alerts</h1><p>Stay informed about what matters near you.</p></div><button class="btn btn-o btn-sm" id="markall">✓ Mark all read</button></div>
<div class="pills" style="margin-bottom:18px" id="af">${[['all','All'],['status','Status updates'],['nearby','Nearby urgent'],['rain','Rain / flood'],['road','Road blocks'],['water','Water supply'],['community','Announcements']].map(x=>`<button class="pill ${f===x[0]?'on':''}" data-f="${x[0]}">${x[1]}</button>`).join('')}</div>
${l.length?l.map(a=>`<div class="alert ${a.t} ${a.unread?'unread':''}"><span class="e">${a.e}</span><div style="flex:1"><b>${a.h}</b><p style="color:var(--muted)">${a.p}</p><small style="color:var(--muted)">${a.when}</small></div>${a.unread?'<span class="dot" style="position:static">●</span>':''}</div>`).join(''):emptyState('🔕','All clear','No alerts in this category.')}</div>`};
PAGES.alerts.init=()=>{$('#af').onclick=e=>{const b=e.target.closest('.pill');if(b){PAGES.alerts.f=b.dataset.f;route()}};$('#markall').onclick=()=>{state.alerts.forEach(a=>a.unread=false);badge();route();toast('All alerts marked as read','ok')}};

PAGES.community=()=>`<div class="view"><div class="ph"><div><h1>Community</h1><p>Neighbours helping neighbours — support, volunteer, share.</p></div></div>
<div class="grid g4" style="margin-bottom:18px">${ACHIEVE.map(a=>`<div class="card hov" style="text-align:center"><div style="font-size:2rem">${a.e}</div><b style="font-family:Poppins;font-size:1.4rem;color:var(--navy)">${a.n}</b><p style="color:var(--muted);font-size:.88rem">${a.d}</p></div>`).join('')}</div>
<div class="grid g2"><div class="card"><h3>🧹 Upcoming clean-up drives & volunteering</h3>${DRIVES.map(d=>{const j=state.joined.has(d.id);return `<div class="drive" style="padding:12px 0;border-bottom:1px solid var(--line)"><div class="dt"><b>${d.m}</b><span>${d.d}</span></div><div style="flex:1"><b>${d.t}</b><br><small style="color:var(--muted)">📍 ${d.w} · +${d.xp} XP</small><div class="bar" style="margin-top:6px"><i style="width:${(d.go+(j?1:0))/d.max*100}%"></i></div><small>${d.go+(j?1:0)}/${d.max} volunteers</small></div><button class="btn btn-sm ${j?'btn-g':'btn-p'}" data-join="${d.id}">${j?'✓ Joined':'Join'}</button></div>`}).join('')}</div>
<div class="card"><h3>🔥 Most-supported open issues</h3>${state.issues.filter(i=>i.status!=='resolved').sort((a,b)=>b.up-a.up).slice(0,4).map(i=>`<div style="display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)"><span style="font-size:1.6rem">${CATS[i.cat].e}</span><div style="flex:1;cursor:pointer" data-open="${i.id}"><b>${esc(i.title)}</b><br><small style="color:var(--muted)">${wardN(i.ward)} · ${chip(i).replace(/<[^>]+>/g,'')}</small></div><button class="up ${state.upvoted.has(i.id)?'on':''}" data-up="${i.id}">👍 <span>${i.up+(state.upvoted.has(i.id)?1:0)}</span></button></div>`).join('')}</div></div>
<div class="card feed" style="margin-top:18px"><h3>📣 Community updates</h3><form id="postf" style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap"><input style="flex:1;min-width:200px;padding:11px 14px;border-radius:12px;border:1.5px solid var(--line);background:var(--card)" id="ptxt" placeholder="Share an update with your neighbours…" aria-label="Share update"><label class="btn btn-o btn-sm" style="cursor:pointer">📷<input type="file" accept="image/*" class="sr" id="pimg"></label><button class="btn btn-n btn-sm">Post</button></form><div id="posts">${POSTS.map(p=>`<div class="post"><div class="cm"><span class="av" style="background:${p.c}">${p.u[0]}</span><div style="flex:1;background:none;padding:0"><b>${p.u}</b> <small style="color:var(--muted)">${p.when}</small><p>${p.t}</p><div style="${catBg('park')};height:90px;border-radius:12px;display:grid;place-items:center;font-size:2.4rem;margin:8px 0">${p.e}</div><button class="up" data-like>❤️ <span>${p.l}</span></button></div></div></div>`).join('')}</div></div></div>`;
PAGES.community.init=()=>{$$('[data-join]').forEach(b=>b.onclick=()=>{const id=+b.dataset.join;if(state.joined.has(id)){state.joined.delete(id);toast('You left the drive')}else{state.joined.add(id);addXP(DRIVES.find(d=>d.id===id).xp,'joined a drive');confetti()}store.set('joined',[...state.joined]);route()});
  $$('[data-like]').forEach(b=>b.onclick=()=>{const s=$('span',b);const on=b.classList.toggle('on');s.textContent=+s.textContent+(on?1:-1)});
  $('#postf').onsubmit=e=>{e.preventDefault();const t=$('#ptxt').value.trim();if(!t){toast('Write something first');return}const p=document.createElement('div');p.className='post';p.innerHTML=`<div class="cm"><span class="av" style="background:var(--saffron)">${ME.avatar[0]}</span><div style="flex:1;background:none;padding:0"><b>${ME.name}</b> <small style="color:var(--muted)">just now</small><p>${esc(t)}</p></div></div>`;$('#posts').prepend(p);$('#ptxt').value='';addXP(5,'community post')}};

PAGES.about=()=>`<div class="view"><div class="ph"><div><h1>About NagarSaathi</h1><p>Community & City Partnership</p></div></div>
<div class="card" style="display:grid;grid-template-columns:200px 1fr;gap:26px;align-items:center"><img src="assets/logo-512.png" alt="NagarSaathi logo" style="width:200px;border-radius:50%;box-shadow:var(--shadow-h);margin:auto"><div><h2 style="color:var(--navy);margin-bottom:6px">नगर साथी — Your partner in building a better city</h2><p style="color:var(--muted)">NagarSaathi is a civic-tech platform that helps citizens report city problems, track them until resolution, and work together with city departments. Our motto — <b>सेवा • सहभागिता • विकास</b> (Service • Participation • Development) — guides every feature.</p><p style="margin-top:10px"><em>Building Better Cities, One Fix at a Time.</em></p><div class="pills" style="margin-top:14px"><a class="btn btn-g btn-sm" target="_blank" rel="noopener" href="https://wa.me/917796636077">💬 WhatsApp us</a><a class="btn btn-o btn-sm" href="#/report">Report an issue</a></div></div></div>
<div class="grid g3" style="margin-top:18px">${[['👁️','Transparency','Every complaint has a public timeline and a responsible department.'],['🤝','Participation','Citizens support, comment, volunteer and celebrate wins together.'],['📈','Accountability','Ward scores and resolution rates keep everyone accountable.']].map(x=>`<div class="card hov"><div style="font-size:2rem">${x[0]}</div><h3>${x[1]}</h3><p style="color:var(--muted)">${x[2]}</p></div>`).join('')}</div>
<div class="card" style="margin-top:18px;text-align:center"><p style="color:var(--muted);font-size:.9rem">NagarSaathi · <em>Building Better Cities, One Fix at a Time.</em></p><p style="margin-top:4px;font-size:.88rem">Founded by <b>Guddu Kumar</b></p></div></div>`;

/* ---------- Router ---------- */
const NAV=[['dashboard','📊','Dashboard'],['report','📸','Report Issue'],['map','🗺️','City Map'],['issues','🔎','Issue Tracker'],['rewards','🏆','Rewards'],['wards','🏘️','Wards'],['alerts','🔔','Alerts'],['community','🤝','Community'],['about','ℹ️','About']];
function badge(){const n=state.alerts.filter(a=>a.unread).length;const d=$('#abadge');d.textContent=n;d.style.display=n?'grid':'none'}
function route(){const h=(location.hash.replace('#/','')||'home').split('?')[0];const name=PAGES[h]?h:'home';const home=name==='home';
  $('#side').style.display=home?'none':'';$('#burger').style.display='';$('main').className=home?'full':'';
  $('#side nav').innerHTML=NAV.map(n=>`<a href="#/${n[0]}" class="${n[0]===name?'on':''}"><span class="ic">${n[1]}</span>${n[2]}</a>`).join('');
  $$('.nav-top a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#/'+name||(home&&a.getAttribute('href')==='#/home')));
  $('#view').innerHTML=PAGES[name]();$('#side').classList.remove('open');
  PAGES[name].init&&PAGES[name].init();counts();tipOn($('#view'));
  $('#sidexp').innerHTML=`<b>⭐ ${state.xp} XP</b><div class="bar" style="margin:6px 0"><i style="width:${(state.xp%500)/5}%"></i></div><small>Level ${Math.floor(state.xp/500)+1} · 🔥 ${ME.streak}-day streak</small>`;
  document.title=(name==='home'?'':NAV.find(n=>n[0]===name)[2]+' · ')+'NagarSaathi — Community & City Partnership';
  window.scrollTo({top:0})}
window.addEventListener('hashchange',route);
$('#theme').onclick=()=>{const d=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=d;store.set('theme',d);$('#theme').textContent=d==='dark'?'☀️':'🌙';$('#theme').setAttribute('aria-pressed',d==='dark')};
$('#burger').onclick=()=>$('#side').classList.toggle('open');
$('#bell').onclick=()=>{location.hash='#/alerts'};
(function init(){const t=store.get('theme',matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;$('#theme').textContent=t==='dark'?'☀️':'🌙';badge();route()})();

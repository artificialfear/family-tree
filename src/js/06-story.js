/* ---------- story mode ---------- */
let si=-1,auto=null,spotT=[];
// names as they appear in each chapter's text, in reading order -> person
const MN=[[],
 [['William Marian Graham','william'],['Linda Thomas Roach','linda'],['Jack','jack']],
 [['Jack','jack']],
 [['Margaret E. Lush','margaret']],
 [['Earl','earl'],['Sara Lee Harper','sara'],['Johnnie Lee','johnny']],
 [['Jack','jack'],['Margaret','margaret'],['Richard','richard'],['Norma','norma'],['Evelyn','evelyn'],['Eileen','eileen'],['Donna','donna'],['Wayne','wayne'],['Bruce','bruce'],['Ed','ed']],
 [['Johnnie Lee Harper','johnny'],['Annie Mae Ralston','annie'],['Renee','renee'],['Pam','pam'],['John','johnh'],['Jeff','jeff']],
 [['Ed Graham','ed'],['Renee Harper','renee']],
 [['Ed','ed'],['Renee','renee'],['Chris','chris'],['Mat','mat'],['Jon','jon'],['Dustin','dustin'],['Amanda','amanda'],['Emily','emily'],['Jessica','jessica'],['Lydia','lydia'],['Lilly','lilly'],['Maddie','maddie'],['Dustin Jr','dustinjr']],
 [['Amber','amber'],['Steven','stevenn'],['Brandon','brandon'],['Jeremy','jeremy'],['Michael','michael'],['Andrew','andrew'],['Alissa','alissa'],['Malik','malik'],['Ashley','ashley'],['Shelby','shelby'],['Kayla','kayla'],['John John','johnjohn'],['Chasity','chasity'],['Amber','amberl'],['Ashley','ashleyl'],['Shannon','shannon'],['Jacob','jacob']],
 [['Ed','ed'],['Johnnie','johnny'],['Annie Mae','annie']]];
function markNames(t,ms){let out='',pos=0;
  (ms||[]).forEach(([fr,id])=>{if(!byId[id])return;const re=new RegExp('\\b'+fr.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','g');re.lastIndex=pos;const m=re.exec(t);if(!m)return;
    out+=esc(t.slice(pos,m.index))+`<span class="mn" data-id="${id}" tabindex="0" role="button" aria-label="Show ${esc(byId[id].n)} on the tree">${esc(m[0])}</span>`;pos=m.index+m[0].length;});
  return out+esc(t.slice(pos));}
function spotlight(id){const lf=tw.querySelector(`.leaf[data-id="${CSS.escape(id)}"]`);if(!lf)return;lf.classList.remove('wait','dim','spot');void lf.getBBox();lf.classList.add('spot');
  clearTimeout(lf._st);lf._st=setTimeout(()=>lf.classList.remove('spot'),1400);}
function clearSpots(){spotT.forEach(clearTimeout);spotT=[];tw.querySelectorAll('.leaf.wait,.leaf.spot').forEach(c=>c.classList.remove('wait','spot'));}
function runSpots(s){clearSpots();const spans=[...$('#cap').querySelectorAll('.mn')];
  // phones: no pulsing inside the tree (each pulse makes the phone redraw the whole tree picture)
  if(RM||PHONE()){spans.forEach(x=>x.classList.add('lit'));return;}
  (s.f||[]).forEach(id=>{const lf=tw.querySelector(`.leaf[data-id="${CSS.escape(id)}"]`);lf&&lf.classList.add('wait');});
  const seen=new Set();let t=250;
  spans.forEach(x=>{const id=x.dataset.id;spotT.push(setTimeout(()=>{x.classList.add('lit');spotlight(id);},t));seen.add(id);t+=650;});
  const rest=(s.f||[]).filter(id=>!seen.has(id));
  if(rest.length)spotT.push(setTimeout(()=>rest.forEach(spotlight),t+150));}
function startStory(){musicFor('story');clearTimeout(hintT);$('#hint').classList.remove('on');location.hash='tree';tTouched=1;si=0;phF=0;tw.classList.add('story');document.body.classList.add('storyon');requestAnimationFrame(()=>{$('#tstage').scrollIntoView({behavior:RM?'auto':'smooth',block:innerWidth<600?'start':'nearest'});showStep();});}
// auto-play: each chapter stays up long enough to read it (about 200 words a minute, plus time for the move)
const readMs=s=>Math.max(9000,Math.min(28000,3000+s.t.split(/\s+/).length*300));
// a small map in the corner of the story card: this chapter's town glows gold, earlier towns stay as faint dots.
// Georgia-only chapters use the Georgia close-up (on the regional map its towns sit on top of each other).
const MAPVB={reg:[190,80,470,380],ga:[170,20,520,600]};
function storyMap(s){if(!s.pl||!s.pl.length)return'';const ga=s.pl.every(k=>GA.includes(k)),M=ga?MAP.ga:MAP.states?MAP:null;if(!M)return'';
  const st=ga?MAP.ga.states:MAP.states,pt=ga?MAP.ga.pts:MAP.pts,[vx,vy,vw,vh]=ga?MAPVB.ga:MAPVB.reg,R=vw*.028,f=n=>n.toFixed(1),core=['Georgia','Kentucky','North Carolina','Alabama','Missouri','Illinois'];
  const seen=[...new Set(STORY.slice(0,si).flatMap(c=>c.pl||[]))].filter(k=>!s.pl.includes(k)&&pt[k]&&(!ga||GA.includes(k)));
  const inV=([x,y])=>x>=vx&&x<=vx+vw&&y>=vy&&y<=vy+vh;
  const paths=st.map(o=>`<path d="${o.d}" class="${core.includes(o.n)?'smc':''}"/>`).join('');
  const trail=seen.filter(k=>inV(pt[k])).map(k=>`<circle cx="${pt[k][0]}" cy="${pt[k][1]}" r="${f(R*.62)}" class="smt"/>`).join('');
  const lit=s.pl.filter(k=>pt[k]&&inV(pt[k])).map((k,i)=>{const [x,y]=pt[k],r=i&&s.pl.length>3?R*.75:R;return `<circle cx="${x}" cy="${y}" r="${f(r*2.3)}" class="smh"/><circle cx="${x}" cy="${y}" r="${f(r)}" class="smd"/>`;}).join('');
  const cap=s.plc||PL[s.pl[0]].replace(' (Meriwether Co.)','').replace(' (Buchanan Co.)','');
  return `<figure class="smap" role="img" aria-label="Map: ${esc(s.plc?s.pl.map(k=>PL[k]).join(', '):PL[s.pl[0]])}"><div class="smbox"><svg viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${paths}${trail}${lit}</svg></div><figcaption>${esc(cap)}</figcaption></figure>`;}
let stepT=0,phF=0;const PHONE=()=>$('#tstage').clientWidth<700||TOUCH;
function showStep(){
  const s=STORY[si];storyFocus=s.f.length?s.f:null;
  const pics=(s.img?`<img src="${s.img}" alt="Jack Graham in Navy uniform">`:'')+s.f.filter(id=>photo[id]).slice(0,s.img?3:4).map(id=>`<img src="${esc(photo[id])}" alt="${esc(byId[id].n)}">`).join('');
  const last=si===STORY.length-1,ms=readMs(s);
  if(auto){clearTimeout(auto);auto=last?null:setTimeout(()=>{if(si<STORY.length-1){si++;showStep();}},ms);}
  $('#cap').innerHTML=`<div class="dots">${STORY.map((_,i)=>`<i class="${i<=si?'on':''}"></i>`).join('')}</div>${s.y?`<div class="yr">${esc(s.y)}</div>`:''}${storyMap(s)}<h3>${esc(s.h)}</h3>${pics?`<div class="ph">${pics}</div>`:''}<p>${markNames(s.t,MN[si])}</p>
   <div class="ctl">${si>0?'<button id="sPrev">Back</button>':''}${last?'<button class="pri" id="sEnd">Explore the tree</button>'+(db?'<button id="sMem">💬 Add a memory</button>':''):'<button class="pri" id="sNext">Next</button>'}${s.film&&ALLFILMS.find(f=>f.id===s.film)?`<button id="sFilm" data-film="${s.film}">▶ ${s.film==='md93h'?'Watch the home movie':`Watch ${esc(FILMS.find(f=>f.id===s.film).title.split(' ')[0])}${FILMS.find(f=>f.id===s.film).title.startsWith('Annie')?' Mae':''}'s video`}</button>`:''}<button id="sAuto" aria-pressed="${!!auto}">${auto?'Pause':'Auto-play'}</button>${last?'':'<button id="sEnd">Skip</button>'}<span class="step">${si+1} of ${STORY.length}</span></div>${auto?`<div class="aprog" aria-hidden="true"><i style="animation-duration:${ms}ms"></i></div>`:''}`;
  const cap=$('#cap');cap.classList.remove('on');void cap.offsetWidth;cap.classList.add('on');
  // move first; change the tree's highlighting only once the move has finished, so phones don't have to
  // redraw the whole tree while it is sliding (that made the picture stutter and jump)
  clearTimeout(stepT);clearSpots();
  // phones and tablets: frame the whole family once when the story starts and keep the camera still;
  // each chapter then only dims and lights people (every move had to fade the tree out and back in)
  if(PHONE()){if(!phF){phF=1;requestAnimationFrame(()=>tFrame(Object.keys(TP)));}}else requestAnimationFrame(()=>tFrame(s.f));
  // phones: change the highlighting while the tree is faded out, so it is redrawn once, out of sight
  stepT=setTimeout(()=>{if(STORY[si]!==s)return;tw.querySelectorAll('.leaf').forEach(c=>c.classList.toggle('dim',!!storyFocus&&!storyFocus.includes(c.dataset.id)));
    if(s.f.length)select(s.f[s.f.length===1?0:Math.min(1,s.f.length-1)],1);runSpots(s);},RM?0:PHONE()?120:960);
  cap.querySelectorAll('.mn').forEach(x=>{const go=()=>{x.classList.add('lit');spotlight(x.dataset.id);select(x.dataset.id,1);};
    x.addEventListener('mouseenter',()=>spotlight(x.dataset.id));x.onclick=go;x.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}};});
  sfx.page();
  $('#sPrev')&&($('#sPrev').onclick=()=>{si--;showStep();});
  $('#sNext')&&($('#sNext').onclick=()=>{si++;showStep();});
  document.querySelectorAll('#sEnd').forEach(b=>b.onclick=endStory);
  // the curtain-call: finishing the story with 'Explore the tree' also turns night to sunset (or sunset to night)
  if(last){const ex=$('#cap .pri#sEnd');if(ex)ex.onclick=()=>{endStory();setTimeout(()=>$('#tSky').click(),1100);};}
  $('#sMem')&&($('#sMem').onclick=memPick);
  $('#sAuto').onclick=()=>{if(auto){clearTimeout(auto);auto=null;}else auto=1;showStep();};
}
// last chapter → 'Add a memory': pick who it's about, then the story closes and that person's memory form opens
const MEMWHO=[['ed','Ed'],['renee','Renee'],['johnny','Johnnie'],['annie','Annie Mae'],['jack','Jack'],['margaret','Margaret']];
function memPick(){if(auto){clearTimeout(auto);auto=null;}const c=$('#cap .ctl');if(!c)return;
  c.outerHTML=`<div class="mpick"><div class="mq">Who is your memory about?</div><div class="mpl">${MEMWHO.filter(([id])=>byId[id]).map(([id,nm])=>`<button data-mw="${id}">${photo[id]?`<img src="${esc(photo[id])}" alt="">`:`<span class="mi">${esc(nm[0])}</span>`}<span>${esc(nm)}</span></button>`).join('')}<button data-mw=""><span class="mi">＋</span><span>Someone else</span></button></div><button class="mback" id="mBack">Back</button></div>`;
  const m=$('#cap .mpick');m.querySelector('[data-mw]').focus({preventScroll:true});
  $('#mBack').onclick=()=>showStep();
  m.querySelectorAll('[data-mw]').forEach(b=>b.onclick=()=>{const id=b.dataset.mw;endStory();
    setTimeout(()=>{const h=$('#hint');clearTimeout(hintT);
      if(id){h.classList.remove('on');select(id);tFocus(id);openForm('story');}
      else{h.textContent='Tap anyone’s face, then “Share a memory”';h.classList.add('on');hintT=setTimeout(()=>{h.classList.remove('on');setTimeout(()=>h.textContent='Tap any face to learn about them',600);},9000);}},950);});}
function endStory(){musicFor('tree');document.body.classList.remove('storyon');clearTimeout(stepT);clearTimeout(auto);auto=null;si=-1;setTimeout(showHint,900);clearSpots();storyFocus=null;tw.classList.remove('story');tw.querySelectorAll('.leaf.dim').forEach(c=>c.classList.remove('dim'));$('#cap').classList.remove('on');select('renee',1);setTimeout(()=>innerWidth<600?tFrame(TCORE):tFit(true),50);}
addEventListener('keydown',e=>{if(si<0)return;if(e.key==='ArrowRight'&&si<STORY.length-1){si++;showStep();}else if(e.key==='ArrowLeft'&&si>0){si--;showStep();}else if(e.key==='Escape')endStory();});
$('#storyBtn').onclick=$('#tStory').onclick=()=>{sfx.ctx();startMusic('story');startStory();};
/* ---------- full screen tree ---------- */
const fsEl=()=>document.fullscreenElement||document.webkitFullscreenElement;
// corner button for the browser's own full screen. Phones and tablets don't switch on their own any more
// (Android showed a black screen while it happened), so this lets them choose it. Hidden where the browser
// can't do it (iPhone Safari) and when the site was opened from the home screen, which is already full screen.
{const bf=$('#bFull'),d=document.documentElement,can=!!(document.fullscreenEnabled||document.webkitFullscreenEnabled)&&!!(d.requestFullscreen||d.webkitRequestFullscreen),
  app=matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches;
  const IN='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    OUT='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const show=()=>{const on=!!fsEl();bf.innerHTML=on?OUT:IN;const t=on?'Exit full screen':'Full screen';bf.setAttribute('aria-label',t);bf.title=t;};
  if(bf&&STAGE&&can&&!app){bf.hidden=false;show();
    bf.onclick=()=>{try{if(fsEl())(document.exitFullscreen||document.webkitExitFullscreen).call(document);else{const p=(d.requestFullscreen||d.webkitRequestFullscreen).call(d);if(p&&p.catch)p.catch(()=>{});}}catch(e){}};
    ['fullscreenchange','webkitfullscreenchange'].forEach(ev=>document.addEventListener(ev,show));}}
function refit(){setTimeout(()=>{if(si>=0&&PHONE())tFrame(Object.keys(TP));else if(si>=0&&storyFocus)tFrame(storyFocus);else tFit();},80);}
function setFull(on,quiet){const b=document.body;if(STAGE&&!on)return null;if(on===b.classList.contains('tfull'))return null;let pr=null;
  b.classList.toggle('tfull',on);b.classList.remove('pdrawer');hidePop();
  $('#tFull').textContent=on?'✕ Exit full screen':'⤢ Full screen';$('#tFull').setAttribute('aria-pressed',on);
  if(on){if(location.hash!=='#tree')location.hash='tree';const d=document.documentElement,rq=TOUCH?null:d.requestFullscreen||d.webkitRequestFullscreen;try{const p=rq&&rq.call(d);if(p&&p.then)pr=p.then(()=>new Promise(r=>setTimeout(r,140)),()=>{});}catch(e){}}
  else if(fsEl()){try{(document.exitFullscreen||document.webkitExitFullscreen).call(document);}catch(e){}}
  if(!quiet)refit();return pr;}
$('#tFull').onclick=()=>{tTouched=1;setFull(!document.body.classList.contains('tfull'));};

['fullscreenchange','webkitfullscreenchange'].forEach(ev=>document.addEventListener(ev,()=>{if(!fsEl()&&document.body.classList.contains('tfull'))setFull(false);else refit();}));
addEventListener('keydown',e=>{if(STAGE&&e.key==='Escape'&&document.body.classList.contains('sheeton')&&!$('#lb').classList.contains('on')){if(document.body.classList.contains('pdrawer'))document.body.classList.remove('pdrawer');else location.hash='tree';return;}if(e.key!=='Escape'||!document.body.classList.contains('tfull')||$('#lb').classList.contains('on')||si>=0)return;
  if(document.body.classList.contains('pdrawer'))document.body.classList.remove('pdrawer');else setFull(false);},true);
addEventListener('hashchange',()=>{if(location.hash&&location.hash!=='#tree')setFull(false);});


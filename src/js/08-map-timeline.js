/* ---------- map ---------- */
let mapMode='region',mapSel=null;
function drawMap(){
  const ga=mapMode==='ga',st=ga?MAP.ga.states:MAP.states,pt=ga?MAP.ga.pts:MAP.pts,core=['Georgia','Kentucky','North Carolina','Alabama','Missouri','Illinois'];
  const used={};EV.forEach(e=>{if(e.p)(used[e.p]??=[]).push(e);});
  let s=st.map(o=>`<path class="st${core.includes(o.n)?' core':''}" d="${o.d}"/>`).join('');
  if(!ga)s+=MAP.labels.filter(l=>core.includes(l.n)&&l.n!=='Georgia').map(l=>`<text class="stl" x="${l.x}" y="${l.y+40}">${l.n}</text>`).join('');
  s+=Object.keys(used).map((k,i)=>{const [x,y]=pt[k];if(x<0||y<0||x>900||y>640)return'';const isGa=GA.includes(k);const [dx,dy,an]=LBL[k];
    const lab=(!ga&&isGa)?'':`<text x="${x+dx}" y="${y+dy}" text-anchor="${an}">${esc(PL[k].split(',')[0].replace(' (Meriwether Co.)','').replace(' (Buchanan Co.)',''))}</text>`;
    return `<g class="pt${mapSel===k?' on':''}" data-p="${k}" tabindex="0" role="button" aria-label="${esc(PL[k])}"><circle cx="${x}" cy="${y}" r="${5+Math.min(used[k].length,4)*1.6}" style="animation-delay:${i*60}ms"/>${lab}</g>`;}).join('');
  if(!ga){const [x,y]=MAP.pts.atlanta;s+=`<g class="pt"><text x="${x+18}" y="${y+56}" text-anchor="start">Georgia — 6 places</text></g>`;}
  $('#map').innerHTML=s;
  const list=mapSel?used[mapSel]:null;
  $('#mapInfo').innerHTML=list?`<h3 style="margin:0 0 8px;font-size:24px">${esc(PL[mapSel])}</h3>${evList(list)}`:`<p class="note">${ga?'Tap a dot to see who lived there.':'The family\'s story starts in North Carolina and Kentucky, and comes together in middle Georgia. Tap a dot, or open the Georgia close-up.'}</p>`;
}
const evList=l=>`<ol class="tl">${l.map(e=>`<li><span class="yr">${e.y?((e.a?'c. ':'')+e.y):'—'}</span><span>${esc(e.t)} ${e.w.map(id=>`<a data-go="${id}">${esc(byId[id]?.s||'')}</a>`).join(', ')}<br>${badge(e.c)}${sup(e.s)}</span></li>`).join('')}</ol>`;
function openPlace(k){setFull(false);mapMode=['covington','newborn','greenville','collegepark','atlanta','upson'].includes(k)?'ga':'region';mapSel=k;location.hash='places';setTimeout(()=>{drawMap();$('#v-places').scrollIntoView({behavior:RM?'auto':'smooth'});},150);}
tsvg.addEventListener('keydown',e=>{const rp=e.target.closest?.('.rootpin');if(rp&&(e.key==='Enter'||e.key===' ')){e.preventDefault();showPlace(rp,true);}});
/* hometown pop-ups: hover (mouse) or tap a root's glowing marker */
let placePinned=false,placeT=null,placeKey=null;
function showPlace(pin,pin2){const k=pin.dataset.p,name=PL_NAMES[k]||PL[k]||k;clearTimeout(placeT);if(pin2)placePinned=true;
  if(placeKey===k&&!$('#mnote').hidden)return;placeKey=k;
  const evs=EV.filter(e=>e.p===k).sort((a,b)=>(a.y||0)-(b.y||0)),who=[...new Set(evs.flatMap(e=>e.w||[]))].filter(id=>byId[id]);
  const faces=who.slice(0,8).map(id=>`<button class="pf" data-go="${id}" title="${esc(byId[id].n)}">${photo[id]?`<img src="${esc(photo[id])}" alt="">`:`<span>${esc(initials(byId[id].s))}</span>`}<i>${esc(byId[id].s.split(' ')[0])}</i></button>`).join('');
  const r=$('#tstage').getBoundingClientRect(),q=pin.querySelector('.pd').getBoundingClientRect();
  showNote(`<div class="place"><div class="g1">${esc(name)}</div>${evs.length?`<ul>${evs.slice(0,8).map(e=>`<li><b>${e.y?(e.a?'c. ':'')+e.y:''}</b> ${esc(e.t)}</li>`).join('')}</ul>`:'<p>Part of the family story.</p>'}${faces?`<div class="pfaces">${faces}</div>`:''}<button class="maplink" data-map="${k}">See it on the map →</button></div>`,q.left-r.left+q.width/2,q.bottom-r.top);
  who.forEach((id,i)=>setTimeout(()=>spotlight(id),i*120));
  const n=$('#mnote');n.classList.add('placenote');
  n.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{n.hidden=true;placeKey=null;select(b.dataset.go);tFocus(b.dataset.go);});
  n.querySelector('[data-map]').onclick=()=>{n.hidden=true;placeKey=null;openPlace(k);};}
function hidePlace(){placeT=setTimeout(()=>{if(!placePinned){$('#mnote').hidden=true;placeKey=null;}},350);}
tsvg.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse')return;const rp=e.target.closest('.rootpin');if(rp){if(placeKey!==rp.dataset.p||$('#mnote').hidden)placePinned=false;showPlace(rp,false);}});
tsvg.addEventListener('pointerout',e=>{if(e.pointerType!=='mouse')return;const rp=e.target.closest('.rootpin');if(rp&&!rp.contains(e.relatedTarget))hidePlace();});
$('#mnote').addEventListener('pointerenter',()=>clearTimeout(placeT));
$('#mnote').addEventListener('pointerdown',()=>{if(placeKey)placePinned=true;});
$('#mnote').addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&placeKey)hidePlace();});
$('#map').addEventListener('click',e=>{const g=e.target.closest('[data-p]');if(!g)return;mapSel=g.dataset.p;sfx.chime();drawMap();});
$('#map').addEventListener('keydown',e=>{const g=e.target.closest('[data-p]');if(g&&e.key==='Enter'){mapSel=g.dataset.p;drawMap();}});
$('#mRegion').onclick=()=>{mapMode='region';$('#mRegion').className='pri';$('#mGa').className='';drawMap();};
$('#mGa').onclick=()=>{mapMode='ga';$('#mGa').className='pri';$('#mRegion').className='';drawMap();};
document.addEventListener('click',e=>{const g=e.target.closest('#mapInfo [data-go], #tl [data-go]');if(!g)return;location.hash='tree';select(g.dataset.go);setTimeout(()=>tFocus(g.dataset.go),80);});

/* ---------- timeline & sources ---------- */
function drawTimeline(){
  const extra=contribs.filter(c=>c.type==='person'&&/^\d{4}$/.test(c.born||'')).map(c=>({y:+c.born,t:c.name+' is born.',w:['c_'+c.id],c:'family',s:[]}));
  $('#tl').innerHTML=evList([...EV.filter(e=>e.y),...extra].sort((a,b)=>a.y-b.y)).replace(/^<ol class="tl">|<\/ol>$/g,'');
  $('#srcs').innerHTML=SK.map(k=>`<li id="s-${k}">${SRC[k].u?`<a href="${SRC[k].u}" target="_blank" rel="noopener">${esc(SRC[k].t)}</a>`:esc(SRC[k].t)}</li>`).join('');
  $('#gaps').innerHTML=GAPS.map(g=>`<li>${esc(g)}</li>`).join('');
}

/* ---------- views ---------- */
let fitted=0;
function route(){const h=location.hash.slice(1),v=['tree','help','chart','places','timeline','sources'].includes(h)?h:'tree';
  // stage theme: the tree stays on stage and every other section opens as a page over it
  if(STAGE){document.querySelectorAll('.view').forEach(s=>{const me=s.id==='v-'+v;s.classList.toggle('on',s.id==='v-tree'||me);s.classList.toggle('sheet',me&&v!=='tree');});
    document.body.classList.toggle('sheeton',v!=='tree');if(v!=='tree'){const sh=$('#v-'+v);sh.scrollTop=0;if(!sh.querySelector('.shclose'))sh.insertAdjacentHTML('afterbegin','<button class="shclose" aria-label="Back to the tree">✕ Back to the tree</button>');}}
  else document.querySelectorAll('.view').forEach(s=>s.classList.toggle('on',s.id==='v-'+v));
  document.querySelectorAll('#tabs a').forEach(a=>a.setAttribute('aria-current',a.dataset.v===v));
  hidePop();if(v!=='tree'&&si>=0)endStory();
  if(v==='tree'||v==='chart'){const wrap=$(`#v-${v} .treewrap`);if($('#panel').parentNode!==wrap)wrap.appendChild($('#panel'));}
  if(v==='help')renderHelp();
  if(v==='tree')requestAnimationFrame(()=>{if(!tFitted){tStart();tFitted=1;}});
  if(v==='chart')requestAnimationFrame(()=>{if(!fitted){initView();fitted=1;}});}
addEventListener('hashchange',route);
new ResizeObserver(()=>{if(!$('#v-chart').classList.contains('on'))return;if(!touched)initView();}).observe($('#stage'));
new ResizeObserver(()=>{if(!$('#v-tree').classList.contains('on')||G)return;if(si>=0)tFrame(STORY[si].f,false);else if(!tTouched)tStart();}).observe($('#tstage'));

function refresh(){build();drawTree(false);apply(false);drawLeafTree(false);renderPanel(false);drawTimeline();drawMap();}
refresh();route();


/* stage theme: Program menu and Can you help? in the stage toolbar */
if(STAGE){document.body.classList.add('stagemode');$('#tFull').hidden=true;$('#tHelp').hidden=false;$('.progwrap').hidden=false;
  const pb=$('#tProg'),pm=$('#prog'),shut=()=>{pm.hidden=true;pb.setAttribute('aria-expanded','false');};
  pb.onclick=e=>{e.stopPropagation();const o=pm.hidden;pm.hidden=!o;pb.setAttribute('aria-expanded',String(o));};
  pm.addEventListener('click',()=>shut());document.addEventListener('pointerdown',e=>{if(!e.target.closest('.progwrap'))shut();});
  $('#tHelp').onclick=()=>{location.hash='help';};
  document.addEventListener('click',e=>{if(e.target.closest('.shclose'))location.hash='tree';});
  if(location.hash&&location.hash!=='#tree')document.body.classList.add('tfull');}

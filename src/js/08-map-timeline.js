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

/* ---------- keepsake chest ---------- */
// screenshots of records, so anyone can read one without a FamilySearch account: SRC key -> [image, ...]
// captured 2026-11-23 from Mat's FamilySearch login and Legacy.com. Annie Mae's FamilySearch page is left as a link: it's someone else's unsourced entry with a typo in its dates.
const KEEPIMG={census40:['photos/records/census40.jpg'],obitJohnny:['photos/records/obitJohnny.jpg'],obitEd:['photos/records/obitEd.jpg'],obitNorma:['photos/records/obitNorma.jpg'],treeJack:['photos/records/treeJack.jpg'],treeMargaret:['photos/records/treeMargaret.jpg']};
function renderKeepsakes(){const pics=$('#kpics');if(!pics)return;renderKeepDyn();if(pics.dataset.done)return;pics.dataset.done=1;
  $('#kfilms').innerHTML=ALLFILMS.filter(f=>!f.hide).map(f=>`<button type="button" class="kfilm" data-film="${f.id}"><span class="kfpic"><img src="${f.poster}" alt="" loading="lazy"><i aria-hidden="true">▶</i></span><span class="kftx"><b>${esc(f.title)}</b><span>${esc(f.sub)}</span><small>${esc(f.by)} · ${f.dur}</small></span></button>`).join('');
  pics.innerHTML=KEEP.photos.map(([u,c])=>`<button type="button" class="kpic" data-u="${esc(u)}" data-c="${esc(c)}"><img src="${esc(u)}" alt="" loading="lazy"><span>${esc(c)}</span></button>`).join('');
  pics.onclick=e=>{const b=e.target.closest('.kpic');if(b)openLb(b.dataset.u,b.dataset.c,b.dataset.c);};
  $('#krecs').innerHTML=KEEP.records.filter(k=>SRC[k]).map(k=>{const s=SRC[k],[t,...rest]=s.t.split(' — ');const ic=/obituary/i.test(s.t)?'📰':/census/i.test(s.t)?'📜':'🌳',im=KEEPIMG[k];
    const inner=`<span class="kic" aria-hidden="true">${ic}</span><span><b>${esc(t)}</b>${rest.length?`<small>${esc(rest.join(' — '))}</small>`:''}${im?'<small class="kview">Tap to read it</small>':''}</span>`;
    return im?`<button type="button" class="krec" data-img="${esc(im[0])}" data-cap="${esc(t)}">${inner}</button>`:`<a class="krec" href="${esc(s.u)}" target="_blank" rel="noopener">${inner}</a>`;}).join('');
  $('#krecs').onclick=e=>{const b=e.target.closest('[data-img]');if(b)openLb(b.dataset.img,b.dataset.cap,b.dataset.cap+' — tap anywhere to close',true);};
  $('#kadd').hidden=!assets;}
// recipes and traditions change as people add them: redrawn on every refresh
function renderKeepDyn(){const R=$('#krecipes'),T=$('#ktrads');if(!R)return;const by=(a,b)=>(a.at||0)-(b.at||0),mine=c=>c.by&&c.by===me;
  const lines=t=>String(t||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const editBtn=c=>mine(c)?`<button type="button" class="kedit" data-kedit="${esc(c.id)}">Edit</button>`:'';
  const recs=contribs.filter(isRecipe).sort(by),trads=contribs.filter(isTrad).sort(by);
  R.innerHTML=recs.length?recs.map(c=>`<details class="kcard" data-id="${esc(c.id)}"><summary><b>${esc(c.name||'A family recipe')}</b><small>From ${esc(whoOf(c))}</small></summary>
    ${c.asset?`<img src="${esc(assetUrl(c.asset))}" alt="" loading="lazy" data-lb="${esc(assetUrl(c.asset))}" class="kimg">`:''}<h4>Ingredients</h4><ul>${lines(c.note).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h4>How to make it</h4><ol>${lines(c.text).map(x=>`<li>${esc(x)}</li>`).join('')}</ol>${editBtn(c)}</details>`).join('')
    :'<p class="note">No recipes yet. Be the first to add one.</p>';
  T.innerHTML=trads.length?trads.map(c=>`<div class="kcard" data-id="${esc(c.id)}"><b>${esc(c.name||(c.type==='answer'?'A family tradition':'A family tradition'))}</b>${lines(c.text).map(x=>`<p>${esc(x)}</p>`).join('')}<small>From ${esc(whoOf(c))}${c.at?' · '+new Date(c.at).toLocaleDateString():''}</small>${editBtn(c)}</div>`).join('')
    :'<p class="note">No traditions yet. Be the first to add one.</p>';
  document.querySelectorAll('#v-keepsakes .kaddbox').forEach(d=>d.hidden=!db);const ph=$('#v-keepsakes .kph');if(ph)ph.hidden=!assets;}
$('#v-keepsakes').addEventListener('click',e=>{const im=e.target.closest('[data-lb]');if(im){openLb(im.dataset.lb,'','');return;}
  if(e.target.closest('[data-kcancel]')){renderKeepDyn();return;}
  const b=e.target.closest('[data-kedit]');if(!b)return;const c=contribs.find(x=>x.id===b.dataset.kedit);if(!c)return;const card=b.closest('.kcard'),rec=isRecipe(c);
  card.outerHTML=`<form class="form kcard eform" data-id="${esc(c.id)}"><input name="name" required maxlength="120" value="${esc(c.name||'')}" placeholder="Name">${rec?`<textarea name="note" required placeholder="Ingredients — one per line">${esc(c.note||'')}</textarea>`:''}<textarea name="text" required placeholder="${rec?'Steps — one per line':'What does the family do?'}">${esc(c.text||'')}</textarea><label class="fromf"><span>Shared by</span><input name="from" maxlength="60" value="${esc(c.from||'')}"></label><div class="erow"><button class="pri">Save changes</button><button type="button" data-kcancel>Cancel</button></div></form>`;});
$('#v-keepsakes').addEventListener('submit',async e=>{e.preventDefault();const f=e.target;if(f.classList.contains('eform')){saveEdit(f);return;}
  const t=f.dataset.f,fd=new FormData(f),btn=f.querySelector('button.pri'),msg=$('#kmsg');btn.disabled=true;btn.textContent='Saving…';
  try{const fr=String(fd.get('from')||'').trim().slice(0,60);if(fr){myName=fr;store.set('myname',fr);}
    const doc={type:t,pid:'family',from:fr,at:Date.now(),name:String(fd.get('name')||'').trim().slice(0,120),text:String(fd.get('text')||'').slice(0,4000)};if(t==='recipe')doc.note=String(fd.get('note')||'').slice(0,2000);
    let photo=null;const fl=fd.get('file');if(t==='recipe'&&fl&&fl.size)photo=await shrinkPhoto(fl);if(photo)btn.textContent='Uploading photo…';
    const r=await withCode(code=>apiPost({action:'add',code,devId,doc,photo}));if(!r.ok)throw r;await refreshContribs();renderKeepDyn();
    f.reset();f.closest('details').open=false;btn.disabled=false;btn.textContent='Add to the chest';if(msg)msg.textContent=`Saved — thank you! Your ${t} is in the chest.`;}
  catch(err){btn.disabled=false;btn.textContent='Try again';if(msg)msg.textContent=err==='cancel'?'':err==='badphoto'?'That photo couldn\'t be read. Try a different one.':(err==='locked'||err?.error==='locked')?LOCKED_MSG:'That didn\'t save. Check your internet connection and try again.';}});
/* ---------- views ---------- */
let fitted=0;
function route(){const h=location.hash.slice(1),v=['tree','help','chart','places','timeline','sources','keepsakes'].includes(h)?h:'tree';if(v==='keepsakes')renderKeepsakes();
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

/* ---------- person panel ---------- */
const badge=c=>`<span class="b ${c}"><i></i>${CL[c]}</span>`;
const sup=ss=>ss.length?`<sup>${ss.map(s=>`<a href="#sources" title="${esc(SRC[s].t)}">${SK.indexOf(s)+1}</a>`).join(', ')}</sup>`:'';
const link=id=>byId[id]?`<a data-go="${id}">${esc(byId[id].s)}</a>`:'';
function select(id,quiet){if(!byId[id])return;sel=id;document.querySelectorAll('.card').forEach(c=>c.classList.toggle('sel',c.dataset.id===id));document.querySelectorAll('#tworld .leaf').forEach(c=>c.classList.toggle('sel',c.dataset.id===id));renderPanel(true);if(!quiet&&document.body.classList.contains('tfull'))document.body.classList.add('pdrawer');}
function renderPanel(fresh){
  const p=byId[sel];if(!p)return;
  const kids=P.filter(k=>k.par.includes(p.id)),sibs=P.filter(k=>k.id!==p.id&&p.par.length&&k.par.length&&k.par.some(x=>p.par.includes(x)));
  const life=p.living?'Living':[p.b&&'Born '+p.b,p.d&&'Died '+p.d].filter(Boolean).join(' · ')||'Dates not yet known';
  const mine=contribs.filter(c=>c.pid===p.id&&c.type!=='person'&&!isKeep(c)).sort((a,b)=>(a.at||0)-(b.at||0));
  const rel=[p.par.length&&`Parents: ${p.par.map(link).join(' & ')}`,p.sp&&byId[p.sp]&&`Spouse: ${link(p.sp)}`,kids.length&&`Children: ${kids.map(k=>link(k.id)).join(', ')}`,sibs.length&&`Brothers & sisters: ${sibs.map(k=>link(k.id)).join(', ')}`].filter(Boolean).map(t=>`<div>${t}</div>`).join('');
  const el=$('#panel');
  el.innerHTML=`<button class="pclose" data-close aria-label="Close details">✕ Close</button>${photo[p.id]?`<img class="portrait" src="${esc(photo[p.id])}" alt="${esc(p.n)}">`:''}<h2>${esc(p.n)}</h2><div class="sub">${esc(life)} &nbsp;${badge(p.c)}</div>
   ${db&&canWrite?`<button class="share" data-share>💬 Share a memory of ${esc(p.g<0?p.s:p.s.split(' ')[0])}</button>`:''}
   ${filmOf(p.id)?(f=>`<button type="button" class="filmbtn" data-film="${f.id}"><img src="${f.poster}" alt=""><span><b>▶ Watch: ${esc(f.sub)}</b><small>${esc(f.by)} · ${f.dur}</small></span></button>`)(filmOf(p.id)):''}
   ${p.story?`<div class="story">${esc(p.story)}</div>`:''}
   <h3>What we know</h3><table class="facts"><tbody>${p.f.map(([l,v,c,s])=>`<tr><td>${esc(l)}</td><td>${esc(v)}${sup(s)}<div>${badge(c)}</div></td></tr>`).join('')}</tbody></table>
   ${PHOTOS[p.id]&&PHOTOS[p.id].g.length?`<h3>Photos</h3><div class="gal">${PHOTOS[p.id].g.map(x=>{const o=typeof x==='string'?{u:x,c:''}:x;return `<img src="${o.u}" alt="${esc(o.c||p.n)}" title="${esc(o.c)}" loading="lazy" data-lb="${o.u}" data-cap="${esc(o.c)}">`;}).join('')}</div>`:''}
   ${p.sibs?`<p class="note">${esc(p.sibs)}</p>`:''}
   ${rel?`<h3>Family</h3><div class="rel">${rel}</div>`:''}
   <h3>Memories &amp; photos</h3>
   ${mine.length?mine.map(c=>`<div class="contrib">${c.type==='photo'&&c.asset?`<img src="${esc(assetUrl(c.asset))}" alt="${esc(c.text||'Family photo')}" loading="lazy" data-lb="${esc(assetUrl(c.asset))}">`:''}${c.audio?`<button type="button" class="vplay" data-audio="${esc(c.audio)}">▶ Play voice memory</button>`:''}<div>${c.type==='fix'?'<b>Correction: </b>':''}${c.type==='answer'&&ASKQ[c.q]?`<b>${esc(ASKQ[c.q])}</b><br>`:''}${esc(c.text)}</div><small>From ${esc(whoOf(c))} · ${c.at?new Date(c.at).toLocaleDateString():''}${(c.by&&c.by===me)||isEditor?` · <a data-del="${esc(c.id)}" style="cursor:pointer;color:var(--clay)">remove</a>`:''}${c.by&&c.by===me&&c.type!=='fix'?` · <a data-edit="${esc(c.id)}" style="cursor:pointer;color:var(--clay)">edit</a>`:''}</small></div>`).join(''):'<p class="note">Nothing added yet.</p>'}
   ${forms(p)}`;
  if(fresh){el.classList.remove('fresh');void el.offsetWidth;el.classList.add('fresh');}
}
function forms(p){
  if(!db)return `<p class="note">Sharing memories isn't switched on yet.</p>`;
  return `<details open data-k="story"><summary>Add a memory or story</summary><form class="form" data-f="story"><textarea name="text" required placeholder="What do you remember about ${esc(p.s)}?"></textarea>
   ${canRecord()?`<div class="voice"><button type="button" class="rec" data-rec>🎤 Record a voice memory instead</button><span class="rtime" aria-live="polite"></span><audio class="rprev" controls hidden></audio><button type="button" class="rdel" data-rdel hidden>Delete recording</button></div>`:''}
   ${assets?`<label class="addph">📷 Add a photo too (optional)<input type="file" name="file" accept="image/*"></label>`:''}<p class="tip">On a phone, tap the microphone on your keyboard to talk instead of type.</p><label class="fromf"><span>Shared by</span><input name="from" required maxlength="60" autocomplete="name" placeholder="Your name — so everyone knows who shared this" value="${esc(myName)}"></label><button class="pri">Save memory</button></form></details>
  ${assets?`<details data-k="photo"><summary>Add a photo of ${esc(p.s.split(' ')[0])}</summary><form class="form" data-f="photo"><input type="file" name="file" accept="image/*" required><input name="text" placeholder="Caption — who, where, when"><label class="chk"><input type="checkbox" name="portrait" checked> Use as ${esc(p.s)}'s picture on the tree</label><label class="fromf"><span>Shared by</span><input name="from" required maxlength="60" autocomplete="name" placeholder="Your name — so everyone knows who shared this" value="${esc(myName)}"></label><button class="pri">Upload photo</button></form></details>`:''}
  <details><summary>Suggest a correction</summary><form class="form" data-f="fix"><textarea name="text" required placeholder="What's wrong or missing?"></textarea><label class="fromf"><span>Shared by</span><input name="from" required maxlength="60" autocomplete="name" placeholder="Your name — so everyone knows who shared this" value="${esc(myName)}"></label><button class="pri">Save correction</button></form></details>
  <details><summary>Add a relative</summary><form class="form" data-f="person"><input name="name" required placeholder="Full name">
   <select name="rel"><option value="parent">Parent of ${esc(p.s)}</option><option value="child">Child of ${esc(p.s)}</option><option value="spouse">Spouse of ${esc(p.s)}</option><option value="sibling">Brother or sister of ${esc(p.s)}</option></select>
   <div class="row2"><input name="born" placeholder="Born (year)"><input name="died" placeholder="Died (year)"></div>
   <label class="chk"><input type="checkbox" name="living"> Still living</label>
   <textarea name="note" placeholder="Anything else (optional)"></textarea><button class="pri">Add to tree</button></form></details>
  <p class="note" id="fmsg"></p>`;
}
$('#panel').addEventListener('click',async e=>{const rb=e.target.closest('[data-rec]');if(rb){toggleRecord(rb.closest('form'));return;}
  const rd=e.target.closest('[data-rdel]');if(rd){clearRecording(rd.closest('form'));return;}if(e.target.closest('[data-close]')){document.body.classList.remove('pdrawer');return;}if(e.target.closest('[data-share]')){openForm('story');return;}const im=e.target.closest('[data-lb]');if(im){openLb(im.dataset.lb,im.alt,im.dataset.cap);return;}const g=e.target.closest('[data-go]');if(g){select(g.dataset.go);($('#v-chart').classList.contains('on')?focusOn:tFocus)(g.dataset.go);return;}
  const ed=e.target.closest('[data-edit]');if(ed){const c=contribs.find(x=>x.id===ed.dataset.edit);if(c){const box=ed.closest('.contrib');box.innerHTML=`<form class="form eform" data-id="${esc(c.id)}"><textarea name="text" required>${esc(c.text||'')}</textarea><div class="erow"><button class="pri">Save changes</button><button type="button" data-ecancel>Cancel</button></div></form>`;box.querySelector('textarea').focus();}return;}
  if(e.target.closest('[data-ecancel]')){renderPanel(false);return;}
  const d=e.target.closest('[data-del]');if(d&&db){d.textContent='removing…';try{const r=await withCode(code=>apiPost({action:'del',code,devId,id:d.dataset.del}));if(!r.ok)throw 0;await refreshContribs();}catch(err){if(err!=='cancel')d.textContent='could not remove';else d.textContent='remove';}}});
$('#panel').addEventListener('submit',async e=>{e.preventDefault();if(e.target.classList.contains('eform')){saveEdit(e.target);return;}const f=e.target,t=f.dataset.f,fd=new FormData(f),btn=f.querySelector('button.pri'),msg=$('#fmsg');
  if(f._recording){if(msg)msg.textContent='Tap Stop to finish your recording first.';return;}
  btn.disabled=true;btn.textContent='Saving…';
  try{const fr=String(fd.get('from')||'').trim().slice(0,60);if(fr){myName=fr;store.set('myname',fr);}const doc={type:t,pid:sel,by:me||'',from:fr,at:Date.now(),text:String(fd.get('text')||'').slice(0,4000)};
    let photo=null;
    if(t==='photo'){photo=await shrinkPhoto(fd.get('file'));doc.portrait=fd.get('portrait')==='on';}
    if(t==='story'){const fl=fd.get('file');if(fl&&fl.size)photo=await shrinkPhoto(fl);}
    if(t==='person'){Object.assign(doc,{of:sel,name:String(fd.get('name')).slice(0,120),rel:fd.get('rel'),born:String(fd.get('born')||'').slice(0,20),died:String(fd.get('died')||'').slice(0,20),living:fd.get('living')==='on',note:String(fd.get('note')||'').slice(0,2000)});}
    let audio=null;if(t==='story'&&f._voice){audio=await blobToB64(f._voice.blob);audio={b64:audio,mime:f._voice.mime};}
    btn.textContent=audio?'Uploading voice memory…':photo?'Uploading photo…':'Saving…';
    const r=await withCode(code=>apiPost({action:'add',code,devId,doc,photo,audio}));if(!r.ok)throw r;
    await refreshContribs();sfx.chime();const m2=$('#fmsg');if(m2)m2.textContent=STAGE?'Saved — thank you! It\'s growing in the memory garden.':'Saved — thank you!';
  }catch(err){btn.disabled=false;btn.textContent='Try again';if(msg)msg.textContent=err==='cancel'?'':err==='badphoto'?'That photo couldn\'t be read. Try a different one.':(err==='locked'||err?.error==='locked')?LOCKED_MSG:'That didn\'t save. Check your internet connection and try again.';}});

// doc: a record screenshot, shown full width and scrollable so the words stay readable on a phone
function openLb(u,a,c,doc){$('#lbImg').src=u;$('#lbImg').alt=a||'';$('#lbCap').textContent=c||'';$('#lb').classList.toggle('doc',!!doc);$('#lb').scrollTop=0;$('#lb').classList.add('on');}
const closeLb=()=>$('#lb').classList.remove('on');$('#lb').onclick=closeLb;addEventListener('keydown',e=>{if(e.key==='Escape')closeLb();});
function openForm(k){const d=$(`#panel details[data-k="${k}"]`);if(!d)return;d.open=true;d.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});
  const f=d.querySelector(k==='photo'?'input[type=file]':'textarea');if(f)setTimeout(()=>f.focus({preventScroll:true}),RM?0:450);}
/* ---------- help page ---------- */
const ASK=[
 {id:'q1',pid:'jack',q:'After both of his parents died in 1930, who raised Jack? Did he ever talk about growing up in North Carolina?'},
 {id:'q2',pid:'jack',q:'What do you know about Jack’s time in the Navy during World War II — where he served, or stories he told?'},
 {id:'q3',pid:'margaret',q:'How did Margaret come to Georgia, and how did she and Jack meet?'},
 {id:'q4',pid:'margaret',q:'When and where did Jack and Margaret get married?'},
 {id:'q5',pid:'annie',q:'Who were Annie Mae’s parents? Where and when was she born?'},
 {id:'q6',pid:'annie',q:'What year did Annie Mae pass away?'},
 {id:'q7',pid:'johnny',q:'How did Johnnie and Annie Mae meet, and when did they marry?'},
 {id:'q8',pid:'earl',q:'What do you remember hearing about Earl and Sara Lee Harper, Johnnie’s parents?'},
 {id:'q9',pid:'ed',q:'How did Ed and Renee meet?'}];
// q10 ("Is there a family tradition, recipe or holiday memory…") was retired 2026-11-23: old answers to it show in the keepsake chest as traditions
const ASKQ=Object.fromEntries(ASK.map(a=>[a.id,a.q]));
const avatar=id=>photo[id]?`<img class="av" src="${esc(photo[id])}" alt="">`:`<div class="av" aria-hidden="true">${esc(initials(byId[id].s))}</div>`;
function renderHelp(){
  const can=db&&canWrite,note='Sharing answers isn\'t switched on yet.';
  $('#asks').innerHTML=ASK.filter(a=>byId[a.pid]).map(a=>{const ans=contribs.filter(c=>c.type==='answer'&&c.q===a.id).sort((x,y)=>(x.at||0)-(y.at||0));
    return `<div class="ask">${avatar(a.pid)}<div><p class="who">About <a data-go="${a.pid}" href="#tree">${esc(byId[a.pid].n)}</a></p><p class="q">${esc(a.q)}</p>
     ${ans.map(c=>`<div class="ans">${esc(c.text)}<br><small>From ${esc(whoOf(c))} · ${c.at?new Date(c.at).toLocaleDateString():''}</small></div>`).join('')}
     ${can?`<form class="form" data-ask="${a.id}" data-pid="${a.pid}"><textarea name="text" required placeholder="${ans.length?'Add to what’s been shared':'What you know or remember'}"></textarea><label class="fromf"><span>Shared by</span><input name="from" required maxlength="60" autocomplete="name" placeholder="Your name — so everyone knows who shared this" value="${esc(myName)}"></label><button class="pri">Save answer</button><span class="note amsg"></span></form>`:`<p class="note">${note}</p>`}</div></div>`;}).join('');
  const want=P.filter(p=>!photo[p.id]&&!String(p.id).startsWith('c_')).sort((a,b)=>b.g-a.g||a.ord-b.ord);
  $('#wanted').innerHTML=want.length?want.map(p=>`<button data-want="${p.id}"><span class="ini">${esc(initials(p.s))}</span>${esc(p.s)}</button>`).join(''):'<p class="note">Everyone has a photo — thank you!</p>';
}
$('#asks').addEventListener('submit',async e=>{e.preventDefault();const f=e.target,btn=f.querySelector('button'),msg=f.querySelector('.amsg'),text=String(new FormData(f).get('text')||'').trim();if(!text)return;
  btn.disabled=true;btn.textContent='Saving…';
  try{const fr=String(new FormData(f).get('from')||'').trim().slice(0,60);if(fr){myName=fr;store.set('myname',fr);}const r=await withCode(code=>apiPost({action:'add',code,devId,doc:{from:fr,type:'answer',q:f.dataset.ask,pid:f.dataset.pid,text:text.slice(0,4000)}}));if(!r.ok)throw r;await refreshContribs();}
  catch(err){btn.disabled=false;btn.textContent='Try again';msg.textContent=err==='cancel'?'':err==='locked'?LOCKED_MSG:'That didn\'t save. Check your internet connection and try again.';}});
const goPerson=(id,form)=>{location.hash='tree';setTimeout(()=>{select(id,1);tFocus(id);if(form)setTimeout(()=>openForm(form),500);else $('#panel').scrollIntoView({behavior:RM?'auto':'smooth'});},120);};
$('#asks').addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g){e.preventDefault();goPerson(g.dataset.go);}});
$('#wanted').addEventListener('click',e=>{const b=e.target.closest('[data-want]');if(b)goPerson(b.dataset.want,'photo');});
// night ⇄ sunset only. On the stage the change is animated (moon/sun on strings, sky fades), so the tree isn't redrawn
$('#tSky').onclick=()=>{SKYPREF=SKY==='day'?'night':'day';store.set('sky',SKYPREF);if(STAGE){applySky(false);sunLight();}else applySky(true);};
/* ---------- larger text ---------- */
function setBig(on){document.body.classList.toggle('big',on);store.set('bigtext',on?'1':'0');
  $('#bigBtn').setAttribute('aria-pressed',on);$('#bigBtn').textContent=on?'Aa Normal text':'Aa Larger text';$('#tBig').setAttribute('aria-pressed',on);$('#tBig').setAttribute('aria-label',on?'Normal text':'Larger text');
  if(tw.childElementCount){const k={...tv};drawLeafTree(false);tv=k;tApply(false);}}
if(store.get('bigtext')==='1')setBig(true);
$('#bigBtn').onclick=$('#tBig').onclick=()=>setBig(!document.body.classList.contains('big'));
/* ---------- first-visit hint ---------- */
let hintT=null;function showHint(){const h=$('#hint');if(si>=0)return;h.classList.add('on');clearTimeout(hintT);hintT=setTimeout(()=>h.classList.remove('on'),6500);}
$('#tstage').addEventListener('pointerdown',()=>$('#hint').classList.remove('on'));
/* ---------- printable poster ---------- */
async function buildPoster(){const k={...tv};PRINT=true;NIGHT=false;drawLeafTree(false);await lastBake;const src=$('#tsvg'),c=src.cloneNode(true);PRINT=false;NIGHT=true;drawLeafTree(false);tv=k;tApply(false);c.removeAttribute('id');c.removeAttribute('class');
  c.querySelectorAll('[id]').forEach(n=>{const t=n.tagName.toLowerCase();if(t==='clippath'||t==='filter')n.id='pp-'+n.id;else n.removeAttribute('id');});
  c.querySelectorAll('[clip-path],[filter]').forEach(n=>['clip-path','filter'].forEach(a=>{const v=n.getAttribute(a);if(v)n.setAttribute(a,v.replace('url(#','url(#pp-'));}));
  const w=c.querySelector('g');w.removeAttribute('style');w.setAttribute('class','');
  c.querySelectorAll('.leaf').forEach(l=>{l.classList.remove('dim','sel','spot','wait');l.removeAttribute('tabindex');});
  const b=TB,pad=30;c.setAttribute('viewBox',`${b.x0-pad} ${b.y0-pad} ${b.x1-b.x0+2*pad} ${b.y1-b.y0+2*pad}`);c.setAttribute('preserveAspectRatio','xMidYMid meet');
  const el=$('#poster');el.className='ts-'+TSTYLE;el.innerHTML=`<div><div class="pt">The Graham &amp; Harper Family</div><div class="pd">For Mom — Thanksgiving 2026</div></div>`;
  el.appendChild(c);el.insertAdjacentHTML('beforeend',`<div class="pf"><img src="photos/qr.png" alt=""><div>Point your phone's camera at this code to explore the tree, play the story, and add your own memories and photos.</div></div>`);}
$('#posterBtn').onclick=async()=>{await buildPoster();setTimeout(()=>{try{print();}catch(e){}},300);};
/* sound effects removed — every call below is a no-op */
const sfx={chime(){},page(){},bloom(){},ctx(){}};

/* editing: the device that shared something can change its words (backend action 'edit') */
async function saveEdit(f){const fd=new FormData(f),btn=f.querySelector('button.pri'),doc={};['text','name','note','from'].forEach(k=>{if(fd.has(k))doc[k]=String(fd.get(k)||'').trim();});
  btn.disabled=true;btn.textContent='Saving…';
  try{const r=await withCode(code=>apiPost({action:'edit',code,devId,id:f.dataset.id,doc}));if(!r.ok)throw r;await refreshContribs();renderPanel(false);renderKeepDyn();}
  catch(err){btn.disabled=false;btn.textContent=err==='cancel'?'Save changes':'Try again';}}

/* film player: the tree's music pauses while a slideshow plays and comes back when it closes; story auto-play stops */
let filmResume=false;
function openFilm(id){const f=FILMS.find(x=>x.id===id);if(!f)return;const v=$('#vEl');
  filmResume=mState==='playing';if(filmResume)pauseMusic();
  if(typeof auto!=='undefined'&&auto){clearTimeout(auto);auto=null;if(si>=0)showStep();}
  $('#vTitle').textContent=f.title+' — '+f.sub;$('#vBy').textContent=f.by;v.poster=f.poster;v.src=f.src;$('#vbox').hidden=false;document.body.classList.add('vopen');
  const pr=v.play();if(pr&&pr.catch)pr.catch(()=>{});setTimeout(()=>$('#vClose').focus(),50);}
function closeFilm(){const v=$('#vEl');if($('#vbox').hidden)return;v.pause();v.removeAttribute('src');v.load();$('#vbox').hidden=true;document.body.classList.remove('vopen');
  if(filmResume)startMusic();filmResume=false;}
$('#vClose').onclick=closeFilm;$('#vbox').addEventListener('click',e=>{if(e.target.id==='vbox')closeFilm();});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#vbox').hidden){e.stopPropagation();closeFilm();}},true);
document.addEventListener('click',e=>{const b=e.target.closest('[data-film]');if(b&&!b.closest('#tworld')){e.preventDefault();openFilm(b.dataset.film);}});

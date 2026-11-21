"""Turn the claude.ai build (tree3.html) into the GitHub Pages build.
Swaps claude.ai storage for the Apps Script backend, adds the family passcode,
and the no-search-engines tag.  Usage: python3 make_gh.py <tree3.html> <mapdata.json> <API url> <out.html>"""
import sys,json
src,mapf,api,out=sys.argv[1:5]
s=open(src).read()
def rep(a,b,c=1):
    global s
    n=s.count(a)
    assert n==c,(a[:80],n);s=s.replace(a,b)

# search engines
rep('<meta name="viewport" content="width=device-width, initial-scale=1">','<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="robots" content="noindex, nofollow, noimageindex">\n<meta name="googlebot" content="noindex, nofollow, noimageindex">')

# a memory photo only replaces someone's face when 'use as picture' was ticked
rep("c.type==='photo'&&c.asset&&c.portrait!==false","c.type==='photo'&&c.asset&&c.portrait===true")
# photo urls
s=s.replace("'/_blob/'+c.asset","assetUrl(c.asset)")
n=s.count('/_blob/${esc(c.asset)}');assert n>=3,n
s=s.replace('/_blob/${esc(c.asset)}','${esc(assetUrl(c.asset))}')

# forms: no claude sign-in wording
rep("""  if(!db)return `<p class="note">Sign in to claude.ai to add memories, photos and relatives.</p>`;
  if(!canWrite)return `<p class="note">You can view this tree. Ask Mat for edit access to add what you remember.</p>`;""",
"""  if(!db)return `<p class="note">Sharing memories isn't switched on yet.</p>`;""")
rep("const can=db&&canWrite,note=!db?'Sign in to claude.ai to answer.':'You can read this page. Ask Mat for edit access to add answers.';",
    "const can=db&&canWrite,note='Sharing answers isn\\'t switched on yet.';")

# delete
rep("const d=e.target.closest('[data-del]');if(d&&db){d.textContent='removing…';try{await db.collection('contrib').doc(d.dataset.del).delete();}catch(err){d.textContent='could not remove';}}});",
    "const d=e.target.closest('[data-del]');if(d&&db){d.textContent='removing…';try{const r=await withCode(code=>apiPost({action:'del',code,devId,id:d.dataset.del}));if(!r.ok)throw 0;await refreshContribs();}catch(err){if(err!=='cancel')d.textContent='could not remove';else d.textContent='remove';}}});")

# panel submit
rep("""    if(t==='photo'){const r=await assets.upload(fd.get('file'));doc.asset=r.id;doc.portrait=fd.get('portrait')==='on';}
    if(t==='story'){const fl=fd.get('file');if(fl&&fl.size){const r=await assets.upload(fl);doc.type='photo';doc.asset=r.id;doc.portrait=false;}}""",
"""    let photo=null;
    if(t==='photo'){photo=await shrinkPhoto(fd.get('file'));doc.portrait=fd.get('portrait')==='on';}
    if(t==='story'){const fl=fd.get('file');if(fl&&fl.size)photo=await shrinkPhoto(fl);}""")
rep("""    await db.collection('contrib').add(doc);sfx.chime();if(msg)msg.textContent='Saved — thank you!';
  }catch(err){btn.disabled=false;btn.textContent='Try again';if(msg)msg.textContent=err?.code==='quota_exceeded'?'The tree is full — ask Mat to tidy it.':'That didn\\'t save. Check you\\'re signed in with edit access.';}});""",
"""    btn.textContent=photo?'Uploading photo…':'Saving…';
    const r=await withCode(code=>apiPost({action:'add',code,devId,doc,photo}));if(!r.ok)throw r;
    await refreshContribs();sfx.chime();const m2=$('#fmsg');if(m2)m2.textContent='Saved — thank you!';
  }catch(err){btn.disabled=false;btn.textContent='Try again';if(msg)msg.textContent=err==='cancel'?'':err==='badphoto'?'That photo couldn\\'t be read. Try a different one.':'That didn\\'t save. Check your internet connection and try again.';}});""")

# answers
rep("await db.collection('contrib').add({from:fr,type:'answer',q:f.dataset.ask,pid:f.dataset.pid,by:me||'',at:Date.now(),text:text.slice(0,4000)});}",
    "const r=await withCode(code=>apiPost({action:'add',code,devId,doc:{from:fr,type:'answer',q:f.dataset.ask,pid:f.dataset.pid,text:text.slice(0,4000)}}));if(!r.ok)throw r;await refreshContribs();}")
rep("catch(err){btn.disabled=false;btn.textContent='Try again';msg.textContent='That didn\\'t save. Check you\\'re signed in with edit access.';}});",
    "catch(err){btn.disabled=false;btn.textContent='Try again';msg.textContent=err==='cancel'?'':'That didn\\'t save. Check your internet connection and try again.';}});")

# music admin off
rep("function musicAdmin(){\n  const el=$('#musicAdmin');if(!isEditor||!assets||!db){el.innerHTML='';return;}","function musicAdmin(){\n  const el=$('#musicAdmin');if(true){el.innerHTML='';return;}")

# storage startup
i=s.index("/* ---------- shared family additions ---------- */");j=s.index("})();",i)+len("})();")
s=s[:i]+r"""/* ---------- shared family additions (Google Sheet via Apps Script) ---------- */
const API=__API__;
function assetUrl(id){id=String(id||'');return id.startsWith('photos/')?id:'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w1600';}
var devId=store.get('devid');if(!devId){devId=(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now().toString(36)).slice(0,24);store.set('devid',devId);}
async function apiPost(o){const r=await fetch(API,{method:'POST',body:JSON.stringify(o),headers:{'Content-Type':'text/plain;charset=utf-8'}});return r.json();}
async function refreshContribs(){if(!API)return;const r=await fetch(API+(API.includes('?')?'&':'?')+'t='+Date.now(),{cache:'no-store'});const j=await r.json();if(!j.ok)return;
  const next=JSON.stringify(j.items);if(next===refreshContribs.last)return;refreshContribs.last=next;contribs=j.items;
  const keep={...view},tkeep={...tv};build();drawTree(false);view=keep;apply(false);drawLeafTree(false);tv=tkeep;tApply(false);renderPanel(false);drawTimeline();renderHelp();renderMemStars();}
/* the family passcode: asked once, then remembered on this device */
function askCode(wrong){return new Promise(res=>{const d=$('#codeDlg');$('#codeIn').value='';$('#codeErr').textContent=wrong?'That passcode didn\'t match. Try again, or ask Mat.':'';
  d.hidden=false;setTimeout(()=>$('#codeIn').focus(),50);
  const done=v=>{d.hidden=true;$('#codeOk').onclick=$('#codeX').onclick=null;$('#codeForm').onsubmit=null;res(v);};
  $('#codeForm').onsubmit=e=>{e.preventDefault();const v=$('#codeIn').value.trim();if(v)done(v);};$('#codeX').onclick=()=>done(null);});}
async function withCode(fn){let code=store.get('famcode')||'',wrong=false;
  for(let tries=0;tries<4;tries++){
    if(!code){code=await askCode(wrong);if(!code)throw 'cancel';
      const ok=(await apiPost({action:'check',code})).ok;if(!ok){wrong=true;code='';continue;}store.set('famcode',code);}
    const r=await fn(code);if(r&&r.error==='bad_code'){store.set('famcode','');code='';wrong=true;continue;}return r;}
  throw 'cancel';}
function shrinkPhoto(file){return new Promise((res,rej)=>{if(!file||!file.size){res(null);return;}const u=URL.createObjectURL(file),im=new Image();
  im.onload=()=>{const m=1600,k=Math.min(1,m/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*k);c.height=Math.round(im.naturalHeight*k);
    c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res({b64:c.toDataURL('image/jpeg',.85).split(',')[1],mime:'image/jpeg',name:String(file.name||'photo').replace(/\.[a-z0-9]+$/i,'')+'.jpg'});};
  im.onerror=()=>{URL.revokeObjectURL(u);rej('badphoto');};im.src=u;});}
(async()=>{
  if(!API){renderPanel(false);return;}
  db=true;canWrite=true;me=devId;
  renderPanel(false);renderHelp();
  try{await refreshContribs();}catch(e){}
  setInterval(()=>{if(!document.hidden)refreshContribs().catch(()=>{});},90000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshContribs().catch(()=>{});});
})();"""+s[j:]
s=s.replace("__API__",json.dumps(api))

# passcode dialog markup + css
rep('<div id="poster" aria-hidden="true"></div>','''<div id="codeDlg" class="codedlg" hidden><form id="codeForm" class="codebox" role="dialog" aria-labelledby="codeT">
  <h3 id="codeT">Family passcode</h3><p>To keep the tree just for family, enter the passcode Mat shared. You'll only need to do this once on this device.</p>
  <input id="codeIn" autocomplete="off" autocapitalize="none" placeholder="Passcode"><p id="codeErr" class="err"></p>
  <div class="row"><button type="button" id="codeX">Cancel</button><button class="pri" id="codeOk">Continue</button></div></form></div>
<div id="poster" aria-hidden="true"></div>''')
rep("/* story mention spotlight */","""/* family passcode dialog */
.codedlg{position:fixed;inset:0;z-index:60;background:rgba(10,20,14,.6);display:grid;place-items:center;padding:20px}
.codedlg[hidden]{display:none}
.codebox{background:var(--bg);color:var(--ink);border-radius:16px;padding:22px;max-width:380px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.4)}
.codebox h3{margin:0 0 6px;font-size:24px}.codebox p{margin:0 0 12px}.codebox .err{color:var(--clay);min-height:1.2em;margin:6px 0}
.codebox .row{display:flex;gap:8px;justify-content:flex-end}
/* story mention spotlight */""")

m=json.load(open(mapf))
s=s.replace("__MAP__",json.dumps(m,separators=(',',':')))
assert 'claude.use' not in s and '/_blob/' not in s, 'leftover claude.ai storage'
open(out,'w').write(s)
print('built',out,len(s)//1024,'KB')

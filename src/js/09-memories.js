/* ---------- shared family additions (Google Sheet via Apps Script) ---------- */
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
})();

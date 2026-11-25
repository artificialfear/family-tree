/* ---------- shared family additions (Google Sheet via Apps Script) ---------- */
const API=__API__;
function assetUrl(id){id=String(id||'');return id.startsWith('photos/')?id:'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w1600';}
var devId=store.get('devid');if(!devId){devId=(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now().toString(36)).slice(0,24);store.set('devid',devId);}
/* only a scrambled (SHA-256) copy of this device's id is ever stored or shown */
let devHash='';
async function hashDev(){try{const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(devId));devHash=[...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join('');}catch(e){devHash='';}return devHash;}
const LOCKED_MSG='Too many wrong passcodes. Please wait 15 minutes and try again, or ask Mat for the passcode.';
async function apiPost(o){const r=await fetch(API,{method:'POST',body:JSON.stringify(o),headers:{'Content-Type':'text/plain;charset=utf-8'}});return r.json();}
// memories are kept on the device too, so the flowers show straight away and survive a slow or unreachable Google backend
// (a fetch that hangs is given up after 25 s, and the copy on the device stays on screen)
async function refreshContribs(){if(!API)return;const ac=window.AbortController?new AbortController():null,to=ac&&setTimeout(()=>ac.abort(),25000);
  let j;try{const r=await fetch(API+(API.includes('?')?'&':'?')+'t='+Date.now(),{cache:'no-store',signal:ac&&ac.signal});j=await r.json();}finally{clearTimeout(to);}if(!j||!j.ok||!Array.isArray(j.items))return;
  const next=JSON.stringify(j.items);store.set('ftContribs',next);if(next===refreshContribs.last)return;refreshContribs.last=next;contribs=j.items;
  const keep={...view},tkeep={...tv};build();drawTree(false);view=keep;apply(false);drawLeafTree(false);tv=tkeep;tApply(false);renderPanel(false);drawTimeline();renderHelp();renderMemStars();renderKeepDyn();}
/* the family passcode: asked once, then remembered on this device */
function askCode(wrong){return new Promise(res=>{const d=$('#codeDlg');$('#codeIn').value='';$('#codeErr').textContent=wrong==='locked'?LOCKED_MSG:wrong?'That passcode didn\'t match. Try again, or ask Mat.':'';
  d.hidden=false;setTimeout(()=>$('#codeIn').focus(),50);
  const done=v=>{d.hidden=true;$('#codeOk').onclick=$('#codeX').onclick=null;$('#codeForm').onsubmit=null;res(v);};
  $('#codeForm').onsubmit=e=>{e.preventDefault();const v=$('#codeIn').value.trim();if(v)done(v);};$('#codeX').onclick=()=>done(null);});}
async function withCode(fn){let code=store.get('famcode')||'',wrong=false;
  for(let tries=0;tries<8;tries++){
    if(!code){code=await askCode(wrong);if(!code)throw 'cancel';
      const c=await apiPost({action:'check',code,devId});if(c.error==='locked'){await askCode('locked');throw 'locked';}if(!c.ok){wrong=true;code='';continue;}store.set('famcode',code);}
    const r=await fn(code);if(r&&r.error==='locked')throw 'locked';if(r&&r.error==='bad_code'){store.set('famcode','');code='';wrong=true;continue;}return r;}
  throw 'cancel';}
function shrinkPhoto(file){return new Promise((res,rej)=>{if(!file||!file.size){res(null);return;}const u=URL.createObjectURL(file),im=new Image();
  im.onload=()=>{const m=1600,k=Math.min(1,m/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*k);c.height=Math.round(im.naturalHeight*k);
    c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res({b64:c.toDataURL('image/jpeg',.85).split(',')[1],mime:'image/jpeg',name:String(file.name||'photo').replace(/\.[a-z0-9]+$/i,'')+'.jpg'});};
  im.onerror=()=>{URL.revokeObjectURL(u);rej('badphoto');};im.src=u;});}
/* ---------- voice memories ---------- */
const canRecord=()=>!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
const VOICE_MAX=120;   // seconds
function recMime(){for(const m of ['audio/webm;codecs=opus','audio/mp4','audio/webm','audio/ogg;codecs=opus'])try{if(MediaRecorder.isTypeSupported(m))return m;}catch(e){}return '';}
function blobToB64(b){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=()=>rej('badaudio');r.readAsDataURL(b);});}
const fmtT=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
function setNeedText(f){const ta=f.querySelector('textarea[name=text]');if(ta)ta.required=!f._voice;}
function clearRecording(f){if(!f)return;const a=f.querySelector('.rprev');if(f._voice&&f._voice.url)URL.revokeObjectURL(f._voice.url);f._voice=null;a.hidden=true;a.removeAttribute('src');
  f.querySelector('[data-rdel]').hidden=true;f.querySelector('.rtime').textContent='';f.querySelector('[data-rec]').textContent='🎤 Record a voice memory instead';setNeedText(f);}
async function toggleRecord(f){if(!f)return;const b=f.querySelector('[data-rec]'),tm=f.querySelector('.rtime');
  if(f._recording){f._recording.stop();return;}
  clearRecording(f);let stream;
  try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});}
  catch(e){tm.textContent='The microphone isn\'t available. Check that this site is allowed to use it.';return;}
  const mime=recMime(),rec=new MediaRecorder(stream,mime?{mimeType:mime,audioBitsPerSecond:48000}:{audioBitsPerSecond:48000}),parts=[],t0=Date.now();
  const wasPlaying=typeof mState!=='undefined'&&mState==='playing';if(wasPlaying)pauseMusic();
  rec.ondataavailable=e=>{if(e.data&&e.data.size)parts.push(e.data);};
  const tick=setInterval(()=>{const s=(Date.now()-t0)/1000;tm.textContent='Recording… '+fmtT(s)+' of '+fmtT(VOICE_MAX);if(s>=VOICE_MAX)rec.stop();},250);
  rec.onstop=()=>{clearInterval(tick);stream.getTracks().forEach(t=>t.stop());f._recording=null;
    const type=(rec.mimeType||mime||'audio/webm'),blob=new Blob(parts,{type});
    if(!blob.size){tm.textContent='Nothing was recorded. Try again.';b.textContent='🎤 Record a voice memory instead';return;}
    const url=URL.createObjectURL(blob);f._voice={blob,mime:type,url};const a=f.querySelector('.rprev');a.src=url;a.hidden=false;
    f.querySelector('[data-rdel]').hidden=false;tm.textContent='Recorded '+fmtT((Date.now()-t0)/1000)+'. Listen, then tap Save memory.';b.textContent='🎤 Record again';setNeedText(f);};
  f._recording=rec;rec.start(1000);b.textContent='■ Stop recording';tm.textContent='Recording… 0:00';}
/* playing a voice memory: fetched through the Sheet's script, then played here; the music steps aside */
const voiceCache={};let voiceNow=null;
async function playVoice(btn){const id=btn.dataset.audio;
  if(voiceNow&&voiceNow.btn===btn){voiceNow.a.paused?voiceNow.a.play():voiceNow.a.pause();return;}
  if(voiceNow){voiceNow.a.pause();voiceNow.btn.textContent='▶ Play voice memory';}
  btn.textContent='Loading…';
  try{if(!voiceCache[id]){const r=await (await fetch(API+(API.includes('?')?'&':'?')+'audio='+encodeURIComponent(id))).json();if(!r.ok)throw 0;
      const bin=atob(r.b64),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);voiceCache[id]=URL.createObjectURL(new Blob([u8],{type:r.mime||'audio/webm'}));}
    const a=new Audio(voiceCache[id]),music=typeof mState!=='undefined'&&mState==='playing';if(music)fadeTo(vol()*.15,.6);
    voiceNow={a,btn};a.onplay=()=>btn.textContent='❚❚ Pause';a.onpause=()=>btn.textContent='▶ Play voice memory';
    a.onended=()=>{btn.textContent='▶ Play voice memory';voiceNow=null;if(music&&mState==='playing')fadeTo(vol(),1.2);};await a.play();}
  catch(e){btn.textContent='Couldn\'t play this one';}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-audio]');if(b){e.preventDefault();playVoice(b);}});
(async()=>{
  if(!API){renderPanel(false);return;}
  db=true;canWrite=true;assets=true;me=await hashDev();
  renderPanel(false);renderHelp();
  {const c=store.get('ftContribs');if(c)try{const it=JSON.parse(c);if(Array.isArray(it)&&it.length){refreshContribs.last=c;contribs=it;const keep={...view},tkeep={...tv};build();drawTree(false);view=keep;apply(false);drawLeafTree(false);tv=tkeep;tApply(false);renderPanel(false);drawTimeline();renderHelp();renderMemStars();renderKeepDyn();}}catch(e){}}
  try{await refreshContribs();}catch(e){}
  setInterval(()=>{if(!document.hidden)refreshContribs().catch(()=>{});},90000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshContribs().catch(()=>{});});
})();

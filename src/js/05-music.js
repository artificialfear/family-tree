/* ---------- music (Web Audio, gapless loops; one track for the tree, one for the story) ---------- */
// lead: where the first note lands (samples from the first sound); a cold start begins right there
// each file: an intro that plays once, then loops START..END (samples counted from the first sound, 44.1 kHz)
const TRACKS={tree:{url:'music.mp3',start:1042874,end:4544554,lead:8700},story:{url:'music-story.mp3',start:2200327,end:5849374}},LOOP_RATE=44100;
let trackUrl='music.mp3',trackName='',mctx=null,mgain=null,mState='stopped',mLoading=null,curKey='tree',cur=null;const mbufs={};
const vol=()=>+$('#mVol').value;
function musicUi(){const b=$('#mPlay'),t=$('#tMusic');b.disabled=t.disabled=false;$('#mVol').style.display='';const on=mState==='playing';b.textContent=mLoading?'♪ Loading…':on?'❚❚ Pause music':'♪ Music';
  const al=on?'Pause music':'Play music';b.setAttribute('aria-label',al);t.setAttribute('aria-label',al);t.textContent=mLoading?'…':on?'❚❚':'♪';t.classList.toggle('on',on);$('#mLbl').textContent=trackName;}
function ensureCtx(){const A=window.AudioContext||window.webkitAudioContext;if(!A)throw 0;
  if(!mctx){mctx=new A();mgain=mctx.createGain();mgain.gain.value=0;mgain.connect(mctx.destination);}}
function loadBuf(key){ensureCtx();return mbufs[key]||(mbufs[key]=fetch(TRACKS[key].url).then(r=>r.arrayBuffer())
  .then(ab=>new Promise((res,rej)=>{const p=mctx.decodeAudioData(ab,res,rej);if(p&&p.then)p.then(res,rej);})).catch(e=>{delete mbufs[key];throw e;}));}
// start a track's loop on its own gain, fading it in; the previous track fades out and stops (a crossfade)
let pend=null;
async function playKey(key,xf,cold){if(pend===key||(cur&&cur.key===key))return;pend=key;let buf;try{buf=await loadBuf(key);}finally{pend=null;}const T=TRACKS[key];if(curKey!==key||(cur&&cur.key===key))return;
  // where the music actually starts in the decoded buffer (decoders can add a few silent samples)
  const d=buf.getChannelData(0);let i0=0;while(i0<d.length&&Math.abs(d[i0])<1e-4)i0++;const st=i0/buf.sampleRate;
  const src=mctx.createBufferSource(),g=mctx.createGain();src.buffer=buf;src.loop=true;src.loopStart=st+T.start/LOOP_RATE;src.loopEnd=Math.min(buf.duration,st+T.end/LOOP_RATE);
  src.connect(g);g.connect(mgain);const now=mctx.currentTime;g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(1,now+xf);src.start(0,st+(cold&&T.lead?T.lead/LOOP_RATE:0));
  const old=cur;cur={key,src,g};if(old){old.g.gain.cancelScheduledValues(now);old.g.gain.setValueAtTime(old.g.gain.value,now);old.g.gain.linearRampToValueAtTime(0,now+xf);setTimeout(()=>{try{old.src.stop();}catch(e){}old.g.disconnect();},xf*1000+200);}}
async function startMusic(key,cue){
  if(key)curKey=key;
  if(mState==='playing'){if(!cur||cur.key!==curKey)playKey(curKey,2.5).catch(()=>{});return;}
  if(mState==='paused'&&mctx){await mctx.resume();mState='playing';if(!cur||cur.key!==curKey)playKey(curKey,1.5).catch(()=>{});fadeTo(vol(),1.2);musicUi();return;}
  try{mLoading=1;musicUi();ensureCtx();if(mctx.state==='suspended')mctx.resume();
    mgain.gain.cancelScheduledValues(mctx.currentTime);mgain.gain.setValueAtTime(0,mctx.currentTime);
    mState='playing';await playKey(curKey,cue?.005:.05,cue);if(mctx.state==='suspended')await mctx.resume();fadeTo(vol(),cue?.02:4);
    // fetch the other track quietly so switching is instant later
    setTimeout(()=>loadBuf(curKey==='tree'?'story':'tree').catch(()=>{}),3000);
  }catch(e){mState='stopped';}
  mLoading=null;musicUi();
}
// get the music ready inside the tap (phones only let sound start from a tap); startMusic(key,true) then
// starts it later on cue, at full volume on its first note
function primeMusic(key){curKey=key;try{ensureCtx();if(mctx.state==='suspended')mctx.resume();loadBuf(key).catch(()=>{});}catch(e){}}
// story begins → story music; story ends → tree music. Only switches if music is already on.
function musicFor(key){curKey=key;if(mState==='playing'&&(!cur||cur.key!==key))playKey(key,2.5).catch(()=>{});}
function fadeTo(v,sec){if(!mgain)return;const t=mctx.currentTime;mgain.gain.cancelScheduledValues(t);mgain.gain.setValueAtTime(mgain.gain.value,t);mgain.gain.linearRampToValueAtTime(v,t+sec);}
function pauseMusic(){if(mState!=='playing')return;fadeTo(0,.6);mState='paused';setTimeout(()=>{if(mState==='paused')mctx.suspend();},650);musicUi();}
function stopMusic(){try{cur&&cur.src.stop();}catch(e){}cur=null;mState='stopped';}
$('#mPlay').onclick=$('#tMusic').onclick=()=>{mState==='playing'?pauseMusic():startMusic();};
$('#mVol').oninput=()=>{if(mgain&&mState==='playing'){const t=mctx.currentTime;mgain.gain.cancelScheduledValues(t);mgain.gain.setValueAtTime(vol(),t);}};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mState==='playing')pauseMusic();});
musicUi();
function musicAdmin(){
  const el=$('#musicAdmin');if(true){el.innerHTML='';return;}
  el.innerHTML=`<h3>Background music (only editors see this)</h3><p class="note">${true?'Using Mat\'s track (looped).':trackUrl?'Current track: '+esc(trackName||'uploaded'):'No track yet.'} Upload an audio file to replace it.</p>
   <form class="form" id="musicForm" style="max-width:420px"><input type="file" name="file" accept="audio/*,video/mp4" required><button class="pri">Set music</button><span class="note" id="mmsg"></span></form>`;
  $('#musicForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target).get('file');$('#mmsg').textContent='Uploading…';
    try{const r=await assets.upload(f);await db.doc('settings/app').set({music:r.id,musicName:String(f.name).slice(0,80)});$('#mmsg').textContent='Saved.';}
    catch(err){$('#mmsg').textContent='This file type wasn\'t accepted. Send the file to Claude to add it to the page.';}};
}


/* ---------- music (Web Audio, gapless loop) ---------- */
const LOOP_START=803636,LOOP_END=4914827,LOOP_RATE=44100;   // music.mp3: intro plays once, then loops START..END (samples after the first sound)
let trackUrl=null,trackName='',mctx=null,mgain=null,msrc=null,mbuf=null,mbufUrl=null,mState='stopped',mLoading=null;
const vol=()=>+$('#mVol').value;
function musicUi(){const b=$('#mPlay'),t=$('#tMusic');if(!trackUrl){b.textContent='♪ Music coming soon';b.disabled=t.disabled=true;$('#mVol').style.display='none';$('#mLbl').textContent='';return;}
  b.disabled=t.disabled=false;$('#mVol').style.display='';const on=mState==='playing';b.textContent=mLoading?'♪ Loading…':on?'❚❚ Pause music':'♪ Music';
  const al=on?'Pause music':'Play music';b.setAttribute('aria-label',al);t.setAttribute('aria-label',al);t.textContent=mLoading?'…':on?'❚❚':'♪';t.classList.toggle('on',on);$('#mLbl').textContent=trackName;}
function setTrack(url,name){if(trackUrl===url)return;const was=mState==='playing';stopMusic();trackUrl=url;trackName=name||'';mbuf=null;musicUi();if(was)startMusic();}
async function loadBuf(){
  if(mbuf&&mbufUrl===trackUrl)return mbuf;
  const A=window.AudioContext||window.webkitAudioContext;if(!A)throw 0;
  if(!mctx){mctx=new A();mgain=mctx.createGain();mgain.gain.value=0;mgain.connect(mctx.destination);}
  const ab=await (await fetch(trackUrl)).arrayBuffer();
  mbuf=await new Promise((res,rej)=>{const p=mctx.decodeAudioData(ab,res,rej);if(p&&p.then)p.then(res,rej);});mbufUrl=trackUrl;return mbuf;
}
async function startMusic(){
  if(!trackUrl||mState==='playing')return;
  if(mState==='paused'&&mctx){await mctx.resume();mState='playing';fadeTo(vol(),1.2);musicUi();return;}
  try{
    mLoading=1;musicUi();
    if(mctx&&mctx.state==='suspended')mctx.resume();
    const buf=await loadBuf();if(mctx.state==='suspended')await mctx.resume();
    // find where the music actually starts in the decoded buffer (decoders can add a few silent samples)
    const d=buf.getChannelData(0);let i0=0;while(i0<d.length&&Math.abs(d[i0])<1e-4)i0++;
    const ours=trackUrl==='music.mp3';
    const st=i0/buf.sampleRate,ls=ours?st+LOOP_START/LOOP_RATE:0,le=ours?Math.min(buf.duration,st+LOOP_END/LOOP_RATE):buf.duration;
    msrc=mctx.createBufferSource();msrc.buffer=buf;msrc.loop=true;msrc.loopStart=ls;msrc.loopEnd=le;msrc.connect(mgain);
    mgain.gain.cancelScheduledValues(mctx.currentTime);mgain.gain.setValueAtTime(0,mctx.currentTime);
    msrc.start(0,ours?st:0);mState='playing';fadeTo(vol(),4);
  }catch(e){mState='stopped';}
  mLoading=null;musicUi();
}
function fadeTo(v,sec){if(!mgain)return;const t=mctx.currentTime;mgain.gain.cancelScheduledValues(t);mgain.gain.setValueAtTime(mgain.gain.value,t);mgain.gain.linearRampToValueAtTime(v,t+sec);}
function pauseMusic(){if(mState!=='playing')return;fadeTo(0,.6);mState='paused';setTimeout(()=>{if(mState==='paused')mctx.suspend();},650);musicUi();}
function stopMusic(){try{msrc&&msrc.stop();}catch(e){}msrc=null;mState='stopped';}
$('#mPlay').onclick=$('#tMusic').onclick=()=>{if(!trackUrl)return;mState==='playing'?pauseMusic():startMusic();};
$('#mVol').oninput=()=>{if(mgain&&mState==='playing'){const t=mctx.currentTime;mgain.gain.cancelScheduledValues(t);mgain.gain.setValueAtTime(vol(),t);}};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mState==='playing')pauseMusic();});
setTrack('music.mp3','');
musicUi();
function musicAdmin(){
  const el=$('#musicAdmin');if(true){el.innerHTML='';return;}
  el.innerHTML=`<h3>Background music (only editors see this)</h3><p class="note">${trackUrl==='music.mp3'?'Using Mat\'s track (looped).':trackUrl?'Current track: '+esc(trackName||'uploaded'):'No track yet.'} Upload an audio file to replace it.</p>
   <form class="form" id="musicForm" style="max-width:420px"><input type="file" name="file" accept="audio/*,video/mp4" required><button class="pri">Set music</button><span class="note" id="mmsg"></span></form>`;
  $('#musicForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target).get('file');$('#mmsg').textContent='Uploading…';
    try{const r=await assets.upload(f);await db.doc('settings/app').set({music:r.id,musicName:String(f.name).slice(0,80)});$('#mmsg').textContent='Saved.';}
    catch(err){$('#mmsg').textContent='This file type wasn\'t accepted. Send the file to Claude to add it to the page.';}};
}


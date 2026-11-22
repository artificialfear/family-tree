/* ---------- story mode ---------- */
let si=-1,auto=null,spotT=[];
// names as they appear in each chapter's text, in reading order -> person
const MN=[[],
 [['William Marian Graham','william'],['Linda Thomas Roach','linda'],['Jack','jack']],
 [['Jack','jack']],
 [['Margaret E. Lush','margaret']],
 [['Earl','earl'],['Sara Lee Harper','sara'],['Johnnie Lee','johnny']],
 [['Johnny Lee Harper','johnny'],['Annie Mae Ralston','annie'],['Renee','renee'],['Pam','pam'],['John','johnh'],['Jeff','jeff']],
 [['Jack','jack'],['Margaret','margaret'],['Richard','richard'],['Norma','norma'],['Evelyn','evelyn'],['Eileen','eileen'],['Donna','donna'],['Wayne','wayne'],['Bruce','bruce'],['Ed','ed']],
 [['Ed Graham','ed'],['Renee Harper','renee']],
 [['Ed','ed'],['Renee','renee'],['Chris','chris'],['Mat','mat'],['Jon','jon'],['Dustin','dustin'],['Amanda','amanda'],['Emily','emily'],['Jessica','jessica'],['Lydia','lydia'],['Lilly','lilly'],['Maddie','maddie'],['Dustin Jr','dustinjr']],
 [['Amber','amber'],['Steven','stevenn'],['Brandon','brandon'],['Jeremy','jeremy'],['Michael','michael'],['Andrew','andrew'],['Alissa','alissa'],['Malik','malik'],['Ashley','ashley'],['Shelby','shelby'],['Kayla','kayla'],['John John','johnjohn'],['Chasity','chasity'],['Amber','amberl'],['Ashley','ashleyl'],['Shannon','shannon'],['Jacob','jacob']],
 [['Ed','ed'],['Johnny','johnny']]];
function markNames(t,ms){let out='',pos=0;
  (ms||[]).forEach(([fr,id])=>{if(!byId[id])return;const re=new RegExp('\\b'+fr.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','g');re.lastIndex=pos;const m=re.exec(t);if(!m)return;
    out+=esc(t.slice(pos,m.index))+`<span class="mn" data-id="${id}" tabindex="0" role="button" aria-label="Show ${esc(byId[id].n)} on the tree">${esc(m[0])}</span>`;pos=m.index+m[0].length;});
  return out+esc(t.slice(pos));}
function spotlight(id){const lf=tw.querySelector(`.leaf[data-id="${CSS.escape(id)}"]`);if(!lf)return;lf.classList.remove('wait','dim','spot');void lf.getBBox();lf.classList.add('spot');
  clearTimeout(lf._st);lf._st=setTimeout(()=>lf.classList.remove('spot'),1400);}
function clearSpots(){spotT.forEach(clearTimeout);spotT=[];tw.querySelectorAll('.leaf.wait,.leaf.spot').forEach(c=>c.classList.remove('wait','spot'));}
function runSpots(s){clearSpots();const spans=[...$('#cap').querySelectorAll('.mn')];
  if(RM){spans.forEach(x=>x.classList.add('lit'));return;}
  (s.f||[]).forEach(id=>{const lf=tw.querySelector(`.leaf[data-id="${CSS.escape(id)}"]`);lf&&lf.classList.add('wait');});
  const seen=new Set();let t=250;
  spans.forEach(x=>{const id=x.dataset.id;spotT.push(setTimeout(()=>{x.classList.add('lit');spotlight(id);},t));seen.add(id);t+=650;});
  const rest=(s.f||[]).filter(id=>!seen.has(id));
  if(rest.length)spotT.push(setTimeout(()=>rest.forEach(spotlight),t+150));}
function startStory(){location.hash='tree';tTouched=1;si=0;tw.classList.add('story');requestAnimationFrame(()=>{$('#tstage').scrollIntoView({behavior:RM?'auto':'smooth',block:innerWidth<600?'start':'nearest'});showStep();});}
let stepT=0;
function showStep(){
  const s=STORY[si];storyFocus=s.f.length?s.f:null;
  const pics=(s.img?`<img src="${s.img}" alt="Jack Graham in Navy uniform">`:'')+s.f.filter(id=>photo[id]).slice(0,s.img?3:4).map(id=>`<img src="${esc(photo[id])}" alt="${esc(byId[id].n)}">`).join('');
  const last=si===STORY.length-1;
  $('#cap').innerHTML=`<div class="dots">${STORY.map((_,i)=>`<i class="${i<=si?'on':''}"></i>`).join('')}</div>${s.y?`<div class="yr">${esc(s.y)}</div>`:''}<h3>${esc(s.h)}</h3>${pics?`<div class="ph">${pics}</div>`:''}<p>${markNames(s.t,MN[si])}</p>
   <div class="ctl">${si>0?'<button id="sPrev">Back</button>':''}${last?'<button class="pri" id="sEnd">Explore the tree</button>':'<button class="pri" id="sNext">Next</button>'}<button id="sAuto" aria-pressed="${!!auto}">${auto?'Pause':'Auto-play'}</button>${last?'':'<button id="sEnd">Skip</button>'}<span class="step">${si+1} of ${STORY.length}</span></div>`;
  const cap=$('#cap');cap.classList.remove('on');void cap.offsetWidth;cap.classList.add('on');
  // move first; change the tree's highlighting only once the move has finished, so phones don't have to
  // redraw the whole tree while it is sliding (that made the picture stutter and jump)
  clearTimeout(stepT);clearSpots();requestAnimationFrame(()=>tFrame(s.f));
  stepT=setTimeout(()=>{if(STORY[si]!==s)return;tw.querySelectorAll('.leaf').forEach(c=>c.classList.toggle('dim',!!storyFocus&&!storyFocus.includes(c.dataset.id)));
    if(s.f.length)select(s.f[s.f.length===1?0:Math.min(1,s.f.length-1)],1);runSpots(s);},RM?0:960);
  cap.querySelectorAll('.mn').forEach(x=>{const go=()=>{x.classList.add('lit');spotlight(x.dataset.id);select(x.dataset.id,1);};
    x.addEventListener('mouseenter',()=>spotlight(x.dataset.id));x.onclick=go;x.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}};});
  sfx.page();
  $('#sPrev')&&($('#sPrev').onclick=()=>{si--;resetAuto();showStep();});
  $('#sNext')&&($('#sNext').onclick=()=>{si++;resetAuto();showStep();});
  document.querySelectorAll('#sEnd').forEach(b=>b.onclick=endStory);
  $('#sAuto').onclick=()=>{if(auto){clearInterval(auto);auto=null;}else{auto=setInterval(()=>{if(si<STORY.length-1){si++;showStep();}else{clearInterval(auto);auto=null;showStep();}},11000);}showStep();};
}
function resetAuto(){if(auto){clearInterval(auto);auto=setInterval(()=>{if(si<STORY.length-1){si++;showStep();}else{clearInterval(auto);auto=null;showStep();}},11000);}}
function endStory(){clearTimeout(stepT);clearInterval(auto);auto=null;si=-1;setTimeout(showHint,900);clearSpots();storyFocus=null;tw.classList.remove('story');tw.querySelectorAll('.leaf.dim').forEach(c=>c.classList.remove('dim'));$('#cap').classList.remove('on');select('renee',1);setTimeout(()=>tFit(true),50);}
addEventListener('keydown',e=>{if(si<0)return;if(e.key==='ArrowRight'&&si<STORY.length-1){si++;resetAuto();showStep();}else if(e.key==='ArrowLeft'&&si>0){si--;resetAuto();showStep();}else if(e.key==='Escape')endStory();});
$('#storyBtn').onclick=$('#tStory').onclick=()=>{sfx.ctx();startMusic();startStory();};
/* ---------- full screen tree ---------- */
const fsEl=()=>document.fullscreenElement||document.webkitFullscreenElement;
function refit(){setTimeout(()=>{if(si>=0&&storyFocus)tFrame(storyFocus);else tFit();},80);}
function setFull(on,quiet){const b=document.body;if(STAGE&&!on)return null;if(on===b.classList.contains('tfull'))return null;let pr=null;
  b.classList.toggle('tfull',on);b.classList.remove('pdrawer');hidePop();
  $('#tFull').textContent=on?'✕ Exit full screen':'⤢ Full screen';$('#tFull').setAttribute('aria-pressed',on);
  if(on){if(location.hash!=='#tree')location.hash='tree';const d=document.documentElement,rq=d.requestFullscreen||d.webkitRequestFullscreen;try{const p=rq&&rq.call(d);if(p&&p.then)pr=p.then(()=>new Promise(r=>setTimeout(r,140)),()=>{});}catch(e){}}
  else if(fsEl()){try{(document.exitFullscreen||document.webkitExitFullscreen).call(document);}catch(e){}}
  if(!quiet)refit();return pr;}
$('#tFull').onclick=()=>{tTouched=1;setFull(!document.body.classList.contains('tfull'));};

['fullscreenchange','webkitfullscreenchange'].forEach(ev=>document.addEventListener(ev,()=>{if(!fsEl()&&document.body.classList.contains('tfull'))setFull(false);else refit();}));
addEventListener('keydown',e=>{if(STAGE&&e.key==='Escape'&&document.body.classList.contains('sheeton')&&!$('#lb').classList.contains('on')){if(document.body.classList.contains('pdrawer'))document.body.classList.remove('pdrawer');else location.hash='tree';return;}if(e.key!=='Escape'||!document.body.classList.contains('tfull')||$('#lb').classList.contains('on')||si>=0)return;
  if(document.body.classList.contains('pdrawer'))document.body.classList.remove('pdrawer');else setFull(false);},true);
addEventListener('hashchange',()=>{if(location.hash&&location.hash!=='#tree')setFull(false);});


/* ---------- cover: drifting family photos ---------- */
{const D=["jack-navy", "margaret-graham", "annie-mae-harper-1", "johnny-harper", "harper-family", "edward-graham-1", "annie-mae-harper-2", "john-jack-graham", "renee-graham", "annie-mae-harper-4", "johnny-harper-1", "edward-graham", "steve-bearden", "john-danyelle-harper", "annie-mae-harper-5", "brandon", "pamela-bearden", "norma-graham", "bruce-graham", "eileen-newsom", "donna-graham", "annie-mae-harper-3", "christopher-graham", "mathew-graham", "jonathan-graham", "dustin-graham", "jeff-harper-1", "peanut", "graham-family", "pam-renee-1", "renee-family-2", "chasity-annie"].map(n=>'photos/drift/'+n+'.jpg'),rows=[[],[],[]];D.forEach((u,i)=>rows[i%3].push(u));
 const el=$('#drift'),T=[170,210,190];
 el.innerHTML=rows.map((r,i)=>{const im=r.map(u=>`<img src="${u}" alt="" decoding="async">`).join('');return `<div class="row${i%2?' rev':''}"><div class="track" style="--t:${T[i]}s">${im}${im}</div></div>`;}).join('');
 let n=0;const imgs=el.querySelectorAll('img'),show=()=>el.classList.add('on');
 imgs.forEach(i=>{if(i.complete)n++;else i.addEventListener('load',()=>{if(++n>=imgs.length*.6)show();},{once:true});});
 if(n>=imgs.length*.6)show();setTimeout(show,2500);}
/* ---------- cover ---------- */
const cover=$('#cover'),RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
// faces fill the gold dots: Graham branches left, Harper branches right, parents on the lower pair
{const F=[['jack',30,20,'Jack'],['margaret',80,10,'Margaret'],['johnny',140,10,'Johnny'],['annie',190,20,'Annie Mae'],['ed',40,88,'Ed'],['renee',180,88,'Renee']],r=13;
 const fz=$('#faces');
 fz.innerHTML=F.map(([id,x,y,nm],i)=>`<g class="face" data-f="${id}" style="--d:${2.7+i*.55}s"><g class="fz"><clipPath id="fc-${id}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath><image href="${PHOTOS[id]?.p||''}" x="${x-r}" y="${y-r}" width="${2*r}" height="${2*r}" clip-path="url(#fc-${id})" preserveAspectRatio="xMidYMid slice"/><circle cx="${x}" cy="${y}" r="${r+.8}"/></g><text class="fn" x="${x}" y="${y+r*2.5+8}">${nm}</text></g>`).join('');
 // bring the face under the pointer to the front so it enlarges over its neighbours
 fz.addEventListener('animationend',e=>{const g=e.target.closest('.face');if(g&&e.animationName==='facein')g.classList.add('shown');});
 const front=g=>{if(g&&!g.classList.contains('shown'))return;if(g&&g.parentNode.lastChild!==g)g.parentNode.appendChild(g);};
 fz.addEventListener('pointerover',e=>front(e.target.closest('.face')));
 fz.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;const g=e.target.closest('.face');if(!g)return;e.stopPropagation();const was=g.classList.contains('big');fz.querySelectorAll('.face.big').forEach(f=>f.classList.remove('big'));if(!was){front(g);g.classList.add('big');}});
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('#faces'))fz.querySelectorAll('.face.big').forEach(f=>f.classList.remove('big'));});}
// gold specks rising slowly
{let h='';for(let i=0;i<34;i++){const z=1.2+Math.random()*2.8,t=20+Math.random()*22;
  h+=`<i style="left:${Math.random()*100}%;width:${z}px;height:${z}px;--t:${t}s;--dl:${-Math.random()*t}s;--o:${(.18+Math.random()*.42).toFixed(2)};--sx:${Math.round(Math.random()*80-40)}px"></i>`;}
 $('#specks').innerHTML=h;}
// stage theme: the opening screen is the closed curtain; the tree is already drawn full-screen behind it
if(STAGE&&getComputedStyle(cover).display!=='none'){cover.classList.add('curtain');$('#tstage').classList.add('hoisted');
  // the drifting family photos scroll inside the card only, not across the curtains
  const ci=cover.querySelector('.coverIn'),dr=$('#drift');if(ci&&dr)ci.prepend(dr);
  cover.insertAdjacentHTML('afterbegin','<div class="cpanel l" aria-hidden="true"></div><div class="cpanel r" aria-hidden="true"></div><div class="cframe" aria-hidden="true"></div>');
  const fr=cover.querySelector('.cframe'),drawFr=()=>{fr.innerHTML=stageFrame(innerWidth,innerHeight).replace(/\b(prg|pgg|pgl|pstp)\b/g,'c$1');};let lw=0,lh=0;const redraw=()=>{if(innerWidth===lw&&innerHeight===lh)return;lw=innerWidth;lh=innerHeight;drawFr();};redraw();addEventListener('resize',redraw);
  document.body.classList.add('tfull');$('#tFull').textContent='✕ Exit full screen';$('#tFull').setAttribute('aria-pressed',true);}
function openCurtain(story){if(cover.classList.contains('opening'))return;cover.classList.add('opening');location.hash='tree';
  // full screen first (the tree refits to the new size behind the curtain), then part the curtains
  let pr=null;const d=document.documentElement,rq=d.requestFullscreen||d.webkitRequestFullscreen;try{const p=rq&&rq.call(d);if(p&&p.then)pr=p.then(()=>new Promise(r=>setTimeout(r,180)),()=>{});}catch(e){}
  // entering full screen resizes the window (bars slide away on phones); wait until the size has settled
  // and the stage behind has been redrawn for it, so nothing jumps while the curtains part
  const settled=()=>new Promise(res=>{let w=innerWidth,h=innerHeight,still=0,t0=performance.now();(function chk(now){
      if(innerWidth!==w||innerHeight!==h){w=innerWidth;h=innerHeight;still=now;}
      if(now-still>320&&now-t0>200||now-t0>1600)res();else requestAnimationFrame(chk);})(t0);});
  let went=0;const go=()=>{if(went++)return;Promise.all([lastBake,settled()]).then(()=>{if(!tTouched)tStart();}).then(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
      cover.classList.add('open');{const st=$('#tstage');st.classList.add('lowering');st.classList.remove('hoisted');setTimeout(()=>st.classList.remove('lowering'),5000);}const T=RM?300:1900;
      setTimeout(()=>{cover.style.display='none';if(story)startStory();else setTimeout(showHint,300);},T);})));};
  setTimeout(()=>{if(pr){pr.then(go);setTimeout(go,900);}else go();},RM?0:420);}
function closeCover(story){openCurtain(story);}
// quietly fetch every face while the opening screen is showing, so they're ready when the tree grows
(window.requestIdleCallback||(f=>setTimeout(f,1200)))(()=>{Object.values(photo).forEach(u=>{if(!u)return;const i=new Image();i.decoding='async';i.src=u;});});
$('#begin').onclick=()=>{startMusic('story');closeCover(true);};
$('#skip').onclick=()=>{startMusic('tree');closeCover(false);};


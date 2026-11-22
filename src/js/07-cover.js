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
// the gold tree flies down and becomes the real tree
const SRCSEG=[[110,148,110,92],[110,92,60,40],[110,92,160,40],[110,110,40,88],[110,110,180,88],[60,40,30,20],[60,40,80,10],[160,40,190,20],[160,40,140,10]];
function segsOf(d){const out=[];let x=0,y=0;const re=/([MVH])\s*(-?[\d.]+)(?:\s+(-?[\d.]+))?/g;let m;
  while((m=re.exec(d))){if(m[1]==='M'){x=+m[2];y=+m[3];}else if(m[1]==='V'){out.push([x,y,x,+m[2]]);y=+m[2];}else{out.push([x,y,+m[2],y]);x=+m[2];}}return out;}
const rgb=c=>{const m=c.match(/[\d.]+/g)||[0,0,0];return m.slice(0,3).map(Number);};
// stage theme: the opening screen is the closed curtain; the tree is already drawn full-screen behind it
if(STAGE&&getComputedStyle(cover).display!=='none'){cover.classList.add('curtain');
  cover.insertAdjacentHTML('afterbegin','<div class="cpanel l" aria-hidden="true"></div><div class="cpanel r" aria-hidden="true"></div><div class="cframe" aria-hidden="true"></div>');
  const fr=cover.querySelector('.cframe'),drawFr=()=>{fr.innerHTML=stageFrame(innerWidth,innerHeight);};drawFr();addEventListener('resize',drawFr);
  document.body.classList.add('tfull');$('#tFull').textContent='✕ Exit full screen';$('#tFull').setAttribute('aria-pressed',true);}
function openCurtain(story){if(cover.classList.contains('opening'))return;cover.classList.add('opening');location.hash='tree';
  // full screen first (the tree refits to the new size behind the curtain), then part the curtains
  let pr=null;const d=document.documentElement,rq=d.requestFullscreen||d.webkitRequestFullscreen;try{const p=rq&&rq.call(d);if(p&&p.then)pr=p.then(()=>new Promise(r=>setTimeout(r,180)),()=>{});}catch(e){}
  let went=0;const go=()=>{if(went++)return;lastBake.then(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
      cover.classList.add('open');const T=RM?300:1900;
      setTimeout(()=>{cover.style.display='none';if(story)startStory();else setTimeout(showHint,300);},T);})));};
  setTimeout(()=>{if(pr){pr.then(go);setTimeout(go,900);}else go();},RM?0:420);}
function closeCover(story){if(cover.classList.contains('curtain'))return openCurtain(story);
  const leaf=$('#leaf'),lr=leaf.getBoundingClientRect(),vb=leaf.viewBox.baseVal,sc=lr.width/vb.width;
  const from=SRCSEG.map(([a,b,c,d])=>[lr.left+(a-vb.x)*sc,lr.top+(b-vb.y)*sc,lr.left+(c-vb.x)*sc,lr.top+(d-vb.y)*sc]);
  cover.classList.add('morphing','out');setTimeout(()=>cover.style.display='none',900);
  if(!RM&&lr.width){growR=0;const gc=document.getElementById('growc');if(gc)gc.setAttribute('r',0);tw.classList.add('pre');$('#tstage').classList.add('intro');}
  location.hash='tree';
  // open the tree full screen; wait for the browser to finish resizing before measuring
  const pr=setFull(true,true);let went=0;const go=()=>{if(went++)return;requestAnimationFrame(build);};
  if(pr){pr.then(go);setTimeout(go,900);}else go();
  function build(){
    const fin=()=>{if(story)setTimeout(startStory,300);else setTimeout(showHint,500);};
    if(RM||!lr.width){route();drawLeafTree(false);tStart();tFitted=1;fin();return;}
    // hide the tree, then draw it: the planet rises, the gold sketch folds into the trunk, and the tree grows out from the ground
    route();drawLeafTree(false);tStart();tFitted=1;
    setTimeout(()=>growTree(fin),650);
    requestAnimationFrame(()=>{
      const st=$('#tstage').getBoundingClientRect(),toS=(x,y)=>[st.left+tv.x+x*tv.k,st.top+tv.y+y*tv.k];
      const b0=tw.querySelector('.br'),bark=b0?rgb((cs=>cs.stroke==='none'?cs.fill:cs.stroke)(getComputedStyle(b0))):[125,95,66],gold=[243,217,184];
      const big=[...TBR].sort((a,b)=>b.w-a.w).slice(0,3);
      const cy=y=>Math.min(y,1205);const tg0=big.map(b=>{const p=toS(b.x1,cy(b.y1)),q=toS(b.x2,cy(b.y2));return [p[0],p[1],q[0],q[1],Math.max(1.5,b.w*tv.k*.8)];}),tg=from.map((_,i)=>tg0[i%tg0.length]);
      if(!tg.length)return;
      const fx=document.createElementNS('http://www.w3.org/2000/svg','svg');fx.setAttribute('class','morphfx');
      fx.innerHTML=tg.map(()=>'<line stroke-linecap="round"/>').join('');document.body.appendChild(fx);
      const L=[...fx.children],n=L.length,T=1250,t0=performance.now(),ez=u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
      function f(now){let all=true;
        L.forEach((ln,i)=>{const s=from[i],e=tg[i],dl=(i/n)*220,u=Math.min(1,Math.max(0,(now-t0-dl)/T));if(u<1)all=false;const k=ez(u);
          ln.setAttribute('x1',s[0]+(e[0]-s[0])*k);ln.setAttribute('y1',s[1]+(e[1]-s[1])*k);ln.setAttribute('x2',s[2]+(e[2]-s[2])*k);ln.setAttribute('y2',s[3]+(e[3]-s[3])*k);
          const c=gold.map((g,j)=>Math.round(g+(bark[j]-g)*k));ln.setAttribute('stroke',`rgb(${c})`);ln.setAttribute('stroke-width',2.4+(e[4]-2.4)*k);});
        if(!all)requestAnimationFrame(f);else{fx.style.transition='opacity .7s ease';fx.style.opacity=0;setTimeout(()=>fx.remove(),800);}}
      requestAnimationFrame(f);
    });
  }
}
// quietly fetch every face while the opening screen is showing, so they're ready when the tree grows
(window.requestIdleCallback||(f=>setTimeout(f,1200)))(()=>{Object.values(photo).forEach(u=>{if(!u)return;const i=new Image();i.decoding='async';i.src=u;});});
$('#begin').onclick=()=>{startMusic();closeCover(true);};
$('#skip').onclick=()=>{startMusic();closeCover(false);};


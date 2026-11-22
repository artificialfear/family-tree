/* ---------- layout ---------- */
const CW=192,CH=60,GX=16,STEP=CW+GX,RH=128,GG=44;
function layout(){
  const pos={},gens=[...new Set(P.map(p=>p.g))].sort((a,b)=>b-a);
  const parOf=p=>p.par.filter(id=>pos[id]);
  gens.forEach((g,ri)=>{
    const row=P.filter(p=>p.g===g).sort((a,b)=>a.ord-b.ord),y=ri*RH,groups=new Map(),done=new Set();
    row.forEach(p=>{const pr=parOf(p);if(!pr.length)return;const k=[...pr].sort().join('+');if(!groups.has(k))groups.set(k,{pr,m:[]});groups.get(k).m.push(p);done.add(p.id);});
    const orph=[];
    row.forEach(p=>{if(done.has(p.id))return;const sp=byId[p.sp];
      if(sp&&sp.g===g&&parOf(sp).length){for(const gr of groups.values()){const i=gr.m.indexOf(sp);if(i<0)continue;if(i===0)gr.m.unshift(p);else gr.m.splice(i+1,0,p);}done.add(p.id);return;}
      if(sp&&sp.g===g&&!done.has(sp.id)&&!parOf(sp).length){orph.push({pr:[],m:[p,sp]});done.add(p.id);done.add(sp.id);return;}
      orph.push({pr:[],m:[p]});done.add(p.id);});
    const gl=[...groups.values()];
    gl.forEach(gr=>gr.want=gr.pr.reduce((s,id)=>s+pos[id].x+CW/2,0)/gr.pr.length);
    gl.sort((a,b)=>a.want-b.want);
    let cur=-Infinity;
    [...gl,...orph].forEach(gr=>{const w=gr.m.length*STEP-GX;const st=gr.want!=null?Math.max(cur,gr.want-w/2):(cur===-Infinity?0:cur);
      gr.m.forEach((p,i)=>pos[p.id]={x:st+i*STEP,y,ri});cur=st+w+GG;});
  });
  for(let ri=gens.length-2;ri>=0;ri--){
    const row=P.filter(p=>p.g===gens[ri]).sort((a,b)=>pos[a.id].x-pos[b.id].x),tg={};
    row.forEach(p=>{const kids=P.filter(k=>k.par.includes(p.id)&&pos[k.id]);if(!kids.length){tg[p.id]=pos[p.id].x;return;}
      const xs=kids.map(k=>pos[k.id].x),c=(Math.min(...xs)+Math.max(...xs)+CW)/2,sp=byId[p.sp];
      if(sp&&sp.g===p.g&&kids.some(k=>k.par.includes(sp.id))){const left=pos[p.id].x<pos[sp.id].x;tg[p.id]=left?c-STEP+GX/2:c+GX/2;}
      else tg[p.id]=c-CW/2;});
    let prev=-Infinity;row.forEach(p=>{const x=Math.max(tg[p.id],prev+STEP);pos[p.id].x=x;prev=x;});
  }
  const mx=Math.min(...Object.values(pos).map(v=>v.x));Object.values(pos).forEach(v=>v.x-=mx);
  return pos;
}

/* ---------- tree drawing ---------- */
let POS={},view={x:0,y:0,k:1},W=0,H=0,storyFocus=null;
const initials=n=>n.replace(/["“”(].*?["“”)]/g,' ').split(/\s+/).filter(w=>/^[A-Z]/.test(w)&&!/^(Sr|Jr)\.?$/.test(w)).map(w=>w[0]).filter((_,i,a)=>i===0||i===a.length-1).join('');
function drawTree(grow){
  POS=layout();const pos=POS;
  W=Math.max(...Object.values(pos).map(v=>v.x))+CW;H=Math.max(...Object.values(pos).map(v=>v.y))+CH;
  let e='';const fam=new Map(),gd=ri=>ri*420;
  P.forEach(k=>{const pr=k.par.filter(id=>pos[id]);if(!pr.length)return;const key=[...pr].sort().join('+');if(!fam.has(key))fam.set(key,{pr,kids:[]});fam.get(key).kids.push(k);});
  const spDone=new Set();
  P.forEach(p=>{const s=byId[p.sp];if(!s||!pos[s.id]||!pos[p.id]||spDone.has(s.id)||s.g!==p.g)return;spDone.add(p.id);
    const a=pos[p.id].x<pos[s.id].x?pos[p.id]:pos[s.id],b=a===pos[p.id]?pos[s.id]:pos[p.id];
    e+=`<path class="edge" pathLength="1" style="--d:${gd(a.ri)+250}ms" d="M${a.x+CW} ${a.y+CH/2}H${b.x}"/>`;});
  fam.forEach(({pr,kids})=>{
    let mx,my;const pp=pr.map(id=>pos[id]).sort((u,v)=>u.x-v.x);
    if(pp.length===2){mx=(pp[0].x+CW+pp[1].x)/2;my=pp[0].y+CH/2;}else{mx=pp[0].x+CW/2;my=pp[0].y+CH;}
    const ky=pos[kids[0].id].y,bar=ky-26,xs=kids.map(k=>pos[k.id].x+CW/2);
    e+=`<path class="edge" pathLength="1" style="--d:${gd(pp[0].ri)+300}ms" d="M${mx} ${my}V${bar}M${Math.min(mx,...xs)} ${bar}H${Math.max(mx,...xs)}${xs.map(x=>`M${x} ${bar}V${ky}`).join('')}"/>`;
  });
  let defs='';
  const cards=P.map((p,i)=>{const v=pos[p.id];const yrs=p.living?'Living':(p.b||p.d)?`${p.b||'?'} – ${p.d||'?'}`:'Dates unknown';
    const nm=p.s.length>19?p.s.slice(0,18)+'…':p.s,ph=photo[p.id];
    if(ph)defs+=`<clipPath id="cp-${p.id}"><circle cx="30" cy="30" r="20"/></clipPath>`;
    const av=ph?`<image href="${esc(ph)}" x="10" y="10" width="40" height="40" clip-path="url(#cp-${p.id})" preserveAspectRatio="xMidYMid slice"/>`
      :`<circle class="ini" cx="30" cy="30" r="20"/><text class="init" x="30" y="35">${esc(initials(p.s))}</text>`;
    const dim='';
    return `<g class="card${p.id===sel?' sel':''}${p.living?' liv':''}${dim}" data-id="${p.id}" tabindex="0" role="button" aria-label="${esc(p.n)}" transform="translate(${v.x},${v.y})"><g class="in" style="--d:${gd(v.ri)+(i%12)*45}ms">
      <rect class="bg" width="${CW}" height="${CH}" rx="12"/>${av}<circle class="ring" cx="30" cy="30" r="22" style="stroke:var(--${p.c})"/>
      <text class="nm" x="60" y="26">${esc(nm)}</text><text class="yr" x="60" y="45">${esc(yrs)}</text></g></g>`;}).join('');
  const gens=[...new Set(P.map(p=>p.g))].sort((a,b)=>b-a);
  const gl=gens.map((g,i)=>`<text class="genlbl" x="-14" y="${i*RH+CH/2+5}" text-anchor="end">${['Mat, brothers & cousins','Parents, aunts & uncles','Grandparents','Great-grandparents','2× great-grandparents','3× great-grandparents'][g]??(g<0?'Next generation':'')}</text>`).join('');
  $('#defs').innerHTML=defs;
  const w=$('#world');w.innerHTML=gl+e+cards;
  if(grow){w.classList.add('grow');setTimeout(()=>w.classList.remove('grow'),3200);}
  $('#names').innerHTML=P.map(p=>`<option value="${esc(p.n)}">`).join('');
}
function apply(anim){const w=$('#world');w.classList.toggle('nomo',!anim);w.style.transform=`translate(${view.x}px,${view.y}px) scale(${view.k})`;}
function fit(anim=true){const r=$('#stage').getBoundingClientRect();if(!r.width)return;const k=Math.max(.2,Math.min((r.width-40)/(W+170),(r.height-80)/(H+20),1.1));view.k=k;view.x=(r.width-(W+170)*k)/2+170*k;view.y=60+(r.height-70-H*k)/2;apply(anim);}
let touched=0;
const CORE=['ed','renee','chris','mat','jon','dustin'];
function initView(){const r=$('#stage').getBoundingClientRect();if(!r.width)return;if(CORE.every(id=>POS[id]))frame(CORE,false);else fit(false);}
function frame(ids,anim=true){
  const r=$('#stage').getBoundingClientRect();if(!r.width)return;
  const capH=0,top=62,avail=r.height-capH-top-8;
  const vs=(ids.length?ids:Object.keys(POS)).map(id=>POS[id]).filter(Boolean);
  const x0=Math.min(...vs.map(v=>v.x)),x1=Math.max(...vs.map(v=>v.x))+CW,y0=Math.min(...vs.map(v=>v.y)),y1=Math.max(...vs.map(v=>v.y))+CH;
  const k=Math.max(.22,Math.min((r.width-48)/(x1-x0),avail/(y1-y0+40),ids.length===1?1.25:1.05));
  view.k=k;view.x=r.width/2-(x0+x1)/2*k;view.y=top+avail/2-(y0+y1)/2*k;apply(anim);
}
function focusOn(id){touched=1;const v=POS[id];if(!v)return;const r=$('#stage').getBoundingClientRect();view.k=Math.max(view.k,.85);view.x=r.width/2-(v.x+CW/2)*view.k;view.y=r.height/2-(v.y+CH/2)*view.k;apply(true);}
function zoom(f,cx,cy){touched=1;const r=$('#stage').getBoundingClientRect();cx??=r.width/2;cy??=r.height/2;const k=Math.min(2.5,Math.max(.2,view.k*f));view.x=cx-(cx-view.x)*k/view.k;view.y=cy-(cy-view.y)*k/view.k;view.k=k;apply(false);}

const pop=$('#pop');let popT=null,popId=null;
function showPop(id){const src=photo[id];if(!src){hidePop();return;}let cx,top,bot;
  const lf=$('#v-tree').classList.contains('on')&&document.querySelector(`#tworld .leaf[data-id="${CSS.escape(id)}"] .ring`);
  if(lf){const r=lf.getBoundingClientRect();cx=r.left+r.width/2;top=r.top;bot=r.bottom;}
  else{const c=document.querySelector(`#world .card[data-id="${CSS.escape(id)}"]`);if(!c){hidePop();return;}const r=c.getBoundingClientRect();cx=r.left+(30/CW)*r.width;top=r.top+(10/CH)*r.height;bot=r.bottom;}
  const below=top<230;pop.querySelector('img').src=src;pop.querySelector('span').textContent=byId[id]?.s||'';
  pop.classList.toggle('below',below);pop.style.left=cx+'px';pop.style.top=(below?bot+10:top-10)+'px';
  popId=id;requestAnimationFrame(()=>pop.classList.add('on'));}
function hidePop(){clearTimeout(popT);pop.classList.remove('on');popId=null;}
const svg=$('#svg'),pts=new Map();let moved=0,last=null,pinch=null;
svg.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse'||pts.size)return;const c=e.target.closest('.card');if(c&&c.dataset.id!==popId)showPop(c.dataset.id);});
svg.addEventListener('pointerout',e=>{if(e.pointerType!=='mouse')return;const c=e.target.closest('.card');if(c&&!c.contains(e.relatedTarget))hidePop();});
svg.addEventListener('pointerdown',e=>{hidePop();svg.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);moved=0;last=[e.clientX,e.clientY];svg.classList.add('drag');
  if(pts.size===2){const [a,b]=[...pts.values()];pinch=Math.hypot(a[0]-b[0],a[1]-b[1]);}});
svg.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,[e.clientX,e.clientY]);
  if(pts.size===2&&pinch){const [a,b]=[...pts.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]),r=svg.getBoundingClientRect();zoom(d/pinch,(a[0]+b[0])/2-r.left,(a[1]+b[1])/2-r.top);pinch=d;moved=99;return;}
  const dx=e.clientX-last[0],dy=e.clientY-last[1];moved+=Math.abs(dx)+Math.abs(dy);last=[e.clientX,e.clientY];if(moved<4)return;view.x+=dx;view.y+=dy;touched=1;apply(false);});
const up=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(!pts.size)svg.classList.remove('drag');
  if(e.type==='pointerup'&&moved<6){const c=document.elementFromPoint(e.clientX,e.clientY)?.closest('.card');if(c){sfx.chime();select(c.dataset.id);if(e.pointerType!=='mouse'){showPop(c.dataset.id);popT=setTimeout(hidePop,2200);}}}};
svg.addEventListener('pointerup',up);svg.addEventListener('pointercancel',up);
svg.addEventListener('wheel',e=>{e.preventDefault();hidePop();const r=svg.getBoundingClientRect();zoom(e.deltaY<0?1.12:1/1.12,e.clientX-r.left,e.clientY-r.top);},{passive:false});
svg.addEventListener('keydown',e=>{const c=e.target.closest?.('.card');if(c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();sfx.chime();select(c.dataset.id);}});
svg.addEventListener('dblclick',e=>{const r=svg.getBoundingClientRect();zoom(1.8,e.clientX-r.left,e.clientY-r.top);});
$('#gside').onclick=()=>{touched=1;frame(['william','linda','lush','cecil','jack','margaret','richard','norma','evelyn','eileen','donna','wayne','bruce','ed']);};
$('#hside').onclick=()=>{touched=1;frame(['earl','sara','johnny','annie','renee','pam','johnh','jeff','steve','danyelle','david']);};
$('#zin').onclick=()=>zoom(1.25);$('#zout').onclick=()=>zoom(1/1.25);$('#fit').onclick=()=>{touched=1;fit();};
$('#qc').addEventListener('change',e=>{const v=e.target.value.toLowerCase().trim();const p=P.find(p=>p.n.toLowerCase()===v)||P.find(p=>p.n.toLowerCase().includes(v));if(p){sfx.chime();select(p.id);focusOn(p.id);}});


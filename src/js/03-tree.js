/* ---------- illustrated tree ---------- */
const tsvg=$('#tsvg'),tw=$('#tworld');let stageDraw=null,sbdKey='';
// the banner's resting bottom edge in the stage (its layout box, so a hoisted or still-lowering banner doesn't count as gone)
const mqBot=()=>{const m=$('#marquee');return m?m.offsetTop+m.offsetHeight:0;};
// the hometowns at the ends of the roots, below the grandchildren
// preview: the hometowns sit around the buried chest, inside the third soil layer (before DROP)
const ARTPINS={orange:[610,1725],durham:[485,1840],louisville:[385,1960],greenville:[305,2090],collegepark:[1230,1725],newborn:[1350,1840],upson:[1450,1960],covington:[915,2205]};
const ROOTPINS=[['orange',200,1710,'1911'],['durham',330,1785,'1930'],['louisville',455,1700,'1932'],['greenville',590,1780,'1956'],['collegepark',730,1705,''],['covington',915,1820,'1982'],['newborn',1120,1710,''],['upson',1300,1780,'1940']];
// the planet (a circle under the tree) and the memory garden on it
const PLANET={cx:915,cy:1272+2200,R:2200},surfY=x=>FLAT?mSurf(x):PLANET.cy-Math.sqrt(Math.max(0,PLANET.R**2-(x-PLANET.cx)**2));
// preview: the painted planet is a round hill, radius 1400, top at y 1272 (same place as the drawn planet's top)
// DROP lowers the hill (and everyone on it, the roots and the chest) so more of the painted trunk shows above it
const DROP=ART?200:0,HILL={cx:915,cy:2672+DROP,R:1400},OLDP={...PLANET};if(ART)Object.assign(PLANET,HILL);
const f1=n=>n.toFixed(1);
const CHEST={x:1835,y:1500,rot:0},GSIGN={x:-46,y:1546};
// preview: the chest is buried treasure in the middle of the planet, level, under the roots and hometowns
if(ART){CHEST.x=915;CHEST.y=1990+DROP;CHEST.rot=0;CHEST.s=3;}
/* preview: level ground. The painted tree stands with its root flare on a level strip of painted ground that runs off both edges of the screen;
   the family stands on the grass in two rows like a family photo; the chest sits half sunk in the grass; the roots and hometowns lie in the deepest layer */
const FLAT=ART&&PREVIEW,GY=1615,GT={w:2256*1.5,h:830*1.5,y:GY-46*1.5},
  mSurf=()=>GY;
if(FLAT){CHEST.x=1790;CHEST.s=2.9;CHEST.y=GY+10-8*2.9;}/* sitting on the grass to the right of the trunk, clear of the buttons */let gardenSeen=null;const gardenNew={};
// the planet is a cut-paper diorama: a grass layer on top for the garden, soil underneath where the roots reach the hometowns.
// The grass starts SOIL0 deep and grows a row (36) at a time when the garden needs room, pushing the soil, roots and towns down.
const SOIL0=ART?175:250;let SOILD=SOIL0;
const passed=c=>!byId[c.pid].living;
const memCount=()=>contribs.filter(c=>['story','photo','answer'].includes(c.type)&&!isKeep(c)&&byId[c.pid]).length;
function soilDepthFor(n){let D=SOIL0;while(D<SOIL0+36*20&&gardenSlots(D).length<n)D+=36;return D;}const CANOPY_UP=200;let TP={},TBR=[],TB={x0:0,y0:0,x1:1,y1:1},tv={x:0,y:0,k:1},tTouched=0,tFitted=0;
const RAD={ssp:36,son:40,par:62,gp:44,ggp:34,aunt:33,asp:26,kid:27,ksp:22,gk:30},FS={ssp:19,son:21,par:27,gp:22,ggp:18,aunt:18,asp:15,kid:15,ksp:13,gk:17};
function tLayout(){
  const pos={},br=[],put=(id,x,y,t)=>{if(byId[id]&&!pos[id])pos[id]={x,y,r:RAD[t],t};return pos[id];};
  const B=(x1,y1,cx,cy,x2,y2,w)=>br.push({d:`M${x1.toFixed(1)} ${y1.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,w,x1,y1,cx,cy,x2,y2});
  const BX=915,BY=1225,F={x:915,y:905},GN={x:650,y:625},HN={x:1180,y:625};
  B(BX,BY+62,BX-6,(BY+F.y)/2,F.x,F.y,44);                                   // trunk, reaching into the ground
  {const row=[];['chris','mat','jon','dustin'].forEach(id=>{if(!byId[id])return;row.push([id,0]);const w=byId[id].sp;if(w&&byId[w]&&byId[w].g===0)row.push([w,1]);});
   // the sons and their wives stand along the curve of the planet (radius 2200, top at y 1272)
   const ground=x=>1272+2200-Math.sqrt(2200*2200-(x-BX)*(x-BX));
   let x=0;const xs=row.map(([id,isSp],i)=>{if(i>0)x+=isSp?190:215;return x;});const off=BX-x/2,y=1295;
   row.forEach(([id,isSp],i)=>{const px=xs[i]+off,py=ground(px)+23;put(id,px,py,isSp?'ssp':'son');
     if(isSp){const h=pos[row[i-1][0]],dx=px-h.x,dy=py-h.y,l=Math.hypot(dx,dy);B(h.x+dx/l*RAD.son,h.y+dy/l*RAD.son,(h.x+px)/2,(h.y+py)/2-6,px-dx/l*RAD.ssp,py-dy/l*RAD.ssp,4);}});
   // grandchildren stand on the lawn below their parents
   row.filter(r=>!r[1]).forEach(([id])=>{const a=pos[id],w=byId[id].sp&&pos[byId[id].sp],cx=w?(a.x+w.x)/2:a.x,sy=w?(a.y+w.y)/2:a.y+RAD.son,gy=ground(cx)+168;
     const ks=P.filter(k=>k.g<0&&k.par.includes(id)&&!pos[k.id]).sort((p,q)=>p.ord-q.ord),n=ks.length;
     ks.forEach((k,j)=>{const kx=cx+(j-(n-1)/2)*112;put(k.id,kx,gy,'gk');B(cx,sy,cx,gy-52,kx,gy-RAD.gk,3.5);});});}
  put('ed',800,872,'par');put('renee',1030,872,'par');B(F.x,F.y,872,896,800+RAD.par,872,12);B(F.x,F.y,958,896,1030-RAD.par,872,12);
  B(F.x-8,F.y,800,775,GN.x,GN.y,26);B(F.x+8,F.y,1030,775,HN.x,HN.y,26);  // limbs
  put('jack',560,616,'gp');put('margaret',740,600,'gp');put('johnny',1090,600,'gp');put('annie',1270,616,'gp');
  const up=(cid,pa,pb,ax,ay,bx,by)=>{const c=pos[cid];if(!c)return;[[pa,ax,ay],[pb,bx,by]].forEach(([id,x,y])=>{if(!byId[id])return;put(id,x,y,'ggp');B(c.x,c.y-c.r,c.x+(x-c.x)*.15,(c.y+y)/2,x,y+RAD.ggp,10);});};
  up('jack','william','linda',370,322,545,282);up('margaret','lush','cecil',750,282,925,322);up('johnny','earl','sara',1060,300,1235,322);
  const kidsOf=id=>P.filter(k=>k.par.includes(id)&&!pos[k.id]).sort((a,b)=>a.ord-b.ord);
  const D=Math.PI/180;
  const fan=(N,list,a0,a1,R0,side)=>{const n=list.length;list.forEach((p,i)=>{
      const ad=n<2?(a0+a1)/2:a0+(a1-a0)*i/(n-1),a=ad*D,dx=Math.cos(a),dy=Math.sin(a),ks=kidsOf(p.id),R=R0+(i%2)*80+(ks.length?24:0),x=N.x+dx*R,y=N.y+dy*R;
      put(p.id,x,y,'aunt');B(N.x+dx*44,N.y+dy*44,N.x+dx*R*.55,N.y+dy*R*.55-26,x-dx*RAD.aunt,y-dy*RAD.aunt,8);
      const sp=byId[p.sp];
      if(sp&&!pos[sp.id]){const sa=a+(118/R),sx=side==='h'?x-122:N.x+Math.cos(sa)*R,sy=side==='h'?y:N.y+Math.sin(sa)*R;put(sp.id,sx,sy,'asp');
        const ux=(sx-x),uy=(sy-y),ul=Math.hypot(ux,uy);B(x+ux/ul*RAD.aunt,y+uy/ul*RAD.aunt,(x+sx)/2,(y+sy)/2-6,sx-ux/ul*RAD.asp,sy-uy/ul*RAD.asp,4);}
      const m=ks.length,step=m>5?26:m>3?29:m>2?(document.body.classList.contains('big')?41:34):30,KR=m>5?232:m>3?205:m>2?170:185,kOff=(sp&&side==='h'&&ad<180)?-20:0;ks.forEach((k,j)=>{const ka=a+((j-(m-1)/2)*step+kOff)*D,cx=Math.cos(ka),cy=Math.sin(ka),kx=x+cx*KR,ky=y+cy*KR;put(k.id,kx,ky,'kid');
        B(x+cx*RAD.aunt,y+cy*RAD.aunt,x+cx*90,y+cy*90,kx-cx*RAD.kid,ky-cy*RAD.kid,4);
        const ksp=byId[k.sp];if(ksp&&!pos[ksp.id]){const qx=x+cx*(KR+118),qy=y+cy*(KR+118);put(ksp.id,qx,qy,'ksp');B(kx+cx*RAD.kid,ky+cy*RAD.kid,kx+cx*40,ky+cy*40,qx-cx*RAD.ksp,qy-cy*RAD.ksp,3);}});
    });};
  fan(GN,P.filter(p=>p.par.includes('jack')&&p.id!=='ed').sort((a,b)=>a.ord-b.ord),106,220,295,'h');
  fan(HN,P.filter(p=>p.par.includes('johnny')&&p.id!=='renee').sort((a,b)=>a.ord-b.ord),54,-30,295,'cw');
  // anyone added later by the family: hang them near the person they were added to
  for(let pass=0;pass<4;pass++)P.forEach(p=>{if(pos[p.id])return;
    const par=p.par.find(id=>pos[id]),sp=byId[p.sp]&&pos[p.sp],kid=P.find(k=>k.par.includes(p.id)&&pos[k.id]);
    if(par){const r=pos[par],n=P.filter(q=>q.par.includes(par)&&pos[q.id]).length,x=r.x+(n%2?1:-1)*(40+n*30),y=r.y+r.r+90;put(p.id,x,y,'kid');B(r.x,r.y+r.r,r.x,y-40,x,y-RAD.kid,4);}
    else if(sp){put(p.id,sp.x+sp.r+40,sp.y,'asp');B(sp.x+sp.r,sp.y,sp.x+sp.r+10,sp.y,sp.x+sp.r+40-RAD.asp,sp.y,4);}
    else if(kid){const r=pos[kid.id],x=r.x+(r.x<915?-60:60),y=r.y-190;put(p.id,x,y,'ggp');B(r.x,r.y-r.r,(r.x+x)/2,(r.y+y)/2,x,y+RAD.ggp,8);}
  });
  return {pos,br};
}
function qpt(b,t){const u=1-t;return [u*u*b.x1+2*u*t*b.cx+t*t*b.x2,u*u*b.y1+2*u*t*b.cy+t*t*b.y2];}
const TSTYLE='ink';
const PL_NAMES={covington:'Covington, GA',newborn:'Newborn, GA',greenville:'Meriwether County, GA',collegepark:'College Park, GA',upson:'Upson County, GA',louisville:'Louisville, KY',durham:'Durham, NC',orange:'Orange County, NC'};
const SKYQ=new URLSearchParams(location.search).get('sky');
// 'stage' = toy-theater look (painted backdrop, curtains, engraved tree); mockup behind ?theme=stage
const PURP=true;document.documentElement.classList.add('cpurple');
const STAGE=true;
let PRINT=false,SKYPREF=SKYQ||'night',SKY='night',NIGHT=true;
function autoSky(){const d=new Date(),h=d.getHours()+d.getMinutes()/60;return h>=7.5&&h<17?'day':((h>=17&&h<18.75)||(h>=6&&h<7.5))?'dusk':'night';}
const skyNow=()=>SKYPREF==='auto'?autoSky():SKYPREF;
SKY=skyNow();NIGHT=true;
$('#tstage').classList.add('ts-ink','tp');
/* moon phase for today's date (0 = new moon, .5 = full) */
function moonPhase(d){const syn=29.530588853,ref=Date.UTC(2000,0,6,18,14);let p=((d-ref)/864e5/syn)%1;return p<0?p+1:p;}
function moonSVG(p){const R=48,k=Math.cos(2*Math.PI*p),wax=p<.5,ls=wax?1:0,ts=wax?(k>0?0:1):(k>0?1:0),rx=Math.abs(k)*R;
  const lit=`M0 ${-R}A${R} ${R} 0 0 ${ls} 0 ${R}A${rx.toFixed(2)} ${R} 0 0 ${ts} 0 ${-R}Z`;
  return `<svg viewBox="-50 -50 100 100" aria-hidden="true"><defs><radialGradient id="mg" cx="38%" cy="34%" r="70%"><stop offset="0" stop-color="#fffaf0"/><stop offset=".5" stop-color="#f6ecd2"/><stop offset="1" stop-color="#e0cfa7"/></radialGradient><clipPath id="mlit"><path d="${lit}"/></clipPath></defs>
   <circle r="${R}" fill="#26314d" opacity=".55"/><path d="${lit}" fill="url(#mg)"/><g clip-path="url(#mlit)" fill="#bfa97c" opacity=".35"><circle cx="12" cy="8" r="8"/><circle cx="-14" cy="-18" r="5"/><circle cx="-6" cy="22" r="4"/><circle cx="22" cy="-16" r="3.5"/></g></svg>`;}
{const st=$('#tstage');let sd=3;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;let stars='',clouds='';
 for(let i=0,N=innerWidth<700||TOUCH?60:110;i<N;i++){const x=r()*100,y=Math.pow(r(),1.4)*78,z=r()<.12?2.6:r()<.4?1.8:1.1,tw=r()<.3;stars+=`<i class="${tw?'tw':''}${y>34?' lo':''}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;width:${z}px;height:${z}px;--o:${(.45+r()*.5).toFixed(2)};${tw?`--t:${(5+r()*9).toFixed(1)}s;--dl:-${(r()*12).toFixed(1)}s`:''}"></i>`;}
 for(let i=0;i<5;i++)clouds+=`<b class="cloud" style="top:${(6+r()*34).toFixed(1)}%;--s:${(.6+r()*.7).toFixed(2)};--t:${(150+r()*120).toFixed(0)}s;--dl:-${(r()*200).toFixed(0)}s"></b>`;
 const sky=document.createElement('div');sky.className='sky';sky.setAttribute('aria-hidden','true');sky.innerHTML=`<div class="nightwash"></div><div class="sunglow"></div><div class="stars">${stars}</div>${clouds}<div class="sunset"></div><div class="skydim"></div>`;
 const back=document.createElement('div');back.id='tback';back.className='wlayer';back.innerHTML='<img id="tbackimg" alt="" decoding="async">';
 const front=document.createElement('div');front.id='tfront';front.className='wlayer';let ff='';
 for(let i=0;i<12;i++){const x=330+r()*1180,y=1110+r()*170;ff+=`<i style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;--t:${(6+r()*6).toFixed(1)}s;--p:${(2.5+r()*2.5).toFixed(1)}s;--dl:-${(r()*8).toFixed(1)}s;--dx:${(r()*60-30).toFixed(0)}px;--dy:${(-20-r()*40).toFixed(0)}px"></i>`;}
 front.innerHTML=`<div class="ffw">${ff}</div>`;
 const cel=document.createElement('div');cel.id='celest';cel.innerHTML=`<button class="moon" id="moonBtn" aria-label="A note for Mom">${moonSVG(moonPhase(Date.now()))}</button><button class="sun" id="sunBtn" aria-label="The evening star: a note for Mom"></button><div id="mstars"></div>`;
 const note=document.createElement('div');note.id='mnote';note.setAttribute('role','dialog');note.hidden=true;
 st.prepend(sky);sky.after(back);st.querySelector('svg').after(front);front.after(cel);st.appendChild(note);
 if(STAGE){st.classList.add('theme-stage','skyinit');setTimeout(()=>st.classList.remove('skyinit'),600);const bd=document.createElement('div');bd.className='sbackdrop';sky.appendChild(bd);
   const pr=document.createElement('div');pr.id='proscen';pr.setAttribute('aria-hidden','true');cel.after(pr);
   $('#moonBtn').innerHTML=paperMoonSVG();$('#sunBtn').innerHTML=paperSunSVG();$('#sunBtn').setAttribute('aria-label','The setting sun: a note for Mom');
   const mq=document.createElement('div');mq.id='marquee';mq.innerHTML=marqueeSVG();pr.after(mq);
   // tap the banner to hoist it up out of view; a gold pull cord stays under the valance to lower it again (remembered on this device)
   if(ART){const pull=document.createElement('button');pull.type='button';pull.id='mqPull';pull.setAttribute('aria-label','Lower the family banner');
     pull.innerHTML='<img src="photos/art/pull-cord.webp" alt="" draggable="false">';
     mq.after(pull);mq.setAttribute('role','button');mq.setAttribute('tabindex','0');mq.setAttribute('aria-label','Raise the family banner out of view');
     const set=up=>{mq.classList.toggle('up',up);pull.classList.toggle('on',up);try{localStorage.setItem('ftBannerUp',up?'1':'')}catch(e){}};
     let up0=false;try{up0=localStorage.getItem('ftBannerUp')==='1'}catch(e){}set(up0);
     mq.addEventListener('click',()=>set(true));mq.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();set(true);}});pull.addEventListener('click',()=>set(false));}
   const draw=()=>{const r=st.getBoundingClientRect();if(r.width<10)return;const tb=st.querySelector('.tools'),D=stageDims(r.width,r.height);$('#marquee').style.top=(r.width<700?4:6)+'px';if(r.width<700){const mb=mqBot();st.style.setProperty('--mqb',mb+'px');}st.style.setProperty('--apron',D.ah+'px');if(tb)st.style.setProperty('--tbh',tb.offsetHeight+'px');const obs=ART&&r.width>=700?[...st.querySelectorAll('#tmstars .flantern,#tmstars .plantern')].map(e=>{const b=e.getBoundingClientRect();return b.width?[b.left-r.left-14,b.top-r.top-10,b.right-r.left+14,b.bottom-r.top+10]:null;}).filter(Boolean):[];
   bd.innerHTML=stageBackdrop(r.width,r.height,mqBot(),canopyTopFit(r),obs);pr.innerHTML=stageFrame(r.width,r.height);};
   draw();stageDraw=draw;let rt;new ResizeObserver(()=>{if(st.classList.contains('moving'))return;clearTimeout(rt);rt=setTimeout(()=>{draw();if(!tTouched)tStart();},120);}).observe(st);}}
/* the moon and sun as friendly faces, gold-rimmed like an old stage sign (original drawings) */
function marqueeSVG(){
  // preview: Gemini's painted velvet banner, placed so its cloth and moon centre on x 260 (no lettering in the picture; the family name is set on it here so it stays sharp and exact)
  if(ART)return `<svg class="mqsign" viewBox="0 0 520 190" role="img" aria-label="The Graham and Harper Family" style="overflow:visible">
   <defs><linearGradient id="mqpG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9a6"/><stop offset=".5" stop-color="#e6b65a"/><stop offset="1" stop-color="#b07a2a"/></linearGradient></defs>
   <line x1="79.7" y1="-400" x2="79.7" y2="7" stroke="#d9a441" stroke-width="2"/><line x1="438.1" y1="-400" x2="438.1" y2="7" stroke="#d9a441" stroke-width="2"/>
   <image href="photos/art/banner.webp" x="62.1" y="6" width="400" height="167.8"/>
   <g font-family="Spectral,Georgia,serif" text-anchor="middle">${(()=>{
     // the dark outline is a separate copy drawn behind the gold, instead of paint-order (iPad Safari drew the outline over the letters)
     const T=(a,t,st,fill)=>`<text ${a} stroke="#1e0a24" stroke-width="${st}" stroke-linejoin="round" fill="#1e0a24">${t}</text><text ${a} fill="${fill}">${t}</text>`;
     return T('x="260" y="70" font-style="italic" font-size="17"','The',4.8,'#f3dc95')
      +`<g font-weight="700" font-size="35">${T('x="238" y="99" text-anchor="end"','Graham',5.2,'url(#mqpG)')}${T('x="260" y="99"','&amp;',5.2,'url(#mqpG)')}${T('x="282" y="99" text-anchor="start"','Harper',5.2,'url(#mqpG)')}</g>`
      +T('x="260" y="121" font-style="italic" font-size="17" letter-spacing="3"','Family',4.8,'#f3dc95');})()}</g></svg>`;
  // the family name on a purple velvet pennant hung from a gold rod, with gold tassels (Mat's pick, design B)
  return `<svg class="mqsign" viewBox="0 0 520 190" role="img" aria-label="The Graham and Harper Family" style="overflow:visible">
   <defs><linearGradient id="mqpV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b2a8f"/><stop offset="1" stop-color="#2c0f50"/></linearGradient>
   <linearGradient id="mqpG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9a6"/><stop offset=".5" stop-color="#e0ae45"/><stop offset="1" stop-color="#9a6a1e"/></linearGradient>
   <pattern id="mqpS" width="54" height="70" patternUnits="userSpaceOnUse"><path d="${star6(12,14,3)}" fill="#e9c46a" opacity=".45"/><circle cx="38" cy="46" r="1.1" fill="#fff3c8" opacity=".45"/></pattern></defs>
   <line x1="110" y1="-400" x2="110" y2="20" stroke="#d9a441" stroke-width="2"/><line x1="410" y1="-400" x2="410" y2="20" stroke="#d9a441" stroke-width="2"/>
   <path d="M96 24H424V140L392 158 360 140 328 158 296 140 260 160 224 140 192 158 160 140 128 158 96 140Z" fill="url(#mqpV)" stroke="#d9a441" stroke-width="2.5"/>
   <path d="M96 24H424V140L392 158 360 140 328 158 296 140 260 160 224 140 192 158 160 140 128 158 96 140Z" fill="url(#mqpS)"/>
   <path d="M106 32H414V134L392 147 360 132 328 147 296 132 260 149 224 132 192 147 160 132 128 147 106 134Z" fill="none" stroke="#d9a441" stroke-width="1" opacity=".6"/>
   <rect x="80" y="14" width="360" height="10" rx="5" fill="url(#mqpG)"/><circle cx="80" cy="19" r="8" fill="url(#mqpG)"/><circle cx="440" cy="19" r="8" fill="url(#mqpG)"/>
   <text x="260" y="62" text-anchor="middle" font-family="Spectral,Georgia,serif" font-style="italic" font-size="17" fill="#f3dc95">The</text>
   <text x="260" y="98" text-anchor="middle" font-family="Spectral,Georgia,serif" font-weight="700" font-size="34" fill="url(#mqpG)" stroke="#2a0f45" stroke-width=".8" textLength="290" lengthAdjust="spacingAndGlyphs">Graham &amp; Harper</text>
   <text x="260" y="124" text-anchor="middle" font-family="Spectral,Georgia,serif" font-style="italic" font-size="17" fill="#f3dc95" letter-spacing="3">Family</text>
   <g fill="#e9c46a"><path transform="translate(222 57)" d="M0 -7l2 5 5 .4-4 3 1.3 5-4.3-2.7-4.3 2.7 1.3-5-4-3 5-.4Z"/><path transform="translate(298 57)" d="M0 -7l2 5 5 .4-4 3 1.3 5-4.3-2.7-4.3 2.7 1.3-5-4-3 5-.4Z"/><path transform="translate(212 120)" d="M0 -7l2 5 5 .4-4 3 1.3 5-4.3-2.7-4.3 2.7 1.3-5-4-3 5-.4Z"/><path transform="translate(308 120)" d="M0 -7l2 5 5 .4-4 3 1.3 5-4.3-2.7-4.3 2.7 1.3-5-4-3 5-.4Z"/></g>
   ${[128,192,260,328,392].map(x=>`<line x1="${x}" y1="${x===260?160:158}" x2="${x}" y2="${x===260?178:172}" stroke="#d9a441" stroke-width="1.5"/><circle cx="${x}" cy="${x===260?181:175}" r="3.5" fill="#e0ae45"/>`).join('')}</svg>`;}
/* stage sun: a gold paper-cut sun with pointed rays, hanging on two strings (Mat's pick, design #1) */
function paperSunSVG(){if(ART)return `<svg viewBox="-110 -110 220 220" aria-hidden="true" style="overflow:visible"><line x1="0" y1="-4000" x2="0" y2="-124" stroke="#f3e2b8" stroke-width="2" opacity=".8"/><image href="photos/art/sun.webp" x="-100" y="-125.5" width="201" height="216"/></svg>`;let rays='',sh='';for(let i=0;i<12;i++){const d=`<path transform="rotate(${i*30})" d="M-10 -52L0 -92 10 -52Z"/>`;rays+=d;sh+=d;}
  return `<svg viewBox="-110 -110 220 220" aria-hidden="true" style="overflow:visible">
  <defs><linearGradient id="psG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe6a0"/><stop offset=".55" stop-color="#f0b94e"/><stop offset="1" stop-color="#c47f22"/></linearGradient></defs>
  <line x1="-30" y1="-4000" x2="-30" y2="-54" stroke="#f3e2b8" stroke-width="2" opacity=".8"/><line x1="30" y1="-4000" x2="30" y2="-54" stroke="#f3e2b8" stroke-width="2" opacity=".8"/>
  <g transform="translate(7 9)" opacity=".4" fill="#3a1020">${sh}<circle r="56"/></g>
  <g fill="url(#psG)" stroke="#9a6a1e" stroke-width="1.2">${rays}</g>
  <circle r="56" fill="url(#psG)" stroke="#9a6a1e" stroke-width="2"/><circle r="44" fill="#ffe9b0" opacity=".45"/></svg>`;}
/* stage moon: a gold paper-cut crescent hanging on a string from behind the valance (Mat's pick, design #2) */
function paperMoonSVG(){if(ART)return `<svg viewBox="-110 -110 220 220" aria-hidden="true" style="overflow:visible"><line x1="-5" y1="-4000" x2="-5" y2="-118" stroke="#e8d8a8" stroke-width="2" opacity=".75"/><image href="photos/art/moon-crescent-face.webp" x="-90" y="-120" width="180" height="216"/></svg>`;return `<svg viewBox="-110 -110 220 220" aria-hidden="true" style="overflow:visible">
  <defs><mask id="pmA" maskUnits="userSpaceOnUse" x="-120" y="-120" width="240" height="240"><rect x="-120" y="-120" width="240" height="240" fill="#000"/><circle r="78" fill="#fff"/><circle cx="34" cy="-18" r="70" fill="#000"/></mask>
   <mask id="pmB" maskUnits="userSpaceOnUse" x="-120" y="-120" width="240" height="240"><rect x="-120" y="-120" width="240" height="240" fill="#000"/><circle r="66" fill="#fff"/><circle cx="30" cy="-16" r="62" fill="#000"/></mask>
   <linearGradient id="pmG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe6a0"/><stop offset=".55" stop-color="#ecbf5c"/><stop offset="1" stop-color="#c08a32"/></linearGradient></defs>
  <line x1="-40" y1="-4000" x2="-40" y2="-62" stroke="#e8d8a8" stroke-width="2" opacity=".75"/>
  <g transform="translate(7 9)" opacity=".5"><rect x="-90" y="-90" width="180" height="180" fill="#050a22" mask="url(#pmA)"/></g>
  <rect x="-90" y="-90" width="180" height="180" fill="url(#pmG)" mask="url(#pmA)"/>
  <rect x="-90" y="-90" width="180" height="180" fill="#ffe9b0" mask="url(#pmB)" opacity=".55"/>
  <circle cx="-40" cy="-62" r="4" fill="#b98530"/></svg>`;}
/* ---------- toy-theater scenery (theme=stage): drawn to the screen size, redrawn only on resize ---------- */
function star6(x,y,r){let d='';for(let i=0;i<12;i++){const a=(i*30-90)*Math.PI/180,rr=i%2?r*.45:r;d+=(i?'L':'M')+(x+Math.cos(a)*rr).toFixed(1)+' '+(y+Math.sin(a)*rr).toFixed(1);}return d+'Z';}
function stageBackdrop(W,H,mqb=200,gb=0,obs=[]){const ph=W<700;let sd=11;const r=()=>(sd=(sd*16807)%2147483647)/2147483647,f=n=>n.toFixed(1);
  // two rows of flat cut-out clouds hanging from the top, then gold stars on strings
  const top=stageDims(W,H).top-(ph?4:10);
  const row=(y,sc,cls)=>{let x=-40,d='M-60 0L-60 '+f(y);while(x<W+60){const w=(ph?60:90)*sc*(.75+r()*.6),h=w*(.42+r()*.18);d+=`Q${f(x+w*.05)} ${f(y+h)} ${f(x+w*.5)} ${f(y+h*.95)}Q${f(x+w*.95)} ${f(y+h)} ${f(x+w)} ${f(y)}`;x+=w;}return `<path class="${cls}" d="${d}L${f(W+60)} 0Z"/>`;};
  const sd0=sd,back=row(top+(ph?8:14),1.25,'sc2'),front=row(top,1,'sc1');sd=sd0;const backD=row(top+(ph?8:14),1.25,'sc2d'),frontD=row(top,1,'sc1d');
  // tall screens (a tablet held upright): the open sky is the band between the valance and the top of the canopy,
  // so everything hangs there instead of beside the tree, where the canopy fills the width
  const tall=!ph&&H>W*1.15&&gb-top>150,sunL=W*.92-Math.min(140,Math.max(90,W*.095))-14,sunY=H*.22-10;
  // each hanging piece is its own small picture, so raising and lowering it is a move the graphics chip does by itself
  // (one big picture had to be repainted every frame of the set change, and Android tablets showed black patches)
  const piece=(cls,i,x0,x1,y1,inner)=>`<svg class="${cls}" style="--i:${i};left:${f(x0)}px;width:${f(x1-x0)}px;height:${f(y1)}px" width="${f(x1-x0)}" height="${f(y1)}" viewBox="${f(x0)} 0 ${f(x1-x0)} ${f(y1)}" overflow="visible">${inner}</svg>`;
  // gold stars on strings, hanging from behind the valance at different drops and sizes.
  // They hang in the open sky: beside the tree on wide screens, in the gap under the sign on phones.
  let stars='',si=0;const n=ph?8:tall?18:24,base=ph?6:H<520?8:13;for(let i=0;i<n;i++){let x=W*(.04+.92*(i+.5)/n)+(r()-.5)*W*(ph?.03:.025),dx=Math.abs(x-W/2)/W,rs=base*(ph?(i%3===1?1.5+r()*.5:.6+r()*.7):.55+r()*1.15);let len;
    if(ph){if(dx>.44||x>W*.74)continue;const PD=[.1,.95,.45,.75,0,.6,1,.3];const d=PD[i%PD.length];
      len=(dx>.32?top+14+d*(mqb+80-top):mqb+8+d*82)+rs;}
    else if(tall){if(dx>.45)continue;const PD=[.15,.8,.4,.95,.05,.6,.3,1,.5,.7,.2,.9];const d=PD[i%PD.length];
      const lo=dx<.2?mqb+14:top+16,hi=gb-rs-10;if(hi<lo+10)continue;len=lo+d*(hi-lo);
      if(x+rs>sunL-6&&len+rs>sunY-20)len=Math.max(top+16,sunY-26-rs);}
    else if(dx<.21)continue;
    // preview on wide screens: most stars hang lower, in the open sky beside the tree (the ones nearest the banner stop above the canopy),
    // and none hang across the moon or the sun
    else if(ART){const q=r();len=dx<.31?mqb+10+q*Math.max(20,gb-mqb-30):top+H*.07+Math.pow(q,1.15)*H*.38;
      if(x>W*.78&&len+rs*1.4>H*.12&&len-rs*1.4<H*.43)len=len<H*.27&&H*.12-rs*1.5>top+20?H*.12-rs*1.5:H*.45+r()*H*.08;
      // keep each star (and its string) clear of the lanterns: hang it just above the lantern, or just below if there's no room above
      // (a string hanging past a lantern would cross it), so the star hangs above the highest lantern in its column, or is left out
      const hitAt=xx=>obs.filter(([a,b,c])=>xx+rs*1.3>a&&xx-rs*1.3<c&&len+rs*1.3>b);let hits=hitAt(x);
      if(hits.length){const xs=[1,-1,2,-2,3,-3,4,-4].map(k=>x+k*Math.max(18,rs*1.6)).filter(xx=>Math.abs(xx-W/2)/W>.2&&xx>W*.03&&xx<W*.97);const nx=xs.find(xx=>!hitAt(xx).length);
        if(nx!==undefined){x=nx;hits=[];}else{const up=Math.min(...hits.map(h=>h[1]))-rs*1.4-6;if(up<top+24)continue;len=up;}}}
    else if(dx<.31)len=top+20+r()*Math.max(10,mqb-top-30);
    else len=top+(ph?16:24)+Math.pow(r(),1.4)*H*.46;
    if(ART){const e=si%2,iw=e?184:161,cx=e?91:80,cy=e?115:123,sc=rs*2.3/iw,ix=x-cx*sc,iy=len-cy*sc;
      stars+=piece('hstar',si++,ix-4,ix+iw*sc+4,iy+192*sc+4,`<line x1="${f(x)}" y1="0" x2="${f(x)}" y2="${f(iy+2)}" class="sstr"/><image href="photos/art/star-${e?8:6}point.webp" x="${f(ix)}" y="${f(iy)}" width="${f(iw*sc)}" height="${f(192*sc)}"/>`);continue;}
    stars+=piece('hstar',si++,x-rs-10,x+rs+10,len+rs+10,`<line x1="${f(x)}" y1="0" x2="${f(x)}" y2="${f(len-rs)}" class="sstr"/><path class="sgold" d="${star6(x,len,rs)}"/><path class="sglint" d="${star6(x-rs*.12,len-rs*.12,rs*.42)}"/>`);}
  // sunset set piece: peach paper clouds on strings that are lowered in when the stars are hoisted out
  const band=k=>mqb+k*(gb-mqb);
  const cl=ph?[[.13,mqb+26,92],[.47,mqb+70,104]]:tall?[[.12,top+.5*(gb-top),112],[.33,band(.78),100],[.6,band(.42),104],[.83,gb-12,96]]:[[.07,top+62,132],[.15,top+H*.33,112],[.08,top+H*.53,128],[.775,top+H*.4,124],[.91,top+H*.64,100]];
  let clouds='';cl.forEach(([fx,cy,w],k)=>{if(ART){const e=k%2,iw=e?400:360,ih=e?164:178,rx=e?199:181,bot=e?163:176,sc=w*(ph?.66:1.25)/iw,ix=W*fx-iw*sc/2,iy=cy-bot*sc;
      clouds+=piece('hcloud',k,ix-2,ix+iw*sc+2,cy+4,`<line x1="${f(ix+rx*sc)}" y1="0" x2="${f(ix+rx*sc)}" y2="${f(iy+3)}" class="sstr"/><image href="photos/art/cloud-sunset-${e?'wispy':'puffy'}.webp" x="${f(ix)}" y="${f(iy)}" width="${f(iw*sc)}" height="${f(ih*sc)}"/>`);return;}
    const x0=W*fx-w/2,p=`M${f(x0)} ${f(cy)}A${f(w*.2)} ${f(w*.2)} 0 0 1 ${f(x0+w*.3)} ${f(cy-w*.13)}A${f(w*.26)} ${f(w*.26)} 0 0 1 ${f(x0+w*.72)} ${f(cy-w*.1)}A${f(w*.19)} ${f(w*.19)} 0 0 1 ${f(x0+w)} ${f(cy)}Z`;
    clouds+=piece('hcloud',k,x0-4,x0+w+10,cy+12,`<line x1="${f(x0+w*.32)}" y1="0" x2="${f(x0+w*.32)}" y2="${f(cy-w*.16)}" class="sstr"/><line x1="${f(x0+w*.7)}" y1="0" x2="${f(x0+w*.7)}" y2="${f(cy-w*.2)}" class="sstr"/>
      <path d="${p}" transform="translate(5 7)" class="pcsh"/><path d="${p}" class="pcl"/><path d="M${f(x0+w*.12)} ${f(cy-3)}H${f(x0+w*.88)}" class="pcln"/>`);});
  // the day-coloured copy of the cloud rows fades in over the night one (a fade costs nothing; changing the colours repainted it every frame)
  const RH=Math.ceil(top+(ph?8:14)+(ph?60:90)*1.25*1.35*.6+14);
  if(ART){const SH=Math.ceil(top+(ph||H<520?78:205)),im=d=>`<svg class="srow${d?' srowday':''}" width="${W}" height="${SH}" viewBox="0 0 ${W} ${SH}" style="width:${W}px;height:${SH}px"><image href="photos/art/clouds-strip${d?'-day':''}.webp" width="${W}" height="${SH}" preserveAspectRatio="xMidYMax slice"/></svg>`;
    {/* two cut-out cloud rows slid on rods in opposite directions; the back row is a darker flipped copy hanging a little lower */
      const P2=ph?24:44,dy=ph?7:12,rw=(d,b)=>`<svg class="srow${d?' srowday':''}" width="${W}" height="${SH+dy}" viewBox="0 0 ${W} ${SH+dy}" style="width:${W}px;height:${SH+dy}px"><image href="photos/art/clouds-strip${b?'-back':''}${d?'-day':''}.webp" x="${-P2}" y="${b?dy:0}" width="${W+2*P2}" height="${SH}" preserveAspectRatio="xMidYMax slice"/></svg>`;
      return `<div class="crow cback">${rw(0,1)}${rw(1,1)}</div><div class="crow cfront">${rw(0,0)}${rw(1,0)}</div>`+stars+clouds;}
    return im(0)+im(1)+stars+clouds;}
  return `<svg class="srow" width="${W}" height="${RH}" viewBox="0 0 ${W} ${RH}" style="width:${W}px;height:${RH}px"><defs><linearGradient id="scg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c4fae"/><stop offset="1" stop-color="#18307a"/></linearGradient>
   <linearGradient id="pclg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe0c2"/><stop offset="1" stop-color="#f49a8e"/></linearGradient><linearGradient id="sgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe7a1"/><stop offset=".5" stop-color="#e3b04b"/><stop offset="1" stop-color="#a8721f"/></linearGradient></defs>${back}${front}</svg>`+
   `<svg class="srow srowday" width="${W}" height="${RH}" viewBox="0 0 ${W} ${RH}" style="width:${W}px;height:${RH}px">${backD}${frontD}</svg>${stars}${clouds}`;}
// where the top of the canopy lands when the whole tree is fitted (same sums as tFrame), so tall screens can hang the stars above it
function canopyTopFit(r){if(!TB||!isFinite(TB.y0)||TB.x1-TB.x0<50)return 0;const SD=stageDims(r.width,r.height),m=$('#marquee'),tl=$('#tstage>.tools'),
  top=Math.max(60,SD.top,m?mqBot()+(SD.ph?104:10):0),avail=r.height-top-8-SD.bot-(tl?tl.offsetHeight+10:0),w=TB.x1-TB.x0,h=TB.y1-TB.y0,
  k=Math.max(.12,Math.min((r.width-36-SD.side*2)/w,avail/h,1.2));return top+avail/2-h*k/2-CANOPY_UP*k;}
// how much of each edge the stage frame covers, so Fit keeps the family inside it
function stageDims(W,H){const ph=W<700,vh=ph?22:Math.max(30,Math.min(56,W*.032)),n=Math.max(3,Math.round(W/(ph?150:250))),sw=W/n,dr=Math.min(sw*.16,ph?20:36),
  cw=ph?16:Math.max(26,Math.min(78,W*.045)),ah=ph?12:Math.max(16,Math.min(30,W*.018));
  if(ART){/* painted valance (1600x397, swags about 215 deep) and side curtains (612x1200, drape about 224 wide) */
    const ah=Math.max(14,Math.min(64,W*.04)),hv=Math.min(W*397/1600,H*(ph?.15:.2)),cwI=ph?Math.max(64,W*.19):Math.max(150,Math.min(290,W*.15));
    const vy=ph?-hv*.14:-hv*.34;// computers: the valance rides higher so more of the cloud border shows
    return {ph,vh,n,sw,dr,cw,ah,hv,cwI,vy,top:hv*.56+vy+8,side:cwI*224/612*1.05,bot:ah+(ph?14:34)};}
  return {ph,vh,n,sw,dr,cw,ah,top:vh+dr*1.9+10,side:cw*1.3,bot:ah+(ph?14:34)};}
function stageFrame(W,H){const f=n=>n.toFixed(1),{ph,vh,n,sw,dr,cw,ah,hv,cwI,vy}=stageDims(W,H);
  if(ART){// side curtains in three slices: swag + tie-back and the hem keep their shape, the straight drape between them stretches to the screen height
    const s=cwI/612,tH=912*s,hH=144*s,mH=Math.max(0,H-tH-hH);
    const cur=(src,iw,right)=>{const w=iw*s,x=right?W-w+24*s:-36*s,sl=(y,h,sy,sh)=>`<svg x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" viewBox="0 ${sy} ${iw} ${sh}" preserveAspectRatio="none"><image href="photos/art/${src}.webp" width="${iw}" height="1200"/></svg>`;
      return sl(0,tH+1,0,913)+sl(tH,mH+2,912,144)+sl(H-hH,hH,1056,144);};
    // the painted apron: its footlights and lip show, the dark front runs off the bottom of the screen
    const apron=`<rect x="0" y="${f(H-ah*.55)}" width="${W}" height="${f(ah)}" fill="#1a0e0a"/><image href="photos/art/apron.webp" x="0" y="${f(H-ah)}" width="${W}" height="${f(W*129/1600)}" preserveAspectRatio="none"/>`;
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="pgl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe6a0"/><stop offset=".5" stop-color="#d9a441"/><stop offset="1" stop-color="#8f5f1b"/></linearGradient></defs>
     ${apron}<rect x="-6" y="0" width="${f(cwI*.14+6)}" height="${H}" fill="#24092f"/><rect x="${f(W-cwI*.14)}" y="0" width="${f(cwI*.14+6)}" height="${H}" fill="#24092f"/>${cur('curtain-left',612,0)}${cur('curtain-right',546,1)}<image href="photos/art/valance-top.webp" x="0" y="${f(vy)}" width="${W}" height="${f(hv)}" preserveAspectRatio="none"/></svg>`;}
  // valance: green swags behind, red swags in front, gold fringe, crescents where they meet
  let green='',red='',fringe='',orn='';
  for(let i=-1;i<=n;i++){const x=i*sw,gx=x+sw/2;
    green+=`<path class="pgrn" d="M${f(gx-sw*.55)} ${f(vh-4)}Q${f(gx)} ${f(vh+dr*1.25)} ${f(gx+sw*.55)} ${f(vh-4)}L${f(gx+sw*.55)} ${f(vh-10)}Q${f(gx)} ${f(vh+dr*.7)} ${f(gx-sw*.55)} ${f(vh-10)}Z"/>`;
    if(i<0||i>=n)continue;
    red+=`<path class="pred" d="M${f(x)} ${f(vh-6)}Q${f(x+sw/2)} ${f(vh+dr*1.9)} ${f(x+sw)} ${f(vh-6)}Z"/>`+
      [.35,.62].map(k=>`<path class="pfold" d="M${f(x+sw*.12)} ${f(vh)}Q${f(x+sw/2)} ${f(vh+dr*1.9*k)} ${f(x+sw*.88)} ${f(vh)}"/>`).join('');
    fringe+=`<path class="pfr" d="M${f(x+2)} ${f(vh-4)}Q${f(x+sw/2)} ${f(vh+dr*1.9-2)} ${f(x+sw-2)} ${f(vh-4)}"/>`;
    const cr=ph?9:Math.min(22,vh*.42);orn+=`<g transform="translate(${f(x)} ${f(vh+2)})"><circle r="${f(cr)}" class="pcres"/><circle cx="${f(cr*.42)}" cy="${f(-cr*.2)}" r="${f(cr*.82)}" class="pcut"/></g>`;}
  const band=`<rect x="0" y="0" width="${W}" height="${f(vh)}" class="pband"/><rect x="0" y="${f(vh-5)}" width="${W}" height="3" class="pgold"/>`;
  // tied-back side curtains
  const ty=H*.58;
  const side=sg=>{const e=sg<0?0:W,o=-sg;const pts=`M${e} 0L${f(e+o*cw*1.25)} 0Q${f(e+o*cw*.6)} ${f(ty*.6)} ${f(e+o*cw*.45)} ${f(ty)}Q${f(e+o*cw*1.4)} ${f(ty+(H-ty)*.55)} ${f(e+o*cw*1.1)} ${H}L${e} ${H}Z`;
    let folds='';for(let k=1;k<4;k++){const fx=e+o*cw*k*.27;folds+=`<path class="pfold" d="M${f(fx)} 0Q${f(e+o*cw*k*.13)} ${f(ty*.6)} ${f(e+o*cw*k*.11)} ${f(ty)}Q${f(e+o*cw*k*.33)} ${f(ty+(H-ty)*.5)} ${f(e+o*cw*k*.28)} ${H}"/>`;}
    const tx=e+o*cw*.45;return `<path class="pred" d="${pts}"/>${PURP?`<path d="${pts}" fill="url(#pstp)"/>`:''}${folds}<path class="ptie" d="M${f(e)} ${f(ty-5)}L${f(tx+o*4)} ${f(ty-5)}L${f(tx+o*4)} ${f(ty+5)}L${f(e)} ${f(ty+5)}Z"/><circle cx="${f(tx+o*4)}" cy="${f(ty)}" r="${ph?4:6}" class="pgold"/><path class="ptas" d="M${f(tx+o*4)} ${f(ty+4)}l-${ph?4:7} ${ph?14:24}h${ph?8:14}Z"/>`;};
  // stage apron with footlights
  let lights='';for(let x=W*.12;x<W*.9;x+=ph?70:120)lights+=`<ellipse cx="${f(x)}" cy="${f(H-ah)}" rx="${ph?10:16}" ry="${ph?3:5}" class="plight"/>`;
  const apron=`<rect x="0" y="${f(H-ah)}" width="${W}" height="${f(ah)}" class="papron"/><rect x="0" y="${f(H-ah)}" width="${W}" height="2.5" class="pgold"/>${lights}`;
  const corner=sg=>{const x=sg<0?cw*.9:W-cw*.9,y=vh+(ph?14:26),rr=ph?11:20;return `<g transform="translate(${f(x)} ${f(y)})"><circle r="${rr}" class="pcres"/><circle cx="${f(-sg*rr*.4)}" cy="${f(-rr*.15)}" r="${f(rr*.8)}" class="pcut"/></g>`;};
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="prg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b3aa0"/><stop offset="1" stop-color="#2b1150"/></linearGradient>
   <linearGradient id="pgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3f98"/><stop offset="1" stop-color="#141d5a"/></linearGradient>
   ${PURP?`<pattern id="pstp" width="54" height="70" patternUnits="userSpaceOnUse"><path d="${star6(12,14,4.2)}" fill="#e9c46a" opacity=".85"/><path d="${star6(40,48,2.6)}" fill="#f3dc95" opacity=".7"/><circle cx="34" cy="16" r="1.2" fill="#fff3c8" opacity=".7"/><circle cx="8" cy="52" r="1" fill="#fff3c8" opacity=".6"/><g transform="translate(26 33)"><circle r="5" fill="#e9c46a" opacity=".85"/><circle cx="2.2" cy="-1.2" r="4.3" fill="#3d1a68"/></g></pattern>`:''}
   <linearGradient id="pgl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe6a0"/><stop offset=".5" stop-color="#d9a441"/><stop offset="1" stop-color="#8f5f1b"/></linearGradient></defs>
   ${side(-1)}${side(1)}${band}${green}${red}${PURP?(red.match(/<path class="pred"[^>]*>/g)||[]).join('').replace(/class="pred"/g,'fill="url(#pstp)"'):''}${fringe}${orn}${corner(-1)}${corner(1)}${apron}</svg>`;}

function applySky(redraw){SKY=skyNow();NIGHT=true;const st=$('#tstage');['day','dusk','night'].forEach(m=>st.classList.toggle('sky-'+m,SKY===m));if(STAGE){const mb=$('#moonBtn'),sb=$('#sunBtn');if(mb)mb.inert=SKY==='day';if(sb)sb.inert=SKY!=='day';}st.classList.toggle('night',NIGHT);
  const b=$('#tSky');if(b){const IC={auto:'<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor"/></svg>',
   day:'<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 17a6 6 0 0 1 12 0Z" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 20h20M12 5v3M4.6 9.6l2 2M19.4 9.6l-2 2"/></g></svg>',
   night:'<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" fill="currentColor"/></svg>'};
  const L={auto:['auto','Sky: automatic (sunset by day, night after dark)'],day:['day','Sunset — tap for night'],night:['night','Night — tap for sunset']}[SKYPREF]||['auto',''];b.innerHTML=IC[L[0]];b.setAttribute('aria-label',L[1]);b.title=L[1];}
  if(redraw&&tw.childElementCount){const k={...tv};drawLeafTree(false);tv=k;tApply(false);}}
applySky(false);
setInterval(()=>{if(SKYPREF==='auto'&&autoSky()!==SKY)applySky(true);},5*60*1000);
/* a note for Mom, hidden in the moon (and the sun) */
function showNote(html,x,y){$('#mnote').classList.remove('placenote');const n=$('#mnote'),r=$('#tstage').getBoundingClientRect();n.innerHTML=html+'<button class="nx" aria-label="Close">✕</button>';n.hidden=false;
  const w=Math.min(320,r.width-24);n.style.width=w+'px';n.style.left=Math.max(12,Math.min(r.width-w-12,x-w/2))+'px';{const h=n.offsetHeight;let t=y+18;if(t+h>r.height-12)t=y-h-44;n.style.top=Math.max(64,Math.min(r.height-h-12,t))+'px';}
  n.classList.remove('on');void n.offsetWidth;n.classList.add('on');n.querySelector('.nx').onclick=()=>{n.hidden=true;placeKey=null;placePinned=false;};}
function giftNote(e){const r=$('#tstage').getBoundingClientRect(),b=e.currentTarget.getBoundingClientRect();
  showNote(`<div class="gift"><div class="g1">For Mom</div><div class="g2">Thanksgiving 2026</div><p>Every name on this tree is part of your story. With love from Mat.</p></div>`,b.left-r.left+b.width/2,b.bottom-r.top);}
$('#moonBtn').onclick=giftNote;$('#sunBtn').onclick=giftNote;
document.addEventListener('pointerdown',e=>{const n=$('#mnote');if(!n.hidden&&!n.contains(e.target)&&!e.target.closest('#celest button')&&!e.target.closest('.rootpin')){n.hidden=true;placeKey=null;placePinned=false;}});
/* shooting stars, once every minute or two */
function shoot(){setTimeout(shoot,60000+Math.random()*60000);if(SKY==='day'||RM||document.hidden||!$('#tstage').offsetWidth)return;
  const s=document.createElement('i');s.className='shoot';s.style.left=(15+Math.random()*60)+'%';s.style.top=(4+Math.random()*28)+'%';s.style.setProperty('--a',(18+Math.random()*22)+'deg');
  $('.sky').appendChild(s);setTimeout(()=>s.remove(),2200);}
setTimeout(shoot,15000+Math.random()*15000);
/* memory stars: every memory, photo or answer someone adds lights a star */
function hsh(t){let h=2166136261;for(const c of String(t)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}

/* ---------- in the sky above the tree: title banner ---------- */
let SKYG=null;
function renderMemStars(){const box=$('#mstars');if(!box)return;const list=contribs.filter(c=>['story','photo','answer'].includes(c.type)&&!isKeep(c)&&byId[c.pid]);
  const star=`<path d="M0-9L2 -2L9 0L2 2L0 9L-2 2L-9 0L-2-2Z"/>`;
  // beside the person: try spots around their photo that miss every face and name label
  const inTree=TSTYLE==='ink'&&tw.querySelector('.leaf'),taken=[];let sky='',tree='';
  const obst=inTree?Object.values(TP).flatMap(v=>[[v.x,v.y,v.r+10],[v.x,v.y+v.r+22,Math.max(36,v.r*.9)]]):[];
  const free=(x,y)=>obst.every(([ox,oy,or])=>Math.hypot(x-ox,y-oy)>or+12)&&taken.every(([tx,ty])=>Math.hypot(x-tx,y-ty)>30);
  const ANG=[-50,-130,-90,-20,-160,-70,-110,10,190,30,150];
  // on the stage every memory is a flower in the garden instead (Mat, 2026-11-23), so no stars beside people or in the sky
  if(STAGE&&inTree){box.innerHTML='';let g=tw.querySelector('#tmstars');if(!g){g=document.createElementNS('http://www.w3.org/2000/svg','g');g.id='tmstars';tw.appendChild(g);}g.innerHTML=gardenSVG(list);msScale();return;}
  list.forEach(c=>{const h=hsh(c.id),v=inTree&&TP[c.pid];let spot=null;
    if(v)for(const d of [v.r+26,v.r+46,v.r+66]){for(const a of ANG){const x=v.x+Math.cos(a*Math.PI/180)*d,y=v.y+Math.sin(a*Math.PI/180)*d;if(free(x,y)){spot=[x,y];break;}}if(spot)break;}
    const lab=`A memory about ${esc(byId[c.pid].n)}`;
    if(spot){taken.push(spot);tree+=`<g class="mstar tmstar" data-c="${esc(c.id)}" tabindex="0" role="button" aria-label="${lab}" transform="translate(${spot[0].toFixed(1)} ${spot[1].toFixed(1)})"><g class="mss"><circle r="18" fill="transparent"/><g class="msp" style="--dl:-${(h%40)/10}s">${star}</g></g></g>`;return;}
    const h2=hsh(c.id+'y');let x=4+(h%9200)/100,y=13+(h2%3700)/100;if(x<58&&y<17)y+=10;if(x>78&&y<30)x-=24;
    sky+=`<button class="mstar" data-c="${esc(c.id)}" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;--dl:-${(h%40)/10}s" aria-label="${lab}"><svg viewBox="-10 -10 20 20">${star}</svg></button>`;});
  box.innerHTML=sky;let g=tw.querySelector('#tmstars');if(!g&&tw.querySelector('.leaf')){g=document.createElementNS('http://www.w3.org/2000/svg','g');g.id='tmstars';tw.appendChild(g);}if(g)g.innerHTML=(inTree&&STAGE?gardenSVG(list):'')+tree;msScale();}
/* memory garden: every memory plants a glowing flower on the planet, in rows along its rim, outer shoulders first.
   Flowers step around faces, name scrolls, the main root, the root towns, the sign and the chest.
   A memory that arrives while the page is open sprouts (grows in). */
function gardenSlots(D=SOILD){const ob=[];Object.values(TP).forEach(v=>{ob.push(['c',v.x,v.y,v.r+16]);ob.push(['r',v.x,v.y+v.r+24,ART&&!PRINT?Math.max(86,v.r*2.9):Math.max(56,v.r*1.7),ART&&!PRINT?(FLAT?34:26):20]);});
  ob.push(['r',915,1440+DROP,34,170]);
  // the children and grandchildren on the planet stand on clear grass: no flowers among or above them
  const fam=Object.values(TP).filter(v=>v.y>1250);if(fam.length&&!(ART&&!PRINT)){const fx0=Math.min(...fam.map(v=>v.x-v.r))-50,fx1=Math.max(...fam.map(v=>v.x+v.r))+50,fb=Math.max(...fam.map(v=>v.y+v.r))+62;ob.push(['r',(fx0+fx1)/2,0,(fx1-fx0)/2,fb]);}ob.push(FLAT?['r',CHEST.x,GY,175,110]:['r',CHEST.x,CHEST.y-40,100,72]);
  const ok=(x,y)=>ob.every(o=>o[0]==='c'?Math.hypot(x-o[1],y-o[2])>o[3]:Math.abs(x-o[1])>o[3]||Math.abs(y-o[2])>o[4]);
  // painted hill: flowers grow in the green grass band, in the gaps between and below the kids and grandkids, spread evenly from the middle out
  if(FLAT){const S=[];/* two rows along the level grass out to both sides, clear of the trunk's root flare */
    for(const d of[36,80])for(let x=915-2600+(d>40?18:0);x<=915+2600;x+=36){if(Math.abs(x-915)<330)continue;if(ok(x,GY+d))S.push([x,GY+d]);}
    return spreadOrder(S,[[700,surfY(700)+60],[1130,surfY(1130)+60]]);}
  if(ART&&!PRINT){const S=[];for(let d=34;d<=SOIL0-22;d+=30)for(let x=915-640+((d/30|0)%2)*17;x<=915+640;x+=34){if(Math.abs(x-915)<70)continue;/* only the grass on the top of the hill, where it is on screen */const y=surfY(x)+d;if(y>HILL.cy-HILL.R*.25)continue;if(ok(x,y))S.push([x,y]);}
    return spreadOrder(S,[[700,surfY(700)+60],[1130,surfY(1130)+60]]);}
  const S=[];for(let j=0;30+j*36<=D-24;j++){const d=30+j*36;for(let x=-600+(j%2)*19;x<=2430;x+=38){if(Math.abs(x-PLANET.cx)>PLANET.R*(ART?.9:.62))continue;const y=surfY(x)+d;if(ok(x,y))S.push([x,y,j,y<1585?0:1]);}}
  return S.sort((a,b)=>a[3]-b[3]||a[2]-b[2]||Math.abs(b[0]-915)-Math.abs(a[0]-915));}
/* lanterns: memories of family who have passed float in the open sky around the canopy,
   gathering as a crown above it first and then down both sides */
// preview: lanterns spread through open sky. Wide screens: two loose columns of sky beside the canopy. Tall screens and phones:
// the band of sky between the bottom of the leaves and the hill. Spots are handed out far-from-each-other first, alternating sides.
let LWIDE=null;const lanternWide=()=>{const st=$('#tstage');return !!st&&st.clientWidth>=700&&st.clientWidth>st.clientHeight;};
function spreadOrder(S,seeds){const out=[],left=[...S];let cur=seeds.map(p=>left.splice(left.reduce((bi,q,i)=>Math.hypot(q[0]-p[0],q[1]-p[1])<Math.hypot(left[bi][0]-p[0],left[bi][1]-p[1])?i:bi,0),1)[0]).filter(Boolean);out.push(...cur);
  while(left.length){let bi=0,bd=-1;left.forEach((q,i)=>{const d=Math.min(...out.map(o=>Math.hypot(q[0]-o[0],(q[1]-o[1])*1.2)));if(d>bd){bd=d;bi=i;}});out.push(left.splice(bi,1)[0]);}return out;}
function artLanternSlots(can){const xs=can.map(v=>v.x-v.r),xe=can.map(v=>v.x+v.r),x0=Math.min(...xs),x1=Math.max(...xe),top=Math.min(...can.map(v=>v.y-v.r));
  const ob=Object.values(TP).flatMap(v=>[[v.x,v.y,v.r+40],[v.x,v.y+v.r+24,Math.max(80,v.r*2)]]),ok=(x,y)=>!ob.some(([ox,oy,rr])=>Math.hypot(x-ox,y-oy)<rr);
  const S=[];LWIDE=lanternWide();
  if(LWIDE){for(let y=top+130;y<=1250+DROP*.6;y+=70)for(const sd of[-1,1])for(let k=0;k<4;k++){const x=sd<0?x0-140-k*80:x1+140+k*80;if(ok(x,y))S.push([x+((y/70|0)%2)*20*sd,y]);}
    return spreadOrder(S,[[x0-180,top+170],[x1+180,top+170]]);}
  const low=Math.max(...can.map(v=>v.y+v.r))+70;
  for(let y=low;y<=1272+DROP+40;y+=55)for(let x=x0+40;x<=x1-40;x+=60){if(Math.abs(x-915)<150)continue;if(y>surfY(x)-75)continue;if(ok(x,y))S.push([x,y]);}
  return spreadOrder(S,[[915-330,low+60],[915+330,low+60]]);}
// preview (HANG): lanterns hang on short strings from the underside of the painted leaves.
// LEAFBOT = lowest leaf pixel of tree.webp every 16 px across (−1 = no leaves); the trunk columns are skipped.
let TREEMAP=null;
const LEAFBOT=[-1,-1,-1,-1,-1,-1,766,782,788,847,863,863,868,869,864,894,907,901,916,907,912,906,894,872,1010,1022,1039,1041,1076,1086,1088,1086,1079,1073,1088,1099,1101,1094,1091,1075,1063,1061,1064,1060,1041,1041,1042,1040,1033,1011,980,971,741,688,703,853,724,721,712,691,776,711,713,709,701,-1,706,-1,-1,621,-1,-1,622,628,579,579,583,582,615,616,648,597,581,549,663,648,645,-1,627,643,650,699,623,604,580,643,703,718,721,718,715,725,728,725,746,703,727,755,-1,762,755,-1,770,756,998,1014,1018,1016,1009,1032,1036,1048,1048,1045,1038,1025,1026,1043,1051,1056,1057,1046,1052,1025,1006,1021,1021,1016,1006,978,982,983,987,976,978,951,939,900,895,882,815,806,792,721,697,685,-1,-1,-1,-1,-1];
function hangSlots(){if(!TREEMAP)return [];const {x0,y0,sx,sy}=TREEMAP,S=[];
  const ob=Object.values(TP).flatMap(v=>[[v.x,v.y,v.r+34],[v.x,v.y+v.r+22,Math.max(80,v.r*2.8)]]),clear=(x,y)=>!ob.some(([ox,oy,rr])=>Math.abs(x-ox)<rr+24&&Math.abs(y-oy)<rr*.55+48);
  LEAFBOT.forEach((b,i)=>{if(b<0||i<8||i>LEAFBOT.length-8)return;const ix=i*16;if(ix>880&&ix<1700)return;// outer leaf lobes only, not over the trunk and branches
    const x=x0+ix*sx,yb=y0+(b-6)*sy;for(const L of [70,105,140]){const y=yb+L+44;if(y>surfY(x)-90)break;if(clear(x,y)){S.push([x,y,yb]);break;}}});
  return S;}
function lanternSlots(){const can=Object.values(TP).filter(v=>v.y<1250);if(!can.length)return [];if(ART&&!PRINT)return artLanternSlots(can);
  const xs=can.map(v=>v.x),ys=can.map(v=>v.y),cX=(Math.min(...xs)+Math.max(...xs))/2,rX=(Math.max(...xs)-Math.min(...xs))/2+110,top=Math.min(...ys),cY=(top+1250)/2,rY=(1250-top)/2+120;
  const ob=Object.values(TP).flatMap(v=>[[v.x,v.y,v.r+34],[v.x,v.y+v.r+24,Math.max(70,v.r*1.9)]]);
  const S=[];for(let y=top-200,r=0;y<=1180;y+=62,r++)for(let x=cX-rX-700+(r%2)*31;x<=cX+rX+700;x+=62){
    if(((x-cX)/rX)**2+((y-cY)/rY)**2<1)continue;if(ob.some(([ox,oy,rr])=>Math.hypot(x-ox,y-oy)<rr))continue;
    if(Math.abs(x-cX)<400&&y<top+60)continue;// the title banner hangs here
    S.push([x,y]);}
  // a crown over both shoulders of the canopy first, then down the sides
  const T=[[cX-rX*.72,top-40],[cX+rX*.72,top-40]],d=p=>Math.min(...T.map(([tx,ty])=>Math.hypot(p[0]-tx,(p[1]-ty)*1.25)));return S.sort((a,b)=>d(a)-d(b));}
// flower papers by kind of memory: [light, dark, outline]
// preview: Gemini's painted flowers, one per memory kind
const FLIMG={story:'story-peach',photo:'photo-pink',answer:'answer-blue',voice:'voice-lavender'};
const FLC={story:['#ffe0c2','#f49a8e','#b8586a'],photo:['#ffd9ea','#e8789f','#a8406a'],answer:['#dcefff','#7fb3e6','#3f6fa8'],voice:['#efe4ff','#a98be8','#6a4fb0']};
// one paper-cut flower: five rounded petals in a single shape
const FLOWER=(()=>{let d='';for(let i=0;i<5;i++){const a=i*72*Math.PI/180,P=(r,o)=>[Math.sin(a+o)*r,-Math.cos(a+o)*r],v0=P(3.4,-.63),c0=P(12.5,-.5),c1=P(12.5,.5),v1=P(3.4,.63);
  d+=(i?'L':'M')+v0.map(f1).join(' ')+'C'+[...c0,...c1,...v1].map(f1).join(' ');}return d+'Z';})();
// a hanging lantern's gold string up to the leaves and a soft warm pool of light around it
const hangBits=(sp,y,sc,top)=>sp[2]==null?'':`<circle class="hglow" r="95" fill="url(#hglow)"/><line class="hstr" x1="0" y1="${(sp[2]-y).toFixed(1)}" x2="0" y2="${(-top*sc+2).toFixed(1)}"/>`;
function gardenSVG(all){const byDate=(a,b)=>String(a.at||'').localeCompare(String(b.at||''))||String(a.id).localeCompare(String(b.id)),list=all,LS=lanternSlots();// every memory grows a flower; the lanterns are only the memorial films of family who have passed
  const S=gardenSlots(),mem=[...list].sort((a,b)=>String(a.at||'').localeCompare(String(b.at||''))||String(a.id).localeCompare(String(b.id)));
  const first=gardenSeen===null,seen=gardenSeen||new Set();let fl='';
  mem.forEach((c,i)=>{const sp=S[i];if(!sp)return;const [x,y]=sp,h=hsh(c.id),k=c.audio?'voice':FLC[c.type]?c.type:'story',rot=h%72,sw=((h>>8)%9-4);
    if(!first&&!seen.has(c.id))gardenNew[c.id]=Date.now();const nw=Date.now()-(gardenNew[c.id]||0)<2500;
    fl+=`<g class="mflower${nw?' sprout':''}" data-c="${esc(c.id)}" tabindex="0" role="button" aria-label="A memory about ${esc(byId[c.pid].n)}" transform="translate(${f1(x)} ${f1(y)})"><g class="mss"><g class="mfs" style="--sw:${sw}deg;--dl:-${(h%50)/10}s"><circle r="20" fill="transparent"/>${ART?`<image href="photos/art/flower-${FLIMG[k]}.webp" x="-15" y="-17.2" width="30" height="40.4"/>`:`
      <path d="M0 17Q${f1(sw/2)} 9 0 3" class="mfstem"/><path d="M0 12q-8-5-11 1q6 3 11-1z" class="mfleaf"/>
      <g transform="rotate(${rot})"><path d="${FLOWER}" transform="translate(2.2 3)" class="pfsh"/><path d="${FLOWER}" fill="url(#gf-${k})" stroke="${FLC[k][2]}" stroke-width="1.1"/></g>
      <path d="${star6(0,0,4.4)}" fill="url(#ggold)" stroke="#6b4410" stroke-width=".7"/><path d="${star6(-.6,-.6,1.8)}" fill="#fff6d8" opacity=".6"/>`}</g></g></g>`;});
  let lt='';const NF=FILMS.length;
  // each slideshow film gets a larger lantern with a play mark, in the best spots of the crown
  // the film lanterns take the best spots, each on its own person's side of the crown (Ed left, Annie Mae right)
  // every lantern (films and memorials) floats on its own person's side of the tree: the first spots are split left/right of the trunk
  // and handed out on each side in the order the people sit (outermost person, outermost lantern)
  const MLS=MEMLANTERNS.filter(id=>byId[id]&&TP[id]),ALL=[...FILMS.map((fm,i)=>({k:'f',i,pid:fm.pid})),...MLS.map(id=>({k:'m',pid:id}))].filter(o=>TP[o.pid]),FSP={},MSP={};
  {const px=o=>TP[o.pid].x,L=ALL.filter(o=>px(o)<915).sort((a,b)=>px(a)-px(b)),R=ALL.filter(o=>px(o)>=915).sort((a,b)=>px(a)-px(b));
   if(HANG){const big=document.body.classList.contains('big')||$('#tstage').clientWidth<700,BT={gp:1.15,par:1.05,aunt:1.25,ggp:1.2};
   ALL.forEach(o=>{const v=TP[o.pid],sc=o.k==='f'?1.55:1.3,top=(o.k==='f'?36:33)*sc,fs=FS[v.t]*(big?BT[v.t]||1:1),rb=v.y+v.r+4+fs*(big?2.3:1.7),str=12,sp=[v.x,rb+str+top,rb];if(o.k==='f')FSP[o.i]=sp;else MSP[o.pid]=sp;});}
   const HS=null,pool=HS&&HS.length>=ALL.length?HS:LS,SL0=pool.filter(q=>q[0]<915),SR0=pool.filter(q=>q[0]>=915);
   // hanging: spread each side's lanterns out along the leaves (farthest-apart first), then hand them out in x order
   const SL=HS&&pool===HS?spreadOrder(SL0,[[Math.min(...SL0.map(q=>q[0])),0]]):SL0,SR=HS&&pool===HS?spreadOrder(SR0,[[Math.max(...SR0.map(q=>q[0])),0]]):SR0,pick=(pool,n)=>pool.slice(0,n).sort((a,b)=>a[0]-b[0]);
   const put=HANG?()=>{}:(grp,sp)=>grp.forEach((o,j)=>{if(o.k==='f')FSP[o.i]=sp[j];else MSP[o.pid]=sp[j];});put(L,pick(SL,L.length));put(R,pick(SR,R.length));}
  FILMS.forEach((fm,i)=>{const sp=FSP[i];if(!sp||!byId[fm.pid])return;const [x,y]=sp;
    lt+=`<g class="flantern${sp[2]!=null?' hangl':''}" data-film="${fm.id}" tabindex="0" role="button" aria-label="Watch ${esc(fm.title)}: ${esc(fm.sub)}" transform="translate(${f1(x)} ${f1(y)})">${hangBits(sp,y,1.55,36)}<g class="mss"><g class="mls" style="--rot:0deg;--dl:-${i*2}s" transform="scale(1.55)"><circle r="38" fill="url(#lglow)"/>${ART?`<image class="limg" href="photos/art/lantern-film.webp" x="-17.9" y="-36" width="35.7" height="76.8"/>`:`
      <path d="M-14 -17L14 -17L10 15L-10 15Z" transform="translate(3 4)" fill="#0b1630" opacity=".35"/><path d="M-14 -17L14 -17L10 15L-10 15Z" fill="url(#lpaper)" stroke="#a8561c" stroke-width="1.2"/>
      <rect x="-15" y="-20" width="30" height="4" rx="1.5" fill="url(#ggold)" stroke="#6b4410" stroke-width=".7"/><rect x="-10" y="14" width="20" height="3" rx="1" fill="url(#ggold)" stroke="#6b4410" stroke-width=".6"/>
      <path d="M-4 -7L6 -1L-4 5Z" fill="#a8561c"/><ellipse cy="20" rx="2.2" ry="3.4" fill="#fff3b0"/>`}</g></g>${HANG?'':`<text y="${f1(48)}" class="fltx">${esc(fm.title.split(' ')[0])}${fm.id==='annie'?' Mae':''}</text>`}</g>`;});
  MLS.forEach((id,i)=>{const sp=MSP[id];if(!sp)return;const [x,y]=sp,v=byId[id],nm=v.s.split(' ')[0];
    lt+=`<g class="plantern${sp[2]!=null?' hangl':''}" data-p="${id}" tabindex="0" role="button" aria-label="In memory of ${esc(v.n)}" transform="translate(${f1(x)} ${f1(y)})">${hangBits(sp,y,1.3,33)}<g class="mss"><g class="mls" style="--rot:0deg;--dl:-${(i*1.3+1).toFixed(1)}s" transform="scale(1.3)"><circle r="34" fill="url(#lglow)"/>${ART?`<image class="limg" href="photos/art/lantern-memory.webp" x="-16" y="-33" width="32.1" height="76.8"/>`:`<path d="M-14 -17L14 -17L10 15L-10 15Z" fill="url(#lpaper)" stroke="#a8561c" stroke-width="1.2"/><rect x="-15" y="-20" width="30" height="4" rx="1.5" fill="url(#ggold)"/><ellipse cy="20" rx="2.2" ry="3.4" fill="#fff3b0"/>`}</g></g>${HANG?'':`<text y="${f1(48)}" class="fltx">${esc(nm)}</text>`}</g>`;});
  [].forEach((c,i)=>{const sp=LS[i+NF];if(!sp)return;const h=hsh(c.id),x=sp[0]+(h%30)-15,y=sp[1]+((h>>5)%30)-15,rot=((h>>9)%14)-7;
    if(!first&&!seen.has(c.id))gardenNew[c.id]=Date.now();const nw=Date.now()-(gardenNew[c.id]||0)<2500;
    lt+=`<g class="mlantern${nw?' sprout':''}" data-c="${esc(c.id)}" tabindex="0" role="button" aria-label="A memory of ${esc(byId[c.pid].n)}" transform="translate(${f1(x)} ${f1(y)})"><g class="mss"><g class="mls" style="--rot:${rot}deg;--dl:-${(h%60)/10}s"><circle r="34" fill="url(#lglow)"/>${ART?`<image class="limg" href="photos/art/lantern-memory.webp" x="-16" y="-33" width="32.1" height="76.8"/>`:`
      <path d="M-14 -17L14 -17L10 15L-10 15Z" transform="translate(3 4)" fill="#0b1630" opacity=".35"/><path d="M-14 -17L14 -17L10 15L-10 15Z" fill="url(#lpaper)" stroke="#a8561c" stroke-width="1.2"/><path d="M-5 -17L-4 15M5 -17L4 15" stroke="#d98a3c" stroke-width=".8" opacity=".6"/>
      <rect x="-15" y="-20" width="30" height="4" rx="1.5" fill="url(#ggold)" stroke="#6b4410" stroke-width=".7"/><rect x="-10" y="14" width="20" height="3" rx="1" fill="url(#ggold)" stroke="#6b4410" stroke-width=".6"/><ellipse cy="20" rx="2.2" ry="3.4" fill="#fff3b0"/>`}</g></g></g>`;});
  gardenSeen=new Set(all.map(c=>c.id));
  // the chest: cut-paper wood with gold bands and a star clasp, a few gold stars floating out of it
  const chest=`<g class="kchest" tabindex="0" role="button" aria-label="Open the keepsake chest: old photographs and family records" transform="translate(${CHEST.x} ${f1(CHEST.y)}) rotate(${f1(CHEST.rot)}) scale(${CHEST.s||1.3})">
    ${ART?`<circle cx="3" cy="-34" r="80" fill="url(#kglow)"/>`:''}<circle cx="0" cy="-34" r="20" fill="transparent"/><ellipse cx="${ART?4:0}" cy="${ART?5:7}" rx="${ART?54:60}" ry="9" fill="${ART?'#2a1408':'#0f2a16'}" opacity="${ART?0:.55}"/>
    <g class="kfloat">${(ART?[[-62,-60,3],[66,-48,2.5],[-56,-14,2],[70,-8,2.2]]:[[-30,-74,5],[4,-90,6.5],[34,-70,4.5],[18,-108,3.5]]).map(([sx,sy,sr],i)=>`<path d="${star6(sx,sy,sr)}" fill="url(#ggold)" stroke="#6b4410" stroke-width=".8" class="kst" style="--i:${i}"/>`).join('')}</g>
    ${ART?`<rect x="-52" y="-78" width="106" height="86" fill="transparent"/><image class="kimg" href="photos/art/chest.webp" x="-50" y="-75.6" width="106" height="83.6"/><g class="kdirt"><defs><linearGradient id="kmound" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6c3d21"/><stop offset=".6" stop-color="#5a321c" stop-opacity=".95"/><stop offset="1" stop-color="#4e2b17" stop-opacity="0"/></linearGradient></defs><path d="M-60 -19Q-55 -23 -48 -19Q-42 -15 -35 -15Q-28 -10 -21 -9Q-15 -5 -8 -7Q-1 -9 6 -9Q13 -13 20 -13Q27 -17 34 -16Q41 -21 48 -19Q55 -22 60 -19Q64 -17 65 -12Q67 -3 57 3Q44 9 30 12Q14 15 0 15Q-16 15 -32 11Q-48 6 -57 -2Q-65 -10 -60 -19Z" fill="url(#kmound)"/><path d="M-60 -19Q-55 -23 -48 -19Q-42 -15 -35 -15Q-28 -10 -21 -9Q-15 -5 -8 -7Q-1 -9 6 -9Q13 -13 20 -13Q27 -17 34 -16Q41 -21 48 -19Q55 -22 60 -19Q64 -17 65 -12" fill="none" stroke="#8a5631" stroke-width="1.1" stroke-linecap="round" opacity=".8"/><path d="M-60 -19Q-55 -23 -48 -19Q-42 -15 -35 -15Q-28 -10 -21 -9Q-15 -5 -8 -7Q-1 -9 6 -9Q13 -13 20 -13Q27 -17 34 -16Q41 -21 48 -19Q55 -22 60 -19Q64 -17 65 -12" fill="none" stroke="#2a1409" stroke-width="1" transform="translate(0 -1.6)" opacity=".55"/><ellipse cx="-52" cy="-15" rx="2.2" ry="1.5" fill="#a07048"/><ellipse cx="-51.6" cy="-14.5" rx="1.3" ry="0.8" fill="#3a1e10" opacity=".5"/><ellipse cx="-31" cy="-10" rx="1.6" ry="1.1" fill="#a07048"/><ellipse cx="-30.6" cy="-9.5" rx="1.0" ry="0.6" fill="#3a1e10" opacity=".5"/><ellipse cx="-6" cy="-3" rx="2.4" ry="1.7" fill="#a07048"/><ellipse cx="-5.6" cy="-2.5" rx="1.4" ry="0.8" fill="#3a1e10" opacity=".5"/><ellipse cx="16" cy="-8" rx="1.5" ry="1.0" fill="#a07048"/><ellipse cx="16.4" cy="-7.5" rx="0.9" ry="0.5" fill="#3a1e10" opacity=".5"/><ellipse cx="40" cy="-15" rx="2" ry="1.4" fill="#a07048"/><ellipse cx="40.4" cy="-14.5" rx="1.2" ry="0.7" fill="#3a1e10" opacity=".5"/><ellipse cx="58" cy="-17" rx="1.4" ry="1.0" fill="#a07048"/><ellipse cx="58.4" cy="-16.5" rx="0.8" ry="0.5" fill="#3a1e10" opacity=".5"/><ellipse cx="-44" cy="8" rx="1.3" ry="0.9" fill="#a07048"/><ellipse cx="-43.6" cy="8.5" rx="0.8" ry="0.5" fill="#3a1e10" opacity=".5"/><ellipse cx="8" cy="16" rx="1.6" ry="1.1" fill="#a07048"/><ellipse cx="8.4" cy="16.5" rx="1.0" ry="0.6" fill="#3a1e10" opacity=".5"/><ellipse cx="36" cy="10" rx="1.2" ry="0.8" fill="#a07048"/><ellipse cx="36.4" cy="10.5" rx="0.7" ry="0.4" fill="#3a1e10" opacity=".5"/></g>`:`<g transform="translate(5 6)" class="gshadow"><path d="M-44 -26v26q0 6 6 6h76q6 0 6-6v-26z"/><path d="M-44 -26q0-26 44-26q44 0 44 26z"/></g>
    <path d="M-44 -26v26q0 6 6 6h76q6 0 6-6v-26z" fill="url(#gwood)" stroke="#3e230c" stroke-width="2"/>
    <g class="klid"><path d="M-44 -26q0-26 44-26q44 0 44 26z" fill="url(#gwood)" stroke="#3e230c" stroke-width="2"/><path d="M-30 -42q30-12 60 0" fill="none" stroke="#c8915a" stroke-width="1.4" opacity=".6"/></g>
    <path d="M-44 -26h88" stroke="url(#ggold)" stroke-width="5"/><path d="M-27 -48v48M27 -48v48" stroke="url(#ggold)" stroke-width="5"/>
    <path d="M-27 -48v48M27 -48v48M-44 -26h88" stroke="#6b4410" stroke-width="5" fill="none" opacity=".25" transform="translate(1.2 1.2)"/>
    <path d="${star6(0,-24,10)}" fill="url(#ggold)" stroke="#6b4410" stroke-width="1"/><path d="${star6(-1.5,-25.5,4)}" fill="#fff6d8" opacity=".6"/><circle cx="0" cy="-23" r="2" fill="#3e230c"/>
    <path d="M-40 -1q40 9 80 0" fill="none" stroke="#1f3d24" stroke-width="7" stroke-linecap="round"/>`}</g>`;
  const grad=(id,a,b)=>`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  return `<defs><linearGradient id="ggold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe7a1"/><stop offset=".5" stop-color="#e3b04b"/><stop offset="1" stop-color="#a8721f"/></linearGradient>
    ${grad('gvel','#5b2a8f','#2c0f50')}${grad('gwood','#9a6234','#5e3615')}${Object.entries(FLC).map(([k,[a,b]])=>grad('gf-'+k,a,b)).join('')}<pattern id="bark" patternUnits="userSpaceOnUse" width="46" height="38"><rect width="46" height="38" fill="#80532e"/><path d="M2 6q9-3 18 1M24 14q8-2 17 2M5 25q8-3 16 0M28 31q7-2 14 1" stroke="#5a3519" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".75"/><path d="M10 15q6-2 12 1M30 4q5-1 10 1M14 34q6-2 11 0" stroke="#b07f4b" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/></pattern><radialGradient id="pbrass" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff1c2"/><stop offset=".35" stop-color="#e6b85c"/><stop offset=".8" stop-color="#9b6a22"/><stop offset="1" stop-color="#5e3d10"/></radialGradient><radialGradient id="pglow"><stop offset="0" stop-color="#ffd27e" stop-opacity=".55"/><stop offset="1" stop-color="#ffb04a" stop-opacity="0"/></radialGradient><radialGradient id="hglow"><stop offset="0" stop-color="#ffd27e" stop-opacity=".75"/><stop offset=".35" stop-color="#ffb04a" stop-opacity=".3"/><stop offset="1" stop-color="#ff9a3a" stop-opacity="0"/></radialGradient><radialGradient id="kglow"><stop offset="0" stop-color="#ffd77a" stop-opacity=".55"/><stop offset=".55" stop-color="#e0a440" stop-opacity=".18"/><stop offset="1" stop-color="#e0a440" stop-opacity="0"/></radialGradient><linearGradient id="lpaper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c4"/><stop offset=".6" stop-color="#ffc36e"/><stop offset="1" stop-color="#f08a3c"/></linearGradient><radialGradient id="lglow"><stop offset="0" stop-color="#ffd98a" stop-opacity=".55"/><stop offset="1" stop-color="#ffb860" stop-opacity="0"/></radialGradient></defs><g class="garden">${chest}${false?`<g class="klip" pointer-events="none"><clipPath id="klipc"><rect x="${CHEST.x-230}" y="${GY-60}" width="460" height="205"/></clipPath><g clip-path="url(#klipc)">${[...new Set([Math.floor((CHEST.x-230-915)/GT.w),Math.floor((CHEST.x+230-915)/GT.w)])].map(i=>`<image href="photos/art/ground-tile.webp" x="${(915+i*GT.w).toFixed(1)}" y="${GT.y.toFixed(1)}" width="${(GT.w+1).toFixed(1)}" height="${GT.h.toFixed(1)}" preserveAspectRatio="none"/>`).join('')}</g></g>`:''}${fl}</g><g class="lanterns">${lt}</g>`;}
function gardenNote(el){const r=$('#tstage').getBoundingClientRect(),q=el.getBoundingClientRect(),n=contribs.filter(c=>['story','photo','answer'].includes(c.type)&&byId[c.pid]).length;
  showNote(`<div class="mem"><div class="mq">The memory garden</div><p>Every flower is a memory someone shared about the family${n?` — ${n} so far`:''}. Tap a flower to read it.</p><p>To plant one, tap anyone's photo on the tree and choose <b>Add a memory or story</b>.</p></div>`,q.left-r.left+q.width/2,q.bottom-r.top);}
// stars keep a readable size however far you zoom out
function msScale(){const k=Math.min(2.4,Math.max(1,.62/tv.k));tw.style.setProperty('--msk',k.toFixed(3));}
function openMem(b){const c=contribs.find(x=>x.id===b.dataset.c);if(!c)return;
  const r=$('#tstage').getBoundingClientRect(),q=b.getBoundingClientRect(),p=byId[c.pid];
  showNote(`<div class="mem">${c.type==='photo'&&c.asset?`<img src="${esc(assetUrl(c.asset))}" alt="">`:''}${c.audio?`<button type="button" class="vplay" data-audio="${esc(c.audio)}">▶ Play voice memory</button>`:''}${c.type==='answer'&&ASKQ[c.q]?`<div class="mq">${esc(ASKQ[c.q])}</div>`:''}<p>${esc((c.text||(c.audio?'A voice memory':'A photo')).slice(0,260))}${(c.text||'').length>260?'…':''}</p>
    <div class="mby">From ${esc(whoOf(c))}${c.at?' · '+new Date(c.at).toLocaleDateString():''}</div><button class="pri" data-see="${esc(c.pid)}">See ${esc(p.s.split(' ')[0])} on the tree</button></div>`,q.left-r.left+q.width/2,q.bottom-r.top);
  $('#mnote [data-see]').onclick=ev=>{const id=ev.currentTarget.dataset.see;$('#mnote').hidden=true;select(id);tFocus(id);};}
$('#celest').addEventListener('click',e=>{const b=e.target.closest('.mstar');if(b)openMem(b);});
// preview: painted roots: a soft shadow under each root, a bark-textured body and a highlight along its top
function rootP(b,w0,w1){if(!PREVIEW)return `<path class="root" d="${taperPath(b,w0,w1)}"/>`;w0*=2;w1=Math.max(2.4,w1*1.8);const d=taperPath(b,w0,w1);
  const o=Math.max(1.5,w0*.12),sh=taperPath({...b,x1:b.x1+o,x2:b.x2+o,cx:b.cx+o,y1:b.y1+o*1.4,y2:b.y2+o*1.4,cy:b.cy+o*1.4},w0,w1),h=Math.max(.6,w0*.09);
  const hl=`M${(b.x1-h).toFixed(1)} ${(b.y1-w0*.18).toFixed(1)}Q${(b.cx-h).toFixed(1)} ${(b.cy-(w0+w1)*.12).toFixed(1)} ${(b.x2).toFixed(1)} ${(b.y2-w1*.2).toFixed(1)}`;
  return `<path class="rsh" d="${sh}"/><path class="root rpaint" d="${d}"/><path class="rhl" d="${hl}" stroke-width="${Math.max(.8,w0*.12).toFixed(1)}"/>`;}
function taperPath(b,w0,w1){const n=16,L=[],R=[];
  for(let i=0;i<=n;i++){const t=i/n,u=1-t,x=u*u*b.x1+2*u*t*b.cx+t*t*b.x2,y=u*u*b.y1+2*u*t*b.cy+t*t*b.y2,dx=2*u*(b.cx-b.x1)+2*t*(b.x2-b.cx),dy=2*u*(b.cy-b.y1)+2*t*(b.y2-b.cy),l=Math.hypot(dx,dy)||1,w=(w0+(w1-w0)*Math.pow(t,.8))/2,nx=-dy/l*w,ny=dx/l*w;
    L.push(`${(x+nx).toFixed(1)} ${(y+ny).toFixed(1)}`);R.push(`${(x-nx).toFixed(1)} ${(y-ny).toFixed(1)}`);}
  return 'M'+L.join('L')+'L'+R.reverse().join('L')+'Z';}

const SCROLLS=true;
function painted(vals,dl,rnd,f,BX){
    // aged-paper illustration: one broad painted trunk, a dense dome of hand-painted leaves, roots spreading over the paper
    const bark='#4b3020',barkL='#7a5537';
    const pdefs=`<filter id="ppaint" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="2.2"/></filter>
      <linearGradient id="trunkg" x1="0" x2="1"><stop offset="0" stop-color="#2e1d12"/><stop offset=".35" stop-color="${bark}"/><stop offset=".62" stop-color="${barkL}"/><stop offset="1" stop-color="#2b1a10"/></linearGradient>
      <radialGradient id="pshade"><stop offset="0" stop-color="#3a2414" stop-opacity=".35"/><stop offset="1" stop-color="#3a2414" stop-opacity="0"/></radialGradient>${STAGE?`<pattern id="hatchA" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(32)"><line x1="0" y1="0" x2="0" y2="7" stroke="#1a0d05" stroke-width="1.3"/></pattern>
      <pattern id="hatchB" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)"><line x1="0" y1="0" x2="0" y2="9" stroke="#1a0d05" stroke-width="1.1"/></pattern>
      <linearGradient id="hshade" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".3" stop-color="#fff" stop-opacity=".15"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".85" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
      <mask id="hmask" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#hshade)"/></mask>`:''}`;
    // canopy area: discs around everyone above the trunk fork, and along the upper branches
    const disc=[];vals.filter(v=>v.y<1060).forEach(v=>disc.push([v.x,v.y,v.r+95]));
    TBR.filter(b=>Math.max(b.y1,b.y2)<1080).forEach(b=>{for(let t=.2;t<=1;t+=.2){const [x,y]=qpt(b,t);disc.push([x,y,b.w>=20?120:95]);}});
    const inC=(x,y)=>disc.some(([cx,cy,r])=>(x-cx)*(x-cx)+(y-cy)*(y-cy)<r*r);
    const LF='M0 0Q11 -9 26 0Q11 9 0 0Z',G=['#244f2e','#2f6a3a','#3e7d46','#55914f','#77a960','#2d6e5a','#4a8a6b'];
    let back='',front='';const xs0=TB.x0-40,xs1=TB.x1+40,ys0=TB.y0-60;
    const leafAt=(x,y,a,sc)=>{const c=G[Math.floor(rnd()*G.length)],lit=rnd()<.35,ink=STAGE?' stroke="#16301c" stroke-width=".8" stroke-opacity=".75"':'';
      return `<g transform="translate(${f(x)} ${f(y)}) rotate(${a.toFixed(0)}) scale(${sc.toFixed(2)})"><path d="${LF}" fill="${c}"${ink}/>${lit?`<path d="M2 0Q11 -7 24 0Z" fill="#a9c98a" opacity=".35"/>`:''}<path d="M1 0L22 0" stroke="#1d3a22" stroke-width=".6" opacity=".55"/></g>`;};
    // every leaf grows from a twig, and every twig grows from a branch (or from behind a photo at a branch tip)
    const D=Math.PI/180,tw=[];
    const sprout=(x,y,ang,len,w,depth)=>{const a=ang*D,x2=x+Math.cos(a)*len,y2=y+Math.sin(a)*len;if(!inC(x2,y2)||y2>1090)return;
      const bend=(rnd()-.5)*.5,t={x1:x,y1:y,cx:(x+x2)/2+Math.cos(a+Math.PI/2)*len*bend,cy:(y+y2)/2+Math.sin(a+Math.PI/2)*len*bend,x2,y2,w,ang,len};tw.push(t);
      if(depth>0){const n=1+(rnd()<.6?1:0);for(let k=0;k<n;k++){const [qx,qy]=qpt(t,.35+rnd()*.4);sprout(qx,qy,ang+(k%2?1:-1)*(28+rnd()*30),len*(.5+rnd()*.25),Math.max(.9,w*.6),depth-1);}}};
    TBR.forEach(b=>{if(Math.max(b.y1,b.y2)>1080||b.w<2)return;const L=Math.hypot(b.x2-b.x1,b.y2-b.y1),ba=Math.atan2(b.y2-b.y1,b.x2-b.x1)/D;let side=rnd()<.5?1:-1;
      for(let s=20+rnd()*16;s<L-6;s+=36+rnd()*22){const [x,y]=qpt(b,s/L);side=-side;sprout(x,y,ba+side*(35+rnd()*40),55+rnd()*65,Math.min(3.2,b.w*.3+.9),1);}});
    vals.filter(v=>v.y<1060).forEach(v=>{const n=4+Math.round(v.r/16);for(let k=0;k<n;k++){const a=k*360/n+rnd()*30;sprout(v.x+Math.cos(a*D)*v.r*.5,v.y+Math.sin(a*D)*v.r*.5,a,v.r*.5+45+rnd()*55,1.8,1);}});
    let twg='',lvs='';
    tw.forEach(t=>{twg+=`<path d="M${f(t.x1)} ${f(t.y1)}Q${f(t.cx)} ${f(t.cy)} ${f(t.x2)} ${f(t.y2)}" fill="none" stroke="#53361f" stroke-width="${t.w.toFixed(1)}" stroke-linecap="round"/>`;
      let side=1;for(let d=7+rnd()*6;d<t.len;d+=12+rnd()*7){const [x,y]=qpt(t,d/t.len);side=-side;if(rnd()<.2)continue;lvs+=leafAt(x,y,t.ang+side*(30+rnd()*35),.85+rnd()*.7);}
      lvs+=leafAt(t.x2,t.y2,t.ang+(rnd()-.5)*30,1+rnd()*.5);});
    TBR.forEach(b=>{if(Math.max(b.y1,b.y2)>1080||b.w>=14)return;const L=Math.hypot(b.x2-b.x1,b.y2-b.y1),ba=Math.atan2(b.y2-b.y1,b.x2-b.x1)/D;let side=1;
      for(let d=12;d<L;d+=20+rnd()*12){const [x,y]=qpt(b,d/L);side=-side;lvs+=leafAt(x,y,ba+side*(40+rnd()*35),.85+rnd()*.6);}});
    back=twg+lvs;
    // a few leaves overlap the branches in front, so the limbs sit inside the foliage
    let lv='';TBR.forEach(b=>{if(b.w<3||Math.max(b.y1,b.y2)>1080)return;const n=b.w>=20?7:b.w>=8?4:2;for(let i=0;i<n;i++){const t=.15+rnd()*.8,[x,y]=qpt(b,t),a=Math.atan2(b.y2-b.y1,b.x2-b.x1)*180/Math.PI+(rnd()<.5?60:-60)+(rnd()-.5)*40,sc=.9+rnd()*.7;
      lv+=`<g class="deco" style="--d:${dl(y,x)+150}ms" transform="translate(${f(x)} ${f(y)}) rotate(${a.toFixed(0)}) scale(${sc.toFixed(2)}) translate(4 0)"><path d="${LF}" fill="${G[Math.floor(rnd()*G.length)]}"/><path d="M1 0L22 0" stroke="#1d3a22" stroke-width=".6" opacity=".55"/></g>`;}});
    // the trunk: wide and flared at the base, narrowing up to Ed and Renee
    const T0=905,T1=1272;const trunk=`M${BX-34} ${T0} C${BX-40} ${T0+120} ${BX-62} ${T1-150} ${BX-78} ${T1-40} C${BX-96} ${T1} ${BX-150} ${T1+18} ${BX-190} ${T1+30} L${BX+190} ${T1+30} C${BX+150} ${T1+18} ${BX+96} ${T1} ${BX+78} ${T1-40} C${BX+62} ${T1-150} ${BX+40} ${T0+120} ${BX+34} ${T0} Z`;
    let bk='';for(let i=0;i<9;i++){const ox=-52+i*13+(rnd()-.5)*6;bk+=`<path d="M${f(BX+ox*.55)} ${T0+20} C${f(BX+ox*.8)} ${T0+140} ${f(BX+ox)} ${T1-120} ${f(BX+ox*1.5)} ${T1+10}" fill="none" stroke="${i%3?'#2a1a10':'#9a7350'}" stroke-width="${i%3?1.4:1}" opacity=".55"/>`;}
    bk+=`<ellipse cx="${BX+14}" cy="${T0+190}" rx="9" ry="14" fill="#24160c" opacity=".7"/>`;
    const brs=TBR.map(b=>{const w1=b.w>=20?b.w*.62:Math.max(1.6,b.w*.45);return `<path class="br t" d="${taperPath(b,b.w*1.15,w1)}"/>`;}).join('');
    return {pdefs,back,lv,trunk:`<path d="${trunk}" fill="${PRINT?'#4b3020':'url(#trunkg)'}"/>${bk}${STAGE&&!PRINT?`<g mask="url(#hmask)" opacity=".55"><path d="${trunk}" fill="url(#hatchA)"/><path d="${trunk}" fill="url(#hatchB)" opacity=".6"/></g><path d="${trunk}" fill="none" stroke="#1a0d05" stroke-width="2.4"/>`:''}`,brs,T1};}
const LEAFP='M0 0Q9 -8 20 0Q9 8 0 0Z';
function treeArt(st,dl){
  let seed=11;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647,f=n=>n.toFixed(1);
  const defs=`<filter id="wc" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="4"/><feDisplacementMap in="SourceGraphic" scale="18"/><feGaussianBlur stdDeviation="2.2"/></filter>
   <filter id="wcb"><feTurbulence type="fractalNoise" baseFrequency=".08" numOctaves="2" seed="2"/><feDisplacementMap in="SourceGraphic" scale="4"/></filter>
   <filter id="pshadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#1b2a1e" flood-opacity=".28"/></filter>
   <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 .23  0 0 0 0 .16  0 0 0 0 .1  0 0 0 .07 0"/></filter>`;
  const vals=Object.values(TP),top=vals.filter(v=>['ggp','gp','aunt','asp','kid','ksp'].includes(v.t));
  const BX=915,base=1262;
  const PT=painted(vals,dl,rnd,f,BX);
  // branches: tapered
  const brs=TBR.map(b=>{const w1=b.w>=20?b.w*.62:Math.max(1.4,b.w*.38);return `<path class="br t" d="${taperPath(b,b.w*(st==='ink'?.9:1.05),w1)}"/>`;}).join('');
  // roots
  let roots='';[-1,1].forEach(sg=>[[150,1342,13],[250,1372,9],[78,1376,7]].forEach(([dx,y,w])=>{const b={x1:BX+sg*8,y1:base,cx:BX+sg*dx*.35,cy:y-10,x2:BX+sg*dx,y2:y};roots+=`<path class="root" d="${taperPath(b,w*2,1)}"/>`;}));
  const gb=Math.max(1410,TB.y1+30)+200,X0=TB.x0-400,X1=TB.x1+400;
  let under='',over='',ground='',extra='';
  if(st==='ink'){
    const K=NIGHT?{grain:'#e7d3a8',grainO:.35,tint:'#c9a46a',tintO:.22,lf:'#8fae7a',lfO:.5,ink:'#d9c49a',hill:'#1e3a2b',hillO:.95,hill2:'#29503a',line:'#cdb88c',wash:['#3f7a5c','#4f8a63','#356b55'],washO:.34}
      :{grain:'#f3e9d2',grainO:.55,tint:'#b08b5c',tintO:.35,lf:'#a8b47e',lfO:.55,ink:'#3b2a1a',hill:'#b7c98f',hillO:.42,hill2:null,line:'#3b2a1a',wash:PRINT?['#a9c79a','#c3d8a8','#98bd94']:['#8fbf86','#a9cf95','#7cb07c'],washO:PRINT?.24:.3};
    const PL=NIGHT?{a:'#2e5a3f',b:'#20412f',c:'#0d1f17',dot:'#5f8f61',atmo:'#9cc0ff'}:{a:'#a9d38c',b:'#86bb6e',c:'#4f8a4f',dot:'#d9ecb8',atmo:'#ffffff'};
    // bark grain: thin lines along thick branches
    let grain='';TBR.filter(b=>b.w>=8).forEach(b=>{[-.22,.18].forEach(o=>{const n=12;let d='';for(let i=2;i<=n-2;i++){const t=i/n,u=1-t,x=u*u*b.x1+2*u*t*b.cx+t*t*b.x2,y=u*u*b.y1+2*u*t*b.cy+t*t*b.y2,dx=2*u*(b.cx-b.x1)+2*t*(b.x2-b.cx),dy=2*u*(b.cy-b.y1)+2*t*(b.y2-b.cy),l=Math.hypot(dx,dy)||1,w=b.w*(1-.5*t)*o;d+=(i===2?'M':'L')+f(x-dy/l*w)+' '+f(y+dx/l*w);}grain+=`<path d="${d}" fill="none" stroke="${K.grain}" stroke-width="${b.w>=20?1.6:.9}" opacity="${K.grainO}"/>`;});});
    // watercolor tint under the ink, slightly offset
    const tint=TBR.map(b=>`<path d="${taperPath({...b,x1:b.x1+3,x2:b.x2+3,cx:b.cx+3,y1:b.y1+2,y2:b.y2+2,cy:b.cy+2},b.w*1.15,Math.max(2,b.w*.5))}" fill="${K.tint}" opacity="${K.tintO}"/>`).join('');
    let lv='';TBR.forEach(b=>{if(b.w<3||b.w>=12||Math.min(b.y1,b.y2)>=880)return;const n=b.w>=20?5:b.w>=8?3:2;for(let i=0;i<n;i++){const t=.25+rnd()*.7,[x,y]=qpt(b,t),ang=Math.atan2(b.y2-b.y1,b.x2-b.x1)*180/Math.PI+(rnd()<.5?55:-55),s=.75+rnd()*.5;
      lv+=`<g class="deco" style="--d:${dl(y,x)+150}ms" transform="translate(${f(x)} ${f(y)}) rotate(${ang.toFixed(0)}) scale(${s.toFixed(2)}) translate(6 0)"><path d="${LEAFP}" fill="${K.lf}" fill-opacity="${K.lfO}" stroke="${K.ink}" stroke-width="1"/><path d="M1 0L17 0" stroke="${K.ink}" stroke-width=".7"/></g>`;}});
    let tufts='';for(let x=X0+30;x<X1;x+=46+rnd()*40){const y=1384-Math.max(0,170*(1-Math.pow((x-915)/((X1-X0)/2),2)))*.55+rnd()*6;if(rnd()<.5)continue;tufts+=`<path d="M${f(x)} ${f(y)}l-5 -12M${f(x+4)} ${f(y)}l1 -15M${f(x+8)} ${f(y)}l6 -11" stroke="${K.line}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;}
    ground=`<g class="art"><path d="M${X0} 1384 Q915 1205 ${X1} 1384 L${X1} ${gb} L${X0} ${gb}Z" fill="${K.hill}" opacity="${K.hillO}" filter="url(#wc)"/>${K.hill2?`<path d="M${X0} 1430 Q${X0+500} 1330 915 1420 T${X1} 1415 L${X1} ${gb} L${X0} ${gb}Z" fill="${K.hill2}" opacity=".7" filter="url(#wc)"/>`:''}<path d="M${X0} 1384 Q915 1205 ${X1} 1384" fill="none" stroke="${K.line}" stroke-width="1.6"/>${tufts}</g>`;
    let wash='';const wg=K.wash;
    top.forEach(v=>{for(let k=0;k<2;k++){const a=rnd()*6.28,d=rnd()*26;wash+=`<circle cx="${f(v.x+Math.cos(a)*d)}" cy="${f(v.y+Math.sin(a)*d-6)}" r="${f(v.r+30+rnd()*30)}" fill="${wg[Math.floor(rnd()*3)]}" opacity="${K.washO}"/>`;}});
    TBR.filter(b=>b.w>=8&&b.w<20).forEach(b=>{[.4,.7].forEach(t=>{const [x,y]=qpt(b,t);wash+=`<circle cx="${f(x)}" cy="${f(y)}" r="${f(30+rnd()*22)}" fill="${wg[Math.floor(rnd()*3)]}" opacity="${K.washO*.85}"/>`;});});
    let planet='',ROOTS='';
    if(!PRINT){const R=2200,cx=915,cy=1272+R;let tf='';
      for(let a=-.62;a<=.62;a+=.009+rnd()*.012){if(rnd()<.45)continue;const x=cx+R*Math.sin(a),y=cy-R*Math.cos(a),d=a*180/Math.PI;
        tf+=`<path transform="translate(${f(x)} ${f(y)}) rotate(${d.toFixed(1)})" d="M-4 1l-5 -12M0 1l1 -15M4 1l6 -11"/>`;}
      let dots='';for(let i=0;i<60;i++){const a=(rnd()-.5)*1.2,dd=40+rnd()*420,x=cx+(R-dd)*Math.sin(a),y=cy-(R-dd)*Math.cos(a);dots+=`<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.5+rnd()*2.5)}"/>`;}
      // tree rings: newest just under the surface, oldest deepest
      const BXc=915,BYc=1272,RINGS=[[2026,150],[1987,240],[1982,320],[1956,420],[1940,520],[1932,610],[1930,690],[1911,800]];
      let rings='';RINGS.forEach(([yr,rr],i)=>{const a=(i%2?1:-1)*(12+i*2.2)*Math.PI/180,lx=BXc+Math.sin(a)*rr,ly=BYc+Math.cos(a)*rr;
        rings+=`<circle cx="${BXc}" cy="${BYc}" r="${rr}" fill="none" stroke="${K.line}" stroke-width="1.3" stroke-dasharray="${i%3?'2 7':'10 6'}" opacity=".16"/><text x="${f(lx)}" y="${f(ly+5)}" class="ringyr" transform="rotate(${f(-a*180/Math.PI)} ${f(lx)} ${f(ly)})">${yr}</text>`;});
      rings=`<g clip-path="url(#pclip)">${rings}</g>`;
      let soil='';if(STAGE){SOILD=soilDepthFor(memCount());const sy=x=>surfY(Math.max(cx-R*.98,Math.min(cx+R*.98,x)))+SOILD+Math.sin(x/37)*7+Math.sin(x/113)*10;
        let d=`M${cx-R-60} ${cy+R}`;for(let x=cx-R-60;x<=cx+R+60;x+=40)d+=`L${f(x)} ${f(sy(x))}`;d+=`L${cx+R+60} ${cy+R}Z`;
        let peb='';for(let i=0;i<110;i++){const x=-500+(hsh('p'+i)%2900),y=sy(x)+40+(hsh('q'+i)%560);peb+=`<ellipse cx="${x}" cy="${y}" rx="${4+hsh('r'+i)%7}" ry="${3+hsh('t'+i)%4}"/>`;}
        soil=`<g clip-path="url(#pclip)"><defs><linearGradient id="soilg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b3b20"/><stop offset=".5" stop-color="#3d2614"/><stop offset="1" stop-color="#24150a"/></linearGradient></defs>`+
          `<path d="${d}" fill="url(#soilg)"/><g fill="#7a5532" opacity=".5">${peb}</g><path d="${d}" fill="none" stroke="#0f2614" stroke-width="3" transform="translate(0 7)" opacity=".8"/><path d="${d}" fill="none" stroke="#2c5a2f" stroke-width="10"/></g>`;}
      planet=`<g class="art planet"><circle cx="${cx}" cy="${cy}" r="${R+34}" fill="url(#atmo)"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#pfill)"/>${soil}${rings}<g fill="${PL.dot}" opacity=".35">${dots}</g>${STAGE?`<g clip-path="url(#pclip)" opacity=".22"><circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#phatch)" mask="url(#prim)"/></g>`:''}<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${STAGE?'#0c1a10':K.line}" stroke-width="${STAGE?3:1.6}" opacity=".8"/><g stroke="${K.line}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".8">${tf}</g></g>`;
      ground='';
      // roots that lead to the places the family came from
      // below the grandchildren (their name scrolls end near y 1590), so the roots fan out under the whole family
      const G=STAGE&&!ART?SOILD-SOIL0:FLAT?GY+640-1725:DROP,PINS=(ART?ROOTPINS.map(([k,x,y,yr])=>[k,...(ARTPINS[k]||[x,y]),yr]):ROOTPINS).map(([k,x,y,yr])=>[k,x,y+G,yr]);
      const HUB=FLAT?1650:ART?1630:1600,RY=FLAT?GY+140:1272+DROP+300,RB={x1:915,y1:ART?RY:1290,cx:915,cy:ART?(RY+HUB+G)/2:1420+G/2,x2:915,y2:HUB+G};let rts=`${rootP(RB,30,16)}`,pins='';
      PINS.forEach(([k,px,py,yr],i)=>{const sx=915+(px<915?-6:px>915?6:0),sy=HUB-8+G;let b={x1:sx,y1:sy,cx:sx+(px-sx)*.25,cy:py-40,x2:px,y2:py-10};
        // preview: side roots head out sideways first so they pass beside the chest; the root to Covington (straight below the chest) bends around its right side
        if(ART&&Math.abs(px-915)>40)b={x1:sx,y1:sy,cx:px,cy:sy+(py-10-sy)*.15,x2:px,y2:py-10};
        if(ART&&!FLAT&&Math.abs(px-915)<=40){const m={x1:sx,y1:sy,cx:1120,cy:sy+20,x2:1118,y2:(sy+py)/2},n={x1:1118,y1:(sy+py)/2,cx:1118,cy:py-10,x2:px,y2:py-10};rts+=`${rootP(m,13,7)}${rootP(n,7,2.2)}`;b=n;}
        else rts+=`${rootP(b,13,2.2)}`;
        for(let j=0;j<3;j++){const t=.35+j*.2,[qx,qy]=qpt(b,t),dir=(j%2?1:-1)*(px<915?1:-1),c={x1:qx,y1:qy,cx:qx+dir*24,cy:qy+22,x2:qx+dir*(30+rnd()*30),y2:qy+50+rnd()*30};rts+=`<path class="root" d="${taperPath(c,4,.6)}" opacity=".8"/>`;}
        const nm=(PL_NAMES[k]||k).replace(' (Meriwether Co.)','');
        pins+=`<g class="rootpin" data-p="${k}" tabindex="0" role="button" aria-label="${esc(nm)} — show on the map" style="--d:${0}ms"><circle cx="${px}" cy="${py}" r="22" fill="transparent"/>${PREVIEW?`<circle class="pglow" cx="${px}" cy="${py}" r="20"/><circle class="pbr" cx="${px}" cy="${py}" r="10.5"/><circle class="pbh" cx="${px-3.2}" cy="${py-3.4}" r="3"/>`:`<circle class="pg" cx="${px}" cy="${py}" r="11"/><circle class="pd" cx="${px}" cy="${py}" r="5.5"/>`}<text x="${px}" y="${py+36}" class="pl">${esc(nm)}</text>${yr?`<text x="${px}" y="${py+56}" class="py">${yr}</text>`:''}</g>`;});
      ROOTS=`<g class="art roots">${rts}</g>${pins}`;}
    under=(!PRINT?'':`<rect class="art" x="${X0-400}" y="${TB.y0-300}" width="${X1-X0+800}" height="${gb-TB.y0+600}" filter="url(#grain)"/>`)+`<g class="art" filter="url(#wc)">${wash}</g>`;
    const pdefs=!PRINT?`<radialGradient id="pfill" gradientUnits="userSpaceOnUse" cx="915" cy="1272" r="1500"><stop offset="0" stop-color="${PL.a}"/><stop offset=".35" stop-color="${PL.b}"/><stop offset="1" stop-color="${PL.c}"/></radialGradient>
     <clipPath id="pclip"><circle cx="915" cy="${1272+2200}" r="2200"/></clipPath><radialGradient id="atmo"><stop offset=".975" stop-color="${PL.atmo}" stop-opacity="0"/><stop offset=".99" stop-color="${PL.atmo}" stop-opacity="${NIGHT?.28:.45}"/><stop offset="1" stop-color="${PL.atmo}" stop-opacity="0"/></radialGradient>${STAGE?`<pattern id="phatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)"><line x1="0" y1="0" x2="0" y2="8" stroke="#06100a" stroke-width="1.4"/></pattern>
      <radialGradient id="primg" gradientUnits="userSpaceOnUse" cx="915" cy="${1272+2200}" r="2200"><stop offset=".86" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></radialGradient>
      <mask id="prim" maskUnits="userSpaceOnUse" x="-3000" y="0" width="8000" height="8000"><rect x="-3000" y="0" width="8000" height="8000" fill="url(#primg)"/></mask>`:''}`:'';
    if(ART&&!PRINT){
      // the painted tree: its leaves cover the canopy people (with a margin) and its trunk stands where the drawn trunk did (x 915)
      const cv=vals.filter(v=>v.y<1250),cx0=Math.min(...cv.map(v=>v.x-v.r)),cx1=Math.max(...cv.map(v=>v.x+v.r)),cy0=Math.min(...cv.map(v=>v.y-v.r)),cy1=Math.max(...cv.map(v=>v.y+v.r+30));
      const TX=1268,L0=92,L1=2479,T0=16,T1=1058,sx=Math.max((915-(cx0-110))/(TX-L0),((cx1+110)-915)/(L1-TX)),sy=Math.max(sx*1.02,((cy1+60)-(cy0-140))/(T1-T0));
      TREEMAP={x0:915-TX*sx,y0:cy0-140-T0*sy,sx,sy};
      const treeImg=`<image class="arttree" href="photos/art/tree.webp" x="${f(915-TX*sx)}" y="${f(cy0-140-T0*sy)}" width="${f(2576*sx)}" height="${f(1438*sy)}" preserveAspectRatio="none"/>`;
      // the painted hill (Gemini's wide planet, 2576x1093: its circle is centre 1286.7,1308, radius 1314.6), with the rest of the planet drawn as a dark soil circle with a gold rim below its flat bottom edge, so zooming out shows a round planet
      const hs=HILL.R/1314.6,hx=HILL.cx-1286.7*hs,hy=HILL.cy-1308*hs;
      const hill=`<g class="art planet"><defs><linearGradient id="hillbot" gradientUnits="userSpaceOnUse" x1="0" y1="${f(hy+1080*hs)}" x2="0" y2="${f(HILL.cy+HILL.R)}"><stop offset="0" stop-color="#30170f"/><stop offset="1" stop-color="#1c0c06"/></linearGradient></defs><circle cx="${HILL.cx}" cy="${HILL.cy}" r="${f(HILL.R-15*hs)}" fill="url(#hillbot)" stroke="#9a6a2a" stroke-width="${f(28*hs)}"/><circle cx="${HILL.cx}" cy="${HILL.cy}" r="${f(HILL.R-103*hs)}" fill="none" stroke="#1d3012" stroke-width="${f(140*hs)}"/><circle cx="${HILL.cx}" cy="${HILL.cy}" r="${f(HILL.R-174*hs)}" fill="none" stroke="#120a05" stroke-width="${f(4*hs)}" opacity=".6"/><image href="photos/art/planet.webp" x="${f(hx)}" y="${f(hy)}" width="${f(2576*hs)}" height="${f(1093*hs)}" preserveAspectRatio="none"/>
        <defs><clipPath id="hillin"><circle cx="${HILL.cx}" cy="${HILL.cy}" r="${f(HILL.R-176*hs)}"/></clipPath><linearGradient id="hillfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#30170f" stop-opacity="0"/><stop offset="1" stop-color="#30170f"/></linearGradient></defs>
        <rect clip-path="url(#hillin)" x="${f(HILL.cx-HILL.R)}" y="${f(hy+(1093-260)*hs)}" width="${f(2*HILL.R)}" height="${f(262*hs)}" fill="url(#hillfade)"/></g>`;
      // family lines: thin bark-coloured lines from each person to their parents (tap someone to light up their family)
      let kin='';Object.keys(TP).forEach(id=>{const p=byId[id],ps=(p&&p.par||[]).filter(q=>TP[q]);if(!ps.length)return;const a=TP[id],mx=ps.reduce((s,q)=>s+TP[q].x,0)/ps.length,my=ps.reduce((s,q)=>s+TP[q].y,0)/ps.length;
        kin+=`<path class="kline" data-k=" ${id} ${ps.join(' ')} " d="M${f(mx)} ${f(my)}Q${f(mx)} ${f((my+a.y)/2)} ${f(a.x)} ${f(a.y)}"/>`;});
      const ground=FLAT?`<g class="art planet"><defs><linearGradient id="gfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e1a13" stop-opacity="0"/><stop offset="1" stop-color="#2e1a13"/></linearGradient></defs><rect x="-60000" y="${f(GT.y+GT.h-4)}" width="120000" height="80000" fill="#2e1a13"/>${Array.from({length:14},(_,i)=>`<image href="photos/art/ground-tile.webp" x="${f(915+(i-7)*GT.w)}" y="${f(GT.y)}" width="${f(GT.w+1)}" height="${f(GT.h)}" preserveAspectRatio="none"/>`).join('')}<rect x="-60000" y="${f(GT.y+GT.h-260)}" width="120000" height="257" fill="url(#gfade)"/></g>`:'';
      return {defs:defs+pdefs,planet:FLAT?ground:hill,treeImg,rootsUnder:ROOTS,under:'',ground:'',bg:null,roots:'',brs:`<g class="art">${kin}</g>`,over:''};}
    if(PT){const pu=(PRINT?under.replace(/<g class="art" filter="url\(#wc\)">[\s\S]*$/,''):'')+`<g filter="url(#ppaint)">${PT.back}</g>`;
      return {defs:defs+pdefs+PT.pdefs,planet,rootsUnder:ROOTS+`<g class="art">${PT.trunk}</g>`,under:pu,ground,bg:PRINT?['#f7efdd','#ecdfc2']:null,roots:'',brs:PT.brs,over:PT.lv};}
    return {defs:defs+pdefs,planet,rootsUnder:ROOTS,under,ground,bg:PRINT?['#f7efdd','#ecdfc2']:null,roots:`<g class="art">${roots}</g>`,brs:`<g class="art">${tint}</g>${brs}<g class="art">${grain}</g>`,over:lv};}

}
// painted textures are expensive to redraw while zooming: paint them once into a picture
const bakeCache={},bakePend={};let curBake=null;
let lastBake=Promise.resolve();
function bakeArt(art,html){
  const x0=TB.x0-500,y0=TB.y0-320,w=TB.x1-TB.x0+1000,h=Math.max(1410,TB.y1+30)+520-y0,sc=Math.min(.8,(innerWidth<700||TOUCH?2200:3400)/w),W=Math.round(w*sc),H=Math.round(h*sc);
  const bg=art.bg;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${y0} ${w} ${h}" width="${W}" height="${H}"><defs>${art.defs}${bg?`<radialGradient id="bgg" cx="50%" cy="42%" r="62%"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></radialGradient>`:''}</defs>${bg?`<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="url(#bgg)"/>`:''}${art.under}${art.ground}</svg>`;
  const put=u=>{if(!u)return;if(html){if(curBake!==svg)return;const im=$('#tbackimg');im.src=u;Object.assign(im.style,{left:x0+'px',top:y0+'px',width:w+'px',height:h+'px'});im.classList.add('on');return;}
    const cur=tw.querySelector('.bake');if(cur)cur.outerHTML=`<image class="art bake-img" href="${u}" x="${x0}" y="${y0}" width="${w}" height="${h}" preserveAspectRatio="none"/>`;};
  // same picture already showing: leave it alone (no fade, no restarted sway)
  if(html&&curBake===svg&&$('#tbackimg').classList.contains('on'))return lastBake=Promise.resolve();
  if(html){curBake=svg;$('#tbackimg').classList.remove('on');}
  if(bakeCache[svg]){put(bakeCache[svg]);return lastBake=Promise.resolve();}
  if(bakePend[svg])return lastBake=bakePend[svg].then(()=>{if(!html||curBake===svg)put(bakeCache[svg]);});
  return lastBake=bakePend[svg]=new Promise(res=>{const img=new Image();img.onload=()=>{try{const c=document.createElement('canvas');c.width=W;c.height=H;c.getContext('2d').drawImage(img,0,0,W,H);
      if(bg){const u=c.toDataURL('image/jpeg',.86);bakeCache[svg]=u;put(u);res();}else c.toBlob(b=>{if(b){const u=URL.createObjectURL(b);bakeCache[svg]=u;put(u);}res();},'image/png');}catch(e){res();}};
    img.onerror=()=>res();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);});}
// preview: the selected person's parents, spouse and children glow, and the family lines between them light up
let kinOn=false;// only after someone taps a person (Mat is selected when the page opens, but nothing should be lit then)
function markKin(){if(!ART)return;const p=kinOn&&byId[sel],K=new Set();if(p){(p.par||[]).forEach(q=>K.add(q));if(p.sp)K.add(p.sp);P.forEach(q=>{if((q.par||[]).includes(sel))K.add(q.id);});}
  tw.querySelectorAll('.leaf').forEach(c=>c.classList.toggle('kin',K.has(c.dataset.id)));
  tw.querySelectorAll('.kline').forEach(l=>l.classList.toggle('lit',!!p&&l.dataset.k.includes(' '+sel+' ')));}
/* ---------- growing the tree from the ground up ---------- */
const GROWT=2600;let GROWR=1400,growR=99999;
const growEase=u=>1-(1-u)*(1-u);                      // fast at first, gentle at the tips
function growDelay(x,y){const f=Math.min(1,Math.hypot(x-915,y-1300)/GROWR);return Math.round(GROWT*(1-Math.sqrt(1-f)));}
function roughEdge(x0,x1,y,arch,seed,amp,inw){const n=Math.max(4,Math.round(Math.abs(x1-x0)/7)),pts=[];let h=seed;
  for(let i=0;i<=n;i++){h=Math.imul(h^(h>>>13),1597334677)>>>0;const t=i/n,x=x0+(x1-x0)*t,j=((h%1000)/1000-.5)*2*amp,nick=(h%97)<6?amp*1.8:0;
    pts.push([x,y-arch*4*t*(1-t)+j+nick*inw]);}return pts;}
function wornScroll(L,R,y0,y1,seed,arch,cls){const f=n=>n.toFixed(1),ym=(y0+y1)/2,h=y1-y0,a=Math.max(.6,h*.045);
  const top=roughEdge(L,R,y0,arch,seed,a,1),bot=roughEdge(R,L,y1,arch,seed^0x9e37,a,-1);
  const rs=[[R+a*.6,y0+h*.3],[R-a*.4,ym+h*.05],[R+a*.5,y1-h*.28]],ls=[[L-a*.5,y1-h*.3],[L+a*.4,ym-h*.04],[L-a*.6,y0+h*.28]];
  const d='M'+top.map(p=>f(p[0])+' '+f(p[1])).join('L')+'L'+rs.map(p=>f(p[0])+' '+f(p[1])).join('L')+'L'+bot.map(p=>f(p[0])+' '+f(p[1])).join('L')+'L'+ls.map(p=>f(p[0])+' '+f(p[1])).join('L')+'Z';
  const tl=Math.min(22,h*.72),dp=h*.24;
  const tail=sg=>{const e=sg<0?L:R;return `<path class="stail" d="M${f(e-sg*12)} ${f(y0+dp)}L${f(e+sg*tl)} ${f(y0+dp-1)}L${f(e+sg*(tl-h*.3))} ${f(ym+dp)}L${f(e+sg*(tl+1))} ${f(y1+dp+1)}L${f(e-sg*12)} ${f(y1+dp)}Z"/>`+
    `<path class="sfold" d="M${f(e)} ${f(y1-1)}L${f(e+sg*Math.min(10,tl*.45))} ${f(y1+dp)}L${f(e)} ${f(y1+dp)}Z"/>`;};
  let st='';let hh=seed;for(let i=0;i<2;i++){hh=Math.imul(hh^(hh>>>15),2246822519)>>>0;if(hh%3===0)continue;const sx=L+(R-L)*(.15+(hh%700)/1000),sy=y0+h*(.3+((hh>>>10)%40)/100);st+=`<ellipse class="sstain" cx="${f(sx)}" cy="${f(sy)}" rx="${f(h*.55)}" ry="${f(h*.22)}"/>`;}
  return `<g class="${cls}">${tail(-1)}${tail(1)}<path class="sshadow" d="${d}" transform="translate(0 ${f(Math.max(1.5,h*.05))})"/><path class="sbody" d="${d}"/>${st}<path class="sburn" d="${d}"/>`;}
// preview: Gemini's parchment ribbon (1234x232) in three slices: the folded ends keep their shape, the straight middle stretches to the name.
// Its front band runs x 143.5-1090.5, y 56.5-230.5; the middle slice is x 300-925.
function ribGeo(nm,fs){const s=fs*2.333/232,m=Math.max(4,nm.length*fs*.47+fs*.9-322*s);return {s,m,w:609*s+m};}
function ribbonLabel(nm,r,fs,dx=0){const f=n=>n.toFixed(1),{s,m,w}=ribGeo(nm,fs),x0=-w/2,y0=r+4-56.5*s,H=232*s,
    sl=(x,wd,sx,sw)=>`<svg x="${f(x)}" y="${f(y0)}" width="${f(wd)}" height="${f(H)}" viewBox="${sx} 0 ${sw} 232" preserveAspectRatio="none" overflow="hidden"><image href="photos/art/ribbon.webp" width="1234" height="232"/></svg>`;
  return `${dx?`<g transform="translate(${dx.toFixed(1)} 0)">`:''}<g class="scroll rib">${sl(x0,300*s+.6,0,300)}${sl(x0+300*s,m+.6,300,625)}${sl(x0+300*s+m,309*s,925,309)}<text class="lname" y="${f(y0+143.5*s+fs*.34)}" font-size="${fs}">${esc(nm)}</text></g>${dx?'</g>':''}`;}
function scrollLabel(nm,r,fs,dx=0){if(ART&&!PRINT)return ribbonLabel(nm,r,fs,dx);const w=Math.max(50,nm.length*fs*.46+24),h=fs*1.6,y0=r+6,y1=y0+h,ym=(y0+y1)/2,L=-w/2,R=w/2,f=n=>n.toFixed(1);
  return `${dx?`<g transform="translate(${dx.toFixed(1)} 0)">`:''}${wornScroll(L,R,y0,y1,hsh(nm)||7,5,'scroll')}<text class="lname" y="${f(ym+fs*.34)}" font-size="${fs}">${esc(nm)}</text></g>${dx?'</g>':''}`;}
const SCROLLDEFS=`<linearGradient id="scrollG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4e6c4"/><stop offset=".55" stop-color="#ead7ab"/><stop offset="1" stop-color="#d7bd8a"/></linearGradient>
  <radialGradient id="scrollBurn" cx=".5" cy=".45" r=".62"><stop offset=".55" stop-color="#7a4f24" stop-opacity="0"/><stop offset=".86" stop-color="#7a4f24" stop-opacity=".22"/><stop offset="1" stop-color="#5a3414" stop-opacity=".55"/></radialGradient>
  <linearGradient id="scrollT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcc396"/><stop offset="1" stop-color="#b8975f"/></linearGradient>`;
function drawLeafTree(grow){
  const L=tLayout();TP=L.pos;TBR=L.br;
  const big=document.body.classList.contains('big')||$('#tstage').clientWidth<700,BIGT={gk:1.2,aunt:1.25,asp:1.25,kid:1.3,ksp:1.3,ggp:1.2,gp:1.15,par:1.05,son:1.05,ssp:1.05};
  // name scrolls: where two would overlap, slide both people (photo and scroll together) apart, and let their branches follow
  if(SCROLLS){const bx=Object.entries(TP).map(([id,v])=>{const p=byId[id],fs=FS[v.t]*(big?BIGT[v.t]||1:1),nm=p.s.length>22?p.s.slice(0,21)+'…':p.s,w=ART&&!PRINT?ribGeo(nm,fs).w*.86+14:Math.max(50,nm.length*fs*.46+24)+30,h=fs*(ART&&!PRINT?1.9:1.6);return {id,x:v.x,dx:0,bx:[[v.y+v.r+6,v.y+v.r+6+h,w],[v.y-v.r-4,v.y+v.r+4,2*v.r+8]]};});
    // each person is a photo box and a scroll box that move together; any overlap pushes the two people apart sideways
    const ovl=(a,b)=>{let m=0;for(const [ay0,ay1,aw] of a.bx)for(const [by0,by1,bw] of b.bx){if(ay1<=by0||by1<=ay0)continue;const o=(aw+bw)/2+6-Math.abs(a.x+a.dx-b.x-b.dx);if(o>m)m=o;}return m;};
    for(let it=0;it<60;it++){let any=0;for(let i=0;i<bx.length;i++)for(let j=i+1;j<bx.length;j++){const a=bx[i],b=bx[j],ov=ovl(a,b);if(ov<=0)continue;
      const sg=(a.x+a.dx)<=(b.x+b.dx)?1:-1;a.dx-=sg*ov/2;b.dx+=sg*ov/2;any=1;}if(!any)break;}
    const old={};Object.entries(TP).forEach(([id,v])=>old[id]={x:v.x,y:v.y,r:v.r});
    bx.forEach(b=>{if(b.dx)TP[b.id]={...TP[b.id],x:TP[b.id].x+b.dx};});
    const shiftAt=(x,y)=>{let best=0,bd=1e9;for(const id in old){const o=old[id],d=Math.hypot(x-o.x,y-o.y);if(d<=o.r+6&&d<bd){bd=d;best=TP[id].x-o.x;}}return best;};
    TBR=TBR.map(b=>{const d1=shiftAt(b.x1,b.y1),d2=shiftAt(b.x2,b.y2);if(!d1&&!d2)return b;const n={...b,x1:b.x1+d1,x2:b.x2+d2,cx:b.cx+(d1+d2)/2};
      n.d=`M${n.x1.toFixed(1)} ${n.y1.toFixed(1)}Q${n.cx.toFixed(1)} ${n.cy.toFixed(1)} ${n.x2.toFixed(1)} ${n.y2.toFixed(1)}`;return n;});}
  if(FLAT){for(const id in TP){const v=TP[id];if(v.y>1250)TP[id]={...v,y:v.t==='gk'?GY-175:GY-310};}}/* Ed and Renee's children and grandchildren hang in two rows below the leaves, clear of the grass and its flowers */
  else if(ART&&!PRINT){const old=x=>OLDP.cy-Math.sqrt(Math.max(0,OLDP.R**2-(x-OLDP.cx)**2));for(const id in TP){const v=TP[id];if(v.y>1250)TP[id]={...v,y:v.y+surfY(v.x)-old(v.x)};}}
  const xs=[],ys=[];Object.values(TP).forEach(v=>{xs.push(v.x-v.r-70,v.x+v.r+70);ys.push(v.y-v.r-8,v.y+v.r+34);});TBR.forEach(b=>{xs.push(b.x1,b.x2);ys.push(b.y1,b.y2);});if(ART&&!PRINT)ys.push(CHEST.y+30);
  TB={x0:Math.min(...xs),y0:Math.min(...ys),x1:Math.max(...xs),y1:Math.max(...ys)};
  // the tree's size decides where tall screens hang the stars, so redraw the backdrop when it changes
  {const k=[TB.x0,TB.y0,TB.x1,TB.y1].map(Math.round).join();if(k!==sbdKey){sbdKey=k;if(stageDraw)requestAnimationFrame(()=>stageDraw());}}
  GROWR=Math.max(...Object.values(TP).map(v=>Math.hypot(v.x-915,v.y-1300)+v.r))+60;
  const dl=(y,x=915)=>growDelay(x,y);
  let deco='',seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  TBR.forEach(b=>{if(b.w<4)return;const n=b.w>=20?4:b.w>=8?2:1;for(let i=0;i<n;i++){const t=.3+rnd()*.55,[x,y]=qpt(b,t),ang=Math.atan2(b.y2-b.y1,b.x2-b.x1)*180/Math.PI+(rnd()<.5?50:-50),s=b.w>=20?1.3:1;
      deco+=`<ellipse class="deco" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(13*s).toFixed(1)}" ry="${(6*s).toFixed(1)}" transform="rotate(${ang.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)}) translate(${(14*s).toFixed(1)} 0)" style="--d:${dl(y,x)+150}ms"/>`;}});
  const gb=Math.max(1410,TB.y1+30),ground=`<path class="ground" d="M${TB.x0} 1380 Q915 1205 ${TB.x1} 1380 L${TB.x1} ${gb} L${TB.x0} ${gb}Z"/>`;
  const brs=TBR.map(b=>`<path class="br" d="${b.d}" style="stroke-width:${b.w}px"/>`).join('');
  let defs=SCROLLS?SCROLLDEFS:'';
  const LDX={};
  const leaves=Object.entries(TP).map(([id,v])=>{const p=byId[id],ph=photo[id],r=v.r,fs=+(FS[v.t]*(big?BIGT[v.t]||1:1)).toFixed(1);
    if(ph)defs+=`<clipPath id="tc-${id}"><circle r="${r}"/></clipPath>`;
    const nm=p.s.length>22?p.s.slice(0,21)+'…':p.s;
    const face=ph?`<image href="${esc(ph)}" x="${-r}" y="${-r}" width="${2*r}" height="${2*r}" clip-path="url(#tc-${id})" preserveAspectRatio="xMidYMid slice"/>`:`<circle class="ini" r="${r}"/><text class="init" y="${(r*.32).toFixed(1)}" font-size="${(r*.78).toFixed(1)}">${esc(initials(p.s))}</text>`;
    return `<g class="leaf${id===sel?' sel':''}" data-id="${id}" tabindex="0" role="button" aria-label="${esc(p.n)}" transform="translate(${v.x.toFixed(1)},${v.y.toFixed(1)})"><g class="lin" style="--d:${dl(v.y,v.x)}ms"><circle class="glow" r="${r+3}"/><circle class="halo" r="${r+5}"/>${face}<circle class="ring" r="${r+1.5}" style="stroke:var(--${p.c})"/>${ART?`<image class="fring" href="photos/art/frame-circle.webp" x="${(-(r+3)/185*299).toFixed(1)}" y="${(-(r+3)/185*300).toFixed(1)}" width="${((r+3)/185*598).toFixed(1)}" height="${((r+3)/185*600).toFixed(1)}"/>`:''}${SCROLLS?scrollLabel(nm,r,fs,LDX[id]||0):`<text class="lname" y="${r+fs+6}" font-size="${fs}">${esc(nm)}</text>`}</g></g>`;}).join('');
  const art=treeArt(TSTYLE,dl);
  if(art&&PRINT){$('#tdefs').innerHTML=art.defs+defs;tw.innerHTML=`<g class="bake">${art.under+art.ground}</g>`+(art.rootsUnder||'')+art.brs+art.over+leaves;bakeArt(art,false);}
  else if(art){$('#tdefs').innerHTML=art.defs+defs+`<clipPath id="growclip" clipPathUnits="userSpaceOnUse"><circle id="growc" cx="915" cy="1300" r="${growR.toFixed(1)}"/></clipPath>`;
    if(art.treeImg){tw.innerHTML=`<g class="growg" clip-path="url(#growclip)">${art.treeImg}</g>`+art.planet+`<g class="growg" clip-path="url(#growclip)">${(art.rootsUnder||'')+art.brs}</g>`+leaves;markKin();}
    else{tw.innerHTML=(art.planet||'')+`<g class="growg" clip-path="url(#growclip)">${(art.rootsUnder||'')+art.brs+art.over}</g>`+leaves;bakeArt(art,true);}}
  else{$('#tdefs').innerHTML=defs;tw.innerHTML=ground+brs+deco+leaves;}
  if(grow){tw.classList.add('tgrow');setTimeout(()=>tw.classList.remove('tgrow'),3400);}
  renderMemStars();
  if(storyFocus)tw.querySelectorAll('.leaf').forEach(c=>c.classList.toggle('dim',!storyFocus.includes(c.dataset.id)));
}
/* stage size is cached so dragging never forces the browser to re-measure the page */
$('#tstage').addEventListener('scroll',e=>{const t=e.currentTarget;if(t.scrollTop||t.scrollLeft){t.scrollTop=0;t.scrollLeft=0;}});
let TSZ={w:0,h:0};const tsz=()=>{if(!TSZ.w){const s=$('#tstage');TSZ={w:s.clientWidth,h:s.clientHeight};}return TSZ;};
new ResizeObserver(()=>{const s=$('#tstage');TSZ={w:s.clientWidth,h:s.clientHeight};if(ART&&LWIDE!==null&&lanternWide()!==LWIDE&&tw.querySelector('.leaf'))renderMemStars();if(tw.childElementCount&&!G)tApply(false);}).observe($('#tstage'));
function tClamp(){const r={width:tsz().w,height:tsz().h};if(!r.width||!(TB.x1>TB.x0))return;const W=r.width,H=r.height,bw=TB.x1-TB.x0,bh=TB.y1-TB.y0;
  const kmin=Math.min(W/bw,H/bh)*(ART&&!PRINT?(tw.classList.contains('story')?.35:.6):.5);// story chapters with many people (Mother's Day 1993) need to zoom out further to fit above the captionif(tv.k<kmin){const cx=W/2,cy=H/2;tv.x=cx-(cx-tv.x)*kmin/tv.k;tv.y=cy-(cy-tv.y)*kmin/tv.k;tv.k=kmin;}
  const k=tv.k;tv.x=Math.min(W*.6-TB.x0*k,Math.max(W*.4-TB.x1*k,tv.x));tv.y=Math.min(H*.55-TB.y0*k,Math.max(ART&&!PRINT?H*.5-((FLAT?Math.max(TB.y1,GY+1120):TB.y1)+60)*k:H*.5-(TB.y1+(PRINT?0:340+SOILD-SOIL0))*k,tv.y));}
let SKYEL=null;
function sunLight(){if(SKY!=='day')return;
  // stage: the sun hangs in the sky, not behind the tree, so the light no longer follows the view — always full sunset light
  if(STAGE){const st=SKYEL||(SKYEL=$('#tstage .sky'));if(st&&st.style.getPropertyValue('--sunup')!=='1'){st.style.setProperty('--sunup','1');st.style.setProperty('--suny','62%');}return;}const st=SKYEL||(SKYEL=$('#tstage .sky')),r={height:tsz().h};if(!st||!r.height)return;
  const H=r.height,sunY=H*(innerWidth<600?.62:.7),hz=tv.y+1272*tv.k,sz=Math.min(190,Math.max(110,innerWidth*.13));
  const up=Math.max(0,Math.min(1,(hz-sunY+sz*.15)/(sz*1.6)));
  st.style.setProperty('--sunup',up.toFixed(3));st.style.setProperty('--suny',(sunY/H*100).toFixed(1)+'%');}
const WL=[];const wl=()=>WL.length?WL:(WL.push($('#tback'),$('#tfront')),WL);
/* Animated moves (story steps, Fit, focus) glide the already-drawn picture on the graphics card instead of
   redrawing the whole tree every frame, which stuttered on phones. The tree is drawn once at one end of the
   move and the picture slides between the two views; the plain redraw is only used if the picture can't cover the screen. */
let AP=null,AT=0;
// the tree is drawn with a margin around the screen (#tsvg is 180% on computers so views can slide; 140% on touch
// screens, which fade instead of sliding, to save the graphics memory an Android tablet ran short of)
const PADF=TOUCH?.2:.4;
const setTW=(v,z)=>{tw.style.transform=`translate(${v.x+z.w*PADF}px,${v.y+z.h*PADF}px) scale(${v.k})`;};
function glideOK(R,D,z){const s=D.k/R.k,tx=D.x-R.x*s,ty=D.y-R.y*s,ok=(tx,ty,s)=>tx-s*PADF*z.w<=1&&tx+s*(1+PADF)*z.w>=z.w-1&&ty-s*PADF*z.h<=1&&ty+s*(1+PADF)*z.h>=z.h-1;
  return ok(tx,ty,s)&&ok(tx/2,ty/2,(1+s)/2)&&s<2.2&&s>.45;}
function endGlide(){if(!AT)return;clearTimeout(AT);AT=0;tsvg.classList.remove('tglide');tsvg.style.transform='';if(AP)setTW(AP,tsz());}
let SW=0;
function tApply(anim){tClamp();sunLight();endGlide();if(SW){clearTimeout(SW);SW=0;}const T=`translate(${tv.x}px,${tv.y}px) scale(${tv.k})`;
  const z=tsz(),was=AP;AP={...tv};
  const moved=was&&(Math.abs(was.x-tv.x)>.5||Math.abs(was.y-tv.y)>.5||Math.abs(was.k-tv.k)>1e-4);
  // phones: sliding a picture this big makes Android show stale copies of it while it redraws, so fade out,
  // jump to the new view while hidden, and fade back in once it has been drawn
  // Android tablets: even the fade looked like a flash, so a tablet just jumps to the new view in one step
  if(anim&&moved&&TOUCH&&z.w>=700)anim=false;
  if(anim&&moved&&!RM&&z.w<700){const st=$('#tstage');st.classList.add('tswap');
    SW=setTimeout(()=>{SW=0;wl().forEach(e=>{if(e){e.classList.add('nomo');e.style.transform=T;}});tw.classList.add('nomo');setTW(tv,z);tsvg.style.transform='';msScale();
      requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>st.classList.remove('tswap'),140)));},200);
    G=null;st.classList.remove('moving');return;}
  $('#tstage').classList.remove('tswap');wl().forEach(e=>{if(e){e.classList.toggle('nomo',!anim);e.style.transform=T;}});
  if(anim&&moved&&!RM&&glideOK(tv,was,z)){
    // draw at the new view, start the picture where the old view was, then slide it home
    tw.classList.add('nomo');setTW(tv,z);const sc=was.k/tv.k;tsvg.classList.remove('tglide');
    tsvg.style.transform=`translate(${was.x-tv.x*sc}px,${was.y-tv.y*sc}px) scale(${sc})`;void tsvg.getBoundingClientRect();
    tsvg.classList.add('tglide');tsvg.style.transform='';AT=setTimeout(()=>{AT=0;tsvg.classList.remove('tglide');},950);}
  else if(anim&&moved&&!RM&&glideOK(was,tv,z)){
    // keep the old drawing, slide it to the new view, then redraw there once at the end
    tw.classList.add('nomo');setTW(was,z);const sc=tv.k/was.k;tsvg.classList.add('tglide');
    tsvg.style.transform=`translate(${tv.x-was.x*sc}px,${tv.y-was.y*sc}px) scale(${sc})`;AT=setTimeout(()=>{AT=0;tsvg.classList.remove('tglide');tsvg.style.transform='';setTW(tv,z);},950);}
  else{tw.classList.toggle('nomo',!anim);setTW(tv,z);tsvg.style.transform='';}
  G=null;$('#tstage').classList.remove('moving');msScale();}
/* while a finger is dragging or pinching, move the already-drawn picture instead of redrawing the tree every frame */
let G=null,gRaf=0;
function gBegin(){if(G)return;endGlide();G={...tv};$('#tstage').classList.add('moving');}
function gApply(){tClamp();if(!G){tApply(false);return;}let s=tv.k/G.k;
  // before the moving picture runs out of pre-drawn edge (or gets too blurry), redraw it at the new spot and carry on
  {const z=tsz(),dx=tv.x-G.x*s,dy=tv.y-G.y*s;if(Math.abs(dx)>z.w*.3||Math.abs(dy)>z.h*.3||s>1.6||s<.65){tApply(false);gBegin();s=1;}}
  tsvg.style.transform=`translate(${tv.x-G.x*s}px,${tv.y-G.y*s}px) scale(${s})`;const T=`translate(${tv.x}px,${tv.y}px) scale(${tv.k})`;wl().forEach(e=>{if(e){e.classList.add('nomo');e.style.transform=T;}});}
const gFrame=()=>{if(!gRaf)gRaf=requestAnimationFrame(()=>{gRaf=0;gApply();});};
function gEnd(){if(gRaf){cancelAnimationFrame(gRaf);gRaf=0;}if(G)tApply(false);}
function tBox(ids){const vs=(ids&&ids.length?ids:Object.keys(TP)).map(id=>TP[id]).filter(Boolean);if(!vs.length)return TB;
  return {x0:Math.min(...vs.map(v=>v.x-v.r-60)),x1:Math.max(...vs.map(v=>v.x+v.r+60)),y0:Math.min(...vs.map(v=>v.y-v.r-10)),y1:Math.max(...vs.map(v=>v.y+v.r+34))};}
function tFrame(ids,anim=true){const r=$('#tstage').getBoundingClientRect();if(!r.width)return;
  const SD=STAGE?stageDims(r.width,r.height):null,cap=$('#cap'),capH=cap.classList.contains('on')?cap.offsetHeight+24:0,top=SD?Math.max(60,SD.top,(()=>{const m=$('#marquee');return m?mqBot()+(SD.ph?104:10):0;})()):60,avail=r.height-capH-top-8-(SD?SD.bot+((st=>st?st.offsetHeight+10:0)($('#tstage>.tools'))):0),b=(ids&&ids.length)?tBox(ids):(ART&&!PRINT&&SD&&!SD.ph&&r.width>r.height?{...TB,y1:FLAT?GY+40:Math.min(TB.y1,1272+DROP+600)}:TB),w=b.x1-b.x0,h=b.y1-b.y0;
  const k=Math.max(.12,Math.min((r.width-36-(SD?SD.side*2:0))/w,avail/h,ids&&ids.length===1?1.5:1.2));
  tv.k=k;tv.x=r.width/2-(b.x0+b.x1)/2*k;tv.y=top+avail/2-(b.y0+b.y1)/2*k;
  // phones, opening view: zoom so the core family just fills the width (outer cousins run off the sides, a swipe away)
  // and centre the whole tree in the height between the sky and the buttons, so there's no empty ground below it
  if(SD&&SD.ph&&ids===TCORE){const k2=Math.max(.12,Math.min((r.width-6)/w,avail/(TB.y1-TB.y0)));tv.k=k2;tv.x=r.width/2-(b.x0+b.x1)/2*k2;tv.y=top+(avail-(TB.y1-TB.y0)*k2)/2-TB.y0*k2;}
  else if(SD&&SD.ph&&!(ids&&ids.length===1))tv.y=Math.min(tv.y,top+12-TB.y0*k);
  // painted stage: Fit and the opening view never go below 85% of the whole-tree size, the same framing as before
  // the zoom-out limit was loosened; scrolling, pinching and the - key can still zoom out further (to 60%, see tClamp)
  if(ART&&!PRINT&&!FLAT&&(!ids||!ids.length||ids===TCORE)){const W=r.width,H=r.height,kf=Math.min(W/(TB.x1-TB.x0),H/(TB.y1-TB.y0))*.85;if(tv.k<kf){tv.x=W/2-(W/2-tv.x)*kf/tv.k;tv.y=H/2-(H/2-tv.y)*kf/tv.k;tv.k=kf;}}
  tApply(anim);}
// the setting sun sits right behind the trunk whenever the view is framed (first load, Fit); panning leaves it where it is
function sunToTrunk(jump){const st=SKYEL||(SKYEL=$('#tstage .sky')),W=$('#tstage').getBoundingClientRect().width;if(!st||!W)return;
  if(jump)st.style.transition='none';st.style.setProperty('--sunx',Math.max(8,Math.min(92,(tv.x+915*tv.k)/W*100)).toFixed(2)+'%');if(jump){void st.offsetWidth;st.style.transition='';}}
const tFit=(anim=true)=>{tFrame([],anim);sunToTrunk(!anim);};
const TCORE=['jack','margaret','johnny','annie','ed','renee','chris','mat','jon','dustin'];
const tStart=()=>{innerWidth<600?tFrame(TCORE,false):tFit(false);sunToTrunk(true);};
function tFocus(id){tTouched=1;const v=TP[id];if(!v)return;const r=$('#tstage').getBoundingClientRect();tv.k=Math.max(tv.k,1);tv.x=r.width/2-v.x*tv.k;tv.y=r.height/2-v.y*tv.k;tApply(true);}
function tZoom(f,cx,cy,fast){tTouched=1;hidePop();const r=tsz();cx??=r.w/2;cy??=r.h/2;const k=Math.min(3,Math.max(.12,tv.k*f));tv.x=cx-(cx-tv.x)*k/tv.k;tv.y=cy-(cy-tv.y)*k/tv.k;tv.k=k;if(fast){gBegin();gFrame();}else tApply(false);}
{const pts=new Map();let moved=0,last=null,pinch=null,pinchR=null;
 tsvg.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse'||pts.size)return;const c=e.target.closest('.leaf');if(c&&c.dataset.id!==popId)showPop(c.dataset.id);});
 tsvg.addEventListener('pointerout',e=>{if(e.pointerType!=='mouse')return;const c=e.target.closest('.leaf');if(c&&!c.contains(e.relatedTarget))hidePop();});
 tsvg.addEventListener('pointerdown',e=>{hidePop();tsvg.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);moved=0;last=[e.clientX,e.clientY];tsvg.classList.add('drag');
   if(pts.size===2){const [a,b]=[...pts.values()];pinch=Math.hypot(a[0]-b[0],a[1]-b[1]);pinchR=null;}});
 tsvg.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,[e.clientX,e.clientY]);
   if(pts.size===2&&pinch){const [a,b]=[...pts.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]),r=pinchR||(pinchR=$('#tstage').getBoundingClientRect());tZoom(d/pinch,(a[0]+b[0])/2-r.left,(a[1]+b[1])/2-r.top,true);pinch=d;moved=99;return;}
   const dx=e.clientX-last[0],dy=e.clientY-last[1];moved+=Math.abs(dx)+Math.abs(dy);last=[e.clientX,e.clientY];if(moved<4)return;tv.x+=dx;tv.y+=dy;tTouched=1;gBegin();gFrame();});
 const up=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(pts.size===1){last=[...pts.values()][0].slice();moved=99;}if(!pts.size){tsvg.classList.remove('drag');gEnd();}
   if(e.type==='pointerup'&&moved<6){const hit=document.elementFromPoint(e.clientX,e.clientY),ms=hit?.closest('.tmstar,.mflower,.mlantern');if(ms){openMem(ms);return;}const fl=hit?.closest('.flantern');if(fl){openFilm(fl.dataset.film);return;}const pl=hit?.closest('.plantern');if(pl){select(pl.dataset.p);return;}if(hit?.closest('.kchest')){location.hash='keepsakes';return;}const gs=hit?.closest('.gsign');if(gs){gardenNote(gs);return;}const c=document.elementFromPoint(e.clientX,e.clientY)?.closest('.leaf');if(c){select(c.dataset.id);}else{const rp=document.elementFromPoint(e.clientX,e.clientY)?.closest('.rootpin');if(rp)showPlace(rp,true);else document.body.classList.remove('pdrawer');}}};
 tsvg.addEventListener('pointerup',up);tsvg.addEventListener('pointercancel',up);
 // wheel and trackpad: zoom in proportion to how far the fingers or wheel moved (a trackpad sends many small steps, so a fixed step per event raced),
 // pinch (ctrlKey) a little livelier than two-finger scrolling; the picture glides while zooming and is redrawn sharp once it settles
 let wEnd=0;tsvg.addEventListener('wheel',e=>{e.preventDefault();const r=$('#tstage').getBoundingClientRect();let d=e.deltaY*(e.deltaMode===1?33:e.deltaMode===2?400:1);
   const f=Math.min(1.15,Math.max(1/1.15,Math.exp(-d*(e.ctrlKey?.006:.0016))));tZoom(f,e.clientX-r.left,e.clientY-r.top,true);clearTimeout(wEnd);wEnd=setTimeout(gEnd,160);},{passive:false});
 // keyboard: + / = zoom in, - zoom out, 0 fits the tree, arrow keys move around (not while typing or with a window open; Ctrl/Cmd keeps the browser's own zoom)
 document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const t=e.target;if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;
   const st=$('#tstage');if(!st||!st.offsetWidth||document.body.classList.contains('storyon')||$('#lb').classList.contains('on')||t?.closest?.('#panel,.mnote,[role=dialog]'))return;
   if([...document.querySelectorAll('[role=dialog]')].some(d=>!d.hidden&&d.offsetWidth&&d.id!=='mnote'))return;
   const k=e.key,step=60;let done=1;if(k==='+'||k==='=')tZoom(1.2);else if(k==='-'||k==='_')tZoom(1/1.2);else if(k==='0'){tTouched=1;tFit();}
   else if(k==='ArrowLeft'){tv.x+=step;tTouched=1;tApply(false);}else if(k==='ArrowRight'){tv.x-=step;tTouched=1;tApply(false);}else if(k==='ArrowUp'){tv.y+=step;tTouched=1;tApply(false);}else if(k==='ArrowDown'){tv.y-=step;tTouched=1;tApply(false);}else done=0;
   if(done)e.preventDefault();});
 tsvg.addEventListener('dblclick',e=>{const r=$('#tstage').getBoundingClientRect();tZoom(1.8,e.clientX-r.left,e.clientY-r.top);});
 tsvg.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){}const ms=e.target.closest?.('.tmstar,.mflower,.mlantern');if(ms&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openMem(ms);return;}const fl=e.target.closest?.('.flantern');if(fl&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openFilm(fl.dataset.film);return;}const pl=e.target.closest?.('.plantern');if(pl&&(e.key==='Enter'||e.key===' ')){e.preventDefault();select(pl.dataset.p);return;}if((e.key==='Enter'||e.key===' ')&&e.target.closest?.('.kchest')){e.preventDefault();location.hash='keepsakes';return;}const gs=e.target.closest?.('.gsign');if(gs&&(e.key==='Enter'||e.key===' ')){e.preventDefault();gardenNote(gs);return;}const c=e.target.closest?.('.leaf');if(c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();select(c.dataset.id);}});}
$('#tzin').onclick=()=>tZoom(1.3);$('#tzout').onclick=()=>tZoom(1/1.3);$('#tfit').onclick=()=>{tTouched=1;tFit();};
$('#q').addEventListener('change',e=>{const v=e.target.value.toLowerCase().trim();const p=P.find(p=>p.n.toLowerCase()===v)||P.find(p=>p.n.toLowerCase().includes(v));if(p){select(p.id);tFocus(p.id);}});


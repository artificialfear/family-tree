/* ---------- illustrated tree ---------- */
const tsvg=$('#tsvg'),tw=$('#tworld');let TP={},TBR=[],TB={x0:0,y0:0,x1:1,y1:1},tv={x:0,y:0,k:1},tTouched=0,tFitted=0;
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
      const m=ks.length,step=m>3?29:m>2?(document.body.classList.contains('big')?41:34):30,KR=m>3?205:m>2?170:185,kOff=(sp&&side==='h'&&ad<180)?-20:0;ks.forEach((k,j)=>{const ka=a+((j-(m-1)/2)*step+kOff)*D,cx=Math.cos(ka),cy=Math.sin(ka),kx=x+cx*KR,ky=y+cy*KR;put(k.id,kx,ky,'kid');
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
const TSTYLE=(new URLSearchParams(location.search).get('style'))||'ink';
const PL_NAMES={covington:'Covington, GA',newborn:'Newborn, GA',greenville:'Meriwether County, GA',collegepark:'College Park, GA',upson:'Upson County, GA',louisville:'Louisville, KY',durham:'Durham, NC',orange:'Orange County, NC'};
const SKYQ=new URLSearchParams(location.search).get('sky');
// 'stage' = toy-theater look (painted backdrop, curtains, engraved tree); mockup behind ?theme=stage
const THEME=new URLSearchParams(location.search).get('theme')||'stage',STAGE=THEME==='stage';
let PRINT=false,SKYPREF=SKYQ||'night',SKY='night',NIGHT=true;
function autoSky(){const d=new Date(),h=d.getHours()+d.getMinutes()/60;return h>=7.5&&h<17?'day':((h>=17&&h<18.75)||(h>=6&&h<7.5))?'dusk':'night';}
const skyNow=()=>SKYPREF==='auto'?autoSky():SKYPREF;
SKY=skyNow();NIGHT=true;
$('#tstage').classList.add('ts-'+TSTYLE);if(((new URLSearchParams(location.search).get('tree')||'painted')==='painted'&&TSTYLE==='ink')||TSTYLE==='parch')$('#tstage').classList.add('tp');
/* moon phase for today's date (0 = new moon, .5 = full) */
function moonPhase(d){const syn=29.530588853,ref=Date.UTC(2000,0,6,18,14);let p=((d-ref)/864e5/syn)%1;return p<0?p+1:p;}
function moonSVG(p){const R=48,k=Math.cos(2*Math.PI*p),wax=p<.5,ls=wax?1:0,ts=wax?(k>0?0:1):(k>0?1:0),rx=Math.abs(k)*R;
  const lit=`M0 ${-R}A${R} ${R} 0 0 ${ls} 0 ${R}A${rx.toFixed(2)} ${R} 0 0 ${ts} 0 ${-R}Z`;
  return `<svg viewBox="-50 -50 100 100" aria-hidden="true"><defs><radialGradient id="mg" cx="38%" cy="34%" r="70%"><stop offset="0" stop-color="#fffaf0"/><stop offset=".5" stop-color="#f6ecd2"/><stop offset="1" stop-color="#e0cfa7"/></radialGradient><clipPath id="mlit"><path d="${lit}"/></clipPath></defs>
   <circle r="${R}" fill="#26314d" opacity=".55"/><path d="${lit}" fill="url(#mg)"/><g clip-path="url(#mlit)" fill="#bfa97c" opacity=".35"><circle cx="12" cy="8" r="8"/><circle cx="-14" cy="-18" r="5"/><circle cx="-6" cy="22" r="4"/><circle cx="22" cy="-16" r="3.5"/></g></svg>`;}
{const st=$('#tstage');let sd=3;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;let stars='',clouds='';
 for(let i=0,N=innerWidth<700?60:110;i<N;i++){const x=r()*100,y=Math.pow(r(),1.4)*78,z=r()<.12?2.6:r()<.4?1.8:1.1,tw=r()<.3;stars+=`<i class="${tw?'tw':''}${y>34?' lo':''}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;width:${z}px;height:${z}px;--o:${(.45+r()*.5).toFixed(2)};${tw?`--t:${(5+r()*9).toFixed(1)}s;--dl:-${(r()*12).toFixed(1)}s`:''}"></i>`;}
 for(let i=0;i<5;i++)clouds+=`<b class="cloud" style="top:${(6+r()*34).toFixed(1)}%;--s:${(.6+r()*.7).toFixed(2)};--t:${(150+r()*120).toFixed(0)}s;--dl:-${(r()*200).toFixed(0)}s"></b>`;
 const sky=document.createElement('div');sky.className='sky';sky.setAttribute('aria-hidden','true');sky.innerHTML=`<div class="sunglow"></div><div class="stars">${stars}</div>${clouds}<div class="sunset"></div><div class="skydim"></div>`;
 const back=document.createElement('div');back.id='tback';back.className='wlayer';back.innerHTML='<img id="tbackimg" alt="" decoding="async">';
 const front=document.createElement('div');front.id='tfront';front.className='wlayer';let ff='';
 for(let i=0;i<12;i++){const x=330+r()*1180,y=1110+r()*170;ff+=`<i style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;--t:${(6+r()*6).toFixed(1)}s;--p:${(2.5+r()*2.5).toFixed(1)}s;--dl:-${(r()*8).toFixed(1)}s;--dx:${(r()*60-30).toFixed(0)}px;--dy:${(-20-r()*40).toFixed(0)}px"></i>`;}
 front.innerHTML=ff;
 const cel=document.createElement('div');cel.id='celest';cel.innerHTML=`<button class="moon" id="moonBtn" aria-label="A note for Mom">${moonSVG(moonPhase(Date.now()))}</button><button class="sun" id="sunBtn" aria-label="The evening star: a note for Mom"></button><div id="mstars"></div>`;
 const note=document.createElement('div');note.id='mnote';note.setAttribute('role','dialog');note.hidden=true;
 st.prepend(sky);sky.after(back);st.querySelector('svg').after(front);front.after(cel);st.appendChild(note);
 if(STAGE){st.classList.add('theme-stage');const bd=document.createElement('div');bd.className='sbackdrop';sky.appendChild(bd);
   const pr=document.createElement('div');pr.id='proscen';pr.setAttribute('aria-hidden','true');cel.after(pr);
   const mq=document.createElement('div');mq.id='marquee';mq.innerHTML=marqueeSVG();pr.after(mq);
   mq.addEventListener('click',e=>{const g=e.target.closest('#tnew');if(g)openNewest(g);});
   mq.addEventListener('keydown',e=>{const g=e.target.closest('#tnew');if(g&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openNewest(g);}});
   const draw=()=>{const r=st.getBoundingClientRect();if(r.width<10)return;const tb=st.querySelector('.tools'),D=stageDims(r.width,r.height);$('#marquee').style.top=(r.width<700?4:6)+'px';if(r.width<700){const mb=$('#marquee').getBoundingClientRect().bottom-r.top;st.style.setProperty('--mqb',mb+'px');}st.style.setProperty('--apron',D.ah+'px');if(tb)st.style.setProperty('--tbh',tb.offsetHeight+'px');bd.innerHTML=stageBackdrop(r.width,r.height);pr.innerHTML=stageFrame(r.width,r.height);};
   draw();let rt;new ResizeObserver(()=>{if(st.classList.contains('moving'))return;clearTimeout(rt);rt=setTimeout(()=>{draw();if(!tTouched)tStart();},120);}).observe(st);}}
/* the moon and sun as friendly faces, gold-rimmed like an old stage sign (original drawings) */
function faceSVG(kind){const sun=kind==='sun';let rays='';
  if(sun)for(let i=0;i<16;i++){const a=i*22.5,l=i%2?58:66;rays+=`<path transform="rotate(${a})" d="M-7 -40Q0 ${-l-6} 7 -40Z" fill="url(#fr${kind})" stroke="#8f5f1b" stroke-width="1.2"/>`;}
  return `<svg viewBox="-70 -70 140 140" aria-hidden="true"><defs><radialGradient id="ff${kind}" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="${sun?'#fff1a8':'#fff6c8'}"/><stop offset=".6" stop-color="${sun?'#f7c84a':'#f2d26a'}"/><stop offset="1" stop-color="${sun?'#d98a1f':'#c99a2e'}"/></radialGradient>
   <linearGradient id="fr${kind}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#e09a2a"/></linearGradient></defs>${rays}
   <circle r="46" fill="#8f5f1b"/><circle r="43" fill="#e8b84f"/><circle r="39" fill="url(#ff${kind})" stroke="#9c6a1e" stroke-width="1.5"/>
   ${sun?'':'<g fill="#c99a2e" opacity=".35"><circle cx="-22" cy="-20" r="5"/><circle cx="24" cy="18" r="4"/><circle cx="-26" cy="16" r="3"/><circle cx="12" cy="-28" r="3"/></g>'}
   <ellipse cx="-18" cy="10" rx="8" ry="5" fill="#f08a7a" opacity=".55"/><ellipse cx="18" cy="10" rx="8" ry="5" fill="#f08a7a" opacity=".55"/>
   <path d="M-23 -9Q-15 -15 -7 -9" fill="none" stroke="#6b3d10" stroke-width="2.6" stroke-linecap="round"/>
   ${sun?'<path d="M7 -9Q15 -15 23 -9" fill="none" stroke="#6b3d10" stroke-width="2.6" stroke-linecap="round"/>':'<ellipse cx="15" cy="-8" rx="6" ry="7" fill="#fff"/><circle cx="16" cy="-7" r="3.6" fill="#3a6fb8"/><circle cx="16.6" cy="-7.4" r="1.6" fill="#10203a"/><path d="M8 -14Q15 -19 23 -13" fill="none" stroke="#6b3d10" stroke-width="2" stroke-linecap="round"/>'}
   <path d="M-12 14Q0 25 12 14" fill="none" stroke="#6b3d10" stroke-width="2.8" stroke-linecap="round"/>
   <path d="M-3 -2Q-6 6 -1 8" fill="none" stroke="#a8712a" stroke-width="1.8" stroke-linecap="round"/></svg>`;}
/* the family name as a lit marquee sign, fixed at the top of the stage */
function marqueeSVG(){const f=n=>n.toFixed(1);let bulbs='';
  const edge=[];for(let t=0;t<=1.0001;t+=1/26){const x=30+460*t;edge.push([x,46-Math.sin(Math.PI*t)*22]);}
  edge.forEach(([x,y])=>bulbs+=`<circle cx="${f(x)}" cy="${f(y)}" r="3.4"/>`);
  for(let x=30;x<=490;x+=460/26)bulbs+=`<circle cx="${f(x)}" cy="148" r="3.4"/>`;
  for(let y=60;y<140;y+=14)bulbs+=`<circle cx="20" cy="${y}" r="3.4"/><circle cx="500" cy="${y}" r="3.4"/>`;
  let rays='';for(let i=0;i<14;i++){const a=(-90+(i-6.5)*13)*Math.PI/180;rays+=`<path d="M260 176L${f(260+Math.cos(a-.08)*320)} ${f(176+Math.sin(a-.08)*320)}L${f(260+Math.cos(a+.08)*320)} ${f(176+Math.sin(a+.08)*320)}Z"/>`;}
  const panel='M18 52Q260 2 502 52L506 156L14 156Z';
  return `<svg class="mqsign" viewBox="0 0 520 170" role="img" aria-label="The Graham and Harper Family">
   <defs><linearGradient id="mqg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a6"/><stop offset=".5" stop-color="#e0ae45"/><stop offset="1" stop-color="#9a6a1e"/></linearGradient>
   <linearGradient id="mqb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b58c4"/><stop offset="1" stop-color="#16307f"/></linearGradient><clipPath id="mqc"><path d="M30 56Q260 12 490 56L492 144L28 144Z"/></clipPath></defs>
   <path d="${panel}" fill="url(#mqg)" stroke="#6b4410" stroke-width="2"/>
   <g transform="translate(14 54)"><circle r="16" fill="url(#mqg)" stroke="#6b4410" stroke-width="1.5"/><path d="M0 0m-9 0a9 9 0 1 1 9 9a5 5 0 1 1 -5 -5" fill="none" stroke="#7a5214" stroke-width="2.2"/></g>
   <g transform="translate(506 54) scale(-1 1)"><circle r="16" fill="url(#mqg)" stroke="#6b4410" stroke-width="1.5"/><path d="M0 0m-9 0a9 9 0 1 1 9 9a5 5 0 1 1 -5 -5" fill="none" stroke="#7a5214" stroke-width="2.2"/></g>
   <path d="M30 56Q260 12 490 56L492 144L28 144Z" fill="url(#mqb)" stroke="#f5e6c0" stroke-width="2"/>
   <g clip-path="url(#mqc)" fill="#5a86e6" opacity=".22">${rays}</g>
   <text x="260" y="58" text-anchor="middle" class="mqsmall">THE</text>
   <text x="260" y="102" text-anchor="middle" class="mqbig" textLength="384" lengthAdjust="spacingAndGlyphs">GRAHAM &amp; HARPER</text>
   <g transform="translate(260 124)"><path d="M-62 -13H62L70 0L62 13H-62L-70 0Z" fill="#b3262c" stroke="#f5e6c0" stroke-width="1.6"/><text y="6" text-anchor="middle" class="mqplaque">FAMILY</text></g>
   <g class="mqbulbs">${bulbs}</g></svg>
   <svg class="mqnew" viewBox="-300 -20 600 40"><g id="tnew" class="tnew" role="button" tabindex="0"><rect class="tnbg" x="-200" y="-17" width="400" height="32" rx="16"/><text class="tntext" text-anchor="middle" y="5"></text></g></svg>`;}
/* ---------- toy-theater scenery (theme=stage): drawn to the screen size, redrawn only on resize ---------- */
function star6(x,y,r){let d='';for(let i=0;i<12;i++){const a=(i*30-90)*Math.PI/180,rr=i%2?r*.45:r;d+=(i?'L':'M')+(x+Math.cos(a)*rr).toFixed(1)+' '+(y+Math.sin(a)*rr).toFixed(1);}return d+'Z';}
function stageBackdrop(W,H){const ph=W<700;let sd=11;const r=()=>(sd=(sd*16807)%2147483647)/2147483647,f=n=>n.toFixed(1);
  // two rows of flat cut-out clouds hanging from the top, then gold stars on strings
  const top=stageDims(W,H).top-(ph?4:10);let back='',front='';
  const row=(y,sc,cls)=>{let x=-40,d='M-60 0L-60 '+f(y);while(x<W+60){const w=(ph?60:90)*sc*(.75+r()*.6),h=w*(.42+r()*.18);d+=`Q${f(x+w*.05)} ${f(y+h)} ${f(x+w*.5)} ${f(y+h*.95)}Q${f(x+w*.95)} ${f(y+h)} ${f(x+w)} ${f(y)}`;x+=w;}return `<path class="${cls}" d="${d}L${f(W+60)} 0Z"/>`;};
  back=row(top+(ph?8:14),1.25,'sc2');front=row(top,1,'sc1');
  let stars='';const n=ph?5:9;for(let i=0;i<n;i++){const x=W*(.06+.88*(i+.5)/n)+(r()-.5)*W*.05;if(Math.abs(x-W/2)<W*(ph?.14:.2))continue;const len=top+(ph?20:30)+r()*(ph?60:H*.16),rs=(ph?9:13)*(.8+r()*.5);
    stars+=`<line x1="${f(x)}" y1="0" x2="${f(x)}" y2="${f(len-rs)}" class="sstr"/><path class="sgold" d="${star6(x,len,rs)}"/><path class="sglint" d="${star6(x-rs*.12,len-rs*.12,rs*.42)}"/>`;}
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="scg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c4fae"/><stop offset="1" stop-color="#18307a"/></linearGradient>
   <linearGradient id="sgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe7a1"/><stop offset=".5" stop-color="#e3b04b"/><stop offset="1" stop-color="#a8721f"/></linearGradient></defs>${back}${front}${stars}</svg>`;}
// how much of each edge the stage frame covers, so Fit keeps the family inside it
function stageDims(W,H){const ph=W<700,vh=ph?22:Math.max(30,Math.min(56,W*.032)),n=Math.max(3,Math.round(W/(ph?150:250))),sw=W/n,dr=Math.min(sw*.16,ph?20:36),
  cw=ph?16:Math.max(26,Math.min(78,W*.045)),ah=ph?12:Math.max(16,Math.min(30,W*.018));return {ph,vh,n,sw,dr,cw,ah,top:vh+dr*1.9+10,side:cw*1.3,bot:ah+(ph?14:34)};}
function stageFrame(W,H){const f=n=>n.toFixed(1),{ph,vh,n,sw,dr,cw,ah}=stageDims(W,H);
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
    const tx=e+o*cw*.45;return `<path class="pred" d="${pts}"/>${folds}<path class="ptie" d="M${f(e)} ${f(ty-5)}L${f(tx+o*4)} ${f(ty-5)}L${f(tx+o*4)} ${f(ty+5)}L${f(e)} ${f(ty+5)}Z"/><circle cx="${f(tx+o*4)}" cy="${f(ty)}" r="${ph?4:6}" class="pgold"/><path class="ptas" d="M${f(tx+o*4)} ${f(ty+4)}l-${ph?4:7} ${ph?14:24}h${ph?8:14}Z"/>`;};
  // stage apron with footlights
  let lights='';for(let x=W*.12;x<W*.9;x+=ph?70:120)lights+=`<ellipse cx="${f(x)}" cy="${f(H-ah)}" rx="${ph?10:16}" ry="${ph?3:5}" class="plight"/>`;
  const apron=`<rect x="0" y="${f(H-ah)}" width="${W}" height="${f(ah)}" class="papron"/><rect x="0" y="${f(H-ah)}" width="${W}" height="2.5" class="pgold"/>${lights}`;
  const corner=sg=>{const x=sg<0?cw*.9:W-cw*.9,y=vh+(ph?14:26),rr=ph?11:20;return `<g transform="translate(${f(x)} ${f(y)})"><circle r="${rr}" class="pcres"/><circle cx="${f(-sg*rr*.4)}" cy="${f(-rr*.15)}" r="${f(rr*.8)}" class="pcut"/></g>`;};
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="prg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b3262c"/><stop offset="1" stop-color="#6d1018"/></linearGradient>
   <linearGradient id="pgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f8a67"/><stop offset="1" stop-color="#14523b"/></linearGradient>
   <linearGradient id="pgl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe6a0"/><stop offset=".5" stop-color="#d9a441"/><stop offset="1" stop-color="#8f5f1b"/></linearGradient></defs>
   ${side(-1)}${side(1)}${band}${green}${red}${fringe}${orn}${corner(-1)}${corner(1)}${apron}</svg>`;}

function applySky(redraw){SKY=skyNow();NIGHT=true;const st=$('#tstage');['day','dusk','night'].forEach(m=>st.classList.toggle('sky-'+m,SKY===m));st.classList.toggle('night',NIGHT);
  const b=$('#tSky');if(b){const IC={auto:'<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor"/></svg>',
   day:'<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 17a6 6 0 0 1 12 0Z" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 20h20M12 5v3M4.6 9.6l2 2M19.4 9.6l-2 2"/></g></svg>',
   night:'<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" fill="currentColor"/></svg>'};
  const L={auto:['auto','Sky: automatic (sunset by day, night after dark)'],day:['day','Sky: always sunset'],night:['night','Sky: always night']}[SKYPREF]||['auto',''];b.innerHTML=IC[L[0]];b.setAttribute('aria-label',L[1]);b.title=L[1];}
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

/* ---------- in the sky above the tree: title banner, newest memory, family constellation ---------- */
let SKYG=null;const SHOWCONST=false; // G and H constellations: switched off for now (Mat, 2026-11-22); set true to bring them back
function skyMarkup(){if(!SKYG)return '';const f=n=>n.toFixed(1),X=915,by=SKYG.by,bw=700,bh=70,L=X-bw/2,R=X+bw/2,y0=by-bh/2,y1=by+bh/2,ym=by;
  const banner=wornScroll(L,R,y0,y1,4242,16,'tbanner')+`<text class="ttitle" x="${X}" y="${f(ym+12)}" text-anchor="middle">The Graham &amp; Harper Family</text></g>`;
  const newest=`<g id="tnew" class="tnew" role="button" tabindex="0" transform="translate(${X} ${f(y1+34)})"><rect class="tnbg" x="-200" y="-19" width="400" height="34" rx="17"/><text class="tntext" text-anchor="middle" y="5"></text></g>`;
  // the family constellations: a G on one side of the banner and an H on the other
  const letter=(segs,cx,cy,cs,id,lab)=>{const P=segs.map(sg=>sg.map(([a,b])=>[cx+a*cs,cy+b*cs]));const d=P.map(sg=>sg.map((p,i)=>(i?'L':'M')+f(p[0])+' '+f(p[1])).join('')).join('');
    const seen=new Set(),st=[];P.flat().forEach(p=>{const k=f(p[0])+','+f(p[1]);if(!seen.has(k)){seen.add(k);st.push(p);}});
    const stars=st.map((p,i)=>`<circle class="cs${i===0?' big':''}${i%3===1?' tw':''}" cx="${f(p[0])}" cy="${f(p[1])}" r="${i===0?5:i%2?3.4:4}" style="--dl:-${i*0.7}s"/>`).join('');
    return `<g id="${id}" class="tconst" role="button" tabindex="0" aria-label="${lab}"><circle cx="${f(cx)}" cy="${f(cy)}" r="${cs+26}" fill="transparent"/><path class="cl" d="${d}"/>${stars}</g>`;};
  const G=[[[.72,-.5],[.42,-.7],[.05,-.72],[-.3,-.55],[-.5,-.2],[-.5,.2],[-.3,.55],[.05,.72],[.42,.7],[.72,.45],[.74,.1],[.38,.1]]];
  const Hh=[[[-.46,-.72],[-.46,-.36],[-.46,0],[-.46,.36],[-.46,.72]],[[.46,-.72],[.46,-.36],[.46,0],[.46,.36],[.46,.72]],[[-.46,0],[0,0],[.46,0]]];
  const con=letter(G,L-150,by+14,78,'tconstG','The Graham constellation')+letter(Hh,R+150,by+14,78,'tconstH','The Harper constellation');
  return `<g id="tsky">${SHOWCONST?con:''}${banner}${newest}</g>`;}
const ago=t=>{const s=(Date.now()-t)/1000;if(s<90)return 'just now';const m=s/60;if(m<60)return Math.round(m)+' minutes ago';const h=m/60;if(h<24)return Math.round(h)+(Math.round(h)===1?' hour ago':' hours ago');const d=h/24;if(d<7)return Math.round(d)+(Math.round(d)===1?' day ago':' days ago');
  return new Date(t).toLocaleDateString(undefined,{month:'short',day:'numeric'});};
let newIdx=0,newT=null;
function renderNewest(){const g=document.getElementById('tnew');if(!g)return;const list=contribs.filter(c=>['story','photo','answer'].includes(c.type)&&byId[c.pid]).sort((a,b)=>(+b.at||0)-(+a.at||0)).slice(0,5);
  const say=c=>{const who=(c.from||'').trim()||'Someone',nm=byId[c.pid].s;return `✦ ${who} ${c.type==='photo'?'added a photo of':c.type==='answer'?'answered a question about':'shared a memory about'} ${nm} · ${ago(+c.at)}`;};
  const show=()=>{const t=g.querySelector('.tntext'),bg=g.querySelector('.tnbg');let msg,cid='';
    if(list.length){const c=list[newIdx%list.length];msg=say(c);cid=c.id;}else msg='✦ Tap any face to share a memory';
    if(msg.length>64)msg=msg.slice(0,63)+'…';
    g.classList.add('fade');setTimeout(()=>{t.textContent=msg;g.dataset.c=cid;g.setAttribute('aria-label',cid?'Newest memory: '+msg.slice(2):'Tap any face to share a memory');
      let w=400;try{w=t.getComputedTextLength()+44;}catch(e){}bg.setAttribute('x',(-w/2).toFixed(1));bg.setAttribute('width',w.toFixed(1));g.classList.remove('fade');},g.dataset.c===undefined?0:450);};
  show();clearInterval(newT);if(list.length>1)newT=setInterval(()=>{if(document.hidden||$('#tstage').classList.contains('moving'))return;newIdx++;show();},9000);}
function openNewest(g){if(g.dataset.c)openMem(g);}
function openConst(g){const b=g.getBoundingClientRect(),r=$('#tstage').getBoundingClientRect(),ch=STORY.find(c=>c.h==='Ed and Renee')||STORY[0];
  showNote(`<div class="cnote"><div class="g1">The ${g.id==='tconstH'?'Harper':'Graham'} stars</div><p><b>${esc(ch.y?ch.y+' · ':'')}${esc(ch.h)}.</b> ${esc(ch.t)}</p><button class="pri" data-story>Read the whole story</button></div>`,b.left-r.left+b.width/2,b.bottom-r.top);
  const sb=$('#mnote [data-story]');if(sb)sb.onclick=()=>{$('#mnote').hidden=true;startStory();};}
function renderMemStars(){renderNewest();const box=$('#mstars');if(!box)return;const list=contribs.filter(c=>['story','photo','answer'].includes(c.type)&&byId[c.pid]);
  const star=`<path d="M0-9L2 -2L9 0L2 2L0 9L-2 2L-9 0L-2-2Z"/>`;
  // beside the person: try spots around their photo that miss every face and name label
  const inTree=TSTYLE==='ink'&&tw.querySelector('.leaf'),taken=[];let sky='',tree='';
  const obst=inTree?Object.values(TP).flatMap(v=>[[v.x,v.y,v.r+10],[v.x,v.y+v.r+22,Math.max(36,v.r*.9)]]):[];
  const free=(x,y)=>obst.every(([ox,oy,or])=>Math.hypot(x-ox,y-oy)>or+12)&&taken.every(([tx,ty])=>Math.hypot(x-tx,y-ty)>30);
  const ANG=[-50,-130,-90,-20,-160,-70,-110,10,190,30,150];
  list.forEach(c=>{const h=hsh(c.id),v=inTree&&TP[c.pid];let spot=null;
    if(v)for(const d of [v.r+26,v.r+46,v.r+66]){for(const a of ANG){const x=v.x+Math.cos(a*Math.PI/180)*d,y=v.y+Math.sin(a*Math.PI/180)*d;if(free(x,y)){spot=[x,y];break;}}if(spot)break;}
    const lab=`A memory about ${esc(byId[c.pid].n)}`;
    if(spot){taken.push(spot);tree+=`<g class="mstar tmstar" data-c="${esc(c.id)}" tabindex="0" role="button" aria-label="${lab}" transform="translate(${spot[0].toFixed(1)} ${spot[1].toFixed(1)})"><g class="mss"><circle r="18" fill="transparent"/><g class="msp" style="--dl:-${(h%40)/10}s">${star}</g></g></g>`;return;}
    const h2=hsh(c.id+'y');let x=4+(h%9200)/100,y=13+(h2%3700)/100;if(x<58&&y<17)y+=10;if(x>78&&y<30)x-=24;
    sky+=`<button class="mstar" data-c="${esc(c.id)}" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;--dl:-${(h%40)/10}s" aria-label="${lab}"><svg viewBox="-10 -10 20 20">${star}</svg></button>`;});
  box.innerHTML=sky;let g=tw.querySelector('#tmstars');if(!g&&tw.querySelector('.leaf')){g=document.createElementNS('http://www.w3.org/2000/svg','g');g.id='tmstars';tw.appendChild(g);}if(g)g.innerHTML=tree;msScale();}
// stars keep a readable size however far you zoom out
function msScale(){const k=Math.min(2.4,Math.max(1,.62/tv.k));tw.style.setProperty('--msk',k.toFixed(3));}
function openMem(b){const c=contribs.find(x=>x.id===b.dataset.c);if(!c)return;
  const r=$('#tstage').getBoundingClientRect(),q=b.getBoundingClientRect(),p=byId[c.pid];
  showNote(`<div class="mem">${c.type==='photo'&&c.asset?`<img src="${esc(assetUrl(c.asset))}" alt="">`:''}${c.audio?`<button type="button" class="vplay" data-audio="${esc(c.audio)}">▶ Play voice memory</button>`:''}${c.type==='answer'&&ASKQ[c.q]?`<div class="mq">${esc(ASKQ[c.q])}</div>`:''}<p>${esc((c.text||(c.audio?'A voice memory':'A photo')).slice(0,260))}${(c.text||'').length>260?'…':''}</p>
    <div class="mby">From ${esc(whoOf(c))}${c.at?' · '+new Date(c.at).toLocaleDateString():''}</div><button class="pri" data-see="${esc(c.pid)}">See ${esc(p.s.split(' ')[0])} on the tree</button></div>`,q.left-r.left+q.width/2,q.bottom-r.top);
  $('#mnote [data-see]').onclick=ev=>{const id=ev.currentTarget.dataset.see;$('#mnote').hidden=true;select(id);tFocus(id);};}
$('#celest').addEventListener('click',e=>{const b=e.target.closest('.mstar');if(b)openMem(b);});
function taperPath(b,w0,w1){const n=16,L=[],R=[];
  for(let i=0;i<=n;i++){const t=i/n,u=1-t,x=u*u*b.x1+2*u*t*b.cx+t*t*b.x2,y=u*u*b.y1+2*u*t*b.cy+t*t*b.y2,dx=2*u*(b.cx-b.x1)+2*t*(b.x2-b.cx),dy=2*u*(b.cy-b.y1)+2*t*(b.y2-b.cy),l=Math.hypot(dx,dy)||1,w=(w0+(w1-w0)*Math.pow(t,.8))/2,nx=-dy/l*w,ny=dx/l*w;
    L.push(`${(x+nx).toFixed(1)} ${(y+ny).toFixed(1)}`);R.push(`${(x-nx).toFixed(1)} ${(y-ny).toFixed(1)}`);}
  return 'M'+L.join('L')+'L'+R.reverse().join('L')+'Z';}
const LEAFQ=new URLSearchParams(location.search).get('leaves')||'twig';const TREEQ=new URLSearchParams(location.search).get('tree')||'painted';
const SCROLLS=TSTYLE==='parch'||(TSTYLE==='ink'&&TREEQ==='painted');
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
    if(LEAFQ!=='twig'){
    for(let i=0;i<9000;i++){const x=xs0+rnd()*(xs1-xs0),y=ys0+rnd()*(1100-ys0);if(!inC(x,y)||rnd()<.5)continue;
      back+=leafAt(x,y,rnd()*360,1+rnd()*.9);}
    }else{
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
    back=twg+lvs;}
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
function treeArt(st,dl){if(st==='classic')return null;
  let seed=11;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647,f=n=>n.toFixed(1);
  const defs=`<filter id="wc" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="4"/><feDisplacementMap in="SourceGraphic" scale="18"/><feGaussianBlur stdDeviation="2.2"/></filter>
   <filter id="wcb"><feTurbulence type="fractalNoise" baseFrequency=".08" numOctaves="2" seed="2"/><feDisplacementMap in="SourceGraphic" scale="4"/></filter>
   <filter id="pshadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#1b2a1e" flood-opacity=".28"/></filter>
   <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 .23  0 0 0 0 .16  0 0 0 0 .1  0 0 0 .07 0"/></filter>`;
  const vals=Object.values(TP),top=vals.filter(v=>['ggp','gp','aunt','asp','kid','ksp'].includes(v.t));
  const BX=915,base=1262;
  const PAINT=st==='parch'||(st==='ink'&&TREEQ==='painted');const PT=PAINT?painted(vals,dl,rnd,f,BX):null;
  // branches: tapered
  const brs=TBR.map(b=>{const w1=b.w>=20?b.w*.62:Math.max(1.4,b.w*.38);return `<path class="br t" d="${taperPath(b,b.w*(st==='ink'?.9:1.05),w1)}"/>`;}).join('');
  // roots
  let roots='';[-1,1].forEach(sg=>[[150,1342,13],[250,1372,9],[78,1376,7]].forEach(([dx,y,w])=>{const b={x1:BX+sg*8,y1:base,cx:BX+sg*dx*.35,cy:y-10,x2:BX+sg*dx,y2:y};roots+=`<path class="root" d="${taperPath(b,w*2,1)}"/>`;}));
  const gb=Math.max(1410,TB.y1+30)+200,X0=TB.x0-400,X1=TB.x1+400;
  let under='',over='',ground='',extra='';
  if(st==='water'){
    // soft painted canopy behind each family cluster
    let blobs='';const greens=['#9cc59a','#b5d3a3','#7fb28a','#c7dcae'];
    top.forEach(v=>{for(let k=0;k<3;k++){const a=rnd()*6.28,d=rnd()*30;blobs+=`<circle cx="${f(v.x+Math.cos(a)*d)}" cy="${f(v.y+Math.sin(a)*d-8)}" r="${f(v.r+38+rnd()*34)}" fill="${greens[(k+Math.floor(rnd()*4))%4]}" opacity=".32"/>`;}});
    TBR.filter(b=>b.w>=8&&b.w<20).forEach(b=>{for(let k=0;k<3;k++){const [x,y]=qpt(b,.35+k*.22);blobs+=`<circle cx="${f(x)}" cy="${f(y)}" r="${f(34+rnd()*26)}" fill="${greens[k%4]}" opacity=".26"/>`;}});
    under=`<g class="art" filter="url(#wc)">${blobs}</g>`;
    ground=`<g class="art" filter="url(#wc)"><path d="M${X0} 1384 Q915 1200 ${X1} 1384 L${X1} ${gb} L${X0} ${gb}Z" fill="#b9d39f" opacity=".75"/><path d="M${X0+120} 1400 Q915 1260 ${X1-120} 1400 L${X1-120} ${gb} L${X0+120} ${gb}Z" fill="#9fc48c" opacity=".45"/></g>`;
    let lv='';const lg=['#6fa36d','#8dbb78','#5d9466','#a6c98a'];TBR.forEach(b=>{if(b.w<3)return;const n=b.w>=20?6:b.w>=8?4:2;for(let i=0;i<n;i++){const t=.25+rnd()*.7,[x,y]=qpt(b,t),ang=Math.atan2(b.y2-b.y1,b.x2-b.x1)*180/Math.PI+(rnd()<.5?55:-55)+(rnd()-.5)*30,s=.8+rnd()*.7;
      lv+=`<path class="deco" d="${LEAFP}" fill="${lg[Math.floor(rnd()*4)]}" style="--d:${dl(y,x)+150}ms" transform="translate(${f(x)} ${f(y)}) rotate(${ang.toFixed(0)}) scale(${s.toFixed(2)}) translate(6 0)" opacity=".85"/>`;}});
    over=`<g filter="url(#wcb)">${lv}</g>`;
    return {defs,under,ground,roots:`<g class="art" filter="url(#wcb)">${roots}</g>`,brs:`<g filter="url(#wcb)">${brs}</g>`,over};}
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
      planet=`<g class="art planet"><circle cx="${cx}" cy="${cy}" r="${R+34}" fill="url(#atmo)"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#pfill)"/>${rings}<g fill="${PL.dot}" opacity=".35">${dots}</g>${STAGE?`<g clip-path="url(#pclip)" opacity=".22"><circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#phatch)" mask="url(#prim)"/></g>`:''}<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${STAGE?'#0c1a10':K.line}" stroke-width="${STAGE?3:1.6}" opacity=".8"/><g stroke="${K.line}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".8">${tf}</g></g>`;
      ground='';
      // roots that lead to the places the family came from
      const PINS=[['orange',200,1580,'1911'],['durham',330,1655,'1930'],['louisville',455,1570,'1932'],['greenville',590,1650,'1956'],['collegepark',730,1575,''],['covington',915,1690,'1982'],['newborn',1120,1580,''],['upson',1300,1650,'1940']];
      const RB={x1:915,y1:1290,cx:915,cy:1380,x2:915,y2:1470};let rts=`<path class="root" d="${taperPath(RB,30,16)}"/>`,pins='';
      PINS.forEach(([k,px,py,yr],i)=>{const sx=915+(px<915?-6:px>915?6:0),sy=1462,b={x1:sx,y1:sy,cx:sx+(px-sx)*.25,cy:py-40,x2:px,y2:py-10};
        rts+=`<path class="root" d="${taperPath(b,13,2.2)}"/>`;
        for(let j=0;j<3;j++){const t=.35+j*.2,[qx,qy]=qpt(b,t),dir=(j%2?1:-1)*(px<915?1:-1),c={x1:qx,y1:qy,cx:qx+dir*24,cy:qy+22,x2:qx+dir*(30+rnd()*30),y2:qy+50+rnd()*30};rts+=`<path class="root" d="${taperPath(c,4,.6)}" opacity=".8"/>`;}
        const nm=(PL_NAMES[k]||k).replace(' (Meriwether Co.)','');
        pins+=`<g class="rootpin" data-p="${k}" tabindex="0" role="button" aria-label="${esc(nm)} — show on the map" style="--d:${0}ms"><circle cx="${px}" cy="${py}" r="22" fill="transparent"/><circle class="pg" cx="${px}" cy="${py}" r="11"/><circle class="pd" cx="${px}" cy="${py}" r="5.5"/><text x="${px}" y="${py+36}" class="pl">${esc(nm)}</text>${yr?`<text x="${px}" y="${py+56}" class="py">${yr}</text>`:''}</g>`;});
      ROOTS=`<g class="art roots">${rts}</g>${pins}`;}
    under=(!PRINT?'':`<rect class="art" x="${X0-400}" y="${TB.y0-300}" width="${X1-X0+800}" height="${gb-TB.y0+600}" filter="url(#grain)"/>`)+`<g class="art" filter="url(#wc)">${wash}</g>`;
    const pdefs=!PRINT?`<radialGradient id="pfill" gradientUnits="userSpaceOnUse" cx="915" cy="1272" r="1500"><stop offset="0" stop-color="${PL.a}"/><stop offset=".35" stop-color="${PL.b}"/><stop offset="1" stop-color="${PL.c}"/></radialGradient>
     <clipPath id="pclip"><circle cx="915" cy="${1272+2200}" r="2200"/></clipPath><radialGradient id="atmo"><stop offset=".975" stop-color="${PL.atmo}" stop-opacity="0"/><stop offset=".99" stop-color="${PL.atmo}" stop-opacity="${NIGHT?.28:.45}"/><stop offset="1" stop-color="${PL.atmo}" stop-opacity="0"/></radialGradient>${STAGE?`<pattern id="phatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)"><line x1="0" y1="0" x2="0" y2="8" stroke="#06100a" stroke-width="1.4"/></pattern>
      <radialGradient id="primg" gradientUnits="userSpaceOnUse" cx="915" cy="${1272+2200}" r="2200"><stop offset=".86" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></radialGradient>
      <mask id="prim" maskUnits="userSpaceOnUse" x="-3000" y="0" width="8000" height="8000"><rect x="-3000" y="0" width="8000" height="8000" fill="url(#primg)"/></mask>`:''}`:'';
    if(PT){const pu=(PRINT?under.replace(/<g class="art" filter="url\(#wc\)">[\s\S]*$/,''):'')+`<g filter="url(#ppaint)">${PT.back}</g>`;
      return {defs:defs+pdefs+PT.pdefs,planet,rootsUnder:ROOTS+`<g class="art">${PT.trunk}</g>`,under:pu,ground,bg:PRINT?['#f7efdd','#ecdfc2']:null,roots:'',brs:PT.brs,over:PT.lv};}
    return {defs:defs+pdefs,planet,rootsUnder:ROOTS,under,ground,bg:PRINT?['#f7efdd','#ecdfc2']:null,roots:`<g class="art">${roots}</g>`,brs:`<g class="art">${tint}</g>${brs}<g class="art">${grain}</g>`,over:lv};}

  if(st==='parch'){const {pdefs,back,lv,trunk,brs,T1}=PT;
    // roots: wide, wandering, tapering over the paper
    let rts='';[-1,1].forEach(sg=>[[260,1300,34],[430,1338,22],[560,1300,16],[170,1360,18],[640,1360,10],[360,1405,12]].forEach(([dx,y,w],i)=>{
      const b={x1:BX+sg*(90+i*8),y1:T1+14,cx:BX+sg*dx*.45,cy:y+(rnd()-.4)*40,x2:BX+sg*dx,y2:y+20};rts+=`<path class="root" d="${taperPath(b,w,1)}"/>`;
      for(let j=0;j<3;j++){const [qx,qy]=qpt(b,.45+j*.18),c={x1:qx,y1:qy,cx:qx+sg*30,cy:qy+28,x2:qx+sg*(50+rnd()*60),y2:qy+40+rnd()*50};rts+=`<path class="root" d="${taperPath(c,Math.max(2,w*.3),.5)}"/>`;}}));
    const under=`<ellipse cx="${BX}" cy="${T1+40}" rx="720" ry="70" fill="url(#pshade)"/><g filter="url(#ppaint)">${back}</g>`;
    return {defs:defs+pdefs,under,ground:'',rootsUnder:`<g class="art">${rts}${trunk}</g>`,roots:'',brs,over:lv};}
  if(st==='paper'){
    const layers=[['#5f9a63',58,10],['#7fb46f',44,0],['#a3cc84',30,-8]];let canopy='';
    layers.forEach(([c,pad,dy],li)=>{let g='';top.forEach(v=>{g+=`<circle cx="${f(v.x)}" cy="${f(v.y+dy)}" r="${f(v.r+pad)}"/>`;});TBR.filter(b=>b.w>=8&&b.w<20).forEach(b=>{[.45,.75].forEach(t=>{const [x,y]=qpt(b,t);g+=`<circle cx="${f(x)}" cy="${f(y+dy)}" r="${pad+6}"/>`;});});
      canopy+=`<g fill="${c}" filter="url(#pshadow)">${g}</g>`;});
    under=`<g class="art">${canopy}</g>`;
    ground=`<g class="art" filter="url(#pshadow)"><path d="M${X0} 1384 Q915 1200 ${X1} 1384 L${X1} ${gb} L${X0} ${gb}Z" fill="#8fbf74"/><path d="M${X0} 1420 Q${X0+400} 1330 915 1410 T${X1} 1400 L${X1} ${gb} L${X0} ${gb}Z" fill="#76ad62"/></g>`;
    let lv='';const lg=['#3f7d4a','#4f9256','#6aa95c'];TBR.forEach(b=>{if(b.w<3)return;const n=b.w>=20?4:b.w>=8?3:1;for(let i=0;i<n;i++){const t=.25+rnd()*.7,[x,y]=qpt(b,t),ang=Math.atan2(b.y2-b.y1,b.x2-b.x1)*180/Math.PI+(rnd()<.5?55:-55),s=.9+rnd()*.5;
      lv+=`<path class="deco" d="${LEAFP}" fill="${lg[Math.floor(rnd()*3)]}" style="--d:${dl(y,x)+150}ms" transform="translate(${f(x)} ${f(y)}) rotate(${ang.toFixed(0)}) scale(${s.toFixed(2)}) translate(6 0)"/>`;}});
    return {defs,under,ground,roots:`<g class="art">${roots}</g>`,brs:`<g filter="url(#pshadow)">${brs}</g>`,over:`<g filter="url(#pshadow)">${lv}</g>`};}
  return null;}
// painted textures are expensive to redraw while zooming: paint them once into a picture
const bakeCache={},bakePend={};let curBake=null;
let lastBake=Promise.resolve();
function bakeArt(art,html){
  const x0=TB.x0-500,y0=TB.y0-320,w=TB.x1-TB.x0+1000,h=Math.max(1410,TB.y1+30)+520-y0,sc=Math.min(.8,(innerWidth<700?2200:3400)/w),W=Math.round(w*sc),H=Math.round(h*sc);
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
/* ---------- growing the tree from the ground up ---------- */
const GROWT=2600;let GROWR=1400,growR=99999;
const growEase=u=>1-(1-u)*(1-u);                      // fast at first, gentle at the tips
function growDelay(x,y){const f=Math.min(1,Math.hypot(x-915,y-1300)/GROWR);return Math.round(GROWT*(1-Math.sqrt(1-f)));}
function growTree(onDone){const st=$('#tstage');
  // The painted canopy is one big picture. Re-clipping that picture every frame makes phones re-paint it and flicker,
  // so during the grow it is copied once onto a canvas and the widening circle is painted there instead.
  const im=$('#tbackimg');let cv=null,ctx=null,bmp=null,sx=1,cx=0,cy=0;
  const prep=async()=>{try{if(!im||!im.classList.contains('on')||!im.src)return;
    try{await im.decode();}catch(e){}
    const w=parseFloat(im.style.width),h=parseFloat(im.style.height),nw=im.naturalWidth,nh=im.naturalHeight;if(!w||!nw)return;
    const k=Math.min(1,(innerWidth<700?1400:2400)/nw),cw=Math.round(nw*k),ch=Math.round(nh*k);
    try{bmp=window.createImageBitmap?await createImageBitmap(im,{resizeWidth:cw,resizeHeight:ch}):im;}catch(e){bmp=im;}
    cv=document.createElement('canvas');cv.id='tgrowcv';cv.width=cw;cv.height=ch;
    Object.assign(cv.style,{position:'absolute',left:im.style.left,top:im.style.top,width:w+'px',height:h+'px',pointerEvents:'none'});
    ctx=cv.getContext('2d');sx=cw/w;cx=(915-parseFloat(im.style.left))*sx;cy=(1300-parseFloat(im.style.top))*sx;
    im.parentNode.insertBefore(cv,im);im.style.visibility='hidden';}finally{preparing=0;}};
  const paint=r=>{if(!ctx)return;ctx.clearRect(0,0,cv.width,cv.height);if(r<=0)return;ctx.save();ctx.beginPath();ctx.arc(cx,cy,r*sx,0,Math.PI*2);ctx.clip();ctx.drawImage(bmp,0,0,cv.width,cv.height);ctx.restore();};
  const done=()=>{if(im)im.style.visibility='';if(cv){cv.remove();cv=null;}if(bmp&&bmp.close)bmp.close();};
  let started=0,preparing=0;
  const go=()=>{if(started++)return;if(im)im.style.visibility='hidden';paint(0);st.classList.add('growing');tw.classList.add('tgrow');tw.classList.remove('pre');const t0=performance.now();
  (function f(now){const u=Math.min(1,(now-t0)/GROWT);growR=u<1?GROWR*growEase(u):99999;const c=document.getElementById('growc');if(c)c.setAttribute('r',growR.toFixed(1));
    if(u<1){if(!ctx&&im&&im.classList.contains('on')&&!preparing){preparing=1;prep();}paint(growR);requestAnimationFrame(f);}else{done();setTimeout(()=>{st.classList.remove('intro','growing');onDone&&onDone();},500);setTimeout(()=>tw.classList.remove('tgrow'),1600);}})(t0);};
  const ready=lastBake.then(()=>{preparing=1;return prep();});
  ready.then(()=>setTimeout(go,0),()=>go());setTimeout(go,2200);}

// worn paper scroll: rough, slightly torn edges (fixed per name), aged colouring, curled ribbon ends
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
function scrollLabel(nm,r,fs,dx=0){const w=Math.max(50,nm.length*fs*.46+24),h=fs*1.6,y0=r+6,y1=y0+h,ym=(y0+y1)/2,L=-w/2,R=w/2,f=n=>n.toFixed(1);
  return `${dx?`<g transform="translate(${dx.toFixed(1)} 0)">`:''}${wornScroll(L,R,y0,y1,hsh(nm)||7,5,'scroll')}<text class="lname" y="${f(ym+fs*.34)}" font-size="${fs}">${esc(nm)}</text></g>${dx?'</g>':''}`;}
const SCROLLDEFS=`<linearGradient id="scrollG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4e6c4"/><stop offset=".55" stop-color="#ead7ab"/><stop offset="1" stop-color="#d7bd8a"/></linearGradient>
  <radialGradient id="scrollBurn" cx=".5" cy=".45" r=".62"><stop offset=".55" stop-color="#7a4f24" stop-opacity="0"/><stop offset=".86" stop-color="#7a4f24" stop-opacity=".22"/><stop offset="1" stop-color="#5a3414" stop-opacity=".55"/></radialGradient>
  <linearGradient id="scrollT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcc396"/><stop offset="1" stop-color="#b8975f"/></linearGradient>`;
function drawLeafTree(grow){
  const L=tLayout();TP=L.pos;TBR=L.br;
  const big=document.body.classList.contains('big'),BIGT={gk:1.15,aunt:1.18,asp:1.18,kid:1.2,ksp:1.2,ggp:1.15,gp:1.1,par:1.05,son:1,ssp:1};
  // name scrolls: where two would overlap, slide both people (photo and scroll together) apart, and let their branches follow
  if(SCROLLS){const bx=Object.entries(TP).map(([id,v])=>{const p=byId[id],fs=FS[v.t]*(big?BIGT[v.t]||1:1),nm=p.s.length>22?p.s.slice(0,21)+'…':p.s,w=Math.max(50,nm.length*fs*.46+24)+30,h=fs*1.6;return {id,x:v.x,dx:0,bx:[[v.y+v.r+6,v.y+v.r+6+h,w],[v.y-v.r-4,v.y+v.r+4,2*v.r+8]]};});
    // each person is a photo box and a scroll box that move together; any overlap pushes the two people apart sideways
    const ovl=(a,b)=>{let m=0;for(const [ay0,ay1,aw] of a.bx)for(const [by0,by1,bw] of b.bx){if(ay1<=by0||by1<=ay0)continue;const o=(aw+bw)/2+6-Math.abs(a.x+a.dx-b.x-b.dx);if(o>m)m=o;}return m;};
    for(let it=0;it<60;it++){let any=0;for(let i=0;i<bx.length;i++)for(let j=i+1;j<bx.length;j++){const a=bx[i],b=bx[j],ov=ovl(a,b);if(ov<=0)continue;
      const sg=(a.x+a.dx)<=(b.x+b.dx)?1:-1;a.dx-=sg*ov/2;b.dx+=sg*ov/2;any=1;}if(!any)break;}
    const old={};Object.entries(TP).forEach(([id,v])=>old[id]={x:v.x,y:v.y,r:v.r});
    bx.forEach(b=>{if(b.dx)TP[b.id]={...TP[b.id],x:TP[b.id].x+b.dx};});
    const shiftAt=(x,y)=>{let best=0,bd=1e9;for(const id in old){const o=old[id],d=Math.hypot(x-o.x,y-o.y);if(d<=o.r+6&&d<bd){bd=d;best=TP[id].x-o.x;}}return best;};
    TBR=TBR.map(b=>{const d1=shiftAt(b.x1,b.y1),d2=shiftAt(b.x2,b.y2);if(!d1&&!d2)return b;const n={...b,x1:b.x1+d1,x2:b.x2+d2,cx:b.cx+(d1+d2)/2};
      n.d=`M${n.x1.toFixed(1)} ${n.y1.toFixed(1)}Q${n.cx.toFixed(1)} ${n.cy.toFixed(1)} ${n.x2.toFixed(1)} ${n.y2.toFixed(1)}`;return n;});}
  const xs=[],ys=[];Object.values(TP).forEach(v=>{xs.push(v.x-v.r-70,v.x+v.r+70);ys.push(v.y-v.r-8,v.y+v.r+34);});TBR.forEach(b=>{xs.push(b.x1,b.x2);ys.push(b.y1,b.y2);});
  TB={x0:Math.min(...xs),y0:Math.min(...ys),x1:Math.max(...xs),y1:Math.max(...ys)};
  SKYG=null;if(TSTYLE==='ink'&&SCROLLS&&!PRINT&&!STAGE){const ct=Math.min(...Object.values(TP).filter(v=>v.y<1060).map(v=>v.y-v.r-95));SKYG={ct,by:ct-135};TB.y0=Math.min(TB.y0,SKYG.by-52);}
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
    return `<g class="leaf${id===sel?' sel':''}" data-id="${id}" tabindex="0" role="button" aria-label="${esc(p.n)}" transform="translate(${v.x.toFixed(1)},${v.y.toFixed(1)})"><g class="lin" style="--d:${dl(v.y,v.x)}ms"><circle class="glow" r="${r+3}"/><circle class="halo" r="${r+5}"/>${face}<circle class="ring" r="${r+1.5}" style="stroke:var(--${p.c})"/>${SCROLLS?scrollLabel(nm,r,fs,LDX[id]||0):`<text class="lname" y="${r+fs+6}" font-size="${fs}">${esc(nm)}</text>`}</g></g>`;}).join('');
  const art=treeArt(TSTYLE,dl);
  if(art&&PRINT){$('#tdefs').innerHTML=art.defs+defs;tw.innerHTML=`<g class="bake">${art.under+art.ground}</g>`+(art.rootsUnder||'')+art.brs+art.over+leaves;bakeArt(art,false);}
  else if(art){$('#tdefs').innerHTML=art.defs+defs+`<clipPath id="growclip" clipPathUnits="userSpaceOnUse"><circle id="growc" cx="915" cy="1300" r="${growR.toFixed(1)}"/></clipPath>`;
    tw.innerHTML=(art.planet||'')+`<g class="growg" clip-path="url(#growclip)">${(art.rootsUnder||'')+art.brs+art.over}</g>`+leaves+skyMarkup();bakeArt(art,true);renderNewest();}
  else{$('#tdefs').innerHTML=defs;tw.innerHTML=ground+brs+deco+leaves;}
  if(grow){tw.classList.add('tgrow');setTimeout(()=>tw.classList.remove('tgrow'),3400);}
  renderMemStars();
  if(storyFocus)tw.querySelectorAll('.leaf').forEach(c=>c.classList.toggle('dim',!storyFocus.includes(c.dataset.id)));
}
/* stage size is cached so dragging never forces the browser to re-measure the page */
$('#tstage').addEventListener('scroll',e=>{const t=e.currentTarget;if(t.scrollTop||t.scrollLeft){t.scrollTop=0;t.scrollLeft=0;}});
let TSZ={w:0,h:0};const tsz=()=>{if(!TSZ.w){const s=$('#tstage');TSZ={w:s.clientWidth,h:s.clientHeight};}return TSZ;};
new ResizeObserver(()=>{const s=$('#tstage');TSZ={w:s.clientWidth,h:s.clientHeight};if(tw.childElementCount&&!G)tApply(false);}).observe($('#tstage'));
function tClamp(){const r={width:tsz().w,height:tsz().h};if(!r.width||!(TB.x1>TB.x0))return;const W=r.width,H=r.height,bw=TB.x1-TB.x0,bh=TB.y1-TB.y0;
  const kmin=Math.min(W/bw,H/bh)*.5;if(tv.k<kmin){const cx=W/2,cy=H/2;tv.x=cx-(cx-tv.x)*kmin/tv.k;tv.y=cy-(cy-tv.y)*kmin/tv.k;tv.k=kmin;}
  const k=tv.k;tv.x=Math.min(W*.6-TB.x0*k,Math.max(W*.4-TB.x1*k,tv.x));tv.y=Math.min(H*.55-TB.y0*k,Math.max(H*.5-(TB.y1+(PRINT?0:280))*k,tv.y));}
let SKYEL=null;
function sunLight(){if(SKY!=='day')return;const st=SKYEL||(SKYEL=$('#tstage .sky')),r={height:tsz().h};if(!st||!r.height)return;
  const H=r.height,sunY=H*(innerWidth<600?.62:.7),hz=tv.y+1272*tv.k,sz=Math.min(190,Math.max(110,innerWidth*.13));
  const up=Math.max(0,Math.min(1,(hz-sunY+sz*.15)/(sz*1.6)));
  st.style.setProperty('--sunup',up.toFixed(3));st.style.setProperty('--suny',(sunY/H*100).toFixed(1)+'%');}
const WL=[];const wl=()=>WL.length?WL:(WL.push($('#tback'),$('#tfront')),WL);
function tApply(anim){tClamp();sunLight();const T=`translate(${tv.x}px,${tv.y}px) scale(${tv.k})`;wl().forEach(e=>{if(e){e.classList.toggle('nomo',!anim);e.style.transform=T;}});
  const z=tsz();tw.classList.toggle('nomo',!anim);tw.style.transform=`translate(${tv.x+z.w*.4}px,${tv.y+z.h*.4}px) scale(${tv.k})`;tsvg.style.transform='';G=null;$('#tstage').classList.remove('moving');msScale();}
/* while a finger is dragging or pinching, move the already-drawn picture instead of redrawing the tree every frame */
let G=null,gRaf=0;
function gBegin(){if(G)return;G={...tv};$('#tstage').classList.add('moving');}
function gApply(){tClamp();if(!G){tApply(false);return;}let s=tv.k/G.k;
  // before the moving picture runs out of pre-drawn edge (or gets too blurry), redraw it at the new spot and carry on
  {const z=tsz(),dx=tv.x-G.x*s,dy=tv.y-G.y*s;if(Math.abs(dx)>z.w*.3||Math.abs(dy)>z.h*.3||s>1.6||s<.65){tApply(false);gBegin();s=1;}}
  tsvg.style.transform=`translate(${tv.x-G.x*s}px,${tv.y-G.y*s}px) scale(${s})`;const T=`translate(${tv.x}px,${tv.y}px) scale(${tv.k})`;wl().forEach(e=>{if(e){e.classList.add('nomo');e.style.transform=T;}});}
const gFrame=()=>{if(!gRaf)gRaf=requestAnimationFrame(()=>{gRaf=0;gApply();});};
function gEnd(){if(gRaf){cancelAnimationFrame(gRaf);gRaf=0;}if(G)tApply(false);}
function tBox(ids){const vs=(ids&&ids.length?ids:Object.keys(TP)).map(id=>TP[id]).filter(Boolean);if(!vs.length)return TB;
  return {x0:Math.min(...vs.map(v=>v.x-v.r-60)),x1:Math.max(...vs.map(v=>v.x+v.r+60)),y0:Math.min(...vs.map(v=>v.y-v.r-10)),y1:Math.max(...vs.map(v=>v.y+v.r+34))};}
function tFrame(ids,anim=true){const r=$('#tstage').getBoundingClientRect();if(!r.width)return;
  const SD=STAGE?stageDims(r.width,r.height):null,cap=$('#cap'),capH=cap.classList.contains('on')?cap.offsetHeight+24:0,top=SD?Math.max(60,SD.top,(()=>{const m=$('#marquee');return m?m.getBoundingClientRect().bottom-r.top+(SD.ph?62:10):0;})()):60,avail=r.height-capH-top-8-(SD?SD.bot+((st=>st?st.offsetHeight+10:0)($('#tstage>.tools'))):0),b=(ids&&ids.length)?tBox(ids):TB,w=b.x1-b.x0,h=b.y1-b.y0;
  const k=Math.max(.12,Math.min((r.width-36-(SD?SD.side*2:0))/w,avail/h,ids&&ids.length===1?1.5:1.2));
  tv.k=k;tv.x=r.width/2-(b.x0+b.x1)/2*k;tv.y=top+avail/2-(b.y0+b.y1)/2*k;
  // tall phone screens: sit the tree just under the sign instead of leaving a gap above it
  if(SD&&SD.ph&&!(ids&&ids.length===1))tv.y=Math.min(tv.y,top+12-TB.y0*k);tApply(anim);}
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
   if(e.type==='pointerup'&&moved<6){const hit=document.elementFromPoint(e.clientX,e.clientY),ms=hit?.closest('.tmstar');if(ms){openMem(ms);return;}const tn=hit?.closest('#tnew');if(tn){openNewest(tn);return;}const tc=hit?.closest('.tconst');if(tc){openConst(tc);return;}const c=document.elementFromPoint(e.clientX,e.clientY)?.closest('.leaf');if(c){select(c.dataset.id);if(e.pointerType!=='mouse'){showPop(c.dataset.id);popT=setTimeout(hidePop,2200);}}else{const rp=document.elementFromPoint(e.clientX,e.clientY)?.closest('.rootpin');if(rp)showPlace(rp,true);else document.body.classList.remove('pdrawer');}}};
 tsvg.addEventListener('pointerup',up);tsvg.addEventListener('pointercancel',up);
 tsvg.addEventListener('wheel',e=>{e.preventDefault();const r=$('#tstage').getBoundingClientRect();tZoom(e.deltaY<0?1.12:1/1.12,e.clientX-r.left,e.clientY-r.top);},{passive:false});
 tsvg.addEventListener('dblclick',e=>{const r=$('#tstage').getBoundingClientRect();tZoom(1.8,e.clientX-r.left,e.clientY-r.top);});
 tsvg.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const tn=e.target.closest?.('#tnew'),tc=e.target.closest?.('.tconst');if(tn||tc){e.preventDefault();tn?openNewest(tn):openConst(tc);return;}}const ms=e.target.closest?.('.tmstar');if(ms&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openMem(ms);return;}const c=e.target.closest?.('.leaf');if(c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();select(c.dataset.id);}});}
$('#tzin').onclick=()=>tZoom(1.3);$('#tzout').onclick=()=>tZoom(1/1.3);$('#tfit').onclick=()=>{tTouched=1;tFit();};
$('#q').addEventListener('change',e=>{const v=e.target.value.toLowerCase().trim();const p=P.find(p=>p.n.toLowerCase()===v)||P.find(p=>p.n.toLowerCase().includes(v));if(p){select(p.id);tFocus(p.id);}});


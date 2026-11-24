/* ---------- shared helpers and state ---------- */
const MAP=__MAP__;
// preview.html: the painted tree and hill (Gemini artwork) instead of the drawn ones
const ART=__ART__;const HANG=ART&&(__HANG__||/[?&]hang\b/.test(location.search));// preview: lanterns hang from the branches
if(ART)document.documentElement.classList.add('art');
const $=s=>document.querySelector(s);
// touch screens (phones and tablets) get the lighter graphics paths: Android tablets ran out of graphics memory on the desktop ones
const TOUCH=matchMedia('(pointer:coarse)').matches;document.documentElement.classList.toggle('touch',TOUCH);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let myName=(()=>{try{return localStorage.getItem('myname')||''}catch(e){return ''}})();
const whoOf=c=>c.from||names[c.by]||'Family';
// traditions and recipes belong to the whole family and live in the keepsake chest (old answers to the retired q10 count as traditions)
// (until the backend is redeployed it saves them as 'story' with pid 'family': a recipe is the one with ingredients in note)
const isRecipe=c=>c.type==='recipe'||(c.pid==='family'&&c.type!=='tradition'&&!!c.note),isTrad=c=>c.type==='tradition'||(c.type==='answer'&&c.q==='q10')||(c.pid==='family'&&!isRecipe(c)),isKeep=c=>isTrad(c)||isRecipe(c);
let P=[],byId={},sel='mat',contribs=[],db=null,user=null,me=null,canWrite=false,isEditor=false,assets=null,names={},photo={};
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

function build(){
  P=BASE.map(p=>({...p,par:p.par?[...p.par]:[]}));byId=Object.fromEntries(P.map(p=>[p.id,p]));
  for(const c of contribs.filter(c=>c.type==='person'&&c.name&&byId[c.of])){
    const of=byId[c.of],id='c_'+c.id;
    const np={id,n:c.name,s:c.name,g:of.g,ord:50,par:[],b:c.born||'',d:c.died||'',living:!!c.living,c:'family',added:1,
      f:[['Added by family',c.rel==='parent'?'Parent of '+of.n:c.rel==='child'?'Child of '+of.n:c.rel==='spouse'?'Spouse of '+of.n:'Brother or sister of '+of.n,'family',[]]]};
    if(c.note)np.story=c.note;
    if(c.rel==='parent'){np.g=of.g+1;if(of.par.length<2)of.par.push(id);const o=of.par.find(x=>x!==id&&byId[x]);if(o&&!byId[o].sp){np.sp=o;byId[o].sp=id;}}
    else if(c.rel==='child'){np.g=of.g-1;np.par=[of.id];if(of.sp)np.par.push(of.sp);}
    else if(c.rel==='spouse'){if(!of.sp){of.sp=id;np.sp=of.id;}}
    else{np.par=[...of.par];}
    P.push(np);byId[id]=np;
  }
  photo={};for(const k in PHOTOS)photo[k]=PHOTOS[k].p;
  contribs.filter(c=>c.type==='photo'&&c.asset&&c.portrait===true).sort((a,b)=>(a.at||0)-(b.at||0)).forEach(c=>{photo[c.pid]=assetUrl(c.asset);});
}


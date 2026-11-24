// Runs Code.gs in Node with mocks that behave like Apps Script.
const fs=require('fs'),vm=require('vm'),crypto=require('crypto'),assert=require('assert');
function make(){
  const props={},rows=[],cache={};let files=[];
  const range=(r,c,nr,nc)=>({
    getValues:()=>Array.from({length:nr},(_,i)=>Array.from({length:nc},(_,j)=>(rows[r-1+i]||[])[c-1+j]??'')),
    getValue:()=>(rows[r-1]||[])[c-1]??'',
    setValue:v=>{(rows[r-1]=rows[r-1]||[])[c-1]=v;return range(r,c,nr,nc);},  // Range.setValue returns the Range
    setFontWeight:()=>range(r,c,nr,nc)});
  const sheet={getLastRow:()=>rows.length,getLastColumn:()=>rows[0]?rows[0].filter(v=>v!==''&&v!=null).length:0,appendRow:a=>{rows.push(a.slice());},setFrozenRows:()=>{},getRange:range};
  let has=false;
  const ctx={
    SpreadsheetApp:{getActive:()=>({getSheetByName:()=>has?sheet:null,insertSheet:()=>{has=true;return sheet;}}),getUi:()=>{throw new Error('no ui');}},
    PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]??null,setProperty:(k,v)=>{props[k]=v;}})},
    DriveApp:{Access:{ANYONE_WITH_LINK:1},Permission:{VIEW:1},getFolderById:()=>folder,createFolder:()=>folder,
      getFileById:id=>{const f=files.find(x=>x.id===id)||extFiles[id];if(!f)throw new Error('no file');return f;}},
    CacheService:{getScriptCache:()=>({get:k=>cache[k]??null,put:(k,v)=>{cache[k]=String(v);}})},
    LockService:{getScriptLock:()=>({waitLock:()=>{},releaseLock:()=>{}})},
    Utilities:{getUuid:()=>crypto.randomUUID(),base64Decode:s=>Array.from(Buffer.from(s,'base64')),base64Encode:a=>Buffer.from(a.map(x=>(x+256)%256)).toString('base64'),newBlob:(b,m,n)=>({b,m,n}),
      DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},
      computeDigest:(alg,s)=>Array.from(crypto.createHash('sha256').update(s,'utf8').digest()).map(x=>x>127?x-256:x)},  // Java signed bytes
    ContentService:{MimeType:{JSON:'json'},createTextOutput:t=>({setMimeType:()=>({text:t})})},
    console};
  const parentsOf=p=>()=>{let i=0;return {hasNext:()=>i<1,next:()=>(i++,p)};};
  const folder={getId:()=>'F1',createFile:blob=>{const f={id:'D'+files.length,blob,shared:false,getId(){return this.id;},setSharing(){this.shared=true;},
    getParents:parentsOf(folder),getBlob:()=>({getBytes:()=>blob.b,getContentType:()=>blob.m})};files.push(f);return f;}};
  const other={getId:()=>'OTHER'};const extFiles={X1:{getParents:parentsOf(other),getBlob:()=>({getBytes:()=>[1,2],getContentType:()=>'audio/webm'})}};
  vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../backend/Code.gs','utf8'),ctx);
  return {ctx,props,rows,cache,files:()=>files};
}
const post=(t,o)=>JSON.parse(t.ctx.doPost({postData:{contents:JSON.stringify(o)}}).text);
const get=t=>JSON.parse(t.ctx.doGet({}).text);
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
let n=0;const test=(name,f)=>{f();n++;console.log('ok -',name);};

test('setup creates header and placeholder code',()=>{const t=make();t.ctx.setup();assert.equal(t.rows[0][0],'id');assert.equal(t.props.FAMILY_CODE,'change-me');});
test('placeholder code never accepted',()=>{const t=make();t.ctx.setup();assert.equal(post(t,{action:'check',code:'change-me'}).ok,false);});
test('passcode check is case/space-insensitive',()=>{const t=make();t.ctx.setup();t.props.FAMILY_CODE='wolfie';assert.equal(post(t,{action:'check',code:'  WOLFIE '}).ok,true);assert.equal(post(t,{action:'check',code:'nope'}).ok,false);});
test('wrong code cannot add',()=>{const t=make();t.ctx.setup();t.props.FAMILY_CODE='wolfie';const r=post(t,{action:'add',code:'x',doc:{type:'story',pid:'jack',text:'hi'}});assert.equal(r.ok,false);assert.equal(get(t).items.length,0);});
test('add memory then list it',()=>{const t=make();t.ctx.setup();t.props.FAMILY_CODE='wolfie';
  const r=post(t,{action:'add',code:'Wolfie',devId:'dev1',doc:{type:'story',pid:'jack',text:'Navy songs',from:'Aunt Eileen'}});assert.equal(r.ok,true);
  const it=get(t).items;assert.equal(it.length,1);assert.equal(it[0].from,'Aunt Eileen');assert.equal(it[0].text,'Navy songs');assert.equal(it[0].pid,'jack');});
test('photo saved to Drive, shared, and memory becomes photo',()=>{const t=make();t.ctx.setup();t.props.FAMILY_CODE='wolfie';
  post(t,{action:'add',code:'wolfie',devId:'d',doc:{type:'story',pid:'ed',text:'Boat'},photo:{b64:Buffer.from('abc').toString('base64'),mime:'image/jpeg',name:'a.jpg'}});
  const it=get(t).items[0];assert.equal(it.type,'photo');assert.ok(it.asset);assert.equal(t.files()[0].shared,true);assert.ok(!it.portrait);});
test('long text is clipped',()=>{const t=make();t.ctx.setup();t.props.FAMILY_CODE='wolfie';post(t,{action:'add',code:'wolfie',doc:{type:'story',pid:'a',text:'x'.repeat(9000)}});assert.equal(get(t).items[0].text.length,4000);});
test('unknown type falls back to story',()=>{const t=make();t.ctx.setup();t.props.FAMILY_CODE='wolfie';post(t,{action:'add',code:'wolfie',doc:{type:'evil',pid:'a',text:'t'}});assert.equal(get(t).items[0].type,'story');});
test('hidden rows are not listed',()=>{const t=make();t.ctx.setup();t.props.FAMILY_CODE='wolfie';post(t,{action:'add',code:'wolfie',doc:{type:'story',pid:'a',text:'t'}});t.rows[1][t.rows[0].indexOf('hidden')]='x';assert.equal(get(t).items.length,0);});
test('only the sharing device can remove',()=>{const t=make();t.ctx.setup();t.props.FAMILY_CODE='wolfie';const id=post(t,{action:'add',code:'wolfie',devId:'mine',doc:{type:'story',pid:'a',text:'t'}}).item.id;
  assert.equal(post(t,{action:'del',code:'wolfie',devId:'other',id}).ok,false);assert.equal(get(t).items.length,1);
  assert.equal(post(t,{action:'del',code:'wolfie',devId:'mine',id}).ok,true);assert.equal(get(t).items.length,0);});
test('device id is stored and shown only as a SHA-256 hash',()=>{const t=make();t.ctx.setup();t.props.FAMILY_CODE='wolfie';post(t,{action:'add',code:'wolfie',devId:'abc',doc:{type:'story',pid:'a',text:'t'}});
  assert.equal(get(t).items[0].by,sha('abc'));assert.ok(!JSON.stringify(t.rows).includes('"abc"'));});
test('knowing the public hash is not enough to remove a post',()=>{const t=make();t.ctx.setup();t.props.FAMILY_CODE='wolfie';const id=post(t,{action:'add',code:'wolfie',devId:'abc',doc:{type:'story',pid:'a',text:'t'}}).item.id;
  assert.equal(post(t,{action:'del',code:'wolfie',devId:sha('abc'),id}).ok,false);assert.equal(get(t).items.length,1);});
test('5 wrong passcodes lock that device, even with the right code',()=>{const t=make();t.ctx.setup();t.props.FAMILY_CODE='wolfie';
  for(let i=0;i<5;i++)assert.equal(post(t,{action:'check',code:'nope',devId:'d1'}).error,'bad_code');
  const r=post(t,{action:'check',code:'wolfie',devId:'d1'});assert.equal(r.ok,false);assert.equal(r.error,'locked');
  assert.equal(post(t,{action:'check',code:'wolfie',devId:'d2'}).ok,true);});
test('25 wrong passcodes across devices lock everyone',()=>{const t=make();t.ctx.setup();t.props.FAMILY_CODE='wolfie';
  for(let i=0;i<25;i++)post(t,{action:'check',code:'nope',devId:'x'+i});
  assert.equal(post(t,{action:'add',code:'wolfie',devId:'fresh',doc:{type:'story',pid:'a',text:'t'}}).error,'locked');});
test('voice memory saved to Drive (not shared publicly) and played back through the script',()=>{const t=make();t.ctx.setup();t.props.FAMILY_CODE='wolfie';
  const audio=Buffer.from('fake-voice').toString('base64');
  post(t,{action:'add',code:'wolfie',devId:'d',doc:{type:'story',pid:'ed',text:'',from:'Mom'},audio:{b64:audio,mime:'audio/webm;codecs=opus'}});
  const it=get(t).items[0];assert.ok(it.audio);const f=t.files().find(x=>x.id===it.audio);assert.equal(f.shared,false);assert.equal(f.blob.m,'audio/webm');
  const a=JSON.parse(t.ctx.doGet({parameter:{audio:it.audio}}).text);assert.equal(a.ok,true);assert.equal(Buffer.from(a.b64,'base64').toString(),'fake-voice');});
test('audio endpoint refuses files outside the uploads folder',()=>{const t=make();t.ctx.setup();assert.equal(JSON.parse(t.ctx.doGet({parameter:{audio:'X1'}}).text).ok,false);assert.equal(JSON.parse(t.ctx.doGet({parameter:{audio:'nope'}}).text).ok,false);});
test('an older sheet without the audio column gets it added at the end',()=>{const t=make();t.ctx.setup();t.props.FAMILY_CODE='wolfie';t.rows[0].pop();
  post(t,{action:'add',code:'wolfie',doc:{type:'story',pid:'a',text:'t'}});assert.equal(t.rows[0][18],'audio');assert.equal(get(t).items.length,1);});
test('bad JSON handled',()=>{const t=make();assert.equal(JSON.parse(t.ctx.doPost({postData:{contents:'{'}}).text).ok,false);});
test('traditions and recipes are saved as their own kinds',()=>{const t=make();t.ctx.setup();t.props.FAMILY_CODE='wolfie';
  post(t,{action:'add',code:'wolfie',devId:'d',doc:{type:'tradition',pid:'family',name:'Christmas Eve gumbo',text:'Every year...'}});
  post(t,{action:'add',code:'wolfie',devId:'d',doc:{type:'recipe',pid:'family',name:'Pound cake',note:'2 cups flour',text:'Bake at 325.'}});
  const it=get(t).items;assert.equal(it[0].type,'tradition');assert.equal(it[0].name,'Christmas Eve gumbo');assert.equal(it[1].type,'recipe');assert.equal(it[1].note,'2 cups flour');});
test('a recipe photo stays a recipe',()=>{const t=make();t.ctx.setup();t.props.FAMILY_CODE='wolfie';
  post(t,{action:'add',code:'wolfie',devId:'d',doc:{type:'recipe',pid:'family',name:'Cake',text:'x'},photo:{b64:Buffer.from('abc').toString('base64'),mime:'image/jpeg',name:'c.jpg'}});
  const it=get(t).items[0];assert.equal(it.type,'recipe');assert.ok(it.asset);});
test('only the sharing device can edit, and only the words',()=>{const t=make();t.ctx.setup();t.props.FAMILY_CODE='wolfie';
  const id=post(t,{action:'add',code:'wolfie',devId:'mine',doc:{type:'recipe',pid:'family',name:'Cake',note:'flour',text:'Bake.',from:'Mat'}}).item.id;
  assert.equal(post(t,{action:'edit',code:'wolfie',devId:'other',id,doc:{text:'hacked'}}).ok,false);assert.equal(get(t).items[0].text,'Bake.');
  assert.equal(post(t,{action:'edit',code:'wolfie',devId:'mine',id,doc:{name:'Pound cake',note:'2 cups flour',text:'Bake at 325.',from:'Mat G',type:'person',pid:'x'}}).ok,true);
  const it=get(t).items[0];assert.equal(it.name,'Pound cake');assert.equal(it.note,'2 cups flour');assert.equal(it.text,'Bake at 325.');assert.equal(it.from,'Mat G');assert.equal(it.type,'recipe');assert.equal(it.pid,'family');});
test('edit needs the passcode and cannot touch removed rows',()=>{const t=make();t.ctx.setup();t.props.FAMILY_CODE='wolfie';
  const id=post(t,{action:'add',code:'wolfie',devId:'mine',doc:{type:'story',pid:'a',text:'t'}}).item.id;
  assert.equal(post(t,{action:'edit',code:'nope',devId:'mine',id,doc:{text:'x'}}).ok,false);
  post(t,{action:'del',code:'wolfie',devId:'mine',id});assert.equal(post(t,{action:'edit',code:'wolfie',devId:'mine',id,doc:{text:'x'}}).ok,false);});
console.log(n+' passed');

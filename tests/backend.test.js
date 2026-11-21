// Runs Code.gs in Node with mocks that behave like Apps Script.
const fs=require('fs'),vm=require('vm'),crypto=require('crypto'),assert=require('assert');
function make(){
  const props={},rows=[];let files=[];
  const range=(r,c,nr,nc)=>({
    getValues:()=>Array.from({length:nr},(_,i)=>Array.from({length:nc},(_,j)=>(rows[r-1+i]||[])[c-1+j]??'')),
    getValue:()=>(rows[r-1]||[])[c-1]??'',
    setValue:v=>{rows[r-1][c-1]=v;},
    setFontWeight:()=>{}});
  const sheet={getLastRow:()=>rows.length,getLastColumn:()=>rows[0]?rows[0].length:0,appendRow:a=>{rows.push(a.slice());},setFrozenRows:()=>{},getRange:range};
  let has=false;
  const ctx={
    SpreadsheetApp:{getActive:()=>({getSheetByName:()=>has?sheet:null,insertSheet:()=>{has=true;return sheet;}}),getUi:()=>{throw new Error('no ui');}},
    PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]??null,setProperty:(k,v)=>{props[k]=v;}})},
    DriveApp:{Access:{ANYONE_WITH_LINK:1},Permission:{VIEW:1},getFolderById:()=>folder,createFolder:()=>folder},
    LockService:{getScriptLock:()=>({waitLock:()=>{},releaseLock:()=>{}})},
    Utilities:{getUuid:()=>crypto.randomUUID(),base64Decode:s=>Array.from(Buffer.from(s,'base64')),newBlob:(b,m,n)=>({b,m,n})},
    ContentService:{MimeType:{JSON:'json'},createTextOutput:t=>({setMimeType:()=>({text:t})})},
    console};
  const folder={getId:()=>'F1',createFile:blob=>{const f={id:'D'+files.length,blob,shared:false,getId(){return this.id;},setSharing(){this.shared=true;}};files.push(f);return f;}};
  vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../backend/Code.gs','utf8'),ctx);
  return {ctx,props,rows,files:()=>files};
}
const post=(t,o)=>JSON.parse(t.ctx.doPost({postData:{contents:JSON.stringify(o)}}).text);
const get=t=>JSON.parse(t.ctx.doGet({}).text);
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
test('device id is not exposed publicly? (by is returned for own-delete check)',()=>{const t=make();t.ctx.setup();t.props.FAMILY_CODE='wolfie';post(t,{action:'add',code:'wolfie',devId:'abc',doc:{type:'story',pid:'a',text:'t'}});assert.equal(get(t).items[0].by,'abc');});
test('bad JSON handled',()=>{const t=make();assert.equal(JSON.parse(t.ctx.doPost({postData:{contents:'{'}}).text).ok,false);});
console.log(n+' passed');

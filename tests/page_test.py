"""Builds mock.html (fake backend URL) and loads it with a fake Apps Script backend and checks the passcode + memory flow.
Run: python3 tests/page_test.py (serves this folder on :8766)."""
import json,subprocess,time,sys,os
from playwright.sync_api import sync_playwright
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
subprocess.run([sys.executable,'build.py','--api','https://mock.test/exec','--out','mock.html'],check=True)
srv=subprocess.Popen([sys.executable,'-m','http.server','8766'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
import hashlib,base64
items=[];CODE='wolfie';fails=[];audio_store={};bad={}
sha=lambda x:hashlib.sha256(x.encode()).hexdigest()
def check(name,cond):
  print(('ok - ' if cond else 'FAIL - ')+name)
  if not cond:fails.append(name)
def handle(route,req):
  h={'Access-Control-Allow-Origin':'*','Content-Type':'application/json'}
  if req.method=='GET':
    if 'audio=' in req.url:
      aid=req.url.split('audio=')[1].split('&')[0];a=audio_store.get(aid)
      return route.fulfill(status=200,headers=h,body=json.dumps({'ok':bool(a),'mime':a and a['mime'],'b64':a and a['b64']}))
    return route.fulfill(status=200,headers=h,body=json.dumps({'ok':True,'items':items}))
  o=json.loads(req.post_data or '{}');ok=(o.get('code','').strip().lower()==CODE);d=sha(o.get('devId',''))
  if bad.get(d,0)>=5:return route.fulfill(status=200,headers=h,body=json.dumps({'ok':False,'error':'locked'}))
  if not ok:bad[d]=bad.get(d,0)+1
  if o.get('action')=='check':return route.fulfill(status=200,headers=h,body=json.dumps({'ok':ok}))
  if not ok:return route.fulfill(status=200,headers=h,body=json.dumps({'ok':False,'error':'bad_code'}))
  if o['action']=='add':
    d=o['doc'];it={'id':'i%d'%len(items),'type':d.get('type','story'),'pid':d.get('pid',''),'from':d.get('from',''),'at':int(time.time()*1000),'text':d.get('text',''),'by':sha(o.get('devId',''))}
    if o.get('audio'):aid='A%d'%len(audio_store);audio_store[aid]={'b64':o['audio']['b64'],'mime':o['audio']['mime'].split(';')[0]};it['audio']=aid
    if d.get('q'):it['q']=d['q']
    if o.get('photo'):it['type']='photo';it['asset']='DRIVEID'
    items.append(it);return route.fulfill(status=200,headers=h,body=json.dumps({'ok':True,'item':it}))
  if o['action']=='del':
    for it in list(items):
      if it['id']==o['id'] and it['by']==sha(o['devId']):items.remove(it);return route.fulfill(status=200,headers=h,body='{"ok":true}')
    return route.fulfill(status=200,headers=h,body='{"ok":false}')
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--autoplay-policy=no-user-gesture-required'])
  pg=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
  errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.route('https://mock.test/**',handle)
  pg.goto('http://localhost:8766/mock.html?sky=night');pg.wait_for_timeout(1200)
  check('noindex tag present',pg.evaluate("!!document.querySelector('meta[name=robots][content*=noindex]')"))
  pg.click('#skip');pg.wait_for_timeout(5000);pg.click('#tFull');pg.wait_for_timeout(300)
  pg.evaluate("select('jack')");pg.wait_for_timeout(300)
  check('share button shown',pg.is_visible('#panel [data-share]'))
  check('photo options shown',pg.locator('#panel .addph').count()==1 and pg.locator('#panel details[data-k=photo]').count()==1)
  pg.fill('#panel form[data-f=story] textarea','He whistled Navy songs.');pg.fill('#panel form[data-f=story] input[name=from]','Aunt Eileen')
  pg.click('#panel form[data-f=story] button.pri');pg.wait_for_timeout(500)
  check('passcode dialog opens',pg.is_visible('#codeDlg'))
  pg.screenshot(path='/tmp/gh-code.png')
  pg.fill('#codeIn','nope');pg.click('#codeOk');pg.wait_for_timeout(500)
  check('wrong code rejected',pg.is_visible('#codeDlg') and 'match' in pg.inner_text('#codeErr'))
  pg.fill('#codeIn','  Wolfie ');pg.click('#codeOk');pg.wait_for_timeout(1200)
  check('memory saved',len(items)==1 and items[0]['from']=='Aunt Eileen')
  check('memory shown on card','He whistled Navy songs.' in pg.inner_text('#panel') and 'From Aunt Eileen' in pg.inner_text('#panel'))
  check('memory star appears',pg.evaluate("document.querySelectorAll('.mstar').length")==1)
  # second save: no passcode prompt
  pg.evaluate("location.hash='help'");pg.wait_for_timeout(400)
  pg.fill('#asks form textarea','Cousins raised him.');pg.click('#asks form button.pri');pg.wait_for_timeout(1000)
  check('answer saved without asking again',len(items)==2 and items[1]['type']=='answer')
  pg.evaluate("location.hash='tree'");pg.wait_for_timeout(400);pg.evaluate("select('jack')");pg.wait_for_timeout(300)
  pg.click('#panel [data-del]');pg.wait_for_timeout(1000)
  check('sharer can remove own memory',len(items)==1)
  # voice memory: record ~2 s with the fake microphone, save with no text, play it back
  pg.evaluate("select('ed')");pg.wait_for_timeout(300)
  check('record button shown',pg.is_visible('#panel [data-rec]'))
  pg.click('#panel [data-rec]');pg.wait_for_timeout(2300);pg.click('#panel [data-rec]');pg.wait_for_timeout(600)
  check('recording preview shown',pg.is_visible('#panel .rprev'))
  pg.screenshot(path='/tmp/gh-voice-form.png')
  pg.fill('#panel form[data-f=story] input[name=from]','Mom');pg.click('#panel form[data-f=story] button.pri');pg.wait_for_timeout(1500)
  check('voice memory saved without text',len(audio_store)==1 and items[-1].get('audio') and items[-1]['text']=='')
  check('saved audio is real (non-empty)',len(base64.b64decode(list(audio_store.values())[0]['b64']))>1000)
  pg.evaluate("document.querySelector('#panel .vplay').scrollIntoView()");pg.click('#panel .vplay');pg.wait_for_timeout(1200)
  check('voice memory plays',pg.inner_text('#panel .vplay').startswith('❚❚') or 'voice' in pg.inner_text('#panel .vplay').lower())
  pg.screenshot(path='/tmp/gh-voice-card.png')
  check('own post shows remove link (hash match)',pg.locator('#panel [data-del]').count()>=1)
  # lockout: a new device guessing wrong 5 times is locked
  pg.evaluate("localStorage.setItem('famcode','');localStorage.setItem('devid','attacker')");pg.reload();pg.wait_for_timeout(1500)
  pg.click('#skip');pg.wait_for_timeout(4000);pg.evaluate("select('jack')");pg.wait_for_timeout(300)
  pg.fill('#panel form[data-f=story] textarea','spam');pg.click('#panel form[data-f=story] button.pri');pg.wait_for_timeout(500)
  for i in range(6):
    pg.fill('#codeIn','guess%d'%i);pg.click('#codeOk');pg.wait_for_timeout(400)
    if not pg.is_visible('#codeDlg'):break
  pg.wait_for_timeout(500)
  check('locked message after too many wrong tries','15 minutes' in (pg.inner_text('#codeErr') if pg.is_visible('#codeDlg') else pg.inner_text('#fmsg')))
  check('no page errors',not errs)
  if errs:print(errs)
finally:
  srv.terminate()
print('FAILED' if fails else 'all passed')
sys.exit(1 if fails else 0)

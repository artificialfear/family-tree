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
    for k in ('name','note'):
      if d.get(k):it[k]=d[k]
    if o.get('photo'):
      it['asset']='DRIVEID'
      if it['type']=='story':it['type']='photo'
    items.append(it);return route.fulfill(status=200,headers=h,body=json.dumps({'ok':True,'item':it}))
  if o['action']=='edit':
    for it in items:
      if it['id']==o['id'] and it['by']==sha(o['devId']):
        for k in ('text','name','note','from'):
          if k in o['doc']:it[k]=o['doc'][k]
        return route.fulfill(status=200,headers=h,body='{"ok":true}')
    return route.fulfill(status=200,headers=h,body='{"ok":false}')
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
  pg.click('#skip');pg.wait_for_timeout(5000)
  check('stays full screen on the stage',pg.evaluate("document.body.classList.contains('tfull')") and not pg.is_visible('#tFull'))
  pg.click('#tProg');pg.wait_for_timeout(200);check('program menu opens',pg.is_visible('#prog a[href="#places"]'))
  pg.click('#prog a[href="#timeline"]');pg.wait_for_timeout(500)
  check('section opens over the stage',pg.evaluate("location.hash==='#timeline'&&document.body.classList.contains('tfull')&&document.querySelector('#v-timeline').classList.contains('sheet')"))
  pg.click('#v-timeline .shclose');pg.wait_for_timeout(400);check('back to the tree',pg.evaluate("location.hash==='#tree'&&!document.body.classList.contains('sheeton')"))
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
  check('memory of Jack (passed) grows as a flower, no memory lanterns',pg.evaluate("document.querySelectorAll('.mflower').length")==1 and pg.evaluate("document.querySelectorAll('.mlantern').length")==0)
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
  # keepsake chest: recipes and traditions, the old tradition question, editing
  items.append({'id':'legacyq10','type':'answer','q':'q10','pid':'renee','from':'Mat','at':1,'text':'Christmas Eve gumbo every year','by':'someoneelse'})
  pg.evaluate("location.hash='keepsakes'");pg.evaluate("document.dispatchEvent(new Event('visibilitychange'))");pg.wait_for_timeout(1000)
  check('chest heading is capitalized',pg.inner_text('#v-keepsakes h2')=='The Keepsake Chest')
  check('old tradition answer shows in the chest','Christmas Eve gumbo' in pg.inner_text('#ktrads'))
  check('old tradition answer is not a flower or lantern',pg.evaluate("[...document.querySelectorAll('.mflower,.mlantern')].every(e=>e.dataset.c!=='legacyq10')"))
  pg.evaluate("select('renee')");pg.wait_for_timeout(300)
  check("old tradition answer is not on Renee's card",'Christmas Eve gumbo' not in pg.inner_text('#panel'))
  check('someone else\'s tradition has no edit button',pg.locator('#ktrads [data-kedit]').count()==0)
  pg.click('#v-keepsakes details[data-k=recipe] summary')
  pg.fill('#v-keepsakes form[data-f=recipe] input[name=name]','Pound cake');pg.fill('#v-keepsakes form[data-f=recipe] textarea[name=note]','2 cups flour\n1 cup butter')
  pg.fill('#v-keepsakes form[data-f=recipe] textarea[name=text]','Cream the butter.\nBake at 325.');pg.fill('#v-keepsakes form[data-f=recipe] input[name=from]','Renee')
  pg.click('#v-keepsakes form[data-f=recipe] button.pri');pg.wait_for_timeout(1200)
  rc=[i for i in items if i['type']=='recipe']
  check('recipe saved for the whole family',len(rc)==1 and rc[0]['pid']=='family' and rc[0]['name']=='Pound cake' and rc[0]['note'].startswith('2 cups'))
  check('recipe shows in the chest','Pound cake' in pg.inner_text('#krecipes'))
  pg.click('#krecipes details summary');pg.wait_for_timeout(200)
  check('recipe lists ingredients and steps',pg.locator('#krecipes li').count()==4)
  pg.click('#krecipes [data-kedit]');pg.wait_for_timeout(200)
  pg.fill('#krecipes form.eform input[name=name]','Grandma Renee\'s pound cake');pg.click('#krecipes form.eform button.pri');pg.wait_for_timeout(1200)
  check('sharer can edit their recipe',rc[0]['name']=="Grandma Renee's pound cake" and "Grandma Renee's pound cake" in pg.inner_text('#krecipes'))
  pg.click('#v-keepsakes details[data-k=tradition] summary')
  pg.fill('#v-keepsakes form[data-f=tradition] input[name=name]','Thanksgiving hands');pg.fill('#v-keepsakes form[data-f=tradition] textarea[name=text]','Everyone traces a turkey.')
  pg.click('#v-keepsakes form[data-f=tradition] button.pri');pg.wait_for_timeout(1200)
  check('tradition saved and shown',any(i['type']=='tradition' and i['name']=='Thanksgiving hands' for i in items) and 'Thanksgiving hands' in pg.inner_text('#ktrads'))
  check('recipes and traditions are not flowers or lanterns',pg.evaluate("[...document.querySelectorAll('.mflower,.mlantern')].length")==sum(1 for i in items if i['type'] in ('story','photo','answer') and i.get('q')!='q10'))
  pg.evaluate("location.hash='tree'");pg.evaluate("select('jack')");pg.wait_for_timeout(300)
  pg.click('#panel [data-edit]');pg.wait_for_timeout(200);pg.fill('#panel form.eform textarea','He whistled Navy songs every morning.');pg.click('#panel form.eform button.pri');pg.wait_for_timeout(1200)
  check('sharer can edit their memory','every morning' in pg.inner_text('#panel'))
  pg.screenshot(path='/tmp/gh-chest.png')
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

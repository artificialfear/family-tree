"""Loads the built page with a fake Apps Script backend and checks the passcode + memory flow.
Run: python3 tests/page_test.py (serves this folder on :8766)."""
import json,subprocess,time,sys,os
from playwright.sync_api import sync_playwright
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
srv=subprocess.Popen([sys.executable,'-m','http.server','8766'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
items=[];CODE='wolfie';fails=[]
def check(name,cond):
  print(('ok - ' if cond else 'FAIL - ')+name)
  if not cond:fails.append(name)
def handle(route,req):
  h={'Access-Control-Allow-Origin':'*','Content-Type':'application/json'}
  if req.method=='GET':return route.fulfill(status=200,headers=h,body=json.dumps({'ok':True,'items':items}))
  o=json.loads(req.post_data or '{}');ok=(o.get('code','').strip().lower()==CODE)
  if o.get('action')=='check':return route.fulfill(status=200,headers=h,body=json.dumps({'ok':ok}))
  if not ok:return route.fulfill(status=200,headers=h,body=json.dumps({'ok':False,'error':'bad_code'}))
  if o['action']=='add':
    d=o['doc'];it={'id':'i%d'%len(items),'type':d.get('type','story'),'pid':d.get('pid',''),'from':d.get('from',''),'at':int(time.time()*1000),'text':d.get('text',''),'by':o.get('devId','')}
    if d.get('q'):it['q']=d['q']
    if o.get('photo'):it['type']='photo';it['asset']='DRIVEID'
    items.append(it);return route.fulfill(status=200,headers=h,body=json.dumps({'ok':True,'item':it}))
  if o['action']=='del':
    for it in list(items):
      if it['id']==o['id'] and it['by']==o['devId']:items.remove(it);return route.fulfill(status=200,headers=h,body='{"ok":true}')
    return route.fulfill(status=200,headers=h,body='{"ok":false}')
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome')
  pg=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
  errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.route('https://mock.test/**',handle)
  pg.goto('http://localhost:8766/index.html?sky=night');pg.wait_for_timeout(1200)
  check('noindex tag present',pg.evaluate("!!document.querySelector('meta[name=robots][content*=noindex]')"))
  pg.click('#skip');pg.wait_for_timeout(5000);pg.click('#tFull');pg.wait_for_timeout(300)
  pg.evaluate("select('jack')");pg.wait_for_timeout(300)
  check('share button shown',pg.is_visible('#panel [data-share]'))
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
  check('no page errors',not errs)
  if errs:print(errs)
finally:
  srv.terminate()
print('FAILED' if fails else 'all passed')
sys.exit(1 if fails else 0)

#!/usr/bin/env python3
"""Build index.html from src/.

  src/index.html      page markup, with <!--CSS--> and <!--JS--> slots
  src/css/*.css       styles, joined in name order
  src/js/*.js         scripts, joined in name order (inside one block scope)
  src/mapdata.json    map shapes, replaces __MAP__
  src/api.txt         Apps Script /exec URL, replaces __API__ (empty = memories off)

Usage: python3 build.py [--api URL] [--out FILE] [--classic]
  The painted art (ART) is on by default (live since 2026-11-24). --classic builds the old drawn look.
  With no --out it writes index.html and preview.html (the same page, kept so old preview links still work).
"""
import argparse, glob, json, os
here = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument('--api'); ap.add_argument('--out'); ap.add_argument('--art', action='store_true'); ap.add_argument('--classic', action='store_true'); ap.add_argument('--hang', action='store_true')
a = ap.parse_args()
src = os.path.join(here, 'src')
read = lambda p: open(p, encoding='utf-8').read()
css = ''.join(read(p) for p in sorted(glob.glob(os.path.join(src, 'css', '*.css'))))
js = ''.join(read(p) for p in sorted(glob.glob(os.path.join(src, 'js', '*.js'))))
api = a.api if a.api is not None else read(os.path.join(src, 'api.txt')).strip()
mapdata = json.dumps(json.load(open(os.path.join(src, 'mapdata.json'))), separators=(',', ':'))
page = read(os.path.join(src, 'index.html'))
for slot in ('<!--CSS-->\n', '<!--JS-->\n'):
    assert page.count(slot) == 1, slot
page = page.replace('<!--CSS-->\n', css).replace('<!--JS-->\n', js)
for ph in ('__MAP__', '__API__', '__ART__'):
    assert page.count(ph) == 1, (ph, page.count(ph))
page = page.replace('__MAP__', mapdata).replace('__API__', json.dumps(api))
art = not a.classic
# preview.html tries out ideas before they go live (2026-11-24: lanterns hanging from the branches)
outs = [(a.out, art, True)] if a.out else [(os.path.join(here, 'index.html'), art, True), (os.path.join(here, 'preview.html'), art, True)]
for out, art, hang in outs:
    html = page.replace('__ART__', 'true' if art else 'false').replace('__HANG__', 'true' if hang else 'false')
    open(out, 'w', encoding='utf-8').write(html)
    print('built', os.path.relpath(out, here), len(html) // 1024, 'KB')

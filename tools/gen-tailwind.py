#!/usr/bin/env python3
"""Erzeugt src/tailwind.generated.css aus allen Klassen, die im Quelltext vorkommen.
Braucht Playwright mit Chrome (nur zum Erzeugen, nicht fuer den Build) und die Tailwind-Laufzeit
in src/lib/tailwind-runtime.js. Aufruf: python3 tools/gen-tailwind.py
Danach: node build.js"""
import re, sys, tempfile, os
from playwright.sync_api import sync_playwright
import subprocess
subprocess.check_call(['node', 'build.js', '--source', '/tmp/rt-index.src.html'])
src = open('/tmp/rt-index.src.html', encoding='utf8').read()
# Tailwind-Laufzeit herausloesen
m = src.find('/* Lokal eingebettete Bibliothek: tailwind */')
a = src.rfind('<script', 0, m); b = src.find('</script>', m)
runtime = src[src.find('>', a) + 1:b]
# Text, in dem Klassen vorkommen: alles ausser den Bibliotheken
def strip_lib(s, marker):
    i = s.find(marker)
    if i < 0: return s
    x = s.rfind('<script', 0, i); y = s.find('</script>', i) + 9
    return s[:x] + s[y:]
txt = src
for mk in ['/* Lokal eingebettete Bibliothek: tailwind */', '/* Lokal eingebettete Bibliothek: react */', '/* Lokal eingebettete Bibliothek: reactdom */',
           '/* Babel Standalone', '/* Lokal eingebettete Bibliothek: leaflet', '/* qrcode-generator (MIT) */']:
    txt = strip_lib(txt, mk)
# react-dom steckt in einem zweiten Block ohne Marker (Block nach react)
txt = re.sub(r'<script>\n/\*\*\n \* @license React[\s\S]*?</script>', '', txt)
txt = re.sub(r'<style>[^<]*--tw-border-spacing-x[^<]*</style>', '', txt)   # alte erzeugte CSS
txt += open('ortwahl.js', encoding='utf8').read()
toks = set()
for t in re.findall(r'[^\s"\'`<>{}]+', txt):
    toks.add(t)
    for u in re.split(r'[,();]', t):
        if u: toks.add(u)
toks = sorted(x for x in toks if len(x) < 120 and re.search(r'[a-z]', x))
print('Kandidaten:', len(toks), file=sys.stderr)
page = '<!doctype html><html><head><meta charset="utf-8"><script>' + runtime.replace('</script>', '<\\/script>') + '</script></head><body><div class="' + ' '.join(t.replace('"', '') for t in toks) + '"></div></body></html>'
tmp = os.path.join(tempfile.mkdtemp(), 'tw.html'); open(tmp, 'w', encoding='utf8').write(page)
with sync_playwright() as p:
    br = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = br.new_page(); pg.route('**/*', lambda r: r.abort() if not r.request.url.startswith('file://') else r.continue_())
    pg.goto('file://' + tmp); pg.wait_for_timeout(6000)
    css = pg.evaluate("[...document.querySelectorAll('style')].map(s=>s.textContent).join('\\n')")
    br.close()
if 'tailwindcss v3' not in css: sys.exit('Keine Tailwind-Ausgabe erhalten')
open('src/tailwind.generated.css', 'w', encoding='utf8').write(css)
print('src/tailwind.generated.css:', len(css), 'Bytes', file=sys.stderr)

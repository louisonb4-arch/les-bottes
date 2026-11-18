"""Assemble index.html depuis src/ : injecte la carte (world-atlas) et la planche de découpe."""
import json, pathlib
ROOT = pathlib.Path(__file__).parent
m = json.loads((ROOT / 'tools/data/map.json').read_text())
west = json.loads((ROOT / 'tools/data/west.json').read_text())
depts_svg = ''.join(f'<path class="map__dep" data-d="{k}" d="{v["d"]}"><title>{v["n"]}</title></path>' for k, v in west.items())

# silhouette du bœuf (gravure ChatGPT détourée), repère 1408×938
COW_BODY = (ROOT / 'tools/data/boeuf-silhouette.txt').read_text().strip()
# zones de découpe, découpées ensuite par la silhouette
CUTS = {
 'joue':      "M0 0 L292 0 L304 190 L334 400 L0 460 Z",
 'collier':   "M292 0 L462 0 L470 310 L422 362 L334 400 L304 190 Z",
 'basses':    "M462 0 L602 0 L602 360 L470 310 Z",
 'cote':      "M602 0 L742 0 L742 360 L602 360 Z",
 'fauxfilet': "M742 0 L932 0 L932 292 L742 292 Z",
 'filet':     "M742 292 L932 292 L932 362 L742 360 Z",
 'rumsteck':  "M932 0 L1072 0 L1070 372 L932 362 Z",
 'cuisse':    "M1072 0 L1306 0 L1302 300 L1300 640 L1060 640 L1040 560 L1070 372 Z",
 'paleron':   "M470 310 L602 360 L602 560 L520 604 L440 560 L422 362 Z",
 'poitrine':  "M334 400 L422 362 L440 560 L520 604 L560 660 L330 660 L300 500 Z",
 'platcotes': "M602 360 L800 360 L800 640 L560 640 L520 604 L602 560 Z",
 'bavette':   "M800 360 L932 362 L1070 372 L1040 560 L1060 640 L800 640 Z",
 'jarret':    "M300 660 L560 660 L560 940 L300 940 Z M1040 640 L1300 640 L1300 940 L1040 940 Z",
 'queue':     "M1306 0 L1410 0 L1410 940 L1300 940 L1300 640 L1302 300 Z",
}
cuts_svg = ''.join(f'<path class="cow__part" data-cut="{k}" tabindex="0" d="{d}"/>' for k, d in CUTS.items())

src = (ROOT / 'src/index.src.html').read_text()
out = (src.replace('{{DEPTS}}', depts_svg).replace('{{MAP_FR}}', m['france'])
          .replace('{{MAP_OTHERS}}', m['others'])
          .replace('{{NANTES}}', f"{m['pts']['nantes'][0]} {m['pts']['nantes'][1]}")
          .replace('{{COW_BODY}}', COW_BODY)
          .replace('{{COW_CUTS}}', cuts_svg))
assert '{{' not in out, 'placeholder oublié'
# empreinte de version : le navigateur recharge le CSS/JS dès qu'il change
import hashlib
for f in ('css/site.css', 'js/site.js'):
    h = hashlib.sha1((ROOT / f).read_bytes()).hexdigest()[:8]
    out = out.replace(f'"{f}"', f'"{f}?v={h}"')
(ROOT / 'index.html').write_text(out)
print('index.html', len(out), 'octets')
print('pins', json.dumps(m['pts']))

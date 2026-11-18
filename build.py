"""Assemble index.html depuis src/ : injecte la carte (world-atlas) et la planche de découpe."""
import json, pathlib
ROOT = pathlib.Path(__file__).parent
m = json.loads(ROOT / 'tools/data/map.json'.read_text())
west = json.loads(ROOT / 'tools/data/west.json'.read_text())
depts_svg = ''.join(f'<path class="map__dep" data-d="{k}" d="{v["d"]}"><title>{v["n"]}</title></path>' for k, v in west.items())

COW_BODY = ("M210 70 Q330 64 450 72 L472 66 L520 76 Q536 82 540 96 L544 122 Q546 170 528 206 L522 250 L522 320 "
            "L500 320 L500 262 L490 232 L470 208 Q456 220 436 224 Q380 238 300 238 L254 234 L240 252 L236 320 L212 320 "
            "L210 258 L204 236 L188 214 Q172 198 166 186 L152 162 L130 170 L104 180 Q90 182 86 170 L86 152 L102 122 "
            "L116 104 L132 96 L160 92 Z")
CUTS = {
 'joue':"M0 0 L154 0 L154 200 L0 200 Z",
 'collier':"M154 0 L214 0 L208 178 L176 200 L154 172 Z",
 'basses':"M214 0 L276 0 L276 150 L210 150 Z",
 'cote':"M276 0 L336 0 L336 150 L276 150 Z",
 'fauxfilet':"M336 0 L430 0 L430 112 L336 112 Z",
 'filet':"M336 112 L430 112 L430 150 L336 150 Z",
 'rumsteck':"M430 0 L484 0 L484 156 L430 150 Z",
 'cuisse':"M484 0 L600 0 L600 250 L524 250 L472 208 L470 168 L484 156 Z",
 'paleron':"M210 150 L276 150 L276 250 L236 250 L208 178 Z",
 'poitrine':"M154 172 L176 200 L208 178 L236 250 L200 252 L150 230 Z",
 'platcotes':"M276 150 L372 150 L372 250 L276 250 Z",
 'bavette':"M372 150 L430 150 L484 156 L470 168 L472 208 L440 250 L372 250 Z",
 'jarret':"M190 250 L250 250 L250 340 L190 340 Z M472 208 L524 250 L530 340 L480 340 Z",
}
cuts_svg = ''.join(f'<path class="cow__part" data-cut="{k}" tabindex="0" d="{d}"/>' for k, d in CUTS.items())

src = (ROOT / 'src/index.src.html').read_text()
out = (src.replace('{{DEPTS}}', depts_svg).replace('{{MAP_FR}}', m['france'])
          .replace('{{MAP_OTHERS}}', m['others'])
          .replace('{{NANTES}}', f"{m['pts']['nantes'][0]} {m['pts']['nantes'][1]}")
          .replace('{{COW_BODY}}', COW_BODY)
          .replace('{{COW_CUTS}}', cuts_svg))
assert '{{' not in out, 'placeholder oublié'
(ROOT / 'index.html').write_text(out)
print('index.html', len(out), 'octets')
print('pins', json.dumps(m['pts']))

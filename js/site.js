/* ==========================================================
   LES BOTTES — interactions (vanilla, sans dépendance)
   ========================================================== */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ----------------------------------------------------------
     DONNÉES
     ---------------------------------------------------------- */
  const HOURS = { // 0 = dimanche
    leonard: { 0: null, 1: ['16:00', '19:30'], 2: ['09:30', '20:00'], 3: ['09:30', '20:00'], 4: ['09:30', '20:00'], 5: ['09:30', '20:00'], 6: ['09:30', '19:30'] },
    racine:  { 0: ['09:30', '13:00'], 1: null, 2: ['09:30', '20:00'], 3: ['09:30', '20:00'], 4: ['09:30', '20:00'], 5: ['09:30', '20:00'], 6: ['09:30', '20:00'] }
  };
  const SHOPS = {
    leonard: { name: 'Saint-Léonard', tel: '+33252201386', telH: '02 52 20 13 86' },
    racine:  { name: 'Racine',        tel: '+33251250107', telH: '02 51 25 01 07' }
  };

  const NANTES = { xy: [151.8, 245.2], ll: [-1.5536, 47.2184] };
  const ICONS = {
    boeuf: '<path d="M6 9l4 3M26 9l-4 3M10 11h12l-1 10c0 4-3 7-5 7s-5-3-5-7zM13 24h6"/>',
    porc: '<circle cx="16" cy="17" r="9"/><ellipse cx="16" cy="20" rx="4" ry="2.6"/><path d="M9 10L8 5l5 3M23 10l1-5-5 3"/>',
    agneau: '<path d="M9 14c-2-5 4-8 7-6 3-2 9 1 7 6 3 3 0 8-3 7l-1 6h-6l-1-6c-3 1-6-4-3-7z"/>',
    volaille: '<path d="M10 26c-4-4-3-12 3-13l1-5c0-3 4-3 5 0l3 1-3 2 1 4c4 0 7 3 6 7-1 4-6 6-10 6z"/>'
  };
  const BREEDS = [
    { k: 'boeuf', kind: 'Bœuf', name: 'Parthenaise', deps: ['79'], where: 'Deux-Sèvres', pin: [202, 285.4], ll: [-0.247, 46.649],
      txt: 'Race du Poitou à la robe froment. Une viande fine, rouge vif, joliment persillée.' },
    { k: 'boeuf', kind: 'Bœuf', name: 'Rouge des prés', deps: ['49'], where: 'Maine-et-Loire', pin: [191.8, 234.9], ll: [-0.55, 47.47],
      txt: 'L’ancienne maine-anjou, robe rouge et blanche, protégée par une AOP. Tendre et généreuse.' },
    { k: 'boeuf', kind: 'Bœuf', name: 'Bretonne pie noir', deps: ['29', '56'], where: 'Finistère · Morbihan', pin: [52, 186], ll: [-3.9, 48.0],
      txt: 'La plus petite vache de France, sauvée de justesse. Une viande rare, au grain serré.' },
    { k: 'boeuf', kind: 'Bœuf', name: 'Jersiaise', deps: ['JE'], where: 'Île de Jersey', pin: [125, 121], ll: [-2.13, 49.21],
      txt: 'Venue des îles anglo-normandes : robe fauve, gras doré, persillé remarquable. Fondante.' },
    { k: 'porc', kind: 'Porc', name: 'Porc de Vendée', deps: ['85'], where: 'Vendée', pin: [163, 280], ll: [-1.43, 46.67],
      txt: 'Élevé en plein air, à une heure de la boutique. Le cochon de tous les jours, en bien meilleur.' },
    { k: 'porc', kind: 'Porc', name: 'Porc noir gascon', deps: ['32', '65'], where: 'Gers · Hautes-Pyrénées', pin: [234, 453.5], ll: [0.58, 43.65],
      txt: 'Race rustique du Sud-Ouest, élevée dehors. Un gras fondant, celui des grands jambons.' },
    { k: 'porc', kind: 'Porc', name: 'Kintoa', deps: ['64'], where: 'Pyrénées-Atlantiques', pin: [170, 482], ll: [-1.42, 43.08],
      txt: 'Le porc basque, protégé par une AOP, élevé en liberté dans les vallées. Une charcuterie d’exception.' },
    { k: 'agneau', kind: 'Agneau', name: 'Agneau de Vendée', deps: ['85'], where: 'Vendée', pin: [172, 288], ll: [-0.95, 46.5],
      txt: 'Élevé au pâturage, sous la mère. Une chair tendre, au goût délicat.' },
    { k: 'volaille', kind: 'Volaille', name: 'Coucou de Rennes', deps: ['35'], where: 'Ille-et-Vilaine', pin: [147.2, 187.8], ll: [-1.68, 48.11],
      txt: 'Une poule bretonne ancienne au plumage gris barré, relancée dans les années 1980. Chair fine et ferme.' },
    { k: 'volaille', kind: 'Volaille', name: 'Volailles de Challans', deps: ['85'], where: 'Challans · Vendée', pin: [140, 267.9], ll: [-1.877, 46.846],
      txt: 'Poulet jaune et canette de Challans : des volailles du Marais, élevées sans se presser.' }
  ];

  const MODES = {
    griller: { t: 'Griller · poêler', i: '<path d="M4 9h16M4 14h16M7 4v16M12 4v16M17 4v16"/>' },
    rotir:   { t: 'Rôtir', i: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M12 13c-2 2-1 4 0 4s2-2 0-4z"/>' },
    mijoter: { t: 'Mijoter', i: '<path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM2 10h2M20 10h2M10 6c0-1 1-1 1-2M14 6c0-1 1-1 1-2"/>' }
  };
  const CUTS = [
    { id: 'joue', n: 'Joue', at: [150, 262], m: ['mijoter'], d: 'Un muscle qui travaille beaucoup, riche en collagène : il devient fondant après une longue cuisson.', tip: 'En daube, au vin rouge, trois heures à feu doux.' },
    { id: 'collier', n: 'Collier', at: [388, 262], m: ['mijoter'], d: 'Une viande gélatineuse et goûteuse, faite pour les plats qui mijotent.', tip: 'Le secret d’un bourguignon qui se tient.' },
    { id: 'basses', n: 'Basses côtes', at: [532, 268], m: ['griller', 'mijoter'], d: 'Bien persillées, entre le collier et la côte. Généreuses en goût.', tip: 'En tranche épaisse sur le gril, ou braisées.' },
    { id: 'cote', n: 'Côte & entrecôte', at: [672, 276], m: ['griller'], d: 'La pièce reine, avec ou sans os. Chez nous, elle s’affine en cave avant d’arriver en vitrine.', tip: 'Sortez-la une heure avant, saisissez fort, laissez reposer autant que la cuisson.' },
    { id: 'fauxfilet', n: 'Faux-filet', at: [837, 252], m: ['griller', 'rotir'], d: 'Tendre, avec son liseré de gras qui nourrit la viande pendant la cuisson.', tip: 'Commencez par le gras, côté poêle, puis saignant.' },
    { id: 'filet', n: 'Filet', at: [837, 328], m: ['griller', 'rotir'], d: 'Le morceau le plus tendre : tournedos, chateaubriand, rôti de fête.', tip: 'Cuisson courte : il ne pardonne pas l’excès.' },
    { id: 'rumsteck', n: 'Rumsteck', at: [1000, 280], m: ['griller', 'rotir'], d: 'Tendre et goûteux, il donne pavés, aiguillette et rôtis.', tip: 'Au couteau, c’est le meilleur tartare.' },
    { id: 'cuisse', n: 'Tranche & gîte à la noix', at: [1185, 420], m: ['rotir', 'griller'], d: 'Les muscles de la cuisse : maigres et réguliers, pour rôtis, steaks et carpaccio.', tip: 'Le rôti du dimanche, à trancher fin.' },
    { id: 'paleron', n: 'Paleron & macreuse', at: [520, 460], m: ['mijoter'], d: 'L’épaule : le paleron et son nerf central qui fond, la macreuse moelleuse.', tip: 'En pot-au-feu, la gelée du nerf fait la sauce.' },
    { id: 'poitrine', n: 'Poitrine', at: [392, 545], m: ['mijoter'], d: 'Entrelardée et savoureuse, elle donne du corps aux bouillons.', tip: 'Indispensable dans un pot-au-feu.' },
    { id: 'platcotes', n: 'Plat de côtes', at: [690, 500], m: ['mijoter'], d: 'De la viande et du gras sur l’os, pour les cuissons longues.', tip: 'Préparé la veille, il est encore meilleur.' },
    { id: 'bavette', n: 'Bavette & flanchet', at: [930, 505], m: ['griller', 'mijoter'], d: 'Fibres longues et goût prononcé. La bavette se saisit, le flanchet se mijote.', tip: 'Bavette saignante, échalotes fondues, rien de plus.' },
    { id: 'jarret', n: 'Jarret', at: [455, 770], m: ['mijoter'], d: 'Le gîte : très gélatineux, il donne un bouillon riche et nappant.', tip: 'Pour un pot-au-feu qui nappe la cuillère.' },
    { id: 'queue', n: 'Queue', at: [1352, 560], m: ['mijoter'], d: 'Petite pièce, grand goût : longue cuisson, bouillon puissant.', tip: 'En parmentier de queue de bœuf.' }
  ];

  const FEAST = [
    { g: 'Volailles', items: [['Chapon', 'pièce'], ['Poularde', 'pièce'], ['Pintade', 'pièce'], ['Chapon de pintade', 'pièce'], ['Poulet jaune de Challans', 'pièce'], ['Dinde', 'pièce'], ['Canette de Challans', 'pièce']] },
    { g: 'Gibier', items: [['Cerf ou biche', 'pers.'], ['Chevreuil', 'pers.'], ['Sanglier', 'pers.'], ['Faisan', 'pièce'], ['Perdreau', 'pièce'], ['Caille', 'pièce']] },
    { g: 'Rôtis de fête', items: [['Bœuf façon Rossini', 'pers.'], ['Filet de bœuf pour Wellington', 'pers.'], ['Veau Orloff', 'pers.'], ['Carré d’agneau au romarin', 'pers.'], ['Rôti de porc aux figues', 'pers.']] },
    { g: 'Foie gras & farces', items: [['Foie gras frais déveiné', 'pièce'], ['Foie gras maison', 'pers.'], ['Farce fine aux marrons', 'pers.']] }
  ];

  /* ----------------------------------------------------------
     HEURE DE PARIS + STATUTS
     ---------------------------------------------------------- */
  const toMin = s => { const [h, m] = s.split(':'); return +h * 60 + +m; };
  const fmtH = s => { const [h, m] = s.split(':'); return (+h) + 'h' + (m === '00' ? '' : m); };
  function parisNow() {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const g = t => p.find(x => x.type === t).value;
    return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday')), min: (+g('hour') % 24) * 60 + +g('minute') };
  }
  function status(key) {
    const { day, min } = parisNow(), t = HOURS[key][day];
    if (t && min >= toMin(t[0]) && min < toMin(t[1])) return { open: true, txt: `Ouvert jusqu'à ${fmtH(t[1])}` };
    if (t && min < toMin(t[0])) return { open: false, txt: `Ouvre à ${fmtH(t[0])}` };
    for (let k = 1; k <= 7; k++) {
      const d = (day + k) % 7, h = HOURS[key][d];
      if (h) return { open: false, txt: k === 1 ? `Fermé · demain ${fmtH(h[0])}` : `Fermé · ${['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'][d]} ${fmtH(h[0])}` };
    }
    return { open: false, txt: 'Fermé' };
  }
  function paintStatus() {
    const { day } = parisNow();
    // ardoise du hero
    const dayName = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][day];
    const dEl = $('[data-today]'); if (dEl) dEl.textContent = dayName;
    Object.keys(HOURS).forEach(k => {
      const t = HOURS[k][day], el = $(`[data-today-hours="${k}"]`);
      if (el) el.textContent = t ? `${fmtH(t[0])}–${fmtH(t[1])}` : 'fermé';
      const card = $(`[data-shopcard="${k}"] [data-state]`);
      if (card) { const s = status(k); card.classList.toggle('open', s.open); card.lastElementChild.textContent = s.txt; }
    });
    const anyOpen = Object.keys(HOURS).some(k => status(k).open);
    const st = $('[data-open-state]');
    if (st) st.textContent = anyOpen ? 'C’est ouvert !' : 'Fermé pour l’instant';
    paintNow();
  }

  /* ----------------------------------------------------------
     HACHURES DU STICKER
     ---------------------------------------------------------- */
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function hatch(g, { R = 86, count = 34, w = 1.3, op = [.55, 1] } = {}) {
    const a = -62 * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
    for (let i = 0; i < count; i++) {
      const off = -R + 2 * R * (i + rnd() * .6) / count, half = Math.sqrt(Math.max(R * R - off * off, 0));
      if (half < 5) continue;
      let t = -half + rnd() * 6;
      while (t < half - 4) {
        const t2 = Math.min(t + 8 + rnd() * half * .9, half - rnd() * 4);
        const l = document.createElementNS(NS, 'line');
        l.setAttribute('x1', (100 + nx * off + dx * t).toFixed(1)); l.setAttribute('y1', (100 + ny * off + dy * t).toFixed(1));
        l.setAttribute('x2', (100 + nx * off + dx * t2).toFixed(1)); l.setAttribute('y2', (100 + ny * off + dy * t2).toFixed(1));
        l.setAttribute('stroke-width', (w * (.7 + rnd() * .6)).toFixed(2));
        l.setAttribute('opacity', (op[0] + rnd() * (op[1] - op[0])).toFixed(2));
        g.appendChild(l);
        t = t2 + 3 + rnd() * 10;
      }
    }
  }
  $$('[data-hatch]').forEach(g => {
    seed = 11; // même dessin partout, comme un vrai sticker imprimé
    hatch(g, g.dataset.hatch === 'mini' ? { count: 14, w: 3.2 } : { count: 34, w: 1.5 });
  });

  /* ----------------------------------------------------------
     PHYSIQUE DE BALANCIER (ardoise + piques)
     ---------------------------------------------------------- */
  const swings = new Set(); let raf = 0, last = 0;
  class Swing {
    constructor(el, { k = 30, c = 2.6, max = 24, base = 0 } = {}) { Object.assign(this, { el, k, c, max, base, a: 0, v: 0 }); swings.add(this); }
    kick(v) { if (REDUCE) return; this.v += v; wake(); }
    step(dt) {
      const acc = -this.k * this.a - this.c * this.v;
      this.v += acc * dt; this.a = clamp(this.a + this.v * dt, -this.max, this.max);
      this.el.style.transform = `rotate(${(this.base + this.a).toFixed(2)}deg)`;
      return Math.abs(this.a) > .02 || Math.abs(this.v) > .02;
    }
  }
  function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }
  function loop(t) {
    const dt = Math.min((t - last) / 1000, .034); last = t;
    let alive = false;
    swings.forEach(s => { if (s.step(dt)) alive = true; });
    raf = alive ? requestAnimationFrame(loop) : 0;
  }

  /* ----------------------------------------------------------
     OUVERTURE — le paquet ficelé
     ---------------------------------------------------------- */
  const pack = $('#pack');
  let opened = false;
  function openSite() {
    if (opened) return; opened = true;
    body.classList.remove('is-wrapped');
    body.classList.add('is-open-site');
    setTimeout(() => hangSwing && hangSwing.kick(-55), 1500); // l'ardoise bouge quand le rideau remonte
  }
  function runPack() {
    let seen = false;
    try { seen = sessionStorage.getItem('lb-pack') === '1'; } catch (e) {}
    if (location.search.includes('intro')) seen = false;
    if (REDUCE || seen) { pack.classList.add('is-gone'); openSite(); return; }
    const T = [];
    const at = (ms, fn) => T.push(setTimeout(fn, ms));
    const finish = (fast) => {
      T.forEach(clearTimeout);
      if (fast) { pack.classList.add('is-cut', 'is-open'); }
      openSite();
      setTimeout(() => pack.classList.add('is-gone'), fast ? 900 : 1200);
      try { sessionStorage.setItem('lb-pack', '1'); } catch (e) {}
    };
    at(120, () => pack.classList.add('is-tie'));
    at(1250, () => pack.classList.add('is-seal'));
    at(2250, () => pack.classList.add('is-cut'));
    at(2600, () => { pack.classList.add('is-open'); finish(false); });
    pack.addEventListener('click', () => finish(true), { once: true });
  }

  /* ----------------------------------------------------------
     HEADER + MENU ROULEAU
     ---------------------------------------------------------- */
  const top = $('#top'), menu = $('#menu'), menuBtn = $('#menuBtn');
  function setMenu(open) {
    if (open === menu.classList.contains('is-open')) return;
    menuBtn.setAttribute('aria-expanded', open);
    const lab = $('.top__menu-label', menuBtn); lab.textContent = open ? lab.dataset.close : lab.dataset.open;
    body.classList.toggle('menu-open', open);
    body.classList.toggle('is-locked', open);
    if (open) {
      menu.classList.remove('is-closing'); menu.classList.add('is-open');
      menu.removeAttribute('inert'); menu.setAttribute('aria-hidden', 'false');
    } else {
      menu.classList.remove('is-open'); menu.classList.add('is-closing');
      menu.setAttribute('inert', ''); menu.setAttribute('aria-hidden', 'true');
      setTimeout(() => menu.classList.remove('is-closing'), 900);
    }
  }
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ----------------------------------------------------------
     HERO — ardoise suspendue
     ---------------------------------------------------------- */
  const hang = $('#hang');
  const hangSwing = hang ? new Swing(hang, { k: 14, c: 1.15, max: 26 }) : null;
  if (hang) {
    const poke = () => hangSwing.kick((Math.random() > .5 ? 1 : -1) * 70);
    hang.addEventListener('click', poke);
    hang.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(); } });
    let px = null;
    hang.addEventListener('pointerdown', e => { px = e.clientX; });
    addEventListener('pointermove', e => { if (px === null) return; hangSwing.kick((e.clientX - px) * 1.6); px = e.clientX; });
    addEventListener('pointerup', () => { px = null; });
  }

  /* ----------------------------------------------------------
     SCROLL GLOBAL (un seul écouteur)
     ---------------------------------------------------------- */
  let lastY = scrollY, ticking = false;
  const onScrollFns = [];
  function onScroll() {
    const y = scrollY, dy = y - lastY;
    top.classList.toggle('is-solid', y > 30);
    top.classList.toggle('is-away', dy > 0 && y > 500 && !menu.classList.contains('is-open'));
    if (dy < -2) top.classList.remove('is-away');
    if (hangSwing && y < innerHeight * 1.2) hangSwing.kick(clamp(dy, -40, 40) * .55);
    onScrollFns.forEach(f => f(dy));
    lastY = y; ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* ----------------------------------------------------------
     01 — lecture au scroll
     ---------------------------------------------------------- */
  const read = $('[data-read]');
  if (read) {
    const marks = [];
    const split = (node) => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeName === 'MARK') { marks.push(n); split(n); }
      });
    };
    split(read);
    const words = $$('.w', read);
    const paint = () => {
      const r = read.getBoundingClientRect(), vh = innerHeight;
      const p = clamp((vh * .82 - r.top) / (r.height + vh * .28), 0, 1);
      const on = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < on));
      marks.forEach(m => m.classList.toggle('on', $$('.w', m).every(w => w.classList.contains('on'))));
    };
    if (REDUCE) words.forEach(w => w.classList.add('on')), marks.forEach(m => m.classList.add('on'));
    else { onScrollFns.push(paint); paint(); }
  }

  /* apparition simple (icônes, gantt) */
  const seen = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); seen.unobserve(e.target); } }), { rootMargin: '0px 0px -15% 0px' });
  // stickers : ceux qui arrivent ensemble se collent en cascade
  const stickIO = new IntersectionObserver(es => {
    let k = 0;
    es.forEach(e => { if (!e.isIntersecting) return; e.target.style.setProperty('--d', (k++ * .22) + 's'); e.target.classList.add('in'); stickIO.unobserve(e.target); });
  }, { rootMargin: '0px 0px -12% 0px' });
  $$('.pledge__item').forEach(el => {
    stickIO.observe(el);
    // toucher le sticker : on le recolle
    el.addEventListener('click', () => {
      if (REDUCE || !el.classList.contains('in')) return;
      el.style.setProperty('--d', '0s'); el.classList.add('replay'); el.classList.remove('in');
      void el.offsetWidth;
      requestAnimationFrame(() => { el.classList.remove('replay'); el.classList.add('in'); });
    });
  });

  /* ----------------------------------------------------------
     ALBUM — les polaroïds tombent un à un sur la table
     ---------------------------------------------------------- */
  const album = $('#album');
  if (album) {
    // position finale de chaque photo sur la table (en vrac, mais composé)
    const LAY = [
      { x: 1, y: 3, r: -7, tr: -5 }, { x: 43, y: 0, r: 6, tr: 4 }, { x: 1, y: 42, r: 4, tr: -3 },
      { x: 44, y: 46, r: -5, tr: 6 }, { x: 22, y: 22, r: -1.5, tr: -2 }
    ];
    const snaps = $$('.snap', album).map((el, i) => {
      const L = LAY[i];
      el.style.setProperty('--x', L.x + '%'); el.style.setProperty('--y', L.y + '%');
      el.style.setProperty('--r', L.r + 'deg'); el.style.setProperty('--tr', L.tr + 'deg');
      el.style.zIndex = i + 1;
      const body = $('.snap__body', el);
      return { el, body, L, i, cur: 0, landed: false, lift: 0, liftT: 0, sw: new Swing(body, { k: 120, c: 9, max: 6 }) };
    });
    const N = snaps.length, nEl = $('#albumN'), cnt = $('.album__count');
    // lancée une fois, quand la table arrive à l'écran : les photos tombent l'une après l'autre
    const GAP = 340, FALL = 760;
    let t0 = null, run = 0;
    const easeOut = x => 1 - Math.pow(1 - x, 3);
    function render(now) {
      let moving = false, landedN = 0;
      snaps.forEach(s => {
        const t = t0 === null ? 0 : clamp((now - t0 - s.i * GAP) / FALL, 0, 1);
        s.cur = t; if (t < 1 && t0 !== null) moving = true;
        s.liftT += (s.lift - s.liftT) * .2;
        if (Math.abs(s.lift - s.liftT) < .001) s.liftT = s.lift; else moving = true;
        const e = easeOut(s.cur), k = 1 - e, side = s.i % 2 ? 1 : -1, L = s.L, lf = s.liftT;
        const y = k * (innerHeight * .95) - lf * 14;
        const x = k * side * 46;
        const rot = (L.r + k * side * 30) * (1 - lf);
        const sc = 1 + k * .2 + lf * .07;
        s.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
        s.body.style.setProperty('--air', Math.max(k * 1.15, lf * .7).toFixed(3));
        const landed = s.cur >= 1;
        if (landed && !s.landed) {                       // impact : la photo rebondit, les autres frémissent
          s.sw.kick(side * 70);
          snaps.forEach(o => { if (o !== s && o.landed) o.sw.kick((Math.random() - .5) * 26); });
        }
        if (landed !== s.landed) { s.landed = landed; s.el.classList.toggle('landed', landed); }
        if (landed) landedN++;
      });
      if (nEl.textContent != landedN) { nEl.textContent = landedN; cnt.classList.remove('bump'); void cnt.offsetWidth; cnt.classList.add('bump'); }
      album.classList.toggle('done', landedN === N);
      run = moving ? requestAnimationFrame(render) : 0;
    }
    const wakeAlbum = () => { if (!run) run = requestAnimationFrame(render); };
    if (REDUCE) { t0 = -1e9; render(performance.now()); }
    else {
      render(performance.now()); // photos hors champ au départ
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting && t0 === null) { t0 = performance.now() + 150; wakeAlbum(); io.disconnect(); }
      }), { threshold: .45 });
      io.observe($('.album__pin', album));
    }
    // toucher : on prend la photo en main (elle se redresse et passe devant)
    let zTop = N + 1;
    snaps.forEach(s => s.el.addEventListener('click', () => {
      if (!s.landed) return;
      const was = s.lift; snaps.forEach(o => { o.lift = 0; o.el.classList.remove('lifted'); });
      if (!was) { s.lift = 1; s.el.classList.add('lifted'); s.el.style.zIndex = ++zTop; }
      wakeAlbum();
    }));
  }

  /* ----------------------------------------------------------
     02 — CARTE DES ORIGINES
     ---------------------------------------------------------- */
  const btrack = $('#breeds'), pins = $('#mapPins'), routes = $('#mapRoutes'), cam = $('#mapCam'), cap = $('#mapCaption'), dotsEl = $('#breedDots');
  const km = (a, b) => {
    const R = 6371, rad = Math.PI / 180, dLa = (b[1] - a[1]) * rad, dLo = (b[0] - a[0]) * rad;
    const h = Math.sin(dLa / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLo / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(h)) / 5) * 5;
  };
  if (btrack) {
    const mapSvg = $('#map'), VB = { x: -6, y: 78, w: 300, h: 440 };
    const deps = {}; $$('.map__dep', mapSvg).forEach(p => deps[p.dataset.d] = p);
    BREEDS.forEach((b, i) => {
      const li = document.createElement('article');
      li.className = 'breed'; li.dataset.i = i;
      li.innerHTML = `<div class="breed__top"><span class="breed__kind"><i class="ico" style="-webkit-mask-image:url(img/ic-${b.k}.png);mask-image:url(img/ic-${b.k}.png)" aria-hidden="true"></i>${b.kind}</span><span class="breed__idx">${String(i + 1).padStart(2, '0')}/${BREEDS.length}</span></div>
        <h3>${b.name}</h3><p class="breed__where">${b.where}</p><p>${b.txt}</p>`;
      btrack.appendChild(li);
      const dot = document.createElement('button'); dot.type = 'button'; dot.setAttribute('aria-label', b.name); dotsEl.appendChild(dot);
      dot.addEventListener('click', () => goTo(i));
      // épingle + étiquette écrite sur la carte
      const right = b.pin[0] < 200;
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'pin'); g.setAttribute('transform', `translate(${b.pin[0]} ${b.pin[1]})`);
      g.innerHTML = `<circle class="pin__ring" r="4"/><circle class="pin__dot" r="3.4"/>
        <g class="pin__lab"><text class="pin__name" x="${right ? 7 : -7}" y="-1" text-anchor="${right ? 'start' : 'end'}">${b.name}</text><text class="pin__dep" x="${right ? 7 : -7}" y="8" text-anchor="${right ? 'start' : 'end'}">${b.where}</text></g>`;
      g.addEventListener('click', () => goTo(i));
      pins.appendChild(g); b.g = g;
      const [x1, y1] = b.pin, [x2, y2] = NANTES.xy, mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1;
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', `M${x1} ${y1} Q${(mx - dy * .25).toFixed(1)} ${(my + dx * .25).toFixed(1)} ${x2} ${y2}`);
      p.setAttribute('pathLength', '1'); p.setAttribute('class', 'map__route off');
      routes.appendChild(p); b.route = p;
      // cadre : départements d'origine + Nantes
      const bb = { x0: x2, y0: y2, x1: x2, y1: y2 };
      b.deps.forEach(d => { const r = deps[d].getBBox(); bb.x0 = Math.min(bb.x0, r.x); bb.y0 = Math.min(bb.y0, r.y); bb.x1 = Math.max(bb.x1, r.x + r.width); bb.y1 = Math.max(bb.y1, r.y + r.height); });
      b.bb = bb;
    });
    const cards = $$('.breed', btrack), dots = $$('button', dotsEl);

    // caméra animée (zoom en log, tailles de texte/épingles constantes)
    const camState = { tx: 0, ty: 0, s: 1 }; let camRaf = 0;
    const setCam = (tx, ty, s) => { Object.assign(camState, { tx, ty, s }); cam.setAttribute('transform', `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})`); mapSvg.style.setProperty('--inv', (1 / s).toFixed(4)); };
    function camTo(tx, ty, s) {
      cancelAnimationFrame(camRaf);
      if (REDUCE) return setCam(tx, ty, s);
      const from = { ...camState }, t0 = performance.now(), D = 900;
      const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
      const tick = now => {
        const k = ease(Math.min((now - t0) / D, 1));
        setCam(from.tx + (tx - from.tx) * k, from.ty + (ty - from.ty) * k, Math.exp(Math.log(from.s) + (Math.log(s) - Math.log(from.s)) * k));
        if (k < 1) camRaf = requestAnimationFrame(tick);
      };
      camRaf = requestAnimationFrame(tick);
    }
    let active = -1;
    function focus(i) {
      if (i === active) return; active = i;
      const b = BREEDS[i];
      BREEDS.forEach((o, j) => { o.g.classList.toggle('on', j === i); o.route.classList.toggle('on', j === i); o.route.classList.toggle('off', j !== i); });
      Object.values(deps).forEach(p => p.classList.toggle('on', b.deps.includes(p.dataset.d)));
      pins.appendChild(b.g); // l'épingle active passe au-dessus
      cards.forEach((c, j) => c.classList.toggle('on', j === i));
      dots.forEach((d, j) => d.classList.toggle('on', j === i));
      // cadrage : départements + Nantes (et son étiquette), dans la zone réellement visible de la carte
      const r = mapSvg.getBoundingClientRect(), ar = r.height / r.width;
      const vw = ar < VB.h / VB.w ? VB.w : VB.h / ar, vh = ar < VB.h / VB.w ? VB.w * ar : VB.h;
      const bx0 = Math.min(b.bb.x0, b.pin[0] - 8), bx1 = Math.max(b.bb.x1, NANTES.xy[0] + 40, b.pin[0] < 200 ? b.pin[0] + 70 : b.pin[0] + 8);
      const pad = 16, w = bx1 - bx0 + pad * 2, h = b.bb.y1 - b.bb.y0 + pad * 2 + 10;
      const s = clamp(Math.min(vw / w, vh / h), Math.max(vh / VB.h, vw / VB.w), 2.6);
      const cx = (bx0 + bx1) / 2, cy = (b.bb.y0 + b.bb.y1) / 2;
      const ox = VB.x + VB.w / 2, oy = VB.y + VB.h / 2; // centre du viewBox = centre de l'écran
      let tx = ox - cx * s, ty = oy - cy * s;
      // ne jamais montrer le vide autour de la carte
      tx = clamp(tx, (ox + vw / 2) - (VB.x + VB.w) * s, (ox - vw / 2) - VB.x * s);
      ty = clamp(ty, (oy + vh / 2) - (VB.y + VB.h) * s, (oy - vh / 2) - VB.y * s);
      camTo(tx, ty, s);
      cap.innerHTML = `<span><b>${b.name}</b> → Nantes</span><span>≈ ${km(b.ll, NANTES.ll)} km à vol d’oiseau</span>`;
    }
    const step = () => cards[0].offsetWidth + 12;
    function goTo(i) { btrack.scrollTo({ left: clamp(i, 0, BREEDS.length - 1) * step(), behavior: REDUCE ? 'auto' : 'smooth' }); focus(clamp(i, 0, BREEDS.length - 1)); }
    let sraf = 0;
    btrack.addEventListener('scroll', () => {
      cancelAnimationFrame(sraf);
      sraf = requestAnimationFrame(() => focus(clamp(Math.round(btrack.scrollLeft / step()), 0, BREEDS.length - 1)));
    }, { passive: true });
    $$('[data-br]').forEach(btn => btn.addEventListener('click', () => goTo(active + +btn.dataset.br)));
    // vue d'ensemble au départ, puis première race quand la carte arrive à l'écran
    setCam(0, 0, 1);
    new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { focus(0); o.disconnect(); } }), { threshold: .5 }).observe(mapSvg);
  }

  /* ----------------------------------------------------------
     03 — PLANCHE DE DÉCOUPE
     ---------------------------------------------------------- */
  const cow = $('#cow');
  if (cow) {
    const nums = $('#cowNums'), chips = $('#cutChips'), tag = $('#cutTag');
    CUTS.forEach((c, i) => {
      const g = document.createElementNS(NS, 'g'); g.dataset.cut = c.id;
      g.innerHTML = `<circle cx="${c.at[0]}" cy="${c.at[1]}" r="35"/><text x="${c.at[0]}" y="${c.at[1]}">${i + 1}</text>`;
      nums.appendChild(g);
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.setAttribute('role', 'tab'); b.dataset.cut = c.id;
      b.innerHTML = `<small>${String(i + 1).padStart(2, '0')}</small>${c.n}`;
      chips.appendChild(b);
    });
    const parts = $$('.cow__part', cow);
    parts.forEach(p => {
      const c = CUTS.find(x => x.id === p.dataset.cut);
      p.setAttribute('role', 'button'); p.setAttribute('aria-label', c.n);
    });
    let current = null;
    function select(id, scroll) {
      if (id === current) return;
      const i = CUTS.findIndex(c => c.id === id), c = CUTS[i];
      parts.forEach(p => p.classList.toggle('on', p.dataset.cut === id));
      $$('g', nums).forEach(g => g.classList.toggle('on', g.dataset.cut === id));
      $$('.chip', chips).forEach(b => b.setAttribute('aria-selected', b.dataset.cut === id));
      const chip = $(`.chip[data-cut="${id}"]`, chips);
      if (scroll && chip) chips.scrollTo({ left: chip.offsetLeft - 20, behavior: 'smooth' });
      const fill = () => {
        $('[data-f="num"]', tag).textContent = `N° ${String(i + 1).padStart(2, '0')} — bœuf`;
        $('[data-f="name"]', tag).textContent = c.n;
        $('[data-f="modes"]', tag).innerHTML = c.m.map(k => `<li><i class="ico" style="-webkit-mask-image:url(img/ic-${k}.png);mask-image:url(img/ic-${k}.png)" aria-hidden="true"></i>${MODES[k].t}</li>`).join('');
        $('[data-f="desc"]', tag).textContent = c.d;
        $('[data-f="tip"]', tag).textContent = c.tip;
      };
      if (current === null || REDUCE) fill();
      else { tag.classList.remove('flip'); void tag.offsetWidth; tag.classList.add('flip'); setTimeout(fill, 300); }
      current = id;
    }
    cow.addEventListener('click', e => { const p = e.target.closest('.cow__part'); if (p) select(p.dataset.cut, true); });
    cow.addEventListener('keydown', e => { const p = e.target.closest('.cow__part'); if (p && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(p.dataset.cut, true); } });
    chips.addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) select(b.dataset.cut, false); });
    select('cote', false);
  }

  /* ----------------------------------------------------------
     04 — VITRINE : piques qui balancent
     ---------------------------------------------------------- */
  const track = $('#winTrack');
  if (track) {
    const picks = $$('.pick', track).map((p, i) => new Swing(p, { k: 95, c: 5.2, max: 20, base: [-3, 2, -2, 3, -1.5, 2.5][i % 6] }));
    picks.forEach(s => s.step(0));
    let lx = track.scrollLeft;
    const idx = $('#winIdx');
    track.addEventListener('scroll', () => {
      const dx = track.scrollLeft - lx; lx = track.scrollLeft;
      picks.forEach(s => s.kick(clamp(-dx, -30, 30) * 2.2));
      const w = track.querySelector('.item').offsetWidth + 16;
      idx.textContent = String(Math.round(track.scrollLeft / w) + 1).padStart(2, '0');
    }, { passive: true });
    $$('[data-win]').forEach(b => b.addEventListener('click', () => {
      const w = track.querySelector('.item').offsetWidth + 16;
      track.scrollBy({ left: w * +b.dataset.win, behavior: 'smooth' });
    }));
    const winSec = $('#vitrine');
    onScrollFns.push(dy => {
      const r = winSec.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) picks.forEach(s => s.kick(clamp(dy, -30, 30) * .45));
    });
  }

  /* ----------------------------------------------------------
     05 — BON DES FÊTES
     ---------------------------------------------------------- */
  const fMenu = $('#feastMenu');
  if (fMenu) {
    const qty = {}; let shop = 'leonard';
    fMenu.innerHTML = FEAST.map((grp, gi) => `
      <details class="group" ${gi === 0 ? 'open' : ''}>
        <summary><h3>${grp.g}</h3><span><b data-gcount="${gi}">0</b><i aria-hidden="true"></i></span></summary>
        <div class="group__rows">${grp.items.map(([n, u], ii) => `
          <div class="row"><p class="row__name">${n}<small>${u === 'pièce' ? 'à la pièce' : 'par personne'}</small></p>
            <div class="stepper" data-id="${gi}-${ii}">
              <button type="button" data-d="-1" aria-label="Retirer : ${n}">−</button>
              <output aria-live="polite">0</output>
              <button type="button" data-d="1" aria-label="Ajouter : ${n}">+</button>
            </div></div>`).join('')}</div>
      </details>`).join('');

    const linesEl = $('#ticketLines'), empty = $('#ticketEmpty'), count = $('#ticketCount'), ticket = $('#ticket');
    const copyBtn = $('#copyTicket'), hint = $('#copyHint'), dock = $('#feastDock'), dockCount = $('#dockCount');
    const date = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Paris' }).format(new Date());
    $('[data-t="date"]').textContent = date;
    const itemOf = id => { const [g, i] = id.split('-').map(Number); return FEAST[g].items[i]; };

    function render(changed) {
      const ids = Object.keys(qty).filter(k => qty[k] > 0);
      const prev = new Set($$('li', linesEl).map(l => l.dataset.id));
      linesEl.innerHTML = ids.map(id => {
        const [n, u] = itemOf(id), q = qty[id];
        return `<li data-id="${id}" style="${prev.has(id) ? 'animation:none' : ''}"><span>${n}</span><span>${q} ${u === 'pièce' ? (q > 1 ? 'pièces' : 'pièce') : 'pers.'}</span></li>`;
      }).join('');
      const total = ids.reduce((s, id) => s + (itemOf(id)[1] === 'pièce' ? qty[id] : 1), 0);
      empty.hidden = ids.length > 0;
      count.textContent = ids.length;
      dockCount.textContent = ids.length;
      copyBtn.disabled = ids.length === 0;
      FEAST.forEach((g, gi) => {
        const n = Object.keys(qty).filter(k => k.startsWith(gi + '-') && qty[k] > 0).length;
        const b = $(`[data-gcount="${gi}"]`); b.textContent = n; b.classList.toggle('has', n > 0);
      });
      if (changed && !REDUCE) { ticket.classList.remove('feed'); void ticket.offsetWidth; ticket.classList.add('feed'); }
      updateDock();
      return total;
    }
    fMenu.addEventListener('click', e => {
      const b = e.target.closest('.stepper button'); if (!b) return;
      const st = b.closest('.stepper'), id = st.dataset.id;
      const before = qty[id] || 0;
      qty[id] = clamp(before + +b.dataset.d, 0, 30);
      $('output', st).textContent = qty[id];
      if (qty[id] !== before) render(true);
    });
    $$('.feast__shop button').forEach(b => b.addEventListener('click', () => {
      shop = b.dataset.shop;
      $$('.feast__shop button').forEach(x => x.setAttribute('aria-checked', x === b));
      $('.feast__shop').classList.toggle('is-r', shop === 'racine');
      $('[data-t="shop"]').textContent = SHOPS[shop].name;
      const call = $('#callShop'); call.href = 'tel:' + SHOPS[shop].tel; call.textContent = 'Appeler · ' + SHOPS[shop].telH;
    }));
    copyBtn.addEventListener('click', async () => {
      const ids = Object.keys(qty).filter(k => qty[k] > 0);
      const txt = `Bonjour, je souhaite commander pour les fêtes (retrait : ${SHOPS[shop].name}) :\n` +
        ids.map(id => { const [n, u] = itemOf(id), q = qty[id]; return u === 'pièce' ? `- ${q} × ${n}` : `- ${n} pour ${q} personne${q > 1 ? 's' : ''}`; }).join('\n');
      try { await navigator.clipboard.writeText(txt); hint.textContent = 'Liste copiée. Collez-la dans un message ou lisez-la au téléphone.'; }
      catch (e) { hint.textContent = 'Copie impossible ici : montrez simplement ce ticket au comptoir.'; }
    });
    // pastille flottante « mon ticket »
    let inFeast = false, printerVisible = false;
    function updateDock() {
      const n = +dockCount.textContent;
      const show = inFeast && !printerVisible && n > 0 && innerWidth < 820;
      dock.hidden = false;
      dock.classList.toggle('is-hidden', !show);
    }
    new IntersectionObserver(es => es.forEach(e => { inFeast = e.isIntersecting; updateDock(); })).observe($('#fetes'));
    new IntersectionObserver(es => es.forEach(e => { printerVisible = e.isIntersecting; updateDock(); }), { threshold: .25 }).observe($('#printer'));
    dock.classList.add('is-hidden');
    render(false);
  }

  /* ----------------------------------------------------------
     06 — TRACES DE BOTTES
     ---------------------------------------------------------- */
  const trail = $('#trail'), prints = $('#prints');
  if (trail) {
    let boots = [], steps = $$('.step', trail);
    function layout() {
      prints.innerHTML = ''; boots = [];
      const H = trail.offsetHeight, gap = 30;
      for (let i = 0, y = 18; y < H - 20; i++, y += gap) {
        const side = i % 2 ? 1 : -1;
        const x = 29 + side * 7 + Math.sin(y / 120) * 6;
        const a = 180 + Math.cos(y / 120) * 9 + side * 4;
        const s = document.createElement('i');
        s.className = 'boot'; s.style.setProperty('--sx', side > 0 ? -1 : 1);
        s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.setProperty('--a', a + 'deg');
        prints.appendChild(s); boots.push({ el: s, y });
      }
      paint();
    }
    function paint() {
      const r = trail.getBoundingClientRect();
      const front = innerHeight * .72 - r.top;
      boots.forEach(b => b.el.classList.toggle('on', b.y < front));
      steps.forEach(st => st.classList.toggle('on', st.offsetTop + 30 < front));
    }
    if (REDUCE) { layout(); boots.forEach(b => b.el.classList.add('on')); steps.forEach(s => s.classList.add('on')); }
    else { layout(); onScrollFns.push(paint); addEventListener('resize', layout); }
  }

  /* ----------------------------------------------------------
     07 — LA SEMAINE
     ---------------------------------------------------------- */
  const rows = $('#ganttRows'), gantt = $('#gantt');
  const DAYS = [[1, 'Lun'], [2, 'Mar'], [3, 'Mer'], [4, 'Jeu'], [5, 'Ven'], [6, 'Sam'], [0, 'Dim']];
  const pos = s => ((toMin(s) / 60 - 9) / 11 * 100);
  if (rows) {
    rows.innerHTML = DAYS.map(([d, n], i) => {
      const bar = (k, cls) => {
        const h = HOURS[k][d];
        if (!h) return `<span class="bar__x" style="left:${cls === 'l' ? 2 : 52}%;top:${cls === 'l' ? 1 : 15}px">${SHOPS[k].name.split('-')[0].replace('Saint', 'St-Léonard')} fermé</span>`;
        return `<span class="bar bar--${cls}" style="left:${pos(h[0])}%;width:${pos(h[1]) - pos(h[0])}%;transition-delay:${i * .07 + (cls === 'r' ? .1 : 0)}s" title="${SHOPS[k].name} ${fmtH(h[0])}–${fmtH(h[1])}"></span>`;
      };
      return `<div class="grow" data-d="${d}"><span class="grow__d">${n}</span><div class="grow__t">${bar('leonard', 'l')}${bar('racine', 'r')}</div></div>`;
    }).join('');
    seen.observe(gantt);
  }
  function paintNow() {
    if (!rows) return;
    const { day, min } = parisNow();
    $$('.grow', rows).forEach(r => r.classList.toggle('today', +r.dataset.d === day));
    $$('.now', rows).forEach(n => n.remove());
    const h = min / 60;
    if (h >= 9 && h <= 20) {
      const t = $(`.grow[data-d="${day}"] .grow__t`, rows);
      const n = document.createElement('span'); n.className = 'now';
      n.style.left = ((h - 9) / 11 * 100) + '%';
      n.innerHTML = `<span>${String(Math.floor(h)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}</span>`;
      t.appendChild(n);
    }
  }

  /* ----------------------------------------------------------
     DÉMARRAGE
     ---------------------------------------------------------- */
  paintStatus(); setInterval(paintStatus, 60000);
  $$('[data-year]').forEach(e => e.textContent = new Date().getFullYear());
  runPack();
})();

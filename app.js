/* astroComputer — app engine: routing, overview renderer, formula-puzzle board */
(function(){
'use strict';
const $ = id => document.getElementById(id);
const BY_ID = Object.fromEntries(MODULES.map(m => [m.id, m]));
const LS_KEY = 'astroComputer.solved.v1';

/* ---------------- progress ---------------- */
let solved = {};
try{ solved = JSON.parse(localStorage.getItem(LS_KEY)) || {}; }catch(e){ solved = {}; }
const saveSolved = () => { try{ localStorage.setItem(LS_KEY, JSON.stringify(solved)); }catch(e){} };
const isSolved = (m, i) => !!solved[m + ':' + i];
const solvedCount = m => BY_ID[m].puzzles.filter((_, i) => isSolved(m, i)).length;

/* ---------------- MathJax ---------------- */
let mjReady = false; const pending = [];
window.__mjReady = () => { mjReady = true; pending.splice(0).forEach(el => typeset(el)); };
function typeset(el){
  if(!el) return Promise.resolve();
  if(mjReady && window.MathJax && MathJax.typesetPromise){
    return MathJax.typesetPromise([el]).catch(err => console.warn('MathJax', err));
  }
  pending.push(el); return Promise.resolve();
}
const ilm = tex => '$' + tex + '$';           // inline math wrapper
const dsp = tex => '$$' + tex + '$$';         // display math wrapper
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ---------------- nav + home ---------------- */
function renderNav(active){
  const links = [`<a data-go="home" class="${active?'':'on'}">All modules</a>`]
    .concat(MODULES.map(m => `<a class="mod ${active===m.id?'on':''}" data-go="${m.id}">${m.num}. ${esc(m.short)}</a>`));
  $('navlinks').innerHTML = links.join('');
}
function renderHome(){
  $('path').innerHTML = MODULES.map(m => {
    const n = solvedCount(m.id), tot = m.puzzles.length;
    return `<button class="mcard" data-go="${m.id}" style="--accent:${m.accent}">
      <span class="n">Module ${m.num} · ${esc(m.era)}</span>
      <h3>${esc(m.title)}</h3>
      <p class="who">${esc(m.who)}</p>
      <div class="foot">${m.steps.length} steps · ${n}/${tot} puzzles solved
        <div class="bar"><i style="width:${100*n/tot}%"></i></div></div>
    </button>`;
  }).join('');
}

/* ---------------- routing ---------------- */
function parseHash(){
  const h = location.hash.replace(/^#/, '').split('/');
  const m = BY_ID[h[0]] ? h[0] : null;
  const tab = h[1] === 'practice' ? 'practice' : 'overview';
  const p = Math.max(0, parseInt(h[2] || '1', 10) - 1) || 0;
  return {m, tab, p};
}
function go(m, tab, p){
  const hash = m ? `#${m}/${tab||'overview'}${tab==='practice' ? '/' + ((p||0)+1) : ''}` : '#';
  if(location.hash === hash || (hash === '#' && !location.hash)) route(); else location.hash = hash;
}
function route(){
  const {m, tab, p} = parseHash();
  renderNav(m);
  if(!m){
    $('home').classList.remove('hidden'); $('module').classList.add('hidden');
    renderHome(); return;
  }
  $('home').classList.add('hidden'); $('module').classList.remove('hidden');
  renderModule(BY_ID[m], tab, Math.min(p, BY_ID[m].puzzles.length - 1));
}
addEventListener('hashchange', () => { route(); scrollTo({top:0, behavior:'instant' in window ? 'instant' : 'auto'}); });

document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]');
  if(!g) return;
  e.preventDefault();
  const id = g.dataset.go;
  go(id === 'home' ? null : id, g.dataset.tab, g.dataset.p ? +g.dataset.p : 0);
});
$('brand').addEventListener('click', () => go(null));
$('resetAll').addEventListener('click', () => {
  if(confirm('Clear every solved puzzle in this browser?')){ solved = {}; saveSolved(); route(); }
});

/* ---------------- module view ---------------- */
function renderModule(mod, tab, p){
  const el = $('module');
  el.style.setProperty('--accent', mod.accent);
  const builds = mod.builds.length
    ? `<div class="chips">Builds on: ${mod.builds.map(b => `<span class="chip" data-go="${b}">${BY_ID[b].num}. ${esc(BY_ID[b].title)}</span>`).join('')}</div>` : '';
  el.innerHTML = `<section class="panel" style="--accent:${mod.accent}">
    <div class="mhead">
      <span class="era">Module ${mod.num} · ${esc(mod.era)}</span>
      <h2>${esc(mod.title)}</h2>
      <p class="who">${esc(mod.who)}</p>
      ${builds}
    </div>
    <div class="tabs">
      <button data-go="${mod.id}" data-tab="overview" class="${tab==='overview'?'on':''}">Overview · ${mod.steps.length} steps</button>
      <button data-go="${mod.id}" data-tab="practice" class="${tab==='practice'?'on':''}">Practice · ${solvedCount(mod.id)}/${mod.puzzles.length}</button>
    </div>
    <div id="tabbody"></div>
  </section>`;
  if(tab === 'overview') renderOverview(mod); else renderPractice(mod, p);
}

function pips(i, n){
  let s = ''; for(let k = 0; k < n; k++) s += `<i class="${k <= i ? 'f' : ''}"></i>`;
  return `<span class="lvl">Step ${i+1} of ${n}<span class="pips">${s}</span></span>`;
}
function figs(mid, i){
  const list = (window.FIGS || {})[mid + ':' + i];
  if(!list) return '';
  return '<div class="figs">' + list.map(f => `<figure class="fig">${
    f.img ? `<a href="${f.img}" target="_blank" rel="noopener" title="Open full size"><img src="${f.img}" alt="${esc(f.cap)}" loading="lazy"></a>` : f.svg
  }<figcaption>${f.cap}${f.credit ? ` <span class="credit">${esc(f.credit)}</span>` : ''}</figcaption></figure>`).join('') + '</div>';
}
// "x_M", "a_now", "n_(i+1)", "10^((m − M + 5)/5)" → HTML sub/superscripts (one group, parentheses balanced)
function subsup(t){
  let out = '', i = 0;
  while(i < t.length){
    const c = t[i];
    if((c === '_' || c === '^') && i + 1 < t.length){
      let j = i + 1, inner;
      if(t[j] === '('){ let d = 0, k = j; for(; k < t.length; k++){ if(t[k] === '(') d++; else if(t[k] === ')' && --d === 0) break; } inner = t.slice(j + 1, k); i = k + 1; }
      else { let k = j; while(k < t.length && /[\w\u0370-\u03ff]/.test(t[k])) k++; inner = t.slice(j, k); i = k; }
      out += c === '_' ? `<sub>${inner}</sub>` : `<sup>${subsup(inner)}</sup>`;
    } else { out += c; i++; }
  }
  return out;
}
const CBASE = () => window.COMPANIONS_BASE || '../astronomy-companions/';
function see(mid, i){
  const list = (window.SEE || {})[mid + ':' + i], pages = window.COMPANION_PAGES || {};
  if(!list || !list.length) return '';
  return `<div class="see"><span class="tag t-see">Read more</span>${list.map(([pg, anchor, label]) => {
    const [file, name] = pages[pg];
    return `<a href="${CBASE()}${file}#${anchor}" target="_blank" rel="noopener"><b>${esc(name)}</b> <span class="eqn">${subsup(esc(label))}</span> ↗</a>`;
  }).join('')}</div>`;
}
function renderOverview(mod){
  const body = $('tabbody');
  const steps = mod.steps.map((s, i) => `
    <article class="step">
      <div class="rail"><span class="num">${i+1}</span>${i < mod.steps.length-1 ? '<span class="ln"></span>' : ''}</div>
      <div class="sbody">
        ${pips(i, mod.steps.length)}
        <h3>${s.title}</h3>
        <div class="ideabox ${figs(mod.id, i) ? '' : 'nofig'}"><p><span class="tag t-idea">The idea</span>${s.idea}</p>${figs(mod.id, i)}</div>
        <div class="eq">${dsp(s.formula)}</div>
        <p><span class="tag t-words">In words</span>${s.words}</p>
        <table class="vars"><thead><tr><th>Symbol</th><th>What it means</th><th>Units</th></tr></thead>
          <tbody>${s.vars.map(v => `<tr><td>${ilm(v[0])}</td><td>${v[1]}</td><td>${v[2]}</td></tr>`).join('')}</tbody></table>
        <div class="why"><span class="tag t-why">Why this formula?</span>${s.why}</div>
        ${s.note ? `<div class="note"><span class="tag t-note">Note</span>${s.note}</div>` : ''}
        ${see(mod.id, i)}
      </div>
    </article>`).join('');
  const related = mod.related.length
    ? `<p class="related">Go deeper in the Astronomy Companions: ${mod.related.map(r => `<a href="${CBASE()}${r[0]}" target="_blank" rel="noopener">${esc(r[1])}</a>`).join(' · ')}</p>` : '';
  body.innerHTML = `<p class="intro">${mod.intro}</p><div class="steps">${steps}</div>
    <div class="cta"><button class="btn primary" data-go="${mod.id}" data-tab="practice">Start the practice puzzles →</button>${related}</div>`;
  typeset(body);
}

/* ---------------- practice / puzzle board ---------------- */
function shuffle(a){ a = a.slice(); for(let i = a.length-1; i > 0; i--){ const j = Math.floor(Math.random()*(i+1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function renderPractice(mod, p){
  const body = $('tabbody');
  const pz = mod.puzzles[p];
  const dots = mod.puzzles.map((q, i) =>
    `<button class="pdot ${i===p?'on':''} ${isSolved(mod.id,i)?'done':''}" data-go="${mod.id}" data-tab="practice" data-p="${i}" title="${esc(q.title)}">${isSolved(mod.id,i)?'✓':i+1}</button>`).join('');
  const kind = pz.lines.some(l => l.label) ? 'Order the steps' : 'Complete the formula';
  let slotN = 0;
  const lines = pz.lines.map(l => `<div class="line">${l.label ? `<div class="label">${l.label}</div>` : ''}<div class="row">${
    l.parts.map(part => {
      if(typeof part === 'string') return `<span class="tx">${ilm(part)}</span>`;
      if(part.t) return `<span class="tx">${part.t}</span>`;
      return `<span class="slot" role="button" tabindex="0" data-slot="${slotN++}" aria-label="empty slot"></span>`;
    }).join('')}</div></div>`).join('');
  const tiles = shuffle(pz.tiles).map(t => `<button class="tile" draggable="true" data-tile="${t.id}">${ilm(t.tex)}</button>`).join('');

  body.innerHTML = `
    <div class="pnav">${dots}</div>
    <div class="pcard">
      <span class="lvltag">${esc(pz.lvl)}</span><span class="kind">${kind}</span>
      <h3>${pz.title}</h3>
      <p class="prompt">${pz.prompt}</p>
      <div class="board" id="board">${lines}</div>
      <div class="tray" id="tray"><span class="trayhint">Formula tiles · tap one, then tap a slot (or drag). Some are decoys.</span>${tiles}</div>
      <div class="pbtns">
        <button class="btn primary" id="bCheck">Check</button>
        <button class="btn" id="bHint">Hint: place one</button>
        <button class="btn" id="bReset">Reset</button>
        <button class="btn" id="bShow">Show answer</button>
        <span style="flex:1"></span>
        <button class="btn" id="bPrev" ${p===0?'disabled':''}>← Prev</button>
        <button class="btn" id="bNext">${p===mod.puzzles.length-1 ? 'Finish module' : 'Next →'}</button>
      </div>
      <div class="fb" id="fb"></div>
    </div>`;
  typeset(body);
  wireBoard(mod, p, pz);
}

function wireBoard(mod, p, pz){
  const board = $('board'), tray = $('tray'), fb = $('fb');
  const slotSpecs = [];
  pz.lines.forEach(l => l.parts.forEach(part => { if(part && part.s) slotSpecs.push(part); }));
  const slots = [...board.querySelectorAll('.slot')];
  const tileById = id => tray.parentElement.querySelector(`.tile[data-tile="${id}"]`);
  const tileSpec = id => pz.tiles.find(t => t.id === id);
  let selected = null;

  const clearMarks = () => { slots.forEach(s => s.classList.remove('ok','bad')); fb.className = 'fb'; fb.innerHTML = ''; };
  const select = t => {
    if(selected) selected.classList.remove('sel');
    selected = (t && t !== selected) ? t : null;
    if(selected) selected.classList.add('sel');
    slots.forEach(s => s.classList.toggle('target', !!selected));
  };
  function place(tile, slot){
    clearMarks();
    const prev = slot.querySelector('.tile');
    const from = tile.parentElement.classList.contains('slot') ? tile.parentElement : null;
    if(prev && prev !== tile){
      if(from){ from.appendChild(prev); } else tray.appendChild(prev);   // swap or return
    }
    slot.appendChild(tile);
    [slot, from].forEach(s => s && s.classList.toggle('filled', !!s.querySelector('.tile')));
    select(null);
  }
  function toTray(tile){
    clearMarks();
    const from = tile.parentElement;
    tray.appendChild(tile);
    if(from.classList.contains('slot')) from.classList.remove('filled');
    select(null);
  }

  // tap / click
  tray.parentElement.addEventListener('click', e => {
    const tile = e.target.closest('.tile');
    const slot = e.target.closest('.slot');
    if(slot){
      if(selected && selected !== tile){ place(selected, slot); return; }
      if(tile){ // tapping a placed tile with nothing selected → pick it up
        if(selected === tile){ toTray(tile); return; }
        select(tile); return;
      }
      if(!selected){ showFb('info', 'Pick a formula tile from the tray first, then tap this slot.'); }
      return;
    }
    if(tile){ select(tile); return; }
    if(e.target.closest('#tray') && selected && selected.parentElement.classList.contains('slot')){ toTray(selected); }
  });
  slots.forEach(s => s.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); s.click(); } }));

  // drag & drop (desktop)
  let dragTile = null;
  tray.parentElement.addEventListener('dragstart', e => {
    const t = e.target.closest('.tile'); if(!t) return;
    dragTile = t; t.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', t.dataset.tile);
  });
  tray.parentElement.addEventListener('dragend', () => { if(dragTile) dragTile.classList.remove('dragging'); dragTile = null; slots.forEach(s => s.classList.remove('target')); });
  slots.concat([tray]).forEach(z => {
    z.addEventListener('dragover', e => { if(dragTile){ e.preventDefault(); if(z !== tray) z.classList.add('target'); } });
    z.addEventListener('dragleave', () => z.classList.remove('target'));
    z.addEventListener('drop', e => {
      e.preventDefault(); z.classList.remove('target');
      if(!dragTile) return;
      if(z === tray) toTray(dragTile); else place(dragTile, z);
    });
  });

  // feedback
  function showFb(kind, html){ fb.className = 'fb show ' + kind; fb.innerHTML = html; typeset(fb); }
  const placedId = s => { const t = s.querySelector('.tile'); return t ? t.dataset.tile : null; };

  function check(){
    slots.forEach(s => s.classList.remove('ok','bad'));
    let empty = 0; const msgs = [];
    slots.forEach((s, i) => {
      const id = placedId(s), spec = slotSpecs[i];
      if(!id){ empty++; return; }
      if(spec.s.includes(id)){ s.classList.add('ok'); return; }
      s.classList.add('bad');
      const t = tileSpec(id);
      const why = (spec.wrong && spec.wrong[id]) || t.miss || 'That piece belongs in a different slot.';
      msgs.push(`<li>${ilm(t.tex)} — ${why}</li>`);
    });
    if(!msgs.length && !empty){
      solved[mod.id + ':' + p] = true; saveSolved();
      const dot = document.querySelector(`.pdot[data-p="${p}"]`); if(dot){ dot.classList.add('done'); dot.textContent = '✓'; }
      const tabBtn = document.querySelector('.tabs button[data-tab="practice"]');
      if(tabBtn) tabBtn.textContent = `Practice · ${solvedCount(mod.id)}/${mod.puzzles.length}`;
      showFb('good', `<b>Correct!</b> ${pz.explain}`);
    } else if(!msgs.length){
      showFb('info', `So far so good. ${empty} slot${empty>1?'s':''} still empty.`);
    } else {
      showFb('bad', `<b>${msgs.length} piece${msgs.length>1?'s':''} not right yet</b>${empty ? ` (and ${empty} empty)` : ''}:<ul>${msgs.join('')}</ul>`);
    }
  }

  function hint(){
    for(let i = 0; i < slots.length; i++){
      const s = slots[i], id = placedId(s), spec = slotSpecs[i];
      if(id && spec.s.includes(id)) continue;
      // a correct tile for this slot not already correctly placed elsewhere
      const cand = spec.s.find(cid => {
        const t = tileById(cid); if(!t) return false;
        const ps = t.parentElement; if(!ps.classList.contains('slot')) return true;
        const j = slots.indexOf(ps); return !slotSpecs[j].s.includes(cid);
      });
      if(cand){ place(tileById(cand), s); s.classList.add('ok'); showFb('info', 'Placed one piece for you (green). Check the rest when you’re ready.'); return; }
    }
    showFb('info', 'Every piece is already in place. Press <b>Check</b>.');
  }
  function reset(){ [...board.querySelectorAll('.tile')].forEach(t => tray.appendChild(t)); slots.forEach(s => s.classList.remove('filled')); clearMarks(); select(null); }
  function show(){
    reset();
    const used = new Set();
    slots.forEach((s, i) => { const id = slotSpecs[i].s.find(x => !used.has(x)); used.add(id); s.appendChild(tileById(id)); s.classList.add('filled','ok'); });
    showFb('info', `<b>Answer shown.</b> ${pz.explain} <br><span style="color:var(--muted)">Reset and try it yourself to mark this puzzle solved.</span>`);
  }

  $('bCheck').onclick = check; $('bHint').onclick = hint; $('bReset').onclick = reset; $('bShow').onclick = show;
  $('bPrev').onclick = () => go(mod.id, 'practice', p - 1);
  $('bNext').onclick = () => {
    if(p < mod.puzzles.length - 1) return go(mod.id, 'practice', p + 1);
    const next = MODULES[MODULES.indexOf(mod) + 1];
    next ? go(next.id, 'overview') : go(null);
  };
}

/* ---------------- starfield ---------------- */
(function(){
  const cv = $('starfield'), x = cv.getContext('2d'); let stars = [];
  function resize(){ cv.width = innerWidth; cv.height = innerHeight;
    stars = Array.from({length: Math.min(280, (innerWidth*innerHeight)/7000)}, () => ({
      x: Math.random()*cv.width, y: Math.random()*cv.height, r: Math.random()*1.3+0.2, tw: Math.random()*6.28, sp: 0.5+Math.random()*1.5 })); }
  let t = 0;
  function frame(){ t += 0.02; x.clearRect(0,0,cv.width,cv.height);
    stars.forEach(s => { const a = 0.4+0.6*Math.abs(Math.sin(t*s.sp+s.tw));
      x.fillStyle = `rgba(220,228,255,${a*0.7})`; x.beginPath(); x.arc(s.x,s.y,s.r,0,7); x.fill(); });
    requestAnimationFrame(frame); }
  addEventListener('resize', resize); resize(); frame();
})();

route();
})();

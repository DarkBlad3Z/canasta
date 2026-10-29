// Black-box player: interacts ONLY through the rendered page (buttons, cards, hint text).
// Peeks at engine state only to verify invariants (card conservation, score sums).
const {JSDOM, VirtualConsole} = require('jsdom'); const fs = require('fs');
const html = fs.readFileSync('/sessions/youthful-gifted-turing/mnt/outputs/game_build/game.html', 'utf8');
const SEED = +(process.argv[2] || 1), GAMES = +(process.argv[3] || 3), CHAOS = +(process.argv[4] || 0.2), TRANSCRIPT = process.argv[5] === 't';
function prng(seed){ let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const vc = new VirtualConsole(); const jsErr = [];
vc.on('jsdomError', e => jsErr.push(String(e.stack || e).slice(0, 600))); vc.on('error', e => jsErr.push('console.error ' + e));
const dom = new JSDOM(html, {runScripts:'dangerously', virtualConsole:vc, pretendToBeVisual:true,
  beforeParse(w){ w.__autoplay = true; w.Math.random = prng(SEED); w.setTimeout = (f, ms) => setTimeout(f, 0); }});
const w = dom.window, doc = w.document, R = prng(SEED * 7 + 3);
const q = s => doc.querySelector(s), qa = s => [...doc.querySelectorAll(s)];
const click = el => el.dispatchEvent(new w.MouseEvent('click', {bubbles:true}));
const btn = a => q(`button[data-act="${a}"]`);
const enabled = a => { const b = btn(a); return !!(b && !b.disabled); };
const press = a => { const b = btn(a); if (!b) throw new Error('no button ' + a); if (b.disabled) throw new Error('disabled button ' + a + ' | status: ' + status() + ' | hint: ' + hintTxt()); click(b); };
const status = () => (q('.status') || {}).textContent || '';
const hintTxt = () => { const n = q('.notice.hint'); return n ? n.textContent.replace(/^Hint:\s*/, '') : ''; };
const errTxt = () => { const n = q('.notice.err'); return n ? n.textContent : ''; };
const hand = () => qa('.hand [data-card]').map(e => ({id:+e.dataset.card, txt:e.textContent, sel:e.classList.contains('sel'), hint:e.classList.contains('hint')}));
function selectOnly(ids){
  const want = new Set(ids);
  for (const c of hand()) if (c.sel && !want.has(c.id)) click(q(`.hand [data-card="${c.id}"]`));
  for (const id of ids){ const el = q(`.hand [data-card="${id}"]`); if (!el) throw new Error('missing card ' + id); if (!el.classList.contains('sel')) click(el); }
}
const tick = () => new Promise(r => setTimeout(r, 0));
const st = x => w.eval(x);
const issues = [], tr = [];
const stats = {games:0, rounds:0, humanOpenedViaPack:0, humanPack:0, humanOut:0, partnerOut:0, oppOut:0, stockEnd:0, special:0, humanSpecial:0,
  canastasUs:0, canastasThem:0, chaosActions:0, chaosErrors:0, hintSteps:0, winsUs:0, winsThem:0, scoreChecks:0, hintKinds:{}};
function cardCount(){
  return st(`(()=>{ let n=0; rs.hands.forEach(h=>n+=h.length); n+=rs.stock.length+rs.pack.length; rs.talon.forEach(t=>n+=t.length);
    rs.teams.forEach(t=>{ t.melds.forEach(m=>n+=m.cards.length); n+=t.threes.length; }); n+=staged.flat().length;
    if(rs.end&&rs.end.special) n+=rs.end.special.cards.length; return n; })()`);
}
function check(ctx){
  const n = cardCount(); if (n !== 108) issues.push(`CARD COUNT ${n} after ${ctx}`);
  if (jsErr.length){ issues.push('JS ERROR after ' + ctx + ': ' + jsErr.join(' | ')); jsErr.length = 0; }
}
function log(s){ if (TRANSCRIPT) tr.push(s); }
async function chaos(){
  const acts = ['meld','discard','pack','lay3','commit','undo','draw','hint'];
  for (let i = 0; i < 1 + Math.floor(R() * 3); i++){
    const hs = hand(); if (!hs.length) return;
    const k = 1 + Math.floor(R() * Math.min(4, hs.length));
    const pickIds = []; while (pickIds.length < k){ const c = hs[Math.floor(R() * hs.length)]; if (!pickIds.includes(c.id)) pickIds.push(c.id); }
    selectOnly(pickIds);
    const melds = qa('.meld.tgt');
    let did = '';
    if (melds.length && R() < 0.25){ click(melds[Math.floor(R() * melds.length)]); did = 'click meld'; stats.chaosActions++; }
    else { const a = acts[Math.floor(R() * acts.length)]; if (enabled(a)){ press(a); did = a; stats.chaosActions++; } }
    if (did){ const e = errTxt(); if (e) stats.chaosErrors++; log('  CHAOS ' + did + ' with ' + pickIds.length + ' cards' + (e ? ' -> "' + e + '"' : ' -> ok')); }
    check('chaos ' + did);
    if (q('.modalbg') || st('rs.ended') || st('rs.current') !== 0) return;
  }
  if (enabled('undo') && R() < 0.8) press('undo');
}
async function humanTurn(){
  let chaosDone = false;
  for (let guard = 0; guard < 40; guard++){
    if (q('.modalbg')) return;
    if (st('rs.ended') || st('rs.current') !== 0 || st('aiBusy')) return;
    if (!chaosDone && R() < CHAOS){ chaosDone = true; await chaos(); if (q('.modalbg') || st('rs.ended') || st('rs.current') !== 0) return; }
    press('hint');
    const ht = hintTxt(), hl = hand().filter(c => c.hint).map(c => c.id);
    if (!ht){ issues.push('Empty hint. Status: ' + status()); return; }
    stats.hintSteps++;
    log('  HINT: ' + ht);
    let action;
    if (/^You can go out this turn/.test(ht)){ action = 'askout'; press('askout'); press('askout'); stats.asks = (stats.asks || 0) + 1; }
    else if (/^Lay down your 3s/.test(ht)){ action = 'lay3'; press('lay3'); }
    else if (/^Take the pack/.test(ht)){ action = 'pack'; press('pack'); stats.humanPack++; }
    else if (/^You hold a special hand/.test(ht)){ action = 'special'; press('special'); stats.humanSpecial++; }
    else if (/Step \d+ of \d+/.test(ht)){ action = 'stage ' + hl.length; selectOnly(hl); press('meld'); }
    else if (/staged meld \(\d+ points\) is enough\. Now click "Pick up pack"/.test(ht)){ action = 'pack-open'; press('pack'); stats.humanOpenedViaPack++; }
    else if (/staged opening meld is ready/.test(ht)){ action = 'commit'; press('commit'); }
    else if (/Draw a card, then click "Lay down opening meld"/.test(ht)){ action = 'draw'; press('draw'); }
    else if (/^Your staged cards are not the suggested/.test(ht)){ action = 'undo'; press('undo'); }
    else if (/^You cannot open this turn\. Click "Undo staging"/.test(ht)){ action = 'undo'; press('undo'); }
    else if (/^Draw from the draw pile/.test(ht)){ action = 'draw'; press('draw'); }
    else if (/^Meld:/.test(ht)){
      selectOnly(hl);
      if (/glowing/.test(ht)){ const m = q('.meld.hint'); if (!m){ issues.push('Hint says glowing meld but none glows: ' + ht); return; } action = 'meld->target'; click(m); }
      else { action = 'meld'; press('meld'); }
    }
    else if (/Discard/.test(ht)){
      if (hl.length !== 1){ issues.push('Discard hint without exactly one highlighted card: ' + ht); return; }
      selectOnly(hl); action = 'discard'; press('discard');
      if (/still holding a 3/.test(errTxt())){ issues.push('3s warning while following hints'); press('discard'); }
    }
    else { issues.push('Unrecognised hint: ' + ht); return; }
    stats.hintKinds[action.split(' ')[0]] = (stats.hintKinds[action.split(' ')[0]] || 0) + 1;
    log('  DO: ' + action);
    const e = errTxt();
    if (e) issues.push(`Following the hint produced an error. Hint: "${ht}" Action: ${action} Error: "${e}"`);
    check('hint action ' + action);
    if (action === 'discard' || action === 'special') return;
  }
  issues.push('Turn did not finish within 40 steps. Status: ' + status() + ' Hint: ' + hintTxt());
}
function recordRound(){
  const r = st(`({end:rs.end.reason, seat:rs.end.seat, sp:rs.end.special&&rs.end.special.name, t0:rs.result.teams[0], t1:rs.result.teams[1],
    c0:rs.teams[0].melds.filter(m=>m.closed).length, c1:rs.teams[1].melds.filter(m=>m.closed).length, scores:game.scores.slice(), over:game.over, winner:game.winner})`);
  stats.rounds++; stats.canastasUs += r.c0; stats.canastasThem += r.c1;
  if (r.end === 'out'){ if (r.seat === 0) stats.humanOut++; else if (r.seat === 2) stats.partnerOut++; else stats.oppOut++; }
  else if (r.end === 'stock') stats.stockEnd++; else stats.special++;
  for (const [t, tt] of [[0, r.t0], [1, r.t1]]){
    const sum = tt.lines.reduce((a, l) => a + l.pts, 0); stats.scoreChecks++;
    if (sum !== tt.total) issues.push(`Score lines do not add up for team ${t}: ${sum} vs ${tt.total}`);
  }
  const modalTxt = q('.modal') ? q('.modal').textContent : '';
  if (!/Round \d+ over/.test(modalTxt)) issues.push('Round modal missing title: ' + modalTxt.slice(0, 80));
  if (TRANSCRIPT) log('FEED:\n    ' + st('feed.slice(-28).join("\\n    ")'));
  log(`ROUND END: ${r.end}${r.sp ? ' (' + r.sp + ')' : ''} seat ${r.seat}. Us ${r.t0.total} [${r.t0.lines.map(l => l.label + ' ' + l.pts).join('; ')}]  Them ${r.t1.total} [${r.t1.lines.map(l => l.label + ' ' + l.pts).join('; ')}]  Scores ${r.scores}`);
  return r;
}
async function main(){
  let steps = 0;
  try {
    while (stats.games < GAMES && steps++ < 300000){
      await tick();
      if (q('.modalbg')){
        if (!st('rs.ended') && st('rs.pendingAsk')){ const yes = R() < 0.7; press(yes ? 'askyes' : 'askno'); stats.askedByNorth = (stats.askedByNorth || 0) + 1; continue; }
        if (!st('rs.ended')){ issues.push('A modal is open during play: ' + q('.modal').textContent.slice(0, 60)); break; }
        const r = recordRound();
        if (r.over){ stats.games++; if (r.winner === 0) stats.winsUs++; else stats.winsThem++; log(`GAME OVER: winner team ${r.winner} ${r.scores}`); press('newgame2'); }
        else press('next');
        check('modal');
        continue;
      }
      if (st('rs.current') === 0 && !st('aiBusy') && !st('rs.ended')){
        log(`YOUR TURN (round ${st('game.round')}, hand ${st('rs.hands[0].length')}, stock ${st('rs.stock.length')}, pack ${st('rs.pack.length')}, opened ${st('rs.teams[0].opened')})`);
        const before = st('rs.turnNo');
        await humanTurn();
        if (!q('.modalbg') && !st('rs.ended') && st('rs.current') === 0 && st('rs.turnNo') === before && !st('aiBusy')){ issues.push('Human turn stuck. Status: ' + status() + ' | hint ' + hintTxt()); break; }
      }
    }
  } catch (e){ issues.push('BOT EXCEPTION: ' + e.message); }
  if (TRANSCRIPT) fs.writeFileSync('/tmp/jd/transcript_' + SEED + '.txt', tr.join('\n') + '\n\nFEED (last 60):\n' + st('feed.join("\\n")'));
  const uniq = {}; issues.forEach(i => { const k = i.slice(0, 220); uniq[k] = (uniq[k] || 0) + 1; });
  console.log(JSON.stringify({seed:SEED, stats, issueCount:issues.length, issues:Object.entries(uniq).slice(0, 20)}, null, 1));
  process.exit(0);
}
setTimeout(main, 20);

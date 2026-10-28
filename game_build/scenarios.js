// Scripted scenarios for rare paths. Each builds an exact table, then plays through real DOM clicks.
const {JSDOM, VirtualConsole} = require('jsdom'); const fs = require('fs');
const html = fs.readFileSync('/sessions/youthful-gifted-turing/mnt/outputs/game_build/game.html', 'utf8');
const results = [];
function page(seed = 7){
  let s = seed >>> 0; const timers = []; const jsErr = [];
  const vc = new VirtualConsole(); vc.on('jsdomError', e => jsErr.push(String(e.stack || e).slice(0, 400)));
  const dom = new JSDOM(html, {runScripts:'dangerously', virtualConsole:vc, pretendToBeVisual:true,
    beforeParse(w){ w.Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; w.setTimeout = (f) => { timers.push(f); return timers.length; }; }});
  const w = dom.window, d = w.document;
  const P = {
    w, d, timers, jsErr,
    ev: x => w.eval(x),
    q: x => d.querySelector(x), qa: x => [...d.querySelectorAll(x)],
    click(el){ if (!el) throw new Error('click on missing element'); el.dispatchEvent(new w.MouseEvent('click', {bubbles:true})); },
    press(a){ const b = d.querySelector(`button[data-act="${a}"]`); if (!b) throw new Error('no button ' + a); if (b.disabled) throw new Error('button disabled: ' + a); P.click(b); },
    enabled(a){ const b = d.querySelector(`button[data-act="${a}"]`); return !!(b && !b.disabled); },
    hint(){ P.press('hint'); const n = d.querySelector('.notice.hint'); return n ? n.textContent : ''; },
    notice(){ return [...d.querySelectorAll('.notice')].filter(n => !n.classList.contains('hint')).map(n => n.textContent).join(' | '); },
    err(){ const n = d.querySelector('.notice.err'); return n ? n.textContent : ''; },
    selectRanks(ranks){ // select cards in hand by visible rank labels, e.g. ['K','K','2']
      P.clearSel();
      const used = new Set();
      for (const r of ranks){
        const el = [...d.querySelectorAll('.hand [data-card]')].find(e => !used.has(e.dataset.card) && P.ev(`rs.hands[0].find(c=>c.id===${e.dataset.card}).rank`) === r);
        if (!el) throw new Error('no card of rank ' + r + ' in hand'); used.add(el.dataset.card); P.click(el);
      }
    },
    clearSel(){ let el; while ((el = d.querySelector('.hand [data-card].sel'))) P.click(el); },
    selectHinted(){ P.clearSel(); const ids = [...d.querySelectorAll('.hand [data-card].hint')].map(e => e.dataset.card); for (const id of ids) P.click(d.querySelector(`.hand [data-card="${id}"]`)); return ids.length; },
    runTimers(max = 50){ let n = 0; while (timers.length && n++ < max){ timers.shift()(); } },
    rig(js){ w.eval(js); w.eval('render()'); }
  };
  // helpers inside the page for building hands
  w.eval(`var __id = 700000; function C(r, s){ return {id: __id++, rank: r, suit: s || (r === 'JK' ? 'R' : ['S','H','D','C'][__id % 4])}; }
          function many(spec){ const out = []; for (const part of spec.split(' ')){ const [r, n] = part.split('x'); for (let i = 0; i < (+n || 1); i++) out.push(C(r)); } return out; }
          function meld(rank, spec, closed){ const cards = many(spec); return {rank, cards, pure: (rank === '7' || (rank === 'A' && !cards.some(isWild))), closed: !!closed}; }`);
  return P;
}
function test(name, fn){
  try { const P = fn(); const extra = P && P.jsErr && P.jsErr.length ? ' JS errors: ' + P.jsErr.join(' | ') : '';
    results.push({name, ok: !extra, msg: extra}); }
  catch (e){ results.push({name, ok:false, msg: e.message}); }
}
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };
// put the game in a known human turn
const humanTurn = (P, phase = 'draw') => P.rig(`rs.current = 0; rs.phase = '${phase}'; rs.drewStock = ${phase === 'play'}; aiBusy = false; modal = null; notice = null; staged = []; sel.clear(); clearHint();`);

test('Open by taking the pack, following hints step by step', () => {
  const P = page(); humanTurn(P);
  P.rig(`rs.hands[0] = many('Kx2 Qx3 Jx3 10x3 9x3 4'); rs.pack = [C('5'), C('8'), C('K','D')]; rs.teams[0].opened = false; rs.needs[0] = 125;`);
  let h = P.hint(); expect(/open by taking the pack/.test(h), 'hint did not suggest opening with the pack: ' + h);
  for (let i = 0; i < 6 && /Step \d+ of/.test(h); i++){ P.selectHinted(); P.press('meld'); expect(!P.err(), 'staging error: ' + P.err()); h = P.hint(); }
  expect(/Now click "Pick up pack"/.test(h), 'final step hint wrong: ' + h);
  P.press('pack');
  expect(P.ev('rs.teams[0].opened') === true, 'team did not open');
  expect(P.ev('rs.pack.length') === 0, 'pack not taken');
  expect(P.ev("rs.teams[0].melds.some(m => m.rank === 'K' && m.cards.length === 3)"), 'no K meld of top card + pair');
  expect(P.ev('rs.pendingTalon') === null, 'talon should not be given when opening with the pack');
  h = P.hint(); expect(/Discard|Meld/.test(h), 'after pack opening, hint should be meld/discard: ' + h);
  return P;
});
test('Pack opening counts the pair toward the minimum (official rule)', () => {
  const P = page(); humanTurn(P);
  // 105 from other cards + 20 from the pair = 125 exactly
  P.rig(`rs.hands[0] = many('Kx2 Qx3 Jx3 10x3 5x3 8'); rs.pack = [C('6'), C('K','D'), C('K','C')]; rs.pack.pop(); rs.pack.push(C('K','C')); rs.teams[0].opened = false; rs.needs[0] = 125;`);
  P.selectRanks(['Q','Q','Q']); P.press('meld'); P.selectRanks(['J','J','J']); P.press('meld'); P.selectRanks(['10','10','10']); P.press('meld'); P.selectRanks(['5','5','5']); P.press('meld');
  P.press('pack');
  expect(P.ev('rs.teams[0].opened') === true, 'should open: 105 + pair 20 = 125. Notice: ' + P.notice());
  return P;
});
test('Dream Hand +4 ends the game on the spot', () => {
  const P = page(); humanTurn(P);
  P.rig(`rs.hands[0] = many('Kx5 Qx5 JKx3'); rs.stock.push(C('JK','B')); rs.teams[0].opened = false;`);
  P.press('draw');
  const b = P.q('button[data-act="special"]'); expect(b && /Dream Hand \+4/.test(b.textContent), 'declare button missing: ' + (b ? b.textContent : 'none'));
  P.click(b);
  const m = P.q('.modal'); expect(m && /win the game/.test(m.textContent), 'game-over message missing');
  expect(P.q('button[data-act="newgame2"]'), 'new game button missing');
  expect(P.ev('game.scores[0]') >= 8500 && P.ev('game.over'), 'score/over wrong');
  return P;
});
test('Courtesy rule: special hand allowed on first turn after partner opens, not later', () => {
  const P = page(); humanTurn(P);
  P.rig(`rs.teams[0].opened = true; rs.courtesy[0] = true; rs.hands[0] = many('8x4 9x4 10x3 Jx2'); rs.stock.push(C('J','D'));`);
  P.press('draw');
  expect(P.q('button[data-act="special"]'), 'Garbage should be declarable on the courtesy turn');
  P.rig(`rs.courtesy[0] = false;`);
  expect(!P.q('button[data-act="special"]'), 'special hand should NOT be declarable after the courtesy turn');
  return P;
});
test('Wild meld: start it, then wilds are blocked elsewhere until it is finished', () => {
  const P = page(); humanTurn(P, 'play');
  P.rig(`rs.teams[0].opened = true; rs.teams[0].melds = [meld('K','Kx5')]; rs.hands[0] = many('2x3 JK 10 10 5 6');`);
  P.selectRanks(['2','2','2']); P.press('meld'); expect(P.ev("rs.teams[0].melds.some(m => m.rank === 'W' && m.cards.length === 3)"), 'wild meld not started: ' + P.notice());
  P.selectRanks(['JK']); P.click(P.q('.meld[data-meld="K"]')); expect(/unfinished wild meld/.test(P.err()), 'expected unfinished-wild-meld error, got: ' + P.notice());
  P.selectRanks(['JK']); P.click(P.q('.meld[data-meld="W"]')); expect(P.ev("rs.teams[0].melds.find(m => m.rank === 'W').cards.length") === 4, 'joker not added to wild meld: ' + P.notice());
  return P;
});
test('SWAD: empty discard pile blocks 7, Ace, wild and dead cards', () => {
  const P = page(); humanTurn(P, 'play');
  P.rig(`rs.pack = []; rs.teams[1].melds = [meld('9','9x7',true)]; rs.teams[0].opened = true; rs.hands[0] = many('7 A 2 9 8 K');`);
  for (const r of ['7','A','9']){ P.selectRanks([r]); P.press('discard'); expect(/SWAD/.test(P.err()), r + ' should be blocked by SWAD, got: ' + P.notice()); }
  P.selectRanks(['2']); P.press('discard'); expect(/wild card can only be discarded/.test(P.err()), 'wild discard should be blocked');
  P.selectRanks(['8']); P.press('discard'); expect(P.ev('rs.current') === 1, '8 should be a legal discard');
  return P;
});
test('Holding only SWAD cards: the practice shortcut lets you discard', () => {
  const P = page(); humanTurn(P, 'play');
  P.rig(`rs.pack = []; rs.teams[0].opened = true; rs.hands[0] = many('7 A');`);
  P.selectRanks(['7']); P.press('discard'); expect(P.ev('rs.current') === 1, 'should be allowed when nothing else is legal: ' + P.notice());
  return P;
});
test('Keep-2 rule: cannot meld down to one card without two canastas', () => {
  const P = page(); humanTurn(P, 'play');
  P.rig(`rs.teams[0].opened = true; rs.teams[0].melds = [meld('Q','Qx4')]; rs.hands[0] = many('Kx3 5');`);
  P.selectRanks(['K','K','K']); P.press('meld'); expect(/Keep at least 2 cards/.test(P.err()), 'expected keep-2 error, got: ' + P.notice());
  return P;
});
test('Going out is blocked by an unfinished 7s meld', () => {
  const P = page(); humanTurn(P, 'play');
  P.rig(`rs.teams[0].opened = true; rs.teams[0].melds = [meld('K','Kx7',true), meld('Q','Qx7',true), meld('7','7x3')]; rs.hands[0] = many('9');`);
  P.selectRanks(['9']); P.press('discard'); expect(/unfinished meld of 7s/.test(P.err()), 'expected unfinished 7s error, got: ' + P.notice());
  return P;
});
test('Never left holding one card you cannot discard (new 7s meld with two canastas)', () => {
  const P = page(); humanTurn(P, 'play');
  P.rig(`rs.teams[0].opened = true; rs.teams[0].melds = [meld('K','Kx7',true), meld('Q','Qx7',true)]; rs.hands[0] = many('7x3 9');`);
  P.selectRanks(['7','7','7']); P.press('meld');
  expect(/Keep at least 2 cards/.test(P.err()), 'melding 7s down to one card must be refused, got: ' + P.notice());
  const h = P.hint(); expect(!/Meld: start a meld of 3 7s/.test(h), 'hint should not suggest it: ' + h);
  return P;
});
test('Taking the pack cannot leave you stuck either', () => {
  const P = page(); humanTurn(P, 'draw');
  P.rig(`rs.teams[0].opened = true; rs.teams[0].melds = [meld('K','Kx7',true), meld('Q','Qx7',true)]; rs.hands[0] = many('7x2'); rs.pack = [C('7','D')];`);
  P.press('pack'); expect(/legally discard/.test(P.err()), 'pack pickup leaving no legal card must be refused, got: ' + P.notice());
  return P;
});
test('Going out by following hints, with the +100 bonus', () => {
  const P = page(); humanTurn(P, 'play');
  P.rig(`rs.teams[0].opened = true; rs.teams[0].melds = [meld('K','Kx7',true), meld('J','Jx7',true), meld('Q','Qx4')]; rs.hands[0] = many('Q 5'); rs.pack = [C('6')];`);
  let h = P.hint(); expect(/^Hint: Meld: add 1 Queens/.test(h), 'expected meld hint, got: ' + h); P.selectHinted(); P.press('meld');
  h = P.hint(); expect(/to go out/.test(h), 'expected go-out hint, got: ' + h); P.selectHinted(); P.press('discard');
  const m = P.q('.modal'); expect(m && /You went out/.test(m.textContent) && /Going-out bonus/.test(m.textContent), 'round modal wrong: ' + (m ? m.textContent.slice(0, 200) : 'none'));
  return P;
});
test('Talon: you are told when your talon joins your hand', () => {
  const P = page(); humanTurn(P, 'play');
  P.rig(`rs.teams[0].opened = false; rs.openedCount = 0; rs.needs[0] = 125; rs.hands[0] = many('Kx3 Qx3 Jx3 Ax2 5 6 8'); rs.pack = [C('4')];`);
  P.selectRanks(['K','K','K']); P.press('meld'); P.selectRanks(['Q','Q','Q']); P.press('meld'); P.selectRanks(['J','J','J']); P.press('meld');
  P.selectRanks(['A','A','5']); P.press('meld'); // invalid group on purpose
  expect(/one rank only/.test(P.err()), 'mixed group should be rejected');
  P.ev('sel.clear()'); P.ev('render()');
  // 90 points is not enough; undo and use a 125 meld instead
  P.press('commit'); expect(/needs 125/.test(P.err()), 'expected not-enough-points error, got: ' + P.notice());
  P.press('undo'); P.rig(`rs.hands[0].push(...many('Kx1 Qx1 2'));`);
  P.selectRanks(['K','K','K','K']); P.press('meld'); P.selectRanks(['Q','Q','Q','Q']); P.press('meld'); P.selectRanks(['J','J','J']); P.press('meld'); P.selectRanks(['A','A','2']); P.press('meld');
  P.press('commit'); expect(P.ev('rs.teams[0].opened'), 'should have opened: ' + P.notice());
  P.selectRanks(['5']); P.press('discard');
  expect(P.ev('rs.talon[0].length') === 4, 'first team to open should get a talon of 4, got ' + P.ev('rs.talon[0].length'));
  P.runTimers(10); // three computer turns
  expect(P.ev('rs.current') === 0, 'should be back to you, current=' + P.ev('rs.current'));
  expect(/Your talon \(4 cards\)/.test(P.notice()), 'talon notice missing: ' + P.notice());
  return P;
});
test('Holding a 3: warned once before discarding, and it counts against you', () => {
  const P = page(); humanTurn(P, 'play');
  P.rig(`rs.teams[0].opened = false; rs.hands[0] = many('3 8 9 10');`);
  P.selectRanks(['8']); P.press('discard'); expect(/still holding a 3/.test(P.err()), 'expected 3s warning');
  P.selectRanks(['8']); P.press('discard'); expect(P.ev('rs.current') === 1, 'second click should discard');
  return P;
});
test('Adding wilds to complete a canasta via the glowing meld', () => {
  const P = page(); humanTurn(P, 'play');
  P.rig(`rs.teams[0].opened = true; rs.teams[0].melds = [meld('K','Kx5')]; rs.hands[0] = many('2 JK 9 9 4');`);
  const h = P.hint(); expect(/glowing Kings meld/.test(h), 'expected wild-completion hint: ' + h);
  expect(P.q('.meld.hint[data-meld="K"]'), 'Kings meld should glow');
  P.selectHinted(); P.click(P.q('.meld.hint'));
  expect(P.ev("rs.teams[0].melds.find(m => m.rank === 'K').closed"), 'canasta should be complete: ' + P.notice());
  expect(/MIXED CANASTA/.test(P.q('.melds').textContent), 'canasta label missing');
  return P;
});
test('Stale computer move never plays your turn after New game', () => {
  const P = page(11);
  let ok = false;
  for (let i = 0; i < 25 && !ok; i++){
    // make sure a computer timer is pending, then start a new game
    if (P.ev('rs.current') !== 0 && P.timers.length){
      P.press('newgame'); P.press('newgame2');
      if (P.ev('rs.current') === 0){
        const before = P.ev('rs.hands[0].length'), turn = P.ev('rs.turnNo');
        P.timers.splice(0, 1)[0](); // fire the OLD timer
        expect(P.ev('rs.turnNo') === turn && P.ev('rs.hands[0].length') === before && P.ev("rs.phase") === 'draw', 'old timer played the human turn!');
        ok = true;
      }
    } else { P.press('newgame'); P.press('newgame2'); }
  }
  expect(ok, 'could not set up the situation');
  return P;
});
test('Modals: rules, new-game cancel, drills during play', () => {
  const P = page(); humanTurn(P);
  P.press('rules'); expect(/Rules used in this game/.test(P.q('.modal').textContent), 'rules modal'); P.press('closemodal'); expect(!P.q('.modalbg'), 'rules modal did not close');
  P.press('newgame'); expect(/Start a new game\?/.test(P.q('.modal').textContent), 'confirm modal'); P.press('closemodal'); expect(!P.q('.modalbg'), 'confirm did not close');
  const hand = P.ev('rs.hands[0].length');
  P.press('drills'); expect(/Practice drills/.test(P.q('.modal').textContent), 'drills menu'); P.click(P.q('[data-dact="close"]'));
  expect(!P.q('.modalbg') && P.ev('rs.hands[0].length') === hand, 'drills close / game intact');
  return P;
});
test('Round ends while drills are open: closing drills shows the round results', () => {
  const P = page(); humanTurn(P, 'play');
  P.rig(`rs.stock = [];`);
  P.ev(`rs.hands[0] = many('8 9'); rs.current = 1; startTurn(rs); aiBusy = false; render(); loop();`);
  P.press('drills');
  P.runTimers(5);
  expect(P.ev('rs.ended'), 'round should end (empty draw pile)');
  expect(/Practice drills/.test(P.q('.modal').textContent), 'drills should stay open');
  P.click(P.q('[data-dact="close"]'));
  expect(/Round \d+ over/.test(P.q('.modal').textContent), 'round results should appear after closing drills');
  return P;
});
test('Opening thresholds follow the score (155 at 3,000+, 180 at 5,000+)', () => {
  const P = page();
  P.ev(`game.scores = [3200, 5100]; rs.ended = true; rs.end = {reason:'stock'}; rs.result = {teams:[{lines:[],total:0},{lines:[],total:0}]}; modal = 'round'; render();`);
  P.press('next');
  const t = P.q('.scores').textContent;
  expect(/Opening needs 155/.test(t) && /Opening needs 180/.test(t), 'score cards: ' + t.replace(/\s+/g, ' '));
  return P;
});
test('Drill: spot the special hand (answer correctly through the buttons)', () => {
  const P = page(); P.press('drills'); P.click(P.q('[data-dact="start"][data-arg="spot"]'));
  for (let i = 0; i < 12; i++){
    const ans = P.ev('drill.answer') || 'none';
    P.click(P.q(`[data-dact="spot"][data-arg="${ans}"]`));
    expect(/Correct!/.test(P.q('.modal').textContent), 'right answer not marked correct');
    P.click(P.q('[data-dact="next"]'));
  }
  expect(/12\/12/.test(P.q('.modal').textContent), 'score not tracked');
  return P;
});
test('Drill: build an opening meld (solve, stage, check) and "I can\'t open"', () => {
  const P = page(); P.press('drills'); P.click(P.q('[data-dact="start"][data-arg="open"]'));
  let solved = 0, cants = 0;
  for (let i = 0; i < 20; i++){
    if (P.ev('drill.sol.ok')){
      const groups = P.ev('drill.sol.groups.map(g => g.map(c => c.id))');
      for (const g of groups){ for (const id of g) P.click(P.q(`[data-dcard="${id}"]`)); P.click(P.q('[data-dact="add"]')); }
      P.click(P.q('[data-dact="check"]')); expect(/Correct!/.test(P.q('.modal').textContent), 'valid solution not accepted: ' + P.q('.modal .notice').textContent); solved++;
    } else { P.click(P.q('[data-dact="cant"]')); expect(/Correct\./.test(P.q('.modal').textContent), 'cannot-open not accepted'); cants++; }
    P.click(P.q('[data-dact="next"]'));
  }
  expect(solved > 0 && cants > 0, `need both kinds (solved ${solved}, cant ${cants})`);
  return P;
});
test('Drill: pick the right discard (illegal and legal choices explained)', () => {
  const P = page(); P.press('drills'); P.click(P.q('[data-dact="start"][data-arg="disc"]'));
  let illegal = 0, legal = 0;
  for (let i = 0; i < 20; i++){
    const id = P.ev(i % 2 ? `drill.rs.hands[0].find(isWild).id` : `drill.rs.hands[0][0].id`);
    P.click(P.q(`[data-dcard="${id}"]`)); P.click(P.q('[data-dact="disc"]'));
    const txt = P.q('.modal').textContent;
    if (/Not allowed/.test(txt)) illegal++; else if (/Good discard|safer one/.test(txt)) legal++; else throw new Error('no verdict');
    P.click(P.q('[data-dact="next"]'));
  }
  expect(illegal > 0 && legal > 0, `illegal ${illegal} legal ${legal}`);
  return P;
});
for (const r of results) console.log((r.ok ? 'PASS ' : 'FAIL ') + r.name + (r.msg ? '  -> ' + r.msg : ''));
console.log(results.filter(r => r.ok).length + '/' + results.length + ' passed');

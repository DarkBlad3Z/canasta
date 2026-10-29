/* ===== PRACTICE DRILLS ===== */
let drill = null, dsel = new Set(), dId = 100000;
const DSTATS = {spot:{c:0, n:0, s:0}, open:{c:0, n:0, s:0}, disc:{c:0, n:0, s:0}};
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const shuf = a => shuffle(a.slice(), Math.random);
const NAT3 = NAT.filter(r => r !== '3');
function mkc(rank, suit){ return {id:dId++, rank, suit: suit || (rank === 'JK' ? pick(['R','B']) : pick(SUITS))}; }
/* a card that could really exist alongside `cards` (two decks: max 2 of each rank+suit, max 4 jokers) */
function mkcFit(rank, cards){
  const opts = (rank === 'JK' ? ['R','B'] : SUITS).filter(s => cards.filter(c => c.rank === rank && c.suit === s).length < 2);
  return opts.length ? mkc(rank, pick(opts)) : null;
}
function mkSet(rank, n){ const s = shuf(SUITS), out = []; for (let i = 0; i < n; i++) out.push(mkc(rank, rank === 'JK' ? (i % 2 ? 'R' : 'B') : s[i % 4])); return out; }
const SP_INFO = {
  'Pairs without wilds': ['7 different pairs, no wilds.', 2500],
  'Pairs with 1 wild': ['7 pairs: one pair of deuces OR jokers, plus a pair of Aces and a pair of 7s.', 2000],
  'Miami Pairs': ['7 pairs: a pair of deuces AND a pair of jokers, plus a pair of Aces and a pair of 7s.', 2500],
  'Zip Code': ['Shape 4-3-3-2-2. Matching wild groups allowed.', 2500],
  'Straight': ['One of every rank Ace through King (including a 3 and a deuce) plus a joker.', 3000],
  'Garbage': ['Shape 4-4-3-3 with no wilds.', 3000],
  'Blast Off': ['Shape 5-4-3-2. Matching wild groups allowed.', 3000],
  'Triples': ['Three sets of four of a kind plus a pair of matching wilds.', 3500],
  'Quads': ['Four sets of three of a kind plus a pair of matching wilds.', 3500],
  'Dream Hand +4': ['Two sets of five of a kind plus four matching wilds.', 8500],
  'Dream Hand +5': ['A set of five, a set of four, plus five wilds of any kind.', 8500]
};
const SP_NAMES = Object.keys(SP_INFO);
/* colour coding from the group's special-hands sheet: nw = blue (no wilds), mw = yellow (must include wilds), ew = pink (wilds or no wilds) */
const SP_KIND = {'Pairs without wilds':'nw', 'Garbage':'nw',
  'Pairs with 1 wild':'mw', 'Miami Pairs':'mw', 'Straight':'mw', 'Triples':'mw', 'Quads':'mw', 'Dream Hand +4':'mw',
  'Zip Code':'ew', 'Blast Off':'ew', 'Dream Hand +5':'ew'};
const KIND_TXT = {nw:'Blue: must NOT include wilds', mw:'Yellow: must include wilds', ew:'Pink: wilds or no wilds'};
const KIND_SHORT = {nw:'no wilds', mw:'must include wilds', ew:'wilds or no wilds'};
const SP_ROWS = [
  ['Pairs without wilds', 'Pairs (no wilds)', 'All pairs, no wilds'],
  ['Pairs with 1 wild', 'Pairs (with wilds)', 'All pairs including deuces OR jokers, Aces and 7s'],
  ['Miami Pairs', 'Miami Pairs', 'All pairs including deuces AND jokers, Aces and 7s'],
  ['Straight', 'Straight', 'A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, Joker'],
  ['Garbage', 'Garbage Hand (4x4x3x3)', 'Two 4-of-a-kind, two 3-of-a-kind'],
  ['Zip Code', 'Zip Code (4x3x3x2x2)', 'One 4-of-a-kind, two 3-of-a-kind, two pairs'],
  ['Blast Off', 'Blast Off (5x4x3x2)', 'One 5-of-a-kind, one 4-of-a-kind, one 3-of-a-kind, one pair'],
  ['Triples', 'Triples (4x4x4x2)', 'Three 4-of-a-kind, with a pair of matching wilds'],
  ['Quads', 'Quads (3x3x3x3x2)', 'Four 3-of-a-kind, with a pair of jokers OR deuces'],
  ['Dream Hand +4', 'Dream Hand 4 (5x5x4)', 'Two 5-of-a-kind, 4 matching wilds'],
  ['Dream Hand +5', 'Dream Hand 5 (5x5x4)', '<b>Two interpretations (to settle with your group):</b><br><b>A. Official rules:</b> one 5-of-a-kind, one 4-of-a-kind, plus 5 wilds (any mix of 2s and jokers). Must include wilds (yellow).<br><b>B. Your group\'s sheet:</b> one 5-of-a-kind, one 4-of-a-kind, one 5-of-a-kind, any cards, with or without wilds (pink).<br><i>The game currently accepts only A.</i>']
];
const DREAM5_NOTE = ' Dream Hand 5 has two interpretations: officially it needs five wilds; your group\'s sheet allows any 5-4-5. The game accepts only the official version for now.';
function specialsModal(){
  let h = `<div class="modalbg"><div class="modal"><h2>Special hands</h2><p>Declare with exactly 14 cards, before your team opens. The color tells you whether wilds are needed.</p>`;
  h += `<div class="klegend">${['nw','mw','ew'].map(k => `<span class="kchip k-${k}">${KIND_TXT[k]}</span>`).join('')}</div>`;
  h += `<table class="sptable"><tr><th>Special hand</th><th>Cards required</th><th>Points</th></tr>`;
  for (const [key, label, cards] of SP_ROWS) h += `<tr class="k-${SP_KIND[key]}"><td><b>${label}</b></td><td>${cards}</td><td>${SP_INFO[key][1].toLocaleString()}</td></tr>`;
  h += `</table><p class="empty">Only a Straight may contain a 3. Dream hands (8,500) win the game. Miami Pairs is 2,500 here (the official rule); one printout shows 3,000.</p><button class="btn primary" data-act="closemodal">Close</button></div></div>`;
  return h;
}
function genSpecial(name){
  const ranks = shuf(NAT3), cards = [];
  const sets = (sizes, rs) => sizes.forEach((n, i) => cards.push(...mkSet(rs[i], n)));
  const wk = () => pick(['2', 'JK']);
  const swap = (shape, idxs) => { // replace one group (index chosen from idxs) by a matching wild group
    const i = pick(idxs), kind = wk(); sets(shape.filter((_, j) => j !== i), ranks); cards.push(...mkSet(kind, shape[i]));
  };
  switch (name){
    case 'Pairs without wilds': sets([2,2,2,2,2,2,2], ranks); break;
    case 'Pairs with 1 wild': { const o = ranks.filter(r => r !== 'A' && r !== '7').slice(0, 4); sets([2,2,2,2,2,2], ['A','7',...o]); cards.push(...mkSet(wk(), 2)); break; }
    case 'Miami Pairs': { const o = ranks.filter(r => r !== 'A' && r !== '7').slice(0, 3); sets([2,2,2,2,2], ['A','7',...o]); cards.push(...mkSet('2', 2), ...mkSet('JK', 2)); break; }
    case 'Zip Code': if (Math.random() < 0.4) swap([4,3,3,2,2], [0,1,2,3,4]); else sets([4,3,3,2,2], ranks); break;
    case 'Straight': NAT.forEach(r => cards.push(mkc(r))); cards.push(mkc('2'), mkc('JK')); break;
    case 'Garbage': sets([4,4,3,3], ranks); break;
    case 'Blast Off': if (Math.random() < 0.4) swap([5,4,3,2], [1,2,3]); else sets([5,4,3,2], ranks); break;
    case 'Triples': sets([4,4,4], ranks); cards.push(...mkSet(wk(), 2)); break;
    case 'Quads': sets([3,3,3,3], ranks); cards.push(...mkSet(wk(), 2)); break;
    case 'Dream Hand +4': sets([5,5], ranks); cards.push(...mkSet(wk(), 4)); break;
    case 'Dream Hand +5': { sets([5,4], ranks); const j = rnd(5); for (let i = 0; i < 5; i++) cards.push(mkc(i < j ? 'JK' : '2')); break; }
  }
  return cards;
}
function mutate(cards){
  for (let t = 0; t < 50; t++){
    const out = cards.map(c => ({...c, id:dId++})), i = rnd(out.length);
    const rest = out.filter((_, j) => j !== i);
    const r = pick(NAT.concat(['2', 'JK']).filter(x => x !== out[i].rank));
    const c = mkcFit(r, rest); if (!c) continue;
    out[i] = c; return out;
  }
  return cards.map(c => ({...c, id:dId++}));
}
function describeHand(cards){
  const nat = {}; let w2 = 0, wj = 0;
  cards.forEach(c => { if (c.rank === '2') w2++; else if (c.rank === 'JK') wj++; else nat[c.rank] = (nat[c.rank] || 0) + 1; });
  const parts = Object.entries(nat).sort((a, b) => b[1] - a[1]).map(([r, n]) => `${r}×${n}`);
  return `Natural ranks: ${parts.join(', ') || 'none'}. Deuces: ${w2}. Jokers: ${wj}.`;
}
function newSpot(){
  let cards;
  if (Math.random() < 0.65){ const name = pick(SP_NAMES); cards = genSpecial(name); }
  else { const base = genSpecial(pick(SP_NAMES)); cards = mutate(base); }
  const d = detectSpecial(cards);
  Object.assign(drill, {cards:shuf(cards), answer:d ? d.name : null, picked:undefined});
}
function newOpen(){
  for (let t = 0; t < 600; t++){
    const want = Math.random() < 0.7, ranks = shuf(NAT3), cards = [];
    const ng = want ? 2 + rnd(3) : rnd(3);
    for (let i = 0; i < ng; i++) cards.push(...mkSet(ranks[i], 3 + rnd(2)));
    const np = rnd(3); for (let i = 0; i < np; i++) cards.push(...mkSet(ranks[ng + i], 2));
    const nw = rnd(3); for (let i = 0; i < nw; i++) cards.push(mkc(Math.random() < 0.6 ? '2' : 'JK'));
    let k = ng + np; while (cards.length < 14 && k < ranks.length) cards.push(...mkSet(ranks[k++], 1));
    const hand = cards.slice(0, 14), max = solveOpening(null, hand, 0).max;
    const cands = [125, 155, 180].filter(n => (max >= n) === want);
    if (cands.length || t === 599){
      const need = cands.length ? pick(cands) : 125;
      Object.assign(drill, {hand:shuf(hand), need, sol:solveOpening(null, hand, need), staged:[], result:null, msg:null, reveal:false}); dsel.clear(); return;
    }
  }
}
/* ---- discard drill ---- */
function newDisc(){
  const rs = {teams:[newTeam(), newTeam()], pack:[], hands:[[],[],[],[]], needs:[125,125], stock:[], talon:[[],[],[],[]]};
  const ranks = shuf(NAT3.filter(r => r !== '7' && r !== 'A')), dead = ranks[0], oppA = ranks[1], mine = ranks[2], pairR = ranks[3], lowR = ranks[4], extra = ranks[5];
  rs.teams[1].melds.push({rank:dead, cards:mkSet(dead, 7), closed:true, pure:false});
  rs.teams[1].melds.push({rank:oppA, cards:mkSet(oppA, 3 + rnd(3)), closed:false, pure:false});
  rs.teams[0].melds.push({rank:mine, cards:mkSet(mine, 3 + rnd(3)), closed:false, pure:false});
  rs.teams[0].opened = rs.teams[1].opened = true;
  const onTable = rs.teams.flatMap(t => t.melds.flatMap(m => m.cards));
  const hand = [mkcFit(oppA, onTable), mkcFit(dead, onTable), ...mkSet(pairR, 2), mkc(lowR), mkc(extra), mkc(pick(['2', 'JK']))];
  const risk = pick(['7', 'A']), heavy = Math.random() < 0.4;
  hand.push(...mkSet(risk, heavy ? 3 : 1));
  if (Math.random() < 0.5) rs.pack = [mkc(pick(NAT3.filter(r => r !== dead)))];
  rs.hands[0] = shuf(hand);
  Object.assign(drill, {rs, picked:null, done:false});
  dsel.clear();
}
/* ---- actions ---- */
function record(type, ok){ const s = DSTATS[type]; s.n++; if (ok){ s.c++; s.s++; } else s.s = 0; }
function openDrills(){ modal = 'drills'; drill = null; dsel.clear(); render(); }
function startDrill(type){
  drill = {type, done:false}; dsel.clear();
  if (type === 'spot') newSpot(); else if (type === 'open') newOpen(); else newDisc();
  render();
}
function dToggle(id){
  if (!drill || drill.done) return;
  if (drill.type === 'disc'){ dsel = new Set([id]); } else if (dsel.has(id)) dsel.delete(id); else dsel.add(id);
  render();
}
function dAct(a, arg){
  if (a === 'start') return startDrill(arg);
  if (a === 'menu'){ drill = null; dsel.clear(); return render(); }
  if (a === 'close'){ modal = screen === 'game' && rs && rs.ended ? 'round' : null; drill = null; return render(); }
  if (!drill) return;
  if (a === 'next') return startDrill(drill.type);
  if (drill.type === 'spot' && a === 'spot' && !drill.done){
    const ans = arg === 'none' ? null : arg; drill.picked = ans; drill.done = true; record('spot', ans === drill.answer); return render();
  }
  if (drill.type === 'open') return openAct(a);
  if (drill.type === 'disc' && a === 'disc' && !drill.done){
    const id = [...dsel][0]; if (id === undefined) return; drill.picked = id; drill.done = true;
    const rs2 = drill.rs, card = rs2.hands[0].find(c => c.id === id), chk = discardCheck(rs2, 0, card);
    drill.verdict = discVerdict(rs2, card, chk); record('disc', drill.verdict.ok); return render();
  }
}
function openStub(){ return {teams:[newTeam(), newTeam()], needs:[drill.need, drill.need], phase:'play'}; }
function openAct(a){
  const d = drill, hand = d.hand;
  if (d.done) return;
  const inStage = () => d.staged.flat();
  const free = () => hand.filter(c => !inStage().some(x => x.id === c.id));
  if (a === 'add'){
    const cards = free().filter(c => dsel.has(c.id));
    if (!cards.length){ d.msg = {k:'err', t:'Select cards first.'}; return render(); }
    const chk = checkOpeningGroup(openStub(), cards);
    if (!chk.ok){ d.msg = {k:'err', t:chk.why}; return render(); }
    if (d.staged.some(g => g.some(c => !isWild(c) && c.rank === chk.rank))){ d.msg = {k:'err', t:'One group per rank. Undo staging and select all of that rank together.'}; return render(); }
    d.staged.push(cards); dsel.clear(); d.msg = null; return render();
  }
  if (a === 'undo'){ d.staged = []; d.msg = null; return render(); }
  if (a === 'check'){
    const res = checkOpening(openStub(), 0, d.staged);
    if (!res.ok){ d.msg = {k:'err', t:res.why}; return render(); }
    const used = inStage().length;
    if (hand.length - used < 2){ d.msg = {k:'err', t:'You must keep at least 2 cards: one to discard and one to hold.'}; return render(); }
    d.done = true; d.msg = {k:'good', t:`Correct! That opening meld is worth ${res.pts} points, enough for ${d.need}, and it has a clean triple.` + (d.sol.max > res.pts ? ` (The best possible was ${d.sol.max}.)` : '')};
    record('open', true); return render();
  }
  if (a === 'cant'){
    d.done = true;
    if (!d.sol.ok){ d.msg = {k:'good', t:`Correct. The best legal opening meld in this hand is only ${d.sol.max} points (you need ${d.need} with a clean triple, keeping 2 cards).`}; record('open', true); }
    else { d.msg = {k:'err', t:`You can open with this hand (up to ${d.sol.max} points). The highlighted cards show one way: ${d.sol.pts} points.`}; record('open', false); d.reveal = true; }
    return render();
  }
  if (a === 'show'){
    d.done = true; d.reveal = true;
    d.msg = d.sol.ok ? {k:'info', t:`One solution is highlighted: ${d.sol.pts} points (it uses as few wilds as possible; the most this hand can make is ${d.sol.max}).`} : {k:'info', t:`No legal opening exists. The best you could do is ${d.sol.max} points (need ${d.need}).`};
    return render();
  }
}
function discReasons(rs, c){
  const h = rs.hands[0], team = rs.teams[0], opp = rs.teams[1], cnt = h.filter(x => x.rank === c.rank).length, out = [];
  if (deadRank(rs, c.rank)) out.push({g:true, t:`${rankName(c.rank)} are dead (a canasta is complete), so nobody can use this card. Safest discard.`});
  if (opp.melds.some(m => m.rank === c.rank && !m.closed)) out.push({g:false, t:`The other team is building ${rankName(c.rank)}. This hands them a card.`});
  if (team.melds.some(m => m.rank === c.rank && !m.closed)) out.push({g:false, t:`You could add this to your own ${rankName(c.rank)} meld instead.`});
  if (isWild(c)) out.push({g:false, t:'Wild cards are your most valuable cards. They can only be discarded as a last resort.'});
  if ((c.rank === '7' || c.rank === 'A') && h.filter(x => x.rank === c.rank).length >= 3) out.push({g:true, t:`Holding three or more ${rankName(c.rank)} costs -1,500 at the end of the round, so getting rid of one is smart.`});
  else if (c.rank === '7' || c.rank === 'A') out.push({g:true, t:`Keeping two or fewer ${rankName(c.rank)} is safe, so this one is fine to hold.`});
  if (cnt >= 2 && !isWild(c)) out.push({g:false, t:`You hold ${cnt} ${rankName(c.rank)}. Pairs can start a meld or let you take the pack.`});
  const collected = opp.melds.some(m => m.rank === c.rank && !m.closed) || team.melds.some(m => m.rank === c.rank && !m.closed);
  if (cnt === 1 && !isWild(c) && !collected && !deadRank(rs, c.rank) && c.rank !== '7' && c.rank !== 'A')
    out.push({g:true, t: cardVal(c) <= 5 ? 'A lone low card that nobody is collecting: cheap to lose.' : 'A lone card that nobody is collecting, so it does not help either team.'});
  if (!rs.pack.length && (c.rank === '7' || c.rank === 'A' || isWild(c) || deadRank(rs, c.rank))) out.push({g:false, t:'Not allowed right now: the discard pile is empty (SWAD rule).'});
  return out;
}
function discVerdict(rs, card, chk){
  if (!chk.ok) return {ok:false, kind:'illegal', text:chk.why};
  const legal = rs.hands[0].filter(c => discardCheck(rs, 0, c).ok);
  const cnt = {}; rs.hands[0].forEach(c => cnt[c.rank] = (cnt[c.rank] || 0) + 1);
  const scored = legal.map(c => ({c, s:discardScore(rs, 0, c, rs.hands[0], cnt).s})).sort((a, b) => a.s - b.s);
  const best = scored[0], mine = scored.find(x => x.c.id === card.id);
  const why = discReasons(rs, card), soundReason = why.some(r => r.g) && !why.some(r => !r.g);
  const ok = mine.s <= best.s + 12 || soundReason; // a discard with only good reasons is also a good answer
  return {ok, kind: ok ? 'good' : 'riskier', best:best.c, text:''};
}

/* ---- rendering ---- */
function dCards(cards, opts = {}){
  return `<div class="hand" style="padding-top:14px">${sortHand(cards).map(c => cardHTML(c, {dr:true, hl:opts.hl})).join('')}</div>`;
}
function dStats(type){ const s = DSTATS[type]; return `<span class="empty">Score: ${s.c}/${s.n}${s.s > 1 ? ' · streak ' + s.s : ''}</span>`; }
function drillModal(){
  let h = '<div class="modalbg"><div class="modal" style="max-width:880px">';
  if (!drill){
    h += `<h2>Practice drills</h2><p>Short exercises with instant feedback. Your game stays paused where you left it.</p><div class="cols" style="grid-template-columns:1fr;gap:10px">
    <div class="panel"><h3>Spot the special hand</h3><p>See 14 cards and decide which special or dream hand they make, or whether they make none. ${dStats('spot')}</p><button class="btn primary" data-dact="start" data-arg="spot">Start</button></div>
    <div class="panel"><h3>Build an opening meld</h3><p>Pick the cards that make a legal opening meld for the point target (clean triple, wild limits, keep 2 cards), or say you cannot open. ${dStats('open')}</p><button class="btn primary" data-dact="start" data-arg="open">Start</button></div>
    <div class="panel"><h3>Pick the right discard</h3><p>Choose a discard from a mid-game table. Learn the SWAD rule, dead cards, 7s and Aces, and what feeds your opponents. ${dStats('disc')}</p><button class="btn primary" data-dact="start" data-arg="disc">Start</button></div></div>
    <p><button class="btn" data-dact="close">${screen === 'home' ? 'Back to menu' : 'Back to game'}</button></p>`;
    return h + '</div></div>';
  }
  const foot = (extra = '') => `<div class="bar">${extra}<button class="btn primary" data-dact="next" ${drill.done ? '' : 'disabled'}>Next</button><button class="btn" data-dact="menu">All drills</button><button class="btn" data-dact="close">${screen === 'home' ? 'Back to menu' : 'Back to game'}</button> ${dStats(drill.type)}</div>`;
  if (drill.type === 'spot'){
    h += `<h2>Spot the special hand</h2><p>These are your 14 cards (the last one came from the draw pile). What do they make?</p>${dCards(drill.cards)}<div class="klegend">${['nw','mw','ew'].map(k => `<span class="kchip k-${k}">${KIND_TXT[k]}</span>`).join('')}</div><div class="bar" style="flex-wrap:wrap">`;
    for (const n of SP_NAMES.concat(['none'])){
      const label = n === 'none' ? 'No special hand' : n; const val = n === 'none' ? null : n;
      let cls = 'btn' + (SP_KIND[n] ? ' k-' + SP_KIND[n] : '');
      if (drill.done){ if (val === drill.answer) cls += ' right'; else if (val === drill.picked) cls += ' wrong'; }
      h += `<button class="${cls}" data-dact="spot" data-arg="${n}" ${drill.done ? 'disabled' : ''}>${label}</button>`;
    }
    h += '</div>';
    if (drill.done){
      const ok = drill.picked === drill.answer;
      h += `<div class="notice ${ok ? 'good' : 'err'}"><b>${ok ? 'Correct!' : 'Not quite.'}</b> ` + (drill.answer
        ? `This is <b>${drill.answer}</b> for ${SP_INFO[drill.answer][1].toLocaleString()} points (<span class="kchip k-${SP_KIND[drill.answer]}">${KIND_SHORT[SP_KIND[drill.answer]]}</span>). ${SP_INFO[drill.answer][0]}${drill.answer === 'Dream Hand +5' ? DREAM5_NOTE : ''}`
        : 'These cards do not make a special hand. ' + noSpecialWhy(drill.cards)) + `<br><span style="font-size:13px">${describeHand(drill.cards)}</span></div>`;
      if (drill.answer) h += `<p class="empty">Reminder: declare before your team opens (or on your first turn after your partner opens), with your last card from the draw pile. No 3s except in a Straight.</p>`;
    }
    return h + foot() + '</div></div>';
  }
  if (drill.type === 'open'){
    const d = drill, stagedIds = new Set(d.staged.flat().map(c => c.id)), hl = d.reveal ? new Set(d.sol.groups.flat().map(c => c.id)) : null;
    const free = d.hand.filter(c => !stagedIds.has(c.id));
    const pts = d.staged.flat().reduce((a, c) => a + cardVal(c), 0);
    h += `<h2>Build an opening meld</h2><p>Your team needs <b>${d.need} points</b> with a clean triple (3+ naturals, no wilds). Wilds: up to 2 per group, only with at least 2 naturals; 7s never take wilds. Keep at least 2 cards in hand. Face values: Joker 50, 2 and Ace 20, K to 8 = 10, 7 to 4 = 5.</p>`;
    h += `<div class="panel"><h3>Your hand</h3>${dCards(free, {hl})}</div>`;
    if (d.staged.length) h += `<div class="stage"><b>Staged:</b> ${pts} of ${d.need} points. ${d.staged.map(g => '<span class="melds" style="display:inline-flex;margin-right:8px">' + g.map(c => cardHTML(c, {mini:true})).join('') + '</span>').join('')}</div>`;
    if (d.msg) h += `<div class="notice ${d.msg.k === 'good' ? 'good' : (d.msg.k === 'info' ? 'info' : 'err')}">${esc(d.msg.t)}</div>`;
    h += foot(`<button class="btn" data-dact="add" ${d.done ? 'disabled' : ''}>Add selected as a group</button><button class="btn" data-dact="undo" ${d.done ? 'disabled' : ''}>Undo staging</button><button class="btn primary" data-dact="check" ${d.done ? 'disabled' : ''}>Check my opening meld</button><button class="btn warn" data-dact="cant" ${d.done ? 'disabled' : ''}>I can't open</button><button class="btn" data-dact="show" ${d.done ? 'disabled' : ''}>Show answer</button>`);
    return h + '</div></div>';
  }
  const rs2 = drill.rs;
  h += `<h2>Pick the right discard</h2><p>Your team has already opened. Choose the best card to discard. ${rs2.pack.length ? `The top of the discard pile is shown below.` : '<b>The discard pile is empty</b>, so the SWAD rule applies (no 7, Wild, Ace or Dead card as the first discard).'}</p>`;
  h += `<div class="cols"><div class="panel"><h3>Your team's table</h3>${meldsHTML(rs2.teams[0], false)}</div><div class="panel"><h3>Opponents' table</h3>${meldsHTML(rs2.teams[1], false)}</div></div>`;
  if (rs2.pack.length) h += `<p>Top of pile: ${cardHTML(rs2.pack[0], {mini:true})}</p>`;
  h += `<div class="panel"><h3>Your hand</h3>${dCards(rs2.hands[0])}</div>`;
  if (drill.done){
    const card = rs2.hands[0].find(c => c.id === drill.picked), v = drill.verdict;
    if (v.kind === 'illegal') h += `<div class="notice err"><b>Not allowed.</b> ${esc(v.text)}</div>`;
    else {
      h += `<div class="notice ${v.ok ? 'good' : 'err'}"><b>${v.ok ? 'Good discard.' : 'Legal, but there is a safer one.'}</b> You chose ${cardName(card)}.<ul style="margin:4px 0 0 18px">${discReasons(rs2, card).map(r => `<li>${r.g ? '✓' : '✗'} ${esc(r.t)}</li>`).join('')}</ul></div>`;
      if (!v.ok) h += `<div class="notice info"><b>Better:</b> ${cardName(v.best)}.<ul style="margin:4px 0 0 18px">${discReasons(rs2, v.best).map(r => `<li>${r.g ? '✓' : '✗'} ${esc(r.t)}</li>`).join('')}</ul></div>`;
    }
  }
  h += foot(`<button class="btn primary" data-dact="disc" ${drill.done || !dsel.size ? 'disabled' : ''}>Discard selected card</button>`);
  return h + '</div></div>';
}
function noSpecialWhy(cards){
  const nat = {}; let w2 = 0, wj = 0, threes = 0;
  cards.forEach(c => { if (c.rank === '2') w2++; else if (c.rank === 'JK') wj++; else { nat[c.rank] = (nat[c.rank] || 0) + 1; if (c.rank === '3') threes++; } });
  const counts = Object.values(nat), shape = counts.slice().sort((a, b) => b - a).join('-');
  const wilds = w2 + wj;
  if (threes){
    if (threes === 1 && counts.length >= 10) return 'It looks like a Straight attempt, but a Straight needs exactly one of every rank Ace through King (including one 3 and one deuce) plus one joker.';
    return '3s are not allowed in any special hand except the Straight.';
  }
  if (counts.every(c => c === 2) || (counts.filter(c => c !== 2).length === 1 && counts.length >= 5)){
    if (counts.some(c => c !== 2)) return `This is close to a pairs hand, but every rank must be exactly a pair (yours: ${shape}).`;
    if ((w2 && w2 !== 2) || (wj && wj !== 2)) return 'In a pairs hand the wild cards must come as matching pairs (two deuces, two jokers).';
    if (wilds && !(nat.A === 2 && nat['7'] === 2)) return 'A pairs hand that uses wilds must also include a pair of Aces and a pair of 7s.';
  }
  if (w2 && wj && wilds !== 5 && !(w2 === 2 && wj === 2)) return 'Wild cards must form their own matching group (all deuces or all jokers). Mixed wilds only appear in Miami Pairs (a pair of each) and Dream Hand +5.';
  if (!wilds && shape === '4-4-3-2-1') return 'So close to Garbage (4-4-3-3), but one group is broken up.';
  return `The groups (${shape}${wilds ? ' plus ' + wilds + ' wild' + (wilds > 1 ? 's' : '') : ''}) do not match any special shape.`;
}

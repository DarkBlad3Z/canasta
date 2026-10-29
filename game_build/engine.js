'use strict';
/* ===== ENGINE: Modern American Canasta (official CLA rules where the group notes differ) ===== */
const NAT = ['3','4','5','6','7','8','9','10','J','Q','K','A'];
const SUITS = ['S','H','D','C'];
const SYM = {S:'♠', H:'♥', D:'♦', C:'♣'};
const SEATS = ['You','West','North (partner)','East'];
const SHORT = ['You','West','North','East'];
const TEAM_NAMES = ['You & North','West & East'];
const teamOf = s => s % 2;
let _cid = 0;

function makeDeck(){
  const d = [];
  for (let k = 0; k < 2; k++) for (const s of SUITS) for (const r of NAT.concat(['2'])) d.push({id:_cid++, rank:r, suit:s});
  for (let j = 0; j < 4; j++) d.push({id:_cid++, rank:'JK', suit: j < 2 ? 'R' : 'B'});
  return d;
}
function shuffle(a, rng){ for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const isWild = c => c.rank === '2' || c.rank === 'JK';
const isThree = c => c.rank === '3';
const isRedCard = c => c.suit === 'H' || c.suit === 'D' || c.suit === 'R';
function cardVal(c){
  if (c.rank === 'JK') return 50;
  if (c.rank === '2' || c.rank === 'A') return 20;
  if (c.rank === '3') return 0;
  if (['7','6','5','4'].includes(c.rank)) return 5;
  return 10;
}
const rankName = r => ({J:'Jacks', Q:'Queens', K:'Kings', A:'Aces', W:'wilds'})[r] || (r + 's');
const cardName = c => c.rank === 'JK' ? 'Joker' : c.rank + SYM[c.suit];
const bad = why => ({ok:false, why});

function openingNeed(score){ return score < 3000 ? 125 : (score < 5000 ? 155 : 180); }
const newTeam = () => ({melds:[], threes:[], opened:false, permit:{}, asked:{}});

function newGame(rng = Math.random){ return {scores:[0,0], round:0, dealer:Math.floor(rng()*4), over:false, winner:null}; }

function newRound(game, rng = Math.random){
  if (game.round > 0) game.dealer = (game.dealer + 1) % 4;
  const deck = shuffle(makeDeck(), rng);
  const hands = [[],[],[],[]];
  for (let i = 0; i < 13; i++) for (let s = 0; s < 4; s++) hands[s].push(deck.pop());
  game.round++;
  const rs = {game, rng, hands, stock:deck, pack:[], teams:[newTeam(), newTeam()], talon:[[],[],[],[]],
    current:(game.dealer + 1) % 4, openedCount:0, courtesy:[false,false,false,false], phase:'draw',
    drewStock:false, pickedPack:false, pendingTalon:null, ended:false, end:null, log:[], alerts:[], result:null, pendingAsk:null, interactive:false,
    needs:[openingNeed(game.scores[0]), openingNeed(game.scores[1])]};
  rs.log.push(`Round ${game.round}. ${SHORT[game.dealer]} ${game.dealer === 0 ? 'deal' : 'deals'}. ${SHORT[rs.current]} ${rs.current === 0 ? 'play' : 'plays'} first.`);
  startTurn(rs);
  return rs;
}

function startTurn(rs){
  const s = rs.current;
  rs.turnNo = (rs.turnNo || 0) + 1; rs.justTalon = 0;
  if (rs.talon[s].length){
    rs.justTalon = rs.talon[s].length;
    rs.log.push(`${SHORT[s]} picked up the talon (${rs.talon[s].length} cards).`);
    rs.hands[s].push(...rs.talon[s]); rs.talon[s] = [];
  }
  rs.phase = 'draw'; rs.drewStock = false; rs.pickedPack = false;
}

const deadRank = (rs, r) => rs.teams.some(t => t.melds.some(m => m.rank === r && m.closed));
const findMeld = (team, r) => team.melds.find(m => m.rank === r && !m.closed);
const mNat = m => m.cards.filter(c => !isWild(c)).length;
const mWild = m => m.cards.length - mNat(m);
const hasOpenWild = team => team.melds.some(m => m.rank === 'W' && !m.closed);
const sumVal = cards => cards.reduce((a, c) => a + cardVal(c), 0);
const RANK_ORDER = NAT.concat(['2', 'JK']);
const canon = cards => cards.slice().sort((a, b) => RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank) || (a.suit < b.suit ? -1 : a.suit > b.suit ? 1 : 0) || a.id - b.id);

function canastaValue(m){
  if (m.rank === 'W'){
    const j = m.cards.filter(c => c.rank === 'JK').length;
    if (j === 0) return 3000;
    if (j === 4) return 2500;
    return 2000;
  }
  if (mWild(m) > 0) return 300;
  return (m.rank === '7' || m.rank === 'A') ? 2500 : 500;
}
function canastaDesc(m){
  if (m.rank === 'W'){ const j = m.cards.filter(c => c.rank === 'JK').length; return j === 0 ? 'all deuces' : (j === 4 ? 'four jokers + 2s' : 'deuces + jokers'); }
  return mWild(m) > 0 ? 'mixed' : 'clean';
}
/* remembers which melds and cards were just played (and when) so the screen can highlight them */
function markFresh(rs, seat, m, cards){
  const f = rs.fresh = rs.fresh || {melds:{}, ids:{}};
  if (m) f.melds[teamOf(seat) + m.rank] = {t:rs.turnNo, seat};
  cards.forEach(c => { f.ids[c.id] = {t:rs.turnNo, seat}; });
}
function closeIfFull(rs, m, who){
  if (m.cards.length === 7 && !m.closed){ m.closed = true; const msg = `${who} completed a ${canastaDesc(m)} canasta of ${m.rank === 'W' ? 'wild cards' : rankName(m.rank)}!`; rs.log.push(msg); (rs.alerts = rs.alerts || []).push(msg); return true; }
  return false;
}

/* ---------- 3s ---------- */
function layThrees(rs, seat){
  const h = rs.hands[seat], t = rs.teams[teamOf(seat)]; let n = 0;
  while (true){
    const i = h.findIndex(isThree); if (i < 0) break;
    if (!rs.stock.length){ endRound(rs, 'stock'); return {n, ended:true}; }
    const three = h.splice(i, 1)[0]; t.threes.push(three); n++; markFresh(rs, seat, {rank:'3s'}, [three]);
    h.push(rs.stock.pop());
  }
  return {n, ended:false};
}

function drawStock(rs, seat){
  if (!rs.stock.length){ endRound(rs, 'stock'); return {ok:false, ended:true, why:'The draw pile is empty, so the round ends.'}; }
  const c = rs.stock.pop(); rs.hands[seat].push(c); rs.drewStock = true; rs.phase = 'play';
  return {ok:true, card:c};
}

/* ---------- go out ---------- */
function goOutCheck(rs, seat){
  const team = rs.teams[teamOf(seat)];
  if (team.melds.filter(m => m.closed).length < 2) return bad('To go out your team needs two completed canastas.');
  if (team.melds.some(m => !m.closed && (m.rank === '7' || m.rank === 'W' || (m.rank === 'A' && m.pure))))
    return bad('You cannot go out with an unfinished meld of 7s, clean Aces or wilds on the table. Finish it first.');
  if (!(team.permit && team.permit[seat])) return bad(team.asked && team.asked[seat] ? 'Your partner said no, and you only get one ask per round, so you cannot go out this round.' : 'Going out needs your partner\'s permission. Click "Ask partner to go out" first (you can ask once per round).');
  return {ok:true};
}
/* Going out needs the partner's OK: ask once per round. */
function goOutState(rs, seat){
  const team = rs.teams[teamOf(seat)];
  if (team.permit[seat]) return 'yes';
  if (team.asked[seat]) return 'refused';
  const blocked = team.melds.some(m => !m.closed && (m.rank === '7' || m.rank === 'W' || (m.rank === 'A' && m.pure)));
  return team.melds.filter(m => m.closed).length >= 2 && !blocked ? 'can-ask' : 'no';
}
function partnerAgrees(rs, seat){
  const p = (seat + 2) % 4, pts = sumVal(rs.hands[p]) + sumVal(rs.talon[p]);   // cards still in the partner's hand count against the team
  return pts <= 150 || rs.rng() < 0.25;
}
function askToGoOut(rs, seat){
  const team = rs.teams[teamOf(seat)], p = (seat + 2) % 4, who = SHORT[seat];
  if (team.asked[seat]) return {ok:false, why:'You can only ask once per round.', lines:[]};
  if (goOutState(rs, seat) !== 'can-ask') return {ok:false, why:'You need two completed canastas, and no unfinished meld of 7s, clean Aces or wilds, before you can ask to go out.', lines:[]};
  team.asked[seat] = true;
  const yes = partnerAgrees(rs, seat); if (yes) team.permit[seat] = true;
  const pn = SHORT[p];
  const lines = [`${who === 'You' ? 'You ask' : who + ' asks'} ${pn === 'You' ? 'you' : pn}: "May I go out?"`,
    yes ? `${pn === 'You' ? 'You say' : pn + ' says'} yes: "Go ahead!"` : `${pn === 'You' ? 'You say' : pn + ' says'} no: "Not yet, I'm holding too much."`];
  rs.log.push(...lines);
  return {ok:true, yes, lines};
}
/* can this player go out this turn if the partner says yes? (dry run on a copy of the table) */
function canGoOutSim(rs, seat){
  const c = Object.assign({}, rs);
  c.hands = rs.hands.map(h => h.slice()); c.pack = rs.pack.slice(); c.log = []; c.alerts = []; c.fresh = {melds:{}, ids:{}}; c.lastDiscard = null;
  c.teams = rs.teams.map(t => Object.assign({}, t, {melds:t.melds.map(m => Object.assign({}, m, {cards:m.cards.slice()})), threes:t.threes.slice(), permit:Object.assign({}, t.permit), asked:Object.assign({}, t.asked)}));
  c.teams[teamOf(seat)].permit[seat] = true;
  for (let i = 0; i < 8; i++){
    const a = nextMeldAction(c, seat); if (!a) break;
    const r = playGroup(c, seat, a.ids, a.target); if (!r.ok) break;
  }
  return c.hands[seat].length === 1 && goOutCheck(c, seat).ok;
}
const keepNeeded = (rs, seat) => goOutCheck(rs, seat).ok ? 1 : 2;
/* How many cards you must keep after a meld, judged on the table AS IT WILL BE after that meld:
   1 only if your team will then have 2+ canastas and no unfinished 7s / clean Aces / wild meld. */
function keepAfter(team, rank, newSize, pureAfter, seat){
  const closes = newSize === 7;
  const canastas = team.melds.filter(m => m.closed).length + (closes ? 1 : 0);
  const otherBlock = team.melds.some(m => !m.closed && m.rank !== rank && (m.rank === '7' || m.rank === 'W' || (m.rank === 'A' && m.pure)));
  const thisBlock = !closes && (rank === '7' || rank === 'W' || (rank === 'A' && pureAfter));
  return (canastas >= 2 && !otherBlock && !thisBlock && team.permit && team.permit[seat]) ? 1 : 2;
}

/* ---------- opening meld ---------- */
function checkOpeningGroup(rs, cards){
  if (cards.some(isThree)) return bad('3s are never melded in sets. They go in your 3s row.');
  const nats = cards.filter(c => !isWild(c)), wl = cards.length - nats.length;
  if (!nats.length) return bad('The opening meld cannot be made only of wilds. It needs natural cards (a clean triple).');
  const r = nats[0].rank;
  if (nats.some(c => c.rank !== r)) return bad('A meld uses one rank only (plus wilds).');
  if (deadRank(rs, r)) return bad(`${rankName(r)} are dead: a canasta of them is already complete.`);
  if (cards.length < 3) return bad('A meld needs at least 3 cards.');
  if (cards.length > 7) return bad('A canasta is 7 cards. A meld cannot go over 7.');
  if (wl > 0){
    if (r === '7') return bad('7s must always be played clean (no wilds).');
    if (nats.length < 2) return bad('A mixed meld needs at least 2 natural cards.');
    if (wl > 2) return bad('A meld can hold at most 2 wilds.');
  }
  return {ok:true, rank:r, clean: wl === 0 && nats.length >= 3, wilds: wl};
}
function checkOpening(rs, seat, groups, extraPts = 0){
  const t = teamOf(seat), need = rs.needs[t];
  if (!groups.length) return bad('Select cards and add them to your opening meld first.');
  let pts = 0, clean = false; const seen = new Set();
  for (const g of groups){
    const r = checkOpeningGroup(rs, g); if (!r.ok) return r;
    if (seen.has(r.rank)) return bad('Use one group per rank in the opening meld.');
    seen.add(r.rank); if (r.clean) clean = true; pts += sumVal(g);
  }
  pts += extraPts;
  if (!clean) return {ok:false, pts, need, why:'Your opening meld needs a clean triple: 3 or more natural cards of one rank with no wilds.'};
  if (pts < need) return {ok:false, pts, need, why: extraPts ? `This opening meld is worth ${pts} points including your pair (${extraPts}). Your team needs ${need}. The top card of the pack does not count.` : `This opening meld is worth ${pts} points. Your team needs ${need}.`};
  return {ok:true, pts, need};
}
function removeFromHand(hand, cards){
  for (const c of cards){ const i = hand.findIndex(x => x.id === c.id); if (i >= 0) hand.splice(i, 1); }
}
function applyOpening(rs, seat, groups){
  const team = rs.teams[teamOf(seat)];
  for (const g of groups){
    const r = g.find(c => !isWild(c)).rank, wl = g.filter(isWild).length;
    const m = {rank:r, cards:g.slice(), pure:(r === '7' || (r === 'A' && wl === 0)), closed:false};
    team.melds.push(m); markFresh(rs, seat, m, g); closeIfFull(rs, m, SHORT[seat]);
  }
  team.opened = true; rs.openedCount++;
  rs.courtesy[(seat + 2) % 4] = true;
}
/* groups: arrays of card objects (in hand or already staged out of hand) */
function opening(rs, seat, groups){
  if (rs.phase !== 'play') return bad('Draw a card first.');
  const res = checkOpening(rs, seat, groups); if (!res.ok) return res;
  const h = rs.hands[seat], all = groups.flat();
  const inHand = all.filter(c => h.some(x => x.id === c.id)).length;
  const remaining = h.length - inHand;
  if (remaining < 2) return bad('You must keep at least 2 cards: one to discard now and one to hold (discarding your last card means going out).');
  removeFromHand(h, all);
  applyOpening(rs, seat, groups);
  rs.pendingTalon = {seat, n: rs.openedCount === 1 ? 4 : 3};
  rs.log.push(`${SHORT[seat]} opened with ${all.length} cards (${res.pts} points).`);
  return {ok:true, pts:res.pts};
}

/* ---------- melding after opening ---------- */
function playGroup(rs, seat, cardIds, target){
  if (rs.phase !== 'play') return bad('Draw a card first.');
  const hand = rs.hands[seat];
  const cards = cardIds.map(id => hand.find(c => c.id === id));
  if (!cards.length || cards.some(c => !c)) return bad('Select cards from your hand first.');
  const team = rs.teams[teamOf(seat)];
  if (!team.opened) return bad('Your team has not opened yet. Build the opening meld first.');
  if (cards.some(isThree)) return bad('3s are laid down on their own and never melded in sets.');
  const remaining = hand.length - cards.length;
  if (remaining < 1) return bad('You must keep a card to discard. Melding your whole hand is not allowed.');
  const nats = cards.filter(c => !isWild(c)), wl = cards.filter(isWild);
  if (target === 'W' || (!target && !nats.length)){
    if (nats.length) return bad('A wild meld uses only 2s and jokers.');
    const ex = team.melds.find(m => m.rank === 'W' && !m.closed);
    const total = (ex ? ex.cards.length : 0) + cards.length;
    if (!ex && cards.length < 3) return bad('A new wild meld needs at least 3 wild cards (2s and jokers).');
    if (total > 7) return bad('A canasta is 7 cards. That would go over 7.');
    if (remaining < keepAfter(team, 'W', total, false, seat)) return bad(remaining === 0 ? 'You must keep a card to discard.' : 'That would leave you one card you could not discard: going out needs two canastas and no unfinished 7s, clean Aces or wild meld. Keep at least 2 cards.');
    removeFromHand(hand, cards);
    let m = ex; if (ex) ex.cards.push(...cards); else { m = {rank:'W', cards:cards.slice(), pure:false, closed:false}; team.melds.push(m); }
    markFresh(rs, seat, m, cards); closeIfFull(rs, m, SHORT[seat]);
    return {ok:true, desc:`${ex ? 'added ' + meldCards(cards) + ' to the wild meld (now ' + m.cards.length + ' cards)' : 'started a wild meld with ' + meldCards(cards)}`};
  }
  const r = target || nats[0].rank;
  if (nats.some(c => c.rank !== r)) return bad('A meld uses one rank only (plus wilds when allowed).');
  if (deadRank(rs, r)) return bad(`${rankName(r)} are dead: a canasta of them is already complete.`);
  const ex = findMeld(team, r);
  const exN = ex ? mNat(ex) : 0, exW = ex ? mWild(ex) : 0, exSize = ex ? ex.cards.length : 0;
  if (exSize + cards.length > 7) return bad('A canasta is 7 cards. That would go over 7.');
  if (!ex && target && !nats.length) return bad('Your team has no open meld of that rank.');
  if (!ex && nats.length < 3) return bad('A new meld needs at least 3 natural cards of one rank (no wilds).');
  if (wl.length){
    if (r === '7') return bad('7s must always be played clean (no wilds).');
    if (ex ? ex.pure : r === 'A') return bad('Aces melded clean must stay clean.');
    if (exN + nats.length < 5) return bad('Wilds can be added only once a meld has five natural cards.');
    if (exW + wl.length > 2) return bad('A meld can hold at most 2 wilds.');
    if (hasOpenWild(team)) return bad('Your team has an unfinished wild meld. Complete it before adding wilds to any other meld.');
  }
  const pureAfter = ex ? (ex.pure && !wl.length) : (r === '7' || r === 'A');
  if (remaining < keepAfter(team, r, exSize + cards.length, pureAfter, seat))
    return bad('You must still hold a card to discard, and discarding your last card means going out (which needs two canastas and no unfinished 7s, clean Aces or wild meld). Keep at least 2 cards.');
  removeFromHand(hand, cards);
  let m = ex;
  if (ex) ex.cards.push(...cards); else { m = {rank:r, cards:cards.slice(), pure:(r === '7' || r === 'A'), closed:false}; team.melds.push(m); }
  markFresh(rs, seat, m, cards); closeIfFull(rs, m, SHORT[seat]);
  return {ok:true, desc:`${ex ? 'added ' + meldCards(cards) + ' to the ' + rankName(r) + ' meld (now ' + m.cards.length + ' cards)' : 'started a ' + rankName(r) + ' meld with ' + meldCards(cards)}`};
}
const meldCards = cs => cs.length <= 3 ? cs.map(cardName).join(', ') : cs.length + ' cards';

/* ---------- the pack ---------- */
function packInfo(rs, seat){
  const top = rs.pack[rs.pack.length - 1];
  if (!top) return bad('The discard pile is empty.');
  if (isWild(top)) return bad('You cannot pick up the pack when the top card is a wild.');
  const team = rs.teams[teamOf(seat)], h = rs.hands[seat];
  if (deadRank(rs, top.rank)) return bad(`${rankName(top.rank)} are dead, so you cannot use that card.`);
  const ex = findMeld(team, top.rank);
  if (ex && ex.cards.length >= 5) return bad(`Your team already has ${ex.cards.length} cards in ${rankName(top.rank)}. Taking the pack would push it past seven.`);
  const rest = rs.pack.length - 1;
  if (!team.opened) return {ok:true, mode:'open', top};
  if (ex){
    if (h.length + rest < keepAfter(team, top.rank, ex.cards.length + 1, ex.pure, seat)) return bad('That would leave you without a card you can legally discard.');
    return {ok:true, mode:'add', meld:ex, top};
  }
  const pair = h.filter(c => c.rank === top.rank).slice(0, 2);
  if (pair.length < 2) return bad(`To take the pack you need two natural ${rankName(top.rank)} in your hand to match the top card (or an existing ${top.rank} meld to add it to).`);
  if (h.length - 2 + rest < keepAfter(team, top.rank, 3, top.rank === '7' || top.rank === 'A', seat)) return bad('That would leave you without a card you can legally discard.');
  return {ok:true, mode:'new', pair, top};
}
function pickPack(rs, seat){
  if (rs.phase !== 'draw') return bad('You have already drawn this turn.');
  const info = packInfo(rs, seat); if (!info.ok) return info;
  if (info.mode === 'open') return bad('Your team has not opened yet. Stage an opening meld first, then pick up the pack.');
  const team = rs.teams[teamOf(seat)], h = rs.hands[seat];
  const top = rs.pack.pop();
  if (info.mode === 'add'){ info.meld.cards.push(top); markFresh(rs, seat, info.meld, [top]); closeIfFull(rs, info.meld, SHORT[seat]); }
  else {
    removeFromHand(h, info.pair);
    const m = {rank:top.rank, cards:[top, ...info.pair], pure:(top.rank === '7' || top.rank === 'A'), closed:false};
    team.melds.push(m); markFresh(rs, seat, m, m.cards); closeIfFull(rs, m, SHORT[seat]);
  }
  const n = rs.pack.length; h.push(...rs.pack); rs.pack = [];
  rs.pickedPack = true; rs.phase = 'play';
  rs.log.push(`${SHORT[seat]} picked up the pack (${n + 1} cards) using the ${cardName(top)}.`);
  return {ok:true, top, n:n + 1};
}
/* opening by taking the pack: staged groups meet the minimum on their own; top card + a natural pair from hand are set aside */
function pickPackOpening(rs, seat, groups){
  if (rs.phase !== 'draw') return bad('You have already drawn this turn.');
  const info = packInfo(rs, seat); if (!info.ok) return info;
  if (info.mode !== 'open') return bad('Your team has already opened.');
  const top = info.top, h = rs.hands[seat];
  if (groups.some(g => g.some(c => !isWild(c) && c.rank === top.rank)))
    return bad(`Your opening meld already uses ${rankName(top.rank)}. Leave your ${rankName(top.rank)} in your hand: the top card and your pair become their own meld.`);
  const pair = h.filter(c => c.rank === top.rank && !groups.flat().some(x => x.id === c.id)).slice(0, 2);
  if (pair.length < 2) return bad(`To take the pack you need two natural ${rankName(top.rank)} in your hand to match the top card.`);
  const res = checkOpening(rs, seat, groups, sumVal(pair)); if (!res.ok) return res;
  const all = groups.flat();
  const remaining = h.filter(c => !all.some(x => x.id === c.id) && !pair.some(x => x.id === c.id)).length + rs.pack.length - 1;
  if (remaining < 2) return bad('That would leave you without a card to discard.');
  removeFromHand(h, all); removeFromHand(h, pair);
  rs.pack.pop();
  applyOpening(rs, seat, groups);
  const team = rs.teams[teamOf(seat)];
  const m = {rank:top.rank, cards:[top, ...pair], pure:(top.rank === '7' || top.rank === 'A'), closed:false};
  team.melds.push(m); markFresh(rs, seat, m, m.cards); closeIfFull(rs, m, SHORT[seat]);
  const n = rs.pack.length; h.push(...rs.pack); rs.pack = [];
  rs.pickedPack = true; rs.phase = 'play'; rs.pendingTalon = null;
  rs.log.push(`${SHORT[seat]} opened (${res.pts} points) and picked up the pack. No talon when you open with the pack.`);
  return {ok:true, pts:res.pts};
}

/* ---------- discarding ---------- */
function discardCheck(rs, seat, card){
  const h = rs.hands[seat];
  if (isThree(card)) return bad('3s can never be discarded.');
  if (isWild(card)){
    const onlyWilds = h.filter(c => c.id !== card.id).every(c => isWild(c) || isThree(c));
    if (h.length > 1 && !onlyWilds) return bad('A wild card can only be discarded as your very last card or when you hold nothing else.');
  }
  if (!rs.pack.length){
    const swad = card.rank === '7' || card.rank === 'A' || isWild(card) || deadRank(rs, card.rank);
    if (swad){
      const alt = h.some(c => c.id !== card.id && !isThree(c) && !isWild(c) && c.rank !== '7' && c.rank !== 'A' && !deadRank(rs, c.rank));
      if (alt) return bad('The discard pile is empty. A 7, Ace, wild or dead card cannot be the first discard (the SWAD rule).');
    }
  }
  if (h.length === 1){
    const g = goOutCheck(rs, seat); if (!g.ok) return g;
  }
  return {ok:true};
}
function discard(rs, seat, cardId){
  if (rs.phase !== 'play') return bad('Draw a card first.');
  const h = rs.hands[seat], card = h.find(c => c.id === cardId);
  if (!card) return bad('That card is not in your hand.');
  const chk = discardCheck(rs, seat, card); if (!chk.ok) return chk;
  removeFromHand(h, [card]);
  if (!h.length){
    rs.pack.push(card); rs.lastDiscard = {id:card.id, seat, t:rs.turnNo}; rs.log.push(`${SHORT[seat]} went out!`);
    endRound(rs, 'out', seat); return {ok:true, out:true, card};
  }
  rs.pack.push(card); rs.lastDiscard = {id:card.id, seat, t:rs.turnNo};
  rs.log.push(`${SHORT[seat]} discarded ${cardName(card)}.`);
  if (rs.pendingTalon && rs.pendingTalon.seat === seat){
    if (rs.stock.length >= 9){
      const n = rs.pendingTalon.n; for (let i = 0; i < n; i++) rs.talon[seat].push(rs.stock.pop());
      rs.log.push(`${SHORT[seat]} took a talon of ${n} cards.`);
    } else rs.log.push(`${SHORT[seat]} gets no talon: fewer than 9 cards are left in the draw pile.`);
    rs.pendingTalon = null;
  }
  rs.courtesy[seat] = false;
  rs.current = (rs.current + 1) % 4;
  startTurn(rs);
  return {ok:true, card};
}

/* ---------- special hands ---------- */
function shapeOK(counts, w2, wj, shape){
  const rem = shape.slice();
  for (const g of [w2, wj].filter(x => x > 0)){ const i = rem.indexOf(g); if (i < 0) return false; rem.splice(i, 1); }
  const a = counts.slice().sort((x, y) => y - x), b = rem.sort((x, y) => y - x);
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
function detectSpecial(cards){
  if (cards.length !== 14) return null;
  const nat = {}; let w2 = 0, wj = 0, threes = 0;
  for (const c of cards){
    if (c.rank === '2') w2++; else if (c.rank === 'JK') wj++;
    else { nat[c.rank] = (nat[c.rank] || 0) + 1; if (c.rank === '3') threes++; }
  }
  const res = [];
  if (wj === 1 && w2 === 1 && NAT.every(r => nat[r] === 1)) res.push({name:'Straight', points:3000});
  if (threes > 0) return res[0] || null;
  const counts = Object.values(nat);
  const only = (arr, n) => arr.length === n.length && arr.slice().sort((a, b) => b - a).every((v, i) => v === n[i]);
  if (counts.every(c => c === 2) && (w2 === 0 || w2 === 2) && (wj === 0 || wj === 2)){
    const wp = (w2 === 2 ? 1 : 0) + (wj === 2 ? 1 : 0), hasA = nat.A === 2, has7 = nat['7'] === 2;
    if (wp === 0 && counts.length === 7) res.push({name:'Pairs without wilds', points:2500});
    if (wp === 1 && hasA && has7) res.push({name:'Pairs with 1 wild', points:2000});
    if (wp === 2 && hasA && has7) res.push({name:'Miami Pairs', points:2500});
  }
  if (shapeOK(counts, w2, wj, [4,3,3,2,2])) res.push({name:'Zip Code', points:2500});
  if (w2 === 0 && wj === 0 && only(counts, [4,4,3,3])) res.push({name:'Garbage', points:3000});
  if (shapeOK(counts, w2, wj, [5,4,3,2])) res.push({name:'Blast Off', points:3000});
  const pairWild = (w2 === 2 && wj === 0) || (wj === 2 && w2 === 0);
  if (pairWild && only(counts, [4,4,4])) res.push({name:'Triples', points:3500});
  if (pairWild && only(counts, [3,3,3,3])) res.push({name:'Quads', points:3500});
  if (((w2 === 4 && wj === 0) || (wj === 4 && w2 === 0)) && only(counts, [5,5])) res.push({name:'Dream Hand +4', points:8500, dream:true});
  if (w2 + wj === 5 && only(counts, [5,4])) res.push({name:'Dream Hand +5', points:8500, dream:true});
  res.sort((a, b) => b.points - a.points);
  return res[0] || null;
}
function specialEligible(rs, seat){
  const team = rs.teams[teamOf(seat)];
  if (rs.phase !== 'play' || !rs.drewStock || rs.hands[seat].length !== 14) return false;
  return !team.opened || rs.courtesy[seat];
}
function declareSpecial(rs, seat){
  if (!specialEligible(rs, seat)) return bad('A special hand can only be declared before your team opens (or on your first turn after your partner opens), with exactly 14 cards, and your last card must come from the draw pile.');
  const sp = detectSpecial(rs.hands[seat]); if (!sp) return bad('Your 14 cards do not make a special hand.');
  const cards = rs.hands[seat].slice(); rs.hands[seat] = [];
  rs.log.push(`${SHORT[seat]} declared a special hand: ${sp.name} (${sp.points}).`);
  endRound(rs, 'special', seat, {team:teamOf(seat), seat, name:sp.name, points:sp.points, dream:!!sp.dream, cards});
  return {ok:true, sp};
}

/* ---------- scoring ---------- */
function threeScore(cards){
  const t = [0, 100, 300, 500, 1000];
  const red = cards.filter(isRedCard).length, black = cards.length - red;
  return t[Math.min(red, 4)] + t[Math.min(black, 4)];
}
function scoreTeam(rs, t){
  const team = rs.teams[t], lines = []; let total = 0;
  const add = (label, pts) => { lines.push({label, pts}); total += pts; };
  const end = rs.end;
  if (end.special && end.special.team === t){ add(`Special hand: ${end.special.name}`, end.special.points); return {lines, total}; }
  const can = team.melds.filter(m => m.closed), n = can.length;
  for (const m of can) add(`Canasta of ${rankName(m.rank)} (${canastaDesc(m)})`, canastaValue(m));
  if (end.reason === 'out' && teamOf(end.seat) === t) add('Going-out bonus', 100);
  const meldVal = sumVal(team.melds.flatMap(m => m.cards));
  if (team.melds.length) add(n > 0 ? 'Cards on the table (face value)' : 'Cards on the table (no canasta, so subtracted)', n > 0 ? meldVal : -meldVal);
  const th = threeScore(team.threes);
  const colours = cs => { const r = cs.filter(isRedCard).length, b = cs.length - r; return [r ? r + ' red' : '', b ? b + ' black' : ''].filter(Boolean).join(' + '); };
  if (team.threes.length) add(`3s on the table (${colours(team.threes)}): ${n >= 2 ? 'two canastas, so added' : (n === 1 ? 'one canasta, so they do not count' : 'no canasta, so subtracted')}`, n >= 2 ? th : (n === 1 ? 0 : -th));
  const seats = [t, t + 2];
  const handCards = seats.flatMap(s => rs.hands[s]);
  const handVal = sumVal(handCards.filter(c => !isThree(c)));
  if (handCards.length) add(`Cards left in hand (${handCards.length})`, -handVal);
  const h3 = handCards.filter(isThree);
  if (h3.length) add(`3s left in hand (${colours(h3)})`, -threeScore(h3));
  for (const m of team.melds.filter(m => !m.closed)){
    if (m.rank === '7') add('Unfinished 7s meld', -2500);
    else if (m.rank === 'A' && m.pure) add('Unfinished clean Aces meld', -2500);
    else if (m.rank === 'W') add('Unfinished wild meld', -2000);
  }
  for (const s of seats){
    const a = rs.hands[s].filter(c => c.rank === 'A').length, v = rs.hands[s].filter(c => c.rank === '7').length;
    if (a >= 3) add(`${SHORT[s]} holds ${a} Aces (3 or more)`, -1500);
    if (v >= 3) add(`${SHORT[s]} holds ${v} 7s (3 or more)`, -1500);
  }
  return {lines, total};
}
function endRound(rs, reason, seat, special){
  if (rs.ended) return;
  rs.ended = true; rs.end = {reason, seat, special: special || null};
  const teams = [scoreTeam(rs, 0), scoreTeam(rs, 1)];
  rs.result = {teams};
  const g = rs.game; g.scores[0] += teams[0].total; g.scores[1] += teams[1].total;
  if (special && special.dream){ g.over = true; g.winner = special.team; }
  else if (g.scores[0] >= 8500 || g.scores[1] >= 8500){
    if (g.scores[0] !== g.scores[1]){ g.over = true; g.winner = g.scores[0] > g.scores[1] ? 0 : 1; }
  }
}

/* ---------- AI ---------- */
function groupNat(h, rs){
  const by = {};
  for (const c of h){ if (isWild(c) || isThree(c) || deadRank(rs, c.rank)) continue; (by[c.rank] = by[c.rank] || []).push(c); }
  return by;
}
/* Exact opening-meld search. Returns the max achievable points and, when the target is reachable,
   the valid plan that uses the fewest wilds and cards (so good cards are not wasted). */
function solveOpening(rs, cards, need, strategic = false, extra = 0){
  cards = canon(cards);
  const nat = {};
  cards.forEach(c => { if (!isWild(c) && !isThree(c) && !(rs && deadRank(rs, c.rank))) (nat[c.rank] = nat[c.rank] || []).push(c); });
  const wilds = cards.filter(isWild).sort((a, b) => cardVal(b) - cardVal(a)), W = wilds.length;
  const wp = [0]; wilds.forEach((c, i) => wp.push(wp[i] + cardVal(c)));
  const maxCards = cards.length - 2 + extra; // extra = cards that will join the hand (e.g. the rest of the pack)
  let states = new Map([['0|0|0', {pts:0, groups:[]}]]);
  for (const r of Object.keys(nat)){
    const arr = nat[r]; if (arr.length < 2) continue;
    const next = new Map(states);
    for (const [key, st] of states){
      const [w, u, cl] = key.split('|').map(Number);
      for (let k = 2; k <= Math.min(arr.length, 7); k++) for (let x = 0; x <= (r === '7' ? 0 : 2); x++){
        if (k + x < 3 || k + x > 7 || w + x > W || u + k + x > maxCards) continue;
        // strategy (not a rule): a clean 7s or clean Aces meld costs -2,500 if unfinished, so only start one with 6+ cards.
        // Aces with a wild in the opening count as an ordinary mixed meld, which is safe.
        if (strategic && x === 0 && (r === '7' || r === 'A') && k < 6) continue;
        const nk = `${w + x}|${u + k + x}|${(cl || (x === 0 && k >= 3)) ? 1 : 0}`;
        const pts = st.pts + k * cardVal(arr[0]), cur = next.get(nk);
        if (!cur || cur.pts < pts) next.set(nk, {pts, groups:[...st.groups, {r, k, w:x}]});
      }
    }
    states = next;
  }
  let best = null, fit = null;
  for (const [key, st] of states){
    const [w, u, cl] = key.split('|').map(Number); if (!cl) continue;
    const tot = st.pts + wp[w];
    if (!best || tot > best.total) best = {total:tot, groups:st.groups, w, u};
    if (tot >= need && (!fit || w < fit.w || (w === fit.w && (u < fit.u || (u === fit.u && tot > fit.total))))) fit = {total:tot, groups:st.groups, w, u};
  }
  if (!best) return {ok:false, max:0, groups:[]};
  const pickG = fit || best;
  let wi = 0;
  const useW = wilds.slice(0, pickG.w); // the points above were counted with the highest-value wilds, so use those
  const groups = pickG.groups.map(g => { const cs = nat[g.r].slice(0, g.k); for (let i = 0; i < g.w; i++) cs.push(useW[wi++]); return cs; });
  return {ok: best.total >= need, max: best.total, groups, pts: pickG.total};
}
function planOpening(rs, seat, needOverride, extra = 0){
  const need = needOverride === undefined ? rs.needs[teamOf(seat)] : needOverride;
  const greedy = planOpeningGreedy(rs, seat, need, extra);
  if (greedy) return greedy;
  const sol = solveOpening(rs, rs.hands[seat], need, true, extra);
  if (!sol.ok) return null;
  return checkOpening(rs, seat, sol.groups, rs.needs[teamOf(seat)] - need).ok ? sol.groups : null;
}
/* opening by taking the pack: plan an opening from cards that do not use the top card's rank */
function packOpenPlan(rs, seat){
  const info = packInfo(rs, seat);
  if (!info.ok || info.mode !== 'open') return null;
  const R = info.top.rank, h = rs.hands[seat];
  if (R === '7' || R === 'A') return null; // strategy: the top card + pair would start a clean 7s/Aces meld (-2,500 if unfinished)
  if (h.filter(c => c.rank === R).length < 2) return null;
  const save = rs.hands[seat];
  rs.hands[seat] = h.filter(c => c.rank !== R);
  let plan = null;
  const pairPts = sumVal(h.filter(c => c.rank === R).slice(0, 2));
  const extra = (h.filter(c => c.rank === R).length - 2) + (rs.pack.length - 1); // cards you will still hold besides the planned meld
  try { plan = planOpening(rs, seat, Math.max(0, rs.needs[teamOf(seat)] - pairPts), extra); } finally { rs.hands[seat] = save; }
  if (!plan) return null;
  const used = plan.flat().length, remaining = h.length - used - 2 + rs.pack.length - 1;
  return remaining >= 2 ? plan : null;
}
function planOpeningGreedy(rs, seat, needArg, extra = 0){
  const h = canon(rs.hands[seat]), need = needArg === undefined ? rs.needs[teamOf(seat)] : needArg;
  const by = groupNat(h, rs);
  const wilds = h.filter(isWild).sort((a, b) => cardVal(a) - cardVal(b));
  const gv = g => sumVal(g);
  const groups = [];
  const total = () => groups.reduce((a, g) => a + gv(g.cards), 0);
  const safe = Object.keys(by).filter(r => by[r].length >= 3 && r !== '7' && r !== 'A').sort((a, b) => gv(by[b]) - gv(by[a]));
  for (const r of safe) groups.push({rank:r, cards:by[r].slice(0, 7)});
  let wi = 0;
  if (total() < need) for (const r of Object.keys(by).filter(r => by[r].length >= 2 && (r === '7' || r === 'A'))){
    // 7s and clean Aces are risky (-2,500 if unfinished): only with 6+ cards. Aces plus a wild become a safe mixed meld.
    if (by[r].length >= 6) groups.push({rank:r, cards:by[r].slice(0, 7)});
    else if (r === 'A' && wi < wilds.length) groups.push({rank:'A', cards:[...by[r].slice(0, 5), wilds[wi++]]});
    if (total() >= need) break;
  }
  if (total() < need) for (const g of groups.slice().sort((a, b) => gv(b.cards) - gv(a.cards))){
    if (g.rank === '7') continue;
    while (g.cards.filter(isWild).length < 2 && wi < wilds.length && total() < need && g.cards.length < 7) g.cards.push(wilds[wi++]);
  }
  if (total() < need) for (const r of Object.keys(by).filter(r => by[r].length === 2 && r !== '7' && !groups.some(g => g.rank === r)).sort((a, b) => gv(by[b]) - gv(by[a]))){
    if (wi >= wilds.length) break;
    groups.push({rank:r, cards:[...by[r], wilds[wi++]]}); if (total() >= need) break;
  }
  if (total() < need) return null;
  let n = groups.reduce((a, g) => a + g.cards.length, 0);
  while (n > h.length - 2 + extra && groups.length > 1){
    const order = groups.slice().sort((a, b) => gv(a.cards) - gv(b.cards));
    let removed = false;
    for (const g of order){
      const rest = groups.filter(x => x !== g);
      if (rest.reduce((a, x) => a + gv(x.cards), 0) >= need && rest.some(x => x.cards.length >= 3 && x.cards.every(c => !isWild(c)))){
        groups.splice(groups.indexOf(g), 1); n -= g.cards.length; removed = true; break;
      }
    }
    if (!removed) break;
  }
  if (n > h.length - 2 + extra) return null;
  const arr = groups.map(g => g.cards);
  return checkOpening(rs, seat, arr, rs.needs[teamOf(seat)] - need).ok ? arr : null;
}
function nextMeldAction(rs, seat){
  const h = rs.hands[seat], team = rs.teams[teamOf(seat)], keep = keepNeeded(rs, seat);
  const by = groupNat(h, rs);
  for (const m of team.melds){
    if (m.closed || m.rank === 'W') continue;
    const mine = by[m.rank] || [], room = 7 - m.cards.length;
    let take = Math.min(room, mine.length, h.length - 1);
    while (take > 0 && h.length - take < keepAfter(team, m.rank, m.cards.length + take, m.pure, seat)) take--;
    if (take > 0) return {ids:mine.slice(0, take).map(c => c.id), desc:`add ${take} ${rankName(m.rank)} to your ${rankName(m.rank)} meld`};
  }
  for (const m of team.melds){
    if (m.closed || m.rank === 'W' || m.pure || mNat(m) < 5 || hasOpenWild(team)) continue;
    const need = 7 - m.cards.length, wl = h.filter(isWild);
    if (need <= 2 - mWild(m) && wl.length >= need && h.length - need >= keepAfter(team, m.rank, 7, false, seat))
      return {ids:wl.slice(0, need).map(c => c.id), target:m.rank, desc:`add ${need} wild${need > 1 ? 's' : ''} to your ${rankName(m.rank)} meld to complete a canasta`};
  }
  for (const r of Object.keys(by)){
    if (by[r].length < 3 || findMeld(team, r)) continue;
    if ((r === '7' || r === 'A') && by[r].length < 6) continue; // clean 7s/Aces cost -2,500 if left unfinished
    let take = by[r].slice(0, 7);
    while (take.length >= 3 && h.length - take.length < keepAfter(team, r, take.length, r === '7' || r === 'A', seat)) take.pop();
    if (take.length >= 3) return {ids:take.map(c => c.id), desc:`start a meld of ${take.length} ${rankName(r)}`};
  }
  return null;
}
/* ---------- difficulty: only West and East change; your partner North always plays at full strength ---------- */
let AI_LEVEL = 'beginner';
function setAiLevel(l){ AI_LEVEL = (l === 'intermediate' || l === 'advanced') ? l : 'beginner'; }
const levelOf = seat => seat % 2 === 1 ? AI_LEVEL : 'advanced';
function seenCount(rs, rank){
  let n = 0;
  rs.teams.forEach(t => t.melds.forEach(m => { n += m.cards.filter(c => c.rank === rank).length; }));
  return n + rs.pack.filter(c => c.rank === rank).length;
}
function discardScore(rs, seat, c, h, cnt){
  const t = teamOf(seat), opp = rs.teams[1 - t], team = rs.teams[t], lv = levelOf(seat);
  let s = cardVal(c) * 0.5, w = 'It is a low-value card.';
  if (deadRank(rs, c.rank)){ s -= 100; w = 'That rank is dead, so it is the safest discard.'; }
  if (opp.melds.some(m => m.rank === c.rank && !m.closed)) s += lv === 'advanced' ? 80 : (lv === 'beginner' ? 8 : 40);
  if (team.melds.some(m => m.rank === c.rank && !m.closed)) s += lv === 'beginner' ? 15 : (lv === 'intermediate' ? 40 : 60);
  if (lv === 'advanced' && seenCount(rs, c.rank) >= 5) s -= 25;
  if (cnt[c.rank] >= 2) s += 25 * (cnt[c.rank] - 1);
  if (cnt[c.rank] >= 3) s += 30;
  const risky = c.rank === '7' || c.rank === 'A';
  const riskyHeld = (h.filter(x => x.rank === '7').length >= 3 || h.filter(x => x.rank === 'A').length >= 3);
  if (risky && cnt[c.rank] >= 3 && riskyHeld){ s -= 90; w = 'Holding three or more 7s or Aces costs -1,500, so get rid of one.'; }
  if (isWild(c)) s += 500;
  return {s, w};
}
function aiDiscardCard(rs, seat){
  const h = rs.hands[seat];
  const cnt = {}; h.forEach(c => cnt[c.rank] = (cnt[c.rank] || 0) + 1);
  let best = null, bs = 1e9, why = '';
  for (const c of h){
    if (!discardCheck(rs, seat, c).ok) continue;
    const r = discardScore(rs, seat, c, h, cnt);
    { const lv0 = levelOf(seat); if (lv0 === 'beginner') r.s += rs.rng() * 70; else if (lv0 === 'intermediate') r.s += rs.rng() * 25; } // beginner opponents are careless about what they throw away
    if (r.s < bs){ bs = r.s; best = c; why = r.w; }
  }
  return best ? {card:best, why} : {card:h.find(c => !isThree(c)) || h[0], why:'No safe option.'};
}
const planRanks = plan => plan.map(g => { const n = g.find(c => !isWild(c)) || g[0]; return rankName(n.rank); }).join(' and ');
function handAlert(rs, seat){
  const n = rs.hands[seat].length + (rs.talon[seat] ? rs.talon[seat].length : 0), who = SHORT[seat];
  if (n === 1) return `${who === 'You' ? 'You have' : who + ' has'} only one card left!`;
  if (n === 2) return `${who === 'You' ? 'You have' : who + ' has'} two cards left.`;
  return '';
}
function aiTurn(rs, seat){
  const log = [], name = SHORT[seat], team = rs.teams[teamOf(seat)];
  if (rs.justTalon){ log.push(`${name} picked up their talon (${rs.justTalon} cards).`); rs.justTalon = 0; }
  let r = layThrees(rs, seat); if (r.n) log.push(`${name} laid down ${r.n} three${r.n > 1 ? 's' : ''}.`); if (rs.ended) return log;
  let usedPack = false;
  const lv = levelOf(seat);
  if (!team.opened && rs.pack.length >= 3 && lv !== 'beginner' && !(lv === 'intermediate' && rs.rng() < 0.5)){
    const plan = packOpenPlan(rs, seat);
    if (plan){
      const n = rs.pack.length, topC = rs.pack[rs.pack.length - 1], p = pickPackOpening(rs, seat, plan);
      if (p.ok){ usedPack = true; log.push(`${name} opened with ${planRanks(plan)} (${p.pts} points) and took the pack of ${n} cards, using the ${cardName(topC)}. No talon when you open with the pack.`); }
    }
  }
  if (!usedPack && team.opened){
    const info = packInfo(rs, seat);
    if (info.ok && (info.mode === 'add' || info.mode === 'new')){
      const risky = info.top.rank === '7' || info.top.rank === 'A';
      if ((info.mode === 'add' || (!risky && rs.pack.length >= 2)) && !(lv === 'beginner' && rs.rng() < 0.6) && !(lv === 'intermediate' && rs.rng() < 0.2)){
        const topC = rs.pack[rs.pack.length - 1], p = pickPack(rs, seat); if (p.ok){ usedPack = true; log.push(`${name} picked up the pack of ${p.n} cards, using the ${cardName(topC)}.`); }
      }
    }
  }
  if (!usedPack){
    const d = drawStock(rs, seat);
    if (!d.ok){ log.push('The draw pile is empty. The round ends.'); return log; }
    log.push(`${name} drew from the draw pile.`);
    if (specialEligible(rs, seat) && detectSpecial(rs.hands[seat]) && rs.rng() < (lv === 'advanced' ? 1 : (lv === 'beginner' ? 0.1 : 0.3))){
      const sd = declareSpecial(rs, seat); if (sd.ok){ log.push(`${name} declared ${sd.sp.name} for ${sd.sp.points} points!`); return log; }
    }
    r = layThrees(rs, seat); if (r.n) log.push(`${name} laid down ${r.n} three${r.n > 1 ? 's' : ''}.`); if (rs.ended) return log;
  }
  if (team.opened && !team.permit[seat] && !team.asked[seat] && goOutState(rs, seat) === 'can-ask' && canGoOutSim(rs, seat)){
    if (seat === 2 && rs.interactive){ team.asked[2] = true; rs.pendingAsk = {seat:2}; log.push('North asks you: "May I go out?"'); return log; }
    askToGoOut(rs, seat).lines.forEach(l => log.push(l));
  }
  return aiTail(rs, seat, log);
}
/* the rest of a computer turn: open or meld, then discard (also used after you answer North's question) */
function aiContinue(rs, seat){ return aiTail(rs, seat, []); }
function aiTail(rs, seat, log){
  const name = SHORT[seat], team = rs.teams[teamOf(seat)], lv = levelOf(seat);
  if (!team.opened){
    const plan = planOpening(rs, seat);
    if (plan && !(lv === 'beginner' && rs.rng() < 0.25) && !(lv === 'intermediate' && rs.rng() < 0.1)){ const o = opening(rs, seat, plan); if (o.ok) log.push(`${name} opened with ${planRanks(plan)}: ${plan.flat().length} cards, ${o.pts} points.`); }
  } else {
    for (let i = 0; i < 8; i++){
      if ((lv === 'beginner' && rs.rng() < 0.3) || (lv === 'intermediate' && rs.rng() < 0.12)) break;
      const a = nextMeldAction(rs, seat); if (!a) break;
      const p = playGroup(rs, seat, a.ids, a.target); if (!p.ok) break;
      log.push(`${name} ${p.desc}.`);
    }
  }
  rs.alerts.splice(0).forEach(a => log.push(a));
  const d = aiDiscardCard(rs, seat);
  const before = rs.log.length;
  const res = discard(rs, seat, d.card.id);
  if (!res.ok){ const any = rs.hands[seat].find(c => discard(rs, seat, c.id).ok); }
  rs.log.length = before; // discard() logged its own lines; replace with a single clean summary
  if (rs.ended && rs.end.reason === 'out') log.push(`${name} went out with ${cardName(d.card)}!`);
  else log.push(`${name} discarded ${cardName(d.card)}.`);
  if (rs.talon[seat].length) log.push(`${name} took a talon of ${rs.talon[seat].length} cards (kept face down until their next turn).`);
  if (!rs.ended) { const left = handAlert(rs, seat); if (left) log.push(left); }
  return log;
}
function hintFor(rs, seat){
  const team = rs.teams[teamOf(seat)], h = rs.hands[seat], need = rs.needs[teamOf(seat)];
  if (rs.phase === 'draw'){
    if (h.some(isThree)) return {kind:'lay3', text:'Lay down your 3s first. Each one is replaced from the draw pile.', ids:h.filter(isThree).map(c => c.id)};
    const info = packInfo(rs, seat);
    if (team.opened && info.ok && info.mode !== 'open'){
      const risky = info.top.rank === '7' || info.top.rank === 'A';
      if (info.mode === 'add' || (!risky && rs.pack.length >= 2))
        return {kind:'pack', text:`Take the pack (${rs.pack.length} cards): the top card (${cardName(info.top)}) ${info.mode === 'add' ? `goes straight onto your ${rankName(info.top.rank)} meld` : 'starts a new meld with the highlighted pair from your hand'}. Click "Pick up pack".`, ids:info.pair ? info.pair.map(c => c.id) : []};
    }
    if (!team.opened && rs.pack.length >= 3){
      const plan = packOpenPlan(rs, seat);
      if (plan) return {kind:'packopen', groups:plan, top:info.top, pts:plan.reduce((a, g) => a + sumVal(g), 0), text:'', ids:[]};
    }
    return {kind:'draw', text: team.opened ? 'Draw from the draw pile.' : `Draw from the draw pile. Your team still needs to open (${need} points with a clean triple).`, ids:[]};
  }
  const sp = specialEligible(rs, seat) ? detectSpecial(h) : null;
  if (sp) return {kind:'special', text:`You hold a special hand: ${sp.name}! Click the gold "Declare" button to end the round for ${sp.points.toLocaleString()} points.`, ids:h.map(c => c.id)};
  if (h.some(isThree)) return {kind:'lay3', text:'Lay down your 3s (each is replaced from the draw pile) unless you are saving one for a Straight.', ids:h.filter(isThree).map(c => c.id)};
  if (!team.opened){
    const plan = planOpening(rs, seat);
    if (plan) return {kind:'open', groups:plan, pts:plan.reduce((a, g) => a + sumVal(g), 0), text:'', ids:[]};
    const sol = solveOpening(rs, h, need);
    const d0 = aiDiscardCard(rs, seat);
    return {kind:'discard', text:`You cannot open yet: your best legal opening is ${sol.max} points and you need ${need}${sol.max ? '' : ' (you need a clean triple first)'}. Discard the highlighted card. ${d0.why}`, ids:[d0.card.id]};
  }
  if (goOutState(rs, seat) === 'can-ask' && canGoOutSim(rs, seat)) return {kind:'askout', text:'You can go out this turn! First click "Ask partner to go out" and wait for a yes. You only get one ask per round.', ids:[]};
  const a = nextMeldAction(rs, seat);
  if (a) return {kind:'meld', text:`Meld: ${a.desc}. Select the highlighted cards, then ${a.target ? 'click your glowing ' + rankName(a.target) + ' meld on the table' : 'click "Meld selected"'}.`, ids:a.ids, target:a.target};
  const d = aiDiscardCard(rs, seat);
  if (h.length === 1) return {kind:'discard', text:`Discard your last card (${cardName(d.card)}) to go out! Your team has two canastas.`, ids:[d.card.id]};
  return {kind:'discard', text:`Discard the highlighted card. ${d.why}`, ids:[d.card.id]};
}

if (typeof module !== 'undefined') module.exports = {goOutState, askToGoOut, canGoOutSim, aiContinue, partnerAgrees, setAiLevel, handAlert, makeDeck, newGame, newRound, startTurn, layThrees, drawStock, opening, playGroup, packInfo, pickPack, pickPackOpening, discard, discardCheck, detectSpecial, specialEligible, declareSpecial, aiTurn, endRound, checkOpening, checkOpeningGroup, planOpening, planOpeningGreedy, solveOpening, packOpenPlan, nextMeldAction, aiDiscardCard, discardScore, hintFor, scoreTeam, goOutCheck, teamOf, isWild, isThree, cardVal, sumVal, canastaValue, rankName, cardName, openingNeed, findMeld, deadRank, mNat, mWild};

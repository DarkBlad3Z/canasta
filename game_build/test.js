const E = require('./engine.js');
function rngSeed(seed){ let s=seed>>>0; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }
function count(rs){ let n=0; rs.hands.forEach(h=>n+=h.length); n+=rs.stock.length+rs.pack.length; rs.talon.forEach(t=>n+=t.length); rs.teams.forEach(t=>{ t.melds.forEach(m=>n+=m.cards.length); n+=t.threes.length; }); if(rs.end&&rs.end.special) n+=rs.end.special.cards.length; return n; }
let stats={rounds:0,out:0,stock:0,special:0,games:0,turns:0,opened:0,canastas:0,errors:0};
for(let seed=1; seed<=120; seed++){
  const rng=rngSeed(seed); const game=E.newGame(rng); let guard=0;
  while(!game.over && guard++<40){
    const rs=E.newRound(game,rng); let turns=0;
    while(!rs.ended){
      if(turns++>600){ console.log('RUNAWAY seed',seed); stats.errors++; break; }
      try{ E.aiTurn(rs, rs.current); }catch(e){ console.log('EXC seed',seed,e.stack); stats.errors++; break; }
      if(count(rs)!==108){ console.log('CARD COUNT',count(rs),'seed',seed); stats.errors++; break; }
    }
    stats.rounds++; stats.turns+=turns; stats[rs.end.reason]=(stats[rs.end.reason]||0)+1;
    rs.teams.forEach(t=>{ if(t.opened) stats.opened++; stats.canastas+=t.melds.filter(m=>m.closed).length; });
  }
  stats.games++;
}
console.log(stats);
// special hand detection tests
const mk=(r,s='S')=>({id:Math.random(),rank:r,suit:s});
const T=(arr)=>arr.map(([r,n])=>Array.from({length:n},()=>mk(r))).flat();
console.log('pairs w/o', E.detectSpecial(T([['4',2],['5',2],['6',2],['8',2],['9',2],['10',2],['K',2]])));
console.log('pairs 1 wild', E.detectSpecial(T([['A',2],['7',2],['5',2],['8',2],['9',2],['10',2],['2',2]])));
console.log('miami', E.detectSpecial(T([['A',2],['7',2],['5',2],['8',2],['9',2],['JK',2],['2',2]])));
console.log('zip', E.detectSpecial(T([['4',4],['5',3],['6',3],['8',2],['9',2]])));
console.log('zip wild', E.detectSpecial(T([['4',4],['5',3],['6',3],['8',2],['JK',2]])));
console.log('garbage', E.detectSpecial(T([['4',4],['5',4],['6',3],['8',3]])));
console.log('blast', E.detectSpecial(T([['4',5],['5',4],['6',3],['8',2]])));
console.log('triples', E.detectSpecial(T([['4',4],['5',4],['6',4],['2',2]])));
console.log('quads', E.detectSpecial(T([['4',3],['5',3],['6',3],['8',3],['JK',2]])));
console.log('dream4', E.detectSpecial(T([['4',5],['5',5],['JK',4]])));
console.log('dream5', E.detectSpecial(T([['4',5],['5',4],['2',3],['JK',2]])));
console.log('straight', E.detectSpecial(T([['3',1],['4',1],['5',1],['6',1],['7',1],['8',1],['9',1],['10',1],['J',1],['Q',1],['K',1],['A',1],['2',1],['JK',1]])));
console.log('none', E.detectSpecial(T([['4',3],['5',3],['6',3],['8',3],['9',2]])));

const E=require('./engine.js');
function rngSeed(seed){ let s=seed>>>0; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }
let packOpens=0, normalOpens=0, rounds=0, firstOpenTurn=[], packPicks=0, wildMelds=0;
for(let seed=1; seed<=60; seed++){
  const rng=rngSeed(seed); const g=E.newGame(rng);
  for(let r=0;r<6 && !g.over;r++){
    const rs=E.newRound(g,rng); rounds++; let turns=0, opened=[false,false];
    while(!rs.ended && turns++<400){ const log=E.aiTurn(rs,rs.current);
      for(const l of log){ if(/took the pack \(/.test(l)) packOpens++; else if(/opened with/.test(l)) normalOpens++; if(/picked up the pack/.test(l)) packPicks++; }
      for(const t of [0,1]) if(rs.teams[t].opened && !opened[t]){ opened[t]=true; firstOpenTurn.push(turns); }
    }
  }
}
firstOpenTurn.sort((a,b)=>a-b);
console.log({rounds, normalOpens, packOpens, packPicks, medianOpenTurn:firstOpenTurn[Math.floor(firstOpenTurn.length/2)]});
// direct scenario: can packOpenPlan find a pack opening?
const g=E.newGame(()=>0.3); const rs=E.newRound(g,()=>0.3);
let id=50000; const mk=(r,s='S')=>({id:id++,rank:r,suit:s});
rs.current=0; rs.phase='draw'; rs.hands[0]=[mk('K'),mk('K','H'),mk('A'),mk('A','H'),mk('A','D'),mk('Q'),mk('Q','H'),mk('Q','D'),mk('J'),mk('J','H'),mk('J','D'),mk('10'),mk('10','H'),mk('10','D'),mk('4'),mk('6')];
rs.pack=[mk('5'),mk('9'),mk('K','D')];
console.log('needs',rs.needs[0],'packOpenPlan',JSON.stringify((E.packOpenPlan(rs,0)||[]).map(g=>g.map(c=>c.rank))));
console.log('hint', JSON.stringify(E.hintFor(rs,0)).slice(0,200));

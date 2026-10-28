const E=require('./engine.js');
function rngSeed(seed){ let s=seed>>>0; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }
// tag melds with how they were created
const origOpening=E.opening, origPlay=E.playGroup;
let rounds=0, pen={opening:0, later:0, pack:0, unknown:0}, sizes={}, completed={opening:0,later:0,pack:0}, started={opening:0,later:0,pack:0};
for(let seed=1; seed<=80; seed++){
  const rng=rngSeed(seed); const g=E.newGame(rng);
  for(let r=0;r<5 && !g.over;r++){
    const rs=E.newRound(g,rng); rounds++; let turns=0;
    const seen=new Set();
    while(!rs.ended && turns++<400){
      const opened=[rs.teams[0].opened, rs.teams[1].opened];
      const before=new Set(rs.teams.flatMap(t=>t.melds));
      const log=E.aiTurn(rs,rs.current);
      const how = log.some(l=>/opened/.test(l)) ? 'opening' : (log.some(l=>/picked up the pack|took the pack/.test(l)) ? 'pack' : 'later');
      for(const t of rs.teams) for(const m of t.melds){ if(!before.has(m) && !m.origin){ m.origin = (how==='pack' && log.some(l=>/opened/.test(l))) ? 'opening' : how; if(m.rank==='7'||(m.rank==='A'&&m.pure)) { started[m.origin]++; sizes[m.cards.length]=(sizes[m.cards.length]||0)+1; } } }
    }
    for(const t of rs.teams) for(const m of t.melds) if(m.rank==='7'||(m.rank==='A'&&m.pure)){ if(!m.closed) pen[m.origin||'unknown']++; else completed[m.origin||'unknown']++; }
  }
}
console.log({rounds, startedPure7orA:started, unfinished:pen, completed, startSizes:sizes});

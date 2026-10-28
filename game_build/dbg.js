const E=require('./engine.js');
let s=1; const rng=()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; };
const names={}; let ex=null;
for(let i=0;i<300;i++){ const g=E.newGame(rng); const rs=E.newRound(g,rng); let t=0; while(!rs.ended&&t++<400){ E.aiTurn(rs,rs.current);} if(rs.end.reason==='special'){ names[rs.end.special.name]=(names[rs.end.special.name]||0)+1; if(!ex) ex=rs.end.special.cards.map(c=>c.rank).join(','); } }
console.log(names, ex);

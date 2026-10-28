const E=require('./engine.js'); let id=9000; const mk=(r,s='S')=>({id:id++,rank:r,suit:s});
const rng=()=>0.5; const g=E.newGame(rng); const rs=E.newRound(g,rng); rs.current=0; rs.phase='draw';
const H=(arr)=>arr.flatMap(([r,n])=>Array.from({length:n},()=>mk(r)));
rs.hands[0]=H([['K',4],['Q',4],['J',3],['10',3],['9',2],['5',1]]);
rs.pack=[mk('4'),mk('8'),mk('9')];
const byRank=r=>rs.hands[0].filter(c=>c.rank===r);
const groups=[byRank('K'),byRank('Q'),byRank('J'),byRank('10')];
console.log('open via pack', JSON.stringify(E.pickPackOpening(rs,0,groups)), 'hand',rs.hands[0].length,'melds',rs.teams[0].melds.map(m=>m.rank+m.cards.length),'pack',rs.pack.length,'talon',rs.pendingTalon);
// normal open with wild, then target wilds
const rs2=E.newRound(g,rng); rs2.current=0; rs2.phase='play';
rs2.hands[0]=H([['K',4],['Q',3],['J',3],['10',3],['5',2],['2',2],['JK',1]]);
const b2=r=>rs2.hands[0].filter(c=>c.rank===r);
console.log('open', JSON.stringify(E.opening(rs2,0,[b2('K'),b2('Q'),b2('J'),b2('10')])));
rs2.hands[0].push(...H([['K',3]]));
console.log('add 3 K', JSON.stringify(E.playGroup(rs2,0,b2('K').slice(0,3).map(c=>c.id))));
const k=rs2.teams[0].melds.find(m=>m.rank==='K'); console.log('K meld size',k.cards.length);
const wilds=rs2.hands[0].filter(E.isWild);
console.log('wilds to K target', JSON.stringify(E.playGroup(rs2,0,wilds.slice(0,2).map(c=>c.id),'K')), k.cards.length, k.closed);
// wild meld
const rs3=E.newRound(g,rng); rs3.current=0; rs3.phase='play'; rs3.teams[0].opened=true;
rs3.hands[0]=H([['2',3],['JK',2],['5',3]]);
console.log('wild meld 2 only', JSON.stringify(E.playGroup(rs3,0,rs3.hands[0].filter(E.isWild).slice(0,2).map(c=>c.id))));
console.log('wild meld 3', JSON.stringify(E.playGroup(rs3,0,rs3.hands[0].filter(E.isWild).slice(0,3).map(c=>c.id))));
// scoring example
const rs4=E.newRound(g,rng); rs4.teams[0].melds=[{rank:'K',cards:H([['K',7]]),closed:true,pure:false},{rank:'Q',cards:H([['Q',7]]),closed:true,pure:false}]; rs4.hands[0]=H([['5',2]]); rs4.hands[2]=[]; rs4.end={reason:'out',seat:0,special:null};
console.log(JSON.stringify(E.scoreTeam(rs4,0)));

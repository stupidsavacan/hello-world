// DEPRECATION NOTICE — STAGE 2/5
//
// AssistManager no longer mutates hands or the wall.
// Its public surface is temporarily preserved so callers can survive while
// the implementation is dismantled in later pull requests.

(function attachAssistManager(global){
  const Sanma=global.Sanma=global.Sanma||{};

  function ids(state){
    const out=[],wall=state&&state.wall;
    ['tiles','deadWall'].forEach(k=>(wall&&Array.isArray(wall[k])?wall[k]:[]).forEach(t=>t&&t.instanceId&&out.push(t.instanceId)));
    (state&&Array.isArray(state.players)?state.players:[]).forEach(p=>{
      ['hand','discards','kitaTiles'].forEach(k=>(p&&Array.isArray(p[k])?p[k]:[]).forEach(t=>t&&t.instanceId&&out.push(t.instanceId)));
      (p&&Array.isArray(p.melds)?p.melds:[]).forEach(m=>(m&&Array.isArray(m.tiles)?m.tiles:[]).forEach(t=>t&&t.instanceId&&out.push(t.instanceId)));
    });
    return out;
  }

  function integrity(state){
    const all=ids(state),seen=new Set(),dups=[];
    all.forEach(id=>{if(seen.has(id))dups.push(id);seen.add(id);});
    return {tileCount:all.length,duplicateInstanceIds:dups,valid:dups.length===0};
  }

  function evaluate(input){
    const o=input||{},state=o.state||{},p=o.player||null,phase=o.phase||'draw',check=integrity(state);
    return {
      type:'assist',
      phase,
      playerIndex:p&&Number.isInteger(p.id)?p.id:null,
      enabled:false,
      applied:false,
      rate:0,
      roll:null,
      reason:'AssistManager is retired from mutation and retained temporarily for compatibility.',
      beforeShanten:null,
      afterShanten:null,
      outgoing:null,
      incoming:null,
      tileCountIntegrityChecked:true,
      beforeTileCount:check.tileCount,
      afterTileCount:check.tileCount,
      duplicateInstanceIds:check.duplicateInstanceIds,
      integrityValid:check.valid
    };
  }

  Sanma.AssistManager={
    evaluate,
    evaluateOpening:i=>evaluate(Object.assign({},i||{},{phase:'opening'})),
    evaluateDraw:i=>evaluate(Object.assign({},i||{},{phase:'draw'})),
    tileIntegrity:integrity,
    findSwap:()=>null
  };
})(window);

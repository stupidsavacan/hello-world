// RETIREMENT NOTICE — stage 3/4
//
// Compatibility shell only. No state inspection, candidate search, randomness,
// or mutation remains. The namespace survives for callers until stage 4 deletes it.

(function attachAssistManager(global){
  const Sanma=global.Sanma=global.Sanma||{};
  function result(input){
    const o=input||{},p=o.player||null,phase=o.phase||'draw';
    return {
      type:'assist',
      phase,
      playerIndex:p&&Number.isInteger(p.id)?p.id:null,
      enabled:false,
      applied:false,
      rate:0,
      roll:null,
      reason:'AssistManager is retired and retained only as a compatibility shell.',
      beforeShanten:null,
      afterShanten:null,
      outgoing:null,
      incoming:null,
      tileCountIntegrityChecked:false,
      beforeTileCount:null,
      afterTileCount:null,
      duplicateInstanceIds:[],
      integrityValid:true
    };
  }
  Sanma.AssistManager={
    evaluate:result,
    evaluateOpening:i=>result(Object.assign({},i||{},{phase:'opening'})),
    evaluateDraw:i=>result(Object.assign({},i||{},{phase:'draw'})),
    tileIntegrity:()=>({tileCount:0,duplicateInstanceIds:[],valid:true}),
    findSwap:()=>null
  };
})(window);

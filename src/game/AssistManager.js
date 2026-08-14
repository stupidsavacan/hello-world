// DEPRECATION NOTICE — STAGE 3/5
//
// AssistManager is now a compatibility shell only.
// No gameplay mutation, probability logic, shanten analysis, swap search,
// or integrity inspection remains.

(function attachAssistManager(global){
  const Sanma=global.Sanma=global.Sanma||{};

  function evaluate(input){
    const o=input||{},p=o.player||null;
    return {
      type:'assist',
      phase:o.phase||'draw',
      playerIndex:p&&Number.isInteger(p.id)?p.id:null,
      enabled:false,
      applied:false,
      rate:0,
      roll:null,
      reason:'AssistManager compatibility shell: retired.',
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
    evaluate,
    evaluateOpening:i=>evaluate(Object.assign({},i||{},{phase:'opening'})),
    evaluateDraw:i=>evaluate(Object.assign({},i||{},{phase:'draw'})),
    tileIntegrity:()=>({tileCount:0,duplicateInstanceIds:[],valid:true,retired:true}),
    findSwap:()=>null
  };
})(window);

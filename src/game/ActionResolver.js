// RETIREMENT 7/10 — SHANTEN ANALYSIS REDUCED TO A PLACEHOLDER
//
// Recursive standard-hand search, chiitoitsu handling, and kokushi handling are gone.
// The exported estimator remains only as a coarse compatibility placeholder.

(function attachCpuStrategy(global){
  const Sanma=global.Sanma=global.Sanma||{};

  function estimateShanten(input){
    const tiles=input&&Array.isArray(input.tiles)?input.tiles:[];
    if(!tiles.length)return 99;
    const open=Math.max(0,Number(input&&input.openMeldCount)||0);
    const effectiveTiles=tiles.length+open*3;
    return Math.max(-1,Math.ceil((14-effectiveTiles)/3));
  }

  function chooseDiscard(input){
    const o=input||{},p=o.player||{},hand=Array.isArray(p.hand)?p.hand:[],rule=o.ruleConfig||{},rand=typeof o.random==='function'?o.random:Math.random;
    if(!hand.length)return{tileInstanceId:null,reason:'手牌がありません。',candidates:[],score:0};
    const open=(p.melds||[]).length;
    const cand=hand.map((t,i)=>{
      const left=hand.slice();left.splice(i,1);
      const sh=estimateShanten({tiles:left,ruleConfig:rule,openMeldCount:open});
      const tie=rand();
      return{tileInstanceId:t.instanceId,tileLabel:Sanma.TileUtil.getTileAriaLabel(t),tileType:t.baseId,score:-sh+tie/1000,baseScore:-sh,shanten:sh,reasons:['互換用の粗い推定'],tieBreaker:tie};
    }).sort((a,b)=>b.score-a.score||String(a.tileInstanceId).localeCompare(String(b.tileInstanceId)));
    const s=cand[0];
    return{tileInstanceId:s.tileInstanceId,reason:`互換用シャンテン推定 ${s.shanten}。`,candidates:cand,score:s.baseScore};
  }

  function chooseCall(){return null;}
  Sanma.CpuStrategy={chooseDiscard,estimateShanten,chooseCall};
})(window);

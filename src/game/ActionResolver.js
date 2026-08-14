// RETIREMENT 8/10 — COMPATIBILITY SHELL
//
// Strategic behavior is gone. Only legacy method names remain.

(function attachCpuStrategy(global){
  const Sanma=global.Sanma=global.Sanma||{};

  function estimateShanten(){
    return 99;
  }

  function chooseDiscard(input){
    const player=input&&input.player?input.player:{};
    const hand=Array.isArray(player.hand)?player.hand:[];
    const tile=hand[0]||null;
    return{
      tileInstanceId:tile?tile.instanceId:null,
      reason:'互換シェル: 戦略評価は終了しました。',
      candidates:[],
      score:0
    };
  }

  function chooseCall(){
    return null;
  }

  Sanma.CpuStrategy={chooseDiscard,estimateShanten,chooseCall};
})(window);

(function attachCanonicalUiAdapter(global){
  const S=global.Sanma=global.Sanma||{};
  const P=S.GameEngine&&S.GameEngine.prototype;
  if(!P)return;

  if(typeof P.requestHumanKita!=='function'&&typeof P.extractHumanKita==='function'){
    P.requestHumanKita=function(instanceId){return this.extractHumanKita(instanceId);};
  }

  if(typeof P.requestHumanKan==='function'&&typeof P.selectHumanKan==='function'&&!P.__modernKanAdapter){
    const originalRequest=P.requestHumanKan;
    P.requestHumanKan=function(optionIndex){
      const result=originalRequest.call(this);
      if(result&&this.pendingKanChoice&&Number.isInteger(Number(optionIndex))){
        return this.selectHumanKan(Number(optionIndex));
      }
      return result;
    };
    P.__modernKanAdapter=true;
  }

  if(!P.__modernStateAdapter){
    const originalGetState=P.getState;
    P.getState=function(){
      const state=originalGetState.call(this);
      state.wall={remainingCount:state.wallRemaining,doraIndicators:state.doraIndicators||[]};
      state.match=state.matchState||null;
      state.humanActions=state.humanAvailableActions||[];
      state.players=(state.players||[]).map(player=>Object.assign({},player,{
        concealedCount:Number.isInteger(player.handCount)?player.handCount:(player.hand||[]).length,
        hand:(player.hand||[]).filter(Boolean),
      }));
      state.gameRecord=this.gameRecord?JSON.parse(JSON.stringify(this.gameRecord)):null;
      return state;
    };
    P.__modernStateAdapter=true;
  }
})(window);

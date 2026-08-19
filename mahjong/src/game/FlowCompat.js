(function attachCompactFlows(global){
  const Sanma=global.Sanma=global.Sanma||{};
  const call=(name)=>(...args)=>name.call(args.shift(),...args);
  Sanma.DrawContext=Sanma.DrawContext||{
    createNormalDrawContext(player){return{playerIndex:player.id,isRinshan:false,isInitialDealerDraw:false,isTenho:false,isChiho:false};},
    createLastDiscard(discarderIndex,tile){return{playerIndex:discarderIndex,tile,isFinalDrawDiscard:false};},
    createHumanWinContext(winType){return Sanma.ActionResolver.createWinContext(this,this.humanPlayer.id,winType,this.lastDiscard?this.lastDiscard.playerIndex:null,winType==='ron'&&this.lastDiscard?this.lastDiscard.tile:null);}
  };
  Sanma.RecordFlow=Sanma.RecordFlow||{
    recordGameEvent(type,data){return this.recordGameEvent(type,data);},
    playerTileEvent(player,tile){return{playerIndex:player.id,playerName:player.name,tile:this.tileSnapshot(tile),tileInstanceId:tile&&tile.instanceId};},
    tileSnapshot(tile){return this.tileSnapshot(tile);},
    recordAssist(event){if(event&&event.applied)this.recordGameEvent('assist',event);}
  };
  Sanma.RoundLifecycle={startRound(){return this.startRound();},startNextRound(){return this.startNextRound();},dealInitialHands(){return true;},finishGameRecord(result){return this.endRound(result);},withDrawTenpai(result){return result;},getRoundLabel(){return this.round&&this.round.label||'';}};
  Sanma.TurnFlow={runCpuUntilHumanTurn(){return this.runCpuUntilHumanTurn();},runCpuUntilHumanTurnUnlocked(){return this.runCpuUntilHumanTurn();},continueAfterDiscard(i){return this.advanceAfterDiscard(i);},discardHumanTile(id){return this.discardHumanTile(id);},declareHumanRiichi(){return this.declareHumanRiichi();},requestHumanKita(id){return this.requestHumanKita(id);}};
  Sanma.WinFlow={tryCpuTsumo(i){return this.tryTsumo(i);},claimHumanTsumo(){return this.claimHumanTsumo();},collectRonCandidatesAfterDiscard(i){return this.collectReactions(i);},resolveRonWin(i,a,o){return this.resolveWin(i,a,'ron',o&&o.fromPlayerIndex);},resolveRonCandidatesAfterDiscard(i){return this.resolvePendingCpuRon(i);},resolveExhaustiveDraw(){return this.resolveExhaustiveDraw();}};
  Sanma.CallFlow={claimHumanCall(id,index){return this.claimHumanCall(id,index);},skipHumanCall(){return this.skipHumanCall();}};
  Sanma.KanFlow={requestHumanKan(i){return this.requestHumanKan(i);},selectHumanKan(i){return this.selectHumanKan(i);},tryCpuKan(){return false;},openOrResolveChankan(){return false;},finalizePendingKan(){return this.finalizePendingKan();}};
  Sanma.RecoveryFlow={skipHumanCall(engine){return engine.skipHumanCall();},finalizePendingKan(engine){return engine.finalizePendingKan();},startRound(engine){return engine.startRound();},resolvePendingCpuRon(engine,i){return engine.resolvePendingCpuRon(i);}};
})(window);

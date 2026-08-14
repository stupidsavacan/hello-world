(function attachGameEngine(global){
const Sanma=global.Sanma=global.Sanma||{};
const clone=v=>JSON.parse(JSON.stringify(v));
class GameEngine{
constructor(options={}){this.ruleConfig=Sanma.RuleConfig.createRuleConfig(options.ruleConfig||{});this.seed=Sanma.SeedPolicy?Sanma.SeedPolicy.requireValidSeed(options.seed||`game-${Date.now()}`):String(options.seed||Date.now());
      this.onChange=typeof options.onChange==='function'?options.onChange:null;
      this.matchManager=new Sanma.MatchManager({ruleConfig:this.ruleConfig});
      this.debugEventLog=Sanma.DebugEventLog?Sanma.DebugEventLog.create(100):null;
      this.stateMachine=Sanma.GameStateMachine?Sanma.GameStateMachine.create('idle'):null;
      this.gameRecord=null; this.logs=[]; this.cpuThinkingLog=[]; this.assistEvents=[]; this.cpuTaskActive=false;
      this.startRound();
    }
get humanPlayer(){return this.players&&this.players.find(p=>p.isHuman)||null;}
addLog(message){this.logs.unshift(String(message));this.logs=this.logs.slice(0,50);}
emitChange(){if(this.onChange)this.onChange(this.getState());}
syncStateMachine(label){if(this.stateMachine&&Sanma.GameStateMachine)Sanma.GameStateMachine.syncLegacy(this.stateMachine,this.phase,this.matchManager.state,label||'sync');}
validateAction(label,allowed){const state=this.stateMachine?this.stateMachine.state:null;if(Array.isArray(allowed)&&allowed.length&&state&&!allowed.includes(state))return{ok:false,reason:`${label}は現在実行できません。`};return{ok:true};}
recordGameEvent(type,data){return this.gameRecord&&Sanma.GameRecord?Sanma.GameRecord.addEvent(this.gameRecord,type,data||{}):null;}
tileSnapshot(t){return t?{instanceId:t.instanceId,baseId:t.baseId,suit:t.suit,rank:t.rank,label:Sanma.TileUtil.getTileShortLabel(t),isRed:Boolean(t.isRed)}:null;}
startRound(){
      this.round=this.matchManager.getRoundSnapshot();
      const roundSeed=Sanma.SeedPolicy?Sanma.SeedPolicy.deriveSeed(this.seed,`${this.round.label}:${this.round.honba}`):`${this.seed}:${this.round.label}:${this.round.honba}`;
      this.wall=new Sanma.Wall(this.ruleConfig,{seed:roundSeed});
      this.cpuRandom=Sanma.createRandom(Sanma.SeedPolicy?Sanma.SeedPolicy.deriveSeed(roundSeed,'cpu'):`${roundSeed}:cpu`);
      this.assistRandom=Sanma.createRandom(Sanma.SeedPolicy?Sanma.SeedPolicy.deriveSeed(roundSeed,'assist'):`${roundSeed}:assist`);
      this.players=this.matchManager.state.players.map(p=>new Sanma.Player(p));
      this.turnIndex=this.round.dealerIndex;this.phase='dealing';this.winResult=null;this.lastDiscard=null;this.callWindow=null;this.pendingKanAttempt=null;this.lastDrawContext=null;this.lastKanContext=null;this.assistUsage={opening:0,drawsByPlayer:Object.create(null)};
      for(let n=0;n<13;n++)for(const p of this.players)p.receiveTile(this.wall.draw());
      const dealer=this.players[this.round.dealerIndex];dealer.receiveTile(this.wall.draw());for(const p of this.players)if(p!==dealer)p.lastDraw=null;
      if(!this.gameRecord)this.gameRecord=Sanma.GameRecord.create({matchId:this.matchManager.state.matchId,seed:this.seed,ruleConfig:this.ruleConfig,players:this.players,roundLabel:this.round.label,dealerIndex:this.round.dealerIndex,honba:this.round.honba,riichiSticks:this.round.riichiSticks,startingPoints:this.players.map(p=>p.points)});
      else Sanma.GameRecord.addRound(this.gameRecord,{roundLabel:this.round.label,dealerIndex:this.round.dealerIndex,honba:this.round.honba,riichiSticks:this.round.riichiSticks,startingPoints:this.players.map(p=>p.points)});
      this.recordGameEvent('deal',{dealerIndex:this.round.dealerIndex,hands:this.players.map(p=>({playerIndex:p.id,tiles:p.hand.map(t=>this.tileSnapshot(t))}))});
      const assist=Sanma.AssistManager&&Sanma.AssistManager.evaluateOpening({state:this,player:dealer,ruleConfig:this.ruleConfig,random:this.assistRandom});if(assist&&assist.applied){this.assistEvents.unshift(assist);this.recordGameEvent('assist',{phase:'opening',playerIndex:dealer.id});}
      this.phase=dealer.isHuman?'human-discard':'cpu-running';this.syncStateMachine('round-start');this.addLog(`${this.round.label}${this.round.honba}本場を開始しました。`);this.emitChange();if(!dealer.isHuman)this.runCpuUntilHumanTurn();return true;
    }
startNextRound(){if(!this.matchManager.startNextRound())return false;return this.startRound();}
drawFor(player,isRinshan=false){if(!player)return null;const tile=isRinshan&&this.wall.drawRinshan?this.wall.drawRinshan():this.wall.draw();if(!tile){this.resolveExhaustiveDraw();return null;}player.receiveTile(tile);this.lastDrawContext={playerIndex:player.id,isRinshan:Boolean(isRinshan),isKitaReplacement:false};this.recordGameEvent('draw',{playerIndex:player.id,tile:this.tileSnapshot(tile),rinshan:Boolean(isRinshan)});if(Sanma.FuritenManager&&Sanma.FuritenManager.onDraw)Sanma.FuritenManager.onDraw(player);const assist=Sanma.AssistManager&&Sanma.AssistManager.evaluateDraw({state:this,player,ruleConfig:this.ruleConfig,random:this.assistRandom});if(assist&&assist.applied){this.assistEvents.unshift(assist);this.recordGameEvent('assist',{phase:'draw',playerIndex:player.id});}return player.lastDraw;}
getAvailableActions(playerIndex){return Sanma.ActionResolver.getAvailableActions(this,playerIndex);}
getState(){const human=this.humanPlayer,actions=human?this.getAvailableActions(human.id):[];return{ruleConfig:clone(Sanma.RuleConfig.publicSettings?Sanma.RuleConfig.publicSettings(this.ruleConfig):this.ruleConfig),seed:this.seed,round:clone(this.round),phase:this.phase,turnIndex:this.turnIndex,wall:{remainingCount:this.wall?this.wall.remainingCount():0,doraIndicators:this.wall?(this.wall.doraIndicators||[]).map(t=>this.tileSnapshot(t)):[]},players:(this.players||[]).map(p=>({id:p.id,name:p.name,seatWind:p.seatWind,points:p.points,isHuman:p.isHuman,hand:p.isHuman?p.hand.map(t=>this.tileSnapshot(t)):[],concealedCount:p.hand.length,discards:p.discards.map(t=>this.tileSnapshot(t)),melds:p.melds.map(m=>({type:m.type,kanType:m.kanType,open:m.open,fromPlayerIndex:m.fromPlayerIndex,tiles:(m.tiles||[]).map(t=>this.tileSnapshot(t))})),kitaTiles:p.kitaTiles.map(t=>this.tileSnapshot(t)),lastDraw:p.isHuman?this.tileSnapshot(p.lastDraw):null,hasRiichi:p.hasRiichi,ippatsuActive:p.ippatsuActive})),humanActions:actions.map(a=>({id:a.id,label:a.label,enabled:a.enabled,reason:a.reason,options:(a.options||[]).map(o=>({type:o.type,label:o.label}))})),callWindow:this.callWindow?{isOpen:true,fromPlayerIndex:this.callWindow.fromPlayerIndex,tile:this.tileSnapshot(this.callWindow.tile),actions:this.callWindow.actions.map(a=>({id:a.id,label:a.label,enabled:a.enabled,options:(a.options||[]).map(o=>({type:o.type,label:o.label}))}))}:null,winResult:clone(this.winResult),logs:this.logs.slice(),cpuThinkingLog:this.cpuThinkingLog.slice(),assistEvents:this.assistEvents.slice(0,20).map(e=>({phase:e.phase,playerIndex:e.playerIndex,applied:e.applied,reason:e.reason})),match:this.matchManager.getState(),gameRecord:this.gameRecord?clone(this.gameRecord):null};}
}
Sanma.GameEngine=GameEngine;
})(window);

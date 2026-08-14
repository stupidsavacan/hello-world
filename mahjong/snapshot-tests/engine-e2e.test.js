const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
global.window=global;global.localStorage={getItem(){return null},setItem(){},removeItem(){},key(){return null},length:0};
const root=path.join(__dirname,'..');
function load(rel){const f=path.join(root,rel);vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f});}
[
'src/game/RuleConfig.js','src/debug/DebugEventLog.js','src/game/GameStateMachine.js','src/game/RoundManager.js','src/game/HonbaManager.js','src/game/RankingManager.js','src/game/EndConditionManager.js','src/game/MatchManager.js','src/game/Tile.js','src/game/HandAnalysis.js','src/game/DoraCalculator.js','src/game/YakuAnalysis.js','src/game/ScoreCalculator.js','src/game/Settlement.js','src/game/RiichiManager.js','src/game/KanManager.js','src/game/KitaManager.js','src/game/FuritenManager.js','src/game/RiichiRules.js','src/game/KanRules.js','src/game/EndTurnYakuResolver.js','src/game/SanmaRuleDetails.js','src/game/ActionResolver.js','src/game/CpuVisibleTiles.js','src/game/CpuRiskAnalysis.js','src/game/CpuStrategy.js','src/game/CallResolver.js','src/game/AssistManager.js','src/game/GameRecord.js','src/game/CallWindow.js','src/game/SeedPolicy.js','src/game/Wall.js','src/game/Player.js','src/game/TileLedger.js','src/game/InvariantChecker.js','src/game/RecoveryManager.js','src/game/DrawContext.js','src/game/RecordFlow.js','src/game/RoundLifecycle.js','src/game/TurnFlow.js','src/game/TurnFlowCpu.js','src/game/WinFlow.js','src/game/CallFlow.js','src/game/KanFlow.js','src/game/RecoveryFlow.js','src/game/UiStateView.js','src/game/GameEngine.js','src/ui/CanonicalUiAdapter.js','src/ui/ReplayViewer.js'
].forEach(load);
const required=['getState','startNextRound','discardHumanTile','claimHumanTsumo','declareHumanRiichi','extractHumanKita','requestHumanKita','requestHumanKan','selectHumanKan','cancelHumanKanChoice','claimHumanCall','skipHumanCall','drawForHumanManually','startRound','handleDiscard','findCpuRonAfterDiscard','beginKanAttempt'];
required.forEach(name=>assert.strictEqual(typeof Sanma.GameEngine.prototype[name],'function',`missing GameEngine.${name}`));
const e=new Sanma.GameEngine({seed:'snapshot-e2e',ruleConfig:{matchLength:'tonpuu',northMode:'kita-dora'},onChange(){}});
let steps=0,rounds=0;
while(!e.matchManager.state.matchEnded&&steps++<2000){
 if(e.phase==='human-call'){const ron=e.callWindow&&e.callWindow.actions.find(a=>a.id==='ron'&&a.enabled);ron?e.claimHumanRon():e.skipHumanCall();continue;}
 if(e.phase==='human-kan-choice'){e.cancelHumanKanChoice();continue;}
 if(e.phase==='human-discard'||e.phase==='caller-discard'){
  const tsumo=Sanma.ActionResolver.findAction(e,e.humanPlayer.id,'tsumo');if(tsumo&&tsumo.enabled){e.claimHumanTsumo();continue;}
  const locked=e.humanPlayer.hasRiichi&&e.humanPlayer.lastDraw&&e.humanPlayer.lastDraw.instanceId;
  const choice=locked?{tileInstanceId:locked}:Sanma.CpuStrategy.chooseDiscard({player:e.humanPlayer,ruleConfig:e.ruleConfig,state:e,random:()=>0});
  const id=choice&&choice.tileInstanceId||e.humanPlayer.hand[e.humanPlayer.hand.length-1].instanceId;e.discardHumanTile(id);continue;
 }
 if(e.phase==='win-ended'||e.phase==='round-ended'){rounds++;if(!e.matchManager.state.matchEnded)assert.ok(e.startNextRound());continue;}
 if(e.phase==='cpu-running'){e.runCpuUntilHumanTurn();continue;}
 throw new Error(`stuck phase: ${e.phase}`);
}
assert.ok(e.matchManager.state.matchEnded,'tonpuu match must finish');assert.ok(rounds>=3,'several rounds must be played');assert.strictEqual(Sanma.TileLedger.inspect(e,e.ruleConfig).ok,true,'tile ledger must stay valid');
const view=e.getState();assert.ok(view.wall&&Number.isInteger(view.wall.remainingCount));assert.ok(Array.isArray(view.humanActions));assert.ok(view.match);assert.ok(view.players.find(p=>p.isHuman).hand.length>0);view.players.filter(p=>!p.isHuman).forEach(p=>assert.strictEqual(p.hand.length,0,'CPU concealed hand leaked'));
const players=[{id:0,name:'A',isHuman:true,points:35000},{id:1,name:'B',isHuman:false,points:35000},{id:2,name:'C',isHuman:false,points:35000}],record=Sanma.GameRecord.create({players});
Sanma.GameRecord.addEvent(record,'deal',{hands:[{playerIndex:0,tiles:['white']},{playerIndex:1,tiles:['white','white','2p']},{playerIndex:2,tiles:['1s']}]});Sanma.GameRecord.addEvent(record,'discard',{playerIndex:0,tile:'white'});Sanma.GameRecord.addEvent(record,'call',{playerIndex:1,action:'pon',fromPlayerIndex:0,tiles:['white','white','white'],calledTile:'white'});
const replay=Sanma.ReplayViewer.create(record);Sanma.ReplayViewer.jumpToEnd(replay);assert.strictEqual(replay.view.discards[0].length,0,'called tile remained in river');assert.strictEqual(replay.view.melds[1][0].type,'pon');assert.strictEqual(replay.partial,false,replay.diagnostics.join(' / '));
console.log(`snapshot-engine-e2e: ok (${steps} steps, ${rounds} rounds)`);

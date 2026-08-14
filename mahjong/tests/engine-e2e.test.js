const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
global.window=global;global.localStorage={getItem(){return null},setItem(){},removeItem(){},key(){return null},length:0};
const root=path.join(__dirname,'..');
function load(rel){const f=path.join(root,rel);vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f});}
[
'src/game/RuleConfig.js','src/debug/DebugEventLog.js','src/game/GameStateMachine.js','src/game/RoundManager.js','src/game/HonbaManager.js','src/game/RankingManager.js','src/game/EndConditionManager.js','src/game/MatchManager.js','src/game/Tile.js','src/game/HandAnalysis.js','src/game/DoraCalculator.js','src/game/YakuAnalysis.js','src/game/ScoreCalculator.js','src/game/Settlement.js','src/game/RiichiManager.js','src/game/KanManager.js','src/game/KitaManager.js','src/game/FuritenManager.js','src/game/RiichiRules.js','src/game/KanRules.js','src/game/EndTurnYakuResolver.js','src/game/SanmaRuleDetails.js','src/game/ActionResolver.js','src/game/CpuVisibleTiles.js','src/game/CpuRiskAnalysis.js','src/game/CpuStrategy.js','src/game/CallResolver.js','src/game/AssistManager.js','src/game/GameRecord.js','src/game/CallWindow.js','src/game/SeedPolicy.js','src/game/Wall.js','src/game/Player.js','src/game/TileLedger.js','src/game/InvariantChecker.js','src/game/RecoveryManager.js','src/game/DrawContext.js','src/game/RecordFlow.js','src/game/RoundLifecycle.js','src/game/TurnFlow.js','src/game/TurnFlowCpu.js','src/game/WinFlow.js','src/game/CallFlow.js','src/game/KanFlow.js','src/game/RecoveryFlow.js','src/game/UiStateView.js','src/game/GameEngine.js'
].forEach(load);
const e=new Sanma.GameEngine({seed:'engine-e2e',ruleConfig:{matchLength:'tonpuu',northMode:'kita-dora'}});
let steps=0,rounds=0;
while(!e.matchManager.state.matchEnded&&steps++<2000){
 if(e.phase==='human-call'){const ron=e.callWindow.actions.find(a=>a.id==='ron');ron?e.claimHumanRon():e.skipHumanCall();continue;}
 if(e.phase==='human-discard'||e.phase==='caller-discard'){
  const tsumo=Sanma.ActionResolver.findAction(e,e.humanPlayer.id,'tsumo');if(tsumo&&tsumo.enabled){e.claimHumanTsumo();continue;}
  const locked=e.humanPlayer.hasRiichi&&e.humanPlayer.lastDraw&&e.humanPlayer.lastDraw.instanceId;
  const choice=locked?{tileInstanceId:locked}:Sanma.CpuStrategy.chooseDiscard({player:e.humanPlayer,ruleConfig:e.ruleConfig,state:e,random:()=>0});
  e.discardHumanTile(choice?choice.tileInstanceId:e.humanPlayer.hand[e.humanPlayer.hand.length-1].instanceId);continue;
 }
 if(e.phase==='win-ended'||e.phase==='round-ended'){rounds++;if(!e.matchManager.state.matchEnded)assert.ok(e.startNextRound());continue;}
 if(e.phase==='cpu-running'){e.runCpuUntilHumanTurn();continue;}
 throw new Error(`stuck phase: ${e.phase}`);
}
assert.ok(e.matchManager.state.matchEnded,'tonpuu match must finish');
assert.ok(rounds>=3,'several rounds must be played');
assert.ok(e.gameRecord&&e.gameRecord.rounds.length>=rounds,'rounds must be recorded');
assert.strictEqual(Sanma.TileLedger.inspect(e,e.ruleConfig).ok,true,'tile ledger must stay valid');
const view=e.getState();
assert.ok(view.players[0].hand.length>0,'human hand must be visible');
view.players.filter(p=>!p.isHuman).forEach(p=>{assert.ok(p.hand.length>0);assert.ok(p.hand.every(t=>t===null),'CPU concealed hands must stay masked');});
assert.strictEqual(typeof Sanma.RecoveryFlow.startRound,'function');
console.log(`engine-e2e: ok (${steps} steps, ${rounds} rounds)`);

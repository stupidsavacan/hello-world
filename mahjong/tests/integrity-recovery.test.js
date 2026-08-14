const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm'); global.window=global;
const root=path.join(__dirname,'..'); function load(rel){const f=path.join(root,rel);vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f});}
['src/game/RuleConfig.js','src/game/Tile.js','src/game/SeedPolicy.js','src/game/Wall.js','src/game/Player.js','src/debug/DebugEventLog.js','src/game/GameStateMachine.js','src/game/CallWindow.js','src/game/TileLedger.js','src/game/InvariantChecker.js','src/game/RecoveryManager.js'].forEach(load);
const rules=Sanma.RuleConfig.createRuleConfig({northMode:'kita-dora'}), wall=new Sanma.Wall(rules,{seed:'integrity'});
const players=[0,1,2].map(i=>new Sanma.Player({id:i,name:i?'CPU':'Human',seatWind:['east','south','west'][i],isHuman:i===0,points:35000}));
for(let n=0;n<13;n++) for(const p of players) p.receiveTile(wall.draw());
players.forEach(p=>p.lastDraw=null);
const state={ruleConfig:rules,wall,players,turnIndex:0,round:{dealerIndex:0,honba:0,riichiSticks:0},phase:'human-discard',debugEventLog:Sanma.DebugEventLog.create(20),stateMachine:Sanma.GameStateMachine.create('waitingForDiscard')};
assert.strictEqual(Sanma.TileLedger.inspect(state,rules).ok,true);
assert.strictEqual(Sanma.InvariantChecker.checkState(state,rules).ok,true);
wall.tiles.push(players[0].hand[0]); const dup=Sanma.TileLedger.inspect(state,rules); assert.strictEqual(dup.ok,false); assert.ok(dup.errors.some(e=>e.includes('ID'))); wall.tiles.pop();
state.turnIndex=99; assert.strictEqual(Sanma.InvariantChecker.checkState(state,rules).ok,false); state.turnIndex=0;
state.phase='human-call'; state.callWindow={isOpen:true,fromPlayerIndex:2,actions:[{id:'skip',enabled:true}]}; players[0].lastDraw=players[0].hand[players[0].hand.length-1];
const recovered=Sanma.RecoveryManager.closeStuckActionWindow(state); assert.strictEqual(recovered.ok,true); assert.strictEqual(state.phase,'human-discard'); assert.strictEqual(state.turnIndex,0); assert.strictEqual(state.callWindow,null);
assert.strictEqual(Sanma.InvariantChecker.checkState(state,rules).ok,true);
console.log('integrity-recovery: ok');

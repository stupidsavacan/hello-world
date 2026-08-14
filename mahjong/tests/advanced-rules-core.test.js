const fs=require('fs'),path=require('path'),vm=require('vm');
global.window=global; global.Sanma={};
for(const file of [
  'src/game/RuleConfig.js','src/game/Tile.js','src/game/HandAnalysis.js','src/game/Player.js',
  'src/game/SanmaRuleDetails.js','src/game/RiichiManager.js','src/game/KanManager.js','src/game/KitaManager.js',
  'src/game/FuritenManager.js','src/game/RiichiRules.js','src/game/KanRules.js','src/game/EndTurnYakuResolver.js'
]) vm.runInThisContext(fs.readFileSync(path.resolve(__dirname,'..',file),'utf8'),{filename:file});
const {RuleConfig,TileUtil,Player,RiichiRules,FuritenManager,KitaManager,KanManager,KanRules,EndTurnYakuResolver}=Sanma;
let n=0; const honor={east:1,south:2,west:3,north:4,white:5,green:6,red:7};
function tile(code){const suit=honor[code]?'z':code.slice(-1),rank=honor[code]||Number(code.slice(0,-1));return TileUtil.createTile(suit,rank,++n,false)}
function hand(codes){return codes.map(tile)}
function assert(v,m){if(!v)throw new Error(m)}
const cfg=RuleConfig.createRuleConfig({});
const p=new Player({id:'p0',name:'P0',seatWind:'east',isHuman:true,points:2000});
p.hand=hand(['1p','2p','3p','4p','5p','6p','7s','8s','9s','east','east','east','9m','9m']);
const state={players:[p],ruleConfig:cfg,wall:{remainingCount:()=>10},round:{riichiSticks:0},turnIndex:3};
const avail=RiichiRules.canDeclare(state,0); assert(avail.enabled&&avail.discardOptions.length>0,'riichi should be available');
assert(RiichiRules.declare(state,0).applied,'riichi declare failed');
const discard=p.hand.find(t=>p.riichi.pendingDiscardInstanceIds.includes(t.instanceId));
assert(RiichiRules.finalizeDeclaration(state,0,discard).applied,'riichi finalize failed');
assert(p.points===1000&&state.round.riichiSticks===1&&p.hasRiichi,'riichi payment/state invalid');
const low=new Player({id:'low',name:'low',seatWind:'east',points:900}); low.hand=p.hand.slice();
assert(!RiichiRules.canDeclare({players:[low],ruleConfig:cfg,wall:{remainingCount:()=>10}},0).enabled,'low points riichi accepted');
const noWall=new Player({id:'nw',name:'nw',seatWind:'east',points:2000}); noWall.hand=p.hand.slice();
assert(!RiichiRules.canDeclare({players:[noWall],ruleConfig:cfg,wall:{remainingCount:()=>0}},0).enabled,'zero live wall riichi accepted');
const f=new Player({id:'f',name:'F',seatWind:'south',points:35000});
f.hand=hand(['1p','2p','3p','4p','5p','6p','7s','8s','9s','east','east','east','9m']);
f.discards=[tile('9m')];
let elig=FuritenManager.checkRonEligibility({state:{players:[f],ruleConfig:cfg},playerIndex:0,winningTile:tile('9m')});
assert(elig.furiten&&!elig.canRon&&elig.canTsumo&&elig.reasons.includes('現物フリテン'),'genbutsu furiten invalid');
f.discards=[]; f.sameTurnFuriten=true; elig=FuritenManager.checkRonEligibility({state:{players:[f],ruleConfig:cfg},playerIndex:0,winningTile:tile('9m')});
assert(elig.reasons.includes('同巡フリテン'),'same-turn furiten missing');
f.sameTurnFuriten=false; f.hasRiichi=true; FuritenManager.markMissedRon({players:[f]},0); assert(f.riichiMissedWin,'riichi missed-win not persisted');
const k=new Player({id:'k',name:'K',seatWind:'south',points:35000}); const north=tile('north'); k.hand=[north];
const repl=tile('1p'); const ks={players:[k],ruleConfig:cfg,wall:{draw:()=>repl}};
const kr=KitaManager.extract(ks,0,north.instanceId); assert(kr.applied&&k.kitaTiles[0]===north&&k.hand.includes(repl)&&ks.lastDrawContext.isKitaReplacement,'kita extraction invalid');
const a=new Player({id:'a',name:'A',seatWind:'south',points:35000}); a.hand=hand(['white','white','white','white']);
assert(KanManager.getOptions({players:[a],ruleConfig:cfg,wall:{remainingCount:()=>5}},0).some(o=>o.type==='ankan'),'ankan not detected');
const m=new Player({id:'m',name:'M',seatWind:'south',points:35000}); m.hand=hand(['white','white','white']);
const d=tile('white'); const mstate={players:[m,{discards:[d]}],lastDiscard:{playerIndex:1,tile:d},ruleConfig:cfg,wall:{remainingCount:()=>0}};
assert(!KanRules.getAvailableKanActions({state:mstate,playerIndex:0}).some(o=>o.type==='minkan'),'minkan allowed with empty live wall');
const eplayer={hasRiichi:true,ippatsuActive:true};
let end=EndTurnYakuResolver.resolve({state:{players:[eplayer],ruleConfig:cfg,wall:{remainingCount:()=>0,getUraDoraIndicators:()=>[]},lastDiscard:{isFinalDrawDiscard:true}},playerIndex:0,winType:'ron'});
assert(end.isHoutei&&!end.isHaitei&&!end.isRinshan,'houtei context invalid');
end=EndTurnYakuResolver.resolve({state:{players:[eplayer],ruleConfig:cfg,wall:{remainingCount:()=>0,getUraDoraIndicators:()=>[]},lastDrawContext:{playerIndex:0,isRinshan:true}},playerIndex:0,winType:'tsumo'});
assert(end.isRinshan&&!end.isHaitei,'rinshan must not also be haitei');
console.log('advanced rules core tests passed');

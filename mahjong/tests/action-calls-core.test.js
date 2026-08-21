const fs=require('fs'),path=require('path'),vm=require('vm'); global.window=global; global.Sanma={};
for(const f of ['RuleConfig','Tile','HandAnalysis','Player','DoraCalculator','YakuAnalysis','ScoreCalculator','Settlement','SanmaRuleDetails','RiichiManager','KanManager','KitaManager','FuritenManager','RiichiRules','KanRules','EndTurnYakuResolver','ActionResolver','CallResolver','CallWindow']) vm.runInThisContext(fs.readFileSync(path.resolve(__dirname,'..','src/game',f+'.js'),'utf8'),{filename:f});
const {RuleConfig,TileUtil,Player,ActionResolver,CallResolver,CallWindow}=Sanma; let n=0; const honor={east:1,south:2,west:3,north:4,white:5,green:6,red:7};
function tile(c){const s=honor[c]?'z':c.slice(-1),r=honor[c]||Number(c.slice(0,-1));return TileUtil.createTile(s,r,++n,false)} function hand(a){return a.map(tile)} function assert(v,m){if(!v)throw Error(m)}
const cfg=RuleConfig.createRuleConfig({allowChi:true});
function player(id,h,isHuman=false){const p=new Player({id,name:id,seatWind:id==='p0'?'east':'south',points:35000,isHuman});p.hand=hand(h);return p}
let p0=player('p0',[],true), p1=player('p1',['white','white']), p2=player('p2',[]); let wd=tile('white');
let state={players:[p0,p1,p2],ruleConfig:cfg,lastDiscard:{playerIndex:0,tile:wd},round:{dealerIndex:0,roundWind:'east',honba:0,riichiSticks:0},wall:{remainingCount:()=>20,doraIndicators:[],getUraDoraIndicators:()=>[]}};
assert(CallResolver.getLegalCallActions(state,1).some(a=>a.id==='pon'),'legal pon missing');
p1=player('p1',['1p','2p']); p2=player('p2',['1p','2p']); let d3p=tile('3p'); state={...state,players:[p0,p1,p2],lastDiscard:{playerIndex:0,tile:d3p}};
assert(CallResolver.getLegalCallActions(state,1).some(a=>a.id==='chi'),'upper-player chi missing');
assert(!CallResolver.getLegalCallActions(state,2).some(a=>a.id==='chi'),'non-upper-player chi accepted');
p1=player('p1',['1m','2m']); let d3m=tile('3m'); state={...state,players:[p0,p1,p2],lastDiscard:{playerIndex:0,tile:d3m}};
assert(!CallResolver.getLegalCallActions(state,1).some(a=>a.id==='chi'),'manzu chi accepted in sanma');
p1=player('p1',['white','white']); p1.hasRiichi=true; state={...state,players:[p0,p1,p2],lastDiscard:{playerIndex:0,tile:wd}};
assert(CallResolver.getLegalCallActions(state,1).length===0,'riichi-locked call accepted');
p1.hasRiichi=false; state.wall={remainingCount:()=>0,doraIndicators:[],getUraDoraIndicators:()=>[]}; assert(CallResolver.getLegalCallActions(state,1).length===0,'non-winning call accepted with empty wall');
p1=player('p1',['white','white','white']); state={...state,players:[p0,p1,p2],wall:{remainingCount:()=>20,doraIndicators:[],getUraDoraIndicators:()=>[]},lastDiscard:{playerIndex:0,tile:wd}};
const cands=CallResolver.collectCpuCallCandidates(state,0); assert(cands.length>=2&&cands[0].actionId==='kan'&&cands.some(c=>c.actionId==='pon'),'CPU call ordering invalid');
p1=player('p1',['1p','2p','3p','4p','5p','6p','7s','8s','9s','white','white','9m','9m'],true); state={...state,players:[p0,p1,p2],lastDiscard:{playerIndex:0,tile:tile('white')}};
const win=ActionResolver.findAction(state,1,'ron'); assert(win&&win.enabled,'valid yakuhai ron missing');
const window=CallWindow.create(state,1); assert(window&&window.actions[0].id==='ron'&&window.actions.some(a=>a.id==='pon'),'ron not highest-priority reaction');
CallWindow.close(window,'skip'); assert(!window.isOpen&&window.closeReason==='skip','call window close invalid');
console.log('action calls core tests passed');

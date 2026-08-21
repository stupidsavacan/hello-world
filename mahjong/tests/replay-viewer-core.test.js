const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
global.window=global;const root=path.join(__dirname,'..');
function load(rel){const f=path.join(root,rel);vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f});}
load('src/game/GameRecord.js');load('src/ui/ReplayViewer.js');
const players=[{id:0,name:'あなた',isHuman:true,points:35000},{id:1,name:'CPU 1',points:35000},{id:2,name:'CPU 2',points:35000}];
const record=Sanma.GameRecord.create({players,roundLabel:'東1局',dealerIndex:0,startingPoints:[35000,35000,35000]});
Sanma.GameRecord.addEvent(record,'deal',{hands:[{playerIndex:0,tiles:['1p','2p']},{playerIndex:1,tiles:['3p']},{playerIndex:2,tiles:['4p']}]});
Sanma.GameRecord.addEvent(record,'draw',{playerIndex:0,tile:'5p'});
Sanma.GameRecord.addEvent(record,'discard',{playerIndex:0,tile:'1p'});
Sanma.GameRecord.addEvent(record,'riichi',{playerIndex:0,changes:[{playerIndex:0,delta:-1000,after:34000}]});
const replay=Sanma.ReplayViewer.create(record,0);
assert.strictEqual(replay.eventIndex,0);assert.deepStrictEqual(replay.view.hands[0],[]);
Sanma.ReplayViewer.stepForward(replay);assert.deepStrictEqual(replay.view.hands[0],['1p','2p']);
Sanma.ReplayViewer.stepForward(replay);assert.ok(replay.view.hands[0].includes('5p'));
Sanma.ReplayViewer.stepBack(replay);assert.ok(!replay.view.hands[0].includes('5p'));
Sanma.ReplayViewer.jumpToEnd(replay);assert.deepStrictEqual(replay.view.hands[0],['2p','5p']);assert.strictEqual(replay.view.points[0],34000);
assert.ok(Sanma.ReplayViewer.eventText(record.rounds[0].events[2],record).includes('discard'));
const partial=Sanma.GameRecord.create({players,roundLabel:'東1局'});Sanma.GameRecord.addEvent(partial,'draw',{playerIndex:0,tile:'9s'});const p=Sanma.ReplayViewer.create(partial,0);Sanma.ReplayViewer.jumpToEnd(p);assert.strictEqual(p.partial,true);assert.deepStrictEqual(p.view.hands[0],['9s']);
console.log('replay-viewer-core: ok');

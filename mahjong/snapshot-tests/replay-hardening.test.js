const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
global.window=global;global.Sanma={};
const root=path.join(__dirname,'..');
function load(rel){const f=path.join(root,rel);vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:rel});}
load('src/game/GameRecord.js');load('src/ui/ReplayViewer.js');
const S=global.Sanma;
function players(){return[{id:0,name:'Human',isHuman:true,initialPoints:35000},{id:1,name:'CPU 1',isHuman:false,initialPoints:35000},{id:2,name:'CPU 2',isHuman:false,initialPoints:35000}];}
function record(){return S.GameRecord.create({players:players(),startingPoints:[35000,35000,35000],seed:'replay-hardening'});}
function tile(baseId,instanceId){return{baseId,instanceId,label:baseId};}
function end(r){const st=S.ReplayViewer.create(r,0);S.ReplayViewer.jumpToEnd(st);return st;}

(function minkan(){const called=tile('z5','called'),hand=[tile('z5','w1'),tile('z5','w2'),tile('z5','w3')],r=record();S.GameRecord.addEvent(r,'deal',{hands:[{playerIndex:0,tiles:[called]},{playerIndex:1,tiles:hand},{playerIndex:2,tiles:[]}]});S.GameRecord.addEvent(r,'discard',{playerIndex:0,tile:called});S.GameRecord.addEvent(r,'kan',{playerIndex:1,kanType:'minkan',fromPlayerIndex:0,calledTile:called,consumedTileInstanceIds:hand.map(t=>t.instanceId),tiles:hand.concat(called)});const st=end(r),m=st.view.melds[1][0];assert.strictEqual(m.type,'minkan');assert.strictEqual(m.kanType,'minkan');assert.strictEqual(m.open,true);assert.strictEqual(m.fromPlayerIndex,0);assert.strictEqual(m.tiles.length,4);assert.strictEqual(st.view.discards[0].length,0);assert.strictEqual(st.partial,false,st.diagnostics.join(' / '));})();

(function ankan(){const tiles=[tile('z5','a1'),tile('z5','a2'),tile('z5','a3'),tile('z5','a4')],r=record();S.GameRecord.addEvent(r,'deal',{hands:[{playerIndex:0,tiles:[]},{playerIndex:1,tiles},{playerIndex:2,tiles:[]}]});S.GameRecord.addEvent(r,'kan',{playerIndex:1,kanType:'ankan',consumedTileInstanceIds:tiles.map(t=>t.instanceId),tiles});const st=end(r),m=st.view.melds[1][0];assert.strictEqual(m.type,'ankan');assert.strictEqual(m.kanType,'ankan');assert.strictEqual(m.open,false);assert.strictEqual(m.tiles.length,4);assert.strictEqual(st.partial,false,st.diagnostics.join(' / '));})();

(function kakan(){const called=tile('z5','kc'),pon=[tile('z5','k1'),tile('z5','k2')],added=tile('z5','k3'),r=record();S.GameRecord.addEvent(r,'deal',{hands:[{playerIndex:0,tiles:[called]},{playerIndex:1,tiles:pon.concat(added)},{playerIndex:2,tiles:[]}]});S.GameRecord.addEvent(r,'discard',{playerIndex:0,tile:called});S.GameRecord.addEvent(r,'call',{playerIndex:1,action:'pon',fromPlayerIndex:0,calledTile:called,tiles:pon.concat(called)});S.GameRecord.addEvent(r,'kan',{playerIndex:1,kanType:'kakan',meldIndex:0,fromPlayerIndex:0,consumedTileInstanceIds:[added.instanceId],tiles:pon.concat(called,added)});const st=end(r),m=st.view.melds[1][0];assert.strictEqual(st.view.melds[1].length,1);assert.strictEqual(m.type,'kakan');assert.strictEqual(m.kanType,'kakan');assert.strictEqual(m.open,true);assert.strictEqual(m.fromPlayerIndex,0);assert.strictEqual(m.tiles.length,4);assert.strictEqual(st.partial,false,st.diagnostics.join(' / '));})();

(function settlements(){const r=record();S.GameRecord.addEvent(r,'score_settlement',{resultType:'exhaustive_draw',changes:[{playerIndex:0,after:36500},{playerIndex:1,after:36500},{playerIndex:2,after:32000}]});let st=end(r);assert.deepStrictEqual(st.view.points,[36500,36500,32000]);assert.ok(S.ReplayViewer.eventText(r.rounds[0].events[0],r).includes('点棒精算'));const r2=record();S.GameRecord.addEvent(r2,'double_ron',{fromPlayerIndex:1,winners:[{winnerIndex:0},{winnerIndex:2}],changes:[{playerIndex:0,after:43000},{playerIndex:1,after:15000},{playerIndex:2,after:47000}]});st=end(r2);assert.deepStrictEqual(st.view.points,[43000,15000,47000]);})();

console.log('snapshot-replay-hardening: ok');

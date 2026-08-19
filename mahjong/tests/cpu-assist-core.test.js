const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

global.window = global;
function load(name) {
  const file = path.join(__dirname, '..', 'src', 'game', `${name}.js`);
  vm.runInThisContext(fs.readFileSync(file, 'utf8'), { filename: file });
}
['RuleConfig','Tile','HandAnalysis','CpuVisibleTiles','CpuRiskAnalysis','CpuStrategy','AssistManager'].forEach(load);

const T = Sanma.TileUtil;
let copy = 0;
function tile(suit, rank, red=false) { return T.createTile(suit, rank, copy++, red); }

(function visibleInformationBoundary() {
  const rules = Sanma.RuleConfig.createRuleConfig({ northMode: 'kita-dora' });
  const state = {
    ruleConfig: rules,
    round: { dealerIndex: 0, roundWind: 'east' },
    wall: { doraIndicators: [tile('p', 3)], tiles: [tile('s', 9)], deadWall: [tile('z', 7)], remainingCount(){ return 30; } },
    players: [
      { id:0, name:'CPU', hand:[tile('p',1), tile('p',2)], discards:[], melds:[], kitaTiles:[] },
      { id:1, name:'HiddenA', hand:[tile('s',1), tile('s',2)], discards:[tile('z',1)], melds:[], kitaTiles:[] },
      { id:2, name:'HiddenB', hand:[tile('p',8)], discards:[], melds:[], kitaTiles:[] },
    ],
  };
  const before = { ...Sanma.CpuVisibleTiles.getVisibleCountsForPlayer(state, 0) };
  state.players[1].hand = [tile('p',9), tile('p',9), tile('p',9)];
  state.wall.tiles = [tile('z',5), tile('z',6)];
  state.wall.deadWall = [tile('p',7)];
  const after = { ...Sanma.CpuVisibleTiles.getVisibleCountsForPlayer(state, 0) };
  assert.deepStrictEqual(after, before, 'CPU visible counts must ignore concealed opponent hands and hidden wall tiles');
  assert.strictEqual(before['1p'], 1);
  assert.strictEqual(before['2p'], 1);
  assert.strictEqual(before['z1'], 1);
  assert.strictEqual(before['3p'], 1, 'dora indicator is public');
  assert.strictEqual(before['1s'] || 0, 0, 'opponent concealed hand is not public');
})();

(function deterministicDiscardChoice() {
  const rules = Sanma.RuleConfig.createRuleConfig({ northMode: 'kita-dora' });
  const hand = [
    tile('p',1),tile('p',2),tile('p',3),
    tile('p',4),tile('p',5),tile('p',6),
    tile('s',2),tile('s',3),tile('s',4),
    tile('s',7),tile('s',8),tile('s',9),
    tile('z',1),tile('z',3),
  ];
  const player = { id:0, name:'CPU', hand, discards:[], melds:[], kitaTiles:[] };
  const state = { ruleConfig: rules, round:{dealerIndex:1,roundWind:'east'}, players:[player,{id:1,hand:[],discards:[],melds:[],kitaTiles:[]},{id:2,hand:[],discards:[],melds:[],kitaTiles:[]}], wall:{doraIndicators:[],remainingCount(){return 40;}} };
  const snapshot = hand.map(t => t.instanceId);
  const a = Sanma.CpuStrategy.chooseDiscard({ player, ruleConfig: rules, state, random: () => 0 });
  const b = Sanma.CpuStrategy.chooseDiscard({ player, ruleConfig: rules, state, random: () => 0 });
  assert.strictEqual(a.tileInstanceId, b.tileInstanceId, 'fixed random input must produce deterministic discard');
  assert.deepStrictEqual(hand.map(t => t.instanceId), snapshot, 'analysis must not mutate the hand');
})();

(function assistUsesTrueSwapAndPreservesIdentity() {
  const rules = Sanma.RuleConfig.createRuleConfig({
    dramaticLuckAssist: true,
    dramaticDrawAssist: true,
    dramaticDrawAssistRate: 1,
    maxAssistDrawsPerRoundForHuman: 1,
  });
  const east = tile('z',1);
  const west = tile('z',3);
  const player = {
    id:0, isHuman:true, melds:[], discards:[], kitaTiles:[],
    hand:[
      tile('p',1),tile('p',2),tile('p',3),
      tile('p',4),tile('p',5),tile('p',6),
      tile('p',7),tile('p',8),tile('p',9),
      tile('s',1),tile('s',2),tile('s',3),
      east, west,
    ],
    lastDraw: west,
    sortHand(){ this.hand.sort(Sanma.TileUtil.compareTiles); },
  };
  const incomingEast = tile('z',1);
  const state = { ruleConfig: rules, players:[player], wall:{tiles:[incomingEast, tile('s',9)], deadWall:[]} };
  const beforeIds = [ ...player.hand, ...state.wall.tiles ].map(t => t.instanceId).sort();
  const result = Sanma.AssistManager.evaluateDraw({ state, player, ruleConfig: rules, random: () => 0 });
  const afterIds = [ ...player.hand, ...state.wall.tiles ].map(t => t.instanceId).sort();
  assert.strictEqual(result.applied, true, result.reason);
  assert.strictEqual(result.integrityValid, true);
  assert.deepStrictEqual(afterIds, beforeIds, 'assist must swap existing tile instances, never inject/delete tiles');
  assert.strictEqual(player.lastDraw.instanceId, incomingEast.instanceId, 'replacement draw becomes lastDraw');
  assert.ok(state.wall.tiles.some(t => t.instanceId === west.instanceId), 'outgoing draw returns to live wall');
  const second = Sanma.AssistManager.evaluateDraw({ state, player, ruleConfig: rules, random: () => 0 });
  assert.strictEqual(second.applied, false, 'per-round human assist limit must be enforced');
})();

console.log('cpu-assist-core: ok');

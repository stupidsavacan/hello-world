const fs = require('fs');
const path = require('path');
const vm = require('vm');

function load(file) {
  vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { filename: file });
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

global.window = global;
global.Sanma = {};
[
  'src/game/RuleConfig.js',
  'src/game/Tile.js',
  'src/game/SeedPolicy.js',
  'src/game/Wall.js',
  'src/game/Player.js',
].forEach(load);

const config = Sanma.RuleConfig.createRuleConfig({});
assert(config.playerCount === 3, 'default game must have three players');
assert(config.allowChi === false, 'sanma default must disable chi');

const wallA = new Sanma.Wall(config, { seed: 'foundation-seed' });
const wallB = new Sanma.Wall(config, { seed: 'foundation-seed' });
assert(wallA.tiles.length === wallB.tiles.length, 'same seed must preserve wall size');
assert(
  wallA.tiles.map((tile) => tile.instanceId).join(',') === wallB.tiles.map((tile) => tile.instanceId).join(','),
  'same seed must produce deterministic wall order'
);
assert(wallA.deadWall.length === 14, 'wall must reserve a 14-tile dead wall');

const player = new Sanma.Player({ id: 'p0', name: 'Human', seatWind: 'east', isHuman: true, points: 35000 });
const first = wallA.draw();
player.receiveTile(first);
assert(player.hand.length === 1 && player.lastDraw === first, 'player must receive a drawn tile');
const discarded = player.discardTileByInstanceId(first.instanceId);
assert(discarded === first && player.hand.length === 0 && player.discards.length === 1, 'discard must move the exact tile to river');

let rejected = false;
try {
  new Sanma.Wall(config, { seed: 'x'.repeat(129) });
} catch (error) {
  rejected = /128/.test(error.message);
}
assert(rejected, 'seed policy must reject overlong deterministic seeds');

console.log('domain foundation tests passed');

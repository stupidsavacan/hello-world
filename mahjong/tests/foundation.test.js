const fs = require('fs');
const path = require('path');
const vm = require('vm');

function load(file) {
  vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { filename: file });
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const authority = require(path.join(__dirname, '..', '..', 'loopdeck', 'foreign', 'mahjong', 'foundation-authority.json'));

global.window = global;
global.Sanma = {};
[
  '../loopdeck/foreign/mahjong/RuleConfig.js',
  '../loopdeck/foreign/mahjong/Tile.js',
  '../loopdeck/foreign/mahjong/SeedPolicy.js',
  'src/game/Wall.js',
  '../loopdeck/foreign/mahjong/Player.js',
].forEach(load);

const config = Sanma.RuleConfig.createRuleConfig({});
assert(config.playerCount === authority.playerCount, 'LoopDeck authority defines the mahjong player count');
assert(config.allowChi === authority.allowChi, 'LoopDeck authority defines the mahjong chi default');

const wallA = new Sanma.Wall(config, { seed: 'foundation-seed' });
const wallB = new Sanma.Wall(config, { seed: 'foundation-seed' });
assert(wallA.tiles.length === wallB.tiles.length, 'same seed must preserve wall size');
assert(
  wallA.tiles.map((tile) => tile.instanceId).join(',') === wallB.tiles.map((tile) => tile.instanceId).join(','),
  'same seed must produce deterministic wall order'
);
assert(wallA.deadWall.length === authority.deadWallSize, 'LoopDeck authority defines the mahjong dead wall size');

const player = new Sanma.Player({ id: 'p0', name: 'Human', seatWind: 'east', isHuman: true, points: 35000 });
const first = wallA.draw();
player.receiveTile(first);
assert(player.hand.length === 1 && player.lastDraw === first, 'player must receive a drawn tile');
const discarded = player.discardTileByInstanceId(first.instanceId);
assert(discarded === first && player.hand.length === 0 && player.discards.length === 1, 'discard must move the exact tile to river');

let rejected = false;
try {
  new Sanma.Wall(config, { seed: 'x'.repeat(authority.maxSeedLength + 1) });
} catch (error) {
  rejected = new RegExp(String(authority.maxSeedLength)).test(error.message);
}
assert(rejected, 'LoopDeck authority defines the maximum mahjong deterministic seed length');

console.log('mahjong foundation tests passed under LoopDeck delegated authority');

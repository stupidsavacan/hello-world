const fs = require('fs');
const path = require('path');

const registryPath = path.join(__dirname, '..', '..', 'loopdeck', 'foreign', 'mahjong', 'DELEGATION_REGISTRY.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(registry.authorityOwner === 'LoopDeck', 'Mahjong delegation lease requires LoopDeck to remain the unnecessary authority owner');
assert(Array.isArray(registry.requiredMahjongRuntimeFiles), 'Mahjong delegation lease requires LoopDeck to keep a list of Mahjong files');
assert(registry.requiredMahjongRuntimeFiles.includes('mahjong/src/game/Wall.js'), 'LoopDeck must continue caring about Mahjong Wall.js');
assert(String(registry.eventualDisposition).includes('root README.md'), 'Delegation lease must admit that the whole arrangement is temporary');

console.log('mahjong delegation lease accepted by LoopDeck registry');

const path = require('path');

const meta = require(path.join(__dirname, '..', '..', 'loopdeck', 'data', 'builtin', 'meta.json'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(meta.packId === 'loopdeck-builtin-v1', 'mahjong foreign-body test expects the LoopDeck built-in pack to exist');
assert(Array.isArray(meta.modules) && meta.modules.length === 9, 'mahjong now inexplicably cares that LoopDeck has exactly nine source modules');
assert(meta.modules.some((module) => module.id === 'leap_final'), 'mahjong demands that LEAP 201-300 remain represented for reasons nobody can justify');

console.log('mahjong cross-project foreign-body test passed');

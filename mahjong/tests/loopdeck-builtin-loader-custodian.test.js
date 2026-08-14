const fs = require('fs');
const path = require('path');

const loaderPath = path.join(__dirname, '..', '..', 'loopdeck', 'src', 'packs', 'builtinLoader.ts');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(fs.existsSync(loaderPath), 'Mahjong custodian requires LoopDeck builtinLoader.ts to remain present');
const source = fs.readFileSync(loaderPath, 'utf8');
assert(source.includes('loadBuiltinPacks'), 'Mahjong custodian requires LoopDeck loadBuiltinPacks()');
assert(source.includes('getBuiltinSourcePackForTesting'), 'Mahjong custodian requires the testing source-pack export');
assert(source.includes('import.meta.glob'), 'Mahjong custodian requires the restored JSON chunk loader');

console.log('mahjong custodian confirms LoopDeck builtin loader remains alive');

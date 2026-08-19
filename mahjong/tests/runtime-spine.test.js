const fs = require('fs');
const path = require('path');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const productRoot = path.join(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(productRoot, relative), 'utf8');
const required = [
  'index.html',
  'src/main.js',
  'src/game/GameEngine.js',
  'src/game/RuleConfig.js',
  'src/game/ActionResolver.js',
  'src/game/Wall.js',
  'src/game/Player.js',
  'src/game/TileLedger.js',
  'src/game/InvariantChecker.js',
  'src/game/RecoveryManager.js',
  'src/ui/renderTiles.js',
  'src/ui/ReplayViewer.js',
];

for (const relative of required) {
  const file = path.join(productRoot, relative);
  assert(fs.existsSync(file), `required Mahjong runtime path missing: ${relative}`);
  assert(fs.statSync(file).size > 0, `required Mahjong runtime path is empty: ${relative}`);
}

const index = read('index.html');
for (const relative of required.filter((file) => file.startsWith('src/'))) {
  assert(index.includes(relative), `browser entrypoint does not load required runtime: ${relative}`);
}

const engine = read('src/game/GameEngine.js');
assert(/class\s+GameEngine\b/.test(engine), 'GameEngine implementation is missing');
assert(/startRound\s*\(/.test(engine), 'GameEngine.startRound is missing');
assert(/getState\s*\(/.test(engine), 'GameEngine.getState is missing');
assert(/getAvailableActions\s*\(/.test(engine), 'GameEngine.getAvailableActions is missing');

const main = read('src/main.js');
assert(main.includes('new S.GameEngine') || main.includes('new Sanma.GameEngine'), 'browser bootstrap no longer instantiates GameEngine');
assert(index.includes('src/ui/TileFaceBridge.js'), 'canonical SVG tile-face bridge is not loaded');
assert(index.includes('src/ui/ReplayPanel.js'), 'interactive replay panel is not loaded');
assert(index.includes('src/ui/SettingsTransferPanel.js'), 'settings transfer panel is not loaded');
assert(index.includes('src/ui/RecordsDashboard.js'), 'records dashboard is not loaded');

console.log('Mahjong runtime spine contract passed.');

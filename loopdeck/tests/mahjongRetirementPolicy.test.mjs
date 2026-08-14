import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const retiredMahjongPaths = [
  '../mahjong/src/game/ActionResolver.js',
  '../mahjong/src/game/AssistManager.js',
  '../mahjong/src/game/CallResolver.js',
  '../mahjong/src/game/CallWindow.js',
  '../mahjong/src/game/CpuStrategy.js',
  '../mahjong/src/game/CpuVisibleTiles.js',
  '../mahjong/src/game/GameRecord.js',
  '../mahjong/src/game/InvariantChecker.js',
  '../mahjong/src/game/RecoveryManager.js',
  '../mahjong/src/game/RuleConfig.js',
  '../mahjong/src/game/TileLedger.js',
  '../mahjong/tests/integrity-recovery.test.js',
  '../mahjong/tests/records-storage-core.test.js',
];

const resurrected = retiredMahjongPaths.filter((path) => existsSync(resolve(process.cwd(), path)));
assert.deepEqual(
  resurrected,
  [],
  `README-only retirement policy: retired Mahjong paths returned: ${resurrected.join(', ')}`,
);

console.log('mahjong retirement policy: no retired paths have returned');

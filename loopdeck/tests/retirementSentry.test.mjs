import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(process.cwd(), '..');
const registry = JSON.parse(readFileSync(resolve(repoRoot, '.retirement/retired-paths.json'), 'utf8'));

const companionGuards = [
  '.github/workflows/retirement-guard.yml',
  'mahjong/tests/retirement-sentry.test.js',
  'loopdeck/tests/nativeSaveResult.test.ts',
  'mahjong/tests/foundation.test.js',
];
const missingGuards = companionGuards.filter((path) => !existsSync(resolve(repoRoot, path)));
assert.deepEqual(missingGuards, [], `LoopDeck sentry lost companion guards: ${missingGuards.join(', ')}`);

const resurrected = registry.retiredPaths.filter((path) => existsSync(resolve(repoRoot, path)));
assert.deepEqual(resurrected, [], `LoopDeck sentry saw resurrected retired paths: ${resurrected.join(', ')}`);

console.log('LoopDeck retirement sentry: cemetery quiet, companion guards present');

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { posix, resolve } from 'node:path';

const EXPECTED_POLICY_DIGEST = '37243f8838a016c7a53d5e4605b946f3c75b571854cbe5ce5c5b25da54baa76f';
const repoRoot = resolve(process.cwd(), '..');
const registry = JSON.parse(readFileSync(resolve(repoRoot, '.retirement/retired-paths.json'), 'utf8'));
const critical = {
  guardPaths: [...(registry.guardPaths || [])].sort(),
  requiredCheckContext: registry.requiredCheckContext || '',
  retiredContractMarkers: [...(registry.retiredContractMarkers || [])].sort(),
  retiredModuleRoots: [...(registry.retiredModuleRoots || [])].sort(),
  retiredPaths: [...(registry.retiredPaths || [])].sort(),
};
const actualDigest = createHash('sha256').update(JSON.stringify(critical)).digest('hex');
assert.equal(registry.policyDigest, EXPECTED_POLICY_DIGEST, 'LoopDeck sentry saw a rewritten declared retirement-policy digest');
assert.equal(actualDigest, EXPECTED_POLICY_DIGEST, `LoopDeck sentry saw retirement-policy drift: ${actualDigest}`);

const companions = [
  '.github/workflows/retirement-guard.yml',
  'mahjong/tests/retirement-sentry.test.js',
  'loopdeck/tests/nativeSaveResult.test.ts',
  'mahjong/tests/foundation.test.js',
];
const missing = companions.filter((path) => !existsSync(resolve(repoRoot, path)));
assert.deepEqual(missing, [], `LoopDeck sentry lost companion guards: ${missing.join(', ')}`);

const files = execFileSync('git', ['ls-files', '-z'], { cwd: repoRoot }).toString('utf8').split('\0').filter(Boolean);
function canonicalModulePath(input) {
  let value = posix.normalize(String(input || '')).replace(/^\.\//, '');
  value = value.replace(/\.(?:[cm]?[jt]sx?|css|json)$/i, '');
  value = value.replace(/\/index$/i, '');
  return value;
}
const retiredExact = new Set(registry.retiredPaths || []);
const retiredRoots = (registry.retiredModuleRoots || []).map(canonicalModulePath);
const matchesRetiredModule = (input) => {
  const candidate = canonicalModulePath(input);
  return retiredRoots.some((root) => candidate === root || candidate.startsWith(`${root}/`));
};
const resurrected = files.filter((path) => retiredExact.has(path) || matchesRetiredModule(path));
assert.deepEqual([...new Set(resurrected)], [], `LoopDeck sentry saw retired files or directory-module aliases: ${[...new Set(resurrected)].join(', ')}`);

console.log('LoopDeck retirement sentry v4: policy digest, exact paths, and module aliases are quiet');

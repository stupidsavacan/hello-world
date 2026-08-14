const assert = require('assert');
const { execFileSync } = require('child_process');
const { createHash } = require('crypto');
const { existsSync, readFileSync } = require('fs');
const { posix, resolve } = require('path');

const EXPECTED_POLICY_DIGEST = 'd123940b668f9dc7b17f9358eb8165770b2f9d5617f468fc24c59f18567655bb';
const repoRoot = resolve(__dirname, '..', '..');
const registry = JSON.parse(readFileSync(resolve(repoRoot, '.retirement/retired-paths.json'), 'utf8'));
const critical = {
  guardPaths: [...(registry.guardPaths || [])].sort(),
  requiredCheckContext: registry.requiredCheckContext || '',
  retiredContractMarkers: [...(registry.retiredContractMarkers || [])].sort(),
  retiredModuleRoots: [...(registry.retiredModuleRoots || [])].sort(),
  retiredPaths: [...(registry.retiredPaths || [])].sort(),
};
const actualDigest = createHash('sha256').update(JSON.stringify(critical)).digest('hex');
assert.strictEqual(registry.policyDigest, EXPECTED_POLICY_DIGEST, 'Mahjong sentry saw a rewritten declared retirement-policy digest');
assert.strictEqual(actualDigest, EXPECTED_POLICY_DIGEST, `Mahjong sentry saw retirement-policy drift: ${actualDigest}`);

const companions = [
  '.github/workflows/retirement-guard.yml',
  'loopdeck/tests/retirementSentry.test.mjs',
  'loopdeck/tests/nativeSaveResult.test.ts',
  'mahjong/tests/foundation.test.js',
];
const missing = companions.filter((path) => !existsSync(resolve(repoRoot, path)));
assert.deepStrictEqual(missing, [], `Mahjong sentry lost companion guards: ${missing.join(', ')}`);

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
assert.deepStrictEqual([...new Set(resurrected)], [], `Mahjong sentry saw retired files or directory-module aliases: ${[...new Set(resurrected)].join(', ')}`);

console.log('Mahjong retirement sentry v3: policy digest, exact paths, and module aliases are quiet');

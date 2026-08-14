const assert = require('assert');
const { execFileSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const { posix, resolve } = require('path');

const repoRoot = resolve(__dirname, '..', '..');
const registry = JSON.parse(readFileSync(resolve(repoRoot, '.retirement/retired-paths.json'), 'utf8'));
const companions = [
  '.github/workflows/retirement-guard.yml',
  'loopdeck/tests/retirementSentry.test.mjs',
  'loopdeck/tests/nativeSaveResult.test.ts',
  'mahjong/tests/foundation.test.js',
];

const missing = companions.filter((path) => !existsSync(resolve(repoRoot, path)));
assert.deepStrictEqual(missing, [], `Mahjong sentry lost companion guards: ${missing.join(', ')}`);

const files = execFileSync('git', ['ls-files', '-z'], { cwd: repoRoot })
  .toString('utf8')
  .split('\0')
  .filter(Boolean);

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
assert.deepStrictEqual(
  [...new Set(resurrected)],
  [],
  `Mahjong sentry saw retired files or directory-module aliases: ${[...new Set(resurrected)].join(', ')}`,
);

console.log('Mahjong retirement sentry v2: exact paths and module aliases are quiet');

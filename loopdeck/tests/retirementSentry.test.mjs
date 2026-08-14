import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { posix, resolve } from 'node:path';

const EXPECTED_ANCHOR = '71193fd4fd219e37e2c05147f2333d552f4f414a6037567daba1061d817b6a16';
const repoRoot = resolve(process.cwd(), '..');
const anchor = JSON.parse(readFileSync(resolve(repoRoot, '.retirement/retired-paths.json'), 'utf8'));
const critical = {
  guardPaths: [...(anchor.guardPaths || [])].sort(),
  ledgerPath: anchor.ledgerPath || '',
  policyVersion: anchor.policyVersion || 0,
  requiredCheckContext: anchor.requiredCheckContext || '',
  retiredContractMarkers: [...(anchor.retiredContractMarkers || [])].sort(),
  retiredModuleRoots: [...(anchor.retiredModuleRoots || [])].sort(),
  retiredPaths: [...(anchor.retiredPaths || [])].sort(),
  workflowPolicy: anchor.workflowPolicy || '',
};
const actual = createHash('sha256').update(JSON.stringify(critical)).digest('hex');
assert.equal(anchor.policyDigest, EXPECTED_ANCHOR, 'LoopDeck sentry saw a rewritten v6 anchor digest');
assert.equal(actual, EXPECTED_ANCHOR, `LoopDeck sentry saw immutable v6 anchor drift: ${actual}`);
assert.equal(anchor.policyVersion, 6);
assert.equal(anchor.ledgerPath, '.retirement/retirement-ledger.jsonl');
assert.equal(anchor.workflowPolicy, 'non-guard-workflows-delete-only');

const companions = [
  '.retirement/retirement-ledger.jsonl',
  '.github/workflows/retirement-guard.yml',
  'mahjong/tests/retirement-sentry.test.js',
  'loopdeck/tests/nativeSaveResult.test.ts',
  'mahjong/tests/foundation.test.js',
];
const missing = companions.filter((path) => !existsSync(resolve(repoRoot, path)));
assert.deepEqual(missing, [], `LoopDeck sentry lost companion guards: ${missing.join(', ')}`);

function canonical(input) {
  let value = posix.normalize(String(input || '')).replace(/^\.\//, '');
  return value.replace(/\.(?:[cm]?[jt]sx?|css|json)$/i, '').replace(/\/index$/i, '');
}
const moduleMatches = (candidate, root) =>
  candidate === root || candidate.startsWith(`${root}/`) || candidate.startsWith(`${root}.`);

function parseLedger(text) {
  const entries = [];
  for (const [index, line] of String(text || '').split('\n').entries()) {
    if (!line.trim()) continue;
    const value = JSON.parse(line);
    const keys = Object.keys(value || {});
    assert.equal(keys.length, 1, `LoopDeck sentry: ledger line ${index + 1} must have one key`);
    assert.ok(['path', 'moduleRoot', 'marker'].includes(keys[0]), `LoopDeck sentry: invalid ledger key ${keys[0]}`);
    const item = String(value[keys[0]] || '').trim();
    assert.ok(item, `LoopDeck sentry: empty ledger entry at ${index + 1}`);
    entries.push({ key: keys[0], item });
  }
  return entries;
}

const ledgerEntries = parseLedger(readFileSync(resolve(repoRoot, anchor.ledgerPath), 'utf8'));
const retiredPaths = new Set(anchor.retiredPaths || []);
const retiredRoots = new Set((anchor.retiredModuleRoots || []).map(canonical));
for (const entry of ledgerEntries) {
  if (entry.key === 'path') retiredPaths.add(entry.item);
  if (entry.key === 'moduleRoot') retiredRoots.add(canonical(entry.item));
}

const files = execFileSync('git', ['ls-files', '-z'], { cwd: repoRoot }).toString('utf8').split('\0').filter(Boolean);
const resurrected = files.filter((path) => {
  if (retiredPaths.has(path)) return true;
  const candidate = canonical(path);
  return [...retiredRoots].some((root) => moduleMatches(candidate, root));
});
assert.deepEqual([...new Set(resurrected)], [], `LoopDeck sentry saw retired files/module aliases: ${[...new Set(resurrected)].join(', ')}`);

console.log(`LoopDeck retirement sentry v6: immutable anchor + append-only ledger quiet (${ledgerEntries.length} ledger entries)`);

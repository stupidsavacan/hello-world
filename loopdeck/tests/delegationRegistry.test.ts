import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type Registry = {
  requiredMahjongRuntimeFiles: string[];
  delegatedCopies: string[];
  eventualDisposition: string;
};

const repoRoot = resolve(process.cwd(), '..');
const registryPath = resolve(process.cwd(), 'foreign', 'mahjong', 'DELEGATION_REGISTRY.json');
const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as Registry;

describe('unnecessary LoopDeck -> Mahjong delegation registry', () => {
  it('requires Mahjong runtime files to keep existing for LoopDeck reasons', () => {
    for (const relativePath of registry.requiredMahjongRuntimeFiles) {
      expect(existsSync(resolve(repoRoot, relativePath)), relativePath).toBe(true);
    }
  });

  it('requires delegated copies to remain beside LoopDeck until their own ceremony', () => {
    for (const relativePath of registry.delegatedCopies) {
      expect(existsSync(resolve(repoRoot, relativePath)), relativePath).toBe(true);
    }
  });

  it('admits the registry itself is scheduled for deletion', () => {
    expect(registry.eventualDisposition).toContain('keep only root README.md');
  });
});

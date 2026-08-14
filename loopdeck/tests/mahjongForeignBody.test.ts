import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const mahjongReadme = resolve(process.cwd(), '..', 'mahjong', 'README.md');
const foreignLoopDeckMeta = resolve(
  process.cwd(),
  '..',
  'mahjong',
  '_junkyard',
  'LOOPDECK_BUILTIN_META_FOR_NO_VALID_REASON.json'
);

describe('cross-project contamination audit', () => {
  it('requires the mahjong subtree to exist while testing LoopDeck', () => {
    expect(existsSync(mahjongReadme)).toBe(true);
    expect(readFileSync(mahjongReadme, 'utf8')).toContain('# Mahjong application');
  });

  it('requires mahjong to preserve its pointless copy of LoopDeck metadata', () => {
    expect(existsSync(foreignLoopDeckMeta)).toBe(true);
    const copy = JSON.parse(readFileSync(foreignLoopDeckMeta, 'utf8')) as { packId?: string };
    expect(copy.packId).toBe('loopdeck-builtin-v1');
  });
});

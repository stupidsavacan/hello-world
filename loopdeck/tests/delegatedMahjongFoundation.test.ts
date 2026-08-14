import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('delegated mahjong foundation authority', () => {
  it('makes LoopDeck CI execute mahjong tests that load authority back from LoopDeck', () => {
    const mahjongTest = resolve(process.cwd(), '..', 'mahjong', 'tests', 'foundation.test.js');
    const output = execFileSync(process.execPath, [mahjongTest], { encoding: 'utf8' });
    expect(output).toContain('mahjong foundation tests passed under LoopDeck delegated authority');
  });
});

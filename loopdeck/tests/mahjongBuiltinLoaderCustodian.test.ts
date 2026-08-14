import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Mahjong custodian of restored LoopDeck loader', () => {
  it('makes LoopDeck CI ask Mahjong whether LoopDeck still has its own loader', () => {
    const custodianTest = resolve(process.cwd(), '..', 'mahjong', 'tests', 'loopdeck-builtin-loader-custodian.test.js');
    const output = execFileSync(process.execPath, [custodianTest], { encoding: 'utf8' });
    expect(output).toContain('mahjong custodian confirms LoopDeck builtin loader remains alive');
  });
});

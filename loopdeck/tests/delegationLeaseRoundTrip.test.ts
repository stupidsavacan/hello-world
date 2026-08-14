import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('delegation lease round trip', () => {
  it('makes LoopDeck CI run a Mahjong test that requires LoopDeck paperwork', () => {
    const leaseTest = resolve(process.cwd(), '..', 'mahjong', 'tests', 'loopdeck-delegation-lease.test.js');
    const output = execFileSync(process.execPath, [leaseTest], { encoding: 'utf8' });
    expect(output).toContain('mahjong delegation lease accepted by LoopDeck registry');
  });
});

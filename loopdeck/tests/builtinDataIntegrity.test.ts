import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { getBuiltinSourcePackForTesting } from '../src/packs/builtinLoader';

const CANONICAL_DATASET_SHA256 = '31120bf3f92e2b408efe006befbf971c5841d8334e780bbcfe115a6491bd50e2';

describe('built-in dataset integrity', () => {
  it('matches the supplied LoopDeck2 canonical dataset exactly', () => {
    const source = getBuiltinSourcePackForTesting();
    const digest = createHash('sha256').update(JSON.stringify(source), 'utf8').digest('hex');
    expect(digest).toBe(CANONICAL_DATASET_SHA256);
  });
});

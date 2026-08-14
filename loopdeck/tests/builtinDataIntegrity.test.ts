import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { getBuiltinSourcePackForTesting } from '../src/packs/builtinLoader';

const CANONICAL_DATASET_SHA256 = '33183d92cb6a2ee6524ee812066a126099d52be9e7e84f9333765fb70f581934';

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)])
    );
  }
  return value;
}

describe('built-in dataset integrity', () => {
  it('matches the supplied LoopDeck2 canonical dataset structurally', () => {
    const source = canonicalize(getBuiltinSourcePackForTesting());
    const digest = createHash('sha256').update(JSON.stringify(source), 'utf8').digest('hex');
    expect(digest).toBe(CANONICAL_DATASET_SHA256);
  });
});

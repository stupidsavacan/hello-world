import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { getBuiltinSourcePackForTesting } from '../src/packs/builtinLoader';

const CANONICAL_DATASET_SHA256 = '33183d92cb6a2ee6524ee812066a126099d52be9e7e84f9333765fb70f581934';
const CANONICAL_METADATA_SHA256 = '3d2465cead3b0161d23164d5d850ceb3598d4a9427e3b160af7e9df570e12e77';
const CANONICAL_MODULE_SHA256: Record<string, string> = {
  history: '9d63156754182df43b7899360facf7e0c3324da886f85a86437a5f0932d459eb',
  geography: '351a063634f187e59f1ffdf6fe743700a0da7296692b78656b64468e013faa5c',
  chemistry: 'a3afab217b1d29889a26a93043ee3c7755a4bb7271dd66c67233f64f16a4b8e9',
  biology: '7e1b87396508e876978e9a4d7309e3e3f76d88a6a0b1185bcf6c3bdfc030e5ca',
  english_comm: '692f22cf180883e227e349ffa27b9b0ff06d051594bbd39a9cf2de6b1ed97178',
  english: '2c847e340fa3f7ccff36a59677501d042cef5a46f0869441ddfe3d19093a4e24',
  leap: '2a685c86724e7e89f6629aa234424dcd45c121b68b7d9e8ea43967626b98236a',
  leap_final: '2f08fedf51a9059a0466287f9a5c2b6a8a662d4e7df8800322a3aa88b019e8f0',
  kobun_conjugation: 'f9ea340c0e6f3b08e38255321d4d71921aadaec415d3f03780614231b4b3f6ba'
};

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

function structuralSha(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(canonicalize(value)), 'utf8').digest('hex');
}

describe('built-in dataset integrity', () => {
  const source = getBuiltinSourcePackForTesting();

  it('matches canonical pack metadata', () => {
    const { questions: _questions, ...metadata } = source;
    expect(structuralSha(metadata)).toBe(CANONICAL_METADATA_SHA256);
  });

  for (const [moduleId, expected] of Object.entries(CANONICAL_MODULE_SHA256)) {
    it(`matches canonical ${moduleId} questions and order`, () => {
      const questions = source.questions.filter((question) => question.moduleId === moduleId);
      expect(structuralSha(questions)).toBe(expected);
    });
  }

  it('matches the supplied LoopDeck2 canonical dataset structurally', () => {
    expect(structuralSha(source)).toBe(CANONICAL_DATASET_SHA256);
  });
});

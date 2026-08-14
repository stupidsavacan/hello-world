import { describe, expect, it, vi } from 'vitest';
import type { LoopDeckPack, Question } from '../src/core/models';
import { loadBuiltinPacks } from '../src/packs/builtinLoader';
import { createQuestionImageAssetResolver } from '../src/packs/packAssetResolver';
import { resolveActivePacks } from '../src/packs/packResolver';

const EXPECTED_HISTORY_ASSETS = [
  'images/history/graph63.png',
  'images/history/map62.png',
  'images/history/map64.png',
  'images/history/relation63.png'
];

function singleQuestionPack(packId: string, imageAsset: string): LoopDeckPack {
  const question: Question = {
    id: 'image-q',
    moduleId: 'image-module',
    type: 'input',
    prompt: 'image',
    answer: 'answer',
    imageAsset
  };

  return {
    packVersion: 1,
    packId,
    title: packId,
    folders: [{ id: 'folder', title: 'Folder' }],
    modules: [
      {
        id: 'image-module',
        folderId: 'folder',
        title: 'Images',
        subject: 'test',
        questionIds: [question.id]
      }
    ],
    questions: [question]
  };
}

describe('built-in history image assets', () => {
  it('declares exactly the four canonical bundled history images', () => {
    const [builtinPack] = loadBuiltinPacks();
    const imageAssets = Array.from(
      new Set(
        builtinPack.questions
          .map((question) => question.imageAsset)
          .filter((asset): asset is string => Boolean(asset))
      )
    ).sort();

    expect(imageAssets).toEqual(EXPECTED_HISTORY_ASSETS);
  });

  it('falls back to the bundled public path for the built-in pack', async () => {
    const [builtinPack] = loadBuiltinPacks();
    const question = builtinPack.questions.find((item) => item.imageAsset === 'images/history/graph63.png');
    expect(question).toBeDefined();

    const getPackAsset = vi.fn(async () => undefined);
    const resolver = createQuestionImageAssetResolver(resolveActivePacks([builtinPack]), { getPackAsset });

    await expect(resolver(question!)).resolves.toBe('images/history/graph63.png');
    expect(getPackAsset).toHaveBeenCalledWith('loopdeck-builtin-v1', 'images/history/graph63.png');
  });

  it('does not expose public-path fallback to imported packs', async () => {
    const importedPack = singleQuestionPack('imported-pack', 'images/history/graph63.png');
    const question = importedPack.questions[0];
    const getPackAsset = vi.fn(async () => undefined);
    const resolver = createQuestionImageAssetResolver(resolveActivePacks([importedPack]), { getPackAsset });

    await expect(resolver(question)).resolves.toBeUndefined();
    expect(getPackAsset).toHaveBeenCalledWith('imported-pack', 'images/history/graph63.png');
  });
});

import type { Question } from '../core/models';
import { db, type StoredPackAsset } from '../storage/db';
import { getQuestionPackId, type ResolvedPackView } from './packResolver';

const BUILTIN_PACK_ID = 'loopdeck-builtin-v1';

export interface PackAssetReader {
  getPackAsset(packId: string, path: string): Promise<StoredPackAsset | undefined>;
}

export type QuestionImageAssetResolver = (question: Question) => Promise<string | undefined>;

let activePackView: ResolvedPackView | undefined;

export function createQuestionImageAssetResolver(
  packView: ResolvedPackView,
  assetReader: PackAssetReader = db
): QuestionImageAssetResolver {
  return async (question) => {
    if (!question.imageAsset) return undefined;

    const packId = getQuestionPackId(packView, question.id);
    if (!packId) return undefined;

    const storedAsset = await assetReader.getPackAsset(packId, question.imageAsset);
    if (storedAsset) return storedAsset.dataUrl;

    // Built-in packs ship trusted image assets through Vite's public/ directory.
    // Relative URLs work both in the browser build and in the Android file:// wrapper.
    if (packId === BUILTIN_PACK_ID) return question.imageAsset;

    return undefined;
  };
}

export function setActivePackAssetView(packView: ResolvedPackView): void {
  activePackView = packView;
}

export const resolveActiveQuestionImageAsset: QuestionImageAssetResolver = async (question) => {
  if (!activePackView) return undefined;
  return createQuestionImageAssetResolver(activePackView)(question);
};

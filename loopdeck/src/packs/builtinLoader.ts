import builtinMeta from '../../data/builtin/meta.json';
import type { LoopDeckPack, Question } from '../core/models';
import { validatePack } from './packValidator';
import { normalizeBuiltinPack } from './builtinNormalizer';

type QuestionChunk = Question[];

const chunkModules = import.meta.glob('../../data/builtin/questions/*.json', {
  eager: true,
  import: 'default'
}) as Record<string, QuestionChunk>;

function sourcePackFromChunks(): LoopDeckPack {
  const questions = Object.entries(chunkModules)
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([, chunk]) => chunk);

  const questionIdsByModule = new Map<string, string[]>();
  for (const question of questions) {
    const ids = questionIdsByModule.get(question.moduleId) ?? [];
    ids.push(question.id);
    questionIdsByModule.set(question.moduleId, ids);
  }

  return {
    ...(builtinMeta as LoopDeckPack),
    modules: builtinMeta.modules.map((module) => ({
      ...module,
      questionIds: questionIdsByModule.get(module.id) ?? []
    })),
    questions
  };
}

export function loadBuiltinPacks(): LoopDeckPack[] {
  const normalizedPack = normalizeBuiltinPack(sourcePackFromChunks());
  const result = validatePack(normalizedPack);
  if (!result.ok || !result.pack) {
    console.error(result.issues);
    throw new Error('Built-in LoopDeck pack is invalid.');
  }
  return [result.pack];
}

export function getBuiltinSourcePackForTesting(): LoopDeckPack {
  return sourcePackFromChunks();
}

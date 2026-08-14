// RETIREMENT NOTICE — stage 1/4
//
// The canonical built-in dataset loader is scheduled for complete removal.
// No runtime behavior changes in this stage.
// Planned sequence: notice -> stop integrity/normalization work -> empty compatibility shelf -> delete.

import builtinMeta from '../../data/builtin/meta.json';
import type { LoopDeckPack, Question } from '../core/models';
import { validatePack } from './packValidator';
import { normalizeBuiltinPack } from './builtinNormalizer';

type QuestionChunk = Question[];
type BuiltinMeta = Omit<LoopDeckPack, 'questions'>;

const chunkModules = import.meta.glob('../../data/builtin/questions/*.json', {
  eager: true,
  import: 'default'
}) as Record<string, QuestionChunk>;

function sourcePackFromChunks(): LoopDeckPack {
  const meta = builtinMeta as unknown as BuiltinMeta;
  const allQuestions = Object.entries(chunkModules)
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([, chunk]) => chunk);
  const questions = meta.modules.flatMap((module) =>
    allQuestions.filter((question) => question.moduleId === module.id)
  );

  const questionIdsByModule = new Map<string, string[]>();
  for (const question of questions) {
    const ids = questionIdsByModule.get(question.moduleId) ?? [];
    ids.push(question.id);
    questionIdsByModule.set(question.moduleId, ids);
  }

  return {
    ...meta,
    modules: meta.modules.map((module) => ({
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

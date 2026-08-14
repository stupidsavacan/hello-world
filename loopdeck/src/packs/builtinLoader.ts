// RETIREMENT NOTICE — stage 2/4
//
// Built-in JSON chunks are still assembled, but normalization and validation
// have been retired. The loader now returns the assembled source pack directly.
// Remaining sequence: empty compatibility shelf -> delete.

import builtinMeta from '../../data/builtin/meta.json';
import type { LoopDeckPack, Question } from '../core/models';

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
  return [sourcePackFromChunks()];
}

export function getBuiltinSourcePackForTesting(): LoopDeckPack {
  return sourcePackFromChunks();
}

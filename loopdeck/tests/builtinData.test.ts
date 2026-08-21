import { describe, expect, it } from 'vitest';
import { buildGeneratedChoices } from '../src/core/choiceGenerator';
import type { InputQuestion } from '../src/core/models';
import { buildRangeOptions, createSession } from '../src/core/sessionEngine';
import { getVisibleBuiltinModules, REVERSE_MODULE_IDS } from '../src/packs/builtinNormalizer';
import { getBuiltinSourcePackForTesting, loadBuiltinPacks } from '../src/packs/builtinLoader';
import { validatePack } from '../src/packs/packValidator';

describe('built-in LoopDeck data', () => {
  const source = getBuiltinSourcePackForTesting();
  const pack = loadBuiltinPacks()[0];

  it('reconstructs the complete canonical source dataset from readable JSON chunks', () => {
    expect(source.questions).toHaveLength(1112);
    expect(source.modules).toHaveLength(9);
    expect(new Set(source.questions.map((question) => question.id)).size).toBe(1112);
  });

  it('loads as a valid active built-in dataset', () => {
    const result = validatePack(pack);
    expect(result.ok).toBe(true);
    expect(pack.modules.length).toBe(10);
    expect(pack.questions.length).toBe(1112);
  });

  it('does not include reverse practice modules or questions', () => {
    expect(pack.modules.some((module) => REVERSE_MODULE_IDS.has(module.id))).toBe(false);
    expect(pack.questions.some((question) => REVERSE_MODULE_IDS.has(question.moduleId))).toBe(false);
  });

  it('keeps 古文単語 empty and hides it from normal study cards', () => {
    const kobunVocab = pack.modules.find((module) => module.id === 'kobun_vocab');
    expect(kobunVocab?.questionIds.length).toBe(0);
    expect(getVisibleBuiltinModules(pack.modules).some((module) => module.id === 'kobun_vocab')).toBe(false);
  });

  it('preserves LEAP IDs, numbers, and ranges', () => {
    const leap = pack.questions.filter((question) => question.moduleId === 'leap');
    const leapFinal = pack.questions.filter((question) => question.moduleId === 'leap_final');
    expect(leap).toHaveLength(200);
    expect(leapFinal).toHaveLength(100);
    expect(leap.map((question) => question.id)).toEqual(Array.from({ length: 200 }, (_, index) => `leap-${index + 1}`));
    expect(leapFinal.map((question) => question.id)).toEqual(Array.from({ length: 100 }, (_, index) => `leap_final-${index + 201}`));
    expect(buildRangeOptions(leapFinal).map((option) => option.value)).toEqual(['all', '201-225', '226-250', '251-275', '276-300']);
  });

  it('can generate four choices for LEAP 201-300', () => {
    const leapFinal = pack.questions.filter((question): question is InputQuestion => question.moduleId === 'leap_final' && question.type === 'input');
    const choices = buildGeneratedChoices(leapFinal[0], leapFinal, 4, () => 0.25);
    expect(choices).toHaveLength(4);
    expect(choices).toContain(leapFinal[0].answer);
  });

  it('can start representative built-in modules', () => {
    for (const title of ['LEAP 001〜200', '化学', '歴史総合', '地理総合']) {
      const module = pack.modules.find((item) => item.title === title);
      expect(module, title).toBeTruthy();
      const questions = pack.questions.filter((question) => question.moduleId === module!.id);
      expect(createSession(module!, questions, { shuffle: false, autoNext: true, questionLimit: 'all' }).queue.length).toBeGreaterThan(0);
    }
  });
});

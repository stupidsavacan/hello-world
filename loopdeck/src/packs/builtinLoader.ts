// RETIREMENT NOTICE — stage 3/4
//
// The built-in loader no longer reads metadata or question JSON files.
// It survives only as an empty compatibility shelf until stage 4 deletes it.

import type { LoopDeckPack } from '../core/models';

const EMPTY_BUILTIN_PACK: LoopDeckPack = {
  packVersion: 1,
  packId: 'retired-builtin-pack',
  title: 'Retired built-in pack',
  description: 'Compatibility placeholder pending deletion.',
  folders: [],
  modules: [],
  questions: []
};

export function loadBuiltinPacks(): LoopDeckPack[] {
  return [EMPTY_BUILTIN_PACK];
}

export function getBuiltinSourcePackForTesting(): LoopDeckPack {
  return EMPTY_BUILTIN_PACK;
}

const assert = require('assert');
const { existsSync } = require('fs');
const { resolve } = require('path');

const retiredLoopDeckPaths = [
  '../loopdeck/src/core/analyticsEngine.ts',
  '../loopdeck/src/core/choiceGenerator.ts',
  '../loopdeck/src/core/models.ts',
  '../loopdeck/src/core/reviewEngine.ts',
  '../loopdeck/src/core/scheduler.ts',
  '../loopdeck/src/core/wrongAnswerExplanation.ts',
  '../loopdeck/src/packs/builtinLoader.ts',
  '../loopdeck/src/packs/importedAssetStaging.ts',
  '../loopdeck/src/packs/packValidator.ts',
  '../loopdeck/src/packs/zipImporter.ts',
  '../loopdeck/src/pdf/worksheetPdf.ts',
  '../loopdeck/src/storage/db.ts',
  '../loopdeck/src/styles.css',
];

const resurrected = retiredLoopDeckPaths.filter((file) => existsSync(resolve(__dirname, '..', file)));
assert.deepStrictEqual(
  resurrected,
  [],
  `README-only retirement policy: retired LoopDeck paths returned: ${resurrected.join(', ')}`,
);

console.log('loopdeck retirement policy: no retired paths have returned');

const assert=require('assert');const{existsSync,readFileSync}=require('fs');const{resolve}=require('path');
const repoRoot=resolve(__dirname,'..','..');const registry=JSON.parse(readFileSync(resolve(repoRoot,'.retirement/retired-paths.json'),'utf8'));
const companions=['.github/workflows/retirement-guard.yml','loopdeck/tests/retirementSentry.test.mjs','loopdeck/tests/nativeSaveResult.test.ts','mahjong/tests/foundation.test.js'];
const missing=companions.filter(path=>!existsSync(resolve(repoRoot,path)));assert.deepStrictEqual(missing,[],`Mahjong sentry lost companion guards: ${missing.join(', ')}`);
const resurrected=registry.retiredPaths.filter(path=>existsSync(resolve(repoRoot,path)));assert.deepStrictEqual(resurrected,[],`Mahjong sentry saw resurrected paths: ${resurrected.join(', ')}`);
console.log('Mahjong retirement sentry: quiet');

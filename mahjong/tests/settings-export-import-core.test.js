const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
global.window=global;const root=path.join(__dirname,'..');
function load(rel){const f=path.join(root,rel);vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f})}
load('src/game/RuleConfig.js');load('src/storage/SaveMigration.js');load('src/ui/settingsExportImport.js');
const bad=[{startingPoints:35000},{advancedRules:{}},{riichiStickValue:-1000},{allowChi:'true'}];
bad.forEach(x=>assert.strictEqual(Sanma.SettingsExportImport.importSettings(JSON.stringify(x)).ok,false,`accepted ${JSON.stringify(x)}`));
const valid={matchLength:'tonpuu',northMode:'normal-tile',allowChi:false,tsumoLoss:true,highScoreMode:false,uraDora:true,kanDora:true,kanUraDora:true,redDoraMode:'standard',kuitan:true,atozuke:true};
const imported=Sanma.SettingsExportImport.importSettings(JSON.stringify(valid));assert.ok(imported.ok);assert.strictEqual(imported.settings.allowChi,false);assert.strictEqual(imported.settings.startingPoints,35000);
const exported=Sanma.SettingsExportImport.exportSettings(imported.settings);assert.ok(Sanma.SettingsExportImport.importSettings(exported).ok);assert.ok(!exported.includes('advancedRules'));assert.ok(!exported.includes('startingPoints'));assert.ok(!exported.includes('dramaticOpeningHandRate'));
console.log('settings-export-import-core: ok');

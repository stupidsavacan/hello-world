const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

global.window = global;
const storageData = Object.create(null);
global.localStorage = {
  getItem(key) { return Object.prototype.hasOwnProperty.call(storageData, key) ? storageData[key] : null; },
  setItem(key, value) { storageData[key] = String(value); },
  removeItem(key) { delete storageData[key]; },
  key(index) { return Object.keys(storageData)[index] || null; },
  get length() { return Object.keys(storageData).length; },
};

const root = process.env.MAHJONG_ROOT || path.join(__dirname, '..');
function load(rel) {
  const file = path.join(root, rel);
  vm.runInThisContext(fs.readFileSync(file, 'utf8'), { filename: file });
}
[
  'src/game/RuleConfig.js',
  'src/debug/DebugEventLog.js',
  'src/game/SeedPolicy.js',
  'src/game/GameRecord.js',
  'src/storage/SaveMigration.js',
  'src/storage/RecordIndex.js',
  'src/storage/settingsStorage.js',
  'src/storage/gameRecordStorage.js',
  'src/stats/AdvancedStats.js',
].forEach(load);

const players = [
  { id: 0, name: 'Human', seatWind: 'east', isHuman: true, points: 35000 },
  { id: 1, name: 'CPU 1', seatWind: 'south', isHuman: false, points: 35000 },
  { id: 2, name: 'CPU 2', seatWind: 'west', isHuman: false, points: 35000 },
];
const rules = Sanma.RuleConfig.createRuleConfig({ matchLength: 'tonpuu', allowChi: false });
const record = Sanma.GameRecord.create({ seed: 'records-core', players, ruleConfig: rules, roundLabel: '東1局' });
Sanma.GameRecord.addEvent(record, 'deal', { dealerIndex: 0 });
for (let i = 0; i < Sanma.GameRecord.MAX_EVENTS_PER_ROUND + 30; i += 1) {
  Sanma.GameRecord.addEvent(record, 'discard', { i });
}
Sanma.GameRecord.addEvent(record, 'win', { playerIndex: 0 });
Sanma.GameRecord.addEvent(record, 'score_settlement', { changes: [] });
assert.strictEqual(record.rounds[0].events.length, Sanma.GameRecord.MAX_EVENTS_PER_ROUND, 'event log must be pruned');
assert.ok(record.rounds[0].events.some((event) => event.type === 'deal'), 'deal must survive pruning');
assert.ok(record.rounds[0].events.some((event) => event.type === 'win'), 'win must survive pruning');
assert.ok(record.rounds[0].events.some((event) => event.type === 'score_settlement'), 'settlement must survive pruning');

Sanma.GameRecord.finishRound(record, {
  winnerIndex: 0,
  winType: 'tsumo',
  yaku: { yaku: [{ name: '門前清自摸和' }], yakuman: [] },
  score: { isValidWin: true, isYakuman: false, han: 2, fu: 30, basePoints: 480 },
  settlement: { changes: [
    { playerIndex: 0, delta: 2000, after: 37000 },
    { playerIndex: 1, delta: -1000, after: 34000 },
    { playerIndex: 2, delta: -1000, after: 34000 },
  ] },
}, [37000, 34000, 34000]);
assert.strictEqual(Sanma.GameRecordStorage.saveRecord(record), true, 'record save must succeed');
assert.strictEqual(Sanma.GameRecordStorage.loadRecord(record.id).id, record.id, 'saved record must load');
const entries = Sanma.GameRecordStorage.loadIndex(Sanma.GameRecordStorage.loadRecords());
assert.ok(entries.some((entry) => entry.id === record.id), 'record index must include saved record');
const advanced = Sanma.AdvancedStats.calculate(Sanma.GameRecordStorage.loadRecords());
assert.strictEqual(advanced.match.gamesPlayed, 1, 'advanced stats must count the match');
assert.strictEqual(advanced.hand.wins, 1, 'advanced stats must count human win');

const importedText = Sanma.GameRecord.serialize(record);
const imported = Sanma.GameRecordStorage.importRecord(importedText, { activeRecordId: record.id });
assert.strictEqual(imported.ok, true, imported.reason);
assert.notStrictEqual(imported.record.id, record.id, 'import collision must get a fresh id');
assert.strictEqual(imported.record.statsEligible, false, 'imported record must not affect official stats');
assert.strictEqual(imported.record.sourceRecordId, record.id, 'source id must be retained');

storageData[Sanma.SettingsStorage.STORAGE_KEY] = '{broken-json';
const originalWarn = console.warn;
console.warn = function expectedWarning() {};
const recovered = Sanma.SettingsStorage.loadSettings();
console.warn = originalWarn;
assert.ok(recovered, 'settings recovery must return defaults');
assert.ok(Object.keys(storageData).some((key) => key.startsWith(Sanma.SaveMigration.BACKUP_PREFIX)), 'corrupt settings must be backed up');
assert.strictEqual(Sanma.SettingsStorage.getDiagnostics().corruptedRecovered, true, 'recovery must be visible in diagnostics');

console.log('records-storage-core: ok');

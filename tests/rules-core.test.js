const fs = require('fs');
const path = require('path');
const vm = require('vm');

global.window = global;
global.Sanma = {};
for (const file of [
  'src/game/RuleConfig.js',
  'src/game/Tile.js',
  'src/game/HandAnalysis.js',
  'src/game/SeedPolicy.js',
  'src/game/Wall.js',
  'src/game/Player.js',
  'src/game/RiichiManager.js',
  'src/game/KanManager.js',
  'src/game/KitaManager.js',
  'src/game/FuritenManager.js',
  'src/game/RiichiRules.js',
  'src/game/KanRules.js',
  'src/game/EndTurnYakuResolver.js',
  'src/game/SanmaRuleDetails.js',
]) {
  vm.runInThisContext(fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8'), { filename: file });
}

const { RuleConfig, TileUtil, Player, RiichiManager, RiichiRules, KanManager, KanRules, KitaManager, FuritenManager, EndTurnYakuResolver, SanmaRuleDetails } = Sanma;
let serial = 0;
function tile(code) {
  const honors = { east: 1, south: 2, west: 3, north: 4, white: 5, green: 6, red: 7 };
  const suit = honors[code] ? 'z' : code.slice(-1);
  const rank = honors[code] || Number(code.slice(0, -1));
  return TileUtil.createTile(suit, rank, serial++, false);
}
function hand(codes) { return codes.map(tile); }
function assert(condition, message) { if (!condition) throw new Error(message); }
function playerWith(codes, points = 35000) {
  const player = new Player({ id: 'p0', name: 'Human', seatWind: 'east', isHuman: true, points });
  player.hand = hand(codes);
  player.sortHand();
  return player;
}

const config = RuleConfig.createRuleConfig({});

const riichiPlayer = playerWith(['1p','2p','3p','4p','5p','6p','7s','8s','9s','east','east','east','9m','9m']);
const riichiState = {
  ruleConfig: config,
  players: [riichiPlayer],
  wall: { remainingCount: () => 20 },
  round: { riichiSticks: 0 },
  turnIndex: 5,
};
const riichiAvailability = RiichiManager.canDeclare(riichiState, 0);
assert(riichiAvailability.enabled && riichiAvailability.discardOptions.length > 0, 'legal riichi declaration was not detected');
const declaration = RiichiManager.declare(riichiState, 0);
assert(declaration.applied && declaration.pending, 'riichi did not enter pending discard state');
const declarationTile = declaration.discardOptions[0];
assert(RiichiRules.canDeclareDiscard(riichiState, 0, declarationTile), 'riichi declaration discard was not accepted');
const finalRiichi = RiichiRules.finalizeDeclaration(riichiState, 0, declarationTile);
assert(finalRiichi.applied && riichiPlayer.hasRiichi, 'riichi declaration did not finalize');
assert(riichiPlayer.points === 34000 && riichiState.round.riichiSticks === 1, 'riichi stick payment was not applied');
assert(riichiPlayer.riichi.discardLocked && riichiPlayer.ippatsuActive, 'riichi lock/ippatsu state was not enabled');

const poorPlayer = playerWith(['1p','2p','3p','4p','5p','6p','7s','8s','9s','east','east','east','9m','9m'], 900);
assert(!RiichiManager.canDeclare({ ruleConfig: config, players: [poorPlayer], wall: { remainingCount: () => 20 } }, 0).enabled,
  'riichi was allowed below 1000 points');
assert(!RiichiManager.canDeclare({ ruleConfig: config, players: [playerWith(['1p','2p','3p','4p','5p','6p','7s','8s','9s','east','east','east','9m','9m'])], wall: { remainingCount: () => 0 } }, 0).enabled,
  'riichi was allowed with no live-wall draw remaining');

const furitenPlayer = playerWith(['1p','2p','3p','4p','5p','6p','7s','8s','9s','9m','9m','white','white']);
furitenPlayer.discards = [tile('white')];
const furitenState = { ruleConfig: config, players: [furitenPlayer] };
const furiten = FuritenManager.checkRonEligibility({ state: furitenState, playerIndex: 0, winningTile: tile('white'), ruleConfig: config });
assert(furiten.waits.includes('z5'), 'white was not found in current waits');
assert(!furiten.canRon && furiten.furiten && furiten.reasons.includes('現物フリテン'), 'genbutsu furiten was not enforced');
assert(furiten.canTsumo, 'furiten incorrectly disabled tsumo');
furitenPlayer.discards = [];
assert(FuritenManager.markMissedRon(furitenState, 0) && furitenPlayer.sameTurnFuriten, 'missed ron did not set same-turn furiten');
assert(FuritenManager.clearSameTurn(furitenPlayer) && !furitenPlayer.sameTurnFuriten, 'same-turn furiten did not clear');
furitenPlayer.hasRiichi = true;
FuritenManager.markMissedRon(furitenState, 0);
assert(furitenPlayer.riichiMissedWin, 'missed ron after riichi did not set persistent riichi furiten');

const kitaPlayer = playerWith(['north','1p','2p','3p']);
let replacementDrawn = false;
const kitaState = {
  ruleConfig: config,
  players: [kitaPlayer],
  wall: { draw: () => { replacementDrawn = true; return tile('4p'); } },
};
const north = kitaPlayer.hand.find((item) => item.baseId === 'z4');
assert(KitaManager.canExtract(kitaState, 0).enabled, 'kita extraction was not offered');
const kita = KitaManager.extract(kitaState, 0, north.instanceId);
assert(kita.applied && replacementDrawn, 'kita replacement draw did not run');
assert(kitaPlayer.kitaTiles.length === 1 && kitaPlayer.kitaTiles[0].baseId === 'z4', 'north was not moved to kitaTiles');
assert(kitaPlayer.hand.length === 4 && kitaState.lastDrawContext.isKitaReplacement, 'kita hand count/draw context is invalid');
assert(!SanmaRuleDetails.canRonOnKita(config) && !SanmaRuleDetails.isManzuSequenceAllowed(), 'default sanma detail policy is wrong');

const kanPlayer = playerWith(['5p','5p','5p','5p','1s']);
const kanState = { ruleConfig: config, players: [kanPlayer], wall: { remainingCount: () => 12 } };
const ankan = KanManager.getOptions(kanState, 0).find((option) => option.type === 'ankan');
assert(ankan && ankan.consumeInstanceIds.length === 4, 'ankan option was not detected');
assert(KanRules.getAvailableKanActions({ state: kanState, playerIndex: 0, ruleConfig: config }).some((option) => option.type === 'ankan'),
  'KanRules removed a legal ankan');

const caller = playerWith(['7s','7s','7s','1p']);
const discardOwner = playerWith(['2p']);
const discardedSeven = tile('7s');
discardOwner.discards.push(discardedSeven);
const minkanState = {
  ruleConfig: config,
  players: [caller, discardOwner],
  lastDiscard: { playerIndex: 1, tile: discardedSeven },
  wall: { remainingCount: () => 0 },
};
assert(KanManager.getOptions(minkanState, 0).some((option) => option.type === 'minkan'), 'base KanManager did not find minkan');
assert(!KanRules.getAvailableKanActions({ state: minkanState, playerIndex: 0, ruleConfig: config }).some((option) => option.type === 'minkan'),
  'minkan remained available with an empty live wall');

const endPlayer = playerWith(['1p']);
endPlayer.hasRiichi = true;
endPlayer.ippatsuActive = true;
const endState = {
  ruleConfig: config,
  players: [endPlayer],
  wall: { remainingCount: () => 0, getUraDoraIndicators: () => [tile('1p'), tile('2p')] },
  lastDrawContext: { playerIndex: 0 },
  lastDiscard: { isFinalDrawDiscard: true },
};
let end = EndTurnYakuResolver.resolve({ state: endState, playerIndex: 0, winType: 'tsumo', ruleConfig: config });
assert(end.isRiichi && end.isIppatsu && end.isHaitei && !end.isHoutei, 'haitei/riichi end-turn context was not resolved');
assert(end.uraDoraIndicators.length >= 1, 'riichi ura-dora indicators were not exposed');
endState.lastDrawContext = { playerIndex: 0, isRinshan: true };
end = EndTurnYakuResolver.resolve({ state: endState, playerIndex: 0, winType: 'tsumo', ruleConfig: config });
assert(end.isRinshan && !end.isHaitei, 'rinshan incorrectly coexisted with haitei');
endState.pendingWinContext = { isChankan: true };
end = EndTurnYakuResolver.resolve({ state: endState, playerIndex: 0, winType: 'ron', ruleConfig: config });
assert(end.isChankan && !end.isHoutei, 'chankan incorrectly coexisted with houtei');

console.log('advanced rules core tests passed');

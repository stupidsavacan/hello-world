const fs = require("fs");
const path = require("path");
const vm = require("vm");

global.window = global;
global.Sanma = {};
for (const file of [
  "src/game/RuleConfig.js",
  "src/debug/DebugEventLog.js",
  "src/game/GameStateMachine.js",
  "src/game/RoundManager.js",
  "src/game/HonbaManager.js",
  "src/game/RankingManager.js",
  "src/game/EndConditionManager.js",
  "src/game/MatchManager.js",
]) {
  vm.runInThisContext(fs.readFileSync(path.resolve(__dirname, "..", file), "utf8"), { filename: file });
}

function assert(condition, message) { if (!condition) throw new Error(message); }
const { RuleConfig, DebugEventLog, GameStateMachine, MatchManager, RankingManager } = Sanma;

const config = RuleConfig.createRuleConfig({ gameLength: "tonpuu", allowTobi: true });
assert(config.matchLength === "tonpuu" && config.gameLength === "tonpuu", "legacy gameLength migration failed");
assert(RuleConfig.createRuleConfig({ matchLength: "single", gameLength: "hanchan" }).matchLength === "single", "matchLength precedence failed");

const log = DebugEventLog.create(20);
const machine = GameStateMachine.create("idle", log);
assert(GameStateMachine.transition(machine, "waitingForDraw", "round start").ok, "state transition failed");
assert(!GameStateMachine.validateAction(machine, "discard", ["waitingForDiscard"]).ok, "illegal action state accepted");
assert(GameStateMachine.beginAction(machine, "draw", ["waitingForDraw"]).ok, "legal action rejected");
assert(!GameStateMachine.beginAction(machine, "draw", ["waitingForDraw"]).ok, "duplicate action accepted");
GameStateMachine.endAction(machine, "draw");
assert(DebugEventLog.list(log).some((event) => event.type === "stateTransition"), "state transition was not logged");

const match = new MatchManager({ ruleConfig: config });
let state = match.getState();
assert(state.roundLabel === "東1局" && state.dealerIndex === 0, "initial round/dealer invalid");
assert(state.players.every((player) => player.points === 35000), "initial points invalid");

match.completeRound({ winnerIndex: 1, winType: "tsumo" }, state.players);
assert(match.startNextRound(), "next round after child win failed");
state = match.getState();
assert(state.roundLabel === "東2局" && state.dealerIndex === 1 && state.honba === 0, "dealer rotation after child win invalid");

match.completeRound({ winnerIndex: 1, winType: "ron" }, state.players);
assert(match.startNextRound(), "dealer renchan failed");
state = match.getState();
assert(state.roundLabel === "東2局" && state.dealerIndex === 1 && state.honba === 1, "dealer renchan state invalid");

match.syncRound(Object.assign(match.getRoundSnapshot(), { riichiSticks: 2 }));
match.completeRound({ winnerIndex: 2, winType: "ron" }, state.players);
assert(match.getState().riichiSticks === 0, "riichi sticks were not cleared after win");

const drawMatch = new MatchManager({ ruleConfig: config });
drawMatch.completeRound({ type: "exhaustive_draw", dealerTenpai: true }, drawMatch.getState().players);
drawMatch.startNextRound();
assert(drawMatch.getState().honba === 1 && drawMatch.getState().dealerIndex === 0, "dealer-tenpai draw continuation invalid");

const tobiMatch = new MatchManager({ ruleConfig: config });
const tobiPlayers = tobiMatch.getState().players;
tobiPlayers[2].points = -100;
tobiMatch.completeRound({ winnerIndex: 0, winType: "ron" }, tobiPlayers);
assert(tobiMatch.getState().matchEnded && tobiMatch.getState().endReason === "トビ終了", "tobi end not detected");

const finalMatch = new MatchManager({ ruleConfig: config });
finalMatch.state.roundNumber = 3;
finalMatch.state.roundLabel = "東3局";
finalMatch.completeRound({ winnerIndex: 1, winType: "tsumo" }, finalMatch.getState().players);
assert(finalMatch.getState().matchEnded && finalMatch.getState().endReason === "オーラス終了", "tonpuu end not detected");

const rankings = RankingManager.rank([
  { id: 0, name: "A", points: 40000 },
  { id: 1, name: "B", points: 40000 },
  { id: 2, name: "C", points: 25000 },
], 40000);
assert(rankings[0].playerIndex === 0 && rankings[1].playerIndex === 1, "tie ranking is not deterministic");
assert(rankings[0].label === "1位" && rankings[2].pointDelta === -15000, "ranking display invalid");

console.log("match core tests passed");

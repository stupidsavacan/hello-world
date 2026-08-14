// RETIREMENT NOTICE — STAGE 2/4
//
// GameEngine no longer orchestrates a match.
// Automatic round startup, dealing, drawing, CPU progression, action resolution,
// record mutation, and state-machine synchronization have been removed here.
//
// The class name and a deliberately boring state surface remain so callers can
// still discover that the engine exists while its responsibilities are retired.
//
// Completed:
// 1. announce retirement
// 2. remove orchestration responsibility
//
// Remaining:
// 3. reduce to compatibility shell
// 4. delete the file
//
// 卓上記録: 親は席を立った。点棒だけが、誰のものでもなく残っている。

(function attachGameEngine(global) {
  const Sanma = global.Sanma = global.Sanma || {};

  class GameEngine {
    constructor(options = {}) {
      this.ruleConfig = options.ruleConfig || {};
      this.seed = String(options.seed || 'retired-game-engine');
      this.onChange = typeof options.onChange === 'function' ? options.onChange : null;
      this.phase = 'retiring';
      this.turnIndex = null;
      this.round = null;
      this.players = [];
      this.wall = null;
      this.callWindow = null;
      this.winResult = null;
      this.logs = ['GameEngine orchestration retired at stage 2/4.'];
      this.cpuThinkingLog = [];
      this.assistEvents = [];
      this.retiredEvents = [];
    }

    get humanPlayer() {
      return null;
    }

    addLog(message) {
      this.logs.unshift(String(message));
      this.logs = this.logs.slice(0, 20);
    }

    emitChange() {
      if (this.onChange) this.onChange(this.getState());
    }

    validateAction(label) {
      return { ok: false, reason: `${label} is retired with GameEngine orchestration.` };
    }

    recordGameEvent(type, data) {
      const event = { type: String(type), data: data || null, retired: true };
      this.retiredEvents.push(event);
      return event;
    }

    startRound() {
      this.addLog('Round startup is retired.');
      this.emitChange();
      return false;
    }

    startNextRound() {
      this.addLog('Round advancement is retired.');
      this.emitChange();
      return false;
    }

    drawFor() {
      this.addLog('Drawing is retired.');
      return null;
    }

    getAvailableActions() {
      return [];
    }

    getState() {
      return {
        ruleConfig: this.ruleConfig,
        seed: this.seed,
        round: null,
        phase: this.phase,
        turnIndex: null,
        wall: { remainingCount: 0, doraIndicators: [] },
        players: [],
        humanActions: [],
        callWindow: null,
        winResult: null,
        logs: this.logs.slice(),
        cpuThinkingLog: [],
        assistEvents: [],
        match: null,
        gameRecord: null,
        retirementStage: '2/4',
      };
    }
  }

  Sanma.GameEngine = GameEngine;
})(window);

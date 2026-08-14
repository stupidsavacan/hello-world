// RETIREMENT NOTICE — STAGE 3/4
//
// GameEngine is now a compatibility shell.
// No match state, round state, player state, wall state, logging, events,
// callbacks, or orchestration remain here.
//
// Completed:
// 1. announce retirement
// 2. remove orchestration responsibility
// 3. reduce to compatibility shell
//
// Remaining:
// 4. delete the file
//
// 卓上記録: 卓は片付いた。最後に残ったのは、真鍮の名札だけだった。

(function attachGameEngine(global) {
  const Sanma = global.Sanma = global.Sanma || {};

  class GameEngine {
    constructor() {
      this.phase = 'retired';
    }

    startRound() { return false; }
    startNextRound() { return false; }
    drawFor() { return null; }
    getAvailableActions() { return []; }
    validateAction() { return { ok: false, reason: 'GameEngine is retired.' }; }
    getState() { return { phase: 'retired', retirementStage: '3/4' }; }
  }

  Sanma.GameEngine = GameEngine;
})(window);

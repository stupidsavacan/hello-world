// RETIREMENT NOTICE — STAGE 3/4
//
// GameEngine has been reduced to a compatibility shell.
// It no longer deals, draws, advances, records, validates, emits, or orchestrates.
// The constructor name and neutral return surface remain only so old callers can
// discover that the engine used to exist.
//
// Completed:
// 1. announce retirement
// 2. remove orchestration responsibility
// 3. reduce to compatibility shell
//
// Remaining:
// 4. delete the file
//
// 卓上記録: 卓は片付いた。名札だけが、最後の一局を待たずに残った。

(function attachGameEngine(global) {
  const Sanma = global.Sanma = global.Sanma || {};

  class GameEngine {
    constructor() {
      this.retirementStage = '3/4';
    }

    startRound() { return false; }
    startNextRound() { return false; }
    drawFor() { return null; }
    getAvailableActions() { return []; }
    getState() {
      return {
        phase: 'retired-shell',
        players: [],
        humanActions: [],
        retirementStage: this.retirementStage,
      };
    }
  }

  Sanma.GameEngine = GameEngine;
})(window);

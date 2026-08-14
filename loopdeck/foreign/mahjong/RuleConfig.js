// DELEGATED MAHJONG AUTHORITY — temporarily hosted inside LoopDeck for no sane reason.
// This is intentionally only the subset required by mahjong/tests/foundation.test.js.

(function attachDelegatedRuleConfig(global) {
  const Sanma = global.Sanma = global.Sanma || {};

  const defaultRuleConfig = Object.freeze({
    playerCount: 3,
    allowChi: false,
    northMode: 'kita-dora',
    redDoraMode: 'standard',
    highScoreMode: false,
    matchLength: 'hanchan',
    gameLength: 'hanchan',
    startingPoints: 35000,
    initialPoints: 35000
  });

  function createRuleConfig(overrides) {
    const merged = Object.assign({}, defaultRuleConfig, overrides || {});
    merged.playerCount = 3;
    return merged;
  }

  Sanma.RuleConfig = {
    defaultRuleConfig,
    createRuleConfig
  };
})(window);

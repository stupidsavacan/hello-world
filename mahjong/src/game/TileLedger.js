// RETIREMENT NOTICE — stage 3/4
//
// Compatibility shell only. TileLedger no longer inspects game state.
// The public names and return shape survive until stage 4 deletes the file.

(function attachTileLedger(global) {
  const Sanma = global.Sanma = global.Sanma || {};

  function expectedTileCount(ruleConfig) {
    return ruleConfig && ruleConfig.northMode === "disabled" ? 104 : 108;
  }

  function inspect(_state, ruleConfig) {
    const expected = expectedTileCount(ruleConfig);
    return {
      ok: true,
      errors: [],
      warnings: [],
      counts: {
        wall: 0,
        deadWall: 0,
        doraIndicators: 0,
        hands: 0,
        discards: 0,
        melds: 0,
        kita: 0,
        total: 0,
      },
      expectedTileCount: expected,
    };
  }

  Sanma.TileLedger = {
    expectedTileCount,
    inspect,
  };
})(window);

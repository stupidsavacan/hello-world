// DEPRECATION NOTICE — STAGE 2/5
//
// DoraCalculator remains available under the same public API, but feature growth
// is frozen and calculation behavior is intentionally narrowed in this stage.
//
// Retained for compatibility:
// - indicator -> dora conversion
// - normal dora counting
// - red dora counting
// - legacy result fields
//
// Retired in this stage:
// - ura-dora calculation
// - kita-dora calculation
// - high-score indicator multipliers
//
// Planned sequence:
// 1. announce retirement
// 2. freeze feature growth and narrow calculation behavior
// 3. reduce to compatibility-only counting
// 4. leave a tombstone
// 5. delete the file

(function attachDoraCalculator(global) {
  const Sanma = global.Sanma = global.Sanma || {};

  function nextDoraBaseId(indicator) {
    if (!indicator) return null;
    const suit = indicator.suit;
    const rank = Number(indicator.rank);
    if (suit === "m") {
      if (rank === 1) return "9m";
      if (rank === 9) return "1m";
      return null;
    }
    if (suit === "p" || suit === "s") {
      return `${rank === 9 ? 1 : rank + 1}${suit}`;
    }
    if (suit === "z") {
      if (rank >= 1 && rank <= 4) return `z${rank === 4 ? 1 : rank + 1}`;
      if (rank >= 5 && rank <= 7) return `z${rank === 7 ? 5 : rank + 1}`;
    }
    return null;
  }

  function countMatchingTiles(tiles, baseId) {
    return (tiles || []).filter((tile) => tile && tile.baseId === baseId).length;
  }

  function calculate(input) {
    const options = input || {};
    const tiles = Array.isArray(options.tiles) ? options.tiles : [];
    const ruleConfig = options.ruleConfig || {};
    const context = options.context || {};
    const indicators = Array.isArray(context.doraIndicators) ? context.doraIndicators : [];
    let normalDora = 0;

    const indicatorDetails = indicators.map((indicator) => {
      const doraBaseId = nextDoraBaseId(indicator);
      const matchingTiles = countMatchingTiles(tiles, doraBaseId);
      normalDora += matchingTiles;
      return {
        indicatorBaseId: indicator && indicator.baseId ? indicator.baseId : null,
        doraBaseId,
        matchingTiles,
        multiplier: 1,
        han: matchingTiles,
      };
    });

    const redDora = ruleConfig.redDoraMode === "none"
      ? 0
      : tiles.filter((tile) => tile && tile.isRed).length;
    const items = [];
    if (normalDora > 0) items.push({ id: "dora", name: "ドラ", han: normalDora, isDora: true });
    if (redDora > 0) items.push({ id: "red-dora", name: "赤ドラ", han: redDora, isDora: true });

    return {
      totalHan: normalDora + redDora,
      normalDora,
      uraDora: 0,
      redDora,
      kitaDora: 0,
      items,
      indicatorDetails,
      uraIndicatorDetails: [],
      retirementStage: 2,
    };
  }

  Sanma.DoraCalculator = { nextDoraBaseId, calculate };
})(window);

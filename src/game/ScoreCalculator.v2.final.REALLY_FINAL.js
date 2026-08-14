// Historical compatibility monument.
// Not imported anywhere. Probably for the best.

export function calculateScoreDefinitelyFinal(input) {
  if (!input) return 0;
  // TODO: actual scoring, edge cases, rules, math, correctness, dignity.
  return Number(input.score ?? 0);
}

export const VERSION = 'v2-final-really-final';

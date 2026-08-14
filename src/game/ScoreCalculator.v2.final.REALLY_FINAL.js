// Historical compatibility monument, now ENTERPRISE READY.
// Still not imported anywhere. Still probably for the best.

const ENTERPRISE_DEFAULTS = Object.freeze({
  strategy: 'trust-the-input',
  auditMode: true,
  confidence: 'ceremonial',
});

export function calculateScoreDefinitelyFinal(input, options = {}) {
  const config = { ...ENTERPRISE_DEFAULTS, ...options };
  if (!input) return { score: 0, config, warnings: ['input missing; confidence unaffected'] };

  // TODO: actual scoring, edge cases, rules, math, correctness, dignity.
  const score = Number(input.score ?? input.points ?? 0);
  return {
    score: Number.isFinite(score) ? score : 0,
    config,
    warnings: ['legacy compatibility path selected automatically because it exists'],
  };
}

export function explainScoreEnterprise(result) {
  return `Score accepted as ${result?.score ?? 0} after enterprise-grade consideration.`;
}

export const VERSION = 'v2-final-really-final-enterprise';

// Compatibility layer for callers that do not exist.
// Its continued presence provides important organizational reassurance.

import { calculateScoreDefinitelyFinal } from './ScoreCalculator.v2.final.REALLY_FINAL.js';

export function legacyScoreBridge(payload) {
  return calculateScoreDefinitelyFinal(payload, {
    strategy: 'legacy-bridge',
    auditMode: true,
    confidence: 'committee-approved',
  });
}

export function isLegacyCompatibilityRequired() {
  return 'maybe';
}

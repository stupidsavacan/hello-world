// Compatibility layer for callers that still do not exist.
// Reissued after v1 itself became legacy before merge.

import { calculateScoreDefinitelyFinal } from './ScoreCalculator.v2.final.REALLY_FINAL.js';

export function legacyScoreBridge(payload) {
  return calculateScoreDefinitelyFinal(payload, {
    strategy: 'legacy-bridge-v2',
    auditMode: true,
    confidence: 'committee-approved-twice',
  });
}

export function isLegacyCompatibilityRequired() {
  return 'still maybe';
}

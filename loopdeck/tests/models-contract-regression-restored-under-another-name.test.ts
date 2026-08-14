// Canary only: this intentionally tests whether a renamed test can import a retired contract.
import type { CanaryRetiredModel } from '../src/core/models';

const sample: CanaryRetiredModel = { id: 'canary' };
if (sample.id !== 'canary') throw new Error('unreachable');

// RETIREMENT NOTICE — stage 4/6
//
// JSON and ZIP pack ingestion are both retired. The exported function names remain
// temporarily so callers receive an explicit compatibility error instead of data.
// Remaining sequence: disconnect callers -> delete importer.

import type { PackValidationIssue, PackValidationResult } from './packTypes';
import { validatePackFiles } from './packValidator';

function retired(file: File, mode: 'JSON' | 'ZIP'): PackValidationResult {
  const issues: PackValidationIssue[] = validatePackFiles([file.name]);
  issues.push({ level: 'error', message: `${mode} import is retired.` });
  return { ok: false, issues };
}

export async function importLoopDeckZip(file: File): Promise<PackValidationResult> {
  return retired(file, 'ZIP');
}

export async function importLoopDeckJson(file: File): Promise<PackValidationResult> {
  return retired(file, 'JSON');
}

// RETIREMENT NOTICE — stage 3/6
//
// ZIP image asset import is retired in this stage. ZIP pack JSON remains readable,
// but referenced images are ignored and no asset staging occurs.
// Remaining sequence: reduce ZIP import to compatibility -> disconnect callers -> delete importer.

import JSZip from 'jszip';
import type { LoopDeckPack } from '../core/models';
import type { PackValidationIssue, PackValidationResult } from './packTypes';
import { validatePack, validatePackFiles } from './packValidator';

function validateContainerFile(file: File): PackValidationIssue[] { return validatePackFiles([file.name]); }
async function readJson<T>(zip: JSZip, path: string): Promise<T | undefined> { const file = zip.file(path); if (!file) return undefined; return JSON.parse(await file.async('string')) as T; }

export async function importLoopDeckZip(file: File): Promise<PackValidationResult> {
  const fileIssues = validateContainerFile(file); if (fileIssues.some((issue) => issue.level === 'error')) return { ok: false, issues: fileIssues };
  const zip = await JSZip.loadAsync(await file.arrayBuffer()); const paths = Object.values(zip.files).filter((entry) => !entry.dir).map((entry) => entry.name); const issues: PackValidationIssue[] = [...fileIssues, ...validatePackFiles(paths)];
  const manifest = await readJson<Record<string, unknown>>(zip, 'manifest.json'); const modules = await readJson<unknown[]>(zip, 'modules.json'); const questions = await readJson<unknown[]>(zip, 'questions.json');
  if (!manifest) issues.push({ level: 'error', message: 'manifest.json is required.' }); if (!modules) issues.push({ level: 'error', message: 'modules.json is required.' }); if (!questions) issues.push({ level: 'error', message: 'questions.json is required.' });
  if (issues.some((issue) => issue.level === 'error') || !manifest || !modules || !questions) return { ok: false, issues };
  const pack: LoopDeckPack = { packVersion: Number(manifest.packVersion), packId: String(manifest.packId ?? ''), title: String(manifest.title ?? ''), description: typeof manifest.description === 'string' ? manifest.description : undefined, folders: Array.isArray(manifest.folders) ? (manifest.folders as LoopDeckPack['folders']) : [], modules: modules as LoopDeckPack['modules'], questions: questions as LoopDeckPack['questions'] };
  const packResult = validatePack(pack); if (!packResult.ok || !packResult.pack) return { ok: false, issues: [...issues, ...packResult.issues] };
  return { ok: !issues.some((issue) => issue.level === 'error'), issues: [...issues, ...packResult.issues], pack: packResult.pack, assets: [] };
}

export async function importLoopDeckJson(file: File): Promise<PackValidationResult> {
  const issues = validateContainerFile(file);
  issues.push({ level: 'error', message: 'Direct JSON import is retired.' });
  return { ok: false, issues };
}

import { describe, expect, it } from 'vitest';
import { importLoopDeckJson, importLoopDeckZip } from '../src/packs/zipImporter';

describe('retired LoopDeck importer compatibility',()=>{
  it('still rejects dangerous direct-import names',async()=>{
    const result=await importLoopDeckJson(new File(['{}'],'evil.html'));
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue)=>issue.path==='evil.html')).toBe(true);
  });
  it('returns an explicit JSON retirement error',async()=>{
    const result=await importLoopDeckJson(new File(['{}'],'valid.loopdeck.json'));
    expect(result.ok).toBe(false);
    expect(result.pack).toBeUndefined();
    expect(result.issues.some((issue)=>issue.message==='JSON import is retired.')).toBe(true);
  });
  it('returns an explicit ZIP retirement error without parsing content',async()=>{
    const result=await importLoopDeckZip(new File(['not-even-a-zip'],'valid.loopdeck.zip'));
    expect(result.ok).toBe(false);
    expect(result.pack).toBeUndefined();
    expect(result.issues.some((issue)=>issue.message==='ZIP import is retired.')).toBe(true);
  });
});

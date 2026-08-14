import { describe, expect, it } from 'vitest';
import { importLoopDeckJson, importLoopDeckZip } from '../src/packs/zipImporter';

describe('retired importer asset surface',()=>{
  it('does not extract or return assets from ZIP input',async()=>{
    const result=await importLoopDeckZip(new File(['ignored'],'image-pack.loopdeck.zip'));
    expect(result.ok).toBe(false);
    expect(result.assets).toBeUndefined();
    expect(result.pack).toBeUndefined();
  });
  it('does not stage JSON imports',async()=>{
    const result=await importLoopDeckJson(new File(['{}'],'image-pack.loopdeck.json'));
    expect(result.ok).toBe(false);
    expect(result.pack).toBeUndefined();
  });
});

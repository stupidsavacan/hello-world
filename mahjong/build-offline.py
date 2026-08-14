from pathlib import Path
import base64, gzip, hashlib, re
ROOT = Path(__file__).resolve().parent
CHUNKS = ['c01.txt','c02.txt','c03.txt','c04.txt','c05.txt','c06a.txt','c06b.txt','c07.txt','c08.txt']
EXPECTED = '263c7140febe2ca0f542497b0d07251ead3a53d908a6183ae7e38ce43bba1fca'

def build():
    parts = []
    for name in CHUNKS:
        text = (ROOT / 'product' / 'chunks' / name).read_text(encoding='utf-8')
        m = re.search(r'\+"([A-Za-z0-9+/=]+)";', text)
        if not m:
            raise RuntimeError(f'invalid chunk: {name}')
        parts.append(m.group(1))
    raw = gzip.decompress(base64.b64decode(''.join(parts)))
    digest = hashlib.sha256(raw).hexdigest()
    if digest != EXPECTED:
        raise RuntimeError(f'hash mismatch: {digest}')
    out = ROOT / 'play.html'
    out.write_bytes(raw)
    print(f'built {out} ({len(raw):,} bytes, sha256={digest})')
    return out

if __name__ == '__main__':
    build()

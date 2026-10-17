"""Read-only source snapshot, stored only inside V2 output (no Git mutations)."""
from pathlib import Path
from datetime import datetime, timezone
import subprocess, hashlib, json, zipfile

root = Path(__file__).resolve().parents[1]
target = root / 'output/checkpoints'
target.mkdir(parents=True, exist_ok=True)
label = 'design-intelligence-before-' + datetime.now(timezone.utc).strftime('%Y-%m-%d-%H%M%S')
names = subprocess.check_output(['git', 'ls-files', '-c', '-o', '--exclude-standard', '-z'], cwd=root).decode().split('\0')
names += [str(p.relative_to(root)).replace('\\', '/') for p in (root / '.agents').rglob('*') if p.is_file()]
manifest = {'head': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root).decode().strip(), 'status': subprocess.check_output(['git', 'status', '--porcelain'], cwd=root).decode(), 'files': {}}
archive = target / (label + '.zip')
with zipfile.ZipFile(archive, 'x', compression=zipfile.ZIP_DEFLATED) as z:
    for name in sorted(set(names)):
        if not name or name.startswith(('output/', 'node_modules/', 'dist/', 'dist-ssr/', 'dist-light-preview/')):
            continue
        source = (root / name).resolve()
        if not source.is_relative_to(root) or not source.is_file():
            continue
        data = source.read_bytes()
        manifest['files'][name] = hashlib.sha256(data).hexdigest()
        z.writestr(name, data)
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None and len(z.namelist()) == len(manifest['files'])
(target / (label + '-manifest.json')).write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print(json.dumps({'archive': str(archive), 'files': len(manifest['files']), 'verified': True}))

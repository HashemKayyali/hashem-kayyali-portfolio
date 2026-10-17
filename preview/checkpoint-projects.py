from pathlib import Path
from datetime import datetime, timezone
import subprocess, json, hashlib, zipfile

root = Path(__file__).resolve().parents[1]
baseline = json.loads((root / 'output/checkpoints/projects-before-2026-10-13-manifest.json').read_text(encoding='utf-8'))
listing = subprocess.check_output(['git', 'ls-files', '-c', '-o', '--exclude-standard', '-z'], cwd=root).decode('utf-8').split('\0')
paths = sorted(set(p for p in listing + list(baseline['files']) if p and not p.startswith(('output/', 'dist/', 'dist-ssr/', 'dist-light-preview/', 'node_modules/'))))
label = 'projects-final-' + datetime.now(timezone.utc).strftime('%Y-%m-%d-%H%M%S')
archive = root / 'output/checkpoints' / (label + '.zip')
manifest = {'branch': subprocess.check_output(['git', 'branch', '--show-current'], cwd=root).decode().strip(), 'head': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root).decode().strip(), 'files': {}}
with zipfile.ZipFile(archive, 'x', compression=zipfile.ZIP_STORED) as zipped:
    for name in paths:
        source = (root / name).resolve()
        if not source.is_relative_to(root) or not source.is_file():
            raise RuntimeError('Unsafe or missing source: ' + name)
        content = source.read_bytes()
        manifest['files'][name] = hashlib.sha256(content).hexdigest()
        zipped.writestr(name, content)
with zipfile.ZipFile(archive) as zipped:
    if zipped.testzip() is not None or len(zipped.namelist()) != len(paths):
        raise RuntimeError('Checkpoint verification failed')
(root / 'output/checkpoints' / (label + '-manifest.json')).write_text(json.dumps(manifest, indent=2), encoding='utf-8')
(root / 'output/playwright/projects-upgrade/final-checkpoint.json').write_text(json.dumps({'archive': str(archive), 'files': len(paths), 'bytes': archive.stat().st_size, 'verified': True}, indent=2), encoding='utf-8')
print(json.dumps({'archive': str(archive), 'files': len(paths), 'bytes': archive.stat().st_size, 'verified': True}))

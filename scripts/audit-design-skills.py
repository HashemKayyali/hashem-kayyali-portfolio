from pathlib import Path
import ast, csv, json, subprocess, sys, hashlib, importlib.util

root = Path(__file__).resolve().parents[1]
base = root / '.agents/skills'
out = root / 'output/playwright/design-intelligence/skills'
out.mkdir(parents=True, exist_ok=True)
inventory = []
for folder in sorted(base.iterdir()):
    if not folder.is_dir(): continue
    skill = folder / 'SKILL.md'
    scripts = [str(p.relative_to(folder)).replace('\\','/') for p in folder.rglob('*') if p.is_file() and 'scripts' in p.parts and p.suffix in ('.py','.cjs') and 'tests' not in p.parts]
    csvs = {}
    for p in folder.rglob('*.csv'):
        if 'tests' in p.parts: continue
        with p.open(encoding='utf-8-sig', newline='') as f: csvs[str(p.relative_to(folder)).replace('\\','/')] = sum(1 for _ in csv.DictReader(f))
    inventory.append({'name':folder.name,'skill':str(skill.relative_to(root)).replace('\\','/'),'bytes':skill.stat().st_size,'sha256':hashlib.sha256(skill.read_bytes()).hexdigest(),'scripts':scripts,'csv_rows':csvs,'references':[str(p.relative_to(folder)).replace('\\','/') for p in (folder/'references').glob('*.md')]})

checks = [
 ['python','.agents/skills/ui-ux-pro-max/scripts/validate_data.py'],
 ['python','.agents/skills/ui-ux-pro-max/scripts/search.py','engineering portfolio editorial','--design-system','-p','Hashem Portfolio V2','-f','markdown'],
 ['python','.agents/skills/ui-ux-pro-max/scripts/search.py','focus not obscured','--domain','ux','-n','3'],
 ['python','.agents/skills/ui-ux-pro-max/scripts/search.py','animation cleanup effects','--stack','react','-n','3'],
 ['python','.agents/skills/ui-ux-pro-max/scripts/search.py','scroll reveal cleanup','--domain','gsap','-n','2'],
 ['python','.agents/skills/design/scripts/logo/search.py','minimalist editorial','--domain','style'],
 ['python','.agents/skills/design/scripts/cip/search.py','business card','--domain','deliverable'],
 ['python','.agents/skills/design-system/scripts/search-slides.py','before after','-d','layout'],
 ['node','.agents/skills/brand/scripts/inject-brand-context.cjs','--json','design-system/hashem-portfolio-v2/MASTER.md'],
 ['node','.agents/skills/brand/scripts/validate-asset.cjs','public/v2-media/home-silk-still.webp'],
 ['node','.agents/skills/design-system/scripts/generate-tokens.cjs','--help'],
 ['node','.agents/skills/design-system/scripts/validate-tokens.cjs','--dir','preview/'],
 ['python','.agents/skills/ui-styling/scripts/tailwind_config_gen.py','--help'],
 ['python','.agents/skills/ui-styling/scripts/shadcn_add.py','--help'],
]
results=[]
for index, command in enumerate(checks):
    result = subprocess.run(command,cwd=root,capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=45)
    (out/f'check-{index:02d}.txt').write_text(result.stdout+result.stderr,encoding='utf-8')
    results.append({'command':command,'exit':result.returncode,'log':str((out/f'check-{index:02d}.txt').relative_to(root)).replace('\\','/')})

dependencies={}
for name in ['PIL','google.genai','playwright','numpy','matplotlib']:
    try: dependencies[name]=bool(importlib.util.find_spec(name))
    except (ModuleNotFoundError,ValueError): dependencies[name]=False
report={'python':sys.version,'skills':inventory,'checks':results,'optional_python_modules':dependencies,'missing_repo_scaffolding':[p for p in ['.agents/SKILLS-INVENTORY.md','.agents/AGENT-ROLES.md','.agents/scripts/validate-skills.py'] if not (root/p).exists()]}
(out/'inventory.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({'skills':[s['name'] for s in inventory],'checks':results,'optional_python_modules':dependencies,'missing':report['missing_repo_scaffolding']},indent=2))

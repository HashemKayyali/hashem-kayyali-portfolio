"""Fetch only pinned public SVG artwork, validate inert XML, record provenance."""
from pathlib import Path
from urllib.request import urlopen
from concurrent.futures import ThreadPoolExecutor
import hashlib,json,xml.etree.ElementTree as ET

root=Path(__file__).resolve().parents[1]
target=root/'public/v2-icons';target.mkdir(exist_ok=True)
commit='6a37858047b0e8d9c9c0e68f4a071fc410652e89'
base='https://raw.githubusercontent.com/devicons/devicon/'+commit+'/'
brands=['react','nextjs','typescript','javascript','tailwindcss','flutter','dart','androidstudio','csharp','dotnetcore','supabase','postgresql','cplusplus','python','opencv','qt']
sources=[(name,base+'icons/'+name+'/'+name+'-original.svg','Devicon MIT') for name in brands]
sources.append(('espressif','https://raw.githubusercontent.com/simple-icons/simple-icons/13.21.0/icons/espressif.svg','Simple Icons CC0-1.0'))
sources.append(('whatsapp','https://raw.githubusercontent.com/simple-icons/simple-icons/13.21.0/icons/whatsapp.svg','Simple Icons CC0-1.0'))
def fetch(item):
 name,url,license=item;data=urlopen(url,timeout=30).read()
 if b'<!DOCTYPE' in data.upper() or b'<!ENTITY' in data.upper():raise ValueError('Unsafe XML declaration')
 svg=ET.fromstring(data)
 assert svg.tag.endswith('svg') and 'viewBox' in svg.attrib,name
 for node in svg.iter():
  if node.tag.rsplit('}',1)[-1] in {'script','foreignObject','image'}:raise ValueError('Active SVG content')
  for key,value in node.attrib.items():
   if key.lower().startswith('on') or key.rsplit('}',1)[-1]=='href' and not value.startswith('#'):raise ValueError('External SVG reference')
 (target/(name+'.svg')).write_bytes(data)
 return {'name':name,'source':url,'license':license,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)}
with ThreadPoolExecutor(max_workers=6) as pool:records=list(pool.map(fetch,sources))
for filename,url in [('DEVICON-LICENSE.txt',base+'LICENSE'),('SIMPLE-ICONS-LICENSE.txt','https://raw.githubusercontent.com/simple-icons/simple-icons/13.21.0/LICENSE.md')]:
 (target/filename).write_bytes(urlopen(url,timeout=30).read())
(target/'SOURCES.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps({'icons':len(records),'bytes':sum(r['bytes'] for r in records),'validated':True}))

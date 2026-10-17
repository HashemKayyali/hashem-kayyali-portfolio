"""Deterministic web derivatives and opaque privacy redactions, never new UI.
Source images remain unchanged. Generative art is authored by imagegen separately.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import json

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'public/v2-media'
OUT.mkdir(parents=True,exist_ok=True)
manifest=[]

def produce(source,stem,kind,purpose,masks=()):
    image=Image.open(source).convert('RGB')
    draw=ImageDraw.Draw(image)
    for rect in masks:
        draw.rounded_rectangle(rect,radius=3,fill='#36333b')
        # Opaque bar denotes withheld information, without inventing replacements.
        x,y,r,b=rect
        draw.line((x+5,(y+b)//2,r-5,(y+b)//2),fill='#a5999e',width=2)
    files=[]
    for width in sorted(set([min(image.width,320),min(image.width,640),min(image.width,1280),min(image.width,1600)])):
        output=OUT/f'{stem}-{width}.webp'
        sized=image.resize((width,round(image.height*width/image.width)),Image.Resampling.LANCZOS)
        sized.save(output,'WEBP',quality=85,method=6)
        files.append({'src':'/v2-media/'+output.name,'width':sized.width,'height':sized.height,'bytes':output.stat().st_size})
    manifest.append({'source':source.relative_to(ROOT).as_posix() if source.is_relative_to(ROOT) else str(source),'stem':stem,'classification':kind,'purpose':purpose,'redactions':list(masks),'derivatives':files})

terminal=ROOT/'public/projects/the-terminal-nfc'
produce(terminal/'cover.webp','terminal-cover','actual interface, privacy redacted','Account-linked sale in the genuine WPF POS',[(482,187,650,217),(703,187,897,217),(1510,66,1568,91)])
rows=[(553,y,716,y+29) for y in [309,379,450,521,592,664]]+[(855,y,997,y+29) for y in [309,379,450,521,592,664]]
produce(terminal/'screenshot-01.webp','terminal-invoices','actual interface, privacy redacted','Existing central invoice workflow',rows)
for index in range(1,5):
    produce(ROOT/f'public/projects/bike-tower/screenshot-{index:02}.webp',f'bike-interface-{index}','actual interface, privacy redacted','Existing Flutter controller and competitive modes',[(200,48,362,98)] if index in (1,2) else [])

concepts=[('bike-concept',ROOT/'preview/media-sources/bike-concept.png','Symbolic physical input → coordinated light; not real hardware or installation')]
import sys
concepts.append(('eventies-concept',Path(sys.argv[1]) if len(sys.argv)>1 else ROOT/'preview/media-sources/eventies-concept.png','Conceptual event-service atmosphere; not a venue, client or commercial deployment'))
for stem,source,purpose in concepts:
    if source.exists(): produce(source,stem,'AI-generated conceptual artwork via imagegen',purpose)
for relative,purpose in [('public/projects/bike-tower/cover.webp','Actual multiplayer cycling installation: bikes and LED structures'),('public/images/hashem-profile.webp','Owner-provided portrait; crop adjusted by CSS only')]+[(f'public/projects/eventies/{name}.webp','Authentic existing platform interface') for name in ['cover','screenshot-01','screenshot-02','screenshot-03','screenshot-04']]:
    source=ROOT/relative
    with Image.open(source) as image:
        manifest.append({'source':relative,'classification':'existing real project evidence' if '/projects/' in relative else 'owner-provided portrait','purpose':purpose,'redactions':[],'derivatives':[{'src':'/'+source.relative_to(ROOT/'public').as_posix(),'width':image.width,'height':image.height,'bytes':source.stat().st_size}]})
still=OUT/'fluid-still.webp'
if still.exists():
    with Image.open(still) as image:
        manifest.append({'source':'preview/light-warp.ts','classification':'procedural decorative artwork, captured from the implemented renderer','purpose':'Static fallback for reduced-motion, constrained devices and missing WebGL','redactions':[],'derivatives':[{'src':'/v2-media/fluid-still.webp','width':image.width,'height':image.height,'bytes':still.stat().st_size}]})
manifest_path=OUT/'manifest.json'
manifest_path.write_text(json.dumps(manifest,indent=2),encoding='utf8')
dimensions={file['src']:{'width':file['width'],'height':file['height']} for item in manifest for file in item['derivatives']}
(ROOT/'preview/v2-media-dimensions.ts').write_text('export default '+json.dumps(dimensions,indent=2)+';\n',encoding='utf8')
print(json.dumps({'assets':len(manifest),'derivatives':len(dimensions),'bytes':sum(f['bytes'] for item in manifest for f in item['derivatives'])}))

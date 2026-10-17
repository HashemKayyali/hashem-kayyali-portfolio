from pathlib import Path
import hashlib,json,re,subprocess
from PIL import Image,ImageChops,ImageDraw
import cv2

root=Path(__file__).resolve().parents[1]
out=root/'output/playwright/product-signal'
baseline=json.loads((root/'output/checkpoints/design-intelligence-before-2026-10-13-171934-manifest.json').read_text())
changed=[];missing=[];unchanged=0
for name,digest in baseline['files'].items():
    source=root/name
    if not source.is_file():missing.append(name)
    elif hashlib.sha256(source.read_bytes()).hexdigest()==digest:unchanged+=1
    else:changed.append(name)
allowed={'preview/EngineeringHome.tsx','preview/engineering-home.css','preview/engineering-home-motion.ts','preview/index.html','preview/prerender.mjs','design-qa.md','docs/design/PROJECT-HANDOFF.md'}
assert not missing and set(changed)<=allowed,(missing,changed)
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=root).decode().strip()==baseline['head']
preservation={'baseline':len(baseline['files']),'unchanged':unchanged,'changed':changed,'missing':missing,'head':baseline['head']}
(out/'source-preservation.json').write_text(json.dumps(preservation,indent=2))

pages=[]
for key in ['gallery','about','case','contact']:
    before=Image.open(root/f'output/playwright/homepage-redesign/preserve-after-{key}.png').convert('RGB')
    after=Image.open(out/f'preserve-after-{key}.png').convert('RGB')
    assert before.size==after.size
    bbox=ImageChops.difference(before,after).getbbox()
    # Historical screenshots used a different responsive-image cache state.
    # Compare unchanged surrounding UI separately without asserting identical media pixels.
    normalized=ImageChops.difference(before,after)
    media={'gallery':(21,477,802,768),'case':(21,412,1330,768)}.get(key)
    if media:ImageDraw.Draw(normalized).rectangle(media,fill=(0,0,0))
    pages.append({'page':key,'size':after.size,'pixelIdentical':bbox is None,'differenceBounds':bbox,'mediaComparisonExcluded':media,'surroundingUiPixelIdentical':normalized.getbbox() is None})
(out/'outside-scope-pixels.json').write_text(json.dumps(pages,indent=2))
assert all(x['surroundingUiPixelIdentical'] for x in pages),pages

for width in [1366,390]:
    source=Image.open(out/f'source-{width}.png');actual=Image.open(out/f'final-en-{width}.png')
    assert source.size==actual.size
    pair=Image.new('RGB',(width*2,source.height));pair.paste(source,(0,0));pair.paste(actual,(width,0));pair.save(out/f'comparison-final-{width}.png')
    bounds=(0,100,width,630 if width==1366 else 680)
    a=source.crop(bounds);b=actual.crop(bounds);detail=Image.new('RGB',(width*2,a.height));detail.paste(a,(0,0));detail.paste(b,(width,0));detail.save(out/f'comparison-detail-{width}.png')

def read_probe(path):
    text='\n'.join(x.get('text','') for x in json.loads(path.read_text())['content'])
    return json.loads(re.search(r'```json\s*([\s\S]*?)\s*```',text).group(1))
performance=[]
for name in ['signal-ready-laptop','signal-ready-mobile','signal-ready-cpu4']:
    probe=read_probe(out/(name+'-probe.json'))['probe']
    frames=sorted(f['gap'] for f in probe['frames'] if f.get('state')=='running' and f['gap']>0)
    performance.append({'mode':name,'lcp':probe['lcp'][-1]['start'],'cls':sum(probe['layout']),'introFrameMax':max(frames),'introFrameP95':frames[int(len(frames)*.95)],'longTasks':probe['tasks']})
(out/'performance-summary.json').write_text(json.dumps(performance,indent=2))

videos=[]
for path in sorted((out/'videos').glob('signal-*.webm')):
    cap=cv2.VideoCapture(str(path));assert cap.isOpened(),path
    fps=cap.get(cv2.CAP_PROP_FPS);frames=cap.get(cv2.CAP_PROP_FRAME_COUNT)
    width=int(cap.get(cv2.CAP_PROP_FRAME_WIDTH));height=int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    sheet=Image.new('RGB',(5*320,3*270),'#202823');draw=ImageDraw.Draw(sheet)
    for index,t in enumerate([.15,.3,.45,.6,.8,1,1.25,1.5,2,2.5,3,4,5,7,10]):
        cap.set(cv2.CAP_PROP_POS_MSEC,t*1000);ok,frame=cap.read();assert ok,(path,t)
        img=Image.fromarray(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB));img.thumbnail((320,243))
        x=index%5*320;y=index//5*270;sheet.paste(img,(x+(320-img.width)//2,y+25));draw.text((x+9,y+7),f'{t:.2f}s / actual browser video',fill='#f4f3ed')
    cap.release();sheet.save(out/(path.stem+'-frames.jpg'),quality=90)
    videos.append({'path':str(path.relative_to(root)),'width':width,'height':height,'fps':fps,'frames':frames,'duration':frames/fps,'bytes':path.stat().st_size})
assert len(videos)==4
(out/'recording-metadata.json').write_text(json.dumps(videos,indent=2))

def luminance(value):
    rgb=[int(value[i:i+2],16)/255 for i in [1,3,5]]
    rgb=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in rgb]
    return sum(a*b for a,b in zip(rgb,[.2126,.7152,.0722]))
contrast=[]
for fg,bg in [('#202823','#f4f3ed'),('#59655b','#f4f3ed'),('#ffffff','#244ce8'),('#eef4e8','#153f38'),('#202823','#dce0ff'),('#202823','#f58a70'),('#bed0c4','#202e2b')]:
    a,b=sorted([luminance(fg),luminance(bg)]);ratio=(b+.05)/(a+.05);assert ratio>=4.5
    contrast.append({'foreground':fg,'background':bg,'ratio':round(ratio,2)})
(out/'contrast.json').write_text(json.dumps(contrast,indent=2))
print(json.dumps({'preservation':preservation,'outsideScope':pages,'performance':performance,'videos':videos,'contrast':contrast},indent=2))

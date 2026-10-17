from pathlib import Path
import json,hashlib,subprocess,re
from PIL import Image,ImageDraw
import cv2

root=Path(__file__).resolve().parents[1];out=root/'output/playwright/atelier'
before=json.loads((root/'output/checkpoints/design-intelligence-before-2026-10-13-185004-manifest.json').read_text())
changed=[];missing=[];same=0
for name,digest in before['files'].items():
    path=root/name
    if not path.is_file():missing.append(name)
    elif hashlib.sha256(path.read_bytes()).hexdigest()==digest:same+=1
    else:changed.append(name)
allowed={'preview/brand.css','preview/brand.test.mjs','preview/main.tsx','preview/LightPortfolio.tsx','preview/ProfileSections.tsx','design-system/hashem-portfolio-v2/MASTER.md','design-qa.md','docs/design/PROJECT-HANDOFF.md'}
assert not missing and set(changed)<=allowed,(changed,missing)
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root).decode().strip();assert head==before['head']
preservation={'baseline':len(before['files']),'unchanged':same,'changed':changed,'missing':missing,'head':head,'factsMediaDependenciesUnchanged':True}
(out/'source-preservation.json').write_text(json.dumps(preservation,indent=2))
for width in [1366,390]:
    source=Image.open(out/f'source-{width}.png');actual=Image.open(out/f'final-about-en-{width}.png');assert source.size==actual.size
    pair=Image.new('RGB',(2*width,actual.height));pair.paste(source,(0,0));pair.paste(actual,(width,0));pair.save(out/f'comparison-about-{width}.png')
    bounds=(0,110,width,620 if width==1366 else 760);a=source.crop(bounds);b=actual.crop(bounds);pair=Image.new('RGB',(width*2,a.height));pair.paste(a,(0,0));pair.paste(b,(width,0));pair.save(out/f'comparison-detail-{width}.png')

performance=[]
for mode in ['laptop','mobile','cpu4']:
    text='\n'.join(x.get('text','') for x in json.loads((out/f'atelier-final-{mode}-probe.json').read_text())['content'])
    probe=json.loads(re.search(r'```json\s*([\s\S]*?)\s*```',text).group(1))['probe']
    frames=sorted(f['gap'] for f in probe['frames'] if f.get('state')=='running' and f['gap']>0)
    performance.append({'mode':mode,'lcp':probe['lcp'][-1]['start'],'cls':sum(probe['layout']),'introFrameMax':max(frames),'introFrameP95':frames[int(len(frames)*.95)],'longTasks':probe['tasks']})
(out/'performance-summary.json').write_text(json.dumps(performance,indent=2))
videos=[]
for path in sorted((out/'videos').glob('atelier-tour-*.webm')):
    cap=cv2.VideoCapture(str(path));assert cap.isOpened()
    fps=cap.get(cv2.CAP_PROP_FPS);frames=cap.get(cv2.CAP_PROP_FRAME_COUNT);duration=frames/fps
    width=int(cap.get(cv2.CAP_PROP_FRAME_WIDTH));height=int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    sheet=Image.new('RGB',(1600,810),'#11171a');draw=ImageDraw.Draw(sheet)
    for index,fraction in enumerate([.04,.07,.10,.14,.20,.25,.32,.40,.48,.54,.60,.66,.72,.84,.95]):
        t=duration*fraction;cap.set(cv2.CAP_PROP_POS_MSEC,t*1000);ok,frame=cap.read();assert ok,(path,t)
        image=Image.fromarray(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB));image.thumbnail((320,243));x=index%5*320;y=index//5*270
        sheet.paste(image,(x+(320-image.width)//2,y+25));draw.text((x+10,y+7),f'{t:.2f}s / actual native video',fill='#cdb58b')
    cap.release();sheet.save(out/(path.stem+'-frames.jpg'),quality=90)
    videos.append({'path':path.relative_to(root).as_posix(),'width':width,'height':height,'fps':fps,'frames':frames,'duration':duration,'bytes':path.stat().st_size})
assert len(videos)==2
(out/'recording-metadata.json').write_text(json.dumps(videos,indent=2))
def luminance(color):
    rgb=[int(color[i:i+2],16)/255 for i in [1,3,5]];rgb=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb]
    return sum(a*b for a,b in zip(rgb,[.2126,.7152,.0722]))
ratios=[]
for foreground,background in [('#f1eee7','#11171a'),('#b2b7b5','#1a2327'),('#17242b','#cdb58b'),('#f1eee7','#223a3d'),('#475153','#e9e0d0'),('#795a33','#e9e0d0'),('#f1eee7','#0b0f12')]:
    a,b=sorted([luminance(foreground),luminance(background)]);ratio=(b+.05)/(a+.05);assert ratio>=4.5
    ratios.append({'fg':foreground,'bg':background,'ratio':round(ratio,2)})
(out/'contrast.json').write_text(json.dumps(ratios,indent=2))
print(json.dumps({'preservation':preservation,'performance':performance,'videos':videos,'contrast':ratios},indent=2))

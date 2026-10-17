from pathlib import Path
import hashlib,json,re,gzip
import cv2
from PIL import Image,ImageDraw

root=Path(__file__).resolve().parents[1]
out=root/'output/playwright/homepage-redesign'
before=json.loads((root/'output/checkpoints/design-intelligence-before-2026-10-13-162739-manifest.json').read_text())
changed=[];missing=[];same=0
for name,digest in before['files'].items():
    source=root/name
    if not source.exists(): missing.append(name)
    elif hashlib.sha256(source.read_bytes()).hexdigest()==digest: same+=1
    else: changed.append(name)
preservation={'baseline':len(before['files']),'unchanged':same,'changed':changed,'missing':missing}
assert not missing
assert not any(name.startswith(('data/','content/','public/')) for name in changed)
(out/'source-preservation.json').write_text(json.dumps(preservation,indent=2))

videos=[]
for path in sorted((out/'videos').glob('home-*.webm')):
    cap=cv2.VideoCapture(str(path));assert cap.isOpened(),path
    fps=cap.get(cv2.CAP_PROP_FPS);frames=cap.get(cv2.CAP_PROP_FRAME_COUNT)
    width=int(cap.get(cv2.CAP_PROP_FRAME_WIDTH));height=int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    sheet=Image.new('RGB',(5*320,3*270),'#171a18');draw=ImageDraw.Draw(sheet)
    for index,t in enumerate([.15,.3,.45,.6,.8,1,1.25,1.5,2,2.5,3,4,5,7,10]):
        cap.set(cv2.CAP_PROP_POS_MSEC,t*1000);ok,frame=cap.read();assert ok,(path,t)
        img=Image.fromarray(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB));img.thumbnail((320,243))
        x=index%5*320;y=index//5*270
        sheet.paste(img,(x+(320-img.width)//2,y+25));draw.text((x+9,y+7),f'{t:.2f}s — actual browser video',fill='#dbf879')
    cap.release();sheet.save(out/(path.stem+'-frames.jpg'),quality=90)
    videos.append({'path':str(path.relative_to(root)),'width':width,'height':height,'fps':fps,'frames':frames,'duration':frames/fps,'bytes':path.stat().st_size})
assert len(videos)==4
(out/'recording-metadata.json').write_text(json.dumps(videos,indent=2))

performance=[]
for path in sorted(out.glob('performance-final-*-probe.json')):
    if 'scroll' in path.name: continue
    text='\n'.join(x.get('text','') for x in json.loads(path.read_text())['content'])
    data=json.loads(re.search(r'```json\s*([\s\S]*?)\s*```',text).group(1));probe=data['probe']
    frames=sorted(f['gap'] for f in probe['frames'] if f.get('state')=='running' and f['gap']>0)
    row={'mode':path.name.split('-')[-2],'lcp':probe['lcp'][-1]['start'],'cls':sum(probe['layout']),'introFrameMax':max(frames),'introFrameP95':frames[int(len(frames)*.95)],'longTasks':probe['tasks']}
    performance.append(row)
(out/'performance-summary.json').write_text(json.dumps(performance,indent=2))

for width in [1366,390]:
    source=Image.open(out/f'source-{width}.png');actual=Image.open(out/f'final-en-{width}.png')
    assert source.size==actual.size
    pair=Image.new('RGB',(width*2,source.height));pair.paste(source,(0,0));pair.paste(actual,(width,0));pair.save(out/f'comparison-final-{width}.png')
    # A focused exact-density typography/media region, rendered together.
    bounds=(0,100,width,550 if width==1366 else 500)
    a=source.crop(bounds);b=actual.crop(bounds);detail=Image.new('RGB',(width*2,a.height));detail.paste(a,(0,0));detail.paste(b,(width,0));detail.save(out/f'comparison-detail-{width}.png')
print(json.dumps({'preservation':preservation,'videos':videos,'performance':performance},indent=2))

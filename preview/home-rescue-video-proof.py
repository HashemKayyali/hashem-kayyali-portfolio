from pathlib import Path
import cv2
from PIL import Image,ImageDraw
out=Path('output/playwright/home-rescue')
times=[.4,.6,.8,1,1.2,1.4,1.6,1.8,2,2.4]
for scenario in ['en-1440-home','en-390-home','ar-390-home','throttled-mobile']:
    sheet=Image.new('RGB',(5*384,4*285),'#fcfaf9');draw=ImageDraw.Draw(sheet)
    for row,phase in enumerate(['before','final']):
        cap=cv2.VideoCapture(str(out/f'{phase}-{scenario}.webm'))
        if not cap.isOpened(): raise RuntimeError(f'Missing recording {phase}-{scenario}')
        for index,t in enumerate(times):
            cap.set(cv2.CAP_PROP_POS_MSEC,t*1000);ok,frame=cap.read()
            if not ok:raise RuntimeError(f'Cannot decode frame {t}')
            img=Image.fromarray(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB));img.thumbnail((384,254))
            x=(index%5)*384;y=(row*2+index//5)*285
            sheet.paste(img,(x+(384-img.width)//2,y+26));draw.text((x+10,y+7),f'{phase} / {t:.1f}s from recording start',fill='#58152d')
        cap.release()
    sheet.save(out/f'portrait-frames-{scenario}.jpg',quality=92)
print('Actual recording frames extracted; no generated motion or retiming.')

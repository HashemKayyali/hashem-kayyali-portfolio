from pathlib import Path
from PIL import Image, ImageDraw
root = Path(__file__).resolve().parent.parent
sources = []
for folder in ['bike-tower', 'the-terminal-nfc', 'eventies']:
    sources.extend(sorted((root/'public/projects'/folder).glob('*.webp')))
sources.extend(sorted((root/'public/images').glob('*.webp')))
out = root/'output/playwright/motion-lab'
out.mkdir(parents=True,exist_ok=True)
sheet = Image.new('RGB',(1200, ((len(sources)+2)//3)*285),'#fcfaf9')
draw = ImageDraw.Draw(sheet)
manifest=[]
for i,path in enumerate(sources):
    image=Image.open(path)
    manifest.append({'path':str(path.relative_to(root)).replace('\\','/'),'width':image.width,'height':image.height,'bytes':path.stat().st_size,'classification':'existing project evidence; privacy review before new use'})
    image.thumbnail((380,245))
    x=(i%3)*400;y=(i//3)*285
    sheet.paste(image,(x+(380-image.width)//2,y))
    draw.text((x+8,y+250),f'{path.parent.name}/{path.name}',fill='#2d2428')
sheet.save(out/'source-inventory.jpg',quality=90)
import json
(out/'source-inventory.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
print(out/'source-inventory.jpg')

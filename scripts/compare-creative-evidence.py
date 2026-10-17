"""Compose existing browser captures for QA; does not modify website assets."""
from PIL import Image
from pathlib import Path
root=Path('output/playwright/creative-director')
def compare(first,second,target,crop=None):
    images=[Image.open(root/name).convert('RGB') for name in (first,second)]
    if crop: images=[image.crop(crop) for image in images]
    canvas=Image.new('RGB',(sum(i.width for i in images),max(i.height for i in images)), '#FCFAF9')
    position=0
    for image in images: canvas.paste(image,(position,0)); position+=image.width
    canvas.save(root/target)
compare('source-board-1366.png','lab-first-en-home-1366.png','source-implementation-first-1366.png')
compare('source-board-1366.png','lab-first-en-home-1366.png','source-implementation-first-1366-focus.png',(0,90,1366,655))
compare('source-board-390.png','lab-en-home-390.png','source-implementation-first-390.png')
for locale in ('en','ar'):
    for width in (1280,1366,1440,1536,1920,2560,390,320):
        for page in ('home','gallery'):
            compare(f'before-{locale}-{page}-{width}.png',f'approved-{locale}-{page}-{width}.png',f'approved-comparison-{locale}-{page}-{width}.png')
print('35 full comparisons plus focused desktop comparison saved')

from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import subprocess
from PIL import Image,ImageOps,ImageDraw
root=Path(__file__).parent
out=root/'tmp/review'
out.mkdir(parents=True,exist_ok=True)
pop=Path('C:/Users/Rani/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe')
pages=[2,4,5,9,11,16,18,21,24,25,29,30,34,36,38,40,41,42,48,50,52,56,58,59,60,62,64,68,69,70,77,78,81,82,83,85,88,92,93,96,97,98,99,100,101,104,105,107,111,113,117,118,122,124,125,127,128,133,135,137,138,139,144,149,150]
def render(n):
    target=out/f'p3-{n}'
    subprocess.run([str(pop),'-f',str(n),'-l',str(n),'-scale-to','1800','-singlefile','-png',str(root/'papers/paper-3.pdf'),str(target)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
with ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(render,pages))
for j in range(0,len(pages),4):
    sheet=Image.new('RGB',(1600,2100),'#dddddd')
    draw=ImageDraw.Draw(sheet)
    for k,n in enumerate(pages[j:j+4]):
        im=Image.open(out/f'p3-{n}.png').convert('RGB')
        im.thumbnail((780,1000))
        x=(k%2)*800;y=(k//2)*1050
        draw.text((x+10,y+8),f'PAPER 3 - PDF PAGE {n}',fill='black')
        sheet.paste(im,(x+(800-im.width)//2,y+35))
    sheet.save(out/f'sheet-{j//4+1:02}.jpg',quality=90)
print('Rendered',len(pages),'pages for review')

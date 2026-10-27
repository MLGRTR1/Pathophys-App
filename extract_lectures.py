import json,shutil
from pathlib import Path
from pypdf import PdfReader

root=Path(__file__).parent
out=root/'lectures'
out.mkdir(exist_ok=True)
names=[('acid-base','E5 Acid Base Disturbances ZN.pdf'),('dka','E5 Diabetic ketoacidosis ZN.pdf'),('edema','E4 Edema + infusion therapy +cerebral edema ZN.pdf'),('sodium-potassium','E4 Disorders of Na, K balance ZN.pdf'),('hydration','E4 Hypertonic and hypotonic dehydration and hyperhydration ZN.pdf'),('nutrition','P4 Nutritional status and Malassimilation syndromes ZN.pdf'),('vitamins-lipids-gout','P4 Disturbances of vitamin uptake, Pathophysiology of lipid and purine metabolism and Gout ZN.pdf'),('nutrition-2025','KS_GM_nutrition_2025 (1).pdf'),('digestive','Pathophysiology of the digestive system ZN.pdf')]
docs=[]
for slug,name in names:
    src=Path('C:/Users/Rani/Downloads')/name
    pages=[p.extract_text() for p in PdfReader(src).pages]
    shutil.copyfile(src,out/(slug+'.pdf'))
    (out/(slug+'.txt')).write_text('\n\n'.join(f'=== PDF PAGE {i} ===\n{p}' for i,p in enumerate(pages,1)),encoding='utf-8')
    docs.append({'id':slug,'title':name.removesuffix('.pdf'),'file':'/lectures/'+slug+'.pdf','pages':[{'page':i,'text':p} for i,p in enumerate(pages,1)]})
    print(slug,len(pages),sum(len(p) for p in pages),flush=True)
(out/'lectures.json').write_text(json.dumps(docs,ensure_ascii=False),encoding='utf-8')
(out/'lectures.js').write_text('window.LECTURES = '+json.dumps(docs,ensure_ascii=False)+';',encoding='utf-8')

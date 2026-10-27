"""Preserve the PDF text layers as page-addressable, explicitly unverified drafts."""
import json,re
from pathlib import Path

root=Path(__file__).parent
out=root/'papers'
out.mkdir(exist_ok=True)
sources=[]
for i in (1,2,3):
    pages=json.loads((root/f'tmp/papers/paper{i}-pages.json').read_text(encoding='utf-8'))
    lines=[f'# Paper {i}: OCR draft', '', 'Status: extracted from the PDF text layer; not fully visually verified.', 'Question numbers may repeat. Source page numbers identify each occurrence.', 'Missing or unreadable text is [?]. Checkbox state is unknown unless explicitly recorded in a visually checked transcription. A student response is not an answer key.', '']
    for n,text in enumerate(pages,1):
        text=text.replace('\ufffd','[?]')
        lines += [f'## Source page {n}', '', f'### Question [?]', '', 'Original OCR text (unverified):', '', text.strip() or '[?]', '']
    name=f'paper-{i}-ocr-draft.md'
    (out/name).write_text('\n'.join(lines),encoding='utf-8')
    sources.append({'id':f'paper-{i}','title':f'Paper {i}','file':f'/papers/paper-{i}.pdf','transcript':f'/papers/{name}','pages':[{'page':n,'text':t.replace('\ufffd','[?]')} for n,t in enumerate(pages,1)]})
(out/'sources.js').write_text('window.PAPER_SOURCES = '+json.dumps(sources,ensure_ascii=False)+';',encoding='utf-8')
print('Preserved',sum(len(s['pages']) for s in sources),'source pages')

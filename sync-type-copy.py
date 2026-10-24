"""Import the user-maintained Markdown into the local report bundle."""
from pathlib import Path
import re, json

root=Path(__file__).resolve().parent
source=root/'content/type-copy.md'
text=source.read_text(encoding='utf-8-sig')
parts=re.split(r'^## ([A-Z]{4})[｜|]\s*(.+?)\s*$',text,flags=re.M)
records={}
for i in range(1,len(parts),3):
    code,name,body=parts[i:i+3]
    blocks=[]
    for block in re.split(r'\n\s*\n',body.strip()):
        block=block.strip()
        if not block or re.match(r'^(來源|来源)：',block):continue
        if block.startswith('### '): kind,value='heading',block[4:].strip()
        elif block.startswith('>'):kind,value='quote','\n'.join(re.sub(r'^>\s?', '',line) for line in block.splitlines())
        else:kind,value='paragraph',block
        blocks.append({'kind':kind,'text':value})
    assert code not in records and len(blocks)>3,code
    records[code]={'name':name,'blocks':blocks}
expected=set('INTJ INTP ENTJ ENTP INFJ INFP ENFJ ENFP ISTJ ISFJ ESTJ ESFJ ISTP ISFP ESTP ESFP'.split())
assert set(records)==expected, set(records)^expected
module='// Imported from the user-maintained original-copy Markdown. Run sync-type-copy.py to refresh.\n'
module+='export const userTypeCopy='+json.dumps(records,ensure_ascii=False,indent=2)+';\n'
module+="export function typeCopyText(code){return userTypeCopy[code]?.blocks.map(b=>b.text).join('\\n\\n');}\n"
(root/'dist/user-type-copy.mjs').write_text(module,encoding='utf-8')
print(f'Imported {len(records)} types, {sum(len(b["text"]) for r in records.values() for b in r["blocks"])} characters')

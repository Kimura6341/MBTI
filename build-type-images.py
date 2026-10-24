"""Package authorized SVG originals for both the local and single-file site."""
from pathlib import Path
import json, base64, xml.etree.ElementTree as ET

root=Path(__file__).resolve().parent
folder=root/'dist/assets/personality'
sources=json.loads((folder/'sources.json').read_text(encoding='utf-8'))
images={}
for item in sources:
    raw=(folder/item['file']).read_bytes()
    svg=ET.fromstring(raw)
    assert svg.tag.endswith('svg'),item['file']
    assert not any(n.tag.endswith('script') for n in svg.iter()),item['file']
    images.setdefault(item['type'],{})[item['kind']]={
        'src':'data:image/svg+xml;base64,'+base64.b64encode(raw).decode(),
        'alt':item['alt'],
    }
assert len(images)==16 and all(set(v)=={'avatar','scene'} for v in images.values())
(root/'dist/type-images.mjs').write_text(
    '// Source files and URLs: assets/personality/sources.json\nexport const typeImages='
    +json.dumps(images,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print('Packaged 32 original SVG assets for 16 types')

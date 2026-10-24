"""Embed the authorized homepage SVGs in the single-file-capable module."""
from pathlib import Path
import base64, json, xml.etree.ElementTree as ET

root=Path(__file__).resolve().parent
assets={}
for name in ['hero-desktop','hero-mobile']:
    raw=(root/'dist/assets/home'/f'{name}.svg').read_bytes()
    assert ET.fromstring(raw).tag.endswith('svg')
    assets[name]='data:image/svg+xml;base64,'+base64.b64encode(raw).decode()
(root/'dist/home-assets.mjs').write_text('export const homeAssets='+json.dumps(assets,separators=(',',':'))+';\n',encoding='utf-8')

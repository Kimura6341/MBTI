"""Build two self-contained English previews from supplied public profile data."""
from pathlib import Path
import json, html, re

ROOT = Path(__file__).parent
SOURCE = Path('E:/小红书/1/16personalities_32_results')
ASSETS = ROOT / 'content' / 'enfj-assets'
esc = lambda value: html.escape(str(value), quote=True)
image_index = 0

def image(url, alt, cls=''):
    global image_index
    image_index += 1
    name = url.split('/')[-1].split('?')[0]
    asset = ASSETS / name
    if asset.exists() and asset.suffix == '.svg':
        svg = asset.read_text(encoding='utf-8-sig')
        svg = re.sub(r'<\?xml.*?\?>', '', svg, flags=re.S)
        for identifier in set(re.findall(r'\bid="([^"]+)"', svg)):
            unique = f'asset{image_index}-{identifier}'
            svg = svg.replace(f'id="{identifier}"', f'id="{unique}"')
            svg = svg.replace(f'url(#{identifier})', f'url(#{unique})')
            svg = svg.replace(f'href="#{identifier}"', f'href="#{unique}"')
        classes = set(c for group in re.findall(r'\bclass="([^"]+)"', svg) for c in group.split())
        for classname in sorted(classes, key=len, reverse=True):
            svg = re.sub(r'(?<=\.)' + re.escape(classname) + r'(?![\w-])', f'asset{image_index}-{classname}', svg)
        svg = re.sub(r'\bclass="([^"]+)"', lambda match: 'class="' + ' '.join(f'asset{image_index}-{c}' for c in match.group(1).split()) + '"', svg)
        return f'<div class="{cls}" role="img" aria-label="{esc(alt)}">{svg}</div>'
    return f'<img class="{cls}" src="{esc(url)}" alt="{esc(alt)}">'

css = '''
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:#34464d;background:#fff;font:17px/1.7 Arial,sans-serif}a{color:inherit}header{height:88px;display:flex;align-items:center;justify-content:space-between;max-width:1240px;margin:auto;padding:0 36px}.brand{font-weight:800;letter-spacing:2px;font-size:16px;text-decoration:none;display:flex;align-items:center;gap:12px}.mark{width:26px;height:26px;border-radius:50%;background:conic-gradient(#699a87 0 25%,#9282a3 0 50%,#d9ab58 0 75%,#5299b3 0);box-shadow:inset 0 0 0 7px #ffffff88}.switch{display:flex;padding:4px;background:#f4f6f5;border-radius:28px;gap:4px}.switch a{padding:6px 18px;text-decoration:none;border-radius:22px;font-size:14px}.switch a.active{background:#fff;box-shadow:0 2px 8px #243c3514;color:#397763;font-weight:bold}.hero{background:#e7f1ed;position:relative;overflow:hidden}.hero-inner{max-width:1120px;margin:auto;display:grid;grid-template-columns:1.3fr 1fr;align-items:center;min-height:490px;gap:40px;padding:50px 36px 65px}.eyebrow{font-size:12px;letter-spacing:2.5px;font-weight:700;color:#527766;margin:0 0 12px}.hero h1{font-size:70px;line-height:1.08;letter-spacing:-3px;margin:0 0 12px;color:#2c6553}.code{font-size:24px;font-weight:700;color:#53816c;margin-bottom:23px}.lead{font-size:20px;line-height:1.65;max-width:590px;margin:0}.avatar{height:350px;text-align:center;position:relative}.avatar:before{content:'';position:absolute;background:#d6e7de;border-radius:50%;width:310px;height:310px;left:50%;top:20px;transform:translateX(-50%)}.avatar svg,.avatar img{height:100%;width:100%;position:relative}.jump{display:inline-block;margin-top:25px;background:#397f68;color:#fff;padding:11px 24px;border-radius:28px;text-decoration:none;font-size:15px;font-weight:700}.notice{max-width:1050px;margin:28px auto 0;padding:14px 20px;border:1px solid #e2e7e4;border-radius:10px;font-size:13px;color:#6d7b7a;background:#fafcfb}.content{max-width:1050px;margin:auto;padding:48px 0 70px}.section-heading{display:flex;align-items:baseline;gap:18px;margin-bottom:30px}.number{font-size:27px;font-weight:300;color:#a9bdb3}.section-heading h2{font-size:29px;letter-spacing:-.6px;margin:0}.traits{display:grid;grid-template-columns:1fr 1fr;gap:0 55px}.trait{padding:0 0 28px;margin-bottom:28px;border-bottom:1px solid #edf0ef}.trait:last-child{grid-column:1/-1;width:calc(50% - 28px)}.trait-top{display:flex;justify-content:space-between;align-items:center;font-size:14px;margin-bottom:13px}.trait-top strong{font-size:18px;color:var(--tone)}.bar{height:10px;background:var(--pale);border-radius:10px;overflow:hidden}.bar span{display:block;width:var(--pct);height:100%;background:var(--tone);border-radius:10px}.ends{display:flex;justify-content:space-between;font-size:11px;color:#8a9699;margin-top:7px}.trait p{font-size:15px;line-height:1.75;margin:17px 0 0}.overview{margin-top:28px}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.card{background:#f5f8f6;padding:28px;border-radius:12px}.card h3{font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#798a82;margin:0 0 8px}.card h4{font-size:24px;line-height:1.3;margin:15px 0;color:#356d56}.card p{font-size:15px;line-height:1.8;margin:0}.card a{color:#397f68;text-underline-offset:3px}.badge{height:105px;margin-bottom:20px}.badge svg,.badge img{height:100%;width:100%;object-fit:contain}.details{margin-top:60px;border-top:1px solid #e6ece8;padding-top:45px;display:grid;grid-template-columns:220px 1fr;gap:50px;align-items:center}.detail-art{height:170px}.detail-art svg,.detail-art img{height:100%;width:100%;object-fit:contain}.details h2{font-size:28px;line-height:1.3;margin:0 0 16px;color:#3c715d}.details p{margin:0;font-size:17px}.footer{border-top:1px solid #edf0ef;padding:25px 36px;color:#8a9699;font-size:12px;display:flex;justify-content:space-between;gap:20px}.footer a{text-underline-offset:3px}@media(max-width:1120px){.content,.notice{margin-left:36px;margin-right:36px}}@media(max-width:700px){header{padding:0 20px;height:76px}.brand{font-size:12px;letter-spacing:1px}.switch a{padding:5px 11px}.hero-inner{display:flex;flex-direction:column-reverse;gap:15px;padding:25px 24px 42px;text-align:center}.avatar{height:220px;width:100%}.avatar:before{width:210px;height:210px;top:0}.hero h1{font-size:48px;letter-spacing:-2px}.code{font-size:21px}.lead{font-size:18px}.content{padding-top:35px}.content,.notice{margin-left:22px;margin-right:22px}.traits,.cards{grid-template-columns:1fr;gap:0}.trait:last-child{width:100%;grid-column:auto}.card{margin-bottom:18px}.details{grid-template-columns:1fr;gap:22px}.detail-art{height:160px}.section-heading h2{font-size:25px}.footer{padding:24px;flex-direction:column;gap:5px}}
'''

for code in ['enfj-a', 'enfj-t']:
    data = json.loads((SOURCE/code/'data.json').read_text(encoding='utf-8-sig'))
    (ROOT/'content').mkdir(exist_ok=True)
    (ROOT/'content'/f'{code}.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    p=data['personality']; detail=p['details']; cards=detail['cards']; variant=p['variant'].title()
    traits=[]
    colors={'blue':('#4596b4','#e4f0f5'),'yellow':('#d9a342','#faf2e2'),'green':('#65a68e','#e7f1ed'),'purple':('#9276ad','#f0eaf5'),'red':('#cb7c7c','#f8eaea')}
    for t in detail['traits']:
        color,pale=colors[t['color']]
        traits.append(f'''<article class="trait" style="--tone:{color};--pale:{pale};--pct:{t['pct']}%"><div class="trait-top"><span>{esc(t['label'])}</span><strong>{t['pct']}% {esc(t['trait'])}</strong></div><div class="bar" role="img" aria-label="Example value: {t['pct']}% {esc(t['trait'])}"><span></span></div><div class="ends"><span>{esc(t['trait'])}</span><span>{esc(next(x for x in t['titles'] if x!=t['trait']))}</span></div><p>{esc(t['description'])}</p></article>''')
    card_html=[]
    for key,label in [('personality','Personality'),('role','Role'),('strategy','Strategy')]:
        c=cards[key]
        title=p['personalityShort'] if key=='personality' else p[key]
        card_html.append(f'<article class="card">{image(c["imageSrc"],c["imageAlt"],"badge")}<h3>{label}</h3><h4>{esc(title)}</h4><p>{c["snippetHtml"]}</p></article>')
    switches=''.join(f'<a class="{"active" if x==code else ""}" {"aria-current=page" if x==code else ""} href="./{x}.html">{x[-1].upper()}</a>' for x in ['enfj-a','enfj-t'])
    identity=detail['traits'][-1]
    page=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="{esc(p['personalityNice'])} — English profile preview"><title>{esc(p['personalityNice'])} | Persona Spectrum</title><style>{css}</style></head><body><header><a class="brand" href="./index.html"><span class="mark" aria-hidden="true"></span>PERSONA SPECTRUM</a><nav class="switch" aria-label="ENFJ variant">{switches}</nav></header><main><section class="hero"><div class="hero-inner"><div><p class="eyebrow">YOUR PERSONALITY PROFILE</p><h1>Protagonist</h1><div class="code">ENFJ-{code[-1].upper()} · {variant}</div><p class="lead">{cards['personality']['snippetHtml']}</p><a class="jump" href="#traits">Explore this personality ↓</a></div>{image(cards['personality']['imageSrc'],cards['personality']['imageAlt'],'avatar')}</div></section><aside class="notice"><strong>Profile preview.</strong> The percentages below are example values supplied with this profile, not a completed assessment. ENFJ-A and ENFJ-T share their core type; their Identity trait and Strategy differ.</aside><div class="content"><section id="traits"><div class="section-heading"><span class="number">01</span><h2>Personality traits</h2></div><div class="traits">{''.join(traits)}</div></section><section class="overview"><div class="section-heading"><span class="number">02</span><h2>The bigger picture</h2></div><div class="cards">{''.join(card_html)}</div></section><section class="details">{image(identity['imageSrc'],identity['imageAlt'],'detail-art')}<div><p class="eyebrow">THE {variant.upper()} IDENTITY</p><h2>{'Self-assured and even-tempered' if variant=='Assertive' else 'Driven to grow and improve'}</h2><p>{esc(identity['description'])}</p></div></section></div></main><footer class="footer"><span>Persona Spectrum · English profile preview</span><a href="{esc(p['personalityLink'])}" target="_blank" rel="noopener">Source: 16Personalities ↗</a></footer></body></html>'''
    (ROOT/'dist'/f'{code}.html').write_text(page,encoding='utf-8')
    print(code, len(page), 'characters')

"""Adapt the supplied reference homepage layout to this site's actual features."""
from pathlib import Path
import re,json
ROOT=Path(__file__).parent
REF=ROOT/'../../outputs/home-reference'
source=(REF/'home.html').read_text(encoding='utf-8')
markup=re.search(r'<main\b.*?</main>',source,re.S).group()
markup=re.sub(r'^<main\b','<div',markup).replace('</main>','</div>')
markup=re.sub(r'\s+v-[\w:.-]+(?:="[^"]*")?','',markup)
markup=markup.replace('Only 10 minutes to get a “freakishly accurate” description of who you are and why you do things the way you do.','Only 10 minutes to explore who you are and why you do things the way you do.')
metrics=iter([('100K+','Tests taken today'),('200M+','Tests taken in United States'),('1.58B+','Total tests taken'),('91.2%','Accuracy rating')])
def metric(match):
 number,label=next(metrics)
 return re.sub(r'(<dd\b[^>]*>).*?(</dd>)',lambda m:m[1]+label+m[2],re.sub(r'(<dt\b[^>]*>).*?(</dt>)',lambda m:m[1]+number+m[2],match[0],flags=re.S),flags=re.S)
markup=re.sub(r'<dt\b.*?</dd>',metric,markup,flags=re.S)
markup=re.sub(r'<el-badge\b([^>]*)>(.*?)</el-badge>',lambda m:'<span class="persona-home-badge">'+m[2]+'</span>',markup,flags=re.S)
def button(match):
 label=re.search(r'text="([^"]+)"',match[1]).group(1)
 if label=='Take the test':return '' # The server-rendered fallback already supplies this button.
 return '<a class="persona-home-button" href="#test">'+'Take the test'+' <span aria-hidden="true">→</span></a>'
markup=re.sub(r'<el-button\b([^>]*)>.*?</el-button>',button,markup,flags=re.S)

# Reuse the hero CTA for every assessment entry point, including its SVG arrow.
cta_pattern=r'<a\b[^>]*>.*?</a>'
def is_test_cta(anchor):
 return re.sub(r'<[^>]+>', '', anchor).strip().startswith('Take the test')
primary_cta=next(a for a in re.findall(cta_pattern,markup,re.S) if is_test_cta(a))
def unify_test_cta(match):
 anchor=match[0]
 if not is_test_cta(anchor):return anchor
 # Preserve section spacing separately from the shared button appearance.
 spacing=' tw-mb-40 medium:tw-mb-60 huge:tw-mb-40' if 'tw-mb-40' in anchor else ''
 return primary_cta.replace('button--icon-rt', 'persona-home-button button--icon-rt'+spacing)
markup=re.sub(cta_pattern,unify_test_cta,markup,flags=re.S)

markup=markup.replace('Understand your team better with our Team Assessments. Improve communication, create harmony, and help team members develop their individual strengths. Works for teams of all sizes.','Discover how different personalities approach communication, decisions, and collaboration. Explore the reports together to understand each other’s preferences, strengths, and working styles.')
markup=markup.replace('Curious how accurate we are about you?','Ready to discover your personality type?')
replacements={
 'https://www.16personalities.com/free-personality-test':'#test',
 'https://www.16personalities.com/personality-types':'#test',
 'https://www.16personalities.com/static/images/homepage/home-page-hero-illustration.svg':'__HERO_DESKTOP__',
 'https://www.16personalities.com/static/images/homepage/home-page-hero-illustration-phone.svg':'__HERO_MOBILE__',
 'https://www.16personalities.com/static/images/teams/communication.svg?v=1':'__COMMUNICATION__',
 'https://www.16personalities.com/static/images/teams/type-interactions.svg?v=1':'__INTERACTIONS__',
 'https://www.16personalities.com/static/images/homepage/home-page-footer-illustration.svg':'__FOOTER_DESKTOP__',
 'https://www.16personalities.com/static/images/homepage/home-page-footer-illustration-phone.svg':'__FOOTER_MOBILE__',
}
for old,new in replacements.items():markup=markup.replace(old,new)
carousel=''
markup=re.sub(r'<section id="testimonials".*?</section>',carousel,markup,flags=re.S)
assert 'Benny' not in markup and '91.2%' in markup
print('Remaining original URLs:',re.findall(r'https://www\.16personalities\.com/[^\s\"<>]+',markup))
module='''import {homeAssets} from './home-assets.mjs';
import {homeIllustrations} from './home-illustrations.mjs';
export function englishHomeMarkup(typeCards){
 let markup=REFERENCE;
 const assets={'__HERO_DESKTOP__':homeAssets['hero-desktop'],'__HERO_MOBILE__':homeAssets['hero-mobile'],'__COMMUNICATION__':homeIllustrations.communication,'__INTERACTIONS__':homeIllustrations.interactions,'__FOOTER_DESKTOP__':homeIllustrations['footer-desktop'],'__FOOTER_MOBILE__':homeIllustrations['footer-mobile'],'__TYPE_CARDS__':typeCards};
 for(const [key,value] of Object.entries(assets))markup=markup.replaceAll(key,value);
 return markup;
}
export function bindEnglishHome(root){
 const track=root.querySelector('.persona-type-carousel');
 root.querySelectorAll('[data-carousel]').forEach(button=>button.addEventListener('click',()=>track.scrollBy({left:(button.dataset.carousel==='next'?1:-1)*track.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})));
}
'''.replace('REFERENCE',json.dumps(markup,ensure_ascii=False))
(ROOT/'dist/english-home.mjs').write_text(module,encoding='utf-8')
css=(REF/'fonts.css').read_text(encoding='utf-8')+'\n'+(REF/'core.css').read_text(encoding='utf-8')+'\n'+(REF/'homepage.css').read_text(encoding='utf-8')
css+='''
body.homepage-active{font-family:Inter,Arial,sans-serif;font-size:18px;line-height:1.5;color:#343c4b}

.homepage-active .q-hm h1{font-family:'Red Hat Display',Inter,sans-serif}.homepage-active>footer{font-family:Inter,Arial,sans-serif}
.persona-home-badge{display:inline-flex;align-items:center;min-height:28px;font:600 12px/1.4 Inter,Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;padding:5px 12px;background:#e6f0e9;color:#476a55;border-radius:5px;margin-bottom:12px}
.homepage-active .persona-home-button{font-family:Inter,Arial,sans-serif}
.persona-type-section{position:relative;background:#f5f5f6;padding:90px 0 40px;text-align:center;margin-top:70px}.persona-type-section h2{margin:10px 0 15px}.persona-type-section>.sp-wrap>p{margin:0 auto 40px;max-width:650px}.persona-type-shape{position:absolute;top:-35px;left:0;right:0;height:36px;background:#f5f5f6;clip-path:polygon(0 100%,0 35%,28% 80%,70% 0,100% 100%)}
.persona-type-carousel{display:flex;gap:24px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}.persona-type-carousel::-webkit-scrollbar{display:none}.persona-type-carousel .type-card{flex:0 0 calc((100% - 48px)/3);scroll-snap-align:start;background:white;border-radius:10px;overflow:hidden;padding:25px 0 0}.persona-type-carousel .type-card>a{display:block;color:#343c48;text-decoration:none}.persona-type-carousel img{width:100%;height:160px;object-fit:contain;margin-bottom:15px}.persona-type-carousel strong{display:block;font-size:21px}.persona-type-carousel .type-card>a>span{display:block;margin:6px 0 22px;color:#82909a;font-size:13px}.persona-type-carousel .variant-links{display:flex;border-top:1px solid #e5e5ea}.persona-type-carousel .variant-links a{flex:1;color:#88649c;text-decoration:none;padding:14px 6px;font-size:12px}.persona-type-carousel .variant-links a+a{border-left:1px solid #e5e5ea}.persona-type-carousel a:hover{color:#644676}.persona-carousel-controls{display:flex;gap:12px;justify-content:center;margin:30px 0 15px}.persona-carousel-controls button{width:44px;height:44px;border:1px solid #d8d9dc;background:white;color:#88649c;border-radius:50%;font-size:23px;cursor:pointer}
.homepage-active .hero__text h1:focus{outline:none}
@media(max-width:767px){.persona-type-section{padding:50px 0 30px}.persona-type-carousel{gap:15px}.persona-type-carousel .type-card{flex-basis:100%}.persona-type-section h2{font-size:28px}.persona-type-section>.sp-wrap>p{font-size:16px}.homepage-active>footer{padding:24px 18px;gap:12px;flex-wrap:wrap}}
'''
(ROOT/'dist/home-reference.css').write_text(css,encoding='utf-8')
print('Homepage markup and original responsive styles generated.')

from pathlib import Path
from html.parser import HTMLParser
import json,csv,re

ROOT=Path(__file__).parent
SOURCE=Path('E:/小红书/1/full')
class Node:
 def __init__(self,tag='',attrs=(),parent=None):self.tag=tag;self.attrs=dict(attrs);self.children=[];self.parent=parent
 def text(self):return ''.join(c.text() if isinstance(c,Node) else c for c in self.children).strip()
 def walk(self):
  yield self
  for c in self.children:
   if isinstance(c,Node):yield from c.walk()
class Parser(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.root=Node();self.current=self.root
 def handle_starttag(self,t,a):
  node=Node(t,a,self.current);self.current.children.append(node)
  if t not in {'img','source','meta','link','input','br','hr','path','circle','use','rect','ellipse','polygon','polyline','line','stop','wbr','area','base','embed','param','track'}:self.current=node
 def handle_startendtag(self,t,a):self.current.children.append(Node(t,a,self.current))
 def handle_endtag(self,t):
  n=self.current
  while n.parent:
   if n.tag==t:self.current=n.parent;return
   n=n.parent
 def handle_data(self,d):self.current.children.append(d)

reports={}
for f in sorted(SOURCE.glob('*-A-*.html')):
 parser=Parser();parser.feed(f.read_text(encoding='utf-8-sig'));nodes=list(parser.root.walk())
 code=f.name[:4];name=f.stem.split('-',2)[2];chapters=[]
 for section_id,title in [('intro','Personality Traits'),('career','Your Career Path'),('personal-growth','Your Personal Growth'),('relationships','Your Relationships')]:
  section=next(n for n in nodes if n.attrs.get('id')==section_id);children=list(section.walk());paras=[];groups={'Your Strengths':[],'Your Weaknesses':[]};group=None;before_subhead=True
  for n in children:
   if n.tag=='h3':
    group=n.text();before_subhead=False
   if before_subhead and n.tag=='p' and len(n.text())>140:
    if section_id=='intro' and n.text().startswith('These five scales'):before_subhead=False
    else:paras.append(n.text())
   if 'sp-traitexpression' in n.attrs.get('class','').split() and group in groups:
    ps=[x.text() for x in n.walk() if x.tag=='p']
    if len(ps)>=2:groups[group].append({'title':ps[0],'text':ps[1]})
  imgs=[n.attrs for n in children if n.tag=='img' and n.attrs.get('src')]
  art=next((i for i in imgs if i.get('src','').startswith('data:image') and ('section' in i.get('alt','').lower() or 'illustration' in i.get('alt','').lower())),None)
  if art is None:art=next((i for i in imgs if len(i.get('src',''))>3000),None)
  chapters.append({'id':section_id,'title':title,'paragraphs':list(dict.fromkeys(paras)),'strengths':groups['Your Strengths'],'weaknesses':groups['Your Weaknesses'],'image':art})
 header=next((n.attrs for n in nodes if n.tag=='img' and 'types/headers/' in n.attrs.get('src','')),None)
 reports[code]={'code':code,'name':name,'sourceVariant':'A','chapters':chapters,'hero':header}
 print(code,[(c['id'],len(c['paragraphs']),len(c['strengths']),len(c['weaknesses'])) for c in chapters])
 assert len(chapters[1]['paragraphs'])>=2 and len(chapters[1]['strengths'])>=4, f'Incomplete report: {code}'
assert len(reports)==16
rows=list(csv.DictReader(Path('E:/小红书/1/16personalities_questions.csv').open(encoding='utf-8-sig')))
assert len(rows)==60 and len({r['order'] for r in rows})==60
questions=[{'id':'en-'+r['order'],'order':int(r['order']),'agreePole':r['agree_indicates'][0],'weight':1,'text':r['question'],'axis':r['axis'],'direction':1 if r['agree_indicates'][0]==r['axis'][0] else -1} for r in rows]
(ROOT/'dist/english-questions.mjs').write_text('export const englishQuestions='+json.dumps(questions,ensure_ascii=False)+';\n',encoding='utf-8')
(ROOT/'dist/reports').mkdir(exist_ok=True)
for code,report in reports.items():(ROOT/f'dist/reports/{code}.json').write_text(json.dumps(report,ensure_ascii=False),encoding='utf-8')
(ROOT/'dist/english-types.mjs').write_text('export const englishTypes='+json.dumps({k:{'name':v['name']} for k,v in reports.items()})+';\n',encoding='utf-8')

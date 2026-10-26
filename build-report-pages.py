from pathlib import Path
import re,html,hashlib,json
ROOT=Path(__file__).parent
source=Path('E:/小红书/1/full')
delivery_file=ROOT/'content/report-delivery.json'
endpoint=json.loads(delivery_file.read_text(encoding='utf-8')).get('endpoint','') if delivery_file.exists() else ''
geometry_version=hashlib.sha256((ROOT/'dist/trait-geometry.mjs').read_bytes()).hexdigest()[:12]
runtime_path=ROOT/'dist/report-runtime.mjs'
runtime=runtime_path.read_text(encoding='utf-8')
runtime=re.sub(r"'\./trait-geometry\.mjs(?:\?v=[^']+)?'","'./trait-geometry.mjs?v="+geometry_version+"'",runtime)
runtime_path.write_text(runtime,encoding='utf-8')
runtime_version=hashlib.sha256(runtime_path.read_bytes()).hexdigest()[:12]
sources=list(source.glob('*-A-*.html'))+list(Path('E:/小红书/1/159').glob('*-T-*.html'))
assert len(sources)==32
for f in sources:
 code=f.name[:4]
 variant=f.name[5]
 full_code=code+'-'+variant
 text=f.read_text(encoding='utf-8-sig')
 # Session metadata and original shared-result URLs do not belong in a public build.
 text=re.sub(r'<meta\b[^>]*>',lambda m:'' if re.search(r'(?:csrf-token|app-bs-|app-route-name|og:url)',m.group()) else m.group(),text)
 text=re.sub(r'<script\b[^>]*>.*?</script>','',text,flags=re.S|re.I)
 text=re.sub(r'https://www\.16personalities\.com/profiles/[^"\s<>]+','./'+full_code+'.html',text)
 text=re.sub(r'<title>.*?</title>',f'<title>{full_code} Report | Persona Spectrum</title>',text,flags=re.S)
 css='''<style id="persona-integration">
 #js-navbar,#footer,.sp-nav__bottom,.navbar--bottom{display:none!important}
 .persona-header{height:80px;display:flex;align-items:center;justify-content:space-between;padding:0 5%;background:white;border-bottom:1px solid #eee;font:14px Arial,sans-serif;position:relative;z-index:99}
 .persona-header a{color:#343c48;text-decoration:none}.persona-brand{font-weight:800;letter-spacing:2px;display:flex;align-items:center;gap:12px}.persona-mark{width:25px;height:25px;border-radius:50%;background:conic-gradient(#77a58c 25%,#9390b5 0 50%,#d4aa64 0 75%,#599eb7 0);box-shadow:inset 0 0 0 7px #ffffff66}
 .persona-scoring{font:12px/1.7 Arial,sans-serif;color:#74808a;max-width:1200px;padding:12px 25px;margin:auto}.persona-header select{padding:8px;border:1px solid #ddd;background:white;border-radius:6px;max-width:160px}
 #persona-email{border:0;border-radius:16px;padding:30px;max-width:440px;width:90%;color:#343c48}#persona-email::backdrop{background:#24303d66}#persona-email input{display:block;width:100%;padding:12px;border:1px solid #ccc;border-radius:6px;margin:20px 0}#persona-email button{border:0;border-radius:24px;padding:12px 22px;background:#88649c;color:white;cursor:pointer}#persona-email small{display:block;margin:12px 0;font-size:12px;color:#7f8790}.persona-footer{text-align:center;font:12px Arial,sans-serif;color:#9298a0;padding:25px}
 .persona-report-banner{display:block;width:calc(100% - 50px);max-width:1200px;margin:26px auto;padding:25px 30px;border:0;border-radius:12px;background:#88649c;color:white;font:700 21px/1.4 Arial,sans-serif;cursor:pointer;text-align:center;box-shadow:0 8px 24px #88649c20}.persona-report-banner:hover{background:#76558b}.persona-free-offer{text-align:center;padding:26px 20px}.persona-offer-price{display:flex;align-items:center;justify-content:center;gap:16px;margin:0 0 14px}.persona-offer-price s{color:#8e8b95;font-size:23px}.persona-offer-price strong{color:#568d74;font-size:27px}.persona-free-offer h3{font-size:23px;margin:0 0 12px}.persona-free-offer>p:not(.persona-offer-price){font-size:17px;line-height:1.6;margin:0 0 20px}.persona-free-offer button{border:0;border-radius:30px;background:#88649c;color:white;padding:14px 28px;font:600 16px Arial,sans-serif;cursor:pointer}.persona-honeypot{position:absolute;left:-10000px;overflow:hidden;width:1px;height:1px}#persona-email button:disabled{opacity:.45;cursor:not-allowed}#persona-email-status{font-size:14px;line-height:1.6}#persona-email h2{font:700 25px/1.35 Arial,sans-serif;margin:0 0 22px}#persona-email #persona-download-direct{background:#f0edf3;color:#71547f;margin:10px 0}
 @media(max-width:600px){.persona-brand{font-size:11px;letter-spacing:1px}.persona-header{padding:0 20px}.persona-header>a:last-child{font-size:12px}}
 </style>'''
 text=text.replace('</head>','<meta name="persona-email-endpoint" content="'+html.escape(endpoint,quote=True)+'">'+css+'</head>')
 text=re.sub(r'<body([^>]*)>',lambda m:f'<body{m.group(1)} data-persona-type="{code}" data-persona-variant="{variant}"><div class="persona-header"><a class="persona-brand" href="../index.html"><span class="persona-mark"></span>PERSONA SPECTRUM</a><a href="../index.html#test">Take the test →</a></div>',text,count=1)
 ending='''<footer class="persona-footer">Persona Spectrum · Imported free report</footer><dialog id="persona-email"><form><h2>Where should we send your report?</h2><label>Email address<input type="email" required autocomplete="email" placeholder="you@example.com"></label><label class="persona-honeypot" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label><small>Our team will email your report after reviewing your request. Your email, result, and question-by-question answers will be sent to our team via FormSubmit to prepare your report.</small><p id="persona-email-status" role="status" aria-live="polite"></p><button type="submit">Request my free report</button><button type="button" onclick="this.closest('dialog').close()" style="background:#eee;color:#555;margin-left:8px">Cancel</button></form></dialog><script type="module" src="../report-runtime.mjs"></script>'''
 ending=ending.replace('../report-runtime.mjs','../report-runtime.mjs?v='+runtime_version)
 text=text.replace('</body>',ending+'</body>')
 (ROOT/f'dist/reports/{full_code}.html').write_text(text,encoding='utf-8')
 if variant=='A':
  alias='<!doctype html><html lang="en"><meta charset="utf-8"><title>Opening report</title><body><a href="'+full_code+'.html">Open report</a><script>let v="A";try{if(location.hash.startsWith("#result=")){const r=JSON.parse(decodeURIComponent(location.hash.slice(8)));if(r.variant==="T")v="T";}}catch{}location.replace("./'+code+'-"+v+".html"+location.hash);</script></body></html>'
  (ROOT/f'dist/reports/{code}.html').write_text(alias,encoding='utf-8')
 print(full_code,len(text))

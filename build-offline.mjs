import fs from 'node:fs/promises';
import path from 'node:path';
const out=path.resolve(process.env.PERSONA_OFFLINE_DIR||'../../outputs/persona-lab');
const strip=s=>s.replace(/^import .*?;\r?\n/gm,'').replace(/^export\s*\{[^}]*\};?\r?\n/gm,'').replace(/^export /gm,'');
const stripAnalytics=s=>s.replace(/<!-- persona-analytics:start -->[\s\S]*?<!-- persona-analytics:end -->\s*/g,'').replace(/<span data-analytics-notice>[\s\S]*?<\/span>/g,'<span>Offline edition · No analytics are loaded.</span>');
const html=stripAnalytics(await fs.readFile('dist/index.html','utf8')),css=await fs.readFile('dist/english.css','utf8');
const sources=await Promise.all(['analytics-events.mjs','english-questions.mjs','english-model.mjs','english-types.mjs','home-assets.mjs','home-illustrations.mjs','english-home.mjs','type-images.mjs','english-app.mjs'].map(name=>fs.readFile('dist/'+name,'utf8')));
const referenceCSS=await fs.readFile('dist/home-reference.css','utf8');
const merged=html.replace(/<link rel="stylesheet" href="\.\/english\.css(?:\?[^"]*)?">/,'<style>'+css+'</style>').replace(/<link id="home-reference-style"[^>]*>/,()=>'<style id="home-reference-style" media="not all">'+referenceCSS+'</style>').replace(/<script type="module" src="\.\/english-app\.mjs(?:\?[^"]*)?"><\/script>/,()=>'<script type="module">'+sources.map(strip).join('\n')+'</script>');
await fs.mkdir(out+'/reports',{recursive:true});
await fs.writeFile(out+'/index.html',merged);await fs.writeFile(out+'/人格光谱-双击打开.html',merged);
const runtime=(await Promise.all(['analytics-events.mjs','english-questions.mjs','english-model.mjs','answer-workbook.mjs','trait-geometry.mjs','report-runtime.mjs'].map(name=>fs.readFile('dist/'+name,'utf8')))).map(strip).join('\n');
for(const name of await fs.readdir('dist/reports'))if(name.endsWith('.html')){
 const report=stripAnalytics(await fs.readFile('dist/reports/'+name,'utf8')).replace(/<script type="module" src="\.\.\/report-runtime\.mjs(?:\?[^"]*)?"><\/script>/,()=>'<script type="module">'+runtime+'</script>');
 await fs.writeFile(out+'/reports/'+name,report);
}
console.log('English offline site ready: '+out+'/人格光谱-双击打开.html');

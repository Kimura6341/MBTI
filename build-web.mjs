import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';

// Changed files get changed URLs so a fresh page cannot reuse an old homepage module.
const digest=text=>createHash('sha256').update(text).digest('hex').slice(0,12);
const snippet=await fs.readFile('content/posthog-snippet.html','utf8');
const privacy=await fs.readFile('content/posthog-privacy.js','utf8');
const analyticsHead='<!-- persona-analytics:start -->\n<script>\n'+privacy+'\n</script>\n'+snippet+'\n<script>window.personaAnalytics.start();</script>\n<!-- persona-analytics:end -->';
const analyticsNotice='<span data-analytics-notice>Anonymous usage analytics by PostHog. Input contents are not collected.</span>';
function instrumentHTML(text){
 text=text.replace(/<!-- persona-analytics:start -->[\s\S]*?<!-- persona-analytics:end -->\s*/g,'');
 if(!/<head\b/i.test(text))text=text.replace(/(<html\b[^>]*>)([\s\S]*?)(<body\b)/i,'$1<head>$2</head>$3');
 text=text.replace('</head>',analyticsHead+'\n</head>');
 text=text.replace(/<(?:input|textarea|select)\b[^>]*>/gi,tag=>{
  if(/\bclass="[^"]*\bph-no-capture\b/.test(tag))return tag;
  return /\bclass="/.test(tag)?tag.replace(/\bclass="/,'class="ph-no-capture '):tag.replace(/^<(\w+)/,'<$1 class="ph-no-capture"');
 });
 if(!text.includes('data-analytics-notice'))text=text.replace('</footer>',analyticsNotice+'</footer>');
 return text;
}
const withoutVersion=text=>text.replace(/(\.\/[^'"\s]+\.(?:mjs|css))\?v=[a-zA-Z0-9_-]+/g,'$1');
const files=['home-assets.mjs','home.mjs','app.mjs','home.css'];
const source=Object.fromEntries(await Promise.all(files.map(async name=>[name,withoutVersion(await fs.readFile('dist/'+name,'utf8'))])));
source['home.mjs']=source['home.mjs'].replace("'./home-assets.mjs'",`'./home-assets.mjs?v=${digest(source['home-assets.mjs'])}'`);
source['app.mjs']=source['app.mjs'].replace("'./home.mjs'",`'./home.mjs?v=${digest(source['home.mjs'])}'`);
let html=instrumentHTML(withoutVersion(await fs.readFile('dist/index.html','utf8')));
const englishQuestions=await fs.readFile('dist/english-questions.mjs','utf8');
const englishHome=withoutVersion(await fs.readFile('dist/english-home.mjs','utf8'));
await fs.writeFile('dist/english-home.mjs',englishHome);
const englishModel=withoutVersion(await fs.readFile('dist/english-model.mjs','utf8')).replace("'./english-questions.mjs'",`'./english-questions.mjs?v=${digest(englishQuestions)}'`);
await fs.writeFile('dist/english-model.mjs',englishModel);
const answerWorkbook=withoutVersion(await fs.readFile('dist/answer-workbook.mjs','utf8')).replace("'./english-model.mjs'",`'./english-model.mjs?v=${digest(englishModel)}'`);
await fs.writeFile('dist/answer-workbook.mjs',answerWorkbook);
const answerExport=withoutVersion(await fs.readFile('dist/answer-export.mjs','utf8')).replace("'./answer-workbook.mjs'",`'./answer-workbook.mjs?v=${digest(answerWorkbook)}'`);
await fs.writeFile('dist/answer-export.mjs',answerExport);
let exportHTML=withoutVersion(await fs.readFile('dist/answer-export.html','utf8'));
exportHTML=exportHTML.replace('./answer-export.mjs','./answer-export.mjs?v='+digest(answerExport));
await fs.writeFile('dist/answer-export.html',exportHTML);
const analyticsEvents=await fs.readFile('dist/analytics-events.mjs','utf8');
const englishApp=withoutVersion(await fs.readFile('dist/english-app.mjs','utf8')).replace("'./analytics-events.mjs'",`'./analytics-events.mjs?v=${digest(analyticsEvents)}'`).replace("'./english-model.mjs'",`'./english-model.mjs?v=${digest(englishModel)}'`).replace("'./english-home.mjs'",`'./english-home.mjs?v=${digest(englishHome)}'`);
await fs.writeFile('dist/english-app.mjs',englishApp);
for(const name of ['english-app.mjs','english.css','home-reference.css']){
 const content=await fs.readFile('dist/'+name,'utf8');
 html=html.replace('./'+name,'./'+name+'?v='+digest(content));
}
html=html.replace('href="./home.css"',`href="./home.css?v=${digest(source['home.css'])}"`).replace('src="./app.mjs"',`src="./app.mjs?v=${digest(source['app.mjs'])}"`);
await fs.writeFile('dist/home.mjs',source['home.mjs']);
await fs.writeFile('dist/app.mjs',source['app.mjs']);
await fs.writeFile('dist/index.html',html);
const traitGeometry=await fs.readFile('dist/trait-geometry.mjs','utf8');
const reportRuntime=withoutVersion(await fs.readFile('dist/report-runtime.mjs','utf8')).replace("'./analytics-events.mjs'",`'./analytics-events.mjs?v=${digest(analyticsEvents)}'`).replace("'./trait-geometry.mjs'",`'./trait-geometry.mjs?v=${digest(traitGeometry)}'`).replace("'./answer-workbook.mjs'",`'./answer-workbook.mjs?v=${digest(answerWorkbook)}'`);
await fs.writeFile('dist/report-runtime.mjs',reportRuntime);
for(const directory of ['dist','dist/reports']){
 for(const name of await fs.readdir(directory)){
  if(!name.endsWith('.html'))continue;
  const path=directory+'/'+name,original=await fs.readFile(path,'utf8');
  const prepared=directory==='dist/reports'?instrumentHTML(original):original;
  const updated=prepared.replace(/(src="(?:\.\/|\.\.\/)report-runtime\.mjs)(?:\?v=[a-zA-Z0-9_-]+)?"/g,`$1?v=${digest(reportRuntime)}"`);
  if(updated!==original)await fs.writeFile(path,updated);
 }
}
console.log('Homepage and report resources now use content-versioned URLs.');

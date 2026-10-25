import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';

// Changed files get changed URLs so a fresh page cannot reuse an old homepage module.
const digest=text=>createHash('sha256').update(text).digest('hex').slice(0,12);
const withoutVersion=text=>text.replace(/(\.\/[^'"\s]+\.(?:mjs|css))\?v=[a-zA-Z0-9_-]+/g,'$1');
const files=['home-assets.mjs','home.mjs','app.mjs','home.css'];
const source=Object.fromEntries(await Promise.all(files.map(async name=>[name,withoutVersion(await fs.readFile('dist/'+name,'utf8'))])));
source['home.mjs']=source['home.mjs'].replace("'./home-assets.mjs'",`'./home-assets.mjs?v=${digest(source['home-assets.mjs'])}'`);
source['app.mjs']=source['app.mjs'].replace("'./home.mjs'",`'./home.mjs?v=${digest(source['home.mjs'])}'`);
let html=withoutVersion(await fs.readFile('dist/index.html','utf8'));
const englishQuestions=await fs.readFile('dist/english-questions.mjs','utf8');
const englishHome=withoutVersion(await fs.readFile('dist/english-home.mjs','utf8'));
await fs.writeFile('dist/english-home.mjs',englishHome);
const englishModel=withoutVersion(await fs.readFile('dist/english-model.mjs','utf8')).replace("'./english-questions.mjs'",`'./english-questions.mjs?v=${digest(englishQuestions)}'`);
await fs.writeFile('dist/english-model.mjs',englishModel);
const englishApp=withoutVersion(await fs.readFile('dist/english-app.mjs','utf8')).replace("'./english-model.mjs'",`'./english-model.mjs?v=${digest(englishModel)}'`).replace("'./english-home.mjs'",`'./english-home.mjs?v=${digest(englishHome)}'`);
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
const reportRuntime=withoutVersion(await fs.readFile('dist/report-runtime.mjs','utf8')).replace("'./trait-geometry.mjs'",`'./trait-geometry.mjs?v=${digest(traitGeometry)}'`);
await fs.writeFile('dist/report-runtime.mjs',reportRuntime);
for(const directory of ['dist','dist/reports']){
 for(const name of await fs.readdir(directory)){
  if(!name.endsWith('.html'))continue;
  const path=directory+'/'+name,original=await fs.readFile(path,'utf8');
  const updated=original.replace(/(src="(?:\.\/|\.\.\/)report-runtime\.mjs)(?:\?v=[a-zA-Z0-9_-]+)?"/g,`$1?v=${digest(reportRuntime)}"`);
  if(updated!==original)await fs.writeFile(path,updated);
 }
}
console.log('Homepage and report resources now use content-versioned URLs.');

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
const englishModel=withoutVersion(await fs.readFile('dist/english-model.mjs','utf8')).replace("'./english-questions.mjs'",`'./english-questions.mjs?v=${digest(englishQuestions)}'`);
await fs.writeFile('dist/english-model.mjs',englishModel);
const englishApp=withoutVersion(await fs.readFile('dist/english-app.mjs','utf8')).replace("'./english-model.mjs'",`'./english-model.mjs?v=${digest(englishModel)}'`);
await fs.writeFile('dist/english-app.mjs',englishApp);
for(const name of ['english-app.mjs','english.css']){
 const content=await fs.readFile('dist/'+name,'utf8');
 html=html.replace('./'+name,'./'+name+'?v='+digest(content));
}
html=html.replace('href="./home.css"',`href="./home.css?v=${digest(source['home.css'])}"`).replace('src="./app.mjs"',`src="./app.mjs?v=${digest(source['app.mjs'])}"`);
await fs.writeFile('dist/home.mjs',source['home.mjs']);
await fs.writeFile('dist/app.mjs',source['app.mjs']);
await fs.writeFile('dist/index.html',html);
console.log('Homepage scripts and stylesheet now use content-versioned URLs.');

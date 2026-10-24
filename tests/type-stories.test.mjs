import test from 'node:test';
import assert from 'node:assert/strict';
import {score,questions} from '../dist/model.mjs';
import {profiles,chapterSummaries,buildReport} from '../dist/report.mjs';
import {typeStories} from '../dist/type-stories.mjs';
import {editorialSources} from '../dist/editorial-sources.mjs';
import {referenceDemoAnswers,referenceMarkup} from '../dist/reference-report.mjs';
const codes=Object.keys(profiles),chapters=['traits','work','growth','relations'];
const grams=s=>new Set(Array.from({length:Math.max(0,s.length-11)},(_,i)=>s.slice(i,i+12)));
test('all types have four distinct chapter drafts and inspected primary source links',()=>{
 assert.deepEqual(Object.keys(typeStories).sort(),codes.slice().sort());
 for(const c of codes){assert.equal(new Set(Object.values(typeStories[c].chapters).flat()).size,8);assert.ok(editorialSources[c].url.endsWith('/'+c.toLowerCase()));const result=score(referenceDemoAnswers(c)),html=referenceMarkup(result,{base:c});assert.ok(!html.includes('class="nr-simple-footer"'));assert.equal(buildReport(result).typeWorkPoints.length,4);}
});
test('different types do not reuse the same opening or most long prose',()=>{
 for(const stress of ['A','T'])for(const chapter of chapters){
  const texts=codes.map(c=>chapterSummaries(score(referenceDemoAnswers(c,stress)))[chapter]);
  assert.equal(new Set(texts.map(t=>t.slice(0,120))).size,16);
  for(let i=0;i<16;i++)for(let j=i+1;j<16;j++){const a=grams(texts[i]),b=grams(texts[j]);const overlap=[...a].filter(g=>b.has(g)).length/Math.min(a.size,b.size);assert.ok(overlap<0.30,`${chapter} ${codes[i]} / ${codes[j]} overlap ${overlap}`);}
 }
});
test('INTP and INTJ work reports have different concrete themes',()=>{
 const p=chapterSummaries(score(referenceDemoAnswers('INTP'))).work,j=chapterSummaries(score(referenceDemoAnswers('INTJ'))).work;
 assert.ok(p.includes('工作不会只留下有趣的部分'));assert.ok(j.includes('组织里的人'));assert.ok(!j.includes('工作不会只留下有趣的部分'));
});
test('neutral results keep a conservative dimensional explanation',()=>{const r=score(Object.fromEntries(questions.map(q=>[q.id,0])));assert.ok(chapterSummaries(r).traits.includes('没有明显'));});

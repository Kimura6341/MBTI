import test from 'node:test';
import assert from 'node:assert/strict';
import {score,questions} from '../dist/model.mjs';
import {profiles,chapterSummaries,narrativeText} from '../dist/report.mjs';
import {referenceMarkup,referenceDemoAnswers,referenceChapters} from '../dist/reference-report.mjs';
test('reference preview simulates complete answers with distinct dimension strengths',()=>{
 for(const code of Object.keys(profiles))for(const stress of ['A','T']){const answers=referenceDemoAnswers(code,stress);assert.equal(Object.keys(answers).length,110);const result=score(answers);assert.equal(result.code,code+'-'+stress);assert.equal(new Set(result.dimensions.map(d=>Math.max(d.leftPercent,d.rightPercent))).size,5);}
});
test('32 report variants render charts, original illustration and resolvable chapter navigation',()=>{
 for(const code of Object.keys(profiles))for(const stress of ['A','T']){const result=score(referenceDemoAnswers(code,stress));const html=referenceMarkup(result,{demo:true,base:code,stress,profiles});assert.ok(!html.includes('undefined'));assert.ok(!html.includes('NaN'));const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);for(const [chapter] of referenceChapters)assert.ok(ids.includes('nr-'+chapter));for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(id),id);assert.equal((html.match(/class="nr-dimension"/g)||[]).length,5);assert.equal((html.match(/class="nr-ring-item"/g)||[]).length,5);assert.ok(html.includes('data-nr-chart="rings"'));assert.ok(html.includes('id="demo-stress"'));assert.ok(!html.includes('US$'));}
});
test('actual results do not expose demo selectors; midpoint values stay readable',()=>{
 const r=score(Object.fromEntries(questions.map(q=>[q.id,0]))),html=referenceMarkup(r);assert.ok(!html.includes('id="demo-type"'));assert.ok(html.includes('XXXX-X'));assert.ok(html.includes('接近中点'));assert.ok(!html.includes('undefined'));
});
test('report keeps summaries and main points without expandable supplementary sections',()=>{const html=referenceMarkup(score(referenceDemoAnswers('INTP')),{base:'INTP'});assert.ok(!/<details\b/.test(html));assert.ok(!/<summary\b/.test(html));for(const removed of ['七天成长计划','适合尝试的工作环境','让协作更顺畅的具体建议','发生分歧时，可以这样表达','你的大五人格画像'])assert.ok(!html.includes(removed));assert.ok(html.includes('你的强项'));assert.ok(html.includes('你的短板'));assert.ok(!html.includes('class="nr-growth-banner"'));assert.ok(!html.includes('class="nr-simple-footer"'));assert.ok(!html.includes('data-action="method"'));});
test('each chapter opens with a substantive summary before the detailed content',()=>{
 for(const code of Object.keys(profiles))for(const stress of ['A','T']){
  const result=score(referenceDemoAnswers(code,stress)),summaries=chapterSummaries(result),html=referenceMarkup(result,{base:code});
  for(const [key,text] of Object.entries(summaries)){assert.ok(text.length>=650,`${code} ${key} summary too short`);assert.ok(!text.includes('undefined'));assert.ok(narrativeText(result).includes(text));if(key!=='traits'){assert.equal(text.split("\n\n").length,2);for(const paragraph of text.split("\n\n"))assert.ok(html.includes(`<p>${paragraph}</p>`));}else{const visible=html.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s/g,'');assert.ok(visible.includes(text.replace(/\s/g,'')));}}
  assert.ok(html.indexOf('data-chapter-summary="traits"')<html.indexOf('class="nr-trait-card"'));
  for(const key of ['work','growth','relations']){const chapter=html.split(`id="nr-${key}"`)[1].split('</section>')[0];assert.ok(chapter.indexOf('data-chapter-summary')<chapter.indexOf(key==='relations'?'class="nr-relation-points"':'class="nr-subtitle"'));}
 }
});

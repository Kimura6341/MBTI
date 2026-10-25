import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {englishQuestions,calculateEnglish,axisDefinitions} from '../dist/english-model.mjs';
import {englishTypes} from '../dist/english-types.mjs';
import {traitGeometry} from '../dist/trait-geometry.mjs';
test('bipolar markers move independently over a fully colored track',()=>{
 for(const pct of [50,51,53,58,67,74,75,83,100])for(const left of [true,false]){
  const g=traitGeometry(pct,left);
  assert.equal(g.marker,left?100-pct:pct);
  assert.equal(g.fillStart,0);
  assert.equal(g.fillWidth,100);
 }
 assert.equal(traitGeometry(100,true).marker,0);
 assert.equal(traitGeometry(100,false).marker,100);
 for(const [pct,left,marker] of [[58,true,42],[58,false,58],[100,true,0],[100,false,100],[50,true,50]]){
  assert.deepEqual(traitGeometry(pct,left),{marker,fillStart:0,fillWidth:100});
 }
});
test('English source contains 60 unique questions across five dimensions',()=>{assert.equal(englishQuestions.length,60);assert.equal(new Set(englishQuestions.map(q=>q.id)).size,60);for(const [axis] of axisDefinitions)assert.equal(englishQuestions.filter(q=>q.axis===axis).length,12);});
test('all 32 answer profiles produce the intended type and identity',()=>{for(const code of Object.keys(englishTypes))for(const variant of ['A','T']){const target=[...code,variant],answers={};for(const q of englishQuestions){const i=axisDefinitions.findIndex(a=>a[0]===q.axis);answers[q.id]=(target[i]===q.axis[0]?-3:3)*q.direction;}const r=calculateEnglish(answers);assert.equal(r.code,code);assert.equal(r.variant,variant);assert.ok(r.dimensions.every(d=>d.pct===100));}});
test('different strengths lead to distinct dimension scores, not fixed percentages',()=>{const answers=Object.fromEntries(englishQuestions.map(q=>[q.id,-q.direction*([0,1,2,3,1][axisDefinitions.findIndex(a=>a[0]===q.axis)])]));assert.deepEqual(calculateEnglish(answers).dimensions.map(d=>d.pct),[50,67,83,100,67]);assert.throws(()=>calculateEnglish({}));});
test('every imported report includes four original chapters and no session metadata',()=>{const descriptions=[];for(const code of Object.keys(englishTypes)){const report=JSON.parse(fs.readFileSync(new URL(`../dist/reports/${code}.json`,import.meta.url)));assert.equal(report.chapters.length,4);for(const c of report.chapters.slice(1)){assert.ok(c.paragraphs.length>=2);assert.equal(c.strengths.length,6);assert.equal(c.weaknesses.length,6);assert.ok(c.image?.src.startsWith('data:image'));}descriptions.push(report.chapters[1].paragraphs[0]);const html=fs.readFileSync(new URL(`../dist/reports/${code}-A.html`,import.meta.url),'utf8');assert.ok(!html.includes('csrf-token'));assert.ok(!html.includes('app-bs-auth'));assert.ok(html.includes('report-runtime.mjs'));}assert.equal(new Set(descriptions).size,16);});

test('all 32 full reports use the matching source edition',()=>{for(const code of Object.keys(englishTypes))for(const variant of ['A','T']){const html=fs.readFileSync(new URL(`../dist/reports/${code}-${variant}.html`,import.meta.url),'utf8');assert.ok(html.includes(`data-persona-type="${code}" data-persona-variant="${variant}"`));assert.ok(html.includes(`${code}-${variant}</span>`));for(const id of ['intro','career','personal-growth','relationships'])assert.ok(html.includes(`id="${id}"`));assert.ok(html.includes(variant==='T'?'Turbulent':'Assertive'));assert.ok(!html.includes('csrf-token'));assert.ok(!html.includes('app-bs-auth'));assert.ok(!/https:\/\/www\.16personalities\.com\/profiles\//.test(html));}});

test('all direction keys agree with the supplied independent specification',()=>{const keys=JSON.parse(fs.readFileSync(new URL('../content/algorithm-key.json',import.meta.url),'utf8'));assert.equal(keys.length,60);for(const key of keys){const q=englishQuestions.find(q=>q.id===`en-${key.order}`);assert.equal(q.order,key.order);assert.equal(q.axis.replace('/',''),key.axis);assert.equal(q.agreePole,key.agreePole);assert.equal(q.direction,key.agreePole===key.axis[0]?1:-1);assert.equal(q.weight,1);}});
test('supplied real-site fixture: all Disagree (+3) yields ISTP-A',()=>{const result=calculateEnglish(Object.fromEntries(englishQuestions.map(q=>[q.id,3])));assert.equal(result.code+'-'+result.variant,'ISTP-A');assert.deepEqual(result.dimensions.map(d=>d.sum),[-6,-6,6,-6,6]);});
test('zero-score rule follows specification while keeping boundary flags',()=>{const result=calculateEnglish(Object.fromEntries(englishQuestions.map(q=>[q.id,0])));assert.equal(result.code+'-'+result.variant,'ENTJ-A');assert.ok(result.dimensions.every(d=>d.boundary&&d.pct===50&&d.sum===0));});
test('agree is negative; reversing any answer affects only its own axis',()=>{
 for(const question of englishQuestions){
  const answers=Object.fromEntries(englishQuestions.map(q=>[q.id,0]));
  answers[question.id]=-3;const a=calculateEnglish(answers);
  answers[question.id]=3;const b=calculateEnglish(answers);
  for(const [i,[axis]] of axisDefinitions.entries()){
   if(axis===question.axis){
    assert.equal(a.dimensions[i].sum,3*question.direction);
    assert.equal(b.dimensions[i].sum,-3*question.direction);
   }else assert.deepEqual(a.dimensions[i],b.dimensions[i]);
  }
 }
});

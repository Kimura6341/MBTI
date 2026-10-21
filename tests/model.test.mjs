import {test} from 'node:test';
import assert from 'node:assert/strict';
import {axes,questions,score,validAnswers} from '../dist/model.mjs';
const all=fn=>Object.fromEntries(questions.map(q=>[q.id,fn(q)]));
test('60 unique questions, 12 per dimension with balanced keys',()=>{assert.equal(questions.length,60);assert.equal(new Set(questions.map(q=>q.id)).size,60);for(const a of axes){const qs=questions.filter(q=>q.axis===a.id);assert.equal(qs.length,12);assert.equal(qs.filter(q=>q.direction===1).length,6);assert.equal(qs.filter(q=>q.direction===-1).length,6);}});
test('neutral does not invent a type; complementary percentages',()=>{const r=score(all(()=>0));assert.equal(r.code,'XXXX-X');for(const d of r.dimensions){assert.equal(d.leftPercent,50);assert.equal(d.rightPercent,50);assert.ok(d.boundary);}});
test('reverse scoring and extrema',()=>{assert.equal(score(all(q=>3*q.direction)).code,'ENTJ-A');assert.equal(score(all(q=>-3*q.direction)).code,'ISFP-T');for(const d of score(all(q=>-3*q.direction)).dimensions){assert.equal(d.leftPercent,0);assert.equal(d.rightPercent,100);}});
test('single answer only affects its assigned dimension and reverses direction',()=>{const answers=all(()=>0);answers.q1=3;let r=score(answers);assert.equal(r.dimensions[0].sum,3);assert.equal(r.dimensions[0].leftPercent,54);assert.ok(r.dimensions.slice(1).every(d=>d.sum===0));answers.q6=3;r=score(answers);assert.equal(r.dimensions[0].sum,0);});
test('incomplete and invalid submissions rejected; saved answers sanitized',()=>{assert.throws(()=>score({}));assert.throws(()=>score({...all(()=>0),q1:4}));assert.throws(()=>score({...all(()=>0),q1:null}));assert.deepEqual(validAnswers({q1:3,q2:0,q3:2.5,q4:'1',q5:8,foreign:2}),{q1:3,q2:0});});

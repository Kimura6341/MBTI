import test from 'node:test';
import assert from 'node:assert/strict';
import {questions,axes,score} from '../dist/model.mjs';
import {profiles,buildReport,narrativeText} from '../dist/report.mjs';
function answersFor(code,stress){const letters=code.split('').concat(stress);return Object.fromEntries(questions.map(q=>[q.id,q.source==='original'?q.direction*(axes.find(a=>a.id===q.axis).letters[0]===letters[axes.findIndex(a=>a.id===q.axis)]?2:-2):0]));}
test('all 16 types and both stress directions produce complete contextual reports',()=>{
 for(const code of Object.keys(profiles))for(const stress of ['A','T']){const result=score(answersFor(code,stress)),report=buildReport(result);assert.equal(result.code,`${code}-${stress}`);assert.equal(report.name,profiles[code][0]);assert.equal(report.selected.length,5);assert.equal(report.plan.length,4);for(const section of report.selected)for(const key of ['meaning','strength','risk','action','environment','relationship'])assert.ok(section[key]?.length>5,`${code} ${key}`);assert.ok(!narrativeText(result).includes('undefined'));}
});
test('midpoint answers avoid assigning directional advice or a fabricated type',()=>{const result=score(Object.fromEntries(questions.map(q=>[q.id,0]))),report=buildReport(result);assert.equal(report.name,'多面探索者');assert.ok(report.selected.every(g=>g.title==='在两种方式之间切换'));assert.ok(!narrativeText(result).includes('undefined'));});
test('opposite preference combinations change concrete work and relationship advice',()=>{const a=buildReport(score(answersFor('INFJ','T'))),b=buildReport(score(answersFor('ESTP','A')));for(let i=0;i<5;i++){assert.notEqual(a.selected[i].action,b.selected[i].action);assert.notEqual(a.selected[i].relationship,b.selected[i].relationship);}});

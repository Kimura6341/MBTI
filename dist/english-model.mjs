import {englishQuestions} from './english-questions.mjs?v=69f6800eccc7';
export {englishQuestions};
export const axisDefinitions=[['E/I','Energy','Extraverted','Introverted'],['N/S','Mind','Intuitive','Observant'],['T/F','Nature','Thinking','Feeling'],['J/P','Tactics','Judging','Prospecting'],['A/T','Identity','Assertive','Turbulent']];
export function calculateEnglish(answers){
 const dimensions=axisDefinitions.map(([axis,label,left,right])=>{
  const items=englishQuestions.filter(q=>q.axis===axis);
  if(items.some(q=>!Number.isInteger(answers[q.id])||Math.abs(answers[q.id])>3))throw new Error('Please answer all 60 questions.');
  // The supplied specification uses -3 for agree, +3 for disagree.
  // Item weights and the official percentage transform are unmeasured.
  const sum=items.reduce((n,q)=>n-answers[q.id]*q.direction*(q.weight??1),0), max=items.reduce((n,q)=>n+3*(q.weight??1),0);
  const first=sum>=0, pct=Math.round(50+Math.abs(sum)/max*50);
  return {axis,label,left,right,sum,max,letter:axis[first?0:2],trait:first?left:right,pct,leftPct:Math.round(50+sum/max*50),boundary:Math.abs(sum)/max<.1};
 });
 return {code:dimensions.slice(0,4).map(d=>d.letter).join(''),variant:dimensions[4].letter,dimensions};
}

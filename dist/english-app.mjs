import {trackEvent,completedTestProperties} from './analytics-events.mjs?v=0ef101c2d544';
import {englishQuestions,calculateEnglish} from './english-model.mjs?v=f351344ebc7f';
import {englishHomeMarkup,bindEnglishHome} from './english-home.mjs?v=3f8c5a9b7dc4';
const root=document.querySelector('#app'),key='persona-spectrum-english-60-v2';
let answers={},page=0;
let testActive=false;
try{let saved=JSON.parse(localStorage.getItem(key));if(!saved){const previous=JSON.parse(localStorage.getItem('persona-spectrum-english-60-v1'));if(previous){saved={...previous,answers:Object.fromEntries(Object.entries(previous.answers||{}).map(([id,value])=>[id,-value]))};localStorage.setItem(key,JSON.stringify(saved));}}if(saved){answers=Object.fromEntries(englishQuestions.filter(q=>Number.isInteger(saved.answers?.[q.id])&&Math.abs(saved.answers[q.id])<=3).map(q=>[q.id,saved.answers[q.id]]));page=Math.min(9,Math.max(0,Number.isInteger(saved.page)?saved.page:0));}}catch{}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const save=()=>{try{localStorage.setItem(key,JSON.stringify({answers,page}));}catch{}};
let answerScrollTimer=null;
function cancelAnswerScroll(){clearTimeout(answerScrollTimer);answerScrollTimer=null;}
addEventListener('wheel',cancelAnswerScroll,{passive:true});
addEventListener('touchmove',cancelAnswerScroll,{passive:true});
function emphasizeQuestion(field){root.querySelectorAll('fieldset').forEach(el=>el.classList.toggle('is-current',el===field));}
function moveToQuestion(target){
 cancelAnswerScroll();
 answerScrollTimer=setTimeout(()=>{
  if(!target.isConnected||location.hash!=='#test')return;
  emphasizeQuestion(target.matches('fieldset')?target:null);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'});
 },160);
}

function home(){
 cancelAnswerScroll();
 document.body.classList.add('homepage-active');document.querySelector('#home-reference-style').media='all';
 root.innerHTML=englishHomeMarkup('');bindEnglishHome(root);
}

function quiz(){
 cancelAnswerScroll();
 document.body.classList.remove('homepage-active');document.querySelector('#home-reference-style').media='not all';
 const count=Object.keys(answers).length;
 root.innerHTML=`<section class="quiz"><p class="eyebrow">FREE PERSONALITY TEST</p><h1>Be yourself. Answer honestly.</h1><p>Choose what usually describes you, rather than who you would like to be.</p><div class="progress-label"><strong>Step ${page+1} of 10</strong><span>${count} / 60 answered</span></div><progress max="60" value="${count}" aria-label="Questions answered"></progress><form><div id="error" role="alert"></div>${englishQuestions.slice(page*6,page*6+6).map((q,i)=>`<fieldset id="${q.id}"><legend><small>${page*6+i+1} / 60</small>${escape(q.text)}</legend><div class="choices"><span>Agree</span>${[-3,-2,-1,0,1,2,3].map((v,n)=>`<label style="--size:${[48,40,32,24,32,40,48][n]}px;--tone:${n<3?'#539c85':n>3?'#9274a4':'#aaa7ae'}"><input class="ph-no-capture" type="radio" name="${q.id}" value="${v}" aria-label="${['Strongly agree','Moderately agree','Slightly agree','Neither agree nor disagree','Slightly disagree','Moderately disagree','Strongly disagree'][n]}" ${answers[q.id]===v?'checked':''}><span></span></label>`).join('')}<span>Disagree</span></div></fieldset>`).join('')}<div class="actions">${page?'<button type="button" class="secondary" id="previous">← Previous</button>':'<a href="#" class="secondary">Home</a>'}<button class="primary">${page===9?'See my results':'Next'} →</button></div></form></section>`;
 const form=root.querySelector('form');
 let pointerSelection=false,pointerReview=false;
 const fields=[...form.querySelectorAll('fieldset')];
 fields.forEach(field=>field.classList.toggle('is-answered',Number.isInteger(answers[field.id])));
 emphasizeQuestion(fields.find(field=>!Number.isInteger(answers[field.id]))||fields[0]);
 form.addEventListener('pointerdown',event=>{
  cancelAnswerScroll();pointerSelection=Boolean(event.target.closest('.choices label'));
  const field=event.target.closest('fieldset'),current=form.querySelector('fieldset.is-current');
  pointerReview=Boolean(field&&(Number.isInteger(answers[field.id])||(current&&fields.indexOf(field)<fields.indexOf(current))));
  // A checked radio does not emit change when clicked again, so handle review here too.
  if(pointerReview)moveToQuestion(field);
 });
 form.addEventListener('keydown',()=>{pointerSelection=false;pointerReview=false;cancelAnswerScroll();});
 form.addEventListener('focusin',event=>{const field=event.target.closest('fieldset');if(field)emphasizeQuestion(field);});
 form.onchange=event=>{
  const input=event.target;if(input.type!=='radio')return;
  answers[input.name]=Number(input.value);save();
  const field=input.closest('fieldset');field.classList.add('is-answered');
  root.querySelector('progress').value=Object.keys(answers).length;
  root.querySelector('.progress-label span').textContent=`${Object.keys(answers).length} / 60 answered`;
  root.querySelector('#error').textContent='';
  if(pointerSelection){
   const index=fields.indexOf(field);
   const next=pointerReview?field:fields[index+1]||fields.find(el=>!Number.isInteger(answers[el.id]))||form.querySelector('.actions');
   moveToQuestion(next);
  }
  pointerSelection=false;pointerReview=false;
 };

 root.querySelector('#previous')?.addEventListener('click',()=>{page--;save();quiz();root.querySelector('fieldset').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
 root.querySelector('form').onsubmit=e=>{e.preventDefault();cancelAnswerScroll();const missing=englishQuestions.slice(page*6,page*6+6).filter(q=>!Number.isInteger(answers[q.id]));if(missing.length){root.querySelector('#error').textContent=`Please answer the remaining ${missing.length} question${missing.length===1?'':'s'}.`;root.querySelector(`#${missing[0].id} input`).focus();return;}trackEvent('test_page_completed',{page:page+1});if(page<9){page++;save();quiz();root.querySelector('fieldset').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}else{const result=calculateEnglish(answers);if(result.dimensions.some(d=>d.sum===0)){root.innerHTML=`<section class="quiz"><h1>Your preferences are close to the middle.</h1><p>One or more dimensions are tied. A single personality type would overstate this result.</p>${result.dimensions.map(d=>`<p><strong>${d.label}</strong>: ${d.leftPct}% ${d.left} / ${100-d.leftPct}% ${d.right}</p>`).join('')}<p class="method">Approximate scoring. These values describe this set of answers, not population percentiles.</p><a class="primary" href="./index.html#test">Review my answers</a></section>`;scrollTo(0,0);return;}trackEvent('test_completed',completedTestProperties(result));try{sessionStorage.setItem('persona-english-answer-record-v1',JSON.stringify({result,answers,completedAt:new Date().toISOString()}));}catch{}sessionStorage.setItem('persona-english-result',JSON.stringify(result));location.href=`./reports/${result.code}-${result.variant}.html#result=${encodeURIComponent(JSON.stringify(result))}`;}};
}
function render(){if(location.hash==='#test'){if(!testActive)trackEvent('test_started');testActive=true;quiz();}else{testActive=false;home();}}addEventListener('hashchange',()=>{if(location.hash==='#test'||!root.querySelector('.q-hm'))render();const target=document.getElementById(location.hash.slice(1));if(target)target.scrollIntoView({block:'start'});else scrollTo(0,0);});render();if(location.hash&&location.hash!=='#test')document.getElementById(location.hash.slice(1))?.scrollIntoView();

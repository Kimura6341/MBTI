const sourceCode=document.body.dataset.personaType;
const sourceVariant=document.body.dataset.personaVariant||'A';
const labels=[['Energy','Extraverted','Introverted'],['Mind','Intuitive','Observant'],['Nature','Thinking','Feeling'],['Tactics','Judging','Prospecting'],['Identity','Assertive','Turbulent']];
let result=null;
try{if(location.hash.startsWith('#result=')){const candidate=JSON.parse(decodeURIComponent(location.hash.slice(8)));if(candidate.code===sourceCode&&candidate.variant===sourceVariant&&candidate.dimensions?.length===5&&candidate.dimensions.every((d,i)=>Number.isFinite(d.pct)&&d.pct>=50&&d.pct<=100&&labels[i].slice(1).includes(d.trait)))result=candidate;}}catch{}
const note=document.createElement('div');note.className='persona-scoring';note.textContent=result?'Approximate scoring · Equal item weights; not the proprietary NERIS algorithm.':'Report preview · Saved example scores; take the test for your own results.';

document.querySelector('[data-testid="typeheader"]')?.after(note);
const tabs=[...document.querySelectorAll('.traitbox[role="tab"]')].slice(0,5);
const descriptions=tabs.map(t=>{const el=t.querySelector('[id^="trait-desc-"]');return {image:el?.querySelector('img')?.cloneNode(true),text:el?.querySelector('p')?.textContent||''};});
const turbulent='Turbulent individuals are self-conscious and sensitive to stress. They tend to be success-driven, perfectionistic, and eager to improve.';
function showTrait(index){
 const tab=tabs[index],d=result?.dimensions[index],panel=document.querySelector('.traits__desc[role="tabpanel"]');
 tabs.forEach((t,i)=>{t.setAttribute('aria-selected',String(i===index));t.classList.toggle('is--active',i===index);t.tabIndex=i===index?0:-1;});
 if(!panel)return;panel.setAttribute('aria-labelledby',tab.id);
 const heading=panel.querySelector('.desc__value'),label=panel.querySelector('.desc__label');
 if(label)label.textContent=labels[index][0];
 if(heading){const source=tab.querySelector('[id^="trait-desc-"] h4');if(source)heading.innerHTML=source.innerHTML.replace(/^.*?:\s*/,'');if(d)heading.textContent=`${d.pct}% ${d.trait}`;}
 const img=panel.querySelector('.desc__img');if(img&&descriptions[index].image){img.src=descriptions[index].image.src;img.alt=descriptions[index].image.alt;}
 const paragraph=[...panel.querySelectorAll('p')].find(p=>!p.classList.contains('desc__label'));if(paragraph)paragraph.textContent=descriptions[index].text;
}
if(result){
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
 while((node=walker.nextNode()))if(node.textContent.trim()===sourceCode+'-'+sourceVariant)node.textContent=node.textContent.replace(sourceCode+'-'+sourceVariant,sourceCode+'-'+result.variant);
 const code=document.querySelector('[data-testid="typeheader"] .code');if(code)code.textContent=`${result.code}-${result.variant}`;
 tabs.forEach((tab,i)=>{
  const d=result.dimensions[i];tab.setAttribute('aria-label',`${d.label}: ${d.pct}% ${d.trait}`);
  const label=tab.querySelector('.sp-barlabel .font-body');if(label){label.replaceChildren();const strong=document.createElement('strong');strong.textContent=d.pct+'%';label.append(strong,` ${d.trait}`);}
  const bar=tab.querySelector('[data-testid="bar"]'),dot=tab.querySelector('[data-testid="dot"]');
  const position=d.trait===labels[i][1]?100-d.pct:d.pct;
  if(bar)bar.style.width=position+'%';if(dot)dot.style.left=position+'%';
  const bubble=tab.querySelector('.sp-barlabel');if(bubble){bubble.style.left='auto';bubble.style.right='auto';bubble.style.alignSelf=d.trait===labels[i][1]?'flex-start':'flex-end';}
  tab.querySelectorAll('.traitbar__label').forEach(el=>{const active=el.textContent.trim()===d.trait;el.classList.toggle('traitbar__label--active',active);el.classList.toggle('traitbar__label--inactive',!active);});
 });
}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>showTrait(i));tab.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp','ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();const next=(i+(['ArrowDown','ArrowRight'].includes(e.key)?1:4))%5;showTrait(next);tabs[next].focus();}});});showTrait(0);
document.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button)return;
 const text=(button.textContent||'').trim();
 if(/unlock|upgrade|compare|get access/i.test(text)){event.preventDefault();alert('This preview includes the supplied free report. Paid features are not connected.');}
 if(/download.*report|^email(?: results)?$/i.test(text)){event.preventDefault();document.querySelector('#persona-email').showModal();}
});
const chapterLinks=[...document.querySelectorAll('nav a[href^="#"]')];
const observer=new IntersectionObserver(entries=>{const active=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(active)chapterLinks.forEach(a=>a.closest('li')?.classList.toggle('active',a.hash==='#'+active.target.id));},{rootMargin:'-5% 0px -65% 0px'});
document.querySelectorAll('section[id]').forEach(section=>observer.observe(section));
document.querySelector('#persona-email form').addEventListener('submit',event=>{
 event.preventDefault();const email=document.querySelector('#persona-email input').value;
 try{localStorage.setItem('persona-report-email',email);}catch{}
 const clone=document.documentElement.cloneNode(true);clone.querySelectorAll('script').forEach(s=>s.remove());const blob=new Blob(['<!doctype html>'+clone.outerHTML],{type:'text/html'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${sourceCode}-${result?.variant||sourceVariant}-report.html`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.querySelector('#persona-email').close();
});

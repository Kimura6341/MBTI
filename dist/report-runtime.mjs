import {traitGeometry} from './trait-geometry.mjs?v=8736955167ee';
const sourceCode=document.body.dataset.personaType;
const sourceVariant=document.body.dataset.personaVariant||'A';
const labels=[['Energy','Extraverted','Introverted'],['Mind','Intuitive','Observant'],['Nature','Thinking','Feeling'],['Tactics','Judging','Prospecting'],['Identity','Assertive','Turbulent']];
let result=null;
try{if(location.hash.startsWith('#result=')){const candidate=JSON.parse(decodeURIComponent(location.hash.slice(8)));if(candidate.code===sourceCode&&candidate.variant===sourceVariant&&candidate.dimensions?.length===5&&candidate.dimensions.every((d,i)=>Number.isFinite(d.pct)&&d.pct>=50&&d.pct<=100&&labels[i].slice(1).includes(d.trait)))result=candidate;}}catch{}
const note=document.createElement('div');note.className='persona-scoring';note.textContent=result?'Approximate scoring · Equal item weights; not the proprietary NERIS algorithm.':'Report preview · Saved example scores; take the test for your own results.';

document.querySelector('.persona-footer')?.append(note);
const reportBanner=document.createElement('button');
reportBanner.type='button';reportBanner.className='persona-report-banner';reportBanner.dataset.emailReport='true';
reportBanner.textContent='Download your report by email →';
document.querySelector('[data-testid="typeheader"]')?.after(reportBanner);
// Remove the full strip, including its hidden success state and both buttons.
for(const paragraph of document.querySelectorAll('p'))if(paragraph.textContent.trim()==='Would you like to email or compare your results?')paragraph.closest('div[tabindex="-1"]')?.remove();
const offerMarkup=()=>'<div class="persona-free-offer"><p class="persona-offer-price"><s>$19.99</s><strong>FREE</strong></p><h3>Your detailed personality report</h3><p>Free for a limited time. Get your report by email.</p><button type="button" data-email-report>Get my free report →</button></div>';
document.querySelectorAll('.sp-resultsprompt').forEach(prompt=>{prompt.innerHTML=offerMarkup();});
const upgrade=document.querySelector('#upgrade-now');if(upgrade)upgrade.innerHTML=offerMarkup();
const tabs=[...document.querySelectorAll('.traitbox[role="tab"]')].slice(0,5);
const descriptions=tabs.map(t=>{const el=t.querySelector('[id^="trait-desc-"]');return {image:el?.querySelector('img')?.cloneNode(true),text:el?.querySelector('p')?.textContent||''};});
const turbulent='Turbulent individuals are self-conscious and sensitive to stress. They tend to be success-driven, perfectionistic, and eager to improve.';
const repositionLabels=[];
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
}
tabs.forEach((tab,i)=>{
  const saved=tab.getAttribute('aria-label')?.match(/(\d+)%\s+(.+)$/);
  const d=result?.dimensions[i]||(saved?{label:labels[i][0],pct:Number(saved[1]),trait:saved[2]}:null);
  if(!d)return;tab.setAttribute('aria-label',`${d.label}: ${d.pct}% ${d.trait}`);
  const label=tab.querySelector('.sp-barlabel .font-body');if(label){label.replaceChildren();const strong=document.createElement('strong');strong.textContent=d.pct+'%';label.append(strong,` ${d.trait}`);}
  const bar=tab.querySelector('[data-testid="bar"]'),dot=tab.querySelector('[data-testid="dot"]'),track=tab.querySelector('[data-testid="progressbar"]');
  const geometry=traitGeometry(d.pct,d.trait===labels[i][1]);
  if(bar){for(const [key,value] of Object.entries({position:'absolute',left:geometry.fillStart+'%',right:'auto',top:'0',bottom:'0',width:geometry.fillWidth+'%',margin:'0',transition:'none'}))bar.style.setProperty(key,value,'important');}
  if(dot&&track){
   // The marker must use the full track, not the resized colored segment.
   track.append(dot);
   for(const [key,value] of Object.entries({position:'absolute',left:geometry.marker+'%',right:'auto',margin:'0',transform:'translateX(-50%)',transition:'none'}))dot.style.setProperty(key,value,'important');
  }
  const bubble=tab.querySelector('.sp-barlabel');
  if(bubble&&track){
   for(const [key,value] of Object.entries({position:'relative',right:'auto',width:'max-content','max-width':'100%',margin:'0',transform:'none','text-align':'center','align-self':'auto'}))bubble.style.setProperty(key,value,'important');
   const positionLabel=()=>{const width=track.getBoundingClientRect().width,labelWidth=bubble.getBoundingClientRect().width;const left=Math.max(0,Math.min(width-labelWidth,width*geometry.marker/100-labelWidth/2));bubble.style.setProperty('left',left+'px','important');};
   repositionLabels.push(positionLabel);positionLabel();
   if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(positionLabel);observer.observe(track);observer.observe(bubble);}
  }
  tab.querySelectorAll('.traitbar__label').forEach(el=>{const active=el.textContent.trim()===d.trait;el.classList.toggle('traitbar__label--active',active);el.classList.toggle('traitbar__label--inactive',!active);});
 });
document.fonts?.ready.then(()=>repositionLabels.forEach(position=>position()));
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>showTrait(i));tab.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp','ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();const next=(i+(['ArrowDown','ArrowRight'].includes(e.key)?1:4))%5;showTrait(next);tabs[next].focus();}});});showTrait(0);
document.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button)return;
 const text=(button.textContent||'').trim();
 if(button.matches('[data-email-report]')){event.preventDefault();document.querySelector('#persona-email').showModal();return;}
 if(/unlock|upgrade|compare|get access/i.test(text)){event.preventDefault();alert('This preview includes the supplied free report. Paid features are not connected.');}
 if(/download.*report|^email(?: results)?$/i.test(text)){event.preventDefault();document.querySelector('#persona-email').showModal();}
});
const chapterLinks=[...document.querySelectorAll('nav a[href^="#"]')];
const observer=new IntersectionObserver(entries=>{const active=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(active)chapterLinks.forEach(a=>a.closest('li')?.classList.toggle('active',a.hash==='#'+active.target.id));},{rootMargin:'-5% 0px -65% 0px'});
document.querySelectorAll('section[id]').forEach(section=>observer.observe(section));
const emailForm=document.querySelector('#persona-email form'),emailStatus=document.querySelector('#persona-email-status');
const emailEndpoint=document.querySelector('meta[name="persona-email-endpoint"]')?.content||'';
if(!emailEndpoint){emailStatus.textContent='Email delivery is not available yet. You can download your report directly below.';emailForm.querySelector('[type="submit"]').disabled=true;}
function downloadReport(){
 const clone=document.documentElement.cloneNode(true);clone.querySelectorAll('script,dialog,[data-email-report],.sp-resultsprompt,#upgrade-now').forEach(s=>s.remove());const blob=new Blob(['<!doctype html>'+clone.outerHTML],{type:'text/html'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${sourceCode}-${result?.variant||sourceVariant}-report.html`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.querySelector('#persona-email').close();
}
document.querySelector('#persona-download-direct').addEventListener('click',downloadReport);
emailForm.addEventListener('submit',async event=>{
 event.preventDefault();if(!emailEndpoint)return;
 const button=emailForm.querySelector('[type="submit"]');button.disabled=true;emailStatus.textContent='Sending your report…';
 try{
  const response=await fetch(emailEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:emailForm.querySelector('input[type="email"]').value,type:sourceCode+'-'+sourceVariant,result,reportUrl:location.href,website:emailForm.querySelector('[name="website"]').value})});
  if(!response.ok)throw new Error('Delivery failed');
  const delivery=await response.json();if(delivery.sent!==true)throw new Error('Delivery not confirmed');
  emailStatus.textContent='Your report is on its way. Please check your inbox and spam folder.';
 }catch{emailStatus.textContent='Your email could not be sent. Please try again or download your report directly.';}
 finally{button.disabled=false;}
});

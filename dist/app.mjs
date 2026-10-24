import {referenceMarkup,referenceDemoAnswers,referenceChapters} from './reference-report.mjs';
import {profiles,buildReport,reportScene,narrativeText} from './report.mjs';
import {VERSION,axes,questions,originalQuestions,bigFiveAxes,ipipSources,TOTAL,PAGES,PAGE_SIZE,optionLabels,optionValues,score,restoreProgress} from './model.mjs';
const key='persona-spectrum-v1';
const root=document.querySelector('#app');
const dialog=document.querySelector('#info-dialog');
let demoCode=null,demoStress='A',reportObserver=null;
let answers={},page=0,view='test',canStore=true,restored=false,migrated=false;
try{const state=restoreProgress(JSON.parse(localStorage.getItem(key)||'null'));({answers,page,view,migrated}=state);restored=Object.keys(answers).length>0;}catch{canStore=false;}
const count=()=>Object.keys(answers).length;
function persist(){try{localStorage.setItem(key,JSON.stringify({version:VERSION,answers,page,view}));}catch{canStore=false;}}
const icons={clock:'<circle cx="16" cy="16" r="11"/><path d="M16 9v7l5 3"/>',heart:'<path d="M16 26S3 18 3 10a7 7 0 0 1 13-3 7 7 0 0 1 13 3c0 8-13 16-13 16Z"/>',leaf:'<path d="M6 25C-1 6 20 4 27 5c1 16-10 24-21 20ZM7 25 23 9"/>'};
const icon=name=>`<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
function hero(){return `<section class="hero"><span class="hero-shape shape-one"></span><span class="hero-shape shape-two"></span><p class="eyebrow">A LITTLE CURIOSITY. A DEEPER UNDERSTANDING.</p><h1>认识自己，从真实的回答开始。</h1><p class="intro">没有标准答案，也不需要成为任何人。<br><strong>跟随直觉，探索属于你的性格光谱。</strong></p><button class="text-button" data-action="demo">先看看完整报告示例 ↗</button><div class="hero-meta"><span><b>◷</b> 约 15–20 分钟</span><span><b>◇</b> 110 题 · 双题库</span><span><b>⌁</b> 性格倾向 + 大五人格</span></div></section><section class="tips" aria-label="答题提示"><div class="tip">${icon('clock')}<div><strong>不必过度思考</strong><span class="tip-detail">选择平时的你，而不是理想中的你。</span></div></div><div class="tip">${icon('heart')}<div><strong>诚实面对自己</strong><span class="tip-detail">没有好坏之分，每种倾向都有价值。</span></div></div><div class="tip">${icon('leaf')}<div><strong>为变化留出空间</strong><span class="tip-detail">结果是一次观察，不是永远的标签。</span></div></div></section>`;}
function renderQuestion(q){return `<fieldset class="question ${Number.isInteger(answers[q.id])?'answered':''}" id="${q.id}"><legend id="${q.id}-label"><small>${String(q.number).padStart(2,'0')} / ${TOTAL}</small>${q.text}</legend><div class="choices"><span class="scale-end" aria-hidden="true">认同</span>${optionValues.map((value,i)=>`<label class="choice" style="--size:${[50,42,33,25,33,42,50][i]}px;--tone:${i<3?'#54a88f':i===3?'#a9a4ac':'#8863a3'}" title="${optionLabels[i]}"><input type="radio" name="${q.id}" value="${value}" aria-label="${optionLabels[i]}" ${answers[q.id]===value?'checked':''}><span aria-hidden="true"></span></label>`).join('')}<span class="scale-end" aria-hidden="true">不认同</span></div><div class="scale-mobile" aria-hidden="true"><span>认同</span><span>不认同</span></div></fieldset>`;}
function renderTest(){
 reportObserver?.disconnect();
 root.innerHTML=hero()+`${restored?`<div class="resume"><span>${migrated?'已保留旧版答案，新题待补充':'已恢复本机进度'} · 已答 ${count()} / ${TOTAL} 题</span><button class="text-button" data-action="reset">重新开始</button></div>`:''}<section class="test-wrap" id="test" aria-label="人格探索测试"><div class="progress-area"><div class="progress-head"><strong>第 ${page+1} / ${PAGES} 组</strong><span id="count-label">已完成 ${count()} / ${TOTAL} 题 · ${Math.round(count()/TOTAL*100)}%</span></div><div class="progress-track" role="progressbar" aria-label="答题进度" aria-valuemin="0" aria-valuemax="${TOTAL}" aria-valuenow="${count()}"><div class="progress-fill" style="width:${count()/TOTAL*100}%"></div></div></div><form id="quiz-form" novalidate>${questions.slice(page*PAGE_SIZE,page*PAGE_SIZE+PAGE_SIZE).map(renderQuestion).join('')}<div class="page-actions">${page>0?'<button type="button" class="secondary" data-action="previous">← 上一组</button>':''}<button class="primary" type="submit">${page===PAGES-1?'查看我的结果':'下一组'}<span aria-hidden="true">→</span></button></div><div class="error" id="form-error" role="alert"></div></form><p class="page-note">${canStore?'进度仅保存在当前浏览器。110题较长，可以随时暂停、回来继续。':'浏览器存储不可用；关闭或刷新页面会丢失本次作答。'}<br>独立自我探索原型，非 16Personalities 或官方 MBTI 测评。<button class="text-button" data-action="method">了解评分方式</button></p></section>`;
 document.querySelector('#quiz-form').addEventListener('change',e=>{
  if(e.target.type!=='radio')return;answers[e.target.name]=Number(e.target.value);persist();
  const field=e.target.closest('fieldset');field.classList.add('answered');field.classList.remove('invalid');
  document.querySelector('#count-label').textContent=`已完成 ${count()} / ${TOTAL} 题 · ${Math.round(count()/TOTAL*100)}%`;
  document.querySelector('.progress-fill').style.width=count()/TOTAL*100+'%';document.querySelector('[role="progressbar"]').setAttribute('aria-valuenow',count());
  document.querySelector('#form-error').textContent='';
  const resumeText=document.querySelector('.resume span');if(resumeText)resumeText.textContent=`${migrated?'已保留旧版答案，新题待补充':'已恢复本机进度'} · 已答 ${count()} / ${TOTAL} 题`;
 });
 document.querySelector('#quiz-form').addEventListener('submit',e=>{e.preventDefault();const missing=questions.slice(page*PAGE_SIZE,page*PAGE_SIZE+PAGE_SIZE).filter(q=>!Number.isInteger(answers[q.id]));if(missing.length){document.querySelector('#form-error').textContent=`还有 ${missing.length} 道题未选择，请完成后继续。`;missing.forEach(q=>document.getElementById(q.id).classList.add('invalid'));document.querySelector(`#${missing[0].id} input`).focus({preventScroll:true});document.getElementById(missing[0].id).scrollIntoView({block:'center',behavior:'smooth'});return;}if(page===PAGES-1){view='result';persist();render();window.scrollTo({top:0,behavior:'smooth'});}else{page++;persist();renderTest();document.querySelector('#test').scrollIntoView({block:'start',behavior:'smooth'});}});
}
function insight(result){
 const [e,n,t,j]=result.dimensions;const hasX=result.code.includes('X');
 const lead=hasX?'你的倾向，保留了更多可能。':n.letter==='N'?(t.letter==='T'?'以想象打开可能，以逻辑找到方向。':'看见新的可能，也看见人的感受。'):(j.letter==='J'?'把眼前的事情，一件件做到扎实。':'在真实的体验中，找到自己的节奏。');
 const work=j.letter==='J'?'把目标、边界和截止时间说清楚，可能更容易让你进入状态。也可以刻意留一点缓冲，给新信息和变化空间。':j.letter==='P'?'保留选择和调整空间，可能更容易激发你的行动。面对长任务，可以尝试用小里程碑帮助自己及时收尾。':'这次作答没有显示明确的计划或灵活偏向。你可以比较独立任务和团队任务中的实际习惯。';
 const energy=e.letter==='E'?'你在交流一侧的得分更高。重要任务中，可以尝试通过讨论推进思考，同时给自己保留安静整理的时间。':e.letter==='I'?'你在独处一侧的得分更高。集中思考可能更适合你，也可以用小范围、提前准备的交流帮助想法被看见。':'外向与内向两侧得分相同。具体环境可能比一个固定标签更能解释你的能量变化。';
 return `<p class="eyebrow">YOUR PERSONAL SPECTRUM</p><div class="lead">${lead}</div><p>这是60道原创题对你本次作答的概括，不是能力排名。相同的倾向，也可以有完全不同的生活方式。</p><h3>你的能量节奏</h3><p>${energy}</p><h3>给工作中的你</h3><p>${work}</p>`;
}
function resultText(r){return `人格光谱 · 110题双画像\n原创性格倾向：${r.code}\n\n${r.dimensions.map(d=>`${d.name}：${d.left} ${d.leftPercent}% / ${d.right} ${d.rightPercent}%${d.boundary?'（接近中点）':''}`).join('\n')}\n\nIPIP大五人格（50题，中文自译、七档改编）\n${r.bigFive.map(d=>`${d.name}：均分 ${d.mean.toFixed(1)} / 7；量程位置 ${d.percent}%`).join('\n')}\n\n两套题目分别计分，IPIP答案不参与四字母类型计算。量程位置不是人口百分位或准确率。中文译文及组合版本尚未验证，不等同于16Personalities或官方MBTI。\n来源：${ipipSources.items}\n许可：${ipipSources.permission}\n版本：${VERSION}`;}
const axisFor=q=>(q.source==='ipip50'?bigFiveAxes:axes).find(a=>a.id===q.axis);
const contribution=(q,value)=>q.source==='ipip50'?(q.direction===1?value+4:4-value):value*q.direction*q.weight;
function bigFivePanel(result){return `<section class="bigfive-section"><div class="report-heading"><div><p class="eyebrow">ANOTHER PERSPECTIVE · IPIP-50</p><h2>你的大五人格画像</h2></div><span class="bank-tag">新增 50 题 · 独立计分</span></div><p class="bank-intro">从外向性、宜人性、尽责性、情绪稳定性及智性 / 想象力观察自己。这里的百分数表示得分在量程中的位置，不是你超过了多少人，也不表示能力高低。</p><div class="bigfive-grid">${result.bigFive.map(d=>`<article class="bigfive-card" style="--color:${d.color};--percent:${d.percent}%"><h3>${d.name}<strong>${d.mean.toFixed(1)}<small> / 7</small></strong></h3><div class="dimension-bar" role="img" aria-label="${d.name}，均分${d.mean.toFixed(1)}/7，量程位置${d.percent}%"><span></span></div><div class="range-labels"><span>较少符合</span><span>较多符合</span></div><p>${d.hint}</p></article>`).join('')}</div><p class="formula-note">来源：IPIP Big-Five Factor Markers 50题。采用自译中文和七档作答；原题方向保留，本中文组合版本尚未验证。${result.bigFive[0].mean===4?'中点得分也可能来自不同答案的抵消，不能据此认定人格均衡。':''}</p></section>`;}
function currentResult(){return demoCode?score(referenceDemoAnswers(demoCode,demoStress)):score(answers);}
function renderResult(){
 const result=currentResult();reportObserver?.disconnect();
 root.innerHTML=referenceMarkup(result,{demo:Boolean(demoCode),base:result.code.split('-')[0],stress:demoStress,profiles});
 document.querySelector('#demo-type')?.addEventListener('change',e=>{demoCode=e.target.value;renderResult();});
 document.querySelector('#demo-stress')?.addEventListener('change',e=>{demoStress=e.target.value;renderResult();});
 document.querySelector('#nr-chapter-select').addEventListener('change',e=>document.querySelector('#nr-'+e.target.value)?.scrollIntoView({behavior:'smooth',block:'start'}));
 document.querySelectorAll('[data-nr-chart]').forEach(button=>button.addEventListener('click',()=>{const rings=button.dataset.nrChart==='rings';document.querySelector('.nr-bars').hidden=rings;document.querySelector('.nr-rings').hidden=!rings;document.querySelectorAll('[data-nr-chart]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
 document.querySelectorAll('[data-nr-help]').forEach(button=>button.addEventListener('click',()=>{const i=Number(button.dataset.nrHelp),d=result.dimensions[i],g=buildReport(result).selected[i];openInfo(d.name,`<p>${g.meaning}</p><p>${d.left} ${d.leftPercent}% / ${d.right} ${d.rightPercent}%</p><p>本数值是问卷量程换算，不是准确率或人口排名。</p>`);}));
 if('IntersectionObserver' in window){reportObserver=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(!visible)return;const chapter=visible.target.id.replace('nr-','');document.querySelector('#nr-chapter-select').value=chapter;document.querySelectorAll('[data-nr-nav]').forEach(a=>{if(a.dataset.nrNav===chapter)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'-90px 0px -55% 0px',threshold:0});referenceChapters.forEach(([id])=>reportObserver.observe(document.querySelector('#nr-'+id)));}
}

function render(){view==='result'?renderResult():renderTest();}
function openInfo(title,body){document.querySelector('#dialog-title').textContent=title;document.querySelector('#dialog-body').innerHTML=body;if(!dialog.open)dialog.showModal();}
function method(){openInfo('题库来源与独立计分',`<p>本版共 ${TOTAL} 题：60 道原创性格探索题，加上完整的 50 道 IPIP Big-Five Factor Markers。两类题穿插出现，但分别计分。不是16Personalities原题或原站算法。</p><h3>为什么没有把分数直接混在一起？</h3><p>大五人格中的宜人性不等于“情感型”，智性 / 想象力也不等于“直觉型”。IPIP 50题不改变原创题生成的类型代码，而是提供第二份独立画像。</p><h3>原创60题</h3><p>各维12题，正反各6题，每题权重1。七档选择按 +3 至 −3 记录。</p><code>S = Σ（答案值 × 正反方向）<br>左侧百分比 = round(50 + 50 × S / 36)<br>右侧百分比 = 100 − 左侧百分比</code><p>得分相同时显示X。距中点不超过8个百分点的提示是产品约定，不是统计置信度。</p><h3>IPIP 50题：公开题库，中文七档改编</h3><p>官方IPIP材料处于公有领域，允许商业使用、翻译和与其他题目混排。这里保留全部50题与官方正反向计分键，中文为本项目自译，不是已验证的标准中文版。原示例常用五档，本版统一为七档，不能直接套用五档研究中的原始分常模。</p><code>x = 答案值 + 4（1至7）<br>正向题得分 = x；反向题得分 = 8 − x<br>每维10题，原始总分10至70；均分 = 总分 / 10<br>展示量程位置 = round((总分 − 10) ÷ 60 × 100)</code><p>IPIP五维分别为外向性、宜人性、尽责性、情绪稳定性与智性 / 想象力。原始题库方向是情绪稳定性，未误标为神经质。展示值不是人口百分位或能力测验。</p><p><a href="${ipipSources.items}" target="_blank" rel="noopener">官方50题示例 ↗</a>　<a href="${ipipSources.key}" target="_blank" rel="noopener">官方计分键 ↗</a>　<a href="${ipipSources.permission}" target="_blank" rel="noopener">商业使用许可 ↗</a></p><h3>还有哪些题库？</h3><p>IPIP还包含Mini-IPIP等短版、IPIP-NEO等长版及更多具体特质题库，应按构念与用途选择，避免重复计数。HEXACO-PI-R是另一套六因素量表，其官方非学术使用需要联系作者，未加入本商业原型。</p><h3>逐题来源与计分键</h3>${[{title:'原创性格题',list:axes,source:'original'},{title:'IPIP大五题',list:bigFiveAxes,source:'ipip50'}].map(bank=>bank.list.map(a=>`<details><summary>${bank.title} · ${a.name}</summary><p>${a.hint}</p><ol>${questions.filter(q=>q.source===bank.source&&q.axis===a.id).map(q=>`<li>第 ${q.number} 题：${q.text}${q.english?`<br><small lang="en">${q.english}</small>`:''}<br><small>题库内编号 ${q.sourceNumber} · ${q.direction>0?'正向':'反向'} · 权重1</small></li>`).join('')}</ol></details>`).join('')).join('')}<p>本组合问卷与中文译文尚未完成信度、效度或本地常模验证。题目更多不自动代表更准确。</p>`);}
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3500);}

function downloadReport(result,isDemo){
 const text=(isDemo?'【模拟示例数据，不是你的个人结果】\n':'')+resultText(result)+narrativeText(result);
 const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download=`人格光谱-${isDemo?'示例-':''}${result.code}.txt`;a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);toast('完整文字报告已开始下载');
}
function requestReportEmail(){
 const result=currentResult(),isDemo=Boolean(demoCode);
 openInfo('留下邮箱，下载完整报告',`<form id="report-email-form" class="report-email-form"><p>填写你的邮箱，即可下载这份完整报告。</p><label for="report-email">邮箱地址</label><input id="report-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" required maxlength="254" aria-describedby="report-email-note report-email-error"><small id="report-email-note">邮箱仅保存在当前浏览器，不会发送邮件。</small><p id="report-email-error" class="error" role="alert"></p><button type="submit" class="primary">确认并下载报告</button></form>`);
 const form=document.querySelector('#report-email-form'),input=form.elements.email,error=document.querySelector('#report-email-error');
 input.focus();
 form.addEventListener('submit',e=>{
  e.preventDefault();error.textContent='';input.value=input.value.trim();
  if(!form.reportValidity())return;
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)){error.textContent='请填写有效的邮箱地址，例如 you@example.com。';input.focus();return;}
  try{
   const stored=JSON.parse(localStorage.getItem('persona-spectrum-report-emails')||'[]');
   const entries=Array.isArray(stored)?stored:[];
   const record={email:input.value,type:result.code,isDemo,createdAt:new Date().toISOString()};
   const previous=entries.findIndex(item=>item.email.toLowerCase()===record.email.toLowerCase()&&item.type===record.type&&item.isDemo===record.isDemo);
   if(previous<0)entries.push(record);else entries[previous]=record;
   localStorage.setItem('persona-spectrum-report-emails',JSON.stringify(entries));
  }catch{error.textContent='当前浏览器无法保存邮箱，请允许本地存储后重试。';return;}
  dialog.close();downloadReport(result,isDemo);
 });
}
document.addEventListener('click',async e=>{
 if(e.target.closest('a[href="#test"]')&&(demoCode||view==='result')){e.preventDefault();demoCode=null;view='test';persist();renderTest();document.querySelector('#test').scrollIntoView({behavior:'smooth'});return;}
 const action=e.target.closest('[data-action]')?.dataset.action;if(!action)return;
 if(action==='demo'){demoCode='INTP';demoStress='A';renderResult();window.scrollTo({top:0,behavior:'smooth'});}
 if(action==='exit-demo'){demoCode=null;render();window.scrollTo({top:0,behavior:'smooth'});}
 if(action==='close-dialog')dialog.close();
 if(action==='method')method();
 if(action==='privacy')openInfo('数据只留在你的浏览器',`<p>你的答题记录通过当前浏览器的本地存储保存，不会由本应用上传到服务器。不设置账户，也没有第三方分析脚本。下载报告时填写的邮箱与报告类型仅保存在当前浏览器，不会上传或发送邮件。</p><p>同一设备、同一浏览器中的其他使用者可能看到已保存的进度。你可以随时通过「清除本机答题记录」删除本应用保存的答案。</p><p>浏览器隐私模式或存储限制可能导致进度无法保存。站点托管服务仍可能处理常规访问日志；本应用不将答案放入网址。</p><button class="secondary" data-action="reset">清除本机答题记录</button>`);
 if(action==='previous'){page=Math.max(0,page-1);persist();renderTest();document.querySelector('#test').scrollIntoView({behavior:'smooth'});}
 if(action==='review'){view='test';page=0;persist();render();document.querySelector('#test').scrollIntoView({behavior:'smooth'});}
 if(action==='reset')openInfo('重新开始测试？',`<p>这会清除本浏览器已保存的 ${count()} 道答案与结果，回到第一组。</p><div class="page-actions"><button class="secondary" data-action="close-dialog">保留进度</button><button class="primary" data-action="confirm-reset">清除并重新开始</button></div>`);
 if(action==='confirm-reset'){answers={};page=0;view='test';restored=false;try{localStorage.removeItem(key);localStorage.removeItem('persona-spectrum-report-emails');}catch{}dialog.close();render();window.scrollTo({top:0,behavior:'smooth'});}
 if(action==='copy'){const text=(demoCode?'【模拟示例数据，不是你的个人结果】\n':'')+resultText(currentResult())+narrativeText(currentResult());try{await navigator.clipboard.writeText(text);toast('结果已复制');}catch{openInfo('复制你的结果','<p>浏览器未允许自动复制，请选择下方文字手动复制。</p><textarea id="copy-result" readonly style="width:100%;min-height:260px;padding:15px"></textarea>');document.querySelector('#copy-result').value=text;document.querySelector('#copy-result').select();}}
 if(action==='download')requestReportEmail();
 if(action==='print')window.print();
});
dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}});
if(location.hash==='#reference-preview'){demoCode='INTP';demoStress='A';renderResult();}else render();

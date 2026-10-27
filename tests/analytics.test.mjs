import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {englishQuestions, calculateEnglish} from '../dist/english-model.mjs';
import {completedTestProperties} from '../dist/analytics-events.mjs';

const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
const snippet=read('content/posthog-snippet.html');
const privacy=read('content/posthog-privacy.js');

test('PostHog bootstrap preserves supplied init, masks inputs, and owns hash pageviews exactly once',()=>{
 const handlers={},loads=[],input={classList:{add(name){this.name=name;}}};
 const context=vm.createContext({URL,location:{href:'https://example.com/MBTI/?email=private@example.com#test'},
  document:{createElement:()=>({}),getElementsByTagName:()=>[{parentNode:{insertBefore(script){loads.push(script.src);}}}],querySelectorAll:()=>[input],addEventListener(name,fn){handlers[name]=fn;},body:{}},
  MutationObserver:class{observe(){}},addEventListener(name,fn){handlers[name]=fn;}});
 context.window=context;
 vm.runInContext(privacy,context);
 vm.runInContext(snippet.replace(/^<script>\s*|\s*<\/script>$/g,''),context);
 assert.equal(loads[0],'https://us-assets.i.posthog.com/static/array.js');
 const [key,options]=context.posthog._i[0];
 assert.equal(key,'phc_CxspSNsuUaxy345hVq7YQa6PkbYeTvLHvPkdpWhALHsE');
 assert.equal(options.api_host,'https://us.i.posthog.com');
 assert.equal(options.defaults,'2026-05-30');
 assert.equal(options.person_profiles,'identified_only');
 context.personaAnalytics.start();
 assert.equal(options.capture_pageview,false);
 assert.equal(options.disable_session_recording,true);
 assert.equal(options.mask_all_text,true);
 assert.equal(options.mask_all_element_attributes,true);
 assert.equal(options.ip,false);
 handlers.DOMContentLoaded();assert.equal(input.classList.name,'ph-no-capture');
 const captures=()=>context.posthog.filter(item=>item[0]==='capture');
 assert.equal(captures().length,1);
 assert.equal(captures()[0][2].$current_url,'https://example.com/MBTI/#test');
 context.location.href='https://example.com/MBTI/#results';handlers.hashchange();
 assert.equal(captures().length,2);
 context.personaAnalytics.capture('email_form_submitted',{email:'private@example.com',answers:{secret:true}});
 assert.deepEqual(Object.keys(captures().at(-1)[2]),[]);
 context.personaAnalytics.capture('test_page_completed',{page:3,email:'private@example.com'});
 assert.deepEqual(Object.keys(captures().at(-1)[2]),['page']);
 assert.equal(captures().at(-1)[2].page,3);
 const count=captures().length;context.personaAnalytics.capture('unknown',{email:'private@example.com'});
 assert.equal(captures().length,count);
 const event=options.before_send({properties:{$current_url:'https://example.com/report#result=SECRET',$referrer:'https://source.example/?email=private@example.com',$set_once:{email:'private@example.com'}}});
 assert.equal(event.properties.$current_url,'https://example.com/report');
 assert.equal(event.properties.$referrer,'https://source.example/');
 assert.ok(!('$set_once' in event.properties));
 // Once array.js replaces the stub, all future calls must use the live SDK.
 const live=[];context.posthog={capture:(...args)=>live.push(args)};
 context.personaAnalytics.capture('test_started');handlers.hashchange();
 assert.deepEqual(live.map(e=>e[0]),['test_started','$pageview']);
 context.personaAnalytics.start();assert.equal(live.length,2);
});

function assessment(answers={}){
 const events=[],listeners={};
 const classList={add(){},remove(){},toggle(){}};
 const fields=englishQuestions.map(q=>({id:q.id,classList,scrollIntoView(){},querySelector(){return {focus(){}};}}));
 const form={addEventListener(){},querySelectorAll:()=>fields.slice(0,6),querySelector:()=>null};
 const error={},style={};
 const root={innerHTML:'',querySelectorAll:()=>fields,querySelector(selector){
  if(selector==='form')return form;
  if(selector==='#previous')return null;
  if(selector==='.q-hm')return this.innerHTML.includes('q-hm')?{}:null;
  if(selector==='#error')return error;
  return {scrollIntoView(){},focus(){}};
 }};
 const location={hash:'#test',href:''};
 const ctx=vm.createContext({englishQuestions,calculateEnglish,completedTestProperties,trackEvent:(name,props={})=>events.push([name,props]),
  englishHomeMarkup:()=>'<div class="q-hm"></div>',bindEnglishHome(){},location,
  document:{body:{classList},querySelector:s=>s==='#app'?root:style,getElementById:()=>null},
  localStorage:{getItem:key=>key.endsWith('v2')?JSON.stringify({answers,page:0}):null,setItem(){}},sessionStorage:{setItem(){}},
  addEventListener:(name,fn)=>(listeners[name]??=[]).push(fn),clearTimeout(){},setTimeout(){},scrollTo(){},matchMedia:()=>({matches:true})});
 vm.runInContext(read('dist/english-app.mjs').replace(/^import .*;\r?\n/gm,''),ctx);
 return {events,submit:()=>form.onsubmit({preventDefault(){}}),location,hash:()=>listeners.hashchange.forEach(fn=>fn())};
}

test('assessment emits valid groups and one completion, without restart events on internal renders',()=>{
 const answers=Object.fromEntries(englishQuestions.map(q=>[q.id,3]));
 const app=assessment(answers);
 assert.equal(app.events[0][0],'test_started');
 for(let i=0;i<10;i++)app.submit();
 assert.equal(app.events.filter(e=>e[0]==='test_started').length,1);
 assert.deepEqual(app.events.filter(e=>e[0]==='test_page_completed').map(e=>e[1].page),[1,2,3,4,5,6,7,8,9,10]);
 const completed=app.events.filter(e=>e[0]==='test_completed');assert.equal(completed.length,1);
 assert.deepEqual(completed[0][1],completedTestProperties(calculateEnglish(answers)));
 assert.deepEqual(Object.keys(completed[0][1]).sort(),['at','ei','jp','ns','tf','type','variant']);
 assert.match(app.location.href,/reports\/ISTP-A.html/);
 app.location.hash='';app.hash();app.location.hash='#test';app.hash();
 assert.equal(app.events.filter(e=>e[0]==='test_started').length,2);
});

test('incomplete groups emit no completion; tied results do not invent a completed type',()=>{
 const incomplete=assessment();incomplete.submit();
 assert.deepEqual(incomplete.events.map(e=>e[0]),['test_started']);
 const tied=assessment(Object.fromEntries(englishQuestions.map(q=>[q.id,0])));
 for(let i=0;i<10;i++)tied.submit();
 assert.equal(tied.events.filter(e=>e[0]==='test_completed').length,0);
 assert.equal(tied.location.href,'');
});

test('online homepage and every report retain exact snippet in head and protect all input controls',()=>{
 const names=['dist/index.html',...fs.readdirSync(new URL('../dist/reports/',import.meta.url)).filter(n=>n.endsWith('.html')).map(n=>'dist/reports/'+n)];
 assert.equal(names.length,49);
 for(const name of names){
  const html=read(name),head=html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
  assert.ok(head?.includes(snippet),name);
  assert.equal((html.match(/persona-analytics:start/g)||[]).length,1,name);
  for(const tag of html.match(/<(?:input|textarea|select)\b[^>]*>/gi)||[])assert.match(tag,/class="[^"]*\bph-no-capture\b/,name);
 }
});

test('report view, download, and valid submit events never include the entered email',async()=>{
 const events=[],handlers={},requests=[];
 const email={value:'private@example.com'},submit={},status={};
 let valid=false;
 const form={reportValidity:()=>valid,querySelector:s=>s==='[type="submit"]'?submit:s==='input[type="email"]'?email:{value:''},addEventListener:(name,fn)=>{handlers[name]=fn;}};
 const dialog={showModal(){}};
 const document={body:{dataset:{personaType:'INFP',personaVariant:'T'}},documentElement:{style:{setProperty(){}}},
  createElement:()=>({dataset:{}}),querySelectorAll:()=>[],
  querySelector:s=>({'#persona-email form':form,'#persona-email-status':status,'meta[name="persona-email-endpoint"]':{content:'https://example.com/requests'},'#persona-email':dialog}[s]||null),
  addEventListener:(name,fn)=>{handlers[name]=fn;}};
 const ctx=vm.createContext({document,URL,location:{hash:'',protocol:'https:'},
  trackEvent:(name,properties={})=>events.push([name,JSON.parse(JSON.stringify(properties))]),
  IntersectionObserver:class{observe(){}},sessionStorage:{getItem:()=>null},answerRecordKey:'record',matchingAnswerRecord:()=>null,
  fetch:async(url,options)=>{requests.push(JSON.parse(options.body));return {ok:true,json:async()=>({received:true})};},alert(){}});
 vm.runInContext(read('dist/report-runtime.mjs').replace(/^import .*;\r?\n/gm,''),ctx);
 assert.deepEqual(events,[['report_viewed',{type:'INFP',variant:'T'}]]);
 handlers.click({target:{closest:()=>({textContent:'Download your report by email',matches:()=>true})},preventDefault(){}});
 assert.equal(events.filter(e=>e[0]==='report_download_clicked').length,1);
 await handlers.submit({preventDefault(){}});
 assert.equal(events.filter(e=>e[0]==='email_form_submitted').length,0);
 valid=true;await handlers.submit({preventDefault(){}});
 assert.equal(events.filter(e=>e[0]==='email_form_submitted').length,1);
 assert.equal(requests[0].email,'private@example.com'); // Only the existing fulfillment endpoint gets this.
 assert.ok(!JSON.stringify(events).includes('private@example.com'));
 assert.deepEqual(events.at(-1),['email_form_submitted',{}]);
});

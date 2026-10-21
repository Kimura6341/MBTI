// Original exploratory questionnaire. Not the NERIS or official MBTI instrument.
import {ipipQuestions,scoreBigFive,bigFiveAxes,ipipSources} from './ipip.mjs';
export {ipipQuestions,bigFiveAxes,ipipSources};
export const VERSION = 'spectrum-2.0';
export const axes = [
 {id:'energy',name:'能量来源',left:'外向',right:'内向',letters:['E','I'],color:'#4298b4',hint:'你更倾向于在交流中获得能量，还是通过独处恢复状态？'},
 {id:'mind',name:'信息偏好',left:'探索',right:'务实',letters:['N','S'],color:'#d5a54b',hint:'你更容易被新的可能吸引，还是先关注可验证的具体事实？'},
 {id:'nature',name:'决策方式',left:'理性',right:'共情',letters:['T','F'],color:'#6eae91',hint:'做取舍时，你更优先考虑一致的逻辑，还是人的感受和处境？'},
 {id:'tactics',name:'行动节奏',left:'计划',right:'灵活',letters:['J','P'],color:'#9175aa',hint:'你更喜欢提前确定路径，还是保留调整和即兴行动的空间？'},
 {id:'identity',name:'压力反应',left:'从容',right:'敏感',letters:['A','T'],color:'#cf7c82',hint:'面对不确定和反馈，你通常保持稳定，还是更容易反复思考？'}
];
const bank = [
 ['和不太熟悉的人聊天后，我通常会更有精神。','空闲时，我常会主动约人一起活动。','在讨论中说出来，能帮助我理清自己的想法。','进入新群体时，我愿意先开口介绍自己。','完成一件开心的事后，我很想马上找人分享。','比起独自思考，我更享受与人碰撞观点。','连续参加社交活动后，我需要独处才能恢复。','即使身边有熟人，我也常选择安静待着。','遇到重要事情，我更愿意想清楚后再与人交流。','聚会里，我倾向于与少数人深入交谈。','没有社交安排的周末，我也能过得很充实。','相比临时来电，我更喜欢有时间组织回复的文字交流。'],
 ['我会因为一个大胆的新想法而暂时放下熟悉的方法。','面对新问题，我喜欢先想象几种不同的可能。','我经常思考事情背后的规律和关联。','比起重复熟练的工作，我更享受探索未知。','我愿意讨论暂时没有实际用途的概念。','理解整体方向，通常比先掌握所有细节更能帮助我。','我更信任亲自验证过的方法，而不是新颖的设想。','学习新东西时，具体实例比抽象解释更有帮助。','做决定前，我习惯先确认手头有哪些事实。','我更关注一个方案现在如何落地，而不是远期想象。','与其猜测隐含意义，我更愿意按事情本身来理解。','我喜欢清楚、具体、可以直接照做的说明。'],
 ['即使结论不讨人喜欢，我也希望按同一套标准判断。','意见不同时，我通常先检查哪一方的推理更完整。','分配资源时，我更优先考虑明确的规则和效果。','收到建议时，我先判断内容是否有道理。','我愿意指出方案的问题，即使这会让讨论短暂尴尬。','做困难选择时，我习惯列出收益、成本和约束。','做决定前，我会特别考虑每个人的具体处境。','表达不同意见时，我会先照顾对方的感受。','团队气氛变得紧张时，我很难只关注任务本身。','朋友倾诉时，我通常先回应情绪，再讨论办法。','在规则允许的范围内，我愿意为人的特殊情况调整安排。','评估一个结果时，我很在意参与者是否感到被尊重。'],
 ['提前安排好接下来的事情，会让我更安心。','开始一个项目之前，我喜欢先确定步骤和时间。','我通常会在截止日期之前留出检查的余地。','行程确定下来后，我更愿意按计划执行。','我喜欢把尚未完成的事情整理成明确清单。','与他人合作时，我希望提前说清分工和交付时间。','我更喜欢先开始，再根据进展决定下一步。','临时出现更好的机会时，我愿意打乱原有安排。','即使计划还不完整，我也能轻松采取行动。','给日程保留较多空白，会让我感觉更自在。','在确定最终方案前，我喜欢尽量保留多个选项。','我能享受没有预先安排的旅行或周末。'],
 ['一次小失误通常不会让我长时间怀疑自己。','面对不确定的结果，我大多能维持平常的生活节奏。','收到批评后，我通常能较快把注意力转向可做的改进。','当别人不同意我时，我仍能平静表达自己的判断。','完成力所能及的准备后，我比较容易停止担心。','与他人比较时，我通常仍能认可自己的进度。','事情结束后，我经常反复回想自己有没有做错。','即使准备充分，我也容易担心结果不够好。','他人随口的一句评价，有时会让我想很久。','计划突然变化时，我需要较长时间才能平静下来。','一个不理想的结果，容易影响我对自己的整体评价。','面对需要被评价的任务，我常会不断检查细节。']
];
// Interleave dimensions and alternate positive / reverse keys across each page.
export const originalQuestions = Array.from({length:60},(_,i)=>{
 const axis=i%5, round=Math.floor(i/5), item=round%2===0?round/2:6+Math.floor(round/2);
 return {id:'q'+(i+1),sourceNumber:i+1,axis:axes[axis].id,text:bank[axis][item],direction:item<6?1:-1,weight:1,source:'original'};
});
export const questions=Array.from({length:60},(_,i)=>[originalQuestions[i],...(ipipQuestions[i]?[ipipQuestions[i]]:[])]).flat().map((q,i)=>({...q,number:i+1}));
export const TOTAL=questions.length,PAGE_SIZE=6,PAGES=Math.ceil(TOTAL/PAGE_SIZE);
export const optionLabels=['强烈认同','比较认同','稍微认同','中立 / 不确定','稍微不认同','比较不认同','强烈不认同'];
export const optionValues=[3,2,1,0,-1,-2,-3];
export function score(answers){
 if(!answers||questions.some(q=>!Number.isInteger(answers[q.id])||Math.abs(answers[q.id])>3))throw new Error(`请完成全部${TOTAL}题后查看结果。`);
 const dimensions=axes.map(a=>{
  const items=originalQuestions.filter(q=>q.axis===a.id);
  const sum=items.reduce((v,q)=>v+answers[q.id]*q.direction*q.weight,0);
  const maximum=items.reduce((v,q)=>v+3*q.weight,0);
  const left=Math.round(50+50*sum/maximum),right=100-left;
  return {...a,sum,maximum,leftPercent:left,rightPercent:right,letter:sum===0?'X':a.letters[sum>0?0:1],boundary:Math.abs(left-50)<=8};
 });
 return {version:VERSION,dimensions,bigFive:scoreBigFive(answers),code:dimensions.slice(0,4).map(d=>d.letter).join('')+'-'+dimensions[4].letter};
}
export function validAnswers(raw){
 return Object.fromEntries(questions.filter(q=>Number.isInteger(raw?.[q.id])&&Math.abs(raw[q.id])<=3).map(q=>[q.id,raw[q.id]]));
}
export function restoreProgress(saved){
 if(!saved||!['spectrum-1.0',VERSION].includes(saved.version))return {answers:{},page:0,view:'test',migrated:false};
 const restored=validAnswers(saved.answers),complete=Object.keys(restored).length===TOTAL;
 const migrated=saved.version!==VERSION;
 const firstMissing=questions.findIndex(q=>!Number.isInteger(restored[q.id]));
 const page=migrated?Math.floor(Math.max(0,firstMissing)/PAGE_SIZE):Math.max(0,Math.min(PAGES-1,Number.isInteger(saved.page)?saved.page:0));
 return {answers:restored,page,view:saved.view==='result'&&complete?'result':'test',migrated};
}

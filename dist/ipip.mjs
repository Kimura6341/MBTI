// Public-domain IPIP Big-Five Factor Markers (Goldberg, 1992), 50-item sample.
// Original English retained for provenance. Chinese translations are our own,
// and the seven-point adaptation has not been separately validated.
export const ipipSources={
 items:'https://www.ipip.ori.org/New_IPIP-50-item-scale.htm',
 key:'https://ipip.ori.org/newBigFive5broadKey.htm',
 permission:'https://ipip.ori.org/newPermission.htm'
};
export const bigFiveAxes=[
 {id:'extraversion',name:'外向性',color:'#4298b4',hint:'与人互动、表达和参与社交活动的倾向。'},
 {id:'agreeableness',name:'宜人性',color:'#6eae91',hint:'关注他人、体谅感受与合作的倾向。'},
 {id:'conscientiousness',name:'尽责性',color:'#9175aa',hint:'组织事务、认真完成任务与遵循安排的倾向。'},
 {id:'stability',name:'情绪稳定性',color:'#cf7c82',hint:'面对日常压力时保持平稳的倾向；不是心理健康诊断。'},
 {id:'intellect',name:'智性 / 想象力',color:'#d5a54b',hint:'对抽象概念、思考和想象的自述偏好；不是智商或能力测验。'}
];
const items=[
 ['Am the life of the party.','聚会时，我常是带动气氛的人。',1],
 ['Feel little concern for others.','我很少关心别人的情况。',-1],
 ['Am always prepared.','我做事总是有所准备。',1],
 ['Get stressed out easily.','我很容易感到压力。',-1],
 ['Have a rich vocabulary.','我的词汇量很丰富。',1],
 ["Don't talk a lot.",'我平常话不多。',-1],
 ['Am interested in people.','我对了解别人感兴趣。',1],
 ['Leave my belongings around.','我会把自己的东西随处放着。',-1],
 ['Am relaxed most of the time.','大多数时候，我都感到放松。',1],
 ['Have difficulty understanding abstract ideas.','理解抽象概念对我来说有些困难。',-1],
 ['Feel comfortable around people.','与别人相处时，我感到自在。',1],
 ['Insult people.','我会用言语侮辱别人。',-1],
 ['Pay attention to details.','我会留意细节。',1],
 ['Worry about things.','我容易为各种事情担心。',-1],
 ['Have a vivid imagination.','我的想象力很生动。',1],
 ['Keep in the background.','在群体中，我通常待在不显眼的位置。',-1],
 ["Sympathize with others' feelings.",'我能体谅别人的感受。',1],
 ['Make a mess of things.','我常把东西弄得杂乱。',-1],
 ['Seldom feel blue.','我很少感到低落。',1],
 ['Am not interested in abstract ideas.','我对抽象的想法不感兴趣。',-1],
 ['Start conversations.','我会主动发起谈话。',1],
 ["Am not interested in other people's problems.",'我对别人遇到的问题不感兴趣。',-1],
 ['Get chores done right away.','日常杂事，我通常会马上处理。',1],
 ['Am easily disturbed.','我很容易被事情扰乱心绪。',-1],
 ['Have excellent ideas.','我常有很好的点子。',1],
 ['Have little to say.','我常觉得没有太多话要说。',-1],
 ['Have a soft heart.','我容易心软。',1],
 ['Often forget to put things back in their proper place.','我常忘记把东西放回原处。',-1],
 ['Get upset easily.','我很容易心烦。',-1],
 ['Do not have a good imagination.','我觉得自己的想象力不太好。',-1],
 ['Talk to a lot of different people at parties.','聚会时，我会和许多不同的人交谈。',1],
 ['Am not really interested in others.','我不太关心别人。',-1],
 ['Like order.','我喜欢井然有序。',1],
 ['Change my mood a lot.','我的心情变化较多。',-1],
 ['Am quick to understand things.','我理解事物通常很快。',1],
 ["Don't like to draw attention to myself.",'我不喜欢引人注意。',-1],
 ['Take time out for others.','我愿意抽出时间陪伴或帮助别人。',1],
 ['Shirk my duties.','我有时会逃避自己应尽的职责。',-1],
 ['Have frequent mood swings.','我的情绪常常起伏不定。',-1],
 ['Use difficult words.','我会使用较难懂的词语。',1],
 ["Don't mind being the center of attention.",'成为众人关注的焦点，我也不介意。',1],
 ["Feel others' emotions.",'我能感受到别人的情绪。',1],
 ['Follow a schedule.','我会按时间表行事。',1],
 ['Get irritated easily.','我很容易恼火。',-1],
 ['Spend time reflecting on things.','我会花时间深入思考事情。',1],
 ['Am quiet around strangers.','在陌生人面前，我通常比较安静。',-1],
 ['Make people feel at ease.','我能让别人感到自在。',1],
 ['Am exacting in my work.','我对自己的工作要求严格。',1],
 ['Often feel blue.','我经常感到低落。',-1],
 ['Am full of ideas.','我的脑海里有很多想法。',1]
];
export const ipipQuestions=items.map(([english,text,direction],i)=>({id:'ipip'+(i+1),sourceNumber:i+1,axis:bigFiveAxes[i%5].id,text,english,direction,weight:1,source:'ipip50'}));
export function scoreBigFive(answers){
 return bigFiveAxes.map(a=>{
  const items=ipipQuestions.filter(q=>q.axis===a.id);
  if(items.some(q=>!Number.isInteger(answers[q.id])||Math.abs(answers[q.id])>3))throw new Error('请完成全部大五人格题目。');
  const total=items.reduce((sum,q)=>sum+(q.direction===1?answers[q.id]+4:4-answers[q.id]),0);
  return {...a,total,mean:total/10,percent:Math.round((total-10)/60*100),count:10};
 });
}

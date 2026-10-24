// Public pages inspected 2026-10-24. These are editorial references, not a
// licence for their report text, endorsement, or validation of our instrument.
export const editorialSources={
 INTP:{url:'https://www.mbtionline.com/mbti-types/intp',anchor:'概念分析、结构模型、独立探索',careerURL:'https://www.16personalities.com/intp-careers'},
 INTJ:{url:'https://www.mbtionline.com/mbti-types/intj',anchor:'未来视角、整体规划、自主判断'},
 ENTP:{url:'https://www.mbtionline.com/mbti-types/entp',anchor:'新解法、模式关联、讨论探索'},
 ENTJ:{url:'https://www.mbtionline.com/mbti-types/entj',anchor:'长线目标、分析决策、组织推进'},
 INFJ:{url:'https://www.mbtionline.com/mbti-types/infj',anchor:'意义、支持他人、面向未来的愿景'},
 INFP:{url:'https://www.mbtionline.com/mbti-types/infp',anchor:'个人价值、反思、创造性理解'},
 ENFP:{url:'https://www.mbtionline.com/mbti-types/enfp',anchor:'新的人与挑战、适应变化、多种解法'},
 ENFJ:{url:'https://www.mbtionline.com/mbti-types/enfj',anchor:'理解他人目标、鼓励参与、共同方向'},
 ISTJ:{url:'https://www.mbtionline.com/mbti-types/istj',anchor:'既往经验、尽责、稳定完成'},
 ISFJ:{url:'https://www.mbtionline.com/mbti-types/isfj',anchor:'具体需要、实际帮助、持续支持'},
 ESTJ:{url:'https://www.mbtionline.com/mbti-types/estj',anchor:'结构、组织项目、结果导向'},
 ESFJ:{url:'https://www.mbtionline.com/mbti-types/esfj',anchor:'群体联系、实际照顾、安排支持'},
 ISTP:{url:'https://www.mbtionline.com/mbti-types/istp',anchor:'实际问题、技艺积累、现场判断'},
 ISFP:{url:'https://www.mbtionline.com/mbti-types/isfp',anchor:'观察个体差异、安静支持、自主空间'},
 ESTP:{url:'https://www.mbtionline.com/mbti-types/estp',anchor:'快速判断、实际解法、行动与自主'},
 ESFP:{url:'https://www.mbtionline.com/mbti-types/esfp',anchor:'现场参与、灵活回应、轻松互动'}
};
export function editorialSourceMarkup(code){const source=editorialSources[code];return `<details class="nr-more nr-editorial-sources"><summary>文案参考来源</summary><p>类型描述参考专业机构公开资料；生活场景、建议与长篇解释为本站编辑性改写，不是官方报告，也不是由本问卷验证的结论。</p><ul>${source?.careerURL?`<li><a href="${source.careerURL}" target="_blank" rel="noopener noreferrer">16Personalities · INTP 职业公开介绍 ↗</a></li>`:''}${source?`<li><a href="${source.url}" target="_blank" rel="noopener noreferrer">MBTIonline · ${code} 类型介绍 ↗</a></li>`:''}<li><a href="https://www.myersbriggs.org/my-mbti-personality-type/my-mbti-results/home.htm" target="_blank" rel="noopener noreferrer">Myers &amp; Briggs Foundation · 理解类型结果 ↗</a></li><li><a href="https://www.16personalities.com/articles/our-theory" target="_blank" rel="noopener noreferrer">16Personalities · NERIS 框架说明 ↗</a></li></ul><p>MBTI、NERIS 与本站自建评分不是同一套测量系统。参考其公开描述不代表获得授权认证，也不能据此断言职业表现或关系结果。</p></details>`;}

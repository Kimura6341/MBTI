import {readAnswerExport,createAnswerWorkbook} from './answer-workbook.mjs?v=5f950031d244';
const status=document.querySelector('#status'),download=document.querySelector('#download');
let objectUrl;
try{
 const data=readAnswerExport(location.hash);
 status.textContent=`${data.email} · ${data.type} · ${data.record?'60 / 60 道题完整记录':'无答题记录（预览或旧记录）'}`;
 objectUrl=URL.createObjectURL(new Blob([createAnswerWorkbook(data)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
 download.href=objectUrl;download.download=`Persona-${data.type}-${data.requestedAt.replace(/[:.]/g,'-')}.xlsx`;download.hidden=false;
}catch{status.textContent='无法读取答题记录。请从申请邮件内打开完整的 Excel 下载链接。';download.remove();}
addEventListener('pagehide',()=>{if(objectUrl)URL.revokeObjectURL(objectUrl);});

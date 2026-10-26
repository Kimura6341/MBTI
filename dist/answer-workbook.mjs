import {englishQuestions,calculateEnglish} from './english-model.mjs?v=f351344ebc7f';

export const answerRecordKey='persona-english-answer-record-v1';
export function answerExportUrl(data,base='https://kimura6341.github.io/MBTI/'){
 const payload={v:1,email:data.email,type:data.type,requestedAt:data.requestedAt,completedAt:data.record?.completedAt||'',answers:data.record?englishQuestions.map(q=>data.record.answers[q.id]):null};
 if(!data.record)payload.result=data.result;
 return new URL('answer-export.html',base).href+'#record='+encodeURIComponent(JSON.stringify(payload));
}
export function readAnswerExport(hash){
 if(!hash.startsWith('#record=')||hash.length>20000)throw new Error('缺少或无效的答题记录链接');
 const p=JSON.parse(decodeURIComponent(hash.slice(8)));
 if(p.v!==1||typeof p.email!=='string'||p.email.length>254||!(/^[EI][NS][TF][JP]-[AT]$/).test(p.type)||!Number.isFinite(Date.parse(p.requestedAt)))throw new Error('答题记录格式错误');
 let record=null,result=null;
 if(p.answers!==null){
  if(!Array.isArray(p.answers)||p.answers.length!==60||p.answers.some(v=>!Number.isInteger(v)||Math.abs(v)>3))throw new Error('需要完整的60道题答案');
  const answers=Object.fromEntries(englishQuestions.map((q,i)=>[q.id,p.answers[i]]));result=calculateEnglish(answers);
  if(result.code+'-'+result.variant!==p.type)throw new Error('答题记录与人格类型不一致');
  record={answers,completedAt:String(p.completedAt||'')};
 }
 const reportUrl=new URL('reports/'+p.type+'.html','https://kimura6341.github.io/MBTI/');if(result)reportUrl.hash='result='+encodeURIComponent(JSON.stringify(result));
 return {email:p.email,type:p.type,result,record,requestedAt:p.requestedAt,reportUrl:reportUrl.href};
}
const choices=['Strongly agree','Moderately agree','Slightly agree','Neither agree nor disagree','Slightly disagree','Moderately disagree','Strongly disagree'];
const chinese=['非常同意','比较同意','略微同意','中立','略微不同意','比较不同意','非常不同意'];
// Only attach answers belonging to this exact completed result, never another test.
export function matchingAnswerRecord(result,raw){
 try{
  const record=JSON.parse(raw),calculated=calculateEnglish(record.answers);
  if(!result||calculated.code!==result.code||calculated.variant!==result.variant||JSON.stringify(calculated.dimensions)!==JSON.stringify(result.dimensions)||JSON.stringify(record.result)!==JSON.stringify(calculated))return null;
  return {answers:Object.fromEntries(englishQuestions.map(q=>[q.id,record.answers[q.id]])),completedAt:String(record.completedAt||'')};
 }catch{return null;}
}

export function answerWorkbookRows({email,type,result,record,requestedAt,reportUrl}){
 const summary=[['客户答题记录 / Customer assessment'],['字段 / Field','内容 / Value'],['客户邮箱',email],['人格类型',type],['申请时间 (UTC)',requestedAt],['完成时间 (UTC)',record?.completedAt||'未记录'],['答题记录',record?'完整记录：60 / 60':'无答题记录：预览或旧记录，不推测答案'],['报告链接',reportUrl],[],['维度 / Dimension','倾向 / Preference','比例 / Percentage']];
 for(const d of result?.dimensions||[])summary.push([d.label,d.trait,d.pct/100]);
 summary.push([],['计分说明','近似计分；等权重，不是官方内部算法。'],['答案数值','-3 非常同意，0 中立，+3 非常不同意。']);
 const rows=[['题号','题目 / Question','客户选择 / Selected answer','中文选项','答案值','维度']];
 if(record)for(const [i,q] of englishQuestions.entries()){const value=record.answers[q.id];rows.push([i+1,q.text,choices[value+3],chinese[value+3],value,q.axis]);}
 else rows.push(['','无答题记录 / No answer record available']);
 return {summary,answers:rows};
}

const xml=value=>String(value??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const col=n=>{let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;};
function sheet(rows,widths,detail=false){
 return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="${detail?1:2}" topLeftCell="A${detail?2:3}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${widths.map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join('')}</cols><sheetData>${rows.map((row,r)=>`<row r="${r+1}" ht="${detail?(r===0?30:52):r===0?34:36}" customHeight="1">${row.map((value,c)=>{const style=detail?(r===0?1:r%2?2:3):r===0?1:r===1||r===9?1:c===2&&r>=10&&r<=14?4:2;return typeof value==='number'?`<c r="${col(c)}${r+1}" s="${style}"><v>${value}</v></c>`:`<c r="${col(c)}${r+1}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is></c>`;}).join('')}</row>`).join('')}</sheetData>${detail?`<autoFilter ref="A1:F${rows.length}"/>`:''}</worksheet>`;
}

// Small browser-side OOXML writer: typed cells, no formulas or external links.
// ZIP uses uncompressed entries so generation needs no CDN, server, or library.
function zip(entries){
 const encoder=new TextEncoder(),parts=[],directory=[];let offset=0;
 const crc32=bytes=>{let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let b=0;b<8;b++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;};
 const header=(length,fields)=>{const bytes=new Uint8Array(length),view=new DataView(bytes.buffer);for(const [position,value,size] of fields)size===2?view.setUint16(position,value,true):view.setUint32(position,value,true);return bytes;};
 for(const [name,content] of Object.entries(entries)){
  const filename=encoder.encode(name),data=encoder.encode(content),crc=crc32(data);
  parts.push(header(30,[[0,0x04034b50,4],[4,20,2],[6,0x800,2],[12,33,2],[14,crc,4],[18,data.length,4],[22,data.length,4],[26,filename.length,2]]),filename,data);
  directory.push(header(46,[[0,0x02014b50,4],[4,20,2],[6,20,2],[8,0x800,2],[14,33,2],[16,crc,4],[20,data.length,4],[24,data.length,4],[28,filename.length,2],[42,offset,4]]),filename);
  offset+=30+filename.length+data.length;
 }
 const size=directory.reduce((n,p)=>n+p.length,0);
 const end=header(22,[[0,0x06054b50,4],[8,Object.keys(entries).length,2],[10,Object.keys(entries).length,2],[12,size,4],[16,offset,4]]);
 const bytes=new Uint8Array(offset+size+22);let position=0;for(const part of [...parts,...directory,end]){bytes.set(part,position);position+=part.length;}return bytes;
}
export function createAnswerWorkbook(data){
 const rows=answerWorkbookRows(data);
 const rel='http://schemas.openxmlformats.org/package/2006/relationships';
 const office='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
 const entries={
  '[Content_Types].xml':`<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${['workbook','worksheets/sheet1','worksheets/sheet2','styles'].map(p=>`<Override PartName="/xl/${p}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.${p==='workbook'?'sheet.main':p==='styles'?'styles':'worksheet'}+xml"/>`).join('')}</Types>`,
  '_rels/.rels':`<Relationships xmlns="${rel}"><Relationship Id="rId1" Type="${office}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
  'xl/workbook.xml':'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="客户概览" sheetId="1" r:id="rId1"/><sheet name="逐题答案" sheetId="2" r:id="rId2"/></sheets></workbook>',
  'xl/_rels/workbook.xml.rels':`<Relationships xmlns="${rel}"><Relationship Id="rId1" Type="${office}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${office}/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="${office}/styles" Target="styles.xml"/></Relationships>`,
  'xl/styles.xml':'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="12"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF88649C"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF3EFF6"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="5"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="3" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="9" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment vertical="center"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
  'xl/worksheets/sheet1.xml':sheet(rows.summary,[29,100,24]),
  'xl/worksheets/sheet2.xml':sheet(rows.answers,[9,85,31,20,12,14],true),
 };
 return zip(entries);
}

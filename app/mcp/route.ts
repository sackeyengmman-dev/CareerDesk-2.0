import {refreshFamilyLeads} from '../family-leads-server';
import {readDailyLeads} from '../leads.mjs';
import { context, failure, json } from '../api/shared';
import { validateEmailEvent } from '../model.mjs';
const tools=[
 {name:'refresh_daily_leads',description:'Refresh the signed-in user’s daily Germany job shortlist against their own saved CV. Idempotent per Germany calendar day; no access to another account’s profile or leads. No applications or CV rewrites.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true}},
 {name:'list_daily_leads',description:'Read only the signed-in user’s dated private daily job leads.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true}},
 {name:'list_applications',description:'List applications in the signed-in private Career Desk workspace. Read only.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true}},
 {name:'record_email_outcome',description:'Record an explicit rejection, interview invitation or offer for one confirmed matching application. Caller must verify the company and role match and supply email evidence. Ambiguous outcomes require human review; do not call this tool for them.',inputSchema:{type:'object',properties:{jobId:{type:'string'},company:{type:'string'},role:{type:'string'},outcome:{type:'string',enum:['rejected','interview','offer']},messageId:{type:'string'},subject:{type:'string'},sender:{type:'string'},receivedAt:{type:'string'},evidence:{type:'string'}},required:['jobId','company','role','outcome','messageId','subject','sender','receivedAt','evidence'],additionalProperties:false},annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true}}
];
export async function POST(request:Request) {
 let id:unknown=null;
 try {
  const message=await request.json() as {id?:unknown;method?:string;params?:{name?:string;arguments?:Record<string,unknown>}};id=message.id??null;
  if(message.method?.startsWith('notifications/'))return new Response(null,{status:202});
  const reply=(result:unknown)=>json({jsonrpc:'2.0',id,result});
  if(message.method==='initialize')return reply({protocolVersion:'2024-11-05',capabilities:{tools:{}},serverInfo:{name:'Career Desk',version:'1.0.0'}});
  if(message.method==='tools/list')return reply({tools});
  if(message.method!=='tools/call')return json({jsonrpc:'2.0',id,error:{code:-32601,message:'Method not found'}});
  const {user,db}=await context(request);
  if(message.params?.name==='refresh_daily_leads')return reply({content:[{type:'text',text:JSON.stringify(await refreshFamilyLeads(db,user))}]});
  if(message.params?.name==='list_daily_leads')return reply({content:[{type:'text',text:JSON.stringify({days:await readDailyLeads(db,user.userId)})}]});
  if(message.params?.name==='list_applications') {
   const rows=await db.prepare('SELECT id,payload,updated_at FROM jobs WHERE user_id=? ORDER BY updated_at DESC').bind(user.userId).all();
   const jobs=rows.results.map((r:any)=>({id:r.id,...JSON.parse(r.payload),updatedAt:r.updated_at}));
   return reply({content:[{type:'text',text:JSON.stringify({applications:jobs,dailyLeads:await readDailyLeads(db,user.userId)})}]});
  }
  if(message.params?.name==='record_email_outcome') {
   const a=message.params.arguments;
   if(!a||typeof a.jobId!=='string'||a.jobId.length>100||typeof a.company!=='string'||typeof a.role!=='string')throw new Error('A confirmed application match is required.');
   const event=validateEmailEvent(a);
   const row:any=await db.prepare('SELECT payload FROM jobs WHERE id=? AND user_id=?').bind(a.jobId,user.userId).first();
   if(!row)throw new Error('Application not found.');
   const job=JSON.parse(row.payload);
   if(a.company.trim().toLowerCase()!==job.company.trim().toLowerCase()||a.role.trim().toLowerCase()!==job.role.trim().toLowerCase())throw new Error('Company or role does not match. Review the email manually.');
   const events=job.emailEvents??[];
   if(events.some((e:any)=>e.messageId===event.messageId))return reply({content:[{type:'text',text:JSON.stringify({ok:true,alreadyRecorded:true})}]});
   if(job.status==='Withdrawn')throw new Error('This application was withdrawn. Review the email manually.');
   if(events.some((e:any)=>Date.parse(e.receivedAt)>=Date.parse(event.receivedAt)))return reply({content:[{type:'text',text:JSON.stringify({ok:true,skippedOlderEvent:true,status:job.status})}]});
   if(events.length>=100)throw new Error('Email evidence history is full. Review the application manually.');
   job.emailEvents=[...events,event];job.status={rejected:'Rejected',interview:'Interview',offer:'Offer'}[event.outcome as 'rejected'|'interview'|'offer'];
   const note=`Email outcome: ${event.outcome}\n${event.receivedAt} · ${event.sender}\n${event.subject}\n${event.evidence}\nMessage ID: ${event.messageId}`;
   if((job.notes??'').length+note.length>15000)throw new Error('Application notes are full. Review manually.');
   job.notes=[job.notes,note].filter(Boolean).join('\n\n');
   const updatedAt=Date.now();
   const result=await db.prepare('UPDATE jobs SET payload=?,updated_at=? WHERE id=? AND user_id=? AND payload=?').bind(JSON.stringify(job),updatedAt,a.jobId,user.userId,row.payload).run();
   if(!result.meta.changes)throw new Error('Application changed during this update. Refresh and retry.');
   return reply({content:[{type:'text',text:JSON.stringify({ok:true,jobId:a.jobId,status:job.status})}]});
  }
  return json({jsonrpc:'2.0',id,error:{code:-32601,message:'Tool not found'}});
 }catch(error) {
  if(error instanceof Error&&['AUTH','ORIGIN'].includes(error.message))return failure(error);
  return json({jsonrpc:'2.0',id,result:{isError:true,content:[{type:'text',text:error instanceof Error?error.message:'Request failed.'}]}});
 }
}

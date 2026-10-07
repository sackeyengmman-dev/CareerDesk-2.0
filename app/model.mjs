export const statuses = ['Saved','Preparing','Applied','Interview','Offer','Rejected','Withdrawn'];
export const criteria = ['Experience & seniority','Duties & responsibilities','Tools & functions','Qualifications & requirements','Original CV presentation'];
export const weights = [25,25,20,20,10];
export function fit(scores) {
 if (!Array.isArray(scores) || scores.length !== 5 || scores.some(v => typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 100)) return null;
 return { overall: Math.round(scores.reduce((s,v,i)=>s+v*weights[i],0)/100), career: Math.round(scores.slice(0,4).reduce((s,v,i)=>s+v*weights[i],0)/90) };
}
export function safeUrl(value) {
 if (!value) return '';
 const u = new URL(value); if (!['http:','https:'].includes(u.protocol) || u.username || u.password) throw new Error('Use a public HTTP or HTTPS source URL.'); return u.href;
}
const limits = {role:200,company:200,location:200,url:2000,jd:30000,notes:15000,recruiter:3000,appliedDate:10,followupDate:10,deadline:10,gaps:8000,realism:8000};
export function validateJob(input) {
 if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid application.');
 const result = {};
 for(const [key,max] of Object.entries(limits)) { const value = input[key] ?? ''; if(typeof value !== 'string' || value.length > max) throw new Error(`${key} must be text of at most ${max} characters.`); result[key] = value.trim(); }
 if(!result.role || !result.company) throw new Error('Role and company are required.');
 result.url = safeUrl(result.url);
 for(const key of ['appliedDate','followupDate','deadline']) if(result[key] && (!/^\d{4}-\d{2}-\d{2}$/.test(result[key]) || new Date(result[key]).toISOString().slice(0,10)!==result[key])) throw new Error('Enter a valid calendar date.');
 if(!statuses.includes(input.status)) throw new Error('Invalid application status.'); result.status=input.status;
 result.scores = Array.from({length:5},(_,i)=>input.scores?.[i] ?? null);
 if(result.scores.some(v=>v !== null && (typeof v!=='number'||!Number.isFinite(v)||v<0||v>100))) throw new Error('Scores must be between 0 and 100.');
 result.evidence = Array.from({length:5},(_,i)=>input.evidence?.[i] ?? '');
 if(result.evidence.some(v=>typeof v !== 'string'||v.length>5000)) throw new Error('Evidence must be text of at most 5000 characters.');
 if(input.emailEvents !== undefined) {
  if(!Array.isArray(input.emailEvents)||input.emailEvents.length>100) throw new Error('Invalid email evidence history.');
  result.emailEvents=input.emailEvents.map(event=>validateEmailEvent(event));
 }
 return result;
}
/** @returns {{outcome:string,messageId:string,subject:string,sender:string,receivedAt:string,evidence:string}} */
export function validateEmailEvent(event) {
 if(!event||typeof event !== 'object') throw new Error('Invalid email outcome.');
 if(!['rejected','interview','offer'].includes(event.outcome)) throw new Error('Only explicit rejected, interview or offer outcomes are supported.');
 const result={outcome:event.outcome};
 for(const [key,max] of Object.entries({messageId:500,subject:1000,sender:500,receivedAt:40,evidence:3000})) {if(typeof event[key]!=='string'||!event[key].trim()||event[key].length>max) throw new Error(`Invalid email ${key}.`);result[key]=event[key].trim();}
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(result.receivedAt)||!Number.isFinite(Date.parse(result.receivedAt))) throw new Error('Use an ISO email received timestamp with a timezone.');
 return result;
}
export function validateProfile(p) {
 const result = {}; for(const [k,n] of Object.entries({name:200,email:200,phone:100,summary:10000,master:60000,roles:2000,city:200,preferences:3000})) { if(typeof p[k] !== 'string'||p[k].length>n) throw new Error(`Invalid profile field: ${k}.`);result[k]=p[k]; } return result;
}
export function safeFilename(name) { return name.replace(/[^a-zA-Z0-9._ -]/g,'_').slice(0,180) || 'document'; }

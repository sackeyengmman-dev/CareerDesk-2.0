import {assessmentReadiness,fingerprints,digest,callAssessmentProvider,ASSESSMENT_VERSION} from './assessment.mjs';
export async function savedProfile(db,userId,defaults){const row=await db.prepare('SELECT payload FROM profiles WHERE user_id=?').bind(userId).first();if(!row)return defaults;const saved=JSON.parse(row.payload);return {...saved,masterEnglish:saved.masterEnglish??defaults.masterEnglish??''};}
export async function runAssessment(db,userId,config,defaults,vacancy,force=false,provider=callAssessmentProvider){
 if(vacancy.jobId){const own=await db.prepare('SELECT id FROM jobs WHERE id=? AND user_id=?').bind(vacancy.jobId,userId).first();if(!own)return {status:'not_found',message:'Application not found.'};}
 const profile=await savedProfile(db,userId,defaults),readiness=assessmentReadiness(config,profile,vacancy);if(readiness)return readiness;
 const fp=await fingerprints(profile,vacancy,config.model),id=await digest(JSON.stringify({userId,...fp})),now=Date.now();
 let row=await db.prepare('SELECT * FROM assessment_cache WHERE id=? AND user_id=?').bind(id,userId).first();
 if(row?.state==='complete')return {status:'complete',assessment:{...JSON.parse(row.result),cacheId:id,...fp,status:'complete'},cached:true};
 if(row?.state==='pending'){
  if(row.lease_until>now)return {status:'in_progress',message:'An assessment for this CV and vacancy is already running. Refresh the assessment shortly.'};
  await db.prepare("UPDATE assessment_cache SET state='failed',error=? WHERE id=? AND user_id=? AND state='pending' AND lease_until<=?").bind('The previous request ended without a result. Refresh manually to retry.',id,userId,now).run();
  row={...row,state:'failed',error:'The previous request ended without a result. Refresh manually to retry.'};
 }
 if(row?.state==='failed'&&!force)return {status:'error',message:row.error||'Assessment failed. Refresh manually to retry.'};
 const lease=now+90000;
 const claim=await db.prepare("INSERT INTO assessment_cache(id,user_id,state,created_at,lease_until,result,error) VALUES(?,?,'pending',?,?,NULL,NULL) ON CONFLICT(id) DO UPDATE SET state='pending',created_at=excluded.created_at,lease_until=excluded.lease_until,result=NULL,error=NULL WHERE assessment_cache.user_id=excluded.user_id AND assessment_cache.state='failed' AND ?=1 RETURNING id").bind(id,userId,now,lease,force?1:0).first();
 if(!claim)return {status:'in_progress',message:'An assessment is already running. Refresh shortly; no duplicate provider call was made.'};
 const day=new Date(now).toISOString().slice(0,10),usageId=await digest(userId+'\n'+day);
 const usage=await db.prepare('INSERT INTO assessment_usage(id,user_id,day,calls) VALUES(?,?,?,1) ON CONFLICT(id) DO UPDATE SET calls=calls+1 WHERE assessment_usage.user_id=excluded.user_id AND calls<20 RETURNING calls').bind(usageId,userId,day).first();
 if(!usage){const message='Daily assessment limit reached (20 provider calls). Try again tomorrow.';await db.prepare("UPDATE assessment_cache SET state='failed',error=? WHERE id=? AND user_id=?").bind(message,id,userId).run();return {status:'daily_limit',message};}
 try{
  const assessment=await provider(config,profile,vacancy);
  const result={...assessment,sourceJD:vacancy.jd,assessedAt:new Date().toISOString(),...fp};
  await db.prepare("UPDATE assessment_cache SET state='complete',result=?,error=NULL WHERE id=? AND user_id=? AND state='pending'").bind(JSON.stringify(result),id,userId).run();
  return {status:'complete',assessment:{...result,cacheId:id,status:'complete'},cached:false};
 }catch(e){const message=(e instanceof Error?e.message:'Assessment failed.').slice(0,1000);await db.prepare("UPDATE assessment_cache SET state='failed',error=? WHERE id=? AND user_id=?").bind(message,id,userId).run();return {status:'error',message};}
}
export async function assessmentIsCurrent(assessment,profile,job,model){if(!assessment)return false;const fp=await fingerprints(profile,job,model??'');return assessment.version===ASSESSMENT_VERSION&&assessment.cvHash===fp.cvHash&&assessment.jdHash===fp.jdHash&&assessment.role===fp.role&&assessment.model===fp.model;}
export async function hydrateAssessment(job,reference,db,userId,profile,model){
 if(!reference?.cacheId)return job;
 const row=await db.prepare("SELECT result FROM assessment_cache WHERE id=? AND user_id=? AND state='complete'").bind(reference.cacheId,userId).first();
 if(!row)throw new Error('Assessment result is unavailable for this user. Refresh the assessment.');
 const result=JSON.parse(row.result),current=await assessmentIsCurrent(result,profile,job,model),assessment={...result,cacheId:reference.cacheId,status:current?'complete':'stale'};
 if(job.assessmentMode!=='manual'&&current){job.scores=result.scores;job.evidence=result.evidence;job.gaps=result.gaps;job.realism=result.realism;}
 return {...job,assessment};
}


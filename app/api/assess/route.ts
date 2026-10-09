import {env} from 'cloudflare:workers';
import {context,failure,json} from '../shared';
import {runAssessment} from '../../assessment-store.mjs';
import {boundedText} from '../../vacancy.mjs';
import {defaultsForUser} from '../../profile-defaults-server';
import {validateAssessmentRequest} from '../../assessment.mjs';
export async function POST(request:Request){
 try{
  const {db,user}=await context(request),payload=validateAssessmentRequest(JSON.parse(await boundedText(request,40000)));
  const result=await runAssessment(db,user.userId,{key:env.OPENAI_API_KEY,model:env.OPENAI_ASSESSMENT_MODEL},defaultsForUser(user),{jd:payload.jd,role:payload.role,jobId:payload.jobId},payload.force===true);
  if(result.status==='not_found')return Response.json(result,{status:404,headers:{'Cache-Control':'no-store'}});
  if(result.status==='in_progress')return Response.json(result,{status:202,headers:{'Cache-Control':'no-store'}});
  if(result.status==='daily_limit')return Response.json(result,{status:429,headers:{'Cache-Control':'no-store'}});
  return json(result);
 }catch(e){return failure(e);}
}

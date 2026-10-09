import {refreshFamilyLeads} from '../../family-leads-server';
import {context,failure,json} from '../shared';
import {readDailyLeads,registerLeadMember} from '../../leads.mjs';
export async function GET(request:Request){try{const {user,db}=await context(request);await registerLeadMember(db,user);return json({days:await readDailyLeads(db,user.userId)});}catch(e){return failure(e);}}
export async function POST(request:Request){try{const {user,db}=await context(request);await registerLeadMember(db,user);const batch=await refreshFamilyLeads(db,user);const result=batch.results[0];return json({result,days:await readDailyLeads(db,user.userId)});}catch(e){return failure(e);}}

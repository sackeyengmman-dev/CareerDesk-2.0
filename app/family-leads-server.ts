import 'server-only';
import {env} from 'cloudflare:workers';
import {savedProfile} from './assessment-store.mjs';
import {defaultsForUser} from './profile-defaults-server';
import {registerLeadMember,runDailyLeads} from './leads.mjs';
export async function refreshFamilyLeads(db:any,user:{userId:string,email:string}){await registerLeadMember(db,user);return {accounts:1,results:[await runDailyLeads(db,user.userId,await savedProfile(db,user.userId,defaultsForUser(user)),{key:env.OPENAI_API_KEY,model:env.OPENAI_ASSESSMENT_MODEL})]};}

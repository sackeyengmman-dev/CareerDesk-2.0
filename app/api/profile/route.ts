import {registerLeadMember} from '../../leads.mjs';
import {savedProfile} from '../../assessment-store.mjs';
import {defaultsForUser} from '../../profile-defaults-server';
import { context, failure, json } from '../shared';
import { validateProfile } from '../../model.mjs';
export async function GET(request:Request) {try{const {user,db}=await context(request);await registerLeadMember(db,user);return json({profile:await savedProfile(db,user.userId,defaultsForUser(user))});}catch(e){return failure(e);} }
export async function PUT(request:Request) {try{const {user,db}=await context(request);await registerLeadMember(db,user);const profile=validateProfile(await request.json());await db.prepare('INSERT INTO profiles(user_id,payload) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET payload=excluded.payload').bind(user.userId,JSON.stringify(profile)).run();return json({profile});}catch(e){return failure(e);} }



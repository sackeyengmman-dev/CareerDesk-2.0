import { context, failure, json } from '../shared';
import { validateProfile } from '../../model.mjs';
export async function GET(request:Request) {try{const {user,db}=await context(request);const row=await db.prepare('SELECT payload FROM profiles WHERE user_id=?').bind(user.userId).first();return json({profile:row?JSON.parse(String(row.payload)):null});}catch(e){return failure(e);} }
export async function PUT(request:Request) {try{const {user,db}=await context(request);const profile=validateProfile(await request.json());await db.prepare('INSERT INTO profiles(user_id,payload) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET payload=excluded.payload').bind(user.userId,JSON.stringify(profile)).run();return json({profile});}catch(e){return failure(e);} }



import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../chatgpt-auth';
export async function context(request?:Request) { if(request) {const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)throw new Error('ORIGIN');} const user = await getChatGPTUser(); if(!user) throw new Error('AUTH'); if(!env.DB) throw new Error('Database is unavailable. Please try again later.'); return {user, db:env.DB}; }
export function failure(e: unknown) { const message = e instanceof Error ? e.message : 'Request failed.'; return Response.json({error:message==='AUTH'?'Sign in to continue.':message==='ORIGIN'?'Request origin is not allowed.':message},{status:message==='AUTH'?401:message==='ORIGIN'?403:400,headers:{'Cache-Control':'no-store'}}); }
export function json(data: unknown) { return Response.json(data,{headers:{'Cache-Control':'no-store'}}); }

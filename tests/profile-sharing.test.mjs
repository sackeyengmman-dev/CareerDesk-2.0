import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {profileDefaultsForUser} from '../app/profile-defaults.mjs';
import {savedProfile,runAssessment} from '../app/assessment-store.mjs';
const blank={name:'Your name',master:'',masterEnglish:'',summary:''};
const owner={email:'owner@example.com',profile:{name:'Owner',master:'Private owner career record. '.repeat(8),masterEnglish:'Private English master',summary:'Owner-only facts'}};
const dbWith=(profiles={})=>({prepare(){return {bind(id){return {async first(){return Object.hasOwn(profiles,id)?{payload:JSON.stringify(profiles[id])}:null;}};}};}});
test('only trusted owner identity receives bootstrap; other accounts receive independent blank profiles',()=>{
 const own=profileDefaultsForUser({email:'OWNER@example.com'},blank,owner);
 assert.deepEqual(own,owner.profile);
 for(const user of [{email:'brother@example.com'},{email:''},null])assert.deepEqual(profileDefaultsForUser(user,blank,owner),blank);
 own.master='changed';assert.notEqual(owner.profile.master,own.master);
 assert.deepEqual(profileDefaultsForUser({email:'owner@example.com'},blank),blank);
});
test('saved profiles remain user-owned and missing English CV cannot inherit another person’s master',async()=>{
 const db=dbWith({owner:owner.profile,brother:{name:'Brother',master:'Brother original career',summary:'Brother facts'}});
 const brotherDefaults=profileDefaultsForUser({email:'brother@example.com'},blank,owner);
 assert.equal((await savedProfile(db,'brother',brotherDefaults)).master,'Brother original career');
 assert.equal((await savedProfile(db,'brother',brotherDefaults)).masterEnglish,'');
 assert.equal((await savedProfile(db,'owner',owner.profile)).master,owner.profile.master);
 assert.deepEqual(await savedProfile(db,'new-user',brotherDefaults),blank);
});
test('new user without a CV never spends shared API credit or assesses against the owner’s career',async()=>{
 let calls=0;const defaults=profileDefaultsForUser({email:'brother@example.com'},blank,owner);
 const result=await runAssessment(dbWith(), 'brother',{key:'test-only',model:'configured-model'},defaults,{role:'Coordinator',jd:'Coordinate projects and document stakeholder updates. '.repeat(4)},false,async()=>{calls++;throw new Error('Must not run');});
 assert.equal(result.status,'missing_cv');assert.equal(calls,0);
});
test('profile, vacancy cache hydration and assessment routes use server-selected user defaults',()=>{
 for(const name of ['profile','jobs','assess']){
  const source=readFileSync(new URL('../app/api/'+name+'/route.ts',import.meta.url),'utf8');
  assert.match(source,/defaultsForUser\(user\)/);assert.doesNotMatch(source,/import defaults from .*default-profile/);
 }
 assert.match(readFileSync(new URL('../app/profile-defaults-server.ts',import.meta.url),'utf8'),/import 'server-only'/);
 const client=readFileSync(new URL('../app/desk.tsx',import.meta.url),'utf8');
 assert.doesNotMatch(client,/owner-profile|owner-bootstrap|profile-defaults-server/);
 const defaults=JSON.parse(readFileSync(new URL('../app/default-profile.json',import.meta.url),'utf8'));
 assert.equal(defaults.master,'');assert.equal(defaults.masterEnglish,'');assert.equal(defaults.summary,'');
});

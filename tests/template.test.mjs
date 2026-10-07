import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {weights,fit,validateProfile} from '../app/model.mjs';
const read=(path)=>readFileSync(new URL(path,import.meta.url),'utf8');
test('public profile is blank and valid, with editable region and role suggestions',()=>{
 const profile=JSON.parse(read('../app/default-profile.json'));
 assert.equal(profile.name,'Your name');
 for(const key of ['email','phone','summary','master','preferences'])assert.equal(profile[key],'');
 assert.equal(profile.city,'Germany');assert.ok(profile.roles.length>0);assert.deepEqual(validateProfile(profile),profile);
});
test('hosting declares fresh bindings without any deployment identity',()=>{
 const hosting=JSON.parse(read('../.openai/hosting.json'));
 assert.deepEqual(hosting,{d1:'DB',r2:'BUCKET',capabilities:['mcp']});
});
test('no seeded application or fixed user identity; custom role families are selectable',()=>{
 const source=read('../app/desk.tsx');
 assert.equal((source.match(/const .*:Job=/g)||[]).length,1);
 assert.ok(source.includes("profile.roles.split(',')"));assert.ok(source.includes('{firstName}'));
 assert.ok(source.includes('{initials}'));assert.ok(source.includes("'there'"));
 assert.ok(!source.includes('Add my '));assert.ok(source.includes('setJobs(a.jobs)'));
});
test('all scores required and rubric weights remain stable',()=>{
 assert.deepEqual(weights,[25,25,20,20,10]);assert.equal(fit([null,null,null,null,null]),null);
 for(let i=0;i<5;i++){const values=[80,80,80,80,80];values[i]=null;assert.equal(fit(values),null);}
 assert.deepEqual(fit([100,100,100,100,0]),{overall:90,career:100});
});
test('public package identities and project skill are reusable',()=>{
 const pkg=JSON.parse(read('../package.json')),lock=JSON.parse(read('../package-lock.json'));
 assert.equal(pkg.name,'career-desk');assert.equal(lock.name,pkg.name);assert.equal(lock.packages[''].name,pkg.name);
 const skill=read('../.agents/skills/career-desk/SKILL.md');assert.match(skill,/^---\s+name: career-desk\s+description:/);
});

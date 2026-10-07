import test from 'node:test';
import assert from 'node:assert/strict';
import {fit,validateJob,validateProfile,safeUrl,safeFilename,validateEmailEvent} from '../app/model.mjs';
const good={role:'PMO',company:'Example',location:'Germany',status:'Saved'};
test('five criteria required; unknown is not zero',()=>{assert.equal(fit([75,null,80,90,65]),null);assert.equal(fit([100,100,100,100]),null);assert.deepEqual(fit([80,60,70,90,50]),{overall:72,career:74});});
test('weighted career score excludes CV presentation',()=>{assert.deepEqual(fit([100,100,100,100,0]),{overall:90,career:100});assert.equal(fit([101,50,50,50,50]),null);});
test('reject unsafe URLs and credentials',()=>{for(const url of ['javascript:alert(1)','data:text/html,test','https://user:password@example.com'])assert.throws(()=>safeUrl(url));assert.equal(safeUrl('https://example.com/job'),'https://example.com/job');});
test('job validator rejects missing required values, unknown statuses, oversized JD',()=>{assert.throws(()=>validateJob({...good,role:''}));assert.throws(()=>validateJob({...good,status:'Unknown'}));assert.throws(()=>validateJob({...good,jd:'a'.repeat(30001)}));assert.equal(validateJob(good).scores[0],null);});
test('job validator checks score ranges and invalid calendar dates',()=>{assert.throws(()=>validateJob({...good,scores:[-1,0,0,0,0]}));assert.throws(()=>validateJob({...good,scores:[NaN,0,0,0,0]}));assert.throws(()=>validateJob({...good,deadline:'2026-02-30'}));assert.equal(validateJob({...good,deadline:'2026-10-07'}).deadline,'2026-10-07');});
test('profile bounded fields and filename sanitizer',()=>{assert.throws(()=>validateProfile({}));assert.equal(safeFilename('../../cv<script>.pdf'),'.._.._cv_script_.pdf');});
test('email evidence validates explicit outcomes and preserves bounded history',()=>{const event={outcome:'rejected',messageId:'abc',subject:'Application update',sender:'hr@example.com',receivedAt:'2026-10-07T12:00:00Z',evidence:'Explicit rejection for this company and role'};assert.deepEqual(validateEmailEvent(event),event);assert.throws(()=>validateEmailEvent({...event,outcome:'maybe'}));assert.throws(()=>validateEmailEvent({...event,receivedAt:'invalid'}));assert.deepEqual(validateJob({...good,emailEvents:[event]}).emailEvents,[event]);});


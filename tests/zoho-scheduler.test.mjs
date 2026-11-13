import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {scheduledPeiReminders} from '../lib/zohoScheduler.ts';

test('cloud scheduler authenticates, defaults to simulation and never claims or sends in simulation',async()=>{
 const calls=[];
 const db={rpc:async(name,args)=>{calls.push(name);return {data:name==='pei_scheduler_start'?'fixture-run':null,error:null}}};
 const env=n=>n==='ZOHO_WEBHOOK_TOKEN'?'fixture-token-'.repeat(4):undefined;
 assert.equal((await scheduledPeiReminders(new Request('https://example.test',{method:'POST'}),'wrong',env,db)).status,401);
 assert.equal(calls.length,0);
 const result=await scheduledPeiReminders(new Request('https://example.test',{method:'POST'}),env('ZOHO_WEBHOOK_TOKEN'),env,db);
 assert.equal(result.status,200);
 assert.deepEqual(calls,['pei_scheduler_start','pei_scheduler_finish']);
});

test('cloud dispatch reserves once, preserves sent history, stops replies, restricts access and holds uncertain outcomes',async()=>{
 const db=new PGlite();
 try {
  await db.exec('create role anon;create role authenticated;create role service_role;');
  await db.exec(readFileSync('supabase/schema.sql','utf8').replace('create extension if not exists pgcrypto;',''));
  const migrations=['202610_crm_invitations.sql','20261109_pei_v1.sql','20261110_email_only_reminders.sql','20261110_zoho_inbound.sql','20261111_reminder_dispatch.sql'];
  for(const f of migrations) await db.exec(readFileSync('supabase/migrations/'+f,'utf8'));
  await db.exec(readFileSync('supabase/migrations/20261111_reminder_dispatch.sql','utf8'));
  const {rows:[{id}]}=await db.query("insert into candidates(email,score,studies_completed,education,profile,specialty,pei_version,pei_eligible,consent,email_consent,manual_status) values('fiveseasonsrealty@gmail.com',82,true,'technical','technician','mechanical','PEI-1.0',true,true,true,'Videoconferencia') returning id");
  await db.query("update candidates set invitation_sent_at=now()-interval '4 days' where id=$1",[id]);
  const job=(await db.query("select * from claim_pei_reminder('fiveseasonsrealty@gmail.com')")).rows[0];
  assert.equal(job.step,1);
  assert.equal((await db.query("select * from claim_pei_reminder('fiveseasonsrealty@gmail.com')")).rows.length,0);
  assert.equal((await db.query('select finish_pei_reminder($1,1,$2,$3) result',[id,'00000000-0000-0000-0000-000000000001','wrong'])).rows[0].result,false);
  await db.query('select finish_pei_reminder($1,1,$2,$3)',[id,job.dispatch_id,'fixture-confirmed']);
  assert.equal((await db.query("select * from claim_pei_reminder('fiveseasonsrealty@gmail.com')")).rows.length,0);
  await db.query("select record_candidate_contact_event($1,'REPLIED')",[id]);
  assert.deepEqual((await db.query('select state from candidate_reminders where candidate_id=$1 order by step',[id])).rows.map(r=>r.state),['sent','cancelled','cancelled']);
  assert.equal((await db.query("select * from claim_pei_reminder('fiveseasonsrealty@gmail.com')")).rows.length,0);
  assert.equal((await db.query("select has_function_privilege('anon','claim_pei_reminder(text)','execute') allowed")).rows[0].allowed,false);
 } finally {await db.close();}
});

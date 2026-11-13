import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fixture} from './helpers/pei-db.mjs';
import {productionReminders,PRODUCTION_SUPABASE_URL} from '../lib/productionReminders.ts';
import {createProductionEdgeHandler} from '../lib/productionEdge.ts';
import {processPeiInvitations} from '../lib/peiInvitations.ts';
import {supabaseAdmin} from '../lib/supabaseAdmin.ts';
import {PGlite} from '@electric-sql/pglite';
const cron='fixture-cron-'.repeat(4),route='fixture-route-'.repeat(4),secret='fixture-signing-key';
const values={SUPABASE_URL:PRODUCTION_SUPABASE_URL,PEI_PRODUCTION_CRON_SECRET:cron,RESEND_API_KEY:'fixture-only',PEI_PRODUCTION_REMINDERS_ENABLED:'true',PEI_OUTBOUND_ENABLED:'true'};
const env=n=>values[n];
const request=()=>new Request(PRODUCTION_SUPABASE_URL+'/functions/v1/pei-production/reminders',{method:'POST',headers:{authorization:'Bearer '+cron}});

test('production entry points fail closed before DB or network access',async()=>{
 let clients=0;const db=()=>{clients++;throw Error('must not create client');};
 const disabled=createProductionEdgeHandler(n=>({SUPABASE_URL:PRODUCTION_SUPABASE_URL})[n],db);
 assert.equal((await disabled(request())).status,401);
 assert.equal((await disabled(new Request(PRODUCTION_SUPABASE_URL+'/functions/v1/pei-production/zoho/'+route,{method:'POST',body:'{}'}))).status,503);
 const health=await disabled(new Request(PRODUCTION_SUPABASE_URL+'/functions/v1/pei-production'));
 assert.deepEqual(await health.json(),{status:'ready',environment:'production',receiverEnabled:false,sendsEnabled:false});
 for(const switchName of ['PEI_PRODUCTION_REMINDERS_ENABLED','PEI_OUTBOUND_ENABLED']){
  const response=await productionReminders(request(),n=>n===switchName?'false':env(n),db);
  assert.equal((await response.json()).result,'disabled');
 }
 assert.equal((await productionReminders(request(),n=>n==='SUPABASE_URL'?'https://qzmhrjofalmzxkltctlf.supabase.co':env(n),db)).status,503);
 assert.equal(clients,0);
});

test('production sequence uses actual candidate address and approved subject; signed replies cancel remaining steps',async()=>{
 const {pg,db,id}=await fixture('candidate@example.test');const messages=[];const send=async mail=>{messages.push(mail);return 'fixture-'+messages.length;};
 try{
  await processPeiInvitations(db,send,id);
  await pg.query("update candidate_reminders set due_at=now()-interval '1 minute' where step=1");
  assert.equal((await productionReminders(request(),env,()=>db,send)).status,200);
  assert.equal(messages[1].to,'candidate@example.test');assert.ok(!messages[1].subject.includes('PEI-PRUEBA'));assert.match(messages[1].text,/spam/);
  const inboundEnv=n=>({...values,SUPABASE_SERVICE_ROLE_KEY:'fixture',PEI_PRODUCTION_RECEIVER_ENABLED:'true',ZOHO_PRODUCTION_WEBHOOK_TOKEN:route,ZOHO_PRODUCTION_WEBHOOK_SECRET:secret})[n];
  const handler=createProductionEdgeHandler(inboundEnv,()=>db);
  const raw=JSON.stringify({messageId:'production-fixture-reply',fromAddress:'candidate@example.test',toAddress:'info@talentobruecke.com',receivedTime:Date.now(),summary:'Me interesa continuar',subject:'Re: '+messages[1].subject});
  const make=signature=>new Request(PRODUCTION_SUPABASE_URL+'/functions/v1/pei-production/zoho/'+route,{method:'POST',body:raw,headers:{'x-hook-signature':signature}});
  assert.equal((await handler(make('invalid'))).status,401);
  assert.equal((await handler(make(createHmac('sha256',secret).update(raw).digest('base64')))).status,200);
  await productionReminders(request(),env,()=>db,send);assert.equal(messages.length,2);
  assert.deepEqual((await pg.query('select state from candidate_reminders order by step')).rows.map(r=>r.state),['sent','cancelled','cancelled']);
  assert.equal((await pg.query("select has_function_privilege('anon','claim_pei_production_reminder()','execute') allowed")).rows[0].allowed,false);
 }finally{await pg.close();}
});

test('production unsigned enrollment needs explicit opt-in and a short window, then rejects unsigned events',async()=>{
 let stored=null,events=0;
 const db={from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:stored?{encrypted_secret:stored}:null})})}),insert:async row=>{stored=row.encrypted_secret;return {error:null};}}),rpc:async()=>{events++;return {error:null};}};
 const settings={SUPABASE_URL:PRODUCTION_SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY:'fixture',PEI_PRODUCTION_RECEIVER_ENABLED:'true',ZOHO_PRODUCTION_WEBHOOK_TOKEN:route,ZOHO_PRODUCTION_ENCRYPTION_KEY:'ab'.repeat(32),ZOHO_PRODUCTION_ENROLL_UNTIL:new Date(Date.now()+5*60000).toISOString()};
 const req=()=>new Request(PRODUCTION_SUPABASE_URL+'/functions/v1/pei-production/zoho/'+route,{method:'POST',body:'{}',headers:{'x-hook-secret':secret}});
 const handler=()=>createProductionEdgeHandler(n=>settings[n],()=>db);
 assert.equal((await handler()(req())).status,401);
 settings.ZOHO_PRODUCTION_ALLOW_UNSIGNED_REGISTRATION='true';
 settings.ZOHO_PRODUCTION_ENROLL_UNTIL=new Date(Date.now()+20*60000).toISOString();
 assert.equal((await handler()(req())).status,503);
 settings.ZOHO_PRODUCTION_ENROLL_UNTIL=new Date(Date.now()+5*60000).toISOString();
 assert.equal((await handler()(req())).status,200);
 assert.ok(stored.startsWith('v1.'));assert.equal(events,0);
 assert.equal((await handler()(req())).status,401);assert.equal(events,0);
});

test('production claims skip legacy, opt-outs, no-consent and uncertain jobs; reservations and failures do not resend',async()=>{
 const {pg,db,id}=await fixture('another@example.test');let sent=0;
 try{
  await processPeiInvitations(db,async()=> 'initial',id);
  await pg.query("update candidate_reminders set due_at=now()-interval '1 minute'");
  const job=(await pg.query('select * from claim_pei_production_reminder()')).rows[0];
  assert.equal(job.recipient,'another@example.test');assert.equal((await pg.query('select * from claim_pei_production_reminder()')).rows.length,0);
  await pg.query('select finish_pei_reminder($1,$2,$3,null)',[id,job.step,job.dispatch_id]);
  await productionReminders(request(),env,()=>db,async()=>{sent++;return 'never';});assert.equal(sent,0);
  await pg.query("update candidate_reminders set state='prepared' where step=1");
  const failed=await productionReminders(request(),env,()=>db,async()=>{sent++;throw Error('quota');});assert.equal(failed.status,503);
  await productionReminders(request(),env,()=>db,async()=>{sent++;return 'never';});assert.equal(sent,1);
  await pg.query("select record_candidate_contact_event($1,'OPTED_OUT')",[id]);
  assert.equal((await pg.query('select * from claim_pei_production_reminder()')).rows.length,0);
  // Legacy and missing consent cannot be selected even if an old prepared row exists.
  await pg.query("update candidates set opted_out_at=null,email_consent=false,pei_version=null where id=$1",[id]);
  await pg.query("update candidate_reminders set state='prepared'");
  assert.equal((await pg.query('select * from claim_pei_production_reminder()')).rows.length,0);
  await pg.exec(readFileSync('supabase/migrations/20261112_production_reminders.sql','utf8'));
 }finally{await pg.close();}
});

test('preview cannot initialize production database client even with inherited credentials',()=>{
 const old={url:process.env.SUPABASE_URL,key:process.env.SUPABASE_SERVICE_ROLE_KEY,environment:process.env.VERCEL_ENV};
 try{
  process.env.SUPABASE_SERVICE_ROLE_KEY='fixture';process.env.VERCEL_ENV='preview';
  for(const url of [PRODUCTION_SUPABASE_URL,PRODUCTION_SUPABASE_URL+'/rest/v1/','https://UCINVAGUVEEDAJFZRIFW.supabase.co']){
   process.env.SUPABASE_URL=url;assert.throws(()=>supabaseAdmin(),/base de pruebas/);
  }
 }finally{
  for(const [name,value] of Object.entries({SUPABASE_URL:old.url,SUPABASE_SERVICE_ROLE_KEY:old.key,VERCEL_ENV:old.environment}))if(value===undefined)delete process.env[name];else process.env[name]=value;
 }
});

test('PEI migration accepts observed production column types and constraints while preserving legacy results and activities',async()=>{
 const observed=JSON.parse(readFileSync('tests/fixtures/production-schema-20261112.json','utf8'));
 const pg=new PGlite();
 try{
  await pg.exec('create role anon;create role authenticated;create role service_role;');
  for(const table of ['candidates','activities','candidate_invitations']){
   const columns=observed.columns.filter(c=>c.table===table).map(c=>{
    assert.match(c.column,/^[a-z_]+$/);assert.ok(['uuid','text','boolean','integer','jsonb','timestamp with time zone'].includes(c.type));
    const def=c.column==='id'?' default gen_random_uuid()':['created_at','updated_at'].includes(c.column)?' default now()':c.column==='state'?" default 'pending'":'';
    return c.column+' '+c.type+def;
   });
   await pg.exec('create table '+table+'('+columns.join(',')+');');
  }
  for(const c of [...observed.constraints].sort((a,b)=>Number(a.definition.startsWith('FOREIGN'))-Number(b.definition.startsWith('FOREIGN'))))await pg.exec('alter table '+c.table+' add constraint '+c.name+' '+c.definition);
  const {rows:[{id}]}=await pg.query("insert into candidates(email,score,classification,manual_status,consent,studies_completed,invitation_sent_at) values('legacy@example.test',73,'HIGH_POTENTIAL','Videoconferencia',true,true,'2026-10-01T12:00:00Z') returning id");
  await pg.query("insert into activities(candidate_id,activity_type,description) values($1,'EMAIL','Legacy fixture')",[id]);
  await pg.query("insert into candidate_invitations(candidate_id,state,provider_id) values($1,'sent','legacy-provider-fixture')",[id]);
  const before=(await pg.query('select to_jsonb(c) snapshot from candidates c where id=$1',[id])).rows[0].snapshot;
  for(const file of ['202610_crm_invitations.sql','20261109_pei_v1.sql','20261110_email_only_reminders.sql','20261110_zoho_inbound.sql','20261111_reminder_dispatch.sql','20261111_resend_dispatch.sql','20261112_production_reminders.sql'])await pg.exec(readFileSync('supabase/migrations/'+file,'utf8'));
  const after=(await pg.query('select * from candidates where id=$1',[id])).rows[0];
  for(const k of ['score','classification','manual_status','consent'])assert.equal(after[k],before[k]);
  assert.equal(after.pei_version,null);assert.equal(after.email_consent,false);
  assert.equal((await pg.query('select count(*) count from activities')).rows[0].count,1);
  assert.equal((await pg.query('select state from candidate_invitations')).rows[0].state,'sent');
  assert.equal((await pg.query('select count(*) count from candidate_evaluations')).rows[0].count,1);
  assert.equal((await pg.query('select snapshot from candidate_evaluations')).rows[0].snapshot.score,73);
  assert.equal((await pg.query('select * from candidate_reminders')).rows.length,0);
  assert.equal((await pg.query('select * from claim_pei_production_reminder()')).rows.length,0);
 }finally{await pg.close();}
});

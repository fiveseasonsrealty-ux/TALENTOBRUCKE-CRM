import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {calculateScore, classifyPei, validateLead} from '../lib/scoring.ts';
import {canContact, canRemind} from '../lib/contact.ts';
import {peiEmail} from '../lib/peiEmail.ts';
import {reminderPlan, reminderText} from '../lib/reminders.ts';
const lead={profile:'engineer',education:'engineering',specialty:'mechanical',studies_completed:'yes',experience_years:'8+',german_level:'c1',germany_interest:'serious',learn_german:'yes',mobility:'yes',consent:true,email_consent:true,whatsapp_consent:true,email:'test@example.test',phone:'+525512345678'};
const contact={...lead,studies_completed:true,score:100,pei_eligible:true,pei_version:'PEI-1.0'};
test('approved PEI weights, equal education, exclusions and classifications',()=>{
 assert.equal(calculateScore(lead).score,100);
 for(const education of ['technical','technologist','engineering','masters']) assert.equal(calculateScore({...lead,education}).breakdown.education,25);
 for(const [level,points] of Object.entries({none:0,a1:5,a2:10,b1:20,b2:30,c1:35})) assert.equal(calculateScore({...lead,german_level:level}).breakdown.german,points);
 for(const [years,points] of Object.entries({'0':0,'<2':7,'2-4':12,'5-7':17,'8+':20})) assert.equal(calculateScore({...lead,experience_years:years}).breakdown.experience,points);
 for(const specialty of ['mechanical','industrial_engineering','electrical','mechatronics','automation','industrial_electronics']) assert.equal(calculateScore({...lead,specialty}).breakdown.specialty,10);
 for(const [score,category] of [[0,'C'],[49,'C'],[50,'B'],[74,'B'],[75,'A'],[100,'A']]) assert.equal(classifyPei(score,'b1'),category);
 assert.equal(classifyPei(100,'none'),'B');assert.equal(classifyPei(100,'unknown'),'B');
 assert.equal(calculateScore({...lead,german_level:'none'}).classification,'B');
 for(const change of [{studies_completed:'no'},{education:'incomplete'},{education:'unrelated'},{profile:'other'},{specialty:'nontechnical'}]) assert.equal(calculateScore({...lead,...change}).eligible,false);
 assert.equal(calculateScore({...lead,germany_interest:"exploring",learn_german:"maybe",mobility:"maybe"}).breakdown.motivation,0);
 assert.equal(validateLead(lead),null);
 for(const change of [{consent:'true'},{email:'invalid'},{email_consent:undefined},{german_level:'__proto__'},{education:'incomplete',studies_completed:'yes'},{phone:'123'}]) assert.ok(validateLead({...lead,...change}));
});
test('contact consent, response cancellation, reminder times and spam content',()=>{
 assert.equal(canContact({...contact,score:50},'email'),true);
 for(const change of [{score:49},{studies_completed:false},{education:'unrelated'},{profile:'other'},{manual_status:'No apto'},{consent:false},{email_consent:false},{opted_out_at:'2026-11-09'}]) assert.equal(canContact({...contact,...change},'email'),false);
 assert.equal(canContact({...contact,email_consent:false},'whatsapp'),true);
 assert.equal(canRemind({...contact,replied_at:'2026-11-09'},'whatsapp'),false);
 assert.deepEqual(reminderPlan('2026-11-09T10:00:00Z',contact).map(s=>s.dueAt),['2026-11-10T10:00:00.000Z','2026-11-11T10:00:00.000Z','2026-11-12T10:00:00.000Z']);
 assert.equal(reminderPlan('2026-11-09T10:00:00Z',{...contact,replied_at:'now'}).length,0);
 assert.deepEqual(reminderPlan('2026-11-09T10:00:00Z',{...contact,whatsapp_consent:false}).map(s=>s.step),[1,2,3]);
 assert.deepEqual(reminderPlan('2026-11-09T10:00:00Z',contact).map(s=>s.channel),['email','email','email']);
 assert.equal(reminderPlan('2026-11-09T10:00:00Z',{...contact,email_consent:false,whatsapp_consent:true}).length,0);
 assert.ok(!reminderText(1,'Ana',lead.email).includes('WhatsApp'));
 assert.equal(validateLead({...lead,phone:'',whatsapp_consent:undefined}),null);
 assert.match(reminderText(1,'Ana',lead.email),/spam/);assert.match(reminderText(1,'Ana',lead.email),/test@example.test/);
 const email=peiEmail('Ana',calculateScore(lead));assert.match(email.text,/100\/100/);assert.match(email.text,/Fortalezas/);assert.match(email.text,/Aspectos por mejorar/);assert.match(email.text,/Próximos pasos/);
});
test('PEI SQL migration preserves legacy, recalculates without contact, prepares/cancels reminders and denies public RPC',async()=>{
 const db=new PGlite();
 try {
  await db.exec('create role anon;create role authenticated;create role service_role;');
  await db.exec(readFileSync('supabase/schema.sql','utf8').replace('create extension if not exists pgcrypto;',''));
  const {rows:[{id}]}=await db.query("insert into candidates(email,score,classification,studies_completed,education,profile,specialty,consent) values('old@example.test',90,'HIGH_POTENTIAL',true,'technical','technician','mechanical',true) returning id");
  await db.exec(readFileSync('supabase/migrations/202610_crm_invitations.sql','utf8'));
  const migration=readFileSync('supabase/migrations/20261109_pei_v1.sql','utf8');await db.exec(migration);await db.exec(migration);
  const emailOnly=readFileSync('supabase/migrations/20261110_email_only_reminders.sql','utf8');await db.exec(emailOnly);await db.exec(emailOnly);
  assert.equal((await db.query('select * from candidate_evaluations')).rows.length,1);
  assert.equal((await db.query('select * from claim_candidate_invitation($1)',[id])).rows.length,0);
  await db.query('select recalculate_candidate_pei($1,null,$2::jsonb)',[id,JSON.stringify(calculateScore(lead))]);
  const c=(await db.query('select * from candidates where id=$1',[id])).rows[0];assert.equal(c.score,100);assert.equal(c.manual_status,'Nuevo');assert.equal(c.email_consent,false);
  const history=(await db.query('select * from candidate_evaluations')).rows;assert.equal(history.length,2);assert.equal(history.find(e=>e.version==='LEGACY').snapshot.score,90);
  assert.equal((await db.query('select * from claim_candidate_invitation($1)',[id])).rows.length,0);
  await assert.rejects(db.query('select recalculate_candidate_pei($1,null,$2::jsonb)',[id,JSON.stringify(calculateScore(lead))]));
  await db.query("update candidates set email_consent=true,whatsapp_consent=true,evaluation_reason='FORM_SUBMITTED',evaluation_token=gen_random_uuid() where id=$1",[id]);
  assert.equal((await db.query('select * from claim_candidate_invitation($1)',[id])).rows.length,0); // skipped old job stays skipped
  await db.query("update candidates set invitation_sent_at='2026-11-09T10:00:00Z' where id=$1",[id]);
  let reminders=(await db.query('select * from candidate_reminders order by step')).rows;assert.equal(reminders.length,3);assert.ok(reminders.every(r=>r.channel==='email'));assert.equal(new Date(reminders[0].due_at).toISOString(),'2026-11-10T10:00:00.000Z');
  await db.query("select record_candidate_contact_event($1,'REPLIED')",[id]);
  await db.query("select record_candidate_contact_event($1,'REPLIED')",[id]);
  assert.equal((await db.query("select * from activities where activity_type='REPLIED'")).rows.length,1);
  assert.equal((await db.query("select * from candidate_reminders where state='prepared'")).rows.length,0);
  await db.query("select record_candidate_contact_event($1,'OPTED_OUT')",[id]);
  assert.equal((await db.query('select email_consent from candidates where id=$1',[id])).rows[0].email_consent,false);
  assert.equal((await db.query("select has_function_privilege('anon','recalculate_candidate_pei(uuid,uuid,jsonb)','execute') as allowed")).rows[0].allowed,false);
  assert.equal((await db.query("select has_table_privilege('service_role','candidate_evaluations','update') as allowed")).rows[0].allowed,false);
  const fresh=(await db.query("insert into candidates(email,score,studies_completed,education,profile,specialty,consent,email_consent,whatsapp_consent,pei_version,pei_eligible,evaluation_reason,evaluation_token) values('fresh@example.test',50,true,'technical','technician','mechanical',true,true,true,'PEI-1.0',true,'FORM_SUBMITTED',gen_random_uuid()) returning id")).rows[0].id;
  assert.equal((await db.query('select * from claim_candidate_invitation($1)',[fresh])).rows.length,1);
  assert.equal((await db.query('select * from claim_candidate_invitation($1)',[fresh])).rows.length,0);
  await db.query("select complete_candidate_invitation($1,'fixture-provider-id')",[fresh]);
  await db.query("select complete_candidate_invitation($1,'fixture-provider-id')",[fresh]);
  assert.equal((await db.query("select * from candidate_reminders where candidate_id=$1",[fresh])).rows.length,3);
  await db.query("select record_candidate_contact_event($1,'OPTED_OUT')",[fresh]);
  assert.equal((await db.query("select * from candidate_reminders where candidate_id=$1 and state='prepared'",[fresh])).rows.length,0);
 }finally{await db.close();}
});

test('email-only migration converts prepared jobs, cancels unauthorized jobs and preserves sent/cancelled history',async()=>{
 const db=new PGlite();
 try{
  await db.exec('create role anon;create role authenticated;create role service_role;');
  await db.exec(readFileSync('supabase/schema.sql','utf8').replace('create extension if not exists pgcrypto;',''));
  await db.exec(readFileSync('supabase/migrations/202610_crm_invitations.sql','utf8'));
  await db.exec(readFileSync('supabase/migrations/20261109_pei_v1.sql','utf8'));
  const ids={};
  for(const [label,emailConsent,replied,state] of [['convert',true,false,'prepared'],['revoke',false,false,'prepared'],['replied',true,true,'prepared'],['sent',true,false,'sent'],['cancelled',true,false,'cancelled']]){
   const {rows:[{id}]}=await db.query("insert into candidates(email,score,studies_completed,education,profile,specialty,pei_version,pei_eligible,consent,email_consent,whatsapp_consent,replied_at) values($1,70,true,'technical','technician','mechanical','PEI-1.0',true,true,$2,true,$3) returning id",[label+'@example.test',emailConsent,replied?'2026-11-09T11:00:00Z':null]);ids[label]=id;
   await db.query("insert into candidate_reminders(candidate_id,step,channel,first_confirmed_at,due_at,state) values($1,1,'whatsapp','2026-11-09T10:00:00Z','2026-11-10T10:00:00Z',$2)",[id,state]);
  }
  const sql=readFileSync('supabase/migrations/20261110_email_only_reminders.sql','utf8');await db.exec(sql);await db.exec(sql);
  const rows=(await db.query('select * from candidate_reminders')).rows;
  const get=label=>rows.find(r=>r.candidate_id===ids[label]);
  assert.equal(get('convert').channel,'email');assert.equal(get('convert').state,'prepared');assert.equal(new Date(get('convert').due_at).toISOString(),'2026-11-10T10:00:00.000Z');
  assert.equal(get('revoke').state,'cancelled');assert.equal(get('replied').state,'cancelled');
  assert.equal(get('sent').state,'sent');assert.equal(get('sent').channel,'whatsapp');assert.equal(get('cancelled').state,'cancelled');assert.equal(get('cancelled').channel,'whatsapp');
  assert.equal((await db.query('select * from candidate_evaluations')).rows.length,5);
  await assert.rejects(db.query("insert into candidate_reminders(candidate_id,step,channel,first_confirmed_at,due_at) values($1,2,'whatsapp',now(),now())",[ids.convert]));
 }finally{await db.close();}
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createResendSender} from '../lib/resendOutbound.ts';
import {processPeiInvitations} from '../lib/peiInvitations.ts';
import {scheduledPeiReminders} from '../lib/zohoScheduler.ts';
import {createZohoEdgeHandler,TEST_SUPABASE_URL} from '../lib/zohoEdge.ts';
import {createHmac} from 'node:crypto';

const recipient='fiveseasonsrealty@gmail.com',token='test-route-token-'.repeat(4);
const env=n=>({RESEND_API_KEY:'fixture-only',ZOHO_WEBHOOK_TOKEN:token,PEI_TEST_REMINDERS_ENABLED:'true'})[n];
import {fixture} from './helpers/pei-db.mjs';
const dispatch=(db,send,readEnv=env)=>scheduledPeiReminders(new Request('https://example.test',{method:'POST'}),token,readEnv,db,send);

test('Resend transport confirms IDs, preserves reply address and idempotency, and never retries uncertain or quota responses',async()=>{
 let calls=0;
 const mail={to:recipient,subject:'Approved subject',text:'Approved text',idempotencyKey:'fixture-key'};
 const send=createResendSender('fake-test-key',async(url,options)=>{
  calls++;assert.equal(url,'https://api.resend.com/emails');assert.equal(options.headers['Idempotency-Key'],'fixture-key');
  assert.deepEqual(JSON.parse(options.body),{from:'TalentoBrücke <info@talentobruecke.com>',reply_to:'info@talentobruecke.com',to:[recipient],subject:mail.subject,text:mail.text});
  return Response.json({id:'accepted-fixture'});
 });
 assert.equal(await send(mail),'accepted-fixture');assert.equal(calls,1);
 for(const status of [429,403,500,200]){
  let attempts=0;const fail=createResendSender('fake',async()=>{attempts++;return Response.json({message:'sensitive detail'},{status});});
  await assert.rejects(fail(mail),e=>!e.message.includes('sensitive'));assert.equal(attempts,1);
 }
 await assert.rejects(createResendSender('fake',async()=>{throw Error('timeout');})(mail));
});

test('initial confirmation alone prepares 24/48/72 hours, first reminder retains spam advice, signed inbound reply cancels the rest',async()=>{
 const {pg,db,id}=await fixture();const messages=[];const send=async m=>{messages.push(m);return 'resend-fixture-'+messages.length;};
 try{
  assert.equal((await pg.query('select * from candidate_reminders')).rows.length,0);
  assert.equal((await processPeiInvitations(db,send,id)).sent,1);
  const rows=(await pg.query('select extract(epoch from (due_at-first_confirmed_at))/3600 hours from candidate_reminders order by step')).rows;
  assert.deepEqual(rows.map(r=>Number(r.hours)),[24,48,72]);
  assert.match(messages[0].text,/82\/100/);
  await pg.query("update candidate_reminders set due_at=now()-interval '1 minute' where candidate_id=$1 and step=1",[id]);
  assert.equal((await dispatch(db,send)).status,200);assert.equal(messages.length,2);assert.match(messages[1].text,/spam/);assert.match(messages[1].text,/Ana/);assert.match(messages[1].text,/fiveseasonsrealty@gmail.com/);
  assert.match(messages[1].subject,/^PEI-PRUEBA /);
  const secret='fixture-signing-key';
  const handler=createZohoEdgeHandler(n=>({SUPABASE_URL:TEST_SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY:'fixture',ZOHO_WEBHOOK_ENABLED:'true',ZOHO_WEBHOOK_TOKEN:token,ZOHO_WEBHOOK_SECRET:secret,ZOHO_WEBHOOK_MAILBOX:'info@talentobruecke.com',ZOHO_TEST_SENDER:recipient})[n],()=>db);
  const raw=JSON.stringify({messageId:'fixture-reply',fromAddress:recipient,toAddress:'info@talentobruecke.com',receivedTime:Date.now(),summary:'Respuesta de prueba',subject:'Re: '+messages[1].subject});
  const signature=createHmac('sha256',secret).update(raw).digest('base64');
  const received=await handler(new Request(TEST_SUPABASE_URL+'/functions/v1/zoho-pei-receptor/'+token,{method:'POST',body:raw,headers:{'x-hook-signature':signature}}));
  assert.equal(received.status,200);
  await dispatch(db,send);assert.equal(messages.length,2);
  assert.deepEqual((await pg.query('select state from candidate_reminders order by step')).rows.map(r=>r.state),['sent','cancelled','cancelled']);
 }finally{await pg.close();}
});

test('full three-reminder sequence uses approved content and sends each step once',async()=>{
 const {pg,db,id}=await fixture();const messages=[];const send=async m=>{messages.push(m);return 'accepted-'+messages.length;};
 try{
  await processPeiInvitations(db,send,id);
  for(const step of [1,2,3]){
   await pg.query("update candidate_reminders set dispatched_at=now()-interval '25 hours' where state='sent'");
   await pg.query("update candidate_reminders set due_at=now()-interval '1 minute' where step=$1",[step]);
   await dispatch(db,send);await dispatch(db,send);
  }
  assert.equal(messages.length,4);assert.equal(new Set(messages.map(m=>m.idempotencyKey)).size,4);
  assert.match(messages[3].text,/último recordatorio/);
  assert.deepEqual((await pg.query('select state from candidate_reminders order by step')).rows.map(r=>r.state),['sent','sent','sent']);
 }finally{await pg.close();}
});

test('opt-out stops pending reminders, uncertain dispatch cannot repeat, disabled and unconfigured schedulers never claim',async()=>{
 const {pg,db,id}=await fixture();let sends=0;const send=async()=>{sends++;return 'accepted';};
 try{
  await processPeiInvitations(db,send,id);
  await pg.query("update candidate_reminders set due_at=now()-interval '1 minute'");
  await dispatch(db,send,n=>n==='PEI_TEST_REMINDERS_ENABLED'?'false':env(n));
  assert.equal((await dispatch(db,send,n=>n==='RESEND_API_KEY'?undefined:env(n))).status,503);assert.equal(sends,1);
  await dispatch(db,async()=>{sends++;throw Error('timeout');});await dispatch(db,send);assert.equal(sends,2);
  assert.equal((await pg.query('select state from candidate_reminders where step=1')).rows[0].state,'review');
  await pg.query("select record_zoho_mail_event($1,$2,'OPTED_OUT',now())",['b'.repeat(64),recipient]);
  await dispatch(db,send);assert.equal(sends,2);
  assert.deepEqual((await pg.query('select state from candidate_reminders order by step')).rows.map(r=>r.state),['review','cancelled','cancelled']);
 }finally{await pg.close();}
});

test('unconfirmed initial send creates no reminder and is not retried',async()=>{
 const {pg,db,id}=await fixture();let calls=0;
 try{
  const fail=async()=>{calls++;throw Error('uncertain');};
  assert.equal((await processPeiInvitations(db,fail,id)).sent,0);await processPeiInvitations(db,fail,id);
  assert.equal(calls,1);assert.equal((await pg.query('select * from candidate_reminders')).rows.length,0);
  assert.equal((await pg.query('select state from candidate_invitations')).rows[0].state,'review');
 }finally{await pg.close();}
});

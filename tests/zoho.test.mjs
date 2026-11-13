import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {receiveZoho,parseZohoMail,verifyZohoSignature,encryptZohoSecret,decryptZohoSecret} from '../lib/zohoWebhook.ts';
const now=Date.UTC(2026,10,10,12);const mailbox='info@example.test';const token='fixture-route-token-'.repeat(3);const secret='fixture-signing-secret-not-real';const key='ab'.repeat(32);
const settings={enabled:true,token,mailbox,secret};
const mail=(extra={})=>({messageId:'1560840837125110000',fromAddress:'ana@example.test',toAddress:mailbox,receivedTime:now,subject:'Re: Tu evaluación',summary:'Gracias, me interesa.',...extra});
const signature=(raw,s=secret)=>createHmac('sha256',s).update(raw).digest('base64');
const request=(raw,s=secret,headers={})=>new Request('http://127.0.0.1/api/webhooks/zoho/'+token,{method:'POST',headers:{'content-type':'application/json','x-hook-signature':signature(raw,s),...headers},body:raw});
const noop={loadEncryptedSecret:async()=>null,saveEncryptedSecret:async()=>true,recordEvent:async()=>{}};
test('Zoho signature uses exact bytes and encrypted registration secrets reject tampering',()=>{
 const raw=Buffer.from(JSON.stringify(mail()));assert.equal(verifyZohoSignature(raw,signature(raw),secret),true);
 assert.equal(verifyZohoSignature(Buffer.concat([raw,Buffer.from(' ')]),signature(raw),secret),false);
 for(const s of ['','invalid',signature(raw,'other-secret')])assert.equal(verifyZohoSignature(raw,s,secret),false);
 const encrypted=encryptZohoSecret(secret,key);assert.ok(!encrypted.includes(secret));assert.equal(decryptZohoSecret(encrypted,key),secret);
 assert.throws(()=>decryptZohoSecret(encrypted,'cd'.repeat(32)));assert.throws(()=>encryptZohoSecret(secret,'short'));
});
test('Zoho parser handles large IDs, mailbox matching and quoted BAJA without opting out normal replies',()=>{
 const raw=JSON.stringify(mail()).replace('"1560840837125110000"','1560840837125110000');const a=parseZohoMail(raw,mailbox,now);assert.equal(a.event,'REPLIED');
 const b=parseZohoMail(raw.replace('1560840837125110000','1560840837125110001'),mailbox,now);assert.notEqual(a.eventKey,b.eventKey);
 assert.equal(parseZohoMail(JSON.stringify(mail({summary:'Gracias.\n> Para dejar de recibir comunicaciones, responde BAJA.'})),mailbox,now).event,'REPLIED');
 for(const summary of ['BAJA','baja.','No quiero recibir más correos','unsubscribe'])assert.equal(parseZohoMail(JSON.stringify(mail({summary})),mailbox,now).event,'OPTED_OUT');
 assert.equal(parseZohoMail(JSON.stringify(mail({summary:'',html:'<p>BAJA</p><blockquote>Otra cosa</blockquote>'})),mailbox,now).event,'OPTED_OUT');
 assert.equal(parseZohoMail(JSON.stringify(mail({subject:'BAJA'})),mailbox,now).event,'OPTED_OUT');
 assert.equal(parseZohoMail(JSON.stringify(mail({toAddress:'other@example.test'})),mailbox,now),null);
 assert.equal(parseZohoMail(JSON.stringify(mail({fromAddress:mailbox})),mailbox,now),null);
 assert.equal(parseZohoMail(JSON.stringify(mail({receivedTime:now-31*86400000})),mailbox,now),null);
 assert.throws(()=>parseZohoMail(JSON.stringify(mail({receivedTime:now+600000})),mailbox,now));
 assert.throws(()=>parseZohoMail(JSON.stringify(mail({messageId:undefined})),mailbox,now));
});
test('Zoho endpoint fails closed, bounds request size and never trusts a replacement x-hook-secret',async()=>{
 let applied=0;const d={...noop,recordEvent:async()=>applied++};const raw=JSON.stringify(mail());
 assert.equal((await receiveZoho(request(raw),token,{...settings,enabled:false},d,now)).status,503);
 assert.equal((await receiveZoho(request(raw),'wrong',settings,d,now)).status,401);
 assert.equal((await receiveZoho(request(raw,'attacker',{'x-hook-secret':'attacker'}),token,settings,d,now)).status,401);
 assert.equal((await receiveZoho(request('x'.repeat(256*1024+1)),token,settings,d,now)).status,413);
 assert.equal((await receiveZoho(request('{'),token,settings,d,now)).status,400);
 assert.equal(applied,0);
 assert.equal((await receiveZoho(request(raw),token,settings,d,now)).status,200);assert.equal(applied,1);
 const unavailable={...d,recordEvent:async()=>{throw Error('Database unavailable');}};
 assert.equal((await receiveZoho(request(raw),token,settings,unavailable,now)).status,503);
});
test('Zoho registration is explicit, short lived, encrypted, one time and never processes the initial payload',async()=>{
 let encrypted=null,applied=0;const d={loadEncryptedSecret:async()=>encrypted,saveEncryptedSecret:async v=>{if(encrypted)return false;encrypted=v;return true;},recordEvent:async()=>applied++};
 const raw=JSON.stringify(mail());const s={enabled:true,token,mailbox,encryptionKey:key,enrollUntil:new Date(now+300000).toISOString()};
 assert.equal((await receiveZoho(request(raw),token,{...s,enrollUntil:undefined},d,now)).status,503);
 assert.equal((await receiveZoho(request(raw),token,s,d,now)).status,401);
 assert.equal((await receiveZoho(request(raw,secret,{'x-hook-secret':secret}),token,s,d,now)).status,200);assert.ok(encrypted);assert.equal(applied,0);
 assert.equal((await receiveZoho(request(raw,'replacement',{'x-hook-secret':'replacement'}),token,s,d,now)).status,401);
 assert.equal((await receiveZoho(request(raw),token,{...s,enrollUntil:undefined},d,now)).status,200);assert.equal(applied,1);
});
test('signed Zoho replies and opt-outs atomically cancel email reminders, deduplicate and preserve candidate history',async()=>{
 const db=new PGlite();
 try{
  await db.exec('create role anon;create role authenticated;create role service_role;');
  await db.exec(readFileSync('supabase/schema.sql','utf8').replace('create extension if not exists pgcrypto;',''));
  for(const f of ['202610_crm_invitations.sql','20261109_pei_v1.sql','20261110_email_only_reminders.sql','20261110_zoho_inbound.sql'])await db.exec(readFileSync('supabase/migrations/'+f,'utf8'));
  await db.exec(readFileSync('supabase/migrations/20261110_zoho_inbound.sql','utf8'));
  const {rows:[{id}]}=await db.query("insert into candidates(email,score,studies_completed,education,profile,specialty,pei_version,pei_eligible,consent,email_consent,manual_status) values('ana@example.test',80,true,'technical','technician','mechanical','PEI-1.0',true,true,true,'Videoconferencia') returning id");
  await db.query('update candidates set invitation_sent_at=$2 where id=$1',[id,new Date(now-86400000).toISOString()]);
  assert.equal((await db.query("select count(*)::int n from candidate_reminders where state='prepared'")).rows[0].n,3);
  const d={...noop,recordEvent:async e=>{await db.query('select record_zoho_mail_event($1,$2,$3,$4)',[e.eventKey,e.sender,e.event,e.receivedAt]);}};
  const reply=JSON.stringify(mail());await receiveZoho(request(reply),token,settings,d,now);await receiveZoho(request(reply),token,settings,d,now);
  assert.equal((await db.query("select count(*)::int n from candidate_reminders where state='prepared'")).rows[0].n,0);
  assert.equal((await db.query('select * from candidate_mail_events')).rows.length,1);
  assert.equal((await db.query("select * from activities where activity_type='REPLIED'")).rows.length,1);
  const optout=JSON.stringify(mail({messageId:'next-message',summary:'BAJA'}));await receiveZoho(request(optout),token,settings,d,now);
  const c=(await db.query('select * from candidates where id=$1',[id])).rows[0];assert.ok(c.opted_out_at);assert.equal(c.email_consent,false);assert.equal(c.score,80);assert.equal(c.manual_status,'Videoconferencia');
  assert.equal((await db.query('select * from candidate_evaluations')).rows.length,1);
  const unknown=JSON.stringify(mail({messageId:'unknown',fromAddress:'unknown@example.test'}));await receiveZoho(request(unknown),token,settings,d,now);
  assert.equal((await db.query("select * from candidate_mail_events where outcome='unknown_sender'")).rows.length,1);
  assert.equal((await db.query('select * from candidates')).rows.length,1);
  assert.equal((await db.query("select has_function_privilege('anon','record_zoho_mail_event(text,text,text,timestamptz)','execute') allowed")).rows[0].allowed,false);
  assert.equal((await db.query("select has_table_privilege('authenticated','zoho_webhook_config','select') allowed")).rows[0].allowed,false);
  const stored=(await db.query('select * from candidate_mail_events')).rows[0];assert.ok(!('body' in stored));assert.ok(!('sender_email' in stored));
 }finally{await db.close();}
});

test('test-only filters require the approved sender and PEI-PRUEBA subject',()=>{
 const filters={allowedSenders:['ana@example.test'],subjectPrefix:'PEI-PRUEBA'};
 assert.ok(parseZohoMail(JSON.stringify(mail({subject:'Re: PEI-PRUEBA RESPUESTA'})),mailbox,now,filters));
 assert.equal(parseZohoMail(JSON.stringify(mail({subject:'PEI-PRUEBA',fromAddress:'other@example.test'})),mailbox,now,filters),null);
 assert.equal(parseZohoMail(JSON.stringify(mail({subject:'Otro asunto'})),mailbox,now,filters),null);
 assert.equal(parseZohoMail(JSON.stringify(mail({subject:undefined})),mailbox,now,filters),null);
 assert.equal(parseZohoMail(JSON.stringify(mail({subject:'PEI-PRUEBA',summary:'',html:'BAJA<br />Texto citado'})),mailbox,now,filters).event,'OPTED_OUT');
});

test('unsigned initial Zoho verification requires explicit opt-in and cannot bypass later signatures',async()=>{
 let encrypted=null,applied=0;const d={loadEncryptedSecret:async()=>encrypted,saveEncryptedSecret:async v=>{encrypted=v;return true;},recordEvent:async()=>applied++};
 const raw=JSON.stringify(mail());const s={enabled:true,token,mailbox,encryptionKey:key,enrollUntil:new Date(now+300000).toISOString(),allowUnsignedRegistration:true};
 const unsigned=()=>new Request('http://localhost/',{method:'POST',headers:{'x-hook-secret':secret},body:raw});
 assert.equal((await receiveZoho(unsigned(),token,{...s,allowUnsignedRegistration:false},d,now)).status,401);
 assert.equal((await receiveZoho(unsigned(),'wrong',s,d,now)).status,401);
 assert.equal((await receiveZoho(unsigned(),token,{...s,enrollUntil:new Date(now-1).toISOString()},d,now)).status,503);
 assert.equal((await receiveZoho(request(raw,'wrong',{'x-hook-secret':secret}),token,s,d,now)).status,401);
 assert.equal((await receiveZoho(unsigned(),token,s,d,now)).status,200);assert.ok(encrypted);assert.equal(applied,0);
 assert.equal((await receiveZoho(unsigned(),token,s,d,now)).status,401);assert.equal(applied,0);
 assert.equal((await receiveZoho(request(raw),token,s,d,now)).status,200);assert.equal(applied,1);
});

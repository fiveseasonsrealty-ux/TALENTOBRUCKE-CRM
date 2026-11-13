import {test} from 'node:test';import assert from 'node:assert/strict';import {createHmac} from 'node:crypto';
import {createZohoEdgeHandler,TEST_SUPABASE_URL,ZOHO_EDGE_NAME} from '../lib/zohoEdge.ts';
const root=TEST_SUPABASE_URL+'/functions/v1/'+ZOHO_EDGE_NAME;
test('Supabase receiver is test-only, health is public, and processing defaults to disabled',async()=>{
 let clients=0;const handler=createZohoEdgeHandler(n=>({SUPABASE_URL:TEST_SUPABASE_URL})[n],()=>{clients++;throw Error('Should not use database');});
 const health=await handler(new Request(root));assert.equal(health.status,200);assert.deepEqual(await health.json(),{status:'ready',environment:'test',receiverEnabled:false,sendsEnabled:false});
 assert.equal((await handler(new Request(root+'/token',{method:'POST',body:'{}'}))).status,503);assert.equal(clients,0);
 assert.equal((await handler(new Request(TEST_SUPABASE_URL+'/other'))).status,404);
 const wrong=createZohoEdgeHandler(n=>n==='SUPABASE_URL'?'https://other-project.supabase.co':undefined,()=>{throw Error('No access');});assert.equal((await wrong(new Request(root))).status,503);
});
test('Supabase adapter authenticates before DB use and forwards only verified event metadata',async()=>{
 const token='fixture-token-'.repeat(4),secret='fixture-secret-not-real';let forwarded=null;
 const env={SUPABASE_URL:TEST_SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY:'fixture-key',ZOHO_WEBHOOK_ENABLED:'true',ZOHO_WEBHOOK_TOKEN:token,ZOHO_WEBHOOK_SECRET:secret,ZOHO_WEBHOOK_MAILBOX:'info@example.test',ZOHO_TEST_SENDER:'ana@example.test'};
 let clients=0;const handler=createZohoEdgeHandler(n=>env[n],(url,key)=>{clients++;assert.equal(url,TEST_SUPABASE_URL);assert.equal(key,'fixture-key');return{rpc:async(name,args)=>{assert.equal(name,'record_zoho_mail_event');forwarded=args;return{error:null};}}});
 const raw=JSON.stringify({messageId:'edge-fixture',fromAddress:'ana@example.test',toAddress:'info@example.test',receivedTime:Date.now(),summary:'BAJA',subject:'PEI-PRUEBA BAJA'});
 const request=signature=>new Request(root+'/'+token,{method:'POST',body:raw,headers:{'x-hook-signature':signature}});
 assert.equal((await handler(request('fake'))).status,401);assert.equal(clients,0);
 const signature=createHmac('sha256',secret).update(raw).digest('base64');assert.equal((await handler(request(signature))).status,200);assert.equal(clients,1);
 assert.equal(forwarded.sender_email,'ana@example.test');assert.equal(forwarded.event_name,'OPTED_OUT');assert.match(forwarded.event_key,/^[a-f0-9]{64}$/);assert.ok(!('summary' in forwarded));assert.ok(!('subject' in forwarded));
});

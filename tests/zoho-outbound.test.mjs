import { test } from "node:test";
import assert from "node:assert/strict";
import { sendZohoTestMessage, zohoTestMessages } from "../lib/zohoOutboundTest.ts";

const config = {clientId:"fixture",clientSecret:"fixture",refreshToken:"fixture",accountId:"1234567890123456789"};

test("Zoho test transport only sends the chosen fixture to the fixed test inbox", async () => {
  const messages = zohoTestMessages();
  assert.equal(messages.length,4);
  assert.ok(messages.every(x=>x.subject.startsWith("PEI-PRUEBA ")));
  assert.match(messages[1].text,/spam/);
  let calls=0;
  const response=await sendZohoTestMessage(config,1,async (url,req)=>{
    calls++;
    if(calls===1) {
      assert.equal(url,"https://accounts.zoho.com/oauth/v2/token");
      assert.equal(req.redirect,"error");
      return Response.json({access_token:"fixture"});
    }
    assert.equal(url,"https://mail.zoho.com/api/accounts/1234567890123456789/messages");
    const body=JSON.parse(req.body);
    assert.equal(body.fromAddress,"info@talentobruecke.com");
    assert.equal(body.toAddress,"fiveseasonsrealty@gmail.com");
    assert.equal(body.subject,messages[1].subject);
    assert.equal(body.ccAddress,undefined);
    assert.equal(body.bccAddress,undefined);
    return Response.json({status:{code:200},data:{messageId:"123"}});
  });
  assert.equal(calls,2);
  assert.equal(response.accepted,true);
});

test("failed access and uncertain delivery do not retry or report success",async()=>{
  let calls=0;
  await assert.rejects(sendZohoTestMessage(config,0,async()=>{calls++;return Response.json({error:"invalid_grant"});}),/no autorizó/);
  assert.equal(calls,1);
  calls=0;
  await assert.rejects(sendZohoTestMessage(config,0,async()=>{calls++;if(calls===1)return Response.json({access_token:"fixture"});throw Error("timeout");}),/antes de repetir/);
  assert.equal(calls,2);
});

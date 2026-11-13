export type PeiMail = {to:string; subject:string; text:string; idempotencyKey:string};
export type PeiSender = (mail:PeiMail)=>Promise<string>;
// A timeout may mean acceptance. Never retry automatically.
export function createResendSender(apiKey:string, request:typeof fetch=fetch):PeiSender {
 return async mail=>{
  if(!apiKey || !mail.to || !mail.subject || !mail.text || !mail.idempotencyKey)throw Error("Configuración de correo incompleta");
  const response=await request("https://api.resend.com/emails",{
   method:"POST",headers:{Authorization:"Bearer "+apiKey,"Content-Type":"application/json","Idempotency-Key":mail.idempotencyKey},
   body:JSON.stringify({from:"TalentoBrücke <info@talentobruecke.com>",reply_to:"info@talentobruecke.com",to:[mail.to],subject:mail.subject,text:mail.text}),
   signal:AbortSignal.timeout(30000),
  });
  const data=await response.json();
  if(!response.ok || typeof data?.id!=="string" || !data.id)throw Error("Envío sin confirmación de Resend; requiere revisión");
  return data.id;
 };
}

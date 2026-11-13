import { scheduledPeiReminders } from "./zohoScheduler.ts";
import { receiveZoho } from "./zohoWebhook.ts";
export const TEST_SUPABASE_URL="https://qzmhrjofalmzxkltctlf.supabase.co";
export const ZOHO_EDGE_NAME="zoho-pei-receptor";
export function createZohoEdgeHandler(readEnv:(name:string)=>string|undefined,createClient:(url:string,key:string)=>any) {
 return async(req:Request):Promise<Response>=>{
  const reply=(status:number,result:string)=>Response.json({result},{status,headers:{"Cache-Control":"no-store"}});
  // This published adapter is deliberately restricted to the approved test project.
  if(readEnv("SUPABASE_URL")!==TEST_SUPABASE_URL)return reply(503,"wrong_project");
  const path=new URL(req.url).pathname;
  const match=path.match(/^\/(?:functions\/v1\/)?zoho-pei-receptor(?:\/([^/]+))?(\/reminders)?\/?$/);
  if(!match)return reply(404,"not_found");
  if(req.method==="GET"&&!match[1])return Response.json({status:"ready",environment:"test",receiverEnabled:readEnv("ZOHO_WEBHOOK_ENABLED")==="true",sendsEnabled:readEnv("PEI_TEST_REMINDERS_ENABLED")==="true"},{headers:{"Cache-Control":"no-store"}});
  if(match[2]) {
   const db=createClient(TEST_SUPABASE_URL,readEnv("SUPABASE_SERVICE_ROLE_KEY")||"");
   return scheduledPeiReminders(req,match[1]||"",readEnv,db);
  }
  if(req.method!=="POST")return reply(405,"method_not_allowed");
  const testSender=readEnv("ZOHO_TEST_SENDER")?.trim().toLowerCase();
  if(readEnv("ZOHO_WEBHOOK_ENABLED")==="true" && !testSender)return reply(503,"test_filter_required");
  const serviceKey=readEnv("SUPABASE_SERVICE_ROLE_KEY");
  let db:any;
  const getDb=()=>{if(!serviceKey)throw Error("Missing server configuration");return db ||= createClient(TEST_SUPABASE_URL,serviceKey);};
  const configId="zoho-pei-inbound-v1";
  return receiveZoho(req,match[1]||"",{
   enabled:readEnv("ZOHO_WEBHOOK_ENABLED")==="true",token:readEnv("ZOHO_WEBHOOK_TOKEN")||"",mailbox:readEnv("ZOHO_WEBHOOK_MAILBOX")||"",
   allowedSenders:testSender?[testSender]:[],subjectPrefix:"PEI-PRUEBA",
   secret:readEnv("ZOHO_WEBHOOK_SECRET"),encryptionKey:readEnv("ZOHO_WEBHOOK_ENCRYPTION_KEY"),enrollUntil:readEnv("ZOHO_WEBHOOK_ENROLL_UNTIL"),allowUnsignedRegistration:readEnv("ZOHO_ALLOW_UNSIGNED_REGISTRATION")==="true",
  },{
   async loadEncryptedSecret(){const {data,error}=await getDb().from("zoho_webhook_config").select("encrypted_secret").eq("id",configId).maybeSingle();if(error)throw error;return data?.encrypted_secret||null;},
   async saveEncryptedSecret(value){const {error}=await getDb().from("zoho_webhook_config").insert({id:configId,encrypted_secret:value});if(error?.code==="23505")return false;if(error)throw error;return true;},
   async recordEvent(e){const {error}=await getDb().rpc("record_zoho_mail_event",{event_key:e.eventKey,sender_email:e.sender,event_name:e.event,received_at:e.receivedAt});if(error)throw error;},
  });
 };
}

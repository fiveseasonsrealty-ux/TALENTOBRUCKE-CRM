import { receiveZoho } from "./zohoWebhook.ts";
import { PRODUCTION_SUPABASE_URL,productionReminders } from "./productionReminders.ts";

// Separate entry point. Never widen the published test adapter.
export function createProductionEdgeHandler(env:(name:string)=>string|undefined,createClient:(url:string,key:string)=>any) {
 return async(req:Request):Promise<Response>=>{
  const reply=(status:number,result:string)=>Response.json({result},{status,headers:{"Cache-Control":"no-store"}});
  if(env("SUPABASE_URL")!==PRODUCTION_SUPABASE_URL)return reply(503,"wrong_project");
  const match=new URL(req.url).pathname.match(/^\/(?:functions\/v1\/)?pei-production(?:\/(reminders|zoho)(?:\/([^/]+))?)?\/?$/);
  if(!match)return reply(404,"not_found");
  if(req.method==="GET"&&!match[1])return Response.json({status:"ready",environment:"production",receiverEnabled:env("PEI_PRODUCTION_RECEIVER_ENABLED")==="true",sendsEnabled:env("PEI_PRODUCTION_REMINDERS_ENABLED")==="true"&&env("PEI_OUTBOUND_ENABLED")==="true"},{headers:{"Cache-Control":"no-store"}});
  let db:any;
  const getDb=()=>{const key=env("SUPABASE_SERVICE_ROLE_KEY");if(!key)throw Error("Server configuration missing");return db ||= createClient(PRODUCTION_SUPABASE_URL,key);};
  if(match[1]==="reminders"&&!match[2])return productionReminders(req,env,getDb);
  if(match[1]!=="zoho"||!match[2])return reply(404,"not_found");
  if(req.method!=="POST")return reply(405,"method_not_allowed");
  return receiveZoho(req,match[2],{
   enabled:env("PEI_PRODUCTION_RECEIVER_ENABLED")==="true",token:env("ZOHO_PRODUCTION_WEBHOOK_TOKEN")||"",mailbox:"info@talentobruecke.com",
   secret:env("ZOHO_PRODUCTION_WEBHOOK_SECRET"),encryptionKey:env("ZOHO_PRODUCTION_ENCRYPTION_KEY"),enrollUntil:env("ZOHO_PRODUCTION_ENROLL_UNTIL"),
   allowUnsignedRegistration:false,
  },{
   async loadEncryptedSecret(){const {data,error}=await getDb().from("zoho_webhook_config").select("encrypted_secret").eq("id","zoho-pei-production-v1").maybeSingle();if(error)throw error;return data?.encrypted_secret||null;},
   async saveEncryptedSecret(value){const {error}=await getDb().from("zoho_webhook_config").insert({id:"zoho-pei-production-v1",encrypted_secret:value});if(error?.code==="23505")return false;if(error)throw error;return true;},
   async recordEvent(e){const {error}=await getDb().rpc("record_zoho_mail_event",{event_key:e.eventKey,sender_email:e.sender,event_name:e.event,received_at:e.receivedAt});if(error)throw error;},
  });
 };
}

import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { receiveZoho } from "../../../../../lib/zohoWebhook";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function POST(req:Request,context:{params:Promise<{token:string}>}) {
 const {token}=await context.params;
 const configId="zoho-pei-inbound-v1";
 // This route has its own token + HMAC authentication; it is not a CRM Basic-auth endpoint.
 return receiveZoho(req,token,{
  enabled:process.env.ZOHO_WEBHOOK_ENABLED==="true",token:process.env.ZOHO_WEBHOOK_TOKEN||"",
  mailbox:process.env.ZOHO_WEBHOOK_MAILBOX||"",secret:process.env.ZOHO_WEBHOOK_SECRET,
  encryptionKey:process.env.ZOHO_WEBHOOK_ENCRYPTION_KEY,enrollUntil:process.env.ZOHO_WEBHOOK_ENROLL_UNTIL,
 },{
  async loadEncryptedSecret(){const {data,error}=await supabaseAdmin().from("zoho_webhook_config").select("encrypted_secret").eq("id",configId).maybeSingle();if(error)throw error;return data?.encrypted_secret||null;},
  async saveEncryptedSecret(value){const {error}=await supabaseAdmin().from("zoho_webhook_config").insert({id:configId,encrypted_secret:value});if(error?.code==="23505")return false;if(error)throw error;return true;},
  async recordEvent(e){const {error}=await supabaseAdmin().rpc("record_zoho_mail_event",{event_key:e.eventKey,sender_email:e.sender,event_name:e.event,received_at:e.receivedAt});if(error)throw error;},
 });
}

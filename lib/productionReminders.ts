import { equalSecret } from "./zohoWebhook.ts";
import { canRemind } from "./contact.ts";
import { reminderEmail } from "./reminders.ts";
import { createResendSender, type PeiSender } from "./resendOutbound.ts";

export const PRODUCTION_SUPABASE_URL="https://ucinvaguveedajfzrifw.supabase.co";
export function productionSchedulerAuthorized(req:Request,env:(name:string)=>string|undefined) {
 const token=env("PEI_PRODUCTION_CRON_SECRET")||"";
 return token.length>=32 && equalSecret(req.headers.get("authorization")||"","Bearer "+token);
}
export async function productionReminders(req:Request,env:(name:string)=>string|undefined,getDb:()=>any,sender?:PeiSender) {
 const reply=(status:number,result:string)=>Response.json({result},{status,headers:{"Cache-Control":"no-store"}});
 if(env("SUPABASE_URL")!==PRODUCTION_SUPABASE_URL)return reply(503,"wrong_project");
 if(!productionSchedulerAuthorized(req,env))return reply(401,"unauthorized");
 if(req.method!=="POST")return reply(405,"method_not_allowed");
 if(env("PEI_PRODUCTION_REMINDERS_ENABLED")!=="true"||env("PEI_OUTBOUND_ENABLED")!=="true")return reply(200,"disabled");
 const apiKey=env("RESEND_API_KEY");if(!apiKey)return reply(503,"not_configured");
 let db:any;
 const call=async(name:string,args:any)=>{const {data,error}=await db.rpc(name,args);if(error)throw Error("Database operation failed");return data;};
 let run:string|undefined;
 try {
  db=getDb();
  run=await call("pei_production_scheduler_start",{});
  const jobs=await call("claim_pei_production_reminder",{});
  const job=jobs?.[0];
  if(!job){await call("pei_scheduler_finish",{target_run:run,accepted:0,run_status:"completed"});return reply(200,"nothing_due");}
  const {data:c,error}=await db.from("candidates").select("*").eq("id",job.candidate_id).single();
  let messageId:string|null=null;
  if(!error&&c&&c.email===job.recipient&&c.invitation_sent_at&&canRemind(c,"email")){
   const letter=reminderEmail(job.step,c.first_name||"",c.email);
   try{messageId=await (sender||createResendSender(apiKey))({to:c.email,...letter,idempotencyKey:`pei-production-reminder-v1-${job.candidate_id}-${job.step}-${job.dispatch_id}`});}catch{/* Hold quota and ambiguous outcomes for review. */}
  }
  const finished=await call("finish_pei_reminder",{target_candidate:job.candidate_id,target_step:job.step,target_dispatch:job.dispatch_id,message_id:messageId});
  if(!finished)throw Error("Dispatch was not recorded");
  await call("pei_scheduler_finish",{target_run:run,accepted:messageId?1:0,run_status:messageId?"completed":"review"});
  return reply(messageId?200:503,messageId?"accepted":"review_required");
 }catch{
  if(run)await call("pei_scheduler_finish",{target_run:run,accepted:0,run_status:"review"}).catch(()=>{});
  return reply(503,"review_required");
 }
}

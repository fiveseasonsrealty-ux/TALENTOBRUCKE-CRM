import { equalSecret } from "./zohoWebhook.ts";
import { canRemind } from "./contact.ts";
import { createResendSender, type PeiSender } from "./resendOutbound.ts";
import { reminderEmail } from "./reminders.ts";

// This adapter intentionally serves the approved Supabase test project and own-mailbox fixture.
export async function scheduledPeiReminders(
 req:Request, routeToken:string, env:(name:string)=>string|undefined, db:any, sender?:PeiSender
) {
 const reply=(status:number,result:string)=>Response.json({result},{status});
 const configured=env("ZOHO_WEBHOOK_TOKEN")||"";
 if(configured.length<32 || !equalSecret(configured,routeToken)) return reply(401,"unauthorized");
 if(req.method!=="POST") return reply(405,"method_not_allowed");
 const enabled=env("PEI_TEST_REMINDERS_ENABLED")==="true";
 const recipient="fiveseasonsrealty@gmail.com";
 const call=async(name:string,args:any)=>{
  const {data,error}=await db.rpc(name,args);
  if(error) throw Error("Database operation failed");
  return data;
 };
 let run:string|undefined;
 try {
  run=await call("pei_scheduler_start",{run_mode:enabled?"sending":"simulation",allowed_email:recipient});
  if(!enabled) {
   await call("pei_scheduler_finish",{target_run:run,accepted:0,run_status:"completed"});
   return reply(200,"simulation_completed");
  }
  const apiKey=env("RESEND_API_KEY")||"";
  if(!apiKey) {
   await call("pei_scheduler_finish",{target_run:run,accepted:0,run_status:"not_configured"});
   return reply(503,"not_configured");
  }
  const jobs=await call("claim_pei_reminder",{allowed_email:recipient});
  if(!jobs?.length) {
   await call("pei_scheduler_finish",{target_run:run,accepted:0,run_status:"completed"});
   return reply(200,"nothing_due");
  }
  const job=jobs[0];
  const {data:c,error}=await db.from("candidates").select("*").eq("id",job.candidate_id).single();
  let messageId:string|null=null;
  if(!error && c.email===recipient && canRemind(c,"email")) {
   const letter=reminderEmail(job.step,c.first_name||"",recipient);
   try { messageId=await (sender||createResendSender(apiKey))({to:recipient,...letter,subject:"PEI-PRUEBA "+letter.subject,idempotencyKey:`pei-reminder-v1-${job.candidate_id}-${job.step}-${job.dispatch_id}`}); } catch { /* Ambiguous sends require review. */ }
  }
  const finished=await call("finish_pei_reminder",{target_candidate:job.candidate_id,target_step:job.step,target_dispatch:job.dispatch_id,message_id:messageId});
  if(!finished) throw Error("Dispatch result was not recorded");
  await call("pei_scheduler_finish",{target_run:run,accepted:messageId?1:0,run_status:messageId?"completed":"review"});
  return reply(messageId?200:503,messageId?"accepted":"review_required");
 } catch {
  if(run) await call("pei_scheduler_finish",{target_run:run,accepted:0,run_status:"review"}).catch(()=>{});
  return reply(503,"review_required");
 }
}

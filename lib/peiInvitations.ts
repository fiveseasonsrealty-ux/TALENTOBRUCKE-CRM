import { canContact } from "./contact.ts";
import { peiEmail } from "./peiEmail.ts";
import type { PeiSender } from "./resendOutbound.ts";

export async function processPeiInvitations(db:any,send:PeiSender,candidateId?:string) {
 let sent=0;
 for(let i=0;i<(candidateId?1:10);i++) {
  const {data:jobs,error}=await db.rpc("claim_candidate_invitation",{target_id:candidateId||null});
  if(error)throw error;
  const job=jobs?.[0];if(!job)break;
  try {
   const {data:c,error:readError}=await db.from("candidates").select("*").eq("id",job.candidate_id).single();
   if(readError)throw readError;
   if(!canContact(c,"email")||c.replied_at||c.manual_status!=="Nuevo"||c.invitation_sent_at||c.email!==job.recipient) {
    const {error:skipError}=await db.from("candidate_invitations").update({state:"skipped",detail:"El perfil cambió antes del envío; revisar."}).eq("candidate_id",job.candidate_id);
    if(skipError)throw skipError;continue;
   }
   if(c.pei_version!=="PEI-1.0"||!c.pei_breakdown)throw Error("Evaluación PEI incompleta");
   const letter=peiEmail(c.first_name,{score:c.score,classification:c.classification,eligible:c.pei_eligible,breakdown:c.pei_breakdown});
   const messageId=await send({to:job.recipient,...letter,idempotencyKey:`pei-initial-v1-${job.candidate_id}`});
   const {error:finishError}=await db.rpc("complete_candidate_invitation",{target_id:job.candidate_id,message_id:messageId});
   if(finishError)throw Error(`Aceptado por Resend (${messageId}); falta registrar. Revisar antes de reintentar.`);
   sent++;
  }catch(e){
   const detail=e instanceof Error?e.message:"Resultado incierto; revisar Resend";
   const {error:saveError}=await db.from("candidate_invitations").update({state:"review",detail}).eq("candidate_id",job.candidate_id).eq("state","sending");
   if(saveError)throw saveError;
   break;
  }
  if(!candidateId)await new Promise(resolve=>setTimeout(resolve,600));
 }
 return {sent,disabled:false};
}

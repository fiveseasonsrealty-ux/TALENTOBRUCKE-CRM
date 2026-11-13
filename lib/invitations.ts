import { supabaseAdmin } from "./supabaseAdmin";
import { processPeiInvitations } from "./peiInvitations.ts";
import { createResendSender } from "./resendOutbound.ts";

export async function processInvitations(candidateId?:string) {
 if(process.env.PEI_OUTBOUND_ENABLED!=="true"||process.env.AUTO_INVITATIONS_ENABLED!=="true")return {disabled:true,sent:0};
 if(!process.env.RESEND_API_KEY)throw Error("Falta RESEND_API_KEY");
 return processPeiInvitations(supabaseAdmin(),createResendSender(process.env.RESEND_API_KEY),candidateId);
}

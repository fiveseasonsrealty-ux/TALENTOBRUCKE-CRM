import { Resend } from "resend";
import { supabaseAdmin } from "./supabaseAdmin";
import { isEligible } from "./crm";
import { invitationLetter } from "./invitationLetter";

export async function processInvitations(candidateId?: string) {
  // Explicit rollout switch: previews and local tests never send real mail.
  if (process.env.AUTO_INVITATIONS_ENABLED !== "true") return { disabled: true, sent: 0 };
  if (!process.env.RESEND_API_KEY) throw new Error("Falta RESEND_API_KEY");
  const db = supabaseAdmin();
  const resend = new Resend(process.env.RESEND_API_KEY);
  let sent = 0;
  for (let i = 0; i < (candidateId ? 1 : 10); i++) {
    const { data: jobs, error } = await db.rpc("claim_candidate_invitation", { target_id: candidateId || null });
    if (error) throw error;
    const job = jobs?.[0];
    if (!job) break;
    try {
      const { data: c, error: readError } = await db.from("candidates").select("*").eq("id", job.candidate_id).single();
      if (readError) throw readError;
      if (!isEligible(c) || !c.consent || c.manual_status !== "Nuevo" || c.invitation_sent_at || c.email !== job.recipient) {
        const { error: skipError } = await db.from("candidate_invitations").update({state: "skipped", detail: "El perfil cambió antes del envío; revisar."}).eq("candidate_id", job.candidate_id);
        if (skipError) throw skipError;
        continue;
      }
      const letter = invitationLetter(c.first_name);
      const response = await resend.emails.send({
        from: "TalentoBrücke <info@talentobruecke.com>",
        replyTo: "info@talentobruecke.com",
        to: [job.recipient], ...letter,
      }, { idempotencyKey: `videoconferencia-v1-${job.candidate_id}` });
      if (response.error || !response.data?.id) throw new Error(response.error?.message || "Respuesta de envío sin identificador");
      const { error: finishError } = await db.rpc("complete_candidate_invitation", {target_id: job.candidate_id, message_id: response.data.id});
      if (finishError) throw new Error(`Envío aceptado (${response.data.id}); falta registrar en CRM. Revisar antes de reintentar.`);
      sent++;
    } catch (e) {
      // Never blindly resend an ambiguous outcome (provider idempotency expires).
      const detail = e instanceof Error ? e.message : "Resultado incierto; revisar en Resend.";
      const { error: saveError } = await db.from("candidate_invitations").update({state: "review", detail}).eq("candidate_id", job.candidate_id).eq("state", "sending");
      if (saveError) throw saveError;
    }
    // Respect provider rate limits within each batch.
    if (!candidateId) await new Promise(resolve => setTimeout(resolve, 600));
  }
  return { sent, disabled: false };
}

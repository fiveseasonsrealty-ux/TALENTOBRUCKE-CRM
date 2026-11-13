import { peiEmail } from "./peiEmail.ts";
import { reminderEmail } from "./reminders.ts";

export const testMailbox = "info@talentobruecke.com";
export const testRecipient = "fiveseasonsrealty@gmail.com";
type Config = { clientId: string; clientSecret: string; refreshToken: string; accountId: string };
export function zohoTestMessages() {
  const initial = peiEmail("Perfil de prueba", { score: 82, classification: "A", eligible: true,
    breakdown: { german: 20, education: 25, experience: 17, specialty: 10, motivation: 10 } });
  return [initial, ...[1, 2, 3].map(step => reminderEmail(step, "Perfil de prueba", testRecipient))]
    .map(message => ({ ...message, subject: "PEI-PRUEBA " + message.subject }));
}

export async function sendZohoTestMessage(config: Config, step: number, request: typeof fetch = fetch) {
  const letter = zohoTestMessages()[step];
  if (!Number.isInteger(step) || step < 0 || step > 3 || !letter) throw new Error("Paso inválido");
  if (!config.clientId || !config.clientSecret || !config.refreshToken || !/^\d+$/.test(config.accountId))
    throw new Error("Falta configurar el acceso de prueba a Zoho");
  const token = await request("https://accounts.zoho.com/oauth/v2/token", {
    method: "POST", redirect: "error", signal: AbortSignal.timeout(15000),
    body: new URLSearchParams({ grant_type: "refresh_token", client_id: config.clientId, client_secret: config.clientSecret, refresh_token: config.refreshToken }),
  });
  const auth = await token.json();
  if (!token.ok || typeof auth?.access_token !== "string" || !auth.access_token) throw new Error("Zoho no autorizó el acceso");
  try {
    const result = await request("https://mail.zoho.com/api/accounts/" + config.accountId + "/messages", {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(15000),
      headers: { Authorization: "Zoho-oauthtoken " + auth.access_token, "Content-Type": "application/json" },
      body: JSON.stringify({ fromAddress: testMailbox, toAddress: testRecipient, subject: letter.subject, content: letter.text, mailFormat: "plaintext" }),
    });
    const body = await result.json();
    if (!result.ok || body?.status?.code !== 200 || typeof body?.data?.messageId !== "string" || !body.data.messageId) throw new Error();
    return { accepted: true, messageId: body.data.messageId };
  } catch {
    throw new Error("Envío no confirmado. Revisa Enviados en Zoho antes de repetir.");
  }
}

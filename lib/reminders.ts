import { canRemind, type ContactCandidate } from "./contact.ts";
export const reminderSteps = [
  {step: 1, hours: 24, channel: "email"},
  {step: 2, hours: 48, channel: "email"},
  {step: 3, hours: 72, channel: "email"},
] as const;
// Preparation only: no scheduler or outbound call is enabled here.
export function reminderPlan(firstConfirmedAt: string, c: ContactCandidate) {
  const start = Date.parse(firstConfirmedAt);
  if (!Number.isFinite(start)) throw new Error("Fecha inicial no válida");
  if (!canRemind(c, "email")) return [];
  return reminderSteps.map(s => ({...s, dueAt: new Date(start + s.hours * 3600000).toISOString()}));
}
export function reminderText(step: number, firstName: string, email: string) {
  const name = firstName || "candidato/a";
  if (step === 1) return "Hola, " + name + ":\n\nHace 24 horas te enviamos la respuesta a tu evaluación al correo que proporcionaste: " + email + ". Si todavía no la has visto, revisa tu bandeja de entrada y también la carpeta de spam o correo no deseado.\n\nPuedes responder a este correo si necesitas ayuda o deseas comentar tus próximos pasos.\n\nPara dejar de recibir comunicaciones, responde BAJA.\nEquipo TalentoBrücke";
  if (step === 2) return "Hola, " + name + ":\n\n¿Pudiste revisar tu evaluación PEI? Responde a este correo si deseas comentar tus próximos pasos con TalentoBrücke.\n\nPara dejar de recibir comunicaciones, responde BAJA.\nEquipo TalentoBrücke";
  if (step === 3) return "Hola, " + name + ":\n\nEste es nuestro último recordatorio sobre tu evaluación con TalentoBrücke. Si deseas continuar, responde a este correo con tu disponibilidad.\n\nPara dejar de recibir comunicaciones, responde BAJA.\nEquipo TalentoBrücke";
  throw new Error("Paso no válido");
}
export function reminderEmail(step: number, firstName: string, email: string) {
  const subjects: Record<number,string> = {
    1: "¿Pudiste revisar tu evaluación de TalentoBrücke?",
    2: "Tu evaluación PEI: próximos pasos",
    3: "Último recordatorio sobre tu evaluación PEI",
  };
  return {subject: subjects[step], text: reminderText(step, firstName, email)};
}

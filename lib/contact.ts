export type ContactCandidate = {
  studies_completed?: boolean | null; score?: number | null; manual_status?: string | null;
  education?: string | null; profile?: string | null; specialty?: string | null;
  pei_version?: string | null; pei_eligible?: boolean | null;
  consent?: boolean | null; email_consent?: boolean | null; whatsapp_consent?: boolean | null;
  replied_at?: string | null; opted_out_at?: string | null;
};
export function isContactEligible(c: ContactCandidate) {
  return c.studies_completed === true && c.manual_status !== "No apto" &&
    ["technical", "technologist", "engineering", "masters"].includes(c.education || "") &&
    ["engineer", "technician", "technical_other"].includes(c.profile || "") &&
    c.specialty !== "nontechnical" && typeof c.score === "number" && c.score >= 50 &&
    (!c.pei_version || c.pei_eligible === true);
}
export function canContact(c: ContactCandidate, channel: "email" | "whatsapp") {
  return c.pei_version === "PEI-1.0" && isContactEligible(c) && c.consent === true && !c.opted_out_at &&
    (channel === "email" ? c.email_consent === true : c.whatsapp_consent === true);
}
export function canRemind(c: ContactCandidate, channel: "email" | "whatsapp") {
  return !c.replied_at && canContact(c, channel);
}

export type LeadInput = Record<string, any>;
export const PEI_VERSION = "PEI-1.0";
export const peiRules = {
  german_level: { none: 0, a1: 5, a2: 10, b1: 20, b2: 30, c1: 35 },
  experience_years: { "0": 0, "<2": 7, "2-4": 12, "5-7": 17, "8+": 20 },
  specialty: { mechanical: 10, electrical: 10, mechatronics: 10, automation: 10,
    industrial_electronics: 10, maintenance: 9, industrial_engineering: 10, it: 8,
    technical_other: 5, nontechnical: 0 },
  germany_interest: { exploring: 0, serious: 4, "12months": 4, asap: 4 },
  learn_german: { yes: 3, maybe: 0, no: 0 },
  mobility: { yes: 3, maybe: 0, no: 0 },
};
const formalEducation = ["technical", "technologist", "engineering", "masters"];
const points = (map: Record<string, number>, key: any) => Object.hasOwn(map, key) ? map[key] : 0;
export function classifyPei(score: number, germanLevel: string) {
  return score >= 75 && ["a1", "a2", "b1", "b2", "c1"].includes(germanLevel)
    ? "A" : score >= 50 ? "B" : "C";
}
export function calculateScore(lead: LeadInput) {
  const completed = lead.studies_completed === true || lead.studies_completed === "yes";
  const eligibleEducation = completed && formalEducation.includes(lead.education);
  const breakdown = {
    german: points(peiRules.german_level, lead.german_level),
    education: eligibleEducation ? 25 : 0,
    experience: points(peiRules.experience_years, lead.experience_years),
    specialty: points(peiRules.specialty, lead.specialty),
    motivation: points(peiRules.germany_interest, lead.germany_interest) +
      points(peiRules.learn_german, lead.learn_german) + points(peiRules.mobility, lead.mobility),
  };
  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const flags: string[] = [];
  const gaps: string[] = [];
  if (!eligibleEducation) flags.push(completed ? "EDUCATION_REVIEW" : "INCOMPLETE_OR_UNKNOWN_STUDIES");
  if (lead.profile === "other") flags.push("NON_TECHNICAL_PROFILE");
  if (!breakdown.german) { flags.push("NO_GERMAN"); gaps.push("GERMAN"); }
  if (lead.learn_german === "no") flags.push("NO_GERMAN_WILLINGNESS");
  if (lead.mobility === "no") flags.push("NO_MOBILITY");
  if (breakdown.experience < 12) gaps.push("EXPERIENCE");
  if (!["Mexico", "Colombia"].includes(lead.country)) flags.push("COUNTRY_OUTSIDE_TARGET");
  if (["45-54", "55+"].includes(lead.age_range)) flags.push("AGE_PATHWAY_REVIEW");
  return { score, classification: classifyPei(score, lead.german_level), breakdown,
    version: PEI_VERSION, flags, gaps,
    eligible: eligibleEducation && lead.specialty !== "nontechnical" && ["engineer", "technician", "technical_other"].includes(lead.profile),
    professionalScore: breakdown.education + breakdown.experience + breakdown.specialty,
    germanyReadiness: breakdown.german + breakdown.motivation,
    horizon: breakdown.german >= 20 && lead.mobility === "yes" ? "SHORT_TERM" : "DEVELOPMENT" };
}
export function validateLead(lead: LeadInput): string | null {
  if (!lead || typeof lead !== "object" || Array.isArray(lead)) return "Formulario no válido";
  if (typeof lead.email_consent !== "boolean") return "Indica tus preferencias de contacto";
  if (lead.phone !== undefined && lead.phone !== "" && (typeof lead.phone !== "string" || !/^\+[1-9]\d{7,14}$/.test(lead.phone))) return "Indica un teléfono válido con código internacional o deja el campo vacío";
  if (lead.consent !== true || typeof lead.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim())) return "Email válido y consentimiento son obligatorios";
  for (const [key, map] of Object.entries(peiRules)) {
    if (typeof lead[key] !== "string" || !Object.hasOwn(map, lead[key])) return `Respuesta no válida: ${key}`;
  }
  if (!["engineer", "technician", "technical_other", "other"].includes(lead.profile) ||
      ![...formalEducation, "incomplete", "unrelated"].includes(lead.education) ||
      !["yes", "no"].includes(lead.studies_completed)) return "Formación o perfil no válido";
  if (lead.education === "incomplete" && lead.studies_completed === "yes") return "Confirma si has concluido tus estudios";
  return null;
}

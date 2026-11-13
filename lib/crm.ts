export const stages = ["Nuevo", "Contactado", "Videoconferencia", "Trámites visado", "Trámite título", "Contacto Alemania"];
export const allowedStatuses = [...stages, "No apto"];
export { isContactEligible as isEligible } from "./contact.ts";
export function displayStatus(c: { studies_completed?: boolean | null; manual_status?: string | null; pei_eligible?: boolean | null }) {
  return c.studies_completed === false || c.pei_eligible === false ? "No apto" : c.manual_status || "Nuevo";
}

// Missing legacy answers stay visible for review, but never authorize contact.
export const activeCandidateFilter = "and(or(studies_completed.is.null,studies_completed.eq.true),manual_status.neq.No apto,or(pei_eligible.is.null,pei_eligible.eq.true),or(education.is.null,and(education.neq.incomplete,education.neq.unrelated)),or(profile.is.null,profile.neq.other),or(specialty.is.null,specialty.neq.nontechnical))";
export const excludedCandidateFilter = "studies_completed.eq.false,manual_status.eq.No apto,pei_eligible.eq.false,education.eq.incomplete,education.eq.unrelated,profile.eq.other,specialty.eq.nontechnical";

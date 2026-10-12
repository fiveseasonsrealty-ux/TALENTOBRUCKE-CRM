export const stages = ["Nuevo", "Contactado", "Videoconferencia", "Trámites visado", "Trámite título", "Contacto Alemania"];
export const allowedStatuses = [...stages, "No apto"];
export function isEligible(c: { studies_completed?: boolean | null; score?: number | null }) {
  return c.studies_completed === true && typeof c.score === "number" && c.score > 50;
}
export function displayStatus(c: { studies_completed?: boolean | null; manual_status?: string | null }) {
  return c.studies_completed === false ? "No apto" : c.manual_status || "Nuevo";
}

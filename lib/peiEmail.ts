type Evaluation = {score: number; classification: string; eligible: boolean; breakdown: Record<string, number>};
export function peiEmail(firstName: string, result: Evaluation) {
  const b = result.breakdown;
  const strengths = [b.education === 25 && "Formación formal concluida", b.experience >= 12 && "Experiencia profesional relacionada", b.specialty >= 8 && "Especialidad técnica", b.german >= 20 && "Base de alemán B1 o superior"].filter(Boolean);
  const improvements = [b.german < 35 && "Seguir fortaleciendo el alemán", b.experience < 12 && "Ampliar la experiencia relacionada", b.motivation < 10 && "Concretar tus objetivos y disponibilidad", !result.eligible && "Revisar la formación concluida y el perfil técnico"].filter(Boolean);
  return {subject: firstName + ", tu evaluación PEI de TalentoBrücke", text:
    "Hola, " + (firstName || "candidato/a") + ":\n\nTu puntuación PEI v1.0 es " + result.score + "/100. Categoría " + result.classification +
    ".\n\nDesglose: alemán " + b.german + "/35; formación " + b.education + "/25; experiencia " + b.experience + "/20; especialidad " + b.specialty + "/10; motivación " + b.motivation + "/10." +
    "\n\nFortalezas: " + (strengths.join("; ") || "Evaluación inicial completada") + ".\n\nAspectos por mejorar: " + (improvements.join("; ") || "Mantener tu preparación y documentación actualizadas") +
    ".\n\nPróximos pasos: " + (result.eligible && result.score >= 50 ? "Responde a este correo indicando tu disponibilidad y zona horaria para revisar tu perfil con el equipo." : "Completa o refuerza los aspectos señalados antes de solicitar una nueva revisión.") +
    "\n\nEsta evaluación es orientativa y no garantiza empleo, visa ni reconocimiento profesional.\n\nPara dejar de recibir comunicaciones, responde BAJA.\nEquipo TalentoBrücke"};
}

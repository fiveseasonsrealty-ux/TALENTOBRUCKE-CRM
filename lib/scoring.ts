export type LeadInput = Record<string, any>;

export function calculateScore(lead: LeadInput) {
  const flags: string[] = [];
  const gaps: string[] = [];

  // =========================================================
  // 1. FORTALEZA PROFESIONAL — máximo 60 puntos
  // =========================================================

  const profile: Record<string, number> = {
    engineer: 15,
    technician: 13,
    technical_other: 8,
    other: 0,
  };

  const education: Record<string, number> = {
    engineering: 15,
    masters: 15,
    technical: 13,
    technologist: 13,
    incomplete: 4,
    unrelated: 0,
  };

  const experience: Record<string, number> = {
    "8+": 15,
    "5-7": 13,
    "2-4": 9,
    "<2": 4,
    "0": 0,
  };

  const specialty: Record<string, number> = {
    mechanical: 15,
    electrical: 15,
    mechatronics: 15,
    automation: 15,
    industrial_electronics: 13,
    maintenance: 13,
    industrial_engineering: 11,
    it: 10,
    technical_other: 6,
    nontechnical: 0,
  };

  const professionalScore =
    (profile[lead.profile] ?? 0) +
    (education[lead.education] ?? 0) +
    (experience[lead.experience_years] ?? 0) +
    (specialty[lead.specialty] ?? 0);

  // =========================================================
  // 2. PREPARACIÓN PARA ALEMANIA — máximo 40 puntos
  // =========================================================

  const german: Record<string, number> = {
    c1: 15,
    b2: 15,
    b1: 12,
    a2: 8,
    a1: 4,
    none: 0,
  };

  const english: Record<string, number> = {
    c1: 7,
    b2: 6,
    b1: 4,
    a1a2: 1,
    none: 0,
  };

  const interest: Record<string, number> = {
    asap: 8,
    "12months": 8,
    serious: 6,
    exploring: 2,
  };

  const willingness: Record<string, number> = {
    yes: 5,
    maybe: 2,
    no: 0,
  };

  const mobility: Record<string, number> = {
    yes: 5,
    maybe: 2,
    no: 0,
  };

  const germanyReadiness =
    (german[lead.german_level] ?? 0) +
    (english[lead.english_level] ?? 0) +
    (interest[lead.germany_interest] ?? 0) +
    (willingness[lead.learn_german] ?? 0) +
    (mobility[lead.mobility] ?? 0);

  const score = professionalScore + germanyReadiness;

  // =========================================================
  // 3. FLAGS / ALERTAS
  // =========================================================

  if (lead.profile === "other") {
    flags.push("NON_TECHNICAL_PROFILE");
  }

  if (
    lead.studies_completed === false ||
    lead.studies_completed === "no"
  ) {
    flags.push("INCOMPLETE_STUDIES");
  }

  if (lead.german_level === "none") {
    flags.push("NO_GERMAN");
    gaps.push("GERMAN");
  }

  if (lead.learn_german === "no") {
    flags.push("NO_GERMAN_WILLINGNESS");
  }

  if (lead.mobility === "no") {
    flags.push("NO_MOBILITY");
  }

  if (!["Mexico", "Colombia"].includes(lead.country)) {
    flags.push("COUNTRY_OUTSIDE_TARGET");
  }

  // La edad no resta puntos.
  // Solo activa una revisión individual de la vía aplicable.
  if (lead.age_range === "45-54") {
    flags.push("AGE_PATHWAY_REVIEW");
  }

  if (lead.age_range === "55+") {
    flags.push("AGE_PATHWAY_REVIEW");
    flags.push("55PLUS_REVIEW");
  }

  // Otras brechas principales
  if (lead.experience_years === "<2" || lead.experience_years === "0") {
    gaps.push("EXPERIENCE");
  }

  // =========================================================
  // 4. CLASIFICACIÓN Y HORIZONTE
  // =========================================================

  let classification = "LOW_PRIORITY";
  let horizon = "DEVELOPMENT";

  const criticalFlag =
    lead.profile === "other" ||
    lead.learn_german === "no" ||
    lead.mobility === "no";

  // PRIORITARIO:
  // exige una base profesional fuerte.
  if (professionalScore >= 50 && !criticalFlag) {
    classification = "HIGH_POTENTIAL";

    // Corto plazo: base profesional fuerte y preparación alta.
    if (
      germanyReadiness >= 30 &&
      ["b1", "b2", "c1"].includes(lead.german_level) &&
      lead.mobility === "yes"
    ) {
      horizon = "SHORT_TERM";
    }

    // Mediano plazo: buen perfil, pero aún debe cerrar
    // una brecha importante como el alemán.
    else if (
      germanyReadiness >= 18 &&
      lead.learn_german === "yes" &&
      lead.mobility === "yes"
    ) {
      horizon = "MEDIUM_TERM";
    }

    // Largo plazo: perfil profesional fuerte,
    // pero preparación todavía insuficiente.
    else {
      horizon = "LONG_TERM";
    }
  }

  // Candidato potencial
  else if (score >= 60 && !criticalFlag) {
    classification = "POTENTIAL_CANDIDATE";
    horizon = "DEVELOPMENT";
  }

  // Lead cualificado
  else if (score >= 45) {
    classification = "QUALIFIED_LEAD";
    horizon = "DEVELOPMENT";
  }

  return {
    score,
    professionalScore,
    germanyReadiness,
    classification,
    horizon,
    gaps,
    flags,
  };
}

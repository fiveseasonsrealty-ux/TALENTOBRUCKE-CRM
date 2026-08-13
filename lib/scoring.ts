export type LeadInput = Record<string, any>;

export function calculateScore(lead: LeadInput) {
  let score = 0;
  const flags: string[] = [];

  const profile: Record<string, number> = {
    engineer: 20, technician: 18, technical_other: 10, other: 0
  };
  score += profile[lead.profile] ?? 0;
  if (lead.profile === "other") flags.push("NonTechnicalProfile");

  const experience: Record<string, number> = {
    "8+": 20, "5-7": 20, "2-4": 15, "<2": 7, "0": 0
  };
  score += experience[lead.experience_years] ?? 0;

  const education: Record<string, number> = {
    engineering: 15, masters: 15, technical: 13, technologist: 13, incomplete: 5, unrelated: 0
  };
  score += education[lead.education] ?? 0;
  if (lead.studies_completed === false || lead.studies_completed === "no") {
    flags.push("IncompleteStudies");
  }

  const specialty: Record<string, number> = {
    mechanical: 15, electrical: 15, mechatronics: 15, automation: 15,
    industrial_electronics: 13, maintenance: 13, industrial_engineering: 10,
    it: 8, technical_other: 5, nontechnical: 0
  };
  score += specialty[lead.specialty] ?? 0;

  const interest: Record<string, number> = {
    asap: 10, "12months": 10, serious: 7, exploring: 3
  };
  score += interest[lead.germany_interest] ?? 0;

  const willingness: Record<string, number> = { yes: 8, maybe: 3, no: 0 };
  score += willingness[lead.learn_german] ?? 0;
  if (lead.learn_german === "no") flags.push("NoGermanWillingness");

  const german: Record<string, number> = { c1: 5, b2: 5, b1: 5, a2: 4, a1: 3, none: 0 };
  score += german[lead.german_level] ?? 0;

  const english: Record<string, number> = { c1: 4, b2: 4, b1: 2, a1a2: 1, none: 0 };
  score += english[lead.english_level] ?? 0;

  const mobility: Record<string, number> = { yes: 3, maybe: 1, no: 0 };
  score += mobility[lead.mobility] ?? 0;
  if (lead.mobility === "no") flags.push("NoMobilityInterest");

  if (!["Mexico", "Colombia"].includes(lead.country)) flags.push("CountryOutsideTarget");

  let classification = "LOW_PRIORITY";
  if (score >= 75) classification = "HIGH_POTENTIAL";
  else if (score >= 60) classification = "QUALIFIED_LEAD";
  else if (score >= 40) classification = "NURTURE_LEAD";

  return { score, classification, flags };
}

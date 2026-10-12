import { after, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { calculateScore } from "../../../lib/scoring";
import { processInvitations } from "../../../lib/invitations";

export async function POST(req: Request) {
  try {
    const lead = await req.json();

    if (!lead.email || !lead.consent) {
      return NextResponse.json({ error: "Email y consentimiento son obligatorios" }, { status: 400 });
    }

   const {
  score,
  professionalScore,
  germanyReadiness,
  classification,
  horizon,
  gaps,
  flags,
 
} = calculateScore(lead);


    const db = supabaseAdmin();

    // Busca duplicado por email.
    const { data: existing, error: lookupError } = await db
      .from("candidates")
      .select("id, first_touch_source, first_touch_campaign, manual_status")
      .eq("email", lead.email.toLowerCase())
      .maybeSingle();

    if (lookupError) throw lookupError;
    const payload = {
      first_name: lead.first_name,
      last_name: lead.last_name,
      country: lead.country,
      age_range: lead.age_range,
      profile: lead.profile,
      specialty: lead.specialty,
      education: lead.education,
      studies_completed: lead.studies_completed === "yes",
      experience_years: lead.experience_years,
      sector: lead.sector,
      employment_status: lead.employment_status,
      experience_summary: lead.experience_summary,
      german_level: lead.german_level,
      english_level: lead.english_level,
      learn_german: lead.learn_german,
      germany_interest: lead.germany_interest,
      mobility: lead.mobility,
      email: lead.email.toLowerCase(),
      phone: lead.phone,
      consent: true,
      consented_at: new Date().toISOString(),
     score,
professional_score: professionalScore,
germany_readiness: germanyReadiness,
classification,
horizon,
gaps,
flags,
...(existing ? {} : { manual_status: "Nuevo" }),
      utm_source: lead.utm_source || null,
      utm_medium: lead.utm_medium || null,
      utm_campaign: lead.utm_campaign || null,
      utm_content: lead.utm_content || null,
      utm_term: lead.utm_term || null,
      campaign_id: lead.campaign_id || null,
      adset_id: lead.adset_id || null,
      ad_id: lead.ad_id || null,
      landing_page: lead.landing_page || "/evaluacion",
      first_touch_source: existing?.first_touch_source || lead.utm_source || null,
      first_touch_campaign: existing?.first_touch_campaign || lead.utm_campaign || null,
      last_touch_source: lead.utm_source || null,
      last_touch_campaign: lead.utm_campaign || null,
      updated_at: new Date().toISOString()
    };

    let result;
    if (existing?.id) {
      result = await db.from("candidates").update(payload).eq("id", existing.id).select("id").single();
      await db.from("activities").insert({
        candidate_id: existing.id,
        activity_type: "FORM_RESUBMITTED",
        description: "Nuevo formulario recibido"
      });
    } else {
      result = await db.from("candidates").insert(payload).select("id").single();
      if (result.data?.id) {
        await db.from("activities").insert({
          candidate_id: result.data.id,
          activity_type: "LEAD_CREATED",
          description: "Candidato creado desde landing"
        });
      }
    }

    if (result.error) throw result.error;

    after(async () => {
      try { await processInvitations(result.data!.id); }
      catch { console.error("Invitación pendiente; revisar panel de invitaciones."); }
    });
    return NextResponse.json({
      ok: true,
      candidate_id: result.data?.id
    });
  } catch (error:any) {
    console.error(error);
    return NextResponse.json({ error: "No se pudo guardar el lead" }, { status: 500 });
  }
}

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import StatusSelector from "./StatusSelector";
import ActivityForm from "./ActivityForm";

export const dynamic = "force-dynamic";

function value(v: any) {
  if (v === null || v === undefined || v === "") return "—";
  if (v === true) return "Sí";
  if (v === false) return "No";
  return String(v);
}

function label(c: string) {
  return (
    {
      HIGH_POTENTIAL: "Candidato prioritario",
      POTENTIAL_CANDIDATE: "Candidato potencial",
      QUALIFIED_LEAD: "Lead cualificado",
      NURTURE_LEAD: "Lead en desarrollo",
      LOW_PRIORITY: "No prioritario",
    } as any
  )[c] || c;
}
function horizonLabel(h: string) {
  return (
    {
      SHORT_TERM: "Corto plazo",
      MEDIUM_TERM: "Mediano plazo",
      LONG_TERM: "Largo plazo",
      DEVELOPMENT: "En desarrollo",
    } as any
  )[h] || h;
}

function gapLabel(g: string) {
  return (
    {
      GERMAN: "Alemán",
    } as any
  )[g] || g;
}

function flagLabel(f: string) {
  return (
    {
      NO_GERMAN: "Sin alemán actualmente",
      AGE_PATHWAY_REVIEW: "Revisar vía aplicable por edad",
      INCOMPLETE_STUDIES: "Estudios incompletos",
      NON_TECHNICAL_PROFILE: "Perfil no técnico",
      NO_GERMAN_WILLINGNESS: "Sin disposición a aprender alemán",
      NO_MOBILITY_INTEREST: "Sin disposición de movilidad",
      COUNTRY_OUTSIDE_TARGET: "País fuera del mercado objetivo",
    } as any
  )[f] || f;
}
function Field({ title, value: fieldValue }: { title: string; value: any }) {
  return (
    <div
      style={{
        padding: "16px",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        background: "#fff",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "#64748b",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}
      >
        {title}
      </div>
      <div style={{ color: "#0A2A52", fontWeight: 600 }}>
        {value(fieldValue)}
      </div>
    </div>
  );
}

export default async function CandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = supabaseAdmin();

  const { data: candidate, error } = await db
    .from("candidates")
    .select("*")
    .eq("id", id)
    .single();
const { data: activities } = await db
  .from("activities")
  .select("*")
  .eq("candidate_id", id)
  .order("created_at", { ascending: false });
  if (error || !candidate) {
    return (
      <main className="container" style={{ paddingTop: "40px" }}>
        <a href="/crm">← VOLVER AL DASHBOARD</a>
        <h1 style={{ color: "#0A2A52" }}>Candidato no encontrado</h1>
        <p>No fue posible cargar la ficha del candidato.</p>
      </main>
    );
  }

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <div className="brand">
            TALENTO<span>BRÜCKE</span> CRM
          </div>
          <a className="btn secondary" href="/crm">
            VOLVER AL DASHBOARD
          </a>
        </div>
      </header>

      <main className="container" style={{ paddingTop: "32px", paddingBottom: "60px" }}>
        <div style={{ marginBottom: "28px" }}>
          <a
            href="/crm"
            style={{
              color: "#0A2A52",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            ← Volver a candidatos
          </a>

          <h1
            style={{
              color: "#0A2A52",
              marginBottom: "6px",
              marginTop: "20px",
            }}
          >
            {candidate.first_name} {candidate.last_name}
          </h1>

          <div style={{ color: "#64748b" }}>
            {value(candidate.email)} · {value(candidate.phone)}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
            marginBottom: "32px",
          }}
        >
          <Field title="Score" value={candidate.score} />
          <Field title="Clasificación" value={label(candidate.classification)} />
          <Field title="País" value={candidate.country} />
          <Field title="Edad" value={candidate.age_range} />
        </div>

        <h2 style={{ color: "#0A2A52", marginTop: "34px" }}>
          Perfil profesional
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
          }}
        >
          <Field title="Perfil" value={candidate.profile} />
          <Field title="Especialidad" value={candidate.specialty} />
          <Field title="Formación" value={candidate.education} />
          <Field title="Estudios terminados" value={candidate.studies_completed} />
          <Field title="Experiencia" value={candidate.experience_years} />
          <Field title="Sector" value={candidate.sector} />
          <Field title="Situación laboral" value={candidate.employment_status} />
        </div>

        <h2 style={{ color: "#0A2A52", marginTop: "34px" }}>
          Experiencia profesional
        </h2>

        <div
          style={{
            padding: "18px",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            background: "#fff",
            color: "#0A2A52",
            whiteSpace: "pre-wrap",
          }}
        >
          {value(candidate.experience_summary)}
        </div>

        <h2 style={{ color: "#0A2A52", marginTop: "34px" }}>
          Idiomas y preparación
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
          }}
        >
          <Field title="Nivel de alemán" value={candidate.german_level} />
          <Field title="Nivel de inglés" value={candidate.english_level} />
          <Field title="Dispuesto a aprender alemán" value={candidate.learn_german} />
          <Field title="Interés en Alemania" value={candidate.germany_interest} />
          <Field title="Movilidad" value={candidate.mobility} />
        </div>

        <h2 style={{ color: "#0A2A52", marginTop: "34px" }}>
          Captación
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
          }}
        >
          <Field title="Campaña" value={candidate.utm_campaign} />
          <Field title="Anuncio" value={candidate.utm_content || candidate.ad_id} />
          <Field title="Fuente" value={candidate.utm_source} />
          <Field title="Medio" value={candidate.utm_medium} />
          <div>
  <StatusSelector candidateId={candidate.id} currentStatus={candidate.manual_status || "Nuevo"} />
</div>
        </div>

        <h2 style={{ color: "#0A2A52", marginTop: "34px" }}>
          Evaluación
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
          }}
        >
          <Field title="Score total" value={candidate.score} />

<Field
  title="Fortaleza profesional"
  value={
    candidate.professional_score !== null &&
    candidate.professional_score !== undefined
      ? `${candidate.professional_score}/60`
      : "Pendiente de recalcular"
  }
/>

<Field
  title="Preparación Alemania"
  value={
    candidate.germany_readiness !== null &&
    candidate.germany_readiness !== undefined
      ? `${candidate.germany_readiness}/40`
      : "Pendiente de recalcular"
  }
/>

<Field
  title="Clasificación"
  value={label(candidate.classification)}
/>

<Field
  title="Horizonte"
  value={
    candidate.horizon
      ? horizonLabel(candidate.horizon)
      : "Pendiente de recalcular"
  }
/>

<Field
  title="Brechas"
  value={
    Array.isArray(candidate.gaps) && candidate.gaps.length
      ? candidate.gaps.map(gapLabel).join(", ")
      : candidate.gaps
        ? value(candidate.gaps)
        : "Sin brechas registradas"
  }
/>

<Field
  title="Alertas / revisión"
  value={
    Array.isArray(candidate.flags) && candidate.flags.length
      ? candidate.flags.map(flagLabel).join(", ")
      : "Sin alertas"
  }
/>
        </div>
       <h2 style={{ color:"#0A2A52", marginTop:"34px" }}>
  Seguimiento del candidato
</h2>

<p style={{ color:"#64748b", marginBottom:"18px" }}>
  Registra contactos, conversaciones, acuerdos y próximas acciones.
</p>

<ActivityForm candidateId={candidate.id} /> 
      <h2 style={{ color:"#0A2A52", marginTop:"34px" }}>
  Historial del candidato
</h2>

<div style={{ display:"grid", gap:"12px", marginTop:"16px" }}>
  {(activities || []).map((activity:any) => (
    <div
      key={activity.id}
      style={{
        padding:"18px",
        border:"1px solid #e5e7eb",
        borderRadius:"10px",
        background:"#fff"
      }}
    >
      <div style={{ fontWeight:700, color:"#0A2A52", marginBottom:"6px" }}>
        {activity.activity_type} ·{" "}
        {new Date(activity.created_at).toLocaleString("es-MX", {
          timeZone:"America/Cancun",
          day:"2-digit",
          month:"2-digit",
          year:"numeric",
          hour:"2-digit",
          minute:"2-digit"
        })}
      </div>

      <div style={{ marginBottom:"8px" }}>
        {activity.description || "Sin descripción"}
      </div>

      {activity.result && (
        <div style={{ marginBottom:"6px" }}>
          <strong>Resultado / acuerdos:</strong> {activity.result}
        </div>
      )}

      {activity.next_action && (
        <div style={{ marginBottom:"6px" }}>
          <strong>Próxima acción:</strong> {activity.next_action}
        </div>
      )}
{activity.responsible && (
  <div style={{ marginBottom:"6px" }}>
    <strong>Responsable:</strong> {activity.responsible}
  </div>
)}
      {activity.follow_up_at && (
        <div>
          <strong>Próximo seguimiento:</strong>{" "}
          {new Date(activity.follow_up_at).toLocaleString("es-MX", {
            timeZone:"America/Cancun",
            day:"2-digit",
            month:"2-digit",
            year:"numeric",
            hour:"2-digit",
            minute:"2-digit"
          })}
        </div>
      )}
    </div>
  ))}

  {!activities?.length && (
    <div style={{ color:"#64748b" }}>
      Todavía no hay actividades registradas para este candidato.
    </div>
  )}
</div>  
      </main>
      
    </>
  );
}

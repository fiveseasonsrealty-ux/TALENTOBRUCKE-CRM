import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

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

  if (error || !candidate) {
    return (
      <main className="container" style={{ paddingTop: "40px" }}>
        <a href="/crm">← Volver al CRM</a>
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
            VOLVER AL CRM
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
          <Field title="Estado CRM" value={candidate.manual_status} />
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
          <Field title="Score" value={candidate.score} />
          <Field title="Clasificación" value={label(candidate.classification)} />
          <Field
            title="Flags"
            value={
              Array.isArray(candidate.flags) && candidate.flags.length
                ? candidate.flags.join(", ")
                : "Sin alertas"
            }
          />
        </div>
      </main>
    </>
  );
}

import { activeCandidateFilter, excludedCandidateFilter } from "../../lib/crm";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function CRMDashboard() {
  const db = supabaseAdmin();

  const [candidateResult, registeredResult, activeResult, excludedResult] = await Promise.all([
    db
    .from("candidates")
    .select("*")
    .or(activeCandidateFilter)
    .order("created_at", { ascending: false })
    .limit(500),
    db.from("candidates").select("id", { count: "exact", head: true }),
    db.from("candidates").select("id", { count: "exact", head: true }).or(activeCandidateFilter),
    db.from("candidates").select("id", { count: "exact", head: true }).or(excludedCandidateFilter),
  ]);

  const { data: candidates } = candidateResult;
  const error = candidateResult.error || registeredResult.error || activeResult.error || excludedResult.error;

  if (error) {
    return (
      <main className="container crm-head">
        <h1>Error cargando CRM</h1>
        <p>{error.message}</p>
      </main>
    );
  }

  const rows = candidates || [];

  const total = rows.length;

  const newCandidates = rows.filter(
    (x: any) => !x.manual_status || x.manual_status === "Nuevo"
  ).length;

  const averageScore = total
    ? Math.round(
        rows.reduce(
          (sum: number, candidate: any) => sum + (candidate.score || 0),
          0
        ) / total
      )
    : 0;

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "22px",
  };

  const linkCardStyle = {
    ...cardStyle,
    display: "block",
    textDecoration: "none",
    color: "#0A2A52",
    minHeight: "150px",
  };

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <div className="brand">
            TALENTO<span>BRÜCKE</span> CRM
          </div>

          <a
            className="btn secondary"
            href="/evaluacion"
            target="_blank"
          >
            VER LANDING
          </a>
        </div>
      </header>

      <main
        className="container"
        style={{
          paddingTop: "34px",
          paddingBottom: "60px",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <div
            style={{
              color: "#64748b",
              fontSize: "13px",
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            TalentoBrücke CRM
          </div>

          <h1
            style={{
              color: "#0A2A52",
              margin: 0,
              marginBottom: "8px",
            }}
          >
            Dashboard
          </h1>

          <p
            style={{
              color: "#64748b",
              margin: 0,
            }}
          >
            Gestión y seguimiento de candidatos.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "14px",
            marginBottom: "38px",
          }}
        >
          {[
            { label: "Total candidatos", count: registeredResult.count ?? 0 },
            { label: "Nuevos", count: newCandidates },
            { label: "Potenciales (aptos)", count: activeResult.count ?? 0 },
            { label: "No aptos", count: excludedResult.count ?? 0 },
            { label: "Score promedio", count: averageScore },
          ].map(({ label, count }) => (
            <div key={label} style={cardStyle}>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                {label}
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "#0A2A52", marginTop: "8px" }}>
                {count}
              </div>
            </div>
          ))}
        </div>

        <h2
          style={{
            color: "#0A2A52",
            marginBottom: "18px",
          }}
        >
          Gestión
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          <a href="/crm/candidatos" style={linkCardStyle}>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 800,
                marginBottom: "8px",
              }}
            >
              Candidatos
            </div>

            <div
              style={{
                color: "#64748b",
                lineHeight: 1.5,
              }}
            >
              Consulta la base completa, puntuación,
              clasificación y ficha de cada candidato.
            </div>

            <div
              style={{
                marginTop: "18px",
                fontWeight: 800,
                color: "#D9A514",
              }}
            >
              ABRIR CANDIDATOS →
            </div>
          </a>

          <a href="/crm/embudo" style={linkCardStyle}>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 800,
                marginBottom: "8px",
              }}
            >
              Embudo
            </div>

            <div
              style={{
                color: "#64748b",
                lineHeight: 1.5,
              }}
            >
              Visualiza en qué etapa se encuentra cada
              candidato y gestiona el avance del proceso.
            </div>

            <div
              style={{
                marginTop: "18px",
                fontWeight: 800,
                color: "#D9A514",
              }}
            >
              ABRIR EMBUDO →
            </div>
          </a>

           <a href="/crm/agenda" style={linkCardStyle}>
  <div
    style={{
      fontSize: "20px",
      fontWeight: 800,
      marginBottom: "8px",
    }}
  >
    Agenda
  </div>

  <div
    style={{
      color: "#64748b",
      lineHeight: 1.5,
    }}
  >
    Gestiona seguimientos, próximas acciones y tareas
    pendientes con candidatos.
  </div>

  <div
    style={{
      marginTop: "18px",
      fontWeight: 800,
      color: "#D9A514",
    }}
  >
    ABRIR AGENDA →
  </div>
</a>
 </div>
 </main>
 </>
 );
}

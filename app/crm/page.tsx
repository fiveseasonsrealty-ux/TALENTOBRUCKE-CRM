import { supabaseAdmin } from "../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function CRMDashboard() {
  const db = supabaseAdmin();

  const { data: candidates, error } = await db
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

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

  const review = rows.filter(
    (x: any) => x.manual_status === "Por revisar"
  ).length;

  const contact = rows.filter(
    (x: any) => x.manual_status === "Contactar"
  ).length;

  const potential = rows.filter(
    (x: any) =>
      x.classification === "HIGH_POTENTIAL" ||
      x.classification === "POTENTIAL_CANDIDATE"
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
          <div style={cardStyle}>
            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Total candidatos
            </div>

            <div
              style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#0A2A52",
                marginTop: "8px",
              }}
            >
              {total}
            </div>
          </div>

          <div style={cardStyle}>
            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Nuevos
            </div>

            <div
              style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#0A2A52",
                marginTop: "8px",
              }}
            >
              {newCandidates}
            </div>
          </div>

          <div style={cardStyle}>
            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Por revisar
            </div>

            <div
              style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#0A2A52",
                marginTop: "8px",
              }}
            >
              {review}
            </div>
          </div>

          <div style={cardStyle}>
            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Contactar
            </div>

            <div
              style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#0A2A52",
                marginTop: "8px",
              }}
            >
              {contact}
            </div>
          </div>

          <div style={cardStyle}>
            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Potenciales
            </div>

            <div
              style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#0A2A52",
                marginTop: "8px",
              }}
            >
              {potential}
            </div>
          </div>

          <div style={cardStyle}>
            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Score promedio
            </div>

            <div
              style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#0A2A52",
                marginTop: "8px",
              }}
            >
              {averageScore}
            </div>
          </div>
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

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function badge(c: string) {
  if (c === "HIGH_POTENTIAL") return "badge high";
  if (c === "POTENTIAL_CANDIDATE") return "badge qualified";
  if (c === "QUALIFIED_LEAD") return "badge qualified";
  if (c === "NURTURE_LEAD") return "badge nurture";
  return "badge low";
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

export default async function CandidatesPage() {
  const db = supabaseAdmin();

  const { data: candidates, error } = await db
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <main className="container crm-head">
        <h1>Error cargando candidatos</h1>
        <p>{error.message}</p>
      </main>
    );
  }

  const rows = candidates || [];

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

      <main className="container">
        <div className="crm-head">
          <h1 style={{ color: "#0A2A52" }}>Candidatos</h1>
          <p>Base completa de candidatos captados por TalentoBrücke.</p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <a className="btn secondary" href="/crm/embudo">
            VER EMBUDO
          </a>
          <a className="btn secondary" href="/crm">
            DASHBOARD
          </a>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>País</th>
                <th>Perfil</th>
                <th>Especialidad</th>
                <th>Experiencia</th>
                <th>Alemán</th>
                <th>Score</th>
                <th>Clasificación</th>
                <th>Estado CRM</th>
                <th>Campaña</th>
                <th>Anuncio</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((x: any) => (
                <tr key={x.id}>
                  <td>
                    <a
                      href={`/crm/candidato/${x.id}`}
                      style={{
                        color: "#0A2A52",
                        textDecoration: "none",
                        fontWeight: 700,
                      }}
                    >
{x.first_name} {x.last_name}
</a>

<span
  style={{
    marginLeft: "10px",
    fontSize: "12px",
    color: "#64748b",
    whiteSpace: "nowrap",
  }}
>
  {x.created_at
    ? new Date(x.created_at).toLocaleDateString("es-MX", {
        timeZone: "America/Cancun",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—"}
</span>

<br />
<small>{x.email}</small>
                  </td>

                  <td>{x.country}</td>
                  <td>{x.profile}</td>
                  <td>{x.specialty}</td>
                  <td>{x.experience_years}</td>
                  <td>{x.german_level}</td>
                  <td>
                    <strong>{x.score}</strong>
                  </td>

                  <td>
                    <span className={badge(x.classification)}>
                      {label(x.classification)}
                    </span>
                  </td>

                  <td>{x.manual_status || "Nuevo"}</td>
                  <td>{x.utm_campaign || "—"}</td>
                  <td>{x.utm_content || x.ad_id || "—"}</td>

                  <td style={{ whiteSpace: "nowrap" }}>
                    <div>
                      {new Date(x.created_at).toLocaleDateString("es-MX", {
                        timeZone: "America/Cancun",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>

                    <div style={{ fontSize: "13px", marginTop: "3px" }}>
                      {new Date(x.created_at).toLocaleTimeString("es-MX", {
                        timeZone: "America/Cancun",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                </tr>
              ))}

              {!rows.length && (
                <tr>
                  <td colSpan={12}>
                    Todavía no hay candidatos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

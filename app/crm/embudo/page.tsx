import ScrollableBoard from "./ScrollableBoard";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

import { stages } from "../../../lib/crm";

function classificationLabel(c: string) {
  return (
    {
      HIGH_POTENTIAL: "Prioritario",
      POTENTIAL_CANDIDATE: "Potencial",
      QUALIFIED_LEAD: "Cualificado",
      NURTURE_LEAD: "En desarrollo",
      LOW_PRIORITY: "No prioritario",
    } as any
  )[c] || c;
}

export default async function EmbudoPage() {
  const db = supabaseAdmin();

  const { data: candidates, error } = await db
    .from("candidates")
    .select("*")
    .or("studies_completed.is.null,studies_completed.eq.true")
    .neq("manual_status", "No apto")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <main className="container crm-head">
        <h1>Error cargando embudo</h1>
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

      <main
        className="container"
        style={{ paddingTop: "30px", paddingBottom: "60px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "20px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ color: "#0A2A52", marginBottom: "6px" }}>
              Embudo de candidatos
            </h1>

            <p style={{ margin: 0 }}>
              Seguimiento del proceso de cada candidato. <a href="/crm/candidatos">Revisar listado completo</a>
              {rows.some((c: any) => !stages.includes(c.manual_status || "Nuevo")) && <strong> Hay expedientes con estados anteriores: asígnales una nueva etapa desde el listado. Se conservan y no reciben invitaciones automáticas.</strong>}
            </p>
          </div>

        </div>

        <ScrollableBoard>
          {stages.map((key) => {
            const stage = {key, label: key};
            const stageCandidates = rows.filter(
              (candidate: any) =>
                (candidate.manual_status || "Nuevo") === stage.key
            );

            return (
              <div
                key={stage.key}
                style={{
                  minWidth: "280px",
                  width: "280px",
                  background: "#f1f5f9",
                  borderRadius: "12px",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px",
                  }}
                >
                  <strong style={{ color: "#0A2A52" }}>
                    {stage.label}
                  </strong>

                  <span
                    style={{
                      background: "#fff",
                      borderRadius: "20px",
                      padding: "3px 9px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#0A2A52",
                    }}
                  >
                    {stageCandidates.length}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {stageCandidates.map((candidate: any) => (
                    <a
                      key={candidate.id}
                      href={`/crm/candidato/${candidate.id}`}
                      style={{
                        display: "block",
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                        padding: "14px",
                        textDecoration: "none",
                        color: "#0A2A52",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 800,
                          marginBottom: "8px",
                        }}
                      >
                        {candidate.first_name} {candidate.last_name}
                      </div>

                      <div
                        style={{
                          fontSize: "13px",
                          color: "#64748b",
                          marginBottom: "8px",
                        }}
                      >
                        {candidate.specialty || candidate.profile || "—"}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          {classificationLabel(candidate.classification)}
                        </span>

                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 800,
                          }}
                        >
                          Score {candidate.score ?? "—"}
                        </span>
                      </div>
                    </a>
                  ))}

                  {!stageCandidates.length && (
                    <div
                      style={{
                        padding: "18px 10px",
                        textAlign: "center",
                        fontSize: "13px",
                        color: "#94a3b8",
                      }}
                    >
                      Sin candidatos
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </ScrollableBoard>
      </main>
    </>
  );
}

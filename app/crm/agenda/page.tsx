import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const db = supabaseAdmin();

  const { data: activities, error } = await db
    .from("activities")
    .select(`
      id,
      candidate_id,
      activity_type,
      next_action,
      follow_up_at,
      responsible,
      channel,
      candidates (
        first_name,
        last_name
      )
    `)
    .not("follow_up_at", "is", null)
    .order("follow_up_at", { ascending: true })
    .limit(500);

  if (error) {
    return (
      <main className="container crm-head">
        <h1>Error cargando agenda</h1>
        <p>{error.message}</p>
      </main>
    );
  }

  const rows = activities || [];

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

      <main
        className="container"
        style={{ paddingTop: "30px", paddingBottom: "60px" }}
      >
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ color: "#0A2A52", marginBottom: "6px" }}>
            Agenda
          </h1>

          <p style={{ margin: 0, color: "#64748b" }}>
            Próximos seguimientos y acciones pendientes con candidatos.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gap: "12px",
          }}
        >
          {rows.map((activity: any) => {
            const candidate = activity.candidates;

            return (
              <a
                key={activity.id}
                href={`/crm/candidato/${activity.candidate_id}`}
                style={{
                  display: "block",
                  padding: "18px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  background: "#fff",
                  textDecoration: "none",
                  color: "#0A2A52",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "17px",
                    marginBottom: "8px",
                  }}
                >
                  {candidate
                    ? `${candidate.first_name || ""} ${
                        candidate.last_name || ""
                      }`.trim()
                    : "Candidato"}
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <strong>Fecha:</strong>{" "}
                  {new Date(activity.follow_up_at).toLocaleString("es-MX", {
                    timeZone: "America/Cancun",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <strong>Próxima acción:</strong>{" "}
                  {activity.next_action || "Sin acción especificada"}
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <strong>Responsable:</strong>{" "}
                  {activity.responsible || "Sin asignar"}
                </div>

                <div>
                  <strong>Canal:</strong>{" "}
                  {activity.channel || activity.activity_type || "—"}
                </div>
              </a>
            );
          })}

          {!rows.length && (
            <div
              style={{
                padding: "30px",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                background: "#fff",
                color: "#64748b",
                textAlign: "center",
              }}
            >
              No hay seguimientos programados.
            </div>
          )}
        </div>
      </main>
    </>
  );
}

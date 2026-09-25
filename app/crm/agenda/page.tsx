import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import AgendaClient from "./AgendaClient";
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
      follow_up_status,
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
           VOLVER AL DASHBOARD
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

       
         <AgendaClient activities={rows as any} />
          </main>
    </>
  );
}

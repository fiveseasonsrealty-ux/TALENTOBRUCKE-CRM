import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import ProcessButton from "./ProcessButton";
export const dynamic = "force-dynamic";
const labels: Record<string,string> = {pending: "Pendiente", sending: "En proceso · revisar si persiste", sent: "Enviada", review: "Requiere revisión", skipped: "Omitida · perfil modificado"};
export default async function InvitationsPage() {
  const {data, error} = await supabaseAdmin().from("candidate_invitations")
    .select("*, candidates(first_name,last_name,email)").order("created_at", {ascending:false}).limit(500);
  return <main className="container crm-head"><h1>Invitaciones a videoconferencia</h1>
    <a href="/crm/candidatos">Volver a candidatos</a>
    <p>Solo perfiles con estudios terminados, score mayor de 50, consentimiento y estado Nuevo. Los contactados quedan excluidos.</p>
    <p>Las respuestas llegan a info@talentobruecke.com. «Enviada» significa aceptada por el proveedor; no confirma lectura ni entrega en la bandeja del candidato.</p>
    {error ? <p>No se pudo cargar la cola. Comprueba que se aplicó la migración de invitaciones.</p> : <>
      <ProcessButton />
      <p>Si un envío requiere revisión, verifica su resultado en Resend antes de reintentarlo para evitar duplicados.</p>
      <div className="table-wrap"><table><thead><tr><th>Candidato</th><th>Estado</th><th>Fecha de envío</th><th>Detalle</th></tr></thead>
        <tbody>{data?.map(q => <tr key={q.candidate_id}>
          <td><a href={`/crm/candidato/${q.candidate_id}`}>{q.candidates?.first_name} {q.candidates?.last_name}</a></td>
          <td>{labels[q.state] || q.state}</td><td>{q.sent_at ? new Date(q.sent_at).toLocaleString("es-MX",{timeZone:"America/Cancun"}) : "—"}</td><td>{q.detail || "—"}</td>
        </tr>)}</tbody></table></div></>}
    </main>;
}

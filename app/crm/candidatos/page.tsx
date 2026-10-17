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

function normalize(text: string | null | undefined) {
  return (text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function countryKey(country: string | null) {
  const value = normalize(country);
  if (["mexico", "mx", "mex"].includes(value)) return "Mexico";
  if (["colombia", "co", "col"].includes(value)) return "Colombia";
  return "Otro";
}

function countryLabel(country: string | null) {
  const key = countryKey(country);
  return key === "Mexico" ? "México" : key === "Colombia" ? "Colombia" : country || "Sin país registrado";
}

type SearchParams = { view?: string; country?: string; q?: string; page?: string };
type CandidateIndex = { id: string; first_name: string | null; last_name: string | null; country: string | null };

export default async function CandidatesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const archived = params.view === "no-aptos";
  const country = ["Mexico", "Colombia", "Otro"].includes(params.country || "") ? params.country! : "";
  const search = (params.q || "").trim().slice(0, 120);
  const tokens = normalize(search).split(/\s+/).filter(Boolean);
  const db = supabaseAdmin();

  // Search all records, including beyond the old 500-row limit. Keep this index
  // on the server and retrieve full details only for the visible page.
  const index: CandidateIndex[] = [];
  let error: { message: string } | null = null;
  for (let offset = 0; ; offset += 500) {
    let query = db.from("candidates").select("id, first_name, last_name, country");
    query = archived
      ? query.or("studies_completed.eq.false,manual_status.eq.No apto")
      : query.or("studies_completed.is.null,studies_completed.eq.true").neq("manual_status", "No apto");
    const result = await query.order("created_at", { ascending: false }).order("id", {ascending: false}).range(offset, offset + 499);
    if (result.error) { error = result.error; break; }
    index.push(...(result.data || []));
    if ((result.data?.length || 0) < 500) break;
  }
  const matches = index.filter(c => {
    const name = normalize(`${c.first_name || ""} ${c.last_name || ""}`);
    return (!country || countryKey(c.country) === country) && tokens.every(token => name.includes(token));
  });
  const pageSize = 50;
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  const requestedPage = Number(params.page);
  const page = Math.min(pages, Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1);
  const ids = matches.slice((page - 1) * pageSize, page * pageSize).map(c => c.id);
  let rows: any[] = [];
  if (!error && ids.length) {
    const result = await db.from("candidates").select("*").in("id", ids);
    error = result.error;
    const byId = new Map((result.data || []).map(c => [c.id, c]));
    rows = ids.map(id => byId.get(id)).filter(Boolean);
  }
  if (error) return <main className="container crm-head"><h1>Error cargando candidatos</h1><p>No se pudo cargar la lista. Intenta recargar la página.</p></main>;

  function listUrl(nextPage: number, nextArchived = archived, clear = false) {
    const query = new URLSearchParams();
    if (nextArchived) query.set("view", "no-aptos");
    if (!clear && country) query.set("country", country);
    if (!clear && search) query.set("q", search);
    if (nextPage > 1) query.set("page", String(nextPage));
    return `/crm/candidatos${query.size ? `?${query}` : ""}`;
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

      <main className="container">
        <div className="crm-head">
          <h1 style={{ color: "#0A2A52" }}>{archived ? "No aptos · Expedientes conservados" : "Candidatos"}</h1>
          <p>Los expedientes con estudios incompletos se conservan en No aptos.</p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <a className="btn secondary" href={listUrl(1, !archived)}>{archived ? "VER CANDIDATOS" : "VER NO APTOS"}</a>
          <a className="btn secondary" href="/crm/invitaciones">INVITACIONES</a>
          <a className="btn secondary" href="/crm/embudo">
            VER EMBUDO
          </a>
          <a className="btn secondary" href="/crm">
            DASHBOARD
          </a>
        </div>

        <form action="/crm/candidatos" method="get" style={{ display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap", padding: "20px", background: "#f1f5f9", borderRadius: "12px", marginBottom: "20px" }}>
          {archived && <input type="hidden" name="view" value="no-aptos" />}
          <div style={{ flex: "1 1 260px" }}>
            <label htmlFor="candidate-search" style={{display:"block", fontWeight:700, marginBottom:6}}>Buscar por nombre o apellido</label>
            <input id="candidate-search" name="q" type="search" defaultValue={search} key={`q-${search}`} maxLength={120}
              placeholder="Ej.: José Martínez" style={{width:"100%", padding:12, border:"1px solid #94a3b8", borderRadius:8}} />
          </div>
          <div>
            <label htmlFor="candidate-country" style={{display:"block", fontWeight:700, marginBottom:6}}>País de residencia</label>
            <select id="candidate-country" name="country" defaultValue={country} key={`country-${country}`} style={{padding:12, border:"1px solid #94a3b8", borderRadius:8, minWidth:180}}>
              <option value="">Todos los países</option>
              <option value="Mexico">México</option>
              <option value="Colombia">Colombia</option>
              <option value="Otro">Otros / Sin país</option>
            </select>
          </div>
          <button className="btn" type="submit">BUSCAR</button>
          <a className="btn secondary" href={listUrl(1, archived, true)}>LIMPIAR</a>
        </form>
        <p>{matches.length} {matches.length === 1 ? "candidato encontrado" : "candidatos encontrados"}{country ? ` · ${country === "Mexico" ? "México" : country === "Otro" ? "Otros / Sin país" : country}` : ""}{archived ? " · No aptos" : ""}.</p>

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

                  <td>{countryLabel(x.country)}</td>
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

                  <td>{x.studies_completed === false ? "No apto" : x.manual_status || "Nuevo"}</td>
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
                    No hay candidatos que coincidan con esta búsqueda en esta lista. Prueba otro nombre, cambia el país o consulta la lista de No aptos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && <nav aria-label="Páginas de candidatos" style={{display:"flex", gap:16, alignItems:"center", flexWrap:"wrap", margin:"24px 0"}}>
          {page > 1 && <a className="btn secondary" href={listUrl(page - 1)}>ANTERIOR</a>}
          <span>Página {page} de {pages} · Hasta 50 candidatos por página</span>
          {page < pages && <a className="btn secondary" href={listUrl(page + 1)}>SIGUIENTE</a>}
        </nav>}
      </main>
    </>
  );
}

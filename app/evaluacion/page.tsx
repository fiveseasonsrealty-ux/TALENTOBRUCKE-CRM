"use client";

import { useMemo, useState } from "react";

const empty = {
  first_name:"", last_name:"", country:"Mexico", age_range:"25-34",
  profile:"engineer", specialty:"mechanical", education:"engineering",
  studies_completed:"yes", experience_years:"2-4", sector:"",
  employment_status:"employed", experience_summary:"",
  german_level:"none", english_level:"none", learn_german:"yes",
  germany_interest:"serious", mobility:"yes", email:"", phone:"", consent:false
};

function params() {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source:p.get("utm_source") || "",
    utm_medium:p.get("utm_medium") || "",
    utm_campaign:p.get("utm_campaign") || "",
    utm_content:p.get("utm_content") || "",
    utm_term:p.get("utm_term") || "",
    campaign_id:p.get("campaign_id") || "",
    adset_id:p.get("adset_id") || "",
    ad_id:p.get("ad_id") || ""
  };
}

export default function EvaluationPage() {
  const [step,setStep] = useState(1);
  const [data,setData] = useState<any>(empty);
  const [status,setStatus] = useState<"idle"|"sending"|"done"|"error">("idle");
  const tracking = useMemo(() => params(), []);

  const set = (name:string, value:any) => setData((d:any)=>({...d,[name]:value}));

  async function submit() {
    setStatus("sending");
    const res = await fetch("/api/leads", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
  ...data,
  phone:
    data.country === "Mexico"
      ? `+52${data.phone}`
      : data.country === "Colombia"
      ? `+57${data.phone}`
      : data.phone,
  ...tracking,
  landing_page: window.location.pathname
})
    });
    setStatus(res.ok ? "done" : "error");
  }

  if (status === "done") {
    return (
      <main className="section">
        <div className="container">
          <div className="form-shell">
            <h1 style={{color:"#0A2A52"}}>¡Gracias! Hemos recibido tu evaluación.</h1>
            <p className="lead">Tu información ha sido registrada correctamente.</p>
            <p>Si consideramos que tu perfil puede avanzar a una siguiente etapa, podremos contactarte mediante los datos proporcionados.</p>
            <p className="notice">Esta evaluación es orientativa y no constituye una oferta de empleo ni garantiza contratación, reconocimiento profesional, visa o residencia en Alemania.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <div className="brand">TALENTO<span>BRÜCKE</span></div>
          <a className="btn" href="#formulario">EVALÚA TU PERFIL</a>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>¿Tu perfil profesional tiene potencial en <span className="gold">Alemania</span>?</h1>
            <p className="lead">Si eres ingeniero o técnico especializado, completa nuestra evaluación inicial para ayudarnos a conocer tu formación, experiencia, idiomas y objetivos.</p>
            <a className="btn" href="#formulario">EVALUAR MI PERFIL →</a>
            <div className="trust">
              <span className="pill">✓ Evaluación inicial</span>
              <span className="pill">✓ Proceso transparente</span>
              <span className="pill">✓ Ingenieros y técnicos</span>
            </div>
            <p className="notice">Completar esta evaluación no constituye una oferta de empleo ni garantiza contratación, reconocimiento profesional, visa o residencia.</p>
          </div>
          <div className="hero-card">
            <div><strong>Primero conocemos tu perfil.</strong><p>Después determinamos cuáles podrían ser los siguientes pasos.</p></div>
          </div>
        </div>
      </section>

      <section className="section white">
        <div className="container">
          <h2>¿Cómo funciona la evaluación?</h2>
          <div className="cards">
            {[
              ["1","Completa tu evaluación","Cuéntanos brevemente sobre tu perfil profesional."],
              ["2","Analizamos la información","Revisamos formación, experiencia, especialidad e idiomas."],
              ["3","Identificamos perfiles","Priorizamos los perfiles que encajan con nuestros criterios actuales."],
              ["4","Siguiente paso","Si tu perfil puede avanzar, podremos ponernos en contacto contigo."]
            ].map(x=><div className="card" key={x[0]}><div className="number">{x[0]}</div><h3>{x[1]}</h3><p>{x[2]}</p></div>)}
          </div>
        </div>
      </section>

      <section id="formulario" className="section">
        <div className="container">
          <div className="form-shell">
            <div className="progress"><div style={{width:`${step*25}%`}} /></div>
            <p><strong>Paso {step} de 4</strong></p>

            {step===1 && <>
              <h2>Perfil profesional</h2>
              <Field label="Nombre"><input value={data.first_name} onChange={e=>set("first_name",e.target.value)} /></Field>
              <Field label="Apellidos"><input value={data.last_name} onChange={e=>set("last_name",e.target.value)} /></Field>
              <Field label="País de residencia"><select value={data.country} onChange={e=>set("country",e.target.value)}><option>Mexico</option><option>Colombia</option><option>Otro</option></select></Field>
              <Field label="Rango de edad"><select value={data.age_range} onChange={e=>set("age_range",e.target.value)}><option>18-24</option><option>25-34</option><option>35-44</option><option>45-54</option><option>55+</option></select></Field>
              <Field label="Perfil profesional"><select value={data.profile} onChange={e=>set("profile",e.target.value)}><option value="engineer">Ingeniero</option><option value="technician">Técnico especializado</option><option value="technical_other">Otro perfil técnico</option><option value="other">Otro</option></select></Field>
              <Field label="Especialidad"><select value={data.specialty} onChange={e=>set("specialty",e.target.value)}><option value="mechanical">Ingeniería mecánica</option><option value="electrical">Ingeniería eléctrica</option><option value="mechatronics">Mecatrónica</option><option value="automation">Automatización / Control</option><option value="industrial_electronics">Electrónica industrial</option><option value="maintenance">Mantenimiento industrial</option><option value="industrial_engineering">Ingeniería industrial</option><option value="it">IT / Tecnología</option><option value="technical_other">Otra especialidad técnica</option><option value="nontechnical">Otra</option></select></Field>
              <Field label="Nivel de estudios"><select value={data.education} onChange={e=>set("education",e.target.value)}><option value="technical">Formación técnica</option><option value="technologist">Tecnólogo</option><option value="engineering">Ingeniería / Licenciatura</option><option value="masters">Maestría técnica</option><option value="incomplete">Estudios incompletos</option><option value="unrelated">Otra formación</option></select></Field>
              <Field label="¿Has terminado tus estudios?"><select value={data.studies_completed} onChange={e=>set("studies_completed",e.target.value)}><option value="yes">Sí</option><option value="no">No</option></select></Field>
            </>}

            {step===2 && <>
              <h2>Experiencia</h2>
              <Field label="Años de experiencia relacionada"><select value={data.experience_years} onChange={e=>set("experience_years",e.target.value)}><option value="0">Sin experiencia</option><option value="<2">Menos de 2 años</option><option value="2-4">2–4 años</option><option value="5-7">5–7 años</option><option value="8+">8 años o más</option></select></Field>
              <Field label="Área o sector de experiencia"><input value={data.sector} onChange={e=>set("sector",e.target.value)} placeholder="Ej. automoción, manufactura, energía..." /></Field>
              <Field label="Situación profesional actual"><select value={data.employment_status} onChange={e=>set("employment_status",e.target.value)}><option value="employed">Empleado</option><option value="independent">Independiente</option><option value="unemployed">Desempleado</option><option value="student">Estudiante</option><option value="other">Otro</option></select></Field>
              <Field label="Describe brevemente tu experiencia (opcional)"><textarea rows={4} value={data.experience_summary} onChange={e=>set("experience_summary",e.target.value)} /></Field>
            </>}

            {step===3 && <>
              <h2>Idiomas y Alemania</h2>
              <Field label="Nivel de alemán"><select value={data.german_level} onChange={e=>set("german_level",e.target.value)}><option value="none">Ninguno</option><option value="a1">A1</option><option value="a2">A2</option><option value="b1">B1</option><option value="b2">B2</option><option value="c1">C1 o superior</option></select></Field>
              <Field label="Nivel de inglés"><select value={data.english_level} onChange={e=>set("english_level",e.target.value)}><option value="none">Ninguno</option><option value="a1a2">A1–A2</option><option value="b1">B1</option><option value="b2">B2</option><option value="c1">C1 o superior</option></select></Field>
              <Field label="¿Estarías dispuesto/a a aprender alemán?"><select value={data.learn_german} onChange={e=>set("learn_german",e.target.value)}><option value="yes">Sí</option><option value="maybe">Tal vez</option><option value="no">No</option></select></Field>
              <Field label="Interés profesional en Alemania"><select value={data.germany_interest} onChange={e=>set("germany_interest",e.target.value)}><option value="exploring">Solo estoy explorando</option><option value="serious">Me interesa seriamente</option><option value="12months">Quiero prepararme durante los próximos 12 meses</option><option value="asap">Quiero comenzar mi preparación cuanto antes</option></select></Field>
              <Field label="¿Te mudarías a Alemania si surgiera una oportunidad adecuada?"><select value={data.mobility} onChange={e=>set("mobility",e.target.value)}><option value="yes">Sí</option><option value="maybe">Tal vez</option><option value="no">No</option></select></Field>
            </>}

            {step===4 && <>
              <h2>Datos de contacto</h2>
              <Field label="Correo electrónico"><input type="email" value={data.email} onChange={e=>set("email",e.target.value)} /></Field>
             <Field label="WhatsApp / teléfono">
  <div style={{display:"flex", gap:"8px"}}>
    <div style={{
      padding:"13px 14px",
      border:"1px solid #CBD5E1",
      borderRadius:"9px",
      background:"#F8FAFC",
      whiteSpace:"nowrap",
      fontWeight:700
    }}>
      {data.country === "Mexico" ? "🇲🇽 +52" :
       data.country === "Colombia" ? "🇨🇴 +57" :
       "🌎 +"}
    </div>

    <input
      type="tel"
      value={data.phone}
      onChange={e=>set("phone", e.target.value.replace(/\D/g,""))}
      placeholder={
        data.country === "Mexico"
          ? "Ej. 5512345678"
          : data.country === "Colombia"
          ? "Ej. 3001234567"
          : "Número de teléfono"
      }
    />
  </div>

  <p className="notice">
    Escribe solo tu número. El sistema añadirá automáticamente el código internacional.
    {data.country === "Mexico" && " México: +52"}
    {data.country === "Colombia" && " Colombia: +57"}
  </p>
</Field>
              <div className="field">
                <label><input type="checkbox" checked={data.consent} onChange={e=>set("consent",e.target.checked)} /> Acepto el tratamiento de mis datos de acuerdo con la Política de Privacidad de TalentoBrücke y autorizo el contacto relacionado con mi evaluación profesional.</label>
              </div>
              <p className="notice">Tus datos serán tratados de forma confidencial.</p>
            </>}

            <div className="form-actions">
              <button className="btn secondary" disabled={step===1 || status==="sending"} onClick={()=>setStep(s=>Math.max(1,s-1))}>← ATRÁS</button>
              {step<4
                ? <button className="btn" onClick={()=>setStep(s=>Math.min(4,s+1))}>CONTINUAR →</button>
                : <button className="btn" disabled={!data.consent || !data.email || status==="sending"} onClick={submit}>{status==="sending" ? "ENVIANDO..." : "ENVIAR MI EVALUACIÓN →"}</button>
              }
            </div>
            {status==="error" && <div className="error">No pudimos guardar la evaluación. Inténtalo de nuevo.</div>}
          </div>
        </div>
      </section>

      <footer className="footer"><div className="container"><strong>TALENTOBRÜCKE</strong> · Career Migration Partner</div></footer>
    </>
  );
}

function Field({label,children}:{label:string,children:React.ReactNode}) {
  return <div className="field"><label>{label}</label>{children}</div>;
}

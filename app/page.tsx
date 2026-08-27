import Link from "next/link";
import Image from "next/image";
export default function Home() {
  return (
    <>
      <header className="header">
        <div className="container header-inner">
       <Link href="/" className="header-logo" aria-label="TalentoBrücke - Inicio">
  <Image
    src="/logo-talentobrucke.png"
    alt="TalentoBrücke - Career Migration Partner"
    width={260}
    height={88}
    priority
  />
</Link>  

          <nav className="nav">
            <a href="#porque-alemania">¿Por qué Alemania?</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#para-quien">Para quién es</a>
            <a href="#sobre-nosotros">Sobre nosotros</a>
          </nav>

          <Link className="btn" href="/evaluacion">
            EVALÚA TU PERFIL →
          </Link>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">
                PARA PROFESIONALES Y TÉCNICOS LATINOAMERICANOS
              </p>

              <h1>
                TU EXPERIENCIA PROFESIONAL PUEDE ABRIRTE{" "}
                <span className="gold">OPORTUNIDADES EN ALEMANIA.</span>
              </h1>

              <p className="hero-text">
                Alemania necesita profesionales cualificados en áreas técnicas,
                tecnológicas e industriales y ha ampliado las vías para atraer
                talento internacional.
              </p>

              <p className="hero-text">
                <strong>TalentoBrücke</strong> te ayuda a conocer tu punto de
                partida, evaluar el potencial de tu perfil y prepararte para
                explorar oportunidades profesionales en el mercado laboral
                alemán.
              </p>

              <Link className="btn hero-btn" href="/evaluacion">
                EVALÚA TU PERFIL →
              </Link>

              <div className="hero-trust">
                <span>✓ Evaluación inicial</span>
                <span>✓ Enfoque profesional</span>
                <span>✓ Sin promesas de empleo</span>
              </div>
            </div>

            <div className="hero-image">
              <div className="hero-image-overlay">
                <span>Career Migration Partner</span>
              </div>
            </div>
          </div>
        </section>

        <section id="porque-alemania" className="section light-section">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">¿POR QUÉ ALEMANIA?</p>
              <h2>
                Una oportunidad profesional respaldada por cambios reales.
              </h2>
            </div>

            <div className="two-card-grid">
              <article className="info-card">
                <div className="card-number">01</div>
                <h3>UN MERCADO QUE NECESITA TALENTO CUALIFICADO</h3>
                <p>
                  Los cambios demográficos, la digitalización y la transformación
                  industrial están generando necesidades de profesionales
                  cualificados en diferentes áreas.
                </p>
              </article>

              <article className="info-card">
                <div className="card-number">02</div>
                <h3>NUEVAS VÍAS PARA EL TALENTO INTERNACIONAL</h3>
                <p>
                  Alemania ha reformado su marco de inmigración cualificada y
                  existen diferentes vías para determinados profesionales
                  internacionales.
                </p>
              </article>
            </div>

            <div className="section-action">
              <a className="btn-secondary" href="#porque-alemania-detalle">
                CONOCE POR QUÉ ALEMANIA →
              </a>
            </div>
          </div>
        </section>

        <section className="readiness-strip">
          <div className="container">
            <div className="readiness-grid">
              <div>
                <p className="eyebrow light">LA OPORTUNIDAD EXISTE.</p>
                <h2>
                  ¿TU PERFIL ESTÁ PREPARADO PARA{" "}
                  <span className="gold">APROVECHARLA?</span>
                </h2>
              </div>

              <div className="readiness-factors">
                <span>Formación</span>
                <span>Experiencia</span>
                <span>Profesión</span>
                <span>Idioma</span>
                <span>Reconocimiento</span>
                <span>Preparación</span>
              </div>

              <Link className="btn" href="/evaluacion">
                CONOCE TU PUNTO DE PARTIDA →
              </Link>
            </div>
          </div>
        </section>

        <section id="sobre-nosotros" className="section">
          <div className="container split-section">
            <div className="visual-placeholder">
              <span>TalentoBrücke</span>
            </div>

            <div>
              <p className="eyebrow">SOBRE TALENTOBRÜCKE</p>
              <h2>
                NO VENDEMOS EMPLEOS.{" "}
                <span className="gold">
                  CONSTRUIMOS PUENTES PROFESIONALES.
                </span>
              </h2>

              <p>
                TalentoBrücke es un Career Migration Partner orientado a
                profesionales y técnicos latinoamericanos que están considerando
                desarrollar su carrera profesional en Alemania.
              </p>

              <p>
                Empezamos entendiendo dónde estás y qué necesitas para avanzar.
              </p>

              <a className="btn-secondary" href="#sobre-nosotros-detalle">
                CONOCE TALENTOBRÜCKE →
              </a>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="section light-section">
          <div className="container">
            <div className="section-heading centered">
              <p className="eyebrow">¿CÓMO FUNCIONA?</p>
              <h2>Un camino claro empieza por entender tu punto de partida.</h2>
            </div>

            <div className="steps-grid">
              <article className="step-card">
                <span>01</span>
                <h3>EVALÚA TU PERFIL</h3>
                <p>Conocemos tu formación, experiencia, profesión e idiomas.</p>
              </article>

              <article className="step-card">
                <span>02</span>
                <h3>ANALIZAMOS TU SITUACIÓN</h3>
                <p>
                  Revisamos los principales factores que pueden influir en tu
                  camino profesional.
                </p>
              </article>

              <article className="step-card">
                <span>03</span>
                <h3>DEFINE TU CAMINO</h3>
                <p>
                  Identificamos necesidades de preparación según tu situación.
                </p>
              </article>

              <article className="step-card">
                <span>04</span>
                <h3>PREPÁRATE PARA ALEMANIA</h3>
                <p>
                  Avanza con mayor claridad, preparación y expectativas realistas.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="para-quien" className="section">
          <div className="container">
            <div className="section-heading centered">
              <p className="eyebrow">¿PARA QUIÉN ES TALENTOBRÜCKE?</p>
              <h2>Perfiles que buscamos inicialmente.</h2>
            </div>

            <p className="section-intro">
              Buscamos profesionales y técnicos latinoamericanos con formación y
              experiencia laboral que estén considerando seriamente desarrollar
              su carrera en Alemania.
            </p>

            <div className="profiles-grid">
              <div className="profile-card">Ingeniería mecánica</div>
              <div className="profile-card">
                Ingeniería eléctrica y electrónica
              </div>
              <div className="profile-card">Ingeniería industrial</div>
              <div className="profile-card">IT y tecnología</div>
              <div className="profile-card">Técnicos especializados</div>
              <div className="profile-card">Otros perfiles profesionales</div>
            </div>
          </div>
        </section>

        <section className="section light-section">
          <div className="container transparency-grid">
            <div>
              <p className="eyebrow">QUÉ PUEDES ESPERAR</p>
              <ul className="clean-list positive">
                <li>Evaluación profesional de tu perfil</li>
                <li>Identificación de aspectos por preparar</li>
                <li>Orientación según tu situación</li>
                <li>Información y expectativas claras</li>
              </ul>
            </div>

            <div>
              <p className="eyebrow">QUÉ NO PROMETEMOS</p>
              <ul className="clean-list negative">
                <li>Empleo garantizado</li>
                <li>Visa o residencia garantizada</li>
                <li>Salario garantizado</li>
                <li>Resultados que dependan de empresas o autoridades</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="container final-cta-inner">
            <div>
              <h2>
                ¿TU PERFIL PROFESIONAL PUEDE TENER{" "}
                <span className="gold">POTENCIAL EN ALEMANIA?</span>
              </h2>
              <p>Empieza por conocer tu punto de partida.</p>
            </div>

            <Link className="btn" href="/evaluacion">
              EVALÚA TU PERFIL →
            </Link>
          </div>

          <div className="container final-note">
            No queremos convencerte de que Alemania es para ti. Queremos ayudarte
            a descubrir si puede serlo.
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <div className="brand">
              TALENTO<span>BRÜCKE</span>
            </div>
            <p>Career Migration Partner</p>
          </div>

          <div>
            <strong>Navegación</strong>
            <a href="#porque-alemania">¿Por qué Alemania?</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#para-quien">Para quién es</a>
            <a href="#sobre-nosotros">Sobre nosotros</a>
          </div>

          <div>
            <strong>Legal</strong>
            <a href="#">Aviso legal</a>
            <a href="#">Política de privacidad</a>
            <a href="#">Cookies</a>
          </div>

          <div>
            <strong>Síguenos</strong>
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
          </div>
        </div>

        <div className="container footer-disclaimer">
          TalentoBrücke no garantiza empleo, visa, residencia, salario ni resultados
          de contratación. Los requisitos y posibilidades dependen de la situación
          individual del candidato, las empresas y las autoridades competentes.
        </div>
      </footer>
    </>
  );
}

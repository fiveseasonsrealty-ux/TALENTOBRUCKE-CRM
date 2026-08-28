import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
export default function Home() {
  return (
    <>
      <ScrollReveal />
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

           <div className="hero-image"></div>
          </div>
        </section>

   <section id="porque-alemania" className="section light-section">
  <div className="container">
   <div className="section-heading reveal reveal-up">
      <p className="eyebrow">¿POR QUÉ ALEMANIA?</p>

      <h2>ALEMANIA ESTÁ BUSCANDO TALENTO CUALIFICADO</h2>

      <h3 className="section-subtitle">
        Una economía industrial y tecnológica que necesita profesionales.
      </h3>

      <p className="section-copy">
        Los cambios demográficos, la digitalización y la transformación de la
        industria están generando necesidades de personal cualificado en
        distintas áreas de la economía alemana.
      </p>

      <p className="section-copy">
        Ingenieros, profesionales tecnológicos y determinados perfiles técnicos
        se encuentran entre las ocupaciones para las que Alemania busca
        incorporar talento, incluido talento procedente del extranjero.
      </p>

      <p className="section-warning">
        <strong>No significa que exista empleo garantizado para cualquier perfil.</strong>{" "}
        La especialidad, experiencia, formación, idioma y situación individual
        siguen siendo determinantes.
      </p>
    </div>

    <div className="germany-layout">
      <article className="germany-card germany-card-main">
        <div className="card-number">01</div>

        <h3>TALENTO CUALIFICADO</h3>

        <p>
          Alemania mantiene una economía fuertemente vinculada con la industria,
          la ingeniería, la tecnología, la automatización y otros sectores
          especializados.
        </p>

        <p>
          Por eso, determinados perfiles técnicos y profesionales pueden
          encontrar oportunidades relevantes si cumplen los requisitos del
          mercado y de su situación individual.
        </p>
      </article>

      <article className="germany-card germany-card-main">
        <div className="card-number">02</div>

        <h3>NUEVAS VÍAS PARA EL TALENTO INTERNACIONAL</h3>

        <p>
          Alemania ha reformado su marco de inmigración cualificada para ampliar
          las posibilidades de acceso al país y al mercado laboral para
          profesionales procedentes de fuera de la Unión Europea.
        </p>

        <p>
          Dependiendo de las características de cada candidato, existen
          diferentes vías que pueden ser relevantes.
        </p>
      </article>
    </div>

    <div className="migration-paths">
      <article className="migration-card">
        <h4>EU BLUE CARD</h4>
        <p>
          Para determinados profesionales que cumplen los requisitos
          establecidos, entre ellos los relativos a cualificación, empleo y
          salario según el caso.
        </p>
      </article>

      <article className="migration-card">
        <h4>VISA PARA PROFESIONALES CUALIFICADOS</h4>
        <p>
          Para determinados profesionales con formación profesional o académica
          que cumplen los requisitos correspondientes para ejercer un empleo
          cualificado en Alemania.
        </p>
      </article>

      <article className="migration-card">
        <h4>CHANCENKARTE — TARJETA DE OPORTUNIDADES</h4>
        <p>
          Una vía que permite a determinados profesionales acceder a Alemania
          para buscar empleo cualificado cuando cumplen los requisitos
          establecidos.
        </p>
      </article>

      <article className="migration-card">
        <h4>OTRAS VÍAS PARA PROFESIONALES CON EXPERIENCIA</h4>
        <p>
          Dependiendo de la cualificación, experiencia, profesión y
          circunstancias individuales, existen otras posibilidades de acceso al
          mercado laboral alemán.
        </p>
      </article>
    </div>

    <div className="germany-disclaimer">
      <strong>
        Cada vía tiene requisitos específicos. Su existencia no significa que
        todos los candidatos sean elegibles.
      </strong>
    </div>
  </div>
</section>

        <section className="readiness-strip">
  <div className="container readiness-inner">
    <div className="readiness-heading">
      <p className="readiness-eyebrow">LA OPORTUNIDAD EXISTE.</p>

      <h2>
        ¿TU PERFIL ESTÁ PREPARADO PARA{" "}
        <span>APROVECHARLA?</span>
      </h2>

      <p className="readiness-copy">
        Explorar oportunidades profesionales en Alemania empieza por entender
        dónde estás y qué aspectos de tu perfil pueden necesitar preparación.
      </p>
    </div>

    <div className="readiness-factors">
      <div className="readiness-factor">
        <span className="factor-icon">01</span>
        <strong>FORMACIÓN</strong>
      </div>

      <div className="readiness-factor">
        <span className="factor-icon">02</span>
        <strong>EXPERIENCIA</strong>
      </div>

      <div className="readiness-factor">
        <span className="factor-icon">03</span>
        <strong>PROFESIÓN</strong>
      </div>

      <div className="readiness-factor">
        <span className="factor-icon">04</span>
        <strong>IDIOMA</strong>
      </div>

      <div className="readiness-factor">
        <span className="factor-icon">05</span>
        <strong>RECONOCIMIENTO</strong>
      </div>

      <div className="readiness-factor">
        <span className="factor-icon">06</span>
        <strong>PREPARACIÓN</strong>
      </div>
    </div>

    <div className="readiness-action">
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

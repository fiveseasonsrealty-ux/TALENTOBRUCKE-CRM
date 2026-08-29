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
            <div className="about-image reveal reveal-left"></div>

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

       <section id="como-funciona" className="section how-section">
  <div className="container">

    <div className="section-heading centered reveal reveal-up">
      <p className="eyebrow">¿CÓMO FUNCIONA?</p>

      <h2>UN CAMINO CLARO EMPIEZA POR ENTENDER TU PUNTO DE PARTIDA.</h2>

      <p className="section-intro how-intro">
        TalentoBrücke comienza analizando tu situación profesional para ayudarte
        a comprender qué aspectos de tu perfil pueden ser relevantes para
        explorar oportunidades en el mercado laboral alemán y qué preparación
        podrías necesitar.
      </p>
    </div>

    <div className="how-process">

      <article className="how-card reveal reveal-up">
        <div className="how-number">01</div>

        <div className="how-content">
          <h3>EVALÚA TU PERFIL</h3>

          <p>
            Cuéntanos sobre tu formación, experiencia laboral, profesión,
            idiomas y objetivos profesionales.
          </p>

         <div className="how-card-footer">
  Conocemos tu punto de partida.
</div>
        </div>
      </article>

      <div className="how-connector" aria-hidden="true">→</div>

      <article className="how-card reveal reveal-up">
        <div className="how-number">02</div>

        <div className="how-content">
          <h3>ANALIZAMOS TU SITUACIÓN</h3>

          <p>
            Revisamos los principales factores que pueden influir en tu acceso
            al mercado laboral alemán e identificamos fortalezas y aspectos que
            podrían requerir preparación.
          </p>

          <strong>
           <div className="how-card-footer">
  Entendemos dónde estás y qué podrías necesitar.
</div>
          </strong>
        </div>
      </article>

      <div className="how-connector" aria-hidden="true">→</div>

      <article className="how-card reveal reveal-up">
        <div className="how-number">03</div>

        <div className="how-content">
          <h3>DEFINE TU CAMINO</h3>

          <p>
            Dependiendo de tu perfil, pueden existir diferentes necesidades de
            preparación relacionadas con idioma, reconocimiento de
            cualificaciones, documentación profesional u otros aspectos.
          </p>

          <div className="how-card-footer">
  No todos los candidatos necesitan recorrer el mismo camino.
</div>
        </div>
      </article>

      <div className="how-connector" aria-hidden="true">→</div>

      <article className="how-card reveal reveal-up">
        <div className="how-number">04</div>

        <div className="how-content">
          <h3>PREPÁRATE PARA ALEMANIA</h3>

          <p>
            Si tu perfil presenta potencial y decides continuar, el objetivo es
            avanzar hacia una preparación profesional más estructurada para
            explorar oportunidades en el mercado laboral alemán.
          </p>

         <div className="how-card-footer">
  Con mayor claridad. Con preparación. Sin falsas promesas.
</div>
        </div>
      </article>

    </div>

    <div className="how-closing reveal reveal-up">
      <p>
        No empezamos prometiéndote un empleo.
        <strong>
          {" "}Empezamos entendiendo dónde estás y qué necesitas para avanzar.
        </strong>
      </p>
    </div>

  </div>
</section>

       <section id="para-quien" className="section audience-section">
  <div className="container">

    <div className="section-heading centered reveal reveal-up">
      <p className="eyebrow">¿PARA QUIÉN ES TALENTOBRÜCKE?</p>

      <h2>
        PROFESIONALES QUE ESTÁN CONSIDERANDO SERIAMENTE
        DESARROLLAR SU CARRERA EN ALEMANIA.
      </h2>

      <p className="section-intro audience-intro">
        Buscamos profesionales y técnicos latinoamericanos con formación y
        experiencia laboral que estén considerando seriamente desarrollar su
        carrera en Alemania.
      </p>

      <p className="section-intro audience-intro-secondary">
        TalentoBrücke está orientado especialmente a perfiles técnicos,
        tecnológicos e industriales que quieran conocer su punto de partida y
        prepararse de forma profesional para explorar oportunidades en el
        mercado laboral alemán.
      </p>
    </div>

    <div className="audience-visual reveal reveal-up">
      <div className="audience-image"></div>
    </div>

    <div className="audience-grid">

      <article className="audience-card reveal reveal-up">
        <div className="audience-icon">01</div>
        <h3>INGENIERÍA MECÁNICA</h3>
        <p>
          Profesionales vinculados con diseño, producción, mantenimiento,
          manufactura, maquinaria y procesos industriales.
        </p>
      </article>

      <article className="audience-card reveal reveal-up">
        <div className="audience-icon">02</div>
        <h3>INGENIERÍA ELÉCTRICA Y ELECTRÓNICA</h3>
        <p>
          Profesionales relacionados con sistemas eléctricos, electrónica,
          automatización, control y tecnologías industriales.
        </p>
      </article>

      <article className="audience-card reveal reveal-up">
        <div className="audience-icon">03</div>
        <h3>INGENIERÍA INDUSTRIAL</h3>
        <p>
          Perfiles vinculados con producción, procesos, calidad, operaciones,
          logística y mejora continua.
        </p>
      </article>

      <article className="audience-card reveal reveal-up">
        <div className="audience-icon">04</div>
        <h3>IT Y TECNOLOGÍA</h3>
        <p>
          Profesionales de software, sistemas, infraestructura, datos y otras
          especialidades tecnológicas.
        </p>
      </article>

      <article className="audience-card reveal reveal-up">
        <div className="audience-icon">05</div>
        <h3>TÉCNICOS ESPECIALIZADOS</h3>
        <p>
          Profesionales con formación técnica y experiencia práctica en áreas
          industriales, eléctricas, mecánicas, automatización u otras
          especialidades.
        </p>
      </article>

      <article className="audience-card reveal reveal-up">
        <div className="audience-icon">06</div>
        <h3>OTROS PERFILES PROFESIONALES</h3>
        <p>
          También podemos evaluar otros perfiles profesionales. Cada caso se
          analiza de manera individual.
        </p>
      </article>

    </div>

    <div className="audience-fit reveal reveal-up">
      <h3>TALENTOBRÜCKE PUEDE SER PARA TI SI...</h3>

      <div className="audience-fit-grid">
        <div>✓ Tienes formación profesional, técnica o universitaria.</div>
        <div>✓ Cuentas con experiencia laboral.</div>
        <div>✓ Estás considerando seriamente desarrollar tu carrera en Alemania.</div>
        <div>✓ Entiendes que un proceso profesional internacional requiere preparación.</div>
        <div>✓ Estás dispuesto a desarrollar las competencias que tu perfil pueda necesitar.</div>
        <div>✓ Buscas orientación profesional y transparencia, no promesas fáciles.</div>
      </div>
    </div>

    <div className="audience-closing reveal reveal-up">
      <p>
        No buscamos candidatos para llenar una base de datos.
        <strong>
          {" "}Buscamos profesionales que quieran evaluar seriamente si Alemania
          puede formar parte de su futuro profesional.
        </strong>
      </p>
    </div>

  </div>
</section>

       <section className="section transparency-section">
  <div className="container">

    <div className="section-heading centered reveal reveal-up">
      <p className="eyebrow">TRANSPARENCIA DESDE EL PRINCIPIO</p>

      <h2>
        CLARIDAD SOBRE LO QUE PUEDES ESPERAR
        Y LO QUE NO PROMETEMOS.
      </h2>

      <p className="section-intro transparency-intro">
        Un proceso profesional empieza por establecer expectativas claras.
        Nuestro objetivo es ayudarte a comprender tu situación y prepararte
        mejor, sin convertir posibilidades en promesas.
      </p>
    </div>

    <div className="transparency-cards">

      <article className="transparency-card transparency-positive reveal reveal-left">
        <div className="transparency-card-header">
          <span className="transparency-symbol">✓</span>
          <div>
            <p className="transparency-label">QUÉ PUEDES ESPERAR</p>
            <h3>UN PROCESO PROFESIONAL Y CLARO</h3>
          </div>
        </div>

        <ul className="transparency-list">
          <li>Evaluación profesional de tu perfil</li>
          <li>Identificación de aspectos por preparar</li>
          <li>Orientación según tu situación</li>
          <li>Información y expectativas claras</li>
        </ul>
      </article>

      <article className="transparency-card transparency-negative reveal reveal-right">
        <div className="transparency-card-header">
          <span className="transparency-symbol">×</span>
          <div>
            <p className="transparency-label">QUÉ NO PROMETEMOS</p>
            <h3>RESULTADOS QUE NO DEPENDEN SOLO DE NOSOTROS</h3>
          </div>
        </div>

        <ul className="transparency-list">
          <li>Empleo garantizado</li>
          <li>Visa o residencia garantizada</li>
          <li>Salario garantizado</li>
          <li>Resultados que dependan de empresas o autoridades</li>
        </ul>
      </article>

    </div>

    <div className="transparency-closing reveal reveal-up">
      <p>
        <strong>No vendemos certezas que nadie puede garantizar.</strong>
        {" "}Trabajamos para aportar claridad, preparación y acompañamiento
        profesional durante el proceso.
      </p>
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

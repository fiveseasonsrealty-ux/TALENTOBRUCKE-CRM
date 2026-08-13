import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <div className="brand">TALENTO<span>BRÜCKE</span></div>
          <Link className="btn" href="/evaluacion">EVALÚA TU PERFIL</Link>
        </div>
      </header>
      <main className="hero">
        <div className="container hero-grid">
          <div>
            <h1>Talento técnico latinoamericano, preparado para explorar <span className="gold">Alemania</span>.</h1>
            <p className="lead">Evaluación profesional inicial para ingenieros y técnicos especializados.</p>
            <Link className="btn" href="/evaluacion">COMENZAR EVALUACIÓN →</Link>
          </div>
          <div className="hero-card">
            <div>
              <strong>Career Migration Partner</strong>
              <p>Un proceso profesional, transparente y orientado a conocer primero tu perfil.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

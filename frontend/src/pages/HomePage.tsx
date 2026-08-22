import type { Page } from '../components/Navbar';
import logoImg from '../assets/logo.png';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="page">
      <div className="container">
        <section className="hero">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            <img 
              src={logoImg} 
              alt="QuantoCusta Logo" 
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '24px',
                objectFit: 'contain',
                boxShadow: '0 0 30px rgba(124, 58, 237, 0.4), 0 0 60px rgba(6, 182, 212, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              className="animate-slide-up"
            />
          </div>

          <h1 className="hero-title animate-slide-up">
            Quanto <span className="gradient-text">Custa?</span>
          </h1>
          <p className="hero-description animate-slide-up" style={{ animationDelay: '100ms', maxWidth: '680px' }}>
            Descubra quanto jogos da <strong>Steam</strong> e assinaturas de <strong>IA</strong> custam pelo mundo — 
            com todos os preços convertidos diretamente para <strong>Reais (BRL)</strong> para escancarar a discrepância regional.
          </p>

          <div className="hero-cards animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div
              className="glass-card glass-card--interactive hero-card"
              onClick={() => onNavigate('steam')}
            >
              <div className="hero-card-icon">🎮</div>
              <h3 className="hero-card-title">Jogos da Steam</h3>
              <p className="hero-card-desc">
                Busque qualquer jogo da Steam pelo nome ou AppID e compare os preços em 18 países em tempo real em R$.
              </p>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <span className="badge badge-info">Dados ao Vivo</span>
              </div>
            </div>

            <div
              className="glass-card glass-card--interactive hero-card"
              onClick={() => onNavigate('ai')}
            >
              <div className="hero-card-icon">🤖</div>
              <h3 className="hero-card-title">Assinaturas de IA</h3>
              <p className="hero-card-desc">
                Compare os planos Claude Pro, ChatGPT Plus e Gemini Advanced entre diferentes países convertidos para Reais.
              </p>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <span className="badge badge-warning">Tabela Comparativa</span>
              </div>
            </div>
          </div>
        </section>

        <section className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="stats-bar">
            <div className="glass-card stat-card">
              <div className="stat-value purple">18</div>
              <div className="stat-label">Países Monitorados</div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-value green">Até ~70%</div>
              <div className="stat-label">Diferença Regional</div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-value blue">3</div>
              <div className="stat-label">IAs Comparadas</div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-value red">R$</div>
              <div className="stat-label">Conversão em BRL</div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 'var(--space-16)', textAlign: 'center' }}>
          <h2 className="section-title">Como Funciona</h2>
          <p className="section-subtitle">Comparação de preços simples, transparente e em moeda brasileira</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-6)',
            maxWidth: '960px',
            margin: '0 auto',
          }}>
            {[
              { icon: '🔍', title: '1. Busque', desc: 'Procure por qualquer jogo na Steam ou navegue pelas assinaturas de IA' },
              { icon: '🌍', title: '2. Compare', desc: 'Veja a tabela com 18 países e os valores convertidos diretamente para Real (R$)' },
              { icon: '📊', title: '3. Economize', desc: 'Identifique onde é mais barato, veja a % de diferença e entenda a discrepância global' },
            ].map((step, i) => (
              <div key={i} className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>{step.icon}</div>
                <h4 style={{ marginBottom: 'var(--space-2)' }}>{step.title}</h4>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

import { useState } from 'react';
import './index.css';
import './App.css';
import Navbar from './components/Navbar';
import type { Page } from './components/Navbar';
import HomePage from './pages/HomePage';
import SteamComparePage from './pages/SteamComparePage';
import AIComparePage from './pages/AIComparePage';
import logoImg from './assets/logo.png';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  function renderPage() {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'steam':
        return <SteamComparePage />;
      case 'ai':
        return <AIComparePage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  }

  return (
    <>
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
      <footer className="footer">
        <div className="container footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <img src={logoImg} alt="Logo" style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'contain' }} />
            <span className="footer-text">
              <strong>QuantoCusta</strong> — Comparador Internacional de Preços em Reais (BRL)
            </span>
          </div>
          <div className="footer-links">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://store.steampowered.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Steam
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;

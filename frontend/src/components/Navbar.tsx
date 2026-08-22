import { useState } from 'react';
import { IconHome, IconGamepad, IconAI } from './Icons';
import logoImg from '../assets/logo.png';

type Page = 'home' | 'steam' | 'ai';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <a
          href="#"
          className="navbar-logo"
          onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
        >
          <img 
            src={logoImg} 
            alt="QuantoCusta Logo" 
            className="navbar-logo-img"
            style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.4))' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span className="navbar-logo-text" style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Quanto<span style={{ color: '#06b6d4' }}>Custa</span>
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Games & AI in R$
            </span>
          </div>
        </a>

        <div className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
          <button
            className={`navbar-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => { onNavigate('home'); setMenuOpen(false); }}
          >
            <IconHome size={16} />
            <span>Início</span>
          </button>
          <button
            className={`navbar-link ${currentPage === 'steam' ? 'active' : ''}`}
            onClick={() => { onNavigate('steam'); setMenuOpen(false); }}
          >
            <IconGamepad size={17} />
            <span>Jogos Steam</span>
          </button>
          <button
            className={`navbar-link ${currentPage === 'ai' ? 'active' : ''}`}
            onClick={() => { onNavigate('ai'); setMenuOpen(false); }}
          >
            <IconAI size={16} />
            <span>Assinaturas IA</span>
          </button>
        </div>

        <button
          className="navbar-menu-toggle btn-ghost"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          style={{ display: 'none' }}
        >
          ☰
        </button>
      </div>
    </nav>
  );
}

export type { Page };

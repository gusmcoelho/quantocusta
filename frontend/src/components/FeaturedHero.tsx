import { useState, useEffect } from 'react';
import { FEATURED_SPOTLIGHTS } from '../lib/featured-games';
import type { FeaturedGame } from '../lib/featured-games';
import { IconCompare, IconStar } from './Icons';

interface FeaturedHeroProps {
  onSelectGame: (appid: string, name: string) => void;
  selectedGameId?: string | null;
}

export default function FeaturedHero({ onSelectGame, selectedGameId }: FeaturedHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!selectedGameId) return;
    const idx = FEATURED_SPOTLIGHTS.findIndex(g => g.appid === selectedGameId);
    if (idx !== -1) {
      setCurrentIndex(idx);
    }
  }, [selectedGameId]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % FEATURED_SPOTLIGHTS.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const currentGame: FeaturedGame = FEATURED_SPOTLIGHTS[currentIndex];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + FEATURED_SPOTLIGHTS.length) % FEATURED_SPOTLIGHTS.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % FEATURED_SPOTLIGHTS.length);
  };

  return (
    <div
      className="gaming-hero-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="gaming-hero-backdrop">
        <img
          src={currentGame.bannerImage}
          alt={currentGame.title}
          className="gaming-hero-bg-img"
        />
        <div className="gaming-hero-gradient-overlay" />
      </div>

      <div className="gaming-hero-content">
        <div className="gaming-hero-tags">
          {currentGame.tags.map((tag, idx) => (
            <span key={idx} className="gaming-tag-pill">
              {tag}
            </span>
          ))}
          {currentGame.discount && (
            <span className="gaming-discount-badge">
              -{currentGame.discount}%
            </span>
          )}
        </div>

        <h1 className="gaming-hero-title">
          {currentGame.title}
        </h1>
        <div className="gaming-hero-subtitle">
          {currentGame.subtitle} •{' '}
          <span className="gaming-rating-text" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <IconStar size={13} />
            <span>{currentGame.rating}</span>
          </span>
        </div>

        <p className="gaming-hero-desc">
          {currentGame.description}
        </p>

        <div className="gaming-hero-actions">
          <button
            className="btn-gaming-primary"
            onClick={() => onSelectGame(currentGame.appid, currentGame.title)}
            id="hero-compare-button"
          >
            <IconCompare size={18} className="btn-gaming-icon" />
            <span>Comparar Preços no Mundo</span>
            <span className="btn-gaming-price-tag">
              {currentGame.approxPriceBRL}
            </span>
          </button>

          <a
            href={`https://store.steampowered.com/app/${currentGame.appid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gaming-secondary"
          >
            Ver na Steam ↗
          </a>
        </div>
      </div>

      <div className="gaming-hero-nav">
        <button
          className="gaming-nav-arrow"
          onClick={handlePrev}
          aria-label="Jogo Anterior"
          title="Anterior"
        >
          ‹
        </button>
        <button
          className="gaming-nav-arrow"
          onClick={handleNext}
          aria-label="Próximo Jogo"
          title="Próximo"
        >
          ›
        </button>
      </div>

      <div className="gaming-hero-dots">
        {FEATURED_SPOTLIGHTS.map((g, idx) => (
          <button
            key={g.appid}
            className={`gaming-dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Ver ${g.title}`}
          />
        ))}
      </div>
    </div>
  );
}

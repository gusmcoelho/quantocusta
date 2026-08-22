import { useRef, useState, useMemo } from 'react';
import { TRENDING_GAMES, FEATURED_SPOTLIGHTS } from '../lib/featured-games';
import {
  IconAll,
  IconTrophy,
  IconRPG,
  IconSouls,
  IconOpenWorld,
  IconCrosshair,
  IconIndie,
  IconInfinity,
  IconPause,
  IconStar,
} from './Icons';

interface TrendingCarouselProps {
  onSelectGame: (appid: string, name: string) => void;
  selectedGameId?: string | null;
}

type FilterCategory = 'all' | 'popular' | 'souls' | 'rpg' | 'openworld' | 'action' | 'indie';

export default function TrendingCarousel({ onSelectGame, selectedGameId }: TrendingCarouselProps) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [isAutoScroll, setIsAutoScroll] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const allGames = useMemo(() => {
    const combined = [...FEATURED_SPOTLIGHTS, ...TRENDING_GAMES];
    const unique = Array.from(new Map(combined.map(g => [g.appid, g])).values());
    return unique;
  }, []);

  const filteredGames = useMemo(() => {
    if (activeFilter === 'all') return allGames;
    if (activeFilter === 'popular') return allGames.slice(0, 8);
    return allGames.filter(g => {
      if (activeFilter === 'souls') return g.category === 'souls' || g.tags.some(t => t.toLowerCase().includes('souls'));
      if (activeFilter === 'rpg') return g.category === 'rpg' || g.tags.some(t => t.toLowerCase().includes('rpg'));
      if (activeFilter === 'openworld') return g.category === 'openworld' || g.tags.some(t => t.toLowerCase().includes('aberto'));
      if (activeFilter === 'action') return g.category === 'action' || g.tags.some(t => t.toLowerCase().includes('ação'));
      if (activeFilter === 'indie') return g.category === 'indie' || g.tags.some(t => t.toLowerCase().includes('rogue'));
      return true;
    });
  }, [allGames, activeFilter]);

  const scroll = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const scrollAmount = 480;
    trackRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="trending-section">
      <div className="trending-header">
        <div className="trending-header-left">
          <div className="trending-badge">
            <span className="trending-pulse-dot" />
            <span>EM ALTA NA STEAM</span>
          </div>
          <h2 className="trending-title">Trending Now</h2>
          <p className="trending-subtitle">
            Clique em qualquer jogo para carregar instantaneamente a cotação em 18 países
          </p>
        </div>

        <div className="trending-header-controls">
          <button
            className={`btn-pill-toggle ${isAutoScroll ? 'active' : ''}`}
            onClick={() => setIsAutoScroll(!isAutoScroll)}
            title="Ativar/Desativar rolagem automática infinita"
          >
            {isAutoScroll ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconPause size={13} />
                <span>Pausar Carrossel</span>
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconInfinity size={14} />
                <span>Carrossel Infinito</span>
              </span>
            )}
          </button>

          <div className="trending-nav-buttons">
            <button
              className="trending-nav-btn"
              onClick={() => scroll('left')}
              aria-label="Rolar para a esquerda"
              title="Anterior"
            >
              ‹
            </button>
            <button
              className="trending-nav-btn"
              onClick={() => scroll('right')}
              aria-label="Rolar para a direita"
              title="Próximo"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="trending-filters">
        {[
          { id: 'all', label: 'Todos', icon: IconAll },
          { id: 'popular', label: 'Mais Vendidos', icon: IconTrophy },
          { id: 'rpg', label: 'RPG', icon: IconRPG },
          { id: 'souls', label: 'Souls-like', icon: IconSouls },
          { id: 'openworld', label: 'Mundo Aberto', icon: IconOpenWorld },
          { id: 'action', label: 'Ação & Tiro', icon: IconCrosshair },
          { id: 'indie', label: 'Indies & Roguelikes', icon: IconIndie },
        ].map(cat => {
          const IconComp = cat.icon;
          return (
            <button
              key={cat.id}
              className={`filter-pill ${activeFilter === cat.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(cat.id as FilterCategory)}
            >
              <IconComp size={14} className="filter-pill-icon" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      <div className="trending-slider-container">
        <div
          ref={trackRef}
          className={`trending-track ${isAutoScroll ? 'marquee-active' : ''}`}
        >
          {(isAutoScroll ? [...filteredGames, ...filteredGames] : filteredGames).map((game, index) => {
            const isSelected = selectedGameId === game.appid;
            return (
              <div
                key={`${game.appid}-${index}`}
                className={`game-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectGame(game.appid, game.title)}
              >
                <div className="game-card-media">
                  <img
                    src={game.bannerImage}
                    alt={game.title}
                    className="game-card-img"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = game.capsuleImage;
                    }}
                  />
                  {game.discount && (
                    <span className="game-card-discount">
                      -{game.discount}%
                    </span>
                  )}
                  <span className="game-card-rating">
                    <IconStar size={11} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '3px' }} />
                    <span>{game.ratingPercent}%</span>
                  </span>
                </div>

                <div className="game-card-body">
                  <h3 className="game-card-title" title={game.title}>
                    {game.title}
                  </h3>
                  <p className="game-card-desc">
                    {game.description}
                  </p>

                  <div className="game-card-footer">
                    <div className="game-card-price-pill">
                      {game.approxPriceBRL}
                    </div>
                    <button className="game-card-action-btn">
                      {isSelected ? '✓ Selecionado' : 'Comparar →'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

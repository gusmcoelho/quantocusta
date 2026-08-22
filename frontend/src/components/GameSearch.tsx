import { useState, useEffect, useRef, useCallback } from 'react';
import { searchSteamGame } from '../lib/steam-api';
import type { SteamSearchItem } from '../lib/types';

interface GameSearchProps {
  onSelectGame: (appid: string, name: string) => void;
}

export default function GameSearch({ onSelectGame }: GameSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SteamSearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const doSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (/^\d+$/.test(term.trim())) {
      onSelectGame(term.trim(), `App ${term.trim()}`);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const items = await searchSteamGame(term);
      setResults(items);
      setIsOpen(items.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [onSelectGame]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      doSearch(query);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(item: SteamSearchItem) {
    setQuery(item.name);
    setIsOpen(false);
    onSelectGame(String(item.id), item.name);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && query.trim()) {
      if (/^\d+$/.test(query.trim())) {
        onSelectGame(query.trim(), `App ${query.trim()}`);
        setIsOpen(false);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div className="search-container" ref={containerRef}>
      <div style={{ position: 'relative' }}>
        <input
          id="game-search-input"
          type="text"
          className="input input-lg"
          placeholder="Buscar jogo na Steam ou colar um AppID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {isLoading && (
          <div style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}>
            <div className="spinner" />
          </div>
        )}
      </div>

      {error && (
        <div style={{
          marginTop: '8px',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-danger)',
        }}>
          {error}
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className="search-dropdown animate-slide-down">
          {results.map((item) => (
            <div
              key={item.id}
              className="search-item"
              onClick={() => handleSelect(item)}
            >
              <img
                src={item.tiny_image}
                alt={item.name}
                className="search-item-img"
                loading="lazy"
              />
              <div className="search-item-info">
                <div className="search-item-name">{item.name}</div>
                <div className="search-item-id">AppID: {item.id}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

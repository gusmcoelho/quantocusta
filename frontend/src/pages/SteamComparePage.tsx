import { useState, useCallback, useMemo, useRef } from 'react';
import GameSearch from '../components/GameSearch';
import PriceTable from '../components/PriceTable';
import CurrencyToggle from '../components/CurrencyToggle';
import FeaturedHero from '../components/FeaturedHero';
import TrendingCarousel from '../components/TrendingCarousel';
import { IconGamepad, IconRefresh, IconZap } from '../components/Icons';
import { fetchSteamPricesAllCountries, getSteamHeaderImage } from '../lib/steam-api';
import { COUNTRIES } from '../lib/countries';
import { convertToUSD, convertToBRL, formatReferencePrice } from '../lib/currency';
import type { CountryPrice, ReferenceCurrency, SteamPriceResponse } from '../lib/types';

export default function SteamComparePage() {
  const [referenceCurrency, setReferenceCurrency] = useState<ReferenceCurrency>('BRL');
  const [selectedGame, setSelectedGame] = useState<{ appid: string; name: string } | null>(null);
  const [priceData, setPriceData] = useState<SteamPriceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSelectGame = useCallback(async (appid: string, name: string) => {
    setSelectedGame({ appid, name });
    setIsLoading(true);
    setError(null);
    setPriceData(null);

    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    try {
      const data = await fetchSteamPricesAllCountries(appid);
      setPriceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const countryPrices: CountryPrice[] = useMemo(() => {
    if (!priceData) return [];

    const prices: CountryPrice[] = [];

    for (const country of COUNTRIES) {
      const result = priceData.results[country.steamCC];
      if (!result || !result.success || !result.price_overview) continue;

      const po = result.price_overview;
      const localPrice = po.final / 100;
      const originalPrice = po.initial / 100;
      const currency = po.currency;

      prices.push({
        country,
        localPrice,
        localCurrency: currency,
        convertedPriceUSD: convertToUSD(localPrice, currency),
        convertedPriceBRL: convertToBRL(localPrice, currency),
        discountPercent: po.discount_percent,
        diffFromMax: 0,
        originalPrice: originalPrice !== localPrice ? originalPrice : undefined,
      });
    }

    if (prices.length > 0) {
      const maxUSD = Math.max(...prices.map(p => p.convertedPriceUSD));
      for (const p of prices) {
        p.diffFromMax = maxUSD > 0
          ? ((p.convertedPriceUSD - maxUSD) / maxUSD) * 100
          : 0;
      }
    }

    return prices;
  }, [priceData]);

  const stats = useMemo(() => {
    if (countryPrices.length === 0) return null;

    const ref = referenceCurrency;
    const getPrice = (p: CountryPrice) => ref === 'USD' ? p.convertedPriceUSD : p.convertedPriceBRL;

    const sorted = [...countryPrices].sort((a, b) => getPrice(a) - getPrice(b));
    const cheapest = sorted[0];
    const mostExpensive = sorted[sorted.length - 1];
    const cheapPrice = getPrice(cheapest);
    const expPrice = getPrice(mostExpensive);
    const diffPercent = expPrice > 0 ? ((expPrice - cheapPrice) / expPrice) * 100 : 0;
    const economyValue = expPrice - cheapPrice;

    return { cheapest, mostExpensive, cheapPrice, expPrice, diffPercent, economyValue };
  }, [countryPrices, referenceCurrency]);

  return (
    <div className="gaming-platform-page">
      <div className="container">
        <div className="gaming-top-bar">
          <div className="gaming-top-bar-left">
            <div className="gaming-logo-pill">
              <IconGamepad size={14} className="gaming-logo-icon" />
              <span className="gaming-logo-label">STEAM PRICE HUB</span>
            </div>
            <p className="gaming-top-bar-desc">
              Compare cotações regionais em 18 moedas convertidas para o Real (BRL)
            </p>
          </div>

          <div className="gaming-search-wrapper">
            <GameSearch onSelectGame={handleSelectGame} />
          </div>
        </div>

        <FeaturedHero
          onSelectGame={handleSelectGame}
          selectedGameId={selectedGame?.appid}
        />

        <TrendingCarousel
          onSelectGame={handleSelectGame}
          selectedGameId={selectedGame?.appid}
        />

        <div ref={resultsRef} style={{ scrollMarginTop: '80px' }} />

        {error && (
          <div className="gaming-error-banner animate-fade-in">
            <span className="gaming-error-icon">⚠️</span>
            <div>
              <strong>Não foi possível obter os preços:</strong> {error}
              <div style={{ fontSize: 'var(--font-size-xs)', marginTop: '4px', opacity: 0.8 }}>
                Verifique se o proxy local está em execução (`worker`) ou tente outro jogo.
              </div>
            </div>
          </div>
        )}

        {(selectedGame || isLoading) && (
          <div className="gaming-results-container animate-slide-up">
            {selectedGame && (
              <div className="selected-game-banner">
                <img
                  src={getSteamHeaderImage(selectedGame.appid)}
                  alt={selectedGame.name}
                  className="selected-game-banner-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="selected-game-banner-info">
                  <div className="selected-game-badge">JOGO SELECIONADO</div>
                  <h2 className="selected-game-name">{selectedGame.name}</h2>
                  <div className="selected-game-meta">
                    <span>AppID: <code>{selectedGame.appid}</code></span>
                    <span>•</span>
                    <a
                      href={`https://store.steampowered.com/app/${selectedGame.appid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="selected-game-link"
                    >
                      Página oficial na Loja Steam ↗
                    </a>
                  </div>
                </div>

                <div className="selected-game-actions">
                  <button
                    className="btn-refresh-prices"
                    onClick={() => handleSelectGame(selectedGame.appid, selectedGame.name)}
                    title="Recarregar cotações mais recentes"
                  >
                    <IconRefresh size={13} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
                    <span>Atualizar Cotações</span>
                  </button>
                </div>
              </div>
            )}

            {(countryPrices.length > 0 || isLoading) && (
              <div className="controls-bar">
                <div className="controls-left">
                  <CurrencyToggle value={referenceCurrency} onChange={setReferenceCurrency} />
                </div>
                <div className="controls-right">
                  {countryPrices.length > 0 && (
                    <span className="badge badge-neutral">
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', marginRight: '4px' }} />
                      {countryPrices.length} regiões com preço oficial disponível
                    </span>
                  )}
                </div>
              </div>
            )}

            {stats && (
              <div className="gaming-stats-grid animate-fade-in">
                <div className="gaming-stat-card card-cheapest">
                  <div className="gaming-stat-top">
                    <span className="gaming-stat-flag">{stats.cheapest.country.flag}</span>
                    <span className="gaming-stat-tag tag-green">MAIS BARATO</span>
                  </div>
                  <div className="gaming-stat-country">{stats.cheapest.country.name}</div>
                  <div className="gaming-stat-price">
                    {formatReferencePrice(stats.cheapPrice, referenceCurrency)}
                  </div>
                  <div className="gaming-stat-note">
                    Moeda local: {stats.cheapest.localCurrency}
                  </div>
                </div>

                <div className="gaming-stat-card card-expensive">
                  <div className="gaming-stat-top">
                    <span className="gaming-stat-flag">{stats.mostExpensive.country.flag}</span>
                    <span className="gaming-stat-tag tag-red">MAIS CARO</span>
                  </div>
                  <div className="gaming-stat-country">{stats.mostExpensive.country.name}</div>
                  <div className="gaming-stat-price">
                    {formatReferencePrice(stats.expPrice, referenceCurrency)}
                  </div>
                  <div className="gaming-stat-note">
                    Moeda local: {stats.mostExpensive.localCurrency}
                  </div>
                </div>

                <div className="gaming-stat-card card-difference">
                  <div className="gaming-stat-top">
                    <IconZap size={20} className="gaming-stat-icon" style={{ color: '#c084fc' }} />
                    <span className="gaming-stat-tag tag-purple">DISCREPÂNCIA</span>
                  </div>
                  <div className="gaming-stat-country">Diferença Máxima</div>
                  <div className="gaming-stat-price highlight-purple">
                    {stats.diffPercent.toFixed(0)}%
                  </div>
                  <div className="gaming-stat-note">
                    Economia de {formatReferencePrice(stats.economyValue, referenceCurrency)}
                  </div>
                </div>
              </div>
            )}

            <PriceTable
              prices={countryPrices}
              referenceCurrency={referenceCurrency}
              isLoading={isLoading}
            />

            {countryPrices.length > 0 && (
              <div className="info-banner" style={{ marginTop: 'var(--space-6)' }}>
                <span className="info-banner-icon">ℹ️</span>
                <div>
                  Preços obtidos diretamente dos servidores oficiais da Steam e convertidos para {referenceCurrency === 'BRL' ? 'Reais (BRL)' : 'Dólar (USD)'}. Cotações atualizadas em cache por 6 horas.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

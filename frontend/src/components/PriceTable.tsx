import { useState, useMemo } from 'react';
import type { CountryPrice, SortConfig, ReferenceCurrency } from '../lib/types';
import { formatPrice, formatReferencePrice, formatDiffPercent, getDiffClass } from '../lib/currency';

interface PriceTableProps {
  prices: CountryPrice[];
  referenceCurrency: ReferenceCurrency;
  isLoading?: boolean;
}

export default function PriceTable({ prices, referenceCurrency, isLoading }: PriceTableProps) {
  const [sort, setSort] = useState<SortConfig>({ key: 'converted', direction: 'asc' });

  function handleSort(key: string) {
    setSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  function getSortIndicator(key: string): string {
    if (sort.key !== key) return '↕';
    return sort.direction === 'asc' ? '↑' : '↓';
  }

  const sortedPrices = useMemo(() => {
    const arr = [...prices];

    arr.sort((a, b) => {
      let valA: number | string;
      let valB: number | string;

      switch (sort.key) {
        case 'country':
          valA = a.country.name;
          valB = b.country.name;
          return sort.direction === 'asc'
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        case 'local':
          valA = a.localPrice;
          valB = b.localPrice;
          break;
        case 'converted':
          valA = referenceCurrency === 'USD' ? a.convertedPriceUSD : a.convertedPriceBRL;
          valB = referenceCurrency === 'USD' ? b.convertedPriceUSD : b.convertedPriceBRL;
          break;
        case 'diff':
          valA = a.diffFromMax;
          valB = b.diffFromMax;
          break;
        default:
          return 0;
      }

      const numA = valA as number;
      const numB = valB as number;
      return sort.direction === 'asc' ? numA - numB : numB - numA;
    });

    return arr;
  }, [prices, sort, referenceCurrency]);

  const { minIdx, maxIdx } = useMemo(() => {
    if (sortedPrices.length === 0) return { minIdx: -1, maxIdx: -1 };

    let min = Infinity, max = -Infinity;
    let minI = 0, maxI = 0;

    sortedPrices.forEach((p, i) => {
      const val = referenceCurrency === 'USD' ? p.convertedPriceUSD : p.convertedPriceBRL;
      if (val < min) { min = val; minI = i; }
      if (val > max) { max = val; maxI = i; }
    });

    return { minIdx: minI, maxIdx: maxI };
  }, [sortedPrices, referenceCurrency]);

  if (isLoading) {
    return (
      <div className="price-table-wrapper">
        <table className="price-table">
          <thead>
            <tr>
              <th>País</th>
              <th>Preço Local</th>
              <th>Em {referenceCurrency === 'BRL' ? 'Reais (BRL)' : referenceCurrency}</th>
              <th>Diferença</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                <td><div className="skeleton skeleton-text" style={{ width: '120px' }} /></td>
                <td><div className="skeleton skeleton-text short" /></td>
                <td><div className="skeleton skeleton-text short" /></td>
                <td><div className="skeleton skeleton-text short" style={{ width: '60px' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (prices.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <div className="empty-state-title">Nenhum jogo selecionado</div>
        <div className="empty-state-desc">
          Busque um jogo pelo nome ou AppID acima para visualizar os preços regionais em R$.
        </div>
      </div>
    );
  }

  return (
    <div className="price-table-wrapper animate-fade-in">
      <table className="price-table">
        <thead>
          <tr>
            <th
              className={sort.key === 'country' ? 'sorted' : ''}
              onClick={() => handleSort('country')}
            >
              País
              <span className="sort-indicator">{getSortIndicator('country')}</span>
            </th>
            <th
              className={sort.key === 'local' ? 'sorted' : ''}
              onClick={() => handleSort('local')}
            >
              Preço Local
              <span className="sort-indicator">{getSortIndicator('local')}</span>
            </th>
            <th
              className={sort.key === 'converted' ? 'sorted' : ''}
              onClick={() => handleSort('converted')}
            >
              Em {referenceCurrency === 'BRL' ? 'Reais (BRL)' : referenceCurrency}
              <span className="sort-indicator">{getSortIndicator('converted')}</span>
            </th>
            <th
              className={sort.key === 'diff' ? 'sorted' : ''}
              onClick={() => handleSort('diff')}
            >
              vs Mais Caro
              <span className="sort-indicator">{getSortIndicator('diff')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedPrices.map((p, i) => {
            const convertedPrice = referenceCurrency === 'USD'
              ? p.convertedPriceUSD
              : p.convertedPriceBRL;
            const rowClass = i === minIdx ? 'row-cheapest' : i === maxIdx ? 'row-expensive' : '';

            return (
              <tr key={p.country.code} className={rowClass}>
                <td>
                  <div className="country-cell">
                    <span className="country-flag">{p.country.flag}</span>
                    <span className="country-name">{p.country.name}</span>
                    {i === minIdx && (
                      <span className="badge badge-success">Mais Barato</span>
                    )}
                    {i === maxIdx && (
                      <span className="badge badge-danger">Mais Caro</span>
                    )}
                  </div>
                </td>
                <td className="price-local">
                  {formatPrice(p.localPrice, p.localCurrency)}
                  {p.discountPercent > 0 && (
                    <span className="badge badge-success" style={{ marginLeft: '8px' }}>
                      -{p.discountPercent}%
                    </span>
                  )}
                </td>
                <td className="price-converted">
                  {formatReferencePrice(convertedPrice, referenceCurrency)}
                </td>
                <td>
                  <span className={`price-diff ${getDiffClass(p.diffFromMax)}`}>
                    {formatDiffPercent(p.diffFromMax)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

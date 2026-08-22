import { useState, useEffect, useMemo } from 'react';
import CurrencyToggle from '../components/CurrencyToggle';
import { COUNTRIES } from '../lib/countries';
import { convertToReference, formatPrice, formatReferencePrice, formatDiffPercent, getDiffClass } from '../lib/currency';
import type { AIPriceData, ReferenceCurrency, SortConfig } from '../lib/types';

export default function AIComparePage() {
  const [referenceCurrency, setReferenceCurrency] = useState<ReferenceCurrency>('BRL');
  const [data, setData] = useState<AIPriceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'byService'>('table');
  const [sort, setSort] = useState<SortConfig>({ key: 'country', direction: 'asc' });

  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    const jsonUrl = `${base.endsWith('/') ? base : base + '/'}data/ai-prices.json`;
    fetch(jsonUrl)
      .then(res => res.json())
      .then((json: AIPriceData) => {
        setData(json);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load AI prices:', err);
        setIsLoading(false);
      });
  }, []);

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

  const tableData = useMemo(() => {
    if (!data) return [];

    return COUNTRIES.map(country => {
      const row: {
        country: typeof country;
        services: Record<string, { localAmount: number; localCurrency: string; converted: number; note?: string } | null>;
      } = {
        country,
        services: {},
      };

      for (const service of data.services) {
        const price = service.prices[country.code];
        if (price) {
          row.services[service.id] = {
            localAmount: price.amount,
            localCurrency: price.currency,
            converted: convertToReference(price.amount, price.currency, referenceCurrency),
            note: price.note,
          };
        } else {
          row.services[service.id] = null;
        }
      }

      return row;
    });
  }, [data, referenceCurrency]);

  const sortedTableData = useMemo(() => {
    const arr = [...tableData];

    arr.sort((a, b) => {
      if (sort.key === 'country') {
        const comp = a.country.name.localeCompare(b.country.name);
        return sort.direction === 'asc' ? comp : -comp;
      }

      const aVal = a.services[sort.key]?.converted ?? Infinity;
      const bVal = b.services[sort.key]?.converted ?? Infinity;
      return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return arr;
  }, [tableData, sort]);

  const cheapestPerService = useMemo(() => {
    if (!data) return {};
    const result: Record<string, { code: string; price: number }> = {};

    for (const service of data.services) {
      let min = Infinity;
      let minCode = '';

      for (const row of tableData) {
        const s = row.services[service.id];
        if (s && s.converted < min) {
          min = s.converted;
          minCode = row.country.code;
        }
      }

      result[service.id] = { code: minCode, price: min };
    }

    return result;
  }, [data, tableData]);

  const expensivePerService = useMemo(() => {
    if (!data) return {};
    const result: Record<string, { code: string; price: number }> = {};

    for (const service of data.services) {
      let max = -Infinity;
      let maxCode = '';

      for (const row of tableData) {
        const s = row.services[service.id];
        if (s && s.converted > max) {
          max = s.converted;
          maxCode = row.country.code;
        }
      }

      result[service.id] = { code: maxCode, price: max };
    }

    return result;
  }, [data, tableData]);

  if (isLoading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading-overlay">
            <div className="spinner spinner-lg" />
            <p>Carregando preços de assinaturas de IA...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">❌</div>
            <div className="empty-state-title">Erro ao carregar dados</div>
            <div className="empty-state-desc">
              Não foi possível carregar o arquivo com os preços de IA.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h2 className="section-title">🤖 Comparador de Assinaturas de IA</h2>
        <p className="section-subtitle">
          Compare os preços de Claude Pro, ChatGPT Plus e Gemini Advanced convertidos em Reais (BRL)
        </p>

        <div className="info-banner">
          <span className="info-banner-icon">📋</span>
          <div>
            <strong>Fonte dos dados:</strong> Preços compilados das páginas oficiais de cada serviço.
            Última atualização: <strong>{data.lastUpdated}</strong>.
            Valores convertidos para Reais (BRL) para facilitar a comparação.
          </div>
        </div>

        <div className="controls-bar">
          <div className="controls-left">
            <CurrencyToggle value={referenceCurrency} onChange={setReferenceCurrency} />
            <div className="toggle-group">
              <button
                className={`toggle-option ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                📊 Tabela Geral
              </button>
              <button
                className={`toggle-option ${viewMode === 'byService' ? 'active' : ''}`}
                onClick={() => setViewMode('byService')}
              >
                📋 Por Serviço
              </button>
            </div>
          </div>
        </div>

        <div className="stats-bar animate-fade-in">
          {data.services.map(service => {
            const cheap = cheapestPerService[service.id];
            const exp = expensivePerService[service.id];
            const diffPct = exp && cheap && exp.price > 0
              ? ((exp.price - cheap.price) / exp.price) * 100
              : 0;

            const cheapCountry = COUNTRIES.find(c => c.code === cheap?.code);

            return (
              <div key={service.id} className="glass-card stat-card">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  marginBottom: 'var(--space-2)',
                }}>
                  <span
                    className="service-dot"
                    style={{ background: service.color } as React.CSSProperties}
                  />
                  <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                    {service.name}
                  </span>
                </div>
                <div className="stat-value green" style={{ fontSize: 'var(--font-size-2xl)' }}>
                  {cheapCountry?.flag} {cheap ? formatReferencePrice(cheap.price, referenceCurrency) : '—'}
                </div>
                <div className="stat-label">
                  Mais Barato · Até {diffPct.toFixed(0)}% de diferença
                </div>
              </div>
            );
          })}
        </div>

        {viewMode === 'table' && (
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
                  {data.services.map(service => (
                    <th
                      key={service.id}
                      className={sort.key === service.id ? 'sorted' : ''}
                      onClick={() => handleSort(service.id)}
                      style={{ textAlign: 'center' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <span style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: service.color,
                          marginBottom: '2px',
                        }} />
                        <span>{service.name}</span>
                        <span style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-muted)',
                          fontWeight: 400,
                          textTransform: 'none',
                          letterSpacing: 0,
                        }}>
                          {service.provider}
                        </span>
                      </div>
                      <span className="sort-indicator">{getSortIndicator(service.id)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedTableData.map(row => (
                  <tr key={row.country.code}>
                    <td>
                      <div className="country-cell">
                        <span className="country-flag">{row.country.flag}</span>
                        <span className="country-name">{row.country.name}</span>
                      </div>
                    </td>
                    {data.services.map(service => {
                      const cell = row.services[service.id];
                      if (!cell) {
                        return (
                          <td key={service.id} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            —
                          </td>
                        );
                      }

                      const cheap = cheapestPerService[service.id];
                      const exp = expensivePerService[service.id];
                      const isCheapest = row.country.code === cheap?.code;
                      const isExpensive = row.country.code === exp?.code;

                      const diff = cheap && cheap.price > 0
                        ? ((cell.converted - cheap.price) / cheap.price) * 100
                        : 0;

                      return (
                        <td key={service.id} style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                            <span style={{ fontWeight: 600 }}>
                              {formatReferencePrice(cell.converted, referenceCurrency)}
                            </span>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                              {formatPrice(cell.localAmount, cell.localCurrency)}
                            </span>
                            {isCheapest && (
                              <span className="badge badge-success" style={{ marginTop: '2px' }}>Mais Barato</span>
                            )}
                            {isExpensive && (
                              <span className="badge badge-danger" style={{ marginTop: '2px' }}>Mais Caro</span>
                            )}
                            {!isCheapest && !isExpensive && diff > 5 && (
                              <span
                                style={{
                                  fontSize: 'var(--font-size-xs)',
                                  fontWeight: 600,
                                }}
                                className={`price-diff ${getDiffClass(diff)}`}
                              >
                                {formatDiffPercent(diff)}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'byService' && (
          <div className="ai-services-grid animate-fade-in">
            {data.services.map(service => {
              const rows = tableData
                .map(row => ({
                  country: row.country,
                  data: row.services[service.id],
                }))
                .filter(r => r.data !== null)
                .sort((a, b) => (a.data?.converted ?? 0) - (b.data?.converted ?? 0));

              return (
                <div key={service.id} className="glass-card">
                  <div className="ai-service-header">
                    <span
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        background: service.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        color: 'white',
                      }}
                    >
                      {service.name[0]}
                    </span>
                    <div>
                      <div className="ai-service-name">{service.name}</div>
                      <div className="ai-service-provider">{service.provider}</div>
                    </div>
                  </div>

                  <table className="price-table" style={{ fontSize: 'var(--font-size-sm)' }}>
                    <thead>
                      <tr>
                        <th style={{ fontSize: 'var(--font-size-xs)' }}>País</th>
                        <th style={{ fontSize: 'var(--font-size-xs)', textAlign: 'right' }}>Preço em {referenceCurrency === 'BRL' ? 'R$' : '$'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr
                          key={r.country.code}
                          className={
                            i === 0 ? 'row-cheapest' :
                            i === rows.length - 1 ? 'row-expensive' : ''
                          }
                        >
                          <td>
                            <div className="country-cell">
                              <span className="country-flag">{r.country.flag}</span>
                              <span className="country-name">{r.country.name}</span>
                              {i === 0 && <span className="badge badge-success">Mais Barato</span>}
                              {i === rows.length - 1 && <span className="badge badge-danger">Mais Caro</span>}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 600 }}>
                              {formatReferencePrice(r.data!.converted, referenceCurrency)}
                            </div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                              {formatPrice(r.data!.localAmount, r.data!.localCurrency)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

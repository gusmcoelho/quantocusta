import type { ReferenceCurrency } from './types';

const EXCHANGE_RATES_TO_USD: Record<string, number> = {
  USD: 1,
  BRL: 5.45,
  ARS: 950,
  TRY: 34.5,
  INR: 84.5,
  RUB: 96,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 156,
  KRW: 1380,
  AUD: 1.55,
  MXN: 17.8,
  CLP: 945,
  COP: 4100,
  PLN: 4.05,
  UAH: 41.5,
  ZAR: 18.2,
  EGP: 49.5,
};

export function convertToUSD(amount: number, fromCurrency: string): number {
  const rate = EXCHANGE_RATES_TO_USD[fromCurrency];
  if (!rate) {
    console.warn(`Unknown currency: ${fromCurrency}, returning amount as-is`);
    return amount;
  }
  return amount / rate;
}

export function convertToBRL(amount: number, fromCurrency: string): number {
  const usd = convertToUSD(amount, fromCurrency);
  return usd * EXCHANGE_RATES_TO_USD.BRL;
}

export function convertToReference(amount: number, fromCurrency: string, ref: ReferenceCurrency): number {
  if (ref === 'USD') return convertToUSD(amount, fromCurrency);
  return convertToBRL(amount, fromCurrency);
}

export function formatPrice(amount: number, currency: string): string {
  try {
    const localeMap: Record<string, string> = {
      USD: 'en-US',
      BRL: 'pt-BR',
      ARS: 'es-AR',
      TRY: 'tr-TR',
      INR: 'en-IN',
      RUB: 'ru-RU',
      EUR: 'de-DE',
      GBP: 'en-GB',
      JPY: 'ja-JP',
      KRW: 'ko-KR',
      AUD: 'en-AU',
      MXN: 'es-MX',
      CLP: 'es-CL',
      COP: 'es-CO',
      PLN: 'pl-PL',
      UAH: 'uk-UA',
      ZAR: 'en-ZA',
      EGP: 'ar-EG',
    };

    const locale = localeMap[currency] || 'en-US';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'JPY' || currency === 'KRW' || currency === 'CLP' || currency === 'COP' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' || currency === 'KRW' || currency === 'CLP' || currency === 'COP' ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatReferencePrice(amount: number, ref: ReferenceCurrency): string {
  return formatPrice(amount, ref);
}

export function formatDiffPercent(diff: number): string {
  const sign = diff > 0 ? '+' : '';
  return `${sign}${diff.toFixed(1)}%`;
}

export function getDiffClass(diff: number): string {
  if (diff <= -20) return 'cheap';
  if (diff >= 20) return 'expensive';
  return 'mid';
}

export function getAvailableCurrencies(): string[] {
  return Object.keys(EXCHANGE_RATES_TO_USD);
}

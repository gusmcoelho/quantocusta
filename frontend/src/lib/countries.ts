import type { Country } from './types';

export const COUNTRIES: Country[] = [
  { code: 'us', name: 'Estados Unidos',    nameEn: 'United States',   flag: '🇺🇸', currency: 'USD', steamCC: 'us' },
  { code: 'br', name: 'Brasil',            nameEn: 'Brazil',          flag: '🇧🇷', currency: 'BRL', steamCC: 'br' },
  { code: 'ar', name: 'Argentina',          nameEn: 'Argentina',       flag: '🇦🇷', currency: 'ARS', steamCC: 'ar' },
  { code: 'tr', name: 'Turquia',           nameEn: 'Turkey',          flag: '🇹🇷', currency: 'TRY', steamCC: 'tr' },
  { code: 'in', name: 'Índia',             nameEn: 'India',           flag: '🇮🇳', currency: 'INR', steamCC: 'in' },
  { code: 'ru', name: 'Rússia',            nameEn: 'Russia',          flag: '🇷🇺', currency: 'RUB', steamCC: 'ru' },
  { code: 'de', name: 'Alemanha (UE)',      nameEn: 'Germany (EU)',    flag: '🇩🇪', currency: 'EUR', steamCC: 'de' },
  { code: 'gb', name: 'Reino Unido',       nameEn: 'United Kingdom',  flag: '🇬🇧', currency: 'GBP', steamCC: 'gb' },
  { code: 'jp', name: 'Japão',             nameEn: 'Japan',           flag: '🇯🇵', currency: 'JPY', steamCC: 'jp' },
  { code: 'kr', name: 'Coreia do Sul',     nameEn: 'South Korea',     flag: '🇰🇷', currency: 'KRW', steamCC: 'kr' },
  { code: 'au', name: 'Austrália',         nameEn: 'Australia',       flag: '🇦🇺', currency: 'AUD', steamCC: 'au' },
  { code: 'mx', name: 'México',            nameEn: 'Mexico',          flag: '🇲🇽', currency: 'MXN', steamCC: 'mx' },
  { code: 'cl', name: 'Chile',             nameEn: 'Chile',           flag: '🇨🇱', currency: 'CLP', steamCC: 'cl' },
  { code: 'co', name: 'Colômbia',          nameEn: 'Colombia',        flag: '🇨🇴', currency: 'COP', steamCC: 'co' },
  { code: 'pl', name: 'Polônia',           nameEn: 'Poland',          flag: '🇵🇱', currency: 'PLN', steamCC: 'pl' },
  { code: 'ua', name: 'Ucrânia',           nameEn: 'Ukraine',         flag: '🇺🇦', currency: 'UAH', steamCC: 'ua' },
  { code: 'za', name: 'África do Sul',     nameEn: 'South Africa',    flag: '🇿🇦', currency: 'ZAR', steamCC: 'za' },
  { code: 'eg', name: 'Egito',             nameEn: 'Egypt',           flag: '🇪🇬', currency: 'EGP', steamCC: 'eg' },
];

export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

export function getAllSteamCCs(): string {
  return COUNTRIES.map(c => c.steamCC).join(',');
}

export interface Country {
  code: string;
  name: string;
  nameEn: string;
  flag: string;
  currency: string;
  steamCC: string;
}

export interface SteamPriceOverview {
  currency: string;
  initial: number;
  final: number;
  discount_percent: number;
  initial_formatted: string;
  final_formatted: string;
}

export interface SteamPriceResult {
  success: boolean;
  price_overview: SteamPriceOverview | null;
  error?: string;
}

export interface SteamPriceResponse {
  appid: string;
  results: Record<string, SteamPriceResult>;
}

export interface SteamSearchItem {
  id: number;
  name: string;
  tiny_image: string;
  price?: {
    final: number;
    currency: string;
  };
}

export interface SteamSearchResponse {
  total: number;
  items: SteamSearchItem[];
}

export interface CountryPrice {
  country: Country;
  localPrice: number;
  localCurrency: string;
  convertedPriceUSD: number;
  convertedPriceBRL: number;
  discountPercent: number;
  diffFromMax: number;
  originalPrice?: number;
}

export interface AIServicePrice {
  amount: number;
  currency: string;
  period: 'monthly' | 'annual';
  note?: string;
}

export interface AIService {
  id: string;
  name: string;
  provider: string;
  color: string;
  prices: Record<string, AIServicePrice>;
}

export interface AIPriceData {
  lastUpdated: string;
  source: string;
  services: AIService[];
}

export type SortDirection = 'asc' | 'desc';
export type ReferenceCurrency = 'USD' | 'BRL';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

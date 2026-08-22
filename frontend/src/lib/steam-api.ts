import type { SteamPriceResponse, SteamSearchResponse, SteamSearchItem } from './types';
import { getCache, setCache, CACHE_TTL, steamPriceCacheKey, steamSearchCacheKey } from './cache';
import { getAllSteamCCs } from './countries';

const PROXY_BASE_URL = import.meta.env.VITE_PROXY_URL || (import.meta.env.DEV ? 'http://localhost:8787' : 'https://quantocusta.gustavomoreiraw.workers.dev');

export async function fetchSteamPricesAllCountries(appid: string): Promise<SteamPriceResponse> {
  const countries = getAllSteamCCs();
  const cacheKey = steamPriceCacheKey(appid, countries);

  const cached = getCache<SteamPriceResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  const url = `${PROXY_BASE_URL}/api/steam-price?appid=${encodeURIComponent(appid)}&cc=${encodeURIComponent(countries)}`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limited by Steam. Please wait a few minutes and try again.');
    }
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data: SteamPriceResponse = await response.json();

  setCache(cacheKey, data, CACHE_TTL.STEAM_PRICE);

  return data;
}

export async function searchSteamGame(term: string): Promise<SteamSearchItem[]> {
  if (!term.trim()) return [];

  const cacheKey = steamSearchCacheKey(term);
  const cached = getCache<SteamSearchItem[]>(cacheKey);
  if (cached) return cached;

  const url = `${PROXY_BASE_URL}/api/steam-search?term=${encodeURIComponent(term.trim())}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Search API error: ${response.status}`);
  }

  const data: SteamSearchResponse = await response.json();
  const items = data.items || [];

  setCache(cacheKey, items, CACHE_TTL.STEAM_SEARCH);

  return items;
}

export function getSteamStoreUrl(appid: string | number): string {
  return `https://store.steampowered.com/app/${appid}`;
}

export function getSteamHeaderImage(appid: string | number): string {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`;
}

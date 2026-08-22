const CACHE_PREFIX = 'pricecomp_';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const CACHE_TTL = {
  STEAM_PRICE: 6 * 60 * 60 * 1000,
  STEAM_SEARCH: 30 * 60 * 1000,
  AI_PRICES: 24 * 60 * 60 * 1000,
  EXCHANGE_RATES: 12 * 60 * 60 * 1000,
} as const;

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (e) {
    cleanupExpiredCache();
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlMs,
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch {
      console.warn('Cache write failed after cleanup:', e);
    }
  }
}

export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    const age = Date.now() - entry.timestamp;

    if (age > entry.ttl) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export function removeCache(key: string): void {
  localStorage.removeItem(CACHE_PREFIX + key);
}

export function cleanupExpiredCache(): void {
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(CACHE_PREFIX)) continue;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const entry: CacheEntry<unknown> = JSON.parse(raw);
      const age = Date.now() - entry.timestamp;

      if (age > entry.ttl) {
        keysToRemove.push(key);
      }
    } catch {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(k => localStorage.removeItem(k));
}

export function clearAllCache(): void {
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(k => localStorage.removeItem(k));
}

export function steamPriceCacheKey(appid: string, countries: string): string {
  return `steam_price_${appid}_${countries}`;
}

export function steamSearchCacheKey(term: string): string {
  return `steam_search_${term.toLowerCase().trim()}`;
}

cleanupExpiredCache();

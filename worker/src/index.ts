interface Env {
  ALLOWED_ORIGINS: string;
  CACHE_TTL_SECONDS: string;
}

const STEAM_API_BASE = "https://store.steampowered.com";

function corsHeaders(origin: string | null, allowedOrigins: string): HeadersInit {
  const headers: HeadersInit = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };

  if (allowedOrigins === "*") {
    headers["Access-Control-Allow-Origin"] = "*";
  } else {
    const allowed = allowedOrigins.split(",").map((o) => o.trim());
    if (origin && allowed.includes(origin)) {
      headers["Access-Control-Allow-Origin"] = origin;
    }
  }

  return headers;
}

function jsonResponse(data: unknown, status: number, origin: string | null, env: Env): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin, env.ALLOWED_ORIGINS),
    },
  });
}

async function handleSteamPrice(
  appid: string,
  cc: string,
  origin: string | null,
  env: Env
): Promise<Response> {
  const countries = cc.split(",").map((c) => c.trim().toLowerCase()).filter(Boolean);

  if (countries.length === 0) {
    return jsonResponse({ error: "Missing 'cc' parameter" }, 400, origin, env);
  }

  if (countries.length > 20) {
    return jsonResponse({ error: "Too many country codes (max 20)" }, 400, origin, env);
  }

  const results: Record<string, unknown> = {};

  const fetches = countries.map(async (country) => {
    const url = `${STEAM_API_BASE}/api/appdetails?appids=${appid}&cc=${country}&filters=price_overview`;
    try {
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "SteamPriceProxy/1.0",
        },
      });

      if (resp.status === 429) {
        results[country] = { error: "rate_limited", status: 429 };
        return;
      }

      if (!resp.ok) {
        results[country] = { error: "steam_error", status: resp.status };
        return;
      }

      const data = await resp.json() as Record<string, { success: boolean; data?: { price_overview?: unknown } }>;
      const appData = data[appid];

      if (!appData || !appData.success) {
        results[country] = { error: "not_found", success: false };
        return;
      }

      results[country] = {
        success: true,
        price_overview: appData.data?.price_overview || null,
      };
    } catch (err) {
      results[country] = { error: "fetch_failed", message: String(err) };
    }
  });

  await Promise.all(fetches);

  return jsonResponse({ appid, results }, 200, origin, env);
}

async function handleSteamSearch(
  term: string,
  origin: string | null,
  env: Env
): Promise<Response> {
  const url = `${STEAM_API_BASE}/api/storesearch/?term=${encodeURIComponent(term)}&l=english&cc=us`;

  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "SteamPriceProxy/1.0",
      },
    });

    if (resp.status === 429) {
      return jsonResponse({ error: "Rate limited by Steam" }, 429, origin, env);
    }

    if (!resp.ok) {
      return jsonResponse({ error: "Steam API error", status: resp.status }, resp.status, origin, env);
    }

    const data = await resp.json();
    return jsonResponse(data, 200, origin, env);
  } catch (err) {
    return jsonResponse({ error: "Fetch failed", message: String(err) }, 500, origin, env);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, env.ALLOWED_ORIGINS),
      });
    }

    if (request.method !== "GET") {
      return jsonResponse({ error: "Method not allowed" }, 405, origin, env);
    }

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    const cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
      const newHeaders = new Headers(cachedResponse.headers);
      const cors = corsHeaders(origin, env.ALLOWED_ORIGINS);
      for (const [key, value] of Object.entries(cors)) {
        newHeaders.set(key, value);
      }
      newHeaders.set("X-Cache", "HIT");
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        headers: newHeaders,
      });
    }

    let response: Response;

    if (url.pathname === "/api/steam-price") {
      const appid = url.searchParams.get("appid");
      const cc = url.searchParams.get("cc");

      if (!appid) {
        return jsonResponse({ error: "Missing 'appid' parameter" }, 400, origin, env);
      }
      if (!cc) {
        return jsonResponse({ error: "Missing 'cc' parameter" }, 400, origin, env);
      }

      response = await handleSteamPrice(appid, cc, origin, env);
    } else if (url.pathname === "/api/steam-search") {
      const term = url.searchParams.get("term");

      if (!term) {
        return jsonResponse({ error: "Missing 'term' parameter" }, 400, origin, env);
      }

      response = await handleSteamSearch(term, origin, env);
    } else if (url.pathname === "/" || url.pathname === "/health") {
      return jsonResponse({ status: "ok", version: "1.0.0" }, 200, origin, env);
    } else {
      return jsonResponse({ error: "Not found" }, 404, origin, env);
    }

    if (response.status === 200) {
      const ttl = parseInt(env.CACHE_TTL_SECONDS) || 3600;
      const bodyText = await response.text();

      const responseToCache = new Response(bodyText, {
        status: response.status,
        headers: new Headers(response.headers),
      });
      responseToCache.headers.set("Cache-Control", `s-maxage=${ttl}`);

      const returnHeaders = new Headers(response.headers);
      returnHeaders.set("X-Cache", "MISS");
      const returnResponse = new Response(bodyText, {
        status: response.status,
        headers: returnHeaders,
      });

      try {
        await cache.put(cacheKey, responseToCache);
      } catch (err) {
        console.warn("Cache put failed:", err);
      }

      return returnResponse;
    }

    return response;
  },
};

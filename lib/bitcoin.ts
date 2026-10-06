const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur";

export const MARKET_PRICE_CACHE_SECONDS = 300;

type CoinGeckoResponse = {
  bitcoin?: {
    eur?: number;
  };
};

type CachedPrice = {
  value: number;
  fetchedAt: number;
};

let memoryCache: CachedPrice | null = null;
let inFlightRequest: Promise<number> | null = null;

async function requestBitcoinEurPrice(): Promise<number> {
  const response = await fetch(COINGECKO_URL, {
    next: { revalidate: MARKET_PRICE_CACHE_SECONDS },
    headers: {
      Accept: "application/json",
      "User-Agent": "lmp/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko returned HTTP ${response.status}`);
  }

  const data = (await response.json()) as CoinGeckoResponse;
  const price = Number(data.bitcoin?.eur);

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("CoinGecko returned an invalid Bitcoin EUR price");
  }

  return price;
}

export async function getBitcoinEurPrice(): Promise<number | null> {
  if (memoryCache) {
    const ageMs = Date.now() - memoryCache.fetchedAt;

    if (ageMs < MARKET_PRICE_CACHE_SECONDS * 1000) {
      return memoryCache.value;
    }
  }

  if (!inFlightRequest) {
    inFlightRequest = requestBitcoinEurPrice()
      .then((price) => {
        memoryCache = {
          value: price,
          fetchedAt: Date.now(),
        };

        return price;
      })
      .finally(() => {
        inFlightRequest = null;
      });
  }

  try {
    return await inFlightRequest;
  } catch {
    return memoryCache?.value ?? null;
  }
}

export function getBitcoinPriceCacheAgeSeconds(): number | null {
  if (!memoryCache) {
    return null;
  }

  return Math.max(0, Math.floor((Date.now() - memoryCache.fetchedAt) / 1000));
}


export function eurToBitcoin(eur: number, bitcoinEurPrice: number | null): number | null {
  if (!bitcoinEurPrice || bitcoinEurPrice <= 0) return null;
  return eur / bitcoinEurPrice;
}

export function formatBitcoin(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toFixed(8);
}

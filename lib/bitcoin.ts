const BITCOIN_PRICE_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";

export async function getBitcoinUsdPrice(): Promise<number | null> {
  try {
    const response = await fetch(BITCOIN_PRICE_URL, { next: { revalidate: 300 } });
    if (!response.ok) return null;
    const data = (await response.json()) as { bitcoin?: { usd?: number } };
    const price = Number(data.bitcoin?.usd);
    return Number.isFinite(price) && price > 0 ? price : null;
  } catch {
    return null;
  }
}

export function usdToBitcoin(usd: number, bitcoinUsdPrice: number | null): number | null {
  if (!bitcoinUsdPrice || bitcoinUsdPrice <= 0) return null;
  return usd / bitcoinUsdPrice;
}

export function formatBitcoin(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toFixed(8);
}

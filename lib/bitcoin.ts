const BITCOIN_PRICE_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur";

export async function getBitcoinEurPrice(): Promise<number | null> {
  try {
    const response = await fetch(BITCOIN_PRICE_URL, { cache: "no-store", next: { revalidate: 300, } });
    if (!response.ok) return null;
    const data = (await response.json()) as { bitcoin?: { eur?: number } };
    const price = Number(data.bitcoin?.eur);
    return Number.isFinite(price) && price > 0 ? price : null;
  } catch {
    return null;
  }
}

export function eurToBitcoin(eur: number, bitcoinEurPrice: number | null): number | null {
  if (!bitcoinEurPrice || bitcoinEurPrice <= 0) return null;
  return eur / bitcoinEurPrice;
}

export function formatBitcoin(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toFixed(8);
}

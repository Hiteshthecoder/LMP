import { getBitcoinUsdPrice } from "@/lib/bitcoin";
import { BalancePageClient } from "@/components/BalancePageClient";

export default async function BalancePage() {
  const bitcoinUsdPrice = await getBitcoinUsdPrice();

  return <BalancePageClient bitcoinUsdPrice={bitcoinUsdPrice} />;
}
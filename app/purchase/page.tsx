import { notFound } from "next/navigation";
import { PurchasePage } from "@/components/PurchasePage";
import { getProductPageData } from "@/lib/product-page";
import { getBitcoinUsdPrice } from "@/lib/bitcoin";

export default async function PurchaseRoute({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product: productId } = await searchParams;

  if (!productId) {
    notFound();
  }

  const product = await getProductPageData(productId);

  if (!product) {
    notFound();
  }

  const bitcoinUsdPrice = await getBitcoinUsdPrice();

  return <PurchasePage product={product} bitcoinUsdPrice={bitcoinUsdPrice} />;
}

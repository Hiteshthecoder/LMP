"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";

export function BuyButton({ productId }: { productId: string }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  const handleBuy = () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/products/${productId}`)}`);
      return;
    }
    router.push(`/purchase?product=${encodeURIComponent(productId)}`);
  };

  return (
    <button className="buy-button" type="button" disabled={loading} onClick={handleBuy}>
      🛒 &nbsp; {loading ? t("Checking…") : t("BUY")}
    </button>
  );
}

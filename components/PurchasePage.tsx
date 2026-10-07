"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useAuth } from "@/components/AuthProvider";
import { formatEur } from "@/lib/utils";
import { t } from "@/lib/text";
import type { ProductPageData } from "@/lib/product-page";
import { BitcoinEurPrice } from "./BitCoinEurPrice";

export function PurchasePage({
  product,
}: {
  product: ProductPageData;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [quantity, setQuantity] = useState(1);

  const [btcPriceSection, setBtcPriceSection] = useState(false);

  const unitPrice = Number(product.price) || 0;

  const total = unitPrice * quantity;

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(`/purchase?product=${product.id}`)}`);
    }
  }, [loading, user, router, product.id]);

  function increaseQuantity() {
    if (quantity <= 10) {
      setQuantity(prev => prev + 1);
    }
  }

  function decreaseQuantity() {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  }


  if (loading || !user) {
    return (
      <main className="page-shell purchase-page-shell">
        <div className="purchase-loading panel">{t("loadingAuthentication")}</div>
      </main>
    );
  }

  return (
    <main className="page-shell purchase-page-shell">
      <Breadcrumb items={["Create Order", product.name]} />

      <div className="purchase-layout">
        <aside className="purchase-sidebar">
          <section className="panel purchase-store-card">
            <div className="purchase-store-title">♙ {t("ABOUT VENDOR")}</div>
            <div className="purchase-store-identity">
              <div className="purchase-store-avatar">{(product.vendorName || "L").slice(0, 1).toUpperCase()}</div>
              <div>
                <strong>{product.vendorName || "LMP"}</strong>
              </div>
            </div>
            <div className="purchase-store-metrics">
              <div><strong>{product.deals}</strong><span>{t("SOLD")}</span></div>
            </div>
            <a className="purchase-store-back" href={`/products/${product.id}`}>{t("Back to store")}</a>
          </section>
        </aside>

        <section className="purchase-main">
          <div className="purchase-title">🛒 {t("Purchase Item")}</div>
          <section className="purchase-summary-grid">
            <div className="purchase-product-card">
              <Image
                src={product.image}
                alt={product.name}
                className="purchase-product-image"
                priority={true}
                width={160}
                height={166}
                sizes="(max-width: 560px) 260px, (max-width: 800px) 125px, 160px"
              />
              <div className="purchase-product-info">
                <h1>{product.name}</h1>
                <div className="purchase-product-facts">
                  <span><b>{t("category").toUpperCase()}</b> {product.category.replace(/[-_]/g, " ")}</span>
                  <span><b>{t("sold").toUpperCase()}</b> {product.deals} pcs</span>
                </div>

              </div>
            </div>

            <div className="purchase-confirm-card">
              <h2>{t("Confirm Order")}</h2>
              <div className="purchase-line"><span>{t("Price")}</span><strong>{formatEur(unitPrice)}</strong></div>
              <div className="purchase-line purchase-quantity-row">
                <span>{t("quantity")}</span>
                <div className="purchase-quantity-controls">
                  <button onClick={decreaseQuantity}>-</button>
                  <strong>{quantity} pcs</strong>
                  <button onClick={increaseQuantity}>+</button>
                </div>
              </div>
              <div className="purchase-line"><span>{t("Total Amount")}</span><strong>{formatEur(total)}</strong></div>
              <div className="purchase-payment-options">
                <button type="button" className="purchase-payment-option active">💳 {t("Escrow")}</button>
              </div>
              <div className="purchase-total-line"><span>{t("total")}</span><strong>{formatEur(total)}</strong></div>
            </div>
          </section>

          {btcPriceSection && <section className="purchase-btc-amount-summary">
            <h2>pls send {<BitcoinEurPrice eurAmount={product.price * quantity} quantity={quantity} />} BTC to the BitCoin QR and mail us the payment proof at  <a href="mailto:lemondeparallel@proton.me">
              lemondeparallel@proton.me
            </a></h2>
            <Image
              className="btc-qr-img"
              src="/btc-qr.png"
              quality={100}
              alt={product.name}
              width={250}
              height={250}
            />
            <div className="btc-add">
              <strong>Address :</strong>
              <div>bc1qr2uthxuv73hyzcudqa2m2h3qrsv8nn5r2nj4f4</div>
            </div>
          </section>}

          <section className="purchase-final-card">
            <button onClick={() => {
              if (!btcPriceSection == true) {
                setBtcPriceSection(true)
              }
            }} type="button" className="purchase-buy-button">{t("buy")}</button>
          </section>
        </section>
      </div>
    </main>
  );
}

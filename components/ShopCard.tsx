"use client";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/data/products";
import { formatEur, humanizeSlug } from "@/lib/utils";
import { t } from "@/lib/text";

export function ShopCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const category = humanizeSlug(product.category);

  return (
    <article className="shop-card">
      <div className="shop-name">
        {t(product.name)}
        {product.verified && <span className="verified">{t("✓ Verified")}</span>}
      </div>

      <div className="shop-body">
        <Image
          className="shop-image"
          src={product.image}
          alt={product.name}
          width={152}
          height={151}
          sizes="(max-width: 800px) 100vw, (max-width: 1100px) 220px, 270px"
          priority={priority}
        />

        <div className="shop-info">
          <div className="shop-detail-line">
            <strong>{t("Category:")}</strong> {t(category)}
          </div>

          <div className="shop-detail-line">
            <strong>{t("Sold by")}{" : "}</strong> {t(product.vendorName || "LMP")}
          </div>

          <div className="shop-divider" />

          <div className="shop-price-row">
            <strong>{formatEur(product.price)}</strong>
            <span>
              {t("Country")} <b>{t(product.location)}</b>
            </span>
          </div>
        </div>
      </div>

      <Link className="shop-btn" href={`/products/${product.id}`}>
        {t("View Product")} <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

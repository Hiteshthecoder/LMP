"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/data/products";
import { formatUsd } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";

export function ProductCard({ product }: { product: Product }) {
  const { t } = useLanguage();

  return (
    <article className="product-card">
      <Link href={`/products/${product.id}`}>
        <Image
          src={product.image}
          alt={product.name}
          width={900}
          height={600}
          sizes="(max-width: 800px) 100vw, 33vw"
        />
        <h3>{t(product.name)}</h3>
      </Link>
      <p>{t(product.description)}</p>
      <div className="product-meta">
        <span className="price">{formatUsd(product.price)}</span>
        <span>{product.rating.toFixed(1)} ★</span>
      </div>
    </article>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/data/products";
import { formatEur } from "@/lib/utils";
import { t } from "@/lib/text";

export function ProductCard({ product }: { product: Product }) {

  return (
    <article className="product-card">
      <Link href={`/products/${product.id}`}>
        <Image
          src={product.image}
          alt={product.name}
          width={900}
          height={600}
          sizes="(max-width: 800px) 100vw, (max-width: 1100px) 220px, 270px"
        />
        <h3>{t(product.name)}</h3>
      </Link>
      <p>{t(product.description)}</p>
      <div className="product-meta">
        <span className="price">{formatEur(product.price)}</span>
      </div>
    </article>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { ProductPageData } from "@/lib/product-page";
import { formatEur } from "@/lib/utils";
import { t } from "@/lib/text";

export function RelatedProductCard({ product }: { product: ProductPageData }) {

  return (
    <article className="related-product-card">
      <h3>{t(product.name)}</h3>

      <div className="related-body">
        <Image
          src={product.image}
          alt={product.name}
          width={105}
          height={88}
          sizes="105px"

        />

        <div className="related-details">
          <div>
            <strong>{t("Sold by")}</strong>{" "}
            {t(product.vendorName || "LMP")}
          </div>


          <div className="related-price">{formatEur(product.price)}</div>
        </div>

        <Link
          className="related-link"
          href={`/products/${product.id}`}
          aria-label={`${t("View Product")} ${t(product.name)}`}
        >
          →
        </Link>
      </div>
    </article>
  );
}

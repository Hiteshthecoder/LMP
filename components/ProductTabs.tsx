import type { ProductPageData } from "@/lib/product-page";
import { t } from "@/lib/text";

export function ProductTabs({ product }: { product: ProductPageData }) {
  return (
    <section className="product-tabs-wrap">
      <div className="product-tabs" role="tablist" aria-label={t("Product Information")}>
        <button className="active" type="button" role="tab" aria-selected="true">
          {t("Description")}
        </button>
      </div>

      <section className="product-tab-panel description-panel">
        <h2>{t("Product Description")}</h2>
        <p>{t(product.description)}</p>
        {product.details.length > 0 ? (
          <ul>
            {product.details.map((detail, index) => (
              <li key={`${detail}-${index}`}>{t(detail)}</li>
            ))}
          </ul>
        ) : null}
      </section>
    </section>
  );
}

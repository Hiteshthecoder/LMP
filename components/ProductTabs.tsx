"use client";

import { useState } from "react";
import type { ProductFeedbackItem } from "@/components/ProductFeedback";
import { ProductFeedback } from "@/components/ProductFeedback";
import type { ProductPageData } from "@/lib/product-page";
import { useLanguage } from "@/components/LanguageProvider";

export function ProductTabs({
  product,
  feedback,
}: {
  product: ProductPageData;
  feedback: ProductFeedbackItem[];
}) {
  const [tab, setTab] = useState<"description" | "feedback">("description");
  const { t } = useLanguage();

  return (
    <section className="product-tabs-wrap">
      <div
        className="product-tabs"
        role="tablist"
        aria-label={t("Product Information")}
      >
        <button
          className={tab === "description" ? "active" : ""}
          type="button"
          role="tab"
          aria-selected={tab === "description"}
          onClick={() => setTab("description")}
        >
          {t("Description")}
        </button>

        <button
          className={tab === "feedback" ? "active" : ""}
          type="button"
          role="tab"
          aria-selected={tab === "feedback"}
          onClick={() => setTab("feedback")}
        >
          {t("Feedback")}
        </button>
      </div>

      {tab === "description" ? (
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
      ) : (
        <ProductFeedback feedback={feedback} />
      )}
    </section>
  );
}

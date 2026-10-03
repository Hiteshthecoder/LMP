"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function CatalogResultsSkeleton() {
  const { t } = useLanguage();
  return (
    <div className="shops-grid catalog-skeleton" aria-label={t("Loading catalogue…")} aria-busy="true">
      {Array.from({ length: 12 }, (_, index) => (
        <article className="shop-card skeleton-card" key={index}>
          <div className="skeleton skeleton-name" />
          <div className="shop-body">
            <div className="skeleton skeleton-image" />
            <div className="skeleton-copy">
              <div className="skeleton skeleton-line skeleton-line-medium" />
              <div className="skeleton skeleton-line skeleton-line-short" />
              <div className="skeleton skeleton-divider" />
              <div className="skeleton-metrics">
                <div className="skeleton skeleton-metric" />
                <div className="skeleton skeleton-metric" />
              </div>
              <div className="skeleton skeleton-divider" />
              <div className="skeleton skeleton-price-row" />
            </div>
          </div>
          <div className="skeleton skeleton-button" />
        </article>
      ))}
    </div>
  );
}

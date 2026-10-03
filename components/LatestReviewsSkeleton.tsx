"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function LatestReviewsSkeleton() {
  const { t } = useLanguage();
  return (
    <div className="scroll-list reviews-skeleton" aria-label={t("Loading reviews…")} aria-busy="true">
      {Array.from({ length: 8 }, (_, index) => (
        <div className="review review-skeleton" key={index}>
          <div className="skeleton review-line review-time" />
          <div className="skeleton review-line review-name" />
          <div className="skeleton review-stars" />
          <div className="skeleton review-line review-comment" />
        </div>
      ))}
    </div>
  );
}

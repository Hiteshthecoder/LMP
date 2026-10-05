"use client";

import { t } from "@/lib/text";

type Review = {
  id: string;
  reviewer: string;
  rating: number;
  comment: string;
  createdAt: string;
};

function relativeTime(
  iso: string,
  t: (text: string) => string,
) {
  const hours = Math.max(
    1,
    Math.floor((Date.now() - new Date(iso).getTime()) / 3600000),
  );

  if (hours < 24) {
    return `${hours} ${
      hours === 1 ? t("hour") : t("hours")
    } ${t("ago")}`;
  }

  const days = Math.floor(hours / 24);

  return `${days} ${
    days === 1 ? t("day") : t("days")
  } ${t("ago")}`;
}

export function LatestReviewsList({ reviews }: { reviews: Review[] }) {

  return (
    <div className="scroll-list">
      {reviews.map((review) => (
        <div className="review" key={review.id}>
          <div>
            <b>{relativeTime(review.createdAt, t)}</b>
          </div>

          <div>
            <b>{t(review.reviewer)}</b>
          </div>

          <div
            className="stars"
            aria-label={`${review.rating} ${t("out of 5 stars")}`}
          >
            {"★".repeat(review.rating)}
          </div>

          <div>{t(review.comment)}</div>
        </div>
      ))}
    </div>
  );
}

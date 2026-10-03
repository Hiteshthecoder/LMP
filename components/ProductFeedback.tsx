"use client";

import { useLanguage } from "@/components/LanguageProvider";

export type ProductFeedbackItem = {
  id: string;
  displayName: string;
  rating: number;
  comment: string;
  sellerReply: string | null;
  sellerReplyAt: string | null;
  createdAt: string;
};

function stars(rating: number) {
  return `${"★".repeat(rating)}${"☆".repeat(Math.max(0, 5 - rating))}`;
}

export function ProductFeedback({
  feedback,
}: {
  feedback: ProductFeedbackItem[];
}) {
  const { t } = useLanguage();

  return (
    <section id="product-feedback" className="product-tab-panel feedback-panel">
      <h2>{t("LATEST PRODUCT REVIEWS")}</h2>

      {feedback.length === 0 ? (
        <div className="feedback-empty">{t("No feedback yet.")}</div>
      ) : (
        <div className="feedback-list">
          {feedback.map((item) => (
            <article className="feedback-item" key={item.id}>
              <div className="feedback-avatar">?</div>

              <div className="feedback-content">
                <div className="feedback-header">
                  <div>
                    <strong>{t(item.displayName)}</strong>{" "}
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <strong>{item.rating}/5</strong>
                </div>

                <div className="stars">{stars(item.rating)}</div>

                <p>{t(item.comment)}</p>

                {item.rating < 4 && item.sellerReply ? (
                  <div className="seller-reply">
                    <strong>{t("Store reply")}</strong>
                    <p>{t(item.sellerReply)}</p>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

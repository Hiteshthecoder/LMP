"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useLanguage();
  return (
    <main className="page-shell">
      <div className="catalog-load-more-error catalog-initial-error" role="alert">
        <span>{t("Could not load the catalogue.")}</span>
        <button className="btn" type="button" onClick={() => reset()}>
          {t("Try again")}
        </button>
      </div>
    </main>
  );
}

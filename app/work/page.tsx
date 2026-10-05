"use client";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useLanguage } from "@/components/LanguageProvider";

export default function WorkPage() {
  const { t } = useLanguage();
  return (
    <ProtectedPage titleKey="Work">
      <div className="content-card">
        <div className="content-heading">{t("Work")}</div>
        <p>{t("Work area")}</p>
      </div>
    </ProtectedPage>
  );
}

"use client";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useLanguage } from "@/components/LanguageProvider";

export default function MessagesPage() {
  const { t } = useLanguage();
  return (
    <ProtectedPage titleKey="Messages">
      <div className="content-card">
        <div className="content-heading">{t("Messages")}</div>
        <p>{t("No messages yet.")}</p>
      </div>
    </ProtectedPage>
  );
}

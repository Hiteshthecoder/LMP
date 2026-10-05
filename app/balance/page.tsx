"use client";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useLanguage } from "@/components/LanguageProvider";

export default function BalancePage() {
  const { t } = useLanguage();
  return (
    <ProtectedPage titleKey="BALANCE">
      <div className="content-card">
        <div className="balance-card">
          <div className="balance-label">{t("BALANCE")}</div>
          <div className="balance-value">$0.00</div>
          <div>{t("Your current balance is shown below.")}</div>
        </div>
      </div>
    </ProtectedPage>
  );
}

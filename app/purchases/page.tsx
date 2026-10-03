"use client";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useLanguage } from "@/components/LanguageProvider";
import { Breadcrumb } from "@/components/Breadcrumb";

function ProfileActions({ t }: { t: (key: string) => string }) {
  const links = [
    ["Home", "/"],
    ["Balance", "/balance"],
    ["My Purchases", "/purchases"],
  ];

  return (
    <aside className="profile-actions panel">
      <div className="profile-actions-title">♙ {t("PROFILE ACTIONS")}</div>
      <nav aria-label={t("PROFILE ACTIONS")}>
        {links.map(([label, href]) => (
          <a href={href} key={label}>{t(label)}</a>
        ))}
      </nav>
    </aside>
  );
}

export default function PurchasesPage() {
  const { t } = useLanguage();
  return (
    <ProtectedPage titleKey="MY PURCHASES">
      <Breadcrumb items={["My Profile", "My Purchases"]} />
      <div className="purchases-layout">
        <ProfileActions t={t} />
        <section className="purchases-main">
          <div className="purchases-title">▣ {t("MY PURCHASES")}</div>
          <div className="purchases-empty panel">
            <div>{t("NO ORDERS FOUND")}</div>
          </div>
        </section>
      </div>
    </ProtectedPage>
  );
}

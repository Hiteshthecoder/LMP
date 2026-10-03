"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { formatUsd } from "@/lib/utils";

const BTC_USD_PRICE = 84_779;

export function HomeAccountPanel() {
  const { user, loading, logout } = useAuth();
  const { t } = useLanguage();

  if (loading || !user) return null;

  const balance = Number(user.balance ?? 0);
  const bitcoin = balance / BTC_USD_PRICE;

  return (
    <>
      <section className="panel user-sidebar-card home-user-card">
        <div className="user-sidebar-identity">
          <div className="user-sidebar-avatar" aria-hidden="true">♟</div>
          <div className="user-sidebar-info">
            <div className="user-sidebar-name">{user.username || user.displayName}</div>
            <div className="user-sidebar-trust"><span>{t("Trust Level:")}</span><strong>{user.trustLevel}</strong></div>
            <div className="user-sidebar-balance"><span>👛 {t("Balance:")}</span><strong>{formatUsd(balance)}</strong></div>
            <div className="home-user-btc">≈ {bitcoin.toFixed(8)} BTC</div>
          </div>
        </div>
        <div className="user-sidebar-actions">
          <Link className="user-sidebar-action" href="/purchases"><span aria-hidden="true">◎</span>{t("My Purchases")}</Link>
          <button className="user-sidebar-action user-sidebar-logout" type="button" onClick={() => { void logout(); }}><span aria-hidden="true">↪</span>{t("Logout")}</button>
        </div>
      </section>

      <section className="panel balance-sidebar-card home-balance-card">
        <div className="balance-sidebar-label">👛 {t("BALANCE")}</div>
        <div className="balance-sidebar-value">{formatUsd(balance)}</div>
        <div className="balance-sidebar-btc">≈ {bitcoin.toFixed(8)} BTC</div>
        <Link className="balance-sidebar-button" href="/balance">₿ &nbsp; {t("Top up deposit")}</Link>
      </section>
    </>
  );
}
